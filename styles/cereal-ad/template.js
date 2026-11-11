// '90s cereal commercial style template: the tape starts (PLAY ▶ on the VCR's blue), then a
// title card: a spinning sunburst, a starburst that pops, extruded letters that hop on the
// beat, a box that lands, Memphis confetti. engine/new.mjs copies it as the scene.js of every
// new experiment.
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js'],
    fonts: [
        { family: 'Anton', src: 'fonts/Anton-latin.woff2' },
        { family: 'Titan One', src: 'fonts/TitanOne-latin.woff2' },
    ],
    bpm: 120,
    shots: [[0, 0.5, 'Play'], [0.5, 4, 'Card']],

    draw(g, t, env) {
        const C = Cereal, K = C.COL, E = Ease, W = env.W, H = env.H, u = W / 1000;
        if (t < 0.5) {
            g.fillStyle = K.vcrBlue;
            g.fillRect(0, 0, W, H);
            C.osd(g, env, 'PLAY', { play: true });
            return;
        }
        const tt = C.onTwos(t), beat = Motion.pulse(tt, 120, 0, 7);
        g.save();
        g.scale(u, u * (H / W / (H / W))); // logical 1000 wide
        C.sunburst(g, 500, 520, { n: 12, rot: t * 0.35, a: K.purple, b: K.violet });
        // floor band with a zigzag edge
        const zig = [[-20, 1020]];
        for (let i = 0; i <= 20; i++) zig.push([i * 52 - 20, 800 + (i % 2 ? 0 : 26)]);
        zig.push([1020, 1020]);
        C.poly(g, zig, { fill: K.teal, lw: 0 });
        C.confetti(g, t, { seed: 'tpl', n: 16, box: [40, 60, 920, 700], avoid: (x, y) => Math.abs(x - 500) < 330 && y > 200 && y < 640 });
        // the starburst pops on the first beat, then breathes on twos
        const pop = E.pop(tt, 0.5, 0.3);
        if (pop > 0) {
            const s = pop * (1 + 0.04 * beat);
            C.burst(g, 500, 400, { r0: 250 * s, r1: 370 * s, n: 13, seed: 'tpl', rot: C.drawing(t) % 2 ? 0.03 : 0, fill: K.yellow, ink: K.ink, lw: 4, sy: 0.8 });
        }
        // a box lands on the second beat (squash on contact) and hops on every beat after
        const land = 1.0;
        if (tt >= land - 0.25) {
            const fall = E.in(E.seg(tt, land - 0.25, land)), sq = E.bump(tt, land, 0.25) * 0.22, hop = tt > land + 0.3 ? beat * 22 : 0;
            g.save();
            g.translate(500, 800 - (1 - fall) * 700 - hop);
            g.scale(1 + sq, 1 - sq);
            C.box(g, -110, -150, 220, 150, [60, -40], { front: K.pink, top: K.rose, side: K.magenta }, { lw: 4 });
            g.fillStyle = K.ink;
            g.fillRect(-56, -110, 18, 46);
            g.fillRect(38, -110, 18, 46);
            g.restore();
        }
        // the word: each letter its own solid, popping in one after another
        C.text3d(g, 'RADICAL!', 500, 460, {
            size: 190, face: K.white, side: K.ink, side2: K.white, bands: 5, depth: 30, dir: [0.75, 0.66], ow: 5,
            letter: (i) => {
                const at = 1.5 + i * (1 / 12), p = E.pop(tt, at, 0.25);
                return p <= 0 ? { hide: true } : { s: p, rot: (i % 2 ? 1 : -1) * 0.05, dy: -beat * 14 * (i % 2 ? 1 : 0.5) };
            },
        });
        if (tt > 2.2) {
            const r = Motion.rng('tplspark');
            for (let i = 0; i < 5; i++) {
                const x = 120 + r() * 760, y = 120 + r() * 520, ph = Math.floor(r() * 6);
                const on = (C.drawing(t) + ph) % 6;
                if (on < 3) C.sparkle(g, x, y, 16 + on * 9, { color: K.white, ink: K.ink, lw: 2.5 });
            }
        }
        g.restore();
    },

    post(ctx, t, env) {
        Cereal.post(ctx, t, env);
    },
});
