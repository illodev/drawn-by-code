# Measures a heightfield from a shaded-relief map image (the reference still), so the
# atlas renderer can draw the same mountains with its own shading, tints and contours.
#
#   python3 tools/relief.py ref/atlas-4.png data/   → data/height.u16, data/tint.u16, data/height.json,
#                                                    data/mask.png, out/relief-preview.png
#
# Shape from shading with the light known (the reference is lit from the upper left): a
# slope facing the light by an angle a has shade sin(e + a), e the light's elevation, so the
# luminance gives the slope ALONG the light at every pixel. The heightfield is the least-
# squares surface whose derivative along the light matches it, held together across the
# light by a weak smoothness and pulled flat where there is no relief (plains, the lake).
# What is not terrain (water, labels, the city, the red line, the frame) is inpainted in the
# luminance first (a valley floor under a river reads flat), so no cliff opens along it.
# Solved coarse to fine (a quarter, a half, then full size, each from the one before).
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from scipy.sparse import diags, vstack, csr_matrix
from scipy.sparse.linalg import lsqr
import pyamg

src, outdir = sys.argv[1], sys.argv[2]
os.makedirs(outdir, exist_ok=True)
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float64)
H, W, _ = im.shape
R, G, B = im[..., 0], im[..., 1], im[..., 2]
Y = (0.3 * R + 0.59 * G + 0.11 * B) / 255
L = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'layout.json')))

# --- what is not terrain ------------------------------------------------------------------
yy, xx = np.mgrid[0:H, 0:W]
blue = (B > R + 15) & (B > G - 4)                      # rivers, lake, waterlines
red = (R > G + 50) & (R > B + 50)                      # the canal
notTerrain = ndi.binary_dilation(blue | red, iterations=2)
for k, (x0, y0, x1, y1) in enumerate(L['boxes']):     # labels, the scale bar, the dam
    if k == len(L['boxes']) - 1: notTerrain[y0:y1, x0:x1] = True; continue   # the dam: all of it
    ink = np.zeros((H, W), bool); ink[y0:y1, x0:x1] = Y[y0:y1, x0:x1] < 0.5   # lettering: its ink only
    notTerrain |= ndi.binary_dilation(ink, iterations=2)
    lettering = ndi.binary_dilation(ink, iterations=2) | (lettering if 'lettering' in dir() else np.zeros((H, W), bool))
cx, cy, cr = L['city']
city = (xx - cx) ** 2 + (yy - cy) ** 2 < cr ** 2
notTerrain |= city
fx0, fy0, fx1, fy1 = L['map']
frame = np.ones((H, W), bool); frame[fy0:fy1, fx0:fx1] = False
notTerrain |= frame
lb = ndi.binary_opening((B > R + 15) & (Y > 0.72), iterations=3)
lab, n = ndi.label(lb)
sizes = ndi.sum(lb, lab, range(1, n + 1))
lake = ndi.binary_fill_holes(ndi.binary_dilation(lab == (1 + int(np.argmax(sizes))), iterations=2))

# --- shading -------------------------------------------------------------------------------
Ym = ndi.median_filter(Y, size=5)                      # contour lines and grain out
Ym = ndi.gaussian_filter(Ym, 0.8)
def inpaint(v, ok):
    """Fill v where ok is False from its surroundings (normalized convolution, coarse last)."""
    out = v.copy(); have = ok.astype(float)
    for s in (2, 4, 8, 16, 32, 64):
        num = ndi.gaussian_filter(out * have, s); den = ndi.gaussian_filter(have, s)
        fill = (have < 0.5) & (den > 1e-3)
        out[fill] = num[fill] / den[fill]; have = np.maximum(have, fill.astype(float))
    return out
