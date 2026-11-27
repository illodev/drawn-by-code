// scratch: the props of solo1 at size
Motion.scene({
    fps: 24, duration: 4, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/inferno.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse3b-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus3-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/hellhoof-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/hellhoof.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/bridge-props.js', 'sandbox/2026-11-11-runnin-down-a-dream/segments/bridge.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/solo1-props.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    draw(g, t) {
        const C = Cereal, K = C.COL, P = Solo1Props, sheet = Math.floor(t + 1e-6), d = Math.round((t - sheet) * 12);
        C.sunburst(g, 500, 560, { n: 12, rot: 0.2, a: '#8a1a2c', b: '#a82338' });
        g.fillStyle = '#3a0a14';
        g.fillRect(0, 900, 1000, 100);
        if (sheet === 0) {
            // Mike: the cast's own, mine the same way round (a difference shows as a ghost), turned, the eyebrow
            BandStrings.mike(g, 170, 440, 170, { solo: 0.5, strum: -1, fret: 0.5, mouth: 'grin' });
            g.globalAlpha = 0.5; P.mike(g, 170, 440, 170, { solo: 0.5, strum: -1, fret: 0.5, mouth: 'grin' }); g.globalAlpha = 1;
            P.mike(g, 500, 440, 170, { solo: 0.5, strum: -1, fret: 0.5, mouth: 'grin', face: 'left' });
            P.mike(g, 830, 440, 170, { solo: 0, strum: 0.5, fret: -0.9, mouth: 'smirk', brow: 1 });
            P.mike(g, 300, 900, 230, { solo: 1, strum: 0, fret: 0.2, mouth: 'grin', eyes: 'shut', face: 'left', headTilt: 0.1 });
            Inferno.devilGuitar(g, 590, 900, 230, { solo: 1, strum: 0, fret: 0.2, mood: 'laugh', hand: 'right', flames: 1, t: 190 + d / 12, headTilt: -0.08, tail: 0.02 });
        } else if (sheet === 1) {
            P.mike(g, 300, 880, 420, { solo: 0.2, strum: 0.5, fret: 0.4, mouth: 'smirk', brow: [0, 0.6, 1, 1][d % 4], headDy: d % 4 === 3 ? 0.06 : 0 });
            P.mike(g, 760, 880, 300, { solo: 0, mouth: 'grin', brow: 1 });
        } else if (sheet === 2) {
            for (let i = 0; i < 6; i++) P.cleanNote(g, 110 + i * 150, 220, [44, 30, 20][i % 3], -0.2 + i * 0.1, 1 + (i % 2), i);
            for (let i = 0; i < 6; i++) P.fireNote(g, 110 + i * 150, 480, [44, 30, 20][i % 3], -0.2 + i * 0.1, d + i, i < 3 ? null : [Math.PI, 2.6, 0.6][i - 3]);
            for (let i = 0; i < 6; i++) P.clash(g, 110 + i * 155, 760, 70, i, 'k');
            for (let i = 0; i < 5; i++) P.star(g, 120 + i * 60, 930, 10 + i * 5, i * 0.3, [K.yellow, K.white, K.rose, K.aqua][i % 4]);
        } else {
            P.braid(g, 200, 880, 40, { top: 1, ph: d / 6, d });
            P.braid(g, 420, 880, 300, { top: 0.6, ph: 0.5 + d / 6, d, s: 22, amp: 40, amp1: 70, pitch: 110 });
            P.dust(g, 1.5 + d / 12, 1, [560, 980, 40, 620]);
            P.crack(g, [[560, 700], [610, 688], [640, 706], [700, 694], [730, 712], [790, 698], [840, 708], [900, 690], [960, 700]], 0.6, 0, d);
            P.crack(g, [[560, 780], [610, 768], [640, 786], [700, 774], [730, 792], [790, 778], [840, 788], [900, 770], [960, 780]], 1, 1, d);
            P.bulge(g, 760, 940, 360, 110, d);
            P.whirl(g, 620, 560, 70, d % 2);
        }
    },
});
