// pier-pressure · shared by every character file: the Cast global, small drawing helpers.
// Each cast/<name>.js adds its spec with Cast.add('<name>', spec, size). Load this first.
//
//   Cast.draw(g, 'kit', pose, x, y, s)     s = output units per local unit (a kid is 100 high)
(() => {
    const T = SkateToon, C = T.COL, K0 = SkateKid;
    const { add, sub, mul, mix, unit } = K0;
    const SPECS = {}, SIZE = {}, merged = {};

    const dot = (g, x, y, r, col) => {
        g.fillStyle = col;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
    };
    const star = (cx, cy, r, n = 5, a0 = -Math.PI / 2, inner = 0.45) =>
        Array.from({ length: n * 2 }, (_, i) => {
            const a = a0 + (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? r * inner : r;
            return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 1];
        });
    // A sticking plaster, z long, at angle a.
    const plaster = (g, K, x, y, a, z, key) => {
        g.save();
        g.translate(x, y);
        g.rotate(a);
        T.shape(g, [[-z, -z * 0.36], [0, -z * 0.4], [z, -z * 0.36], [z * 1.08, 0], [z, z * 0.36], [0, z * 0.4], [-z, z * 0.36], [-z * 1.08, 0]], { fill: '#f6d3a8', w: K.fine, seed: key });
        T.line(g, [[-z * 0.34, -z * 0.36], [-z * 0.34, z * 0.36]], { w: K.fine * 0.7, seed: key + 'a', amp: 0.1 });
        T.line(g, [[z * 0.34, -z * 0.36], [z * 0.34, z * 0.36]], { w: K.fine * 0.7, seed: key + 'b', amp: 0.1 });
        dot(g, -z * 0.1, -z * 0.08, K.fine * 0.25, C.ink);
        dot(g, z * 0.12, z * 0.08, K.fine * 0.25, C.ink);
        g.restore();
    };
    /**
     * A lock of hair: a band from its root that thins to a point, outlined on its own so
     * locks can overlap (draw the ones behind first). pts: the lock's spine; w0: width at
     * the root; o.wave ripples it; o.blunt: the width kept at the tip (0 = a point).
     */
    const lock = (g, K, pts, w0, fill, key, o = {}) => {
        const body = T.ribbon(pts, w0, Math.max(0.5, o.blunt ?? 0.5), { wave: o.wave, mid: o.mid, step: 0.5, tip: o.round });
        return T.shape(g, body, { fill, w: o.w ?? K.w, seed: key, dense: true });
    };

    // Points of something that sits on the skull (a cap of hair, a helmet, a band), carried
    // round as the head turns to the right by a (0..1): the back goes out, the far side comes in.
    const turned = (pts, a, back = 2.8, far = 0.17) => pts.map(([x, y, c]) => [x < 0 ? x - a * back * Math.min(1, -x / 8) : x * (1 - far * a), y, c]);

    function draw(g, who, pose, x, y, s) {
        merged[who] ??= { ...SkateKid.merge(SPECS[who]), __merged: true };
        return SkateKid.draw(g, merged[who], pose, x, y, s * (SIZE[who] ?? 1));
    }
    window.Cast = {
        SPECS, SIZE, draw, dot, star, plaster, lock, turned,
        add: (name, spec, size = 1) => {
            SPECS[name] = spec;
            SIZE[name] = size;
            delete merged[name];
        },
        HAIR: '#a6d93a', SKIN: '#cf8440', add2: add, sub, mul, mix, unit,
    };
})();
