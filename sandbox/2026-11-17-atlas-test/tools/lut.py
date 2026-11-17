# Measures the atlas palette from the reference: the colour of the ground as a function of
# (height, shade), read where the measured heightfield says what both are, and the colour of
# the contour lines relative to the ground under them.
#
#   python3 tools/lut.py ref/atlas-4.png data/   → data/lut.json (NH × NS RGB, row = height)
#
# The relief renderer then paints colour = LUT(height, shade): the reference's green
# valleys, cream lights, violet-grey shadows and brown heights come out of one table, so a
# new terrain gets the same colouring.
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

src, d = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float64)
H, W, _ = im.shape
meta = json.load(open(os.path.join(d, 'height.json')))
h = np.fromfile(os.path.join(d, 'height.u16'), '<u2').reshape(H, W).astype(np.float64) / 65535 * meta['hmax']
mask = np.asarray(Image.open(os.path.join(d, 'mask.png')))
terrain = mask == 0
e, az = np.radians(meta['elevation']), np.radians(meta['azimuth'])
lx, ly = np.sin(az), -np.cos(az)
gy, gx = np.gradient(ndi.gaussian_filter(h, 0.7))
shade = (-gx * lx * np.cos(e) - gy * ly * np.cos(e) + np.sin(e)) / np.sqrt(gx * gx + gy * gy + 1)
hn = np.clip(h / meta['hmax'], 0, 1)
# the colour follows the tint's elevation when there is one (data/tint.u16), else the height
tp = os.path.join(d, 'tint.u16')
if os.path.exists(tp): hn = np.fromfile(tp, '<u2').reshape(H, W) / 65535
# the ground without its lines: a per-channel median wider than a contour line
ground = np.stack([ndi.median_filter(im[..., c], size=5) for c in range(3)], -1)
NH, NS = 16, 24
S0, S1 = -0.1, 1.0
bh = np.clip((hn * NH).astype(int), 0, NH - 1)
bs = np.clip(((shade - S0) / (S1 - S0) * NS).astype(int), 0, NS - 1)
ok = terrain & ~ndi.binary_dilation(~terrain, iterations=3)
lut = np.zeros((NH, NS, 3)); cnt = np.zeros((NH, NS))
# Two readings per cell, combined: the HUE is the mean colour of the plate's pixels in the cell
# (warm lights, cool violet shadows, green or brown by the tint) and the BRIGHTNESS is matched
# by quantiles inside the height band (the shade's q-th quantile gets the plate's q-th
# brightness), so the table keeps the plate's contrast without averaging its hues away.
Gl_all = ground @ [0.3, 0.59, 0.11]
SAT = 1.0                      # the mean dilutes chroma a little: give it back
for i in range(NH):
    m = ok & (bh == i)
    if m.sum() < 200: continue
    sv = np.sort(shade[m]); lum_sorted = np.sort(Gl_all[m]); n_ = len(sv)
    for j in range(NS):
        mm = m & (bs == j)
        if mm.sum() < 20: continue
        mean = ground[mm].mean(0)
        sc = S0 + (j + 0.5) / NS * (S1 - S0)
        q = np.clip(np.searchsorted(sv, sc) / n_, 0, 1)
        lq = lum_sorted[int(min(n_ - 1, q * n_))]
        lm = mean @ [0.3, 0.59, 0.11]
        c = lm + (mean - lm) * SAT
        lut[i, j] = c * (lq / max(lm, 1)); cnt[i, j] = mm.sum()
# fill empty cells from the nearest filled ones (in the table), then smooth a little
have = cnt >= 20
for c in range(3):
    v = lut[..., c].copy(); w = have.astype(float)
    for s in (1, 2, 4, 8):
        num = ndi.gaussian_filter(v * w, s, mode='nearest'); den = ndi.gaussian_filter(w, s, mode='nearest')
        fill = (w < 0.5) & (den > 1e-4)
        v[fill] = num[fill] / den[fill]; w = np.maximum(w, fill.astype(float))
    lut[..., c] = ndi.gaussian_filter(v, 0.7, mode='nearest')
# contour lines: pixels clearly darker than the ground under them, as a ratio per channel
Ylum = im @ [0.3, 0.59, 0.11]; Gl = ground @ [0.3, 0.59, 0.11]
line = ok & (Ylum < Gl * 0.75)          # the cores of the lines, not their soft edges
ratio = np.median(im[line] / np.maximum(ground[line], 1), axis=0)
share = line.sum() / ok.sum()
print('cells filled', int(have.sum()), 'of', NH * NS, '· line ratio', ratio.round(3), '· line share %.3f' % share)
json.dump({'nh': NH, 'ns': NS, 'shade': [S0, S1], 'rgb': lut.round(1).tolist(), 'line': ratio.round(3).tolist(), 'lineShare': share}, open(os.path.join(d, 'lut.json'), 'w'))
# a preview of the table: rows = height (low at the bottom), columns = shade (dark left)
big = np.kron(lut[::-1] / 255, np.ones((16, 16, 1)))
Image.fromarray((big * 255).astype(np.uint8)).save(os.path.join(os.path.dirname(os.path.abspath(d)), 'out', 'lut.png'))
