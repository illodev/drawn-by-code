// Lists the strokes of a set near a point: node tools/probe.mjs <set> <x> <y> [radius]
// (the scene stashes its sets in window.__oil when opened with this tool)
import { openScene } from '../../../engine/browser.mjs';
const [set, x, y, r = 30] = process.argv.slice(2);
const { page, close } = await openScene('sandbox/2026-11-12-oil-test/scene.js', { size: 480 });
const out = await page.evaluate(([set, x, y, r]) => {
    const S = window.__oil[set], A = S.a, res = [];
    for (let i = 0; i < S.n; i++) {
        const o = i * Oil.STRIDE;
        if (Math.hypot(A[o] - x, A[o + 1] - y) < r) res.push({ i, x: A[o].toFixed(0), y: A[o + 1].toFixed(0), ang: A[o + 2].toFixed(2), hl: A[o + 3].toFixed(1), hw: A[o + 4].toFixed(1), lv: A[o + 12] });
    }
    return { n: S.n, per: S.levels.map((_, l) => { let c = 0; for (let i = 0; i < S.n; i++) if (A[i * Oil.STRIDE + 12] === l) c++; return c; }), res };
}, [set, +x, +y, +r]);
console.log(set, 'strokes', out.n, 'per level', out.per.join(' '));
console.table(out.res.slice(0, 60));
await close();
