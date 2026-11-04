// red-thread · the film: the world's state over time, the villagers, the red threads, the
// shouts and slogans, and one function per shot. Global: Film. Depends on Sumi, Cast, RT.
//
// The whole film happens on ONE set (RT: river, banks, bridge, tree) seen by a camera that
// changes framing per shot. Everyone follows one timeline (V below), so a person is in the
// same place in every shot that sees them; only the camera cuts.
const Film = (() => {
    const E = Ease, S = Sumi;
    const hump = (u) => Math.sin(Math.PI * Math.max(0, Math.min(1, u)));
    const seg = (t, a, b) => E.seg(t, a, b);
    const keysAt = (keys, t) => RT.spline(keys, t);

    // --- the edit (60 BPM: every cut on a whole second) --------------------------------------
    const SHOTS = [
        [0, 6, '1 · Title'], [6, 12, '2 · The bridge'], [12, 18, '3 · Screens'], [18, 26, '4 · Two banks'],
        [26, 32, '5 · Shouting'], [32, 36, '6 · Grey'], [36, 43, '7 · The kite'], [43, 50, '8 · Holding on'],
        [50, 57, '9 · The red returns'], [57, 62, '10 · The bridge of threads'], [62, 68, '11 · Ending'],
    ];

    // --- the world over time -------------------------------------------------------------------
    // red: the sun (drains while they shout, fills from the edge when the red returns)
    // dark: ink in the river (every shout that lands blackens it; rain dilutes it; it clears)
    // bloom: the tree's full flower (it sheds in the shouting; only the last blossoms stay)
    function worldAt(t) {
        const bridge = t < 30.4 ? { mode: 'intact', crack: E.out(seg(t, 24.6, 25.2)), fall: 0 }
            : t < 32 ? { mode: 'intact', crack: 1, fall: (t - 30.4) / 1.6 } : { mode: 'broken' };
        return {
            red: keysAt([[0, 1], [27, 1], [31, 0], [53, 0], [58.5, 0.4], [62.5, 0.45], [64.8, 1], [68, 1]], t),
            dark: keysAt([[0, 0], [26.6, 0], [31.6, 0.82], [32, 0.8], [36, 0.32], [52, 0.3], [58.5, 0.18], [64.5, 0], [68, 0]], t),
            bloom: keysAt([[0, 1], [26.5, 1], [31, 0], [62.8, 0], [66, 1], [68, 1]], t),
            rain: keysAt([[31, 0], [32, 1], [34.5, 1], [36, 0]], t),
            bridge,
        };
    }

    // --- cameras: [t, cx, cy, zoom] per shot (a monotone spline inside each shot) ---------------
    const CAMS = {
        0: [[0, 1250, 520, 0.74], [6, 1250, 540, 0.8]],
        1: [[6, 1250, 625, 1.32], [12, 1260, 615, 1.28]],
        2: [[12, 1250, 625, 1.28], [18, 1250, 600, 1.0]],
        3: [[18, 1250, 590, 0.95], [26, 1250, 560, 0.84]],
        4: [[26, 1250, 630, 1.12], [27.0, 1250, 560, 0.95], [28.6, 1250, 430, 0.7], [32, 1250, 450, 0.72]],
        5: [[32, 1250, 520, 0.78], [33.8, 1150, 515, 0.86], [36, 655, 522, 1.13]],
        7: [[43, 1258, 486, 0.8], [44.6, 720, 600, 1.25], [46.4, 760, 600, 1.25], [48.6, 1830, 610, 1.25], [50, 1810, 600, 1.18]],
        8: [[50, 1250, 540, 0.8], [57, 1250, 560, 0.86]],
        9: [[57, 1250, 640, 1.38], [61.6, 1250, 625, 1.25]],
        10: [[62, 1250, 600, 1.1], [63.6, 1250, 560, 0.86], [68, 1250, 520, 0.76]],
    };
    const shotAt = (t) => {
        const i = SHOTS.findIndex(([a, b]) => t >= a && t < b);
        return i < 0 ? SHOTS.length - 1 : i;
    };
    // One continuous camera per act (the user: same place, same people, no cuts): the
    // adults' act (shots 1–5, 0–32 s) and the children's (shots 6–11, 32–68 s). Each shot's
    // keys join the next shot's, so the camera travels from one framing to the next. The only cut is at 32 s, an ink blot.
    const KITE_CAM = [[0, 655, 522, 1.13], [1.4, 700, 512, 1.09], [4.6, 1225, 490, 0.82], [7, 1258, 486, 0.795]].map(([tt, ...v]) => [tt + 36, ...v]);
    const ACTS = [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9, 10]];
    const actKeys = ACTS.map((shots) => {
        const keys = [];
        // each shot keeps its own last framing; the next shot's first key is dropped, so the
        // camera travels from there to the next shot's following key at that shot's pace
        shots.forEach((k, i) => {
            let ks = k === 6 ? KITE_CAM : CAMS[k];
            if (i > 0) ks = ks.slice(1);
            keys.push(...ks);
        });
        return keys;
    });
    function camAt(t, shot = null) {
        const k = shot ?? shotAt(t);
        const keys = actKeys[k <= 4 ? 0 : 1];
        const f = (j) => keysAt(keys.map((c) => [c[0], c[j]]), t);
        // every shout that lands in the river shakes the camera a little (decaying fast)
        let sx = 0, sy = 0;
        for (const [ts] of SHOUTS) {
            const dt = t - (ts + 0.7);
            if (dt < 0 || dt > 0.5) continue;
            const a = 6 * Math.exp(-dt * 9);
            sx += a * Math.sin(dt * 71);
            sy += a * 0.6 * Math.sin(dt * 53 + 1);
        }
        return { cx: f(1) + sx, cy: f(2) + sy, z: f(3) };
    }

    // --- people --------------------------------------------------------------------------------
    // height at a depth: the ground recedes towards the river's far end
    const hAt = (y) => Math.max(0.35, Math.min(1.35, (y - 520) / 240));
    const DECK = (x) => RT.deckY(x) - 2;
    const D = 'deck';    // a path key on the bridge: its y follows the deck
    // the rope bridge of threads (shots 10–11)
    const ROPE = { x0: 985, x1: 1525, y: 668, sag: 26 };
    const ropeY = (x) => ROPE.y + ROPE.sag * Math.sin(Math.PI * (x - ROPE.x0) / (ROPE.x1 - ROPE.x0));
    const R_ = 'rope';

    // Everyone's path: [t, x, y] keys (y = 'deck' on the bridge, 'rope' on the rope bridge).
    // Between keys they walk at constant speed; on equal keys they stand.
    const V = {
        womanL: { kind: 'woman', base: 215, keys: [[0, 700, 742], [5, 700, 742], [6.2, 840, D], [7.6, 1190, D], [8.4, 1190, D], [9.6, 1600, D], [9.9, 1680, D], [10.6, 1800, 762], [11.6, 2230, 806], [19.3, 2230, 806], [20.3, 1800, 762], [20.8, 1660, D], [23.2, 850, D], [24.2, 620, 790], [25.4, 640, 800], [32, 640, 800], [32.05, -200, 800], [50, -200, 800], [51.2, 300, 810], [64.6, 300, 810], [65.7, 990, R_], [67.4, 1150, R_], [68, 1150, R_]] },
        womanR: { kind: 'woman', base: 215, keys: [[0, 1850, 770], [5, 1850, 770], [6.2, 1660, D], [7.6, 1290, D], [8.4, 1290, D], [9.6, 900, D], [9.9, 830, D], [10.6, 720, 762], [20.3, 720, 762], [21.0, 840, D], [23.4, 1650, D], [24.4, 1960, 815], [25.4, 1985, 835], [32, 1985, 835], [32.05, 2750, 820], [50, 2750, 820], [51.2, 2180, 815], [64.6, 2180, 815], [65.4, 1530, R_], [67.4, 1360, R_], [68, 1360, R_]] },
        kasaL: { kind: 'man', base: 235, keys: [[0, 470, 776], [6.5, 470, 776], [7.5, 840, D], [8.9, 1180, D], [9.5, 1180, D], [10.9, 1630, D], [11.8, 2080, 810], [20.6, 2080, 810], [21.5, 1670, D], [24.0, 840, D], [25.0, 720, 790], [42.9, 720, 790], [42.95, 160, 770], [44.0, 560, 745], [62, 560, 745]] },
        kasaR: { kind: 'man', base: 235, keys: [[0, 2050, 790], [6.5, 2050, 790], [7.5, 1670, D], [8.9, 1300, D], [9.5, 1300, D], [10.9, 870, D], [11.8, 560, 800], [20.6, 560, 800], [21.5, 830, D], [24.0, 1660, D], [25.0, 1820, 800], [42.9, 1820, 800], [42.95, 2290, 800], [46.7, 2290, 800], [47.6, 1990, 790], [62, 1990, 790]] },
        manL2: { kind: 'man', base: 225, faceHold: [[12, 18, 1]], keys: [[0, 300, 800], [12, 300, 800], [13.2, 840, D], [15.0, 1235, D], [15.4, 1205, D], [15.6, 1205, D], [17.0, 1650, D], [18.2, 1990, 795], [21.0, 1990, 795], [21.8, 1680, D], [24.2, 840, D], [25.2, 470, 785], [32, 470, 785], [32.05, -260, 790], [50, -260, 790], [51.6, 180, 790], [62, 180, 790]] },
        manR2: { kind: 'man', base: 225, faceHold: [[12, 18, -1]], keys: [[0, 2300, 806], [12, 2300, 806], [13.2, 1670, D], [15.0, 1265, D], [15.4, 1295, D], [15.6, 1295, D], [17.0, 860, D], [18, 640, 792], [21.0, 640, 792], [21.8, 830, D], [24.2, 1670, D], [25.2, 2070, 805], [32, 2070, 805], [32.05, 2800, 800], [50, 2800, 800], [51.6, 2280, 795], [62, 2280, 795]] },
        oldW: { kind: 'elder', base: 195, keys: [[0, 380, 770], [26, 380, 770], [42.9, 380, 770], [42.95, 220, 800], [44.6, 220, 800], [45.8, 470, 790], [62, 470, 790]] },
        oldM: { kind: 'elderm', base: 205, keys: [[0, 2150, 790], [42.9, 2150, 790], [42.95, 2400, 820], [47.4, 2400, 820], [48.8, 2085, 850], [62, 2085, 850]] },
    };
    // shot 5: everyone at the river's edge, facing the other bank
    const EDGE = { kasaL: [730, 775], womanL: [650, 800], manL2: [470, 785], oldW: [380, 770], kasaR: [1820, 800], womanR: [1985, 835], manR2: [2070, 805], oldM: [2150, 790] };
    const HOME_FACE = { womanL: 1, kasaL: 1, manL2: 1, oldW: 1, womanR: -1, kasaR: -1, manR2: -1, oldM: -1 };
    // who holds a phone, when (they take it out, and later let it fall)
    const PHONE = {
        womanL: [13.0, 63.25], womanR: [13.2, 63.45], kasaL: [13.8, 62.85], kasaR: [14.0, 63.05],
        manL2: [13.4, 63.65], manR2: [13.5, 63.85],
    };
    // bows (round 13): the greeting of the opening comes back at the end, across the river,
    // once the masks are off
    const BOWS = {
        womanL: [[7.6, 8.4], [63.9, 64.6]], womanR: [[7.6, 8.4], [63.9, 64.6]], kasaL: [[8.9, 9.5], [63.7, 64.4]], kasaR: [[8.9, 9.5], [63.7, 64.4]],
        manL2: [[64.0, 64.7]], manR2: [[64.0, 64.7]], oldW: [[63.8, 64.6]], oldM: [[63.8, 64.6]],
    };
    // shouts: [time, who, target x, target y] (they fly 0.7 s and land in the river)
    const SHOUTS = [
        [26.3, 'kasaL', 1320, 820], [26.8, 'kasaR', 1180, 840], [27.3, 'manL2', 1400, 780], [27.7, 'manR2', 1100, 800],
        [28.2, 'womanL', 1260, 900], [28.6, 'womanR', 1220, 760], [29.0, 'kasaL', 1460, 870], [29.4, 'kasaR', 1050, 880],
        [29.8, 'manL2', 1350, 950], [30.2, 'manR2', 1150, 960], [30.6, 'kasaL', 1280, 800], [31.0, 'kasaR', 1230, 870],
        [44.1, 'kasaL', 700, 590], [47.8, 'kasaR', 1870, 620],
    ];

    function pathAt(keys, t) {
        const P = keys.map(([tt, x, y]) => [tt, x, y]);
        const yOf = (x, y) => (y === D ? DECK(x) : y === R_ ? ropeY(x) - 2 : y);
        let dist = 0, dir = 0, moving = false;
        if (t <= P[0][0]) return { x: P[0][1], y: yOf(P[0][1], P[0][2]), dist: 0, dir: 0, moving: false };
        for (let i = 0; i < P.length - 1; i++) {
            const [ta, xa, ya0] = P[i], [tb, xb, yb0] = P[i + 1];
            const ya = yOf(xa, ya0), yb = yOf(xb, yb0);
            const len = Math.hypot(xb - xa, yb - ya);
            if (t < tb) {
                const u = (t - ta) / (tb - ta);
                const x = xa + (xb - xa) * u;
                let y = ya + (yb - ya) * u;
                if (ya0 === D && yb0 === D) y = DECK(x);
                if (ya0 === R_ && yb0 === R_) y = ropeY(x) - 2;
                moving = len > 1 && tb - ta < 30;            // a jump key (tiny dt) is a teleport, not a walk
                if (tb - ta < 0.1) moving = false;
                return { x, y, dist: dist + len * u, dir: Math.sign(xb - xa) || dir, moving };
            }
            if (tb - ta >= 0.1) dist += len;
            if (Math.abs(xb - xa) > 1) dir = Math.sign(xb - xa);
        }
        const L = P[P.length - 1];
        return { x: L[1], y: yOf(L[1], L[2]), dist, dir, moving: false };
    }

    // walking feet and swinging hands from the distance walked
    function walk(f, dist, base) {
        const h = f.h, s = f.face, stride = h * 0.2, cyc = dist / (base * 0.62 * 0.9);
        f.feet = [0, 0.5].map((ph) => {
            const c = (((cyc + ph) % 1) + 1) % 1;
            const off = c < 0.5 ? stride * (0.5 - 2 * c) : stride * (-0.5 + 2 * (c - 0.5));
            const lift = c < 0.5 ? 0 : Math.sin(Math.PI * 2 * (c - 0.5)) * h * 0.035;
            return [f.x + s * off, f.y - lift];
        });
        const sw = Math.sin(cyc * Math.PI * 2) * h * 0.07;
        f.hands = [[f.x + s * (h * 0.02 + sw), f.y - h * 0.45], [f.x + s * (h * 0.0 - sw), f.y - h * 0.46]];
    }

    function inPhone(id, t) {
        const p = PHONE[id];
        return p ? E.inOut(seg(t, p[0], p[0] + 0.4)) * (1 - seg(t, p[1], p[1] + 0.3)) : 0;
    }

    // the pose of a villager at time t (time on twos)
    function villager(id, t) {
        const v = V[id], p = pathAt(v.keys, t);
        let y = p.y, x = p.x;
        // shot 5: at the river's edge
        if (t >= 25.4 && t < 32 && EDGE[id]) [x, y] = EDGE[id];
        // on the bridge people keep to a side (right-goers the far side, left-goers the near
        // one) so two never walk through each other; the two men with phones walk down the
        // middle, bump, step back without turning and only then each move to his side
        const onDeck = y < 700 && x > 815 && x < 1685;
        let lane = onDeck && p.moving ? (p.dir > 0 ? -6 : 6) : 0;
        if (id === 'manL2' || id === 'manR2') {
            const side = id === 'manL2' ? -7 : 7;
            lane = t >= 12.5 && t < 18 ? side * E.inOut(seg(t, 15.5, 15.9)) : lane;
        }
        y += lane;
        const h = v.base * hAt(y);
        let face = p.moving && p.dir ? p.dir : (t >= 25 && t < 62 ? HOME_FACE[id] : p.dir || HOME_FACE[id]);
        if (v.faceHold) for (const [a, b, fc] of v.faceHold) if (t >= a && t < b) face = fc;
        const f = { x, y, h, face, kind: v.kind, id, t, lean: 0, look: 0, ink: 0.95 };
        if (v.kind === 'elder' || v.kind === 'elderm') {
            f.lean = 0.28;
            f.cane = true;
            f.look = 0.2;
        }
        if (p.moving) walk(f, p.dist, v.base);
        else {
            // nobody stands like a statue: a slow sway and small turns of the head
            f.lean += 0.025 * Motion.noise1(id + 'sway', t * 0.7);
            f.look += 0.06 * Motion.noise1(id + 'look', t * 0.5);
        }
        // bow when greeting on the bridge
        for (const b of BOWS[id] ?? []) {
            const u = hump(seg(t, b[0], b[1]));
            f.lean += 0.55 * u;
            f.look -= 0.3 * u;
        }
        // the phone: in both hands in front of the chest, head bowed over it; it falls when
        // they let it go (shot 9)
        const ph = inPhone(id, t);
        if (PHONE[id] && t >= PHONE[id][0]) {
            const sh = [x + face * h * 0.02, y - h * 0.73];
            const held = [sh[0] + face * h * 0.13, sh[1] + h * 0.17];
            if (ph > 0.01) {
                f.hands = [E.lerpPt(f.hands?.[0] ?? held, held, ph), E.lerpPt(f.hands?.[1] ?? held, [held[0] - face * h * 0.03, held[1] + h * 0.02], ph)];
                f.look += -0.6 * ph;
                f.lean += 0.08 * ph;
                f.phone = 1;
                f.phoneAt = [held[0], held[1] - h * 0.02];
                f.phoneRot = -0.4 * face;
                f.glow = ph;
            } else if (t >= PHONE[id][1]) {
                // dropped: it lies on the ground by their feet, its light going out
                f.phone = 1;
                // let go: the wind takes the sheet out over the river, tumbling, and it is gone
                const dt = Math.max(0, t - PHONE[id][1] - 0.3);
                const toRiver = x < 1240 ? 1 : -1;
                f.phoneAt = [held[0] + toRiver * 260 * dt, held[1] - 60 * dt + 120 * dt * dt + 14 * Math.sin(dt * 7)];
                f.phoneRot = dt * 5;
                f.phone = Math.max(0, 1 - dt / 1.4);
            }
        }
        // the slogans glow up out of the screens (shot 4): faces lit from below
        // shouting (shot 5 and shot 8): lean in, chin up, fist up
        for (const [ts, who] of SHOUTS) {
            if (who !== id) continue;
            const u = hump(seg(t, ts - 0.25, ts + 0.45));
            if (u <= 0) continue;
            f.lean += 0.14 * u;
            f.look += 0.35 * u;
            const sh = [x, y - h * 0.73];
            f.hands = [E.lerpPt(f.hands?.[0] ?? [x + face * h * 0.05, y - h * 0.45], [sh[0] + face * h * 0.12, sh[1] - h * 0.12], u), f.hands?.[1] ?? [x, y - h * 0.45]];
        }
        return f;
    }

    // --- the children ----------------------------------------------------------------------------
    const KIDS = {
        girl: { kind: 'girl', base: 175, keys: [[0, 560, 810], [9.0, 560, 810], [10.0, 840, D], [11.4, 1450, D], [12.2, 1640, D], [12.45, 1690, D], [12.65, 1760, 722], [12.9, 1840, 812], [20, 1840, 812], [20.3, 1760, 722], [20.6, 1700, 690], [20.9, 1680, D], [23.3, 880, D], [24.3, 570, 818], [25.4, 565, 815], [32, 565, 815]] },
        boy: { kind: 'boy', base: 185, keys: [[0, 610, 815], [9.0, 610, 815], [10.0, 885, D], [11.4, 1495, D], [12.2, 1690, D], [12.45, 1700, D], [12.9, 1900, 790], [26, 1900, 790], [32, 1900, 790]] },
    };
    function kid(id, t) {
        const k = KIDS[id], p = pathAt(k.keys, t);
        const h = k.base * hAt(p.y);
        const face = p.moving && p.dir ? p.dir : id === 'girl' ? 1 : -1;
        const f = { x: p.x, y: p.y, h, face, kind: k.kind, id, t, lean: 0.05, look: 0.1 };
        if (p.moving) walk(f, p.dist * 1.25, k.base);       // children skip along
        // running across together, holding hands (shot 2)
        // the boy takes out his phone (shot 3) and sits on his rock
        if (id === 'boy' && t >= 15.6 && t < 32) {
            const ph = E.inOut(seg(t, 15.6, 16.0));
            const sh = [f.x, f.y - h * 0.73];
            const held = [sh[0] + f.face * h * 0.12, sh[1] + h * 0.18];
            f.hands = [E.lerpPt(f.hands?.[0] ?? held, held, ph), E.lerpPt(f.hands?.[1] ?? held, held, ph)];
            f.look = -0.5 * ph;
            f.phone = ph;
            f.phoneAt = held;
            f.glow = ph;
        }
        // the girl hides behind her mother when the shouting starts
        if (id === 'girl' && t >= 26 && t < 32) {
            f.look = -0.25;
            f.lean = -0.05;
        }
        return f;
    }

    // --- red threads -------------------------------------------------------------------------
    // [a, b, born, slackFrom, snapAt, rebornAt]
    const THREADS = [

    ];
    function threadPts(a, b, slack, n = 24) {
        const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
        return RT.sag(a, b, 18 + d * 0.04 + slack * 70);
    }
    function drawThread(g, pts, o = {}) {
        const grow = o.grow ?? 1, alpha = o.alpha ?? 1;
        let P = pts;
        if (grow < 1) {
            // it grows out from the middle (where they met) towards both of them
            const n = pts.length - 1, a = Math.floor(n * (0.5 - grow / 2)), b = Math.ceil(n * (0.5 + grow / 2));
            P = pts.slice(a, b + 1);
        }
        if (P.length < 2 || alpha <= 0) return;
        const col = o.color ?? S.RED;
        g.save();
        g.globalAlpha *= alpha;
        S.stroke(g, P, { w: o.w ?? 2.4, ink: o.ink ?? 0.95, color: col, dry: 0.15, seed: o.seed ?? 'thr', taper: [0, 0], blunt: 1, bleed: false, raw: true, core: false });
        g.restore();
    }
    // a thread snapping at its middle: both halves whip back and fall, a few red drops fly
    function drawSnap(g, a, b, slack, u, seed) {
        const pts = threadPts(a, b, slack), n = pts.length - 1, mid = pts[Math.floor(n / 2)];
        const fall = 260 * u * u, keep = 1 - 0.55 * E.out(u);
        for (const [end, side] of [[a, 0], [b, 1]]) {
            const tip0 = E.lerpPt(end, mid, keep);
            const tip = [tip0[0], tip0[1] + fall];
            const half = [];
            for (let i = 0; i <= 12; i++) {
                const v = i / 12;
                const p = E.lerpPt(end, tip, v);
                half.push([p[0] + Math.sin(v * 9 + u * 12) * 6 * u * v, p[1] + 30 * v * v * (1 + u * 2)]);
            }
            drawThread(g, half, { alpha: 1 - u, seed: seed + side });
        }
        for (let i = 0; i < 6; i++) {
            const a2 = -Math.PI / 2 + (i - 2.5) * 0.5, sp = 120 + i * 25;
            const x = mid[0] + Math.cos(a2) * sp * u, y = mid[1] + Math.sin(a2) * sp * u + 400 * u * u;
            S.dab(g, x, y, 3.5 * (1 - u), 3 * (1 - u), { color: S.RED, seed: seed + 'd' + i });
        }
    }

    // --- shouts, splashes, slogans, clouds, rain ------------------------------------------------
    function bezier(p0, p1, p2, u) {
        const a = E.lerpPt(p0, p1, u), b = E.lerpPt(p1, p2, u);
        return E.lerpPt(a, b, u);
    }
    function drawShout(g, from, to, u, seed) {
        // a thick black stroke flung across the river, a comet of ink along an arc
        const p1 = [(from[0] + to[0]) / 2, Math.min(from[1], to[1]) - 240];
        const pts = [];
        const a = Math.max(0, u - 0.4), b = Math.min(1, u);
        for (let i = 0; i <= 10; i++) pts.push(bezier(from, p1, to, a + (b - a) * (i / 10)));
        S.stroke(g, pts, { w: 22, ink: 1, dry: 0.55, seed, taper: [0.7, 0.05], blunt: 0.4, bleed: false });
    }
    function drawSplash(g, at, u, seed, scale = 1) {
        // a crown of ink drops thrown up, a ring spreading on the water
        for (let i = 0; i < 8; i++) {
            const a = -Math.PI / 2 + (i - 3.5) * 0.32, sp = (90 + (i % 3) * 40) * scale;
            const x = at[0] + Math.cos(a) * sp * u, y = at[1] + Math.sin(a) * sp * u + 380 * u * u * scale;
            if (y > at[1] + 4) continue;
            S.dab(g, x, y, 5 * scale * (1 - u * 0.6), 4 * scale * (1 - u * 0.6), { seed: seed + i, ink: 0.95 });
        }
        g.save();
        g.strokeStyle = S.tone(0.7 * (1 - u));
        g.lineWidth = 3;
        g.beginPath();
        g.ellipse(at[0], at[1], 30 + 110 * u * scale, (8 + 26 * u) * scale, 0, 0, Math.PI * 2);
        g.stroke();
        g.restore();
    }
    // a fake character: a few calligraphic strokes in a box (illegible on purpose: slogans
    // are noise, the film never says what they say)
    function glyph(g, x, y, s, seed, ink = 0.95) {
        const r = Motion.rng(seed);
        const n = 4 + Math.floor(r() * 3);
        for (let i = 0; i < n; i++) {
            const kind = r();
            const ax = x + (r() - 0.5) * s, ay = y + (r() - 0.5) * s;
            const pts = kind < 0.4 ? [[ax - s * 0.4, ay], [ax + s * 0.4, ay - s * 0.05]]
                : kind < 0.75 ? [[ax, ay - s * 0.45], [ax + s * 0.03, ay + s * 0.45]]
                    : [[ax - s * 0.25, ay - s * 0.2], [ax + s * 0.2, ay + s * 0.25], [ax + s * 0.05, ay + s * 0.4]];
            S.stroke(g, pts, { w: s * 0.16, ink, dry: 0.4, seed: seed + i, taper: [0.05, 0.6], blunt: 0.9, bleed: false });
        }
    }
    const CLOUDS = { L: [520, 160], R: [1980, 170] };
    function drawCloud(g, env, side, amount, t) {
        if (amount <= 0) return;
        const [cx, cy] = CLOUDS[side];
        const sp = Motion.sprite('cloud:' + side, { x: cx - 420, y: cy - 200, w: 840, h: 400 }, env.k, (c) => {
            const w = S.wash('cloudw' + side, { x: cx - 420, y: cy - 200, w: 840, h: 400 }, env.k, (q) => {
                const pts = S.blobPts(cx, cy, 330, 110, 0, 'cl' + side, 0.3, 40);
                q.moveTo(pts[0][0], pts[0][1]);
                for (const p of pts) q.lineTo(p[0], p[1]);
                q.closePath();
            }, { ink: 0.75, blur: 9, rim: 0.4, rimW: 14, grain: 1.2 });
            c.drawImage(w.canvas, cx - 420, cy - 200, 840, 400);
            // churning strokes inside: the slogans dissolving into the cloud
            const r = Motion.rng('clg' + side);
            for (let i = 0; i < 26; i++) glyph(c, cx + (r() - 0.5) * 520, cy + (r() - 0.5) * 150, 26 + r() * 22, 'cg' + side + i, 0.9);
        });
        g.save();
        g.globalAlpha *= Math.min(1, amount);
        const sc = 0.55 + 0.45 * E.out(Math.min(1, amount));
        g.translate(cx, cy + Math.sin(t * 0.8) * 4);
        g.scale(sc, sc);
        g.translate(-cx, -cy);
        sp.draw(g);
        g.restore();
    }
    function drawRain(g, c, amount, t) {
        if (amount <= 0) return;
        const r = Motion.rng('rain');
        g.save();
        g.strokeStyle = S.tone(0.35 * amount);
        g.lineWidth = 1.4;
        g.lineCap = 'round';
        g.beginPath();
        for (let i = 0; i < 260; i++) {
            const x0 = -300 + r() * 3200, ph = r(), sp = 1100 + r() * 300;
            const y = -300 + ((t * sp + ph * 1600) % 1600);
            const x = x0 + (y + 300) * 0.18;
            g.moveTo(x, y);
            g.lineTo(x - 7, y - 38);
        }
        g.stroke();
        // rings where drops hit the river
        for (let i = 0; i < 26; i++) {
            const ph = r(), x = 700 + r() * 1200, y = 680 + r() * 420, u = (t * 1.3 + ph) % 1;
            g.strokeStyle = S.tone(0.4 * amount * (1 - u));
            g.lineWidth = 1.5;
            g.beginPath();
            g.ellipse(x, y, 4 + 26 * u, 1.5 + 6 * u, 0, 0, Math.PI * 2);
            g.stroke();
        }
        g.restore();
    }

    // --- the kuroko (round 11: «una causa externa alegorizando al sistema que nos divide sin
    // saberlo») -----------------------------------------------------------------------------
    // In Japanese theatre the kuroko is the stagehand dressed in black, face veiled, who moves
    // the puppets in plain sight while everyone agrees he is not there. Here he is the system:
    // a giant hooded figure rising behind the mountains (eclipsing the sun), his hands hidden
    // in his sleeves, a puppeteer's control bar hanging from each sleeve with black strings
    // down to the villagers' phones. Nobody looks up. The slogans run down his strings; a
    // string lashes each red thread before it snaps. When someone lets the phone go his
    // string breaks; with no strings left he dissolves into the mist.
    const KUROKO = { x: 1240, top: 205 };
    function kurokoAt(t) {
        // presence (0..1) and how far below the mountains he still is
        // unseen until the camera pulls back from the quarrel and finds him (26.3 s)
        const rise1 = E.inOut(seg(t, 26.3, 27.9)), rise2 = E.inOut(seg(t, 43.2, 45.0));
        const gone = E.inOut(seg(t, 63.4, 66.2));
        if (t < 32) return { on: rise1, dy: 80 * (1 - rise1), fade: 0 };
        if (t < 43) return { on: 0, dy: 560, fade: 1 };
        return { on: rise2, dy: 420 * (1 - rise2) + 60 * gone, fade: gone };
    }
    // the two control bars (ito-ayatsuri crosses), swinging a little under the sleeves
    function kurokoBars(t) {
        const k = kurokoAt(t);
        return [[-1, 1240 - 455], [1, 1240 + 455]].map(([side, x]) => {
            const sw = Math.sin(t * 1.3 + side) * 10;
            return { side, x: x + sw, y: 470 + k.dy + Math.sin(t * 0.9 + side * 2) * 6, rot: Math.sin(t * 1.3 + side) * 0.12, on: k.on * (1 - k.fade) };
        });
    }
    // the body: behind the landscape (painted before it), so the mountains hide his foot
    function drawKuroko(g, env, t) {
        const k = kurokoAt(t);
        if (k.on <= 0.01 || k.fade >= 0.99) return;
        const sp = Motion.sprite('kuroko3', { x: 500, y: -120, w: 1500, h: 860 }, env.k, (c) => {
            const r = Motion.rng('kuroko');
            const X = KUROKO.x, Y = KUROKO.top;
            const st = (pts, w, seed, o = {}) => S.stroke(c, pts, { w, ink: o.ink ?? 1, dry: o.dry ?? 0.55, seed: 'k3' + seed, taper: o.taper ?? [0.05, 0.2], blunt: o.blunt ?? 0.9, press: o.press, bleed: o.bleed ?? true });
            // painted like a mountain, not cut like a silhouette: a soft grey wash first, the
            // ink bleeding into the paper around him
            c.save();
            c.filter = 'blur(28px)';
            S.fillPoly(c, S.smooth([[X - 120, Y - 60], [X + 120, Y - 60], [X + 250, Y + 160], [X + 480, Y + 300], [X + 330, Y + 560], [X - 330, Y + 560], [X - 480, Y + 300], [X - 250, Y + 160]], 6), 'rgba(40,38,36,0.35)');
            c.restore();
            // the body: five broad loaded strokes from the shoulders down, each running dry
            // into bristle streaks before it reaches the mist
            // paper under the whole figure first, so nothing behind him shows through
            S.fillPoly(c, S.smooth([[X - 75, Y - 40], [X + 75, Y - 40], [X + 125, Y + 60], [X + 135, Y + 150], [X + 200, Y + 190], [X + 230, Y + 600], [X - 230, Y + 600], [X - 200, Y + 190], [X - 135, Y + 150], [X - 125, Y + 60]], 6), S.PAPER);
            const body = [[-185, 0.95], [-95, 1], [-5, 0.85], [85, 1], [175, 0.92]];
            body.forEach(([dx, k], i) => {
                const x0 = X + dx * 0.7, x1 = X + dx * 1.25;
                st([[x0, Y + 150], [x0 + dx * 0.15, Y + 330], [x1, Y + 600]], 120, 'b' + i, { ink: k, dry: 0.62 + 0.05 * (i % 2), taper: [0.02, 0.1], press: (u) => 1.1 - 0.25 * u });
            });
            // the shoulders: one heavy arc across, pressed hard
            st([[X - 230, Y + 230], [X - 140, Y + 165], [X, Y + 150], [X + 140, Y + 165], [X + 230, Y + 230]], 95, 'sh', { dry: 0.4, taper: [0.25, 0.25], blunt: 0.5 });
            // the arms: from the shoulder out and down over the valley, the sleeve swelling
            // like a bell at the wrist; the hands stay inside
            for (const sd of [-1, 1]) {
                const sh = [X + sd * 190, Y + 200], el = [X + sd * 330, Y + 300], mouth = [X + sd * 440, Y + 230];
                st([sh, el, mouth], 80, 'arm' + sd, { dry: 0.45, taper: [0, 0.04], press: (u) => 0.85 + 0.5 * u * u });
                // the sleeve hanging under the forearm (furisode), dry and grey
                st([[X + sd * 340, Y + 290], [X + sd * 390, Y + 360], [X + sd * 400, Y + 430]], 80, 'sl' + sd, { ink: 0.8, dry: 0.72, taper: [0.05, 0.75] });
                // the dark mouth of the sleeve
                S.dab(c, mouth[0] + sd * 14, mouth[1] + 4, 36, 50, { seed: 'k3m' + sd, ink: 1.2, rot: -sd * 0.3 });
            }
            // the hood: a dome painted in two strokes over the head, its cloth falling onto
            // the shoulders
            st([[X - 105, Y + 170], [X - 95, Y + 30], [X - 55, Y - 22], [X, Y - 32], [X + 55, Y - 22], [X + 95, Y + 30], [X + 105, Y + 170]], 70, 'hood', { dry: 0.4, taper: [0.15, 0.15], blunt: 0.6 });
            S.fillPoly(c, S.smooth([[X - 80, Y + 20], [X - 50, Y - 12], [X + 50, Y - 12], [X + 80, Y + 20], [X + 80, Y + 150], [X - 80, Y + 150]], 4), S.tone(0.95));
            // the veil (the kuroko's face cloth): a hanging panel in a lighter grey, painted
            // with vertical dry strokes, darker band at the brow, no face behind it
            const veil = [[X - 62, Y + 18], [X + 62, Y + 18], [X + 66, Y + 205], [X + 20, Y + 212], [X - 25, Y + 204], [X - 66, Y + 210]];
            S.fillPoly(c, veil, S.PAPER);
            S.fillPoly(c, veil, S.tone(0.5));
            for (let i = 0; i < 10; i++) {
                const x = X - 56 + i * 12.5;
                st([[x, Y + 20], [x + (r() - 0.5) * 4, Y + 120], [x + (r() - 0.5) * 6, Y + 200]], 7, 'v' + i, { ink: 0.55 + 0.15 * (i % 3), dry: 0.85, taper: [0, 0.3], bleed: false });
            }
            st([[X - 64, Y + 206], [X - 20, Y + 210], [X + 25, Y + 203], [X + 66, Y + 208]], 6, 'vhem', { ink: 0.9, dry: 0.6, taper: [0.1, 0.1] });
            st([[X - 70, Y + 16], [X + 70, Y + 16]], 18, 'band', { ink: 1, dry: 0.3, taper: [0, 0], blunt: 1 });
            // a few dark folds in thin dry brush
            for (let i = 0; i < 7; i++) {
                const x = X - 260 + r() * 520, y0 = Y + 220 + r() * 120;
                st([[x, y0], [x + (r() - 0.5) * 30, y0 + 140 + r() * 160]], 6 + r() * 6, 'f' + i, { ink: 1, dry: 0.85, taper: [0.3, 0.6], bleed: false });
            }
            // his foot dissolves into the mist
            c.save();
            c.globalCompositeOperation = 'destination-out';
            const gr = c.createLinearGradient(0, Y + 360, 0, Y + 620);
            gr.addColorStop(0, 'rgba(0,0,0,0)');
            gr.addColorStop(1, 'rgba(0,0,0,1)');
            c.fillStyle = gr;
            c.fillRect(X - 700, Y + 360, 1400, 400);
            c.restore();
        });
        g.save();
        // nothing of him shows below the far shore (the river and the land are in front)
        g.beginPath();
        g.rect(-2000, -2000, 6000, 2000 + RT.HORIZON);
        g.clip();
        // after the act change only his ghost comes back (the people are no longer looking at the sheets)
        g.globalAlpha *= Math.min(1, k.on * 1.4) * (1 - k.fade) * (t >= 43 ? 0.3 : 1);
        g.translate(0, k.dy);
        sp.draw(g);
        g.restore();
    }
    // in front of the landscape: the control bars and the black strings to the phones
    function kurokoStrings(g, t, poses, drawn) {
        const bars = kurokoBars(t);
        if (bars[0].on <= 0.05) return;
        const ink = Math.min(1, bars[0].on * 1.2) * (t >= 43 ? 0.55 : 1);
        for (const b of bars) {
            g.save();
            g.globalAlpha *= ink;
            g.translate(b.x, b.y);
            g.rotate(b.rot);
            S.stroke(g, [[-80, 0], [80, 0]], { w: 12, ink: 0.95, dry: 0.4, seed: 'bar' + b.side, taper: [0.05, 0.05], blunt: 1, bleed: false });
            S.stroke(g, [[0, -34], [0, 36]], { w: 11, ink: 0.95, dry: 0.4, seed: 'barv' + b.side, taper: [0.05, 0.05], blunt: 1, bleed: false });
            // the string up into the sleeve
            S.stroke(g, [[0, -34], [0, -60]], { w: 3, ink: 0.9, dry: 0.2, seed: 'barup' + b.side, taper: [0, 0], core: false, bleed: false });
            g.restore();
        }
        const byId = Object.fromEntries(poses.map((p) => [p.id, p]));
        for (const id of Object.keys(PHONE)) {
            const p = byId[id], d = drawn[id];
            if (!p || !d) continue;
            const [t0, t1] = PHONE[id];
            const cut = t1 - 0.15;
            if (t < Math.max(t0 + 0.6, 26.3) || t > cut + 0.6) continue;
            const b = d.head[0] < KUROKO.x ? bars[0] : bars[1];
            const end = p.phone && p.phoneAt && t < t1 ? p.phoneAt : d.head;
            const from = [b.x + (end[0] < b.x ? -60 : 60), b.y];
            const grow = t < 32 ? E.out(seg(t, 26.5, 27.6)) : E.out(seg(t, Math.max(t0, 43.6), Math.max(t0, 43.6) + 0.8));
            if (t <= cut) {
                const tip = E.lerpPt(from, end, grow);
                S.stroke(g, [from, E.lerpPt(from, tip, 0.5), tip], { w: 3.2, ink: 0.95 * ink, dry: 0.2, seed: 'ks' + id, taper: [0, 0], raw: true, core: false, bleed: false });
            } else {
                // the string breaks: the upper half whips back up to the bar, the lower falls
                const u = (t - cut) / 0.6, mid = E.lerpPt(from, end, 0.5);
                S.stroke(g, [from, E.lerpPt(from, mid, 1 - u)], { w: 1.8, ink: 0.85 * ink * (1 - u), dry: 0.3, seed: 'ksa' + id, taper: [0, 0.6], raw: true, core: false, bleed: false });
                S.stroke(g, [[mid[0], mid[1] + 200 * u * u], [end[0], end[1] + 60 * u]], { w: 1.8, ink: 0.85 * (1 - u), dry: 0.3, seed: 'ksb' + id, taper: [0.6, 0], raw: true, core: false, bleed: false });
            }
        }
    }
    // a black string lashing a red thread just before it snaps (shot 5)
    function kurokoLash(g, t, mid, snapAt, side) {
        const u = (t - (snapAt - 0.3)) / 0.4;
        if (u <= 0 || u >= 1) return;
        const b = kurokoBars(t)[side];
        const p0 = [b.x, b.y], ctrl = [(b.x + mid[0]) / 2 + (side ? 120 : -120), Math.min(b.y, mid[1]) - 80];
        const pts = [];
        for (let i = 0; i <= 10; i++) pts.push(bezier(p0, ctrl, [mid[0] + (side ? 60 : -60), mid[1] + 20], Math.min(1, u * 1.6) * (i / 10)));
        S.stroke(g, pts, { w: 3.5, ink: 0.95 * (1 - Math.max(0, u - 0.7) / 0.3), dry: 0.3, seed: 'lash' + snapAt, taper: [0, 0.5], raw: true, core: false, bleed: false });
    }

    // --- the sleeve (round 12: «no entiendo en qué momento pasa todo a mal») ----------------
    // The first time we see him is only his sleeve: it comes down out of the sky over the bridge
    // and lets the broadsheets (kawaraban) fall, one into each pair of hands. Nobody looks up.
    const SLEEVE = { x: 1270, y: 420, on: [11.0, 11.6], off: [14.6, 15.3] };
    const FALL = 1.3;                                   // seconds a sheet takes to reach the hands
    const DROPS = { ...Object.fromEntries(Object.entries(PHONE).map(([id, [t0]]) => [id, t0])), boy: 15.6 };   // the boy's falls last, as the sleeve withdraws
    function sleeveAt(t) {
        const u = E.inOut(seg(t, SLEEVE.on[0], SLEEVE.on[1])) * (1 - E.inOut(seg(t, SLEEVE.off[0], SLEEVE.off[1])));
        // a little shake of the wrist each time a sheet leaves it
        let shake = 0;
        for (const t0 of Object.values(DROPS)) shake += hump(seg(t, t0 - FALL - 0.1, t0 - FALL + 0.25));
        return { u, mouth: [SLEEVE.x + 10 * Math.sin(t * 0.8) + 8 * shake, SLEEVE.y - 520 * (1 - u) + 14 * shake] };
    }
    function drawSleeve(g, t) {
        const { u, mouth } = sleeveAt(t);
        if (u <= 0.001) return;
        const top = [mouth[0] + 140, mouth[1] - 600];
        S.stroke(g, [top, [mouth[0] + 60, mouth[1] - 300], [mouth[0] + 8, mouth[1] - 60], mouth], { w: 120, ink: 1, dry: 0.45, seed: 'slv', taper: [0, 0], blunt: 1, press: (v) => 0.85 + 0.35 * v * v });
        // the hanging sleeve under the arm, dry and grey, and the dark mouth
        S.stroke(g, [[mouth[0] - 30, mouth[1] - 120], [mouth[0] - 70, mouth[1] - 20], [mouth[0] - 80, mouth[1] + 50]], { w: 70, ink: 0.8, dry: 0.72, seed: 'slv2', taper: [0.05, 0.75] });
        S.dab(g, mouth[0], mouth[1] + 6, 46, 26, { seed: 'slvm', ink: 1.2 });
    }
    // the sheets in the air: they slip out of the sleeve and see-saw down into the hands
    function drawSheetDrops(g, t, poses) {
        const byId = Object.fromEntries(poses.map((p) => [p.id, p]));
        for (const [id, t0] of Object.entries(DROPS)) {
            const u = (t - (t0 - FALL)) / FALL;
            if (u <= 0 || u >= 1) continue;
            const p = byId[id];
            if (!p) continue;
            const from = sleeveAt(t0 - FALL).mouth;
            const sh = [p.x + p.face * p.h * 0.02, p.y - p.h * 0.73];
            const to = [sh[0] + p.face * p.h * 0.13, sh[1] + p.h * 0.15];
            const e = E.inOut(u);
            const at = [from[0] + (to[0] - from[0]) * e + 40 * Math.sin(u * Math.PI * 3) * (1 - u), from[1] + (to[1] - from[1]) * E.in(u)];
            Cast.sheet(g, at, p.h, 0.5 * Math.sin(u * Math.PI * 3 + 1) * (1 - u) - 0.4 * p.face * u, 1, 'drop' + id);
        }
    }

    // --- masks (round 10: «se pelean sin ningún sentido») -------------------------------------
    // What the screens do: from 20.5 s the slogans leave each phone, cross the river and land on
    // the face of a neighbour on the other bank as an oni mask. Everyone ends up seeing a demon
    // across the water; they shout from behind the masks. A mask cracks and falls when its
    // wearer lets the phone go (shot 9), or when the old hands hold the thread (shot 8).
    // [wearer, sent from, lands at, falls at]
    const MASKS = [
        ['kasaL', 'kasaR', 20.2, 62.7], ['kasaR', 'kasaL', 20.2, 62.9], ['womanL', 'womanR', 20.2, 63.1],
        ['womanR', 'womanL', 20.2, 63.3], ['manL2', 'manR2', 20.2, 63.5], ['manR2', 'manL2', 20.2, 63.7],
    ];
    const FLIGHT = 1.0;
    function drawMaskFlights(g, t, drawn, poses) {
        const byId = Object.fromEntries(poses.map((p) => [p.id, p]));
        MASKS.forEach(([who, from, at], i) => {
            const u = (t - (at - FLIGHT)) / FLIGHT;
            if (u <= 0 || u >= 1 || !drawn[who] || !byId[from]) return;
            const a = byId[from].phoneAt ?? drawn[from].head, b = drawn[who].head;
            const mid = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 170];
            const q = bezier(a, mid, b, E.inOut(u));
            glyph(g, q[0], q[1], 18 + 14 * Math.sin(Math.PI * u), 'mk' + i + Math.floor(u * 6));
        });
    }
    function drawMasks(g, t, drawn) {
        MASKS.forEach(([who, , at, off], i) => {
            const d = drawn[who];
            if (!d || t < at) return;
            const on = E.out(seg(t, at, at + 0.25)), fall = seg(t, off, off + 0.7);
            if (fall >= 1) return;
            oni(g, d, on, fall, 'oni' + i);
        });
    }
    // a white oni mask over the head, turned three quarters towards where the wearer faces
    function oni(g, d, on, fall, seed) {
        const R = d.headR * 1.25, s = d.face ?? 1;
        const [hx, hy] = d.head;
        const piece = (k, draw) => {
            g.save();
            // on falling, the mask splits in two halves that tip and drop
            const dx = fall > 0 ? (k ? 1 : -1) * R * 0.6 * fall : 0, dy = fall > 0 ? 260 * fall * fall : 0;
            g.translate(hx + s * R * 0.18 + dx, hy + dy);
            g.rotate(fall > 0 ? (k ? 1 : -1) * 1.2 * fall : 0);
            g.scale(on * (0.6 + 0.4 * on), on * (0.6 + 0.4 * on));
            g.globalAlpha *= 1 - fall * 0.8;
            g.beginPath();
            g.rect(k ? 0 : -R * 2, -R * 3, R * 2, R * 6);
            g.clip();
            draw();
            g.restore();
        };
        const face = () => {
            // the face plate: paper white, an ink rim
            S.fillPoly(g, S.blobPts(0, 0, R * 0.95, R * 1.1, 0, seed + 'p', 0.06, 24), S.PAPER);
            g.strokeStyle = S.tone(0.95);
            g.lineWidth = R * 0.12;
            g.beginPath();
            g.ellipse(0, 0, R * 0.95, R * 1.1, 0, 0, Math.PI * 2);
            g.stroke();
            // horns
            for (const k of [-1, 1]) S.stroke(g, [[k * R * 0.45, -R * 0.85], [k * R * 0.7, -R * 1.35], [k * R * 0.55, -R * 1.75]], { w: R * 0.28, ink: 0.95, dry: 0.3, seed: seed + 'h' + k, taper: [0, 0.9], blunt: 1, bleed: false });
            // furious brows down to the middle, eye slits, a fanged grin
            for (const k of [-1, 1]) {
                S.stroke(g, [[k * R * 0.7, -R * 0.55], [k * R * 0.12, -R * 0.22]], { w: R * 0.24, ink: 1, dry: 0.3, seed: seed + 'b' + k, taper: [0, 0.2], blunt: 1, bleed: false });
                S.fillPoly(g, [[k * R * 0.55, -R * 0.2], [k * R * 0.18, -R * 0.08], [k * R * 0.5, -R * 0.02]], S.tone(1));
            }
            g.fillStyle = S.tone(1);
            g.beginPath();
            g.moveTo(-R * 0.6, R * 0.35);
            g.quadraticCurveTo(0, R * 0.95, R * 0.6, R * 0.35);
            g.quadraticCurveTo(0, R * 0.6, -R * 0.6, R * 0.35);
            g.fill();
            g.fillStyle = S.PAPER;
            for (const k of [-0.35, 0.35]) {
                g.beginPath();
                g.moveTo(k * R - R * 0.09, R * 0.47);
                g.lineTo(k * R + R * 0.09, R * 0.47);
                g.lineTo(k * R, R * 0.72);
                g.fill();
            }
        };
        piece(0, face);
        piece(1, face);
    }

    // --- the world, painted back to front ----------------------------------------------------
    function darkWater(g, env, d, t) {
        if (d <= 0) return;
        g.save();
        g.fillStyle = S.tone(0.78 * d);
        g.fillRect(-800, RT.HORIZON, 4000, 700);
        g.globalAlpha = d;
        RT.water(g, env, t);            // its bands again: the black water keeps its texture
        g.restore();
    }
    // o: { cranesT, clouds: {L, R}, spans, figures(g), after(g), overcast }
    function paintWorld(g, env, t, tq, c, w, o = {}) {
        S.paper(g, env, { x: -500, y: -300, w: 3300, h: 1650 }, { res: 1.1 });
        if (o.overcast) {
            g.save();
            g.fillStyle = S.tone(0.12 * o.overcast);
            g.fillRect(-500, -300, 3300, 960);
            g.restore();
        }
        RT.sky(g, env, t, w);
        drawKuroko(g, env, t);
        if (o.cranesT != null) RT.cranes(g, env, o.cranesT);
        if (o.clouds) {
            drawCloud(g, env, 'L', o.clouds.L, t);
            drawCloud(g, env, 'R', o.clouds.R, t);
        }
        RT.landscape(g, env);
        RT.water(g, env, t);
        darkWater(g, env, w.dark, t);
        RT.reflections(g, env, t, c, o.spans ?? [], w);
        RT.lands(g, env);
        RT.reeds(g, env);
        RT.bridge(g, env, false, w.bridge);
        if (o.figures) o.figures(g);
        RT.tree(g, env, t, w.bloom);
        if (o.after) o.after(g);
    }

    // --- petals ---------------------------------------------------------------------------------
    // falling from the full bloom while the tree sheds (shot 5) and floating on the river at
    // the end; closed form per petal
    function shedPetals(g, t, t0, t1, n, seedKey) {
        const fl = RT.extraOf().length ? RT.extraOf() : RT.flowersOf();
        if (!fl.length) return;
        const r = Motion.rng(seedKey);
        for (let i = 0; i < n; i++) {
            const p0 = fl[Math.floor(r() * fl.length)], ts = t0 + r() * (t1 - t0), ph = r() * 6, drift = 40 + r() * 120;
            const dt = t - ts;
            if (dt < 0) continue;
            let x = p0[0] + drift * dt + 18 * Math.sin(dt * 2.6 + ph), y = p0[1] + 95 * dt + 10 * dt * dt;
            const surf = 760 + (i % 7) * 45;
            let rot = ph + dt * 4, flip = Math.cos(dt * 5 + ph), ink = 0.9;
            if (y > surf) {
                y = surf;
                x = p0[0] + drift * (dt) * 0.4 + 200;
                rot = ph;
                flip = 0.45;
                ink = 0.55;              // on the black river the red goes dull
            }
            S.petal(g, x, y, 6.5, rot, { flip, ink });
        }
    }
    function floatingPetals(g, t, n, seedKey) {
        const r = Motion.rng(seedKey);
        for (let i = 0; i < n; i++) {
            const x = 700 + r() * 1300 + ((t * (6 + r() * 6)) % 200), y = 690 + r() * 420;
            S.petal(g, x, y, 5 + r() * 2.5, r() * 6, { flip: 0.4, ink: 0.85 });
        }
    }

    // --- title cards -----------------------------------------------------------------------------
    // text written by the brush: revealed left to right behind a ragged edge
    function writeText(g, env, text, x, y, size, u, o = {}) {
        if (u <= 0) return;
        g.save();
        g.font = `${size}px ${o.font ?? 'Kaushan'}`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        const w = g.measureText(text).width;
        g.beginPath();
        const edge = x - w / 2 - 20 + (w + 40) * E.inOut(Math.min(1, u));
        g.moveTo(x - w / 2 - 40, y - size);
        for (let i = 0; i <= 12; i++) g.lineTo(edge + Motion.noise1('we', i * 0.9) * size * 0.25, y - size + (i / 12) * size * 2);
        g.lineTo(x - w / 2 - 40, y + size);
        g.closePath();
        g.clip();
        g.globalAlpha *= o.alpha ?? 1;
        g.fillStyle = o.color ?? S.INK;
        g.fillText(text, x, y);
        g.restore();
        return w;
    }
    // Japanese written vertically (tategaki): columns read top to bottom, right to left; each
    // character is brushed in from its top as the writing reaches it. `x` is the first (right)
    // column, `y` the top. Punctuation sits in the upper right of its cell, as in print.
    function writeVertical(g, env, columns, x, y, size, u, o = {}) {
        if (u <= 0) return { bottom: y, left: x };
        const total = columns.reduce((n, c) => n + [...c].length, 0);
        const gap = o.gap ?? size * 1.25, step = size * (o.step ?? 1.02);
        let k = 0, bottom = y;
        g.save();
        g.font = `${size}px ${o.font ?? 'Brush'}`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillStyle = o.color ?? S.INK;
        g.globalAlpha *= o.alpha ?? 1;
        columns.forEach((col, ci) => {
            const cx = x - ci * gap;
            [...col].forEach((ch, i) => {
                const v = Math.max(0, Math.min(1, u * total - k));
                k++;
                if (v <= 0) return;
                const punct = '、。'.includes(ch);
                const px = cx + (punct ? size * 0.32 : 0), py = y + i * step + size / 2 + (punct ? -size * 0.32 : 0);
                g.save();
                g.beginPath();
                // the brush comes down the character: a ragged edge moving from top to bottom
                const edge = py - size * 0.6 + size * 1.2 * E.inOut(v);
                g.moveTo(px - size, py - size);
                g.lineTo(px + size, py - size);
                for (let j = 0; j <= 6; j++) g.lineTo(px + size - (j / 6) * size * 2, edge + Motion.noise1('wv' + k, j * 1.3) * size * 0.12);
                g.closePath();
                g.clip();
                g.fillText(ch, px, py);
                g.restore();
                bottom = Math.max(bottom, py + size / 2);
            });
        });
        g.restore();
        return { bottom, left: x - (columns.length - 1) * gap };
    }
    function stamp(g, env, x, y, size, text, t, t0, o = {}) {
        if (t < t0) return;
        const u = E.out(seg(t, t0, t0 + 0.18));
        g.save();
        g.translate(x, y);
        const sc = 1.25 - 0.25 * u;
        g.scale(sc, sc);
        g.globalAlpha *= u * (o.alpha ?? 1);
        S.seal(g, env, 0, 0, size, text, { font: 'Brush', cols: 1, step: 0.3, fs: [...text].length > 1 ? 0.28 : 0.62, ...o });
        g.restore();
    }

    return {
        SHOTS, shotAt, worldAt, camAt, villager, kid, V, KIDS, EDGE, SHOUTS, THREADS, PHONE, hAt, DECK, ROPE, ropeY,
        threadPts, drawThread, drawSnap, drawShout, drawSplash, glyph, drawCloud, drawRain, CLOUDS,
        MASKS, drawMasks, drawMaskFlights, oni, drawSleeve, drawSheetDrops, DROPS, FALL, kurokoAt, kurokoBars, kurokoStrings, kurokoLash, paintWorld, shedPetals, floatingPetals, writeText, writeVertical, stamp, bezier, hump, seg,
    };
})();
