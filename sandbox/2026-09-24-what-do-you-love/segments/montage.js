// Montage «what I love»: 13 cards (10–16 s) and the heart that gathers them (16–18 s).
// The objects live in things/*.js (one file each); this file choreographs the cards.
(() => {
    const P = Paper, E = Ease, C = WL.COL;
    // ------------------------------------------------------------------ the cards
    // [start, end, word, background, thing, thing x/y/scale, flower x/y/R/rot, text color]
    const CARDS = [
        // flower 'over' the object, or 'under' it (the object covers the flower's bottom)
        [10.0, 10.5, 'words', '#edc444', 'words', [500, 560, 1.3], [480, 470, 170, 0], null, 'over'],
        [10.5, 11.0, 'music', '#81ceb2', 'music', [460, 600, 1.35], [470, 300, 150, 0.1], null, 'over'],
        [11.0, 11.5, 'the sea', '#eaa4c8', 'sea', [500, 640, 1.55], [480, 450, 140, 0], null, 'under'],
        [11.5, 12.0, 'trees', '#94c5e5', 'tree', [500, 580, 1.55], [500, 260, 150, 0], null, 'over'],
        [12.0, 12.5, 'dogs', '#efda8b', 'dog', [661, 593, 0.602], [380, 180, 150, 0.2], null, 'over'],
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
        ['words', 640, 150, 0.35], ['music', 360, 160, 0.4], ['tree', 180, 250, 0.35], ['sea', 820, 250, 0.3], ['dog', 870, 430, 0.15],
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
