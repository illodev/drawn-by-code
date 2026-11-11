// dev: the sets and props of the solo and the fade (skyward.js), to judge them at size.
// One sheet per second; add 0.25, 0.5 or 0.75 to a sheet's time for its variants (the options
// at their extremes, other drawings). Render with --at 0,0.25,… --size 1080. Film-size sheets
// go through the tape and the tube as in the film; the close ones are flat.
//    0–17  the ascent with the band on its car (s = 50), at Y = 0, 120, 400, 900, 1700, 2500, 3000, 3320, 3700, 3950,
//          4150, 4600, 5500, 6800, 8000, 9300, 10800, 12000; variants: plain · speed lines · dawn · 160 higher and drifted
//   18–20  the ascent alone, twelve heights; 20 at half dawn       21  its options: no moon, a moon with a face, the drift's extremes
//   22  the town on its street behind the crater: lights 0 → 1, then everybody out
//   23–25  the town at the cars' size on the night road: left, middle, right
//   26–30  the town close (s = 200; 30 at s = 300): tower, diner, pumps, motel and arrow, people
//   31, 32  the three angels next to Tom (s = 180): every mood, empty-handed and with harp and trumpet
//   33  angels close (s = 300)      34  the pose's extremes: wings, halo, squash, lean, sitting, small
//   35  at film size on the cloud tops, with banks, the gate, the lectern and the band going by
//   36  the bank and the set dressing close (s = 200)
//   37  the moon at the sizes the ascent uses (r = 40 … 250)      38  the moon at the top of the ascent (r = 325) behind the band
//   39  the moon as the ground (r = 900): the car lands, the flag 40  the face, close (r = 430)
//   41  the landing on flat ground; phase, glow, the flag round the limb
//   42  the dressing room: bare nail, then the frame on its way up      43  with the Devil on his mark (s = 200)
//   44  the autograph, close and at four sizes      45  a camera pushing in on the room (cached per scale)
//   46  the room's four corners at twice the size
Motion.scene({
    fps: 24, duration: 47, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js',
        'sandbox/2026-11-11-runnin-down-a-dream/rides.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js',
        { src: 'sandbox/2026-11-11-runnin-down-a-dream/inferno.js', optional: true }, 'sandbox/2026-11-11-runnin-down-a-dream/skyward.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }, { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
    draw(g, t, env) {
        const C = Cereal, K = C.COL, S = Skyward, sheet = Math.floor(t + 1e-6), v = Math.round((t - sheet) * 4) % 4, tt = 190.5 + v / 12;
        const CAR = Rig.CAR;
        const night = (a = '#0e0b2c', b = '#130f3a') => C.sunburst(g, 500, 1100, { n: 12, rot: 0.2, a, b });
        const stars = () => {
            const r = Motion.rng('devstars');
            for (let i = 0; i < 40; i++) C.sparkle(g, r() * 1000, r() * 1000, 5 + r() * 9, { color: i % 5 ? '#fffbe8' : K.yellow });
        };
        const zoom = (z, cx, cy, fn) => {
            g.save();
            g.translate(500, 500);
            g.scale(z, z);
            g.translate(-cx, -cy);
            fn();
            g.restore();
        };

        const YS = [0, 120, 400, 900, 1700, 2500, 3000, 3320, 3700, 3950, 4150, 4600, 5500, 6800, 8000, 9300, 10800, 12000];
        if (sheet < 18) {
            // the ascent with the band on its car; variants: speed lines, dawn, a little higher and to the side
            const Y = YS[sheet] + (v === 3 ? 160 : 0), o = { speedLines: v === 1 ? 1 : 0, theme: v === 2 ? 'dawn' : 'night', x: v === 3 ? 240 : 0, town: { lights: 1, wake: sheet < 2 ? 1 : 0 } };
            S.ascent(g, tt, Y, o);
            const cy = sheet === 0 ? [960, 900, 960, 840][v] : sheet === 1 ? 740 : 610;
            Rig.band(g, tt, 500, cy, 50, { spin: v, shadow: false, exhaust: 0.4, sing: true, lean: sheet < 2 ? 0.2 : 0 });
            S.ascentFront(g, tt, Y, o);
        } else if (sheet <= 20) {
            // the backdrop alone
            const Y = [[0, 900, 1700, 3000], [3700, 4150, 4600, 5500], [6800, 8000, 9300, 12000]][sheet - 18][v], o = { speedLines: sheet === 19 ? 1 : 0, dawn: sheet === 20 ? 0.5 : 0 };
            S.ascent(g, tt, Y, o);
            S.ascentFront(g, tt, Y, o);
        } else if (sheet === 21) {
            const [Y, o] = [[1200, { moon: false, town: false, x: -900 }], [11400, { moonLook: { face: 1, wink: 1, smile: 0.6, glow: 0.6 }, moonTo: { x: 640, y: 420, r: 300 } }], [4500, { x: 1400, speedLines: 0.4 }], [300, { x: 500, moon: { x: 200, y: 160, r: 44 }, town: { lights: 0.4, wake: 0 } }]][v];
            S.ascent(g, tt, Y, o);
            S.ascentFront(g, tt, Y, o);
        } else if (sheet === 22) {
            // the town on its street behind the crater, as the ascent draws it: lights coming on, then everybody out
            const o = { town: [{ lights: 0, wake: 0 }, { lights: 0.5, wake: 0 }, { lights: 1, wake: 0.5 }, { lights: 1, wake: 1 }][v] };
            S.ascent(g, tt, 0, o);
            S.ascentFront(g, tt, 0, o);
        } else if (sheet >= 23 && sheet <= 25) {
            // at the cars' size on the night road: its left, its middle, its right
            World.back(g, tt, 4000, 'night', { moon: { x: 770, y: 190, r: 62 }, stars: 1 });
            const o = [{ lights: 1, wake: 0 }, { lights: 0.3, wake: 0.3 }, { lights: 1, wake: 0.66 }, { lights: 1, wake: 1 }][v];
            S.town(g, 500 + [8.2, 2.2, -5.6][sheet - 23] * CAR, World.ROAD0 - 4, CAR, { ...o, t: tt });
        } else if (sheet >= 26 && sheet <= 30) {
            // close (s = 200): the tower, the diner, the pumps, the motel and its sign, the people
            C.sunburst(g, 500, 900, { n: 12, rot: 0.2, a: '#1b1750', b: '#231e62' });
            const o = [{ lights: 1, wake: 0 }, { lights: 0, wake: 0.4 }, { lights: 1, wake: 0.7 }, { lights: 1, wake: 1 }][v];
            const cx = [8.6, 4.4, -2.6, -7.2, -9.2][sheet - 26], s = sheet === 30 ? 300 : 200;
            S.town(g, 500 + cx * s + (sheet === 30 ? [0, 14.6, 0.6, 16.6][v] * s : 0), sheet === 26 ? 1300 : sheet === 30 ? 900 : 960, s, { ...o, t: tt });
        } else if (sheet === 31 || sheet === 32) {
            // the three angels next to Tom at the same scale (s = 180): every mood, empty-handed and with their instruments
            C.sunburst(g, 500, 620, { n: 12, rot: 0.2, a: '#231e62', b: '#2c2380' });
            S.cloudBank(g, 500, 905, 180, { w: 5.8, seed: 'sheet', t: tt, bob: 0, part: 'back' });
            const mood = sheet === 31 ? ['serene', 'shocked', 'ears', 'rock'][v] : ['serene', 'ears', 'peek', 'rock'][v], fl = S.flap(tt);
            Cast.tom(g, 120, 900, 180, { shades: 1, strum: 0.4 });
            [0, 1, 2].forEach((who) => S.angel(g, 372 + who * 250, 900, 180, { who, mood, flap: [fl, 1, 0, fl][v], harp: sheet === 32 && who === 0, trumpet: sheet === 32 && who === 1, halo: [0, -0.3, 0.25, 0.1][v] * (who - 1), haloUp: mood === 'shocked' ? 1 : 0, strum: 0.6, headDy: mood === 'rock' ? 0.03 : 0 }));
            S.cloudBank(g, 500, 905, 180, { w: 5.8, seed: 'sheet', t: tt, bob: 0, part: 'front' });
        } else if (sheet === 33) {
            // close (s = 300)
            C.sunburst(g, 500, 620, { n: 12, rot: 0.2, a: '#231e62', b: '#2c2380' });
            const o = [{ who: 0, mood: 'rock', harp: true, strum: -0.8 }, { who: 1, mood: 'ears', trumpet: true }, { who: 2, mood: 'peek', flap: 1, halo: 0.3 }, { who: 0, mood: 'serene', harp: true, strum: 0.8 }][v];
            S.angel(g, 280, 940, 300, o);
            S.angel(g, 740, 940, 300, [{ who: 1, mood: 'rock', trumpet: true, flap: 1 }, { who: 2, mood: 'ears', harp: true }, { who: 1, mood: 'serene', trumpet: true }, { who: 2, mood: 'shocked', harp: true, haloUp: 1, flap: 1 }][v]);
        } else if (sheet === 34) {
            // the pose at its extremes (s = 150): wings folded and raised, the halo tilted and up, squash, lean, head, sitting with each prop
            C.sunburst(g, 500, 620, { n: 12, rot: 0.2, a: '#231e62', b: '#2c2380' });
            const row = (y, poses) => poses.forEach((p, i) => {
                const x = 130 + i * 185;
                if (p.sit) S.cloudBank(g, x, y, 150, { w: 1.5, seed: 's' + i, bob: 0 });
                S.angel(g, x, y, 150, p);
            });
            if (v === 0) {
                row(430, [{ who: 0, flap: 0 }, { who: 1, flap: 0.5 }, { who: 2, flap: 1 }, { who: 0, mood: 'rock', armUp: 0 }, { who: 1, mood: 'rock', armUp: 1, headDy: 0.05 }]);
                row(880, [{ who: 2, halo: -0.5 }, { who: 0, halo: 0.5, haloUp: 1 }, { who: 1, squash: 0.2, mood: 'shocked' }, { who: 2, squash: -0.12, lean: 0.12, mood: 'rock' }, { who: 0, headTilt: 0.2, headDy: -0.05, mood: 'peek' }]);
            } else if (v === 1) {
                row(380, [{ who: 0, sit: true }, { who: 1, sit: true, mood: 'ears' }, { who: 2, sit: true, mood: 'rock' }, { who: 0, sit: true, harp: true }, { who: 1, sit: true, trumpet: true }]);
                row(840, [{ who: 2, sit: true, harp: true, mood: 'rock', strum: 1 }, { who: 0, sit: true, trumpet: true, mood: 'rock' }, { who: 1, sit: true, harp: true, mood: 'ears' }, { who: 2, sit: true, trumpet: true, mood: 'ears' }, { who: 0, sit: true, mood: 'shocked', haloUp: 1 }]);
            } else if (v === 2) {
                row(430, [{ who: 0, harp: true, mood: 'shocked' }, { who: 1, harp: true, mood: 'peek' }, { who: 2, harp: true, mood: 'serene', strum: -1 }, { who: 0, harp: true, mood: 'rock', strum: 1 }, { who: 1, harp: true, mood: 'rock', strum: -1 }]);
                row(880, [{ who: 2, trumpet: true, mood: 'shocked' }, { who: 0, trumpet: true, mood: 'peek' }, { who: 1, trumpet: true, mood: 'serene' }, { who: 2, trumpet: true, mood: 'rock', armUp: 0.3 }, { who: 0, trumpet: true, mood: 'ears' }]);
            } else {
                // small, as in a wide shot (s = 56), and with a shadow on a floor
                g.fillStyle = K.navy;
                g.fillRect(0, 700, 1000, 300);
                ['serene', 'shocked', 'ears', 'peek', 'rock'].forEach((mood, i) => [0, 1, 2].forEach((who) => S.angel(g, 90 + i * 190 + who * 58, 300 + who * 150, 56, { who, mood, harp: who === 0, trumpet: who === 1, flap: S.flap(tt + who * 0.1) })));
                [0, 1, 2].forEach((who) => S.angel(g, 250 + who * 250, 900, 110, { who, mood: 'rock', shadow: true, harp: who === 2 }));
            }
        } else if (sheet === 35) {
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
                S.angel(g, 555, y0 + 40 + dy, s, { who: 2, mood, flap: S.flap(tt + 0.1) });
            });
            S.cloudBank(g, 880, y0 + 60, s, { w: 1.6, seed: 'c', t: tt });
            S.angel(g, 880, y0 + 60 + S.bankBob(tt, 'c') * s, s, { who: 2, mood, sit: true, flap: S.flap(tt + 0.3) });
            S.ascentFront(g, tt, Y, o);
        } else if (sheet === 36) {
            // the bank and the set dressing, close (s = 200); a sitting angel
            C.sunburst(g, 500, 620, { n: 12, rot: 0.2, a: '#231e62', b: '#2c2380' });
            const dawn = v === 3 ? 1 : 0;
            S.cloudBank(g, 330, 760, 200, { w: [2.6, 3.4, 2.2, 3][v], seed: 'x' + v, t: tt, part: 'back', dawn });
            if (v < 2) S.pearlyBits(g, 250, 760, 190, { ajar: [0.6, 1][v], lectern: false });
            else S.pearlyBits(g, 330, 760, 240, { gate: v === 3, lectern: v === 2, lecternAt: [0, 0], ajar: 0 });
            S.cloudBank(g, 330, 760, 200, { w: [2.6, 3.4, 2.2, 3][v], seed: 'x' + v, t: tt, part: 'front', dawn });
            S.cloudBank(g, 790, 420, 200, { w: 1.8, seed: 'y', t: tt, dawn });
            S.angel(g, 790, 420, 200, { who: v % 3, mood: ['serene', 'rock', 'peek', 'ears'][v], sit: true, harp: v === 0, trumpet: v === 1, flap: v / 3 });
        } else if (sheet === 37) {
            night();
            stars();
            const o = [{}, { face: 1 }, { glow: 1 }, { phase: 0.3, glow: 0.5 }][v];
            S.moon(g, 110, 150, 40, o);
            S.moon(g, 270, 170, 62, o);
            S.moon(g, 500, 220, 110, o);
            S.moon(g, 800, 280, 170, o);
            S.moon(g, 330, 660, 250, o);
            S.moon(g, 760, 760, 90, o);
        } else if (sheet === 38) {
            night();
            stars();
            S.moon(g, 500, 380, 325, [{}, { face: 1, glow: 0.4 }, { face: 1, wink: 1, glow: 0.7 }, { face: 1, wink: 1, smile: 1, glow: 1 }][v]);
            Rig.band(g, tt, 500, 640, 50, { spin: v, shadow: false, exhaust: 0.4, sing: true });
        } else if (sheet === 39) {
            night();
            stars();
            const k = [0.12, 0.35, 0.65, 1][v], mx = 500, my = 1520, r = 900, cx = 480, s = 56;
            S.moon(g, mx, my, r, { flag: { a: -0.33, s, k: v / 3 + 0.34, t: tt }, t: tt });
            const o = { r, t: tt };
            S.landing(g, cx, my - r, s, k, { ...o, part: 'back' });
            Rig.band(g, tt, cx + S.landingSlide(k) * s, my - r + 1, s, { spin: 6 * S.landingSlide(k), bounce: v === 0 ? 1 : 0, sing: true });
            S.landing(g, cx, my - r, s, k, { ...o, part: 'front' });
        } else if (sheet === 40) {
            night();
            S.moon(g, 500, 500, 430, [{ face: 0.5 }, { face: 1 }, { face: 1, wink: 1, look: [0.8, 0.6] }, { face: 1, wink: 1, smile: 1, look: [-0.6, 0.8] }][v]);
        } else if (sheet === 41) {
            night();
            stars();
            if (v === 0) {
                // the landing on flat ground, at five moments
                g.fillStyle = S.MOON.cream;
                g.fillRect(0, 520, 1000, 480);
                C.poly(g, [[0, 520], [1000, 520]], { ink: K.ink, lw: 5, close: false });
                [0.05, 0.3, 0.55, 0.8, 1].forEach((k, i) => S.landing(g, 250 + (i % 2) * 520, 600 + Math.floor(i / 2) * 150, 40, k, { t: tt }));
            } else [[250, 250, { phase: 0.75 }], [750, 250, { phase: 0.5, glow: 1 }], [250, 750, { phase: 0.15 }], [750, 750, { phase: 0, glow: 0.5 }]].forEach(([x, y, o], i) => S.moon(g, x, y, 190, { ...(v === 3 ? {} : o), face: v === 1 ? 1 : 0, rot: v === 2 ? 0.4 * (i - 1.5) : 0, flag: v === 3 ? { a: (i - 1.5) * 1.2, t: tt, k: [0.2, 0.5, 1, 1][i] } : false }));
        } else if (sheet === 42) {
            // the dressing room: the nail bare, then the frame on its way up
            S.backstage(g, tt, v === 0 ? { flames: 1 } : { frame: { k: [0, 0.4, 0.8, 1][v] }, flames: [0, 0, 0.4, 0.7][v], bulbs: [1, 0.3, 1, 1][v], tv: v === 1 ? 'off' : 'blue' });
        } else if (sheet === 43) {
            // with the Devil on his mark (s = 200), carrying the frame up, then stepping back
            const k = [0.05, 0.45, 0.74, 1][v], F = S.frameAt({ k }), [dx, dy] = S.BACKSTAGE.devil, ds = S.BACKSTAGE.devilS;
            const hold = !F.hung, hand = (p) => [(p[0] - dx) / ds + (p[0] < dx ? 0.1 : -0.1), (p[1] - dy) / ds + 0.04];
            S.backstage(g, tt, { frame: hold ? null : { k } });
            if (hold) S.autograph(g, F.x, F.y, F.s, { tilt: F.tilt });
            Devil.draw(g, dx, dy, ds, hold ? { mood: 'grin', handR: hand(F.grips[0]), handL: hand(F.grips[1]), headTilt: -0.03, look: 0 } : { mood: 'laugh', handR: [-0.62, -0.5], handL: [0.62, -0.5], tail: 0.04 });
        } else if (sheet === 44) {
            // the autograph, close
            C.sunburst(g, 500, 500, { n: 12, rot: 0.2, a: '#8a1a2c', b: '#7b1627' });
            if (v < 2) S.autograph(g, 500, 500, [760, 520][v], { glint: [0.3, 0.8][v], wire: v === 1 });
            else {
                S.autograph(g, 280, 300, 250, { wire: true });
                S.autograph(g, 720, 280, 170, { tilt: 0.08, wire: true });
                S.autograph(g, 300, 720, 380, { tilt: -0.05, glint: v === 3 ? 1 : 0 });
                S.autograph(g, 760, 720, 120, { glint: 0.7 });
            }
        } else if (sheet === 45) {
            // the room through a camera that pushes in on the frame (the still part is cached per scale)
            const z = [1.6, 2.4, 2, 2][v], [cx, cy] = [[500, 380], [500, 340], [200, 420], [830, 600]][v];
            zoom(z, cx, cy, () => S.backstage(g, tt, { frame: { k: 1 } }));
        } else {
            // the room's corners, twice the size
            const [cx, cy] = [[250, 250], [750, 250], [250, 750], [750, 750]][v];
            zoom(2, cx, cy, () => S.backstage(g, tt, { frame: { k: 1 }, cache: false }));
        }
    },
    post(ctx, t, env) {
        const sheet = Math.floor(t + 1e-6);
        if (sheet < 26 || [31, 32, 35, 37, 38, 39, 42, 43].includes(sheet)) Cereal.post(ctx, t, env);
    },
});
