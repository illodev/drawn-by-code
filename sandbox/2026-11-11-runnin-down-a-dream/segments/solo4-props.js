// Props for «solo4» (bars 155–166: out of the air, the moon wakes, the landing) and for the
// block after it, which starts from solo4's last picture. Global: Solo4Props.
// Depends on Cereal, Song, Rides, BandRhythm, Chorus1Props, Inferno, Skyward, Finale, Devil;
// Solo2Props (the hangers) and Solo3Props (the angels' poses) are used when they are loaded.
//
// THE MOON STAGE — the moon's limb as the ground, the Earth risen over it, the car parked on
// it with its pennant planted as a flag, the hangers and the angels standing on either side.
// Everything is a pure function of film time, so the picture carries on across the cut:
//
//     Solo4Props.moonStage(g, t);                     // sky, stars, the Earth, the surface with the flag, the tracks, the far dust
//     Solo4Props.parked(g, t, o);                     // Finale.ride at rest on the limb (o: what Finale.ride takes), its whip gone
//     Solo4Props.company(g, t, o);                    // the four hangers and the three angels standing, keeping the beat
//     Solo4Props.moonStage(g, t, { part: 'front' });  // the near dust, over the wheels
//
//   or all four in that order: Solo4Props.moonScene(g, t, o)   (o: { ride: {…}, company: {…} }).
//   solo4 draws exactly moonScene(g, t) from beat 667 on, so its last frame is moonScene at
//   that time. The dust thins out by itself after the landing (landK(t)) and the Earth keeps
//   creeping up (earthAt(t)); both settle within a few seconds.
//
//   moonStage o: { part   'back' (default) | 'front'
//                  earth  { x, y, r } instead of earthAt(t);  false for none
//                  flag   0..1 its pop (default 1: planted);  0 / false: not planted yet
//                  land   Skyward.landing's k instead of landK(t);  0: no tracks, no dust }
//   company   o: { only: ['h0', 'h1', 'h2', 'h3', 'a0', 'a1', 'a2'] draws only these
//                  squash: { h0: …, a1: … } an extra squash on one of them (a landing) }
//   Solo4Props.stander(g, id, t, o) draws one of them: o { at: { x, y, rot } elsewhere, squash, pose }.
//
//   Solo4Props.STAGE — where everything is, in the frame's 1000 × 1000 units:
//     s        56     the car's scale, and everybody's
//     limb     { x: 500, y: 1820, r: 1200 }   the moon (Skyward.moon, turned by moonRot); its top is the horizon at y = 620
//     car      { x, y, rot }   Skyward.landingAt(limb, carA, 56): about (480, 637), rot −0.017;
//              draw the ride at (0, 0) after g.translate(x, y), g.rotate(rot) (parked() does)
//     hood     [x, y]   the Devil's ground point on the hood
//     flag     { a, x, y, rot }   Skyward.moon's flag (a − moonRot, s 56) by the car's far headlamp: its foot (752, 665)
//              just behind the limb, its lean on screen; moonStage adds a glint down the rod (Solo4Props.whip, core)
//     earth    { x: 800, y: 380, r: 62 }   where the Earth ends up
//     stand    { h0 … h3, a0 … a2 }   each { x, y, rot }: the feet on the surface and the turn
//              that stands them upright there. Left of the tail: h3 the skeleton, then the imps
//              as a pyramid: h2 (the third imp) and h1 (the bow) on the ground, h0 (the specs)
//              standing on their heads. Right of the nose: a1 the trumpet on the limb, a0 the harp
//              and a2 the ginger one either side of him and a step nearer the camera (28 units
//              below the limb), so all three faces show. Solo4Props.IDS is the drawing order.
//
// Also here, for solo4's own shots: the weightless overlays (Stan's sticks, Benmont's curls,
// the cactus's flower), the whip with the pennant on its own, the Earth, a burst of moon
// dust that hangs, a shooting star, the Devil's two mitts in the air.
const Solo4Props = (() => {
    const C = Cereal, K = C.COL, S = Song, W = Skyward, M = W.MOON, TAU = Math.PI * 2, PI = Math.PI;
    const D = W.D, Dd = (z) => [D[0] * z, D[1] * z];
    const lerp = (a, b, u) => a + (b - a) * u;
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const seg = (v, a, b) => clamp((v - a) / (b - a));
    const smooth = (u) => {
        const v = clamp(u);
        return v * v * (3 - 2 * v);
    };
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
    const has2 = () => typeof Solo2Props !== 'undefined' && !!Solo2Props.hanger;
    const has3 = () => typeof Solo3Props !== 'undefined' && !!Solo3Props.escortPoints;
    // Scalloped puffs as in rides.js and skyward.js: the outlines of the whole group, then the fills.
    function puffs(g, list, fill, L, ink = K.ink) {
        const parts = [];
        for (const [x, y, r, n, a0] of list) {
            if (!(r > 0)) continue;
            parts.push([x, y, r * 0.74]);
            for (let i = 0; i < n; i++) {
                const a = a0 + (i / n) * TAU;
                parts.push([x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.4]);
            }
        }
        g.strokeStyle = ink;
        g.lineWidth = L * 2;
        for (const [x, y, r] of parts) {
            g.beginPath();
            g.arc(x, y, r, 0, TAU);
            g.stroke();
        }
        g.fillStyle = fill;
        for (const [x, y, r] of parts) {
            g.beginPath();
            g.arc(x, y, r, 0, TAU);
            g.fill();
        }
    }
    // Draw fn everywhere but inside a hole: hole(g) adds the hole's outline to the current path.
    // (The shared drawers have no switch for the flower on the cactus or the whip on the car:
    // the piece that has floated off is left out this way and drawn on its own.)
    function except(g, hole, fn) {
        g.save();
        g.beginPath();
        g.rect(-6000, -6000, 13000, 13000);
        hole(g);
        g.clip('evenodd');
        fn();
        g.restore();
    }

    // =========================================================================================
    // Weightless things on the car (the climb: the car at Finale.CAR, no lean, no bounce)
    // =========================================================================================
    const SEATS = Rides.bandCarSeats();
    // a seat's place on screen for a car at (x, y, s) that neither leans nor bounces
    const seatAt = (p, x, y, s) => [x + p[0] * s, y + p[1] * s];

    // --- Stan's sticks ---------------------------------------------------------------------------
    // With snare, hat and crash at 0 his mitts are raised here (his units, from the kit's ground
    // point), each stick through its mitt along `a` (band-rhythm.js).
    const STICKS = [{ m: [-0.44, -1.1], a: -2.1 }, { m: [0.72, -0.97], a: -0.4 }];
    const ST = { reach: 0.4, butt: 0.13 }, ST_MID = (ST.reach - ST.butt) / 2;
    // one drumstick, in the current units: its middle at c, pointing along a
    function stick(g, L, c, a) {
        const P = BandRhythm.STAN, u = [Math.cos(a), Math.sin(a)], n = [-u[1] * 0.017, u[0] * 0.017];
        const m = [c[0] - u[0] * ST_MID, c[1] - u[1] * ST_MID];
        const p0 = [m[0] - u[0] * ST.butt, m[1] - u[1] * ST.butt], p1 = [m[0] + u[0] * (ST.reach - 0.02), m[1] + u[1] * (ST.reach - 0.02)];
        C.prism(g, cw([[p0[0] + n[0], p0[1] + n[1]], [p1[0] + n[0] * 0.7, p1[1] + n[1] * 0.7], [p1[0] - n[0] * 0.7, p1[1] - n[1] * 0.7], [p0[0] - n[0], p0[1] - n[1]]]), Dd(0.03), { front: P.stick, top: P.stickTop, side: P.stickSide }, { lw: L * 0.8, ink: P.ink });
        g.beginPath();
        g.ellipse(m[0] + u[0] * ST.reach, m[1] + u[1] * ST.reach, 0.034, 0.024, a, 0, TAU);
        g.fillStyle = P.stick;
        g.fill();
        g.strokeStyle = P.ink;
        g.lineWidth = L * 0.8;
        g.stroke();
    }
    /**
     * Stan's two sticks loose in the air. x, y, s: the car. u 0..1: they leave his raised mitts,
     * drift up turning end over end and come back into them (at 0 and 1 they are exactly where
     * he holds them). Draw the ride inside emptyMitts() meanwhile, with snare, hat and crash at 0.
     */
    function sticks(g, x, y, s, u) {
        const [sx, sy] = seatAt(SEATS.kit, x, y, s), e = smooth(u), up = Math.sin(PI * e);
        g.save();
        g.translate(sx, sy);
        g.scale(s, s);
        g.lineJoin = 'round';
        STICKS.forEach((k, i) => {
            const sd = i ? 1 : -1, c0 = [k.m[0] + Math.cos(k.a) * ST_MID, k.m[1] + Math.sin(k.a) * ST_MID];
            const c = [c0[0] + sd * (0.2 * up + 0.07 * Math.sin(TAU * e)), c0[1] - (i ? 0.92 : 0.78) * up];
            // they tumble towards the camera: bigger at the top of their drift, or they are lost against the amps
            const z = 1 + 1.1 * up;
            g.save();
            g.translate(c[0], c[1]);
            g.scale(z, z);
            stick(g, 3.2 / s / Math.sqrt(z), [0, 0], k.a + sd * TAU * (i ? 2 : 1) * e);
            g.restore();
        });
        g.restore();
    }
    // Runs fn (which draws the ride) with no sticks in Stan's mitts: band-rhythm.js draws a
    // stick as long as BandRhythm.STICK says, so for the length of this call they are nothing
    // (a speck under each mitt), and the constants are put back whatever happens.
    function emptyMitts(fn) {
        const k = BandRhythm.STICK, keep = { reach: k.reach, butt: k.butt };
        k.reach = 0.02;
        k.butt = 0;
        try {
            fn();
        } finally {
            k.reach = keep.reach;
            k.butt = keep.butt;
        }
    }

    // --- Benmont's curls ---------------------------------------------------------------------------
    // His head again (band-rhythm.js's benHead) with the top of the mass of curls standing up:
    // k 0..1.2 how far, wob a phase that makes the locks sway. Drawn over his own head: what
    // is below the brow is the same drawing.
    const unit = (p, q) => {
        const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1e-6;
        return [dx / l, dy / l, l];
    };
    function bumps(anchors, k = 0.34, closed = true, m = 7) {
        const out = [], n = anchors.length, last = closed ? n : n - 1;
        for (let i = 0; i < last; i++) {
            const p = anchors[i], q = anchors[(i + 1) % n];
            const [ux, uy, l] = unit(p, q), nx = uy, ny = -ux;
            for (let j = 0; j < m; j++) {
                const a = (j / m) * PI, t = (1 - Math.cos(a)) / 2, h = Math.sin(a) * k * l;
                out.push([p[0] + (q[0] - p[0]) * t + nx * h, p[1] + (q[1] - p[1]) * t + ny * h]);
            }
        }
        if (!closed) out.push(anchors[n - 1]);
        return out;
    }
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
    function curls(g, x, y, s, pose, k, wob = 0) {
        if (!(k > 0.005)) return;
        const P = BandRhythm.BEN, [bx, by] = seatAt(SEATS.deck[2], x, y, s), L = 3.2 / s, q = pose.squash ?? 0;
        const h = 0.92, top = -1.85, d = 0.42, bot = top + h, sw = pose.sway ?? 0, fx = 0.31, fy = top + 0.2;
        const cy = top + 0.4, rx = 0.51, ry = 0.48, N = 14, e = 2.6, yp = top + 0.21;
        // how far a point above the brow rises, and how it leans with the locks' sway
        const lift = (px, py, i) => {
            if (py >= yp) return [px, py];
            const f = (yp - py) / (yp - (cy - ry)), kk = k * (1.15 + 0.5 * Math.sin(i * 2.4 + 1));
            return [px * (1 + 0.1 * k * f) + 0.05 * k * f * Math.sin(wob + i * 1.9), yp - (yp - py) * (1 + kk)];
        };
        const anchors = [];
        for (let i = 0; i < N; i++) {
            const a = -PI / 2 + ((i + 0.5) / N) * TAU, ca = Math.cos(a), sa = Math.sin(a);
            const r = Math.pow(Math.pow(Math.abs(ca) / rx, e) + Math.pow(Math.abs(sa) / ry, e), -1 / e);
            const y0 = Math.min(cy + sa * r, bot - 0.115), p = lift(ca * r, y0, i);
            anchors.push([p[0] + sw * ((bot - y0) / h), p[1]]);
        }
        g.save();
        g.translate(bx, by);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        g.translate(0, pose.headDy ?? 0);
        g.rotate(pose.headTilt ?? 0);
        const blob = bumps(anchors, 0.33, true, 8), dd = Dd(d);
        solidRound(g, blob, dd, (px, py) => ((cy - py) / Math.hypot(px, py - cy) > 0.5 ? P.hairTop : P.hairSide), P.hair, L, P.ink);
        const panel = [[-fx, fy], [fx, fy], [fx, bot - 0.1], [fx - 0.09, bot - 0.005], [-fx + 0.09, bot - 0.005], [-fx, bot - 0.1]];
        C.poly(g, panel, { fill: P.skin, ink: P.ink, lw: L });
        BandRhythm.face(g, P, L, pose, top);
        const win = bumps([[0.315, top + 0.7], [0.305, top + 0.55], [0.3, top + 0.4], [0.2, top + 0.3], [0.07, top + 0.29], [-0.07, top + 0.29], [-0.2, top + 0.3], [-0.3, top + 0.4], [-0.305, top + 0.55], [-0.315, top + 0.7]], 0.32, false, 7);
        C.poly(g, [[-0.34, top + 0.7], [-0.34, fy - 0.025], [0.34, fy - 0.025], [0.34, top + 0.7], ...win], { fill: P.hair, lw: 0 });
        C.poly(g, win, { ink: P.ink, lw: L, close: false });
        g.save();
        C.trace(g, blob);
        g.clip();
        g.strokeStyle = P.hairLine;
        g.lineWidth = L * 0.75;
        g.lineCap = 'round';
        const marks = [[-0.33, 0.0, 2.6], [-0.12, -0.045, 3.4], [0.1, -0.04, 2.2], [0.31, 0.02, 3.9], [-0.22, 0.135, 4.6], [0.0, 0.1, 2.9], [0.21, 0.13, 5.2],
            [-0.455, 0.2, 3.2], [-0.47, 0.42, 4.4], [-0.44, 0.63, 2.4], [0.45, 0.2, 5.6], [0.47, 0.42, 3.0], [0.44, 0.63, 4.9], [-0.375, 0.8, 3.6], [0.375, 0.8, 2.0],
            // more of them where the mass has stretched
            [-0.26, 0.06, 5.0], [0.03, 0.03, 4.2], [0.27, 0.07, 3.1], [-0.1, 0.165, 2.0], [0.12, 0.17, 4.0]];
        marks.forEach(([mx, my, a0], i) => {
            if (i >= 15 && k < 0.5) return;
            const [px, py] = lift(mx, top + my, i * 3 + 1), xx = px + sw * (1 - my / h);
            g.beginPath();
            g.arc(xx, py, 0.042, a0, a0 + 4.1);
            g.stroke();
        });
        g.restore();
        BandRhythm.shades(g, P, L, pose, top, fx, bot);
        g.restore();
    }

    // --- the cactus's flower -----------------------------------------------------------------------
    const CAC_H = Chorus1Props.CAC_H ?? 1.95, CAC_W = 0.42, FLOWER = [0.03, -CAC_H - 0.045], FLOWER_R = 0.185;
    // the cactus's foot on screen for a car at (x, y, s), and the frame its drawer works in
    const cactusFoot = (x, y, s) => seatAt(SEATS.driver, x, y, s);
    function inCactus(g, x, y, s, pose, fn) {
        const [fx, fy] = cactusFoot(x, y, s), q = pose.squash ?? 0;
        g.save();
        g.translate(fx, fy);
        g.scale(s, s);
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        g.lineJoin = 'round';
        fn(3.2 / s);
        g.restore();
    }
    // where the flower sits on the crown, on screen
    function flowerHome(x, y, s, pose) {
        const [fx, fy] = cactusFoot(x, y, s), q = pose.squash ?? 0, p = rot([FLOWER[0] * (1 + q), FLOWER[1] * (1 - q)], pose.lean ?? 0);
        return [fx + p[0] * s, fy + p[1] * s];
    }
    /** The flower alone: its middle at (x, y), s the car's scale, turned by ang, squashed like the cactus by q. */
    function flower(g, x, y, s, ang = 0, q = 0) {
        const L = 3.2 / s;
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        g.scale(s * (1 + q), s * (1 - q));
        for (let i = 0; i < 5; i++) {
            const a = -PI / 2 + (i / 5) * TAU;
            circ(g, Math.cos(a) * 0.085, Math.sin(a) * 0.07, 0.066, i % 2 ? K.magenta : K.pink, L * 0.75);
        }
        circ(g, 0, 0, 0.046, K.yellow, L * 0.7);
        g.restore();
    }
    /**
     * Draws fn (the ride, at x, y, s with the cactus posed by `pose`: squash and lean are read)
     * without the flower on the cactus's crown, and gives the crown its round top back.
     */
    function noFlower(g, x, y, s, pose, fn) {
        const [fx, fy] = cactusFoot(x, y, s), q = pose.squash ?? 0, m = new DOMMatrix().translateSelf(fx, fy).scaleSelf(s, s).rotateSelf(((pose.lean ?? 0) * 180) / PI).scaleSelf(1 + q, 1 - q);
        const ring = (r) => {
            const pts = [];
            for (let i = 0; i < 28; i++) {
                const a = (i / 28) * TAU, p = m.transformPoint({ x: FLOWER[0] + Math.cos(a) * r, y: FLOWER[1] + Math.sin(a) * r });
                pts.push([p.x, p.y]);
            }
            return pts;
        };
        except(g, (c) => {
            const pts = ring(FLOWER_R);
            c.moveTo(pts[0][0], pts[0][1]);
            for (const p of pts.slice(1)) c.lineTo(p[0], p[1]);
            c.closePath();
        }, fn);
        g.save();
        C.trace(g, ring(FLOWER_R + 0.012));
        g.clip();
        inCactus(g, x, y, s, pose, (L) => {
            const hw = CAC_W / 2, dd = Dd(0.2);
            for (const [ox, oy, col] of [[dd[0], dd[1], K.tealDeep], [0, 0, K.teal]]) {
                g.beginPath();
                g.roundRect(-hw + ox, -CAC_H + oy, CAC_W, CAC_H, [hw, hw, 0, 0]);
                g.fillStyle = col;
                g.fill();
                g.strokeStyle = K.ink;
                g.lineWidth = L;
                g.stroke();
            }
        });
        g.restore();
    }

    // --- the Devil's two mitts in the air -----------------------------------------------------------
    // Finale.ride's Devil keeps both mitts on the guitar; with `strum: NaN, fret: NaN` in his pose
    // neither arm is drawn (nor the strap's end), and this draws them: x, y, s his ground point
    // (Finale.hoodAt) and scale, pose the pose he was given, hR / hL the mitts in his units
    // (hR on screen left, the fretting one; hL the picking one). Needs Solo3Props (its devilWave).
    function devilMitts(g, x, y, s, pose, hR, hL) {
        if (!has3() || !Solo3Props.devilWave) return false;
        Solo3Props.devilFrame(g, x, y, s, pose, (L) => {
            const T = Devil.TORSO;
            Solo3Props.devilArm(g, L, [-(T.x + T.w - 0.03), T.y + 0.14], hR);
        });
        Solo3Props.devilWave(g, x, y, s, pose, hL);
        return true;
    }

    // =========================================================================================
    // Sky things
    // =========================================================================================
    /** A shooting star: from (x0, y0), dir ±1, len its run, u 0..1 its life (pass time / 0.42 on twos), k its size. */
    function shootingStar(g, x0, y0, dir, len, u, k = 1) {
        if (!(u >= 0) || u >= 1) return;
        const col = '#fffbe8', hx = x0 + dir * len * u, hy = y0 + len * 0.5 * u, tl = Math.min(u, 0.4) * len * (1 - u * 0.4);
        C.poly(g, [[hx, hy - 3.6 * k], [hx, hy + 3.6 * k], [hx - dir * tl, hy - tl * 0.5]], { fill: col, lw: 0 });
        C.sparkle(g, hx, hy, 17 * k * (1 - u * 0.5), { color: col });
    }

    // The Earth: a blue-and-green cel disc with white cloud, lit like the moon from the upper
    // left, turning slowly. No lettering. (x, y) its middle, r its radius, t film time.
    const EC = { sea: '#3f8cf0', seaLit: '#62a8f7', seaDark: '#2a62c8', land: '#35c46a', landD: '#1f9a50', cloud: '#fffdf4', cloudD: '#c9dcf5', ice: '#fffdf4', rim: '#8cefe6' };
    const LANDS = [
        [[-165, 62], [-150, 70], [-120, 72], [-95, 74], [-80, 68], [-62, 58], [-56, 50], [-70, 43], [-76, 35], [-81, 27], [-90, 29], [-97, 24], [-97, 17], [-88, 15], [-84, 10], [-79, 9], [-92, 16], [-106, 22], [-112, 30], [-123, 38], [-125, 48], [-135, 57], [-152, 58]],
        [[-79, 9], [-72, 11], [-62, 10], [-50, 1], [-36, -6], [-39, -16], [-48, -25], [-57, -36], [-65, -42], [-68, -52], [-73, -52], [-73, -38], [-71, -20], [-77, -12], [-81, -4]],
        [[-52, 62], [-42, 60], [-22, 70], [-20, 80], [-40, 83], [-58, 76]],
        [[-17, 15], [-10, 29], [-5, 35], [10, 37], [22, 32], [33, 30], [42, 12], [51, 11], [40, -3], [40, -16], [33, -27], [26, -34], [18, -34], [12, -18], [9, 2], [-8, 5]],
        [[-9, 37], [-9, 43], [-2, 48], [4, 52], [8, 56], [12, 56], [20, 60], [28, 70], [40, 66], [50, 56], [40, 47], [28, 41], [23, 37], [14, 40], [3, 42]],
    ];
    const CLOUDS = [[-118, 44, 26, 5], [-58, 24, 22, 4.5], [-96, -8, 30, 5], [-34, -38, 24, 5], [-150, 12, 20, 4], [6, 16, 22, 4.5], [-74, 58, 18, 4]];
    function earth(g, x, y, r, t = 0) {
        const lon0 = -84 + 2.2 * (t - 230), lw = Math.max(3.2, Math.min(5, r * 0.06));
        const proj = (lon, lat, lc = lon0) => {
            let dl = ((((lon - lc) % 360) + 540) % 360) - 180;
            dl = (clamp(dl, -90, 90) * PI) / 180;
            const la = (lat * PI) / 180;
            return [Math.cos(la) * Math.sin(dl) * r, -Math.sin(la) * r, Math.cos(dl)];
        };
        g.save();
        g.translate(x, y);
        g.lineJoin = 'round';
        circ(g, 0, 0, r, EC.sea);
        g.save();
        g.beginPath();
        g.arc(0, 0, r, 0, TAU);
        g.clip();
        g.save();
        g.rotate(-0.36); // its axis leans, as on a classroom globe
        // the land: a darker edge under each shape, as its shore
        for (const pass of [0, 1]) {
            for (const land of LANDS) {
                const pts = land.map(([lo, la]) => proj(lo, la));
                C.poly(g, pts.map(([px, py]) => [px + (pass ? 0 : r * 0.035), py + (pass ? 0 : r * 0.045)]), { fill: pass ? EC.land : EC.landD, lw: 0 });
            }
        }
        // the ice at the south
        g.fillStyle = EC.ice;
        g.beginPath();
        g.ellipse(0, r * 1.02, r * 0.52, r * 0.13, 0, 0, TAU);
        g.fill();
        g.beginPath();
        g.ellipse(-r * 0.08, -r * 1.02, r * 0.4, r * 0.09, 0, 0, TAU);
        g.fill();
        // cloud: flat white bands that drift a little faster than the ground
        for (const pass of [0, 1]) {
            g.fillStyle = pass ? EC.cloud : EC.cloudD;
            for (const [lo, la, w, hh] of CLOUDS) {
                const [px, py, c] = proj(lo, la, lon0 * 1.5 + 30);
                if (c < 0.2) continue;
                const rx = ((w * PI) / 180) * r * c * 0.9, ry = ((hh * PI) / 180) * r * 1.5;
                g.beginPath();
                g.ellipse(px + (pass ? 0 : r * 0.03), py + (pass ? 0 : r * 0.04), rx, ry, 0, 0, TAU);
                g.ellipse(px + rx * 0.5 + (pass ? 0 : r * 0.03), py - ry * 0.8 + (pass ? 0 : r * 0.04), rx * 0.55, ry * 0.9, 0, 0, TAU);
                g.fill();
            }
        }
        g.restore();
        // the side away from the light, and a lit rim towards it
        g.beginPath();
        g.rect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4);
        g.arc(-r * 0.16, -r * 0.14, r * 1.02, 0, TAU, true);
        g.fillStyle = 'rgba(24,26,110,0.42)';
        g.fill();
        g.beginPath();
        g.arc(0, 0, r * 0.9, PI * 1.02, PI * 1.5);
        g.strokeStyle = EC.rim;
        g.lineWidth = Math.max(1.6, r * 0.035);
        g.lineCap = 'round';
        g.stroke();
        g.restore();
        circ(g, 0, 0, r, null, lw);
        g.restore();
    }

    /**
     * A burst of moon dust that hangs: puffs leave (x, y) to both sides, grow and thin out
     * slowly; a pebble or two floats up. s the car's scale, k 0..1 its life, a the ground's turn,
     * part 'back' | 'front' | undefined for both, n how many puffs, dir −1 | 0 | 1 which way most go.
     */
    function dustBurst(g, x, y, s, k, o = {}) {
        k = clamp(k);
        if (k <= 0 || k >= 1) return;
        const r = Motion.rng('solo4-dust:' + (o.seed ?? 0)), L = 3.2 / s, d = C.drawing(o.t ?? 0), n = o.n ?? 5, far = [], near = [], stones = [];
        for (let i = 0; i < n; i++) {
            const dir = o.dir ? (r() < 0.75 ? o.dir : -o.dir) : r() < 0.5 ? -1 : 1, reach = 0.35 + 1.1 * r(), rise = 0.2 + 0.8 * r(), size = (0.24 + 0.24 * r()) * (o.size ?? 1), born = r() * 0.12, end = 0.7 + 0.3 * r(), nb = 5 + Math.floor(r() * 3), a0 = r() * TAU;
            const u = seg(k, born, end);
            if (u <= 0 || u >= 1) continue;
            const e = 1 - Math.pow(1 - u, 2.6), rad = size * Math.min(1, 0.45 + u * 3) * Math.pow(1 - u, 0.5) * (1 + 0.05 * (((d + i) % 2) * 2 - 1));
            (i % 2 ? near : far).push([dir * reach * e + (i % 2 ? -0.06 : 0.16), -rise * e - rad * 0.5 - (i % 2 ? 0 : 0.1), rad * (i % 2 ? 0.85 : 1.05), nb, a0 + 0.4 * (((d + i * 2) % 3) - 1)]);
        }
        for (let i = 0; i < 3; i++) {
            const vx = (r() - 0.5) * 1.8, vy = 0.6 + 1.2 * r(), sz = 0.028 + 0.028 * r(), u = seg(k, 0.02, 0.92);
            if (u > 0 && u < 1) stones.push([vx * u, -vy * (1 - Math.pow(1 - u, 1.6)) - 0.04, sz * Math.min(1, (1 - u) * 5)]);
        }
        g.save();
        g.translate(x, y);
        g.rotate(o.a ?? 0);
        g.scale(s, s);
        g.lineJoin = 'round';
        if (o.part !== 'front') {
            puffs(g, far, M.floor, L);
            for (const [px, py, sz] of stones.slice(0, 1)) circ(g, px + 0.2, py - 0.1, sz, M.rockSide, L * 0.7);
        }
        if (o.part !== 'back') {
            puffs(g, near, M.bright, L);
            for (const [px, py, sz] of stones.slice(1)) circ(g, px, py, sz, M.rock, L * 0.7);
        }
        g.restore();
    }

    // =========================================================================================
    // The whip and its pennant, off the car
    // =========================================================================================
    // On the car (rides.js) it leans back with the pennant behind it; planted in the moon
    // (Skyward.moon's flag) it leans the other way. bend −1 is the first, +1 the second.
    const WHIP_CAR = [[0, 0], [-0.07, -0.85], [-0.27, -1.7], [-0.63, -2.45]], WHIP_FLAG = [[0, 0.1], [0.03, -0.85], [0.2, -1.7], [0.5, -2.4]];
    const WHIP_BASE = [-4.29, SEATS.deckY - 0.1]; // its foot on the car, in the car's units
    const WHIP_CORE = '#a9b0c9';
    /** The whip alone: (x, y) its foot, s the scale, ang its turn, bend −1..1, t for the flutter on twos; core: only the glint down the rod. */
    function whip(g, x, y, s, ang = 0, bend = -1, t = 0, core = false) {
        const L = 3.2 / s, d = C.drawing(t), sw = [0, 0.05, -0.03][((d % 3) + 3) % 3], w = (bend + 1) / 2, sd = bend < 0 ? -1 : 1, ab = Math.abs(bend);
        const ctrl = WHIP_CAR.map((p, i) => [lerp(p[0], WHIP_FLAG[i][0], w) + sd * ab * sw * [0, 0, 0.4, 1][i], lerp(p[1], WHIP_FLAG[i][1], w)]);
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        const pts = C.curve(ctrl, false, 8), n = pts.length, pa = pts[n - 2], pb = pts[n - 7];
        if (!core) line(g, pts, L * 1.15);
        line(g, pts, L * 0.42, WHIP_CORE); // a glint down the rod: ink alone is lost against the black sky
        if (!core) {
            C.poly(g, [pa, [pa[0] + sd * Math.max(0.34, ab) * 0.52, lerp(pa[1], pb[1], 0.6) + sw * 1.4], pb], { fill: Rides.ROD.pennant, ink: K.ink, lw: L * 0.8 });
            circ(g, pts[n - 1][0], pts[n - 1][1], 0.045, '#f4f6fc', L * 0.7);
        }
        g.restore();
    }
    // the car's own whip, as a hole in the car's units (for a car drawn at (0, 0) with scale s)
    const WHIP_HOLE = (() => {
        const dk = SEATS.deckY;
        return [[-4.19, dk - 0.235], [-4.42, dk - 0.235], [-4.5, dk - 1.0], [-4.78, dk - 1.72], [-5.7, dk - 1.9], [-5.7, dk - 2.8], [-4.68, dk - 2.8], [-4.42, dk - 1.8], [-4.22, dk - 1.0]];
    })();
    /** Draws fn (the ride at (0, 0), scale s, at rest) without the whip on its tail. */
    function noWhip(g, s, fn) {
        except(g, (c) => {
            WHIP_HOLE.forEach(([px, py], i) => (i ? c.lineTo(px * s, py * s) : c.moveTo(px * s, py * s)));
            c.closePath();
        }, fn);
    }

    // =========================================================================================
    // The moon stage
    // =========================================================================================
    const CS = 56, LIMB = { x: 500, y: 1820, r: 1200 }, MOON_ROT = 0.3;
    const AXLE = 3.55, DCH = Math.sqrt(LIMB.r * LIMB.r - AXLE * CS * AXLE * CS); // the chord through the axles
    const A_CAR = Math.asin((480 - LIMB.x) / DCH);
    const REST = W.landingAt(LIMB, A_CAR, CS, 1);
    // a point of the surface: a (radians clockwise from the top), `in` towards the camera (down the frame)
    const onLimb = (a, near = 0) => ({ x: LIMB.x + Math.sin(a) * LIMB.r, y: LIMB.y - Math.cos(a) * LIMB.r + near, rot: a });
    const aOf = (x) => Math.asin((x - LIMB.x) / LIMB.r);
    // the car's ground point for an angle along the limb and a height above it (straight up the frame)
    const carAt = (a, h = 0) => ({ x: LIMB.x + Math.sin(a) * DCH, y: LIMB.y - Math.cos(a) * DCH - h, rot: a });
    // The flag is Skyward.moon's (the car's whip and pennant, planted just behind the limb so the
    // ground hides its foot), by the car's far headlamp; x, y its foot and rot its lean on screen.
    const FLAG_A = Math.asin((752 - LIMB.x) / (LIMB.r * 0.985));
    const FLAG = { a: FLAG_A, x: LIMB.x + Math.sin(FLAG_A) * LIMB.r * 0.985, y: LIMB.y - Math.cos(FLAG_A) * LIMB.r * 0.985, rot: FLAG_A * 0.55 + MOON_ROT * 0.45 };
    const EARTH = { x: 800, y: 380, r: 62 };
    // The company stands a little straighter than the ground's normal (half its lean), or the
    // ones at the frame's edges tip out of it. The top imp's hooves are on the other two's heads.
    const mark = (x, near = 0) => {
        const p = onLimb(aOf(x), near);
        return { x: p.x, y: p.y, rot: p.rot * 0.5 };
    };
    const STAND = { h1: mark(192), h2: mark(154), h3: mark(102), a0: mark(822, 28), a1: mark(868), a2: mark(912, 28) };
    STAND.h0 = (() => {
        const top = (m) => [m.x + Math.sin(m.rot) * 1.0 * 0.67 * CS, m.y - Math.cos(m.rot) * 1.0 * 0.67 * CS], p = top(STAND.h1), q = top(STAND.h2);
        return { x: (p[0] + q[0]) / 2, y: (p[1] + q[1]) / 2, rot: (STAND.h1.rot + STAND.h2.rot) / 2 };
    })();
    const HOOD = (() => {
        const p = rot([Finale.HOOD[0] * CS, Finale.HOOD[1] * CS], REST.rot);
        return [REST.x + p[0], REST.y + p[1]];
    })();
    const STAGE = { s: CS, limb: LIMB, moonRot: MOON_ROT, car: REST, carA: A_CAR, hood: HOOD, flag: FLAG, earth: EARTH, stand: STAND };

    // --- the landing's clock ---------------------------------------------------------------------
    // The car touches down for good on beat 660 and skids to rest on 665; Skyward.landing's k
    // follows the skid (so its tracks end under the wheels), then the dust goes on thinning.
    const T_DOWN = S.b(660), T_REST = S.b(665), K0 = 0.1, SLIDE0 = -W.landingSlide(K0); // the slide left at touchdown, in car units
    const slideAt = (t) => (t >= T_REST ? 0 : -SLIDE0 * Math.pow(1 - seg(t, T_DOWN, T_REST), 1.2));
    const kOfSlide = (sl) => 0.55 * (1 - Math.pow(clamp(-sl / 2.6), 1 / 2.2));
    const landK = (t) => (t < T_DOWN - 1e-6 ? 0 : t < T_REST ? kOfSlide(slideAt(t)) : 0.55 + 0.45 * (1 - Math.exp(-(t - T_REST) / 0.9)));
    const SPIN_REST = T_DOWN * 12 + (SLIDE0 / 0.56) * 0.6; // the wheels' angle at rest
    // the Earth rises over the limb from the cut (beat 652) and then only creeps
    const T_CUT = S.b(652);
    const earthAt = (t) => {
        const u = seg(t, T_CUT - 0.3, S.b(656.5)), e = 1 - Math.pow(1 - u, 2.2), c = 1 - Math.exp(-Math.max(0, t - T_CUT) / 6);
        return { x: lerp(EARTH.x + 44, EARTH.x + 5, e) - 5 * c, y: lerp(EARTH.y + 322, EARTH.y + 16, e) - 16 * c, r: EARTH.r };
    };

    function sky(g, t) {
        C.sunburst(g, LIMB.x, LIMB.y - 160, { n: 12, rot: 0.2 + t * 0.03, a: '#0e0b2c', b: '#130f3a', R: LIMB.y - 160 - 500 + 1000 }); // a radius that covers the frame
        const r = Motion.rng('solo4-stars'), d = C.drawing(t);
        for (let i = 0; i < 74; i++) {
            const x = r() * 1000, y = r() * 760, sz = 5 + r() * 9, ph = Math.floor(r() * 12), big = i % 9 === 0;
            C.sparkle(g, x, y, sz * ((d + ph) % 12 < 2 ? 1.5 : 1) * (big ? 1.6 : 1), { color: i % 5 ? '#fffbe8' : '#ffe62e' });
        }
    }
    function moonStage(g, t, o = {}) {
        const k = o.land ?? landK(t), lo = { r: LIMB.r, rot: REST.rot, t };
        if (o.part === 'front') {
            if (k > 0) W.landing(g, REST.x, REST.y, CS, k, { ...lo, part: 'front' });
            return;
        }
        sky(g, t);
        const e = o.earth === false ? null : o.earth ?? earthAt(t);
        if (e) earth(g, e.x, e.y, e.r, t);
        const fk = o.flag === undefined ? 1 : o.flag || 0;
        W.moon(g, LIMB.x, LIMB.y, LIMB.r, { rot: MOON_ROT, t, flag: fk > 0 ? { a: FLAG.a - MOON_ROT, s: CS, k: fk, t } : false });
        if (fk >= 1) {
            // a glint down the planted rod, as on the whip in the air: ink alone is lost against the sky
            g.save();
            g.beginPath();
            g.rect(-400, -400, 1800, 1800);
            g.arc(LIMB.x, LIMB.y, LIMB.r, 0, TAU);
            g.clip('evenodd');
            whip(g, FLAG.x, FLAG.y, CS, FLAG.rot, 1, t, true);
            g.restore();
        }
        if (k > 0) W.landing(g, REST.x, REST.y, CS, k, { ...lo, part: 'back' });
    }

    // draw fn with the origin on a point of the stage, turned to stand on it
    function onStage(g, p, fn) {
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.rot);
        fn();
        g.restore();
    }
    /** The ride at rest on the limb, playing, its whip gone (it is the flag), the Devil soloing with the neck up (solo 1, shred 0.6
     *  unless o.devil says otherwise). o: what Finale.ride takes; whip: true keeps the whip on the tail. */
    function parked(g, t, o = {}) {
        const { whip: keep, ...ro } = o, ride = () => Finale.ride(g, t, 0, 0, CS, { spin: SPIN_REST, shadow: true, exhaust: 0, ...ro, devil: ro.devil === false ? false : { solo: 1, shred: 0.6, ...(ro.devil ?? {}) } });
        onStage(g, REST, () => (keep ? ride() : noWhip(g, CS, ride)));
    }

    // --- the company ------------------------------------------------------------------------------
    const IMP = 0.67, WEAR = ['specs', 'bow', undefined], IDS = ['h3', 'h2', 'h1', 'h0', 'a1', 'a2', 'a0']; // back to front
    // the angels' poses on the ground at t: Solo3Props' own (playing on the beat), wings folded
    function angelPose(who, t) {
        const P = S.pulseAt(t), ph = P.k + P.since, p = P.pulse;
        const base = has3() ? Solo3Props.escortPoses(t)[who] : [
            { who: 0, mood: 'rock', harp: true, strum: Math.cos(ph * TAU), squash: 0.03 * p, headDy: 0.03 * p },
            { who: 1, mood: 'rock', trumpet: true, armUp: 0.35 + 0.65 * p, squash: 0.03 * p, headDy: 0.02 * p, lean: -0.2 },
            { who: 2, mood: 'rock', armUp: 0.4 + 0.6 * p, squash: 0.04 * p, headDy: 0.03 * p },
        ][who];
        return { ...base, flap: 0.15, bob: 0, shadow: true };
    }
    /** One of the company on its mark (or at o.at = { x, y, rot }): id 'h0' … 'h3', 'a0' … 'a2'. */
    function stander(g, id, t, o = {}) {
        const at = o.at ?? STAND[id], i = +id[1], P = S.pulseAt(t), p = P.pulse, ph = P.k + P.since, sq = o.squash ?? 0;
        onStage(g, at, () => {
            if (id[0] === 'a') W.angel(g, 0, 0, CS, { ...angelPose(i, t), ...(o.pose ?? {}), squash: (angelPose(i, t).squash ?? 0) + sq });
            else if (i === 3) {
                g.save();
                g.scale(1 + sq, 1 - sq);
                Inferno.fan(g, 0, 0, CS, { kind: 'skeleton', hawk: K.pink, tee: 2, hold: 'none', hype: 0.55, t, look: 1, ...(o.pose ?? {}) });
                g.restore();
            } else Devil.imp(g, 0, 0, CS * IMP, { wear: WEAR[i], mood: 'grin', look: 1, squash: 0.05 * p + sq, armUp: (P.k + i) % 2 ? 0.25 + 0.75 * p : 0.2, tail: 0.05 * Math.sin(ph * PI + i), ...(o.pose ?? {}) });
        });
    }
    function company(g, t, o = {}) {
        for (const id of IDS) if (!o.only || o.only.includes(id)) stander(g, id, t, { squash: o.squash?.[id] ?? 0 });
    }
    function moonScene(g, t, o = {}) {
        moonStage(g, t);
        parked(g, t, o.ride ?? {});
        company(g, t, o.company ?? {});
        moonStage(g, t, { part: 'front' });
    }

    return {
        STAGE, IDS, moonStage, parked, company, stander, moonScene, landK, earthAt, slideAt, kOfSlide, carAt, onLimb, onStage, angelPose, SPIN_REST, T_DOWN, T_REST, SLIDE0, K0,
        except, sticks, emptyMitts, STICKS, curls, flower, flowerHome, noFlower, cactusFoot, devilMitts, shootingStar, earth, dustBurst, whip, noWhip, WHIP_BASE, puffs, seatAt, has2, has3,
    };
})();
