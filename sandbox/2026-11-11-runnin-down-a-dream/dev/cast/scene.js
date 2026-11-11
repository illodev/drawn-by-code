// dev: character sheet, to judge the cast at size (through the tape, as in the film)
Motion.scene({
    fps: 24, duration: 1, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    draw(g, t, env) {
        const C = Cereal, K = C.COL;
        C.sunburst(g, 500, 560, { n: 12, rot: 0.2, a: K.purple, b: K.violet });
        C.burst(g, 600, 600, { r0: 250, r1: 350, n: 14, seed: 'dv', fill: K.yellow, ink: K.ink, lw: 5 });
        const lip = [[-40, 1040]];
        for (let i = 0; i <= 22; i++) lip.push([i * 50 - 50, 838 + (i % 2 ? 0 : 24)]);
        lip.push([1040, 1040]);
        C.poly(g, lip, { fill: K.navy, lw: 0 });
        C.poly(g, lip.slice(1, -1), { ink: K.ink, lw: 5, close: false });
        Cast.tom(g, 215, 890, 235, { shades: 1, strum: 0.4 });
        Devil.draw(g, 610, 890, 240, { contract: true, trident: true, tail: 0.03 });
        C.text3d(g, 'SIGN HERE!', 500, 190, { size: 150, face: K.white, side: K.ink, side2: K.white, bands: 4, depth: 18, ow: 4, letter: (i) => ({ rot: (i % 2 ? 1 : -1) * 0.04 }) });
    },
    post(ctx, t, env) { Cereal.post(ctx, t, env); },
});
