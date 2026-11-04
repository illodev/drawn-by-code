// Finds everyone standing in the river: evaluates every villager's and child's pose on the
// film's timeline (twos) and tests their feet against the water (between the two shores,
// below the far shore line), except on the bridge's deck or the rope bridge.
//   node sandbox/2026-11-04-red-thread/tools/check-feet.mjs
import fs from 'node:fs';
globalThis.document = { createElement: () => ({ getContext: () => ({}) }) };
const D = 'sandbox/2026-11-04-red-thread/';
const src = ['engine/core.js', 'styles/sumi-e/sumi.js', D + 'cast.js', D + 'kite.js', D + 'film.js'].map((f) => fs.readFileSync(f, 'utf8')).join(';\n');
const api = new Function(src + `; return { RT, Film };`)();
const { RT, Film } = api;
const SL = [[1040, 650], [960, 662], [860, 688], [800, 722], [770, 765], [720, 808], [600, 842], [430, 872], [240, 905], [40, 940], [-200, 975], [-700, 990]];
const SR = [[1330, 650], [1480, 660], [1640, 690], [1710, 714], [1760, 752], [1800, 800], [1880, 842], [2040, 875], [2260, 905], [2500, 930], [3100, 960]];
const sx = (sh, y) => { for (let i = 1; i < sh.length; i++) if (y <= sh[i][1]) { const u = (y - sh[i - 1][1]) / (sh[i][1] - sh[i - 1][1]); return sh[i - 1][0] + (sh[i][0] - sh[i - 1][0]) * u; } return sh[sh.length - 1][0]; };
const wet = (x, y, t) => {
    if (y < 652) return false;
    if (y < 700 && x > 815 && x < 1685) {
        const intact = t < 30.4, rope = t >= 59.2;
        if (intact || x < 990 || x > 1520 || rope) return false;
    }
    return x > sx(SL, y) + 6 && x < sx(SR, y) - 6;
};
const bad = {};
for (let f = 0; f < 68 * 12; f++) {
    const t = f / 12;
    const poses = Object.keys(Film.V).map((id) => Film.villager(id, t));
    if (t < 32) poses.push(Film.kid('girl', t), Film.kid('boy', t));
    for (const p of poses) {
        if (t >= 32 && t < 43) continue;            // only the children are on screen then
        if (wet(p.x, p.y, t)) (bad[p.id] ??= []).push(t.toFixed(2) + `@${p.x.toFixed(0)},${p.y.toFixed(0)}`);
    }
}
for (const [id, ts] of Object.entries(bad)) console.log(id, ts.length, ts[0], '…', ts[ts.length - 1]);
if (!Object.keys(bad).length) console.log('nobody in the river');
