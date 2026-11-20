// The test bench for ONE stratum of the second passage: the film's own camera (one pace, on
// the axis, focused 1000 ahead) flies through it and through two more copies of it, 680
// and 1360 behind, standing in for the strata of the other worlds: what must be judged is
// how its three sheets slide over each other and over the stratum behind.
// Copy this file to dev/<name>-stratum/scene.js and edit the block below. Nothing else changes.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
// ---------------------------------------------------------------- edit this block
const NAME = 'green'; // Tableau[NAME].stratum(z) → three layers
const USES = [DIR + 'things/green.js', DIR + 'tableaux/green.js']; // your files, in order (add any library file you reuse)
const FONTS = []; // { family, src } of any font you letter with (see fonts/)
// ---------------------------------------------------------------- the film's camera
const SPEED = 432, FOCUS = 1000, Z0 = 2000, LEAD = 1500, STEP = 680;
Motion.scene({
    fps: 24,
    duration: Math.ceil(((LEAD + STEP + 250) / SPEED) * 24) / 24,
    logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', ...USES],
    fonts: FONTS,
    setup(env) {
        const T = Tableau[NAME].stratum;
        const again = (n) => T(Z0 + n * STEP).map((l) => ({ ...l, id: l.id + '-again' + n }));
        const layers = [...T(Z0), ...again(1), ...again(2)].map((l) => ({ far: [0.2, 0.36], ...l }));
        return { rig: Souvenir.rig(env, layers) };
    },
    draw(g, t, env) {
        const cam = (u) => ({ z: Z0 - LEAD + SPEED * u, focus: Z0 - LEAD + SPEED * u + FOCUS, aperture: 10 });
        env.state.rig.draw(g, t, cam, { bg: '#1b1e3d', maxSamples: 8, shutter: 0.36 });
    },
    post(ctx, t, env) {
        Souvenir.finish(ctx, env, Math.round(t * env.fps));
    },
});
