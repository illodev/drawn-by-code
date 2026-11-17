// Magazine-ad style kit: a scene printed like a 1950s magazine advertisement. Two spot inks
// (orange, turquoise) and a black key plate on cream stock, flat and through coarse
// halftone screens, a little out of register; brush-ink outlines that swell and taper;
// «atomic age» graphics (starbursts, boomerangs) and a brush-script word. Global: Ad.
// The press is the risograph press (styles/risograph/riso.js, load it first) with this
// print's own inks and paper.
//
//   const press = Ad.press(env)                once, in setup
//   press.begin(d) … press.plate('orange', 'screen') … press.print(g, { key: d })
//   Ad.brush(g, pts, w, seed, o)               a brush-ink stroke through pts (tapered)
//   Ad.starburst(g, x, y, r, seed, o)          a thin-armed sparkle
//   Ad.boomerang(g, x, y, s, rot)              the boomerang shape, filled
//   Ad.script(g, text, x, y, size, o)          brush-script lettering (Kaushan Script)
//
// Measured on the two approved generated references (ref/C-a.png, ref/C-b.png, 1280 × 720):
// paper #f4e2c5; solids orange #eb5f18, turquoise #1e8c97, black #141411; the colour
// screens are fine (≈ 2 px at 1280, 3.2 at 1080), the black's coarser (×1.4). An ink's rgb is
// the solid divided by the paper (the press multiplies).
const Ad = (() => {
    const deg = Math.PI / 180;
    const PAPER = [244, 226, 197];
    const INKS = {
        orange: { rgb: [246, 107, 31], angle: 75 * deg, pitch: 1 },
        turquoise: { rgb: [31, 158, 195], angle: 15 * deg, pitch: 1 },
        black: { rgb: [21, 21, 22], angle: 45 * deg, pitch: 1.4 },
    };
    const ORDER = ['orange', 'turquoise', 'black'];
    const tone = (v) => `rgba(0,0,0,${Math.max(0, Math.min(1, v))})`;

    function press(env, o = {}) {
        return Riso.press(env, {
            palette: INKS, order: ORDER, paper: PAPER,
            pitch: o.pitch ?? 3.2,
            register: o.register ?? { orange: [-2, 1], turquoise: [2, 2], black: [0, 0] },
            fibres: o.fibres ?? 0.25, // coated magazine stock: fewer fibres than riso paper
            // crisp little dots: the reference's screens read as dots, not as a tint
            edge: o.edge ?? 0.6, spread: o.spread ?? 0.35,
        });
    }

    // centripetal-ish Catmull-Rom through pts, sampled every ~step units
    function smooth(pts, step = 3) {
        if (pts.length < 3) return pts.slice();
        const out = [];
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
            const n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
            for (let k = 0; k < n; k++) {
                const t = k / n, t2 = t * t, t3 = t2 * t;
                const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
                out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
            }
        }
        out.push(pts[pts.length - 1]);
        return out;
    }

    // A brush-ink stroke: the line swells in the middle and tapers to a point at each end
    // (o.taper: [start, end] as a fraction of the length, 0 = blunt), with a slow pressure
    // wobble (o.wobble). Filled as one polygon in the current fillStyle (o.color).
    function brush(g, pts, w, seed, o = {}) {
        const P = smooth(pts, o.step ?? 2.5);
        if (P.length < 2) return;
        const L = [0];
        for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
        const len = L[L.length - 1] || 1, [ta, tb] = o.taper ?? [0.25, 0.3], wob = o.wobble ?? 0.25;
        const left = [], right = [];
        for (let i = 0; i < P.length; i++) {
            const u = L[i] / len;
            const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
            let nx = -(b[1] - a[1]), ny = b[0] - a[0];
            const nl = Math.hypot(nx, ny) || 1;
            nx /= nl; ny /= nl;
            const ea = ta > 0 ? Math.min(1, u / ta) : 1, eb = tb > 0 ? Math.min(1, (1 - u) / tb) : 1;
            const prof = Math.sqrt(Math.max(0, Math.min(ea, eb))) * (1 + wob * Motion.noise1('br' + seed, L[i] / 40));
            const hw = Math.max(o.min ?? 0.15, (w / 2) * prof);
            left.push([P[i][0] + nx * hw, P[i][1] + ny * hw]);
            right.push([P[i][0] - nx * hw, P[i][1] - ny * hw]);
        }
        g.save();
        if (o.color) g.fillStyle = o.color;
        g.beginPath();
        left.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        for (let i = right.length - 1; i >= 0; i--) g.lineTo(right[i][0], right[i][1]);
        g.closePath();
        g.fill();
        g.restore();
    }

    // A sparkle: n thin arms (long and short alternating), each a tapered brush stroke from
    // the centre, and a small dot in the middle. o.rot turns it, o.p (0..1) draws it on.
    function starburst(g, x, y, r, seed, o = {}) {
        const n = o.arms ?? 8, rot = o.rot ?? 0, p = o.p ?? 1, w = o.w ?? r * 0.07, rr = Motion.rng('sb' + seed);
        for (let i = 0; i < n; i++) {
            const a = rot + (i / n) * Math.PI * 2 + (rr() - 0.5) * 0.06;
            const len = r * (i % 2 ? o.short ?? 0.55 : 1) * (0.93 + rr() * 0.14) * p;
            if (len <= 0) continue;
            brush(g, [[x, y], [x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.5], [x + Math.cos(a) * len, y + Math.sin(a) * len]], w, seed + ':' + i, { taper: [0, 0.85], wobble: 0.1 });
        }
        g.save();
        if (o.color) g.fillStyle = o.color;
        g.beginPath();
        g.arc(x, y, w * 0.9 * p, 0, Math.PI * 2);
        g.fill();
        g.restore();
    }

    // The boomerang: a fat chevron whose two arms curve back to points. Unit shape spans
    // about [-1, 1] × [-0.45, 0.45] before the scale s; rot turns it about (x, y).
    function boomerang(g, x, y, s, rot = 0, o = {}) {
        const k = o.thin ?? 1;
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(s, s);
        if (o.color) g.fillStyle = o.color;
        g.beginPath();
        g.moveTo(-1, -0.42);
        g.quadraticCurveTo(0.1, -0.05 * k, 1, -0.28);
        g.quadraticCurveTo(0.55, 0.05, 0.62, 0.42);
        g.quadraticCurveTo(0.05, 0.22 * k, -1, -0.42);
        g.closePath();
        g.fill();
        g.restore();
    }

    // Brush-script lettering, slanted a little, on whatever plate g is. o.font overrides.
    function script(g, text, x, y, size, o = {}) {
        g.save();
        g.translate(x, y);
        g.rotate(o.rot ?? -0.12);
        g.transform(1, 0, o.slant ?? -0.08, 1, 0, 0);
        g.font = `${size}px ${o.font ?? "'Kaushan Script'"}`;
        g.textAlign = o.align ?? 'left';
        g.textBaseline = 'alphabetic';
        if (o.color) g.fillStyle = o.color;
        g.fillText(text, 0, 0);
        if (o.stroke) { g.lineWidth = o.stroke; g.strokeStyle = g.fillStyle; g.lineJoin = 'round'; g.strokeText(text, 0, 0); }
        g.restore();
    }

    return { INKS, ORDER, PAPER, tone, press, smooth, brush, starburst, boomerang, script };
})();
