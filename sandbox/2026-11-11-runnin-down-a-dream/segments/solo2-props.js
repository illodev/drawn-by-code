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
    const IMP_GRIP = -1.2, IMP_LEG = 0.38; // the mitts' height above the hooves; a hanging imp's legs are apart
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
    const PIPE = [-4.54, -0.7]; // the middle of the top imp's mitts on the near megaphone pipe, in the car's units
    // a point of the car's body on screen (the body rears about the rear axle and sinks on its springs)
    const onBody = (p, x, y, s, o = {}) => {
        const rx = -3.55, rR = 0.56, q = rot([p[0] - rx, p[1] + rR + (o.bounce ?? 0) * 0.1], -(o.lean ?? 0));
        return [x + (rx + q[0]) * s, y + (-rR + q[1]) * s];
    };
    const SWING = [0.05, 0.12, 0.2, 0.24], HANG = [-0.05, 0.0, 0.05, -0.2], LAG = 0.7;
    function hangerPoints(t, x, y, s, o = {}) {
        const P = S.pulseAt(t), ph = P.k + P.since, sw = o.swing ?? 1, out = [];
        let grip = onBody(PIPE, x, y, s, o);
        for (let i = 0; i < LINKS.length; i++) {
            const lk = LINKS[i], u = lk.kind === 'imp' ? s * IMP : s;
            const ang = HANG[i] + (o.trail ?? 0) * (0.35 + 0.65 * (i / 3)) + SWING[i] * sw * Math.cos(ph * PI - i * LAG);
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

    return { hangers, hanger, hangerPoints, onBody, PIPE, LINKS, IMP };
})();
