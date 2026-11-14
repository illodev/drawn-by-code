"""Measure a flat-colour character sheet into vector data the engine can draw.

    python3 -I tools/trace.py ref/kit-sheet.webp cast/kit-ref.js kit stand=60,0,470,720 jump=540,0,740,720

For each pose (a box x,y,w,h of the sheet): classify every pixel to the sheet's palette, clean
the anti-aliasing slivers, let each flat colour run under the ink to the middle of the line,
and trace every colour and the ink as polygons (sub-pixel contours of a smoothed mask). Writes
a JS file that adds the poses to the global `Ref` (see cast/ref.js).
"""
import sys, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage import measure

# the sheet's flat colours, measured by clustering (tools: see review.md round 9)
PALETTE = {
    'ink': '#0c0907', 'white': '#ffffff', 'hair': '#a2ba43', 'skin': '#b37d4e', 'teal': '#427175',
    'tealDeep': '#28484b', 'red': '#b22c35', 'yellow': '#f6c52a', 'magenta': '#a1205f',
    'tread': '#735c4b', 'treadDeep': '#5a4236', 'mouth': '#482424', 'tongue': '#d7767e', 'plaster': '#cd9c70',
    'wood': '#966636', 'grey': '#b7b2af', 'deck': '#3b3c3b',
}
# what each is painted with (the page is cream, so cloth white is the kit's white)
PAINT = dict(PALETTE, white='#fffdf6', ink='#120c0e')
UP = 3


def trace(mask, tol):
    f = ndi.gaussian_filter(mask.astype(np.float32), 1.3)
    out = []
    for c in measure.find_contours(np.pad(f, 2), 0.5):
        if len(c) < 8:
            continue
        p = measure.approximate_polygon(c - 2, tol)
        if len(p) < 4:
            continue
        a = 0.5 * abs(np.dot(p[:-1, 1], p[1:, 0]) - np.dot(p[1:, 1], p[:-1, 0]))
        if a < 6 * UP * UP:
            continue
        out.append([[round(float(x) / UP, 1), round(float(y) / UP, 1)] for y, x in p[:-1]])
    return out


def measure_pose(im, box):
    """names, under (a flat colour for every pixel, -2 = the page), inkm (the lines), at UP times the sheet."""
    x, y, w, h = box
    crop = im.crop((x, y, x + w, y + h)).resize((w * UP, h * UP), Image.BICUBIC)
    a = np.asarray(crop).astype(np.int32)
    names = list(PALETTE)
    rgb = lambda n: np.array([int(PALETTE[n][i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float32)
    ink = names.index('ink'); white = names.index('white')
    DARK = ['tealDeep', 'treadDeep', 'mouth', 'deck']
    light = [n for n in names if n != 'ink' and n not in DARK]
    # A line is ink mixed with the colour beside it (anti-aliasing). For every light colour c, how
    # much ink a pixel holds if it is a mix of c and ink (alpha), and how far it is from that mix;
    # the best-fitting c wins. alpha >= 0.5 is ink. (Nearest-colour alone turns thin lines, which
    # are never pure black, into slivers of the dark fills.)
    a = a.astype(np.float32)
    best = np.full(a.shape[:2], 1e9, np.float32); alpha = np.zeros(a.shape[:2], np.float32); lab = np.zeros(a.shape[:2], np.int32)
    for n in light:
        c = rgb(n); v = rgb('ink') - c
        al = np.clip(((a - c) * v).sum(-1) / (v * v).sum(), 0, 1)
        res = np.sqrt((((a - c) - al[..., None] * v) ** 2).sum(-1)) + 14 * al
        m = res < best
        best[m] = res[m]; alpha[m] = al[m]; lab[m] = names.index(n)
    # the dark fills (the inside of the mouth, of a trouser leg, the deck) are dark but thick:
    # inside what survives an opening wider than any line, take the nearest dark colour or ink
    dark = alpha >= 0.3
    core = ndi.binary_opening(dark, structure=np.ones((3, 3)), iterations=int(3.4 * UP))
    dn = DARK + ['ink']
    dd = np.stack([((a - rgb(n)) ** 2).sum(-1) for n in dn], -1).argmin(-1)
    dlab = np.array([names.index(n) for n in dn])[dd]
    lab = np.where(core, dlab, np.where(alpha >= 0.5, ink, lab))
    inkm = lab == ink
    # clean each flat colour: slivers of anti-aliasing go, the gaps are refilled from the nearest colour
    clean = np.full(lab.shape, -1)
    for k, nme in enumerate(names):
        if k == ink:
            continue
        m = ndi.binary_opening(lab == k, structure=np.ones((3, 3)), iterations=2)
        lb, n = ndi.label(m)
        if n:
            sizes = ndi.sum(m, lb, range(1, n + 1))
            m = np.isin(lb, 1 + np.nonzero(sizes >= (60 if nme in ('plaster', 'wood', 'grey', 'treadDeep') else 22) * UP * UP)[0])
        clean[m] = k
    # the page: white connected to the box's border
    wl, _ = ndi.label((clean == white) | ((clean == -1) & ~inkm & (lab == white)))
    edge = np.unique(np.concatenate([wl[0], wl[-1], wl[:, 0], wl[:, -1]]))
    page = np.isin(wl, edge[edge > 0])
    clean[page] = -2
    # every remaining pixel (ink included) takes the nearest flat colour: fills meet under the lines
    known = clean != -1
    idx = ndi.distance_transform_edt(~known, return_distances=False, return_indices=True)
    full = clean[idx[0], idx[1]]
    # ... but the page never creeps under the outline: there the neighbour colour does
    known2 = full != -2
    idx2 = ndi.distance_transform_edt(~known2, return_distances=False, return_indices=True)
    under = np.where(inkm & (full == -2), full[idx2[0], idx2[1]], full)
    return names, under, inkm


def pose(im, box):
    x, y, w, h = box
    names, under, inkm = measure_pose(im, box)
    layers = []
    order = ['white', 'skin', 'hair', 'teal', 'tealDeep', 'red', 'yellow', 'magenta', 'tread', 'treadDeep', 'wood', 'grey', 'deck', 'mouth', 'tongue', 'plaster']
    for nme in order:
        k = names.index(nme)
        polys = trace(under == k, 0.9)
        if polys:
            layers.append({'c': PAINT[nme], 'p': polys})
    layers.append({'c': PAINT['ink'], 'p': trace(inkm, 0.55), 'ink': 1})
    return {'w': w, 'h': h, 'layers': layers}


def main():
    src, dst, who = sys.argv[1:4]
    im = Image.open(src).convert('RGB')
    poses = {}
    for arg in sys.argv[4:]:
        name, box = arg.split('=')
        poses[name] = pose(im, [int(v) for v in box.split(',')])
        n = sum(len(p) for l in poses[name]['layers'] for p in l['p'])
        print(name, len(poses[name]['layers']), 'layers', n, 'points')
    js = ('// Generated by tools/trace.py from %s: do not edit by hand. The measured vector data of\n'
          '// the approved concept sheet (flat colours under the ink, then the ink), one entry per pose.\n'
          '(window.Ref ??= {}).%s = %s;\n') % (src, who, json.dumps(poses, separators=(',', ':')))
    open(dst, 'w').write(js)
    print(dst, len(js) // 1024, 'KB')


if __name__ == '__main__':
    main()
