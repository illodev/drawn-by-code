"""Measure a flat-colour character sheet: its palette, and for a pose every pixel's flat colour
and the lines. Used by tools/tocode.py; look at what it finds with tools/look.py, and check the
drawing it gives against the sheet with tools/fidelity.py.

The sheets are generated line art, and lossy images: flat fills that carry blotches, an
anti-aliased dark outline, details drawn in a darker tone of the colour they sit on (the seams
of a plaster), paints that meet with no line between them and blend there. So:
  - lines are found by what they are, dark and thin (a black-tophat), not by being black; then
    what is thin and dark but paint (a sock's stripe, a star, a pair of glasses' frame) goes
    back to the fills;
  - each region between lines is clustered on its own pixels, tones being one paint when they
    are as light and of the same hue; a paint then takes the sheet's palette colour when it has
    one, so it is the same in every pose;
  - a paint is read only where the colour is not changing: the blends between two paints, and
    beside every line, are slopes; what blotches and slivers are left are told from paint by
    their shape and place (small, or thin and between two paints);
  - the page is the white that reaches the pose's border through white.
"""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

UP = 4
INK_PAINT, WHITE_PAINT = '#120c0e', '#fffdf6'
hexof = lambda c: '#%02x%02x%02x' % tuple(int(round(float(v))) for v in c)
lum = lambda c: 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]
# a line's or a blot's own colour is the ink when it is near black, or dark with no hue (a thin
# line never reaches black on the sheet); anything else, a slate tattoo, a grey seam, keeps its colour
is_ink = lambda c: lum(c) <= 36 or (max(c) - min(c) <= 18 and lum(c) < 80)


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
    (the lines), the pose's pixels and the lines again, all at UP times the sheet. The rules are
    told where they are applied, each with the fault that asked for it.
    """
    SAME = 20
    x, y, w, h = box
    a = np.asarray(im.crop((x, y, x + w, y + h)).resize((w * UP, h * UP), Image.BICUBIC)).astype(np.float32)
    H, W = a.shape[:2]
    names = [n for n, _ in pal]
    cols = [np.asarray(c, dtype=np.float32) for _, c in pal]
    ink, white = 0, 1
    # --- the lines
    L = a @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    k = int(6.5 * UP) | 1
    th = ndi.grey_closing(L, size=(k, k)) - L
    inkm = (th > 22) & (th > 0.5 * ndi.maximum_filter(th, size=int(2.5 * UP) | 1))
    # ... and what is as black as the ink is ink however thick: a pupil is no thin line, and
    # where it leans on the eye's outline only a sliver of it would be left to find as a fill
    inkm |= (L < lum(cols[ink]) + 20) & ((a.max(-1) - a.min(-1)) < 30)
    # ... but not everything dark and thin is a line: a sock's stripe, a star on a shoe, the frame
    # of a pair of glasses, the strip of shoe between two laces, a button. The ink itself is
    # neutral and near black (with its rim of anti-aliasing); of the rest, what is over two
    # pixels wide somewhere (with its tapering ends: a star's points), or a dot standing clear of
    # the ink, is paint and goes back to the fills. What stays is thin and long: a line drawn in a
    # colour (a plaster's seams, the crease between two fingers), which keeps that colour.
    chroma = a.max(-1) - a.min(-1)
    dark = inkm & (((L < 70) & (chroma < 28)) | (np.sqrt(((a - cols[ink]) ** 2).sum(-1)) < 32))
    # (and it is the darkest thing around: the dark strip of a navy shoe between two black lines
    # is paint, however dark and dull the sheet's compression left it)
    dark &= L < ndi.minimum_filter(L, size=int(3 * UP) | 1) + 16
    black = ndi.binary_dilation(dark, iterations=int(round(0.5 * UP)), mask=inkm)
    cand = inkm & ~black
    lbc, nc = ndi.label(cand)
    band = np.zeros((H, W), bool)
    if nc:
        ids = np.arange(1, nc + 1)
        wide = 2 * ndi.maximum(ndi.distance_transform_edt(cand), lbc, ids) / UP
        area = ndi.sum(cand, lbc, ids)
        touch = ndi.maximum(ndi.binary_dilation(black, iterations=2).astype(np.uint8), lbc, ids) > 0
        paintm = (wide >= 2.2) | (~touch & (area <= 3 * (wide * UP) ** 2))
        band = np.isin(lbc, ids[paintm])
        inkm &= ~band
    lbi, ni = ndi.label(inkm)
    if ni:
        inkm = np.isin(lbi, 1 + np.nonzero(ndi.sum(inkm, lbi, range(1, ni + 1)) >= 2.5 * UP * UP)[0])
    # --- the fills, one region between lines at a time, each clustered on its own pixels (not by
    # the nearest palette colour: the blue of a shoe in shadow is nearer the palette's purple
    # than its navy, and a charcoal strap nearer the navy than the grey)
    dist = ndi.distance_transform_edt(~inkm)
    core = dist > 1.3 * UP
    # a paint is flat. Where two paints meet with no line between them, and beside every line,
    # the sheet runs from one colour to the other over a pixel or three, through tones that are
    # nobody's paint (pinks round a red star on white, olives round an eyelet on a yellow boot):
    # there the colour is changing, and only where it is not changing is it read. The heart of a
    # thin stripe does not change either, so it is read too.
    slope = np.zeros((H, W), np.float32)
    for ch in range(3):
        slope = np.maximum(slope, ndi.gaussian_gradient_magnitude(a[..., ch], 0.6 * UP))
    # ... as is the heart of the thin bands just given back to the fills (the top of a stripe two
    # pixels wide is never flat, but it is where the stripe is its own colour)
    inband = ndi.distance_transform_edt(band)
    heart = band & (inband >= 0.6 * ndi.maximum_filter(inband, size=int(3 * UP) | 1))
    flat = core & ((slope < 4.0) | heart)
    lab = np.full((H, W), -1, np.int32)
    reg, nr = ndi.label(~inkm)
    chr_ = lambda c: float(max(c) - min(c))
    # two tones are one paint when they are about as light and of the same hue. Plain distance
    # between colours will not do: a charcoal strap is nearer a navy shoe, and olive shorts nearer
    # a brown sole, than two blotches of one flat orange are to each other; and a skin's shadow is
    # a little darker, not another hue. So: lightness and the two colour axes apart.
    def apart(c, d):
        dl = abs(lum(c) - lum(d))
        dc = float(np.hypot((c[0] - c[1]) - (d[0] - d[1]), ((c[0] + c[1]) / 2 - c[2]) - ((d[0] + d[1]) / 2 - d[2])))
        return dl, dc
    def near_(c, d, tol):
        dl, dc = apart(c, d)
        return dl <= tol and dc <= 0.8 * tol

    def index_of(col):
        """The palette colour this is (so a paint is the same in every region and pose), or a new one."""
        if min(col) >= 222 and chr_(col) < 16:
            return white  # one white: the page is told from cloth by where it is, not by its tone
        d = [float(np.sqrt(((c - col) ** 2).sum())) for c in cols]
        for i in np.argsort(d)[:6]:
            if near_(cols[i], col, 14):
                return int(i)
        names.append(f'r{len(names)}'); cols.append(np.asarray(col, dtype=np.float32))
        return len(cols) - 1

    for r, sl in enumerate(ndi.find_objects(reg)):
        m = reg[sl] == r + 1
        if int(m.sum()) < 2 * UP * UP:
            continue
        A, mc = a[sl], m & flat[sl]
        if mc.sum() < 8:
            mc = m & core[sl]
        if mc.sum() < 8:
            # no room clear of the lines: a sliver between two lines, or the heart of a small
            # pupil. It is what its innermost pixels are (a blend, if it is one, is cleaned below)
            dm = dist[sl] * m
            mc = m & (dm >= 0.6 * dm.max())
        px = A[mc]
        q = (px // 12).astype(np.int64)
        keys, inv, cnt = np.unique(q[:, 0] * 4096 + q[:, 1] * 64 + q[:, 2], return_inverse=True, return_counts=True)
        sums = np.stack([np.bincount(inv, weights=px[:, i], minlength=len(keys)) for i in range(3)], 1)
        cent = []  # [colour, count]: the region's tones, the commonest first; close tones are one paint
        for i in np.argsort(-cnt):
            col = sums[i] / cnt[i]
            for c in cent:
                if near_(c[0], col, SAME):
                    c[0] = (c[0] * c[1] + col * cnt[i]) / (c[1] + cnt[i]); c[1] += int(cnt[i])
                    break
            else:
                cent.append([col, int(cnt[i])])
        # (an absolute floor, not a share of the region: a gap in an outline can join a small
        # detail, a star, to a region as big as the page)
        # ... unless it is nothing like the paints kept so far: the black of a pupil that leans on
        # the eye's outline leaves only a sliver clear of the lines, and it is not white
        kept = []
        for k, c in enumerate(cent):
            far = all(apart(c[0], o[0])[0] > 60 or apart(c[0], o[0])[1] > 40 for o in kept)
            if k == 0 or c[1] >= 2 * UP * UP or (c[1] >= 6 and far):
                kept.append(c)
        cent = kept
        C = np.array([c[0] for c in cent], dtype=np.float32)
        which = np.argmin(((px[:, None, :] - C[None]) ** 2).sum(-1), 1) if len(C) > 1 else np.zeros(len(px), np.int64)
        final = np.array([index_of(np.median(px[which == k], 0)) if (which == k).any() else -1 for k in range(len(C))])
        out = lab[sl]
        out[mc] = final[which]
        # the rest of the region, where the colour is changing, takes a paint read IN the region
        # (left to the general fill below, the rim of a thin gold ring took the white across its
        # outline): of the paints about as near as the nearest, the one nearest in colour, so two
        # paints meet halfway up the slope between them and a star keeps its points
        rest = m & core[sl] & ~mc
        if rest.any() and mc.any():
            ks = [int(k) for k in np.unique(out[mc]) if k >= 0]
            if len(ks) == 1:
                out[rest] = ks[0]
            elif ks:
                dn = ndi.distance_transform_edt(~mc)[rest]
                P = A[rest]
                bestd = np.full(len(P), 1e9, np.float32); pick = np.full(len(P), ks[0], np.int32)
                for k in ks:
                    dk = ndi.distance_transform_edt(~(mc & (out == k)))[rest]
                    dc = np.sqrt(((P - cols[k]) ** 2).sum(-1))
                    upd = (dk < dn + 3 * UP) & (dc < bestd)
                    bestd[upd] = dc[upd]; pick[upd] = k
                out[rest] = pick
    # where two paints meet with no line between them, and along every line, the sheet blends
    # them, and the blend is a tone of its own (a peach rim round every white flower on an orange
    # shirt, a grey fringe beside an outline): a piece of paint thinner than a pixel and a third
    # that lies between two paints, or is a mix of its neighbour and the ink it runs along, is
    # that blend, and its pixels take whichever neighbour is nearer. (A white highlight on a navy
    # shoe is as thin, but it is no mix of the navy and the ink.)
    def is_mix(c, u, v, lo=0.08, hi=0.92):
        d = v - u
        tt = float(((c - u) * d).sum() / max(1e-6, (d * d).sum()))
        return lo < tt < hi and float(np.sqrt(((c - u - tt * d) ** 2).sum())) < 34

    def pieces(kcol):
        """The connected pieces of a paint: [(slices into lab, mask)], and how thick each is."""
        bb = ndi.find_objects((lab == kcol).astype(np.uint8))
        if not bb or bb[0] is None:
            return []
        b = (slice(max(0, bb[0][0].start - 4), bb[0][0].stop + 4), slice(max(0, bb[0][1].start - 4), bb[0][1].stop + 4))
        mk = lab[b] == kcol
        lk, nk = ndi.label(mk)
        thick = ndi.maximum(ndi.distance_transform_edt(mk), lk, np.arange(1, nk + 1))
        out = []
        for i, o in enumerate(ndi.find_objects(lk)):
            o2 = (slice(max(0, o[0].start - 3), o[0].stop + 3), slice(max(0, o[1].start - 3), o[1].stop + 3))
            g = (slice(b[0].start + o2[0].start, b[0].start + o2[0].stop), slice(b[1].start + o2[1].start, b[1].start + o2[1].stop))
            out.append((g, lk[o2] == i + 1, float(thick[i])))
        return out

    # (first the sheet's own blotches: these are lossy images, and a flat skin carries darker and
    # lighter patches. A small patch whose neighbour is the same hue, a little lighter or darker,
    # is that neighbour's paint. A real shadow under a chin is as close in tone, but it is big.)
    for kcol in np.unique(lab[lab >= 0]):
        for g, piece, thick in pieces(kcol):
            if piece.sum() > 60 * UP * UP:
                continue
            ring = ndi.binary_dilation(piece, iterations=3) & ~piece
            vals, cnts = np.unique(lab[g][ring], return_counts=True)
            # (or the blend of two paints that meet: the grey between a pupil and the eye's white)
            around = [int(n) for n in vals if n >= 0 and n != kcol]
            if piece.sum() < 16 * UP * UP and any(is_mix(cols[kcol], cols[u], cols[v]) for u in around for v in around if u < v):
                lab[g][piece] = -1
                continue
            for n in vals[np.argsort(-cnts)]:
                if n >= 0 and n != kcol:
                    dl, dc = apart(cols[kcol], cols[n])
                    if dl <= 34 and dc <= 16:
                        lab[g][piece] = n
                        break
    for kcol in np.unique(lab[lab >= 0]):
        for g, piece, thick in pieces(kcol):
            small = piece.sum() < 30 * UP * UP
            if thick >= 2.5 * UP and not small:
                continue
            ring = ndi.binary_dilation(piece, iterations=3) & ~piece
            nbrs = sorted(set(np.unique(lab[g][ring]).tolist()) - {-1, int(kcol)})
            c = np.median(a[g][piece], 0)
            # thinner than a pixel and a third between two paints; or a band up to five pixels
            # wide (some sheets are that soft) that is their mix in colour too: the pink round
            # a red star on white; or, beside a line, the mix of the ink and the neighbour, at
            # least a sixth ink: the olive smudge round an eyelet on a yellow boot (a shadow
            # painted along an outline is the neighbour a little darker, and stays)
            gone = thick < 0.65 * UP and len(nbrs) >= 2
            if not gone:
                gone = any(is_mix(c, cols[u], cols[v]) for u in nbrs for v in nbrs if u < v)
            if not gone and nbrs and dist[g][piece].min() < 1.3 * UP + 2.5:
                gone = any(is_mix(c, cols[ink], cols[n], 0.08, 0.84) for n in nbrs)
            if gone:
                lab[g][piece] = -1
    # the page: the white that reaches the box's border THROUGH WHITE, away from the lines (lab is
    # only set a line and a bit from the ink, so a hairline gap in an outline does not let the
    # page into an eye; and a region joined to the page's through a gap, or through colours that
    # meet without a line, keeps its own whites: teeth, eyes, a shirt's stripes)
    wl, nw = ndi.label(lab == white)
    edge = set(np.unique(np.concatenate([wl[0], wl[-1], wl[:, 0], wl[:, -1]]))) - {0}
    lab[np.isin(wl, list(edge))] = -2
    # the holes: page seen through the figure (between an arm and the body, inside a strap)
    if holes is not None:
        hm = np.asarray(Image.fromarray(holes[y:y + h, x:x + w]).resize((w * UP, h * UP), Image.NEAREST))
        hm = ndi.binary_dilation(hm, iterations=UP) & ~inkm
        lab[hm & ((lab == white) | (lab == -1))] = -2
    # every remaining pixel (lines included) takes the nearest paint: fills meet under the lines
    idx = ndi.distance_transform_edt(lab == -1, return_distances=False, return_indices=True)
    full = lab[idx[0], idx[1]]
    # ... but the page never creeps under the outline: there the neighbour colour does
    idx2 = ndi.distance_transform_edt(full == -2, return_distances=False, return_indices=True)
    under = np.where(inkm & (full == -2), full[idx2[0], idx2[1]], full)
    # cloth white is painted with the kit's white (the sheets' is made for a white page), and a
    # black fill (a pupil, where lines meet) with the ink
    def paint_of(c):
        if c.min() >= 222 and c.max() - c.min() < 16:
            return WHITE_PAINT
        if lum(c) < 34 and c.max() - c.min() < 30:
            return INK_PAINT
        return hexof(c)
    paint = [INK_PAINT, WHITE_PAINT] + [paint_of(c) for c in cols[2:]]
    return names, paint, under, inkm, a, inkm


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
            # ... or the region the point itself is in (or within three pixels of)
            near = lb[max(0, py - 3):py + 4, max(0, px - 3):px + 4]
            if not near.any():
                raise SystemExit(f'no white region centred near {px},{py}')
            i = int(np.bincount(near[near > 0]).argmax()) - 1
        out |= lb == i + 1
    return out
