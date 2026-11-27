// make-spec.mjs - writes demo-spec.js, the drawing make-demo.jsx builds in After Effects and
// scene.js previews: the word "draw" in Patrick Hand (OFL, fonts/), letter outlines read by the
// morph fixer's TrueType reader, with a swash under it, a lasso round it, sparkle ticks and a
// star. Stroke lengths run from about 30 px (a tick) to about 2,500 px (the lasso), and the
// layers exercise what the rig has to see through: a scaled layer, a parented one, a group
// stretched and turned, a star with the designer's own keyed Trim Paths.
//
//   node sandbox/2026-11-23-ae-draw-on-rig/art/make-spec.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFont, charPaths } from '../../2026-11-21-ae-morph-fixer/art/ttf.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(dir, '..', '..', '..');
const font = loadFont(path.join(ROOT, 'fonts', 'PatrickHand-Regular.ttf'));
const r2 = (x) => Math.round(x * 100) / 100;
const P = (v, i, o, closed) => ({ v: v.map((p) => p.map(r2)), i: i.map((p) => p.map(r2)), o: o.map((p) => p.map(r2)), closed });
const zeros = (n) => Array.from({ length: n }, () => [0, 0]);

// the word: letters side by side on one baseline ("draw" has no descenders: the bottom of each
// letter's box is the baseline), around the layer's origin
const SIZE = 460, GAP = 22, word = 'draw';
const letters = [];
let x = 0;
for (const ch of word) {
    const paths = charPaths(font, ch, SIZE);
    let x0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of paths) for (const [px, py] of p.v) {
        x0 = Math.min(x0, px);
        x1 = Math.max(x1, px);
        y1 = Math.max(y1, py);
    }
    letters.push({ ch, paths: paths.map((p) => ({ v: p.v.map(([px, py]) => [px - x0 + x, py - y1]), i: p.i, o: p.o })), w: x1 - x0 });
    x += x1 - x0 + GAP;
}
const width = x - GAP;
const groups = letters.map((l) => ({
    name: l.ch,
    // outlines first (the biggest piece), then holes: Individually draws them in this order
    paths: l.paths.map((p) => P(p.v.map(([px, py]) => [px - width / 2, py]), p.i, p.o, true)),
}));

// two sparkles of three ticks, placed in the comp (above the word's corners, outside the lasso)
// and written in the space of the null they are parented to
const MOVER = { name: 'Sparkle Mover', position: [1520, 300], scale: [125, 125], rotation: 10 };
function toMover([px, py]) {
    const dx = px - MOVER.position[0], dy = py - MOVER.position[1], a = (-MOVER.rotation * Math.PI) / 180;
    return [(dx * Math.cos(a) - dy * Math.sin(a)) / (MOVER.scale[0] / 100), (dx * Math.sin(a) + dy * Math.cos(a)) / (MOVER.scale[1] / 100)];
}
const sparkles = [];
for (const [cx, cy, base] of [[1540, 250, -50], [380, 250, -130]]) {
    for (const da of [-48, 0, 48]) {
        const a = ((base + da) * Math.PI) / 180, r0 = da ? 20 : 16, r1 = da ? 46 : 58;
        sparkles.push([toMover([cx + r0 * Math.cos(a), cy + r0 * Math.sin(a)]), toMover([cx + r1 * Math.cos(a), cy + r1 * Math.sin(a)])]);
    }
}

const spec = {
    size: [1920, 1080], fps: 24, duration: 6, bg: [22, 25, 40],
    nulls: [MOVER],
    layers: [
        { name: 'Word', color: [246, 238, 220], width: 9, position: [960, 600], scale: [100, 100], rotation: 0, groups },
        {
            // a long wavy underline; its layer is scaled down and moved, so its length in the
            // comp is 85 % of what it is in the layer
            name: 'Swash', color: [255, 132, 72], width: 9, position: [960, 742], scale: [85, 85], rotation: -2,
            groups: [{
                name: 'Underline',
                paths: [P([[-700, 20], [-260, 0], [200, 18], [690, -40]], [[0, 0], [-170, 22], [-170, -12], [-150, 56]], [[170, -34], [170, -22], [170, 12], [0, 0]], false)],
            }],
        },
        {
            // a circle in a group stretched 3.3 x 0.95 and turned: a lasso round the word. Trim
            // Paths counts its length unstretched, so without the rig's table the pen would race
            // along the long sides
            name: 'Lasso', color: [130, 196, 255], width: 7, position: [960, 440], scale: [100, 100], rotation: 0,
            groups: [{ name: 'Loop', shapes: [{ kind: 'ellipse', size: [300, 300], position: [0, 0] }], transform: { a: [0, 0], p: [0, 0], s: [376, 166], k: 0, ka: 0, r: -4 } }],
        },
        {
            // sparkle ticks, parented to a null that is scaled and turned
            name: 'Sparkles', color: [255, 214, 92], width: 8, position: [0, 0], scale: [100, 100], rotation: 0, parent: 'Sparkle Mover',
            groups: sparkles.map((seg, k) => ({ name: 'Tick ' + (k + 1), paths: [P(seg, zeros(2), zeros(2), false)] })),
        },
        {
            // a star whose Trim Paths the designer keyed already (End 0 -> 100 from 0.4 s to 1.6 s)
            name: 'Star', color: [255, 112, 162], width: 7, position: [1640, 610], scale: [100, 100], rotation: 0,
            groups: [{ name: 'Star', shapes: [{ kind: 'star', points: 5, inner: 26, outer: 58, rotation: 0, position: [0, 0] }], trimKeys: [[0.4, 0], [1.6, 100]] }],
        },
    ],
    // the "Same duration" comp: every Trim Paths keyed End 0 -> 100 over the same time, one after
    // another (what keying by hand gives); "Constant speed" draws in the same total time
    sameDuration: { start: 0.3, each: 0.34 },
};

const js = `// demo-spec.js - the drawing make-demo.jsx builds in After Effects and scene.js previews, in one
// place so they can't drift apart. Plain ES3. Generated by art/make-spec.mjs (edit that, not this).
// Paths are { v, i, o, closed } (tangents relative to their vertex) in their layer's space, y
// down; colours 0-255; times in seconds.
var DS = ${JSON.stringify(spec)};
`;
fs.writeFileSync(path.join(dir, '..', 'demo-spec.js'), js);
console.log(`demo-spec.js: ${spec.layers.reduce((n, l) => n + l.groups.length, 0)} strokes, word ${Math.round(width)} px wide, ${js.length} bytes`);
