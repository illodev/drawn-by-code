# A coarse tone map of a woodcut reference: the share of the block carved in each cell,
# written as a JS data file. A pixel counts as carved by how far its luminance lies from the
# ink towards the paper (or towards the ochre, on the ochre block), so the soft edges and
# starved greys count too. Coarse on purpose (cells of 16 px at 1280): it measures how much
# is carved where, never where each cut lies (a cut is 2-5 px wide).
import sys, numpy as np
from PIL import Image
src, out, cell = sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 16
a = np.asarray(Image.open(src).convert('RGB').resize((1280, 720))).astype(np.float32)
L = a.mean(2); mx, mn = a.max(2), a.min(2); sat = (mx - mn) / (mx + 1)
INK, PAPER, OCHRE = 18.0, 196.0, 152.0
ochre = (sat > 0.42) & (a[..., 0] > a[..., 2] + 60)
top = np.where(ochre, OCHRE, PAPER)
c = np.clip((L - INK) / (top - INK), 0, 1)
nx, ny = 1280 // cell, (720 + cell - 1) // cell
g = np.zeros((ny, nx))
for j in range(ny):
    for i in range(nx):
        g[j, i] = c[j*cell:(j+1)*cell, i*cell:(i+1)*cell].mean()
with open(out, 'w') as f:
    f.write('// Measured on ref/street-lit.png by tools/tonemap.py: the share of the block carved\n')
    f.write(f'// in each {cell} px cell (at 1280 x 720), luminance between ink and paper (or ochre).\n')
    f.write(f'globalThis.STREET_TONE = {{ cell: {cell}, nx: {nx}, ny: {ny}, v: [\n')
    for j in range(ny): f.write('    ' + ','.join(f'{v:.2f}'.lstrip('0') if v > 0.004 else '0' for v in g[j]) + ',\n')
    f.write('] };\n')
print(nx, ny, 'mean', g.mean().round(3))
