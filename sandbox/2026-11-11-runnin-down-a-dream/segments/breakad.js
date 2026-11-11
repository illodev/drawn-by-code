// «We'll be right back», bars 63–72 (89.33–103.42 s): the tape cuts to a commercial break, and
// the commercial is the Devil's own. The film's style reference, a '90s cereal spot, quoted as
// a form: a bumper, a drab «before», a pitchman through a starburst, a product shot, cash, a
// phone number, an end card; the song's «ooh» backing voices are its jingle choir.
//   bars 63–64  Bumper        WE'LL BE RIGHT BACK! bounces in over an imp waving from a cloud
//   bar 65      Empty         a grey kitchen of Hell: an imp shakes his piggy bank, moths fly out
//   bar 66      Burst         the Devil bursts in through a starburst and the grey snaps to colour
//   bar 67      Souls wanted  the product shot: a star in a jar; the imp holds up his own
//   bar 68      Cash paid     the jar goes in the crate, a banknote comes off the fan, coins rain
//   bars 69–70  Phone         he points out 1-800-666; the phone does not ring: a web, a spider
//   bars 71–72  End card      the lock-up; an imp holds up a cue card with nothing on it
// Props and sets are in breakad-props.js (BreakAd). draw() is a pure function of t over the
// whole range (the next block plays this tape backwards).
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, A = BreakAd, TAU = Math.PI * 2;
    const twos = S.twos, b = S.b, B = S.B, pop = S.pop;
    const T0 = B(63), T1 = B(73), n0 = 252; // the first beat of bar 63
    const at = (k) => b(n0 + k); // beat k of this segment (0–39)
    const CUT = { empty: B(65), burst: B(66), souls: B(67), cash: B(68), phone: B(69), card: B(71) };
    const on = (t, a) => t >= a - 1e-6;
    const bump = (t, a, dur = 0.3) => {
        const v = E.bump(twos(t, a), a, dur);
        return v < 1e-6 ? 0 : v; // sin(π) is not quite 0
    };
    const seg = (t, a, c) => E.seg(twos(t, a), a, c);
    const line = (g, pts, color, lw) => C.poly(g, pts, { ink: color, lw, close: false });
    const WHITE = { face: K.white, side: K.ink, side2: K.white, bands: 4 }, GOLD = { face: K.yellow, side: K.red, side2: K.orange, bands: 3 };

    // --- shared pieces -------------------------------------------------------------------
    // the size at which `text` is `width` wide
    const fit = (g, text, font, width) => {
        g.save();
        g.font = `100px "${font}"`;
        const w = [...text].reduce((a, c) => a + g.measureText(c).width, 0);
        g.restore();
        return (width / w) * 100;
    };
    // Extruded Anton words, as the film's title: each letter lands on its `when` and hops.
    function word(g, t, text, x, y, size, when, style, hop = null) {
        C.text3d(g, text, x, y, {
            size, dir: [0.72, 0.7], depth: size * 0.13, ow: 2.4 + size * 0.011, track: size * 0.01, ...style,
            letter: (i) => {
                const p = pop(t, when(i), 0.25);
                return p <= 0 ? { hide: true } : { s: p, rot: (i % 2 ? 1 : -1) * 0.035, dy: hop ? hop(i) : 0 };
            },
        });
    }
    // The stage: a floor band with a zigzag lip, in front of the backdrop.
    function floor(g, y, fill, zig) {
        const lip = [[-40, 1040]];
        for (let i = 0; i <= 22; i++) lip.push([i * 50 - 50, y + (i % 2 ? 0 : 24)]);
        lip.push([1040, 1040]);
        C.poly(g, lip, { fill, lw: 0 });
        line(g, lip.slice(1, -1), K.ink, 5);
        line(g, lip.slice(1, -1).map(([x, yy]) => [x, yy + 34]), zig, 7);
    }
    // A starburst that pops in at `a0`, breathes on the beat and ticks on twos.
    function starburst(g, t, x, y, r0, r1, a0, o = {}) {
        const P = S.pulseAt(t), p = pop(t, a0, 0.3) * (1 + 0.035 * P.pulse);
        if (p <= 0) return;
        C.burst(g, x, y, { r0: r0 * p, r1: r1 * p, n: 14, jitter: 0.16, seed: 'ad', rot: C.drawing(t, a0) % 4 < 2 ? 0 : 0.035, fill: K.yellow, ink: K.ink, lw: 5, sy: 0.9, ...o });
    }
    // Something thrown from p to q, leaving at a0 and landing dur later: [x, y, u]
    const toss = (t, a0, dur, p, q, lift) => {
        const u = seg(t, a0, a0 + dur);
        return [E.lerp(p[0], q[0], u), E.lerp(p[1], q[1], u) - Math.sin(u * Math.PI) * lift, u];
    };
    // Paint fn drained of colour outside a circle of radius R round (cx, cy): R 0 is all grey,
    // Infinity all colour. The drab «before» of the spot, and the wave that ends it.
    const GREY = 'saturate(0.06) brightness(1.32) contrast(0.8)';
    function drained(g, env, name, R, cx, cy, fn) {
        if (R === Infinity) return fn(g);
        const lay = Motion.layer(env, name, fn);
        g.save();
        g.beginPath();
        g.rect(-50, -50, 1100, 1100);
        if (R > 0) g.arc(cx, cy, R, 0, TAU);
        g.clip('evenodd');
        g.filter = GREY;
        Motion.drawLayer(g, env, lay);
        g.restore();
        if (R > 0) {
            g.save();
            g.beginPath();
            g.arc(cx, cy, R, 0, TAU);
            g.clip();
            Motion.drawLayer(g, env, lay);
            g.restore();
        }
    }

    // --- the jingle's choir ----------------------------------------------------------------
    // Three imps in yellow bow ties sing the song's «ooh»s: round mouths while Song.backing(t),
    // swaying together from one beat to the next, the outer mitts up through every other bar
    // (the long notes). o: { stack (a pyramid: one standing on the heads of two), gap, from (they start
    // singing then), looks, notes (how high their notes rise, in imps; 0: none) }
    function bowTie(g, x, y, s, pose) {
        const q = pose.squash ?? 0;
        g.save();
        g.translate(x, y);
        g.rotate(pose.tilt ?? 0);
        g.translate(0, -(pose.hop ?? 0) * s);
        g.scale(s * (1 + q), s * (1 - q));
        g.lineJoin = 'round';
        const L = 3 / s;
        for (const sx of [-1, 1]) C.poly(g, [[sx * 0.02, -0.262], [sx * 0.16, -0.31], [sx * 0.17, -0.19], [sx * 0.02, -0.238]], { fill: K.yellow, lw: L * 0.9 });
        g.beginPath();
        g.roundRect(-0.035, -0.283, 0.07, 0.066, 0.012);
        g.fillStyle = K.gold;
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = L * 0.9;
        g.stroke();
        g.restore();
    }
    function choir(g, t, x, y, s, o = {}) {
        const { stack = false, gap = 0.96, from = T0, looks = [0.4, 0, -0.4], notes = 1 } = o;
        const P = S.pulseAt(t), bar = Math.floor(P.k / 4), b0 = B(bar), there = on(t, from), sing = there && S.backing(t);
        const side = P.k % 2 ? 1 : -1, sway = there ? side * 0.07 * (2 * E.out(Math.min(1, P.since / 0.45)) - 1) : 0;
        const k = E.out(seg(t, Math.max(b0, from), Math.max(b0, from) + 2 / 12)), up = !there ? 0 : bar % 2 === 0 ? k : 1 - k;
        const spots = stack ? [[0.04 + Math.sin(sway) * 1.0, -1.0, 1], [-0.54, 0, 0], [0.54, 0, 2]] : [[-gap, 0, 0], [0, 0, 1], [gap, 0, 2]];
        for (const [dx, dy, i] of spots) {
            const pose = { mood: sing ? 'awe' : 'grin', look: looks[i], tilt: sway, upL: i === 0 ? up : 0, upR: i === 2 ? up : 0, wear: i === 0 ? 'specs' : null, squash: 0.03 * P.pulse, tail: 0.05 * side * (i === 1 ? -1 : 1) };
            A.imp(g, x + dx * s, y + dy * s, s, pose);
            bowTie(g, x + dx * s, y + dy * s, s, pose);
        }
        // what they sing: a note off the top of the choir on every beat
        if (!notes) return;
        const top = y - (stack ? 2.3 : 1.3) * s;
        for (let n = P.k - 2; n <= P.k; n++) {
            const a0 = b(n), u = seg(t, a0, a0 + 0.8);
            if (!on(a0, from) || !S.backing(a0) || u <= 0 || u >= 1) continue;
            const sd = n % 2 ? 1 : -1, sz = s * 0.19 * Math.min(1, u * 5) * (u > 0.75 ? (1 - u) * 4 : 1);
            C.note(g, x + sd * (0.5 + 0.5 * u) * s * (stack ? 0.5 : 1), top - u * notes * s + Math.sin(u * 8 + n) * 5, sz, { kind: n % 3 ? 1 : 2, color: n % 2 ? K.white : K.yellow, lw: 2.6, rot: sd * 0.15 });
        }
    }

    // =========================================================================================
    // Bars 63–64 · the bumper
    // =========================================================================================
    const STARS = [[112, 262, 20, 0], [186, 122, 13, 3], [896, 318, 17, 5], [110, 470, 13, 6], [900, 486, 15, 2], [146, 640, 17, 4], [866, 650, 13, 7], [258, 752, 11, 2], [748, 762, 12, 5], [98, 786, 12, 1], [908, 806, 11, 3], [680, 104, 10, 6]];
    const crescent = (cx, cy, R, ox, oy, r) => {
        const aC = Math.atan2(oy, ox), N = 72, out = [], inn = [];
        for (let i = 0; i <= N; i++) {
            const a = aC + (i / N) * TAU, p = [cx + R * Math.cos(a), cy + R * Math.sin(a)], q = [cx + ox + r * Math.cos(a), cy + oy + r * Math.sin(a)];
            if (Math.hypot(p[0] - cx - ox, p[1] - cy - oy) >= r) out.push(p);
            if (Math.hypot(q[0] - cx, q[1] - cy) <= R) inn.push(q);
        }
        return [...out, ...inn.reverse()];
    };
    function bumper(g, t) {
        const P = S.pulseAt(t), d = C.drawing(t, T0), ph = P.k + P.since;
        g.fillStyle = '#33288f';
        g.fillRect(0, 0, 1000, 1000);
        // far stars: dots that never move
        const r = Motion.rng('bump-dots');
        for (let i = 0; i < 70; i++) {
            const x = 30 + r() * 940, y = 30 + r() * 800, rad = 1.6 + r() * 2.6, c = r();
            if (x > 150 && x < 850 && y > 70 && y < 600) continue;
            A.disc(g, x, y, rad, c < 0.5 ? '#8f86e8' : c < 0.8 ? K.aqua : K.white, 0);
        }
        // the moon, a sliver tonight
        C.poly(g, crescent(868, 158, 42, 18, -12, 37), { fill: K.cream, lw: 3.2 });
        // a bank of night clouds along the bottom, in two rows
        for (const [cx, cy, cs] of [[60, 880, 120], [330, 912, 150], [640, 905, 140], [930, 884, 125]]) A.cloud(g, cx, cy, cs, { fill: '#4b3fc0', under: '#3f34ad', base: 1.2 });
        for (const [cx, cy, cs] of [[190, 962, 130], [800, 968, 140]]) A.cloud(g, cx, cy, cs, { fill: '#6558de', under: '#574acd', base: 1 });
        // the stars twinkle, each on its own count
        STARS.forEach(([x, y, rad, phs], i) => {
            const tw = [1, 0.72, 0.42, 0.72][Math.floor((d + phs * 3) / 2) % 4];
            C.sparkle(g, x, y, rad * 1.7 * tw, { color: i % 3 === 1 ? K.yellow : K.white, ink: K.ink, lw: 2.5, rot: tw < 0.5 ? 0.4 : 0 });
        });
        // the imp on his cloud: it floats, he waves on the beat
        const ap = pop(t, T0, 0.3), cy = 852 + Math.sin((t - T0) * 2.3) * 7, wav = on(t, T0 + 0.25) ? P.pulse : 0;
        g.save();
        g.translate(500, 900);
        g.scale(ap, ap);
        g.translate(-500, -900);
        A.cloud(g, 500, cy, 132);
        A.imp(g, 506, cy - 4, 166, { upR: 0.72 + 0.42 * wav, upL: 0, tilt: 0.06 * (P.k % 2 ? 1 : -1) * wav, mood: 'grin', wear: 'bow', tail: 0.06 * Math.sin(ph * Math.PI), shadow: false, squash: 0.03 * P.pulse });
        A.cloud(g, 500, cy + 32, 112, { lobes: [[-0.86, 0.04, 0.3], [-0.32, -0.05, 0.36], [0.3, -0.07, 0.38], [0.86, 0.04, 0.3]], base: 0.34 });
        g.restore();
        // the words: chunky round letters, a word a beat, each letter a frame after the last
        const hop = (i) => (on(t, at(3)) ? -10 * P.pulse * ((i + P.k) % 2 ? 1 : 0.3) : 0);
        const row = (text, y, size, when, arc = 0) => C.text3d(g, text, 500, y, {
            size, font: 'Titan One', face: K.yellow, side: K.magenta, side2: K.pink, bands: 2, depth: size * 0.12, dir: [0.6, 0.8], ow: 2.6 + size * 0.012, track: size * 0.015,
            letter: (i, ch, n) => {
                const p = pop(t, when(i), 0.25);
                if (p <= 0) return { hide: true };
                const u = (i / (n - 1)) * 2 - 1;
                return { s: p, rot: (i % 2 ? 1 : -1) * 0.045 + arc * u * 0.55, dy: hop(i) + arc * u * u * size * 0.42 - (1 - Math.min(1, p)) * 60 };
            },
        });
        row("WE'LL BE", 204, 112, (i) => at(0) + (i < 5 ? i : i - 1) / 24, 0.3);
        row('RIGHT', 380, 172, (i) => at(1) + i / 24);
        row('BACK!', 556, 172, (i) => at(2) + i / 24);
        // the fourth beat: a glint on the exclamation mark
        const gl = bump(t, at(3), 0.4);
        if (gl > 0) C.sparkle(g, 742, 432, 16 + 46 * gl, { color: K.white, ink: K.ink, lw: 3, rot: 0.2 + 0.4 * gl });
    }

    // =========================================================================================
    // Bar 65 · the cold open: a grey kitchen, an empty piggy bank
    // =========================================================================================
    const FLOOR = 846; // the stage's lip in the studio shots
    function empty(g, t, env) {
        const e = (k) => at(8 + k);
        drained(g, env, 'ad-bg', 0, 0, 0, (c) => {
            A.kitchen(c, t);
            const IX = 372, IY = 892, IS = 190, PS = 216;
            // he shakes it at his ear, twice on the beat; then looks into it, and sags
            let rock = 0;
            for (const h of [e(0), e(1)]) {
                const j = Math.floor((t - h) * 12 + 1e-6);
                if (j >= 0 && j < 4) rock = [1, -1, 0.6, -0.3][j];
            }
            const low = E.out(seg(t, e(2), e(2) + 3 / 12)), sag = E.out(seg(t, e(3), e(3) + 2 / 12));
            const pose = { mood: 'oops', look: on(t, e(3)) ? 0 : 1, upL: 0, upR: 1.02 + 0.13 * rock - 0.1 * low, tilt: 0.035 * rock - 0.02 * sag, squash: 0.08 * sag, tail: -0.07 * sag };
            A.imp(c, IX, IY, IS, pose);
            const m = A.impMitt(IX, IY, IS, pose, 1), pa = 0.2 * rock + 0.16 * low;
            const pc = [m[0] + PS * 0.2 - Math.sin(pa) * PS * 0.3, m[1] - PS * 0.415 + 4];
            A.pig(c, pc[0], pc[1], PS, { ang: pa });
            // the moths: out of the slot, off to the sides and up
            const slot = [pc[0] - 4 + Math.sin(pa) * PS * 0.33, pc[1] - PS * 0.33];
            [[e(1), 1], [e(1) + 2 / 12, -1], [e(2), 1], [e(2) + 3 / 12, -1]].forEach(([m0, dir], i) => {
                if (!on(t, m0)) return;
                const u = (twos(t, m0) - m0) / 1.5, md = Math.floor((t - m0) * 12 + 1e-6);
                const x = slot[0] + dir * (10 + 330 * u + 14 * i) + 22 * Math.sin(u * 16 + i * 2);
                const y = slot[1] - 34 * Math.min(1, u * 8) - 560 * u + 18 * Math.cos(u * 21 + i);
                A.moth(c, x, y, 64, [0, 1, 2, 1][md % 4], dir * (0.3 + 0.2 * Math.sin(u * 9)));
            });
            A.table(c, 800, 948, 240);
        });
    }

    // =========================================================================================
    // Bar 66 · the Devil bursts in and the grey snaps to colour
    // =========================================================================================
    function burstIn(g, t, env) {
        const u = (k) => at(12 + k), P = S.pulseAt(t), d = C.drawing(t, CUT.burst), ph = P.k + P.since;
        const BX = 384, BY = 552, DS = 196, DY = 908;
        // the colour: nothing until the snare, then a ring that takes the frame in four drawings
        const wj = Math.floor((t - u(1)) * 12 + 1e-6), R = wj < 0 ? 0 : [200, 470, 800, 1150][wj] ?? Infinity;
        drained(g, env, 'ad-bg', R, BX, BY, (c) => {
            c.save();
            c.translate(560, 640);
            c.scale(1.18, 1.18);
            c.translate(-590, -640);
            A.kitchen(c, t);
            c.restore();
            // what was the wall: tiles on their way out
            const tt = twos(t, u(0)) - u(0) + 1 / 12;
            if (tt < 0.75) {
                for (let i = 0; i < 9; i++) {
                    const r = Motion.rng('chunk' + i), a = -Math.PI * (0.06 + (0.88 * (i + r() * 0.7)) / 9), v = 560 + r() * 300, sz = 20 + r() * 16;
                    const x = BX + Math.cos(a) * v * tt, y = BY - 40 + Math.sin(a) * v * tt + 1000 * tt * tt, ro = d * 0.7 + i;
                    C.poly(c, [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([px, py]) => [x + (px * Math.cos(ro) - py * Math.sin(ro)) * sz, y + (px * Math.sin(ro) + py * Math.cos(ro)) * sz]), { fill: i % 2 ? A.KIT.tileA : A.KIT.tileB, lw: 3.2 });
                }
            }
        });
        // the starburst he comes through
        const bp = pop(t, u(0), 0.3) * (1 + 0.035 * P.pulse), tick = d % 4 < 2 ? 0 : 0.035;
        C.burst(g, BX, BY, { r0: 214 * bp, r1: 306 * bp, n: 15, seed: 'in', jitter: 0.18, rot: tick, fill: K.yellow, ink: K.ink, lw: 5 });
        C.burst(g, BX, BY, { r0: 150 * bp, r1: 216 * bp, n: 13, seed: 'in2', jitter: 0.18, rot: 0.22 - tick, fill: K.white, ink: K.ink, lw: 3.2 });
        // in front: the imp (he drops the pig), the table, the choir that comes up behind it
        drained(g, env, 'ad-fg', R, BX, BY, (c) => {
            const IX = 122, IY = 940, IS = 118, PS = 112;
            const startle = bump(t, u(0), 0.3), joy = on(t, u(3)) ? Math.abs(Math.sin(seg(t, u(3), u(3) + S.BEAT) * Math.PI)) : 0;
            const arm = on(t, u(3)) ? E.out(seg(t, u(3), u(3) + 2 / 12)) : 1 - E.out(seg(t, u(0), u(0) + 4 / 12));
            A.imp(c, IX, IY, IS, { mood: on(t, u(2)) ? 'grin' : 'awe', look: 1, hop: 0.28 * startle + 0.3 * joy, upL: on(t, u(3)) ? arm : 0, upR: arm, squash: 0.03 * P.pulse, tail: 0.05 * Math.sin(ph * Math.PI) });
            const fu = E.in(seg(t, u(0) - 1 / 12, u(0) + 3 / 12)), bounce = bump(t, u(0) + 3 / 12, 0.25);
            A.pig(c, E.lerp(IX + 130, 254, fu), E.lerp(IY - 1.75 * IS, 936 - 0.43 * PS, fu) - 16 * bounce, PS, { ang: -1.2 * (1 - fu) });
            // the choir rises behind the table when the colour comes
            const rise = pop(t, u(1), 0.3);
            if (rise > 0) {
                c.save();
                c.beginPath();
                c.rect(560, 0, 440, 771);
                c.clip();
                c.translate(0, (1 - rise) * 280);
                choir(c, t, 796, 780, 88, { gap: 1.03, from: u(1), looks: [-0.8, -0.8, -0.8] });
                c.restore();
            }
            A.table(c, 776, 966, 322);
        });
        if (R > 0 && R < Infinity) {
            g.beginPath();
            g.arc(BX, BY, R, 0, TAU);
            g.strokeStyle = K.ink;
            g.lineWidth = 16;
            g.stroke();
            g.strokeStyle = K.white;
            g.lineWidth = 8;
            g.stroke();
        }
        // the Devil: he lands on the cut, arms wide; the tooth gleams; he turns to the imp
        const land = u(0) + 2 / 12, fall = 1 - E.out(seg(t, u(0) - 1 / 12, land)), pitch = E.out(seg(t, u(3), u(3) + 2 / 12));
        const pose = {
            mood: on(t, u(3)) ? 'sly' : on(t, u(2)) ? 'grin' : 'laugh', look: on(t, u(3)) ? -1 : 0, lean: -0.07 * pitch, headTilt: -0.04 * pitch,
            squash: 0.16 * bump(t, land, 0.25) + (on(t, land + 0.25) ? 0.045 * P.pulse : 0) - 0.1 * fall, tail: 0.05 * Math.sin(ph * Math.PI),
            handR: [E.lerp(-0.86, -0.78, pitch), E.lerp(-1.14, -0.66, pitch)], handL: [E.lerp(0.86, 0.6, pitch), E.lerp(-1.14, -0.56, pitch)], shadow: fall < 0.5,
        };
        const sc = 0.72 + 0.28 * (1 - fall);
        g.save();
        g.translate(BX, DY - fall * 150);
        g.scale(sc, sc);
        Devil.draw(g, 0, 0, DS, pose);
        // the gold tooth: ting
        const gl = bump(t, u(2), 0.42);
        if (gl > 0) A.onHead(g, 0, 0, DS, pose, (L) => C.sparkle(g, A.TOOTH[0], A.TOOTH[1], 0.07 + 0.3 * gl, { color: K.white, ink: K.ink, lw: L, rot: 0.2 + 0.5 * gl }));
        g.restore();
    }

    // =========================================================================================
    // Bar 67 · the product shot: SOULS WANTED
    // =========================================================================================
    const CUST = { x: 150, y: 914, s: 146 }; // the customer imp, in the two shots of the offer
    function soulsWanted(g, t) {
        const s_ = (k) => at(16 + k), P = S.pulseAt(t), d = C.drawing(t, CUT.souls), ph = P.k + P.since;
        C.sunburst(g, 500, 600, { n: 12, rot: t * 0.3, a: K.purple, b: '#9361f0' });
        C.memphis(g, t, [['ring', 92, 380, 50, 0, K.aqua], ['zig', 104, 520, 56, -0.5, K.yellow], ['squiggle', 884, 372, 42, 0.5, K.white], ['tri', 912, 500, 44, -0.3, K.pink], ['cross', 236, 346, 36, 0.5, K.pink], ['dots', 760, 330, 54, 0.3, K.aqua]]);
        starburst(g, t, 506, 580, 214, 292, CUT.souls, { seed: 'jar' });
        floor(g, FLOOR, K.navy, K.pink);
        choir(g, t, 808, 914, 104, { stack: true, looks: [0.6, -0.5, -0.6] });
        // the pedestal and the product on it
        C.box(g, 386, 756, 232, 180, [36, -24], { front: K.pink, top: K.rose, side: K.magenta }, { lw: 3.2 });
        line(g, Array.from({ length: 9 }, (_, i) => [400 + i * 25.5, 836 + (i % 2 ? -12 : 12)]), K.yellow, 6);
        const jp = pop(t, CUT.souls, 0.3) * (1 + 0.03 * P.pulse);
        A.jar(g, 516, 746, 372 * jp, { bob: Math.cos(ph * Math.PI), tw: Math.floor(d / 2) });
        // it sparkles on every beat
        [[330, 470], [704, 420], [340, 660], [690, 640]].forEach(([x, y], i) => {
            const k = bump(t, s_(i), 0.36);
            if (k > 0) C.sparkle(g, x, y, 12 + 32 * k, { color: K.white, ink: K.ink, lw: 2.6, rot: 0.3 * k });
        });
        // the imp from the kitchen comes up with a jar of his own
        const cp = pop(t, s_(2), 0.3);
        if (cp > 0) {
            const hopC = on(t, s_(3)) ? 0.22 * bump(t, s_(3), 0.3) : 0, pose = { mood: 'awe', look: 1, upR: 1, upL: 0, hop: hopC, squash: 0.03 * P.pulse, tail: 0.05 * Math.sin(ph * Math.PI) };
            const y = CUST.y + (1 - cp) * 420;
            A.imp(g, CUST.x, y, CUST.s, pose);
            const m = A.impMitt(CUST.x, y, CUST.s, pose, 1);
            A.jar(g, m[0], m[1] + 2, 88, { bob: Math.sin(ph * Math.PI), tw: Math.floor(d / 2) + 1 });
        }
        const hop = (i) => (on(t, s_(1) + 0.3) ? -9 * P.pulse * ((i + P.k) % 2 ? 1 : 0.35) : 0);
        word(g, t, 'SOULS WANTED', 500, 232, fit(g, 'SOULS WANTED', 'Anton', 770), (i) => (i < 5 ? s_(0) : s_(1)), WHITE, hop);
    }

    // =========================================================================================
    // Bar 68 · CASH PAID
    // =========================================================================================
    // Coins tossed from `from` on every beat in `beats`: up, out to the right and down.
    function coins(g, t, beats, from) {
        beats.forEach((t0, w) => {
            const r = Motion.rng('toss' + w);
            for (let i = 0; i < 6; i++) {
                const a = ((-94 + (i + r() * 0.8) * 11) * Math.PI) / 180, v = 760 + r() * 230, rad = 19 + r() * 8, td = t0 + Math.round(r() * 2) / 24;
                if (!on(t, td)) continue;
                const tt = twos(t, td) - td + 1 / 24, y = from[1] + Math.sin(a) * v * tt + 1250 * tt * tt;
                if (y < 1040) A.coin(g, from[0] + Math.cos(a) * v * tt * 0.72, y, rad, Math.floor(tt * 14 + i));
            }
        });
    }
    function cashPaid(g, t) {
        const c_ = (k) => at(20 + k), P = S.pulseAt(t), d = C.drawing(t, CUT.cash), ph = P.k + P.since;
        const DX = 484, DY = 908, DS = 204, CR = [306, 918, 124, 86];
        C.sunburst(g, 500, 620, { n: 12, rot: t * 0.3, a: '#ff4fa5', b: '#ff86c3' });
        C.memphis(g, t, [['ring', 90, 420, 50, 0, K.aqua], ['squiggle', 98, 560, 44, -0.5, K.yellow], ['zig', 894, 400, 54, 0.4, K.navy], ['cross', 760, 384, 36, 0.5, K.purple], ['dots', 912, 540, 56, 0.3, K.white]]);
        starburst(g, t, DX, 640, 232, 318, CUT.cash, { fill: K.teal, seed: 'cash' });
        floor(g, FLOOR, K.navy, K.yellow);
        choir(g, t, 822, 914, 100, { stack: true, looks: [-0.6, -0.5, -0.6] });
        // the crate of souls; the imp's jar goes into it on the third beat
        const jt = seg(t, c_(2), c_(2) + 3 / 12);
        A.crateBack(g, ...CR);
        A.jar(g, CR[0] - 30, CR[1] - 40, 76, { bob: Math.sin(ph * Math.PI), tw: Math.floor(d / 2) });
        A.jar(g, CR[0] + 34, CR[1] - 44, 76, { bob: -Math.sin(ph * Math.PI), tw: Math.floor(d / 2) + 1 });
        if (jt >= 1) A.jar(g, CR[0] + 4, CR[1] - 34 + 6 * bump(t, c_(2) + 3 / 12, 0.2), 84, { bob: Math.cos(ph * Math.PI), tw: Math.floor(d / 2) });
        A.crateFront(g, ...CR);
        // the Devil: the fan snaps open, a note comes off it on the fourth beat
        const paid = on(t, c_(3)), fo = pop(t, CUT.cash, 0.25), q = 0.045 * P.pulse;
        const hR = [-0.78, -1.0], pose = { mood: 'laugh', squash: q, tail: 0.05 * Math.sin(ph * Math.PI), handR: hR, handL: [0.72, -0.86 - 0.14 * P.pulse], headTilt: 0.03 * (P.k % 2 ? 1 : -1) };
        const fanAt = [DX + hR[0] * DS * (1 + q), DY + hR[1] * DS * (1 - q)];
        Devil.draw(g, DX, DY, DS, pose);
        A.fan(g, fanAt[0] - 2, fanAt[1] - 22, 116, fo, paid ? 4 : 5, 0.06);
        // his mitt over the foot of the fan
        A.onBody(g, DX, DY, DS, pose, (L) => A.mitt(g, L, -1, hR));
        // the customer: his jar up, then the swap
        const got = seg(t, c_(3), c_(3) + 3 / 12), joy = got >= 1 ? Math.abs(Math.sin(seg(t, c_(3) + 3 / 12, c_(3) + 3 / 12 + S.BEAT * 0.9) * Math.PI)) : 0;
        const cpose = { mood: got >= 1 ? 'grin' : 'awe', look: 1, upR: 1, upL: got >= 1 ? joy : 0, hop: 0.3 * joy, squash: 0.03 * P.pulse, tail: 0.05 * Math.sin(ph * Math.PI) };
        A.imp(g, CUST.x, CUST.y, CUST.s, cpose);
        const m = A.impMitt(CUST.x, CUST.y, CUST.s, cpose, 1), m0 = A.impMitt(CUST.x, CUST.y, CUST.s, { ...cpose, hop: 0 }, 1);
        if (jt <= 0) A.jar(g, m[0], m[1] + 2, 88, { bob: Math.sin(ph * Math.PI), tw: Math.floor(d / 2) + 1 });
        else if (jt < 1) {
            const p = toss(t, c_(2), 3 / 12, [m0[0], m0[1] + 2], [CR[0] + 4, CR[1] - 40], 14);
            A.jar(g, p[0], p[1], 88, { ang: 0.4 * Math.sin(p[2] * Math.PI), tw: d });
        }
        if (paid) {
            if (got < 1) {
                const p = toss(t, c_(3), 3 / 12, [fanAt[0] - 50, fanAt[1] - 70], [m0[0] + 2, m0[1] - 24], 40);
                A.note(g, p[0], p[1], 100, -0.9 + 1.2 * p[2]);
            } else A.note(g, m[0] + 2, m[1] - 24, 100, 0.3 - 0.12 * joy);
        }
        // coins off his other mitt, a handful a beat
        coins(g, t, [c_(0) - 4 / 24, c_(1), c_(2), c_(3)], [DX + 0.76 * DS, DY - 1.12 * DS]);
        const hop = (i) => (on(t, c_(1) + 0.3) ? -10 * P.pulse * ((i + P.k) % 2 ? 1 : 0.35) : 0);
        word(g, t, 'CASH PAID', 500, 296, fit(g, 'CASH PAID', 'Anton', 720), (i) => (i < 4 ? c_(0) : c_(1)), GOLD, hop);
    }

    // =========================================================================================
    // Bars 69–70 · the phone
    // =========================================================================================
    // The number, group by group, printed on a banner: each group lands on its `when`.
    const GROUPS = ['1-', '800-', '666'];
    function number(g, t, cx, cy, size, whens, ang = 0) {
        g.save();
        g.translate(cx, cy);
        g.rotate(ang);
        g.font = `${size}px "Anton"`;
        g.textBaseline = 'alphabetic';
        g.textAlign = 'center';
        const ws = GROUPS.map((s) => g.measureText(s).width + size * 0.04), total = ws.reduce((a, c) => a + c, 0), xs = [];
        let x = -total / 2;
        GROUPS.forEach((s, i) => {
            const p = pop(t, whens[i], 0.25), mx = x + ws[i] / 2;
            xs.push([cx + mx * Math.cos(ang), cy + mx * Math.sin(ang)]);
            x += ws[i];
            if (p <= 0) return;
            g.save();
            g.translate(mx, 0);
            g.scale(p, p);
            g.fillStyle = i === 2 ? K.red : K.ink;
            g.fillText(s, 0, size * 0.37);
            g.restore();
        });
        g.restore();
        return xs;
    }
    // The web in the nook beside the phone and the spider on its thread. grow, down: 0..1
    function cobweb(g, t, an, R, grow, down, len, o = {}) {
        A.web(g, an.nook[0], an.nook[1], R, Math.PI, Math.PI * 1.5 + 0.06, grow, [0.64, 0.8, 0.95, 0.86, 1]);
        if (down <= 0) return;
        const d = C.drawing(t), y = an.cup[1] + len * down, sway = down >= 1 ? Math.sin(t * 3.1) * 4 : 0, x = an.cup[0] - 6 + sway;
        line(g, [[an.cup[0] - 6, an.cup[1]], [x, y]], K.ink, 5);
        line(g, [[an.cup[0] - 6, an.cup[1]], [x, y]], K.white, 2.2);
        A.spider(g, x, y, o.s ?? 46, { d: Math.floor(d / 2), look: o.look ?? -1, blink: d % 22 === 3, wave: o.wave ?? 0 });
    }
    function sweat(g, t, x, y, s, pose, a0, n = 1) {
        A.onHead(g, x, y, s, pose, (L) => {
            for (let i = 0; i < n; i++) {
                const ai = a0 + i * S.BEAT * 2, p = pop(t, ai, 0.2);
                if (p <= 0) continue;
                const sl = (Math.floor((t - ai) * 12 + 1e-6) % 16) / 16;
                A.drop(g, -0.4 - i * 0.04 - 0.02 * sl, -1.52 + i * 0.16 + 0.1 * sl, 0.05 * p, 0.25, L * 0.85);
            }
        });
    }
    const PTR = 2.6; // the pointer's length, in the Devil's units
    function phoneShot(g, t) {
        const p_ = (k) => at(24 + k), P = S.pulseAt(t), ph = P.k + P.since;
        const DX = 204, DY = 908, DS = 198, PX = 690, PY = 838, PSZ = 282, wait = on(t, p_(4)), tight = on(t, p_(6));
        C.sunburst(g, 520, 640, { n: 12, rot: t * 0.3, a: K.blue, b: '#6660f2' });
        C.memphis(g, t, [['ring', 96, 276, 48, 0, K.aqua], ['squiggle', 104, 396, 42, -0.5, K.yellow], ['tri', 910, 400, 40, 0.3, K.aqua], ['zig', 236, 190, 50, 0.3, K.pink]]);
        starburst(g, t, PX + 10, 650, 232, 322, CUT.phone, { seed: 'ring' });
        floor(g, FLOOR, K.magenta, K.yellow);
        // the choir, on a bench behind the phone
        choir(g, t, PX + 28, 612, 100, { gap: 0.98, looks: tight ? [-1, -0.8, -0.8] : [-0.5, 0, 0.3] });
        // its plinth and the phone: it takes a bow on the fourth beat, then nothing
        C.box(g, PX - 240, 850, 425, 70, [46, -31], { front: K.aqua, top: '#c9fbf5', side: K.teal }, { lw: 3.2 });
        line(g, Array.from({ length: 15 }, (_, i) => [PX - 226 + i * 28.4, 886 + (i % 2 ? -10 : 10)]), K.white, 6);
        const tada = bump(t, p_(3), 0.3);
        const an = A.phone(g, PX + 22, PY - 20 * tada, PSZ, { lift: 0.05 * tada });
        if (tada > 0) [[PX - 196, 650], [PX + 226, 600], [PX - 150, 510], [PX + 196, 770]].forEach(([x, y], i) => C.sparkle(g, x, y, 14 + 34 * tada, { color: K.white, ink: K.ink, lw: 2.6, rot: i * 0.4 }));
        // the banner over it, and the number on it
        const bp = pop(t, CUT.phone, 0.3), BXc = 584, BYc = 218, ang = -0.035;
        g.save();
        g.translate(BXc, BYc);
        g.scale(bp, bp);
        g.translate(-BXc, -BYc);
        A.banner(g, BXc, BYc, 452, 112, ang);
        const marks = number(g, t, BXc, BYc, 96, [p_(0), p_(1), p_(2)], ang);
        g.restore();
        // the web grows on the sixth beat, the spider comes down on the seventh
        const grow = seg(t, p_(5), p_(5) + 6 / 12), down = tight ? E.back(seg(t, p_(6), p_(6) + 5 / 12)) : 0;
        cobweb(g, t, an, 132, grow, down, 70, { s: 58, look: -1, wave: on(t, p_(7)) ? bump(t, p_(7), 0.5) : 0 });
        // the Devil: the pointer under each group on its beat; on the fourth he stands it like
        // a staff and presents the phone; then he waits, a hoof tapping, until the grin sets
        // (it keeps its length: for the near groups it slides back through his mitt)
        const idx = on(t, p_(2)) ? 2 : on(t, p_(1)) ? 1 : 0, hL0 = [[0.62, -0.98], [0.68, -1.0], [0.76, -1.0]][idx], mark = [marks[idx][0], marks[idx][1] + 64];
        const mdx = (mark[0] - DX) / DS - hL0[0], mdy = (mark[1] - DY) / DS - hL0[1], a0 = Math.atan2(mdy, mdx), tap = bump(t, p_(idx), 0.2);
        const plant = E.out(seg(t, p_(3), p_(3) + 3 / 12)), pa = E.lerp(a0, -Math.PI / 2 + 0.03, plant);
        const hL = [E.lerp(hL0[0], 0.78, plant), E.lerp(hL0[1], -0.62, plant)], gb = E.lerp(Math.max(0.16, PTR - Math.hypot(mdx, mdy)) + 0.07 * (1 - tap), 0.62, plant);
        const butt = [hL[0] - Math.cos(pa) * gb, hL[1] - Math.sin(pa) * gb], tip = [butt[0] + Math.cos(pa) * PTR, butt[1] + Math.sin(pa) * PTR];
        const pose = {
            mood: wait ? 'grin' : on(t, p_(3)) ? 'laugh' : 'sly', look: wait ? (on(t, p_(7)) ? 0 : 1) : 0.4, lean: 0.045 * plant, headTilt: 0.03 * plant,
            squash: wait ? 0 : 0.045 * P.pulse, tail: wait ? -0.05 * E.out(seg(t, p_(6), p_(7))) : 0.05 * Math.sin(ph * Math.PI),
            step: wait && !tight ? Math.max(0, 1 - P.since / 0.4) : 0, handL: hL, handR: [E.lerp(-0.5, -0.44, plant), E.lerp(-0.5, -0.54, plant)],
        };
        Devil.draw(g, DX, DY, DS, pose);
        A.onBody(g, DX, DY, DS, pose, (L) => {
            A.stick(g, L, butt, tip);
            A.mitt(g, L, 1, hL);
        });
        if (tight) A.onHead(g, DX, DY, DS, pose, (L) => A.tightGrin(g, L));
        sweat(g, t, DX, DY, DS, pose, p_(7));
    }

    // =========================================================================================
    // Bars 71–72 · the end card
    // =========================================================================================
    function endCard(g, t) {
        const x_ = (k) => at(32 + k), P = S.pulseAt(t), ph = P.k + P.since;
        const DX = 190, DY = 906, DS = 184, PX = 746, PY = 902, PSZ = 248;
        C.sunburst(g, 500, 640, { n: 12, rot: t * 0.3, a: '#ff4fa5', b: '#ff86c3' });
        C.memphis(g, t, [['ring', 88, 388, 46, 0, K.aqua], ['squiggle', 914, 372, 40, 0.5, K.yellow], ['tri', 916, 486, 38, -0.3, K.white], ['cross', 92, 250, 34, 0.5, K.purple], ['zig', 908, 236, 46, 0.4, K.navy]]);
        starburst(g, t, 500, 716, 262, 340, CUT.card, { fill: K.teal, seed: 'card2', n: 16, sy: 0.72 });
        floor(g, FLOOR, K.navy, K.yellow);
        // the choir behind the phone, the phone with its web and its spider
        choir(g, t, PX + 8, 712, 96, { gap: 0.98, looks: [-0.5, 0, 0.3] });
        const an = A.phone(g, PX, PY, PSZ, {});
        cobweb(g, t, an, 64, 1, 1, 60, { s: 42, look: -1 });
        // the Devil: the grin stuck on, an eye that will not stay still
        const cue = on(t, x_(3)), pose = { mood: 'grin', look: cue ? 1 : 0, tail: -0.1, handL: [0.74, -0.7], handR: [-0.44, -0.54], squash: 0 };
        Devil.draw(g, DX, DY, DS, pose);
        const dj = Math.floor((t - x_(4)) * 12 + 1e-6), tw = dj >= 0 && [1, 0, 1, 0, 0, 0, 0, 0][dj % 8];
        A.onHead(g, DX, DY, DS, pose, (L) => {
            A.tightGrin(g, L);
            if (tw) A.twitch(g, L, 1);
        });
        sweat(g, t, DX, DY, DS, pose, CUT.card - S.BEAT, 2);
        // the cue card: an imp from the crew holds it up, and there is nothing on it
        const up = pop(t, x_(3), 0.3);
        if (up > 0) {
            const IX = 462, IY = 944 + (1 - up) * 400, IS = 112, shrug = bump(t, x_(5), 0.3);
            const ip = { mood: 'oops', look: -1, wear: 'hat', upL: 1.22, upR: 1.22, squash: 0.03 * P.pulse + 0.06 * shrug, tail: 0.04 * Math.sin(ph * Math.PI) };
            A.imp(g, IX, IY, IS, ip);
            const mL = A.impMitt(IX, IY, IS, ip, -1), mR = A.impMitt(IX, IY, IS, ip, 1), fj = Math.floor((t - x_(4)) * 12 + 1e-6);
            // he spins it round on the bar's first beat, four drawings: the other way up it says as much
            const turn = fj >= 0 && fj < 4 ? [0.7, 1.5, 2.3, 2.9][fj] : 0, CW = 174, CH = 116, cx = (mL[0] + mR[0]) / 2, cy = (mL[1] + mR[1]) / 2 + 4 - CH / 2 - (turn ? 26 : 0);
            A.card(g, cx - Math.sin(turn) * CH / 2, cy + Math.cos(turn) * CH / 2, CW, CH, turn);
        }
        // the lock-up
        word(g, t, 'SOULS WANTED', 500, 168, fit(g, 'SOULS WANTED', 'Anton', 560), () => x_(0), WHITE);
        word(g, t, 'CASH PAID', 500, 326, fit(g, 'CASH PAID', 'Anton', 640), () => x_(1), GOLD);
        const bp = pop(t, x_(2), 0.3);
        if (bp > 0) {
            g.save();
            g.translate(500, 406);
            g.scale(bp, bp);
            g.translate(-500, -406);
            A.banner(g, 500, 406, 350, 80, -0.02);
            number(g, t, 500, 406, 66, [T0, T0, T0], -0.02);
            g.restore();
        }
    }

    function draw(g, t, env) {
        if (t < CUT.empty - 1e-6) bumper(g, t, env);
        else if (t < CUT.burst - 1e-6) empty(g, t, env);
        else if (t < CUT.souls - 1e-6) burstIn(g, t, env);
        else if (t < CUT.cash - 1e-6) soulsWanted(g, t, env);
        else if (t < CUT.phone - 1e-6) cashPaid(g, t, env);
        else if (t < CUT.card - 1e-6) phoneShot(g, t, env);
        else endCard(g, t, env);
    }

    Seg.breakad = {
        shots: [[T0, CUT.empty, 'Bumper'], [CUT.empty, CUT.burst, 'Empty'], [CUT.burst, CUT.souls, 'Burst'], [CUT.souls, CUT.cash, 'Souls wanted'], [CUT.cash, CUT.phone, 'Cash paid'], [CUT.phone, CUT.card, 'Phone'], [CUT.card, T1, 'End card']],
        draw,
        // the hard cut from the chorus is a dirty edit: the tracking jumps for two frames
        post(t) {
            const f = Math.round((t - T0) * 24);
            return { track: [0.25, 0.1][f] ?? 0 };
        },
    };
})();
