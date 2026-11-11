// The rhythm section: Benmont at his keyboard and Stan behind the drum kit, box people of the
// same family as Cast.tom (same head and torso boxes, slot eyes, block mitts, no fingers).
// Each is told apart by the hair's silhouette, the clothes and the instrument.
//
// Units: 1 = the head's width class; y grows downwards; the origin is the ground point given
// to the drawer. Everything is laid out in the cast's oblique projection: a point `z` further
// from the camera sits Cast.D · z up and to the right, so tops and right sides show.
// Global: BandRhythm. Depends on Cereal and Cast.
const BandRhythm = (() => {
    const C = Cereal, K = C.COL, D = Cast.D, Dd = Cast.Dd, TAU = Math.PI * 2;
    const lerp = (a, b, u) => a + (b - a) * u;
    const mix = (p, q, u) => [lerp(p[0], q[0], u), lerp(p[1], q[1], u)];
    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const rotAbout = (p, c, a) => {
        const q = rot([p[0] - c[0], p[1] - c[1]], a);
        return [q[0] + c[0], q[1] + c[1]];
    };
    const cw = (pts) => {
        let a = 0;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i], q = pts[(i + 1) % pts.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return a > 0 ? pts : pts.slice().reverse();
    };
    const unit = (p, q) => {
        const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1e-6;
        return [dx / l, dy / l, l];
    };

    // --- palettes ------------------------------------------------------------------------
    const SKIN = { skin: '#f7c9a3', skinTop: '#fcdfc6', skinSide: '#e0a17b', eye: '#1d1626', mouth: '#7a1f2e', tongue: '#ff8fa3', glint: '#ffffff' };
    const METAL = { chrome: '#d5dbea', chromeTop: '#f1f4fb', chromeDark: '#8d95ad', rubber: '#2a2438' };
    const BEN = {
        ink: K.ink, ...SKIN, ...METAL,
        hair: '#6e3f24', hairTop: '#8f5a37', hairSide: '#4b2917', hairLine: '#371c0f',
        shirt: '#35b964', shirtTop: '#6ddb92', shirtSide: '#238a4b', shirtDark: '#2a9d55', cuff: '#59cf83', cuffSide: '#2f9e5a', snap: '#fffdf4',
        jeans: '#4a7fe0', jeansSide: '#345fb6', shoe: '#7b4526', shoeTop: '#99603c', shoeSide: '#55301b', sole: '#f3d9a4',
        kb: '#f0522a', kbTop: '#ff7d4d', kbSide: '#b5361a', panel: '#2a2438', panelSide: '#1f1a2b', keyW: '#fffdf4', keyFront: '#e4dccb', keyB: '#2a2438',
        tabs: ['#fffdf4', '#fffdf4', '#f0352f', '#ffe62e', '#fffdf4', '#17b8a6'],
        shadow: 'rgba(36,21,49,0.28)',
    };
    const STAN = {
        ink: K.ink, ...SKIN, ...METAL,
        hair: '#56301f', hairTop: '#754630', hairSide: '#391e13', hairLine: '#2a140c',
        jacket: '#3d3a72', jacketTop: '#57548f', jacketSide: '#2a2750', lapel: '#4b4885',
        stripeA: '#6f35cf', stripeB: '#5cb8ff', collar: '#a67cf0',
        jeans: '#3f6fd0', jeansSide: '#2c52a6', shoe: '#2a2438', shoeTop: '#3d3652', shoeSide: '#1f1a2b', sole: '#fffdf4',
        shell: '#2f9bea', shellTop: '#7fcbff', shellSide: '#1b6cbb', band: '#fffdf4', bandSide: '#cfd3e6',
        hoop: '#4a4470', hoopSide: '#353055', inlay: '#fff1c4', head: '#fff1c4', headRing: '#e6cf96', heart: '#f0352f',
        cym: '#ffc21f', cymLight: '#ffe07a', cymEdge: '#d99413', cymBell: '#c27e0c',
        stick: '#f3d9a4', stickTop: '#fbeac4', stickSide: '#c9a567', seat: '#4a4470', seatTop: '#625c8c', seatSide: '#353055',
        shadow: 'rgba(36,21,49,0.28)',
    };

    // --- shared parts ----------------------------------------------------------------------
    // A thin tube (a stand, a leg): the line twice, ink under metal.
    function tube(g, pts, w, col, L, ink = K.ink, cap = 'round') {
        for (const [c, lw] of [[ink, w + L * 2], [col, w]]) {
            C.trace(g, pts, false);
            g.strokeStyle = c;
            g.lineWidth = lw;
            g.lineJoin = 'round';
            g.lineCap = cap;
            g.stroke();
        }
    }
    const dot = (g, x, y, r, fill, ink, lw) => {
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        g.fillStyle = fill;
        g.fill();
        if (ink) {
            g.strokeStyle = ink;
            g.lineWidth = lw;
            g.stroke();
        }
    };

    // The cast's face, on a head whose top is at `top`: slot eyes under half lids, a hooked
    // nose, a mouth. o: { eyes: 'open' | 'shut' | 'wide', mouth: 'smirk' | 'grin' | 'sing' | 'o', shades }
    function face(g, P, L, o, top) {
        const ey = top + 0.53, mx = 0, my = top + 0.775;
        if (o.shades == null || o.shades < 1) {
            for (const s of [-1, 1]) {
                const ex = s * 0.155, ew = 0.075, eh = o.eyes === 'wide' ? 0.19 : 0.16;
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
            g.ellipse(mx, my + 0.012, 0.052, 0.062, 0, 0, TAU);
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
    // Sunglasses that slide down from the hair (shades 0 → 1) and sit on the nose; `fx` is
    // where the temples end (the edge of the face), `bot` the chin.
    function shades(g, P, L, o, top, fx, bot) {
        if (o.shades == null || o.shades <= 0) return;
        const ey = top + 0.53, k = Math.min(1, o.shades), sy = ey - 0.005 - (1 - k) * 0.5;
        g.save();
        g.beginPath();
        g.rect(-fx - 0.2, top - 0.6, fx * 2 + 0.4, bot - top + 0.6); // never below the chin
        g.clip();
        for (const s of [-1, 1]) {
            const cx = s * 0.158;
            const lens = [[cx - 0.125, sy - 0.07], [cx + 0.125, sy - 0.07], [cx + 0.11, sy + 0.055], [cx + 0.065, sy + 0.085], [cx - 0.065, sy + 0.085], [cx - 0.11, sy + 0.055]];
            C.poly(g, lens, { fill: P.eye, ink: P.ink, lw: L });
            C.poly(g, [[cx - 0.085, sy + 0.035], [cx - 0.02, sy - 0.04]], { ink: P.glint, lw: L * 1.2, close: false });
            C.poly(g, [[cx - 0.02, sy + 0.04], [cx + 0.02, sy - 0.005]], { ink: P.glint, lw: L * 0.8, close: false });
            C.poly(g, [[s * 0.283, sy - 0.045], [s * fx, sy - 0.055]], { ink: P.ink, lw: L * 1.3, close: false });
        }
        C.poly(g, [[-0.04, sy - 0.05], [0.04, sy - 0.05]], { ink: P.ink, lw: L * 1.6, close: false });
        g.restore();
    }

    // A run of round bumps along the anchors (the scalloped edge of a mass of curls). The
    // bumps swell to the left of the direction of travel on screen, i.e. outwards on a
    // clockwise outline. k: how far each one swells, as a fraction of its chord.
    function bumps(anchors, k = 0.34, closed = true, m = 7) {
        const out = [], n = anchors.length, last = closed ? n : n - 1;
        for (let i = 0; i < last; i++) {
            const p = anchors[i], q = anchors[(i + 1) % n];
            const [ux, uy, l] = unit(p, q), nx = uy, ny = -ux;
            for (let j = 0; j < m; j++) {
                const a = (j / m) * Math.PI, b = mix(p, q, (1 - Math.cos(a)) / 2), h = Math.sin(a) * k * l;
                out.push([b[0] + nx * h, b[1] + ny * h]);
            }
        }
        if (!closed) out.push(anchors[n - 1]);
        return out;
    }
    // A rounded or scalloped front shape swept back, outlined round its silhouette only (no
    // facet lines, no ridge at every cusp); colAt(x, y) picks the tone of each swept face.
    function solidRound(g, pts, dd, colAt, front, L, ink) {
        const n = pts.length, quads = [];
        for (let i = 0; i < n; i++) {
            const a = pts[i], b = pts[(i + 1) % n];
            if ((b[1] - a[1]) * dd[0] - (b[0] - a[0]) * dd[1] <= 1e-9) continue;
            quads.push([[a, b, [b[0] + dd[0], b[1] + dd[1]], [a[0] + dd[0], a[1] + dd[1]]], colAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)]);
        }
        const back = pts.map(([px, py]) => [px + dd[0], py + dd[1]]);
        for (const q of [back, pts, ...quads.map((q) => q[0])]) C.poly(g, q, { ink, lw: L * 2 });
        C.poly(g, back, { fill: quads.length ? quads[0][1] : front, lw: 0 });
        for (const [q, col] of quads) C.poly(g, q, { fill: col, ink: col, lw: 0.004 });
        C.poly(g, pts, { fill: front, ink, lw: L });
    }

    // --- Benmont ---------------------------------------------------------------------------
    const B_HEAD = { w: 0.86, h: 0.92, top: -1.85, d: 0.42 };
    const B_TORSO = { x: -0.36, y: -0.98, w: 0.72, h: 0.62, d: 0.4 };
    // His head: a big round mass of dark curls (a scalloped silhouette wider than the head
    // box, curl marks inside), the face a panel in a scalloped window.
    function benHead(g, P, L, o = {}) {
        const { h, top, d } = B_HEAD, bot = top + h, sw = o.sway ?? 0, fx = 0.31, fy = top + 0.2;
        const cy = top + 0.4, rx = 0.51, ry = 0.48, N = 14, e = 2.6;
        const anchors = [];
        for (let i = 0; i < N; i++) {
            const a = -Math.PI / 2 + ((i + 0.5) / N) * TAU, ca = Math.cos(a), sa = Math.sin(a);
            const r = Math.pow(Math.pow(Math.abs(ca) / rx, e) + Math.pow(Math.abs(sa) / ry, e), -1 / e);
            const y = Math.min(cy + sa * r, bot - 0.115); // nothing hangs under the chin
            anchors.push([ca * r + sw * ((bot - y) / h), y]);
        }
        const blob = bumps(anchors, 0.33, true, 8), dd = Dd(d);
        solidRound(g, blob, dd, (x, y) => ((cy - y) / Math.hypot(x, y - cy) > 0.5 ? P.hairTop : P.hairSide), P.hair, L, P.ink);
        // the face
        const panel = [[-fx, fy], [fx, fy], [fx, bot - 0.1], [fx - 0.09, bot - 0.005], [-fx + 0.09, bot - 0.005], [-fx, bot - 0.1]];
        C.poly(g, panel, { fill: P.skin, ink: P.ink, lw: L });
        face(g, P, L, o, top);
        // the window's edge: curls over the brow and down the cheeks
        const win = bumps([[0.315, top + 0.7], [0.305, top + 0.55], [0.3, top + 0.4], [0.2, top + 0.3], [0.07, top + 0.29], [-0.07, top + 0.29], [-0.2, top + 0.3], [-0.3, top + 0.4], [-0.305, top + 0.55], [-0.315, top + 0.7]], 0.32, false, 7);
        C.poly(g, [[-0.34, top + 0.7], [-0.34, fy - 0.025], [0.34, fy - 0.025], [0.34, top + 0.7], ...win], { fill: P.hair, lw: 0 });
        C.poly(g, win, { ink: P.ink, lw: L, close: false });
        // curl marks: little hooks all over the mass
        g.save();
        C.trace(g, blob);
        g.clip();
        g.strokeStyle = P.hairLine;
        g.lineWidth = L * 0.75;
        g.lineCap = 'round';
        const marks = [[-0.33, 0.0, 2.6], [-0.12, -0.045, 3.4], [0.1, -0.04, 2.2], [0.31, 0.02, 3.9], [-0.22, 0.135, 4.6], [0.0, 0.1, 2.9], [0.21, 0.13, 5.2],
            [-0.455, 0.2, 3.2], [-0.47, 0.42, 4.4], [-0.44, 0.63, 2.4], [0.45, 0.2, 5.6], [0.47, 0.42, 3.0], [0.44, 0.63, 4.9], [-0.375, 0.8, 3.6], [0.375, 0.8, 2.0]];
        for (const [mx, my, a0] of marks) {
            const x = mx + sw * (1 - my / h), y = top + my;
            g.beginPath();
            g.arc(x, y, 0.042, a0, a0 + 4.1);
            g.stroke();
        }
        g.restore();
        shades(g, P, L, o, top, fx, bot);
    }

    // A green western shirt: a pointed collar, a snap placket, two chest pockets with pointed
    // snap flaps.
    function benTorso(g, P, L) {
        const { x, y, w, h, d } = B_TORSO;
        C.box(g, x, y, w, h, D, { front: P.shirt, top: P.shirtTop, side: P.shirtSide }, { lw: L, ink: P.ink, depth: d });
        // the placket and its snaps
        C.poly(g, [[-0.032, y + 0.1], [0.032, y + 0.1], [0.032, y + h], [-0.032, y + h]], { fill: P.shirtDark, ink: P.ink, lw: L * 0.6 });
        for (let i = 0; i < 4; i++) dot(g, 0, y + 0.2 + i * 0.1, 0.015, P.snap);
        // pockets, then their flaps
        for (const s of [-1, 1]) {
            const p0 = s > 0 ? 0.085 : -0.305, pw = 0.22, py = y + 0.235;
            C.poly(g, [[p0, py], [p0 + pw, py], [p0 + pw, py + 0.24], [p0, py + 0.24]], { ink: P.ink, lw: L * 0.6 });
            C.poly(g, [[p0 - 0.012, py - 0.02], [p0 + pw + 0.012, py - 0.02], [p0 + pw + 0.012, py + 0.05], [p0 + pw / 2, py + 0.105], [p0 - 0.012, py + 0.05]], { fill: P.shirtDark, ink: P.ink, lw: L * 0.7 });
            dot(g, p0 + pw / 2, py + 0.062, 0.017, P.snap);
        }
        // the open neck and the collar's two points
        C.poly(g, [[-0.09, y], [0.09, y], [0, y + 0.13]], { fill: P.skin, ink: P.ink, lw: L * 0.8 });
        for (const s of [-1, 1]) C.poly(g, [[s * 0.09, y], [s * 0.27, y], [s * 0.2, y + 0.175], [0, y + 0.13]], { fill: P.shirtTop, ink: P.ink, lw: L * 0.8 });
    }

    // An arm in a rolled sleeve: the sleeve to the elbow, the roll, a bare forearm, the mitt.
    function armRolled(g, P, L, sh, hand) {
        const w = 0.15, [ux, uy, len] = unit(sh, hand);
        const quad = (a, b, ww = w) => {
            const nx = -uy * ww * 0.5, ny = ux * ww * 0.5;
            return cw([[sh[0] + ux * a + nx, sh[1] + uy * a + ny], [sh[0] + ux * b + nx, sh[1] + uy * b + ny], [sh[0] + ux * b - nx, sh[1] + uy * b - ny], [sh[0] + ux * a - nx, sh[1] + uy * a - ny]]);
        };
        const cut = Math.max(0.02, len - 0.07), e = Math.max(0.03, Math.min(cut - 0.05, len * 0.46));
        const skin = { front: P.skin, top: P.skinTop, side: P.skinSide };
        C.prism(g, quad(-0.05, e), Dd(0.15), { front: P.shirt, top: P.shirtTop, side: P.shirtSide }, { lw: L, ink: P.ink });
        C.prism(g, quad(e, cut), Dd(0.15), skin, { lw: L, ink: P.ink });
        C.prism(g, quad(e - 0.04, e + 0.015, w + 0.035), Dd(0.165), { front: P.cuff, top: P.shirtTop, side: P.cuffSide }, { lw: L, ink: P.ink });
        C.prism(g, quad(cut, len + 0.1), Dd(0.15), skin, { lw: L, ink: P.ink });
    }

    // The keyboard: a combo organ slab on an X stand, standing in front of him (towards the
    // camera, so down and to the left). Its top face shows the keys and the control strip.
    const KB = { w: 1.64, th: 0.15, dep: 0.66, zf: -0.72, top: 0.6, cheek: 0.07, keys: 18, keyDep: 0.42 };
    const kbOrigin = (press = 0) => [-KB.w / 2 + D[0] * KB.zf, -KB.top + D[1] * KB.zf + 0.012 * press]; // the front face's top left corner
    // A point on the keys: u 0..1 from the lowest key (screen left) to the highest, dep 0..1 from the front edge back.
    function keyPoint(u, press = 0, dep = 0.48) {
        const o = kbOrigin(press), kw = KB.w - KB.cheek * 2;
        return [o[0] + KB.cheek + kw * u + D[0] * KB.keyDep * dep, o[1] + D[1] * KB.keyDep * dep];
    }
    function keyboard(g, P, L, press = 0) {
        const { w, th, dep, zf, cheek, keys, keyDep } = KB;
        const [x0, y0] = kbOrigin(press);
        const chrome = { front: P.chrome, top: P.chromeTop, side: P.chromeDark };
        // the X stand: two feet and two arms running front to back, the crossed bars between
        const zc = zf + dep / 2, at = (x, hgt, z) => [x + D[0] * z, -hgt + D[1] * z];
        const railZ = zf + 0.07, railDep = dep - 0.14;
        for (const sx of [-1, 1]) {
            const [ax, ay] = at(sx * 0.5 - 0.03, KB.top - th + 0.012, railZ);
            C.box(g, ax, ay, 0.06, 0.06, D, chrome, { lw: L, ink: P.ink, depth: railDep });
            C.box(g, ax - 0.006, ay - 0.004, 0.072, 0.068, D, { front: P.rubber, top: '#3d3652', side: P.panelSide }, { lw: L, ink: P.ink, depth: 0.06 });
        }
        for (const sx of [1, -1]) {
            const a = at(sx * 0.5, KB.top - th - 0.02, zc), b = at(-sx * 0.5, 0.045, zc), [ux, uy] = unit(a, b), nx = -uy * 0.026, ny = ux * 0.026;
            C.prism(g, cw([[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]]), Dd(0.05), chrome, { lw: L, ink: P.ink });
        }
        const piv = at(0, (KB.top - th - 0.02 + 0.045) / 2, zc);
        dot(g, piv[0], piv[1], 0.034, P.chromeDark, P.ink, L * 0.8);
        dot(g, piv[0], piv[1], 0.012, P.chromeTop);
        for (const sx of [-1, 1]) {
            const [fx, fy] = at(sx * 0.5 - 0.035, 0.07, railZ);
            C.box(g, fx, fy, 0.07, 0.07, D, chrome, { lw: L, ink: P.ink, depth: railDep });
            C.box(g, fx - 0.008, fy - 0.006, 0.086, 0.082, D, { front: P.rubber, top: '#3d3652', side: P.panelSide }, { lw: L, ink: P.ink, depth: 0.07 });
        }
        // the slab
        C.box(g, x0, y0, w, th, D, { front: P.kb, top: P.kbTop, side: P.kbSide }, { lw: L, ink: P.ink, depth: dep });
        const T = (x, dz) => [x0 + x + D[0] * dz, y0 + D[1] * dz];
        const kw = (w - cheek * 2) / keys;
        // the base band, on the front and round the side
        C.poly(g, [[x0, y0 + th - 0.036], [x0 + w, y0 + th - 0.036], [x0 + w, y0 + th], [x0, y0 + th]], { fill: P.panel, ink: P.ink, lw: L * 0.7 });
        C.poly(g, [[x0 + w, y0 + th - 0.036], [T(w, dep)[0], T(w, dep)[1] + th - 0.036], [T(w, dep)[0], T(w, dep)[1] + th], [x0 + w, y0 + th]], { fill: P.panelSide, ink: P.ink, lw: L * 0.7 });
        // a plain badge plate
        C.poly(g, [[x0 + w - 0.3, y0 + 0.062], [x0 + w - 0.1, y0 + 0.062], [x0 + w - 0.1, y0 + 0.096], [x0 + w - 0.3, y0 + 0.096]], { fill: P.chrome, ink: P.ink, lw: L * 0.6 });
        // the keys: their fronts on the slab's face, their tops on its top
        C.poly(g, [[x0 + cheek, y0], [x0 + w - cheek, y0], [x0 + w - cheek, y0 + 0.04], [x0 + cheek, y0 + 0.04]], { fill: P.keyFront, ink: P.ink, lw: L * 0.7 });
        C.poly(g, [T(cheek, 0), T(w - cheek, 0), T(w - cheek, keyDep), T(cheek, keyDep)], { fill: P.keyW, ink: P.ink, lw: L * 0.7 });
        g.strokeStyle = P.ink;
        g.lineWidth = L * 0.45;
        g.lineCap = 'butt';
        g.beginPath();
        for (let i = 1; i < keys; i++) {
            const a = T(cheek + i * kw, keyDep), b = T(cheek + i * kw, 0);
            g.moveTo(a[0], a[1]);
            g.lineTo(b[0], b[1]);
            g.lineTo(b[0], b[1] + 0.04);
        }
        g.stroke();
        for (let i = 0; i < keys - 1; i++) {
            if (![0, 1, 3, 4, 5].includes(i % 7)) continue;
            const xc = cheek + (i + 1) * kw, bw = kw * 0.3;
            C.poly(g, [T(xc - bw, keyDep * 0.4), T(xc + bw, keyDep * 0.4), T(xc + bw, keyDep), T(xc - bw, keyDep)], { fill: P.keyB, lw: 0 });
        }
        C.poly(g, [T(cheek, 0), T(w - cheek, 0), T(w - cheek, keyDep), T(cheek, keyDep)], { ink: P.ink, lw: L * 0.7 });
        // the control strip: rocker tabs in two banks and two knobs
        C.poly(g, [T(0.035, keyDep + 0.045), T(w - 0.035, keyDep + 0.045), T(w - 0.035, dep - 0.03), T(0.035, dep - 0.03)], { fill: P.panel, ink: P.ink, lw: L * 0.7 });
        const d0 = keyDep + 0.085, d1 = dep - 0.065;
        for (const bank of [0.12, w - 0.12 - 6 * 0.062 + 0.017]) {
            P.tabs.forEach((col, i) => {
                const tx = bank + i * 0.062;
                C.poly(g, [T(tx, d0), T(tx + 0.045, d0), T(tx + 0.045, d1), T(tx, d1)], { fill: col, lw: 0 });
            });
        }
        for (const kx of [0.6, 0.7]) {
            const p = T(kx, (d0 + d1) / 2);
            dot(g, p[0], p[1], 0.02, P.chrome);
        }
    }

    /**
     * Benmont at his keyboard.
     *   x, y   the ground between his feet (the keyboard stands in front of him: its stand's feet reach
     *          0.14 below and its slab 1.04 to the left / 0.8 to the right of that point, in figure units)
     *   s      logical units per figure unit
     *   pose: { squash, lean, headDy, headTilt, sway (the curls), eyes ('open' | 'shut' | 'wide'),
     *           mouth ('smirk' | 'grin' | 'sing' | 'o'), handR and handL (0..1 along the keys, screen left
     *           to right; handR is his right mitt, the one on screen left), press (0..1: the mitts push
     *           down and the slab dips), shades (null, or 0 → 1 as they slide on) }
     */
    function benmont(g, x, y, s, pose = {}, P = BEN) {
        const L = 3.2 / s, q = pose.squash ?? 0, lean = pose.lean ?? 0, press = clamp01(pose.press ?? 0);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.fillStyle = P.shadow;
        g.beginPath();
        g.ellipse(0.05, 0.0, 0.56 * (1 + q), 0.06, 0, 0, TAU);
        g.moveTo(-0.1 + 0.78, 0.085);
        g.ellipse(-0.1, 0.085, 0.78, 0.075, 0, 0, TAU);
        g.fill();
        g.save();
        g.rotate(lean);
        g.scale(1 + q, 1 - q);
        Cast.legs(g, P, L);
        benTorso(g, P, L);
        g.save();
        g.translate(0, pose.headDy ?? 0);
        g.rotate(pose.headTilt ?? 0);
        benHead(g, P, L, pose);
        g.restore();
        g.restore();
        keyboard(g, P, L, press);
        // the mitts rest on the keys; the shoulders follow the body
        const body = ([px, py]) => rot([px * (1 + q), py * (1 - q)], lean);
        for (const [sx, u] of [[-1, pose.handR ?? 0.27], [1, pose.handL ?? 0.73]]) {
            const sh = body([sx * (B_TORSO.w / 2 - 0.03), B_TORSO.y + 0.13]);
            const tip = keyPoint(clamp01(u), press);
            tip[1] += 0.014 * press;
            const [ux, uy] = unit(sh, tip);
            armRolled(g, P, L, sh, [tip[0] - ux * 0.1, tip[1] - uy * 0.1]);
        }
        g.restore();
    }

    // --- the drum kit ----------------------------------------------------------------------
    // A circle lying flat (a drum head, a cymbal) is a sheared ellipse in this projection.
    const A0 = Math.atan(D[0]); // where its outline is furthest right
    const flat = (c, r, a) => [c[0] + r * Math.cos(a) + D[0] * r * Math.sin(a), c[1] + D[1] * r * Math.sin(a)];
    const ring = (c, r, tilt = 0, n = 44) => Array.from({ length: n }, (_, i) => rotAbout(flat(c, r, (i / n) * TAU), c, tilt));

    // An upright cylinder (a tom, a snare, a seat): c is the middle of its top face.
    // cols: { front, side, top }  o: { hoop (height), hoopCol, hoopDark, lugs, lugCol, lugDark, band: [col, dark] }
    function can(g, c, r, h, cols, L, o = {}) {
        const { ink = K.ink, hoop = 0, hoopCol, hoopDark, lugs = 0, lugCol, lugDark, band = null } = o;
        const n = 28;
        const arc = (dy) => Array.from({ length: n + 1 }, (_, i) => {
            const p = flat(c, r, A0 + Math.PI + (i / n) * Math.PI);
            return [p[0], p[1] + dy];
        });
        const strip = (a, b) => [...arc(a), ...arc(b).reverse()];
        const xs = c[0] + r * 0.4; // the shell turns away from the light here
        const two = (pts, a, b) => {
            C.poly(g, pts, { fill: a, lw: 0 });
            g.save();
            C.trace(g, pts);
            g.clip();
            g.fillStyle = b;
            g.fillRect(xs, c[1] - r, r * 2, h + r * 2);
            g.restore();
        };
        const shell = strip(0, h);
        two(shell, cols.front, cols.side);
        if (band) two(strip(h * 0.4, h * 0.6), band[0], band[1]);
        if (hoop) {
            for (let i = 0; i < lugs; i++) {
                const p = flat(c, r, A0 + Math.PI + ((i + 0.5) / lugs) * Math.PI), lh = Math.min(0.1, h * 0.42), dark = p[0] > xs;
                C.poly(g, [[p[0], p[1] + hoop], [p[0], p[1] + h - hoop]], { ink: lugDark, lw: L * 0.5, close: false });
                C.poly(g, [[p[0] - 0.02, p[1] + h / 2 - lh / 2], [p[0] + 0.02, p[1] + h / 2 - lh / 2], [p[0] + 0.02, p[1] + h / 2 + lh / 2], [p[0] - 0.02, p[1] + h / 2 + lh / 2]], { fill: dark ? lugDark : lugCol, ink, lw: L * 0.55 });
            }
            two(strip(0, hoop), hoopCol, hoopDark);
            two(strip(h - hoop, h), hoopCol, hoopDark);
            C.poly(g, arc(hoop), { ink, lw: L * 0.6, close: false });
            C.poly(g, arc(h - hoop), { ink, lw: L * 0.6, close: false });
        }
        C.poly(g, shell, { ink, lw: L });
        C.poly(g, ring(c, r), { fill: cols.top, ink, lw: L });
    }

    // A cymbal seen at the oblique angle: gold, a darker edge and bell, a lathing ring.
    function cymbal(g, P, L, c, r, tilt = 0) {
        C.poly(g, ring(c, r, tilt).map(([px, py]) => [px, py + 0.016]), { fill: P.cymBell, ink: P.ink, lw: L });
        C.poly(g, ring(c, r, tilt), { fill: P.cymEdge, ink: P.ink, lw: L });
        C.poly(g, ring(c, r * 0.8, tilt), { fill: P.cym, lw: 0 });
        C.poly(g, ring(c, r * 0.52, tilt), { ink: P.cymEdge, lw: L * 0.5 });
        // a glint on the near left
        const gl = Array.from({ length: 7 }, (_, i) => rotAbout(flat(c, r * 0.66, Math.PI * (1.08 + 0.05 * i)), c, tilt));
        C.poly(g, gl, { ink: P.cymLight, lw: L * 0.9, close: false });
        // the bell: a low dome
        const up = rot([0, -0.022], tilt), bc = [c[0] + up[0], c[1] + up[1]];
        C.poly(g, ring(c, r * 0.24, tilt), { fill: P.cymBell, ink: P.ink, lw: L * 0.7 });
        C.poly(g, ring(bc, r * 0.17, tilt), { fill: P.cymEdge, ink: P.ink, lw: L * 0.6 });
    }
    // A stand's base: a hub on the column and three legs with rubber feet.
    function tripod(g, P, L, x, hub, ground, spread = 0.16) {
        const feet = [[x - spread, ground + 0.004], [x + spread, ground - 0.006], [x - spread * 0.32, ground + spread * 0.24]];
        for (const f of [feet[1], feet[0], feet[2]]) {
            tube(g, [[x, hub], f], 0.028, P.chrome, L, P.ink);
            dot(g, f[0], f[1], 0.022, P.rubber, P.ink, L * 0.6);
        }
    }
    const collar = (g, P, L, x, y, w = 0.07, h = 0.05) => C.box(g, x - w / 2, y - h / 2, w, h, D, { front: P.chrome, top: P.chromeTop, side: P.chromeDark }, { lw: L * 0.8, ink: P.ink, depth: 0.05 });

    // Where the kit's pieces are (figure units from the ground point under the bass drum).
    const KIT = {
        bass: { c: [-0.066, -0.336], r: 0.38, depth: 0.44 }, // c: the middle of the head facing us
        tom: { c: [-0.22, -0.92], r: 0.16, h: 0.13 }, // c: the middle of the top head
        snare: { c: [-0.7, -0.67], r: 0.23, h: 0.13, ground: -0.05 },
        floor: { c: [0.87, -0.62], r: 0.25, h: 0.4, ground: -0.06 },
        hat: { c: [1.2, -0.86], r: 0.2, ground: -0.07 },
        crash: { c: [1.24, -1.56], r: 0.27, tilt: -0.1, foot: [1.47, -0.11] },
        ride: { c: [-1.0, -1.2], r: 0.28, tilt: 0.1, ground: -0.1 },
        seat: [0.195, -0.5], // the middle of Stan's seat: his torso stands on it
    };

    // The cracked heart on the bass drum's head: round `c`, half as wide as `hw`.
    function heart(g, P, L, c, hw) {
        const k = hw / 16, pts = [];
        for (let i = 0; i < 48; i++) {
            const t = (i / 48) * TAU;
            pts.push([c[0] + 16 * Math.pow(Math.sin(t), 3) * k, c[1] - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) + 2.5) * k]);
        }
        const zig = [[0.5, -9.5], [-3.6, -3.4], [2.8, -0.2], [-2.8, 4.6], [2.0, 8.4], [-0.3, 16.5]].map(([zx, zy]) => [c[0] + zx * k, c[1] + zy * k]);
        C.poly(g, pts, { fill: P.heart, lw: 0 });
        g.save();
        C.trace(g, pts);
        g.clip();
        C.poly(g, zig, { ink: P.ink, lw: 2.2 * k + L * 1.6, close: false });
        C.poly(g, zig, { ink: P.head, lw: 2.2 * k, close: false });
        g.restore();
        C.poly(g, pts, { ink: P.ink, lw: L });
        // the crack opens the outline at both ends
        g.lineCap = 'butt';
        for (const [a, b] of [[zig[0], zig[1]], [zig[5], zig[4]]]) {
            const [ux, uy] = unit(a, b);
            C.trace(g, [[a[0] - ux * k * 1.4, a[1] - uy * k * 1.4], [a[0] + ux * k * 1.2, a[1] + uy * k * 1.2]], false);
            g.strokeStyle = P.head;
            g.lineWidth = 2.2 * k;
            g.stroke();
        }
        g.lineCap = 'round';
    }

    // The bass drum facing the camera, with the rack tom on it. k: the kick's pulse.
    function bassDrum(g, P, L, k) {
        const { c, r, depth } = KIT.bass, dd = Dd(depth), phi = Math.atan2(dd[1], dd[0]);
        const on = (a, z) => [c[0] + Math.cos(a) * r + dd[0] * z, c[1] + Math.sin(a) * r + dd[1] * z]; // a point of the shell
        const patch = (a0, a1, z0, z1, n = 16) => [...Array.from({ length: n + 1 }, (_, i) => on(lerp(a0, a1, i / n), z0)), ...Array.from({ length: n + 1 }, (_, i) => on(lerp(a1, a0, i / n), z1))];
        const aS = phi - Math.PI / 2, aE = phi + Math.PI / 2, aTop = -0.82;
        // the far spur shows past the head's edge
        tube(g, [on(2.55, 0.5), [-0.55, 0.0]], 0.03, P.chrome, L, P.ink);
        dot(g, -0.55, 0.0, 0.024, P.rubber, P.ink, L * 0.6);
        C.drum(g, c[0], c[1], r, dd, { front: P.hoop, side: P.shellSide }, { lw: L, ink: P.ink });
        C.poly(g, patch(aS, aTop, 0, 1), { fill: P.shellTop, lw: 0 });
        // the white band round the middle, the lugs on it, the hoops at both rims
        C.poly(g, patch(aS, aTop, 0.4, 0.6), { fill: P.band, lw: 0 });
        C.poly(g, patch(aTop, aE, 0.4, 0.6), { fill: P.bandSide, lw: 0 });
        for (const a of [-1.92, -1.36, -0.5, 0.06, 0.62]) {
            C.poly(g, [on(a, 0.1), on(a, 0.9)], { ink: P.chromeDark, lw: L * 0.5, close: false });
            C.poly(g, [on(a - 0.06, 0.34), on(a + 0.06, 0.34), on(a + 0.06, 0.66), on(a - 0.06, 0.66)], { fill: a > aTop ? P.chromeDark : P.chrome, ink: P.ink, lw: L * 0.55 });
        }
        for (const [z0, z1] of [[0, 0.11], [0.89, 1]]) {
            C.poly(g, patch(aS, aTop, z0, z1), { fill: P.hoop, lw: 0 });
            C.poly(g, patch(aTop, aE, z0, z1), { fill: P.hoopSide, lw: 0 });
        }
        for (const z of [0.11, 0.89]) C.poly(g, Array.from({ length: 25 }, (_, i) => on(lerp(aS, aE, i / 24), z)), { ink: P.ink, lw: L * 0.6, close: false });
        // the shell's outline again, over the patches
        g.strokeStyle = P.ink;
        g.lineWidth = L;
        g.lineCap = 'round';
        g.beginPath();
        g.arc(c[0] + dd[0], c[1] + dd[1], r, aS, aE);
        g.moveTo(...on(aS, 0));
        g.lineTo(...on(aS, 1));
        g.moveTo(...on(aE, 0));
        g.lineTo(...on(aE, 1));
        g.stroke();
        // the near spur, on the shell's side
        C.poly(g, [on(0.5, 0.42), on(0.72, 0.42), on(0.72, 0.6), on(0.5, 0.6)], { fill: P.chromeDark, ink: P.ink, lw: L * 0.6 });
        tube(g, [on(0.61, 0.5), [0.46, 0.0]], 0.03, P.chrome, L, P.ink);
        dot(g, 0.46, 0.0, 0.024, P.rubber, P.ink, L * 0.6);
        // the front: the hoop with its inlay and claws, the head, the mark
        dot(g, c[0], c[1], r, P.hoop, P.ink, L);
        g.beginPath();
        g.arc(c[0], c[1], r - 0.024, 0, TAU);
        g.strokeStyle = P.inlay;
        g.lineWidth = 0.014;
        g.stroke();
        const hr = r - 0.05;
        dot(g, c[0], c[1], hr, P.head, P.ink, L * 0.8);
        for (let i = 0; i < 8; i++) {
            const a = ((i + 0.5) / 8) * TAU, o = [c[0] + Math.cos(a) * (r - 0.02), c[1] + Math.sin(a) * (r - 0.02)];
            C.poly(g, [[-0.04, -0.024], [0.034, -0.024], [0.034, 0.024], [-0.04, 0.024]].map((p) => { const q = rot(p, a); return [q[0] + o[0], q[1] + o[1]]; }), { fill: P.chrome, ink: P.ink, lw: L * 0.55 });
        }
        g.beginPath();
        g.arc(c[0], c[1], hr * (0.8 + 0.07 * k), 0, TAU);
        g.strokeStyle = P.headRing;
        g.lineWidth = L * 0.7;
        g.stroke();
        heart(g, P, L, [c[0], c[1] - 0.012], 0.165 * (1 + 0.16 * k));
        // the rack tom on its post
        const t = KIT.tom, px = t.c[0] + 0.02;
        C.box(g, px - 0.05, -0.752, 0.1, 0.045, D, { front: P.chrome, top: P.chromeTop, side: P.chromeDark }, { lw: L * 0.8, ink: P.ink, depth: 0.1 });
        tube(g, [[px + 0.015, -0.75], [px + 0.015, t.c[1] + t.h]], 0.034, P.chrome, L, P.ink, 'butt');
        can(g, t.c, t.r, t.h, { front: P.shell, side: P.shellSide, top: P.head }, L, { ink: P.ink, hoop: 0.028, hoopCol: P.chrome, hoopDark: P.chromeDark, lugs: 4, lugCol: P.chrome, lugDark: P.chromeDark });
    }

    function snareDrum(g, P, L) {
        const { c, r, h, ground } = KIT.snare, x = c[0] - 0.02, yb = c[1] + h;
        tripod(g, P, L, x, -0.24, ground, 0.17);
        tube(g, [[x, yb + 0.06], [x, -0.22]], 0.036, P.chrome, L, P.ink, 'butt');
        collar(g, P, L, x, -0.24);
        for (const sx of [-1, 1]) tube(g, [[x, yb + 0.16], [x + sx * 0.19, yb + 0.035]], 0.026, P.chrome, L, P.ink);
        collar(g, P, L, x, yb + 0.16, 0.06, 0.04);
        can(g, c, r, h, { front: P.chrome, side: P.chromeDark, top: P.head }, L, { ink: P.ink, hoop: 0.026, hoopCol: P.chromeTop, hoopDark: P.chrome, lugs: 5, lugCol: P.chromeTop, lugDark: P.chrome });
    }
    function floorTom(g, P, L) {
        const { c, r, h, ground } = KIT.floor, xl = c[0] - r * 1.044, xr = c[0] + r * 1.044, yl = c[1] + 0.0575 * r, yr = c[1] - 0.0575 * r;
        const leg = (x, y, gx, gy) => {
            tube(g, [[x, y + h * 0.5], [x, y + h + 0.03], [gx, gy]], 0.028, P.chrome, L, P.ink);
            dot(g, gx, gy, 0.022, P.rubber, P.ink, L * 0.6);
        };
        leg(xr + 0.03, yr, xr + 0.06, ground - 0.012);
        leg(xl - 0.03, yl, xl - 0.06, ground + 0.012);
        can(g, c, r, h, { front: P.shell, side: P.shellSide, top: P.head }, L, { ink: P.ink, hoop: 0.03, hoopCol: P.chrome, hoopDark: P.chromeDark, lugs: 5, lugCol: P.chrome, lugDark: P.chromeDark, band: [P.band, P.bandSide] });
        for (const [x, y] of [[xl - 0.03, yl], [xr + 0.03, yr]]) collar(g, P, L, x, y + h * 0.52, 0.06, 0.07);
        // the third leg, on the shell's near side
        const fx = c[0] - D[0] * r - 0.05, fy = c[1] - D[1] * r;
        leg(fx, fy - 0.02, fx - 0.015, ground + 0.05);
        collar(g, P, L, fx, fy + h * 0.5, 0.06, 0.07);
    }
    function hiHat(g, P, L, hit, wob) {
        const { c, r, ground } = KIT.hat, x = c[0];
        // the pedal, towards the camera
        const pd = (u, v) => [x - 0.045 + u * 0.09 - v * 0.085, ground - 0.02 + v * 0.11]; // u across the board, v from the stand out to the heel
        C.poly(g, [pd(0, 0), pd(1, 0), pd(1, 1), pd(0, 1)], { fill: P.chromeDark, ink: P.ink, lw: L * 0.8 });
        C.poly(g, [pd(0, 0.74), pd(1, 0.74), pd(1, 1), pd(0, 1)], { fill: P.rubber, ink: P.ink, lw: L * 0.6 });
        for (const v of [0.2, 0.38, 0.56]) C.poly(g, [pd(0.14, v), pd(0.86, v)], { ink: P.chrome, lw: L * 0.5, close: false });
        tripod(g, P, L, x, -0.3, ground, 0.17);
        tube(g, [[x, c[1] + 0.05], [x, -0.26]], 0.036, P.chrome, L, P.ink, 'butt');
        collar(g, P, L, x, -0.3);
        collar(g, P, L, x, -0.58, 0.06, 0.04);
        const gap = 0.034 + 0.022 * (1 - hit);
        tube(g, [[x, c[1] - gap - 0.02], [x, c[1] - gap - 0.15]], 0.018, P.chrome, L, P.ink);
        cymbal(g, P, L, [c[0], c[1] + 0.012], r, wob);
        cymbal(g, P, L, [c[0], c[1] - gap + 0.012], r, wob * 0.5);
        collar(g, P, L, x, c[1] - gap - 0.035, 0.05, 0.04);
    }
    function rideCymbal(g, P, L, wob) {
        const { c, r, tilt, ground } = KIT.ride, x = c[0];
        tripod(g, P, L, x, -0.34, ground, 0.17);
        tube(g, [[x, -0.72], [x, -0.3]], 0.04, P.chrome, L, P.ink, 'butt');
        tube(g, [[x, c[1] - 0.06], [x, -0.7]], 0.026, P.chrome, L, P.ink);
        collar(g, P, L, x, -0.34);
        collar(g, P, L, x, -0.72, 0.065, 0.05);
        cymbal(g, P, L, c, r, tilt + wob);
        collar(g, P, L, x, c[1] - 0.05, 0.045, 0.035);
    }
    function crashCymbal(g, P, L, tilt) {
        const { c, r, foot } = KIT.crash, x = foot[0], joint = [x, -1.2];
        tripod(g, P, L, x, -0.36, foot[1], 0.16);
        tube(g, [[x, -0.76], [x, -0.32]], 0.04, P.chrome, L, P.ink, 'butt');
        tube(g, [joint, [x, -0.74]], 0.026, P.chrome, L, P.ink);
        collar(g, P, L, x, -0.36);
        collar(g, P, L, x, -0.76, 0.065, 0.05);
        // the boom
        const [ux, uy] = unit(c, joint);
        tube(g, [[c[0] + ux * 0.02, c[1] + uy * 0.02], [joint[0] + ux * 0.16, joint[1] + uy * 0.16]], 0.024, P.chrome, L, P.ink);
        collar(g, P, L, joint[0], joint[1], 0.075, 0.06);
        cymbal(g, P, L, c, r, tilt);
        collar(g, P, L, c[0], c[1] - 0.05, 0.045, 0.035);
    }

    // --- Stan ------------------------------------------------------------------------------
    // Drawn round his seat: the origin is the bottom middle of his torso.
    const S_TORSO = { w: 0.76, h: 0.68, d: 0.4 };
    const S_HEAD = { w: 0.86, h: 0.92, top: -S_TORSO.h + 0.05 - 0.92, d: 0.46 };
    // A dark jacket hanging open over a shirt in vertical purple and blue stripes, the
    // shirt's wide collar open and laid over the lapels.
    function stanTorso(g, P, L) {
        const { w, h, d } = S_TORSO, x = -w / 2, y = -h, sx = 0.175, n = 7;
        C.box(g, x, y, w, h, D, { front: P.jacket, top: P.jacketTop, side: P.jacketSide }, { lw: L, ink: P.ink, depth: d });
        for (let i = 0; i < n; i++) {
            g.fillStyle = i % 2 ? P.stripeB : P.stripeA;
            g.fillRect(-sx + (i * sx * 2) / n, y, (sx * 2) / n + 0.002, h);
        }
        for (const s of [-1, 1]) {
            C.poly(g, [[s * sx, y], [s * sx, y + h]], { ink: P.ink, lw: L * 0.8, close: false });
            C.poly(g, [[s * sx, y + 0.1], [s * 0.315, y + 0.2], [s * 0.29, y + 0.33], [s * sx, y + 0.47]], { fill: P.lapel, ink: P.ink, lw: L * 0.8 });
        }
        C.poly(g, [[-0.1, y], [0.1, y], [0, y + 0.15]], { fill: P.skin, ink: P.ink, lw: L * 0.8 });
        for (const s of [-1, 1]) C.poly(g, [[s * 0.1, y], [s * 0.3, y], [s * 0.27, y + 0.2], [0, y + 0.15]], { fill: P.collar, ink: P.ink, lw: L * 0.8 });
    }
    // His head: short at the sides (the jaw is a skin box, the hair stops at the sideburns)
    // and full on top (a tall wavy crest swept to one side).
    function stanHead(g, P, L, o = {}) {
        const { h, top, d } = S_HEAD, bot = top + h, sw = o.sway ?? 0, hw = 0.4, hx = 0.445, sb = top + 0.5;
        const skin = { front: P.skin, top: P.skinTop, side: P.skinSide };
        C.prism(g, [[-hw, top + 0.4], [hw, top + 0.4], [hw, bot - 0.1], [hw - 0.09, bot], [-hw + 0.09, bot], [-hw, bot - 0.1]], Dd(d - 0.03), skin, { lw: L, ink: P.ink });
        // the hair: up the left side, over the waves, down the right
        const crest = C.curve([[-hx - 0.01, top + 0.12], [-0.44 + sw * 0.6, top - 0.01], [-0.33 + sw, top - 0.11], [-0.19 + sw, top - 0.125], [-0.07 + sw, top - 0.095], [0.06 + sw, top - 0.15], [0.21 + sw, top - 0.185], [0.35 + sw, top - 0.15], [0.46 + sw * 0.6, top - 0.03], [hx + 0.012, top + 0.12]], false, 6);
        const hair = [[-hx, sb], ...crest, [hx, sb]], dd = Dd(d);
        solidRound(g, hair, dd, (px, py) => (py < top + 0.02 && px < 0.4 + sw ? P.hairTop : P.hairSide), P.hair, L, P.ink);
        // the face, under a wavy hairline
        const line = C.curve([[-0.36, top + 0.34], [-0.25, top + 0.25], [-0.09, top + 0.215], [0.08, top + 0.25], [0.24, top + 0.2], [0.36, top + 0.3]], false, 6);
        const skinFront = [[-0.36, sb], ...line, [0.36, sb], [hw, sb], [hw, bot - 0.1], [hw - 0.09, bot], [-hw + 0.09, bot], [-hw, bot - 0.1], [-hw, sb]];
        C.poly(g, skinFront, { fill: P.skin, ink: P.ink, lw: L });
        face(g, P, L, o, top);
        // the waves: strands from the hairline up into the crest
        g.strokeStyle = P.hairLine;
        g.lineWidth = L * 0.75;
        g.lineCap = 'round';
        for (const st of [
            [[-0.3, top + 0.24], [-0.33 + sw * 0.5, top + 0.1], [-0.24 + sw, top - 0.02]],
            [[-0.09, top + 0.17], [-0.1 + sw * 0.5, top + 0.06], [0.0 + sw, top - 0.05]],
            [[0.1, top + 0.2], [0.12 + sw * 0.5, top + 0.06], [0.24 + sw, top - 0.07]],
            [[0.29, top + 0.2], [0.33 + sw * 0.5, top + 0.1], [0.4 + sw, top + 0.0]],
            [[-0.405, top + 0.44], [-0.405, top + 0.3]], [[0.405, top + 0.44], [0.405, top + 0.3]],
        ]) {
            C.trace(g, st.length > 2 ? C.curve(st, false, 6) : st, false);
            g.stroke();
        }
        shades(g, P, L, o, top, hw, bot);
    }
    // A drumstick through the mitt at m, pointing along the angle a.
    const STICK = { reach: 0.4, butt: 0.13 };
    function stick(g, P, L, m, a) {
        const u = [Math.cos(a), Math.sin(a)], n = [-u[1] * 0.017, u[0] * 0.017];
        const p0 = [m[0] - u[0] * STICK.butt, m[1] - u[1] * STICK.butt], p1 = [m[0] + u[0] * (STICK.reach - 0.02), m[1] + u[1] * (STICK.reach - 0.02)];
        C.prism(g, cw([[p0[0] + n[0], p0[1] + n[1]], [p1[0] + n[0] * 0.7, p1[1] + n[1] * 0.7], [p1[0] - n[0] * 0.7, p1[1] - n[1] * 0.7], [p0[0] - n[0], p0[1] - n[1]]]), Dd(0.03), { front: P.stick, top: P.stickTop, side: P.stickSide }, { lw: L * 0.8, ink: P.ink });
        g.beginPath();
        g.ellipse(m[0] + u[0] * STICK.reach, m[1] + u[1] * STICK.reach, 0.034, 0.024, a, 0, TAU);
        g.fillStyle = P.stick;
        g.fill();
        g.strokeStyle = P.ink;
        g.lineWidth = L * 0.8;
        g.stroke();
    }
    // Where each stick lands, and the hand poses (mitt, angle) that take it there.
    const hitPose = (target, a) => ({ m: [target[0] - Math.cos(a) * STICK.reach, target[1] - Math.sin(a) * STICK.reach], a });
    const blend = (p, q, u) => ({ m: mix(p.m, q.m, u), a: lerp(p.a, q.a, u) });

    /**
     * Stan behind his kit.
     *   x, y   the ground under the middle of the bass drum (the kit reaches 1.35 to the left, 1.65 to
     *          the right and 0.06 below that point, in figure units; his hair tops out 2.2 above it)
     *   s      logical units per figure unit
     *   pose: { kick (0..1: the bass drum's head bulges and the kit jolts), snare (0..1: his right stick,
     *           on screen left, comes down on the snare; 0 is raised), hat (0..1: his left stick, on screen
     *           right, comes down on the hi-hat), crash (0..1: the left stick leaves the hi-hat for the
     *           crash, which tilts), squash, headDy, headTilt, sway (the crest), eyes, mouth, shades }
     * The kit, left to right on screen: ride, snare, bass drum with the rack tom, floor tom, hi-hat, crash.
     * The hi-hat stands on his left (screen right), where the hand that plays it is: with it on the
     * other side the arm would cross his chest and hide the shirt.
     */
    function stan(g, x, y, s, pose = {}, P = STAN) {
        const L = 3.2 / s, q = pose.squash ?? 0, k = clamp01(pose.kick ?? 0);
        const sn = clamp01(pose.snare ?? 0), ht = clamp01(pose.hat ?? 0), cr = clamp01(pose.crash ?? 0);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.fillStyle = P.shadow;
        g.beginPath();
        g.ellipse(0.12, -0.035, 1.5, 0.12, 0, 0, TAU);
        g.fill();
        const crashTilt = KIT.crash.tilt - 0.24 * cr - 0.04 * k;
        rideCymbal(g, P, L, 0.05 * k);
        crashCymbal(g, P, L, crashTilt);
        // the stool and Stan on it
        const seat = KIT.seat;
        tripod(g, P, L, seat[0], -0.3, -0.09, 0.2);
        tube(g, [[seat[0], seat[1] + 0.06], [seat[0], -0.28]], 0.05, P.chrome, L, P.ink, 'butt');
        can(g, [seat[0], seat[1] + 0.01], 0.25, 0.08, { front: P.seat, side: P.seatSide, top: P.seatTop }, L, { ink: P.ink });
        g.save();
        g.translate(seat[0] - 0.1, -0.03);
        Cast.legs(g, P, L);
        for (const sx of [-1, 1]) C.box(g, sx * 0.19 - 0.13, -0.47, 0.26, 0.2, D, { front: P.jeans, top: P.jeans, side: P.jeansSide }, { lw: L, ink: P.ink, depth: 0.42 });
        g.restore();
        g.save();
        g.translate(seat[0], seat[1]);
        g.scale(1 + q, 1 - q);
        stanTorso(g, P, L);
        g.save();
        g.translate(0, (pose.headDy ?? 0) + S_HEAD.top + 1.85);
        g.rotate(pose.headTilt ?? 0);
        g.translate(0, -S_HEAD.top - 1.85);
        stanHead(g, P, L, pose);
        g.restore();
        g.restore();
        // the drums at his sides, then the bass drum and its tom (they jolt with the kick)
        const hop = -0.012 * k;
        g.save();
        g.translate(0, hop);
        hiHat(g, P, L, ht * (1 - cr), 0.03 * k);
        snareDrum(g, P, L);
        floorTom(g, P, L);
        g.restore();
        g.save();
        const base = [KIT.bass.c[0], KIT.bass.c[1] + KIT.bass.r];
        g.translate(base[0], base[1]);
        g.scale(1 + 0.03 * k, 1 + 0.03 * k);
        g.translate(-base[0], -base[1]);
        bassDrum(g, P, L, k);
        g.restore();
        // the sticks and the arms
        const sh = (sx) => [seat[0] + sx * (S_TORSO.w / 2 - 0.03) * (1 + q), seat[1] + (-S_TORSO.h + 0.13) * (1 - q)];
        const snareAt = [KIT.snare.c[0], KIT.snare.c[1] + hop], hatAt = [KIT.hat.c[0] - 0.11, KIT.hat.c[1] - 0.034 + 0.012 + hop];
        const crashAt = rotAbout([KIT.crash.c[0] - KIT.crash.r * 0.72, KIT.crash.c[1]], KIT.crash.c, crashTilt);
        const right = blend({ m: [-0.44, -1.1], a: -2.1 }, hitPose(snareAt, 2.3 - TAU), sn);
        const left = blend(blend({ m: [0.72, -0.97], a: -0.4 }, hitPose(hatAt, 0.12), ht), hitPose(crashAt, -0.98), cr);
        for (const [sx, p] of [[-1, right], [1, left]]) {
            stick(g, P, L, p.m, p.a);
            Cast.arm(g, P, L, sh(sx), p.m);
        }
        g.restore();
    }

    // Anchor points for the choreography, in figure units from each drawer's (x, y): multiply by s.
    const AT = {
        benmont: { hairTop: [0, -1.98], eyes: [0, -1.32], mouth: [0, -1.075], shoulderR: [-0.33, -0.85], shoulderL: [0.33, -0.85], keysLow: keyPoint(0), keysHigh: keyPoint(1), slab: [-1.04, -0.59, 1.84, 0.29], standFeet: [[-0.73, 0.13], [0.27, 0.13]] },
        stan: { hairTop: [0.4, -2.24], eyes: [0.195, -1.52], mouth: [0.195, -1.275], shoulderR: [-0.155, -1.05], shoulderL: [0.545, -1.05], seat: KIT.seat,
            bass: KIT.bass.c, tom: KIT.tom.c, snare: KIT.snare.c, floorTom: KIT.floor.c, hiHat: KIT.hat.c, crash: KIT.crash.c, ride: KIT.ride.c, box: [-1.32, -2.24, 2.96, 2.3] },
    };

    return { BEN, STAN, KB, KIT, STICK, AT, benmont, stan, keyPoint, keyboard, benHead, benTorso, stanHead, stanTorso, armRolled, face, shades, can, cymbal, heart, bassDrum };
})();
