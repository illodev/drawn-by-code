// Props of «fade» (segments/fade.js): the Devil after the show. devil.js gives him buttoned up
// and bow-tied; here he is drawn over his own drawing, in his own frame, with the bow tie undone
// and hanging, the collar open and a towel round his neck, on legs that can shuffle (each hoof
// where the walk puts it), with a face that acts: lids, pupils that look anywhere, brows and four
// mouths, drawn as segments/hellhoof-props.js draws them (the small real smile is that block's,
// matched line for line; its own face carries the cold he had in Hell, which is long gone here,
// so the pieces are drawn again in this file). Also his guitar alone, as the dressing room's stand holds it, for the mitt that
// carries it in; the framed autograph hung on its nail under a camera; the glint on its glass.
// Units: his own (devil.js: 1 ≈ a head's width, the origin on the ground between the hooves)
// unless said otherwise. Global: FadeProps.
// Depends on Cereal, Cast, Devil, Fx, Inferno, Skyward.
const FadeProps = (() => {
    const C = Cereal, K = C.COL, P = Devil.P, T = Devil.TORSO, TAU = Math.PI * 2;
    const D = Cast.D, Dd = Cast.Dd, HIP = -(T.y + T.h);
    const lerp = (a, b, u) => a + (b - a) * u, clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const line = (g, pts, color, lw) => C.poly(g, pts, { ink: color, lw, close: false });
    const cw = (pts) => {
        let a = 0;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i], q = pts[(i + 1) % pts.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return a > 0 ? pts : pts.slice().reverse();
    };
    // a band of varying width along a centreline [[x, y, halfWidth], …] (as devil.js draws the moustache)
    const band = (cl) => {
        const A = [], B = [];
        cl.forEach(([x, y, w], i) => {
            const a = cl[Math.max(0, i - 1)], b = cl[Math.min(cl.length - 1, i + 1)];
            const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
            A.push([x - (dy / l) * w, y + (dx / l) * w]);
            B.push([x + (dy / l) * w, y - (dx / l) * w]);
        });
        return [...A, ...B.reverse()];
    };
    const TOWEL = { front: K.aqua, side: K.teal, fold: K.teal, stripe: '#fffdf4' };

    // --- his frame, his head, his limbs (devil.js keeps its own to itself) -----------------------------
    const HEAD = Devil.HEAD, HT = HEAD.top, CHIN = HT + HEAD.h, EY = HT + 0.44, MY = HT + 0.7;
    const SH_R = [T.x + 0.03, T.y + 0.14], SH_L = [T.x + T.w - 0.03, T.y + 0.14];
    const NO = [NaN, NaN]; // a mitt Devil.draw is asked not to draw (the canvas ignores a path that is not a number)
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const mixPts = (a, b, u) => a.map((p, i) => [lerp(p[0], b[i][0], u), lerp(p[1], b[i][1], u)]);
    // pose.rock turns the figure about the hips (his shoulders going while the legs stand)
    const rockXf = (g, x, y, s, pose) => {
        const r = pose.rock ?? 0;
        if (!r) return;
        g.translate(x, y - HIP * s);
        g.rotate(r);
        g.translate(-x, -(y - HIP * s));
    };
    // fn(L) draws in his units, with the pose's squash and rock (L: the outline's width)
    function body(g, x, y, s, pose, fn) {
        const q = pose.squash ?? 0;
        g.save();
        rockXf(g, x, y, s, pose);
        g.translate(x, y);
        g.scale(s, s);
        g.scale(1 + q, 1 - q);
        g.lineJoin = g.lineCap = 'round';
        fn(3.2 / s);
        g.restore();
    }
    const inHead = (g, pose, fn) => {
        g.save();
        g.translate(0, pose.headDy ?? 0);
        g.rotate(pose.headTilt ?? 0);
        fn();
        g.restore();
    };
    /**
     * The face, painted over the one devil.js gave him (the skin under the hairline is cleared first). f:
     *   eye:   { h (its height, 0.165 at rest), lx, ly (-1..1 where the pupils look), lid (0..1 the upper lid comes
     *            down), low (0..1 the lower lid comes up, as in a real smile), shut (null | 'happy' | 'tight') }
     *   brow:  { tilt (inner end down: 0.085 anger, 0.045 mischief, negative: soft), raise, cock (the screen-right one alone) }
     *   mouth: 'grit' | 'flat' | 'wobble' | 'smile'; mk: its size;  droop: the moustache's tips (negative lifts them)
     */
    function face(g, L, f) {
        const m = Math.max(0.02, L * 1.1);
        C.poly(g, [[-0.385, HT + 0.17 + m], [-0.17, HT + 0.1 + m], [0.02, HT + 0.27 + m], [0.2, HT + 0.1 + m], [0.385, HT + 0.17 + m], [0.41, HT + 0.4], [0.465, HT + 0.42], [0.465, CHIN - m * 0.6], [-0.465, CHIN - m * 0.6], [-0.465, HT + 0.42], [-0.41, HT + 0.4]], { fill: P.skin, lw: 0 });
        const e = { h: 0.165, lx: 0, ly: 0, lid: 0, low: 0, shut: null, ...(f.eye ?? {}) }, br = { tilt: 0.045, raise: 0, cock: 0, ...(f.brow ?? {}) };
        for (const sx of [-1, 1]) {
            const ex = sx * 0.21, ew = 0.2, eh = Math.max(0.06, e.h);
            if (e.shut === 'happy') line(g, [[ex - 0.09, EY + 0.035], [ex, EY - 0.03], [ex + 0.09, EY + 0.035]], P.ink, L * 1.5);
            else if (e.shut === 'tight') {
                line(g, [[ex - sx * 0.09, EY - 0.055], [ex + sx * 0.07, EY], [ex - sx * 0.09, EY + 0.055]], P.ink, L * 1.5);
                line(g, [[ex - sx * 0.02, EY - 0.03], [ex + sx * 0.07, EY]], P.ink, L * 1.1);
            } else {
                const ph = Math.min(0.125, eh - 0.035), top = EY - eh / 2;
                const px = ex + clamp(e.lx, -1, 1) * 0.058, py = EY + clamp(e.ly, -1, 1) * Math.max(0, eh / 2 - ph / 2 - 0.016);
                g.beginPath();
                g.roundRect(ex - ew / 2, top, ew, eh, 0.045);
                g.fillStyle = P.eye;
                g.fill();
                g.save();
                g.clip();
                g.fillStyle = P.pupil;
                g.beginPath();
                g.roundRect(px - 0.021, py - ph / 2, 0.042, ph, 0.02);
                g.fill();
                g.fillStyle = P.glint;
                g.fillRect(ex - 0.062 + e.lx * 0.025, top + 0.028 + Math.max(0, e.lid) * eh * 0.5, 0.03, 0.03);
                // the lids are skin, each with its edge
                if (e.lid > 0.02) {
                    g.fillStyle = P.skin;
                    g.fillRect(ex - ew / 2 - 0.01, top - 0.01, ew + 0.02, eh * e.lid + 0.01);
                }
                if (e.low > 0.02) {
                    g.fillStyle = P.skin;
                    g.beginPath();
                    g.ellipse(ex, EY + eh / 2 + 0.05, ew * 0.62, 0.05 + eh * e.low, 0, 0, TAU);
                    g.fill();
                    g.strokeStyle = P.ink;
                    g.lineWidth = L * 0.9;
                    g.stroke();
                }
                g.restore();
                g.beginPath();
                g.roundRect(ex - ew / 2, top, ew, eh, 0.045);
                g.strokeStyle = P.ink;
                g.lineWidth = L;
                g.stroke();
                const ly = top + 0.004 + eh * Math.max(0, e.lid);
                line(g, [[ex - ew / 2 - 0.012, ly], [ex + ew / 2 + 0.012, ly]], P.ink, L * 1.7);
            }
            const by = EY - 0.16 - br.raise - (sx > 0 ? br.cock : 0) - Math.max(0, e.h - 0.165) * 0.6;
            const bi = [ex - sx * 0.125, by + br.tilt], bo = [ex + sx * 0.125, by - br.tilt * 0.9];
            C.poly(g, [[bi[0], bi[1] - 0.04], [(bi[0] + bo[0]) / 2, (bi[1] + bo[1]) / 2 - 0.05], [bo[0] + sx * 0.02, bo[1] - 0.012], [bo[0], bo[1] + 0.012], [(bi[0] + bo[0]) / 2, (bi[1] + bo[1]) / 2 + 0.012], [bi[0], bi[1] + 0.03]], { fill: P.hair, ink: P.ink, lw: L * 0.8 });
        }
        line(g, [[0.018, EY + 0.05], [0.018, EY + 0.16], [0.075, EY + 0.135]], P.ink, L * 0.95);
        const k = f.mk ?? 1;
        if (f.mouth === 'grit') {
            // his clenched teeth, as devil.js draws them angry
            const pts = [[-0.27, MY + 0.07], [-0.2, MY - 0.03], [0.2, MY - 0.03], [0.27, MY + 0.07], [0.2, MY + 0.14], [-0.2, MY + 0.14]];
            C.poly(g, pts, { fill: P.tooth, lw: 0 });
            g.save();
            C.trace(g, pts);
            g.clip();
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.7;
            g.beginPath();
            g.moveTo(-0.3, MY + 0.055);
            for (let i = -5; i <= 5; i++) g.lineTo(i * 0.055, MY + 0.055 + (i % 2 ? 0.022 : -0.022));
            g.stroke();
            g.restore();
            C.poly(g, pts, { ink: P.ink, lw: L });
        } else if (f.mouth === 'wobble') {
            // a mouth that is fighting a smile: the line will not stay straight
            line(g, C.curve([[-0.19, MY + 0.02], [-0.12, MY + 0.06], [-0.04, MY + 0.02], [0.04, MY + 0.065], [0.12, MY + 0.025], [0.19, MY + 0.05]].map(([x, y]) => [x, MY + 0.04 + (y - MY - 0.04) * k]), false, 5), P.ink, L * 1.3);
        } else if (f.mouth === 'smile') {
            // the small real one: a closed curve, a dimple at each end, the lower lip's shade
            line(g, C.curve([[-0.165, MY + 0.0], [-0.09, MY + 0.05], [0, MY + 0.064], [0.09, MY + 0.05], [0.165, MY + 0.0]].map(([x, y]) => [x * k, y]), false, 6), P.ink, L * 1.35);
            for (const sx of [-1, 1]) line(g, [[sx * 0.185 * k, MY - 0.03], [sx * 0.2 * k, MY + 0.012]], P.ink, L * 1.0);
            line(g, [[-0.045, MY + 0.105], [0.045, MY + 0.105]], P.skinDark, L * 0.9);
        } else line(g, C.curve([[-0.11 * k, MY + 0.035], [0, MY + 0.045], [0.11 * k, MY + 0.035]], false, 5), P.ink, L * 1.3);
        // the moustache and the goatee, as devil.js draws them
        const mu = EY + 0.185, droop = f.droop ?? 0;
        for (const sx of [-1, 1]) {
            const cl = C.curve([[sx * 0.012, mu], [sx * 0.11, mu + 0.02], [sx * 0.24, mu + 0.0 + droop], [sx * 0.34, mu - 0.06 + droop * 1.6], [sx * 0.335, mu - 0.115 + droop * 1.8]], false, 8), n = cl.length;
            C.poly(g, band(cl.map(([x, y], i) => [x, y, 0.022 * (1 - (i / (n - 1)) * 0.82)])), { fill: P.hair, ink: P.ink, lw: L * 0.5 });
        }
        C.poly(g, [[-0.08, CHIN - 0.06], [0.08, CHIN - 0.06], [0.045, CHIN + 0.06], [0, CHIN + 0.13], [-0.045, CHIN + 0.06]], { fill: P.hair, ink: P.ink, lw: L });
        line(g, [[-0.03, CHIN - 0.03], [-0.012, CHIN + 0.055]], P.sheen, L * 0.9);
    }
    // a sleeve, a white cuff with a gold link, a red block mitt: devil.js's own arm
    function arm(g, L, sh, hand) {
        const w = 0.16, dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6;
        const ux = dx / len, uy = dy / len, nx = -uy * w * 0.5, ny = ux * w * 0.5;
        const quad = (a, b, k = 1) => cw([[sh[0] + ux * a + nx * k, sh[1] + uy * a + ny * k], [sh[0] + ux * b + nx * k, sh[1] + uy * b + ny * k], [sh[0] + ux * b - nx * k, sh[1] + uy * b - ny * k], [sh[0] + ux * a - nx * k, sh[1] + uy * a - ny * k]]);
        const c0 = Math.max(0.03, len - 0.14), c1 = Math.max(0.06, len - 0.075);
        C.prism(g, quad(-0.05, c0), Dd(0.16), { front: P.suit, top: P.suitTop, side: P.suitSide }, { lw: L, ink: P.ink });
        C.prism(g, quad(c0, c1, 1.12), Dd(0.17), { front: P.shirt, top: P.shirt, side: '#d9d4e6' }, { lw: L, ink: P.ink });
        g.beginPath();
        g.arc(sh[0] + (ux * (c0 + c1)) / 2, sh[1] + (uy * (c0 + c1)) / 2, 0.016, 0, TAU);
        g.fillStyle = P.button;
        g.fill();
        C.prism(g, quad(c1, len + 0.11), Dd(0.16), { front: P.skin, top: P.skinTop, side: P.skinSide }, { lw: L, ink: P.ink });
    }
    // The tail along seven control points (devil.js's own thickness, underside and spade).
    const TAIL = {
        rest: (sw = 0) => [[0.2, -0.46], [0.56, -0.34], [0.84, -0.44], [0.86, -0.72 + sw * 0.5], [0.72, -0.94 + sw], [0.84, -1.16 + sw * 1.4], [1.0, -1.26 + sw * 1.6]],
        // lying on the floor beside him, the spade curled up off it
        floor: [[0.2, -0.46], [0.45, -0.26], [0.52, -0.08], [0.62, -0.04], [0.7, -0.1], [0.67, -0.21], [0.58, -0.26]],
        // dragged along the floor behind a tired walk
        trail: [[0.2, -0.46], [0.52, -0.3], [0.72, -0.08], [0.98, -0.035], [1.22, -0.03], [1.42, -0.05], [1.6, -0.03]],
    };
    function tail(g, L, ctrl) {
        const pts = C.curve(ctrl, false, 8), n = pts.length;
        C.poly(g, band(pts.map(([px, py], i) => [px, py, 0.05 - 0.028 * (i / (n - 1))])), { fill: P.skin, ink: P.ink, lw: L });
        line(g, pts.slice(4, Math.floor(n * 0.55)).map(([px, py]) => [px + 0.012, py + 0.014]), P.skinSide, L * 1.1);
        const e = pts[n - 1], f = pts[n - 3], a = Math.atan2(e[1] - f[1], e[0] - f[0]);
        C.prism(g, cw([[-0.02, -0.03], [-0.07, -0.13], [0.06, -0.075], [0.2, 0], [0.06, 0.075], [-0.07, 0.13], [-0.02, 0.03]].map((p) => {
            const q = rot(p, a);
            return [e[0] + q[0], e[1] + q[1]];
        })), Dd(0.04), { front: P.skin, top: P.skinTop, side: P.skinSide }, { lw: L, ink: P.ink });
    }
    // His legs as devil.js draws them, each hoof free to go where the walk puts it: o.R, o.L = { x, y }
    // (the hoof's offset from its place; the trouser leg runs from the hip to wherever it is), o.front the leg drawn last.
    function legs(g, L, o = {}) {
        for (const sx of [-1, 1]) {
            const tx = sx * 0.17 + D[0] * 0.36, ty = D[1] * 0.36;
            C.poly(g, [[tx - 0.13, -0.42 + ty], [tx + 0.13, -0.42 + ty], [tx + 0.1 + sx * 0.02, -0.16 + ty], [tx + sx * 0.05, -0.1 + ty], [tx - 0.1 + sx * 0.02, -0.16 + ty]], { fill: P.suitSide, ink: P.ink, lw: L });
        }
        const leg = (sx) => {
            const p = (sx < 0 ? o.R : o.L) ?? {}, lx = sx * 0.19, hx = lx + (p.x ?? 0), hy = p.y ?? 0;
            const top = [lx, -0.4], bot = [hx, hy - 0.11];
            if (bot[1] > top[1] + 0.02) {
                C.prism(g, cw([[top[0] - 0.12, top[1]], [top[0] + 0.12, top[1]], [bot[0] + 0.12, bot[1]], [bot[0] - 0.12, bot[1]]]), Dd(0.3), { front: P.trouser, top: P.trouser, side: P.trouserSide }, { lw: L, ink: P.ink });
                for (const px of [-0.06, 0, 0.06]) line(g, [[top[0] + px, top[1] + 0.015], [bot[0] + px, bot[1] - 0.01]], P.stripe, L * 0.5);
            }
            C.box(g, hx - 0.14, hy - 0.115, 0.28, 0.115, D, { front: P.hoof, top: P.hoofTop, side: P.hoof }, { lw: L, ink: P.ink, depth: 0.34 });
            C.poly(g, [[hx - 0.02, hy - 0.117], [hx, hy - 0.035], [hx + 0.02, hy - 0.117]], { fill: P.ink, ink: P.ink, lw: L * 0.6 });
            line(g, [[hx - 0.108, hy - 0.082], [hx - 0.05, hy - 0.082]], P.hoofShine, L * 1.1);
        };
        if (o.front === 'R') [1, -1].forEach(leg);
        else [-1, 1].forEach(leg);
    }
    // devil.js's body and head alone: no arms, and its own legs and tail cut away (everything above
    // the coat's hem, and nothing to the right of the coat below the head)
    function trunk(g, x, y, s, pose) {
        const q = pose.squash ?? 0;
        g.save();
        rockXf(g, x, y, s, pose);
        const yA = y - 0.9 * s, yB = y - (HIP - 1.6 / s) * (1 - q) * s, xB = x + 0.492 * s * (1 + q);
        g.beginPath();
        g.moveTo(-2000, -2000);
        g.lineTo(3000, -2000);
        g.lineTo(3000, yA);
        g.lineTo(xB, yA);
        g.lineTo(xB, yB);
        g.lineTo(-2000, yB);
        g.closePath();
        g.clip();
        Devil.draw(g, x, y, s, { squash: q, headDy: pose.headDy, headTilt: pose.headTilt, handR: NO, handL: NO, tail: 0, shadow: false });
        g.restore();
    }

    // --- what he wears after the show ------------------------------------------------------------
    // Painted over devil.js's chest, under his chin (the head's own line clips it, wherever the
    // head has nodded to): the shirt front and lapels again without the bow, the collar open, the
    // tie hanging in two strands, a towel round the neck. sw: how far the loose ends swing.
    function chest(g, L, pose, sw = 0) {
        const y = T.y, tilt = pose.headTilt ?? 0, c = Math.cos(tilt), sn = Math.sin(tilt), dy = (pose.headDy ?? 0) + 0.6 * L;
        const chin = (px) => [px * c + 0.9 * sn, px * sn - 0.9 * c + dy];
        g.save();
        g.beginPath();
        [chin(-3), chin(3), [3, 3], [-3, 3]].forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
        g.closePath();
        g.clip();
        // devil.js's shirt front, studs and lapels
        C.poly(g, [[-0.15, y], [0.15, y], [0.035, y + 0.44], [-0.035, y + 0.44]], { fill: P.shirt, ink: P.ink, lw: L * 0.8 });
        g.fillStyle = P.ink;
        for (const sy of [0.33, 0.39]) {
            g.beginPath();
            g.arc(0, y + sy, 0.011, 0, C.TAU);
            g.fill();
        }
        // the top stud is undone: the placket's line shows down the open shirt
        line(g, [[0.004, y + 0.1], [0.004, y + 0.3]], '#d9d4e6', L * 0.8);
        for (const s of [-1, 1]) {
            const lap = [[s * 0.15, y], [s * 0.3, y], [s * 0.3, y + 0.1], [s * 0.335, y + 0.15], [s * 0.25, y + 0.2], [s * 0.035, y + 0.44]];
            C.poly(g, lap, { fill: P.lapel, ink: P.ink, lw: L * 0.8 });
            line(g, [[s * 0.25, y + 0.2], [s * 0.3, y + 0.1]], P.ink, L * 0.7);
            line(g, [[s * 0.2, y + 0.06], [s * 0.085, y + 0.33]], P.lapelDark, L * 0.9);
        }
        // the bow tie, undone: a narrow band round the collar, each end widening to its wing
        const strand = (s, len, k) => {
            const x0 = s * 0.052, yT = y + 0.05, yN = yT + len * 0.52, yE = yT + len, dx = sw * k;
            const cl = [[x0, yT, 0.015], [x0 + s * 0.012 + dx * 0.2, yT + len * 0.28, 0.015], [x0 + s * 0.022 + dx * 0.5, yN, 0.02],
                [x0 + s * 0.028 + dx * 0.8, lerp(yN, yE, 0.5), 0.045], [x0 + s * 0.03 + dx, yE - 0.014, 0.048], [x0 + s * 0.03 + dx, yE, 0.04]];
            C.poly(g, band(cl), { fill: P.tie, ink: P.ink, lw: L * 0.8 });
            line(g, [[cl[2][0] - 0.014, cl[2][1]], [cl[2][0] + 0.014, cl[2][1] + 0.004]], P.tieDark, L * 0.8);
            g.fillStyle = P.lapel;
            for (const [u, v] of [[0.45, -0.018], [0.72, 0.016], [0.86, -0.014]]) {
                g.beginPath();
                g.arc(lerp(cl[2][0], cl[5][0], u) + v, lerp(yN, yE, u), 0.011, 0, C.TAU);
                g.fill();
            }
        };
        strand(-1, 0.29, 0.8);
        strand(1, 0.38, 1);
        // the open collar: a point each side of the goatee
        for (const s of [-1, 1]) C.poly(g, [[s * 0.012, y + 0.06], [s * 0.15, y + 0.055], [s * 0.118, y + 0.165]], { fill: P.shirt, ink: P.ink, lw: L * 0.8 });
        // the towel: its two ends down the chest, the screen-right one longer; two stripes and a fringe
        const end = (s, yb, k) => {
            const dx = sw * k, top = [[s * 0.115, y - 0.03], [s * 0.33, y - 0.03]], bot = [[s * 0.125 + dx, yb], [s * 0.35 + dx, yb - 0.014]];
            C.prism(g, cw([top[0], top[1], bot[1], bot[0]]), Dd(0.05), { front: TOWEL.front, top: TOWEL.front, side: TOWEL.side }, { lw: L, ink: P.ink });
            const at = (u, v) => [lerp(lerp(top[0][0], top[1][0], u), lerp(bot[0][0], bot[1][0], u), v), lerp(lerp(top[0][1], top[1][1], u), lerp(bot[0][1], bot[1][1], u), v)];
            line(g, [at(0.42, 0.24), at(0.46, 0.6), at(0.42, 0.8)], TOWEL.fold, L * 0.9);
            const span = bot[0][1] - top[0][1];
            for (const v of [1 - 0.05 / span, 1 - 0.085 / span]) line(g, [at(0.06, v), at(0.94, v)], TOWEL.stripe, L * 1.5);
            for (let i = 0; i <= 5; i++) {
                const p = at(0.06 + 0.176 * i, 1);
                line(g, [[p[0], p[1] + L * 0.5], [p[0] + dx * 0.15, p[1] + 0.032]], P.ink, L * 0.8);
            }
        };
        end(-1, y + 0.4, 0.9);
        end(1, y + 0.5, 1.2);
        g.restore();
    }

    /**
     * The Devil of this block at (x, y, s): shadow, tail, legs (each hoof where it is), devil.js's
     * body and head, what he wears now, the acting face, whatever he holds, then his arms.
     *   pose: { squash, rock (the body turned about the hips), headDy, headTilt, face (see face()),
     *           handR, handL (his units; R is the mitt on screen left), shrugR, shrugL (shoulders up; negative: down),
     *           hoofR, hoofL ({ x, y }: each hoof's offset from its place), front ('R' | 'L' the leg drawn last),
     *           tail (seven control points), sw (how far the towel and the tie swing),
     *           ground ([x, y] on screen: where his shadow lies), air (0..1 off the floor: the shadow shrinks) }
     *   mid(g): drawn in the caller's coordinates between his body and his arms (what the mitts are on)
     *   back(g): the same, behind his body and in front of his legs and tail (what he has over a shoulder)
     */
    function devil(g, x, y, s, pose, mid, back) {
        const still = {}, gr = pose.ground ?? [x, y], air = pose.air ?? 0;
        g.fillStyle = P.shadow;
        g.beginPath();
        g.ellipse(gr[0] + 0.06 * s, gr[1], 0.6 * s * (1 - 0.3 * air), 0.065 * s * (1 - 0.3 * air), 0, 0, C.TAU);
        g.fill();
        body(g, x, y, s, still, (L) => {
            tail(g, L, pose.tail ?? TAIL.rest(0));
            legs(g, L, { R: pose.hoofR, L: pose.hoofL, front: pose.front });
        });
        if (back) back(g);
        trunk(g, x, y, s, pose);
        body(g, x, y, s, pose, (L) => {
            chest(g, L, pose, pose.sw ?? 0);
            if (pose.face) inHead(g, pose, () => face(g, L, pose.face));
        });
        if (mid) mid(g);
        body(g, x, y, s, pose, (L) => {
            arm(g, L, [SH_R[0], SH_R[1] - (pose.shrugR ?? 0)], pose.handR);
            arm(g, L, [SH_L[0], SH_L[1] - (pose.shrugL ?? 0)], pose.handL);
        });
    }
    // a point of the screen in his units, for a pose drawn at (x, y, s): where a mitt must be to touch it
    function toBody(x, y, s, pose, [px, py]) {
        let u = (px - x) / s, v = (py - y) / s;
        const r = pose.rock ?? 0, q = pose.squash ?? 0;
        if (r) {
            const c = Math.cos(-r), sn = Math.sin(-r), w = v + HIP;
            [u, v] = [u * c - w * sn, u * sn + w * c - HIP];
        }
        return [u / (1 + q), v / (1 - q)];
    }
    // a mitt no further from its shoulder than his arm goes
    function reach(sh, hand, max = 0.95) {
        const dx = hand[0] - sh[0], dy = hand[1] - sh[1], l = Math.hypot(dx, dy);
        return l <= max ? hand : [sh[0] + (dx / l) * max, sh[1] + (dy / l) * max];
    }

    // --- the guitar alone ---------------------------------------------------------------------------
    // As Skyward.backstage stands it in its cradle: (x, y) where its tail rests, s its scale (the
    // stand's own), the neck straight up; fl 0..1 the fire off its horns and its fork, d the drawing.
    // rot swings it about the middle of its body (his way of carrying it: by the neck, the body back
    // over his shoulder); its fire always burns upwards. guitarGrip: where his mitt has the neck.
    const GRIP_U = 0.68, MID = [0.02, -0.5];
    const about = (x, y, s, r, [u, v]) => {
        const mx = x + MID[0] * s, my = y + MID[1] * s, q = rot([(u - MID[0]) * s, (v - MID[1]) * s], r);
        return [mx + q[0], my + q[1]];
    };
    const guitarGrip = (x, y, s, r = 0) => about(x, y, s, r, [0.03, MID[1] - GRIP_U]);
    function guitar(g, x, y, s, fl, d, r = 0) {
        if (fl > 0.02) {
            Fx.flame(g, ...about(x, y, s, r, [-0.36, -0.26]), 0.42 * s * fl * (1 + 0.1 * (d % 2)), d, 0);
            Fx.flame(g, ...about(x, y, s, r, [0.36, -0.3]), 0.36 * s * fl * (1 + 0.1 * ((d + 1) % 2)), d, 2);
        }
        g.save();
        g.translate(x + MID[0] * s, y + MID[1] * s);
        g.rotate(r);
        g.scale(s, s);
        g.lineJoin = 'round';
        Inferno.guitar(g, 3.2 / s, [0, 0], -Math.PI / 2 + 0.02, 1, 1);
        g.restore();
        if (fl > 0.5 && Math.abs(r) < 0.3) Fx.flame(g, ...about(x, y, s, r, [0.04, -1.6]), 0.2 * s * fl, d, 1);
    }

    // --- the autograph on its nail --------------------------------------------------------------------
    const A_W = 1.24, A_H = 1.08, MOULD = 0.085; // Skyward.autograph's size and its moulding, in units of its s
    // a lower corner of the frame F ({ x, y, s, tilt }), sx −1 the screen-left one
    const corner = (F, sx) => {
        const c = Math.cos(F.tilt), sn = Math.sin(F.tilt), hw = (A_W / 2) * F.s * sx, hh = (A_H / 2) * F.s;
        return [F.x + hw * c - hh * sn, F.y + hw * sn + hh * c];
    };
    /**
     * The framed autograph hanging: F is Skyward.frameAt's result, cam the camera ({ Z, at([x, y]) → screen }):
     * the wire up to the nail, the frame, the nail's head over the wire. Drawn in screen units so its
     * outline keeps its width while the camera pushes in (the room behind it is drawn under the zoom).
     */
    function hung(g, cam, F, glint = 0.3) {
        const Z = cam.Z, nail = cam.at(Skyward.BACKSTAGE.nail), c = Math.cos(F.tilt), sn = Math.sin(F.tilt), hh = (A_H / 2) * F.s, hw = (A_W / 2) * 0.62 * F.s;
        g.lineJoin = g.lineCap = 'round';
        line(g, [cam.at([F.x - hw * c + hh * sn, F.y - hw * sn - hh * c]), nail, cam.at([F.x + hw * c + hh * sn, F.y + hw * sn - hh * c])], '#3a2012', Math.min(3.4, 2.6 * Z));
        const m = cam.at([F.x, F.y]);
        Skyward.autograph(g, m[0], m[1], F.s * Z, { tilt: F.tilt, glint });
        const r = 5.5 * Z;
        g.beginPath();
        g.arc(nail[0], nail[1], r, 0, C.TAU);
        g.fillStyle = '#c9cfe2';
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = Math.min(3.2, 2.4 * Z);
        g.stroke();
        g.beginPath();
        g.arc(nail[0] - 0.27 * r, nail[1] - 0.27 * r, 0.33 * r, 0, C.TAU);
        g.fillStyle = '#f4f6fc';
        g.fill();
    }
    // The glass glints once: a pair of bright bands crosses it from left to right (u 0 → 1), and a
    // star flares where they pass its upper corner.
    function glint(g, cam, F, u, d) {
        if (u <= 0 || u >= 1) return;
        const m = cam.at([F.x, F.y]), s = F.s * cam.Z, hw = A_W / 2 - MOULD, hh = A_H / 2 - MOULD, gx = lerp(-hw - 0.5, hw + 0.25, u), a = Math.sin(Math.PI * u);
        g.save();
        g.translate(m[0], m[1]);
        g.rotate(F.tilt);
        g.scale(s, s);
        g.save();
        g.beginPath();
        g.rect(-hw, -hh, 2 * hw, 2 * hh);
        g.clip();
        g.fillStyle = `rgba(255,255,255,${(0.2 + 0.5 * a).toFixed(3)})`;
        for (const [dx, w] of [[0, 0.13], [0.2, 0.045]]) {
            g.beginPath();
            g.moveTo(gx + dx + 0.27, -hh);
            g.lineTo(gx + dx + 0.27 + w, -hh);
            g.lineTo(gx + dx + w - 0.27, hh);
            g.lineTo(gx + dx - 0.27, hh);
            g.closePath();
            g.fill();
        }
        g.restore();
        g.restore();
        if (u > 0.3 && u < 0.72) {
            const k = [0.6, 1, 0.75, 0.4][Math.min(3, d)] ?? 0.4, c = Math.cos(F.tilt), sn = Math.sin(F.tilt), px = (-hw + 0.1) * s, py = (-hh + 0.1) * s;
            C.sparkle(g, m[0] + px * c - py * sn, m[1] + px * sn + py * c, 64 * k, { color: K.white, ink: K.ink, lw: 3, rot: 0.2 });
        }
    }

    // --- the VCR's title generator ---------------------------------------------------------------------
    // Cereal.osd's hand (a thin slanted monoline with chamfered corners, round caps and a soft glow,
    // glyphs on a 1 × 2 box, its size, slant, weight and advance) for the letters it does not have:
    // lower case with an x-height of 0.62 of the capitals, ascenders to the capitals' height.
    const XH = 2 - 1.24; // the x-height line, on the 1 × 2 box (0 the capitals' top, 2 the baseline)
    const GLYPHS = {
        i: [[[0.16, XH], [0.5, XH], [0.5, 2]], [[0.12, 2], [0.88, 2]], [[0.47, 0.2], [0.5, 0.26]]],
        l: [[[0.16, 0], [0.5, 0], [0.5, 2]], [[0.12, 2], [0.88, 2]]],
        o: [[[0.26, XH], [0.74, XH], [1, XH + 0.28], [1, 1.72], [0.74, 2], [0.26, 2], [0, 1.72], [0, XH + 0.28], [0.26, XH]]],
        d: [[[1, 0], [1, 2]], [[1, XH + 0.28], [0.74, XH], [0.26, XH], [0, XH + 0.28], [0, 1.72], [0.26, 2], [0.74, 2], [1, 1.72]]],
        e: [[[0, 1.4], [1, 1.4], [1, XH + 0.28], [0.74, XH], [0.26, XH], [0, XH + 0.28], [0, 1.72], [0.26, 2], [0.78, 2], [1, 1.8]]],
        v: [[[0, XH], [0.5, 2], [1, XH]]],
        x: [[[0, XH], [1, 2]], [[1, XH], [0, 2]]],
        C: [[[1, 0.3], [0.74, 0], [0.26, 0], [0, 0.3], [0, 1.7], [0.26, 2], [0.74, 2], [1, 1.7]]],
        a: [[[0.06, XH + 0.2], [0.28, XH], [0.74, XH], [1, XH + 0.28], [1, 2]], [[1, 1.34], [0.26, 1.34], [0, 1.54], [0, 1.78], [0.24, 2], [0.72, 2], [1, 1.74]]],
        u: [[[0, XH], [0, 1.72], [0.26, 2], [0.72, 2], [1, 1.74]], [[1, XH], [1, 2]]],
    };
    const OSD = { h: 65, w: 36, adv: 50.5, x: 103, slant: 0.13, lw: 5.4 }; // Cereal.osd's numbers
    /**
     * The first n characters of `text` in the VCR's display lettering, left-aligned with Cereal.osd's
     * words, its baseline at y (frame units); cursor: true draws the title generator's block after them.
     */
    function typed(g, text, y, n = text.length, cursor = false) {
        g.save();
        g.translate(OSD.x, y);
        g.transform(1, 0, -OSD.slant, 1, 0, 0);
        g.strokeStyle = g.fillStyle = '#ffffff';
        g.lineWidth = OSD.lw;
        g.lineCap = g.lineJoin = 'round';
        g.shadowColor = 'rgba(255,255,255,0.8)';
        g.shadowBlur = 14 * C.pxScale(g);
        const chars = [...text].slice(0, n);
        chars.forEach((ch, i) => {
            for (const st of GLYPHS[ch] ?? []) {
                g.beginPath();
                st.forEach(([px, py], j) => (j ? g.lineTo(i * OSD.adv + px * OSD.w, (py / 2 - 1) * OSD.h) : g.moveTo(i * OSD.adv + px * OSD.w, (py / 2 - 1) * OSD.h)));
                g.stroke();
            }
        });
        if (cursor) {
            g.beginPath();
            g.rect(chars.length * OSD.adv, -OSD.h, OSD.w, OSD.h);
            g.fill();
            g.stroke();
        }
        g.restore();
    }

    return { chest, face, devil, toBody, reach, SH_R, SH_L, TAIL, mixPts, guitar, guitarGrip, corner, hung, glint, typed, A_W, A_H };
})();
