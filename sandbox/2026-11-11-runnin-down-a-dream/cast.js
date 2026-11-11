// The cast: the band as box people, the way the style's reference draws its mascot: solid
// boxes in oblique projection, faces of two slot eyes and a mouth, block mitts for hands (the
// style never draws fingers: a mitt holds things by resting on them). A person is told apart
// by the signature shapes: the hair, the clothes, the instrument.
//
// Units: 1 = the head's width class (a figure is about 1.7 tall); the origin is the ground
// between the feet; y grows downwards. Global: Cast. Depends on Cereal.
const Cast = (() => {
    const C = Cereal, K = C.COL;
    const D = [0.3, -0.2]; // screen offset per unit of depth: we see tops and right sides
    const Dd = (z) => [D[0] * z, D[1] * z];
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const place = (pts, a, o, sc = 1) => pts.map((p) => {
        const q = rot(p, a);
        return [q[0] * sc + o[0], q[1] * sc + o[1]];
    });
    const cw = (pts) => {
        let a = 0;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i], q = pts[(i + 1) % pts.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return a > 0 ? pts : pts.slice().reverse(); // positive area = clockwise when y points down
    };

    // --- palettes ------------------------------------------------------------------------
    // Black clothes are painted as a deep blue-violet so the outline still reads on them.
    const TOM = {
        ink: K.ink,
        skin: '#f7c9a3', skinTop: '#fcdfc6', skinSide: '#e0a17b',
        hair: '#f6d34f', hairTop: '#fde98f', hairSide: '#d7a12a', hairLine: '#c48a1b',
        eye: '#1d1626', mouth: '#7a1f2e', tongue: '#ff8fa3', glint: '#ffffff',
        jacket: '#4a4470', jacketTop: '#625c8c', jacketSide: '#353055', lapel: '#565082', tee: '#2a2438',
        jeans: '#4a7fe0', jeansSide: '#345fb6', shoe: '#2a2438', shoeTop: '#3d3652', shoeSide: '#1f1a2b', sole: '#fffdf4',
        gBody: '#e8392f', gSide: '#a8231f', gBurst: '#ffb22c', gGuard: '#fffdf4', gNeck: '#7b4526', gNeckSide: '#55301b', gHead: '#f3d9a4',
        chrome: '#d5dbea', chromeDark: '#8d95ad', string: '#fffdf4', strap: '#2a2438',
        shadow: 'rgba(36,21,49,0.28)',
    };
    // A two-tone print of the same drawing (the title card): every colour goes to black or
    // white, and the white is multiplied onto whatever is behind.
    const DARK = new Set(['ink', 'eye', 'mouth', 'jacket', 'jacketTop', 'jacketSide', 'lapel', 'tee', 'shoe', 'shoeTop', 'shoeSide', 'gBody', 'gSide', 'gNeck', 'gNeckSide', 'strap', 'hairSide', 'skinSide', 'jeansSide', 'chromeDark']);
    const print = (P) => Object.fromEntries(Object.keys(P).map((k) => [k, k === 'shadow' ? 'rgba(0,0,0,0)' : DARK.has(k) ? '#000000' : '#ffffff']));

    // --- parts -----------------------------------------------------------------------------
    function legs(g, P, L) {
        for (const sx of [-1, 1]) {
            const x = sx * 0.19;
            C.box(g, x - 0.15, -0.105, 0.3, 0.105, D, { front: P.shoe, top: P.shoeTop, side: P.shoeSide }, { lw: L, ink: P.ink, depth: 0.36 });
            C.poly(g, [[x - 0.15, -0.022], [x + 0.15, -0.022]], { ink: P.sole, lw: L * 0.8, close: false });
            C.box(g, x - 0.12, -0.4, 0.24, 0.3, D, { front: P.jeans, top: P.jeans, side: P.jeansSide }, { lw: L, ink: P.ink, depth: 0.3 });
        }
    }

    const TORSO = { x: -0.36, y: -0.98, w: 0.72, h: 0.62, d: 0.4 };
    function torso(g, P, L) {
        const { x, y, w, h, d } = TORSO;
        C.box(g, x, y, w, h, D, { front: P.jacket, top: P.jacketTop, side: P.jacketSide }, { lw: L, ink: P.ink, depth: d });
        // the tee in the jacket's opening, then the lapels over it
        C.poly(g, [[-0.15, y], [0.15, y], [0.02, y + 0.38], [-0.02, y + 0.38]], { fill: P.tee, ink: P.ink, lw: L * 0.8 });
        for (const s of [-1, 1]) C.poly(g, [[s * 0.15, y], [s * 0.27, y], [s * 0.21, y + 0.22], [s * 0.02, y + 0.38]], { fill: P.lapel, ink: P.ink, lw: L * 0.8 });
        C.poly(g, [[0, y + 0.38], [0, y + h]], { ink: P.ink, lw: L * 0.8, close: false });
        g.fillStyle = P.ink;
        g.beginPath();
        g.arc(0.04, y + 0.46, 0.017, 0, C.TAU);
        g.fill();
    }

    // A stub arm: a sleeve from the shoulder and a block mitt at the hand point.
    function arm(g, P, L, sh, hand) {
        const w = 0.15, dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6;
        const ux = dx / len, uy = dy / len, nx = -uy * w * 0.5, ny = ux * w * 0.5;
        const quad = (a, b) => cw([[sh[0] + ux * a + nx, sh[1] + uy * a + ny], [sh[0] + ux * b + nx, sh[1] + uy * b + ny], [sh[0] + ux * b - nx, sh[1] + uy * b - ny], [sh[0] + ux * a - nx, sh[1] + uy * a - ny]]);
        const cut = Math.max(0.02, len - 0.07);
        C.prism(g, quad(-0.05, cut), Dd(0.15), { front: P.jacket, top: P.jacketTop, side: P.jacketSide }, { lw: L, ink: P.ink });
        C.prism(g, quad(cut, len + 0.1), Dd(0.15), { front: P.skin, top: P.skinTop, side: P.skinSide }, { lw: L, ink: P.ink });
    }

    // Tom's head: the hair is the box (straight, to the shoulders, parted off centre, two
    // curtains of fringe over the brow), the face a panel on its front.
    const HEAD = { w: 0.86, h: 0.92, top: -1.85, d: 0.46 };
    function head(g, P, L, o = {}) {
        const { w, h, top, d } = HEAD, x0 = -w / 2, x1 = w / 2, bot = top + h, sw = o.sway ?? 0;
        const fx = 0.31; // half width of the face panel
        // the hair's front outline, clockwise: crown, right curtain down to its hem, the
        // notch under the chin, left curtain
        const hair = [
            [x0, top - 0.04], [x1, top - 0.04],
            [x1 + 0.025, bot - 0.2], [x1 + 0.04 + sw, bot + 0.13], [x1 - 0.04 + sw, bot + 0.09], [fx + 0.005 + sw * 0.6, bot + 0.12], [fx, bot - 0.06],
            [-fx, bot - 0.06], [-fx - 0.005 + sw * 0.6, bot + 0.12], [x0 + 0.04 + sw, bot + 0.09], [x0 - 0.04 + sw, bot + 0.13], [x0 - 0.025, bot - 0.2],
        ];
        C.prism(g, hair, Dd(d), { front: P.hair, top: P.hairTop, side: P.hairSide }, { lw: L, ink: P.ink });
        // strands on the curtains
        g.strokeStyle = P.hairLine;
        g.lineWidth = L * 0.7;
        g.lineCap = 'round';
        for (const s of [-1, 1]) {
            g.beginPath();
            g.moveTo(s * (fx + 0.05), top + 0.5);
            g.lineTo(s * (fx + 0.055) + sw * 0.5, bot + 0.04);
            g.stroke();
        }
        // the face
        const fy = top + 0.2;
        const face = [[-fx, fy], [fx, fy], [fx, bot - 0.1], [fx - 0.09, bot - 0.005], [-fx + 0.09, bot - 0.005], [-fx, bot - 0.1]];
        C.poly(g, face, { fill: P.skin, ink: P.ink, lw: L });
        const ey = top + 0.53, mx = 0.0, my = top + 0.775;
        if (o.shades == null || o.shades < 1) {
            // slot eyes under half-closed lids
            for (const s of [-1, 1]) {
                const ex = s * 0.155, ew = 0.075, eh = o.eyes === 'wide' ? 0.19 : 0.16;
                g.fillStyle = P.eye;
                if (o.eyes === 'shut') {
                    C.poly(g, [[ex - 0.06, ey + 0.03], [ex, ey + 0.055], [ex + 0.06, ey + 0.03]], { ink: P.eye, lw: L * 1.1, close: false });
                    continue;
                }
                g.fillRect(ex - ew / 2, ey - eh / 2, ew, eh);
                g.fillStyle = P.glint;
                g.fillRect(ex - ew / 2 + 0.012, ey - eh / 2 + (o.eyes === 'wide' ? 0.02 : 0.062), 0.028, 0.03);
                if (o.eyes !== 'wide') {
                    g.fillStyle = P.skin;
                    g.fillRect(ex - ew / 2 - 0.02, ey - eh / 2 - 0.01, ew + 0.04, 0.058);
                    C.poly(g, [[ex - ew / 2 - 0.025, ey - eh / 2 + 0.05], [ex + ew / 2 + 0.025, ey - eh / 2 + 0.046]], { ink: P.ink, lw: L * 0.9, close: false });
                }
            }
        }
        // nose: a small hook
        C.poly(g, [[0.012, ey + 0.05], [0.012, ey + 0.145], [0.05, ey + 0.145]], { ink: P.ink, lw: L * 0.85, close: false });
        // mouth
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
            g.ellipse(mx + 0.01, my + mh / 2 + 0.02, 0.075, 0.05, 0, 0, C.TAU);
            g.fill();
            g.restore();
            g.beginPath();
            g.roundRect(mx - mw / 2, my - mh / 2 + 0.01, mw, mh, [0.02, 0.02, 0.06, 0.06]);
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.9;
            g.stroke();
        } else if (o.mouth === 'grin') {
            C.poly(g, [[-0.11, my - 0.02], [-0.05, my + 0.03], [0.05, my + 0.03], [0.11, my - 0.02]], { ink: P.ink, lw: L, close: false });
        } else {
            // the smirk: flat, one corner up
            C.poly(g, [[-0.09, my + 0.012], [0.03, my + 0.018], [0.1, my - 0.03]], { ink: P.ink, lw: L, close: false });
        }
        // the fringe over the brow: two curtains from the parting
        const px = 0.06;
        const left = C.curve([[px, fy - 0.012], [px - 0.1, fy + 0.1], [px - 0.24, fy + 0.2], [-fx - 0.004, fy + 0.25]], false, 8);
        const right = C.curve([[px, fy - 0.012], [px + 0.08, fy + 0.085], [px + 0.17, fy + 0.155], [fx + 0.004, fy + 0.19]], false, 8);
        for (const [f, sx] of [[left, -1], [right, 1]]) {
            C.poly(g, [...f, [sx * (fx + 0.004), fy - 0.012]], { fill: P.hair, lw: 0 });
            C.poly(g, f, { ink: P.ink, lw: L, close: false });
        }
        g.strokeStyle = P.hairLine;
        g.lineWidth = L * 0.7;
        g.beginPath();
        g.moveTo(px, fy - 0.012);
        g.lineTo(px - 0.015, top - 0.04);
        g.moveTo(px - 0.17, fy + 0.02);
        g.lineTo(px - 0.27, fy + 0.13);
        g.moveTo(px + 0.13, fy + 0.02);
        g.lineTo(px + 0.2, fy + 0.09);
        g.stroke();
        // sunglasses: they slide down from the fringe (shades 0 → 1) and sit on the nose
        if (o.shades != null && o.shades > 0) {
            const k = Math.min(1, o.shades), sy = ey - 0.005 - (1 - k) * 0.5;
            g.save();
            g.beginPath();
            g.rect(-fx - 0.2, fy - 0.9, fx * 2 + 0.4, 0.9 + (bot - fy)); // never below the chin
            g.clip();
            for (const s of [-1, 1]) {
                const cx = s * 0.158;
                const lens = [[cx - 0.125, sy - 0.07], [cx + 0.125, sy - 0.07], [cx + 0.11, sy + 0.055], [cx + 0.065, sy + 0.085], [cx - 0.065, sy + 0.085], [cx - 0.11, sy + 0.055]];
                C.poly(g, lens, { fill: P.eye, ink: P.ink, lw: L });
                C.poly(g, [[cx - 0.085, sy + 0.035], [cx - 0.02, sy - 0.04]], { ink: P.glint, lw: L * 1.2, close: false });
                C.poly(g, [[cx - 0.02, sy + 0.04], [cx + 0.02, sy - 0.005]], { ink: P.glint, lw: L * 0.8, close: false });
            }
            C.poly(g, [[-0.04, sy - 0.05], [0.04, sy - 0.05]], { ink: P.ink, lw: L * 1.6, close: false });
            C.poly(g, [[-0.283, sy - 0.045], [-fx, sy - 0.055]], { ink: P.ink, lw: L * 1.3, close: false });
            C.poly(g, [[0.283, sy - 0.045], [fx, sy - 0.055]], { ink: P.ink, lw: L * 1.3, close: false });
            g.restore();
        }
    }

    // --- the guitar ----------------------------------------------------------------------
    // A semi-hollow twelve-string type: two crescent horns, a slash sound hole, a white
    // guard, a trapeze tailpiece, in a red-to-amber burst. Local frame: the neck runs along
    // +x, the origin is the middle of the body.
    const G_BODY = [[-0.3, -0.2], [-0.12, -0.275], [0.1, -0.262], [0.25, -0.28], [0.345, -0.24], [0.275, -0.165], [0.215, -0.075],
        [0.215, 0.075], [0.275, 0.15], [0.335, 0.225], [0.24, 0.268], [0.08, 0.275], [-0.14, 0.285], [-0.31, 0.22], [-0.375, 0.02]];
    function guitar(g, P, L0, at, ang, sc = 1) {
        const L = L0 / sc;
        const body = place(C.curve(G_BODY, true, 6), ang, at, sc);
        const th = Dd(0.09);
        // neck and headstock first: the body's top covers the heel
        const neck = cw(place([[0.18, -0.046], [0.88, -0.036], [0.88, 0.036], [0.18, 0.046]], ang, at, sc));
        const hs = cw(place([[0.87, -0.05], [1.0, -0.078], [1.085, -0.03], [1.06, 0.062], [0.87, 0.05]], ang, at, sc));
        C.prism(g, hs, th, { front: P.gHead, top: P.gHead, side: P.gNeckSide }, { lw: L0, ink: P.ink });
        C.prism(g, neck, th, { front: P.gNeck, top: P.gNeckSide, side: P.gNeckSide }, { lw: L0, ink: P.ink });
        C.prism(g, body, th, { front: P.gBody, top: P.gSide, side: P.gSide }, { lw: L0, ink: P.ink, sweepInk: null });
        C.prismOutline(g, body, th, { lw: L0, ink: P.ink });
        g.save();
        g.translate(at[0], at[1]);
        g.rotate(ang);
        g.scale(sc, sc);
        // the burst's amber middle
        C.poly(g, C.curve(G_BODY.map(([x, y]) => [x * 0.7 - 0.03, y * 0.66]), true, 6), { fill: P.gBurst, lw: 0 });
        // the guard on the lower bout, the slash hole on the upper
        C.poly(g, [[0.2, 0.06], [0.26, 0.14], [0.29, 0.2], [0.2, 0.235], [0.02, 0.24], [-0.12, 0.215], [-0.1, 0.1], [0.0, 0.062]], { fill: P.gGuard, ink: P.ink, lw: L * 0.8 });
        C.poly(g, C.ellipsePts(0.04, -0.165, 0.115, 0.022, 20, -0.3), { fill: P.ink, lw: 0 });
        // tailpiece, bridge, pickups
        C.poly(g, [[-0.34, -0.035], [-0.2, -0.05], [-0.2, 0.05], [-0.34, 0.035]], { fill: P.chrome, ink: P.ink, lw: L * 0.8 });
        C.poly(g, [[-0.17, -0.06], [-0.145, -0.06], [-0.145, 0.06], [-0.17, 0.06]], { fill: P.chromeDark, ink: P.ink, lw: L * 0.7 });
        for (const px of [-0.085, 0.085]) {
            g.beginPath();
            g.roundRect(px - 0.032, -0.075, 0.064, 0.15, 0.015);
            g.fillStyle = P.chrome;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.8;
            g.stroke();
            g.fillStyle = P.chromeDark;
            g.fillRect(px - 0.012, -0.058, 0.024, 0.116);
        }
        // knobs on the guard
        for (const [kx, ky] of [[0.0, 0.16], [0.075, 0.185], [0.15, 0.17], [-0.06, 0.18]]) {
            g.beginPath();
            g.arc(kx, ky, 0.022, 0, C.TAU);
            g.fillStyle = P.chromeDark;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.7;
            g.stroke();
        }
        // fretboard over the body, frets and dots
        C.poly(g, [[0.13, -0.044], [0.88, -0.036], [0.88, 0.036], [0.13, 0.044]], { fill: P.gNeck, ink: P.ink, lw: L * 0.8 });
        g.strokeStyle = P.chrome;
        g.lineWidth = L * 0.55;
        g.beginPath();
        for (let i = 0; i < 9; i++) {
            const fx = 0.86 - 0.7 * (1 - Math.pow(0.86, i + 1)) / (1 - Math.pow(0.86, 10)) * 1.0;
            g.moveTo(fx, -0.036);
            g.lineTo(fx, 0.036);
        }
        g.stroke();
        // strings from the tailpiece to the nut, and the tuners
        g.strokeStyle = P.string;
        g.lineWidth = L * 0.42;
        g.beginPath();
        for (let i = 0; i < 4; i++) {
            const y = (i - 1.5) * 0.02;
            g.moveTo(-0.3, y * 1.25);
            g.lineTo(0.87, y);
        }
        g.stroke();
        C.poly(g, [[0.87, -0.04], [0.87, 0.04]], { ink: P.gGuard, lw: L * 1.1, close: false });
        g.fillStyle = P.chrome;
        g.strokeStyle = P.ink;
        g.lineWidth = L * 0.6;
        for (let i = 0; i < 3; i++) {
            for (const s of [-1, 1]) {
                g.beginPath();
                g.rect(0.915 + i * 0.045, s > 0 ? 0.058 - i * 0.004 : -0.092 + i * 0.008, 0.026, 0.032);
                g.fill();
                g.stroke();
            }
        }
        g.restore();
    }

    /**
     * Tom with his guitar.
     *   x, y   the ground between his feet;  s  logical units per figure unit
     *   pose: { squash, lean, headDy, headTilt, sway, eyes, mouth, shades (0 → 1), strum (-1..1),
     *           fret (0..1 along the neck), windmill (angle of the strumming arm, or null) }
     *   P      a palette (Cast.TOM, or Cast.print(Cast.TOM) for the two-tone print)
     */
    function tom(g, x, y, s, pose = {}, P = TOM) {
        const L = 3.2 / s, q = pose.squash ?? 0;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        // contact shadow
        g.fillStyle = P.shadow;
        g.beginPath();
        g.ellipse(0.05, 0.0, 0.56 * (1 + q), 0.06, 0, 0, C.TAU);
        g.fill();
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        legs(g, P, L);
        torso(g, P, L);
        // the strap, from the left shoulder across the chest
        C.poly(g, [[-0.31, TORSO.y + 0.02], [-0.23, TORSO.y + 0.02], [0.22, TORSO.y + 0.5], [0.14, TORSO.y + 0.52]], { fill: P.strap, ink: P.ink, lw: L * 0.7 });
        g.save();
        g.translate(0, pose.headDy ?? 0);
        g.rotate(pose.headTilt ?? 0);
        head(g, P, L, pose);
        g.restore();
        const gAt = [-0.06, -0.6], gAng = -0.3, gSc = 0.86;
        guitar(g, P, L, gAt, gAng, gSc);
        // hands: the right one (screen left) strums between the pickups, the left one holds the neck
        const onG = (p) => {
            const r = rot(p, gAng);
            return [r[0] * gSc + gAt[0], r[1] * gSc + gAt[1]];
        };
        const shR = [TORSO.x + 0.03, TORSO.y + 0.13], shL = [TORSO.x + TORSO.w - 0.03, TORSO.y + 0.13];
        const fret = onG([0.52 + 0.24 * (pose.fret ?? 0.3), 0.03]);
        arm(g, P, L, shL, fret);
        let hand = onG([0.0, (pose.strum ?? 0) * 0.11 - 0.01]);
        if (pose.windmill != null) hand = [shR[0] + Math.cos(pose.windmill) * 0.52, shR[1] + Math.sin(pose.windmill) * 0.52];
        arm(g, P, L, shR, hand);
        g.restore();
    }

    // --- the Devil ---------------------------------------------------------------------
    // The tape's mascot: a red box with cream horns, slit eyes, a grin with one fang, a goatee,
    // a bow tie, hooves and an arrow tail. He carries a trident and a contract with a wax seal.
    const DEVIL = {
        ink: K.ink, body: '#e8392f', top: '#ff6f59', side: '#ad211f', horn: '#fff1c4', hornSide: '#e2c98a',
        eye: '#ffe62e', pupil: '#1d1626', mouth: '#5a1220', tooth: '#fffdf4', beard: '#2a2438', tie: '#7d47e1', tieSide: '#5a2fb5',
        hoof: '#2a2438', hoofTop: '#3d3652', fork: '#d5dbea', forkSide: '#8d95ad', shaft: '#7b4526', paper: '#fff6dc', paperSide: '#e2d3a8', seal: '#c0182b',
        shadow: 'rgba(36,21,49,0.28)',
    };
    /**
     * pose: { squash, lean, mood: 'grin' | 'angry' | 'shock', look (-1..1), tail (sway), forkUp (0..1), contract (true to hold it out) }
     */
    function devil(g, x, y, s, pose = {}, P = DEVIL) {
        const L = 3.2 / s, q = pose.squash ?? 0, mood = pose.mood ?? 'grin';
        const W = 1.0, H = 0.8, top = -1.06, x0 = -W / 2, dep = 0.5;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.fillStyle = P.shadow;
        g.beginPath();
        g.ellipse(0.06, 0, 0.6 * (1 + q), 0.065, 0, 0, C.TAU);
        g.fill();
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        // the tail, from behind the right side: a curl and an arrow tip
        const tw = pose.tail ?? 0;
        const tail = C.curve([[0.5, -0.42], [0.74, -0.36], [0.86, -0.56 + tw * 0.4], [0.74, -0.78 + tw], [0.9, -0.98 + tw]], false, 8);
        C.poly(g, tail, { ink: P.ink, lw: 0.085 + L * 2, close: false });
        C.poly(g, tail, { ink: P.side, lw: 0.085, close: false });
        const tp = tail[tail.length - 1];
        C.poly(g, [[tp[0] - 0.11, tp[1] + 0.03], [tp[0] + 0.06, tp[1] - 0.17], [tp[0] + 0.13, tp[1] + 0.07]], { fill: P.body, ink: P.ink, lw: L });
        // legs with hooves
        for (const sx of [-1, 1]) {
            const lx = sx * 0.22;
            C.box(g, lx - 0.13, -0.11, 0.26, 0.11, D, { front: P.hoof, top: P.hoofTop, side: P.hoof }, { lw: L, ink: P.ink, depth: 0.3 });
            C.box(g, lx - 0.1, -0.3, 0.2, 0.2, D, { front: P.body, top: P.top, side: P.side }, { lw: L, ink: P.ink, depth: 0.24 });
        }
        C.box(g, x0, top, W, H, D, { front: P.body, top: P.top, side: P.side }, { lw: L, ink: P.ink, depth: dep });
        // the horns stand on the box's top, curving in
        for (const sx of [-1, 1]) {
            const hx = sx * 0.3;
            const horn = cw(C.curve([[hx - 0.1, top], [hx - 0.09 + sx * 0.02, top - 0.14], [hx - sx * 0.05, top - 0.3], [hx - sx * 0.16, top - 0.4], [hx - sx * 0.02, top - 0.2], [hx + 0.1, top - 0.02], [hx + 0.1, top]], true, 5));
            const hp = horn.map(([px, py]) => [px + D[0] * 0.16, py + D[1] * 0.16]);
            C.prism(g, hp, Dd(0.14), { front: P.horn, top: P.hornSide, side: P.hornSide }, { lw: L, ink: P.ink, sweepInk: null });
            C.prismOutline(g, hp, Dd(0.14), { lw: L, ink: P.ink });
        }
        // the face: slit eyes, brows by mood, a wide grin with a fang, the goatee
        const ey = top + 0.3, look = (pose.look ?? 0) * 0.02;
        for (const sx of [-1, 1]) {
            const ex = sx * 0.21;
            g.beginPath();
            g.roundRect(ex - 0.085, ey - (mood === 'shock' ? 0.13 : 0.1), 0.17, mood === 'shock' ? 0.26 : 0.2, 0.03);
            g.fillStyle = P.eye;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L;
            g.stroke();
            g.fillStyle = P.pupil;
            g.fillRect(ex - 0.022 + look, ey - 0.075, 0.044, 0.15);
            const b = mood === 'angry' ? -0.1 : mood === 'shock' ? 0.05 : -0.045; // inner end down = up to no good
            C.poly(g, [[ex - sx * 0.12, ey - 0.17 - b], [ex + sx * 0.11, ey - 0.15 + b]], { ink: P.ink, lw: L * 2.2, close: false });
        }
        const my = top + 0.56;
        if (mood === 'shock') {
            g.beginPath();
            g.ellipse(0, my + 0.03, 0.09, 0.11, 0, 0, C.TAU);
            g.fillStyle = P.mouth;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L;
            g.stroke();
        } else {
            const up = mood === 'angry' ? -1 : 1;
            const lip = [[-0.3, my - 0.05 * up], [-0.18, my + 0.06 * up], [0.18, my + 0.06 * up], [0.3, my - 0.05 * up], [0.2, my + 0.09 + 0.05 * up], [-0.2, my + 0.09 + 0.05 * up]];
            C.poly(g, lip, { fill: P.mouth, ink: P.ink, lw: L });
            g.save();
            C.trace(g, lip);
            g.clip();
            g.fillStyle = P.tooth;
            g.fillRect(-0.3, my - 0.06, 0.6, up > 0 ? 0.175 : 0.12);
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.7;
            g.beginPath();
            for (let i = -2; i <= 2; i++) {
                g.moveTo(i * 0.085, my - 0.08);
                g.lineTo(i * 0.085, my + (up > 0 ? 0.115 : 0.06));
            }
            g.stroke();
            g.restore();
            C.poly(g, lip, { ink: P.ink, lw: L });
            C.poly(g, [[0.19, my + 0.02], [0.25, my + 0.02], [0.22, my + 0.13]], { fill: P.tooth, ink: P.ink, lw: L * 0.8 });
        }
        C.poly(g, [[-0.1, top + H - 0.04], [0.1, top + H - 0.04], [0, top + H + 0.15]], { fill: P.beard, ink: P.ink, lw: L });
        // bow tie under the chin
        const ty = top + H + 0.04;
        C.poly(g, [[-0.2, ty - 0.06], [-0.07, ty + 0.01], [-0.2, ty + 0.1]], { fill: P.tie, ink: P.ink, lw: L });
        C.poly(g, [[0.2, ty - 0.06], [0.07, ty + 0.01], [0.2, ty + 0.1]], { fill: P.tie, ink: P.ink, lw: L });
        // the trident in his right mitt (screen left), the contract in his left
        const stub = (sh, hand) => {
            const dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6, ux = dx / len, uy = dy / len, nx = -uy * 0.085, ny = ux * 0.085;
            C.prism(g, cw([[sh[0] + nx, sh[1] + ny], [hand[0] + ux * 0.09 + nx, hand[1] + uy * 0.09 + ny], [hand[0] + ux * 0.09 - nx, hand[1] + uy * 0.09 - ny], [sh[0] - nx, sh[1] - ny]]), Dd(0.17), { front: P.body, top: P.top, side: P.side }, { lw: L, ink: P.ink });
        };
        const fu = pose.forkUp ?? 0, hR = [-0.72, -0.56 - fu * 0.2], hL = pose.contract ? [0.86, -0.72] : [0.7, -0.5];
        // trident: shaft, then the head
        const fx = hR[0], fy0 = -0.02 - fu * 0.25, fy1 = -1.62 - fu * 0.25;
        C.box(g, fx - 0.03, fy1 + 0.2, 0.06, fy0 - fy1 - 0.2, D, { front: P.shaft, top: P.shaft, side: P.shaft }, { lw: L, ink: P.ink, depth: 0.05 });
        const fork = cw([[fx - 0.19, fy1 - 0.02], [fx - 0.13, fy1 + 0.02], [fx - 0.11, fy1 + 0.2], [fx - 0.035, fy1 + 0.2], [fx - 0.035, fy1 - 0.06], [fx, fy1 - 0.14], [fx + 0.035, fy1 - 0.06], [fx + 0.035, fy1 + 0.2],
            [fx + 0.11, fy1 + 0.2], [fx + 0.13, fy1 + 0.02], [fx + 0.19, fy1 - 0.02], [fx + 0.18, fy1 + 0.27], [fx + 0.05, fy1 + 0.3], [fx - 0.05, fy1 + 0.3], [fx - 0.18, fy1 + 0.27]]);
        C.prism(g, fork, Dd(0.05), { front: P.fork, top: P.fork, side: P.forkSide }, { lw: L, ink: P.ink });
        stub([x0 + 0.02, -0.62], hR);
        if (pose.contract) {
            // a sheet with ruled lines, a signature line with an X, and a wax seal
            const cx = hL[0] + 0.22, cy = hL[1] - 0.1;
            C.box(g, cx - 0.21, cy - 0.3, 0.42, 0.56, D, { front: P.paper, top: P.paperSide, side: P.paperSide }, { lw: L, ink: P.ink, depth: 0.03 });
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.6;
            g.beginPath();
            for (let i = 0; i < 4; i++) {
                g.moveTo(cx - 0.15, cy - 0.21 + i * 0.07);
                g.lineTo(cx + (i === 3 ? 0.04 : 0.15), cy - 0.21 + i * 0.07);
            }
            g.moveTo(cx - 0.08, cy + 0.17);
            g.lineTo(cx + 0.15, cy + 0.17);
            g.moveTo(cx - 0.155, cy + 0.12);
            g.lineTo(cx - 0.105, cy + 0.17);
            g.moveTo(cx - 0.105, cy + 0.12);
            g.lineTo(cx - 0.155, cy + 0.17);
            g.stroke();
            g.beginPath();
            g.arc(cx + 0.11, cy + 0.07, 0.05, 0, C.TAU);
            g.fillStyle = P.seal;
            g.fill();
            g.stroke();
        }
        stub([x0 + W - 0.02, -0.62], hL);
        g.restore();
    }

    return { D, Dd, TOM, DEVIL, print, tom, devil, guitar, head, legs, torso, arm };
})();
