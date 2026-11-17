"""Reads freehand line work off the reference sheet into polylines (the organic parts: rock,
coastline). A drawing by hand cannot be designed blind in code, so it is measured.

  python tools/trace.py <still.png> <out.js> <name> --box x,y,w,h [--thr 24] [--exclude x,y,w,h;…]
                        [--min 6] [--eps 0.55] [--scale 3]

The still is enlarged, the lines are what stands above the local ground, thinned to their
centre lines (skimage) and walked into paths; each path keeps how strong its line was.
Writes  Sheet.TRACE.<name> = [[strength, x0, y0, x1, y1, …], …]  in the still's pixels,
sorted left to right.
"""
import sys, json
import numpy as np
from PIL import Image, ImageFilter
from skimage.morphology import skeletonize, remove_small_objects
from skimage.filters import apply_hysteresis_threshold

args = sys.argv[1:]
src, out, name = args[:3]
def opt(k, d=None):
    return args[args.index('--' + k) + 1] if '--' + k in args else d
bx, by, bw, bh = map(float, opt('box').split(','))
thr, mn, eps, sc = float(opt('thr', 24)), float(opt('min', 6)), float(opt('eps', 0.55)), int(opt('scale', 3))
excl = [tuple(map(float, e.split(','))) for e in opt('exclude', '').split(';') if e]

pad = 12
im = Image.open(src).convert('L').crop((int(bx - pad), int(by - pad), int(bx + bw + pad), int(by + bh + pad)))
big = im.resize((im.width * sc, im.height * sc), Image.LANCZOS)
g = np.asarray(big).astype(float)
ground = np.asarray(big.filter(ImageFilter.MedianFilter(4 * sc + 1)).filter(ImageFilter.GaussianBlur(6 * sc))).astype(float)
line = g - ground
mask = apply_hysteresis_threshold(line, thr * 0.5, thr)  # a stroke found by its strong parts is followed through its faint ones
H, W = mask.shape
ox, oy = bx - pad, by - pad
yy, xx = np.mgrid[0:H, 0:W]
X, Y = xx / sc + ox, yy / sc + oy
mask &= (X >= bx) & (X <= bx + bw) & (Y >= by) & (Y <= by + bh)
for ex, ey, ew, eh in excl:
    mask &= ~((X >= ex) & (X <= ex + ew) & (Y >= ey) & (Y <= ey + eh))
mask = remove_small_objects(mask, max_size=int(mn * sc * sc))
sk = skeletonize(mask)

# walk the skeleton: from end points first, then whatever loops are left
pts = set(zip(*np.nonzero(sk)))
nb = lambda p: [(p[0] + dy, p[1] + dx) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if (dy or dx) and (p[0] + dy, p[1] + dx) in pts]
paths = []
def walk(start):
    path = [start]; pts.discard(start)
    while True:
        cand = nb(path[-1])
        if not cand: break
        if len(path) > 1:  # keep going the straightest way
            d = (path[-1][0] - path[-2][0], path[-1][1] - path[-2][1])
            cand.sort(key=lambda q: -((q[0] - path[-1][0]) * d[0] + (q[1] - path[-1][1]) * d[1]))
        path.append(cand[0]); pts.discard(cand[0])
    return path
ends = [p for p in list(pts) if len(nb(p)) == 1]
for e in ends:
    if e in pts: paths.append(walk(e))
while pts:
    paths.append(walk(next(iter(pts))))

def rdp(P, e):
    if len(P) < 3: return P
    a, b = np.array(P[0], float), np.array(P[-1], float); ab = b - a; L = np.hypot(*ab) or 1
    d = [abs((p[0] - a[0]) * ab[1] - (p[1] - a[1]) * ab[0]) / L for p in P[1:-1]]
    i = int(np.argmax(d))
    if d[i] <= e: return [P[0], P[-1]]
    return rdp(P[:i + 2], e)[:-1] + rdp(P[i + 1:], e)

res = []
for p in paths:
    if len(p) < mn * sc: continue
    s = float(np.mean([line[q] for q in p]))
    q = rdp([(c[1] / sc + ox, c[0] / sc + oy) for c in p], eps)
    res.append([round(min(1, s / 120), 2)] + [round(v, 1) for xy in q for v in xy])
res.sort(key=lambda r: min(r[1::2]))
with open(out, 'w') as f:
    f.write('// Traced from the reference sheet by tools/trace.py: [strength, x0, y0, x1, y1, …] per stroke.\n')
    f.write('Sheet.TRACE = Sheet.TRACE || {};\nSheet.TRACE.%s = %s;\n' % (name, json.dumps(res, separators=(',', ':')).replace('],[', '],\n[')))
print(name, len(res), 'strokes', sum((len(r) - 1) // 2 for r in res), 'points')
