// «Fade», bars 179–184 and the tape's run-out (253.125–264 s): the coda. After the show the Devil
// comes home to his dressing room (Skyward.backstage), tired and happy, bow tie undone, a towel
// round his neck; he stands the flaming guitar in its stand, takes from inside his coat the
// contract Tom autographed at the crossroads, now in a gilt frame, looks at it (the old rage
// flickers and turns into a small real smile), hangs it on the one empty nail of his wall, hops
// to straighten it, and leaves it crooked when it slips back. The camera pushes in until the
// sheet fills the picture. Then the tape runs out: the picture tears and rolls away, snow, and
// the VCR's blue the film began on, STOP in its display, the film's signature typed under it.
// His clothes, the guitar alone, the frame on its nail and the title generator's lettering are in
// segments/fade-props.js, with the face that acts (segments/hellhoof-props.js's, without his cold).
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, S = Song, Sk = Skyward, R = FadeProps;
    const T0 = S.B(179), n0 = 716, END = 264, EPS = 1e-6, DS = Sk.BACKSTAGE.devilS;
    const at = (k) => S.b(n0 + k); // beat k of this block, on its frame
    const F = (t) => Math.round(t * S.FPS);
    const dr = (t, a) => Math.floor((t - a) * 12 + EPS); // drawings since a (an event's own clock, on twos)
    const tab = (t, a, arr) => (t < a - EPS ? 0 : arr[dr(t, a)] ?? 0); // a per-drawing table from a
    const lerp = (a, b, u) => a + (b - a) * u, clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const seg = (t, a, b) => clamp((t - a) / (b - a)), smooth = (u) => u * u * (3 - 2 * u);
    // the block's events
    const SET = at(3), LIFT = SET - 4 / 12; // the guitar is in its cradle on SET
    const OUT = at(4), RAGE = at(5), CARRY = at(6) + 2 / 12, HEAVE = at(8), NAIL = at(9), TAP = at(11), SLIP = at(13), PUSH = at(13), CLOSE = at(18), GLINT = at(19) - 2 / 12;
    const TAPE = at(20), BLUE = TAPE + 9 / 24, TYPE = 261, SIGN = 'illodev x Claude', TYPED = TYPE + SIGN.length / 12;

    // --- where his hooves are ------------------------------------------------------------------------
    // A box person seen from the front walks sideways as a shuffle: the leading hoof steps out, the
    // other closes up. Each hoof has the place on the floor it would put him at; he stands midway.
    // [hoof, from, drawings, to, lift]
    const START = { R: [810, 930], L: [890, 930] };
    const MOVES = [
        // in from the right, tired: one hoof at a time, the trailing one dragged
        ['L', T0, 3, [810, 930], 0.015], ['R', T0 + 3 / 12, 3, [725, 930], 0.045], ['L', T0 + 6 / 12, 3, [725, 930], 0.015], ['R', T0 + 9 / 12, 3, [640, 930], 0.04], ['L', T0 + 1, 2, [640, 930], 0.015],
        // to the wall, under the nail
        ['R', CARRY, 2, [570, 900], 0.06], ['L', CARRY + 2 / 12, 1, [570, 900], 0], ['R', CARRY + 3 / 12, 2, [500, 870], 0.06], ['L', CARRY + 5 / 12, 1, [500, 870], 0],
        // he lands from the heave half a step back
        ['R', HEAVE + 4 / 12, 1, [500, 905], 0], ['L', HEAVE + 4 / 12, 1, [500, 905], 0],
        // and steps back to look at it as the camera goes in
        ['L', SLIP + 10 / 12, 3, [548, 950], 0.04], ['R', SLIP + 13 / 12, 3, [548, 950], 0.03],
    ];
    function hoof(h, t) {
        let p = START[h], lift = 0;
        for (const [hh, a, n, to, up] of MOVES) {
            if (hh !== h || t < a - EPS) continue;
            const u = Math.min(1, (dr(t, a) + 1) / n);
            lift = u < 1 ? up * Math.sin(Math.PI * u) : 0;
            p = [lerp(p[0], to[0], u), lerp(p[1], to[1], u)];
        }
        return { p, lift };
    }
    // his two hops (how far off the floor, by drawing) and what they do to his shape
    const hopAt = (t) => tab(t, HEAVE, [20, 46, 56, 40]) + tab(t, TAP - 2 / 12, [0, 44, 88, 72, 22]);
    const squashAt = (t) => tab(t, HEAVE - 2 / 12, [0.06, 0.11, -0.08, -0.1, -0.07, -0.02, 0.1, 0.05]) + tab(t, TAP - 2 / 12, [0.1, -0.08, -0.1, -0.08, -0.02, 0.09, 0.04])
        + tab(t, SET, [0.035, 0.015]) + tab(t, OUT, [-0.035, 0.02]) + 0.01 * Math.sin(((S.twos(t, T0) - T0) / 1.4) * C.TAU);

    // --- his acting --------------------------------------------------------------------------------
    const face = (eye, brow, mouth, mk = 1, droop = 0) => ({ eye: { h: 0.165, lx: 0, ly: 0, lid: 0, low: 0, shut: null, ...eye }, brow: { tilt: 0.045, raise: 0, cock: 0, ...brow }, mouth, mk, droop });
    const FACE = {
        tired: face({ lid: 0.45, low: 0.2, lx: -0.5 }, { tilt: -0.015, raise: -0.012 }, 'smile', 0.8, 0.035),
        fond: face({ lid: 0.35, low: 0.35, lx: 1, ly: 0.3 }, { tilt: -0.02 }, 'smile', 0.9, 0.02), // at the guitar
        reach: face({ lid: 0.3, lx: -0.3, ly: 0.8 }, { tilt: 0, raise: 0.01 }, 'flat', 1, 0.03), // into his coat
        read: face({ lid: 0.12, lx: -1, ly: -0.5 }, { tilt: 0, raise: 0.02 }, 'flat', 0.9, 0.03),
        rage: face({ h: 0.15, lx: -1, ly: -0.5 }, { tilt: 0.085, raise: -0.012 }, 'grit', 1, 0.03), // one drawing of the old brows
        thaw: face({ lid: 0.1, lx: -1, ly: -0.5 }, { tilt: 0.03 }, 'wobble', 1, 0.015),
        smile: face({ lid: 0.12, low: 0.22, lx: -1, ly: -0.4 }, { tilt: -0.035, raise: 0.012 }, 'smile', 1, -0.02), // the small real one
        up: face({ lid: 0.05, low: 0.3, lx: -0.2, ly: -1 }, { tilt: -0.02, raise: 0.03 }, 'smile', 1, -0.02),
        heave: face({ shut: 'tight' }, { tilt: 0.06, raise: -0.01 }, 'grit'),
        pleased: face({ shut: 'happy' }, { tilt: -0.03, raise: 0.02 }, 'smile', 1.05, -0.03),
        hm: face({ lid: 0.1, lx: 0.5, ly: -1 }, { tilt: 0, cock: 0.045 }, 'flat', 0.9, 0.02), // it hangs crooked
        aim: face({ lid: 0.05, lx: 0.8, ly: -1 }, { tilt: 0.02, cock: 0.03 }, 'flat', 0.8, 0),
        oh: face({ lx: 0.4, ly: -1 }, { tilt: -0.03, raise: 0.04 }, 'flat', 0.7, 0.03), // it slipped back
        shrug: face({ lid: 0.2, lx: 0.3, ly: -0.8 }, { tilt: -0.04, raise: 0.03 }, 'wobble', 0.8, 0.02),
        warm: face({ lid: 0.08, low: 0.24, lx: 0.2, ly: -0.6 }, { tilt: -0.04, raise: 0.01 }, 'smile', 1.05, -0.03),
    };
    // Poses as keys: [from, what changes, drawings it takes]. Numbers blend on twos from the key's own
    // frame, already part of the way there on it; a mouth or shut eyes change at once.
    const mix = (a, b, u) => {
        if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(b)) {
            const o = { ...a };
            for (const k in b) o[k] = mix(a[k], b[k], u);
            return o;
        }
        if (u >= 1 || a === undefined || a === null) return b;
        if (typeof a === 'number' && typeof b === 'number') return lerp(a, b, u);
        if (Array.isArray(a) && Array.isArray(b)) return b.map((v, i) => mix(a[i], v, u));
        return b;
    };
    const BASE = { squash: 0, rock: -0.04, headDy: 0.03, headTilt: -0.03, shrugR: -0.03, shrugL: -0.03, handR: [-0.46, -0.4], handL: [0.48, -0.42], face: FACE.tired, trail: 1, happy: 0 };
    const KEYS = [
        [at(2) + 1 / 12, { face: FACE.fond, headTilt: 0.04, rock: 0.035, trail: 0 }, 2], // he turns to the stand
        [SET + 2 / 12, { handL: [0.48, -0.42], face: { ...FACE.tired, eye: { ...FACE.tired.eye, lx: 0 } }, rock: 0, headTilt: 0 }, 2],
        [OUT - 3 / 12, { handR: [-0.03, -0.7], face: FACE.reach, headDy: 0.045, rock: -0.02 }, 1], // a mitt into his coat
        [OUT, { face: FACE.read, headDy: 0.02, headTilt: -0.02, rock: -0.02 }, 1],
        [RAGE, { face: FACE.rage, headDy: 0.035, shrugR: 0.03, shrugL: 0.03 }, 0],
        [RAGE + 1 / 12, { face: FACE.thaw, shrugR: -0.01, shrugL: -0.01 }, 0],
        [RAGE + 2 / 12, { face: FACE.smile, handL: [0.13, -0.66], headTilt: -0.03, headDy: 0.03, rock: 0, shrugR: -0.03, shrugL: -0.03 }, 2], // a mitt on his heart
        [CARRY, { face: FACE.up, handL: [0.52, -0.5], headTilt: 0, headDy: 0.01, rock: -0.03, happy: 0.6 }, 2],
        [HEAVE - 2 / 12, { rock: 0, face: FACE.heave }, 0],
        [HEAVE + 4 / 12, { face: FACE.up, handR: [-0.56, -0.5], handL: [0.56, -0.5], happy: 1 }, 1],
        [NAIL + 2 / 12, { face: FACE.pleased }, 0],
        [at(10), { face: FACE.hm, headTilt: 0.075, handL: [0.07, -0.83] }, 1], // his head tilts the way it hangs, a mitt at his goatee
        [TAP - 2 / 12, { face: FACE.aim, headTilt: 0.03, handL: [0.5, -0.6], handR: [-0.6, -0.56] }, 0],
        [TAP + 3 / 12, { face: FACE.pleased, handR: [-0.5, -0.46], handL: [0.5, -0.46], headTilt: 0, headDy: 0.03 }, 1], // there
        [SLIP, { face: FACE.oh, headTilt: 0.05, headDy: 0, happy: 0.35 }, 0],
        [SLIP + 2 / 12, { face: FACE.shrug, shrugR: 0.07, shrugL: 0.07, handR: [-0.74, -0.6], handL: [0.74, -0.6], headTilt: 0.03 }, 1],
        [SLIP + 5 / 12, { face: FACE.warm, shrugR: -0.02, shrugL: -0.02, handR: [-0.5, -0.44], handL: [0.14, -0.66], headTilt: -0.05, happy: 1 }, 2],
    ];
    const poseAt = (t) => KEYS.reduce((p, [a, to, n]) => (t < a - EPS ? p : mix(p, to, Math.min(1, (dr(t, a) + 1) / (n + 1)))), BASE);
    // his tail: dragged along the floor as he comes in, then lying on it, up and swaying once he is happy
    const tailAt = (t, p) => {
        const ph = (S.twos(t, T0) - S.OFFSET) / S.BEAT;
        return R.mixPts(R.mixPts(R.TAIL.floor, R.TAIL.trail, p.trail), R.TAIL.rest(0.035 * Math.sin(ph * Math.PI)), p.happy);
    };
    // Him at t: where he is drawn and his pose, before his mitts are put on what they hold.
    function devilAt(t) {
        const hr = hoof('R', t), hl = hoof('L', t), gx = (hr.p[0] + hl.p[0]) / 2, gy = (hr.p[1] + hl.p[1]) / 2;
        const sink = 9 * Math.min(1, Math.hypot(hr.p[0] - hl.p[0], hr.p[1] - hl.p[1]) / 80), hop = hopAt(t), p = { ...poseAt(t) };
        p.squash += squashAt(t);
        p.hoofR = { x: (hr.p[0] - gx) / DS, y: (hr.p[1] - gy - sink) / DS - hr.lift };
        p.hoofL = { x: (hl.p[0] - gx) / DS, y: (hl.p[1] - gy - sink) / DS - hl.lift };
        p.front = hr.lift > 0 ? 'R' : 'L';
        p.tail = tailAt(t, p);
        p.ground = [gx, gy];
        p.air = Math.min(1, hop / 60);
        return { x: gx, y: gy + sink - hop, gx, p };
    }

    // --- the guitar on its way to the stand ---------------------------------------------------------
    const G = Sk.BACKSTAGE.guitar, GRIP = R.guitarGrip(G.x, G.y, G.s); // the neck where his mitt has it, once it stands
    // Until SET: { x, y (where its tail would rest), rot, grip (his mitt), cradle (it is over the stand: the
    // set draws it through its hook, so the yoke and the pads close on it) }. He carries it by the neck,
    // its body back over his shoulder, and stands it up into the cradle with one swing.
    const CARRIED = -2.2;
    function guitarAt(t, D) {
        const ph = ((S.twos(t, T0) - T0) / 0.25) * Math.PI;
        const carry = { x: D.x + 0.933 * DS, y: D.y - 0.98 * DS + 0.5 * G.s + 4 * Math.sin(ph), rot: CARRIED + 0.05 * Math.sin(ph) };
        const q = t < LIFT - EPS ? carry : [
            { x: lerp(carry.x, G.x, 0.5), y: lerp(carry.y, G.y - 26, 0.6), rot: -1.3 },
            { x: G.x, y: G.y - 26, rot: -0.42, cradle: true }, { x: G.x, y: G.y - 24, rot: -0.06, cradle: true }, { x: G.x, y: G.y - 12, rot: 0, cradle: true },
        ][dr(t, LIFT)];
        return { ...q, grip: R.guitarGrip(q.x, q.y, G.s, q.rot) };
    }
    const flamesAt = (t) => [0.85, 0.72, 0.6, 0.5, 0.42, 0.35, 0.3, 0.26][dr(t, SET)] ?? 0.24; // they settle to pilot lights

    // --- the frame ------------------------------------------------------------------------------------
    // Where it is at t: null while it is in his coat; { x, y, s, tilt, front (it is in front of him, his
    // mitts on it), hung (it is on the wall: Skyward.frameAt's k and tilt) }
    const HELD = { x: 372, y: 600, tilt: -0.05 }, CHEST = [548, 770];
    function frameAt(t) {
        if (t < OUT - EPS) return null;
        if (t < CARRY - EPS) {
            // out of the coat with a pop, then held out beside him at arm's length; it shakes in his grip for one drawing
            const w = (S.pop(t, OUT, 3 / 12) - 0.6) / 0.4, rage = t >= RAGE - EPS && dr(t, RAGE) === 0;
            return { x: lerp(CHEST[0], HELD.x, w) + (rage ? 5 : 0), y: lerp(CHEST[1], HELD.y, w) - (rage ? 7 : 0), s: Sk.BACKSTAGE.frame * lerp(0.5, 1, Math.min(1, w)), tilt: HELD.tilt * w - (rage ? 0.04 : 0), front: true };
        }
        if (t < HEAVE - EPS) {
            // carried to the wall, up over his head; it dips as he crouches
            const u = smooth(Math.min(1, (dr(t, CARRY) + 1) / 5)), to = Sk.frameAt({ k: 0 });
            return { x: lerp(HELD.x, to.x, u), y: lerp(HELD.y, to.y, u) + tab(t, HEAVE - 2 / 12, [6, 12]), s: to.s, tilt: lerp(HELD.tilt, to.tilt, u), front: true };
        }
        if (t < NAIL - EPS) {
            // heaved: it leaves his mitts on the third drawing and goes on up past the nail
            const d = dr(t, HEAVE);
            return { ...Sk.frameAt({ k: [0.16, 0.34, 0.52, 0.68, 0.75][d] }), front: d < 4, hung: d >= 4 }; // in front of him until he is back on the floor
        }
        // it drops onto the nail on the beat and swings to rest crooked, its right side low; his tap
        // from below sets it straight; it slips back
        const set = [0.3, 0.42, 0.52, 0.62, 0.72, 0.82, 0.92][dr(t, NAIL)] ?? 1;
        const tilt = t < TAP - EPS ? 0.07 * smooth(set) : t < SLIP - EPS ? [-0.016, -0.004][dr(t, TAP)] ?? -0.008 : 0.075 + ([-0.03, 0.022, -0.008, 0.004][dr(t, SLIP)] ?? 0);
        return { ...Sk.frameAt({ k: 0.75 + 0.25 * set, tilt }), front: false, hung: true };
    }
    // The camera: from PUSH it goes in on the frame, about the point that brings the frame's middle to
    // the picture's (smooth, like every camera in the film)
    const ZF = 2.7, FY = (505 - Sk.frameAt({ k: 1 }).y * ZF) / (1 - ZF);
    const camAt = (t) => {
        const Z = Math.exp(Math.log(ZF) * smooth(seg(t, PUSH, CLOSE)));
        return { Z, at: ([x, y]) => [500 + (x - 500) * Z, FY + (y - FY) * Z] };
    };

    // --- the dressing room ---------------------------------------------------------------------------
    function room(g, t) {
        const cam = camAt(t), D = devilAt(t), p = D.p, fr = frameAt(t), d = C.drawing(t), gt = t < SET - EPS ? guitarAt(t, D) : null;
        const tb = (pt) => R.toBody(D.x, D.y, DS, p, pt);
        const on = (sx, dx = 12, dy = 8) => {
            const c = R.corner(fr, sx), k = fr.s / Sk.BACKSTAGE.frame;
            return tb([c[0] - sx * dx * k, c[1] + dy * k]);
        };
        // his mitts on what they hold
        if (t < SET + 2 / 12 - EPS) p.handL = tb(gt ? gt.grip : GRIP);
        if (fr && t < CARRY - EPS) p.handR = R.reach(R.SH_R, on(1));
        else if (fr && t < HEAVE - EPS) {
            // he walks in under it: the mitt that held its right corner runs along its lower edge to the left one, the other takes the right
            const c = dr(t, CARRY), k = clamp(1 - (c - 1) / 3), a = on(-1), b2 = on(1);
            p.handR = R.reach(R.SH_R, [lerp(a[0], b2[0], k), lerp(a[1], b2[1], k)]);
            if (c >= 4) p.handL = R.reach(R.SH_L, b2);
        } else if (fr && t < NAIL - EPS) {
            const c = dr(t, HEAVE);
            if (c < 2) [p.handR, p.handL] = [R.reach(R.SH_R, on(-1), 1), R.reach(R.SH_L, on(1), 1)];
            else if (c < 4) [p.handR, p.handL] = c === 2 ? [[-0.5, -1.66], [0.5, -1.66]] : [[-0.57, -1.48], [0.57, -1.48]]; // it is away: the follow-through
        } else if (fr && t >= TAP - 2 / 12 - EPS) {
            const c = dr(t, TAP - 2 / 12);
            if (c === 1) p.handL = R.reach(R.SH_L, on(1, 30, 46), 0.78);
            else if (c === 2 || c === 3) p.handL = R.reach(R.SH_L, on(1, 30, 26), 1); // the mitt's end under the corner
            else if (c === 4) p.handL = [0.62, -1.0];
        }
        // the towel's ends and the tie swing against the way he moves
        p.sw = clamp((devilAt(t - 1 / 12).gx - D.gx) / DS * 0.22, -0.035, 0.035) + tab(t, HEAVE, [0, 0.01, 0.02, -0.01, -0.02, 0.012]) + tab(t, TAP, [0.015, -0.01, -0.02, 0.012]);
        const under = () => {
            g.save();
            g.translate(500, FY);
            g.scale(cam.Z, cam.Z);
            g.translate(-500, -FY);
        };
        under();
        Sk.backstage(g, t, {
            frame: null, bulbs: 0.38, tv: 'blue', ...(cam.Z > 1 ? { cache: false } : {}),
            ...(gt ? { guitar: (g2, x, y, s) => gt.cradle && R.guitar(g2, gt.x, gt.y, s, 1, d, gt.rot) } : { flames: flamesAt(t) }),
        });
        g.restore();
        if (fr && fr.hung) {
            R.hung(g, cam, fr);
            R.glint(g, cam, fr, seg(t, GLINT - 4 / 24, GLINT + 8 / 24), Math.max(0, dr(t, GLINT)));
        }
        under();
        R.devil(g, D.x, D.y, DS, p, () => fr && fr.front && Sk.autograph(g, fr.x, fr.y, fr.s, { tilt: fr.tilt }), () => gt && !gt.cradle && R.guitar(g, gt.x, gt.y, G.s, 1, d, gt.rot));
        g.restore();
    }

    // --- the tape runs out ---------------------------------------------------------------------------
    function draw(g, t, env) {
        const j = F(t) - F(TAPE);
        if (j < 0) return room(g, t);
        if (j < 5) return room(g, TAPE - 1 / S.FPS); // the last picture, tearing (see post)
        if (t < BLUE - EPS) {
            // nothing left on the tape: snow (post)
            g.fillStyle = '#0e0c14';
            g.fillRect(0, 0, 1000, 1000);
            return;
        }
        g.fillStyle = K.vcrBlue;
        g.fillRect(0, 0, 1000, 1000);
        C.osd(g, env, 'STOP');
        // the film's signature, typed by the VCR's title generator a character a drawing; its block
        // cursor goes ahead of it, then blinks slowly
        if (t >= TYPE - 4 / 12 - EPS) {
            const n = clamp(dr(t, TYPE) + 1, 0, SIGN.length);
            R.typed(g, SIGN, 846, n, t < TYPED - EPS || (t - TYPED) % 1 < 0.5 - EPS);
        }
    }
    // The tape: clean through the room; at the end the opening's lock the other way round (the
    // tracking goes, the picture rolls off), snow, and two frames for the blue to settle.
    function post(t) {
        const j = F(t) - F(TAPE);
        if (j < 0) return {};
        if (j < 5) return { track: [0.12, 0.3, 0.55, 0.8, 1][j], roll: [0, -0.02, -0.07, -0.2, -0.45][j] };
        if (j < 9) return { snow: [0.7, 0.62, 0.66, 0.55][j - 5], track: [0.6, 0.5, 0.55, 0.45][j - 5] };
        if (j < 11) return { track: [0.3, 0.1][j - 9], snow: [0.05, 0][j - 9] };
        return {};
    }

    Seg.fade = { shots: [[T0, OUT, 'Home'], [OUT, PUSH, 'The frame'], [PUSH, TAPE, 'To my #1 fan'], [TAPE, END, 'STOP']], draw, post, END };
})();
