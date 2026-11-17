// Shot 1 · The first cut (0–6 s): the block is black; a gouge carves one long streak across
// it, then another on every beat (each cut travels left to right over three drawings),
// until a river runs under a crescent moon. The water starts to run as soon as it is cut.
(() => {
    const C = Corriente, W = C.W, R = C.R, { lerp } = C;
    // the eight streaks: [y, x0, x1, width], one per beat
    const STREAKS = [[470, 180, 1110, 5.2], [432, 330, 980, 3.6], [512, 90, 820, 4.4], [552, 260, 1220, 3.4], [398, 470, 900, 2.8], [590, 40, 700, 4.8], [626, 380, 1270, 3.2], [364, 560, 820, 2.2]];
    C.FIRST_CUT_BEATS = STREAKS.map((_, i) => i * 0.75);

    C.shots.firstCut = (blk, t, d) => {
        blk.begin();
        C.night(blk);
        const flow = d * 1.6;
        blk.cut((g) => {
            const r = R('fc');
            STREAKS.forEach(([y, x0, x1, w], i) => {
                const k = d - i * 9;
                if (k < 0) return;
                const p = C.clamp((k + 1) / 3), xe = lerp(x0, x1, p);
                // the long cut, wobbling a little as a hand-pushed gouge does
                const pts = [];
                for (let x = x0; x <= xe; x += 12) pts.push([x, y + Math.sin(x / 70 + i) * 2.2]);
                if (pts.length > 1) W.groove(g, pts, w, R('fcs' + i), { taper: Math.min(40, (xe - x0) / 3), rag: 0.35 });
                // once cut, the water runs: short cuts drifting along the streak
                if (p >= 1) for (let j = 0; j < 7; j++) {
                    const u = ((j / 7 + r() * 0.1 + (flow + i * 13) / (x1 - x0)) % 1), x = lerp(x0 - 40, x1 + 40, u), yy = y + (r() - 0.5) * 22;
                    W.gouge(g, x, yy, x + 16 + r() * 30, yy + (r() - 0.5), 1 + r() * 1.4, r, { asym: 1.2 });
                }
            });
            // the last beats: the river fills in between the streaks
            if (d >= 54) {
                const f = C.clamp((d - 54) / 14);
                W.hatch(g, { box: [0, 340, 1280, 660], dir: 0.01, sp: 3.6, len: [14, 80], gap: [8, 40], wMin: 1, wMax: 3.4, seed: 'fc-river', tone: (x, y) => f * 0.22 * Math.exp(-(((y - 495) / 120) ** 2)) * (0.5 + W.noise2('fcr', (x - flow * 3) / 160, y / 10)) });
            }
        });
        // the crescent moon on the seventh beat, high on the right
        if (d >= 6 * 9) {
            const p = C.clamp((d - 54 + 1) / 3);
            blk.cut((g) => { g.save(); g.beginPath(); g.rect(1000, 80, 120 * p, 120); g.clip(); g.beginPath(); g.arc(1060, 140, 24, 0, 7); g.fill(); g.restore(); });
            blk.ink((g) => { g.beginPath(); g.arc(1049, 140, 24, 0, 7); g.fill(); });
        }
    };
})();
