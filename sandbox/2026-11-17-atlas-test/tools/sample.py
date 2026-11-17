# Packs a small piece of the plate into the atlas kit as its sample terrain (for the template,
# the README cover and the site, which cannot fetch an experiment's data): the reservoir, the
# dam and the head of the valley, map px 100..740 × 20..380, at 3/4 size, heights 16-bit and
# the tint 8-bit, base64, with the lake's shore and the canal in the sample's own pixels.
#   python3 tools/sample.py → ../../styles/atlas/sample.js
import json, base64
import numpy as np
from scipy import ndimage as ndi
meta = json.load(open('data/height.json')); vec = json.load(open('data/vectors.json'))
W, H = meta['size']
h = np.fromfile('data/height.u16', '<u2').reshape(H, W).astype(float) / 65535
t = np.fromfile('data/tint.u16', '<u2').reshape(H, W).astype(float) / 65535
x0, y0, x1, y1, s = 100, 20, 740, 380, 0.75
crop = lambda a: ndi.zoom(a[y0:y1, x0:x1], s, order=3)
hc, tc = crop(h), crop(t)
lo, hi = hc.min(), hc.max()
hn = (hc - lo) / (hi - lo)
sh, sw = hn.shape
pt = lambda p: [round((p[0] - x0) * s, 1), round((p[1] - y0) * s, 1)]
shore = [pt(p) for p in vec['shore']]
canal = [pt(d['c']) for d in vec['dashes']][:20]
rivers = [{'pts': [pt(p) for p in r['pts']], 'w': [round(v * s, 2) for v in r['w']]} for r in vec['rivers']
          if any(x0 <= p[0] < x1 and y0 <= p[1] < y1 for p in r['pts'])]
b64 = lambda a: base64.b64encode(a.tobytes()).decode()
js = f"""// A sample of the atlas style's terrain: a piece of the plate measured for the style test
// (sandbox/2026-11-17-atlas-test, tools/sample.py): the reservoir, its dam and the head of the
// valley, {sw}×{sh} map px. Heights uint16 (0..65535 = 0..hmax), the tint uint8, base64.
const AtlasSample = (() => {{
    const dec = (s, T) => {{ const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new T(u.buffer); }};
    const D = {{
        size: [{sw}, {sh}], hmax: {round((hi - lo) * meta['hmax'] * s, 3)}, azimuth: {meta['azimuth']}, elevation: {meta['elevation']},
        shore: {json.dumps(shore)},
        canal: {json.dumps(canal)},
        rivers: {json.dumps(rivers)},
        height: '{b64((hn * 65535).astype('<u2'))}',
        tint: '{b64((np.clip(tc, 0, 1) * 255).astype(np.uint8))}',
    }};
    // the terrain as Atlas.relief takes it
    function terrain() {{
        const u = dec(D.height, Uint16Array), v = dec(D.tint, Uint8Array), n = D.size[0] * D.size[1];
        const data = new Float32Array(n), tint = new Float32Array(n);
        for (let i = 0; i < n; i++) {{ data[i] = u[i] / 65535; tint[i] = v[i] / 255; }}
        return {{ w: D.size[0], h: D.size[1], data, tint, hmax: D.hmax, azimuth: D.azimuth, elevation: D.elevation }};
    }}
    return {{ terrain, shore: D.shore, canal: D.canal, rivers: D.rivers, size: D.size }};
}})();
"""
open('../../styles/atlas/sample.js', 'w').write(js)
print('sample', sw, sh, 'bytes', len(js), 'rivers', len(rivers))
