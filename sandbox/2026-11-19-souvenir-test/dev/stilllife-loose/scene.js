// The test bench for ONE loose stratum (round 8): the film's camera as it is by the second
// passage (fast, rolling on its axis, focused 1000 ahead) flies through your stratum of loose
// floating pieces and through two more copies of it, 680 and 1360 behind (turned half a turn
// and a quarter, so they do not line up with yours), standing in for the strata of the other
// worlds: what must be judged is how the pieces float over each other, at many depths, with
// the frame full of things and the night only in slivers between them.
// Copy this file to dev/<name>-loose/scene.js and edit the block below. Nothing else changes.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
// ---------------------------------------------------------------- edit this block
const NAME = 'stilllife'; // Tableau[NAME].loose(z) → one layer per piece
const USES = [DIR + 'things/stilllife.js', DIR + 'tableaux/stilllife.js']; // your files, in order
const FONTS = [{ family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }]; // the motto's roman
const SPEED = 1100; // the film's pace at the still life (second passage)
// ---------------------------------------------------------------- the film's camera
const FOCUS = 1000, Z0 = 2000, LEAD = 1700, STEP = 680, TURN = 0.6; // TURN: roll, radians a second
Motion.scene({
    fps: 24,
    duration: Math.ceil(((LEAD + STEP + 400) / SPEED) * 24) / 24,
    logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', ...USES],
    fonts: FONTS,
    setup(env) {
        const T = Tableau[NAME].loose;
        // a copy turned by `a` about the axis (box and paint together)
        const turned = (l, a, n) => {
            const b = l.box, c = Math.cos(a), s = Math.sin(a);
            const xs = [b.x, b.x + b.w].flatMap((x) => [b.y, b.y + b.h].map((y) => x * c - y * s)), ys = [b.x, b.x + b.w].flatMap((x) => [b.y, b.y + b.h].map((y) => x * s + y * c));
            const box = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
            return {
                ...l, id: l.id + '-again' + n, box, z: l.z + n * STEP,
                paint(g, res) {
                    g.rotate(a);
                    l.paint(g, res);
                },
            };
        };
        // paint seconds of each piece of the stratum itself (not its copies), logged once
        const timed = (l) => ({ ...l, paint(g, res) { const t0 = performance.now(); l.paint(g, res); const ms = performance.now() - t0; (window.__paint = window.__paint || []).push([l.id, ms]); if (ms > 1500) console.log('slow piece', l.id, Math.round(ms), 'ms'); } });
        const layers = [...T(Z0).map(timed), ...T(Z0).map((l) => turned(l, Math.PI, 1)), ...T(Z0).map((l) => turned(l, Math.PI / 2, 2))].map((l) => ({ far: [0.2, 0.36], ...l }));
        return { rig: Souvenir.rig(env, layers) };
    },
    draw(g, t, env) {
        const cam = (u) => ({ z: Z0 - LEAD + SPEED * u, focus: Z0 - LEAD + SPEED * u + FOCUS, aperture: 10, roll: TURN * u });
        env.state.samples = env.state.rig.draw(g, t, cam, { bg: '#1b1e3d', maxSamples: 8, shutter: 0.36 });
    },
    post(ctx, t, env) {
        if (window.__paint && !window.__told) {
            window.__told = true;
            const P = window.__paint, sum = P.reduce((a, p) => a + p[1], 0), top = P.slice().sort((a, b) => b[1] - a[1]).slice(0, 6);
            console.log(`stratum painted: ${P.length} pieces, ${(sum / 1000).toFixed(1)} s; slowest ${top.map(([i, m]) => i.replace('stilllife-l-', '') + ' ' + (m / 1000).toFixed(2)).join(', ')}`);
        }
        Souvenir.finish(ctx, env, Math.round(t * env.fps));
    },
});
// When is your stratum's depth z0 1000 ahead of the camera? t = (LEAD − 1000 + (z0 − Z0)) / SPEED:
// with SPEED 1000, 0.70 s for the stratum's middle depth (Z0).
