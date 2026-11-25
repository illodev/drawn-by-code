// uses: set/escape-sets.js
// Section · the escape, 0:24.6–0:46.8 (bars 12–22): the second half of verse 1. The highs thin
// out for four bars and the room goes quiet round her: one small pill on the bar, she alone in a
// crowd that slows, the pill gone and the lights swelling, the mirror ball throwing its first
// tracers. The hi-hats come back (32.68) and the room with them, louder; he finds her across it.
// «Packing a bag, leaving tonight while everyone's sleeping»: a suitcase on a hotel bed, the
// windows across the street going dark one by one. «Let's run away»: out past the pool to the
// white convertible, and the car pulls away up Ocean Drive. Sets: set/escape-sets.js; the car:
// props/car.js (on its own layer, erasing the light behind it, as in film.js). Contract:
// sections/README.md.
(() => {
    const BAR = 2.01672, B = (n) => 0.415 + n * BAR;
    const S = EscapeSet, P = Ink.PAL;
    const SHOTS = [
        [B(12), B(13), '1 · the pill on the bar'],
        [B(13), B(14), '2 · the room goes quiet round her'],
        [B(14), B(15), '3 · the pill gone, the lights swell'],
        [B(15), B(16), '4 · the mirror ball throws tracers'],
        [B(16), B(17), '5 · the room comes back louder'],
        [B(17), B(18), '6 · he finds her across the room'],
        [B(18), B(19), '7 · packing a bag'],
        [B(19), B(20), '8 · the windows go dark'],
        [B(20), B(21), '9 · out past the pool'],
        [B(21), B(22), '10 · in the car, the lights come on'],
        [B(22), B(23), '11 · the car pulls away'],
    ];
    const shotAt = (T) => { const i = SHOTS.findIndex(([a, b]) => T >= a && T < b); return i < 0 ? (T < SHOTS[0][0] ? 0 : SHOTS.length - 1) : i; };

    // what the music does here: the quiet (bars 12–15, the highs gone), the pill working (the
    // colours swell, halos grow, the first tracers from bar 14), the hi-hats back at bar 16 with a
    // flash, a residue of the swell that climbs towards the drive
    function effects(T) {
        const kick = Song.env('kick', T), high = Song.env('high', T), mid = Song.env('mid', T), bass = Song.env('bass', T);
        const quiet = Ease.inOut(Ease.seg(T, B(12), B(12) + 0.7)) * (1 - Ease.seg(T, B(16) - 0.05, B(16)));
        const work = Ease.inOut(Ease.seg(T, B(14), B(16)));
        const swell = T < B(16) ? work : 0.42 + 0.3 * Ease.seg(T, B(16), B(23));
        const tracer = T < B(16) ? Ease.seg(T, B(14) + 0.8, B(16)) : 0.3;
        const flash = T >= B(16) ? 0.5 * Math.exp(-(T - B(16)) * 7) : 0;
        const hue = swell * 18 * Math.sin((T - B(14)) * 1.7);
        return { kick, high, mid, bass, quiet, swell, tracer, flash, hue, trip: 0, hold: 0, grid: 0, halo: 1 + swell * 1.3 + mid * 0.2, star: swell * 0.6 + (T >= B(16) ? high * 0.3 : 0) };
    }
    // the crowd's clock: slow motion through the quiet, back to the song's time after it
    const ct = (T) => (T < B(12) ? T : T < B(16) ? B(12) + (T - B(12)) * 0.22 : B(12) + 4 * BAR * 0.22 + (T - B(16)));

    // a camera at `pos` looking at `at`
    function look(env, pos, at, f, roll = 0, near = 0) {
        const dx = at[0] - pos[0], dy = at[1] - pos[1], dz = at[2] - pos[2];
        const yaw = Math.atan2(dx, dz), cam = Neon.camera({ pos, yaw, pitch: Math.atan2(dy, Math.hypot(dx, dz)), roll, f, W: env.W, H: env.H });
        cam.yaw = yaw;
        if (near) cam.near = near;
        return cam;
    }
    const HER = [0.6, 0, 4.0], HER5 = [0.35, 0, 2.6], HIM = [-1.5, 0, 11.0];
    const walkX = (T) => 18.6 - 1.9 * (T - B(20));
    const CAR0 = { x: 2.3, y: 0, z: 36, pitch: 0 };
    function carPose(T) {
        const t0 = B(22) + 0.12, u = Math.max(0, T - t0);
        return { x: CAR0.x - 0.5 * Ease.inOut(Ease.seg(T, t0, t0 + 1.4)), y: 0, z: CAR0.z + 0.5 * 5.5 * u * u, pitch: 0 };
    }
    function camera(shot, T, env) {
        const k = Ease.inOut(Ease.seg(T, SHOTS[shot][0], SHOTS[shot][1])), lin = Ease.seg(T, SHOTS[shot][0], SHOTS[shot][1]);
        switch (shot) {
            case 0: return look(env, [-0.008 + 0.002 * k, 0.025 - 0.002 * k, 0.133 + 0.008 * k], [0.0, 0.0109, 0.19], 1800, 0, 0.004);
            case 1: return look(env, [0.2 - 0.12 * k, 1.52, 1.05 + 0.75 * k], [HER[0] - 0.05, 1.36, HER[2]], 1250, 0.01);
            case 2: return look(env, [0.0 + 0.006 * k, 0.03 + 0.004 * k, 0.128 - 0.012 * k], [0.003, 0.013, 0.19], 1600, -0.012 * k, 0.004);
            case 3: return look(env, [0.95 - 0.35 * k, 2.5 + 0.08 * k, 6.95 + 0.25 * k], [0, 3.42, 8.5], 1200, 0.05 * Math.sin(lin * 2));
            case 4: return look(env, [2.3 - 0.5 * k, 1.72, -0.1 + 0.8 * k], [-0.6, 1.25, 11], 1000, 0.012);
            case 5: return look(env, [-0.35 - 0.3 * k, 1.62, 5.4 + 1.3 * k], [HIM[0], 1.55, HIM[2]], 1350);
            case 6: return look(env, [-0.28 + 0.05 * k, 1.6 - 0.08 * k, 1.35 + 0.12 * k], [0.02, 0.66, 2.22], 1500, -0.01);
            case 7: return look(env, [0.05 - 0.05 * k, 1.5, 1.55 + 0.3 * k], [0.05, 1.5, 4], 950);
            case 8: { const x = walkX(T); return look(env, [x + 1.5, 1.58 + 0.012 * Math.sin(T * 12.4), 37.6], [x - 8, 1.3, 36.75], 950, 0.006 * Math.sin(T * 6.2)); }
            case 9: return look(env, [-0.2 + 0.25 * k, 1.05, 39.9 - 0.4 * k], [2.2, 0.95, 35.7], 1150);
            default: return look(env, [5.1, 1.25, 31.0], [1.6, 0.9, 62], 1000);
        }
    }

    // --- painting helpers ---------------------------------------------------------------------
    // a figure painted on its own layer: it hides the light behind it, then lies on the picture
    function onLayer(g, L, env, fn, dark = 0) {
        const c = Motion.layer(env, 'escFig', (cg) => { fn(cg); if (dark > 0) { cg.save(); cg.globalCompositeOperation = 'source-atop'; cg.globalAlpha = dark; cg.fillStyle = '#0b0230'; cg.fillRect(0, 0, env.W, env.H); cg.restore(); } });
        L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.globalCompositeOperation = 'destination-out'; L.drawImage(c, 0, 0); L.restore();
        g.drawImage(c, 0, 0, env.W, env.H);
    }
    function carOn(g, L, env, N, cam, ps, light, people) {
        Ink.occlude(null);
        const carL = Motion.layer(env, 'carLight', () => {}), cl = carL.getContext('2d');
        cl.setTransform(env.k, 0, 0, env.k, 0, 0); cl.globalCompositeOperation = 'lighter';
        const pic = Motion.layer(env, 'carPic', (c) => Car.draw(c, cl, N, cam, ps, light, people));
        L.save(); L.setTransform(1, 0, 0, 1, 0, 0);
        L.globalCompositeOperation = 'destination-out'; L.drawImage(pic, 0, 0);
        L.globalCompositeOperation = 'lighter'; L.drawImage(carL, 0, 0);
        L.restore();
        g.drawImage(pic, 0, 0, env.W, env.H);
        Ink.occlude(L);
    }
    function carLight(ps, d) {
        const heads = S.lampHeads().filter((h) => Math.abs(h[2] - ps.z) < 40);
        const lamp = heads.reduce((m, h) => Math.max(m, Math.exp(-(((h[2] - ps.z) / 5) ** 2))), 0) * 0.8;
        return { lamp, hue: 0, power: 1, city: 1, drawn: true, d, lamps: heads };
    }
    function couple(gg, cam, ps, light, T, d, view) {
        const pos = { him: -0.42, her: 0.42 }, sway = Math.sin(T * 7.3) * 0.004;
        for (const who of view === 'front' ? ['her', 'him'] : ['him', 'her'])
            Couple.drawn(gg, cam, ps, who, pos[who], -0.52, light, { view, sway: who === 'her' ? sway : -sway, T, d, cut: who === 'her' ? 0.46 : 0.48, wind: ps.z > CAR0.z + 1 ? undefined : 0.004 });
    }
    // the light the frame ends with: the swell's colour lifted over everything, the flash at bar 16
    function finish(g, env, fx) {
        if (fx.swell > 0.02) { g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = `rgba(150,20,150,${0.16 * fx.swell})`; g.fillRect(0, 0, env.W, env.H); g.restore(); }
        if (fx.flash > 0.01) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,120,220,${fx.flash})`; g.fillRect(0, 0, env.W, env.H); g.restore(); }
    }

    // --- the shots ------------------------------------------------------------------------------
    function party(g, env, N, T, d, fx, cam, shot, sec) {
        const tc = ct(T);
        Ink.occlude(null);
        let L = N.light();
        S.room(g, L, cam, T, tc, d, fx);
        S.spots(g, L, cam, tc, fx, { d });
        if (fx.tracer > 0) N.trails(L, (c, Tp) => S.spots(null, c, cam, ct(Tp), fx), T, { n: 6, dt: 2 / 24, decay: 0.72, amount: 0.9 * fx.tracer });
        N.bloom(g, L, { strength: 0.4 + fx.swell * 0.35, core: 0.5 });
        L = N.light(); Ink.occlude(L);
        if (shot === 3) S.ball(g, L, cam, tc, d, fx);
        // the crowd and the two of them in one depth order: the dancers beyond the farthest of them,
        // that one, the dancers between, the nearer one, the dancers in front
        const cast = shot === 1 ? [{ who: 'her', at: HER, view: 'tq' }] : shot === 4 ? [{ who: 'her', at: HER5, view: 'back' }, { who: 'him', at: HIM, view: 'front' }] : shot === 5 ? [{ who: 'him', at: HIM, view: 'front' }] : [];
        for (const c of cast) c.depth = cam.view([c.at[0], 1, c.at[2]])[2];
        cast.sort((a, b) => b.depth - a.depth);
        let far = 1e9;
        for (const c of cast) {
            S.crowd(g, L, cam, tc, d, fx, sec.sil, { near: [c.depth, far] });
            onLayer(g, L, env, (cg) => Couple.standing(cg, cam, c.who, c.at, { view: c.view, T, d, sway: 0.01 * Math.sin(T * 2.2 + c.at[2]) }));
            far = c.depth;
        }
        S.crowd(g, L, cam, tc, d, fx, sec.sil, { near: [0, far] });
        Ink.occlude(null);
        N.bloom(g, L, { strength: 0.35 + fx.swell * 0.3, core: 0.5 });
    }

    function bar(g, env, N, T, d, fx, cam, shot) {
        const L = N.light();
        Ink.occlude(L);
        S.barTop(g, L, cam, T, ct(T), d, fx, { pill: shot === 0, drink: shot === 0 ? 0.78 : 0.42 });
        Ink.occlude(null);
        N.bloom(g, L, { strength: 0.45 + fx.swell * 0.45, core: 0.55 });
    }

    function room(g, env, N, T, d, fx, cam, shot) {
        const L = N.light();
        Ink.occlude(L);
        S.hotelRoom(g, L, cam, T, d, fx);
        if (shot === 6) S.suitcase(g, L, cam, T, d, fx, [
            { at: B(18) + 0.504, u: 0.1, t: -0.04, a: -0.12, kind: 'shirt' },
            { at: B(18) + 1.008, u: -0.1, t: 0.02, a: 0.2, kind: 'jacket' },
            { at: B(18) + 1.513, u: 0.12, t: -0.07, a: -0.4, kind: 'glasses' },
            { at: B(18) + 1.765, u: -0.16, t: -0.1, a: 0.5, kind: 'tape' },
        ]);
        if (shot === 7) for (const [who, x, lean] of [['him', -0.38, 0.03], ['her', 0.38, -0.03]]) onLayer(g, L, env, (cg) => Couple.standing(cg, cam, who, [x, 0, 3.65], { view: 'back', T, d, lean, wind: 0.002 }), 0.3);
        Ink.occlude(null);
        N.bloom(g, L, { strength: 0.4 + fx.swell * 0.3, core: 0.5 });
    }

    function outside(g, env, N, T, d, fx, cam, shot) {
        Ink.occlude(null);
        const L = N.light();
        S.sky(g, cam, T, d, fx, env);
        Ink.occlude(L);
        const ps = shot === 10 ? carPose(T) : CAR0;
        const light = carLight(ps, d);
        const carItem = { depth: cam.view([ps.x, 0.6, ps.z])[2], draw: () => carOn(g, L, env, N, cam, ps, light, (gg) => couple(gg, cam, ps, light, T, d, shot === 9 ? 'front' : 'back')) };
        if (shot === 8) {
            // from the courtyard: the street beyond the gate, then the courtyard, then the two of them
            S.street(g, L, cam, T, d, fx, env, { noHotels: true, items: [carItem] });
            for (const b of [0, 1]) S.hotel(g, L, cam, T, d, fx, b ? { z0: 42, z1: 64, h: 15, col: P.violet, neon: P.pink, tower: false, seed: 4242 } : { z0: 0, z1: 30, h: 13, col: P.salmon, neon: P.cyan, tower: true, seed: 77, ours: true });
            S.gate(g, L, cam, T, d, fx);
            S.courtyardFloor(g, L, cam, T, d, fx);
            S.courtyardThings(g, L, cam, T, d, fx).filter((it) => it.depth > 0.3).sort((a, b) => b.depth - a.depth).forEach((it) => it.draw());
            const x = walkX(T), bt = Song.beatAt(T);
            for (const [who, z, ph] of [['her', 37.95, 0.5], ['him', 37.25, 0]]) {
                const lift = 0.035 * Math.abs(Math.sin(Math.PI * (bt + ph))), side = 0.015 * Math.sin(Math.PI * (bt + ph));
                onLayer(g, L, env, (cg) => Couple.standing(cg, cam, who, [x + (who === 'him' ? 0.15 : 0), 0.16 + lift, z + side], { view: 'back', T, d, wind: 0.01 }));
            }
        } else {
            S.street(g, L, cam, T, d, fx, env, { items: [carItem] });
        }
        // the headlights flare on as he starts it (shot 10)
        if (shot === 9) {
            const on = Ease.out(Ease.seg(T, B(21) + 0.5, B(21) + 0.75));
            for (const x of [-0.62, 0.62]) { const p = cam.p(Car.W(ps, [x, 0.66, 2.05])); if (p[2] > 0.3) S.glint(L, p[0], p[1], 14 + 16 * on, P.cream, { alpha: 0.25 + 0.4 * on, halo: 1, star: 0.5 * on, rays: 4 }); }
        }
        Ink.occlude(null);
        N.bloom(g, L, { strength: 0.4 + fx.swell * 0.3, core: 0.5 });
    }

    Sections.escape = {
        from: B(12), to: B(23), shots: SHOTS,
        async setup(env) {
            const neon = [];
            for (const id of ['her-1', 'him-1']) for (const v of ['back', 'front', 'tq', 'side']) neon.push(await Neon.image('sandbox/2026-11-24-run-away-with-me/ref/neon/' + id + '-' + v + '.png'));
            return { sil: neon.every(Boolean) ? S.silhouettes(neon) : [] };
        },
        draw(g, env, T, d) {
            const N = env.state.N, sec = env.state.sec?.escape ?? {}, shot = shotAt(T + 1 / 24);
            const fx = effects(T), cam = camera(shot, T, env);
            if (shot === 0 || shot === 2) bar(g, env, N, T, d, fx, cam, shot);
            else if (shot <= 5) party(g, env, N, T, d, fx, cam, shot, sec);
            else if (shot <= 7) room(g, env, N, T, d, fx, cam, shot);
            else outside(g, env, N, T, d, fx, cam, shot);
            finish(g, env, fx);
        },
    };
})();
