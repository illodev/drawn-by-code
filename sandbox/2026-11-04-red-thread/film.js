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
            red: keysAt([[0, 1], [27, 1], [31, 0], [52, 0], [57, 1], [68, 1]], t),
            dark: keysAt([[0, 0], [26.6, 0], [31.6, 0.82], [32, 0.8], [36, 0.32], [50, 0.3], [56, 0], [68, 0]], t),
            bloom: keysAt([[0, 1], [26.5, 1], [31, 0], [57, 0], [62, 1], [68, 1]], t),
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
        4: [[26, 1250, 640, 1.12], [32, 1250, 560, 0.86]],
        5: [[32, 1250, 520, 0.78], [33.8, 1150, 515, 0.86], [36, 655, 522, 1.13]],
        7: [[43, 1258, 486, 0.8], [44.6, 720, 600, 1.25], [46.4, 760, 600, 1.25], [48.6, 1830, 610, 1.25], [50, 1810, 600, 1.18]],
        8: [[50, 1250, 540, 0.8], [57, 1250, 560, 0.86]],
        9: [[57, 1250, 640, 1.38], [62, 1250, 630, 1.48]],
        10: [[62, 1250, 610, 1.3], [64, 1250, 560, 0.9], [68, 1250, 520, 0.76]],
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
        return { cx: f(1), cy: f(2), z: f(3) };
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
        womanL: { kind: 'woman', base: 215, keys: [[0, 700, 742], [5, 700, 742], [6.2, 840, D], [7.6, 1190, D], [8.4, 1190, D], [9.6, 1600, D], [10.6, 1800, 762], [20, 1800, 762], [20.8, 1660, D], [23.2, 850, D], [24.2, 620, 790], [25.4, 640, 800], [32, 640, 800], [32.05, -200, 800], [50, -200, 800], [51.2, 300, 810], [62, 300, 810], [63.3, 990, R_], [66.0, 1520, R_], [66.8, 1700, 700]] },
        womanR: { kind: 'woman', base: 215, keys: [[0, 1850, 770], [5, 1850, 770], [6.2, 1660, D], [7.6, 1290, D], [8.4, 1290, D], [9.6, 900, D], [10.6, 720, 762], [20.3, 720, 762], [21.0, 840, D], [23.4, 1650, D], [24.4, 1950, 800], [25.4, 1910, 820], [32, 1910, 820], [32.05, 2750, 820], [50, 2750, 820], [51.2, 2150, 815], [62, 2150, 815], [62.9, 1530, R_], [65.8, 1000, R_], [66.6, 820, 700]] },
        kasaL: { kind: 'man', base: 235, keys: [[0, 520, 780], [6.5, 520, 780], [7.5, 840, D], [8.9, 1180, D], [9.5, 1180, D], [10.9, 1630, D], [11.8, 1950, 800], [20.6, 1950, 800], [21.5, 1670, D], [24.0, 840, D], [25.0, 720, 790], [42.9, 720, 790], [42.95, 160, 770], [44.0, 740, 712], [46.6, 740, 712], [47.4, 520, 730], [62, 520, 730]] },
        kasaR: { kind: 'man', base: 235, keys: [[0, 2050, 790], [6.5, 2050, 790], [7.5, 1670, D], [8.9, 1300, D], [9.5, 1300, D], [10.9, 870, D], [11.8, 560, 800], [20.6, 560, 800], [21.5, 830, D], [24.0, 1660, D], [25.0, 1820, 800], [42.9, 1820, 800], [42.95, 2380, 800], [46.7, 2380, 800], [47.6, 1800, 728], [49.4, 1800, 728], [49.95, 2060, 745], [62, 2060, 745]] },
        manL2: { kind: 'man', base: 225, keys: [[0, 300, 800], [12, 300, 800], [13.2, 840, D], [15.0, 1235, D], [15.4, 1205, D], [15.6, 1205, D], [17.0, 1650, D], [18, 1800, 770], [21.0, 1800, 770], [21.8, 1680, D], [24.2, 840, D], [25.2, 560, 780], [32, 560, 780], [32.05, -260, 790], [50, -260, 790], [51.6, 180, 790], [62, 180, 790]] },
        manR2: { kind: 'man', base: 225, keys: [[0, 2200, 800], [12, 2200, 800], [13.2, 1670, D], [15.0, 1265, D], [15.4, 1295, D], [15.6, 1295, D], [17.0, 860, D], [18, 700, 780], [21.0, 700, 780], [21.8, 830, D], [24.2, 1670, D], [25.2, 1990, 800], [32, 1990, 800], [32.05, 2800, 800], [50, 2800, 800], [51.6, 2280, 795], [62, 2280, 795]] },
        oldW: { kind: 'elder', base: 195, keys: [[0, 380, 770], [26, 380, 770], [42.9, 380, 770], [42.95, 220, 800], [44.6, 220, 800], [45.8, 760, 815], [62, 760, 815]] },
        oldM: { kind: 'elderm', base: 205, keys: [[0, 2150, 790], [42.9, 2150, 790], [42.95, 2400, 820], [47.4, 2400, 820], [48.8, 1800, 835], [62, 1800, 835]] },
    };
    // shot 5: everyone at the river's edge, facing the other bank
    const EDGE = { kasaL: [720, 790], womanL: [640, 800], manL2: [560, 780], oldW: [380, 770], kasaR: [1820, 800], womanR: [1910, 820], manR2: [1990, 800], oldM: [2150, 790] };
    const HOME_FACE = { womanL: 1, kasaL: 1, manL2: 1, oldW: 1, womanR: -1, kasaR: -1, manR2: -1, oldM: -1 };
    // who holds a phone, when (they take it out, and later let it fall)
    const PHONE = {
        womanL: [12.5, 50.5], womanR: [13.0, 51.0], kasaL: [13.6, 51.6], kasaR: [14.2, 52.1],
        manL2: [11.0, 52.6], manR2: [11.0, 53.1],
    };
    const BOWS = { womanL: [7.6, 8.4], womanR: [7.6, 8.4], kasaL: [8.9, 9.5], kasaR: [8.9, 9.5] };
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
        const h = v.base * hAt(y);
        const face = p.moving && p.dir ? p.dir : (t >= 25 && t < 62 ? HOME_FACE[id] : p.dir || HOME_FACE[id]);
        const f = { x, y, h, face, kind: v.kind, id, t, lean: 0, look: 0, ink: 0.95 };
        if (v.kind === 'elder' || v.kind === 'elderm') {
            f.lean = 0.28;
            f.cane = true;
            f.look = 0.2;
        }
        if (p.moving) walk(f, p.dist, v.base);
        // bow when greeting on the bridge
        const b = BOWS[id];
        if (b) {
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
                const dt = t - PHONE[id][1] - 0.3;
                const fallY = Math.min(y - 3, held[1] + 0.5 * 2400 * Math.max(0, dt) ** 2);
                f.phoneAt = [held[0] + face * h * 0.05, fallY];
                f.phoneRot = 1.3;
                f.glow = Math.max(0, 1 - (t - PHONE[id][1]) * 0.8);
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
        girl: { kind: 'girl', base: 175, keys: [[0, 650, 820], [9.0, 650, 820], [10.0, 840, D], [11.4, 1450, D], [12.2, 1640, D], [12.9, 1780, 800], [20, 1780, 800], [20.9, 1680, D], [23.3, 880, D], [24.3, 600, 830], [25.4, 600, 840], [32, 600, 840]] },
        boy: { kind: 'boy', base: 185, keys: [[0, 700, 830], [9.0, 700, 830], [10.0, 885, D], [11.4, 1495, D], [12.2, 1690, D], [12.9, 1900, 790], [26, 1900, 790], [32, 1900, 790]] },
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
        ['womanL', 'womanR', 8.0, 12.8, 27.5, 54.0],
        ['kasaL', 'kasaR', 9.2, 13.9, 28.5, 54.5],
        ['oldW', 'oldM', 10.8, null, 29.5, 55.0],
        ['girl', 'boy', 9.3, 15.8, 31.0, null],
        ['manL2', 'manR2', null, null, null, 55.5],
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

    // --- the world, painted back to front ----------------------------------------------------
    function darkWater(g, env, d) {
        if (d <= 0) return;
        g.save();
        g.fillStyle = S.tone(0.78 * d);
        g.fillRect(-800, RT.HORIZON, 4000, 700);
        g.globalAlpha = d;
        RT.water(g, env);               // its bands again: the black water keeps its texture
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
        if (o.cranesT != null) RT.cranes(g, env, o.cranesT);
        if (o.clouds) {
            drawCloud(g, env, 'L', o.clouds.L, t);
            drawCloud(g, env, 'R', o.clouds.R, t);
        }
        RT.landscape(g, env);
        RT.water(g, env);
        darkWater(g, env, w.dark);
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
        paintWorld, shedPetals, floatingPetals, writeText, writeVertical, stamp, bezier, hump, seg,
    };
})();
