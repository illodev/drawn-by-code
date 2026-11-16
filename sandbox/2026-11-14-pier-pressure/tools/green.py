"""The cast's drawings from their sheets on a green ground: python3 -I tools/green.py <sheet> [<sheet> …] | all

Each sheet (ref/<sheet>.png) is two to four figures on flat pure green. Nothing is boxed or masked
by hand (but a generator's stray mark, FLAWS): the figures are what is not green (the biggest pieces, left to right; a loose
bit, a flying camcorder, chips in the air, goes with the figure nearest to it), the page is the
green wherever it is, and each pose gets its anchor (the point between its soles, or its middle
for a pose in the air) and its pixels per metre (from the sheet's reference pose and how tall
that is). Writes cast/<sheet>-drawn.js, and cast/sheets.js (where every pose sits on its sheet,
for dev/fidelity). Parts, where a pose is cut into pieces, are polygons in the pose's own pixels.
"""
import os
import sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
import measure as M
import tocode as T

BG = (0, 255, 0)
# sheet: (who, [(pose, 'feet' | 'mid')], index of the reference pose, its height in metres)
SHEETS = {
    'kit-sheet': ('kit', [('stand', 'feet'), ('jump', 'mid')], 0, 1.42),
    'kit-drop-a': ('kit', [('tuck', 'feet'), ('reach', 'feet'), ('contact', 'feet')], 2, 1.48),
    'kit-drop-b': ('kit', [('crouch', 'feet'), ('rise', 'feet'), ('proud', 'feet')], 2, 1.49),
    'kit-ride': ('kit', [('push', 'feet'), ('glide', 'feet'), ('point', 'feet')], 2, 1.52),
    'hoagie-sheet': ('hoagie', [('film', 'feet'), ('jump', 'mid')], 0, 1.32),
    'hoagie-keys': ('hoagie', [('run', 'feet'), ('skid', 'feet'), ('proud', 'feet')], 2, 1.32),
    'hoagie-seq-turn': ('hoagie', [('t1', 'feet'), ('t2', 'feet'), ('t3', 'feet'), ('t4', 'feet')], 3, 1.37),
    'hoagie-seq-thumb': ('hoagie', [('a1', 'feet'), ('a2', 'feet'), ('a3', 'feet'), ('a4', 'feet')], 2, 1.32),
    # (the skateboard that shoots away from under him is a drawing of its own: the only whole board there is)
    'milo-sheet': ('milo', [('stand', 'feet'), ('board', 'mid'), ('fall', 'mid')], 0, 1.62),
    'milo-keys': ('milo', [('crouch', 'feet'), ('smug', 'feet'), ('run', 'feet')], 1, 1.62),
    'pip-sheet': ('pip', [('stand', 'feet'), ('ride', 'feet')], 0, 1.12),
    'pip-keys': ('pip', [('push', 'feet'), ('lolly', 'feet'), ('wink', 'feet')], 1, 1.2),
    'dot-sheet': ('dot', [('stand', 'feet'), ('serve', 'feet')], 0, 1.8),
    'dot-keys': ('dot', [('basket', 'feet'), ('salt', 'feet'), ('yell', 'feet')], 1, 1.86),
    'captain-sheet': ('captain', [('perch', 'feet'), ('fly', 'mid')], 0, 0.61),
    'captain-keys': ('captain', [('ready', 'feet'), ('launch', 'feet'), ('down', 'mid')], 1, 0.46),
    # frames between and cycles (round 37). 'run': the anchor is under the figure's middle, on its
    # lowest point, so a cycle's drawings do not jump with the foot that is down
    'hoagie-seq-tween': ('hoagie', [('ta', 'feet'), ('tb', 'feet'), ('tc', 'feet'), ('td', 'feet')], 3, 1.38),
    'hoagie-run': ('hoagie', [('r1', 'run'), ('r2', 'run'), ('r3', 'run'), ('r4', 'run')], 1, 1.22),
    'milo-run': ('milo', [('r1', 'run'), ('r2', 'run'), ('r3', 'run'), ('r4', 'run')], 1, 1.98),  # (arms above his head)
    'kit-skate': ('kit', [('s1', 'wheels'), ('s2', 'wheels'), ('s3', 'wheels'), ('s4', 'wheels')], 2, 1.4),
    'pip-scoot': ('pip', [('s1', 'wheels'), ('s2', 'wheels'), ('s3', 'wheels'), ('s4', 'wheels')], 3, 1.25),
    'captain-flap': ('captain', [('f1', 'beak'), ('f2', 'beak'), ('f3', 'beak'), ('f4', 'beak')], 1, 0.36),
    # off the end of the pier (round 38): take-off, launched, the hang with a look down, the fall.
    # The take-off stands on the deck; the other three are held by their middle
    'hoagie-leap': ('hoagie', [('j1', 'run'), ('j2', 'mid'), ('j3', 'mid'), ('j4', 'mid')], 2, 1.45),
    'milo-leap': ('milo', [('j1', 'run'), ('j2', 'mid'), ('j3', 'mid'), ('j4', 'mid')], 2, 1.78),
    'kit-leap': ('kit', [('j1', 'wheels'), ('j2', 'mid'), ('j3', 'mid'), ('j4', 'mid')], 2, 1.52),
    'pip-leap': ('pip', [('j1', 'wheels'), ('j2', 'mid'), ('j3', 'mid'), ('j4', 'mid')], 2, 1.3),
    # the in-betweens of Kit's landing (round 39): going down, coming up, almost up, up with her eyes shut
    'kit-land': ('kit', [('n1', 'feet'), ('n2', 'feet'), ('n3', 'feet'), ('n4', 'feet')], 3, 1.49),
    # Aunt Dot shaking her fry basket, a loop of four (round 52), so that she moves at her hatch
    'dot-shake': ('dot', [('k1', 'feet'), ('k2', 'feet'), ('k3', 'feet'), ('k4', 'feet')], 2, 1.84),
}
# (who, pose): { 'rest', 'order', 'parts': [(name, polygon in the pose's own pixels)], 'at': [x, y] }
PARTS = {}
if os.path.exists(os.path.join(HERE, 'parts.py')):
    exec(open(os.path.join(HERE, 'parts.py')).read())


