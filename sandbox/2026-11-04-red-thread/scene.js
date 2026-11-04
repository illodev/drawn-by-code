// 2026-11-04-red-thread · style sumi-e · «El hilo rojo», animatic (68 s).
// A river village where every greeting ties a red thread; screens and slogans split it into
// two banks, the threads snap and the red drains out of the world, until a child's red kite
// carries one thread back across the river. See brief.md for the shot list.
//
// Files: kite.js (RT: the set and shot 7, the approved style test), cast.js (the figures),
// film.js (Film: world state, people, threads, effects). This file only assembles the shots.
const ANIMATIC = true;      // timecode and shot name in the corner

// built in setup(): the kits in `uses` load after this file
let Shots = null;
const makeShots = () => {
    const E = Ease, S = Sumi, F = Film;
    const hump = F.hump, seg = F.seg;

    // draw a list of poses back to front (by depth), returning what was drawn by id
    function drawPeople(g, poses) {
        const out = {};
        poses.slice().sort((a, b) => a.y - b.y).forEach((p) => (out[p.id] = Cast.figure(g, p)));
        return out;
    }
    const villagerIds = () => Object.keys(F.V);
    const all = (t) => [...villagerIds().map((id) => F.villager(id, t)), F.kid('girl', t), F.kid('boy', t)];
    // where a person's heart is before they are drawn (for reflections)
    const heartOf = (p) => [p.x, p.y - p.h * 0.6];

    // the threads of shots 2–5 (and their reflections)
    function threadState(t, th, drawn) {
        const [a, b, born, slackFrom, snapAt] = th;
        if (born == null || t < born) return null;
        if (snapAt != null && t >= snapAt + 0.9) return null;
        const da = drawn[a], db = drawn[b];
        if (!da || !db) return null;
        const kids = a === 'girl';
        const pa = kids && t < 12.9 ? da.hands[0] : da.heart, pb = kids && t < 12.9 ? db.hands[1] : db.heart;
        const slack = slackFrom != null ? E.inOut(seg(t, slackFrom, slackFrom + 1.2)) * (kids ? 0.5 : 0.85) : 0;
        return { pa, pb, slack, grow: E.out(seg(t, born, born + 0.6)), snapU: snapAt != null && t >= snapAt ? (t - snapAt) / 0.9 : null };
    }
    function drawThreads(g, t, drawn) {
        F.THREADS.forEach((th, i) => {
            const st = threadState(t, th, drawn);
            if (!st) return;
            // a black string from the kuroko lashes the thread just before it snaps
            if (th[4] != null && t > th[4] - 0.35 && t < th[4] + 0.15) {
                const pts = F.threadPts(st.pa, st.pb, st.slack);
                F.kurokoLash(g, t, pts[Math.floor(pts.length / 2)], th[4], i % 2);
            }
            if (st.snapU != null) return F.drawSnap(g, st.pa, st.pb, st.slack, st.snapU, 'snap' + i);
            // a slack thread loses its red: thinner, fainter
            F.drawThread(g, F.threadPts(st.pa, st.pb, st.slack), { grow: st.grow, alpha: 1 - 0.5 * st.slack, w: 2.6 - 1.0 * st.slack, seed: 'th' + i });
            // its shimmer: a brighter bead running along it now and then
            if (st.slack < 0.3 && st.grow >= 1) {
                const pts = F.threadPts(st.pa, st.pb, st.slack), u = (t * 0.45 + i * 0.31) % 1, k = Math.floor(u * (pts.length - 1));
                S.dab(g, pts[k][0], pts[k][1], 3.2, 2.6, { color: S.RED, ink: 0.9, seed: 'bead' + i });
            }
        });
    }
    function threadSpans(t, poses) {
        const byId = Object.fromEntries(poses.map((p) => [p.id, p]));
        return F.THREADS.map((th) => {
            const [a, b, born, slackFrom, snapAt] = th;
            if (born == null || t < born + 0.6 || (snapAt != null && t >= snapAt)) return null;
            return F.threadPts(heartOf(byId[a]), heartOf(byId[b]), slackFrom != null ? E.inOut(seg(t, slackFrom, slackFrom + 1.2)) * 0.85 : 0);
        }).filter(Boolean);
    }

    // slogans: calligraphy running down the kuroko's black strings into every lit screen
    function drawSlogans(g, t, poses) {
        if (t < 16.8 || t > 21.5) return;
        const bars = F.kurokoBars(t);
        poses.forEach((p, j) => {
            if (!p.phone || !(p.glow > 0.5) || !p.phoneAt) return;
            const b = p.x < 1240 ? bars[0] : bars[1];
            for (let k = 0; k < 5; k++) {
                const t0 = 16.9 + k * 0.7 + (j % 3) * 0.21, u = (t - t0) / 1.1;
                if (u <= 0 || u >= 1) continue;
                const q = E.lerpPt([b.x + (p.phoneAt[0] < b.x ? -60 : 60), b.y], p.phoneAt, E.in(u));
                g.save();
                g.globalAlpha *= Math.min(1, u * 6) * (1 - Math.max(0, u - 0.85) / 0.15);
                F.glyph(g, q[0], q[1], 22 - 8 * u, 'sl' + p.id + k);
                g.restore();
            }
        });
    }

    // the shouts of shot 5 (and the two in shot 8): from a mouth, across, into the river
    function drawShouts(g, t, drawn, range) {
        for (const [ts, who, tx, ty] of F.SHOUTS) {
            if (ts < range[0] || ts >= range[1]) continue;
            const d = drawn[who];
            if (!d) continue;
            const u = (t - ts) / 0.7;
            if (u > 0 && u < 1) F.drawShout(g, d.mouth, [tx, ty], u, 'sh' + ts);
            const v = (t - ts - 0.7) / 0.7;
            if (v > 0 && v < 1 && ty > 700) F.drawSplash(g, [tx, ty], v, 'sp' + ts);
        }
    }

    // --- 1 · Title: the painting blooms onto the paper; the title is written; the seal ------
    const REVEAL = [
        [0.2, 1300, 235, 230], [0.7, 700, 520, 760], [0.9, 1950, 540, 820], [1.3, 1500, 470, 380],
        [1.5, 480, 580, 560], [1.7, 2050, 600, 520], [2.0, 1250, 820, 980], [2.3, 380, 900, 700],
        [2.4, 2150, 880, 700], [2.6, 1250, 690, 520], [2.8, 80, 700, 760], [3.1, 380, 220, 700], [3.3, 900, 300, 400],
    ];
    function title(g, env, t, tq, c, w) {
        const world = Motion.layer(env, 'rt-world', (q) => {
            RT.view(q, c, 1);
            F.paintWorld(q, env, t, tq, c, w, { cranesT: tq - 3, figures: (h) => drawPeople(h, all(tq)) });
        });
        const mask = Motion.layer(env, 'rt-mask', (q) => {
            RT.view(q, c, 1);
            q.fillStyle = '#000';
            REVEAL.forEach(([t0, x, y, r], i) => {
                const u = E.out(seg(t, t0 * 1.25, t0 * 1.25 + 1.8));
                if (u <= 0) return;
                const pts = S.blobPts(x, y, r * u, r * u * 0.85, 0, 'rv' + i, 0.22, 36);
                S.fillPoly(q, pts, '#000');
            });
        });
        const wc = world.getContext('2d');
        wc.save();
        wc.setTransform(1, 0, 0, 1, 0, 0);
        wc.globalCompositeOperation = 'destination-in';
        wc.drawImage(mask, 0, 0);
        wc.restore();
        g.save();
        RT.view(g, c, 1);
        S.paper(g, env, { x: -500, y: -300, w: 3300, h: 1650 }, { res: 1.1 });
        g.restore();
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.drawImage(world, 0, 0);
        g.restore();
        // the title, in screen space, written by the brush; it fades as the shot ends
        const fade = 1 - seg(t, 5.4, 6.0);
        // 赤い糸 («the red thread»), written down a column in the empty sky right of the sun;
        // the seal 絆 («bond») beside its foot
        const r = F.writeVertical(g, env, ['赤い糸'], 1330, 70, 112, seg(t, 3.0, 4.6), { alpha: fade });
        F.stamp(g, env, 1330 - 100, r.bottom - 30, 58, '絆', t, 5.0, { alpha: fade });
    }

    // --- 2–5 · The village (one function, one timeline; the camera tells the shots apart) ---
    function village(g, env, t, tq, c, w, o = {}) {
        const poses = all(tq);
        let drawn = {};
        F.paintWorld(g, env, t, tq, c, w, {
            cranesT: t < 18 ? tq - 3 : null,
            figures: (h) => {
                drawn = drawPeople(h, poses);
                drawThreads(h, tq, drawn);
                F.kurokoStrings(h, tq, poses, drawn);
                drawSlogans(h, tq, poses);
                F.drawMaskFlights(h, tq, drawn, poses);
                F.drawMasks(h, tq, drawn);
                drawShouts(h, tq, drawn, [26, 32]);
                // the planks hitting the river
                if (w.bridge.mode === 'intact' && w.bridge.fall > 0) {
                    RT.PLANK_SPLASH.forEach(([x, dt], i) => {
                        const v = ((t - 30.4) - dt) / 0.7;
                        if (v > 0 && v < 1) F.drawSplash(h, [x, 726], v, 'pk' + i, 1.3);
                    });
                }
            },
            after: (h) => {
                if (t >= 26 && t < 32) F.shedPetals(h, t, 26.2, 31, 40, 'shed');
            },
        });
    }
    const keysCloud = (t) => RT.spline([[18.5, 0], [22.5, 1], [31.5, 1], [32, 0]], t);

    // --- 6 · Grey: everyone has gone; ink rain; the girl's kite is the only red ---------------
    function grey(g, env, t, tq, c, w) {
        const tl = tq - 36;                        // the kite shot's clock, before it starts
        const gp = RT.girlPose(0), bp = RT.boyPose(0);
        gp.t = tq;
        bp.t = tq;
        bp.glow = 1;
        // it tugs in the wind, settling into the kite shot's first position at 36 s
        const k = RT.kiteAt(0), nz = 1 - E.inOut(seg(t, 34.8, 36)), kite = { x: k.x + Motion.noise1('gk', t * 1.2) * 18 * nz, y: k.y + Motion.noise1('gky', t * 1.5) * 14 * nz, rot: k.rot + Motion.noise1('gkr', t * 2) * 0.15 * nz };
        F.paintWorld(g, env, t, tq, c, w, {
            overcast: RT.spline([[32, 1], [34.5, 1], [36, 0]], t),
            cranesT: tq - 36,
            figures: (h) => {
                const gd = Cast.figure(h, gp);
                Cast.figure(h, bp);
                const kk = [kite.x - 8 * Math.sin(kite.rot), kite.y + 8 * Math.cos(kite.rot)];
                F.drawThread(h, RT.sag(gd.hands[0], kk, 75), { w: 2.6, seed: 'gstr' });
                RT.kite(h, env, tq, kite);
            },
            after: (h) => F.drawRain(h, c, w.rain, t),
        });
    }

    // --- 7 · The kite (the approved style test, on the film's clock) ---------------------------
    function kiteShot(g, env, t, tq, c, w) {
        const tl = t - 36, tlq = tq - 36;
        const gp = RT.girlPose(tlq), bp = RT.boyPose(tlq);
        F.paintWorld(g, env, t, tq, c, w, {
            cranesT: tlq,
            spans: [RT.spanFor(tlq, gp, bp)].filter(Boolean),
            figures: (h) => {
                const gd = Cast.figure(h, gp), bd = Cast.figure(h, bp);
                RT.string(h, env, tlq, gd, bd);
                RT.kite(h, env, tlq);
                RT.wind(h, env, tl);
            },
            after: (h) => RT.petals(h, env, tlq),
        });
    }

    // --- 8–11 · After the catch: the thread across the river --------------------------------
    // the children: holding the thread, then walking out to the bridge and onto it
    const KID_PATH = {
        girl: [[43, 628, 760], [55, 628, 760], [56.2, 800, 700], [57.0, 960, 'deck'], [59.3, 975, 'deck'], [61.0, 1232, 'rope'], [68, 1232, 'rope']],
        boy: [[43, 1901, 790], [55, 1901, 790], [56.2, 1720, 700], [57.0, 1555, 'deck'], [59.3, 1535, 'deck'], [61.0, 1278, 'rope'], [68, 1278, 'rope']],
    };
    function kidAfter(id, t, toward) {
        const keys = KID_PATH[id].map(([tt, x, y]) => [tt, x, y === 'deck' ? F.DECK(x) : y === 'rope' ? F.ropeY(x) - 2 : y]);
        let i = 0;
        while (i < keys.length - 2 && t >= keys[i + 1][0]) i++;
        const [ta, xa, ya] = keys[i], [tb, xb, yb] = keys[i + 1];
        const u = Math.max(0, Math.min(1, (t - ta) / (tb - ta)));
        const x = xa + (xb - xa) * u, y = ya + (yb - ya) * u, moving = u > 0 && u < 1 && Math.abs(xb - xa) > 1;
        const base = id === 'girl' ? 175 : 185, h = base * F.hAt(y), face = id === 'girl' ? 1 : -1;
        const f = { x, y, h, face, kind: id, id, t, lean: 0.05, look: 0.15 };
        if (moving) {
            // the same walk as everyone's (feet from the distance walked)
            const dist = Math.abs(x - xa) + keys.slice(0, i).reduce((s, k, j) => s + Math.hypot(keys[j + 1][1] - k[1], keys[j + 1][2] - k[2]), 0);
            const cyc = dist / (base * 0.5), stride = h * 0.2;
            f.feet = [0, 0.5].map((ph) => {
                const cc = (((cyc + ph) % 1) + 1) % 1;
                const off = cc < 0.5 ? stride * (0.5 - 2 * cc) : stride * (-0.5 + 2 * (cc - 0.5));
                return [x + face * off, y - (cc < 0.5 ? 0 : Math.sin(Math.PI * 2 * (cc - 0.5)) * h * 0.035)];
            });
        }
        const sh = [x + face * h * 0.02, y - h * 0.73];
        const a = Math.atan2(toward[1] - sh[1], toward[0] - sh[0]);
        f.hands = [[sh[0] + Math.cos(a) * h * 0.26, sh[1] + Math.sin(a) * h * 0.26], [x - face * h * 0.02, y - h * 0.42]];
        return f;
    }
    function blendPose(a, b, u) {
        const L = (x, y) => (typeof x === 'number' && typeof y === 'number' ? x + (y - x) * u : u < 0.5 ? x : y);
        const P = (p, q) => (p && q ? E.lerpPt(p, q, u) : q ?? p);
        const out = { ...b };
        for (const key of ['x', 'y', 'h', 'lean', 'look', 'sit', 'seatY', 'wind']) if (key in a || key in b) out[key] = L(a[key] ?? 0, b[key] ?? 0);
        out.feet = a.feet && b.feet ? a.feet.map((p, i) => P(p, b.feet[i])) : b.feet;
        out.hands = a.hands && b.hands ? a.hands.map((p, i) => P(p, b.hands[i])) : b.hands;
        return out;
    }
    function kiteAfter(t, boyHand) {
        const k = RT.kiteAt(7);
        const base = t < 57 ? [k.x, k.y] : E.lerpPt([k.x, k.y], [boyHand[0] - 300, boyHand[1] - 330], E.inOut(seg(t, 57, 60)));
        const nz = E.inOut(seg(t, 43, 44.5)), k7 = RT.kiteAt(7);
        return { x: base[0] + Motion.noise1('ak', t * 1.1) * 16 * nz, y: base[1] + Motion.noise1('aky', t * 1.4) * 12 * nz, rot: k7.rot + (0.25 + Motion.noise1('akr', t * 1.9) * 0.2 - k7.rot) * nz };
    }

    // the rope bridge the threads weave (shots 10–11): deck strands, two handrails, hangers
    function ropeLines() {
        const line = (dy, sag, n = 24) => Array.from({ length: n + 1 }, (_, i) => {
            const x = F.ROPE.x0 + ((F.ROPE.x1 - F.ROPE.x0) * i) / n;
            return [x, F.ROPE.y + dy + sag * Math.sin(Math.PI * i / n)];
        });
        return [line(-2, 26), line(2, 26), line(5, 26), line(-40, 18), line(-36, 18)];
    }
    const resample = (pts, n = 24) => Array.from({ length: n + 1 }, (_, i) => {
        const f = (i / n) * (pts.length - 1), k = Math.min(pts.length - 2, Math.floor(f));
        return E.lerpPt(pts[k], pts[k + 1], f - k);
    });

    function after(g, env, t, tq, c, w) {
        const girlT = tq, boyT = tq;
        // first where the hands will be (the thread is drawn after the figures)
        let girlHand = [700, 640], boyHand = [1860, 650];
        const kite = kiteAfter(tq, boyHand);
        let boy = kidAfter('boy', boyT, [700, 640]);
        let girl = kidAfter('girl', girlT, [boy.x, boy.y - boy.h * 0.7]);
        // no cut at 43 s: the children ease out of the kite shot's last pose
        const bl = E.inOut(seg(tq, 43, 43.8));
        if (bl < 1) {
            girl = blendPose(RT.girlPose(7), girl, bl);
            boy = blendPose(RT.boyPose(7), boy, bl);
        }
        // the boy's phone stays on the ground where it fell, its light gone
        const ph = RT.boyPose(7);
        boy.phone = 1;
        boy.phoneAt = ph.phoneAt;
        boy.phoneRot = ph.phoneRot;
        boy.glow = ph.glow * (1 - seg(tq, 43, 45));
        boy.hands[0] = boy.hands[0];
        // the man who grabs the thread (shot 8) and the elders who lay a hand on it
        const pullL = hump(seg(tq, 44.6, 46.6)), pullR = hump(seg(tq, 48.0, 49.4));
        const villagers = Object.keys(F.V).map((id) => F.villager(id, tq));
        const byId = Object.fromEntries(villagers.map((v) => [v.id, v]));
        const holdOld = (id, t0, t1) => E.inOut(seg(tq, t0, t0 + 0.4)) * (1 - seg(tq, t1, t1 + 0.5));
        const oldWHold = holdOld('oldW', 46.0, 55.0), oldMHold = holdOld('oldM', 48.8, 55.0);
        // main thread through the hands (and through a grabbing hand while pulled)
        const mainPts = (gh, bh) => {
            if (pullL > 0.01) {
                const p = [gh[0] + 70, gh[1] + 30 * pullL + 6];
                return [...RT.sag(gh, p, 4), ...RT.sag(p, bh, 40).slice(1)];
            }
            if (pullR > 0.01) {
                const p = [bh[0] - 70, bh[1] + 30 * pullR + 6];
                return [...RT.sag(gh, p, 40), ...RT.sag(p, bh, 4).slice(1)];
            }
            return RT.sag(gh, bh, tq < 57 ? 40 + Math.sin(tq * 2.1) * 5 : 30);
        };
        const pointAt = (pts, x) => {
            for (let i = 1; i < pts.length; i++) if ((pts[i][0] - x) * (pts[i - 1][0] - x) <= 0) return E.lerpPt(pts[i - 1], pts[i], (x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0] || 1));
            return pts[0];
        };
        const guess = mainPts([girl.x + 60, girl.y - girl.h * 0.85], [boy.x - 60, boy.y - boy.h * 0.85]);
        if (pullL > 0.01) byId.kasaL.hands = [pointAt(guess, girl.x + 130), byId.kasaL.hands?.[1] ?? [byId.kasaL.x, byId.kasaL.y - 100]];
        if (pullR > 0.01) byId.kasaR.hands = [pointAt(guess, boy.x - 130), byId.kasaR.hands?.[1] ?? [byId.kasaR.x, byId.kasaR.y - 100]];
        if (pullL > 0.01) girl.lean = -0.15 * pullL;
        if (pullR > 0.01) boy.lean = -0.15 * pullR;
        if (oldWHold > 0) byId.oldW.hands = [E.lerpPt([byId.oldW.x + 30, byId.oldW.y - 90], pointAt(guess, girl.x + 95), oldWHold), byId.oldW.hands?.[1] ?? [byId.oldW.x, byId.oldW.y - 90]];
        if (oldMHold > 0) byId.oldM.hands = [E.lerpPt([byId.oldM.x - 30, byId.oldM.y - 90], pointAt(guess, boy.x - 95), oldMHold), byId.oldM.hands?.[1] ?? [byId.oldM.x, byId.oldM.y - 90]];

        // the children meet in the middle of the rope bridge and take each other's hands
        const meet = E.inOut(seg(tq, 61.0, 61.5));
        if (meet > 0) {
            const m = [(girl.x + boy.x) / 2, girl.y - girl.h * 0.45];
            girl.hands[1] = E.lerpPt(girl.hands[1], m, meet);
            boy.hands[1] = E.lerpPt(boy.hands[1], m, meet);
        }
        const poses = [...villagers, girl, boy];
        const spansGuess = [guess];
        let drawn = {};
        const ropeU = E.inOut(seg(tq, 57.3, 59.3));
        F.paintWorld(g, env, t, tq, c, w, {
            cranesT: tq >= 62 ? tq - 61 : null,
            spans: ropeU > 0.5 ? [] : spansGuess,
            figures: (h) => {
                // the rope bridge first: the children walk on it
                if (ropeU > 0) drawRope(h, ropeU, tq);
                drawn = drawPeople(h, poses);
                F.drawMasks(h, tq, drawn);
                F.kurokoStrings(h, tq, poses, drawn);
                const gh = drawn.girl.hands[0], bh = drawn.boy.hands[0];
                const main = mainPts(gh, bh);
                // the threads that come back to everyone (shot 9), and across the river again
                const extra = [];
                for (const [id, [, drop]] of Object.entries(F.PHONE)) {
                    const born = drop + 0.3;
                    if (tq < born) continue;
                    const d = drawn[id];
                    const left = ['womanL', 'kasaL', 'manL2'].includes(id);
                    const from = pointAt(main, left ? gh[0] + 160 : bh[0] - 160);
                    extra.push({ pts: RT.sag(from, d.heart, 30), grow: E.out(seg(tq, born, born + 0.7)), seed: 'br' + id, fade: 1 - seg(tq, 54.5, 55.5) });
                }
                F.THREADS.forEach(([a, b, , , , reborn], i) => {
                    if (reborn == null || tq < reborn) return;
                    extra.push({ pts: F.threadPts(drawn[a].heart, drawn[b].heart, 0), grow: E.out(seg(tq, reborn, reborn + 0.7)), seed: 'rb' + i });
                });
                // weaving: every thread moves onto the rope bridge's lines
                const lines = ropeLines();
                if (ropeU < 1) {
                    extra.forEach((e, i) => {
                        const pts = ropeU > 0 ? resample(e.pts).map((p, k) => E.lerpPt(p, resample(lines[i % lines.length])[k], ropeU)) : e.pts;
                        F.drawThread(h, pts, { grow: e.grow, alpha: (e.fade ?? 1) * (1 - ropeU * 0.999), seed: e.seed });
                    });
                }
                // the main thread, with a pulse of red running out from the children's hands
                F.drawThread(h, ropeU > 0 && tq > 59.3 ? resample(lines[0]) : main, { w: 2.8, seed: 'main' });
                if (tq >= 50 && tq < 57) {
                    for (let k = 0; k < 2; k++) {
                        const u = ((tq - 50) * 0.7 + k * 0.5) % 1;
                        for (const side of [0, 1]) {
                            const idx = Math.floor((side ? 1 - u * 0.5 : u * 0.5) * (main.length - 1));
                            S.dab(h, main[idx][0], main[idx][1], 4.5, 3.5, { color: S.RED, seed: 'pulse' + k + side });
                        }
                    }
                }
                // the kite on the boy's string
                const ka = [kite.x - 8 * Math.sin(kite.rot), kite.y + 8 * Math.cos(kite.rot)];
                F.drawThread(h, RT.sag(bh, ka, 22), { w: 2.2, seed: 'kstr' });
                RT.kite(h, env, tq, kite);
                // a red glow where the old hands hold the thread
                for (const [id, v] of [['oldW', oldWHold], ['oldM', oldMHold]]) {
                    if (v > 0.6) S.dab(h, drawn[id].hands[0][0], drawn[id].hands[0][1], 6, 5, { color: S.RED, ink: 0.7 + 0.3 * Math.sin(tq * 6), seed: 'glow' + id });
                }
                drawShouts(h, tq, drawn, [43, 50]);
            },
            after: (h) => {
                if (tq >= 50) F.floatingPetals(h, t, Math.round(30 * seg(tq, 52, 60)), 'float');
                if (tq >= 62) F.shedPetals(h, t, 62, 68, 30, 'endshed');
            },
        });
    }
    // 11 · the closing line and the seal, in screen space
    function endText(g, env, t) {
        // «Before we split into friend and foe, we were neighbours», in two columns in the sky
        // right of the sun (the user's line: «Antes de ser bandos, fuimos vecinos»); the seal
        // under the last column
        const r = F.writeVertical(g, env, ['敵味方に分かれる前、', '私たちは隣人だった。'], 1470, 36, 40, seg(t, 62.8, 65.6), { gap: 58 });
        F.stamp(g, env, r.left - 62, r.bottom - 26, 44, '絆', t, 66.0);
    }
    function drawRope(g, u, t) {
        const lines = ropeLines();
        // hangers between the handrails and the deck, appearing as the weave closes
        const hu = seg(t, 59.0, 59.8);
        if (hu > 0) {
            for (let i = 1; i < 12; i++) {
                const k = Math.round((i / 12) * 24), a = lines[3][k], b = lines[0][k];
                F.drawThread(g, [a, E.lerpPt(a, b, hu)], { w: 1.6, seed: 'hg' + i });
            }
        }
        if (u >= 1) lines.forEach((l, i) => F.drawThread(g, l, { w: i < 3 ? 2.6 : 2.2, seed: 'rope' + i }));
    }

    return { title, village, grey, kiteShot, after, endText };
};

