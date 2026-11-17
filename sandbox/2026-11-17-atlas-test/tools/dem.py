# Fetches real terrain for dev/dem/scene.js (the atlas relief on a DEM): open Terrarium tiles
# (AWS Terrain Tiles, https://registry.opendata.aws/terrain-tiles/; height = R·256 + G + B/256
# − 32768 m), here 5 × 3 tiles at z11 over the Guadarrama range (≈ 58 m a pixel), written to
# out/dem/ (not committed: third-party data) as the kit's uint16 heights and tint.
#   python3 tools/dem.py [z x0 y0 nx ny]
import sys, os, io, json, urllib.request
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
z, x0, y0, nx, ny = [int(v) for v in sys.argv[1:6]] if len(sys.argv) > 5 else (11, 1000, 766, 5, 3)
rows = []
for y in range(y0, y0 + ny):
    row = []
    for x in range(x0, x0 + nx):
        png = urllib.request.urlopen(f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png').read()
        a = np.asarray(Image.open(io.BytesIO(png)).convert('RGB')).astype(float)
        row.append(a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768)
    rows.append(np.concatenate(row, 1))
h = np.concatenate(rows, 0)
H, W = min(h.shape[0], 720), min(h.shape[1], 1280)
oy, ox = (h.shape[0] - H) // 2, (h.shape[1] - W) // 2
h = h[oy:oy + H, ox:ox + W]
lat = np.degrees(np.arctan(np.sinh(np.pi * (1 - 2 * (y0 + ny / 2) / 2 ** z))))
mpp = 156543.03 * np.cos(np.radians(lat)) / 2 ** z
ex = 2.2                                              # vertical exaggeration for the shading
zz = (h - h.min()) / mpp * ex
os.makedirs('out/dem', exist_ok=True)
(zz / zz.max() * 65535).astype('<u2').tofile('out/dem/height.u16')
t = ndi.gaussian_filter(h, 6)
lo, hi = np.percentile(t, [10, 99])
(np.clip((t - lo) / (hi - lo), 0, 1) * 65535).astype('<u2').tofile('out/dem/tint.u16')
json.dump({'size': [W, H], 'hmax': float(zz.max()), 'azimuth': 315, 'elevation': 45}, open('out/dem/height.json', 'w'))
print('DEM', W, 'x', H, '· %.1f m/px' % mpp, '· %.0f..%.0f m' % (h.min(), h.max()))
