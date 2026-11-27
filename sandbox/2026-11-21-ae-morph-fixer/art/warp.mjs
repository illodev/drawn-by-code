// Prototype, second try at corner matching: a pairing of the two outlines found point by
// point (dynamic time warping on samples, every start of B tried), where a stretch of one
// outline may pair with a single point of the other (a stem that grows out of a bar). The
// cost: travel (how far points move, around each shape's centre) plus lambda times bend (how
// much each little piece of outline turns or stretches on the way: zero for a piece that
// slides). Each pairing is checked the way the fix checks a start: crossings and pinches in
// the in-betweens. Writes out/art/warp.png. Usage: node art/warp.mjs [lambda,lambda,...]
import fs from 'fs';
import { chromium } from 'playwright-core';
import { findChrome } from '../../../engine/browser.mjs';
import { build } from './cases.mjs';
const dir = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
let src = fs.readFileSync(dir + '/morph-math.js', 'utf8');
src = src.replace('    return {\n        fix: fix,', '    return {\n        _samples: samples, _corners: corners, _measure: measure, _selfCrossings: selfCrossings, _neckOf: neckOf,\n        fix: fix,');
const MF = new Function(src + '\nreturn MF;')();

const poly = (pts) => ({ v: pts.map((p) => p.slice()), i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), closed: true });
const T = poly([[-150, -150], [150, -150], [150, -90], [35, -90], [35, 150], [-35, 150], [-35, -90], [-150, -90]]);
const flip = (P) => { const R = MF.copy(P); R.v = R.v.map(([x, y]) => [x, -y]); R.v.reverse(); return R; };
const L = poly([[-100, -150], [-30, -150], [-30, 80], [120, 80], [120, 150], [-100, 150]]);

// an outline as points at fractions: its corners exactly, the rest every 1/n
function sampled(P, n) {
    const M = MF._measure(P), cs = MF._corners(P, M).map((c) => c.f);
    let fs = cs.slice();
    for (let k = 0; k < n; k++) if (cs.every((c) => Math.abs(((k / n - c) % 1 + 1.5) % 1 - 0.5) > 0.35 / n)) fs.push(k / n);
    fs = [...new Set(fs.map((f) => ((f % 1) + 1) % 1))].sort((a, b) => a - b);
    const S = MF._samples(P, M, 512), pts = fs.map((f) => MF.at(P, M, f));
    return { f: fs, p: pts, cx: S.cx, cy: S.cy, M, P, corners: cs };
}

// |dA - dB|^2 = turning 2(|dA||dB| - dA.dB) + stretching (|dA| - |dB|)^2; stretching x SIGMA
const SIGMA = Number(process.argv[3] || 1);
const bendOf = (ax, ay, bx, by) => { const la = Math.hypot(ax, ay), lb = Math.hypot(bx, by); return 2 * (la * lb - ax * bx - ay * by) + SIGMA * (la - lb) * (la - lb); };
const STEPS = [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [3, 1], [1, 3], [3, 2], [2, 3]];
// the cheapest pairing over every start of B: DTW from (0, s) round to (n, s + m)
// -> { pairs: [[fa, fb], ...] (fb from s to s + 1), cost }
function dtw(SA, SB, lambda, shifts) {
    const n = SA.p.length, m = SB.p.length;
    const fa = (i) => (i < n ? SA.f[i] : 1 + SA.f[i - n]), pa = (i) => SA.p[i % n];
    let best = null;
    for (const s of shifts || [...Array(m).keys()]) {
        const fb = (j) => { const k = j + s; return k < m ? SB.f[k] : 1 + SB.f[k - m]; }, pb = (j) => SB.p[(j + s) % m];
        const fb0 = fb(0);
        const W = n + 1, cost = new Float64Array((n + 1) * (m + 1)).fill(Infinity), from = new Int32Array((n + 1) * (m + 1)).fill(-1);
        cost[0] = 0;
        for (let i = 0; i <= n; i++) for (let j = 0; j <= m; j++) {
            const c0 = cost[i * (m + 1) + j];
            if (c0 === Infinity) continue;
            const a0 = pa(i), b0 = pb(j);
            for (const [di, dj] of STEPS) {
                const i2 = i + di, j2 = j + dj;
                if (i2 > n || j2 > m) continue;
                const a1 = pa(i2), b1 = pb(j2);
                const da = fa(i2) - fa(i), db = (fb(j2) - fb0) - (fb(j) - fb0), dt = (da + db) / 2;
                const tx = (a1[0] - SA.cx) - (b1[0] - SB.cx), ty = (a1[1] - SA.cy) - (b1[1] - SB.cy);
                const c = c0 + (tx * tx + ty * ty) * dt + lambda * bendOf(a1[0] - a0[0], a1[1] - a0[1], b1[0] - b0[0], b1[1] - b0[1]) / (dt || 1e-9);
                const k = i2 * (m + 1) + j2;
                if (c < cost[k]) { cost[k] = c; from[k] = i * (m + 1) + j; }
            }
        }
        const end = n * (m + 1) + m;
        if (!best || cost[end] < best.cost) {
            const pairs = [];
            for (let k = end; k >= 0; k = from[k]) { const i = Math.floor(k / (m + 1)), j = k % (m + 1); pairs.unshift([fa(i), fb(j)]); if (k === 0) break; }
            best = { pairs, cost: cost[end], s };
        }
    }
    return best;
}

