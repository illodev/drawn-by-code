# Derives the Málaga plate's data from what tools/fetch.py downloaded (all into private/):
#   height.u16 / tint.u16 / height.json  the relief (sea held at 0) for Atlas.load
#   urban.png                            built-up land at 2 × map px (OSM residential, buildings,
#                                         commercial, industrial colours, closed)
#   vectors.json                         coast and inland water polygons, rivers with widths
#                                         (Nominatim courses + streams from the relief's
#                                         drainage), main roads by class, the city's street
#                                         grain (orientation), places
#   python3 tools/derive.py
import os, json, math
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage.morphology import skeletonize
from skimage.measure import find_contours, approximate_polygon

HERE = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(HERE, '..', 'private')
F = json.load(open(os.path.join(HERE, 'frame.json')))
Z, (W, H), (X0, Y0) = F['z'], F['size'], F['origin']
def px(lon, lat):
    s = 256 * 2 ** Z
    return (lon + 180) / 360 * s - X0, (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * s - Y0
mpp = 156543.03392 * math.cos(math.radians(F['centre'][1])) / 2 ** Z
osm = np.asarray(Image.open(os.path.join(P, 'osm13.png')).convert('RGB')).astype(np.int16)
near = lambda rgb, tol: (np.abs(osm - np.array(rgb)).max(-1) <= tol)
down = lambda m: ndi.zoom(m.astype(float), 0.5, order=1) > 0.5          # 2× mask → map px
# closing that keeps the frame's edge (scipy's erodes it away)
close = lambda m, it: ndi.binary_closing(np.pad(m, it, mode='edge'), iterations=it)[it:-it, it:-it]

# --- water -----------------------------------------------------------------------------------
water2 = near((170, 211, 223), 6)
water2 = close(water2, 2)
lab, n = ndi.label(water2)
edge = set(np.unique(np.r_[lab[-1], lab[:, -1]])) - {0}
sea2 = np.isin(lab, list(edge))
sea2 = ndi.binary_fill_holes(close(sea2, 6))
inland2 = water2 & ~sea2
lab, n = ndi.label(ndi.binary_opening(inland2, iterations=3))
sizes = ndi.sum(np.ones_like(lab), lab, range(1, n + 1))
lakes = []
for i in np.argsort(-sizes):
    if sizes[i] < 900: break                                   # ≥ ~225 map px² of water
    m = ndi.binary_fill_holes(lab == i + 1)
    c = max(find_contours(m.astype(float), 0.5), key=len)
    lakes.append((approximate_polygon(c[:, ::-1], 0.8) / 2).round(1).tolist())
sea = down(sea2)
cs = [c for c in find_contours(np.pad(sea2, 1).astype(float), 0.5) if len(c) > 200]
def outward(poly):
    out = []
    for x, y in poly:
        x = -60 if x < 1.5 else (W + 60 if x > W - 1.5 else x)
        y = -60 if y < 1.5 else (H + 60 if y > H - 1.5 else y)
        out.append([round(x, 1), round(y, 1)])
    return out
coast = [outward(((approximate_polygon(c[:, ::-1] - 1, 0.8)) / 2).tolist()) for c in cs]

# --- relief ----------------------------------------------------------------------------------
dem = np.load(os.path.join(P, 'dem.npy'))
dem = np.where(sea, 0, np.maximum(dem, 0))
ex = F.get('exaggeration', 1.8)
zz = dem / mpp * ex                                            # map px of height
hmax = float(zz.max())
(zz / hmax * 65535).astype('<u2').tofile(os.path.join(P, 'height.u16'))
t = ndi.gaussian_filter(dem, 5)
tint = np.clip(t / F.get('tintTop', 650.0), 0, 1) ** 0.8
(tint * 65535).astype('<u2').tofile(os.path.join(P, 'tint.u16'))
json.dump({'size': [W, H], 'hmax': hmax, 'azimuth': 315, 'elevation': 45, 'mpp': mpp}, open(os.path.join(P, 'height.json'), 'w'))

# --- built-up land ---------------------------------------------------------------------------
urban2 = (near((224, 223, 223), 4) | near((217, 208, 201), 6) | near((196, 182, 171), 8)
          | near((242, 218, 217), 5) | near((255, 214, 209), 5) | near((235, 219, 232), 5))
raw2 = urban2.copy()
urban2 = ndi.binary_fill_holes(close(urban2, 7))
urban2 = ndi.binary_opening(urban2, iterations=2) & ~ndi.binary_dilation(sea2, iterations=2)
lab, n = ndi.label(urban2); sizes = ndi.sum(urban2, lab, range(1, n + 1))
urban2 = np.isin(lab, 1 + np.nonzero(sizes >= 60)[0])
Image.fromarray((urban2 * 255).astype(np.uint8)).save(os.path.join(P, 'urban.png'))
# how built-up each place really is (the closed outline over-fills scattered houses in the hills)
# the closed outline's core is solid town; its fringe and the scattered houses in the hills
# are as dense as the tiles' own built-up pixels say
core = ndi.gaussian_filter(ndi.binary_erosion(urban2, iterations=9).astype(float), 3)
dens = np.clip(np.maximum(ndi.gaussian_filter(raw2.astype(float), 7) * 1.7, core), 0, 1) * urban2
Image.fromarray((dens * 255).astype(np.uint8)).save(os.path.join(P, 'urban-density.png'))

# --- fields: farmland, orchards, meadows, greenhouses (OSM colours), low and gentle ----------
farm2 = (near((238, 240, 213), 4) | near((174, 223, 163), 6) | near((205, 235, 176), 5) | near((238, 240, 213), 6))
farm2 = close(farm2, 2) & ~urban2 & ~sea2
slope = np.hypot(*np.gradient(ndi.gaussian_filter(np.kron(dem, np.ones((2, 2))), 2))) / (mpp / 2)
farm2 &= (np.kron(dem, np.ones((2, 2))) < 250) & (slope < 0.12)
farm2 = ndi.binary_opening(farm2, iterations=2)
Image.fromarray((farm2 * 255).astype(np.uint8)).save(os.path.join(P, 'fields.png'))

# --- main roads ------------------------------------------------------------------------------
def trace(mask, simplify=1.2, minlen=8):
    sk = skeletonize(mask)
    ys, xs = np.nonzero(sk); Pt = set(zip(xs.tolist(), ys.tolist()))
    nb = lambda p: [(p[0] + dx, p[1] + dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1) if (dx or dy) and (p[0] + dx, p[1] + dy) in Pt]
    deg = {p: len(nb(p)) for p in Pt}; nodes = {p for p in Pt if deg[p] != 2}; seen = set(); lines = []
    def walk(a, b):
        path = [a, b]; seen.update({(a, b), (b, a)})
        while b not in nodes:
            nx_ = [q for q in nb(b) if q != path[-2] and (b, q) not in seen]
            if not nx_: break
            q = nx_[0]; seen.update({(b, q), (q, b)}); path.append(q); b = q
        return path
    for a in nodes:
        for b in nb(a):
            if (a, b) not in seen: lines.append(walk(a, b))
    return [(approximate_polygon(np.array(l, float), simplify) / 2).round(1).tolist() for l in lines if len(l) >= minlen]
def join(lines, gap=5.0):
    """Chains pieces whose ends are within gap map px (ends turned to meet), longest first."""
    lines = [list(map(list, l)) for l in lines if len(l) > 1]
    changed = True
    while changed:
        changed = False
        ends = []
        for i, l in enumerate(lines):
            ends.append((i, 0, l[0])); ends.append((i, 1, l[-1]))
        used = set()
        for a in range(len(ends)):
            i, ea, pa = ends[a]
            if i in used: continue
            best = None
            for b in range(len(ends)):
                j, eb, pb = ends[b]
                if j == i or j in used: continue
                d = math.hypot(pa[0] - pb[0], pa[1] - pb[1])
                if d < gap and (best is None or d < best[0]): best = (d, j, eb)
            if best:
                _, j, eb = best
                li = lines[i] if ea == 1 else lines[i][::-1]
                lj = lines[j] if eb == 0 else lines[j][::-1]
                lines[i] = li + lj; lines[j] = []; used.update({i, j}); changed = True
        lines = [l for l in lines if l]
    return lines
roads = {}
for name, rgb, tol in [('motorway', (232, 146, 162), 18), ('trunk', (249, 178, 156), 12), ('primary', (252, 214, 164), 10), ('secondary', (247, 250, 191), 8)]:
    m = near(rgb, tol) & ~sea2
    m = close(m, 2)
    lab, n = ndi.label(m); sizes = ndi.sum(m, lab, range(1, n + 1))
    m = np.isin(lab, 1 + np.nonzero(sizes >= 40)[0])
    roads[name] = join(trace(m, 1.2, 3), 9.0)

# --- the city's grain: the direction of its streets, from the white streets in the tiles ------
street2 = near((255, 255, 255), 3) & urban2
g = street2.astype(float)
gy, gx = np.gradient(ndi.gaussian_filter(g, 1.0))
Jxx, Jyy, Jxy = [ndi.gaussian_filter(v, 24) for v in (gx * gx, gy * gy, gx * gy)]
theta = 0.5 * np.arctan2(2 * Jxy, Jxx - Jyy)                    # the dominant gradient direction
grain = ndi.zoom(theta, 0.125, order=1)                         # coarse field (16 × 2 px cells)

# --- rivers ----------------------------------------------------------------------------------
rivers = []
for q in F['rivers']:
    d = json.load(open(os.path.join(P, 'nominatim-' + q.replace(' ', '_') + '.json')))[0]['geojson']
    parts = d['coordinates'] if d['type'] == 'MultiLineString' else [d['coordinates']]
    for part in parts:
        pts = [px(lo, la) for lo, la in part]
        pts = [p for p in pts if -20 < p[0] < W + 20 and -20 < p[1] < H + 20]
        if len(pts) > 1: rivers.append({'name': q, 'pts': np.round(pts, 1).tolist(), 'w': [3.2 if 'Guadalhorce' in q else 2.2] * len(pts)})
# streams: the relief's own drainage (D8 on the filled DEM), where it collects enough
from heapq import heappush, heappop
z = dem + 1e-3 * np.arange(W * H).reshape(H, W) % 1e-3
base = sea | (np.pad(np.zeros((H - 2, W - 2), bool), 1, constant_values=True))
filled = z.copy(); seen = base.copy(); hp = []
for y, x in zip(*np.nonzero(base)): heappush(hp, (filled[y, x], y, x))
rec = -np.ones((H, W, 2), int); order = []
while hp:
    v, y, x = heappop(hp); order.append((y, x))
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            yy, xx = y + dy, x + dx
            if (dy or dx) and 0 <= yy < H and 0 <= xx < W and not seen[yy, xx]:
                seen[yy, xx] = True; filled[yy, xx] = max(filled[yy, xx], v + 1e-4); rec[yy, xx] = (y, x)
                heappush(hp, (filled[yy, xx], yy, xx))
A = np.ones((H, W))
for y, x in reversed(order):
    ry, rx = rec[y, x]
    if ry >= 0: A[ry, rx] += A[y, x]
stream = (A > F.get('streamArea', 400)) & ~sea & ~down(urban2) & ~ndi.binary_dilation(down(inland2), iterations=1)
for l in join(trace(np.kron(stream, np.ones((2, 2), bool)), 1.5, 3), 2.5):
    w = [float(min(2.0, 0.35 + 0.18 * math.sqrt(A[min(H - 1, int(p[1])), min(W - 1, int(p[0]))] / 400))) for p in l]
    rivers.append({'name': '', 'pts': l, 'w': w})

# --- places ----------------------------------------------------------------------------------
places = {k: [round(c, 1) for c in px(*v)] for k, v in F.get('places', {}).items()}
json.dump({'size': [W, H], 'mpp': mpp, 'coast': coast, 'lakes': lakes, 'rivers': rivers, 'roads': roads,
           'grain': {'w': grain.shape[1], 'h': grain.shape[0], 'cell': 16, 'theta': np.round(grain, 3).ravel().tolist()},
           'places': places}, open(os.path.join(P, 'vectors.json'), 'w'))
print('mpp %.1f' % mpp, '· hmax %.1f' % hmax, '· coast', len(coast), '· lakes', len(lakes), '· rivers', len(rivers),
      '· roads', {k: len(v) for k, v in roads.items()}, '· urban %.1f %%' % (urban2.mean() * 100), '· fields %.1f %%' % (farm2.mean() * 100))
# a look at what was read
pv = (osm * 0.35 + 165).clip(0, 255).astype(np.uint8)
pv[urban2] = [120, 110, 100]; pv[sea2] = [90, 160, 200]; pv[inland2] = [0, 90, 255]
im = Image.fromarray(pv).resize((W, H)); from PIL import ImageDraw; dr = ImageDraw.Draw(im)
for r in rivers: dr.line([tuple(p) for p in r['pts']], fill=(0, 60, 230), width=1)
for k, c in [('motorway', (220, 0, 80)), ('trunk', (240, 120, 0)), ('primary', (200, 150, 0)), ('secondary', (120, 120, 0))]:
    for l in roads[k]: dr.line([tuple(p) for p in l], fill=c, width=2)
for k, (x, y) in places.items(): dr.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(255, 0, 0)); dr.text((x + 4, y - 6), k, fill=(0, 0, 0))
im.save(os.path.join(P, 'derived.png'))
