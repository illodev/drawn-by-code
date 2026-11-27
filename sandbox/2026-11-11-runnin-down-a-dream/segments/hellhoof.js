// «Hellhoof», bars 110–118 (155.67–168.38 s): the second half of the fourth chorus and four
// bars of the riff. The Devil's turning point: back in his box with his arms crossed while
// Hell goes wild for the band, he gives in to the music one body part at a time. A hoof taps;
// he stamps on it and the other one taps. He holds his knees and his tail ticks like a
// metronome; he grabs the tail and his shoulders go; he grips the rail and his head nods. On
// the title he catches himself mouthing «dream» and claps both mitts over his mouth. Nobody
// is watching (his two box ushers dance with their backs to him), so he lets go: a head-bang,
// air guitar, a grin that is not the salesman's. Then he finds the contract still in his coat.
// Props and acting: segments/hellhoof-props.js (HellhoofProps).
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, P = HellhoofProps, I = Inferno, twos = S.twos, B = S.B;
    const T0 = B(110), T111 = B(111), T112 = B(112), T116 = B(116), T118 = B(118), T119 = B(119);
    const bt = (k) => S.snap(S.beat(440 + k)); // beat k of the block (halves allowed) on its frame; bar 110 starts on 0
    const on = (t, a) => t >= a - 1e-6;
    const dr = (t, a) => Math.floor((t - a) * 12 + 1e-6); // drawings since a
    // a table of values, one per drawing since `a` (the last one holds); before `a`: `before`
    const steps = (t, a, list, before = list[list.length - 1]) => (on(t, a) ? list[Math.min(list.length - 1, dr(t, a))] : before);
    const lerp = (a, b, u) => a + (b - a) * u;

    // --- acting: poses keyed on the song's clock ----------------------------------------------
    const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
    const mix = (a, b, u) => {
        if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * u;
        if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) return a.map((v, i) => mix(v, b[i], u));
        if (isObj(a) && isObj(b)) {
            const o = {};
            for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) o[k] = mix(a[k], b[k], u);
            return o;
        }
        return u >= 0.5 ? b : a; // a mouth, a pair of shut eyes: the new drawing, on the hit's own frame
    };
    const merge = (a, p) => {
        const o = { ...a };
        for (const k in p) o[k] = isObj(a[k]) && isObj(p[k]) ? merge(a[k], p[k]) : p[k];
        return o;
    };
    // A track of poses: [at, what changes, how long it takes (s), 'snap' | 'ease']. A snap is
    // already 0.6 of the way on its own frame, overshoots and settles, on twos from its hit.
    function track(base, keys) {
        const full = [];
        let cur = base;
        for (const [at, part, dur = 2 / 12, kind = 'snap'] of keys) {
            cur = merge(cur, part);
            full.push({ at, pose: cur, dur, kind });
        }
        return (t) => {
            let i = -1;
            for (let j = 0; j < full.length; j++) if (on(t, full[j].at)) i = j;
            if (i < 0) return { ...base }; // a copy: the shots add to it, and a shared pose would carry that into the next frame
            const k = full[i], prev = i ? full[i - 1].pose : base, u = E.seg(twos(t, k.at), k.at, k.at + k.dur);
            if (k.kind === 'ease') return { ...mix(prev, k.pose, E.inOut(u)), face: u >= 0.4 ? k.pose.face : prev.face };
            return { ...mix(prev, k.pose, 0.6 + 0.4 * E.back(u)), face: k.pose.face }; // the face is a new drawing, whole, on the hit's own frame
        };
    }
    const face = (eye, brow, mouth, extra = {}) => ({
        eye: { h: 0.165, lx: 0, ly: 0, lid: 0, low: 0, ph: 0.125, shut: null, ...eye },
        brow: { tilt: 0.045, raise: 0, cock: 0, ...brow }, mouth, mk: 1, droop: 0, sweat: 0, ...extra,
    });
    const F = {
        // arms crossed, jaw set, glaring down at the stage
        set: face({ h: 0.155, lx: -0.8, ly: 0.45, lid: 0.06, ph: 0.1 }, { tilt: 0.09 }, 'grit', { droop: 0.03 }),
        hm: face({ h: 0.165, lx: 0.1, ly: 1, ph: 0.085 }, { tilt: 0.06, cock: 0.05 }, 'grit', { droop: 0.03 }),
        appalled: face({ h: 0.225, lx: -0.35, ly: 1, ph: 0.075 }, { tilt: -0.05, raise: 0.045 }, 'o', { mk: 0.85, droop: 0.08 }),
        glare: face({ h: 0.14, lx: -0.35, ly: 1, ph: 0.085, lid: 0.16 }, { tilt: 0.095 }, 'grit', { droop: 0.03 }),
        ouch: face({ shut: 'tight' }, { tilt: 0.09 }, 'grit', { droop: 0.06 }),
        smug: face({ h: 0.12, lx: -0.2, ly: 0.9, ph: 0.07, lid: 0.3 }, { tilt: 0.06, cock: 0.045 }, 'flat', { mk: 1.3, droop: -0.015 }),
        // holding his knees down
        strain: face({ h: 0.15, lx: 0, ly: 1, ph: 0.085, lid: 0.1 }, { tilt: 0.09 }, 'grit', { droop: 0.04 }),
        phew: face({ h: 0.12, ly: 0.5, ph: 0.06, lid: 0.55 }, { tilt: 0.0, raise: 0.01 }, 'flat', { mk: 1.1 }),
        ear: face({ h: 0.17, lx: 0.9, ly: -0.2, ph: 0.09, lid: 0.3 }, { tilt: 0.02, cock: 0.06 }, 'flat', { mk: 1.1 }),
        tailR: face({ h: 0.215, lx: 1, ly: -0.6, ph: 0.075 }, { tilt: -0.045, raise: 0.04 }, 'frown', { droop: 0.07 }),
        tailL: face({ h: 0.215, lx: 0.55, ly: -0.8, ph: 0.075 }, { tilt: -0.045, raise: 0.04 }, 'frown', { droop: 0.07 }),
        gotcha: face({ h: 0.15, lx: 0.9, ly: -0.5, ph: 0.09, lid: 0.12 }, { tilt: 0.09 }, 'grit', { droop: 0.03 }),
        shoulders: face({ h: 0.22, lx: -0.9, ly: 0.2, ph: 0.075 }, { tilt: -0.05, raise: 0.04 }, 'wobble', { droop: 0.06 }),
        brace: face({ h: 0.2, lx: 0, ly: 0, ph: 0.08 }, { tilt: 0.07, raise: 0.02 }, 'grit', { droop: 0.04 }),
        // the nod: his eyes go up to his own pompadour, the mouth will not stay straight
        fight: face({ h: 0.2, lx: 0, ly: -1, ph: 0.075 }, { tilt: -0.04, raise: 0.03 }, 'wobble', { droop: 0.04 }),
        down: face({ h: 0.13, lx: -0.8, ly: 0.3, ph: 0.085, lid: 0.4 }, { tilt: -0.015 }, 'oo', {}),
        a: face({ h: 0.13, lx: -0.8, ly: 0.3, ph: 0.085, lid: 0.4 }, { tilt: -0.015 }, 'flat', { mk: 0.8 }),
        dream: face({ h: 0.12, lx: -0.8, ly: 0.3, ph: 0.08, lid: 0.45 }, { tilt: -0.02, raise: 0.01 }, 'o', { mk: 1.05 }),
        caught: face({ h: 0.235, lx: 0, ly: 0, ph: 0.065 }, { tilt: -0.05, raise: 0.05 }, 'flat', { droop: 0.08 }),
        caughtL: face({ h: 0.235, lx: -1, ly: 0.1, ph: 0.065 }, { tilt: -0.05, raise: 0.05 }, 'flat', { droop: 0.08 }),
        caughtR: face({ h: 0.235, lx: 1, ly: 0.1, ph: 0.065 }, { tilt: -0.05, raise: 0.05 }, 'flat', { droop: 0.08 }),
        sigh: face({ shut: 'happy' }, { tilt: -0.02, raise: 0.0 }, 'flat', { mk: 1.2 }),
        nod: face({ shut: 'happy' }, { tilt: -0.02, raise: 0.01 }, 'smile', { droop: -0.01 }),
        joy: face({ shut: 'happy' }, { tilt: -0.025, raise: 0.02 }, 'joy', { droop: -0.02 }),
        // the contract
        huh: face({ h: 0.2, lx: 0.2, ly: 1, ph: 0.08 }, { tilt: -0.03, raise: 0.03 }, 'oo', { mk: 0.8 }),
        read: face({ h: 0.16, lx: 0, ly: 1, ph: 0.085, lid: 0.12 }, { tilt: 0.0, cock: 0.03 }, 'flat', { mk: 0.9 }),
        stage: face({ h: 0.165, lx: -1, ly: 0.35, ph: 0.09 }, { tilt: -0.015, raise: 0.01 }, 'smile', { mk: 0.7 }),
        read2: face({ h: 0.16, lx: 0, ly: 1, ph: 0.085, lid: 0.12 }, { tilt: -0.01, raise: 0.0 }, 'smile', { mk: 0.8 }),
        real: face({ h: 0.16, lx: -1, ly: 0.35, ph: 0.09, low: 0.22 }, { tilt: -0.02, raise: 0.012 }, 'smile', { droop: -0.015 }),
    };
    const BASE = { squash: 0, lean: 0, rock: 0, dy: 0, headDy: 0, headTilt: 0, quiff: 0, quiffX: 0, lock: 0, lockSw: 0, shrugR: 0, shrugL: 0, handR: [-0.5, -0.5], handL: [0.5, -0.5], mood: 'angry', face: F.set, over: null };
    const CROSS = { handR: [0.27, -0.8], handL: [-0.27, -0.715] }; // arms crossed, high on the chest
    const KNEES = { handR: [-0.3, -0.42], handL: [0.3, -0.42] }; // down behind the parapet
    const RAIL = { handR: [-0.15, -0.585], handL: [0.15, -0.585] }; // over the rail's velvet roll (drawn in front of it)
    const MOUTH = { handR: [-0.05, -1.2], handL: [0.06, -1.19] }; // both mitts over his mouth
    const HOLD = { handR: [-0.245, -0.5], handL: [0.245, -0.5] }; // the contract's two edges, out over the rail

    // --- the close shot: him in his box, the show past him -------------------------------------
    const CL = { x: 620, y: 772, s: 225 }; // his floor point and scale in the close shots
    const USH = [[-0.64, 0], [1.0, 1]]; // the ushers' places along the rail (his units) and whose turn it is
    // The two ushers at the rail, on their stools, facing the house: they hop in turn, mitts pumping.
    function ushers(g, t, x, y, s) {
        const Pu = S.pulseAt(t), ph = Pu.k + Pu.since, u = 0.42 * s;
        for (const [ux, par] of USH) {
            const mine = (Pu.k + par) % 2 === 0, sgn = par ? -1 : 1;
            P.usher(g, x + ux * s, y - 0.48 * s, u, {
                hop: (mine ? 0.3 : 0.1) * Math.sin(Math.PI * Math.min(1, Pu.since)), squash: (mine ? 0.09 : 0.04) * Pu.pulse,
                sway: 0.09 * sgn * Math.sin(ph * Math.PI), armUp: 0.55 + 0.45 * Math.cos(ph * Math.PI) * sgn, look: -1, mood: 'grin', tail: 0.06 * Math.sin(ph * Math.PI),
            });
        }
    }
    /**
     * Him in his box at (x, y, s), everything in its depth:
     *   o: { pose (HellhoofProps.devil's, plus over: 'R' | 'L' | 'both' the arms drawn in front of the rail),
     *        tail (seven control points, HellhoofProps.TAIL), held(g, L) drawn in his frame in front of the rail
     *        and under the mitts that are over it, jolt (the box's y offset) }
     */
    function inBox(g, t, x, y0, s, o) {
        const pose = o.pose, y = y0 + (o.jolt ?? 0), py = y - (pose.dy ?? 0) * s, behind = pose.over === 'both' ? null : pose.over === 'R' ? 'L' : pose.over === 'L' ? 'R' : 'both';
        I.box(g, x, y, s, { part: 'back', t });
        P.tail(g, x, py, s, pose, o.tail ?? P.TAIL.rest(0));
        P.devil(g, x, py, s, pose);
        if (behind) P.arms(g, x, py, s, pose, behind);
        if (o.mid) o.mid(g);
        ushers(g, t, x, y, s);
        I.box(g, x, y, s, { part: 'front', t });
        if (o.held) P.body(g, x, py, s, pose, (L) => o.held(g, L));
        if (pose.over) P.arms(g, x, py, s, pose, pose.over);
    }
    function close(g, t, o) {
        P.past(g, t, { title: o.title });
        inBox(g, t, CL.x, CL.y, CL.s, o);
        P.sweep(g, t);
        if (o.fx) o.fx(g);
    }
    // a point of his frame on screen in the close shot (no lean, no squash)
    const at = (c, p) => [c.x + p[0] * c.s, c.y + p[1] * c.s];

    // =========================================================================================
    // Shot 1 · «Arms crossed», bar 110: back in his box, jaw set, the lights sweeping across him;
    // something below the rail keeps bumping him and he looks down
    // =========================================================================================
    const act1 = track({ ...BASE, ...CROSS, face: F.set }, [
        [bt(2), { face: F.hm, headDy: 0.03 }, 2 / 12],
        [bt(3), { face: F.appalled, headDy: 0.07, handR: [0.22, -0.79], handL: [-0.22, -0.705] }, 2 / 12],
    ]);
    function crossed(g, t) {
        const pose = act1(t);
        // his own hoof, tapping out of sight, shakes him on every beat
        pose.dy = [0, 1, 2, 3].reduce((a, k) => (on(t, bt(k)) ? [0.014 + 0.006 * k, 0.006, 0][Math.min(2, dr(t, bt(k)))] : a), 0);
        close(g, t, { pose, tail: P.TAIL.rest(0) });
    }

    // =========================================================================================
    // Shot 2 · «The hoof», bar 111: at floor level inside the box, from his chin down. One hoof
    // taps the beat; he stamps on it with the other; now that one taps.
    // =========================================================================================
    const CUT = { x: 360, y: 865, s: 860 };
    const TAP = [0, 0, 0.13, 0.15, 0.08]; // a tap, a drawing at a time from its beat: down on it, up between
    const STAMP = bt(6), WIND = STAMP - 4 / 12, DRUM = bt(7) - 2 / 12; // the stamp, its wind-up, the second hoof's drumming
    const act2 = track({ ...BASE, ...CROSS, face: null, headDy: -0.06 }, [
        [bt(5), { handR: [-0.27, -0.5], handL: [0.27, -0.5], squash: -0.03 }, 2 / 12], // fists down: that is enough
        [STAMP, { handR: [-0.38, -1.4], handL: [0.4, -1.4], squash: 0.08 }, 2 / 12], // it was his own hoof: both arms go up
        [bt(6.5), { ...CROSS, squash: 0 }, 2 / 12],
        [bt(7), { handR: [-0.24, -0.4], handL: [0.2, -0.4], squash: 0.04 }, 2 / 12], // down onto his knees, to hold them
    ]);
    function hoof(g, t) {
        const { x, s } = CUT, pose = act2(t), d6 = dr(t, STAMP), pinned = on(t, STAMP);
        const y = CUT.y + (pinned ? [18, -8, 3, 0][Math.min(3, d6)] : 0);
        g.fillStyle = I.R.wallD;
        g.fillRect(-20, -20, 1040, 1040);
        I.box(g, x, y, s, { part: 'back', t });
        carpet(g, x, y, s);
        // the legs. A: the hoof on screen left, the one that taps. B: the other, that stamps on it.
        const tapA = [bt(4), bt(5)].reduce((a, tb) => (on(t, tb) ? tb : a), null), dA = tapA == null ? 9 : dr(t, tapA);
        const drumD = dr(t, DRUM), hitB = on(t, DRUM) && drumD % 2 === 1; // B's taps: every other drawing from bar 111's last beat
        const A = pinned ? { x: 0, y: 0, sq: hitB ? 0.3 : [0.36, 0.22, 0.16][Math.min(2, d6)] } : { x: 0, y: -TAP[Math.min(4, dA)], sq: dA === 0 ? 0.12 : 0 };
        const liftB = on(t, DRUM) ? (drumD % 2 ? 0 : 0.1) : 0;
        const Bh = pinned ? { x: -0.33, y: -0.115 * (1 - A.sq) + 0.004 - liftB, sq: hitB ? 0.14 : [0.3, 0.12, 0][Math.min(2, d6)] }
            : on(t, WIND) ? { x: [0.02, 0, -0.12, -0.26][Math.min(3, dr(t, WIND))], y: [-0.1, -0.2, -0.245, -0.235][Math.min(3, dr(t, WIND))], sq: 0 } : { x: 0, y: 0, sq: 0 };
        // the tail lies curled on the carpet, its end twitching; the stamp sends it bolt upright
        const bolt = pinned ? [1, 0.9, 0.35, 0][Math.min(3, d6)] : 0, tw = dA < 2 || hitB ? 1 : 0;
        P.tail(g, x, y, s, { squash: pose.squash }, P.mixPts(P.TAIL.floor(tw), P.TAIL.bolt(d6 % 2 ? 1 : -1), bolt));
        P.body(g, x, y, s, pose, (L) => {
            g.fillStyle = Devil.P.shadow;
            g.beginPath();
            g.ellipse(0.06, 0, 0.6, 0.065, 0, 0, C.TAU);
            g.fill();
            P.legs(g, L, { R: A, L: Bh });
        });
        P.devil(g, x, y, s, { ...pose, clip: 'legs' });
        P.arms(g, x, y, s, pose);
        // what the hooves do to the carpet
        if (!pinned && tapA != null && dA < 2) {
            P.hit(g, x - 0.035 * s, y - 0.012 * s, 44, dA, 'hellhoof-tap');
            P.puff(g, x - 0.4 * s, y - 0.02 * s, 15, (dA + 0.5) / 3, -1);
        }
        if (pinned) {
            P.hit(g, x - 0.19 * s, y - 0.11 * s, 150, d6, 'hellhoof-stamp');
            P.puff(g, x - 0.41 * s, y - 0.03 * s, 30, (twos(t, STAMP) - STAMP + 0.06) / 0.5, -1);
            P.puff(g, x + 0.12 * s, y - 0.025 * s, 26, (twos(t, STAMP) - STAMP + 0.06) / 0.5, 1);
            if (hitB) P.hit(g, x - 0.05 * s, y - 0.12 * s, 50, 0, 'hellhoof-drum');
        }
        P.sweep(g, t, { k: 0.6 });
    }
    // The box's carpet at floor level: a runner with a gold border, a row of little forks woven
    // along its far side and a fringe on its near edge, over the box's own plain one.
    function carpet(g, x, y, s) {
        const BX = I.BOX, D = Cast.D, z0 = -0.45, z1 = 0.55;
        const Pt = (px, z) => [x + (px + D[0] * z) * s, y + D[1] * z * s];
        g.save();
        g.lineJoin = 'round';
        C.poly(g, [Pt(BX.x0 + 0.33, z0 + 0.19), Pt(BX.x1 - 0.33, z0 + 0.19), Pt(BX.x1 - 0.33, z1 - 0.16), Pt(BX.x0 + 0.33, z1 - 0.16)], { ink: K.gold, lw: 5 });
        g.strokeStyle = '#c4287c';
        g.lineWidth = 3.2;
        g.lineCap = 'round';
        for (let i = 0; i < 12; i++) {
            const c = Pt(BX.x0 + 0.46 + i * 0.16, z1 - 0.29), u = s / 70;
            g.beginPath();
            g.moveTo(c[0], c[1] + u);
            g.lineTo(c[0], c[1] - u);
            g.moveTo(c[0] - u * 0.9, c[1] - u);
            g.lineTo(c[0] - u * 0.9, c[1] - u * 0.2);
            g.lineTo(c[0] + u * 0.9, c[1] - u * 0.2);
            g.lineTo(c[0] + u * 0.9, c[1] - u);
            g.stroke();
        }
        const a = Pt(BX.x0 + 0.25, z0 + 0.12), b = Pt(BX.x1 - 0.25, z0 + 0.12), n = 46, fr = [];
        for (let i = 0; i <= n; i++) fr.push([lerp(a[0], b[0], i / n), a[1] + (i % 2 ? s / 30 : 0)]);
        C.poly(g, [a, ...fr, b], { fill: K.gold, ink: K.ink, lw: 2.6 });
        g.restore();
    }

    // =========================================================================================
    // Shot 3 · «One part at a time», bars 112–115: he holds his knees and his tail ticks; he grabs
    // the tail and his shoulders go; he grips the rail and his head nods. The title lands on the
    // banner past him; he mouths «dream» and claps both mitts over his mouth. He looks left, he
    // looks right: his two ushers are dancing with their backs to him. He lets his mitts down.
    // =========================================================================================
    const TITLE = { at: [0, 2, 4].map((f) => S.snap(S.TITLES[7][0]) + f / 24), out: S.snap(S.TITLES[7][3]) }; // the whole title on «runnin'», gone when the phrase is over
    const T_DOWN = S.snap(S.TITLES[7][1]), T_A = S.snap(162.34), T_DREAM = S.snap(S.TITLES[7][2]), T_CLAP = T_DREAM + 2 / 24;
    const TICK = 0.44, GRAB_ANG = -0.3, GRAB_U = 0.8; // the metronome's swing; where it is when he takes it; how far up it his mitt closes
    const tick = (ang, lag = 0) => P.TAIL.tick(ang, lag);
    const GRAB = P.tailAt(tick(GRAB_ANG), GRAB_U);
    const act3 = track({ ...BASE, ...KNEES, squash: 0.06, dy: -0.03, headDy: 0.06, face: F.strain }, [
        [bt(9), { face: F.phew, squash: 0.03, dy: -0.02, headDy: 0.04 }, 3 / 12, 'ease'],
        [bt(10) + 2 / 12, { face: F.ear }, 2 / 12],
        [bt(11), { face: F.tailL, headDy: 0.02, headTilt: 0.03, squash: 0.01, dy: 0 }, 2 / 12],
        [bt(12), { face: F.tailR }, 2 / 12],
        [bt(13), { face: F.gotcha, handL: [GRAB[0] - 0.02, GRAB[1] + 0.03], squash: 0, headDy: 0.02, dy: 0 }, 2 / 12],
        [bt(14), { face: F.shoulders, headTilt: 0 }, 2 / 12],
        [bt(16), { face: F.brace, ...RAIL, over: 'both', headDy: 0, squash: 0.05 }, 2 / 12],
        [bt(17), { face: F.fight, squash: 0 }, 2 / 12],
        [T_DOWN, { face: F.down }, 2 / 12],
        [T_A, { face: F.a }, 1 / 12],
        [T_DREAM, { face: F.dream }, 1 / 12],
        [T_CLAP, { face: F.caught, ...MOUTH, over: null, squash: 0.05, headDy: -0.02, lock: 0.3 }, 2 / 12],
        [bt(20), { face: F.caughtL, lean: -0.035, headTilt: -0.03, squash: 0.02 }, 2 / 12],
        [bt(21), { face: F.caughtR, lean: 0.035, headTilt: 0.03 }, 3 / 12],
        [bt(22), { face: F.sigh, lean: 0, headTilt: 0, ...RAIL, over: 'both', squash: 0.07, headDy: 0.05 }, 4 / 12, 'ease'],
        [bt(23), { face: F.nod, squash: 0.02, headDy: 0 }, 2 / 12],
    ]);
    // the tail's swing on a beat: where it was, where it goes, a drawing at a time
    const swing = (t, tb, from, to) => lerp(from, to, [0.72, 1.14, 0.96, 1][Math.min(3, dr(t, tb))]);
    const wag = (t, a = 0.07) => {
        const Pu = S.pulseAt(t);
        return P.TAIL.rest(a * Math.sin((Pu.k + Pu.since) * Math.PI));
    };
    function tail3(t) {
        if (!on(t, bt(10))) return P.TAIL.rest(0);
        if (!on(t, bt(11))) return P.mixPts(P.TAIL.rest(0), tick(TICK, 0), [0.6, 1.08, 0.98, 1][Math.min(3, dr(t, bt(10)))]);
        if (!on(t, bt(12))) return tick(swing(t, bt(11), TICK, -TICK), dr(t, bt(11)) === 0 ? -0.3 : 0);
        if (!on(t, bt(13))) return tick(swing(t, bt(12), -TICK, TICK), dr(t, bt(12)) === 0 ? 0.3 : 0);
        if (!on(t, bt(16))) {
            // caught on its way back: the end above his mitt goes on trying
            const d = dr(t, bt(13)), a = d === 0 ? lerp(TICK, GRAB_ANG, 0.8) : GRAB_ANG;
            return tick(a, d < 1 ? -0.4 : (d % 2 ? 0.34 : -0.34));
        }
        // let go when he takes the rail: it falls back, then ticks on behind him with everything else
        if (!on(t, bt(17))) return P.mixPts(tick(GRAB_ANG, 0), P.TAIL.rest(0), [0.5, 0.9, 1][Math.min(2, dr(t, bt(16)))]);
        if (on(t, bt(22))) return wag(t);
        if (on(t, T_CLAP)) return P.mixPts(tick(0.36, 0), P.TAIL.rest(-0.05), [0.6, 1][Math.min(1, dr(t, T_CLAP))]); // caught: it stops dead
        const k = Math.max(0, Math.min(2, S.pulseAt(t).k - 440 - 17)), tb = bt(17 + k), sg = k % 2 ? -1 : 1;
        return k === 0 ? P.mixPts(P.TAIL.rest(0), tick(0.36, 0), [0.6, 1.08, 1][Math.min(2, dr(t, tb))]) : tick(swing(t, tb, -0.36 * sg, 0.36 * sg), 0);
    }
    function parts(g, t) {
        const pose = act3(t), Pu = S.pulseAt(t);
        if (!on(t, bt(9))) pose.squash += 0.05 * E.bump(twos(t, T112), T112, 0.25);
        // the shoulders, from bar 113's third beat until he takes the rail: one up, one down, in eighths
        if (on(t, bt(14)) && !on(t, bt(16))) {
            const d = dr(t, bt(14)), sg = Math.floor(d / 2) % 2 ? -1 : 1, k = d % 2 ? 0.8 : 1.1;
            pose.rock = 0.1 * sg * k;
            pose.shrugR = 0.05 * sg * k;
            pose.shrugL = -0.05 * sg * k;
            pose.headTilt = -0.085 * sg * k;
            pose.face = { ...pose.face, eye: { ...pose.face.eye, lx: -sg * 0.9 }, sweat: E.seg(t, bt(14), bt(16)) };
        }
        // the nod, from bar 114's second beat: down on the beat, the pompadour a drawing behind
        const jolt = on(t, bt(16)) ? steps(t, bt(16), [9, -4, 0], 0) : 0, nodAt = (tb, amp) => {
            const d = dr(t, tb);
            pose.headDy += amp * [0.1, 0.075, -0.01, -0.03, -0.03][Math.min(4, d)];
            pose.quiff = amp * [0.1, 0.8, 0.55, 0.2, 0.1][Math.min(4, d)] * 0.8;
            pose.quiffX = [0.02, -0.03, 0.03, 0, 0][Math.min(4, d)];
            pose.squash += 0.03 * amp * (d === 0 ? 1 : 0);
            return d;
        };
        if (on(t, bt(17)) && !on(t, T_CLAP)) {
            const k = Math.max(0, Math.min(2, Pu.k - 440 - 17)), d = nodAt(bt(17 + k), [0.7, 1, 1.25][k]);
            if (k >= 1) pose.lock = 0.3 + 0.14 * (d < 2 ? 1 : 0); // a lock comes loose on the second nod and stays
        } else if (on(t, T_CLAP) && !on(t, bt(20))) pose.quiff = [0.5, 0.2, 0][Math.min(2, dr(t, T_CLAP))];
        else if (on(t, bt(23))) nodAt(bt(23), 0.9); // the first nod he allows himself
        close(g, t, {
            pose, tail: tail3(t), title: on(t, TITLE.at[0]) ? TITLE : null, jolt,
            fx: (g2) => {
                const c = { ...CL, y: CL.y + jolt };
                if (on(t, bt(13)) && dr(t, bt(13)) < 2) {
                    const p = at(c, GRAB);
                    P.ticks(g2, p[0], p[1], 60, (dr(t, bt(13)) + 0.6) / 2.4, 5, -2.4, 0.9);
                }
                if (on(t, bt(16)) && dr(t, bt(16)) < 2) {
                    for (const hx of [RAIL.handR, RAIL.handL]) {
                        const p = at(c, hx);
                        P.ticks(g2, p[0], p[1] + 14, 46, (dr(t, bt(16)) + 0.6) / 2.4, 4, hx[0] < 0 ? Math.PI * 0.7 : -Math.PI * 0.3, hx[0] < 0 ? Math.PI * 1.3 : Math.PI * 0.3);
                    }
                }
            },
        });
    }

    // =========================================================================================
    // Shot 4 · «He lets go», bars 116–117: the box and the house. A proper head-bang on the
    // beats, then air guitar, eyes shut, a grin that is not the salesman's.
    // =========================================================================================
    const HV = { k: 1.4, cx: 700, cy: 530 }; // the camera on the set: his box on the right, the band on the left, the front rows below
    const FRET = [-0.84, -1.3], PICK = [0.0, -0.82]; // the air guitar: the mitt on its neck, the mitt that strums
    const SLAP = bt(31.5), WM = SLAP - 5 / 12; // the slap on his own chest that ends the windmill, and the windmill
    const act4 = track({ ...BASE, ...RAIL, over: 'both', lock: 0.3, face: F.joy }, [
        [bt(28), { handR: FRET, handL: PICK, over: null, lean: 0.1, headTilt: 0.05, headDy: -0.03 }, 2 / 12],
        [bt(30), { lean: 0.14, headTilt: 0.07, handR: [-0.88, -1.44] }, 2 / 12],
    ]);
    function house(g, t) {
        const Pu = S.pulseAt(t), { x, y, s } = I.stage(HV, 0).box;
        const pose = act4(t), k = Math.max(24, Math.min(31, Pu.k - 440)), d = dr(t, bt(k)), i = Math.min(4, d);
        const tail = P.TAIL.tick(swing(t, bt(k), k % 2 ? 0.4 : -0.4, k % 2 ? -0.4 : 0.4), 0); // the tail keeps time behind him
        if (!on(t, bt(28))) {
            // the head-bang: down on every beat, the pompadour over his face; up between them, the quiff thrown back
            pose.headDy += [0.17, 0.13, -0.05, -0.09, -0.09][i];
            pose.lean = [0, 0, 0.03, 0.04, 0.04][i];
            pose.lock = [1, 0.85, 0.2, 0.1, 0.1][i];
            pose.lockSw = [0, 0.4, -0.6, -0.3, 0][i];
            pose.quiff = [0, 0.1, 1, 0.85, 0.6][i];
            pose.quiffX = [0, 0, -0.04, 0.03, 0][i];
            pose.squash += [0.07, 0.04, -0.02, -0.03, -0.02][i];
            pose.face = { ...pose.face, mk: [1.15, 1.05, 0.9, 0.85, 0.85][i] };
        } else {
            // air guitar: the strumming mitt in eighths, the other up the neck in steps, the head thrown back
            const d8 = dr(t, bt(28)), up = d8 % 4 < 2 ? 1 : -1, fr = [0, 0.1, -0.06, 0.14][Math.floor(d8 / 2) % 4];
            pose.handL = [pose.handL[0] + 0.03 * up, pose.handL[1] + 0.085 * up];
            pose.handR = [pose.handR[0] - 0.44 * fr, pose.handR[1] - 0.66 * fr];
            pose.headDy += [0.06, 0.04, 0, -0.02, -0.02][i];
            pose.quiff = [0.2, 0.75, 0.5, 0.3, 0.2][i];
            pose.lock = 0.4 + 0.2 * (d < 2 ? 1 : 0);
            pose.squash += d === 0 ? 0.04 : 0;
            pose.rock = 0.03 * up;
            if (on(t, WM)) {
                // the windmill: the strumming arm goes once round and comes down on his own chest
                const dw = dr(t, WM), sh = P.SH_L;
                if (dw < 5) {
                    const a = Math.PI * 0.7 - (Math.PI * 2 * (dw + 0.5)) / 5.6, r = 0.62;
                    pose.handL = [sh[0] + Math.cos(a) * r, sh[1] + Math.sin(a) * r];
                } else {
                    pose.handL = [0.06, -0.78 + (dr(t, SLAP) === 0 ? 0.03 : 0)];
                    pose.squash += dr(t, SLAP) === 0 ? 0.05 : 0;
                    pose.face = dr(t, SLAP) >= 1 ? F.huh : pose.face;
                }
            }
        }
        P.house(g, t, HV, (g2) => {
            inBox(g2, t, x, y, s, { pose, tail });
            // notes off the guitar that is not there, one an eighth, up and away towards the stage
            for (let n = 0; n < 8; n++) {
                const a = S.snap(S.beat(440 + 28 + n * 0.5)), u = E.seg(twos(t, a), a, a + 0.7);
                if (!on(t, a) || u >= 1 || a >= WM - 1e-6) continue;
                const r = Motion.rng('hellhoof-note' + n), nx = x - (0.3 + 0.9 * u + 0.3 * r()) * s, ny = y - (1.05 + 0.9 * u + 0.5 * r()) * s + Math.sin(u * 7 + n) * 6;
                C.note(g2, nx, ny, 30 * Math.min(1, 0.6 + u * 3) * (u > 0.7 ? (1 - u) / 0.3 : 1), { kind: n % 3 ? 1 : 2, color: n % 2 ? K.white : K.yellow, lw: 3, rot: -0.2 + 0.3 * u });
            }
            if (on(t, SLAP) && dr(t, SLAP) < 2) P.ticks(g2, x + 0.06 * s, y - 0.8 * s, 40, (dr(t, SLAP) + 0.6) / 2.4, 5, -2.8, -0.3);
        });
    }

    // =========================================================================================
    // Shot 5 · «The contract», bar 118: close again. He opens his eyes: the contract is still in
    // his coat. He pulls it out, looks at it, at the stage, at it; and past it at the band.
    // =========================================================================================
    const OUT = T118 + 2 / 12, OPEN = bt(33); // the scroll comes out of the coat, rolled, in one mitt; on the bar's second beat it drops open
    const CTOP = -0.86; // the open contract hangs from here, out over the rail (his units)
    const LAST = { ...BASE, ...HOLD, over: 'both', lock: 0.28, headTilt: -0.035, face: F.real, mood: 'grin' }; // the block's last pose
    const act5 = track({ ...BASE, lock: 0.3, handR: RAIL.handR, handL: [0.07, -0.64], over: 'R', face: F.huh, headDy: 0.04, mood: 'grin' }, [
        [OUT, { handL: [0.44, -1.04], over: 'both', headDy: 0, face: { ...F.huh, eye: { ...F.huh.eye, lx: 0.8, ly: 0.2 }, mouth: 'flat' } }, 2 / 12],
        [OPEN, { ...HOLD, over: 'both', face: F.read, headDy: 0.03 }, 2 / 12],
        [bt(34), { face: F.stage, headTilt: -0.035, headDy: 0 }, 2 / 12],
        [bt(35), { face: F.read2, headTilt: 0, headDy: 0.03 }, 2 / 12],
        [bt(35.5), { face: F.real, headTilt: LAST.headTilt, headDy: 0, lock: LAST.lock }, 2 / 12],
    ]);
    // the contract at t, in his units: { x, y (its middle), ang, open }
    function contractAt(t, pose) {
        if (!on(t, OUT)) return null;
        if (!on(t, OPEN)) return { x: pose.handL[0] + 0.03, y: pose.handL[1] - 0.03, ang: -0.5, open: 0 }; // rolled, in one mitt
        const open = [0.45, 0.9, 1.07, 1][Math.min(3, dr(t, OPEN))];
        return { x: 0, y: CTOP + (0.6 * open + 0.02) / 2, ang: 0, open };
    }
    function contract(g, t) {
        const pose = act5(t), c = contractAt(t, pose);
        close(g, t, { pose, tail: wag(t), held: c ? (g2, L) => Devil.contract(g2, c.x, c.y, L, { ang: c.ang, open: c.open }) : null });
    }

    function draw(g, t, env) {
        if (t < T111 - 1e-6) crossed(g, t);
        else if (t < T112 - 1e-6) hoof(g, t);
        else if (t < T116 - 1e-6) parts(g, t);
        else if (t < T118 - 1e-6) house(g, t);
        else contract(g, t);
    }

    Seg.hellhoof = {
        shots: [[T0, T111, 'Arms crossed'], [T111, T112, 'The hoof'], [T112, T116, 'One part at a time'], [T116, T118, 'He lets go'], [T118, T119, 'The contract']],
        draw,
        post: () => ({}),
        // the block's last picture, for the block that follows: hold(g, t, o) draws the close shot at t with the last
        // pose (o.pose is merged over it; o.contract: { x, y, ang, open } in his units, false for none; o.held(g, L)
        // draws in his frame, in front of the rail and under his mitts)
        LAST: { close: CL, pose: LAST, contract: { x: 0, y: CTOP + 0.31, ang: 0, open: 1 }, past: P.PAST, house: P.HOUSE },
        hold(g, t, o = {}) {
            const pose = merge(LAST, o.pose ?? {}), c = o.contract === undefined ? Seg.hellhoof.LAST.contract : o.contract;
            close(g, t, { pose, tail: o.tail ?? wag(t), held: (g2, L) => {
                if (c) Devil.contract(g2, c.x, c.y, L, { ang: c.ang, open: c.open });
                if (o.held) o.held(g2, L);
            } });
        },
        dev: { F, face, track, inBox, close, ushers, CL, HV, CUT },
    };
})();
