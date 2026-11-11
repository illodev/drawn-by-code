// Props and sets of «breakad» (segments/breakad.js), the Devil's own TV spot: the imps with
// one arm up and one down, the soul jar (a small star in a jar), banknotes and their fan,
// coins, the piggy bank and its moths, the rotary telephone (dial, cradle, cord, receiver),
// the spider and its web, the banner, the crate, the cloud, a sweat drop, the grey kitchen of
// Hell, and what is drawn over the Devil's face (a clenched grin, a twitching eye).
//
// Props are drawn in logical units unless said otherwise; a prop that turns rotates its
// points and keeps the film's depth direction (Cast.D). Global: BreakAd. Depends on Cereal,
// Cast, Devil, Fx.
const BreakAd = (() => {
    const C = Cereal, K = C.COL, TAU = Math.PI * 2, D = Cast.D, DP = Devil.P;
    const Dd = (z) => [D[0] * z, D[1] * z];
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
    const shift = (pts, [dx, dy]) => pts.map(([x, y]) => [x + dx, y + dy]);
    const disc = (g, x, y, r, fill, lw = 3.2, ink = K.ink) => {
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
    const starPts = (x, y, r, a = 0, k = 0.46) => Array.from({ length: 10 }, (_, i) => {
        const an = a - Math.PI / 2 + (i / 10) * TAU, rad = i % 2 ? r * k : r;
        return [x + Math.cos(an) * rad, y + Math.sin(an) * rad];
    });
    // Run fn(L) in a prop's own units: (x, y) its origin, s logical units per unit.
    function units(g, x, y, s, fn) {
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
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
        g.lineCap = 'round';
        fn(3.2 / s);
        g.restore();
    }

    // Run fn(L) in the Devil's body space (his units, with his lean and squash).
    function onBody(g, x, y, s, pose, fn) {
        const q = pose.squash ?? 0;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        fn(3.2 / s);
        g.restore();
    }
    // The Devil's mitt once more, over what it holds (body space; the same block Devil.draw
    // ends the arm with). side −1: his right arm (screen left), 1: his left.
    function mitt(g, L, side, hand) {
        const sh = [side * 0.34, -0.84], dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6;
        const ux = dx / len, uy = dy / len, nx = -uy * 0.08, ny = ux * 0.08, a = Math.max(0.06, len - 0.075), b = len + 0.11;
        C.prism(g, cw([[sh[0] + ux * a + nx, sh[1] + uy * a + ny], [sh[0] + ux * b + nx, sh[1] + uy * b + ny], [sh[0] + ux * b - nx, sh[1] + uy * b - ny], [sh[0] + ux * a - nx, sh[1] + uy * a - ny]]), Dd(0.16), { front: DP.skin, top: DP.skinTop, side: DP.skinSide }, { lw: L, ink: DP.ink });
    }
    // His pointer: a long cane from its butt (a brass cap) to its brass tip (body space).
    function stick(g, L, a, b) {
        const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
        g.lineCap = 'butt';
        C.poly(g, [[a[0] - ux * L, a[1] - uy * L], [b[0] + ux * L, b[1] + uy * L]], { ink: DP.ink, lw: 0.05 + L * 2, close: false });
        g.lineCap = 'butt';
        g.strokeStyle = DP.hair;
        g.lineWidth = 0.05;
        g.beginPath();
        g.moveTo(a[0], a[1]);
        g.lineTo(b[0], b[1]);
        g.stroke();
        g.strokeStyle = DP.brass;
        g.beginPath();
        g.moveTo(b[0] - ux * 0.1, b[1] - uy * 0.1);
        g.lineTo(b[0], b[1]);
        g.moveTo(a[0], a[1]);
        g.lineTo(a[0] + ux * 0.05, a[1] + uy * 0.05);
        g.stroke();
        g.strokeStyle = DP.sheen;
        g.lineWidth = L * 0.8;
        g.beginPath();
        g.moveTo(a[0] + ux * 0.12 - uy * 0.008, a[1] + uy * 0.12 + ux * 0.008);
        g.lineTo(b[0] - ux * 0.16 - uy * 0.008, b[1] - uy * 0.16 + ux * 0.008);
        g.stroke();
        g.lineCap = 'round';
    }

    // =========================================================================================
    // Imps with independent arms
    // =========================================================================================
    // Devil.imp raises both mitts together. Here each half of the imp is drawn with its own
    // armUp (the two halves are the same drawing but for the arm), so one mitt can wave or
    // hold something up while the other hangs. pose: Devil.imp's, plus upL, upR (screen left
    // and right), tilt (a lean about its feet).
    function imp(g, x, y, s, pose = {}) {
        const { upL = 0, upR = 0, tilt = 0, shadow = true } = pose;
        g.save();
        g.translate(x, y);
        g.rotate(tilt);
        g.translate(-x, -y);
        if (shadow) {
            g.fillStyle = DP.shadow;
            g.beginPath();
            g.ellipse(x + 0.04 * s, y, 0.55 * s, 0.07 * s, 0, 0, TAU);
            g.fill();
        }
        for (const side of [-1, 1]) {
            g.save();
            g.beginPath();
            if (side < 0) g.rect(x - 4 * s, y - 4 * s, 4 * s + 0.5, 8 * s);
            else g.rect(x - 0.5, y - 4 * s, 4 * s, 8 * s);
            g.clip();
            Devil.imp(g, x, y, s, { ...pose, shadow: false, armUp: side < 0 ? upL : upR });
            g.restore();
        }
        g.restore();
    }
    // Where the end of a mitt is (logical units): what an imp holds up rests there.
    function impMitt(x, y, s, pose, side) {
        const q = pose.squash ?? 0, up = side < 0 ? pose.upL ?? 0 : pose.upR ?? 0;
        const sh = [side * 0.48, -0.46], hand = [side * 0.66, -0.4 - up * 0.5];
        const dx = hand[0] - sh[0], dy = hand[1] - sh[1], l = Math.hypot(dx, dy) || 1;
        const e = [(hand[0] + (dx / l) * 0.08 + D[0] * 0.07) * (1 + q), (hand[1] + (dy / l) * 0.08 + D[1] * 0.07) * (1 - q) - (pose.hop ?? 0)];
        const r = rot(e, pose.tilt ?? 0);
        return [x + r[0] * s, y + r[1] * s];
    }

    // =========================================================================================
    // The soul jar: a small star in a jar
    // =========================================================================================
    const JAR = { glass: '#c9f7f1', glassTop: '#f0fffc', glassSide: '#7fd9d0', shade: '#96e6de', glow: '#fff6ae', star: K.yellow, starLight: '#fff8b0', cork: '#c98a4b', corkTop: '#e6b77c', corkSide: '#96602c', corkDot: '#8a5a2e' };
    // (x, y) the middle of its base, h its height with the cork. o: { ang (a tilt about the
    // base), bob (−1..1 the star's place), tw (a drawing number: its twinkles alternate), star (false: empty) }
    function jar(g, x, y, h, o = {}) {
        const { ang = 0, bob = 0, tw = 0, star = true } = o;
        units(g, x, y, h, (L) => {
            const T = (pts) => pts.map((p) => rot(p, ang)), P1 = (px, py) => rot([px, py], ang), dd = Dd(0.16);
            const body = cw(T(C.curve([[-0.2, 0], [0.2, 0], [0.29, -0.05], [0.31, -0.3], [0.3, -0.52], [0.21, -0.68], [0.16, -0.74], [0.16, -0.79], [-0.16, -0.79], [-0.16, -0.74], [-0.21, -0.68], [-0.3, -0.52], [-0.31, -0.3], [-0.29, -0.05]], true, 5)));
            C.prism(g, body, dd, { front: JAR.glass, top: JAR.glassTop, side: JAR.glassSide }, { lw: L, sweepInk: null });
            g.save();
            C.trace(g, body);
            g.clip();
            line(g, [P1(0.215, -0.08), P1(0.23, -0.44)], JAR.shade, 0.05);
            if (star) {
                const c = P1(0, -0.36 + bob * 0.035);
                disc(g, c[0], c[1], 0.225, JAR.glow, 0);
                disc(g, c[0], c[1], 0.16, '#fffbd6', 0);
                const sp = starPts(c[0], c[1], 0.155, ang + bob * 0.12);
                C.poly(g, sp, { fill: JAR.star, lw: L * 0.9 });
                C.poly(g, [sp[0], sp[1], c, sp[9]], { fill: JAR.starLight, lw: 0 });
                C.poly(g, sp, { lw: L * 0.9 });
                // its face: two dots and a smile
                g.fillStyle = K.ink;
                for (const ex of [-0.04, 0.04]) {
                    const e = rot([ex, -0.012], ang);
                    g.beginPath();
                    g.arc(c[0] + e[0], c[1] + e[1], 0.014, 0, TAU);
                    g.fill();
                }
                line(g, [[-0.03, 0.028], [0, 0.046], [0.03, 0.028]].map((p) => { const q = rot(p, ang); return [c[0] + q[0], c[1] + q[1]]; }), K.ink, L * 0.7);
                const s1 = P1(0.17, -0.58), s2 = P1(-0.17, -0.16);
                if (tw % 2 === 0) C.sparkle(g, s1[0], s1[1], 0.06, { color: K.white });
                else C.sparkle(g, s2[0], s2[1], 0.05, { color: K.white });
            }
            // the glass's shine: a long streak and a short one
            line(g, [P1(-0.22, -0.14), P1(-0.22, -0.44)], '#ffffff', 0.04);
            line(g, [P1(-0.21, -0.52), P1(-0.2, -0.56)], '#ffffff', 0.04);
            g.restore();
            C.prismOutline(g, body, dd, { lw: L });
            // the rim, and the cork standing in it
            C.prism(g, cw(T([[-0.2, -0.86], [0.2, -0.86], [0.2, -0.78], [-0.2, -0.78]])), dd, { front: JAR.glassTop, top: '#ffffff', side: JAR.glassSide }, { lw: L });
            const cork = shift(cw(T([[-0.15, -1.0], [0.15, -1.0], [0.13, -0.86], [-0.13, -0.86]])), Dd(0.03));
            C.prism(g, cork, Dd(0.1), { front: JAR.cork, top: JAR.corkTop, side: JAR.corkSide }, { lw: L });
            g.fillStyle = JAR.corkDot;
            for (const [px, py] of [[-0.07, -0.95], [0.03, -0.91], [0.09, -0.965], [-0.02, -0.975]]) {
                const p = P1(px + 0.01, py - 0.006);
                g.beginPath();
                g.arc(p[0], p[1], 0.012, 0, TAU);
                g.fill();
            }
        });
    }

    // =========================================================================================
    // Cash: a banknote, a fan of them, a coin
    // =========================================================================================
    const NOTE = { face: '#a5ecae', band: '#35c46a', dark: '#1f8f4a', pale: '#ecfde6' };
    // (x, y) its middle, w its width (0.46 w tall), ang its turn. Paper: flat, no depth.
    function note(g, x, y, w, ang = 0, o = {}) {
        const h = w * 0.46, L = o.lw ?? 3.2;
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        g.lineJoin = 'round';
        C.poly(g, [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], { fill: NOTE.face, lw: L });
        // the frame, a medallion with a flame in it, a lozenge at each end
        g.strokeStyle = NOTE.band;
        g.lineWidth = w * 0.045;
        g.strokeRect(-w / 2 + w * 0.065, -h / 2 + w * 0.065, w - w * 0.13, h - w * 0.13);
        g.beginPath();
        g.ellipse(0, 0, w * 0.125, h * 0.34, 0, 0, TAU);
        g.fillStyle = NOTE.pale;
        g.fill();
        g.strokeStyle = NOTE.dark;
        g.lineWidth = L * 0.75;
        g.stroke();
        C.poly(g, [[0, -h * 0.2], [w * 0.05, h * 0.02], [w * 0.028, h * 0.17], [-w * 0.028, h * 0.17], [-w * 0.05, h * 0.02]], { fill: NOTE.band, lw: 0 });
        for (const sx of [-1, 1]) C.poly(g, [[sx * w * 0.3, -h * 0.17], [sx * w * 0.345, 0], [sx * w * 0.3, h * 0.17], [sx * w * 0.255, 0]], { fill: NOTE.dark, lw: 0 });
        g.restore();
    }
    // A fan of n banknotes held at (x, y); open 0..1 spreads it; lean turns the whole fan.
    function fan(g, x, y, w, open = 1, n = 5, lean = 0) {
        for (let i = 0; i < n; i++) {
            const a = lean + (n > 1 ? (i / (n - 1) - 0.5) : 0) * 1.5 * open;
            note(g, x + Math.sin(a) * w * 0.4, y - Math.cos(a) * w * 0.4, w, a - Math.PI / 2);
        }
    }
    const COIN = { face: K.gold, light: '#ffe37a', edge: '#c8860f', line: '#a86a08' };
    // turn: its drawing in the spin (0 face on, 1 and 3 three-quarter, 2 edge on)
    function coin(g, x, y, r, turn = 0) {
        const tn = ((turn % 4) + 4) % 4, L = 3;
        g.save();
        g.translate(x, y);
        if (tn === 2) {
            g.beginPath();
            g.roundRect(-r * 0.17, -r, r * 0.34, r * 2, r * 0.14);
            g.fillStyle = COIN.edge;
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = L;
            g.stroke();
            line(g, [[-r * 0.03, -r * 0.7], [-r * 0.03, r * 0.7]], COIN.light, 2.2);
        } else {
            const sx = tn === 0 ? 1 : 0.62, th = tn === 0 ? r * 0.12 : r * 0.24, dir = tn === 3 ? -1 : 1;
            g.beginPath();
            g.ellipse(dir * th, 0, r * sx, r, 0, 0, TAU);
            g.fillStyle = COIN.edge;
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = L;
            g.stroke();
            g.beginPath();
            g.ellipse(0, 0, r * sx, r, 0, 0, TAU);
            g.fillStyle = COIN.face;
            g.fill();
            g.stroke();
            g.beginPath();
            g.ellipse(0, 0, r * sx * 0.72, r * 0.72, 0, 0, TAU);
            g.strokeStyle = COIN.line;
            g.lineWidth = 2.2;
            g.stroke();
            C.poly(g, starPts(0, 0, r * 0.42).map(([px, py]) => [px * sx, py]), { fill: COIN.light, lw: 0 });
        }
        g.restore();
    }

    // =========================================================================================
    // The piggy bank and its moths
    // =========================================================================================
    const PIG = { front: '#ff9ccf', top: '#ffcbe6', side: '#e0669f', dark: '#c2457f', blush: '#ff6fb5', nose: '#ff7dbd', tape: '#fff1c4' };
    // (x, y) the middle of its body, s its length; ang turns it (π: upside down)
    function pig(g, x, y, s, o = {}) {
        const { ang = 0 } = o;
        units(g, x, y, s, (L) => {
            const T = (pts) => pts.map((p) => rot(p, ang)), P1 = (px, py) => rot([px, py], ang);
            const cols = { front: PIG.front, top: PIG.top, side: PIG.side }, far = { front: PIG.side, top: PIG.side, side: PIG.dark };
            const leg = (lx, z, c) => {
                C.prism(g, shift(cw(T([[lx - 0.075, 0.2], [lx + 0.075, 0.2], [lx + 0.075, 0.43], [lx - 0.075, 0.43]])), Dd(z)), Dd(0.13), c, { lw: L });
                C.poly(g, shift(cw(T([[lx - 0.075, 0.37], [lx + 0.075, 0.37], [lx + 0.075, 0.43], [lx - 0.075, 0.43]])), Dd(z)), { fill: PIG.dark, lw: L });
            };
            leg(-0.2, 0.2, far);
            leg(0.27, 0.2, far);
            // the curl of the tail
            const tl = T(C.curve([[-0.46, -0.06], [-0.56, -0.1], [-0.62, -0.02], [-0.56, 0.05], [-0.5, 0.0], [-0.56, -0.09], [-0.67, -0.11]], false, 6));
            line(g, tl, K.ink, 0.04 + L * 2);
            line(g, tl, PIG.front, 0.04);
            // the far ear
            C.poly(g, shift(T([[0.12, -0.28], [0.2, -0.5], [0.31, -0.28]]), Dd(0.22)), { fill: PIG.side, lw: L });
            const body = cw(T(C.ellipsePts(0, 0, 0.5, 0.36, 40)));
            C.prism(g, body, Dd(0.3), cols, { lw: L, sweepInk: null });
            C.prismOutline(g, body, Dd(0.3), { lw: L });
            line(g, T(C.curve([[-0.33, -0.17], [-0.2, -0.25], [-0.04, -0.28]], false, 6)), PIG.top, L * 1.7);
            // the coin slot
            line(g, T([[-0.1, -0.305], [0.07, -0.305]]), K.ink, 0.034);
            // a mend: two strips of tape crossed on its rump
            for (const a of [0.7, -0.7]) C.poly(g, T([[-0.09, -0.024], [0.09, -0.024], [0.09, 0.024], [-0.09, 0.024]].map((p) => { const q = rot(p, a); return [q[0] - 0.27, q[1] + 0.02]; })), { fill: PIG.tape, lw: L * 0.8 });
            leg(-0.28, 0, cols);
            leg(0.17, 0, cols);
            // the stopper in its belly
            C.prism(g, cw(T([[-0.07, 0.33], [0.07, 0.33], [0.055, 0.405], [-0.055, 0.405]])), Dd(0.1), { front: JAR.cork, top: JAR.corkTop, side: JAR.corkSide }, { lw: L });
            // the snout, with its two holes
            C.prism(g, cw(T([[0.4, -0.13], [0.6, -0.11], [0.6, 0.09], [0.4, 0.11]])), Dd(0.14), cols, { lw: L });
            C.poly(g, T(C.ellipsePts(0.6, -0.01, 0.05, 0.1, 18)), { fill: PIG.nose, lw: L });
            g.fillStyle = K.ink;
            for (const ny of [-0.045, 0.025]) {
                const p = P1(0.6, ny);
                g.beginPath();
                g.arc(p[0], p[1], 0.015, 0, TAU);
                g.fill();
            }
            // the near ear, the eye, a blush
            C.poly(g, T([[0.19, -0.26], [0.3, -0.52], [0.4, -0.2]]), { fill: PIG.front, lw: L });
            C.poly(g, T([[0.26, -0.28], [0.3, -0.43], [0.35, -0.26]]), { fill: PIG.side, lw: 0 });
            const e = P1(0.3, -0.09), gl = P1(0.29, -0.1);
            disc(g, e[0], e[1], 0.032, K.ink, 0);
            disc(g, gl[0], gl[1], 0.011, '#ffffff', 0);
            C.poly(g, T(C.ellipsePts(0.36, 0.05, 0.05, 0.034, 14)), { fill: PIG.blush, lw: 0 });
        });
    }
    const MOTH = { wing: '#e3d2ae', wingDark: '#b39b6f', body: '#6b5a44', spot: '#8d7a5c' };
    // (x, y) its middle, s its wingspan; flap 0 open, 1 half, 2 up
    function moth(g, x, y, s, flap = 0, ang = 0) {
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        g.scale(s, s);
        g.lineJoin = 'round';
        const L = 2.8 / s, k = [1, 0.62, 0.26][flap % 3];
        for (const sx of [-1, 1]) {
            C.poly(g, C.curve([[0.03, 0.0], [0.34 * k, 0.06], [0.4 * k, 0.3], [0.16 * k, 0.36], [0.03, 0.16]].map(([px, py]) => [px * sx, py]), true, 5), { fill: MOTH.wingDark, lw: L });
            C.poly(g, C.curve([[0.03, -0.12], [0.36 * k, -0.42], [0.5 * k, -0.2], [0.42 * k, 0.03], [0.04, 0.05]].map(([px, py]) => [px * sx, py]), true, 5), { fill: MOTH.wing, lw: L });
            disc(g, sx * 0.3 * k, -0.17, 0.05 * Math.max(0.5, k), MOTH.spot, 0);
            line(g, C.curve([[sx * 0.02, -0.2], [sx * 0.07, -0.33], [sx * 0.15, -0.37]], false, 5), K.ink, L * 0.9);
        }
        g.beginPath();
        g.ellipse(0, 0, 0.06, 0.2, 0, 0, TAU);
        g.fillStyle = MOTH.body;
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = L;
        g.stroke();
        g.restore();
    }

    // =========================================================================================
    // The rotary telephone
    // =========================================================================================
    const PH = { front: '#e3262b', top: '#ff6a5c', side: '#a3161f', dark: '#7d0f18', shine: '#ff9d8f', dial: '#fff1c4', hole: '#d2b877', wheel: '#fffdf4', chrome: '#d5dbea', cord: '#4a4470', cordLight: '#8a84b8', foot: '#2a2438', footTop: '#4a4470' };
    // (x, y) the middle of its base on what it stands on, s its width. o: { lift (the receiver's
    // hop, in its units), turn (the dial's turn) }. Returns where things hang from it (logical units).
    function phone(g, x, y, s, o = {}) {
        const { lift = 0, turn = 0 } = o, zr = 0.14;
        units(g, x, y, s, (L) => {
            const z = 0.42, dd = Dd(z), cols = { front: PH.front, top: PH.top, side: PH.side };
            for (const fx of [-0.4, 0.4]) C.box(g, fx - 0.07, -0.035, 0.14, 0.035, D, { front: PH.foot, top: PH.footTop, side: PH.foot }, { lw: L, depth: z });
            const body = cw([[-0.5, -0.035], [-0.5, -0.17], [-0.34, -0.58], [0.34, -0.58], [0.5, -0.17], [0.5, -0.035]]);
            C.prism(g, body, dd, cols, { lw: L });
            line(g, [[-0.5, -0.17], [0.5, -0.17]], PH.side, L * 1.3);
            line(g, [[-0.42, -0.24], [-0.335, -0.46]], PH.shine, L * 1.7);
            // the dial: a plate, the finger wheel with its ten holes, the stop, the hub
            const dc = [0, -0.365], R = 0.178;
            disc(g, dc[0] + 0.012, dc[1] + 0.014, R, PH.dark, 0);
            disc(g, dc[0], dc[1], R, PH.dial, L);
            disc(g, dc[0], dc[1], R * 0.86, PH.wheel, L * 0.7);
            for (let i = 0; i < 10; i++) {
                const a = turn + ((8 - i * 30) * Math.PI) / 180;
                disc(g, dc[0] + Math.cos(a) * R * 0.6, dc[1] + Math.sin(a) * R * 0.6, R * 0.13, PH.hole, L * 0.7);
            }
            const sa = (53 * Math.PI) / 180, s0 = [dc[0] + Math.cos(sa) * R * 1.05, dc[1] + Math.sin(sa) * R * 1.05], s1 = [dc[0] + Math.cos(sa - 0.1) * R * 0.52, dc[1] + Math.sin(sa - 0.1) * R * 0.52];
            line(g, [s0, s1], K.ink, 0.026 + L * 1.6);
            line(g, [s0, s1], PH.chrome, 0.026);
            disc(g, dc[0], dc[1], R * 0.3, PH.front, L * 0.8);
            disc(g, dc[0], dc[1], R * 0.1, K.gold, L * 0.6);
            // the cradle on the top deck: two forks and the plunger between them
            const o1 = Dd(0.12);
            C.box(g, -0.04 + o1[0], -0.62 + o1[1], 0.08, 0.04, D, { front: PH.dial, top: PH.wheel, side: PH.hole }, { lw: L * 0.8, depth: 0.1 });
            for (const fx of [-0.21, 0.21]) C.box(g, fx - 0.07 + o1[0], -0.675 + o1[1], 0.14, 0.095, D, cols, { lw: L, depth: 0.18 });
            // the cord: a coil from the mouthpiece down to the floor and back to the body's side
            const path = C.curve([[0.55, -0.47 - lift], [0.6, -0.3], [0.71, -0.14], [0.76, -0.03], [0.66, 0.0], [0.6, -0.05], [0.585, -0.1]], false, 12), coil = [];
            path.forEach((p, i) => {
                const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1, ph = i * 1.25;
                const k = Math.min(1, i / 4, (path.length - 1 - i) / 4) * 0.03;
                coil.push([p[0] + (tx / l) * Math.cos(ph) * k * 0.9 - (ty / l) * Math.sin(ph) * k, p[1] + (ty / l) * Math.cos(ph) * k * 0.9 + (tx / l) * Math.sin(ph) * k]);
            });
            const coilS = C.curve(coil, false, 3);
            line(g, coilS, K.ink, 0.017 + L * 1.7);
            line(g, coilS, PH.cord, 0.017);
            disc(g, 0.585, -0.1, 0.022, PH.foot, L * 0.7);
            // the receiver across the forks: a handle and two cups
            const rec = [[-0.52, -0.77], [-0.26, -0.805], [0, -0.815], [0.26, -0.805], [0.52, -0.77], [0.62, -0.72], [0.655, -0.53], [0.635, -0.49], [0.425, -0.49], [0.4, -0.53], [0.4, -0.665], [0.22, -0.705], [0, -0.715], [-0.22, -0.705], [-0.4, -0.665], [-0.4, -0.53], [-0.425, -0.49], [-0.635, -0.49], [-0.655, -0.53], [-0.62, -0.72]];
            const rp = shift(cw(rec.map(([px, py]) => [px, py - lift])), Dd(zr));
            C.prism(g, rp, Dd(0.16), cols, { lw: L, sweepInk: null });
            C.prismOutline(g, rp, Dd(0.16), { lw: L });
            const ro = Dd(zr);
            line(g, C.curve([[-0.34, -0.772], [-0.17, -0.79], [0, -0.795]], false, 6).map(([px, py]) => [px + ro[0], py + ro[1] - lift]), PH.shine, L * 1.6);
            for (const sx of [-1, 1]) {
                line(g, [[sx * 0.425 + ro[0], -0.545 + ro[1] - lift], [sx * 0.63 + ro[0], -0.545 + ro[1] - lift]], PH.side, L * 1.2);
                line(g, [[sx * 0.4 + ro[0], -0.665 + ro[1] - lift], [sx * 0.615 + ro[0], -0.69 + ro[1] - lift]], PH.side, L);
            }
        });
        const P = (px, py) => [x + px * s, y + py * s], ro = Dd(zr);
        return { cup: P(-0.53 + ro[0], -0.49 + ro[1] - lift), nook: P(-0.5, -0.035), flank: P(-0.4, -0.42), top: P(0, -0.84 - lift), dial: P(0, -0.365), mouth: P(0.53 + ro[0], -0.49 + ro[1] - lift) };
    }

    // A quarter web in a corner at (cx, cy): spokes between the angles a0 and a1, rings that
    // sag towards the corner. grow 0..1 spins it: the spokes first, then ring after ring.
    function web(g, cx, cy, R, a0, a1, grow = 1, lens = [1, 0.86, 0.94, 0.8, 1]) {
        if (grow <= 0) return;
        const n = lens.length, sp = Math.min(1, grow / 0.35), rings = [0.3, 0.52, 0.74, 0.93];
        const dir = (i) => a0 + ((a1 - a0) * i) / (n - 1);
        const at = (i, f) => [cx + Math.cos(dir(i)) * R * lens[i] * f, cy + Math.sin(dir(i)) * R * lens[i] * f];
        const strokes = [];
        for (let i = 0; i < n; i++) strokes.push([[cx, cy], at(i, sp)]);
        const nr = Math.max(0, Math.min(rings.length, Math.floor(((grow - 0.35) / 0.65) * rings.length + 1e-6)));
        for (let k = 0; k < nr; k++) {
            for (let i = 0; i < n - 1; i++) {
                const a = at(i, rings[k]), b = at(i + 1, rings[k]), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], q = [m[0] + (cx - m[0]) * 0.2, m[1] + (cy - m[1]) * 0.2];
                strokes.push(Array.from({ length: 7 }, (_, j) => {
                    const u = j / 6, v = 1 - u;
                    return [v * v * a[0] + 2 * u * v * q[0] + u * u * b[0], v * v * a[1] + 2 * u * v * q[1] + u * u * b[1]];
                }));
            }
        }
        for (const st of strokes) line(g, st, K.ink, 5);
        for (const st of strokes) line(g, st, K.white, 2.2);
    }

    const SPIDER = { body: '#4a4470', light: '#6c66a0', dark: '#2a2438' };
    // (x, y) where the thread meets its back, s its body's width. o: { d (a drawing number: the
    // legs fidget), look (−1..1), blink, wave (0..1 lifts a front leg) }
    function spider(g, x, y, s, o = {}) {
        const { d = 0, look = 0, blink = false, wave = 0 } = o;
        g.save();
        g.translate(x, y + s * 0.5);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        const L = 3 / s, w = d % 2 ? 0.035 : -0.035;
        for (const sx of [-1, 1]) {
            for (let i = 0; i < 4; i++) {
                const up = i === 0 && sx > 0 ? wave : 0, wg = (i + (sx > 0 ? 1 : 0)) % 2 ? w : -w;
                const leg = [[sx * 0.4, -0.12 + i * 0.13], [sx * (0.78 + i * 0.02), -0.4 + i * 0.22 + wg - up * 0.25], [sx * (0.98 - i * 0.05), -0.02 + i * 0.26 + wg * 2 - up * 0.75]];
                line(g, leg, K.ink, 0.085 + L);
                line(g, leg, SPIDER.dark, 0.05);
            }
        }
        disc(g, 0, 0, 0.5, SPIDER.body, L);
        g.save();
        g.beginPath();
        g.arc(0, 0, 0.5, 0, TAU);
        g.clip();
        disc(g, -0.14, -0.3, 0.3, SPIDER.light, 0);
        g.restore();
        disc(g, 0, 0, 0.5, null, L);
        for (const sx of [-1, 1]) {
            if (blink) line(g, [[sx * 0.2 - 0.11, 0.06], [sx * 0.2 + 0.11, 0.06]], K.ink, L * 1.3);
            else {
                g.beginPath();
                g.ellipse(sx * 0.2, 0.05, 0.14, 0.17, 0, 0, TAU);
                g.fillStyle = K.white;
                g.fill();
                g.strokeStyle = K.ink;
                g.lineWidth = L * 0.8;
                g.stroke();
                disc(g, sx * 0.2 + look * 0.05, 0.08, 0.065, K.ink, 0);
            }
        }
        g.restore();
    }

    // =========================================================================================
    // A banner (a ribbon with folded tails), a cloud, a sweat drop, a crate, a card
    // =========================================================================================
    function banner(g, cx, cy, w, h, ang = 0, o = {}) {
        const { face = K.white, fold = '#8f88c9', tail = '#d9d4f2', trim = K.pink } = o;
        g.save();
        g.translate(cx, cy);
        g.rotate(ang);
        g.lineJoin = 'round';
        for (const sx of [-1, 1]) {
            const x0 = sx * (w / 2 - h * 0.34), x1 = sx * (w / 2 + h * 0.52), y0 = -h / 2 + h * 0.24, y1 = h / 2 + h * 0.24;
            C.poly(g, [[x0, y0], [x1, y0], [x1 - sx * h * 0.28, (y0 + y1) / 2], [x1, y1], [x0, y1]], { fill: tail, lw: 3.2 });
            C.poly(g, [[sx * w / 2, h / 2], [x0, h / 2], [x0, y1]], { fill: fold, lw: 3.2 });
        }
        C.poly(g, [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], { fill: face, lw: 3.2 });
        for (const sy of [-1, 1]) line(g, [[-w / 2 + 10, sy * (h / 2 - h * 0.1)], [w / 2 - 10, sy * (h / 2 - h * 0.1)]], trim, 3.2);
        g.restore();
    }
    // lobes: [[x, y, r], …] in units of s; a flat base under them
    const CLOUD = [[-0.9, 0.05, 0.42], [-0.42, -0.2, 0.52], [0.12, -0.34, 0.6], [0.66, -0.12, 0.46], [1.02, 0.1, 0.34]];
    function cloud(g, x, y, s, o = {}) {
        const { lobes = CLOUD, fill = K.white, under = '#cfc9f5', base = 0.32 } = o;
        const body = new Path2D();
        let x0 = 1e9, x1 = -1e9;
        for (const [lx, ly, lr] of lobes) {
            body.arc(x + lx * s, y + ly * s, lr * s, 0, TAU);
            x0 = Math.min(x0, lx - lr * 0.55);
            x1 = Math.max(x1, lx + lr * 0.55);
        }
        body.roundRect(x + x0 * s, y, (x1 - x0) * s, base * s, base * s * 0.5);
        g.save();
        g.strokeStyle = K.ink;
        g.lineWidth = 6.4;
        g.lineJoin = 'round';
        g.stroke(body);
        g.fillStyle = fill;
        g.fill(body);
        g.clip(body);
        g.fillStyle = under;
        g.fillRect(x - 3 * s, y + base * s * 0.45, 6 * s, s);
        g.restore();
    }
    function drop(g, x, y, r, ang = 0, lw = 2.6) {
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        C.poly(g, C.curve([[0, -1.5], [0.42, -0.5], [0.72, 0.25], [0.48, 0.85], [0, 1], [-0.48, 0.85], [-0.72, 0.25], [-0.42, -0.5]].map(([px, py]) => [px * r, py * r]), true, 5), { fill: K.aqua, lw });
        g.beginPath();
        g.ellipse(-r * 0.26, r * 0.3, r * 0.14, r * 0.26, 0.3, 0, TAU);
        g.fillStyle = '#ffffff';
        g.fill();
        g.restore();
    }
    const WOOD = { front: '#b9814a', top: '#d7a468', side: '#8a5a2e', dark: '#5e3b1c', in: '#4a2c12' };
    // An open crate, (x, y) the middle of its front's foot. Draw crateBack, what is in it, crateFront.
    function crateBack(g, x, y, w, h, dep = 0.5) {
        const d = Dd(w * dep);
        C.poly(g, [[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2 + d[0], y - h + d[1]], [x - w / 2 + d[0], y - h + d[1]]], { fill: WOOD.in, lw: 3.2 });
        C.poly(g, [[x - w / 2 + d[0], y - h + d[1]], [x + w / 2 + d[0], y - h + d[1]], [x + w / 2 + d[0], y - h * 0.5 + d[1]], [x - w / 2 + d[0], y - h * 0.5 + d[1]]], { fill: WOOD.dark, lw: 0 });
        line(g, [[x - w / 2 + d[0], y - h + d[1]], [x + w / 2 + d[0], y - h + d[1]]], K.ink, 3.2);
    }
    function crateFront(g, x, y, w, h, dep = 0.5) {
        const d = Dd(w * dep);
        C.poly(g, [[x + w / 2, y - h], [x + w / 2 + d[0], y - h + d[1]], [x + w / 2 + d[0], y + d[1]], [x + w / 2, y]], { fill: WOOD.side, lw: 3.2 });
        C.poly(g, [[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y], [x - w / 2, y]], { fill: WOOD.front, lw: 3.2 });
        // three planks and the two battens that hold them, a nail in each crossing
        for (const k of [1 / 3, 2 / 3]) line(g, [[x - w / 2 + 2, y - h * k], [x + w / 2 - 2, y - h * k]], WOOD.side, 2.6);
        for (const sx of [-1, 1]) {
            C.poly(g, [[x + sx * w * 0.36 - w * 0.06, y - h], [x + sx * w * 0.36 + w * 0.06, y - h], [x + sx * w * 0.36 + w * 0.06, y], [x + sx * w * 0.36 - w * 0.06, y]], { fill: WOOD.top, lw: 2.6 });
            for (const k of [1 / 6, 0.5, 5 / 6]) disc(g, x + sx * w * 0.36, y - h * k, 2.6, WOOD.dark, 0);
        }
    }
    // A blank white card, (x, y) the middle of its lower edge
    function card(g, x, y, w, h, ang = 0) {
        const pts = cw([[-w / 2, -h], [w / 2, -h], [w / 2, 0], [-w / 2, 0]].map((p) => { const q = rot(p, ang); return [x + q[0], y + q[1]]; }));
        C.prism(g, pts, [4.5, -3], { front: K.white, top: '#ffffff', side: '#cfc9e6' }, { lw: 3.2 });
    }

    // =========================================================================================
    // On the Devil's face (head space, see onHead): a clenched grin, a twitching lid, the tooth
    // =========================================================================================
    const MY = -1.1, EY = -1.36; // his mouth's and eyes' heights
    // The salesman's grin with the teeth shut: both rows, the gold one still showing.
    function tightGrin(g, L) {
        const my = MY, open = 0.1;
        const upper = C.curve([[-0.31, my - 0.07], [-0.16, my - 0.005], [0, my + 0.012], [0.16, my - 0.005], [0.31, my - 0.07]], false, 6);
        const lower = C.curve([[0.31, my - 0.07], [0.19, my + open * 0.72], [0, my + open], [-0.19, my + open * 0.72], [-0.31, my - 0.07]], false, 6);
        const m = [...upper, ...lower.slice(1, -1)];
        const bite = C.curve([[-0.3, my - 0.055], [-0.16, my + 0.03], [0, my + 0.056], [0.16, my + 0.03], [0.3, my - 0.055]], false, 6);
        C.poly(g, m, { fill: DP.tooth, lw: 0 });
        g.save();
        C.trace(g, m);
        g.clip();
        g.fillStyle = DP.gold;
        g.fillRect(0.081, my - 0.1, 0.072, 0.2);
        C.poly(g, [...bite, [0.4, my + 0.2], [-0.4, my + 0.2]], { fill: DP.tooth, lw: 0 });
        g.strokeStyle = DP.ink;
        g.lineWidth = L * 0.6;
        g.beginPath();
        for (let i = -3; i <= 3; i++) {
            g.moveTo(i * 0.078 + 0.003, my - 0.1);
            g.lineTo(i * 0.078 + 0.003, my + 0.045 - Math.abs(i) * 0.012);
            g.moveTo(i * 0.078 + 0.042, my + 0.05 - Math.abs(i + 0.5) * 0.012);
            g.lineTo(i * 0.078 + 0.042, my + 0.12);
        }
        g.stroke();
        line(g, bite, DP.ink, L * 0.9);
        g.restore();
        C.poly(g, m, { ink: DP.ink, lw: L });
    }
    // His left eye (screen right) twitching: the lower lid jumps up. k 0..1 how far.
    function twitch(g, L, k = 1) {
        const ex = 0.21, ey = EY, top = ey + 0.085 - 0.11 * k;
        C.poly(g, [[ex - 0.115, top + 0.012], [ex + 0.115, top - 0.022], [ex + 0.115, ey + 0.1], [ex - 0.115, ey + 0.1]], { fill: DP.skin, lw: 0 });
        line(g, [[ex - 0.115, top + 0.012], [ex + 0.115, top - 0.022]], DP.ink, L * 1.3);
        line(g, [[ex + 0.15, ey + 0.0], [ex + 0.2, ey - 0.03]], DP.ink, L);
        line(g, [[ex + 0.15, ey + 0.05], [ex + 0.205, ey + 0.055]], DP.ink, L);
    }
    const TOOTH = [0.117, -1.068]; // the gold tooth, in head space

    // =========================================================================================
    // The kitchen of Hell (in colour; the segment drains it)
    // =========================================================================================
    const KIT = { wall: '#8a1a2c', wallD: '#6a1221', wallL: '#a82338', tileA: '#fff1c4', tileB: '#2fc4b4', cab: '#7d47e1', cabTop: '#a888f5', cabSide: '#5a2fb5', cabLine: '#5a2fb5', slab: '#fff1c4', slabTop: '#fffdf4', slabSide: '#dcc690', iron: '#4a4470', ironTop: '#6c66a0', ironSide: '#2f2940', floorA: '#5a2a86', floorB: '#3f1d66', chrome: '#d5dbea', chromeD: '#8d95ad' };
    const FL = 782; // where the wall meets the floor
    function kitchen(g, t) {
        const d = C.drawing(t);
        g.fillStyle = KIT.wall;
        g.fillRect(-200, -200, 1400, 1400);
        const r = Motion.rng('k-rock');
        for (let i = 0; i < 22; i++) {
            const x = -100 + r() * 1200, y = -60 + r() * 420, w = 50 + r() * 90, h = 30 + r() * 50, lit = r() < 0.3;
            C.poly(g, [[x, y], [x + w * 0.6, y - h * 0.4], [x + w, y + h * 0.2], [x + w * 0.5, y + h * 0.7]], { fill: lit ? KIT.wallL : KIT.wallD, lw: 0 });
        }
        // stalactites along the ceiling
        const rs = Motion.rng('k-stal');
        for (let x = -60; x < 1100; x += 70 + rs() * 50) {
            const w = 24 + rs() * 20, h = 44 + rs() * 60;
            C.prism(g, [[x - w, -40], [x + w, -40], [x, h]], [7, -5], { front: KIT.wallD, top: KIT.wallD, side: '#4a0c17' }, { lw: 4 });
        }
        // the window: Hell outside
        const win = new Path2D();
        win.moveTo(70, 470);
        win.lineTo(70, 290);
        win.quadraticCurveTo(70, 190, 160, 190);
        win.quadraticCurveTo(250, 190, 250, 290);
        win.lineTo(250, 470);
        win.closePath();
        g.save();
        g.clip(win);
        C.sunburst(g, 160, 480, { n: 10, rot: t * 0.15, a: '#ff5a3c', b: K.orange });
        for (const [sx, sh] of [[100, 120], [150, 76], [222, 140]]) C.poly(g, [[sx - 22, 470], [sx - 6, 470 - sh], [sx + 8, 470 - sh * 0.8], [sx + 24, 470]], { fill: '#7a1626', lw: 3 });
        g.restore();
        g.strokeStyle = K.ink;
        g.lineWidth = 16;
        g.stroke(win);
        g.strokeStyle = KIT.wallL;
        g.lineWidth = 9;
        g.stroke(win);
        line(g, [[160, 192], [160, 470]], K.ink, 9);
        line(g, [[160, 192], [160, 470]], KIT.wallL, 4);
        C.box(g, 56, 468, 208, 18, [10, -7], { front: KIT.wallL, top: '#c43349', side: KIT.wallD }, { lw: 4 });
        // the tiles behind the counter, two of them gone and one cracked
        const tx0 = 300, ty0 = 392, ts = 58;
        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < 13; i++) {
                if ((i === 3 && j === 1) || (i === 9 && j === 0)) continue;
                g.fillStyle = (i + j) % 2 ? KIT.tileA : KIT.tileB;
                g.fillRect(tx0 + i * ts, ty0 + j * ts, ts, ts);
            }
        }
        g.strokeStyle = K.ink;
        g.lineWidth = 2.4;
        g.beginPath();
        for (let j = 0; j <= 4; j++) {
            g.moveTo(tx0, ty0 + j * ts);
            g.lineTo(tx0 + 13 * ts, ty0 + j * ts);
        }
        for (let i = 0; i <= 13; i++) {
            g.moveTo(tx0 + i * ts, ty0);
            g.lineTo(tx0 + i * ts, ty0 + 4 * ts);
        }
        g.stroke();
        for (const [i, j] of [[3, 1], [9, 0]]) {
            g.fillStyle = KIT.wallD;
            g.fillRect(tx0 + i * ts + 1.2, ty0 + j * ts + 1.2, ts - 2.4, ts - 2.4);
        }
        line(g, [[tx0 + 6 * ts + 8, ty0 + 2 * ts + 6], [tx0 + 6 * ts + 26, ty0 + 2 * ts + 24], [tx0 + 6 * ts + 20, ty0 + 2 * ts + 36], [tx0 + 6 * ts + 44, ty0 + 2 * ts + 52]], K.ink, 2.4);
        // a rail with a pan and a ladle
        line(g, [[330, 312], [560, 312]], K.ink, 11);
        line(g, [[330, 312], [560, 312]], KIT.chrome, 5);
        for (const hx of [336, 554]) disc(g, hx, 312, 7, KIT.chromeD, 3);
        line(g, [[400, 314], [400, 392]], K.ink, 13);
        line(g, [[400, 314], [400, 392]], KIT.iron, 7);
        C.drum(g, 400, 436, 46, [7, -5], { front: KIT.iron, side: KIT.ironSide }, { lw: 3.2 });
        disc(g, 400, 436, 33, KIT.ironTop, 2.6);
        line(g, [[500, 314], [500, 420]], K.ink, 10);
        line(g, [[500, 314], [500, 420]], KIT.chrome, 4.5);
        C.poly(g, C.ellipsePts(500, 440, 26, 22, 20), { fill: KIT.chrome, lw: 3.2 });
        C.poly(g, C.ellipsePts(497, 437, 15, 11, 16), { fill: KIT.chromeD, lw: 0 });
        // a shelf with an empty pot and two empty jars
        C.box(g, 640, 300, 300, 16, [16, -11], { front: '#b9814a', top: '#d7a468', side: '#8a5a2e' }, { lw: 3.2 });
        for (const bx of [668, 906]) C.poly(g, [[bx, 316], [bx + 14, 316], [bx, 346]], { fill: '#8a5a2e', lw: 3.2 });
        C.prism(g, [[676, 230], [776, 230], [766, 296], [686, 296]], [10, -7], { front: KIT.iron, top: KIT.ironSide, side: KIT.ironSide }, { lw: 3.2 });
        C.box(g, 668, 222, 116, 12, [10, -7], { front: KIT.ironTop, top: KIT.ironSide, side: KIT.iron }, { lw: 3.2 });
        jar(g, 836, 296, 78, { star: false });
        jar(g, 900, 296, 62, { star: false });
        // the counter: cupboards, a slab on top, a sink with a dripping tap, the stove with a cold cauldron
        C.box(g, 280, 624, 760, FL - 624, [0, 0], { front: KIT.cab }, { lw: 3.2 });
        for (let i = 0; i < 6; i++) {
            const dx = 296 + i * 122;
            if (i === 3 || i === 4) continue;
            C.poly(g, [[dx, 644], [dx + 106, 644], [dx + 106, FL - 14], [dx, FL - 14]], { fill: KIT.cabTop, lw: 3.2 });
            C.poly(g, [[dx + 12, 656], [dx + 94, 656], [dx + 94, FL - 26], [dx + 12, FL - 26]], { fill: KIT.cab, ink: KIT.cabLine, lw: 2.6 });
            disc(g, dx + (i % 2 ? 18 : 88), 712, 7, K.yellow, 2.6);
        }
        // the stove
        C.box(g, 662, 624, 244, FL - 624, [0, 0], { front: KIT.iron }, { lw: 3.2 });
        C.poly(g, [[684, 676], [884, 676], [884, FL - 18], [684, FL - 18]], { fill: KIT.ironSide, lw: 3.2 });
        C.poly(g, [[704, 694], [864, 694], [864, FL - 36], [704, FL - 36]], { fill: '#1c1727', lw: 2.6 });
        line(g, [[700, 684], [868, 684]], K.ink, 9);
        line(g, [[700, 684], [868, 684]], KIT.chrome, 4);
        for (const kx of [700, 746, 822, 868]) disc(g, kx, 650, 10, K.yellow, 2.6);
        C.box(g, 268, 598, 780, 26, [26, -18], { front: KIT.slab, top: KIT.slabTop, side: KIT.slabSide }, { lw: 3.2 });
        // the sink's basin in the slab, the tap over it
        C.poly(g, [[292, 594], [440, 594], [454, 584], [306, 584]], { fill: KIT.chromeD, lw: 3.2 });
        const tap = C.curve([[412, 590], [412, 540], [400, 520], [376, 520], [364, 534], [364, 548]], false, 6);
        line(g, tap, K.ink, 15);
        line(g, tap, KIT.chrome, 9);
        C.poly(g, [[402, 592], [422, 592], [422, 578], [402, 578]], { fill: KIT.chromeD, lw: 3 });
        const dr = (d % 12) / 12;
        if (dr < 0.4) drop(g, 364, 558 + dr * 60, 5);
        // the burner and the cauldron on it, cold
        C.poly(g, [[720, 592], [860, 592], [872, 584], [732, 584]], { fill: KIT.ironSide, lw: 3.2 });
        const pot = cw(C.curve([[742, 500], [840, 500], [856, 530], [850, 572], [820, 588], [762, 588], [732, 572], [726, 530]], true, 5));
        for (const hx of [722, 860]) {
            g.beginPath();
            g.arc(hx + 5, 528, 13, 0, TAU);
            g.strokeStyle = K.ink;
            g.lineWidth = 10;
            g.stroke();
            g.strokeStyle = KIT.ironTop;
            g.lineWidth = 4.4;
            g.stroke();
        }
        C.prism(g, pot, [12, -8], { front: KIT.iron, top: KIT.ironSide, side: KIT.ironSide }, { lw: 3.2, sweepInk: null });
        C.prismOutline(g, pot, [12, -8], { lw: 3.2 });
        C.box(g, 730, 492, 122, 12, [12, -8], { front: KIT.ironTop, top: '#1c1727', side: KIT.iron }, { lw: 3.2 });
        line(g, [[748, 520], [744, 560]], KIT.ironTop, 4);
        // the floor: chequered, receding up and to the right like everything else
        g.fillStyle = KIT.floorB;
        g.fillRect(-200, FL, 1400, 500);
        g.save();
        g.beginPath();
        g.rect(-200, FL, 1400, 500);
        g.clip();
        const rowH = 46, colW = 104;
        for (let j = 0; j < 6; j++) {
            const y0 = FL + j * rowH, y1 = y0 + rowH;
            for (let i = -4; i < 16; i++) {
                if ((i + j) % 2) continue;
                const xa = i * colW, sl = 1.5;
                C.poly(g, [[xa - (y0 - FL) * sl, y0], [xa + colW - (y0 - FL) * sl, y0], [xa + colW - (y1 - FL) * sl, y1], [xa - (y1 - FL) * sl, y1]], { fill: KIT.floorA, lw: 0 });
            }
        }
        g.restore();
        line(g, [[-200, FL], [1200, FL]], K.ink, 4);
    }
    // The kitchen table in front, with what is for dinner: a fish bone on a plate
    function table(g, x, y, w) {
        const top = y - 150, dep = [44, -30];
        for (const [lx, z] of [[x - w / 2 + 16, 1], [x + w / 2 - 16, 1], [x - w / 2 + 16, 0], [x + w / 2 - 16, 0]]) C.box(g, lx - 9 + dep[0] * z, top + dep[1] * z, 18, 150, [5, -3.4], { front: z ? '#8a5a2e' : '#b9814a', top: '#d7a468', side: z ? '#5e3b1c' : '#8a5a2e' }, { lw: 3.2 });
        C.box(g, x - w / 2, top - 16, w, 18, dep, { front: '#b9814a', top: '#d7a468', side: '#8a5a2e' }, { lw: 3.2 });
        const px = x + 20, py = top - 30;
        g.beginPath();
        g.ellipse(px, py + 4, 76, 17, 0, 0, TAU);
        g.fillStyle = '#cfc9e6';
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = 3.2;
        g.stroke();
        g.beginPath();
        g.ellipse(px, py, 76, 17, 0, 0, TAU);
        g.fillStyle = K.white;
        g.fill();
        g.stroke();
        g.beginPath();
        g.ellipse(px, py, 52, 10, 0, 0, TAU);
        g.strokeStyle = '#cfc9e6';
        g.lineWidth = 2.6;
        g.stroke();
        // the fish bone: a head, a spine with ribs, a tail
        const fb = [[px - 34, py - 2], [px + 26, py - 2]];
        line(g, fb, K.ink, 7);
        for (let i = 0; i < 4; i++) line(g, [[px - 16 + i * 11, py - 9], [px - 16 + i * 11, py + 5]], K.ink, 6);
        C.poly(g, [[px - 50, py - 2], [px - 32, py - 11], [px - 32, py + 7]], { fill: K.white, lw: 3 });
        C.poly(g, [[px + 24, py - 2], [px + 40, py - 11], [px + 36, py - 2], [px + 40, py + 7]], { fill: K.white, lw: 3 });
        line(g, fb, K.white, 2.6);
        for (let i = 0; i < 4; i++) line(g, [[px - 16 + i * 11, py - 9], [px - 16 + i * 11, py + 5]], K.white, 2.2);
        disc(g, px - 38, py - 3, 1.8, K.ink, 0);
    }

    return { units, onHead, onBody, mitt, stick, disc, starPts, imp, impMitt, jar, note, fan, coin, pig, moth, phone, web, spider, banner, cloud, CLOUD, drop, crateBack, crateFront, card, tightGrin, twitch, TOOTH, EY, MY, kitchen, table, FL, KIT };
})();
