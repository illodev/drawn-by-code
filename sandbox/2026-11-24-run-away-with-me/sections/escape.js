// uses: props/opening-figures.js, set/opening-party.js, set/opening-street.js, set/escape-sets.js
// Section · the escape, 0:24.6–0:46.8 (bars 12–22): the second half of verse 1. The highs thin
// out for four bars and the room goes quiet round her: one small pill on the bar, she alone in a
// crowd that slows, the pill gone and the lights swelling, the mirror ball throwing its first
// tracers. The hi-hats come back (32.68) and the room with them, louder; he finds her across it.
// «Packing a bag, leaving tonight while everyone's sleeping»: a suitcase on a hotel bed, the
// windows across the street going dark one by one. «Let's run away»: out past the pool to the
// white convertible, and the car pulls away up Ocean Drive. The party is the opening's ballroom
// (OpeningParty.frame) and the street the opening's Ocean Drive (OpeningStreet.frame), so the
// film is one place; the bar's still life, the hotel room and the courtyard pool are
// set/escape-sets.js; the car: props/car.js (on its own layer, erasing the light behind it, as in
// film.js). Contract: sections/README.md.
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
    const walkX = (T) => 18.6 - 1.9 * (T - B(20));
    const CAR0 = { x: 2.3, y: 0, z: 36, pitch: 0 };
    function carPose(T) {
        const t0 = B(22) + 0.12, u = Math.max(0, T - t0);
        return { x: CAR0.x - 0.5 * Ease.inOut(Ease.seg(T, t0, t0 + 1.4)), y: 0, z: CAR0.z + 0.5 * 5.5 * u * u, pitch: 0 };
    }
    // the street's x is the car's z: a camera built in that turned frame (its forward along the
    // street) sees the street through `turned` and the car directly; a camera built in the street's
    // own frame sees the car through `carView`
    const toStreet = (q) => [q[2], q[1], -q[0]], toCar = (q) => [-q[2], q[1], q[0]];
    function turned(C) { return { ...C, p: (q) => C.p(toCar(q)), view: (q) => C.view(toCar(q)), pos: toStreet(C.pos), sky: C }; }
    function carView(cam) { return { ...cam, p: (q) => cam.p(toStreet(q)), view: (q) => cam.view(toStreet(q)), pos: toCar(cam.pos) }; }
    const partyX = () => { const h = OpeningStreet.hotels().find((x) => x.party); return (h.x0 + h.x1) / 2 + 2.5; };
    const KERB = 24.2;
    function streetCar(T, shot) {
        const X0 = partyX(), t0 = B(22) + 0.12, u = shot === 10 ? Math.max(0, T - t0) : 0;
        return { x: -(KERB - 1.3 * Ease.inOut(Ease.seg(T, t0, t0 + 1.5)) * (shot === 10 ? 1 : 0)), y: 0, z: X0 + 0.5 * 5.5 * u * u, pitch: 0 };
    }
    const HIM6 = [1.0, 0, 3.7];
    function camera(shot, T, env) {
        const k = Ease.inOut(Ease.seg(T, SHOTS[shot][0], SHOTS[shot][1])), lin = Ease.seg(T, SHOTS[shot][0], SHOTS[shot][1]);
        const H0 = OpeningParty.HER;
        switch (shot) {
            case 0: return look(env, [0.004 * k, 0.17 - 0.006 * k, 0.06 * k], [0.0, 0.05, 0.4], 1450, 0, 0.01);
            // the opening's last frame (she, front, 5.2 m away through a long lens), pushing slowly in
            case 1: return Neon.camera({ W: env.W, H: env.H, pos: [H0[0] + 0.05, 1.5, H0[2] - 5.2 + 0.7 * k], yaw: 0, pitch: 0.02, roll: 0.004 * Math.sin(T * 1.7), f: 3467 });
            case 2: return look(env, [0.02 + 0.012 * k, 0.18, 0.02 + 0.01 * k], [0.0, 0.05, 0.42], 1400, -0.012 * k, 0.01);
            case 3: return look(env, [1.6 - 0.45 * k, 2.4 + 0.2 * k, 8.3 + 0.35 * k], OpeningParty.BALL, 1000, 0.05 * Math.sin(lin * 2));
            case 4: return look(env, [0.55, 1.95 - 0.25 * k, 3.6 + 0.9 * k], [0.55, 1.35, H0[2]], 1150, 0.01);
            case 5: return look(env, [1.38, 1.72, 2.3 + 0.35 * k], [0.5, 1.5, H0[2]], 1200);
            case 6: return look(env, [0.45 - 0.05 * k, 1.72 - 0.06 * k, 1.05 + 0.12 * k], [-0.3, 0.62, 2.25], 1150, 0.01);
            case 7: return look(env, [0.05 - 0.05 * k, 1.5, 1.55 + 0.3 * k], [0.05, 1.5, 4], 950);
            case 8: { const x = walkX(T); return look(env, [x + 1.5, 1.58 + 0.012 * Math.sin(T * 12.4), 37.6], [x - 8, 1.3, 36.75], 950, 0.006 * Math.sin(T * 6.2)); }
            case 9: { const X0 = partyX(); return look(env, [X0 + 5.0 - 0.4 * k, 1.05, KERB - 4.2 + 0.25 * k], [X0 + 0.2, 0.85, KERB], 1100); }
            default: { const X0 = partyX(); return look(env, [-(KERB - 1.6), 1.25, X0 - 7.5], [-(KERB - 0.8), 0.95, X0 + 45], 1000); }
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
    function finish(g, env, fx, flashDone = false) {
        if (fx.swell > 0.02) { g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = `rgba(150,20,150,${0.16 * fx.swell})`; g.fillRect(0, 0, env.W, env.H); g.restore(); }
        if (fx.flash > 0.01 && !flashDone) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,120,220,${fx.flash})`; g.fillRect(0, 0, env.W, env.H); g.restore(); }
    }

    // --- the shots ------------------------------------------------------------------------------
    // the party: the opening's ballroom. The quiet bars switch its floor and beams off and slow the
    // dance (energy 0), the crowd presses in and the dark closes round her; the hi-hats bring it all
    // back (energy 1) with a flash. He is added over his shoulder in the lane the room keeps clear
    // between the camera and her.
    function party(g, env, N, T, d, fx, cam, shot) {
        const H0 = OpeningParty.HER, quiet = T < B(16);
        const press = shot === 1 ? 0.67 + 0.33 * Ease.inOut(Ease.seg(T, B(13), B(14))) : shot === 5 ? 0.2 : 0.35 * (1 - Ease.seg(T, B(16), B(17)));
        const close = shot === 1 ? 0.55 + 0.3 * Ease.inOut(Ease.seg(T, B(13), B(14))) : shot === 5 ? 0.3 * Ease.inOut(Ease.seg(T, B(17), B(18))) : 0;
        OpeningParty.frame(g, env, N, T, d, cam, { energy: quiet ? 0 : 1, press, close, her: shot === 3 ? null : { view: 'front', cut: 1.05 }, rays: quiet, flash: fx.flash });
        if (shot === 3) echo(g, env, cam.p(OpeningParty.BALL), fx.tracer, 0.06);
        if (shot === 5) {
            const L = N.light();
            const lay = Motion.layer(env, 'escFig', (cg) => Couple.standing(cg, cam, 'him', HIM6, { view: 'back', T, d, sway: 0.006 * Math.sin(T * 2.3) }));
            rimmed(g, env, lay, [[1, P.cyan, 0.85], [-1, OpeningParty.lights(T, 1).col, 0.7]]);
            N.bloom(g, L, { strength: 0.2, core: 0 });
        }
    }
    // a figure's layer laid on the picture with a rim of light on the sides facing the room's colours
    function rimmed(g, env, lay, rims) {
        g.drawImage(lay, 0, 0, env.W, env.H);
        const k = env.k, w = Math.max(2, 3.2 * k), rim = Motion.layer(env, 'escRim', () => {}), R = rim.getContext('2d');
        g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
        for (const [sx, col, a] of rims) {
            R.setTransform(1, 0, 0, 1, 0, 0); R.globalCompositeOperation = 'source-over'; R.clearRect(0, 0, rim.width, rim.height);
            R.drawImage(lay, 0, 0); R.globalCompositeOperation = 'destination-out'; R.drawImage(lay, sx * w, -w * 0.4);
            R.globalCompositeOperation = 'source-in'; R.fillStyle = col; R.fillRect(0, 0, rim.width, rim.height);
            g.globalAlpha = a; g.drawImage(rim, 0, 0);
        }
        g.restore();
    }
    // the first tracers: the frame laid back over itself turned about a centre (the ball) a few
    // times, fainter each time, screened so only its lights leave trails
    function echo(g, env, c, amt, ang) {
        if (amt <= 0.02 || c[2] < 0.3) return;
        const k = env.k, src = Motion.layer(env, 'escEcho', (cg) => { cg.setTransform(1, 0, 0, 1, 0, 0); cg.drawImage(g.canvas, 0, 0); });
        g.save();
        for (let i = 1; i <= 3; i++) {
            g.setTransform(1, 0, 0, 1, 0, 0); g.translate(c[0] * k, c[1] * k); g.rotate(-ang * i); g.translate(-c[0] * k, -c[1] * k);
            g.globalCompositeOperation = 'screen'; g.globalAlpha = amt * 0.42 * Math.pow(0.6, i - 1); g.drawImage(src, 0, 0);
        }
        g.restore();
    }

    function bar(g, env, N, T, d, fx, cam, shot) {
        const L = N.light();
        Ink.occlude(L);
        S.barTop(g, L, cam, T, ct(T), d, fx, { pill: shot === 0, drink: shot === 0 ? 0.78 : 0.42 });
        Ink.occlude(null);
        N.bloom(g, L, { strength: 0.45 + fx.swell * 0.45, core: 0.55 });
    }

    function room(g, env, N, T, d, fx, cam, shot) {
        g.fillStyle = '#260a8c'; g.fillRect(-10, -10, env.W + 20, env.H + 20);
        const L = N.light();
        Ink.occlude(L);
        S.hotelRoom(g, L, cam, T, d, fx, { chair: shot === 7 });
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

    // the courtyard pool (escape-sets), the gate onto a street of our own beyond it
    function pool(g, env, N, T, d, fx, cam) {
        Ink.occlude(null);
        const L = N.light();
        S.sky(g, cam, T, d, fx, env);
        Ink.occlude(L);
        const light = carLight(CAR0, d);
        const carItem = { depth: cam.view([CAR0.x, 0.6, CAR0.z])[2], draw: () => carOn(g, L, env, N, cam, CAR0, light, (gg) => couple(gg, cam, CAR0, light, T, d, 'back')) };
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
        Ink.occlude(null);
        N.bloom(g, L, { strength: 0.4 + fx.swell * 0.3, core: 0.5 });
    }

    // Ocean Drive, the opening's: the car at the party hotel's kerb, then pulling away up the street
    function street(g, env, N, T, d, fx, shot) {
        const C = camera(shot, T, env), X0 = partyX();
        const scam = shot === 10 ? turned(C) : C, ccam = shot === 10 ? C : carView(C);
        const beatCol = [P.magenta, P.cyan, P.pink, P.violet][Math.floor(Song.beatAt(T)) & 3];
        OpeningStreet.frame(g, env, N, T, d, scam, { beatCol, skyCam: shot === 10 ? C : undefined });
        const ps = streetCar(T, shot);
        const lamps = [];
        for (let i = 0; i < 26; i++) { const x = -150 + i * 13 + 6; if (Math.abs(x - ps.z) < 45) lamps.push([-26.4, 4.4, x]); }
        for (let i = 0; i < 26; i++) { const x = -150 + i * 13; if (Math.abs(x - ps.z) < 45) lamps.push([-11.9, 4.4, x]); }
        const lampK = lamps.reduce((m, h) => Math.max(m, Math.exp(-(((h[2] - ps.z) / 6) ** 2))), 0) * 0.7;
        const light = { lamp: lampK, hue: 0, power: 1, city: 1, drawn: true, d, lamps };
        const L = N.light();
        carOn(g, L, env, N, ccam, ps, light, (gg) => couple(gg, ccam, ps, light, T, d, shot === 9 ? 'front' : 'back'));
        Ink.occlude(null);
        if (shot === 9) {
            // he starts it: the headlights flare on
            const on = Ease.out(Ease.seg(T, B(21) + 0.5, B(21) + 0.75));
            for (const x of [-0.62, 0.62]) { const p = ccam.p(Car.W(ps, [x, 0.66, 2.05])); if (p[2] > 0.3) S.glint(L, p[0], p[1], 14 + 16 * on, P.cream, { alpha: 0.25 + 0.4 * on, halo: 1, star: 0.5 * on, rays: 4 }); }
        }
        N.bloom(g, L, { strength: 0.35, core: 0.5 });
    }

    Sections.escape = {
        from: B(12), to: B(23), shots: SHOTS,
        async setup(env) { return {}; },
        draw(g, env, T, d) {
            const N = env.state.N, shot = shotAt(T + 1 / 24);
            const fx = effects(T);
            if (shot >= 9) street(g, env, N, T, d, fx, shot);
            else {
                const cam = camera(shot, T, env);
                if (shot === 0 || shot === 2) bar(g, env, N, T, d, fx, cam, shot);
                else if (shot <= 5) party(g, env, N, T, d, fx, cam, shot);
                else if (shot <= 7) room(g, env, N, T, d, fx, cam, shot);
                else pool(g, env, N, T, d, fx, cam);
            }
            finish(g, env, fx, shot >= 1 && shot <= 5 && shot !== 2);
        },
    };
})();