def figures(im, n):
    """The sheet's n figures as masks, left to right, and each one's main piece."""
    a = np.asarray(im).astype(np.int32)
    fig = np.abs(a - np.array(BG)).max(-1) > 60
    lb, k = ndi.label(ndi.binary_dilation(fig, iterations=2))
    size = ndi.sum(fig, lb, range(1, k + 1))
    main = sorted((int(i) + 1 for i in np.argsort(-size)[:n]), key=lambda i: ndi.center_of_mass(lb == i)[1])
    near = np.stack([ndi.distance_transform_edt(lb != i) for i in main])
    masks = [(lb == i) for i in main]
    for j in range(1, k + 1):
        if j in main or size[j - 1] < 12:
            continue
        m = lb == j
        masks[int(np.argmin([near[q][m].min() for q in range(len(main))]))] |= m
    return [mk & fig | ndi.binary_dilation(mk & fig, iterations=3) for mk in masks], [(lb == i) & fig for i in main]


# a stray mark the generator left that is no part of the drawing (a pale streak between two legs,
# a blue speck beside a sleeve): its box on the sheet and what it is made of. That paint goes back
# to the page, and with 'thin' so does the mark's own hairline edge (anything under 3 px wide)
STRAY = {
    'lime': lambda r, g, b: ((g > r + 10) & (g > b + 60)) | ((g > 170) & (b < 190) & (r < g + 45)),  # (and its pale edge)
    'blue': lambda r, g, b: (b > r + 20) & (g > 50),
}
FLAWS = {
    'pip-leap': [(1116, 452, 1131, 500, 'lime', False)],
    'hoagie-leap': [(572, 300, 591, 315, 'lime', False), (836, 295, 848, 309, 'lime', False), (829, 314, 841, 325, 'lime', False)],  # (olive smears inside his strap)
    'milo-leap': [(101, 400, 122, 416, 'blue', True)],
}


