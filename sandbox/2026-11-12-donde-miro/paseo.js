// 2026-11-12-donde-miro · «Paseo» · style oil · a 14 s test of the film's new rule
// Nobody explains anything. He walks along the square. The picture is the past wherever
// he looks, and it moves; the sound is the present. A car goes by and it is a donkey with
// a cart; the bank's cash machine beeps and Anselmo waves from his shop; a child runs up
// and, in the doorway, his wife lowers her hand and waves.
Motion.scene({
    fps: 24,
    duration: 14,
    logical: [1600, 900],
    uses: ['styles/oil/oil.js', 'sandbox/2026-11-12-donde-miro/plaza.js', 'sandbox/2026-11-12-donde-miro/detail.js', 'sandbox/2026-11-12-donde-miro/people.js', 'sandbox/2026-11-12-donde-miro/actors.js'],
    fonts: [{ family: 'Fell', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }],
    audio: { mix: 'paseo.wav' },
    shots: [[0, 14, 'The walk']],
    setup(env) {
        const box = Plaza.BOX;
        const now = Oil.study(box, { ground: '#a39a8b' }), then = Oil.study(box, { res: 1.25 });
        Plaza.paint(now, 'now');
        Plaza.paint(then, 'then', { her: false }); // she is laid apart: she moves
        const loose = Oil.lay(now, Plaza.NOW, { seed: 'now', ground: '#a39a8b', blur: 13, lines: false });
        const fine = Oil.lay(then, Oil.FINE, { seed: 'then' });
        const pic = Oil.painting(env, box, { ground: '#a8987f' });
        pic.base(loose);
        return { pic, fine };
    },
    draw(g, t, env) {
        const { pic, fine } = env.state, E = Ease, d = Math.floor(t * 12 + 1e-6);
        // the car of the present and the cart of 1974 are one thing in one place
        const carX = (s) => 1960 - 600 * (s - 0.5), CAR = [0.5, 4.4];
        // where his eye goes: it jumps (a fifth of a second) and then holds or follows
        const looks = [[0, () => [660, 500]], [1.0, (s) => [carX(s) + 170, 690]], [3.7, () => [1040, 470]], [8.0, () => [1292, 440]], [11.4, () => [1215, 130]]];
        const look = (s) => {
            let i = 0;
            while (i < looks.length - 1 && looks[i + 1][0] <= s) i++;
            const p = looks[i][1](s);
            if (!i) return p;
            const q = looks[i - 1][1](s), u = E.out(E.seg(s, looks[i][0], looks[i][0] + 0.2));
            return [q[0] + (p[0] - q[0]) * u, q[1] + (p[1] - q[1]) * u];
        };
        const gaze = (q) => {
            const s = q / 12, p = look(s);
            return { x: p[0] + Motion.noise1('gx', q * 0.45) * 7, y: p[1] + Motion.noise1('gy', q * 0.45) * 6, r: (205 + 10 * Math.sin(s * 1.9)) * E.out(E.seg(s, 0, 0.5)) + 0.5, ph: s * 0.9 };
        };
        pic.frame(d, (sf) => {
            const s = d / 12, ppl = [];
            // the present, out of focus, under whatever memory paints over it
            if (s > CAR[0] && s < CAR[1]) ppl.push(...People.car(carX(s) - 200, 806, 2.1)); // a bus: its nose and tail stick out of what he sees
            if (s > 7.5) {
                const run = E.inOut(E.seg(s, 7.5, 9.3)), y = 606 + 334 * run, hop = run >= 1 ? Math.abs(Math.sin(d * 1.15)) * 16 : 0;
                ppl.push(...People.girl(1300 - 400 * run, y - hop, 148 * (1 + (y - 604) / 330), E.seg(s, 8.9, 9.4), d, 1, run < 1));
            }
            if (ppl.length) sf.stamp(Oil.marks(ppl, Plaza.NOW, 2, 'people'), null);
            // the past where he looks, and the people in it, painted again for every drawing
            const F = { wide: 1.2 }, on = (S) => sf.stamp(S, Oil.focus(S, d, gaze, F));
            on(fine);
            const a = E.seg(s, 3.9, 4.3) * (1 - E.seg(s, 7.3, 7.9));
            on(Oil.sprite({ x: 990, y: 360, w: 160, h: 262 }, (st) => Actors.anselmo(st, 1066, 600, a, a > 0 ? d : 0), { seed: 'anselmo' }));
            const wv = E.inOut(E.seg(s, 8.7, 9.3));
            on(Oil.sprite({ x: 1222, y: 372, w: 170, h: 250 }, (st) => PlazaDetail.woman(st, 1292, 602, { wave: wv, sw: wv > 0 ? Math.sin(d * 1.4) : 0 }), { seed: 'her' }));
            if (s > CAR[0] && s < CAR[1]) on(Oil.sprite({ x: carX(s) - 110, y: 540, w: 560, h: 280 }, (st) => Actors.cart(st, carX(s) + 20, 792, 1.25, d), { seed: 'cart' }));
            on(Oil.marks(PlazaDetail.live(d), Oil.FINE, 4, 'live'));
        });
        // he is walking: the street slides by and his step bobs; he stops when the child arrives
        const hd = look(t - 0.12), walk = -150 + 300 * E.inOut(E.seg(t, 0, 9.2)), bob = Math.abs(Math.sin(Math.PI * 1.75 * t)) * 5 * (1 - E.seg(t, 8.8, 9.4));
        g.save();
        g.translate(-walk - (hd[0] - 800) * 0.1, bob - (hd[1] - 450) * 0.06);
        pic.draw(g);
        g.restore();
    },
});
