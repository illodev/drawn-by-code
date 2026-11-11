// Chorus 1, bars 25–33 (35.67–48.38 s): the band's performance on the move. The car lands
// from its jump with the whole band playing on the deck, Tom up front singing, and a cactus
// off the verge drops into the empty driver's seat and takes the wheel. Every kick of Stan's
// bass drum throws a shock wave back along the road; the hearse comes back up through the
// asphalt and hunts them from the left edge, the Devil out over the engine with the contract
// on the end of his trident, and every wave shoves it back. On the last bar the band hits
// together and the wave throws the hearse off the back of the frame; the contract is left
// fluttering in the air.
// Props and effects: segments/chorus1-props.js (Chorus1Props).
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, P = Chorus1Props, twos = S.twos, b = S.b, B = S.B, pop = S.pop;
    const T0 = B(25), T27 = B(27), T28 = B(28), T31 = B(31), T32 = B(32), T34 = B(34);
    const n = (k) => b(100 + k); // beat k of the chorus (kicks on the even ones, the snare on the odd)
    const SC = Rig.CAR, LANE = World.LANE, FR = 1 / 24;
    const SKY = { sun: { x: 170, y: 180, r: 70 }, moon: { x: 850, y: 150, r: 38 } };
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const bump = (t, a, dur = 0.3) => E.bump(twos(t, a), a, dur);
    const seg2 = (t, a, c) => E.seg(twos(t, a), a, c); // 0..1 on twos, counted from a
    const ceilF = (s) => Math.ceil(s * 24 - 1e-6) / 24;
    // a spring let go at `a`: 1 at once, a rebound, then rest
    const spring = (t, a, f = 17, damp = 6.5) => (t < a - 1e-6 ? 0 : Math.exp(-(t - a) * damp) * Math.cos((t - a) * f));

    // --- framings ----------------------------------------------------------------------------
    // The world is drawn for the wide shot (the cars at Rig.CAR); a closer framing scales the
    // same layers about the road, so the world runs on across the cuts. f: { s (the cars'
    // scale), x, y (where the wide shot's (520, LANE) is on screen) }
    const WIDE = { s: SC, x: 520, y: LANE };
    const TITLE = [548, 328]; // the title's place in the sky of the wide shots
    function world(g, t, f, pan = 0) {
        const z = f.s / SC;
        g.save();
        g.translate(f.x, f.y);
        g.scale(z, z);
        g.translate(-520, -LANE);
        World.back(g, t, Rig.X(t) + pan, 'day', SKY);
        g.restore();
    }

    // --- the band on its car, with a driver's seat of our own ---------------------------------
    const BR = [-3.55, -0.56]; // the band car's rear axle: its body turns about it
    const KIT_AT = Rides.bandCarSeats().kit, DRUM = [KIT_AT[0] + BandRhythm.KIT.bass.c[0], KIT_AT[1] + BandRhythm.KIT.bass.c[1]];
    // a point of the car's body on screen
    const carPt = (cx, cy, s, bn, lean, p) => {
        const q = rot([p[0] - BR[0], p[1] + 0.1 * bn - BR[1]], -lean);
        return [cx + (q[0] + BR[0]) * s, cy + (q[1] + BR[1]) * s];
    };
    /**
     * o: { bounce, lean, exhaust, pose: { tom, mike, … } overrides, solo,
     *      driver: a pose for the cactus at the wheel, or a function (g2, seats, s) that draws
     *              whatever is coming down into the seat, or null }
     */
    function band(g, t, x, y, s, o = {}) {
        const pz = Rig.playing(t, { sing: true, solo: o.solo ?? 0 }), ov = o.pose ?? {};
        const pose = (who) => ({ ...pz[who], ...(ov[who] ?? {}) });
        Rides.bandCar(g, x, y, s, { spin: Rig.X(t) / (0.56 * SC), bounce: o.bounce ?? 0, lean: o.lean ?? 0, exhaust: o.exhaust ?? 0.6, t }, (g2, seats, sc0) => {
            const put = (p, fn) => Rides.at(g2, sc0, p, fn);
            put(seats.kit, (px, py, sc) => BandRhythm.stan(g2, px, py, sc, pose('stan')));
            put(seats.deck[3], (px, py, sc) => BandStrings.howie(g2, px, py, sc, pose('howie')));
            put(seats.deck[1], (px, py, sc) => BandStrings.mike(g2, px, py, sc, pose('mike')));
            put(seats.deck[2], (px, py, sc) => BandRhythm.benmont(g2, px, py, sc, pose('ben')));
            if (typeof o.driver === 'function') o.driver(g2, seats, sc0);
            else if (o.driver) {
                const w = [seats.wheel[0] - seats.driver[0] - 0.07, seats.wheel[1] - seats.driver[1] + 0.02];
                put(seats.driver, (px, py, sc) => P.cactus(g2, px, py, sc, { wheel: w, ...o.driver }));
            }
            put(seats.deck[0], (px, py, sc) => Cast.tom(g2, px, py, sc, pose('tom')));
        });
    }
    // the cactus at the wheel, keeping the beat
    const driving = (t) => {
        const Pu = S.pulseAt(t);
        return { shades: 1, squash: 0.05 * Pu.pulse, wave: Pu.k % 2 ? Pu.pulse : -Pu.pulse * 0.6 };
    };

    // --- the hearse, the Devil out over its engine --------------------------------------------
    const HR = [-2.5, -0.58]; // its rear axle
    const PERCH = [2.74, -1.66]; // the top of the blower's scoop, where he stands
    const GRIP = 0.25, TLEN = 2.3; // he holds the trident near its butt
    // the tip of the trident's outer tine (the lower one when it is held out), in his units
    const TINE = 0.245;
    const tineTip = (hR, ang, grip = GRIP) => {
        const q = rot([TINE, grip - TLEN - 0.01], ang);
        return [hR[0] - 0.015 + q[0], hR[1] + 0.02 + q[1]];
    };
    // a point of the shaft `u` up from the mitt that holds it
    const onShaft = (hR, ang, u) => {
        const q = rot([0, -u], ang);
        return [hR[0] - 0.015 + q[0], hR[1] + 0.02 + q[1]];
    };
    /**
     * His pose with the trident held out like a rod, the contract spiked on its middle tine.
     *   hit: 0..1, how much the last wave is still on him (1 on contact);  d: the drawing
     *   o: { mood, reach (0..1: 1 = stretched as far as he can) }
     */
    function hunting(t, hit, o = {}) {
        const Pu = S.pulseAt(t), d = C.drawing(t), ph = Pu.k + Pu.since, f = d % 2 ? 1 : -1;
        const blown = hit > 0.45, reach = o.reach ?? 0.6;
        // blown back: his arms go up and the trident is flung over his shoulder
        if (blown) {
            const ang = -0.62 + 0.08 * f;
            return {
                mood: 'shock', look: 1, lean: -0.2, headTilt: -0.08, squash: -0.03, tail: 0.3 * f, step: f,
                handR: [-0.8, -1.05], handL: [0.74, -1.2 + 0.04 * f], trident: { ang, grip: GRIP + 0.3 },
                paper: { ang: 1.35 + 0.2 * f, grip: GRIP + 0.3 }, wind: 1,
            };
        }
        const ang = 1.33 + 0.05 * reach + 0.02 * Math.sin(ph * Math.PI), hR = [-0.26 + 0.14 * reach, -0.72];
        return {
            mood: hit > 0.05 ? 'angry' : o.mood ?? 'grin', look: 1,
            lean: E.lerp(0.06, 0.24 + 0.12 * reach, 1 - hit), headTilt: 0.04, squash: 0.04 * Pu.pulse, tail: 0.05 * Math.sin(ph * Math.PI),
            handR: hR, handL: onShaft(hR, ang, 0.82), trident: { ang, grip: GRIP },
            paper: { ang: 0.1 * Math.sin(ph * Math.PI) + 0.06 * f, grip: GRIP },
        };
    }
    // The Devil at (px, py) with what our poses add: the contract on the tine (pose.paper),
    // his hair in the wind (pose.wind), smoke off him (pose.smoke).
    function devil(g, px, py, sc, pose, t) {
        const L = 3.2 / sc, q = pose.squash ?? 0, d = C.drawing(t);
        P.noShadow(g, () => Devil.draw(g, px, py, sc, pose));
        g.save();
        g.translate(px, py);
        g.scale(sc, sc);
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        if (pose.paper) {
            const hR = pose.handR ?? [-0.74, -0.66], ang = pose.trident.ang, gr = pose.paper.grip ?? GRIP, tip = tineTip(hR, ang, gr);
            const pa = pose.paper.ang - (pose.lean ?? 0), c = rot([0, 0.2], pa); // it hangs from the tine, however he leans
            Devil.contract(g, tip[0] + c[0], tip[1] + c[1], L, { ang: pa, open: 1 });
            // the tine's barb comes through the sheet, near its top
            const at = (p) => {
                const r = rot(p, ang);
                return [hR[0] - 0.015 + r[0], hR[1] + 0.02 + r[1]];
            }, y1 = gr - TLEN;
            C.poly(g, [at([TINE - 0.085, y1 + 0.13]), at([TINE, y1 - 0.01]), at([TINE + 0.085, y1 + 0.13])], { fill: Devil.P.fork, ink: K.ink, lw: L });
        }
        if (pose.wind) {
            g.translate(0, pose.headDy ?? 0);
            g.rotate(pose.headTilt ?? 0);
            P.blownHair(g, L, d, pose.wind);
        }
        g.restore();
        if (pose.smoke) P.smoke(g, px - 0.1 * sc, py - 2.1 * sc, sc, pose.smoke, t, { n: 4, len: 1.9, rise: 0.8, size: 0.26, seed: 1 });
    }
    /**
     * o: { bounce, lean, flames, devil: a pose (see devil) or null, skel: a pose for the chauffeur,
     *      air (true: no shadow under it), rot (the whole car turned about its middle), smoke (0..1) }
     */
    function hearse(g, t, x, y, s, o = {}) {
        const draw = () => Rides.hearse(g, x, y, s, { spin: Rig.X(t) / (0.58 * SC), bounce: o.bounce ?? 0, lean: o.lean ?? 0, flames: o.flames ?? 0.6, t }, (g2, seats, sc0) => {
            if (o.smoke) Rides.at(g2, sc0, [2.3, -1.4], (px, py, sc) => P.smoke(g2, px, py, sc, o.smoke, t, { n: 5, len: 2.6, rise: 1.3, size: 0.34 }));
            if (o.devil) Rides.at(g2, sc0, PERCH, (px, py, sc) => devil(g2, px, py, sc, o.devil, t));
            Rides.at(g2, sc0, seats.chauffeur, (px, py, sc) => Rides.skeleton(g2, px, py, sc, { shadow: false, squash: 0.07, headDy: 0.07, headTilt: 0.1, ...(o.skel ?? {}) }));
        });
        g.save();
        if (o.rot) {
            g.translate(x, y - 1.0 * s);
            g.rotate(o.rot);
            g.translate(-x, -(y - 1.0 * s));
        }
        if (o.air || o.rot) P.noShadow(g, draw);
        else draw();
        g.restore();
    }
    // a point of the hearse's body on screen (no bounce)
    const hearsePt = (hx, hy, s, lean, p) => {
        const q = rot([p[0] - HR[0], p[1] - HR[1]], -lean);
        return [hx + (q[0] + HR[0]) * s, hy + (q[1] + HR[1]) * s];
    };

    // --- the chase's clockwork: kicks, contacts, recoils ---------------------------------------
    // In the wide two-car framing the band's car holds CX and the hearse hangs at the left edge.
    // Each kick's wave leaves the drum at V figure units a second; when its leading edge gets
    // to the contract on the trident (NOSE to the right of the hearse's middle) it shoves it RECOIL back,
    // and the hearse creeps up again to be at the next `base` when the next wave arrives.
    const CX = 790, V = 14, NOSE = 4.6 * SC, RECOIL = 58;
    const drumAt = (cx, bn = 0) => carPt(cx, LANE, SC, bn, 0, DRUM);
    const contactAt = (tk, base) => tk + ceilF(P.waveTime((drumAt(CX)[0] - (base + NOSE)) / SC, V));
    // [kick, the hearse's x when that kick's wave reaches it]
    const HITS = [[n(14), -36], [n(16), -22], [n(18), -6], [n(20), 10], [n(22), 28], [n(28), 42], [n(30), 58], [n(32), 74]].map(([tk, base]) => ({ tk, base, tc: contactAt(tk, base) }));
    const LAST = HITS[HITS.length - 1];
    // the hearse at t: { x, hit (1 on contact, gone in half a second, on twos), since (seconds since the contact) }
    function chase(t, from, x0) {
        let j = -1;
        for (let i = 0; i < HITS.length; i++) if (HITS[i].tk >= from - 1e-6 && t >= HITS[i].tc - 1e-6) j = i;
        const next = HITS.find((h) => h.tk >= from - 1e-6 && t < h.tc - 1e-6);
        if (j < 0) return { x: next ? E.lerp(x0, next.base, E.inOut(E.seg(t, from, next.tc))) : x0, hit: 0, since: -1 };
        const h = HITS[j], back = h.base - RECOIL * E.out(E.seg(t, h.tc, h.tc + 0.22));
        const x = next ? E.lerp(back, next.base, E.inOut(E.seg(t, h.tc + 0.22, next.tc))) : back;
        return { x, hit: 1 - seg2(t, h.tc, h.tc + 0.5), since: t - h.tc, tc: h.tc };
    }
    // every kick's wave in a framing: drum (the head's middle on screen), s, ground
    function waves(g, t, kicks, drum, s, ground, o = {}) {
        for (const tk of kicks) {
            const age = t - tk;
            if (age < -1e-6 || age > 0.7) continue;
            P.wave(g, drum[0], drum[1], s, age, { v: o.v ?? V, k: o.k ?? 1, ground, ...o });
        }
    }

    // =========================================================================================
    // Shot 1 · «Landing», bars 25–26: the car comes down on the chorus's first beat, a cactus
    // off the verge drops into the driver's seat, the title pops in the sky
    // =========================================================================================
    const SEAT = Rides.bandCarSeats().driver;
    function landing(g, t, env) {
        const cx = 520, Pu = S.pulseAt(t), d = C.drawing(t);
        world(g, t, WIDE);
        P.title(g, t, TITLE[0], TITLE[1], { at: [n(4), n(5), n(6)], out: T27 - 8 * FR });
        const bn = spring(t, T0), land = bump(t, T0, 0.3);
        // the cactus: it rides in on the far verge, the landing shakes it out of the ground, and
        // it comes down into the driver's seat on the snare; the shades drop on the next one
        const upAt = T0 + 2 * FR, inAt = n(1), seatAt = [cx + SEAT[0] * SC, LANE + SEAT[1] * SC];
        const verge = [seatAt[0] + 214 - 0.8 * Rig.SPEED * (t - upAt), 786];
        const fu = seg2(t, upAt, inAt), flying = t >= upAt - 1e-6 && t < inAt - 1e-6;
        const fly = [E.lerp(verge[0] + 0.8 * Rig.SPEED * (t - upAt), seatAt[0], fu), E.lerp(786, seatAt[1], fu * fu) - 250 * Math.sin(Math.min(1, fu * 1.25) * Math.PI * 0.8) * (1 - fu * fu * 0.6)];
        const shadesAt = n(3), shU = E.seg(twos(t, shadesAt - 4 / 12), shadesAt - 4 / 12, shadesAt);
        if (t < upAt - 1e-6) P.cactus(g, verge[0], verge[1], SC, {});
        if (flying && fu < 0.5) {
            // the hole it leaves, running off with the verge
            const hx = verge[0], k = E.seg(t, upAt, upAt + 0.3);
            P.puffs(g, [[hx - 10, 776 - 30 * k, 26 * (1 - k), 6, d], [hx + 24, 780 - 18 * k, 20 * (1 - k), 5, d + 1]], P.DUST.fore, 3.2);
            C.poly(g, C.ellipsePts(hx, 788, 26, 7, 14), { fill: '#b9740c', ink: K.ink, lw: 3 });
        }
        const flight = { lean: -0.5 + fu * 0.5 + 0.2 * Math.sin(fu * 9), mouth: 'oh', crumbs: 1 - fu, wave: d % 2 ? 1 : -1 };
        if (flying && fu < 0.5) P.cactus(g, fly[0], fly[1], SC, flight);
        P.landing(g, cx, LANE + 4, SC, t - T0, 'flash');
        const sitting = { ...driving(t), shades: t < shadesAt - 4 / 12 - 1e-6 ? null : shU, squash: 0.05 * Pu.pulse + 0.22 * bump(t, inAt, 0.25), mouth: t < inAt + 0.3 ? 'oh' : 'smile' };
        band(g, t, cx, LANE, SC, {
            bounce: bn + 0.5 * bump(t, inAt, 0.2), exhaust: 0.7,
            pose: { tom: { squash: 0.045 * Pu.pulse + 0.12 * land }, mike: { squash: 0.045 * Pu.pulse + 0.1 * land }, stan: { squash: 0.03 * Pu.pulse + 0.08 * land } },
            driver: t >= inAt - 1e-6 ? sitting : flying && fu >= 0.5 ? (g2, seats, sc0) => Rides.at(g2, sc0, [(fly[0] - cx) / SC, (fly[1] - LANE) / SC], (px, py, sc) => P.cactus(g2, px, py, sc, flight)) : null,
        });
        P.landing(g, cx, LANE + 4, SC, t - T0);
        // the kicks' waves run back along the road
        waves(g, t, [n(2), n(4), n(6)], drumAt(cx, bn), SC, LANE + 6);
        // a twinkle when it takes the wheel, a glint when the shades land
        const flash = (at, dur) => (t < at - 1e-6 ? 0 : Math.sin((0.3 + 0.7 * seg2(t, at, at + dur)) * Math.PI)); // already there on the hit's frame
        const tw = flash(inAt, 0.3), gl = flash(shadesAt, 0.34);
        if (tw > 0) C.sparkle(g, seatAt[0] + 44, seatAt[1] - 150, 12 + 34 * tw, { color: K.white, ink: K.ink, lw: 3 });
        if (gl > 0) C.sparkle(g, seatAt[0] + 16, seatAt[1] - 1.54 * SC, 12 + 36 * gl, { color: K.white, ink: K.ink, lw: 3, rot: 0.2 });
        // the first cactus of the near verge would pass over the drop into the seat and the first wave: it is left out
        if (t > T0 + 1.2) World.front(g, t, Rig.X(t), 'day');
    }

    // =========================================================================================
    // Shot 2 · «Kick», bar 27: close on Stan's kit; the bass drum throws its wave
    // =========================================================================================
    function kick(g, t, env) {
        const s = 300, drum = [560, 660], Pu = S.pulseAt(t);
        // the camera takes each kick: a jolt of two drawings
        const jolt = [n(8), n(10)].map((tk) => [10, -4, 0][Math.min(2, Math.max(0, Math.floor((t - tk) * 12 + 1e-6)))] * (t >= tk - 1e-6 ? 1 : 0)).reduce((a, v) => (v ? v : a), 0);
        g.save();
        g.translate(0, jolt);
        const cx = drum[0] - DRUM[0] * s, gy = drum[1] - DRUM[1] * s;
        world(g, t, { s, x: cx, y: gy });
        band(g, t, cx, gy, s, { bounce: 0.25 * Pu.pulse, driver: driving(t) });
        waves(g, t, [n(8), n(10)], drum, s, gy + 10, { v: 7.5 });
        g.restore();
    }

    // =========================================================================================
    // Shot 3 · «Chase», bars 28–30: the hearse comes up through the road and hunts them; every
    // kick shoves it back. The title again.
    // =========================================================================================
    function chaseShot(g, t, env) {
        const Pu = S.pulseAt(t), d = C.drawing(t), kicks = [14, 16, 18, 20, 22].map(n); // the kick on the cut is left to the mound's entrance
        world(g, t, WIDE);
        P.title(g, t, TITLE[0], TITLE[1], { at: [n(16), n(17), n(18)], out: T31 - 8 * FR });
        const outAt = n(13), landAt = n(14), x0 = HITS[0].base, MX = x0 + 215;
        const drum = drumAt(CX, 0.2 * Pu.pulse);
        // the mound that catches them up, then what is left of it
        const mx = E.lerp(-150, MX, E.out(E.seg(t, T28, outAt - FR)));
        if (t < outAt + 0.3) P.mound(g, mx, LANE + 2, SC, { k: 0.75 + 0.25 * E.seg(t, T28, outAt - 3 * FR), d, fork: E.seg(t, T28 + 2 * FR, T28 + 6 * FR), out: t >= outAt - 1e-6 ? t - outAt : null, speed: Rig.SPEED / SC });
        if (t < outAt - 1e-6) P.smoke(g, mx - 6, LANE - 62, SC, 0.9, t, { n: 4, len: 2.2, rise: 1.3, size: 0.3 });
        band(g, t, CX, LANE, SC, { bounce: 0.2 * Pu.pulse, driver: driving(t) });
        if (t >= outAt - 1e-6) {
            const smoke = 1 - 0.75 * E.seg(t, n(15), n(23));
            if (t < landAt - 1e-6) {
                // out of the ground, nose first, and down onto the road
                const u = E.seg(t, outAt, landAt), y = E.lerp(150, 0, Math.min(1, u * 2.6)) - 120 * Math.sin(Math.PI * u);
                g.save();
                g.beginPath();
                g.rect(-50, -300, 1100, LANE + 6 + 300);
                g.clip();
                hearse(g, t, E.lerp(x0 - 60, x0, u), LANE + y, SC, {
                    rot: -0.4 * Math.pow(1 - u, 1.3), flames: 1, smoke, skel: { jaw: 1, headTilt: -0.15 },
                    devil: { mood: 'shock', look: 1, lean: -0.12, handR: [-0.62, -1.0], handL: [0.7, -1.25], trident: { ang: 0.12, grip: GRIP }, paper: { ang: 0.5 + (d % 2 ? 0.3 : 0) }, tail: d % 2 ? 0.25 : -0.1, step: d % 2 ? 1 : -1, wind: 0.8, smoke },
                });
                g.restore();
            } else {
                const c = chase(t, landAt, x0), rear = 0.17 * E.bump(t, c.tc ?? -9, 0.42);
                hearse(g, t, c.x, LANE, SC, {
                    bounce: spring(t, landAt, 19, 7) + 0.3 * Pu.pulse, lean: rear, flames: 0.5 + 0.5 * (1 - c.hit), smoke,
                    skel: c.hit > 0.45 ? { jaw: 1, headTilt: -0.2, headDy: -0.03, squash: 0 } : { jaw: bump(t, landAt, 0.4) },
                    devil: { ...hunting(t, c.hit, { mood: t < n(15) ? 'angry' : 'grin', reach: E.seg(t, n(15), n(22)) * 0.6 }), smoke },
                });
                if (t < landAt + 0.5) P.landing(g, c.x - 10, LANE + 4, SC * 0.8, (t - landAt) * 1.3, 'dust', 3.0);
            }
            P.eruption(g, MX, LANE, SC, t - outAt, Rig.SPEED / SC);
        }
        waves(g, t, kicks, drum, SC, LANE + 6);
    }

    // =========================================================================================
    // Shot 4 · «Band», bar 31: the deck, closer: everybody at full tilt, the cactus driving
    // =========================================================================================
    function bandShot(g, t, env) {
        const s = 145, cx = 525, gy = 908, Pu = S.pulseAt(t);
        world(g, t, { s, x: cx, y: gy });
        const bn = 0.3 * Pu.pulse;
        band(g, t, cx, gy, s, { bounce: bn, driver: driving(t), exhaust: 0.8 });
        waves(g, t, [n(24), n(26)], carPt(cx, gy, s, bn, 0, DRUM), s, gy + 8, { v: 9 });
        // notes off the instruments, one a beat from each in turn, carried back by the wind
        const from = [[1.3, -2.35], [0.5, -2.4], [-0.3, -2.45], [-1.1, -2.5]]; // over their heads, never on a face
        for (let k = 22; k <= 27; k++) {
            for (const [i, lag] of [[k % 4, 0], [(k + 2) % 4, 0.5]]) {
                const at = b(100 + k) + (lag ? ceilF(S.BEAT * lag) : 0), u = E.seg(twos(t, at), at, at + 0.75);
                if (u <= 0 || u >= 1) continue;
                const r = Motion.rng('chorus1-note' + k + i), [fx, fy] = from[i];
                const x = cx + fx * s - u * (150 + 90 * r()), y = gy + fy * s - u * (120 + 60 * r()) + Math.sin(u * 8 + k) * 9;
                C.note(g, x, y, 34 * Math.min(1, u * 5) * (u > 0.75 ? (1 - u) * 4 : 1), { kind: (k + i) % 3 ? 1 : 2, color: (k + i) % 2 ? K.white : K.yellow, lw: 3, rot: -0.15 - 0.3 * u });
            }
        }
    }

    // =========================================================================================
    // Shot 5 · «Blast», bars 32–33: he is closer than ever; the band hits together and the wave
    // throws the hearse off the back of the frame. The contract stays in the air.
    // =========================================================================================
    function blast(g, t, env) {
        const Pu = S.pulseAt(t), d = C.drawing(t), hitAt = n(32), tc = LAST.tc;
        // after the blast the camera comes back onto the band's car
        const pan = 150 * E.inOut(E.seg(t, tc + 0.1, tc + 1.0)), cx = CX - pan;
        const sh = t >= hitAt - 1e-6 ? [[0, 14], [-9, -7], [5, 4], [0, 0]][Math.min(3, Math.floor((t - hitAt) * 12 + 1e-6))] : [0, 0];
        g.save();
        g.translate(sh[0], sh[1]);
        world(g, t, WIDE, pan);
        const hit = bump(t, hitAt, 0.3), wl = twos(t, hitAt), wm0 = hitAt - 4 / 12;
        const bn = 0.2 * Pu.pulse + 0.8 * spring(t, hitAt, 20, 8), drum = drumAt(cx, bn);
        // the flash behind the kit on the big one
        const fd = Math.floor((t - hitAt) * 12 + 1e-6);
        if (fd >= 0 && fd < 2) C.burst(g, drum[0] + 110, drum[1] - 70, { r0: 170 + 30 * fd, r1: 260 + 50 * fd, n: 15, seed: 'chorus1-hit', rot: fd * 0.12, fill: fd ? K.yellow : K.white, ink: K.ink, lw: 4 });
        band(g, t, cx, LANE, SC, {
            bounce: bn, driver: driving(t),
            pose: {
                tom: { squash: 0.045 * Pu.pulse + 0.12 * hit, windmill: wl >= wm0 - 1e-6 && wl < hitAt - 1e-6 ? -Math.PI / 2 - E.seg(wl, wm0, hitAt) * C.TAU * 0.92 : null },
                mike: { squash: 0.045 * Pu.pulse + 0.12 * hit }, howie: { squash: 0.045 * Pu.pulse + 0.12 * hit }, ben: { squash: 0.045 * Pu.pulse + 0.12 * hit },
                stan: { crash: t >= hitAt - 1e-6 && t < hitAt + 0.35 ? 1 - seg2(t, hitAt, hitAt + 0.35) : 0, squash: 0.03 * Pu.pulse + 0.1 * hit },
            },
        });
        // where the contract is on the tine when the wave gets to it
        const pz = hunting(tc - FR, 0, { mood: 'laugh', reach: 1 });
        if (t < tc - 1e-6) {
            const c = chase(t, T32, HITS[5].base), rear = 0.17 * E.bump(t, c.tc ?? -9, 0.42);
            hearse(g, t, c.x, LANE, SC, {
                bounce: 0.3 * Pu.pulse, lean: rear, flames: 0.6 + 0.4 * (1 - c.hit),
                skel: c.hit > 0.45 ? { jaw: 1, headTilt: -0.2, headDy: -0.03, squash: 0 } : { jaw: t >= n(31) ? 0.5 + 0.5 * (d % 2) : 0 },
                devil: hunting(t, c.hit, { mood: t >= n(31) ? 'laugh' : 'grin', reach: 0.7 + 0.3 * E.seg(t, n(30), n(32)) }),
            });
        } else {
            // thrown: the hearse tumbles back and up, off the left edge
            const a = t - tc, hx = LAST.base - 650 * a - 2300 * a * a, hy = LANE - 760 * a + 1000 * a * a;
            if (hx > -700) hearse(g, t, hx, hy, SC, { rot: -5.2 * a, flames: 0, skel: { jaw: 1, headTilt: -0.25, hands: { l: [0.6, -1.4], r: [-0.6, -1.4] } } });
            // the Devil comes off it, spinning, his trident in his fist
            const p0 = hearsePt(LAST.base, LANE, SC, 0, PERCH), dx = p0[0] - 230 * a - 720 * a * a, dy = p0[1] - 1560 * a + 2350 * a * a;
            if (dx > -260 && a < 1) {
                g.save();
                g.translate(dx, dy - 1.0 * SC);
                g.rotate(-11 * (twos(t, tc) - tc) - 0.5);
                P.noShadow(g, () => Devil.draw(g, 0, 1.0 * SC, SC, { mood: 'shock', look: -1, handR: [-0.78, -1.1], handL: [0.8, -1.2], trident: { ang: -0.2, grip: 0.7 }, tail: d % 2 ? 0.3 : -0.2, step: d % 2 ? 1 : -1 }));
                g.save();
                g.translate(0, 1.0 * SC);
                g.scale(SC, SC);
                P.blownHair(g, 3.2 / SC, d, 0.9);
                g.restore();
                g.restore();
            }
        }
        // the waves: two more shoves, then the big one
        waves(g, t, [n(28), n(30)], drum, SC, LANE + 6);
        waves(g, t, [hitAt], drum, SC, LANE + 6, { k: 1.7 });
        g.restore();
        World.front(g, t, Rig.X(t) + pan, 'day');
        // the contract, alone: whipped up off the tine, then down like a leaf, towards us
        if (t >= tc - 1e-6) {
            const a = t - tc, perch = hearsePt(LAST.base, LANE, SC, 0, PERCH), tip = rot(tineTip(pz.handR, pz.trident.ang), pz.lean);
            const start = [perch[0] + tip[0] * SC, perch[1] + (tip[1] + 0.19) * SC];
            const up = E.out(E.seg(a, 0, 0.42)), fall = E.seg(a, 0.42, 1.6), sw = Math.sin((a - 0.42) * 6.2);
            const x = E.lerp(start[0], 330, up) + (a > 0.42 ? 58 * sw - 60 * fall : 0), y = E.lerp(start[1], 330, up) + 170 * fall - (a > 0.42 ? 24 * Math.abs(sw) : 0);
            const s = E.lerp(SC, 150, up) + 90 * fall;
            const ang = a < 0.42 ? -C.TAU * 1.5 * E.out(E.seg(twos(t, tc) - tc, 0, 0.42)) + 0.2 : 0.2 + 0.5 * Math.sin((twos(t, tc) - tc - 0.42) * 6.2 + 0.6);
            g.save();
            g.translate(x, y);
            g.scale(s, s);
            Devil.contract(g, 0, 0, 3.2 / s, { ang, open: 1 });
            g.restore();
        }
    }

    function draw(g, t, env) {
        if (t < T27 - 1e-6) landing(g, t, env);
        else if (t < T28 - 1e-6) kick(g, t, env);
        else if (t < T31 - 1e-6) chaseShot(g, t, env);
        else if (t < T32 - 1e-6) bandShot(g, t, env);
        else blast(g, t, env);
    }

    Seg.chorus1 = {
        shots: [[T0, T27, 'Landing'], [T27, T28, 'Kick'], [T28, T31, 'Chase'], [T31, T32, 'Band'], [T32, T34, 'Blast']],
        draw,
        post: () => ({}),
        dev: { hearse, hunting, band, devil }, // for the prop sheet (dev/chorus1/props.js)
    };
})();
