// dev: Mike and Howie next to Tom, to judge them at size (through the tape, as in the film).
// One page a second; pages 10–19 are pages 0–9 again without the tape, to check the drawing.
//   0 Mike + Tom (s 230)   1 Tom + Howie (s 230)   2 Mike alone (s 420)   3 Howie alone (s 420)
//   4 Mike's poses         5 Howie's poses          6 the three at s 90 / 130 / 175
//   7 Mike's solo (s 300)  8 the two-tone prints    9 the instruments alone
Motion.scene({
    fps: 24, duration: 20, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    draw(g, t, env) {
        const C = Cereal, K = C.COL, B = BandStrings, page = Math.floor(t + 1e-6) % 10;
        const floor = (y0) => {
            const lip = [[-40, 1040]];
            for (let i = 0; i <= 22; i++) lip.push([i * 50 - 50, y0 + (i % 2 ? 0 : 24)]);
            lip.push([1040, 1040]);
            C.poly(g, lip, { fill: K.navy, lw: 0 });
            C.poly(g, lip.slice(1, -1), { ink: K.ink, lw: 5, close: false });
        };
        if (page === 8) {
            g.fillStyle = K.hot ?? '#ff4fa3';
            g.fillRect(0, 0, 1000, 1000);
            B.mike(g, 260, 880, 230, { eyes: 'open' }, B.print(B.MIKE));
            B.howie(g, 640, 880, 230, {}, B.print(B.HOWIE));
            return;
        }
        C.sunburst(g, 500, 560, { n: 12, rot: 0.2, a: page % 2 ? K.teal : K.purple, b: page % 2 ? K.aqua : K.violet });
        if (page === 0 || page === 1) {
            C.burst(g, 500, 560, { r0: 330, r1: 430, n: 14, seed: 'dv', fill: K.yellow, ink: K.ink, lw: 5 });
            floor(838);
            if (page === 0) {
                B.mike(g, 250, 890, 230, { strum: 0.3, fret: 0.4 });
                Cast.tom(g, 680, 890, 230, { strum: 0.4 });
            } else {
                Cast.tom(g, 230, 890, 230, { strum: 0.4 });
                B.howie(g, 620, 890, 230, { pluck: 0.3, fret: 0.5 });
            }
        } else if (page === 2) {
            C.burst(g, 500, 520, { r0: 380, r1: 470, n: 14, seed: 'dv', fill: K.yellow, ink: K.ink, lw: 5 });
            floor(880);
            B.mike(g, 440, 925, 420, { strum: -0.2, fret: 0.5 });
        } else if (page === 3) {
            C.burst(g, 500, 520, { r0: 380, r1: 470, n: 14, seed: 'dv', fill: K.yellow, ink: K.ink, lw: 5 });
            floor(880);
            B.howie(g, 370, 925, 420, { pluck: 0.2, fret: 0.6 });
        } else if (page === 4 || page === 5) {
            floor(900);
            const who = page === 4 ? B.mike : B.howie, k = page === 4 ? 'strum' : 'pluck';
            const poses = [
                { [k]: -1, fret: 0, eyes: 'wide', mouth: 'o' }, { [k]: 1, fret: 1, eyes: 'shut', mouth: 'sing', sway: 0.05 }, { squash: 0.12, mouth: 'grin', shades: 1, [k]: 0 },
                { squash: -0.1, lean: 0.12, headTilt: 0.1, sway: -0.05, shades: 0.5 }, { lean: -0.12, headDy: -0.06, headTilt: -0.12, mouth: 'sing', fret: 0.8 }, page === 4 ? { solo: 1, eyes: 'shut', mouth: 'o', fret: 0.9, strum: 0.5 } : { eyes: 'wide', mouth: 'grin', pluck: -1, fret: 0.2, sway: 0.06 },
            ];
            poses.forEach((p, i) => who(g, 160 + (i % 3) * 300, 470 + Math.floor(i / 3) * 420, page === 4 ? 172 : 160, p));
        } else if (page === 6) {
            C.burst(g, 500, 560, { r0: 330, r1: 430, n: 14, seed: 'dv', fill: K.yellow, ink: K.ink, lw: 5 });
            floor(838);
            B.howie(g, 660, 880, 175, { pluck: 0.4 });
            Cast.tom(g, 420, 895, 175, { strum: 0.4 });
            B.mike(g, 170, 880, 175, { strum: -0.4 });
            B.mike(g, 150, 520, 130, {});
            Cast.tom(g, 400, 520, 130, {});
            B.howie(g, 640, 520, 130, {});
            B.mike(g, 180, 290, 90, {});
            Cast.tom(g, 370, 290, 90, {});
            B.howie(g, 560, 290, 90, {});
        } else if (page === 7) {
            C.burst(g, 500, 520, { r0: 380, r1: 470, n: 14, seed: 'dv', fill: K.yellow, ink: K.ink, lw: 5 });
            floor(880);
            B.mike(g, 250, 925, 300, { solo: 0.5, mouth: 'grin', fret: 0.6 });
            B.mike(g, 690, 925, 300, { solo: 1, eyes: 'shut', mouth: 'sing', fret: 1, strum: -0.6, sway: -0.04 });
        } else if (page === 9) {
            g.fillStyle = K.teal;
            g.fillRect(0, 0, 1000, 1000);
            g.save();
            g.scale(420, 420);
            B.guitar(g, B.MIKE, 3.2 / 420, [0.75, 0.7], -0.15, 1);
            B.bass(g, B.HOWIE, 3.2 / 420, [0.65, 1.7], -0.15, 1);
            g.restore();
        }
    },
    post(ctx, t, env) { if (t < 10 - 1e-6) Cereal.post(ctx, t, env); },
});
