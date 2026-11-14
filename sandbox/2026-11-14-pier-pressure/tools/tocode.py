"""Turn a measured character sheet into a drawing written as code.

    python3 -I tools/tocode.py ref/kit-sheet.webp cast/kit-drawn.js kit

Where tools/trace.py copies the sheet as filled polygons (ink included), this writes the
drawing the way a person would code it: every flat colour as a shape of a few control points
([x, y] smooth, [x, y, 1] a corner), every line as a stroke along its centre with its own
width, the solid blacks (pupils) as shapes, all grouped by body part. The engine draws it with
its own line (cast/drawn.js), so the parts can be moved, restyled and recoloured.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage import measure, morphology
import trace as TR

UP = TR.UP
# Per character and pose: the box of the sheet, and the body parts as polygons (sheet pixels),
# tried in order; a shape belongs to the first part that holds its centre, else to `rest`.
SHEETS = {
    'kit': {
        'jump': {
            'box': (540, 0, 740, 720), 'rest': 'torso',
            'parts': [
                ('head', [(560, 0), (1030, 0), (1030, 205), (950, 235), (930, 300), (770, 305), (700, 290), (700, 250), (600, 240), (560, 200)]),
                ('armL', [(540, 222), (700, 250), (740, 350), (540, 392)]),
                ('armR', [(950, 240), (1035, 205), (1040, 60), (1280, 60), (1280, 262), (1010, 285)]),
                ('bootNear', [(1000, 300), (1060, 276), (1280, 262), (1280, 620), (1010, 620), (990, 450), (975, 380)]),
                ('bootFar', [(780, 455), (920, 455), (920, 620), (780, 620)]),
                ('shorts', [(660, 395), (1010, 395), (1010, 540), (660, 540)]),
            ],
            'order': ['armR', 'bootFar', 'shorts', 'bootNear', 'torso', 'head', 'armL'],
        },
        'stand': {
            'box': (60, 0, 470, 720), 'rest': 'torso',
            'parts': [
                ('head', [(100, 0), (540, 0), (540, 160), (440, 215), (430, 250), (250, 255), (215, 235), (215, 200), (110, 170)]),
                ('armL', [(140, 195), (215, 200), (250, 300), (240, 345), (140, 330)]),
                ('armR', [(385, 300), (440, 290), (440, 345), (390, 420), (300, 420), (300, 350), (345, 345)]),
                ('bootL', [(95, 505), (245, 505), (245, 612), (95, 600)]),
                ('board', [(60, 585), (335, 600), (335, 720), (60, 720)]),
                ('bootR', [(340, 540), (495, 540), (495, 720), (340, 720)]),
                ('shorts', [(150, 392), (430, 392), (430, 545), (150, 545)]),
            ],
            'order': ['board', 'bootR', 'bootL', 'shorts', 'armR', 'torso', 'head', 'armL'],
        },
    },
}


def inside(pt, poly):
    x, y = pt
    c = False
    for i in range(len(poly)):
        (x0, y0), (x1, y1) = poly[i], poly[i - 1]
        if (y0 > y) != (y1 > y) and x < (x1 - x0) * (y - y0) / (y1 - y0) + x0:
            c = not c
    return c


def spec(pts, closed, corner=52):
    """Control points from a traced polyline (row, col at UP): few points, corners flagged."""
    n = len(pts)
    out = []
    for i, (r, c) in enumerate(pts):
        flag = 0
        if closed or 0 < i < n - 1:
            a, b = pts[i - 1], pts[(i + 1) % n]
            v0 = (r - a[0], c - a[1]); v1 = (b[0] - r, b[1] - c)
            ang = abs(math.degrees(math.atan2(v0[0] * v1[1] - v0[1] * v1[0], v0[0] * v1[0] + v0[1] * v1[1])))
            flag = 1 if ang > corner else 0
        p = [round(float(c) / UP, 1), round(float(r) / UP, 1)]
        out.append(p + [1] if flag else p)
    return out


def outline(mask, tol):
    """The outer contour of a component as control points, and its area."""
    f = ndi.gaussian_filter(np.pad(mask, 3).astype(np.float32), 1.2)
    best = None
    for c in measure.find_contours(f, 0.5):
        c = c - 3
        a = 0.5 * abs(np.dot(c[:-1, 1], c[1:, 0]) - np.dot(c[1:, 1], c[:-1, 0]))
        if best is None or a > best[0]:
            best = (a, c)
    if best is None:
        return None, 0
    p = measure.approximate_polygon(best[1], tol)[:-1]
    return (spec([tuple(q) for q in p], True) if len(p) >= 3 else None), best[0] / (UP * UP)


def strokes(thin, dt):
    """Centre lines of the thin ink: skeleton → paths between its nodes → control points + width."""
    sk = morphology.skeletonize(thin)
    pts = set(map(tuple, np.argwhere(sk)))
    nb = lambda p: [(p[0] + dr, p[1] + dc) for dr in (-1, 0, 1) for dc in (-1, 0, 1) if (dr or dc) and (p[0] + dr, p[1] + dc) in pts]
    deg = {p: len(nb(p)) for p in pts}
    nodes = {p for p in pts if deg[p] != 2}
    seen = set()
    paths = []

    def walk(a, b):
        path = [a, b]
        seen.add((a, b)); seen.add((b, a))
        while path[-1] not in nodes:
            nxt = [q for q in nb(path[-1]) if q != path[-2] and (path[-1], q) not in seen]
            if not nxt:
                break
            # prefer the 4-neighbour, so a diagonal step does not skip a pixel
            nxt.sort(key=lambda q: abs(q[0] - path[-1][0]) + abs(q[1] - path[-1][1]))
            seen.add((path[-1], nxt[0])); seen.add((nxt[0], path[-1]))
            path.append(nxt[0])
            if path[-1] == path[0]:
                break
        return path

    for a in nodes:
        for b in nb(a):
            if (a, b) not in seen:
                paths.append(walk(a, b))
    for a in pts:  # loops with no node
        if a not in nodes and all((a, b) not in seen for b in nb(a)):
            n0 = nb(a)
            if n0:
                paths.append(walk(a, n0[0]))
    out = []
    for path in paths:
        L = sum(math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]) for i in range(1, len(path)))
        w = float(np.mean([dt[p] for p in path])) * 2 / UP
        spur = (deg.get(path[0], 0) == 1) != (deg.get(path[-1], 0) == 1)
        if L < 2.2 * UP or (spur and L < 1.6 * w * UP):
            continue
        closed = path[0] == path[-1] and len(path) > 8
        arr = np.array(path, dtype=float)
        if len(arr) > 9:
            # the skeleton steps pixel by pixel: average the staircase away, keeping the ends
            k = 7
            pad = np.concatenate([arr[-k:], arr, arr[:k]]) if closed else np.concatenate([np.repeat(arr[:1], k, 0), arr, np.repeat(arr[-1:], k, 0)])
            ker = np.ones(k) / k
            sm = np.stack([np.convolve(pad[:, 0], ker, 'same'), np.convolve(pad[:, 1], ker, 'same')], 1)[k:-k]
            if not closed:
                sm[0], sm[-1] = arr[0], arr[-1]
            arr = sm
        p = measure.approximate_polygon(arr, 0.4 * UP)
        if closed:
            p = p[:-1]
        if len(p) < 2:
            continue
        out.append((spec([tuple(q) for q in p], closed), round(w + 0.25, 1), closed, tuple(arr.mean(0))))
    return out


def pose(im, cfg):
    box = cfg['box']
    names, under, inkm = TR.measure_pose(im, box)
    part_of = lambda r, c: next((n for n, poly in cfg['parts'] if inside((box[0] + c / UP, box[1] + r / UP), poly)), cfg['rest'])
    items = {n: {'fills': [], 'lines': []} for n in cfg['order']}
    # flat colours, one shape per connected piece
    for k, nme in enumerate(names):
        if nme == 'ink':
            continue
        lb, n = ndi.label(under == k)
        for i, sl in enumerate(ndi.find_objects(lb)):
            m = lb[sl] == i + 1
            if m.sum() < 14 * UP * UP:
                continue
            sp, area = outline(m, 0.6 * UP)
            if not sp:
                continue
            sp = [[round(p[0] + sl[1].start / UP, 1), round(p[1] + sl[0].start / UP, 1)] + p[2:] for p in sp]
            r, c = ndi.center_of_mass(m)
            items[part_of(r + sl[0].start, c + sl[1].start)]['fills'].append((area, TR.PAINT[nme], sp))
    # ink: the solid blacks as shapes, the rest as strokes along their centre
    dt = ndi.distance_transform_edt(inkm)
    hw = float(np.median(dt[morphology.skeletonize(inkm)]))
    solid = ndi.binary_opening(inkm, iterations=max(2, int(round(1.7 * hw))))
    lb, n = ndi.label(solid)
    keep = np.zeros_like(solid)
    for i, sl in enumerate(ndi.find_objects(lb)):
        m = lb[sl] == i + 1
        if m.sum() > 9 * hw * hw:
            keep[sl] |= m
    solid = ndi.binary_dilation(keep, iterations=2) & inkm
    lb, n = ndi.label(solid)
    for i, sl in enumerate(ndi.find_objects(lb)):
        m = lb[sl] == i + 1
        sp, area = outline(m, 0.45 * UP)
        if not sp:
            continue
        sp = [[round(p[0] + sl[1].start / UP, 1), round(p[1] + sl[0].start / UP, 1)] + p[2:] for p in sp]
        r, c = ndi.center_of_mass(m)
        items[part_of(r + sl[0].start, c + sl[1].start)]['fills'].append((0, TR.PAINT['ink'], sp))
    for sp, w, closed, (r, c) in strokes(inkm & ~ndi.binary_erosion(solid, iterations=2), dt):
        items[part_of(r, c)]['lines'].append((sp, w, closed))
    return box, items, round(hw * 2 / UP, 2)


def fmt(sp):
    return '[' + ', '.join('[' + ', '.join(f'{v:g}' for v in p) + ']' for p in sp) + ']'


def main():
    src, dst, who = sys.argv[1:4]
    im = Image.open(src).convert('RGB')
    out = [f'// {who}, drawn in code. Written by tools/tocode.py from the approved sheet {src}: each flat',
           '// colour is a shape of control points ([x, y] smooth, [x, y, 1] a corner), each line a stroke',
           '// along its centre with its width, grouped by body part. Coordinates are the sheet\'s pixels',
           '// inside the pose\'s box. Edit a point, a colour or a width here like any drawing in the repo;',
           '// run the tool again only to start over from the sheet.', '']
    for name, cfg in SHEETS[who].items():
        box, items, lw = pose(im, cfg)
        nf = sum(len(v['fills']) for v in items.values()); nl = sum(len(v['lines']) for v in items.values())
        npt = sum(len(f[2]) for v in items.values() for f in v['fills']) + sum(len(l[0]) for v in items.values() for l in v['lines'])
        print(name, nf, 'shapes', nl, 'strokes', npt, 'control points; line', lw)
        out.append(f"Drawn.def('{who}', '{name}', {{ w: {box[2]}, h: {box[3]}, line: {lw} }}, (part, S, L) => {{")
        for pn in cfg['order']:
            v = items[pn]
            if not v['fills'] and not v['lines']:
                continue
            out.append(f"    part('{pn}');")
            # the bigger shape first: what lies inside another is drawn on top of it
            for area, col, sp in sorted(v['fills'], key=lambda f: -f[0]):
                out.append(f"    S('{col}', {fmt(sp)});")
            for sp, w, closed in v['lines']:
                out.append(f"    L({fmt(sp)}, {w:g}{', 1' if closed else ''});")
        out.append('});')
        out.append('')
    open(dst, 'w').write('\n'.join(out))
    print(dst, os.path.getsize(dst) // 1024, 'KB')


main()
