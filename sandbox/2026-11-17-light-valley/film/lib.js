// «Corriente»: what every shot shares. The shots register themselves in Corriente.shots
// (id → draw(blk, t, d, env), t and d local to the shot); scene.js only assembles them.
// Authored in 1280 × 720 units, like the street.
(() => {
    const W = Woodcut, R = Motion.rng;
    const lerp = (a, b, f) => a + (b - a) * f;
    const clamp = W.clamp;
    const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
    const poly = (pts) => (g) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
    const boxOf = (pts) => [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))];
    const fillPoly = (g, pts) => { g.beginPath(); poly(pts)(g); g.fill(); };
    const catenary = (a, b, sag, n = 18) => { const p = []; for (let i = 0; i <= n; i++) { const f = i / n; p.push([lerp(a[0], b[0], f), lerp(a[1], b[1], f) + sag * 4 * f * (1 - f)]); } return p; };
    // a polyline through points (smoothed with quadratic midpoints)
    const smooth = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; g.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); } const l = pts[pts.length - 1]; g.lineTo(l[0], l[1]); };

    // --- night and day -----------------------------------------------------------------
    // Night: the block is inked whole and the light is cut out of it. Day: the block is
    // carved away (paper is the daylight) and the drawing is the black left standing.
    function night(b) { b.ink((g) => g.fillRect(-20, -20, 4000, 4000)); }
    function day(b) { b.cut((g) => g.fillRect(-20, -20, 4000, 4000)); }

    // a region: at night inked and carved to a tone (the share of white); by day inked
    // back to a tone (the share of black) with dashes running dir
    function region(b, pts, o) {
        if (o.dayInk) b.hatch({ ink: true, box: boxOf(pts), clip: poly(pts), fit: o.fit ?? 8, ...o, tone: o.dayInk });
        else { b.ink((g) => fillPoly(g, pts)); b.hatch({ box: boxOf(pts), clip: poly(pts), fit: o.fit ?? 8, ...o }); }
    }
    // a night sky of long horizontal cuts, lighter towards the horizon
    function nightSky(b, box, horizon, o = {}) {
        const [x0, y0, x1] = box;
        b.hatch({ box, dir: 0, sp: 3.4, len: [18, 140], gap: [10, 60], wMin: 1, wMax: 5, fit: 8, seed: o.seed ?? 'sky', jitter: 0.5, clip: o.clip,
            tone: (x, y) => ((o.top ?? 0.05) + (o.low ?? 0.36) * sstep(y0, horizon, y)) * (0.55 + 0.9 * W.noise2((o.seed ?? 'sky') + 'b', x / 280, y / 12)) * (o.gain ?? 1) });
        void x1;
    }
    // a day sky: paper with a few long black streaks of cloud
    function daySky(b, box, o = {}) {
        b.hatch({ ink: true, box, dir: 0, sp: 4, len: [30, 200], gap: [30, 160], wMin: 1, wMax: 5, fit: 10, seed: o.seed ?? 'daysky', jitter: 0.6, clip: o.clip,
            tone: (x, y) => (o.dark ?? 0.16) * Math.max(0, W.noise2((o.seed ?? 'daysky') + 'c', x / 240, y / 30) - 0.35) * 2.2 });
    }
    // a mountain range under a skyline function. Its relief: the fall line from the skyline's
    // slope (smoothed, so peaks and saddles turn the cuts gently) plus ridged noise for spurs
    // and gullies; faces turned to the moon (upper left) carry the most cuts. Night: cut to
    // that tone; day (o.day): black dashes laid by the same field, more on the faces away.
    function range(b, sky, x0, x1, yBottom, o = {}) {
        const seed = o.seed ?? 'range', hs = Motion.hashStr(seed), A = o.relief ?? 1.6, sx = o.sx ?? 70, sy = o.sy ?? 46;
        const pts = [[x0, yBottom]];
        for (let x = x0; x <= x1; x += 8) pts.push([x, sky(x)]);
        pts.push([x1, yBottom]);
        const ridged = (x, y) => 1 - Math.abs(2 * W.noise2(hs, x / sx, y / sy) - 1);
        const field = (x, y) => {
            const s = (sky(x + 30) - sky(x - 30)) / 60, depth = y - sky(x);
            const spur = (ridged(x + 4, y) - ridged(x - 4, y)) / 8 * sx * A * sstep(4, 50, depth);
            const vx = s * 1.7 * (1 - 0.5 * sstep(80, 300, depth)) + spur, vy = 1, L = Math.hypot(vx, vy);
            return [vx / L, vy / L, depth];
        };
        const dir = (x, y) => { const [vx, vy] = field(x, y); return Math.atan2(vy, vx); };
        const lit = (x, y) => C.clamp(0.45 - 1.1 * field(x, y)[0]);
        if (o.day) {
            b.hatch({ ink: true, box: boxOf(pts), clip: poly(pts), dir, sp: 4.4, len: [10, 34], gap: [8, 24], run: [1, 3], wMin: 1, wMax: 4, fit: 8, seed,
                tone: (x, y) => (o.ink ?? 0.34) * (0.25 + 1.2 * (1 - lit(x, y))) * (0.75 + 0.5 * ridged(x * 0.5, y * 0.5)) });
            b.ink((g) => { const r = R(seed + 'edge'); W.groove(g, pts.slice(1, -1).map(([x, y]) => [x, y + 1]), 1.6, r, { taper: 8 }); });
        } else {
            b.ink((g) => fillPoly(g, pts));
            b.hatch({ box: boxOf(pts), clip: poly(pts), dir, sp: 4.2, len: [10, 36], gap: [8, 22], run: [1, 3], wMin: 1.1, wMax: 4.5, fit: 8, seed,
                tone: (x, y) => { const d = y - sky(x); return (o.lit ?? 0.28) * (0.12 + 1.25 * lit(x, y) ** 1.4) * (1 - 0.55 * sstep(30, 300, d)) * (0.7 + 0.6 * ridged(x * 0.6, y * 0.6)) + 0.06 * sstep(-4, 6, -d + 8); } });
            b.cut((g) => { const r = R(seed + 'ridge'); for (let x = x0; x < x1; x += 12 + r() * 22) { const L = 8 + r() * 24; if (r() < 0.55) W.groove(g, [[x, sky(x) + 2], [x + L, sky(x + L) + 2]], 1.1 + r() * 1.2, r, { taper: 4 }); } });
        }
        return pts;
    }
    const C = { clamp };
    // a house front (night): the wall in rubble stone, a gabled roof in tiles, edges cut
    function house(b, o) {
        const { x, y, w, h, roof = 0.45, side = 0 } = o, peak = y - w * roof * 0.5;
        const wall = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
        const rf = [[x - 4, y + 2], [x + w / 2, peak], [x + w + 4, y + 2]];
        b.ink((g) => { fillPoly(g, wall); fillPoly(g, rf); if (side) fillPoly(g, [[x + w, y], [x + w + side, y - side * 0.3], [x + w + side, y + h - side * 0.2], [x + w, y + h]]); });
        b.cut((g) => { g.save(); g.beginPath(); poly(wall)(g); g.clip(); W.masonry(g, wall, { courses: Math.max(3, Math.round(h / 7)), stone: [6, 15], tone: () => o.stone ?? 0.18, seed: 'h' + x + '-' + y }); g.restore(); });
        b.hatch({ box: boxOf(rf), clip: poly(rf), dir: 0, sp: 3, len: [5, 14], gap: [3, 8], wMin: 0.9, wMax: 2.6, fit: 5, tone: o.roofTone ?? 0.3, seed: 'rf' + x + '-' + y });
        b.cut((g) => { const r = R('he' + x + y); W.groove(g, [[x - 5, y + 3], [x + w / 2, peak - 1], [x + w + 5, y + 3]], 1.6, r, { taper: 3 }); });
        return { wall, peak };
    }

    // --- people -----------------------------------------------------------------------------
    // A figure drawn as a woodcut silhouette from a pose: joints in units, the limbs as
    // thick tapered strokes, a torso polygon, a head with a cap or a kerchief. Ink by
    // default; o.rim cuts a light edge along the side the light comes from (dx, dy).
    function figure(g, P, o = {}) {
        const lw = o.limb ?? 9, s = o.scale ?? 1;
        const seg = (a, c, w0, w1) => {
            if (!a || !c) return;
            const dx = c[0] - a[0], dy = c[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
            g.beginPath();
            g.moveTo(a[0] + nx * w0 / 2, a[1] + ny * w0 / 2); g.lineTo(c[0] + nx * w1 / 2, c[1] + ny * w1 / 2);
            g.lineTo(c[0] - nx * w1 / 2, c[1] - ny * w1 / 2); g.lineTo(a[0] - nx * w0 / 2, a[1] - ny * w0 / 2); g.closePath(); g.fill();
            g.beginPath(); g.arc(c[0], c[1], w1 / 2, 0, 7); g.fill();
            g.beginPath(); g.arc(a[0], a[1], w0 / 2, 0, 7); g.fill();
        };
        // torso: shoulders to hips, a little wider at the shoulders (work clothes hang)
        const [sl, sr, hl, hr] = [P.shoulderL, P.shoulderR, P.hipL, P.hipR];
        fillPoly(g, [[sl[0] - 2 * s, sl[1]], [sr[0] + 2 * s, sr[1]], [hr[0] + 1.5 * s, hr[1]], [hl[0] - 1.5 * s, hl[1]]]);
        if (o.skirt) fillPoly(g, [hl, hr, [hr[0] + o.skirt * s, hr[1] + 46 * s], [hl[0] - o.skirt * s, hl[1] + 46 * s]]);
        // legs, arms (upper thicker than lower), hands and feet as blunt blocks
        for (const [a, b2, c] of [[P.hipL, P.kneeL, P.footL], [P.hipR, P.kneeR, P.footR]]) { seg(a, b2, lw * 1.25 * s, lw * 1.05 * s); seg(b2, c, lw * 1.05 * s, lw * 0.9 * s); if (c) { g.beginPath(); g.ellipse(c[0] + (o.face ?? 1) * 4 * s, c[1] + 1 * s, 7 * s, 3.4 * s, 0, 0, 7); g.fill(); } }
        for (const [a, b2, c] of [[P.shoulderL, P.elbowL, P.handL], [P.shoulderR, P.elbowR, P.handR]]) { seg(a, b2, lw * 1.0 * s, lw * 0.85 * s); seg(b2, c, lw * 0.85 * s, lw * 0.7 * s); if (c) { g.beginPath(); g.arc(c[0], c[1], lw * 0.55 * s, 0, 7); g.fill(); } }
        // neck and head; a flat cap peaked towards where he faces, or a kerchief knotted behind
        const neck = P.neck ?? [(sl[0] + sr[0]) / 2, (sl[1] + sr[1]) / 2 - 3 * s], head = P.head;
        seg([(sl[0] + sr[0]) / 2, (sl[1] + sr[1]) / 2], neck, lw * 0.9 * s, lw * 0.8 * s);
        g.beginPath(); g.ellipse(head[0], head[1], 7.5 * s, 9 * s, o.tilt ?? 0, 0, 7); g.fill();
        if (o.cap) { const f = o.face ?? 1; g.beginPath(); g.ellipse(head[0] - f * 0.5 * s, head[1] - 6 * s, 9 * s, 4.5 * s, (o.tilt ?? 0) - f * 0.12, 0, 7); g.fill(); g.beginPath(); g.ellipse(head[0] + f * 7 * s, head[1] - 4 * s, 6 * s, 2 * s, -f * 0.25, 0, 7); g.fill(); }
        if (o.kerchief) { const f = o.face ?? 1; g.beginPath(); g.ellipse(head[0] - f * 1.5 * s, head[1] - 2 * s, 9.5 * s, 10 * s, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(head[0] - f * 8 * s, head[1] + 4 * s); g.lineTo(head[0] - f * 14 * s, head[1] + 10 * s); g.lineTo(head[0] - f * 6 * s, head[1] + 9 * s); g.closePath(); g.fill(); }
    }
    // folds and the light's edge on a figure, cut thin (drawn after figure, in cut mode)
    function figureCuts(g, P, o = {}) {
        const r = R(o.seed ?? 'fig'), s = o.scale ?? 1, w = (o.w ?? 1.3) * s;
        const along = (a, c, f0, f1, side) => { if (!a || !c) return; const dx = c[0] - a[0], dy = c[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * side, ny = dx / L * side, off = (o.limb ?? 9) * 0.38 * s; W.gouge(g, a[0] + dx * f0 + nx * off, a[1] + dy * f0 + ny * off, a[0] + dx * f1 + nx * off, a[1] + dy * f1 + ny * off, w, r, { asym: 1 }); };
        const side = o.side ?? 1;
        along(P.shoulderL, P.hipL, 0.15, 0.85, -side); along(P.hipL, P.kneeL, 0.1, 0.8, -side); along(P.kneeL, P.footL, 0.1, 0.7, -side);
        along(P.shoulderL, P.elbowL, 0.1, 0.85, -side); along(P.elbowL, P.handL, 0.1, 0.7, -side);
        along(P.hipR, P.kneeR, 0.2, 0.8, -side); along(P.shoulderR, P.elbowR, 0.15, 0.8, -side);
        // a fold or two across the coat and trousers
        for (let i = 0; i < (o.folds ?? 3); i++) { const f = 0.25 + 0.5 * r(), a = P.shoulderL, c = P.hipR; W.gouge(g, lerp(a[0], c[0], f) - 4 * s, lerp(a[1], c[1], f), lerp(a[0], c[0], f) + 5 * s, lerp(a[1], c[1], f) + 3 * s, w * 0.8, r); }
    }
    // lerp between two poses (for in-betweens on twos)
    const mixPose = (A, B, f) => { const P = {}; for (const k of Object.keys(A)) P[k] = B[k] ? [lerp(A[k][0], B[k][0], f), lerp(A[k][1], B[k][1], f)] : A[k]; return P; };
    const movePose = (A, dx, dy, s = 1) => { const P = {}; for (const k of Object.keys(A)) P[k] = [A[k][0] * s + dx, A[k][1] * s + dy]; return P; };

    // --- lights ------------------------------------------------------------------------------
    // A small flame (candle, oil lamp, match): carved as a teardrop of paper, a few nicks
    // around it; never ochre (ochre is electric light only)
    function flame(b, x, y, h, d, o = {}) {
        const sway = Math.sin(d * 1.7 + (o.ph ?? 0)) * h * 0.08 + (o.lean ?? 0);
        b.cut((g) => {
            g.beginPath(); g.moveTo(x + sway * 1.6, y - h); g.quadraticCurveTo(x + h * 0.32, y - h * 0.3, x, y); g.quadraticCurveTo(x - h * 0.32, y - h * 0.3, x + sway * 1.6, y - h); g.fill();
            if (o.halo) { const r = R('halo' + x + '-' + (d % 3)); W.rays(g, x, y - h * 0.4, 0, Math.PI * 2, h * 0.9, h * (o.halo ?? 2.4), Math.round(10 + h), 1.1, 'halo' + x + (d % 3)); void r; }
        });
    }
    // an electric bulb that comes on at drawing k: carved, ochre around, never on the glass
    function bulb(b, x, y, rx, ry, k, o = {}) {
        if (k < 0) return;
        const glass = (g) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); };
        b.cut(glass);
        b.ochre((g) => { g.beginPath(); g.ellipse(x, y, rx * (o.ring ?? 2.2), ry * (o.ring ?? 2.2), 0, 0, 7); g.fill(); g.globalCompositeOperation = 'destination-out'; glass(g); });
        if (o.rays && k >= 1) b.cut((g) => W.rays(g, x, y, 0, Math.PI * 2, rx * 1.4, rx * o.rays * clamp(k / 3), Math.round(14 + rx), 1.2, 'bulbrays' + x));
    }

    globalThis.Corriente = {
        shots: {}, cues: [],
        W, R, lerp, clamp, sstep, poly, boxOf, fillPoly, catenary, smooth,
        night, day, region, nightSky, daySky, range, house, figure, figureCuts, mixPose, movePose, flame, bulb,
    };
})();
