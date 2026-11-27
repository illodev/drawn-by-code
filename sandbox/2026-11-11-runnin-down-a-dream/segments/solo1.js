// Solo 1, bars 129–136 (182.5–193.7917 s): the duel that becomes a duet. No lead vocal; Benmont and
// Stan sing the «ooh»s to 189.5 (the rig's own mouths).
//   bars 129–130  First phrase   the bridge's last picture goes on (no cut) and pushes in on the two: Mike's
//                                neck goes up, his fretting mitt runs up it, clean notes fountain out of his
//                                headstock onto the Devil, who ducks and tips back from them (the cactus behind him
//                                leans away from his guitar's fire); the Devil's spot dims
//   bar 131       The answer     closer on the Devil (three beats): he shreds, flames up, jagged burning notes,
//                                twice as many, rain on Mike, who rocks back with his hair blown
//   bars 131–132  The eyebrow    close on Mike (two beats): one eyebrow up on the off-beat, then two nods
//                 Tennis         the pit seen from the stage (three beats): three fans' heads follow the volleys
//                                over them, right, left, right
//   bar 133       Trading        half a bar each: close on Mike ripping, a whip pan on the third beat to the Devil
//   bar 134       The clash      the stage, wide: both at once; the two streams meet over them every half beat
//                                and burst into stars; the lights swing wildly; Stan and Howie grin at each other
//   bar 135       Back to back   they jump round (Mike now faces left, the Devil right, a hoof in the cockpit: the
//                                cactus ducks behind the door), land back to back and play the same line, heads
//                                thrown back; the notes rise from between them as a braid
//   bar 136       The floor      the stage view: the house hops; dust and stones off the roof, a crack runs across
//                                the stage floor and opens, the lake swells behind; a jolt on the last beat.
//                                The last frame is LAST (below): what the next block cuts away from.
// The band's layout is the bridge's (Seg.bridge.band and FINAL: Tom on the bonnet, off the right edge in the
// stage view); what the car threw off is Chorus3Props.dressing. Props: segments/solo1-props.js (Solo1Props).
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, I = Inferno, P = Solo1Props, BP = BridgeProps, C3 = Chorus3Props, twos = S.twos, pop = S.pop;
    const PI = Math.PI, TAU = PI * 2, FR = 1 / 24, lerp = E.lerp, BEAT = S.BEAT;
    const n = (k) => S.snap(S.OFFSET + (516 + k) * BEAT); // beat k of the block (halves and quarters too), on its frame
    const T0 = n(0), T_ANS = n(8), T_BROW = n(11), T_FANS = n(13), T_TRADE = n(16), T_PAN = n(18), T_CLASH = n(20), T_BACK = n(24), T_FLOOR = n(28), T_END = n(32);
    const on = (t, a) => t >= a - 1e-6;
    const seg2 = (t, a, c) => E.seg(twos(t, a), a, c); // 0..1 on twos, counted from a
    const bump = (t, a, dur = 0.3) => E.bump(twos(t, a), a, dur);
    const dr = (t, a) => Math.floor((t - a) * 12 + 1e-6); // drawings since a
    const thud = (t, a, amp = 0.16, dur = 0.3) => (on(t, a) ? amp * Math.max(0, 1 - (twos(t, a) - a) / dur) * Math.cos(((twos(t, a) - a) / dur) * PI * 1.5) : 0);
    const add = (p, q, k = 1) => [p[0] + q[0] * k, p[1] + q[1] * k];
    const bez = (a, b, c, u) => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * b[0] + u * u * c[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * b[1] + u * u * c[1]];
    const bezAng = (a, b, c, u) => Math.atan2((1 - u) * (b[1] - a[1]) + u * (c[1] - b[1]), (1 - u) * (b[0] - a[0]) + u * (c[0] - b[0]));

    const FIN = Seg.bridge.FINAL, band = Seg.bridge.band, axePose = Seg.bridge.axePose;
    const SCARF_AT = 142.7083; // when the Devil's scarf came down on the imp's mallet (chorus 3)
    // places on the deck's near row (car units): Mike's and the Devil's as the bridge left them, and back to back
    const MIKE_AT = FIN.mikeAt, DEVIL_AT = FIN.devilAt;
    const MIKE_B2B = [MIKE_AT[0] + 0.07, MIKE_AT[1]], DEVIL_B2B = [DEVIL_AT[0] + 0.22, DEVIL_AT[1]]; // the Devil with a hoof in the cockpit, where the cactus was
    // the camera: the venue's own stage view, and closer framings (k: the zoom; cx, cy: the set point at the frame's middle)
    const VS = I.VIEW.stage;
    const V_TWO = { k: 2.3, cx: 571, cy: 600 }, V_ANS = { k: 2.9, cx: 592, cy: 611 }, V_BROW = { k: 4.2, cx: 515, cy: 641 };
    const V_MIKE = { k: 3.2, cx: 513, cy: 619 }, V_DEVIL = { k: 3.2, cx: 612, cy: 619 }, V_CLASH = { k: 1.7, cx: 448, cy: VS.cy }, V_B2B = { k: 2.3, cx: 578, cy: 584 };
    const mixV = (a, b, u) => ({ k: lerp(a.k, b.k, u), cx: lerp(a.cx, b.cx, u), cy: lerp(a.cy, b.cy, u) });
    // a point of the car's body on screen (it sinks a tenth of a unit per unit of bounce; the bridge's band adds the beat's own)
    const carPt = (car, p, t, extra = 0) => [car.x + p[0] * car.s, car.y + (p[1] + 0.1 * (0.2 * S.pulseAt(t).pulse + extra)) * car.s];

    /**
     * One frame in the venue: the set, the band on its car with Mike and the Devil where this block puts
     * them, the two follow spots, the crowd, what the car threw off.
     *   o: { mike, devil      their poses (Solo1Props.mike, Inferno.devilGuitar)
     *        mikeAt, devilAt  car units;  mikeUp, devilUp  figure units off the boards (a hop: no shadow)
     *        pose, cactus, bounce   for the rest of the band (Seg.bridge.band)
     *        spots: [mike's, the Devil's]  0..2, 1 as the bridge left them
     *        lighters, back(c), floor(c), mid(c), front(c)   hooks: after the set, after the band, before and after the crowd;
     *        c: { St, car, s, mk, dv } the stage on screen, the car, its scale, Mike's and the Devil's ground points }
     */
    function venueShot(g, t, view, o) {
        const Pu = S.pulseAt(t), vo = { view, pan: 0, heat: 1, beatK: Pu.pulse }, St = I.stage(view, 0), car = St.car, s = car.s;
        const crowd = { hype: 1, lighters: o.lighters ?? FIN.lighters, wave: null };
        const dress = (part) => C3.dressing(g, t, { view, pan: 0, ...crowd, part, scarf: t - SCARF_AT });
        const mAt = o.mikeAt ?? MIKE_AT, dAt = o.devilAt ?? DEVIL_AT, c = { St, car, s, vo, mk: carPt(car, mAt, t, o.bounce), dv: carPt(car, dAt, t, o.bounce) };
        I.venue(g, t, vo);
        dress('back');
        if (o.back) o.back(c);
        const [fm, fd] = o.spots ?? [1, 1];
        const spots = (a, pool) => {
            if (fm > 0.02) BP.spot(g, St.lamps[2][0], St.lamps[2][1], c.mk[0], c.mk[1] + 4, 0.6 * s, K.white, Math.min(0.5, a * fm), pool);
            if (fd > 0.02) BP.spot(g, St.lamps[3][0], St.lamps[3][1], c.dv[0], c.dv[1] + 4, 0.64 * s, K.white, Math.min(0.5, a * fd), pool);
        };
        spots(0.16, true);
        band(g, t, car, {
            solo: 0, tomAt: FIN.tomAt, mikeNear: true, mikeAt: [-90, 0], bounce: o.bounce ?? 0, // the cast's own Mike waits off screen: this block draws him turned
            pose: o.pose ?? {}, cactus: { ...cactus(t), ...(o.cactus ?? {}) }, devilAt: dAt,
            // his tail alone, behind the cactus at the wheel (the bridge's band draws the cactus under the rest of him)
            devilTail: (g2, sc) => I.devilGuitarTail(g2, 0, -(o.devilUp ?? 0) * sc, sc, o.devil),
            devil: (g2, sc) => {
                // the Devil first, as the bridge left them: Mike's guitar and both his mitts stay whole in front of the fork
                I.devilGuitar(g2, 0, -(o.devilUp ?? 0) * sc, sc, { ...o.devil, shadow: !(o.devilUp > 0), noTail: true });
                P.mike(g2, (mAt[0] - dAt[0]) * sc, (mAt[1] - dAt[1] - (o.mikeUp ?? 0)) * sc, sc, { ...o.mike, shadow: !(o.mikeUp > 0) });
            },
        });
        c.mk[1] -= (o.mikeUp ?? 0) * s;
        c.dv[1] -= (o.devilUp ?? 0) * s;
        spots(0.07, false);
        if (o.floor) o.floor(c);
        dress('stage');
        if (o.mid) o.mid(c);
        I.crowd(g, t, { ...vo, density: FIN.density, ...crowd });
        dress('front');
        if (o.front) o.front(c);
        return c;
    }
    // The cactus at the wheel has a burning guitar at his shoulder: he leans away from it, further when the Devil plays;
    // when the Devil turns his way (back to back) he ducks under the fork, down behind the door with his arm pulled in, and stays there.
    const cactus = (t) => {
        const Pu = S.pulseAt(t), away = lerp(0.07, 0.15, E.seg(t, n(1), n(2))), duck = on(t, HOP) ? E.out(seg2(t, HOP, HOP + 2 / 12)) : 0;
        return { lean: away + 0.3 * duck, wave: lerp(0.5 + 0.2 * Pu.pulse, 7, duck), ...(duck > 0 ? { squash: 0.03 * Pu.pulse + 0.5 * duck, mouth: 'oh' } : {}) };
    };
    // Mike keeping the beat (the rig's pose), with this block's overrides
    const mikePose = (t, o = {}) => ({ ...Rig.playing(t, { solo: 0 }).mike, mouth: 'smirk', eyes: 'open', ...o });
    // picking fast: the mitt changes side every drawing
    const pick = (t, a) => (dr(t, a) % 2 ? 1 : -1);

    // --- the notes in flight ---------------------------------------------------------------------
    // A volley: note i is born at births[i] and flies for `life` seconds (on twos, from its own frame) along
    // path(i) → [from, over, to] (a curve). Where it lands, land(p, age, i) draws what it leaves (age in drawings).
    function volley(g, t, births, life, path, kind, size, land) {
        const d = C.drawing(t);
        births.forEach((tb, i) => {
            if (!on(t, tb)) return;
            const u = (twos(t, tb) - tb) / life, [a, b, c] = path(i);
            if (u >= 1) {
                if (land) land(c, dr(t, tb + life), i);
                return;
            }
            const p = bez(a, b, c, u), sz = size(i) * pop(t, tb, 0.17), wob = 0.22 * Math.sin(i * 2.4 + dr(t, tb) * 1.3);
            if (kind === 'fire') P.fireNote(g, p[0], p[1], sz, wob - 0.1, d + i, bezAng(a, b, c, u));
            else P.cleanNote(g, p[0], p[1], sz, wob, 1 + (i % 3 === 1 ? 1 : 0), i);
        });
    }
    const twinkle = (s) => (p, age, i) => {
        if (age < 2) C.sparkle(g0, p[0], p[1], s * (0.26 - 0.08 * age), { color: i % 2 ? K.yellow : K.white, ink: K.ink, lw: 2.4, rot: age * 0.4 });
    };
    const puff = (s) => (p, age, i) => {
        if (age < 2) BP.flame(g0, p[0], p[1] + 0.08 * s, s * (0.34 - 0.1 * age), C.drawing(0) + age + i, i % 3);
    };
    let g0 = null; // the frame's context, for the landings above

    // =========================================================================================
    // «First phrase», bars 129–130: Mike's. It goes on from the bridge's last picture and pushes in
    // =========================================================================================
    const P_LIFE = 0.56, P_BIRTHS = Array.from({ length: 14 }, (_, i) => n(0.5 + i * 0.5));
    function phraseShot(g, t) {
        const view = mixV(VS, V_TWO, E.inOut(E.seg(t, T0 + 2 * FR, n(3.5)))), Pu = S.pulseAt(t), ph = Pu.k + Pu.since;
        const go = E.back(seg2(t, T0, T0 + 3 / 12)), run = seg2(t, n(0.5), n(7)), hold = on(t, n(7));
        const mike = mikePose(t, {
            solo: lerp(FIN.solo, 0.85, go) + (hold ? 0.15 * E.out(seg2(t, n(7), n(7) + 2 / 12)) : 0), eyes: 'shut', mouth: hold ? 'o' : 'grin', sway: 0,
            strum: !on(t, n(0.5)) ? -1 : hold ? 1 : pick(t, n(0.5)), fret: !on(t, n(0.5)) ? 0.5 : lerp(1, -0.95, run) + (hold || dr(t, T0) % 2 ? 0 : 0.14),
            headTilt: 0.07 * (1 - go) - (hold ? 0.05 : 0), squash: 0.04 * Pu.pulse + 0.05 * bump(t, n(7), 0.25),
        });
        // the Devil: he stops, watches them come, leans back as they land on him and gives a step; by the end he has had enough
        const see = E.out(seg2(t, n(1.5), n(1.5) + 2 / 12)), ready = on(t, n(7)) ? E.out(seg2(t, n(7), n(7) + 2 / 12)) : 0;
        const hit = Math.max(0, ...P_BIRTHS.map((tb) => bump(t, tb + P_LIFE, 0.2)));
        const devil = axePose(t, {
            look: -1, solo: lerp(FIN.solo, 0.15, see) + 0.25 * ready, fret: 0.5, strum: -1, flames: lerp(0.8, 0.3, see) + 0.5 * ready,
            mood: ready ? 'angry' : !on(t, n(1.5)) ? 'grin' : on(t, n(5)) ? 'sly' : 'shock', headTilt: -0.05 * (1 - see) + 0.12 * see * (1 - ready) + 0.03 * hit,
            lean: (0.05 * see + 0.025 * hit) * (1 - ready) - 0.03 * ready, squash: 0.035 * Pu.pulse + (0.06 * see + 0.05 * hit) * (1 - ready), headDy: 0.02 * Pu.pulse + 0.05 * see * (1 - ready),
            eyes: hit > 0.5 && on(t, n(5)) ? 'shut' : 'open',
        });
        const dim = E.seg(t, T0, n(1));
        venueShot(g, t, view, {
            mike, devil, spots: [lerp(1, 2, dim), lerp(1, 0.2, dim)],
            pose: { stan: { crash: !on(t, n(1)) ? Pu.pulse : 0 }, ben: { headTilt: 0.08 }, howie: { headTilt: 0.08 } },
            mid: ({ s, mk, dv }) => {
                const from = add(mk, P.mikePoints(mike).headstock, s);
                volley(g, t, P_BIRTHS, P_LIFE, (i) => {
                    const to = add(dv, [0.12 + 0.3 * (((i * 2) % 3) - 1), -1.92 + 0.3 * (i % 2)], s);
                    return [from, [(from[0] + to[0]) / 2 - 0.12 * s, Math.min(from[1], to[1]) - (0.95 + 0.4 * (i % 3)) * s], to];
                }, 'clean', (i) => s * (0.135 + 0.03 * (i % 2) + (i === 13 ? 0.05 : 0)), twinkle(s));
            },
        });
    }

    // =========================================================================================
    // «The answer», bar 131: the Devil's, and how Mike takes it
    // =========================================================================================
    const A_LIFE = 0.46, A_BIRTHS = Array.from({ length: 12 }, (_, i) => n(8 + i * 0.25));
    // the two of them from the answer to the eyebrow (the same acting seen in two framings)
    function answerPoses(t) {
        const Pu = S.pulseAt(t), up = E.back(seg2(t, T_ANS, T_ANS + 3 / 12)), close = on(t, T_BROW);
        const devil = axePose(t, {
            look: -1, solo: lerp(0.4, close ? 0.55 : 0.9, up), shred: close ? 0 : 1, flames: close ? 0.7 : 1, strum: close ? 1 : pick(t, T_ANS), fret: close ? 0.8 : 0.45, mood: close ? 'sly' : on(t, n(9)) && !on(t, n(10.5)) ? 'laugh' : 'grin',
            squash: 0.05 * Pu.pulse + 0.06 * bump(t, T_ANS, 0.25), headDy: 0.04 * Pu.pulse, tail: 0.07 * Math.sin((Pu.k + Pu.since) * PI),
        });
        const rock = E.out(seg2(t, T_ANS + 1 / 12, T_ANS + 3 / 12)), brow = pop(t, n(11.5), 0.17), nod = bump(t, n(12), 0.25) + 0.7 * bump(t, n(12.5), 0.22);
        const mike = mikePose(t, {
            solo: lerp(1, 0.25, rock), strum: -1, fret: 0.5, brow, eyes: on(t, n(11.5)) ? 'open' : on(t, n(9.5)) ? 'open' : 'wide', mouth: on(t, n(12)) ? 'grin' : on(t, n(9.5)) ? 'smirk' : 'o',
            lean: -0.09 * rock * (1 - 0.6 * E.seg(t, n(10), n(11))), headTilt: -0.04 * rock + 0.05 * nod, headDy: 0.09 * nod, squash: 0.03 * Pu.pulse,
            sway: on(t, n(11.5)) ? 0 : -(0.05 + 0.025 * (dr(t, T_ANS) % 2)) * rock,
        });
        return { mike, devil };
    }
    const answerNotes = (g, t, { s, mk, dv }, devil) => {
        const from = add(dv, I.guitarPoints(devil).headstock, s);
        volley(g, t, A_BIRTHS, A_LIFE, (i) => {
            const past = i % 3 === 2, to = add(mk, past ? [-2.3, -2.3 - 0.22 * (i % 3)] : [-0.42 + 0.26 * (i % 4), -2.0 + 0.16 * (i % 3)], s);
            return [from, [(from[0] + to[0]) / 2 + 0.1 * s, Math.min(from[1], to[1]) - (0.7 + 0.3 * (i % 3)) * s], to];
        }, 'fire', (i) => s * (0.12 + 0.025 * (i % 2)), puff(s));
    };
    function answerShot(g, t) {
        const { mike, devil } = answerPoses(t);
        venueShot(g, t, V_ANS, { mike, devil, devilAt: DEVIL_AT, spots: [0.25, 2], pose: { ben: { headTilt: 0.08 }, howie: { headTilt: 0.08 } }, mid: (c) => answerNotes(g, t, c, devil) });
    }
    function browShot(g, t) {
        const { mike, devil } = answerPoses(t);
        venueShot(g, t, V_BROW, {
            mike, devil, devilAt: DEVIL_AT, spots: [1.6, 0.8], pose: { ben: { headTilt: 0.08 } },
            mid: (c) => {
                // the eyebrow's own mark: three ticks over it on the drawings it goes up
                if (on(t, n(11.5)) && dr(t, n(11.5)) < 2) BP.ticks(g, c.mk[0] + 0.17 * c.s, c.mk[1] - 1.56 * c.s, 0.2 * c.s, 0.3 * c.s, 3, -PI * 0.7, -PI * 0.22, K.white, 3);
            },
        });
    }

    // =========================================================================================
    // «Tennis», the end of bar 132: the pit seen from the stage; three heads follow the volleys
    // =========================================================================================
    function fansShot(g, t) {
        const d = C.drawing(t), Pu = S.pulseAt(t), R = I.R;
        // which way the notes go this beat (seen from the stage the Devil is on the left: his go left to right), and where they are
        const j = Math.min(2, Math.floor((t - T_FANS) / BEAT + 0.04)), dir = j % 2 ? -1 : 1, tb = n(13 + j);
        const cx = 500 + dir * (-760 + 1560 * E.seg(twos(t, tb), tb, tb + BEAT)), look = E.clamp((cx - 500) / 240, -1, 1);
        // the house behind them: the cave's far wall and its teeth, the lights off the stage sweeping over it
        C.sunburst(g, 500, 1100, { n: 16, rot: 0.05 * (t - T_FANS), a: R.far, b: R.farL });
        C.poly(g, [[-10, -10], [1010, -10], [1010, 96], ...Array.from({ length: 21 }, (_, i) => [1000 - i * 50, i % 2 ? 96 : 168 - 22 * ((i * 7) % 3)]), [-10, 96]], { fill: R.wallD, ink: K.ink, lw: 3.2 });
        for (const [x, w, col] of [[240 + 150 * look, 150, K.pink], [770 + 150 * look, 170, K.aqua]]) {
            g.save();
            g.globalCompositeOperation = 'screen';
            g.globalAlpha = 0.2;
            g.fillStyle = col;
            g.beginPath();
            g.moveTo(x - w * 0.4 + 260 * look, 1000);
            g.lineTo(x + w * 0.4 + 260 * look, 1000);
            g.lineTo(x + w, 0);
            g.lineTo(x - w, 0);
            g.fill();
            g.restore();
        }
        // the rows behind: smaller, in the half dark
        const turn = { look, headTilt: 0.15 * look };
        [[70, 0, 'imp', 'hat'], [228, 1, 'skeleton', 2], [386, 0, 'imp', 'bow'], [612, 1, 'skeleton', 0], [776, 0, 'imp', null], [934, 1, 'skeleton', 3]].forEach(([x, row, kind, w], i) => {
            I.fan(g, x + 8 * look, 850 + row * 18, 150, { kind, hype: 0.6, lighter: i % 3 === 0 ? 0.6 : 0, hold: i % 3 === 0 ? 'lighter' : i % 3 === 1 ? 'none' : 'trident', t: t + i * 0.09, wear: kind === 'imp' ? w : undefined, tee: kind === 'imp' ? 0 : w, hawk: [K.yellow, K.sky, K.orange][i % 3], ...turn, shadow: false });
        });
        g.fillStyle = 'rgba(74,12,26,0.42)';
        g.fillRect(0, 330, 1000, 670);
        // the volley over their heads: three notes in a row, the first the biggest
        for (let k = 2; k >= 0; k--) {
            const x = cx - dir * k * 190, y = 330 + 26 * Math.sin(k * 2.1 + d * 0.9) - 40 * k * (2 - k) + 0.00012 * (x - 500) * (x - 500);
            if (dir > 0) P.fireNote(g, x, y, 60 - 7 * k, 0.1 * Math.sin(d + k), d + k, 0.05 * Math.sin(d + k));
            else P.cleanNote(g, x, y, 62 - 7 * k, 0.2 * Math.sin(d * 1.3 + k), 1 + (k % 2), k);
        }
        // the three at the barrier: a skeleton with a lighter, an imp in specs on the rail's step, the skeleton with the pink
        // mohawk. A box head cannot turn: the eyes go, the head tips and the whole fan leans after the notes.
        const stare = { hype: 0.22, t, ...turn, headTilt: 0.17 * look, shadow: false };
        const leaning = (x, y, a, fn) => {
            g.save();
            g.translate(x, y);
            g.rotate(a * look);
            fn();
            g.restore();
        };
        leaning(214, 1090, 0.06, () => I.fan(g, 0, 0, 300, { kind: 'skeleton', ...stare, hold: 'lighter', lighter: 0.8, hawk: K.green, tee: 1 }));
        leaning(786, 1090, 0.06, () => I.fan(g, 0, 0, 300, { kind: 'skeleton', ...stare, hold: 'none', hawk: K.pink, tee: 3 }));
        leaning(500, 1000, 0.11, () => I.fan(g, 0, 0, 400, { kind: 'imp', ...stare, hold: 'none', wear: 'specs' }));
        // the stage's edge in front of them, with its footlights
        C.box(g, -20, 900, 1040, 140, Cast.D, { front: R.shelf, top: R.shelfL, side: R.wallD }, { lw: 3.2, depth: 60 });
        for (let i = 0; i < 5; i++) {
            const x = 100 + i * 200, lit = (i + Pu.k) % 2 === 0;
            C.box(g, x - 34, 868, 68, 36, Cast.D, { front: R.wallD, top: R.wall, side: R.deep }, { lw: 3, depth: 40 });
            C.poly(g, [[x - 24, 876], [x + 24, 876], [x + 24, 896], [x - 24, 896]], { fill: lit ? K.yellow : R.glow, ink: K.ink, lw: 2.4 });
        }
    }

    // =========================================================================================
    // «Trading», bar 133: half a bar each, a whip pan between them
    // =========================================================================================
    const TR_LIFE = 0.5;
    function tradeShot(g, t) {
        const view = mixV(V_MIKE, V_DEVIL, E.inOut(E.seg(t, T_PAN - 2 * FR, T_PAN + 3 * FR))), Pu = S.pulseAt(t), his = on(t, T_PAN);
        const mike = his
            ? mikePose(t, { solo: 0.3, strum: -1, fret: 0.5, eyes: 'wide', mouth: 'grin', lean: -0.06, sway: -0.05 - 0.02 * (dr(t, T_PAN) % 2) })
            : mikePose(t, { solo: 1, strum: pick(t, T_TRADE), fret: [-0.9, -0.5, -0.95, -0.2, -0.7, -0.95][dr(t, T_TRADE) % 6], eyes: 'shut', mouth: 'o', headTilt: -0.05, sway: 0, squash: 0.05 * Pu.pulse });
        const devil = his
            ? axePose(t, { look: -1, solo: 0.95, shred: 1, flames: 1, strum: pick(t, T_PAN), fret: 0.4, mood: 'laugh', squash: 0.05 * Pu.pulse + 0.05 * bump(t, T_PAN, 0.25), headDy: 0.04 * Pu.pulse })
            : axePose(t, { look: -1, solo: 0.25, strum: -1, fret: 0.5, flames: 0.5, mood: 'sly', lean: 0.07, headTilt: 0.05, headDy: 0.05 * bump(t, n(16.5), 0.3) + 0.05 * bump(t, n(17.5), 0.3) });
        venueShot(g, t, view, {
            mike, devil, devilAt: DEVIL_AT, spots: his ? [0.25, 2] : [2, 0.25], pose: { ben: { headTilt: 0.08 } },
            mid: ({ s, mk, dv }) => {
                // his run streams out towards the other, over his head and away
                const mFrom = add(mk, P.mikePoints({ ...mike, solo: 1 }).headstock, s), dFrom = add(dv, I.guitarPoints({ ...devil, solo: 0.95 }).headstock, s);
                volley(g, t, Array.from({ length: 8 }, (_, i) => n(16 + i * 0.25)), TR_LIFE, (i) => {
                    const to = [mFrom[0] + 3.4 * s, mFrom[1] - (1.5 - 0.5 * (i % 3)) * s];
                    return [mFrom, [mFrom[0] + 1.1 * s, mFrom[1] - (1.9 - 0.4 * (i % 2)) * s], to];
                }, 'clean', (i) => s * (0.125 + 0.03 * (i % 2)));
                volley(g, t, Array.from({ length: 8 }, (_, i) => n(18 + i * 0.25)), TR_LIFE, (i) => {
                    const to = [dFrom[0] - 3.4 * s, dFrom[1] - (1.5 - 0.5 * (i % 3)) * s];
                    return [dFrom, [dFrom[0] - 1.1 * s, dFrom[1] - (1.9 - 0.4 * (i % 2)) * s], to];
                }, 'fire', (i) => s * (0.12 + 0.025 * (i % 2)));
            },
        });
    }

    // =========================================================================================
    // «The clash», bar 134: both at once; the streams meet over them and burst into stars
    // =========================================================================================
    const CL_LIFE = 0.3, CL_BIRTHS = Array.from({ length: 7 }, (_, i) => n(20 + i * 0.5));
    const CL_OFF = [[0, 0], [-0.5, -0.32], [0.46, 0.22], [-0.2, 0.36], [0.4, -0.4], [-0.52, 0.1], [0.1, -0.2]]; // where each pair meets, from the middle (figure units)
    const HOP = T_BACK - 2 * FR; // they leave the boards for the turn
    function clashShot(g, t) {
        const Pu = S.pulseAt(t), ph = Pu.k + Pu.since, crouch = on(t, HOP - 2 * FR) ? 0.12 : 0;
        const mike = mikePose(t, { solo: 1, strum: pick(t, T_CLASH), fret: [-0.9, -0.3, -0.7, 0.1, -0.95, -0.5][dr(t, T_CLASH) % 6], eyes: 'shut', mouth: 'grin', sway: 0, squash: 0.05 * Pu.pulse + crouch, headTilt: -0.04 });
        const devil = axePose(t, { look: -1, solo: 0.95, shred: 1, flames: 1, strum: pick(t, T_CLASH), fret: 0.4, mood: Pu.k % 2 ? 'laugh' : 'grin', squash: 0.05 * Pu.pulse + crouch, headDy: 0.03 * Pu.pulse });
        const grin = on(t, n(21)) ? E.out(seg2(t, n(21), n(21) + 2 / 12)) : 0, hop = 0.05 * Math.abs(Math.sin(ph * PI)) * grin;
        const tw = T_CLASH + (t - T_CLASH) * 3; // the rig's second set of beams runs three times as fast
        venueShot(g, t, V_CLASH, {
            mike, devil, devilAt: DEVIL_AT, spots: Pu.k % 2 ? [0.9, 2] : [2, 0.9],
            pose: { stan: { headTilt: 0.13 * grin, headDy: 0.03 * Pu.pulse - hop, crash: !on(t, n(21)) ? Pu.pulse : 0 }, howie: { headTilt: -0.13 * grin, headDy: 0.02 * Pu.pulse - hop, mouth: grin ? 'grin' : 'smirk' }, ben: { headTilt: 0.08 } },
            back: ({ vo }) => I.beams(g, tw + 0.41, { ...vo, front: false }),
            mid: ({ s, mk, dv }) => {
                const mid = [(mk[0] + dv[0]) / 2, mk[1] - 3.25 * s];
                const mFrom = add(mk, P.mikePoints(mike).headstock, s), dFrom = add(dv, I.guitarPoints(devil).headstock, s);
                const meet = (i) => add(mid, CL_OFF[i], s);
                volley(g, t, CL_BIRTHS, CL_LIFE, (i) => [mFrom, [mk[0] - 0.75 * s, meet(i)[1] - 0.5 * s], add(meet(i), [-0.14, 0], s)], 'clean', () => s * 0.19);
                volley(g, t, CL_BIRTHS, CL_LIFE, (i) => [dFrom, [dv[0] + 0.75 * s, meet(i)[1] - 0.5 * s], add(meet(i), [0.14, 0], s)], 'fire', () => s * 0.18);
                CL_BIRTHS.forEach((tb, i) => P.clash(g, ...meet(i), 0.62 * s, on(t, tb + CL_LIFE) ? dr(t, tb + CL_LIFE) : -1, 'solo1-clash' + i));
            },
        });
    }

    // =========================================================================================
    // «Back to back», bars 135–136: the same line, together; then the floor starts to shake
    // =========================================================================================
    const LAND = T_BACK + 4 * FR, BRAID = n(24.5);
    const BEN_AWAY = { lean: -0.08, headTilt: 0.05 }; // Benmont gives Mike's headstock room
    // the two of them from the turn to the last frame
    function duet(t) {
        const Pu = S.pulseAt(t), ph = Pu.k + Pu.since, air = on(t, HOP) && !on(t, LAND), up = air ? 0.3 * Math.sin(PI * E.seg(twos(t, HOP), HOP, LAND)) + 0.04 : 0;
        const solo = on(t, LAND) ? 0.75 + 0.25 * E.back(seg2(t, LAND, LAND + 3 / 12)) : 0.75, land = Math.max(0, thud(t, LAND, 0.16)), sway = on(t, LAND) ? 0.025 * Math.sin(ph * PI) : 0;
        const line = { strum: on(t, LAND) ? pick(t, LAND) : -1, squash: air ? -0.08 : 0.05 * Pu.pulse + land, headDy: air ? 0 : 0.03 * Pu.pulse, lean: sway };
        const fr = [0.3, 0.7, 0.1, 0.55, 0.9, 0.4][(dr(t, LAND) >> 1) % 6]; // the same line: the two fretting mitts move together
        const mike = mikePose(t, { ...line, face: 'left', solo, fret: lerp(0.9, -0.9, fr), eyes: 'shut', mouth: air ? 'o' : Pu.k % 4 === 3 ? 'o' : 'grin', headTilt: air ? 0 : 0.1, sway: 0.03 * Math.sin(ph * PI) });
        const devil = axePose(t, { ...line, lean: sway + 0.045, hand: 'right', solo, fret: fr, flames: 1, mood: air ? 'grin' : 'laugh', look: 1, headTilt: air ? 0 : -0.04, tail: 0.02 + 0.03 * Math.sin(ph * PI) });
        const k = on(t, LAND) ? 1 : E.seg(twos(t, HOP), HOP, LAND);
        return { mike, devil, up, air, mikeAt: [lerp(MIKE_AT[0], MIKE_B2B[0], k), MIKE_AT[1]], devilAt: [lerp(DEVIL_AT[0], DEVIL_B2B[0], k), DEVIL_AT[1]] };
    }
    // the braid: it comes up from behind where their heads meet and climbs to the roof
    const braid = (g, t, { s, mk, dv }) => {
        if (!on(t, BRAID)) return;
        const x = (mk[0] + dv[0]) / 2 + 0.04 * s, y0 = mk[1] - 1.72 * s, d = C.drawing(t);
        C.burst(g, x, y0 - 0.2 * s, { r0: 0.2 * s, r1: (0.36 + 0.05 * (d % 2)) * s, n: 9, seed: 'solo1-braid', fill: K.yellow, ink: K.ink, lw: 3.2, rot: d % 2 ? 0.12 : 0 });
        P.braid(g, x, y0, -70, { top: E.seg(twos(t, BRAID), BRAID, n(27)), ph: (twos(t, BRAID) - BRAID) * 2.6, amp: 0.2 * s, amp1: 0.34 * s, pitch: 0.56 * s, d, s: 0.125 * s });
    };
    function backShot(g, t) {
        const D = duet(t), Pu = S.pulseAt(t);
        venueShot(g, t, V_B2B, {
            mike: D.mike, devil: D.devil, mikeAt: D.mikeAt, devilAt: D.devilAt, mikeUp: D.up, devilUp: D.up, spots: [1.8, 1.8], bounce: 0.4 * Pu.pulse,
            pose: { ben: BEN_AWAY },
            back: (c) => braid(g, t, { ...c, mk: carPt(c.car, D.mikeAt, t, 0.4 * Pu.pulse), dv: carPt(c.car, D.devilAt, t, 0.4 * Pu.pulse) }),
            mid: ({ s, mk, dv }) => {
                // the turn: a swirl round each while they are off the boards, the landing's mark under them
                if (D.air) {
                    P.whirl(g, mk[0], mk[1] - 0.75 * s, 0.6 * s, dr(t, T_BACK), -1);
                    P.whirl(g, dv[0], dv[1] - 0.75 * s, 0.64 * s, dr(t, T_BACK), 1);
                } else if (dr(t, LAND) < 2) {
                    BP.ticks(g, mk[0], mk[1] - 0.04 * s, 0.56 * s, 0.76 * s, 3, PI * 0.96, PI * 1.2, K.white, 2.8);
                    BP.ticks(g, dv[0], dv[1] - 0.04 * s, 0.6 * s, 0.8 * s, 3, -PI * 0.2, PI * 0.04, K.white, 2.8);
                }
            },
        });
    }
    // the shake: how far the camera is thrown this drawing (set units), growing through the bar; the last beat's jolt is two big drawings
    const JOLT = n(31), SH = [[1, -0.6], [-1, 0.8], [0.6, -1], [-0.8, 0.5], [0.3, -0.9], [-1, 0.7]];
    function shake(t) {
        if (on(t, JOLT) && dr(t, JOLT) < 2) return dr(t, JOLT) === 0 ? [7.5, -6.5] : [-6.5, 5.5];
        const a = E.seg(t, n(28.5), JOLT), [x, y] = SH[dr(t, T_FLOOR) % 6];
        return [x * a * 2.4, y * a * 1.8];
    }
    const CRACK = [[196, 789], [232, 785], [262, 791], [308, 786], [338, 792], [384, 787], [420, 791], [470, 785], [512, 790], [566, 786], [604, 792], [660, 787], [704, 791], [752, 786], [806, 790]]; // set coordinates: along the stage's floor, under the car
    function floorShot(g, t) {
        const D = duet(t), Pu = S.pulseAt(t), [sx, sy] = shake(t), view = { k: VS.k, cx: VS.cx + sx, cy: VS.cy + sy }, d = C.drawing(t), jolt = bump(t, JOLT, 0.25);
        const scared = on(t, JOLT) ? { eyes: 'wide', mouth: 'o' } : {};
        venueShot(g, t, view, {
            mike: { ...D.mike, squash: D.mike.squash + 0.06 * jolt }, devil: { ...D.devil, squash: D.devil.squash + 0.06 * jolt }, mikeAt: D.mikeAt, devilAt: D.devilAt, spots: [1.8, 1.8],
            bounce: 0.5 * Pu.pulse + 1.2 * jolt, lighters: 0.2,
            pose: { ben: { ...BEN_AWAY, ...(on(t, JOLT) ? { eyes: 'wide' } : {}) }, howie: { ...scared, headDy: 0.03 * Pu.pulse }, stan: { crash: !on(t, n(29)) ? Pu.pulse : 0 } },
            cactus: { lean: 0.07, wave: 0.5 + 0.2 * Pu.pulse, ...(on(t, JOLT) ? { mouth: 'oh', lean: -0.06 } : {}) },
            back: (c) => {
                // the lake swells behind the car
                const up = E.out(seg2(t, n(29.5), n(31.5))), base = c.St.at([712, 706]);
                P.bulge(g, base[0], base[1], 410 * VS.k, (118 * up + 14 * jolt + 4 * (d % 2) * up) * VS.k, d);
                braid(g, t, { ...c, mk: carPt(c.car, D.mikeAt, t, 0.5 * Pu.pulse + 1.2 * jolt), dv: carPt(c.car, D.devilAt, t, 0.5 * Pu.pulse + 1.2 * jolt) });
            },
            floor: ({ St }) => P.crack(g, CRACK.map((p) => St.at(p)), seg2(t, n(29), n(30.5)), on(t, n(30.5)) ? E.out(seg2(t, n(30.5), JOLT + 2 / 12)) : 0, d),
            mid: () => P.dust(g, t - n(28.5), E.seg(t, n(28.5), n(31)), [50, 950, -30, 850]),
        });
    }

    // the last frame, for the block that follows (it cuts away to the volcano)
    const LAST = { view: 'stage', pan: 0, shake: shake(T_END - FR), mikeAt: MIKE_B2B, devilAt: DEVIL_B2B, tomAt: FIN.tomAt, mike: { face: 'left', solo: 1 }, devil: { hand: 'right', solo: 1, flames: 1 } };

    Seg.solo1 = {
        shots: [[T0, T_ANS, 'First phrase'], [T_ANS, T_BROW, 'The answer'], [T_BROW, T_FANS, 'The eyebrow'], [T_FANS, T_TRADE, 'Tennis'], [T_TRADE, T_CLASH, 'Trading'], [T_CLASH, T_BACK, 'The clash'], [T_BACK, T_FLOOR, 'Back to back'], [T_FLOOR, T_END, 'The floor']],
        LAST,
        draw(g, t, env) {
            g.save();
            g.lineJoin = 'round';
            g0 = g;
            if (t < T_ANS - 1e-6) phraseShot(g, t);
            else if (t < T_BROW - 1e-6) answerShot(g, t);
            else if (t < T_FANS - 1e-6) browShot(g, t);
            else if (t < T_TRADE - 1e-6) fansShot(g, t);
            else if (t < T_CLASH - 1e-6) tradeShot(g, t);
            else if (t < T_BACK - 1e-6) clashShot(g, t);
            else if (t < T_FLOOR - 1e-6) backShot(g, t);
            else floorShot(g, t);
            g.restore();
        },
        post() {
            return {};
        },
    };
})();
