// fit.mjs - reads probe/trim-probe.txt (what trim-probe.jsx measured inside After Effects 27,
// copied from out/probe/) and checks it against the models the rig uses:
//  - Trim Paths End % = that fraction of the path's arc length (exact length, Gauss-Legendre);
//  - the shape group transform: which order and sign of skew reproduces AE's boxes.
//   node sandbox/2026-11-23-ae-draw-on-rig/probe/fit.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const txt = fs.readFileSync(path.join(dir, 'trim-probe.txt'), 'utf8');
const P = {};
for (const line of txt.split(/\r?\n/)) {      // ExtendScript writes CRLF on Windows
    const m = /^(\S+) = (.*)$/.exec(line);
    if (m) P[m[1]] = m[2];
}
const val = (k) => (P[k] === undefined ? undefined : new Function('return ' + P[k])());

// ---- arc length ----
const GL = [[-0.9815606342467192, 0.0471753363865118], [-0.9041172563704749, 0.1069393259953184], [-0.7699026741943047, 0.1600783285433462], [-0.5873179542866175, 0.2031674267230659], [-0.3678314989981802, 0.2334925365383548], [-0.1252334085114689, 0.2491470458134028], [0.1252334085114689, 0.2491470458134028], [0.3678314989981802, 0.2334925365383548], [0.5873179542866175, 0.2031674267230659], [0.7699026741943047, 0.1600783285433462], [0.9041172563704749, 0.1069393259953184], [0.9815606342467192, 0.0471753363865118]];
function bez(c, t) {
    const u = 1 - t;
    return [0, 1].map((k) => u * u * u * c[0][k] + 3 * u * u * t * c[1][k] + 3 * u * t * t * c[2][k] + t * t * t * c[3][k]);
}
function dbez(c, t) {
    const u = 1 - t;
    return [0, 1].map((k) => 3 * u * u * (c[1][k] - c[0][k]) + 6 * u * t * (c[2][k] - c[1][k]) + 3 * t * t * (c[3][k] - c[2][k]));
}
function segLen(c, a = 0, b = 1, depth = 0) {
    // adaptive: split until halves agree
    const q = (a2, b2) => {
        let s = 0;
        for (const [x, w] of GL) {
            const t = (a2 + b2) / 2 + ((b2 - a2) / 2) * x, d = dbez(c, t);
            s += w * Math.hypot(d[0], d[1]);
        }
        return (s * (b2 - a2)) / 2;
    };
    const whole = q(a, b), m = (a + b) / 2, two = q(a, m) + q(m, b);
    if (depth > 12 || Math.abs(whole - two) < 1e-10) return two;
    return segLen(c, a, m, depth + 1) + segLen(c, m, b, depth + 1);
}
function segments(v, i, o, closed) {
    const s = [];
    const n = v.length;
    for (let k = 0; k < n - 1 + (closed ? 1 : 0); k++) {
        const a = v[k], b = v[(k + 1) % n];
        s.push([a, [a[0] + o[k][0], a[1] + o[k][1]], [b[0] + i[(k + 1) % n][0], b[1] + i[(k + 1) % n][1]], b]);
    }
    return s;
}
// the point at fraction f of the arc length
function pointAt(segs, f) {
    const lens = segs.map((c) => segLen(c)), total = lens.reduce((x, y) => x + y, 0);
    let d = f * total;
    for (let k = 0; k < segs.length; k++) {
        if (d <= lens[k] + 1e-12 || k === segs.length - 1) {
            let lo = 0, hi = 1;
            for (let it = 0; it < 60; it++) {
                const m = (lo + hi) / 2;
                if (segLen(segs[k], 0, m) < d) lo = m;
                else hi = m;
            }
            return bez(segs[k], (lo + hi) / 2);
        }
        d -= lens[k];
    }
}
// exact box of the first fraction f of the path (sampled densely; boxes here are monotone tests)
function boxTo(segs, f) {
    let xs = [], ys = [];
    for (let s = 0; s <= 400; s++) {
        const p = pointAt(segs, (f * s) / 400);
        xs.push(p[0]);
        ys.push(p[1]);
    }
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
}

