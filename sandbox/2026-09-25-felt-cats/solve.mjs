// Solves the cats' IK poses (cats.js jointsIK) drawing by drawing from 2D keypoints measured
// on the reference (private/kp.json: [drawing][cat][17 AP-10K keypoints][x, y, score] in
// reference pixels, from a pose model): feet on the floor (depth from where they touch it),
// the head from the eyes and nose (position, tilt, turn, nod), the torso from the neck to the
// pelvis with its length kept (a lower neck is a crouch: the knees bend), the paws where they
// were seen. What the model can't see (bowed heads, backs in the turn) comes from the hand
// keys (keys/seg*.js): the turn (yaw), the tail, the mouth, and the head where the face is
// hidden. The result is data read off the reference: private/solved-poses.js.
//   node sandbox/2026-09-25-felt-cats/solve.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const DIR = path.dirname(new URL(import.meta.url).pathname), ROOT = path.join(DIR, '../..');
const ctx = {};
vm.createContext(ctx);
for (const f of ['styles/felt3d/felt3d.js', 'sandbox/2026-09-25-felt-cats/cats.js', 'sandbox/2026-09-25-felt-cats/keys/segA.js', 'sandbox/2026-09-25-felt-cats/keys/segB.js', 'sandbox/2026-09-25-felt-cats/keys/segC.js', 'sandbox/2026-09-25-felt-cats/dance.js'])
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/^const (\w+) = /gm, 'var $1 = '), ctx);
const { Stage, Dance, Cats, Felt3D } = ctx;
const V = Felt3D.V;
const KP = JSON.parse(fs.readFileSync(path.join(DIR, 'private/kp.json'), 'utf8'));
const N = KP.length, [CX, CH, CD] = [Stage.CAM.cam[0], Stage.CAM.cam[1], Stage.CAM.cam[2]];
const F = 0.5 / Math.tan(Stage.CAM.fov / 2) * 1600;
const TH = 0.3; // keypoint score below which it is not trusted
const SCALE = 1.0; // the model's size (bellies measure the same as the reference's)
const BELLY = JSON.parse(fs.readFileSync(path.join(DIR, 'private/belly.json'), 'utf8'));
const BW = 0.25; // the model's belly width with its fibres, units
const TOP = JSON.parse(fs.readFileSync(path.join(DIR, 'private/headtop.json'), 'utf8'));

// reference px → logical, zoom undone (the camera's 2D zoom is applied at render)
function unzoom([x, y], zoom) {
    const [Z, u, v] = zoom, X = x * 1600 / 1024, Y = y * 1600 / 1024;
    return [u * 900 + (X - u * 900) / Z, v * 1600 + (Y - v * 1600) / Z];
}
const unproj = ([X, Y], zp) => { const dz = CD - zp; return [CX + (X - 450) / F * dz, CH - (Y - 800) / F * dz, zp]; };
const floorZ = ([X, Y]) => (Y > 805 ? CD - CH * F / (Y - 800) : null);

// 1. raw measurements per drawing and cat
const raw = [];
for (let d = 0; d < N; d++) {
    const D = Dance.at(d / 15), row = [];
    for (let c = 0; c < 3; c++) {
        const k = KP[d][c].map(([x, y, s]) => ({ p: unzoom([x, y], D.zoom), s }));
        const old = D.poses[c], yaw = old.yaw ?? 0;
        const facing = Math.cos(yaw) > 0; // the cat's left is image right when it faces us
        const pick = (a, b) => { // [its left, its right] from two keypoints, by image x
            const A = k[a], B = k[b];
            const [lo, hi] = A.p[0] < B.p[0] ? [A, B] : [B, A];
            return facing ? [hi, lo] : [lo, hi];
        };
        row.push({ yaw, old, feet: pick(13, 16), paws: pick(7, 10), eyes: pick(0, 1), nose: k[2] });
    }
    raw.push(row);
}
// smoothing helpers over drawings (NaN = missing: filled from neighbours)
function fill(a) {
    const out = a.slice();
    for (let i = 0; i < out.length; i++) if (!Number.isFinite(out[i])) {
        let j = i; while (j < out.length && !Number.isFinite(out[j])) j++;
        const L = i > 0 ? out[i - 1] : j < out.length ? out[j] : 0, R = j < out.length ? out[j] : L;
        for (let k = i; k < j; k++) out[k] = L + (R - L) * (k - i + 1) / (j - i + 1);
    }
    return out;
}
function gauss(a, s) {
    if (s <= 0) return a;
    const r = Math.ceil(s * 3), w = [];
    for (let i = -r; i <= r; i++) w.push(Math.exp(-(i * i) / (2 * s * s)));
    return a.map((_, i) => { let S = 0, W = 0; for (let j = -r; j <= r; j++) { const k = Math.min(a.length - 1, Math.max(0, i + j)); S += a[k] * w[j + r]; W += w[j + r]; } return S / W; });
}
function median3(a) { return a.map((v, i) => { const s = [a[Math.max(0, i - 1)], v, a[Math.min(a.length - 1, i + 1)]].sort((x, y) => x - y); return s[1]; }); }
const track = (f, s = 1) => gauss(median3(fill(raw.map(f))), s);

