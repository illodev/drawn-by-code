// 2026-11-12-donde-miro · «Donde miro» · style oil
// One shot through an old man's eyes. He has lost the centre of his sight: what he looks at
// straight on is bare canvas, and his memory paints the summer of 1974 into it. The present
// only survives at the edges, out of focus. Every look, and when it happens, comes from
// the voice's timeline (timeline.js, written by gen-voice.mjs).
Motion.scene({
    fps: 24,
    duration: 103, // = Voice.duration: stated here because the scene is read before timeline.js
    logical: [1600, 900],
    uses: ['styles/oil/oil.js', 'sandbox/2026-11-12-donde-miro/timeline.js', 'sandbox/2026-11-12-donde-miro/plaza.js', 'sandbox/2026-11-12-donde-miro/detail.js', 'sandbox/2026-11-12-donde-miro/people.js'],
    fonts: [{ family: 'Fell', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }],
    audio: { mix: 'mix.wav' },
    // one continuous shot; these are its beats, for the contact sheet's labels only
    shots: [[0, 5.2, 'The square, now'], [5.2, 17.5, 'The stain'], [17.5, 27.5, 'The tree'], [27.5, 36.5, 'The shop'], [36.5, 58, 'Her'], [58, 70.5, 'The edges'], [70.5, 81, 'The girl'], [81, 103, 'Sideways']],
    setup(env) {
        const box = Plaza.BOX;
        const now = Oil.study(box, { ground: '#a39a8b' }), then = Oil.study(box, { res: 1.25 });
        Plaza.paint(now, 'now');
        Plaza.paint(then, 'then');
        const loose = Oil.lay(now, Plaza.NOW, { seed: 'now', ground: '#a39a8b', blur: 13, lines: false });
        const fine = Oil.lay(then, Oil.FINE, { seed: 'then' });
        const pic = Oil.painting(env, box, { ground: '#a8987f' });
        pic.base(loose);
        if (Math.abs(Voice.duration - env.duration) > 0.01) throw new Error(`scene duration ${env.duration} ≠ voice ${Voice.duration}`);

        // --- the timeline, from the voice ---------------------------------------------
        const L = Object.fromEntries(Voice.lines.map((l) => [l.id, l]));
        const W = (id, start) => {
            const w = L[id].words.find((x) => x[0].toLowerCase().startsWith(start));
            if (!w) throw new Error(`no word «${start}» in line ${id}`);
            return w[1];
        };
        const T = {
            stain: L.mancha.t0, fill: W('huecos', 'rellena'), her: L.tu.t0, look: W('borra', 'miro'), up: W('arriba', 'arriba'),
            girlOut: L.nina.t0 + 0.4, girlCall: W('nina', 'abuelo'), near0: L.aqui.t0, near1: W('aqui', 'aquí') + 0.4, hurry: L.bordes.t0,
        };
        // where his eye rests
        const eye = [
            [0, [800, 452]],
            [L.nada.t0, [800, 452]], [L.nada.t0 + 1.7, [470, 400]], [L.nada.t1, [470, 400]], [L.nada.t1 + 1.4, [640, 486]],
            [L.arbol.t0 - 0.2, [640, 486]], [W('arbol', 'árbol') + 0.5, [372, 425]],
            [L.tienda.t0 - 0.1, [372, 425]], [W('tienda', 'persiana') + 0.9, [930, 452]], [W('tienda', 'naranjas') - 0.6, [930, 452]], [W('tienda', 'naranjas') + 0.6, [880, 520]],
            [L.portal.t0, [880, 520]], [T.her + 0.1, [1292, 478]],
            [L.veo.t0 + 0.4, [1292, 478]], [L.veo.t0 + 2, [1350, 556]], [L.veo.t1 - 0.4, [1350, 556]], [L.bordes.t0 + 0.6, [780, 380]],
            [T.look - 0.9, [780, 380]], [T.look + 0.3, [1296, 520]],
            [T.up - 0.5, [1296, 520]], [T.up + 0.9, [1215, 120]],
            [env.duration, [1215, 120]],
        ];
        eye.forEach((k, i) => { if (i && k[0] <= eye[i - 1][0]) throw new Error('eye keys out of order at ' + k[0]); });
        return { pic, fine, loose, T, eye };
    },
    draw(g, t, env) {
        const { pic, fine, loose, T, eye } = env.state, E = Ease, d = Math.floor(t * 12 + 1e-6);
        const look = (s) => Motion.keys(eye, s);
        // the patch of memory: nothing until his head starts filling the hole; smaller at
        // the end, when he keeps it up on the balcony and off the child
        const gaze = (q) => {
            const s = q / 12, p = look(s);
            const r = (262 - 57 * E.inOut(E.seg(s, T.up - 0.5, T.up + 1.2)) + 12 * Math.sin(s * 1.9)) * E.inOut(E.seg(s, T.fill, T.fill + 2.8));
            return { x: p[0] + Motion.noise1('gx', q * 0.45) * 9, y: p[1] + Motion.noise1('gy', q * 0.45) * 7, r: r + 0.5, ph: s * 0.7 };
        };
        // the stain itself: bare canvas where he looks, until memory has covered it
        const stain = (q) => {
            const s = q / 12, p = look(s);
            return { x: p[0] + Motion.noise1('gx', q * 0.45) * 9, y: p[1] + Motion.noise1('gy', q * 0.45) * 7, r: 150 * E.inOut(E.seg(s, T.stain, T.stain + 1.4)) * (s < T.fill + 3.4 ? 1 : 0), ph: s * 0.7 };
        };
        pic.frame(d, (sf) => {
            const h = Oil.hole(loose, d, stain);
            if (h) {
                sf.clear(h.rect);
                sf.stamp(loose, h.sel, h.rect);
            }
            // the present's people, under whatever memory paints over them
            const s = d / 12, ppl = [];
            const a1 = (s - (T.hurry - 0.4)) / 6.2, a2 = (s - (T.hurry + 1.3)) / 7.4;
            if (a1 > 0 && a1 < 1) ppl.push(...People.passer(-190 + a1 * 2020, 990, 315, 1, d, false));
            if (a2 > 0 && a2 < 1) ppl.push(...People.passer(1790 - a2 * 2000, 978, 255, -1, d, true, '#4a4640'));
            if (s > T.girlOut) {
                // she comes out of the house, calls, waits; at the end she walks up to him
                const out = E.inOut(E.seg(s, T.girlOut, T.girlCall)), near = E.inOut(E.seg(s, T.near0, T.near1));
                const x = 1300 + 14 * out - 190 * near, y = 606 + 40 * out + 206 * near, hh = 148 * (1 + (y - 604) / 330);
                const wave = E.seg(s, T.girlCall - 0.3, T.girlCall + 0.4) * (1 - 0.75 * E.seg(s, T.near1, T.near1 + 1.5));
                ppl.push(...People.girl(x, y, hh, wave, d, E.seg(s, T.girlOut, T.girlOut + 0.45), (out > 0 && out < 1) || (near > 0 && near < 1)));
            }
            if (ppl.length) sf.stamp(Oil.marks(ppl, Plaza.NOW, 2, 'people'), null);
            sf.stamp(fine, Oil.focus(fine, d, gaze, { wide: 1.2 }));
            const live = Oil.marks(PlazaDetail.live(d), Oil.FINE, 4, 'live');
            sf.stamp(live, Oil.focus(live, d, gaze, { wide: 1.2 }));
        });
        // the head follows the eyes, late and not all the way; he leans in when it is her
        const hd = look(t - 0.3), z = 1 + 0.1 * E.inOut(E.seg(t, T.her + 1, T.her + 8)) * (1 - E.inOut(E.seg(t, T.hurry - 2.4, T.hurry + 0.4)));
        g.save();
        g.translate(800, 450);
        g.scale(z, z);
        g.translate(-800 - (hd[0] - 800) * 0.3 + Math.sin(t * 0.9) * 3, -450 - (hd[1] - 450) * 0.08 + Math.sin(t * 1.3 + 1) * 2);
        pic.draw(g);
        g.restore();
    },
});
