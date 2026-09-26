// Model-based tracking of the three cats: for every drawing, the IK rig (cats.js jointsIK)
// is fitted to the reference by coordinate descent on
//   - the silhouette: the rig drawn as projected capsules and circles (fast, in 2D) against
//     the keyed mask, plus the ginger cat against the ginger pixels and the hat against the
//     black ones (so each cat fits its own body);
//   - the keypoints a pose model found (private/kp.json): eye midpoint, paws, feet, weighted
//     by their scores;
//   - smoothness (stay near the previous drawing) and a few priors (upright, feet apart).
// It starts from solve.mjs's poses (private/solved-poses.js) and writes
// private/tracked-poses.js (data read off the reference: never committed).
//   node sandbox/2026-09-25-felt-cats/track.mjs [--from d] [--to d] [--size 144] [--rounds 3]
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { findFfmpeg, parseArgs } from '../../engine/browser.mjs';

const DIR = path.dirname(new URL(import.meta.url).pathname), ROOT = path.join(DIR, '../..');
const { opt } = parseArgs(process.argv.slice(2));
const ctx = {};
vm.createContext(ctx);
for (const f of ['styles/felt3d/felt3d.js', 'sandbox/2026-09-25-felt-cats/cats.js', 'sandbox/2026-09-25-felt-cats/keys/segA.js', 'sandbox/2026-09-25-felt-cats/keys/segB.js', 'sandbox/2026-09-25-felt-cats/keys/segC.js', 'sandbox/2026-09-25-felt-cats/private/solved-poses.js', 'sandbox/2026-09-25-felt-cats/dance.js'])
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/^const (\w+) = /gm, 'var $1 = '), ctx);
const { Stage, Dance, Cats } = ctx;
const START = ctx.DANCE_FIT;
const KP = JSON.parse(fs.readFileSync(path.join(DIR, 'private/kp.json'), 'utf8'));
const W = Number(opt.size ?? 144), H = Math.round(W * 16 / 9), NPX = W * H;
const N = KP.length, FROM = Number(opt.from ?? 0), TO = Math.min(N - 1, Number(opt.to ?? N - 1)), ROUNDS = Number(opt.rounds ?? 3);
const F = 0.5 / Math.tan(Stage.CAM.fov / 2) * 1600, [CX, CY, CD] = Stage.CAM.cam;

