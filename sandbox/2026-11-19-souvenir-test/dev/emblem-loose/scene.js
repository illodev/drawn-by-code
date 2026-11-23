// The test bench for the end of the first passage as loose pieces (round 8): the guitar on the
// axis with the emblem's things floating round it, and 1340 behind it, through its mouth, the
// lemon tree as a cloud of loose pieces. The film's camera as it is there (900 units a second,
// rolling at 0.6 radians a second, focused 1000 ahead) flies from 1700 before the guitar to
// past the lemons. No copies: what is behind the guitar is the lemon tree, as in the film.
//   0.78 s  the guitar is 1000 away;  1.78 s  its mouth fills the frame;  3.3 s  inside the lemons
const DIR = 'sandbox/2026-11-19-souvenir-test/';
// ---------------------------------------------------------------- edit this block
const USES = [
    DIR + 'things/citrus.js', DIR + 'things/fan.js', DIR + 'things/shawl.js', DIR + 'things/guitar.js', DIR + 'things/garland.js',
    DIR + 'things/sky.js', DIR + 'things/ribbon.js', DIR + 'things/charms.js', DIR + 'things/fauna.js', DIR + 'things/coins.js',
    DIR + 'tableaux/emblem.js', DIR + 'tableaux/lemons.js',
];
const FONTS = [
    { family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }, { family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' }, { family: 'Anton', src: 'fonts/Anton-latin.woff2' },
    { family: 'Lora', src: 'fonts/Lora-Medium-latin.woff2' }, { family: 'Titan One', src: 'fonts/TitanOne-latin.woff2' },
];
const SPEED = 900; // the film's pace at the guitar
// ---------------------------------------------------------------- the film's camera
const FOCUS = 1000, Z0 = 2000, LEAD = 1700, GAP = 1340, TURN = 0.6; // TURN: roll, radians a second
Motion.scene({
    fps: 24,
    duration: Math.ceil(((LEAD + GAP + 600) / SPEED) * 24) / 24,
    logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', ...USES],
    fonts: FONTS,
    setup(env) {
        const layers = [...Tableau.emblem.loose(Z0), ...Tableau.lemons.loose(Z0 + GAP)].map((l) => ({ far: [0.2, 0.36], ...l }));
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
