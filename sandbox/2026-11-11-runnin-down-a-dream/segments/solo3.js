// «solo3», bars 145–154 (205.08–219.21 s): through the clouds to Heaven's doorstep.
//   Into the cloud      bars 145–147   the climb's travelling shot: the car punches into the big
//                       cloud's underside (bar 146) and is a silhouette inside it, lit by the
//                       Devil's flames on every kick
//   Heaven's doorstep   bars 148–149   a camera waiting on the cloud tops: three serene angels,
//                       a glow coming up under the floor, the car bursts through on bar 149
//                       (shocked), mitts over the ears on beat 598
//   They join in        bars 150–152   closer: the Devil sees them, freezes, waves; the
//                       moustached one peeks and taps a foot; one by one they rock
//   Up again            bars 153–154   the travelling shot again, the three flying alongside
// The climb's shots are on the shared clock (Finale.Y); the two shots at the doorstep have
// cameras of their own. Props in solo3-props.js (Solo3Props; its escort is for later blocks).
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, S = Song, W = Skyward, F = Finale, P3 = Solo3Props, twos = S.twos, b = S.b, B = S.B;
    const TAU = Math.PI * 2, PI = Math.PI;
    const T0 = B(145), T_DOOR = B(148), T_CLOSE = B(150), T_UP = B(153), T_END = B(155);
    const CAR = F.CAR, CL = P3.CLOUD;
    const lerp = (a, b2, u) => a + (b2 - a) * u;
    const clamp = (v, a = 0, b2 = 1) => Math.max(a, Math.min(b2, v));
    const seg = (v, a, b2) => clamp((v - a) / (b2 - a));
    const smooth = (u) => {
        const v = clamp(u);
        return v * v * (3 - 2 * v);
    };
    // time since an event, held on its own drawings (seconds; negative before it)
    const since = (t, at) => (t < at - 1e-6 ? -1 : twos(t, at) - at);
    // a value that jumps on a hit and falls back, on twos: 1 on the hit's frame
    const hit = (t, at, dur = 0.3) => {
        const a = since(t, at);
        return a < 0 || a >= dur ? 0 : Math.pow(1 - a / dur, 1.6);
    };
    // the hangers under the car's tail (solo2's props), when that file is loaded
    const hangers = (g, t, x, y, s, o = {}) => {
        if (typeof Solo2Props !== 'undefined' && Solo2Props.hangers) Solo2Props.hangers(g, t, x, y, s, o);
    };
    const SPIN = 12; // the wheels: radians a second, as the climb's other blocks turn them

    // =========================================================================================
    // 1 · Into the cloud (the travelling shot)
    // =========================================================================================
    const SIL = '#191346'; // what is inside the cloud, seen through it
    const DARK = { top: CL.massD, shade: '#231b6c' };
    // the kicks light the cloud from inside: beats 584 … 590 (the even ones)
    const kickLight = (t) => {
        let k = 0;
        for (const n of [584, 586, 588, 590]) k = Math.max(k, hit(t, b(n), 0.42));
        return k;
    };
    function climb(g, t, env) {
        const Y = F.Y(t), o = { town: { lights: 1, wake: 1 }, speedLines: 0.4 }, d = C.drawing(t);
        const ride = (c) => {
            F.ride(c, t, CAR.x, CAR.y, CAR.s, { spin: t * SPIN });
            hangers(c, t, CAR.x, CAR.y, CAR.s);
        };
        W.ascent(g, t, Y, o);
        // our own layer of the cloud's underside, nearer than the car: what is above its
        // scalloped edge is inside the cloud
        const yLine = Y - 1840 + 46;
        if (yLine < 240) ride(g);
        else {
            const row = (c, y, cols, opt) => P3.cloudRow(c, y, 112, 'solo3-under', 310, cols, { up: -1, ...opt });
            if (yLine < 1320) {
                row(g, yLine, { body: CL.massD }, { depth: 150, lw: 4 });
                P3.cloudRow(g, yLine - 92, 100, 'solo3-under2', 95, { body: CL.mass }, { up: -1, depth: 60, lw: 0 });
            }
            const inside = (c) => {
                if (yLine >= 1320) return c.fillRect(0, 0, 1000, 1000);
                c.fill(row(c, yLine, { body: '#000' }, { depth: 3000, lw: 0, draw: false }));
            };
            // the glow of his flames, and the kick's light through the whole cloud
            const kl = kickLight(t), flick = [0, 0.06, -0.03, 0.04][((d % 4) + 4) % 4];
            const [hx, hy] = F.hoodAt(CAR.x, CAR.y, CAR.s), gx = hx + 6, gy = hy - 46, gk = 0.5 + flick + 1.15 * kl;
            g.save();
            if (yLine < 1320) g.clip(row(g, yLine, { body: '#000' }, { depth: 3000, lw: 0, draw: false }));
            P3.glow(g, gx, gy, gk, d);
            g.restore();
            // below the edge the car is still in clear air
            if (yLine < 960) {
                const col = Motion.layer(env, 'solo3-clear', (c) => {
                    ride(c);
                    c.globalCompositeOperation = 'destination-out';
                    c.fillStyle = '#000';
                    inside(c);
                });
                Motion.drawLayer(g, env, col);
            }
            // inside: a silhouette
            const sil = Motion.layer(env, 'solo3-sil', (c) => {
                ride(c);
                c.globalCompositeOperation = 'source-atop';
                c.fillStyle = SIL;
                c.fillRect(0, 0, 1000, 1000);
                c.globalCompositeOperation = 'destination-in';
                c.fillStyle = '#000';
                inside(c);
            });
            Motion.drawLayer(g, env, sil);
            // what the flames light keeps its colours: him, and on a kick the band
            const lit = Motion.layer(env, 'solo3-lit', (c) => {
                ride(c);
                c.globalCompositeOperation = 'destination-in';
                c.fillStyle = '#000';
                const r = 250 * gk * 0.56;
                c.fill(P3.blobPath(gx, gy - r * 0.16, r * 1.12, r * 0.86, 9, (d % 2) * 0.33 + 1.4));
                inside(c);
            });
            Motion.drawLayer(g, env, lit);
            // the edge again, over the car
            if (yLine < 1320) {
                g.save();
                g.beginPath();
                g.rect(-80, yLine - 112 * 1.3 - 4, 1160, 600);
                g.clip();
                g.strokeStyle = K.ink;
                g.lineWidth = 8;
                g.lineJoin = 'round';
                g.stroke(row(g, yLine, { body: '#000' }, { depth: 150, lw: 0, draw: false }));
                g.restore();
            }
            // the punch: lumps of the underside knocked out where the amps and his horns go in
            const tp = b(583), a = since(t, tp);
            if (a >= 0 && a < 0.62) {
                const r = Motion.rng('solo3-punch');
                for (const [px, py] of [[250, 332], [836, 352]]) {
                    for (let i = 0; i < 6; i++) {
                        const dir = -1.0 + (i / 5) * 2.0 + (r() - 0.5) * 0.3, v = 260 + r() * 220, sz = (26 - a * 26) * (0.7 + 0.6 * r());
                        const x = px + Math.sin(dir) * v * a, y = py + 30 + Math.cos(dir) * v * a * 0.5 + 700 * a * a;
                        if (sz > 5) P3.cloudPuff(g, x, y, sz, 5, r() * TAU + Math.round(a * 12) * 0.5, 3, DARK);
                    }
                }
            }
        }
        W.ascentFront(g, t, Y, o);
    }

    // =========================================================================================
    // 2 · Heaven's doorstep (a camera waiting on the cloud tops)
    // =========================================================================================
    const T_BURST = B(149), T_EARS = b(598);
    const GLOW_OUT = ['#fff0c2', '#ffdc9a', '#ffbe70', '#ff9a52'];
    // the set: banks, where everybody stands (feet), at the film's scale
    const DOOR = { s: 84, gate: [150, 428], back: [585, 402, 6.5], who1: [392, 402], who2: [702, 402], lectern: [812, 402], front: [548, 478, 1.9], who0: [548, 478], carX: 440, rest: 895, mid: 815, near: 908 };
    const ASKEW = [-0.46, 0.42, -0.5]; // where the blast leaves each halo
    // the three at the doorstep: serene, then shocked on the burst, then mitts over the ears
    function doorPose(who, t) {
        const P = S.pulseAt(t), ph = P.k + P.since, p = P.pulse;
        if (t < T_BURST - 1e-6) {
            const d = C.drawing(t), bob = 0.012 * Math.sin((d + who * 3) * 0.5);
            if (who === 0) return { who, mood: 'serene', harp: true, strum: Math.cos(ph * PI), flap: 0.22, headTilt: 0.05 * Math.sin(ph * PI * 0.5), headDy: bob };
            if (who === 1) return { who, mood: 'serene', trumpet: true, flap: 0.18, headDy: 0.02 + 0.02 * Math.sin(d * 0.35), headTilt: -0.03 }; // dozing on his feet
            // reading: her head towards the book, a mitt on the page; she turns a leaf on beat 594
            const turn = hit(t, b(594), 0.36);
            return { who, mood: 'serene', flap: 0.2, headTilt: 0.13, headDy: 0.015 + bob, handL: [0.74 - 0.1 * turn, -1.3 - 0.16 * turn], handR: [-0.02, -0.62] };
        }
        const a = since(t, T_BURST), jump = hit(t, T_BURST, 0.34), askew = ASKEW[who] * clamp(a / 0.25);
        if (t < T_EARS - 1e-6) return { who, mood: 'shocked', harp: who === 0, trumpet: who === 1, flap: 1, haloUp: 0.35 + 0.65 * jump, halo: askew, squash: -0.1 * jump, hop: 0.22 * Math.sin(Math.min(1, a / 0.34) * PI), headDy: -0.03 * jump };
        const e = hit(t, T_EARS, 0.25);
        return { who, mood: 'ears', harp: who === 0, trumpet: who === 1, flap: 0.05, halo: ASKEW[who], haloUp: 0.3 * e, squash: 0.07 * e + 0.035 * p, headDy: 0.03 * e + 0.015 * p, lean: (who === 0 ? -1 : 1) * 0.03 };
    }
    function doorstep(g, t, env) {
        const Q = DOOR, s = Q.s, d = C.drawing(t), Yc = 4150 + 14 * (t - T_DOOR);
        W.ascent(g, t, Yc, { moon: { x: 268, y: 150, r: 62 }, town: false, speedLines: 0 });
        const a = since(t, T_BURST), out = a >= 0;
        // the car: under the floor until the bar line, then up through it and slowing
        const u = seg(t, T_BURST, T_CLOSE), gy = out ? Q.rest + 100 * Math.pow(1 - u, 3) : 1500;
        // what comes up under the floor: his flames light the cloud on the kicks, the floor swells
        const swell = out ? 0 : smooth(seg(twos(t, T_DOOR), b(593), T_BURST)), kl = Math.max(hit(t, b(592), 0.4), hit(t, b(594), 0.45)), near = seg(twos(t, T_DOOR), T_DOOR, T_BURST);
        const gk = out ? 0 : 0.34 + 0.5 * near + 0.5 * kl + [0, 0.05, -0.02, 0.03][d % 4], gx = Q.carX + 250, gcy = 900 - 40 * near;
        const lift = (x) => -78 * swell * Math.exp(-Math.pow((x - (Q.carX + 60)) / 300, 2)) * (1 + 0.06 * (d % 2));
        const bank = (x, y, w, seed, fn) => {
            W.cloudBank(g, x, y, s, { w, seed, t, part: 'back' });
            fn(W.bankBob(t, seed) * s);
            W.cloudBank(g, x, y, s, { w, seed, t, part: 'front' });
        };
        const angel = (who, [x, y], dy) => {
            const pose = doorPose(who, t);
            W.angel(g, x, y + dy - (pose.hop ?? 0) * s, s, pose);
        };
        bank(Q.gate[0], Q.gate[1], 2.3, 'solo3-gate', (dy) => W.pearlyBits(g, Q.gate[0], Q.gate[1] + dy, s * 0.82, { lectern: false, ajar: 0.6 }));
        bank(Q.back[0], Q.back[1], Q.back[2], 'solo3-back', (dy) => {
            angel(1, Q.who1, dy);
            angel(2, Q.who2, dy);
            W.pearlyBits(g, Q.lectern[0], Q.lectern[1] + dy, s, { gate: false, lecternAt: [0, 0] });
            // the blast riffles the book and takes its loose leaves
            if (out) P3.leaves(g, Q.lectern[0], Q.lectern[1] + dy, s, clamp(a / 0.17) * (1 - 0.35 * seg(a, 0.6, 1.3)), d);
        });
        bank(Q.front[0], Q.front[1], Q.front[2], 'solo3-front', (dy) => angel(0, Q.who0, dy));
        // the floor behind the car
        P3.cloudRow(g, Q.mid, 120, 'solo3-mid', 40 + t * 5, { body: CL.top, shade: CL.shade }, { depth: 400, lift, inside: (c) => P3.glow(c, gx, gcy + 20, gk * 0.9, d, GLOW_OUT) });
        const ring = clamp(a / 0.92);
        if (out) P3.tornRing(g, Q.carX + 20, 880, 400, 46, ring, 'back');
        F.ride(g, t, Q.carX, gy, s, { spin: t * SPIN, devil: { shred: 1, solo: 0.7 } });
        hangers(g, t, Q.carX, gy, s);
        // the floor in front of it
        P3.cloudRow(g, Q.near, 104, 'solo3-near', 700 + t * 8, { body: CL.top, shade: CL.shade }, { depth: 300, lift: (x) => lift(x) * 0.8, inside: (c) => P3.glow(c, gx, gcy + 70, gk, d, GLOW_OUT) });
        if (out) P3.tornRing(g, Q.carX + 20, 880, 400, 46, ring, 'front');
        if (out) P3.pages(g, Q.lectern[0] - 6, Q.lectern[1] - 1.5 * s, s, a, [0.62, -0.78]);
    }

    // =========================================================================================
    // 3 · They join in (closer)
    // =========================================================================================
    const N = { see: 601, wave: 602, peek1: 604, tap: 605, back: 606, peek0: 606, rock1: 607, rock0: 608, peek2: 608, rock2: 609, off: 611 };
    const CLOSE = { s: 140, devil: [250, 772], back: [722, 560, 3.9], who1: [578, 560], who2: [866, 560], front: [722, 772, 2.0], who0: [722, 772] };
    // the Devil on the hood: mid-lick, caught, the wave, a few careful notes, then everything
    function devilActs(t) {
        const P = S.pulseAt(t), ph = P.k + P.since, p = P.pulse;
        const base = { look: 1, lean: 0, squash: 0.04 * p, headDy: 0.02 * p, tail: 0.05 * Math.sin(ph * PI), strum: Math.cos(ph * TAU), fret: 0.2 + 0.3 * (Math.floor(ph / 2) % 3), solo: 0.5, flames: 1, shred: 0, mood: 'grin', t };
        if (t < b(N.see) - 1e-6) return { pose: { ...base, look: -1, mood: 'laugh', eyes: 'shut', shred: 1, solo: 0.8 } };
        if (t < b(N.wave) - 1e-6) {
            // caught: he jumps, the lick stops where it was, the fire sinks
            const j = hit(t, b(N.see), 0.3), a = since(t, b(N.see));
            return { pose: { ...base, mood: 'shock', squash: -0.09 * j, headDy: -0.03 * j, tail: -0.06 * j, strum: 0.7, fret: 0.8, solo: 0.5, flames: a < 0.08 ? 0.7 : a < 0.17 ? 0.45 : 0.3 } };
        }
        if (t < b(N.back) - 1e-6) {
            // the wave: the picking mitt comes up beside his head and wags, small, on twos
            const n = Math.floor(since(t, b(N.wave)) * 12 + 1e-6), wagging = t < b(N.peek1) + S.BEAT * 0.5 - 1e-6;
            const A = [0.8, -1.44], Bq = [0.94, -1.33], side = Math.floor((n - 1) / 2) % 2;
            const hand = n < 1 ? [0.7, -1.2] : wagging ? (side ? Bq : A) : [0.86, -1.36];
            return { pose: { ...base, mood: 'grin', eyes: 'shut', squash: 0.02 * p, headDy: 0.012 * p + 0.01, headTilt: 0.05, tail: 0.11, strum: NaN, fret: 0.8, solo: 0.42, flames: 0.26 }, hand, ticks: wagging && n >= 1, sweat: clamp(n / 14) };
        }
        if (t < b(N.rock0) - 1e-6) return { pose: { ...base, mood: 'grin', solo: 0.45, flames: 0.62 } };
        return { pose: { ...base, mood: 'laugh', look: P.k % 4 < 2 ? 1 : -1, shred: 1, solo: 0.8, flames: 1 } };
    }
    // an angel's pose in the close shot; { pose, lift (the tapping foot), tap, up (off the bank, figure units) }
    function closePose(who, t) {
        const P = S.pulseAt(t), ph = P.k + P.since, p = P.pulse, even = P.k % 2 === 0;
        const peekAt = b([N.peek0, N.peek1, N.peek2][who]), rockAt = b([N.rock0, N.rock1, N.rock2][who]);
        const prop = { harp: who === 0, trumpet: who === 1 };
        if (t < peekAt - 1e-6) return { pose: { who, mood: 'ears', ...prop, flap: 0.05, halo: ASKEW[who], squash: 0.04 * p, headDy: 0.02 * p, lean: 0.03 * (who === 1 ? -1 : 1) + 0.012 * (C.drawing(t) % 2 ? 1 : -1) * p } };
        if (t < rockAt - 1e-6) {
            // one ear uncovered, an eye open; then (the moustached one) the foot finds the beat
            const j = hit(t, peekAt, 0.25), tapping = who === 1 && t >= b(N.tap) - 1e-6, dn = P.since < 0.3;
            return { pose: { who, mood: 'peek', ...prop, flap: 0.3, halo: ASKEW[who] * 0.8, haloUp: 0.3 * j, squash: -0.03 * j + (tapping ? 0.03 * p : 0), headDy: tapping ? 0.03 * p : 0, headTilt: who === 2 ? 0.05 : -0.06 }, lift: tapping ? (dn ? 0 : 1) : 0, tap: tapping && P.since < 0.14 ? 1 : 0 };
        }
        const j = hit(t, rockAt, 0.3), w = P3.beatWing(t, who * 0.25), fly = t >= b(610) - 1e-6, up = smooth(seg(t, b(N.off) - 0.04, T_UP + 0.25)) * 0.62;
        const common = { who, mood: 'rock', ...prop, flap: fly || who === 2 ? w.flap : 0.3 + 0.5 * p, squash: -0.07 * j + 0.04 * p, headDy: 0.03 * p, haloUp: 0.35 * j + 0.7 * p, halo: ASKEW[who] * 0.35 + 0.12 * Math.sin(ph * PI) };
        const bob = fly || who === 2 ? w.bob * (who === 2 ? 1 : 0.6) : 0;
        if (who === 0) return { pose: { ...common, strum: Math.cos(ph * TAU), headTilt: 0.05 * Math.sin(ph * PI) }, up: up - bob };
        if (who === 1) return { pose: { ...common, armUp: 0.35 + 0.65 * p, lean: -0.24 - 0.05 * p }, lift: 0, tap: 0, up: up - bob };
        return { pose: { ...common, armUp: even ? 0.4 + 0.6 * p : 0.3, handR: even ? [-0.52, -0.52] : [-0.56, -1.2 - 0.62 * (0.4 + 0.6 * p)], headTilt: even ? 0.06 : -0.06 }, up: up - bob };
    }
    function close(g, t, env) {
        const Q = CLOSE, s = Q.s, Yb = 4170 + (F.Y(t) - 4050) * 0.7;
        W.ascent(g, t, Yb, { moon: { x: 420, y: 150, r: 74 }, town: false, speedLines: 0 });
        // the car has pulled up beside their banks: all we see of it is the hood he stands on
        const cx = Q.devil[0] - F.HOOD[0] * s, cy = Q.devil[1] - F.HOOD[1] * s, act = devilActs(t);
        const ooh = S.ooh(t);
        const bank = (x, y, w, seed, fn) => {
            W.cloudBank(g, x, y, s, { w, seed, t, part: 'back' });
            fn(W.bankBob(t, seed) * s);
            W.cloudBank(g, x, y, s, { w, seed, t, part: 'front' });
        };
        const drawn = [];
        const angel = (who, [x, y], dy) => {
            const c = closePose(who, t), a = { who, x, y: y + dy - (c.up ?? 0) * s, s, pose: c.pose };
            if (who === 1 && c.pose.mood !== 'rock') P3.angelTap(g, a.x, a.y, s, c.pose, c.lift ?? 0, c.tap ?? 0);
            else W.angel(g, a.x, a.y, s, c.pose);
            if (c.pose.mood === 'rock') {
                if (ooh && who !== 1) P3.oohMouth(g, a);
                drawn.push(a);
            }
        };
        bank(Q.back[0], Q.back[1], Q.back[2], 'solo3-cback', (dy) => {
            angel(1, Q.who1, dy);
            angel(2, Q.who2, dy);
        });
        F.ride(g, t, cx, cy, s, { spin: t * SPIN, lean: 0, bounce: 0, devil: act.pose });
        if (act.hand) {
            P3.devilWave(g, Q.devil[0], Q.devil[1], s, act.pose, act.hand, { ticks: act.ticks });
            P3.sweat(g, Q.devil[0], Q.devil[1], s, act.pose, act.sweat);
        }
        bank(Q.front[0], Q.front[1], Q.front[2], 'solo3-cfront', (dy) => angel(0, Q.who0, dy));
        // gold notes out of the trumpet and the harp, one a beat from the beat each joins on
        for (const a of drawn) P3.angelNotes(g, t, a, { every: 1, phase: 0, from: b([N.rock0, N.rock1, N.rock2][a.who]), life: 1.9 });
    }

    // =========================================================================================
    // 4 · Up again (the travelling shot)
    // =========================================================================================
    function up(g, t, env) {
        const Y = F.Y(t), o = { town: false, speedLines: t < B(154) - 1e-6 ? lerp(0.14, 0.5, smooth(seg(t, T_UP, B(154)))) : 0.5 };
        W.ascent(g, t, Y, o);
        // the first shooting star, on the bar
        P3.shootingStar(g, 70, 52, 1, 250, since(t, B(154)) / 0.42);
        F.ride(g, t, CAR.x, CAR.y, CAR.s, { spin: t * SPIN });
        hangers(g, t, CAR.x, CAR.y, CAR.s);
        // the three come into formation as the climb picks up, and are on their marks from bar 154
        const k = 1 - smooth(seg(t, T_UP - 0.2, B(154) - 0.1)), k2 = k * k;
        P3.escort(g, t, CAR.x, CAR.y, CAR.s, k > 0 ? { at: { 0: [0.5 * k2, -0.9 * k], 1: [0.7 * k2, -0.75 * k], 2: [0.9 * k, 0.95 * k] } } : {});
        W.ascentFront(g, t, Y, o);
    }

    function draw(g, t, env) {
        if (t < T_DOOR - 1e-6) climb(g, t, env);
        else if (t < T_CLOSE - 1e-6) doorstep(g, t, env);
        else if (t < T_UP - 1e-6) close(g, t, env);
        else up(g, t, env);
    }

    Seg.solo3 = { shots: [[T0, T_DOOR, 'Into the cloud'], [T_DOOR, T_CLOSE, "Heaven's doorstep"], [T_CLOSE, T_UP, 'They join in'], [T_UP, T_END, 'Up again']], draw, post: () => ({}) };
})();