// points along a pairing (by the joint parameter), at in-between u
function along(SA, SB, pairs, u, count = 256) {
    const P = SA.P, Q = SB.P, out = [];
    const len = pairs.map((p, k) => (k ? (pairs[k][0] - pairs[k - 1][0]) + (pairs[k][1] - pairs[k - 1][1]) : 0));
    const total = len.reduce((a, b) => a + b, 0);
    let k = 1, acc = 0;
    for (let s = 0; s < count; s++) {
        const t = s / count * total;
        while (k < pairs.length - 1 && acc + len[k] < t) { acc += len[k]; k++; }
        const w = len[k] ? (t - acc) / len[k] : 0, f0 = pairs[k - 1][0] + (pairs[k][0] - pairs[k - 1][0]) * w, f1 = pairs[k - 1][1] + (pairs[k][1] - pairs[k - 1][1]) * w;
        const a = MF.at(P, SA.M, ((f0 % 1) + 1) % 1), b = MF.at(Q, SB.M, ((f1 % 1) + 1) % 1);
        out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
    }
    return out;
}
// a loop's points respaced evenly along its own length
function respace(pts, count) {
    const n = pts.length, cum = [0];
    for (let k = 0; k < n; k++) cum.push(cum[k] + Math.hypot(pts[(k + 1) % n][0] - pts[k][0], pts[(k + 1) % n][1] - pts[k][1]));
    const out = [];
    let k = 0;
    for (let s = 0; s < count; s++) {
        const t = s / count * cum[n];
        while (k < n - 1 && cum[k + 1] < t) k++;
        const w = (t - cum[k]) / ((cum[k + 1] - cum[k]) || 1), p = pts[k], q = pts[(k + 1) % n];
        out.push([p[0] + (q[0] - p[0]) * w, p[1] + (q[1] - p[1]) * w]);
    }
    return out;
}
const US = [...Array(19).keys()].map((k) => (k + 1) / 20);
function judge(SA, SB, pairs) {
    let cross = 0, neck = Infinity, tr = 0;
    for (const u of US) {
        const pts = along(SA, SB, pairs, u);
        cross += MF._selfCrossings(pts, 1e9);
        neck = Math.min(neck, MF._neckOf(respace(pts, 64)));
    }
    const k0 = Math.min(MF._neckOf(respace(along(SA, SB, pairs, 0), 64)), MF._neckOf(respace(along(SA, SB, pairs, 1), 64)));
    const a = along(SA, SB, pairs, 0, 512), b = along(SA, SB, pairs, 1, 512);
    for (let k = 0; k < 512; k++) { const dx = a[k][0] - SA.cx - (b[k][0] - SB.cx), dy = a[k][1] - SA.cy - (b[k][1] - SB.cy); tr += dx * dx + dy * dy; }
    return { cross, neck: neck / k0, travel: Math.sqrt(tr / 512) };
}
// the cost of a given pairing, as the DTW prices it (for the hand-made one)
function price(SA, SB, pairs, lambda) {
    let c = 0;
    const step = 1 / 512;
    for (let k = 1; k < pairs.length; k++) {
        const [a0, b0] = pairs[k - 1], [a1, b1] = pairs[k], n = Math.max(1, Math.ceil(((a1 - a0) + (b1 - b0)) / step));
        let pa = MF.at(SA.P, SA.M, ((a0 % 1) + 1) % 1), pb = MF.at(SB.P, SB.M, ((b0 % 1) + 1) % 1);
        for (let s = 1; s <= n; s++) {
            const qa = MF.at(SA.P, SA.M, (((a0 + (a1 - a0) * s / n) % 1) + 1) % 1), qb = MF.at(SB.P, SB.M, (((b0 + (b1 - b0) * s / n) % 1) + 1) % 1);
            const dt = ((a1 - a0) + (b1 - b0)) / 2 / n, tx = qa[0] - SA.cx - (qb[0] - SB.cx), ty = qa[1] - SA.cy - (qb[1] - SB.cy);
            c += (tx * tx + ty * ty) * dt + lambda * bendOf(qa[0] - pa[0], qa[1] - pa[1], qb[0] - pb[0], qb[1] - pb[1]) / (dt || 1e-9);
            pa = qa;
            pb = qb;
        }
    }
    return c;
}

