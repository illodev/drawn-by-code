// Finds people who overlap each other, and adults who cross the children's kite string:
// evaluates every pose on the film's timeline (twos) and reports each pair whose bodies
// overlap (feet less than ~0.3 of a height apart and on the same ground line), and every
// adult whose body crosses the string between the children (act 2).
//   node sandbox/2026-11-04-red-thread/tools/check-overlap.mjs
import fs from 'node:fs';
globalThis.document = { createElement: () => ({ getContext: () => ({}) }) };
const D = 'sandbox/2026-11-04-red-thread/';
const src = ['engine/core.js', 'styles/sumi-e/sumi.js', D + 'cast.js', D + 'kite.js', D + 'film.js'].map((f) => fs.readFileSync(f, 'utf8')).join(';\n');
const { Film } = new Function(src + `; return { RT, Film };`)();
// the children's act-2 path (a copy of KID_PATH in scene.js, positions only)
const scene = fs.readFileSync(D + 'scene.js', 'utf8');
const KP = new Function('return ' + scene.match(/const KID_PATH = (\{[\s\S]*?\n    \});/)[1].replace(/'deck'|'rope'/g, '700'))();
const at = (keys, t) => {
    let i = 0;
    while (i < keys.length - 2 && t >= keys[i + 1][0]) i++;
    const [ta, xa, ya] = keys[i], [tb, xb, yb] = keys[i + 1], u = Math.max(0, Math.min(1, (t - ta) / (tb - ta)));
    return [xa + (xb - xa) * u, ya + (yb - ya) * u];
};
const bad = {};
const flag = (k, t, info = '') => (bad[k] ??= []).push([t, info]);
for (let f = 0; f < 68 * 12; f++) {
    const t = f / 12;
    if (t >= 31 && t < 43) continue;                  // the act change, grey and kite shots
    const poses = Object.keys(Film.V).map((id) => Film.villager(id, t)).filter((p) => p.x > -100 && p.x < 2600);
    let kids;
    if (t < 31) kids = [Film.kid('girl', t), Film.kid('boy', t)];
    else kids = ['girl', 'boy'].map((id) => { const [x, y] = at(KP[id], t); return { id, x, y, h: id === 'girl' ? 175 : 185 }; });
    const all = [...poses, ...kids];
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
        const a = all[i], b = all[j];
        if (a.id + b.id === 'girlboy' && (t < 20.2 || t > 60.5)) continue;   // hand in hand, side by side on his rock
        const h = Math.min(a.h, b.h);
        if (Math.abs(a.x - b.x) < 0.3 * h && Math.abs(a.y - b.y) < 0.25 * h) flag(a.id + '×' + b.id, t, `${a.x.toFixed(0)},${a.y.toFixed(0)} ${b.x.toFixed(0)},${b.y.toFixed(0)}`);
    }
    if (t >= 43 && t < 58) {
        // the string from the girl's hand to the boy's: no adult body may cross it
        const [g, b] = kids, ga = [g.x + 40, g.y - g.h * 0.75], ba = [b.x - 40, b.y - b.h * 0.75];
        for (const p of poses) {
            if (p.x < ga[0] || p.x > ba[0]) continue;
            const u = (p.x - ga[0]) / (ba[0] - ga[0]), sy = ga[1] + (ba[1] - ga[1]) * u + 30;
            if (sy > p.y - p.h && sy < p.y) flag(p.id + '×string', t, `${p.x.toFixed(0)},${p.y.toFixed(0)}`);
        }
    }
}
// contiguous runs (a gap of more than two samples starts a new run); short runs are people
// passing each other in lanes, reported only with --all
const all = process.argv.includes('--all');
for (const [k, ts] of Object.entries(bad)) {
    const runs = [];
    for (const [t, info] of ts) {
        const r = runs[runs.length - 1];
        if (r && t - r.t1 < 0.25) { r.t1 = t; r.n++; } else runs.push({ t0: t, t1: t, n: 1, info });
    }
    for (const r of runs) if (all || r.n > 6 || k.includes('string')) console.log(k.padEnd(18), r.t0.toFixed(2), '–', r.t1.toFixed(2), `(${r.n})`, r.info);
}
if (!Object.keys(bad).length) console.log('no overlaps');
