// (An experiment, not in the pipeline: on a relief read off a picture it left flat pits.)
// Carves the measured relief (data/height-measured.u16, soft: read off shading) into sharp
// ridges and valleys with the atlas kit's stream-power erosion, keeping its layout: the
// measured rivers are scored in first so the water takes their valleys, the plain and the lake
// are the base level, and the run is short (incision, not a new landscape).
//
//   node tools/erode.mjs [iters] → data/height.u16, data/height.json (hmax updated), out/eroded.png
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const here = path.dirname(new URL(import.meta.url).pathname), D = path.join(here, '..', 'data');
// the kit's file is a browser script (a global): run it and take the global
const AtlasErode = new Function(fs.readFileSync(path.join(here, '..', '..', '..', 'styles', 'atlas', 'erode.js'), 'utf8') + '\nreturn AtlasErode;')();
const L = JSON.parse(fs.readFileSync(path.join(here, 'layout.json')));
const meta = JSON.parse(fs.readFileSync(path.join(D, 'height.json')));
const vec = JSON.parse(fs.readFileSync(path.join(D, 'vectors.json')));
const [W, H] = meta.size, N = W * H;
const E = L.erode ?? {};
const u16 = new Uint16Array(fs.readFileSync(path.join(D, 'height-measured.u16')).buffer.slice(0));
const hm = meta.hmaxMeasured ?? meta.hmax;
const z0 = new Float32Array(N);
for (let i = 0; i < N; i++) z0[i] = (u16[i] / 65535) * hm;
// rasterise a polyline's neighbourhood into a mask (distance ≤ r)
function strokeMask(mask, pts, r) {
    for (let k = 1; k < pts.length; k++) {
        const [x0, y0] = pts[k - 1], [x1, y1] = pts[k];
        const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2) + 1;
        for (let s = 0; s <= n; s++) {
            const x = x0 + ((x1 - x0) * s) / n, y = y0 + ((y1 - y0) * s) / n;
            for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) {
                const xx = Math.round(x + dx), yy = Math.round(y + dy);
                if (xx < 0 || yy < 0 || xx >= W || yy >= H || dx * dx + dy * dy > r * r) continue;
                mask[yy * W + xx] = 1;
            }
        }
    }
}
const inside = (pts, x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
// the rivers are scored in, so the drainage takes the measured valleys
const riv = new Uint8Array(N);
for (const r of vec.rivers) strokeMask(riv, r.pts, 1.2);
for (let i = 0; i < N; i++) if (riv[i]) z0[i] -= E.score ?? 2;
// base level: the frame's edge, the plain, the lake
const base = new Uint8Array(N);
const lake = new Uint8Array(N);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (x <= L.map[0] || y <= L.map[1] || x >= L.map[2] - 1 || y >= L.map[3] - 1) base[i] = 1;
    if (inside(L.plain, x, y)) base[i] = 1;
    if (inside(vec.shore, x, y)) { base[i] = 1; lake[i] = 1; }
}
// uplift where the measured relief is high (its broad form), so ridges keep growing while the
// rivers cut: the network settles into the measured valleys, the slopes into real ones
const uplift = new Float32Array(N);
{
    let mx = 0;
    for (let i = 0; i < N; i++) mx = Math.max(mx, z0[i]);
    for (let i = 0; i < N; i++) uplift[i] = (E.uplift ?? 0.02) * Math.pow(Math.max(0, z0[i]) / mx, E.upliftPow ?? 1);
}
const t0 = Date.now();
const { z, area } = AtlasErode.erode({ w: W, h: H, height: z0, uplift, base, K: E.K ?? 0.0006, m: E.m ?? 0.4, dt: E.dt ?? 1, iters: +(process.argv[2] ?? E.iters ?? 60), diffusion: E.diffusion ?? 0, progress: (i, n) => i % 10 === 0 && process.stdout.write(`${i}/${n} `) });
console.log(`\neroded in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
let lo = Infinity, hi = -Infinity;
for (let y = L.map[1]; y < L.map[3]; y++) for (let x = L.map[0]; x < L.map[2]; x++) { const v = z[y * W + x]; if (v < lo) lo = v; if (v > hi) hi = v; }
const out = new Uint16Array(N);
for (let i = 0; i < N; i++) out[i] = Math.round(Math.min(1, Math.max(0, (z[i] - lo) / (hi - lo))) * 65535);
fs.writeFileSync(path.join(D, 'height.u16'), Buffer.from(out.buffer));
meta.hmaxMeasured = hm;
meta.hmax = hi - lo;
fs.writeFileSync(path.join(D, 'height.json'), JSON.stringify(meta));
// a hillshade to look at
const e = (45 * Math.PI) / 180, l = -Math.SQRT1_2;
const px = Buffer.alloc(N);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, gx = (z[y * W + Math.min(W - 1, x + 1)] - z[y * W + Math.max(0, x - 1)]) / 2, gy = (z[Math.min(H - 1, y + 1) * W + x] - z[Math.max(0, y - 1) * W + x]) / 2;
    const s = (-gx * l * Math.cos(e) - gy * l * Math.cos(e) + Math.sin(e)) / Math.hypot(gx, gy, 1);
    px[i] = Math.max(0, Math.min(255, Math.round(s * 255)));
}
fs.writeFileSync(path.join(here, '..', 'out', 'eroded.gray'), px);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'gray', '-s', `${W}x${H}`, '-i', path.join(here, '..', 'out', 'eroded.gray'), path.join(here, '..', 'out', 'eroded.png')]);
console.log('hmax', meta.hmax.toFixed(1));