def clean(im, sheet):
    """The sheet with the page's green put back where the generator muddied it: in a narrow gap
    (inside a strap, behind a collar) the green comes out darkened, a blob of page that is neither
    the page's colour nor any paint. A band of it one or two pixels wide is a line's soft edge and
    stays; anything wider is page."""
    a = np.asarray(im).astype(np.int32).copy()
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mud = (g - np.maximum(r, b) > 40) & (r < 110) & (b < 110) & (np.abs(a - np.array(BG)).max(-1) > 60)
    # (only where it touches the page: a dark green shut in by lines and paint is a paint, the top
    # of a scooter's deck, and stays)
    page = ndi.binary_dilation(np.abs(a - np.array(BG)).max(-1) <= 60, iterations=2)
    lb, k = ndi.label(mud)
    onpage = np.zeros(k + 1, bool)
    onpage[np.unique(lb[page & mud])] = True
    onpage[0] = False
    mud &= onpage[lb]
    blob = ndi.binary_dilation(ndi.binary_erosion(mud, np.ones((3, 3), bool)), np.ones((5, 5), bool)) & mud
    a[blob] = BG
    lb, k = ndi.label(mud & ~blob)  # ... and a ragged fleck of it that the opening leaves whole
    for j, sl in enumerate(ndi.find_objects(lb), 1):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        n = int((lb[sl] == j).sum())
        if min(h, w) >= 3 and n >= 12 and n >= 0.4 * h * w:
            a[sl][lb[sl] == j] = BG
    for x0, y0, x1, y1, kind, thin in FLAWS.get(sheet, []):
        box = a[y0:y1, x0:x1]
        box[STRAY[kind](box[..., 0], box[..., 1], box[..., 2])] = BG
        if thin:
            fig = np.abs(a[y0 - 4:y1 + 4, x0 - 4:x1 + 4] - np.array(BG)).max(-1) > 60
            keep = ndi.binary_dilation(ndi.binary_erosion(fig, np.ones((3, 3), bool)), np.ones((3, 3), bool))
            box[(fig & ~keep)[4:-4, 4:-4]] = BG
            lb, k = ndi.label(fig & keep)  # ... and what is left loose inside the box
            for j in range(1, k + 1):
                m = lb == j
                if not (m[:4].any() or m[-4:].any() or m[:, :4].any() or m[:, -4:].any()):
                    box[m[4:-4, 4:-4]] = BG
    return Image.fromarray(a.astype(np.uint8))


