"""Measure a flat-colour character sheet: its palette, and for a pose every pixel's flat colour
and the lines. Used by tools/tocode.py; look at what it finds with tools/look.py, and check the
drawing it gives against the sheet with tools/fidelity.py.

The sheets are generated line art, and lossy images: flat fills that carry blotches, an
anti-aliased dark outline, details drawn in a darker tone of the colour they sit on (the seams
of a plaster), paints that meet with no line between them and blend there. So:
  - lines are found by what they are, dark and thin (a black-tophat), not by being black; then
    what is thin and dark but paint (a sock's stripe, a star, a pair of glasses' frame) goes
    back to the fills;
  - a paint is read where the colour is not changing (seeds), tones being one paint when they
    are as light and of the same hue; a paint takes the sheet's palette colour when it has one,
    so it is the same in every pose;
  - every other pixel is read by what explains its colour: a paint seeded near it, or the mix of
    two paints (or a paint and the ink) that both have seeds near it; a still pixel that nothing
    near explains is a paint of its own with no flat pixel (a band two pixels wide). Nothing is
    told from a blend by its shape: that ate every small, thin detail (round 39);
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
is_ink = lambda c: (lum(c) <= 36 and max(c) - min(c) <= 45) or (max(c) - min(c) <= 18 and lum(c) < 80)  # (a dark red is not ink: the edge of a glasses' frame)


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


def measure_pose(im, box, pal, holes=None, bg=None):
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
    # --- the fills. A paint is flat, and the sheet is soft: where two paints meet with no line
    # between them, and beside every line, it runs from one colour to the other over a pixel or
    # three, through tones that are nobody's paint (pinks round a red star on white, olives round
    # an eyelet on a yellow boot). Rules that told a blend from a paint by its SHAPE (thin, small,
    # between two paints) ate what is small and thin by right: the frame of a pair of glasses, the
    # white disc round a star, a sock's stripes. So a pixel is read by what EXPLAINS its colour:
    #   - seeds: where the colour is not changing, a pixel is the paint it matches;
    #   - every other pixel is the paint of a seed near it, or the mix of two paints (or a paint
    #     and the ink) that both have seeds near it, on whichever side of halfway it falls;
    #   - a pixel that nothing near explains, at the still heart of what it belongs to (a ridge:
    #     a blend is never one), is a paint of its own with no flat pixel to show for it; it
    #     becomes a seed, and the blends on both sides of it are then explained too.
    dist = ndi.distance_transform_edt(~inkm)
    slope = np.zeros((H, W), np.float32)
    for ch in range(3):
        slope = np.maximum(slope, ndi.gaussian_gradient_magnitude(a[..., ch], 0.6 * UP))
    inband = ndi.distance_transform_edt(band)
    heart = band & (inband >= 0.6 * ndi.maximum_filter(inband, size=int(3 * UP) | 1))
    still = (slope < 4.0) | heart | (slope < 0.4 * ndi.maximum_filter(slope, size=int(3.5 * UP) | 1))
    free = ~inkm
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

    A1, A2 = a[..., 0] - a[..., 1], (a[..., 0] + a[..., 1]) / 2 - a[..., 2]
    whitepx = (a.min(-1) >= 222) & (chroma < 16)  # one white: the page is told from cloth by where it is
    def dto(k):
        return np.sqrt(((a - cols[k]) ** 2).sum(-1))
    def matches(k, tol=14):
        c = cols[k]
        if k == white:
            return whitepx
        return (np.abs(L - lum(c)) <= tol) & (np.hypot(A1 - (c[0] - c[1]), A2 - ((c[0] + c[1]) / 2 - c[2])) <= 0.8 * tol) & ~whitepx

    def new_paints(m, floor):
        """Paints for the pixels of m that no colour so far is: their tones, the commonest first."""
        px = a[m]
        if len(px) < floor:
            return
        q = (px // 12).astype(np.int64)
        keys, inv, cnt = np.unique(q[:, 0] * 4096 + q[:, 1] * 64 + q[:, 2], return_inverse=True, return_counts=True)
        sums = np.stack([np.bincount(inv, weights=px[:, i], minlength=len(keys)) for i in range(3)], 1)
        cent = []
        for i in np.argsort(-cnt):
            col = sums[i] / cnt[i]
            for c in cent:
                if near_(c[0], col, SAME):
                    c[0] = (c[0] * c[1] + col * cnt[i]) / (c[1] + cnt[i]); c[1] += int(cnt[i])
                    break
            else:
                cent.append([col, int(cnt[i])])
        for col, n in cent:
            if n >= floor and not any(near_(c, col, 14) for c in cols):
                names.append(f'r{len(names)}'); cols.append(np.asarray(col, dtype=np.float32))

    seed = np.full((H, W), -1, np.int32)
    wv = np.array([0.299, 0.587, 0.114], dtype=np.float32)
    def sow(m, tol=14):
        """The pixels of m take the paint they match (the nearest, when more than one)."""
        ii = np.nonzero(m)
        px = a[ii]
        if not len(px):
            return
        l, c1, c2, wh = px @ wv, px[:, 0] - px[:, 1], (px[:, 0] + px[:, 1]) / 2 - px[:, 2], whitepx[ii]
        best = np.full(len(px), 1e9, np.float32); pick = np.full(len(px), -1, np.int32)
        for k in range(1, len(cols)):
            c = cols[k]
            mk = wh if k == white else ((np.abs(l - lum(c)) <= tol) & (np.hypot(c1 - (c[0] - c[1]), c2 - ((c[0] + c[1]) / 2 - c[2])) <= 0.8 * tol) & ~wh)
            if mk.any():
                d = np.sqrt(((px[mk] - c) ** 2).sum(-1))
                j = np.nonzero(mk)[0]
                up = d < best[j]
                best[j[up]] = d[up]; pick[j[up]] = k
        seed[ii[0][pick >= 0], ii[1][pick >= 0]] = pick[pick >= 0]

    flat0 = free & (dist > 1.0 * UP) & ((slope < 4.0) | heart)
    sow(flat0)
    new_paints(flat0 & (seed < 0), 3 * UP * UP)
    sow(flat0 & (seed < 0))

    R1, R2, RI = 3.5 * UP, 3.0 * UP, 2.2 * UP
    pad = int(R1) + 2
    nearink = free & (dist <= RI)
    def explain():
        """lab, cost: for every pixel off the lines, the paint that explains its colour and how well."""
        lab = np.full((H, W), -1, np.int32)
        cost = np.full((H, W), 1e9, np.float32)
        sup = {0: ((slice(0, H), slice(0, W)), nearink, nearink)}  # k: (its box, near enough to be it, to mix with it)
        for k, bb in enumerate(ndi.find_objects(seed + 1, max_label=len(cols))):
            if bb is None or k == 0:
                continue
            sl = (slice(max(0, bb[0].start - pad), min(H, bb[0].stop + pad)), slice(max(0, bb[1].start - pad), min(W, bb[1].stop + pad)))
            dk = ndi.distance_transform_edt(seed[sl] != k)
            sup[k] = (sl, free[sl] & (dk <= R1), free[sl] & (dk <= R2))
        for k, (sl, m1, _) in sup.items():
            ii = np.nonzero(m1)
            if not len(ii[0]):
                continue
            d = np.sqrt(((a[sl][ii] - cols[k]) ** 2).sum(-1))
            lb, cs = lab[sl], cost[sl]
            up = d < cs[ii]
            lb[ii[0][up], ii[1][up]] = k; cs[ii[0][up], ii[1][up]] = d[up]
        ks = sorted(sup)
        for i, u in enumerate(ks):
            su, _, mu = sup[u]
            for v in ks[i + 1:]:
                sv, _, mv = sup[v]
                r0, r1, c0, c1 = max(su[0].start, sv[0].start), min(su[0].stop, sv[0].stop), max(su[1].start, sv[1].start), min(su[1].stop, sv[1].stop)
                if r0 >= r1 or c0 >= c1:
                    continue
                dv = cols[v] - cols[u]
                n2 = float((dv * dv).sum())
                if n2 < 30 * 30:
                    continue
                m = mu[r0 - su[0].start:r1 - su[0].start, c0 - su[1].start:c1 - su[1].start] & mv[r0 - sv[0].start:r1 - sv[0].start, c0 - sv[1].start:c1 - sv[1].start]
                ii = np.nonzero(m)
                if not len(ii[0]):
                    continue
                g = (slice(r0, r1), slice(c0, c1))
                P = a[g][ii] - cols[u]
                tt = np.clip((P * dv).sum(-1) / n2, 0, 1)
                res = np.sqrt(((P - tt[:, None] * dv) ** 2).sum(-1)) + 5.0
                lb, cs = lab[g], cost[g]
                up = res < cs[ii]
                lb[ii[0][up], ii[1][up]] = np.where(tt[up] < 0.5, u, v); cs[ii[0][up], ii[1][up]] = res[up]
        return lab, cost

    # A paint with no flat pixel (a band two pixels wide) never reaches its colour on the sheet: it
    # is seeded with the tone it does reach, so that halfway to its neighbour is measured from
    # there and the band keeps its width; `canon` then says which paint that tone is.
    nbase = len(cols)
    canon = {}
    for _ in range(3):
        lab, cost = explain()
        un = free & (cost > 32) & still & (seed < 0)
        if un.sum() < 4:
            break
        n0 = len(cols)
        new_paints(un, 2 * UP * UP)
        ii = np.nonzero(un)
        px = a[ii]
        best = np.full(len(px), 45.0, np.float32); pick = np.full(len(px), -1, np.int32)
        for k in range(n0, len(cols)):
            d = np.sqrt(((px - cols[k]) ** 2).sum(-1))
            up = d < best
            best[up] = d[up]; pick[up] = k
        # ... what is too little to be a tone of its own is the paint it is nearest, when one is near
        rest = pick < 0
        best[rest] = 60.0
        for k in range(1, n0):
            d = np.sqrt(((px - cols[k]) ** 2).sum(-1))
            up = rest & (d < best)
            best[up] = d[up]; pick[up] = k
        seed[ii[0][pick >= 0], ii[1][pick >= 0]] = pick[pick >= 0]
        for k in range(n0, len(cols)):
            d = [float(np.sqrt(((cols[j] - cols[k]) ** 2).sum())) for j in range(nbase)]
            j = int(np.argmin(d[1:])) + 1
            if d[j] < 60:
                canon[k] = j
    # ... and a tone that is the page's colour mixed with a paint (the pale green of a white sole's
    # edge against the ground) is the page or that paint, whichever it is nearer: never a paint
    if bg is not None:
        B = np.asarray(bg, dtype=np.float32)
        page = next((j for j in range(1, nbase) if float(np.sqrt(((cols[j] - B) ** 2).sum())) < 60), None)
        for k in range(nbase, len(cols)):
            if k in canon or page is None:
                continue
            for j in range(1, nbase):
                dv = cols[j] - B
                n2 = float((dv * dv).sum())
                if j == page or n2 < 60 * 60:
                    continue
                tt = float(((cols[k] - B) * dv).sum() / n2)
                if 0.05 < tt < 0.95 and float(np.sqrt(((cols[k] - B - tt * dv) ** 2).sum())) < 34:
                    canon[k] = page if tt < 0.5 else j
                    break
    lab, cost = explain()
    for k, j in canon.items():
        lab[lab == k] = j
    lab[lab == ink] = -1  # a line's soft edge: the paint beside it runs under the line
    lab[inkm] = -1
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
            for n in vals[np.argsort(-cnts)]:
                if n >= 0 and n != kcol:
                    dl, dc = apart(cols[kcol], cols[n])
                    if dl <= 34 and dc <= 16:
                        lab[g][piece] = n
                        break
    # (what is left of noise: a piece under a pixel and a half takes its neighbour)
    for kcol in np.unique(lab[lab >= 0]):
        for g, piece, thick in pieces(kcol):
            if piece.sum() < 1.5 * UP * UP:
                lab[g][piece] = -1
    # the page: the white that reaches the box's border through white, by any way wider than a
    # pixel (the gap between an arm and the body is page, though the way out of it, between a hand
    # and the shorts, is two pixels wide; a hairline break in an eye's outline lets nothing in)
    # (a sheet drawn on a ground of its own colour, `bg`, needs none of this: the page is that
    # colour, wherever it is, closed in or not, and white is always paint)
    if bg is not None:
        for i, c in enumerate(cols):
            if float(np.sqrt(((c - np.asarray(bg, dtype=np.float32)) ** 2).sum())) < 60:
                lab[lab == i] = -2
    else:
        way = (a.min(-1) >= 232) & (dist > 0.5 * UP)
        wl, nw = ndi.label(way)
        edge = set(np.unique(np.concatenate([wl[0], wl[-1], wl[:, 0], wl[:, -1]]))) - {0}
        lab[(lab == white) & np.isin(wl, list(edge))] = -2
    # (a speck of page shut inside the figure, under five pixels, is no gap between two fingers:
    # it is a fleck of the ground's colour on the sheet, and takes the paint around it)
    pl, npg = ndi.label(lab == -2)
    if npg:
        sizes = ndi.sum(lab == -2, pl, range(1, npg + 1))
        rim = set(np.unique(np.concatenate([pl[0], pl[-1], pl[:, 0], pl[:, -1]]))) - {0}
        tiny = [i + 1 for i in range(npg) if sizes[i] < 5 * UP * UP and (i + 1) not in rim]
        if tiny:
            lab[np.isin(pl, tiny)] = -1
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


def boxes(im, n=2, pad=8, bg=None):
    """The sheet's poses, left to right: split at the widest empty columns, then fit each."""
    a = np.asarray(im).astype(np.int32)
    used = (a.min(-1) < 236) if bg is None else (np.abs(a - np.asarray(bg)).max(-1) > 40)
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
