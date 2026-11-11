// The Devil: the tape's mascot, a showbiz pitchman after a signature. A box person like the
// rest of the cast (cast.js), with his own signature shapes: curled ribbed horns through a
// slick black pompadour with a widow's peak, pointed ears, yellow slit eyes under heavy
// brows, a waxed moustache, a salesman's grin with a gold tooth and two fangs, a goatee, a
// purple tailcoat with magenta lapels, a yellow bow tie, pinstriped trousers, cloven hooves
// and a spade tail. He carries a trident and a contract on a scroll with a wax seal.
//
// Units as in cast.js: 1 ≈ a head's width, the origin is the ground between the hooves, y
// grows downwards. Global: Devil. Depends on Cereal and Cast.
const Devil = (() => {
    const C = Cereal, K = C.COL;
    const D = Cast.D, Dd = Cast.Dd;
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const cw = (pts) => {
        let a = 0;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i], q = pts[(i + 1) % pts.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return a > 0 ? pts : pts.slice().reverse();
    };
    const line = (g, pts, color, lw) => C.poly(g, pts, { ink: color, lw, close: false });
    // A band of varying width along a centreline: [[x, y, halfWidth], …] → an outline.
    const ribbon = (cl) => {
        const L = [], R = [];
        cl.forEach(([x, y, w], i) => {
            const a = cl[Math.max(0, i - 1)], b = cl[Math.min(cl.length - 1, i + 1)];
            const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
            L.push([x - (dy / l) * w, y + (dx / l) * w]);
            R.push([x + (dy / l) * w, y - (dx / l) * w]);
        });
        return [...L, ...R.reverse()];
    };

    const P = {
        ink: K.ink,
        skin: '#e8392f', skinTop: '#ff6f59', skinSide: '#b0211f', skinDark: '#c42a24',
        hair: '#2a2438', hairTop: '#4a4470', hairSide: '#1c1727', sheen: '#6c66a0',
        horn: '#fff1c4', hornSide: '#dcc284', hornLine: '#b99a55',
        eye: '#ffe62e', pupil: '#1d1626', glint: '#ffffff',
        mouth: '#4d0f1c', tongue: '#ff6f8f', tooth: '#fffdf4', gold: '#ffc21f',
        suit: '#6a37cc', suitTop: '#8a5cec', suitSide: '#47228f', lapel: '#e0258b', lapelDark: '#a8176a',
        shirt: '#fffdf4', tie: '#ffe62e', tieDark: '#e0a800', button: '#ffc21f',
        trouser: '#2f2940', trouserSide: '#211c2e', stripe: '#5d5788',
        hoof: '#3d3652', hoofTop: '#5d5788', hoofShine: '#b9b4dc',
        fork: '#c9cfe2', forkSide: '#7f879f', forkShine: '#ffffff', shaft: '#6b3a20', shaftSide: '#472513', brass: '#ffc21f',
        paper: '#fff3d0', paperSide: '#dcc690', paperLine: '#8a6d3b', seal: '#c9182c', sealDark: '#8f0f1f', ribbon: '#e0258b',
        shadow: 'rgba(36,21,49,0.28)',
    };

    // --- props ---------------------------------------------------------------------------
    // The trident: (x, y) is the point of the shaft held in the mitt; it stands along `ang`
    // (0 = upright). len: the whole length; grip: how far up the shaft the hand is.
    function trident(g, x, y, L, o = {}) {
        const { ang = 0, len = 2.3, grip = 0.7 } = o;
        const at = (px, py) => {
            const q = rot([px, py], ang);
            return [x + q[0], y + q[1]];
        };
        const y0 = grip, y1 = grip - len; // the butt (down) and the top of the fork, along the shaft
        const sh = cw([at(-0.03, y0), at(-0.03, y1 + 0.42), at(0.03, y1 + 0.42), at(0.03, y0)]);
        C.prism(g, sh, Dd(0.05), { front: P.shaft, top: P.shaftSide, side: P.shaftSide }, { lw: L, ink: P.ink });
        // brass ferrules: one at the butt, two under the fork
        for (const fy of [y0 - 0.04, y1 + 0.5, y1 + 0.58]) {
            C.prism(g, cw([at(-0.042, fy + 0.03), at(-0.042, fy), at(0.042, fy), at(0.042, fy + 0.03)]), Dd(0.06), { front: P.brass, top: P.brass, side: P.tieDark }, { lw: L * 0.8, ink: P.ink });
        }
        // the fork: a socket, a crossbar that sweeps up into two side tines, a longer middle
        // tine, every tip a barbed arrowhead
        const head = [
            [-0.05, y1 + 0.44], [-0.05, y1 + 0.34], [-0.2, y1 + 0.33], [-0.275, y1 + 0.24], [-0.275, y1 + 0.13], [-0.33, y1 + 0.13], [-0.245, y1 - 0.01], [-0.16, y1 + 0.13], [-0.215, y1 + 0.13],
            [-0.215, y1 + 0.22], [-0.17, y1 + 0.27], [-0.03, y1 + 0.27], [-0.03, y1 + 0.02], [-0.095, y1 + 0.02], [0, y1 - 0.15], [0.095, y1 + 0.02], [0.03, y1 + 0.02], [0.03, y1 + 0.27],
            [0.17, y1 + 0.27], [0.215, y1 + 0.22], [0.215, y1 + 0.13], [0.16, y1 + 0.13], [0.245, y1 - 0.01], [0.33, y1 + 0.13], [0.275, y1 + 0.13], [0.275, y1 + 0.24], [0.2, y1 + 0.33], [0.05, y1 + 0.34], [0.05, y1 + 0.44],
        ];
        const hp = cw(head.map(([px, py]) => at(px, py)));
        C.prism(g, hp, Dd(0.05), { front: P.fork, top: P.forkShine, side: P.forkSide }, { lw: L, ink: P.ink });
        // a shine down the middle tine and on each side tine
        line(g, [at(-0.008, y1 + 0.02), at(-0.008, y1 + 0.24)], P.forkShine, L * 0.9);
        line(g, [at(-0.252, y1 + 0.14), at(-0.252, y1 + 0.22)], P.forkShine, L * 0.8);
        line(g, [at(0.238, y1 + 0.14), at(0.238, y1 + 0.22)], P.forkShine, L * 0.8);
    }

    // The contract: a scroll, (x, y) its middle. o: { ang, open (0..1 how far it is unrolled) }
    function contract(g, x, y, L, o = {}) {
        const { ang = 0, open = 1 } = o;
        const w = 0.46, h = 0.6 * open + 0.02; // o.signed adds Tom's scrawl
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        // the sheet between the rolls
        C.box(g, -w / 2, -h / 2, w, h, D, { front: P.paper, top: P.paperSide, side: P.paperSide }, { lw: L, ink: P.ink, depth: 0.02 });
        g.save();
        g.beginPath();
        g.rect(-w / 2, -h / 2, w, h);
        g.clip();
        // a heading, small print, the line with its cross, the seal with two ribbon tails
        const top = -0.3;
        g.strokeStyle = P.ink;
        g.lineCap = 'round';
        g.lineWidth = L * 1.5;
        g.beginPath();
        g.moveTo(-0.13, top + 0.075);
        g.lineTo(0.13, top + 0.075);
        g.stroke();
        g.strokeStyle = P.paperLine;
        g.lineWidth = L * 0.6;
        g.beginPath();
        for (let i = 0; i < 6; i++) {
            const ly = top + 0.14 + i * 0.045;
            g.moveTo(-0.17, ly);
            g.lineTo(i === 5 ? 0.02 : 0.17, ly);
        }
        g.stroke();
        g.strokeStyle = P.ink;
        g.lineWidth = L * 0.9;
        g.beginPath();
        g.moveTo(-0.115, top + 0.505);
        g.lineTo(0.06, top + 0.505);
        g.moveTo(-0.175, top + 0.455);
        g.lineTo(-0.135, top + 0.505);
        g.moveTo(-0.135, top + 0.455);
        g.lineTo(-0.175, top + 0.505);
        g.stroke();
        if (o.signed) {
            // what Tom wrote above the line: a scrawl in blue ink
            g.strokeStyle = '#2b3fd1';
            g.lineWidth = L * 0.9;
            g.lineJoin = 'round';
            g.beginPath();
            const sc = [[-0.15, 0.4], [-0.12, 0.36], [-0.1, 0.41], [-0.07, 0.37], [-0.05, 0.41], [-0.01, 0.36], [0.02, 0.41], [0.05, 0.38], [-0.09, 0.47], [-0.05, 0.44], [-0.02, 0.48], [0.02, 0.44], [0.05, 0.47]];
            sc.forEach(([px, py], i) => (i === 0 || i === 8 ? g.moveTo(px, top + py) : g.lineTo(px, top + py)));
            g.stroke();
        }
        C.poly(g, [[0.1, top + 0.47], [0.075, top + 0.59], [0.115, top + 0.565], [0.135, top + 0.6], [0.15, top + 0.47]], { fill: P.ribbon, ink: P.ink, lw: L * 0.7 });
        C.poly(g, C.ellipsePts(0.125, top + 0.45, 0.062, 0.062, 10, 0.3).map(([px, py], i) => (i % 2 ? [0.125 + (px - 0.125) * 0.84, top + 0.45 + (py - top - 0.45) * 0.84] : [px, py])), { fill: P.seal, ink: P.ink, lw: L * 0.8 });
        g.beginPath();
        g.arc(0.125, top + 0.45, 0.03, 0, C.TAU);
        g.strokeStyle = P.sealDark;
        g.lineWidth = L * 0.8;
        g.stroke();
        g.restore();
        // the rolls at the top and the bottom, each with its spiral end
        for (const ry of [-h / 2, h / 2]) {
            g.beginPath();
            g.roundRect(-w / 2 - 0.035, ry - 0.04, w + 0.07, 0.08, 0.04);
            g.fillStyle = P.paper;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L;
            g.stroke();
            line(g, [[-w / 2 + 0.02, ry + 0.012], [w / 2 - 0.02, ry + 0.012]], P.paperSide, L * 0.9);
            for (const sx of [-1, 1]) {
                g.beginPath();
                g.arc(sx * (w / 2 + 0.002), ry, 0.018, 0, C.TAU);
                g.strokeStyle = P.paperLine;
                g.lineWidth = L * 0.7;
                g.stroke();
            }
        }
        g.restore();
    }

    // --- the body --------------------------------------------------------------------------
    const TORSO = { x: -0.37, y: -0.98, w: 0.74, h: 0.62, d: 0.4 };
    const HEAD = { w: 0.96, h: 0.9, top: -1.8, d: 0.46 };

    function tail(g, L, sway) {
        // an S from behind the coat to a spade, thinning all the way
        const pts = C.curve([[0.2, -0.46], [0.56, -0.34], [0.84, -0.44], [0.86, -0.72 + sway * 0.5], [0.72, -0.94 + sway], [0.84, -1.16 + sway * 1.4], [1.0, -1.26 + sway * 1.6]], false, 8);
        const n = pts.length;
        const band = ribbon(pts.map(([x, y], i) => [x, y, 0.05 - 0.028 * (i / (n - 1))]));
        C.poly(g, band, { fill: P.skin, ink: P.ink, lw: L });
        // a darker underside along the outer curve
        line(g, pts.slice(4, Math.floor(n * 0.55)).map(([x, y]) => [x + 0.012, y + 0.014]), P.skinSide, L * 1.1);
        const e = pts[n - 1], f = pts[n - 3], a = Math.atan2(e[1] - f[1], e[0] - f[0]);
        const spade = [[-0.02, -0.03], [-0.07, -0.13], [0.06, -0.075], [0.2, 0], [0.06, 0.075], [-0.07, 0.13], [-0.02, 0.03]].map((p) => {
            const q = rot(p, a);
            return [e[0] + q[0], e[1] + q[1]];
        });
        C.prism(g, cw(spade), Dd(0.04), { front: P.skin, top: P.skinTop, side: P.skinSide }, { lw: L, ink: P.ink });
    }

    function legs(g, L, step = 0) {
        // coat tails hang behind the legs
        for (const sx of [-1, 1]) {
            const tx = sx * 0.17 + D[0] * 0.36, ty = D[1] * 0.36;
            C.poly(g, [[tx - 0.13, -0.42 + ty], [tx + 0.13, -0.42 + ty], [tx + 0.1 + sx * 0.02, -0.16 + ty], [tx + sx * 0.05, -0.1 + ty], [tx - 0.1 + sx * 0.02, -0.16 + ty]], { fill: P.suitSide, ink: P.ink, lw: L });
        }
        for (const sx of [-1, 1]) {
            const lx = sx * 0.19, up = sx > 0 ? Math.max(0, step) * 0.08 : Math.max(0, -step) * 0.08;
            g.save();
            g.translate(0, -up);
            // the cloven hoof: a block with a split toe and a shine
            C.box(g, lx - 0.14, -0.115, 0.28, 0.115, D, { front: P.hoof, top: P.hoofTop, side: P.hoof }, { lw: L, ink: P.ink, depth: 0.34 });
            C.poly(g, [[lx - 0.02, -0.117], [lx, -0.035], [lx + 0.02, -0.117]], { fill: P.ink, ink: P.ink, lw: L * 0.6 });
            line(g, [[lx - 0.108, -0.082], [lx - 0.05, -0.082]], P.hoofShine, L * 1.1);
            // a pinstriped trouser leg
            C.box(g, lx - 0.12, -0.4, 0.24, 0.29, D, { front: P.trouser, top: P.trouser, side: P.trouserSide }, { lw: L, ink: P.ink, depth: 0.3 });
            for (const px of [-0.06, 0, 0.06]) line(g, [[lx + px, -0.385], [lx + px, -0.125]], P.stripe, L * 0.5);
            g.restore();
        }
    }

    function torso(g, L) {
        const { x, y, w, h, d } = TORSO;
        C.box(g, x, y, w, h, D, { front: P.suit, top: P.suitTop, side: P.suitSide }, { lw: L, ink: P.ink, depth: d });
        // the shirt front in the coat's opening, with two studs
        C.poly(g, [[-0.15, y], [0.15, y], [0.035, y + 0.44], [-0.035, y + 0.44]], { fill: P.shirt, ink: P.ink, lw: L * 0.8 });
        g.fillStyle = P.ink;
        for (const sy of [0.33, 0.39]) {
            g.beginPath();
            g.arc(0, y + sy, 0.011, 0, C.TAU);
            g.fill();
        }
        // wide peaked lapels in satin, a darker fold along each
        for (const s of [-1, 1]) {
            const lap = [[s * 0.15, y], [s * 0.3, y], [s * 0.3, y + 0.1], [s * 0.335, y + 0.15], [s * 0.25, y + 0.2], [s * 0.035, y + 0.44]];
            C.poly(g, lap, { fill: P.lapel, ink: P.ink, lw: L * 0.8 });
            line(g, [[s * 0.25, y + 0.2], [s * 0.3, y + 0.1]], P.ink, L * 0.7);
            line(g, [[s * 0.2, y + 0.06], [s * 0.085, y + 0.33]], P.lapelDark, L * 0.9);
        }
        // the coat closes with one gold button and cuts away below it
        line(g, [[0, y + 0.44], [0, y + h]], P.ink, L * 0.8);
        C.poly(g, [[-0.07, y + h + 0.001], [0, y + 0.53], [0.07, y + h + 0.001]], { fill: P.trouser, ink: P.ink, lw: L * 0.8 });
        g.beginPath();
        g.arc(0.0, y + 0.485, 0.024, 0, C.TAU);
        g.fillStyle = P.button;
        g.fill();
        g.strokeStyle = P.ink;
        g.lineWidth = L * 0.7;
        g.stroke();
        // a pocket square
        C.poly(g, [[0.17, y + 0.3], [0.2, y + 0.255], [0.225, y + 0.29], [0.25, y + 0.25], [0.28, y + 0.3]], { fill: P.shirt, ink: P.ink, lw: L * 0.7 });
        line(g, [[0.155, y + 0.3], [0.295, y + 0.3]], P.ink, L * 0.8);
        // the bow tie, under the goatee: two spotted wings and a knot
        const ty = y + 0.235;
        for (const s of [-1, 1]) {
            C.poly(g, [[s * 0.03, ty - 0.022], [s * 0.19, ty - 0.075], [s * 0.2, ty + 0.075], [s * 0.03, ty + 0.022]], { fill: P.tie, ink: P.ink, lw: L * 0.8 });
            g.fillStyle = P.lapel;
            for (const [dx, dy] of [[0.085, -0.02], [0.145, 0.02], [0.13, -0.04]]) {
                g.beginPath();
                g.arc(s * dx, ty + dy, 0.012, 0, C.TAU);
                g.fill();
            }
        }
        g.beginPath();
        g.roundRect(-0.038, ty - 0.036, 0.076, 0.072, 0.015);
        g.fillStyle = P.tieDark;
        g.fill();
        g.strokeStyle = P.ink;
        g.lineWidth = L * 0.8;
        g.stroke();
    }

    // A sleeve, a white cuff with a gold link, a red block mitt.
    function arm(g, L, sh, hand) {
        const el = Cast.elbow(sh, hand);
        if (el) {
            // a short arm bends at the elbow: the sleeve down to it, then the cuff and the mitt
            Cast.upperArm(g, sh, el, 0.16, Cast.Dd(0.16), { front: P.suit, top: P.suitTop, side: P.suitSide }, { lw: L, ink: P.ink });
            sh = el;
        }
        const w = 0.16, dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6;
        const ux = dx / len, uy = dy / len, nx = -uy * w * 0.5, ny = ux * w * 0.5;
        const quad = (a, b, k = 1) => cw([[sh[0] + ux * a + nx * k, sh[1] + uy * a + ny * k], [sh[0] + ux * b + nx * k, sh[1] + uy * b + ny * k], [sh[0] + ux * b - nx * k, sh[1] + uy * b - ny * k], [sh[0] + ux * a - nx * k, sh[1] + uy * a - ny * k]]);
        const c0 = Math.max(0.03, len - 0.14), c1 = Math.max(0.06, len - 0.075);
        C.prism(g, quad(-0.05, c0), Dd(0.16), { front: P.suit, top: P.suitTop, side: P.suitSide }, { lw: L, ink: P.ink });
        C.prism(g, quad(c0, c1, 1.12), Dd(0.17), { front: P.shirt, top: P.shirt, side: '#d9d4e6' }, { lw: L, ink: P.ink });
        g.beginPath();
        g.arc(sh[0] + ux * (c0 + c1) / 2, sh[1] + uy * (c0 + c1) / 2, 0.016, 0, C.TAU);
        g.fillStyle = P.button;
        g.fill();
        C.prism(g, quad(c1, len + 0.11), Dd(0.16), { front: P.skin, top: P.skinTop, side: P.skinSide }, { lw: L, ink: P.ink });
    }

    function horn(g, L, sx) {
        const T = HEAD.top;
        // a crescent that leaves the hair at the temple, swings out and curls back in
        const outer = C.curve([[sx * 0.5, T + 0.03], [sx * 0.615, T - 0.13], [sx * 0.62, T - 0.31], [sx * 0.49, T - 0.47]], false, 8);
        const inner = C.curve([[sx * 0.49, T - 0.47], [sx * 0.515, T - 0.31], [sx * 0.46, T - 0.17], [sx * 0.29, T - 0.03]], false, 8);
        const z = 0.14, shp = cw([...outer, ...inner.slice(1)].map(([x, y]) => [x + D[0] * z, y + D[1] * z]));
        C.prism(g, shp, Dd(0.13), { front: P.horn, top: P.hornSide, side: P.hornSide }, { lw: L, ink: P.ink, sweepInk: null });
        C.prismOutline(g, shp, Dd(0.13), { lw: L, ink: P.ink });
        // growth rings across it
        g.strokeStyle = P.hornLine;
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

    function head(g, L, o) {
        const { w, h, top: T, d } = HEAD, x0 = -w / 2, x1 = w / 2, B = T + h, mood = o.mood ?? 'grin';
        // the far ear (screen left) behind the box
        C.poly(g, [[x0 + 0.01, T + 0.34], [x0 - 0.2, T + 0.25], [x0 + 0.01, T + 0.56]], { fill: P.skin, ink: P.ink, lw: L });
        C.poly(g, [[x0 - 0.005, T + 0.39], [x0 - 0.12, T + 0.325], [x0 - 0.005, T + 0.5]], { fill: P.skinSide, lw: 0 });
        C.box(g, x0, T, w, h, D, { front: P.skin, top: P.skinTop, side: P.skinSide }, { lw: L, ink: P.ink, depth: d });
        // the near ear on the side face
        const eo = Dd(0.2);
        C.poly(g, [[x1 + eo[0] - 0.02, T + 0.36 + eo[1]], [x1 + eo[0] + 0.2, T + 0.2 + eo[1]], [x1 + eo[0] + 0.01, T + 0.55 + eo[1]]], { fill: P.skin, ink: P.ink, lw: L });
        C.poly(g, [[x1 + eo[0] + 0.01, T + 0.39 + eo[1]], [x1 + eo[0] + 0.12, T + 0.3 + eo[1]], [x1 + eo[0] + 0.025, T + 0.5 + eo[1]]], { fill: P.skinDark, lw: 0 });

        // the pompadour: a quiff that rolls up and to the right, a widow's peak, sideburns
        const crown = C.curve([[x0 - 0.02, T + 0.1], [x0 + 0.02, T - 0.1], [-0.2, T - 0.2], [0.12, T - 0.27], [0.36, T - 0.22], [x1 + 0.03, T - 0.08], [x1 + 0.025, T + 0.1]], false, 8);
        const hair = cw([[x0 - 0.02, T + 0.4], ...crown, [x1 + 0.025, T + 0.4], [x1 - 0.06, T + 0.4], [x1 - 0.085, T + 0.17], [0.2, T + 0.1], [0.02, T + 0.27], [-0.17, T + 0.1], [x0 + 0.085, T + 0.17], [x0 + 0.06, T + 0.4]]);
        C.prism(g, hair, Dd(d + 0.02), { front: P.hair, top: P.hairTop, side: P.hairSide }, { lw: L, ink: P.ink, sweepInk: null });
        C.prismOutline(g, hair, Dd(d + 0.02), { lw: L, ink: P.ink });
        // comb lines and a sheen that follow the roll
        g.lineCap = 'round';
        g.strokeStyle = P.sheen;
        g.lineWidth = L * 1.5;
        g.beginPath();
        g.moveTo(-0.3, T - 0.07);
        g.quadraticCurveTo(-0.05, T - 0.2, 0.26, T - 0.16);
        g.stroke();
        g.strokeStyle = P.hairTop;
        g.lineWidth = L * 0.8;
        g.beginPath();
        g.moveTo(-0.36, T + 0.02);
        g.quadraticCurveTo(-0.16, T - 0.08, 0.02, T + 0.2);
        g.moveTo(0.36, T - 0.02);
        g.quadraticCurveTo(0.2, T - 0.07, 0.04, T + 0.2);
        g.stroke();
        horn(g, L, -1);
        horn(g, L, 1);

        // eyes: yellow, slit pupils, a lash line; brows are thick wedges that carry the mood
        const ey = T + 0.44, look = (o.look ?? 0) * 0.045, shut = o.eyes === 'shut' || mood === 'laugh';
        for (const sx of [-1, 1]) {
            const ex = sx * 0.21, eh = mood === 'shock' ? 0.22 : mood === 'sly' && sx > 0 ? 0.11 : 0.165, ew = 0.2;
            if (shut) {
                line(g, [[ex - 0.09, ey + 0.035], [ex, ey - 0.03], [ex + 0.09, ey + 0.035]], P.ink, L * 1.5);
            } else {
                g.beginPath();
                g.roundRect(ex - ew / 2, ey - eh / 2, ew, eh, 0.045);
                g.fillStyle = P.eye;
                g.fill();
                g.strokeStyle = P.ink;
                g.lineWidth = L;
                g.stroke();
                const ph = mood === 'shock' ? 0.07 : Math.min(0.125, eh - 0.035);
                g.fillStyle = P.pupil;
                g.beginPath();
                g.roundRect(ex - 0.021 + look, ey - ph / 2, 0.042, ph, 0.02);
                g.fill();
                g.fillStyle = P.glint;
                g.fillRect(ex - 0.062 + look * 0.5, ey - eh / 2 + 0.028, 0.03, 0.03);
                line(g, [[ex - ew / 2 - 0.012, ey - eh / 2 + 0.004], [ex + ew / 2 + 0.012, ey - eh / 2 + 0.004]], P.ink, L * 1.7);
            }
            // brow: inner end down for mischief and anger, up for shock; the sly one cocks one
            const tilt = mood === 'angry' ? 0.085 : mood === 'shock' ? -0.05 : mood === 'laugh' ? -0.02 : mood === 'sly' && sx > 0 ? -0.06 : 0.045;
            const by = ey - (mood === 'shock' ? 0.21 : 0.16) - (mood === 'sly' && sx > 0 ? 0.03 : 0);
            const bi = [ex - sx * 0.125, by + tilt], bo = [ex + sx * 0.125, by - tilt * 0.9];
            C.poly(g, [[bi[0], bi[1] - 0.04], [(bi[0] + bo[0]) / 2, (bi[1] + bo[1]) / 2 - 0.05], [bo[0] + sx * 0.02, bo[1] - 0.012], [bo[0], bo[1] + 0.012], [(bi[0] + bo[0]) / 2, (bi[1] + bo[1]) / 2 + 0.012], [bi[0], bi[1] + 0.03]], { fill: P.hair, ink: P.ink, lw: L * 0.8 });
        }
        // nose: a pointed hook, with the shadow of its tip
        line(g, [[0.018, ey + 0.05], [0.018, ey + 0.16], [0.075, ey + 0.135]], P.ink, L * 0.95);
        // the mouth
        const my = T + 0.7;
        const teeth = (pts, rows) => {
            C.poly(g, pts, { fill: P.mouth, lw: 0 });
            g.save();
            C.trace(g, pts);
            g.clip();
            rows();
            g.restore();
            C.poly(g, pts, { ink: P.ink, lw: L });
        };
        if (mood === 'shock') {
            const m = C.ellipsePts(0, my + 0.05, 0.1, 0.12, 28);
            teeth(m, () => {
                g.fillStyle = P.tongue;
                g.beginPath();
                g.ellipse(0, my + 0.16, 0.07, 0.05, 0, 0, C.TAU);
                g.fill();
                g.fillStyle = P.tooth;
                g.fillRect(-0.06, my - 0.08, 0.12, 0.045);
            });
        } else if (mood === 'angry') {
            const m = [[-0.27, my + 0.07], [-0.2, my - 0.03], [0.2, my - 0.03], [0.27, my + 0.07], [0.2, my + 0.14], [-0.2, my + 0.14]];
            teeth(m, () => {
                g.fillStyle = P.tooth;
                g.fillRect(-0.3, my - 0.05, 0.6, 0.22);
                g.strokeStyle = P.ink;
                g.lineWidth = L * 0.7;
                g.beginPath();
                g.moveTo(-0.3, my + 0.055);
                for (let i = -5; i <= 5; i++) g.lineTo(i * 0.055, my + 0.055 + (i % 2 ? 0.022 : -0.022));
                g.stroke();
            });
        } else {
            // the salesman's grin: a crescent, upper teeth in a row, a gold one, two fangs
            const open = mood === 'laugh' ? 0.15 : 0.1;
            const upper = C.curve([[-0.31, my - 0.07], [-0.16, my - 0.005], [0, my + 0.012], [0.16, my - 0.005], [0.31, my - 0.07]], false, 6);
            const lower = C.curve([[0.31, my - 0.07], [0.19, my + open * 0.72], [0, my + open], [-0.19, my + open * 0.72], [-0.31, my - 0.07]], false, 6);
            const m = [...upper, ...lower.slice(1, -1)];
            teeth(m, () => {
                g.fillStyle = P.tongue;
                g.beginPath();
                g.ellipse(0.02, my + open + 0.015, 0.12, mood === 'laugh' ? 0.085 : 0.045, 0, 0, C.TAU);
                g.fill();
                const th = mood === 'laugh' ? 0.085 : 0.075;
                for (let i = -3; i < 3; i++) {
                    const tx = i * 0.078, sag = 0.012 - Math.abs(i + 0.5) * 0.012;
                    g.fillStyle = i === 1 ? P.gold : P.tooth;
                    g.beginPath();
                    g.roundRect(tx + 0.003, my - 0.1, 0.072, 0.1 + th * 0.8 + sag, [0, 0, 0.012, 0.012]);
                    g.fill();
                    g.strokeStyle = P.ink;
                    g.lineWidth = L * 0.6;
                    g.stroke();
                }
                // fangs at the corners
                g.fillStyle = P.tooth;
                for (const sx of [-1, 1]) {
                    g.beginPath();
                    g.moveTo(sx * 0.2, my - 0.12);
                    g.lineTo(sx * 0.262, my - 0.12);
                    g.lineTo(sx * 0.224, my + 0.085);
                    g.closePath();
                    g.fill();
                    g.stroke();
                }
            });
        }
        // the waxed moustache: two strokes that thin out and curl up at the tips
        const mu = ey + 0.185, droop = mood === 'shock' ? 0.08 : mood === 'angry' ? 0.03 : 0;
        for (const sx of [-1, 1]) {
            const cl = C.curve([[sx * 0.012, mu], [sx * 0.11, mu + 0.02], [sx * 0.24, mu + 0.0 + droop], [sx * 0.34, mu - 0.06 + droop * 1.6], [sx * 0.335, mu - 0.115 + droop * 1.8]], false, 8);
            const n = cl.length;
            C.poly(g, ribbon(cl.map(([x, y], i) => [x, y, 0.022 * (1 - (i / (n - 1)) * 0.82)])), { fill: P.hair, ink: P.ink, lw: L * 0.5 });
        }
        // the goatee on the chin, with a sheen
        C.poly(g, [[-0.08, B - 0.06], [0.08, B - 0.06], [0.045, B + 0.06], [0, B + 0.13], [-0.045, B + 0.06]], { fill: P.hair, ink: P.ink, lw: L });
        line(g, [[-0.03, B - 0.03], [-0.012, B + 0.055]], P.sheen, L * 0.9);
    }

    /**
     * Devil.draw(g, x, y, s, pose)
     *   pose: { squash, lean, headDy, headTilt, mood ('grin' | 'sly' | 'angry' | 'shock' | 'laugh'),
     *           eyes ('open' | 'shut'), look (-1..1), tail (sway, about ±0.05), step (-1..1 lifts a hoof),
     *           noTail (true: his tail is left out, for a shot that puts something between his tail and his body:
     *           draw it first with Devil.tail and the same pose),
     *           handR, handL  ([x, y] in his units; the right mitt is on screen left),
     *           shadow (false in the air or on a perch), pointer ([x, y] a cane from the left mitt to that point),
     *           trident (false | { ang, grip }), contract (false | { ang, open, at: [dx, dy] from the left mitt }) }
     */
    function draw(g, x, y, s, pose = {}) {
        const L = 3.2 / s, q = pose.squash ?? 0;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        if (pose.shadow !== false) {
            g.fillStyle = P.shadow;
            g.beginPath();
            g.ellipse(0.06, 0, 0.6 * (1 + q), 0.065, 0, 0, C.TAU);
            g.fill();
        }
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        if (!pose.noTail) tail(g, L, pose.tail ?? 0);
        legs(g, L, pose.step ?? 0);
        torso(g, L);
        g.save();
        g.translate(0, pose.headDy ?? 0);
        g.rotate(pose.headTilt ?? 0);
        head(g, L, pose);
        g.restore();
        const shR = [TORSO.x + 0.03, TORSO.y + 0.14], shL = [TORSO.x + TORSO.w - 0.03, TORSO.y + 0.14];
        const hR = pose.handR ?? (pose.trident ? [-0.74, -0.66] : [-0.5, -0.5]);
        const hL = pose.handL ?? (pose.contract ? [0.72, -0.74] : [0.5, -0.5]);
        if (pose.trident) trident(g, hR[0] - 0.015, hR[1] + 0.02, L, pose.trident === true ? {} : pose.trident);
        arm(g, L, shR, hR);
        if (pose.pointer) {
            // a cane with a brass tip, from the left mitt towards pose.pointer = [x, y]
            const [tx, ty] = pose.pointer, dx = tx - hL[0], dy = ty - hL[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
            const a = [hL[0] - ux * 0.12, hL[1] - uy * 0.12];
            C.poly(g, [a, [tx, ty]], { ink: P.ink, lw: 0.05 + L * 2, close: false });
            C.poly(g, [a, [tx - ux * 0.08, ty - uy * 0.08]], { ink: P.hair, lw: 0.05, close: false });
            C.poly(g, [[tx - ux * 0.08, ty - uy * 0.08], [tx, ty]], { ink: P.brass, lw: 0.05, close: false });
        }
        if (pose.contract) {
            const c = pose.contract === true ? {} : pose.contract, at = c.at ?? [0.2, -0.2];
            contract(g, hL[0] + at[0], hL[1] + at[1], L, c);
        }
        arm(g, L, shL, hL);
        g.restore();
    }

    // His tail alone, where draw() puts it for the same (x, y, s, pose): for a shot in which something stands
    // between his tail and the rest of him (draw this, then that thing, then draw() with noTail).
    function tailOf(g, x, y, s, pose = {}) {
        const q = pose.squash ?? 0;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        tail(g, 3.2 / s, pose.tail ?? 0);
        g.restore();
    }
    // his shoulders, in his units (R is on screen left): where draw() hangs his arms. Devil.arm(g, L, sh, hand) is draw()'s
    // own arm, in his units (L: the outline's width), for a shot that has to paint one again over something
    const SH = { R: [TORSO.x + 0.03, TORSO.y + 0.14], L: [TORSO.x + TORSO.w - 0.03, TORSO.y + 0.14] };

    // --- imps -------------------------------------------------------------------------------
    // The Devil's staff: a small red box with stubby horns, big slit eyes and a fang, told
    // apart by what it wears. Units: 1 = the imp's width; the origin is the ground under it.
    //   pose: { squash, hop, mood ('grin' | 'awe' | 'oops'), look (-1..1), wear ('specs' | 'hat' | 'bow'),
    //           hold ('board' a clipboard and pencil, null), write (0..1 wiggles the pencil), armUp (0..1 a mitt in the air), tail }
    function imp(g, x, y, s, pose = {}) {
        const L = 3 / s, q = pose.squash ?? 0, mood = pose.mood ?? 'grin';
        const W = 1, H = 0.8, top = -1.02, x0 = -0.5;
        g.save();
        g.translate(x, y - (pose.hop ?? 0) * s);
        if (pose.shadow !== false) {
            g.fillStyle = P.shadow;
            g.beginPath();
            g.ellipse(0.04 * s, (pose.hop ?? 0) * s, 0.55 * s, 0.07 * s, 0, 0, C.TAU);
            g.fill();
        }
        g.scale(s, s);
        g.scale(1 + q, 1 - q);
        // tail
        const tw = pose.tail ?? 0;
        const tl = C.curve([[0.3, -0.34], [0.66, -0.3], [0.78, -0.52 + tw], [0.7, -0.76 + tw * 1.5]], false, 6);
        C.poly(g, ribbon(tl.map(([px, py], i) => [px, py, 0.035 - 0.012 * (i / (tl.length - 1))])), { fill: P.skin, ink: P.ink, lw: L });
        const te = tl[tl.length - 1];
        C.poly(g, [[te[0] - 0.09, te[1] + 0.02], [te[0] + 0.02, te[1] - 0.14], [te[0] + 0.1, te[1] + 0.04]], { fill: P.skin, ink: P.ink, lw: L });
        // legs with little hooves
        for (const sx of [-1, 1]) {
            C.box(g, sx * 0.22 - 0.11, -0.1, 0.22, 0.1, D, { front: P.hoof, top: P.hoofTop, side: P.hoof }, { lw: L, ink: P.ink, depth: 0.26 });
            C.box(g, sx * 0.22 - 0.085, -0.26, 0.17, 0.17, D, { front: P.skin, top: P.skinTop, side: P.skinSide }, { lw: L, ink: P.ink, depth: 0.2 });
        }
        C.box(g, x0, top, W, H, D, { front: P.skin, top: P.skinTop, side: P.skinSide }, { lw: L, ink: P.ink, depth: 0.5 });
        // stubby horns on the top
        for (const sx of [-1, 1]) {
            const hx = sx * 0.3 + D[0] * 0.18, hy = top + D[1] * 0.18;
            C.prism(g, cw([[hx - 0.1, hy], [hx + sx * 0.05, hy - 0.2], [hx + 0.1, hy]]), Dd(0.1), { front: P.horn, top: P.hornSide, side: P.hornSide }, { lw: L, ink: P.ink });
        }
        // the face
        const ey = top + 0.33, look = (pose.look ?? 0) * 0.04;
        for (const sx of [-1, 1]) {
            const ex = sx * 0.22, eh = mood === 'awe' ? 0.3 : mood === 'oops' ? 0.14 : 0.24;
            g.beginPath();
            g.roundRect(ex - 0.12, ey - eh / 2, 0.24, eh, 0.06);
            g.fillStyle = P.eye;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L;
            g.stroke();
            g.fillStyle = P.pupil;
            g.beginPath();
            g.roundRect(ex - 0.03 + look, ey - Math.min(0.09, eh / 2 - 0.02), 0.06, Math.min(0.18, eh - 0.04), 0.03);
            g.fill();
            g.fillStyle = P.glint;
            g.fillRect(ex - 0.08 + look * 0.5, ey - eh / 2 + 0.035, 0.04, 0.04);
            if (mood === 'oops') line(g, [[ex - sx * 0.14, ey - 0.16], [ex + sx * 0.12, ey - 0.1]], P.ink, L * 1.6);
        }
        const my = top + 0.6;
        if (mood === 'awe') {
            g.beginPath();
            g.ellipse(0, my + 0.02, 0.09, 0.08, 0, 0, C.TAU);
            g.fillStyle = P.mouth;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L;
            g.stroke();
        } else if (mood === 'oops') {
            line(g, [[-0.14, my + 0.03], [-0.07, my - 0.01], [0, my + 0.03], [0.07, my - 0.01], [0.14, my + 0.03]], P.ink, L * 1.2);
        } else {
            line(g, [[-0.16, my - 0.02], [-0.06, my + 0.05], [0.06, my + 0.05], [0.16, my - 0.02]], P.ink, L * 1.2);
            C.poly(g, [[0.07, my + 0.045], [0.13, my + 0.02], [0.105, my + 0.12]], { fill: P.tooth, ink: P.ink, lw: L * 0.8 });
        }
        // what it wears
        if (pose.wear === 'specs') {
            for (const sx of [-1, 1]) {
                g.beginPath();
                g.roundRect(sx * 0.22 - 0.16, ey - 0.17, 0.32, 0.34, 0.08);
                g.strokeStyle = P.ink;
                g.lineWidth = L * 2;
                g.stroke();
            }
            line(g, [[-0.06, ey - 0.02], [0.06, ey - 0.02]], P.ink, L * 2);
        } else if (pose.wear === 'hat') {
            // a hard hat: a dome and a brim, over the horns' roots
            const dome = cw(C.curve([[-0.4, top + 0.03], [-0.36, top - 0.2], [0, top - 0.3], [0.36, top - 0.2], [0.4, top + 0.03]], false, 6).concat([[0.4, top + 0.03]]));
            C.prism(g, dome.map(([px, py]) => [px + D[0] * 0.1, py + D[1] * 0.1]), Dd(0.3), { front: K.yellow, top: '#fff59a', side: K.gold }, { lw: L, ink: P.ink, sweepInk: null });
            C.prismOutline(g, dome.map(([px, py]) => [px + D[0] * 0.1, py + D[1] * 0.1]), Dd(0.3), { lw: L, ink: P.ink });
            C.box(g, -0.5, top - 0.01, 1.0, 0.06, D, { front: K.gold, top: K.yellow, side: '#e0a800' }, { lw: L, ink: P.ink, depth: 0.52 });
            line(g, [[0.03, top - 0.27], [0.03, top - 0.04]], '#e0a800', L * 1.4);
        } else if (pose.wear === 'bow') {
            const by = top - 0.02;
            for (const sx of [-1, 1]) C.poly(g, [[sx * 0.03, by - 0.03], [sx * 0.24, by - 0.14], [sx * 0.26, by + 0.08], [sx * 0.03, by + 0.03]], { fill: K.pink, ink: P.ink, lw: L });
            g.beginPath();
            g.roundRect(-0.05, by - 0.05, 0.1, 0.1, 0.02);
            g.fillStyle = K.magenta;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L;
            g.stroke();
        }
        // mitts: a clipboard and a pencil, or one mitt in the air
        const stub = (sh, hand) => {
            const dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6, ux = dx / len, uy = dy / len, nx = -uy * 0.08, ny = ux * 0.08;
            C.prism(g, cw([[sh[0] + nx, sh[1] + ny], [hand[0] + ux * 0.08 + nx, hand[1] + uy * 0.08 + ny], [hand[0] + ux * 0.08 - nx, hand[1] + uy * 0.08 - ny], [sh[0] - nx, sh[1] - ny]]), Dd(0.14), { front: P.skin, top: P.skinTop, side: P.skinSide }, { lw: L, ink: P.ink });
        };
        const up = pose.armUp ?? 0;
        if (pose.hold === 'board') {
            const bx = -0.12, by = -0.36;
            C.box(g, bx - 0.24, by - 0.2, 0.48, 0.42, D, { front: '#b98a55', top: '#8a6238', side: '#8a6238' }, { lw: L, ink: P.ink, depth: 0.03 });
            C.box(g, bx - 0.2, by - 0.15, 0.4, 0.34, D, { front: P.paper, top: P.paper, side: P.paperSide }, { lw: L * 0.7, ink: P.ink, depth: 0.012 });
            for (let i = 0; i < 4; i++) line(g, [[bx - 0.15, by - 0.08 + i * 0.065], [bx + (i === 3 ? 0.02 : 0.15), by - 0.08 + i * 0.065]], P.paperLine, L * 0.6);
            C.box(g, bx - 0.08, by - 0.24, 0.16, 0.07, D, { front: P.fork, top: P.forkShine, side: P.forkSide }, { lw: L * 0.8, ink: P.ink, depth: 0.04 });
            stub([x0 + 0.02, -0.46], [bx - 0.26, by + 0.08]);
            const wr = (pose.write ?? 0), px = bx + 0.1 + wr * 0.06, py = by + 0.06 - Math.abs(wr) * 0.03;
            // the pencil: yellow, a pink rubber, a point
            const pa = -0.5 + wr * 0.3, pen = [[-0.02, 0], [0, 0.05], [0.02, 0], [0.02, -0.3], [-0.02, -0.3]].map((p) => {
                const r = rot(p, pa);
                return [px + r[0], py + r[1]];
            });
            C.poly(g, pen, { fill: K.yellow, ink: P.ink, lw: L * 0.8 });
            stub(up > 0 ? [x0 + W - 0.02, -0.5] : [x0 + W - 0.02, -0.46], up > 0 ? [0.62, -0.66 - up * 0.5] : [px + 0.1, py - 0.1]);
        } else {
            stub([x0 + 0.02, -0.46], [-0.66, -0.4 - up * 0.5]);
            stub([x0 + W - 0.02, -0.46], [0.66, -0.4 - up * 0.5]);
        }
        g.restore();
    }

    return { P, draw, imp, trident, contract, TORSO, HEAD, tail: tailOf, SH, arm };
})();
