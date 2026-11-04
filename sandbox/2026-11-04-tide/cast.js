// tide · the cast and the set, drawn in sand. Global: Cast.
// Every drawer paints AMOUNT OF SAND into the table's canvas `d` (logical units).
// Figures face right; pass f = -1 to mirror them about their own x.
const Cast = (() => {
    const S = Sand, E = Ease;
    const HORIZON = 470, SHORE = 700;
    const mirror = (d, x, f, fn) => {
        if (f >= 0) return fn();
        d.save();
        d.translate(x, 0);
        d.scale(-1, 1);
        d.translate(-x, 0);
        fn();
        d.restore();
    };

    // --- the set ------------------------------------------------------------------------
    const shoreLine = (seed, tt) => {
        // the wet edge breathes in and out, redrawn on twos like a hand would
        const pts = [[-60, 960], [-60, SHORE]];
        for (let x = -40; x <= 1660; x += 40) pts.push([x, SHORE + 6 * Math.sin(x * 0.01 + tt * 1.3) + 3 * Motion.noise1(seed, x * 0.02 + Math.floor(tt * 6))]);
        pts.push([1660, SHORE], [1660, 960]);
        return pts;
    };
    // o.sea: how far the sea has been laid (0..1, left to right); o.shore: the beach
    // poured from the middle out (0..1); o.lines: the finger's lines drawn in (0..1)
    function beach(d, tt, o = {}) {
        const sea = o.sea ?? 1, sh = o.shore ?? 1, ln = o.lines ?? 1;
        if (sea > 0) {
            const rx = -60 + 1720 * sea;
            S.mass(d, [[-60, HORIZON], [1660, HORIZON], [1660, SHORE + 8], [-60, SHORE + 8]], { a: 0.3, soft: 1.5, raw: true });
            S.mass(d, [[-60, HORIZON + 90], [1660, HORIZON + 80], [1660, SHORE + 8], [-60, SHORE + 8]], { a: 0.22, soft: 20, raw: true });
            // the sea not yet laid: wiped back off with a soft, wavering edge
            if (sea < 1) fade(d, rx, 1, [HORIZON - 20, SHORE + 20], 'sea' + Math.floor(tt * 12));
            // the trickle that lays the horizon, ahead of the sea
            S.trickle(d, [[-60, HORIZON + 1], [1660, HORIZON - 1]], { w: 3, a: 0.6, raw: true, prog: Math.min(1, sea * 1.08) });
        }
        // the sea's lines: short strokes of a finger, broken, nearer ones longer and wider
        if (ln > 0) {
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
                    // drawn row by row from the horizon down, each stroke left to right
                    const p = (ln * 9 - i - (x + 80) / 1740 * 2) / 1.2;
                    if (p > 0) S.finger(d, pts, { w: 1.6 + i * 0.55, rim: 0.25, seed: 'sl' + i + '-' + j, prog: Math.min(1, p) });
                    x += len + 20 + rnd() * (90 - i * 6);
                    j++;
                }
            }
        }
        if (sh > 0) {
            // the beach: wet sand by the water (a middle layer, so people and footprints
            // read on it), thickening to near black in the foreground
            const hw = 900 * sh;
            d.save();
            S.mass(d, shoreLine('sh', tt), { a: 0.42, soft: 3, raw: true });
            S.mass(d, [[-60, SHORE + 150], [1660, SHORE + 140], [1660, 960], [-60, 960]], { a: 0.85, soft: 70, raw: true });
            const rb = Motion.rng('beachmarks');
            for (let i = 0; i < 16; i++) {
                const x = rb() * 1700 - 50, y = SHORE + 40 + rb() * 150, L = 120 + rb() * 220;
                S.striations(d, [x, y], [x + L, y + (rb() - 0.5) * 8], 18, 4, 'bm' + i, { a: 0.25, light: 0.6 });
            }
            const foam = [];
            for (let x = -40; x <= 1660; x += 30) foam.push([x, SHORE + 10 + 6 * Math.sin(x * 0.01 + tt * 1.3) + 3 * Motion.noise1('fo', x * 0.02 + Math.floor(tt * 6))]);
            S.finger(d, foam, { w: 3, rim: 0, clean: 0.7, seed: 'foam' });
            d.restore();
            if (sh < 1) {
                fade(d, 800 + hw, 1, [SHORE - 30, 1000], 'bR' + Math.floor(tt * 12));
                fade(d, 800 - hw, -1, [SHORE - 30, 1000], 'bL' + Math.floor(tt * 12));
            }
            // the edge of the pour, grains rolling off it
            if (sh < 1) {
                S.heap(d, 800 - hw, SHORE + 90, 70, { a: 0.8, squash: 1.4, seed: 'pl' + Math.floor(tt * 12) });
                S.heap(d, 800 + hw, SHORE + 90, 70, { a: 0.8, squash: 1.4, seed: 'pr' + Math.floor(tt * 12) });
            }
        }
    }

    // Wipe the sand back beyond x (side +1: to the right of it) over a band of y, with a
    // soft, wavering edge and loose grains left on it.
    function fade(d, x, side, [y0, y1], seed) {
        const pts = [];
        for (let y = y0; y <= y1; y += 20) pts.push([x + side * 18 * Motion.noise1(seed.replace(/\d+$/, ''), y * 0.02), y]);
        d.save();
        d.globalCompositeOperation = 'destination-out';
        d.filter = `blur(${(16 * d.getTransform().a).toFixed(1)}px)`;
        d.fillStyle = '#fff';
        S.trace(d, [...pts, [x + side * 2000, y1], [x + side * 2000, y0]], true);
        d.fill();
        d.restore();
        S.grains(d, x + side * 10, (y0 + y1) / 2, (y1 - y0) / 2, 90, seed, { a: 0.85, squash: 1 });
    }

    // --- the kid: crouched, building, in the sun hat that passes down the family ------------
    // pat: 0..1 the patting hand's height; s: scale
    function kid(d, x0, y0, f, pat, s = 1) {
        mirror(d, x0, f, () => {
            d.save();
            d.translate(x0, y0);
            d.scale(s, s);
            d.translate(-x0, -y0);
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
            S.mass(d, [[head[0] - 22, head[1] - 4], [head[0] - 10, head[1] - 24], [head[0] + 12, head[1] - 22], [head[0] + 24, head[1] - 4], [head[0] + 27, head[1] + 4], [head[0] + 20, head[1] + 16], [head[0] - 4, head[1] + 24], [head[0] - 20, head[1] + 14]], { a: 0.95, soft: 1 });
            // the sun hat: a crown and a soft brim, tipped forward
            S.mass(d, [[head[0] - 20, head[1] - 12], [head[0] - 16, head[1] - 30], [head[0] + 2, head[1] - 36], [head[0] + 18, head[1] - 28], [head[0] + 20, head[1] - 12]], { a: 0.95, soft: 1 });
            S.trickle(d, [[head[0] - 34, head[1] - 6], [head[0] - 10, head[1] - 14], [head[0] + 20, head[1] - 14], [head[0] + 40, head[1] - 4]], { w: 6, a: 0.95 });
            S.press(d, head[0] + 12, head[1] - 5, 1.8, { rim: 0 });
            d.restore();
        });
    }

    // --- grown-ups ------------------------------------------------------------------------
    const headAt = (d, hc, r, f, hair, o = {}) => {
        S.mass(d, [[hc[0] - f * r, hc[1] - 0.2 * r], [hc[0] - f * 0.6 * r, hc[1] - r], [hc[0] + f * 0.4 * r, hc[1] - r], [hc[0] + f * 0.95 * r, hc[1] - 0.3 * r], [hc[0] + f * 1.25 * r, hc[1] + 0.15 * r], [hc[0] + f * 0.95 * r, hc[1] + 0.45 * r], [hc[0] + f * 0.6 * r, hc[1] + 0.95 * r], [hc[0] - f * 0.5 * r, hc[1] + 0.9 * r]], { a: 0.96, soft: 0.8 });
        const sw = o.sway ?? 0;
        if (hair === 'long') {
            S.mass(d, [[hc[0] + f * 0.3 * r, hc[1] - 1.05 * r], [hc[0] - f * 1.15 * r, hc[1] - 0.6 * r], [hc[0] - f * (1.5 * r) - sw, hc[1] + 2.4 * r], [hc[0] - f * 0.6 * r, hc[1] + 2.6 * r], [hc[0] - f * 0.3 * r, hc[1] + 0.6 * r]], { a: 0.96, soft: 1 });
        } else if (hair === 'bun') {
            // grey hair pulled back into a bun
            S.mass(d, [[hc[0] + f * 0.5 * r, hc[1] - 1.0 * r], [hc[0] - f * 0.6 * r, hc[1] - 1.15 * r], [hc[0] - f * 1.1 * r, hc[1] - 0.3 * r], [hc[0] - f * 0.6 * r, hc[1] + 0.1 * r]], { a: 0.96, soft: 1 });
            S.heap(d, hc[0] - f * 1.2 * r, hc[1] - 0.75 * r, 0.55 * r, { a: 0.97, grains: false });
        } else {
            S.mass(d, [[hc[0] + f * 0.6 * r, hc[1] - 0.95 * r], [hc[0] - f * 0.5 * r, hc[1] - 1.2 * r], [hc[0] - f * 1.15 * r, hc[1] - 0.2 * r], [hc[0] - f * 0.6 * r, hc[1] + 0.2 * r]], { a: 0.96, soft: 1 });
        }
    };

    // A person walking. ph: walk phase (one step per π), amp: 0 standing .. 1 walking,
    // o.reach (0..1): the front arm reaches to (o.rx, o.ry)
    function walker(d, x, yf, h, f, ph, amp, o = {}) {
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
        S.mass(d, [[hip[0] - 0.08 * h, hip[1] + 0.03 * h], [neck[0] - 0.095 * h, neck[1] + 0.07 * h], [neck[0] - 0.035 * h, neck[1]], [neck[0] + 0.045 * h, neck[1]], [neck[0] + 0.095 * h, neck[1] + 0.07 * h], [hip[0] + 0.08 * h, hip[1] + 0.03 * h]], { a: 0.96, soft: 1 });
        leg(ph);
        if (o.hair === 'long') {
            // a summer dress: flares from the waist to the knee and sways with the step
            const sway = Math.sin(ph * 2) * 0.012 * h * amp;
            S.mass(d, [[hip[0] - 0.07 * h, hip[1] - 0.1 * h], [hip[0] + 0.07 * h, hip[1] - 0.1 * h], [hip[0] + 0.15 * h - sway, hip[1] + 0.25 * h], [hip[0] - 0.15 * h - sway, hip[1] + 0.25 * h]], { a: 0.96, soft: 1 });
        }
        arm(ph, true);
        headAt(d, [neck[0] + f * 0.015 * h, neck[1] - 0.075 * h], 0.062 * h, f, o.hair, { sway: Math.sin(ph * 2) * 0.01 * h * amp });
    }

    // The same woman, grown: kneeling on her heels, both hands at the castle.
    // pat: 0..1 the near hand's height
    function kneel(d, x, yf, h, f, pat) {
        mirror(d, x, f, () => {
            const knee = [x + 0.13 * h, yf - 0.035 * h], foot = [x - 0.15 * h, yf - 0.02 * h];
            const hip = [x - 0.08 * h, yf - 0.19 * h];
            const neck = [x + 0.06 * h, yf - 0.49 * h], sh = [neck[0], neck[1] + 0.05 * h];
            const arm = (hand, w) => {
                const elbow = [(sh[0] + hand[0]) / 2 + 0.01 * h, (sh[1] + hand[1]) / 2 + 0.06 * h];
                S.trickle(d, [sh, elbow, hand], { w: w * h, a: 0.96, raw: true });
                S.heap(d, hand[0], hand[1], 0.028 * h, { a: 0.96, grains: false });
            };
            arm([x + 0.36 * h, yf - 0.1 * h - 0.04 * h * (1 - pat)], 0.046);
            S.trickle(d, [foot, knee], { w: 0.07 * h, a: 0.96, raw: true });
            S.trickle(d, [hip, knee], { w: 0.09 * h, a: 0.96, raw: true });
            S.mass(d, [[hip[0] - 0.08 * h, hip[1] + 0.05 * h], [neck[0] - 0.1 * h, neck[1] + 0.07 * h], [neck[0] - 0.03 * h, neck[1]], [neck[0] + 0.05 * h, neck[1]], [neck[0] + 0.1 * h, neck[1] + 0.08 * h], [hip[0] + 0.1 * h, hip[1] + 0.02 * h]], { a: 0.96, soft: 1 });
            // the dress, spread over the knees
            S.mass(d, [[hip[0] - 0.1 * h, hip[1] - 0.05 * h], [hip[0] + 0.1 * h, hip[1] - 0.12 * h], [knee[0] + 0.05 * h, knee[1] - 0.02 * h], [knee[0] + 0.03 * h, yf], [foot[0] - 0.03 * h, yf]], { a: 0.96, soft: 1 });
            arm([x + 0.34 * h, yf - 0.16 * h - 0.09 * h * pat], 0.05);
            headAt(d, [neck[0] + 0.03 * h, neck[1] - 0.07 * h], 0.062 * h, 1, 'long');
        });
    }

    // The same woman, old: sitting on the sand, legs out, her back rounded, a stick at
    // her side. wave: 0..1 the free hand lifted.
    function old(d, x, yf, h, f, wave, part = 'all') {
        mirror(d, x, f, () => {
            const hip = [x, yf - 0.07 * h], knee = [x + 0.2 * h, yf - 0.12 * h], foot = [x + 0.39 * h, yf - 0.03 * h];
            const mid = [x + 0.03 * h, yf - 0.25 * h], neck = [x + 0.11 * h, yf - 0.38 * h], sh = [neck[0] - 0.01 * h, neck[1] + 0.05 * h];
            // the stick, planted in the sand by her
            const stick = [x + 0.3 * h, yf + 0.01 * h], top = [x + 0.27 * h, yf - 0.38 * h];
            if (part !== 'body') {
                S.trickle(d, [stick, top], { w: 0.022 * h, a: 0.96, raw: true });
                S.trickle(d, [top, [top[0] - 0.04 * h, top[1] - 0.01 * h]], { w: 0.022 * h, a: 0.96, raw: true });
            }
            if (part === 'stick') return;
            S.trickle(d, [hip, knee, foot], { w: 0.085 * h, a: 0.96, raw: true });
            S.trickle(d, [foot, [foot[0] + 0.06 * h, foot[1] - 0.03 * h]], { w: 0.04 * h, a: 0.96, raw: true });
            // body and a shawl over the rounded back
            // a slim rounded back under a shawl
            S.trickle(d, [hip, mid, neck], { w: 0.12 * h, a: 0.96, raw: true });
            S.mass(d, [[mid[0] - 0.07 * h, mid[1] + 0.04 * h], [neck[0] - 0.09 * h, neck[1] + 0.03 * h], [neck[0], neck[1] - 0.01 * h], [neck[0] + 0.07 * h, neck[1] + 0.07 * h], [mid[0] + 0.07 * h, mid[1] + 0.09 * h]], { a: 0.96, soft: 1.5 });
            // the hand on the stick
            const hs = [top[0] - 0.01 * h, top[1] + 0.06 * h];
            S.trickle(d, [sh, [sh[0] + 0.07 * h, sh[1] + 0.13 * h], hs], { w: 0.045 * h, a: 0.96, raw: true });
            S.heap(d, hs[0], hs[1], 0.026 * h, { a: 0.96, grains: false });
            // the other hand: in her lap, or lifted to the child
            const lap = [x + 0.15 * h, yf - 0.15 * h], up = [x + 0.24 * h, yf - 0.52 * h];
            const hw = [E.lerp(lap[0], up[0], wave), E.lerp(lap[1], up[1], wave)];
            const el = [E.lerp(sh[0] + 0.02 * h, sh[0] + 0.12 * h, wave), E.lerp(sh[1] + 0.16 * h, sh[1] + 0.02 * h, wave)];
            S.trickle(d, [sh, el, hw], { w: 0.045 * h, a: 0.96, raw: true });
            S.heap(d, hw[0], hw[1], 0.026 * h, { a: 0.96, grains: false });
            // the head held forward on a thin neck, so it reads apart from the shoulders
            const hc = [neck[0] + 0.08 * h, neck[1] - 0.07 * h];
            S.trickle(d, [neck, [hc[0] - 0.02 * h, hc[1] + 0.03 * h]], { w: 0.035 * h, a: 0.96, raw: true });
            headAt(d, hc, 0.058 * h, 1, 'bun');
        });
    }

    // --- the castle ------------------------------------------------------------------------
    // plan: { cx, base, s, t0 (pour), towers: [[dx, w, h, t0, t1]], cren: [a, b],
    //         windows: t, flag: [a, b] }
    function castle(d, tt, P) {
        const { cx, base } = P;
        const up = (a, b) => E.out(E.seg(tt, a, b));
        const ub = up(P.t0, P.t0 + 0.7);
        if (ub > 0) S.heap(d, cx, base - 4, P.baseR ?? 125, { u: ub, squash: 0.16, a: 0.62, seed: 'cb' + cx });
        const tops = P.towers.map(([dx, w, h, a, b]) => {
            const u = up(a, b);
            if (u <= 0) return null;
            const x = cx + dx;
            const hh = h * u;
            const dome = (1 - u) * w * 0.7 + 3;
            const flare = (1 - u) * w * 0.45;
            const top = base - 18 - hh;
            const pts = [[x - w / 2 - flare, base - 16], [x - w / 2 + 3, top + dome * 0.6]];
            for (let k = 1; k < 8; k++) {
                const q = k / 8;
                pts.push([x - w / 2 + 3 + (w - 6) * q, top + dome * (1 - Math.sin(q * Math.PI)) * 0.6 - (u < 1 ? dome * 0.4 * Math.sin(q * Math.PI) : 0)]);
            }
            pts.push([x + w / 2 - 3, top + dome * 0.6], [x + w / 2 + flare, base - 16]);
            S.mass(d, pts, { a: 0.96, soft: 1.5 });
            if (u < 1) S.grains(d, x, top + 6, w * 0.9, 26, 'tw' + dx + Math.floor(tt * 12), { inner: w * 0.4, a: 0.85 });
            return [x, top, w, h];
        });
        const cren = E.seg(tt, P.cren[0], P.cren[1]);
        const n = tops.length;
        tops.forEach((tp, j) => {
            if (!tp) return;
            const [x, top, w] = tp;
            const slots = w > 50 ? 7 : 5;
            const sw = w / slots;
            for (let i = 1; i < slots; i += 2) {
                if (cren * n * 3 < j * 3 + i / 2) continue;
                const xl = x - w / 2 + i * sw;
                S.clear(d, [[xl, top - 12], [xl + sw, top - 12], [xl + sw * 0.9, top + 10], [xl + sw * 0.1, top + 10]], { raw: true, soft: 0.8 });
            }
        });
        if (tt > P.windows) {
            tops.forEach((tp, j) => {
                if (!tp) return;
                const [x, top, w, h] = tp;
                if (j === P.keep) S.press(d, x, base - 40, w * 0.22, { squash: 1.4, rim: 0.3 });
                else S.press(d, x, top + h * 0.38, 5, { squash: 1.6, rim: 0.25 });
            });
        }
        const keep = tops[P.keep];
        const uf = E.inOut(E.seg(tt, P.flag[0], P.flag[1]));
        if (uf > 0 && keep) {
            const [x, top] = keep;
            S.trickle(d, [[x, top - 2], [x, top - 2 - 50 * uf]], { w: 3.5, a: 0.95, raw: true });
            if (uf >= 1) {
                const fl = Math.sin(Math.floor(tt * 12) * 0.75) * 4;
                S.mass(d, [[x + 1, top - 52], [x + 34, top - 44 + fl], [x + 1, top - 34]], { a: 0.95, raw: true, soft: 1 });
            }
        }
    }

    // --- a gull crossing, redrawn on twos -----------------------------------------------------
    function gull(d, tt, t0, t1, x0, x1, y0, s = 1) {
        const u = E.seg(tt, t0, t1);
        if (u <= 0 || u >= 1) return;
        const x = E.lerp(x0, x1, u), y = y0 + 30 * Math.sin(u * 5);
        const f = Math.sign(x1 - x0);
        const flap = Math.sin(tt * 9);
        const tip = 24 * flap * s, el = 9 * flap * s;
        S.mass(d, [[x - f * 14 * s, y + 2 * s], [x - f * 4 * s, y - 4 * s], [x + f * 16 * s, y - 3 * s], [x + f * 24 * s, y + 1 * s], [x + f * 8 * s, y + 5 * s]], { a: 0.95, soft: 0.8 });
        for (const sd of [-1, 1]) {
            S.mass(d, [[x - 2 * s, y - 2 * s], [x + sd * 22 * s, y - 8 * s - el], [x + sd * 50 * s, y - tip], [x + sd * 26 * s, y - 2 * s - el * 0.6], [x + 4 * s, y + 3 * s]], { a: 0.95, soft: 0.8 });
        }
    }

    // --- the wave ------------------------------------------------------------------------
    // A crest of sand with a curling lip; X is the foot of its face. rise (0..1) lowers it
    // back into the sea when a wave falls short.
    const FACE = [[0, 960], [-6, 880], [-22, 800], [-55, 720], [-105, 640], [-165, 570], [-225, 510], [-275, 460], [-300, 420]];
    function faceAt(X, rise = 1) {
        return [[X, 1000], ...FACE.map(([x, y]) => [X + x * (0.4 + 0.6 * rise), y < 700 ? 700 + (y - 700) * rise : y]), [X - 340 * (0.4 + 0.6 * rise), 700 + (380 - 700) * rise]];
    }
    function crest(d, X, tt, rise = 1) {
        const di = Math.floor(tt * 12);
        const jit = (k, a) => a * Motion.noise1('cr' + k, di * 0.7);
        const R = (pts, k0) => pts.map(([x, y], k) => [X + x * (0.4 + 0.6 * rise) + jit(k + k0, 5), (y < 700 ? 700 + (y - 700) * rise : y) + jit(k + k0 + 100, 4)]);
        const face = R(FACE, 0);
        const lip = R([[-318, 395], [-336, 410], [-346, 440], [-338, 470], [-322, 486], [-306, 474], [-298, 452]], 20);
        const back = R([[-262, 372], [-205, 356], [-130, 362], [-40, 392], [70, 440], [200, 495], [360, 535], [560, 548], [800, 548], [1000, 545]], 60);
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
        const near = [...face, ...lip.slice().reverse(), ...R([[-262, 372], [-150, 360], [-30, 400], [90, 470], [150, 600], [180, 960]], 140)];
        S.mass(d, near, { a: 0.9, soft: 10 });
        S.clear(d, R([[-300, 470], [-270, 492], [-235, 540], [-250, 580], [-290, 530]], 160), { a: 0.55, soft: 12 });
        const rw = Motion.rng('wl');
        for (let k = 1; k <= 7; k++) {
            const off = k * 26 + rw() * 12;
            const a0 = Math.floor(rw() * 3), a1 = 5 + Math.floor(rw() * 4);
            const pts = face.slice(a0, a1).map(([x, y]) => [x + off + k * k * 2, y + k * 5]);
            S.finger(d, pts, { w: 1.5 + rw() * 2.2, rim: 0.2, clean: 0.9 - k * 0.07, seed: 'wl' + k + di });
        }
        S.grains(d, lip[2][0], lip[1][1] + 10, 80, 140, 'spray' + di, { inner: 14, a: 0.9 });
        for (let k = 2; k < 8; k++) S.grains(d, face[k][0] - 18, face[k][1], 26, 14, 'fs' + k + di, { inner: 6, a: 0.85 });
        S.heap(d, X - 30, 950, 70, { a: 0.9, squash: 0.5, seed: 'fb' + di });
    }
    // the wave crossing: the old picture ahead of its face, the new one behind
    function wave(d, X, tt, oldFn, newFn, rise = 1) {
        const cut = faceAt(X, rise);
        d.save();
        S.trace(d, [...cut, [X - 400, -50], [-200, -50], [-200, 1000]], true);
        d.clip();
        oldFn(d);
        d.restore();
        d.save();
        S.trace(d, [...cut, [X - 400, -50], [2000, -50], [2000, 1000]], true);
        d.clip();
        newFn(d);
        d.restore();
        crest(d, X, tt, rise);
    }

    // --- a figure on its own sheet: it can appear (alpha) and blow away (dissolve) ---------
    // box: [x0, y0, x1, y1] the figure's bounds; wind: [dx, dy] where its grains fly
    function sheet(table, d, fn, o = {}) {
        const c = (table.sheet ??= (() => {
            const cv = document.createElement('canvas');
            cv.width = table.canvas.width;
            cv.height = table.canvas.height;
            return cv;
        })());
        const L = c.getContext('2d');
        L.setTransform(1, 0, 0, 1, 0, 0);
        L.globalCompositeOperation = 'source-over';
        L.clearRect(0, 0, c.width, c.height);
        L.setTransform(table.kd, 0, 0, table.kd, 0, 0);
        L.lineCap = 'round';
        L.lineJoin = 'round';
        fn(L);
        const dis = o.dissolve ?? 0;
        if (dis > 0) {
            const [x0, y0, x1, y1] = o.box;
            const rnd = Motion.rng(o.seed ?? 'dis');
            const W = [o.wind?.[0] ?? 600, o.wind?.[1] ?? -260];
            L.save();
            L.globalCompositeOperation = 'destination-out';
            L.fillStyle = '#fff';
            const fly = [];
            for (let i = 0; i < 2600; i++) {
                const px = x0 + rnd() * (x1 - x0), py = y0 + rnd() * (y1 - y0);
                // the wind takes the top and the windward back first
                const th = 0.75 * ((py - y0) / (y1 - y0)) * 0.6 + 0.4 * (1 - (px - x0) / (x1 - x0)) * 0.5 + rnd() * 0.45;
                const r = 2 + rnd() * 5;
                if (th < dis) {
                    L.beginPath();
                    L.arc(px, py, r, 0, Math.PI * 2);
                    L.fill();
                    if (i % 2 === 0) fly.push([px, py, dis - th, rnd()]);
                }
            }
            L.restore();
            // the grains it lost, carried off in a long drifting curve
            d.save();
            d.fillStyle = 'rgba(255,255,255,0.9)';
            for (const [px, py, age, k] of fly) {
                const a = Math.min(1, age * 0.9);
                const gx = px + W[0] * a * (0.6 + k), gy = py + W[1] * a * (0.5 + k) + 40 * Math.sin(a * 5 + k * 6);
                const sz = 2 + k * 2.2;
                d.globalAlpha = Math.max(0, 1 - a * 0.7);
                d.fillRect(gx, gy, sz, sz);
            }
            d.restore();
        }
        d.save();
        d.setTransform(1, 0, 0, 1, 0, 0);
        d.globalAlpha = o.alpha ?? 1;
        d.drawImage(c, 0, 0);
        d.restore();
    }

    // --- writing in the wet sand with a finger ----------------------------------------------
    const GLYPHS = {
        L: [[[0, 0], [2, 50], [30, 48]]],
        M: [[[0, 50], [3, 0], [18, 30], [33, 0], [36, 50]]],
        '+': [[[0, 25], [26, 25]], [[13, 12], [13, 38]]],
    };
    function write(d, text, x, y, tt, t0, dur, s = 1) {
        const strokes = [];
        let cx = x;
        for (const ch of text) {
            (GLYPHS[ch] ?? []).forEach((st) => strokes.push(st.map(([a, b]) => [cx + a * s, y + b * s * 0.55])));
            cx += (ch === '+' ? 46 : 54) * s;
        }
        const u = E.seg(tt, t0, t0 + dur) * strokes.length;
        strokes.forEach((st, i) => {
            const p = Math.min(1, u - i);
            if (p > 0) S.finger(d, st, { w: 6 * s, rim: 0.6, prog: p, seed: 'wr' + i });
        });
    }

    return { HORIZON, SHORE, beach, kid, walker, kneel, old, castle, gull, crest, wave, sheet, write };
})();
