// Writes the two Lottie files of this experiment, by code (no After Effects):
//   badge.json     a «done» badge: the disc pops in with overshoot, a shock ring and a
//                  burst of dots, and the check draws itself on (trim path); the check is
//                  parented to the disc, so it scales with it.
//   ease-dot.json  a ring that travels a track and back with two different cubic-bezier
//                  curves, at 60 fps: scene.js drives a code-drawn dot from the SAME
//                  keyframes (Lottie.ease) to prove both timings agree.
//
//   node sandbox/2026-11-21-lottie-layer/make-lottie.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));

// --- tiny Lottie vocabulary (Bodymovin 5.x schema) -------------------------------------
const still = (k) => ({ a: 0, k });
const arr = (v) => (Array.isArray(v) ? v : [v]);
// keys: [[frame, value, ease?, hold?], …]; ease = [ox, oy, ix, iy] shapes the segment that
// LEAVES this key (Lottie keeps both handles on the starting key). Non-spatial properties
// get per-dimension handle arrays, the way Bodymovin writes them.
function keys(list) {
    return {
        a: 1,
        k: list.map(([t, s, e, hold], n) => {
            const k = { t, s: arr(s) };
            if (hold) k.h = 1;
            else if (n < list.length - 1) {
                const [ox, oy, ix, iy] = e ?? [0.333, 0, 0.667, 1];   // AE «Easy Ease»
                const d = arr(s).length;
                k.o = { x: Array(d).fill(ox), y: Array(d).fill(oy) };
                k.i = { x: Array(d).fill(ix), y: Array(d).fill(iy) };
            }
            return k;
        }),
    };
}
// spatial position: scalar handles plus straight tangents (to / ti = 0)
function path2(list) {
    return {
        a: 1,
        k: list.map(([t, s, e, hold], n) => {
            const k = { t, s: [...s, 0] };
            if (hold) k.h = 1;
            else if (n < list.length - 1) {
                const [ox, oy, ix, iy] = e ?? [0.333, 0, 0.667, 1];
                Object.assign(k, { o: { x: ox, y: oy }, i: { x: ix, y: iy }, to: [0, 0, 0], ti: [0, 0, 0] });
            }
            return k;
        }),
    };
}
const transform = (o = {}) => ({ ty: 'tr', p: still([0, 0]), a: still([0, 0]), s: still([100, 100]), r: still(0), o: still(100), sk: still(0), sa: still(0), nm: 'Transform', ...o });
const group = (nm, items, tr = {}) => ({ ty: 'gr', nm, it: [...items, transform(tr)] });
const ellipse = (s) => ({ ty: 'el', d: 1, nm: 'Ellipse', p: still([0, 0]), s: typeof s === 'number' ? still([s, s]) : s });
const fill = (c) => ({ ty: 'fl', nm: 'Fill', c: still(c), o: still(100), r: 1 });
const stroke = (c, w) => ({ ty: 'st', nm: 'Stroke', c: still(c), o: still(100), w: w.a !== undefined ? w : still(w), lc: 2, lj: 2, ml: 4 });
const shapePath = (v, closed = false) => ({ ty: 'sh', nm: 'Path', ks: still({ i: v.map(() => [0, 0]), o: v.map(() => [0, 0]), v, c: closed }) });
const trim = (e) => ({ ty: 'tm', nm: 'Trim', s: still(0), e, o: still(0), m: 1 });
function layer(ind, nm, shapes, ks = {}, extra = {}) {
    return {
        ddd: 0, ind, ty: 4, nm, sr: 1, ao: 0, bm: 0, st: 0, ip: 0, op: extra.op,
        ks: { o: still(100), r: still(0), p: still([0, 0, 0]), a: still([0, 0, 0]), s: still([100, 100, 100]), ...ks },
        shapes, ...extra,
    };
}
const comp = (nm, w, h, fr, op, layers) => ({ v: '5.7.4', nm, fr, ip: 0, op, w, h, ddd: 0, assets: [], layers });
const rgb = (hex) => [...[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255), 1];

