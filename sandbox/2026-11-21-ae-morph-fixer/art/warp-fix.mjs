// The fix with and without the warp, on the warp prototype's cases: the final paths' in-betweens
// (as AE morphs them, point k with point k), crossings and pinches measured on them, travel,
// time. Writes review/warp.png (committed: it shows what the warp does).
import fs from 'fs';
import { chromium } from 'playwright-core';
import { findChrome } from '../../../engine/browser.mjs';
import { build } from './cases.mjs';
const dir = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const MF = new Function(fs.readFileSync(dir + '/morph-math.js', 'utf8') + '\nreturn MF;')();

const poly = (pts) => ({ v: pts.map((p) => p.slice()), i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), closed: true });
const flip = (P) => { const R = MF.copy(P); R.v = R.v.map(([x, y]) => [x, -y]); R.v.reverse(); return R; };
const T = poly([[-150, -150], [150, -150], [150, -90], [35, -90], [35, 150], [-35, 150], [-35, -90], [-150, -90]]);
const L = poly([[-100, -150], [-30, -150], [-30, 80], [120, 80], [120, 150], [-100, 150]]);
const outline = (font, keys) => {
    const res = MF.matchPieces(build({ font, keys }));
    const p = res.keys[0].findIndex((_, q) => res.roles.every((r) => r[q] === 1));
    return res.keys.map((row) => row[p]);
};
const cases = [['T into an upside-down T', [T, flip(T)]], ['L into the L flipped', [L, flip(L)]]];
for (const [font, keys, name] of [['ComicNeue-Bold', 'un', 'u into n'], ['ComicNeue-Bold', 'EF', 'E into F'], ['Bangers-Regular', 'NZ', 'N into Z'], ['ComicNeue-Bold', 'vh', 'v into h'], ['ComicNeue-Bold', 'KX', 'K into X'], ['PatrickHand-Regular', 'AR', 'A into R'], ['ComicNeue-Bold', 'MW', 'M into W']]) cases.push([name, outline(font, keys)]);
cases.push(['T, L, T upside down (a chain)', [T, L, flip(T)]]);
// shapes that share a mirror axis: their warp is built mirrored
const turnPts = (pts, deg) => { const a = deg * Math.PI / 180; return pts.map(([x, y]) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]); };
const star = (R, r, rot) => { const p = []; for (let k = 0; k < 10; k++) { const a = (rot - 90 + k * 36) * Math.PI / 180, rr = k % 2 ? r : R; p.push([rr * Math.cos(a), rr * Math.sin(a)]); } return p; };
const plus = [[-30, -150], [30, -150], [30, -30], [150, -30], [150, 30], [30, 30], [30, 150], [-30, 150], [-30, 30], [-150, 30], [-150, -30], [-30, -30]];
const arrow = poly([[0, -150], [120, 0], [40, 0], [40, 150], [-40, 150], [-40, 0], [-120, 0]]);
cases.push(['arrow up into arrow down', [arrow, flip(arrow)]], ['star into the star turned 36 deg', [poly(star(150, 60, 0)), poly(star(110, 89, 36))]], ['plus into x', [poly(plus), poly(turnPts(plus, 45))]], ['star into plus', [poly(star(150, 60, 0)), poly(plus)]], ['triangle into square', [poly([[0, -150], [140, 110], [-140, 110]]), poly([[-120, -120], [120, -120], [120, 120], [-120, 120]])]]);

