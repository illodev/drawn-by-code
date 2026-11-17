# Measures the reference's line work into vector data for the matched shot: the rivers
# (centre lines with their widths), the lake's shore, the canal's dashes, the city, and the
# colours of every ink. Our own generated reference, read into data (as pier-pressure read its
# generated model sheets): the matched shot draws these with the atlas kit's own drawers.
#
#   python3 tools/vectors.py ref/atlas-4.png data/   → data/vectors.json, out/vectors.png
import sys, os, json
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from skimage.morphology import skeletonize
from skimage.measure import find_contours, approximate_polygon

src, d = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float64)
H, W, _ = im.shape
R, G, B = im[..., 0], im[..., 1], im[..., 2]
Y = 0.3 * R + 0.59 * G + 0.11 * B
L = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'layout.json')))
fx0, fy0, fx1, fy1 = L['map']
inside = np.zeros((H, W), bool); inside[fy0 + 2:fy1 - 2, fx0 + 2:fx1 - 2] = True
hexs = lambda c: '#%02x%02x%02x' % tuple(int(round(v)) for v in c)

# --- the lake -------------------------------------------------------------------------------
blue = (B > R + 15) & (B > G - 4) & inside
pale = ndi.binary_opening(blue & (Y > 180), iterations=3)
lab, n = ndi.label(pale)
core = lab == 1 + int(np.argmax(ndi.sum(pale, lab, range(1, n + 1))))
band = blue & (ndi.distance_transform_edt(~core) < 14)
lake = ndi.binary_fill_holes(ndi.binary_closing(core | band, iterations=3))
lake = ndi.binary_opening(lake, iterations=2)
cs = max(find_contours(lake.astype(float), 0.5), key=len)
shore = approximate_polygon(cs[:, ::-1], 0.6)
# the waterlines: blue runs met walking inward from the shore, as distances
dist_in = ndi.distance_transform_edt(lake)
wl = blue & lake & (Y < 175)
hist = np.bincount(np.clip(dist_in[wl].astype(int), 0, 30), minlength=31)[:16]

# --- the rivers -----------------------------------------------------------------------------
riv = blue & ~ndi.binary_dilation(lake, iterations=4)
riv = ndi.binary_closing(riv, iterations=1)
lab, n = ndi.label(riv, structure=np.ones((3, 3)))
sz = ndi.sum(riv, lab, range(1, n + 1))
riv = np.isin(lab, 1 + np.nonzero(sz >= 25)[0])
dt = ndi.distance_transform_edt(riv)
sk = skeletonize(riv)
# walk the skeleton into polylines between ends and junctions
ys, xs = np.nonzero(sk)
P = set(zip(xs.tolist(), ys.tolist()))
nb = lambda p: [(p[0] + dx, p[1] + dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1) if (dx or dy) and (p[0] + dx, p[1] + dy) in P]
deg = {p: len(nb(p)) for p in P}
nodes = {p for p in P if deg[p] != 2}
seen = set(); lines = []
def walk(a, b):
    path = [a, b]; seen.add((a, b)); seen.add((b, a))
    while b not in nodes:
        nxt = [q for q in nb(b) if q != path[-2] and (b, q) not in seen]
        if not nxt: break
        q = nxt[0]; seen.add((b, q)); seen.add((q, b)); path.append(q); b = q
    return path
for a in nodes:
    for b in nb(a):
        if (a, b) not in seen: lines.append(walk(a, b))
for p in P:                                     # loops with no node
    if deg[p] == 2 and not any((p, q) in seen for q in nb(p)):
        lines.append(walk(p, nb(p)[0]))
rivers = []
for ln in lines:
    if len(ln) < 6: continue
    a = np.array(ln, float)
    s = approximate_polygon(a, 0.7)
    w = [float(2 * dt[int(y), int(x)]) for x, y in s]
    rivers.append({'pts': s.round(1).tolist(), 'w': np.round(w, 2).tolist()})

# --- the canal ------------------------------------------------------------------------------
red = (R > G + 50) & (R > B + 50) & inside
lab, n = ndi.label(red)
dashes = []
for i in range(1, n + 1):
    yy, xx = np.nonzero(lab == i)
    if len(xx) < 6: continue
    c = np.array([xx.mean(), yy.mean()])
    u, s_, vt = np.linalg.svd(np.c_[xx - c[0], yy - c[1]], full_matrices=False)
    ax = vt[0]; proj = (xx - c[0]) * ax[0] + (yy - c[1]) * ax[1]
    dashes.append({'c': c.round(1).tolist(), 'len': float(proj.max() - proj.min() + 1), 'w': float(len(xx) / (proj.max() - proj.min() + 1))})
