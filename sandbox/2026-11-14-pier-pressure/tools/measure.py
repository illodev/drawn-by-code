"""Measure a flat-colour character sheet: its palette, and for a pose every pixel's flat colour
and the lines. Used by tools/tocode.py.

The sheets are generated line art: flat fills, an anti-aliased dark outline, and details drawn
in a darker tone of the colour they sit on (the lines of a plaster, a seam). So:
  - the palette is clustered from the pixels of flat areas only (anti-aliasing never is flat);
  - a pixel is explained as a flat colour mixed with ink: its ink share says line or fill
    (nearest-colour alone turns thin lines, never pure black, into slivers of the dark fills);
  - dark fills (the inside of a mouth, a navy shoe) are told from lines by their thickness;
  - a patch that holds a little ink but stands clear of every line is a detail in a darker
    tone (the plaster's lines): it becomes a colour of its own, not anti-aliasing to clean away.
"""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

UP = 4
INK_PAINT, WHITE_PAINT = '#120c0e', '#fffdf6'
hexof = lambda c: '#%02x%02x%02x' % tuple(int(round(float(v))) for v in c)
lum = lambda c: 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]


def palette(im):
    """[(name, rgb)]: 'ink', 'white', then the sheet's flat colours by how much there is of each."""
    a = np.asarray(im).astype(np.int32)
    flat = (ndi.maximum_filter(a, size=(3, 3, 1)) - ndi.minimum_filter(a, size=(3, 3, 1))).max(-1) < 9
    px = a[flat]
    q = px // 8
    keys, inv, cnt = np.unique(q[:, 0] * 4096 + q[:, 1] * 64 + q[:, 2], return_inverse=True, return_counts=True)
    sums = np.stack([np.bincount(inv, weights=px[:, i], minlength=len(keys)) for i in range(3)], 1)
    cent = []
    for i in np.argsort(-cnt):
        if cnt[i] < 12:
            break
        col = sums[i] / cnt[i]
        for c in cent:
            if np.abs(c[0] - col).sum() < 26:
                c[0] = (c[0] * c[1] + col * cnt[i]) / (c[1] + cnt[i]); c[1] += cnt[i]
                break
        else:
            cent.append([col, int(cnt[i])])
    cent = [c for c in cent if c[1] >= 36]
    whites = [c for c in cent if c[0].min() >= 232]
    rest = [c for c in cent if c[0].min() < 232]
    inks = [c for c in rest if lum(c[0]) < 46 and c[0].max() - c[0].min() < 30]
    ink = min(inks, key=lambda c: lum(c[0]))[0] if inks else np.array([12., 9., 7.])
    rest = [c for c in rest if not (lum(c[0]) < 46 and c[0].max() - c[0].min() < 30 and np.abs(c[0] - ink).sum() < 40)]
    out = [('ink', ink), ('white', np.array([255., 255., 255.]))]
    out += [(f'c{i + 1}', c[0]) for i, c in enumerate(sorted(rest, key=lambda c: -c[1]))]
    # thin bands (the frame of a pair of glasses, a stripe) are never flat over 3 × 3 pixels: look
    # for colours with a hue that nothing explains, neither a colour found so far nor a mix of two
    P = np.array([c for _, c in out])
    allpx = a.reshape(-1, 3).astype(np.float32)
    allpx = allpx[(allpx.max(1) - allpx.min(1)) >= 45]
    allpx = allpx[np.sqrt(((allpx[:, None, :] - P[None]) ** 2).sum(-1)).min(1) > 34]
    if len(allpx):
        resid = np.full(len(allpx), 1e9, np.float32)
        for i in range(len(P)):
            for j in range(i + 1, len(P)):
                v = P[j] - P[i]
                t = np.clip(((allpx - P[i]) * v).sum(1) / max(1e-6, (v * v).sum()), 0, 1)
                resid = np.minimum(resid, np.sqrt(((allpx - P[i] - t[:, None] * v) ** 2).sum(1)))
        px2 = allpx[resid > 22]
        thin = []
        if len(px2):
            q = (px2 // 12).astype(np.int64)
            keys, inv, cnt = np.unique(q[:, 0] * 4096 + q[:, 1] * 64 + q[:, 2], return_inverse=True, return_counts=True)
            for i in np.argsort(-cnt):
                col = px2[inv == i].mean(0)
                for c in thin:
                    if np.abs(c[0] - col).sum() < 40:
                        c[0] = (c[0] * c[1] + col * cnt[i]) / (c[1] + cnt[i]); c[1] += cnt[i]
                        break
                else:
                    thin.append([col, int(cnt[i])])
        out += [(f't{i + 1}', c[0]) for i, c in enumerate(sorted([c for c in thin if c[1] >= 70 and c[0].max() - c[0].min() >= 70], key=lambda c: -c[1]))]
    return out


def measure_pose(im, box, pal, holes=None):
    """names, paint (hex per name), under (a flat colour for every pixel; -2 = the page), inkm
    (the lines), the pose's pixels and the strong lines alone, all at UP times the sheet."""
    x, y, w, h = box
    a = np.asarray(im.crop((x, y, x + w, y + h)).resize((w * UP, h * UP), Image.BICUBIC)).astype(np.float32)
    names = [n for n, _ in pal]
    cols = [np.asarray(c, dtype=np.float32) for _, c in pal]
    ink, white = 0, 1
    # 1 · a pixel that is one of the sheet's colours, in an area thick enough to be a fill, is
    #     that colour (light or dark alike: a navy shoe, the dark of a mouth, a magenta bobble)
    dist = np.stack([np.sqrt(((a - c) ** 2).sum(-1)) for c in cols], -1)
    near = dist.argmin(-1)
    direct = dist.min(-1) < 26
    lab = np.full(a.shape[:2], -1, np.int32)
    for k in range(1, len(names)):
        # ... thicker than any line; a colour close to the ink's must be much thicker still, or
        # the heart of every line would pass for it
        # (a colour with a hue of its own cannot be a line's heart: a thin band of it is a fill,
        # the dark red frame of a pair of glasses, a navy stripe)
        hue = cols[k].max() - cols[k].min() >= 45
        it = int((0.7 if hue else 3.4 if np.sqrt(((cols[k] - cols[ink]) ** 2).sum()) < 75 else 1.6) * UP)
        m = ndi.binary_opening(direct & (near == k), structure=np.ones((3, 3)), iterations=it)
        m = ndi.binary_dilation(m, iterations=it // 2) & direct & (near == k)
        lab[m] = k
    # 2 · the rest is a line or its anti-aliasing: a flat colour mixed with ink. For every colour
    #     c, how much ink the pixel holds if it is a mix of c and ink (alpha) and how far it is
    #     from that mix; the best fit wins; half ink or more is line. (Nearest-colour alone turns
    #     thin lines, never pure black, into slivers of the dark fills.)
    best = np.full(a.shape[:2], 1e9, np.float32); alpha = np.zeros(a.shape[:2], np.float32); mix = np.zeros(a.shape[:2], np.int32)
    for i in range(1, len(names)):
        c = cols[i]; v = cols[ink] - c
        if np.sqrt((v * v).sum()) < 110:
            continue  # too close to the ink to tell a mix from the colour: such fills come from step 1
        al = np.clip(((a - c) * v).sum(-1) / (v * v).sum(), 0, 1)
        res = np.sqrt((((a - c) - al[..., None] * v) ** 2).sum(-1)) + 14 * al
        if np.sqrt((v * v).sum()) < 200:
            # a dark colour explains a pixel only beside its own fill (anti-aliasing mixes a line
            # with what lies next to it); elsewhere a dark pixel is the heart of a line
            res = np.where(ndi.binary_dilation(lab == i, iterations=3 * UP), res, 1e9)
        m = res < best
        best[m] = res[m]; alpha[m] = al[m]; mix[m] = i
    rest = lab == -1
    lab = np.where(rest, np.where(alpha >= 0.5, ink, mix), lab)
    alpha = np.where(rest, alpha, 0)
    core = np.zeros(a.shape[:2], bool)
    light = list(range(1, len(names)))
    inkm = lab == ink
    strong = inkm
    # thin, faint lines (a plaster's seams, one sheet pixel wide, are never half ink): a ridge of
    # the ink share, higher than what lies a pixel and a half away on both sides, well clear of
    # the strong lines (whose shoulders must not thicken), and long enough to be a line
    ridge = np.zeros_like(inkm)
    r = int(1.5 * UP)
    for dy, dx in ((0, r), (r, 0), (r, r), (r, -r)):
        lo = np.maximum(np.roll(alpha, (dy, dx), (0, 1)), np.roll(alpha, (-dy, -dx), (0, 1)))
        ridge |= alpha > lo + 0.09
    # (a thin stripe of one of the sheet's colours, a red welt, is a fill, not a faint line)
    weak = ridge & (alpha >= 0.24) & (alpha < 0.5) & ~direct & (ndi.distance_transform_edt(~strong) > 1.6 * UP)
    lbw, nw = ndi.label(weak)
    if nw:
        sl = ndi.find_objects(lbw)
        ok = [i + 1 for i in range(nw) if max(sl[i][0].stop - sl[i][0].start, sl[i][1].stop - sl[i][1].start) >= 3.5 * UP]
        weak = np.isin(lbw, ok)
    lab[weak] = ink
    inkm = lab == ink
    # details in a darker tone: a little ink, well clear of any line
    away = ndi.distance_transform_edt(~inkm) > 1.5 * UP
    cand = ~core & (alpha > 0.13) & (alpha < 0.5) & away
    for i in light:
        m = ndi.binary_opening(cand & (lab == i), structure=np.ones((3, 3)), iterations=1)
        lb, n = ndi.label(m)
        if not n:
            continue
        sizes = ndi.sum(m, lb, range(1, n + 1))
        m = np.isin(lb, 1 + np.nonzero(sizes >= 5 * UP * UP)[0])
        if m.sum() < 9 * UP * UP:
            continue
        m = ndi.binary_dilation(m, iterations=max(1, UP // 2)) & (lab == i) & (alpha > 0.08)
        names.append(names[i] + '~'); cols.append(np.median(a[m], 0))
        lab[m] = len(names) - 1
    # clean each flat colour: slivers of anti-aliasing go, the gaps are refilled from the nearest colour
    clean = np.full(lab.shape, -1)
    for k in range(1, len(names)):
        tint = names[k].endswith('~')
        m = lab == k if tint else ndi.binary_opening(lab == k, structure=np.ones((3, 3)), iterations=2)
        lb, n = ndi.label(m)
        if n:
            sizes = ndi.sum(m, lb, range(1, n + 1))
            m = np.isin(lb, 1 + np.nonzero(sizes >= (5 if tint else 7) * UP * UP)[0])
        clean[m] = k
    # the page: white connected to the box's border
    wl, _ = ndi.label((clean == white) | ((clean == -1) & ~inkm & (lab == white)))
    edge = np.unique(np.concatenate([wl[0], wl[-1], wl[:, 0], wl[:, -1]]))
    clean[np.isin(wl, edge[edge > 0])] = -2
    # ... and the holes: page seen through the figure (between an arm and the body, inside a strap)
    if holes is not None:
        hm = np.asarray(Image.fromarray(holes[y:y + h, x:x + w]).resize((w * UP, h * UP), Image.NEAREST))
        hm = ndi.binary_dilation(hm, iterations=UP) & ~inkm
        clean[hm & ((clean == white) | (clean == -1))] = -2
    # every remaining pixel (ink included) takes the nearest flat colour: fills meet under the lines
    idx = ndi.distance_transform_edt(clean == -1, return_distances=False, return_indices=True)
    full = clean[idx[0], idx[1]]
    # ... but the page never creeps under the outline: there the neighbour colour does
    idx2 = ndi.distance_transform_edt(full == -2, return_distances=False, return_indices=True)
    under = np.where(inkm & (full == -2), full[idx2[0], idx2[1]], full)
    # cloth white is painted with the kit's white (the sheets' is a grey-white made for a white page)
    paint = [INK_PAINT, WHITE_PAINT] + [WHITE_PAINT if (c.min() >= 222 and c.max() - c.min() < 16) else hexof(c) for c in cols[2:]]
    return names, paint, under, inkm, a, strong


def boxes(im, n=2, pad=8):
    """The sheet's poses, left to right: split at the widest empty columns, then fit each."""
    a = np.asarray(im).astype(np.int32)
    used = (a.min(-1) < 236)
    colsum = used.sum(0)
    W = a.shape[1]
    gaps = []
    run = None
    for x in range(W):
        if colsum[x] == 0:
            run = x if run is None else run
        elif run is not None:
            if run > 0:
                gaps.append((x - run, run, x))
            run = None
    cuts = sorted((g[1] + g[2]) // 2 for g in sorted(gaps, reverse=True)[:n - 1])
    out = []
    for x0, x1 in zip([0] + cuts, cuts + [W]):
        ys, xs = np.nonzero(used[:, x0:x1])
        bx0, bx1, by0, by1 = max(0, x0 + xs.min() - pad), min(W, x0 + xs.max() + pad), max(0, ys.min() - pad), min(a.shape[0], ys.max() + pad)
        out.append((int(bx0), int(by0), int(bx1 - bx0), int(by1 - by0)))
    return out


def hole_mask(im, points):
    """The sheet's pure-white regions (page seen through the figure) whose centres are `points`."""
    a = np.asarray(im).astype(np.int32)
    pure = a.min(-1) >= 250
    lb, n = ndi.label(pure)
    com = ndi.center_of_mass(pure, lb, range(1, n + 1))
    out = np.zeros(pure.shape, bool)
    for px, py in points:
        d = [abs(c[1] - px) + abs(c[0] - py) for c in com]
        i = int(np.argmin(d))
        if d[i] > 8:
            raise SystemExit(f'no white region centred near {px},{py}')
        out |= lb == i + 1
    return out
