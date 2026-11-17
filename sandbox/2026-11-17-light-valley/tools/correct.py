# One pass of the tone calibration: per 16 px cell, how much more (or less) a render
# carved than the reference (soft share: luminance between ink and paper, or ochre); the
# difference is folded into a correction map that the regions add to their target.
#   python correct.py ref.png render.png corr.js [rate]
import sys, os, re, numpy as np
from PIL import Image
ref, ours, out = sys.argv[1:4]; rate = float(sys.argv[4]) if len(sys.argv) > 4 else 0.8
def soft(p):
    a = np.asarray(Image.open(p).convert('RGB').resize((1280, 720))).astype(np.float32)
    L = a.mean(2); mx, mn = a.max(2), a.min(2); sat = (mx - mn) / (mx + 1)
    top = np.where((sat > 0.42) & (a[..., 0] > a[..., 2] + 60), 152.0, 196.0)
    return np.clip((L - 18) / (top - 18), 0, 1)
c = 16; nx, ny = 1280 // c, 720 // c
R = soft(ref)[:ny*c].reshape(ny, c, nx, c).mean((1, 3)); O = soft(ours)[:ny*c].reshape(ny, c, nx, c).mean((1, 3))
C = np.zeros((ny, nx))
if os.path.exists(out):
    v = re.search(r'v: \[(.*)\]', open(out).read(), re.S).group(1)
    C = np.array([float(x) for x in v.replace('\n', '').split(',') if x.strip()]).reshape(ny, nx)
C = np.clip(C + rate * (R - O), -0.4, 0.4)
with open(out, 'w') as f:
    f.write('// The tone calibration (tools/correct.py): per 16 px cell, what the regions add to the\n')
    f.write('// measured tone so the print carves what the reference carved (render vs reference).\n')
    f.write(f'globalThis.STREET_CORR = {{ cell: {c}, nx: {nx}, ny: {ny}, v: [\n')
    for j in range(ny): f.write('    ' + ','.join(f'{x:.2f}' for x in C[j]) + ',\n')
    f.write('] };\n')
print('residual mean |R-O|', np.abs(R - O).mean().round(3), ' correction mean', C.mean().round(3))
