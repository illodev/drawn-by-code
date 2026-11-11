// dev: the sets and props of the solo and the fade (skyward.js), to judge them at size.
// One sheet per second; add 0.25, 0.5 or 0.75 to a sheet's time for its variants (the options
// at their extremes, other drawings). Render with --at 0,0.25,… --size 1080. Film-size sheets
// go through the tape and the tube as in the film; the close ones are flat.
//   40  the moon at the sizes the ascent uses (r = 40 … 250)      41  the moon at the end of the ascent (r = 325) behind the band
//   42  the moon as the ground (r = 900): the car lands, the flag 43  the face, close (r = 430)
//   44  phase and glow at their extremes
Motion.scene({
    fps: 24, duration: 60, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js',
        'sandbox/2026-11-11-runnin-down-a-dream/rides.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js',
        { src: 'sandbox/2026-11-11-runnin-down-a-dream/inferno.js', optional: true }, 'sandbox/2026-11-11-runnin-down-a-dream/skyward.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }, { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
    draw(g, t, env) {
        const C = Cereal, K = C.COL, S = Skyward, sheet = Math.floor(t + 1e-6), v = Math.round((t - sheet) * 4) % 4, tt = 190.5 + v / 12;
        const CAR = Rig.CAR;
        const night = () => C.sunburst(g, 500, 1100, { n: 12, rot: 0.2, a: '#0e0b2c', b: '#130f3a' });
        const stars = () => {
            const r = Motion.rng('devstars');
            for (let i = 0; i < 40; i++) C.sparkle(g, r() * 1000, r() * 1000, 5 + r() * 9, { color: i % 5 ? '#fffbe8' : K.yellow });
        };

        const YS = [0, 120, 400, 900, 1700, 2500, 3000, 3320, 3700, 3950, 4150, 4600, 5500, 6800, 8000, 9300, 10800, 12000];
        if (sheet < YS.length) {
            // the ascent with the band on its car; variants: speed lines, dawn, a little higher and to the side
            const Y = YS[sheet] + (v === 3 ? 160 : 0), o = { speedLines: v === 1 ? 1 : 0, theme: v === 2 ? 'dawn' : 'night', x: v === 3 ? 240 : 0, town: { lights: 1, wake: sheet < 2 ? 1 : 0 } };
            S.ascent(g, tt, Y, o);
            const cy = sheet === 0 ? [960, 900, 960, 840][v] : sheet === 1 ? 740 : 610;
            Rig.band(g, tt, 500, cy, 50, { spin: v, shadow: false, exhaust: 0.4, sing: true, lean: sheet < 2 ? 0.2 : 0 });
            S.ascentFront(g, tt, Y, o);
        } else if (sheet === 20) {
            // the town on its street behind the crater, as the ascent draws it: lights coming on, then everybody out
            const o = { town: [{ lights: 0, wake: 0 }, { lights: 0.5, wake: 0 }, { lights: 1, wake: 0.5 }, { lights: 1, wake: 1 }][v] };
            S.ascent(g, tt, 0, o);
            S.ascentFront(g, tt, 0, o);
        } else if (sheet >= 21 && sheet <= 23) {
            // at the cars' size on the night road: its left, its middle, its right
            World.back(g, tt, 4000, 'night', { moon: { x: 770, y: 190, r: 62 }, stars: 1 });
            const o = [{ lights: 1, wake: 0 }, { lights: 0.3, wake: 0.3 }, { lights: 1, wake: 0.66 }, { lights: 1, wake: 1 }][v];
            S.town(g, 500 + [8.2, 2.2, -5.6][sheet - 21] * CAR, World.ROAD0 - 4, CAR, { ...o, t: tt });
        } else if (sheet >= 24 && sheet <= 28) {
            // close (s = 200): the tower, the diner, the pumps, the motel and its sign, the people
            C.sunburst(g, 500, 900, { n: 12, rot: 0.2, a: '#1b1750', b: '#231e62' });
            const o = [{ lights: 1, wake: 0 }, { lights: 0, wake: 0.4 }, { lights: 1, wake: 0.7 }, { lights: 1, wake: 1 }][v];
            const cx = [8.6, 4.4, -2.6, -7.2, -9.2][sheet - 24], s = sheet === 28 ? 300 : 200;
            S.town(g, 500 + cx * s + (sheet === 28 ? [0, 14.6, 0.6, 16.6][v] * s : 0), sheet === 24 ? 1300 : sheet === 28 ? 900 : 960, s, { ...o, t: tt });
        } else if (sheet === 30 || sheet === 31) {
            // the three angels next to Tom at the same scale (s = 200): every mood, empty-handed and with their instruments
            C.sunburst(g, 500, 620, { n: 12, rot: 0.2, a: '#231e62', b: '#2c2380' });
            S.cloudBank(g, 500, 905, 200, { w: 5.4, seed: 'sheet', t: tt, bob: 0 });
            const mood = sheet === 30 ? ['serene', 'shocked', 'ears', 'rock'][v] : ['serene', 'ears', 'peek', 'rock'][v], fl = S.flap(tt);
            Cast.tom(g, 130, 900, 200, { shades: 1, strum: 0.4 });
            [0, 1, 2].forEach((who) => S.angel(g, 385 + who * 235, 900, 200, { who, mood, flap: [fl, 1, 0, fl][v], harp: sheet === 31 && who === 0, trumpet: sheet === 31 && who === 1, halo: [0, -0.3, 0.25, 0.1][v] * (who - 1), haloUp: mood === 'shocked' ? 1 : 0, strum: 0.6, headDy: mood === 'rock' ? 0.03 : 0 }));
        } else if (sheet === 32) {
            // close (s = 300)
            C.sunburst(g, 500, 620, { n: 12, rot: 0.2, a: '#231e62', b: '#2c2380' });
            const o = [{ who: 0, mood: 'rock', harp: true, strum: -0.8 }, { who: 1, mood: 'ears', trumpet: true }, { who: 2, mood: 'peek', flap: 1, halo: 0.3 }, { who: 0, mood: 'shocked', harp: true, haloUp: 1, flap: 1 }][v];
            S.angel(g, 280, 940, 300, o);
            S.angel(g, 740, 940, 300, [{ who: 1, mood: 'rock', trumpet: true, flap: 1 }, { who: 2, mood: 'ears', harp: true }, { who: 1, mood: 'serene', trumpet: true }, { who: 2, mood: 'rock', armUp: 0.5, squash: 0.06 }][v]);
        } else if (sheet === 33) {
            // at film size on the cloud tops: banks, the gate, the lectern, the band going by
            const Y = 4000 + [0, 60, 120, 200][v], o = { speedLines: 0 };
            S.ascent(g, tt, Y, o);
            const mood = ['serene', 'ears', 'peek', 'rock'][v], y0 = S.at(4000, Y) + 210, s = CAR;
            const bank = (x, y, w, seed, fn) => {
                S.cloudBank(g, x, y, s, { w, seed, t: tt, part: 'back' });
                fn(S.bankBob(tt, seed) * s);
                S.cloudBank(g, x, y, s, { w, seed, t: tt, part: 'front' });
            };
            bank(800, y0 - 250, 3.6, 'gate', (dy) => S.pearlyBits(g, 730, y0 - 250 + dy, s * 0.8, {}));
            Rig.band(g, tt, 500, 470 - v * 40, 50, { spin: v, shadow: false, exhaust: 0.4, sing: true });
            bank(170, y0 - 40, 2.4, 'a', (dy) => S.angel(g, 170, y0 - 40 + dy, s, { who: 0, mood, harp: true, flap: S.flap(tt), strum: 0.5 }));
            bank(470, y0 + 40, 3.0, 'b', (dy) => {
                S.angel(g, 400, y0 + 40 + dy, s, { who: 1, mood, trumpet: true, flap: S.flap(tt + 0.2) });
                S.angel(g, 555, y0 + 40 + dy, s, { who: 2, mood, flap: S.flap(tt + 0.1), sit: v % 2 === 0 });
            });
            S.ascentFront(g, tt, Y, o);
        } else if (sheet === 34) {
            // the bank and the set dressing, close (s = 200); a sitting angel
            C.sunburst(g, 500, 620, { n: 12, rot: 0.2, a: '#231e62', b: '#2c2380' });
            const dawn = v === 3 ? 1 : 0;
            S.cloudBank(g, 330, 760, 200, { w: [2.6, 3.4, 2.2, 3][v], seed: 'x' + v, t: tt, part: 'back', dawn });
            if (v < 2) S.pearlyBits(g, 250, 760, 190, { ajar: [0.6, 1][v] });
            else S.pearlyBits(g, 330, 760, 240, { gate: v === 3, lecternAt: v === 2 ? [0, 0] : [2.2, 0], ajar: 0 });
            S.cloudBank(g, 330, 760, 200, { w: [2.6, 3.4, 2.2, 3][v], seed: 'x' + v, t: tt, part: 'front', dawn });
            S.cloudBank(g, 790, 420, 200, { w: 1.8, seed: 'y', t: tt, part: 'back', dawn });
            S.angel(g, 790, 420, 200, { who: v % 3, mood: ['serene', 'rock', 'peek', 'ears'][v], sit: true, harp: v === 0, trumpet: v === 1, flap: v / 3 });
            S.cloudBank(g, 790, 420, 200, { w: 1.8, seed: 'y', t: tt, part: 'front', dawn });
        } else if (sheet === 40) {
            night();
            stars();
            const o = [{}, { face: 1 }, { glow: 1 }, { phase: 0.3, glow: 0.5 }][v];
            S.moon(g, 110, 150, 40, o);
            S.moon(g, 270, 170, 62, o);
            S.moon(g, 500, 220, 110, o);
            S.moon(g, 800, 280, 170, o);
            S.moon(g, 330, 660, 250, o);
            S.moon(g, 760, 760, 90, o);
        } else if (sheet === 41) {
            night();
            stars();
            S.moon(g, 500, 380, 325, [{}, { face: 1, glow: 0.4 }, { face: 1, wink: 1, glow: 0.7 }, { face: 1, wink: 1, smile: 1, glow: 1 }][v]);
            Rig.band(g, tt, 500, 640, 50, { spin: v, shadow: false, exhaust: 0.4, sing: true });
        } else if (sheet === 42) {
            night();
            stars();
            const k = [0.12, 0.35, 0.65, 1][v], mx = 500, my = 1520, r = 900, cx = 480, s = 56;
            S.moon(g, mx, my, r, { flag: { a: -0.33, s, k: v / 3 + 0.34, t: tt }, t: tt });
            const o = { r, t: tt };
            S.landing(g, cx, my - r, s, k, { ...o, part: 'back' });
            Rig.band(g, tt, cx + S.landingSlide(k) * s, my - r + 1, s, { spin: 6 * S.landingSlide(k), bounce: v === 0 ? 1 : 0, sing: true });
            S.landing(g, cx, my - r, s, k, { ...o, part: 'front' });
        } else if (sheet === 43) {
            night();
            S.moon(g, 500, 500, 430, [{ face: 0.5 }, { face: 1 }, { face: 1, wink: 1, look: [0.8, 0.6] }, { face: 1, wink: 1, smile: 1, look: [-0.6, 0.8] }][v]);
        } else if (sheet === 44) {
            night();
            stars();
            [[250, 250, { phase: 0.75 }], [750, 250, { phase: 0.5, glow: 1 }], [250, 750, { phase: 0.15 }], [750, 750, { phase: 0, glow: 0.5 }]].forEach(([x, y, o], i) => S.moon(g, x, y, 190, { ...o, face: v === 1 ? 1 : 0, rot: v === 2 ? 0.4 * (i - 1.5) : 0, flag: v === 3 ? { a: i - 1.5, t: tt } : false }));
        }
    },
    post(ctx, t, env) {
        const sheet = Math.floor(t + 1e-6);
        if (sheet < 24 || [30, 31, 33, 40, 41, 42].includes(sheet)) Cereal.post(ctx, t, env);
    },
});
