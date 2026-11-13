// 2026-11-12-donde-miro · «Donde miro» · style oil
// One shot through an old man's eyes, without a word. He has lost the centre of his
// sight: where he looks, his memory paints the square as it was in 1974, and it moves.
// The sound is the present. A leaf blower is a street sweeper, a bus is a donkey with a
// cart, a scooter is a boy with a hoop, a cash machine is the grocer waving. Then his
// granddaughter runs up: when he looks at her she is gone, so he looks beside her.
// (The 14 s test of this rule is paseo.js; the narrated first attempt is in git history.)
Motion.scene({
    fps: 24,
    duration: 32,
    logical: [1600, 900],
    uses: ['styles/oil/oil.js', 'sandbox/2026-11-12-donde-miro/plaza.js', 'sandbox/2026-11-12-donde-miro/detail.js', 'sandbox/2026-11-12-donde-miro/people.js', 'sandbox/2026-11-12-donde-miro/actors.js'],
    fonts: [{ family: 'Fell', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }],
    audio: { mix: 'mix.wav' },
    // one continuous shot; these are its beats, for the contact sheet's labels
    shots: [[0, 3.6, 'Leaf blower / sweeper'], [3.6, 7.6, 'Bus / donkey cart'], [7.6, 11, 'Scooter / hoop'], [11, 14.8, 'Cash machine / grocer'], [14.8, 19, 'The child / his wife'], [19, 24, 'He looks at her'], [24, 32, 'Beside her']],
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
        // things that cross: the bus/cart to the left, the scooter/boy to the right
        const BUS = [3.3, 7.4], busX = (s) => 1960 - 600 * (s - BUS[0]);
        const BOY = [7.3, 11], boyX = (s) => 60 + 430 * (s - BOY[0]);
        const GIRL = [960, 934]; // where the child ends up, at his knees
        // where his eye goes: [time, place, how long the move takes]. Each thing of the
        // present is heard and seen, grey, at the edge for a moment before his eye lands on it
        const looks = [
            [0, () => [170, 470], 0.2], [0.9, () => [540, 500], 0.2], [3.9, (s) => [busX(s) + 170, 690], 0.2], [7.0, () => [700, 600], 0.2], [7.7, (s) => [boyX(s) + 40, 660], 0.2],
            [10.8, () => [1040, 470], 0.2], [15.4, () => [1292, 440], 0.2],
            [19, () => [GIRL[0], 740], 0.2], [20.4, () => [1292, 440], 0.2], [21.6, () => [GIRL[0], 740], 0.2], [23.2, () => [1292, 440], 1.3],
        ];
        const look = (s) => {
            let i = 0;
            while (i < looks.length - 1 && looks[i + 1][0] <= s) i++;
            const p = looks[i][1](s);
            if (!i) return p;
            const q = looks[i - 1][1](s), u = E.out(E.seg(s, looks[i][0], looks[i][0] + looks[i][2]));
            return [q[0] + (p[0] - q[0]) * u, q[1] + (p[1] - q[1]) * u];
        };
        const gaze = (q) => {
            const s = q / 12, p = look(s);
            return { x: p[0] + Motion.noise1('gx', q * 0.45) * 7, y: p[1] + Motion.noise1('gy', q * 0.45) * 6, r: (205 + 10 * Math.sin(s * 1.9)) * E.out(E.seg(s, 0, 0.5)) + 0.5, ph: s * 0.9 };
        };
        // he stoops to her at the end: the picture comes closer, low and to her side
        const stoop = E.inOut(E.seg(t, 25, 29.5));
        pic.frame(d, (sf) => {
            const s = d / 12, ppl = [];
            // the present, out of focus, under whatever memory paints over it
            if (s < 4.4) ppl.push(...People.blower(560, 664, 218, d));
            if (s > BUS[0] && s < BUS[1]) ppl.push(...People.car(busX(s) - 200, 806, 2.1));
            if (s > BOY[0] && s < BOY[1]) ppl.push(...People.scooter(boyX(s) + 30, 742, 262));
            if (s > 14.8) {
                const run = E.inOut(E.seg(s, 14.8, 16.6)), y = 606 + (GIRL[1] - 606) * run, hop = run >= 1 ? Math.abs(Math.sin(d * 1.15)) * 16 * (1 - 0.7 * E.seg(s, 25, 27)) : 0;
                ppl.push(...People.girl(1300 + (GIRL[0] - 1300) * run, y - hop, 148 * (1 + (y - 604) / 330), E.seg(s, 16.2, 16.7), d, 1, run < 1));
            }
            if (ppl.length) sf.stamp(Oil.marks(ppl, Plaza.NOW, 2, 'people'), null);
            // the past where he looks, and its people, painted again for every drawing
            const F = { wide: 1.2 }, on = (S) => sf.stamp(S, Oil.focus(S, d, gaze, F));
            on(fine);
            if (s < 5.2) on(Oil.sprite({ x: 440, y: 420, w: 230, h: 262 }, (st) => Actors.sweeper(st, 580, 656, d), { seed: 'sweeper' }));
            const a = E.seg(s, 11.1, 11.5) * (1 - E.seg(s, 14.6, 15.2));
            if (s > 9.5) on(Oil.sprite({ x: 990, y: 360, w: 160, h: 262 }, (st) => Actors.anselmo(st, 1066, 600, a, a > 0 ? d : 0), { seed: 'anselmo' }));
            const wv = E.inOut(E.seg(s, 15.9, 16.5));
            if (s > 12) on(Oil.sprite({ x: 1222, y: 372, w: 170, h: 250 }, (st) => PlazaDetail.woman(st, 1292, 602, { wave: wv, sw: wv > 0 ? Math.sin(d * 1.4) : 0 }), { seed: 'her' }));
            if (s > BUS[0] && s < BUS[1]) on(Oil.sprite({ x: busX(s) - 110, y: 540, w: 560, h: 280 }, (st) => Actors.cart(st, busX(s) + 20, 792, 1.25, d), { seed: 'cart' }));
            if (s > BOY[0] && s < BOY[1]) on(Oil.sprite({ x: boyX(s) - 80, y: 500, w: 330, h: 260 }, (st) => Actors.boy(st, boyX(s), 742, 1.45, d), { seed: 'boy' }));
            on(Oil.marks(PlazaDetail.live(d), Oil.FINE, 4, 'live'));
        });
        // he walks: the street slides by and his step bobs; he stops when the child arrives
        const hd = look(t - 0.12), going = 1 - E.seg(t, 16, 17), walk = -170 + 330 * E.inOut(E.seg(t, 0, 17)), bob = Math.abs(Math.sin(Math.PI * 1.75 * t)) * 5 * going;
        const z = 1 + 0.22 * stoop;
        g.save();
        g.translate(800 - 150 * stoop, 450 + 150 * stoop);
        g.scale(z, z);
        g.translate(-800 + 150 * stoop - walk - (hd[0] - 800) * 0.1, -450 - 150 * stoop + bob - (hd[1] - 450) * 0.06);
        pic.draw(g);
        g.restore();
    },
});
