// Dev sheet for things/guitar.js: the guitar at film size (t = 0), 2.5× on the mouth and the
// rosette (t = 1), 2.5× on the bridge (t = 2), and other close views. From t = 16 the same
// views with the finish (lens and print) on, to judge both the raw paint and the film's.
// From t = 32, the guitar in the emblem's own rig (tableaux/emblem.js, with whatever other
// things exist), the camera at four distances along the dive into the mouth.
const SPEC = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 24, duration: 36, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', SPEC + 'things/guitar.js', { src: SPEC + 'things/fan.js', optional: true }, { src: SPEC + 'things/shawl.js', optional: true }, { src: SPEC + 'tableaux/emblem.js', optional: true }],
    fonts: [{ family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }],
    setup(env) {
        return { rig: typeof Tableau !== 'undefined' && Tableau.emblem ? Souvenir.rig(env, Tableau.emblem(0)) : null };
    },
    draw(g, t, env) {
        const S = Souvenir;
        if (t >= 32 - 1e-6) {
            // the camera's distance from the guitar's top: the film's first frame, then the dive
            const d = [1000, 420, 170, 80][Math.floor(t - 32 + 1e-6) % 4];
            g.fillStyle = '#0c1712';
            g.fillRect(0, 0, 1600, 900);
            if (env.state.rig) env.state.rig.still(g, { z: -d, focus: 0, aperture: 14 });
            return;
        }
        const v = Math.floor(t + 1e-6) % 16;
        g.fillStyle = '#232749';
        g.fillRect(0, 0, 1600, 900);
        // [scale, the guitar's point at the frame's centre, what to draw]
        const VIEWS = [
            [1, 0, 0, 'all'], // 0 film size, the mouth at the centre
            [2.5, 0, 0, 'all'], // 1 the mouth and the rosette
            [2.5, 0, 268, 'all'], // 2 the bridge
            [0.62, 0, -105, 'all'], // 3 the whole of it
            [1, 0, 0, 'body'], // 4 the body alone on a loud ground: is the hole a hole?
            [2.8, 0, 0, 'inside'], // 5 the inside alone
            [2.5, 0, -330, 'all'], // 6 the neck and its frets
            [2.5, -150, -150, 'all'], // 7 a shoulder: binding and purfling
            [2.5, 60, 400, 'all'], // 8 the lower bout's edge
            [5, 50, 50, 'all'], // 9 the rosette's tiles
            [5, 0, 268, 'all'], // 10 the tie block and its knots
            [5, -60, -150, 'all'], // 11 frets, the fingerboard's edge, the top beside it
            [5, 90, 268, 'all'], // 12 a wing of the bridge
            [5, 0, -40, 'all'], // 13 the fingerboard's end over the mouth
            [1, 0, 0, 'fans'], // 14 over a fan's colours: how the contour reads
            [0.8, 0, 60, 'turned'], // 15 on a turned context, knots with the strings: the drawers' other paths
        ];
        const [s, cx, cy, what] = VIEWS[v];
        const x = 800 - cx * s, y = 450 - cy * s;
        if (what === 'fans') {
            // the greens and creams the guitar will stand on in the emblem
            for (let i = 0; i < 32; i++) {
                g.fillStyle = ['#1f7350', '#46a676', '#ecdcb4', '#0b3a2f'][i % 4];
                g.fillRect(i * 50, 0, 50, 900);
            }
        }
        if (what === 'turned') {
            g.translate(800, 450);
            g.rotate(0.5);
            g.translate(-800, -450);
        }
        if (what === 'body') {
            for (let j = 0; j < 9; j++) for (let i = 0; i < 16; i++) {
                g.fillStyle = (i + j) % 2 ? '#e33bd0' : '#35e0c0';
                g.fillRect(i * 100, j * 100, 100, 100);
            }
        }
        // the inside sits 30 behind the top: from the film's first frame it is seen 0.971 as big
        if (what !== 'body') Guitar.inside(g, { x, y, s: what === 'inside' ? s : s * 0.971 });
        // the knots are the body's by default; the turned view ties them with the strings instead
        if (what !== 'inside') Guitar.body(g, { x, y, s, knots: what !== 'turned' });
        if (what !== 'body' && what !== 'inside') Guitar.strings(g, { x, y, s, knots: what === 'turned' });
        if (what === 'turned') g.setTransform(env.k, 0, 0, env.k, 0, 0);
        S.tooth(g, { x: 0, y: 0, w: 1600, h: 900 });
    },
    post(ctx, t, env) {
        if (t >= 16 - 1e-6) Souvenir.finish(ctx, env, 0);
    },
});
