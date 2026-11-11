// Props of verse 2c (segments/verse2c.js): what «Hell freezes over» adds to weather.js. The
// frost that runs up the Devil's arm, the stub the crank leaves on the machine, the funnel's
// cough of snow, the bin whose flame freezes solid, a tiny snowman with horns, the chauffeur's
// scarf, the cloudy block of ice with the Devil in it (as the roadside shot holds it and the
// thaw needs it back), knock marks, the band's car far away.
// Units: figure units as in cast.js and weather.js unless a function says frame units.
// Global: Verse2cProps. Depends on Cereal, Cast, Devil, Rides, Rig, Weather.
const Verse2cProps = (() => {
    const C = Cereal, K = C.COL, W = Weather, ICE = W.ICE, MP = W.MP, TAU = Math.PI * 2;
    const D = Cast.D, Dd = Cast.Dd;
    const lerp = (a, b, u) => a + (b - a) * u;
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const line = (g, pts, lw, ink = K.ink) => C.poly(g, pts, { ink, lw, close: false });
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
    // The convex hull of a few points, clockwise on screen (for the silhouette of a swept quad).
    const hull = (pts) => {
        const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
        const lo = [], up = [];
        for (const q of p) {
            while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
            lo.push(q);
        }
        for (const q of p.slice().reverse()) {
            while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
            up.push(q);
        }
        return [...lo.slice(0, -1), ...up.slice(0, -1)];
    };
    // Scalloped puffs, as in rides.js and weather.js: all the outlines first, the fills on top.
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
    // A six-armed snowflake with a dark blue edge, for the ones that are thrown (the falling
    // ones are Weather.snowfall's).
    function flake(g, x, y, r, a0 = 0, L = 3.2) {
        for (const [col, lw] of [[ICE.line, L * 2.2], [ICE.white, L * 0.9]]) {
            g.strokeStyle = col;
            g.lineWidth = lw;
            g.lineCap = 'round';
            g.beginPath();
            for (let j = 0; j < 3; j++) {
                const a = a0 + (j / 3) * Math.PI;
                g.moveTo(x - Math.cos(a) * r, y - Math.sin(a) * r);
                g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
            }
            g.stroke();
        }
    }
    // A corner of frost: a pale sheet with a crystal edge growing out of (cx, cy) along ax, ay
    // (±1 each), z long. The same figure as the frost on Hell's blueprint.
    function frostCorner(g, L, cx, cy, ax, ay, z) {
        if (z <= 0.01) return;
        const pts = [[cx, cy], [cx + ax * z, cy], [cx + ax * z * 0.78, cy + ay * z * 0.16], [cx + ax * z * 0.84, cy + ay * z * 0.34], [cx + ax * z * 0.56, cy + ay * z * 0.36], [cx + ax * z * 0.6, cy + ay * z * 0.58], [cx + ax * z * 0.34, cy + ay * z * 0.56], [cx + ax * z * 0.3, cy + ay * z * 0.82], [cx + ax * z * 0.12, cy + ay * z * 0.8], [cx, cy + ay * z]];
        g.save();
        g.globalAlpha = 0.9;
        C.poly(g, pts, { fill: ICE.light, lw: 0 });
        g.restore();
        C.poly(g, pts.slice(1), { ink: ICE.line, lw: L * 0.7, close: false });
    }

    // =========================================================================================
    // The Devil, freezing
    // =========================================================================================
    // How he ends: mid-laugh, both mitts up, the snapped crank in the right one (screen left).
    // The pose of the weather sheet (dev/weather, sheets 13, 14, 18), which the thaw takes up.
    const FROZEN = { mood: 'laugh', handR: [-0.66, -0.98], handL: [0.62, -0.92], headTilt: -0.06, tail: 0.02, shadow: false };
    const CRANK = { a: -1.45, flip: -1 }; // how Weather.crankArm sits in that mitt: the grip upright, the arm out to the left
    const BLOCK = { h: 3.05 }; // the block that holds that pose: Weather.iceBlock's own, a little taller (2.4 × 3.05 × 1)
    /**
     * The crank in his right mitt and the Devil, frozen in the pose above. o: { pose (merged
     * over FROZEN), crankFrost (0..1: icicles on the crank) }
     */
    function devilWithCrank(g, x, y, s, o = {}) {
        const pose = { ...FROZEN, ...(o.pose ?? {}) }, hr = pose.handR, L = 3.2 / s, q = pose.squash ?? 0, ln = pose.lean ?? 0;
        // where the mitt is in the frame, whatever his lean and squash
        const mx = hr[0] * (1 + q), my = hr[1] * (1 - q), px = mx * Math.cos(ln) - my * Math.sin(ln), py = mx * Math.sin(ln) + my * Math.cos(ln);
        W.crankArm(g, x + px * s, y + py * s, s, CRANK.a + ln, CRANK.flip);
        const f = clamp(o.crankFrost ?? 0);
        if (f > 0) {
            // the bar sticks out to the left of the grip's top: snow along it, icicles under it
            const u = [Math.cos(CRANK.a), Math.sin(CRANK.a)], n = [-u[1] * CRANK.flip, u[0] * CRANK.flip], at = (p, r) => [hr[0] + u[0] * p + n[0] * r, hr[1] + u[1] * p + n[1] * r];
            g.save();
            g.translate(x, y);
            g.scale(s, s);
            g.rotate(ln);
            g.scale(1 + q, 1 - q);
            g.lineJoin = 'round';
            g.lineCap = 'round';
            W.snowCap(g, L, at(0.295, 0.36), at(0.295, 0.0), 0.05 * f, 'v2c-crank', 0);
            W.icicles(g, L, at(0.19, 0.3), at(0.19, 0.1), 3, 0.2, 'v2c-crank', f, 0.035);
            g.restore();
        }
        Devil.draw(g, x, y, s, pose);
    }
    /**
     * Frost on the Devil, over Devil.draw at the same x, y, s (his pose must be FROZEN's: no
     * lean, no squash). arm 0..1: it runs from the mitt that holds the crank down the sleeve
     * to the shoulder; body 0..1: then over the shoulder's corner of the coat, with icicles
     * under the sleeve, the ear, the jaw and the horns.
     */
    function devilFrost(g, x, y, s, o = {}) {
        const arm = clamp(o.arm ?? 0), body = clamp(o.body ?? 0), L = 3.2 / s, T = Devil.TORSO, H = Devil.HEAD;
        if (arm <= 0) return;
        const sh = [T.x + 0.03, T.y + 0.14], hand = o.hand ?? FROZEN.handR, tilt = o.headTilt ?? FROZEN.headTilt;
        const dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6, ux = dx / len, uy = dy / len, w = 0.092, nx = -uy * w, ny = ux * w;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        if (body > 0) {
            // the shoulder's corner of the coat; icicles on the head (tilted about his feet)
            g.save();
            g.beginPath();
            g.rect(T.x, T.y, T.w, T.h);
            g.clip();
            frostCorner(g, L, T.x, T.y, 1, 1, 0.34 * body);
            g.restore();
            if (body > 0.5) {
                g.save();
                g.rotate(tilt);
                const k = (body - 0.5) * 2;
                W.icicle(g, L, -H.w / 2 - 0.085, H.top + 0.44, 0.16 * k, 0.05, 0); // under the far ear
                W.icicle(g, L, -H.w / 2 + 0.16, H.top + H.h + 0.005, 0.12 * k, 0.04, 0); // under the jaw
                for (const sx of [-1, 1]) W.icicle(g, L, sx * 0.612, H.top - 0.2, 0.15 * k, 0.045, 0); // where the rain ran off his horns
                g.restore();
            }
        }
        // the arm: from the mitt's end back to the frost's front
        const a1 = len + 0.115, a0 = lerp(a1, 0.0, arm), S = Dd(0.165);
        const at = (a, k) => [sh[0] + ux * a + nx * k, sh[1] + uy * a + ny * k];
        const quad = [at(a0, 1), at(a1, 1), at(a1, -1), at(a0, -1)];
        const sil = hull([...quad, ...quad.map(([px, py]) => [px + S[0], py + S[1]])]);
        g.save();
        g.globalAlpha = 0.92;
        C.poly(g, sil, { fill: ICE.light, lw: 0 });
        g.restore();
        // the crystal edge it advances with, towards the shoulder
        if (arm < 0.999) {
            const teeth = [at(a0, 1)];
            for (let i = 0; i < 3; i++) {
                teeth.push(at(a0 - (i === 1 ? 0.075 : 0.05), 0.68 - i * 0.68));
                teeth.push(at(a0 + 0.012, 0.34 - i * 0.68));
            }
            teeth.pop();
            teeth.push(at(a0, -1));
            C.poly(g, teeth, { fill: ICE.light, ink: ICE.line, lw: L * 0.8 });
        }
        C.poly(g, sil, { ink: ICE.line, lw: L * 0.9 });
        // the mitt's and the cuff's edges show through the frost; a glint along the sleeve
        const c0 = Math.max(0.03, len - 0.14), c1 = Math.max(0.06, len - 0.075);
        for (const c of [c0, c1]) if (c > a0 + 0.02) line(g, [at(c, 1), at(c, -1)], L * 0.6, ICE.dark);
        if (a1 - a0 > 0.16) line(g, [at(a0 + 0.06, -0.45), at(a1 - 0.05, -0.45)], L * 0.8, ICE.white);
        // icicles under the sleeve once it is covered, a sparkle on the mitt
        const low = ny > 0 ? 1 : -1; // the side of the arm that looks down
        if (arm > 0.45) {
            const k = clamp((arm - 0.45) / 0.4);
            for (const [a, l] of [[len * 0.34, 0.13], [len * 0.7, 0.17]]) {
                const p = at(a, low);
                W.icicle(g, L, p[0], p[1] - 0.005, l * k, 0.042, 0);
            }
        }
        const m = at(a1 - 0.07, 0);
        C.sparkle(g, m[0] + 0.02, m[1] - 0.01, 0.07, { color: ICE.white, ink: ICE.line, lw: L * 0.6 });
        g.restore();
    }

    // =========================================================================================
    // The machine without its crank
    // =========================================================================================
    // Weather.machine draws its crank at any angle and has no way to leave it out; with
    // `crank: NO_CRANK` every point of the crank and of the cog behind it is NaN and the canvas
    // skips them (a path call with a non-finite number is ignored, by the spec). The cog and
    // what is left of the shaft are then drawn by snappedStub. A `crank: false` in weather.js
    // would be the clean way.
    const NO_CRANK = NaN;
    const COG = [0.55 + D[0] * -0.04, -0.97 + D[1] * -0.04]; // the cog's middle on the gearbox's face (weather.js M.hub, M.gear)
    /**
     * The gearbox's cog and the snapped shaft, over Weather.machine(g, x, y, s, { crank: NO_CRANK, … }).
     *   o: { a (the angle the cog stopped at), ice (0..1), c ([x, y] in units: the cog's middle
     *        when the body has moved: COG carried by the body's bounce, pitch and shake) }
     */
    function snappedStub(g, x, y, s, o = {}) {
        const L = 3.2 / s, ice = clamp(o.ice ?? 0), a0 = o.a ?? 0, hf = o.c ?? COG;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        const cog = [];
        for (let i = 0; i < 32; i++) {
            const a = a0 + (i / 32) * TAU, rr = Math.floor(i / 2) % 2 ? 0.165 : 0.125;
            cog.push([hf[0] + Math.cos(a) * rr, hf[1] + Math.sin(a) * rr]);
        }
        C.poly(g, cog, { fill: MP.brass, ink: MP.ink, lw: L * 0.8 });
        circ(g, hf[0], hf[1], 0.085, MP.brassSide, L * 0.6, MP.ink);
        // the shaft: a short chrome stub that comes towards us, its end broken off
        const out = Dd(-0.12), e = [hf[0] + out[0], hf[1] + out[1]];
        C.drum(g, e[0], e[1], 0.042, [-out[0], -out[1]], { front: MP.chromeSide, side: MP.chrome }, { lw: L * 0.8, ink: MP.ink });
        C.poly(g, [[e[0] - 0.03, e[1] + 0.006], [e[0] - 0.012, e[1] - 0.018], [e[0] + 0.002, e[1] + 0.004], [e[0] + 0.016, e[1] - 0.02], [e[0] + 0.03, e[1] + 0.002], [e[0] + 0.012, e[1] + 0.026], [e[0] - 0.014, e[1] + 0.024]], { fill: MP.chromeTop, ink: MP.ink, lw: L * 0.5 });
        if (ice > 0.2) {
            W.icicle(g, L, e[0] - 0.005, e[1] + 0.036, 0.2 * ice, 0.05, 0);
            W.snowCap(g, L, [hf[0] - 0.13, hf[1] - 0.105], [hf[0] + 0.13, hf[1] - 0.105], 0.04 * ice, 'v2c-cog', 0);
        }
        g.restore();
    }
    /**
     * The funnel's cough when the machine goes over the top: white puffs and thrown snowflakes
     * that burst out of its mouth. x, y: the mouth, in frame units; s: units per figure unit;
     * j: the drawing since it went off (0, 1, 2 …; nothing after the fifth).
     */
    function snowBurst(g, x, y, s, j) {
        if (j < 0 || j > 4) return;
        const L = 3.2 / s, u = [0.42, 0.72, 0.9, 1, 1.06][j], fade = [1, 1, 0.92, 0.7, 0.42][j], r = Motion.rng('v2c-burst');
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        const list = [];
        for (let i = 0; i < 7; i++) {
            const a = -Math.PI / 2 + (i - 3) * 0.36 + (r() - 0.5) * 0.2, dist = (0.5 + 0.75 * r()) * u, size = (0.24 + 0.16 * r()) * fade * (0.7 + 0.3 * u);
            list.push([Math.cos(a) * dist * 1.25, Math.sin(a) * dist - 0.12, size, 6 + (i % 2), i * 0.9 + j * 0.5]);
        }
        puffs(g, list, '#f4fbff', L * 0.9, ICE.line);
        for (let i = 0; i < 8; i++) {
            const a = -Math.PI / 2 + (i - 3.5) * 0.4, dist = (0.9 + 0.9 * r()) * (0.35 + u * 0.9), sz = (0.07 + 0.05 * r()) * (j > 3 ? 0.7 : 1);
            flake(g, Math.cos(a) * dist * 1.3, Math.sin(a) * dist - 0.1 + 0.25 * u * u, sz, i * 0.5 + j * 0.26, L * 0.8);
        }
        g.restore();
    }

    // =========================================================================================
    // Hell's office: the bin, the snowman
    // =========================================================================================
    const FLAMES = [
        [[-0.3, 0], [-0.38, -0.3], [-0.2, -0.52], [-0.24, -0.82], [0, -0.58], [0.06, -1.05], [0.28, -0.62], [0.2, -0.38], [0.4, -0.5], [0.3, 0]],
        [[-0.3, 0], [-0.42, -0.36], [-0.22, -0.42], [-0.1, -0.95], [0.08, -0.6], [0.22, -0.86], [0.26, -0.5], [0.42, -0.3], [0.3, 0]],
        [[-0.3, 0], [-0.34, -0.26], [-0.3, -0.66], [-0.1, -0.5], [0.02, -1.0], [0.16, -0.56], [0.34, -0.72], [0.36, -0.28], [0.3, 0]],
    ];
    /**
     * A flame frozen solid: Fx.flame's three tongues, still, in ice. (x, y) is its foot, s its
     * height in frame units, f which of the flame's three drawings it froze on.
     *   o: { glint (true on the drawings its sparkle is lit), drip (0..1: icicles on its tips' undersides) }
     */
    function frozenFlame(g, x, y, s, f = 0, o = {}) {
        const sh = FLAMES[((f % 3) + 3) % 3], at = (k, dy) => C.curve(sh.map(([px, py]) => [x + px * s * k, y + py * s * k + dy]), true, 5);
        const drip = clamp(o.drip ?? 1);
        // icicles hang from the side tongues before the body is drawn over their roots
        if (drip > 0) {
            for (const [px, py, l] of [[-0.36, -0.27, 0.2], [0.37, -0.36, 0.22]]) W.icicle(g, 2.6, x + px * s, y + py * s, l * s * drip, 0.07 * s, 0);
        }
        C.poly(g, at(1, 0), { fill: ICE.fill, ink: ICE.line, lw: 3 });
        C.poly(g, at(0.68, -s * 0.02), { fill: ICE.light, lw: 0 });
        C.poly(g, at(0.38, -s * 0.03), { fill: ICE.white, lw: 0 });
        // a facet line and a bar of light, the way ice is drawn everywhere else
        C.poly(g, [[x - 0.19 * s, y - 0.12 * s], [x - 0.22 * s, y - 0.42 * s]], { ink: ICE.white, lw: 2.6, close: false });
        C.poly(g, [[x + 0.2 * s, y - 0.1 * s], [x + 0.25 * s, y - 0.3 * s]], { ink: ICE.dark, lw: 2.2, close: false });
        if (o.glint) C.sparkle(g, x + 0.05 * s, y - 0.98 * s, 0.17 * s, { color: ICE.white, ink: ICE.line, lw: 2 });
    }
    /**
     * The bin of Hell's office (segments/planb.js draws it inline: the same numbers), with its
     * two flames burning or frozen. Frame units. o: { frozen (bool), d (the drawing, for the
     * live flames), f (the drawing the flames froze on), frost (0..1: snow on its rim,
     * icicles), glint, pop (a scale for the frozen flames as they set, 1 at rest) }
     */
    function bin(g, o = {}) {
        const bx = 936, by = 886, d = o.d ?? 0, fz = !!o.frozen, f = o.f ?? 0, fr = clamp(o.frost ?? 0), p = o.pop ?? 1;
        if (fz) frozenFlame(g, bx, by - 96, 70 * p, f, { glint: o.glint, drip: fr });
        else Fx.flame(g, bx, by - 96, 70, d, 0);
        C.box(g, bx - 46, by - 100, 92, 100, [10, -7], { front: '#6c66a0', top: '#2a2438', side: '#4a4470' }, { lw: 4 });
        for (const yy of [-78, -50, -22]) C.poly(g, [[bx - 46, by + yy], [bx + 46, by + yy]], { ink: '#4a4470', lw: 4, close: false });
        if (fz) frozenFlame(g, bx - 16, by - 92, 44 * p, f + 1, { drip: 0 });
        else Fx.flame(g, bx - 16, by - 92, 44, d, 1);
        if (fr > 0) {
            g.save();
            g.lineJoin = 'round';
            g.lineCap = 'round';
            W.snowCap(g, 3.2, [bx - 48, by - 99], [bx - 34, by - 99], 9 * fr, 'v2c-binA', 5 * fr);
            W.snowCap(g, 3.2, [bx + 6, by - 99], [bx + 48, by - 99], 10 * fr, 'v2c-binB', 6 * fr);
            W.icicles(g, 3.2, [bx - 40, by - 97], [bx + 44, by - 97], 4, 30, 'v2c-bin', fr, 6);
            g.restore();
        }
    }
    /**
     * A tiny snowman with horns, built in three goes. x, y: the floor under it; s: frame units
     * per unit (it is about 1.0 tall with its horns: s = 104 next to a 132 imp).
     *   o: { base, body, head, face (0..1 each: Song.pop of its hit), d (the drawing: the
     *        twig arm waves on twos once it has a face) }
     */
    function snowman(g, x, y, s, o = {}) {
        const L = 3.2 / s, d = o.d ?? 0;
        const ball = (cx, cy, r, k, seed) => {
            if (k <= 0) return;
            const rn = Motion.rng('v2c-snowman:' + seed), pts = [];
            for (let i = 0; i < 12; i++) {
                const a = (i / 12) * TAU, rr = r * k * (0.95 + 0.09 * rn());
                pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.94]);
            }
            const P2 = C.curve(pts, true, 5);
            C.poly(g, P2, { fill: ICE.snow, ink: ICE.line, lw: L });
            // the shade on its lower right, a light on its upper left
            g.save();
            C.trace(g, P2);
            g.clip();
            g.beginPath();
            g.arc(cx - r * 0.3 * k, cy - r * 0.36 * k, r * 1.12 * k, 0, TAU);
            g.rect(cx + r * 2, cy - r * 2, -r * 4, r * 4);
            g.fillStyle = ICE.snowSide;
            g.fill('evenodd');
            g.restore();
            C.poly(g, P2, { ink: ICE.line, lw: L });
        };
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        const b = clamp(o.base ?? 0, 0, 1.2), m = clamp(o.body ?? 0, 0, 1.2), h = clamp(o.head ?? 0, 0, 1.2), f = clamp(o.face ?? 0, 0, 1.2);
        if (b > 0) {
            g.fillStyle = 'rgba(36,21,49,0.22)';
            g.beginPath();
            g.ellipse(0.03, 0, 0.36 * Math.min(1, b), 0.045, 0, 0, TAU);
            g.fill();
        }
        // twig arms go in behind the body: the left one is a little pitchfork
        if (f > 0) {
            const wv = d % 4 < 2 ? 0 : 0.03, tw = '#6b3a20';
            const armL = [[-0.17, -0.46], [-0.34, -0.56 - wv], [-0.43, -0.7 - wv * 2]];
            for (const [col, lw] of [[K.ink, 0.035 + L * 1.6], [tw, 0.035]]) {
                line(g, armL, lw, col);
                for (const dx of [-0.075, 0, 0.075]) line(g, [[-0.43, -0.7 - wv * 2], [-0.43 + dx * 1.1 - 0.02, -0.82 - wv * 2 + Math.abs(dx) * 0.25]], lw * 0.9, col);
                line(g, [[0.17, -0.47], [0.36, -0.52], [0.44, -0.44]], lw, col);
                line(g, [[0.36, -0.52], [0.43, -0.6]], lw * 0.9, col);
            }
        }
        ball(0, -0.25, 0.27, b, 'a');
        ball(0, -0.6 * (0.6 + 0.4 * Math.min(1, m)), 0.2, m, 'b');
        const hy = -0.89 * (0.7 + 0.3 * Math.min(1, h));
        if (f > 0 && h > 0) {
            // the horns, behind the head's top: an imp's, cream with a darker far side
            for (const sx of [-1, 1]) {
                const hx = sx * 0.095, by = hy - 0.125;
                C.poly(g, [[hx - 0.05, by + 0.03], [hx + sx * 0.04, by - 0.14 * f], [hx + 0.05, by + 0.03]], { fill: sx < 0 ? Devil.P.horn : Devil.P.hornSide, ink: K.ink, lw: L * 0.9 });
            }
        }
        ball(0, hy, 0.17, h, 'c');
        // buttons of coal on the body
        if (m > 0.9) for (const by of [-0.64, -0.54]) circ(g, 0.005, by, 0.022, K.ink, 0);
        if (f > 0 && h > 0) {
            const k = Math.min(1, f);
            // coal eyes with a slant, like the boss; a carrot; a row of coal for a grin, one fang
            for (const sx of [-1, 1]) C.poly(g, [[sx * 0.03, hy - 0.04], [sx * 0.105, hy - 0.075], [sx * 0.1, hy - 0.02], [sx * 0.04, hy - 0.002]], { fill: K.ink, lw: 0 });
            C.poly(g, [[-0.014, hy + 0.005], [0.014, hy + 0.042], [0.17 * k, hy + 0.05]], { fill: K.orange, ink: K.ink, lw: L * 0.8 });
            for (const [mx, my] of [[-0.085, hy + 0.066], [-0.05, hy + 0.092], [-0.01, hy + 0.105], [0.032, hy + 0.098], [0.07, hy + 0.076]]) circ(g, mx, my, 0.016, K.ink, 0);
            C.poly(g, [[0.04, hy + 0.105], [0.07, hy + 0.088], [0.06, hy + 0.145]], { fill: K.white, ink: K.ink, lw: L * 0.6 });
        }
        g.restore();
    }

    /**
     * An imp's two stub arms again, in the imp's own units (inside Weather.onImp): drawn over
     * what it wears when its mitts are up, or the earmuffs' pads would hide them. up: its armUp.
     */
    function impArms(g, s, up) {
        const L = 3 / s, P = Devil.P;
        for (const sx of [-1, 1]) {
            const sh = [sx * 0.48, -0.46], hand = [sx * 0.66, -0.4 - up * 0.5];
            const dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6, ux = dx / len, uy = dy / len, nx = -uy * 0.08, ny = ux * 0.08;
            const pts = [[sh[0] + nx, sh[1] + ny], [hand[0] + ux * 0.08 + nx, hand[1] + uy * 0.08 + ny], [hand[0] + ux * 0.08 - nx, hand[1] + uy * 0.08 - ny], [sh[0] - nx, sh[1] - ny]];
            C.prism(g, sx > 0 ? pts : pts.slice().reverse(), Dd(0.14), { front: P.skin, top: P.skinTop, side: P.skinSide }, { lw: L, ink: P.ink });
        }
    }

    // =========================================================================================
    // The chauffeur's scarf
    // =========================================================================================
    /**
     * A striped scarf round the skeleton chauffeur's neck, wound over his collar and his chin,
     * in his units: draw it right after Rides.skeleton with the same x, y, s.
     *   o: { color, t (its loose end flaps on twos) }
     */
    function skelScarf(g, x, y, s, o = {}) {
        const L = 3.2 / s, color = o.color ?? K.pink, dark = '#b3176e', stripe = '#fffdf4', d = C.drawing(o.t ?? 0);
        const y0 = -1.085, y1 = -0.925, xa = -0.33, xb = 0.33, kx = 0.2, flap = [0, 0.02, -0.012][((d % 3) + 3) % 3];
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        const band = (pts, col, sw) => {
            C.poly(g, pts, { fill: col, lw: 0 });
            if (sw) {
                g.save();
                C.trace(g, pts);
                g.clip();
                sw();
                g.restore();
            }
            C.poly(g, pts, { ink: K.ink, lw: L });
        };
        // the tails first, so the knot sits on them: one hangs down his chest, one sticks out
        const tail = (pts, w) => {
            const n = pts.length, A = [], B = [];
            pts.forEach(([px, py], i) => {
                const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], ddx = b[0] - a[0], ddy = b[1] - a[1], l = Math.hypot(ddx, ddy) || 1;
                A.push([px - (ddy / l) * w, py + (ddx / l) * w]);
                B.push([px + (ddy / l) * w, py - (ddx / l) * w]);
            });
            const shape = [...A, ...B.slice().reverse()];
            C.poly(g, shape, { fill: color, lw: 0 });
            g.save();
            C.trace(g, shape);
            g.clip();
            for (let i = 1; i < n - 1; i += 2) C.poly(g, [A[i], A[i + 1], B[i + 1], B[i]], { fill: stripe, lw: 0 });
            g.restore();
            C.poly(g, shape, { ink: K.ink, lw: L });
            const e = pts[n - 1], p = pts[n - 2], ex = e[0] - p[0], ey = e[1] - p[1], el = Math.hypot(ex, ey) || 1;
            for (const k of [-0.7, 0, 0.7]) line(g, [[e[0] - (ey / el) * w * k, e[1] + (ex / el) * w * k], [e[0] - (ey / el) * w * k + (ex / el) * 0.055, e[1] + (ex / el) * w * k + (ey / el) * 0.055]], L * 0.8);
        };
        tail(C.curve([[kx + 0.03, y1 - 0.05], [kx + 0.13, y1 + 0.02 + flap], [kx + 0.2, y1 + 0.1 + flap * 2], [kx + 0.24, y1 + 0.19 + flap]], false, 3), 0.058);
        tail(C.curve([[kx - 0.01, y1 - 0.04], [kx - 0.005, y1 + 0.09], [kx - 0.02 - flap * 0.5, y1 + 0.2], [kx - 0.01, y1 + 0.3]], false, 3), 0.064);
        // the wrap: round the right side, then across the front
        band([[xb, y0], [xb + D[0] * 0.4, y0 + D[1] * 0.4], [xb + D[0] * 0.4, y1 + D[1] * 0.4], [xb, y1]], dark);
        band([[xa, y0 + 0.01], [xb, y0], [xb, y1], [xa, y1 - 0.004]], color, () => {
            g.fillStyle = stripe;
            for (let sx = xa + 0.07; sx < xb; sx += 0.19) g.fillRect(sx, y0 - 0.02, 0.065, y1 - y0 + 0.04);
        });
        C.poly(g, [[xa, y0 + 0.01], [xa + D[0] * 0.4, y0 + 0.01 + D[1] * 0.4], [xb + D[0] * 0.4, y0 + D[1] * 0.4], [xb, y0]], { fill: '#ff7fbd', ink: K.ink, lw: L });
        // the knot
        g.beginPath();
        g.roundRect(kx - 0.085, y0 - 0.012, 0.17, y1 - y0 + 0.03, 0.045);
        g.fillStyle = dark;
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = L;
        g.stroke();
        g.restore();
    }

    // =========================================================================================
    // The Devil on ice, at the roadside
    // =========================================================================================
    // The face of Weather.iceBlock, by its numbers (its front polygon and its sweep).
    function blockShape(o = {}) {
        const melt = clamp(o.melt ?? 0), Wd = (o.w ?? 2.4) * (1 - 0.1 * melt), H = (o.h ?? 2.75) * (1 - 0.88 * melt), Z = o.d ?? 1.0, cx = o.cx ?? 0.1, f = Dd(-0.3);
        const x0 = cx - Wd / 2 + f[0], x1 = cx + Wd / 2 + f[0], yB = f[1], yT = yB - H;
        const c1 = Math.min(H * 0.45, 0.16 + 0.4 * melt), c2 = Math.min(H * 0.45, 0.12 + 0.3 * melt), c3 = Math.min(H * 0.3, 0.07), c4 = Math.min(H * 0.3, 0.1);
        const chip = H > 1 ? [[x0, yT + H * 0.52], [x0 + 0.07, yT + H * 0.47], [x0, yT + H * 0.4]] : [];
        return { face: [[x0 + c1, yT], [x1 - c2, yT], [x1, yT + c2], [x1, yB - c4], [x1 - c4, yB], [x0 + c3, yB], [x0, yB - c3], ...chip, [x0, yT + c1]], S: Dd(Z), x0, x1, yT, yB, c2 };
    }
    /**
     * The Devil frozen solid: Weather.iceBlock with him inside mid-laugh, the snapped crank in
     * his mitt, and the ice cloudy behind him, so that whatever stands behind the block (his
     * hearse) is only a ghost and he reads on pale blue.
     *   x, y, s   his ground point and scale, as for Devil.draw
     *   o: everything Weather.iceBlock takes (melt, crack, shake, t; w, h, d, cx default to BLOCK) and
     *      milk (0..1, default 0.9: how cloudy the ice is), pose (merged over the frozen pose)
     */
    function frozenDevil(g, x, y, s, o0 = {}) {
        const o = { ...BLOCK, ...o0 }, sh = blockShape(o), milk = clamp(o.milk ?? 0.9) * (1 - 0.5 * clamp(o.melt ?? 0));
        W.iceBlock(g, x, y, s, o, (g2) => {
            g2.save();
            g2.translate(x, y);
            g2.scale(s, s);
            g2.globalAlpha = milk;
            C.prism(g2, sh.face, sh.S, { front: '#cfeaff', top: '#e2f3ff', side: '#b4dafa' }, { lw: 0 });
            g2.restore();
            devilWithCrank(g2, x, y, s, { pose: o.pose, crankFrost: 1 - clamp((o.melt ?? 0) * 4) });
        });
    }
    // Where the block's right edge is (the far edge of its side face), for a mitt that knocks
    // on it: [x, y] in frame units at height `up` (units above the ground).
    const blockSide = (x, y, s, o = {}, up = 1.9) => {
        const sh = blockShape({ ...BLOCK, ...o });
        return [x + (sh.x1 + sh.S[0]) * s, y + (sh.S[1] - up) * s];
    };

    // Knock marks: three short strokes that fan out of (x, y) to the left. k: 1 on the knock's
    // drawing, less on the next. Frame units.
    function knock(g, x, y, k) {
        if (k <= 0) return;
        for (const [a, r0, r1] of [[Math.PI - 0.75, 9, 24], [Math.PI, 11, 30], [Math.PI + 0.75, 9, 24]]) {
            const p = [x + Math.cos(a) * r0, y + Math.sin(a) * r0], q = [x + Math.cos(a) * (r0 + (r1 - r0) * k), y + Math.sin(a) * (r0 + (r1 - r0) * k)];
            line(g, [p, q], 7, ICE.line);
            line(g, [p, q], 3.2, ICE.white);
        }
    }

    // A mound of snow on the ground (frame units): w wide, h high.
    function mound(g, x, y, w, h) {
        if (h <= 0.5) return;
        C.poly(g, C.curve([[x - w / 2, y], [x - w * 0.3, y - h * 0.8], [x - w * 0.05, y - h], [x + w * 0.22, y - h * 0.7], [x + w / 2, y], [x + w * 0.2, y + h * 0.3], [x - w * 0.25, y + h * 0.3]], true, 5), { fill: ICE.snow, ink: ICE.line, lw: 2.7 });
        C.poly(g, [[x - w * 0.2, y - h * 0.2], [x + w * 0.1, y - h * 0.3]], { ink: ICE.snowSide, lw: 2.6, close: false });
    }

    /**
     * The band's car a long way off, still playing under its canvas top: Rig.band drawn small
     * (at 0.62 of its size inside a scale, so its line thins with the distance), a wisp of
     * notes over it. x, y: the ground under its middle, frame units; s: its scale as seen.
     */
    function farBand(g, t, x, y, s, o = {}) {
        const k = 0.62, P = Song.pulseAt(t), d = C.drawing(t);
        g.save();
        g.translate(x, y);
        g.scale(k, k);
        Rig.band(g, t, 0, 0, s / k, {
            spin: o.spin ?? 0, bounce: 0.3 * P.pulse, exhaust: 0.5, sing: true, shadow: false,
            cockpit: { back: (g2, sc0) => W.softTop(g2, sc0, { up: 1, part: 'back' }), front: (g2, sc0) => W.softTop(g2, sc0, { up: 1, part: 'front' }) },
        });
        g.restore();
        // notes: they leave the deck, rise and drift back, one every other beat
        for (let i = 0; i < 3; i++) {
            const f = (((d + i * 8) % 24) + 24) % 24, u = f / 24;
            if (u > 0.8) continue;
            C.note(g, x - (1.2 + 3.4 * u) * s + (i - 1) * 0.5 * s, y - (2.7 + 1.9 * u) * s - Math.sin(u * 9 + i) * 0.14 * s, s * 0.34, { color: i % 2 ? '#e4e7f2' : K.white, ink: K.ink, lw: 2, kind: i % 2 ? 2 : 1, rot: (d % 2 ? 0.1 : -0.1) });
        }
    }

    return { FROZEN, CRANK, BLOCK, NO_CRANK, COG, puffs, flake, frostCorner, devilWithCrank, devilFrost, snappedStub, snowBurst, frozenFlame, bin, snowman, impArms, skelScarf, blockShape, frozenDevil, blockSide, knock, mound, farBand };
})();
