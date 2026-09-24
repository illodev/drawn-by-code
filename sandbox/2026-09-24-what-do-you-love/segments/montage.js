// Montage «what I love»: 13 cards (10–16 s) and the heart that gathers them (16–18 s).
// Every object is a small drawer (g, x, y, s, t) so the heart can reuse them in miniature.
const Things = {};
(() => {
    const P = Paper, E = Ease, C = WL.COL;
    const S = (...a) => WL.sprite(...a);
    // draws a cached cutout group centred on (x, y), scaled by s
    function place(g, key, box, draw, x, y, s, rot = 0) {
        const sp = S(key, box, draw, 1.6);
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(s, s);
        sp.draw(g);
        g.restore();
    }
    const cut = (c, pts, col, seed, o = {}) => P.cutout(c, pts, col, seed, { border: 2.4, shadow: 0.15, ...o });
    const circleU = (list, dx = 0, dy = 0) => P.circleUnion(list).map(([x, y]) => [x + dx, y + dy]);

    Things.words = (g, x, y, s, t) => {
        place(g, 'th-book', { x: -250, y: -130, w: 500, h: 260 }, (c) => {
            cut(c, [[-230, -60], [0, -40], [230, -60], [230, 110], [0, 120], [-230, 110]], '#d9473b', 'bookcover');
            for (const sd of [-1, 1]) {
                cut(c, [[0, -70], [sd * 215, -100], [sd * 215, 90], [0, 105]], '#f3eee2', 'bookpage' + sd, { border: 1.6, shadow: 0.05, inner: (cc) => WL.scribbleFill(cc, { x: sd < 0 ? -200 : 20, y: -90, w: 180, h: 180 }, '#8d8578', 'bookt' + sd, { lineH: 16, width: 1, scale: 0.8 }) });
            }
        }, x, y, s);
        const L = [['a', '#d87c65', -150, -170], ['b', '#f0cc51', -40, -230], ['c', '#3862b1', 90, -190], ['e', '#6e3f9e', 200, -120]];
        for (const [ch, col, dx, dy] of L) WL.write(g, ch, x + dx * s, y + (dy + Math.sin(t * 9 + dx) * 8) * s, 90 * s, col, { align: 'center' });
    };
    Things.music = (g, x, y, s, t) => {
        const w = Math.sin(t * 10) * 0.08;
        place(g, 'th-note1', { x: -80, y: -170, w: 170, h: 250 }, (c) => {
            cut(c, P.ellipse(-20, 40, 42, 32), '#d9473b', 'n1head');
            cut(c, [[14, 30], [26, 30], [26, -150], [14, -150]], '#d9473b', 'n1stem', { border: 1.6 });
            cut(c, P.noodle(P.bezier([20, -150], [70, -120], [80, -60], [50, -20], 12), 18, 10), '#d9473b', 'n1flag', { border: 1.6 });
        }, x - 120 * s, y, s, w);
        place(g, 'th-note2', { x: -130, y: -170, w: 270, h: 250 }, (c) => {
            cut(c, P.ellipse(-80, 50, 40, 30), '#3862b1', 'n2a');
            cut(c, P.ellipse(70, 30, 40, 30), '#3862b1', 'n2b');
            cut(c, [[-50, 40], [-38, 40], [-38, -120], [-50, -120]], '#3862b1', 'n2s1', { border: 1.6 });
            cut(c, [[100, 20], [112, 20], [112, -140], [100, -140]], '#3862b1', 'n2s2', { border: 1.6 });
            cut(c, [[-50, -125], [112, -150], [112, -115], [-50, -90]], '#3862b1', 'n2beam', { border: 1.6 });
        }, x + 110 * s, y + 20 * s, s, -w);
    };
    Things.sea = (g, x, y, s, t) => {
        place(g, 'th-boat', { x: -150, y: -210, w: 300, h: 260 }, (c) => {
            cut(c, [[-130, -20], [130, -20], [90, 40], [-90, 40]], '#e6e2d8', 'hull', { inner: (cc) => WL.scribbleFill(cc, { x: -130, y: -25, w: 260, h: 70 }, '#8d8578', 'hullt', { lineH: 12, width: 1, scale: 0.7 }) });
            cut(c, [[0, -190], [0, -30], [-110, -30]], '#ece8de', 'sail', { inner: (cc) => WL.scribbleFill(cc, { x: -110, y: -190, w: 110, h: 160 }, '#8d8578', 'sailt', { lineH: 12, width: 1, scale: 0.7 }) });
            cut(c, [[4, -200], [50, -185], [4, -170]], '#d9473b', 'flag', { border: 1.4 });
        }, x, y - 20 * s + Math.sin(t * 6) * 6 * s, s, Math.sin(t * 5) * 0.05);
        place(g, 'th-waves', { x: -270, y: -60, w: 540, h: 170 }, (c) => {
            const top = [];
            for (let i = 0; i <= 12; i++) top.push([-250 + i * 42, -20 + (i % 2 ? -26 : 8)]);
            cut(c, [...top, [250, 90], [-250, 90]], '#2f64a8', 'waves', { paper: '#dff0fb' });
            cut(c, [[-200, 30], [-120, 10], [-60, 35]], '#7fb6e0', 'foam1', { border: 0, shadow: 0 });
        }, x, y + 40 * s, s);
    };
    Things.tree = (g, x, y, s, t) => {
        place(g, 'th-tree', { x: -170, y: -260, w: 340, h: 420 }, (c) => {
            cut(c, [[-18, 150], [18, 150], [14, 0], [-14, 0]], '#8a5a3a', 'trunk');
            cut(c, circleU([[0, -120, 90], [-80, -60, 70], [80, -60, 70], [-40, -10, 70], [50, -10, 70]]), '#4f9a4a', 'crown');
            const r = P.rng('apples');
            for (let i = 0; i < 9; i++) cut(c, P.ellipse(-100 + r() * 200, -150 + r() * 170, 11, 11), '#d9473b', 'apple' + i, { border: 1.4, shadow: 0 });
        }, x, y, s, Math.sin(t * 4) * 0.02);
    };
    Things.dog = (g, x, y, s, t) => {
        place(g, 'th-dog', { x: -180, y: -250, w: 360, h: 400 }, (c) => {
            cut(c, P.ellipse(40, 50, 110, 95), '#b8804d', 'dogbody');
            cut(c, P.ellipse(90, 60, 40, 32), '#7c4e2c', 'dogspot');
            cut(c, P.noodle([[140, 80], [190, 40], [200, 10]], 20, 12), '#b8804d', 'dogtail');
            cut(c, P.ellipse(-40, -80, 70, 60), '#b8804d', 'doghead');
            cut(c, P.ellipse(-110, -80, 32, 22), '#b8804d', 'dogsnout');
            cut(c, P.ellipse(0, -60, 26, 55), '#7c4e2c', 'dogear');
            cut(c, [[-20, 120], [10, 120], [10, 150], [-20, 150]], '#b8804d', 'dogleg1');
            cut(c, [[-80, 5], [-20, 20], [-25, 30], [-85, 15]], '#d9473b', 'collar', { border: 1.2 });
            c.fillStyle = '#231a1f';
            c.beginPath();
            c.arc(-60, -95, 7, 0, Math.PI * 2);
            c.arc(-138, -86, 9, 0, Math.PI * 2);
            c.fill();
        }, x, y, s);
    };
    Things.bread = (g, x, y, s, t) => {
        place(g, 'th-bread', { x: -230, y: -120, w: 460, h: 240 }, (c) => {
            cut(c, P.roundRect(-210, -80, 360, 160, 75), '#c98d4e', 'loaf', { inner: (cc) => WL.scribbleFill(cc, { x: -200, y: -80, w: 340, h: 160 }, '#8a5a33', 'loaft', { lineH: 18, width: 1, scale: 0.8 }) });
            for (let k = 0; k < 4; k++) cut(c, [[-150 + k * 70, -60], [-120 + k * 70, -65], [-150 + k * 70, 30], [-170 + k * 70, 25]], '#e8c48c', 'score' + k, { border: 0, shadow: 0 });
            cut(c, P.roundRect(120, -60, 90, 140, 35), '#f1dcae', 'slice', { paper: '#fff' });
        }, x, y, s);
    };
    Things.rain = (g, x, y, s, t) => {
        place(g, 'th-cloud', { x: -200, y: -110, w: 400, h: 200 }, (c) => {
            cut(c, circleU([[-100, 10, 60], [-20, -30, 80], [80, 0, 65], [140, 30, 40], [-150, 40, 40]]), '#dcdad5', 'cloud', { inner: (cc) => WL.scribbleFill(cc, { x: -200, y: -110, w: 400, h: 180 }, '#8d8a84', 'cloudt', { lineH: 14, width: 1, scale: 0.7 }) });
        }, x, y - 250 * s, s);
        for (let i = 0; i < 10; i++) {
            const dx = -150 + (i % 5) * 75 + (i > 4 ? 35 : 0), fall = ((t * 1.8 + i * 0.37) % 1);
            place(g, 'th-drop', { x: -12, y: -18, w: 24, h: 36 }, (c) => cut(c, [[0, -14], [9, 4], [0, 12], [-9, 4]], '#6aa7d8', 'drop', { border: 1.2, shadow: 0 }), x + dx * s, y + (-170 + fall * 260) * s, s);
        }
        place(g, 'th-umbrella', { x: -150, y: -100, w: 300, h: 230 }, (c) => {
            cut(c, [...P.ellipse(0, 0, 130, 80, 30, Math.PI, Math.PI * 2), [130, 0], [90, -10], [45, 5], [0, -10], [-45, 5], [-90, -10]], '#5aa34f', 'umbrella');
            cut(c, [[-4, -5], [4, -5], [4, 110], [-4, 110]], '#8a5a3a', 'handle', { border: 1 });
        }, x, y - 30 * s, s);
    };
    Things.math = (g, x, y, s, t) => {
        place(g, 'th-grid', { x: -200, y: -140, w: 400, h: 280 }, (c) => {
            cut(c, [[-180, -120], [180, -110], [175, 120], [-185, 115]], '#dbeee0', 'grid', {
                inner: (cc) => {
                    cc.strokeStyle = '#9cc6a9';
                    cc.lineWidth = 1.2;
                    for (let i = -180; i < 180; i += 20) (cc.beginPath(), cc.moveTo(i, -120), cc.lineTo(i, 120), cc.stroke(), cc.beginPath(), cc.moveTo(-180, i * 0.66), cc.lineTo(180, i * 0.66), cc.stroke());
                },
            });
        }, x + 40 * s, y, s);
        const N = [['1', '#5aa34f', -120, -150], ['2', '#f0cc51', -40, -180], ['8', '#3862b1', 180, -120], ['3', '#d9473b', 170, 150]];
        for (const [n, col, dx, dy] of N) WL.write(g, n, x + dx * s, y + dy * s, 90 * s, col, { align: 'center' });
        P.markerStroke(g, Array.from({ length: 30 }, (_, i) => [x + (-40 + Math.cos(i * 0.4) * i * 2.2) * s, y + (20 + Math.sin(i * 0.4) * i * 2.2) * s]), '#d9473b', 5 * s, 'spiralmath', 0.9);
    };
    Things.stars = (g, x, y, s, t) => {
        place(g, 'th-space', { x: -330, y: -330, w: 660, h: 660 }, (c) => {
            cut(c, P.ellipse(0, 0, 300, 300), '#262a66', 'space', { paper: '#e8e6f0', border: 7 });
            cut(c, P.ellipse(0, 60, 100, 100), '#e8b85a', 'saturn');
            P.markerStroke(c, P.ellipse(0, 60, 190, 45, 64).map(([a, b]) => [a, b + (a > 0 ? -10 : 10)]), '#e98b87', 14, 'ring', 0.95);
            cut(c, P.ellipse(-210, -120, 30, 30), '#e98b87', 'planet1');
            cut(c, P.ellipse(210, -80, 34, 34), '#d6d4e6', 'planet2', { inner: (cc) => WL.scribbleFill(cc, { x: 175, y: -115, w: 70, h: 70 }, '#8d8a9a', 'pl2t', { lineH: 10, width: 0.8, scale: 0.5 }) });
            P.markerStroke(c, Array.from({ length: 28 }, (_, i) => [150 + Math.cos(i * 0.45) * i * 1.6, 190 + Math.sin(i * 0.45) * i * 1.6]), '#e98b87', 4, 'galaxy', 0.9);
        }, x, y, s);
        const r = Motion.rng('spacestars');
        for (let i = 0; i < 9; i++) WL.star(g, x + (-250 + r() * 500) * s, y + (-250 + r() * 500) * s, 10 * s * (0.8 + 0.2 * Math.sin(t * 8 + i)), r());
    };
    Things.octopus = (g, x, y, s, t) => {
        place(g, 'th-octo', { x: -200, y: -220, w: 400, h: 420 }, (c) => {
            for (let k = 0; k < 6; k++) {
                const a = Math.PI * (0.15 + k * 0.14);
                cut(c, P.noodle(P.bezier([Math.cos(a) * 40, 40], [Math.cos(a) * 140, 90], [Math.cos(a) * 200, 150], [Math.cos(a) * 170, 190], 16), 40, 16), '#b58ad6', 'tent' + k, { border: 2 });
            }
            cut(c, P.ellipse(0, -60, 110, 125), '#b58ad6', 'octohead');
            c.fillStyle = '#231a1f';
            c.beginPath();
            c.arc(-38, -40, 12, 0, Math.PI * 2);
            c.arc(38, -40, 12, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = '#e98b87';
            c.beginPath();
            c.ellipse(-60, -10, 16, 11, 0, 0, Math.PI * 2);
            c.ellipse(60, -10, 16, 11, 0, 0, Math.PI * 2);
            c.fill();
        }, x, y, s, Math.sin(t * 6) * 0.04);
    };
    Things.tea = (g, x, y, s, t) => {
        place(g, 'th-cup', { x: -220, y: -130, w: 440, h: 260 }, (c) => {
            cut(c, P.ellipse(0, 90, 200, 30), '#8fcfb3', 'saucer');
            cut(c, [...P.ellipse(0, -40, 150, 30, 30, Math.PI, Math.PI * 2), [150, -40], [120, 60], [60, 90], [-60, 90], [-120, 60], [-150, -40]], '#fbf6ec', 'cup', {
                inner: (cc) => {
                    for (let i = -140; i < 140; i += 40) cut(cc, P.ellipse(i, 20, 10, 10), '#d9473b', 'dot' + i, { border: 0, shadow: 0 });
                },
            });
            cut(c, P.noodle(P.bezier([140, -20], [220, -30], [220, 60], [120, 50], 16), 22, 22), '#fbf6ec', 'cuphandle', { border: 2 });
        }, x, y, s);
    };
    Things.flowers = (g, x, y, s, t) => {
        place(g, 'th-bouquet', { x: -180, y: -230, w: 360, h: 460 }, (c) => {
            const r = P.rng('bouquet');
            for (let i = 0; i < 6; i++) cut(c, circleU([[0, -12, 12], [11, 4, 12], [-11, 4, 12]], -110 + i * 44, -150 + r() * 60), ['#f0cc51', '#d9473b', '#fbf6ec', '#b58ad6'][i % 4], 'fl' + i, { border: 1.4 });
            cut(c, [[-150, -60], [150, -60], [30, 210], [-30, 210]], '#e6e2d8', 'cone', { inner: (cc) => WL.scribbleFill(cc, { x: -150, y: -60, w: 300, h: 270 }, '#8d8578', 'conet', { lineH: 14, width: 1, scale: 0.7 }) });
            cut(c, P.ellipse(0, 40, 26, 14), '#d9473b', 'bow', { border: 1.4 });
        }, x, y, s);
    };
    Things.cat = (g, x, y, s, t) => {
        const br = 1 + Math.sin(t * 3) * 0.02;
        place(g, 'th-cat', { x: -230, y: -170, w: 460, h: 320 }, (c) => {
            cut(c, P.ellipse(40, 30, 190, 115), '#e39b54', 'catbody');
            cut(c, P.noodle(P.bezier([200, 60], [230, 140], [60, 160], [-60, 130], 16), 30, 20), '#e39b54', 'cattail', { border: 2 });
            cut(c, [...P.ellipse(-120, 20, 85, 75), [-190, -40], [-175, -110], [-140, -60], [-100, -60], [-70, -110], [-60, -40]], '#e39b54', 'cathead');
            cut(c, P.ellipse(-120, 50, 45, 26), '#fbf6ec', 'catmuzzle', { border: 0, shadow: 0 });
        }, x, y, s * br);
        g.save();
        g.strokeStyle = '#231a1f';
        g.lineWidth = 4 * s;
        for (const dx of [-150, -90]) (g.beginPath(), g.arc(x + dx * s, y + 18 * s, 12 * s, Math.PI * 0.1, Math.PI * 0.9), g.stroke());
        g.restore();
    };

    // ------------------------------------------------------------------ the cards
    // [start, end, word, background, thing, thing x/y/scale, flower x/y/R/rot, text color]
    const CARDS = [
        // flower 'over' the object, or 'under' it (the object covers the flower's bottom)
        [10.0, 10.5, 'words', '#edc444', 'words', [500, 560, 1.3], [480, 470, 170, 0], null, 'over'],
        [10.5, 11.0, 'music', '#81ceb2', 'music', [460, 600, 1.35], [470, 300, 150, 0.1], null, 'over'],
        [11.0, 11.5, 'the sea', '#eaa4c8', 'sea', [500, 640, 1.55], [480, 450, 140, 0], null, 'under'],
        [11.5, 12.0, 'trees', '#94c5e5', 'tree', [500, 580, 1.55], [500, 260, 150, 0], null, 'over'],
        [12.0, 12.5, 'dogs', '#efda8b', 'dog', [620, 650, 1.45], [380, 180, 150, 0.2], null, 'over'],
        [12.5, 13.0, 'bread', '#85abdc', 'bread', [480, 610, 1.45], [470, 420, 135, 0], null, 'under'],
        [13.0, 13.5, 'rain', '#d7b585', 'rain', [500, 560, 1.3], [500, 700, 130, 0], null, 'under'],
        [13.5, 14.0, 'math', '#b89edb', 'math', [570, 520, 1.35], [270, 560, 150, 0.3], null, 'over'],
        [14.0, 15.0, 'the stars', '#171a45', 'stars', [490, 510, 1.58], [640, 250, 150, 0], '#f4e9c5', 'over'],
        [15.0, 15.25, 'octopus', '#318289', 'octopus', [620, 640, 1.35], [250, 330, 150, 0], '#f4e9c5', 'over'],
        [15.25, 15.5, 'tea', '#673c71', 'tea', [480, 660, 1.45], [480, 500, 140, 0], '#f4e9c5', 'under'],
        [15.5, 15.75, 'flowers', '#e798c7', 'flowers', [480, 660, 1.45], [480, 420, 150, 0], null, 'over'],
        [15.75, 16.0, 'cats', '#3f66b4', 'cat', [560, 760, 1.35], [560, 440, 150, 0], '#f4e9c5', 'over'],
    ];
    Shots['Montage'] = (g, t, env) => {
        const card = CARDS.find((c) => t >= c[0] && t < c[1]) ?? CARDS[CARDS.length - 1];
        const [t0, t1, word, bg, thing, [tx, ty, ts], [fx, fy, fr, frot], ink, order] = card;
        const lt = t - t0;
        WL.flat(g, env, 'card-' + thing, bg);
        // a quick pop-in on each cut
        const pop = 0.92 + 0.08 * E.back(E.seg(lt, 0, 0.12));
        const behindFlower = order === 'under';
        if (!behindFlower) Things[thing](g, tx, ty, ts * pop, t);
        WL.flower(g, fx, fy + Math.sin(t * 12) * 4, fr * 1.3 * pop, { t, rot: frot + lt * 0.4, mouth: lt < 0.12 ? 'o' : 'smile', eyes: 'open', wiggle: 0.4 });
        if (behindFlower) Things[thing](g, tx, ty, ts * pop, t);
        const p = t1 - t0 > 0.3 ? E.seg(lt, 0.02, t1 - t0 > 0.6 ? 0.4 : 0.24) : 1;
        WL.write(g, word, 500, 895, 92, ink ?? '#2b2530', { p, align: 'center' });
    };

    // ------------------------------------------------------------------ the heart
    function heartPts(cx, cy, r, n = 120) {
        return Array.from({ length: n }, (_, i) => {
            const a = (i / n) * Math.PI * 2;
            const x = 16 * Math.pow(Math.sin(a), 3), y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
            return [cx + x * r, cy + y * r];
        });
    }
    // miniatures around the heart, in the order they pop in
    const AROUND = [
        ['words', 640, 150, 0.35], ['music', 360, 160, 0.4], ['tree', 180, 250, 0.35], ['sea', 820, 250, 0.3], ['dog', 870, 430, 0.35],
        ['bread', 120, 420, 0.35], ['math', 140, 600, 0.3], ['octopus', 180, 790, 0.3], ['stars', 830, 640, 0.18], ['tea', 820, 800, 0.3],
        ['flowers', 320, 900, 0.3], ['cat', 680, 900, 0.3],
    ];
    Shots['Heart'] = (g, t, env) => {
        WL.sprite('heart-bg', { x: -100, y: -100, w: 1200, h: 1200 }, (c) => {
            c.fillStyle = '#ece2cf';
            c.fillRect(-100, -100, 1200, 1200);
            WL.scribbleFill(c, { x: -100, y: -100, w: 1200, h: 1200 }, '#b7aa8f', 'heartbg', { lineH: 30, alpha: 0.5, width: 1.2, scale: 1.4 });
        }, 1.1).draw(g);
        const beat = 1 + 0.03 * Math.sin(t * 10);
        g.save();
        g.translate(500, 520);
        g.scale(beat, beat);
        g.translate(-500, -520);
        WL.sprite('heart', { x: 60, y: 80, w: 880, h: 880 }, (c) => {
            P.cutout(c, heartPts(500, 500, 24).map(([x, y]) => [x + 6, y + 8]), '#d9473b', 'heartred', { border: 0, shadow: 0, jag: 1.6 });
            P.cutout(c, heartPts(500, 490, 23.5), '#e98bb8', 'heartpink', { border: 3, shadow: 0.1, jag: 1.3 });
        }, 1.2).draw(g);
        g.restore();
        WL.flower(g, 500, 520, 190, { t, rot: t * 0.3, mouth: 'smile', eyes: 'open' });
        AROUND.forEach(([thing, x, y, s], i) => {
            const at = 16.05 + i * 0.12;
            const u = E.back(E.seg(t, at, at + 0.2));
            if (u > 0) Things[thing](g, x, y, s * u, t);
        });
        if (t >= 17.7) {
            WL.write(g, '?', 760, 170, 150, '#3862b1', { align: 'center' });
            WL.sprite('mini-heart', { x: -50, y: -50, w: 100, h: 100 }, (c) => P.cutout(c, heartPts(0, 0, 2.6), '#d9473b', 'miniheart', { border: 2 }), 2)
                .draw((g.save(), g.translate(560, 880), g));
            g.restore();
        }
    };
})();
