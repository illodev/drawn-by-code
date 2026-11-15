"""Kit's plaster on her six key poses: what is a pixel wide on the sheets (its outline, the pad's
two seams) cannot be measured as lines, so it is drawn by rule from what can: the plaster's own
patch of colour. Its contour becomes the outline, and the seams cross it a third and two thirds
along. Writes cast/kit-drop-details.js (hand-editable, like cast/kit-details.js).
  python3 -I tools/plaster.py"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage import measure

HERE = os.path.dirname(os.path.abspath(__file__))
UP = 6
# pose: (sheet, the pose's box, a point on the plaster) in sheet pixels
POSES = {
    'tuck': ('a', (30, 0, 430, 535), (205, 245)), 'reach': ('a', (390, 30, 485, 670), (603, 305)),
    'contact': ('a', (862, 80, 418, 620), (1035, 327)), 'crouch': ('b', (10, 255, 488, 400), (206, 419)),
    'rise': ('b', (462, 75, 428, 580), (650, 260)), 'proud': ('b', (888, 10, 390, 650), (1106, 189)),
}
out = ["// pier-pressure · Kit's plaster on her six key poses, on top of the drawings measured from",
       '// the sheets (cast/kit-drop-drawn.js): its outline and the pad\'s two seams, which are a pixel',
       '// wide there. Written by tools/plaster.py from the plaster\'s patch of colour on each sheet;',
       '// edit a point here like any drawing. Load after kit-drop-drawn.js.',
       '(() => {', "    const PLASTER = '#e0b183', SEAM = '#8f6238';"]
for name, (sh, (bx, by, bw, bh), (px, py)) in POSES.items():
    im = Image.open(os.path.join(HERE, '..', 'ref', f'kit-drop-{sh}.webp')).convert('RGB')
    R = 26
    a = np.asarray(im.crop((px - R, py - R, px + R, py + R)).resize((2 * R * UP, 2 * R * UP), Image.BICUBIC)).astype(np.float32)
    L = a @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    # lighter than her skin, not white, and warm
    m = (L > 150) & (L < 228) & (a[..., 0] - a[..., 2] > 50)
    m = ndi.binary_opening(m, iterations=2)
    lb, n = ndi.label(m)
    if not n:
        raise SystemExit(f'no plaster found on {name}')
    com = ndi.center_of_mass(m, lb, range(1, n + 1))
    size = ndi.sum(m, lb, range(1, n + 1))
    k = 1 + max(range(n), key=lambda i: size[i] if np.hypot(com[i][0] - R * UP, com[i][1] - R * UP) < 14 * UP else 0)
    m = ndi.binary_fill_holes(ndi.binary_closing(lb == k, iterations=3))
    c = max(measure.find_contours(ndi.gaussian_filter(m.astype(np.float32), 2.0), 0.5), key=len)
    poly = measure.approximate_polygon(c, 0.5 * UP)[:-1]
    to = lambda r, cc: [round(float(cc) / UP + px - R - bx, 1), round(float(r) / UP + py - R - by, 1)]
    band = [to(r, cc) for r, cc in poly]
    ys, xs = np.nonzero(m)
    P = np.stack([xs, ys], 1).astype(np.float32); mean = P.mean(0)
    w, v = np.linalg.eigh(np.cov((P - mean).T))
    ax, nx = v[:, 1], v[:, 0]
    t = (P - mean) @ ax; u = (P - mean) @ nx
    seams = []
    for f in (0.36, 0.64):
        t0 = t.min() + f * (t.max() - t.min())
        sel = np.abs(t - t0) < 0.6
        if sel.sum() < 2:
            continue
        p0 = mean + ax * t0 + nx * (u[sel].min() + 0.2 * UP); p1 = mean + ax * t0 + nx * (u[sel].max() - 0.2 * UP)
        seams.append([to(p0[1], p0[0]), to(p1[1], p1[0])])
    print(name, 'plaster', int(m.sum() / UP / UP), 'px²,', len(band), 'points', flush=True)
    f = lambda pts: '[' + ', '.join(f'[{p[0]:g}, {p[1]:g}]' for p in pts) + ']'
    out += [f"    Drawn.add('kit', '{name}', (part, S, L) => {{", "        part('body');", f'        const band = {f(band)};',
            '        S(PLASTER, band);', '        L(band, 0.9, 1, SEAM);'] + [f'        L({f(s)}, 0.8, 0, SEAM);' for s in seams] + ['    });']
out += ['})();', '']
open(os.path.join(HERE, '..', 'cast', 'kit-drop-details.js'), 'w').write('\n'.join(out))
