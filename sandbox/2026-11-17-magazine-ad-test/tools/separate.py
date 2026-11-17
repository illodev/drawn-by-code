"""Separate a printed reference into its inks, and write the plates as code.

    python3 -I tools/separate.py ref/C-a.png sep/C-a          (from the experiment folder)

The reference is read as what it is: paper with three inks multiplied over it (the press's own
model, styles/risograph/riso.js). Per pixel, the optical density over the paper is split into
orange, turquoise and black coverage (a least-squares fit with no negative ink). Then each plate
is written as shapes:
  - black line art: the black coverage at full resolution, upsampled ×2, above 0.5 → solid
    polygons (the brush lines and the solid blacks);
  - every plate's tone: the coverage blurred over a screen cell, cut at LEVELS → nested regions
    (rings, filled even-odd), each laid over the last with the alpha that brings the stack to
    its band's middle tone, on the plate's screen;
  - solids: where a colour ink's blurred coverage stays above SOLID → a flat (unscreened) plate.
Writes <out>.js (a global SEP['<name>'] = { w, h, plates: { ink: { solid: [...], bands: [[tone,
[polys]], …] } } }) and out/<name>-sep-check.png (reference | recomposed from the coverages | the
plates).
"""
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage import measure

PAPER = np.array([244, 226, 197], np.float64)
INKS = {  # the kit's inks (styles/magazine-ad/ad.js): rgb at full coverage over white
    'orange': np.array([246, 107, 31], np.float64),
    'turquoise': np.array([31, 158, 195], np.float64),
    'black': np.array([21, 21, 22], np.float64),
}
NAMES = list(INKS)
LEVELS = [0.1, 0.22, 0.34, 0.46, 0.58, 0.7, 0.82]   # band floors; a band prints at its middle
SOLID = 0.86
SIGMA = 1.2          # px at 1280: about half a screen cell
LINE = 0.32          # black coverage that counts as line art (fine hairs included)
SIMPLIFY = 0.6       # px tolerance of the tone polygons


def coverages(img):
    D = -np.log(np.clip(img, 1, 255) / PAPER)                      # density over the paper
    D = np.maximum(D, 0)
    M = np.stack([-np.log(INKS[n] / 255) for n in NAMES], 1)       # 3 × 3: channel × ink
    h, w, _ = D.shape
    X = D.reshape(-1, 3).T                                          # 3 × N
    best = np.full((3, X.shape[1]), 0.0)
    err = np.full(X.shape[1], np.inf)
    # every subset of inks, solved exactly or in least squares; keep the non-negative fit with
    # the smallest residual
    subsets = [(0, 1, 2), (0, 1), (0, 2), (1, 2), (0,), (1,), (2,)]
    for s in subsets:
        A = M[:, s]
        c, *_ = np.linalg.lstsq(A, X, rcond=None)
        ok = (c >= -1e-6).all(0)
        r = ((A @ c - X) ** 2).sum(0)
        better = ok & (r < err - 1e-9)
        full = np.zeros((3, X.shape[1]))
        full[list(s)] = c
        best[:, better] = full[:, better]
        err[better] = r[better]
    C = np.clip(best, 0, 1).T.reshape(h, w, 3)
    return C


def recompose(C):
    out = np.ones(C.shape[:2] + (3,)) * PAPER
    for i, n in enumerate(NAMES):
        c = C[..., i:i + 1]
        out *= 1 - c + c * INKS[n] / 255
    return out


def polys(mask, scale=1.0, minarea=4.0, tol=None):
    """Closed polygons around True regions (outer and hole rings), in reference pixels."""
    m = np.pad(mask.astype(np.float64), 1)
    out = []
    for c in measure.find_contours(m, 0.5):
        c = measure.approximate_polygon(c, (tol if tol is not None else SIMPLIFY) * scale)
        if len(c) < 3:
            continue
        x, y = c[:, 1] - 1, c[:, 0] - 1
        area = 0.5 * abs(np.dot(x, np.roll(y, 1)) - np.dot(y, np.roll(x, 1)))
        if area < minarea * scale * scale:
            continue
        out.append([[round(float(a) / scale, 1), round(float(b) / scale, 1)] for a, b in zip(x, y)])
    return out


