// 2026-11-19-souvenir-test · style souvenir
// «Recuerdo de Andalucía», style test: the emblem, and the dive through the guitar's mouth
// into the lemon tree.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
// One camera move at one pace, on the axis, from the first frame to the last: it never slows
// down, waits or turns towards anything. SPEED is in units of depth a second (the strata are
// 680 apart: one every second and a half or so); FOCUS is how far ahead of the camera the
// lens is set, for the whole film (each thing is sharp when it is that far, at the size it
// was painted for, soft before and blurred as it goes by).
const SPEED = 432, FOCUS = 1000, START = -775, LENGTH = 14;
// the night lifts in the first `lit` seconds; the last `out` seconds go back into the dark
const TIMES = { lit: 1.6, out: 0.9 };

Motion.scene({
    fps: 24,
    duration: LENGTH,
    logical: [1600, 900],
    uses: [
        'styles/souvenir/souvenir.js',
        DIR + 'things/citrus.js', DIR + 'things/fan.js', DIR + 'things/shawl.js',
        { src: DIR + 'things/guitar.js', optional: true }, { src: DIR + 'things/garland.js', optional: true }, { src: DIR + 'things/sky.js', optional: true },
        { src: DIR + 'things/ribbon.js', optional: true }, { src: DIR + 'things/charms.js', optional: true },
        { src: DIR + 'things/papers.js', optional: true }, { src: DIR + 'things/wares.js', optional: true }, { src: DIR + 'things/fauna.js', optional: true },
        { src: DIR + 'things/coins.js', optional: true }, { src: DIR + 'things/relics.js', optional: true }, { src: DIR + 'things/heirlooms.js', optional: true },
        { src: DIR + 'things/library.js', optional: true }, { src: DIR + 'things/devotion.js', optional: true },
        DIR + 'tableaux/passage.js', DIR + 'tableaux/emblem.js', DIR + 'tableaux/lemons.js',
    ],
    fonts: [
        { family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }, { family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' }, { family: 'Anton', src: 'fonts/Anton-latin.woff2' },
        { family: 'Lora', src: 'fonts/Lora-Medium-latin.woff2' }, { family: 'Titan One', src: 'fonts/TitanOne-latin.woff2' },
    ],
    // one take: these only name its parts for the contact sheet
    shots: [[0, 2.6, 'By the candle'], [2.6, 4.2, 'Tartessos and the sea'], [4.2, 5.7, 'Rome and the Goths'], [5.7, 7.3, 'Al-Andalus'], [7.3, 8.9, 'The house and the fair'], [8.9, 11.6, 'The guitar'], [11.6, 12.2, 'Through the mouth'], [12.2, LENGTH, 'The lemon tree']],
    setup(env) {
        // The first stratum is 1000 from where a camera at 0 would stand; the guitar is the
        // last one; the lemon tree is 1340 behind the guitar.
        const Z0 = 1000, ZG = Z0 + Tableau.passage.depth, ZL = ZG + 1340;
        // Things come out of the night as the camera nears them (`far`): never all at once.
        // (the lemon tree is in the brush manner: its strokes are in its own paint)
        const layers = [
            ...Tableau.passage(Z0),
            ...Tableau.emblem(ZG).map((l) => ({ far: [0.2, 0.36], ...l })),
            // (the tree only shows once the guitar that hides it is whole: seen sooner, it is a green
            // rectangle in the night)
            ...Tableau.lemons(ZL).map((l) => ({ ...l, far: [0.26, 0.34], brush: false })),
        ];
        return { rig: Souvenir.rig(env, layers) };
    },
    draw(g, t, env) {
        const st = env.state;
        const cam = (t) => ({ z: START + SPEED * t, focus: START + SPEED * t + FOCUS, aperture: 10 });
        env.state.samples = st.rig.draw(g, t, cam, { bg: Tableau.NIGHT, maxSamples: 8, shutter: 0.36 });
        // the film fades up from the night (never from nothing: the flame is there at once)
        // and goes back into it at the end, the camera still going in
        const dark = Math.max(0.7 * (1 - Ease.inOut(Ease.seg(t, 0, TIMES.lit))), Ease.inOut(Ease.seg(t, LENGTH - TIMES.out, LENGTH)));
        if (dark > 0.004) {
            g.fillStyle = Tableau.NIGHT;
            g.globalAlpha = dark;
            g.fillRect(0, 0, env.W, env.H);
            g.globalAlpha = 1;
        }
    },
    post(ctx, t, env) {
        Souvenir.finish(ctx, env, Math.round(t * env.fps));
    },
});