const poses = [];
for (let d = 0; d < N; d++) poses.push([]);
// pre-pass: each cat's depth from its belly width; then where the lower foot lands against
// the floor at that depth gives the camera's vertical slip (the zoom model's error), the
// median of the three cats, smoothed; every measured height is corrected by it
const ZB = [0, 1, 2].map((c) => gauss(median3(fill(Array.from({ length: N }, (_, d) => {
    const w = BELLY[d][c];
    if (!w) return NaN;
    const Z = Dance.at(d / 15).zoom[0], wl = w * 1600 / 1024 / Z;
    return Math.max(-1, Math.min(1.5, CD - F * BW / wl));
}))), 4));
const SLIP = gauss(median3(fill(Array.from({ length: N }, (_, d) => {
    const ys = [];
    for (let c = 0; c < 3; c++) {
        const f = raw[d][c].feet.filter((q) => q.s > TH).map((q) => q.p);
        if (!f.length) continue;
        const low = f.reduce((a, b) => (a[1] > b[1] ? a : b));
        ys.push(unproj(low, ZB[c][d])[1]);
    }
    if (!ys.length) return NaN;
    ys.sort((a, b) => a - b);
    return ys[Math.floor(ys.length / 2)];
}))), 3);
console.log('camera slip (units), every second:', SLIP.filter((_, i) => i % 15 === 0).map((v) => v.toFixed(2)).join(' '));
const unprojS = (d) => (P, zp) => unproj(P, zp); // the slip (above) is logged, not applied: it fought the depths
for (let c = 0; c < 3; c++) {
    const R = (d) => raw[d][c];
    // depth: where the lower foot meets the floor, heavily smoothed
    const zFloor = track((r) => {
        const f = r[c].feet.filter((q) => q.s > TH).map((q) => q.p);
        if (!f.length) return NaN;
        const low = f.reduce((a, b) => (a[1] > b[1] ? a : b));
        const z = floorZ(low);
        return z === null ? NaN : Math.max(-0.8, Math.min(1.4, z));
    }, 6);
    const zKey = gauss(raw.map((r) => r[c].old.z ?? 0), 3);
    const zB = ZB[c];
    const footT = [0, 1].map((i) => ({
        x: track((r) => (r[c].feet[i].s > TH ? r[c].feet[i].p[0] : NaN), 1),
        y: track((r) => (r[c].feet[i].s > TH ? r[c].feet[i].p[1] : NaN), 1),
    }));
    const pawT = [0, 1].map((i) => ({
        x: track((r) => (r[c].paws[i].s > TH ? r[c].paws[i].p[0] : NaN), 1),
        y: track((r) => (r[c].paws[i].s > TH ? r[c].paws[i].p[1] : NaN), 1),
        ok: raw.map((r) => r[c].paws[i].s > TH),
    }));
    const eyeOK = raw.map((r) => r[c].eyes[0].s > 0.4 && r[c].eyes[1].s > 0.4 && r[c].nose.s > 0.4);
    const ex = [0, 1].map((i) => ({
        x: track((r) => (r[c].eyes[i].s > 0.4 ? r[c].eyes[i].p[0] : NaN), 1),
        y: track((r) => (r[c].eyes[i].s > 0.4 ? r[c].eyes[i].p[1] : NaN), 1),
    }));
    const nx = track((r) => (r[c].nose.s > 0.4 ? r[c].nose.p[0] : NaN), 1), ny = track((r) => (r[c].nose.s > 0.4 ? r[c].nose.p[1] : NaN), 1);
    // nod: how far the eyes sit below the head's top (or the hat's edge), in eye spacings;
    // bowing the head brings the crown round to the camera and pushes the eyes down
    const qRaw = raw.map((r, d) => {
        const t = TOP[d][c]; if (t === null || !eyeOK[d]) return NaN;
        const e = KP[d][c], my = (e[0][1] + e[1][1]) / 2, sp = Math.abs(e[0][0] - e[1][0]) + 1;
        return (my - t) / sp;
    });
    const q = gauss(median3(fill(qRaw)), 1.5);
    const qRest = q.slice(39, 52).sort((a, b) => a - b)[6];
    // how much to trust the face: a smooth 0..1 (a hidden face hands over to the hand keys)
    const faceW = gauss(eyeOK.map((v) => (v ? 1 : 0)), 2);
    // calibration on this cat's own face: the eye spacing when it looks straight at us (the
    // 90th percentile over the dance) and the nose-below-eyes ratio at rest (2.6–3.4 s)
    const eyeDs = [], ratios = [];
    for (let d = 0; d < N; d++) if (eyeOK[d]) {
        const dx = ex[0].x[d] - ex[1].x[d], dy = ex[0].y[d] - ex[1].y[d], e = Math.hypot(dx, dy);
        eyeDs.push(e / F * (CD - zFloor[d] - 0.12));
        if (d >= 39 && d <= 51) ratios.push((ny[d] - (ex[0].y[d] + ex[1].y[d]) / 2) / e);
    }
    eyeDs.sort((a, b) => a - b);
    const EYE = eyeDs[Math.floor(eyeDs.length * 0.9)] ?? 0.108;
    const R0 = ratios.length ? ratios.sort((a, b) => a - b)[Math.floor(ratios.length / 2)] : 0.24;
    console.log('cat', c, 'eye spacing', EYE.toFixed(3), 'rest nose ratio', R0.toFixed(2));

    for (let d = 0; d < N; d++) {
        // depth from the hand keys (sized against the reference by the stretch agents): the
        // floor contact gave depths the camera model can't hold (the frame sits lower late on)
        const r = R(d), yaw = r.yaw, z = zKey[d], Ry = V.ry(yaw), RyT = V.ry(-yaw);
        const toRoot = (w, root) => V.app(RyT, V.sub(w, root));
        // feet: the lower one on the floor, the other lifted by what the image says
        const fw = [0, 1].map((i) => unprojS(d)([footT[i].x[d], footT[i].y[d]], z));
        const low = Math.min(fw[0][1], fw[1][1]);
        const root = [(fw[0][0] + fw[1][0]) / 2, 0, z];
        const toModel = (w) => V.add(root, V.mul(V.sub(w, root), 1 / SCALE));
        const feet = fw.map((p) => { const m = toModel([p[0], 0, p[2]]), qq = toRoot(m, root); return [qq[0], qq[2] + 0.02, Math.max(0, p[1] - low) / SCALE]; });
        // the head, from the face, blended with the hand-keyed head where the face is hidden
        const oldJ = Cats.joints(r.old, c);
        const oldHead = [oldJ[24], oldJ[25], oldJ[26]];
        const E0 = [ex[0].x[d], ex[0].y[d]], E1 = [ex[1].x[d], ex[1].y[d]];
        const M = [(E0[0] + E1[0]) / 2, (E0[1] + E1[1]) / 2];
        const eyeD = Math.hypot(E0[0] - E1[0], E0[1] - E1[1]) / F * (CD - z - 0.12);
        const turnMag = Math.acos(Math.max(0.35, Math.min(1, eyeD / EYE)));
        const noseOff = (nx[d] - M[0]) * (Math.cos(yaw) > 0 ? 1 : -1);
        const hTurn = Math.sign(noseOff) * turnMag;
        const hTilt = -Math.atan2(E0[1] - E1[1], E0[0] - E1[0]) * (Math.cos(yaw) > 0 ? 1 : -1);
        const ratio = (ny[d] - M[1]) / Math.max(1, Math.hypot(E0[0] - E1[0], E0[1] - E1[1]));
        const hNod = Math.max(-0.4, Math.min(0.9, (ratio - R0) * 2.2));
        const Rhw = V.mm(Ry, V.mm(V.ry(hTurn), V.mm(V.rx(Math.max(-0.4, Math.min(1.1, (q[d] - qRest) / Math.max(0.3, qRest) * 1.3))), V.rz(hTilt))));
        const eyes3 = unprojS(d)(M, z + 0.12);
        const headFace = V.sub(toModel(eyes3), V.app(Rhw, [0, -0.01, 0.122]));
        const w = faceW[d];
        const head = V.add(V.mul(headFace, w), V.mul(toModel(oldHead), 1 - w));
        const qNod = Math.max(-0.4, Math.min(1.1, (q[d] - qRest) / Math.max(0.3, qRest) * 1.3));
        const hAng = [hTurn * w + (r.old.head?.[0] ?? 0) * (1 - w), qNod * w + (r.old.head?.[1] ?? 0) * (1 - w), hTilt * w + (r.old.head?.[2] ?? 0) * (1 - w)];
        const RhW = V.mm(Ry, V.mm(V.ry(hAng[0]), V.mm(V.rx(hAng[1]), V.rz(hAng[2]))));
        const neck = V.sub(head, V.app(RhW, [0, Cats.LEN.head, 0]));
        // torso: the pelvis over the feet, as high as the torso's length allows
        const L = Cats.LEN.spine;
        let pel = [root[0] * 0.7 + neck[0] * 0.3, 0, root[2] * 0.7 + neck[2] * 0.3];
        let hz = Math.hypot(neck[0] - pel[0], neck[2] - pel[2]);
        if (hz > L * 0.7) { const k = L * 0.7 / hz; pel = [neck[0] + (pel[0] - neck[0]) * k, 0, neck[2] + (pel[2] - neck[2]) * k]; hz = L * 0.7; }
        pel[1] = neck[1] - Math.sqrt(L * L - hz * hz);
        // too high for the legs: a hop, the feet leave the floor together
        const reach = 0.03 + Cats.LEN.thigh + Cats.LEN.shin + 0.02;
        if (pel[1] > reach) { const up = pel[1] - reach; feet.forEach((f) => (f[2] += up)); }
        pel[1] = Math.max(0.1, pel[1]);
        // paws: seen in front of the body, into the chest frame
        const pelR = toRoot(pel, root), neckR = toRoot(neck, root);
        const pose = {
            x: root[0], z: root[2], yaw, pel: pelR, spine: neckR, twist: 0, head: hAng, feet,
            tail: r.old.tail ?? [0.6, 0, 0.5], mouth: r.old.mouth ?? 0, scale: SCALE,
        };
        const J = Cats.jointsIK(pose);
        const chest = [J[12], J[13], J[14]], Rc = J.slice(15, 24), RcT = [Rc[0], Rc[3], Rc[6], Rc[1], Rc[4], Rc[7], Rc[2], Rc[5], Rc[8]];
        pose.paws = [0, 1].map((i) => {
            const pw = toModel(unprojS(d)([pawT[i].x[d], pawT[i].y[d]], z + 0.12));
            const loc = V.app(RcT, V.sub(pw, chest));
            return pawT[i].ok[d] || true ? loc : Cats.REST_IK.paws[i];
        });
        poses[d][c] = JSON.parse(JSON.stringify(pose, (k, v) => (typeof v === 'number' ? Math.round(v * 1000) / 1000 : v)));
    }
}
const out = {};
poses.forEach((p, d) => (out[d] = p));
fs.writeFileSync(path.join(DIR, 'private/solved-poses.js'), 'var DANCE_FIT = Object.assign(globalThis.DANCE_FIT ?? {}, ' + JSON.stringify(out) + ');\n');
console.log('solved', N, 'drawings; e.g. d=75 cat1', JSON.stringify(poses[75][1]));
