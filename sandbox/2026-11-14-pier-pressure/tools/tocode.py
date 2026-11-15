"""Turn an approved character sheet into a drawing written as code.

    python3 -I tools/tocode.py kit          (or: all)

Reads ref/<who>-sheet.png, measures it (tools/measure.py) and writes cast/<who>-drawn.js: every
flat colour as a shape of a few control points ([x, y] smooth, [x, y, 1] a corner), every line
as a stroke along its centre with its own width (and colour, when it is not ink), the solid blacks (pupils) as shapes, grouped
by body part. The engine draws it with its own line (cast/drawn.js), so the parts can be
moved, restyled and recoloured.
"""
import sys, os, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage import measure, morphology
import measure as M

UP = M.UP
# HOLES: page seen through a figure (between an arm and the body, inside a strap), as the centres
# of the sheet's enclosed pure-white regions; found by listing those regions and looking at them
# (a white eye or a paper cone is such a region too, and is not listed here).
HOLES = {
    'kit': [(349, 343)],
    'milo': [(360, 340)],
    'pip': [(230, 487), (956, 485), (314, 291), (408, 366), (264, 347)],
    'dot': [(181, 302), (384, 299)],
    'hoagie': [(999, 112), (992, 175), (705, 307), (962, 240), (178, 263), (927, 278)],
    'captain': [(277, 447), (760, 457), (1003, 289)],
}
# Per character: its poses, left to right on the sheet. A pose may give its box (else it is
# found) and its body parts as polygons in sheet pixels, tried in order: a shape belongs to the
# first part that holds its centre, else to `rest`. Without parts a pose is one part, 'body'.
CAST = {
    'kit': {
        # the upper body is cut from the legs (it comes down over them when she crouches), and the
        # two bunches of hair from the head (they lag behind it)
        'stand': {
            'box': (60, 0, 470, 720), 'rest': 'legs',
            'parts': [
                ('bunchL', [(100, 0), (238, 0), (250, 60), (225, 86), (215, 138), (120, 142)]),
                ('bunchR', [(385, 40), (405, 0), (540, 0), (540, 170), (470, 170), (440, 110), (405, 95), (388, 85)]),
                # the forearm that comes out of the sleeve, not the sleeve's opening behind it
                ('armL', [(140, 195), (213, 200), (213, 296), (236, 314), (236, 324), (216, 336), (140, 334)]),
                ('armR', [(385, 300), (440, 290), (440, 345), (390, 420), (300, 420), (300, 350), (345, 345)]),
                ('legs', [(176, 474), (218, 474), (222, 540), (176, 540)]),
                ('legs', [(334, 528), (396, 528), (398, 596), (340, 596)]),
                # the boot keeps its own sole line (it lies on the board's deck); the board's wheels
                # and trucks are apart from its deck, which the boot hides in part
                ('bootL', [(95, 505), (245, 505), (248, 620), (160, 613), (95, 604)]),
                ('wheels', [(60, 616), (84, 620), (120, 635), (180, 649), (240, 662), (265, 659), (300, 652), (335, 644), (335, 720), (60, 720)]),
                ('board', [(60, 585), (335, 600), (335, 720), (60, 720)]),
                ('bootR', [(340, 540), (495, 540), (495, 720), (340, 720)]),
                ('torso', [(292, 228), (345, 228), (360, 250), (432, 300), (442, 360), (392, 442), (300, 432), (212, 396), (198, 340), (205, 290), (250, 262)]),
                ('shorts', [(150, 392), (430, 392), (430, 545), (150, 545)]),
                ('head', [(100, 0), (540, 0), (540, 160), (440, 215), (430, 250), (250, 255), (215, 235), (215, 200), (110, 170)]),
            ],
            'order': ['wheels', 'board', 'legs', 'bootR', 'bootL', 'shorts', 'torso', 'armR', 'bunchL', 'bunchR', 'head', 'armL'],
        },
        'jump': {
            'box': (540, 0, 740, 720), 'rest': 'torso',
            'parts': [
                ('bunchL', [(560, 80), (700, 80), (736, 120), (736, 166), (700, 176), (640, 244), (560, 244)]),
                ('bunchR', [(850, 96), (860, 0), (1030, 0), (1030, 130), (960, 130), (916, 106), (886, 102)]),
                ('head', [(560, 0), (1030, 0), (1030, 205), (950, 235), (930, 300), (770, 305), (700, 290), (700, 250), (600, 240), (560, 200)]),
                ('armL', [(540, 222), (700, 250), (740, 350), (540, 392)]),
                ('armR', [(950, 240), (1035, 205), (1040, 60), (1280, 60), (1280, 262), (1010, 285)]),
                ('bootNear', [(1000, 300), (1060, 276), (1280, 262), (1280, 620), (1010, 620), (990, 450), (975, 380)]),
                ('bootFar', [(780, 455), (920, 455), (920, 620), (780, 620)]),
                ('shorts', [(660, 395), (1010, 395), (1010, 540), (660, 540)]),
            ],
            'order': ['armR', 'bootFar', 'shorts', 'bootNear', 'torso', 'bunchL', 'bunchR', 'head', 'armL'],
        },
    },
    'hoagie': {'film': {}, 'jump': {}},
    'milo': {'stand': {}, 'fall': {}},
    'pip': {'stand': {}, 'ride': {}},
    'dot': {'stand': {}, 'serve': {}},
    'captain': {'perch': {}, 'fly': {}},
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


def strokes(thin, dt, img, strong):
    """Centre lines of the thin ink: skeleton → paths between its nodes → control points, width,
    and the line's own colour when it is not ink (a seam drawn in brown, a thin navy stripe)."""
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
        # the line's colour: the darkest of what lies under its centre. Ink is neutral; a line with
        # a colour of its own (the dark red of a pair of glasses, a brown seam, a navy stripe) keeps it
        px = np.array([img[q] for q in path]); lm = px @ np.array([0.299, 0.587, 0.114])
        dk = px[lm <= np.percentile(lm, 30)].mean(0)
        col = M.hexof(dk) if (dk.max() - dk.min() > 45 and M.lum(dk) > 38) else None
        out.append((spec([tuple(q) for q in p], closed), round(w + 0.25, 1), closed, tuple(np.array(path).mean(0)), col))
    return out


def pose(im, cfg, box, pal, holes):
    names, paint, under, inkm, a, strong = M.measure_pose(im, box, pal, holes)
    parts = cfg.get('parts', [])
    rest = cfg.get('rest', 'body')
    order = cfg.get('order', ['body'])
    part_of = lambda r, c: next((n for n, poly in parts if inside((box[0] + c / UP, box[1] + r / UP), poly)), rest)
    items = {n: {'fills': [], 'lines': []} for n in order}
    # flat colours, one shape per connected piece
    for k, nme in enumerate(names):
        if nme == 'ink':
            continue
        lb, n = ndi.label(under == k)
        for i, sl in enumerate(ndi.find_objects(lb)):
            m = lb[sl] == i + 1
            if m.sum() < 5 * UP * UP:
                continue
            sp, area = outline(m, (0.32 if m.sum() < 90 * UP * UP else 0.6) * UP)
            if not sp:
                continue
            sp = [[round(p[0] + sl[1].start / UP, 1), round(p[1] + sl[0].start / UP, 1)] + p[2:] for p in sp]
            r, c = ndi.center_of_mass(m)
            items[part_of(r + sl[0].start, c + sl[1].start)]['fills'].append((area, paint[k], sp))
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
        items[part_of(r + sl[0].start, c + sl[1].start)]['fills'].append((0, M.INK_PAINT, sp))
    for sp, w, closed, (r, c), col in strokes(inkm & ~ndi.binary_erosion(solid, iterations=2), dt, a, strong):
        items[part_of(r, c)]['lines'].append((sp, w, closed, col))
    return order, items, round(hw * 2 / UP, 2)


def fmt(sp):
    return '[' + ', '.join('[' + ', '.join(f'{v:g}' for v in p) + ']' for p in sp) + ']'


def convert(who):
    src = f'ref/{who}-sheet.png'
    im = Image.open(os.path.join(HERE, '..', src)).convert('RGB')
    pal = M.palette(im)
    cfgs = CAST[who]
    found = M.boxes(im, len(cfgs))
    holes = M.hole_mask(im, HOLES.get(who, []))
    out = [f'// {who}, drawn in code. Written by tools/tocode.py from the approved sheet {src}: each flat',
           '// colour is a shape of control points ([x, y] smooth, [x, y, 1] a corner), each line a stroke',
           "// along its centre with its width, grouped by body part. Coordinates are the sheet's pixels",
           "// inside the pose's box. Edit a point, a colour or a width here like any drawing in the repo;",
           '// run the tool again only to start over from the sheet.', '']
    for (name, cfg), fb in zip(cfgs.items(), found):
        box = cfg.get('box', fb)
        order, items, lw = pose(im, cfg, box, pal, holes)
        nf = sum(len(v['fills']) for v in items.values()); nl = sum(len(v['lines']) for v in items.values())
        npt = sum(len(f[2]) for v in items.values() for f in v['fills']) + sum(len(l[0]) for v in items.values() for l in v['lines'])
        print(who, name, box, nf, 'shapes', nl, 'strokes', npt, 'control points; line', lw, flush=True)
        out.append(f"Drawn.def('{who}', '{name}', {{ w: {box[2]}, h: {box[3]}, line: {lw} }}, (part, S, L) => {{")
        for pn in order:
            v = items[pn]
            if not v['fills'] and not v['lines']:
                continue
            out.append(f"    part('{pn}');")
            # the bigger shape first: what lies inside another is drawn on top of it
            for area, col, sp in sorted(v['fills'], key=lambda f: -f[0]):
                out.append(f"    S('{col}', {fmt(sp)});")
            for sp, w, closed, col in v['lines']:
                tail = f", {1 if closed else 0}, '{col}'" if col else (', 1' if closed else '')
                out.append(f"    L({fmt(sp)}, {w:g}{tail});")
        out.append('});')
        out.append('')
    dst = os.path.join(HERE, '..', 'cast', f'{who}-drawn.js')
    open(dst, 'w').write('\n'.join(out))
    print(f'cast/{who}-drawn.js', os.path.getsize(dst) // 1024, 'KB', flush=True)


for who in (list(CAST) if sys.argv[1] == 'all' else sys.argv[1:]):
    convert(who)
