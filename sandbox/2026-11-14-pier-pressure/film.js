// pier-pressure · the opening's shots other than Kit's drop (scene.js has that one and the edit).
// Global: Film. Load after toon.js, drawn.js, the cast, kit-act.js, cam.js and set.js.
//
// Every harbour shot is the same world (set.js, placed in metres through cam.js) seen through a
// view: a point of the frame brought to its centre and a zoom. The set's cached layers are
// painted again at the zoom's resolution (env.k × zs), so a close shot is as sharp as the wide.
// Each shot takes its own local time u (seconds from its cut) and draws the whole frame.
const Film = (() => {
    const T = SkateToon, C = T.COL, G = 9.81;
    const twos = (t, at = 0) => at + Math.floor((t - at) * 12 + 1e-6) / 12; // t held on twos from `at`
    const nth = (t, at = 0) => Math.round((twos(t, at) - at) * 12); // the drawing's number since `at`
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
    const ease = (k) => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };

    // The cast's drawings: pixels of drawing per metre (measured on the standing pose: top of the
    // figure to its soles) and each pose's anchor in its own pixels: the point between the soles
    // of a standing pose, the middle of a flying one.
    // (a pose from a later sheet has a third number: that sheet's own pixels per metre)
    const CAPM = 1300;
    const M = {
        hoagie: { m: 658 / 1.32, film: [385, 660], jump: [330, 335], run: [200, 490, 380], skid: [185, 485, 380], proud: [175, 508, 380] },
        milo: { m: 702 / 1.62, stand: [316, 706], fall: [362, 327], crouch: [200, 515, 413], smug: [190, 677, 413], run: [250, 565, 413] },
        pip: { m: 659 / 1.12, stand: [300, 664], ride: [300, 652], push: [250, 530, 451], lolly: [210, 547, 451], wink: [185, 542, 451] },
        dot: { m: 697 / 1.8, stand: [206, 706], serve: [296, 706], basket: [225, 625, 344], salt: [190, 606, 344], yell: [215, 645, 344] },
        captain: { m: 525 / 0.46, perch: [170, 527], fly: [384, 324], ready: [155, 351, CAPM], launch: [150, 607, CAPM], down: [226, 210, CAPM] },
        kit: { m: 500, stand: [235, 708], jump: [370, 360], push: [280, 519, 388], glide: [215, 486, 388], point: [250, 597, 388] },
    };
    // a drawing with its anchor on a point of the frame; o: rot, sx, sy (about the anchor), flip
    function put(g, who, pose, x, y, s, o = {}) {
        const a = M[who][pose];
        s *= M[who].m / (a[2] ?? M[who].m);
        g.save();
        g.translate(x, y);
        if (o.rot) g.rotate(o.rot);
        g.scale((o.flip ? -1 : 1) * (o.sx ?? 1), o.sy ?? 1);
        Drawn.draw(g, who, pose, -a[0] * s, -a[1] * s, s, { weight: o.weight, only: o.only, hide: o.hide });
        g.restore();
    }
    // ... and on a point of the world, at its size there
    const put3 = (g, who, pose, [X, Y, Z], o = {}) => {
        const [x, y] = Cam.pt([X, Y, Z]);
        put(g, who, pose, x, y, (Cam.scale(Z) / M[who].m) * (o.k ?? 1), o);
    };

    // --- the view ---------------------------------------------------------------------------
    // f: the frame point at the centre; z: zoom; zs: the resolution the set is painted at (≥ z,
    // one value per shot: every new value paints the set again)
    function view(g, env, f, z, zs, fn) {
        const fx = clamp(f[0], 800 / z, 1600 - 800 / z), fy = clamp(f[1], 450 / z, 900 - 450 / z);
        g.save();
        g.translate(800, 450);
        g.scale(z, z);
        g.translate(-fx, -fy);
        fn({ ...env, k: env.k * zs });
        g.restore();
    }

    // --- the world --------------------------------------------------------------------------
    const KIT = [-0.1, 0, 2.6], BOARD = [0.7, 0, 2.45], HOAGIE = [1.05, 0, 3.6], MILO = [-0.92, 0, 3.0];
    const kitRest = (t) => ({ z: KIT[2], draw(g) {
        const [x, y] = Cam.pt(KIT), [bx, by] = Cam.pt(BOARD);
        KitAct.pose(g, 'proud', x, y, (Cam.scale(KIT[2]) * 1.34) / 575, { sy: 1 + Motion.pulse(twos(t), 120, 0.05, 6) * 0.008 });
        KitAct.board(g, bx, by, (Cam.scale(BOARD[2]) * 1.4) / 700, 0);
    } });
    const hoagieRest = (t) => ({ z: HOAGIE[2], draw(g) { put3(g, 'hoagie', 'film', HOAGIE, { rot: Math.sin(twos(t) * Math.PI) * 0.025 }); } });
    const miloRest = (t) => ({ z: MILO[2], draw(g) { put3(g, 'milo', 'stand', MILO, { sy: 1 + Motion.pulse(twos(t), 120, 0.05, 6) * 0.006 }); } });
    // o.dot { pose, up, dx, weight }; o.actors [{ z, draw(g) }] (painted far to near, between the
    // set's back and its foreground); o.captain { h, weight } on his bollard, or null when away
    function world(g, env, t, o = {}) {
        const A = Harbor.AT;
        Harbor.back(g, env, t);
        {
            const d = o.dot ?? {}, pose = d.pose ?? 'stand', [, , dZ] = A.dot.foot, [dx, dy] = Cam.pt(A.dot.foot), ds = Cam.scale(dZ) / M.dot.m;
            g.save();
            g.beginPath();
            A.dot.hatch.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
            g.closePath();
            g.clip();
            put(g, 'dot', pose, dx + (d.dx ?? 0), dy - (d.up ?? 7), ds, { weight: d.weight, sy: d.sy });
            g.restore();
            Harbor.counter(g, env);
        }
        for (const a of [...(o.actors ?? [])].sort((p, q) => q.z - p.z)) a.draw(g);
        Harbor.fore(g, env, t);
        if (o.captain !== null) {
            const top = A.bollard.top;
            put3(g, 'captain', 'perch', [top[0], top[1] + (o.captain?.h ?? 0), top[2]], { only: ['bird'], weight: o.captain?.weight, sy: o.captain?.sy });
        }
    }
    // Captain in flight, his body's middle on (x, y): wings up (his model sheet's drawing) and
    // wings down (a key pose), two drawings each. With the cone of chips, the cone is a part of
    // the first drawing, and is carried under the second one's feet too
    function capFly(g, t, x, y, s, o = {}) {
        const up = (nth(t) >> 1) % 2 === 0, cone = o.cone !== false;
        g.save();
        g.translate(x, y + (up ? 0 : -30 * s)); // the body lifts as the wings come down
        g.rotate(o.rot ?? 0);
        if (up) put(g, 'captain', 'fly', 0, 0, s, cone ? {} : { hide: ['cone'] });
        else {
            // the two sheets draw him at different sizes: matched here on his head (1.62)
            const k = s * 1.45, a = M.captain.down;
            Drawn.draw(g, 'captain', 'down', -a[0] * k, -a[1] * k, k);
            // the cone and the feet that hold it (their grip is at 204, 464 of the first drawing), on
            // his trailing feet; the leg that comes with the foot is cut off above the ankle
            if (cone) {
                const ox = (45 - a[0]) * k - 204 * s, oy = (150 - a[1]) * k - 464 * s;
                g.beginPath();
                g.rect(ox, oy + 432 * s, 769 * s, 300 * s);
                g.clip();
                Drawn.draw(g, 'captain', 'fly', ox, oy, s, { only: ['cone'] });
            }
        }
        g.restore();
    }
    const hop = (u, v) => (u < 0 || u > (2 * v) / G ? 0 : v * u - (G * u * u) / 2); // a jump's height, in metres

    // a puff of dust on the frame: a ring of lumps that spread and shrink (k: 0 at the hit … 1 gone)
    function puff(g, px, py, k, n, size, key) {
        if (k < 0 || k >= 1) return;
        for (let i = 0; i < n; i++) {
            const a = Math.PI * (1.05 + (0.9 * i) / (n - 1)), spread = (0.35 + 0.65 * (1 - (1 - k) * (1 - k))) * size * 3.2, r = size * (1 - k) * (0.7 + 0.3 * ((i * 7) % 3) / 2);
            if (r < 2.5) continue;
            const x = px + Math.cos(a) * spread * 1.5, y = py + Math.sin(a) * spread * 0.38 - size * 0.3;
            T.shape(g, [[x - r, y], [x - r * 0.6, y - r * 0.8], [x, y - r * 0.6], [x + r * 0.5, y - r * 0.95], [x + r, y - r * 0.1], [x + r * 0.6, y + r * 0.5], [x - r * 0.4, y + r * 0.55]], { fill: C.white, w: T.LINE_BG, seed: key + i });
        }
    }

    // --- a name card, slammed onto the frame at `at` -----------------------------------------
    // A plate with its shadow on a white burst that turns a tooth every other drawing; the name
    // in block capitals with a side to them, landing a letter a frame; the role on a ribbon that
    // unrolls after it; a zigzag, dots and a triangle thrown around. o: fill (the plate), second
    // (the letters), drop (their sides), ink (the role), tilt, k
    const star = (rx, ry, inner, n, a0) => Array.from({ length: n * 2 }, (_, i) => {
        const a = a0 + (i / (n * 2)) * Math.PI * 2, r = i % 2 ? inner : 1;
        return [Math.cos(a) * rx * r, Math.sin(a) * ry * r, 1];
    });
    function block(g, str, x, y, o) {
        // capitals with a side: the side is the same letters, three times, down and to the right
        for (const d of [10, 6.5, 3]) T.sign(g, str, x + d, y + d, { ...o, fill: o.drop, w: o.w * 0.9 });
        return T.sign(g, str, x, y, o);
    }
    function card(g, t, at, name, role, x, y, o = {}) {
        if (t < at) return;
        const d = nth(t, at), dc = Math.min(3, d), beat = Motion.pulse(twos(t), 120, 0.05, 8);
        const k = [0.5, 1.18, 0.94, 1][dc] * (o.k ?? 1) * (1 + beat * 0.025);
        const size = Math.min(176, 500 / (name.length * 0.56)), nw = name.length * size * 0.56, hw = Math.max(nw / 2 + 52, 190), hh = size * 0.62;
        const fill = o.fill ?? C.magenta, second = o.second ?? C.roadLine, drop = o.drop ?? C.navy;
        g.save();
        g.translate(x, y);
        g.rotate((o.tilt ?? -0.06) + [0.12, -0.04, 0.012, 0][dc]);
        g.scale(k, k);
        T.shape(g, star(hw * 1.36, hh * 2.05, 0.8, 13, (d >> 1) * 0.12), { fill: C.white, w: T.LINE * 1.2, seed: 'burst' + name, amp: 0.15 });
        const Q = [[-hw, -hh + 4], [hw - 6, -hh - 14], [hw + 10, hh * 0.72], [-hw + 10, hh * 0.9]];
        T.slab(g, Q.map(([a, b]) => [a + 12, b + 14]), { fill: C.ink, seed: 'shade' + name, over: 1, w: T.LINE });
        T.slab(g, Q, { fill, seed: 'card' + name, over: 2.4, w: T.LINE * 1.3 });
        T.slab(g, [[-hw + 15, -hh + 17], [hw - 20, -hh + 2], [hw - 7, hh * 0.58], [-hw + 23, hh * 0.75]], { fill: null, seed: 'rule' + name, over: 0.5, w: T.LINE_FINE, color: second });
        // thrown around it
        if (d >= 2) {
            const zz = Array.from({ length: 7 }, (_, i) => [hw * 0.62 + i * 22, -hh - 46 - (i % 2) * 24, 1]);
            T.line(g, zz, { w: T.LINE * 2.6, seed: 'zz' + name, color: C.ink });
            T.line(g, zz, { w: T.LINE * 1.2, seed: 'zz' + name, color: second });
            for (let i = 0; i < 3; i++) T.shape(g, star(11, 11, 1, 5, 0).map(([a, b]) => [a - hw - 34 + i * 6, b - hh * 0.5 + i * 34]), { fill: [second, C.white, fill][i], w: T.LINE_BG, seed: 'dot' + name + i });
            T.shape(g, [[-hw * 0.8, -hh - 58, 1], [-hw * 0.8 + 44, -hh - 40, 1], [-hw * 0.8 + 8, -hh - 14, 1]], { fill: second, w: T.LINE, seed: 'tri' + name });
        }
        if (d >= 1) block(g, name.slice(0, d), -nw / 2 + 2, hh * 0.4, { size, fill: second, drop, seed: 'name' + name, w: T.LINE * 1.1, track: 0.06, tilt: 0.06, align: 'left' });
        // the role, on a ribbon with swallow tails
        const rd = d - Math.min(name.length, 5) - 1;
        if (rd >= 0) {
            const rw = role.length * 10.8 + 20, ry = hh * 0.68, rk = [0.6, 1.12, 1][Math.min(2, rd)];
            g.save();
            g.translate(hw * 0.12, ry + 26);
            g.rotate(-0.035);
            g.scale(rk, rk);
            T.shape(g, [[-rw - 34, -26, 1], [rw + 30, -30, 1], [rw + 8, 0, 1], [rw + 34, 26, 1], [-rw - 30, 30, 1], [-rw - 8, 2, 1]], { fill: o.ribbon ?? C.white, w: T.LINE, seed: 'ribbon' + name, amp: 0.2 });
            T.sign(g, role, 2, 15, { size: 46, fill: o.ink ?? C.red, seed: 'role' + name, w: T.LINE_FINE * 0.8, track: 0.035, tilt: 0.03, outline: o.ribbon ?? C.white });
            g.restore();
        }
        g.restore();
    }
    // an entrance on twos: slides in from `from` frame units away, squashing as it stops
    const enter = (u, from) => {
        const d = Math.min(4, Math.max(0, Math.round(u * 12)));
        return { dx: [1, 0.42, 0.08, -0.03, 0][d] * from, sx: [0.92, 0.94, 1.07, 0.98, 1][d], sy: [1.08, 1.06, 0.93, 1.02, 1][d] };
    };

    // from one framing to another over n frames, slowing into it ({ f: [x, y], z })
    const move = (u, A, B, n) => {
        const k = 1 - Math.pow(1 - clamp((u * 24) / n, 0, 1), 3);
        return { f: [lerp(A.f[0], B.f[0], k), lerp(A.f[1], B.f[1], k)], z: A.z * Math.pow(B.z / A.z, k) };
    };
    const WIDE = { f: [800, 450], z: 1 }, F_HOAGIE = { f: [1000, 500], z: 1.35 }, F_MILO = { f: [520, 440], z: 1.45 };

    // === 1 · Gull Harbor (4 s): the sign; the camera cranes down and back to the quay =============
    function harbor(g, t, u, env) {
        const k = ease((u - 1.4) / 1.3), c = { f: [lerp(1150, 800, k), lerp(205 + 40 * Math.min(1, u / 1.4), 450, k)], z: 2 * Math.pow(0.5, k) };
        // Dot comes up behind her counter once it is in sight; Captain keeps watch
        view(g, env, c.f, c.z, 2, (e) => world(g, e, t, { dot: { up: -70 + 77 * ease((twos(u) - 2.9) / 0.34) }, captain: { h: hop(twos(u, 3.5) - 3.5, 1.1) } }));
    }

    // === 3 · Hoagie (2 s): through his viewfinder, then the boy behind it =========================
    // what a camcorder sees: the viewfinder's corners, REC
    function viewfinder(g, t) {
        const m = 70, L = 90;
        g.save();
        g.lineCap = 'round';
        for (const [w, col] of [[11, C.ink], [5, C.white]]) {
            g.strokeStyle = col;
            g.lineWidth = w;
            g.beginPath();
            for (const [x, y, sx, sy] of [[m, m, 1, 1], [1600 - m, m, -1, 1], [m, 900 - m, 1, -1], [1600 - m, 900 - m, -1, -1]]) {
                g.moveTo(x + sx * L, y);
                g.lineTo(x, y);
                g.lineTo(x, y + sy * L);
            }
            g.stroke();
        }
        g.restore();
        if (nth(t) % 6 < 4) T.shape(g, Array.from({ length: 12 }, (_, i) => [128 + Math.cos(i * 0.5236) * 17, 152 + Math.sin(i * 0.5236) * 17]), { fill: C.red, w: T.LINE, seed: 'rec' });
        T.sign(g, 'REC', 158, 172, { size: 58, fill: C.white, seed: 'rec-t', w: T.LINE, align: 'left', tilt: 0.02 });
    }
    // a character's own card to stand on: their colour, rays turning behind them on twos, a row
    // of dots, a floor with their shadow on it
    function stage(g, d, x, y, col, deep, o = {}) {
        g.fillStyle = col;
        g.fillRect(0, 0, 1600, 900);
        g.fillStyle = deep;
        const n = 12, a0 = d * 0.03;
        for (let i = 0; i < n; i++) {
            const a = a0 + (i / n) * Math.PI * 2, b = a + Math.PI / n;
            g.beginPath();
            g.moveTo(x, y - 380);
            g.lineTo(x + Math.cos(a) * 2400, y - 380 + Math.sin(a) * 2400);
            g.lineTo(x + Math.cos(b) * 2400, y - 380 + Math.sin(b) * 2400);
            g.closePath();
            g.fill();
        }
        // dots thinning out from a corner
        g.fillStyle = o.dots ?? C.white;
        for (let i = 0; i < 9; i++) for (let j = 0; j < 6; j++) {
            const r = 15 - i * 1.3 - j * 1.6;
            if (r > 1.5) { g.beginPath(); g.arc(1560 - i * 46 - (j % 2) * 23, 40 + j * 40, r, 0, 6.3); g.fill(); }
        }
        T.slab(g, [[-20, y - 28], [1620, y - 62], [1620, 920], [-20, 920]], { fill: o.floor ?? C.navy, seed: 'stage-floor', over: 0, w: T.LINE * 1.4 });
        g.fillStyle = 'rgba(0, 0, 0, 0.28)';
        g.beginPath();
        g.ellipse(x, y + 6, 250 * (o.shadow ?? 1), 30, 0, 0, 6.3);
        g.fill();
    }

    // === 3 · Hoagie (2 s) =============================================================================
    // We have been looking through his camcorder: the camera comes back out of its lens and there
    // he is, filming; he turns the camcorder round to us, peeks over it, sinks, and on the third
    // beat the thumb is up. Frame by frame: eight drawings of his own for this bar (two sequences
    // of four consecutive frames, cast/hoagie-turn-drawn.js and hoagie-thumb-drawn.js), each on
    // the frame for as long as the exposure sheet below says. Nothing is bent, slid or squashed:
    // what moves is the drawing changing. `prev` paints the shot before.
    //   [first frame, drawing]: t1 filming to the side · t2 turning · t3 the lens at us · t4 peeking
    //   over it · a1 the anticipation · a2 the thumb, up on his toes · a3 settled · a4 a blink
    const HOAGIE_X = [[0, 't1'], [10, 't2'], [12, 't3'], [18, 't4'], [21, 'a1'], [24, 'a2'], [28, 'a3'], [36, 'a4'], [38, 'a3'], [44, 'a1']];
    // each drawing's place between the soles (its own pixels) and its pixels per metre (the two
    // sheets were drawn at slightly different sizes)
    const HOAGIE_AT = { t1: [180, 497, 345], t2: [150, 496, 345], t3: [146, 478, 345], t4: [141, 479, 345], a1: [141, 416, 339], a2: [141, 512, 339], a3: [136, 454, 339], a4: [137, 448, 339] };
    function hoagie(g, t, u, env, prev) {
        const f = Math.round(u * 24), X = 640, Y = 838, PPM = 540, HIT = 24;
        stage(g, nth(t), X, Y, C.orange, '#e0661f', { floor: C.maroon });
        const name = HOAGIE_X.filter(([at]) => f >= at).pop()[1], [ax, ay, m] = HOAGIE_AT[name], s = PPM / m;
        Drawn.draw(g, 'hoagie', name, X - ax * s, Y - ay * s, s, { halo: { color: C.white, w: 9 } });
        if (f >= HIT && f < HIT + 6) for (let i = 0; i < 5; i++) {
            // the thumb lands: ticks round it
            const n = f - HIT, a = -2.5 + i * 0.5, r0 = 100 + n * 9, r1 = r0 + 40 - n * 5, cx = X + 200, cy = 110;
            T.line(g, [[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], { w: T.LINE * 1.3, seed: 'thumb' + i, color: C.white });
        }
        card(g, u, 1, 'HOAGIE', 'STILL ROLLING', 1215, 560, { fill: C.maroon, drop: C.ink, second: C.roadLine, k: 1.05, tilt: -0.05 });
        // out of the lens: what the shot before showed shrinks into the glass of his camcorder
        if (prev && f < 9) {
            const r = [1000, 600, 340, 190, 108, 66, 44, 36, 36][f], k = Math.min(1, f / 6), [lx, ly] = [33, 110], s1 = PPM / HOAGIE_AT.t1[2];
            const cx = lerp(800, X + (lx - HOAGIE_AT.t1[0]) * s1, k * k), cy = lerp(450, Y + (ly - HOAGIE_AT.t1[1]) * s1, k * k);
            g.save();
            g.beginPath();
            g.arc(cx, cy, r, 0, 6.3);
            g.clip();
            g.translate(cx, cy);
            g.scale(r / 918, r / 918);
            g.translate(-800, -450);
            prev(g);
            viewfinder(g, t);
            g.restore();
            g.beginPath();
            g.arc(cx, cy, r, 0, 6.3);
            g.strokeStyle = C.ink;
            g.lineWidth = Math.max(6, r * 0.09);
            g.stroke();
        }
    }

    // === 4 · Milo (2 s): the plan, and the plan going wrong =========================================
    function milo(g, t, u, env) {
        // on one knee, a last turn of the spanner; up, a foot on the board, pleased with it; and
        // on the next beat the board has other ideas
        const d = nth(u), GO = 1.25, v = twos(u, GO) - GO, V0 = 3.1, tf = (2 * V0) / G;
        view(g, env, F_MILO.f, F_MILO.z, 1.6, (e) => world(g, e, t, { actors: [kitRest(t), { z: MILO[2], draw(gg) {
            if (u < 0.5) put3(gg, 'milo', 'crouch', MILO, { rot: [0, 0.02, 0, -0.012][d % 4], sy: d % 4 === 1 ? 0.985 : 1 });
            else if (v < 0) {
                const k = Math.min(3, nth(u, 0.5));
                put3(gg, 'milo', 'smug', MILO, { sx: [0.94, 1.04, 0.99, 1][k], sy: [1.08, 0.95, 1.01, 1][k] * (1 + Motion.pulse(twos(u), 120, 0.05, 6) * 0.008) });
            } else if (v < tf) {
                // up he goes, heels over head, the board its own way
                put3(gg, 'milo', 'fall', [MILO[0] + 0.1 - v * 0.25, 0.8 + V0 * v - (G * v * v) / 2, MILO[2]], { rot: -0.25 - v * 2.6 });
            } else {
                const k = Math.min(2, nth(v, tf));
                put3(gg, 'milo', 'crouch', [MILO[0] - 0.1, 0, MILO[2]], { sx: [1.1, 0.97, 1][k], sy: [0.86, 1.04, 1][k] });
            }
        } }] }));
        card(g, u, 1, 'MILO', 'HAS A PLAN', 1270, 730, { fill: C.blue, drop: C.navy, ink: C.navy, k: 0.82 });
    }

    // === 5 · Pip (2 s): through the lot of them, without looking up ==================================
    const pipRide = (t, X, Z, pose = 'ride') => ({ z: Z, draw(g) {
        const d = nth(t), [x, y] = Cam.pt([X, 0, Z]);
        // what she leaves behind her: three lines of speed
        for (let i = 0; i < 3; i++) T.line(g, [[x - 250 - i * 34 - (d % 2) * 26, y - 70 - i * 92], [x - 400 - i * 60 - (d % 2) * 26, y - 70 - i * 92]], { w: T.LINE, seed: 'pipspeed' + i });
        put3(g, 'pip', pose, [X, [0, 0.012][d % 2], Z], { rot: (pose === 'push' ? -0.03 : 0) + [0, 0.01][d % 2] });
    } });
    function pip(g, t, u, env) {
        // two pushes to get up to speed, then through the lot of them with her lollipop and her
        // eyes half shut; a look back at us on the last beat
        const X = -2.7 + twos(u) * 2.25, d = nth(u), pose = u < 0.5 ? (d % 3 === 2 ? 'ride' : 'push') : u < 1.25 ? 'lolly' : 'wink';
        const c = move(u, F_MILO, { f: [600, 520], z: 1.3 }, 8); // off Milo, and along with her
        view(g, env, [c.f[0] + 260 * ease(u / 2), c.f[1]], c.z, 1.6, (e) => world(g, e, t, { actors: [kitRest(t), hoagieRest(t), miloRest(t), pipRide(t, X, 3.05, pose)] }));
        card(g, u, 1, 'PIP', 'NOT BOTHERED', 1240, 250, { fill: C.green, drop: C.ink, second: C.lime, ink: C.maroon, tilt: 0.05 });
    }

    // === 6 · Aunt Dot (2 s): at her hatch; chips up ==================================================
    function dot(g, t, u, env) {
        const A = Harbor.AT, hx = A.dot.hatch.reduce((s, p) => s + p[0], 0) / A.dot.hatch.length, hy = A.dot.hatch.reduce((s, p) => s + p[1], 0) / A.dot.hatch.length;
        // a shake of the basket, salt from a height, and on the last beat the cone held out: chips up
        const d = nth(u), k = Math.min(3, nth(u, 1.25));
        // (she works at the middle of her hatch, clear of what stands on the counter, and the basket
        // comes up over the sill to be shaken)
        const act = u < 0.5 ? { pose: 'basket', up: 50 + [0, 9, 1, 7][d % 4], dx: -66 + [0, -2, 0, 2][d % 4] }
            : u < 1.25 ? { pose: 'salt', up: 22 + [3, 0][d % 2], dx: -62, sy: d === 6 ? 1.04 : 1 }
            : { pose: 'serve', up: 12 + [16, -3, 2, 0][k], dx: -70, sy: [1.06, 0.97, 1.01, 1][k] };
        // (the hut is eight metres off: the others are left out of this one, they would stand in it)
        view(g, env, [hx + 46, hy + 6], 3.4, 3.4, (e) => world(g, e, t, { dot: { weight: 2.2, ...act } }));
        card(g, u, 1, 'AUNT DOT', 'MIND THE CURVE', 1240, 720, { fill: C.red, drop: C.maroon });
    }

    // === 7 · Captain (2 s): on his bollard, then off it =============================================
    function captain(g, t, u, env) {
        // he has smelt the chips (they are at the hut, to the left): a look, down into a crouch
        // with his one eye on them, and off the bollard on the bar's last beat, wings up, wings down
        const top = Harbor.AT.bollard.top, v = twos(u, 1.5) - 1.5;
        view(g, env, [1330, 430], 2.4, 3.4, (e) => {
            world(g, e, t, { captain: null });
            if (u < 0.5) put3(g, 'captain', 'perch', top, { only: ['bird'], weight: 1.3, sy: 1 + Motion.pulse(twos(u), 120, 0.05, 6) * 0.012 });
            else if (v < 0) {
                const k = Math.min(3, nth(u, 0.5));
                put3(g, 'captain', 'ready', top, { flip: true, weight: 1.3, sx: [1.1, 0.96, 1.01, 1][k], sy: [0.86, 1.05, 0.99, 1][k] * (1 - Motion.pulse(twos(u), 120, 0.05, 6) * 0.02) });
            } else {
                const k = nth(v), h = k === 0 ? 0.04 : 0.3 + (v - 1 / 12) * 6.5;
                if (k % 4 < 2) put3(g, 'captain', 'launch', [top[0] - v * 1.6, top[1] + h, top[2]], { flip: true, weight: 1.3, sy: k === 0 ? 1.1 : 1 });
                else put3(g, 'captain', 'down', [top[0] - v * 1.6, top[1] + h + 0.28, top[2]], { flip: true, weight: 1.3, rot: 0.5 });
            }
        });
        card(g, u, 1, 'CAPTAIN', 'WANTED', 430, 690, { fill: C.navy, drop: C.ink, ink: C.navy, ribbon: C.roadLine });
    }

    // === 8 · the break (3 s): he has the chips; after him ==============================================
    function chase0(g, t, u, env) {
        // Captain, from the hatch to over our heads
        const k = clamp((twos(u) - 0.25) / 1.25, 0, 1), kk = k * k, cp = [lerp(-2.9, 4.6, kk), lerp(1.75, 2.9, k) + Math.sin(k * 9) * 0.08, lerp(7.9, 2.0, kk)];
        const bird = (gg) => { if (k > 0 && k < 1) { const [bx, by] = Cam.pt(cp); capFly(gg, t, bx, by, (Cam.scale(cp[2]) / M.captain.m) * 1.25, { rot: -0.08 }); } };
        // the four set off, one after another: a drawing of anticipation, then gone
        const go = (at, speed) => {
            const v = twos(u, at) - at;
            return v < 0 ? null : v < 1 / 12 ? { dx: -0.05, sy: 0.9, sx: 1.08, v } : { dx: speed * (v - 1 / 12) * (0.6 + 3 * (v - 1 / 12)), sy: 1, sx: 1, v };
        };
        const gk = go(2, 3.2), gh = go(2.25, 3.2), gm = go(2.5, 3.2), start = hop(twos(u, 1) - 1, 0.9);
        const kitA = { z: KIT[2], draw(gg) {
            if (!gk) { kitRest(t).draw(gg); return; }
            // onto her board and away: three drawings of push, then the glide
            const k = nth(gk.v);
            if (k === 0) { const [x, y] = Cam.pt(KIT); KitAct.pose(gg, 'proud', x, y, (Cam.scale(KIT[2]) * 1.34) / 575, { sx: 1.06, sy: 0.92 }); KitAct.board(gg, ...Cam.pt(BOARD), (Cam.scale(BOARD[2]) * 1.4) / 700, 0); }
            else put3(gg, 'kit', k < 4 ? 'push' : 'glide', [KIT[0] + 0.6 + gk.dx, 0, KIT[2]], { rot: k < 4 ? -0.04 : 0 });
        } };
        const hoagieA = { z: HOAGIE[2], draw(gg) {
            if (!gh) put3(gg, 'hoagie', 'film', [HOAGIE[0], start, HOAGIE[2]], {});
            else if (gh.v < 1 / 12) put3(gg, 'hoagie', 'film', HOAGIE, gh);
            else put3(gg, 'hoagie', 'run', [HOAGIE[0] + gh.dx, [0, 0.07, 0.12, 0.05][nth(gh.v) % 4], HOAGIE[2]], { flip: true, rot: [0, 0.03, 0.05, 0.02][nth(gh.v) % 4] });
        } };
        const miloA = { z: MILO[2], draw(gg) {
            if (!gm) put3(gg, 'milo', 'stand', [MILO[0], start * 0.8, MILO[2]], {});
            else if (gm.v < 1 / 12) put3(gg, 'milo', 'stand', MILO, gm);
            else put3(gg, 'milo', 'run', [MILO[0] + 0.3 + gm.dx, [0, 0.07, 0.12, 0.05][nth(gm.v) % 4], MILO[2]], { rot: [0, -0.03, -0.05, -0.02][nth(gm.v) % 4] });
        } };
        const actors = [kitA, hoagieA, miloA];
        if (u >= 1.5) actors.push(pipRide(t, -4.2 + (twos(u) - 1.5) * 6.4, 3.05, nth(u) % 6 < 3 ? 'push' : 'ride'));
        if (cp[2] > 3.9) actors.push({ z: cp[2], draw: bird });
        view(g, env, [800, 470], 1.06, 1.6, (e) => {
            world(g, e, t, { actors, captain: null, dot: u < 0.5 ? { pose: 'serve', up: 12, dx: -70 } : { pose: 'yell', up: 14 + [14, -2, 3, 0][Math.min(3, nth(u, 0.5))] + [0, 3][nth(u) % 2], dx: -60 + [0, 2][nth(u) % 2] } });
            if (cp[2] <= 3.9) bird(g);
            for (const [gg, P] of [[gk, KIT], [gh, HOAGIE], [gm, MILO]]) if (gg) { const [px, py] = Cam.pt(P); puff(g, px, py, gg.v / 0.4, 6, 22, 'go' + P[0]); }
        });
    }

    // === the pier, side on ===========================================================================
    // sc: how far the camera has run along it (frame units); endX: where the pier ends on the frame
    // (null: it goes on); rise: the camera lifting off it (frame units)
    const DECK = 640, PX = 214; // the deck's line on the frame; frame units per metre here
    function pierSide(g, d, sc, endX = null, rise = 0) {
        g.fillStyle = C.sky;
        g.fillRect(0, 0, 1600, 900);
        g.save();
        g.translate(0, rise);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        const stroke = (w, col = C.ink) => { g.strokeStyle = col; g.lineWidth = w; g.stroke(); };
        const box = (x, y, w, h, fill, lw = T.LINE_BG) => { g.beginPath(); g.rect(x, y, w, h); g.fillStyle = fill; g.fill(); stroke(lw); };
        const poly = (pts, fill, lw = T.LINE_BG) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } stroke(lw); };
        const wrap = (x, span, lead = 300) => ((x % span) + span) % span - lead; // a layer that comes round again
        // --- the sky: clouds a long way off, gulls
        for (let i = 0; i < 4; i++) {
            const x = wrap(i * 620 + 200 - sc * 0.015, 2480), y = 150 + ((i * 97) % 3) * 70, k = 1 + (i % 2) * 0.35;
            T.shape(g, [[x, y + 30 * k], [x + 20 * k, y], [x + 70 * k, y - 8 * k], [x + 100 * k, y - 34 * k], [x + 160 * k, y - 30 * k], [x + 190 * k, y - 4 * k], [x + 250 * k, y + 4 * k], [x + 262 * k, y + 30 * k, 1], [x + 120 * k, y + 36 * k, 1]], { fill: C.white, w: T.LINE_BG, seed: 'cloud' + i, amp: 0.2 });
        }
        for (let i = 0; i < 5; i++) {
            const x = wrap(i * 430 + 90 - sc * 0.03, 2150), y = 90 + ((i * 53) % 4) * 46 + Math.sin(d * 0.4 + i) * 5, fl = (d + i) % 4 < 2 ? 9 : -4;
            g.beginPath(); g.moveTo(x - 20, y - fl); g.quadraticCurveTo(x - 9, y - 9, x, y); g.quadraticCurveTo(x + 9, y - 9, x + 20, y - fl); stroke(T.LINE_BG);
        }
        // --- the far shore: hills, the town along it, the lighthouse on its point
        g.beginPath();
        g.moveTo(-20, 560);
        for (let x = -20; x <= 1620; x += 20) { const w = x + sc * 0.06; g.lineTo(x, 506 - 26 * Math.sin(w / 170) - 12 * Math.sin(w / 61 + 1)); }
        g.lineTo(1620, 560);
        g.closePath();
        g.fillStyle = C.palmLight;
        g.fill();
        stroke(T.LINE_BG);
        for (let i = 0; i < 12; i++) {
            const x = wrap(i * 190 - sc * 0.06, 2280), hgt = 30 + ((i * 7) % 4) * 11, wd = 50 + ((i * 5) % 3) * 18, y = 526;
            if (i % 6 === 2) {
                // the lighthouse: hoops of red and white, a lamp room, a cap
                poly([[x + 6, y + 10], [x + 14, y - 96], [x + 40, y - 96], [x + 48, y + 10]], C.white);
                for (const [a, b] of [[0.2, 0.42], [0.62, 0.84]]) poly([[x + 6 + 8 * b, y + 10 - 106 * b], [x + 48 - 8 * b, y + 10 - 106 * b], [x + 48 - 8 * a, y + 10 - 106 * a], [x + 6 + 8 * a, y + 10 - 106 * a]], C.red);
                box(x + 16, y - 116, 22, 20, C.roadLine);
                poly([[x + 10, y - 116], [x + 27, y - 136], [x + 44, y - 116]], C.red);
                continue;
            }
            box(x, y - hgt, wd, hgt + 18, [C.teal, C.salmon, C.yellow, C.white, C.glass][i % 5]);
            poly([[x - 6, y - hgt], [x + wd / 2, y - hgt - 20], [x + wd + 6, y - hgt]], i % 2 ? C.red : C.road);
            box(x + wd * 0.2, y - hgt * 0.62, 11, 13, C.navy, T.LINE_FINE * 0.7);
            if (wd > 60) box(x + wd * 0.6, y - hgt * 0.62, 11, 13, C.navy, T.LINE_FINE * 0.7);
            if (i % 3 === 0) { g.beginPath(); g.arc(x + wd + 26, y - 22, 17, 0, 6.3); g.fillStyle = C.palm; g.fill(); stroke(T.LINE_BG); } // a tree beside it
        }
        // --- the sea: the far water, boats on it, the swell in three rows
        g.fillStyle = C.sea;
        g.fillRect(-10, 540, 1620, 900);
        g.fillStyle = C.seaDeep;
        g.fillRect(-10, 540, 1620, 30);
        g.beginPath(); g.moveTo(-10, 540); g.lineTo(1610, 540); stroke(T.LINE_BG);
        for (let i = 0; i < 3; i++) {
            const x = wrap(i * 900 + 500 - sc * 0.14, 2700, 400), y = 590 + [0, 2, 3, 2][(d + i) % 4], col = [C.red, C.white, C.orange][i];
            poly([[x, y - 18], [x + 150, y - 18], [x + 128, y + 12], [x + 18, y + 12]], col);
            box(x + 80, y - 50, 44, 32, C.white);
            box(x + 90, y - 42, 12, 12, C.glass, T.LINE_FINE * 0.7);
            g.beginPath(); g.moveTo(x + 46, y - 18); g.lineTo(x + 46, y - 92); stroke(T.LINE_BG);
            poly([[x + 46, y - 92], [x + 80, y - 82], [x + 46, y - 72]], C.roadLine, T.LINE_FINE);
            g.beginPath(); g.moveTo(x - 30, y + 14); g.quadraticCurveTo(x - 8, y + 6, x + 12, y + 14); g.moveTo(x + 136, y + 14); g.quadraticCurveTo(x + 156, y + 6, x + 180, y + 14); stroke(T.LINE_BG, C.foam);
        }
        for (const [row, y, par, gap] of [[0, 574, 0.12, 210], [1, 716, 0.3, 300], [2, 838, 0.55, 380]]) {
            for (let i = 0; i < 12; i++) {
                const x = wrap(i * gap + row * 97 - sc * par, gap * 8, 200), a = 26 + row * 16, lift = (d + i) % 2 ? 0 : 3;
                g.beginPath();
                g.moveTo(x, y + lift); g.quadraticCurveTo(x + a / 2, y - 9 - row * 3 + lift, x + a, y + lift); g.quadraticCurveTo(x + a * 1.5, y - 9 - row * 3 + lift, x + a * 2, y + lift);
                stroke(T.LINE_BG + row * 0.5, row ? C.foam : C.white);
            }
        }
        const x1 = endX ?? 1700, TOP = DECK - 30; // the deck's far edge on the frame
        // --- the pier's far side: its rail, a lifebuoy, lamps with bunting between them
        g.beginPath(); g.rect(-20, TOP - 104, x1 - 4, 9); g.rect(-20, TOP - 58, x1 - 4, 7); g.fillStyle = C.white; g.fill(); stroke(T.LINE_BG);
        for (let i = 0; i < 14; i++) {
            const x = wrap(i * 180 + 60 - sc, 2520);
            if (x > x1 - 26) continue;
            box(x - 6, TOP - 112, 12, 114, C.white);
            if (i % 5 === 1 && x < x1 - 120) {
                g.beginPath(); g.arc(x + 88, TOP - 76, 31, 0, 6.3); g.fillStyle = C.white; g.fill(); stroke(T.LINE_BG);
                for (let q = 0; q < 4; q++) { g.beginPath(); g.arc(x + 88, TOP - 76, 31, q * 1.571 + 0.35, q * 1.571 + 1.2); g.arc(x + 88, TOP - 76, 13, q * 1.571 + 1.2, q * 1.571 + 0.35, true); g.closePath(); g.fillStyle = C.red; g.fill(); stroke(T.LINE_FINE * 0.8); }
                g.beginPath(); g.arc(x + 88, TOP - 76, 13, 0, 6.3); g.fillStyle = C.sea; g.fill(); stroke(T.LINE_BG);
            }
        }
        const lamps = [];
        for (let i = 0; i < 6; i++) { const x = wrap(i * 840 + 300 - sc, 5040, 500); if (x < x1 - 60) lamps.push(x); }
        lamps.sort((a, b) => a - b);
        for (const [i, x] of lamps.entries()) {
            const nx = lamps[i + 1] ?? x + 840;
            // bunting to the next lamp, each flag hanging from the line
            const sag = (k) => [lerp(x, nx, k), 338 + 4 * 70 * k * (1 - k)];
            g.beginPath();
            for (let k = 0; k <= 1.001; k += 0.05) { const [bx, by] = sag(k); k ? g.lineTo(bx, by) : g.moveTo(bx, by); }
            stroke(T.LINE_FINE);
            for (let j = 1; j < 14; j++) {
                const [bx, by] = sag(j / 14 - 0.022), [cx, cy] = sag(j / 14 + 0.022), sw = Math.sin(d * 0.8 + j) * 5;
                if (cx < x1 - 20) poly([[bx, by], [cx, cy], [(bx + cx) / 2 + sw, (by + cy) / 2 + 42]], [C.red, C.roadLine, C.teal, C.magenta, C.white][j % 5], T.LINE_FINE);
            }
            box(x - 7, 350, 14, TOP - 350, C.road);
            box(x - 13, TOP - 26, 26, 26, C.road);
            poly([[x - 24, 350], [x + 24, 350], [x + 16, 304], [x - 16, 304]], C.glass);
            g.beginPath(); g.moveTo(x, 350); g.lineTo(x, 304); stroke(T.LINE_FINE);
            poly([[x - 30, 304], [x, 280], [x + 30, 304]], C.road);
            g.beginPath(); g.arc(x, 274, 6, 0, 6.3); g.fillStyle = C.road; g.fill(); stroke(T.LINE_BG);
        }
        // --- under the deck: braces, then piles with their weed and the water round them
        const piles = [];
        for (let i = 0; i < 9; i++) { const x = wrap(i * 280 - sc, 2520); if (x < x1 - 30) piles.push(x); }
        piles.sort((a, b) => a - b);
        for (const [i, x] of piles.entries()) {
            const nx = piles[i + 1];
            if (nx != null && nx - x < 300) for (const [ya, yb] of [[706, 858], [858, 706]]) {
                g.beginPath(); g.moveTo(x + 14, ya); g.lineTo(nx - 14, yb);
                stroke(16); stroke(10.5, C.woodDeep);
            }
        }
        for (const [i, x] of piles.entries()) {
            box(x - 18, DECK + 40, 36, 320, C.trunk, T.LINE);
            g.beginPath(); g.moveTo(x - 8, DECK + 70); g.lineTo(x - 8, DECK + 170); g.moveTo(x + 7, DECK + 110); g.lineTo(x + 7, DECK + 190); stroke(T.LINE_FINE * 0.8);
            box(x - 22, DECK + 58, 44, 13, C.kerb, T.LINE_BG); // an iron band
            // weed and barnacles where the tide reaches, and the water breaking round the pile
            poly([[x - 18, 826], [x - 9, 818], [x - 2, 828], [x + 8, 816], [x + 18, 827], [x + 18, 900], [x - 18, 900]], C.palm, T.LINE_BG);
            const lift = (d + i) % 2 ? 0 : 4;
            g.beginPath(); g.moveTo(x - 52, 872 + lift); g.quadraticCurveTo(x - 36, 858 + lift, x - 20, 870 + lift); g.moveTo(x + 20, 870 - lift); g.quadraticCurveTo(x + 38, 858 - lift, x + 54, 872 - lift); stroke(T.LINE, C.foam);
        }
        // --- the deck: its beam, its top with the planks' joints, their ends along the edge
        box(-20, DECK + 30, x1 + 20, 30, C.woodDeep, T.LINE);
        poly([[-20, TOP], [x1 - 6, TOP], [x1 + 8, DECK + 6], [-20, DECK + 6]], C.sand, T.LINE);
        g.beginPath();
        for (let i = 0; i < 40; i++) {
            const x = wrap(i * 46 - sc, 1840, 100);
            if (x < x1 - 4) { g.moveTo(x - 9, TOP + 2); g.lineTo(x, DECK + 4); }
        }
        stroke(T.LINE_FINE * 0.8, C.sandDeep);
        box(-20, DECK + 6, x1 + 28, 26, C.wood, T.LINE);
        g.beginPath();
        for (let i = 0; i < 40; i++) {
            const x = wrap(i * 46 - sc, 1840, 100);
            if (x < x1 + 6) { g.moveTo(x, DECK + 9); g.lineTo(x, DECK + 29); }
        }
        stroke(T.LINE_FINE * 0.9);
        for (let i = 0; i < 40; i++) { const x = wrap(i * 46 + 23 - sc, 1840, 100); if (x < x1) { g.beginPath(); g.arc(x, DECK + 19, 2.2, 0, 6.3); g.fillStyle = C.ink; g.fill(); } } // a nail in each
        // things left on the deck, against the rail
        for (let i = 0; i < 4; i++) {
            const x = wrap(i * 1260 + 700 - sc, 5040, 500);
            if (x > x1 - 160) continue;
            if (i % 2) {
                // a bench
                box(x, TOP - 58, 150, 12, C.teal); box(x, TOP - 34, 150, 10, C.teal); box(x + 8, TOP - 24, 10, 26, C.road); box(x + 132, TOP - 24, 10, 26, C.road);
            } else {
                // a stack of fish crates and a bucket
                box(x, TOP - 42, 78, 44, C.orange); box(x + 10, TOP - 82, 70, 40, C.blue);
                g.beginPath(); for (const yy of [TOP - 28, TOP - 14, TOP - 68, TOP - 56]) { g.moveTo(x + (yy < TOP - 42 ? 14 : 4), yy); g.lineTo(x + 74, yy); } stroke(T.LINE_FINE * 0.8);
                poly([[x + 96, TOP - 30], [x + 132, TOP - 30], [x + 126, TOP + 2], [x + 102, TOP + 2]], C.kerb);
            }
        }
        if (endX != null) {
            // the end: a last post and what it says
            box(endX - 96, TOP - 170, 12, 172, C.road);
            T.slab(g, [[endX - 180, TOP - 262], [endX - 4, TOP - 270], [endX, TOP - 168], [endX - 176, TOP - 160]], { fill: C.white, seed: 'endsign', over: 1.2, w: T.LINE });
            T.slab(g, [[endX - 170, TOP - 252], [endX - 14, TOP - 259], [endX - 11, TOP - 178], [endX - 167, TOP - 171]], { fill: null, seed: 'endrule', over: 0.4, w: T.LINE_FINE, color: C.red });
            T.sign(g, 'NO', endX - 90, TOP - 222, { size: 44, fill: C.red, seed: 'end-a', w: T.LINE_FINE * 0.8, tilt: 0.03, outline: C.white });
            T.sign(g, 'RUNNING', endX - 90, TOP - 182, { size: 40, fill: C.red, seed: 'end-b', w: T.LINE_FINE * 0.8, tilt: 0.03, outline: C.white });
        }
        g.restore();
    }
    // lines of speed across the frame
    function speed(g, d, n = 9) {
        for (let i = 0; i < n; i++) {
            const x = 1750 - ((d * 330 + i * 613) % 2100), y = 96 + ((i * 53) % 9) * 58;
            T.line(g, [[x, y], [x + 150 + (i % 3) * 60, y]], { w: T.LINE, seed: 'sp' + i });
        }
    }
    // the four of them and the gull, each its own way of going: x on the frame, y the deck's line
    const SK = { kit: PX / M.kit.m, hoagie: PX / M.hoagie.m, milo: PX / M.milo.m, pip: PX / M.pip.m, captain: (PX / M.captain.m) * 1.5 };
    const runner = {
        // Kit skates: three drawings of push, five of glide; near the end she has seen where he is going
        kit(g, t, x, y, o = {}) {
            const d = nth(t) % 8;
            if (o.point) put(g, 'kit', 'point', x, y - [0, 2][d % 2], SK.kit, { rot: [0, 0.012][d % 2] });
            else put(g, 'kit', d < 3 ? 'push' : 'glide', x + (d < 3 ? -8 + d * 4 : 0), y - (d === 3 ? 5 : 0), SK.kit, { rot: d < 3 ? -0.03 + d * 0.01 : [0.015, 0, -0.01, 0, 0.01][d - 3] });
        },
        // Pip: a push now and then, the rest of the time her lollipop
        pip(g, t, x, y, o = {}) { const d = nth(t); put(g, 'pip', o.point ? 'wink' : d % 12 < 3 ? 'push' : 'lolly', x, y - [0, 3][d % 2], SK.pip, { rot: d % 12 < 3 && !o.point ? -0.03 : 0 }); },
        // Hoagie runs in leaps; Milo has stopped running and is still going
        // Hoagie bounds along: two drawings on the ground, two in the air
        hoagie(g, t, x, y) {
            const d = nth(t) % 4;
            if (d < 2) put(g, 'hoagie', 'run', x, y - [0, 12][d], SK.hoagie, { flip: true, rot: [0.03, -0.02][d] });
            else put(g, 'hoagie', 'jump', x, y - 667 * SK.hoagie * 0.5 - [46, 26][d - 2], SK.hoagie, { rot: 0.06 });
        },
        milo(g, t, x, y) { const d = nth(t) % 4; put(g, 'milo', 'run', x, y - [0, 16, 26, 10][d], SK.milo, { rot: [0.02, -0.03, -0.06, -0.02][d] }); },
    };
    const flier = { kit: 'jump', pip: 'ride', hoagie: 'jump', milo: 'fall' };
    const inAir = (g, who, x, y, rot, k = 1) => {
        if (who === 'pip') put(g, 'pip', 'ride', x, y + 663 * SK.pip * 0.5 * k, SK.pip * k, { rot });
        else put(g, who, flier[who], x, y, SK[who] * k, { rot });
    };

    // === 9 · down the pier (5 s) ======================================================================
    const RUN = 1150; // the camera's speed along the pier, frame units per second
    const PACK = [['milo', 250], ['hoagie', 500], ['kit', 740], ['pip', 990]];
    function pier(g, t, u, env) {
        const d = nth(t), close = u >= 3, z = close ? 1.45 : 1, inn = close ? 0 : (1 - ease(u / 0.6)) * -900;
        g.save();
        if (close) { g.translate(800, 470); g.scale(z, z); g.translate(-700 + [0, 3][d % 2], -470 + [0, -4][d % 2]); }
        pierSide(g, d, u * RUN);
        speed(g, d, close ? 6 : 9);
        capFly(g, t, 1320 + Math.sin(twos(u) * 5) * 24 - inn * 0.4, 250 + Math.sin(twos(u) * 7) * 26, SK.captain, { rot: -0.05 });
        for (const [who, x] of PACK) runner[who](g, t + x / 100, x + inn * (1.4 - x / 1200), DECK - 10, { point: u >= 4 });
        g.restore();
    }

    // === 10 · the end of the pier (2 s): off it, one after another ========================================
    function leap(g, t, u, env) {
        const d = nth(t), END = 1000, stop = 0.75, uu = twos(u);
        const rise = u < 1.25 ? 0 : 300 * ease((u - 1.25) / 0.75);
        pierSide(g, d, 5 * RUN + Math.min(u, stop) * RUN, END + Math.max(0, stop - u) * RUN, rise);
        if (u < stop) speed(g, d, 7);
        g.save();
        g.translate(0, rise);
        const cv = Math.max(0, uu - 0.4);
        capFly(g, t, 1320 + cv * 260, 250 - cv * cv * 420, SK.captain, { rot: -0.25 });
        for (const [i, [who, x0]] of PACK.entries()) {
            const x = x0 + Math.max(0, uu - stop) * RUN, tl = stop + (END - x0) / RUN;
            if (uu < tl) { runner[who](g, t + x0 / 100, Math.min(x, END), DECK - 10, { point: true }); continue; }
            // off the end: up and out, the same arc for all four
            const v = uu - tl, ax = END + 40 + v * (190 + i * 90), ay = DECK - 150 - ((900 + i * 50) * v - 620 * v * v);
            inAir(g, who, ax, ay, -0.25 + v * 0.5);
            puff(g, END - 30, DECK, v / 0.3, 5, 16, 'off' + who);
        }
        g.restore();
    }

    // === 11 · in the air (2 s), and the title (to the end) ==============================================
    function burst(g, d, c = [800, 520]) {
        g.fillStyle = C.sky;
        g.fillRect(0, 0, 1600, 900);
        g.fillStyle = C.skyDeep;
        const n = 14, a0 = d * 0.035;
        for (let i = 0; i < n; i++) {
            const a = a0 + (i / n) * Math.PI * 2, b = a + Math.PI / n;
            g.beginPath();
            g.moveTo(c[0], c[1]);
            g.lineTo(c[0] + Math.cos(a) * 2200, c[1] + Math.sin(a) * 2200);
            g.lineTo(c[0] + Math.cos(b) * 2200, c[1] + Math.sin(b) * 2200);
            g.closePath();
            g.fill();
        }
    }
    const HANG = [['milo', 290, 300, -0.35, 1.45], ['kit', 650, 540, -0.05, 1.7], ['hoagie', 1150, 610, 0.08, 1.5], ['pip', 1340, 235, 0.1, 1.45]];
    function hang(g, t, u, env) {
        const d = nth(t), uu = twos(u);
        burst(g, d);
        // they have a second and a half of sky: up a little, slower, slower, and a look down
        const lift = 70 * (1 - Math.pow(1 - clamp(uu / 1.5, 0, 1), 2)) - (uu > 1.5 ? (uu - 1.5) * (uu - 1.5) * 500 : 0);
        capFly(g, t, 900 + Math.sin(uu * 3) * 30, 130 + Math.sin(uu * 4.2) * 14, SK.captain * 1.25, { rot: -0.06 });
        for (const [i, [who, x, y, rot, k]] of HANG.entries()) {
            const pop = [1.12, 0.96, 1][Math.min(2, nth(u, i / 8))];
            if (u < i / 8) continue;
            inAir(g, who, x, y - lift * (1 - i * 0.12) + Math.sin(uu * 2.6 + i * 2) * 7, rot + Math.sin(uu * 2 + i) * 0.03, k * pop);
        }
    }
    function title(g, t, u, env) {
        const d = nth(t), dc = nth(u), uu = twos(u);
        burst(g, d);
        // gone: one drawing of them leaving the bottom of the frame
        if (dc < 2) for (const [i, [who, x, y, rot, k]] of HANG.entries()) inAir(g, who, x, y + 260 + dc * 620, rot - 0.2, k * [1, 0.96][dc]);
        // the sea comes up to say so
        const sv = Math.max(0, uu - 2 / 12), top = 900 - (1900 * sv - 3000 * sv * sv);
        if (sv > 0 && top < 900) {
            for (const [i, cx] of [330, 640, 1090, 1310].entries()) {
                const w = 150 - i * 6, y = top + i * 26 + 40;
                T.shape(g, [[cx - w, 920], [cx - w * 0.82, y + 150], [cx - w * 1.05, y + 60], [cx - w * 0.5, y + 90], [cx - w * 0.42, y - 10], [cx, y + 50], [cx + w * 0.38, y - 40], [cx + w * 0.56, y + 80], [cx + w * 1.08, y + 30], [cx + w * 0.8, y + 160], [cx + w, 920]], { fill: C.foam, w: T.LINE, seed: 'splash' + i });
                for (let j = 0; j < 4; j++) {
                    const dx = (j - 1.5) * 90 + i * 13, r = 15 - j * 2, dy = top - 60 - j * 46 + sv * sv * 500;
                    T.shape(g, [[cx + dx - r, dy], [cx + dx, dy - r * 1.5], [cx + dx + r, dy], [cx + dx, dy + r]], { fill: C.sea, w: T.LINE_BG, seed: 'drop' + i + j });
                }
            }
        }
        // PIER PRESSURE, stamped on the last hit
        const k = [1.6, 0.9, 1.05, 1][Math.min(3, dc)];
        g.save();
        g.translate(800, 430);
        g.rotate(-0.05 + [0.05, -0.02, 0.008, 0][Math.min(3, dc)]);
        g.scale(k * 1.12, k * 1.12);
        T.slab(g, [[-560, -250], [545, -276], [572, 226], [-540, 252]], { fill: C.magenta, seed: 'title', over: 3, w: T.LINE * 1.6 });
        T.slab(g, [[-532, -224], [520, -249], [545, 200], [-514, 225]], { fill: null, seed: 'title-rule', over: 0.6, w: T.LINE, color: C.roadLine });
        T.sign(g, 'PIER', -8, -22, { size: 300, fill: C.roadLine, drop: C.navy, seed: 'title-a', w: T.LINE * 1.5, track: 0.07, tilt: 0.05 });
        T.sign(g, 'PRESSURE', 6, 186, { size: 196, fill: C.white, drop: C.navy, seed: 'title-b', w: T.LINE * 1.3, track: 0.05, tilt: 0.045 });
        g.restore();
        // ... and the one who started it, back for the last chip
        const cv = twos(u, 0.75) - 0.75;
        if (cv >= 0) put(g, 'captain', 'perch', 1225, 138 - hop(cv, 2.2) * 60 - (cv < 0 ? 0 : 0) + (cv === 0 ? -220 : 0), 0.34, { only: ['bird'] });
    }

    // over a frame the camera is whipping through: lines of speed along the move (sm: the
    // frame's stretch [sx, sy, dx]: across for a pan, up for a tilt, from the middle for a zoom)
    function streaks(g, t, sm) {
        const R = Motion.rng('whip' + Math.round(t * 24));
        for (let i = 0; i < 16; i++) {
            if (sm[0] > 1 && sm[1] > 1) {
                const a = R() * Math.PI * 2, r0 = 240 + R() * 260, r1 = r0 + 180 + R() * 420;
                T.line(g, [[800 + Math.cos(a) * r0, 450 + Math.sin(a) * r0 * 0.62], [800 + Math.cos(a) * r1, 450 + Math.sin(a) * r1 * 0.62]], { w: T.LINE * 1.2, seed: 'zw' + i });
            } else if (sm[1] > 1) {
                const x = R() * 1600, y = R() * 700, L = 180 + R() * 420;
                T.line(g, [[x, y], [x, y + L]], { w: T.LINE * 1.2, seed: 'tw' + i });
            } else {
                const x = R() * 1300 - 100, y = 30 + R() * 840, L = 260 + R() * 700;
                T.line(g, [[x, y], [x + L, y]], { w: T.LINE * 1.2, seed: 'pw' + i });
            }
        }
    }

    return { viewfinder, stage, streaks, harbor, hoagie, milo, pip, dot, captain, chase0, pier, leap, hang, title, world, view, card, block, star, put, put3, twos, nth };
})();
