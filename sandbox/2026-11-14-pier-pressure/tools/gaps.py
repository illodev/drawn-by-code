"""Page showing through a figure: python3 -I tools/gaps.py <sheet.png> <render of it on the same ground>

Counts the places well inside a figure on the sheet (six pixels in from its edge) where the
drawing in code shows the ground: a shape that was dropped or too thin to draw, a paint read as
page. Should be none; prints where they are, in sheet pixels.
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
BG = np.array([0, 255, 0])
sheet = Image.open(sys.argv[1]).convert('RGB'); ren = Image.open(sys.argv[2]).convert('RGB'); k = ren.width / sheet.width
a = np.asarray(ren).astype(int)
src = np.asarray(sheet.resize(ren.size, Image.LANCZOS)).astype(int)
page = np.abs(a - BG).max(-1) < 40
fig = ndi.binary_erosion(np.abs(src - BG).max(-1) > 120, iterations=int(round(2 * k)))
h = page & fig
lb, n = ndi.label(h)
sz = ndi.sum(h, lb, range(1, n + 1)) if n else []
big = [i for i in range(n) if sz[i] >= 2 * k * k]
print(f'{sys.argv[1]}: {len(big)} gaps of two sheet pixels or more ({n} specks, {int(h.sum() / (k * k))} sheet pixels in all)' + ''.join(f'\n  at {int(c[1] / k)},{int(c[0] / k)}  {sz[i] / (k * k):.1f} px' for i, c in ((i, ndi.center_of_mass(lb == i + 1)) for i in big[:12])))
