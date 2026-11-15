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
    const M = {
        hoagie: { m: 658 / 1.32, film: [385, 660], jump: [330, 335] },
        milo: { m: 702 / 1.62, stand: [316, 706], fall: [362, 327] },
        pip: { m: 659 / 1.12, stand: [300, 664], ride: [300, 652] },
        dot: { m: 697 / 1.8, stand: [206, 706], serve: [296, 706] },
        captain: { m: 525 / 0.46, perch: [170, 527], fly: [384, 324] },
        kit: { m: 500, stand: [235, 708], jump: [370, 360] },
    };
    // a drawing with its anchor on a point of the frame; o: rot, sx, sy (about the anchor), flip
    function put(g, who, pose, x, y, s, o = {}) {
        const a = M[who][pose];
        g.save();
        g.translate(x, y);
        if (o.rot) g.rotate(o.rot);
        g.scale((o.flip ? -1 : 1) * (o.sx ?? 1), o.sy ?? 1);
        Drawn.draw(g, who, pose, -a[0] * s, -a[1] * s, s, { weight: o.weight, only: o.only });
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
    function card(g, t, at, name, role, x, y, o = {}) {
        if (t < at) return;
        const dc = Math.min(3, nth(t, at)), k = [0.6, 1.16, 0.95, 1][dc] * (o.k ?? 0.9);
        const size = Math.min(188, 440 / (name.length * 0.6)), hw = Math.max(name.length * size * 0.31 + 34, role.length * 10.6 + 30), hh = size * 0.56;
        g.save();
        g.translate(x, y);
        g.rotate((o.tilt ?? -0.07) + [0.1, -0.03, 0.01, 0][dc]);
        g.scale(k, k);
        T.slab(g, [[-hw, -hh + 2], [hw - 4, -hh - 12], [hw + 8, hh * 0.68], [-hw + 8, hh * 0.83]], { fill: o.fill ?? C.magenta, seed: 'card' + name, over: 2.4, w: T.LINE * 1.2 });
        T.slab(g, [[-hw + 16, -hh + 16], [hw - 19, -hh + 3], [hw - 8, hh * 0.55], [-hw + 23, hh * 0.69]], { fill: null, seed: 'rule' + name, over: 0.5, w: T.LINE_FINE, color: C.roadLine });
        T.sign(g, name, 4, hh * 0.42, { size, fill: C.roadLine, drop: o.drop ?? C.navy, seed: 'name' + name, w: T.LINE * 1.1, track: 0.06, tilt: 0.05 });
        const rw = role.length * 10.6 + 18;
        T.slab(g, [[-rw, hh * 0.6], [rw + 6, hh * 0.6 - 12], [rw + 10, hh * 0.6 + 42], [-rw + 4, hh * 0.6 + 54]], { fill: C.white, seed: 'sub' + name, over: 1.6, w: T.LINE });
        T.sign(g, role, 6, hh * 0.6 + 40, { size: 44, fill: o.ink ?? C.red, seed: 'role' + name, w: T.LINE_FINE * 0.8, track: 0.03, tilt: 0.03, outline: C.white });
        g.restore();
    }
    // an entrance on twos: slides in from `from` frame units away, squashing as it stops
    const enter = (u, from) => {
        const d = Math.min(4, Math.max(0, Math.round(u * 12)));
        return { dx: [1, 0.42, 0.08, -0.03, 0][d] * from, sx: [0.92, 0.94, 1.07, 0.98, 1][d], sy: [1.08, 1.06, 0.93, 1.02, 1][d] };
    };

    // === 1 · Gull Harbor (4 s): the sign, then the quay =========================================
    function harbor(g, t, u, env) {
        if (u < 2) {
            // the town's sign, the camera coming down it
            view(g, env, [1150, 205 + 70 * ease(u / 2)], 2, 2, (e) => world(g, e, t, {}));
            return;
        }
        // the quay, quiet: Dot comes up behind her counter, Captain keeps watch
        const v = u - 2, z = 1 + 0.06 * ease(v / 2);
        view(g, env, [800, 470], z, 1.06, (e) => world(g, e, t, { dot: { up: -70 + 77 * ease((twos(v) - 0.5) / 0.34) }, captain: { h: hop(twos(v, 1) - 1, 1.1) } }));
    }

    // === 3 · Hoagie (2 s): through his viewfinder, then the boy behind it =========================
    function hoagie(g, t, u, env) {
        const e0 = enter(u, 520), up = hop(twos(u, 1) - 1, 1.5), s = Cam.scale(HOAGIE[2]);
        view(g, env, [1000, 500], 1.35, 1.35, (e) => world(g, e, t, { actors: [kitRest(t), { z: HOAGIE[2], draw(gg) {
            put3(gg, 'hoagie', 'film', [HOAGIE[0] + e0.dx / s, up, HOAGIE[2]], { sx: e0.sx, sy: e0.sy, rot: u > 0.4 && u < 1 ? Math.sin((twos(u) - 0.4) * 10) * 0.05 : 0 });
        } }] }));
        if (u < 1) {
            // what his camcorder sees: the corners of the viewfinder, REC
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
            if (nth(u) % 6 < 4) {
                T.shape(g, Array.from({ length: 12 }, (_, i) => [128 + Math.cos(i * 0.5236) * 17, 152 + Math.sin(i * 0.5236) * 17]), { fill: C.red, w: T.LINE, seed: 'rec' });
                T.sign(g, 'REC', 158, 172, { size: 58, fill: C.white, seed: 'rec-t', w: T.LINE, align: 'left', tilt: 0.02 });
            }
        }
        card(g, u, 1, 'HOAGIE', 'STILL ROLLING', 1270, 760, { fill: C.orange, drop: C.maroon });
    }

    // === 4 · Milo (2 s): the plan, and the plan going wrong =========================================
    function milo(g, t, u, env) {
        const v = twos(u, 1) - 1, V0 = 3.3, air = v >= 0 && v < (2 * V0) / G, e0 = enter(u, -460), s = Cam.scale(MILO[2]);
        // (a medium shot: he is the tall one)
        view(g, env, [500, 400], 1.6, 1.6, (e) => world(g, e, t, { actors: [kitRest(t), { z: MILO[2], draw(gg) {
            if (air) {
                // up he goes, heels over head, the board its own way
                const h = V0 * v - (G * v * v) / 2;
                put3(gg, 'milo', 'fall', [MILO[0] + 0.1 + v * 0.2, 0.75 + h, MILO[2]], { rot: -0.5 + v * 2.2 });
            } else if (v >= 0) {
                const d = nth(v, (2 * V0) / G);
                put3(gg, 'milo', 'stand', [MILO[0] + 0.12, 0, MILO[2]], { sx: [1.1, 0.96, 1][Math.min(2, d)], sy: [0.88, 1.05, 1][Math.min(2, d)] });
            } else put3(gg, 'milo', 'stand', [MILO[0] + e0.dx / s, 0, MILO[2]], { sx: e0.sx, sy: e0.sy * (1 + Motion.pulse(twos(u), 120, 0, 6) * 0.012) });
        } }] }));
        card(g, u, 1, 'MILO', 'HAS A PLAN', 1200, 760, { fill: C.navy, drop: C.ink, ink: C.navy });
    }

    // === 5 · Pip (2 s): through the lot of them, without looking up ==================================
    const pipRide = (t, X, Z) => ({ z: Z, draw(g) {
        const d = nth(t), [x, y] = Cam.pt([X, 0, Z]);
        // what she leaves behind her: three lines of speed
        for (let i = 0; i < 3; i++) T.line(g, [[x - 250 - i * 34 - (d % 2) * 26, y - 70 - i * 92], [x - 400 - i * 60 - (d % 2) * 26, y - 70 - i * 92]], { w: T.LINE, seed: 'pipspeed' + i });
        put3(g, 'pip', 'ride', [X, [0, 0.012][d % 2], Z], { rot: -0.04 + [0, 0.012][d % 2] });
    } });
    function pip(g, t, u, env) {
        const X = -3.2 + twos(u) * 3.3;
        view(g, env, [560 + 330 * ease(u / 2), 520], 1.3, 1.3, (e) => world(g, e, t, { actors: [kitRest(t), hoagieRest(t), miloRest(t), pipRide(t, X, 3.05)] }));
        card(g, u, 1, 'PIP', 'NOT BOTHERED', 1250, 250, { fill: C.lime, drop: C.green, ink: C.maroon, tilt: 0.06 });
    }

    // === 6 · Aunt Dot (2 s): at her hatch; chips up ==================================================
    function dot(g, t, u, env) {
        const A = Harbor.AT, hx = A.dot.hatch.reduce((s, p) => s + p[0], 0) / A.dot.hatch.length, hy = A.dot.hatch.reduce((s, p) => s + p[1], 0) / A.dot.hatch.length;
        const d = nth(u, 1), served = u >= 1;
        // (the hut is eight metres off: the others are left out of this one, they would stand in it)
        view(g, env, [hx + 46, hy + 6], 3, 3, (e) => world(g, e, t, {
            dot: served ? { pose: 'serve', weight: 2.2, up: 7 + [16, -3, 2, 0][Math.min(3, d)], dx: 2, sy: [1.06, 0.97, 1.01, 1][Math.min(3, d)] } : { weight: 2.2, up: 7 + Motion.pulse(twos(u), 120, 0, 6) * 2 },
        }));
        card(g, u, 1, 'AUNT DOT', 'MIND THE CURVE', 1180, 730, { fill: C.red, drop: C.maroon });
    }

    // === 7 · Captain (2 s): on his bollard, then off it =============================================
    function captain(g, t, u, env) {
        // he starts at every beat, a little more each time; on the last he is gone, straight up
        const h = hop(twos(u, 0.5) - 0.5, 0.9) + hop(twos(u, 1) - 1, 1.3), v = twos(u, 1.5) - 1.5;
        view(g, env, [1330, 470], 2.3, 2.3, (e) => world(g, e, t, { captain: { h: v >= 0 ? v * 9 : h, sy: v >= 0 ? 1.12 : 1, weight: 1.4 } }));
        card(g, u, 1, 'CAPTAIN', 'WANTED', 420, 730, { fill: C.navy, drop: C.ink, ink: C.navy });
    }

    // === 8 · the break (3 s): he has the chips; after him ==============================================
    function chase0(g, t, u, env) {
        // Captain, from the hatch to over our heads
        const k = clamp((twos(u) - 0.25) / 1.25, 0, 1), kk = k * k, cp = [lerp(-2.9, 4.6, kk), lerp(1.75, 2.9, k) + Math.sin(k * 9) * 0.08, lerp(7.9, 2.0, kk)];
        const bird = (gg) => k > 0 && k < 1 && put3(gg, 'captain', 'fly', cp, { rot: -0.08, k: 1.25 });
        // the four set off, one after another: a drawing of anticipation, then gone
        const go = (at, speed) => {
            const v = twos(u, at) - at;
            return v < 0 ? null : v < 1 / 12 ? { dx: -0.05, sy: 0.9, sx: 1.08, v } : { dx: speed * (v - 1 / 12) * (0.6 + 3 * (v - 1 / 12)), sy: 1, sx: 1, v };
        };
        const gk = go(2, 3.2), gh = go(2.25, 3.2), gm = go(2.5, 3.2), start = hop(twos(u, 1) - 1, 0.9);
        const kitA = { z: KIT[2], draw(gg) {
            if (!gk) { kitRest(t).draw(gg); return; }
            const [x, y] = Cam.pt([KIT[0] + 0.5 + gk.dx, 0, KIT[2]]);
            KitAct.stand(gg, x, y, (Cam.scale(KIT[2]) * 1.4) / 700, { droop: gk.v < 0.1 ? 0 : -0.35, lean: gk.v < 0.1 ? -0.04 : 0.07 });
        } };
        const hoagieA = { z: HOAGIE[2], draw(gg) {
            if (!gh) put3(gg, 'hoagie', 'film', [HOAGIE[0], start, HOAGIE[2]], {});
            else if (gh.v < 1 / 12) put3(gg, 'hoagie', 'film', HOAGIE, gh);
            else put3(gg, 'hoagie', 'jump', [HOAGIE[0] + gh.dx, 0.72 + hop(gh.v - 1 / 12, 2.6), HOAGIE[2]], { rot: 0.1 });
        } };
        const miloA = { z: MILO[2], draw(gg) {
            if (!gm) put3(gg, 'milo', 'stand', [MILO[0], start * 0.8, MILO[2]], {});
            else if (gm.v < 1 / 12) put3(gg, 'milo', 'stand', MILO, gm);
            else put3(gg, 'milo', 'fall', [MILO[0] + 0.3 + gm.dx, 0.7 + hop(gm.v - 1 / 12, 2.2), MILO[2]], { rot: -0.3 + gm.v * 2.5 });
        } };
        const actors = [kitA, hoagieA, miloA];
        if (u >= 1.5) actors.push(pipRide(t, -4.2 + (twos(u) - 1.5) * 6.4, 3.05));
        if (cp[2] > 3.9) actors.push({ z: cp[2], draw: bird });
        view(g, env, [800, 470], 1.06, 1.06, (e) => {
            world(g, e, t, { actors, captain: null, dot: { pose: 'serve', up: 7 + hop(twos(u, 0.5) - 0.5, 0.5) * 40 + Math.sin(twos(u) * 14) * 2 } });
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
        // the far shore, the town on it
        g.beginPath();
        g.moveTo(-20, 560);
        for (let x = -20; x <= 1620; x += 20) { const w = x + sc * 0.06; g.lineTo(x, 512 - 22 * Math.sin(w / 170) - 11 * Math.sin(w / 61 + 1)); }
        g.lineTo(1620, 560);
        g.closePath();
        g.fillStyle = C.palmLight;
        g.fill();
        stroke(T.LINE_BG);
        for (let i = 0; i < 9; i++) {
            const x = ((i * 233 - sc * 0.06) % 2100 + 2100) % 2100 - 250, hgt = 26 + ((i * 7) % 4) * 9, wd = 46 + ((i * 5) % 3) * 16;
            g.beginPath();
            g.rect(x, 520 - hgt, wd, hgt + 24);
            g.fillStyle = [C.teal, C.salmon, C.yellow, C.white][i % 4];
            g.fill();
            stroke(T.LINE_BG);
            g.beginPath();
            g.moveTo(x - 5, 520 - hgt); g.lineTo(x + wd / 2, 520 - hgt - 18); g.lineTo(x + wd + 5, 520 - hgt);
            g.closePath();
            g.fillStyle = C.red;
            g.fill();
            stroke(T.LINE_BG);
        }
        // the sea, its swell in three rows
        g.fillStyle = C.sea;
        g.fillRect(-10, 540, 1620, 900);
        g.beginPath(); g.moveTo(-10, 540); g.lineTo(1610, 540); stroke(T.LINE_BG);
        for (const [row, y, par, gap] of [[0, 578, 0.12, 210], [1, 716, 0.3, 300], [2, 838, 0.55, 380]]) {
            for (let i = 0; i < 12; i++) {
                const x = ((i * gap + row * 97 - sc * par) % (gap * 8) + gap * 8) % (gap * 8) - 200, a = 26 + row * 16, lift = (d + i) % 2 ? 0 : 3;
                g.beginPath();
                g.moveTo(x, y + lift); g.quadraticCurveTo(x + a / 2, y - 9 - row * 3 + lift, x + a, y + lift); g.quadraticCurveTo(x + a * 1.5, y - 9 - row * 3 + lift, x + a * 2, y + lift);
                stroke(T.LINE_BG + row * 0.5, row ? C.foam : C.seaDeep);
            }
        }
        const x1 = endX ?? 1700;
        // lamps along the far side of the deck
        for (let i = 0; i < 6; i++) {
            const x = ((i * 840 + 300 - sc) % 5040 + 5040) % 5040 - 400;
            if (x > x1 - 60) continue;
            g.beginPath(); g.rect(x - 6, 372, 12, DECK - 372); g.fillStyle = C.road; g.fill(); stroke(T.LINE_BG);
            g.beginPath(); g.moveTo(x - 22, 372); g.lineTo(x + 22, 372); g.lineTo(x + 15, 334); g.lineTo(x - 15, 334); g.closePath(); g.fillStyle = C.glass; g.fill(); stroke(T.LINE_BG);
            g.beginPath(); g.moveTo(x - 27, 334); g.lineTo(x, 314); g.lineTo(x + 27, 334); g.closePath(); g.fillStyle = C.road; g.fill(); stroke(T.LINE_BG);
        }
        // the piles and their braces, then the beam, then the deck with its plank ends
        const piles = [];
        for (let i = 0; i < 9; i++) {
            const x = ((i * 280 - sc) % 2520 + 2520) % 2520 - 300;
            if (x < x1 - 30) piles.push(x);
        }
        piles.sort((a, b) => a - b);
        for (const [i, x] of piles.entries()) {
            const nx = piles[i + 1];
            if (nx != null && nx - x < 300) for (const [ya, yb] of [[706, 884], [884, 706]]) {
                g.beginPath(); g.moveTo(x + 14, ya); g.lineTo(nx - 14, yb);
                stroke(15); stroke(9.5, C.woodDeep);
            }
        }
        for (const x of piles) {
            g.beginPath(); g.rect(x - 17, DECK + 40, 34, 320); g.fillStyle = C.trunk; g.fill(); stroke(T.LINE);
            g.beginPath(); g.moveTo(x - 8, DECK + 70); g.lineTo(x - 8, DECK + 210); g.moveTo(x + 6, DECK + 120); g.lineTo(x + 6, DECK + 250); stroke(T.LINE_FINE * 0.8);
        }
        g.beginPath(); g.rect(-20, DECK + 26, x1 + 20, 28); g.fillStyle = C.woodDeep; g.fill(); stroke(T.LINE);
        g.beginPath(); g.rect(-20, DECK, x1 + 26, 28); g.fillStyle = C.wood; g.fill(); stroke(T.LINE);
        g.beginPath();
        for (let i = 0; i < 40; i++) {
            const x = ((i * 46 - sc) % 1840 + 1840) % 1840 - 100;
            if (x < x1) { g.moveTo(x, DECK + 3); g.lineTo(x, DECK + 25); }
        }
        stroke(T.LINE_FINE * 0.9);
        if (endX != null) {
            // the end: a last post and what it says
            g.beginPath(); g.rect(endX - 96, DECK - 150, 12, 150); g.fillStyle = C.road; g.fill(); stroke(T.LINE_BG);
            T.slab(g, [[endX - 176, DECK - 232], [endX - 6, DECK - 240], [endX - 2, DECK - 150], [endX - 172, DECK - 142]], { fill: C.white, seed: 'endsign', over: 1.2, w: T.LINE });
            T.sign(g, 'NO', endX - 90, DECK - 198, { size: 40, fill: C.red, seed: 'end-a', w: T.LINE_FINE * 0.8, tilt: 0.03, outline: C.white });
            T.sign(g, 'RUNNING', endX - 90, DECK - 158, { size: 40, fill: C.red, seed: 'end-b', w: T.LINE_FINE * 0.8, tilt: 0.03, outline: C.white });
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
        kit(g, t, x, y) { const d = nth(t); KitAct.stand(g, x, y - [0, 3][d % 2], SK.kit, { droop: -0.3 + [0, 0.05][d % 2], crouch: [4, 9][d % 2], lean: 0.05 }); },
        pip(g, t, x, y) { const d = nth(t); put(g, 'pip', 'ride', x, y - [0, 3][d % 2], SK.pip, { rot: -0.04 }); },
        // Hoagie runs in leaps; Milo has stopped running and is still going
        hoagie(g, t, x, y) { const ph = (twos(t) * 2) % 1; put(g, 'hoagie', 'jump', x, y - 667 * SK.hoagie * 0.5 - 150 * ph * (1 - ph) * 4 * 0.5, SK.hoagie, { rot: 0.06 + (ph - 0.5) * 0.2 }); },
        milo(g, t, x, y) { const ph = (twos(t) * 2) % 1; put(g, 'milo', 'fall', x, y - 654 * SK.milo * 0.42 - 120 * ph * (1 - ph) * 4 * 0.5, SK.milo, { rot: twos(t) * 5.5 }); },
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
        put(g, 'captain', 'fly', 1320 + Math.sin(twos(u) * 5) * 24 - inn * 0.4, 250 + Math.sin(twos(u) * 7) * 26, SK.captain, { rot: -0.05 });
        for (const [who, x] of PACK) runner[who](g, t + x, x + inn * (1.4 - x / 1200), DECK);
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
        put(g, 'captain', 'fly', 1320 + cv * 260, 250 - cv * cv * 420, SK.captain, { rot: -0.25 });
        for (const [i, [who, x0]] of PACK.entries()) {
            const x = x0 + Math.max(0, uu - stop) * RUN, tl = stop + (END - x0) / RUN;
            if (uu < tl) { runner[who](g, t + x0, Math.min(x, END), DECK); continue; }
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
        put(g, 'captain', 'fly', 900 + Math.sin(uu * 3) * 30, 130 + Math.sin(uu * 4.2) * 14, SK.captain * 1.25, { rot: -0.06 });
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

    return { harbor, hoagie, milo, pip, dot, captain, chase0, pier, leap, hang, title, world, view, card, put, put3, twos, nth };
})();