Ym = inpaint(Ym, ~notTerrain & ~lake)
# the large scale is the tint: the plate is coloured by height (green valleys and plains,
# cream and brown heights), so greenness read at a broad scale is an inverted elevation map
med = lambda a: ndi.median_filter(a, size=5)
Rm, Gm, Bm = med(R), med(G), med(B)
green = (Gm - (Rm + Bm) / 2) / np.maximum(0.3 * Rm + 0.59 * Gm + 0.11 * Bm, 1)
green = inpaint(green, ~notTerrain & ~lake & ~ndi.binary_dilation(red, iterations=6))
glp = ndi.gaussian_filter(green, L['tintBlur'])
lo, hi = np.percentile(glp[~frame], [2, 98])
E = np.clip((hi - glp) / (hi - lo), 0, 1)
# the small scale is the shading, with the tint's own brightness taken out (a high pass)
Yhp = Ym - ndi.gaussian_filter(Ym, L['highPass'])
var = ndi.gaussian_filter(Ym ** 2, 10) - ndi.gaussian_filter(Ym, 10) ** 2
relief = np.clip((np.sqrt(np.maximum(var, 0)) - 0.025) / 0.05, 0, 1)
relief = ndi.gaussian_filter(relief, 6)
flat = 0.0
e = np.radians(L['elevation'])
shade = np.clip(np.sin(e) + Yhp * L['gain'], -0.2, 0.999)
alpha = np.arcsin(np.clip(shade, -0.999, 0.999)) - e    # tilt toward the light
slope = np.tan(np.clip(alpha, -1.2, 1.2))               # height per pixel along the light
az = np.radians(L['azimuth'])
lx, ly = np.sin(az), -np.cos(az)       # unit vector toward the light, image coords (y down)

def solve(slope, wdata, flatw, smoothw, x0=None, iters=600, step=1.0):
    """Least-squares h (in full-size pixel units) on this grid; step = full px per cell."""
    h_, w_ = slope.shape; N = h_ * w_
    idx = np.arange(N).reshape(h_, w_)
    def diff(a, b):
        m = a.size
        return csr_matrix((np.r_[-np.ones(m), np.ones(m)], (np.r_[np.arange(m), np.arange(m)], np.r_[a, b])), shape=(m, N))
    Dx = diff(idx[:, :-1].ravel(), idx[:, 1:].ravel())
    Dy = diff(idx[:-1, :].ravel(), idx[1:, :].ravel())
    rx = (np.arange(h_ - 1)[:, None] * (w_ - 1) + np.arange(w_ - 1)[None, :]).ravel()
    ry = (np.arange(h_ - 1)[:, None] * w_ + np.arange(w_ - 1)[None, :]).ravel()
    Dl = Dx[rx] * lx + Dy[ry] * ly
    wd = wdata[:-1, :-1].ravel()
    # Dl is h(x + l) - h(x) with l TOWARD the light; a lit face faces the light, so it
    # descends toward it: Dl h = -slope (per cell: × step)
    sx_ = smoothw[:, :-1].ravel(); sy_ = smoothw[:-1, :].ravel()
    A = vstack([diags(wd) @ Dl, diags(sx_) @ Dx, diags(sy_) @ Dy, diags(flatw.ravel())])
    b = np.r_[-wd * slope[:-1, :-1].ravel() * step, np.zeros(Dx.shape[0] + Dy.shape[0]), np.zeros(N)]
    # the normal equations are symmetric positive definite: algebraic multigrid solves them
    M = (A.T @ A).tocsr(); rhs = A.T @ b
    ml = pyamg.smoothed_aggregation_solver(M, symmetry='symmetric', max_coarse=500)
    res = []
    x = ml.solve(rhs, x0=None if x0 is None else x0.ravel(), tol=1e-9, maxiter=iters, accel='cg', residuals=res)
    print('  amg', len(res), 'iterations, residual %.2e' % (res[-1] / max(res[0], 1e-30)), flush=True)
    return x.reshape(h_, w_)

# the plain is flat: its fields are a tint, not relief (a measured polygon, soft at its edge)
from skimage.draw import polygon as poly_fill
plain = np.zeros((H, W), bool)
pr, pc = poly_fill(np.array(L['plain'])[:, 1], np.array(L['plain'])[:, 0], (H, W)); plain[pr, pc] = True
plainSoft = ndi.gaussian_filter(plain.astype(float), 6)
wdata = ((~notTerrain & ~lake) * (0.25 + 0.75 * relief) + (notTerrain & ~lake & ~frame) * 0.15) * (1 - plainSoft)
flatw = L['detailPull'] + (1 - relief) * L['flat'] + lake * 0.05 + plainSoft * 0.6
# the floor along a river is painted pale (a tint, not a lit slope): hold it level there
rivers = ndi.binary_dilation(blue & ~lake, iterations=1)
band = ndi.gaussian_filter(ndi.binary_dilation(rivers, iterations=L['band']).astype(float), 1.5)
smoothw = L['smooth'] + band * L['bandSmooth'] + lake * 1.0
wdata = wdata * (1 - 0.8 * band)
az = np.radians(L['azimuth']); lx, ly = np.sin(az), -np.cos(az)
base = L['tintHeight'] * ndi.gaussian_filter(E, 2)
base = base * (1 - plainSoft) + ndi.gaussian_filter(base, 40) * plainSoft
gyb, gxb = np.gradient(base)
slope = slope + (gxb * lx + gyb * ly)          # the solve below is for d = h - base
h = None
for f in (1,):
    zoom = lambda a: ndi.zoom(a, 1 / f, order=1) if f > 1 else a
    s, wd, fw, sw = zoom(slope), zoom(wdata), zoom(flatw), zoom(smoothw)
    x0 = None
    if h is not None:
        x0 = ndi.zoom(h, (s.shape[0] / h.shape[0], s.shape[1] / h.shape[1]), order=1)
    h = solve(s, wd, fw, sw, x0, iters=L['iters'], step=f)
    print('scale 1/%d' % f, h.shape, 'range %.1f..%.1f' % (h.min(), h.max()), flush=True)
