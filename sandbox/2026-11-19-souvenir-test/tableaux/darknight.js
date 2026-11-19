// Picture 5 · «En una noche oscura». The darkest picture of the film, lit only by painted
// flames: every sheet is painted as albedo, normals and material and then lit per pixel by
// the flames of the picture as point lights in depth (things/darknight.js), so what is near a
// flame glows warm and the rest is drawing in dark colours.
//
// The order is the night of St John of the Cross, read as an ascent up a secret ladder:
//   1 · Tinieblas (the small hours of Holy Wednesday): the Lenten veil rent from the top to
//       the bottom, the candles of the office put out one by one, their smoke still rising,
//       and ONE left burning («sin otra luz y guía / sino la que en el corazón ardía»): it is
//       the first thing seen through the hole of the picture before.
//   2 · «Por la secreta escala disfrazada»: the cell's wall and its window with the bars
//       sawn through, the rope of knotted strips of blanket he let himself down by (Toledo,
//       1578), the lantern put out, the wooden ladder that goes in with the camera.
//   3 · La madrugada: the candles of a paso's candelería in a ring of light, lilies in silver
//       jars («entre las azucenas olvidado»), the silver lantern on its pole, a thurible's
//       smoke as veils, moths at the flames.
//   4 · «Llama de amor viva»: Ibn Arabi's circles and interlaced rings in gold leaf and silver
//       round the way through, the mount drawn with its narrow path straight up the middle
//       (without its words), the dove with the olive sprig («la blanca palomica»), a vihuela
//       with no one to play it (the silent music), a gibbous moon behind the smoke.
//   plate · the innermost circles, which are light: the way out, into gold.
// The ladder lies along the floor of the passage below the axis from stratum 1 to 4, so
// that its stretches on every sheet join into one ladder going in; the rings (of candles,
// of smoke, of the circles) grow smaller in the dark behind each other.
//
//   Tableau.darknight(z0) → layers; .depth (z0 to the plate); .hole (the plate's hole)
window.Tableau = window.Tableau || {};
Tableau.darknight = (z0) => {
    const S = Souvenir, N = Night;
    // the depths of the sheets, from z0
    const Z = {
        veil: 130, tenebrae: 0, snuffer: -140,
        cell: 620, escala: 500,
        candleria: 1120, lilies: 990, thurible: 860,
        circles: 1560, dove: 1440,
        plate: Tableau.darknight.depth,
    };
    const box = { x: -1200, y: -720, w: 2400, h: 1440 };
    const plateBox = { x: -1600, y: -900, w: 3200, h: 1800 };
    // the ladder: rails on the rays through (±LX, LY)
    const LX = 118, LY = 232;

    // ------------------------------------------------------------------ the layouts
    // candles in two banks on stepped stands either side of the way through: inner ones
    // lower, outer ones higher
    function banks(name, o) {
        const r = Motion.rng(name);
        const list = [];
        for (const side of [-1, 1]) {
            for (let i = 0; i < o.n; i++) {
                const x = side * (o.x0 + (side > 0 ? o.skew : 0)) + side * (i * (o.dx + i * o.ddx)) + (r() - 0.5) * 10;
                const top = o.top - i * o.rise - (side > 0 ? o.skew : 0) + (r() - 0.5) * 16;
                const lip = o.lip - i * o.lift + (r() - 0.5) * 8;
                list.push({ side, i, x, top, lip, len: lip - top, r: o.r + i * 0.6 + r() * 1.2, lit: o.lit(side, i), seed: name + side + i, ember: o.ember ? o.ember(side, i) : false });
            }
        }
        for (const c of list) {
            c.fx = c.x - 1.6;
            c.fy = c.top - 8;
        }
        return { list, lit: list.filter((c) => c.lit) };
    }
    const T1 = banks('tenebrae', { n: 8, x0: 222, skew: 18, dx: 98, ddx: 6, top: -18, rise: 64, lip: 212, lift: 34, r: 11.5, lit: (side, i) => side < 0 && i === 0, ember: (side, i) => side > 0 && i === 2 });
    // the back rows stand higher, between the candles of the front rows
    const T1b = banks('tenebrae-back', { n: 8, x0: 270, skew: 18, dx: 100, ddx: 6, top: -110, rise: 62, lip: 120, lift: 32, r: 10.5, lit: () => false });
    const T3b = banks('candleria-back', { n: 8, x0: 300, skew: 8, dx: 94, ddx: 5, top: -205, rise: 44, lip: 112, lift: 18, r: 9.5, lit: () => true });
    const T3 = banks('candleria', { n: 8, x0: 262, skew: 8, dx: 92, ddx: 5, top: -128, rise: 46, lip: 196, lift: 20, r: 10.5, lit: () => true });
    const FAROL = { x: -560, y: -250, s: 1.35 };
    const THUR = { x: 452, y: -372, s: 1.15 };
    const PLATE_LAMPS = 12;

    // ------------------------------------------------------------------ the flames
    // Every flame of the picture, on the sheet it stands on. A sheet is lit by the flames
    // near it in depth: the `z` of a light is how far in front of the lit sheet it is.
    const W = (sheet, x, y, p = 3, r = 55, c) => ({ x, y, zs: Z[sheet], p, r, c });
    const FLAMES = [
        ...T1.lit.map((c) => W('tenebrae', c.fx, c.fy - 30, 4, 64)),
        ...T3.lit.map((c) => W('candleria', c.fx, c.fy - 24, 1.7, 50)),
        ...T3b.lit.map((c) => W('candleria', c.fx, c.fy - 22, 1.3, 46)),
        W('lilies', FAROL.x, FAROL.y - 8, 2.6, 60),
        W('thurible', THUR.x, THUR.y + 64 * THUR.s, 0.5, 30, [1, 0.35, 0.12]),
    ];
    const lightsFor = (sheet, o = {}) => FLAMES.map((f) => ({ ...f, z: Z[sheet] - f.zs + (f.zs === Z[sheet] ? 14 : 0), p: f.p * (o.pk ?? 1) })).filter((l) => l.z < (o.front ?? 800) && l.z > -(o.behind ?? 300));

    const sheet = (id, z, b, paint, extra = {}) => ({ id: 'darknight-' + id, z: z0 + z, box: b, brush: { amp: 0.045 }, paint, ...extra });
    const candleBank = (P, T, o = {}) => {
        const st = T.list.slice().sort((a, b) => a.lip - b.lip).map((c) => ({ x0: c.x - c.side * 66, x1: c.side * 1300, y: c.lip + 134, wax: 1 + (c.i % 3) }));
        N.steps(P, st, { seed: o.seed ?? 'gradas', wood: o.wood, waxCol: o.wax });
        const embers = [];
        for (const c of T.list.slice().sort((a, b) => b.i - a.i)) {
            N.candlestick(P, { x: c.x, y: c.lip, rc: c.r, h: 134, seed: 'cs' + c.seed, wax: o.wax });
            const w = N.candle(P, { x: c.x, y: c.lip + 2, len: c.len, r: c.r, seed: c.seed, lit: c.lit, smokeH: 300 + c.i * 30, alpha: 0.6, wax: o.wax });
            if (c.ember) embers.push(w);
        }
        return embers;
    };

    return [
        // ---------------------------------------------------------------- 1 · Tinieblas
        sheet('veil', Z.veil, box, (g) => {
            const P = N.begin(g);
            N.veil(P, { box, seed: 'velo', tear: { x: 4, cy: 10, sy: 440, hw: 262 }, band: -372 });
            P.light(lightsFor('veil'), { amb: [0.24, 0.2, 0.36] });
            S.tooth(g, box, { amp: 0.04 });
        }),
        sheet('tenebrae', Z.tenebrae, box, (g) => {
            const P = N.begin(g);
            N.ladder(P, { X: LX, Y: LY, w: 22, from: 0.84, to: 2.1, rungs: [LY, LY * 1.32, LY * 1.78], seed: 'l1' });
            candleBank(P, T1b, { wax: [0.6, 0.46, 0.26], seed: 'gradas-back' });
            const embers = candleBank(P, T1, { wax: [0.66, 0.5, 0.28] });
            N.moth(P, { x: -170, y: -120, s: 1, rot: -0.7, open: 0.9, seed: 'm1' });
            P.light(lightsFor('tenebrae'), { amb: [0.16, 0.14, 0.27] });
            for (const c of T1.lit) N.flame(g, c.fx, c.fy, { seed: 'tn-flame', h: 62, w: 15, R: 150, glow: 1 });
            for (const w of embers) N.ember(g, w.x, w.y);
            S.tooth(g, box, { amp: 0.04 });
        }),
        sheet('snuffer', Z.snuffer, box, (g) => {
            const P = N.begin(g);
            // a tall candle put out, cut by the frame, its smoke across the top
            N.candlestick(P, { x: -760, y: 330, rc: 15, h: 160, seed: 'near-cs' });
            N.candle(P, { x: -760, y: 332, len: 600, r: 15, seed: 'near-c', smokeH: 520, drift: 0.5, alpha: 0.7, wax: [0.66, 0.5, 0.28] });
            // the snuffer: a brass cone on a long cane, leaning
            const cane = [[1180, 760], [860, 220], [560, -300]];
            N.tube(P, [[566, -290], [548, -330], [520, -352]], (u) => 9 + u * 16, (u, a, along, q) => {
                q.r = 0.7;
                q.g = 0.5;
                q.b = 0.22;
                q.sp = 0.9;
                q.sh = 0.7;
                q.h = 0.4 * Math.sin(along * 1.3);
            });
            N.book(P, { x: 600, y: 540, w: 640, h: 400, seed: 'lamentaciones' });
            N.tube(P, cane, 11, (u, a, along, q) => {
                const gr = Math.sin(a * 6 + along * 0.02 + Math.sin(along * 0.011) * 3);
                q.r = 0.4 + 0.04 * gr;
                q.g = 0.27 + 0.03 * gr;
                q.b = 0.15;
                q.h = 0.3 * gr;
                q.sp = 0.25;
            });
            N.moth(P, { x: 760, y: 60, s: 1.4, rot: 0.6, open: 0.25, seed: 'm-near' });
            N.moth(P, { x: 420, y: 470, s: 1.5, rot: 2.2, open: 0.3, seed: 'm-book', pale: true });
            P.light(lightsFor('snuffer', { behind: 300 }), { amb: [0.19, 0.16, 0.3] });
            S.tooth(g, box, { amp: 0.04 });
        }),
        // ---------------------------------------------------------------- 2 · the secret ladder
        sheet('cell', Z.cell, box, (g) => {
            const P = N.begin(g);
            N.wall(P, { box, seed: 'celda', win: { w: 205, sill: 168, spring: -30, reveal: 30 }, tally: [-420, -150] });
            N.bar(P, [[-110, 172], [-150, 150], [-228, 130], [-268, 126]], 9, 'barra');
            N.rope(P, [[-262, 128], [-268, 260], [-252, 420], [-276, 600], [-262, 790]], { w: 11, seed: 'soga' });
            N.sill(P, { x: -150, y: 168, seed: 'racion' });
            P.light([{ x: 0, y: -10, z: -80, p: 2.4, r: 170, c: [1, 0.66, 0.34] }, ...lightsFor('cell')], { amb: [0.17, 0.15, 0.26] });
            S.tooth(g, box, { amp: 0.045 });
        }),
        sheet('escala', Z.escala, box, (g) => {
            const P = N.begin(g);
            N.ladder(P, { X: LX, Y: LY, w: 22, from: 0.84, to: 2.1, rungs: [LY, LY * 1.3, LY * 1.72], seed: 'l2' });
            const L = N.lantern(P, { x: 352, y: -360, s: 1.15, seed: 'farol-apagado' });
            N.tube(P, [[352, -720], [352, -360]], 3, (u, a, along, q) => {
                q.r = 0.2;
                q.g = 0.19;
                q.b = 0.2;
                q.sp = 0.4;
                q.h = Math.sin(along * 0.7) * 0.8;
            });
            N.smoke(P, L.vent[0], L.vent[1] - 4, { seed: 'apagado', h: 340, alpha: 0.55, drift: -0.15 });
            // the bars he sawed through, thrown down by the ladder
            N.bar(P, [[-560, 430], [-420, 455], [-300, 470]], 10, 'barra-1');
            N.bar(P, [[330, 520], [450, 500], [560, 470]], 10, 'barra-2');
            N.haze(P, { y: -40, band: 200, seed: 'humo-celda', alpha: 0.34, n: 46 });
            N.moth(P, { x: -150, y: -210, s: 1.1, rot: 1.2, open: 0.7, seed: 'm2' });
            N.moth(P, { x: 170, y: -150, s: 0.9, rot: -2.2, open: 1, seed: 'm3', pale: true });
            P.light([{ x: 0, y: -10, z: -200, p: 2.4, r: 200, c: [1, 0.66, 0.34], air: 0.15 }, ...lightsFor('escala')], { amb: [0.15, 0.13, 0.24] });
            S.tooth(g, box, { amp: 0.045 });
        }),
        // ---------------------------------------------------------------- 3 · the small hours
        sheet('candleria', Z.candleria, box, (g) => {
            const P = N.begin(g);
            N.velvet(P, { box, seed: 'palio', open: { x0: -236, x1: 236, y0: -186, y1: 210, r: 60 }, valance: -186 });
            candleBank(P, T3b, { seed: 'peana-back', wood: [0.22, 0.15, 0.1] });
            candleBank(P, T3, { seed: 'peana', wood: [0.24, 0.16, 0.1] });
            P.light(lightsFor('candleria'), { amb: [0.14, 0.12, 0.24] });
            for (const c of [...T3b.lit, ...T3.lit]) N.flame(g, c.fx, c.fy, { seed: c.seed, h: 44, w: 12, R: 70, glow: 0.55 });
            S.tooth(g, box, { amp: 0.04 });
        }),
        sheet('lilies', Z.lilies, box, (g) => {
            const P = N.begin(g);
            // the beds of white carnations at the paso's foot, either side of the ladder
            N.carnations(P, { box: { x: -1000, y: 190, w: 2000, h: 420 }, seed: 'monte', n: 9000, max: 900, r: 17, inside: (x, y) => Math.abs(x) > (LX * y) / LY + 34 && y > 205 + 40 * Math.cos(x * 0.004) && Math.abs(x) < 980 });
            N.ladder(P, { X: LX, Y: LY, w: 22, from: 0.84, to: 2.1, rungs: [LY, LY * 1.35, LY * 1.8], seed: 'l3' });
            const F = N.farol(P, { x: FAROL.x, y: FAROL.y, s: FAROL.s, seed: 'cruz-de-guia', pole: 900 });
            for (const [side, jx] of [[-1, -318], [1, 320]]) {
                N.jar(P, { x: jx, y: 96, h: 140, seed: 'jarra' + side });
                const stems = side < 0 ? [[-300, 100, -322, -70, -296, -210], [-330, 100, -430, -10, -486, -140], [-312, 100, -380, 40, -420, -4]] : [[300, 100, 322, -60, 296, -214], [330, 100, 430, 0, 490, -120], [314, 100, 380, 50, 422, 6]];
                stems.forEach(([x0, y0, x1, y1, x2, y2], k) => {
                    N.lily(P, { pts: [[x0, y0], [x1, y1], [x2, y2]], seed: 'az' + side + k, flowers: [{ u: 0.995, a: side < 0 ? -2.2 + k * 0.5 : -0.9 - k * 0.5, s: 1.25, open: k === 2 ? 0.2 : 1 }, { u: 0.86, a: side < 0 ? -2.8 : -0.3, s: 1, open: 0.1 }] });
                });
            }
            N.moth(P, { x: -390, y: -330, s: 1, rot: 0.4, open: 1, seed: 'm4' });
            N.moth(P, { x: 300, y: -290, s: 0.9, rot: -0.9, open: 0.6, seed: 'm5', pale: true });
            N.moth(P, { x: -560, y: -170, s: 0.8, rot: 2.6, open: 1, seed: 'm6' });
            P.light(lightsFor('lilies'), { amb: [0.14, 0.12, 0.24] });
            N.flame(g, F.fx, F.fy, { seed: 'farol', h: 30, w: 9, R: 60, glow: 0.7 });
            S.tooth(g, box, { amp: 0.04 });
        }),
        sheet('thurible', Z.thurible, box, (g) => {
            const P = N.begin(g);
            N.thurible(P, { x: THUR.x, y: THUR.y, s: THUR.s, seed: 'incensario', drift: -1.1, smokeH: 760 });
            N.haze(P, { y: 10, band: 240, seed: 'humo-palio', alpha: 0.36, n: 50 });
            N.moth(P, { x: -640, y: -260, s: 1.3, rot: 0.9, open: 0.8, seed: 'm7' });
            P.light(lightsFor('thurible', { behind: 300 }), { amb: [0.13, 0.11, 0.22] });
            N.halo(g, THUR.x, THUR.y + 64 * THUR.s, 40, 0.5);
            S.tooth(g, box, { amp: 0.04 });
        }),
        // ---------------------------------------------------------------- 4 · the living flame
        sheet('circles', Z.circles, box, (g) => {
            const P = N.begin(g);
            N.circles(P, { box, seed: 'ibn-arabi', R0: 205 });
            N.moon(P, { x: 640, y: -350, R: 74, seed: 'luna', phase: 0.8 });
            N.smoke(P, 520, -150, { seed: 'velo-luna', h: 460, n: 16, wide: 4, still: 4, drift: 0.4, alpha: 0.6, freq: 0.007, amp: 1.5, turb: 1.2 });
            P.light([{ x: 0, y: 0, z: -120, p: 1.6, r: 220, c: [1, 0.78, 0.44] }, ...lightsFor('circles', { front: 800 })], { amb: [0.15, 0.13, 0.26] });
            S.tooth(g, box, { amp: 0.04 });
        }),
        sheet('dove', Z.dove, box, (g) => {
            const P = N.begin(g);
            N.dove(P, { x: -500, y: -250, s: 1.5, seed: 'paloma' });
            N.vihuela(P, { x: 500, y: 250, s: 1.25, rot: 0.6, seed: 'vihuela' });
            N.haze(P, { y: -60, band: 160, seed: 'humo-alto', alpha: 0.22, n: 30 });
            P.light([{ x: 0, y: 0, z: -240, p: 1.4, r: 260, c: [1, 0.78, 0.44], air: 0.2 }, ...lightsFor('dove', { front: 800 })], { amb: [0.15, 0.13, 0.26] });
            S.tooth(g, box, { amp: 0.04 });
        }),
        // ---------------------------------------------------------------- the innermost circles
        sheet('plate', Z.plate, plateBox, (g) => {
            const P = N.begin(g);
            const lamps = N.inmost(P, { box: plateBox, seed: 'inmost', hole: Tableau.darknight.hole, lamps: PLATE_LAMPS });
            P.light([{ x: 0, y: 0, z: 90, p: 1.5, r: 160, c: [1, 0.8, 0.5] }, ...lamps.map(([x, y]) => ({ x, y: y - 14, z: 12, p: 1.2, r: 40 }))], { amb: [0.14, 0.12, 0.24] });
            // the light that is the way out: a glow that grows towards the hole
            g.save();
            g.globalCompositeOperation = 'screen';
            const gr = g.createRadialGradient(0, 0, Tableau.darknight.hole * 0.9, 0, 0, 520);
            gr.addColorStop(0, 'rgba(255,214,130,0.16)');
            gr.addColorStop(0.25, 'rgba(240,170,80,0.05)');
            gr.addColorStop(1, 'rgba(200,120,60,0)');
            g.fillStyle = gr;
            g.fillRect(-520, -520, 1040, 1040);
            g.restore();
            lamps.forEach(([x, y], i) => N.flame(g, x, y, { seed: 'lampara' + i, h: 26, w: 8, R: 40, glow: 0.7 }));
            S.tooth(g, plateBox, { amp: 0.04 });
            g.globalCompositeOperation = 'destination-out';
            g.fillStyle = '#000';
            g.beginPath();
            g.arc(0, 0, Tableau.darknight.hole, 0, Math.PI * 2);
            g.fill();
            g.globalCompositeOperation = 'source-over';
        }, { res: 0.55, hole: Tableau.darknight.hole }),
    ];
};
Tableau.darknight.depth = 1850;
Tableau.darknight.hole = 130;
