"""Mark every enclosed pure-white region of a sheet, each with a point inside it, to decide by eye
which are the page seen through a figure (they go in the pose's `holes` in tools/tocode.py) and
which are white paint (eyes, teeth, cloth):
  python3 -I tools/holes.py <sheet> <out.png> [smallest region, px, default 40]
A gap that is closed all round (an arm, its sleeve and its hand against the shorts) is never
reached by the page from outside: only this list makes it page. Do it for EVERY sheet."""
import sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
im = Image.open(sys.argv[1]).convert('RGB'); a = np.asarray(im).astype(int)
least = int(sys.argv[3]) if len(sys.argv) > 3 else 40
pure = a.min(-1) >= 250; lb, k = ndi.label(pure)
edge = set(np.unique(np.concatenate([lb[0], lb[-1], lb[:, 0], lb[:, -1]])))
sz = ndi.sum(pure, lb, range(1, k + 1)); d = ImageDraw.Draw(im); res = []
for i, s in enumerate(sz):
    if (i + 1) not in edge and s >= least:
        ys, xs = np.nonzero(lb == i + 1); j = len(xs) // 2
        im.paste((255, 0, 255), mask=Image.fromarray(((lb == i + 1) * 255).astype(np.uint8)))
        res.append((int(xs[j]), int(ys[j]), int(s)))
for x, y, s in res:
    d.text((x + 4, y - 5), f'{x},{y}', fill=(0, 0, 255))
im.save(sys.argv[2]); print(res)