# order the dashes from the dam (upper left) to the city: nearest neighbour chain
left = min(range(len(dashes)), key=lambda i: dashes[i]['c'][0] + dashes[i]['c'][1])
order = [left]; rest = set(range(len(dashes))) - {left}
while rest:
    c = np.array(dashes[order[-1]]['c'])
    j = min(rest, key=lambda i: np.hypot(*(np.array(dashes[i]['c']) - c)))
    order.append(j); rest.remove(j)
dashes = [dashes[i] for i in order]
# a stray red speck far from the chain is not a dash
keep = [x for i, x in enumerate(dashes) if min(np.hypot(*(np.array(x['c']) - np.array(y['c']))) for j, y in enumerate(dashes) if j != i) < 30]
dashes = keep

# --- the city and the inks --------------------------------------------------------------------
cx, cy, cr = L['city']
yy, xx = np.mgrid[0:H, 0:W]
near = (xx - cx) ** 2 + (yy - cy) ** 2 < (cr * 1.3) ** 2
dark = near & (Y < 120) & ~blue & ~red
ys, xs = np.nonzero(dark)
med = lambda m: hexs(np.median(im[m], axis=0)) if m.any() else None
river_px = sk & (dt >= 1.2)
inks = {
    'lake': med(core & (dist_in > 14)),
    'waterline': med(wl),
    'river': med(river_px),
    'red': med(red & (ndi.distance_transform_edt(red) >= 1.5)),
    'block': med(dark),
    'margin': med(~inside & (Y > 200) & ((xx < 6) | (xx > W - 6))),
}
# the villages: small dark buildings outside the town, each kept as a centre and a size
mx_ = np.maximum(np.maximum(R, G), B); mn_ = np.minimum(np.minimum(R, G), B)
sat = (mx_ - mn_) / np.maximum(mx_, 1)
hn_ = np.fromfile(os.path.join(d, 'height.u16'), '<u2').reshape(H, W).astype(float) / 65535
low = ndi.gaussian_filter(hn_, 4) < 0.32            # villages stand on the plain and valley floors
bld = (Y < 145) & (sat < 0.2) & inside & ~near & low & ~ndi.binary_dilation(blue | red | lake, iterations=2)
for (x0, y0, x1, y1) in L['boxes']: bld[y0:y1, x0:x1] = False
lab, n = ndi.label(bld)
houses = []
for sl, i in zip(ndi.find_objects(lab), range(1, n + 1)):
    m = lab[sl] == i; a = int(m.sum())
    if 3 <= a <= 40:
        yy_, xx_ = np.nonzero(m)
        houses.append([round(float(xx_.mean() + sl[1].start), 1), round(float(yy_.mean() + sl[0].start), 1), round(float(np.sqrt(a)), 2)])
out = {'size': [W, H], 'shore': shore.round(1).tolist(), 'waterlineHist': hist.tolist(),
       'rivers': rivers, 'dashes': dashes,
       'city': {'c': [float(xs.mean()), float(ys.mean())], 'r90': float(np.percentile(np.hypot(xs - xs.mean(), ys - ys.mean()), 90))},
       'inks': inks, 'houses': houses}
json.dump(out, open(os.path.join(d, 'vectors.json'), 'w'))
print('rivers', len(rivers), 'points', sum(len(r['pts']) for r in rivers), '· dashes', len(dashes),
      '· dash len %.1f w %.1f' % (np.median([x['len'] for x in dashes]), np.median([x['w'] for x in dashes])))
print('waterline distances (px from shore → count)', hist.tolist())
print('houses', len(houses)); print('city', out['city'], '\ninks', inks)
# a drawing of what was read, over the reference dimmed
pv = Image.fromarray((im * 0.35 + 160).clip(0, 255).astype(np.uint8)); dr = ImageDraw.Draw(pv)
dr.line([tuple(p) for p in shore] + [tuple(shore[0])], fill=(0, 90, 200), width=2)
for r in rivers: dr.line([tuple(p) for p in r['pts']], fill=(0, 60, 255), width=2)
for x in dashes: dr.ellipse([x['c'][0] - 3, x['c'][1] - 3, x['c'][0] + 3, x['c'][1] + 3], fill=(220, 0, 0))
pv.save(os.path.join(os.path.dirname(os.path.abspath(d)), 'out', 'vectors.png'))
