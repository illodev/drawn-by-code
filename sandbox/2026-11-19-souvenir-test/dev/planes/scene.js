// The test bench for ONE picture of the film: the film's own camera (one pace, on the axis,
// focused 1000 ahead) flies through it, with stand-ins for the picture before (a plate of
// its colour with its hole) and for the one after (its glow, seen through your hole).
// Copy this file to dev/<name>/scene.js and edit the block below. Nothing else changes.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
// ---------------------------------------------------------------- edit this block
const NAME = 'planes'; // Tableau[NAME](z0) → layers; Tableau[NAME].depth, Tableau[NAME].hole
const USES = [DIR + 'things/guitar.js', DIR + 'things/charms.js', DIR + 'things/planes.js', DIR + 'tableaux/planes.js']; // your files, in order (add any library file you reuse)
const FONTS = [{ family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }, { family: 'Anton', src: 'fonts/Anton-latin.woff2' }, { family: 'Lora', src: 'fonts/Lora-Medium-latin.woff2' }]; // { family, src } of any font you letter with (see fonts/)
const BEFORE = { color: '#b79a6a', hole: 140 }; // the plate you are entered through: its colour, its hole's radius
const AFTER = '#e2702a'; // what glows behind your own hole (the next picture's dominant colour)
const DEPTH = 2100; // = Tableau[NAME].depth (kept here too: the duration must be known before the files load)
// ---------------------------------------------------------------- the film's camera
const SPEED = 432, FOCUS = 1000, Z0 = 2000, LEAD = 1500, GAP = 700;
Motion.scene({
    fps: 24,
    duration: Math.ceil(((LEAD + DEPTH + 250) / SPEED) * 24) / 24,
    logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', ...USES],
    fonts: FONTS,
    setup(env) {
        const T = Tableau[NAME], depth = T.depth ?? DEPTH;
        const big = { x: -1800, y: -1050, w: 3600, h: 2100 };
        const layers = [
            {
                id: 'bench-before', z: Z0 - GAP, box: big, hole: BEFORE.hole, brush: false, res: 0.5,
                paint(g) {
                    g.fillStyle = BEFORE.color;
                    g.fillRect(big.x, big.y, big.w, big.h);
                    g.globalCompositeOperation = 'destination-out';
                    g.fillStyle = '#000';
                    g.beginPath();
                    g.arc(0, 0, BEFORE.hole, 0, 7);
                    g.fill();
                    g.globalCompositeOperation = 'source-over';
                },
            },
            ...T(Z0).map((l) => ({ far: [0.2, 0.36], ...l })),
            {
                id: 'bench-after', z: Z0 + depth + 900, box: big, brush: false, res: 0.25,
                paint(g) {
                    g.fillStyle = AFTER;
                    g.fillRect(big.x, big.y, big.w, big.h);
                },
            },
        ];
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
