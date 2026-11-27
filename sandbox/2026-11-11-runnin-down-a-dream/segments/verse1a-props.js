// Props and the roadside set of «verse1a» (segments/verse1a.js): the Devil's paper-thin
// disguise (a straw boater his horns poke through, joke glasses with bushy brows and a false
// nose), the cardboard sign and its two faces, speed lines, dust, dizzy stars, the top he
// turns into, and the roadside where he waits (saguaros, bushes, the road at the closer scale).
//
// Things the Devil wears or holds are drawn in his units (1 ≈ a head's width, y down) with
// the line width L = 3.2 / s, inside a transform the caller sets (`units`, `onHead`). The set
// is drawn in logical units. Global: V1A. Depends on Cereal, Cast, Devil, World, Song.
const V1A = (() => {
    const C = Cereal, K = C.COL, TAU = Math.PI * 2, D = Cast.D, Dd = Cast.Dd, DP = Devil.P;
    const ob = (x, y, z = 0) => [x + D[0] * z, y + D[1] * z];
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
    // a circle lying flat (on a brim, on the ground) in the oblique projection
    const flatRing = (cx, cy, r, n = 22, a0 = 0, a1 = TAU) => Array.from({ length: n + 1 }, (_, i) => {
        const a = a0 + ((a1 - a0) * i) / n;
        return [cx + r * Math.cos(a) + D[0] * r * Math.sin(a), cy + D[1] * r * Math.sin(a)];
    });
    // A band of varying width along a centreline: [[x, y, halfWidth], …] → an outline.
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

    // Run fn(L) in a prop's own units: (x, y) its origin, s logical units per unit.
    function units(g, x, y, s, ang, fn) {
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        g.scale(s, s);
        g.lineJoin = 'round';
        fn(3.2 / s);
        g.restore();
    }
    // Run fn(L) in the Devil's head space: the transforms Devil.draw applies for this pose.
    function onHead(g, x, y, s, pose, fn) {
        const q = pose.squash ?? 0;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        g.translate(0, pose.headDy ?? 0);
        g.rotate(pose.headTilt ?? 0);
        g.lineJoin = 'round';
        fn(3.2 / s);
        g.restore();
    }

    // =========================================================================================
    // The straw boater
    // =========================================================================================
    const STRAW = { front: '#f2cc5e', top: '#ffe89a', side: '#cf9f38', line: '#b9862a', hole: '#4a3212', band: '#f0352f', bandSide: '#b0211f', bandLine: '#fffdf4' };
    // the brim and the crown are round: ellipses lying flat (rx across, rz in depth) about a centre at depth zc
    const HAT = { rx: 0.8, rz: 0.42, zc: 0.22, bh: 0.055, crx: 0.31, crz: 0.2, czc: 0.27, ch: 0.31, holes: [-0.55, 0.515], holeZ: 0.2, holeR: 0.125, seat: -1.9 };
    const oval = (cy, rx, rz, zc, a0 = 0, a1 = TAU, n = 40) => Array.from({ length: n + 1 }, (_, i) => {
        const a = a0 + ((a1 - a0) * i) / n;
        return [rx * Math.cos(a) + D[0] * (zc + rz * Math.sin(a)), cy + D[1] * (zc + rz * Math.sin(a))];
    });
    // where an oval's outline turns back: the angle of its rightmost point (the leftmost is opposite)
    const turn = (rx, rz) => Math.atan2(D[0] * rz, rx);
    /**
     * The hat: a straw boater. Origin: the middle of the brim's underside at the front of
     * the head it sits on.  o: { holes (default true: the two holes his horns made) }
     */
    function hat(g, L, o = {}) {
        const { rx, rz, zc, bh, crx, crz, czc, ch, holeZ, holeR } = HAT;
        // loose straws at the brim's edge (behind it)
        for (const [a, len] of [[2.9, 0.1], [3.35, 0.085], [0.25, 0.1], [5.9, 0.07]]) {
            const p = oval(-bh * 0.5, rx, rz, zc, a, a, 1)[0], dx = Math.cos(a) * len, dy = -Math.sin(a) * len * 0.3 - 0.02;
            C.poly(g, [[p[0], p[1] - 0.02], [p[0] + dx, p[1] + dy], [p[0], p[1] + 0.02]], { fill: STRAW.front, lw: L * 0.8 });
        }
        // the brim: its edge (the lower oval shows under the upper one), then its top
        const tb = turn(rx, rz), under = oval(0, rx, rz, zc), top = oval(-bh, rx, rz, zc);
        C.poly(g, [...oval(-bh, rx, rz, zc, tb + Math.PI, tb + TAU, 20), ...oval(0, rx, rz, zc, tb, tb - Math.PI, 20)], { fill: STRAW.front, lw: L });
        C.poly(g, top, { fill: STRAW.top, lw: L });
        // its weave: rings, and slanted stitches round the edge
        line(g, oval(-bh, rx * 0.86, rz * 0.82, zc, 0.15, TAU - 0.15), STRAW.line, L * 0.6);
        line(g, oval(-bh, rx * 0.66, rz * 0.6, zc, Math.PI + 0.5, TAU - 0.5), STRAW.line, L * 0.6);
        for (let i = 0; i < 26; i++) {
            const a = (i / 26) * TAU + 0.1, p = oval(-bh, rx * 0.88, rz * 0.85, zc, a, a, 1)[0], q = oval(-bh, rx * 0.975, rz * 0.97, zc, a + 0.07, a + 0.07, 1)[0];
            line(g, [p, q], STRAW.line, L * 0.5);
        }
        // the holes the horns made, each with a torn lip
        if (o.holes !== false) {
            for (const hx of HAT.holes) {
                const c = ob(hx, -bh, holeZ);
                C.poly(g, flatRing(c[0], c[1], holeR), { fill: STRAW.hole, lw: L * 0.8 });
                for (const a of [0.5, 2.5, 4.2]) {
                    const p = [c[0] + holeR * Math.cos(a) + D[0] * holeR * Math.sin(a), c[1] + D[1] * holeR * Math.sin(a)];
                    C.poly(g, [[p[0] - 0.02, p[1]], [p[0] + 0.012 * Math.cos(a) + 0.02, p[1] - 0.055], [p[0] + 0.03, p[1] + 0.004]], { fill: STRAW.top, lw: L * 0.6 });
                }
            }
        }
        // the crown: a low drum with a flat top; its right flank is in shade
        const tc = turn(crx, crz), y0 = -bh, y1 = -bh - ch;
        const wall = (a0, a1) => [...oval(y1, crx, crz, czc, a0, a1, 16), ...oval(y0, crx, crz, czc, a1, a0, 16)];
        C.poly(g, wall(tc + Math.PI, tc + TAU), { fill: STRAW.front, lw: L });
        C.poly(g, wall(tc + TAU - 0.95, tc + TAU), { fill: STRAW.side, lw: 0 });
        // the weave on its wall
        g.save();
        C.trace(g, wall(tc + Math.PI, tc + TAU));
        g.clip();
        for (const k of [0.22, 0.44]) line(g, oval(y1 + ch * k, crx, crz, czc, tc + Math.PI, tc + TAU, 16), STRAW.line, L * 0.6);
        for (let i = 0; i < 11; i++) {
            const a = tc + Math.PI + ((i + 0.5) / 11) * Math.PI, k0 = i % 2 ? 0.22 : 0, p = oval(y1 + ch * k0, crx, crz, czc, a, a, 1)[0];
            line(g, [p, [p[0], p[1] + ch * 0.22]], STRAW.line, L * 0.5);
        }
        // the ribbon round its foot: red with a white stripe
        const bt = y0 - 0.125, bb = y0 - 0.008;
        C.poly(g, [...oval(bt, crx, crz, czc, tc + Math.PI, tc + TAU, 16), ...oval(bb, crx, crz, czc, tc + TAU, tc + Math.PI, 16)], { fill: STRAW.band, lw: L * 0.8 });
        C.poly(g, [...oval(bt, crx, crz, czc, tc + TAU - 0.95, tc + TAU, 8), ...oval(bb, crx, crz, czc, tc + TAU, tc + TAU - 0.95, 8)], { fill: STRAW.bandSide, lw: 0 });
        line(g, oval((bt + bb) / 2, crx, crz, czc, tc + Math.PI, tc + TAU, 16), STRAW.bandLine, L * 0.8);
        line(g, oval(bt, crx, crz, czc, tc + Math.PI, tc + TAU, 16), K.ink, L * 0.8);
        g.restore();
        C.poly(g, wall(tc + Math.PI, tc + TAU), { lw: L });
        C.poly(g, oval(y1, crx, crz, czc), { fill: STRAW.top, lw: L });
        line(g, oval(y1, crx * 0.62, crz * 0.6, czc, 0, TAU, 24), STRAW.line, L * 0.6);
        // a flat bow on the ribbon
        const k = oval((bt + bb) / 2, crx, crz, czc, 5.3, 5.3, 1)[0];
        for (const s of [-1, 1]) C.poly(g, [[k[0], k[1] - 0.02], [k[0] + s * 0.1, k[1] - 0.075 + s * 0.012], [k[0] + s * 0.11, k[1] + 0.06 + s * 0.012], [k[0], k[1] + 0.02]], { fill: STRAW.band, lw: L * 0.7 });
        C.poly(g, [[k[0] - 0.028, k[1] - 0.035], [k[0] + 0.028, k[1] - 0.035], [k[0] + 0.028, k[1] + 0.035], [k[0] - 0.028, k[1] + 0.035]], { fill: STRAW.bandSide, lw: L * 0.7 });
    }

    // One of the Devil's horns, as devil.js draws it (it has to be drawn again over whatever
    // it pokes through).
    function horn(g, L, sx) {
        const T = Devil.HEAD.top;
        const outer = C.curve([[sx * 0.5, T + 0.03], [sx * 0.615, T - 0.13], [sx * 0.62, T - 0.31], [sx * 0.49, T - 0.47]], false, 8);
        const inner = C.curve([[sx * 0.49, T - 0.47], [sx * 0.515, T - 0.31], [sx * 0.46, T - 0.17], [sx * 0.29, T - 0.03]], false, 8);
        const z = 0.14, shp = cw([...outer, ...inner.slice(1)].map(([x, y]) => [x + D[0] * z, y + D[1] * z]));
        C.prism(g, shp, Dd(0.13), { front: DP.horn, top: DP.hornSide, side: DP.hornSide }, { lw: L, ink: DP.ink, sweepInk: null });
        C.prismOutline(g, shp, Dd(0.13), { lw: L, ink: DP.ink });
        g.strokeStyle = DP.hornLine;
        g.lineWidth = L * 0.9;
        g.lineCap = 'round';
        g.beginPath();
        for (const k of [0.22, 0.42, 0.6, 0.76]) {
            const a = outer[Math.round(k * (outer.length - 1))], b = inner[Math.round((1 - k) * (inner.length - 1))];
            const ox = D[0] * z, oy = D[1] * z;
            g.moveTo(a[0] + ox + (b[0] - a[0]) * 0.12, a[1] + oy + (b[1] - a[1]) * 0.12);
            g.quadraticCurveTo((a[0] + b[0]) / 2 + ox, (a[1] + b[1]) / 2 + oy - 0.025, b[0] + ox - (b[0] - a[0]) * 0.12, b[1] + oy - (b[1] - a[1]) * 0.12);
        }
        g.stroke();
    }
    // The horns again, above the line y = cut (head space), so they stand in front of what
    // they went through.
    function hornsAbove(g, L, cut) {
        g.save();
        g.beginPath();
        g.rect(-2, -4, 4, 4 + cut);
        g.clip();
        horn(g, L, -1);
        horn(g, L, 1);
        g.restore();
    }

    /**
     * The hat on the Devil's head (head space): pushed down over the pompadour, the horns
     * through its brim. o: { dy (it lifts), ang (it tips about its middle), sq (pulled down) }
     */
    function hatOn(g, L, o = {}) {
        const dy = o.dy ?? 0, sq = o.sq ?? 0, y = HAT.seat + dy + sq * 0.05;
        g.save();
        g.translate(0, y);
        g.rotate(o.ang ?? 0);
        g.scale(1 + sq * 0.3, 1 - sq);
        hat(g, L);
        g.restore();
        if (Math.abs(dy) > 0.11 || Math.abs(o.ang ?? 0) > 0.1) return; // lifted clear: nothing pokes through
        const hy = y - HAT.bh + D[1] * HAT.holeZ;
        hornsAbove(g, L, hy + 0.012);
        // the near lip of each hole, over the horn's foot
        for (const hx of HAT.holes) line(g, flatRing(hx + D[0] * HAT.holeZ, hy, HAT.holeR, 12, Math.PI, TAU), DP.ink, L * 0.9);
    }

    // =========================================================================================
    // The joke glasses: round black frames, bushy brows, a false nose
    // =========================================================================================
    const SPECS = { frame: '#241531', brow: '#8a4f24', browShine: '#c98646', nose: '#ffb7a1', noseTop: '#ffd9cb', noseSide: '#e58f77', glint: '#ffffff', R: 0.17, ex: 0.21, eyeY: -1.36 };
    /**
     * The glasses. Origin: the bridge, between the eyes.
     *   o: { arms ('worn' on his head, 'open' sticking back when they fly, false) }
     */
    function glasses(g, L, o = {}) {
        const { R, ex } = SPECS, fw = 0.05, arms = o.arms ?? 'worn';
        if (arms === 'worn') {
            line(g, [[-ex - R, -0.02], [-0.5, -0.045]], SPECS.frame, fw * 0.75);
            line(g, [[ex + R, -0.02], [0.48, -0.035], ob(0.48, -0.035, 0.26)], SPECS.frame, fw * 0.75);
        } else if (arms === 'open') {
            for (const sx of [-1, 1]) line(g, [[sx * (ex + R), -0.02], ob(sx * (ex + R + 0.02), -0.02, 0.42), ob(sx * (ex + R + 0.02), 0.05, 0.5)], SPECS.frame, fw * 0.75);
        }
        // the bridge, the rims and a glint on each lens
        line(g, [[-ex + R, -0.03], [ex - R, -0.03]], SPECS.frame, fw);
        for (const sx of [-1, 1]) {
            g.beginPath();
            g.arc(sx * ex, 0, R, 0, TAU);
            g.strokeStyle = SPECS.frame;
            g.lineWidth = fw;
            g.stroke();
            line(g, [[sx * ex - 0.085, -0.05], [sx * ex - 0.035, -0.1]], SPECS.glint, L * 0.9);
        }
        // the brows: two bushy tufts of fake fur, raised in the middle (the innocent look)
        for (const sx of [-1, 1]) {
            const p = (x, y) => [sx * x, y];
            const brow = C.curve([p(0.03, -0.25), p(0.06, -0.335), p(0.125, -0.3), p(0.17, -0.345), p(0.235, -0.285), p(0.3, -0.315), p(0.36, -0.245), p(0.43, -0.235), p(0.425, -0.17), p(0.3, -0.172), p(0.17, -0.2), p(0.05, -0.2)], true, 4);
            C.poly(g, brow, { fill: SPECS.brow, lw: L * 0.85 });
            line(g, [p(0.09, -0.265), p(0.16, -0.25), p(0.3, -0.225)], SPECS.browShine, L * 0.9);
            for (const [bx, by] of [[0.13, -0.225], [0.24, -0.205], [0.34, -0.2]]) line(g, [p(bx, by), p(bx + 0.02, by - 0.04)], K.ink, L * 0.55);
        }
        // the nose: a pink block that sticks out
        const off = Dd(-0.15);
        const nose = [[-0.05, -0.06], [0.05, -0.06], [0.1, 0.07], [0.09, 0.145], [0, 0.175], [-0.09, 0.145], [-0.1, 0.07]].map(([x, y]) => [x + off[0], y + off[1]]);
        C.prism(g, nose, Dd(0.15), { front: SPECS.nose, top: SPECS.noseTop, side: SPECS.noseSide }, { lw: L });
        line(g, [[-0.05 + off[0], 0.02 + off[1]], [-0.062 + off[0], 0.09 + off[1]]], SPECS.noseTop, L * 1.1);
        g.fillStyle = K.ink;
        for (const sx of [-1, 1]) {
            g.beginPath();
            g.ellipse(sx * 0.038 + off[0], 0.132 + off[1], 0.017, 0.011, 0, 0, TAU);
            g.fill();
        }
    }
    const glassesOn = (g, L, o = {}) => {
        g.save();
        g.translate(0, SPECS.eyeY + (o.dy ?? 0));
        g.rotate(o.ang ?? 0);
        glasses(g, L, { arms: 'worn' });
        g.restore();
    };

    // =========================================================================================
    // The cardboard sign
    // =========================================================================================
    const CARD = { front: '#d3a063', top: '#ecc88f', side: '#a87437', line: '#b17f43', back: '#c18d4e', backLine: '#a06f35', tape: '#f3e2b8', paint: K.ink, red: '#e3262b' };
    const SIGN = { w: 1.3, h: 0.6 };
    // Text fitted in a box of the sign's units (drawn at 100 × so the font keeps its hinting).
    function paint(g, str, cx, cy, maxW, capH, o = {}) {
        g.save();
        g.translate(cx, cy);
        g.rotate(o.ang ?? 0);
        g.scale(0.01, 0.01);
        g.font = '100px "Anton"';
        g.textAlign = 'center';
        g.textBaseline = 'alphabetic';
        const m = g.measureText(str), asc = m.actualBoundingBoxAscent || 73, k = Math.min((capH * 100) / asc, (maxW * 100) / m.width);
        g.scale(k, k);
        g.lineJoin = 'round';
        if (o.stroke) {
            g.strokeStyle = o.stroke;
            g.lineWidth = (o.sw ?? 0.04) * 100 * 2 / k;
            g.strokeText(str, 0, asc / 2);
        }
        g.fillStyle = o.fill ?? CARD.paint;
        g.fillText(str, 0, asc / 2);
        g.restore();
    }
    /**
     * The sign. Origin: its middle. face: 'front' (RIDE?) or 'back' (RATS!).
     *   o: { holes: true when the horns have gone through its lower edge }
     */
    function sign(g, L, face, o = {}) {
        const { w, h } = SIGN, x0 = -w / 2, y0 = -h / 2, back = face === 'back';
        // cut by hand: no edge is quite square; the front's top corner is dog-eared
        const x1 = x0 + w, y1 = y0 + h;
        const pts = back ? [[x0, y0 + 0.012], [x1 - 0.012, y0], [x1, y1 - 0.014], [x0 + 0.016, y1]] : [[x0, y0 + 0.012], [x1 - 0.2, y0 + 0.002], [x1 - 0.004, y0 + 0.19], [x1, y1 - 0.014], [x0 + 0.016, y1]];
        C.prism(g, pts, Dd(0.07), { front: back ? CARD.back : CARD.front, top: CARD.top, side: CARD.side }, { lw: L });
        g.save();
        C.trace(g, pts);
        g.clip();
        const lc = back ? CARD.backLine : CARD.line;
        // the flutes of the corrugated board, showing through along its length
        for (let i = 1; i < 22; i++) {
            const x = x0 + (w * i) / 22, a = (i * 7) % 5;
            line(g, [[x, y0 + 0.02 + a * 0.012], [x, y0 + 0.075 + a * 0.012]], lc, L * 0.5);
            line(g, [[x, y0 + h - 0.075 - a * 0.01], [x, y0 + h - 0.02 - a * 0.01]], lc, L * 0.5);
        }
        if (back) {
            // the box it was cut from: a flap's fold, a strip of tape, the «this way up» arrows
            line(g, [[x0, 0.165], [x0 + w, 0.15]], lc, L * 1.1);
            C.poly(g, [[-0.26, 0.07], [-0.07, 0.062], [-0.065, 0.262], [-0.255, 0.268]], { fill: CARD.tape, lw: L * 0.7 });
            for (const ax of [0.1, 0.215]) {
                line(g, [[ax, 0.262], [ax, 0.2]], K.ink, L * 1.3);
                C.poly(g, [[ax - 0.04, 0.215], [ax, 0.168], [ax + 0.04, 0.215]], { fill: K.ink, lw: L * 0.5 });
            }
            line(g, [[0.045, 0.27], [0.27, 0.27]], K.ink, L * 1.1);
        } else {
            // a crease down it
            line(g, [[x0 + w * 0.3, y0], [x0 + w * 0.27, y0 + h]], lc, L * 0.7);
        }
        g.restore();
        C.poly(g, pts, { lw: L });
        // the folded-over corner
        if (!back) C.poly(g, [[x1 - 0.2, y0 + 0.002], [x1 - 0.004, y0 + 0.19], [x1 - 0.17, y0 + 0.16]], { fill: CARD.top, lw: L * 0.8 });
        if (back) paint(g, 'RATS!', -0.02, -0.085, 1.0, 0.3, { fill: CARD.red, stroke: K.ink, sw: 0.016, ang: -0.03 });
        else paint(g, 'RIDE?', -0.03, 0.0, 1.02, 0.37, { ang: -0.025 });
    }
    // A mitt of his laid over an edge (he holds the sign from behind): (x, y) the edge's point.
    function mitt(g, L, x, y) {
        C.box(g, x - 0.1, y - 0.075, 0.2, 0.135, D, { front: DP.skin, top: DP.skinTop, side: DP.skinSide }, { lw: L, depth: 0.16 });
    }
    // A scrap of cardboard (the bits the horns punch out).
    function chip(g, L, a) {
        C.poly(g, [[-0.05, -0.03], [0.04, -0.045], [0.06, 0.02], [-0.03, 0.04]].map((p) => rot(p, a)), { fill: CARD.front, lw: L * 0.8 });
    }

    // =========================================================================================
    // Speed, wind, dust, stars
    // =========================================================================================
    /**
     * Speed lines: tapered white streaks with their thick end ahead (to the right), and thin
     * ink ones between. box: [x, y, w, h]; o: { n, len: [min, max], th, ink (0..1 the share of ink lines) }
     */
    function streaks(g, seed, box, o = {}) {
        const { n = 8, len = [120, 320], th = 7, ink = 0.35 } = o, r = Motion.rng('v1a-streak:' + seed);
        for (let i = 0; i < n; i++) {
            const x = box[0] + r() * box[2], y = box[1] + ((i + r() * 0.8) / n) * box[3], l = len[0] + r() * (len[1] - len[0]), t = th * (0.55 + r() * 0.6);
            if (r() < ink) line(g, [[x - l * 0.7, y], [x, y]], K.ink, 3);
            else C.poly(g, [[x - l, y], [x - l * 0.25, y - t / 2], [x, y - t * 0.3], [x + t * 0.5, y], [x, y + t * 0.3], [x - l * 0.25, y + t / 2]], { fill: K.white, lw: 2.6 });
        }
    }

    // Scalloped puffs (dust, as rides.js draws it): list of [x, y, r, bumps, phase].
    function puffs(g, list, fill, lw = 3.2) {
        const parts = [];
        for (const [x, y, r, n, a0] of list) {
            if (r < 3) continue;
            parts.push([x, y, r * 0.74]);
            for (let i = 0; i < n; i++) parts.push([x + Math.cos(a0 + (i / n) * TAU) * r * 0.62, y + Math.sin(a0 + (i / n) * TAU) * r * 0.62, r * 0.4]);
        }
        g.strokeStyle = K.ink;
        g.lineWidth = lw * 2;
        for (const [x, y, r] of parts) {
            g.beginPath();
            g.arc(x, y, r, 0, TAU);
            g.stroke();
        }
        g.fillStyle = fill;
        for (const [x, y, r] of parts) {
            g.beginPath();
            g.arc(x, y, r, 0, TAU);
            g.fill();
        }
    }

    // A five-pointed star with a lit facet.
    function star(g, x, y, r, a = 0, col = K.yellow) {
        const pts = Array.from({ length: 10 }, (_, i) => {
            const ang = a - Math.PI / 2 + (i / 10) * TAU, rad = i % 2 ? r * 0.46 : r;
            return [x + Math.cos(ang) * rad, y + Math.sin(ang) * rad];
        });
        C.poly(g, pts, { fill: col, lw: 3 });
        C.poly(g, [pts[0], pts[1], [x, y], pts[9]], { fill: '#fff59a', lw: 0 });
        C.poly(g, pts, { lw: 3 });
    }

    // =========================================================================================
    // The top: the Devil spinning too fast to see, as stacked bands of his colours
    // =========================================================================================
    // half-widths up his height: hooves, trousers, coat tails, the mitts flung out, neck, head, hair
    const PROFILE = [[0.0, 0.07], [-0.1, 0.2], [-0.38, 0.27], [-0.56, 0.5], [-0.78, 0.74], [-0.9, 0.8], [-1.0, 0.52], [-1.12, 0.57], [-1.7, 0.6], [-1.9, 0.52], [-2.02, 0.4], [-2.08, 0.18]];
    const widthAt = (y) => {
        for (let i = 1; i < PROFILE.length; i++) {
            const [y0, w0] = PROFILE[i - 1], [y1, w1] = PROFILE[i];
            if (y <= y0 && y >= y1) return w0 + ((w1 - w0) * (y0 - y)) / (y0 - y1);
        }
        return 0.2;
    };
    /**
     * The whirl. Origin: the point it spins on (the ground). d: which drawing (they cycle in
     * threes); k: 1 at full speed → 0 slowing (fewer lines).
     */
    function whirl(g, L, d, k = 1) {
        const v = ((d % 3) + 3) % 3, sag = 0.075;
        const arc = (y, a0, a1, grow = 0, n = 14) => {
            const w = widthAt(y) + grow;
            return Array.from({ length: n + 1 }, (_, i) => {
                const a = a0 + ((a1 - a0) * i) / n;
                return [Math.cos(a) * w, y + Math.sin(a) * sag * (w / 0.6 + 0.3)];
            });
        };
        // motion rings round it: the far halves go behind
        const rings = [[-1.96, 0.3, 0.3], [-1.38, 0.24, 1.4], [-0.72, 0.3, 2.3], [-0.24, 0.26, 0.9]].slice(0, k > 0.5 ? 4 : 2);
        rings.forEach(([y, grow, ph], i) => {
            const a0 = Math.PI + 0.3 + ((v * 1.3 + ph) % 1.6);
            line(g, arc(y, a0, a0 + 1.1, grow), K.ink, L);
        });
        // the tail whips round: behind on one drawing, in front on the others
        const tail = (front) => {
            const a0 = front ? (v === 0 ? 0.25 : 1.75) : 3.6, a1 = a0 + 1.25, yy = -0.6 - 0.06 * v, n = 12;
            const cl = Array.from({ length: n + 1 }, (_, i) => {
                const a = a0 + ((a1 - a0) * i) / n, w = 0.72 + 0.34 * (i / n);
                return [Math.cos(a) * w, yy - 0.2 * (i / n) + Math.sin(a) * 0.13, 0.05 - 0.026 * (i / n)];
            });
            C.poly(g, ribbon(cl), { fill: DP.skin, lw: L });
            const e = cl[n], f = cl[n - 2], an = Math.atan2(e[1] - f[1], e[0] - f[0]);
            C.poly(g, [[-0.02, -0.03], [-0.07, -0.13], [0.06, -0.075], [0.2, 0], [0.06, 0.075], [-0.07, 0.13], [-0.02, 0.03]].map((p) => {
                const q = rot(p, an);
                return [e[0] + q[0], e[1] + q[1]];
            }), { fill: DP.skin, lw: L });
        };
        // the horns go round: two of them and an echo, the far ones behind the hair
        const horns = [0.5 + v * 0.95, 0.5 + v * 0.95 + Math.PI, 1.55 + v * 0.95].map((a, i) => [Math.cos(a) * 0.47, -1.93 + Math.sin(a) * 0.05, Math.sin(a) > 0, i === 2 ? 0.8 : 1]);
        const blade = ([x, y, , sc]) => {
            const dir = x >= 0 ? 1 : -1, q = (px, py) => [x + dir * px * sc, y + py * sc];
            const shp = C.curve([q(-0.1, 0.03), q(0.0, -0.12), q(0.12, -0.3), q(0.02, -0.44), q(0.2, -0.3), q(0.16, -0.1), q(0.1, 0.03)], true, 5);
            C.poly(g, shp, { fill: DP.horn, lw: L });
            line(g, [q(0.02, -0.06), q(0.13, -0.1)], DP.hornLine, L * 0.8);
            line(g, [q(0.08, -0.2), q(0.17, -0.22)], DP.hornLine, L * 0.8);
        };
        horns.filter((h) => !h[2]).forEach(blade);
        if (v === 1) tail(false);
        // the silhouette
        const wob = (y) => 0.025 * Math.sin(y * 5 + v * 2.1);
        const left = PROFILE.map(([y, w]) => [-w + wob(y), y]), right = PROFILE.map(([y, w]) => [w + wob(y), y]).reverse();
        const sil = C.curve([...left, ...right], true, 5);
        g.save();
        C.trace(g, sil);
        g.clip();
        // bands of colour, from the horns down; each boundary sags like a ring seen from above
        const band = (y, col) => C.poly(g, [...arc(y, Math.PI, 0, 0.5), [3, 1], [-3, 1]], { fill: col, lw: 0 });
        g.fillStyle = DP.hair;
        g.fillRect(-3, -3, 6, 4);
        band(-1.76, DP.skin);
        band(-1.02, DP.suit);
        band(-0.42, DP.trouser);
        band(-0.12, DP.hoof);
        // what is left of his features: smears that follow the rings
        const smear = (y, a0, a1, col, lw, grow = 0) => line(g, arc(y, a0, a1, grow), col, lw);
        const o = v * 0.5;
        smear(-1.88, 1.0 - o * 0.4, 2.3 - o * 0.4, DP.sheen, L * 1.6);
        smear(-1.5, 0.5 + o, 2.7 + o * 0.2, DP.hair, 0.06); // the brows
        smear(-1.36, 0.35, 2.8, DP.eye, 0.13); // the eyes: one yellow stripe, pupils flicking past
        for (let i = 0; i < 3; i++) smear(-1.36, 0.7 + i * 0.75 + o * 0.5, 0.86 + i * 0.75 + o * 0.5, DP.pupil, 0.1);
        smear(-1.2, 0.6 - o * 0.3, 2.5 - o * 0.3, DP.hair, 0.045); // the moustache
        smear(-1.09, 0.8 + o * 0.3, 2.3 + o * 0.3, DP.tooth, 0.075); // the grin
        smear(-0.9, 0.25, 2.9, DP.lapel, 0.06);
        smear(-0.8, 0.9 + o, 2.1 + o, DP.shirt, 0.07);
        smear(-0.72, 1.2 - o, 1.9 - o, DP.tie, 0.06);
        smear(-0.52, 0.5 + o, 2.6 + o, DP.suitSide, L * 1.6);
        for (const y of [-0.3, -0.2]) smear(y, 0.6 + o, 2.5 + o, DP.stripe, L * 0.8);
        // the mitts at the rim, flung out
        for (const sx of [-1, 1]) {
            g.beginPath();
            g.ellipse(sx * 0.72 + wob(-0.9), -0.86, 0.17, 0.085, 0, 0, TAU);
            g.fillStyle = DP.skin;
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = L * 0.9;
            g.stroke();
        }
        // the seams between the bands
        for (const y of [-1.76, -1.02, -0.42, -0.12]) line(g, arc(y, Math.PI, 0, 0.5), K.ink, L * 0.8);
        g.restore();
        C.poly(g, sil, { lw: L });
        horns.filter((h) => h[2]).forEach(blade);
        if (v !== 1) tail(true);
        // speed: white lines over it, and the near halves of the rings
        const marks = [[-1.62, 0.9, 1.9], [-1.26, 0.5, 1.2], [-0.62, 1.4, 2.4], [-1.88, 1.5, 2.3], [-0.3, 0.7, 1.5]].slice(0, k > 0.5 ? 5 : 3);
        marks.forEach(([y, a0, a1], i) => smear(y, a0 + ((v + i) % 3) * 0.3, a1 + ((v + i) % 3) * 0.3, K.white, L * 1.3, -0.05));
        rings.forEach(([y, grow, ph], i) => {
            const a0 = 0.2 + ((v * 1.1 + ph) % 1.5);
            line(g, arc(y, a0, a0 + 1.2, grow), K.ink, L);
        });
    }

    // =========================================================================================
    // The roadside (the set of the hitchhiker shot)
    // =========================================================================================
    const W = World.THEMES.day;
    const SET = { HOR: 535, ROAD0: 708, ROAD1: 940, LANE: 866, SC: 160 };

    // The sun with its shades, as world.js draws it (the same sun, in another shot).
    function sun(g, t, x, y, r, nod = 0) {
        const d = C.drawing(t);
        C.burst(g, x, y, { r0: r * 1.18, r1: r * 1.5, n: 14, seed: 'sun', jitter: 0.08, rot: d % 2 ? 0.06 : 0, fill: K.gold, ink: K.ink, lw: 4 });
        g.save();
        g.translate(x, y + nod);
        g.beginPath();
        g.arc(0, 0, r, 0, TAU);
        g.fillStyle = K.yellow;
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = 4;
        g.stroke();
        for (const sx of [-1, 1]) {
            const cx = sx * r * 0.36;
            C.poly(g, [[cx - r * 0.3, -r * 0.22], [cx + r * 0.3, -r * 0.22], [cx + r * 0.25, r * 0.08], [cx + r * 0.12, r * 0.16], [cx - r * 0.12, r * 0.16], [cx - r * 0.25, r * 0.08]], { fill: '#1d1626', ink: K.ink, lw: 3 });
            C.poly(g, [[cx - r * 0.16, r * 0.04], [cx - r * 0.02, -r * 0.12]], { ink: '#ffffff', lw: 3, close: false });
        }
        C.poly(g, [[-r * 0.1, -r * 0.18], [r * 0.1, -r * 0.18]], { ink: K.ink, lw: 5, close: false });
        C.poly(g, [[-r * 0.3, r * 0.42], [-r * 0.08, r * 0.52], [r * 0.14, r * 0.5], [r * 0.34, r * 0.36]], { ink: K.ink, lw: 4, close: false });
        g.restore();
    }
    function moon(g, x, y, r) {
        g.save();
        g.translate(x, y);
        g.beginPath();
        g.arc(0, 0, r, 0, TAU);
        g.fillStyle = '#fffbe8';
        g.fill();
        g.save();
        g.clip();
        g.fillStyle = '#dcd6f7';
        for (const [cx, cy, cr] of [[-0.42, -0.26, 0.26], [0.36, -0.5, 0.15], [0.44, 0.28, 0.3], [-0.5, 0.42, 0.14], [0.02, 0.06, 0.1], [-0.08, 0.74, 0.17]]) {
            g.beginPath();
            g.ellipse(cx * r, cy * r, cr * r, cr * r * 0.84, -0.3, 0, TAU);
            g.fill();
        }
        g.restore();
        g.beginPath();
        g.arc(0, 0, r, 0, TAU);
        g.strokeStyle = K.ink;
        g.lineWidth = 4;
        g.stroke();
        g.restore();
    }
    // A mesa as world.js builds it, standing on any line.
    function mesa(g, x, y0, w, h, dep) {
        const yt = y0 - h, yl = y0 - h * 0.5;
        const pts = [[x, y0], [x + w * 0.07, yl], [x + w * 0.15, yl - h * 0.05], [x + w * 0.2, yt], [x + w * 0.8, yt], [x + w * 0.85, yl - h * 0.05], [x + w * 0.93, yl], [x + w, y0]];
        C.prism(g, pts, [dep, -dep * 0.66], { front: W.mesa, top: W.mesaTop, side: W.mesaSide }, { lw: 4 });
        g.save();
        C.trace(g, pts);
        g.clip();
        for (const k of [0.2, 0.36, 0.66, 0.84]) line(g, [[x, yt + h * k], [x + w, yt + h * k]], W.mesaSide, 3);
        line(g, [[x + w * 0.07, yl], [x + w * 0.93, yl]], W.mesaTop, 4);
        g.restore();
        C.poly(g, pts, { lw: 4 });
    }

    /**
     * A saguaro drawn for the closer shot: a ribbed trunk with spines and a flower on top.
     * (x, y) its foot, h its height.
     *   o: { w (the trunk's width), bend (the wind pushes its top that many units to the right),
     *        flower (false when something sits on its top),
     *        arm: { side (-1 left, 1 right), off (how far out, in trunk widths), elbow, top (heights, as shares of h) } }
     */
    function cactus(g, x, y, h, o = {}) {
        const w = o.w ?? 72, dd = [15, -10], bend = o.bend ?? 0;
        g.save();
        g.translate(x, y);
        g.transform(1, 0, -bend / h, 1, 0, 0);
        const column = (px, py, pw, ph, ribs) => {
            g.lineWidth = 3.2;
            g.strokeStyle = K.ink;
            g.lineJoin = 'round';
            g.beginPath();
            g.roundRect(px + dd[0], py + dd[1], pw, ph, [pw / 2, pw / 2, 0, 0]);
            g.fillStyle = W.cactusSide;
            g.fill();
            g.stroke();
            g.beginPath();
            g.roundRect(px, py, pw, ph, [pw / 2, pw / 2, 0, 0]);
            g.fillStyle = W.cactus;
            g.fill();
            g.stroke();
            // ribs, and pairs of spines along them
            ribs.forEach((k, i) => {
                const rx = px + pw * k, top = py + pw * (0.5 - Math.sqrt(Math.max(0, 0.25 - (k - 0.5) * (k - 0.5)))) + 6;
                line(g, [[rx, top], [rx, py + ph - 4]], i % 2 ? W.cactusSide : W.cactusTop, 2.4);
                for (let sy = top + 18 + (i % 2) * 23; sy < py + ph - 14; sy += 46) {
                    line(g, [[rx - 5, sy - 4], [rx, sy], [rx + 5, sy - 4]], K.ink, 1.8);
                }
            });
        };
        const flower = (fx, fy, s) => {
            for (const a of [-0.9, 0, 0.9]) C.poly(g, [[fx, fy], ...[[-0.36, -0.75], [0, -1.05], [0.36, -0.75]].map((p) => {
                const q = rot(p, a);
                return [fx + q[0] * s, fy + q[1] * s];
            })], { fill: K.pink, lw: 2.6 });
            g.beginPath();
            g.arc(fx, fy - s * 0.2, s * 0.3, 0, TAU);
            g.fillStyle = K.yellow;
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = 2.2;
            g.stroke();
        };
        // the arm first (its elbow tucks behind the trunk), then the trunk
        if (o.arm) {
            const sd = o.arm.side, aw = w * 0.66, ax = sd * w * o.arm.off, ay = -h * o.arm.top, elbow = -h * o.arm.elbow;
            flower(ax + 4, ay + 5, 16);
            // the elbow: a block from the trunk out to under the arm, with its side and its ribs
            const e0 = Math.min(0, ax - sd * aw / 2), e1 = Math.max(0, ax - sd * aw / 2);
            C.box(g, e0, elbow, e1 - e0 + (sd > 0 ? aw : 0) - (sd < 0 ? 0 : 0), aw, dd, { front: W.cactus, top: W.cactusTop, side: W.cactusSide }, { lw: 3.2, depth: 1 });
            column(ax - aw / 2, ay, aw, elbow - ay + aw, [0.34, 0.68]);
            line(g, [[Math.min(ax, 0) + (sd < 0 ? aw * 0.2 : w * 0.5), elbow + aw * 0.36], [Math.max(ax, 0) - (sd > 0 ? aw * 0.2 : w * 0.5), elbow + aw * 0.36]], W.cactusTop, 2.4);
            line(g, [[Math.min(ax, 0) + (sd < 0 ? -aw * 0.1 : w * 0.5), elbow + aw * 0.72], [Math.max(ax, 0) + (sd > 0 ? aw * 0.1 : -w * 0.5), elbow + aw * 0.72]], W.cactusSide, 2.4);
        }
        if (o.flower !== false) flower(3, -h + 6, 21);
        column(-w / 2, -h, w, h, [0.2, 0.4, 0.62, 0.82]);
        // sand banked against its foot
        C.poly(g, C.curve([[-w * 0.95, 4], [-w * 0.5, -9], [0, -4], [w * 0.55, -10], [w * 1.05, 4]], false, 5), { fill: W.sand, ink: K.ink, lw: 3.2, close: false });
        g.restore();
    }

    // A bush for the closer shot: lobes with a darker underside and a few leaves picked out.
    //   o: { sway (the wind lays it to the right, in units at its top), seed }
    function bush(g, x, y, s, o = {}) {
        const body = new Path2D(), lobes = [[-0.62, -0.2, 0.3], [-0.3, -0.42, 0.36], [0.12, -0.52, 0.4], [0.5, -0.36, 0.32], [0.74, -0.16, 0.24]];
        for (const [lx, ly, lr] of lobes) body.arc(lx * s, ly * s, lr * s, 0, TAU);
        body.rect(-0.9 * s, -0.2 * s, 1.86 * s, 0.2 * s);
        g.save();
        g.translate(x, y);
        g.transform(1, 0, -(o.sway ?? 0) / (0.9 * s), 1, 0, 0);
        g.strokeStyle = K.ink;
        g.lineWidth = 6.4;
        g.lineJoin = 'round';
        g.stroke(body);
        g.fillStyle = W.bush;
        g.fill(body);
        g.save();
        g.clip(body);
        g.fillStyle = W.bushD;
        g.fillRect(-s, -0.17 * s, 2 * s, 0.2 * s);
        const r = Motion.rng('v1a-bush:' + (o.seed ?? 0));
        for (let i = 0; i < 9; i++) {
            const [lx, ly, lr] = lobes[i % lobes.length], a = -2.6 + r() * 2.0, rr = lr * (0.25 + r() * 0.5);
            const px = (lx + Math.cos(a) * rr) * s, py = (ly + Math.sin(a) * rr) * s;
            line(g, [[px - 0.07 * s, py + 0.02 * s], [px, py - 0.05 * s], [px + 0.07 * s, py + 0.02 * s]], i % 3 ? '#7be38f' : W.bushD, 2.6);
        }
        g.restore();
        g.restore();
    }

    /**
     * The roadside, further up the road: sky, sun and moon, mesas, dunes, the far verge and
     * the whole road across the bottom, at 160 units a figure (the cars' scale is 84).
     *   o: { nod (the sun's), behindDunes() draws what is parked out there, hull down }
     */
    function roadside(g, t, o = {}) {
        const { HOR, ROAD0, ROAD1 } = SET, d = C.drawing(t);
        C.sunburst(g, 500, HOR + 60, { n: 12, rot: 0.3 + t * 0.06, a: W.skyA, b: W.skyB });
        moon(g, 880, 150, 34);
        sun(g, t, 168, 150, 62, (d % 4 < 2 ? 0 : 3) + (o.nod ?? 0));
        World.cloud(g, W, 600 + (t - Song.B(14)) * 9, 120, 52);
        mesa(g, 610, HOR + 6, 230, 84, 28);
        mesa(g, 905, HOR + 6, 170, 150, 26);
        for (const [x, h, f] of [[655, 62, 1], [742, 50, -1]]) World.cactus(g, W, x, HOR - 4, h, f);
        if (o.behindDunes) o.behindDunes();
        // dunes along the horizon
        const dune = [[-20, ROAD0]];
        for (let x = -20; x <= 1020; x += 20) dune.push([x, HOR - 14 - 13 * Math.sin(x / 150 + 0.6) - 7 * Math.sin(x / 53 + 1)]);
        dune.push([1020, ROAD0]);
        C.poly(g, dune, { fill: W.dune, lw: 0 });
        line(g, dune.slice(1, -1), K.ink, 4);
        const r = Motion.rng('v1a-sand');
        for (let i = 0; i < 6; i++) {
            const x = r() * 1000, y = HOR + 8 + r() * 16;
            line(g, [[x, y], [x + 50 + r() * 60, y]], W.duneLine, 3);
        }
        // the far verge
        g.fillStyle = W.sand;
        g.fillRect(-20, HOR + 40, 1040, ROAD0 - HOR);
        const edge = [];
        for (let x = -20; x <= 1020; x += 20) edge.push([x, HOR + 42 + 5 * Math.sin(x / 110 + 2)]);
        line(g, edge, K.ink, 4);
        for (let i = 0; i < 20; i++) {
            const x = r() * 1000, y = HOR + 62 + r() * (ROAD0 - HOR - 80), w = 20 + r() * 44;
            if (r() < 0.7) line(g, [[x, y], [x + w, y]], W.sandD, 3.2);
            else {
                g.beginPath();
                g.ellipse(x, y, 9 + r() * 6, 5 + r() * 3, 0, 0, TAU);
                g.fillStyle = W.sandD;
                g.fill();
            }
        }
        // the road: both edge lines, the dashes, cracks; the near verge under it
        g.fillStyle = W.road;
        g.fillRect(-20, ROAD0, 1040, ROAD1 - ROAD0);
        line(g, [[-20, ROAD0], [1020, ROAD0]], K.ink, 4);
        line(g, [[-20, ROAD0 + 22], [1020, ROAD0 + 22]], W.roadEdge, 4.8);
        for (let x = -90; x < 1020; x += 320) line(g, [[x, ROAD0 + 84], [x + 164, ROAD0 + 84]], W.roadLine, 13);
        for (const [x, y] of [[236, ROAD0 + 112], [742, ROAD0 + 46]]) line(g, [[x, y], [x + 44, y + 26], [x + 70, y + 16], [x + 122, y + 54]], W.crack, 3.4);
        line(g, [[-20, ROAD1 - 22], [1020, ROAD1 - 22]], W.roadEdge, 4.8);
        g.fillStyle = W.sand;
        g.fillRect(-20, ROAD1, 1040, 100);
        line(g, [[-20, ROAD1], [1020, ROAD1]], K.ink, 4);
        for (let i = 0; i < 7; i++) {
            const x = 40 + r() * 920, y = ROAD1 + 14 + r() * 26;
            line(g, [[x, y], [x + 18 + r() * 30, y]], W.sandD, 3.4);
        }
    }

    return { units, onHead, hat, hatOn, HAT, hornsAbove, glasses, glassesOn, SPECS, sign, SIGN, mitt, chip, streaks, puffs, star, whirl, SET, roadside, cactus, bush, sun, moon, mesa };
})();