// reference frames → class maps at W×H (cat, ginger, black)
const ff = findFfmpeg();
const raw = spawnSync(ff, ['-loglevel', 'error', '-i', path.join(DIR, 'out/reference.mp4'), '-vf', `scale=${W}:${H}:flags=area`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 30 }).stdout;
function refMaps(d) {
    const fi = Math.min(474, d * 2), o = fi * NPX * 3;
    const cat = new Uint8Array(NPX), gin = new Uint8Array(NPX), blk = new Uint8Array(NPX);
    for (let i = 0; i < NPX; i++) {
        const r = raw[o + i * 3], g = raw[o + i * 3 + 1], b = raw[o + i * 3 + 2];
        if (g > 150 && g - r > 60 && g - b > 60) continue;
        cat[i] = 1;
        if (Math.max(r, g, b) < 70) blk[i] = 1;
        else if (r - b > 35) gin[i] = 1;
    }
    return { cat, gin, blk };
}
// world → screen px at W×H, with the drawing's zoom
function projector(zoom) {
    const [Z, u, v] = zoom;
    return (p) => {
        const dz = CD - p[2];
        const X = 450 + (p[0] - CX) / dz * F, Y = 800 - (p[1] - CY) / dz * F;
        const Xz = u * 900 + (X - u * 900) * Z, Yz = v * 1600 + (Y - v * 1600) * Z;
        return [Xz * W / 900, Yz * H / 1600, F / dz * Z * W / 900];
    };
}
// the rig as 2D primitives: capsules [ax, ay, bx, by, r] per cat, in screen px
function prims(pose, c, P) {
    const J = Cats.jointsIK(pose), S = pose.scale ?? 1, root = [pose.x, 0, pose.z];
    const w = (i) => { const q = [J[i], J[i + 1], J[i + 2]]; return P([root[0] + (q[0] - root[0]) * S, q[1] * S, root[2] + (q[2] - root[2]) * S]); };
    const caps = [], hat = [];
    const cap = (i, j, r) => { const a = w(i), b = w(j); caps.push([a[0], a[1], b[0], b[1], r * S * (a[2] + b[2]) / 2]); };
    const pel = w(0), che = w(12), head = w(24);
    caps.push([pel[0], pel[1] + 0.02 * pel[2], pel[0], pel[1] - 0.06 * pel[2], 0.118 * S * pel[2]]); // belly
    caps.push([pel[0], pel[1], che[0], che[1], 0.098 * S * pel[2]]);
    caps.push([che[0], che[1], head[0], head[1], 0.08 * S * che[2]]);
    caps.push([head[0], head[1] + 0.02 * head[2], head[0], head[1] - 0.01 * head[2], 0.15 * S * head[2]]); // skull and cheeks
    cap(36, 39, 0.042); cap(39, 42, 0.036); cap(45, 48, 0.042); cap(48, 51, 0.036); // arms
    cap(54, 57, 0.055); cap(57, 60, 0.04); cap(63, 66, 0.055); cap(66, 69, 0.04); // legs
    cap(60, 60, 0.045); cap(69, 69, 0.045); // feet
    cap(72, 75, 0.032); cap(75, 78, 0.03); cap(78, 81, 0.028); cap(81, 84, 0.026); // tail
    // the ears: two small circles above the head, in the head's frame
    const Rh = J.slice(27, 36), hw = [J[24], J[25], J[26]];
    for (const s of [1, -1]) {
        const e = Felt3D_app(Rh, [s * 0.1, 0.1, 0]);
        const p = w2(hw, e, root, S, P);
        caps.push([p[0], p[1], p[0], p[1], 0.045 * S * p[2]]);
    }
    if (c === 1) { // the hat: a brim (a flat wide capsule) and a crown
        const b1 = w2(hw, Felt3D_app(Rh, [-0.3, 0.13, 0]), root, S, P), b2 = w2(hw, Felt3D_app(Rh, [0.3, 0.13, 0]), root, S, P);
        const cr = w2(hw, Felt3D_app(Rh, [0, 0.22, -0.01]), root, S, P);
        hat.push([b1[0], b1[1], b2[0], b2[1], 0.03 * S * b1[2]]);
        hat.push([cr[0], cr[1] + 0.03 * cr[2], cr[0], cr[1] - 0.03 * cr[2], 0.12 * S * cr[2]]);
    }
    // keypoints of the model: eye midpoint, paws, feet
    const eyeM = w2(hw, Felt3D_app(Rh, [0, -0.008, 0.122]), root, S, P);
    const kp = { eye: eyeM, pawL: w(42), pawR: w(51), footL: w(60), footR: w(69) };
    return { caps, hat, kp };
}
const Felt3D_app = (R, v) => [R[0] * v[0] + R[3] * v[1] + R[6] * v[2], R[1] * v[0] + R[4] * v[1] + R[7] * v[2], R[2] * v[0] + R[5] * v[1] + R[8] * v[2]];
const w2 = (hw, off, root, S, P) => { const q = [hw[0] + off[0], hw[1] + off[1], hw[2] + off[2]]; return P([root[0] + (q[0] - root[0]) * S, q[1] * S, root[2] + (q[2] - root[2]) * S]); };
function raster(caps, out, val) {
    for (const [ax, ay, bx, by, r] of caps) {
        const x0 = Math.max(0, Math.floor(Math.min(ax, bx) - r)), x1 = Math.min(W - 1, Math.ceil(Math.max(ax, bx) + r));
        const y0 = Math.max(0, Math.floor(Math.min(ay, by) - r)), y1 = Math.min(H - 1, Math.ceil(Math.max(ay, by) + r));
        const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1e-9, r2 = r * r;
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
            const px = x + 0.5 - ax, py = y + 0.5 - ay;
            const t = Math.max(0, Math.min(1, (px * dx + py * dy) / L2));
            const ex = px - dx * t, ey = py - dy * t;
            if (ex * ex + ey * ey <= r2) out[y * W + x] = val;
        }
    }
}
// the loss of three poses against one drawing
const kpScale = (d, c) => KP[d][c];
function loss(poses, d, ref, prev, P, detail = false) {
    const cat = new Uint8Array(NPX), gin = new Uint8Array(NPX), blk = new Uint8Array(NPX);
    let kpl = 0;
    const pr = poses.map((p, c) => prims(p, c, P));
    // draw back to front (farther first) so nearer cats cover
    const order = [0, 1, 2].sort((a, b) => poses[a].z - poses[b].z);
    for (const c of order) {
        raster(pr[c].caps, cat, 1);
        const g = new Uint8Array(NPX); raster(pr[c].caps, g, 1);
        for (let i = 0; i < NPX; i++) if (g[i]) { gin[i] = c === 0 ? 1 : 0; blk[i] = 0; }
        raster(pr[c].hat, cat, 1); raster(pr[c].hat, blk, 1);
    }
    let sil = 0, gl = 0, bl = 0;
    for (let i = 0; i < NPX; i++) { sil += cat[i] !== ref.cat[i]; gl += gin[i] !== ref.gin[i]; bl += blk[i] !== ref.blk[i]; }
    sil /= NPX; gl /= NPX; bl /= NPX;
    // keypoints (reference px → our W×H px)
    const k = W / 576;
    for (let c = 0; c < 3; c++) {
        const K = KP[d][c], m = pr[c].kp, facing = Math.cos(poses[c].yaw ?? 0) > 0;
        const add = (mp, x, y, s, wgt = 1) => { if (s < 0.3) return; const ex = (mp[0] - x * k) / W * 30, ey = (mp[1] - y * k) / W * 30; kpl += wgt * s * Math.min(4, ex * ex + ey * ey); };
        if (K[0][2] > 0.4 && K[1][2] > 0.4) add(m.eye, (K[0][0] + K[1][0]) / 2, (K[0][1] + K[1][1]) / 2, Math.min(K[0][2], K[1][2]), 2);
        // left/right by image x (the model's labels swap)
        const pair = (a, b, mL, mR, wgt) => {
            const A = K[a], B = K[b];
            const [lo, hi] = A[0] < B[0] ? [A, B] : [B, A];
            const [L, Rr] = facing ? [hi, lo] : [lo, hi];
            add(mL, L[0], L[1], L[2], wgt); add(mR, Rr[0], Rr[1], Rr[2], wgt);
        };
        pair(7, 10, m.pawL, m.pawR, 0.6);
        pair(13, 16, m.footL, m.footR, 1);
    }
    kpl /= 30;
    // smoothness against the previous drawing's fit, and priors
    let sm = 0;
    if (prev) for (let c = 0; c < 3; c++) for (const [f, s] of FIELDS) { const dv = (get(poses[c], f) - get(prev[c], f)) / s; sm += dv * dv; }
    sm *= 0.0015;
    // limits read off the frames: a silhouette can't tell front from back, so without them the
    // fit turned cats round, tipped heads back to the sky and twisted torsos
    let lim = 0;
    const out = (v, lo, hi) => (v < lo ? lo - v : v > hi ? v - hi : 0);
    for (let c = 0; c < 3; c++) {
        const p = poses[c], s0 = START[d][c];
        lim += out(p.yaw - s0.yaw, -0.25, 0.25) + out(p.twist, -0.45, 0.45);
        lim += 4 * (out(p.z - s0.z, -0.25, 0.25) + out(p.x - s0.x, -0.15, 0.15)); // depth drifts where the silhouettes overlap
        // the torso's lean stays near the solver's (where cats overlap the silhouette lays them down)
        lim += 2 * (out(p.spine[0] - p.pel[0] - (s0.spine[0] - s0.pel[0]), -0.1, 0.1) + out(p.spine[2] - p.pel[2] - (s0.spine[2] - s0.pel[2]), -0.1, 0.1));
        lim += out(p.head[0], -0.8, 0.8) + out(p.head[1], -0.25, 1.1) + out(p.head[2], -0.45, 0.45);
        lim += out(p.spine[2] - p.pel[2], -0.05, 0.3) + out(p.spine[1] - p.pel[1], 0.2, 0.45);
        // a face the pose model saw looks roughly at the camera
        const K = KP[d][c];
        // (only where the keys have it facing us: the model also 'finds' eyes on the backs)
        if (K[0][2] > 0.5 && K[1][2] > 0.5 && Math.cos(s0.yaw) > 0.3) {
            const a = p.yaw + p.twist + p.head[0], w = Math.atan2(Math.sin(a), Math.cos(a));
            lim += 2 * out(w, -0.45, 0.45) + 2 * out(p.head[1] - s0.head[1], -0.3, 0.3); // and nods as the eyes-to-crown measure says
        } else {
            // a hidden face (a bowed head, a back): the head keeps the hand-keyed angles
            for (let i = 0; i < 3; i++) lim += 2 * out(p.head[i] - s0.head[i], -0.15, 0.15);
        }
    }
    const total = sil * 3 + gl * 2 + bl * 2 + kpl * 0.05 + sm + lim * 2;
    return detail ? { total, sil, gl, bl, kpl, sm } : total;
}
const FIELDS = [
    ['x', 0.02], ['z', 0.06], ['yaw', 0.12], ['pel.0', 0.02], ['pel.1', 0.02], ['pel.2', 0.03], ['spine.0', 0.03], ['spine.1', 0.03], ['spine.2', 0.04], ['twist', 0.12],
    ['head.0', 0.15], ['head.1', 0.12], ['head.2', 0.1],
    ['feet.0.0', 0.02], ['feet.0.1', 0.03], ['feet.0.2', 0.02], ['feet.1.0', 0.02], ['feet.1.1', 0.03], ['feet.1.2', 0.02],
    ['paws.0.0', 0.03], ['paws.0.1', 0.03], ['paws.0.2', 0.04], ['paws.1.0', 0.03], ['paws.1.1', 0.03], ['paws.1.2', 0.04],
    ['tail.0', 0.3],
];
function get(p, f) { return f.split('.').reduce((o, k) => o[k], p); }
function set(p, f, v) { const ks = f.split('.'); let o = p; for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]]; o[ks.at(-1)] = v; }
const clone = (x) => JSON.parse(JSON.stringify(x));
function full(p) { return { ...clone(Cats.REST_IK), ...clone(p) }; }