// one shot, full frame, on its own camera (also outside its own time, for transitions)
function drawShot(k, g, t, env) {
    const tq = RT.twos(t), c = Film.camAt(t, k), w = Film.worldAt(t);
    if (k === 0) return Shots.title(g, env, t, tq, c, w);
    g.save();
    RT.view(g, c, 1);
    if (k >= 1 && k <= 4) Shots.village(g, env, t, tq, c, w);
    else if (k === 5) Shots.grey(g, env, t, tq, c, w);
    else if (k === 6) Shots.kiteShot(g, env, t, tq, c, w);
    else Shots.after(g, env, t, tq, c, w);
    g.restore();
    if (k === 10) Shots.endText(g, env, t);
}

// Ink-blot transitions (the user: «con mancha de tinta china en el papel, no tan brusca»).
// Each cut gets a point where the drop lands (on what the next shot is about), in screen units.
const INK_HALF = 0.6;
// Between the two acts (adults → children) the painting goes back to blank paper and the
// next one blooms onto it, as in the title (the user preferred it to an ink blot). The
// erase takes the foreground first; the reveal paints the sky first, then the land.
const ACT = { erase: [30.9, 32.0], reveal: [32.0, 34.2] };
const ERASE = [
    [0.0, 400, 880, 760], [0.05, 2100, 860, 760], [0.15, 1250, 800, 900], [0.25, 100, 500, 700], [0.3, 1250, 600, 600],
    [0.4, 600, 520, 700], [0.45, 1900, 520, 760], [0.5, 1350, 300, 650], [0.55, 500, 150, 700], [0.6, 2100, 160, 700],
];
const BLOOM = [
    [0.0, 1300, 235, 230], [0.15, 700, 520, 760], [0.25, 1950, 540, 820], [0.4, 1500, 470, 380],
    [0.5, 480, 580, 560], [0.6, 2050, 600, 520], [0.75, 1250, 820, 980], [0.9, 380, 900, 700],
    [0.95, 2150, 880, 700], [1.05, 1250, 690, 520], [1.15, 80, 700, 760], [1.3, 380, 220, 700], [1.4, 900, 300, 400],
];
// blots in world units, each growing from its own start time over `grow` seconds
function bloomMask(env, name, c, list, tl, grow) {
    return Motion.layer(env, name, (q) => {
        RT.view(q, c, 1);
        list.forEach(([t0, x, y, r], i) => {
            const u = Ease.out(Ease.seg(tl, t0, t0 + grow));
            if (u <= 0) return;
            Sumi.fillPoly(q, Sumi.blobPts(x, y, r * u, r * u * 0.85, 0, name + i, 0.22, 36), '#000');
        });
    });
}
function actChange(g, env, t) {
    const out = t < ACT.erase[1], k = out ? 4 : 5, c = Film.camAt(t, k);
    const L = Motion.layer(env, 'act-shot', (q) => drawShot(k, q, t, env));
    const M = out ? bloomMask(env, 'act-erase', c, ERASE.map(([t0, ...v]) => [t0 * 1.4, ...v]), t - ACT.erase[0], 0.6) : bloomMask(env, 'act-bloom', c, BLOOM, t - ACT.reveal[0], 0.8);
    const lc = L.getContext('2d');
    lc.save();
    lc.setTransform(1, 0, 0, 1, 0, 0);
    lc.globalCompositeOperation = out ? 'destination-out' : 'destination-in';
    lc.drawImage(M, 0, 0);
    lc.restore();
    g.save();
    RT.view(g, c, 1);
    Sumi.paper(g, env, { x: -500, y: -300, w: 3300, h: 1650 }, { res: 1.1 });
    g.restore();
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(L, 0, 0);
    g.restore();
}

