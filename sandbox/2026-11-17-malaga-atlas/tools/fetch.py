# Fetches the open data the Málaga plate is drawn from, into private/ (third-party data, not
# committed; run this to rebuild it):
#   · relief: AWS Terrain Tiles (Terrarium, https://registry.opendata.aws/terrain-tiles/:
#     SRTM, EU-DEM © Copernicus and others), z12 ≈ 30 m a pixel at 36.7° N
#   · the map: OpenStreetMap standard tiles, z13 (© OpenStreetMap contributors, ODbL; the
#     tiles CC BY-SA), a few dozen fetched once with an identifying User-Agent, read into
#     masks by their colours (sea, inland water, built-up land, main roads)
#   · rivers: the real courses of the Guadalhorce and the Guadalmedina (Nominatim geometry)
#
#   python3 tools/fetch.py → private/{dem.npy, osm13.png, nominatim-*.json}
import os, io, json, time, math, urllib.request, urllib.parse
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(HERE, '..', 'private')
os.makedirs(P, exist_ok=True)
UA = {'User-Agent': 'drawn-by-code-atlas/1.0 (one-off educational map test)'}
F = json.load(open(os.path.join(HERE, 'frame.json')))
Z, W, H = F['z'], F['size'][0], F['size'][1]

def px(lon, lat, z):
    s = 256 * 2 ** z
    return (lon + 180) / 360 * s, (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * s

cx, cy = px(F['centre'][0], F['centre'][1], Z)
X0, Y0 = cx - W / 2, cy - H / 2                    # the frame's top-left, global px at z
F['origin'] = [X0, Y0]
json.dump(F, open(os.path.join(HERE, 'frame.json'), 'w'), indent=1)

def get(url, path):
    if os.path.exists(path): return open(path, 'rb').read()
    for k in range(4):
        try:
            b = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()
            open(path, 'wb').write(b); time.sleep(0.15); return b
        except Exception as e:
            print('retry', url, e); time.sleep(2 * (k + 1))
    raise SystemExit('failed ' + url)

def mosaic(z, tmpl, cache, decode):
    k = 2 ** (z - Z)                                 # this zoom's px per frame px
    x0, y0, x1, y1 = X0 * k, Y0 * k, (X0 + W) * k, (Y0 + H) * k
    tx0, ty0, tx1, ty1 = int(x0 // 256), int(y0 // 256), int(x1 // 256), int(y1 // 256)
    rows = []
    for ty in range(ty0, ty1 + 1):
        row = []
        for tx in range(tx0, tx1 + 1):
            b = get(tmpl.format(z=z, x=tx, y=ty), os.path.join(cache, f'{z}_{tx}_{ty}.png'))
            row.append(decode(Image.open(io.BytesIO(b))))
        rows.append(np.concatenate(row, 1))
    m = np.concatenate(rows, 0)
    ox, oy = int(round(x0 - tx0 * 256)), int(round(y0 - ty0 * 256))
    return m[oy:oy + int(H * k), ox:ox + int(W * k)]

os.makedirs(os.path.join(P, 'tiles'), exist_ok=True)
dem = mosaic(Z, 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png', os.path.join(P, 'tiles'),
             lambda im: (lambda a: a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768)(np.asarray(im.convert('RGB')).astype(np.float64)))
np.save(os.path.join(P, 'dem.npy'), dem)
print('dem', dem.shape, '%.0f..%.0f m' % (dem.min(), dem.max()))
osm = mosaic(Z + 1, 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', os.path.join(P, 'tiles'),
             lambda im: np.asarray(im.convert('RGB')))
Image.fromarray(osm.astype(np.uint8)).save(os.path.join(P, 'osm13.png'))
print('osm', osm.shape)
for q in F['rivers']:
    url = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q': q, 'format': 'jsonv2', 'limit': 1, 'polygon_geojson': 1})
    get(url, os.path.join(P, 'nominatim-' + q.replace(' ', '_') + '.json')); time.sleep(1.1)
print('rivers', F['rivers'])