const OUT = path.join(DIR, 'private/tracked.json');
const res = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
let prev = res[FROM - 1] ?? null;
for (let d = FROM; d <= TO; d++) {
    const D = Dance.at(d / 15), P = projector(D.zoom), ref = refMaps(d);
    // start: the previous fit (motion carries) blended with the solver's pose for this drawing
    let cur = (prev ?? START[d]).map(full);
    const sol = START[d].map(full);
    if (prev) for (let c = 0; c < 3; c++) { cur[c].yaw = sol[c].yaw; cur[c].tail = sol[c].tail; cur[c].mouth = sol[c].mouth; }
    let best = loss(cur, d, ref, prev, P);
    const first = best;
    // also try the solver's pose outright
    const ls = loss(sol, d, ref, prev, P);
    if (ls < best) { cur = sol; best = ls; }
    let evals = 2;
    for (let r = 0; r < ROUNDS; r++) {
        const k = Math.pow(0.5, r);
        for (let c = 0; c < 3; c++) for (const [f, s] of FIELDS) {
            for (const sg of [1, -1]) {
                const T = cur.map((p) => p);
                T[c] = clone(cur[c]);
                set(T[c], f, get(T[c], f) + sg * s * k * 2);
                const l = loss(T, d, ref, prev, P); evals++;
                if (l < best) { cur = T; best = l; break; }
            }
        }
    }
    const det = loss(cur, d, ref, prev, P, true);
    res[d] = cur.map((p) => JSON.parse(JSON.stringify(p, (kk, v) => (typeof v === 'number' ? Math.round(v * 1000) / 1000 : v))));
    prev = res[d];
    if (d % 5 === 0 || d === TO) {
        fs.writeFileSync(OUT, JSON.stringify(res));
        fs.writeFileSync(path.join(DIR, 'private/tracked-poses.js'), 'var DANCE_FIT = Object.assign(globalThis.DANCE_FIT ?? {}, ' + JSON.stringify(res) + ');\n');
    }
    console.log(`d=${d} t=${(d / 15).toFixed(2)} loss ${first.toFixed(4)} → ${best.toFixed(4)} (sil ${det.sil.toFixed(3)} gin ${det.gl.toFixed(3)} blk ${det.bl.toFixed(3)} kp ${det.kpl.toFixed(2)}) ${evals} evals`);
}
