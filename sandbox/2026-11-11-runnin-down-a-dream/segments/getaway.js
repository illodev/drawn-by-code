// «The getaway», bars 8–11 (11.67–17.29 s), a wide shot of the crossroads on the road set.
// The band's car skids in (the Devil leaps out of its way), the Heartbreakers pop aboard one
// per beat, Tom hops in, the car rears and peels out and its dust swallows the Devil; he
// stamps, his hearse pulls up, he climbs on and gives chase.
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, twos = S.twos, b = S.b, B = S.B, pop = S.pop;
    const T8 = B(8), T12 = B(12), X0 = 2300, SC = 84, LANE = World.LANE, NEAR = 974, CAM = -46; // the camera looks a little lower: the near verge is part of the stage
    const bump = (t, a, dur = 0.3) => E.bump(twos(t, a), a, dur);
    const seg = (t, a, c) => E.seg(twos(t, a), a, c);
    // a hop from p to q: [x, y] at t, on twos, with an arc h high
    const hop = (t, a, dur, p, q, h) => {
        const u = seg(t, a, a + dur);
        return [E.lerp(p[0], q[0], u), E.lerp(p[1], q[1], u) - Math.sin(u * Math.PI) * h];
    };

    // the crossing road, over the road set
    function crossing(g) {
        const W = World.THEMES.day, sl = 1.5, x0 = 300, far = (y) => x0 - (y - World.ROAD0) * sl, w = 104;
        const strip = (y0, y1) => {
            C.poly(g, [[far(y0), y0], [far(y0) + w, y0], [far(y1) + w, y1], [far(y1), y1]], { fill: W.road, lw: 0 });
            C.poly(g, [[far(y0), y0], [far(y1), y1]], { ink: K.ink, lw: 4, close: false });
            C.poly(g, [[far(y0) + w, y0], [far(y1) + w, y1]], { ink: K.ink, lw: 4, close: false });
        };
        strip(World.HOR + 38, World.ROAD0 + 2);
        strip(World.ROAD1 - 2, 1012);
        for (const y of [World.HOR + 52, World.HOR + 86, World.ROAD1 + 14]) C.poly(g, [[far(y) + w / 2, y], [far(y + 16) + w / 2, y + 16]], { ink: W.roadLine, lw: 6, close: false });
        // the crossroads sign
        const sx = 640, sy = World.ROAD0 - 8;
        C.box(g, sx - 4, sy - 118, 8, 118, [4, -2.7], { front: W.wood, top: W.wood, side: W.woodSide }, { lw: 2.6 });
        C.prism(g, [[sx, sy - 190], [sx + 40, sy - 150], [sx, sy - 110], [sx - 40, sy - 150]], [4, -2.7], { front: K.yellow, top: K.gold, side: '#e0a800' }, { lw: 3 });
        C.poly(g, [[sx, sy - 174], [sx, sy - 126]], { ink: K.ink, lw: 8, close: false });
        C.poly(g, [[sx - 24, sy - 150], [sx + 24, sy - 150]], { ink: K.ink, lw: 8, close: false });
    }

    function draw(g, t, env) {
        const P = S.pulseAt(t), d = C.drawing(t), ph = P.k + P.since, n = (k) => b(32 + k); // beat k of this shot
        g.save();
        g.translate(0, CAM);
        World.back(g, t, X0, 'day', { sun: { x: 170, y: 210, r: 70 }, moon: { x: 850, y: 180, r: 38 }, clear: [250, 600] }); // the crossing road runs over the far verge there
        crossing(g);

        // --- the band's car: in, stopped, revving, gone
        const CX = 600, inU = E.out(E.seg(t, T8, n(2))), revU = seg(t, n(6), n(8)), goU = E.in(E.seg(t, n(8), n(8) + S.BEAT * 1.6));
        const cx = E.lerp(-700, CX, inU) + goU * 1500;
        const stopAt = n(2), carOn = cx < 1500;
        const bounce = 0.8 * bump(t, stopAt, 0.35) + 0.5 * bump(t, n(5), 0.25) + 0.35 * revU * (d % 2 ? 1 : 0.6) - 0.3 * goU;
        const lean = 0.2 * revU * (1 - goU) + 0.12 * Math.sin(Math.min(1, goU * 3) * Math.PI);
        const spin = cx / (0.42 * SC) + (t >= n(6) && goU <= 0 ? (t - n(6)) * 30 : 0);
        const tomIn = n(4), tomSeat = Rig.seat('band', 'driver', CX, LANE, SC);
        const aboard = { stan: 1, ben: pop(t, n(1), 0.2), howie: pop(t, n(2), 0.2), mike: pop(t, n(3), 0.2), tom: t >= tomIn + 3 / 12 - 1e-6 ? 1 : 0 };

        // --- the Devil on foot: leaps to the near verge, fumes, runs at the car, eats its dust,
        // stamps for his hearse and climbs on
        const hx0 = 400, hIn = E.out(E.seg(t, n(12), n(13))), hGo = E.in(E.seg(t, n(15) + S.BEAT * 0.5, T12 + 0.4));
        const hx = E.lerp(-600, hx0, hIn) + hGo * 1400;
        const dSeat = Rig.seat('hearse', 'devil', hx0, LANE, SC);
        const climbAt = n(14), riding = t >= climbAt + 3 / 12 - 1e-6;
        let dp = hop(t, T8, 3 / 12, [330, LANE], [130, NEAR], 150);
        if (t >= n(6) - 1e-6) dp = [E.lerp(130, 250, seg(t, n(6), n(8))), NEAR - Math.abs(Math.sin(ph * Math.PI)) * 18];
        if (t >= climbAt - 1e-6) dp = hop(t, climbAt, 3 / 12, [250, NEAR], dSeat, 130);
        const dustK = E.seg(t, n(8), n(11) + 0.2), inDust = dustK > 0.05 && dustK < 0.8;
        const stamp = bump(t, n(11) + 3 / 12, 0.25);
        const dMood = t < n(1) ? 'shock' : t < n(8) ? 'angry' : inDust ? 'shock' : t < n(12) ? 'angry' : 'grin';
        const devilFoot = () => {
            if (riding) return;
            Devil.draw(g, dp[0], dp[1], SC, {
                mood: dMood, look: 1, squash: 0.05 * P.pulse + 0.2 * stamp + 0.15 * bump(t, T8 + 3 / 12, 0.25), tail: 0.05 * Math.sin(ph * Math.PI),
                contract: t < n(8) ? { open: 1, signed: true, ang: d % 2 ? 0.12 : -0.08 } : false, handL: t < n(8) ? [0.62, -1.0 - 0.12 * P.pulse] : undefined,
                handR: t >= n(8) ? [-0.6, -0.95] : undefined, step: d % 2 ? 1 : -1,
            });
            if (dMood === 'angry' && !inDust) for (const sx of [-1, 1]) Fx.flame(g, dp[0] + sx * 0.5 * SC + 8, dp[1] - 2.26 * SC, 26, d, sx > 0 ? 1 : 0);
        };

        // the hearse, behind him on the road
        if (t >= n(12) - 1e-6) {
            Rig.hearse(g, t, hx, LANE, SC, {
                spin: hx / (0.4 * SC), bounce: 0.7 * bump(t, n(13), 0.3) + 0.4 * bump(t, climbAt + 3 / 12, 0.25), lean: 0.14 * E.seg(t, n(15), n(15) + 0.2) * (1 - hGo), flames: t >= n(15) ? 1 : 0.4,
                jaw: bump(t, n(13), 0.5), devil: riding ? { mood: t >= n(15) ? 'laugh' : 'grin', trident: { ang: t >= n(15) ? 0.5 : 0 }, handR: t >= n(15) ? [-0.5, -1.0] : undefined } : false,
            });
        }
        // the band's car
        if (carOn) {
            Rig.band(g, t, cx, LANE, SC, { spin, bounce, lean, exhaust: t >= n(5) ? 0.5 + 0.5 * revU : 0.2, aboard });
            // a twinkle where each Heartbreaker pops aboard
            [['deck2', 1], ['deck3', 2], ['deck0', 3]].forEach(([name, k]) => {
                const tw = bump(t, n(k), 0.3);
                if (tw <= 0) return;
                const p = Rig.seat('band', name, cx, LANE, SC);
                C.sparkle(g, p[0] + 30, p[1] - 150, 14 + 40 * tw, { color: K.white, ink: K.ink, lw: 3 });
            });
        }
        // skid marks where it stopped
        if (t >= n(1) && goU < 1) for (const wx of [-2.9, 2.6]) C.poly(g, [[CX + wx * SC - 150, LANE + 3], [CX + wx * SC - 20, LANE + 3]], { ink: '#211c57', lw: 6, close: false });

        // Tom on the near verge, then into the driver's seat
        if (!aboard.tom) {
            const tp = t < tomIn - 1e-6 ? [850, NEAR - 6] : hop(t, tomIn, 3 / 12, [850, NEAR - 6], [tomSeat[0], tomSeat[1]], 120);
            Cast.tom(g, tp[0], tp[1], SC, { ...Rig.playing(t).tom, squash: 0.05 * P.pulse });
        }
        devilFoot();
        // the dust it leaves, over him
        if (dustK > 0 && dustK < 1) Rides.dust(g, CX - 2.2 * SC, LANE + 8, SC * 2.5, dustK, 'getaway', t);
        // the ground cracks where he stamps
        if (t >= n(11) + 3 / 12 && t < n(13)) {
            const k = E.out(seg(t, n(11) + 3 / 12, n(11) + 6 / 12));
            for (const [ax, ay] of [[-70, -8], [-40, 16], [60, 10], [84, -12]]) C.poly(g, [[250, NEAR + 4], [250 + ax * 0.5 * k, NEAR + 4 + ay * 0.5 * k], [250 + ax * k, NEAR + 4 + ay * k]], { ink: K.ink, lw: 4, close: false });
        }
        g.restore();
    }

    Seg.getaway = { shots: [[T8, T12, 'Getaway']], draw, post: (t) => ({ track: [0.25, 0.1][Math.round((t - T8) * 24)] ?? 0 }) };
})();