def main():
    src, out = sys.argv[1], sys.argv[2]
    name = os.path.basename(out)
    img = np.asarray(Image.open(src).convert('RGB')).astype(np.float64)
    h, w, _ = img.shape
    C = coverages(img)
    plates = {}
    for i, n in enumerate(NAMES):
        c = C[..., i]
        # a pixel's fitted coverage is in density; a screen's tone is the share of area under ink,
        # which averages reflectance: convert on the channel this ink absorbs most, then blur
        a = (INKS[n] / 255).min()
        lin = (1 - a ** c) / (1 - a)
        tone = ndi.gaussian_filter(lin, SIGMA)
        # paper stays paper: where no ink at all lies within 2 px (an eye's white, a tooth, a
        # highlight), the blurred tone must not creep in
        tone = np.where(ndi.maximum_filter(c, size=5) < 0.12, 0, tone)
        p = {'solid': [], 'bands': []}
        if n == 'black':
            up = np.asarray(Image.fromarray((c * 255).astype(np.uint8)).resize((w * 2, h * 2), Image.BICUBIC)) / 255.0
            line = up > LINE
            p['solid'] = polys(line, 2.0, 2.0, 0.3)
            # the black's screens: tone where there is no line art
            lineb = ndi.binary_dilation(line[::2, ::2], iterations=1)
            tone = np.where(lineb, 0, tone)
            # the black only screens where it means to (shadows, the sack): no stray dots on skin
            tone = np.where(tone < 0.2, 0, tone)
        else:
            solid = ndi.binary_opening(tone > SOLID, iterations=1)
            p['solid'] = polys(solid, 1.0, 6.0)
            tone = np.where(solid, 0, tone)
        # nested regions tone >= L_k, each filled (even-odd) over the last with alpha a_k, so that
        # the stack reaches the band's middle tone T_k: 1 - prod(1 - a_j) = T_k
        T = [(LEVELS[k] + (LEVELS[k + 1] if k + 1 < len(LEVELS) else 0.95)) / 2 for k in range(len(LEVELS))]
        for k, lo in enumerate(LEVELS):
            a = T[k] if k == 0 else 1 - (1 - T[k]) / (1 - T[k - 1])
            pl = polys(tone >= lo, 1.0, 10.0)
            if pl:
                p['bands'].append([round(a, 4), pl])
        plates[n] = p
    os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
    with open(out + '.js', 'w') as f:
        f.write('// Generated by tools/separate.py from ' + os.path.basename(src) + ': the reference split into its\n')
        f.write('// three inks and written as polygons (reference pixels). Do not edit by hand.\n')
        f.write('var SEP = globalThis.SEP || (globalThis.SEP = {});\n')
        f.write(f"SEP[{json.dumps(name)}] = " + json.dumps({'w': w, 'h': h, 'levels': LEVELS, 'plates': plates}, separators=(',', ':')) + ';\n')
    R = recompose(C)
    err = np.abs(R - img).mean()
    vis = [img, R] + [np.repeat((255 * (1 - C[..., i:i + 1])), 3, 2) for i in range(3)]
    top = np.concatenate(vis[:2], 1)
    bot = np.concatenate([np.asarray(Image.fromarray(v.astype(np.uint8)).resize((w * 2 // 3, h * 2 // 3))) for v in vis[2:]], 1)
    bot = np.pad(bot, ((0, 0), (0, max(0, 2 * w - bot.shape[1])), (0, 0)), constant_values=40)[:, :2 * w]
    sheet = np.concatenate([top, bot], 0)
    os.makedirs('out', exist_ok=True)
    Image.fromarray(np.clip(sheet, 0, 255).astype(np.uint8)).save(os.path.join('out', name + '-sep-check.png'))
    n_pts = sum(len(pp) for pl in plates.values() for pp in pl['solid']) + sum(len(pp) for pl in plates.values() for _, b in pl['bands'] for pp in b)
    print(f'{name}: mean recomposition error {err:.1f}/255, {n_pts} points, {os.path.getsize(out + ".js") // 1024} KB')


if __name__ == '__main__':
    main()
