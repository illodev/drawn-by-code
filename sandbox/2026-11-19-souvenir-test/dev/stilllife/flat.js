// Flat sheet for picture 4 (`stilllife`): its things and its layers painted at scale 1, no
// lens, no rig, so the paint is judged as paint. One page every 1/8 s:
//   pages 0…  the things on a ledge on the dark, at film size and at 2× (see PAGES)
//   then      every layer of Tableau.stilllife, its central 1600 × 900 at scale 1
const DIR = 'sandbox/2026-11-19-souvenir-test/';
const THINGS = (W) => {
    const St = Still;
    // a little wall-and-ledge set for things, centred on (0, 0)
    const set = (q, o = {}) => {
        St.wall(q, { x: -820, y: -470, w: 1640, h: 940 }, { seed: 'flat', lamp: (x, y) => 0.18 * S0.smooth(900, 0, Math.hypot(x + 300, y + 300)), open: null });
        return St.ledge(q, { x0: -820, x1: 820, y: o.y ?? 250, face: 80, d: 420, seed: 'flat', chips: 8, joint: 120, mark: [-560, 300], ring: [-430, 180] });
    };
    const S0 = Souvenir;
    const row = (q) => {
        const L = set(q);
        const Y = 222;
        const jug = St.jugSprite(Y, St.resOf(q), 'a'), buc = St.bucaroSprite('a', Y, St.resOf(q), 'a'), buc2 = St.bucaroSprite('b', Y, St.resOf(q), 'b');
        for (const [sp, x] of [[jug, -430], [buc, 120], [buc2, 280]]) St.castOn(q, sp, x, Y, 1, { clip: L.top });
        St.glassShadow(q, -60, Y, 1, { clip: L.top });
        for (const [x, rx] of [[-430, 100], [120, 36], [280, 32], [-60, 64], [560, 120]]) St.contact(q, x, Y, rx, rx * 0.22);
        St.plate(q, { x: 560, y: Y - 10, r: 120 });
        St.put(q, jug, -430, Y);
        St.glass(q, { x: -60, y: Y });
        St.put(q, buc, 120, Y);
        St.put(q, buc2, 280, Y);
    };
    const kitchen = (q) => {
        const L = set(q), Y = 222;
        const mo = St.mortarSprite(Y, St.resOf(q), 'a'), ga = St.garlicSprite(St.resOf(q), 'a'), on = St.onionSprite(St.resOf(q), 'a');
        St.castOn(q, mo, -480, Y, 1, { clip: L.top });
        St.castOn(q, ga, -250, Y, 1, { clip: L.top });
        St.castOn(q, on, 330, Y - 50, 1, { clip: L.top, ky: 0.1 });
        for (const [x, rx] of [[-480, 84], [-250, 40], [330, 46], [440, 46]]) St.contact(q, x, Y, rx, rx * 0.22);
        St.put(q, mo, -480, Y);
        St.pestle(q, [-470, Y - 150], [-405, Y - 250]);
        St.put(q, ga, -250, Y);
        St.put(q, St.cloveSprite(St.resOf(q), 'c', 0.3), -170, Y - 6, 1, { rot: 0.3 });
        St.put(q, on, 330, Y - 50);
        St.onionHalf(q, { x: 450, y: Y - 40 });
        St.knife(q, [-40, Y - 40], [130, Y + 50], { w: 0.8 });
        St.linen(q, { x0: 560, x1: 800, y: 250, drop: 150, topY: 190 });
        St.eggDish(q, { x: 680, y: Y - 2 });
    };
    const larder = (q) => {
        const L = set(q), Y = 222;
        const mb = St.melonBody(St.resOf(q), 'a');
        St.castOn(q, mb, 420, Y, 1, { clip: L.top });
        St.contact(q, 420, Y, 140, 20);
        St.put(q, mb, 420, Y);
        St.melonCut(q, 470, Y - 150, 50, 40, St.resOf(q), 'a');
        const sl = St.melonSlice(St.resOf(q), 'a');
        St.contact(q, 300, Y + 10, 70, 10);
        St.put(q, sl, 300, Y - 50);
        St.cardoon(q, [560, Y - 10], [820, Y - 60], { seed: 'a' });
        St.plate(q, { x: -520, y: Y - 20, r: 130, flat: true, ey: Y });
        St.cup(q, { x: -470, y: Y - 26, ey: Y });
        St.rose(q, { x: -580, y: Y - 26, s: 0.9 });
        const cs = St.candlestick(q, { x: -120, y: Y });
        St.smoke(q, cs.wick, { h: 380 });
        St.motto(q, [[-200, Y - 4], [-120, Y - 2], [-40, Y + 6], [-10, Y + 30], [-6, Y + 60]], { w: 18 });
        St.hangString(q, [-300, -480], [-300, -330]);
        St.quince(q, { x: -300, y: -330 });
        St.hangString(q, [130, -480], [130, -340], { seed: 'c' });
        St.cabbage(q, { x: 130, y: -340 });
        St.fly(q, { x: -270, y: -230, rot: 0.6, s: 1.2 });
    };
    // the three things of the last stratum, alone, at 2×
    const dark = (q) => St.wall(q, { x: -420, y: -240, w: 840, h: 480 }, { seed: 'flat2', lamp: () => 0.12, open: null });
    const focus = [
        (q) => {
            q.scale(2, 2);
            dark(q);
            St.hangString(q, [0, -260], [0, -150], { seed: 'c' });
            St.cabbage(q, { x: 0, y: -150, s: 1, seed: 'win' });
        },
        (q) => {
            q.scale(2, 2);
            dark(q);
            const L = St.ledge(q, { x0: -420, x1: 420, y: 170, face: 60, d: 300, seed: 'fq' });
            St.hangString(q, [-140, -260], [-140, -150], { seed: 'q' });
            St.quince(q, { x: -140, y: -150, s: 1.15, seed: 'win' });
            St.fly(q, { x: -118, y: -60, rot: 0.7, s: 1.25 });
            const sp = St.quinceSprite(St.resOf(q), 'h1', 1.45);
            Souvenir.put(q, sp, { x: 190 + 70 * Math.sin(1.45), y: 130 - 58 - 70 * Math.cos(1.45), rot: 1.45 });
        },
        (q) => {
            q.scale(2, 2);
            dark(q);
            St.ledge(q, { x0: -420, x1: 420, y: 150, face: 60, d: 300, seed: 'fc' });
            St.cardoon(q, [340, 130], [-60, 92], { seed: 'win' });
        },
    ];
    return [
        ...focus,
        (q) => larder(q),
        (q) => {
            q.scale(2, 2);
            q.translate(400, -40);
            larder(q);
        },
        (q) => {
            q.scale(2, 2);
            q.translate(-300, -80);
            larder(q);
        },
        (q) => {
            q.scale(2, 2);
            q.translate(220, 320);
            larder(q);
        },
        (q) => row(q),
        (q) => {
            q.scale(2, 2);
            q.translate(330, 20);
            row(q);
        },
        (q) => {
            q.scale(2, 2);
            q.translate(-20, -80);
            row(q);
        },
        (q) => {
            q.scale(2, 2);
            q.translate(-300, -120);
            row(q);
        },
        (q) => kitchen(q),
        (q) => {
            q.scale(2, 2);
            q.translate(330, -80);
            kitchen(q);
        },
        (q) => {
            q.scale(2, 2);
            q.translate(-80, -120);
            kitchen(q);
        },
        (q) => {
            q.scale(2, 2);
            q.translate(-500, -140);
            kitchen(q);
        },
    ];
};
const ALL = (env) => {
    const pages = THINGS();
    const layers = typeof Tableau !== 'undefined' && Tableau.stilllife ? [...(Tableau.stilllife.stratum ? Tableau.stilllife.stratum(0) : []), ...Tableau.stilllife(0)] : [];
    for (const ly of layers) {
        pages.push((q) => {
            // the layer painted as the rig paints it, then shown at scale 1 about the axis
            const res = env.k * 1.12 * (ly.res ?? 1);
            const c = document.createElement('canvas');
            c.width = Math.ceil(ly.box.w * res);
            c.height = Math.ceil(ly.box.h * res);
            const lg = c.getContext('2d');
            lg.setTransform(res, 0, 0, res, -ly.box.x * res, -ly.box.y * res);
            const t0 = performance.now();
            ly.paint(lg, res);
            const ms = performance.now() - t0;
            q.drawImage(c, ly.box.x, ly.box.y, ly.box.w, ly.box.h);
            q.fillStyle = 'rgba(255,255,255,0.8)';
            q.font = '22px monospace';
            q.fillText(ly.id + '  z ' + ly.z + '  paint ' + (ms / 1000).toFixed(1) + ' s', -780, -420);
        });
    }
    return pages;
};
Motion.scene({
    fps: 8,
    duration: 3,
    logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DIR + 'things/stilllife.js', { src: DIR + 'tableaux/stilllife.js', optional: true }],
    fonts: [{ family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }],
    setup(env) {
        return { pages: null, done: new Map() };
    },
    draw(g, t, env) {
        const st = env.state;
        if (!st.pages) st.pages = ALL(env);
        const i = Math.min(st.pages.length - 1, Math.round(t * 8));
        if (!st.done.has(i)) {
            const c = document.createElement('canvas');
            c.width = env.px[0];
            c.height = env.px[1];
            const q = c.getContext('2d');
            q.setTransform(env.k, 0, 0, env.k, 0, 0);
            q.fillStyle = '#060504';
            q.fillRect(0, 0, 1600, 900);
            q.translate(800, 450);
            st.pages[i](q);
            st.done.set(i, c);
        }
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.drawImage(st.done.get(i), 0, 0);
        g.restore();
    },
});