// (Not used since round 8: the ink-blot transition, kept as a recipe.) One stain only, between the two acts: from the adults' quarrel to the girl alone in the
// rain (the user: the rest is the same place and the same people, so the camera travels).
const INK_CUTS = [{ t: 32, x: 800, y: 640 }];
function inkBlot(g, env, u, A, B, T) {
    const E = Ease, S = Sumi, k = env.k;
    // the stain: a main blot and satellites that bleed out of it and merge, with ragged edges
    const blobs = [];
    const R = 1250;
    const grow = (a, b) => E.inOut(Math.max(0, Math.min(1, (u - a) / (b - a))));
    blobs.push([T.x, T.y, R * grow(0, 0.85), 0.24]);
    const r = Motion.rng('blot' + T.t);
    for (let i = 0; i < 6; i++) {
        const a = r() * Math.PI * 2, d = 140 + r() * 260, t0 = 0.05 + r() * 0.25;
        blobs.push([T.x + Math.cos(a) * d, T.y + Math.sin(a) * d * 0.7, R * 0.55 * grow(t0, t0 + 0.7), 0.3]);
    }
    // outline: broad lobes (low-frequency noise around the angle) and a feathered edge where
    // the ink runs into the paper's fibres (high frequency, small)
    const blob = (x, y, rad, key) => {
        const n = 180, pts = [];
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            const ca = Math.cos(a), sa = Math.sin(a);
            const lobe = 0.16 * Motion.noise1(key + 'l', (a / (Math.PI * 2)) * 6 + 0.5) + 0.07 * Motion.noise1(key + 'm', (a / (Math.PI * 2)) * 15);
            const fib = 0.025 * Motion.noise1(key + 'f', i * 1.7) * Math.min(1, rad / 200);
            const rr = rad * (1 + lobe + fib);
            pts.push([x + ca * rr, y + sa * rr * 0.88]);
        }
        return pts;
    };
    const shapes = blobs.filter((b) => b[2] > 1).map(([x, y, rad], i) => blob(x, y, rad, 'bl' + T.t + i));
    const M = Motion.layer(env, 'tr-m', (q) => shapes.forEach((p) => S.fillPoly(q, p, '#000')));
    // the incoming shot inside the stain
    const bc = B.getContext('2d');
    bc.save();
    bc.setTransform(1, 0, 0, 1, 0, 0);
    bc.globalCompositeOperation = 'destination-in';
    bc.drawImage(M, 0, 0);
    bc.restore();
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(A, 0, 0);
    g.drawImage(B, 0, 0);
    // the ink itself: black where the drop has just landed, thinning to nothing; the wet
    // edge stays darker while it spreads (pigment collects at a drying front)
    // (kept light and slow enough that no frame changes the overall brightness by 10 %)
    const ink = 0.48 * Math.sin(Math.PI * Math.max(0, Math.min(1, u / 0.85)));
    if (ink > 0.01) {
        // denser where the drop landed, diluted towards the spreading edge
        const I = Motion.layer(env, 'tr-i', (q) => {
            q.save();
            q.setTransform(1, 0, 0, 1, 0, 0);
            const cx = T.x * k, cy = T.y * k, rr = 1100 * k;
            const gr = q.createRadialGradient(cx, cy, 0, cx, cy, rr);
            gr.addColorStop(0, 'rgba(18,15,12,1)');
            gr.addColorStop(0.35, 'rgba(23,19,15,0.85)');
            gr.addColorStop(1, 'rgba(23,19,15,0.55)');
            q.fillStyle = gr;
            q.fillRect(0, 0, env.px[0], env.px[1]);
            q.globalCompositeOperation = 'destination-in';
            q.drawImage(M, 0, 0);
            q.restore();
        });
        g.globalAlpha = Math.min(1, ink * 1.1);
        g.drawImage(I, 0, 0);
    }
    g.restore();
    // the wet rim: a band just inside the stain's edge (the mask minus a blurred copy of it)
    const rim = 1 - E.in(Math.max(0, Math.min(1, (u - 0.3) / 0.65)));
    if (rim > 0.01) {
        const Rm = Motion.layer(env, 'tr-r', (q) => {
            q.save();
            q.setTransform(1, 0, 0, 1, 0, 0);
            q.drawImage(M, 0, 0);
            q.globalCompositeOperation = 'destination-out';
            q.filter = `blur(${(9 * k).toFixed(1)}px)`;
            q.drawImage(M, 0, 0);
            q.filter = 'none';
            q.restore();
        });
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalAlpha = 0.75 * rim;
        g.drawImage(Rm, 0, 0);
        g.restore();
    }
    g.save();
    // the drop's splatter around where it landed
    if (u < 0.45) {
        for (let i = 0; i < 14; i++) {
            const a = r() * Math.PI * 2, d = 60 + r() * 220, s = 3 + r() * 9;
            S.dab(g, T.x + Math.cos(a) * d * (0.6 + u), T.y + Math.sin(a) * d * (0.6 + u), s, s * 0.8, { seed: 'spl' + T.t + i, ink: 0.9 * (1 - u / 0.45) });
        }
    }
    g.restore();
}

