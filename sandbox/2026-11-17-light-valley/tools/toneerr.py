# How closely a render carves the measured tone: soft carved share per cell (luminance
# between ink and paper, or ochre), ours vs the reference; and per 12 x 12 tile, the bias
import sys, numpy as np
from PIL import Image
def soft(p):
    a = np.asarray(Image.open(p).convert('RGB').resize((1280, 720))).astype(np.float32)
    L = a.mean(2); mx, mn = a.max(2), a.min(2); sat = (mx - mn) / (mx + 1)
    top = np.where((sat > 0.42) & (a[..., 0] > a[..., 2] + 60), 152.0, 196.0)
    return np.clip((L - 18) / (top - 18), 0, 1)
A, B = soft(sys.argv[1]), soft(sys.argv[2])
for c in (16, 32, 64):
    ny, nx = 720 // c, 1280 // c
    a = A[:ny*c, :nx*c].reshape(ny, c, nx, c).mean((1, 3)); b = B[:ny*c, :nx*c].reshape(ny, c, nx, c).mean((1, 3))
    print(f'cell {c}: mean |diff| {np.abs(a-b).mean():.3f}  bias (ours-ref) {(b-a).mean():+.3f}  corr {np.corrcoef(a.ravel(), b.ravel())[0,1]:.2f}')
if len(sys.argv) > 3:
    print('bias per tile x100 (ours - ref)')
    for gy in range(12):
        print(' '.join(f'{(B[gy*60:(gy+1)*60, gx*106:(gx+1)*106].mean() - A[gy*60:(gy+1)*60, gx*106:(gx+1)*106].mean())*100:+4.0f}' for gx in range(12)))
