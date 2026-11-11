// scratch: candidate layouts for the last picture
Motion.scene({
    fps: 24, duration: 6, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/inferno.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/bridge-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/bridge.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    draw(g, t, env) {
        const I = Inferno, v = Math.floor(t + 1e-6), tt = 182.4583, SE = Rides.bandCarSeats();
        const pan = [0, 0, 181, 0, 0, 60][v], o = { view: 'stage', pan, heat: 1, beatK: 0.3 }, St = I.stage('stage', pan), car = St.car, s = car.s;
        I.venue(g, tt, o);
        const dp = (hand, solo = 0.5) => Seg.bridge.axePose(tt, { look: hand === 'right' ? -1 : -1, solo, strum: -1, fret: 0.5, hand });
        const dev = (hand, solo) => (g2, sc) => I.devilGuitar(g2, 0, 0, sc, dp(hand, solo));
        const tomHood = { tomAt: [3.97, -1.11], tomUp: true };
        const L = [
            { ...tomHood, solo: 0.5, devil: dev('left'), devilAt: [1.2, -0.79] },
            { ...tomHood, solo: 0.5, mikeAt: [0.3, -0.77], mikeNear: true, devil: dev('left'), devilAt: [1.25, -0.77] },
            { tomAt: SE.deck[1], mikeAt: SE.deck[0], mikeNear: true, solo: 0.5 },
            { ...tomHood, solo: 0.5, mikeAt: SE.deck[0], mikeNear: true, devil: dev('left'), devilAt: [0.22, -0.77] },
            { ...tomHood, solo: 0.5, devil: dev('right'), devilAt: [1.2, -0.79] },
            { ...tomHood, solo: 0.5, mikeAt: [0.42, -0.77], mikeNear: true, devil: dev('left'), devilAt: [1.6, -1.52] },
        ][v];
        Seg.bridge.band(g, tt, car, { ...L, pose: { mike: { strum: -1, fret: 0.5 } } });
        if (v === 2) I.devilGuitar(g, car.x + 3.42 * s, car.y - 1.19 * s, s, { ...dp('left'), shadow: false });
        I.crowd(g, tt, { ...o, hype: 1, lighters: 0.3 });
    },
    post(ctx, t, env) { Cereal.post(ctx, t, env); },
});
