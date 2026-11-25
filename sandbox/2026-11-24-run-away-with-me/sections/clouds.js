// uses: set/clouds-life.js, set/clouds-city.js
// Section · up in the clouds, 1:39–2:11 (bars 49–65): verse 2 (the high: they rise over Miami
// Beach, the streets a grid of light, clouds lit from below, the city that never sleeps), pre-
// chorus 2 (back down on Ocean Drive's neon in the car: the kiss at a red light) and the bar
// without bass, held in front of their hotel. The city: set/clouds-city.js. Contract:
// sections/README.md.
(() => {
    const BAR = 2.01672, B = (n) => 0.415 + n * BAR;
    const SHOTS = [
        [B(49), B(50), '1 · up in the clouds: the rise'],
        [B(50), B(51), '2 · over the city: the grid'],
        [B(51), B(52), '3 · we never sleep: the diner at 4 am'],
        [B(52), B(53), '4 · with me: the two on the roof'],
        [B(53), B(55), '5 · I wanna stay: the pull back'],
        [B(55), B(56), '6 · the dive to Ocean Drive'],
        [B(56), B(58), '7 · driving you: from the front'],
        [B(58), B(60), '8 · all night: beside the car'],
        [B(60), B(62), '9 · lips in the streetlights: the red light'],
        [B(62), B(64), '10 · be there with you: green'],
        [B(64), B(65), '11 · the bar without bass: the hotel'],
    ];
    const shotIndex = (T) => { const i = SHOTS.findIndex(([a, b]) => T >= a && T < b); return i < 0 ? SHOTS.length - 1 : i; };
    const C = () => CloudsCity;

    // what the music does here: the flash as everything comes back (99.23), the high through the
    // verse (sparkle, halos, tracers, the form constants), softer in the pre-chorus, and the bar
    // without bass: the lamps dim and hold, then breathe in towards chorus 2
    function fxAt(T) {
        const f = Film.effects(T);
        const high = T < B(56) ? 1 : T < B(64) ? 0.45 : 0.25;
        const hold = Ease.inOut(Ease.seg(T, B(64), B(64) + 0.6)) * (1 - Ease.seg(T, B(65) - 0.04, B(65)));
        const inhale = Ease.in(Ease.seg(T, B(65) - 0.9, B(65)));
        const flash = T >= B(49) ? 0.6 * Math.exp(-(T - B(49)) * 5) : 0;
        return {
            ...f, black: 0, grid: 0, hue: 0, breathe: 0, hold, inhale, flash, high, trip: 0.45 * high,
            halo: 1 + f.mid * 0.3 + high * (0.25 + f.kick * 0.45) + inhale * 0.7,
            star: high * (0.15 + f.kick * 0.35) + inhale * 0.7,
            lampPower: 1 - hold * 0.55 + inhale * 0.55,
            trail: high, forms: high * (0.13 + 0.1 * f.bass) + inhale * 0.15,
        };
    }

    // the car on Ocean Drive (northbound): cruising at 9 m/s, braking to the red light at the
    // stop line (stopped 121.2–125.55), away on the green, pulling up at their hotel
    function carZ(T) {
        const S = C().STOP;
        if (T < 118.2) return S - 13.5 - 9 * (118.2 - T);
        if (T < 121.2) { const t = T - 118.2; return S - 13.5 + 9 * t - 1.5 * t * t; }
        if (T < 125.55) return S;
        const a = 3.5, tA = 9 / a, t = T - 125.55;
        if (t < tA) return S + 0.5 * a * t * t;
        const z1 = S + 0.5 * a * tA * tA, tC = 130.1 - 125.55 - tA;
        if (t < tA + tC) return z1 + 9 * (t - tA);
        const u = Math.min(1.4, t - tA - tC);
        return z1 + 9 * tC + 9 * u - (9 / 2.8) * u * u;
    }
    const pose = (T) => ({ x: C().LANE, y: 0, z: carZ(T), pitch: 0 });

    // a camera from its parameters (kept on it for the sky's camera)
    const mk = (o, env) => { const cam = Neon.camera({ ...o, W: env.W, H: env.H }); cam.o = o; return cam; };
    function camera(shot, T, env) {
        const [a, b] = SHOTS[shot], u = Ease.seg(T, a, b), e = Ease.inOut(u), ps = pose(T);
        switch (shot) {
            case 0: { // the rise: from over the park, up through the clouds, the city opening below
                const k = Ease.inOut(Ease.seg(T, a, b + 0.3));
                return mk({ pos: [40 - k * 50, 24 + k * 360, -150 + k * 40], yaw: -0.5 + k * 0.08, pitch: -0.1 - k * 0.68, roll: 0.02 * (1 - k), f: 900, Y0: 0 }, env);
            }
            case 1: // straight down over the grid, turning
                return mk({ pos: [-250 + u * 30, 440 - u * 20, 40 + u * 40], yaw: 0.12 + u * 0.14, pitch: -Math.PI / 2 + 0.015, roll: 0, f: 1000, Y0: 0, down: true }, env);
            case 2: { // across Washington Avenue, sliding past the diner and the laundromat
                return mk({ pos: [-188.6, 1.55, 112.5 + u * 13], yaw: -Math.PI / 2 + 0.1, pitch: 0.08, roll: 0, f: 1050, Y0: -Math.PI / 2 }, env);
            }
            case 3: { // on their roof, behind the two of them, pushing in
                return mk({ pos: [-15.6, C().HOTEL.h + 1.62, 245.6 + e * 1.4], yaw: 0.02, pitch: -0.03, roll: 0, f: 1200, Y0: 0 }, env);
            }
            case 4: { // pulling back and up, the roof and the two of them shrinking into the city
                return mk({ pos: [-15.6 - e * 20, C().HOTEL.h + 1.62 + e * 125, 247 - e * 120], yaw: 0.02 + e * 0.06, pitch: -0.035 - e * 0.5, roll: 0.01 * e, f: 1150 - e * 250, Y0: 0 }, env);
            }
            case 5: { // the dive: from high over the park down behind the car on Ocean Drive
                const k = Ease.inOut(u);
                return mk({ pos: [60 - k * 56, 130 - k * 124, ps.z - 60 + k * 45], yaw: -0.55 + k * 0.5, pitch: -0.75 + k * 0.68, roll: 0.03 * Math.sin(u * Math.PI), f: 900, Y0: 0 }, env);
            }
            case 6: // ahead of the car, low, looking back at the two of them, the car gaining
                return mk({ pos: [C().LANE + 0.5, 1.2, ps.z + 5.6 - 1.3 * e], yaw: Math.PI + 0.06, pitch: 0.0, roll: 0, f: 1450, Y0: Math.PI }, env);
            case 7: // beside the car on the park side, tracking with it, the hotels behind
                return mk({ pos: [C().LANE + 5.0 - e * 0.4, 1.75, ps.z + 0.75], yaw: -Math.PI / 2 - 0.2, pitch: -0.03, roll: 0, f: 1300, Y0: -Math.PI / 2 }, env);
            case 8: // stopped at the red light: from the park side behind them, up the strip
                return mk({ pos: [6.4 - e * 0.5, 2.55, C().STOP - 5.8 + e * 0.9], yaw: -0.66 + e * 0.04, pitch: 0.0, roll: 0, f: 1100, Y0: 0 }, env);
            case 9: // the green: the car pulls away up Ocean Drive, the camera rising
                return mk({ pos: [C().LANE + 0.3, 2.2 + e * 8, C().STOP - 7 + e * 3], yaw: -0.06, pitch: -0.04 - e * 0.08, roll: 0, f: 1000, Y0: 0 }, env);
            default: // the bar without bass: their hotel from across the street, the car pulling up
                return mk({ pos: [27 - e * 3, 7.2, 236.5], yaw: -Math.PI / 2, pitch: 0.075, roll: 0, f: 1000 + e * 80, Y0: -Math.PI / 2 }, env);
        }
    }

    // the two of them in the car: front, back or side cut-outs (as film.js does for the causeway)
    function couple(g, cam, ps, T, d, view, lean) {
        const pos = { him: -0.42, her: 0.42 };
        const sx = (who) => cam.p(Car.W(ps, [pos[who], 1.2, -0.52]))[0];
        const sway = Math.sin(T * 5.3) * 0.004;
        for (const who of view === 'front' ? ['her', 'him'] : ['him', 'her']) {
            const other = who === 'her' ? 'him' : 'her', toward = Math.sign(sx(other) - sx(who));
            Couple.drawn(g, cam, ps, who, pos[who] - Math.sign(pos[who]) * 0.21 * lean, -0.52, {}, { view, sway: who === 'her' ? sway : -sway, T, d, cut: who === 'her' ? 0.46 : 0.48, lean: toward * 0.32 * lean, wind: 0.008 });
        }
    }
    // the kiss: they lean in on «lips» (122.4) and stay until the light turns green
    const kiss = (T) => Ease.inOut(Ease.seg(T, 121.9, 122.8)) * (1 - Ease.inOut(Ease.seg(T, 125.1, 125.9)));

    // something opaque painted on its own layer, so it hides the light behind it
    function onLayer(g, L, env, name, paint) {
        Ink.occlude(null);
        const pic = Motion.layer(env, name, paint);
        L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.globalCompositeOperation = 'destination-out'; L.drawImage(pic, 0, 0); L.restore();
        g.drawImage(pic, 0, 0, env.W, env.H);
        Ink.occlude(L);
    }

    function frame(g, env, N, T, d, cam, shot) {
        const fx = fxAt(T), o = cam.o, city = C();
        // the far world: sky, the skyline across the water, the water, the form constants, the
        // clouds above the camera; drawn through a camera turned so the shot's direction is the
        // sky's own (the drawn sky and skyline were built looking north)
        Ink.occlude(null);
        let L = N.light();
        if (o.down) {
            g.fillStyle = '#18065e'; g.fillRect(0, 0, env.W, env.H);
            Ink.strokes(g, 0, 0, env.W, env.H, { ang: 0.12, spread: 0.1, count: 60, len: 140, w: 4, cols: [P.deep, P.navy, '#2a0c7e'], seed: 4400, d, alpha: 0.8 });
        } else {
            const sk = Neon.camera({ pos: o.pos, yaw: o.yaw - o.Y0, pitch: o.pitch, roll: o.roll, f: o.f, W: env.W, H: env.H }), ya = o.yaw - o.Y0;
            const horizon = sk.p([o.pos[0] + Math.sin(ya) * 9000, Causeway.WATER, o.pos[2] + Math.cos(ya) * 9000])[1];
            Drawn.sky(g, sk, T, d, fx, env, horizon);
            Drawn.city(g, sk, T, d, fx, env);
            Drawn.bay(g, L, sk, T, d, fx, env, horizon);
            city.forms(L, sk, T, fx, env);
        }
        Ink.occlude(L);
        city.clouds(g, cam, T, d, fx, env, 'above');
        Ink.occlude(null);
        N.bloom(g, L, { strength: 0.35 + fx.hold * 0.15, core: 0.5 });
        // the near world: every opaque thing hides the light behind it
        L = N.light();
        Ink.occlude(L);
        const extra = [];
        if (shot >= 5) {
            const ps = pose(T), view = shot === 6 ? 'front' : shot === 7 ? 'side' : 'back', lean = shot === 8 ? kiss(T) : 0;
            const light = { lamp: city.lampLight(ps.z + 1) * fx.lampPower, hue: 0, power: 1, city: 1, drawn: true, d, lamps: city.lampsNear(ps.z) };
            extra.push({ x: ps.x, y: 0.8, z: ps.z, draw: () => {
                Ink.occlude(null);
                const carL = Motion.layer(env, 'cloudsCarL', () => {}), cl = carL.getContext('2d');
                cl.setTransform(env.k, 0, 0, env.k, 0, 0); cl.globalCompositeOperation = 'lighter';
                const pic = Motion.layer(env, 'cloudsCar', (c) => Car.draw(c, cl, N, cam, ps, light, (gg) => couple(gg, cam, ps, T, d, view, lean)));
                L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.globalCompositeOperation = 'destination-out'; L.drawImage(pic, 0, 0); L.globalCompositeOperation = 'lighter'; L.drawImage(carL, 0, 0); L.restore();
                g.drawImage(pic, 0, 0, env.W, env.H);
                Ink.occlude(L);
            } });
        }
        if (shot === 3 || shot === 4) {
            // the two of them on their roof, from behind, looking north over the city; the low
            // parapet at the roof's edge in front of them
            const h = city.HOTEL.h, zf = 250.2, lean = shot === 3 ? Ease.inOut(Ease.seg(T, 105.9, 106.9)) : 1;
            extra.push({ x: -15.6, y: h + 1, z: zf, draw: () => onLayer(g, L, env, 'cloudsPpl', (c) => {
                Couple.standing(c, cam, 'him', [-16.15 + 0.1 * lean, h, zf], { view: 'back', T, d, lean: 0.035 * lean, wind: 0.006 });
                Couple.standing(c, cam, 'her', [-15.2 - 0.08 * lean, h, zf + 0.1], { view: 'back', T, d, lean: -0.05 * lean, wind: 0.012 });
            }) });
            const hb = city.build().B.find((b) => b.ours);
            extra.push({ x: -15.6, y: h, z: hb.z1 - 0.3, depth: Math.hypot(cam.pos[0] + 15.6, cam.pos[1] - h, cam.pos[2] - hb.z1) - 0.2, draw: () => {
                const s = cam.f / Math.max(1, cam.view([-15.6, h, hb.z1])[2]);
                const fr = Neon.poly(cam, [[hb.x0, h, hb.z1 - 0.35], [hb.x1, h, hb.z1 - 0.35], [hb.x1, h + 0.9, hb.z1 - 0.35], [hb.x0, h + 0.9, hb.z1 - 0.35]]);
                if (fr) Ink.shape(g, fr, '#c04a8a', { w: Math.min(5, Math.max(1.2, 0.04 * s)), seed: 'parapet', d, jit: 0.4 });
                const tp = Neon.poly(cam, [[hb.x0, h + 0.9, hb.z1 - 0.35], [hb.x1, h + 0.9, hb.z1 - 0.35], [hb.x1, h + 0.9, hb.z1], [hb.x0, h + 0.9, hb.z1]]);
                if (tp) Ink.shape(g, tp, P.salmon, { w: Math.min(5, Math.max(1.2, 0.04 * s)), seed: 'parapetTop', d, jit: 0.4 });
                if (fr) { const A = cam.p([hb.x0 + 1, h + 0.6, hb.z1 - 0.36]), Bp = cam.p([hb.x1 - 1, h + 0.6, hb.z1 - 0.36]); Ink.hatch(g, [A[0], A[1]], [Bp[0], Bp[1]], { count: 9, len: Math.min(40, 0.4 * s), w: Math.min(4, Math.max(1, 0.035 * s)), col: P.pink, seed: 'parH', d, n: [0, 1], ang: 0.3 }); }
            } });
        }
        city.draw(g, L, cam, T, d, fx, env, extra);
        city.clouds(g, cam, T, d, fx, env, 'below');
        Ink.occlude(null);
        N.bloom(g, L, { strength: (0.4 + fx.high * 0.12) * (1 - fx.hold * 0.35 + fx.inhale * 0.6), core: 0.55 });
        if (fx.flash > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,120,220,${fx.flash})`; g.fillRect(0, 0, env.W, env.H); g.restore(); }
    }
    const P = Ink.PAL;

    Sections.clouds = {
        from: B(49), to: B(65), shots: SHOTS,
        async setup() { CloudsCity.build(); return {}; },
        draw(g, env, T, d) {
            const { N } = env.state, shot = shotIndex(T + 1 / 48);
            frame(g, env, N, T, d, camera(shot, T, env), shot);
        },
    };
})();
