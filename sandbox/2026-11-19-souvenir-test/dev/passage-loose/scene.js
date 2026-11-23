// The test bench for the first passage, loose (round 8): the film's camera as it is in the
// first passage (SPEED, rolling on its axis, focused 1000 ahead) flies through the five
// strata of Tableau.passage.loose (vela, mar, roma, andalus, feria), as they are, no copies.
// Each piece's paint time is logged once ([paint] id ms), so the strata's costs can be summed.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
// ---------------------------------------------------------------- edit this block
const NAME = 'passage'; // Tableau[NAME].loose(z) → one layer per piece
const USES = [
    DIR + 'things/citrus.js', DIR + 'things/fan.js', DIR + 'things/shawl.js',
    DIR + 'things/guitar.js', DIR + 'things/garland.js', DIR + 'things/sky.js',
    DIR + 'things/ribbon.js', DIR + 'things/charms.js',
    DIR + 'things/papers.js', DIR + 'things/wares.js', DIR + 'things/fauna.js',
    DIR + 'things/coins.js', DIR + 'things/relics.js', DIR + 'things/heirlooms.js',
    DIR + 'things/library.js', DIR + 'things/devotion.js',
    DIR + 'tableaux/passage.js',
];
const FONTS = [
    { family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }, { family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' }, { family: 'Anton', src: 'fonts/Anton-latin.woff2' },
    { family: 'Lora', src: 'fonts/Lora-Medium-latin.woff2' }, { family: 'Titan One', src: 'fonts/TitanOne-latin.woff2' },
];
const SPEED = 650; // the first passage's pace, about (430 at its start, faster by its end)
// ---------------------------------------------------------------- the film's camera
const FOCUS = 1000, Z0 = 2000, LEAD = 1700, STEP = 680, TURN = 0.6; // TURN: roll, radians a second
Motion.scene({
    fps: 24,
    duration: Math.ceil(((LEAD + 5 * STEP + 400) / SPEED) * 24) / 24,
    logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', ...USES],
    fonts: FONTS,
    setup(env) {
        const layers = Tableau[NAME].loose(Z0).map((l) => ({ far: [0.2, 0.36], ...l }));
        for (const l of layers) {
            const paint = l.paint;
            l.paint = (g, res) => {
                const t0 = performance.now();
                paint(g, res);
                console.log(`[paint] ${l.id} ${Math.round(performance.now() - t0)}`);
            };
        }
        return { rig: Souvenir.rig(env, layers) };
    },
    draw(g, t, env) {
        const cam = (u) => ({ z: Z0 - LEAD + SPEED * u, focus: Z0 - LEAD + SPEED * u + FOCUS, aperture: 10, roll: TURN * u });
        env.state.samples = env.state.rig.draw(g, t, cam, { bg: '#1b1e3d', maxSamples: 8, shutter: 0.36 });
    },
    post(ctx, t, env) {
        Souvenir.finish(ctx, env, Math.round(t * env.fps));
    },
});
// Stratum n's middle depth (Z0 + n · 680) is 1000 ahead of the camera at t = (LEAD − 1000 + n · 680) / SPEED:
// 1.08 s (vela), 2.12 (mar), 3.17 (roma), 4.22 (andalus), 5.26 (feria).
