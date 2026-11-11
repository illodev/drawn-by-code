// «solo2», bars 137–144 (193.79–205.08 s): the volcano launches the car out of Hell.
//   Rumble            bars 137–138   the volcano's wide view. The swap back, on the beats: the Devil strides
//                                    to the deck's front edge while Mike steps back to his seat (beat 549),
//                                    then leaps over the windscreen to the bonnet as Tom hops back over him
//                                    and the cactus onto the deck (both land on beat 550: from there the
//                                    ride is Finale.ride). He plants his hooves, winds his whole arm round
//                                    (beat 551) and hits the chord on bar 138: the cone cracks, stones hop,
//                                    the far shore throws its mitts up. Four fans scramble up to the tail.
//   The plug pops     bar 139        closer: the plug pops on the bar line and the column lifts the car;
//                                    the imp at the pipe is carried off, and the others catch on one per
//                                    beat (557, 558, 559): the hangers
//   Through the roof  bar 140        the cavern's roof: past the lighting rig; bombs crack it, the car
//                                    bursts it open on beat 562 (slabs pushed aside, a shaft of moonlight)
//   Out               bars 141–144   the night desert, on the climb's clock (Finale.Y): the road bulges and
//                                    splits (bar 141), bursts on beat 565, the car comes up out of the dust
//                                    on its column; on bar 142 the pipes light as rockets and the column
//                                    drops away; the town wakes below; the rockets cough out on beat 577.
//                                    The last frame is Finale.ride and the hangers alone on the climb.
// Props: segments/solo2-props.js (Solo2Props: the hangers, the rockets, the roof, the mound).
// Uses Seg.bridge.band for the three beats in which the bridge's places are still held.
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, I = Inferno, W = Skyward, F = Finale, P = Solo2Props, twos = S.twos, b = S.b, B = S.B, pop = S.pop;
    const PI = Math.PI, TAU = PI * 2, FR = 1 / 24, BEAT = S.BEAT;
    const at = (k) => b(548 + k); // beat k of the block, on its frame
    const T0 = B(137), T_POP = B(139), T_ROOF = B(140), T_OUT = B(141), T_END = B(145);
    const on = (t, a) => t >= a - 1e-6;
    const lerp = (a, c, u) => a + (c - a) * u;
    const clamp = (v, a = 0, c = 1) => Math.max(a, Math.min(c, v));
    const seg = (t, a, c) => clamp((t - a) / (c - a));
    const seg2 = (t, a, c) => seg(twos(t, a), a, c); // the same on twos, counted from a
    const smooth = (u) => u * u * (3 - 2 * u);
    const dr = (t, a) => Math.floor((t - a) * 12 + 1e-6); // drawings since a
    const bump = (t, a, dur = 0.3) => (on(t, a) ? Math.sin(seg2(t, a, a + dur) * PI) : 0);
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const arc = (p, q, u, h) => [lerp(p[0], q[0], u), lerp(p[1], q[1], u) - h * 4 * u * (1 - u)];
    // a landing at `a`: amp on its own frame, then it rings out
    const thud = (t, a, amp = 0.16, dur = 0.3) => (on(t, a) ? amp * Math.max(0, 1 - (twos(t, a) - a) / dur) * Math.cos(((twos(t, a) - a) / dur) * PI * 1.5) : 0);
    const back = (u) => 1 + 2.7 * Math.pow(clamp(u) - 1, 3) + 1.7 * Math.pow(clamp(u) - 1, 2);

    // =========================================================================================
    // The Devil's whole-arm windmill (his picking arm, drawn over Inferno.devilGuitar)
    // =========================================================================================
    const DP = Devil.P, SH = [Devil.TORSO.x + Devil.TORSO.w - 0.03, Devil.TORSO.y + 0.14]; // the picking arm's shoulder (screen right)
    const WIND = [70, -8, -88, -128].map((a) => (a * PI) / 180), ARM = 0.66; // where the arm is on each drawing of the wind-up
    function arm(g, L, sh, hand) {
        const w = 0.16, dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6, ux = dx / len, uy = dy / len, nx = -uy * w * 0.5, ny = ux * w * 0.5;
        const quad = (a, c, k = 1) => {
            const q = [[sh[0] + ux * a + nx * k, sh[1] + uy * a + ny * k], [sh[0] + ux * c + nx * k, sh[1] + uy * c + ny * k], [sh[0] + ux * c - nx * k, sh[1] + uy * c - ny * k], [sh[0] + ux * a - nx * k, sh[1] + uy * a - ny * k]];
            let s2 = 0;
            for (let i = 0; i < 4; i++) s2 += q[i][0] * q[(i + 1) % 4][1] - q[(i + 1) % 4][0] * q[i][1];
            return s2 > 0 ? q : q.reverse();
        };
        const D = Cast.D, Dd = (z) => [D[0] * z, D[1] * z], c0 = Math.max(0.03, len - 0.14), c1 = Math.max(0.06, len - 0.075);
        C.prism(g, quad(-0.05, c0), Dd(0.16), { front: DP.suit, top: DP.suitTop, side: DP.suitSide }, { lw: L, ink: DP.ink });
        C.prism(g, quad(c0, c1, 1.12), Dd(0.17), { front: DP.shirt, top: DP.shirt, side: '#d9d4e6' }, { lw: L, ink: DP.ink });
        C.prism(g, quad(c1, len + 0.11), Dd(0.16), { front: DP.skin, top: DP.skinTop, side: DP.skinSide }, { lw: L, ink: DP.ink });
    }
    /**
     * The wind-up, over a Devil drawn by Inferno.devilGuitar with `strum: NaN` (which leaves his picking arm
     * out). (x, y) his ground point on screen, s his scale, i the drawing (0..3); lean, q his pose's lean and squash.
     */
    function windmill(g, x, y, s, i, lean = 0, q = 0, solo = 0.5) {
        const a = WIND[Math.min(i, WIND.length - 1)], prev = i > 0 ? WIND[i - 1] : (118 * PI) / 180;
        g.save();
        g.lineJoin = 'round';
        g.translate(x, y);
        g.scale(s, s);
        g.rotate(lean + 0.1 * solo);
        g.scale(1 + q, 1 - q);
        // the sweep it leaves: a white crescent from where the mitt was
        const pts = [], n = 10;
        for (let j = 0; j <= n; j++) {
            const u = j / n, th = lerp(prev, a, u);
            pts.push([SH[0] + Math.cos(th) * (ARM + 0.2), SH[1] + Math.sin(th) * (ARM + 0.2)]);
        }
        for (let j = n; j >= 0; j--) {
            const u = j / n, th = lerp(prev, a, u), r = ARM + 0.2 - 0.17 * u;
            pts.push([SH[0] + Math.cos(th) * r, SH[1] + Math.sin(th) * r]);
        }
        C.poly(g, pts, { fill: K.white, lw: 0 });
        arm(g, 3.2 / s, SH, [SH[0] + Math.cos(a) * ARM, SH[1] + Math.sin(a) * ARM]);
        g.restore();
    }
    // his pose through a wind-up that starts at `w` and a chord at `c` (merged over the ride's own pose)
    function chordPose(t, w, c) {
        if (on(t, w) && !on(t, c)) return { strum: NaN, mood: 'laugh', squash: -0.05, headTilt: -0.05, flames: 1 };
        if (on(t, c) && !on(t, c + 0.5)) return { strum: lerp(1, -1, seg2(t, c, c + 2 / 12)), mood: 'laugh', squash: 0.045 * S.pulseAt(t).pulse + Math.max(0, thud(t, c, 0.18)), flames: 1, fret: 0.5 };
        return null;
    }
    // the chord's starburst behind him and the notes it throws; (hx, hy) his ground point on screen
    function chordBurst(g, t, c, hx, hy, s, part) {
        if (!on(t, c)) return;
        const gb = bump(t, c, 0.5), d = C.drawing(t);
        if (part === 'back') {
            if (gb > 0.01) C.burst(g, hx - 0.05 * s, hy - 1.0 * s, { r0: 1.0 * s * (0.7 + 0.3 * gb), r1: 1.65 * s * (0.7 + 0.3 * gb), n: 13, seed: 'solo2-chord', fill: K.yellow, ink: K.ink, lw: 3.2, rot: d % 2 ? 0.06 : 0 });
            return;
        }
        const u = seg2(t, c, c + 0.75);
        if (u >= 1) return;
        [[-1.5, -2.9, 2, -0.2], [-0.2, -3.5, 1, 0.1], [1.2, -3.0, 1, 0.3]].forEach(([dx, dy, kind, r0], i) => {
            const e = 1 - Math.pow(1 - u, 2), k = pop(t, c, 0.2) * (1 - 0.5 * seg(u, 0.7, 1));
            C.note(g, hx + dx * s * (0.45 + 0.75 * e), hy + (-1.2 + (dy + 1.2) * (0.4 + 0.75 * e)) * s + 5 * Math.sin(u * 9 + i), 0.2 * s * k, { color: i === 1 ? K.yellow : K.white, ink: K.ink, lw: 2.6, kind, rot: r0 + 0.3 * Math.sin(u * 7 + i) });
        });
    }

    // =========================================================================================
    // The four fans who end up hanging from the car
    // =========================================================================================
    // In the volcano's own coordinates (its wide view): where each stands by the tail, who is behind
    // the pipes, what Inferno.fan is asked for. Their order is the chain's, from the top.
    const FANS = [
        { at: [233, 641], back: false, o: { kind: 'imp', wear: 'specs' } },
        { at: [212, 642], back: false, o: { kind: 'imp', wear: 'bow' } },
        { at: [252, 629], back: true, o: { kind: 'imp' } },
        { at: [229, 631], back: true, o: { kind: 'skeleton', hawk: K.pink, tee: 2 } },
    ];
    const toScreen = (V, [x, y]) => [(x - V.cx) * V.k + 500, (y - V.cy) * V.k + 500];
    const WIDE = { k: 1, cx: 500, cy: 500 };
    function fanStand(g, t, V, i, pos, hype, sh = [0, 0]) {
        const p = toScreen(V, pos);
        I.fan(g, p[0] + sh[0], p[1] + sh[1], 54 * V.k, { ...FANS[i].o, hype, hold: 'none', t, look: 0.6, shadow: false });
    }

    // =========================================================================================
    // Shot 1 · «Rumble», bars 137–138: the volcano, wide. The swap back, the chord, the cone cracks
    // =========================================================================================
    const SEATS = Rides.bandCarSeats(), HOOD = F.HOOD;
    const MIKE_FWD = [0.3, -0.77], DEVIL_AT = [1.28, -0.77], EDGE = [1.52, -0.77]; // the bridge's last places; the deck's front edge
    const STRIDE = at(0) + 2 * FR, LEAP = at(1), LAND = at(2), WINDUP = at(3), CHORD = at(4);
    const TOM_H = 3.5, DEVIL_H = 1.45; // how high each goes: Tom clears him and the cactus
    const carPt = (car, p, bn = 0) => [car.x + p[0] * car.s, car.y + (p[1] + 0.1 * bn) * car.s];
    function rumbleShot(g, t) {
        const Pu = S.pulseAt(t), ph = Pu.k + Pu.since, hit = on(t, CHORD);
        const rumble = hit ? lerp(0.5, 1, seg2(t, CHORD, at(7))) : 0, o = { view: 'wide', rumble, erupt: 0, t };
        I.volcano(g, t, o);
        P.shoreCrowd(g, t, { up: hit ? 1 : 0.12, jump: bump(t, CHORD, 0.4) });
        const T = I.volcanoTop(o), car = { x: T.x, y: T.y, s: T.s }, s = car.s, sh = [T.x - 500, T.y - 640];
        // the fans: each scrambles up the cone's face to the tail, the one in specs first
        const fan = (i) => {
            const f = FANS[i], top = i === 0 ? T0 : at(i) + 2 * FR, u = i === 0 ? 1 : seg(t, T0, top), y0 = f.at[1] + 24 * i + 6;
            if (u >= 1) return fanStand(g, t, WIDE, i, f.at, hit ? 1 : 0.55, sh);
            const cu = twos(t, T0), hop = Math.abs(Math.sin(((cu - T0) / BEAT) * PI * 2 + i)) * 7;
            fanStand(g, T0, WIDE, i, [lerp(f.at[0] - 4 + 3 * i, f.at[0], smooth(u)), lerp(y0, f.at[1], u) - hop], 0.5, sh);
        };
        fan(3);
        fan(2);
        const hood = carPt(car, HOOD, 0.2 * Pu.pulse);
        chordBurst(g, t, CHORD, hood[0], hood[1], s, 'back');
        const base = { mood: 'grin', shadow: false, squash: 0.045 * Pu.pulse, headDy: 0.02 * Pu.pulse, tail: 0.05 * Math.sin(ph * PI), strum: Math.cos(ph * TAU), fret: 0.2 + 0.3 * (Math.floor(ph / 2) % 3), flames: 1, shred: 0, t };
        if (!on(t, LAND)) {
            // the bridge's places still: Mike stepped forward, the Devil in Tom's place, Tom on the bonnet
            const mu = seg(t, STRIDE, LEAP - 2 * FR), tu = seg(t, LEAP, LAND), flying = on(t, LEAP);
            const duck = flying ? Math.sin(tu * PI) : 0, crouch = !flying && on(t, LEAP - 2 * FR) ? 0.1 : 0;
            Seg.bridge.band(g, t, car, {
                solo: lerp(0.5, 0.6, seg(t, T0, LAND)),
                tomAt: flying ? arc(HOOD, SEATS.deck[0], tu, TOM_H) : HOOD,
                mikeAt: mu >= 1 ? SEATS.deck[1] : arc(MIKE_FWD, SEATS.deck[1], mu, 0.16), mikeNear: mu < 0.5,
                pose: { tom: flying ? { squash: -0.07, sway: 0.05 } : crouch ? { squash: 0.045 * Pu.pulse + crouch } : {}, mike: mu > 0 && mu < 1 ? { squash: -0.03 } : {} },
                cactus: duck > 0.01 ? { squash: 0.26 * duck, mouth: 'oh' } : {},
            });
            // the Devil: a stride to the deck's edge, then over the cactus and the windscreen
            let p, pose;
            if (!flying) {
                const u = seg(t, STRIDE, LEAP - 2 * FR), q = seg2(t, STRIDE, LEAP - 2 * FR);
                p = arc(DEVIL_AT, EDGE, u, 0.2);
                pose = { ...base, look: 1, solo: 0.25, step: q > 0 && q < 1 ? 1 : 0, lean: q > 0 && q < 1 ? 0.07 : 0, squash: base.squash + (u >= 1 ? 0.12 : 0) };
            } else {
                p = arc(EDGE, HOOD, tu, DEVIL_H);
                pose = { ...base, look: 1, solo: 0.25, mood: 'laugh', squash: -0.08, lean: 0.12, step: 1, strum: -1 };
            }
            const sp = carPt(car, p, flying ? 0 : 0.2 * Pu.pulse);
            I.devilGuitar(g, sp[0], sp[1], s, pose);
        } else {
            // everybody landed: the ride as it is from here on
            const bn = 0.2 * Pu.pulse + Math.max(0, thud(t, LAND, 1, 0.35)), d2 = dr(t, LAND), wi = on(t, WINDUP) && !hit;
            const cp = chordPose(t, WINDUP, CHORD);
            const devil = cp ?? { look: d2 < 2 ? 1 : -1, step: d2 === 2 ? -1 : d2 === 4 ? 1 : 0, squash: 0.045 * Pu.pulse + Math.max(0, thud(t, LAND, 0.2)) + (d2 === 3 || d2 === 5 ? 0.07 : 0), mood: hit ? 'laugh' : 'grin' };
            F.ride(g, t, car.x, car.y, s, { spin: 0, shadow: true, exhaust: 0, bounce: bn, devil, pose: { tom: { squash: 0.045 * Pu.pulse + Math.max(0, thud(t, LAND, 0.2)) } } });
            if (wi) windmill(g, car.x + HOOD[0] * s, car.y + (HOOD[1] + 0.1 * bn) * s, s, dr(t, WINDUP), 0, cp.squash);
            if (d2 < 3) BridgeProps.ticks(g, hood[0], hood[1], 0.5 * s, 0.74 * s, 5, PI * 1.08, PI * 1.92, K.white, 2.6);
        }
        fan(1);
        fan(0);
        chordBurst(g, t, CHORD, hood[0], hood[1], s, 'front');
        I.volcanoFront(g, t, o);
    }

    // =========================================================================================
    // Shot 2 · «The plug pops», bar 139: closer. The column lifts the car; the fans catch on one per beat
    // =========================================================================================
    const V2 = { k: 1.3, cx: 469, cy: 424.6 }; // the car a little right of the middle: the tail and the fans are inside the glass
    const GRAB = [T_POP, at(9), at(10), at(11)]; // when each link's mitts close
    const JUMP = 4 * FR; // how long before that it leaves the ground
    function popShot(g, t) {
        const Pu = S.pulseAt(t), e = 0.05 + 0.25 * seg(t, T_POP, T_ROOF), o = { view: V2, rumble: 1, erupt: e, t };
        I.volcano(g, t, o);
        const T = I.volcanoTop(o), s = T.s, rest = I.volcanoTop({ view: V2, t, rumble: 1, erupt: 0 }), sh = [rest.x - toScreen(V2, [500, 640])[0], rest.y - toScreen(V2, [500, 640])[1]];
        // the pop: a flash out of the crater, behind the car
        const d0 = dr(t, T_POP);
        if (d0 < 3) {
            const c = toScreen(V2, [512, 630]), k = [1, 1.25, 0.8][d0];
            C.burst(g, c[0], c[1], { r0: 250 * k, r1: 430 * k, n: 15, seed: 'solo2-pop', fill: K.yellow, ink: K.ink, lw: 3.2, sy: 0.72 });
            C.burst(g, c[0], c[1], { r0: 150 * k, r1: 280 * k, n: 12, seed: 'solo2-pop2', fill: K.white, lw: 0, sy: 0.72, rot: 0.2 });
        }
        const n = GRAB.filter((gt) => on(t, gt)).length;
        const waiting = (i) => !on(t, GRAB[i] - JUMP) && fanStand(g, t, V2, i, FANS[i].at, 1, sh);
        waiting(3);
        waiting(2);
        const bn = Math.max(0, thud(t, T_POP, 1, 0.35)), ho = { swing: 1 + 1.6 * Math.max(...GRAB.map((gt) => (on(t, gt) ? 1 - seg(t, gt, gt + 0.4) : 0))) };
        F.ride(g, t, T.x, T.y, s, { spin: 0, exhaust: 0, bounce: bn, devil: { mood: 'laugh', solo: 1, shred: 1 }, cactus: { mouth: 'oh' } });
        I.volcanoFront(g, t, o);
        P.hangers(g, t, T.x, T.y, s, { ...ho, bounce: bn, n });
        // whoever is in the air: from where it stood to the hooves it is about to catch, two drawings
        for (let i = 1; i < 4; i++) {
            if (!on(t, GRAB[i] - JUMP) || on(t, GRAB[i])) continue;
            const u = [0.42, 0.8][Math.min(1, dr(t, GRAB[i] - JUMP))], stand = toScreen(V2, FANS[i].at), lk = P.LINKS[i], un = lk.kind === 'imp' ? s * P.IMP : s;
            const from = [stand[0] + sh[0] + lk.grip[0] * un, stand[1] + sh[1] + lk.grip[1] * un], to = P.hangerPoints(t, T.x, T.y, s, { ...ho, bounce: bn })[i];
            P.hanger(g, i, lerp(from[0], to.grip[0], u), lerp(from[1], to.grip[1], u) - 26 * Math.sin(u * PI), s, lerp(0, to.ang, u) + (i === 3 ? -0.3 : 0.12) * (1 - u), i === 3 ? { jaw: 1 } : { mood: 'awe' });
        }
        waiting(1);
    }

    // =========================================================================================
    // Shot 3 · «Through the roof», bar 140: past the lighting rig and out through the cavern's roof
    // =========================================================================================
    const BREAK = at(14), RS = 70, R_HIT = 450; // the beat the roof goes; the car's scale; its ground point as its backline meets the rock
    const BOMBS = [[2, 330, 0], [5, 650, 1], [8, 448, 2], [11, 760, 3], [14, 250, 4]]; // frame after the cut, x, which cut it opens
    function roofShot(g, t) {
        const y = on(t, BREAK) ? lerp(R_HIT, 262, seg(t, BREAK, T_OUT)) : lerp(1050, R_HIT, seg(t, T_ROOF, BREAK));
        const tb = on(t, BREAK) ? twos(t, BREAK) - BREAK + 1 / 24 : -1, crack = seg2(t, T_ROOF + 2 * FR, BREAK - 2 * FR);
        P.roofSet(g, t, { crack, tb, blast: seg(t, T_ROOF + 0.2, BREAK) });
        // the bombs the column throws ahead of the car: each one strikes the roof
        for (const [f, x] of BOMBS) {
            const t1 = T_ROOF + f * FR, u = (t - (t1 - 5 * FR)) / (5 * FR), yr = P.roofEdge(x);
            if (u >= 0 && u < 1) {
                const by = lerp(1000, yr + 14, u), bx = x + (500 - x) * 0.25 * (1 - u);
                C.poly(g, [[bx - 9, by + 6], [bx + (500 - x) * 0.06, by + 62], [bx + 9, by + 6]], { fill: K.orange, ink: K.ink, lw: 2.8 });
                g.beginPath();
                g.arc(bx, by, 13, 0, TAU);
                g.fillStyle = K.yellow;
                g.fill();
                g.strokeStyle = K.ink;
                g.lineWidth = 2.8;
                g.stroke();
            } else if (u >= 1 && dr(t, t1) < 2 && !on(t, BREAK)) C.burst(g, x, yr + 6, { r0: 22, r1: 46 - 10 * dr(t, t1), n: 8, seed: 'solo2-bomb' + f, fill: K.yellow, ink: K.ink, lw: 2.8 });
        }
        const k = seg(t, T_ROOF, T_ROOF + 0.12);
        P.column(g, t, 512, 1090, y, { w: 390, k: 1, bombs: false });
        if (on(t, BREAK) && dr(t, BREAK) < 3) {
            const kk = [1, 1.22, 0.85][dr(t, BREAK)];
            C.burst(g, 500, 196, { r0: 250 * kk, r1: 420 * kk, n: 16, seed: 'solo2-break', fill: K.yellow, ink: K.ink, lw: 3.2, sy: 0.6 });
            C.burst(g, 500, 196, { r0: 150 * kk, r1: 270 * kk, n: 12, seed: 'solo2-break2', fill: K.white, lw: 0, sy: 0.6, rot: 0.2 });
        }
        const jolt = Math.max(0, thud(t, BREAK, 1, 0.3));
        F.ride(g, t, 500, y, RS, { spin: 0, exhaust: 0, bounce: jolt, devil: { mood: 'laugh', solo: 1, shred: 1 }, cactus: on(t, BREAK - 4 * FR) && !on(t, BREAK + 0.3) ? { squash: 0.2, mouth: 'oh' } : {} });
        P.column(g, t, 512, 1090, y, { w: 390, k, part: 'front' });
        P.hangers(g, t, 500, y, RS, { bounce: jolt, swing: 1.2 + 1.2 * bump(t, BREAK, 0.4) });
        P.roofRubble(g, tb);
    }

    // =========================================================================================
    // Shot 4 · «Out», bars 141–144: the night desert. The road bursts, the car climbs on its rockets
    // =========================================================================================
    const BURST = at(17), ROCKETS = B(142), RISE = 0.95, COUGH = at(29), WIND2 = at(23), CHORD2 = B(143);
    const CAR = F.CAR, SPIN = 12;
    function outShot(g, t) {
        const Y = F.Y(t), Pu = S.pulseAt(t), d = C.drawing(t);
        const o = { town: { lights: 1, wake: seg(t, T_OUT, B(144)) }, speedLines: 0.4 * seg(t, B(142), B(143)) };
        W.ascent(g, t, Y, o);
        const [ax, ay, m] = W.site(Y).crater, lw = 3.2 / m;
        const land = (fn) => {
            g.save();
            g.translate(ax, ay);
            g.scale(m, m);
            g.lineJoin = 'round';
            fn();
            g.restore();
        };
        if (!on(t, BURST)) {
            // the ground lifts and splits: it judders on twos
            const k = 0.55 + 0.45 * seg2(t, T_OUT, BURST - 2 * FR), j = [[0, 0], [2.4, -1.6], [-2, 1.4], [1.6, 1.8]][((d % 4) + 4) % 4];
            land(() => {
                g.translate(j[0], j[1]);
                P.mound(g, k * pop(t, T_OUT, 0.2), d, lw);
            });
            return;
        }
        const tb = t - BURST, tq = twos(t, BURST) - BURST, d0 = dr(t, BURST);
        // the burst itself, two drawings of it, and what it throws behind the car
        if (d0 < 3) {
            const kk = [1, 1.2, 0.8][d0];
            C.burst(g, ax, ay - 30 * m, { r0: 300 * kk * m, r1: 500 * kk * m, n: 17, seed: 'solo2-out', fill: K.yellow, ink: K.ink, lw: 3.2, sy: 0.66 });
            C.burst(g, ax, ay - 30 * m, { r0: 180 * kk * m, r1: 330 * kk * m, n: 12, seed: 'solo2-out2', fill: K.white, lw: 0, sy: 0.66, rot: 0.2 });
        }
        land(() => {
            P.dust(g, tq, 'back', lw);
            P.thrown(g, tb, false, lw);
        });
        // the car: up out of the dust on the column, to its place on the climb; from bar 142 it is exactly there
        const up = seg(tb, 0, RISE), cy = up < 1 ? CAR.y + 500 * (1 - back(up)) : CAR.y, s = CAR.s;
        const fall = on(t, ROCKETS) ? seg(t, ROCKETS, ROCKETS + 0.55) : 0, colTop = lerp(cy, ay + 40 * m, fall * fall), colO = { w: 255 * m, k: 1 - fall * 0.5 };
        const colBase = ay + 30 * m;
        g.save();
        // the column stands in the lava: nothing of it shows below the pool's near edge
        g.beginPath();
        g.rect(0, 0, 1000, ay + 22 * m);
        g.ellipse(ax, ay + 22 * m, 196 * m, 43 * m, 0, 0, PI);
        g.clip();
        P.column(g, t, ax + 8 * m, colBase, colTop, { ...colO, bombs: fall <= 0 });
        g.restore();
        // who plays what, bar by bar; nothing is overridden in bar 144
        const bar = !on(t, B(142)) ? 141 : !on(t, B(143)) ? 142 : !on(t, B(144)) ? 143 : 144;
        const cp = chordPose(t, WIND2, CHORD2), hood = F.hoodAt(CAR.x, cy, s);
        const devil = cp ?? (bar < 143 ? { mood: 'laugh', solo: 1, shred: 1 } : bar === 143 ? { mood: 'laugh' } : {});
        const burning = on(t, ROCKETS) && !on(t, COUGH + 4 / 12);
        const rk = !on(t, ROCKETS) ? 0 : on(t, COUGH) ? [0.7, 0.42, 0.18, 0][Math.min(3, dr(t, COUGH))] : pop(t, ROCKETS, 0.25) * (0.88 + 0.12 * Pu.pulse);
        const ride = { spin: t * SPIN };
        if (bar < 144) Object.assign(ride, { devil, solo: bar === 143 ? 1 : bar === 142 ? 0.3 : 0.6 });
        if (!on(t, COUGH + 4 / 12)) ride.exhaust = 0;
        else if (dr(t, COUGH + 4 / 12) < 4) ride.exhaust = [0.2, 0.35, 0.45, 0.55][dr(t, COUGH + 4 / 12)];
        if (bar === 141) ride.cactus = { mouth: 'oh' };
        chordBurst(g, t, CHORD2, hood[0], hood[1], s, 'back');
        F.ride(g, t, CAR.x, cy, s, ride);
        if (on(t, WIND2) && !on(t, CHORD2)) windmill(g, hood[0], hood[1], s, dr(t, WIND2), 0, cp.squash);
        if (burning) P.rockets(g, t, CAR.x, cy, s, { k: rk });
        // the last flame coughs out as a puff of smoke
        if (on(t, COUGH + 2 / 12) && dr(t, COUGH + 2 / 12) < 4) {
            const u = dr(t, COUGH + 2 / 12) / 4, mth = P.onBody([-4.82, -0.78], CAR.x, cy, s);
            P.puffs(g, [[mth[0] - 12 - 16 * u, mth[1] + 20 + 60 * u, 17 * (1 - u * 0.75)], [mth[0] - 2 - 6 * u, mth[1] + 44 + 80 * u, 12 * (1 - u)]], '#4a4470', '#6c66a0', 2.6);
        }
        if (up < 1 || fall < 1) P.column(g, t, ax + 8 * m, colBase, colTop, { ...colO, part: 'front' });
        P.hangers(g, t, CAR.x, cy, s, up < 1 ? { swing: 1 + 0.8 * (1 - up) } : {});
        chordBurst(g, t, CHORD2, hood[0], hood[1], s, 'front');
        W.ascentFront(g, t, Y, o);
        land(() => {
            P.thrown(g, tb, true, lw);
            P.dust(g, tq, 'front', lw);
        });
    }

    Seg.solo2 = {
        shots: [[T0, T_POP, 'Rumble'], [T_POP, T_ROOF, 'The plug pops'], [T_ROOF, T_OUT, 'Through the roof'], [T_OUT, T_END, 'Out']],
        // for the block that follows: the last frame is the climb with nothing of this block's own on it
        LAST: { ascent: { town: { lights: 1, wake: 1 }, speedLines: 0.4 }, ride: 'Finale.ride(g, t, CAR.x, CAR.y, CAR.s, { spin: t * 12 })', hangers: 'Solo2Props.hangers(g, t, CAR.x, CAR.y, CAR.s, {})' },
        draw(g, t, env) {
            g.save();
            g.lineJoin = 'round';
            if (t < T_POP - 1e-6) rumbleShot(g, t);
            else if (t < T_ROOF - 1e-6) popShot(g, t);
            else if (t < T_OUT - 1e-6) roofShot(g, t);
            else outShot(g, t);
            g.restore();
        },
        post() { return {}; },
    };
})();