// points along a path, 6 a segment; the neck as the fix measures it
const pointsOf = (P) => { const out = []; for (let k = 0; k < MF.segCount(P); k++) for (let t = 0; t < 6; t++) out.push(MF.bez(MF.seg(P, k), t / 6)); return out; };
const neck64 = (P) => { const M = MF.measure(P), pts = []; for (let j = 0; j < 64; j++) pts.push(MF.at(P, M, j / 64)); let m = Infinity; for (let i = 0; i < 64; i++) for (let j = i + 4; j < 64; j++) if (64 - (j - i) >= 4) m = Math.min(m, Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1])); return m; };
function judge(A, B) {
    let cross = 0, neck = Infinity;
    for (let q = 1; q < 20; q++) {
        const Lq = MF.lerp(A, B, q / 20);
        cross += crossCount(pointsOf(Lq));
        neck = Math.min(neck, neck64(Lq));
    }
    return { cross, neck: neck / Math.min(neck64(A), neck64(B)) };
}
// (repeated points dropped first: a warp keeps some points together in both keys of a step)
function crossCount(all) {
    const pts = all.filter((p, k) => { const q = all[(k + all.length - 1) % all.length]; return Math.abs(p[0] - q[0]) > 1e-6 || Math.abs(p[1] - q[1]) > 1e-6; });
    let c = 0;
    const n = pts.length;
    for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue;
        const a = pts[i], b = pts[(i + 1) % n], p = pts[j], r = pts[(j + 1) % n];
        // (edges in line with each other, a piece shrinking along itself, aren't a crossing:
        // their cross products are rounding noise)
        const e = 1e-6 * Math.hypot(b[0] - a[0], b[1] - a[1]) * Math.hypot(r[0] - p[0], r[1] - p[1]), sg = (x) => (x > e ? 1 : x < -e ? -1 : 0);
        const d1 = sg((r[0] - p[0]) * (a[1] - p[1]) - (r[1] - p[1]) * (a[0] - p[0])), d2 = sg((r[0] - p[0]) * (b[1] - p[1]) - (r[1] - p[1]) * (b[0] - p[0]));
        const d3 = sg((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])), d4 = sg((b[0] - a[0]) * (r[1] - a[1]) - (b[1] - a[1]) * (r[0] - a[0]));
        if (d1 * d2 < 0 && d3 * d4 < 0) c++;
    }
    return c;
}
const rows = [];
for (const [name, keys] of cases) {
    for (const warp of [false, true]) {
        const t0 = Date.now(), r = MF.fix(keys, { warp, symmetry: 'force' }), ms = Date.now() - t0;      // sym on, the panel's default
        const steps = r.paths.slice(1).map((B, k) => judge(r.paths[k], B));
        const line = `${name.padEnd(30)} ${warp ? 'warp' : 'even'}  points ${r.paths[0].v.length}  ${steps.map((j, k) => `crossings ${j.cross}, neck ${(j.neck * 100).toFixed(0)} %, travel ${r.keys[k + 1].after.toFixed(1)}${r.keys[k + 1].warped ? ' (warped)' : ''}`).join(' | ')}  ${ms} ms`;
        console.log(line);
        rows.push({ name, warp, r, steps });
    }
}
// the sheet: both versions of each case, 5 in-betweens per step
const CELL = 120, US = [0, 0.25, 0.5, 0.75];
let body = '', y = 0, width = 0;
const d = (P) => { let s = ''; for (let k = 0; k < MF.segCount(P); k++) { const c = MF.seg(P, k); s += (k ? '' : `M${c[0].toFixed(1)},${c[1].toFixed(1)}`) + `C${c[2].toFixed(1)},${c[3].toFixed(1)} ${c[4].toFixed(1)},${c[5].toFixed(1)} ${c[6].toFixed(1)},${c[7].toFixed(1)}`; } return s + 'Z'; };
for (const row of rows) {
    const P = row.r.paths, frames = [];
    for (let k = 0; k + 1 < P.length; k++) for (const u of US) frames.push(MF.lerp(P[k], P[k + 1], u));
    frames.push(P[P.length - 1]);
    const ext = Math.max(...P.flatMap((Q) => { const M = MF.measure(Q), S = []; for (let j = 0; j < 64; j++) S.push(MF.at(Q, M, j / 64)); const cx = S.reduce((a, p) => a + p[0], 0) / 64, cy = S.reduce((a, p) => a + p[1], 0) / 64; return S.map((p) => Math.max(Math.abs(p[0] - cx), Math.abs(p[1] - cy))); }));
    const s = (CELL / 2 - 8) / ext, bad = row.steps.some((j) => j.cross) ? '#b3261e' : row.steps.some((j) => j.neck < 0.5) ? '#b26a00' : '#1d6b3a';
    const label = `${row.name} · ${!row.warp ? 'spread evenly (before)' : row.r.keys.slice(1).some((k) => k.warped) ? 'paired by what they are (warp)' : 'warp: none keeps clear, spread evenly'} · `;
    body += `<text x="8" y="${y + 15}" font-size="13" font-family="sans-serif">${label}<tspan fill="${bad}">${row.steps.map((j) => `crossings ${j.cross}, neck ${(j.neck * 100).toFixed(0)} %`).join(' / ')}</tspan></text>`;
    frames.forEach((F, k) => {
        const M = MF.measure(F), S = []; for (let j = 0; j < 64; j++) S.push(MF.at(F, M, j / 64));
        const cx = S.reduce((a, p) => a + p[0], 0) / 64, cy = S.reduce((a, p) => a + p[1], 0) / 64;
        const G = MF.copy(F);
        G.v = G.v.map(([x, yy]) => [k * CELL + CELL / 2 + (x - cx) * s, y + 22 + CELL / 2 + (yy - cy) * s]);
        G.i = G.i.map(([x, yy]) => [x * s, yy * s]);
        G.o = G.o.map(([x, yy]) => [x * s, yy * s]);
        body += `<path d="${d(G)}" fill="#22304a" fill-opacity="0.85" fill-rule="evenodd"/>`;
        for (let j = 0; j < G.v.length; j += Math.max(1, Math.round(G.v.length / 10))) body += `<circle cx="${G.v[j][0].toFixed(1)}" cy="${G.v[j][1].toFixed(1)}" r="2" fill="#e8661f"/>`;
    });
    width = Math.max(width, frames.length * CELL);
    y += CELL + 28;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${y}" style="background:#f3efe7">${body}</svg>`;
const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage({ viewport: { width, height: y } });
await page.setContent(`<body style="margin:0">${svg}</body>`);
fs.mkdirSync(dir + '/review', { recursive: true });
await page.screenshot({ path: dir + '/review/warp.png', type: 'png' });
await browser.close();
