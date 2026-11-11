// The band's strings: Mike (lead guitar) and Howie (bass) as box people, built the way
// Cast.tom is built: Cast.legs, a torso box, a head whose box is the hair, stub arms that end
// in a block mitt, an instrument drawn in its own frame and placed on the body.
//
// A person is told apart by the signature shapes:
//   Mike   dark shaggy hair with a jagged hem and a heavy fringe, a black bandana with a white
//          pattern round the neck, a white jacket with the sleeves pushed up, a cream
//          solid-body guitar with a dark guard, three pickups and six tuners in a line
//   Howie  a mass of dark brown curls (a scalloped head), a deep violet waistcoat over a grey
//          striped shirt with rolled sleeves, a long sunburst bass with four big tuners
//
// Units as in cast.js: 1 = a head's width class, the origin is the ground between the feet,
// y grows downwards. Global: BandStrings. Depends on Cereal and Cast.
const BandStrings = (() => {
    const C = Cereal, K = C.COL, D = Cast.D, Dd = Cast.Dd, TAU = Math.PI * 2;
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
    const mix = (a, b, u) => a + (b - a) * u;
    const clamp01 = (u) => Math.max(0, Math.min(1, u));

    // --- palettes ------------------------------------------------------------------------
    const MIKE = {
        ink: K.ink,
        skin: '#f7c9a3', skinTop: '#fcdfc6', skinSide: '#e0a17b',
        hair: '#432e2c', hairTop: '#62463d', hairSide: '#2e1f1e', hairLine: '#80604f',
        eye: '#1d1626', mouth: '#7a1f2e', tongue: '#ff8fa3', glint: '#ffffff',
        jacket: '#f4f0e6', jacketTop: '#ffffff', jacketSide: '#c9c2d3', lapel: '#ffffff', cuff: '#e6e0d3',
        tee: '#ffffff', print: '#e8392f',
        bandana: '#2a2438', dot: '#fffdf4',
        jeans: '#4f86e4', jeansSide: '#3763b8', shoe: '#3d2c2d', shoeTop: '#5a4442', shoeSide: '#2b1f21', sole: '#c79d66',
        gBody: '#ffe7a8', gSide: '#d6b067', gGuard: '#35304b', gCover: '#fffdf4', gKnob: '#fffdf4',
        gNeck: '#f1c582', gNeckSide: '#c08f4c', gHead: '#f1c582', gFret: '#9a6d35', gDot: '#2a2438', gNut: '#fffdf4',
        chrome: '#d5dbea', chromeDark: '#8d95ad', string: '#eef1f8', stringDark: '#7c6a5c', strap: '#8a5a34',
        shadow: 'rgba(36,21,49,0.28)',
    };
    const HOWIE = {
        ink: K.ink,
        skin: '#f3c39c', skinTop: '#fbdcc2', skinSide: '#d99d76',
        hair: '#5e3d29', hairTop: '#80573a', hairSide: '#43291d', hairLine: '#a27853',
        eye: '#1d1626', mouth: '#7a1f2e', tongue: '#ff8fa3', glint: '#ffffff',
        vest: '#403a66', vestTop: '#5a5286', vestSide: '#2c2749', button: '#d5dbea',
        shirt: '#cdd0db', shirtTop: '#e9ebf1', shirtSide: '#9da1b4', stripe: '#8489a3', collar: '#eceef4', cuff: '#eceef4',
        jeans: '#4b4c66', jeansSide: '#33344b', shoe: '#2a2438', shoeTop: '#3d3652', shoeSide: '#1f1a2b', sole: '#d5dbea',
        bBody: '#56301f', bSide: '#371e15', bMid: '#b85d27', bBurst: '#f6b740', bGuard: '#9c4a2a', bSpot: '#6a2e1b',
        bNeck: '#5a3524', bNeckSide: '#3d2317', bHead: '#f1c582', bHeadSide: '#c08f4c', pickup: '#2a2438',
        chrome: '#d5dbea', chromeDark: '#8d95ad', string: '#fffdf4', strap: '#b57c44',
        shadow: 'rgba(36,21,49,0.28)',
    };
    // The two-tone print (see Cast.print): which colours go to black.
    const DARK = new Set(['ink', 'eye', 'mouth', 'hair', 'hairSide', 'skinSide', 'jacketSide', 'bandana', 'print', 'jeansSide', 'shoe', 'shoeTop', 'shoeSide',
        'gSide', 'gGuard', 'gNeckSide', 'gFret', 'gDot', 'chromeDark', 'stringDark', 'strap', 'vest', 'vestTop', 'vestSide', 'shirtSide', 'stripe', 'jeans',
        'bBody', 'bSide', 'bMid', 'bGuard', 'bSpot', 'bNeck', 'bNeckSide', 'bHeadSide', 'pickup']);
    const print = (P) => Object.fromEntries(Object.keys(P).map((k) => [k, k === 'shadow' ? 'rgba(0,0,0,0)' : DARK.has(k) ? '#000000' : '#ffffff']));

    // --- a swept solid for jagged and scalloped fronts -------------------------------------
    // Cereal.prism paints the swept faces in the polygon's order, which is right for convex
    // fronts. Hair with a ragged hem or with curls is concave all round: its swept faces
    // overlap one another, so here they are painted far to near (a face further along the
    // depth direction is nearer the eye), each with its own back edge, and a line runs back
    // from a vertex only where the solid really has an edge there: where the swept surface
    // starts or ends, and at a sharp corner between two seen faces.
    //   pts   the front, clockwise (y down);  dd  the sweep [dx, dy]
    //   cols  { front, top, side };  o: { lw, ink, tone(i) → 'top' | 'side', crease (radians) }
    function solid(g, pts, dd, cols, o = {}) {
        const { lw = 3, ink = K.ink, crease = 0.62 } = o;
        const n = pts.length, seen = [], dir = [];
        for (let i = 0; i < n; i++) {
            const a = pts[i], b = pts[(i + 1) % n], nx = b[1] - a[1], ny = -(b[0] - a[0]);
            seen.push(nx * dd[0] + ny * dd[1] > 1e-9);
            dir.push(Math.atan2(b[1] - a[1], b[0] - a[0]));
        }
        const sharp = (i, j) => {
            let d = Math.abs(dir[i] - dir[j]) % TAU;
            if (d > Math.PI) d = TAU - d;
            return d > crease;
        };
        const toneOf = (i) => {
            if (o.tone) return cols[o.tone(i)] ?? cols.front;
            const a = pts[i], b = pts[(i + 1) % n], nx = b[1] - a[1], ny = -(b[0] - a[0]);
            return (-ny / (Math.hypot(nx, ny) || 1) > 0.35 ? cols.top : cols.side) ?? cols.front;
        };
        const key = (i) => {
            const a = pts[i], b = pts[(i + 1) % n];
            return (a[0] + b[0]) * dd[0] + (a[1] + b[1]) * dd[1];
        };
        const order = [];
        for (let i = 0; i < n; i++) if (seen[i]) order.push(i);
        order.sort((p, q) => key(p) - key(q));
        const quad = (i) => {
            const a = pts[i], b = pts[(i + 1) % n];
            g.beginPath();
            g.moveTo(a[0], a[1]);
            g.lineTo(b[0], b[1]);
            g.lineTo(b[0] + dd[0], b[1] + dd[1]);
            g.lineTo(a[0] + dd[0], a[1] + dd[1]);
            g.closePath();
        };
        g.lineJoin = 'round';
        g.lineCap = 'round';
        // an underlay, so no seam shows between two faces of one tone
        for (const i of order) {
            quad(i);
            g.fillStyle = g.strokeStyle = toneOf(i);
            g.lineWidth = lw * 0.4;
            g.fill();
            g.stroke();
        }
        for (const i of order) {
            const a = pts[i], b = pts[(i + 1) % n], p = (i + n - 1) % n, q = (i + 1) % n;
            quad(i);
            g.fillStyle = toneOf(i);
            g.fill();
            g.beginPath();
            g.moveTo(a[0] + dd[0], a[1] + dd[1]);
            g.lineTo(b[0] + dd[0], b[1] + dd[1]);
            if (!seen[p] || sharp(p, i)) {
                g.moveTo(a[0], a[1]);
                g.lineTo(a[0] + dd[0], a[1] + dd[1]);
            }
            if (!seen[q] || sharp(i, q)) {
                g.moveTo(b[0], b[1]);
                g.lineTo(b[0] + dd[0], b[1] + dd[1]);
            }
            g.strokeStyle = ink;
            g.lineWidth = lw;
            g.stroke();
        }
        C.poly(g, pts, { fill: cols.front, ink, lw });
    }

    // Half an ellipse from a to b, bulging by h to the outside of a clockwise outline (h < 0:
    // to the inside). Without b: the next piece starts there. Scallops meet in a cusp.
    function scallop(a, b, h, n = 16) {
        const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1e-6, nx = dy / len, ny = -dx / len, out = [];
        for (let k = 0; k < n; k++) {
            const th = (Math.PI * k) / n, u = (1 - Math.cos(th)) / 2, off = Math.sin(th) * h;
            out.push([a[0] + dx * u + nx * off, a[1] + dy * u + ny * off]);
        }
        return out;
    }

    // --- arms --------------------------------------------------------------------------
    // A stub arm with the sleeve pushed up to the elbow: the sleeve, its bunched cuff, a bare
    // forearm that ends in the block mitt (it reaches 0.1 past the hand point, as in Cast.arm).
    //   cols  { sleeve, sleeveTop, sleeveSide, cuff }   o: { stripe (a colour), roll (0..1), fold }
    function arm(g, P, L, sh, hand, cols, o = {}) {
        const dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6;
        const ux = dx / len, uy = dy / len;
        const at = (a, k) => [sh[0] + ux * a - uy * k, sh[1] + uy * a + ux * k];
        const quad = (a, b, w) => cw([at(a, w / 2), at(b, w / 2), at(b, -w / 2), at(a, -w / 2)]);
        const roll = Math.max(0, Math.min(len - 0.1, len * (o.roll ?? 0.5)));
        const skin = { front: P.skin, top: P.skinTop, side: P.skinSide }, sleeve = { front: cols.sleeve, top: cols.sleeveTop, side: cols.sleeveSide };
        C.prism(g, quad(-0.05, roll, 0.15), Dd(0.15), sleeve, { lw: L, ink: P.ink });
        if (o.stripe) {
            g.strokeStyle = o.stripe;
            g.lineWidth = L * 0.5;
            g.lineCap = 'butt';
            g.beginPath();
            for (const k of [-0.038, 0, 0.038]) {
                const a = at(-0.035, k), b = at(roll - 0.02, k);
                g.moveTo(a[0], a[1]);
                g.lineTo(b[0], b[1]);
            }
            g.stroke();
            g.lineCap = 'round';
        }
        C.prism(g, quad(roll, len + 0.1, 0.15), Dd(0.15), skin, { lw: L, ink: P.ink });
        // the cuff: a band a little wider than the sleeve, with a fold line
        if (roll > 0.03) {
            const c0 = roll - 0.05, c1 = roll + 0.01;
            C.prism(g, quad(c0, c1, 0.168), Dd(0.16), { front: cols.cuff, top: cols.sleeveTop, side: cols.sleeveSide }, { lw: L, ink: P.ink });
            if (o.fold) C.poly(g, [at((c0 + c1) / 2, 0.084), at((c0 + c1) / 2, -0.084)], { ink: P.ink, lw: L * 0.6, close: false });
        }
    }

    // --- faces ---------------------------------------------------------------------------
    // Slot eyes under half lids, a hooked nose, a mouth: the cast's face, on a panel.
    //   F: { ey, my, ex (half the distance between the eyes) }
    function features(g, P, L, o, F) {
        const { ey, my, ex: exo } = F, mx = 0;
        if (o.shades == null || o.shades < 1) {
            for (const s of [-1, 1]) {
                const ex = s * exo, ew = 0.075, eh = o.eyes === 'wide' ? 0.19 : 0.16;
                if (o.eyes === 'shut') {
                    C.poly(g, [[ex - 0.06, ey + 0.03], [ex, ey + 0.055], [ex + 0.06, ey + 0.03]], { ink: P.eye, lw: L * 1.1, close: false });
                    continue;
                }
                g.fillStyle = P.eye;
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
    // Sunglasses that slide down from the fringe (0 → 1) and sit on the nose, as Tom's.
    function shades(g, P, L, o, F) {
        if (o.shades == null || o.shades <= 0) return;
        const { ey, fx, fy, bot } = F, k = Math.min(1, o.shades), sy = ey - 0.005 - (1 - k) * 0.5;
        g.save();
        g.beginPath();
        g.rect(-fx - 0.2, fy - 0.9, fx * 2 + 0.4, 0.9 + (bot - fy));
        g.clip();
        for (const s of [-1, 1]) {
            const cx = s * 0.158;
            const lens = [[cx - 0.125, sy - 0.07], [cx + 0.125, sy - 0.07], [cx + 0.11, sy + 0.055], [cx + 0.065, sy + 0.085], [cx - 0.065, sy + 0.085], [cx - 0.11, sy + 0.055]];
            C.poly(g, lens, { fill: P.eye, ink: P.ink, lw: L });
            C.poly(g, [[cx - 0.085, sy + 0.035], [cx - 0.02, sy - 0.04]], { ink: P.glint, lw: L * 1.2, close: false });
            C.poly(g, [[cx - 0.02, sy + 0.04], [cx + 0.02, sy - 0.005]], { ink: P.glint, lw: L * 0.8, close: false });
        }
        C.poly(g, [[-0.04, sy - 0.05], [0.04, sy - 0.05]], { ink: P.ink, lw: L * 1.6, close: false });
        C.poly(g, [[-0.283, sy - 0.045], [-fx - 0.01, sy - 0.055]], { ink: P.ink, lw: L * 1.3, close: false });
        C.poly(g, [[0.283, sy - 0.045], [fx + 0.01, sy - 0.055]], { ink: P.ink, lw: L * 1.3, close: false });
        g.restore();
    }

    // =========================================================================================
    // Mike
    // =========================================================================================
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
        const hem = [[-fx - 0.004, ey - 0.085], [-0.215, ey - 0.04], [-0.15, ey - 0.165], [-0.075, ey - 0.055], [-0.02, ey - 0.15], [0.045, ey - 0.07], [0.13, ey - 0.175], [0.205, ey - 0.05], [fx + 0.004, ey - 0.11]];
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
        shades(g, P, L, o, F);
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
    function strat(g, P, L0, at, ang, sc = 1) {
        const L = L0 / sc, th = Dd(0.09);
        const body = cw(place(C.curve(S_BODY, true, 6), ang, at, sc));
        const neck = cw(place([[0.18, -0.046], [S_NUT, -0.036], [S_NUT, 0.036], [0.18, 0.046]], ang, at, sc));
        const hs = cw(place(C.curve(S_HEAD, true, 4), ang, at, sc));
        // the neck, then the six tuner buttons in a line and the headstock in front of them
        C.prism(g, neck, th, { front: P.gNeck, top: P.gNeckSide, side: P.gNeckSide }, { lw: L0, ink: P.ink });
        g.save();
        g.translate(at[0], at[1]);
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
        g.translate(at[0], at[1]);
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

    // Where everything is for a pose: the upper body's lean for the solo, the guitar's frame
    // and the two hand points. Shared by the drawer and by `points`.
    function mikeRig(pose) {
        const solo = clamp01(pose.solo ?? 0);
        const gAt = [mix(-0.19, 0.0, solo), mix(-0.49, -0.47, solo)], gAng = mix(-0.3, -0.84, solo), gSc = 0.78;
        const onG = (p) => {
            const r = rot(p, gAng);
            return [r[0] * gSc + gAt[0], r[1] * gSc + gAt[1]];
        };
        const shR = [M_TORSO.x + 0.03, M_TORSO.y + 0.13], shL = [M_TORSO.x + M_TORSO.w - 0.03, M_TORSO.y + 0.13];
        return {
            solo, gAt, gAng, gSc, onG, shR, shL,
            back: -0.15 * solo, fwd: 0.07 * solo, // the upper body leans back about the hips, which go forward
            fret: onG([0.5 + 0.3 * (pose.fret ?? 0.3), 0.03]),
            hand: onG([0.15, (pose.strum ?? 0) * 0.1 - 0.035]),
        };
    }

    /**
     * Mike with his guitar.
     *   pose: { squash, lean, headDy, headTilt, sway, eyes: 'open' | 'shut' | 'wide', mouth: 'smirk' | 'grin' | 'sing' | 'o',
     *           strum (-1..1), fret (0..1 along the neck), solo (0..1: the neck up, leaning back), shades (null or 0 → 1) }
     */
    function mike(g, x, y, s, pose = {}, P = MIKE) {
        const L = 3.2 / s, q = pose.squash ?? 0, R = mikeRig(pose);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.fillStyle = P.shadow;
        g.beginPath();
        g.ellipse(0.05, 0.0, 0.56 * (1 + q), 0.06, 0, 0, TAU);
        g.fill();
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        Cast.legs(g, P, L);
        g.translate(R.fwd, HIP);
        g.rotate(R.back);
        g.translate(0, -HIP + 0.025 * R.solo);
        mikeTorso(g, P, L);
        // the strap, from the left shoulder (screen right) down behind the neck's heel
        const heel = R.onG([0.3, -0.06]);
        C.poly(g, [[0.255, M_TORSO.y + 0.015], [0.335, M_TORSO.y + 0.015], [heel[0] + 0.06, heel[1]], [heel[0] - 0.025, heel[1]]], { fill: P.strap, ink: P.ink, lw: L * 0.7 });
        bandana(g, P, L);
        g.save();
        g.translate(0, NECK + (pose.headDy ?? 0));
        g.rotate((pose.headTilt ?? 0) - 0.07 * R.solo);
        g.translate(0, -NECK);
        mikeHead(g, P, L, pose);
        g.restore();
        strat(g, P, L, R.gAt, R.gAng, R.gSc);
        const sleeve = { sleeve: P.jacket, sleeveTop: P.jacketTop, sleeveSide: P.jacketSide, cuff: P.cuff };
        arm(g, P, L, R.shL, R.fret, sleeve, { fold: true, roll: 0.46 });
        arm(g, P, L, R.shR, R.hand, sleeve, { fold: true, roll: 0.46 });
        g.restore();
    }

    // =========================================================================================
    // Howie
    // =========================================================================================
    const H_HEAD = { top: -1.8, h: 0.87, d: 0.44, fx: 0.3 };
    const H_TORSO = { x: -0.36, y: -0.98, w: 0.72, h: 0.62, d: 0.4 };

    // The hair is a mass of curls: the head's box with a scalloped outline, bigger at the
    // sides and down to the collar, a scalloped fringe and a few curl marks.
    function howieHead(g, P, L, o = {}) {
        const { top: T, h, d, fx } = H_HEAD, bot = T + h, sw = o.sway ?? 0;
        // [to, bulge, tone]: clockwise from the top left corner
        const run = [
            [[-0.22, T + 0.0], 0.07, 'top'], [[0.0, T - 0.03], 0.075, 'top'], [[0.23, T + 0.0], 0.075, 'top'], [[0.42, T + 0.1], 0.07, 'top'],
            [[0.445, T + 0.36], 0.07, 'side'], [[0.46 + sw * 0.3, T + 0.64], 0.085, 'side'], [[0.44 + sw, bot + 0.07], 0.095, 'side'],
            [[0.27 + sw * 0.7, bot + 0.065], 0.06, 'side'], [[fx, bot - 0.07], 0, 'side'], [[-fx, bot - 0.07], 0, 'side'], [[-0.27 + sw * 0.7, bot + 0.065], 0, 'side'],
            [[-0.44 + sw, bot + 0.07], 0.06, 'side'], [[-0.46 + sw * 0.3, T + 0.64], 0.095, 'side'], [[-0.445, T + 0.36], 0.085, 'side'], [[-0.42, T + 0.1], 0.07, 'side'],
        ];
        const hair = [], tone = [];
        let from = [-0.42, T + 0.1];
        for (const [to, bulge, tn] of run) {
            const piece = bulge ? scallop(from, to, bulge) : [from];
            for (const p of piece) {
                hair.push(p);
                tone.push(tn);
            }
            from = to;
        }
        solid(g, hair, Dd(d), { front: P.hair, top: P.hairTop, side: P.hairSide }, { lw: L, ink: P.ink, tone: (i) => tone[i] });
        // curl marks
        const curl = (cx, cy, r, a0, turn = 1) => {
            g.beginPath();
            g.arc(cx, cy, r, a0, a0 + turn * 4.3, turn < 0);
            g.stroke();
        };
        g.strokeStyle = P.hairLine;
        g.lineWidth = L * 0.75;
        g.lineCap = 'round';
        curl(-0.375 + sw * 0.2, T + 0.5, 0.04, 2.2);
        curl(-0.385 + sw * 0.6, T + 0.78, 0.045, 0.6, -1);
        curl(0.375 + sw * 0.2, T + 0.47, 0.04, 4.0, -1);
        curl(0.385 + sw * 0.6, T + 0.76, 0.045, 5.4);
        curl(-0.12, T + 0.07, 0.04, 3.4);
        curl(0.14, T + 0.06, 0.038, 0.4, -1);
        curl(-0.31, T + 0.13, 0.03, 1.0, -1);
        curl(0.33, T + 0.17, 0.03, 2.4);
        // the face
        const fy = T + 0.2, F = { ey: T + 0.53, my: T + 0.765, ex: 0.16, fx, fy, bot };
        C.poly(g, [[-fx, fy], [fx, fy], [fx, bot - 0.09], [fx - 0.07, bot - 0.005], [-fx + 0.07, bot - 0.005], [-fx, bot - 0.09]], { fill: P.skin, ink: P.ink, lw: L });
        features(g, P, L, o, F);
        // the fringe: curls over the brow
        const cusps = [[-fx - 0.004, fy + 0.1], [-0.13, fy + 0.085], [0.05, fy + 0.07], [0.2, fy + 0.095], [fx + 0.004, fy + 0.12]];
        const hem = [];
        for (let i = 0; i < cusps.length - 1; i++) hem.push(...scallop(cusps[i], cusps[i + 1], -0.055, 12));
        hem.push(cusps[cusps.length - 1]);
        C.poly(g, [[-fx - L * 0.6, hem[0][1]], ...hem, [fx + L * 0.6, hem[hem.length - 1][1]], [fx + L * 0.6, fy - L], [-fx - L * 0.6, fy - L]], { fill: P.hair, lw: 0 });
        C.poly(g, hem, { ink: P.ink, lw: L, close: false });
        g.strokeStyle = P.hairLine;
        g.lineWidth = L * 0.75;
        curl(-0.2, fy + 0.07, 0.03, 0.2, -1);
        curl(0.12, fy + 0.06, 0.03, 2.6);
        shades(g, P, L, o, F);
    }

    function howieTorso(g, P, L) {
        const { x, y, w, h, d } = H_TORSO;
        C.box(g, x, y, w, h, D, { front: P.vest, top: P.shirtTop, side: P.vestSide }, { lw: L, ink: P.ink, depth: d });
        const stripes = (pts) => {
            C.poly(g, pts, { fill: P.shirt, lw: 0 });
            g.save();
            C.trace(g, pts);
            g.clip();
            g.strokeStyle = P.stripe;
            g.lineWidth = L * 0.5;
            g.beginPath();
            for (let sx = x + 0.0225; sx < x + w; sx += 0.045) {
                g.moveTo(sx, y);
                g.lineTo(sx, y + h);
            }
            g.stroke();
            g.restore();
            C.poly(g, pts, { ink: P.ink, lw: L * 0.8 });
        };
        // the shirt at the armholes, in the neck's V and below the waistcoat's pointed hem
        stripes([[x, y], [x + 0.085, y], [x + 0.06, y + 0.2], [x, y + 0.27]]);
        stripes([[x + w, y], [x + w - 0.085, y], [x + w - 0.06, y + 0.2], [x + w, y + 0.27]]);
        stripes([[-0.19, y], [0.19, y], [0.0, y + 0.37]]);
        const hy = y + h;
        stripes([[x, hy - 0.08], [-0.15, hy - 0.03], [0, hy - 0.1], [0.15, hy - 0.03], [x + w, hy - 0.08], [x + w, hy], [x, hy]]);
        const [sx, sy] = Dd(d);
        C.poly(g, [[x + w, hy - 0.08], [x + w + sx, hy - 0.08 + sy], [x + w + sx, hy + sy], [x + w, hy]], { fill: P.shirtSide, ink: P.ink, lw: L * 0.8 });
        // the collar's wings
        for (const s of [-1, 1]) C.poly(g, [[s * 0.035, y], [s * 0.2, y], [s * 0.175, y + 0.125], [s * 0.06, y + 0.085]], { fill: P.collar, ink: P.ink, lw: L * 0.8 });
        // the front edge with three buttons, and a pocket's welt
        C.poly(g, [[0, y + 0.37], [0, hy - 0.1]], { ink: P.ink, lw: L * 0.8, close: false });
        for (let i = 0; i < 3; i++) {
            g.beginPath();
            g.arc(0.035, y + 0.4 + i * 0.05, 0.014, 0, TAU);
            g.fillStyle = P.button;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.55;
            g.stroke();
        }
        C.poly(g, [[0.14, y + 0.435], [0.3, y + 0.425]], { ink: P.ink, lw: L * 0.8, close: false });
        C.poly(g, [[-0.14, y + 0.435], [-0.3, y + 0.425]], { ink: P.ink, lw: L * 0.8, close: false });
    }

    // --- Howie's bass -------------------------------------------------------------------
    // A long-necked four-string: an offset body with a long upper horn in a tobacco burst
    // (dark edge, amber middle), a tortoise guard, one split pickup, two knobs, a rosewood
    // board and four big tuners on the headstock's upper edge. Same local frame as the guitar.
    const B_BODY = [[-0.43, 0.0], [-0.385, -0.2], [-0.24, -0.3], [-0.06, -0.262], [0.1, -0.272], [0.3, -0.325], [0.455, -0.315], [0.415, -0.23], [0.31, -0.14], [0.26, -0.062],
        [0.26, 0.062], [0.3, 0.14], [0.365, 0.235], [0.36, 0.305], [0.265, 0.315], [0.12, 0.272], [-0.04, 0.28], [-0.24, 0.335], [-0.395, 0.23]];
    const B_GUARD = [[0.275, -0.125], [0.12, -0.128], [-0.04, -0.115], [-0.15, -0.075], [-0.165, 0.07], [-0.27, 0.15], [-0.31, 0.24], [-0.2, 0.285], [-0.06, 0.24], [0.1, 0.226], [0.24, 0.265], [0.305, 0.25], [0.275, 0.14]];
    const B_HEAD = [[1.24, -0.04], [1.3, -0.066], [1.36, -0.098], [1.57, -0.108], [1.64, -0.078], [1.655, -0.03], [1.625, 0.012], [1.55, 0.028], [1.42, 0.03], [1.33, 0.046], [1.24, 0.04]];
    const B_NUT = 1.24, B_END = 0.2;
    function bass(g, P, L0, at, ang, sc = 1) {
        const L = L0 / sc, th = Dd(0.1);
        const body = cw(place(C.curve(B_BODY, true, 6), ang, at, sc));
        const neck = cw(place([[0.22, -0.05], [B_NUT, -0.036], [B_NUT, 0.036], [0.22, 0.05]], ang, at, sc));
        const hs = cw(place(C.curve(B_HEAD, true, 4), ang, at, sc));
        // the neck, then four big tuners (a stem and a paddle each) and the headstock in front of them
        C.prism(g, neck, th, { front: P.bNeck, top: P.bNeckSide, side: P.bNeckSide }, { lw: L0, ink: P.ink });
        g.save();
        g.translate(at[0], at[1]);
        g.rotate(ang);
        g.scale(sc, sc);
        for (let i = 0; i < 4; i++) {
            const tx = 1.375 + i * 0.068;
            C.poly(g, [[tx, -0.09], [tx, -0.16]], { ink: P.ink, lw: L * 1.7, close: false });
            g.beginPath();
            g.roundRect(tx - 0.027, -0.205 - i * 0.003, 0.054, 0.055, [0.022, 0.022, 0.008, 0.008]);
            g.fillStyle = P.chrome;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.65;
            g.stroke();
        }
        g.restore();
        C.prism(g, hs, th, { front: P.bHead, top: P.bHeadSide, side: P.bHeadSide }, { lw: L0, ink: P.ink, sweepInk: null });
        C.prismOutline(g, hs, th, { lw: L0, ink: P.ink });
        C.prism(g, body, th, { front: P.bBody, top: P.bSide, side: P.bSide }, { lw: L0, ink: P.ink, sweepInk: null });
        C.prismOutline(g, body, th, { lw: L0, ink: P.ink });
        g.save();
        g.translate(at[0], at[1]);
        g.rotate(ang);
        g.scale(sc, sc);
        // the burst: a red-brown ring and the amber middle
        C.poly(g, C.curve(B_BODY.map(([x, y]) => [x * 0.84 - 0.01, y * 0.82]), true, 6), { fill: P.bMid, lw: 0 });
        C.poly(g, C.curve(B_BODY.map(([x, y]) => [x * 0.68 - 0.02, y * 0.64]), true, 6), { fill: P.bBurst, lw: 0 });
        // the tortoise guard
        const guard = C.curve(B_GUARD, true, 5);
        C.poly(g, guard, { fill: P.bGuard, lw: 0 });
        g.save();
        C.trace(g, guard);
        g.clip();
        g.fillStyle = P.bSpot;
        for (const [bx, by, rx, ry, ra] of [[0.27, -0.17, 0.045, 0.022, -0.9], [0.14, -0.085, 0.04, 0.016, 0.1], [0.2, 0.17, 0.05, 0.022, 0.5], [0.04, 0.17, 0.045, 0.02, -0.2], [-0.1, 0.11, 0.04, 0.02, 0.7], [-0.21, 0.225, 0.045, 0.02, -0.4], [-0.02, -0.08, 0.035, 0.014, 0.2], [-0.13, 0.245, 0.03, 0.014, 0.3]]) {
            g.beginPath();
            g.ellipse(bx, by, rx, ry, ra, 0, TAU);
            g.fill();
        }
        g.restore();
        C.poly(g, guard, { ink: P.ink, lw: L * 0.8 });
        // the bridge with four saddles
        g.beginPath();
        g.roundRect(-0.355, -0.072, 0.075, 0.144, 0.012);
        g.fillStyle = P.chrome;
        g.fill();
        g.strokeStyle = P.ink;
        g.lineWidth = L * 0.8;
        g.stroke();
        g.fillStyle = P.chromeDark;
        for (let i = 0; i < 4; i++) g.fillRect(-0.325, (i - 1.5) * 0.031 - 0.009, 0.03, 0.018);
        // the split pickup: two halves, the low strings' half nearer the neck
        for (const [px, py] of [[-0.07, -0.036], [-0.13, 0.036]]) {
            g.beginPath();
            g.roundRect(px - 0.026, py - 0.036, 0.052, 0.072, 0.01);
            g.fillStyle = P.pickup;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.75;
            g.stroke();
            g.fillStyle = P.chrome;
            for (const k of [-1, 1]) {
                g.beginPath();
                g.arc(px, py + k * 0.016, 0.0075, 0, TAU);
                g.fill();
            }
        }
        // two knobs
        for (const [kx, ky] of [[-0.14, 0.175], [-0.225, 0.215]]) {
            g.beginPath();
            g.arc(kx, ky, 0.027, 0, TAU);
            g.fillStyle = P.chrome;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.7;
            g.stroke();
            g.beginPath();
            g.arc(kx, ky, 0.011, 0, TAU);
            g.fillStyle = P.chromeDark;
            g.fill();
        }
        // the board over the body, frets and dots
        C.poly(g, [[B_END, -0.05], [B_NUT, -0.036], [B_NUT, 0.036], [B_END, 0.05]], { fill: P.bNeck, ink: P.ink, lw: L * 0.8 });
        const fretX = (i) => B_NUT - (B_NUT - B_END) * (1 - Math.pow(0.91, i)) / (1 - Math.pow(0.91, 14));
        g.strokeStyle = P.chrome;
        g.lineWidth = L * 0.55;
        g.lineCap = 'butt';
        g.beginPath();
        for (let i = 1; i <= 13; i++) {
            const k = mix(0.037, 0.05, (B_NUT - fretX(i)) / (B_NUT - B_END));
            g.moveTo(fretX(i), -k);
            g.lineTo(fretX(i), k);
        }
        g.stroke();
        g.lineCap = 'round';
        g.fillStyle = P.string;
        for (const i of [3, 5, 7, 9]) {
            g.beginPath();
            g.arc((fretX(i) + fretX(i - 1)) / 2, 0, 0.0095, 0, TAU);
            g.fill();
        }
        // four heavy strings from the bridge to the nut
        const sy = (i, k) => (i - 1.5) * 0.0205 * k;
        g.strokeStyle = P.string;
        g.lineWidth = L * 0.62;
        g.beginPath();
        for (let i = 0; i < 4; i++) {
            g.moveTo(-0.31, sy(i, 1.5));
            g.lineTo(B_NUT, sy(i, 1));
        }
        g.stroke();
        C.poly(g, [[B_NUT, -0.036], [B_NUT, 0.036]], { ink: P.ink, lw: L * 1.5, close: false });
        C.poly(g, [[B_NUT, -0.031], [B_NUT, 0.031]], { ink: P.string, lw: L * 0.8, close: false });
        // the four posts on the face, each with its string
        for (let i = 0; i < 4; i++) {
            const tx = 1.375 + i * 0.068, ty = -0.058 - i * 0.003;
            g.strokeStyle = P.chromeDark;
            g.lineWidth = L * 0.45;
            g.beginPath();
            g.moveTo(B_NUT, sy(i, 1));
            g.lineTo(tx, ty);
            g.stroke();
            g.beginPath();
            g.arc(tx, ty, 0.014, 0, TAU);
            g.fillStyle = P.chrome;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.65;
            g.stroke();
        }
        g.restore();
    }

    function howieRig(pose) {
        const gAt = [-0.2, -0.5], gAng = -0.3, gSc = 0.8, pl = pose.pluck ?? 0;
        const onG = (p) => {
            const r = rot(p, gAng);
            return [r[0] * gSc + gAt[0], r[1] * gSc + gAt[1]];
        };
        const shR = [H_TORSO.x + 0.03, H_TORSO.y + 0.13], shL = [H_TORSO.x + H_TORSO.w - 0.03, H_TORSO.y + 0.13];
        return {
            gAt, gAng, gSc, onG, shR, shL,
            fret: onG([0.62 + 0.42 * (pose.fret ?? 0.3), 0.035]),
            hand: onG([0.115 + pl * 0.012, -0.07 + pl * 0.03]),
        };
    }

    /**
     * Howie with his bass.
     *   pose: { squash, lean, headDy, headTilt, sway, eyes: 'open' | 'shut' | 'wide', mouth: 'smirk' | 'grin' | 'sing' | 'o',
     *           pluck (-1..1: the plucking mitt across the strings), fret (0..1 along the neck), shades (null or 0 → 1) }
     */
    function howie(g, x, y, s, pose = {}, P = HOWIE) {
        const L = 3.2 / s, q = pose.squash ?? 0, R = howieRig(pose);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.fillStyle = P.shadow;
        g.beginPath();
        g.ellipse(0.05, 0.0, 0.56 * (1 + q), 0.06, 0, 0, TAU);
        g.fill();
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        Cast.legs(g, P, L);
        howieTorso(g, P, L);
        const horn = R.onG([0.38, -0.27]);
        C.poly(g, [[0.2, H_TORSO.y + 0.015], [0.285, H_TORSO.y + 0.015], [horn[0] + 0.045, horn[1]], [horn[0] - 0.04, horn[1] + 0.01]], { fill: P.strap, ink: P.ink, lw: L * 0.7 });
        g.save();
        g.translate(0, NECK + (pose.headDy ?? 0));
        g.rotate(pose.headTilt ?? 0);
        g.translate(0, -NECK);
        howieHead(g, P, L, pose);
        g.restore();
        bass(g, P, L, R.gAt, R.gAng, R.gSc);
        const sleeve = { sleeve: P.shirt, sleeveTop: P.shirtTop, sleeveSide: P.shirtSide, cuff: P.cuff };
        arm(g, P, L, R.shL, R.fret, sleeve, { stripe: P.stripe });
        arm(g, P, L, R.shR, R.hand, sleeve, { stripe: P.stripe });
        g.restore();
    }

    // --- anchors ---------------------------------------------------------------------------
    // points(who, pose) → named points in figure units, for the choreography: multiply by s and
    // add the ground point. They follow lean, squash and the solo stance (not the head's own
    // tilt): headTop, strings (over the pickups), headstock (the neck's far end), fretHand,
    // pickHand, bodyEnd (the instrument's butt), mouth.
    function points(who, pose = {}) {
        const isM = who === 'mike', R = isM ? mikeRig(pose) : howieRig(pose), q = pose.squash ?? 0, lean = pose.lean ?? 0;
        const up = (p) => {
            if (!isM) return p;
            const r = rot([p[0], p[1] - HIP + 0.025 * R.solo], R.back);
            return [r[0] + R.fwd, r[1] + HIP];
        };
        const out = (p) => {
            const u = up(p);
            return rot([u[0] * (1 + q), u[1] * (1 - q)], lean);
        };
        const H = isM ? M_HEAD : H_HEAD;
        return {
            headTop: out([0, H.top - (isM ? 0.04 : 0.1) + (pose.headDy ?? 0)]),
            mouth: out([0, H.top + 0.765 + (pose.headDy ?? 0)]),
            strings: out(R.onG([isM ? -0.06 : -0.08, 0])),
            headstock: out(R.onG([isM ? 1.28 : 1.65, -0.03])),
            bodyEnd: out(R.onG([isM ? -0.385 : -0.43, 0])),
            fretHand: out(R.fret),
            pickHand: out(R.hand),
        };
    }

    return { MIKE, HOWIE, print, mike, howie, guitar: strat, bass, points, solid, arm };
})();
