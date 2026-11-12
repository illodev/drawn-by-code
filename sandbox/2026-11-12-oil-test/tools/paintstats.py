# python3 tools/paintstats.py image[@x,y,w,h as fractions] ...
# Paint statistics of an image: tonal range, colour of the darks and lights, saturation,
# and how broken the colour is (variation inside small tiles, in lightness and in chroma).
import sys, numpy as np
from PIL import Image
def stats(path, crop=None):
    im = Image.open(path).convert('RGB')
    if crop:
        w, h = im.size; x, y, cw, ch = crop
        im = im.crop((int(x*w), int(y*h), int((x+cw)*w), int((y+ch)*h)))
    w, h = im.size
    im = im.resize((800, int(800*h/w)), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    lum = a @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    mx, mn = a.max(2), a.min(2)
    sat = np.where(mx > 0, (mx-mn)/np.maximum(mx, 1), 0)
    p = np.percentile(lum, [1, 5, 50, 95, 99])
    dk = a[lum <= np.percentile(lum, 8)].mean(0); lt = a[lum >= np.percentile(lum, 92)].mean(0)
    # opponent chroma axes
    rg = a[..., 0]-a[..., 1]; by = (a[..., 0]+a[..., 1])/2-a[..., 2]
    T = 10
    H, W = lum.shape; H2, W2 = H//T*T, W//T*T
    tile = lambda z: z[:H2, :W2].reshape(H2//T, T, W2//T, T).transpose(0, 2, 1, 3).reshape(-1, T*T)
    sl = tile(lum).std(1); sc = np.sqrt(tile(rg).var(1)+tile(by).var(1))
    hexs = lambda c: '#%02x%02x%02x' % tuple(int(round(v)) for v in c)
    return dict(lum=[round(float(v)) for v in p], darks=hexs(dk), lights=hexs(lt), sat=round(float(np.median(sat)), 2), sat90=round(float(np.percentile(sat, 90)), 2),
                brokenL=round(float(np.median(sl)), 1), brokenC=round(float(np.median(sc)), 1))
for arg in sys.argv[1:]:
    path, _, c = arg.partition('@')
    crop = [float(v) for v in c.split(',')] if c else None
    print(path.split('/')[-1], c, stats(path, crop))