Motion.scene({
    fps: 24,
    duration: 68,
    logical: [1600, 900],
    uses: ['styles/sumi-e/sumi.js', 'sandbox/2026-11-04-red-thread/cast.js', 'sandbox/2026-11-04-red-thread/kite.js', 'sandbox/2026-11-04-red-thread/film.js'],
    fonts: [{ family: 'Brush', src: 'fonts/YujiSyuku-subset.ttf' }, { family: 'Kaushan', src: 'fonts/KaushanScript-Regular.ttf' }],
    bpm: 60,
    shots: [
        [0, 6, '1 · Title'], [6, 12, '2 · The bridge'], [12, 18, '3 · Screens'], [18, 26, '4 · Two banks'],
        [26, 32, '5 · Shouting'], [32, 36, '6 · Grey'], [36, 43, '7 · The kite'], [43, 50, '8 · Holding on'],
        [50, 57, '9 · The red returns'], [57, 62, '10 · The bridge of threads'], [62, 68, '11 · Ending'],
    ],
    audio: { mix: 'mix.wav' },   // node sandbox/2026-11-04-red-thread/music.mjs

    setup() {
        Shots = makeShots();
    },

    draw(g, t, env) {
        const k = Film.shotAt(t);
        if (t >= ACT.erase[0] && t < ACT.reveal[1]) return actChange(g, env, t);
        drawShot(k, g, t, env);
    },

    post(ctx, t, env) {
        const c = Film.camAt(t), k = env.k;
        Sumi.grain(ctx, env, { scale: c.z, ox: (800 - c.cx * c.z) * k, oy: (450 - c.cy * c.z) * k, amount: 0.5 });
        Sumi.tooth(ctx, env, { scale: 1.3 * c.z, ox: (800 - c.cx * c.z) * k, oy: (450 - c.cy * c.z) * k, amount: 0.05 });
        if (ANIMATIC) {
            const s = Film.SHOTS.find(([a, b]) => t >= a && t < b) ?? Film.SHOTS[Film.SHOTS.length - 1];
            const label = `${t.toFixed(1).padStart(4, '0')} s · ${s[2]}`;
            ctx.save();
            ctx.font = `${Math.round(13 * k)}px monospace`;
            ctx.fillStyle = 'rgba(23,19,15,0.55)';
            ctx.fillText(label, 14 * k, env.px[1] - 14 * k);
            ctx.restore();
        }
    },
});
