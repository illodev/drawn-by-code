// pier-pressure · shot 2 of the opening, «KIT»: the quay of Gull Harbor, quiet; her board drops in
// and clatters to a stop, then Kit herself drops in, lands on it and gives us a thumb as her name
// slams on. 5 s at 120 BPM: the board hits the stone on beat 2 (1.0 s), she lands on beat 4
// (2.0 s), the card on beat 5.
//
// The motion is physics, in the set's own metres (cam.js), then held on twos:
//   · a fall is h = H − g·t²/2 with g = 9.81, so a 2.3 m drop takes 0.68 s (it used to take twice
//     that, and floated); sideways speed is constant in the air;
//   · the board bounces with a restitution of 0.32 (each bounce a tenth as high as the last),
//     loses speed at each hit, then rolls to a stop under friction;
//   · her landing is absorbed by her legs (the upper body comes down over them and springs
//     back, a damped oscillation), not by squashing the drawing; what is loose arrives late:
//     her bunches of hair stream up in the fall and whip down after she stops, the head nods,
//     the arm swings;
//   · Captain's hops are jumps under the same gravity.
// The cast are drawings in code (cast/<who>-drawn.js), posed by cast/kit-act.js.
const DIR = 'sandbox/2026-11-14-pier-pressure/';
Motion.scene({
    fps: 24,
    duration: 5,
    logical: [1600, 900],
    uses: ['styles/skate-toon/toon.js', DIR + 'cast/drawn.js', ...['kit', 'dot', 'captain'].map((w) => DIR + 'cast/' + w + '-drawn.js'), DIR + 'cast/kit-details.js', DIR + 'cast/kit-act.js', DIR + 'cam.js', DIR + 'set.js'],
    fonts: [{ family: 'Bangers', src: 'fonts/Bangers-Regular.ttf' }],
    bpm: 120,
    shots: [[0, 5, 'KIT']],

    draw(g, t, env) {
        const T = SkateToon, C = T.COL, A = Harbor.AT;
        const G = 9.81, H0 = 2.3, TF = Math.sqrt((2 * H0) / G); // the drop: 2.3 m, 0.68 s
        const HIT = 1.0, LAND = 2.0, CARD = 2.5;
        const tw = (at) => at + Math.floor((t - at) * 12 + 1e-6) / 12; // t held on twos, on an event's own clock
        const KZ = A.kit[1], KXW = 0, S = Cam.scale(KZ), KS = (S * Cam.HEIGHT.kit) / 700;
        const at = (X, Y) => Cam.pt([X, Y, KZ]);

        // --- the board ------------------------------------------------------------------------
        // Its flight, three bounces and its roll, worked back from where it must stop: under her
        // left boot. Each stage: [duration, sideways speed at its start, upward speed at its start].
        const E = 0.32, v1 = Math.sqrt(2 * G * H0), BX = KXW + (KitAct.BOARD_DX * KS) / S;
        const stages = [[TF, 1.2, 0], [(2 * E * v1) / G, 0.62, E * v1], [(2 * E * E * v1) / G, 0.36, E * E * v1], [0.34, 0.36, 0]];
        const board = (tt) => {
            let t0 = HIT - TF, x = BX - 0.36 * 0.34 * 0.5 - stages[2][0] * 0.36 - stages[1][0] * 0.62 - TF * 1.2;
            if (tt < t0) return null;
            for (const [i, [dur, vx, vy]] of stages.entries()) {
                const u = tt - t0;
                if (u < dur || i === 3) {
                    if (i === 3) {
                        // rolling: friction takes its speed off evenly, to nothing
                        const k = Math.min(1, u / dur);
                        return { x: x + vx * dur * (k - (k * k) / 2), h: 0, rot: 0, stage: 3, u };
                    }
                    const h = i === 0 ? H0 - (G * u * u) / 2 : vy * u - (G * u * u) / 2;
                    // nose down in the fall, levelling as it comes; a rock on each bounce
                    const rot = i === 0 ? -0.5 * (1 - u / dur) : (i === 1 ? 0.2 : -0.1) * Math.sin((u / dur) * Math.PI);
                    return { x: x + vx * u, h: Math.max(0, h), rot, stage: i, u };
                }
                x += vx * dur;
                t0 += dur;
            }
        };
        const hits = [HIT, HIT + stages[1][0], HIT + stages[1][0] + stages[2][0]]; // when it meets the stone

        // --- Kit --------------------------------------------------------------------------------
        const VX = 2.2, SKID = 0.14; // she comes down almost straight, and her feet slide a hand's width
        const tk = tw(LAND), tau = tk - LAND;
        // after the landing: the legs take it (down fast, back up past standing, settle), and what is
        // loose follows late
        const spring = (x, amp, decay, period) => (x <= 0 ? 0 : amp * Math.exp(-decay * x) * Math.sin((2 * Math.PI * x) / period));
        const crouch = spring(tau, 82, 5.6, 0.74);
        const droop = tau < 0 ? 0 : -0.55 * Math.exp(-11 * tau) + spring(tau - 0.04, 0.62, 4.2, 0.52);
        const nod = spring(tau - 0.06, 0.13, 6, 0.6);
        const slide = tau < 0 ? 0 : SKID * (1 - Math.pow(1 - Math.min(1, tau / 0.3), 2));
        // the thumb arm: down for balance, then up on the card's beat with an overshoot
        const tc = tw(CARD) - CARD;
        const arm = tc < 0 ? -0.5 - 0.45 * Math.exp(-9 * Math.max(0, tau)) - spring(tau, 0.3, 5, 0.5) : -0.5 * Math.exp(-16 * tc) + spring(tc, 0.16, 7, 0.36);
        // and she keeps the beat once she has settled: a breath in the knees, the head
        const beat = Motion.pulse(tw(0), 120, 0, 6), live = Math.min(1, Math.max(0, (tk - LAND - 0.8) / 0.4));

        // --- the frame ----------------------------------------------------------------------------
        // the quay takes her landing: three drawings of shake, drawn a touch bigger so the frame
        // stays covered
        const dl = Math.round(tau * 12);
        g.save();
        if (tau >= 0 && dl < 3) {
            g.translate(800 + [0, 4, -2][dl], 450 + [7, -4, 2][dl]);
            g.scale(1.02, 1.02);
            g.translate(-800, -450);
        }
        Harbor.back(g, env, t);

        // Aunt Dot (1.8 m) inside her hut, behind her counter: the clatter makes her look up
        {
            const [, , dZ] = A.dot.foot, [dx, dy] = Cam.pt(A.dot.foot), ds = (Cam.scale(dZ) * Cam.HEIGHT.dot) / 700, [dw] = Drawn.size('dot', 'stand');
            const up = t < HIT ? 0 : 7 * (1 - Math.exp(-9 * (tw(HIT) - HIT))) + spring(tau, 3, 6, 0.4);
            g.save();
            g.beginPath();
            A.dot.hatch.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
            g.closePath();
            g.clip();
            Drawn.draw(g, 'dot', 'stand', dx - (dw / 2) * ds, dy - 706 * ds - up, ds);
            g.restore();
            Harbor.counter(g, env);
        }

        // a puff of dust: a ring of lumps that spread and shrink (k: 0 at the hit … 1 gone)
        const puff = (X, k, n, size, key) => {
            if (k < 0 || k >= 1) return;
            const [px, py] = at(X, 0);
            for (let i = 0; i < n; i++) {
                const a = Math.PI * (1.05 + (0.9 * i) / (n - 1)), spread = (0.35 + 0.65 * (1 - (1 - k) * (1 - k))) * size * 3.2, r = size * (1 - k) * (0.7 + 0.3 * ((i * 7) % 3) / 2);
                if (r < 2.5) continue; // too small to draw
                const x = px + Math.cos(a) * spread * 1.5, y = py + Math.sin(a) * spread * 0.38 - size * 0.3;
                T.shape(g, [[x - r, y], [x - r * 0.6, y - r * 0.8], [x, y - r * 0.6], [x + r * 0.5, y - r * 0.95], [x + r, y - r * 0.1], [x + r * 0.6, y + r * 0.5], [x - r * 0.4, y + r * 0.55]], { fill: C.white, w: T.LINE_BG, seed: key + i });
            }
        };

        // the board, until she is on it
        const tb = tw(HIT - TF), b = t < LAND ? board(tb) : null;
        if (b) {
            const [bx, by] = at(b.x, b.h);
            KitAct.board(g, bx, by, KS, b.rot);
        }
        for (const [i, h] of hits.entries()) puff(board(h).x, (tw(h) - h) / (0.34 - i * 0.08), 5, 20 - i * 6, 'bd' + i);

        // Kit: in the air, then on the stone
        if (tk >= LAND - TF && tk < LAND) {
            const u = tk - (LAND - TF), h = H0 - (G * u * u) / 2, X = KXW - SKID - VX * (LAND - tk), fall = (G * u) / v1; // 0…1: how fast she is falling
            const [px, py] = at(X, h);
            // (placeholder until her key poses of the drop are drawn: see review.md, round 18)
            KitAct.air(g, px, py, KS * 0.96, { lift: 0.25 + 0.55 * fall, tilt: -0.22 + 0.3 * fall, flail: Math.sin(u * 14) });
        } else if (tk >= LAND) {
            const [px, py] = at(KXW - SKID + slide, 0);
            KitAct.stand(g, px, py, KS, {
                crouch: crouch + live * beat * 2.2, droop: droop + live * Math.sin(tw(0) * Math.PI) * 0.03, nod: nod + live * (beat * 0.02 - 0.01), arm,
                lean: spring(tau, 0.07, 6, 0.6),
            });
            // dust from under her boots, and the marks of the hit for two drawings
            puff(KXW + 0.1, tau / 0.42, 7, 30, 'kd');
            if (dl < 2) for (let i = 0; i < 7; i++) {
                const a = Math.PI * (1.1 + i * 0.133), r0 = 300 + dl * 34, r1 = r0 + 56 - dl * 16;
                T.line(g, [[px + Math.cos(a) * r0 * 1.1, py - 300 + Math.sin(a) * r0], [px + Math.cos(a) * r1 * 1.1, py - 300 + Math.sin(a) * r1]], { w: T.LINE, seed: 'tick' + i });
            }
        }
        Harbor.fore(g, env, t);

        // Captain (0.46 m) on the foreground bollard: a start at the clatter, a bigger one when she
        // lands; each a jump under the same gravity. Only the bird of his perch drawing is used:
        // his feet end at y = 531 of it (measured on the sheet), about x = 170
        {
            const hop = (at0, v) => {
                const u = tw(at0) - at0;
                return u < 0 || u > (2 * v) / G ? 0 : v * u - (G * u * u) / 2;
            };
            const hgt = Math.max(hop(HIT + 1 / 12, 1.15), hop(LAND + 1 / 24, 1.75));
            const top = A.bollard.top, [bx, by] = Cam.pt([top[0], top[1] + hgt, top[2]]), cs = (Cam.scale(top[2]) * Cam.HEIGHT.captain) / 525;
            const [cw] = Drawn.size('captain', 'perch');
            g.save();
            g.translate(bx - 170 * cs, by - 527 * cs);
            g.beginPath();
            g.rect(-40 * cs, -40 * cs, (cw + 80) * cs, 573 * cs);
            g.clip();
            Drawn.draw(g, 'captain', 'perch', 0, 0, cs);
            g.restore();
        }
        g.restore();

        // her name, slammed onto the frame on the next beat
        if (t >= CARD) {
            const dc = Math.round((tw(CARD) - CARD) * 12), k = [0.6, 1.16, 0.95, 1][Math.min(3, dc)];
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
