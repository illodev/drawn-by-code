"""Eyes with more than one pupil, on the sheets: python3 -I tools/eyes.py [sheet …] [--out crops.jpg] [--raw]
(--raw: the sheets as generated; without it, as mended by tools/green.py)

A generator now and then draws two pupils in one eye (or eyes inside a pair of glasses that has
left the face), and a drawing copied faithfully from its sheet keeps them. On the sheet itself:
an eye is a roundish region of white closed in by lines; its pupils are the blobs of black
inside its outline that are thicker than a line. Prints every eye with two or more and saves
them enlarged to look at (the count has false alarms: a lash, a lid; the look decides).
"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage.morphology import convex_hull_image, disk
HERE = os.path.dirname(os.path.abspath(__file__))
Z = 3
MENDED = None
if '--raw' not in sys.argv:
    import importlib.util
    _argv, sys.argv = sys.argv, ['green', 'none']
    sys.path.insert(0, HERE)
    _spec = importlib.util.spec_from_file_location('green', os.path.join(HERE, 'green.py'))
    _g = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_g)
    MENDED, sys.argv = _g.clean, _argv


def scan(sheet):
    im = Image.open(os.path.join(HERE, '..', 'ref', sheet + '.png')).convert('RGB')
    if MENDED:
        im = MENDED(im, sheet)  # (as the converter reads it: what has been mended is not reported again)
    a = np.asarray(im.resize((im.width * Z, im.height * Z), Image.BICUBIC)).astype(np.int32)
    white = a.min(-1) >= 232
    dark = (a.max(-1) < 70)
    lb, n = ndi.label(white)
    out = []
    for j, sl in enumerate(ndi.find_objects(lb), 1):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        m = lb[sl] == j
        ar = m.sum() / (Z * Z)
        if not (120 < ar < 5000) or not (0.5 < w / h < 2.0) or m.sum() < 0.5 * h * w:
            continue
        g = (slice(max(0, sl[0].start - 4 * Z), sl[0].stop + 4 * Z), slice(max(0, sl[1].start - 4 * Z), sl[1].stop + 4 * Z))
        mm = lb[g] == j
        hull = convex_hull_image(ndi.binary_dilation(mm, iterations=Z))
        if mm.sum() < 0.72 * hull.sum():
            continue  # (not an eye: a sleeve, a row of teeth with gaps)
        blob = ndi.binary_opening(dark[g] & hull, disk(int(2.0 * Z)))
        bl, k = ndi.label(blob)
        sizes = [int((bl == i).sum() / (Z * Z)) for i in range(1, k + 1)]
        pup = [(i, s) for i, s in enumerate(sizes, 1) if s >= 10]
        if len(pup) >= 2:
            cy, cx = ndi.center_of_mass(mm)
            out.append((int((g[1].start + cx) / Z), int((g[0].start + cy) / Z), [s for _, s in pup]))
    return im, out


if __name__ == '__main__':
    args = sys.argv[1:]
    save = args[args.index('--out') + 1] if '--out' in args else None
    names = [x for i, x in enumerate(args) if x not in ('--out', '--raw') and (i == 0 or args[i - 1] != '--out')] or sorted(f[:-4] for f in os.listdir(os.path.join(HERE, '..', 'ref')) if f.endswith('.png') and os.path.exists(os.path.join(HERE, '..', 'cast', f[:-4] + '-drawn.js')))
    tiles = []
    for s in names:
        im, found = scan(s)
        for x, y, pup in found:
            print(f'{s}: an eye at {x},{y} with {len(pup)} pupils (areas {pup})')
            tiles.append(im.crop((x - 45, y - 40, x + 45, y + 40)).resize((360, 320), Image.LANCZOS))
    print(f'{len(tiles)} eyes to look at in {len(names)} sheets')
    if save and tiles:
        W = Image.new('RGB', (min(6, len(tiles)) * 364, ((len(tiles) + 5) // 6) * 324), (20, 20, 20))
        for i, t in enumerate(tiles):
            W.paste(t, ((i % 6) * 364, (i // 6) * 324))
        W.save(save, quality=90)
