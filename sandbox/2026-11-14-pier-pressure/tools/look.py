"""See what the measuring makes of a piece of a sheet, before any drawing is written:
  python3 -I tools/look.py <who> <pose> <out.png> x,y,w,h      (sheet pixels)
Left to right at 8×: the sheet, the lines found (black) over the paint found under them, the
paint alone (magenta = the page)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image
import measure as M
import tocode as T
args = sys.argv[1:]
who, pose, out = args[:3]
x, y, w, h = map(int, args[3].split(','))
im, pal, box, holes = T.source(who, pose)
names, paint, under, inkm, a, _ = M.measure_pose(im, box, pal, holes)
rgb = lambda hx: [int(hx[i:i + 2], 16) for i in (1, 3, 5)]
tab = np.array([rgb(p) for p in paint] + [[255, 0, 255]], np.uint8)
U = M.UP
r0, c0 = (y - box[1]) * U, (x - box[0]) * U
sl = (slice(r0, r0 + h * U), slice(c0, c0 + w * U))
P = tab[np.where(under[sl] < 0, len(paint), under[sl])]
Lm = P.copy(); Lm[inkm[sl]] = (0, 0, 0)
S = np.asarray(im.crop((x, y, x + w, y + h)).resize((w * U, h * U), Image.NEAREST))
big = lambda arr: Image.fromarray(arr).resize((w * 8, h * 8), Image.NEAREST)
o = Image.new('RGB', (w * 24 + 16, h * 8), 'white')
for i, arr in enumerate((S, Lm, P)):
    o.paste(big(arr), (i * (w * 8 + 8), 0))
o.save(out)
used = sorted(set(under[sl].ravel().tolist()))
print([(names[k], paint[k]) if k >= 0 else 'page' for k in used])
