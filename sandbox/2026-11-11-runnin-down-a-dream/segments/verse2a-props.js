// Props of verse 2's first block (segments/verse2a.js): the rainbow bridge the car drives over,
// the cactus at the wheel with arms that act (it is chorus 1's cactus, Chorus1Props.cactus,
// drawn here with its arms as bendable branches), its snore bubble, what the cockpit gains in
// the close shot (spokes and a grip on the steering wheel, a pilot lamp on the dash) and the
// call-out that shows the dashboard from the driver's seat: the cruise button, its lamp, the
// wheel.
// Units: figure units placed with (x, y, s) unless said otherwise.
// Global: Verse2aProps. Depends on Cereal, Song, Cast, Rides, Chorus1Props.
const Verse2aProps = (() => {
    const C = Cereal, K = C.COL, E = Ease, TAU = Math.PI * 2;
    const D = Cast.D, Dd = Cast.Dd;
    const lerp = (a, b, u) => a + (b - a) * u;
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const line = (g, pts, lw, ink = K.ink) => C.poly(g, pts, { ink, lw, close: false });
    const dot = (g, x, y, r, fill, lw, ink = K.ink) => {
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
    // a polyline moved sideways by d (to the left of its direction when d > 0, y down)
    const offset = (pts, d) => pts.map(([x, y], i) => {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
        return [x + (dy / l) * d, y - (dx / l) * d];
    });
    // the part of a polyline between two fractions of its length
    const part = (pts, u0, u1) => {
        const len = [0];
        for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        const total = len[len.length - 1] || 1, at = (u) => {
            const d = u * total;
            let i = 1;
            while (i < pts.length - 1 && len[i] < d) i++;
            const k = (d - len[i - 1]) / (len[i] - len[i - 1] || 1);
            return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)];
        };
        const out = [at(u0)];
        for (let i = 0; i < pts.length; i++) if (len[i] > u0 * total && len[i] < u1 * total) out.push(pts[i]);
        out.push(at(u1));
        return out;
    };

    // =========================================================================================
    // The rainbow bridge
    // =========================================================================================
    // A rainbow that stands on the road like a bridge: the car drives up one side of it and down
    // the other. It is the road's own band lifted along an arch, so wheels ride it the way they
    // ride the road. Logical units; everything is given by the screen x of its first foot.
    const BOW = { cols: [K.red, K.orange, K.yellow, K.green, K.blue, K.purple], far: -74, near: 34, face: 13, under: '#fff1c4', underD: '#e2c98a' };
    // how high the arch is `u` along it (0 at both feet, H in the middle)
    const bowH = (u, W, H) => (u <= 0 || u >= W ? 0 : H * Math.sin((Math.PI * u) / W));
    /**
     * rainbow(g, xa, lane, W, H, t, part)
     *   xa    the screen x of its first foot (it moves with the road);  lane  where wheels touch the road
     *   W, H  its span and its height;  part: 'back' (before the car) | 'front' (after it: the near puffs of cloud)
     */
    function rainbow(g, xa, lane, W, H, t, part = 'back') {
        if (xa > 1300 || xa + W < -300) return;
        const d = C.drawing(t), x0 = Math.max(xa, -40), x1 = Math.max(x0 + 1, Math.min(xa + W, 1040)), n = Math.max(2, Math.ceil((x1 - x0) / 14));
        const feet = [xa, xa + W];
        // a bank of cloud at each foot: the arch comes out of it. Lobes [dx, dy, r] from the foot.
        const bank = (fx, lobes, under) => {
            const body = new Path2D();
            let x0b = Infinity, x1b = -Infinity;
            lobes.forEach(([px, py, r], i) => {
                const rr = r * (1 + 0.035 * (((d + i) % 2) * 2 - 1));
                body.moveTo(fx + px + rr, lane + py);
                body.arc(fx + px, lane + py, rr, 0, TAU);
                x0b = Math.min(x0b, fx + px - rr);
                x1b = Math.max(x1b, fx + px + rr);
            });
            g.save();
            g.lineJoin = 'round';
            g.strokeStyle = K.ink;
            g.lineWidth = 6.4;
            g.stroke(body);
            g.fillStyle = '#fffdf4';
            g.fill(body);
            g.clip(body);
            g.fillStyle = '#cfe8ff';
            g.fillRect(x0b - 4, lane + under, x1b - x0b + 8, 200);
            g.restore();
        };
        if (part === 'front') {
            for (const fx of feet) if (fx > -200 && fx < 1200) bank(fx, [[-64, 40, 26], [-26, 30, 34], [20, 34, 38], [62, 44, 26]], 46);
            return;
        }
        // its shadow on the road
        const sa = Math.max(xa, -200), sb = Math.min(xa + W, 1200);
        if (sb > sa) {
            g.fillStyle = 'rgba(36,21,49,0.28)';
            g.beginPath();
            g.ellipse((sa + sb) / 2, lane + 6, (sb - sa) / 2, 26, 0, 0, TAU);
            g.fill();
        }
        const xs = Array.from({ length: n + 1 }, (_, i) => lerp(x0, x1, i / n));
        const edge = (dy) => xs.map((x) => [x, lane + dy - bowH(x - xa, W, H)]);
        // the side we see, under its near edge, then the six bands
        const lo = edge(BOW.near + BOW.face), hi = edge(BOW.near);
        C.poly(g, [...hi, ...lo.reverse()], { fill: BOW.under, ink: K.ink, lw: 3.2 });
        const nb = BOW.cols.length, bw = (BOW.near - BOW.far) / nb;
        BOW.cols.forEach((col, i) => {
            const a = edge(BOW.far + i * bw - (i ? 0.5 : 0)), b2 = edge(BOW.far + (i + 1) * bw);
            C.poly(g, [...a, ...b2.reverse()], { fill: col, lw: 0 });
        });
        line(g, edge(BOW.far), 3.2);
        line(g, edge(BOW.near), 3.2);
        // the banks of cloud its ends come out of
        for (const fx of feet) if (fx > -200 && fx < 1200) bank(fx, [[-104, -34, 34], [-58, -58, 46], [0, -78, 54], [58, -60, 46], [108, -34, 36], [-30, -28, 44], [40, -26, 44]], -22);
        // twinkles along it, each on its own count
        for (let i = 0; i * 190 < W; i++) {
            const u = 95 + i * 190, x = xa + u;
            if (x < -30 || x > 1030 || u > W - 60) continue;
            const ph = (d + i * 5) % 8, k = ph < 2 ? [0.7, 1][ph] : ph < 4 ? [0.8, 0.4][ph - 2] : 0;
            if (k <= 0) continue;
            const up = i % 2 === 0;
            C.sparkle(g, x, lane + (up ? BOW.far - 30 : BOW.near + BOW.face + 26) - bowH(u, W, H), 20 * k, { color: up ? K.white : K.yellow, ink: K.ink, lw: 2.6 });
        }
    }

    // =========================================================================================
    // The cactus, with arms that act
    // =========================================================================================
    const CAC = { body: K.teal, top: K.aqua, side: K.tealDeep, petal: K.pink, petalD: K.magenta, heart: K.yellow, lens: '#1d1626', glint: '#ffffff', mouth: K.ink, inside: '#0a5a55', tongue: '#ff8fa3', lid: K.tealDeep };
    const CAC_H = 1.95, CAC_W = 0.42, FACE_Y = -1.52;
    /**
     * A branch: a tube along `pts` (cactus units) with its ribs, the way the trunk is drawn.
     *   w: its width;  root: true when it is drawn over the trunk (its first end melts into it)
     */
    function branch(g, L, pts, w = 0.2, root = false) {
        const P = CAC, dd = Dd(0.2), side = pts.map(([x, y]) => [x + dd[0], y + dd[1]]);
        g.lineCap = 'round';
        g.lineJoin = 'round';
        if (!root) {
            C.poly(g, side, { ink: K.ink, lw: w + L, close: false });
            C.poly(g, side, { ink: P.side, lw: w - L, close: false });
        } else {
            const s2 = part(side, 0.3, 1);
            C.poly(g, s2, { ink: K.ink, lw: w + L, close: false });
            C.poly(g, s2, { ink: P.side, lw: w - L, close: false });
        }
        C.poly(g, pts, { ink: K.ink, lw: w + L, close: false });
        C.poly(g, pts, { ink: P.body, lw: w - L, close: false });
        if (root) dot(g, pts[0][0], pts[0][1], w / 2 + L * 0.6, P.body, 0);
        // the lit rib on the side that looks up and to the left, the dark one opposite
        const m = Math.floor(pts.length / 2), a = pts[Math.max(0, m - 1)], b = pts[Math.min(pts.length - 1, m + 1)];
        const sgn = b[0] - a[0] - (b[1] - a[1]) > 0 ? 1 : -1;
        line(g, part(offset(pts, sgn * w * 0.2), 0.14, 0.9), L * 0.75, P.top);
        line(g, part(offset(pts, -sgn * w * 0.22), 0.14, 0.9), L * 0.75, P.side);
    }
    // a path through its points, rounded
    const bend = (pts, seg = 7) => (pts.length < 3 ? pts : C.curve(pts, false, seg));
    // the arms at rest: the left one out and up (it swings from its elbow), the right one along to the wheel
    const armUp = (sx, sw = 0, ey = -1.0, len = 0.5) => {
        const hw = CAC_W / 2, ex = sx * (hw + 0.3), tip = rot([0, -len], sw * 0.22);
        return [[sx * (hw - 0.06), ey], [ex, ey], [ex + tip[0], ey + tip[1]]];
    };
    const armTo = (p, w = 0.18) => ({ pts: [[CAC_W / 2 - 0.06, p[1]], [p[0], p[1]]], w });

    /**
     * cactus(g, x, y, s, pose)   (x, y) is its foot; 1.95 tall, 0.42 wide. Chorus 1's cactus.
     *   pose: { squash, lean,
     *           armL, armR: { pts: [[x, y], …] a path from the trunk to the tip, in its units; w (0.2);
     *                         front: true to draw it over the trunk and the face }  (defaults: the left
     *                         one raised, the right one raised too),
     *           shades: how far up the shades are pushed (0 on the face, 0.2 on the forehead); null: none,
     *           shadesTilt: radians,
     *           eyes: 'open' | 'sleepy' | 'shut'  (what is under the shades),
     *           mouth: 'smile' | 'oh' | 'yawn' | 'sleep' | 'flat',
     *           bubble: 0..1 the snore bubble at its mouth (0: none) }
     */
    function cactus(g, x, y, s, pose = {}) {
        const L = 3.2 / s, P = CAC, q = pose.squash ?? 0, hw = CAC_W / 2, H = CAC_H, dd = Dd(0.2);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        g.lineJoin = 'round';
        const aL = pose.armL ?? { pts: armUp(-1) }, aR = pose.armR ?? { pts: armUp(1, 0, -1.2, 0.44) };
        for (const a of [aL, aR]) if (!a.front) branch(g, L, a.pts, a.w ?? 0.2);
        // the trunk: its side, its front, a lit rib and a dark one
        g.lineWidth = L;
        g.strokeStyle = K.ink;
        g.beginPath();
        g.roundRect(-hw + dd[0], -H + dd[1], CAC_W, H, [hw, hw, 0, 0]);
        g.fillStyle = P.side;
        g.fill();
        g.stroke();
        g.beginPath();
        g.roundRect(-hw, -H, CAC_W, H, [hw, hw, 0, 0]);
        g.fillStyle = P.body;
        g.fill();
        g.stroke();
        line(g, [[-hw + CAC_W * 0.3, -H + CAC_W * 0.42], [-hw + CAC_W * 0.3, -0.03]], L * 0.75, P.top);
        line(g, [[-hw + CAC_W * 0.72, -H + CAC_W * 0.46], [-hw + CAC_W * 0.72, -0.03]], L * 0.75, P.side);
        for (let i = 0; i < 5; i++) {
            const sy = -0.2 - i * 0.22;
            line(g, [[-hw, sy], [-hw - 0.045, sy - 0.03]], L * 0.6);
            line(g, [[hw + dd[0], sy + dd[1] - 0.06], [hw + dd[0] + 0.045, sy + dd[1] - 0.09]], L * 0.6);
        }
        // the flower on its crown
        const fx = 0.03, fy = -H - 0.01;
        for (let i = 0; i < 5; i++) {
            const a = -Math.PI / 2 + (i / 5) * TAU;
            dot(g, fx + Math.cos(a) * 0.085, fy + Math.sin(a) * 0.07 - 0.035, 0.066, i % 2 ? P.petalD : P.petal, L * 0.75);
        }
        dot(g, fx, fy - 0.035, 0.046, P.heart, L * 0.7);
        // the face: the eyes, then the shades over them
        const fyy = FACE_Y, up = pose.shades, eyes = pose.eyes ?? 'open';
        if (up == null || up > 0.02) {
            for (const sx of [-1, 1]) {
                const ex = sx * 0.09;
                if (eyes === 'shut') line(g, C.curve([[ex - 0.04, fyy - 0.005], [ex, fyy + 0.022], [ex + 0.04, fyy - 0.005]], false, 5), L * 0.95);
                else if (eyes === 'sleepy') {
                    g.fillStyle = K.ink;
                    g.beginPath();
                    g.roundRect(ex - 0.024, fyy - 0.005, 0.048, 0.06, 0.018);
                    g.fill();
                    line(g, [[ex - 0.046, fyy - 0.012], [ex + 0.046, fyy - 0.012]], L * 0.95);
                } else {
                    g.fillStyle = K.ink;
                    g.beginPath();
                    g.roundRect(ex - 0.024, fyy - 0.055, 0.048, 0.11, 0.018);
                    g.fill();
                }
            }
        }
        if (up != null) {
            g.save();
            g.translate(0, fyy - up);
            g.rotate(pose.shadesTilt ?? 0);
            for (const sx of [-1, 1]) {
                const cx = sx * 0.094;
                C.poly(g, [[cx - 0.082, -0.07], [cx + 0.082, -0.07], [cx + 0.068, 0.03], [cx + 0.035, 0.058], [cx - 0.035, 0.058], [cx - 0.068, 0.03]], { fill: P.lens, ink: K.ink, lw: L * 0.8 });
                line(g, [[cx - 0.04, 0.014], [cx - 0.006, -0.036]], L * 0.7, P.glint);
            }
            line(g, [[-0.02, -0.052], [0.02, -0.052]], L * 1.2);
            line(g, [[-0.176, -0.058], [-hw, -0.075]], L);
            line(g, [[0.176, -0.058], [hw, -0.075]], L);
            g.restore();
        }
        const m = pose.mouth ?? 'smile', my = fyy + 0.2;
        if (m === 'oh') dot(g, 0, my, 0.045, P.inside, L * 0.8);
        else if (m === 'yawn') {
            g.beginPath();
            g.ellipse(0, my + 0.02, 0.075, 0.095, 0, 0, TAU);
            g.fillStyle = P.inside;
            g.fill();
            g.save();
            g.clip();
            dot(g, 0.005, my + 0.115, 0.06, P.tongue, 0);
            g.restore();
            g.beginPath();
            g.ellipse(0, my + 0.02, 0.075, 0.095, 0, 0, TAU);
            g.strokeStyle = K.ink;
            g.lineWidth = L * 0.85;
            g.stroke();
        } else if (m === 'sleep') dot(g, 0.035, my + 0.005, 0.032, P.inside, L * 0.8);
        else if (m === 'flat') line(g, [[-0.07, my], [0.075, my - 0.005]], L * 0.95, P.mouth);
        else line(g, C.curve([[-0.09, fyy + 0.16], [-0.035, fyy + 0.215], [0.04, fyy + 0.215], [0.095, fyy + 0.15]], false, 5), L * 0.95, P.mouth);
        for (const a of [aL, aR]) if (a.front) branch(g, L, a.pts, a.w ?? 0.2, true);
        if ((pose.bubble ?? 0) > 0) snore(g, L, 0.062, my - 0.005, pose.bubble);
        g.restore();
    }
    // The snore bubble: it swells out of the mouth's corner, up and to the right. k: 0..1 its size.
    function snore(g, L, x, y, k) {
        const r = 0.03 + 0.16 * k, cx = x + r * 0.9, cy = y - r * 0.12;
        g.beginPath();
        g.arc(cx, cy, r, 0, TAU);
        g.fillStyle = '#c4f1ff';
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = L * 0.85;
        g.stroke();
        if (r > 0.06) {
            // a window's glint, top left, and a small one opposite
            g.beginPath();
            g.arc(cx, cy, r * 0.68, Math.PI * 1.08, Math.PI * 1.45);
            g.strokeStyle = '#ffffff';
            g.lineWidth = Math.max(L * 0.9, r * 0.13);
            g.lineCap = 'round';
            g.stroke();
            dot(g, cx + r * 0.42, cy + r * 0.46, r * 0.09, '#ffffff', 0);
        }
    }

    // =========================================================================================
    // The cockpit in the close shot (the car's units, through Rig.band's cockpit hooks)
    // =========================================================================================
    const WHEEL = { c: [2.62 + D[0] * 0.6, -1.17 + D[1] * 0.6], r: 0.21, up: [0.3, -0.95] };
    const onWheel = (a, k = 1) => [WHEEL.c[0] + (Math.cos(a) * D[0] + Math.sin(a) * WHEEL.up[0]) * WHEEL.r * k, WHEEL.c[1] + (Math.cos(a) * D[1] + Math.sin(a) * WHEEL.up[1]) * WHEEL.r * k];
    const LAMP = [2.67, -1.125]; // the pilot lamp's foot on the dash, by the windshield
    /**
     * What Rides.bandCar's steering wheel gains: three spokes, a horn cap and a red grip on its rim, so
     * that it is seen to turn. ang: the wheel's angle. Draw it in cockpit.back.
     */
    function wheelSpokes(g, s, ang = 0) {
        const L = 3.2 / s, P = { chrome: '#d5dbea', chromeSide: '#8d95ad', rim: '#fff1c4', grip: K.red };
        g.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
            const a = ang + Math.PI / 2 + (i / 3) * TAU;
            C.poly(g, [onWheel(a, 0.12), onWheel(a, 0.9)], { ink: K.ink, lw: 0.03 + 1.4 * L, close: false });
            C.poly(g, [onWheel(a, 0.12), onWheel(a, 0.9)], { ink: P.chrome, lw: 0.03, close: false });
        }
        // the grip: a red band round the top of the rim
        const arc = Array.from({ length: 7 }, (_, i) => onWheel(ang + Math.PI / 2 - 0.42 + (i / 6) * 0.84));
        C.poly(g, arc, { ink: K.ink, lw: 0.05 + 1.4 * L, close: false });
        C.poly(g, arc, { ink: P.grip, lw: 0.05, close: false });
        C.poly(g, Array.from({ length: 12 }, (_, i) => onWheel((i / 12) * TAU, 0.2)), { fill: P.chromeSide, ink: K.ink, lw: L * 0.7 });
    }
    /**
     * The pilot lamp on the dash: a chrome foot and a green jewel. on: 0 (dark) … 1 (lit; above 1
     * it flares as it comes on). d: the drawing, for the rays. Draw it in cockpit.back.
     */
    function pilot(g, s, on = 0, d = 0) {
        const L = 3.2 / s, [x, y] = LAMP, lit = on > 0.01;
        if (lit) {
            const k = Math.min(1.4, on);
            for (let i = 0; i < 7; i++) {
                const a = Math.PI * (1.0 + (0.62 * i) / 6) + (d % 2 ? 0.08 : -0.04), r0 = 0.1 + 0.02 * (d % 2), r1 = r0 + (0.07 + 0.03 * ((i + d) % 2)) * k;
                line(g, [[x + Math.cos(a) * r0, y - 0.05 + Math.sin(a) * r0], [x + Math.cos(a) * r1, y - 0.05 + Math.sin(a) * r1]], L * 1.1, '#fffdf4');
            }
        }
        C.poly(g, [[x - 0.055, y], [x - 0.045, y - 0.035], [x + 0.045, y - 0.035], [x + 0.055, y]], { fill: '#d5dbea', ink: K.ink, lw: L * 0.8 });
        g.beginPath();
        g.arc(x, y - 0.035, 0.05 * (lit ? Math.min(1.25, 0.9 + 0.25 * on) : 1), Math.PI, TAU);
        g.closePath();
        g.fillStyle = lit ? '#8dff8a' : '#17704a';
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = L * 0.8;
        g.stroke();
        line(g, [[x - 0.026, y - 0.05], [x - 0.012, y - 0.068]], L * 0.7, lit ? '#ffffff' : '#35c46a');
    }

    // =========================================================================================
    // The call-out: the dashboard from the driver's seat
    // =========================================================================================
    const ROD = { body: '#e8392f', top: '#ff6f59', side: '#ad211f', inside: '#6d1622', chrome: '#d5dbea', chromeTop: '#f4f6fc', chromeSide: '#8d95ad', rim: '#fff1c4', rimSide: '#e2c98a', glass: '#aaf3ec', dial: '#fff1c4' };
    // The cruise sign: a speedometer's dial with its needle, and an arrow that points at the mark.
    function cruiseIcon(g, x, y, r, col = K.ink) {
        g.save();
        g.translate(x, y);
        g.lineCap = 'round';
        g.lineJoin = 'round';
        const lw = r * 0.15, a0 = Math.PI * 0.82, a1 = Math.PI * 2.18, cy = r * 0.2, R = r * 0.74;
        g.beginPath();
        g.arc(0, cy, R, a0, a1);
        g.strokeStyle = col;
        g.lineWidth = lw;
        g.stroke();
        for (let i = 0; i < 5; i++) {
            const a = lerp(a0, a1, i / 4);
            line(g, [[Math.cos(a) * R * 0.94, cy + Math.sin(a) * R * 0.94], [Math.cos(a) * R * 0.7, cy + Math.sin(a) * R * 0.7]], lw * 0.8, col);
        }
        // the needle, to the mark on its upper right
        const an = lerp(a0, a1, 0.72);
        line(g, [[0, cy], [Math.cos(an) * R * 0.62, cy + Math.sin(an) * R * 0.62]], lw * 1.1, col);
        dot(g, 0, cy, lw * 1.05, col, 0);
        // the arrow comes down on the mark from outside
        const tip = [Math.cos(an) * R * 1.16, cy + Math.sin(an) * R * 1.16], u = [Math.cos(an), Math.sin(an)], nrm = [-u[1], u[0]];
        C.poly(g, [tip, [tip[0] + u[0] * r * 0.34 + nrm[0] * r * 0.19, tip[1] + u[1] * r * 0.34 + nrm[1] * r * 0.19], [tip[0] + u[0] * r * 0.34 - nrm[0] * r * 0.19, tip[1] + u[1] * r * 0.34 - nrm[1] * r * 0.19]], { fill: col, ink: col, lw: lw * 0.4 });
        g.restore();
    }
    /**
     * callout(g, x, y, R, o)   a round window of radius R (logical units) on the dashboard, seen from
     * the driver's seat: the cruise button with its sign, the pilot lamp over it, a slice of the
     * speedometer, the top of the steering wheel.
     *   o: { k (0..1+ its size as it pops), from: [x, y] the point of the car it shows (its tail goes there),
     *        press (0..1 how far in the button is), lit (0 dark; 1 lit; above 1 the flare as it comes on),
     *        arm: null | { u: 0..1 the branch's reach (1: its tip on the button), sq: its tip's squash },
     *        steer (radians: the wheel's angle), needle (0..1), d (the drawing) }
     */
    function callout(g, x, y, R, o = {}) {
        const k = o.k ?? 1, d = o.d ?? 0;
        if (k <= 0.01) return;
        const from = o.from ?? [x, y + R * 2], cx = lerp(from[0], x, Math.min(1, k)), cy = lerp(from[1], y, Math.min(1, k)), r = R * k;
        g.save();
        g.lineJoin = 'round';
        // the tail, from the window to the place it shows
        const dx = from[0] - cx, dy = from[1] - cy, dl = Math.hypot(dx, dy) || 1, ux = dx / dl, uy = dy / dl;
        if (dl > r * 1.05) C.poly(g, [[cx - uy * r * 0.2 + ux * r * 0.9, cy + ux * r * 0.2 + uy * r * 0.9], [from[0], from[1]], [cx + uy * r * 0.2 + ux * r * 0.9, cy - ux * r * 0.2 + uy * r * 0.9]], { fill: K.white, ink: K.ink, lw: 3.2 });
        C.burst(g, cx, cy, { r0: r * 1.13, r1: r * 1.3, n: 16, seed: 'verse2a-callout', jitter: 0.1, rot: d % 4 < 2 ? 0 : 0.05, fill: K.pink, ink: K.ink, lw: 3.6 });
        dot(g, cx, cy, r * 1.04, K.white, 3.2);
        g.save();
        g.beginPath();
        g.arc(cx, cy, r * 0.97, 0, TAU);
        g.clip();
        g.translate(cx, cy);
        g.scale(r / 160, r / 160);
        const L = 3.2 / (r / 160);
        // the windshield over the dash's top edge, the hood beyond it
        g.fillStyle = '#7fdce8';
        g.fillRect(-170, -170, 340, 110);
        C.poly(g, [[-170, -98], [170, -108], [170, -60], [-170, -60]], { fill: ROD.top, ink: K.ink, lw: L * 0.8 });
        for (const [gx, g0, g1] of [[-96, -150, -118], [-74, -160, -136]]) line(g, [[gx, g0], [gx + 14, g1]], L * 1.2, '#eafcff');
        // the dash: a padded roll on top, the painted panel, a chrome strip, the shadow under it
        C.poly(g, [[-170, -64], [170, -64], [170, 130], [-170, 130]], { fill: ROD.body, ink: K.ink, lw: L });
        C.poly(g, [[-170, -70], [170, -70], [170, -42], [-170, -42]], { fill: ROD.side, ink: K.ink, lw: L });
        line(g, [[-160, -61], [160, -61]], L * 0.8, '#c9453f');
        C.poly(g, [[-170, 98], [170, 98], [170, 112], [-170, 112]], { fill: ROD.chrome, ink: K.ink, lw: L * 0.8 });
        line(g, [[-160, 102], [160, 102]], L * 0.7, ROD.chromeTop);
        C.poly(g, [[-170, 112], [170, 112], [170, 170], [-170, 170]], { fill: ROD.inside, ink: K.ink, lw: L * 0.8 });
        // a slice of the speedometer on the left: bezel, face, ticks, numbers left out, the needle
        const sx = -138, sy = 26, sr = 70, nd = o.needle ?? 0.6;
        dot(g, sx, sy, sr + 9, ROD.chrome, L);
        dot(g, sx, sy, sr, ROD.dial, L * 0.8);
        for (let i = 0; i <= 10; i++) {
            const a = Math.PI * (0.8 + (1.4 * i) / 10);
            line(g, [[sx + Math.cos(a) * sr * 0.9, sy + Math.sin(a) * sr * 0.9], [sx + Math.cos(a) * sr * (i % 2 ? 0.78 : 0.68), sy + Math.sin(a) * sr * (i % 2 ? 0.78 : 0.68)]], L * (i % 2 ? 0.7 : 1), K.ink);
        }
        const na = Math.PI * (0.8 + 1.4 * nd);
        line(g, [[sx - Math.cos(na) * 10, sy - Math.sin(na) * 10], [sx + Math.cos(na) * sr * 0.8, sy + Math.sin(na) * sr * 0.8]], L * 1.5, K.red);
        dot(g, sx, sy, 8, K.ink, 0);
        // the pilot lamp, on the dash's top edge over the button
        const lit = o.lit ?? 0, on = lit > 0.01, lx = 34, ly = -70;
        if (on) {
            for (let i = 0; i < 7; i++) {
                const a = Math.PI * (1.04 + (0.92 * i) / 6) + (d % 2 ? 0.09 : -0.05), r0 = 30 + 4 * (d % 2), r1 = r0 + (18 + 8 * ((i + d) % 2)) * Math.min(1.5, lit);
                line(g, [[lx + Math.cos(a) * r0, ly - 6 + Math.sin(a) * r0], [lx + Math.cos(a) * r1, ly - 6 + Math.sin(a) * r1]], L * 1.5, '#fffdf4');
            }
        }
        C.poly(g, [[lx - 24, ly + 2], [lx - 20, ly - 10], [lx + 20, ly - 10], [lx + 24, ly + 2]], { fill: ROD.chrome, ink: K.ink, lw: L * 0.8 });
        g.beginPath();
        g.arc(lx, ly - 10, 19 * (on ? Math.min(1.25, 0.9 + 0.25 * lit) : 1), Math.PI, TAU);
        g.closePath();
        g.fillStyle = on ? '#8dff8a' : '#17704a';
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = L * 0.85;
        g.stroke();
        line(g, [[lx - 10, ly - 16], [lx - 4, ly - 23]], L * 0.9, on ? '#ffffff' : '#35c46a');
        // the button: a chrome collar on the panel and a big cap that stands out of it (towards
        // us: down and to the left); pressed, the cap goes home into the collar
        const bx = 34, by = 28, out = 13 * (1 - (o.press ?? 0)), capx = bx - out, capy = by + out * 0.66, cr = 47;
        dot(g, bx, by, 60, ROD.chrome, L);
        dot(g, bx, by, 52, ROD.chromeSide, L * 0.7);
        g.beginPath();
        g.arc(bx - 6, by - 6, 56, Math.PI * 1.1, Math.PI * 1.4);
        g.strokeStyle = ROD.chromeTop;
        g.lineWidth = L * 1.2;
        g.lineCap = 'round';
        g.stroke();
        if (on) {
            for (let i = 0; i < 12; i++) {
                const a = (i / 12) * TAU + (d % 2 ? 0.13 : 0), r0 = 66 + 3 * (d % 2), r1 = r0 + (10 + 6 * ((i + d) % 2)) * Math.min(1.5, lit);
                line(g, [[bx + Math.cos(a) * r0, by + Math.sin(a) * r0], [bx + Math.cos(a) * r1, by + Math.sin(a) * r1]], L * 1.4, K.yellow);
            }
        }
        // the cap's wall, then its face
        g.beginPath();
        g.moveTo(capx + cr * Math.cos(-0.98), capy + cr * Math.sin(-0.98));
        g.arc(capx, capy, cr, -0.98 - Math.PI, -0.98, true);
        g.arc(bx, by, cr, -0.98, -0.98 - Math.PI, false);
        g.closePath();
        g.fillStyle = on ? K.gold : '#d9b98a';
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = L;
        g.stroke();
        dot(g, capx, capy, cr, on ? K.yellow : '#fff1c4', L);
        g.beginPath();
        g.arc(capx, capy, cr - 8, Math.PI * 1.05, Math.PI * 1.42);
        g.strokeStyle = '#ffffff';
        g.lineWidth = L * 1.3;
        g.stroke();
        cruiseIcon(g, capx + 1, capy + 1, 31, K.ink);
        // the steering wheel's top, turning; its hub is under the window
        const wc = [-30, 268], wr = 172, st = o.steer ?? 0;
        g.save();
        g.translate(wc[0], wc[1]);
        g.rotate(st);
        for (const a of [-0.62, 0.62]) {
            const p0 = [Math.sin(a) * 40, -Math.cos(a) * 40], p1 = [Math.sin(a) * (wr - 10), -Math.cos(a) * (wr - 10)];
            C.poly(g, [p0, p1], { ink: K.ink, lw: 15 + 2 * L, close: false });
            C.poly(g, [p0, p1], { ink: ROD.chrome, lw: 15, close: false });
            line(g, [[p0[0] - 3, p0[1]], [p1[0] - 3, p1[1]]], L * 0.8, ROD.chromeTop);
        }
        g.beginPath();
        g.arc(0, 0, wr, 0, TAU);
        g.strokeStyle = K.ink;
        g.lineWidth = 26 + 2 * L;
        g.stroke();
        g.strokeStyle = ROD.rim;
        g.lineWidth = 26;
        g.stroke();
        g.beginPath();
        g.arc(0, 0, wr + 6, Math.PI * 1.2, Math.PI * 1.8);
        g.strokeStyle = '#ffffff';
        g.lineWidth = L * 1.1;
        g.stroke();
        g.beginPath();
        g.arc(0, 0, wr - 8, Math.PI * 1.15, Math.PI * 1.85);
        g.strokeStyle = ROD.rimSide;
        g.lineWidth = L * 1.1;
        g.stroke();
        // the grip: a red band on the top of the rim
        g.beginPath();
        g.arc(0, 0, wr, -Math.PI / 2 - 0.13, -Math.PI / 2 + 0.13);
        g.lineCap = 'butt';
        g.strokeStyle = K.ink;
        g.lineWidth = 26 + 2 * L;
        g.stroke();
        g.beginPath();
        g.arc(0, 0, wr, -Math.PI / 2 - 0.115, -Math.PI / 2 + 0.115);
        g.strokeStyle = K.red;
        g.lineWidth = 26;
        g.stroke();
        g.lineCap = 'round';
        g.restore();
        // the cactus's branch, from the lower left to the button
        if (o.arm) {
            const u = o.arm.u, tip = [lerp(-150, capx - 6, u), lerp(190, capy + 8, u)], rootP = [-230, 260], mid = [lerp(rootP[0], tip[0], 0.5) - 14, lerp(rootP[1], tip[1], 0.5) + 30];
            const pts = C.curve([rootP, mid, tip], false, 8), w = 62, sd = pts.map(([px, py]) => [px + 14, py - 9]);
            g.lineCap = 'round';
            C.poly(g, sd, { ink: K.ink, lw: w + L, close: false });
            C.poly(g, sd, { ink: CAC.side, lw: w - L, close: false });
            C.poly(g, pts, { ink: K.ink, lw: w + L, close: false });
            C.poly(g, pts, { ink: CAC.body, lw: w - L, close: false });
            line(g, part(offset(pts, w * 0.2), 0.1, 0.9), L * 0.9, CAC.top);
            line(g, part(offset(pts, -w * 0.22), 0.1, 0.9), L * 0.9, CAC.side);
            for (let i = 0; i < 3; i++) {
                const q = part(offset(pts, w * 0.5), 0.45 + i * 0.16, 0.46 + i * 0.16)[0];
                line(g, [q, [q[0] - 9, q[1] - 9]], L * 0.75);
            }
            // the knock, when it lands
            const sq = o.arm.sq ?? 0;
            if (sq > 0.05) for (const a of [-2.5, -1.6, -0.7, 0.3]) line(g, [[capx + Math.cos(a) * 62, capy + Math.sin(a) * 62], [capx + Math.cos(a) * (62 + 24 * sq), capy + Math.sin(a) * (62 + 24 * sq)]], L * 1.5);
        }
        g.restore();
        g.beginPath();
        g.arc(cx, cy, r * 0.97, 0, TAU);
        g.strokeStyle = K.ink;
        g.lineWidth = 3.2;
        g.stroke();
        g.restore();
    }

    return { rainbow, bowH, BOW, cactus, branch, bend, armUp, armTo, snore, CAC_H, CAC_W, FACE_Y, wheelSpokes, pilot, onWheel, WHEEL, LAMP, cruiseIcon, callout };
})();