// shared with scene.js (the card's palette)
const INK = rgb('#2b2a33'), ORANGE = rgb('#e8743b'), YELLOW = rgb('#f2c14e'), TEAL = rgb('#3a8d8c'), WHITE = rgb('#fffaf2');

// --- badge.json: 400 × 400, 30 fps, 75 frames (2.5 s) ---------------------------------
{
    const OP = 75, C = [200, 200, 0];
    const disc = layer(2, 'disc', [group('disc', [ellipse(230), fill(ORANGE)])], {
        p: still(C),
        s: keys([
            [0, [0, 0, 100], [0.2, 0.6, 0.35, 1]],
            [10, [114, 114, 100], [0.45, 0, 0.55, 1]],
            [16, [95, 95, 100], [0.45, 0, 0.55, 1]],
            [22, [100, 100, 100]],
        ]),
    }, { op: OP });
    // the check is a child of the disc: position (0, 0) = the disc's anchor, its centre
    const check = layer(1, 'check', [
        group('check', [shapePath([[-56, 4], [-16, 44], [60, -42]]), trim(keys([[0, 0, null, true], [12, 0, [0.65, 0, 0.35, 1]], [27, 100]])), stroke(WHITE, 27)]),
    ], { p: still([0, 0, 0]) }, { op: OP, parent: 2 });
    const ring = layer(3, 'ring', [group('ring', [
        ellipse(keys([[0, [230, 230], null, true], [6, [230, 230], [0.1, 0.7, 0.3, 1]], [28, [390, 390]]])),
        stroke(ORANGE, keys([[0, 14, null, true], [6, 14, [0.2, 0.5, 0.4, 1]], [28, 2]])),
    ])], { p: still(C), o: keys([[0, 0, null, true], [6, 85, [0.3, 0, 0.6, 1]], [28, 0]]) }, { op: OP });
    const dotColors = [YELLOW, TEAL, ORANGE, INK];
    const dots = [];
    for (let n = 0; n < 8; n++) {
        const a = (n / 8) * Math.PI * 2 - Math.PI / 2 + Math.PI / 8;
        const at = (r) => [Math.round(Math.cos(a) * r * 10) / 10, Math.round(Math.sin(a) * r * 10) / 10];
        const d0 = 9 + (n % 2) * 4;   // first frame of this dot: alternate dots leave a beat later
        dots.push(group('dot ' + n, [
            ellipse(keys([[0, [0, 0], null, true], [d0, [24 - (n % 2) * 6, 24 - (n % 2) * 6], [0.4, 0, 0.7, 1]], [d0 + 20, [0, 0]]])),
            fill(dotColors[n % 4]),
        ], { p: keys([[0, at(122), null, true], [d0, at(122), [0.1, 0.75, 0.3, 1]], [d0 + 20, at(190 - (n % 2) * 18)]]) }));
    }
    const burst = layer(4, 'burst', dots, { p: still(C) }, { op: OP });
    fs.writeFileSync(path.join(DIR, 'badge.json'), JSON.stringify(comp('badge', 400, 400, 30, OP, [check, disc, ring, burst])));
}

// --- ease-dot.json: 640 × 80, 60 fps, 240 frames (4 s) --------------------------------
// out: 0 → 1.5 s with cubic-bezier(.7, 0, .3, 1); hold to 2 s; back: 2 → 3.5 s with
// cubic-bezier(.2, .8, .2, 1); hold to 4 s.
{
    const OP = 240;
    const ringDot = layer(1, 'ring dot', [group('ring', [ellipse(46), stroke(INK, 5)])], {
        p: path2([
            [0, [40, 40], [0.7, 0, 0.3, 1]],
            [90, [600, 40], null, true],
            [120, [600, 40], [0.2, 0.8, 0.2, 1]],
            [210, [40, 40]],
        ]),
    }, { op: OP });
    fs.writeFileSync(path.join(DIR, 'ease-dot.json'), JSON.stringify(comp('ease-dot', 640, 80, 60, OP, [ringDot])));
}
console.log('wrote badge.json and ease-dot.json');
