# A quick stand-in for the relief shader: colour = LUT(height, shade) from the measured
# heightfield, scored against the reference the way the detail gate scores colour (a 14 px
# box blur at 1280, mean difference per tile of a 6×6 grid), on terrain only.
#
#   python3 tools/simulate.py ref/atlas-4.png data/   → out/simulate.png, the scores
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

src, d = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float64)
H, W, _ = im.shape
meta = json.load(open(os.path.join(d, 'height.json')))
lut = json.load(open(os.path.join(d, 'lut.json')))
h = np.fromfile(os.path.join(d, 'height.u16'), '<u2').reshape(H, W).astype(np.float64) / 65535 * meta['hmax']
mask = np.asarray(Image.open(os.path.join(d, 'mask.png')))
e, az = np.radians(meta['elevation']), np.radians(meta['azimuth'])
lx, ly = np.sin(az), -np.cos(az)
gy, gx = np.gradient(h)
shade = (-gx * lx * np.cos(e) - gy * ly * np.cos(e) + np.sin(e)) / np.sqrt(gx * gx + gy * gy + 1)
T = np.array(lut['rgb'])            # nh × ns × 3
nh, ns = lut['nh'], lut['ns']; s0, s1 = lut['shade']
u = np.clip((shade - s0) / (s1 - s0) * ns - 0.5, 0, ns - 1); tn = np.fromfile(os.path.join(d, 'tint.u16'), '<u2').reshape(H, W) / 65535 if os.path.exists(os.path.join(d, 'tint.u16')) else h / meta['hmax']
v = np.clip(tn * nh - 0.5, 0, nh - 1)
iu, iv = np.floor(u).astype(int), np.floor(v).astype(int); fu, fv = u - iu, v - iv
iu1, iv1 = np.minimum(iu + 1, ns - 1), np.minimum(iv + 1, nh - 1)
c = (T[iv, iu] * ((1 - fu) * (1 - fv))[..., None] + T[iv, iu1] * (fu * (1 - fv))[..., None]
     + T[iv1, iu] * ((1 - fu) * fv)[..., None] + T[iv1, iu1] * (fu * fv)[..., None])
ground = np.stack([ndi.median_filter(im[..., k], size=5) for k in range(3)], -1)
terr = mask == 0
r = 14
box = lambda a: np.stack([ndi.uniform_filter(a[..., k], 2 * r + 1) for k in range(3)], -1)
diff = np.abs(box(c) - box(im)).mean(-1)
tiles = []
for gy_ in range(6):
    for gx_ in range(6):
        sl = (slice(gy_ * H // 6, (gy_ + 1) * H // 6), slice(gx_ * W // 6, (gx_ + 1) * W // 6))
        if terr[sl].mean() > 0.6: tiles.append(diff[sl].mean())
tiles = np.sort(tiles)
print('terrain tiles', len(tiles), '· colour median %.1f · p90 %.1f' % (np.median(tiles), tiles[int(0.9 * (len(tiles) - 1))]))
out = np.concatenate([im, np.where(terr[..., None], c, im)], 0)
Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(os.path.join(os.path.dirname(os.path.abspath(d)), 'out', 'simulate.png'))
