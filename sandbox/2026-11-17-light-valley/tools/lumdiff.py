# Mean luminance per tile, ours minus the reference (+ = ours lighter), and white share per tile
import sys, numpy as np
from PIL import Image
ref = np.asarray(Image.open(sys.argv[1]).convert('L').resize((1280, 720))).astype(np.float32)
our = np.asarray(Image.open(sys.argv[2]).convert('L').resize((1280, 720))).astype(np.float32)
n = 12; h, w = 720 // n, 1280 // n
print('L ours-ref')
for gy in range(n):
    print(' '.join(f'{our[gy*h:(gy+1)*h, gx*w:(gx+1)*w].mean() - ref[gy*h:(gy+1)*h, gx*w:(gx+1)*w].mean():+4.0f}' for gx in range(n)))
print('white share ref | ours (%)')
for gy in range(n):
    print(' '.join(f'{(ref[gy*h:(gy+1)*h, gx*w:(gx+1)*w] > 110).mean()*100:3.0f}|{(our[gy*h:(gy+1)*h, gx*w:(gx+1)*w] > 110).mean()*100:<3.0f}' for gx in range(n)))
