// The weather of verse 2: the Devil's Plan B. The rain machine he tows behind the hearse (the
// thing on the blueprint of segments/planb.js: a box with two dials, a funnel on top and a
// crank on its side), the storm cloud it makes and the front that crosses the frame, what the
// band answers with (a canvas top, wipers, an umbrella), the calendar pages of three days of
// rain, and Hell freezing over as a side effect: frost, icicles, snow, a block of ice.
//
// Units: figure units as in rides.js and cast.js (a standing person is 1.9 tall; the cars are
// drawn at Rig.CAR = 84 units per figure unit on the road); y grows downwards; oblique
// projection with the same D as the cast. Ice has its own line: a dark blue instead of the
// ink, the cel way, so it reads as ice on anything.
// Global: Weather. Depends on Cereal, and on Rides for the machine's wheels.
const Weather = (() => {
    const C = Cereal, K = C.COL, TAU = Math.PI * 2;
    const D = [0.3, -0.2]; // the same as Cast.D: screen offset per unit of depth
    const Dd = (z) => [D[0] * z, D[1] * z];
    const ob = (x, y, z = 0) => [x + D[0] * z, y + D[1] * z];
    const lerp = (a, b, u) => a + (b - a) * u;
    const lerpPt = (p, q, u) => [lerp(p[0], q[0], u), lerp(p[1], q[1], u)];
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const smooth = (u) => {
        const v = clamp(u);
        return v * v * (3 - 2 * v);
    };
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
        return a > 0 ? pts : pts.slice().reverse();
    };
    const shift = (pts, d) => pts.map(([x, y]) => [x + d[0], y + d[1]]);
    const circ = (g, x, y, r, fill, lw, ink = K.ink) => {
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
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
    const line = (g, pts, lw, ink = K.ink) => C.poly(g, pts, { ink, lw, close: false });
    // A tube: a thick line in a colour with the outline round it.
    const tube = (g, pts, w, col, L, close = false, ink = K.ink) => {
        C.poly(g, pts, { ink, lw: w + 2 * L, close });
        C.poly(g, pts, { ink: col, lw: w, close });
    };
    // A rectangle on a face that looks to the right (the plane x = const).
    const faceX = (x, y0, y1, z0, z1) => [ob(x, y0, z0), ob(x, y0, z1), ob(x, y1, z1), ob(x, y1, z0)];
    // A circle lying flat (a funnel's mouth, an umbrella's rim) round the screen point c.
    const ringY = (c, r, n = 32, a0 = 0, a1 = TAU) => Array.from({ length: n + (a1 - a0 < TAU - 1e-6 ? 1 : 0) }, (_, i) => {
        const a = a0 + ((a1 - a0) * i) / n;
        return [c[0] + Math.cos(a) * r + D[0] * Math.sin(a) * r, c[1] + D[1] * Math.sin(a) * r];
    });
    // A circle on a face that looks to the right.
    const ringX = (c, r, n = 24) => Array.from({ length: n }, (_, i) => {
        const a = (i / n) * TAU;
        return [c[0] + Math.cos(a) * r * D[0], c[1] + Math.cos(a) * r * D[1] + Math.sin(a) * r];
    });
    const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    const mix = (a, b, k) => {
        const A = hex(a), B = hex(b);
        return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
    };
    // Scalloped puffs (smoke, steam, breath), as in rides.js: the outlines of a whole group
    // first and the fills on top, so touching puffs merge. list: [[x, y, r, bumps, a0], …]
    function puffs(g, list, fill, L, ink = K.ink) {
        const parts = [];
        for (const [x, y, r, n, a0] of list) {
            if (r <= 0.02) continue;
            parts.push([x, y, r * 0.74]);
            for (let i = 0; i < n; i++) {
                const a = a0 + (i / n) * TAU;
                parts.push([x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.4]);
            }
        }
        g.strokeStyle = ink;
        g.lineWidth = L * 2;
        for (const [x, y, r] of parts) {
            g.beginPath();
            g.arc(x, y, r, 0, TAU);
            g.stroke();
        }
        g.fillStyle = fill;
        for (const [x, y, r] of parts) {
            g.beginPath();
            g.arc(x, y, r, 0, TAU);
            g.fill();
        }
    }

    // =========================================================================================
    // Ice, frost and snow: the shared vocabulary
    // =========================================================================================
    const ICE = {
        fill: '#bfe6ff', light: '#e4f5ff', white: '#ffffff', dark: '#8dc6f2', deep: '#5d9fe0', line: '#2c56ad',
        snow: '#f6fcff', snowSide: '#cfe6f8', puddle: '#a9d8fb',
    };
    // One icicle hanging from (x, y), the middle of its root.
    function icicle(g, L, x, y, len, w, bend = 0) {
        if (len < w * 0.6) return;
        const pts = [[x - w / 2, y], [x + w / 2, y], [x + w * 0.2 + bend * 0.5, y + len * 0.55], [x + bend, y + len], [x - w * 0.22 + bend * 0.4, y + len * 0.5]];
        C.poly(g, pts, { fill: ICE.fill, ink: ICE.line, lw: L * 0.8 });
        line(g, [[x - w * 0.14, y + len * 0.12], [x - w * 0.06 + bend * 0.35, y + len * 0.46]], L * 0.7, ICE.white);
    }
    // A row of them along the edge a → b. len: the longest; k: how far they have grown (0..1).
    function icicles(g, L, a, b, n, len, seed, k = 1, wmin = 0) {
        if (k <= 0.03) return;
        const r = Motion.rng('weather-ice:' + seed);
        for (let i = 0; i < n; i++) {
            const u = (i + 0.2 + 0.6 * r()) / n, l = len * (0.4 + 0.6 * r()) * k, bend = (r() - 0.5) * l * 0.12;
            icicle(g, L, lerp(a[0], b[0], u), lerp(a[1], b[1], u), l, Math.max(wmin, l * 0.3), bend);
        }
    }
    // Snow lying on the edge a → b: bumps up to h high, and a lip that hangs `drip` below it.
    function snowCap(g, L, a, b, h, seed, drip = 0) {
        if (h <= 0) return;
        const r = Motion.rng('weather-snow:' + seed), len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const n = Math.max(2, Math.round(len / (h * 2.6))), top = [], low = [];
        for (let i = 0; i <= n; i++) {
            const u = i / n, e = i === 0 || i === n;
            top.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u) - h * (e ? 0.1 : 0.65 + 0.45 * r())]);
        }
        const m = Math.max(2, Math.round(len / (Math.max(drip, h * 0.5) * 2.2)));
        for (let i = m; i >= 0; i--) {
            const u = i / m, e = i === 0 || i === m;
            low.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u) + (e ? 0 : drip * (i % 2 ? 1 : 0.35) * (0.6 + 0.4 * r()))]);
        }
        const pts = [...C.curve(top, false, 5), ...(drip > 0 ? C.curve(low, false, 4) : low)];
        C.poly(g, pts, { fill: ICE.snow, ink: ICE.line, lw: L * 0.85 });
    }
    // Frost that creeps down from the edge y0 over x0..x1: a pale sheet with a crystal edge.
    function frostDown(g, L, x0, x1, y0, depth, seed, alpha = 1) {
        if (depth <= 0) return;
        const r = Motion.rng('weather-frost:' + seed), n = Math.max(4, Math.round((x1 - x0) / (0.06 * (x1 - x0) + depth * 0.12)) | 1), pts = [[x0, y0], [x1, y0]];
        for (let i = n; i >= 0; i--) {
            const u = i / n, x = lerp(x0, x1, u);
            pts.push([x, y0 + depth * (i % 2 ? 0.45 + 0.3 * r() : 0.8 + 0.2 * r())]);
        }
        g.save();
        g.globalAlpha = alpha;
        C.poly(g, pts, { fill: ICE.light, lw: 0 });
        g.restore();
        C.poly(g, pts.slice(2), { ink: ICE.line, lw: L * 0.6, close: false });
    }
    // A crack: a seeded star of broken rays from (x, y) that reach `reach` at k = 1.
    function cracks(g, L, x, y, reach, k, seed, n = 5) {
        if (k <= 0) return;
        const r = Motion.rng('weather-crack:' + seed);
        for (let i = 0; i < n; i++) {
            const a0 = (i / n) * TAU + r() * 0.8, steps = 4, pts = [[x, y]];
            let a = a0, px = x, py = y;
            const total = (typeof reach === 'function' ? reach(a0) : reach) * (0.7 + 0.3 * r());
            for (let j = 1; j <= steps; j++) {
                a += (r() - 0.5) * 0.9;
                const seg = (total / steps) * clamp(k * steps - (j - 1));
                if (seg <= 0) break;
                px += Math.cos(a) * seg;
                py += Math.sin(a) * seg;
                pts.push([px, py]);
                if (j === 2 && k > 0.5) line(g, [[px, py], [px + Math.cos(a + 1.1) * total * 0.18 * k, py + Math.sin(a + 1.1) * total * 0.18 * k]], L * 0.8, ICE.line);
            }
            if (pts.length > 1) {
                line(g, pts.map(([qx, qy]) => [qx + L * 0.9, qy + L * 0.6]), L * 0.8, ICE.white);
                line(g, pts, L * 1.1, ICE.line);
            }
        }
    }

    // =========================================================================================
    // The rain machine
    // =========================================================================================
    const MP = {
        ink: K.ink, body: '#b8263c', top: '#dc4a5c', side: '#7c1629',
        iron: '#4a4470', ironTop: '#625c8c', ironSide: '#353055',
        brass: '#ffc21f', brassTop: '#ffe27a', brassSide: '#d98f0f', inside: '#3a1030',
        chrome: '#d5dbea', chromeTop: '#f4f6fc', chromeSide: '#8d95ad',
        dial: '#fff1c4', dialRed: '#f0352f', glow: '#ff8a2b', glowHot: '#ffe62e', dark: '#2a2438',
        glass: '#aaf3ec', water: '#4a7fe0', grip: '#fff1c4', gripSide: '#dcc284',
        lamp: '#ffe62e', lampLow: '#ffc21f', fire: '#ff8a2b', smoke: '#f1edf8', steam: '#fffdf4',
        tyre: '#2a2438', tyreSide: '#1f1a2b', rim: '#ffc21f', rimSide: '#d98f0f',
        shadow: 'rgba(36,21,49,0.28)',
    };
    const MW = 1.2; // the trailer's width (depth)
    const M = {
        axle: -0.3, R: 0.28,
        bed: { x0: -1.3, x1: 1.05, y0: -0.58, y1: -0.46, z: -0.06 },
        box: { x0: -1.15, x1: 0.35, yT: -1.78, yB: -0.58 },
        gear: { x0: 0.35, x1: 0.75, yT: -1.24, yB: -0.58, z: -0.04, d: 0.5 },
        hub: ob(0.55, -0.97, -0.07), crank: 0.26, grip: Dd(-0.2),
        eye: [1.52, -0.93, 0.6],
        horn: { x: -0.36, z: 0.6, h: 1.02, r0: 0.24, r1: 0.74 },
        step: { x0: 0.5, x1: 1.5, y: -0.48, z0: -0.44, z1: -0.04 },
    };
    // The sprung body's own move: it sinks on its springs, pitches about the axle and rattles.
    const bodyMove = (o) => {
        const sh = clamp(o.shake ?? 0), d = C.drawing(o.t ?? 0);
        return {
            pitch: o.pitch ?? 0,
            dx: sh ? (d % 2 ? 1 : -1) * 0.014 * sh : 0,
            dy: (o.bounce ?? 0) * 0.06 + (sh ? [-1, 0.6, 0.1][((d % 3) + 3) % 3] * 0.014 * sh : 0),
        };
    };
    const bodyAt = (p, mv) => {
        const c = [M.axle, -M.R], q = rot([p[0] - c[0], p[1] - c[1]], mv.pitch);
        return [q[0] + c[0] + mv.dx, q[1] + c[1] + mv.dy];
    };
    /**
     * The points a staging needs, in the machine's units from its origin (multiply by s and add
     * x, y). Pass the same o as to machine() when it bounces, pitches or shakes.
     *   tow            the tow bar's eye
     *   hub            the crank's axis;  crankR  the crank's radius
     *   handle(crank)  where a mitt holds the crank (the grip's end) at that angle
     *   mouth          the middle of the funnel's mouth (a cloud leaves from here)
     *   step           where an imp stands to crank (the middle of the running board)
     *   top            the highest point (the funnel's rim)
     */
    function machinePoints(o = {}) {
        const mv = bodyMove(o), at = (p) => bodyAt(p, mv), H = M.horn;
        return {
            tow: at(ob(...M.eye)), hub: at(M.hub), crankR: M.crank,
            handle: (crank = o.crank ?? 0) => at([M.hub[0] + Math.cos(crank) * M.crank + M.grip[0], M.hub[1] + Math.sin(crank) * M.crank + M.grip[1]]),
            mouth: at(ob(H.x, M.box.yT - 0.1 - H.h, H.z)),
            step: at(ob((M.step.x0 + M.step.x1) / 2, M.step.y, (M.step.z0 + M.step.z1) / 2)),
            top: at(ob(H.x, M.box.yT - 0.1 - H.h, H.z + H.r1)),
        };
    }
    /**
     * An imp that turns the crank: where to stand it and how to pose it so that its left mitt
     * (the one on screen left) rests on the handle. k: the imp's scale over the machine's
     * (0.67 for the office's imps next to a figure). Returns { x, y, armUp, hop, squash } with
     * x, y in the machine's units:
     *     const c = Weather.crankImp(crank, 0.67, o);
     *     Devil.imp(g, mx + c.x * s, my + c.y * s, 0.67 * s, { armUp: c.armUp, hop: c.hop, squash: c.squash, look: -1 });
     */
    function crankImp(crank, k = 0.67, o = {}) {
        const P = machinePoints(o), h = P.handle(crank), y = P.step[1];
        const reach = (y - h[1]) / k; // how far above its feet the mitt must be, in the imp's units
        const squash = reach < 0.4 ? clamp(1 - reach / 0.4, 0, 0.3) : 0;
        return { x: h[0] + 0.66 * k * (1 + squash), y, armUp: clamp((reach - 0.4) / 0.5), hop: Math.max(0, reach - 0.9), squash };
    }
    // Where the hearse's hitch is (the middle of its frame's tail), in the hearse's units, and
    // where to draw the machine so that its eye sits on it. Draw the machine BEFORE the hearse:
    // the bar's tip goes behind the coffin's tail. ho: the hearse's { lean, bounce }.
    // Returns { x, y, pitch } for machine(g, x, y, s, { pitch, towed: true, … }).
    const HITCH = [-3.5, -0.93, 0.75];
    function towedAt(hx, hy, s, ho = {}) {
        const c = [-2.5, -0.58], lean = ho.lean ?? 0; // the hearse's rear axle, as in rides.js
        const q = rot([HITCH[0] - c[0], HITCH[1] + (ho.bounce ?? 0) * 0.1 - c[1]], -lean);
        const hitch = [q[0] + c[0] + D[0] * HITCH[2], q[1] + c[1] + D[1] * HITCH[2]];
        // the trailer runs in the middle of the hearse's track, its wheels on the same road
        const z0 = (1.5 - MW) / 2, gy = D[1] * z0;
        const e = [M.eye[0] - M.axle, M.eye[1] + M.R], el = Math.hypot(e[0], e[1]), a0 = Math.atan2(e[1], e[0]);
        const sin = clamp((hitch[1] - gy - D[1] * M.eye[2] + M.R) / el, -1, 1), pitch = Math.asin(sin) - a0;
        const ex = M.axle + el * Math.cos(a0 + pitch) + D[0] * M.eye[2];
        return { x: hx + (hitch[0] - ex) * s, y: hy + gy * s, pitch };
    }

    // A dial: a brass bezel, a cream face with ticks and a red zone, a needle.
    function dial(g, L, P, cx, cy, r, k, ice, seed) {
        const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, pol = (rr, a) => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
        circ(g, cx, cy, r, P.brass, L, P.ink);
        g.beginPath();
        g.arc(cx, cy, r * 0.9, Math.PI * 1.1, Math.PI * 1.6);
        g.strokeStyle = P.brassTop;
        g.lineWidth = L * 0.9;
        g.stroke();
        circ(g, cx, cy, r * 0.78, P.dial, L * 0.8, P.ink);
        g.lineCap = 'butt';
        g.beginPath();
        g.arc(cx, cy, r * 0.6, lerp(a0, a1, 0.7), a1);
        g.strokeStyle = P.dialRed;
        g.lineWidth = r * 0.2;
        g.stroke();
        g.lineCap = 'round';
        for (let i = 0; i <= 6; i++) {
            const a = lerp(a0, a1, i / 6);
            line(g, [pol(r * 0.5, a), pol(r * 0.7, a)], L * 0.6, P.ink);
        }
        const a = lerp(a0, a1, clamp(k)), n = [Math.cos(a + Math.PI / 2) * r * 0.07, Math.sin(a + Math.PI / 2) * r * 0.07];
        C.poly(g, [[cx + n[0], cy + n[1]], pol(r * 0.66, a), [cx - n[0], cy - n[1]], pol(r * 0.16, a + Math.PI)], { fill: P.ink, ink: P.ink, lw: L * 0.5 });
        circ(g, cx, cy, r * 0.13, P.brass, L * 0.6, P.ink);
        if (ice > 0) {
            g.save();
            g.globalAlpha = 0.6 * ice;
            circ(g, cx, cy, r * 0.78, ICE.fill, 0);
            g.restore();
            g.save();
            g.beginPath();
            g.arc(cx, cy, r * 0.78, 0, TAU);
            g.clip();
            cracks(g, L, cx - r * 0.18, cy + r * 0.1, r * 0.95, clamp((ice - 0.35) / 0.5), 'dial' + seed, 5);
            g.restore();
            // snow on the bezel's top
            const h = r * 0.34 * ice, arc = [];
            for (let i = 0; i <= 8; i++) arc.push(pol(r, Math.PI * (1.14 + (0.72 * i) / 8)));
            const up = arc.map(([x, y], i) => [x, y - h * (i === 0 || i === 8 ? 0 : 0.6 + 0.4 * ((i * 7 + seed * 3) % 5) / 4)]);
            C.poly(g, [...C.curve(up, false, 4), ...arc.reverse()], { fill: ICE.snow, ink: ICE.line, lw: L * 0.7 });
        } else {
            g.beginPath();
            g.arc(cx, cy, r * 0.6, Math.PI * 1.08, Math.PI * 1.36);
            g.strokeStyle = ICE.white;
            g.lineWidth = L * 0.9;
            g.stroke();
        }
    }

    // The funnel: a brass horn standing on a riveted collar, seen a little from above, so its
    // mouth shows. A puff travels up it as a bulge and flares the mouth.
    function horn(g, L, P, bc, puff, ice) {
        const { h: H, r0, r1 } = M.horn, aR = Math.atan(D[0]);
        const c = lerp(-0.12, 1, puff), A = 0.34 * Math.min(1, puff * 4);
        const rad = (u) => lerp(r0, r1, Math.pow(u, 1.2)) * (1 + A * Math.exp(-((u - c) * (u - c)) / 0.03));
        const cy = (u) => bc[1] - 0.1 - u * H;
        const at = (u, a, k = 1) => {
            const r = rad(u) * k;
            return [bc[0] + r * Math.cos(a) + D[0] * r * Math.sin(a), cy(u) + D[1] * r * Math.sin(a)];
        };
        const N = 16, us = Array.from({ length: N + 1 }, (_, i) => i / N);
        const nearArc = (u, n = 16) => Array.from({ length: n + 1 }, (_, i) => at(u, aR - (i / n) * Math.PI)); // right, near, left
        // the collar: a short iron drum with rivets
        const col = (y, r, a) => [bc[0] + r * Math.cos(a) + D[0] * r * Math.sin(a), y + D[1] * r * Math.sin(a)];
        const colArc = (y, r) => Array.from({ length: 17 }, (_, i) => col(y, r, aR - (i / 16) * Math.PI));
        C.poly(g, [...colArc(bc[1], 0.31), ...colArc(bc[1] - 0.12, 0.29).reverse()], { fill: P.iron, ink: P.ink, lw: L });
        C.poly(g, ringY([bc[0], bc[1] - 0.12], 0.29), { fill: P.ironTop, ink: P.ink, lw: L * 0.8 });
        for (const a of [-0.35, -0.95, -1.57, -2.2, -2.8]) {
            const p = col(bc[1] - 0.055, 0.3, a);
            circ(g, p[0], p[1], 0.02, P.brass, L * 0.5, P.ink);
        }
        // the cone: the front tone, a darker band down its right, a light stripe on its left
        const left = us.map((u) => at(u, aR + Math.PI)), right = us.map((u) => at(u, aR));
        const body = [...left, ...right.slice().reverse(), ...nearArc(0).slice(1, -1)];
        C.poly(g, body, { fill: P.brass, lw: 0 });
        C.poly(g, [...us.map((u) => at(u, -0.62)), ...right.slice().reverse(), ...nearArc(0).filter((_, i) => i > 0 && aR - (i / 16) * Math.PI > -0.62)], { fill: P.brassSide, lw: 0 });
        C.poly(g, [...us.map((u) => at(u, Math.PI + 0.98)), ...us.map((u) => at(u, Math.PI + 0.76)).reverse()], { fill: P.brassTop, lw: 0 });
        for (const u of [0.34, 0.67]) line(g, nearArc(u), L * 0.7, P.brassSide);
        if (ice > 0) {
            // frost creeps down from the rim
            const r = Motion.rng('weather-frost:horn'), n = 14, top = [], low = [];
            for (let i = 0; i <= n; i++) {
                const a = aR - (i / n) * Math.PI;
                top.push(at(1, a));
                low.push(at(1 - ice * (i % 2 ? 0.22 + 0.2 * r() : 0.42 + 0.22 * r()), a));
            }
            C.poly(g, [...top, ...low.reverse()], { fill: ICE.light, lw: 0 });
            line(g, low, L * 0.6, ICE.line);
        }
        C.poly(g, body, { ink: P.ink, lw: L });
        // the mouth: a rolled rim, the far wall inside, the dark of the throat
        const mc = [bc[0], cy(1)], mr = rad(1);
        C.poly(g, ringY(mc, mr, 40), { fill: P.brassTop, ink: P.ink, lw: L });
        const inner = ringY(mc, mr * 0.88, 40);
        C.poly(g, inner, { fill: P.brassSide, lw: 0 });
        g.save();
        C.trace(g, inner);
        g.clip();
        C.poly(g, ringY([mc[0], mc[1] + mr * 0.075], mr * 0.9, 40), { fill: P.inside, lw: 0 });
        g.restore();
        C.poly(g, inner, { ink: P.ink, lw: L * 0.8 });
        if (ice > 0) {
            const r = Motion.rng('weather-ice:horn');
            for (const f of [0.1, 0.27, 0.45, 0.62, 0.8, 0.93]) {
                const p = at(1, aR - f * Math.PI), l = 0.34 * ice * (0.5 + 0.5 * r());
                icicle(g, L, p[0], p[1] + 0.01, l, Math.max(0.035, l * 0.3), 0);
            }
        }
        return { mc, mr };
    }

    // The crank alone: a boss on the hub, a flat arm, a grip that sticks out towards us.
    function crankArm_(g, L, P, hub, a, ice = 0) {
        const e = [hub[0] + Math.cos(a) * M.crank, hub[1] + Math.sin(a) * M.crank];
        const n = [-Math.sin(a) * 0.042, Math.cos(a) * 0.042], u = [Math.cos(a), Math.sin(a)];
        const bar = cw([[hub[0] - u[0] * 0.06 + n[0], hub[1] - u[1] * 0.06 + n[1]], [e[0] + u[0] * 0.06 + n[0], e[1] + u[1] * 0.06 + n[1]], [e[0] + u[0] * 0.06 - n[0], e[1] + u[1] * 0.06 - n[1]], [hub[0] - u[0] * 0.06 - n[0], hub[1] - u[1] * 0.06 - n[1]]]);
        C.prism(g, bar, Dd(0.04), { front: P.chrome, top: P.chromeTop, side: P.chromeSide }, { lw: L, ink: P.ink });
        line(g, [[hub[0] + u[0] * 0.07 - n[0] * 0.35, hub[1] + u[1] * 0.07 - n[1] * 0.35], [e[0] - u[0] * 0.07 - n[0] * 0.35, e[1] - u[1] * 0.07 - n[1] * 0.35]], L * 0.6, P.chromeTop);
        circ(g, hub[0], hub[1], 0.07, P.brass, L * 0.9, P.ink);
        circ(g, hub[0], hub[1], 0.028, P.brassSide, L * 0.6, P.ink);
        const gp = [e[0] + M.grip[0], e[1] + M.grip[1]];
        C.drum(g, gp[0], gp[1], 0.062, [-M.grip[0], -M.grip[1]], { front: P.grip, side: P.gripSide }, { lw: L, ink: P.ink });
        circ(g, gp[0], gp[1], 0.026, P.gripSide, L * 0.5, P.ink);
        if (ice > 0.25) icicle(g, L, gp[0], gp[1] + 0.06, 0.2 * ice, 0.05, 0);
    }
    /**
     * The crank on its own, snapped off its shaft, seen from its side: the grip, the arm at a
     * right angle to it, the boss with the stub of the shaft. For the Devil frozen with the
     * handle still in his mitt.
     *   x, y   the middle of the grip, where the mitt holds it (the grip is 0.36 long: it shows
     *          on both sides of a mitt);  s  logical units per figure unit
     *   a      the way the grip points, towards the arm's end (radians; 0 = right, -π/2 = up)
     *   flip   -1 turns the arm to the other side of the grip
     * Draw it BEFORE the figure whose mitt holds it.
     */
    function crankArm(g, x, y, s, a = -1.4, flip = 1) {
        const P = MP, L = 3.2 / s, u = [Math.cos(a), Math.sin(a)], n = [-u[1] * flip, u[0] * flip];
        const at = (p, q) => [u[0] * p + n[0] * q, u[1] * p + n[1] * q];
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'butt';
        // the stub of the shaft, snapped
        C.poly(g, [at(0.2, 0.3), at(0.2, 0.42), at(0.235, 0.455), at(0.25, 0.42), at(0.275, 0.46), at(0.29, 0.42), at(0.29, 0.3)], { fill: P.chromeSide, ink: P.ink, lw: L * 0.8 });
        // the arm, the boss
        C.prism(g, cw([at(0.2, -0.06), at(0.29, -0.06), at(0.29, 0.34), at(0.2, 0.34)]), Dd(0.04), { front: P.chrome, top: P.chromeTop, side: P.chromeSide }, { lw: L, ink: P.ink });
        line(g, [at(0.225, 0.0), at(0.225, 0.22)], L * 0.6, P.chromeTop);
        const b = at(0.245, 0.3);
        circ(g, b[0], b[1], 0.07, P.brass, L * 0.9, P.ink);
        circ(g, b[0], b[1], 0.028, P.brassSide, L * 0.6, P.ink);
        // the grip: a turned handle on its pin
        C.poly(g, [at(-0.18, 0), at(0.2, 0)], { ink: P.ink, lw: 0.115 + 2 * L, close: false });
        C.poly(g, [at(-0.18, 0), at(0.2, 0)], { ink: P.grip, lw: 0.115, close: false });
        C.poly(g, [at(-0.17, 0.035 * flip), at(0.19, 0.035 * flip)], { ink: P.gripSide, lw: 0.035, close: false });
        for (const p of [-0.1, 0.12]) line(g, [at(p, -0.057), at(p, 0.057)], L * 0.6, P.gripSide);
        C.poly(g, [at(0.2, 0), at(0.22, 0)], { ink: P.brass, lw: 0.13, close: false });
        g.restore();
    }

    function lantern(g, L, P, pv, swing, ice) {
        const lp = (pts) => cw(pts.map((p) => {
            const q = rot(p, swing);
            return [pv[0] + q[0], pv[1] + q[1]];
        }));
        const iron = { front: P.iron, top: P.ironTop, side: P.ironSide }, th = Dd(0.14);
        tube(g, lp([[0, 0], [0, 0.1]]), 0.025, P.iron, L * 0.6);
        C.prism(g, lp([[-0.11, 0.42], [0.11, 0.42], [0.13, 0.48], [-0.13, 0.48]]), th, iron, { lw: L * 0.85, ink: P.ink });
        C.prism(g, lp([[-0.09, 0.19], [0.09, 0.19], [0.09, 0.42], [-0.09, 0.42]]), th, { front: ice > 0.6 ? ICE.fill : P.lamp, top: P.lamp, side: ice > 0.6 ? ICE.dark : P.lampLow }, { lw: L * 0.85, ink: P.ink });
        if (ice <= 0.6) C.poly(g, lp(C.curve([[0, 0.24], [0.04, 0.32], [0.035, 0.38], [0, 0.4], [-0.035, 0.38], [-0.03, 0.31]], true, 4)), { fill: P.fire, ink: P.ink, lw: L * 0.5 });
        C.prism(g, lp([[-0.04, 0.09], [0.04, 0.09], [0.13, 0.19], [-0.13, 0.19]]), th, iron, { lw: L * 0.85, ink: P.ink });
        if (ice > 0) {
            const b = lp([[-0.13, 0.48], [0.13, 0.48]]);
            icicles(g, L, b[0], b[1], 3, 0.26, 'lantern', ice, 0.035);
        }
    }

    /**
     * The rain machine: a riveted boiler on a two-wheeled trailer, 3.3 long (lantern to tow
     * eye) and 3.2 tall with its funnel. It travels to the right: the tow bar is its front.
     *   x, y   the ground under the middle of its near side;  s  logical units per figure unit
     *   o: { crank (radians, 0 = the arm points right, growing clockwise on screen),
     *        needles (0..1, both dials; the second lags a little),
     *        puff (0..1: a bulge climbs the funnel and its mouth flares; 1 = the cloud is out, then back to 0),
     *        spin (the wheels' angle), bounce (-0.5..1, the body sinks on its springs),
     *        pitch (radians, the body tips about the axle: nose down is positive; see towedAt),
     *        iced (0..1: frost creeps over it, icicles grow, the dials crack, the fire goes out),
     *        shake (0..1: it rattles on twos, the valve blows, rattle marks),
     *        towed (true folds the stand under the tow bar; false, the default, stands it on the ground),
     *        smoke (0..1 puffs from the chimney, default 0.6; iced puts them out),
     *        shadow (false leaves the ground shadow out), t (seconds, for everything on twos) }
     */
    function machine(g, x, y, s, o = {}) {
        const P = MP, L = 3.2 / s, t = o.t ?? 0, d = C.drawing(t), ice = clamp(o.iced ?? 0), sh = clamp(o.shake ?? 0);
        const puff = clamp(o.puff ?? 0), crank = o.crank ?? 0, spin = o.spin ?? 0, mv = bodyMove(o);
        const nd = clamp((o.needles ?? 0) + (sh ? (d % 2 ? 0.035 : -0.035) * sh : 0));
        const iron = { front: P.iron, top: P.ironTop, side: P.ironSide }, B = M.box, G = M.gear, zf = MW + 0.02;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        if (o.shadow !== false) {
            g.fillStyle = P.shadow;
            g.beginPath();
            g.ellipse(0.15, -0.09, 1.85, 0.17, 0, 0, TAU);
            g.fill();
        }
        Rides.wheel(g, L, M.axle + D[0] * zf, -M.R + D[1] * zf, M.R, spin, P, { far: true, depth: 0.24 });
        const body = (fn) => {
            g.save();
            g.translate(M.axle + mv.dx, -M.R + mv.dy);
            g.rotate(mv.pitch);
            g.translate(-M.axle, M.R);
            fn();
            g.restore();
        };
        body(() => {
            // --- the trailer: its bed, the tow bar with its eye, the stand -----------------------
            const bd = M.bed, bo = Dd(bd.z);
            C.box(g, bd.x0 + bo[0], bd.y0 + bo[1], bd.x1 - bd.x0, bd.y1 - bd.y0, D, iron, { lw: L, ink: P.ink, depth: MW + 0.12 });
            for (let i = 0; i < 9; i++) circ(g, bd.x0 + bo[0] + 0.12 + i * 0.27, (bd.y0 + bd.y1) / 2 + bo[1], 0.022, P.chromeSide, L * 0.5, P.ink);
            C.poly(g, [[bd.x0 + bo[0] + 0.03, bd.y0 + bo[1] + 0.025], [bd.x0 + bo[0] + 0.19, bd.y0 + bo[1] + 0.025], [bd.x0 + bo[0] + 0.19, bd.y1 + bo[1] - 0.025], [bd.x0 + bo[0] + 0.03, bd.y1 + bo[1] - 0.025]], { fill: K.red, ink: P.ink, lw: L * 0.6 });
            const eye = ob(...M.eye), neck = ob(M.eye[0] - 0.12, M.eye[1] + 0.03, M.eye[2]);
            tube(g, [ob(bd.x1, -0.52, 1.06), neck], 0.07, P.ironSide, L * 0.9);
            if (!o.towed) {
                // the stand: a leg on a foot, with a little winder
                const top = ob(1.3, -0.82, 0.6), foot = ob(1.3, 0, 0.6);
                C.poly(g, ringY(foot, 0.12, 20), { fill: P.ironTop, ink: P.ink, lw: L * 0.8 });
                tube(g, [[top[0], top[1] - 0.12], [foot[0], foot[1] - 0.02]], 0.06, P.iron, L * 0.9);
                tube(g, [[top[0], top[1] - 0.12], [top[0] + 0.1, top[1] - 0.12]], 0.03, P.chrome, L * 0.7);
                circ(g, top[0] + 0.11, top[1] - 0.12, 0.03, P.brass, L * 0.6, P.ink);
            } else {
                tube(g, [ob(1.2, -0.62, 0.6), ob(1.42, -0.8, 0.6)], 0.05, P.iron, L * 0.8);
            }
            tube(g, [ob(bd.x1, -0.52, 0.12), neck], 0.07, P.iron, L * 0.9);
            tube(g, [ob(1.21, -0.667, 0.3), ob(1.21, -0.667, 0.9)], 0.045, P.iron, L * 0.8);
            tube(g, [neck, [eye[0] - 0.07, eye[1]]], 0.075, P.iron, L * 0.9);
            tube(g, ringY(eye, 0.085, 22), 0.045, P.brass, L * 0.8, true);
            if (ice > 0) icicles(g, L, ob(bd.x1 + 0.1, -0.6, 0.12), [neck[0] - 0.06, neck[1] + 0.04], 3, 0.22, 'tow', ice, 0.03);

            // --- the boiler ----------------------------------------------------------------------
            C.box(g, B.x0, B.yT, B.x1 - B.x0, B.yB - B.yT, D, { front: P.body, top: P.top, side: P.side }, { lw: L, ink: P.ink, depth: MW });
            // its right side: iron bands and their rivets
            for (const [y0, y1] of [[B.yT, B.yT + 0.09], [B.yB - 0.09, B.yB]]) C.poly(g, faceX(B.x1, y0, y1, 0, MW), { fill: P.ironSide, ink: P.ink, lw: L * 0.8 });
            for (let i = 0; i < 5; i++) {
                const p = ob(B.x1, B.yT + 0.045, 0.14 + i * 0.23);
                circ(g, p[0], p[1], 0.018, P.brassSide, L * 0.45, P.ink);
            }
            // its top: bands at both ends
            for (const x0 of [B.x0, B.x1 - 0.09]) C.poly(g, [ob(x0, B.yT, 0), ob(x0 + 0.09, B.yT, 0), ob(x0 + 0.09, B.yT, MW), ob(x0, B.yT, MW)], { fill: P.ironTop, ink: P.ink, lw: L * 0.8 });

            // --- the chimney: a crooked stovepipe with a hat, at the far left corner -----------------
            const ch = ob(B.x0 + 0.13, B.yT, 0.98), sway = sh ? (d % 2 ? 0.02 : -0.02) * sh : 0;
            const pipe = [[ch[0], ch[1] + 0.02], [ch[0], ch[1] - 0.2], [ch[0] - 0.16 + sway, ch[1] - 0.37], [ch[0] - 0.2 + sway, ch[1] - 0.44]];
            const ct = pipe[3];
            if ((o.smoke ?? 0.6) * (1 - ice * 1.6) > 0.05) {
                const k = (o.smoke ?? 0.6) * (1 - ice * 1.6), list = [];
                for (let i = 0; i < 3; i++) {
                    const u = (i + (((d % 3) + 3) % 3) / 3) / 3;
                    list.push([ct[0] - 0.08 - u * 0.5, ct[1] - 0.14 - u * 0.6, (0.06 + 0.15 * u) * (0.5 + 0.5 * k) * (u > 0.75 ? (1 - u) / 0.25 * 0.6 + 0.4 : 1), 6, i * 1.3 + d * 0.7]);
                }
                puffs(g, list, P.smoke, L * 0.9, P.ink);
            }
            tube(g, pipe, 0.13, P.dark, L);
            line(g, [[ch[0] - 0.03, ch[1] - 0.02], [ch[0] - 0.03, ch[1] - 0.18]], L * 0.7, P.iron);
            tube(g, [[ch[0] - 0.075, ch[1] - 0.2], [ch[0] + 0.075, ch[1] - 0.2]], 0.03, P.brass, L * 0.6);
            tube(g, [[ch[0] - 0.08, ch[1] + 0.0], [ch[0] + 0.08, ch[1] + 0.0]], 0.035, P.iron, L * 0.6);
            const hat = [[-0.17, 0.0], [0, -0.12], [0.17, 0.0]].map((p) => {
                const q = rot(p, -0.5);
                return [ct[0] - 0.035 + q[0], ct[1] - 0.06 + q[1]];
            });
            C.prism(g, cw(hat), Dd(0.08), { front: P.iron, top: P.ironTop, side: P.ironSide }, { lw: L * 0.9, ink: P.ink });
            if (ice > 0) icicles(g, L, hat[0], hat[2], 2, 0.18, 'hat', ice, 0.03);

            // --- the pressure valve: a brass stub, a lever with a weight, steam when it rattles ------
            const vb = ob(B.x1 - 0.22, B.yT, 0.6), hopV = sh ? (d % 2 ? 0.05 : 0) * sh : 0;
            if (sh > 0.3 && d % 2) puffs(g, [[vb[0] + 0.2, vb[1] - 0.33, 0.1 * sh, 5, d], [vb[0] + 0.4, vb[1] - 0.47, 0.14 * sh, 6, d * 0.7]], P.steam, L * 0.85, P.ink);
            C.poly(g, ringY(vb, 0.095, 18), { fill: P.brassSide, ink: P.ink, lw: L * 0.8 });
            C.poly(g, [[vb[0] - 0.052, vb[1] - 0.15], [vb[0] + 0.052, vb[1] - 0.15], [vb[0] + 0.052, vb[1] - 0.004], [vb[0] - 0.052, vb[1] - 0.004]], { fill: P.brass, ink: P.ink, lw: L });
            line(g, [[vb[0] - 0.025, vb[1] - 0.03], [vb[0] - 0.025, vb[1] - 0.13]], L * 0.7, P.brassTop);
            C.poly(g, [[vb[0] - 0.085, vb[1] - 0.15], [vb[0] + 0.085, vb[1] - 0.15], [vb[0] + 0.06, vb[1] - 0.21 - hopV], [vb[0] - 0.06, vb[1] - 0.21 - hopV]], { fill: P.brassSide, ink: P.ink, lw: L * 0.9 });
            const lv = [[vb[0] - 0.1, vb[1] - 0.229 - hopV], [vb[0] + 0.3, vb[1] - 0.249 - hopV * 2.2]];
            tube(g, lv, 0.035, P.chrome, L * 0.8);
            circ(g, vb[0] - 0.04, vb[1] - 0.231 - hopV, 0.022, P.brass, L * 0.5, P.ink);
            circ(g, lv[1][0], lv[1][1], 0.07, P.iron, L * 0.9, P.ink);
            circ(g, lv[1][0] - 0.02, lv[1][1] - 0.02, 0.02, P.ironTop, 0);
            if (ice > 0) icicle(g, L, lv[1][0], lv[1][1] + 0.06, 0.22 * ice, 0.05, 0);

            // --- the funnel ----------------------------------------------------------------------
            horn(g, L, P, ob(M.horn.x, B.yT, M.horn.z), puff, ice);

            // --- the pipe from the gearbox into the boiler's side, then the gearbox ------------------
            const pf = ob(B.x1, -1.5, 0.22);
            C.poly(g, ringX(pf, 0.085), { fill: P.chromeSide, ink: P.ink, lw: L * 0.8 });
            tube(g, [[G.x0 + 0.24, G.yT + 0.02], [G.x0 + 0.24, -1.44], [G.x0 + 0.2, pf[1]], [pf[0] + 0.02, pf[1]]], 0.1, P.chrome, L);
            line(g, [[G.x0 + 0.215, G.yT - 0.02], [G.x0 + 0.215, -1.43]], L * 0.7, P.chromeTop);
            const go = Dd(G.z);
            C.box(g, G.x0 + go[0], G.yT + go[1], G.x1 - G.x0, G.yB - G.yT, D, iron, { lw: L, ink: P.ink, depth: G.d });
            for (const [bx, by] of [[0.045, 0.045], [0.355, 0.045], [0.045, 0.615], [0.355, 0.615]]) circ(g, G.x0 + go[0] + bx, G.yT + go[1] + by, 0.02, P.chromeSide, L * 0.5, P.ink);
            C.poly(g, [[G.x0 + go[0] + 0.12, G.yT + go[1] - 0.001], [G.x0 + go[0] + 0.36, G.yT + go[1] - 0.001], [G.x0 + go[0] + 0.39, G.yT + go[1] + 0.035], [G.x0 + go[0] + 0.09, G.yT + go[1] + 0.035]], { fill: P.chromeSide, ink: P.ink, lw: L * 0.7 });
            // the cog on its face turns with the crank
            const hubF = ob(0.55, -0.97, G.z), cog = [];
            for (let i = 0; i < 32; i++) {
                const a = crank + (i / 32) * TAU, rr = Math.floor(i / 2) % 2 ? 0.165 : 0.125;
                cog.push([hubF[0] + Math.cos(a) * rr, hubF[1] + Math.sin(a) * rr]);
            }
            C.poly(g, cog, { fill: P.brass, ink: P.ink, lw: L * 0.8 });
            circ(g, hubF[0], hubF[1], 0.085, P.brassSide, L * 0.6, P.ink);

            // --- the boiler's face: bands and rivets, the grate, the dials, the sight glass ------
            const band = new Path2D();
            band.rect(B.x0, B.yT, B.x1 - B.x0, B.yB - B.yT);
            band.rect(B.x0 + 0.09, B.yT + 0.09, B.x1 - B.x0 - 0.18, B.yB - B.yT - 0.18);
            g.fillStyle = P.iron;
            g.fill(band, 'evenodd');
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.8;
            g.strokeRect(B.x0 + 0.09, B.yT + 0.09, B.x1 - B.x0 - 0.18, B.yB - B.yT - 0.18);
            g.lineWidth = L;
            g.strokeRect(B.x0, B.yT, B.x1 - B.x0, B.yB - B.yT);
            for (let i = 0; i < 10; i++) for (const yy of [B.yT + 0.045, B.yB - 0.045]) circ(g, B.x0 + 0.075 + i * 0.15, yy, 0.02, P.brass, L * 0.45, P.ink);
            for (let i = 1; i < 7; i++) for (const xx of [B.x0 + 0.045, B.x1 - 0.045]) circ(g, xx, B.yT + 0.045 + i * 0.158, 0.02, P.brass, L * 0.45, P.ink);
            if (ice > 0) frostDown(g, L, B.x0 + 0.09, B.x1 - 0.09, B.yT + 0.09, 0.78 * ice, 'face');
            // the grate under the dials: the fire shows between its bars
            const gx0 = B.x0 + 0.2, gx1 = B.x0 + 1.02, gy0 = -0.96, gy1 = -0.8, fireOn = ice < 0.5;
            g.beginPath();
            g.roundRect(gx0, gy0, gx1 - gx0, gy1 - gy0, 0.05);
            g.fillStyle = !fireOn ? (ice > 0.8 ? ICE.dark : P.dark) : d % 4 < 2 ? P.glow : P.glowHot;
            g.fill();
            if (fireOn) {
                g.save();
                g.clip();
                g.fillStyle = d % 4 < 2 ? P.glowHot : P.glow;
                for (let i = 0; i < 5; i++) {
                    const fx = gx0 + 0.08 + i * 0.17 + ((d + i) % 2) * 0.03;
                    g.beginPath();
                    g.moveTo(fx - 0.06, gy1);
                    g.lineTo(fx, gy0 + 0.02 + ((d + i) % 3) * 0.025);
                    g.lineTo(fx + 0.06, gy1);
                    g.fill();
                }
                g.restore();
            }
            g.beginPath();
            g.roundRect(gx0, gy0, gx1 - gx0, gy1 - gy0, 0.05);
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.9;
            g.stroke();
            for (let i = 1; i < 7; i++) line(g, [[lerp(gx0, gx1, i / 7), gy0 + 0.004], [lerp(gx0, gx1, i / 7), gy1 - 0.004]], L * 1.5, P.ironSide);
            dial(g, L, P, B.x0 + 0.375, -1.3, 0.215, nd, ice, 1);
            dial(g, L, P, B.x0 + 0.825, -1.3, 0.215, nd * 0.82 + 0.02, ice, 2);
            // the sight glass and the plumbing on the right of the face: a drop on a brass plate
            const sx = B.x0 + 1.22;
            tube(g, [[sx, -1.0], [sx, -0.86], [B.x1 - 0.045, -0.86]], 0.045, P.chrome, L * 0.75);
            g.beginPath();
            g.roundRect(sx - 0.04, -1.42, 0.08, 0.42, 0.03);
            g.fillStyle = P.glass;
            g.fill();
            const lvl = ice > 0.6 ? 0.5 : lerp(0.25, 0.86, nd) + (sh ? (d % 2 ? 0.05 : -0.03) * sh : 0);
            g.save();
            g.clip();
            g.fillStyle = ice > 0.6 ? ICE.white : P.water;
            g.fillRect(sx - 0.05, -1.0 - 0.42 * lvl, 0.1, 0.42);
            g.restore();
            g.beginPath();
            g.roundRect(sx - 0.04, -1.42, 0.08, 0.42, 0.03);
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.8;
            g.stroke();
            line(g, [[sx - 0.015, -1.38], [sx - 0.015, -1.2]], L * 0.6, ICE.white);
            for (const yy of [-1.44, -0.99]) C.poly(g, [[sx - 0.06, yy - 0.025], [sx + 0.06, yy - 0.025], [sx + 0.06, yy + 0.025], [sx - 0.06, yy + 0.025]], { fill: P.brass, ink: P.ink, lw: L * 0.7 });
            const pl = [sx - 0.1, -1.66];
            g.beginPath();
            g.roundRect(pl[0], pl[1], 0.2, 0.17, 0.03);
            g.fillStyle = P.brass;
            g.fill();
            g.strokeStyle = P.ink;
            g.lineWidth = L * 0.8;
            g.stroke();
            C.poly(g, C.curve([[sx, pl[1] + 0.03], [sx + 0.042, pl[1] + 0.1], [sx, pl[1] + 0.145], [sx - 0.042, pl[1] + 0.1]], true, 5), { fill: P.water, ink: P.ink, lw: L * 0.6 });
            if (ice > 0) {
                // snow along the boiler's top edge, hanging over the face, and icicles under it
                snowCap(g, L, [B.x0 - 0.01, B.yT + 0.01], [B.x1 + 0.01, B.yT + 0.01], 0.15 * ice, 'boiler', 0.1 * ice);
                icicles(g, L, [B.x0 + 0.1, B.yT + 0.05 * ice], [B.x1 - 0.1, B.yT + 0.05 * ice], 6, 0.3, 'boiler', ice, 0.04);
                snowCap(g, L, [G.x0 + go[0], G.yT + go[1]], [G.x1 + go[0], G.yT + go[1]], 0.09 * ice, 'gear', 0.04 * ice);
            }

            // --- the running board where an imp stands to crank ---------------------------------
            const st = M.step, so = Dd(st.z0);
            for (const bx of [st.x0 + 0.1, bd.x1 - 0.08]) C.poly(g, [[bx + bo[0], bd.y1 + bo[1] - 0.02], [bx + so[0] + 0.02, st.y + so[1] + 0.05], [bx + bo[0] + 0.07, bd.y1 + bo[1] - 0.02]], { fill: P.ironSide, ink: P.ink, lw: L * 0.8 });
            C.box(g, st.x0 + so[0], st.y + so[1], st.x1 - st.x0, 0.05, D, iron, { lw: L, ink: P.ink, depth: st.z1 - st.z0 });
            for (let i = 0; i < 6; i++) {
                const p = ob(st.x0 + 0.12 + i * 0.16, st.y, st.z0 + 0.08), q = ob(st.x0 + 0.12 + i * 0.16, st.y, st.z1 - 0.08);
                line(g, [p, q], L * 0.6, P.ironSide);
            }
            if (ice > 0) icicles(g, L, [st.x0 + so[0] + 0.05, st.y + so[1] + 0.05], [st.x1 + so[0] - 0.05, st.y + so[1] + 0.05], 5, 0.26, 'step', ice, 0.035);

            // --- the lantern on its crook at the tail -----------------------------------------------
            const crook = C.curve([[B.x0, -1.5], [B.x0 - 0.23, -1.56], [B.x0 - 0.47, -1.76], [B.x0 - 0.51, -1.96], [B.x0 - 0.41, -2.05], [B.x0 - 0.32, -1.96]], false, 8);
            tube(g, crook, 0.04, P.iron, L * 0.75);
            circ(g, B.x0 + 0.0, -1.5, 0.035, P.brass, L * 0.6, P.ink);
            lantern(g, L, P, [B.x0 - 0.32, -1.95], o.swing ?? clamp(0.16 * Math.sin(C.onTwos(t) * 5.2) + (sh ? (d % 2 ? 0.1 : -0.1) * sh : 0), -0.22, 0.22), ice);

            // --- the mudguard over the near wheel -------------------------------------------------
            const fo = Dd(-0.3), fc = [M.axle + fo[0], -M.R + fo[1]], arcP = (r, a) => [fc[0] + Math.cos(a) * r, fc[1] + Math.sin(a) * r];
            const fend = [];
            for (let i = 0; i <= 14; i++) fend.push(arcP(0.43, Math.PI * (0.97 + (1.06 * i) / 14)));
            for (let i = 14; i >= 0; i--) fend.push(arcP(0.38, Math.PI * (0.97 + (1.06 * i) / 14)));
            C.prism(g, cw(fend), Dd(0.3), iron, { lw: L, ink: P.ink, sweepInk: null });
            C.prismOutline(g, cw(fend), Dd(0.3), { lw: L, ink: P.ink });
            if (ice > 0) icicles(g, L, [bd.x0 + bo[0] + 0.05, bd.y1 + bo[1]], [fc[0] - 0.46, bd.y1 + bo[1]], 4, 0.3, 'bedA', ice, 0.04);
            if (ice > 0) icicles(g, L, [fc[0] + 0.5, bd.y1 + bo[1]], [st.x0 + so[0] - 0.02, bd.y1 + bo[1]], 3, 0.3, 'bedB', ice, 0.04);
        });
        const near = Dd(-0.24);
        Rides.wheel(g, L, M.axle + near[0], -M.R + near[1], M.R, spin, P, { kind: 'red', depth: 0.24 });
        body(() => {
            crankArm_(g, L, P, M.hub, crank, ice);
            if (ice > 0) {
                const fo = Dd(-0.3), fc = [M.axle + fo[0], -M.R + fo[1]];
                const cap = [];
                for (let i = 0; i <= 8; i++) cap.push([fc[0] + Math.cos(Math.PI * (1.2 + (0.6 * i) / 8)) * 0.43, fc[1] + Math.sin(Math.PI * (1.2 + (0.6 * i) / 8)) * 0.43]);
                const up = cap.map(([px, py], i) => [px, py - 0.1 * ice * (i === 0 || i === 8 ? 0 : 0.6 + 0.4 * (i % 3) / 2)]);
                C.poly(g, [...C.curve(up, false, 4), ...cap.reverse()], { fill: ICE.snow, ink: ICE.line, lw: L * 0.8 });
            }
            if (sh > 0) {
                // rattle marks: short arcs that jump from one side to the other
                const side = d % 2 ? 1 : -1, cx = side > 0 ? M.gear.x1 + 0.3 : M.box.x0 - 0.2;
                for (const [yy, l] of [[-1.5, 0.16], [-1.15, 0.22], [-0.8, 0.14]]) {
                    line(g, C.curve([[cx, yy - l / 2], [cx + side * 0.07, yy], [cx, yy + l / 2]], false, 5), L, P.ink);
                }
            }
        });
        g.restore();
    }

    // =========================================================================================
    // The cloud, the front
    // =========================================================================================
    const RAINC = { light: '#6f7797', cloud: '#565d7c', under: '#434966', a: '#c9cde0', b: '#e4e7f2', veil: 'rgba(127,136,168,0.42)' };
    // A mass of lobes [[x, y, r, kind]] (kind 1: the dark belly) drawn as one cloud: an outline
    // round the whole, a light rim on its upper left, the body, the belly, a few curls.
    function mass(g, lobes, L, d, by, amp, wl) {
        const all = new Path2D(), bodyP = new Path2D(), curls = [];
        let xa = Infinity, xb = -Infinity, yb = -Infinity;
        lobes.forEach(([x, y, r, kind], i) => {
            if (r <= 0.004) return;
            const rr = r * (1 + 0.03 * (((d + i) % 2) * 2 - 1));
            all.moveTo(x + rr, y);
            all.arc(x, y, rr, 0, TAU);
            xa = Math.min(xa, x - rr);
            xb = Math.max(xb, x + rr);
            yb = Math.max(yb, y + rr);
            if (kind) {
                bodyP.moveTo(x + rr, y);
                bodyP.arc(x, y, rr, 0, TAU);
            } else {
                bodyP.moveTo(x + rr * 1.13, y + rr * 0.17);
                bodyP.arc(x + rr * 0.13, y + rr * 0.17, rr, 0, TAU);
                if (i % 2 === 0) curls.push([x + rr * 0.1, y + rr * 0.22, rr * 0.66]);
            }
        });
        if (!(xb > xa)) return;
        // the belly: everything under a line that rolls a little
        const belly = [[xb + amp, yb + amp], [xa - amp, yb + amp]], n = Math.max(6, Math.ceil(((xb - xa) / wl) * 8));
        for (let i = 0; i <= n; i++) {
            const x = lerp(xa - amp, xb + amp, i / n);
            belly.push([x, by + amp * Math.sin((x / wl) * TAU + (d % 2) * 0.9)]);
        }
        g.save();
        g.lineJoin = 'round';
        g.strokeStyle = K.ink;
        g.lineWidth = L * 2;
        g.stroke(all);
        g.fillStyle = RAINC.light;
        g.fill(all);
        g.clip(all);
        g.fillStyle = RAINC.cloud;
        g.fill(bodyP);
        C.poly(g, belly, { fill: RAINC.under, lw: 0 });
        g.strokeStyle = RAINC.under;
        g.lineWidth = L * 0.8;
        g.lineCap = 'round';
        for (const [x, y, r] of curls) {
            if (y + r * 0.3 > by - amp) continue;
            g.beginPath();
            g.arc(x, y, r, Math.PI * 1.08, Math.PI * 1.5);
            g.stroke();
        }
        g.restore();
    }
    // A lightning fork from (x, y) down by len; k (0..1) is how far it has struck.
    function bolt(g, L, x, y, len, k) {
        if (k <= 0) return;
        const at = (pts) => pts.map(([px, py]) => [x + px * len, y + py * len]);
        g.save();
        g.beginPath();
        g.rect(x - len, y - len * 0.1, len * 2, len * (0.1 + 1.04 * clamp(k)));
        g.clip();
        C.poly(g, at([[0.2, 0.36], [0.34, 0.4], [0.56, 0.74], [0.36, 0.6], [0.3, 0.5]]), { fill: K.gold, ink: K.ink, lw: L });
        C.poly(g, at([[0.04, -0.1], [0.34, -0.1], [0.15, 0.4], [0.36, 0.4], [-0.12, 1.0], [0.02, 0.55], [-0.2, 0.55]]), { fill: K.yellow, ink: K.ink, lw: L });
        C.poly(g, at([[0.13, -0.1], [0.24, -0.1], [0.05, 0.47], [0.17, 0.47], [-0.04, 0.8]]), { ink: K.white, lw: L * 0.7, close: false });
        g.restore();
    }
    const CLOUD = [ // x, y, r, kind, the growth at which the lobe joins (-1: it is the first puff)
        [0.15, -1.15, 0.92, 0, -1], [-0.35, -0.55, 0.85, 0, -1], [0.7, -0.5, 0.8, 0, -1], [0.1, 0.0, 0.5, 1, -1],
        [-0.85, -0.95, 0.74, 0, 0.08], [1.05, -0.9, 0.7, 0, 0.18], [-0.72, 0.0, 0.5, 1, 0.14], [0.85, 0.02, 0.48, 1, 0.24],
        [-1.5, -0.5, 0.6, 0, 0.38], [1.7, -0.45, 0.55, 0, 0.48], [-1.45, 0.02, 0.42, 1, 0.44], [1.52, 0.05, 0.4, 1, 0.54],
        [-2.0, -0.15, 0.36, 0, 0.66], [2.12, -0.12, 0.32, 0, 0.72],
    ];
    /**
     * The cloud the machine makes: heavy, scalloped, in the rain theme's greys, with a darker
     * belly. It boils on twos.
     *   x, y   the middle of its belly;  s  logical units per figure unit
     *   o: { grow (0..1: a puff 0.6 wide that gains lobes, to a cloud 4.6 wide and 2.6 tall; the
     *              default is 1; for a sky-wide one raise s as well),
     *        flash (0..1: a lightning fork strikes down from the belly, drawn; hold it two drawings),
     *        rain (0..1: streaks falling from the belly on twos), fall (how far they fall, in units, default 2.4),
     *        t (seconds) }
     */
    function stormCloud(g, x, y, s, o = {}) {
        const grow = clamp(o.grow ?? 1), G = 0.22 + 0.78 * grow, L = 3.4 / s, d = C.drawing(o.t ?? 0);
        const lobes = CLOUD.map(([lx, ly, r, kind, from]) => [lx * G, ly * G, r * G * (from < 0 ? 1 : back((grow - from) / 0.2)), kind]);
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const rain = clamp(o.rain ?? 0);
        if (rain > 0) {
            const fall = o.fall ?? 2.4, n = Math.round(4 + 12 * G), r = Motion.rng('weather-cloud-rain');
            g.lineCap = 'round';
            g.lineWidth = 3 / s;
            for (let i = 0; i < n; i++) {
                const px = (((i + 0.5) / n) * 2 - 1) * 2.0 * G + (r() - 0.5) * 0.2, ph = r(), len = 0.28 + 0.14 * r();
                if (r() > rain) continue;
                for (let j = 0; j < 2; j++) {
                    const off = ((d * 0.31 * (1 + 0.3 * ph) + ph + j * 0.5) % 1) * fall;
                    if (off + len > fall + 0.15) continue;
                    g.beginPath();
                    g.moveTo(px - off * 0.32, 0.2 * G + off);
                    g.lineTo(px - (off + len) * 0.32, 0.2 * G + off + len);
                    g.strokeStyle = (i + j) % 3 ? RAINC.a : RAINC.b;
                    g.stroke();
                }
            }
        }
        if ((o.flash ?? 0) > 0) bolt(g, L, 0.25 * G, 0.3 * G, (1.5 + 0.6 * grow) * G, o.flash);
        mass(g, lobes, L, d, -0.06 * G, 0.07 * G, 1.1 * G);
        g.restore();
    }

    /**
     * The weather's edge. k goes 0 → 1 as it crosses the frame from left to right; at 0 and at
     * 1 nothing of it shows. The edge leans like the rain: its top leads.
     *   Weather.frontX(k, y)                       where the edge is at height y (logical units)
     *   Weather.split(g, k, drawLeft, drawRight)   draws the rain world (left) and the day world
     *                                              (right), each clipped to its side of the edge
     *   Weather.front(g, t, k, o)                  over both: a rolling wall of cloud standing on
     *                                              the edge and the first sheet of rain under it.
     *                                              o: { base (the wall's belly, default 560), flash (0..1) }
     */
    const frontX = (k, y = 500) => lerp(-320, 1340, k) + 0.32 * (500 - y);
    function split(g, k, drawLeft, drawRight) {
        const a = frontX(k, -80), b = frontX(k, 1080);
        if (drawRight && b < 1080) {
            g.save();
            g.beginPath();
            g.moveTo(a, -80);
            g.lineTo(1400, -80);
            g.lineTo(1400, 1080);
            g.lineTo(b, 1080);
            g.closePath();
            g.clip();
            drawRight(g);
            g.restore();
        }
        if (drawLeft && a > -80) {
            g.save();
            g.beginPath();
            g.moveTo(a, -80);
            g.lineTo(-400, -80);
            g.lineTo(-400, 1080);
            g.lineTo(b, 1080);
            g.closePath();
            g.clip();
            drawLeft(g);
            g.restore();
        }
    }
    function front(g, t, k, o = {}) {
        if (k <= 0 || k >= 1) return;
        const d = C.drawing(t), base = o.base ?? 560, xs = (y) => frontX(k, y);
        // the first sheet of rain: a veil along the edge, streaks on twos, splashes on the road
        C.poly(g, [[xs(base) - 84, base - 40], [xs(base) + 14, base - 40], [xs(1080) + 14, 1080], [xs(1080) - 84, 1080]], { fill: RAINC.veil, lw: 0 });
        const r = Motion.rng('weather-front-rain'), span = 1080 - base;
        g.lineCap = 'round';
        g.lineWidth = 3;
        for (let i = 0; i < 44; i++) {
            const y0 = r() * span, u = r(), sp = 1 + r() * 0.5, len = 40 + r() * 34;
            const yy = base - 20 + ((y0 + d * 96 * sp) % span), xx = xs(yy) + 14 - 180 * u;
            g.beginPath();
            g.moveTo(xx, yy);
            g.lineTo(xx - len * 0.32, yy + len);
            g.strokeStyle = i % 3 ? RAINC.a : RAINC.b;
            g.stroke();
        }
        for (let i = 0; i < 7; i++) {
            const yy = 836 + r() * 96, xx = xs(yy) - 160 * r(), f = (d + i) % 4;
            if (f > 1) continue;
            const sz = 7 + f * 7;
            C.poly(g, [[xx - sz, yy - sz * 0.7], [xx - sz * 0.3, yy], [xx + sz * 0.3, yy], [xx + sz, yy - sz * 0.7]], { ink: RAINC.b, lw: 2.6, close: false });
        }
        if ((o.flash ?? 0) > 0) bolt(g, 3.4, xs(base) - 60, base + 30, 300, o.flash);
        // the wall: lobes along the edge that roll (each turns on a small circle, on twos)
        const rw = Motion.rng('weather-front-wall'), lobes = [];
        let j = 0;
        for (let y = -90; y < base - 30; y += 64) {
            const x = xs(y);
            for (const [dx, dy, rr] of [[-150 - 40 * rw(), 14, 70 + 24 * rw()], [-60 - 30 * rw(), 26, 92 + 26 * rw()], [36 + 44 * rw(), 0, 80 + 30 * rw()]]) {
                const ph = d * 0.9 + j * 1.7;
                lobes.push([x + dx + Math.cos(ph) * 9, y + dy + Math.sin(ph) * 9, rr, 0]);
                j++;
            }
        }
        // behind it the cloud deck trails off along the top of the frame
        for (let x = xs(-40) - 230, i = 0; x > -160 && i < 12; x -= 96, i++) {
            const ph = d * 0.9 + i * 2.3;
            lobes.push([x + Math.cos(ph) * 7, 6 + (i % 2) * 34 - i * 5 + Math.sin(ph) * 7, 96 - i * 3, 0]);
            lobes.push([x - 40, -70, 110, 0]);
        }
        const xb = xs(base);
        for (const [dx, dy, rr] of [[-176, 2, 60], [-104, 22, 72], [-30, 30, 76], [44, 14, 62], [100, -22, 48]]) lobes.push([xb + dx + (d % 2 ? 4 : -4), base - 10 + dy, rr, 1]);
        mass(g, lobes, 3.6, d, base - 4, 9, 150);
    }

    // =========================================================================================
    // The canvas top and the wipers of the band's car
    // =========================================================================================
    const TOPC = { ink: K.ink, canvas: '#ecd9a6', top: '#fbf0cf', side: '#cdb478', lining: '#a98f58', seam: '#b3975c', chrome: '#d5dbea', chromeTop: '#f4f6fc', glass: 'rgba(170,243,236,0.78)' };
    const TOP = {
        pv: [1.62, -1.1], A: [1.56, -1.07], B: [1.86, -1.08], H: [2.83, -1.83], z0: 0.06, W: 1.38, th: 0.14,
        // each bow's tip about the pivot: folded [angle°, radius], standing angle°, raised [angle°, radius]
        R: [[-118, 0.42], -93, [-96, 1.146]], Q: [[-110, 0.5], -91.5, [-81.07, 1.417]], M: [[-100, 0.58], -90, [-66.7, 1.72]], F: [[-90, 0.56], -88.5, [-49.87, 1.831]],
    };
    // The top's near profile at `up`: it rises behind the seat as a closed fan (0 → 0.35),
    // swings forward over the driver (0.35 → 0.85) and drops its front to the windshield (→ 1).
    function topPoints(up) {
        const ua = smooth(up / 0.35), ub = smooth((up - 0.35) / 0.5), uc = smooth((up - 0.85) / 0.15), pv = TOP.pv;
        const tip = ([[a0, r0], a1, [a2, r2]]) => {
            const a = (lerp(lerp(a0, a1, ua), a2, ub) * Math.PI) / 180, r = lerp(r0, r2, ua);
            return [pv[0] + r * Math.cos(a), pv[1] + r * Math.sin(a)];
        };
        const inw = (p, th) => {
            const l = Math.hypot(pv[0] - p[0], pv[1] - p[1]) || 1;
            return [p[0] + ((pv[0] - p[0]) / l) * th, p[1] + ((pv[1] - p[1]) / l) * th];
        };
        const R = tip(TOP.R), Q = tip(TOP.Q), Mm = tip(TOP.M), F = tip(TOP.F), th = TOP.th;
        const Fi = inw(F, th), H = lerpPt(F, TOP.H, uc), Hi = lerpPt(Fi, [TOP.H[0] - 0.1, TOP.H[1]], uc);
        const Qi = lerpPt(lerpPt(Fi, TOP.B, 2 / 3), inw(Q, th), ub), Mi = lerpPt(lerpPt(Fi, TOP.B, 1 / 3), inw(Mm, th), ub);
        const n0 = Dd(TOP.z0), nr = (p) => [p[0] + n0[0], p[1] + n0[1]];
        const outer = C.curve((uc > 0.02 ? [TOP.A, R, Q, Mm, F, H] : [TOP.A, R, Q, Mm, F]).map(nr), false, 6);
        const inner = C.curve((uc > 0.02 ? [Hi, Fi, Mi, Qi, TOP.B] : [Fi, Mi, Qi, TOP.B]).map(nr), false, 6);
        return { ua, ub, uc, outer, inner, pv: nr(pv), R: nr(R), Q: nr(Q), M: nr(Mm), F: nr(F), H: nr(TOP.H), Qi: nr(Qi), Mi: nr(Mi), Fi: nr(Fi) };
    }
    /**
     * The convertible's canvas top over the driver's cockpit of Rides.bandCar, in the CAR'S
     * units (call it inside the car's transform; s is the car's scale, for the line width).
     *   o: { up (0..1: 0 folded on the cockpit's rear edge behind the seat; to 0.35 it stands up as
     *            a closed fan; to 0.85 it swings forward over the driver; at 1 its front has dropped
     *            onto the windshield and is latched),
     *        part ('back' | 'front' | 'all', the default) }
     * The driver sits INSIDE it: draw part 'back' before the driver and part 'front' after him,
     * both from the car's riders callback (see the file's notes on Rig.band); 'all' is both in
     * one call, for an empty cockpit. Raised, it reaches 3.0 above the ground.
     */
    function softTop(g, s, o = {}) {
        const up = clamp(o.up ?? 1), part = o.part ?? 'all', L = 3.2 / s, P = TOPC, T = topPoints(up);
        const W = Dd(TOP.W), far = (p) => [p[0] + W[0], p[1] + W[1]];
        const near = [...T.outer, ...T.inner], cols = { front: P.canvas, top: P.top, side: P.side };
        // the canvas across the car, cut into runs by what they show us: the outside from above
        // (light), the outside from the front (dark), or the lining
        const runs = [];
        for (let i = 0; i < T.outer.length - 1; i++) {
            const a = T.outer[i], b = T.outer[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
            const seen = dy * D[0] - dx * D[1] > 1e-6, tone = !seen ? P.lining : -dx / len < -0.42 ? P.top : P.side;
            const last = runs[runs.length - 1];
            if (last && last.tone === tone) last.pts.push(b);
            else runs.push({ seen, tone, pts: [a, b] });
        }
        const sheet = (want) => {
            for (const r of runs) {
                if (r.seen !== want) continue;
                C.poly(g, [...r.pts, ...r.pts.slice().reverse().map(far)], { fill: r.tone, ink: r.tone, lw: 1 / C.pxScale(g) });
            }
            runs.forEach((r, i) => {
                if (r.seen !== want) return;
                const a = r.pts[0], b = r.pts[r.pts.length - 1];
                line(g, r.pts.map(far), L, P.ink);
                line(g, [a, far(a)], i > 0 && runs[i - 1].seen === want ? L * 0.8 : L, P.ink);
                if (i === runs.length - 1 || runs[i + 1].seen !== want) line(g, [b, far(b)], L, P.ink);
            });
        };
        g.save();
        g.lineJoin = 'round';
        g.lineCap = 'round';
        if (part !== 'front') {
            if (up < 0.35) {
                // the folded stack lies (or stands) across the car
                C.prism(g, cw(near), W, cols, { lw: L, ink: P.ink, sweepInk: null });
                C.prismOutline(g, cw(near), W, { lw: L, ink: P.ink });
            } else {
                // the far side's canvas from inside, and the undersides that still look at us
                C.poly(g, near.map(far), { fill: P.lining, ink: P.ink, lw: L });
                sheet(false);
            }
        }
        if (part !== 'back') {
            if (up >= 0.35) {
                sheet(true);
                // the bows show through the canvas
                for (const p of [T.Q, T.M]) if (T.ub > 0.3) line(g, [lerpPt(p, far(p), 0.04), lerpPt(p, far(p), 0.96)], L * 0.6, P.seam);
            }
            // the near side: the quarter behind the seat, the valance along the roof, the front leg
            C.poly(g, near, { fill: P.canvas, ink: P.ink, lw: L });
            if (T.ub < 0.999) {
                for (const p of [T.R, T.Q, T.M, T.F]) line(g, [lerpPt(T.pv, p, 0.22), lerpPt(T.pv, p, 0.93)], L * 0.6, P.seam);
            } else {
                for (const p of [T.R, T.Q]) line(g, [lerpPt(T.pv, p, 0.12), lerpPt(T.pv, p, 0.9)], L * 0.6, P.seam);
                // stitches along the valance, the quarter's window, snaps along its foot
                line(g, C.curve([T.Qi, T.Mi, T.Fi], false, 6).map(([x, y]) => [x + 0.02, y - 0.04]), L * 0.6, P.seam);
                const wc = [1.69, -1.72];
                g.beginPath();
                g.roundRect(wc[0] - 0.085, wc[1] - 0.17, 0.17, 0.34, 0.06);
                g.fillStyle = P.glass;
                g.fill();
                g.strokeStyle = P.ink;
                g.lineWidth = L * 0.8;
                g.stroke();
                line(g, [[wc[0] - 0.04, wc[1] + 0.04], [wc[0] + 0.02, wc[1] - 0.08]], L * 0.8, '#fffdf4');
                for (const u of [0.25, 0.55, 0.85]) {
                    const p = lerpPt(TOP.A, TOP.B, u);
                    circ(g, p[0] + 0.02, p[1] - 0.06, 0.02, P.chrome, L * 0.5, P.ink);
                }
            }
            if (T.uc > 0.5) {
                // the latch on the windshield's header
                const h = T.H;
                C.poly(g, [[h[0] - 0.13, h[1] - 0.05], [h[0] + 0.03, h[1] - 0.05], [h[0] + 0.03, h[1] + 0.03], [h[0] - 0.13, h[1] + 0.03]], { fill: P.chrome, ink: P.ink, lw: L * 0.8 });
                line(g, [[h[0] - 0.1, h[1] - 0.02], [h[0], h[1] - 0.02]], L * 0.6, P.chromeTop);
            }
            circ(g, T.pv[0], T.pv[1] - 0.02, 0.05, P.chrome, L * 0.8, P.ink);
            circ(g, T.pv[0], T.pv[1] - 0.02, 0.018, P.chromeTop, 0);
        }
        g.restore();
    }
    /**
     * The wipers on the band car's windshield, in the car's units like softTop. a: their angle
     * in the glass (radians, -0.9..0.9; 0 = upright, positive = towards the far side).
     */
    function wipers(g, s, a = 0) {
        const L = 3.2 / s, nb = [2.95, -1.1], upv = [-0.2155, -0.977];
        const dir = [Math.cos(a) * upv[0] + Math.sin(a) * D[0], Math.cos(a) * upv[1] + Math.sin(a) * D[1]];
        g.save();
        g.lineJoin = 'round';
        g.lineCap = 'round';
        for (const z of [1.0, 0.45]) {
            const p = [nb[0] + D[0] * z + upv[0] * 0.035, nb[1] + D[1] * z + upv[1] * 0.035], at = (u) => [p[0] + dir[0] * u, p[1] + dir[1] * u];
            tube(g, [at(0), at(0.3)], 0.022, TOPC.chrome, L * 0.6);
            tube(g, [at(0.14), at(0.5)], 0.03, '#2a2438', L * 0.6);
            circ(g, p[0], p[1], 0.03, TOPC.chrome, L * 0.6, K.ink);
        }
        g.restore();
    }
    /**
     * Runs fn(g) inside the transform Rides.bandCar gives its body (the same x, y, s and the
     * car's o.lean and o.bounce), for what is drawn on the car after the car itself:
     *     Rig.band(g, t, x, y, s, o);
     *     Weather.onBandCar(g, x, y, s, o, (g) => Weather.wipers(g, s, a));
     */
    function onBandCar(g, x, y, s, o, fn) {
        const rx = -3.55, rR = 0.56; // the band car's rear axle, as in rides.js
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.translate(rx, -rR);
        g.rotate(-(o?.lean ?? 0));
        g.translate(-rx, rR);
        g.translate(0, (o?.bounce ?? 0) * 0.1);
        fn(g);
        g.restore();
    }

    // =========================================================================================
    // The umbrella, drips
    // =========================================================================================
    /**
     * A cartoon umbrella.
     *   x, y   the point of its handle a mitt rests on (give the hand the same point and draw
     *          the umbrella BEFORE the figure's arm: the mitt covers the handle there)
     *   o: { open (0..1: furled along its shaft → a dome 1.96 wide; its rim is 1.24 above the grip),
     *        tilt (radians about the grip, -0.5..0.5; positive leans its top to the right),
     *        color (the panels alternate this colour and white; default yellow) }
     * Its tip is 1.86 above the grip; the crook ends 0.34 below it.
     */
    function umbrella(g, x, y, s, o = {}) {
        const open = clamp(o.open ?? 1), tilt = o.tilt ?? 0, col = o.color ?? K.yellow, L = 3.2 / s, e = smooth(open);
        const R = lerp(0.1, 0.98, e), dome = lerp(1.0, 0.48, e), apex = -1.72, N = 8;
        const P3 = (px, py, pz = 0) => {
            const q = rot([px, py], tilt);
            return [q[0] + D[0] * pz, q[1] + D[1] * pz];
        };
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        // the handle: a wooden crook, a brass collar
        const crook = C.curve([[0, -0.14], [0, 0.16], [0.02, 0.28], [0.11, 0.34], [0.2, 0.29], [0.215, 0.17]], false, 6).map(([px, py]) => P3(px, py));
        // the shaft, the ferrule
        tube(g, [P3(0, -0.1), P3(0, apex - 0.02)], 0.04, '#d5dbea', L * 0.8);
        tube(g, crook, 0.07, '#7b4526', L * 0.9);
        line(g, [P3(-0.014, -0.1), P3(-0.014, 0.14)], L * 0.6, '#a86a3c');
        tube(g, [P3(0, -0.17), P3(0, -0.12)], 0.085, K.gold, L * 0.8);
        tube(g, [P3(0, apex + 0.02), P3(0, apex - 0.14)], 0.035, '#d5dbea', L * 0.8);
        const tipP = P3(0, apex - 0.15);
        circ(g, tipP[0], tipP[1], 0.04, K.gold, L * 0.8);
        // the canopy: eight panels between ribs, the far ones first
        const rib = (a, v) => {
            const ph = (v * Math.PI) / 2, r = R * Math.sin(ph);
            return P3(Math.cos(a) * r, apex + dome * (1 - Math.cos(ph)), Math.sin(a) * r);
        };
        const dark = mix(col, K.ink, 0.24), white = '#fffdf4', whiteD = '#d9d4e6';
        const panels = Array.from({ length: N }, (_, i) => ({ i, a0: ((i + 0.5) / N) * TAU, a1: ((i + 1.5) / N) * TAU, am: ((i + 1) / N) * TAU }));
        panels.sort((p, q) => Math.sin(q.am) - Math.sin(p.am));
        const sag = 0.1 * e;
        for (const p of panels) {
            const pts = [];
            for (let j = 0; j <= 8; j++) pts.push(rib(p.a0, j / 8));
            // the hem between two ribs is cut in a curve
            for (let j = 1; j < 6; j++) {
                const u = j / 6, a = lerp(p.a0, p.a1, u), lift = 1 - (Math.sin(p.am) > 0.3 ? 0 : sag) * 4 * u * (1 - u), ph = (lift * Math.PI) / 2, r = R * Math.sin(ph) * (1 - 0.03 * 4 * u * (1 - u));
                pts.push(P3(Math.cos(a) * r, apex + dome * (1 - Math.cos(ph)), Math.sin(a) * r));
            }
            for (let j = 8; j >= 0; j--) pts.push(rib(p.a1, j / 8));
            const right = Math.cos(p.am) > 0.5;
            C.poly(g, pts, { fill: p.i % 2 ? (right ? whiteD : white) : right ? dark : col, ink: K.ink, lw: L * 0.9 });
        }
        for (const p of panels) {
            if (Math.sin(p.a0) > 0.35 || e < 0.3) continue;
            const q = rib(p.a0, 1);
            circ(g, q[0], q[1], 0.026, '#d5dbea', L * 0.5);
        }
        if (e < 0.3) {
            // furled: a strap round it
            const a = P3(-R * 0.86, apex + dome * 0.7), b = P3(R * 0.86, apex + dome * 0.7);
            tube(g, [a, b], 0.05, mix(col, K.ink, 0.4), L * 0.7);
            circ(g, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0.028, K.gold, L * 0.5);
        }
        g.restore();
    }
    /**
     * Where the umbrella's near rib tips are, in units from its grip: [[dx, dy], …] from left
     * to right, for the same o (open, tilt). Give them to drips() as o.pts.
     */
    function umbrellaTips(o = {}) {
        const e = smooth(clamp(o.open ?? 1)), R = lerp(0.1, 0.98, e), dome = lerp(1.0, 0.48, e), out = [];
        for (let i = 0; i < 8; i++) {
            const a = ((i + 0.5) / 8) * TAU;
            if (Math.sin(a) > 0.35) continue;
            const q = rot([Math.cos(a) * R, -1.72 + dome], o.tilt ?? 0);
            out.push([q[0] + D[0] * Math.sin(a) * R, q[1] + D[1] * Math.sin(a) * R]);
        }
        return out.sort((p, q) => p[0] - q[0]);
    }
    /**
     * Water streaming off an edge, on twos: a bead that swells at each point of the edge and
     * drops that fall from it one after another.
     *   x, y   the middle of the edge;  s  logical units per figure unit;  t  seconds;  n  streams
     *   o: { w (the edge's length in units, default n × 0.26), pts ([[dx, dy], …] in units from
     *        x, y: the points to drip from instead of a straight edge, e.g. Weather.umbrellaTips),
     *        len (how far the drops fall, default 1.1), slant (sideways drift per unit fallen,
     *        default -0.32 like the rain), color }
     */
    function drips(g, x, y, s, t, n = 5, o = {}) {
        const d = C.drawing(t), len = o.len ?? 1.1, sl = o.slant ?? -0.32;
        const pts = o.pts ?? Array.from({ length: n }, (_, i) => [((i + 0.5) / n - 0.5) * (o.w ?? n * 0.26), 0]);
        const r = Motion.rng('weather-drips:' + pts.length), col = o.color ?? '#eaf3ff';
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.fillStyle = col;
        pts.forEach(([px, py], i) => {
            const ph = Math.floor(r() * 6), f = (((d + ph) % 6) + 6) % 6, jx = o.pts ? 0 : (r() - 0.5) * 0.06;
            // the bead on the edge: it swells over three drawings, lets go, starts again
            const b = [0.6, 0.8, 1, 0.45, 0.5, 0.55][f];
            g.beginPath();
            g.ellipse(px + jx, py + 0.035 * b, 0.034 * b, 0.05 * b, 0, 0, TAU);
            g.fill();
            // two drops on their way down, half a cycle apart
            for (const k of [0, 3]) {
                const u = (((d + ph + k) % 6) + 6) % 6 / 6, off = 0.08 + len * u * u, w = 0.03;
                if (u < 0.15) continue;
                const hx = px + jx + off * sl, hy = py + off, l = 0.09 + 0.12 * u;
                g.beginPath();
                g.moveTo(hx - sl * l, hy - l);
                g.quadraticCurveTo(hx + w * 1.5, hy - w * 0.4, hx + w * 0.2, hy + w);
                g.quadraticCurveTo(hx - w * 1.4, hy + w * 0.6, hx - sl * l, hy - l);
                g.fill();
            }
        });
        g.restore();
    }

    // =========================================================================================
    // The block of ice
    // =========================================================================================
    /**
     * A block of ice with someone inside, the cel way: a pale blue at an alpha over the figure,
     * white glints, a dark blue outline, frost on top, icicles.
     *   x, y   the ground point of the figure inside (the block stands round it: by default
     *          2.4 wide, 2.75 tall and 1 deep, its front face 0.3 nearer than the figure)
     *   inside(g)  draws the frozen figure, FIRST, in the frame's own coordinates (the same
     *          x, y, s you gave: Devil.draw(g, x, y, s, pose)); it shakes with the block
     *   o: { melt (0..1: the block sinks from the top to a low lump, a puddle spreads, beads run down it),
     *        crack (0..1: cracks spread from the middle of its face to its edges),
     *        shake (0..1, on twos), t (seconds),
     *        w, h, d (the block's size in units), cx (its middle from the figure's, default 0.1) }
     */
    function iceBlock(g, x, y, s, o = {}, inside = null) {
        const melt = clamp(o.melt ?? 0), crack = clamp(o.crack ?? 0), sh = clamp(o.shake ?? 0), t = o.t ?? 0, d = C.drawing(t), L = 3.2 / s;
        const W = (o.w ?? 2.4) * (1 - 0.1 * melt), H = (o.h ?? 2.75) * (1 - 0.88 * melt), Z = o.d ?? 1.0, cx = o.cx ?? 0.1, f = Dd(-0.3);
        const jx = sh ? (d % 2 ? 1 : -1) * 0.022 * sh * s : 0, jy = sh ? [0, -1, 0.5][((d % 3) + 3) % 3] * 0.012 * sh * s : 0;
        // the puddle, on the ground under everything
        if (melt > 0.02) {
            g.save();
            g.translate(x, y);
            g.scale(s, s);
            const r = Motion.rng('weather-puddle'), rx = (o.w ?? 2.4) / 2 + 0.25 + 1.0 * melt, ry = 0.12 + 0.22 * melt, pts = [];
            for (let i = 0; i < 12; i++) {
                const a = (i / 12) * TAU, k = 0.86 + 0.24 * r();
                pts.push([cx + 0.12 + Math.cos(a) * rx * k * smooth(melt * 3 + 0.25), -0.06 + Math.sin(a) * ry * k]);
            }
            C.poly(g, C.curve(pts, true, 6), { fill: ICE.puddle, ink: ICE.line, lw: L * 0.85 });
            line(g, C.curve([[cx - rx * 0.5, -0.06 - ry * 0.3], [cx - rx * 0.2, -0.06 - ry * 0.5], [cx + rx * 0.12, -0.06 - ry * 0.52]], false, 5), L * 0.8, ICE.white);
            line(g, [[cx + rx * 0.4, -0.06 + ry * 0.45], [cx + rx * 0.62, -0.06 + ry * 0.3]], L * 0.7, ICE.white);
            g.restore();
        }
        g.save();
        g.translate(jx, jy);
        if (inside) inside(g);
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        const x0 = cx - W / 2 + f[0], x1 = cx + W / 2 + f[0], yB = f[1], yT = yB - H;
        const c1 = Math.min(H * 0.45, 0.16 + 0.4 * melt), c2 = Math.min(H * 0.45, 0.12 + 0.3 * melt), c3 = Math.min(H * 0.3, 0.07), c4 = Math.min(H * 0.3, 0.1);
        const chip = H > 1 ? [[x0, yT + H * 0.52], [x0 + 0.07, yT + H * 0.47], [x0, yT + H * 0.4]] : [];
        const face = [[x0 + c1, yT], [x1 - c2, yT], [x1, yT + c2], [x1, yB - c4], [x1 - c4, yB], [x0 + c3, yB], [x0, yB - c3], ...chip, [x0, yT + c1]];
        const S = Dd(Z), bk = (p) => [p[0] + S[0], p[1] + S[1]];
        // the edges behind, seen through the ice
        line(g, [bk([x0, yT + c1]), bk([x0, yB - c3]), bk([x0 + c3, yB]), bk([x1 - c4, yB])], L * 0.6, ICE.deep);
        line(g, [[x0, yB - c3], bk([x0, yB - c3])], L * 0.6, ICE.deep);
        C.prism(g, face, S, { front: 'rgba(191,230,255,0.4)', top: 'rgba(228,245,255,0.66)', side: 'rgba(125,186,238,0.6)' }, { lw: L, ink: ICE.line });
        // glints: slanted bars of light on the face, a sparkle on its corner
        g.save();
        C.trace(g, face);
        g.clip();
        g.globalAlpha = 0.78;
        const gl = (gx, gy, w, h) => C.poly(g, [[gx, gy], [gx + w, gy], [gx + w - h * 0.5, gy + h], [gx - h * 0.5, gy + h]], { fill: ICE.white, lw: 0 });
        if (H > 0.9) {
            gl(x0 + 0.5, yT + 0.2, 0.2, Math.min(0.75, H * 0.3));
            gl(x0 + 0.8, yT + 0.2, 0.07, Math.min(0.55, H * 0.22));
            gl(x1 - 0.22, yB - Math.min(0.62, H * 0.25), 0.1, Math.min(0.42, H * 0.17));
        } else gl(x0 + 0.5, yT + H * 0.2, 0.16, H * 0.5);
        g.restore();
        if (melt < 0.5) C.sparkle(g, x1 - c2 * 0.5 + 0.02, yT + c2 * 0.5, (d % 4 < 2 ? 0.2 : 0.14) * (1 - melt), { color: ICE.white, ink: ICE.line, lw: L * 0.7 });
        if (crack > 0) {
            g.save();
            C.trace(g, face);
            g.clip();
            const mx = (x0 + x1) / 2 - 0.15, my = yT + H * 0.48;
            cracks(g, L, mx, my, (a) => Math.min(Math.abs((Math.cos(a) > 0 ? x1 - mx : mx - x0) / (Math.cos(a) || 1e-6)), Math.abs((Math.sin(a) > 0 ? yB - my : my - yT) / (Math.sin(a) || 1e-6))) * 1.25, crack, 'block', 7);
            g.restore();
        }
        // frost on top: a cap of snow that hangs over the face, icicles from its lip
        const fr = clamp(1 - melt / 0.14);
        if (fr > 0) {
            const a = [x0 + c1 * 0.4, yT + c1 * 0.3], b = [x1 - c2 * 0.3, yT + c2 * 0.3];
            C.poly(g, [[x0 + c1, yT], [x1 - c2, yT], bk([x1 - c2, yT]), bk([x0 + c1, yT])], { fill: ICE.snow, ink: ICE.line, lw: L * 0.8 });
            snowCap(g, L, bk([x0 + c1 + 0.04, yT + 0.02]), bk([x1 - c2 - 0.04, yT + 0.02]), 0.1 * fr, 'blockB', 0);
            snowCap(g, L, a, b, 0.12 * fr, 'block', 0.16 * fr);
            icicles(g, L, [a[0] + 0.15, a[1] + 0.1 * fr], [b[0] - 0.15, b[1] + 0.1 * fr], 5, 0.42, 'block', fr, 0.05);
            icicles(g, L, [x1 + 0.03, yT + c2 + 0.02], bk([x1 - 0.05, yT + c2 + 0.02]), 2, 0.3, 'blockS', fr, 0.045);
        }
        // meltwater: beads that slide down the face
        if (melt > 0.02 && H > 0.3) {
            const r = Motion.rng('weather-melt');
            for (let i = 0; i < 6; i++) {
                const px = lerp(x0 + 0.15, x1 - 0.15, (i + 0.2 + 0.6 * r()) / 6), ph = r(), u = (d * 0.09 * (0.8 + 0.5 * r()) + ph) % 1, py = yT + 0.05 + u * (H - 0.12);
                line(g, [[px, Math.max(yT + 0.03, py - 0.2 * u - 0.05)], [px, py - 0.03]], L * 0.6, ICE.white);
                C.poly(g, C.curve([[px, py - 0.07], [px + 0.035, py], [px, py + 0.035], [px - 0.035, py]], true, 4), { fill: ICE.light, ink: ICE.line, lw: L * 0.6 });
            }
        }
        g.restore();
    }

    // =========================================================================================
    // The calendar
    // =========================================================================================
    /**
     * A page torn off a wall calendar: 1.3 wide, 1.6 tall, a red header, the day in capitals.
     *   x, y   its middle;  s  logical units per figure unit (at 84 the day's letters are 50 high)
     *   o: { day ('MON' | 'TUE' | 'WED'), rot (radians), curl (0..1: its lower right corner curls up) }
     */
    function calendar(g, x, y, s, o = {}) {
        const day = o.day ?? 'MON', curl = clamp(o.curl ?? 0), L = 3.2 / s, w = 1.3, h = 1.6, c = 0.08 + 0.32 * curl;
        const x0 = -w / 2, x1 = w / 2, y0 = -h / 2, y1 = h / 2, hd = y0 + 0.42;
        g.save();
        g.translate(x, y);
        g.rotate(o.rot ?? 0);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        // the sheet: torn along its perforation at the top, its corner curling
        const page = [];
        for (let i = 0; i <= 26; i++) page.push([x0 + (w * i) / 26, y0 + (i % 2 ? 0.035 : 0) + (i === 0 || i === 26 ? 0.035 : 0)]);
        page.push([x1, y1 - c], [x1 - c, y1], [x0, y1]);
        C.poly(g, page, { fill: '#fffdf4', lw: 0 });
        g.save();
        C.trace(g, page);
        g.clip();
        g.fillStyle = K.red;
        g.fillRect(x0, y0 - 0.1, w, hd - y0 + 0.1);
        g.fillStyle = '#c4201f';
        g.fillRect(x0, hd - 0.05, w, 0.05);
        // the holes it hung by, a bar of white
        for (const hx of [-0.36, 0.36]) circ(g, hx, y0 + 0.2, 0.07, '#7c1629', L * 0.7);
        g.fillStyle = '#fffdf4';
        g.fillRect(-0.2, y0 + 0.17, 0.4, 0.06);
        // the day
        g.fillStyle = K.ink;
        g.font = '0.74px "Anton"';
        g.textAlign = 'center';
        g.textBaseline = 'alphabetic';
        g.fillText(day, 0, y1 - 0.42);
        // the week along the foot: seven boxes, the day's one filled
        const idx = { MON: 0, TUE: 1, WED: 2 }[day] ?? 0;
        for (let i = 0; i < 7; i++) {
            const bx = x0 + 0.13 + i * 0.152;
            g.beginPath();
            g.rect(bx, y1 - 0.26, 0.11, 0.11);
            g.fillStyle = i === idx ? K.red : '#e6dfc8';
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = L * 0.5;
            g.stroke();
        }
        g.restore();
        C.poly(g, page, { ink: K.ink, lw: L });
        line(g, [[x0, hd], [x1, hd]], L * 0.8);
        // the curl: the back of the corner, folded over
        const tipC = [x1 - c * 0.92, y1 - c * 0.92];
        C.poly(g, [...C.curve([[x1, y1 - c], [x1 - c * 0.3, y1 - c * 0.86], tipC], false, 5), ...C.curve([tipC, [x1 - c * 0.86, y1 - c * 0.3], [x1 - c, y1]], false, 5).slice(1)], { fill: '#d9d2bc', ink: K.ink, lw: L });
        line(g, [[x1 - c * 0.72, y1 - c * 0.26], [x1 - c * 0.26, y1 - c * 0.72]], L * 0.6, '#b9b29c');
        g.restore();
    }

    // =========================================================================================
    // Hell freezes over
    // =========================================================================================
    // The office set of segments/planb.js, copied by its numbers.
    const HELL = {
        wallL: '#a82338', wallD: '#6a1221',
        win: () => {
            const p = new Path2D();
            p.moveTo(44, 400);
            p.lineTo(44, 210);
            p.quadraticCurveTo(44, 96, 148, 96);
            p.quadraticCurveTo(252, 96, 252, 210);
            p.lineTo(252, 400);
            p.closePath();
            return p;
        },
        spires: [[70, 150], [118, 96], [214, 170]],
        cracks: [[[40, 920], [110, 904], [150, 930], [230, 914]], [[420, 968], [500, 950], [560, 974], [640, 956], [700, 978]], [[820, 900], [880, 916], [930, 896]]],
        easel: { x0: 418, y0: 150, w: 452, h: 440 },
    };
    /**
     * The board that hangs on Hell's door: a painted plank on two cords, snow on its top,
     * icicles under it, with the literal text HELL · CLOSED: SNOW on two lines.
     *   x, y   the nail it hangs from;  s  logical units per figure unit (the board is 2.9 wide
     *          and 1.5 tall and hangs 0.5 below the nail: at s = 78 it is 226 × 117)
     *   o: { swing (radians about the nail, keep it under 0.15), snow (0..1, default 1) }
     */
    function closedBoard(g, x, y, s, o = {}) {
        const L = 3.2 / s, w = 2.9, h = 1.5, top = 0.5, sn = clamp(o.snow ?? 1);
        g.save();
        g.translate(x, y);
        g.rotate(o.swing ?? 0);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        line(g, [[-w / 2 + 0.28, top + 0.04], [0, 0], [w / 2 - 0.28, top + 0.04]], L * 1.1);
        circ(g, 0, 0, 0.05, '#d5dbea', L * 0.8);
        C.box(g, -w / 2, top, w, h, D, { front: '#fff1c4', top: '#fffdf4', side: '#d2b877' }, { lw: L, ink: K.ink, depth: 0.16 });
        g.strokeStyle = K.red;
        g.lineWidth = 0.05;
        g.strokeRect(-w / 2 + 0.09, top + 0.09, w - 0.18, h - 0.18);
        for (const sx of [-1, 1]) circ(g, sx * (w / 2 - 0.28), top + 0.09, 0.035, '#8d95ad', L * 0.6);
        g.fillStyle = K.ink;
        g.textAlign = 'center';
        g.textBaseline = 'alphabetic';
        g.font = '0.44px "Anton"';
        g.fillText('HELL · CLOSED:', 0, top + 0.6);
        g.fillStyle = K.red;
        g.font = '0.78px "Anton"';
        g.fillText('SNOW', 0, top + 1.34);
        if (sn > 0) {
            snowCap(g, L, [-w / 2 - 0.02, top + 0.02], [w / 2 + 0.02, top + 0.02], 0.13 * sn, 'board', 0.07 * sn);
            icicles(g, L, [-w / 2 + 0.1, top + h], [w / 2 - 0.1, top + h], 5, 0.36, 'board', sn, 0.05);
        }
        g.restore();
    }
    /**
     * «Hell freezes over»: the dressing to draw OVER the office set of segments/planb.js (its
     * wall, window, easel, floor and lever), in that set's coordinates, BEFORE the actors and
     * the bin: icicles on the stalactites' tips, the window's view gone cold with its lava fall
     * frozen, snow on the sill, the easel, the lever and along the floor, frost on the
     * blueprint, the floor's cracks frozen, snowflakes falling on twos, the board.
     *   o: { k (0..1, default 1: how frozen; raise it to let the cold creep in),
     *        board ([x, y, s] of Weather.closedBoard, default [770, 612, 78], or false),
     *        swing (the board's), flakes (0..1, default 1: Weather.snowfall, drawn last) }
     */
    function frozenHell(g, t, o = {}) {
        const k = clamp(o.k ?? 1), d = C.drawing(t), lw = 3.2;
        if (k <= 0) return;
        g.save();
        g.lineJoin = 'round';
        g.lineCap = 'round';
        // --- the window: Hell outside has gone cold, the lava fall is ice -----------------------
        if (k > 0.3) {
            const win = HELL.win();
            g.save();
            g.clip(win);
            C.sunburst(g, 150, 420, { n: 10, rot: t * 0.15, a: '#8fc4f2', b: '#bfe2fb' });
            for (const [sx, sh] of HELL.spires) {
                C.poly(g, [[sx - 24, 400], [sx - 6, 400 - sh], [sx + 8, 400 - sh * 0.8], [sx + 26, 400]], { fill: '#5b6cb0', ink: K.ink, lw: 3 });
                C.poly(g, [[sx - 11.5, 400 - sh * 0.7], [sx - 6, 400 - sh], [sx + 8, 400 - sh * 0.8], [sx + 14, 400 - sh * 0.56], [sx + 6, 400 - sh * 0.64], [sx + 1, 400 - sh * 0.52], [sx - 5, 400 - sh * 0.66]], { fill: ICE.snow, ink: K.ink, lw: 2.4 });
            }
            g.fillStyle = ICE.fill;
            g.fillRect(150, 96, 44, 320);
            g.fillStyle = ICE.light;
            g.fillRect(155, 96, 10, 320);
            g.fillStyle = ICE.dark;
            g.fillRect(183, 96, 11, 320);
            for (const [yy, hh] of [[132, 44], [214, 60], [300, 40], [352, 50]]) {
                // ridges where it froze as it fell, a glint on each
                C.poly(g, C.curve([[150, yy], [161, yy + 9], [172, yy + 3], [183, yy + 10], [194, yy + 2]], false, 4), { ink: ICE.line, lw: 2.2, close: false });
                C.poly(g, [[169, yy + 16], [169, yy + 16 + hh * 0.5]], { ink: ICE.white, lw: 3, close: false });
            }
            C.poly(g, [[150, 96], [150, 420]], { ink: K.ink, lw: 3, close: false });
            C.poly(g, [[194, 96], [194, 420]], { ink: K.ink, lw: 3, close: false });
            // frost in the glass's corners
            for (const [cx, cy, sx] of [[44, 400, 1], [252, 400, -1]]) {
                const pts = [[cx, cy], [cx + sx * 64, cy], [cx + sx * 50, cy - 14], [cx + sx * 54, cy - 30], [cx + sx * 34, cy - 30], [cx + sx * 36, cy - 52], [cx + sx * 20, cy - 50], [cx + sx * 18, cy - 76], [cx, cy - 84]];
                g.globalAlpha = 0.86;
                C.poly(g, pts, { fill: ICE.light, lw: 0 });
                g.globalAlpha = 1;
                C.poly(g, pts.slice(1), { ink: ICE.line, lw: 2, close: false });
            }
            icicles(g, lw, [70, 118], [140, 98], 2, 46, 'winA', k, 7);
            icicles(g, lw, [200, 106], [240, 150], 2, 40, 'winB', k, 7);
            g.restore();
            g.strokeStyle = K.ink;
            g.lineWidth = 16;
            g.stroke(win);
            g.strokeStyle = HELL.wallL;
            g.lineWidth = 9;
            g.stroke(win);
            C.box(g, 30, 398, 236, 20, [10, -7], { front: HELL.wallL, top: '#c43349', side: HELL.wallD }, { lw: 4 });
        }
        // --- the sill: snow on it, icicles under it ---------------------------------------------
        C.poly(g, [[30, 398], [266, 398], [276, 391], [40, 391]], { fill: ICE.snow, ink: ICE.line, lw: lw * 0.8 });
        snowCap(g, lw, [42, 391], [274, 391], 15 * k, 'sillB', 0);
        snowCap(g, lw, [28, 399], [268, 399], 14 * k, 'sill', 9 * k);
        icicles(g, lw, [40, 418], [258, 418], 6, 50, 'sill', k, 7);
        // --- the stalactites: their tips are icicles now ----------------------------------------
        const rs = Motion.rng('stal');
        for (let x = 280; x < 1010; x += 56 + rs() * 40) {
            const w = 26 + rs() * 22, h = 50 + rs() * 80, y0 = h * 0.5, hw = w * (1 - y0 / h) + 3, ext = (16 + h * 0.38) * k;
            const pts = [[x - hw, y0 - 5], [x - hw * 0.35, y0 + 4], [x + hw * 0.3, y0 - 4], [x + hw, y0 + 3], [x + 5, h + ext * 0.2], [x + 3, h + ext], [x - 4, h + ext * 0.25]];
            C.poly(g, pts, { fill: ICE.fill, ink: ICE.line, lw: lw * 0.9 });
            C.poly(g, [[x - hw * 0.45, y0 + 10], [x - 2, h + ext * 0.1]], { ink: ICE.white, lw: 2.4, close: false });
        }
        // --- the easel: snow on its top and its tray, frost on the blueprint ---------------------
        const E = HELL.easel;
        snowCap(g, lw, [E.x0 - 2, E.y0 - 17], [E.x0 + E.w + 22, E.y0 - 17], 13 * k, 'easelB', 0);
        C.poly(g, [[E.x0 - 14, E.y0 - 12], [E.x0 + E.w + 14, E.y0 - 12], [E.x0 + E.w + 24, E.y0 - 19], [E.x0 - 4, E.y0 - 19]], { fill: ICE.snow, ink: ICE.line, lw: lw * 0.8 });
        snowCap(g, lw, [E.x0 - 16, E.y0 - 11], [E.x0 + E.w + 16, E.y0 - 11], 15 * k, 'easel', 10 * k);
        icicles(g, lw, [E.x0 + 10, E.y0 - 6], [E.x0 + E.w - 10, E.y0 - 6], 5, 34, 'easelI', k, 6);
        const sx0 = E.x0 + 8, sy0 = E.y0 + 8, sx1 = E.x0 + E.w - 8, sy1 = E.y0 + E.h - 8;
        g.save();
        g.beginPath();
        g.rect(sx0 + 2, sy0 + 2, sx1 - sx0 - 4, sy1 - sy0 - 4);
        g.clip();
        for (const [cx, cy, ax, ay, sz] of [[sx0, sy1, 1, -1, 96], [sx1, sy1, -1, -1, 120], [sx1, sy0, -1, 1, 64], [sx0, sy0, 1, 1, 50]]) {
            const z = sz * k, pts = [[cx, cy], [cx + ax * z, cy], [cx + ax * z * 0.78, cy + ay * z * 0.16], [cx + ax * z * 0.84, cy + ay * z * 0.34], [cx + ax * z * 0.56, cy + ay * z * 0.36], [cx + ax * z * 0.6, cy + ay * z * 0.58], [cx + ax * z * 0.34, cy + ay * z * 0.56], [cx + ax * z * 0.3, cy + ay * z * 0.82], [cx + ax * z * 0.12, cy + ay * z * 0.8], [cx, cy + ay * z]];
            g.globalAlpha = 0.86;
            C.poly(g, pts, { fill: ICE.light, lw: 0 });
            g.globalAlpha = 1;
            C.poly(g, pts.slice(1), { ink: ICE.line, lw: 2, close: false });
            C.sparkle(g, cx + ax * z * 0.3, cy + ay * z * 0.3, z * 0.12, { color: ICE.white });
        }
        g.restore();
        snowCap(g, lw, [E.x0 - 4, E.y0 + E.h], [E.x0 + E.w + 34, E.y0 + E.h], 9 * k, 'trayB', 0);
        C.poly(g, [[E.x0 - 22, E.y0 + E.h + 10], [E.x0 + E.w + 22, E.y0 + E.h + 10], [E.x0 + E.w + 36, E.y0 + E.h], [E.x0 - 8, E.y0 + E.h]], { fill: ICE.snow, ink: ICE.line, lw: lw * 0.8 });
        snowCap(g, lw, [E.x0 - 24, E.y0 + E.h + 11], [E.x0 + E.w + 24, E.y0 + E.h + 11], 10 * k, 'tray', 7 * k);
        icicles(g, lw, [E.x0 - 12, E.y0 + E.h + 26], [E.x0 + E.w + 12, E.y0 + E.h + 26], 7, 40, 'tray', k, 6);
        // --- the lever's plate ---------------------------------------------------------------------
        C.poly(g, [[50, 590], [142, 590], [150, 585], [58, 585]], { fill: ICE.snow, ink: ICE.line, lw: lw * 0.8 });
        snowCap(g, lw, [48, 591], [144, 591], 12 * k, 'lever', 7 * k);
        icicles(g, lw, [56, 780], [136, 780], 3, 36, 'lever', k, 6);
        // --- the floor: its cracks have frozen, snow has drifted along the wall -----------------
        for (const cr of HELL.cracks) {
            C.poly(g, cr, { ink: K.ink, lw: 9, close: false });
            C.poly(g, cr, { ink: ICE.fill, lw: 4, close: false });
        }
        const rf = Motion.rng('weather-floor'), drift = [[-20, 866]];
        for (let x = -20; x <= 884; x += 36) drift.push([x, 862 - (6 + 16 * rf() + (x > 380 && x < 520 ? 14 : 0)) * k]);
        drift.push([890, 868]);
        C.poly(g, [...C.curve(drift, false, 4), [884, 874], [600, 878], [300, 874], [-20, 878]], { fill: ICE.snow, ink: ICE.line, lw: lw * 0.85 });
        for (const [mx, my, mw] of [[258, 934, 120], [612, 906, 150], [770, 986, 130]]) {
            const hh = mw * 0.14 * k;
            C.poly(g, C.curve([[mx - mw / 2, my], [mx - mw * 0.3, my - hh * 0.8], [mx - mw * 0.05, my - hh], [mx + mw * 0.22, my - hh * 0.7], [mx + mw / 2, my], [mx + mw * 0.2, my + hh * 0.35], [mx - mw * 0.25, my + hh * 0.35]], true, 5), { fill: ICE.snow, ink: ICE.line, lw: lw * 0.85 });
            C.poly(g, [[mx - mw * 0.2, my - hh * 0.2], [mx + mw * 0.1, my - hh * 0.3]], { ink: ICE.snowSide, lw: 3, close: false });
        }
        // --- the board ---------------------------------------------------------------------------
        if (o.board !== false && k > 0.5) {
            const [bx, by, bs] = o.board ?? [770, 612, 78];
            closedBoard(g, bx, by, bs, { swing: o.swing ?? 0, snow: k });
        }
        g.restore();
        snowfall(g, t, k * (o.flakes ?? 1));
    }
    /**
     * Snow falling over the whole frame, on twos: dots and a few six-armed flakes. k: how thick
     * (0..1). frozenHell draws it; with flakes: 0 there, draw it yourself over the actors.
     */
    function snowfall(g, t, k = 1) {
        const d = C.drawing(t), rn = Motion.rng('weather-flakes'), nf = Math.round(46 * clamp(k));
        g.save();
        g.lineCap = 'round';
        for (let i = 0; i < nf; i++) {
            const x0 = rn() * 1000, y0 = rn() * 1040, sp = 9 + rn() * 9, ph = rn() * TAU, big = i % 6 === 0, sz = big ? 8 + rn() * 4 : 2.6 + rn() * 2.4;
            const yy = ((y0 + d * sp) % 1040) - 20, xx = x0 + Math.sin(d * 0.35 + ph) * 14 - yy * 0.06;
            if (big) {
                g.strokeStyle = ICE.white;
                g.lineWidth = 2.6;
                g.beginPath();
                for (let j = 0; j < 3; j++) {
                    const a = (j / 3) * Math.PI + (d % 2 ? 0.26 : 0) + ph;
                    g.moveTo(xx - Math.cos(a) * sz, yy - Math.sin(a) * sz);
                    g.lineTo(xx + Math.cos(a) * sz, yy + Math.sin(a) * sz);
                }
                g.stroke();
            } else {
                circ(g, xx, yy, sz, ICE.white, 0);
            }
        }
        g.restore();
    }

    // --- what the imps wear ------------------------------------------------------------------------
    /**
     * Runs fn(g) in a Devil.imp's own units (the same x, y, s and the pose's hop and squash):
     *     Devil.imp(g, x, y, s, pose);
     *     Weather.onImp(g, x, y, s, pose, (g) => { Weather.scarf(g, s, color); Weather.earmuffs(g, s, pose.wear); });
     */
    function onImp(g, x, y, s, pose, fn) {
        const q = pose?.squash ?? 0;
        g.save();
        g.translate(x, y - (pose?.hop ?? 0) * s);
        g.scale(s, s);
        g.scale(1 + q, 1 - q);
        fn(g);
        g.restore();
    }
    /**
     * A striped scarf round an imp, under its chin, in the imp's units (see onImp).
     *   color  the scarf's colour (its stripes are white);  o: { t (its tails flap on twos),
     *   blow (-1..1: the wind on its tails, default 0.3), board (true when the imp holds its
     *   clipboard: the scarf passes behind it and knots on the other side) }
     */
    function scarf(g, s, color = K.yellow, o = {}) {
        const L = 3 / s, dark = mix(color, K.ink, 0.28), d = C.drawing(o.t ?? 0), blow = o.blow ?? 0.3, y0 = -0.32, y1 = -0.17;
        const kx = o.board ? 0.34 : -0.28, flap = [0, 0.03, -0.02][((d % 3) + 3) % 3] * (0.4 + Math.abs(blow));
        g.save();
        g.lineJoin = 'round';
        g.lineCap = 'round';
        // the wrap: across the front and round the right side
        const sideP = [[0.53, y0], [0.53 + D[0] * 0.5, y0 + D[1] * 0.5], [0.53 + D[0] * 0.5, y1 + D[1] * 0.5], [0.53, y1]];
        C.poly(g, sideP, { fill: dark, ink: K.ink, lw: L });
        const runs = o.board ? [[-0.53, -0.4], [0.14, 0.53]] : [[-0.53, 0.53]];
        for (const [a, b] of runs) {
            const pts = [[a, y0], [b, y0 - 0.012], [b, y1], [a, y1 + 0.012]];
            C.poly(g, pts, { fill: color, lw: 0 });
            g.save();
            C.trace(g, pts);
            g.clip();
            g.fillStyle = '#fffdf4';
            for (let x = -0.47; x < 0.53; x += 0.2) g.fillRect(x, y0 - 0.02, 0.07, y1 - y0 + 0.04);
            g.restore();
            C.poly(g, pts, { ink: K.ink, lw: L });
        }
        // the tails: one hangs, one flies
        const tail = (pts, w) => {
            const n = pts.length, band = [], R2 = [];
            pts.forEach(([x, y], i) => {
                const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
                band.push([x - (dy / l) * w, y + (dx / l) * w]);
                R2.push([x + (dy / l) * w, y - (dx / l) * w]);
            });
            const shape = [...band, ...R2.reverse()];
            C.poly(g, shape, { fill: color, lw: 0 });
            g.save();
            C.trace(g, shape);
            g.clip();
            for (let i = 1; i < n - 1; i += 2) C.poly(g, [band[i], band[i + 1] ?? band[i], R2[n - 2 - i] ?? R2[0], R2[n - 1 - i]], { fill: '#fffdf4', lw: 0 });
            g.restore();
            C.poly(g, shape, { ink: K.ink, lw: L });
            // the fringe
            const e = pts[n - 1], p = pts[n - 2], ux = e[0] - p[0], uy = e[1] - p[1], ul = Math.hypot(ux, uy) || 1;
            for (const k of [-0.7, 0, 0.7]) line(g, [[e[0] - (uy / ul) * w * k, e[1] + (ux / ul) * w * k], [e[0] - (uy / ul) * w * k + (ux / ul) * 0.06, e[1] + (ux / ul) * w * k + (uy / ul) * 0.06]], L * 0.8);
        };
        tail(C.curve([[kx + 0.02, y1 - 0.05], [kx + 0.05, y1 + 0.06], [kx + 0.03 + blow * 0.04, y1 + 0.15 + flap * 0.4], [kx + 0.06 + blow * 0.06, y1 + 0.22]], false, 3), 0.062);
        if (o.board) tail(C.curve([[kx - 0.03, y1 - 0.05], [kx - 0.07, y1 + 0.04], [kx - 0.06 + blow * 0.03, y1 + 0.1 - flap * 0.4], [kx - 0.08 + blow * 0.04, y1 + 0.15]], false, 3), 0.058);
        else tail(C.curve([[kx - 0.03, y1 - 0.07], [kx - 0.1 - blow * 0.1, y1 - 0.02 + flap], [kx - 0.2 - blow * 0.16, y1 - 0.02 - blow * 0.1 - flap], [kx - 0.3 - blow * 0.2, y1 + 0.02 - blow * 0.16 + flap]], false, 3), 0.058);
        // the knot
        g.beginPath();
        g.roundRect(kx - 0.085, y0 - 0.02, 0.17, y1 - y0 + 0.04, 0.04);
        g.fillStyle = dark;
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = L;
        g.stroke();
        g.restore();
    }
    /**
     * Earmuffs on an imp, in the imp's units (see onImp): two fluffy pads and a band over its
     * head. wear: the imp's own `wear` ('hat': the band goes over the hard hat; 'bow': it
     * passes behind the bow; 'specs' or nothing: over the head between the horns).
     */
    function earmuffs(g, s, wear = null) {
        const L = 3 / s, top = -1.02, ey = -0.69, band = '#3b2fa0', bandTop = '#6c5fe0', pad = K.aqua, padSide = K.teal;
        g.save();
        g.lineJoin = 'round';
        g.lineCap = 'round';
        const lp = [-0.54, ey], rp = [0.5 + D[0] * 0.25, ey + D[1] * 0.25];
        // the band, from pad to pad
        let path;
        if (wear === 'hat') path = C.curve([lp, [-0.6, top - 0.02], [-0.44, top - 0.24], [0.02, top - 0.4], [0.5, top - 0.3], [0.64, top - 0.14], rp], false, 8);
        else path = C.curve([lp, [-0.585, top + 0.04], [-0.5, top - 0.08], [0.04, top - 0.115], [0.56, top - 0.14], [0.6, top - 0.02], rp], false, 8);
        if (wear === 'bow') {
            const a = path.filter(([x]) => x < -0.27), b = path.filter(([x]) => x > 0.28);
            tube(g, a, 0.055, band, L * 0.9);
            tube(g, b, 0.055, band, L * 0.9);
        } else {
            tube(g, path, 0.055, band, L * 0.9);
            line(g, path.slice(Math.floor(path.length * 0.3), Math.floor(path.length * 0.62)).map(([x, y]) => [x, y - 0.012]), L * 0.6, bandTop);
        }
        // the far pad sticks out past the head's left edge; the near one sits on its right side
        puffs(g, [[lp[0] - 0.02, lp[1], 0.17, 7, 0.3]], pad, L * 0.9, K.ink);
        // (the same scalloped puff, seen from its side: squeezed, with a darker rim behind it)
        const side = (dx, fill) => {
            const parts = [[rp[0] + dx, rp[1], 0.105, 0.15]];
            for (let i = 0; i < 7; i++) {
                const a = 0.3 + (i / 7) * TAU;
                parts.push([rp[0] + dx + Math.cos(a) * 0.066, rp[1] + Math.sin(a) * 0.115 - Math.cos(a) * 0.02, 0.05, 0.074]);
            }
            g.strokeStyle = K.ink;
            g.lineWidth = L * 1.8;
            for (const [x, y, rx, ry] of parts) {
                g.beginPath();
                g.ellipse(x, y, rx, ry, -0.12, 0, TAU);
                g.stroke();
            }
            g.fillStyle = fill;
            for (const [x, y, rx, ry] of parts) {
                g.beginPath();
                g.ellipse(x, y, rx, ry, -0.12, 0, TAU);
                g.fill();
            }
        };
        side(0.07, padSide);
        side(0, pad);
        g.restore();
    }
    /**
     * A puff of cold breath, on twos: three small clouds that leave (x, y), grow and thin out,
     * in a loop of a second. dir: 1 drifts to the right (the default), -1 to the left.
     */
    function breath(g, x, y, s, t, dir = 1) {
        const d = C.drawing(t), L = 3.2 / s, list = [];
        for (let i = 0; i < 3; i++) {
            const f = (((d + i * 4) % 12) + 12) % 12, u = f / 12;
            if (u > 0.84) continue;
            list.push([dir * (0.1 + u * 0.62), -0.03 - u * 0.36 - u * u * 0.2, (0.05 + 0.15 * u) * (u > 0.6 ? 1 - (u - 0.6) * 1.6 : 1), 5 + (i % 2), i * 1.1 + f * 0.5]);
        }
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        puffs(g, list, '#f4fbff', L * 0.85, ICE.line);
        g.restore();
    }

    return {
        D, ICE, MP,
        machine, machinePoints, crankImp, crankArm, towedAt, HITCH,
        stormCloud, front, frontX, split,
        softTop, wipers, onBandCar,
        umbrella, umbrellaTips, drips,
        iceBlock, calendar,
        frozenHell, closedBoard, snowfall, onImp, scarf, earmuffs, breath,
        icicle, icicles, snowCap,
    };
})();
