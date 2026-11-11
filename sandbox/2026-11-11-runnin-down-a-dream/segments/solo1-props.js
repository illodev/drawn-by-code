// Props of «solo1» (segments/solo1.js), the duel that becomes a duet: Mike turned to face either
// way and with an eyebrow he can raise, the two kinds of note (his clean ones, the Devil's jagged
// ones on fire), what they do when they meet (a burst, stars), the braid they make together, and
// the venue starting to shake (dust and stones off the roof, a crack across the stage, the lake
// swelling behind).
// Units as in cast.js for the figure; everything else is drawn in the frame's units.
// Global: Solo1Props. Depends on Cereal, Cast, BandStrings, BridgeProps (its flame), Inferno (its colours).
const Solo1Props = (() => {
    const C = Cereal, K = C.COL, D = Cast.D, Dd = Cast.Dd, PI = Math.PI, TAU = PI * 2;
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    // mx = -1 lays the points out mirrored about the figure's middle (the solid is still swept with the cast's D)
    const place = (pts, a, o, sc = 1, mx = 1) => pts.map((p) => {
        const q = rot(p, a);
        return [mx * (q[0] * sc + o[0]), q[1] * sc + o[1]];
    });
    const cw = (pts) => {
        let a = 0;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i], q = pts[(i + 1) % pts.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return a > 0 ? pts : pts.slice().reverse();
    };
    const mix = (a, b, u) => a + (b - a) * u;
    const clamp01 = (u) => Math.max(0, Math.min(1, u));
    const line = (g, pts, lw, ink = K.ink) => C.poly(g, pts, { ink, lw, close: false });
    const MIKE = BandStrings.MIKE, solid = BandStrings.solid, arm = BandStrings.arm;

    // =========================================================================================
    // Mike, turned. band-strings.js keeps his head, torso and guitar to itself and draws him one
    // way only (the neck to screen right). What follows down to `mike` is that file's own drawing,
    // line for line, with two additions: `mx` lays the guitar out mirrored, and the face takes
    // `brow` (0..1). With face 'right' and no brow it paints the same pixels as BandStrings.mike.
    // =========================================================================================
    // Slot eyes under half lids, a hooked nose, a mouth: the cast's face, on a panel.
    //   F: { ey, my, ex (half the distance between the eyes) }
    function features(g, P, L, o, F) {
        const { ey, my, ex: exo } = F, mx = 0, brow = o.brow ?? 0;
        {
            for (const s of [-1, 1]) {
                const mode = brow > 0.5 && s === 1 ? 'wide' : o.eyes, low = s === -1 ? 0.04 * brow : 0; // one eyebrow up: his left eye (screen right) opens wide, the other lid comes down
                const ex = s * exo, ew = 0.075, eh = mode === 'wide' ? 0.19 : 0.16;
                if (mode === 'shut') {
                    C.poly(g, [[ex - 0.06, ey + 0.03], [ex, ey + 0.055], [ex + 0.06, ey + 0.03]], { ink: P.eye, lw: L * 1.1, close: false });
                    continue;
                }
                g.fillStyle = P.eye;
                g.fillRect(ex - ew / 2, ey - eh / 2, ew, eh);
                g.fillStyle = P.glint;
                g.fillRect(ex - ew / 2 + 0.012, ey - eh / 2 + (mode === 'wide' ? 0.02 : 0.062), 0.028, 0.03);
                if (mode !== 'wide') {
                    g.fillStyle = P.skin;
                    g.fillRect(ex - ew / 2 - 0.02, ey - eh / 2 - 0.01, ew + 0.04, 0.058 + low);
                    C.poly(g, [[ex - ew / 2 - 0.025, ey - eh / 2 + 0.05 + low], [ex + ew / 2 + 0.025, ey - eh / 2 + 0.046 + low]], { ink: P.ink, lw: L * 0.9, close: false });
                }
            }
        }
        C.poly(g, [[0.012, ey + 0.05], [0.012, ey + 0.145], [0.05, ey + 0.145]], { ink: P.ink, lw: L * 0.85, close: false });
        if (o.mouth === 'sing') {
            const mw = 0.2, mh = 0.13;
            g.save();
            g.beginPath();
            g.roundRect(mx - mw / 2, my - mh / 2 + 0.01, mw, mh, [0.02, 0.02, 0.06, 0.06]);
            g.fillStyle = P.mouth;
            g.fill();
            g.clip();
            g.fillStyle = P.tongue;
            g.beginPath();
            g.ellipse(mx + 0.01, my + mh / 2 + 0.02, 0.075, 0.05, 0, 0, TAU);
            g.fill();
            g.restore();
            g.beginPath();
            g.roundRect(mx - mw / 2, my - mh / 2 + 0.01, mw, mh, [0.02, 0.02, 0.06, 0.06]);
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.9;
            g.stroke();
        } else if (o.mouth === 'o') {
            g.beginPath();
            g.ellipse(mx, my + 0.01, 0.05, 0.062, 0, 0, TAU);
            g.fillStyle = P.mouth;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.9;
            g.stroke();
        } else if (o.mouth === 'grin') {
            C.poly(g, [[-0.11, my - 0.02], [-0.05, my + 0.03], [0.05, my + 0.03], [0.11, my - 0.02]], { ink: P.ink, lw: L, close: false });
        } else {
            C.poly(g, [[-0.09, my + 0.012], [0.03, my + 0.018], [0.1, my - 0.03]], { ink: P.ink, lw: L, close: false });
        }
    }

    const M_HEAD = { w: 0.84, h: 0.9, top: -1.84, d: 0.44, fx: 0.27 };
    const M_TORSO = { x: -0.35, y: -0.98, w: 0.7, h: 0.62, d: 0.4 };
    const NECK = -0.95; // the head tilts about this height
    const HIP = -0.38; // the upper body leans back about this height for the solo

    // The hair is the box: straight, shaggy, cut in layers (each layer's ragged end sticks out
    // at the sides), a jagged hem at the collar and a heavy fringe down to the eyes.
    function mikeHead(g, P, L, o = {}) {
        const { w, h, top, d, fx } = M_HEAD, x0 = -w / 2, x1 = w / 2, bot = top + h, sw = o.sway ?? 0;
        const hair = [
            [x0, top - 0.04], [x1, top - 0.04],
            [x1 + 0.028, top + 0.33], [x1 - 0.006, top + 0.39], [x1 + 0.05 + sw * 0.3, top + 0.7], [x1 + 0.012 + sw * 0.3, top + 0.755], [x1 + 0.075 + sw * 0.7, bot],
            [x1 + 0.095 + sw, bot + 0.105], [x1 + 0.005 + sw, bot + 0.03], [x1 - 0.035 + sw, bot + 0.12], [x1 - 0.085 + sw * 0.8, bot + 0.02], [fx + 0.014 + sw * 0.6, bot + 0.09], [fx, bot - 0.07],
            [-fx, bot - 0.07], [-fx - 0.02 + sw * 0.6, bot + 0.075], [x0 + 0.075 + sw * 0.8, bot + 0.012], [x0 + 0.03 + sw, bot + 0.105], [x0 - 0.01 + sw, bot + 0.025], [x0 - 0.09 + sw, bot + 0.09],
            [x0 - 0.07 + sw * 0.7, bot - 0.02], [x0 - 0.012 + sw * 0.3, top + 0.73], [x0 - 0.05 + sw * 0.3, top + 0.67], [x0 + 0.006, top + 0.41], [x0 - 0.028, top + 0.35],
        ];
        solid(g, hair, Dd(d), { front: P.hair, top: P.hairTop, side: P.hairSide }, { lw: L, ink: P.ink, tone: (i) => (i === 0 ? 'top' : 'side') });
        // strands: the layers' ends on the side locks
        g.strokeStyle = P.hairLine;
        g.lineWidth = L * 0.7;
        g.lineCap = 'round';
        g.beginPath();
        for (const [ax, ay, bx, by, k] of [
            [fx + 0.06, top + 0.42, fx + 0.075, top + 0.6, 0.2], [fx + 0.045, top + 0.66, fx + 0.07, bot + 0.0, 0.5], [fx + 0.105, top + 0.8, fx + 0.12, bot + 0.04, 0.8],
            [-fx - 0.055, top + 0.45, -fx - 0.07, top + 0.62, 0.2], [-fx - 0.05, top + 0.69, -fx - 0.075, bot + 0.01, 0.5], [-fx - 0.115, top + 0.78, -fx - 0.125, bot + 0.02, 0.8],
        ]) {
            g.moveTo(ax + sw * k * 0.5, ay);
            g.lineTo(bx + sw * k, by);
        }
        g.stroke();
        // the face: lean, with a long jaw
        const fy = top + 0.2, F = { ey: top + 0.535, my: top + 0.765, ex: 0.148, fx, fy, bot };
        C.poly(g, [[-fx, fy], [fx, fy], [fx, bot - 0.21], [fx - 0.115, bot - 0.005], [-fx + 0.115, bot - 0.005], [-fx, bot - 0.21]], { fill: P.skin, ink: P.ink, lw: L });
        features(g, P, L, o, F);
        // the fringe: choppy points down to the eyes, which look out between them
        const ey = F.ey;
        // with an eyebrow up, the fringe over that eye lifts off it
        const bl = 0.15 * (o.brow ?? 0);
        const hem = [[-fx - 0.004, ey - 0.085], [-0.215, ey - 0.04], [-0.15, ey - 0.165], [-0.075, ey - 0.055], [-0.02, ey - 0.15], [0.045, ey - 0.07 - bl * 0.45], [0.13, ey - 0.175 - bl * 0.8], [0.205, ey - 0.05 - bl * 1.15], [fx + 0.004, ey - 0.11 - bl * 0.7]];
        C.poly(g, [[-fx - L * 0.6, hem[0][1]], ...hem, [fx + L * 0.6, hem[hem.length - 1][1]], [fx + L * 0.6, fy - L], [-fx - L * 0.6, fy - L]], { fill: P.hair, lw: 0 });
        C.poly(g, hem, { ink: P.ink, lw: L, close: false });
        g.strokeStyle = P.hairLine;
        g.lineWidth = L * 0.7;
        g.beginPath();
        for (const [ax, ay, bx, by] of [[-0.19, top + 0.08, -0.2, ey - 0.13], [-0.06, top + 0.02, -0.075, ey - 0.15], [0.07, top + 0.06, 0.05, ey - 0.16], [0.2, top + 0.1, 0.2, ey - 0.14], [-0.31, top + 0.16, -0.325, top + 0.3], [0.32, top + 0.2, 0.33, top + 0.31]]) {
            g.moveTo(ax, ay);
            g.lineTo(bx, by);
        }
        g.stroke();
        if (bl > 0.01) {
            // the eyebrow itself: a dark bar on the skin the fringe has let go of, its outer end up
            const k = o.brow;
            g.save();
            g.translate(F.ex + 0.012, ey - 0.118 - 0.045 * k);
            g.rotate(-0.2 * k);
            C.poly(g, [[-0.085, -0.019], [0.085, -0.023], [0.085, 0.019], [-0.085, 0.021]], { fill: P.eye, lw: 0 });
            g.restore();
        }
    }

    // The bandana round the neck, worn as a kerchief: a band under the chin whose point hangs
    // off centre. Deep blue-violet for black, with a white border line and white dots.
    function bandana(g, P, L) {
        const b = M_HEAD.top + M_HEAD.h;
        const cloth = [[-0.3, b - 0.07], [0.3, b - 0.07], [0.305, b + 0.02], [0.2, b + 0.062], [0.1, b + 0.1], [-0.02, b + 0.205], [-0.15, b + 0.1], [-0.3, b + 0.035]];
        C.poly(g, cloth, { fill: P.bandana, ink: P.ink, lw: L });
        g.save();
        C.trace(g, cloth);
        g.clip();
        // the border, parallel to the hem, and the pattern
        C.poly(g, [[0.33, b - 0.022], [0.19, b + 0.028], [0.09, b + 0.066], [-0.02, b + 0.162], [-0.135, b + 0.07], [-0.32, b + 0.002]], { ink: P.dot, lw: L * 0.65, close: false });
        g.fillStyle = P.dot;
        for (const [dx, dy, r] of [[-0.025, 0.1, 0.021], [-0.09, 0.035, 0.016], [0.04, 0.035, 0.017], [-0.21, 0.005, 0.012], [0.15, 0.0, 0.015], [-0.025, 0.03, 0.009], [0.245, -0.035, 0.012], [-0.15, -0.015, 0.009], [0.09, -0.02, 0.009], [0.035, 0.09, 0.008], [-0.085, 0.09, 0.008]]) {
            g.beginPath();
            g.arc(dx, b + dy, r, 0, TAU);
            g.fill();
        }
        g.restore();
    }

    function mikeTorso(g, P, L) {
        const { x, y, w, h, d } = M_TORSO;
        C.box(g, x, y, w, h, D, { front: P.jacket, top: P.jacketTop, side: P.jacketSide }, { lw: L, ink: P.ink, depth: d });
        // the tee in the open jacket, with its small red print
        C.poly(g, [[-0.2, y], [0.2, y], [0.15, y + h], [-0.15, y + h]], { fill: P.tee, ink: P.ink, lw: L * 0.8 });
        g.fillStyle = P.print;
        g.beginPath();
        g.roundRect(0.03, y + 0.12, 0.17, 0.055, 0.014);
        g.roundRect(0.05, y + 0.19, 0.13, 0.02, 0.006);
        g.fill();
        // the lapels
        for (const s of [-1, 1]) C.poly(g, [[s * 0.2, y], [s * 0.31, y], [s * 0.27, y + 0.24], [s * 0.16, y + 0.42]], { fill: P.lapel, ink: P.ink, lw: L * 0.8 });
    }

    // --- Mike's guitar ------------------------------------------------------------------
    // A solid-body with two cutaways (the upper horn the longer one), cream, with a dark
    // guard, three single-coil pickups (the bridge one slanted), three knobs, a maple neck
    // and six tuners in a line. Local frame: the neck runs along +x, the origin is the
    // middle of the body, the low strings are up (-y) as the player wears it.
    const S_BODY = [[-0.385, -0.01], [-0.345, -0.19], [-0.21, -0.275], [-0.03, -0.238], [0.11, -0.25], [0.28, -0.297], [0.395, -0.282], [0.36, -0.2], [0.26, -0.125], [0.215, -0.06],
        [0.215, 0.06], [0.25, 0.125], [0.325, 0.205], [0.335, 0.27], [0.24, 0.285], [0.1, 0.245], [-0.05, 0.25], [-0.21, 0.3], [-0.35, 0.215]];
    const S_GUARD = [[0.225, -0.115], [0.06, -0.112], [-0.11, -0.105], [-0.215, -0.09], [-0.225, 0.09], [-0.3, 0.17], [-0.26, 0.245], [-0.1, 0.24], [0.05, 0.2], [0.2, 0.235], [0.275, 0.215], [0.235, 0.12]];
    const S_HEAD = [[0.9, -0.046], [0.955, -0.064], [1.01, -0.086], [1.2, -0.096], [1.268, -0.072], [1.287, -0.03], [1.262, 0.008], [1.2, 0.02], [1.09, 0.014], [1.0, 0.034], [0.9, 0.046]];
    const S_NUT = 0.9, S_END = 0.15; // the nut and the fretboard's end over the body
    function strat(g, P, L0, at, ang, sc = 1, mx = 1) {
        const L = L0 / sc, th = Dd(0.09);
        const body = cw(place(C.curve(S_BODY, true, 6), ang, at, sc, mx));
        const neck = cw(place([[0.18, -0.046], [S_NUT, -0.036], [S_NUT, 0.036], [0.18, 0.046]], ang, at, sc, mx));
        const hs = cw(place(C.curve(S_HEAD, true, 4), ang, at, sc, mx));
        // the neck, then the six tuner buttons in a line and the headstock in front of them
        C.prism(g, neck, th, { front: P.gNeck, top: P.gNeckSide, side: P.gNeckSide }, { lw: L0, ink: P.ink });
        g.save();
        g.translate(mx * at[0], at[1]);
        g.scale(mx, 1);
        g.rotate(ang);
        g.scale(sc, sc);
        for (let i = 0; i < 6; i++) {
            g.beginPath();
            g.roundRect(1.0 + i * 0.045 - 0.014, -0.142 - i * 0.002, 0.028, 0.058, 0.008);
            g.fillStyle = P.chrome;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.65;
            g.stroke();
        }
        g.restore();
        C.prism(g, hs, th, { front: P.gHead, top: P.gNeckSide, side: P.gNeckSide }, { lw: L0, ink: P.ink, sweepInk: null });
        C.prismOutline(g, hs, th, { lw: L0, ink: P.ink });
        C.prism(g, body, th, { front: P.gBody, top: P.gSide, side: P.gSide }, { lw: L0, ink: P.ink, sweepInk: null });
        C.prismOutline(g, body, th, { lw: L0, ink: P.ink });
        g.save();
        g.translate(mx * at[0], at[1]);
        g.scale(mx, 1);
        g.rotate(ang);
        g.scale(sc, sc);
        C.poly(g, C.curve(S_GUARD, true, 5), { fill: P.gGuard, ink: P.ink, lw: L * 0.8 });
        // the bridge plate with its saddles
        g.beginPath();
        g.roundRect(-0.285, -0.07, 0.06, 0.14, 0.012);
        g.fillStyle = P.chrome;
        g.fill();
        g.strokeStyle = P.ink;
        g.lineWidth = L * 0.8;
        g.stroke();
        g.fillStyle = P.chromeDark;
        g.fillRect(-0.262, -0.052, 0.016, 0.104);
        // three pickups: cream covers with the poles as a dark line
        for (const [px, pa] of [[0.045, 0], [-0.06, 0], [-0.165, 0.2]]) {
            g.save();
            g.translate(px, 0);
            g.rotate(pa);
            g.beginPath();
            g.roundRect(-0.021, -0.078, 0.042, 0.156, 0.02);
            g.fillStyle = P.gCover;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.75;
            g.stroke();
            C.poly(g, [[0, -0.05], [0, 0.05]], { ink: P.chromeDark, lw: L * 0.6, close: false });
            g.restore();
        }
        // three knobs and the selector switch
        for (const [kx, ky] of [[-0.085, 0.15], [-0.15, 0.185], [-0.215, 0.205]]) {
            g.beginPath();
            g.arc(kx, ky, 0.023, 0, TAU);
            g.fillStyle = P.gKnob;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.7;
            g.stroke();
        }
        C.poly(g, [[0.03, 0.135], [0.085, 0.17]], { ink: P.chromeDark, lw: L * 1.5, close: false });
        // the fretboard over the body, frets and dots
        C.poly(g, [[S_END, -0.046], [S_NUT, -0.036], [S_NUT, 0.036], [S_END, 0.046]], { fill: P.gNeck, ink: P.ink, lw: L * 0.8 });
        const fretX = (i) => S_NUT - (S_NUT - S_END) * (1 - Math.pow(0.9, i)) / (1 - Math.pow(0.9, 12));
        g.strokeStyle = P.gFret;
        g.lineWidth = L * 0.55;
        g.lineCap = 'butt';
        g.beginPath();
        for (let i = 1; i <= 11; i++) {
            g.moveTo(fretX(i), -0.037);
            g.lineTo(fretX(i), 0.037);
        }
        g.stroke();
        g.lineCap = 'round';
        g.fillStyle = P.gDot;
        for (const i of [3, 5, 7, 9]) {
            g.beginPath();
            g.arc((fretX(i) + fretX(i - 1)) / 2, 0, 0.0085, 0, TAU);
            g.fill();
        }
        // six strings: light over the guard, dark over the maple
        const sy = (i, k) => (i - 2.5) * 0.0118 * k;
        for (const [xa, xb, ka, kb, col] of [[-0.255, S_END, 1.32, 1.07, P.string], [S_END, S_NUT, 1.07, 1, P.stringDark]]) {
            g.strokeStyle = col;
            g.lineWidth = L * 0.38;
            g.beginPath();
            for (let i = 0; i < 6; i++) {
                g.moveTo(xa, sy(i, ka));
                g.lineTo(xb, sy(i, kb));
            }
            g.stroke();
        }
        C.poly(g, [[S_NUT, -0.036], [S_NUT, 0.036]], { ink: P.ink, lw: L * 1.5, close: false });
        C.poly(g, [[S_NUT, -0.031], [S_NUT, 0.031]], { ink: P.gNut, lw: L * 0.8, close: false });
        // the six posts on the face, each with its string
        for (let i = 0; i < 6; i++) {
            const tx = 1.0 + i * 0.045, ty = -0.058 - i * 0.002;
            g.strokeStyle = P.stringDark;
            g.lineWidth = L * 0.3;
            g.beginPath();
            g.moveTo(S_NUT, sy(i, 1));
            g.lineTo(tx, ty);
            g.stroke();
            g.beginPath();
            g.arc(tx, ty, 0.0095, 0, TAU);
            g.fillStyle = P.chrome;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.6;
            g.stroke();
        }
        g.restore();
    }

    // Where everything is for a pose (BandStrings' mikeRig, either way round).
    function mikeRig(pose) {
        const solo = clamp01(pose.solo ?? 0), mx = pose.face === 'left' ? -1 : 1;
        const gAt = [mix(-0.19, 0.0, solo), mix(-0.49, -0.47, solo)], gAng = mix(-0.3, -0.84, solo), gSc = 0.78;
        const onG = (p) => {
            const r = rot(p, gAng);
            return [mx * (r[0] * gSc + gAt[0]), r[1] * gSc + gAt[1]];
        };
        const sx = M_TORSO.x + M_TORSO.w - 0.03, sy = M_TORSO.y + 0.13;
        return {
            solo, mx, gAt, gAng, gSc, onG, shN: [mx * sx, sy], shF: [-mx * sx, sy], // the neck side's shoulder and the other
            back: -0.15 * solo * mx, fwd: 0.07 * solo * mx,
            fret: onG([0.5 + 0.3 * (pose.fret ?? 0.3), 0.03]),
            hand: onG([0.15, (pose.strum ?? 0) * 0.1 - 0.035]),
        };
    }
    /**
     * Mike with his guitar, as BandStrings.mike, plus:
     *   face   'right' (default: the neck to screen right) | 'left' (he has turned: the neck to screen left,
     *          the solo stance leans him back to the right)
     *   brow   0..1: one eyebrow up (his left, on screen right): that eye opens wide, the fringe lifts off it,
     *          the other lid comes down
     *   fret   may run past BandStrings' 0..1: -1 is up by the body
     *   shadow false to leave it out
     */
    function mike(g, x, y, s, pose = {}, P = MIKE) {
        const L = 3.2 / s, q = pose.squash ?? 0, R = mikeRig(pose), mx = R.mx;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        if (pose.shadow !== false) {
            g.fillStyle = P.shadow;
            g.beginPath();
            g.ellipse(0.05, 0.0, 0.56 * (1 + q), 0.06, 0, 0, TAU);
            g.fill();
        }
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        Cast.legs(g, P, L);
        g.translate(R.fwd, HIP);
        g.rotate(R.back);
        g.translate(0, -HIP + 0.025 * R.solo);
        mikeTorso(g, P, L);
        // the strap, from the neck side's shoulder down behind the neck's heel
        const heel = R.onG([0.3, -0.06]);
        C.poly(g, [[mx * 0.255, M_TORSO.y + 0.015], [mx * 0.335, M_TORSO.y + 0.015], [heel[0] + mx * 0.06, heel[1]], [heel[0] - mx * 0.025, heel[1]]], { fill: P.strap, ink: P.ink, lw: L * 0.7 });
        bandana(g, P, L);
        g.save();
        g.translate(0, NECK + (pose.headDy ?? 0));
        g.rotate((pose.headTilt ?? 0) - 0.07 * R.solo * mx);
        g.translate(0, -NECK);
        mikeHead(g, P, L, pose);
        g.restore();
        strat(g, P, L, R.gAt, R.gAng, R.gSc, mx);
        const sleeve = { sleeve: P.jacket, sleeveTop: P.jacketTop, sleeveSide: P.jacketSide, cuff: P.cuff };
        arm(g, P, L, R.shN, R.fret, sleeve, { fold: true, roll: 0.46 });
        arm(g, P, L, R.shF, R.hand, sleeve, { fold: true, roll: 0.46 });
        g.restore();
    }
    // BandStrings.points('mike', pose) for either way round: headTop, mouth, strings, headstock, bodyEnd, fretHand, pickHand
    function mikePoints(pose = {}) {
        if (pose.face !== 'left') return BandStrings.points('mike', pose);
        const p = BandStrings.points('mike', { ...pose, lean: -(pose.lean ?? 0) });
        return Object.fromEntries(Object.entries(p).map(([k, v]) => [k, [-v[0], v[1]]]));
    }

    // =========================================================================================
    // The two kinds of note
    // =========================================================================================
    // Mike's: clean and bright. Cereal.note as a solid (a face, a side going up to the right), a white
    // shine. (x, y) the middle of its head; s the head's size; kind 1 an eighth, 2 a beamed pair;
    // tone 0 yellow on gold, 1 white on aqua, 2 aqua on teal.
    const CLEAN = [[K.yellow, K.gold], [K.white, K.sky], [K.aqua, K.teal]];
    function cleanNote(g, x, y, s, ang = 0, kind = 1, tone = 0) {
        const [face, side] = CLEAN[tone % 3];
        C.note(g, x + 0.2 * s, y - 0.14 * s, s, { color: side, kind, rot: ang, lw: 3.2 });
        C.note(g, x + 0.1 * s, y - 0.07 * s, s, { color: side, kind, rot: ang, ink: null });
        C.note(g, x, y, s, { color: face, kind, rot: ang, lw: 3.2 });
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        const sh = tone === 1 ? K.sky : K.white;
        line(g, [[-0.24 * s, -0.08 * s], [-0.04 * s, -0.19 * s]], 2.8, sh);
        if (kind === 2) line(g, [[0.52 * s, -1.56 * s], [1.34 * s, -1.79 * s]], 2.4, sh);
        g.restore();
    }
    // The Devil's: an eighth note forged like his fork: a head with barbs, a stem that kinks like a
    // bolt, a flag that is a tongue of flame; red with a hot core, and on fire: a flame trails behind
    // it (`trail` is the angle it is flying along; null: no fire). d: the drawing, for the flame.
    const JAG = [[-0.6, 0.04], [-0.36, -0.12], [-0.46, -0.42], [-0.16, -0.3], [-0.02, -0.52], [0.16, -0.32], [0.3, -0.4], [0.3, -0.98], [0.16, -1.1], [0.32, -1.26], [0.26, -1.94],
        [0.56, -1.66], [0.98, -1.72], [1.26, -1.2], [1.02, -1.36], [1.1, -0.88], [0.8, -1.16], [0.52, -1.22], [0.52, -1.04], [0.66, -0.92], [0.5, -0.8], [0.5, -0.1], [0.66, 0.08], [0.42, 0.14],
        [0.4, 0.42], [0.12, 0.28], [-0.08, 0.5], [-0.26, 0.24], [-0.54, 0.34], [-0.42, 0.12]];
    const CORE = [[-0.3, 0.02], [-0.14, -0.06], [-0.16, -0.22], [0.0, -0.14], [0.12, -0.2], [0.14, 0.02], [0.24, 0.1], [0.06, 0.12], [0.0, 0.26], [-0.12, 0.12]];
    function fireNote(g, x, y, s, ang = 0, d = 0, trail = null) {
        g.save();
        g.lineJoin = 'round';
        if (trail != null) {
            // the fire it drags: two tongues from behind the head, streaming back along its path
            g.save();
            g.translate(x, y);
            g.rotate(trail - PI / 2);
            BridgeProps.flame(g, 0.12 * s, -0.1 * s, 1.9 * s, d, 0);
            BridgeProps.flame(g, -0.2 * s, -0.2 * s, 1.2 * s, d + 1, 2);
            g.restore();
        }
        g.translate(x, y);
        g.rotate(ang + (d % 2 ? 0.05 : -0.05));
        C.prism(g, cw(JAG.map(([px, py]) => [px * s, py * s])), [0.2 * s, -0.14 * s], { front: K.red, top: K.orange, side: '#a3122a' }, { lw: 3.2 });
        C.poly(g, CORE.map(([px, py]) => [px * s, py * s]), { fill: d % 2 ? K.yellow : K.gold, lw: 0 });
        line(g, [[0.41 * s, -0.3 * s], [0.41 * s, -0.84 * s]], 2.6, K.orange);
        line(g, [[0.5 * s, -1.5 * s], [0.84 * s, -1.5 * s]], 2.6, K.orange);
        g.restore();
    }

    // =========================================================================================
    // Where two notes meet
    // =========================================================================================
    // a five-pointed star: (x, y) its middle, r its points
    function star(g, x, y, r, ang = 0, fill = K.yellow, lw = 3) {
        const pts = [];
        for (let i = 0; i < 10; i++) {
            const a = ang - PI / 2 + (i * TAU) / 10, rad = i % 2 ? r * 0.46 : r;
            pts.push([x + Math.cos(a) * rad, y + Math.sin(a) * rad]);
        }
        C.poly(g, pts, { fill, ink: K.ink, lw });
    }
    // The clash: on its first drawing a white burst with a yellow heart; then the burst is gone and
    // seven stars fly out, turning and shrinking. age in drawings (0 …), r its size, seed a string.
    function clash(g, x, y, r, age, seed = 'clash') {
        if (age < 0 || age > 5) return;
        if (age < 2) {
            const k = age === 0 ? 0.8 : 1.15;
            C.burst(g, x, y, { r0: r * 0.52 * k, r1: r * k, n: 9, seed, fill: K.white, ink: K.ink, lw: 3.2, rot: age * 0.3 });
            C.burst(g, x, y, { r0: r * 0.28 * k, r1: r * 0.56 * k, n: 7, seed: seed + 'h', fill: age === 0 ? K.yellow : K.pink, ink: K.ink, lw: 2.4, rot: 0.4 });
        }
        if (age < 1) return;
        const rr = Motion.rng(seed + 's'), u = (age - 1) / 4;
        for (let i = 0; i < 7; i++) {
            const a = (i / 7) * TAU + rr() * 0.6, sp = r * (0.9 + rr() * 0.9), sz = r * (0.2 + rr() * 0.14) * (1 - u * 0.55);
            const px = x + Math.cos(a) * sp * (0.55 + 1.2 * u), py = y + Math.sin(a) * sp * (0.55 + 1.2 * u) + r * 0.9 * u * u;
            star(g, px, py, sz, a + age * 0.5, [K.yellow, K.white, K.rose, K.aqua][i % 4], 2.6);
        }
    }

    // =========================================================================================
    // The braid: the two streams as one
    // =========================================================================================
    // Two ribbons twisted round each other from (x, y0) up to y1 (y1 < y0), one gold, one red, a note
    // riding every crossing: clean ones on the gold, flaming ones on the red, turn and turn about.
    //   o: { top (0..1: how far up it has grown), ph (its turn, in half twists: it climbs as ph grows),
    //        amp (half its width at the foot), amp1 (at the top), pitch (the height of a half twist), d (the drawing), s (the notes' size) }
    function braid(g, x, y0, y1, o = {}) {
        const { top = 1, ph = 0, amp = 30, amp1 = 60, pitch = 92, d = 0, s = 17 } = o;
        const H = (y0 - y1) * clamp01(top);
        if (H < 4) return;
        const at = (h, sg) => {
            const v = h / (y0 - y1), a = mix(amp, amp1, v) * Math.min(1, h / 40);
            return [x + sg * a * Math.sin((h / pitch - ph) * PI), y0 - h];
        };
        const front = (h) => Math.cos((h / pitch - ph) * PI) > 0; // is the gold strand the near one here
        // the ribbons, a half twist at a time from the foot: the far strand first
        const cuts = [0];
        for (let k = Math.ceil(-ph - 0.5 + 1e-6); (k + 0.5 + ph) * pitch < H; k++) cuts.push((k + 0.5 + ph) * pitch); // where a strand swings widest
        cuts.sort((a, b) => a - b);
        cuts.push(H);
        const ribbon = (h0, h1, sg) => {
            const pts = [];
            for (let h = h0; h < h1; h += 8) pts.push(at(h, sg));
            pts.push(at(h1, sg));
            line(g, pts, 13.5);
            line(g, pts, 7.5, sg > 0 ? K.gold : K.red);
            line(g, pts, 2.4, sg > 0 ? K.cream : K.orange);
        };
        for (let i = 0; i < cuts.length - 1; i++) {
            const h0 = cuts[i], h1 = cuts[i + 1], f = front((h0 + h1) / 2);
            if (h1 - h0 < 1) continue;
            ribbon(Math.max(0, h0 - 4), h1, f ? -1 : 1);
            ribbon(Math.max(0, h0 - 4), h1, f ? 1 : -1);
        }
        // the notes, one where each strand swings widest, climbing with the twist; the highest first
        const kMax = Math.floor(H / pitch - ph + 0.5) + 1;
        for (let k = kMax; k >= Math.ceil(-ph - 0.5); k--) {
            const h = (k + ph) * pitch + pitch / 2;
            if (h < 26 || h > H - 10) continue;
            const j = ((k % 2) + 2) % 2, sg = Math.sin((h / pitch - ph) * PI) > 0 ? 1 : -1; // which side the gold strand is on here
            const pg = at(h, 1), pr = at(h, -1), grow = Math.min(1, h / 90);
            if (j) {
                fireNote(g, pr[0], pr[1] + 8, s * grow, -sg * 0.25, d + k, null);
                cleanNote(g, pg[0], pg[1] + 8, s * grow, sg * 0.25, 1 + (((k >> 1) % 2) + 2) % 2, ((k % 3) + 3) % 3);
            } else {
                cleanNote(g, pg[0], pg[1] + 8, s * grow, sg * 0.25, 1 + (((k >> 1) % 2) + 2) % 2, ((k % 3) + 3) % 3);
                fireNote(g, pr[0], pr[1] + 8, s * grow, -sg * 0.25, d + k, null);
            }
        }
    }

    // =========================================================================================
    // The venue starts to shake
    // =========================================================================================
    const ROCK = Inferno.R;
    // What comes off the roof: thin falls of dust (a trickle with a puff at its head) and stones.
    //   t: seconds since it began;  k 0..1 how much;  box: [x0, x1, yTop, yFloor] in the frame
    function dust(g, t, k, box = [60, 940, -20, 860]) {
        const [x0, x1, yT, yF] = box, r = Motion.rng('solo1-dust'), n = 16;
        g.save();
        g.lineJoin = 'round';
        g.lineCap = 'round';
        for (let i = 0; i < n; i++) {
            const x = x0 + ((i + 0.2 + r() * 0.6) / n) * (x1 - x0), from = r() * 2.2, every = 0.7 + r() * 0.5, stone = i % 3 === 1, size = 0.7 + r() * 0.6;
            if (i / n > k * 1.05 + 0.05 || t < from * (1 - k * 0.55)) continue;
            const t2 = Math.floor((t - from * (1 - k * 0.55)) * 12 + 1e-6) / 12, u = (t2 % every) / every, turn = Math.floor(t2 / every);
            if (stone) {
                // a stone: it drops, turning, and is gone below the stage's edge
                const y = yT + (yF + 80 - yT) * u * u, a = turn + u * 7, sz = 9 * size + 3;
                const pts = [[-1, -0.5], [-0.2, -1], [0.9, -0.6], [1, 0.4], [0.2, 1], [-0.8, 0.7]].map((p) => {
                    const q = rot([p[0] * sz, p[1] * sz], a);
                    return [x + q[0], y + q[1]];
                });
                if (y < yF) {
                    C.prism(g, cw(pts), [sz * 0.36, -sz * 0.24], { front: ROCK.wall, top: ROCK.top, side: ROCK.wallD }, { lw: 2.6 });
                    line(g, [[x - 3, y - sz - 16], [x - 3, y - sz - 34 - 20 * u]], 2.2, ROCK.top);
                }
            } else {
                // a trickle: dashes under a puff that sinks and thins
                const head = yT + (yF * 0.72 - yT) * Math.min(1, u * 1.5), len = 60 + 110 * size;
                g.strokeStyle = '#f2b59c';
                g.lineWidth = 2.6;
                g.beginPath();
                for (let j = 0; j < 4; j++) {
                    const dx = (j - 1.5) * 5 * size, off = ((j * 37 + turn * 13) % 29) - 10, ya = Math.max(yT, head - len + off + j * 12), yb = Math.min(head - 6, ya + 22 + ((j * 17) % 13));
                    if (yb > ya + 4 && u < 0.86) {
                        g.moveTo(x + dx, ya);
                        g.lineTo(x + dx, yb);
                    }
                }
                g.stroke();
                const pr = (13 + 9 * size) * (1 - u * 0.5);
                if (u < 0.9) {
                    const puff = C.curve([[-1, 0.1], [-0.7, -0.6], [-0.1, -0.5], [0.2, -0.95], [0.75, -0.5], [1, 0.05], [0.5, 0.5], [0, 0.3], [-0.5, 0.55]].map(([px, py]) => [x + px * pr, head + py * pr * 0.8]), true, 5);
                    C.poly(g, puff, { fill: '#f6c9b4', ink: K.ink, lw: 2.4 });
                    line(g, [[x - pr * 0.5, head + pr * 0.08], [x + pr * 0.2, head + pr * 0.14]], 2, '#dc9a86');
                }
            }
        }
        g.restore();
    }
    // A crack: pts its whole run (frame units), k 0..1 how far it has run, wide 0..1 how far it has
    // opened (it glows from below). Chips jump at its head while it runs (d: the drawing).
    function crack(g, pts, k, wide = 0, d = 0) {
        if (k <= 0) return;
        const seg = [];
        let total = 0;
        for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        let left = total * clamp01(k);
        const run = [pts[0]];
        for (let i = 1; i < pts.length && left > 0; i++) {
            const len = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]), u = Math.min(1, left / len);
            run.push([mix(pts[i - 1][0], pts[i][0], u), mix(pts[i - 1][1], pts[i][1], u)]);
            left -= len;
        }
        const w = 3.4 + 7 * wide;
        // it opens as a wedge: widest where it started, a hair at its head
        const up = run.map(([x, y], i) => [x, y - (w / 2) * (1 - 0.75 * (i / (run.length - 1 || 1))) - (i % 2 ? 0 : wide * 2)]);
        const dn = run.map(([x, y], i) => [x, y + (w / 2) * (1 - 0.75 * (i / (run.length - 1 || 1))) + (i % 2 ? wide * 2 : 0)]).reverse();
        C.poly(g, [...up, ...dn], { fill: wide > 0.3 ? ROCK.glow : ROCK.deep, ink: K.ink, lw: 3 });
        if (wide > 0.3) line(g, run.slice(0, Math.max(2, Math.ceil(run.length * 0.8))), 1.4 + 2.4 * wide, ROCK.hot);
        // side cracks off every other corner
        for (let i = 2; i < run.length - 1; i += 2) {
            const [x, y] = run[i], sg = (i / 2) % 2 ? 1 : -1;
            line(g, [[x, y], [x + 9, y + sg * 7], [x + 6, y + sg * 13]], 2.6);
        }
        if (k < 1) {
            const [hx, hy] = run[run.length - 1];
            for (let i = 0; i < 3; i++) {
                const a = -PI / 2 + (i - 1) * 0.7 + (d % 2 ? 0.2 : -0.2), rr = 12 + 9 * ((d + i) % 3);
                C.poly(g, [[-4, -3], [4, -4], [5, 3], [-3, 4]].map(([px, py]) => [hx + Math.cos(a) * rr + px, hy + Math.sin(a) * rr + py]), { fill: ROCK.shelfL, ink: K.ink, lw: 2.2 });
            }
        }
    }
    // The lake swelling: a dome of lava with its base on (x, y), w wide, h high (h grows), a bright
    // rim along its top, plates of crust sliding off it and bubbles on twos.
    function bulge(g, x, y, w, h, d = 0) {
        if (h < 3) return;
        const dome = C.curve([[x - w / 2, y], [x - w * 0.43, y - h * 0.5], [x - w * 0.22, y - h * 0.93], [x + w * 0.04, y - h], [x + w * 0.3, y - h * 0.84], [x + w * 0.46, y - h * 0.42], [x + w / 2, y]], false, 7);
        C.poly(g, [...dome, [x + w / 2, y + 6], [x - w / 2, y + 6]], { fill: '#f0611f', ink: K.ink, lw: 3.2 });
        g.save();
        C.trace(g, [...dome, [x + w / 2, y + 6], [x - w / 2, y + 6]]);
        g.clip();
        // the hot rim, then a darker foot
        line(g, dome.map(([px, py]) => [px + 4, py + 9]).slice(4, 30), 8, ROCK.glow);
        line(g, dome.map(([px, py]) => [px + 3, py + 8]).slice(8, 22), 3.4, ROCK.hot);
        g.fillStyle = '#c2361f';
        g.fillRect(x - w / 2, y - h * 0.16, w, h * 0.16 + 8);
        // crust plates sliding down its flanks
        for (const [u, v, sz, sg] of [[-0.3, 0.52, 1, -1], [0.26, 0.6, 0.8, 1], [0.02, 0.3, 0.7, 1]]) {
            const px = x + u * w + sg * (d % 4) * 2, py = y - h * v + (d % 4) * 3;
            C.poly(g, [[-22, -6], [-4, -11], [20, -5], [24, 5], [2, 9], [-18, 6]].map(([ax, ay]) => [px + ax * sz, py + ay * sz]), { fill: '#7a1626', ink: K.ink, lw: 2.4 });
        }
        g.restore();
        // bubbles on its crown
        for (const [u, r0, ph] of [[-0.12, 9, 0], [0.1, 12, 2], [0.27, 7, 1]]) {
            const f = (d + ph) % 4, px = x + u * w, py = y - h * (1 - 2.2 * u * u) - 2;
            if (f < 3) {
                g.beginPath();
                g.arc(px, py - f * 2, r0 * (0.5 + 0.3 * f), PI, TAU);
                g.fillStyle = ROCK.glow;
                g.fill();
                g.strokeStyle = K.ink;
                g.lineWidth = 2.6;
                g.stroke();
            } else for (const a of [-2.4, -PI / 2, -0.75]) line(g, [[px + Math.cos(a) * r0 * 0.9, py + Math.sin(a) * r0 * 0.9], [px + Math.cos(a) * r0 * 1.7, py + Math.sin(a) * r0 * 1.7]], 2.6, ROCK.hot);
        }
    }
    // The swirl of somebody turning on the spot: two arcs round (x, y), rx wide; f its drawing (0, 1)
    function whirl(g, x, y, rx, f = 0, sg = 1) {
        for (const [dy, a0, k] of [[0, 0.3, 1], [-rx * 0.75, 2.2, 0.8]]) {
            const pts = [];
            for (let i = 0; i <= 8; i++) {
                const a = a0 + f * 1.3 + sg * (i / 8) * 2.5;
                pts.push([x + Math.cos(a) * rx * k, y + dy + Math.sin(a) * rx * k * 0.28]);
            }
            line(g, pts, 6.4);
            line(g, pts, 3, K.white);
        }
    }

    return { MIKE, mike, mikePoints, cleanNote, fireNote, star, clash, braid, dust, crack, bulge, whirl };
})();
