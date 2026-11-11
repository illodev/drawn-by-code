// Props for «solo2» (bars 137–144, the volcano launches the car out of Hell) and for every
// block after it. Global: Solo2Props. Depends on Cereal, Song, Cast, Devil, Fx; the sets'
// colours come from Inferno.R where it is loaded.
//
// THE HANGERS — three imps and the skeleton with the pink mohawk, carried off under the car's
// tail in one chain: an imp in specs hangs from the near exhaust pipe by both mitts, an imp with
// a bow holds his hooves, a third imp holds hers, and the skeleton hangs from that one's hoof by
// one arm, pumping his other fist. They swing on the beat (each link lags the one above, so a
// wave runs down the chain) and stay with the car for the rest of the film.
//
//     Finale.ride(g, t, x, y, s, o);                        // the car first: their mitts go over its pipe
//     Solo2Props.hangers(g, t, x, y, s, { lean, bounce });  // the SAME x, y, s (the car's ground point and scale)
//     Skyward.ascentFront(g, t, Y, …);                      // then whatever passes in front of the car
//
//   o: { lean, bounce   what the ride was given, so the grip follows the car's body (default 0)
//        swing          0..1.5 how far they swing (default 1; 0 hangs them dead still)
//        trail          radians added down the chain, + towards the nose (default 0: they hang
//                       straight down; e.g. -0.5 while the car dives forwards and they trail behind)
//        n              how many links are on, from the top (default 4; 0 draws nothing)
//        jaw            the skeleton's jaw 0..1 (default: it laughs on the beat) }
//   The chain is 3.2 car units long: at Finale.CAR (500, 640, 84) it reaches from the pipe at
//   (119, 581) down to y ≈ 905 and stays between x ≈ 85 and 250.
//   Solo2Props.hangerPoints(t, x, y, s, o) → [{ grip: [x, y], ang } × 4] on screen (grip: where
//   the link holds on; ang: its swing, + takes its feet towards the nose).
//   Solo2Props.hanger(g, i, gx, gy, s, ang, pose) draws link i alone, hanging from (gx, gy).
//
// Also here: rockets (the exhausts as rockets), and the pieces of solo2's own shots.
const Solo2Props = (() => {
    const C = Cereal, K = C.COL, S = Song, TAU = Math.PI * 2, PI = Math.PI;
    const D = Cast.D, Dd = (z) => [D[0] * z, D[1] * z];
    const lerp = (a, b, u) => a + (b - a) * u;
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const cw = (pts) => {
        let a = 0;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i], q = pts[(i + 1) % pts.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return a > 0 ? pts : pts.slice().reverse();
    };
    const line = (g, pts, lw, ink = K.ink) => C.poly(g, pts, { ink, lw, close: false });
    const circ = (g, x, y, r, fill, lw = 0, ink = K.ink) => {
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
    // a band along a polyline of [x, y, half width]
    const ribbon = (pts) => {
        const A = [], B = [];
        for (let i = 0; i < pts.length; i++) {
            const [x, y, w] = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
            const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
            A.push([x - (dy / l) * w, y + (dx / l) * w]);
            B.push([x + (dy / l) * w, y - (dx / l) * w]);
        }
        return [...A, ...B.reverse()];
    };

    // =========================================================================================
    // The hangers
    // =========================================================================================
    const IMP = 0.67; // an imp's unit, in figure units (as everywhere in the film)
    const IMP_GRIP = -1.32, IMP_LEG = 0.38; // the mitts' height above the hooves; a hanging imp's legs are apart
    // An imp hanging by both mitts: Devil.imp's own drawing with the arms straight up along the
    // head's sides. Drawn in its units with the feet at (0, 0); pose: { mood ('grin' | 'awe'),
    // look, lookY, wear ('specs' | 'bow'), tail, hx (half the distance between the mitts) }
    function hangImp(g, L, pose = {}) {
        const P = Devil.P, mood = pose.mood ?? 'grin', top = -1.02, hx = pose.hx ?? 0.46;
        const tw = pose.tail ?? 0;
        const tl = C.curve([[0.3, -0.34], [0.66, -0.3], [0.78, -0.52 + tw], [0.7, -0.76 + tw * 1.5]], false, 6);
        C.poly(g, ribbon(tl.map(([px, py], i) => [px, py, 0.035 - 0.012 * (i / (tl.length - 1))])), { fill: P.skin, ink: P.ink, lw: L });
        const te = tl[tl.length - 1];
        C.poly(g, [[te[0] - 0.09, te[1] + 0.02], [te[0] + 0.02, te[1] - 0.14], [te[0] + 0.1, te[1] + 0.04]], { fill: P.skin, ink: P.ink, lw: L });
        for (const sx of [-1, 1]) {
            const x = sx * IMP_LEG;
            C.box(g, x - 0.11, -0.1, 0.22, 0.1, D, { front: P.hoof, top: P.hoofTop, side: P.hoof }, { lw: L, ink: P.ink, depth: 0.26 });
            C.box(g, x - 0.085, -0.26, 0.17, 0.17, D, { front: P.skin, top: P.skinTop, side: P.skinSide }, { lw: L, ink: P.ink, depth: 0.2 });
        }
        C.box(g, -0.5, top, 1, 0.8, D, { front: P.skin, top: P.skinTop, side: P.skinSide }, { lw: L, ink: P.ink, depth: 0.5 });
        for (const sx of [-1, 1]) {
            const hxx = sx * 0.28 + D[0] * 0.18, hy = top + D[1] * 0.18;
            C.prism(g, cw([[hxx - 0.1, hy], [hxx + sx * 0.05, hy - 0.2], [hxx + 0.1, hy]]), Dd(0.1), { front: P.horn, top: P.hornSide, side: P.hornSide }, { lw: L, ink: P.ink });
        }
        const ey = top + 0.33, look = (pose.look ?? 0) * 0.04, lookY = (pose.lookY ?? 0) * 0.03;
        for (const sx of [-1, 1]) {
            const ex = sx * 0.22, eh = mood === 'awe' ? 0.3 : 0.24;
            g.beginPath();
            g.roundRect(ex - 0.12, ey - eh / 2, 0.24, eh, 0.06);
            g.fillStyle = P.eye;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L;
            g.stroke();
            g.fillStyle = P.pupil;
            g.beginPath();
            g.roundRect(ex - 0.03 + look, ey - Math.min(0.09, eh / 2 - 0.02) + lookY, 0.06, Math.min(0.18, eh - 0.04), 0.03);
            g.fill();
            g.fillStyle = P.glint;
            g.fillRect(ex - 0.08 + look * 0.5, ey - eh / 2 + 0.035, 0.04, 0.04);
        }
        const my = top + 0.6;
        if (mood === 'awe') {
            g.beginPath();
            g.ellipse(0, my + 0.02, 0.09, 0.08, 0, 0, TAU);
            g.fillStyle = P.mouth;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L;
            g.stroke();
        } else {
            line(g, [[-0.16, my - 0.02], [-0.06, my + 0.05], [0.06, my + 0.05], [0.16, my - 0.02]], L * 1.2, P.ink);
            C.poly(g, [[0.07, my + 0.045], [0.13, my + 0.02], [0.105, my + 0.12]], { fill: P.tooth, ink: P.ink, lw: L * 0.8 });
        }
        if (pose.wear === 'specs') {
            for (const sx of [-1, 1]) {
                g.beginPath();
                g.roundRect(sx * 0.22 - 0.16, ey - 0.17, 0.32, 0.34, 0.08);
                g.strokeStyle = P.ink;
                g.lineWidth = L * 2;
                g.stroke();
            }
            line(g, [[-0.06, ey - 0.02], [0.06, ey - 0.02]], L * 2, P.ink);
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
        // the arms: a stub up each side of the head, the mitt on what it holds
        for (const sx of [-1, 1]) {
            const sh = [sx * 0.5, -0.6], hand = [sx * hx, IMP_GRIP], dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, nx = -uy * 0.08, ny = ux * 0.08;
            C.prism(g, cw([[sh[0] + nx, sh[1] + ny], [hand[0] + ux * 0.08 + nx, hand[1] + uy * 0.08 + ny], [hand[0] + ux * 0.08 - nx, hand[1] + uy * 0.08 - ny], [sh[0] - nx, sh[1] - ny]]), Dd(0.14), { front: P.skin, top: P.skinTop, side: P.skinSide }, { lw: L, ink: P.ink });
        }
    }

    // The crowd's skeleton with the pink mohawk (Inferno.fan's, the surfer's tee), hanging by both mitts.
    const SK = {
        ink: K.ink, bone: '#f4edd8', boneTop: '#fffdf4', boneSide: '#cdbf9c', socket: '#2a2438', glint: '#fffdf4', mouth: '#5a1220',
        skin: '#fffdf4', skinTop: '#ffffff', skinSide: '#d6d0c2', jacket: '#f4edd8', jacketTop: '#fffdf4', jacketSide: '#cdbf9c',
        jeans: '#3a2f5e', jeansSide: '#2c2349', shoe: '#2a2438', shoeTop: '#3d3652', shoeSide: '#1f1a2b', sole: '#fffdf4',
    };
    const TEE = ['#7d47e1', '#a888f5', '#5a2fb5'], BONE = { front: SK.bone, top: SK.boneTop, side: SK.boneSide };
    function skull(g, L, jaw, hawk, look) {
        const top = -1.74, hw = 0.42, ch = -1.3, jx = 0.29, ub = -1.13, drop = jaw * 0.13;
        C.box(g, -jx + 0.02, ub + drop - 0.02, jx * 2 - 0.04, 0.15, D, BONE, { lw: L, depth: 0.36 });
        if (drop > 0.01) C.poly(g, [[-jx + 0.04, ub - 0.02], [jx - 0.04, ub - 0.02], [jx - 0.04, ub + drop + 0.005], [-jx + 0.04, ub + drop + 0.005]], { fill: SK.mouth, ink: K.ink, lw: L * 0.8 });
        g.strokeStyle = K.ink;
        g.lineWidth = L * 0.7;
        g.beginPath();
        g.moveTo(-jx + 0.02, ub + drop + 0.055);
        g.lineTo(jx - 0.02, ub + drop + 0.055);
        for (let i = -2; i <= 2; i++) {
            g.moveTo(i * 0.092, ub + drop - 0.02);
            g.lineTo(i * 0.092, ub + drop + 0.055);
        }
        g.stroke();
        C.prism(g, [[-hw, top], [hw, top], [hw, ch], [jx, ch + 0.07], [jx, ub], [-jx, ub], [-jx, ch + 0.07], [-hw, ch]], Dd(0.46), BONE, { lw: L });
        g.strokeStyle = K.ink;
        g.lineWidth = L * 0.7;
        g.beginPath();
        g.moveTo(-jx, ub - 0.085);
        g.lineTo(jx, ub - 0.085);
        for (let i = -2.5; i <= 2.5; i++) {
            g.moveTo(i * 0.092, ub - 0.085);
            g.lineTo(i * 0.092, ub);
        }
        g.stroke();
        const ey = -1.47;
        for (const sx of [-1, 1]) {
            g.beginPath();
            g.roundRect(sx * 0.175 - 0.07, ey - 0.105, 0.14, 0.21, 0.035);
            g.fillStyle = SK.socket;
            g.fill();
            g.fillStyle = SK.glint;
            g.fillRect(sx * 0.175 - 0.045 + look * 0.03, ey - 0.02 - jaw * 0.03, 0.036, 0.04);
        }
        C.poly(g, [[0, ey + 0.1], [0.05, ey + 0.2], [-0.05, ey + 0.2]], { fill: SK.socket, lw: 0 });
        line(g, [[0.4, ey - 0.02], [0.33, ey + 0.03], [0.37, ey + 0.08], [0.31, ey + 0.12]], L * 0.6);
        const z = Dd(0.23), y = top + z[1], pts = [[-0.3 + z[0], y]];
        for (let i = 0; i < 5; i++) pts.push([-0.25 + i * 0.125 + z[0], y - 0.3 - (i % 2) * 0.06], [-0.18 + i * 0.125 + z[0], y - 0.08]);
        pts.push([0.36 + z[0], y]);
        C.prism(g, cw(pts), Dd(0.05), { front: hawk, top: hawk, side: '#b01f6e' }, { lw: L });
    }
    const SKEL_GRIP = [-0.7, -1.47]; // where his holding mitt is, from the ground between his feet
    // pose: { jaw, look, headTilt, pump (-1..1 the free fist) }: he hangs by the arm on screen left
    function hangSkel(g, L, pose = {}) {
        const T = { x: -0.36, y: -0.98, w: 0.72, h: 0.62, d: 0.4 };
        Cast.legs(g, SK, L);
        C.box(g, T.x, T.y, T.w, T.h, D, { front: TEE[0], top: TEE[1], side: TEE[2] }, { lw: L, depth: T.d });
        C.poly(g, [[T.x, T.y + T.h - 0.09], [T.x + T.w, T.y + T.h - 0.09], [T.x + T.w, T.y + T.h], [T.x, T.y + T.h]], { fill: SK.shoe, ink: K.ink, lw: L * 0.8 });
        for (let i = 0; i < 6; i++) C.poly(g, [[T.x + 0.07 + i * 0.116, T.y + T.h - 0.07], [T.x + 0.1 + i * 0.116, T.y + T.h - 0.02], [T.x + 0.04 + i * 0.116, T.y + T.h - 0.02]], { fill: '#d5dbea', lw: 0 });
        C.poly(g, [[-0.17, T.y + 0.16], [0.17, T.y + 0.16], [0.13, T.y + 0.3], [0, T.y + 0.44], [-0.13, T.y + 0.3]], { fill: K.yellow, ink: K.ink, lw: L * 0.8 });
        C.poly(g, [[0.03, T.y + 0.19], [-0.06, T.y + 0.3], [0, T.y + 0.3], [-0.03, T.y + 0.4], [0.07, T.y + 0.27], [0.01, T.y + 0.27]], { fill: K.red, ink: K.ink, lw: L * 0.6 });
        C.poly(g, [[-0.14, T.y], [0.14, T.y], [0.09, T.y + 0.07], [-0.09, T.y + 0.07]], { fill: SK.bone, ink: K.ink, lw: L * 0.8 });
        g.save();
        g.translate(0, -1.08);
        g.rotate(pose.headTilt ?? 0);
        g.translate(0, 1.08);
        skull(g, L, clamp(pose.jaw ?? 0.4), K.pink, pose.look ?? 0);
        g.restore();
        Cast.arm(g, SK, L, [T.x + 0.03, T.y + 0.13], [SKEL_GRIP[0] + 0.03, SKEL_GRIP[1] + 0.06]);
        Cast.arm(g, SK, L, [T.x + T.w - 0.03, T.y + 0.13], [0.62, -1.48 - 0.1 * (pose.pump ?? 0)]);
    }

    // The chain, top to bottom. grip: where the link holds on, next: where the one below holds it
    // (both in the link's own units, from the ground between its feet).
    const LINKS = [
        { kind: 'imp', grip: [0, IMP_GRIP], next: [0, -0.05], pose: { wear: 'specs', mood: 'grin', hx: 0.4, look: 0.6, lookY: -1 } },
        { kind: 'imp', grip: [0, IMP_GRIP], next: [0, -0.05], pose: { wear: 'bow', mood: 'awe', hx: 0.46, lookY: 1.6 } },
        { kind: 'imp', grip: [0, IMP_GRIP], next: [IMP_LEG, -0.06], pose: { mood: 'grin', hx: 0.46, look: 1, lookY: 0.8 } },
        { kind: 'skel', grip: SKEL_GRIP, next: [0, 0], pose: {} },
    ];
    const PIPE = [-4.56, -0.7]; // the middle of the top imp's mitts on the near megaphone pipe, in the car's units
    // a point of the car's body on screen (the body rears about the rear axle and sinks on its springs)
    const onBody = (p, x, y, s, o = {}) => {
        const rx = -3.55, rR = 0.56, q = rot([p[0] - rx, p[1] + rR + (o.bounce ?? 0) * 0.1], -(o.lean ?? 0));
        return [x + (rx + q[0]) * s, y + (-rR + q[1]) * s];
    };
    const SWING = [0.05, 0.12, 0.2, 0.24], HANG = [-0.1, -0.02, 0.05, -0.2], LAG = 0.7;
    function hangerPoints(t, x, y, s, o = {}) {
        const P = S.pulseAt(t), ph = P.k + P.since, sw = o.swing ?? 1, out = [];
        let grip = onBody(PIPE, x, y, s, o);
        for (let i = 0; i < LINKS.length; i++) {
            const lk = LINKS[i], u = lk.kind === 'imp' ? s * IMP : s;
            const ang = HANG[i] + (o.trail ?? 0) * (0.35 + 0.65 * (i / 3)) + SWING[i] * (i ? sw : Math.min(sw, 1)) * Math.cos(ph * PI - i * LAG);
            const q = rot([(lk.next[0] - lk.grip[0]) * u, (lk.next[1] - lk.grip[1]) * u], -ang);
            out.push({ grip, ang });
            grip = [grip[0] + q[0], grip[1] + q[1]];
        }
        return out;
    }
    /** One link alone: i 0..3, hanging from (gx, gy) at `ang` (radians, + swings its feet to the right). */
    function hanger(g, i, gx, gy, s, ang = 0, pose = {}) {
        const lk = LINKS[i], imp = lk.kind === 'imp', u = imp ? s * IMP : s;
        g.save();
        g.lineJoin = 'round';
        g.translate(gx, gy);
        g.rotate(-ang);
        g.scale(u, u);
        g.translate(-lk.grip[0], -lk.grip[1]);
        if (imp) hangImp(g, 3 / u, { ...lk.pose, ...pose });
        else hangSkel(g, 3.2 / u, { ...lk.pose, ...pose });
        g.restore();
    }
    function hangers(g, t, x, y, s, o = {}) {
        const n = Math.round(clamp(o.n ?? 4, 0, 4));
        if (n <= 0) return;
        const P = S.pulseAt(t), ph = P.k + P.since, pts = hangerPoints(t, x, y, s, o);
        for (let i = 0; i < n; i++) {
            const { grip, ang } = pts[i], sway = Math.cos(ph * PI - i * LAG);
            hanger(g, i, grip[0], grip[1], s, ang, i === 3 ? { jaw: o.jaw ?? 0.25 + 0.6 * P.pulse, headTilt: 0.06 * sway, look: sway, pump: Math.cos(ph * PI) } : { tail: 0.06 * sway });
        }
    }


    // =========================================================================================
    // Rockets: the megaphone pipes as rocket engines
    // =========================================================================================
    const MOUTHS = [[-4.66, -0.84], [-4.795, -0.75]]; // the far pipe's mouth and the near one's, in the car's units
    // one flame in the car's units, from a mouth at the origin: it leaves backwards and the air bends it down
    function rocketFlame(g, L, k, ph, len) {
        const kk = [1, 0.84, 1.12][ph % 3] * k, wob = [0.05, -0.07, 0.02][ph % 3];
        const p0 = [0.03, 0], p1 = [-0.4, -0.08], p2 = [-0.36 + wob, len * kk];
        const at = (u) => [(1 - u) * (1 - u) * p0[0] + 2 * u * (1 - u) * p1[0] + u * u * p2[0], (1 - u) * (1 - u) * p0[1] + 2 * u * (1 - u) * p1[1] + u * u * p2[1]];
        const tongue = (uMax, w0, wave) => {
            const A = [], B = [], n = 16;
            for (let i = 0; i <= n; i++) {
                const v = i / n, u = v * uMax, a = at(u), c = at(Math.min(1, u + 0.02)), dx = c[0] - a[0], dy = c[1] - a[1], l = Math.hypot(dx, dy) || 1;
                const w = w0 * k * (v < 0.22 ? lerp(0.5, 1, v / 0.22) : Math.pow(1 - (v - 0.22) / 0.78, 0.8)) * (1 + (v > 0.2 && v < 0.95 ? wave * Math.sin(v * 15 + ph * 2.1) : 0));
                A.push([a[0] - (dy / l) * w, a[1] + (dx / l) * w]);
                B.push([a[0] + (dy / l) * w, a[1] - (dx / l) * w]);
            }
            return [...A, ...B.reverse()];
        };
        C.poly(g, tongue(1, 0.3, 0.2), { fill: K.red, ink: K.ink, lw: L });
        C.poly(g, tongue(0.8, 0.2, 0.15), { fill: K.orange, lw: 0 });
        C.poly(g, tongue(0.58, 0.12, 0.1), { fill: K.yellow, lw: 0 });
        C.poly(g, tongue(0.3, 0.06, 0), { fill: '#fffbe8', lw: 0 });
        return p2;
    }
    /**
     * Flames out of the two exhaust pipes, trailing down behind the climbing car. Draw after the
     * ride and before the hangers, with the ride's x, y, s.
     *   o: { k (0..1 their size; 0 draws nothing), lean, bounce (the ride's), len (car units, 2.5) }
     */
    function rockets(g, t, x, y, s, o = {}) {
        const k = clamp(o.k ?? 1);
        if (k <= 0.02) return;
        const d = C.drawing(t), L = 3 / s, len = o.len ?? 2.5;
        MOUTHS.forEach((mth, i) => {
            const at = onBody(mth, x, y, s, o);
            g.save();
            g.lineJoin = 'round';
            g.translate(at[0], at[1]);
            g.rotate(-(o.lean ?? 0));
            g.scale(s, s);
            const ph = (((d + i * 2) % 3) + 3) % 3, tip = rocketFlame(g, L, k * (i ? 1 : 0.86), ph, len);
            // drops of fire that come off the tip
            for (let j = 0; j < 3; j++) {
                const u = (((d * 0.23 + j / 3 + i * 0.17) % 1) + 1) % 1, r = 0.075 * k * (1 - u * 0.8), px = tip[0] + 0.08 * Math.sin(j * 2.1 + i), py = tip[1] + 0.12 + 0.95 * u * k;
                C.poly(g, [[px - r, py], [px, py - r * 2.4], [px + r, py], [px, py + r * 0.8]], { fill: j % 2 ? K.orange : K.yellow, ink: K.ink, lw: L * 0.8 });
            }
            g.restore();
        });
    }

    // =========================================================================================
    // The column of lava (Inferno.volcano's own, for the shots that have no volcano under them)
    // =========================================================================================
    function jet(yt, w, t2, k, f, ph = 0) {
        const A = [], B = [], yb = 0, yh = yt + 44, n = Math.max(3, Math.ceil((yb - yh) / 40)), hw = (w / 2 + 64 * (w / 300)) * k, hh = 58 * (0.5 + 0.5 * (w / 300)) * k;
        for (let i = 0; i <= n; i++) {
            const y = lerp(yb, Math.min(yb - 2, yh), i / n), wob = 15 * k * Math.sin(y * 0.03 + t2 * 13 + ph), flare = 34 * k * Math.pow(1 - i / n, 4);
            A.push([-(w / 2) * k - flare - wob, y]);
            B.push([(w / 2) * k + flare - wob * 0.6, y]);
        }
        const head = [], yc = Math.min(yb - 2, yh);
        for (let i = 0; i <= 44; i++) {
            const u = i / 44, a = PI + u * PI, rad = 1 + 0.085 * Math.cos(u * PI * 14 + (f ? PI : 0)) * Math.min(1, Math.sin(u * PI) * 4);
            head.push([Math.cos(a) * hw * rad, yc + Math.sin(a) * hh * rad]);
        }
        return [...A, ...head, ...B.reverse()];
    }
    /**
     * A column of lava from (cx, yb) up to a car whose ground point is at yTop.
     *   o: { w (the red stream's width, 300), k (0..1 how far it has opened), part ('back' | 'front': the lips
     *        round the wheels and the drops, drawn over the car), bombs (true: blobs thrown out on arcs) }
     */
    function column(g, t, cx, yb, yTop, o = {}) {
        const sc = (o.w ?? 300) / 300, k = clamp(o.k ?? 1), d = C.drawing(t), t2 = C.onTwos(t), f = ((d % 2) + 2) % 2, L = 1 / sc, top = (yTop - yb + 2) / sc - 12; // the cap's top just under the wheels, whatever the width
        if (top > -50 || k <= 0.02) return;
        g.save();
        g.translate(cx, yb);
        g.scale(sc, sc);
        g.lineJoin = 'round';
        if (o.part !== 'front') {
            const yt = top + 26;
            [[300, K.red, true, 0], [200, K.orange, false, 1.3], [96, K.yellow, false, 2.6]].forEach(([w, col, ink, ph]) => C.poly(g, jet(yt, w, t2, k, f, ph), { fill: col, ink: ink ? K.ink : null, lw: ink ? 3.6 * L : 0 }));
            for (let i = 0; i < 9; i++) {
                const u = ((((i * 97 + d * 40) % 520) + 520) % 520) / 520, y = lerp(-20, yt + 70, u), dx = [-112, -34, 20, 96, -80, 0, 60, -20, 118][i], h = 38 + (i % 3) * 16, w = 7 + (i % 2) * 3;
                if (y < yt + 60 || y > -30) continue;
                C.poly(g, [[dx * k - w, y], [dx * k + (i % 2 ? 3 : -3), y - h], [dx * k + w, y]], { fill: Math.abs(dx) < 40 ? '#fff59a' : Math.abs(dx) < 90 ? K.yellow : K.orange, lw: 0 });
            }
            if (o.bombs) {
                for (let i = 0; i < 8; i++) {
                    const u = ((t2 * 0.9 + i * 0.37) % 1 + 1) % 1, sx = i % 2 ? 1 : -1, vx = sx * (140 + ((i * 53) % 190)), vy = 520 + ((i * 71) % 260);
                    const bx = sx * 120 + vx * u, by = top + 200 - vy * u + 640 * u * u, r = (9 + (i % 3) * 3) * k;
                    const tx = -vx, ty = vy - 1280 * u, tl = Math.hypot(tx, ty) || 1;
                    C.poly(g, [[bx + (ty / tl) * r * 0.8, by - (tx / tl) * r * 0.8], [bx + (tx / tl) * r * 3.2, by + (ty / tl) * r * 3.2], [bx - (ty / tl) * r * 0.8, by + (tx / tl) * r * 0.8]], { fill: K.orange, ink: K.ink, lw: 2.6 * L });
                    circ(g, bx, by, r, K.yellow, 2.6 * L);
                }
            }
        } else {
            for (const [w, h, col, ink] of [[300, 30, K.red, true], [200, 22, K.orange, false], [96, 14, K.yellow, false]]) {
                const hw = (w / 2 + 64 * (w / 300)) * k * 0.9, pts = [], yc = Math.min(-14, top + 70), y0 = yc - 30 * k;
                for (let i = 0; i <= 36; i++) {
                    const u = i / 36;
                    pts.push([-hw + 2 * hw * u, y0 - h * k * (0.55 + 0.45 * Math.cos(u * PI * 10 + (f ? PI : 0))) * Math.sin(u * PI) ** 0.4]);
                }
                C.poly(g, [...pts, [hw, yc + 2], [-hw, yc + 2]], { fill: col, lw: 0 });
                if (ink) line(g, pts, 3.6 * L);
            }
            for (let i = 0; i < 6; i++) {
                const sx = i % 2 ? 1 : -1, u = ((((d + i * 2) % 6) + 6) % 6) / 6, px = sx * (150 + i * 22 + 60 * u), py = top + 6 - 80 * u + 90 * u * u;
                circ(g, px, py, (7 - i * 0.6) * k, i % 3 ? K.yellow : K.orange, 2.6 * L);
            }
        }
        g.restore();
    }
    // puffs that merge: the outlines of the whole group first, the fills on top, a lit side
    function puffs(g, list, fill, lit, lw = 3.2) {
        const ring = (dx, dy, k) => {
            g.beginPath();
            for (const [x, y, r] of list) {
                if (!(r > 0.5)) continue;
                g.moveTo(x + dx * r + r * k, y + dy * r);
                g.arc(x + dx * r, y + dy * r, r * k, 0, TAU);
            }
        };
        g.strokeStyle = K.ink;
        g.lineWidth = lw * 2;
        ring(0, 0, 1);
        g.stroke();
        g.fillStyle = fill;
        ring(0, 0, 1);
        g.fill();
        g.fillStyle = lit;
        ring(-0.1, -0.12, 0.82);
        g.fill();
    }

    // =========================================================================================
    // «Rumble»: the crowd on the far shore, small
    // =========================================================================================
    const HR = typeof Inferno !== 'undefined' ? Inferno.R : { wall: '#8a1a2c', wallD: '#6a1221', wallL: '#a82338', top: '#c43349', deep: '#4a0c17', far: '#5a0f1f', farD: '#4a0c1a', farL: '#6a1324' };
    const SHORE = [[64, 196], [298, 476], [524, 698], [804, 944]]; // between the lava falls and the fires (the volcano's wide view)
    const TEES = ['#4a44e6', '#17b8a6', '#7d47e1', '#2f2940'], HAWKS = [K.pink, K.green, K.sky, K.yellow];
    /**
     * Imps and skeletons along the far shore of the volcano's wide view, about 14 units tall.
     *   o: { up (0..1: mitts in the air, everybody hopping), jump (extra hop, 0..1) }
     */
    function shoreCrowd(g, t, o = {}) {
        const r = Motion.rng('solo2-shore'), P = S.pulseAt(t), DP = Devil.P, up = clamp(o.up ?? 0), lw = 1.5;
        g.save();
        g.lineJoin = 'round';
        for (const [x0, x1] of SHORE) {
            for (let row = 0; row < 2; row++) {
                for (let x = x0 + (row ? 7.5 : 0); x <= x1; x += 15) {
                    const jx = (r() - 0.5) * 4, jy = (r() - 0.5) * 2.4, a = r(), b = r(), c = r(), skel = a < 0.3;
                    const fr = (P.since + (c < 0.5 ? 0 : 0.5)) % 1, keen = up > b * 0.6, amp = keen ? 5.5 + 5 * (o.jump ?? 0) : b < 0.3 ? 2.2 : 0;
                    const px = x + jx, py = 424 + row * 9 + jy - amp * Math.sin(PI * Math.min(1, fr * 1.25));
                    const arm = (sx, w, col, top) => {
                        if (keen) C.poly(g, [[px + sx * (w / 2 - 0.5), py - top + 4], [px + sx * (w / 2 + 3.4), py - top - 5.5], [px + sx * (w / 2 + 6), py - top - 4.4], [px + sx * (w / 2 + 2.2), py - top + 5]], { fill: col, ink: K.ink, lw });
                        else C.poly(g, [[px + sx * (w / 2 - 0.5), py - top + 5], [px + sx * (w / 2 + 2.4), py - top + 5], [px + sx * (w / 2 + 2.4), py - top + 10], [px + sx * (w / 2 - 0.5), py - top + 10]], { fill: col, ink: K.ink, lw });
                    };
                    if (skel) {
                        const tee = TEES[Math.floor(b * 4)], hawk = HAWKS[Math.floor(c * 4)];
                        C.poly(g, [[px - 3.6, py - 4], [px - 0.6, py - 4], [px - 0.6, py], [px - 3.6, py]], { fill: '#3a2f5e', ink: K.ink, lw });
                        C.poly(g, [[px + 0.6, py - 4], [px + 3.6, py - 4], [px + 3.6, py], [px + 0.6, py]], { fill: '#3a2f5e', ink: K.ink, lw });
                        C.box(g, px - 4.2, py - 11, 8.4, 7, D, { front: tee, top: tee, side: K.ink }, { lw, depth: 4 });
                        arm(-1, 8.4, '#f4edd8', 11);
                        arm(1, 8.4, '#f4edd8', 11);
                        C.box(g, px - 5, py - 20, 10, 9, D, { front: '#f4edd8', top: '#fffdf4', side: '#cdbf9c' }, { lw, depth: 5 });
                        g.fillStyle = '#2a2438';
                        g.fillRect(px - 3.2, py - 17, 2, 3);
                        g.fillRect(px + 1.2, py - 17, 2, 3);
                        g.fillRect(px - 2.6, py - 12.4, 5.2, 0.9);
                        C.poly(g, [[px - 3, py - 20.6], [px - 2, py - 25], [px - 0.6, py - 21.6], [px + 0.6, py - 25.6], [px + 1.8, py - 21.6], [px + 3.2, py - 24.6], [px + 4, py - 20.6]], { fill: hawk, ink: K.ink, lw });
                    } else {
                        g.fillStyle = DP.hoof;
                        g.fillRect(px - 4, py - 2.4, 3, 2.4);
                        g.fillRect(px + 1, py - 2.4, 3, 2.4);
                        arm(-1, 11, DP.skin, 9);
                        arm(1, 11, DP.skin, 9);
                        C.box(g, px - 5.5, py - 11.4, 11, 9, D, { front: DP.skin, top: DP.skinTop, side: DP.skinSide }, { lw, depth: 5.5 });
                        for (const sx of [-1, 1]) C.poly(g, [[px + sx * 3.4 - 1.3 + 1, py - 12.4], [px + sx * 3.9 + 1, py - 15.8], [px + sx * 3.4 + 1.3 + 1, py - 12.4]], { fill: DP.horn, ink: K.ink, lw: 1.1 });
                        g.fillStyle = DP.eye;
                        g.fillRect(px - 3.6, py - 9, 2.4, 3);
                        g.fillRect(px + 1.2, py - 9, 2.4, 3);
                        g.fillStyle = DP.pupil;
                        g.fillRect(px - 2.8, py - 8.6 - (keen ? 0.6 : 0), 0.9, 2.2);
                        g.fillRect(px + 2, py - 8.6 - (keen ? 0.6 : 0), 0.9, 2.2);
                    }
                }
            }
        }
        g.restore();
    }

    // =========================================================================================
    // «Through the roof»: the cavern's roof over the volcano, the lighting rig under it
    // =========================================================================================
    const ROOF_X = [104, 236, 370, 500, 630, 764, 896]; // the cuts between the six slabs that give way
    const roofEdge = (x) => 204 + 13 * Math.sin(x / 67 + 0.8) + 7 * Math.sin(x / 29 + 2);
    const roofCut = (j) => {
        const r = Motion.rng('solo2-roofcut:' + j), x = ROOF_X[j], pts = [], y1 = roofEdge(x);
        for (let i = 0; i <= 5; i++) pts.push([x + (i === 0 || i === 5 ? 0 : (r() - 0.5) * 36), lerp(-40, y1, i / 5)]);
        return pts;
    };
    const edgeRun = (x0, x1) => {
        const pts = [];
        for (let x = x0; x < x1 - 1; x += 14) pts.push([x, roofEdge(x)]);
        pts.push([x1, roofEdge(x1)]);
        return pts;
    };
    // one piece of the roof: rock in facets, a dark lip, stalactites that hang from it
    function roofPiece(g, pts, seed, x0, x1, lit = 0, whole = false) {
        const cols = { front: HR.wall, top: HR.wallL, side: HR.wallD }, r = Motion.rng(seed);
        // stalactites first: they hang behind the lip
        for (let x = x0 + 22 + r() * 20; x < x1 - 16; x += 44 + r() * 30) {
            const w = 9 + r() * 9, len = 38 + r() * 74, y = roofEdge(x) - 6, dx = (r() - 0.5) * 8;
            C.prism(g, cw([[x - w, y], [x + w, y], [x + dx, y + len]]), [7, -5], { front: HR.wall, top: HR.wallL, side: HR.wallD }, { lw: 3 });
            line(g, [[x - w * 0.35, y + 6], [x + dx - 1, y + len * 0.72]], 2.2, HR.wallL);
        }
        if (whole) C.poly(g, pts, { fill: cols.front, lw: 0 }); // before it breaks the roof is one rock: no seams
        else C.prism(g, cw(pts), [22, -15], cols, { lw: 3.4 });
        g.save();
        C.trace(g, pts);
        g.clip();
        for (let i = 0; i < 7; i++) {
            const x = lerp(x0 - 10, x1, r()), y = 10 + r() * 170, w = 40 + r() * 60, h = 22 + r() * 30;
            C.poly(g, [[x, y], [x + w * 0.6, y - h * 0.4], [x + w, y + h * 0.2], [x + w * 0.5, y + h * 0.7]], { fill: r() < 0.4 ? HR.wallL : HR.wallD, lw: 0 });
        }
        // the lip along the underside
        const run = edgeRun(x0, x1);
        C.poly(g, run.map(([x, y]) => [x, y - 9]), { ink: HR.deep, lw: 18, close: false });
        C.poly(g, run.map(([x, y]) => [x, y - 21]), { ink: lit > 0 ? '#dcd6f7' : HR.top, lw: 3, close: false });
        g.restore();
        if (!whole) C.poly(g, pts, { ink: K.ink, lw: 3.4 });
    }
    const slabPts = (j) => [...roofCut(j), ...edgeRun(ROOF_X[j], ROOF_X[j + 1]).slice(1, -1), ...roofCut(j + 1).reverse()];
    // where slab j has got to, `tb` seconds after the roof broke: [dx, dy, rotation, pivot]
    function slabAt(j, tb) {
        const side = j < 3 ? -1 : 1, rank = j < 3 ? 2 - j : j - 3, u = clamp(tb / 0.4), e = 1 - Math.pow(1 - u, 3);
        const px = side < 0 ? ROOF_X[j] : ROOF_X[j + 1], pivot = [px, roofEdge(px)];
        if (tb <= 0) return [0, 0, 0, pivot];
        if (rank === 0) return [side * (40 + 430 * tb), -640 * tb + 950 * tb * tb, side * 2.6 * tb, pivot];
        if (rank === 1) return [side * 118 * e, -64 * e, side * 0.5 * e, pivot];
        return [side * 30 * e, -22 * e, side * 0.17 * e, pivot];
    }
    /**
     * The whole frame of «Through the roof», behind the car.
     *   o: { crack (0..1: the cuts open one after another and let the moonlight through), tb (seconds since the roof
     *        broke, on twos; negative before), blast (0..1: how hard the lamps swing) }
     */
    function roofSet(g, t, o = {}) {
        const d = C.drawing(t), t2 = C.onTwos(t), crack = clamp(o.crack ?? 0), tb = o.tb ?? -1, open = tb > 0, blast = clamp(o.blast ?? 0);
        g.save();
        g.lineJoin = 'round';
        g.lineCap = 'round';
        // the far wall, high up
        g.fillStyle = HR.far;
        g.fillRect(0, 0, 1000, 1000);
        const rw = Motion.rng('solo2-roofwall');
        for (let i = 0; i < 46; i++) {
            const x = rw() * 1060 - 30, y = 180 + rw() * 840, w = 60 + rw() * 110, h = 36 + rw() * 60;
            C.poly(g, [[x, y], [x + w * 0.6, y - h * 0.4], [x + w, y + h * 0.2], [x + w * 0.5, y + h * 0.7]], { fill: rw() < 0.35 ? HR.farL : HR.farD, lw: 0 });
        }
        // far stalactites, a row of them under the roof
        for (let i = 0; i < 15; i++) {
            const x = 20 + i * 68 + rw() * 30, len = 50 + rw() * 90, w = 13 + rw() * 10;
            C.poly(g, [[x - w, 196], [x + w, 196], [x + 3, 236 + len]], { fill: HR.farD, ink: K.ink, lw: 2.6 });
        }
        // the night through the hole: sky, stars, the moon
        const hole = cw([...roofCut(0), ...edgeRun(ROOF_X[0], ROOF_X[6]).slice(1, -1), ...roofCut(6).reverse()]);
        g.save();
        C.trace(g, hole);
        g.clip();
        C.sunburst(g, 500, 330, { n: 12, rot: 0.2, a: '#1b1750', b: '#231e62' });
        const rs = Motion.rng('solo2-roofstars');
        for (let i = 0; i < 16; i++) {
            const x = 130 + rs() * 740, y = 12 + rs() * 170, s = 5 + rs() * 8;
            C.sparkle(g, x, y, s * ((d + i * 5) % 12 < 2 ? 1.5 : 1), { color: i % 4 ? '#fffbe8' : K.yellow });
        }
        circ(g, 655, 96, 54, '#fffbe8', 3.2);
        for (const [mx, my, mr] of [[-20, -14, 13], [16, 12, 9], [22, -24, 6], [-10, 24, 7]]) circ(g, 655 + mx, 96 + my, mr, '#dcd6f7');
        g.restore();
        // the lighting rig: a truss on two chains, five lamps under it
        for (const cx of [84, 916]) {
            for (let y = 150; y < 404; y += 17) {
                g.beginPath();
                g.ellipse(cx, y + 8, 4.6, 8.6, 0, 0, TAU);
                g.strokeStyle = K.ink;
                g.lineWidth = 5.4;
                g.stroke();
                g.strokeStyle = (y / 17) % 2 < 1 ? '#8d95ad' : '#d5dbea';
                g.lineWidth = 2.2;
                g.stroke();
            }
        }
        const zig = [];
        for (let x = 60, i = 0; x <= 940; x += 40, i++) zig.push([x, i % 2 ? 409 : 439]);
        line(g, zig, 7.4);
        line(g, zig, 3, '#6c66a0');
        for (const y of [398, 436]) C.box(g, 52, y, 896, 12, D, { front: '#565082', top: '#8d95ad', side: '#3d3652' }, { lw: 3, depth: 16 });
        [176, 338, 500, 662, 824].forEach((lx, i) => {
            const a = 0.1 * Math.sin(t2 * 5 + i * 1.3) + blast * 0.5 * Math.sin(t2 * 13 + i * 2.2) + (i - 2) * -0.08;
            g.save();
            g.translate(lx, 452);
            g.rotate(a);
            // the beam, the yoke, the can and its lens
            C.poly(g, [[-15, 62], [15, 62], [118, 760], [-118, 760]], { fill: i % 2 ? 'rgba(255,79,165,0.17)' : 'rgba(255,230,46,0.17)', lw: 0 });
            line(g, [[-22, 30], [-22, 0], [22, 0], [22, 30]], 7.6);
            line(g, [[-22, 30], [-22, 0], [22, 0], [22, 30]], 3.2, '#8d95ad');
            C.box(g, -17, 8, 34, 48, D, { front: HR.top, top: '#e0556a', side: HR.wallD }, { lw: 3, depth: 22 });
            C.poly(g, [[-17, 44], [17, 44], [17, 56], [-17, 56]], { fill: HR.wallD, ink: K.ink, lw: 2.4 });
            C.poly(g, [[-20, 56], [20, 56], [15, 64], [-15, 64]], { fill: i % 2 ? '#ff9ccf' : '#fff59a', ink: K.ink, lw: 2.6 });
            g.restore();
        });
        // the shaft of moonlight, once it is open
        if (open) {
            const k = clamp(tb / 0.25), xl = lerp(500, 168, k), xr = lerp(500, 832, k);
            C.poly(g, [[xl, 190], [xr, 190], [xr + 120, 1010], [xl - 120, 1010]], { fill: 'rgba(220,214,247,0.2)', lw: 0 });
            C.poly(g, [[lerp(xl, 500, 0.4), 190], [lerp(xr, 500, 0.4), 190], [lerp(xr, 500, 0.4) + 60, 1010], [lerp(xl, 500, 0.4) - 60, 1010]], { fill: 'rgba(255,251,232,0.15)', lw: 0 });
        }
        // the roof: what holds at the two sides, then the six slabs
        roofPiece(g, [[-30, -40], ...roofCut(0), ...edgeRun(-30, ROOF_X[0]).reverse().slice(1)], 'solo2-roofL', -30, ROOF_X[0], 0, !open);
        roofPiece(g, [...roofCut(6).reverse(), [1030, -40], ...edgeRun(ROOF_X[6], 1030).reverse().slice(0, -1)], 'solo2-roofR', ROOF_X[6], 1030, 0, !open);
        for (const j of [0, 5, 1, 4, 2, 3]) {
            const [dx, dy, a, pv] = slabAt(j, tb);
            g.save();
            g.translate(pv[0] + dx, pv[1] + dy);
            g.rotate(a);
            g.translate(-pv[0], -pv[1]);
            roofPiece(g, slabPts(j), 'solo2-slab' + j, ROOF_X[j], ROOF_X[j + 1], open ? 1 : 0, !open);
            g.restore();
        }
        if (!open) line(g, edgeRun(-30, 1030), 3.4);
        // before it goes: the cuts open from the middle outwards, the moon in each
        if (!open && crack > 0) {
            [3, 2, 4, 1, 5].forEach((j, n) => {
                const k = clamp((crack - n * 0.16) / 0.3);
                if (k <= 0) return;
                const cut = roofCut(j).slice().reverse(), m = Math.max(2, Math.ceil(cut.length * k)), pts = cut.slice(0, m);
                line(g, pts, 4 + 5 * k);
                line(g, pts, 1.4 + 3.2 * k, (d + j) % 4 < 2 ? '#fffbe8' : '#dcd6f7');
                const [bx, by] = cut[0];
                C.poly(g, [[bx - 3 - 5 * k, by], [bx + 3 + 5 * k, by], [bx + 26 * k, by + 300 * k], [bx - 26 * k, by + 300 * k]], { fill: 'rgba(220,214,247,0.22)', lw: 0 });
            });
        }
        g.restore();
    }
    // rubble out of the broken roof, in front of the car: tb seconds since it broke
    function roofRubble(g, tb) {
        if (tb <= 0) return;
        const r = Motion.rng('solo2-rubble');
        for (let i = 0; i < 16; i++) {
            const side = i % 2 ? 1 : -1, x0 = 500 + side * (190 + r() * 250), vx = side * (40 + 260 * r()), vy = -260 - r() * 380, sz = 7 + r() * 13, sp = (r() - 0.5) * 14, late = r() * 0.18, tt = tb - late;
            if (tt <= 0) continue;
            const x = x0 + vx * tt, y = 200 + vy * tt + 1500 * tt * tt, a = sp * tt;
            if (y > 1040) continue;
            C.poly(g, [[-sz, -sz * 0.4], [-sz * 0.2, -sz], [sz, -sz * 0.5], [sz * 0.7, sz * 0.6], [-sz * 0.5, sz * 0.7]].map((p) => {
                const q = rot(p, a);
                return [x + q[0], y + q[1]];
            }), { fill: i % 3 ? HR.wall : HR.wallL, ink: K.ink, lw: 2.8 });
        }
    }

    // =========================================================================================
    // «Out»: the desert floor over the crater (Skyward's night colours), bulging, then bursting
    // =========================================================================================
    const DES = { sand: '#4a3fc0', sandD: '#3b2fa0', sandL: '#6a60d4', road: '#15123a', roadTop: '#444161', roadDark: '#100e2c', roadLine: '#ffe62e', roadEdge: '#a888f5', hot: '#ffe62e', warm: '#ff8a2b', dust: '#9c94d2', dustL: '#b9b3e2' };
    const hump = (x, y, H) => {
        const r2 = (x / 318) ** 2 + (y / 96) ** 2;
        return r2 >= 1 ? 0 : H * (1 - r2) ** 2;
    };
    const zigzag = (seed, a, b, n, amp) => {
        const r = Motion.rng(seed), pts = [];
        for (let i = 0; i <= n; i++) {
            const u = i / n, j = i === 0 || i === n ? 0 : (r() - 0.5) * 2 * amp, nx = -(b[1] - a[1]), ny = b[0] - a[0], l = Math.hypot(nx, ny) || 1;
            pts.push([lerp(a[0], b[0], u) + (nx / l) * j, lerp(a[1], b[1], u) + (ny / l) * j]);
        }
        return pts;
    };
    /**
     * The ground over the crater before it bursts, in the crater's own units (translate to
     * Skyward.site(Y).crater and scale by its m first): the road and the sand lifted into a mound that
     * splits. It hides the open crater Skyward.ascent has painted; its light and embers show above it.
     *   k: 0..1 how far it has bulged;  d: the drawing (the cracks flicker);  lw: the outline in these units
     */
    function mound(g, k, d, lw = 3.2) {
        const H = 112 * k, lift = (x, y) => [x, y - hump(x, y, H)];
        const crown = (x) => 46 * k * Math.sqrt(Math.max(0, 1 - (x / 306) ** 2)); // the sand that shows behind the road's far edge
        g.save();
        g.lineJoin = 'round';
        g.lineCap = 'round';
        // the flat ground and the road, as they were
        g.fillStyle = DES.sand;
        g.beginPath();
        g.ellipse(0, 18, 505, 128, 0, 0, TAU);
        g.fill();
        // the mound's sand: its far outline is the highest point of each column
        const far = [], near = [];
        for (let x = -318; x <= 318; x += 12) {
            let best = 1e9;
            const yb = 96 * Math.sqrt(Math.max(0, 1 - (x / 318) ** 2));
            for (let y = -yb; y <= yb; y += 6) best = Math.min(best, y - hump(x, y, H));
            far.push([x, Math.min(best, -yb, -46 - hump(x, -46, H) - crown(x))]);
            near.push([x, yb]);
        }
        const body = [...far, ...near.reverse()];
        C.poly(g, body, { fill: DES.sand, ink: K.ink, lw });
        g.save();
        C.trace(g, body);
        g.clip();
        C.poly(g, far.map(([x, y]) => [x, y + 9]), { ink: DES.sandL, lw: 16 + 14 * k, close: false });
        C.poly(g, near.map(([x, y]) => [x, y - 6]), { ink: DES.sandD, lw: 20, close: false });
        g.restore();
        // the road over it
        const edge = (y) => {
            const pts = [];
            for (let x = -520; x <= 520; x += 13) pts.push(lift(x, y));
            return pts;
        };
        const fa = edge(-46), ne = edge(46);
        C.poly(g, [...fa, ...ne.slice().reverse()], { fill: DES.road, lw: 0 });
        line(g, fa, lw * 1.2);
        line(g, ne, lw * 1.2);
        line(g, edge(-34), lw * 0.95, DES.roadEdge);
        line(g, edge(34), lw * 0.95, DES.roadEdge);
        for (let i = -4; i < 4; i++) {
            const pts = [];
            for (let x = i * 170; x <= i * 170 + 86; x += 10.75) pts.push(lift(x, 0));
            line(g, pts, 8, DES.roadLine);
        }
        if (k > 0.02) {
            // a crack: dark, the fire's light in the middle of it
            const crack = (pts, w) => {
                line(g, pts, w + lw * 1.5);
                line(g, pts, w * 0.55, d % 2 ? DES.warm : DES.hot);
            };
            // the crown splits behind the road: the light comes out of there
            const fis = zigzag('solo2-fissure', [-236, 0], [236, 0], 15, 8).map(([x, y]) => [x, -46 - hump(x, -46, H) - crown(x) * 0.5 + y]);
            line(g, fis, 12 * k + lw * 2);
            line(g, fis, 12 * k, DES.warm);
            line(g, fis, 5.5 * k, d % 2 ? DES.hot : '#fffbe8');
            // the road breaks into slabs, the sand cracks round the foot
            [-206, -118, -34, 62, 146, 228].forEach((x, i) => crack(zigzag('solo2-rc' + i, [x - 14, -47], [x + 16, 47], 6, 8).map(([px, py]) => lift(px, py)), 1.5 + 4.5 * k * (i % 2 ? 0.7 : 1)));
            [[-150, 70, -214, 124], [40, 82, 70, 140], [214, 60, 300, 104], [-300, 30, -392, 62], [318, 6, 420, 30], [-60, -70, -96, -108], [130, -64, 178, -100]].forEach(([x0, y0, x1, y1], i) => {
                const pts = zigzag('solo2-sc' + i, [x0, y0], [x1, y1], 4, 7).map(([px, py]) => lift(px, py));
                line(g, pts.slice(0, Math.max(2, Math.ceil(pts.length * k))), lw * 1.6);
                line(g, pts.slice(0, Math.max(2, Math.ceil(pts.length * k) - 1)), lw * 0.6, DES.warm);
            });
            // stones hop round its foot
            const rp = Motion.rng('solo2-pebbles');
            for (let i = 0; i < 9; i++) {
                const a = rp() * TAU, x = Math.cos(a) * (330 + rp() * 70), y = 14 + Math.sin(a) * (100 + rp() * 22), sz = 5 + rp() * 6, hop = [0, 12, 18, 9][(d + i) % 4] * k;
                C.poly(g, [[x - sz, y - hop], [x - sz * 0.2, y - sz - hop], [x + sz, y - sz * 0.3 - hop], [x + sz * 0.5, y + sz * 0.6 - hop]], { fill: i % 2 ? DES.sandL : DES.sandD, ink: K.ink, lw: lw * 0.8 });
            }
        }
        g.restore();
    }
    // what the burst throws: road slabs and lumps of sand, on arcs (crater units; tb seconds since the burst)
    const THROWN = [
        // x0, y0, vx, vy, w, h, spin, road?, front?
        [-150, -20, -620, -1150, 96, 18, -5.2, 1, 0], [120, -30, 560, -1260, 88, 17, 4.4, 1, 0], [-40, -40, -210, -1480, 74, 16, 6.3, 1, 0], [60, 10, 300, -1050, 104, 19, -3.6, 1, 1],
        [-230, 20, -800, -820, 82, 17, 5.6, 1, 1], [220, 0, 860, -900, 78, 16, -6.4, 1, 0], [-90, 30, -130, -980, 64, 30, 3.1, 0, 1], [170, 30, 470, -1380, 56, 28, -4.2, 0, 0],
        [-200, -10, -480, -1420, 50, 26, 5.0, 0, 0], [20, 40, 110, -1180, 46, 24, -5.6, 0, 1], [260, 30, 640, -700, 52, 24, 4.6, 0, 1], [-280, 40, -700, -620, 48, 22, -3.9, 0, 0],
    ];
    function thrown(g, tb, front, lw = 3.2) {
        if (tb < 0) return;
        for (const [x0, y0, vx, vy, w, h, spin, road, fr] of THROWN) {
            if (!!fr !== !!front) continue;
            const x = x0 + vx * tb, y = y0 + vy * tb + 1300 * tb * tb, a = spin * tb + (x0 % 7) * 0.2;
            if (y > 420 || Math.abs(x) > 900) continue;
            const at = (p) => {
                const q = rot(p, a);
                return [x + q[0], y + q[1]];
            };
            if (road) {
                C.prism(g, cw([at([-w / 2, h / 2]), at([-w / 2, -h / 2]), at([w / 2, -h / 2]), at([w / 2, h / 2])]), [30, -20], { front: DES.roadDark, top: DES.roadTop, side: DES.roadDark }, { lw });
                // the road's line along its top face
                const A = at([-w * 0.3, -h / 2]), B = at([w * 0.3, -h / 2]);
                if (Math.cos(a) > 0.15) line(g, [[A[0] + 15, A[1] - 10], [B[0] + 15, B[1] - 10]], lw * 1.5, DES.roadLine);
            } else {
                C.prism(g, cw([at([-w / 2, h * 0.4]), at([-w * 0.42, -h * 0.3]), at([-w * 0.1, -h / 2]), at([w * 0.4, -h * 0.36]), at([w / 2, h * 0.3]), at([w * 0.1, h / 2])]), [16, -11], { front: DES.sand, top: DES.sandL, side: DES.sandD }, { lw });
            }
        }
    }
    // the dust the burst lifts (crater units): the 'back' half goes up behind the car, the 'front' half rolls towards us
    function dust(g, tb, part, lw = 3.2) {
        if (tb < 0) return;
        const r = Motion.rng('solo2-dust:' + part), grow = 0.6 + 0.4 * (1 - Math.pow(1 - clamp(tb / 0.16), 3)), fade = 1 - clamp((tb - 0.36) / 0.72), e = 1 - Math.pow(1 - clamp(tb / 1.1), 2.2), list = [];
        const n = part === 'front' ? 13 : 11;
        for (let i = 0; i < n; i++) {
            const u = i / (n - 1), a = part === 'front' ? lerp(0.08, PI - 0.08, u) : lerp(PI + 0.25, TAU - 0.25, u), jr = r(), jk = r();
            const reach = 150 + (300 + 180 * jr) * e, x = Math.cos(a) * reach * 1.15, y = part === 'front' ? 46 + Math.sin(a) * (30 + 74 * e) + 30 * jr : -20 + Math.sin(a) * reach * (0.5 + 0.3 * jk) - 60 * e;
            list.push([x, y, (62 + 62 * jk) * grow * Math.max(0, fade - 0.25 * jr)]);
        }
        if (part === 'front') for (let i = 0; i < 9; i++) list.push([lerp(-490, 490, i / 8) * (0.9 + 0.35 * e), 84 + 40 * e + 24 * r(), (74 + 36 * r()) * grow * fade]);
        puffs(g, list, DES.dust, DES.dustL, lw);
    }

    return { hangers, hanger, hangerPoints, onBody, PIPE, LINKS, IMP, rockets, column, puffs, shoreCrowd, roofSet, roofRubble, roofEdge, mound, thrown, dust, DES };
})();
