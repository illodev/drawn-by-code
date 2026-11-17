# Mean colour of terrain and per-tile colour error (as the gate measures it) of our still
# against the reference, to steer the palette by numbers.
#   python3 tools/score.py [our still]
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
a = np.asarray(Image.open('ref/atlas-4.png').convert('RGB')).astype(float)
b = np.asarray(Image.open(sys.argv[1] if len(sys.argv) > 1 else 'out/stills/t_1.00s.png').convert('RGB').resize((1280, 720))).astype(float)
m = np.asarray(Image.open('data/mask.png')) == 0
print('terrain mean · ref', a[m].mean(0).round(1), '· ours', b[m].mean(0).round(1))
box = lambda x: np.stack([ndi.uniform_filter(x[..., k], 29) for k in range(3)], -1)
d = np.abs(box(a) - box(b)).mean(-1)
T = np.array([[d[gy * 120:(gy + 1) * 120, gx * 213:(gx + 1) * 213].mean() for gx in range(6)] for gy in range(6)])
print(T.round(0)); print('median %.1f' % np.median(T))
