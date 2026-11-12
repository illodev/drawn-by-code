// dev: Hell's venue and its props (inferno.js), to judge them at size. One sheet per second; add
// 0.25, 0.5 or 0.75 to a sheet's time for its variants (the options at their extremes, other
// drawings). Render with --at 0,0.25,… --size 1080. The film-size sheets go through the tape and
// the tube as in the film; the close ones are flat.
//    0  the venue, wide, with the band, the Devil in his box and the crowd (heat, hype, lighters, surfer, wave)
//    1  the same in the stage view                         2, 3  wide and stage: the camera panned (-380, -160, 160, 380)
//    4  the fans, close (s = 170): hype 0 … 1, lighter or foam trident
//    5  the Devil with his guitar next to Mike, s = 150 and 84 (solo, strum, fret, flames, shred, both hands)
//    6  the Devil with his guitar at s = 300                7  the guitar rising from the fire (k = 0.05 … 1; s = 150 and 84)
//    8  the contract torn (k = 0 … 1), s = 150              9  the box with the Devil at s = 200 and 84 (shake, glow)
//   10  the volcano, wide (rumble, erupt)                  11  the volcano, stage view
//   12  the crowd alone, flat: wide and stage, hype 0 / 0.5 / 1, lighters, the wave at four places, the surfer
//   13  the venue empty, flat: heat 0, 0.5, 1 and a view of the box ({ k: 2.2, cx: 884, cy: 400 })
//   14  the Devil's two-shot with Mike in the stage view, on the car's deck and beside it
Motion.scene({
    fps: 24, duration: 15, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js',
        'sandbox/2026-11-11-runnin-down-a-dream/rides.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js', 'sandbox/2026-11-11-runnin-down-a-dream/inferno.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    draw(g, t, env) {
        const C = Cereal, K = C.COL, I = Inferno, sheet = Math.floor(t + 1e-6), v = Math.round((t - sheet) * 4) % 4, tt = 133 + sheet * 0.37 + v / 12 + (t - sheet - v / 4);
        const bk = Song.pulseAt(tt).pulse;
        const backdrop = (a = '#8a1a2c', b = '#a82338') => {
            C.sunburst(g, 500, 560, { n: 12, rot: 0.2, a, b });
            g.fillStyle = '#3a0a14';
            g.fillRect(0, 880, 1000, 120);
        };
        const devilIn = (S, pose) => (g2) => Devil.draw(g2, S.box.x, S.box.y, S.box.s, { shadow: false, tail: 0.03, ...pose });
        if (sheet === 0 || sheet === 1) {
            const o = { view: sheet === 0 ? 'wide' : 'stage', heat: [0.7, 0, 1, 0.4][v], beatK: bk, pan: 0 };
            I.venue(g, tt, o);
            const S = I.stage(o.view, o.pan);
            I.box(g, S.box.x, S.box.y, S.box.s, { shake: v === 1 ? 1 : 0, t: tt }, devilIn(S, { mood: v === 2 ? 'grin' : 'angry', ...I.BOX.rail, step: v === 3 ? 1 : 0 }));
            Rig.band(g, tt, S.car.x, S.car.y, S.car.s, { spin: 0, sing: true });
            if (v === 2) I.beams(g, tt, { ...o, front: true });
            I.crowd(g, tt, { ...o, density: [1, 0.6, 1, 0.8][v], hype: [0.6, 0, 1, 0.35][v], lighters: [0, 0, 0.3, 1][v], surf: { u: 0.3 + v * 0.2, on: v === 2 }, wave: v === 3 ? 0.4 : null });
        } else if (sheet === 2 || sheet === 3) {
            const o = { view: sheet === 2 ? 'wide' : 'stage', heat: 0.8, beatK: bk, pan: [-380, -160, 160, 380][v] };
            I.venue(g, tt, o);
            const S = I.stage(o.view, o.pan);
            I.box(g, S.box.x, S.box.y, S.box.s, { t: tt }, devilIn(S, { mood: 'angry', ...I.BOX.rail }));
            Rig.band(g, tt, S.car.x, S.car.y, S.car.s, { spin: 0, sing: true });
            I.crowd(g, tt, { ...o, hype: 0.8, lighters: 0.2 });
        } else if (sheet === 4) {
            g.fillStyle = '#2a0810';
            g.fillRect(0, 0, 1000, 1000);
            [0, 0.25, 0.5, 0.75].forEach((h, i) => {
                I.fan(g, 150 + i * 235, 440, 170, { kind: 'imp', hype: (h + v * 0.25) % 1.01, lighter: i % 2 ? 0.3 + 0.2 * i : 0, t: tt, wear: ['specs', 'hat', 'bow', null][i], hold: i === 3 && v === 3 ? 'none' : undefined });
                I.fan(g, 150 + i * 235, 900, 170, { kind: 'skeleton', hype: (h + v * 0.25) % 1.01, lighter: i % 2 ? 0 : 0.4 + 0.2 * i, t: tt, tee: i, hawk: [K.green, K.pink, K.sky, K.yellow][i], hold: i === 3 && v === 3 ? 'none' : undefined });
            });
        } else if (sheet === 5 || sheet === 6) {
            backdrop();
            const sc = sheet === 5 ? 150 : 300, so = [0, 1, 0.5, 1][v];
            const pose = { mood: ['grin', 'laugh', 'sly', 'angry'][v], solo: so, strum: [0, 1, -1, 0.5][v], fret: [0.2, 0.9, 0.5, 0][v], flames: [0, 1, 0.5, 1][v], shred: [0, 1, 0, 0.6][v], t: tt, hand: v >= 2 ? 'right' : 'left', tail: 0.03 };
            if (sheet === 5) {
                BandStrings.mike(g, 250, 880, sc, { ...Rig.playing(tt, { solo: so }).mike, solo: so });
                I.devilGuitar(g, 720, 880, sc, { ...pose, step: v === 1 ? 1 : 0 });
                BandStrings.mike(g, 320, 480, 84, { ...Rig.playing(tt, { solo: so }).mike, solo: so });
                I.devilGuitar(g, 500, 480, 84, { mood: 'grin', solo: so, strum: 0.4, fret: 0.4, flames: 0.8, shred: v % 2, t: tt, hand: v < 2 ? 'left' : 'right' });
            } else I.devilGuitar(g, 520, 900, sc, pose);
        } else if (sheet === 7) {
            backdrop();
            [0.05, 0.3, 0.55, 0.8].forEach((k0, i) => I.guitarFromFire(g, 130 + i * 245, 880, 150, Math.min(1, k0 + v * 0.07), tt));
            [0.15, 0.45, 0.7, 1].forEach((k0, i) => I.guitarFromFire(g, 130 + i * 245, 400, 84, k0, tt));
        } else if (sheet === 8) {
            backdrop();
            [0, 0.12, 0.22, 0.34, 0.42, 0.55, 0.7, 0.85, 1].forEach((k0, i) => {
                const k = Math.min(1, k0 + v * 0.03), px = 110 + (i % 5) * 195, py = i < 5 ? 180 : 520;
                I.tornContract(g, px, py, 150, k, v, { signed: v % 2 === 1 });
            });
        } else if (sheet === 9) {
            C.sunburst(g, 500, 560, { n: 12, rot: 0.2, a: '#6a1221', b: '#8a1a2c' });
            const sh = [0, 1, 0.5, 0][v], devil = (x, y, sc, pose) => (g2) => Devil.draw(g2, x, y, sc, { shadow: false, tail: 0.03, ...pose });
            const poses = [{ mood: 'angry', ...I.BOX.rail }, { mood: 'angry', handR: [-0.55, -1.5], handL: [0.6, -1.45], step: 1, squash: 0.05 }, { mood: 'sly', handR: I.BOX.rail.handR, step: -1 }, { mood: 'grin', ...I.BOX.rail, headTilt: 0.08 }];
            I.box(g, 330, 660, 200, { shake: sh, t: tt }, devil(330, 660, 200, poses[v]));
            I.box(g, 800, 380, 84, { shake: sh, t: tt }, devil(800, 380, 84, poses[v]));
            I.box(g, 800, 800, 84, { shake: sh, t: tt, glow: 0.3 });
        } else if (sheet === 10 || sheet === 11) {
            const o = { view: sheet === 10 ? 'wide' : 'stage', rumble: [0, 0.5, 1, 0.6][v], erupt: [0, 0, 0.06, 0.36][v], t: tt };
            I.volcano(g, tt, o);
            const T = I.volcanoTop(o);
            Rig.band(g, tt, T.x, T.y, T.s, { spin: 0, sing: true, shadow: o.erupt === 0 });
            I.volcanoFront(g, tt, o);
        } else if (sheet === 12) {
            g.fillStyle = '#3a0a14';
            g.fillRect(0, 0, 1000, 1000);
            // four strips of the pit: the wide view's crowd, moved up the frame
            [[0, 0, null, null], [0.5, 0, null, null], [1, 0.3, 0.1 + v * 0.25, null], [0.8, 1, null, 0.15 + v * 0.22]].forEach(([hype, lighters, wave, su], i) => {
                g.save();
                g.beginPath();
                g.rect(0, i * 250, 1000, 250);
                g.clip();
                g.translate(0, i * 250 - 760);
                I.crowd(g, tt, { view: 'wide', density: i === 1 ? 0.6 : 1, hype, lighters, wave, surf: { u: su, on: su != null } });
                g.restore();
            });
        } else if (sheet === 13) {
            if (v < 3) I.venue(g, tt, { view: 'wide', heat: [0, 0.5, 1][v], beatK: bk });
            else {
                const view = { k: 2.2, cx: 884, cy: 400 };
                I.venue(g, tt, { view, heat: 0.7, beatK: bk });
                const S = I.stage(view, 0);
                I.box(g, S.box.x, S.box.y, S.box.s, { t: tt }, devilIn(S, { mood: 'angry', ...I.BOX.rail }));
                I.crowd(g, tt, { view, hype: 0.9 });
            }
        } else if (sheet === 14) {
            const o = { view: 'stage', heat: 1, beatK: bk, pan: [60, 60, -40, 120][v] };
            I.venue(g, tt, o);
            const S = I.stage(o.view, o.pan), so = [1, 0.5, 1, 0][v];
            // the Devil on the deck, facing Mike (Rig.band's own Mike, in his seat)
            Rig.band(g, tt, S.car.x, S.car.y, S.car.s, { spin: 0, sing: true, solo: so });
            const seat = Rig.seat('band', 'deck2', S.car.x, S.car.y, S.car.s);
            I.devilGuitar(g, seat[0] - 0.9 * S.car.s, seat[1] + (v === 3 ? 0.75 * S.car.s + 4 : 0), S.car.s, { mood: v % 2 ? 'laugh' : 'grin', solo: so, strum: Math.cos(tt * 17), fret: 0.5, flames: 1, shred: v === 0 ? 1 : 0, t: tt, hand: v === 2 ? 'right' : 'left', tail: 0.03, shadow: v === 3 });
            I.crowd(g, tt, { ...o, hype: 1 });
        }
    },
    post(ctx, t, env) {
        const sheet = Math.floor(t + 1e-6);
        if ([0, 1, 2, 3, 10, 11, 14].includes(sheet)) Cereal.post(ctx, t, env);
    },
});
