// tide · style sand · style test: the child builds the castle, the wave takes it, noon footprints.
Motion.scene({
    fps: 24,
    duration: 8,
    logical: [1600, 900],
    uses: ['styles/sand/sand.js'],
    bpm: 60,
    shots: [[0, 8, 'Castle and wave']],

    setup(env) {
        return { table: Sand.table(env) };
    },

    draw(g, t, env) {
        const S = Sand, E = Ease;
        const d = env.state.table.begin();
        const tq = Math.floor(t * 12 + 1e-6) / 12; // drawings on twos

        // --- the beach, seen from the side: sky (bare glass), sea (thin sand), shore (thick)
        const HORIZON = 470, SHORE = 700;
        const shore = (seed, tt) => {
            // the wet edge breathes in and out, redrawn on twos like a hand would
            const pts = [[-60, 960], [-60, SHORE]];
            for (let x = -40; x <= 1660; x += 40) pts.push([x, SHORE + 6 * Math.sin(x * 0.01 + tt * 1.3) + 3 * Motion.noise1(seed, x * 0.02 + Math.floor(tt * 6))]);
            pts.push([1660, SHORE], [1660, 960]);
            return pts;
        };
        const beach = (d, tt, seaU = 1) => {
            // the sea: a thin layer, thicker toward the shore, a crisp horizon
            S.mass(d, [[-60, HORIZON], [1660, HORIZON], [1660, SHORE + 8], [-60, SHORE + 8]], { a: 0.3, soft: 1.5, raw: true });
            S.mass(d, [[-60, HORIZON + 90], [1660, HORIZON + 80], [1660, SHORE + 8], [-60, SHORE + 8]], { a: 0.22, soft: 20, raw: true });
            S.trickle(d, [[-60, HORIZON + 1], [1660, HORIZON - 1]], { w: 3, a: 0.6, raw: true });
            // the sea's lines: short strokes of a finger, broken, nearer ones longer and wider
            const rnd = Motion.rng('sealines');
            for (let i = 0; i < 7; i++) {
                const y = HORIZON + 16 + i * i * 4.2 + i * 12;
                let x = -80 + rnd() * 120;
                let j = 0;
                while (x < 1660) {
                    const len = (60 + i * 40) * (0.6 + rnd() * 0.9);
                    const pts = [];
                    for (let k = 0; k <= 6; k++) {
                        const xx = x + (len * k) / 6;
                        pts.push([xx, y + (1 + i * 0.6) * Math.sin(xx * 0.015 + i) - Math.sin((k / 6) * Math.PI) * (1.5 + i * 0.7)]);
                    }
                    S.finger(d, pts, { w: 1.6 + i * 0.55, rim: 0.25, seed: 'sl' + i + '-' + j });
                    x += len + 20 + rnd() * (90 - i * 6);
                    j++;
                }
            }
            // the beach: wet sand by the water (a middle layer, so people and footprints
            // read on it), thickening to near black in the foreground
            S.mass(d, shore('sh', tt), { a: 0.42, soft: 3, raw: true });
            S.mass(d, [[-60, SHORE + 150], [1660, SHORE + 140], [1660, 960], [-60, 960]], { a: 0.85, soft: 70, raw: true });
            // the palm's marks in the beach: short soft streaks, here and there
            const rb = Motion.rng('beachmarks');
            for (let i = 0; i < 16; i++) {
                const x = rb() * 1700 - 50, y = SHORE + 40 + rb() * 150, L = 120 + rb() * 220;
                S.striations(d, [x, y], [x + L, y + (rb() - 0.5) * 8], 18, 4, 'bm' + i, { a: 0.25, light: 0.6 });
            }
            // foam: a light line along the wet edge
            const foam = [];
            for (let x = -40; x <= 1660; x += 30) foam.push([x, SHORE + 10 + 6 * Math.sin(x * 0.01 + tt * 1.3) + 3 * Motion.noise1('fo', x * 0.02 + Math.floor(tt * 6))]);
            S.finger(d, foam, { w: 3, rim: 0, clean: 0.7, seed: 'foam' });
        };

        // --- the child: a crouched sand silhouette with the arm patting the castle
        const child = (d, tt) => {
            const x0 = 540, y0 = SHORE + 8;
            const pat = Math.abs(Math.sin(tt * Math.PI * 2)); // two pats a second
            const lean = 4 * pat;
            const hip = [x0 - 6, y0 - 38], knee = [x0 + 34, y0 - 66], foot = [x0 + 20, y0 - 4];
            const neck = [x0 + 30 + lean, y0 - 112], head = [x0 + 52 + lean, y0 - 140];
            const sh = [neck[0] + 4, neck[1] + 12];
            const hand = [x0 + 128, y0 - 54 - 26 * pat], elbow = [x0 + 88, y0 - 66 - 8 * pat];
            const hand2 = [x0 + 118, y0 - 30 - 12 * (1 - pat)], elbow2 = [x0 + 76, y0 - 52];
            S.trickle(d, [foot, knee], { w: 22, a: 0.95, raw: true });
            S.trickle(d, [hip, knee], { w: 26, a: 0.95, raw: true });
            S.trickle(d, [[x0 - 12, y0 - 8], [x0 - 2, y0 - 34]], { w: 18, a: 0.95, raw: true });
            S.mass(d, [[hip[0] - 22, hip[1] + 14], [hip[0] - 16, hip[1] - 26], [neck[0] - 18, neck[1] - 2], [neck[0] + 14, neck[1] - 4], [knee[0] - 4, knee[1] - 14], [hip[0] + 24, hip[1] + 18]], { a: 0.95, soft: 1.5 });
            S.trickle(d, [sh, elbow2, hand2], { w: 13, a: 0.9, raw: true });
            S.trickle(d, [sh, elbow, hand], { w: 14, a: 0.95, raw: true });
            S.heap(d, hand[0] + 3, hand[1], 9, { a: 0.95, grains: false });
            // the head, a tuft of hair, the nose; the eye pressed out with a fingertip
            S.mass(d, [[head[0] - 22, head[1] - 4], [head[0] - 10, head[1] - 24], [head[0] + 12, head[1] - 22], [head[0] + 24, head[1] - 4], [head[0] + 27, head[1] + 4], [head[0] + 20, head[1] + 16], [head[0] - 4, head[1] + 24], [head[0] - 20, head[1] + 14]], { a: 0.95, soft: 1 });
            // a sun hat: a crown and a soft brim, tipped forward
            S.mass(d, [[head[0] - 20, head[1] - 12], [head[0] - 16, head[1] - 30], [head[0] + 2, head[1] - 36], [head[0] + 18, head[1] - 28], [head[0] + 20, head[1] - 12]], { a: 0.95, soft: 1 });
            S.trickle(d, [[head[0] - 34, head[1] - 6], [head[0] - 10, head[1] - 14], [head[0] + 20, head[1] - 14], [head[0] + 40, head[1] - 4]], { w: 6, a: 0.95 });
            S.press(d, head[0] + 12, head[1] - 5, 1.8, { rim: 0 });
        };

        // --- the castle: poured heaps that rise, crenels and windows pressed out, a flag
        const castle = (d, tt) => {
            const cx = 760, base = SHORE + 6;
            const up = (a, b) => E.out(E.seg(tt, a, b));
            const ub = up(0.3, 1.0);
            if (ub > 0) S.heap(d, cx, base - 4, 125, { u: ub, squash: 0.22, a: 0.8, seed: 'cb' });
            const tower = (x, w, h, u, seed) => {
                if (u <= 0) return;
                // poured as a mound, then patted into a tower: the top flattens and the
                // sides straighten as it rises
                const hh = h * u;
                const dome = (1 - u) * w * 0.7 + 3;
                const flare = (1 - u) * w * 0.45;
                const top = base - 18 - hh;
                const pts = [[x - w / 2 - flare, base - 16], [x - w / 2 + 3, top + dome * 0.6]];
                for (let k = 1; k < 8; k++) {
                    const a = k / 8;
                    pts.push([x - w / 2 + 3 + (w - 6) * a, top + dome * (1 - Math.sin(a * Math.PI)) * 0.6 - (u < 1 ? dome * 0.4 * Math.sin(a * Math.PI) : 0)]);
                }
                pts.push([x + w / 2 - 3, top + dome * 0.6], [x + w / 2 + flare, base - 16]);
                S.mass(d, pts, { a: 0.96, soft: 1.5 });
                if (u < 1) S.grains(d, x, top + 6, w * 0.9, 26, seed + Math.floor(tt * 12), { inner: w * 0.4, a: 0.85 });
                return base - 18 - hh;
            };
            const tl = tower(cx - 70, 44, 110, up(1.0, 1.7), 'tl');
            const tr = tower(cx + 72, 44, 96, up(1.5, 2.2), 'tr');
            const tk = tower(cx, 64, 160, up(2.0, 2.9), 'tk');
            // crenels: three fingertips into the top of each tower
            const cren = E.seg(tt, 2.9, 3.3);
            [[cx - 70, tl, 44], [cx + 72, tr, 44], [cx, tk, 64]].forEach(([x, top, w], j) => {
                if (top == null) return;
                // merlons: the top is cut into teeth, the notches scraped out one by one
                const slots = w > 50 ? 7 : 5;
                const sw = w / slots;
                for (let i = 1; i < slots; i += 2) {
                    if (cren * 9 < j * 3 + i / 2) continue;
                    const xl = x - w / 2 + i * sw;
                    S.clear(d, [[xl, top - 12], [xl + sw, top - 12], [xl + sw * 0.9, top + 10], [xl + sw * 0.1, top + 10]], { raw: true, soft: 0.8 });
                }
            });
            // windows and the gate
            if (tt > 3.0) {
                S.press(d, cx - 70, (tl ?? base) + 40, 5, { squash: 1.6, rim: 0.25 });
                S.press(d, cx + 72, (tr ?? base) + 36, 5, { squash: 1.6, rim: 0.25 });
                S.press(d, cx, base - 40, 14, { squash: 1.4, rim: 0.3 });
            }
            // the flag: a stick of sand and a pennant
            const uf = E.inOut(E.seg(tt, 3.2, 3.6));
            if (uf > 0 && tk != null) {
                S.trickle(d, [[cx, tk - 2], [cx, tk - 2 - 50 * uf]], { w: 3.5, a: 0.95, raw: true });
                if (uf >= 1) {
                    const fl = Math.sin(tq * 9) * 4;
                    S.mass(d, [[cx + 1, tk - 52], [cx + 34, tk - 44 + fl], [cx + 1, tk - 34]], { a: 0.95, raw: true, soft: 1 });
                }
            }
        };

        // --- a gull drawn by a finger of sand, redrawn on twos as it crosses
        const gull = (d, tt) => {
            const u = E.seg(tt, 0.4, 3.6);
            if (u <= 0 || u >= 1) return;
            const x = 1500 - u * 1200, y = 230 + 30 * Math.sin(u * 5);
            const flap = Math.sin(tt * 9);
            const tip = 24 * flap, el = 9 * flap;
            // body, then each wing as a mass: thick at the shoulder, a pointed tip
            S.mass(d, [[x - 14, y + 2], [x - 4, y - 4], [x + 16, y - 3], [x + 24, y + 1], [x + 8, y + 5]], { a: 0.95, soft: 0.8 });
            for (const sd of [-1, 1]) {
                S.mass(d, [[x - 2, y - 2], [x + sd * 22, y - 8 - el], [x + sd * 50, y - tip], [x + sd * 26, y - 2 - el * 0.6], [x + 4, y + 3]], { a: 0.95, soft: 0.8 });
            }
        };

        // --- people walking: a sand silhouette with a walk cycle, redrawn on twos
        // f: facing (+1 right, -1 left), ph: walk phase (radians, one step per π),
        // amp: 0 standing .. 1 walking, reach: 0..1 the front arm reaching to (rx, ry)
        const walker = (d, x, yf, h, f, ph, amp, o = {}) => {
            const bob = -Math.abs(Math.sin(ph)) * 0.018 * h * amp;
            const hip = [x, yf - 0.5 * h + bob];
            const neck = [x + f * 0.025 * h, yf - 0.83 * h + bob];
            const leg = (p) => {
                const a = 0.42 * Math.sin(p) * amp;
                const bend = amp * Math.max(0, Math.cos(p)) * 0.55;
                const knee = [hip[0] + f * Math.sin(a) * 0.26 * h, hip[1] + Math.cos(a) * 0.26 * h];
                const foot = [knee[0] + f * Math.sin(a - bend) * 0.25 * h, knee[1] + Math.cos(a - bend) * 0.25 * h];
                const toe = [foot[0] + f * 0.07 * h, foot[1] + 0.005 * h];
                S.trickle(d, [hip, knee, foot], { w: 0.075 * h, a: 0.96, raw: true });
                S.trickle(d, [[foot[0] - f * 0.01 * h, foot[1]], toe], { w: 0.035 * h, a: 0.96, raw: true });
            };
            const sh = [neck[0], neck[1] + 0.05 * h];
            const arm = (p, front) => {
                const b = -0.38 * Math.sin(p) * amp;
                let elbow = [sh[0] + f * Math.sin(b) * 0.18 * h, sh[1] + Math.cos(b) * 0.18 * h];
                let hand = [elbow[0] + f * Math.sin(b + 0.35) * 0.17 * h, elbow[1] + Math.cos(b + 0.35) * 0.17 * h];
                if (front && o.reach > 0) {
                    const r = o.reach;
                    const hx = E.lerp(hand[0], o.rx, r), hy = E.lerp(hand[1], o.ry, r);
                    hand = [hx, hy];
                    elbow = [E.lerp(elbow[0], (sh[0] + hx) / 2, r), E.lerp(elbow[1], (sh[1] + hy) / 2 + 0.03 * h, r)];
                }
                S.trickle(d, [sh, elbow, hand], { w: 0.05 * h, a: 0.96, raw: true });
                S.heap(d, hand[0], hand[1] + 0.01 * h, 0.028 * h, { a: 0.96, grains: false });
            };
            arm(ph + Math.PI, false);
            leg(ph + Math.PI);
            // the torso: shoulders a little wider than the hips
            S.mass(d, [[hip[0] - 0.08 * h, hip[1] + 0.03 * h], [neck[0] - 0.095 * h, neck[1] + 0.07 * h], [neck[0] - 0.035 * h, neck[1]], [neck[0] + 0.045 * h, neck[1]], [neck[0] + 0.095 * h, neck[1] + 0.07 * h], [hip[0] + 0.08 * h, hip[1] + 0.03 * h]], { a: 0.96, soft: 1 });
            leg(ph);
            if (o.hair === 'long') {
                // a summer dress: flares from the waist to the knee and sways with the step
                const sway = Math.sin(ph * 2) * 0.012 * h * amp;
                S.mass(d, [[hip[0] - 0.07 * h, hip[1] - 0.1 * h], [hip[0] + 0.07 * h, hip[1] - 0.1 * h], [hip[0] + 0.15 * h - sway, hip[1] + 0.25 * h], [hip[0] - 0.15 * h - sway, hip[1] + 0.25 * h]], { a: 0.96, soft: 1 });
            }
            arm(ph, true);
            // the head: a nose and a chin toward where it faces
            const hc = [neck[0] + f * 0.015 * h, neck[1] - 0.075 * h], r = 0.062 * h;
            S.mass(d, [[hc[0] - f * r, hc[1] - 0.2 * r], [hc[0] - f * 0.6 * r, hc[1] - r], [hc[0] + f * 0.4 * r, hc[1] - r], [hc[0] + f * 0.95 * r, hc[1] - 0.3 * r], [hc[0] + f * 1.25 * r, hc[1] + 0.15 * r], [hc[0] + f * 0.95 * r, hc[1] + 0.45 * r], [hc[0] + f * 0.6 * r, hc[1] + 0.95 * r], [hc[0] - f * 0.5 * r, hc[1] + 0.9 * r]], { a: 0.96, soft: 0.8 });
            if (o.hair === 'long') {
                // long hair down the back, lifting a little with the walk
                const sw = Math.sin(ph * 2) * 0.01 * h * amp;
                S.mass(d, [[hc[0] + f * 0.3 * r, hc[1] - 1.05 * r], [hc[0] - f * 1.15 * r, hc[1] - 0.6 * r], [hc[0] - f * (1.5 * r + 0.02 * h * amp) - sw, hc[1] + 2.4 * r], [hc[0] - f * 0.6 * r, hc[1] + 2.6 * r], [hc[0] - f * 0.3 * r, hc[1] + 0.6 * r]], { a: 0.96, soft: 1 });
            } else {
                S.mass(d, [[hc[0] + f * 0.6 * r, hc[1] - 0.95 * r], [hc[0] - f * 0.5 * r, hc[1] - 1.2 * r], [hc[0] - f * 1.15 * r, hc[1] - 0.2 * r], [hc[0] - f * 0.6 * r, hc[1] + 0.2 * r]], { a: 0.96, soft: 1 });
            }
        };

        // --- noon: two young people walk in along the wet sand, leaving footprints, and
        // meet in the middle; their hands join
        const pair = (d, tt) => {
            const go = (x0, x1, t0, t1, yf, h, f, hair, other) => {
                const u = E.seg(tt, t0, t1);
                const ue = u < 0.8 ? u / 0.9 : 0.8 / 0.9 + (1 - 0.8 / 0.9) * E.out((u - 0.8) / 0.2);
                const x = E.lerp(x0, x1, ue);
                const stride = 0.55 * h;
                const ph = ((x - x0) * f / stride) * Math.PI * f;
                const amp = 1 - E.inOut(E.seg(tt, t1 - 0.25, t1 + 0.2));
                // footprints where each foot was planted, behind the walker
                const n = Math.floor(Math.abs(x - x0) / stride * 2);
                for (let k = 0; k < n; k++) {
                    const fx = x0 + f * (k + 0.5) * stride / 2;
                    const fy = yf + 2 + (k % 2 ? 4 : -3);
                    S.press(d, fx + f * 5, fy, 11, { squash: 0.36, rim: 0.5 });
                    S.press(d, fx - f * 12, fy, 7, { squash: 0.45, rim: 0.45 });
                }
                const reach = E.inOut(E.seg(tt, t1, t1 + 0.6));
                walker(d, x, yf, h, f, Math.abs(ph), amp, { hair, reach, rx: other - f * 0.0, ry: yf - 0.43 * h });
                return x;
            };
            go(120, 735, 5.15, 7.1, 772, 228, 1, 'long', 790);
            go(1480, 845, 4.4, 7.0, 776, 240, -1, 'short', 790);
        };

        // --- the wave: a crest of sand rolls across the table from the right and takes
        // the picture with it; behind it the next one is already there
        const crest = (d, X, tt) => {
            const di = Math.floor(tt * 12);
            const jit = (k, a) => a * Motion.noise1('cr' + k, di * 0.7);
            const face = [[0, 960], [-6, 880], [-22, 800], [-55, 720], [-105, 640], [-165, 570], [-225, 510], [-275, 460], [-300, 420]]
                .map(([x, y], k) => [X + x + jit(k, 6), y]);
            const lip = [[-318, 395], [-336, 410], [-346, 440], [-338, 470], [-322, 486], [-306, 474], [-298, 452]].map(([x, y], k) => [X + x + jit(k + 20, 5), y + jit(k + 40, 4)]);
            const back = [[-262, 372], [-205, 356], [-130, 362], [-40, 392], [70, 440], [200, 495], [360, 535], [560, 548], [800, 548], [1000, 545]].map(([x, y], k) => [X + x, y + jit(k + 60, 5)]);
            // the body: dense by the face, thinning down the back into the sea
            const g = d.createLinearGradient(X, 0, X + 1000, 0);
            g.addColorStop(0, 'rgba(255,255,255,0.6)');
            g.addColorStop(0.45, 'rgba(255,255,255,0.35)');
            g.addColorStop(1, 'rgba(255,255,255,0)');
            d.save();
            d.filter = `blur(${(14 * d.getTransform().a).toFixed(1)}px)`;
            d.fillStyle = g;
            S.trace(d, [...face, ...lip.slice().reverse(), ...back, [X + 1000, 960]], true);
            d.fill();
            d.restore();
            const near = [...face, ...lip.slice().reverse(), [X - 262, 372], [X - 150, 360], [X - 30, 400], [X + 90, 470], [X + 150, 600], [X + 180, 960]];
            S.mass(d, near, { a: 0.9, soft: 10 });
            // the curl's hollow, lighter under the lip
            S.clear(d, [[X - 300, 470], [X - 270, 492], [X - 235, 540], [X - 250, 580], [X - 290, 530]], { a: 0.55, soft: 12 });
            // the water's lines, raked along the face
            const rw = Motion.rng('wl');
            for (let k = 1; k <= 7; k++) {
                const off = k * 26 + rw() * 12;
                const a0 = Math.floor(rw() * 3), a1 = 5 + Math.floor(rw() * 4);
                const pts = face.slice(a0, a1).map(([x, y]) => [x + off + k * k * 2, y + k * 5]);
                S.finger(d, pts, { w: 1.5 + rw() * 2.2, rim: 0.2, clean: 0.9 - k * 0.07, seed: 'wl' + k + di });
            }
            // foam: grains thrown off the lip, a spray along the face, a heap at the foot
            S.grains(d, X - 330, 420, 80, 140, 'spray' + di, { inner: 14, a: 0.9 });
            for (let k = 2; k < 8; k++) S.grains(d, face[k][0] - 18, face[k][1], 26, 14, 'fs' + k + di, { inner: 6, a: 0.85 });
            S.heap(d, X - 30, 950, 70, { a: 0.9, squash: 0.5, seed: 'fb' + di });
        };

        const morning = (d) => {
            beach(d, tq, 1);
            castle(d, tq);
            child(d, tq);
            gull(d, tq);
        };
        const noon = (d) => {
            beach(d, tq, 1);
            pair(d, tq);
        };
        const uw = E.seg(t, 3.7, 5.6);
        if (uw <= 0) morning(d);
        else if (uw >= 1) noon(d);
        else {
            const X = E.lerp(1960, -960, E.inOut(uw) * 0.4 + uw * 0.6);
            // the face divides the two pictures: the old one ahead of it, the new behind
            const cut = [[X, 1000], [X, 960], [X - 6, 880], [X - 22, 800], [X - 55, 720], [X - 105, 640], [X - 165, 570], [X - 225, 510], [X - 300, 420], [X - 340, 380], [X - 340, -50]];
            d.save();
            S.trace(d, [...cut, [-200, -50], [-200, 1000]], true);
            d.clip();
            morning(d);
            d.restore();
            d.save();
            S.trace(d, [...cut, [2000, -50], [2000, 1000]], true);
            d.clip();
            noon(d);
            d.restore();
            crest(d, X, tq);
        }
        env.state.light = S.mixLight(S.LIGHT.morning, S.LIGHT.noon, E.inOut(E.seg(t, 4.2, 6.5)));
    },

    post(ctx, t, env) {
        env.state.table.show(ctx, { light: env.state.light });
    },
});
