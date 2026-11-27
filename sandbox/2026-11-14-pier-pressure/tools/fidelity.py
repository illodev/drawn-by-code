"""Compare a sheet with its drawing in code (dev/fidelity/scene.js rendered 3840 wide, on white).

  python3 -I tools/fidelity.py <sheet> <render.png> <out.png> x,y,w,h [x,y,w,h …]
      each box of the sheet (pixels) at 4×, the sheet above, the render below
  python3 -I tools/fidelity.py <sheet> <render.png> <out.png> --worst 8
      finds the places that differ most by itself (both blurred a little, so a line a pixel off
      does not count, a lost detail or a wrong colour does), prints them and shows them the same way
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
sheet = Image.open(sys.argv[1]).convert('RGB'); ren = Image.open(sys.argv[2]).convert('RGB'); k = ren.width / sheet.width
args = sys.argv[4:]
if args[0] == '--worst':
    small = ren.resize(sheet.size, Image.LANCZOS)
    A = np.asarray(sheet.filter(ImageFilter.GaussianBlur(1.6))).astype(np.float32)
    B = np.asarray(small.filter(ImageFilter.GaussianBlur(1.6))).astype(np.float32)
    d = np.abs(A - B).max(-1)
    lb, n = ndi.label(ndi.binary_dilation(d > 34, iterations=3))
    score = ndi.sum(d * (d > 34), lb, range(1, n + 1))
    args = []
    print(f'{sys.argv[1]}: mean difference {d.mean():.2f}, {100 * (d > 34).mean():.2f}% of the sheet off by more than 34')
    for i in np.argsort(-score)[:int(sys.argv[5])]:
        sl = ndi.find_objects(lb)[i]
        cy, cx = (sl[0].start + sl[0].stop) // 2, (sl[1].start + sl[1].stop) // 2
        w = min(150, max(70, sl[1].stop - sl[1].start + 30)); h = min(150, max(70, sl[0].stop - sl[0].start + 30))
        x = int(np.clip(cx - w // 2, 0, sheet.width - w)); y = int(np.clip(cy - h // 2, 0, sheet.height - h))
        print(f'  {x},{y},{w},{h}  weight {score[i]:.0f}')
        args.append(f'{x},{y},{w},{h}')
tiles = []
for a in args:
    x, y, w, h = map(int, a.split(','))
    z = 4
    A = sheet.crop((x, y, x + w, y + h)).resize((w * z, h * z), Image.LANCZOS)
    B = ren.crop((int(x * k), int(y * k), int((x + w) * k), int((y + h) * k))).resize((w * z, h * z), Image.LANCZOS)
    t = Image.new('RGB', (w * z, h * z * 2 + 6), 'white'); t.paste(A, (0, 0)); t.paste(B, (0, h * z + 6)); tiles.append(t)
out = Image.new('RGB', (sum(t.width + 8 for t in tiles), max(t.height for t in tiles)), (255, 0, 255))
x = 0
for t in tiles:
    out.paste(t, (x, 0)); x += t.width + 8
out.save(sys.argv[3]); print(out.size)