const cases = [['T into an upside-down T', [T, flip(T)], 'T'], ['L into the L flipped', [L, flip(L)]]];
for (const [font, keys, name] of (process.argv[4] === 'few' ? [] : [['ComicNeue-Bold', 'MW', 'M into W'], ['PatrickHand-Regular', 'AR', 'A into R'], ['ComicNeue-Bold', 'EF', 'E into F'], ['ComicNeue-Bold', 'KX', 'K into X'], ['Bangers-Regular', 'NZ', 'N into Z'], ['ComicNeue-Bold', 'vh', 'v into h'], ['ComicNeue-Bold', 'un', 'u into n']])) {
    try {
        const res = MF.matchPieces(build({ font, keys }));
        const p = res.keys[0].findIndex((_, q) => res.roles.every((r) => r[q] === 1));
        cases.push([name, res.keys.map((row) => row[p])]);
    } catch (e) { console.log(name, 'skipped', e.message); }
}
const LAMBDAS = (process.argv[2] || '0,0.001,0.003,0.01,0.03').split(',').map(Number);
const CELL = 130, show = [];
for (const [name, keys, tag] of cases) {
    // raw polygons for the hand-made T (their starts are known); the fix's paths for the rest
    const [A, B] = tag === 'T' ? keys : MF.fix(keys, { maxPoints: 100 }).paths;
    const NS = Number(process.env.NS || 96), SA = sampled(A, NS), SB = sampled(B, NS);
    const rows = [['even (today)', [[0, 0], [1, 1]]]];
    if (tag === 'T') {
        // the bar slides down through the stem: T, +, upside-down T (fractions of 1200)
        const h = [[0, 0], [115, 115], [115, 355], [185, 425], [185, 665], [300, 780], [360, 840], [475, 955], [715, 955], [785, 1025], [1025, 1025], [1140, 1140], [1200, 1200]];
        rows.push(['by hand: the bar slides (a + halfway)', h.map(([a, b]) => [a / 1200, b / 1200])]);
    }
    const t0 = Date.now();
    for (const lam of LAMBDAS) rows.push([`DTW, bend x ${lam}`, dtw(SA, SB, lam).pairs]);
    const ms = Date.now() - t0;
    console.log(`\n${name} (corners ${SA.corners.length} / ${SB.corners.length}, ${SA.p.length} x ${SB.p.length} samples, DTW ${(ms / LAMBDAS.length).toFixed(0)} ms each)`);
    for (const [label, pairs] of rows) {
        const j = judge(SA, SB, pairs), costs = LAMBDAS.map((l) => (price(SA, SB, pairs, l) / 1e3).toFixed(1)).join(' ');
        console.log(`  ${label.padEnd(40)} travel ${j.travel.toFixed(1).padStart(6)}  crossings ${String(j.cross).padStart(3)}  neck ${(j.neck * 100).toFixed(0).padStart(4)} %   cost(k) ${costs}`);
        show.push({ name, label, SA, SB, pairs, j });
    }
}
// the sheet
let body = '', y = 0;
const d = (pts) => 'M' + pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L') + 'Z';
const UU = [0, 0.25, 0.5, 0.75, 1];
for (const r of show) {
    const { SA, SB } = r, ext = Math.max(...SA.p.map((p) => Math.max(Math.abs(p[0] - SA.cx), Math.abs(p[1] - SA.cy))), ...SB.p.map((p) => Math.max(Math.abs(p[0] - SB.cx), Math.abs(p[1] - SB.cy))));
    const s = (CELL / 2 - 8) / ext, bad = r.j.cross > 0 ? '#b3261e' : r.j.neck < 0.5 ? '#b26a00' : '#1d6b3a';
    body += `<text x="8" y="${y + 15}" font-size="13" font-family="sans-serif">${r.name} · ${r.label} · <tspan fill="${bad}">crossings ${r.j.cross}, neck ${(r.j.neck * 100).toFixed(0)} %</tspan>, travel ${r.j.travel.toFixed(0)}</text>`;
    UU.forEach((u, k) => {
        const cx = k * CELL + CELL / 2, cy = y + 22 + CELL / 2, ox = SA.cx + (SB.cx - SA.cx) * u, oy = SA.cy + (SB.cy - SA.cy) * u;
        const pts = along(SA, SB, r.pairs, u).map(([px, py]) => [cx + (px - ox) * s, cy + (py - oy) * s]);
        body += `<path d="${d(pts)}" fill="#22304a" fill-opacity="0.82" fill-rule="evenodd" stroke="#22304a" stroke-width="0.6"/>`;
        for (let q = 0; q < 256; q += 32) body += `<circle cx="${pts[q][0].toFixed(1)}" cy="${pts[q][1].toFixed(1)}" r="2.2" fill="#e8661f"/>`;
    });
    y += CELL + 28;
}
const Wd = UU.length * CELL, svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Wd}" height="${y}" style="background:#f3efe7">${body}</svg>`;
fs.mkdirSync(dir + '/out/art', { recursive: true });
const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage({ viewport: { width: Wd, height: y } });
await page.setContent(`<body style="margin:0">${svg}</body>`);
await page.screenshot({ path: dir + '/out/art/warp.png' });
await browser.close();
