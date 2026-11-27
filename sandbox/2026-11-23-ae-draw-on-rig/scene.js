// 2026-11-23-ae-draw-on-rig · preview of the demo make-demo.jsx builds in After Effects.
//
// The drawing (demo-spec.js) twice, the way AE's "Draw-On demo" comp shows it:
//   left   Same duration: every Trim Paths keyed End 0 -> 100 over the same 0.34 s, one after
//          another (what keying by hand gives): ticks crawl, the lasso races
//   right  Constant speed: the rig, One after another, fitted to the same total time: one
//          pen speed for every stroke
// Lengths, orders and the stretch table come from drawon-geom.js and the timing from
// drawon-time.js, the code "Constant Speed Draw-On.jsx" carries; a stroke is drawn as far as
// its Trim Paths says, cut by arc length the way AE cuts it. A diagnostic, not a styled piece.
const DIR = 'sandbox/2026-11-23-ae-draw-on-rig/';
const rgb = (c) => `rgb(${c.join(',')})`;
const RAD = Math.PI / 180;

// layer space -> comp: position, rotation, scale (anchor at the layer's origin), then its parent
function layerMatrix(L, byName) {
    const c = Math.cos(L.rotation * RAD), s = Math.sin(L.rotation * RAD), sx = L.scale[0] / 100, sy = L.scale[1] / 100;
    const M = [c * sx, -s * sy, s * sx, c * sy, L.position[0], L.position[1]];
    return L.parent ? DG.mul(layerMatrix(byName[L.parent], byName), M) : M;
}
function shapePath(sh) {
    if (sh.kind === 'ellipse') return DG.ellipse(sh.size, sh.position, 1);
    return DG.star(1, sh.points, sh.position, sh.rotation, sh.inner, sh.outer, 1);
}

// every stroke: its paths as [{ P, M }] (M = its group's space -> comp), each path sampled
function strokes() {
    const byName = {}, out = [];
    for (const n of DS.nulls) byName[n.name] = Object.assign({ rotation: 0, scale: [100, 100] }, n);
    for (const L of DS.layers) byName[L.name] = L;
    for (const L of DS.layers) {
        const ML = layerMatrix(L, byName);
        for (const g of L.groups) {
            const M = g.transform ? DG.mul(ML, DG.groupMatrix(g.transform)) : ML;
            const paths = g.paths || g.shapes.map(shapePath);
            const items = paths.map((P) => ({ P, M }));
            // per path: its samples and its share of the trim (unstretched length, like AE)
            const parts = items.map((it) => DG.sample([it]));
            const total = parts.reduce((s, p) => s + p.T[p.T.length - 1], 0);
            out.push({ layer: L, group: g, items, parts, total, m: DG.measure(items) });
        }
    }
    return out;
}

// draws stroke s from trim fraction a to b (as Trim Paths would), offset and scaled
function drawTrim(g, s, a, b, ox, oy, k) {
    if (b <= a) return;
    let acc = 0;
    g.beginPath();
    for (const p of s.parts) {
        const len = p.T[p.T.length - 1], lo = a * s.total - acc, hi = b * s.total - acc;
        acc += len;
        if (hi <= 0 || lo >= len) continue;
        let started = false;
        const at = (j, u) => [p.pts[j][0] + (p.pts[j + 1][0] - p.pts[j][0]) * u, p.pts[j][1] + (p.pts[j + 1][1] - p.pts[j][1]) * u];
        for (let j = 0; j < p.T.length - 1; j++) {
            const t0 = p.T[j], t1 = p.T[j + 1];
            if (t1 < lo || t0 > hi) continue;
            const span = t1 - t0 || 1;
            const u0 = Math.max(0, (lo - t0) / span), u1 = Math.min(1, (hi - t0) / span);
            const q0 = at(j, u0), q1 = at(j, u1);
            if (!started) {
                g.moveTo(ox + q0[0] * k, oy + q0[1] * k);
                started = true;
            }
            g.lineTo(ox + q1[0] * k, oy + q1[1] * k);
        }
    }
    g.strokeStyle = rgb(s.layer.color);
    g.lineWidth = s.layer.width * k;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.stroke();
}

Motion.scene({
    fps: 24, duration: 6,
    logical: [1920, 1080],
    uses: [DIR + 'drawon-geom.js', DIR + 'drawon-time.js', DIR + 'demo-spec.js'],
    fonts: [{ family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
    setup() {
        const S = strokes();
        const L = S.map((s) => s.m.len);
        const ord = DG.orders(S.map((s, k) => ({ stack: k, center: s.m.center, first: s.m.first, last: s.m.last, closed: s.m.closed })), 1);
        const rigged = S.map((s, k) => ({
            len: L[k], rank: ord.rank.map((r) => r[k]), before: ord.rank.map((r) => dsBefore(L, r)[k]), flip: ord.flip.map((f) => f[k]), map: s.m.map, own: 0,
        }));
        const same = DS.sameDuration, D = same.each * S.length;
        const c = { mode: 2, order: 1, dir: 1, after: 1, start: same.start, gap: 0, stagger: 0, ease: 0, easeAll: 0, hold: 1 };
        c.speed = dsFit(c, L, ord.rank, D);
        c.total = dsTotal(c, L, ord.rank, c.speed);
        return { S, rigged, c };
    },
    draw(g, t, env) {
        const { S, rigged, c } = env.state, same = DS.sameDuration;
        g.fillStyle = rgb(DS.bg);
        g.fillRect(0, 0, env.W, env.H);
        const k = 0.5, oy = 270;
        for (let i = 0; i < S.length; i++) {
            // left: End keyed 0 -> 100 % over the same time for every stroke, linear
            const u = Math.min(1, Math.max(0, (t - same.start - i * same.each) / same.each));
            drawTrim(g, S[i], 0, u, 0, oy, k);
            // right: the rig
            const ab = dsTrim(c, rigged[i], t);
            drawTrim(g, S[i], ab[0] / 100, ab[1] / 100, 960, oy, k);
        }
        g.fillStyle = 'rgba(255,255,255,0.12)';
        g.fillRect(958, 230, 4, 620);
        g.font = '54px Hand';
        g.textAlign = 'center';
        g.fillStyle = rgb([200, 205, 225]);
        g.fillText('Same duration', 480, 210);
        g.fillText('Constant speed', 1440, 210);
        g.font = '30px Hand';
        g.fillStyle = rgb([140, 146, 170]);
        g.fillText('every stroke 0.34 s', 480, 900);
        g.fillText(`every stroke ${Math.round(c.speed)} px/s`, 1440, 900);
    },
});
