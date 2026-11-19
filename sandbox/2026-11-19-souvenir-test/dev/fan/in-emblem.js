// Dev: the fans where the film shows them, inside the whole emblem (picture 1 only), at
// the camera of the film's hold (t = 2.6 s). To check what the guitar, the olive wreath and
// the swallows leave in view of each fan's painting, and where the cartouches fall.
//   t = 0     the film's frame, with the lens finish
//   t = 0.5   the same, raw paint
const SVE = 'sandbox/2026-11-19-souvenir-test/';
const GRID = false; // true: paint a (u, v) map over each leaf, to read off what the emblem leaves in view
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: [
        'styles/souvenir/souvenir.js', SVE + 'things/citrus.js', SVE + 'things/fan.js', SVE + 'things/shawl.js',
        { src: SVE + 'things/guitar.js', optional: true }, { src: SVE + 'things/garland.js', optional: true }, { src: SVE + 'things/sky.js', optional: true },
        { src: SVE + 'things/ribbon.js', optional: true }, { src: SVE + 'things/charms.js', optional: true },
        SVE + 'tableaux/emblem.js',
    ],
    fonts: [{ family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }],
    setup(env) {
        if (GRID) {
            // a map of the leaf instead of its painting: u in tenths (thick lines, numbered), v in quarters
            const real = Fan.draw;
            Fan.draw = (g, o) => {
                real(g, o);
                const P = (u, v) => Fan.at(o, u, v);
                g.save();
                g.fillStyle = '#f4f0e6';
                g.beginPath();
                for (let k = 0; k <= 60; k++) g.lineTo(...P(k / 60, 0));
                for (let k = 60; k >= 0; k--) g.lineTo(...P(k / 60, 1));
                g.fill();
                g.font = '13px sans-serif';
                for (let i = 0; i <= 20; i++) {
                    g.strokeStyle = i % 2 ? 'rgba(200,40,40,0.5)' : '#c82828';
                    g.lineWidth = i % 2 ? 0.8 : 1.8;
                    g.beginPath();
                    g.moveTo(...P(i / 20, 0));
                    g.lineTo(...P(i / 20, 1));
                    g.stroke();
                    if (i % 2 === 0) for (const v of [0.12, 0.37, 0.62, 0.87]) {
                        g.fillStyle = '#1a1a60';
                        g.fillText(String(i / 2), ...P(i / 20 + 0.012, v));
                    }
                }
                for (let j = 0; j <= 8; j++) {
                    g.strokeStyle = j % 2 ? 'rgba(40,90,200,0.5)' : '#285ac8';
                    g.lineWidth = j % 2 ? 0.8 : 1.8;
                    g.beginPath();
                    for (let k = 0; k <= 60; k++) g.lineTo(...P(k / 60, j / 8));
                    g.stroke();
                }
                g.restore();
            };
        }
        const layers = Tableau.emblem(1000);
        return { rig: Souvenir.rig(env, layers) };
    },
    draw(g, t, env) {
        const zKeys = [[0, -42000], [0.95, -38000], [1.22, -9000], [1.42, -1500], [1.66, -40], [3.4, 110], [3.92, 560], [4.6, 1330], [8, 1470]];
        const cam = () => ({ z: Souvenir.track(zKeys, 2.6), focus: 1000, y: 52, aperture: 15, roll: 0 });
        env.state.rig.draw(g, 2.6, cam, { bg: Tableau.NIGHT });
    },
    post(ctx, t, env) {
        if (t < 0.25) Souvenir.finish(ctx, env, 0);
    },
});
