"""Repaints a cut of a cast sheet in the drawn neon manner of the user's reference: a few flat
inks per material (skin, hair, white cloth, pink cloth, prints) from the reference's measured
palette, chosen by the sheet's own light and shade, and the sheet's line thickened into a
brush-weight ink.

  python3 -I tools/neonize.py private/ref/her-1.png 1569,1924,13,1095 out.png [--light 1.0]

Palette measured on the reference (k-means, 14 clusters): magenta #e106d3, navy #0f0138,
salmon #f45a7f, deep blue #0e0558, violet #7407f0, blue #0f0ff1, indigo #200887, purple
#ad19b0, plum #7a1581, cyan #67deef; orange/gold accents by eye.
"""
import sys, numpy as np
from PIL import Image

src, box, out = sys.argv[1], sys.argv[2], sys.argv[3]
x0, x1, y0, y1 = map(int, box.split(','))
full = np.array(Image.open(src).convert('RGBA')).astype(np.float32)
M = 12                                                  # margin: the crown of the head is not cut flat
x0, y0 = max(0, x0 - M), max(0, y0 - M); x1, y1 = min(full.shape[1] - 1, x1 + M), min(full.shape[0] - 1, y1 + M)
im = full[y0:y1 + 1, x0:x1 + 1].copy()
# keep only the largest connected piece of the figure (a box from a sheet catches the edges of
# the neighbouring views)
solid0 = im[..., 3] > 100
lab = np.zeros(solid0.shape, np.int32); cur = 0; sizes = {}
for sy, sx in zip(*np.nonzero(solid0)):
    if lab[sy, sx]: continue
    cur += 1; stack = [(sy, sx)]; lab[sy, sx] = cur; n = 0
    while stack:
        yy, xx = stack.pop(); n += 1
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = yy + dy, xx + dx
            if 0 <= ny < lab.shape[0] and 0 <= nx < lab.shape[1] and solid0[ny, nx] and not lab[ny, nx]:
                lab[ny, nx] = cur; stack.append((ny, nx))
    sizes[cur] = n
keep = max(sizes, key=sizes.get)
grow = lab == keep
for _ in range(2):                                       # with its soft edge
    grow = grow | np.roll(grow, 1, 0) | np.roll(grow, -1, 0) | np.roll(grow, 1, 1) | np.roll(grow, -1, 1)
im[~grow] = 0
rgb, a = im[..., :3] / 255, im[..., 3] / 255
H = lambda h: np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255
INK = H('#0b0230')
RAMPS = {   # [deep shadow, shadow, the flat base tone, light, highlight]: the sheets are a flat
            # base tone with one shadow tone, so each pixel is placed against its material's median
    'skin': [H('#4a0a8a'), H('#ad19b0'), H('#e106d3'), H('#f45a7f'), H('#f9a03a')],
    'hair': [H('#0b0230'), H('#0e0558'), H('#200887'), H('#3a1ad0'), H('#7407f0')],
    'white': [H('#200887'), H('#3a10c8'), H('#7407f0'), H('#e106d3'), H('#ff8ad8')],
    'pink': [H('#4a0a8a'), H('#ad19b0'), H('#e106d3'), H('#ff5ab8'), H('#ffb0e0')],
    'gold': [H('#7a1581'), H('#f45a7f'), H('#f9a03a'), H('#ffd25a'), H('#fff0a0')],
    'other': [H('#0e0558'), H('#200887'), H('#7407f0'), H('#e106d3'), H('#f45a7f')],
}
mx, mn = rgb.max(-1), rgb.min(-1)
L = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
# the tones are chosen on a softened light (5 px box), so stubble and shading make zones, not speckle
k = 5; pad = np.pad(L, k // 2, mode='edge'); Ls = np.zeros_like(L)
for dy in range(k):
    for dx in range(k): Ls += pad[dy:dy + L.shape[0], dx:dx + L.shape[1]]
Ls /= k * k
S = np.where(mx > 0, (mx - mn) / (mx + 1e-6), 0)
r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
d = mx - mn + 1e-6
hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
ink = (L < 0.16) | ((L < 0.3) & (S < 0.35) & (hue > 240))
# a dark area wider than a line (its interior after a 3 px erosion) is a dark fill (black hair),
# painted in the hair inks; only its rim stays ink
er = ink.copy()
for _ in range(3):
    er = er & np.roll(er, 1, 0) & np.roll(er, -1, 0) & np.roll(er, 1, 1) & np.roll(er, -1, 1)
darkFill = er.copy()
for _ in range(2):
    darkFill = darkFill | (np.roll(darkFill, 1, 0) & ink) | (np.roll(darkFill, -1, 0) & ink) | (np.roll(darkFill, 1, 1) & ink) | (np.roll(darkFill, -1, 1) & ink)
ink = ink & ~darkFill
cls = np.full(L.shape, 'other', object)
cls[(hue >= 4) & (hue < 42) & (S > 0.22) & (L >= 0.25)] = 'skin'
cls[(S < 0.16) & (L >= 0.55)] = 'white'
cls[((hue >= 300) | (hue < 8)) & (S > 0.35) & (L >= 0.3)] = 'pink'
cls[(hue >= 40) & (hue < 62) & (S > 0.55) & (L >= 0.45)] = 'gold'
cls[(L < 0.42) & ~ink & ((hue < 40) | (hue > 330))] = 'hair'          # auburn and black hair, brows
cls[(L < 0.32) & ~ink & (S < 0.45)] = 'hair'
cls[darkFill] = 'hair'
# prints on his shirt: keep their hue family as neon
teal = (hue >= 150) & (hue < 200) & (S > 0.3)
yell = (hue >= 45) & (hue < 70) & (S > 0.4) & (L >= 0.55)
out_rgb = np.zeros_like(rgb)
lift = float(sys.argv[sys.argv.index('--light') + 1]) if '--light' in sys.argv else 1.0
# --white magenta: white cloth in the magenta inks (her jacket), so it parts from her violet hair
if '--white' in sys.argv and sys.argv[sys.argv.index('--white') + 1] == 'magenta':
    RAMPS['white'] = [H('#4a0a8a'), H('#ad19b0'), H('#e106d3'), H('#ff6ad0'), H('#ffb0e8')]
for name, ramp in RAMPS.items():
    m = cls == name
    if not m.any(): continue
    med = np.median(Ls[m])
    idx = np.clip(np.round((Ls - med) / 0.075 * lift).astype(int) + 2, 0, 4)
    for i, c in enumerate(ramp):
        out_rgb[m & (idx == i)] = c
out_rgb[teal] = H('#67deef'); out_rgb[yell] = H('#ffd25a')
# the line: the sheet's dark line, thickened by 2 px into ink
ink_m = ink & (a > 0.5)
thick = ink_m.copy()
for dy in (-2, -1, 0, 1, 2):
    for dx in (-2, -1, 0, 1, 2):
        if dx * dx + dy * dy <= 5:
            thick |= np.roll(np.roll(ink_m, dy, 0), dx, 1)
out_rgb[thick] = INK
# an outer contour of ink round the whole figure, 3 px
solid = a > 0.5
grow = solid.copy()
for dy in range(-3, 4):
    for dx in range(-3, 4):
        if dx * dx + dy * dy <= 10:
            grow |= np.roll(np.roll(solid, dy, 0), dx, 1)
edge = grow & ~solid
res = np.dstack([out_rgb, np.where(solid, 1.0, 0.0)])
res[edge] = np.concatenate([INK, [1.0]])
Image.fromarray((res * 255).astype(np.uint8), 'RGBA').save(out)
print('wrote', out, res.shape[1], 'x', res.shape[0])