const TESTS = {
    A: segments([[0, 0], [300, 0]], [[0, 0], [0, 0]], [[250, 0], [0, 0]], false),
    B: segments([[0, 0], [100, 0], [400, 0]], [[0, 0], [0, 0], [0, 0]], [[0, 0], [0, 0], [0, 0]], false),
    C: segments([[0, 0], [300, 0]], [[0, 0], [-150, 300]], [[150, -300], [0, 0]], false),
    D: segments([[0, 0], [50, 0], [250, 40], [260, 400]], [[0, 0], [-20, 0], [-60, -80], [0, -10]], [[20, 0], [60, 80], [0, 10], [0, 0]], false),
};
let worst = 0;
for (const [name, segs] of Object.entries(TESTS)) {
    const total = segs.map((c) => segLen(c)).reduce((x, y) => x + y, 0);
    const rows = [];
    for (const e of [5, 10, 25, 40, 50, 60, 75, 90]) {
        const ae = val(`${name}.end${e}`);
        if (!ae) continue;
        const me = boxTo(segs, e / 100);
        const err = Math.max(...ae.map((x, k) => Math.abs(x - me[k])));
        worst = Math.max(worst, err);
        rows.push(`${e}%: ${err.toFixed(3)}`);
    }
    console.log(`${name} (length ${total.toFixed(3)}): box error px · ${rows.join(' · ')}`);
}
console.log(`trim = arc length: worst box error ${worst.toFixed(3)} px`);

// ---- group transform ----
const rad = (d) => (d * Math.PI) / 180;
const mul = (a, b) => [a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3], a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3]];
const R = (d) => [Math.cos(rad(d)), -Math.sin(rad(d)), Math.sin(rad(d)), Math.cos(rad(d))];
const S = (s) => [s[0] / 100, 0, 0, s[1] / 100];
const variants = {
    'R K(+tan) S, K = R(ka) Sh R(-ka)': (c) => mul(R(c.r), mul(mul(R(c.ka), mul([1, Math.tan(rad(c.k)), 0, 1], R(-c.ka))), S(c.s))),
    'R K(-tan) S, K = R(ka) Sh R(-ka)': (c) => mul(R(c.r), mul(mul(R(c.ka), mul([1, -Math.tan(rad(c.k)), 0, 1], R(-c.ka))), S(c.s))),
    'R K(+tan) S, K = R(-ka) Sh R(ka)': (c) => mul(R(c.r), mul(mul(R(-c.ka), mul([1, Math.tan(rad(c.k)), 0, 1], R(c.ka))), S(c.s))),
    'R K(-tan) S, K = R(-ka) Sh R(ka)': (c) => mul(R(c.r), mul(mul(R(-c.ka), mul([1, -Math.tan(rad(c.k)), 0, 1], R(c.ka))), S(c.s))),
    'R S K(-tan), K = R(ka) Sh R(-ka)': (c) => mul(R(c.r), mul(S(c.s), mul(R(c.ka), mul([1, -Math.tan(rad(c.k)), 0, 1], R(-c.ka))))),
    'R K(-tan) S, K = R(ka) ShY R(-ka)': (c) => mul(R(c.r), mul(mul(R(c.ka), mul([1, 0, -Math.tan(rad(c.k)), 1], R(-c.ka))), S(c.s))),
    'R K(-tan) S, K = R(ka+90) Sh R(-ka-90)': (c) => mul(R(c.r), mul(mul(R(c.ka + 90), mul([1, -Math.tan(rad(c.k)), 0, 1], R(-c.ka - 90))), S(c.s))),
    'R K(+tan) S, K = R(ka+90) Sh R(-ka-90)': (c) => mul(R(c.r), mul(mul(R(c.ka + 90), mul([1, Math.tan(rad(c.k)), 0, 1], R(-c.ka - 90))), S(c.s))),
};
const [V, I, O] = val('xform.path');
const base = segments(V, I, O, true);
function boxOf(segs) {
    let xs = [], ys = [];
    for (const c of segs) for (let s = 0; s <= 2000; s++) {
        const p = bez(c, s / 2000);
        xs.push(p[0]);
        ys.push(p[1]);
    }
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
}
for (const [name, M] of Object.entries(variants)) {
    let w = 0;
    for (let k = 0; k < 8; k++) {
        const c = val('xform.case' + k), ae = val('xform.rect' + k);
        if (!c) continue;
        const m = M(c);
        const tr = (p) => {
            const x = p[0] - c.a[0], y = p[1] - c.a[1];
            return [c.p[0] + m[0] * x + m[1] * y, c.p[1] + m[2] * x + m[3] * y];
        };
        const me = boxOf(base.map((seg) => seg.map(tr)));
        w = Math.max(w, ...ae.map((x, j) => Math.abs(x - me[j])));
    }
    console.log(`${w < 0.05 ? 'FITS' : '    '} ${w.toFixed(3)} px · ${name}`);
}
