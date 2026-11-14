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
    uses: ['styles/skate-toon/toon.js', DIR + 'cast/drawn.js', ...['kit', 'dot', 'captain'].map((w) => DIR + 'cast/' + w + '-drawn.js'), DIR + 'cast/kit-details.js', DIR + 'cam.js', DIR + 'set.js'],
    fonts: [{ family: 'Bangers', src: 'fonts/Bangers-Regular.ttf' }],
    bpm: 120,
    shots: [[0, 5, 'KIT']],

    draw(g, t, env) {
        const T = SkateToon, C = T.COL, E = Ease;
        const tt = T.onTwos(t);
        const LAND = 2.0, CARD = 2.5, JUMP = 0.75, A = Harbor.AT;
        // the cast stand in the set's world and are sized by its camera (cam.js): Kit, 1.4 m tall,
        // lands 2.6 m from it; her drawing is 700 of its own units from her hair to her soles
        const KXW = -0.12; // a little left of the set's own spot, clear of the pier's board
        const [KX, GY] = Cam.pt([KXW, 0, A.kit[1]]), KS = (Cam.scale(A.kit[1]) * Cam.HEIGHT.kit) / 700;
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

        // Aunt Dot (1.8 m) inside her hut, seen through the hatch, behind her counter: she looks
        // up when the board hits the stone
        const [dX, , dZ] = A.dot.foot, [dx, dy] = Cam.pt(A.dot.foot), ds = (Cam.scale(dZ) * Cam.HEIGHT.dot) / 700;
        const [dw] = Drawn.size('dot', 'stand');
        const dotUp = t >= LAND ? [5, 8, 6, 5][Math.min(3, dl)] : 0;
        g.save();
        g.beginPath();
        A.dot.hatch.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
        g.clip();
        Drawn.draw(g, 'dot', 'stand', dx - (dw / 2) * ds, dy - 706 * ds - dotUp + Math.sin(tt * Math.PI) * 0.8, ds);
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
            const [jw, jh] = Drawn.size('kit', 'jump'), js = KS * 1.02;
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

        // Captain (0.46 m) on the foreground bollard: bored, until the stone shakes. Only the bird
        // of his perch drawing is used: his feet end at y = 531 of it (measured on the sheet),
        // 525 units below his crest, about x = 170; the bollard is the set's
        const hop = t >= LAND ? [-40, -62, -46, -18, 0][Math.min(4, dl)] : 0;
        const [bx, by] = Cam.pt(A.bollard.top), cs = (Cam.scale(A.bollard.top[2]) * Cam.HEIGHT.captain) / 525;
        const [cw] = Drawn.size('captain', 'perch');
        g.save();
        g.translate(bx - 170 * cs, by - 527 * cs + hop);
        g.beginPath();
        g.rect(-40 * cs, -40 * cs, (cw + 80) * cs, 573 * cs);
        g.clip();
        Drawn.draw(g, 'captain', 'perch', 0, 0, cs);
        g.restore();
        g.restore();

        // her name, slammed onto the frame on the next beat
        if (t >= CARD) {
            const dc = since(CARD), k = [0.6, 1.16, 0.95, 1][Math.min(3, dc)];
            g.save();
            g.translate(300, 748);
            g.scale(0.9, 0.9);
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