# the plate's faces are flat and its ridges sharp: sharpen the detail a little (unsharp mask)
h = h + L['sharpen'] * (h - ndi.gaussian_filter(h, L['sharpenSigma']))
h = h + base
# the fine shading, integrated straight along the light lines with a leaky sum (no smoothing
# to blur it, no drift since it is a detail): it gives back the plate's sharp facets
from scipy.signal import lfilter
Yf = inpaint(ndi.gaussian_filter(ndi.median_filter(Y, size=3), 0.6), ~notTerrain & ~lake)
hpf = Yf - ndi.gaussian_filter(Yf, 4)
shf = np.clip(np.sin(e) + hpf * L['gain'], -0.5, 0.999)
sl = np.tan(np.clip(np.arcsin(shf) - e, -1.1, 1.1))
sl[ndi.binary_dilation(notTerrain | lake, iterations=1)] = 0   # nothing carried across lettering or water
ang = L['fineAngle']             # rotation that lays the light along the rows (measured: 45)
rot = ndi.rotate(sl, ang, reshape=True, order=1, mode='constant')
hr = lfilter([1.0], [1.0, -float(np.exp(-1 / L['fineLeak']))], rot, axis=1)
back = ndi.rotate(hr, -ang, reshape=True, order=1, mode='constant')
oy, ox = (back.shape[0] - H) // 2, (back.shape[1] - W) // 2
hf = back[oy:oy + H, ox:ox + W]
hf = hf - ndi.gaussian_filter(hf, 6)
hf = ndi.gaussian_filter(hf, 0.5) * (1 - ndi.gaussian_filter((notTerrain | lake).astype(float), 2)) * (1 - plainSoft)
h = h + L['fine'] * hf
# where lettering was, the ground is the ground around it (no plateau with a shadowed edge)
lm = ndi.binary_dilation(lettering, iterations=4)
hin = inpaint(h, ~lm)
blend = ndi.gaussian_filter(lm.astype(float), 1.5)
h = h * (1 - blend) + hin * blend
h -= h[~frame].min()      # never clip: a clipped floor reads as a flat plate

# --- outputs ------------------------------------------------------------------------------
hmax = float(h[~frame].max())
hn = np.clip(h / hmax, 0, 1)
(hn * 65535).astype('<u2').tofile(os.path.join(outdir, 'height.u16'))   # what the kit loads
# the tint's own elevation (the broad greenness), which the atlas colours by
(np.clip(ndi.gaussian_filter(E, 2), 0, 1) * 65535).astype('<u2').tofile(os.path.join(outdir, 'tint.u16'))
Image.fromarray(((lake * 1 + notTerrain * 2) * 80).astype(np.uint8)).save(os.path.join(outdir, 'mask.png'))
json.dump({'hmax': hmax, 'flat': flat, 'size': [W, H], 'azimuth': L['azimuth'], 'elevation': L['elevation']}, open(os.path.join(outdir, 'height.json'), 'w'))
gy, gx = np.gradient(h)
nl = np.sqrt(gx * gx + gy * gy + 1)
hs = np.clip((-gx * lx * np.cos(e) - gy * ly * np.cos(e) + np.sin(e)) / nl, 0, 1)
prev = np.concatenate([Ym, hs * Ym.mean() / max(1e-6, hs.mean())], 1)
Image.fromarray((np.clip(prev, 0, 1) * 255).astype(np.uint8)).save(os.path.join(os.path.dirname(os.path.abspath(outdir)), 'out', 'relief-preview.png'))
print('flat', flat, 'hmax', hmax)
