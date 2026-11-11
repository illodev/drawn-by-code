// Chorus 2, bars 54–62 (76.63–89.33 s): colour comes back, the sun thaws the Devil, and the
// title falls on him.
//   1 · «Sunshine» (bars 54–55): the band's car in the rain, the top up and the wipers going.
//       On the chorus's first beat the sun shoulders two clouds apart and the day floods back
//       from right to left behind an edge of sunbeams; the top folds down, the wipers park, the
//       band shake the water off in one beat. The title comes in the sky as it is sung.
//   2 · «The thaw» (bars 56–60): the roadside. The edge of sunbeams gets to the block of ice
//       and it melts; the Devil comes out soggy and blue-lipped, sneezes an ice cube, gets a
//       towel from his chauffeur, hurls the snapped crank at the sky (CLONK: the title up there
//       is solid) and gloats with the contract while the title's letters come down: the small
//       words as a rattle of white blocks he dodges, then D, R, E, which he dodges, then A on
//       his head and M on top. Only his horns, his tail and the mitt with the contract stick out.
//   3 · «Runnin' down a dream» (bars 61–62): the deck in full sun, closer; on «runnin'» the
//       band hits together and the title slams in. The last frame holds as a poster.
// The cactus in shades drives, as in chorus 1. Props: segments/chorus2-props.js (Chorus2Props).
// The roadside is verse 2c's (Seg.verse2c.ROAD, Verse2cProps): load verse2c-props.js and verse2c.js before this file.
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, W = Weather, P1 = Chorus1Props, P = Chorus2Props, twos = S.twos, b = S.b, B = S.B;
    const T0 = B(54), T56 = B(56), T61 = B(61), T63 = B(63), FR = 1 / 24;
    const SC = Rig.CAR, LANE = World.LANE, TAU = Math.PI * 2;
    const hb = (x) => S.snap(S.OFFSET + x * S.BEAT); // any beat, halves and quarters too, on its frame
    const lerp = E.lerp;
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const on = (t, a) => t >= a - 1e-6;
    const dr = (t, a) => Math.floor((t - a) * 12 + 1e-6); // drawings since a
    const seg2 = (t, a, c) => E.seg(twos(t, a), a, c); // 0..1 on twos, counted from a
    const bump = (t, a, dur = 0.3) => E.bump(twos(t, a), a, dur);
    const spring = (t, a, f = 17, damp = 6.5) => (t < a - 1e-6 ? 0 : Math.exp(-(t - a) * damp) * Math.cos((t - a) * f));
    const smooth = (u) => u * u * (3 - 2 * u);
    // a table of values, one per drawing since `a` (the last one holds); before `a`: `before`
    const steps = (t, a, list, before = list[list.length - 1]) => (on(t, a) ? list[Math.min(list.length - 1, dr(t, a))] : before);

    // --- the band's car: the cactus drives, the canvas top over it ------------------------------
    const SEATS = Rides.bandCarSeats(), WHEEL = [SEATS.wheel[0] - SEATS.driver[0] - 0.07, SEATS.wheel[1] - SEATS.driver[1] + 0.02];
    const cactus = (pose) => (g, s) => P1.cactus(g, 0, 0, s, { wheel: WHEEL, shades: 1, ...pose });
    const driving = (t) => {
        const Pu = S.pulseAt(t);
        return { squash: 0.05 * Pu.pulse, wave: Pu.k % 2 ? Pu.pulse : -Pu.pulse * 0.6 };
    };
    const top = (up) => ({ back: (g, s) => W.softTop(g, s, { up, part: 'back' }), front: (g, s) => W.softTop(g, s, { up, part: 'front' }) });
    // where somebody's feet are on screen, and how far up their head is (figure units)
    const WHO = [['tom', 'deck0', 1.5], ['mike', 'deck1', 1.5], ['ben', 'deck2', 1.5], ['howie', 'deck3', 1.5], ['stan', 'kit', 1.9], ['cactus', 'driver', 1.5]];

    // =========================================================================================
    // Shot 1 · «Sunshine», bars 54–55
    // =========================================================================================
    const CX1 = 520, SUN1 = [838, 158, 62], TITLE1 = [492, 338], K1 = 0.92;
    // the day's edge: k 1 → 0 as it crosses from right to left (Weather.frontX)
    const kDay = (t) => 1 - Math.pow(E.seg(t, T0 + 3 * FR, b(219)), 1.12);
    const edgeAt = (k, x, y, from) => {
        for (let f = 0; f < 90; f++) if (W.frontX(k(from + f * FR), y) <= x) return from + f * FR;
        return from + 90 * FR;
    };
    const T_TOP = edgeAt(kDay, CX1 + 2.9 * SC, LANE - 2.2 * SC, T0); // the edge is over the cockpit
    const SHAKE = b(220);
    const wipe = (t) => 0.8 * Math.sin(((t - S.OFFSET) / S.BEAT) * Math.PI);

    function sunshine(g, t, env) {
        const X = Rig.X(t), Pu = S.pulseAt(t), d = C.drawing(t), k = kDay(t), RW = World.THEMES.rain;
        const sun = { x: SUN1[0] + X * 0.004, y: SUN1[1], r: SUN1[2] };
        // the sun comes out with its shoulders: a shove to the left, one to the right
        const jolt = steps(t, T0, [-14, 12, -5, 0]), pp = S.pop(t, T0, 0.25), cu = E.out(E.seg(t, T0, T0 + 0.9));
        W.split(g, k, (g2) => {
            World.back(g2, t, X, 'rain', { sun: { x: sun.x + jolt, y: sun.y, r: sun.r * pp } });
            for (const [sx, x0, y0, sz, far] of [[-1, 92, 34, 96, 300], [1, 100, 40, 86, 260]]) {
                g2.save();
                g2.translate(SUN1[0] + sx * (x0 + far * cu), SUN1[1] + y0 - 26 * cu);
                g2.rotate(sx * 0.3 * Math.sin(Math.min(1, cu * 1.6) * Math.PI));
                World.cloud(g2, RW, 0, 0, sz);
                g2.restore();
            }
        }, (g2) => World.back(g2, t, X, 'day', { sun }));
        P.sunEdge(g, t, k);
        if (on(t, T0 + 6 * FR) && k > 0) P.sun(g, SUN1[0] + jolt, SUN1[1], SUN1[2] * pp, t); // the beams come from behind it
        P1.title(g, t, TITLE1[0], TITLE1[1], { at: S.TITLES[2].slice(0, 3).map(S.snap), out: T56 + 1, k: K1 }); // word by word, as it is sung

        // the car: the top folds down once the edge is over it, the wipers park
        const up = 1 - seg2(t, T_TOP + 2 * FR, T_TOP + 2 * FR + 8 / 12);
        const wp = t < T_TOP ? wipe(t) : lerp(wipe(T_TOP), 0.9, E.out(E.seg(t, T_TOP, T_TOP + 0.3)));
        const sh = steps(t, SHAKE, [1, -1, 0.8, -0.6, 0], 0), base = 0.045 * Pu.pulse + 0.05 * Math.abs(sh);
        const wet = (who) => ({ lean: 0.13 * sh, sway: -0.14 * sh, squash: base, headTilt: 0.05 * sh });
        const co = { spin: X / (0.56 * SC), bounce: 0.2 * Pu.pulse, exhaust: 0.6 };
        Rig.band(g, t, CX1, LANE, SC, {
            ...co, tomDrives: false, sing: true, driver: cactus({ ...driving(t), ...(sh ? { wave: sh, lean: 0.1 * sh } : {}) }), cockpit: top(up),
            pose: sh ? { tom: wet(), mike: wet(), howie: wet(), ben: wet(), stan: { headTilt: 0.14 * sh, sway: -0.14 * sh, squash: 0.03 * Pu.pulse + 0.04 * Math.abs(sh) } } : {},
        });
        W.onBandCar(g, CX1, LANE, SC, co, (g2) => W.wipers(g2, SC, wp));
        // water: off the top's edge while it rains, flung off everybody on the shake, steam after
        if (t < T_TOP + 0.3) W.drips(g, CX1 + 2.3 * SC, LANE - 2.44 * SC, SC, t, 4, { w: 0.9, len: 1.2 });
        WHO.forEach(([who, seat, hh], i) => {
            const [px, py] = Rig.seat('band', seat, CX1, LANE, SC);
            for (const [at, sd] of [[SHAKE, 'a'], [SHAKE + 2 / 12, 'b']]) P.spray(g, px, py - (hh - 0.3) * SC, SC, t - at, who + sd, { n: 6, w: 0.7, h: 0.6, v: 3.6 });
        });
        const dry = E.seg(t, SHAKE + 0.25, SHAKE + 0.5) * (1 - E.seg(t, b(222), b(223) + 0.2));
        P.steam(g, CX1 - 0.5 * SC, LANE - 2.9 * SC, SC, t, dry, 6.4, 1, 9);
        W.split(g, k, (g2) => World.rain(g2, t, 1), null);
        // no near layer here: its cacti would cross the cockpit while the top folds and the deck on the shake
    }

    // =========================================================================================
    // Shot 2 · «The thaw» and «the letters», bars 56–60: the roadside, static
    // =========================================================================================
    // The same place and the same things as the picture verse 2c ends on (Seg.verse2c.roadside:
    // its positions are Seg.verse2c.ROAD, wide, the cars at 84; its props Verse2cProps): the same
    // stretch of road, the hearse with the iced machine still on its hitch, the Devil's block,
    // the chauffeur in his scarf with a mitt by the ice. This shot is that picture 150 / 84
    // closer about the Devil: the figures at 150 units, his ground point at (410, 888) on screen,
    // which leaves the machine out of the frame to the left, all but its tow bar.
    // The stage's own coordinates keep him at x = 480 (STAGE_X moves them onto the screen).
    // Three lanes on the road's near edge, front to back.
    const V = Verse2cProps, ROAD = Seg.verse2c.ROAD;
    const RS = 150, RZ = RS / SC, STAGE_X = -70, RX = ROAD.X, SUN2 = [760, 120, 46];
    const GB = 872, G0 = 888, GF = 906; // the ground of the back lane, of the Devil's and of the front one
    const XD = 480, XP = 468; // the Devil in his block; where he ends, under the pile
    const onStage = (p) => [XD + (p.x - ROAD.devil.x) * RZ, G0 + (p.y - ROAD.devil.y) * RZ]; // a point of verse 2c's picture on this stage
    const [HX, HY] = onStage(ROAD.hearse);
    const RFX = STAGE_X + onStage({ x: 520, y: LANE })[0], RFY = onStage({ x: 520, y: LANE })[1]; // where the wide shots' (520, LANE) is on screen
    const GRAV = 1600; // this shot's gravity, logical units a second squared: 10.7 figure units, the real one
    const kDay2 = (t) => 0.74 * (1 - E.seg(t, T56, hb(225.25)));
    const TH0 = edgeAt(kDay2, XD + STAGE_X + 110, 640, T56), TH1 = hb(226.5); // the block melts between these
    const MELT = 0.62, BLOCK_H = ROAD.block.h, blockH = (u) => BLOCK_H * Math.pow(1 - u, 1.25); // verse 2c's block, sinking
    const uAt = (h) => 1 - Math.pow(h / BLOCK_H, 1 / 1.25);
    const T_HEAD = S.snap(lerp(TH0, TH1, uAt(1.9))), T_ARMS = S.snap(lerp(TH0, TH1, uAt(0.95)));
    const T_AH = hb(226.5), T_AH2 = hb(226.75), T_CHOO = b(227), T_UP = hb(227.75), T_TOWEL = b(229), T_TOSS = T_TOWEL - 8 * FR, T_NECK = b(230);
    const T_GRAB = hb(230.75), T_LIFT = hb(231.25), T_THROW = b(232), T_CLONK = b(233) + 3 * FR, T_PULL = hb(233.5), T_GLOAT = b(234), T_LOOK = hb(234.5);
    const T_RATTLE = hb(235.5), T_A = b(241), T_M = b(242), T_APOS = b(243);

    function road(g, t, theme, sunK = 1) {
        g.save();
        g.translate(RFX, RFY);
        g.scale(RZ, RZ);
        g.translate(-520, -LANE);
        World.back(g, t, RX, theme, theme === 'day' ? { sun: { x: 520 + (SUN2[0] - RFX) / RZ + RX * 0.004, y: LANE + (SUN2[1] - RFY) / RZ, r: (SUN2[2] / RZ) * sunK } } : {});
        g.restore();
    }

    // --- the letters ---------------------------------------------------------------------------
    // Every letter of the title is a solid that hangs above the frame, lets go and falls under
    // GRAV to where it rests: on the ground of its lane, or `base` above it on what is there.
    const SB = 210, SS = (SB * 104) / 196, HANG = { big: -150, small: -360 }, GROUND = { b: GB, m: G0, f: GF };
    const FALLS = [
        // the small words, a rattle: [letter, lane, x, landing frame of the film, { rot, base, spin, dx, topple }]
        ['R', 'b', 345, 2003, { spin: 1.6 }], ['U', 'f', 790, 2005, { spin: -1.2 }], ['N', 'b', 620, 2007, { spin: 0.9 }], ['N', 'b', 548, 2008, { rot: Math.PI / 2, spin: 2.2 }],
        ['I', 'f', 300, 2010, { topple: 1, spin: -0.8 }], ['N', 'f', 852, 2012, { spin: 1.3 }], ['D', 'b', 250, 2014, { spin: -1.5 }], ['O', 'b', 404, 2016, { spin: 1.1 }],
        ['W', 'b', 705, 2018, { spin: -0.9 }], ['N', 'f', 242, 2020, { rot: -Math.PI / 2, base: 0.187 * SS, spin: -2.4 }], ['A', 'b', 775, 2022, { spin: 1.4 }],
    ].map(([ch, lane, x, f, o]) => ({ ch, lane, x, tl: f / 24, kind: 'small', ...o }));
    const BIG = [['D', 'f', 438, b(238), {}], ['R', 'f', 534, b(239), {}], ['E', 'f', 623.5, b(240), {}], ['A', 'm', XP, T_A, { base: 200 }], ['M', 'f', 656, T_M, { base: 0.859 * SB }]]
        .map(([ch, lane, x, tl, o]) => ({ ch, lane, x, tl, kind: 'big', spin: 0, ...o }));
    // the apostrophe comes last, on its own, onto the M
    const APOS = { ch: "'", lane: 'f', x: 610, tl: T_APOS, kind: 'small', base: 2 * 0.859 * SB, spin: 2 };
    const LETTERS = [...FALLS, ...BIG, APOS].map((l, i) => {
        const Sz = l.kind === 'big' ? SB : SS, [w, h] = P.faceOf(l.ch, Sz), lying = Math.abs(Math.abs(l.rot ?? 0) - Math.PI / 2) < 0.01;
        const foot = GROUND[l.lane] - (l.base ?? 0), cy = foot - (lying ? w : h) / 2, T = Math.sqrt((2 * (cy - HANG[l.kind])) / GRAV);
        return { ...l, i, S: Sz, w, h, foot, cy, T, t0: l.tl - T, rot: l.rot ?? 0, dx: l.dx ?? ((i * 37) % 5 - 2) * 9 };
    });
    // the heavy landings: everything on the ground hops on each
    const THUDS = BIG.map((l) => [l.tl, l.ch === 'A' ? 0.7 : 1]);
    // a hop of what is on the ground: up at v0 on the thud, down under GRAV
    const hopAt = (t, v0, since = -1) => {
        let h = 0;
        for (const [tk, kk] of THUDS) {
            if (tk < since + 1e-6 || t < tk - 1e-6) continue;
            const a = t - tk, y = v0 * kk * a - 0.5 * GRAV * a * a;
            if (y > h) h = y;
        }
        return h;
    };
    // where a letter is at t: null while it hangs out of sight; { x, y, rot, sx, sy, age (since it landed, or -1) }
    function letterAt(l, t) {
        if (t < l.t0) return null;
        if (t < l.tl - 1e-6) {
            const a = t - l.t0;
            return { x: l.x + l.dx * (1 - a / l.T), y: HANG[l.kind] + 0.5 * GRAV * a * a, rot: l.rot + l.spin * (l.tl - t), sx: 1, sy: 1, age: -1 };
        }
        const age = t - l.tl, big = l.kind === 'big';
        const [sx, sy] = steps(t, l.tl, big ? [[1.14, 0.8], [1.06, 0.91], [0.97, 1.04], [1, 1]] : [[1.12, 0.84], [0.97, 1.05], [1, 1]]);
        let x = l.x, y = l.cy, a = l.rot;
        // a small block bounces once where it landed
        if (!big && age > 1 / 12 && age < 1 / 12 + 0.19) {
            const u = (age - 1 / 12) / 0.19;
            y -= 4 * 13 * u * (1 - u);
        }
        if (l.topple) {
            // it stands for two drawings, then falls over onto its side, about its foot's corner
            const th = -l.topple * (Math.PI / 2) * E.in(seg2(t, l.tl + 2 / 12, l.tl + 6 / 12)), c = rot([l.topple * l.w / 2, -l.h / 2], th);
            x = l.x - l.topple * l.w / 2 + c[0];
            y = l.foot + c[1];
            a = th;
        }
        y -= hopAt(t, big ? 110 : 250, l.tl);
        return { x, y, rot: a, sx, sy, age };
    }
    function letters(g, t, lane) {
        for (const l of LETTERS) {
            if (l.lane !== lane) continue;
            const s = letterAt(l, t);
            if (!s || s.y < -160) continue;
            const big = l.kind === 'big', ground = l.foot;
            if (big && s.age >= 0 && l.lane === 'f') P.thud(g, l.x, ground, l.w, s.age, 'star', { seed: l.ch, flat: l.base ? 0.2 : 0.3 });
            P.solid(g, l.ch, l.kind, l.S, s.x, s.y, { rot: s.rot, sx: s.sx, sy: s.sy });
            if (s.age < 0) continue;
            if (big) {
                if (l.base) P.tick(g, l.x, ground - 6, l.w * 0.5 + 10, s.age, { n: 3, sides: true, lw: 3.6 });
                else P.thud(g, l.x, ground, l.w, s.age, 'dust', { seed: l.ch });
            } else P.tick(g, l.x, ground - 5, (Math.abs(l.rot) > 1 ? l.h : l.w) * 0.5 + 8, s.age, { n: 3, sides: true, lw: 2.8 });
        }
    }

    // --- the Devil ---------------------------------------------------------------------------
    // a point of his (figure units, body frame; or head frame) on screen
    const devPt = (x, y, pose, p, head = false) => {
        const q = pose.squash ?? 0;
        let v = p;
        if (head) {
            v = rot(v, pose.headTilt ?? 0);
            v = [v[0], v[1] + (pose.headDy ?? 0)];
        }
        v = rot([v[0] * (1 + q), v[1] * (1 - q)], pose.lean ?? 0);
        return [x + v[0] * RS, y + v[1] * RS];
    };
    // …and the other way: the point of his body frame that is at p (figure units from his feet, on screen)
    const devInv = (pose, p) => {
        const q = pose.squash ?? 0, v = rot(p, -(pose.lean ?? 0));
        return [v[0] / (1 + q), v[1] / (1 - q)];
    };
    /**
     * The Devil with what this shot puts on him.
     *   ex: { crank (the angle of the snapped crank in his right mitt), frost (0..1: what is left of the frost on it), paperR ({ ang }: the contract in his right mitt),
     *         wet (0..1 drips), hair (0..1 limp locks), chatter, towel ('head' | 'neck'), towelJ, towelSq }
     */
    function devil(g, x, y, pose, t, ex = {}) {
        const d = C.drawing(t);
        if (ex.crank != null && !ex.frost) {
            const p = devPt(x, y, pose, pose.handR);
            W.crankArm(g, p[0], p[1], RS, ex.crank + (pose.lean ?? 0), CRANK.flip);
        }
        if (ex.paperR) {
            P.onDevil(g, x, y, RS, pose, (g2, L) => {
                const c = rot([-0.02, -0.3], ex.paperR.ang);
                Devil.contract(g2, pose.handR[0] + c[0], pose.handR[1] + c[1], L, { ang: ex.paperR.ang, open: 1 });
            });
        }
        if (ex.frost) V.devilWithCrank(g, x, y, RS, { pose, crankFrost: ex.frost }); // still in the ice: the crank as verse 2c drew it, its frost going
        else Devil.draw(g, x, y, RS, pose);
        P.onDevil(g, x, y, RS, pose, (g2, L) => {
            if (ex.wet) P.dripping(g2, L, pose, t, ex.wet);
            if (ex.towel === 'neck') P.towelNeck(g2, L, ex.towelSw ?? 0);
        });
        P.onDevil(g, x, y, RS, pose, (g2, L) => {
            if (ex.chatter) P.chatter(g2, L, d);
            if (ex.hair) P.wetHair(g2, L, ex.hair, d);
            if (ex.towel === 'head') P.towelHead(g2, L, ex.towelJ ?? 0, ex.towelSq ?? 0);
        }, true);
    }
    // his dashes out of the way of what comes down: [the beat it lands on, from x, to x, frames, frames of lead]
    const DASH = [[b(236), XD, 410, 6, 3], [b(237), 410, 545, 6, 3], [b(238), 545, 640, 6, 4], [b(239), 640, 735, 6, 4], [b(240), 735, XP, 8, 6]];
    function dashAt(t) {
        let x = XD, lift = 0, dir = 0, landed = -9;
        for (const [at, x0, x1, n, lead] of DASH) {
            const a = at - lead * FR, T = n * FR;
            if (!on(t, a)) break;
            const u = seg2(t, a, a + T);
            x = lerp(x0, x1, smooth(u));
            lift = u < 1 ? 4 * ((GRAV * T * T) / 8) * u * (1 - u) : 0;
            dir = u < 1 ? Math.sign(x1 - x0) : 0;
            landed = a + T;
        }
        return { x, lift, dir, landed };
    }
    const FROZEN = V.FROZEN, CRANK = V.CRANK; // how the ice kept him: mid-laugh, the snapped crank in his right mitt
    const CRANK_AT = [XD - 112, G0 - 8]; // where the crank lies once it has slipped out of his mitt
    // His pose and what is on him at t, from the moment his head is out of the ice.
    function devilAt(t) {
        const Pu = S.pulseAt(t), d = C.drawing(t), f = d % 2 ? 1 : -1, hug = { handR: [-0.12, -0.62], handL: [0.14, -0.7] };
        const shiver = { mood: 'shock', squash: 0.02 * f, step: f, tail: 0.03 * f, headTilt: 0.03 * f };
        const wet = 1 - 0.8 * E.seg(t, T_NECK, T_LOOK);
        let x = XD, lift = 0, pose, ex = { wet, hair: Math.min(E.seg(t, T_HEAD, T_HEAD + 0.25), 1 - E.seg(t, T_TOWEL, T_TOWEL + 0.01)) };
        if (t < T_ARMS) {
            pose = { ...FROZEN, mood: 'shock', headTilt: -0.06 + 0.03 * f };
            ex = { ...ex, wet: 0, crank: CRANK.a, chatter: on(t, T_HEAD + 2 / 12) };
        } else if (t < T_AH) {
            pose = { ...shiver, ...hug, shadow: t < TH1 ? false : undefined };
            x += 3 * f;
            ex.chatter = true;
        } else if (t < T_CHOO) {
            // «ah… ah…»: his head goes back in two steps
            const k2 = on(t, T_AH2) ? 1 : 0.5;
            pose = { mood: 'shock', eyes: 'shut', headTilt: 0.22 * k2, lean: 0.06 * k2, squash: -0.03 * k2, handR: [-0.3 - 0.1 * k2, -0.66 - 0.2 * k2], handL: [0.32 + 0.1 * k2, -0.72 - 0.2 * k2], tail: 0.1 * k2 };
        } else if (t < T_CHOO + 3 / 12) {
            // «…CHOO!»
            const k2 = steps(t, T_CHOO, [1, 0.8, 0.4]);
            pose = { mood: 'shock', eyes: 'shut', headTilt: -0.26 * k2, lean: -0.1 * k2, squash: 0.12 * k2, handR: [-0.62, -0.5], handL: [0.62, -0.52], tail: 0.24 * k2, step: -1 };
        } else if (t < T_TOWEL) {
            pose = { ...shiver, ...hug };
            x += 3 * f;
            ex.chatter = true;
        } else if (t < T_NECK) {
            // the towel is on his head: he takes its ends and rubs
            const rub = on(t, T_TOWEL + 2 / 12), j = rub ? f : 0;
            pose = { mood: 'shock', squash: steps(t, T_TOWEL, [0.14, 0.06, 0]) + (rub ? 0.02 * f : 0), headTilt: 0.07 * j, handR: rub ? [-0.64 + 0.07 * j, -1.36] : hug.handR, handL: rub ? [0.64 + 0.07 * j, -1.36] : hug.handL, tail: 0.05 * f, step: rub ? f : 0 };
            ex = { ...ex, hair: 0, chatter: !rub, towel: 'head', towelJ: 0.07 * j, towelSq: steps(t, T_TOWEL, [1, 0.4, 0]) };
        } else if (t < T_GRAB) {
            // dry: the towel round his neck. He sees the crank at his feet
            pose = { mood: 'angry', look: -1, headTilt: -0.08, squash: steps(t, T_NECK, [0.06, 0]), handR: [-0.52, -0.5], handL: [0.44, -0.54], tail: 0.08 };
            ex = { ...ex, hair: 0, towel: 'neck' };
        } else if (t < T_THROW) {
            // he snatches it up…
            const up = on(t, T_LIFT), wu = seg2(t, T_LIFT, T_THROW);
            pose = { mood: 'angry', look: -1, lean: up ? 0.09 : -0.1, squash: up ? 0.06 : 0.15, headTilt: up ? 0 : -0.1, handL: [0.5, -0.6], tail: 0.14 };
            pose.handR = up ? [-0.84, -0.6 - 0.1 * wu] : devInv(pose, [(CRANK_AT[0] - XD) / RS, (CRANK_AT[1] - G0) / RS]); // his mitt on its grip, where it lies
            ex = { ...ex, hair: 0, towel: 'neck', crank: up ? lerp(-0.3, -1.3, wu) : null };
        } else if (t < T_PULL) {
            // …hurls it at the sky and shakes his fist after it
            const thr = dr(t, T_THROW) < 2;
            pose = { mood: 'angry', headTilt: -0.14, lean: thr ? -0.07 : -0.03, squash: thr ? -0.07 : 0.03 * f, handR: thr ? [-0.5, -1.8] : [-1.04 - 0.04 * f, -1.46 + 0.12 * f], handL: [0.44, -0.54], tail: 0.16 * f, step: thr ? 0 : f };
            lift = thr ? 9 : 0;
            ex = { ...ex, hair: 0, towel: 'neck', towelSw: thr ? 0.03 : 0 };
        } else if (t < T_GLOAT) {
            // a mitt inside his coat…
            pose = { mood: 'sly', headTilt: 0.04, handR: [-0.44, -0.54], handL: [0.07, -0.72], squash: 0.03, tail: 0.04 * f };
            ex = { ...ex, hair: 0, towel: 'neck' };
        } else if (t < T_LOOK) {
            // …and out comes the contract, held up to the sky
            const pp = S.pop(t, T_GLOAT, 0.2);
            pose = { mood: 'grin', headTilt: -0.1, lean: -0.03, squash: 0.04 * Pu.pulse - 0.05 * (1 - Math.min(1, pp)), handR: [-0.44, -0.54], handL: [0.72, -1.36 - 0.06 * f], contract: { ang: 0.12 + 0.06 * f, open: Math.min(1, pp), at: [0.03, -0.3] }, tail: 0.08 * f };
            ex = { ...ex, hair: 0, towel: 'neck' };
        } else if (t < DASH[0][0] - DASH[0][4] * FR) {
            // he looks up; then ducks under his own contract
            const duck = on(t, T_RATTLE);
            pose = { mood: 'shock', headTilt: duck ? 0.05 * f : -0.2, lean: duck ? 0 : -0.05, squash: duck ? 0.1 + 0.02 * f : -0.03, handR: duck ? [-0.26, -0.8] : [-0.7, -0.92], handL: duck ? [0.24, -0.74] : [0.62, -0.98], contract: { ang: duck ? -0.2 : 0.3, open: 1, at: duck ? [-0.16, -0.02] : [0.05, -0.28] }, tail: duck ? 0.2 * f : 0.26, step: duck ? f : 0 };
            ex = { ...ex, hair: 0, towel: 'neck' };
        } else {
            const ds = dashAt(t), air = ds.dir !== 0, since = t - ds.landed;
            x = ds.x;
            lift = ds.lift;
            const last = on(t, DASH[4][0] - DASH[4][4] * FR), ha = !air && since > 1 / 12 && on(t, DASH[2][0]); // «ha!» once the big ones miss
            if (last && !air) {
                // behind the three that missed him: he crows over them, the contract held high
                pose = { mood: 'laugh', headTilt: -0.08, squash: 0.03 * f, handR: [-0.5, -1.3 + 0.08 * f], handL: [0.76, -1.56 - 0.06 * f], contract: { ang: 0.14 + 0.08 * f, open: 1, at: [0.03, -0.3] }, tail: 0.1 * f };
                lift = f > 0 ? 12 : 0;
            } else {
                pose = {
                    mood: ha ? 'laugh' : 'shock', lean: air ? 0.16 * ds.dir : 0, squash: air ? -0.07 : ha ? 0.03 * f : 0.1, headTilt: air ? -0.06 * ds.dir : ha ? -0.08 : 0.04 * f,
                    handR: air ? [-0.72, -1.1] : ha ? [-0.5, -1.25 + 0.08 * f] : [-0.26, -0.8], handL: air ? [0.7, -1.0] : ha ? [0.72, -1.4] : [0.24, -0.74],
                    contract: { ang: air ? 0.5 * ds.dir : ha ? 0.14 : -0.2, open: 1, at: air || ha ? [0.04, -0.28] : [-0.16, -0.02] }, tail: air ? -0.2 * ds.dir : 0.14 * f, step: air ? ds.dir : 0,
                };
            }
            ex = { ...ex, hair: 0, towel: 'neck', towelSw: air ? -0.05 * ds.dir : 0 };
        }
        return { x, lift, pose, ex };
    }

    // --- the chauffeur ---------------------------------------------------------------------------
    const SEAT_C = Rides.hearseSeats().chauffeur, CH = [HX + SEAT_C[0] * RS, HY + SEAT_C[1] * RS]; // his own origin on the stage
    const TOSS_FROM = [-0.86, -1.4], UMB_AT = [0.56, -1.04], SHOULDER = [-0.33, -0.85];
    // verse 2c leaves his right mitt by the ice he has been knocking on (the block's far right edge, 2.02 up; its mittAt at rest)
    const TOUCH = V.blockSide(XD, G0, RS, ROAD.block, 2.02), KNOCK = [(TOUCH[0] - CH[0]) / RS + 0.1 + 0.11, (TOUCH[1] - CH[1]) / RS - 0.11 * 0.25];
    const T_UMB = hb(234.25);
    function chauffeurAt(t) {
        const d = C.drawing(t), f = d % 2 ? 1 : -1;
        const open = seg2(t, b(235), b(235) + 5 / 12), ou = smooth(open);
        // the umbrella comes up out of the cab when the sky starts to fall, and opens
        const rise = E.out(seg2(t, T_UMB, T_UMB + 3 / 12));
        const umb = on(t, T_UMB) ? { at: [lerp(UMB_AT[0], 0.44, ou), lerp(UMB_AT[1], -1.12, ou) + 1.9 * (1 - rise)], open, tilt: lerp(0.16, -0.34, ou) } : null;
        let r = [-0.5, -0.47], towel = null, headTilt = -0.07, jaw = 0, headDy = 0, reach = null;
        if (t < TH0 + 3 / 12) {
            // his mitt by the ice; the sun gets there and he takes it back
            const k2 = steps(t, TH0, [1, 0.55, 0.2], 1);
            reach = [lerp(-0.62, KNOCK[0], k2), lerp(-1.0, KNOCK[1], k2)];
            const dx = reach[0] - SHOULDER[0], dy = reach[1] - SHOULDER[1], dl = Math.hypot(dx, dy);
            r = [SHOULDER[0] + (dx / dl) * 0.02, SHOULDER[1] + (dy / dl) * 0.02]; // a stub: the arm itself goes on after the car, over its side
        } else if (on(t, T_UP) && t < T_TOSS - 2 / 12) {
            // up comes a towel…
            const u = E.out(seg2(t, T_UP, T_UP + 3 / 12));
            r = [-0.98, lerp(-0.7, -1.22, u)];
            towel = 0.02 * f;
        } else if (on(t, T_TOSS - 2 / 12) && t < T_TOSS) {
            r = [-0.52, -1.6];
            towel = 0.12;
            headTilt = 0.02;
        } else if (on(t, T_TOSS) && t < T_TOSS + 3 / 12) {
            // …and over it goes
            r = TOSS_FROM;
            headTilt = -0.12;
        } else if (on(t, T_TOSS + 3 / 12) && t < T_TOWEL + 0.4) r = [-0.6, -1.0];
        if (on(t, T_CHOO) && t < T_CHOO + 2 / 12) headTilt = 0.08; // the sneeze makes him start
        if (on(t, T_LOOK)) headTilt = -0.02;
        if (on(t, T_A)) {
            jaw = 1;
            headTilt = -0.13;
        }
        headDy = -0.05 * (hopAt(t, 200) / 12.5);
        return { pose: { hands: umb && rise > 0.6 ? { r, l: umb.at } : { r }, headTilt, jaw, headDy }, towel, umb, reach };
    }
    function hearse(g, t) {
        const ch = chauffeurAt(t), sink = -0.5 * (hopAt(t, 200) / 12.5);
        // the machine is still on the hitch, iced over, its crank gone (verse 2c's way of leaving it out, and its
        // stub of a shaft); in this framing only its tow bar shows
        const tow = W.towedAt(HX, HY, RS, { bounce: sink }), iced = lerp(1, 0.5, E.seg(t, TH0, b(238)));
        W.machine(g, tow.x, tow.y, RS, { towed: true, t, pitch: tow.pitch, crank: V.NO_CRANK, iced, smoke: 0, needles: 1, swing: 0 });
        V.snappedStub(g, tow.x, tow.y, RS, { ice: iced });
        Rides.hearse(g, HX, HY, RS, { spin: 0.6, flames: 0, bounce: sink, t, swing: 0 }, (g2, seats, sc0) => {
            Rides.at(g2, sc0, seats.chauffeur, (px, py, sc) => {
                if (ch.umb) W.umbrella(g2, px + ch.umb.at[0] * sc, py + ch.umb.at[1] * sc, sc, { open: ch.umb.open, tilt: ch.umb.tilt, color: K.magenta });
                Rides.skeleton(g2, px, py, sc, { shadow: false, ...ch.pose });
                V.skelScarf(g2, px, py, sc, { t, headDy: ch.pose.headDy }); // the scarf verse 2c gave him
                if (ch.towel != null) P.towelHang(g2, px + ch.pose.hands.r[0] * sc, py + ch.pose.hands.r[1] * sc, sc, ch.towel); // folded over his mitt
            });
        });
        if (ch.reach) {
            g.save();
            g.translate(CH[0], CH[1]);
            g.scale(RS, RS);
            g.lineJoin = 'round';
            Cast.arm(g, Rides.SKEL, 3.2 / RS, SHOULDER, ch.reach);
            g.restore();
        }
        // the icicle under the hearse's lantern goes drop by drop
        const lan = [HX - 3.8 * RS, HY - 0.965 * RS], icK = 1 - E.seg(t, TH0, b(232));
        g.save();
        g.lineJoin = 'round';
        g.lineCap = 'round';
        W.icicle(g, 3.2, lan[0], lan[1], 0.24 * RS * icK, 0.075 * RS * (0.4 + 0.6 * icK), 0);
        g.restore();
        if (icK > 0.1) W.drips(g, lan[0], lan[1] + 0.24 * RS * icK, RS, t, 1, { pts: [[0, 0]], len: 0.66, slant: 0 });
        // the umbrella is still wet from the three days
        if (ch.umb && ch.umb.open > 0.9) W.drips(g, CH[0] + ch.umb.at[0] * RS, CH[1] + ch.umb.at[1] * RS, RS, t, 0, { pts: W.umbrellaTips({ open: 1, tilt: ch.umb.tilt }), len: 0.7, slant: 0 });
    }

    function thaw(g, t, env) {
        const d = C.drawing(t), f = d % 2 ? 1 : -1, k = kDay2(t);
        // the camera takes each heavy landing
        let sh = 0;
        for (const [tk, kk] of THUDS) if (on(t, tk) && dr(t, tk) < 3) sh = [10, -5, 2][dr(t, tk)] * kk;
        g.save();
        g.translate(0, sh);
        const working = E.seg(t, TH0, TH0 + 0.2) * (1 - E.seg(t, TH1, TH1 + 0.3)); // the sun leans into it while the ice melts
        W.split(g, k, (g2) => road(g2, t, 'rain'), (g2) => road(g2, t, 'day', 1 + 0.1 * working * (f > 0 ? 1 : 0.4)));
        P.sunEdge(g, t, k);

        g.save();
        g.translate(STAGE_X, 0);
        // behind the stage: the hearse on the road
        hearse(g, t);
        // the snow that had settled on the road goes with the ice
        const snowK = 1 - E.seg(t, TH0, TH1);
        if (snowK > 0.05) {
            V.mound(g, XD - 118 * RZ, G0 + 10 * RZ, 96 * RZ * (0.5 + 0.5 * snowK), 13 * RZ * snowK);
            V.mound(g, HX + 196 * RZ, HY + 30 * RZ, 120 * RZ * (0.5 + 0.5 * snowK), 12 * RZ * snowK);
        }

        letters(g, t, 'b');

        // --- the Devil's lane ---------------------------------------------------------------
        const u = E.seg(t, TH0, TH1), su = smooth(u), H = blockH(u);
        // the puddle the block leaves dries in the sun
        const dryK = 1 - E.seg(t, b(228), b(232));
        if (u >= 1) {
            P.puddle(g, XD, G0, RS, MELT, dryK);
            P.steam(g, XD + 0.2 * RS, G0 - 0.05 * RS, RS, t, Math.min(1, dryK * 1.4) * E.seg(t, TH1, TH1 + 0.3), 3.2 * dryK + 0.4, 2, 6);
        }
        // the crank: in his mitt while he is frozen, then it slips out and lies at his feet
        const crankFree = on(t, T_ARMS) && t < T_LIFT;
        if (crankFree) {
            const from = devPt(XD, G0, FROZEN, FROZEN.handR), a = t - T_ARMS, T = Math.sqrt((2 * (CRANK_AT[1] - from[1])) / GRAV), uu = Math.min(1, a / T);
            const cy = a < T ? from[1] + 0.5 * GRAV * a * a : CRANK_AT[1] - Math.max(0, hopAt(t, 200));
            W.crankArm(g, lerp(from[0], CRANK_AT[0], uu), cy, RS, lerp(CRANK.a, 0, smooth(uu)), CRANK.flip);
            if (a >= T) P.tick(g, CRANK_AT[0], CRANK_AT[1] + 8, 34, a - T, { n: 5, a0: -Math.PI * 0.9, a1: -Math.PI * 0.1, ink: W.ICE.line });
        }
        const D = devilAt(t);
        const aL = LETTERS.find((l) => l.ch === 'A' && l.kind === 'big'), aS = letterAt(aL, t);
        if (u < 1) {
            // in the ice: it sinks from the top, he thaws from the head down
            const bo = { ...ROAD.block, t, melt: MELT * su, h: H / (1 - 0.88 * MELT * su), shake: t < TH0 ? 0 : 0.5 * (1 - u) };
            if (t < T_HEAD) V.frozenDevil(g, XD, G0, RS, bo); // verse 2c's own drawing of him on ice, for as long as his head is in it
            else {
                W.iceBlock(g, XD, G0, RS, bo, (g2) => {
                    // the same cloudy ice behind him (frozenDevil's), then the Devil as he thaws
                    const sh = V.blockShape(bo);
                    g2.save();
                    g2.translate(XD, G0);
                    g2.scale(RS, RS);
                    g2.globalAlpha = 0.9 * (1 - 0.5 * bo.melt);
                    C.prism(g2, sh.face, sh.S, { front: '#cfeaff', top: '#e2f3ff', side: '#b4dafa' }, { lw: 0 });
                    g2.restore();
                    devil(g2, D.x, G0, D.pose, t, t < T_ARMS ? { ...D.ex, frost: Math.max(0, 1 - bo.melt * 4) } : D.ex);
                });
            }
            // the sun finds it: a glint where the edge touches it
            const gl = steps(t, TH0, [0.6, 1, 0.75, 0.4, 0], 0);
            if (gl) C.sparkle(g, XD + 0.95 * RS, G0 - 2.3 * RS, 70 * gl, { color: K.white, ink: K.ink, lw: 3, rot: 0.2 });
        } else if (!on(t, T_A - 2 * FR)) {
            const shadowY = G0;
            if (D.lift > 0) {
                g.fillStyle = Devil.P.shadow;
                g.beginPath();
                g.ellipse(D.x + 0.06 * RS, shadowY, 0.52 * RS, 0.055 * RS, 0, 0, TAU);
                g.fill();
            }
            const lift = D.lift + (D.lift > 0 ? 0 : hopAt(t, 200));
            devil(g, D.x, G0 - lift, { ...D.pose, shadow: D.lift > 0 || lift > 0 ? false : D.pose.shadow }, t, D.ex);
            if (D.ex.chatter) {
                P.shivers(g, D.x, G0, RS, t);
                W.breath(g, D.x + 0.2 * RS, G0 - 1.02 * RS, RS, t);
            }
        } else {
            // under the A: it drives him down behind the three that missed, and there he stays
            const footA = aS ? aS.y + aL.h / 2 : aL.foot, sink = Math.max(0, Math.min(100, footA - (G0 - 270))) + (on(t, T_A) ? steps(t, T_A, [8, -3, 0]) : 0);
            const outU = on(t, hb(241.5)) ? steps(t, hb(241.5), [0.7, 1.08, 1]) : 0, wv = on(t, hb(241.5) + 3 / 12) ? 0.05 * f : 0;
            const tx = 346, ty = GF - 132, y0 = G0 + sink, hr = [lerp(-0.5, (tx - XP) / RS, outU), lerp(-0.9, (ty - y0) / RS, outU) + wv * 0.4];
            const pose = { mood: 'shock', handR: hr, handL: [0.3, -0.6], shadow: false, tail: dr(t, T_A) < 3 ? -0.5 : 0.6 }; // his tail stands on end, then drops out of sight
            g.save();
            g.beginPath();
            g.rect(-50, -400, 1100, GF + 400);
            g.clip();
            devil(g, XP, y0, pose, t, outU ? { paperR: { ang: -0.16 + wv * 2.4 } } : {});
            g.restore();
            // his tail finds its way out at the other end
            const tu = on(t, hb(241.75)) ? steps(t, hb(241.75), [0.5, 1.1, 1]) : 0, tw = on(t, T_M + 3 / 12) ? 0.05 * f : 0;
            if (tu) P.tail(g, 652, G0 - 4, RS, [[0, -0.1], [0.2 * tu, -0.06], [0.42 * tu, -0.1], [0.6 * tu, -0.32 - tw], [0.56 * tu, -0.62 - tw * 2], [0.68 * tu, -0.86 - tw * 3], [0.82 * tu, -0.98 - tw * 3.4]]);
        }
        // what he sneezed: an ice cube that lands, hops once, skids and melts
        if (on(t, T_CHOO) && t < b(233)) {
            const m0 = devPt(XD, G0, { headTilt: -0.26, lean: -0.1, squash: 0.12 }, [-0.06, Devil.HEAD.top + 0.78], true), a = t - T_CHOO, floor = G0 - 0.1 * RS;
            const vx = -260, vy = -250, T1 = (-vy + Math.sqrt(vy * vy + 2 * GRAV * (floor - m0[1]))) / GRAV, v1 = (vy + GRAV * T1) * 0.36, T2 = (2 * v1) / GRAV;
            let cx, cy, ca;
            if (a < T1) [cx, cy, ca] = [m0[0] + vx * a, m0[1] + vy * a + 0.5 * GRAV * a * a, -a * 9];
            else if (a < T1 + T2) {
                const a2 = a - T1;
                [cx, cy, ca] = [m0[0] + vx * T1 + vx * 0.55 * a2, floor - v1 * a2 + 0.5 * GRAV * a2 * a2, -T1 * 9 - a2 * 5];
            } else {
                const a3 = Math.min(0.3, a - T1 - T2), sl = vx * 0.55 * (a3 - (a3 * a3) / 0.6);
                [cx, cy, ca] = [m0[0] + vx * T1 + vx * 0.55 * T2 + sl, floor, 0];
            }
            const sz = 0.2 * (1 - E.seg(t, b(230), b(232) + 0.2));
            if (a > T1 + T2 && sz < 0.2) P.puddle(g, cx - 0.2 * RS, G0 + 0.02 * RS, RS, 0.2, 0.34 * (1 - E.seg(t, b(232), b(233))), 0.1);
            if (sz > 0.03) P.cube(g, cx, cy + (0.2 - sz) * 0.5 * RS, RS, ca, sz);
            P.sneeze(g, m0[0], m0[1], RS, a);
            if (a >= T1) P.tick(g, m0[0] + vx * T1, floor + 12, 20, a - T1, { n: 5, a0: -Math.PI * 0.9, a1: -Math.PI * 0.1, ink: W.ICE.line });
        }
        // the towel on its way from the chauffeur's mitt to his head
        if (on(t, T_TOSS) && t < T_TOWEL) {
            const p0 = [CH[0] + TOSS_FROM[0] * RS, CH[1] + TOSS_FROM[1] * RS], p1 = [XD, G0 - 1.98 * RS], a = t - T_TOSS, T = T_TOWEL - T_TOSS;
            const vy = (p1[1] - p0[1] - 0.5 * GRAV * T * T) / T;
            P.towelFly(g, lerp(p0[0], p1[0], a / T), p0[1] + vy * a + 0.5 * GRAV * a * a, RS, -0.5 - dr(t, T_TOSS) * 0.9, d % 2);
        }
        // the crank on its way up, and what it finds there
        if (on(t, T_THROW) && t < T_CLONK) {
            const p0 = devPt(XD, G0 - 9, { lean: -0.07, squash: -0.07 }, [-0.5, -1.8]), a = t - T_THROW;
            W.crankArm(g, p0[0] + 70 * a, p0[1] - 2150 * a + 0.5 * GRAV * a * a, RS, -1.6 - a * 26, -1);
        }
        if (on(t, T_CLONK) && dr(t, T_CLONK) < 3) {
            const dd = dr(t, T_CLONK), ff = [0.7, 1, 1.15][dd];
            C.burst(g, 432, 52, { r0: 62 * ff, r1: 112 * ff, n: 11, seed: 'chorus2-clonk', jitter: 0.24, rot: dd * 0.15, fill: dd < 2 ? K.white : K.yellow, ink: K.ink, lw: 4 });
            C.burst(g, 432, 52, { r0: 30 * ff, r1: 60 * ff, n: 9, seed: 'chorus2-clonk2', jitter: 0.24, rot: 0.4 - dd * 0.15, fill: K.yellow, ink: K.ink, lw: 3 });
        }
        if (aS) {
            if (aS.age >= 0) P.thud(g, aL.x, aL.foot + 6, aL.w * 0.9, aS.age, 'star', { seed: 'A', flat: 0.42, dust: false });
            letters(g, t, 'm');
        }

        // --- the front lane ---------------------------------------------------------------------
        letters(g, t, 'f');
        g.restore();
        W.split(g, k, (g2) => {
            World.rain(g2, t, 0.1);
            W.snowfall(g2, t, 0.6);
        }, null);
        g.restore();
    }

    // =========================================================================================
    // Shot 3 · «Runnin' down a dream», bars 61–62: the deck in full sun; the hit; the poster
    // =========================================================================================
    const S3 = 145, Z3 = S3 / SC, CX3 = 556, GY3 = 908, SUN3 = [866, 146, 58], TITLE3 = [452, 196], K3 = 0.73;
    const HIT = b(248), T_TITLE = S.snap(S.TITLES[3][0]);
    function runnin(g, t, env) {
        // the road's clock, moved on so that no tall mesa stands in front of the sun in this shot
        const Pu = S.pulseAt(t), X = Rig.X(t) + 4030, d = C.drawing(t);
        const sh = steps(t, HIT, [[0, 14], [-9, -7], [5, 4], [0, 0]], [0, 0]);
        const hit = bump(t, HIT, 0.3), wl = twos(t, HIT), wm0 = HIT - 4 / 12;
        g.save();
        g.translate(sh[0], sh[1]);
        // the sun takes the hit too
        const sunK = 1 + 0.16 * steps(t, HIT, [1, 0.6, 0.2, 0], 0) + 0.03 * Pu.pulse;
        g.save();
        g.translate(CX3, GY3);
        g.scale(Z3, Z3);
        g.translate(-520, -LANE);
        World.back(g, t, X, 'day', { sun: { x: 520 + (SUN3[0] - CX3) / Z3 + X * 0.004, y: LANE + (SUN3[1] - GY3) / Z3, r: (SUN3[2] / Z3) * sunK } });
        g.restore();
        // the title, all of it on «runnin'» (the three words within four frames), held to the cut
        P1.title(g, t, TITLE3[0], TITLE3[1], { at: [0, 2, 4].map((f) => T_TITLE + f / 24), out: T63 + 1, k: K3 });
        const bn = 0.3 * Pu.pulse + 0.8 * spring(t, HIT, 20, 8), sq = 0.045 * Pu.pulse + 0.12 * hit;
        Rig.band(g, t, CX3, GY3, S3, {
            spin: X / (0.56 * SC), bounce: bn, exhaust: 0.8, tomDrives: false, sing: true, driver: cactus({ ...driving(t), squash: 0.05 * Pu.pulse + 0.1 * hit }), cockpit: top(0),
            pose: {
                tom: { squash: sq, windmill: wl >= wm0 - 1e-6 && wl < HIT - 1e-6 ? -Math.PI / 2 - E.seg(wl, wm0, HIT) * TAU * 0.92 : null },
                mike: { squash: sq }, howie: { squash: sq }, ben: { squash: sq },
                stan: { crash: on(t, HIT) && t < HIT + 0.35 ? 1 - seg2(t, HIT, HIT + 0.35) : 0, squash: 0.03 * Pu.pulse + 0.1 * hit },
            },
        });
        // notes off the instruments, one a beat from each in turn, carried back by the wind;
        // on the hit a fan of them goes up from the whole deck
        const from = [[1.3, -2.35], [0.5, -2.4], [-0.3, -2.45], [-1.1, -2.5]];
        for (let kb = 243; kb <= 251; kb++) {
            for (const [i, lag] of [[kb % 4, 0], [(kb + 2) % 4, 0.5]]) {
                const at = hb(kb + lag), uu = E.seg(twos(t, at), at, at + 0.7);
                if (uu <= 0 || uu >= 1 || (kb === 248 && !lag)) continue;
                const r = Motion.rng('chorus2-note' + kb + i), [fx, fy] = from[i];
                const x = CX3 + fx * S3 - uu * (150 + 90 * r()), y = GY3 + fy * S3 - uu * (110 + 60 * r()) + Math.sin(uu * 8 + kb) * 9;
                C.note(g, x, y, 34 * Math.min(1, uu * 5) * (uu > 0.75 ? (1 - uu) * 4 : 1), { kind: (kb + i) % 3 ? 1 : 2, color: (kb + i) % 2 ? K.white : K.pink, lw: 3, rot: -0.15 - 0.3 * uu });
            }
        }
        if (on(t, HIT)) {
            const a = twos(t, HIT) - HIT + 1 / 24;
            for (let i = 0; i < 6; i++) {
                const r = Motion.rng('chorus2-fan' + i), ang = -Math.PI / 2 + (i - 2.5) * 0.36, v = 520 + 160 * r(), uu = a / 0.55;
                if (uu >= 1) continue;
                const x = CX3 + (-2.6 + i * 0.86) * S3 + Math.cos(ang) * v * a, y = GY3 - 2.55 * S3 + Math.sin(ang) * v * a + 500 * a * a;
                if (y < 400 && Math.abs(x - TITLE3[0]) < 300) continue; // never on the title
                C.note(g, x, y, 40 * Math.min(1, uu * 6) * (uu > 0.7 ? (1 - uu) / 0.3 : 1), { kind: i % 2 ? 1 : 2, color: i % 2 ? K.yellow : K.white, lw: 3, rot: (i - 2.5) * 0.12 });
            }
        }
        g.restore();
    }

    function draw(g, t, env) {
        if (t < T56 - 1e-6) sunshine(g, t, env);
        else if (t < T61 - 1e-6) thaw(g, t, env);
        else runnin(g, t, env);
    }

    Seg.chorus2 = {
        shots: [[T0, T56, 'Sunshine'], [T56, T61, 'The thaw'], [T61, T63, "Runnin' down a dream"]],
        draw,
        post: () => ({}),
    };
})();
