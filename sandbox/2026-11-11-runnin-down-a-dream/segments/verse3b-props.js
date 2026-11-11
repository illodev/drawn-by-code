// Props and sets of verse 3's last block (segments/verse3b.js): the run of roadside billboards
// and their pictures, the headlights' beams, the trap site at night (its own scrolling ground:
// the relaid highway as a ribbon with thickness, the bare bed it left), Hell's mouth in the
// mesa (a stone head in profile whose upper jaw is the mesa's lid), its tongue, the EXIT sign,
// the lever, mallets, cones, the barrier, the blueprint on its easel, and the Devil with a
// cold (a scarf and a sore nose over his own drawing).
//
// Units: «wu» are logical units at the cars' scale (Rig.CAR = 84 per figure unit); the site
// is laid out along x with Hell's lips at x = 0, and a shot looks at it through a camera
// { L (the wu at the frame's left edge), z (zoom), oy }. Depth recedes up and to the right
// with the kit's slope (1.5 across for 1 up).
// Global: Verse3bProps. Depends on Cereal, Song, Cast, Devil, World, Fx.
const Verse3bProps = (() => {
    const C = Cereal, K = C.COL, E = Ease, S = Song, TAU = Math.PI * 2, PI = Math.PI;
    const W = World.THEMES.night, D = Cast.D;
    const lerp = (a, b, u) => a + (b - a) * u;
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const smooth = (u) => {
        const v = clamp(u);
        return v * v * (3 - 2 * v);
    };
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const cw = (pts) => {
        let a = 0;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i], q = pts[(i + 1) % pts.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return a > 0 ? pts : pts.slice().reverse();
    };
    const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    const mix = (a, b, k) => {
        const A = hex(a), B = hex(b);
        return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
    };
    const line = (g, pts, lw, ink = K.ink) => C.poly(g, pts, { ink, lw, close: false });
    // a thick line in a colour with the outline round it
    const tube = (g, pts, w, col, L, close = false) => {
        C.poly(g, pts, { ink: K.ink, lw: w + 2 * L, close });
        C.poly(g, pts, { ink: col, lw: w, close });
    };
    const dot = (g, x, y, r, fill, lw = 0, ink = K.ink) => {
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        if (fill) {
            g.fillStyle = fill;
            g.fill();
        }
        if (lw > 0) {
            g.strokeStyle = ink;
            g.lineWidth = lw;
            g.stroke();
        }
    };
    const SHADOW = 'rgba(13,11,38,0.34)';
    // Scalloped puffs (dust, smoke), as in rides.js: outlines of the whole group, then the fills.
    function puffs(g, list, fill, lw, ink = K.ink) {
        const parts = [];
        for (const [x, y, r, n, a0] of list) {
            if (!(r > lw)) continue;
            parts.push([x, y, r * 0.74]);
            for (let i = 0; i < n; i++) {
                const a = a0 + (i / n) * TAU;
                parts.push([x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.4]);
            }
        }
        g.strokeStyle = ink;
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
    // the star of a hit
    const hit = (g, x, y, r, seed, fill = K.white) => C.burst(g, x, y, { r0: r * 0.42, r1: r, n: 7, seed, fill, ink: K.ink, lw: 3 });
    // A band of even width along a centreline, striped across: scarves.
    function band(g, pts, w, col, stripe, L, o = {}) {
        const n = pts.length, A = [], B = [];
        pts.forEach(([x, y], i) => {
            const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
            A.push([x - (dy / l) * w, y + (dx / l) * w]);
            B.push([x + (dy / l) * w, y - (dx / l) * w]);
        });
        const shape = [...A, ...B.slice().reverse()];
        C.poly(g, shape, { fill: col, lw: 0 });
        const every = o.every ?? 4;
        for (let i = 1; i + 1 < n; i += every) {
            const j = Math.min(n - 1, i + Math.max(1, every >> 1));
            C.poly(g, [A[i], A[j], B[j], B[i]], { fill: stripe, lw: 0 });
        }
        C.poly(g, shape, { ink: K.ink, lw: L });
        if (o.fringe) {
            const e = pts[n - 1], p = pts[n - 2], ux = e[0] - p[0], uy = e[1] - p[1], ul = Math.hypot(ux, uy) || 1, f = o.fringe;
            for (const k of [-0.7, 0, 0.7]) line(g, [[e[0] - (uy / ul) * w * k, e[1] + (ux / ul) * w * k], [e[0] - (uy / ul) * w * k + (ux / ul) * f, e[1] + (ux / ul) * w * k + (uy / ul) * f]], L * 0.8);
        }
    }

    // =========================================================================================
    // Billboards
    // =========================================================================================
    const NIGHT = '#17134a';
    const WOOD = '#8a5a2e', WOOD_T = '#b9814a', WOOD_S = '#5e3b1c';
    let CAP = 0; // Anton's cap height per em
    const capOf = (g) => {
        if (!CAP) {
            g.font = '100px "Anton"';
            CAP = g.measureText('H').actualBoundingBoxAscent / 100;
        }
        return CAP;
    };

    /**
     * An arrow cut out of board with a row of bulbs along its shaft, the kind that hangs under
     * every billboard. (x, y): its middle; s: its length; o: { ang (0 points right), on, t, c (a
     * colour filter, see billboard) }
     */
    function arrowPlank(g, x, y, s, o = {}) {
        const c = o.c ?? ((col) => col), on = o.on !== false, L = o.lw ?? 3;
        const hw = s / 2, hh = s * 0.07, hd = s * 0.15, nk = hw - s * 0.27;
        const loc = [[-hw, -hh], [nk, -hh], [nk, -hd], [hw, 0], [nk, hd], [nk, hh], [-hw, hh]];
        const at = (p) => {
            const q = rot(p, o.ang ?? 0);
            return [x + q[0], y + q[1]];
        };
        C.prism(g, cw(loc.map(at)), [s * 0.024, -s * 0.016], { front: c(K.yellow), top: c('#fff59a'), side: c('#e0a800') }, { lw: L });
        line(g, [at([-hw + s * 0.03, hh - s * 0.02]), at([nk - s * 0.02, hh - s * 0.02])], Math.max(1.6, s * 0.011), c('#e0a800'));
        const step = Math.floor(C.drawing(o.t ?? 0) / 2), n = 6;
        for (let i = 0; i < n; i++) {
            const p = at([-hw + s * 0.07 + (i * (nk + hw - s * 0.1)) / (n - 1), 0]);
            const lit = on && ((i - step) % 3 + 3) % 3 === 0;
            dot(g, p[0], p[1], Math.max(2.4, s * 0.021), on ? (lit ? '#fffdf4' : K.orange) : c('#b98a55'), Math.max(1.2, L * 0.55));
        }
    }

    // --- the pictures, painted flat on a field: (x, y, w, h) is the panel -------------------
    const PICS = {
        // a steaming pie on a plate
        pie(g, x, y, w, h, c, t) {
            const cx = x + w * 0.5, by = y + h * 0.78, d = C.drawing(t);
            C.poly(g, C.ellipsePts(cx, by + h * 0.03, w * 0.36, h * 0.075, 28), { fill: c('#fffdf4'), ink: K.ink, lw: 2.6 });
            // the tin and the crust's rim
            C.poly(g, [[cx - w * 0.27, by - h * 0.2], [cx + w * 0.27, by - h * 0.2], [cx + w * 0.21, by], [cx - w * 0.21, by]], { fill: c('#c9cfe2'), ink: K.ink, lw: 2.6 });
            for (const k of [-0.5, 0, 0.5]) line(g, [[cx + k * w * 0.36, by - h * 0.17], [cx + k * w * 0.3, by - h * 0.03]], 2, c('#8d95ad'));
            const dome = C.curve([[cx - w * 0.29, by - h * 0.2], [cx - w * 0.2, by - h * 0.37], [cx, by - h * 0.43], [cx + w * 0.2, by - h * 0.37], [cx + w * 0.29, by - h * 0.2]], false, 6);
            C.poly(g, dome, { fill: c('#ffb22c'), ink: K.ink, lw: 2.6 });
            // slits in the crust, the filling showing, and a scalloped edge
            for (const k of [-1, 0, 1]) C.poly(g, [[cx + k * w * 0.1 - w * 0.02, by - h * 0.29], [cx + k * w * 0.1 + w * 0.02, by - h * 0.36 + Math.abs(k) * h * 0.02]], { ink: c(K.red), lw: 4, close: false });
            for (let i = 0; i < 7; i++) dot(g, cx - w * 0.27 + (i * w * 0.54) / 6, by - h * 0.2, w * 0.035, c('#f3d9a4'), 2.2);
            // steam: three wisps that change on twos
            for (const k of [-1, 0, 1]) {
                const sx = cx + k * w * 0.13, f = (d + k + 3) % 2 ? 1 : -1, y0 = by - h * 0.48;
                line(g, C.curve([[sx, y0], [sx + f * w * 0.035, y0 - h * 0.08], [sx - f * w * 0.035, y0 - h * 0.17], [sx + f * w * 0.02, y0 - h * 0.25 - (k === 0 ? h * 0.05 : 0)]], false, 5), 5.5);
                line(g, C.curve([[sx, y0], [sx + f * w * 0.035, y0 - h * 0.08], [sx - f * w * 0.035, y0 - h * 0.17], [sx + f * w * 0.02, y0 - h * 0.25 - (k === 0 ? h * 0.05 : 0)]], false, 5), 2.6, c('#fffdf4'));
            }
        },
        // a soft bed: a headboard, a plump pillow, a quilt, a moon over it
        bed(g, x, y, w, h, c) {
            const x0 = x + w * 0.14, x1 = x + w * 0.86, fy = y + h * 0.86, my = y + h * 0.56;
            for (const lx of [x0 + w * 0.02, x1 - w * 0.05]) C.poly(g, [[lx, fy - h * 0.1], [lx + w * 0.03, fy - h * 0.1], [lx + w * 0.03, fy], [lx, fy]], { fill: c(WOOD_S), ink: K.ink, lw: 2.4 });
            // headboard (left) and footboard
            g.beginPath();
            g.roundRect(x0 - w * 0.03, y + h * 0.24, w * 0.07, h * 0.56, [w * 0.035, w * 0.035, 0, 0]);
            g.fillStyle = c(WOOD);
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = 2.6;
            g.stroke();
            g.beginPath();
            g.roundRect(x1 - w * 0.03, my - h * 0.06, w * 0.06, h * 0.3 + h * 0.06, [w * 0.03, w * 0.03, 0, 0]);
            g.fillStyle = c(WOOD);
            g.fill();
            g.stroke();
            // mattress, quilt with a turned-down sheet, pillow
            C.poly(g, [[x0 + w * 0.03, my + h * 0.06], [x1 - w * 0.02, my + h * 0.06], [x1 - w * 0.02, fy - h * 0.08], [x0 + w * 0.03, fy - h * 0.08]], { fill: c('#fffdf4'), ink: K.ink, lw: 2.6 });
            const quilt = C.curve([[x0 + w * 0.27, my + h * 0.03], [x0 + w * 0.42, my - h * 0.07], [x0 + w * 0.58, my - h * 0.05], [x1 - w * 0.03, my + h * 0.02]], false, 6);
            C.poly(g, [...quilt, [x1 - w * 0.03, fy - h * 0.13], [x0 + w * 0.27, fy - h * 0.13]], { fill: c(K.pink), ink: K.ink, lw: 2.6 });
            for (const k of [0.2, 0.42, 0.64, 0.86]) {
                const qx = lerp(x0 + w * 0.27, x1 - w * 0.03, k);
                dot(g, qx, my + h * 0.11, w * 0.014, c('#fffdf4'), 0);
                dot(g, qx - w * 0.055, my + h * 0.2, w * 0.014, c('#fffdf4'), 0);
            }
            C.poly(g, [[x0 + w * 0.2, my + h * 0.03], [x0 + w * 0.29, my + h * 0.01], [x0 + w * 0.29, my + h * 0.12], [x0 + w * 0.2, my + h * 0.12]], { fill: c('#fffdf4'), ink: K.ink, lw: 2.4 });
            g.beginPath();
            g.roundRect(x0 + w * 0.045, my - h * 0.09, w * 0.2, h * 0.16, h * 0.07);
            g.fillStyle = c('#fffdf4');
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = 2.6;
            g.stroke();
            line(g, [[x0 + w * 0.09, my - h * 0.02], [x0 + w * 0.19, my - h * 0.02]], 2, c('#c9cde0'));
            // a crescent and two stars
            const mx = x + w * 0.72, mY = y + h * 0.26, mr = h * 0.12;
            g.save();
            g.beginPath();
            g.arc(mx, mY, mr, 0, TAU);
            g.arc(mx + mr * 0.5, mY - mr * 0.25, mr * 0.86, 0, TAU, true);
            g.fillStyle = c(K.yellow);
            g.fill('evenodd');
            g.restore();
            C.sparkle(g, x + w * 0.5, y + h * 0.2, h * 0.06, { color: c('#fffdf4') });
            C.sparkle(g, x + w * 0.88, y + h * 0.4, h * 0.045, { color: c('#fffdf4') });
        },
        // a pot of gold under a rainbow
        gold(g, x, y, w, h, c, t) {
            const cx = x + w * 0.5, by = y + h * 0.84, d = C.drawing(t);
            g.save();
            g.beginPath();
            g.rect(x, y, w, h);
            g.clip();
            [[K.pink, 0.5], [K.yellow, 0.42], [K.aqua, 0.34]].forEach(([col, r]) => {
                g.beginPath();
                g.arc(cx + w * 0.34, by + h * 0.1, w * r * 1.25, PI, PI * 1.5);
                g.strokeStyle = K.ink;
                g.lineWidth = w * 0.085 + 4;
                if (r === 0.5) g.stroke();
                g.strokeStyle = c(col);
                g.lineWidth = w * 0.085;
                g.stroke();
            });
            g.restore();
            // the coins heaped over the rim
            for (const [dx, dy] of [[-0.13, -0.5], [0.12, -0.5], [0, -0.57], [-0.06, -0.47], [0.06, -0.46], [-0.19, -0.44], [0.19, -0.44]]) {
                C.poly(g, C.ellipsePts(cx + dx * w, by + dy * h, w * 0.06, h * 0.05, 14), { fill: c(K.yellow), ink: K.ink, lw: 2.2 });
                line(g, [[cx + dx * w - w * 0.025, by + dy * h], [cx + dx * w + w * 0.025, by + dy * h]], 1.8, c('#e0a800'));
            }
            // the pot: a belly, a rim, three feet
            for (const k of [-1, 1]) C.poly(g, [[cx + k * w * 0.13, by - h * 0.04], [cx + k * w * 0.19, by + h * 0.04], [cx + k * w * 0.1, by]], { fill: c('#2a2438'), ink: K.ink, lw: 2.4 });
            const belly = C.curve([[cx - w * 0.21, by - h * 0.4], [cx - w * 0.27, by - h * 0.2], [cx - w * 0.17, by - h * 0.01], [cx + w * 0.17, by - h * 0.01], [cx + w * 0.27, by - h * 0.2], [cx + w * 0.21, by - h * 0.4]], false, 6);
            C.poly(g, belly, { fill: c('#3d3652'), ink: K.ink, lw: 2.6 });
            line(g, C.curve([[cx - w * 0.19, by - h * 0.3], [cx - w * 0.21, by - h * 0.18], [cx - w * 0.15, by - h * 0.08]], false, 5), 3, c('#6c66a0'));
            g.beginPath();
            g.roundRect(cx - w * 0.25, by - h * 0.45, w * 0.5, h * 0.075, h * 0.03);
            g.fillStyle = c('#565082');
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = 2.6;
            g.stroke();
            C.sparkle(g, cx - w * 0.2, by - h * 0.62, h * (d % 4 < 2 ? 0.09 : 0.06), { color: c('#fffdf4'), ink: K.ink, lw: 2 });
            C.sparkle(g, cx + w * 0.05, by - h * 0.7, h * (d % 4 < 2 ? 0.05 : 0.08), { color: c('#fffdf4'), ink: K.ink, lw: 2 });
        },
        // a trophy: a gold cup with two handles on a plinth
        trophy(g, x, y, w, h, c, t) {
            const cx = x + w * 0.5, by = y + h * 0.88, d = C.drawing(t), G = c(K.gold), GD = c('#e0a800');
            C.poly(g, [[cx - w * 0.15, by - h * 0.12], [cx + w * 0.15, by - h * 0.12], [cx + w * 0.17, by], [cx - w * 0.17, by]], { fill: c('#3d3652'), ink: K.ink, lw: 2.6 });
            C.poly(g, [[cx - w * 0.07, by - h * 0.085], [cx + w * 0.07, by - h * 0.085], [cx + w * 0.07, by - h * 0.035], [cx - w * 0.07, by - h * 0.035]], { fill: c(K.yellow), ink: K.ink, lw: 1.8 });
            C.poly(g, [[cx - w * 0.035, by - h * 0.3], [cx + w * 0.035, by - h * 0.3], [cx + w * 0.09, by - h * 0.12], [cx - w * 0.09, by - h * 0.12]], { fill: GD, ink: K.ink, lw: 2.6 });
            for (const k of [-1, 1]) {
                const hx = cx + k * w * 0.15, hy = by - h * 0.56;
                tube(g, C.curve([[hx, hy - h * 0.1], [hx + k * w * 0.11, hy - h * 0.1], [hx + k * w * 0.1, hy + h * 0.1], [hx - k * w * 0.02, hy + h * 0.14]], false, 6), w * 0.028, GD, 2.2);
            }
            const cup = C.curve([[cx - w * 0.18, by - h * 0.74], [cx - w * 0.17, by - h * 0.5], [cx - w * 0.09, by - h * 0.33], [cx, by - h * 0.29], [cx + w * 0.09, by - h * 0.33], [cx + w * 0.17, by - h * 0.5], [cx + w * 0.18, by - h * 0.74]], false, 6);
            C.poly(g, cup, { fill: G, ink: K.ink, lw: 2.6 });
            line(g, [[cx - w * 0.13, by - h * 0.68], [cx - w * 0.12, by - h * 0.5]], 3.4, c('#fff59a'));
            C.poly(g, C.ellipsePts(cx, by - h * 0.74, w * 0.18, h * 0.035, 20), { fill: c('#fff59a'), ink: K.ink, lw: 2.4 });
            // a star on the cup
            const st = [];
            for (let i = 0; i < 10; i++) {
                const a = -PI / 2 + (i / 10) * TAU, r = i % 2 ? h * 0.04 : h * 0.09;
                st.push([cx + w * 0.02 + Math.cos(a) * r, by - h * 0.53 + Math.sin(a) * r]);
            }
            C.poly(g, st, { fill: c('#fffdf4'), ink: K.ink, lw: 2 });
            C.sparkle(g, cx - w * 0.3, by - h * 0.7, h * (d % 4 < 2 ? 0.1 : 0.065), { color: c('#fffdf4'), ink: K.ink, lw: 2 });
            C.sparkle(g, cx + w * 0.31, by - h * 0.42, h * (d % 4 < 2 ? 0.06 : 0.09), { color: c('#fffdf4'), ink: K.ink, lw: 2 });
        },
        // the last one is lettered
        exit(g, x, y, w, h, c) {
            const cap = h * 0.6, fs = cap / capOf(g);
            g.font = `${fs}px "Anton"`;
            g.textAlign = 'center';
            g.textBaseline = 'alphabetic';
            const wd = g.measureText('EXIT 666').width, kx = Math.min(1, (w * 0.9) / wd);
            g.save();
            g.translate(x + w / 2, y + h / 2 + cap / 2);
            g.scale(kx, 1);
            g.lineJoin = 'round';
            g.strokeStyle = K.ink;
            g.lineWidth = 7;
            g.strokeText('EXIT 666', 0, 0);
            g.fillStyle = c(K.yellow);
            g.fillText('EXIT 666', 0, 0);
            g.restore();
        },
    };
    const FIELD = { pie: K.teal, bed: '#3b2fa0', gold: K.purple, trophy: K.blue, exit: K.red };

    /**
     * A roadside billboard: two posts with braces, a frame with a row of bulbs that chase, a
     * painted picture and, under it, an arrow that points on.
     *   (x, y) the ground under its middle
     *   o: { pic ('pie' | 'bed' | 'gold' | 'trophy' | 'exit'), w, h, legs, on (its bulbs are lit),
     *        pop (0..1.x the halo's size when it lights), t, arrow (false to leave it out), arrowAng }
     */
    function billboard(g, x, y, o = {}) {
        const { pic = 'pie', w = 270, h = 170, legs = 230, on = false, t = 0 } = o;
        const c = on ? (col) => col : (col) => mix(col, NIGHT, 0.64);
        const x0 = x - w / 2, y1 = y - legs, y0 = y1 - h, dd = [9, -6];
        // posts, a rail and braces between them
        const px = [x - w * 0.32, x + w * 0.32];
        for (const p of px) C.box(g, p - 6 + dd[0], y0 + 16 + dd[1], 12, y - y0 - 16, [5, -3.4], { front: c(WOOD), top: c(WOOD_T), side: c(WOOD_S) }, { lw: 3 });
        tube(g, [[px[0] + dd[0], y - 16 + dd[1]], [px[1] + dd[0], y1 + 84 + dd[1]]], 5, c(WOOD_S), 2.4);
        tube(g, [[px[1] + dd[0], y - 16 + dd[1]], [px[0] + dd[0], y1 + 84 + dd[1]]], 5, c(WOOD), 2.4);
        // the halo of its bulbs
        if (on) {
            const k = o.pop ?? 1, m = 20 * k;
            g.save();
            g.globalCompositeOperation = 'screen';
            g.beginPath();
            g.roundRect(x0 - m, y0 - m, w + 2 * m + dd[0], h + 2 * m, 26);
            g.fillStyle = '#4a4216';
            g.fill();
            g.restore();
        }
        C.box(g, x0, y0, w, h, dd, { front: c('#3b2fa0'), top: c('#6c5fe0'), side: c('#231e62') }, { lw: 3.2, depth: 1 });
        const m = 19, px0 = x0 + m, py0 = y0 + m, pw = w - 2 * m, ph = h - 2 * m;
        g.fillStyle = c(FIELD[pic]);
        g.fillRect(px0, py0, pw, ph);
        g.save();
        g.beginPath();
        g.rect(px0, py0, pw, ph);
        g.clip();
        PICS[pic](g, px0, py0, pw, ph, c, t);
        g.restore();
        g.strokeStyle = K.ink;
        g.lineWidth = 2.8;
        g.strokeRect(px0, py0, pw, ph);
        // bulbs round the frame: they chase, two drawings a step
        const step = Math.floor(C.drawing(t) / 2), nx = Math.round(w / 25), ny = Math.round(h / 25), bulbs = [];
        for (let i = 0; i < nx; i++) bulbs.push([x0 + m / 2 + (i * (w - m)) / nx, y0 + m / 2]);
        for (let i = 0; i < ny; i++) bulbs.push([x0 + w - m / 2, y0 + m / 2 + (i * (h - m)) / ny]);
        for (let i = 0; i < nx; i++) bulbs.push([x0 + w - m / 2 - (i * (w - m)) / nx, y0 + h - m / 2]);
        for (let i = 0; i < ny; i++) bulbs.push([x0 + m / 2, y0 + h - m / 2 - (i * (h - m)) / ny]);
        bulbs.forEach(([bx, by], i) => dot(g, bx, by, 5.4, on ? (((i - step) % 3 + 3) % 3 === 0 ? '#fffdf4' : K.yellow) : '#4a3fc0', 1.9));
        // the arrow under it
        if (o.arrow !== false) {
            const ang = o.arrowAng ?? 0, len = Math.min(w * 0.86, 250);
            arrowPlank(g, x + (ang ? w * 0.16 : 0), y1 + (ang ? 76 : 44), len, { ang, on, t, c });
        }
    }

    // The band car's headlights at night: two flat beams, a brighter core in each.
    // (x, y, s): the car as Rig.band takes it.
    function beams(g, x, y, s, len = 560) {
        const lamps = [[5.016, -1.134], [4.434, -0.746]];
        g.save();
        g.globalCompositeOperation = 'screen';
        for (const [k, col] of [[1, '#4d4519'], [0.45, '#3d3613']]) {
            g.fillStyle = col;
            for (const [lx, ly] of lamps) {
                const p = [x + lx * s, y + ly * s];
                C.trace(g, [[p[0], p[1] - 0.1 * s], [p[0] + len, p[1] - 1.15 * s * k], [p[0] + len, p[1] + 1.0 * s * k], [p[0], p[1] + 0.1 * s]]);
                g.fill();
            }
        }
        g.restore();
        for (const [lx, ly] of lamps) C.sparkle(g, x + lx * s, y + ly * s, 0.26 * s, { color: '#fffdf4', rot: 0.2 });
    }

    // =========================================================================================
    // The trap site: its own ground, laid out along x with Hell's lips at x = 0
    // =========================================================================================
    const G = {
        HOR: 640, VERGE: 674, // the dunes' line and the far verge's edge
        R0: 742, R1: 864, LANE: 825, RW: 122, // the relaid highway: far edge, near edge, where wheels touch
        BED: 142, // how much nearer the old bed lies
        DX: 183, // a line across the road leans this far to the right (the kit's oblique)
        TH: 10, // the ribbon's thickness
        BASE: 880, JAW: 64, HD: [234, -156], // the gate: its front base line, the lower jaw's height, its depth
        TIP: -380, RAMP1: -50, // the tongue: its tip, and where it gets to the jaw's height
        HINGE: [1000, 610],
    };
    const ROADC = W.road, UNDER = '#a85a30', UNDER_D = '#70381e', BEDC = '#2c2380', BEDM = '#231e62';
    const MESA = W.mesa, MESA_T = W.mesaTop, MESA_S = W.mesaSide;
    const TOOTH = '#fff6e0', TOOTH_T = '#fffdf4', TOOTH_S = '#d9c39a', PIT = '#4d0f1c';
    const TONGUE = '#ee2f45', TONGUE_S = '#a3142c', TONGUE_L = '#ff7a8a';

    // run fn in the site's units through a camera; f: the layer's share of the travel
    function view(g, cam, fn, f = 1) {
        g.save();
        g.translate(0, cam.oy);
        g.scale(cam.z, cam.z);
        g.translate(-cam.L * f, 0);
        fn();
        g.restore();
    }
    const toScreen = (cam, p) => [(p[0] - cam.L) * cam.z, p[1] * cam.z + cam.oy];

    // The night sky of the road set (World.back draws its own inline; this is the same drawing).
    function sky(g, t, X, moon, hy) {
        const d = C.drawing(t);
        C.sunburst(g, 500, hy + 40, { n: 12, rot: t * 0.06, a: W.skyA, b: W.skyB });
        const r = Motion.rng('stars'), sh = ((X * 0.01) % 1000 + 1000) % 1000;
        for (let i = 0; i < 46; i++) {
            const x = r() * 1000, y = r() * (World.HOR - 60), s = 5 + r() * 9, ph = Math.floor(r() * 12);
            const tw = (d + ph) % 12 < 2 ? 1.5 : 1;
            C.sparkle(g, x - sh + (x < sh ? 1000 : 0), y, s * tw, { color: i % 5 ? '#fffbe8' : K.yellow });
        }
        const { x, y, r: mr } = moon;
        g.save();
        g.translate(x, y);
        g.beginPath();
        g.arc(0, 0, mr, 0, TAU);
        g.fillStyle = '#fffbe8';
        g.fill();
        g.save();
        g.clip();
        g.fillStyle = '#dcd6f7';
        for (const [cx, cy, cr] of [[-0.42, -0.26, 0.26], [0.36, -0.5, 0.15], [0.44, 0.28, 0.3], [-0.5, 0.42, 0.14], [0.02, 0.06, 0.1], [-0.08, 0.74, 0.17]]) {
            g.beginPath();
            g.ellipse(cx * mr, cy * mr, cr * mr, cr * mr * 0.84, -0.3, 0, TAU);
            g.fill();
        }
        g.restore();
        g.beginPath();
        g.arc(0, 0, mr, 0, TAU);
        g.strokeStyle = K.ink;
        g.lineWidth = Math.max(4, mr * 0.03);
        g.stroke();
        g.restore();
        World.cells(X, 0.035, 430, 260, 'cloud', (i, cx, rr) => {
            const cy = 130 + rr() * 230, s = 60 + rr() * 50;
            if (Math.abs(cx - x) < mr * 1.15 + s * 1.3) return;
            World.cloud(g, W, cx, cy, s);
        });
    }

    /**
     * The site's ground behind the road: far mesas, dunes, the far verge and what grows on it.
     *   cam: { L, z, oy };  o: { clear: [[xa, xb], …] stretches (wu) kept free of cacti and rocks }
     */
    function ground(g, t, cam, o = {}) {
        const { z, oy, L } = cam, vw = 1000 / z;
        g.save();
        g.translate(0, oy);
        g.scale(z, z);
        g.save();
        g.translate(0, G.HOR - World.HOR);
        World.cells(L, 0.12, 470, 420 + vw, 'mesa', (i, x, r) => {
            const tall = r() < 0.3;
            World.mesa(g, W, x, tall ? 110 + r() * 50 : 210 + r() * 160, tall ? 190 + r() * 70 : 90 + r() * 90, 30 + r() * 20);
        });
        g.restore();
        const dune = [[-20, G.R0]];
        for (let x = -20; x <= vw + 20; x += 20) {
            const wx = x + L * 0.25;
            dune.push([x, G.HOR - 16 - 12 * Math.sin(wx / 130) - 7 * Math.sin(wx / 47 + 1)]);
        }
        dune.push([vw + 20, G.R0]);
        C.poly(g, dune, { fill: W.dune, lw: 0 });
        C.poly(g, dune.slice(1, -1), { ink: K.ink, lw: 4, close: false });
        World.cells(L, 0.25, 210, 80 + vw, 'dunemark', (i, x, r) => C.poly(g, [[x, G.HOR + 6 + r() * 14], [x + 40 + r() * 50, G.HOR + 6 + r() * 14]], { ink: W.duneLine, lw: 3, close: false }));
        g.fillStyle = W.sand;
        g.fillRect(-20, G.VERGE, vw + 40, 1500 - G.VERGE);
        const edge = [];
        for (let x = -20; x <= vw + 20; x += 20) edge.push([x, G.VERGE + 2 + 4 * Math.sin((x + L * 0.5) / 90)]);
        C.poly(g, edge, { ink: K.ink, lw: 4, close: false });
        World.cells(L, 0.6, 130, 60 + vw, 'ripple', (i, x, r) => C.poly(g, [[x, G.VERGE + 14 + r() * 30], [x + 18 + r() * 30, G.VERGE + 14 + r() * 30]], { ink: W.sandD, lw: 3, close: false }));
        const things = [];
        World.cells(L, 1, 310, 200 + vw, 'verge3b', (i, x, r) => {
            const k = r(), y = G.VERGE + 30 + r() * 30, wx = x + L, h = 90 + r() * 56, fl = r() < 0.5 ? 1 : -1, s = 40 + r() * 34;
            if ((o.clear ?? []).some(([a, c]) => wx > a && wx < c)) return;
            things.push([y, () => {
                if (k < 0.42) World.cactus(g, W, x, y, h, fl);
                else if (k < 0.6) World.rock(g, W, x, y, s + 10);
                else if (k < 0.74) World.bush(g, W, x, y, s * 0.7);
                else if (k < 0.82) World.skull(g, W, x, y, 44);
            }]);
        });
        things.sort((a, c) => a[0] - c[0]).forEach(([, fn]) => fn());
        g.restore();
    }

    // a point of the road at station x, w across it (0 = near edge, 1 = far), for a stretch
    // that lies `off` towards the old bed and `lift` off the ground
    const roadPt = (x, w, off = 0, lift = 0) => [x + G.DX * w, G.R1 + off - lift - G.RW * w];
    const stations = (xa, xb, step = 20) => {
        const xs = [xa];
        for (let x = Math.ceil((xa + 1e-6) / step) * step; x < xb - 1e-6; x += step) xs.push(x);
        xs.push(xb);
        return xs;
    };

    /**
     * The bare bed the highway left, and the sand in front of it (the near verge).
     *   xa, xb: the stretch on screen (wu);  from: where the bed begins (left of it the highway is still there)
     */
    function bed(g, xa, xb, from = -1e9) {
        const a = Math.max(xa, from), y0 = G.R0 + G.BED, y1 = G.R1 + G.BED;
        if (a < xb) {
            C.poly(g, [[a, y0], [xb, y0], [xb, y1], [a, y1]], { fill: BEDC, lw: 0 });
            // its torn edges, crumbs, and the ghosts of the dashes
            for (const [yy, s] of [[y0, 1], [y1, -1]]) {
                const pts = [];
                for (let x = Math.floor(a / 34) * 34; x <= xb + 34; x += 34) {
                    const r = Motion.rng('v3b-bed' + s + ':' + x);
                    pts.push([Math.max(a, x), yy + s * r() * 5]);
                }
                C.poly(g, pts, { ink: K.ink, lw: 4, close: false });
            }
            for (let i = Math.floor(a / 170); i * 170 < xb; i++) {
                const r = Motion.rng('v3b-crumb:' + i), x = i * 170;
                if (x + G.DX * 0.64 > a) C.poly(g, [[x + G.DX * 0.64, y1 - G.RW * 0.64], [x + 86 + G.DX * 0.64, y1 - G.RW * 0.64]], { ink: BEDM, lw: 8, close: false });
                for (let k = 0; k < 3; k++) {
                    const cx = x + r() * 170, cy = y0 + 14 + r() * (G.RW - 28);
                    if (cx > a + 10) C.poly(g, [[cx, cy], [cx + 10 + r() * 22, cy]], { ink: BEDM, lw: 3.4, close: false });
                }
            }
        }
        g.fillStyle = W.sand;
        g.fillRect(xa, y1, xb - xa, 600);
        C.poly(g, [[xa, y1], [Math.min(xb, Math.max(xa, a)), y1]], { ink: K.ink, lw: 4, close: false });
        for (let i = Math.floor(xa / 110); i * 110 < xb; i++) {
            const r = Motion.rng('v3b-pebble:' + i), x = i * 110 + r() * 60, y = y1 + 16 + r() * 150;
            if (r() < 0.5) C.poly(g, [[x, y], [x + 16 + r() * 26, y]], { ink: W.sandD, lw: 3.4, close: false });
            else {
                g.beginPath();
                g.ellipse(x, y, 7 + r() * 5, 4 + r() * 3, 0, 0, TAU);
                g.fillStyle = W.sandD;
                g.fill();
            }
        }
    }

    /**
     * A stretch of the highway as a ribbon of carpet: a top with its edge lines and dashes, and
     * a thickness whose face shows the underside's tone.
     *   xa, xb: stations (wu);  shape(x) → [off, lift]
     *   o: { flush (it lies in its bed: no thickness), endA, endB (a cut end is outlined),
     *        pegs: [x, …] nail heads along its near edge, shadow (false: none) }
     */
    function ribbon(g, xa, xb, shape, o = {}) {
        if (xb - xa < 1) return;
        const xs = stations(xa, xb), sh = xs.map(shape);
        const at = (i, w) => roadPt(xs[i], w, sh[i][0], sh[i][1]);
        const N = xs.map((_, i) => at(i, 0)), F = xs.map((_, i) => at(i, 1));
        if (!o.flush) {
            if (o.shadow !== false && sh.some(([, l]) => l > 2)) {
                const gs = xs.map((x, i) => roadPt(x, 0, sh[i][0], 0)), gf = xs.map((x, i) => roadPt(x, 1, sh[i][0], 0));
                C.poly(g, [...gs.map(([x, y]) => [x, y + G.TH]), ...gf.slice().reverse()], { fill: SHADOW, lw: 0 });
            }
            C.poly(g, [...N, ...N.slice().reverse().map(([x, y]) => [x, y + G.TH])], { fill: UNDER, ink: K.ink, lw: 3.2 });
        }
        C.poly(g, [...N, ...F.slice().reverse()], { fill: ROADC, lw: 0 });
        line(g, N, 4);
        line(g, F, 4);
        if (o.endA) line(g, [N[0], F[0]], 4);
        if (o.endB) line(g, [N[N.length - 1], F[F.length - 1]], 4);
        line(g, xs.map((_, i) => at(i, 0.1)), 3.4, W.roadEdge);
        line(g, xs.map((_, i) => at(i, 0.9)), 3.4, W.roadEdge);
        for (let k = Math.floor((xa - 86) / 170); k * 170 < xb; k++) {
            const a = Math.max(xa, k * 170), c = Math.min(xb, k * 170 + 86);
            if (c - a < 6) continue;
            line(g, stations(a, c, 20).map((x) => roadPt(x, 0.64, ...shape(x))), 8, W.roadLine);
        }
        for (let k = Math.floor(xa / 940); k * 940 < xb; k++) {
            const r = Motion.rng('v3b-crack:' + k), x = k * 940 + r() * 500;
            if (x < xa + 10 || x + 90 > xb) continue;
            line(g, [[0, 0.2], [26, 0.33], [40, 0.28], [70, 0.46]].map(([dx, w]) => roadPt(x + dx, w, ...shape(x + dx))), 3, W.crack);
        }
        for (const [px, pw] of o.pegs ?? []) {
            if (px < xa || px > xb) continue;
            const p = roadPt(px, pw, ...shape(px));
            C.poly(g, C.ellipsePts(p[0], p[1], 9, 5.4, 14), { fill: '#c9cfe2', ink: K.ink, lw: 2.4 });
            line(g, [[p[0] - 4, p[1] - 1.5], [p[0] + 1, p[1] - 1.5]], 1.8, '#ffffff');
        }
    }
    // the highway still in its bed (flush with the ground, as World draws it)
    const inBed = () => [G.BED, 0];

    // The rolled end of the ribbon: its spiral end faces us, its outside is the underside.
    // (x, y): the middle of the near end; r: its radius; turn: radians it has rolled.
    function roll(g, x, y, r, turn = 0) {
        if (r < 3) return;
        const Dd = [G.DX, -G.RW];
        C.drum(g, x, y, r, Dd, { front: UNDER, side: UNDER }, { lw: 3.2 });
        // seams along it turn with the roll
        for (let i = 0; i < 5; i++) {
            const a = turn + (i / 5) * TAU, cs = Math.cos(a), sn = Math.sin(a);
            if (cs * Dd[1] - sn * Dd[0] < 0) continue; // only on the side we see
            line(g, [[x + cs * r, y + sn * r], [x + cs * r + Dd[0], y + sn * r + Dd[1]]], 2.6, UNDER_D);
        }
        const sp = [];
        for (let i = 0; i <= 40; i++) {
            const u = i / 40, a = turn + u * TAU * 2.4, rr = r * (0.94 - 0.8 * u);
            sp.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
        }
        line(g, sp, Math.max(3, r * 0.2), ROADC);
        dot(g, x, y, r, null, 3.2);
    }

    // --- the tongue: a red carpet that comes down from the jaw to the ground --------------------
    const rampH = (x) => G.JAW * smooth((x - G.TIP) / (G.RAMP1 - G.TIP));
    function tongue(g, t, o = {}) {
        const xe = o.to ?? 330, R = 64, x0 = G.TIP + R;
        const cap = [];
        for (let i = 0; i <= 12; i++) {
            const a = -PI / 2 + (i / 12) * PI, x = x0 - R * Math.cos(a);
            cap.push(roadPt(x, (1 + Math.sin(a)) / 2, 0, rampH(x)));
        }
        const xs = stations(x0, xe), N = xs.map((x) => roadPt(x, 0, 0, rampH(x))), F = xs.map((x) => roadPt(x, 1, 0, rampH(x)));
        // its side: a wedge from the tip up to the jaw
        const sx = stations(G.TIP + 6, -56);
        C.poly(g, [...sx.map((x) => [x, G.R1 - rampH(x)]), [-56, G.R1 + 4], [G.TIP + 6, G.R1 + 4]], { fill: TONGUE_S, ink: K.ink, lw: 3.2 });
        const top = [...N, ...F.slice().reverse(), ...cap.slice(1, -1).reverse()];
        C.poly(g, top, { fill: TONGUE, ink: K.ink, lw: 3.2 });
        // the groove down its middle, a lit edge, buds near the tip
        line(g, stations(G.TIP + 40, xe).map((x) => roadPt(x, 0.5, 0, rampH(x))), 5, TONGUE_S);
        line(g, stations(G.TIP + 90, xe).map((x) => roadPt(x, 0.9, 0, rampH(x))), 3, TONGUE_L);
        for (const [dx, w] of [[70, 0.2], [100, 0.34], [84, 0.7], [122, 0.78], [140, 0.22]]) {
            const p = roadPt(G.TIP + dx, w, 0, rampH(G.TIP + dx));
            g.beginPath();
            g.ellipse(p[0], p[1], 5, 3, 0, 0, TAU);
            g.fillStyle = TONGUE_L;
            g.fill();
        }
    }

    // --- Hell's mouth: the mesa's end as a stone head in profile ------------------------------
    // Local x from the lips; the upper jaw is the mesa's lid and turns about a hinge far behind.
    const LOWER = [[-56, 826], [-48, 816], [300, 806], [316, 760], [332, 692], [520, 668], [760, 640], [1000, 612], [1100, 606], [1100, 880], [-44, 880], [-66, 852]];
    const UPPER = [[70, 432], [128, 402], [1040, 396], [1040, 606], [1000, 612], [760, 640], [520, 668], [332, 692], [300, 688], [220, 668], [110, 654], [0, 650], [-14, 628], [-10, 592], [14, 566], [36, 522], [34, 478]];
    const LIP = UPPER.slice(4, 12); // from the hinge to the lip's tip
    const lipY = (x) => {
        for (let i = LIP.length - 1; i > 0; i--) {
            const a = LIP[i], c = LIP[i - 1];
            if (x <= c[0]) return a[1] + ((c[1] - a[1]) * (x - a[0])) / (c[0] - a[0]);
        }
        return 612;
    };
    const turn = (p, a) => {
        const q = rot([p[0] - G.HINGE[0], p[1] - G.HINGE[1]], a);
        return [q[0] + G.HINGE[0], q[1] + G.HINGE[1]];
    };
    const SHUT = -0.105;
    const strata = (g, pts, ys, x0, x1) => {
        g.save();
        C.trace(g, pts);
        g.clip();
        for (const y of ys) line(g, [[x0, y], [x1, y]], 3, MESA_S);
        g.restore();
    };
    function tooth(g, x, y, hw, len, dd, dark = false) {
        const pts = cw([[x - hw, y], [x + hw * 0.12, y + len], [x + hw, y]]);
        C.prism(g, pts, dd, { front: dark ? TOOTH_S : TOOTH, top: TOOTH_T, side: TOOTH_S }, { lw: 3 });
        if (!dark) line(g, [[x - hw * 0.4, y + len * 0.16], [x - hw * 0.12, y + len * 0.6]], 2.2, TOOTH_S);
    }
    const LOW_TEETH = [[-26, 70], [26, 46], [76, 50], [126, 44], [176, 48], [224, 42], [268, 36]];
    const UP_TEETH = [[2, 58], [52, 50], [101, 46], [151, 48], [200, 44], [246, 40]];
    const ledgeY = (x) => 816 - (10 * (x + 48)) / 348;

    /**
     * What is behind whatever goes into the mouth: the mesa's body with the mouth's floor, the
     * dark inside and its glow. a: the upper jaw's angle (0 = the grin, SHUT, up to 0.33 wide open).
     */
    function headBack(g, t, a, o = {}) {
        const P = S.pulseAt(t), d = C.drawing(t), glow = o.glow ?? 1;
        C.prism(g, LOWER, G.HD, { front: MESA, top: MESA_T, side: MESA_S }, { lw: 4 });
        // the inside: everything between the jaws
        const gap = [...LOWER.slice(1, 8), ...LIP.map((p) => turn(p, a))];
        C.poly(g, gap, { fill: PIT, lw: 0 });
        g.save();
        C.trace(g, gap);
        g.clip();
        const k = glow * (1 + 0.1 * P.pulse);
        for (const [rx, ry, col] of [[330, 190, '#8f1220'], [236, 140, K.red], [150, 92, K.orange], [74, 46, K.yellow]]) {
            g.beginPath();
            g.ellipse(318, 770, rx * k, ry * k, -0.2, 0, TAU);
            g.fillStyle = col;
            g.fill();
        }
        // the far row of teeth, in shadow, on the floor's far edge
        if (a > 0.04) for (const [x, len] of LOW_TEETH) tooth(g, x + 190, 690 - (10 * (x + 48)) / 348, 20, -len * 0.8, [0, 0], true);
        g.restore();
        void d;
    }
    // flames on the tongue, at the back of the mouth (drawn after the tongue, clipped to the gap)
    function headFlames(g, t, a, size = 1) {
        const d = C.drawing(t), P = S.pulseAt(t);
        g.save();
        C.trace(g, [...LOWER.slice(1, 8), ...LIP.map((p) => turn(p, a))]);
        g.clip();
        for (const [fx, fy, fs, sd] of [[236, 770, 96, 0], [318, 782, 120, 1], [150, 744, 70, 2]]) Fx.flame(g, fx, fy, fs * size * (1 + 0.14 * P.pulse * ((sd + P.k) % 2 ? 1 : 0.4)), d, sd);
        g.restore();
    }
    // An eye: a cave window with a fire behind it and a slit pupil. lid 0..1 closes it from above.
    function eye(g, cx, cy, o = {}) {
        const hw = 34, ht = 44, arch = (m) => [...C.ellipsePts(cx, cy - ht + hw + 0, hw + m, hw + m, 14, 0, PI, TAU), [cx + hw + m, cy + ht + m], [cx - hw - m, cy + ht + m]];
        C.poly(g, arch(7), { fill: MESA_S, ink: K.ink, lw: 3 });
        const hole = arch(0);
        C.poly(g, hole, { fill: K.orange, ink: K.ink, lw: 3 });
        g.save();
        C.trace(g, hole);
        g.clip();
        g.fillStyle = K.yellow;
        g.beginPath();
        g.ellipse(cx, cy + ht, hw * 1.2, ht * 0.9, 0, 0, TAU);
        g.fill();
        const lk = (o.look ?? 0) * 13;
        g.fillStyle = '#1d1626';
        g.beginPath();
        g.roundRect(cx - 8 + lk, cy - 26 + (o.lookY ?? 0) * 8, 16, 56, 8);
        g.fill();
        g.fillStyle = '#ffffff';
        g.fillRect(cx - 20 + lk * 0.5, cy - 20, 9, 9);
        const lid = o.lid ?? 0;
        if (lid > 0.02) {
            const ly = cy - ht - 4 + (2 * ht + 4) * lid;
            g.fillStyle = MESA;
            g.fillRect(cx - hw - 4, cy - ht - 8, 2 * hw + 8, ly - (cy - ht - 8));
            line(g, [[cx - hw - 4, ly], [cx + hw + 4, ly]], 3);
            if (lid > 0.9) line(g, [[cx - hw + 6, ly - 12], [cx + hw - 6, ly - 12]], 2.4, MESA_S);
        }
        g.restore();
        C.poly(g, hole, { ink: K.ink, lw: 3 });
        // the sill
        C.box(g, cx - hw - 10, cy + ht + 2, 2 * hw + 20, 9, [7, -4.6], { front: MESA_T, top: '#a888f5', side: MESA_S }, { lw: 2.6 });
    }
    /**
     * What is in front: the body's face and the lower teeth, then the lid with its teeth, eyes,
     * brow and horns.  o: { lid (0..1 both eyes), look (-1..1), brow (-1 raised .. 1 pressed down) }
     */
    function headFront(g, t, a, o = {}) {
        C.poly(g, LOWER, { fill: MESA, ink: K.ink, lw: 4 });
        strata(g, LOWER, [846, 742, 700], -80, 1100);
        line(g, [[-30, 846], [-18, 858], [-34, 868]], 3, MESA_S);
        for (const [x, len] of LOW_TEETH.slice().reverse()) tooth(g, x, ledgeY(x) + 2, 21, -len, [7, -4.6]);
        // the lid, turned about its hinge
        const dd = rot(G.HD, -a), td = rot([7, -4.6], -a);
        g.save();
        g.translate(...G.HINGE);
        g.rotate(a);
        g.translate(-G.HINGE[0], -G.HINGE[1]);
        // horns of rock on its top: the far one first
        const horn = cw([[176, 404], [184, 356], [172, 318], [150, 288], [198, 314], [232, 356], [248, 402]]);
        C.prism(g, horn.map(([x, y]) => [x + dd[0] * 0.62, y + dd[1] * 0.62]), [dd[0] * 0.16, dd[1] * 0.16], { front: MESA_S, top: MESA, side: MESA_S }, { lw: 3.2 });
        C.prism(g, UPPER, dd, { front: MESA, top: MESA_T, side: MESA_S }, { lw: 4 });
        strata(g, UPPER, [448, 606], -40, 1100);
        C.prism(g, horn.map(([x, y]) => [x + dd[0] * 0.1, y + dd[1] * 0.1]), [dd[0] * 0.16, dd[1] * 0.16], { front: MESA, top: MESA_T, side: MESA_S }, { lw: 3.2 });
        for (const k of [0.3, 0.55, 0.78]) line(g, [[lerp(184, 150, k) + dd[0] * 0.1 - 2, lerp(404, 288, k) + dd[1] * 0.1], [lerp(246, 152, k) + dd[0] * 0.1, lerp(402, 290, k) + dd[1] * 0.1 + 6]], 2.4, MESA_S);
        // teeth along the lip, the fang last
        for (const [x, len] of UP_TEETH.slice().reverse()) tooth(g, x, lipY(x) - 2, 21, len, td);
        // nostril, eyes, brow
        g.beginPath();
        g.ellipse(12, 606, 9, 6, -0.5, 0, TAU);
        g.fillStyle = PIT;
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = 2.6;
        g.stroke();
        eye(g, 104, 548, o);
        eye(g, 206, 552, o);
        const bw = o.brow ?? 0;
        const brow = cw([[44, 468 + bw * 16], [270, 482 - bw * 12], [274, 500 - bw * 12], [42, 488 + bw * 16]]);
        C.prism(g, brow, [dd[0] * 0.06, dd[1] * 0.06], { front: MESA_T, top: '#a888f5', side: MESA_S }, { lw: 3.2 });
        g.restore();
    }

    // The gate's own sign: EXIT 666 and an arrow on a board that can spin on its post.
    // (x, y): the post's foot; o: { spin (radians about the post), tilt (it hangs askew) }
    function exitSign(g, x, y, o = {}) {
        const ph = 236, bw = 236, bh = 122, by = y - ph - bh, cs = Math.cos(o.spin ?? 0);
        g.fillStyle = SHADOW;
        g.beginPath();
        g.ellipse(x + 6, y, 30, 6, 0, 0, TAU);
        g.fill();
        C.box(g, x - 6, by + 20, 12, y - by - 20, [5, -3.4], { front: '#c9cfe2', top: '#f4f6fc', side: '#8d95ad' }, { lw: 3 });
        g.save();
        g.translate(x, by + bh / 2);
        g.rotate(o.tilt ?? 0);
        g.scale(Math.max(0.04, Math.abs(cs)), 1);
        const lw = 3.2;
        if (cs >= 0) {
            C.box(g, -bw / 2, -bh / 2, bw, bh, [6 * Math.abs(cs), -4], { front: K.teal, top: K.aqua, side: K.tealDeep }, { lw });
            g.strokeStyle = '#fffdf4';
            g.lineWidth = 4;
            g.beginPath();
            g.roundRect(-bw / 2 + 9, -bh / 2 + 9, bw - 18, bh - 18, 8);
            g.stroke();
            const cap = 44, fs = cap / capOf(g);
            g.font = `${fs}px "Anton"`;
            g.textAlign = 'center';
            g.textBaseline = 'alphabetic';
            const wd = g.measureText('EXIT 666').width, kx = Math.min(1, (bw - 44) / wd);
            g.save();
            g.translate(0, -bh / 2 + 20 + cap);
            g.scale(kx, 1);
            g.fillStyle = '#fffdf4';
            g.fillText('EXIT 666', 0, 0);
            g.restore();
            // the arrow, to the mouth
            C.poly(g, [[-70, 24], [34, 24], [34, 12], [74, 34], [34, 56], [34, 44], [-70, 44]], { fill: '#fffdf4', ink: K.ink, lw: 2.4 });
        } else {
            C.box(g, -bw / 2, -bh / 2, bw, bh, [6 * Math.abs(cs), -4], { front: K.tealDeep, top: K.teal, side: '#0a6a64' }, { lw });
            for (const sx of [-1, 1]) line(g, [[sx * (bw / 2 - 14), -bh / 2 + 12], [sx * (bw / 2 - 14), bh / 2 - 12]], 5, '#0a6a64');
        }
        g.restore();
        // the bolts that hold it
        if (Math.abs(cs) > 0.5) for (const dy of [-26, 26]) dot(g, x, by + bh / 2 + dy, 4, '#f4f6fc', 2);
    }

    // The giant lever: a housing with a toothed quadrant, an arm with a red knob.
    // (x, y): the ground under its pivot; ang: 0 upright, positive to the right; returns the knob's place.
    const leverTip = (x, y, ang, len = 190) => [x + Math.sin(ang) * len, y - 34 - Math.cos(ang) * len];
    function lever(g, x, y, ang, len = 190) {
        g.fillStyle = SHADOW;
        g.beginPath();
        g.ellipse(x + 8, y, 62, 8, 0, 0, TAU);
        g.fill();
        const py = y - 34, tip = leverTip(x, y, ang, len);
        C.box(g, x - 44, y - 30, 88, 30, [14, -9.4], { front: '#4a4470', top: '#625c8c', side: '#353055' }, { lw: 3.2 });
        for (let i = 0; i < 4; i++) C.poly(g, [[x - 40 + i * 22, y - 4], [x - 30 + i * 22, y - 26], [x - 20 + i * 22, y - 26], [x - 30 + i * 22, y - 4]], { fill: K.yellow, lw: 0 });
        g.strokeStyle = K.ink;
        g.lineWidth = 3.2;
        g.strokeRect(x - 44, y - 30, 88, 30);
        // the quadrant: a toothed half disc
        const q = [];
        for (let i = 0; i <= 14; i++) {
            const a = PI + (i / 14) * PI, r = i % 2 ? 46 : 39;
            q.push([x + Math.cos(a) * r, y - 30 + Math.sin(a) * r]);
        }
        C.prism(g, cw(q), [6, -4], { front: '#8d95ad', top: '#d5dbea', side: '#62697f' }, { lw: 3 });
        tube(g, [[x, py], tip], 11, '#c9cfe2', 3.2);
        line(g, [[x + Math.sin(ang) * 30 - Math.cos(ang) * 2.5, py - Math.cos(ang) * 30 - Math.sin(ang) * 2.5], [x + Math.sin(ang) * (len - 30) - Math.cos(ang) * 2.5, py - Math.cos(ang) * (len - 30) - Math.sin(ang) * 2.5]], 2.6, '#ffffff');
        dot(g, x, py, 10, '#d5dbea', 3);
        dot(g, x, py, 3.4, K.ink);
        // the handle: a bar that hangs level, a red grip at each end
        tube(g, [[tip[0] - 50, tip[1]], [tip[0] + 50, tip[1]]], 10, '#c9cfe2', 3.2);
        for (const sx of [-1, 1]) tube(g, [[tip[0] + sx * 30, tip[1]], [tip[0] + sx * 52, tip[1]]], 13, K.red, 3.2);
        dot(g, tip[0], tip[1], 8, '#d5dbea', 3);
        return tip;
    }

    // An oversized mallet. (hx, hy): where the mitt holds the handle; ang: 0 = the head straight up; s: units.
    function mallet(g, hx, hy, ang, s) {
        const L = 3 / 1, at = (px, py) => {
            const q = rot([px * s, py * s], ang);
            return [hx + q[0], hy + q[1]];
        };
        tube(g, [at(0, 0.2), at(0, -0.86)], 0.085 * s, WOOD, L);
        const head = cw([at(-0.36, -1.22), at(0.36, -1.22), at(0.36, -0.8), at(-0.36, -0.8)]);
        C.prism(g, head, [0.3 * 0.34 * s, -0.2 * 0.34 * s], { front: WOOD_T, top: '#d7a468', side: WOOD }, { lw: L });
        for (const k of [-0.24, 0.24]) line(g, [at(k, -1.22), at(k, -0.8)], 0.06 * s, '#8d95ad');
        for (const k of [-0.27, 0.21]) line(g, [at(k, -1.22), at(k, -0.8)], 2, K.ink);
        for (const k of [-0.21, 0.27]) line(g, [at(k, -1.22), at(k, -0.8)], 2, K.ink);
        line(g, [at(-0.1, -1.1), at(0.1, -1.1)], 2, WOOD);
    }

    // A traffic cone. (x, y): the middle of its base; s: units; ang: its tilt.
    function cone(g, x, y, s, ang = 0) {
        const L = 3 / s;
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        g.scale(s, s);
        C.box(g, -0.26, -0.07, 0.52, 0.07, D, { front: '#e0641a', top: K.orange, side: '#b4480e' }, { lw: L, depth: 0.3 });
        const body = [[-0.17, -0.07], [-0.045, -0.66], [0.045, -0.66], [0.17, -0.07]];
        C.prism(g, cw(body.map(([px, py]) => [px + 0.045, py - 0.03])), [0.03, -0.02], { front: K.orange, top: '#ffb26b', side: '#e0641a' }, { lw: L });
        const bx = (py) => 0.17 - ((0.17 - 0.045) * (-0.07 - py)) / 0.59;
        for (const [a, c] of [[-0.24, -0.34], [-0.46, -0.54]]) C.poly(g, [[-bx(a) + 0.045, a - 0.03], [bx(a) + 0.045, a - 0.03], [bx(c) + 0.045, c - 0.03], [-bx(c) + 0.045, c - 0.03]], { fill: '#fffdf4', ink: K.ink, lw: L * 0.8 });
        g.restore();
    }

    // The striped barrier: a sawhorse with a blinking lamp. (x, y): the ground under its middle.
    function barrier(g, x, y, s, o = {}) {
        const L = 3 / s, d = C.drawing(o.t ?? 0);
        g.save();
        g.translate(x, y);
        g.rotate(o.ang ?? 0);
        g.scale(s, s);
        for (const sx of [-0.62, 0.62]) {
            tube(g, [[sx - 0.16 + 0.1, -0.02 - 0.06], [sx + 0.03, -0.78]], 0.055, '#fffdf4', L);
            tube(g, [[sx + 0.16, -0.02], [sx, -0.8]], 0.055, '#fffdf4', L);
        }
        const pl = [[-0.86, -0.86], [0.86, -0.86], [0.86, -0.56], [-0.86, -0.56]];
        C.prism(g, pl, [0.03, -0.02], { front: '#fffdf4', top: '#ffffff', side: '#c9cde0' }, { lw: L });
        g.save();
        C.trace(g, pl);
        g.clip();
        g.fillStyle = K.red;
        for (let i = -4; i < 6; i++) C.poly(g, [[i * 0.34, -0.9], [i * 0.34 + 0.17, -0.9], [i * 0.34 - 0.03, -0.5], [i * 0.34 - 0.2, -0.5]], { fill: K.red, lw: 0 });
        g.restore();
        C.poly(g, pl, { ink: K.ink, lw: L });
        // the lamp
        C.box(g, -0.07, -0.93, 0.14, 0.07, D, { front: '#3d3652', top: '#565082', side: '#2a2438' }, { lw: L * 0.8, depth: 0.1 });
        g.beginPath();
        g.arc(0, -1.02, 0.1, 0, TAU);
        g.fillStyle = o.lamp === false || d % 4 >= 2 ? '#e0a800' : K.yellow;
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = L;
        g.stroke();
        if (o.lamp !== false && d % 4 < 2) for (let i = 0; i < 3; i++) line(g, [[Math.cos(-PI / 2 + (i - 1) * 0.8) * 0.14, -1.02 + Math.sin(-PI / 2 + (i - 1) * 0.8) * 0.14], [Math.cos(-PI / 2 + (i - 1) * 0.8) * 0.22, -1.02 + Math.sin(-PI / 2 + (i - 1) * 0.8) * 0.22]], L * 0.8, K.yellow);
        g.restore();
    }

    // His blueprint: the plan of the trap in white on blue. (x, y): its middle; s: units; o: { ang, wave }
    function blueprint(g, x, y, s, o = {}) {
        const L = 3 / s, w = 1.06, h = 0.76, wv = o.wave ?? 0;
        g.save();
        g.translate(x, y);
        g.rotate(o.ang ?? 0);
        g.scale(s, s);
        const P4 = (u, v) => [(u - 0.5) * w, (v - 0.5) * h + wv * 0.07 * Math.sin(u * PI * 2) * (0.4 + u)];
        const edge = [];
        for (let i = 0; i <= 8; i++) edge.push(P4(i / 8, 0));
        for (let i = 8; i >= 0; i--) edge.push(P4(i / 8, 1));
        C.poly(g, edge, { fill: '#2b55d9', ink: K.ink, lw: L });
        g.save();
        C.trace(g, edge);
        g.clip();
        g.strokeStyle = '#6f93ff';
        g.lineWidth = L * 0.45;
        g.beginPath();
        for (let i = 1; i < 8; i++) {
            g.moveTo(...P4(i / 8, 0));
            g.lineTo(...P4(i / 8, 1));
        }
        for (let j = 1; j < 6; j++) {
            g.moveTo(...P4(0, j / 6));
            g.lineTo(...P4(1, j / 6));
        }
        g.stroke();
        g.restore();
        // the plan: a road that bends into a mouth full of teeth
        const wl = (pts, lw = 1) => line(g, pts.map(([u, v]) => P4(u, v)), L * lw, '#fffdf4');
        wl([[0.06, 0.78], [0.3, 0.78], [0.42, 0.7], [0.5, 0.52], [0.62, 0.46]], 1.1);
        wl([[0.06, 0.62], [0.26, 0.62], [0.36, 0.56], [0.44, 0.38], [0.62, 0.3]], 1.1);
        wl([[0.62, 0.2], [0.94, 0.2], [0.94, 0.56], [0.62, 0.56], [0.62, 0.2]], 1.1);
        wl([[0.62, 0.3], [0.68, 0.37], [0.74, 0.3], [0.8, 0.37], [0.86, 0.3], [0.92, 0.37]], 0.9);
        wl([[0.62, 0.46], [0.68, 0.4], [0.74, 0.46], [0.8, 0.4], [0.86, 0.46], [0.92, 0.4]], 0.9);
        wl([[0.1, 0.3], [0.26, 0.3]], 0.9);
        wl([[0.22, 0.24], [0.28, 0.3], [0.22, 0.36]], 0.9);
        wl([[0.1, 0.14], [0.4, 0.14]], 1.6);
        g.restore();
    }
    // The easel it stands on. (x, y): the ground under it; the sheet's middle is 1.16 up.
    function easel(g, x, y, s, o = {}) {
        const L = 3 / s;
        g.save();
        g.translate(x, y);
        g.rotate(o.ang ?? 0);
        g.scale(s, s);
        tube(g, [[0.14, -0.1], [0.04, -1.7]], 0.06, WOOD_S, L);
        tube(g, [[-0.46, 0], [-0.06, -1.72]], 0.06, WOOD, L);
        tube(g, [[0.5, 0], [0.06, -1.72]], 0.06, WOOD, L);
        C.box(g, -0.6, -0.76, 1.2, 0.07, D, { front: WOOD_T, top: '#d7a468', side: WOOD }, { lw: L, depth: 0.16 });
        g.restore();
    }

    // --- the Devil with a cold -----------------------------------------------------------------
    const SCARF = K.teal, SCARF_D = K.tealDeep, STRIPE = '#fffdf4';
    /**
     * Devil.draw, and over his own drawing a striped scarf round his neck and a sore nose.
     *   cold: { tail: [[x, y], …] the scarf's long end in HIS units (default: it hangs and flaps),
     *           blow (-1..1), nose (its size: 1; a sneeze coming swells it), t, noTail }
     */
    function devil(g, x, y, s, pose = {}, cold = {}) {
        Devil.draw(g, x, y, s, pose);
        const L = 3.2 / s, q = pose.squash ?? 0, d = C.drawing(cold.t ?? 0), fl = [0, 0.03, -0.02][((d % 3) + 3) % 3], blow = cold.blow ?? 0.2;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        g.lineJoin = 'round';
        const y0 = -1.0, y1 = -0.84, hd = pose.headDy ?? 0;
        // the long end, behind the wrap
        if (!cold.noTail) {
            const tl = cold.tail ?? C.curve([[-0.24, -0.9], [-0.33 - blow * 0.1, -0.7 + fl], [-0.3 - blow * 0.26, -0.48 - fl], [-0.36 - blow * 0.4, -0.26 + fl * 2]], false, 4);
            band(g, tl, 0.07, SCARF, STRIPE, L, { fringe: 0.07 });
        }
        // the wrap: across the front and round the side
        C.poly(g, [[0.41, y0 + hd * 0.5], [0.41 + D[0] * 0.42, y0 + D[1] * 0.42 + hd * 0.5], [0.41 + D[0] * 0.42, y1 + D[1] * 0.42], [0.41, y1]], { fill: SCARF_D, ink: K.ink, lw: L });
        const wrap = [[-0.41, y0 + hd * 0.5], [0.41, y0 - 0.012 + hd * 0.5], [0.41, y1], [-0.41, y1 + 0.012]];
        C.poly(g, wrap, { fill: SCARF, lw: 0 });
        g.save();
        C.trace(g, wrap);
        g.clip();
        g.fillStyle = STRIPE;
        for (let sx = -0.36; sx < 0.4; sx += 0.2) g.fillRect(sx, y0 - 0.05, 0.075, 0.3);
        g.restore();
        C.poly(g, wrap, { ink: K.ink, lw: L });
        // the short end and the knot
        band(g, C.curve([[-0.22, -0.88], [-0.2, -0.76], [-0.17 + blow * 0.04, -0.66 + fl], [-0.15 + blow * 0.06, -0.58]], false, 3), 0.066, SCARF, STRIPE, L, { every: 3, fringe: 0.06 });
        g.beginPath();
        g.roundRect(-0.32, y0 - 0.02 + hd * 0.5, 0.19, y1 - y0 + 0.05, 0.045);
        g.fillStyle = SCARF_D;
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = L;
        g.stroke();
        // the nose, in his head's frame
        g.translate(0, hd);
        g.rotate(pose.headTilt ?? 0);
        const nr = 0.082 * (cold.nose ?? 1);
        dot(g, 0.045, -1.225, nr, K.pink, L);
        dot(g, 0.02, -1.25, nr * 0.3, '#ffffff');
        g.restore();
    }

    return {
        mix, rot, cw, line, tube, dot, puffs, hit, band, lerp, clamp, smooth, SHADOW, NIGHT, WOOD, WOOD_T, WOOD_S, capOf,
        arrowPlank, billboard, PICS, FIELD, beams,
        G, view, toScreen, sky, ground, roadPt, stations, bed, ribbon, inBed, roll, rampH, tongue,
        headBack, headFlames, headFront, SHUT, exitSign, lever, leverTip, mallet, cone, barrier, blueprint, easel, devil, SCARF, STRIPE,
    };
})();
