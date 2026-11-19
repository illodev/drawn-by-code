// 2026-11-19-souvenir-test · style souvenir
// «Recuerdo de Andalucía», style test: the emblem, and the dive through the guitar's mouth
// into the lemon tree.
const DIR = 'sandbox/2026-11-19-souvenir-test/';

// The opening: from far away the emblem is one star in the night. It kindles, flares, and
// the emblem comes out of the flare. Drawn as light (added), so the lens blooms it.
function opening(g, t, env) {
    const S = Souvenir, E = Ease;
    const kindle = E.out(E.seg(t, 0.2, 0.75)), flare = E.inOut(E.seg(t, 0.8, 1.12)), die = 1 - E.out(E.seg(t, 1.1, 1.7));
    const I = (0.3 * kindle + 0.7 * flare) * die * (1 + 0.06 * Math.sin(t * 31) * (1 - flare));
    if (I <= 0.002) return;
    const cx = env.W / 2, cy = env.H / 2;
    g.save();
    g.globalCompositeOperation = 'lighter';
    // the glow: a warm core, a rose and a jade skirt
    for (const [rad, col, a] of [[80 + 1000 * flare * flare, '255,204,130', 0.42], [60 + 700 * flare * flare, '255,140,160', 0.2], [130 + 1500 * flare * flare, '120,220,190', 0.12], [16 + 230 * flare, '255,246,224', 0.9]]) {
        const gr = g.createRadialGradient(cx, cy, 0, cx, cy, rad);
        gr.addColorStop(0, `rgba(${col},${a * I})`);
        gr.addColorStop(0.35, `rgba(${col},${a * I * 0.35})`);
        gr.addColorStop(1, `rgba(${col},0)`);
        g.fillStyle = gr;
        g.fillRect(0, 0, env.W, env.H);
    }
    // the star itself: eight points, four long and four short, turning a little
    g.translate(cx, cy);
    g.rotate(0.12 + t * 0.25);
    const R = (10 + 26 * kindle + 380 * flare * flare) * (0.6 + 0.4 * die);
    for (let k = 0; k < 8; k++) {
        const len = R * (k % 2 ? 0.55 : 1) * (k % 4 === 0 ? 2.2 : 1), w = Math.max(1.2, R * 0.035);
        const a = (k / 8) * Math.PI * 2;
        const gr = g.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len);
        gr.addColorStop(0, `rgba(255,246,224,${0.95 * I})`);
        gr.addColorStop(1, 'rgba(255,220,160,0)');
        g.fillStyle = gr;
        g.beginPath();
        g.moveTo(Math.cos(a + 1.57) * w, Math.sin(a + 1.57) * w);
        g.lineTo(Math.cos(a) * len, Math.sin(a) * len);
        g.lineTo(Math.cos(a - 1.57) * w, Math.sin(a - 1.57) * w);
        g.closePath();
        g.fill();
    }
    g.restore();
}
Motion.scene({
    fps: 24,
    duration: 8,
    logical: [1600, 900],
    uses: [
        'styles/souvenir/souvenir.js',
        DIR + 'things/citrus.js', DIR + 'things/fan.js', DIR + 'things/shawl.js',
        { src: DIR + 'things/guitar.js', optional: true }, { src: DIR + 'things/garland.js', optional: true }, { src: DIR + 'things/sky.js', optional: true },
        { src: DIR + 'things/ribbon.js', optional: true }, { src: DIR + 'things/charms.js', optional: true },
        DIR + 'tableaux/emblem.js', DIR + 'tableaux/lemons.js',
    ],
    fonts: [{ family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }],
    // one take: these only name its parts for the contact sheet
    shots: [[0, 1, 'The star'], [1, 1.75, 'The flare'], [1.75, 3.4, 'The emblem'], [3.4, 4.5, 'The dive'], [4.5, 8, 'The lemon tree']],
    setup(env) {
        const Z1 = 1000, Z2 = 2340;
        // nothing shows as a speck in the night before the star has flared
        const layers = [...Tableau.emblem(Z1), ...Tableau.lemons(Z2)].map((l) => ({ ...l, far: l.id.startsWith('emblem') ? [0.05, 0.14] : [0.12, 0.2] }));
        // the camera's depth and what it focuses on, as keys; eased between with their slopes
        const zKeys = [[0, -42000], [0.95, -38000], [1.22, -9000], [1.42, -1500], [1.66, -40], [3.4, 110], [4.55, 1330], [8, 1470]];
        const fKeys = [[0, 1000], [3.95, 1000], [4.4, 2340], [8, 2340]];
        // during the hold the camera looks a little below the axis (the mouth sits above the
        // middle of the frame, the ribbon is in); it comes back onto the axis to go through
        const yKeys = [[0, 0], [1.3, 0], [1.7, 52], [3.2, 52], [3.95, 0], [8, 0]];
        return { rig: Souvenir.rig(env, layers), zKeys, fKeys, yKeys };
    },
    draw(g, t, env) {
        const st = env.state;
        const cam = (t) => ({ z: Souvenir.track(st.zKeys, t), focus: Souvenir.track(st.fKeys, t), y: Souvenir.track(st.yKeys, t), aperture: 15, roll: 0.012 * Math.sin(t * 0.7) });
        env.state.samples = st.rig.draw(g, t, cam, { bg: Tableau.NIGHT });
        opening(g, t, env);
    },
    post(ctx, t, env) {
        Souvenir.finish(ctx, env, Math.round(t * env.fps));
    },
});
