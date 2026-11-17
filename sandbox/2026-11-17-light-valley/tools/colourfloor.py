# The detail gate's colour metric (box blur r = W/90, mean abs RGB difference per tile,
# median over 12 x 12 tiles) between two images, or between one image and itself shifted:
# how far apart two prints of the same tone can be when their cuts fall in other places.
import sys, numpy as np
from PIL import Image
def load(p): return np.asarray(Image.open(p).convert('RGB').resize((1280, 720))).astype(np.float32)
def box(a, r):
    c = np.cumsum(np.pad(a, ((r + 1, r), (0, 0), (0, 0)), mode='edge'), 0); a = (c[2 * r + 1:] - c[:-2 * r - 1]) / (2 * r + 1)
    c = np.cumsum(np.pad(a, ((0, 0), (r + 1, r), (0, 0)), mode='edge'), 1); return (c[:, 2 * r + 1:] - c[:, :-2 * r - 1]) / (2 * r + 1)
def metric(A, B, n=12):
    r = max(2, round(1280 / 90)); d = np.abs(box(A, r) - box(B, r)).mean(2)
    th, tw = 720 // n, 1280 // n
    v = sorted(d[j*th:(j+1)*th, i*tw:(i+1)*tw].mean() for j in range(n) for i in range(n))
    return v[len(v)//2], v[int(0.9*(len(v)-1))]
A = load(sys.argv[1])
if len(sys.argv) > 2: print('median, p90:', [round(x, 1) for x in metric(A, load(sys.argv[2]))])
for s in (4, 8, 12, 20):
    B = np.roll(np.roll(A, s, 1), s // 2, 0); print(f'shift {s:2d}px:', [round(x, 1) for x in metric(A, B)])
