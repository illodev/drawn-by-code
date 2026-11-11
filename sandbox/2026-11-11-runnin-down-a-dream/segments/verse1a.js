// «Verse 1 · a beautiful day», first part: bars 12–16 (17.29–24.375 s).
//   bars 12–13  Cruising     a travelling shot: the band plays down the day road, Tom sings to
//                            the sun, notes pour out of the car and stream back over the
//                            speakers; in bar 13 the hearse creeps in behind them through the
//                            music, draws level and overtakes
//   bars 14–16  Hitchhiker   a static roadside shot, closer: the Devil in a paper-thin disguise
//                            holds up RIDE?; the band's car goes by without slowing and its wind
//                            strips the disguise and spins him like a top; the sign comes back
//                            down on his horns with its back showing: RATS!
// Props and the roadside set are in verse1a-props.js (V1A).
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, twos = S.twos, b = S.b, B = S.B, pop = S.pop, TAU = Math.PI * 2;
    const T12 = B(12), T13 = B(13), T14 = B(14), T17 = B(17);
    const bump = (t, a, dur = 0.3) => E.bump(twos(t, a), a, dur);
    const seg = (t, a, c) => E.seg(twos(t, a), a, c);
    const at = (t, a) => t >= a - 1e-6;

    // =========================================================================================
    // Bars 12–13 · Cruising
    // =========================================================================================
    const CX = 560, CAR = 84, FAR = World.LANE - 53; // the band's car; the far lane, where the hearse passes
    // where the notes come out, in the car's units: Tom's guitar, Mike's, the organ
    const SOURCES = [[2.02, -1.52], [1.16, -1.86], [-0.42, -1.74]];
    const NOTE_COLS = [K.white, K.yellow, K.pink];

    // One note: born on its beat at the instrument, it rises over the heads and the wind takes
    // it back over the speakers and out of the left edge, above the hearse's pulpit.
    function note(g, t, born, i, small) {
        if (!at(t, born)) return;
        const life = 1.3, u = (twos(t, born) - born) / life;
        if (u >= 1) return;
        const [sx, sy] = SOURCES[i % 3], x0 = CX + sx * CAR, y0 = World.LANE + sy * CAR;
        const lane = [388, 452, 348, 420][i % 4] + (small ? 30 : 0);
        const x = x0 + 30 * Math.sin(Math.min(1, u * 4.5) * Math.PI) - (x0 + 90) * Math.pow(u, 1.7);
        const y = E.lerp(y0, lane, 1 - Math.pow(1 - Math.min(1, u * 3.6), 2.2)) + 13 * Math.sin(u * 11 + i * 1.7);
        const d = Math.floor((t - born) * 12 + 1e-6), k = pop(t, born, 0.2) * (small ? 0.74 : 1);
        C.note(g, x, y, (20 + 8 * u) * k, { color: NOTE_COLS[i % 3], ink: K.ink, lw: 3, kind: i % 3 === 1 ? 2 : 1, rot: (d % 2 ? 0.16 : -0.12) + 0.1 * Math.sin(i * 2.3) });
    }

    function cruising(g, t) {
        const X = Rig.X(t), P = S.pulseAt(t), k = P.k, ph = (t - b(k)) / S.BEAT; // the beat's phase, smooth: 0 on the beat's own frame
        // the sun nods on the snare
        const nod = k % 2 ? 10 * Math.exp(-P.since * 2.6) : 0;
        World.back(g, t, X, 'day', { sun: { x: 170, y: 180 + nod, r: 70 }, moon: { x: 850, y: 150, r: 38 } });

        // --- bar 13: the hearse, in the far lane behind them. It creeps in through the notes
        // (they are not to his taste), draws level, and with the trident couched like a lance
        // he overtakes: he is out by the right edge on the bar's last beat.
        if (at(t, T13)) {
            const n = (j) => b(52 + j);
            const creep = E.out(E.seg(t, n(0), n(1) + S.BEAT * 0.6)), level = E.inOut(E.seg(t, n(1) + S.BEAT * 0.6, n(3))), go = E.seg(t, n(3), T14);
            const hx = E.lerp(-440, 190, creep) + 290 * level + 1420 * go * go;
            const charge = at(t, n(3)), inMusic = hx < 330 && !charge;
            const couch = E.out(seg(t, n(3) - 2 / 12, n(3) + 1 / 12));
            Rig.hearse(g, t, hx, FAR, CAR, {
                spin: (X + hx) / (0.58 * CAR), bounce: 0.45 * Math.sin((ph + 0.5) * TAU) - 0.3 * go, lean: 0.11 * Math.sin(Math.min(1, go * 2.2) * Math.PI), flames: charge ? 1 : 0.35,
                devil: {
                    mood: charge ? 'laugh' : inMusic ? 'angry' : 'sly', look: 1, headTilt: inMusic ? -0.06 : 0,
                    trident: { ang: 1.3 * couch }, handR: [E.lerp(-0.74, -0.42, couch), E.lerp(-0.66, -0.5, couch)], handL: couch > 0.5 ? [0.45, -0.75] : undefined,
                },
            });
        }

        // --- the band's car: it holds the middle of the frame and bobs once a beat
        const sing = Math.floor((t - T12) * 12 + 1e-6) % 4 < 2;
        Rig.band(g, t, CX, World.LANE, CAR, {
            spin: X / (0.56 * CAR), bounce: 0.55 * Math.sin(ph * TAU), exhaust: 0.45, sing: true,
            pose: { tom: at(t, T12 + 1 / 12) ? { headTilt: sing ? -0.13 : -0.05, mouth: sing ? 'sing' : 'grin' } : {} },
        });

        // --- the notes: one a beat from each instrument in turn, a small one on the off-beat
        // (the first is on the shot's second beat: its first frame is the car alone)
        for (let j = 49; j < 56; j++) {
            note(g, t, b(j), j, false);
            note(g, t, S.snap(S.beat(j - 0.5)), j + 1, true);
        }
        World.front(g, t, X, 'day');
    }

    // =========================================================================================
    // Bars 14–16 · The hitchhiker
    // =========================================================================================
    const V = V1A, SET = V.SET, SC = SET.SC, RW = World.THEMES.day;
    const DX = 548, DY = 694; // the Devil's mark on the far verge
    const CAX = 254, CAY = 684, CAH = 430; // the saguaro behind him: his trident leans on it, and his hearse is «hidden» behind it
    const CBX = 806, CBY = 682, CBH = 318; // the one down the road, which ends up dressed
    const HX = -14, HY = 588, HS = 108; // the hearse, hull down behind the dune: a mesa on its tail, the saguaro on its engine
    const n = (j) => b(56 + j); // beat j of this shot (0–3 bar 14, 4–7 bar 15, 8–11 bar 16)
    const RIP = n(4) + 2 / 24; // the frame the wind takes the disguise
    const HAT_LAND = n(7), SPECS_LAND = n(6), SIGN_FALL = n(9), SIGN_LAND = n(10), LAUGH = n(10) + 3 / 12;
    const HAT_SEAT = [CBX + 2, CBY - CBH + 20], SPECS_SEAT = [CBX + 1, CBY - CBH + 92];
    // a damped swing: 1 at 0, ringing down
    const ring = (tau, freq, damp) => (tau < 0 ? 0 : Math.exp(-tau * damp) * Math.cos(tau * freq));

    // The band's car going through: one beat, eight frames, at this shot's scale.
    function drive(g, t) {
        const f = (t - n(4)) * 24;
        if (f < -1e-6 || f > 8.5) return;
        const cx = -540 + 320 * f, fi = Math.round(f);
        // the air it pushes ahead, and what it drags behind
        V.streaks(g, 'lead' + fi, [cx - 900, SET.LANE - 520, 700, 470], { n: 7, len: [260, 620], th: 9, ink: 0.3 });
        g.save();
        g.translate(cx, SET.LANE);
        g.transform(1, 0, -0.09, 1, 0, 0); // leaning into its speed
        g.translate(-cx, -SET.LANE);
        Rig.band(g, t, cx, SET.LANE, SC, {
            spin: cx / (0.56 * SC) * 0.37, bounce: -0.35, exhaust: 1, sing: true,
            pose: { tom: { headTilt: -0.2, mouth: 'sing', headDy: -0.02 }, mike: { headTilt: -0.08 }, howie: { headTilt: -0.06 }, ben: { headTilt: -0.08 }, stan: { headTilt: -0.06 } },
        });
        g.restore();
        // dust off the back wheel, and speed lines across the tail
        const list = [];
        for (let i = 0; i < 6; i++) list.push([cx - 4.9 * SC - i * 96 - (fi % 2) * 30, SET.LANE - 22 - i * 13 + ((i + fi) % 2) * 9, 30 + i * 13, 6, i * 1.3 + fi * 0.8]);
        V.puffs(g, list, '#e2c08a');
        V.streaks(g, 'trail' + fi, [cx - 5.2 * SC - 260, SET.LANE - 560, 760, 540], { n: 9, len: [300, 760], th: 10, ink: 0.3 });
    }

    function hitchhiker(g, t) {
        const P = S.pulseAt(t), d = C.drawing(t), ph = P.k + P.since, pulse = P.pulse;
        const coming = at(t, n(3)), passed = at(t, n(5)), tauW = twos(t, RIP) - RIP; // seconds since the wind hit
        const gust = at(t, RIP) ? ring(tauW, 10, 3.2) : 0;
        // --- the hearse, badly hidden out behind the dune (a mesa on its tail, a cactus on its
        // engine, both ends showing), the chauffeur keeping low at the wheel
        const laugh = at(t, LAUGH), dl = Math.floor((t - LAUGH) * 12 + 1e-6);
        let up = 0; // 0 down behind the door, 0.5 peeking over it, 1 sitting up
        if (at(t, n(2))) up = 0.5 * pop(t, n(2), 0.2);
        if (coming) up = 0.5 * (1 - E.out(seg(t, n(3), n(3) + 2 / 12)));
        if (passed) up = 0.5 * pop(t, n(5), 0.2);
        if (laugh) up = 0.5 + 0.5 * E.back(seg(t, LAUGH, LAUGH + 3 / 12));
        const duck = (1 - up) * 1.16, shake = laugh && dl % 2 ? 0.04 : 0;
        V.roadside(g, t, {
            nod: P.k % 2 ? 7 * Math.exp(-P.since * 2.6) : 0,
            behindDunes() {
                Rides.hearse(g, HX, HY, HS, { spin: 0.5, flames: 0, t, swing: 0.1 }, (g2, seats, s) => {
                    g2.save();
                    g2.beginPath();
                    g2.rect(-1, -6, 5, 6 - 0.62); // nothing of him shows under the tub
                    g2.clip();
                    Rides.at(g2, s, seats.chauffeur, (px, py, sc) => Rides.skeleton(g2, px, py + (duck + shake) * sc, sc, {
                        jaw: laugh ? (dl % 2 ? 0.5 : 1) : 0, headTilt: laugh ? -0.1 : 0, shadow: false, hands: laugh ? { r: [-0.6, -1.14 - (dl % 2) * 0.1] } : {},
                    }));
                    g2.restore();
                });
                V.mesa(g, -90, SET.HOR + 6, 136, 104, 20);
            },
        });
        // his laugh: ticks off the side of his skull, on twos
        if (laugh) {
            const hx = HX + 1.185 * HS, hy = HY - 1.92 * HS + shake * HS;
            for (const [a, r0] of [[-0.95, 62], [-0.5, 66], [-0.05, 62]]) {
                const r1 = r0 + (dl % 2 ? 24 : 15);
                C.poly(g, [[hx + Math.cos(a) * r0, hy + Math.sin(a) * r0], [hx + Math.cos(a) * r1, hy + Math.sin(a) * r1]], { lw: 3.2, close: false });
            }
        }
        V.bush(g, 162, 584, 62, { seed: 1, sway: 14 * gust + (coming && !passed ? (d % 2 ? 2 : -2) : 0) });
        V.bush(g, 358, 588, 56, { seed: 2, sway: 12 * gust + (coming && !passed ? (d % 2 ? -2 : 2) : 0) });

        // --- the two saguaros: the trident leans on the near one; the wind dresses the other
        V.cactus(g, CAX, CAY, CAH, { bend: 15 * gust });
        V.units(g, CAX + 78, CAY + 10, SC, 0, (L) => Devil.trident(g, 0, 0, L, { ang: -0.115 + 0.03 * gust, len: 2.3, grip: 0 }));
        V.cactus(g, CBX, CBY, CBH, { w: 64, bend: 12 * gust, flower: !at(t, HAT_LAND), arm: { side: 1, off: 1.42, elbow: 0.5, top: 0.66 } });

        // --- the Devil
        const dn = Math.floor((t - n(4)) * 12 + 1e-6); // drawings since the car arrived
        const SPIN = 'bbWWWWFWWWFWWFWFF'; // bar 15, a drawing each: braced, then the top (W) and glimpses of him (F) as it slows
        const disguised = !at(t, RIP), spinning = at(t, RIP) && !at(t, n(8)), signUp = at(t, RIP) && !at(t, SIGN_FALL), signOn = at(t, SIGN_LAND);
        const tauS = twos(t, n(8)) - n(8), tauL = twos(t, SIGN_LAND) - SIGN_LAND;
        const starsOn = at(t, n(8));
        let pose, whirl = null, dxx = 0;
        if (disguised) {
            // bar 14: he checks the road, hoists the sign, beams; then the car is on him
            const hoist = E.back(seg(t, n(1), n(1) + 3 / 12)), thrust = coming ? E.out(seg(t, n(3) + 2 / 12, n(3) + 4 / 12)) : 0;
            const sy = E.lerp(-0.3, -0.54, hoist) - 0.028 * (at(t, n(1)) ? pulse : 0) - 0.04 * thrust;
            const spots = coming && !at(t, n(3) + 3 / 12), braced = at(t, n(4));
            pose = {
                mood: !at(t, n(1)) ? 'sly' : spots ? 'grin' : 'laugh', look: !at(t, n(1)) ? (Math.floor((t - T14) * 12 + 1e-6) % 6 < 3 ? -1 : 1) : -1,
                squash: 0.035 * pulse + 0.09 * bump(t, n(1), 0.25) - 0.03 * thrust, headTilt: at(t, n(1)) && !coming ? 0.05 * Math.sin(ph * Math.PI) : braced ? 0.06 : 0,
                lean: -0.05 * thrust + (braced ? 0.07 : 0), tail: 0.035 * Math.sin(ph * Math.PI * 2) - 0.02, step: coming && !braced ? (d % 2 ? 1 : 0) : 0,
                handR: [-0.5, sy - 0.25], handL: [0.5, sy - 0.25], signY: sy, signAng: E.lerp(0.06, -0.03, hoist) + (braced ? 0.1 : 0),
                hat: braced ? { dy: -0.05, ang: -0.09 } : { sq: 0.1 * bump(t, n(1), 0.25) }, specs: braced ? { ang: -0.05, dy: -0.01 } : {},
            };
        } else if (spinning) {
            const kind = SPIN[Math.min(dn, SPIN.length - 1)], slow = E.seg(dn, 9, 16);
            dxx = 12 * Math.sin(dn * 0.9) * (1 - slow);
            if (kind === 'W' || dn === 1) whirl = { d: dn, k: 1 - slow, lean: 0.07 * Math.sin(dn * 1.3) };
            if (dn === 1) whirl = null;
            pose = {
                mood: 'shock', look: [-1, 1, 0][dn % 3], lean: dn === 1 ? 0.12 : 0.1 * Math.sin(dn * 1.3), squash: dn === 1 ? -0.06 : 0, headTilt: dn === 1 ? 0.1 : -0.06 * Math.sin(dn * 1.3),
                tail: 0.07, step: dn % 2 ? 1 : -1, handR: [-0.92, dn === 1 ? -1.25 : -0.9], handL: [0.92, dn === 1 ? -1.2 : -0.92],
            };
        } else {
            // bar 16: he wobbles to a stop, the sign lands on his horns, he takes it badly
            const wob = 0.15 * ring(tauS, 8.5, 1.5), hit = signOn ? bump(t, SIGN_LAND, 0.3) : 0, sulk = at(t, n(11));
            const bal = Math.max(0, 1 - tauS / 0.7);
            dxx = 46 * wob;
            pose = {
                mood: sulk ? 'angry' : 'shock', look: sulk ? 0 : [-1, 0, 1, 0][d % 4], lean: wob * 0.75, headTilt: -wob * 0.5 + (sulk ? 0.03 * (d % 4 < 2 ? 1 : -1) : 0), headDy: 0.07 * hit,
                squash: 0.13 * hit + (sulk ? 0.02 * pulse : 0), tail: sulk ? -0.05 : 0.03 * Math.sin(tauS * 9), step: wob > 0.04 ? 1 : wob < -0.04 ? -1 : 0,
                handR: [-0.5 - 0.3 * bal, -0.5 - 0.25 * bal - 0.2 * hit], handL: [0.5 + 0.3 * bal, -0.5 - 0.22 * bal - 0.2 * hit],
            };
        }
        const px = DX + dxx;
        // the stars round his head: the far half of the ring goes behind it
        const stars = (front) => {
            if (!starsOn) return;
            const k = pop(t, n(8), 0.25), low = signOn ? 1 : 0, scatter = signOn ? 1 + 0.45 * bump(t, SIGN_LAND, 0.4) : 1;
            V.onHead(g, px, DY, SC, pose, () => {
                for (let i = 0; i < 5; i++) {
                    const a = (twos(t, n(8)) - n(8)) * 5.2 + (i / 5) * TAU, sn = Math.sin(a);
                    if (sn > 0 !== front) continue;
                    const sx = Math.cos(a) * 0.86 * scatter, sy = (low ? -1.74 : -2.12) + sn * 0.2 * scatter + 0.03 * Math.sin(a * 2);
                    g.save();
                    g.scale(1 / SC, 1 / SC);
                    if (i % 2 === 0) V.star(g, sx * SC, sy * SC, (23 + 6 * sn) * k, a * 0.7 + i);
                    else C.sparkle(g, sx * SC, sy * SC, (15 + 4 * sn) * k, { color: K.white, ink: K.ink, lw: 2.6, rot: a * 0.5 });
                    g.restore();
                }
            });
        };
        stars(false);
        if (whirl) {
            V.units(g, px, DY, SC, whirl.lean, (L) => V.whirl(g, L, whirl.d, whirl.k));
        } else {
            Devil.draw(g, px, DY, SC, pose);
            if (spinning) {
                // a glimpse of him as he comes round: rings of speed about him
                V.units(g, px, DY, SC, pose.lean, (L) => {
                    for (const [y, w, a0] of [[-1.95, 0.8, 0.3], [-1.2, 0.86, 1.1], [-0.5, 0.74, 0.2]]) {
                        const aa = a0 + (dn % 3) * 0.5;
                        C.poly(g, Array.from({ length: 12 }, (_, i) => [Math.cos(aa + i * 0.1) * w, y + Math.sin(aa + i * 0.1) * 0.12]), { lw: L, close: false });
                    }
                });
            }
        }
        if (disguised) {
            // what he wears and holds, over him
            V.onHead(g, px, DY, SC, pose, (L) => {
                V.glassesOn(g, L, pose.specs);
                V.hatOn(g, L, pose.hat);
            });
            V.units(g, px, DY, SC, pose.lean, (L) => {
                g.scale(1 + pose.squash, 1 - pose.squash);
                g.save();
                g.translate(0, pose.signY);
                g.rotate(pose.signAng);
                V.sign(g, L, 'front');
                g.restore();
                V.mitt(g, L, -0.5, pose.signY - 0.3 - 0.5 * Math.sin(pose.signAng));
                V.mitt(g, L, 0.5, pose.signY - 0.3 + 0.5 * Math.sin(pose.signAng));
            });
        }
        if (signOn || (at(t, SIGN_FALL) && !signOn)) {
            if (signOn) {
                // on his horns, back to us: they have gone through its lower edge
                V.onHead(g, px, DY, SC, pose, (L) => {
                    const rk = 0.04 + 0.1 * ring(tauL, 17, 5), land = pop(t, SIGN_LAND, 0.2);
                    g.save();
                    g.translate(0.02, -2.18);
                    g.rotate(rk);
                    g.scale(1 + 0.12 * (1 - land) / 0.4, 0.82 + 0.18 * land / 1.0);
                    g.translate(0, -0.3);
                    V.sign(g, L, 'back');
                    // the cardboard splits where each horn came through
                    for (const hx of [-0.47, 0.5]) {
                        C.poly(g, [[hx - 0.09, 0.3], [hx - 0.04, 0.19], [hx, 0.25], [hx + 0.035, 0.17], [hx + 0.09, 0.3]], { lw: L * 0.8, close: false });
                    }
                    g.restore();
                    V.hornsAbove(g, L, -2.2);
                });
                // scraps of cardboard, for a moment
                const u = seg(t, SIGN_LAND, SIGN_LAND + 5 / 12);
                if (u < 1) {
                    [[-0.47, -1.5, 0.5], [-0.47, -0.7, -0.1], [0.5, 1.5, 0.4], [0.5, 0.8, -0.15]].forEach(([hx, vx, vy], i) => {
                        V.units(g, px + (hx + vx * 0.5 * u) * SC, DY + (-2.14 - vy * 0.5 * u + 0.9 * u * u) * SC, SC, 0, (L) => V.chip(g, L, i + u * 5));
                    });
                }
            } else {
                // falling out of the sky, turning over as it comes
                const k = Math.min(4, Math.floor((t - SIGN_FALL) * 12 + 1e-6)), u = [0.08, 0.3, 0.52, 0.74, 0.92][k];
                const face = k < 2 ? 'front' : 'back', sq = [0.9, 0.3, 0.42, 0.8, 1][k], ang = [-0.5, -0.32, 0.3, -0.14, 0.07][k];
                const ty = DY + (-2.48 + pose.headDy * 0) * SC;
                V.units(g, px + E.lerp(-46, 3, u), E.lerp(-70, ty, u * u * 0.6 + u * 0.4), SC, ang, (L) => {
                    g.scale(1, sq);
                    V.sign(g, L, face);
                });
            }
        }
        stars(true);

        // --- what the wind took: the sign straight up and away, the glasses and the hat to the cactus
        if (signUp) {
            // straight up and out of the top, face to us
            const u = (twos(t, RIP) - RIP) / 0.25;
            if (u < 1.01) V.units(g, DX - 26 * u, DY - 0.5 * SC - 840 * u, SC, 0.1 - 1.3 * u, (L) => {
                g.scale(1, 1 - 0.45 * Math.sin(Math.min(1, u) * Math.PI));
                V.sign(g, L, 'front');
            });
        }
        if (at(t, RIP)) {
            // the glasses: a quick, low, spinning hop on to the far cactus
            const ug = Math.min(1, (twos(t, RIP) - RIP) / (SPECS_LAND - RIP)), g0 = [DX, DY - 1.36 * SC];
            const gx = E.lerp(g0[0], SPECS_SEAT[0], 1 - Math.pow(1 - ug, 1.7)), gy = E.lerp(g0[1], SPECS_SEAT[1], ug) - 96 * Math.sin(ug * Math.PI);
            const settle = twos(t, SPECS_LAND) - SPECS_LAND;
            V.units(g, gx, gy, SC, ug < 1 ? -ug * TAU * 2 : 0.07 * ring(settle, 20, 6), (L) => V.glasses(g, L, { arms: ug < 1 ? 'open' : 'worn' }));
            // the hat: up first, then a slow, high tumble that ends on the cactus's top
            const uh = Math.min(1, (twos(t, RIP) - RIP) / (HAT_LAND - RIP)), h0 = [DX, DY - 1.95 * SC];
            const hx = E.lerp(h0[0], HAT_SEAT[0], Math.pow(uh, 1.5)) + 40 * Math.sin(uh * Math.PI), hy = E.lerp(h0[1], HAT_SEAT[1], uh) - 250 * Math.pow(Math.sin(uh * Math.PI), 0.75);
            const hs = twos(t, HAT_LAND) - HAT_LAND;
            V.units(g, hx, hy, SC, uh < 1 ? -0.4 + (0.48 + TAU) * uh : 0.08 + 0.2 * ring(hs, 15, 5), (L) => V.hat(g, L));
        }

        // --- the road in front of it all: the car is heard, then it is through and gone
        if (coming && !at(t, n(4))) {
            const k = seg(t, n(3), n(4)), dc = Math.floor((t - n(3)) * 12 + 1e-6);
            V.streaks(g, 'come' + dc, [-80, SET.LANE - 250, 150 + 330 * k, 290], { n: 6, len: [160, 420], th: 9, ink: 0.35 });
            const list = [];
            for (let i = 0; i < 4; i++) list.push([-30 + 34 * i + 60 * k, SET.LANE - 4 - i * 11 - (dc % 2) * 5, (20 + 50 * k) * (1 - i * 0.16), 6, i * 1.7 + dc * 0.6]);
            V.puffs(g, list, '#e2c08a');
        }
        drive(g, t);
        if (passed) {
            for (const [x, s, t0, seed] of [[230, 0.85, 0.16, 'a'], [600, 0.7, 0.08, 'b'], [940, 0.9, 0, 'c']]) Rides.dust(g, x, SET.LANE + 6, SC * s, 0.2 + 0.8 * E.seg(t, n(5) - t0, n(5) - t0 + 1.0), 'v1a' + seed, t);
            const k = E.seg(t, n(5), n(5) + 0.42);
            if (k < 1) V.streaks(g, 'wake' + Math.floor((t - n(5)) * 12 + 1e-6), [300 + 500 * k, SET.LANE - 480, 800, 440], { n: Math.round(7 * (1 - k)) + 1, len: [200, 480], th: 8, ink: 0.4 });
        }
    }

    Seg.verse1a = {
        shots: [[T12, T14, 'Cruising'], [T14, T17, 'Hitchhiker']],
        draw(g, t, env) {
            if (t < T14 - 1e-6) cruising(g, t);
            else hitchhiker(g, t);
        },
        post() {
            return {};
        },
    };
})();
