// Props of «REW» (segments/breakrew.js): the frame hidden in the Devil's TV spot. A plate in
// the manner of an old public-information poster: EAT YOUR VEGETABLES on a ribbon and in
// big round capitals, the Devil at a gingham table as its mascot (a napkin in his collar, a
// costume halo on a wire, his trident cut down to a fork with a floret of broccoli on it, a
// plate of greens, a glass of milk) and an imp beside him getting through a carrot.
// Everything is in frame units (1000 × 1000) unless said otherwise.
// Global: BreakrewProps. Depends on Cereal, Song, Cast, Devil.
const BreakrewProps = (() => {
    const C = Cereal, K = C.COL, E = Ease, S = Song, TAU = Math.PI * 2;
    const D = Cast.D, P = Devil.P;
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const line = (g, pts, color, lw) => C.poly(g, pts, { ink: color, lw, close: false });
    const cw = (pts) => {
        let a = 0;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i], q = pts[(i + 1) % pts.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return a > 0 ? pts : pts.slice().reverse();
    };
    // a band of varying width along a centreline (as devil.js draws the moustache)
    const ribbon = (cl) => {
        const A = [], Bk = [];
        cl.forEach(([x, y, w], i) => {
            const a = cl[Math.max(0, i - 1)], b = cl[Math.min(cl.length - 1, i + 1)];
            const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
            A.push([x - (dy / l) * w, y + (dx / l) * w]);
            Bk.push([x + (dy / l) * w, y - (dx / l) * w]);
        });
        return [...A, ...Bk.reverse()];
    };
    // a circle lying on a table, in the film's oblique projection (depth runs along Cast.D)
    const disc = (x, y, r, a0 = 0, a1 = TAU, n = 44) =>
        Array.from({ length: n + (a1 - a0 < TAU - 1e-6 ? 1 : 0) }, (_, i) => {
            const a = a0 + ((a1 - a0) * i) / n;
            return [x + r * Math.cos(a) + D[0] * r * Math.sin(a), y + D[1] * r * Math.sin(a)];
        });
    const EXT = Math.atan(D[0]); // where such a circle is widest (its right-hand tangent)

    const V = {
        paper: '#f3eee0', rayA: '#fff3c4', rayB: '#ffe07a', sun: '#fffbe4',
        leaf: '#35c46a', leafL: '#8be36a', leafD: '#1b8f52', stalk: '#c9ee96', stalkD: '#93cf6c',
        lettuce: '#a6e86b', lettuceD: '#5fc866', pea: '#7bdc55', peaL: '#c6f58a',
        carrot: '#ff8a2b', carrotL: '#ffb45e', carrotD: '#d9611a', core: '#ffd08f',
        cloth: '#fffdf4', check: 'rgba(23,184,166,0.36)', clothShade: 'rgba(36,21,49,0.09)',
        napkin: '#fffdf4', napShade: '#e3def0', napLine: '#b9b4dc',
        plate: '#fffdf4', plateShade: '#d5d0e4', milk: '#fffdf4', glass: '#c9eef2', glassD: '#93d6de',
        gold: '#ffc21f', goldL: '#fff0a0', goldD: '#e09a00', drop: '#a8e6ff',
        ribbon: K.teal, ribbonL: '#5fe0cf', ribbonD: K.tealDeep, ribbonFold: '#0a6b64',
        word: K.green, wordSide: '#1b8f52', wordSide2: '#0f6b3a',
        shadow: 'rgba(36,21,49,0.2)', head: '#0f6b3a', headL: '#35a866',
    };
    // where things stand
    const TABLE = { yb: 830, yf: 890, cell: 40 }; // the top's far and near edges
    const DEV = { x: 400, y: 942, s: 225 }; // the Devil (he sits behind the table)
    const IMP = { x: 762, y: 876, s: 160 };
    const PLATE = { x: 450, y: 857, r: 116 };
    const GLASS = { x: 136, y: 868 };

    // --- vegetables ----------------------------------------------------------------------
    // A floret of broccoli: (x, y) the foot of its stalk, s its height.
    function broccoli(g, x, y, s, o = {}) {
        const L = (o.lw ?? 3.2) / s;
        g.save();
        g.translate(x, y);
        g.rotate(o.ang ?? 0);
        g.scale(s, s);
        // the stalk, forking into two branches under the crown
        const stalk = [[-0.105, 0], [-0.12, -0.26], [-0.36, -0.42], [-0.26, -0.56], [-0.05, -0.44], [0.05, -0.44], [0.26, -0.56], [0.36, -0.42], [0.12, -0.26], [0.105, 0]];
        C.poly(g, stalk, { fill: V.stalk, ink: K.ink, lw: L });
        C.poly(g, [[0.035, -0.01], [0.04, -0.3], [0.3, -0.48], [0.36, -0.42], [0.12, -0.26], [0.105, -0.01]], { fill: V.stalkD, lw: 0 });
        C.poly(g, stalk, { ink: K.ink, lw: L });
        line(g, [[-0.04, -0.06], [-0.045, -0.24]], '#ffffff', L * 0.9);
        // the crown: a clump of bumps, the far ones first
        const bumps = [[0, -0.9, 0.2], [-0.24, -0.82, 0.2], [0.24, -0.82, 0.2], [-0.41, -0.62, 0.18], [0.41, -0.62, 0.18], [-0.15, -0.6, 0.21], [0.16, -0.61, 0.21], [0, -0.74, 0.19]];
        g.beginPath();
        for (const [bx, by, br] of bumps) {
            g.moveTo(bx + br, by);
            g.arc(bx, by, br, 0, TAU);
        }
        g.strokeStyle = K.ink;
        g.lineWidth = L * 2;
        g.lineJoin = 'round';
        g.stroke();
        g.save();
        g.clip();
        for (const [bx, by, br] of bumps) {
            // each bump: a dark crescent low on the right, the body, a light cap up on the left
            g.fillStyle = V.leafD;
            g.beginPath();
            g.arc(bx, by, br + 0.004, 0, TAU);
            g.fill();
            g.fillStyle = V.leaf;
            g.beginPath();
            g.arc(bx - br * 0.14, by - br * 0.2, br * 0.94, 0, TAU);
            g.fill();
            g.fillStyle = V.leafL;
            g.beginPath();
            g.ellipse(bx - br * 0.32, by - br * 0.42, br * 0.36, br * 0.26, -0.5, 0, TAU);
            g.fill();
        }
        // the buds: a few dark specks on each bump
        g.fillStyle = V.leafD;
        bumps.forEach(([bx, by, br], i) => {
            for (const [dx, dy] of [[0.3, 0.1], [-0.1, 0.42], [0.42, -0.28], [-0.5, 0.2]].slice(0, 2 + (i % 3))) {
                g.beginPath();
                g.arc(bx + dx * br, by + dy * br, 0.02, 0, TAU);
                g.fill();
            }
        });
        g.restore();
        g.restore();
    }

    // A carrot: the origin is its shoulder (the thick end, where the leaves grow), it lies
    // along +x for `len` and ends in a bite. Units: the holder's.
    function carrot(g, x, y, ang, len, L) {
        const r0 = 0.092, r = (d) => r0 * (1 - 0.66 * Math.min(1, d / 0.9));
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        if (Math.cos(ang) < 0) g.scale(1, -1); // lying towards the left: keep its lit side up
        // the leaves: three feathered fronds
        for (const [a, l] of [[-0.55, 0.19], [0.5, 0.18], [0, 0.23]]) {
            const fr = [[0, -0.022], [l * 0.3, -0.07], [l * 0.36, -0.035], [l * 0.62, -0.075], [l * 0.68, -0.03], [l, 0], [l * 0.68, 0.03], [l * 0.62, 0.075], [l * 0.36, 0.035], [l * 0.3, 0.07], [0, 0.022]]
                .map(([px, py]) => rot([-px - 0.01, py], a));
            C.poly(g, fr, { fill: a === 0 ? V.leaf : V.lettuceD, ink: K.ink, lw: L });
            line(g, [rot([-0.04, 0], a), rot([-l * 0.8, 0], a)], V.leafD, L * 0.8);
        }
        // the root
        const e = r(len);
        const body = [...C.ellipsePts(0.03, 0, 0.055, r0, 12, 0, Math.PI / 2, Math.PI * 1.5), [len, -e], [len + 0.02, -e * 0.45], [len - 0.012, 0.05 * e], [len + 0.016, e * 0.55], [len - 0.004, e]];
        C.poly(g, body, { fill: V.carrot, ink: K.ink, lw: L });
        g.save();
        C.trace(g, body);
        g.clip();
        // a light upper side, a dark underside, the paler heart where it was bitten
        C.poly(g, [[-0.05, -r0], [len + 0.03, -e], [len + 0.03, -e * 0.42], [-0.05, -r0 * 0.5]], { fill: V.carrotL, lw: 0 });
        C.poly(g, [[-0.05, r0 * 0.58], [len + 0.03, e * 0.5], [len + 0.03, e + 0.01], [-0.05, r0 + 0.01]], { fill: V.carrotD, lw: 0 });
        g.fillStyle = V.core;
        g.beginPath();
        g.ellipse(len + 0.004, 0, 0.03, e * 0.74, 0, 0, TAU);
        g.fill();
        g.restore();
        C.poly(g, body, { ink: K.ink, lw: L });
        // growth rings across the root
        for (const d of [0.12, 0.27, 0.42]) if (d < len - 0.07) line(g, [[d, -r(d) * 0.96], [d + 0.016, -r(d) * 0.3]], K.ink, L * 0.7);
        for (const d of [0.2, 0.36]) if (d < len - 0.07) line(g, [[d, r(d) * 0.96], [d - 0.012, r(d) * 0.5]], K.ink, L * 0.7);
        g.restore();
    }

    // A pea, a slice of carrot.
    function pea(g, x, y, r) {
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        g.fillStyle = V.pea;
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = 2.6;
        g.stroke();
        g.fillStyle = V.peaL;
        g.beginPath();
        g.arc(x - r * 0.3, y - r * 0.32, r * 0.36, 0, TAU);
        g.fill();
    }
    function coin(g, x, y, r) {
        C.poly(g, disc(x, y + 5, r), { fill: V.carrotD, ink: K.ink, lw: 2.6 });
        C.poly(g, disc(x, y, r), { fill: V.carrot, ink: K.ink, lw: 2.6 });
        C.poly(g, disc(x, y, r * 0.5), { fill: V.carrotL, lw: 0 });
    }
    // A ruffled leaf of lettuce: round (cx, cy), a seeded wavy edge, a rib and veins.
    function lettuce(g, cx, cy, rx, ry, a, seed, fill) {
        const r = Motion.rng(seed), n = 16;
        const edge = C.curve(Array.from({ length: n }, (_, i) => {
            const th = (i / n) * TAU, k = (i % 2 ? 1.06 : 0.86) + 0.08 * r();
            return rot([Math.cos(th) * rx * k, Math.sin(th) * ry * k], a).map((v, j) => v + (j ? cy : cx));
        }), true, 6);
        C.poly(g, edge, { fill, ink: K.ink, lw: 3.2 });
        const at = (u, v) => rot([u * rx, v * ry], a).map((w, j) => w + (j ? cy : cx));
        line(g, [at(-0.72, 0.1), at(0.6, -0.05)], V.leafD, 2.6);
        for (const [u, v] of [[-0.3, -0.55], [0.1, -0.6], [-0.1, 0.55], [0.3, 0.5]]) line(g, [at(u * 0.5, 0.03), at(u, v)], V.leafD, 2);
    }

    // The plate of greens.
    function plate(g) {
        const { x, y, r } = PLATE;
        C.poly(g, disc(x + 8, y + 12, r * 1.03), { fill: V.shadow, lw: 0 });
        C.poly(g, disc(x, y + 7, r), { fill: V.plateShade, ink: K.ink, lw: 3.2 });
        C.poly(g, disc(x, y, r), { fill: V.plate, ink: K.ink, lw: 3.2 });
        C.poly(g, disc(x, y, r * 0.88), { ink: K.teal, lw: 3 });
        C.poly(g, disc(x, y + 2, r * 0.72), { fill: V.plateShade, lw: 0 });
        C.poly(g, disc(x, y + 4, r * 0.7), { fill: '#f1eef8', lw: 0 });
        // the heap, far to near: two leaves of lettuce, a floret, beans, slices of carrot, peas
        lettuce(g, x - 44, y - 30, 66, 30, -0.12, 'lettuce-a', V.lettuce);
        lettuce(g, x + 50, y - 26, 58, 27, 0.2, 'lettuce-b', V.lettuceD);
        broccoli(g, x + 62, y - 8, 78, { ang: 0.1 });
        for (const [x0, y0, x1, y1] of [[-96, -8, -22, -22], [-84, 4, -6, -6], [-64, 14, 12, 6]]) {
            g.lineCap = 'round';
            line(g, [[x + x0, y + y0], [x + (x0 + x1) / 2, y + (y0 + y1) / 2 - 5], [x + x1, y + y1]], K.ink, 17.4);
            line(g, [[x + x0, y + y0], [x + (x0 + x1) / 2, y + (y0 + y1) / 2 - 5], [x + x1, y + y1]], V.leaf, 11);
            line(g, [[x + x0 + 6, y + y0 - 3], [x + (x0 + x1) / 2, y + (y0 + y1) / 2 - 8.5]], V.leafL, 2.6);
        }
        coin(g, x + 22, y - 2, 13);
        coin(g, x - 6, y + 16, 12);
        for (const [px, py] of [[42, 14], [62, 9], [52, 24], [-34, 22], [-50, 16], [78, 18]]) pea(g, x + px, y + py, 8.5);
    }

    // A tumbler of milk: (x, y) the middle of its foot.
    function milk(g) {
        const { x, y } = GLASS, r0 = 22, r1 = 28, h = 84, fill = 0.72;
        C.poly(g, disc(x + 7, y + 4, r0 * 1.25), { fill: V.shadow, lw: 0 });
        const wall = (ya, ra, yb, rb) => [...disc(x, ya, ra, Math.PI + EXT, TAU + EXT, 16), ...disc(x, yb, rb, Math.PI + EXT, TAU + EXT, 16).reverse()];
        const rAt = (u) => r0 + (r1 - r0) * u;
        // the glass, the milk in it, the rim
        C.poly(g, wall(y - h, r1, y, r0), { fill: V.glass, ink: K.ink, lw: 3.2 });
        C.poly(g, wall(y - h * fill, rAt(fill) - 3.5, y - 3, r0 - 3.5), { fill: V.milk, lw: 0 });
        C.poly(g, disc(x, y - h * fill, rAt(fill) - 3.5), { fill: '#f1eef8', lw: 0 });
        C.poly(g, [[x + r0 * 0.3, y - 2], [x + rAt(fill) * 0.38, y - h * fill + 2], [x + rAt(fill) - 4, y - h * fill + 5], [x + r0 - 4, y - 5]], { fill: V.napShade, lw: 0 });
        C.poly(g, disc(x, y - h, r1), { fill: V.glassD, ink: K.ink, lw: 3.2 });
        C.poly(g, disc(x, y - h, r1 - 5), { fill: V.glass, lw: 0 });
        line(g, [[x - r1 + 9, y - h + 12], [x - r0 + 7, y - 14]], '#ffffff', 4);
    }

    // The table: a gingham cloth, its top receding along D, its front falling out of frame.
    function table(g) {
        const { yb, yf, cell } = TABLE, sh = D[0] / D[1];
        const rows = (x0, y0, w, h, n) => {
            g.fillStyle = V.check;
            for (let x = x0; x < x0 + w; x += cell * 2) g.fillRect(x, y0, cell, h * n);
            for (let i = 0; i < n; i += 2) g.fillRect(x0, y0 + i * h, w, h);
        };
        g.fillStyle = V.cloth;
        g.fillRect(0, yb, 1000, 1000 - yb);
        g.save();
        g.beginPath();
        g.rect(0, yb, 1000, yf - yb);
        g.clip();
        g.transform(1, 0, sh, 1, -sh * yf, 0);
        rows(-400, yb, 1800, (yf - yb) / 2, 2);
        g.restore();
        rows(-400, yf, 1800, cell, 3);
        g.fillStyle = V.clothShade;
        g.fillRect(0, yf, 1000, 1000 - yf);
        line(g, [[-10, yf], [1010, yf]], K.ink, 3.2);
        line(g, [[-10, yb], [1010, yb]], K.ink, 3.2);
    }

    // --- the Devil as a mascot -------------------------------------------------------------
    const T = Devil.HEAD.top, EY = T + 0.44, MY = T + 0.75, CHIN = T + Devil.HEAD.h;
    // His trident cut down to a fork, a floret on its middle tine. (x, y) the mitt, his units.
    function fork(g, x, y, L, ang) {
        const k = 0.5, len = 1.3, grip = 0.3;
        g.save();
        g.translate(x, y);
        g.scale(k, k);
        Devil.trident(g, 0, 0, L / k, { ang, len, grip });
        const foot = rot([0, grip - len - 0.02], ang);
        broccoli(g, foot[0], foot[1], 0.98, { ang, lw: L / k });
        g.restore();
    }
    // The mouth of a man with his mouth full, drawn over the mouth devil.js gave him (in the
    // head's frame): chew 'L' | 'M' | 'R' (the bulge goes from cheek to cheek) or 'caught'.
    function mouth(g, L, chew, droop) {
        // a patch of skin over the old mouth, cut to it (his raised arm crosses the jaw's corner)
        C.poly(g, [[-0.345, T + 0.612], [0.345, T + 0.612], [0.345, T + 0.7], [0.2, T + 0.845], [0, T + 0.874], [-0.2, T + 0.845], [-0.345, T + 0.7]], { fill: P.skin, lw: 0 });
        const cheek = (sx, k) => {
            g.beginPath();
            g.ellipse(sx * 0.24, MY + 0.008, 0.1 * k, 0.088 * k, 0, 0, TAU);
            g.fillStyle = P.skinTop;
            g.fill();
            g.beginPath();
            if (sx > 0) g.ellipse(sx * 0.24, MY + 0.008, 0.1 * k, 0.088 * k, 0, -1.1, 1.7);
            else g.ellipse(sx * 0.24, MY + 0.008, 0.1 * k, 0.088 * k, 0, Math.PI - 1.7, Math.PI + 1.1);
            g.strokeStyle = P.ink;
            g.lineWidth = L;
            g.lineCap = 'round';
            g.stroke();
            g.fillStyle = '#ffa08c';
            g.beginPath();
            g.ellipse(sx * 0.24 - 0.028 * k, MY - 0.022 * k, 0.03 * k, 0.02 * k, -0.5, 0, TAU);
            g.fill();
        };
        if (chew === 'M') {
            cheek(-1, 0.72);
            cheek(1, 0.72);
            line(g, C.curve([[-0.075, MY + 0.012], [-0.03, MY - 0.008], [0.03, MY - 0.008], [0.075, MY + 0.012]], false, 5), P.ink, L * 1.3);
        } else if (chew === 'caught') {
            // stopped in mid-chew: one cheek full, the lips pressed, a crumb of broccoli on them
            cheek(-1, 1.08);
            line(g, C.curve([[-0.05, MY + 0.016], [0, MY - 0.004], [0.06, MY + 0.004], [0.1, MY - 0.014]], false, 5), P.ink, L * 1.3);
            g.beginPath();
            g.arc(0.105, MY + 0.02, 0.019, 0, TAU);
            g.fillStyle = V.leaf;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.7;
            g.stroke();
        } else {
            const sx = chew === 'L' ? -1 : 1, mx = sx * 0.035;
            cheek(sx, 1.08);
            line(g, C.curve([[mx - 0.08, MY + 0.014], [mx - 0.028, MY - 0.014], [mx + 0.03, MY + 0.012], [mx + 0.08, MY - 0.01]], false, 5), P.ink, L * 1.3);
        }
        // his moustache again, over the patch (as devil.js draws it)
        const mu = EY + 0.185;
        for (const sx of [-1, 1]) {
            const cl = C.curve([[sx * 0.012, mu], [sx * 0.11, mu + 0.02], [sx * 0.24, mu + 0.0 + droop], [sx * 0.34, mu - 0.06 + droop * 1.6], [sx * 0.335, mu - 0.115 + droop * 1.8]], false, 8);
            const n = cl.length;
            C.poly(g, ribbon(cl.map(([px, py], i) => [px, py, 0.022 * (1 - (i / (n - 1)) * 0.82)])), { fill: P.hair, ink: P.ink, lw: L * 0.5 });
        }
    }
    function goatee(g, L) {
        C.poly(g, [[-0.08, CHIN - 0.06], [0.08, CHIN - 0.06], [0.045, CHIN + 0.06], [0, CHIN + 0.13], [-0.045, CHIN + 0.06]], { fill: P.hair, ink: P.ink, lw: L });
        line(g, [[-0.03, CHIN - 0.03], [-0.012, CHIN + 0.055]], P.sheen, L * 0.9);
    }
    // A bead of sweat (the head's frame): (x, y) its middle, r its half width.
    function bead(g, x, y, r, L) {
        const pts = C.curve([[0, -1.7], [0.62, -0.5], [0.9, 0.35], [0, 1.1], [-0.9, 0.35], [-0.62, -0.5]].map(([px, py]) => [x + px * r, y + py * r]), true, 6);
        C.poly(g, pts, { fill: V.drop, ink: P.ink, lw: L * 0.9 });
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.ellipse(x - r * 0.3, y + r * 0.1, r * 0.2, r * 0.38, 0.3, 0, TAU);
        g.fill();
    }
    // The halo: a brass ring on a wire stuck in his hair (the head's frame).
    function halo(g, L, tilt, dy) {
        g.save();
        g.translate(0.03, T - 0.5 + dy);
        line(g, [[0.09, 0.29], [0.105, 0.08], [0.07, -0.065]], P.ink, L * 1.1);
        g.rotate(tilt);
        const ring = (lw, color, a0 = 0, a1 = TAU) => {
            g.beginPath();
            g.ellipse(0, 0, 0.3, 0.072, 0, a0, a1);
            g.strokeStyle = color;
            g.lineWidth = lw;
            g.lineCap = 'round';
            g.stroke();
        };
        ring(0.058 + L * 2, P.ink);
        ring(0.058, V.gold);
        ring(0.02, V.goldD, 0.25, Math.PI - 0.25);
        ring(0.018, V.goldL, Math.PI + 0.5, Math.PI + 1.5);
        g.restore();
    }
    // The napkin tucked into his collar (his body's frame), from under the chin.
    function napkin(g, L, headDy) {
        g.save();
        g.beginPath();
        g.rect(-1, CHIN + headDy + L * 0.5, 2, 1);
        g.clip();
        const nap = [[-0.2, -0.95], [0.2, -0.95], [0.27, -0.82], [0.315, -0.68], [0.36, -0.5], [0.2, -0.44], [0, -0.47], [-0.2, -0.44], [-0.36, -0.5], [-0.315, -0.68], [-0.27, -0.82]];
        C.poly(g, nap, { fill: V.napkin, ink: P.ink, lw: L });
        g.save();
        C.trace(g, nap);
        g.clip();
        // the head's shadow under the chin, a shaded side, folds from the tuck, a woven stripe
        C.poly(g, [[0.1, -0.95], [0.4, -0.95], [0.4, -0.4], [0.21, -0.4], [0.17, -0.7]], { fill: V.napShade, lw: 0 });
        g.fillStyle = V.napShade;
        g.fillRect(-0.4, CHIN + headDy, 0.8, 0.028);
        line(g, [[-0.075, -0.9], [-0.115, -0.74], [-0.17, -0.5]], V.napLine, L * 0.9);
        line(g, [[0.05, -0.9], [0.075, -0.76], [0.1, -0.5]], V.napLine, L * 0.9);
        for (const sx of [-1, 1]) {
            for (const d of [0.045, 0.075]) line(g, [[sx * (0.27 - d), -0.86], [sx * (0.315 - d), -0.68], [sx * (0.36 - d), -0.47]], K.teal, L * 0.9);
        }
        g.restore();
        C.poly(g, nap, { ink: P.ink, lw: L });
        g.restore();
    }

    // What he is doing at film time t. k: the beat (Song.b) on which the tape stops on him.
    // Before it the frame is the one glimpsed through the rewind: eyes shut, munching.
    //   +1 beat: he sees us; +2: a bead of sweat, a glance at the imp; +3: one guilty chew;
    //   +4: the smile for the camera; +5: the gold tooth twinkles.
    function acting(t, k) {
        const b = S.b, tt = Math.max(t, b(k)), eps = 1e-6;
        const since = (n) => S.twos(tt, b(k + n)) - b(k + n), on = (n) => tt >= b(k + n) - eps;
        const dr = (n) => Math.floor(since(n) * 12 + eps); // drawings since beat k + n
        const aware = on(1), smile = on(4);
        let chew = ['L', 'M', 'R', 'M'][Math.max(0, dr(0) - 1) % 4];
        if (aware) chew = on(3) && dr(3) < 4 ? ['M', 'R', 'M', 'L'][dr(3)] : 'caught';
        const start = aware ? E.bump(S.twos(tt, b(k + 1)), b(k + 1), 0.25) : 0;
        return {
            mood: smile ? 'grin' : aware ? 'shock' : 'laugh',
            chew: smile ? null : chew,
            blink: aware && !smile && on(2) && dr(2) === 3,
            look: on(2) && dr(2) < 3 ? 1 : 0,
            headDy: -0.045 * start + (smile ? -0.012 * E.bump(S.twos(tt, b(k + 4)), b(k + 4), 0.25) : 0),
            squash: 0.03 * start,
            haloTilt: aware ? 0.3 - 0.12 * Math.exp(-since(1) * 5) * Math.cos(since(1) * 30) : -0.07,
            haloDy: aware ? 0.03 : C.drawing(tt) % 6 < 3 ? 0 : -0.012,
            sweat: on(2) ? { pop: S.pop(tt, b(k + 2), 0.2), slide: E.inOut(E.seg(S.twos(tt, b(k + 2)), b(k + 2) + 0.2, b(k + 5))) } : null,
            raise: smile ? E.out(E.seg(S.twos(tt, b(k + 4)), b(k + 4), b(k + 4) + 0.17)) : 0,
            tail: aware && !smile ? (Math.floor(C.drawing(tt) / 2) % 2 ? 0.035 : -0.02) : 0,
            twinkle: on(5) ? E.bump(S.twos(tt, b(k + 5)), b(k + 5), 0.34) : 0,
        };
    }

    function devil(g, t, k) {
        const { x, y, s } = DEV, L = 3.2 / s, a = acting(t, k), q = a.squash;
        const hR = [-1.0, -1.0 - 0.07 * a.raise];
        const body = (fn) => {
            g.save();
            g.translate(x, y);
            g.scale(s, s);
            g.scale(1 + q, 1 - q);
            fn();
            g.restore();
        };
        // the fork first: his mitt closes over its shaft
        body(() => fork(g, hR[0] - 0.015, hR[1] + 0.02, L, -0.1 + 0.05 * a.raise));
        g.save();
        g.beginPath();
        g.rect(0, 0, 1000, TABLE.yb);
        g.clip();
        Devil.draw(g, x, y, s, { mood: a.mood, eyes: a.blink ? 'shut' : 'open', look: a.look, squash: q, headDy: a.headDy, tail: a.tail, handR: hR, handL: [0.52, -0.42], shadow: false });
        body(() => {
            g.save();
            g.translate(0, a.headDy);
            if (a.chew) mouth(g, L, a.chew, a.mood === 'shock' ? 0.08 : 0);
            if (a.sweat) bead(g, 0.4, T + 0.42 + 0.3 * a.sweat.slide, 0.036 * a.sweat.pop, L);
            halo(g, L, a.haloTilt, a.haloDy);
            g.restore();
            napkin(g, L, a.headDy);
            g.save();
            g.translate(0, a.headDy);
            goatee(g, L);
            if (a.twinkle > 0) C.sparkle(g, 0.115, T + 0.72, 0.03 + 0.1 * a.twinkle, { color: K.white, ink: P.ink, lw: L * 0.8, rot: 0.2 });
            g.restore();
        });
        g.restore();
    }

    // The imp, on the table, getting through a carrot: a bite on every beat, then it chews.
    function imp(g, t, k) {
        const { x, y, s } = IMP, L = 3 / s, b = S.b, tt = Math.max(t, b(k)), pa = S.pulseAt(tt), n = Math.max(0, pa.k - k);
        const d = Math.floor((S.twos(tt, b(pa.k)) - b(pa.k)) * 12 + 1e-6), bite = d < 2;
        const q = bite ? [0.1, 0.045][d] : d % 2 ? 0.022 : -0.012, up = 0.24;
        C.poly(g, disc(x + 6, y, 0.58 * s), { fill: V.shadow, lw: 0 });
        Devil.imp(g, x, y, s, { mood: bite ? 'awe' : 'grin', look: tt >= b(k + 2) - 1e-6 && tt < b(k + 4) - 1e-6 ? -1 : 0, squash: q, armUp: up, tail: -0.15 + (d % 2 ? 0.02 : 0), shadow: false });
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.scale(1 + q, 1 - q);
        // the carrot runs from its mouth out through the right mitt; every bite pulls a
        // little more of it through
        const hand = [0.66, -0.4 - up * 0.5], mo = [bite ? 0.0 : 0.17, -0.42 + (bite ? 0.02 : 0.035)];
        const ang = Math.atan2(mo[1] - hand[1], mo[0] - hand[0]), out = Math.max(0.05, 0.14 - 0.018 * n);
        const ux = Math.cos(ang), uy = Math.sin(ang), reach = Math.hypot(mo[0] - hand[0], mo[1] - hand[1]);
        g.save();
        if (bite) {
            // in its mouth: the carrot ends inside the dark of it
            g.beginPath();
            g.rect(0.005, -1.2, 1.4, 1.4);
            g.clip();
        }
        carrot(g, hand[0] - ux * out, hand[1] - uy * out, ang, reach + out + (bite ? 0.1 : 0), L);
        g.restore();
        // its mitt again, over the carrot
        const sh = [0.48, -0.46], al = Math.hypot(hand[0] - sh[0], hand[1] - sh[1]), ax = (hand[0] - sh[0]) / al, ay = (hand[1] - sh[1]) / al;
        const m0 = [hand[0] - ax * 0.07, hand[1] - ay * 0.07], m1 = [hand[0] + ax * 0.08, hand[1] + ay * 0.08], nx = -ay * 0.08, ny = ax * 0.08;
        C.prism(g, cw([[m0[0] + nx, m0[1] + ny], [m1[0] + nx, m1[1] + ny], [m1[0] - nx, m1[1] - ny], [m0[0] - nx, m0[1] - ny]]), Cast.Dd(0.14), { front: P.skin, top: P.skinTop, side: P.skinSide }, { lw: L, ink: P.ink });
        // crumbs off every bite
        if (n > 0 || tt > b(k) + 1e-6) {
            const u = (S.twos(tt, b(pa.k)) - b(pa.k)) / 0.3;
            if (u > 0 && u < 1) {
                const r = Motion.rng('crumb' + pa.k);
                for (let i = 0; i < 4; i++) {
                    const vx = -0.5 + r() * 0.9, vy = -0.5 - r() * 0.5, cx = 0.1 + vx * u * 0.6, cy = -0.42 + (vy * u + 1.3 * u * u) * 0.5;
                    C.poly(g, [[cx - 0.022, cy], [cx, cy - 0.022], [cx + 0.022, cy], [cx, cy + 0.022]], { fill: i % 2 ? V.carrot : V.carrotL, ink: P.ink, lw: L * 0.7 });
                }
            }
        }
        g.restore();
    }

    // --- the lettering ---------------------------------------------------------------------
    // A word in round capitals, every letter its own solid set by hand on an arch: its own
    // tilt and size, a hop on the beat. o: { arch, track, hop(i), fit, style }
    function word(g, str, cx, y, size, o = {}) {
        const { arch = 0, track = 0, hop = null, fit = 0, style = {} } = o;
        g.save();
        g.font = `100px "${C.FONT.round}"`;
        const chars = [...str], w100 = chars.map((c) => g.measureText(c).width);
        g.restore();
        const sum = w100.reduce((a, b) => a + b, 0) / 100;
        const sz = fit ? (fit - track * (chars.length - 1)) / sum : size;
        const total = sum * sz + track * (chars.length - 1), half = total / 2;
        let x = cx - half;
        chars.forEach((ch, i) => {
            const adv = (w100[i] / 100) * sz, xc = x + adv / 2;
            x += adv + track;
            if (ch === ' ') return;
            const u = (xc - cx) / half, r = Motion.rng('letter' + str + i);
            const tilt = Math.atan((2 * arch * u) / half) + (i % 2 ? 1 : -1) * 0.03 + (r() - 0.5) * 0.035;
            C.text3d(g, ch, xc, y + arch * u * u + (hop ? hop(i) : 0), { font: C.FONT.round, size: sz * (0.975 + 0.05 * r()), ...style, letter: () => ({ rot: tilt }) });
        });
    }
    function ribbon2(g) {
        // the ribbon behind EAT YOUR: a band on the same arch, its ends folded back
        const cx = 500, half = 262, y0 = 178, y1 = 252, arch = 13, n = 16;
        const edge = (yy) => Array.from({ length: n + 1 }, (_, i) => {
            const u = -1 + (2 * i) / n;
            return [cx + u * half, yy + arch * u * u];
        });
        for (const sx of [-1, 1]) {
            const ex = cx + sx * half, ty = arch + 16;
            C.poly(g, [[ex - sx * 34, y0 + ty], [ex + sx * 62, y0 + ty], [ex + sx * 38, (y0 + y1) / 2 + ty], [ex + sx * 62, y1 + ty], [ex - sx * 34, y1 + ty]], { fill: V.ribbonD, ink: K.ink, lw: 3.2 });
            C.poly(g, [[ex, y1 + arch], [ex - sx * 34, y1 + ty], [ex - sx * 34, y1 + arch - 4]], { fill: V.ribbonFold, ink: K.ink, lw: 3.2 });
        }
        const top = edge(y0), bot = edge(y1).reverse();
        C.poly(g, [...top, ...bot], { fill: V.ribbon, ink: K.ink, lw: 3.2 });
        line(g, edge(y0 + 9).slice(1, -1), V.ribbonL, 3);
        line(g, edge(y1 - 9).slice(1, -1), V.ribbonD, 3);
    }
    // The plate's header: a dark band with a scalloped hem (the VCR's display reads on it)
    // and, in the middle, a seal of approval.
    function header(g) {
        const y = 158, r = 15;
        const hem = new Path2D();
        hem.moveTo(50, 40);
        hem.lineTo(50, y);
        for (let x = 50 + r; x < 950; x += r * 2) hem.arc(x, y, r, Math.PI, 0, true);
        hem.lineTo(950, 40);
        g.fillStyle = V.head;
        g.fill(hem);
        g.strokeStyle = K.ink;
        g.lineWidth = 3.2;
        g.lineJoin = 'round';
        g.stroke(hem);
        line(g, [[50, y - 12], [950, y - 12]], V.headL, 3);
        C.burst(g, 500, 102, { r0: 30, r1: 38, n: 14, jitter: 0, seed: 'seal', fill: V.gold, ink: K.ink, lw: 3.2 });
        g.beginPath();
        g.arc(500, 102, 23, 0, TAU);
        g.fillStyle = V.napkin;
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = 2.6;
        g.stroke();
        line(g, [[488, 102], [497, 112], [513, 91]], K.ink, 10.5);
        line(g, [[488, 102], [497, 112], [513, 91]], V.word, 5.5);
    }
    function lettering(g, t, k) {
        const tt = Math.max(t, S.b(k)), pa = S.pulseAt(tt), live = t > S.b(k) + 1e-6;
        const hop = (amp) => (i) => (live ? -amp * pa.pulse * ((i + pa.k) % 2 ? 1 : 0.3) : 0);
        ribbon2(g);
        word(g, 'EAT YOUR', 500, 236, 58, { arch: 13, track: 2, hop: hop(4), style: { face: K.white, side: K.ink, depth: 5, dir: [0.72, 0.7], ow: 2.6 } });
        word(g, 'VEGETABLES', 500, 366, 0, { arch: 24, track: 3, fit: 792, hop: hop(8), style: { face: V.word, side: V.wordSide, side2: V.wordSide2, bands: 3, depth: 13, dir: [0.72, 0.7], ow: 3.6 } });
    }

    // --- the plate ---------------------------------------------------------------------------
    // The whole hidden frame at film time t; k is the beat the tape stops on it (see acting).
    function card(g, t, k) {
        const tt = Math.max(t, S.b(k));
        g.fillStyle = V.paper;
        g.fillRect(0, 0, 1000, 1000);
        const frame = new Path2D();
        frame.roundRect(50, 50, 900, 900, 30);
        g.save();
        g.clip(frame);
        C.sunburst(g, DEV.x, 640, { n: 13, rot: 0.2 + (tt - S.b(k)) * 0.16, a: V.rayA, b: V.rayB });
        g.beginPath();
        g.arc(DEV.x, 640, 262, 0, TAU);
        g.fillStyle = V.sun;
        g.fill();
        header(g);
        lettering(g, t, k);
        // twinkles round the floret on the fork, ticking on twos
        [[84, 600, 0], [246, 474, 3], [88, 484, 6]].forEach(([sx, sy, ph]) => {
            const f = (C.drawing(tt) + ph) % 9;
            if (f < 4) C.sparkle(g, sx, sy, 9 + (f < 2 ? f : 3 - f) * 9, { color: K.white, ink: K.ink, lw: 2.5 });
        });
        devil(g, t, k);
        table(g);
        milk(g);
        plate(g);
        pea(g, 636, 874, 8.5);
        pea(g, 250, 860, 8.5);
        imp(g, t, k);
        g.restore();
        g.strokeStyle = K.ink;
        g.lineWidth = 6;
        g.stroke(frame);
    }

    return { V, TABLE, DEV, IMP, card, acting, broccoli, carrot, plate, milk, table, lettering, devil, imp, disc };
})();
