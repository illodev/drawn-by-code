// pier-pressure · shot 2 of the opening, «KIT»: the quay of Gull Harbor, quiet; Kit drops in
// from the sea wall, her board tumbling beside her, and lands on it in front of us; Captain
// jumps on his bollard, Aunt Dot looks up from her hatch, and Kit's name slams in.
// 5 s at 120 BPM: she lands on beat 4 (2.0 s), the card on beat 5. Drawings on twos, each hit
// on its own clock. The cast are drawings in code (cast/<who>-drawn.js).
const DIR = 'sandbox/2026-11-14-pier-pressure/';
Motion.scene({
    fps: 24,
    duration: 5,
    logical: [1600, 900],
    uses: ['styles/skate-toon/toon.js', DIR + 'cast/drawn.js', ...['kit', 'dot', 'captain'].map((w) => DIR + 'cast/' + w + '-drawn.js'), DIR + 'cast/kit-details.js', DIR + 'set.js'],
    fonts: [{ family: 'Bangers', src: 'fonts/Bangers-Regular.ttf' }],
    bpm: 120,
    shots: [[0, 5, 'KIT']],

    draw(g, t, env) {
        const T = SkateToon, C = T.COL, E = Ease;
        const tt = T.onTwos(t);
        const LAND = 2.0, CARD = 2.5, JUMP = 0.75, GY = 842, KX = 896, KS = 0.98;
        const since = (at) => T.drawing(t, at); // drawings since a hit, on its own clock
        const beat = Motion.pulse(tt, 120, 0, 7);

        // the quay shakes for three drawings when she lands
        const dl = since(LAND);
        g.save();
        if (t >= LAND && dl < 3) {
            // (drawn a touch bigger while it shakes, so the frame's edges stay covered)
            g.translate(800 + [0, 7, -4][dl], 450 + [14, -8, 4][dl]);
            g.scale(1.04, 1.04);
            g.translate(-800, -450);
        }
        Harbor.back(g, env, t);

        // Aunt Dot in her hatch: she looks up when the board hits the stone
        g.save();
        g.beginPath();
        g.rect(30, 366, 236, 150);
        g.clip();
        const dotUp = t >= LAND ? [10, 16, 12, 10][Math.min(3, dl)] : 0;
        Drawn.draw(g, 'dot', 'stand', 20, 398 - dotUp + Math.sin(tt * Math.PI) * 1.5, 0.52);
        g.restore();
        Harbor.counter(g, env);

        // the board: tumbling beside her in the air, then under her foot (it is part of her
        // standing drawing, so the same drawing lands)
        const [sw, sh] = Drawn.size('kit', 'stand'), FEET = 708;
        const u = E.seg(t, JUMP, LAND);
        if (t >= JUMP && t < LAND) {
            const uu = Math.floor(u * 13) / 13; // the fall is on twos too
            const bx = E.lerp(470, KX - 60, uu), by = E.lerp(-120, GY - 40, uu * uu);
            g.save();
            g.translate(bx, by);
            g.rotate(-2.2 * (1 - uu) * Math.PI);
            Drawn.draw(g, 'kit', 'stand', -200 * KS, -650 * KS, KS, { only: ['board'] });
            g.restore();
            // Kit herself: in from the top left, falling faster as she comes
            const [jw, jh] = Drawn.size('kit', 'jump'), js = 1;
            const kx = E.lerp(250, KX + 30, uu), ky = E.lerp(-400, GY - 360, uu * uu);
            const fl = (ph, amp) => Math.sin(tt * Math.PI * 4 + ph) * amp;
            g.save();
            g.translate(kx, ky);
            g.rotate(E.lerp(-0.3, 0.1, uu));
            Drawn.draw(g, 'kit', 'jump', (-jw / 2) * js, (-jh / 2) * js, js, {
                parts: {
                    head: { at: [312, 296], rot: fl(0, 0.04) },
                    armL: { at: [196, 300], rot: fl(1.2, 0.1) },
                    armR: { at: [436, 276], rot: fl(2.4, 0.09) },
                    bootNear: { at: [478, 400], rot: fl(0.6, 0.04) },
                    bootFar: { at: [262, 452], rot: fl(3, 0.07) },
                },
            });
            g.restore();
        }
        if (t >= LAND) {
            // landed: a squash, a stretch, a settle; then she keeps the beat
            const [qx, qy] = [[1.24, 0.7], [1.1, 0.88], [0.93, 1.08], [1.02, 0.98]][dl] ?? [1, 1 - beat * 0.018];
            const idle = dl >= 4 ? 1 : 0;
            g.save();
            g.translate(KX, GY);
            g.scale(qx, qy);
            Drawn.draw(g, 'kit', 'stand', (-sw / 2) * KS, -FEET * KS, KS, {
                parts: {
                    head: { at: [268, 244], rot: idle * Math.sin(tt * Math.PI) * 0.035, dy: idle * beat * 2 },
                    armL: { at: [196, 300], rot: idle * (-0.1 + beat * 0.2) },
                    armR: { at: [330, 300], rot: idle * Math.sin(tt * Math.PI + 1) * 0.03 },
                },
            });
            g.restore();
            // dust from under the wheels and impact ticks, for five drawings
            if (dl < 5) {
                const k = dl / 4;
                for (const [i, [dx, dy, r]] of [[-170, -6, 34], [-120, -34, 24], [150, -4, 32], [110, -30, 22], [-40, 6, 20], [40, 8, 18]].entries()) {
                    const x = KX + dx * (0.55 + 0.6 * k), y = GY + dy * (0.6 + 0.8 * k) - 10 * k, rr = r * (1.05 - 0.75 * k);
                    T.shape(g, [[x - rr, y], [x - rr * 0.6, y - rr * 0.8], [x, y - rr * 0.6], [x + rr * 0.5, y - rr * 0.95], [x + rr, y - rr * 0.1], [x + rr * 0.6, y + rr * 0.5], [x - rr * 0.4, y + rr * 0.55]], { fill: C.white, w: T.LINE_BG, seed: 'dust' + i });
                }
                if (dl < 2) for (let i = 0; i < 7; i++) {
                    const a = Math.PI * (1.08 + i * 0.14), r0 = 250 + dl * 30, r1 = r0 + 54 - dl * 14;
                    T.line(g, [[KX + Math.cos(a) * r0 * 1.15, GY - 120 + Math.sin(a) * r0], [KX + Math.cos(a) * r1 * 1.15, GY - 120 + Math.sin(a) * r1]], { w: T.LINE, seed: 'tick' + i });
                }
            }
        }
        Harbor.fore(g, env, t);

        // Captain on the bollard at the quay's corner: bored, until the stone shakes
        const hop = t >= LAND ? [-46, -70, -52, -20, 0][Math.min(4, dl)] : 0;
        const [cw, ch] = Drawn.size('captain', 'perch'), cs = 0.5;
        // one drawing, cut at his feet: the bollard stays where the set's stands, the bird leaves it
        const cx = 1508 - (cw / 2) * cs, cy = 900 - ch * cs, FEETLINE = cy + 606 * cs;
        for (const [y0, y1, dy] of [[FEETLINE - 2, 900, 0], [cy - 80, FEETLINE, hop]]) {
            g.save();
            g.translate(0, dy);
            g.beginPath();
            g.rect(cx - 40, y0, cw * cs + 80, y1 - y0);
            g.clip();
            Drawn.draw(g, 'captain', 'perch', cx, cy + (dy ? 0 : Math.sin(tt * Math.PI) * 0), cs);
            g.restore();
        }
        g.restore();

        // her name, slammed onto the frame on the next beat
        if (t >= CARD) {
            const dc = since(CARD), k = [0.6, 1.16, 0.95, 1][Math.min(3, dc)];
            g.save();
            g.translate(330, 730);
            g.rotate(-0.07 + [0.1, -0.03, 0.01, 0][Math.min(3, dc)]);
            g.scale(k, k);
            T.slab(g, [[-190, -104], [186, -118], [198, 70], [-182, 86]], { fill: C.magenta, seed: 'card', over: 2.4, w: T.LINE * 1.2 });
            T.slab(g, [[-174, -90], [171, -103], [182, 56], [-167, 71]], { fill: null, seed: 'card-rule', over: 0.5, w: T.LINE_FINE, color: C.roadLine });
            T.sign(g, 'KIT', 4, 44, { size: 188, fill: C.roadLine, drop: C.navy, seed: 'card-name', w: T.LINE * 1.1, track: 0.06, tilt: 0.05 });
            T.slab(g, [[-150, 62], [158, 50], [162, 104], [-146, 116]], { fill: C.white, seed: 'card-sub', over: 1.6, w: T.LINE });
            T.sign(g, 'FIRST ONE DOWN', 6, 102, { size: 44, fill: C.red, seed: 'card-role', w: T.LINE_FINE * 0.8, track: 0.03, tilt: 0.03, outline: C.white });
            g.restore();
        }
    },
});
