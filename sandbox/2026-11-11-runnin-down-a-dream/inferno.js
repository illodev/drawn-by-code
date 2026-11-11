// Hell as a rock venue, for the choruses, the bridge and the solo: the cavern where the band's
// car parks sideways as the stage (venue), its audience of imps and skeletons (crowd, fan), the
// Devil's private box over the pit (box), his flaming guitar (devilGuitar, guitarFromFire), the
// contract he tears up (tornContract) and the volcano that launches the car back up (volcano).
// Hell's look is the office's (segments/planb.js) and the mouth's (segments/verse1b.js): dark
// red rock with facets, cream teeth, lava in flat yellow and orange.
//
// THE SET'S COORDINATES. The venue is drawn in «wide» coordinates: the 1000 × 1000 frame of
// the wide view, the stage's floor line at y = 800. A view is a camera on that set:
//     'wide'   k = 1     the whole venue; the car stands at (500, 800) at Rig.CAR = 84
//     'stage'  k = 1.7   the stage area; the car stands at (500, 830) at s = 142.8
//     { k, cx, cy }      any other framing: (cx, cy) is the set point at the frame's centre
// `pan` moves the camera along x (set units, -380..380); every layer takes its own share of it.
// Outlines keep their width in every view (everything is redrawn, nothing is magnified).
// Inferno.stage(view, pan) gives where everything is ON SCREEN for a view (Inferno.STAGE holds
// the two named views at pan 0); Inferno.toScreen(view, pan, [x, y]) converts any set point.
//
// DRAW ORDER of a venue shot:
//     Inferno.venue(g, t, o)                       the backdrop, up to the stage's floor
//     Inferno.box(g, x, y, s, o, inside)           the Devil's box (he is drawn by `inside`)
//     Rig.band(g, t, car.x, car.y, car.s, …)       the stage
//     Inferno.beams(g, t, { …o, front: true })     optional: the spots again, thin, over the band
//     Inferno.crowd(g, t, o)                       the pit, in front of everything
//
// Units of the props (fan, devilGuitar, guitarFromFire, tornContract, box): figure units as in
// cast.js (1 ≈ a head's width, s = logical units per figure unit, the origin on the ground).
// Global: Inferno. Depends on Cereal, Cast, Devil, Fx, and on Song for the beat (without it
// the beat is counted at 170 BPM from t = 0).
const Inferno = (() => {
    const C = Cereal, K = C.COL, TAU = Math.PI * 2, PI = Math.PI;
    const D = [0.3, -0.2]; // the same as Cast.D: screen offset per unit of depth
    const Dd = (z) => [D[0] * z, D[1] * z];
    const lerp = (a, b, u) => a + (b - a) * u;
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const smooth = (u) => {
        const v = clamp(u);
        return v * v * (3 - 2 * v);
    };
    const seg = (v, a, b) => clamp((v - a) / (b - a));
    const back = (u) => {
        const v = clamp(u) - 1;
        return 1 + 2.7 * v * v * v + 1.7 * v * v;
    };
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const cw = (pts) => {
        let a = 0;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i], q = pts[(i + 1) % pts.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return a > 0 ? pts : pts.slice().reverse(); // positive area = clockwise when y points down
    };
    const shift = (pts, d) => pts.map(([x, y]) => [x + d[0], y + d[1]]);
    const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    const mix = (a, b, k) => {
        const A = hex(a), B = hex(b);
        return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * clamp(k)).toString(16).padStart(2, '0')).join('');
    };
    const line = (g, pts, lw, ink = K.ink) => C.poly(g, pts, { ink, lw, close: false });
    const circ = (g, x, y, r, fill, lw, ink = K.ink) => {
        g.beginPath();
        g.arc(x, y, Math.max(0, r), 0, TAU);
        if (fill) {
            g.fillStyle = fill;
            g.fill();
        }
        if (lw > 0) {
            g.strokeStyle = ink;
            g.lineWidth = lw;
            g.stroke();
        }
    };
    // A band of varying width along a centreline: [[x, y, halfWidth], …] → an outline.
    const ribbon = (cl) => {
        const A = [], B = [];
        cl.forEach(([x, y, w], i) => {
            const a = cl[Math.max(0, i - 1)], b = cl[Math.min(cl.length - 1, i + 1)];
            const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
            A.push([x - (dy / l) * w, y + (dx / l) * w]);
            B.push([x + (dy / l) * w, y - (dx / l) * w]);
        });
        return [...A, ...B.reverse()];
    };
    const pxScale = (g) => {
        const m = g.getTransform();
        return Math.max(0.05, Math.hypot(m.a, m.b));
    };
    // The beat at t: { k, since (beats, on twos), pulse }, from the song's clock when it is loaded.
    const beatAt = (t) => {
        if (typeof Song !== 'undefined') return Song.pulseAt(t);
        const B = 60 / 170, k = Math.floor(t / B + 1e-6), since = Math.floor((t - k * B) * 12 + 1e-6) / 12 / B;
        return { k, since, pulse: Math.exp(-since * 3.2) };
    };

    // Hell's rock (the office's wall, floor and glow), the teeth of its mouth, its lava.
    const R = {
        wall: '#8a1a2c', wallD: '#6a1221', wallL: '#a82338', top: '#c43349', deep: '#4a0c17', floor: '#3a0a14', pit: '#2a0810',
        far: '#5a0f1f', farD: '#4a0c1a', farL: '#6a1324', shelf: '#7a1626', shelfL: '#93203a',
        tooth: '#fff6e0', toothT: '#fffdf4', toothS: '#d9c39a',
        glow: '#ff8a2b', hot: '#ffe62e', white: '#fff59a',
        bone: '#f4edd8', boneTop: '#fffdf4', boneSide: '#cdbf9c',
    };

    // =========================================================================================
    // The camera
    // =========================================================================================
    const FLOOR = 800, SHELF = 764, LIP = 816, PIT = 858, SHORE = 566, PAN = 380;
    const VIEW = { wide: { k: 1, cx: 500, cy: 500 }, stage: { k: 1.7, cx: 500, cy: FLOOR - 330 / 1.7 } };
    const Q = { far: 0.3, col: 0.6 }; // the far wall's and the columns' share of the camera's travel
    function cam(view = 'wide', pan = 0) {
        const v = typeof view === 'string' ? VIEW[view] ?? VIEW.wide : { k: view.k ?? 1, cx: view.cx ?? 500, cy: view.cy ?? 500 };
        return { k: v.k, cx: clamp(v.cx + pan, 500 - PAN, 500 + PAN), cy: v.cy };
    }
    // A set point on screen; q: its layer's share of the camera's travel (1 = the stage's plane).
    const scr = (V, x, y, q = 1) => [(x - 500 - (V.cx - 500) * q) * V.k + 500, (y - V.cy) * V.k + 500];
    const toScreen = (view, pan, p, q = 1) => scr(cam(view, pan), p[0], p[1], q);
    // Draw in set coordinates: fn(L) gets the factor that keeps a line's width (lw · L).
    function layer(g, V, q, fn) {
        g.save();
        g.translate(500, 500);
        g.scale(V.k, V.k);
        g.translate(-(500 + (V.cx - 500) * q), -V.cy);
        fn(1 / V.k);
        g.restore();
    }
    // A static layer, painted once per view scale (Motion.sprite) and pasted. Call inside
    // layer(). A zoom that keeps changing would paint a sprite a frame: only the three
    // latest scales of a layer are kept.
    const kept = new Map();
    function still(g, key, box, paint) {
        const scale = pxScale(g), id = key + '@' + scale.toFixed(4), list = kept.get(key) ?? [];
        if (!list.includes(id)) {
            list.push(id);
            if (list.length > 3) Motion.cache.delete(list.shift());
            kept.set(key, list);
        }
        Motion.sprite(key, box, scale, paint).draw(g);
    }

    // =========================================================================================
    // The venue's pieces (set coordinates; L = the line-width factor of the view)
    // =========================================================================================
    // Rock facets, as on the office's wall: flat quads, a third of them catching the light.
    function facets(g, seed, n, box, lit, dark, size = 1) {
        const r = Motion.rng(seed);
        for (let i = 0; i < n; i++) {
            const x = box[0] + r() * box[2], y = box[1] + r() * box[3], w = (50 + r() * 90) * size, h = (30 + r() * 50) * size, l = r() < 0.34;
            C.poly(g, [[x, y], [x + w * 0.6, y - h * 0.4], [x + w, y + h * 0.2], [x + w * 0.5, y + h * 0.7]], { fill: l ? lit : dark, lw: 0 });
        }
    }
    // A tooth hanging from (x, y0): a cream solid with its shaded half and a highlight.
    function tooth(g, L, x, y0, w, h, lean = 0, up = false) {
        const s = up ? -1 : 1, tip = [x + lean, y0 + s * h];
        const pts = cw([[x - w / 2, y0], [x + w / 2, y0], [tip[0] + w * 0.07, tip[1]], [tip[0] - w * 0.07, tip[1]]]);
        C.prism(g, pts, [w * 0.16, -w * 0.105], { front: R.tooth, top: R.toothT, side: R.toothS }, { lw: 3.2 * L });
        C.poly(g, [[x + w * 0.12, y0 + s * 3 * L], [x + w / 2 - 2 * L, y0 + s * 3 * L], [tip[0] + w * 0.05, tip[1] - s * 4 * L]], { fill: R.toothS, lw: 0 });
        line(g, [[x - w * 0.24, y0 + s * h * 0.16], [x - w * 0.2 + lean * 0.4, y0 + s * h * 0.5]], 2.4 * L, R.toothT);
        C.poly(g, pts, { ink: K.ink, lw: 3.2 * L });
    }
    // A zigzag crack between two points (seeded).
    const crackPts = (seed, a, b, n = 5, amp = 9) => {
        const r = Motion.rng(seed), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
        return Array.from({ length: n + 1 }, (_, i) => {
            const u = i / n, o = i === 0 || i === n ? 0 : (i % 2 ? 1 : -1) * amp * (0.5 + r() * 0.7);
            return [a[0] + dx * u + nx * o, a[1] + dy * u + ny * o];
        });
    };
    function glowCrack(g, L, pts, on, heat = 1) {
        line(g, pts, 8 * L, K.ink);
        line(g, pts, 3.4 * L, on ? mix(R.glow, R.hot, heat) : mix('#c2281f', R.glow, heat));
    }

    // --- the far wall: facets, a low ceiling with stalactites, three mouths that pour lava,
    // spires on the lake's far shore --------------------------------------------------------
    const FALLS = [[-140, 262, 40], [205, 250, 40], [500, 204, 30], [795, 262, 44], [1130, 240, 38]]; // [x, the lip's y, width]
    const FAR_BOX = { x: -260, y: -90, w: 1520, h: 680 };
    function farWall(g, L) {
        const X0 = FAR_BOX.x, X1 = X0 + FAR_BOX.w;
        g.fillStyle = R.far;
        g.fillRect(X0, -90, X1 - X0, 680);
        facets(g, 'inferno-far', 70, [X0, 150, X1 - X0, 400], R.farL, R.farD);
        // strata: a few long ledges that catch the glow from below
        const rs = Motion.rng('inferno-strata');
        for (let i = 0; i < 9; i++) {
            const x = X0 + rs() * (X1 - X0 - 200), y = 300 + rs() * 230, w = 120 + rs() * 160;
            C.poly(g, [[x, y], [x + w * 0.3, y - 7], [x + w, y - 3], [x + w * 0.8, y + 5], [x + w * 0.2, y + 6]], { fill: R.wallD, lw: 0 });
        }
        // the ceiling: a darker mass with a broken lower edge, and its stalactites
        const rc = Motion.rng('inferno-ceil'), edge = [[X0, -90], [X1, -90]];
        for (let x = X1; x >= X0 - 1; x -= 60) edge.push([x, 118 + rc() * 40]);
        C.poly(g, edge, { fill: R.deep, ink: K.ink, lw: 3 * L });
        for (let x = X0 + 20; x < X1; x += 44 + rc() * 52) {
            const w = 11 + rc() * 13, h = 36 + rc() * 92, y = 126 + rc() * 16;
            C.prism(g, [[x - w, y], [x + w, y], [x + w * 0.1, y + h]], [5, -3.5], { front: R.deep, top: R.deep, side: R.floor }, { lw: 2.6 * L });
        }
        // the mouths the lava pours from: an arch with a rock lip, two fangs, a chin
        for (const [x, y, w] of FALLS) {
            const m = new Path2D(), hw = w * 0.95, hh = w * 1.25;
            m.moveTo(x - hw, y + 2);
            m.lineTo(x - hw, y - hh * 0.45);
            m.quadraticCurveTo(x - hw, y - hh, x, y - hh);
            m.quadraticCurveTo(x + hw, y - hh, x + hw, y - hh * 0.45);
            m.lineTo(x + hw, y + 2);
            m.closePath();
            g.fillStyle = R.floor;
            g.fill(m);
            g.lineJoin = 'round';
            g.strokeStyle = K.ink;
            g.lineWidth = 13 * L;
            g.stroke(m);
            g.strokeStyle = R.wallL;
            g.lineWidth = 7 * L;
            g.stroke(m);
            for (const sx of [-1, 1]) C.poly(g, [[x + sx * hw * 0.78, y - hh * 0.62], [x + sx * hw * 0.3, y - hh * 0.88], [x + sx * hw * 0.5, y - hh * 0.3]], { fill: R.tooth, ink: K.ink, lw: 2.4 * L });
            C.box(g, x - hw - 10, y, hw * 2 + 20, 10, [9, -6], { front: R.wallL, top: R.top, side: R.wallD }, { lw: 3 * L });
        }
        // spires on the far shore (none in front of a fall)
        const rp = Motion.rng('inferno-spires');
        for (let x = X0 + 30; x < X1; x += 38 + rp() * 60) {
            const h = 26 + rp() * 86, w = 18 + rp() * 12;
            if (FALLS.some(([fx, , fw]) => Math.abs(x - fx) < fw + w + 8)) continue;
            C.prism(g, [[x - w, SHORE + 8], [x - w * 0.25, SHORE + 8 - h], [x + w * 0.3, SHORE + 8 - h * 0.8], [x + w, SHORE + 8]], [6, -4], { front: R.shelf, top: R.wallL, side: R.deep }, { lw: 2.6 * L });
        }
    }

    // A lava fall: a hard-edged column whose streaks run down on twos, and its splash.
    function fall(g, L, x, y, w, d, heat) {
        const y1 = SHORE + 14, h = y1 - y, body = mix(R.glow, R.hot, heat), streak = mix('#f0352f', R.glow, heat);
        g.fillStyle = body;
        g.fillRect(x - w / 2, y, w, h);
        g.save();
        g.beginPath();
        g.rect(x - w / 2, y, w, h);
        g.clip();
        g.fillStyle = streak;
        for (let i = 0; i < 7; i++) g.fillRect(x - w / 2 + ((i * 17) % (w - 9)), y - 44 + ((i * 61 + d * 22) % (h + 44)), 8, 44);
        g.fillStyle = mix(R.hot, R.white, heat);
        for (let i = 0; i < 3; i++) g.fillRect(x - w / 2 + 4 + ((i * 23) % (w - 12)), y - 30 + ((i * 97 + d * 30) % (h + 30)), 4.5, 30);
        g.restore();
        line(g, [[x - w / 2, y], [x - w / 2, y1]], 3 * L);
        line(g, [[x + w / 2, y], [x + w / 2, y1]], 3 * L);
        // the splash: a scalloped foot, two drawings
        const f = ((d % 2) + 2) % 2, sp = [];
        for (let i = 0; i <= 12; i++) {
            const a = PI + (i / 12) * PI, bump = (i + f) % 2 ? 1 : 0.62;
            sp.push([x + Math.cos(a) * (w * 0.5 + 16) * (0.8 + 0.2 * bump), y1 + 6 + Math.sin(a) * 15 * bump]);
        }
        C.poly(g, sp, { fill: mix(R.hot, R.white, heat), ink: K.ink, lw: 2.6 * L });
        for (const sx of [-1, 1]) circ(g, x + sx * (w * 0.5 + 22 + f * 5), y1 - 12 - f * 7, 3.2, body, 2.2 * L);
    }

    // --- the lake: flat bands, streaks that drift, crust, slow bubbles on twos ------------------
    function lake(g, V, t, heat, Y0 = SHORE, Y1 = SHELF, near = true, mult = 1) {
        const t2 = C.onTwos(t), base = mix('#b8261f', '#e2501f', heat), far = mix('#8f1d1c', '#c2361f', heat), hot = mix('#e0451f', R.glow, heat), white = mix(R.glow, R.hot, heat);
        layer(g, V, 1, (L) => {
            g.fillStyle = base;
            g.fillRect(-600, Y0, 2200, Y1 + 4 - Y0);
            g.fillStyle = far;
            g.fillRect(-600, Y0, 2200, 30);
            if (near) {
                g.fillStyle = hot;
                g.fillRect(-600, Y1 - 46, 2200, 50);
            }
        });
        const rs = Motion.rng('inferno-lake');
        const depthQ = (y) => lerp(Q.far, 1, seg(y, Y0, Y1));
        // streaks
        for (let i = 0; i < 30 * mult; i++) {
            const y = Y0 + 12 + rs() * (Y1 - Y0 - 20), len = 30 + rs() * 70, sp = 3 + rs() * 7, x0 = rs() * 1900, bright = rs() < 0.35, q = depthQ(y);
            const x = -450 + ((x0 + t2 * sp) % 1900);
            layer(g, V, q, (L) => line(g, [[x, y], [x + len, y]], (bright ? 3.4 : 2.6) * L, bright ? white : y < Y0 + 60 ? base : hot));
        }
        // crust: dark plates adrift
        for (let i = 0; i < 9 * mult; i++) {
            const y = Y0 + 30 + rs() * (Y1 - Y0 - 70), w = 40 + rs() * 46, x0 = rs() * 1900, q = depthQ(y), x = -450 + ((x0 + t2 * 2.2) % 1900), sk = rs() * 6;
            layer(g, V, q, (L) => {
                const p = [[x, y], [x + w * 0.3, y - 7], [x + w * 0.8, y - 6 + sk * 0.3], [x + w, y + 1], [x + w * 0.72, y + 7], [x + w * 0.2, y + 6]];
                C.poly(g, p, { fill: R.shelf, ink: K.ink, lw: 2.6 * L });
                line(g, [[x + w * 0.24, y - 3.4], [x + w * 0.7, y - 3]], 2 * L, R.wallL);
            });
        }
        // bubbles: each swells for a second, holds, and bursts into a ring and three drops
        const n = Math.round((6 + 6 * heat) * mult);
        for (let i = 0; i < 12 * mult; i++) {
            const y = Y0 + 34 + rs() * (Y1 - Y0 - 60), x = -300 + rs() * 1600, T = 1.7 + rs() * 1.4, ph = rs() * T, r0 = 9 + rs() * 9, q = depthQ(y);
            if (i >= n) continue;
            const u = ((t2 + ph) % T) / T;
            layer(g, V, q, (L) => {
                if (u < 0.74) {
                    const r = r0 * (0.35 + 0.65 * Math.min(1, u / 0.5));
                    const dome = C.ellipsePts(x, y, r, r * 0.86, 14, 0, PI, TAU);
                    C.poly(g, dome, { fill: white, ink: K.ink, lw: 2.6 * L });
                    line(g, [[x - r * 0.5, y - r * 0.3], [x - r * 0.2, y - r * 0.62]], 2.2 * L, '#ffffff');
                    line(g, [[x - r - 5, y], [x + r + 5, y]], 2.4 * L, hot);
                } else if (u < 0.86) {
                    g.beginPath();
                    g.ellipse(x, y, r0 * 1.5, r0 * 0.42, 0, 0, TAU);
                    g.strokeStyle = white;
                    g.lineWidth = 3 * L;
                    g.stroke();
                    for (const [dx, dy] of [[-0.9, -1.1], [0.1, -1.6], [0.95, -0.9]]) circ(g, x + dx * r0, y + dy * r0, 2.8, white, 2 * L);
                }
            });
        }
    }

    // --- columns: a stalactite and a stalagmite grown into one, with drip ledges -------------
    const COLS = [-190, 92, 345, 655, 908, 1190];
    const COL_BOX = { x: -330, y: -90, w: 1660, h: 800 };
    function column(g, L, x, i) {
        const r = Motion.rng('inferno-col' + i), base = 652 + r() * 44, waist = 330 + r() * 60, k = 0.86 + r() * 0.3;
        const prof = [[-90, 56], [60, 44], [150, 34], [waist - 70, 21], [waist, 13], [waist + 80, 18], [base - 110, 27], [base - 46, 38], [base, 52]];
        const left = [], right = [];
        prof.forEach(([y, hw], j) => {
            const step = j > 0 && j < prof.length - 1 ? 4 + r() * 5 : 0, a = hw * k + (r() - 0.5) * 4;
            // a ledge at every knot: the outline steps in or out
            left.push([x - a - step, y - 4], [x - a, y + 4]);
            right.push([x + a + step, y - 4], [x + a, y + 4]);
        });
        // the lava laps at its foot
        g.beginPath();
        g.ellipse(x + 8, base, 52 * k + 18, 10, 0, 0, TAU);
        g.fillStyle = R.hot;
        g.fill();
        const pts = cw([...left, ...right.reverse()]);
        C.prism(g, pts, [17, -11], { front: R.wall, top: R.top, side: R.wallD }, { lw: 3.2 * L });
        g.save();
        C.trace(g, pts);
        g.clip();
        facets(g, 'inferno-colf' + i, 12, [x - 60, 0, 90, base], R.wallL, R.wallD, 0.5);
        // lit from below by the lake
        C.poly(g, [[x - 120, base - 30], [x + 120, base - 42], [x + 120, base + 10], [x - 120, base + 10]], { fill: R.top, lw: 0 });
        C.poly(g, [[x - 120, base - 9], [x + 120, base - 14], [x + 120, base + 10], [x - 120, base + 10]], { fill: '#f0602b', lw: 0 });
        g.restore();
        // ring lines under the ledges
        for (let j = 1; j < prof.length - 1; j++) {
            const [y, hw] = prof[j], a = hw * k;
            line(g, [[x - a + 3, y + 5], [x - a * 0.2, y + 9], [x + a * 0.5, y + 6]], 2.2 * L, R.deep);
        }
        C.poly(g, pts, { ink: K.ink, lw: 3.2 * L });
    }

    // --- the stage's plane: the rock shelf the car stands on, its lip, the pit below it with a
    // row of lower teeth, the pillars of the proscenium and the two speaker stacks -----------
    const STAGE_BOX = { x: -440, y: -90, w: 1880, h: 1190 };
    const STACK = { w: 112, h: 100, d: [26, -17], base: 782, xs: [30, 858] };
    const cones = (x0) => [0, 1].flatMap((lvl) => [0.28, 0.72].flatMap((u) => [0.3, 0.72].map((v) => [x0 + STACK.w * u, STACK.base - (lvl + 1) * STACK.h + STACK.h * v])));
    function rockStack(g, L, x0) {
        const { w, h, d, base } = STACK;
        for (const lvl of [0, 1]) {
            const y = base - (lvl + 1) * h;
            C.box(g, x0, y, w, h, d, { front: R.wallL, top: R.top, side: R.wallD }, { lw: 3.2 * L });
            // the baffle: a sunk panel, chipped at two corners
            C.poly(g, [[x0 + 9, y + 9], [x0 + w - 20, y + 9], [x0 + w - 9, y + 20], [x0 + w - 9, y + h - 9], [x0 + 20, y + h - 9], [x0 + 9, y + h - 20]], { fill: R.wall, ink: K.ink, lw: 2.4 * L });
            for (const [cx, cy] of cones(x0).slice(lvl * 4, lvl * 4 + 4)) {
                circ(g, cx, cy, 19, R.floor, 2.6 * L);
                circ(g, cx, cy, 13.5, R.deep, 0);
            }
            line(g, crackPts('stk' + x0 + lvl, [x0 + w - 4, y + 30], [x0 + w - 38, y + 52], 3, 5), 2.2 * L);
        }
        // a few facets on the side and the top's chipped edge
        line(g, [[x0 + w + d[0] * 0.5, base - h * 2 + d[1] * 0.5 + 6], [x0 + w + d[0] * 0.5, base + d[1] * 0.5 - 6]], 2.2 * L, R.deep);
        // the brazier on top: a rock bowl on a foot
        const bx = x0 + w / 2 + d[0] / 2, by = base - h * 2 + d[1] / 2;
        C.prism(g, cw([[bx - 14, by + 4], [bx - 20, by - 10], [bx + 20, by - 10], [bx + 14, by + 4]]), [6, -4], { front: R.wallD, top: R.deep, side: R.deep }, { lw: 2.8 * L });
        C.prism(g, cw([[bx - 36, by - 10], [bx - 42, by - 30], [bx + 42, by - 30], [bx + 36, by - 10]]), [9, -6], { front: R.wall, top: R.floor, side: R.wallD }, { lw: 3.2 * L });
        line(g, [[bx - 34, by - 22], [bx + 34, by - 22]], 2.2 * L, R.wallL);
    }
    const brazierAt = (x0) => [x0 + STACK.w / 2 + STACK.d[0] / 2 + 4, STACK.base - STACK.h * 2 + STACK.d[1] / 2 - 30];
    function pillar(g, L, side) {
        // the proscenium's leg: a mass of rock from the pit to the gum, a ragged inner edge
        const r = Motion.rng('inferno-pillar' + side), X = side < 0 ? -440 : 988, W = side < 0 ? 452 : 452, inner = [];
        for (let y = -90; y <= 1110; y += 70) inner.push([(side < 0 ? X + W : X) + (r() - 0.5) * 16, y]);
        const pts = side < 0 ? cw([[X, -90], ...inner, [X, 1110]]) : cw([[X + W, -90], [X + W, 1110], ...inner.slice().reverse()]);
        if (side < 0) C.prism(g, pts, [30, -20], { front: R.wall, top: R.top, side: R.wallD }, { lw: 3.6 * L });
        else C.poly(g, pts, { fill: R.wall, ink: K.ink, lw: 3.6 * L });
        g.save();
        C.trace(g, pts);
        g.clip();
        facets(g, 'inferno-pf' + side, 46, [X, -40, W, 1100], R.wallL, R.wallD);
        // niches with a skull and a candle stub, a glowing crack between them
        for (const [nx, ny] of side < 0 ? [[-150, 330], [-300, 560], [-110, 640]] : [[1150, 250], [1290, 480], [1120, 690]]) {
            const m = new Path2D();
            m.moveTo(nx - 34, ny);
            m.lineTo(nx - 34, ny - 46);
            m.quadraticCurveTo(nx - 34, ny - 84, nx, ny - 84);
            m.quadraticCurveTo(nx + 34, ny - 84, nx + 34, ny - 46);
            m.lineTo(nx + 34, ny);
            m.closePath();
            g.fillStyle = R.floor;
            g.fill(m);
            g.strokeStyle = K.ink;
            g.lineWidth = 11 * L;
            g.stroke(m);
            g.strokeStyle = R.top;
            g.lineWidth = 5.5 * L;
            g.stroke(m);
            C.box(g, nx - 42, ny, 84, 9, [8, -5], { front: R.wallL, top: R.top, side: R.wallD }, { lw: 3 * L });
            miniSkull(g, L, nx, ny - 1, 38);
        }
        g.restore();
        C.poly(g, pts, { ink: K.ink, lw: 3.6 * L });
    }
    // A little box skull facing us (niches, the box's lamp). (x, y): the middle of its base.
    function miniSkull(g, L, x, y, w, glow = null, plain = false) {
        const h = w * 0.82, jw = w * 0.62, d = [w * 0.16, -w * 0.105];
        const sk = [[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y - h * 0.36], [x + jw / 2, y - h * 0.28], [x + jw / 2, y], [x - jw / 2, y], [x - jw / 2, y - h * 0.28], [x - w / 2, y - h * 0.36]];
        C.prism(g, sk, d, { front: R.bone, top: R.boneTop, side: R.boneSide }, { lw: 2.8 * L });
        for (const sx of [-1, 1]) {
            g.beginPath();
            g.roundRect(x + sx * w * 0.21 - w * 0.12, y - h * 0.8, w * 0.24, h * 0.34, w * 0.05);
            g.fillStyle = glow ?? '#2a2438';
            g.fill();
            if (glow && !plain) {
                g.strokeStyle = K.ink;
                g.lineWidth = 2 * L;
                g.stroke();
            }
        }
        C.poly(g, [[x, y - h * 0.44], [x + w * 0.06, y - h * 0.32], [x - w * 0.06, y - h * 0.32]], { fill: '#2a2438', lw: 0 });
        g.strokeStyle = K.ink;
        g.lineWidth = 1.8 * L;
        g.beginPath();
        g.moveTo(x - jw / 2, y - h * 0.15);
        g.lineTo(x + jw / 2, y - h * 0.15);
        for (let i = -1; i <= 1 && !plain; i++) {
            g.moveTo(x + i * jw * 0.25, y - h * 0.27);
            g.lineTo(x + i * jw * 0.25, y);
        }
        g.stroke();
    }
    const CRACKS = [[[90, 830], [150, 846]], [[258, 826], [330, 850]], [[470, 832], [520, 848]], [[640, 824], [700, 846]], [[836, 834], [900, 850]], [[-160, 830], [-90, 848]], [[1100, 828], [1170, 846]], [[196, 912], [290, 936]], [[560, 968], [690, 950]], [[820, 902], [930, 918]]];
    function stagePlane(g, L) {
        const X0 = STAGE_BOX.x, X1 = X0 + STAGE_BOX.w;
        // the shelf's top: slabs, a broken front edge
        g.fillStyle = R.shelf;
        g.fillRect(X0, SHELF, X1 - X0, LIP - SHELF + 6);
        const r = Motion.rng('inferno-shelf');
        for (let x = X0; x < X1; x += 90 + r() * 80) {
            const w = 50 + r() * 60, y = SHELF + 6 + r() * 30;
            C.poly(g, [[x, y], [x + w, y - 3], [x + w + 14, y + 9], [x + 10, y + 12]], { fill: R.shelfL, lw: 0 });
        }
        for (let x = X0 + 40; x < X1; x += 130 + r() * 70) line(g, [[x, SHELF + 2], [x + 16, SHELF + 22 + r() * 14]], 2.2 * L, R.deep);
        line(g, [[X0, SHELF], [X1, SHELF]], 3.2 * L);
        // the lip's face and the pit's floor
        const edge = [];
        for (let x = X0; x <= X1 + 1; x += 47) edge.push([x, LIP + (r() - 0.5) * 7]);
        C.poly(g, [...edge, [X1, 1100], [X0, 1100]], { fill: R.floor, lw: 0 });
        line(g, edge, 3.6 * L);
        g.fillStyle = R.pit;
        g.fillRect(X0, PIT, X1 - X0, 1100 - PIT);
        facets(g, 'inferno-pit', 30, [X0, PIT + 20, X1 - X0, 180], R.floor, '#220610', 0.9);
        line(g, [[X0, PIT], [X1, PIT]], 3.2 * L);
        // the lower teeth, standing at the foot of the lip
        for (let x = X0 + 30, i = 0; x < X1; x += 52, i++) tooth(g, L, x + (r() - 0.5) * 8, PIT + 2, 26 + (i % 3) * 3, 26 + ((i * 5) % 4) * 4, (r() - 0.5) * 5, true);
        pillar(g, L, -1);
        pillar(g, L, 1);
        for (const x0 of STACK.xs) rockStack(g, L, x0);
    }

    // --- the top: the proscenium's upper jaw, the lighting rig's stalactites, the banner ---
    const TOP_BOX = { x: -440, y: -90, w: 1880, h: 560 };
    const LAMPS = [[164, 296], [248, 262], [416, 232], [584, 232], [752, 262], [836, 296]]; // the pivots
    const AIM = [300, 410, 455, 545, 590, 700]; // where each spot rests on the floor
    const BEAM = [K.yellow, K.aqua, K.pink, K.pink, K.aqua, K.yellow];
    const BANNER = { x: 360, y: 340, w: 280, h: 86 };
    const TEETH = (() => {
        const r = Motion.rng('inferno-teeth'), out = [];
        for (let i = -11; i <= 10; i++) {
            const x = 542 + i * 84, e = clamp((Math.abs(x - 500) - 170) / 270);
            out.push([x, 60 + (r() - 0.5) * 6, 64 + 84 * e * e + (r() - 0.5) * 16, (r() - 0.5) * 8 + (x < 500 ? 5 : -5) * e]);
        }
        return out;
    })();
    function topPiece(g, L) {
        const X0 = TOP_BOX.x, X1 = X0 + TOP_BOX.w;
        // the rig's stalactites hang behind the teeth, each ending in a knuckle for its lamp
        for (const [x, y] of LAMPS) {
            C.prism(g, cw([[x - 15, 50], [x + 15, 50], [x + 4.5, y - 4], [x - 4.5, y - 4]]), [7, -4.5], { front: R.wallD, top: R.wallD, side: R.deep }, { lw: 3 * L });
            line(g, [[x - 5, 100], [x - 2.5, y - 30]], 2.2 * L, R.wall);
        }
        // the banner: a bone for a pole on two chains, a cloth with a border and a fringe
        const B = BANNER, py = B.y - 9;
        for (const cx of [B.x + 16, B.x + B.w - 16]) {
            line(g, [[cx, 70], [cx, py]], 6.5 * L);
            g.strokeStyle = '#c9cfe2';
            g.lineWidth = 2.6 * L;
            g.setLineDash([7, 5]);
            g.beginPath();
            g.moveTo(cx, 70);
            g.lineTo(cx, py);
            g.stroke();
            g.setLineDash([]);
        }
        C.box(g, B.x - 8, B.y - 4, B.w + 16, B.h + 12, [5, -3.4], { front: K.magenta, top: K.pink, side: '#a8176a' }, { lw: 3.2 * L });
        // the fringe: a row of gold points under the cloth
        const fr = [];
        for (let i = 0; i <= 28; i++) fr.push([B.x - 8 + ((B.w + 16) * i) / 28, B.y + B.h + 8 + (i % 2 ? 12 : 0)]);
        C.poly(g, [[B.x - 8, B.y + B.h + 8], ...fr, [B.x + B.w + 8, B.y + B.h + 8]], { fill: K.gold, ink: K.ink, lw: 2.6 * L });
        C.poly(g, [[B.x, B.y + 4], [B.x + B.w, B.y + 4], [B.x + B.w, B.y + B.h], [B.x, B.y + B.h]], { fill: K.cream, ink: K.ink, lw: 2.6 * L });
        // the pole: a long bone with its knuckles
        C.poly(g, [[B.x - 22, py - 5], [B.x + B.w + 22, py - 5], [B.x + B.w + 22, py + 5], [B.x - 22, py + 5]], { fill: R.bone, ink: K.ink, lw: 2.8 * L });
        line(g, [[B.x - 14, py - 1.5], [B.x + B.w + 14, py - 1.5]], 2 * L, R.boneTop);
        for (const ex of [B.x - 24, B.x + B.w + 24]) for (const dy of [-5.5, 5.5]) circ(g, ex, py + dy, 6.5, R.bone, 2.6 * L);
        // the upper jaw: teeth, then the gum over their roots
        for (const [x, w, h, lean] of TEETH) tooth(g, L, x, 60, w, h, lean);
        const gum = [[X0, -90], [X1, -90], [X1, 74]];
        for (let i = TEETH.length - 1; i >= 0; i--) {
            const x = TEETH[i][0];
            for (let j = 0; j <= 8; j++) {
                const a = (j / 8) * PI;
                gum.push([x + Math.cos(a) * 42, 70 + Math.sin(a) * 15]);
            }
        }
        gum.push([X0, 74]);
        C.poly(g, gum, { fill: R.wallL, ink: K.ink, lw: 3.6 * L });
        g.save();
        C.trace(g, gum);
        g.clip();
        g.fillStyle = R.wall;
        g.fillRect(X0, -90, X1 - X0, 140);
        facets(g, 'inferno-gum', 34, [X0, -40, X1 - X0, 70], R.wallD, R.deep, 0.8);
        g.restore();
        for (const [x] of TEETH) line(g, C.ellipsePts(x, 66, 30, 11, 8, 0, PI * 0.15, PI * 0.85), 2.2 * L, R.top);
        C.poly(g, gum, { ink: K.ink, lw: 3.6 * L });
    }

    // Where the spots point at t: each lamp's floor point (set coordinates). They rest when the
    // house is cold and swing a step per beat when it is hot.
    function aims(t, heat) {
        const P = beatAt(t), ph = P.k + smooth(Math.min(1, P.since / 0.5));
        return LAMPS.map((_, i) => AIM[i] + 150 * smooth(heat * 1.4) * Math.sin((ph + i * 0.66) * PI * 0.5) * (i % 2 ? -1 : 1));
    }
    const lit = (i, heat) => (heat < 0.15 ? i === 1 || i === 4 : heat < 0.4 ? i % 3 !== 0 || heat > 0.3 : true);
    /**
     * The spot beams alone: hard-edged, flat, one colour each. venue() draws them; call it again
     * after the band with { front: true } for a thin second pass over the players.
     *   o: { view, pan, heat, beatK, front }
     */
    function beams(g, t, o = {}) {
        const V = cam(o.view, o.pan), heat = clamp(o.heat ?? 0.6), bk = clamp(o.beatK ?? 0), tx = aims(t, heat);
        const a = (o.front ? 0.1 : 0.14 + 0.2 * heat) + 0.1 * bk * heat;
        layer(g, V, 1, () => {
            g.save();
            g.globalCompositeOperation = 'screen';
            LAMPS.forEach(([x, y], i) => {
                if (!lit(i, heat)) return;
                const ang = Math.atan2(FLOOR - 6 - y, tx[i] - x), ux = Math.cos(ang), uy = Math.sin(ang), rx = 64 + 22 * heat + 14 * bk;
                g.globalAlpha = a;
                g.fillStyle = BEAM[i];
                g.beginPath();
                g.moveTo(x + ux * 34 + uy * 17, y + uy * 34 - ux * 17);
                g.lineTo(x + ux * 34 - uy * 17, y + uy * 34 + ux * 17);
                g.lineTo(tx[i] - rx, FLOOR - 6);
                g.lineTo(tx[i] + rx, FLOOR - 6);
                g.closePath();
                g.fill();
                if (!o.front) {
                    g.globalAlpha = a + 0.12;
                    g.beginPath();
                    g.ellipse(tx[i], FLOOR - 6, rx, 15, 0, 0, TAU);
                    g.fill();
                }
            });
            g.restore();
        });
    }
    // The lamps: a rock can on a yoke, turned to its beam (by its points), a lit lens.
    function lamps(g, V, t, heat, bk) {
        const tx = aims(t, heat);
        layer(g, V, 1, (L) => {
            LAMPS.forEach(([x, y], i) => {
                const ang = Math.atan2(FLOOR - 6 - y, tx[i] - x), at = (u, v) => [x + Math.cos(ang) * u - Math.sin(ang) * v, y + Math.sin(ang) * u + Math.cos(ang) * v];
                const on = lit(i, heat);
                C.prism(g, cw([at(-10, -13), at(30, -19), at(30, 19), at(-10, 13)]), [7, -4.5], { front: R.wallL, top: R.top, side: R.wallD }, { lw: 3 * L });
                line(g, [at(2, -15), at(2, 15)], 2.2 * L, R.wallD);
                C.poly(g, cw([at(30, -19), at(37, -17), at(37, 17), at(30, 19)]), { fill: on ? mix(BEAM[i], '#ffffff', 0.35 + 0.5 * bk) : R.deep, ink: K.ink, lw: 2.6 * L });
                circ(g, x, y, 6.5, R.wallD, 2.6 * L);
            });
        });
    }
    // A flame of the film's kind at a set point (drawn in screen space: its line keeps its width).
    const flameAt = (g, V, q, x, y, size, d, seed) => {
        const p = scr(V, x, y, q);
        Fx.flame(g, p[0], p[1], size * V.k, d, seed);
    };

    /**
     * Hell as a rock venue: the whole backdrop, up to the floor the car stands on.
     *   o: { view ('wide' | 'stage' | { k, cx, cy }), pan (-380..380 set units, the camera's x offset),
     *        heat (0..1: 0 a cold house with two dim work lights, 1 lava bright, flames high, six spots swinging),
     *        beatK (0..1, a pulse on the beat: the stacks' cones, the flames and the spots kick) }
     * The spots swing a step per beat by themselves (the song's clock at t).
     */
    function venue(g, t, o = {}) {
        const V = cam(o.view, o.pan), heat = clamp(o.heat ?? 0.6), bk = clamp(o.beatK ?? 0), d = C.drawing(t);
        g.save();
        g.lineJoin = 'round';
        layer(g, V, Q.far, () => still(g, 'inferno-far:' + V.k, FAR_BOX, (c) => farWall(c, 1 / V.k)));
        lake(g, V, t, heat);
        layer(g, V, Q.far, (L) => {
            for (const [x, y, w] of FALLS) fall(g, L, x, y + 10, w, d, heat);
        });
        // fire along the far shore: pilot lights when the house is cold
        for (const [x, sd] of [[352, 0], [648, 2], [60, 1], [940, 0], [-250, 2], [1250, 1]]) flameAt(g, V, Q.far, x, SHORE + 16, (26 + 74 * heat) * (1 + 0.16 * bk * ((sd + d) % 2 ? 1 : 0.4)), d, sd);
        layer(g, V, Q.col, () => still(g, 'inferno-col:' + V.k, COL_BOX, (c) => COLS.forEach((x, i) => column(c, 1 / V.k, x, i))));
        layer(g, V, 1, (L) => {
            still(g, 'inferno-stage:' + V.k, STAGE_BOX, (c) => stagePlane(c, 1 / V.k));
            // what lives on it: the cracks' glow, the cones of the stacks
            CRACKS.forEach(([a, b], i) => glowCrack(g, L, crackPts('ck' + i, a, b, 4, 7), (d + i) % 4 < 2, heat));
            const dome = mix(R.glow, R.hot, heat);
            for (const x0 of STACK.xs) {
                for (const [cx, cy] of cones(x0)) {
                    circ(g, cx, cy, 6 + 4.5 * bk, dome, 2.4 * L);
                    if (bk > 0.4) circ(g, cx, cy, 13.5 + 3 * bk, null, 2.2 * L, dome);
                }
            }
        });
        for (const [i, x0] of STACK.xs.entries()) {
            const [bx, by] = brazierAt(x0);
            flameAt(g, V, 1, bx, by + 6, (44 + 50 * heat) * (1 + 0.14 * bk), d, i * 2);
        }
        layer(g, V, 1, (L) => {
            // the bowls' near rims, over the flames' feet
            for (const x0 of STACK.xs) {
                const [bx, by] = brazierAt(x0);
                C.poly(g, [[bx - 46, by], [bx + 38, by], [bx + 33, by + 20], [bx - 40, by + 20]], { fill: R.wall, ink: K.ink, lw: 3.2 * L });
                line(g, [[bx - 38, by + 8], [bx + 30, by + 8]], 2.2 * L, R.wallL);
            }
        });
        beams(g, t, o);
        layer(g, V, 1, () => still(g, 'inferno-top:' + V.k, TOP_BOX, (c) => topPiece(c, 1 / V.k)));
        lamps(g, V, t, heat, bk);
        g.restore();
    }

    /**
     * Where everything stands ON SCREEN in a view: { k, car: { x, y, s }, floor, lip, pit: { y, rows: [y…], x0, x1 },
     *   box: { x, y, s }, banner: { x, y, w, h }, braziers: [[x, y]…], lamps: [[x, y]…], at([x, y]) → screen }
     * car: the ground under the middle of the band's car; box: the Devil's ground in his box.
     */
    const ROWS = [886, 922, 960, 1000];
    function stage(view = 'wide', pan = 0) {
        const V = cam(view, pan), at = (p) => scr(V, p[0], p[1]), c = at([500, FLOOR]), b = at([884, 440]), bn = at([BANNER.x, BANNER.y]);
        return {
            k: V.k, car: { x: c[0], y: c[1], s: 84 * V.k }, floor: c[1], lip: at([0, LIP])[1],
            pit: { y: at([0, PIT])[1], rows: ROWS.map((y) => at([0, y])[1]), x0: at([20, 0])[0], x1: at([980, 0])[0] },
            box: { x: b[0], y: b[1], s: 84 * V.k },
            banner: { x: bn[0], y: bn[1], w: BANNER.w * V.k, h: BANNER.h * V.k },
            braziers: STACK.xs.map((x0) => at(brazierAt(x0))), lamps: LAMPS.map(at), at,
        };
    }

    // =========================================================================================
    // The audience
    // =========================================================================================
    const IMP = Devil.P;
    const SK = {
        ink: K.ink, bone: '#f4edd8', boneTop: '#fffdf4', boneSide: '#cdbf9c', socket: '#2a2438', glint: '#fffdf4', mouth: '#5a1220',
        skin: '#fffdf4', skinTop: '#ffffff', skinSide: '#d6d0c2', // the mitts
        jacket: '#f4edd8', jacketTop: '#fffdf4', jacketSide: '#cdbf9c', // bare arm bones
        jeans: '#3a2f5e', jeansSide: '#2c2349', shoe: '#2a2438', shoeTop: '#3d3652', shoeSide: '#1f1a2b', sole: '#fffdf4',
        shadow: 'rgba(36,21,49,0.28)',
    };
    // the tees the skeletons wear: [front, top, side]
    const TEES = [['#4a44e6', '#6f6af0', '#3b2fa0'], ['#17b8a6', '#8cefe6', '#0e8f86'], ['#7d47e1', '#a888f5', '#5a2fb5'], ['#2f2940', '#4a4470', '#211c2e']];
    const HAWKS = [K.pink, K.green, K.sky, K.yellow];

    // A lighter held up: a little body with a wheel and its flame (two drawings). (x, y): the
    // foot of the lighter, on the mitt. u: the unit; fl: the flame's size 0..1; d: the drawing.
    function lighter(g, Lw, x, y, u, fl, d, tilt = 0) {
        g.save();
        g.translate(x, y);
        g.rotate(tilt);
        C.box(g, -0.05 * u, -0.17 * u, 0.1 * u, 0.17 * u, [0.03 * u, -0.02 * u], { front: K.aqua, top: '#d5dbea', side: K.teal }, { lw: Lw });
        C.poly(g, [[-0.05 * u, -0.17 * u], [0.05 * u, -0.17 * u], [0.05 * u, -0.215 * u], [-0.05 * u, -0.215 * u]], { fill: '#d5dbea', ink: K.ink, lw: Lw * 0.8 });
        if (fl > 0.02) {
            const f = ((d % 2) + 2) % 2, h = (0.24 + 0.1 * fl) * u * (f ? 1 : 0.86), w = 0.085 * u * (0.8 + 0.2 * fl), lean = (f ? 0.02 : -0.02) * u, y0 = -0.215 * u;
            const tear = (k) => C.curve([[0, y0], [-w * k, y0 - h * 0.3 * k], [-w * 0.55 * k + lean, y0 - h * 0.66 * k], [lean * 2, y0 - h * k], [w * 0.6 * k + lean, y0 - h * 0.6 * k], [w * k, y0 - h * 0.28 * k]], true, 4);
            C.poly(g, tear(1), { fill: K.orange, ink: K.ink, lw: Lw });
            C.poly(g, tear(0.56), { fill: K.yellow, lw: 0 });
        }
        g.restore();
    }
    // A foam trident, the souvenir: the Devil's fork in yellow foam on a short stick. (x, y): where the mitt holds it.
    function foamTrident(g, Lw, x, y, u, tilt = 0) {
        const at = (px, py) => {
            const q = rot([px * u, py * u], tilt);
            return [x + q[0], y + q[1]];
        };
        C.prism(g, cw([at(-0.035, 0.22), at(-0.035, -0.3), at(0.035, -0.3), at(0.035, 0.22)]), [0.03 * u, -0.02 * u], { front: K.pink, top: K.rose, side: K.magenta }, { lw: Lw });
        const head = [[-0.07, -0.26], [-0.07, -0.36], [-0.25, -0.38], [-0.33, -0.5], [-0.33, -0.62], [-0.4, -0.62], [-0.29, -0.8], [-0.18, -0.62], [-0.24, -0.62], [-0.24, -0.53], [-0.19, -0.47], [-0.045, -0.47],
            [-0.045, -0.72], [-0.13, -0.72], [0, -0.94], [0.13, -0.72], [0.045, -0.72], [0.045, -0.47], [0.19, -0.47], [0.24, -0.53], [0.24, -0.62], [0.18, -0.62], [0.29, -0.8], [0.4, -0.62], [0.33, -0.62], [0.33, -0.5], [0.25, -0.38], [0.07, -0.36], [0.07, -0.26]];
        C.prism(g, cw(head.map(([px, py]) => at(px, py))), [0.06 * u, -0.04 * u], { front: K.yellow, top: '#fff59a', side: K.gold }, { lw: Lw });
        line(g, [at(-0.012, -0.7), at(-0.012, -0.5)], Lw * 0.8, '#fff59a');
    }

    // --- the crowd's figures: cheap, drawn in their own units (the transform is set by crowd) ---
    const stub = (g, Lw, sh, hand, w, cols, depth = 0.14) => {
        const dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6, ux = dx / len, uy = dy / len, nx = -uy * w, ny = ux * w;
        C.prism(g, cw([[sh[0] + nx, sh[1] + ny], [hand[0] + ux * w + nx, hand[1] + uy * w + ny], [hand[0] + ux * w - nx, hand[1] + uy * w - ny], [sh[0] - nx, sh[1] - ny]]), Dd(depth), cols, { lw: Lw });
    };
    // The pit is dark and the stage is lit: every row nearer to us is a step darker (flat tones
    // mixed towards the pit's colour), so the rows part and the near ones frame the picture.
    const DIM = [0, 0.14, 0.3, 0.46];
    const TONES = DIM.map((k) => {
        const m = (c) => mix(c, R.pit, k);
        return {
            ink: K.ink, skin: m(IMP.skin), skinTop: m(IMP.skinTop), skinSide: m(IMP.skinSide), hoof: m(IMP.hoof), horn: m(IMP.horn), hornSide: m(IMP.hornSide),
            eye: m(IMP.eye), pupil: IMP.pupil, mouth: IMP.mouth, tooth: m(IMP.tooth), hat: [m(K.yellow), m('#fff59a'), m(K.gold), m('#e0a800')], bow: [m(K.pink), m(K.magenta)],
            bone: m(SK.bone), boneTop: m(SK.boneTop), boneSide: m(SK.boneSide), socket: SK.socket, jeans: m(SK.jeans), jeansSide: m(SK.jeansSide),
            tees: TEES.map((t) => t.map(m)), hawks: HAWKS.map(m),
        };
    });
    // An imp of the pit, from behind (turn 0) or turned to a neighbour (turn ±1: its face slides
    // that way across the box). Unit: its width. f: its traits, a: its act this frame, T: its row's tones.
    function pitImp(g, Lw, f, a, T) {
        const top = -1.02, cols = { front: T.skin, top: T.skinTop, side: T.skinSide };
        for (const sx of [-1, 1]) {
            C.box(g, sx * 0.22 - 0.09, -0.27, 0.18, 0.27, D, { front: T.skin, top: T.skin, side: T.skinSide }, { lw: Lw, depth: 0.2 });
            C.poly(g, [[sx * 0.22 - 0.11, -0.1], [sx * 0.22 + 0.11, -0.1], [sx * 0.22 + 0.11, 0], [sx * 0.22 - 0.11, 0]], { fill: T.hoof, ink: K.ink, lw: Lw });
        }
        C.box(g, -0.5, top, 1, 0.8, D, cols, { lw: Lw, depth: 0.5 });
        for (const sx of [-1, 1]) {
            const hx = sx * 0.3 + D[0] * 0.18, hy = top + D[1] * 0.18;
            C.prism(g, cw([[hx - 0.11, hy], [hx + sx * 0.06, hy - 0.26], [hx + 0.11, hy]]), Dd(0.1), { front: T.horn, top: T.hornSide, side: T.hornSide }, { lw: Lw });
        }
        if (f.turn) {
            // the face, slid towards the neighbour: the far eye narrow against the box's edge
            const s = f.turn, ey = top + 0.33, won = a.won > 0.5;
            for (const [ex, ew] of [[s * 0.39, 0.15], [s * 0.04, 0.24]]) {
                const eh = won ? 0.24 : 0.2;
                g.beginPath();
                g.roundRect(ex - ew / 2, ey - eh / 2, ew, eh, 0.05);
                g.fillStyle = T.eye;
                g.fill();
                g.strokeStyle = K.ink;
                g.lineWidth = Lw;
                g.stroke();
                g.fillStyle = T.pupil;
                g.fillRect(ex - 0.03 + s * ew * 0.2, ey - eh * 0.34, 0.06, eh * 0.68);
                if (!won) {
                    // unconvinced: a heavy lid
                    g.fillStyle = T.skin;
                    g.fillRect(ex - ew / 2 - 0.02, ey - eh / 2 - 0.03, ew + 0.04, eh * 0.42 + 0.03);
                    line(g, [[ex - ew / 2 - 0.02, ey - eh * 0.1], [ex + ew / 2 + 0.02, ey - eh * 0.1 - s * 0.03]], Lw * 1.2);
                }
            }
            const mx = s * 0.2, my = top + 0.6;
            if (won) {
                C.poly(g, [[mx - 0.14, my - 0.03], [mx + 0.14, my - 0.03], [mx + 0.09, my + 0.09], [mx - 0.09, my + 0.09]], { fill: T.mouth, ink: K.ink, lw: Lw });
                C.poly(g, [[mx + 0.04, my - 0.03], [mx + 0.1, my - 0.03], [mx + 0.07, my + 0.04]], { fill: T.tooth, lw: 0 });
            } else line(g, [[mx - 0.13, my + 0.03], [mx + 0.13, my]], Lw * 1.2);
        } else {
            // from behind: the tail comes out at us and curls to a side
            const s = f.side, tw = a.tail;
            const tl = C.curve([[0, -0.3], [s * 0.2, -0.16], [s * 0.44, -0.2], [s * 0.52, -0.42 + tw], [s * 0.4, -0.6 + tw * 1.5]], false, 5);
            C.poly(g, ribbon(tl.map(([px, py], i) => [px, py, 0.04 - 0.014 * (i / (tl.length - 1))])), { fill: T.skinTop, ink: K.ink, lw: Lw });
            const te = tl[tl.length - 1];
            C.poly(g, [[te[0] - 0.1, te[1] + 0.03], [te[0] - s * 0.02, te[1] - 0.15], [te[0] + 0.1, te[1] + 0.03]], { fill: T.skinTop, ink: K.ink, lw: Lw });
        }
        // what it wears, seen from wherever it stands
        if (f.wear === 1) {
            const dome = cw(C.curve([[-0.4, top + 0.03], [-0.36, top - 0.2], [0, top - 0.3], [0.36, top - 0.2], [0.4, top + 0.03]], false, 4).concat([[0.4, top + 0.03]])).map(([px, py]) => [px + D[0] * 0.1, py + D[1] * 0.1]);
            C.prism(g, dome, Dd(0.3), { front: T.hat[0], top: T.hat[1], side: T.hat[2] }, { lw: Lw, sweepInk: null });
            C.prismOutline(g, dome, Dd(0.3), { lw: Lw });
            C.box(g, -0.5, top - 0.01, 1.0, 0.06, D, { front: T.hat[2], top: T.hat[0], side: T.hat[3] }, { lw: Lw, depth: 0.52 });
        } else if (f.wear === 2) {
            const by = top - 0.02;
            for (const sx of [-1, 1]) C.poly(g, [[sx * 0.03, by - 0.03], [sx * 0.24, by - 0.14], [sx * 0.26, by + 0.08], [sx * 0.03, by + 0.03]], { fill: T.bow[0], ink: K.ink, lw: Lw });
            C.poly(g, [[-0.05, by - 0.05], [0.05, by - 0.05], [0.05, by + 0.05], [-0.05, by + 0.05]], { fill: T.bow[1], ink: K.ink, lw: Lw });
        } else if (f.wear === 3 && !f.turn) {
            // the band of a pair of specs round the back of the head
            line(g, [[-0.5, top + 0.3], [0.5, top + 0.3]], Lw * 2);
        }
        if (a.item) a.item(g, Lw, a.hr, 1);
        stub(g, Lw, [-0.48, -0.5], a.hl, 0.08, cols);
        stub(g, Lw, [0.48, -0.5], a.hr, 0.08, cols);
    }
    // A skeleton of the pit. Unit: the cast's figure unit (it stands 1.75 tall).
    const SKULL = [[-0.42, -1.74], [0.42, -1.74], [0.42, -1.3], [0.29, -1.23], [0.29, -1.0], [-0.29, -1.0], [-0.29, -1.23], [-0.42, -1.3]];
    const BONE_COLS = { front: SK.bone, top: SK.boneTop, side: SK.boneSide };
    function pitSkel(g, Lw, f, a, T) {
        const tee = T.tees[f.tee], bone = { front: T.bone, top: T.boneTop, side: T.boneSide };
        for (const sx of [-1, 1]) C.box(g, sx * 0.19 - 0.12, -0.4, 0.24, 0.4, D, { front: T.jeans, top: T.jeans, side: T.jeansSide }, { lw: Lw, depth: 0.3 });
        C.box(g, -0.36, -0.98, 0.72, 0.62, D, { front: tee[0], top: tee[1], side: tee[2] }, { lw: Lw, depth: 0.4 });
        C.prism(g, SKULL, Dd(0.46), bone, { lw: Lw });
        if (f.turn) {
            const s = f.turn, ey = -1.47;
            for (const [ex, ew] of [[s * 0.3, 0.1], [s * 0.02, 0.15]]) {
                g.fillStyle = T.socket;
                g.beginPath();
                g.roundRect(ex - ew / 2, ey - 0.105, ew, 0.21, 0.03);
                g.fill();
            }
            C.poly(g, [[s * 0.17, ey + 0.1], [s * 0.17 + 0.05, ey + 0.2], [s * 0.17 - 0.05, ey + 0.2]], { fill: T.socket, lw: 0 });
            g.strokeStyle = K.ink;
            g.lineWidth = Lw * 0.8;
            g.beginPath();
            g.moveTo(-0.29, -1.1);
            g.lineTo(0.29, -1.1);
            for (let i = -2; i <= 2; i++) {
                g.moveTo(i * 0.1 + s * 0.04, -1.1);
                g.lineTo(i * 0.1 + s * 0.04, -1.0);
            }
            g.stroke();
        } else {
            // the back of the skull: a seam and a crack
            line(g, [[-0.42, -1.38], [-0.1, -1.34], [0.2, -1.4], [0.42, -1.36]], Lw * 0.8, T.boneSide);
            line(g, [[0.1, -1.74], [0.16, -1.62], [0.08, -1.54], [0.14, -1.46]], Lw * 0.8);
        }
        if (f.hawk >= 0) {
            // a mohawk: a comb of spikes along the crown
            const z = Dd(0.23), y = -1.74 + z[1], pts = [[-0.26 + z[0], y]];
            for (let i = 0; i < 4; i++) pts.push([-0.2 + i * 0.14 + z[0], y - 0.26 - (i % 2) * 0.05], [-0.12 + i * 0.14 + z[0], y - 0.06]);
            pts.push([0.36 + z[0], y]);
            C.poly(g, pts, { fill: T.hawks[f.hawk], ink: K.ink, lw: Lw });
        }
        if (a.item) a.item(g, Lw, a.hr, 0.9);
        stub(g, Lw, [-0.34, -0.85], a.hl, 0.065, bone, 0.13);
        stub(g, Lw, [0.34, -0.85], a.hr, 0.065, bone, 0.13);
    }

    // --- the crowd-surfer: a skeleton lying on the crowd's mitts, his head to the right ------
    // The cast's skull, facing us (Rides.skeleton's, bare): jaw 0..1, hawk: a colour or null.
    function skull(g, L, jaw = 0, hawk = null, look = 0) {
        const top = -1.74, hw = 0.42, ch = -1.3, jx = 0.29, ub = -1.13, drop = jaw * 0.13;
        C.box(g, -jx + 0.02, ub + drop - 0.02, jx * 2 - 0.04, 0.15, D, BONE_COLS, { lw: L, depth: 0.36 });
        if (drop > 0.01) C.poly(g, [[-jx + 0.04, ub - 0.02], [jx - 0.04, ub - 0.02], [jx - 0.04, ub + drop + 0.005], [-jx + 0.04, ub + drop + 0.005]], { fill: SK.mouth, ink: K.ink, lw: L * 0.8 });
        g.strokeStyle = K.ink;
        g.lineWidth = L * 0.7;
        g.beginPath();
        g.moveTo(-jx + 0.02, ub + drop + 0.055);
        g.lineTo(jx - 0.02, ub + drop + 0.055);
        for (let i = -2; i <= 2; i++) {
            g.moveTo(i * 0.092, ub + drop - 0.02);
            g.lineTo(i * 0.092, ub + drop + 0.055);
        }
        g.stroke();
        C.prism(g, [[-hw, top], [hw, top], [hw, ch], [jx, ch + 0.07], [jx, ub], [-jx, ub], [-jx, ch + 0.07], [-hw, ch]], Dd(0.46), BONE_COLS, { lw: L });
        g.strokeStyle = K.ink;
        g.lineWidth = L * 0.7;
        g.beginPath();
        g.moveTo(-jx, ub - 0.085);
        g.lineTo(jx, ub - 0.085);
        for (let i = -2.5; i <= 2.5; i++) {
            g.moveTo(i * 0.092, ub - 0.085);
            g.lineTo(i * 0.092, ub);
        }
        g.stroke();
        const ey = -1.47;
        for (const sx of [-1, 1]) {
            g.beginPath();
            g.roundRect(sx * 0.175 - 0.07, ey - 0.105, 0.14, 0.21, 0.035);
            g.fillStyle = SK.socket;
            g.fill();
            g.fillStyle = SK.glint;
            g.fillRect(sx * 0.175 - 0.045 + look * 0.03, ey - 0.02 - jaw * 0.03, 0.036, 0.04);
        }
        C.poly(g, [[0, ey + 0.1], [0.05, ey + 0.2], [-0.05, ey + 0.2]], { fill: SK.socket, lw: 0 });
        line(g, [[0.4, ey - 0.02], [0.33, ey + 0.03], [0.37, ey + 0.08], [0.31, ey + 0.12]], L * 0.6);
        if (hawk) {
            const z = Dd(0.23), y = top + z[1], pts = [[-0.3 + z[0], y]];
            for (let i = 0; i < 5; i++) pts.push([-0.25 + i * 0.125 + z[0], y - 0.3 - (i % 2) * 0.06], [-0.18 + i * 0.125 + z[0], y - 0.08]);
            pts.push([0.36 + z[0], y]);
            C.prism(g, cw(pts), Dd(0.05), { front: hawk, top: hawk, side: mix(hawk, K.ink, 0.35) }, { lw: L });
        }
    }
    // The surfer, in figure units: the origin under the middle of his back. pump: -1..1 his fist.
    function surfer(g, L, pump, jaw) {
        const tee = TEES[2];
        // the far leg, kicked up; the near one flat; shoes with their soles to the left
        const leg = (a, z) => {
            const at = (px, py) => {
                const q = rot([px, py], a);
                return [-0.32 + q[0] + D[0] * z, -0.2 + q[1] + D[1] * z];
            };
            C.prism(g, cw([at(0, -0.12), at(-0.66, -0.11), at(-0.66, 0.11), at(0, 0.12)]), Dd(0.24), { front: SK.jeans, top: '#4a3d75', side: SK.jeansSide }, { lw: L });
            C.prism(g, cw([at(-0.66, 0.13), at(-0.66, -0.3), at(-0.78, -0.3), at(-0.78, 0.13)]), Dd(0.26), { front: SK.shoe, top: SK.shoeTop, side: SK.shoeSide }, { lw: L });
            line(g, [at(-0.775, -0.28), at(-0.775, 0.11)], L * 0.8, SK.sole);
        };
        leg(0.5, 0.4);
        leg(0.03, 0.04);
        C.box(g, -0.34, -0.42, 0.74, 0.4, D, { front: tee[0], top: tee[1], side: tee[2] }, { lw: L, depth: 0.7 });
        // the tee's print on his chest (the top face): a little flame
        const ch = (px, pz) => [px + D[0] * pz, -0.42 + D[1] * pz];
        C.poly(g, [ch(-0.08, 0.2), ch(0.0, 0.5), ch(0.08, 0.3), ch(0.16, 0.56), ch(0.22, 0.2)], { fill: K.yellow, ink: K.ink, lw: L * 0.7 });
        // the head, propped up and turned to us
        g.save();
        g.translate(0.86, 1.0);
        g.translate(0, -1.1);
        g.rotate(-0.14);
        g.translate(0, 1.1);
        skull(g, L, jaw, K.pink);
        g.restore();
        // the far arm lies on his belly; the near one pumps a fist at the ceiling
        Cast.arm(g, SK, L, [0.2 + D[0] * 0.6, -0.42 + D[1] * 0.6], [-0.12 + D[0] * 0.45, -0.52 + D[1] * 0.45]);
        Cast.arm(g, SK, L, [0.26, -0.36], [0.08 + pump * 0.08, -0.92 - Math.abs(pump) * 0.1]);
    }

    // Every place in the pit and who stands there (seeded once): the same figure always.
    const PITCH = 67;
    let pitList = null;
    const pit = () => {
        if (pitList) return pitList;
        pitList = ROWS.map((y, r) => {
            const row = [];
            for (let i = -7; i <= 22; i++) {
                const rn = Motion.rng('inferno-pit:' + r + ':' + i), x = 12 + i * PITCH + (r % 2) * PITCH * 0.5 + (rn() - 0.5) * 10;
                const skel = rn() < (r === 0 ? 0.1 : 0.24), turnR = rn(), f = {
                    x, y: y + (rn() - 0.5) * 6, skel, rank: rn(), thr: 0.06 + 0.8 * rn(), ph: rn() < 0.7 ? 0 : 0.5, amp: 0.7 + 0.6 * rn(), size: 0.92 + 0.14 * rn(),
                    turnR, turnS: rn() < 0.5 ? -1 : 1, side: rn() < 0.5 ? -1 : 1, wear: Math.floor(rn() * 6), tee: Math.floor(rn() * 4), hawk: rn() < 0.4 ? Math.floor(rn() * 4) : -1,
                    light: rn(), foam: rn(), delay: Math.floor(rn() * 3),
                };
                row.push(f);
            }
            return row;
        });
        return pitList;
    };
    const SURF = { x0: 110, x1: 890, y: 842, s: 76 }; // the surfer's run across the pit (set coordinates)
    // Where the surfer is on screen for a view: { x, y, s, tilt } (the middle of his back; he is 1.9 · s long).
    const surfPoint = (u, view = 'wide', pan = 0) => {
        const V = cam(view, pan), a = surfAt(u), p = scr(V, a.x, a.y);
        return { x: p[0], y: p[1], s: SURF.s * V.k, tilt: a.tilt };
    };
    function surfAt(u) {
        const k = clamp(u), hand = k * 13; // he is passed on thirteen times
        return { x: lerp(SURF.x0, SURF.x1, k), y: SURF.y - 7 * Math.abs(Math.sin(hand * PI)), tilt: 0.07 * Math.sin(hand * PI * 2) };
    }

    /**
     * The audience in the pit, in front of the stage: rows of imps and skeletons seen from behind
     * (some turned to a neighbour), keeping the beat each with its own phase. Draw it last.
     *   o: { view, pan            as the venue's
     *        density (0..1: how full the pit is; the same places fill in the same order),
     *        hype (0..1: 0 they stand still, arms down or crossed, eyeing each other; they are won over
     *              one by one; 1 everybody jumps with both mitts in the air),
     *        lighters (0..1: how many hold a little flame up; they sway together),
     *        surf: { u (0..1 left to right), on } a skeleton passed along on the crowd's mitts,
     *        wave (0..1, or null: a wave of raised arms running left to right through the rows) }
     */
    function crowd(g, t, o = {}) {
        const V = cam(o.view, o.pan), dens = clamp(o.density ?? 1), hype = clamp(o.hype ?? 0.5), nl = clamp(o.lighters ?? 0), wave = o.wave;
        const P = beatAt(t), d = C.drawing(t), t2 = C.onTwos(t), sway = Math.sin((t2 * TAU) / 2.4);
        const surf = o.surf && o.surf.on !== false && o.surf.u != null ? surfAt(o.surf.u) : null;
        const x0 = V.cx - 500 / V.k - 60, x1 = V.cx + 500 / V.k + 60, yMax = V.cy + 500 / V.k;
        g.save();
        g.lineJoin = 'round';
        layer(g, V, 1, (L) => {
            pit().forEach((row, r) => {
                if (r === 2 && surf) {
                    g.save();
                    g.translate(surf.x, surf.y);
                    g.rotate(surf.tilt);
                    g.scale(SURF.s, SURF.s);
                    surfer(g, (3 * L) / SURF.s, Math.cos((P.k + P.since) * PI), 0.4 + 0.6 * P.pulse);
                    g.restore();
                }
                for (const f of row) {
                    if (f.x < x0 || f.x > x1 || f.rank > dens) continue;
                    const u = (f.skel ? 70 : 56) * f.size, top = f.y - (f.skel ? 1.75 : 1.25) * u;
                    if (top - u > yMax) continue;
                    // how won over this one is, and its hop: up between the beats, down on them
                    const won = smooth((hype - f.thr) / 0.16 + (hype >= 1 ? 1 : 0));
                    const ph = P.k + Math.max(0, P.since - f.delay / 12 / 0.353) + f.ph, fr = ph - Math.floor(ph);
                    const xn = (f.x - 20) / 960 + r * 0.02, wv = wave == null ? 0 : smooth(1 - Math.abs(xn - (wave * 1.3 - 0.15)) / 0.13);
                    const light = f.light < nl * 0.85, hold = surf && (r === 1 || r === 2) && Math.abs(f.x - surf.x) < 70;
                    const hop = light ? 0 : won * f.amp * (0.07 + 0.12 * hype) * Math.sin(PI * fr) + wv * 0.14;
                    const sq = light ? 0 : won * 0.07 * Math.exp(-fr * 5);
                    // the mitts: down (or crossed in front when it faces a neighbour), up and pumping in turns, up for a wave
                    const up = Math.max(clamp(won * (0.45 + 0.75 * hype)), wv), pump = Math.cos((ph + (f.side > 0 ? 0 : 1)) * PI), turn = f.turnR < 0.3 - 0.18 * won ? f.turnS : 0;
                    const S = f.skel ? { sh: 0.34, shy: -0.85, dn: [0.5, -0.45], upp: [0.52, -1.5], cr: [0.1, -0.62], k: 1 } : { sh: 0.48, shy: -0.5, dn: [0.63, -0.26], upp: [0.66, -1.18], cr: [0.16, -0.38], k: 0.75 };
                    const rest = turn && won < 0.5 ? S.cr : null;
                    const hand = (sx) => {
                        if (rest && up < 0.2) return [-sx * rest[0], rest[1] + (sx > 0 ? 0.07 * S.k : 0)];
                        const k = up * (0.74 + 0.26 * (sx > 0 ? pump : -pump) * (1 - wv)) * (hype > 0.85 || wv > 0.5 ? 1 : 0.5 + 0.5 * (sx * f.side > 0 ? 1 : 0.4));
                        return [sx * lerp(S.dn[0], S.upp[0], k), lerp(S.dn[1], S.upp[1], k)];
                    };
                    let hl = hand(-1), hr = hand(1), item = null, lift = 0;
                    if (hold) {
                        // under the surfer: both mitts straight up, on his back
                        lift = r === 2 ? 0.3 : 0.1;
                        const ty = Math.max((surf.y + 2 - (f.y - (hop + lift) * u)) / u, S.upp[1] - 0.2);
                        hl = [-S.sh - 0.04, ty];
                        hr = [S.sh + 0.04, ty];
                    } else if (light) {
                        hr = [S.upp[0] * 0.9 + sway * 0.13, S.upp[1] + 0.06];
                        item = (g2, Lw, h, k) => lighter(g2, Lw, h[0] + sway * 0.03, h[1] - 0.05 * k, k * (f.skel ? 0.8 : 1), 0.5 + 0.5 * nl, d + f.delay, sway * 0.16);
                    } else if (f.foam < 0.09 && won > 0.5) {
                        item = (g2, Lw, h, k) => foamTrident(g2, Lw, h[0], h[1] - 0.04, k * (f.skel ? 0.8 : 1), 0.2 * pump);
                    }
                    g.save();
                    g.translate(f.x + (light ? sway * 3 : 0), f.y - (hop + lift) * u);
                    g.scale(u * (1 + sq), u * (1 - sq));
                    (f.skel ? pitSkel : pitImp)(g, (2.8 * L) / u, { ...f, turn }, { hl, hr, won, item, tail: 0.05 * Math.sin(t2 * 2.2 + f.x) }, TONES[r]);
                    g.restore();
                }
            });
        });
        g.restore();
    }

    /**
     * One fan, close: an imp (the Devil's own, Devil.imp) or a skeleton with a mohawk and a tee.
     *   x, y  the ground under it;  s  the cast's figure unit (an imp is drawn at 0.67 · s, as in the film)
     *   o: { kind ('imp' | 'skeleton'), hype (0..1: 0 stands and stares, 1 hops with both mitts up, jaw down),
     *        lighter (0..1: the flame he holds up; 0 or absent: he waves a foam trident instead),
     *        hold ('lighter' | 'trident' | 'none', to say it outright), t (seconds: he hops on the beat and the
     *        flame flickers on twos), wear (the imp's: 'specs' | 'hat' | 'bow'), look (-1..1), hawk (a colour), tee (0..3) }
     */
    function fan(g, x, y, s, o = {}) {
        const hype = clamp(o.hype ?? 1), t = o.t ?? 0, P = beatAt(t), d = C.drawing(t), ph = P.k + P.since, fr = P.since - Math.floor(P.since);
        const hold = o.hold ?? ((o.lighter ?? 0) > 0 ? 'lighter' : 'trident'), fl = clamp(o.lighter ?? 1), sway = Math.sin((C.onTwos(t) * TAU) / 2.4);
        const hop = hold === 'lighter' ? 0.02 * hype * P.pulse : hype * 0.16 * Math.sin(PI * Math.min(1, fr)), sq = hype * 0.06 * P.pulse, pump = Math.cos(ph * PI);
        if (o.kind === 'skeleton') {
            const L = 3.2 / s, T = { x: -0.36, y: -0.98, w: 0.72, h: 0.62, d: 0.4 }, tee = TEES[o.tee ?? 0];
            g.save();
            g.translate(x, y);
            g.scale(s, s);
            g.lineJoin = 'round';
            if (o.shadow !== false) {
                g.fillStyle = SK.shadow;
                g.beginPath();
                g.ellipse(0.05, 0, 0.56 * (1 - hop), 0.06, 0, 0, TAU);
                g.fill();
            }
            g.translate(0, -hop);
            g.scale(1 + sq, 1 - sq);
            Cast.legs(g, SK, L);
            // a studded belt over the jeans, then the tee with its print and a torn hem
            C.box(g, T.x, T.y, T.w, T.h, D, { front: tee[0], top: tee[1], side: tee[2] }, { lw: L, depth: T.d });
            C.poly(g, [[T.x, T.y + T.h - 0.09], [T.x + T.w, T.y + T.h - 0.09], [T.x + T.w, T.y + T.h], [T.x, T.y + T.h]], { fill: SK.shoe, ink: K.ink, lw: L * 0.8 });
            for (let i = 0; i < 6; i++) C.poly(g, [[T.x + 0.07 + i * 0.116, T.y + T.h - 0.07], [T.x + 0.1 + i * 0.116, T.y + T.h - 0.02], [T.x + 0.04 + i * 0.116, T.y + T.h - 0.02]], { fill: '#d5dbea', lw: 0 });
            // the print: a flaming skull would be him; a guitar pick with a bolt instead
            C.poly(g, [[-0.17, T.y + 0.16], [0.17, T.y + 0.16], [0.13, T.y + 0.3], [0, T.y + 0.44], [-0.13, T.y + 0.3]], { fill: K.yellow, ink: K.ink, lw: L * 0.8 });
            C.poly(g, [[0.03, T.y + 0.19], [-0.06, T.y + 0.3], [0, T.y + 0.3], [-0.03, T.y + 0.4], [0.07, T.y + 0.27], [0.01, T.y + 0.27]], { fill: K.red, ink: K.ink, lw: L * 0.6 });
            // the collar: a ring of the neck's bone shows
            C.poly(g, [[-0.14, T.y], [0.14, T.y], [0.09, T.y + 0.07], [-0.09, T.y + 0.07]], { fill: SK.bone, ink: K.ink, lw: L * 0.8 });
            g.save();
            g.translate(0, 0.02 * P.pulse * hype);
            g.translate(0, -1.08);
            g.rotate((o.headTilt ?? 0) + 0.05 * hype * pump);
            g.translate(0, 1.08);
            skull(g, L, clamp(0.15 + hype * (0.5 + 0.5 * P.pulse)), o.hawk ?? K.green, o.look ?? 0);
            g.restore();
            const shR = [T.x + 0.03, T.y + 0.13], shL = [T.x + T.w - 0.03, T.y + 0.13];
            const hR = hold === 'none' ? [lerp(-0.5, -0.62, hype), lerp(-0.47, -1.5 - 0.1 * pump, hype)] : hold === 'lighter' ? [-0.6 + sway * 0.12, -1.55] : [-0.66, -1.34 + 0.06 * pump];
            const hL = [lerp(0.5, 0.62, hype), lerp(-0.47, -1.5 + 0.1 * pump, hype)];
            if (hold === 'lighter') lighter(g, L, hR[0] + sway * 0.03, hR[1] - 0.08, 0.9, fl, d, sway * 0.16);
            if (hold === 'trident') foamTrident(g, L, hR[0] - 0.02, hR[1] - 0.06, 0.82, -0.18 + 0.2 * pump * hype);
            Cast.arm(g, SK, L, shR, hR);
            Cast.arm(g, SK, L, shL, hL);
            g.restore();
            return;
        }
        // the imp: Devil.imp itself; what it holds goes behind its right mitt (screen left)
        const u = s * 0.67, up = hold === 'none' ? hype : Math.max(hype, 0.9), L = 3 / u;
        const hand = [-0.66, -0.4 - up * 0.5], dir = [-0.34, -0.94]; // the mitt's point and the way its arm runs (Devil.imp's stub)
        const iy = y - hop * u, tip = [x + (hand[0] + dir[0] * 0.03) * u * (1 + sq), iy + (hand[1] + dir[1] * 0.03) * u * (1 - sq)];
        if (o.shadow !== false) {
            g.fillStyle = SK.shadow;
            g.beginPath();
            g.ellipse(x + 0.04 * u, y, 0.55 * u * (1 - hop), 0.07 * u, 0, 0, TAU);
            g.fill();
        }
        g.save();
        g.lineJoin = 'round';
        if (hold === 'lighter') lighter(g, 3, tip[0] + sway * 2, tip[1], u * 1.5, fl, d, -0.2 + sway * 0.14);
        if (hold === 'trident') foamTrident(g, 3, tip[0], tip[1], u, -0.34 + 0.16 * pump * hype);
        g.restore();
        Devil.imp(g, x, y, u, { squash: sq, hop, mood: hype < 0.25 ? 'awe' : 'grin', look: o.look ?? 0, wear: o.wear, armUp: up, tail: 0.05 * pump * hype, shadow: false });
    }

    // =========================================================================================
    // The Devil's guitar
    // =========================================================================================
    // A pointed solid-body, black with a red heart: two horns for cutaways (capped in horn, like
    // his own), a spike and two points at the tail, gold pickups and bridge, a red fretboard, a
    // headstock that is his trident's fork, and a strap that is a tail. Local frame as the
    // cast's guitars: the neck runs along +x, the origin is the middle of the body.
    const DP = Devil.P;
    const AX = {
        body: DP.skin, bodyTop: DP.skinTop, bodySide: DP.skinSide, bevel: DP.skinDark, heart: DP.hair, sheen: DP.sheen,
        neck: DP.hair, neckTop: DP.hairTop, neckSide: DP.hairSide, gold: DP.gold, goldDark: DP.tieDark, horn: DP.horn, hornLine: DP.hornLine,
        fork: DP.fork, forkSide: DP.forkSide, forkShine: DP.forkShine, string: '#fff1c4', tail: DP.skin, tailDark: DP.skinSide,
    };
    const AX_BODY = [[0.22, -0.06], [0.34, -0.12], [0.46, -0.2], [0.6, -0.27], [0.42, -0.31], [0.2, -0.28], [-0.1, -0.25], [-0.31, -0.37], [-0.26, -0.16], [-0.49, 0],
        [-0.26, 0.16], [-0.31, 0.37], [-0.1, 0.25], [0.2, 0.28], [0.38, 0.3], [0.54, 0.27], [0.42, 0.2], [0.33, 0.12], [0.22, 0.06]];
    const AX_HORN = [0.6, -0.27]; // the upper horn's tip
    const AX_HEART = [[0.2, -0.05], [0.27, -0.12], [0.1, -0.2], [-0.1, -0.17], [-0.2, -0.22], [-0.17, -0.1], [-0.33, 0], [-0.17, 0.1], [-0.2, 0.22], [-0.1, 0.17], [0.1, 0.2], [0.27, 0.12], [0.2, 0.05]];
    const AX_NUT = 0.8, FORK_K = 0.6;
    // the trident's fork (devil.js), laid along the neck from the nut
    const AX_FORK = [[-0.05, 0.44], [-0.05, 0.34], [-0.2, 0.33], [-0.275, 0.24], [-0.275, 0.13], [-0.33, 0.13], [-0.245, -0.01], [-0.16, 0.13], [-0.215, 0.13], [-0.215, 0.22], [-0.17, 0.27], [-0.03, 0.27],
        [-0.03, 0.02], [-0.095, 0.02], [0, -0.15], [0.095, 0.02], [0.03, 0.02], [0.03, 0.27], [0.17, 0.27], [0.215, 0.22], [0.215, 0.13], [0.16, 0.13], [0.245, -0.01], [0.33, 0.13], [0.275, 0.13], [0.275, 0.24], [0.2, 0.33], [0.05, 0.34], [0.05, 0.44]]
        .map(([px, py]) => [AX_NUT - 0.02 + (0.44 - py) * FORK_K, px * FORK_K]);
    const AX_TIP = AX_NUT - 0.02 + 0.59 * FORK_K; // the middle tine's tip
    // at: the body's middle, ang: the neck's angle, sc: its size, mx: -1 mirrors it (the neck to the left)
    function axe(g, L0, at, ang, sc = 1, mx = 1) {
        const L = L0 / sc, th = Dd(0.09);
        const put = (pts) => cw(pts.map((p) => {
            const q = rot(p, ang);
            return [mx * (q[0] * sc + at[0]), q[1] * sc + at[1]];
        }));
        // the neck, the tuners' gold buttons, the fork over them, then the body over the heel
        C.prism(g, put([[0.18, -0.045], [AX_NUT, -0.036], [AX_NUT, 0.036], [0.18, 0.045]]), th, { front: AX.neck, top: AX.neckTop, side: AX.neckSide }, { lw: L0 });
        const flat = (fn) => {
            g.save();
            g.translate(mx * at[0], at[1]);
            g.scale(mx, 1);
            g.rotate(ang);
            g.scale(sc, sc);
            fn();
            g.restore();
        };
        flat(() => {
            for (const [u, v] of [[AX_NUT + 0.11, 0.17], [AX_NUT + 0.165, 0.195], [AX_NUT + 0.11, -0.17], [AX_NUT + 0.165, -0.195], [AX_NUT + 0.06, 0.065], [AX_NUT + 0.06, -0.065]]) {
                g.beginPath();
                g.roundRect(u - 0.02, v - 0.024, 0.04, 0.048, 0.01);
                g.fillStyle = AX.gold;
                g.fill();
                g.strokeStyle = K.ink;
                g.lineWidth = L * 0.65;
                g.stroke();
            }
        });
        C.prism(g, put(AX_FORK), Dd(0.06), { front: AX.fork, top: AX.forkShine, side: AX.forkSide }, { lw: L0 });
        C.prism(g, put(AX_BODY), th, { front: AX.body, top: AX.bodyTop, side: AX.bodySide }, { lw: L0 });
        flat(() => {
            // a shine down the fork's tines
            line(g, [[AX_NUT + 0.13, -0.008], [AX_TIP - 0.1, -0.008]], L * 0.8, AX.forkShine);
            for (const sv of [-1, 1]) line(g, [[AX_NUT + 0.115, sv * 0.148 - 0.006], [AX_NUT + 0.16, sv * 0.148 - 0.006]], L * 0.7, AX.forkShine);
            // the black heart of the body, a sheen on it, a bevel line along the red
            C.poly(g, AX_HEART, { fill: AX.heart, ink: K.ink, lw: L * 0.8 });
            line(g, [[-0.165, -0.165], [-0.1, -0.13], [0.08, -0.16]], L * 0.8, AX.sheen);
            line(g, [[-0.27, -0.315], [-0.1, -0.218], [0.2, -0.247], [0.4, -0.277]], L * 0.7, AX.bodyTop);
            line(g, [[-0.27, 0.315], [-0.1, 0.218], [0.2, 0.247], [0.36, 0.267]], L * 0.7, AX.bevel);
            // the horns' caps, ringed like his
            for (const [tip, a, b] of [[AX_HORN, [0.46, -0.2], [0.42, -0.31]], [[0.54, 0.27], [0.42, 0.2], [0.38, 0.3]]]) {
                const pa = [lerp(tip[0], a[0], 0.6), lerp(tip[1], a[1], 0.6)], pb = [lerp(tip[0], b[0], 0.52), lerp(tip[1], b[1], 0.52)];
                C.poly(g, [tip, pa, pb], { fill: AX.horn, ink: K.ink, lw: L * 0.8 });
                line(g, [[lerp(tip[0], pa[0], 0.55), lerp(tip[1], pa[1], 0.55)], [lerp(tip[0], pb[0], 0.55), lerp(tip[1], pb[1], 0.55)]], L * 0.6, AX.hornLine);
            }
            // the bridge and two pickups, in gold
            C.poly(g, [[-0.25, -0.075], [-0.2, -0.075], [-0.2, 0.075], [-0.25, 0.075]], { fill: AX.gold, ink: K.ink, lw: L * 0.75 });
            line(g, [[-0.225, -0.055], [-0.225, 0.055]], L * 0.7, AX.goldDark);
            for (const px of [-0.1, 0.07]) {
                g.beginPath();
                g.roundRect(px - 0.03, -0.08, 0.06, 0.16, 0.012);
                g.fillStyle = AX.gold;
                g.fill();
                g.strokeStyle = K.ink;
                g.lineWidth = L * 0.75;
                g.stroke();
                g.fillStyle = AX.goldDark;
                g.fillRect(px - 0.011, -0.06, 0.022, 0.12);
            }
            // two knobs on the lower wing
            for (const [kx, ky] of [[-0.03, 0.135], [0.09, 0.15]]) circ(g, kx, ky, 0.024, AX.gold, L * 0.65);
            // the fretboard: black, gold frets and dots
            C.poly(g, [[0.15, -0.044], [AX_NUT, -0.036], [AX_NUT, 0.036], [0.15, 0.044]], { fill: AX.neck, ink: K.ink, lw: L * 0.8 });
            g.strokeStyle = AX.gold;
            g.lineWidth = L * 0.55;
            g.beginPath();
            const fr = [];
            for (let i = 0; i < 9; i++) {
                const fx = AX_NUT - 0.02 - ((AX_NUT - 0.2) * (1 - Math.pow(0.86, i + 1))) / (1 - Math.pow(0.86, 10));
                fr.push(fx);
                g.moveTo(fx, -0.036);
                g.lineTo(fx, 0.036);
            }
            g.stroke();
            g.fillStyle = AX.gold;
            for (const i of [2, 4, 6]) {
                g.beginPath();
                g.arc((fr[i] + fr[i + 1]) / 2, 0, 0.011, 0, TAU);
                g.fill();
            }
            // four strings from the bridge to the nut, and on to the fork
            g.strokeStyle = AX.string;
            g.lineWidth = L * 0.42;
            g.beginPath();
            for (let i = 0; i < 4; i++) {
                const v = (i - 1.5) * 0.018;
                g.moveTo(-0.225, v * 1.3);
                g.lineTo(AX_NUT, v);
                g.lineTo(AX_NUT + 0.1, v * 0.5);
            }
            g.stroke();
            line(g, [[AX_NUT, -0.036], [AX_NUT, 0.036]], L * 1.5);
            line(g, [[AX_NUT, -0.03], [AX_NUT, 0.03]], L * 0.8, AX.horn);
        });
    }

    // The Devil's sleeve, cuff, link and mitt (devil.js keeps its own to itself: this is the same drawing).
    function devilArm(g, L, sh, hand) {
        const w = 0.16, dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6;
        const ux = dx / len, uy = dy / len, nx = -uy * w * 0.5, ny = ux * w * 0.5;
        const quad = (a, b, k = 1) => cw([[sh[0] + ux * a + nx * k, sh[1] + uy * a + ny * k], [sh[0] + ux * b + nx * k, sh[1] + uy * b + ny * k], [sh[0] + ux * b - nx * k, sh[1] + uy * b - ny * k], [sh[0] + ux * a - nx * k, sh[1] + uy * a - ny * k]]);
        const c0 = Math.max(0.03, len - 0.14), c1 = Math.max(0.06, len - 0.075);
        C.prism(g, quad(-0.05, c0), Dd(0.16), { front: DP.suit, top: DP.suitTop, side: DP.suitSide }, { lw: L, ink: DP.ink });
        C.prism(g, quad(c0, c1, 1.12), Dd(0.17), { front: DP.shirt, top: DP.shirt, side: '#d9d4e6' }, { lw: L, ink: DP.ink });
        g.beginPath();
        g.arc(sh[0] + (ux * (c0 + c1)) / 2, sh[1] + (uy * (c0 + c1)) / 2, 0.016, 0, TAU);
        g.fillStyle = DP.button;
        g.fill();
        C.prism(g, quad(c1, len + 0.11), Dd(0.16), { front: DP.skin, top: DP.skinTop, side: DP.skinSide }, { lw: L, ink: DP.ink });
    }
    // An after-image of his mitt (the blur of a shredding hand): the block alone, pale, no cuff.
    function mittGhost(g, L, hand, dir) {
        const w = 0.08, nx = -dir[1] * w, ny = dir[0] * w, a = [hand[0] - dir[0] * 0.075, hand[1] - dir[1] * 0.075], b = [hand[0] + dir[0] * 0.11, hand[1] + dir[1] * 0.11];
        C.poly(g, cw([[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]]), { fill: DP.skinTop, ink: DP.skinSide, lw: L * 0.8 });
    }

    // Where everything is for a pose (his units, before lean and squash).
    const NO_HAND = [NaN, NaN]; // a mitt Devil.draw is asked not to draw: the canvas ignores a path that is not a number
    function axeRig(pose) {
        const solo = clamp(pose.solo ?? 0), mx = pose.hand === 'right' ? 1 : -1, d = C.drawing(pose.t ?? 0), shred = clamp(pose.shred ?? 0);
        const gAt = [lerp(-0.25, -0.03, solo), lerp(-0.45, -0.43, solo)], gAng = lerp(-0.27, -0.72, solo), gSc = 0.96;
        const onG = (p) => {
            const r = rot(p, gAng);
            return [mx * (r[0] * gSc + gAt[0]), r[1] * gSc + gAt[1]];
        };
        // shredding, the fretting mitt jumps along the neck on twos
        const jump = [0, 0.55, -0.35, 0.8, 0.2, -0.6][((d % 6) + 6) % 6] * shred, f = clamp((pose.fret ?? 0.3) + jump * 0.5);
        const T = Devil.TORSO, shN = [mx * (T.x + T.w - 0.03), T.y + 0.14], shF = [-mx * (T.x + T.w - 0.03), T.y + 0.14]; // the neck side's shoulder and the other
        return {
            solo, mx, d, shred, gAt, gAng, gSc, onG, shN, shF, jump,
            lean: (pose.lean ?? 0) - 0.1 * solo * mx, tilt: (pose.headTilt ?? 0) - 0.06 * solo * mx,
            fret: onG([0.44 + 0.3 * f, 0.035]), fretPrev: onG([0.44 + 0.3 * clamp((pose.fret ?? 0.3) - jump * 0.4), 0.035]),
            hand: onG([0.17, (pose.strum ?? 0) * 0.1 - 0.02 + (shred ? ((d % 2) - 0.5) * 0.05 * shred : 0)]),
            neckDir: [mx * Math.cos(gAng), Math.sin(gAng)],
        };
    }
    const poseOut = (pose, R) => {
        const q = pose.squash ?? 0;
        return (p) => rot([p[0] * (1 + q), p[1] * (1 - q)], R.lean);
    };
    /**
     * Where the guitar is for a pose, in the Devil's units from his ground point (lean and squash
     * applied): { headstock (the fork's middle tip), strings, bodyEnd (the tail spike), fretHand, pickHand, horn (the upper horn's tip) }
     */
    function guitarPoints(pose = {}) {
        const R = axeRig(pose), out = poseOut(pose, R);
        return { headstock: out(R.onG([AX_TIP, 0])), strings: out(R.onG([-0.06, 0])), bodyEnd: out(R.onG([-0.49, 0])), fretHand: out(R.fret), pickHand: out(R.hand), horn: out(R.onG(AX_HORN)) };
    }

    /**
     * The Devil playing his flaming guitar: Devil.draw's own body and head, the guitar across
     * him, his mitts on it.
     *   pose: whatever Devil.draw takes for the body and the head ({ mood, look, eyes, squash, lean, headDy, headTilt,
     *         tail, step, shadow }) plus
     *         strum (-1..1), fret (0..1 along the neck), solo (0..1: the neck up, leaning back),
     *         flames (0..1: fire off the body and the fork, on twos), shred (0..1: the fretting mitt jumps along
     *         the neck on twos and leaves after-images), t (seconds: the clock of the flames and the shredding),
     *         hand ('left' by default: he is left-handed, the neck to screen LEFT, clear of his tail and mirroring
     *         Mike in a two-shot; 'right': the neck to screen right, as the band wears theirs)
     */
    function devilGuitar(g, x, y, s, pose = {}) {
        const L = 3.2 / s, R = axeRig(pose), mx = R.mx, q = pose.squash ?? 0, out = poseOut(pose, R), fl = clamp(pose.flames ?? 0), d = R.d;
        Devil.draw(g, x, y, s, { ...pose, lean: R.lean, headTilt: R.tilt, handR: NO_HAND, handL: NO_HAND, trident: false, contract: false, pointer: null });
        const body = (fn) => {
            g.save();
            g.translate(x, y);
            g.scale(s, s);
            g.rotate(R.lean);
            g.scale(1 + q, 1 - q);
            g.lineJoin = 'round';
            fn();
            g.restore();
        };
        // the strap: a tail over the neck side's shoulder, down to the upper horn
        body(() => {
            const T = Devil.TORSO, a = R.onG([0.4, -0.27]);
            const cl = [[mx * 0.3, T.y + 0.005, 0.05], [mx * 0.29, T.y + 0.12, 0.048], [lerp(mx * 0.29, a[0], 0.6), lerp(T.y + 0.12, a[1], 0.6), 0.043], [a[0], a[1], 0.038]];
            C.poly(g, ribbon(cl), { fill: AX.tail, ink: K.ink, lw: L * 0.8 });
            line(g, cl.slice(1).map(([px, py]) => [px + mx * 0.018, py]), L * 0.8, AX.tailDark);
        });
        // fire off the body's upper edge, behind the guitar (the film's flame, in the frame's units)
        const flame = (p, size, seed) => {
            const o = out(R.onG(p));
            Fx.flame(g, x + o[0] * s, y + o[1] * s, size * s * fl * (1 + 0.12 * ((d + seed) % 2)), d, seed);
        };
        if (fl > 0.02) {
            flame([-0.3, -0.3], 0.46, 0);
            flame([-0.44, -0.02], 0.36, 2);
            if (R.solo < 0.5) flame([0.45, -0.28], 0.3, 1);
            else flame([-0.3, 0.3], 0.34, 1);
        }
        body(() => {
            axe(g, L, R.gAt, R.gAng, R.gSc, mx);
            // the strap's end hangs off the tail spike: his tail's spade
            const e = R.onG([-0.47, 0.01]), sw = (pose.tail ?? 0) * 2 + (pose.strum ?? 0) * 0.02;
            const cl = C.curve([[e[0], e[1]], [e[0] - mx * 0.08, e[1] + 0.05], [e[0] - mx * 0.17, e[1] + 0.02 + sw], [e[0] - mx * 0.2, e[1] - 0.09 + sw * 1.6], [e[0] - mx * 0.14, e[1] - 0.18 + sw * 2]], false, 5);
            C.poly(g, ribbon(cl.map(([px, py], i) => [px, py, 0.03 - 0.012 * (i / (cl.length - 1))])), { fill: AX.tail, ink: K.ink, lw: L * 0.8 });
            const te = cl[cl.length - 1], tf = cl[cl.length - 3], ta = Math.atan2(te[1] - tf[1], te[0] - tf[0]);
            C.poly(g, cw([[-0.02, -0.02], [-0.05, -0.085], [0.04, -0.05], [0.13, 0], [0.04, 0.05], [-0.05, 0.085], [-0.02, 0.02]].map((p) => {
                const r = rot(p, ta);
                return [te[0] + r[0], te[1] + r[1]];
            })), { fill: AX.tail, ink: K.ink, lw: L * 0.8 });
            // the mitts: the fretting one first (after-images when he shreds), then the picking one
            if (R.shred > 0.05) {
                mittGhost(g, L, R.fretPrev, R.neckDir.map((v) => -v));
                const mid = [(R.fret[0] + R.fretPrev[0]) / 2, (R.fret[1] + R.fretPrev[1]) / 2], n = [-R.neckDir[1], R.neckDir[0]];
                for (const k of [-1, 1]) line(g, [[mid[0] + n[0] * 0.13 * k - R.neckDir[0] * 0.1, mid[1] + n[1] * 0.13 * k - R.neckDir[1] * 0.1], [mid[0] + n[0] * 0.13 * k + R.neckDir[0] * 0.1, mid[1] + n[1] * 0.13 * k + R.neckDir[1] * 0.1]], L * 0.8, K.white);
            }
            devilArm(g, L, R.shN, R.fret);
            devilArm(g, L, R.shF, R.hand);
        });
        // a lick of fire on the fork when it burns high
        if (fl > 0.5) flame([AX_TIP - 0.06, 0], 0.2, 1);
    }

    /**
     * The guitar alone, rising out of a flame: the fork first, like his trident, then the rest.
     *   x, y  the fire's foot;  s  figure units;  k  0 → 1 (0: only the fire; 0.85: it is all out; 1: it hangs
     *   there, tilted, for a mitt to take);  t  seconds, for the fire's flicker on twos
     * fromFirePoints(k) gives where it is, in figure units from (x, y): { neck (where a mitt takes it), body, fork }.
     */
    function fromFire(k) {
        const rise = back(seg(k, 0.1, 0.85)), sc = 0.82;
        const ang = -PI / 2 + lerp(0, 0.2, smooth(seg(k, 0.7, 1))), at = [0.02, lerp(0.75, -1.2, rise)];
        const on = (p) => {
            const r = rot(p, ang);
            return [r[0] * sc + at[0], r[1] * sc + at[1]];
        };
        return { ang, at, sc, on };
    }
    const fromFirePoints = (k) => {
        const F = fromFire(k);
        return { neck: F.on([0.55, 0]), body: F.on([0, 0]), fork: F.on([AX_TIP, 0]) };
    };
    function guitarFromFire(g, x, y, s, k, t = 0) {
        const d = C.drawing(t), F = fromFire(clamp(k)), big = (0.75 + 0.5 * smooth(seg(k, 0, 0.2))) * (1 - 0.3 * smooth(seg(k, 0.8, 1)));
        // the fire behind: one tall flame and two at its shoulders
        Fx.flame(g, x - 0.4 * s, y, 1.05 * s * big, d, 1);
        Fx.flame(g, x + 0.42 * s, y, 0.95 * s * big, d, 2);
        Fx.flame(g, x, y, 1.5 * s * big, d, 0);
        if (k > 0.02) {
            // a starburst behind it as it clears the fire, so the red guitar reads on the red flame
            const pop = back(seg(k, 0.3, 0.62)), bo = F.on([0.25, 0]), turn = d % 2 ? 0.06 : 0;
            if (pop > 0.01) {
                C.burst(g, x + bo[0] * s, y + bo[1] * s, { r0: 0.62 * s * pop, r1: 1.02 * s * pop, n: 12, seed: 'inferno-pop', fill: K.yellow, ink: K.ink, lw: 3.2, rot: turn });
                C.burst(g, x + bo[0] * s, y + bo[1] * s, { r0: 0.4 * s * pop, r1: 0.7 * s * pop, n: 12, seed: 'inferno-pop2', fill: K.white, lw: 0, rot: turn + 0.2 });
            }
            g.save();
            g.beginPath();
            g.rect(x - 3 * s, y - 6 * s, 6 * s, 6 * s); // it comes out of the fire, not out of the floor
            g.clip();
            // its own flames, behind it
            const fk = smooth(seg(k, 0.2, 0.6));
            for (const [p, size, sd] of [[[-0.3, -0.3], 0.4, 0], [[-0.3, 0.3], 0.4, 2], [[0.45, -0.28], 0.26, 1]]) {
                const o = F.on(p);
                if (fk > 0.02) Fx.flame(g, x + o[0] * s, y + o[1] * s, size * s * fk, d, sd);
            }
            g.translate(x, y);
            g.scale(s, s);
            g.lineJoin = 'round';
            axe(g, 3.2 / s, F.at, F.ang, F.sc, 1);
            g.restore();
        }
        // the fire in front: low tongues over whatever is still in it
        const low = 1 - 0.45 * smooth(seg(k, 0.6, 1));
        Fx.flame(g, x - 0.2 * s, y, 0.8 * s * big * low, d + 1, 2);
        Fx.flame(g, x + 0.24 * s, y, 0.7 * s * big * low, d + 1, 0);
        // sparks thrown up as it comes
        const r = Motion.rng('inferno-sparks');
        for (let i = 0; i < 9; i++) {
            const a = -PI / 2 + (r() - 0.5) * 1.5, sp = 1.1 + r() * 1.6, t0 = 0.08 + r() * 0.6, u = (k - t0) / 0.3, sz = 0.035 + r() * 0.03;
            if (u <= 0 || u >= 1) continue;
            const px = x + Math.cos(a) * sp * u * s, py = y - 0.5 * s + Math.sin(a) * sp * u * s + 0.9 * u * u * s;
            C.sparkle(g, px, py, sz * s * (1 - u * 0.5) * 2.6, { color: i % 2 ? K.yellow : K.white, rot: i });
        }
    }

    // =========================================================================================
    // The contract, torn
    // =========================================================================================
    const zig = (seed, n, amp) => {
        const r = Motion.rng(seed);
        return Array.from({ length: n + 1 }, (_, i) => (i % 2 ? 1 : -1) * amp * (0.5 + r() * 0.6));
    };
    // The four pieces of a sheet torn down the middle and then across: outlines in the contract's own frame.
    function tornPieces(seed) {
        // the sheet is ±0.232 wide where it is torn across and ±0.35 tall with its rolls; the pieces' outer bounds are generous
        const X = 0.45, Y = 0.55, sx = 0.232, sy = 0.35, n = 10, mid = n / 2, zv = zig('tornV' + seed, n, 0.02), zl = zig('tornL' + seed, 4, 0.02), zr = zig('tornR' + seed, 4, 0.02);
        const V = zv.map((dx, i) => [dx + 0.01, -sy + (2 * sy * i) / n]); // the first tear, top to bottom
        const cl = -0.03, cr = 0.045; // where each half is torn across
        const HL = zl.map((dy, i) => [-sx + ((V[mid][0] + sx) * i) / 4, i === 4 ? V[mid][1] : cl + dy]);
        const HR = zr.map((dy, i) => [V[mid][0] + ((sx - V[mid][0]) * i) / 4, i === 0 ? V[mid][1] : cr + dy]);
        const vt = [[V[0][0], -Y], ...V.slice(0, mid + 1)], vb = [...V.slice(mid), [V[n][0], Y]];
        const hl = [[-X, HL[0][1]], ...HL], hr = [...HR, [X, HR[4][1]]];
        return {
            halves: [
                { poly: [[-X, -Y], ...vt, ...vb.slice(1), [-X, Y]], torn: [V], c: [-0.14, 0] },
                { poly: [[X, -Y], [X, Y], ...vb.slice(1).reverse(), ...vt.slice().reverse()], torn: [V], c: [0.15, 0] },
            ],
            quarters: [
                { poly: [[-X, -Y], ...vt, ...hl.slice(0, -1).reverse()], torn: [V.slice(0, mid + 1), HL], c: [-0.14, -0.19], half: 0, up: -1 },
                { poly: [...hl, ...vb.slice(1), [-X, Y]], torn: [V.slice(mid), HL], c: [-0.14, 0.17], half: 0, up: 1 },
                { poly: [[X, -Y], ...hr.slice().reverse(), ...vt.slice(0, -1).reverse()], torn: [V.slice(0, mid + 1), HR], c: [0.15, -0.15], half: 1, up: -1 },
                { poly: [...hr, [X, Y], ...vb.slice(1).reverse()], torn: [V.slice(mid), HR], c: [0.15, 0.2], half: 1, up: 1 },
            ],
        };
    }
    // How the halves and the quarters move with k (the contract's frame, y down): [dx, dy, rot].
    function tornMove(k, seed, fall) {
        const a = back(seg(k, 0.05, 0.22)), b = back(seg(k, 0.27, 0.42)), u = seg(k, 0.42, 1), r = Motion.rng('tornF' + seed);
        const half = (i) => {
            const sx = i ? 1 : -1;
            return [sx * 0.15 * a, -0.03 * a, sx * 0.2 * a];
        };
        const quarter = (p, i) => {
            const h = half(p.half), sx = p.half ? 1 : -1, ph = r() * TAU, sp = 0.78 + r() * 0.3, amp = 0.16 + r() * 0.14, fu = clamp(u * sp * 1.25), dn = fu * fu * (3 - 2 * fu) * 0.55 + fu * 0.45;
            return [h[0] + sx * 0.05 * b + (amp * Math.sin(fu * PI * 3 + ph) - amp * Math.sin(ph)) * (fu > 0 ? 1 : 0) + sx * 0.12 * fu, h[1] + p.up * 0.09 * b + fall * dn, h[2] + p.up * sx * 0.16 * b + 0.75 * Math.sin(fu * PI * 3 + ph + 1.2) * Math.sin(Math.min(1, fu * 4) * PI * 0.5) * (1 - 0.4 * fu)];
        };
        return { half, quarter, four: k >= 0.27 };
    }
    /**
     * The contract torn in two, then in four, the pieces fluttering down.
     *   x, y  the middle of the whole contract;  s  figure units;  k  0 → 1 (0 whole; 0.05–0.22 it is torn down the
     *   middle and the halves part; 0.27–0.42 each half is torn across; 0.42–1 the four pieces flutter down `fall`
     *   units);  seed  a number: another tear, another flutter;  o: { fall (2.2), signed (Tom's scrawl on it), ang }
     * tornPoints(k, seed, o) gives the two halves' middles in figure units from (x, y), for his mitts (k ≤ 0.42).
     */
    function tornContract(g, x, y, s, k, seed = 0, o = {}) {
        const L = 3.2 / s, kk = clamp(k), P = tornPieces(seed), M = tornMove(kk, seed, o.fall ?? 2.2);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.rotate(o.ang ?? 0);
        g.lineJoin = 'round';
        if (kk < 0.05) {
            Devil.contract(g, 0, 0, L, { open: 1, signed: o.signed });
            g.restore();
            return;
        }
        const piece = (p, [dx, dy, a]) => {
            g.save();
            g.translate(p.c[0] + dx, p.c[1] + dy);
            g.rotate(a);
            g.translate(-p.c[0], -p.c[1]);
            g.save();
            C.trace(g, p.poly);
            g.clip();
            Devil.contract(g, 0, 0, L, { open: 1, signed: o.signed });
            g.restore();
            // the torn edges get the outline the clip cut away
            for (const e of p.torn) line(g, e, L);
            g.restore();
        };
        if (!M.four) P.halves.forEach((p, i) => piece(p, M.half(i)));
        else {
            const mv = P.quarters.map((p, i) => M.quarter(p, i));
            [1, 3, 0, 2].forEach((i) => piece(P.quarters[i], mv[i]));
        }
        // scraps at each tear
        const r = Motion.rng('tornS' + seed);
        for (let i = 0; i < 8; i++) {
            const t0 = i < 4 ? 0.06 + r() * 0.1 : 0.28 + r() * 0.1, u = (kk - t0) / 0.28, a = r() * TAU, sp = 0.3 + r() * 0.5, px = i < 4 ? 0.01 : i % 2 ? -0.16 : 0.17, py = i < 4 ? (r() - 0.5) * 0.6 : 0;
            if (u <= 0 || u >= 1) continue;
            const cx = px + Math.cos(a) * sp * u, cy = py + Math.sin(a) * sp * u * 0.6 + 0.8 * u * u, ra = a + u * 5;
            C.poly(g, [[-0.045, -0.03], [0.045, -0.02], [0.03, 0.03], [-0.02, 0.04]].map((p) => {
                const q = rot(p, ra);
                return [cx + q[0], cy + q[1]];
            }), { fill: DP.paper, ink: K.ink, lw: L * 0.6 });
        }
        g.restore();
    }
    function tornPoints(k, seed = 0, o = {}) {
        const P = tornPieces(seed), M = tornMove(clamp(k), seed, o.fall ?? 2.2), a = o.ang ?? 0;
        const at = (p, [dx, dy]) => rot([p.c[0] + dx, p.c[1] + dy], a);
        return { l: at(P.halves[0], M.half(0)), r: at(P.halves[1], M.half(1)) };
    }

    // =========================================================================================
    // The Devil's box
    // =========================================================================================
    // His private balcony over the pit: a slab of floor on a corbel, a carved back with a pointed
    // niche and a keystone, velvet curtains tied back, a rock parapet with a velvet rail, and a
    // little skull for a lamp at the rail's left end. Figure units; the origin is the floor
    // under the Devil; the box reaches from x = -1.0 to 1.25 (room for his tail) and its front
    // is 0.45 nearer to us than he is.
    const BOX = {
        rail: { handR: [-0.62, -0.74], handL: [0.52, -0.74] }, // his mitts resting on the rail (Devil.draw's handR, handL)
        x0: -1.0, x1: 1.25, railY: -0.67, top: -2.75, bottom: 1.1, lamp: [-0.97, -0.66],
    };
    const VELVET = { front: K.magenta, top: K.pink, side: '#a8176a', dark: '#8a1259' };
    /**
     * The Devil's balcony. x, y: the floor under him; s: figure units.
     *   o: { shake (0..1: it judders on twos, the lamp hops, crumbs fall: for his stomping), t (seconds),
     *        part ('back' | 'front' to draw one half yourself), glow (0..1 the lamp's eyes and flame, default 1) }
     *   inside(g): draws whoever stands in it, between the two halves, in the frame's units (the shake is applied).
     * Inferno.BOX.rail gives handR / handL for his mitts on the rail; Inferno.boxLamp(x, y, s) where the lamp is.
     */
    function box(g, x, y, s, o = {}, inside = null) {
        const L = 3.2 / s, shake = clamp(o.shake ?? 0), t = o.t ?? 0, d = C.drawing(t), z0 = -0.45, z1 = 0.55;
        const jx = [0, 1, -1, 0.6, -0.6, 0.3][((d % 6) + 6) % 6] * 0.022 * shake * s, jy = [0, -1, 0.6, -0.4, 1, -0.7][((d % 6) + 6) % 6] * 0.016 * shake * s;
        const P = (px, py, z) => [px + D[0] * z, py + D[1] * z];
        const X0 = BOX.x0, X1 = BOX.x1, mid = (X0 + X1) / 2;
        const unit = (fn) => {
            g.save();
            g.translate(x + jx, y + jy);
            g.scale(s, s);
            g.lineJoin = 'round';
            fn();
            g.restore();
        };
        const backHalf = () => unit(() => {
            // the arm of rock that carries it, off to the right into the wall
            C.prism(g, cw([P(X1, -0.3, z1), P(X1 + 1.2, -0.42, z1), P(X1 + 1.2, 0.5, z1), P(X1, 0.34, z1)]), Dd(0.3), { front: R.wall, top: R.top, side: R.wallD }, { lw: L });
            // the carved back: a pointed arch with a dark niche
            const arch = (k, dy = 0) => {
                const hw = (X1 - X0) / 2 * k, base = 0.12, sh = -1.62 * k + dy, pk = -2.5 * k + dy;
                return [[mid - hw, base], [mid - hw, sh], ...C.curve([[mid - hw, sh], [mid - hw * 0.72, sh - 0.52 * k], [mid, pk], [mid + hw * 0.72, sh - 0.52 * k], [mid + hw, sh]], false, 6).slice(1, -1), [mid + hw, sh], [mid + hw, base]];
            };
            const slab = shift(cw(arch(1)), Dd(z1));
            C.prism(g, slab, Dd(0.22), { front: R.wallL, top: R.top, side: R.wallD }, { lw: L, sweepInk: null });
            C.prismOutline(g, slab, Dd(0.22), { lw: L });
            const niche = shift(cw(arch(0.84, -0.0)), Dd(z1));
            C.poly(g, niche, { fill: R.floor, ink: K.ink, lw: L * 0.8 });
            g.save();
            C.trace(g, niche);
            g.clip();
            facets(g, 'inferno-niche', 9, [X0, -2.4, X1 - X0, 2.2], '#4a0c17', '#2a0810', 0.006);
            g.restore();
            // a keystone
            const kx = mid + D[0] * z1, ky = -2.5 + D[1] * z1;
            C.prism(g, cw([[kx - 0.12, ky - 0.06], [kx + 0.12, ky - 0.06], [kx + 0.07, ky + 0.2], [kx - 0.07, ky + 0.2]]), Dd(0.3), { front: R.top, top: '#e0566a', side: R.wall }, { lw: L });
            // the floor and its carpet
            C.poly(g, [P(X0, 0, z0), P(X1, 0, z0), P(X1, 0, z1), P(X0, 0, z1)], { fill: R.shelf, ink: K.ink, lw: L });
            C.poly(g, [P(X0 + 0.25, 0, z0 + 0.12), P(X1 - 0.25, 0, z0 + 0.12), P(X1 - 0.25, 0, z1 - 0.1), P(X0 + 0.25, 0, z1 - 0.1)], { fill: VELVET.side, ink: K.ink, lw: L * 0.8 });
            // the curtains: velvet, tied back to each side with a gold cord
            for (const sx of [-1, 1]) {
                const e = mid + sx * (X1 - X0) / 2 * 0.84, at = (px, py) => P(e - sx * px, py, z1 - 0.03);
                const cur = [at(0, -1.36), at(0.04, -1.78), at(0.34, -2.02), at(0.62, -2.14), at(0.5, -1.7), at(0.26, -1.25), at(0.2, -1.05), at(0.3, -0.5), at(0.36, -0.02), at(0, -0.02)];
                C.poly(g, cur, { fill: VELVET.front, ink: K.ink, lw: L });
                line(g, [at(0.12, -1.75), at(0.2, -1.3), at(0.1, -1.08)], L * 0.8, VELVET.dark);
                line(g, [at(0.34, -1.9), at(0.3, -1.5)], L * 0.8, VELVET.dark);
                line(g, [at(0.12, -0.9), at(0.18, -0.1)], L * 0.8, VELVET.dark);
                line(g, [at(0.05, -1.5), at(0.06, -1.2)], L * 0.8, VELVET.top);
                C.poly(g, [at(-0.02, -1.2), at(0.28, -1.22), at(0.27, -1.08), at(-0.02, -1.04)], { fill: K.gold, ink: K.ink, lw: L * 0.8 });
            }
            // the right side wall of the parapet
            C.poly(g, [P(X1, -0.55, z0), P(X1, -0.55, z1), P(X1, 0.12, z1), P(X1, 0.12, z0)], { fill: R.wallD, ink: K.ink, lw: L });
        });
        const frontHalf = () => unit(() => {
            // the corbel under the floor: steps of rock down to a point, a drip or two
            const f = (px, py) => P(px, py, z0);
            const cor = cw([f(X0, 0.1), f(X1, 0.1), f(X1 - 0.2, 0.34), f(X1 - 0.55, 0.42), f(X1 - 0.68, 0.64), f(mid + 0.32, 0.72), f(mid + 0.1, 1.02), f(mid - 0.12, 0.78), f(X0 + 0.62, 0.7), f(X0 + 0.5, 0.44), f(X0 + 0.16, 0.36)]);
            C.prism(g, cor, Dd(0.85), { front: R.wall, top: R.top, side: R.wallD }, { lw: L });
            line(g, [f(X0 + 0.4, 0.26), f(mid, 0.3), f(X1 - 0.5, 0.25)], L * 0.8, R.wallD);
            line(g, [f(X0 + 0.7, 0.56), f(mid + 0.1, 0.58), f(X1 - 0.8, 0.52)], L * 0.8, R.wallD);
            C.poly(g, [f(X0 + 0.3, 0.16), f(X0 + 0.7, 0.14), f(X0 + 0.62, 0.3)], { fill: R.wallL, lw: 0 });
            C.poly(g, [f(mid + 0.3, 0.38), f(mid + 0.6, 0.34), f(mid + 0.42, 0.56)], { fill: R.wallL, lw: 0 });
            // the parapet: a rock wall with two sunk panels, each carved with a small fork
            const a = f(X0, -0.55);
            C.box(g, a[0], a[1], X1 - X0, 0.67, D, { front: R.wallL, top: R.top, side: R.wallD }, { lw: L, depth: 0.16 });
            for (const cx of [X0 + 0.6, X1 - 0.6]) {
                const c = f(cx, -0.21), w = 0.44, h = 0.2;
                C.poly(g, [[c[0] - w, c[1] - h], [c[0] + w - 0.08, c[1] - h], [c[0] + w, c[1] - h + 0.08], [c[0] + w, c[1] + h], [c[0] - w + 0.08, c[1] + h], [c[0] - w, c[1] + h - 0.08]], { fill: R.wall, ink: K.ink, lw: L * 0.8 });
                g.strokeStyle = R.deep;
                g.lineWidth = L * 1.3;
                g.lineCap = 'round';
                g.beginPath();
                g.moveTo(c[0], c[1] + 0.14);
                g.lineTo(c[0], c[1] - 0.14);
                g.moveTo(c[0] - 0.11, c[1] - 0.13);
                g.lineTo(c[0] - 0.11, c[1] - 0.03);
                g.lineTo(c[0] + 0.11, c[1] - 0.03);
                g.lineTo(c[0] + 0.11, c[1] - 0.13);
                g.stroke();
            }
            line(g, crackPts('boxcrack', f(mid - 0.1, -0.46), f(mid + 0.04, -0.0), 4, 0.03), L * 0.8);
            // the velvet rail: a padded roll with tufts, gold studs and a tassel at each end
            const r0 = f(X0 - 0.09, -0.71), rw = X1 - X0 + 0.18;
            const roll = [];
            for (const [cx, cy, a0] of [[r0[0] + 0.08, r0[1] + 0.08, PI], [r0[0] + rw - 0.08, r0[1] + 0.08, -PI / 2]]) for (let i = 0; i <= 6; i++) roll.push([cx + Math.cos(a0 + (i / 6) * PI * 0.5) * 0.08, cy + Math.sin(a0 + (i / 6) * PI * 0.5) * 0.08]);
            roll.push([r0[0] + rw, r0[1] + 0.17], [r0[0], r0[1] + 0.17]);
            C.prism(g, cw(roll), Dd(0.26), { front: VELVET.front, top: VELVET.top, side: VELVET.side }, { lw: L, sweepInk: null });
            C.prismOutline(g, cw(roll), Dd(0.26), { lw: L });
            for (let i = 1; i < 8; i++) {
                const tx = r0[0] + (rw * i) / 8;
                line(g, [[tx, r0[1] + 0.03], [tx - 0.012, r0[1] + 0.14]], L * 0.7, VELVET.dark);
                circ(g, tx, r0[1] + 0.17, 0.022, K.gold, L * 0.6);
            }
            line(g, [[r0[0] + 0.1, r0[1] + 0.04], [r0[0] + rw * 0.4, r0[1] + 0.04]], L * 0.8, VELVET.top);
            for (const tx of [r0[0] + 0.03, r0[0] + rw - 0.03]) {
                line(g, [[tx, r0[1] + 0.17], [tx, r0[1] + 0.25]], L * 1.6);
                C.poly(g, [[tx - 0.04, r0[1] + 0.24], [tx + 0.04, r0[1] + 0.24], [tx + 0.055, r0[1] + 0.38], [tx, r0[1] + 0.35], [tx - 0.055, r0[1] + 0.38]], { fill: K.gold, ink: K.ink, lw: L * 0.8 });
            }
            // the lamp: a little skull on the rail, its eyes lit, a candle flame on its crown
            const hop = shake * [0, 0.05, 0.01, 0.04, 0, 0.02][((d % 6) + 6) % 6], gl = clamp(o.glow ?? 1);
            g.save();
            g.translate(BOX.lamp[0], BOX.lamp[1] - hop);
            g.rotate(shake * [0, 0.16, -0.1, 0.12, -0.14, 0.06][((d % 6) + 6) % 6]);
            C.box(g, -0.15, -0.05, 0.3, 0.05, D, { front: K.gold, top: '#fff59a', side: DP.tieDark }, { lw: L * 0.8, depth: 0.14 });
            miniSkull(g, L * 0.8, 0.02, -0.05, 0.4, gl > 0.05 ? mix('#2a2438', K.yellow, gl) : null, s < 130); // small on screen: fewer lines
            g.restore();
            // crumbs shaken off the corbel
            if (shake > 0.05) {
                const rr = Motion.rng('inferno-crumbs');
                for (let i = 0; i < 7; i++) {
                    const px = X0 + 0.2 + rr() * (X1 - X0 - 0.4), T = 0.5 + rr() * 0.4, u = ((t + rr() * T) % T) / T, sz = 0.03 + rr() * 0.035;
                    if (i / 7 > shake) continue;
                    const c = f(px, 0.4 + u * u * 1.3);
                    C.poly(g, [[c[0] - sz, c[1]], [c[0], c[1] - sz], [c[0] + sz, c[1] + sz * 0.4], [c[0] - sz * 0.2, c[1] + sz]], { fill: R.wall, ink: K.ink, lw: L * 0.7 });
                }
            }
        });
        if (o.part !== 'front') backHalf();
        if (inside && !o.part) {
            g.save();
            g.translate(jx, jy);
            inside(g);
            g.restore();
        }
        if (o.part !== 'back') {
            frontHalf();
            const lp = boxLamp(x + jx, y + jy, s), gl = clamp(o.glow ?? 1);
            if (gl > 0.05) Fx.flame(g, lp[0], lp[1] - 0.35 * s, 0.22 * s * gl * (1 + 0.15 * (d % 2)), d, 1);
        }
    }
    const boxLamp = (x, y, s) => [x + (BOX.lamp[0] + 0.02 + D[0] * -0.45 + 0.03) * s, y + (BOX.lamp[1] - 0.05 + D[1] * -0.45) * s];

    // =========================================================================================
    // The volcano
    // =========================================================================================
    // The venue's far end, a wider shot: the lava lake rises into a cone, and the rock the car
    // stands on is the plug of its crater. Its own set coordinates: the 1000 × 1000 frame of its
    // wide view, the crater's floor line at y = 640, the car on it at s = 54. Views:
    //     'wide'   k = 1       the whole cone in the lake; the car at (500, 640), s = 54
    //     'stage'  k = 84/54   the crater close, as the venue's wide view frames the stage: the car at (500, 800), s = 84
    // Draw order: volcano(g, t, o), then the car at volcanoTop(o), then volcanoFront(g, t, o).
    const VV = { wide: { k: 1, cx: 500, cy: 500 }, stage: { k: 84 / 54, cx: 500, cy: 640 - (300 * 54) / 84 } };
    const CRATER = 640, VSHORE = 430, VX = 512;
    function camV(view = 'wide', pan = 0) {
        const v = typeof view === 'string' ? VV[view] ?? VV.wide : { k: view.k ?? 1, cx: view.cx ?? 500, cy: view.cy ?? 500 };
        return { k: v.k, cx: clamp(v.cx + pan, 300, 700), cy: v.cy };
    }
    const vRise = (e) => 1700 * Math.pow(e, 1.8) + 60 * smooth(e / 0.12);
    const vShake = (t, rumble, erupt) => {
        const d = C.drawing(t), a = 5 * rumble + (erupt > 0 && erupt < 1 ? 3 : 0), i = ((d % 6) + 6) % 6;
        return [[0, 1, -0.8, 0.5, -1, 0.3][i] * a, [0, -0.6, 1, -1, 0.4, 0.8][i] * a * 0.7];
    };
    const CONE_L = [[205, 640], [152, 700], [118, 714], [72, 798], [34, 814], [-24, 900], [-90, 1020]];
    const CONE_R = [[795, 640], [850, 704], [886, 722], [932, 800], [970, 820], [1024, 900], [1090, 1020]];
    const RIVERS = [[[330, 648], [318, 700], [352, 760], [330, 830], [360, 900], [340, 1010]], [[610, 646], [640, 716], [612, 790], [660, 860], [640, 1010]], [[468, 650], [486, 720], [462, 800], [490, 880], [476, 1010]]];
    const VCRACKS = [[[250, 690], [205, 790]], [[730, 700], [790, 780]], [[400, 700], [420, 790]], [[560, 690], [545, 800]], [[150, 800], [110, 890]], [[850, 790], [900, 880]], [[690, 820], [730, 910]], [[280, 830], [250, 930]]];
    const CONE_BOX = { x: -140, y: 560, w: 1320, h: 480 };
    function cone(g, L) {
        const front = [...CONE_L, ...CONE_R.slice().reverse()], dz = [34, -28];
        // the far slope's side, the plateau, the near face
        C.poly(g, [...CONE_R, ...CONE_R.slice().reverse().map(([x, y]) => [x + dz[0], y + dz[1]])], { fill: R.wallD, ink: K.ink, lw: 3.6 * L });
        C.poly(g, [CONE_L[0], CONE_R[0], [CONE_R[0][0] + dz[0], CONE_R[0][1] + dz[1]], [CONE_L[0][0] + dz[0], CONE_L[0][1] + dz[1]]], { fill: R.shelf, ink: K.ink, lw: 3.6 * L });
        const r = Motion.rng('inferno-plateau');
        for (let x = 250; x < 780; x += 70 + r() * 50) C.poly(g, [[x, 630], [x + 44, 627], [x + 56, 636], [x + 8, 638]].map(([px, py]) => [px + 12, py - 8]), { fill: R.shelfL, lw: 0 });
        C.poly(g, front, { fill: R.wall, ink: K.ink, lw: 3.6 * L });
        g.save();
        C.trace(g, front);
        g.clip();
        facets(g, 'inferno-cone', 44, [-60, 660, 1140, 360], R.wallL, R.wallD, 1.2);
        // ledges across it
        for (const [x0, x1, y, tl] of [[150, 330, 708, 5], [392, 600, 734, -4], [660, 870, 712, 6], [50, 236, 796, -6], [300, 452, 832, 4], [520, 740, 806, -5], [806, 960, 836, 7], [-10, 190, 902, 5], [250, 500, 924, -4], [570, 790, 894, 6], [850, 1060, 926, -6]]) {
            C.poly(g, [[x0, y + tl], [x0 + 26, y - 9 + tl * 0.6], [x1 - 20, y - 7 - tl * 0.6], [x1, y + 2 - tl], [x1 - 30, y + 8 - tl * 0.7], [x0 + 20, y + 7 + tl * 0.7]], { fill: R.top, lw: 0 });
            line(g, [[x0 + 14, y + 8 + tl * 0.7], [x1 - 24, y + 9 - tl * 0.7]], 2.4 * L, R.deep);
        }
        g.restore();
        C.poly(g, front, { ink: K.ink, lw: 3.6 * L });
    }
    // puffs of smoke: outlines of the whole group first, fills on top, so they merge
    function smoke(g, L, list, fill = '#4a4470', lit = '#6c66a0') {
        g.strokeStyle = K.ink;
        g.lineWidth = 6.4 * L;
        g.beginPath();
        for (const [x, y, r] of list) {
            g.moveTo(x + r, y);
            g.arc(x, y, r, 0, TAU);
        }
        g.stroke();
        g.fillStyle = fill;
        g.beginPath();
        for (const [x, y, r] of list) {
            g.moveTo(x + r, y);
            g.arc(x, y, r, 0, TAU);
        }
        g.fill();
        g.fillStyle = lit;
        g.beginPath();
        for (const [x, y, r] of list) {
            g.moveTo(x - r * 0.1 + r * 0.84, y - r * 0.12);
            g.arc(x - r * 0.1, y - r * 0.12, r * 0.84, 0, TAU);
        }
        g.fill();
    }
    // The column as one outline: two sides that bulge (the bulges climb on twos) and a head of
    // round bumps that boil, wider than the stream. w: the stream's width; ph: its phase.
    function jet(cx, yb, yt, w, t2, k, f, ph = 0) {
        const A = [], B = [], yh = yt + 44, n = Math.max(3, Math.ceil((yb - yh) / 40)), hw = (w / 2 + 64 * (w / 300)) * k, hh = 58 * (0.5 + 0.5 * (w / 300)) * k;
        for (let i = 0; i <= n; i++) {
            const y = lerp(yb, Math.min(yb - 2, yh), i / n), wob = 15 * k * Math.sin(y * 0.03 + t2 * 13 + ph), flare = 34 * k * Math.pow(1 - i / n, 4);
            A.push([cx - (w / 2) * k - flare - wob, y]);
            B.push([cx + (w / 2) * k + flare - wob * 0.6, y]);
        }
        // the head: a cap whose rim swells in seven round bumps (they swap places on twos), flat underneath
        const head = [], yc = Math.min(yb - 2, yh);
        for (let i = 0; i <= 44; i++) {
            const u = i / 44, a = PI + u * PI, rad = 1 + 0.085 * Math.cos(u * PI * 14 + (f ? PI : 0)) * Math.min(1, Math.sin(u * PI) * 4);
            head.push([cx + Math.cos(a) * hw * rad, yc + Math.sin(a) * hh * rad]);
        }
        return [...A, ...head, ...B.reverse()];
    }
    /**
     * The volcano, a full backdrop.
     *   o: { rumble (0..1: the cone judders on twos, cracks open one after another and glow, the crater brightens,
     *        stones hop), erupt (0..1: the column of lava and smoke; it lifts whatever stands on the plug: 0.05 the
     *        plug pops, 0.4 half way up the frame, 0.6 out through the top, 1 long gone), view ('wide' | 'stage'),
     *        pan (-200..200) }
     * Inferno.volcanoTop(o) → { x, y, s }: the top of the column on screen (the car's ground point and scale).
     */
    function volcano(g, t, o = {}) {
        const V = camV(o.view, o.pan), rumble = clamp(o.rumble ?? 0), e = clamp(o.erupt ?? 0), d = C.drawing(t), t2 = C.onTwos(t), heat = clamp(0.7 + 0.3 * Math.max(rumble, e > 0 ? 1 : 0));
        const sh = vShake(t, rumble, e), fk = 0.75;
        g.save();
        g.lineJoin = 'round';
        // the far wall, smaller: we stand further back
        layer(g, V, Q.far, (L) => {
            g.translate(500, VSHORE);
            g.scale(fk, fk);
            g.translate(-500, -SHORE);
            still(g, 'inferno-far:' + V.k * fk, FAR_BOX, (c) => farWall(c, 1 / (V.k * fk)));
        });
        lake(g, V, t, heat, VSHORE, 1010, false, 2.5);
        layer(g, V, Q.far, (L) => {
            g.translate(500, VSHORE);
            g.scale(fk, fk);
            g.translate(-500, -SHORE);
            for (const [x, y, w] of FALLS) fall(g, L / fk, x, y + 10, w, d, heat);
        });
        for (const [x, sd] of [[230, 0], [770, 2], [20, 1], [980, 0]]) flameAt(g, V, Q.far, x, VSHORE + 14, 62 * (1 + 0.3 * rumble), d, sd);
        // ripples round the cone's foot when it rumbles
        if (rumble > 0.05) {
            layer(g, V, 1, (L) => {
                g.strokeStyle = mix(R.glow, R.hot, 0.6);
                g.lineWidth = 3 * L;
                for (const [x, y, sx] of [[60, 790, -1], [935, 800, 1], [-10, 890, -1], [1010, 880, 1], [140, 700, -1], [870, 706, 1]]) {
                    const u = ((t2 * 1.4 + x * 0.013) % 1 + 1) % 1;
                    if (u > rumble + 0.2) continue;
                    g.beginPath();
                    g.ellipse(x + sx * (30 + 70 * u), y + 14, 22 + 26 * u, 5 + 3 * u, 0, sx > 0 ? -1.2 : PI - 1.2, sx > 0 ? 1.2 : PI + 1.2);
                    g.stroke();
                }
            });
        }
        const top = CRATER - vRise(e), cx = VX;
        layer(g, V, 1, (L) => {
            g.translate(sh[0], sh[1]);
            // smoke behind the cone's shoulders once it blows
            if (e > 0) {
                const list = [];
                for (let i = 0; i < 12; i++) {
                    const u = ((t2 * 0.55 + i / 12) % 1 + 1) % 1, sx = i % 2 ? 1 : -1, grow = smooth(e / 0.2);
                    list.push([cx + sx * (150 + 150 * u + 26 * Math.sin(i * 2.4)) * (0.55 + 0.45 * grow), CRATER - 30 - u * 560 * grow, (34 + 60 * u) * grow * (u > 0.85 ? (1 - u) / 0.15 : 1)]);
                }
                smoke(g, L, list.filter((p) => p[2] > 9));
            }
            still(g, 'inferno-cone:' + V.k, CONE_BOX, (c) => cone(c, 1 / V.k));
            // the lava that runs down it, the cracks that open as it rumbles
            RIVERS.forEach((p, i) => {
                const pts = C.curve(p, false, 5);
                line(g, pts, 12 * L);
                line(g, pts, 6.5 * L, mix(R.glow, R.hot, 0.5 + 0.5 * heat));
                line(g, pts.map(([x, y]) => [x - 1.2, y]), 2.2 * L, (d + i) % 4 < 2 ? R.white : R.hot);
            });
            VCRACKS.forEach(([a, b], i) => {
                const k = seg(rumble, i / 9, i / 9 + 0.2);
                if (k <= 0) return;
                const pts = crackPts('vck' + i, a, b, 5, 10), n = Math.max(2, Math.ceil(pts.length * k));
                glowCrack(g, L, pts.slice(0, n), (d + i) % 2 === 0, 1);
            });
            // the crater: a slot of fire across the plateau
            const glow = mix(R.floor, R.hot, Math.max(rumble * 0.9, e > 0 ? 1 : 0));
            g.beginPath();
            g.ellipse(cx + 12, CRATER - 13, 236, 11, 0, 0, TAU);
            g.fillStyle = glow;
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = 3.2 * L;
            g.stroke();
            if (rumble > 0.3 || e > 0) {
                g.beginPath();
                g.ellipse(cx + 12, CRATER - 12, 200, 6, 0, 0, TAU);
                g.fillStyle = R.white;
                g.fill();
            }
            // stones that hop on the plateau and down the slopes
            if (rumble > 0.1) {
                const rr = Motion.rng('inferno-stones');
                for (let i = 0; i < 9; i++) {
                    const x = 150 + rr() * 700, T = 0.34 + rr() * 0.3, u = ((t2 + rr()) % T) / T, sz = 5 + rr() * 6, hop = Math.sin(u * PI) * (10 + 26 * rumble), y = i < 4 ? 652 : 700 + rr() * 200;
                    if (i / 9 > rumble) continue;
                    C.poly(g, [[x - sz, y - hop], [x - sz * 0.2, y - sz - hop], [x + sz, y - sz * 0.3 - hop], [x + sz * 0.5, y + sz * 0.6 - hop]], { fill: R.wallL, ink: K.ink, lw: 2.6 * L });
                }
            }
            // the column: three nested streams, a head of bulges under whatever rides it
            if (e > 0) {
                const yb = CRATER - 12, k = smooth(e / 0.08), yt = top + 26;
                [[300, K.red, true, 0], [200, K.orange, false, 1.3], [96, K.yellow, false, 2.6]].forEach(([w, col, ink, ph]) => C.poly(g, jet(cx, yb, yt, w, t2, k, d % 2, ph), { fill: col, ink: ink ? K.ink : null, lw: ink ? 3.6 * L : 0 }));
                // tongues climbing it: tapered licks, hotter than the band they are on
                for (let i = 0; i < 9; i++) {
                    const u = (((i * 97 + d * 40) % 520) / 520), y = lerp(yb - 20, yt + 70, u), dx = [-112, -34, 20, 96, -80, 0, 60, -20, 118][i], h = 38 + (i % 3) * 16, w = 7 + (i % 2) * 3;
                    if (y < yt + 60 || y > yb - 30) continue;
                    C.poly(g, [[cx + dx * k - w, y], [cx + dx * k + (i % 2 ? 3 : -3), y - h], [cx + dx * k + w, y]], { fill: Math.abs(dx) < 40 ? R.white : Math.abs(dx) < 90 ? K.yellow : K.orange, lw: 0 });
                }
                // bombs: blobs of lava thrown out on arcs, each with its tail
                for (let i = 0; i < 8; i++) {
                    const u = ((t2 * 0.9 + i * 0.37) % 1 + 1) % 1, sx = i % 2 ? 1 : -1, vx = sx * (140 + ((i * 53) % 190)), vy = 520 + ((i * 71) % 260);
                    const bx = cx + sx * 120 + vx * u, by = yb - 40 - vy * u + 640 * u * u, r = (9 + (i % 3) * 3) * k;
                    const tx = -vx, ty = vy - 1280 * u, tl = Math.hypot(tx, ty) || 1;
                    C.poly(g, [[bx + (ty / tl) * r * 0.8, by - (tx / tl) * r * 0.8], [bx + (tx / tl) * r * 3.2, by + (ty / tl) * r * 3.2], [bx - (ty / tl) * r * 0.8, by + (tx / tl) * r * 0.8]], { fill: K.orange, ink: K.ink, lw: 2.6 * L });
                    circ(g, bx, by, r, K.yellow, 2.6 * L);
                }
                // the plug's shards, blown off as it starts
                if (e < 0.34) {
                    const u = e / 0.34;
                    for (let i = 0; i < 6; i++) {
                        const sx = i % 2 ? 1 : -1, px = cx + sx * (150 + i * 16) + sx * (200 + i * 30) * u, py = CRATER - 16 - (300 + i * 40) * u + 520 * u * u, a = u * (4 + i) * sx, sz = 16 + (i % 3) * 6;
                        C.poly(g, [[-sz, -sz * 0.4], [-sz * 0.2, -sz], [sz, -sz * 0.5], [sz * 0.7, sz * 0.6], [-sz * 0.5, sz * 0.7]].map((p) => {
                            const q = rot(p, a);
                            return [px + q[0], py + q[1]];
                        }), { fill: R.shelf, ink: K.ink, lw: 3 * L });
                    }
                }
            }
        });
        // the near shore: two dark rocks in the corners
        layer(g, V, 1.25, (L) => {
            for (const sx of [-1, 1]) {
                const at = (px, py) => [500 + sx * px, py], rock = [at(640, 1040), at(640, 880), at(560, 850), at(500, 905), at(420, 890), at(360, 960), at(300, 1040)];
                C.poly(g, sx > 0 ? rock : rock.slice().reverse(), { fill: R.pit, ink: K.ink, lw: 3.6 * L });
                C.poly(g, [at(600, 900), at(560, 872), at(520, 912), at(560, 940)], { fill: R.floor, lw: 0 });
                C.poly(g, [at(440, 930), at(410, 910), at(380, 962), at(420, 980)], { fill: R.floor, lw: 0 });
            }
        });
        g.restore();
    }
    /**
     * What goes over the car as it rides the column: the head's near bulges round its wheels and
     * the drops they throw. Nothing is drawn while erupt is 0.
     */
    function volcanoFront(g, t, o = {}) {
        const V = camV(o.view, o.pan), e = clamp(o.erupt ?? 0), d = C.drawing(t), sh = vShake(t, clamp(o.rumble ?? 0), e);
        if (e <= 0) return;
        const top = CRATER - vRise(e), k = smooth(e / 0.08), f = d % 2;
        g.save();
        g.lineJoin = 'round';
        layer(g, V, 1, (L) => {
            g.translate(sh[0], sh[1]);
            // the same three streams as the head behind, so only the lips' upper edges show
            for (const [w, h, col, ink] of [[300, 30, K.red, true], [200, 22, K.orange, false], [96, 14, K.yellow, false]]) {
                const hw = (w / 2 + 64 * (w / 300)) * k * 0.9, pts = [], yc = Math.min(CRATER - 14, top + 70), y0 = yc - 30 * k;
                for (let i = 0; i <= 36; i++) {
                    const u = i / 36;
                    pts.push([VX - hw + 2 * hw * u, y0 - h * k * (0.55 + 0.45 * Math.cos(u * PI * 10 + (f ? PI : 0))) * Math.sin(u * PI) ** 0.4]);
                }
                C.poly(g, [...pts, [VX + hw, yc + 2], [VX - hw, yc + 2]], { fill: col, lw: 0 });
                if (ink) line(g, pts, 3.6 * L);
            }
            for (let i = 0; i < 6; i++) {
                const sx = i % 2 ? 1 : -1, u = ((d + i * 2) % 6) / 6, px = VX + sx * (150 + i * 22 + 60 * u), py = top + 6 - 80 * u + 90 * u * u;
                circ(g, px, py, (7 - i * 0.6) * k, i % 3 ? K.yellow : K.orange, 2.6 * L);
            }
        });
        g.restore();
    }
    function volcanoTop(o = {}) {
        const V = camV(o.view, o.pan), e = clamp(o.erupt ?? 0), sh = vShake(o.t ?? 0, clamp(o.rumble ?? 0), e), p = scr(V, 500 + sh[0], CRATER - vRise(e) + sh[1]);
        return { x: p[0], y: p[1], s: 54 * V.k };
    }

    // --- exports -----------------------------------------------------------------------------
    return { R, VIEW, PAN, cam, toScreen, stage, STAGE: { wide: stage('wide'), stage: stage('stage') }, venue, beams, crowd, fan, surfPoint, lighter, foamTrident, devilGuitar, guitarPoints, guitar: axe, guitarFromFire, fromFirePoints, tornContract, tornPoints, box, BOX, boxLamp, volcano, volcanoFront, volcanoTop, VOLCANO: { wide: volcanoTop({ view: 'wide' }), stage: volcanoTop({ view: 'stage' }) } };
})();
