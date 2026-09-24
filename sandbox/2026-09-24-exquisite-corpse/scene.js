// 2026-09-24-exquisite-corpse · five styles and five transitions in 30 s
// A marble passes from creature to creature like the relay of an exquisite corpse.
// Each segment lives in segments/*.js; here they are only assembled and linked with the transitions.
const DIR = 'sandbox/2026-09-24-exquisite-corpse/';
Motion.scene({
    fps: 24,
    duration: 30,
    logical: [1600, 900],
    uses: [
        'engine/transitions.js',
        'styles/paper-cutout/paper.js', 'styles/paper-cutout/kit.js',
        'styles/70s-poster/kit.js', 'styles/liquid-light/kit.js', 'styles/kaleidoscope/kit.js', 'styles/line/kit.js',
        DIR + 'segments/common.js', DIR + 'segments/frog.js', DIR + 'segments/mushroom.js', DIR + 'segments/jellyfish.js',
        DIR + 'segments/kaleido.js', DIR + 'segments/doodle.js',
    ],
    fonts: [
        { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' },
        { family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' },
    ],
    bpm: 120,
    audio: { mix: 'mix.wav' },
    // every segment change is a music beat; the transitions are shots of their own
    shots: [
        [0, 5, 'Frog · paper'],
        [5, 6.5, '→ enter through the eye'],
        [6.5, 10.5, 'Mushroom · 70s poster'],
        [10.5, 12, '→ engulf'],
        [12, 16.5, 'Jellyfish · liquid light'],
        [16.5, 18, '→ vortex'],
        [18, 22, 'Climax · kaleidoscope'],
        [22, 23.5, '→ frame within the frame'],
        [23.5, 27.5, 'Doodle · line'],
        [27.5, 28.5, '→ paper ball'],
        [28.5, 30, '→ back to the frog'],
    ],

    setup(env) {
        return { kit: PaperKit.make(env, { font: 'Hand' }) };
    },

    draw(g, t, env) {
        const E = Ease, T = Trans;
        const seg = (a, b) => E.seg(t, a, b);
        const frog = (gg) => Segment.frog(gg, t, env);
        const frogLoop = (gg) => Segment.frog(gg, t - 30, env);
        const mushroom = (gg) => Segment.mushroom(gg, t, env);
        const jellyfish = (gg) => Segment.jellyfish(gg, t, env);
        const kaleido = (gg) => Segment.kaleido(gg, t, env);
        const dark = (gg) => ((gg.fillStyle = '#08040f'), gg.fillRect(0, 0, env.W, env.H));
        const night = (gg) => env.state.kit.paperBg(gg, 'noche', '#1b2444', { bleed: 500 });

        if (t < 5) frog(g);
        else if (t < 6.5) {
            const eye = Segment.frogEye(env, 5);
            T.enter(g, env, seg(5, 6.5), { a: frog, b: mushroom, cx: eye.p[0], cy: eye.p[1], r0: eye.r * 0.95, zoom: 70, spin: 1.2 });
        } else if (t < 10.5) mushroom(g);
        else if (t < 12) T.engulf(g, env, seg(10.5, 12), { a: mushroom, b: jellyfish, origin: [800, 560], seed: 'esporas', count: 26, puff: Segment.mushroomSpore });
        else if (t < 16.5) jellyfish(g);
        else if (t < 18) T.vortex(g, env, seg(16.5, 18), { a: jellyfish, b: dark, cx: env.W / 2, cy: env.H / 2, turns: 2.2 });
        else if (t < 22) kaleido(g);
        else if (t < 23.5) {
            T.frame(g, env, seg(22, 23.5), {
                inner: kaleido, outer: (gg) => Segment.doodle(gg, t, env, { inner: false }), at: Segment.doodleCircle,
                rim: (gg, at) => Segment.doodleRim(gg, at, t),
            });
        } else if (t < 27.5) Segment.doodle(g, t, env);
        else if (t < 28.5) {
            night(g);
            Segment.paperBall(g, t, env, seg(27.5, 28.5));
        } else {
            // the paper ball opens and inside is the pond from the beginning
            const u = seg(28.5, 29.4);
            T.iris(g, env, u, {
                a: (gg) => (night(gg), Segment.paperBall(gg, 28.5, env, 1)), b: frogLoop, cx: env.W / 2, cy: env.H / 2,
                edge: (gg, x, y, r) => {
                    if (r <= 0 || u >= 1) return;
                    gg.save();
                    gg.strokeStyle = LineArt.PAPER;
                    gg.lineWidth = 26 * (1 - u) + 4;
                    gg.beginPath();
                    for (let i = 0; i <= 48; i++) {
                        const a = (i / 48) * Math.PI * 2, rr = r + Math.sin(i * 7.3) * 8;
                        gg.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
                    }
                    gg.stroke();
                    gg.restore();
                },
            });
        }
    },

    post(ctx, t, env) {
        // paper grain in the paper and line segments; the digital ones stay clean
        const paper = t < 6.2 || t > 22.5;
        if (paper) env.state.kit.grainPost(ctx, t > 22.5 && t < 27.5 ? 0.25 : 0.45);
    },
});
