// «The swapped sign», bars 17–19 (24.375–28.583 s): the Devil's second scheme, on a sunny day.
// At a fork the highway runs on in the sun and an exit ramp drops into Hell's mouth. He swaps
// the signpost's two boards so HEAVEN points down the ramp; the band drives straight on without
// reading anything, and his own chauffeur, who does read, takes the exit with him aboard.
//   bar 17      Swap   a closer shot of the sign (no cars): HELL goes up on the first beat,
//                      HEAVEN comes down into his mitts and goes on the low nail on the third
//   bars 18–19  Fork   the wide shot: the band passes, the hearse takes the exit and drops in
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, twos = S.twos, b = S.b, B = S.B, pop = S.pop;
    const W = World.THEMES.day, D = Cast.D, TAU = Math.PI * 2, PI = Math.PI;
    const T0 = B(17), T1 = B(18), T2 = B(20);
    const n = (k) => b(68 + k); // beat k of the block (bar 17 starts on beat 68)
    const bump = (t, a, dur = 0.3) => E.bump(twos(t, a), a, dur);
    const seg = (t, a, c) => E.seg(twos(t, a), a, c);
    const kOf = (t, a) => Math.floor((t - a) * 12 + 1e-6); // the drawing we are on, counted from an event
    const lerp = E.lerp;
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const ell = (cx, cy, rx, ry, a0, a1, m = 28) => Array.from({ length: m + 1 }, (_, i) => {
        const a = a0 + ((a1 - a0) * i) / m;
        return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
    });
    const SHADOW = 'rgba(36,21,49,0.28)';
    const STONE = '#b388f0', STONE_T = '#d9c8ff', STONE_D = '#7d47e1'; // the day set's rock, as a curb
    const TOOTH = '#fff6e0', TOOTH_T = '#fffdf4', TOOTH_S = '#d9c39a', PIT = '#4d0f1c', ROAD_D = '#211c57';

    // =========================================================================================
    // The set: the day road, drawn by hand for two static shots (World's pieces and palette)
    // =========================================================================================
    // The sun of the road set (World.back draws it inline; this is the same drawing).
    function sun(g, t, x, y, r) {
        const d = C.drawing(t), bob = d % 4 < 2 ? 0 : 3;
        C.burst(g, x, y, { r0: r * 1.18, r1: r * 1.5, n: 14, seed: 'sun', jitter: 0.08, rot: d % 2 ? 0.06 : 0, fill: K.gold, ink: K.ink, lw: 4 });
        g.save();
        g.translate(x, y + bob);
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

    /**
     * Sky, mesas, dunes, the far verge, the highway and the near sand.
     *   o: { hor, r0, r1 (the horizon and the highway's far and near edges), sun: [x, y, r],
     *        clouds: [[x, y, s]], mesas: [[x, w, h, dep]], poles: [x…], verge(g) (things on the
     *        far verge), gap: [xa, xb] (where the ramp leaves the near edge), seed }
     */
    function backdrop(g, t, o) {
        const { hor, r0, r1, seed } = o, k = (r1 - r0) / 122;
        C.sunburst(g, 500, hor + 40, { n: 12, rot: t * 0.06, a: W.skyA, b: W.skyB });
        sun(g, t, ...o.sun);
        for (const [x, y, s] of o.clouds) World.cloud(g, W, x + (t - T0) * 5, y, s);
        g.save();
        g.translate(0, hor - World.HOR);
        for (const m of o.mesas) World.mesa(g, W, ...m);
        g.restore();
        // dunes along the horizon
        const dune = [[-20, r0]];
        for (let x = -20; x <= 1020; x += 20) dune.push([x, hor - 16 - 12 * Math.sin((x + seed) / 130) - 7 * Math.sin((x + seed) / 47 + 1)]);
        dune.push([1020, r0]);
        C.poly(g, dune, { fill: W.dune, lw: 0 });
        C.poly(g, dune.slice(1, -1), { ink: K.ink, lw: 4, close: false });
        const r = Motion.rng('v1b-set:' + seed);
        for (let i = 0; i < 5; i++) {
            const x = i * 210 + r() * 120, y = hor + 6 + r() * 14;
            C.poly(g, [[x, y], [x + 40 + r() * 50, y]], { ink: W.duneLine, lw: 3, close: false });
        }
        // the far verge
        g.fillStyle = W.sand;
        g.fillRect(-20, hor + 34, 1040, r0 - hor);
        const edge = [];
        for (let x = -20; x <= 1020; x += 20) edge.push([x, hor + 36 + 4 * Math.sin((x + seed) / 90)]);
        C.poly(g, edge, { ink: K.ink, lw: 4, close: false });
        for (let i = 0; i < 9; i++) {
            const x = i * 118 + r() * 70, y = hor + 50 + r() * Math.max(4, r0 - hor - 70);
            C.poly(g, [[x, y], [x + 18 + r() * 30, y]], { ink: W.sandD, lw: 3, close: false });
        }
        // poles and their two wires, sagging between crossarms and running off both sides
        const POLE_H = 250, py = r0 - 26, px = [o.poles[0] - 430, ...o.poles, o.poles[o.poles.length - 1] + 430];
        if (o.poles.length) {
            for (let i = 0; i + 1 < px.length; i++) {
                for (const dx of [-36, 36]) {
                    g.beginPath();
                    g.moveTo(px[i] + dx, py - POLE_H + 8);
                    g.quadraticCurveTo((px[i] + px[i + 1]) / 2 + dx, py - POLE_H + 62, px[i + 1] + dx, py - POLE_H + 8);
                    g.strokeStyle = W.wire;
                    g.lineWidth = 2.6;
                    g.stroke();
                }
            }
        }
        o.verge(g, py);
        // the highway
        g.fillStyle = W.road;
        g.fillRect(-20, r0, 1040, r1 - r0);
        C.poly(g, [[-20, r0], [1020, r0]], { ink: K.ink, lw: 4, close: false });
        C.poly(g, [[-20, r0 + 12 * k], [1020, r0 + 12 * k]], { ink: W.roadEdge, lw: 3.4, close: false });
        for (let x = o.dash0; x < 1020; x += 170 * Math.max(0.75, k)) C.poly(g, [[x, r0 + 44 * k], [x + 86 * Math.max(0.75, k), r0 + 44 * k]], { ink: W.roadLine, lw: Math.max(5, 8 * k), close: false });
        for (const [x, y] of o.cracks) C.poly(g, [[x, r0 + y * k], [x + 26, r0 + (y + 14) * k], [x + 40, r0 + (y + 8) * k], [x + 70, r0 + (y + 30) * k]], { ink: W.crack, lw: 3, close: false });
        const [xa, xb] = o.gap;
        C.poly(g, [[-20, r1 - 12 * k], [xa - 34 * k, r1 - 12 * k]], { ink: W.roadEdge, lw: 3.4, close: false });
        C.poly(g, [[xb + 34 * k, r1 - 12 * k], [1020, r1 - 12 * k]], { ink: W.roadEdge, lw: 3.4, close: false });
        // the near sand
        g.fillStyle = W.sand;
        g.fillRect(-20, r1, 1040, 1100 - r1);
        C.poly(g, [[-20, r1], [xa, r1]], { ink: K.ink, lw: 4, close: false });
        C.poly(g, [[xb, r1], [1020, r1]], { ink: K.ink, lw: 4, close: false });
        for (let i = 0; i < 30; i++) {
            const x = r() * 1000, y = r1 + 18 + r() * (930 - r1);
            if (r() < 0.55) C.poly(g, [[x, y], [x + 16 + r() * 26, y]], { ink: W.sandD, lw: 3.4, close: false });
            else {
                g.beginPath();
                g.ellipse(x, y, 7 + r() * 5, 4 + r() * 3, 0, 0, TAU);
                g.fillStyle = W.sandD;
                g.fill();
            }
        }
    }

    // The exit ramp: a strip of road between two edges (control points, top to bottom), with
    // its white edge lines running on from the highway's and a dashed centre line.
    function ramp(g, R) {
        const { r1, k } = R, at = (u) => R.L.map((p, i) => [lerp(p[0], R.R[i][0], u), lerp(p[1], R.R[i][1], u)]);
        const L = C.curve(R.L, false, 10), Rr = C.curve(R.R, false, 10);
        C.poly(g, [...L, ...Rr.slice().reverse()], { fill: W.road, lw: 0 });
        C.poly(g, L, { ink: K.ink, lw: 4, close: false });
        C.poly(g, Rr, { ink: K.ink, lw: 4, close: false });
        C.poly(g, C.curve([[R.L[0][0] - 34 * k, r1 - 12 * k], ...at(0.1)], false, 10), { ink: W.roadEdge, lw: 3.4, close: false });
        C.poly(g, C.curve([[R.R[0][0] + 34 * k, r1 - 12 * k], ...at(0.9)], false, 10), { ink: W.roadEdge, lw: 3.4, close: false });
        const mid = C.curve(at(0.5), false, 10);
        for (let i = 3; i + 5 < mid.length; i += 9) C.poly(g, mid.slice(i, i + 5), { ink: W.roadLine, lw: Math.max(5, 7 * k), close: false });
    }

    // =========================================================================================
    // Hell's mouth: a pit with a stone curb, teeth standing on the near lip and hanging from
    // the far one, a glow that brightens towards us and flames licking out.
    //   H: { cx, cy, rx, ry (the pit's mouth), lip, hc (the curb's width and height), k (size),
    //        up: [angles of the upper teeth], low: [angles of the lower ones], inner: [[x, y]…] }
    // =========================================================================================
    function curb(g, H) {
        const { cx, cy, rx, ry, lip, hc } = H, ox = rx + lip, oy = ry + lip * 0.55;
        C.poly(g, [...ell(cx, cy + hc, ox, oy, 0, PI), ...ell(cx, cy, ox, oy, PI, TAU)], { fill: STONE, ink: K.ink, lw: 3.2 });
        g.beginPath();
        g.ellipse(cx, cy, ox, oy, 0, 0, TAU);
        g.ellipse(cx, cy, rx, ry, 0, 0, TAU);
        g.fillStyle = STONE_T;
        g.fill('evenodd');
        // the joints between its stones
        for (let i = 0; i < 20; i++) {
            const a = (i + 0.5) * (TAU / 20);
            C.poly(g, [[cx + Math.cos(a) * rx, cy + Math.sin(a) * ry], [cx + Math.cos(a) * ox, cy + Math.sin(a) * oy]], { ink: STONE_D, lw: 2.4, close: false });
            if (Math.sin(a) > 0.1) C.poly(g, [[cx + Math.cos(a) * ox, cy + Math.sin(a) * oy + 2], [cx + Math.cos(a) * ox, cy + Math.sin(a) * oy + hc - 2]], { ink: STONE_D, lw: 2.4, close: false });
        }
        for (const [ex, ey] of [[ox, oy], [rx, ry]]) {
            g.beginPath();
            g.ellipse(cx, cy, ex, ey, 0, 0, TAU);
            g.strokeStyle = K.ink;
            g.lineWidth = 3.2;
            g.stroke();
        }
    }

    function holeBack(g, t, H) {
        const { cx, cy, rx, ry, lip, hc, k } = H, d = C.drawing(t), fl = d % 2 ? 3 * k : 0;
        // scorched sand round it
        g.beginPath();
        g.ellipse(cx, cy + hc * 0.7, rx + lip + 22 * k, ry + lip * 0.55 + 13 * k, 0, 0, TAU);
        g.fillStyle = W.sandD;
        g.fill();
        curb(g, H);
        g.save();
        g.beginPath();
        g.ellipse(cx, cy, rx, ry, 0, 0, TAU);
        g.clip();
        g.fillStyle = STONE_D; // the curb's inner face
        g.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
        const band = (dy, col, ink) => {
            g.beginPath();
            g.ellipse(cx, cy + dy, rx, ry, 0, 0, TAU);
            g.fillStyle = col;
            g.fill();
            if (ink) {
                g.strokeStyle = K.ink;
                g.lineWidth = 3;
                g.stroke();
            }
        };
        band(hc, PIT, true);
        // the ramp runs on down the pit's wall
        if (H.inner) {
            C.poly(g, H.inner, { fill: ROAD_D, ink: K.ink, lw: 3.2 });
            const [a, b2, c, e] = H.inner, m0 = [(a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2], m1 = [(c[0] + e[0]) / 2, (c[1] + e[1]) / 2];
            C.poly(g, [[lerp(m0[0], m1[0], 0.12), lerp(m0[1], m1[1], 0.12)], [lerp(m0[0], m1[0], 0.42), lerp(m0[1], m1[1], 0.42)]], { ink: '#c9a416', lw: Math.max(5, 7 * k), close: false });
        }
        // the glow, brighter towards the near lip (we look deeper there)
        band(hc + ry * 0.66 + fl, '#a3141f');
        band(hc + ry * 1.02 - fl, K.red);
        band(hc + ry * 1.34 + fl, K.orange);
        band(hc + ry * 1.62 - fl * 0.5, K.yellow);
        // the upper teeth hang from the far lip
        for (const [a, sz] of H.up) {
            const da = 0.085 * sz, p = (aa) => [cx + Math.cos(aa) * rx, cy + hc + Math.sin(aa) * ry];
            const l = p(a - da), q = p(a + da), m = [(l[0] + q[0]) / 2, (l[1] + q[1]) / 2], tip = [m[0] - Math.cos(a) * 6 * k, m[1] + 34 * k * sz];
            C.poly(g, [l, q, tip], { fill: TOOTH, ink: K.ink, lw: 3 });
            C.poly(g, [m, q, tip], { fill: TOOTH_S, lw: 0 });
            C.poly(g, [l, q, tip], { ink: K.ink, lw: 3 });
        }
        g.restore();
        g.beginPath();
        g.ellipse(cx, cy, rx, ry, 0, 0, TAU);
        g.strokeStyle = K.ink;
        g.lineWidth = 3.2;
        g.stroke();
    }

    // Whatever is inside the pit shows only above the near lip: clip to everything except the
    // ground in front of the mouth (solid: and the ground on both sides of it, for a car that
    // is longer than the pit is wide).
    function clipPit(g, H, solid = false) {
        const p = new Path2D(), x0 = solid ? -100 : H.cx - H.rx, x1 = solid ? 1100 : H.cx + H.rx;
        p.rect(-100, -300, 1200, 1700);
        const arc = ell(H.cx, H.cy, H.rx, H.ry, PI, 0, 32);
        p.moveTo(arc[0][0], arc[0][1]);
        for (const [x, y] of arc.slice(1)) p.lineTo(x, y);
        p.lineTo(x1, H.cy);
        p.lineTo(x1, 1350);
        p.lineTo(x0, 1350);
        p.lineTo(x0, H.cy);
        p.closePath();
        g.clip(p, 'evenodd');
    }

    function flames(g, t, H, list, size = 1) {
        const d = C.drawing(t), P = S.pulseAt(t);
        g.save();
        clipPit(g, H);
        for (const [fx, fy, fs, sd] of list) Fx.flame(g, H.cx + fx * H.rx, H.cy + fy * H.ry, fs * H.k * size * (1 + 0.14 * P.pulse * ((sd + P.k) % 2 ? 1 : 0.4)), d, sd);
        g.restore();
    }
    const F_BACK = [[-0.52, 0.48, 84, 0], [0.04, 0.62, 112, 1], [0.6, 0.44, 88, 2]];
    const F_FRONT = [[-0.22, 0.84, 58, 2], [0.36, 0.8, 62, 0]];

    // The near half of the curb again, over whatever went in, and the lower teeth on it.
    function holeFront(g, t, H) {
        const { cx, cy, rx, ry, lip, hc, k } = H, ox = rx + lip, oy = ry + lip * 0.55;
        g.save();
        g.beginPath();
        g.rect(cx - ox - 30, cy, ox * 2 + 60, oy + hc + 40);
        g.clip();
        g.beginPath();
        g.rect(cx - ox - 40, cy - 10, ox * 2 + 80, oy + hc + 60);
        g.moveTo(cx + rx, cy);
        g.ellipse(cx, cy, rx, ry, 0, 0, TAU);
        g.clip('evenodd');
        curb(g, H);
        g.restore();
        const mx = rx + lip * 0.5, my = ry + lip * 0.3;
        H.low.map(([a, sz]) => [a, sz, cy + Math.sin(a) * my]).sort((p, q) => p[2] - q[2]).forEach(([a, sz]) => {
            const bx = cx + Math.cos(a) * mx, by = cy + Math.sin(a) * my, hw = 15 * k * sz, len = 40 * k * sz;
            const pts = [[bx - hw, by], [bx - Math.cos(a) * hw * 0.7, by - len], [bx + hw, by]];
            C.prism(g, pts, [7 * k, -4.6 * k], { front: TOOTH, top: TOOTH_T, side: TOOTH_S }, { lw: 3 });
            C.poly(g, [[bx - hw * 0.35, by - len * 0.2], [bx - Math.cos(a) * hw * 0.5 - hw * 0.1, by - len * 0.62]], { ink: TOOTH_S, lw: 2.2, close: false });
        });
    }

    // =========================================================================================
    // The signpost: a wooden post with two nails and two arrow boards that hang on them.
    // Units as the cast's (s = logical units per figure unit); the nails are 3.45 and 2.5 up.
    // =========================================================================================
    const NAIL_T = 3.45, NAIL_L = 2.5, POST_H = 3.9, LOW = 0.61; // LOW: the low board points 35° down
    function post(g, px, py, s) {
        g.fillStyle = SHADOW;
        g.beginPath();
        g.ellipse(px + 0.05 * s, py, 0.36 * s, 0.05 * s, 0, 0, TAU);
        g.fill();
        C.box(g, px - 0.07 * s, py - POST_H * s, 0.14 * s, POST_H * s, [D[0] * s, D[1] * s], { front: W.wood, top: '#a2613a', side: W.woodSide }, { lw: 3.2, depth: 0.14 });
        for (const [dx, y0, y1] of [[-0.025, 3.75, 3.1], [0.03, 2.2, 1.55], [-0.03, 1.2, 0.7], [0.025, 0.55, 0.3]]) C.poly(g, [[px + dx * s, py - y0 * s], [px + dx * s, py - y1 * s]], { ink: W.woodSide, lw: 2.2, close: false });
        // stones wedged at its foot
        World.rock(g, W, px - 0.2 * s, py + 0.03 * s, 0.3 * s);
        World.rock(g, W, px + 0.26 * s, py + 0.05 * s, 0.22 * s);
    }
    function nail(g, x, y, s) {
        const r = Math.max(3.4, 0.045 * s);
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        g.fillStyle = '#d5dbea';
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = Math.min(3.2, r * 0.7);
        g.stroke();
        g.fillStyle = '#ffffff';
        g.fillRect(x - r * 0.45, y - r * 0.5, r * 0.4, r * 0.4);
    }
    const BOARD = {
        HEAVEN: { front: '#fffdf4', top: '#ffffff', side: '#b7c4ea', line: K.sky, text: K.blue },
        HELL: { front: K.red, top: '#ff7a5c', side: '#a81c22', line: '#a81c22', text: K.yellow },
    };
    let CAP = 0; // Anton's cap height per em, measured once
    // An arrow board; (x, y) is its nail hole, `ang` the way it points (0 = to the right).
    function board(g, s, word, x, y, ang) {
        const col = BOARD[word], hh = 0.36 * s, x0 = -0.35 * s, x1 = 1.95 * s, x2 = 2.4 * s, m = 0.075 * s;
        const loc = [[x0, -hh], [x1, -hh], [x2, 0], [x1, hh], [x0, hh], [x0 + 0.17 * s, 0]];
        const pts = loc.map((p) => {
            const q = rot(p, ang);
            return [x + q[0], y + q[1]];
        });
        C.prism(g, pts, [D[0] * 0.08 * s, D[1] * 0.08 * s], col, { lw: 3.2 });
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        C.poly(g, [[x0 + m * 1.2, -hh + m], [x1 - m * 0.4, -hh + m], [x2 - m * 1.9, 0], [x1 - m * 0.4, hh - m], [x0 + m * 1.2, hh - m], [x0 + 0.17 * s + m * 1.3, 0]], { ink: col.line, lw: Math.max(2, 0.016 * s) });
        if (!CAP) {
            g.font = '100px "Anton"';
            CAP = g.measureText('H').actualBoundingBoxAscent / 100;
        }
        const cap = 0.44 * s;
        let fs = cap / CAP;
        g.font = `${fs}px "Anton"`;
        const wide = g.measureText('HEAVEN').width, room = 1.46 * s;
        const kx = Math.min(1, room / wide); // HEAVEN fills the board; HELL is spaced out to match
        g.font = `${fs}px "Anton"`;
        g.textAlign = 'left';
        g.textBaseline = 'alphabetic';
        g.fillStyle = col.text;
        const ws = [...word].map((ch) => g.measureText(ch).width * kx), nat = ws.reduce((a, w) => a + w, 0);
        const gap = word === 'HELL' ? (room * 0.78 - nat) / 3 : (wide * kx - nat) / 5;
        let cx = 1.1 * s - (nat + gap * (word.length - 1)) / 2;
        [...word].forEach((ch, i) => {
            g.save();
            g.translate(cx, cap / 2);
            g.scale(kx, 1);
            g.fillText(ch, 0, 0);
            g.restore();
            cx += ws[i] + gap;
        });
        g.restore();
    }
    const hit = (g, x, y, r, seed) => C.burst(g, x, y, { r0: r * 0.42, r1: r, n: 7, seed, fill: K.white, ink: K.ink, lw: 3 });

    // A saguaro too thin to hide anybody: a trunk and one small arm high up. (x, y) its foot.
    function saguaro(g, x, y, h) {
        const w = h * 0.125, Dd = [h * 0.028, -h * 0.019];
        const part = (px, py, pw, ph) => {
            g.lineWidth = 3;
            g.strokeStyle = K.ink;
            g.beginPath();
            g.roundRect(px + Dd[0], py + Dd[1], pw, ph, [pw / 2, pw / 2, 0, 0]);
            g.fillStyle = W.cactusSide;
            g.fill();
            g.stroke();
            g.beginPath();
            g.roundRect(px, py, pw, ph, [pw / 2, pw / 2, 0, 0]);
            g.fillStyle = W.cactus;
            g.fill();
            g.stroke();
            C.poly(g, [[px + pw * 0.35, py + pw * 0.4], [px + pw * 0.35, py + ph - 3]], { ink: W.cactusTop, lw: 2.2, close: false });
            C.poly(g, [[px + pw * 0.68, py + pw * 0.45], [px + pw * 0.68, py + ph - 3]], { ink: W.cactusSide, lw: 2.2, close: false });
        };
        g.fillStyle = SHADOW;
        g.beginPath();
        g.ellipse(x + 4, y, w * 1.3, 6, 0, 0, TAU);
        g.fill();
        const ax = x - w * 1.45;
        part(ax - w * 0.32, y - h * 0.985, w * 0.64, h * 0.14);
        C.poly(g, [[ax - w * 0.32, y - h * 0.86], [x, y - h * 0.86], [x, y - h * 0.795], [ax + w * 0.1, y - h * 0.795], [ax - w * 0.32, y - h * 0.825]], { fill: W.cactus, ink: K.ink, lw: 3 });
        part(x - w / 2, y - h, w, h);
        // a flower on its crown
        for (let i = 0; i < 5; i++) {
            const a = -PI / 2 + (i - 2) * 0.62;
            g.beginPath();
            g.ellipse(x + 1 + Math.cos(a) * 7, y - h - 2 + Math.sin(a) * 6, 5.2, 4.2, a, 0, TAU);
            g.fillStyle = K.pink;
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = 2.2;
            g.stroke();
        }
        g.beginPath();
        g.arc(x + 1, y - h - 1, 3.4, 0, TAU);
        g.fillStyle = K.yellow;
        g.fill();
        g.stroke();
    }

    // The Devil; off the ground he casts no shadow under his hooves.
    function devil(g, x, y, s, pose, air = false) {
        const keep = Devil.P.shadow;
        if (air) Devil.P.shadow = 'rgba(0,0,0,0)';
        Devil.draw(g, x, y, s, pose);
        Devil.P.shadow = keep;
    }
    // One of his mitts, laid on the edge of something he holds.
    function mitt(g, x, y, s) {
        const w = 0.2 * s, h = 0.19 * s;
        C.box(g, x - w / 2, y - h / 2, w, h, [D[0] * s, D[1] * s], { front: Devil.P.skin, top: Devil.P.skinTop, side: Devil.P.skinSide }, { lw: 3.2, depth: 0.16 });
    }

    // =========================================================================================
    // Bar 17 · the swap, a closer shot (no cars): figures at s = 165
    // =========================================================================================
    const S1 = 165, PX1 = 520, PY1 = 922, GY1 = 915, BX1 = PX1 - 1.25 * S1;
    const HOLE1 = {
        cx: 930, cy: 876, rx: 290, ry: 60, lip: 34, hc: 20, k: 1.55,
        up: [[3.36, 1], [3.6, 0.9], [4.76, 1.1], [4.98, 0.9]], low: [[1.2, 0.9], [1.45, 1], [1.7, 0.9], [1.95, 1.1], [2.2, 0.85], [2.45, 1], [2.7, 0.8], [2.92, 0.7]],
        inner: [[694, 850], [886, 832], [860, 990], [712, 990]],
    };
    const RAMP1 = { r1: 762, k: 62 / 122, L: [[600, 762], [668, 790], [700, 838]], R: [[792, 762], [850, 780], [880, 818]] };
    const SET1 = {
        hor: 640, r0: 700, r1: 762, seed: 170, sun: [806, 168, 62], clouds: [[236, 176, 66], [600, 262, 36]],
        mesas: [[-70, 300, 150, 40], [600, 330, 96, 36]], poles: [], dash0: 40, cracks: [[330, 18]], gap: [600, 792],
        verge(g) {
            World.cactus(g, W, 932, 694, 84, -1);
            World.rock(g, W, 96, 696, 46);
        },
    };

    function swap(g, t) {
        const s = S1, P = S.pulseAt(t), d = C.drawing(t), ph = P.k + P.since;
        const NT = [PX1, PY1 - NAIL_T * s], NL = [PX1, PY1 - NAIL_L * s];
        const e1 = n(0), e2 = n(1), e3 = n(2), e4 = n(3);
        const k1 = kOf(t, e1), k2 = kOf(t, e2), k3 = kOf(t, e3), k4 = kOf(t, e4);

        backdrop(g, t, SET1);
        ramp(g, RAMP1);
        holeBack(g, t, HOLE1);
        flames(g, t, HOLE1, [[-0.62, 0.4, 70, 0], [-0.34, 0.64, 96, 1], [-0.06, 0.72, 84, 2], [0.2, 0.5, 76, 0]]);
        holeFront(g, t, HOLE1);

        // --- where the two boards are: [x, y, ang], and who has HEAVEN
        const chest = [BX1 - 0.585 * s, GY1 - 0.46 * s];
        let hell, heaven, held = false;
        if (k1 <= 0) hell = [NL[0] + 0.03 * s, NL[1] - 0.09 * s, LOW - 0.13];
        else if (k1 === 1) hell = [PX1 + 0.5 * s, PY1 - 3.02 * s, 0.22];
        else if (k1 === 2) hell = [NT[0] + 0.05 * s, NT[1] - 0.05 * s, -0.15];
        else if (k1 === 3) hell = [NT[0], NT[1], 0.06];
        else hell = [NT[0], NT[1], 0];
        if (k1 < 2) heaven = [NT[0], NT[1], 0];
        else if (k1 === 2) heaven = [NT[0] - 1.2 * s, NT[1] - 0.5 * s, -0.2];
        else if (k1 === 3) heaven = [chest[0] - 0.02 * s, GY1 - 2.72 * s, -0.12];
        else if (k3 < -2) {
            held = true;
            heaven = [chest[0], chest[1] + (k2 === 0 ? 0.09 * s : 0), 0];
        } else if (k3 === -2) {
            held = true;
            heaven = [chest[0], chest[1] + 0.07 * s, 0];
        } else if (k3 === -1) heaven = [PX1 - 0.1 * s, PY1 - 2.02 * s, 0.46];
        else heaven = [NL[0], NL[1], LOW + (k3 === 0 ? 0.12 : k3 === 1 ? -0.05 : 0)];

        // --- the Devil: a hop and a slap on the first beat, the catch, a hop and a slap on the third, then he rubs his mitts
        const dx = BX1;
        let hopY = 0, pose;
        const tail = 0.05 * Math.sin(ph * PI);
        if (k1 === 0) {
            hopY = 0.7;
            pose = { mood: 'sly', look: 1, squash: -0.07, lean: 0.05, handL: [0.66, -1.54], handR: [-0.62, -0.5], tail: 0.1 };
        } else if (k1 === 1) {
            hopY = 0.38;
            pose = { mood: 'grin', look: 1, squash: -0.03, handL: [0.7, -1.5], handR: [-0.6, -0.56], tail: 0.08 };
        } else if (k1 === 2) pose = { mood: 'grin', look: 1, squash: 0.15, headTilt: -0.06, handL: [0.62, -0.74], handR: [-0.56, -0.6], tail };
        else if (k1 === 3) pose = { mood: 'grin', look: 0.6, squash: -0.05, headTilt: -0.05, handL: [0.78, -1.5], handR: [-0.46, -1.5], tail: 0.08 };
        else if (k3 < -2) pose = { mood: k2 < 2 ? 'grin' : 'sly', look: k2 < 2 ? 0.6 : 0, squash: k2 === 0 ? 0.1 : k2 === 1 ? 0.03 : 0.03 * P.pulse, headTilt: k2 < 2 ? 0 : 0.06, handL: [0.84, -0.8], handR: [-0.64, -0.8], tail };
        else if (k3 === -2) pose = { mood: 'sly', look: 1, squash: 0.16, handL: [0.84, -0.74], handR: [-0.64, -0.74], tail: -0.04 };
        else if (k3 === -1) {
            hopY = 0.36;
            pose = { mood: 'sly', look: 1, squash: -0.08, handL: [0.78, -1.3], handR: [-0.6, -0.62], tail: 0.06 };
        } else if (k3 === 0) {
            hopY = 0.7;
            pose = { mood: 'sly', look: 1, squash: -0.07, lean: 0.05, handL: [0.66, -1.54], handR: [-0.62, -0.5], tail: 0.1 };
        } else if (k3 === 1) {
            hopY = 0.38;
            pose = { mood: 'grin', look: 1, squash: -0.03, handL: [0.68, -1.2], handR: [-0.6, -0.56], tail: 0.08 };
        } else if (k4 < 0) pose = { mood: 'grin', look: 1, squash: k3 === 2 ? 0.15 : 0.04, headTilt: -0.05, handL: [0.56, -0.62], handR: [-0.56, -0.62], tail };
        else {
            // he rubs his mitts, one over the other, on twos
            const a = k4 % 2 ? 1 : -1;
            pose = { mood: 'sly', look: 0.5, squash: 0.05 + 0.02 * a, headTilt: 0.07, handL: [0.13, -0.6 - 0.05 * a], handR: [-0.1, -0.62 + 0.05 * a], tail: 0.09 * Math.sin(k4 * 2.1) };
        }
        // his trident waits in the sand while he works
        g.save();
        g.translate(132, GY1 + 8);
        g.scale(s, s);
        Devil.trident(g, 0, -0.74, 3.2 / s, { ang: -0.03 });
        g.restore();
        C.poly(g, C.curve([[108, GY1 + 12], [116, GY1 + 1], [132, GY1 - 4], [148, GY1 + 2], [158, GY1 + 12]], false, 5), { fill: W.sand, ink: K.ink, lw: 3 });
        C.poly(g, [[122, GY1 + 6], [140, GY1 + 6]], { ink: W.sandD, lw: 3, close: false });
        if (hopY > 0) {
            g.fillStyle = SHADOW;
            g.beginPath();
            g.ellipse(dx + 0.06 * s, GY1, 0.6 * s * (1 - hopY * 0.45), 0.065 * s * (1 - hopY * 0.3), 0, 0, TAU);
            g.fill();
        }
        devil(g, dx, GY1 - hopY * s, s, pose, hopY > 0);

        // --- the post, its nails, the boards
        post(g, PX1, PY1, s);
        nail(g, NT[0], NT[1], s);
        nail(g, NL[0], NL[1], s);
        const onPost = (bd, N) => Math.hypot(bd[0] - N[0], bd[1] - N[1]) < 0.02 * s;
        const draw = (word, bd) => {
            board(g, s, word, bd[0], bd[1], bd[2]);
            for (const N of [NT, NL]) if (onPost(bd, N)) nail(g, N[0], N[1], s);
        };
        if (k1 < 2) {
            draw('HEAVEN', heaven);
            draw('HELL', hell);
        } else {
            draw('HELL', hell);
            draw('HEAVEN', heaven);
        }
        if (held) {
            mitt(g, dx - 0.66 * s, heaven[1] - 0.37 * s, s);
            mitt(g, dx + 0.9 * s, heaven[1] - 0.37 * s, s);
        }
        // the hits, and a twinkle on each board once both hang in their new places
        if (k1 === 0) hit(g, NL[0] - 0.5 * s, NL[1] + 0.12 * s, 46, 'v1b-a');
        if (k1 === 2) hit(g, NT[0] + 0.02 * s, NT[1] - 0.02 * s, 60, 'v1b-b');
        if (k3 === 0) hit(g, NL[0] - 0.5 * s, NL[1] + 0.12 * s, 56, 'v1b-d');
        for (const [at, x, y] of [[e4, NT[0] - 0.3 * s, NT[1] - 0.56 * s], [e4 + 2 / 24, NL[0] + 1.9 * s, NL[1] + 0.56 * s]]) {
            const tw = bump(t, at, 0.34);
            if (tw > 0.01 && t >= at - 1e-6) C.sparkle(g, x, y, 18 + 46 * tw, { color: K.white, ink: K.ink, lw: 3 });
        }
    }

    // =========================================================================================
    // Bars 18–19 · the fork, a wide shot at the cars' scale
    // =========================================================================================
    const SC = Rig.CAR, HOR = 345, R0 = 477, R1 = 599, LANE = 560;
    const CACT = [104, 852], OUT = [222, 850], PX2 = 320, PY2 = 895;
    const HOLE2 = {
        cx: 705, cy: 846, rx: 185, ry: 56, lip: 20, hc: 12, k: 1,
        up: [[3.42, 0.9], [3.72, 1.1], [4.02, 0.9], [4.3, 1], [5.56, 1], [5.86, 0.9]],
        low: [[0.34, 0.8], [0.64, 1], [0.94, 0.85], [1.24, 1.1], [1.56, 0.9], [1.88, 1.1], [2.2, 0.85], [2.5, 1], [2.8, 0.8]],
        inner: [[664, 800], [826, 806], [800, 960], [694, 960]],
    };
    const RAMP2 = { r1: R1, k: 1, L: [[480, 599], [612, 660], [668, 742], [676, 806]], R: [[700, 599], [776, 640], [812, 716], [820, 812]] };
    const SET2 = {
        hor: HOR, r0: R0, r1: R1, seed: 40, sun: [836, 132, 56], clouds: [[250, 110, 60], [655, 150, 36]],
        mesas: [[-80, 310, 150, 40], [372, 140, 196, 32], [640, 330, 92, 38]], poles: [236, 666], dash0: -40, cracks: [[150, 56], [820, 24]], gap: [480, 700],
        verge(g, py) {
            World.cactus(g, W, 70, HOR + 70, 104, 1);
            World.rock(g, W, 560, HOR + 86, 56);
            World.bush(g, W, 912, HOR + 92, 34);
            World.skull(g, W, 430, HOR + 104, 36);
            for (const x of this.poles) World.pole(g, W, x, py);
        },
    };
    // the hearse: in from the left, a stop at the sign, then down the ramp and into the pit
    const tBurst = n(11), tIn = n(7), tStop = n(8), tRead = n(8.25), tSalute = n(9), tV = n(9.25), tE = tBurst - 2 / 24;
    // down the ramp its rear wheels keep to the road while the nose goes over the lip:
    // [u, the rear wheels' contact x, y (below the lane), the angle the nose has dropped]
    const REAR = 2.5 * SC, HK = [[0, 130, 0, 0], [0.25, 215, 0, 0.14], [0.45, 300, 2, 0.5], [0.62, 420, 12, 0.9], [0.8, 600, 65, 1.22], [0.9, 700, 200, 1.3], [1, 745, 620, 1.35]];
    const diveU = (t) => {
        const u = E.seg(t, tV, tE);
        return u < 0.25 ? 0.25 * Math.pow(u / 0.25, 1.6) : u;
    };
    // where the hearse is: [x, y] the ground under its middle, and its angle
    function hearsePos(t) {
        if (t < tV) return [lerp(-300, 340, E.out(E.seg(t, tIn, tStop))), LANE, 0];
        const u = diveU(t);
        let i = 0;
        while (i < HK.length - 2 && u > HK[i + 1][0]) i++;
        const a = HK[i], c = HK[i + 1], v = (u - a[0]) / (c[0] - a[0]), ang = lerp(a[3], c[3], v);
        return [lerp(a[1], c[1], v) + REAR * Math.cos(ang), LANE + lerp(a[2], c[2], v) + REAR * Math.sin(ang), ang];
    }
    const SEAT = Rig.seat('hearse', 'devil', 0, 0, SC);
    const seatAt = (t) => {
        const [x, y, a] = hearsePos(t), q = rot(SEAT, a);
        return [x + q[0], y + q[1]];
    };
    // the hearse, turned by `a` about the ground under its middle; riders as given
    function hearse(g, t, x, y, a, o) {
        g.save();
        if (a > 0.02) clipPit(g, HOLE2, true);
        g.translate(x, y);
        g.rotate(a);
        if (a > 0.02) {
            // off the level it casts no shadow on the road: keep the car, drop the strip under it
            const p = new Path2D(), u = SC;
            p.rect(-6 * u, -6 * u, 12 * u, 5.69 * u);
            for (const [wx, wy, wr] of [[-2.584, -0.524, 0.6], [-2.044, -0.884, 0.6], [3.016, -0.344, 0.42], [3.556, -0.704, 0.42]]) {
                p.moveTo(wx * u + wr * u, wy * u);
                p.arc(wx * u, wy * u, wr * u, 0, TAU);
            }
            g.clip(p);
        }
        Rides.hearse(g, 0, 0, SC, { spin: o.spin, bounce: o.bounce, lean: 0, flames: o.flames, t }, (g2, seats, sc0) => {
            if (o.devil) {
                Rides.at(g2, sc0, seats.devil, (px, py, sc) => {
                    g2.save();
                    g2.translate(px, py);
                    g2.rotate(-a * 0.8);
                    Devil.draw(g2, 0, 0, sc, o.devil);
                    g2.restore();
                });
            }
            Rides.at(g2, sc0, seats.chauffeur, (px, py, sc) => Rides.skeleton(g2, px, py, sc, { shadow: false, ...o.skel }));
        });
        g.restore();
    }

    function fork(g, t) {
        const P = S.pulseAt(t), d = C.drawing(t), ph = P.k + P.since, H = HOLE2;
        const NT = [PX2, PY2 - NAIL_T * SC], NL = [PX2, PY2 - NAIL_L * SC];
        backdrop(g, t, SET2);
        // things on the near sand
        World.rock(g, W, 944, 742, 54);
        World.skull(g, W, 236, 938, 34);
        ramp(g, RAMP2);
        holeBack(g, t, H);

        // --- the band's car: straight on, nobody looks
        const bx = -380 + 1300 * (t - T1);
        if (bx < 1500) Rig.band(g, t, bx, LANE, SC, { spin: bx / (0.42 * SC), bounce: 0.3 * P.pulse, exhaust: 0.5, sing: true });

        // --- the Devil's clocks
        const tPeek = n(4.75), tShock = n(6.25), tPoint = n(7), tCrouch = n(7.25), tLeap = n(7.5), tLand = tLeap + 3 / 12;
        const tOops = n(9.5), tHang = tBurst - 4 / 12;
        const aboard = t >= tLand - 1e-6 && t < tHang - 1e-6;

        // --- the hearse
        const [hx, hy, ha] = hearsePos(t), diving = t >= tV - 1e-6;
        const eruptK = pop(t, tBurst, 0.25);
        flames(g, t, H, F_BACK, 1 + 0.5 * E.seg(t, tV, tE));
        if (t >= tIn - 1e-6 && t < tBurst - 1e-6) {
            const look = seg(t, tRead, tRead + 2 / 12) * (1 - seg(t, tSalute, tSalute + 2 / 12)), sal = t >= tSalute - 1e-6 && t < tSalute + 5 / 24 - 1e-6;
            const travelled = t < tV ? hx : 340 + 900 * diveU(t);
            hearse(g, t, hx, hy, ha, {
                spin: travelled / (0.4 * SC), flames: diving ? 1 : 0.4,
                bounce: 0.6 * bump(t, tStop - 0.2, 0.3) + (aboard ? 0.5 * bump(t, tLand, 0.25) : 0) + 0.35 * bump(t, tSalute, 0.2),
                skel: { headDy: 0.02 * P.pulse + 0.035 * look, headTilt: 0.2 * look, hands: sal ? { r: [-0.46, -1.6 - 0.04 * bump(t, tSalute, 0.17)] } : undefined },
                devil: aboard ? (t < tOops - 1e-6
                    ? { mood: 'grin', look: 1, trident: { ang: -0.04 }, handR: [-0.78, -0.74], handL: [0.86, -1.0 + (d % 2 ? 0.05 : 0)], squash: 0.04 * P.pulse + 0.16 * bump(t, tLand, 0.25), tail: 0.05 * Math.sin(ph * PI) }
                    : { mood: 'shock', look: 1, trident: { ang: d % 2 ? 0.06 : -0.06 }, handR: [-0.74, -1.18], handL: [0.74, -1.16], squash: -0.14 * bump(t, tOops, 0.25) - 0.03, tail: d % 2 ? 0.12 : 0.04 }) : false,
            });
        }
        // he is left in the air over the pit for two drawings, then follows the hearse down
        if (t >= tHang - 1e-6 && t < tBurst - 1e-6) {
            const p0 = seatAt(tHang), kh = kOf(t, tHang);
            const at = [[p0[0] + 22, p0[1] - 14], [p0[0] + 44, p0[1] - 8], [p0[0] + 66, p0[1] + 170], [p0[0] + 80, p0[1] + 440]][Math.min(3, kh)];
            g.save();
            clipPit(g, H);
            devil(g, at[0], at[1], SC, {
                mood: 'shock', look: kh === 0 ? 1 : 0, headDy: kh === 1 ? 0.05 : 0, squash: kh < 2 ? -0.08 : -0.2, step: kh % 2 ? 1 : -1, tail: kh < 2 ? 0.12 : 0.2,
                trident: { ang: kh < 2 ? 0 : -0.12 }, handR: [-0.74, kh < 2 ? -1.2 : -1.4], handL: [0.74, kh < 2 ? -1.16 : -1.4],
            }, true);
            g.restore();
        }
        flames(g, t, H, F_FRONT, 1 + 0.5 * E.seg(t, tV, tE));
        // the burst of flame on the last beat
        if (eruptK > 0) {
            const k = eruptK * (1 - 0.12 * seg(t, tBurst + 3 / 12, T2)), cy = H.cy - 150 * k;
            g.save();
            clipPit(g, H);
            C.burst(g, H.cx, cy, { r0: 150 * k, r1: 262 * k, n: 13, seed: 'v1b-poof', fill: K.red, ink: K.ink, lw: 5, rot: d % 2 ? 0.05 : 0 });
            C.burst(g, H.cx, cy, { r0: 110 * k, r1: 196 * k, n: 13, seed: 'v1b-poof2', fill: K.orange, lw: 0, rot: d % 2 ? 0.05 : 0 });
            C.burst(g, H.cx, cy, { r0: 74 * k, r1: 136 * k, n: 11, seed: 'v1b-poof3', fill: K.yellow, lw: 0 });
            for (const [fx, fy, fs, sd] of [[-0.7, 0.36, 150, 0], [0.74, 0.34, 140, 2], [-0.36, 0.66, 230, 1], [0.34, 0.68, 210, 0], [0, 0.82, 170, 2]]) Fx.flame(g, H.cx + fx * H.rx, H.cy + fy * H.ry, fs * k, d, sd);
            g.restore();
        }
        holeFront(g, t, H);

        // --- the Devil on foot: behind the saguaro, peeking, then out in the open
        if (t < tLand - 1e-6) {
            const home = [CACT[0] + 8, CACT[1] - 6];
            let at = home, pose, air = false;
            if (t < tShock - 1e-6) {
                const pk = E.out(seg(t, tPeek, tPeek + 2 / 12)), glee = pk > 0.5;
                pose = {
                    mood: glee ? 'grin' : 'sly', look: Math.max(-1, Math.min(1, (bx - 140) / 300)), lean: 0.32 * pk, squash: 0.05 * P.pulse + 0.16 * bump(t, T1, 0.25),
                    tail: 0.1 * Math.sin(ph * TAU), trident: { ang: -0.3 * pk }, handR: [-0.66 + 0.06 * pk, -0.5 - 0.14 * pk], handL: glee ? [0.52, -0.92 - 0.14 * P.pulse] : [0.3, -0.6],
                };
            } else if (t < tCrouch - 1e-6) {
                // they are not turning: out he comes, jaw on the floor, and points at the sign
                const u = seg(t, tShock, tShock + 3 / 12), pt = t >= tPoint - 1e-6;
                at = [lerp(home[0], OUT[0], E.out(u)), lerp(home[1], OUT[1], u) - Math.sin(u * PI) * 30];
                air = u > 0 && u < 1;
                pose = {
                    mood: 'shock', look: 1, squash: -0.12 * bump(t, tShock, 0.25) + 0.12 * bump(t, tShock + 3 / 12, 0.2), tail: -0.08, headTilt: pt ? 0.05 : 0,
                    trident: { ang: -0.06 }, handR: [-0.72, -0.62], handL: pt ? [0.86, -1.12 + (kOf(t, tPoint) % 2 ? 0.07 : 0)] : [0.58, -0.4],
                };
            } else if (t < tLeap - 1e-6) {
                at = OUT;
                pose = { mood: 'angry', look: -1, squash: 0.22, tail: 0.1, trident: { ang: -0.06 }, handR: [-0.72, -0.62], handL: [0.5, -0.42] };
            } else {
                const u = seg(t, tLeap, tLand), q = seatAt(tLand);
                at = [lerp(OUT[0], q[0], u), lerp(OUT[1], q[1], u) - Math.sin(u * PI) * 200];
                air = true;
                pose = { mood: 'grin', look: 1, squash: -0.16, tail: 0.16, trident: { ang: 0.2 }, handR: [-0.7, -0.9], handL: [0.66, -0.9], step: 1 };
            }
            if (air) saguaro(g, CACT[0], CACT[1], 250);
            devil(g, at[0], at[1], SC, pose, air);
            if (!air) saguaro(g, CACT[0], CACT[1], 250);
        } else saguaro(g, CACT[0], CACT[1], 250);

        // --- the signpost, as he left it; the burst knocks HEAVEN loose and it swings on its nail
        post(g, PX2, PY2, SC);
        board(g, SC, 'HELL', NT[0], NT[1], 0);
        nail(g, NT[0], NT[1], SC);
        let la = LOW;
        if (t >= tBurst - 1e-6) {
            const tau = twos(t, tBurst) - tBurst + 1 / 12;
            la = PI / 2 - (PI / 2 - LOW) * Math.exp(-5 * tau) * Math.cos(13 * tau);
        }
        board(g, SC, 'HEAVEN', NL[0], NL[1], la);
        nail(g, NL[0], NL[1], SC);
        // the chauffeur reads it: a twinkle on the board he believes
        const tw = bump(t, tRead + 2 / 12, 0.34);
        if (tw > 0.01 && t >= tRead + 2 / 12 - 1e-6) C.sparkle(g, NL[0] + 2.1 * SC, NL[1] + 0.62 * SC, 14 + 40 * tw, { color: K.white, ink: K.ink, lw: 3 });
    }

    Seg.verse1b = {
        shots: [[T0, T1, 'Swap'], [T1, T2, 'Fork']],
        draw(g, t, env) {
            if (t < T1 - 1e-6) swap(g, t);
            else fork(g, t);
        },
        post() {
            return {};
        },
    };
})();
