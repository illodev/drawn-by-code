// 2026-11-12-oil-test · style oil
// A test of the oil style on one shot of the film: an old man who has lost the centre of
// his sight looks across a square. The present is there, loosely brushed, wherever he is
// not looking; where his eye rests, memory paints the summer of 1974 with a fine brush.
Motion.scene({
    fps: 24,
    duration: 8,
    logical: [1600, 900],
    uses: ['styles/oil/oil.js', 'sandbox/2026-11-12-oil-test/plaza.js', 'sandbox/2026-11-12-oil-test/detail.js'],
    fonts: [{ family: 'Fell', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }],
    shots: [[0, 8, 'The square']],
    setup(env) {
        const box = Plaza.BOX;
        const now = Oil.study(box, { ground: '#a39a8b' }), then = Oil.study(box, { res: 1.25 });
        Plaza.paint(now, 'now');
        Plaza.paint(then, 'then');
        const loose = Oil.lay(now, Plaza.NOW, { seed: 'now', ground: '#a39a8b', blur: 13, lines: false });
        const fine = Oil.lay(then, Oil.FINE, { seed: 'then' });
        const pic = Oil.painting(env, box, { ground: '#a8987f' });
        pic.base(loose);
        window.__oil = { loose, fine }; // for tools/probe.mjs
        return { pic, fine, now, then };
    },
    draw(g, t, env) {
        const { pic, fine } = env.state, d = Math.floor(t * 12 + 1e-6);
        const look = (s) => Motion.keys([[1.5, [372, 425]], [3.1, [930, 452]], [4.3, [930, 452]], [5.5, [1292, 478]]], s);
        // where the eye rests, per drawing: it trembles a little, and the patch breathes
        const gaze = (q) => {
            const s = q / 12, p = look(s);
            return { x: p[0] + Motion.noise1('gx', q * 0.45) * 9, y: p[1] + Motion.noise1('gy', q * 0.45) * 7, r: (262 + 12 * Math.sin(s * 1.9)) * Ease.inOut(Ease.seg(s, 0.45, 1.5)) + 0.5, ph: s * 0.7 };
        };
        pic.frame(d, (sf) => {
            sf.stamp(fine, Oil.focus(fine, d, gaze, { wide: 1.2 }));
            // what moves inside the memory: swallows, leaves turning in the light
            const live = Oil.marks(PlazaDetail.live(d), Oil.FINE, 4, 'live');
            sf.stamp(live, Oil.focus(live, d, gaze, { wide: 1.2 }));
        });
        // the head follows the eyes, late and not all the way
        const h = look(t - 0.3);
        g.save();
        g.translate(-(h[0] - 800) * 0.3 + Math.sin(t * 0.9) * 3, -(h[1] - 450) * 0.15 + Math.sin(t * 1.3 + 1) * 2);
        pic.draw(g);
        g.restore();
    },
});
