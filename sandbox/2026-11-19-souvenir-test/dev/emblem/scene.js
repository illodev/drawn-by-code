// The emblem alone on the film's own camera (no lemon tree): a quick stage for composing.
// Made from scene.js by dev/emblem/make.py; do not edit by hand.
// «Recuerdo de Andalucía», style test: the emblem, and the dive through the guitar's mouth
// into the lemon tree.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
// When things happen (seconds): the star flares, the emblem has arrived, the long push ends,
// the camera is at the mouth, it is inside the tree, the end.
const TIMES = { flare: 1.0, arrive: 1.7, push: 5.0, mouth: 5.55, tree: 6.25, end: 10.5 };

// The opening: from far away the emblem is one star among the others. It kindles, flares,
// the night's stars rush past, and the emblem comes out of the flare. Drawn as light
// (added), so the lens blooms it.
let nightSky = null;
function opening(g, t, env) {
    const S = Souvenir, E = Ease;
    if (t > 1.75) return;
    const cx = env.W / 2, cy = env.H / 2;
    // the other stars: still while we wait, then streaming outwards as the camera leaves
    if (!nightSky) {
        nightSky = document.createElement('canvas');
        nightSky.width = env.px[0];
        nightSky.height = env.px[1];
        const q = nightSky.getContext('2d');
        q.setTransform(env.k, 0, 0, env.k, 0, 0);
        if (typeof Sky !== 'undefined') Sky.field(q, { box: { x: 0, y: 0, w: env.W, h: env.H }, seed: 'opening', n: 150 });
    }
    const rush = E.in(E.seg(t, 0.95, 1.6)), skyA = 1 - E.inOut(E.seg(t, 1.2, 1.6));
    if (skyA > 0.003) {
        const zoom = (u) => 1 + 0.035 * u + 5 * E.in(E.seg(u, 0.95, 1.6));
        const n = rush > 0.01 ? 7 : 1, z0 = zoom(t - 0.021), z1 = zoom(t);
        g.save();
        g.globalCompositeOperation = 'lighter';
        for (let i = 0; i < n; i++) {
            const z = z0 + ((z1 - z0) * (i + 0.5)) / n;
            g.globalAlpha = (skyA * (0.75 + 0.25 * Math.sin(t * 5 + 1))) / Math.sqrt(n);
            g.drawImage(nightSky, cx - (env.W * z) / 2, cy - (env.H * z) / 2, env.W * z, env.H * z);
        }
        g.restore();
    }
    const kindle = 0.3 + 0.7 * E.out(E.seg(t, 0, 0.75)), flare = E.inOut(E.seg(t, 0.8, 1.12)), die = 1 - E.out(E.seg(t, 1.1, 1.7));
    const I = (0.3 * kindle + 0.7 * flare) * die * (1 + 0.07 * Math.sin(t * 31) * (1 - flare));
    if (I <= 0.002) return;
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
    // the star itself, eight-pointed like the stars of the tilework: four long rays and
    // four short, turning a little
    g.translate(cx, cy);
    g.rotate(0.12 + t * 0.25);
    const R = (10 + 30 * kindle + 380 * flare * flare) * (0.6 + 0.4 * die);
    for (let k = 0; k < 8; k++) {
        const len = R * (k % 2 ? 0.5 : 1.5), w = Math.max(1.2, R * 0.04);
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
    duration: 10.5,
    logical: [1600, 900],
    uses: [
        'styles/souvenir/souvenir.js',
        DIR + 'things/fan.js', DIR + 'things/shawl.js',
        { src: DIR + 'things/guitar.js', optional: true }, { src: DIR + 'things/garland.js', optional: true }, { src: DIR + 'things/sky.js', optional: true },
        { src: DIR + 'things/ribbon.js', optional: true }, { src: DIR + 'things/charms.js', optional: true },
        { src: DIR + 'things/papers.js', optional: true }, { src: DIR + 'things/wares.js', optional: true }, { src: DIR + 'things/fauna.js', optional: true },
        { src: DIR + 'things/coins.js', optional: true }, { src: DIR + 'things/relics.js', optional: true }, { src: DIR + 'things/heirlooms.js', optional: true },
        { src: DIR + 'things/library.js', optional: true }, { src: DIR + 'things/devotion.js', optional: true },
        DIR + 'tableaux/emblem.js',
    ],
    fonts: [
        { family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }, { family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' }, { family: 'Anton', src: 'fonts/Anton-latin.woff2' },
        { family: 'Lora', src: 'fonts/Lora-Medium-latin.woff2' }, { family: 'Titan One', src: 'fonts/TitanOne-latin.woff2' },
    ],
    // one take: these only name its parts for the contact sheet
    shots: [[0, 1, 'The star'], [1, 1.75, 'The flare'], [1.75, 5, 'The emblem'], [5, 6.25, 'The dive'], [6.25, 10.5, 'The lemon tree']],
    setup(env) {
        const Z1 = 1000, Z2 = 2340;
        // nothing shows as a speck in the night before the star has flared
        // (the lemon tree is in the brush manner: its strokes are in its own paint)
        const layers = [...Tableau.emblem(Z1)].map((l) => (l.id.startsWith('emblem') ? { ...l, far: [0.05, 0.14] } : { ...l, far: [0.12, 0.2], brush: false }));
        // The camera's depth, what it focuses on and how far below the axis it looks, as keys.
        //   the star · the flare and the arrival (wide: the whole wheel of relics is in) ·
        //   a long push over the emblem (what is at the edges leaves the frame, the eye is
        //   led to the mouth) · the approach lingers on the rosette · the plunge · the tree
        const T = TIMES;
        const zKeys = [[0, -42000], [T.flare - 0.05, -38000], [T.flare + 0.22, -9000], [T.flare + 0.42, -1800], [T.arrive, -300], [T.push, 120], [T.mouth, 560], [T.tree, 1330], [T.end, 1480]];
        const fKeys = [[0, 1000], [T.mouth + 0.1, 1000], [T.tree - 0.15, 2340], [T.end, 2340]];
        const yKeys = [[0, 0], [T.flare + 0.3, 0], [T.arrive, 52], [T.push - 0.2, 52], [T.mouth, 0], [T.end, 0]];
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