def convert(sheet):
    who, poses, ref, metres = SHEETS[sheet]
    im = clean(Image.open(os.path.join(HERE, '..', 'ref', sheet + '.png')).convert('RGB'), sheet)
    pal = M.palette(im)
    masks, mains = figures(im, len(poses))
    rows = lambda m: np.nonzero(m.any(1))[0]
    ppm = (rows(mains[ref])[-1] - rows(mains[ref])[0] + 1) / metres
    out = [f'// {who}: the drawings of ref/{sheet}.png, written by tools/green.py: each flat colour is a shape of',
           '// control points ([x, y] smooth, [x, y, 1] a corner), each line a stroke along its centre with its',
           "// width. Coordinates are the sheet's pixels inside the pose's box; `at` is the pose's anchor (between",
           '// its soles, or its middle in the air) and `m` its pixels per metre.', '']
    where = []
    for (name, anchor), mask, main in zip(poses, masks, mains):
        ys, xs = np.nonzero(mask)
        x0, y0 = max(0, xs.min() - 6), max(0, ys.min() - 6)
        box = (int(x0), int(y0), int(min(im.width, xs.max() + 7) - x0), int(min(im.height, ys.max() + 7) - y0))
        only = Image.composite(im, Image.new('RGB', im.size, BG), Image.fromarray((mask * 255).astype(np.uint8)))
        extra = PARTS.get((who, name), {})
        cfg = {'bg': BG, **{k: v for k, v in extra.items() if k in ('rest', 'order', 'cut')}}
        if 'parts' in extra:
            cfg['parts'] = [(e[0], [(px + box[0], py + box[1]) for px, py in e[1]], *e[2:]) for e in extra['parts']]
        order, items, lw = T.pose(only, cfg, box, pal, None)
        r = rows(main); c = np.nonzero(main.any(0))[0]
        if anchor == 'wheels':
            # what rolls is held by its wheels (magenta, at the bottom), so it rolls evenly whatever the legs do
            px = np.asarray(im).astype(np.int32)
            wh = main & (px[..., 0] > 140) & (px[..., 1] < 100) & (px[..., 2] > 70) & (px[..., 0] - px[..., 2] > 30)
            wh[:int(r[-1] - 0.09 * (r[-1] - r[0]))] = False
            wy, wx = np.nonzero(wh)
            at = [float((wx.min() + wx.max()) / 2) - box[0], float(wy.max()) + 2 - box[1]]
        elif anchor == 'beak':
            # a flying bird's wings change its outline in every frame: it is held by its beak
            px = np.asarray(im).astype(np.int32)
            bk = main & (px[..., 0] > 215) & (px[..., 1] > 120) & (px[..., 1] < 205) & (px[..., 2] < 95)
            bk[:, :int(c[0] + 0.6 * (c[-1] - c[0]))] = False
            by_, bx_ = np.nonzero(bk)
            at = [float(bx_.mean()) - box[0], float(by_.mean()) - box[1]]
        elif anchor == 'run':
            at = [float(np.nonzero(main)[1].mean()) - box[0], r[-1] - box[1]]
        elif anchor == 'mid':
            at = [(c[0] + c[-1]) / 2 - box[0], (r[0] + r[-1]) / 2 - box[1]]
        else:
            low = np.nonzero(main[int(r[-1] - 0.06 * (r[-1] - r[0])):r[-1] + 1].any(0))[0]
            at = [(low[0] + low[-1]) / 2 - box[0], r[-1] - box[1]]
        at = extra.get('at', [round(float(v), 1) for v in at])
        print(sheet, name, box, 'at', at, 'm', round(ppm, 1), sum(len(v['fills']) for v in items.values()), 'shapes', sum(len(v['lines']) for v in items.values()), 'strokes', flush=True)
        out.append(f"Drawn.def('{who}', '{name}', {{ w: {box[2]}, h: {box[3]}, line: {lw}, at: [{at[0]:g}, {at[1]:g}], m: {ppm:.1f} }}, (part, S, L) => {{")
        for pn in order:
            v = items[pn]
            if not v['fills'] and not v['lines']:
                continue
            out.append(f"    part('{pn}');")
            for area, col, sp in sorted(v['fills'], key=lambda f: -f[0]):
                out.append(f"    S('{col}', {T.fmt(sp)});")
            for sp, w, closed, col in v['lines']:
                tail = f", {1 if closed else 0}, '{col}'" if col else (', 1' if closed else '')
                out.append(f"    L({T.fmt(sp)}, {w:g}{tail});")
        out += ['});', '']
        where.append(f"['{who}', '{name}', {box[0]}, {box[1]}]")
    open(os.path.join(HERE, '..', 'cast', sheet + '-drawn.js'), 'w').write('\n'.join(out))
    open(os.path.join(HERE, '..', 'cast', 'sheets', sheet + '.txt'), 'w').write(f"    ['{sheet}', {', '.join(where)}],\n")
    # every sheet's poses and where they sit, for dev/fidelity
    lines = [open(os.path.join(HERE, '..', 'cast', 'sheets', s + '.txt')).read() for s in SHEETS if os.path.exists(os.path.join(HERE, '..', 'cast', 'sheets', s + '.txt'))]
    open(os.path.join(HERE, '..', 'cast', 'sheets.js'), 'w').write('// where each pose sits on its sheet (written by tools/green.py)\nconst CastSheets = [\n' + ''.join(lines) + '];\n')


if __name__ == '__main__':
    for s in (list(SHEETS) if sys.argv[1] == 'all' else sys.argv[1:]):
        convert(s)
