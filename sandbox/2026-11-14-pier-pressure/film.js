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

    // The cast: a nominal number of drawing pixels per metre for each (callers size a drawing as
    // frame units per metre ÷ this); each drawing carries its own anchor and its own pixels per
    // metre (cast/*-drawn.js, written by tools/green.py), and `put` goes by those.
    const M = { hoagie: { m: 500 }, milo: { m: 430 }, pip: { m: 590 }, dot: { m: 390 }, captain: { m: 1140 }, kit: { m: 500 } };
    // a drawing with its anchor on a point of the frame; o: rot, sx, sy (about the anchor), flip,
    // blink (0…1: the lids down)
    const blinkAt = (t, t0) => [0.5, 1, 0.5][Math.round((t - t0) * 24)] ?? 0; // three frames of blink from t0
    function put(g, who, pose, x, y, s, o = {}) {
        const mt = Drawn.meta(who, pose), a = mt.at;
        s *= M[who].m / mt.m;
        g.save();
        g.translate(x, y);
        if (o.rot) g.rotate(o.rot);
        g.scale((o.flip ? -1 : 1) * (o.sx ?? 1), o.sy ?? 1);
        const eyes = o.blink ? { blink: o.blink, lid: lidOf(who, pose), face: [mt.w / 2, mt.h * 0.2, mt.h * 0.32] } : {};
        if (o.sil) Drawn.draw(g, who, pose, -a[0] * s, -a[1] * s, s, { halo: { color: o.sil, w: 1.5 }, only: [] }); // (the figure as one flat shape)
        else Drawn.draw(g, who, pose, -a[0] * s, -a[1] * s, s, { weight: o.weight, only: o.only, hide: o.hide, ...eyes });
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
            put(g, 'dot', pose, dx + (d.dx ?? -92), dy - (d.up ?? 7), ds, { weight: d.weight, sy: d.sy, blink: d.blink });
            g.restore();
            Harbor.counter(g, env);
        }
        for (const a of [...(o.actors ?? [])].sort((p, q) => q.z - p.z)) a.draw(g);
        Harbor.fore(g, env, t);
        if (o.captain !== null) {
            const top = A.bollard.top;
            put3(g, 'captain', 'perch', [top[0], top[1] + (o.captain?.h ?? 0), top[2]], { only: ['bird'], weight: o.captain?.weight, sy: o.captain?.sy, blink: o.captain?.blink });
        }
    }
    // Captain in flight with the cone of chips in his feet, his body's middle about (x, y)
    function capFly(g, t, x, y, s, o = {}) {
        // a cycle of four drawings of his own (wings up, level, down, level), on twos; sized so that
        // his wings, level, span 0.62 m
        const mt = Drawn.meta('captain', 'f2'), k = (0.62 * mt.m) / mt.w;
        g.save();
        g.translate(x, y);
        g.rotate(o.rot ?? 0);
        put(g, 'captain', ['f1', 'f2', 'f3', 'f4'][nth(t) % 4], 150 * s, -40 * s, s * k, { sil: o.sil });
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
    // The opening (2 s, the song's quiet start): the harbour's sign, and back from it to the whole
    // quay, where the next shot goes on without a cut. (Tried and thrown out by the user: one long
    // move along the quay, round 47, and fifteen cuts on the intro's hits, round 48.)
    const DOT_AT = { stand: { up: 7 }, serve: { up: 44 }, basket: { up: 30 }, salt: { up: 30 }, yell: { up: 14 } }; // how far up each drawing stands behind her counter
    function harbor(g, t, u, env) {
        const k = ease((u - 0.55) / 1.35), c = { f: [lerp(1150, 800, k), lerp(215 + 30 * Math.min(1, u / 0.55), 450, k)], z: 2 * Math.pow(0.5, k) };
        view(g, env, c.f, c.z, 2, (e) => world(g, e, t, { dot: { pose: 'serve', ...DOT_AT.serve } }));
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
        // o.far: how much further back the floor goes (someone whose feet are one behind the other
        // needs floor behind the far one, or she stands on its edge); o.at [x, dy, rx, ry]: the shadow,
        // round the feet (both of them inside it), not under them
        const far = o.far ?? 0, sh = o.at ?? [x, 6, 250, 30];
        T.slab(g, [[-20, y - 28 - far], [1620, y - 62 - far], [1620, 920], [-20, 920]], { fill: o.floor ?? C.navy, seed: 'stage-floor', over: 0, w: T.LINE * 1.4 });
        g.fillStyle = 'rgba(0, 0, 0, 0.28)';
        g.beginPath();
        g.ellipse(sh[0], y + sh[1], sh[2] * (o.shadow ?? 1), sh[3], 0, 0, 6.3);
        g.fill();
    }

    // === 3 · Hoagie (2 s) =============================================================================
    // We have been looking through his camcorder: the camera comes back out of its lens and there
    // he is. Every frame comes from the code of a drawing made from his sheets, and from nothing
    // else: either the drawing as it is (t1…t4 the turn of the camcorder, a1 the anticipation, a2
    // the thumb up on his toes, a4 the blink), or the code of his settled drawing (a3) edited: its
    // pieces put down again, a different way in each frame (cast/hoagie-edit.js). `prev` paints
    // the shot before.
    // (the turn is eight drawings: the four of its sheet and the four between them, ta…td)
    const HOAGIE_X = [[0, 't1'], [8, 'ta'], [10, 't2'], [12, 'tb'], [14, 't3'], [16, 'tc'], [18, 't4'], [20, 'td'], [21, null], [35, 'a4'], [37, null]];
    const HOAGIE_LENS = [28, 106]; // the glass of his camcorder in `t1` (its own pixels)
    // From frame 21, one row a frame: [the drawing whose code is edited, how far its upper body is
    // down over its legs, its head about the neck, its arm about the sleeve, its cowlick, its lids].
    // Every change of drawing is cushioned on both sides: the one that leaves is already moving
    // towards the next, the one that arrives comes in short of its place and eases into it, with
    // no going past and coming back. (The raised arm of `a2` is not turned: part of its outline
    // belongs to the head and the shirt behind it, and stays behind when it moves.)
    const HOAGIE_ROWS = {
        21: ['a1', -3, -0.02, 0, -0.1], 22: ['a1', 2, 0, 0, 0.1], 23: ['a1', 6, 0.02, 0, 0.25],                 // sinking: the anticipation
        24: ['a2', 9, 0.03, 0, 0.4], 25: ['a2', 4, 0.015, 0, 0.2], 26: ['a2', 1, 0.005, 0, 0.08], 27: ['a2', 0, 0, 0, 0], // up: the thumb, on the beat
        28: ['a2', 4, 0.01, 0, 0.1], 29: ['a2', 10, 0.03, 0, 0.3],                                         // starting down
        30: ['a3', 12, 0.045, 0.15, 0.4], 31: ['a3', 7, 0.03, 0.09, 0.25], 32: ['a3', 3.5, 0.015, 0.045, 0.12],  // off his toes, easing into standing
        33: ['a3', 1.5, 0.006, 0.02, 0.05], 34: ['a3', 0.5, 0, 0, 0, 0.5],
        37: ['a3', 0, 0, 0.03, 0, 0.5], 38: ['a3', 2.5, 0.012, 0.1, 0.08], 39: ['a3', 5, 0.025, 0.18, 0.15],     // the pump: the thumb down, with the knees
        40: ['a3', 5.5, 0.028, 0.2, 0.17], 41: ['a3', 3.5, 0.016, 0.12, 0.1], 42: ['a3', 1.5, 0.006, 0.05, 0.04], 43: ['a3', 0.5, 0, 0.015, 0], // and back up
        44: ['a3', 2, 0.01, 0.03, 0.05], 45: ['a3', 5, 0.025, 0.07, 0.15],                                       // sinking again, towards the squint
        46: ['a1', 2, 0, 0, 0.1], 47: ['a1', 5, 0.015, 0, 0.2],
    };
    function hoagie(g, t, u, env, prev) {
        const f = Math.min(47, Math.round(u * 24)), X = 640, Y = 838, PPM = 540, HIT = 24, halo = { color: C.white, w: 9 };
        stage(g, nth(t), X, Y, C.orange, '#e0661f', { floor: C.maroon });
        const name = HOAGIE_X.filter(([at]) => f >= at).pop()[1];
        if (name) {
            const mt = Drawn.meta('hoagie', name), s = PPM / mt.m;
            Drawn.draw(g, 'hoagie', name, X - mt.at[0] * s, Y - mt.at[1] * s, s, { halo });
        } else {
            const [pose, crouch, head, swing, cow, lids = 0] = HOAGIE_ROWS[f];
            HoagieEdit.frame(g, X, Y, PPM / Drawn.meta('hoagie', pose).m, { pose, crouch, head, swing, cow, lids, halo });
        }
        if (f >= HIT && f < HIT + 6) for (let i = 0; i < 5; i++) {
            // the thumb lands: ticks round it
            const n = f - HIT, a = -2.5 + i * 0.5, r0 = 100 + n * 9, r1 = r0 + 40 - n * 5, cx = X + 200, cy = 110;
            T.line(g, [[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], { w: T.LINE * 1.3, seed: 'thumb' + i, color: C.white });
        }
        card(g, u, 1, 'HOAGIE', 'GOT THE GRIN', 1215, 560, { fill: C.maroon, drop: C.ink, second: C.roadLine, k: 1.05, tilt: -0.05 });
        // out of the lens: what the shot before showed shrinks into the glass of his camcorder
        if (prev && f < 8) {
            const r = [1000, 600, 340, 190, 108, 66, 44, 36, 36][f], k = Math.min(1, f / 6), m1 = Drawn.meta('hoagie', 't1'), s1 = PPM / m1.m;
            const cx = lerp(800, X + (HOAGIE_LENS[0] - m1.at[0]) * s1, k * k), cy = lerp(450, Y + (HOAGIE_LENS[1] - m1.at[1]) * s1, k * k);
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

    // --- the presentations: each on their own card of colour, full height --------------------------
    // A drawing with the point between its soles on (x, y) at ppm frame units per metre, edited:
    // crouch (metres: the upper body down over the legs, for a pose cut into `legs` and `upper`),
    // blink 0…1 (lids over the eyes of its face), rot about the anchor (for a body in the air).
    const SKIN = { hoagie: '#f3bd90', milo: '#d49147', pip: '#b77d4d', dot: '#bf773e', kit: '#b77d4d', captain: '#fffdf6' }, lids = {};
    const lidOf = (who, pose) => (lids[who + pose] ??= (() => {
        const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)), w = hex(SKIN[who]);
        return Drawn.colours(who, pose).reduce((b, c) => { const v = hex(c), dd = (v[0] - w[0]) ** 2 + (v[1] - w[1]) ** 2 + (v[2] - w[2]) ** 2; return dd < b[0] ? [dd, c] : b; }, [1e9, SKIN[who]])[1];
    })());
    const HALO = { color: '#fffdf6', w: 9 };
    function act(g, who, pose, x, y, ppm, o = {}) {
        const mt = Drawn.meta(who, pose), s = ppm / mt.m, cut = Drawn.parts(who, pose).includes('legs');
        const eyes = o.blink ? { blink: o.blink, lid: lidOf(who, pose), face: [mt.w / 2, mt.h * 0.2, mt.h * 0.32] } : {};
        g.save();
        g.translate(x, y);
        if (o.rot) g.rotate(o.rot);
        const X = -mt.at[0] * s, Y = -mt.at[1] * s;
        if (cut) {
            const parts = { upper: { dy: (o.crouch ?? 0) * mt.m } };
            Drawn.draw(g, who, pose, X, Y, s, { parts, halo: HALO, only: [] });
            Drawn.draw(g, who, pose, X, Y, s, { parts, only: ['legs'] });
            Drawn.draw(g, who, pose, X, Y, s, { parts, only: ['upper'], ...eyes });
        } else Drawn.draw(g, who, pose, X, Y, s, { halo: HALO, only: o.only, hide: o.hide, ...eyes });
        g.restore();
    }
    // how far a drawing has sunk at frame f of its stay [f0, f1): it arrives short of standing
    // and eases up into it; before it leaves it is already sinking towards the next. No going
    // past and coming back.
    const IN = [0.05, 0.028, 0.013, 0.005], OUT = [0.008, 0.02, 0.036];
    const cushion = (f, f0, f1, o = {}) => (o.in === false ? 0 : IN[f - f0] ?? 0) + (o.out === false ? 0 : OUT[f - (f1 - OUT.length)] ?? 0);
    // A wipe carried across the frame: over n frames an edge crosses it (dir 1: left to right); what
    // is ahead of the edge is still the shot before (`prev` paints it); carry(x, k) draws what brings it.
    function wipe(g, f, n, dir, prev, carry) {
        if (!prev || f >= n) return;
        const k = (f + 0.5) / n, e = k * k * (3 - 2 * k), x = dir > 0 ? lerp(-280, 1880, e) : lerp(1880, -280, e), edge = (yy) => x + (yy - 450) * 0.22 * dir;
        g.save();
        g.beginPath();
        g.moveTo(edge(-10), -10);
        g.lineTo(dir > 0 ? 1700 : -100, -10);
        g.lineTo(dir > 0 ? 1700 : -100, 910);
        g.lineTo(edge(910), 910);
        g.closePath();
        g.clip();
        prev(g);
        g.restore();
        const zz = Array.from({ length: 20 }, (_, i) => [edge(-20 + i * 50) + (i % 2 ? 24 : -24), -20 + i * 50, 1]);
        T.line(g, zz, { w: 30, color: C.ink, seed: 'wipe', amp: 0, taper: false });
        T.line(g, zz, { w: 19, color: C.white, seed: 'wipe', amp: 0, taper: false });
        carry(x, e);
    }
    const FX = 640, FY = 838; // where a presented figure stands on its card

    // === 4 · Milo (2 s) ===============================================================================
    // His board shoots across and brings his card with it. On one knee, a last turn of the spanner;
    // up, a foot on the board, arms folded, eyes shut: the plan; on the bar's last beat the board
    // leaves without him, and he leaves the frame by the top.
    function milo(g, t, u, env, prev) {
        const f = Math.min(47, Math.round(u * 24)), PPM = 430, GO = 36;
        stage(g, nth(t), FX, FY, C.teal, '#6cbba9', { floor: C.navy });
        if (f < 14) act(g, 'milo', 'crouch', FX, FY, PPM, { blink: [0.5, 1, 1, 0.5][f - 9] ?? 0 });
        else if (f < GO) act(g, 'milo', 'smug', FX, FY, PPM, { crouch: cushion(f, 14, GO) });
        else {
            const n = f - GO, tt = n / 24, h = 9 * tt - (G * tt * tt) / 2;
            puff(g, FX, FY, n / 9, 6, 26, 'milo-go');
            act(g, 'milo', 'board', FX + 60 + n * n * 9 + n * 40, FY - 34, PPM, { rot: -0.64 });
            act(g, 'milo', 'fall', FX - 30 - n * 8, FY - 300 - h * PPM, PPM, { rot: -0.3 - n * 0.22 });
        }
        card(g, u, 1, 'MILO', 'GOT A PLAN', 1215, 560, { fill: C.navy, drop: C.ink, second: C.roadLine, ink: C.navy, tilt: -0.05 });
        wipe(g, f, 8, 1, prev, (x, e) => act(g, 'milo', 'board', x, 520 + Math.sin(e * 6) * 30, 620, { rot: -0.64 + e * 2.4 }));
    }

    // === 5 · Pip (2 s) ================================================================================
    // Milo comes back down through the frame and her card is behind him. She rolls in on a push,
    // coasts with her lollipop and her eyes half shut, and with a wink over her shoulder she is off.
    const pipRide = (t, X, Z, pose = 'ride') => ({ z: Z, draw(g) {
        const d = nth(t), [x, y] = Cam.pt([X, 0, Z]);
        // what she leaves behind her: three lines of speed
        for (let i = 0; i < 3; i++) T.line(g, [[x - 250 - i * 34 - (d % 2) * 26, y - 70 - i * 92], [x - 400 - i * 60 - (d % 2) * 26, y - 70 - i * 92]], { w: T.LINE, seed: 'pipspeed' + i });
        put3(g, 'pip', pose, [X, [0, 0.012][d % 2], Z], { rot: (pose === 'push' ? -0.03 : 0) + [0, 0.01][d % 2] });
    } });
    function pip(g, t, u, env, prev) {
        const f = Math.min(47, Math.round(u * 24)), PPM = 520, OFF = 40;
        stage(g, nth(t), FX, FY, C.blue, '#3f7fc0', { floor: C.green });
        const x = f < 12 ? FX - 300 * (1 - f / 12) * (1 - f / 12) : f < OFF ? FX + (f - 12) * 1.5 : FX + 42 + (f - OFF) * (f - OFF) * 22 + (f - OFF) * 20;
        const pose = f < 12 ? 'push' : f < OFF ? 'lolly' : 'wink';
        // what she leaves behind her when she moves: three lines of speed
        if (f < 9 || f >= OFF + 1) for (let i = 0; i < 3; i++) T.line(g, [[x - 300 - i * 40 - (f % 2) * 30, FY - 150 - i * 130], [x - 520 - i * 70 - (f % 2) * 30, FY - 150 - i * 130]], { w: T.LINE * 1.6, seed: 'pips' + i, color: C.white });
        act(g, 'pip', pose, x, FY - 4, PPM, { rot: pose === 'push' ? -0.03 * (1 - f / 12) : 0, blink: pose === 'lolly' ? [0.6, 1, 0.6][f - 27] ?? 0 : 0 });
        card(g, u, 1, 'PIP', 'GOT THE NERVE', 1215, 330, { fill: C.green, drop: C.ink, second: C.lime, ink: C.maroon, tilt: 0.05 });
        wipe(g, f, 8, 1, prev, (wx, e) => act(g, 'milo', 'fall', wx, lerp(60, 800, e), 430, { rot: 1.2 + e * 3 }));
    }

    // === 6 · Aunt Dot (2 s) ===========================================================================
    // Pip rides through and Dot's card comes in behind her. A shake of the basket with her knees
    // in it, salt from a height, and on the bar's last beat the cone, held out: chips up.
    function dot(g, t, u, env, prev) {
        const f = Math.min(47, Math.round(u * 24)), PPM = 370;
        stage(g, nth(t), FX, FY, C.salmon, '#f59b70', { floor: C.maroon, far: 46, at: [f < 34 ? FX : FX + 120, -14, 235, 40] });
        if (f < 16) act(g, 'dot', 'basket', FX, FY, PPM, { crouch: 0.011 * (1 - Math.cos((f / 4) * Math.PI)) + cushion(f, 0, 16, { in: false }) });
        else if (f < 34) act(g, 'dot', 'salt', FX, FY, PPM, { crouch: cushion(f, 16, 34) + 0.004 * (1 - Math.cos(((f - 20) / 3) * Math.PI)) * (f >= 20 && f < 31 ? 1 : 0) });
        else act(g, 'dot', 'serve', FX + 120, FY, PPM, { crouch: cushion(f, 34, 99), blink: [0.5, 1, 0.5][f - 42] ?? 0 });
        card(g, u, 1, 'AUNT DOT', 'MIND THE CURVE', 1215, 560, { fill: C.red, drop: C.maroon, tilt: -0.05 });
        wipe(g, f, 8, 1, prev, (wx, e) => act(g, 'pip', 'wink', wx + 120, FY - 4, 520, {}));
    }

    // The bollard of Captain's sheet without him. Under his feet the sheet has no metal (it was never
    // drawn): once he is off it, its top is closed with the post's own grey and one line from
    // shoulder to shoulder (pose pixels, read on the sheet where the top shows between his feet)
    const DOME = [[97, 545], [108, 530], [132, 518], [165, 510], [200, 506], [240, 505], [285, 507], [322, 513], [348, 524], [361, 540]];
    function postAlone(g, x, y, ppm) {
        const mt = Drawn.meta('captain', 'perch'), s = ppm / mt.m, X = x - mt.at[0] * s, Y = y - mt.at[1] * s;
        const top = new Path2D(), cap = new Path2D();
        DOME.forEach(([px, py], i) => {
            if (!i) { top.moveTo(px, py); cap.moveTo(px, py); return; }
            const [qx, qy] = DOME[i - 1], last = i === DOME.length - 1, mx = last ? px : (px + qx) / 2, my = last ? py : (py + qy) / 2;
            if (i === 1) { top.lineTo(mx, my); cap.lineTo(mx, my); } else { top.quadraticCurveTo(qx, qy, mx, my); cap.quadraticCurveTo(qx, qy, mx, my); }
        });
        cap.lineTo(361, 566); cap.lineTo(97, 566); cap.closePath();
        const patch = (fill, w, P) => { g.save(); g.translate(X, Y); g.scale(s, s); g.lineJoin = g.lineCap = 'round'; g.fillStyle = g.strokeStyle = fill; g.lineWidth = w; if (P === cap) g.fill(P); if (w) g.stroke(P); g.restore(); };
        Drawn.draw(g, 'captain', 'perch', X, Y, s, { halo: HALO, only: [], hide: ['bird'] });
        patch(HALO.color, HALO.w * 2, cap);
        patch('#464343', 0, cap);
        Drawn.draw(g, 'captain', 'perch', X, Y, s, { only: ['post'] });
        patch(C.ink, mt.line, top);
    }

    // === 7 · Captain (2 s) ============================================================================
    // He comes through the frame with her chips and his card is behind him. On his bollard, a chip
    // in his beak; down into a crouch, his one eye on the rest; and off, wings up, wings down.
    function captain(g, t, u, env, prev) {
        const f = Math.min(47, Math.round(u * 24)), PPM = 1150, X = 560, mt = Drawn.meta('captain', 'perch'), s = PPM / mt.m;
        const top = FY - (mt.h - 7 - mt.at[1]) * s; // the top of his bollard: where his feet are
        stage(g, nth(t), X, FY, C.sea, C.seaDeep, { floor: C.navy });
        if (f < 16) act(g, 'captain', 'perch', X, top, PPM, { blink: [0.5, 1, 1, 0.5][f - 10] ?? 0 });
        else {
            postAlone(g, X, top, PPM);
            const sc = PPM * 1.25;
            if (f < 32) act(g, 'captain', 'ready', X + 10, top + 4, sc, {});
            else if (f < 36) act(g, 'captain', 'launch', X + 10, top - (f - 32) * 22, sc, {});
            else { const n = f - 36; capFly(g, t, X - 40 - n * 62, top - 330 - n * 52, sc / M.captain.m, { rot: -0.1 }); }
        }
        card(g, u, 1, 'CAPTAIN', 'WANTED', 1215, 560, { fill: C.navy, drop: C.ink, ink: C.navy, ribbon: C.roadLine, tilt: -0.05 });
        wipe(g, f, 8, -1, prev, (wx, e) => { g.save(); g.translate(wx, 430 + Math.sin(e * 5) * 40); g.scale(-1, 1); capFly(g, t, 0, 0, 1.9, { rot: -0.05 }); g.restore(); });
    }

    // === 8 · the break (3 s): he has the chips; after him ==============================================
    function chase0(g, t, u, env) {
        // Captain, from the hatch to over our heads
        const k = clamp((twos(u) - 2 / 12) / 1.0, 0, 1), kk = k * k, cp = [lerp(-2.9, 4.6, kk), lerp(1.75, 2.9, k) + Math.sin(k * 9) * 0.08, lerp(7.9, 2.0, kk)];
        const bird = (gg) => { if (k > 0 && k < 1) { const [bx, by] = Cam.pt(cp); capFly(gg, t, bx, by, (Cam.scale(cp[2]) / M.captain.m) * 1.25, { rot: -0.08 }); } };
        // the four set off, one after another: a drawing of anticipation, then gone
        const go = (at, speed) => {
            const v = twos(u, at) - at;
            return v < 0 ? null : v < 1 / 12 ? { dx: -0.05, sy: 0.9, sx: 1.08, v } : { dx: speed * (v - 1 / 12) * (0.6 + 3 * (v - 1 / 12)), sy: 1, sx: 1, v };
        };
        const gk = go(15 / 12, 3.2), gh = go(17 / 12, 3.2), gm = go(19 / 12, 3.2), start = hop(twos(u, 0.5) - 0.5, 0.9); // (two seconds: he is over them in one, they are gone in the next)
        const kitA = { z: KIT[2], draw(gg) {
            if (!gk) { kitRest(t).draw(gg); return; }
            // onto her board and away: three drawings of push, then the glide
            const k = nth(gk.v);
            if (k === 0) { const [x, y] = Cam.pt(KIT); KitAct.pose(gg, 'proud', x, y, (Cam.scale(KIT[2]) * 1.34) / 575, { sx: 1.06, sy: 0.92 }); KitAct.board(gg, ...Cam.pt(BOARD), (Cam.scale(BOARD[2]) * 1.4) / 700, 0); }
            else put3(gg, 'kit', CYC.kit[k % 4], [KIT[0] + 0.6 + gk.dx, 0, KIT[2]], {});
        } };
        const hoagieA = { z: HOAGIE[2], draw(gg) {
            if (!gh) put3(gg, 'hoagie', 'film', [HOAGIE[0], start, HOAGIE[2]], {});
            else if (gh.v < 1 / 12) put3(gg, 'hoagie', 'film', HOAGIE, gh);
            else put3(gg, 'hoagie', CYC.hoagie[nth(gh.v) % 4], [HOAGIE[0] + gh.dx, 0, HOAGIE[2]], {});
        } };
        const miloA = { z: MILO[2], draw(gg) {
            if (!gm) put3(gg, 'milo', 'stand', [MILO[0], start * 0.8, MILO[2]], {});
            else if (gm.v < 1 / 12) put3(gg, 'milo', 'stand', MILO, gm);
            else put3(gg, 'milo', CYC.milo[nth(gm.v) % 4], [MILO[0] + 0.3 + gm.dx, 0, MILO[2]], {});
        } };
        const actors = [kitA, hoagieA, miloA];
        if (u >= 0.9) actors.push(pipRide(t, -4.2 + (twos(u) - 0.9) * 8.7, 3.05, CYC.pip[nth(u) % 6]));
        if (cp[2] > 3.9) actors.push({ z: cp[2], draw: bird });
        view(g, env, [800, 470], 1.06, 1.6, (e) => {
            world(g, e, t, { actors, captain: null, dot: u < 4 / 12 ? { pose: 'serve', up: 44, dx: -92 } : { pose: 'yell', up: 14 + [14, -2, 3, 0][Math.min(3, nth(u, 4 / 12))] + [0, 3][nth(u) % 2], dx: -92 + [0, 2][nth(u) % 2] } });
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
    const SK = { kit: PX / M.kit.m, hoagie: PX / M.hoagie.m, milo: PX / M.milo.m, pip: PX / M.pip.m, captain: (PX / M.captain.m) * 2.3 };
    // how each of them goes, side on: a cycle of four drawings of their own, on twos (Hoagie and
    // Milo run: contact, passing, contact, passing; Kit pushes her board, Pip her scooter, and
    // coasts two drawings more than she pushes)
    const CYC = { hoagie: ['r1', 'r2', 'r3', 'r4'], milo: ['r1', 'r2', 'r3', 'r4'], kit: ['s1', 's2', 's3', 's4'], pip: ['s1', 's2', 's3', 's4', 's4', 's4'] };
    const runner = (g, who, t, x, y, o = {}) => put(g, who, CYC[who][nth(t) % CYC[who].length], x, y, SK[who] * (o.k ?? 1), o);
    // Off the end and in the air: four drawings of their own each (cast/<who>-leap-drawn.js): j1 the
    // take-off at the edge, j2 launched, j3 the hang with a look down, j4 the fall. j1 stands on the
    // deck like the cycle's drawings; the other three are held by their middle. j2 is drawn going out
    // flat: it leans back by LEAN while the arc is steep and levels out towards its top
    const LEAN = { hoagie: -0.5, milo: -0.3, kit: -0.2, pip: -0.15 };
    const ROLLS = { kit: true, pip: true }; // on wheels: no last stride, they crouch as they roll up to the edge
    // Each one's own way off the end: where they are in the line as it reaches the edge (further
    // apart than in the pack, so nobody takes off through the one in front; Milo, last, comes in late), the arc's speed out and
    // up (frame units per second: Pip far and high, Kit steep, Hoagie flat and long, Milo short),
    // and how much of the arc's slope the drawing leans by
    const OFF = { milo: [-115, 105, 700, 0.3], hoagie: [440, 635, 653, 0.5], kit: [760, 305, 1070, 0.25], pip: [1070, 471, 1143, 0.2] };

    // === 0 · the cold open (7 s): the chase before anyone has a name ================================
    // Not the harbour («no aprovecharía la escena del puerto para el inicio»), and nobody seen («el
    // misterio de no saber quién son hasta que se presenten»): a field of rays, a band of ground, and
    // flat black shapes. The gull goes over with his cone on the song's squawk; the four come in after
    // him one to every two of its eight stabs, each on their own cycle; the band comes in and the
    // field changes colour under them. On «Down at…» three of them are gone to the right and the one
    // in front crouches and jumps, UP: the frame goes up with her, the field drops away below and the
    // harbour comes down from above (`next`: its painter and where she hangs over it), and the next
    // shot is her landing.
    //   [who, where they run (x), the stab they come in on (s), where their cycle starts]
    const COLD = [['kit', 1215, 2, 1], ['pip', 905, 2.5, 3], ['hoagie', 570, 3, 2], ['milo', 250, 3.5, 0]];
    const IN_X = [900, 520, 260, 110, 30]; // five drawings in from the left, each step shorter
    const PUSH = [40, 150, 340, 580, 770, 870]; // the frame going up, six drawings: how far the field has dropped
    function cold(g, t, u, env, next) {
        const d = nth(t), uu = twos(u), n = nth(u), band = u >= 4, GY = 742, K = 1.36, INK = C.ink;
        const JUMP = 6.25, UPAT = 6.5, pn = Math.round((uu - UPAT) * 12), off = pn < 0 ? 0 : PUSH[Math.min(5, pn)];
        if (off) { g.save(); g.translate(0, off - 900); next.paint(g); g.restore(); }
        g.save();
        g.translate(0, off);
        g.beginPath(); g.rect(0, 0, 1600, 900); g.clip(); // (its rays stay on it as it drops away)
        // the field: yellow; magenta from the band's entry
        g.fillStyle = band ? C.magenta : C.roadLine;
        g.fillRect(0, 0, 1600, 900);
        g.fillStyle = band ? '#cf007a' : '#f5d400';
        for (let i = 0; i < 14; i++) {
            const a = d * 0.035 + (i / 14) * Math.PI * 2, b = a + Math.PI / 14;
            g.beginPath(); g.moveTo(800, 560); g.lineTo(800 + Math.cos(a) * 2200, 560 + Math.sin(a) * 2200); g.lineTo(800 + Math.cos(b) * 2200, 560 + Math.sin(b) * 2200); g.closePath(); g.fill();
        }
        T.slab(g, [[-20, GY - 6], [1620, GY - 14], [1620, 920], [-20, 920]], { fill: INK, seed: 'cold-ground', over: 0, w: T.LINE * 1.4 });
        // lines of speed, from the first stab on
        if (u >= 2) for (let i = 0; i < 8; i++) {
            const x = 1750 - ((d * 330 + i * 613) % 2100), y = 120 + ((i * 53) % 8) * 62;
            T.line(g, [[x, y], [x + 150 + (i % 3) * 60, y]], { w: T.LINE * 1.3, seed: 'csp' + i, color: INK });
        }
        const gone = (i) => 5.6 + i * 0.1; // when each of the other three leaves, from the front
        // the gull: over the frame on the squawk, then ahead of them, top right; first away
        {
            const k0 = clamp(uu / 1.6, 0, 1), x = u < 2 ? lerp(-260, 1330, k0 * (2 - k0)) : 1330 + Math.sin(uu * 5) * 18 + Math.max(0, uu - 5.5) ** 2 * 9000;
            const y = u < 2 ? 190 - Math.sin(k0 * Math.PI) * 60 : 150 + Math.sin(uu * 7) * 16;
            capFly(g, t, x, y, SK.captain * 1.2, { rot: -0.05, sil: INK });
        }
        for (const [i, [who, x, at, ph]] of COLD.entries()) {
            const m = Math.round((uu - at) * 12);
            if (m < 0 || (i === 0 && uu >= JUMP - 1e-6)) continue;
            const out = i ? Math.max(0, uu - gone(i)) : 0;
            runner(g, who, t + ph / 12, x - (IN_X[m] ?? 0) + out * out * 14000, GY - 16, { k: K, sil: INK });
        }
        g.restore();
        // the one in front: two drawings crouched on her board, then up; the frame follows her
        if (uu >= JUMP - 1e-6) {
            const s0 = (PX * K) / 429, x0 = COLD[0][1], jn = Math.round((uu - JUMP) * 12);
            if (jn < 2) KitAct.pose(g, 'j1', x0, GY - 16, s0, { sil: INK });
            else {
                // (on the screen: from where she left the ground to where she hangs over the quay)
                const k = clamp((jn - 2 + 1) / 7, 0, 1), e = 1 - (1 - k) * (1 - k);
                KitAct.pose(g, 'j2', lerp(x0 + 30, next.gx, e), lerp(GY - 230, next.apex, e), lerp(s0, next.KP, e), { sil: INK, rot: -0.22 * (1 - k) }); // (up, bigger, and out of the top)
            }
        }
        // the band comes in: one drawing of white
        if (n === 48) { g.fillStyle = 'rgba(255, 253, 246, 0.82)'; g.fillRect(0, 0, 1600, 900); }
    }

    // === 9 · down the pier (3 s) ======================================================================
    const RUN = 1150; // the camera's speed along the pier, frame units per second
    // where each is in the pack, on the frame, at the start and at the end of the run, and where
    // their cycle starts: Pip comes through all of them without looking up; Milo falls behind
    const PACK = [['milo', 330, 300, 0], ['hoagie', 560, 510, 2], ['kit', 800, 790, 1], ['pip', 90, 1070, 3]];
    function pier(g, t, u, env) {
        const d = nth(t), close = u >= 1.9, z = close ? 1.45 : 1, inn = close ? 0 : (1 - ease(u / 0.5)) * -900;
        g.save();
        if (close) { g.translate(800, 470); g.scale(z, z); g.translate(-700 + [0, 3][d % 2], -470 + [0, -4][d % 2]); }
        pierSide(g, d, u * RUN);
        speed(g, d, close ? 6 : 9);
        capFly(g, t, 1300 + Math.sin(twos(u) * 5) * 24 - inn * 0.4, 250 + Math.sin(twos(u) * 7) * 26, SK.captain, { rot: -0.05 });
        for (const [who, x0, x1, ph] of PACK) runner(g, who, t + ph / 12, lerp(x0, x1, ease((u - 0.3) / 1.45)) + inn * (1.4 - x0 / 1200), DECK - 10); // (the pack is in its final order before the camera closes in)
        g.restore();
    }

    // === 10 · the end of the pier (2 s): off it, one after another ========================================
    function leap(g, t, u, env) {
        const d = nth(t), END = 1000, stop = 0.75, uu = twos(u);
        // the camera stops with the pier's end in frame, then goes up and a little on with them
        const rise = 225 * ease((u - 0.85) / 1.1), pan = 260 * ease((u - 0.9) / 1.1);
        pierSide(g, d, 3 * RUN + Math.min(u, stop) * RUN + pan, END - pan + Math.max(0, stop - u) * RUN, rise);
        if (u < stop) speed(g, d, 7);
        g.save();
        g.translate(-pan, rise);
        const cv = Math.max(0, uu - 0.4);
        capFly(g, t, 1320 + pan + cv * 260, 250 - cv * cv * 420, SK.captain, { rot: -0.25 });
        for (const [who, , , ph] of PACK) {
            // tr: when their place in the line reaches the edge (xe). On foot, the last stride lands on
            // it a drawing early and is held two (the crouch), then they are off; on wheels the crouch
            // is the last two drawings of the roll
            const [x0, vx, vy, lean] = OFF[who];
            const xe = Math.max(END, x0), tr = stop + (xe - x0) / RUN, x = x0 + Math.max(0, uu - stop) * RUN;
            const tc = tr - (ROLLS[who] ? 2 : 1) / 12, tl = tr + (ROLLS[who] ? 0 : 1) / 12;
            if (uu < tc - 1e-6) { runner(g, who, t + ph / 12, x, DECK - 10); continue; }
            if (uu < tl - 1e-6) { put(g, who, 'j1', ROLLS[who] ? Math.min(x, xe) : xe, DECK - 10, SK[who]); continue; }
            const v = uu - tl;
            puff(g, xe - 30, DECK, v / 0.3, 5, 16, 'off' + who);
            put(g, who, 'j2', xe + 40 + vx * v, DECK - 150 - (vy * v - 620 * v * v), SK[who], { rot: -Math.atan2(vy - 1240 * v, vx) * lean });
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
    // Where each hangs on the frame (their middle) and how big; `on`: the drawing they come up into
    // the frame on (in the order they left the pier), `off`: the drawing their fall starts on
    const HANG = [['milo', 232, 312, 1.4, 6, 17], ['kit', 672, 540, 1.5, 2, 18], ['hoagie', 1082, 628, 1.5, 4, 16], ['pip', 1404, 252, 1.45, 0, 19]];
    // five drawings up into place, each step shorter than the one before (no overshoot), and a fall
    // that starts slow: how far below their place, and how far in from the left they still are
    const UP = [560, 300, 140, 55, 15], ACROSS = [120, 70, 35, 14, 4], DROP = [0, 10, 50, 130, 260, 440, 670, 950, 1280];
    // the four of them on drawing n of the two seconds of sky (it runs on under the title)
    function aloft(g, n) {
        for (const [who, x, y, k, on, off] of HANG) {
            const m = n - on, s = SK[who] * k;
            if (m < 0) continue;
            if (m < 5) put(g, who, 'j2', x - ACROSS[m], y + UP[m], s, { rot: LEAN[who] * [1, 0.8, 0.55, 0.3, 0.12][m] });
            else if (n < off) put(g, who, 'j3', x, y - 12 * Math.sin((Math.PI * (m - 5)) / (off - on - 5)), s); // (still drifting up, then not)
            else if (n - off < DROP.length) put(g, who, 'j4', x, y + DROP[n - off], s, { rot: 0.03 * (n - off) });
        }
    }
    function hang(g, t, u, env) {
        const d = nth(t), uu = twos(u);
        burst(g, d);
        // (he leaves upwards before the title's board comes down with him on it)
        if (nth(u) < 20) capFly(g, t, 1010 + Math.sin(uu * 3) * 30 + Math.max(0, nth(u) - 16) * 60, 96 + Math.sin(uu * 4.2) * 12 - Math.max(0, nth(u) - 16) ** 2 * 22, SK.captain * 1.25, { rot: -0.06 });
        aloft(g, nth(u));
        titleBoards(g, nth(u) - 24, u - 2);
    }
    // The title, in the family of the name cards and the biggest of them: two boards. PIER comes down
    // from above over the last two drawings of the sky, Captain riding its corner, and lands on the
    // song's last hit; PRESSURE is slammed across its foot on the shout (0.33 s on) and knocks it
    // askew; the music stops dead at 0.7 s, a glint; in the silence our seal unrolls under it and
    // Captain blinks. n: the drawing, on twos, counted from the hit (−2, −1: still in the sky).
    const TA = [800, 384], TB = [800, 648], SLAM = 4, STOP = 8, SEAL = 11;
    function titleBoards(g, n, u) {
        if (n < -2) return;
        // --- PIER
        const fall = n < 0 ? [-470, -215][n + 2] : 0, knocked = n > SLAM;
        g.save();
        g.translate(TA[0] + (knocked ? -6 : 0), TA[1] + fall + (knocked ? 7 : 0));
        g.rotate(n < 0 ? [-0.1, -0.07][n + 2] : knocked ? -0.062 : -0.038);
        const A = [[-440, -166], [428, -184], [446, 138], [-426, 156]];
        T.slab(g, A.map(([x, y]) => [x + 16, y + 18]), { fill: C.ink, seed: 'ta-shade', over: 1, w: T.LINE });
        T.slab(g, A, { fill: C.magenta, seed: 'title', over: 3, w: T.LINE * 1.6 });
        T.slab(g, [[-416, -142], [404, -159], [421, 114], [-402, 131]], { fill: null, seed: 'title-rule', over: 0.6, w: T.LINE, color: C.roadLine });
        block(g, 'PIER', -6, 96, { size: 280, fill: C.roadLine, drop: C.navy, seed: 'title-a', w: T.LINE * 1.5, track: 0.07, tilt: 0.05 });
        // the one who started it, on its corner: the landing throws him up, and so does the slam
        // (jumps under gravity, on twos; 370 frame units to his metre); a blink in the silence
        const up = Math.max(hop(Math.max(0, twos(u)), 1.6), hop(twos(u) - (SLAM + 1) / 12, 1.2)) * 330;
        put(g, 'captain', 'perch', 356, -181 - (n < 0 ? 0 : up), 0.3, { only: ['bird'], blink: Math.max(blinkAt(u, 1.29), 0) });
        g.restore();
        // thrown around it, one thing a drawing
        if (n >= 1) {
            const zz = Array.from({ length: 9 }, (_, i) => [176 + i * 34, 196 - (i % 2) * 40 - i * 4, 1]);
            T.line(g, zz, { w: T.LINE * 3.2, seed: 'tzz', color: C.ink });
            T.line(g, zz, { w: T.LINE * 1.5, seed: 'tzz', color: C.roadLine });
        }
        if (n >= 2) T.shape(g, [[1296, 300, 1], [1384, 322, 1], [1318, 386, 1]], { fill: C.teal, w: T.LINE * 1.2, seed: 'ttri' });
        if (n >= 3) for (let i = 0; i < 3; i++) T.shape(g, star(34 - i * 6, 34 - i * 6, 0.45, 5, -1.57 + i * 0.3).map(([x, y]) => [142 + i * 30 + x, 372 + i * 58 + y, 1]), { fill: [C.roadLine, C.magenta, C.teal][i], w: T.LINE, seed: 'tstar' + i });
        // --- PRESSURE: one drawing of it coming at the board, big; then on it
        if (n >= SLAM) {
            const kk = n === SLAM ? 1.42 : 1;
            g.save();
            g.translate(TB[0], TB[1] + (n === SLAM ? -18 : 0));
            g.rotate(n === SLAM ? 0.085 : 0.028);
            g.scale(kk, kk);
            const B = [[-592, -108], [580, -126], [596, 98], [-576, 114]];
            T.slab(g, B.map(([x, y]) => [x + 16, y + 18]), { fill: C.ink, seed: 'tb-shade', over: 1, w: T.LINE });
            T.slab(g, B, { fill: C.navy, seed: 'title-b-board', over: 3, w: T.LINE * 1.6 });
            T.slab(g, [[-570, -86], [558, -103], [573, 76], [-555, 91]], { fill: null, seed: 'title-b-rule', over: 0.6, w: T.LINE, color: C.roadLine });
            block(g, 'PRESSURE', 4, 62, { size: 196, fill: C.white, drop: C.magenta, seed: 'title-b', w: T.LINE * 1.3, track: 0.05, tilt: 0.045 });
            g.restore();
            // what the slam knocks loose
            if (n === SLAM + 1) for (let i = 0; i < 6; i++) {
                const a = (i % 3 - 1) * 0.36 + (i > 2 ? Math.PI : 0), r0 = 640, r1 = 716;
                T.line(g, [[TB[0] + Math.cos(a) * r0, TB[1] + Math.sin(a) * r0 * 0.5], [TB[0] + Math.cos(a) * r1, TB[1] + Math.sin(a) * r1 * 0.5]], { w: T.LINE * 1.6, seed: 'tk' + i });
            }
        }
        // the music stops: a glint on the board's corner, three drawings
        const gl = n - STOP;
        if (gl >= 0 && gl < 3) {
            const r = [44, 76, 30][gl];
            T.shape(g, star(r, r, 0.22, 4, 0.2 + gl * 0.25).map(([x, y]) => [452 + x, 262 + y, 1]), { fill: C.white, w: T.LINE, seed: 'glint' + gl });
        }
        // who made it: our seal, on a ribbon like the cards' own, unrolled in the silence
        if (n >= SEAL) {
            const rk = [0.72, 1][Math.min(1, n - SEAL)], rw = 292;
            g.save();
            g.translate(800, 826);
            g.rotate(-0.02);
            g.scale(rk, rk);
            T.shape(g, [[-rw - 46, -40, 1], [rw + 42, -46, 1], [rw + 12, 0, 1], [rw + 46, 42, 1], [-rw - 42, 46, 1], [-rw - 12, 3, 1]], { fill: C.roadLine, w: T.LINE * 1.2, seed: 'seal', amp: 0.2 });
            T.sign(g, 'illodev x Claude', 2, 26, { size: 74, fill: C.navy, seed: 'seal-t', w: T.LINE_FINE, track: 0.04, tilt: 0.02, outline: C.roadLine });
            g.restore();
        }
    }
    function title(g, t, u, env) {
        const d = nth(t), dc = nth(u), uu = twos(u);
        g.save();
        // the frame takes the two hits: three drawings of shake each
        const sh = dc < 3 ? [[0, 12], [0, -7], [0, 3]][dc] : dc > SLAM && dc <= SLAM + 2 ? [[8, 6], [-4, -3]][dc - SLAM - 1] : null;
        if (sh) { g.translate(800 + sh[0], 450 + sh[1]); g.scale(1.03, 1.03); g.translate(-800, -450); }
        burst(g, d);
        // the last of them still falling, behind the title
        aloft(g, 24 + dc);
        // behind the boards: the cards' white burst, turning a notch every other drawing
        {
            const kb = dc === 0 ? 0.84 : 1;
            T.shape(g, star(735 * kb, 338 * kb, 0.84, 19, (dc >> 1) * 0.1).map(([x, y, c]) => [800 + x, 478 + y, c]), { fill: C.white, w: T.LINE * 1.4, seed: 'title-burst', amp: 0.15 });
        }
        // the sea comes up to say so (water, with its foam thrown off the top)
        const sv = Math.max(0, uu - 2 / 12), top = 900 - (1900 * sv - 3000 * sv * sv);
        if (sv > 0 && top < 900) {
            for (const [i, cx] of [330, 640, 1090, 1310].entries()) {
                const w = 150 - i * 6, y = top + i * 26 + 40;
                T.shape(g, [[cx - w, 920], [cx - w * 0.82, y + 150], [cx - w * 1.05, y + 60], [cx - w * 0.5, y + 90], [cx - w * 0.42, y - 10], [cx, y + 50], [cx + w * 0.38, y - 40], [cx + w * 0.56, y + 80], [cx + w * 1.08, y + 30], [cx + w * 0.8, y + 160], [cx + w, 920]], { fill: C.sea, w: T.LINE, seed: 'splash' + i });
                for (let j = 0; j < 4; j++) {
                    const dx = (j - 1.5) * 90 + i * 13, r = 15 - j * 2, dy = top - 60 - j * 46 + sv * sv * 500;
                    T.shape(g, [[cx + dx - r, dy], [cx + dx, dy - r * 1.5], [cx + dx + r, dy], [cx + dx, dy + r]], { fill: C.foam, w: T.LINE_BG, seed: 'drop' + i + j });
                }
            }
        }
        titleBoards(g, dc, u);
        g.restore();
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

    return { M, blinkAt, cold, viewfinder, stage, streaks, harbor, hoagie, milo, pip, dot, captain, chase0, pier, leap, hang, title, world, view, card, block, star, put, put3, twos, nth };
})();
