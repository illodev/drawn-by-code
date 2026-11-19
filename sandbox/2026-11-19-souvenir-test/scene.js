// 2026-11-19-souvenir-test · style souvenir
// «Recuerdo de Andalucía», style test: the emblem, and the dive through the guitar's mouth
// into the lemon tree.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
// When things happen (seconds): the night has lifted and the camera is under way, it frames
// the guitar, it leaves it, it is at the mouth, it is inside the tree, the end.
const TIMES = { lit: 1.6, guitar: 9.2, leave: 10.6, mouth: 11.2, tree: 11.9, end: 15 };

Motion.scene({
    fps: 24,
    duration: 15,
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
    shots: [[0, 2.6, 'By the candle'], [2.6, 4.2, 'Tartessos and the sea'], [4.2, 5.6, 'Rome and the Goths'], [5.6, 7, 'Al-Andalus'], [7, 8.4, 'The house and the fair'], [8.4, 10.6, 'The guitar'], [10.6, 11.9, 'The dive'], [11.9, 15, 'The lemon tree']],
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
        // The camera only ever goes in. It starts slowly by the candle while the night lifts,
        // then keeps a steady pace through the strata (nothing waits to be read), settles a
        // moment on the guitar, lingers on its rosette and goes through the mouth.
        const T = TIMES;
        const zKeys = [[0, -330], [T.lit, -150], [T.guitar, ZG - 1000], [T.leave, ZG - 880], [T.mouth, ZG - 440], [T.tree, ZL - 1010], [T.end, ZL - 860]];
        // focus stays a stratum ahead of the camera, rests on the guitar, then racks to the tree
        const fKeys = [[0, 1000], [T.lit, 1000], [T.lit + 1.2, 1300], [T.guitar, ZG], [T.mouth + 0.1, ZG], [T.tree - 0.15, ZL], [T.end, ZL]];
        // by the guitar the camera looks a little below the axis, then comes back onto it
        const yKeys = [[0, 0], [T.guitar - 1.2, 0], [T.guitar, 52], [T.leave - 0.2, 52], [T.mouth, 0], [T.end, 0]];
        return { rig: Souvenir.rig(env, layers), zKeys, fKeys, yKeys };
    },
    draw(g, t, env) {
        const st = env.state;
        const cam = (t) => ({ z: Souvenir.track(st.zKeys, t), focus: Souvenir.track(st.fKeys, t), y: Souvenir.track(st.yKeys, t), aperture: 10, roll: 0.012 * Math.sin(t * 0.7) });
        env.state.samples = st.rig.draw(g, t, cam, { bg: Tableau.NIGHT, maxSamples: 8, shutter: 0.36 });
        // the film fades up from the night (never from nothing: the flame is there at once)
        const dark = 0.7 * (1 - Ease.inOut(Ease.seg(t, 0, TIMES.lit)));
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
