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
//
// What a second look finds (read at once / the deep one): the candles of Tenebrae are of
// unbleached wax, one still burning / it is the inner one on the left, the first light seen;
// an ember on one wick just put out; the instruments of the Passion embroidered on the veil,
// the ladder among them / the veil is rent «from the top to the bottom»; a choir book open at
// staves with no words, a moth on it; the cell's window with its bars sawn out / the tally of
// days scratched on a stone, the inkpot and quill (he composed in that cell), bread and a
// sardine's tail on the sill; the rope of knotted strips of blanket / the habit's brown among
// them; the lantern put out still smoking; the silver lantern on its pole; lilies with pollen
// fallen on a tepal; carnations, one gone brown; the thurible's coals through its lid; Ibn
// Arabi's spheres with their planets and the 28 mansions of the moon / the mount's narrow
// path continues the ladder up to the circles, the two wide paths end in a bar; the dove
// carries an olive sprig (Cántico); a vihuela hung by a faded ribbon (the silent music, and
// Narváez of Granada); the gibbous moon in silver leaf behind the smoke; twelve small lamps
// round the innermost circle.
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
    // the hanging lamps of the fourth stratum («¡Oh lámparas de fuego…!»)
    const LAMPS4 = [[-170, -330, 1.2, [0.85, 0.5, 0.18]], [300, -270, 1.1, [0.7, 0.2, 0.16]], [-640, -110, 1.3, [0.85, 0.5, 0.18]], [620, -250, 1.25, [0.3, 0.42, 0.7]]];

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
        ...LAMPS4.map(([x, y, s]) => W('dove', x, y - 8 * s - 20, 2.2, 55)),
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
            for (const c of T1.lit) N.flame(g, c.fx, c.fy, { seed: 'tn-flame', h: 66, w: 16, R: 230, glow: 1.25 });
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
            // thicker over the window: the light at the end stays veiled until the cell is passed
            N.haze(P, { x0: -460, x1: 460, y: -10, band: 160, seed: 'humo-ventana', alpha: 0.6, n: 34, tint: '#5f5a7c' });
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
            P.light([{ x: 640, y: -360, z: 70, p: 1.3, r: 80, c: [0.62, 0.66, 0.82], air: 0.25 }, { x: 0, y: 0, z: -120, p: 1.6, r: 220, c: [1, 0.78, 0.44] }, ...lightsFor('circles', { front: 800 })], { amb: [0.15, 0.13, 0.26] });
            S.tooth(g, box, { amp: 0.04 });
        }),
        sheet('dove', Z.dove, box, (g) => {
            const P = N.begin(g);
            const lit4 = LAMPS4.map(([x, y, s, glass], i) => N.lamp(P, { x, y, s, glass, seed: 'lampara-' + i }));
            N.dove(P, { x: -380, y: -230, s: 1.4, seed: 'paloma' });
            N.vihuela(P, { x: 420, y: 235, s: 1.2, rot: 0.6, seed: 'vihuela' });
            N.haze(P, { y: -60, band: 160, seed: 'humo-alto', alpha: 0.22, n: 30 });
            P.light([{ x: 0, y: 0, z: -240, p: 1.4, r: 260, c: [1, 0.78, 0.44], air: 0.2 }, ...lightsFor('dove', { front: 800 })], { amb: [0.15, 0.13, 0.26] });
            lit4.forEach((f, i) => N.flame(g, f.fx, f.fy, { seed: 'l4' + i, h: 30 * LAMPS4[i][2], w: 9 * LAMPS4[i][2], R: 70, glow: 0.7 }));
            S.tooth(g, box, { amp: 0.04 });
        }),
        // ---------------------------------------------------------------- the innermost circles
        sheet('plate', Z.plate, plateBox, (g) => {
            const P = N.begin(g);
            const lamps = N.inmost(P, { box: plateBox, seed: 'inmost', hole: Tableau.darknight.hole, lamps: PLATE_LAMPS });
            P.light([{ x: 0, y: 0, z: 90, p: 1.5, r: 160, c: [1, 0.8, 0.5] }, ...lamps.map(([x, y]) => ({ x, y: y - 12, z: 12, p: 0.7, r: 30 }))], { amb: [0.14, 0.12, 0.24] });
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
            lamps.forEach(([x, y], i) => N.flame(g, x, y, { seed: 'lampara' + i, h: 22, w: 7, R: 26, glow: 0.35 }));
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

// The second passage (round 7): the dark night condensed into ONE stratum of loose things,
// in the format of the first passage. No wall, window, plate or ring: the body is the
// violet Lenten veil and the night-blue velvet of a paso in great folds, smoke through them
// and banks of tall candles rising from below the frame, whose flames are the only light;
// on it, whole and large, the things of the night: the silver lantern on its pole, the
// thurible with its coals, the dove with its sprig, the choir book (middle); one disc of Ibn
// Arabi's spheres, lilies in a silver jar, the lantern put out, the gibbous moon behind the
// smoke (far, on the body); the secret ladder leaning across a corner and the vihuela hung
// by its ribbon, the largest, cut by the frame (near). Moths at the flames, one candle just
// put out and smoking, its ember.
//   Tableau.darknight.stratum(z) → [far (z + 150), middle (z), near (z − 160)]
Tableau.darknight.stratum = (z) => {
    const S = Souvenir, N = Night;
    const box = { x: -1200, y: -720, w: 2400, h: 1440 };
    const D = { far: 150, mid: 0, near: -160 };
    const r = Motion.rng('darknight-stratum');
    // ---------------------------------------------------------------- the candles
    // banks rising from below the frame: [x, top, radius, lit], on the far and near sheets
    const BANK = [];
    for (const side of [-1, 1]) {
        // in clusters, not a fence: a gap between them, unequal heights
        for (const [i, dx] of [[0, 500], [1, 575], [2, 760], [3, 830], [4, 1010]].map((v) => v)) {
            const x = side * (dx + (r() - 0.5) * 30), top = [-60, -200, -150, -330, -260][i] - (side > 0 ? 40 : 0) + (r() - 0.5) * 50;
            BANK.push({ x, top, rad: 15 + r() * 4, lit: !(side > 0 && i === 2), seed: 'sb' + side + i });
        }
    }
    // two short ones at the foot, on the heaped cloth, under the way through
    for (const [x, top] of [[-300, 330], [320, 318]]) BANK.push({ x, top, rad: 13, lit: true, seed: 'sf' + x });
    const NEAR = [{ x: -930, top: -250, rad: 22, lit: true, seed: 'nc1' }, { x: 990, top: -430, rad: 24, lit: true, seed: 'nc2' }];
    const FAROL = { x: -600, y: -70, s: 1.55 };
    const THUR = { x: 585, y: -470, s: 1.6 };
    const flameOf = (c) => ({ x: c.x - 1.6, y: c.top - 8 });
    // every flame, by sheet: [x, y, sheet, power, reach]
    const FL = [
        ...BANK.filter((c) => c.lit).map((c) => [flameOf(c).x, flameOf(c).y - 24, 'far', 1.8, 52]),
        ...NEAR.map((c) => [flameOf(c).x, flameOf(c).y - 34, 'near', 2.6, 80]),
        [FAROL.x, FAROL.y - 10, 'mid', 2.8, 70],
        [THUR.x, THUR.y + 64 * THUR.s, 'mid', 0.7, 34, [1, 0.35, 0.12]],
    ];
    const lightsFor = (sheet) => FL.map(([x, y, sh, p, rr, c]) => ({ x, y, z: D[sheet] - D[sh] + (sh === sheet ? 14 : 0), p, r: rr, c }));
    const candleAt = (P, c, o = {}) => {
        // its socket hidden below the frame: only the shaft rises into view
        return N.candle(P, { x: c.x, y: 760, len: 760 - c.top, r: c.rad, seed: c.seed, lit: c.lit, smokeH: 360, alpha: 0.6, wax: o.wax, runs: 3 + (c.seed.length % 3) });
    };
    const sheet = (id, dz, paint) => ({ id: 'darknight-s-' + id, z: z + dz, box, brush: { amp: 0.045 }, paint });

    return [
        sheet('far', D.far, (g) => {
            const P = N.begin(g);
            const rr = Motion.rng('drapes');
            const wob = (a, b, n, amp, seed) => {
                // a wavering edge from a to b
                const pts = [];
                for (let i = 0; i <= n; i++) {
                    const t = i / n, nx = -(b[1] - a[1]), ny = b[0] - a[0], l = Math.hypot(nx, ny) || 1;
                    const w = amp * (S.noise2(t * 3, S.seedOf(seed) % 97, 7) - 0.5) * 2 * Math.sin(Math.PI * t);
                    pts.push([lerpX(a[0], b[0], t) + (nx / l) * w, lerpX(a[1], b[1], t) + (ny / l) * w]);
                }
                return pts;
            };
            function lerpX(a, b, t) { return a + (b - a) * t; }
            // a swag: hung from above, its lower edge a curve that sags lowest at its middle
            const swag = (x0, x1, yl, kind, seed, o = {}) => {
                const pts = [[x0 - 40, -800], [x1 + 40, -800]];
                for (let i = 0; i <= 16; i++) {
                    const t = 1 - i / 16, x = x0 + (x1 - x0) * t;
                    pts.push([x, yl - 90 * (1 - Math.sin(Math.PI * t)) + 14 * S.noise2(t * 5, S.seedOf(seed) % 97, 3)]);
                }
                N.drape(P, { pts: S.curve(pts, true, 4), kind, seed, dir: Math.PI / 2 + (o.tilt ?? 0), origin: [(x0 + x1) / 2, -800], len: 700, fold: o.fold ?? 64 + rr() * 30, amp: 1.1 });
            };
            // a fall down one side, its inner edge irregular
            const fall = (xo, xi, y0, kind, seed, o = {}) => {
                const inner = wob([xi, y0], [xi + (o.lean ?? 0), 800], 12, 40, seed);
                const pts = [[xo, y0 - 60], ...inner, [xo, 820]];
                N.drape(P, { pts: S.curve(pts, true, 3), kind, seed, dir: Math.PI / 2, origin: [xo, y0], len: 900, fold: o.fold ?? 80, amp: 1.2 });
            };
            // cloth heaped at the foot, folds lying across
            const heap = (x0, x1, yt, kind, seed) => {
                const top = [];
                for (let i = 0; i <= 14; i++) {
                    const t = i / 14;
                    top.push([x0 + (x1 - x0) * t, yt + 40 * Math.sin(t * 5 + seed.length) + 24 * S.noise2(t * 4, seed.length, 5)]);
                }
                N.drape(P, { pts: S.curve([...top, [x1, 820], [x0, 820]], true, 3), kind, seed, dir: 0.35, origin: [x0, yt], len: 1400, fold: 120, amp: 0.75 });
            };
            // a tongue of cloth from far out towards the way through, ending in a hem
            const tongue = (a, b, w0, w1, kind, seed, fold = 70) => {
                const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
                const sdn = S.seedOf(seed) % 97, L1 = [], R1 = [];
                for (let i = 0; i <= 14; i++) {
                    const t = i / 14, w = (w0 + (w1 - w0) * t) / 2 * (1 + 0.18 * (S.noise2(t * 3, sdn, 1) - 0.5));
                    const cx = a[0] + dx * t, cy = a[1] + dy * t;
                    L1.push([cx + nx * w, cy + ny * w]);
                    R1.push([cx - nx * w, cy - ny * w]);
                }
                const tip = [];
                for (let i = 1; i < 8; i++) {
                    const an = (i / 8) * Math.PI, rr2 = (w1 / 2) * (0.9 + 0.25 * (S.noise2(i, sdn, 2) - 0.5));
                    tip.push([b[0] + nx * Math.cos(an) * rr2 + ux * Math.sin(an) * rr2 * 0.7, b[1] + ny * Math.cos(an) * rr2 + uy * Math.sin(an) * rr2 * 0.7]);
                }
                N.drape(P, { pts: S.curve([...L1, ...tip, ...R1.reverse()], true, 3), kind, seed, dir: Math.atan2(dy, dx), origin: a, len: L, fold, amp: 1.1, galloon: false });
            };
            // back row of swags, the moon among them, front row
            swag(-1300, -350, -470, 'veil', 'sw1');
            swag(-500, 260, -560, 'velvet', 'sw2');
            swag(180, 1300, -520, 'veil', 'sw3');
            N.moon(P, { x: 520, y: -420, R: 78, seed: 'luna', phase: 0.8 });
            swag(-1300, -560, -150, 'velvet', 'sw4', { fold: 90 });
            swag(-760, -60, -330, 'veil', 'sw5');
            swag(-120, 480, -340, 'velvet', 'sw6');
            swag(740, 1300, -120, 'velvet', 'sw7', { fold: 92 });
            fall(-1300, -560, -260, 'veil', 'f1', { lean: -80 });
            fall(1300, 600, -200, 'veil', 'f2', { lean: 70 });
            fall(-1300, -800, -100, 'velvet', 'f3');
            fall(1300, 860, -60, 'velvet', 'f4');
            heap(-1300, -40, 300, 'veil', 'h1');
            heap(-90, 1300, 320, 'velvet', 'h2');
            // tongues of veil and velvet reaching in from every side: their hems are the gap's edge
            tongue([-1250, -760], [-470, -150], 380, 230, 'velvet', 't1', 80);
            tongue([-300, -820], [-120, -300], 300, 210, 'veil', 't2', 60);
            tongue([520, -820], [300, -250], 340, 230, 'velvet', 't3', 72);
            tongue([1260, -560], [520, -60], 360, 220, 'veil', 't4', 66);
            tongue([1250, 760], [500, 190], 420, 250, 'velvet', 't5', 84);
            tongue([-1260, 640], [-520, 150], 400, 240, 'veil', 't6', 70);
            tongue([-200, 860], [-120, 330], 320, 230, 'velvet', 't7', 64);
            tongue([-1300, -120], [-560, -20], 300, 200, 'velvet', 't8', 74);
            // the candles, rising from below the frame
            const embers = [];
            for (const c of BANK) {
                const w = candleAt(P, c, { wax: c.x < 0 ? [0.86, 0.8, 0.66] : [0.88, 0.83, 0.7] });
                if (!c.lit) embers.push(w);
            }
            // things on the body: the disc of spheres, lilies in a silver jar, the lantern put out
            N.disc(P, { x: -345, y: -262, R: 120, seed: 'esferas' });
            const J = N.jar(P, { x: 430, y: 186, h: 160, seed: 'jarra-s' });
            for (const [k, pts, a] of [[0, [[420, 190], [404, 40], [360, -60]], -2.2], [1, [[438, 190], [480, 50], [520, -40]], -0.8], [2, [[430, 190], [440, 70], [452, 0]], -1.5]]) {
                N.lily(P, { pts, seed: 'az-s' + k, flowers: [{ u: 0.995, a, s: 1.15, open: k === 2 ? 0.2 : 1 }, { u: 0.82, a: a + (k ? 0.9 : -0.8), s: 0.9, open: 0.1 }] });
            }
            void J;
            N.tube(P, [[330, -800], [330, -380]], 3.4, (u, a, along, q) => {
                q.r = 0.2;
                q.g = 0.19;
                q.b = 0.2;
                q.sp = 0.4;
                q.h = Math.sin(along * 0.7) * 0.8;
            });
            const L = N.lantern(P, { x: 330, y: -380, s: 1.35, seed: 'apagado-s' });
            N.smoke(P, L.vent[0], L.vent[1] - 4, { seed: 'apagado-s', h: 300, alpha: 0.55, drift: -0.2 });
            // smoke through the folds
            N.haze(P, { y: -260, band: 260, seed: 'humo-s1', alpha: 0.3, n: 40 });
            N.haze(P, { x0: 200, x1: 900, y: -420, band: 120, seed: 'humo-luna', alpha: 0.5, n: 20 });
            N.moth(P, { x: -560, y: -430, s: 1.1, rot: 0.5, open: 1, seed: 'sm1' });
            N.moth(P, { x: 640, y: -240, s: 1, rot: -1.1, open: 0.7, seed: 'sm2', pale: true });
            P.light(lightsFor('far'), { amb: [0.2, 0.17, 0.33] });
            for (const c of BANK) if (c.lit) N.flame(g, flameOf(c).x, flameOf(c).y, { seed: c.seed, h: 44, w: 12, R: 70, glow: 0.55 });
            for (const w of embers) N.ember(g, w.x, w.y);
            S.tooth(g, box, { amp: 0.04 });
        }),
        sheet('mid', D.mid, (g) => {
            const P = N.begin(g);
            const F = N.farol(P, { x: FAROL.x, y: FAROL.y, s: FAROL.s, seed: 'cruz-de-guia-s', pole: 900 });
            N.thurible(P, { x: THUR.x, y: THUR.y, s: THUR.s, seed: 'incensario-s', drift: -1.2, smokeH: 620 });
            N.dove(P, { x: 20, y: -445, s: 1.45, seed: 'paloma-s' });
            N.book(P, { x: 500, y: 365, w: 440, h: 290, seed: 'cantoral-s' });
            N.moth(P, { x: 380, y: 270, s: 1.2, rot: 2.4, open: 0.3, seed: 'sm3', pale: true });
            N.moth(P, { x: -470, y: -250, s: 1.2, rot: 0.8, open: 1, seed: 'sm4' });
            P.light(lightsFor('mid'), { amb: [0.16, 0.14, 0.27] });
            N.flame(g, F.fx, F.fy, { seed: 'farol-s', h: 34, w: 10, R: 80, glow: 0.8 });
            N.halo(g, THUR.x, THUR.y + 64 * THUR.s, 50, 0.6);
            S.tooth(g, box, { amp: 0.04 });
        }),
        sheet('near', D.near, (g) => {
            const P = N.begin(g);
            for (const c of NEAR) candleAt(P, c, { wax: [0.86, 0.8, 0.66] });
            N.ladderObj(P, { a: [-1180, 820], b: [-640, -800], span: 150, step: 120, w: 30, seed: 'escala-s' });
            N.vihuela(P, { x: 760, y: 190, s: 1.6, rot: 0.32, seed: 'vihuela-s', hang: -800 });
            N.moth(P, { x: -760, y: 120, s: 1.6, rot: -0.4, open: 0.2, seed: 'sm5' });
            P.light(lightsFor('near'), { amb: [0.15, 0.13, 0.26] });
            for (const c of NEAR) N.flame(g, flameOf(c).x, flameOf(c).y, { seed: c.seed, h: 72, w: 19, R: 160, glow: 0.9 });
            S.tooth(g, box, { amp: 0.04 });
        }),
    ];
};
