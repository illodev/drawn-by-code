// tide · «Marea» · style sand: one life on one beach. Every wave is the artist's palm
// sweeping the table; the light under the glass is the time of day and the time of life.
Motion.scene({
    fps: 24,
    duration: 45,
    logical: [1600, 900],
    uses: ['styles/sand/sand.js', 'sandbox/2026-11-04-tide/cast.js'],
    bpm: 60,
    audio: { mix: 'private/mix.wav' }, // sh sandbox/2026-11-04-tide/mix.sh (the score is private)
    shots: [[0, 4, 'Shore'], [4, 11, 'Child'], [11, 13, 'Wave 1'], [13, 20, 'Two'], [20, 22, 'Wave 2'], [22, 30, 'Parent'], [30, 32, 'Wave 3'], [32, 40, 'Old'], [40, 45, 'Again']],

    setup(env) {
        return { table: Sand.table(env) };
    },

    draw(g, t, env) {
        const S = Sand, E = Ease, C = Cast;
        const table = env.state.table;
        const d = table.begin();
        const tq = Math.floor(t * 12 + 1e-6) / 12; // drawings on twos
        const SH = C.SHORE;
        const patting = (a, b, ph = 0) => (tq > a && tq < b ? Math.abs(Math.sin((tq - a) * Math.PI * 2 + ph)) : 0);

        // --- dawn: the lamp comes up, sand is laid into the sea and the beach
        const shore = (d) => {
            C.beach(d, tq, {
                sea: E.inOut(E.seg(tq, 0.8, 2.4)),
                shore: E.out(E.seg(tq, 1.8, 3.2)),
                lines: E.seg(tq, 2.4, 4.4),
            });
        };

        // --- morning: a child is poured out of a heap and builds the first castle
        const CASTLE1 = { cx: 760, base: SH + 6, t0: 5.3, keep: 2, towers: [[-70, 44, 110, 6.0, 6.7], [72, 44, 96, 6.5, 7.2], [0, 64, 160, 7.0, 7.9]], cren: [7.9, 8.4], windows: 8.3, flag: [8.5, 8.9] };
        const morning = (d) => {
            C.beach(d, tq, {});
            C.castle(d, tq, CASTLE1);
            const ap = E.seg(tq, 4.3, 5.0);
            if (tq < 5.0) S.heap(d, 600, SH - 60, 80, { u: E.out(E.seg(tq, 3.9, 4.5)) * (1 - E.inOut(E.seg(tq, 4.6, 5.0))), a: 0.95, squash: 1.1, seed: 'kidpour' + Math.floor(tq * 12) });
            if (ap > 0) C.sheet(table, d, (L) => C.kid(L, 540, SH + 8, 1, patting(5.3, 8.9)), { alpha: ap });
            C.gull(d, tq, 8.6, 11.2, 1700, 300, 230);
        };

        // --- noon: two young people walk in along the wet sand and meet; a finger writes
        // two initials in front of them
        const pair = (d) => {
            const go = (x0, x1, t0, t1, yf, h, f, hair, other) => {
                const u = E.seg(tq, t0, t1);
                const ue = u < 0.8 ? u / 0.9 : 0.8 / 0.9 + (1 - 0.8 / 0.9) * E.out((u - 0.8) / 0.2);
                const x = E.lerp(x0, x1, ue);
                const stride = 0.55 * h;
                const ph = (Math.abs(x - x0) / stride) * Math.PI;
                const amp = 1 - E.inOut(E.seg(tq, t1 - 0.25, t1 + 0.2));
                const n = Math.floor((Math.abs(x - x0) / stride) * 2);
                for (let k = 0; k < n; k++) {
                    const fx = x0 + (f * (k + 0.5) * stride) / 2;
                    const fy = yf + 2 + (k % 2 ? 4 : -3);
                    S.press(d, fx + f * 5, fy, 11, { squash: 0.36, rim: 0.5 });
                    S.press(d, fx - f * 12, fy, 7, { squash: 0.45, rim: 0.45 });
                }
                const reach = E.inOut(E.seg(tq, t1, t1 + 0.6));
                C.walker(d, x, yf, h, f, ph, amp, { hair, reach, rx: other, ry: yf - 0.43 * h });
            };
            go(120, 735, 12.7, 15.4, 772, 228, 1, 'long', 790);
            go(1480, 845, 11.7, 15.3, 776, 240, -1, 'short', 790);
        };
        const noon = (d) => {
            C.beach(d, tq, {});
            pair(d);
            C.write(d, 'L+M', 690, 812, tq, 16.6, 2.0, 1.05);
            C.gull(d, tq, 16.0, 19.6, 200, 1500, 200, 0.8);
        };

        // --- afternoon: she kneels with her daughter (in the same sun hat) and they build
        // the castle together, bigger than the first
        const CASTLE2 = { cx: 820, base: SH + 6, t0: 22.3, baseR: 190, keep: 4, towers: [[-150, 40, 80, 23.0, 23.6], [150, 40, 84, 23.5, 24.1], [-80, 48, 124, 24.1, 24.9], [80, 48, 118, 24.7, 25.5], [0, 70, 196, 25.3, 26.4]], cren: [26.4, 27.2], windows: 27.1, flag: [27.4, 27.9] };
        const afternoon = (d) => {
            C.beach(d, tq, {});
            C.castle(d, tq, CASTLE2);
            C.kneel(d, 560, SH + 30, 232, 1, patting(22.3, 28, 0));
            C.kid(d, 1110, SH + 10, -1, patting(22.3, 28, Math.PI / 2), 0.88);
            C.gull(d, tq, 27.8, 30.5, 1650, 500, 250, 0.9);
        };

        // --- sunset: old now, she sits by the water while a grandchild builds; she lifts a
        // hand to the child, then the wind takes her away grain by grain; the stick stays
        const CASTLE3 = { cx: 930, base: SH + 6, t0: 32.6, keep: 2, towers: [[-70, 44, 104, 33.3, 34.0], [72, 44, 92, 33.9, 34.6], [0, 64, 150, 34.5, 35.6]], cren: [35.7, 36.3], windows: 36.2, flag: [43.0, 43.5] };
        const lift = (tt) => E.inOut(E.seg(tt, 34.6, 35.2)) * (1 - E.inOut(E.seg(tt, 35.9, 36.5)));
        const grand = (d) => {
            C.beach(d, tq, {});
            C.castle(d, tq, CASTLE3);
            C.kid(d, 710, SH + 8, 1, patting(32.6, 36.4) + patting(42.6, 43.5), 0.95);
        };
        const sunset = (d) => {
            grand(d);
            C.old(d, 380, SH + 14, 280, 1, 0, 'stick');
            const dis = E.inOut(E.seg(tq, 36.6, 39.8));
            if (dis < 1) C.sheet(table, d, (L) => C.old(L, 380, SH + 14, 280, 1, lift(tq), 'body'), { dissolve: dis, box: [340, SH - 140, 590, SH + 16], wind: [900, -360], seed: 'grandma' });
            C.gull(d, tq, 32.2, 34.6, 300, 1700, 260, 0.9);
        };

        // --- the cut-less timeline
        const waveX = (u) => E.lerp(1960, -960, E.inOut(u) * 0.4 + u * 0.6);
        const crossing = (a, b, oldFn, newFn) => {
            const u = E.seg(t, a, b);
            C.wave(d, waveX(u), tq, oldFn, newFn);
        };
        if (t < 4) shore(d);
        else if (t < 11) morning(d);
        else if (t < 12.9) crossing(11, 12.9, morning, noon);
        else if (t < 20) noon(d);
        else if (t < 21.9) crossing(20, 21.9, noon, afternoon);
        else if (t < 30) afternoon(d);
        else if (t < 31.9) crossing(30, 31.9, afternoon, sunset);
        else if (t < 40) sunset(d);
        else {
            // the last wave comes for the castle, curls over it and falls short
            sunset(d);
            const ua = E.out(E.seg(t, 40.0, 41.4)), ub = E.inOut(E.seg(t, 41.4, 42.8));
            if (ub < 1) C.crest(d, E.lerp(E.lerp(1960, 1180, ua), 1900, ub), tq, 1 - ub);
        }

        // the light under the glass: the time of day is the time of life
        const L = S.LIGHT;
        const KEYS = [[0, L.dawn], [4, L.dawn], [5.5, L.morning], [11.5, L.morning], [12.6, L.noon], [20.5, L.noon], [21.6, L.afternoon], [30.5, L.afternoon], [31.6, L.sunset], [38.5, L.sunset], [40.2, L.dusk], [41.6, L.night], [42.4, L.night], [44.2, L.dawn]];
        let i = 0;
        while (i < KEYS.length - 2 && t >= KEYS[i + 1][0]) i++;
        const [ta, la] = KEYS[i], [tb, lb] = KEYS[i + 1];
        env.state.light = S.mixLight(la, lb, E.inOut(E.seg(t, ta, tb)));
        env.state.gain = 0.15 + 0.85 * E.inOut(E.seg(t, 0, 1.2));
    },

    post(ctx, t, env) {
        env.state.table.show(ctx, { light: env.state.light, gain: env.state.gain });
    },
});
