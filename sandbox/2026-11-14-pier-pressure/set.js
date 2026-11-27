// pier-pressure · the set: Gull Harbor, a cold-water fishing and surf town under the genre's
// flat yellow sky, seen by the film's one camera (cam.js: 0.6 m above the quay, level, horizon
// at y = 552). Every object is placed in the world in metres and drawn by projecting its
// geometry through Cam; nothing is sized or slanted by eye.
//
//   Harbor.back(g, env, t)   paints the whole 1600×900 frame, opaque
//   Harbor.counter(g, env)   the hut's counter and what stands on it, again (over whoever serves)
//   Harbor.fore(g, env, t)   the props that stand in front of the cast (transparent elsewhere)
//   Harbor.AT                where things are, in world metres and in screen units: kit (a
//                            landing spot), dot { foot, hatch, clip }, bollard.top, lip, pier, fore…
//
// THE WORLD'S PLAN (metres; X right, Y up from the quay, Z away from the camera at the origin)
//
//   quay            the plane Y = 0 out to its lip: the line through (0, 11.8) running 0.6 rad
//                   off the picture plane, nearer to the right (Z = 11.8 − 0.684 X). Paving in
//                   courses 1.4 deep and slabs 2.1 long laid with the lip; coping 0.45; yellow line
//   water           Y = −1.5 beyond the lip (from 0.6 m up we only see it past Z ≈ 40)
//   chip hut        box 3 × 2.4 × 2.2 at (−3.25, 8.3), yaw 0.16: hatch 1.6 × 0.9 with its sill at
//                   1.05; counter 1.86 × 0.4; awning 2 × 0.9 falling 0.46; roof board 3.3 × 2.56;
//                   sign 2.6 × 0.9 on the roof (2.74–3.64 up); flue to 3.75. Round it: crates and a
//                   sack (front left), menu A-board 0.62 × 0.8 (lower than the counter), bin 0.54 × 0.93, gas bottle 0.74,
//                   longboard 2.3 leaning on the side wall
//   café table      (−1.3, 10.4): top 0.8 across at 0.75; stools 0.45; parasol 1.9 across, 2.3 high
//   palm            foot (−1.74, 11.48), 5.6 tall (its crown leaves the frame); far palms 5.6–7
//   lip             rail 1.0 high (posts 1.5 apart), ladder hoops 1.05, a bollard 0.5 with its line
//   pier            leaves the lip square to it from (4.0, 9.06): deck 3 × 26 at Y = 0, a bay
//                   3 × 2.7 on its far side; bents of two piles every 3 m down to the water, cross
//                   braced; rails 1.0; lamps 4.6; flagstaff 5.4 at its end
//   bait shed       box 2.4 × 2.2 × 2 on the bay (centre 5.9 m out), ridge 2.85, gable to the quay:
//                   door 0.84 × 1.92, window 0.74 × 0.66, board BAIT 1.48 × 0.43
//   gateway         two posts 4.1 high where the pier leaves the lip, the board GULL HARBOR
//                   3.1 × 1.4 between 2.6 and 4.0 up, facing the quay; life ring 0.66 on its board
//   dinghy          3 × 1.2, keel 0.2 up on a launching trolley (wheels 0.4), at (3.3, 6.75), bow
//                   towards us (yaw 2.45)
//   trawler A       14 × 4.4 at (5.6, 75), wheelhouse 2.7, mast 7 above the deck
//   trawler B       12 × 4 at (109, 170); rowing boat 3.6 × 1.3 at (−7.6, 52); buoys 0.65
//   far wall        from (−96, 114) to (10.5, 96), 2.3 above the water, rail 1.0, palms 5.6–6.4
//   headland        flat cards at 176 (lower terrace: houses 4.4–5.4 wide, 5.6–8 to the eaves),
//                   205 (upper terrace, chapel), 240 (the hill, 8 m telegraph poles); lighthouse a
//                   round tower 16.4 + lantern (23 in all) at Z = 246
//   foreground      lobster pots 0.64 × 0.47 × 0.4 at (−1.42, 2.42) and (−1.2, 3.1); coil of rope
//                   0.6 across at (−0.62, 2.3), beside them; cone 0.5 at (0.8, 2.34); bollard 0.5
//                   at (1.5, 2.5) with its line. They keep to the corners (|X| > 0.6, Z < 3.3): the cast plays
//                   between and behind them
//
// Depth order: sky · water · headland · far wall | glints | boats · pier · quay · what stands on
// it · dinghy | flags · palm (swaying) | café · hut · round the hut | bunting · gulls — the cast
// (Dot between the hut's inside and Harbor.counter) — foreground props far to near.
// Static parts are cached (Motion.sprite); what moves is drawn on twos.
(() => {
    const T = SkateToon, C = T.COL;
    const W = 1600, H = 900, EYE = Cam.EYE, F = Cam.F, CX = Cam.CX, H0 = Cam.H0;
    const BG = T.LINE_BG, EYE3 = [0, EYE, 0], UP = [0, 1, 0];
    let K = 1; // output pixels per logical unit (env.k), for lettering painted on its own canvas

    // the town's own colours, in the family of SkateToon.COL
    const P = {
        quay: '#b9b2c6', coping: '#d9d4e1', wet: '#7d9c8d', iron: '#4f5b6c', ironLight: '#76849a',
        hill: '#a3c26e', hillDeep: '#7fa64f', cliff: '#d9b77c', rock: '#8f93a6', wall: '#a7a1b6', wallTop: '#cdc8d6',
        slate: '#5f7388', tile: '#d0603a', cream: '#fff3d6', coral: '#f26b5b', fish: '#1cc0bb', fishDeep: '#17a3a0',
        hut: '#84ccbc', hutSide: '#69b5a5', hutDeep: '#4f9a8c', inside: '#22495a', insideDeep: '#183645', navy: '#1c4f8f', boot: '#c8372d',
        deck: '#cdb260', woodFar: '#9a8233', under: '#665002', rope: '#e8cf8a', net: '#3f9a7a', netPale: '#a8d6b4',
        spar: '#f3dc9a', lilac: '#c3b0dd', lilacDeep: '#a893c9', pink: '#f7a8bb', paleBlue: '#9cc3e4', chalk: '#2f3a3c', sack: '#d8b47a',
        soil: '#8a6a3c', parasolUnder: '#f4d9a8',
    };

    // --- vectors, projection ---------------------------------------------------------------
    const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
    const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const len3 = (a) => Math.hypot(a[0], a[1], a[2]);
    const unit = (a) => mul(a, 1 / (len3(a) || 1));
    const lerp3 = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
    const mix = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    const pt = Cam.pt, sc = Cam.scale;
    const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
    // the set's line: 2.2 near, thinning with distance, never below 1.4
    const lw = (Z) => clamp(BG - (Z - 10) * 0.012, 1.4, BG);

    // a frame standing on the ground: local x to its right, y up, z away, turned by yaw
    function frame(o, yaw = 0) {
        const c = Math.cos(yaw), s = Math.sin(yaw);
        const w = (x, y, z) => [o[0] + x * c + z * s, o[1] + y, o[2] - x * s + z * c];
        return { o, yaw, w, s: (x, y, z) => pt(w(x, y, z)), X: [c, 0, -s], Z: [s, 0, c] };
    }
    // a plane in the world: o its origin, u to the right and v up as we see it (unit vectors);
    // p(a, b, c) is the screen point a metres along u, b along v and c out towards the camera
    function plane(o, u, v) {
        let n = cross(u, v);
        if (dot3(n, sub(EYE3, o)) < 0) n = mul(n, -1);
        const w = (a, b, c = 0) => [o[0] + u[0] * a + v[0] * b + n[0] * c, o[1] + u[1] * a + v[1] * b + n[1] * c, o[2] + u[2] * a + v[2] * b + n[2] * c];
        const p = (a, b, c = 0) => pt(w(a, b, c));
        // a rectangle on it, as a screen quad [tl, tr, br, bl]
        const q = (a0, b0, a1, b1, c = 0) => [p(a0, b1, c), p(a1, b1, c), p(a1, b0, c), p(a0, b0, c)];
        return { o, u, v, n, w, p, q };
    }
    const facePlane = (f) => {
        const [tl, tr, br, bl] = f.pts3, pl = plane(bl, unit(sub(br, bl)), unit(sub(tl, bl)));
        pl.W = len3(sub(br, bl));
        pl.H = len3(sub(tl, bl));
        return pl;
    };
    // the walls of a box standing in a frame, as planes (u from the wall's left as we face it)
    const wallOf = (fr, w, d, which) =>
        which === 'front' ? plane(fr.w(-w / 2, 0, -d / 2), fr.X, UP) : which === 'right' ? plane(fr.w(w / 2, 0, -d / 2), fr.Z, UP) : which === 'left' ? plane(fr.w(-w / 2, 0, d / 2), mul(fr.Z, -1), UP) : plane(fr.w(w / 2, 0, d / 2), mul(fr.X, -1), UP);

    // --- drawing helpers -------------------------------------------------------------------
    const Kc = (pts) => pts.map(([x, y]) => [x, y, 1]);
    // (these four draw in screen units: whatever the distance, their line is never under 1.3)
    const thin = (o) => ({ ...o, w: Math.max(1.3, o.w ?? BG) });
    const ln = (g, pts, o = {}) => T.line(g, pts, thin(o));
    const sh = (g, pts, o = {}) => T.shape(g, pts, thin(o));
    const poly = (g, pts, o = {}) => T.shape(g, Kc(pts), thin(o));
    const slab = (g, q, o = {}) => T.slab(g, q, thin(o));
    const dot = (g, x, y, r, col = C.ink) => {
        g.fillStyle = col;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
    };
    const at = (q, u, v) => mix(mix(q[0], q[1], u), mix(q[3], q[2], u), v);
    // a straight bar between two screen points, wa wide at a and wb at b, ruled like a slab
    const bar = (g, a, b, wa, wb, o = {}) => {
        const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / d, ny = (b[0] - a[0]) / d;
        const q = [[a[0] + (nx * wa) / 2, a[1] + (ny * wa) / 2], [b[0] + (nx * wb) / 2, b[1] + (ny * wb) / 2], [b[0] - (nx * wb) / 2, b[1] - (ny * wb) / 2], [a[0] - (nx * wa) / 2, a[1] - (ny * wa) / 2]];
        T.slab(g, q, thin({ over: 0.7, ...o }));
        return q;
    };
    // a post, a spar, a rail: a bar between two world points, d metres thick
    const bar3 = (g, a, b, d, o = {}) => bar(g, pt(a), pt(b), Math.max(1.2, d * sc(a[2])), Math.max(1.2, (o.d1 ?? d) * sc(b[2])), { w: lw((a[2] + b[2]) / 2), ...o });
    const ln3 = (g, pts3, o = {}) => ln(g, pts3.map(pt), { w: lw(pts3[0][2]), ...o });
    // a box by its faces, far to near. o.fill: a colour or { front, right, left, back, top, bottom, all };
    // o.face(f, plane) draws on each face after it is filled
    function boxOf(g, o3, size, yaw, o = {}) {
        const faces = Cam.box(o3, size, yaw);
        for (const f of faces) {
            const fill = typeof o.fill === 'object' ? (o.fill[f.name] ?? o.fill.all) : o.fill;
            T.slab(g, f.pts, { fill, w: o.w ?? lw(o3[2]), seed: (o.seed ?? 'box') + f.name, over: o.over ?? 1 });
            if (o.face) o.face(f, facePlane(f));
        }
        return faces;
    }
    // the convex outline of a cloud of screen points
    function hull2d(pts) {
        const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
        const lo = [], up = [];
        for (const q of p) {
            while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
            lo.push(q);
        }
        for (let i = p.length - 1; i >= 0; i--) {
            const q = p[i];
            while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
            up.push(q);
        }
        lo.pop();
        up.pop();
        return lo.concat(up);
    }
    // the hand: a slow drift that depends only on where a point is, so pieces that share an
    // edge still meet
    const wob = (p, seed) => [p[0] + Motion.noise1(seed + 'x', (p[0] + p[1] * 0.7) / 23) * 0.6, p[1] + Motion.noise1(seed + 'y', (p[1] - p[0] * 0.6) / 23) * 0.6];
    // several overlapping pieces as one silhouette: every outline inked twice as wide, then
    // every piece filled on top, so only the union keeps its line
    function union(g, polys, o = {}) {
        const { fill = P.iron, w = BG, seed = 'u', color = C.ink } = o;
        const ps = polys.filter((q) => q.length > 2).map((q) => T.pathOf(q.map((p) => wob(p, seed))));
        g.lineJoin = 'round';
        g.lineCap = 'round';
        g.strokeStyle = color;
        g.lineWidth = 2 * w;
        for (const p of ps) g.stroke(p);
        g.fillStyle = fill;
        g.strokeStyle = fill;
        g.lineWidth = 0.7;
        for (const p of ps) {
            g.fill(p);
            g.stroke(p);
        }
    }
    // a horizontal circle (or an arc of it) in the world
    const ring3 = (c, r, n = 20, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: a1 - a0 > 6.28 ? n : n + 1 }, (_, i) => {
        const a = a0 + ((a1 - a0) * i) / n;
        return [c[0] + Math.cos(a) * r, c[1], c[2] + Math.sin(a) * r];
    });
    // the half of it that faces the camera, on screen
    const nearArc = (c, r, n = 12) => {
        const d = Math.hypot(c[0], c[2]), a0 = Math.atan2(-c[2], -c[0]), h = Math.acos(Math.min(1, r / d));
        return ring3(c, r, n, a0 - h, a0 + h).map(pt);
    };
    /**
     * A turned shape standing on c: prof is its profile [[radius, height], …] from the bottom up,
     * each ring a projected circle. o.bands: [[y0, y1, colour], …] painted round it; o.rings:
     * heights of lines round it; the top is drawn when we look down on it, the underside when
     * we look up at it.
     */
    function lathe(g, c, prof, o = {}) {
        const { fill = P.iron, seed = 'lathe', n = 18, bands = [], rings = [] } = o, w = o.w ?? lw(c[2]);
        const C3 = (y) => [c[0], c[1] + y, c[2]];
        const circ = prof.map(([r, y]) => ring3(C3(y), Math.max(r, 0.002), n).map(pt));
        const parts = [];
        for (let i = 0; i < prof.length - 1; i++) parts.push(hull2d([...circ[i], ...circ[i + 1]]));
        union(g, parts, { fill, w, seed });
        const rAt = (y) => {
            for (let i = 0; i < prof.length - 1; i++) if (y >= prof[i][1] - 1e-9 && y <= prof[i + 1][1] + 1e-9) return prof[i][0] + ((prof[i + 1][0] - prof[i][0]) * (y - prof[i][1])) / (prof[i + 1][1] - prof[i][1] || 1);
            return prof[prof.length - 1][0];
        };
        for (const [y0, y1, col] of bands) {
            g.fillStyle = col;
            // between the two arcs that face us (the hull of the whole rings would show the far
            // side of one of them, as if we looked into the shape)
            g.fill(T.pathOf([...nearArc(C3(y0), rAt(y0), 14), ...nearArc(C3(y1), rAt(y1), 14).reverse()]));
            for (const y of [y0, y1]) T.line(g, nearArc(C3(y), rAt(y)), { w, seed: seed + 'b' + y, dense: true, amp: 0.15, taper: false });
        }
        for (const y of rings) T.line(g, nearArc(C3(y), rAt(y)), { w, seed: seed + 'r' + y, dense: true, amp: 0.15, taper: false });
        const [rt, yt] = prof[prof.length - 1], [rb, yb] = prof[0];
        if (o.top !== false && c[1] + yt < EYE && rt > 0.01) T.shape(g, circ[circ.length - 1], { fill: o.topFill ?? fill, w, seed: seed + 'top', dense: true, amp: 0.15 });
        if (o.under !== false && c[1] + yb > EYE && rb > 0.01) T.shape(g, circ[0], { fill: o.underFill ?? fill, w, seed: seed + 'und', dense: true, amp: 0.15 });
    }
    /**
     * A rope on screen, as a laid rope looks: a smooth tube of even thickness, its strands seen as
     * S-shaped lines that cross it on the slant and run tangent to its edges at both ends (the
     * outline of a helix on a cylinder), never a ribbon with straight hatch marks or a string of
     * beads. pts: its centreline; d: its thickness, a number or a function of u (0..1 along it:
     * a rope coming towards the camera thickens); o.caps: 'both' | 'none' | 'start' | 'end' (cut
     * ends are closed; a turn that goes on behind something is left open); o.only: 'lay' draws just
     * the strands (over a tube drawn some other way); thin ropes are a line.
     */
    function rope(g, pts, d, o = {}) {
        const { fill = P.rope, seed = 'rope', w = BG, dense = false, lay = true, caps = 'both', only = null } = o;
        const dAt = typeof d === 'function' ? d : () => d, dm = dAt(0.5);
        const c = T.resample(dense ? pts : T.path(pts), Math.max(1.1, dm * 0.42));
        const n = c.length;
        if (n < 2) return;
        if (dm < 4.5) return void T.shape(g, T.ribbon(c, dm, dm, { dense: true }), { fill, w: Math.min(w, dm * 0.4), seed, dense: true, amp: 0.15 });
        const tan = [], L = [], R = [], dd = [];
        for (let i = 0; i < n; i++) {
            const a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
            const t = [(b[0] - a[0]) / l, (b[1] - a[1]) / l], h = dAt(i / (n - 1)) / 2;
            tan.push(t);
            dd.push(h * 2);
            L.push([c[i][0] - t[1] * h, c[i][1] + t[0] * h]);
            R.push([c[i][0] + t[1] * h, c[i][1] - t[0] * h]);
        }
        const trace = (q) => {
            g.beginPath();
            q.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
        };
        g.lineJoin = 'round';
        g.lineCap = 'round';
        if (only !== 'lay') {
        // the tube: its fill, then its two edges (and its cut ends)
        trace([...L, ...R.slice().reverse()]);
        g.closePath();
        g.fillStyle = fill;
        g.fill();
        g.strokeStyle = C.ink;
        g.lineWidth = w;
        for (const q of [L, R]) {
            trace(q);
            g.stroke();
        }
        if (caps === 'both' || caps === 'start') (trace([L[0], R[0]]), g.stroke());
        if (caps === 'both' || caps === 'end') (trace([L[n - 1], R[n - 1]]), g.stroke());
        }
        g.strokeStyle = C.ink;
        if (!lay) return;
        // the lay: one S per strand, from one edge to the other, a little over one thickness on
        g.lineWidth = Math.max(1, w * 0.72);
        for (let i = 0; i + 2 < n; i++) {
            const j = i + 2, k = dd[i] * 0.34, p0 = L[i], p3 = R[j];
            g.beginPath();
            g.moveTo(p0[0], p0[1]);
            g.bezierCurveTo(p0[0] + tan[i][0] * k, p0[1] + tan[i][1] * k, p3[0] - tan[j][0] * k, p3[1] - tan[j][1] * k, p3[0], p3[1]);
            g.stroke();
        }
    }
    // the same from world points: its thickness follows each point's distance
    const rope3 = (g, pts3, d, o = {}) => {
        const sAt = (u) => {
            const x = u * (pts3.length - 1), i = Math.min(pts3.length - 2, Math.floor(x)), f = x - i;
            return d * sc(pts3[i][2] + (pts3[i + 1][2] - pts3[i][2]) * f);
        };
        rope(g, pts3.map(pt), (u) => Math.max(1.6, sAt(u)), { w: lw(pts3[0][2]), dense: pts3.length > 8, ...o });
    };
    // crossed lines clipped into a polygon: netting
    function netting(g, pts, step, o = {}) {
        const { w = 1.6, seed = 'net', color = C.ink } = o;
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const [x, y] of pts) {
            x0 = Math.min(x0, x);
            y0 = Math.min(y0, y);
            x1 = Math.max(x1, x);
            y1 = Math.max(y1, y);
        }
        g.save();
        g.clip(T.pathOf(pts));
        const h = y1 - y0;
        let i = 0;
        for (let x = x0 - h; x < x1 + h; x += step, i++) {
            T.line(g, [[x, y0], [x + h * 0.8, y1]], { w, seed: seed + 'a' + i, color, amp: 0.5 });
            T.line(g, [[x + h * 0.8, y0], [x, y1]], { w, seed: seed + 'b' + i, color, amp: 0.5 });
        }
        g.restore();
    }
    // Drawing flat on a plane: fn(g, k) paints in centimetres (x along u, y down the wall) from
    // the point (a, b); k is screen units per centimetre there (pass widths as BG / k). An
    // affine map, good for things small against their distance.
    function onPlane(g, pl, a, b, fn, c = 0) {
        const o = pl.p(a, b, c), e = 0.25, pu = pl.p(a + e, b, c), pv = pl.p(a, b - e, c);
        const ux = (pu[0] - o[0]) / (e * 100), uy = (pu[1] - o[1]) / (e * 100), vx = (pv[0] - o[0]) / (e * 100), vy = (pv[1] - o[1]) / (e * 100);
        g.save();
        g.transform(ux, uy, vx, vy, o[0], o[1]);
        fn(g, Math.sqrt(Math.abs(ux * vy - uy * vx)));
        g.restore();
    }
    /**
     * Lettering (or any painting) laid on a plane in true perspective: fn(c, k) paints a canvas
     * in centimetres, wcm × hcm, that covers the rectangle from (a, b) (its bottom left) on the
     * plane; k is screen units per centimetre at the plane. The canvas is laid cell by cell,
     * each cell on its own projected quad.
     */
    function decal(g, pl, a, b, wm, hm, fn, o = {}) {
        const mid = pl.w(a + wm / 2, b + hm / 2), s = sc(mid[2]), res = Math.min(9, Math.max(1.2, (s * K * 1.6) / 100)); // canvas px per cm
        const cv = document.createElement('canvas');
        cv.width = Math.ceil(wm * 100 * res);
        cv.height = Math.ceil(hm * 100 * res);
        const c = cv.getContext('2d');
        c.scale(res, res);
        fn(c, s / 100);
        const nx = o.nx ?? Math.max(4, Math.round(wm * 5)), ny = o.ny ?? Math.max(2, Math.round(hm * 4));
        for (let j = 0; j < ny; j++) {
            for (let i = 0; i < nx; i++) {
                const a0 = a + (wm * i) / nx, a1 = a + (wm * (i + 1)) / nx, b1 = b + hm - (hm * j) / ny, b0 = b + hm - (hm * (j + 1)) / ny;
                Motion.quad(g, cv, [pl.p(a0, b1, o.out ?? 0), pl.p(a1, b1, o.out ?? 0), pl.p(a1, b0, o.out ?? 0), pl.p(a0, b0, o.out ?? 0)], 1, { x: (cv.width * i) / nx, y: (cv.height * j) / ny, w: cv.width / nx, h: cv.height / ny });
            }
        }
    }
    // loose lettering with no outline: chalk on a board, paint on a hull
    function chalk(g, str, x, y, size, o = {}) {
        const { color = C.white, rot = 0, seed = 'chalk', align = 'left', font = 'Bangers' } = o;
        const R = Motion.rng(seed);
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.font = `${size}px "${font}"`;
        g.textBaseline = 'alphabetic';
        g.textAlign = 'left';
        g.fillStyle = color;
        const ws = [...str].map((c) => g.measureText(c).width + size * 0.05);
        let cx = align === 'center' ? -ws.reduce((a, b) => a + b, 0) / 2 : 0;
        [...str].forEach((c, i) => {
            g.save();
            g.translate(cx, (R() - 0.5) * size * 0.1);
            g.rotate((R() - 0.5) * 0.12);
            g.fillText(c, 0, 0);
            g.restore();
            cx += ws[i];
        });
        g.restore();
    }
    // the hut's fish (the one on Dot's apron), nose to +x, 2 s long, centred on (x, y)
    function fish(g, x, y, s, o = {}) {
        const { fill = P.fish, w = BG, seed = 'fish', rot = 0, flip = false } = o;
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(((flip ? -1 : 1) * s) / 50, s / 50);
        const l = (w * 50) / s, Z = (pts) => pts.map(([px, py, k]) => [px * 50, py * 50, k]);
        T.shape(g, Z([[1, 0.02, 1], [0.62, -0.3], [0.1, -0.4], [-0.42, -0.2], [-0.62, -0.04, 1], [-1, -0.42, 1], [-0.88, 0.02], [-1, 0.44, 1], [-0.62, 0.1, 1], [-0.4, 0.24], [0.1, 0.4], [0.62, 0.3]]), { fill, w: l, seed });
        T.shape(g, Z([[0.3, -0.36, 1], [0.02, -0.62, 1], [-0.3, -0.3, 1]]), { fill, w: l, seed: seed + 'd' });
        T.line(g, Z([[0.5, -0.26], [0.4, 0], [0.5, 0.25]]), { w: l, seed: seed + 'g' });
        T.line(g, Z([[0.2, 0.1], [0, 0.22], [0.16, 0.3]]), { w: l, seed: seed + 'p' });
        for (const [fx, fy] of [[-0.1, -0.12], [-0.34, -0.02], [-0.1, 0.08]]) T.line(g, Z([[fx, fy - 0.07], [fx - 0.08, fy], [fx, fy + 0.07]]), { w: l * 0.9, seed: seed + 's' + fx });
        dot(g, 36, -4, 3.8, C.white);
        dot(g, 36.8, -4, 2, C.ink);
        T.line(g, Z([[0.86, 0.1], [0.74, 0.14]]), { w: l * 0.9, seed: seed + 'm' });
        g.restore();
    }
    // plank joints on a plane: lines up the wall every `step` metres, some stopping short
    function planksOn(g, pl, a0, a1, b0, b1, step, o = {}) {
        const { seed = 'pl', w = BG, skip = 0.08, across = false, c = 0 } = o;
        const R = Motion.rng(seed), n = Math.round((across ? b1 - b0 : a1 - a0) / step);
        for (let i = 1; i < n; i++) {
            const u = (i + (R() - 0.5) * 0.25) / n, e0 = R(), e1 = R(), sk = R();
            if (sk < skip) continue;
            const v0 = e0 < 0.22 ? e0 * 0.8 : 0, v1 = e1 < 0.22 ? 1 - e1 * 0.8 : 1;
            const A = across ? pl.p(a0 + (a1 - a0) * v0, b0 + (b1 - b0) * u, c) : pl.p(a0 + (a1 - a0) * u, b0 + (b1 - b0) * v0, c);
            const B = across ? pl.p(a0 + (a1 - a0) * v1, b0 + (b1 - b0) * u, c) : pl.p(a0 + (a1 - a0) * u, b0 + (b1 - b0) * v1, c);
            T.line(g, [A, B], { w, seed: seed + i });
        }
    }

    // --- the world's plan (metres) -----------------------------------------------------------
    // The quay's lip runs through L0 along LD (to the right and towards us); PD is the way out
    // over the water, square to it. Quay coordinates: a metres along the lip, b metres back from
    // it (towards the camera). The paving, the coping and the pier all follow these two axes,
    // so their lines run to the same two points of the horizon.
    const PHI = 0.6, L0 = [0, 0, 11.8], LD = [Math.cos(PHI), 0, -Math.sin(PHI)], PD = [Math.sin(PHI), 0, Math.cos(PHI)];
    const Q = (a, b, y = 0) => [L0[0] + LD[0] * a - PD[0] * b, y, L0[2] + LD[2] * a - PD[2] * b];
    const lipZ = (X) => L0[2] - Math.tan(PHI) * X;
    const WATER = -1.5;
    // the pier: s metres out from the lip, c metres across from its near edge (0…3), y up
    const PIER = { a0: 4.85, w: 3, len: 26, bay: [4.4, 7.4, 5.7] };
    const PR = (s, c, y = 0) => Q(PIER.a0 - c, -s, y);
    const HUT = { o: [-3.25, 0, 8.3], yaw: 0.16, w: 3, h: 2.4, d: 2.2, hatch: [0.55, 2.15, 1.05, 1.95] };
    const hutF = frame(HUT.o, HUT.yaw);
    const TABLE = [-1.3, 0, 10.4], PALM = [-1.74, 0, 11.48], PALM_H = 5.6;
    const DINGHY = { o: [3.3, 0, 6.75], yaw: 2.45 };
    const BOAT_A = { at: [5.6, 75], yaw: 2.25 }, BOAT_B = { at: [109, 170], yaw: 2.7 };
    const FORE = {
        potA: { o: [-1.78, 0, 2.6], yaw: 0.5 }, potB: { o: [-1.62, 0, 3.45], yaw: -0.45 }, coil: [-1.02, 0, 2.42],
        cone: [1.66, 0, 3.7], bollard: [1.5, 0, 2.5],
    };

    // a point on the ground, clipped to what the camera can see
    function gline(g, A, B, o = {}) {
        const zn = 1.9;
        if (A[2] < zn && B[2] < zn) return;
        if (A[2] < zn) A = lerp3(A, B, (zn - A[2]) / (B[2] - A[2]));
        if (B[2] < zn) B = lerp3(B, A, (zn - B[2]) / (A[2] - B[2]));
        T.line(g, [pt(A), pt(B)], { w: lw((A[2] + B[2]) / 2), ...o });
    }

    // --- the far shore: flat cards, each at its own depth and sized in metres -----------------
    const card = (Z, dx = 0) => {
        const s = F / Z;
        return { Z, s, w: lw(Z), p: (X, Y) => [CX + s * (X + dx), H0 - s * (Y - EYE)] };
    };
    // the headland's cards are drawn in their own X (0 where the hill meets the frame's middle
    // at 240 m) and stand LAND metres to the side at that depth, in step at the others
    const LAND = -30.8, TOWN = -24.5, land = (Z, L = LAND) => card(Z, (L * Z) / 240);
    // a house drawn in its own units (9 to the metre), set on the card at (X, Y): w × h metres
    function house(g, k, X, Y, wm, hm, o) {
        const { fill, roof = P.slate, lean = 0, tilt = 0, seed, cols = 2, rows = 2, door = C.navy, chim = 0.72, gable = false } = o;
        const [px, py] = k.p(X, Y), z = k.s / 9, l = k.w / z, w = wm * 9, h = hm * 9, rh = (o.rh ?? 1.5) * 9;
        g.save();
        g.translate(px, py);
        g.scale(z, z);
        const tl = [lean, -h], tr = [w + lean * 0.6, -h + tilt], br = [w, 2], bl = [0, 2], q = [tl, tr, br, bl];
        const S = (qq, oo) => T.slab(g, qq, { w: l, ...oo });
        // the chimney stands behind the roof: a stack and two pots
        const cx = tl[0] + w * chim, cy = tl[1] - rh + tilt * chim;
        S([[cx - 4.5, cy - 9], [cx + 4.5, cy - 8.4], [cx + 4.8, cy + 6], [cx - 4.8, cy + 6]], { fill: P.cliff, seed: seed + 'c', over: 1 });
        for (const d of [-2.2, 2.2]) S([[cx + d - 1.4, cy - 13.4], [cx + d + 1.4, cy - 13.4], [cx + d + 1.6, cy - 9], [cx + d - 1.6, cy - 9]], { fill: P.tile, seed: seed + 'p' + d, over: 0.6 });
        if (gable) {
            T.shape(g, Kc([[tl[0] - 2, tl[1]], [mix(tl, tr, 0.5)[0], tl[1] - rh * 1.5], [tr[0] + 2, tr[1]], br, bl]), { fill, w: l, seed });
            const rf = [[tl[0] - 4, tl[1] + 1, 1], [mix(tl, tr, 0.5)[0], tl[1] - rh * 1.5 - 2, 1], [tr[0] + 4, tr[1] + 1, 1]];
            T.line(g, rf, { w: l * 2.6, seed: seed + 'rf' });
            T.line(g, rf, { w: l * 1.2, seed: seed + 'rf', color: roof, amp: 0.3 });
        } else {
            S([[tl[0] + w * 0.1, tl[1] - rh * 1.05], [tr[0] - w * 0.08, tr[1] - rh], [tr[0] + 3, tr[1] + 1], [tl[0] - 3, tl[1] + 1]], { fill: roof, seed: seed + 'r', over: 1.2 });
            const R = Motion.rng(seed + 'rt');
            for (let i = 0; i < 3; i++) {
                const u = 0.15 + R() * 0.6, v = 0.3 + R() * 0.45;
                T.line(g, [[tl[0] + w * u, tl[1] - rh * (1 - v)], [tl[0] + w * (u + 0.14), tl[1] - rh * (1 - v) + tilt * 0.14]], { w: l, seed: seed + 'rt' + i });
            }
            S(q, { fill, seed, over: 1.2 });
        }
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (r === rows - 1 && c === 0 && door) continue;
                const u0 = (c + 0.24) / cols, u1 = (c + 0.76) / cols, v0 = (r + 0.22) / (rows + 0.25), v1 = (r + 0.74) / (rows + 0.25);
                const wq = [at(q, u0, v0), at(q, u1, v0), at(q, u1, v1), at(q, u0, v1)];
                T.pane(g, wq, { w: l, seed: seed + 'w' + r + c, gleams: 1 });
                S([[wq[3][0] - 1.5, wq[3][1]], [wq[2][0] + 1.5, wq[2][1]], [wq[2][0] + 1.5, wq[2][1] + 2.2], [wq[3][0] - 1.5, wq[3][1] + 2.2]], { fill: C.white, seed: seed + 'ws' + r + c, over: 0.4 });
            }
        }
        if (door) {
            const u0 = 0.2 / cols, u1 = 0.78 / cols, v0 = (rows - 1 + 0.2) / (rows + 0.25);
            S([at(q, u0, v0), at(q, u1, v0), at(q, u1, 1), at(q, u0, 1)], { fill: door, seed: seed + 'd', over: 0.8, edges: [0, 1, 3] });
            dot(g, ...at(q, u1 - 0.06, v0 + (1 - v0) * 0.55), 1, C.roadLine);
        }
        g.restore();
    }
    // a palm of the kit, far away: foot on the card at (X, Y), hm metres tall
    const farPalm = (g, k, X, Y, hm, o = {}) => T.palm(g, ...k.p(X, Y), hm * k.s, { w: k.w, fronds: 6, lean: (o.lean ?? 0.6) * k.s, seed: o.seed ?? 'fp' + X });

    function headland(g) {
        // the hill: high behind the hut, falling to the point where the light stands
        const k = land(240), w = k.w, kp = (X, Y, c) => [...k.p(X, Y), c];
        sh(g, [kp(-200, -1.5, 1), kp(-200, 44), kp(-120, 47), kp(-70, 38), kp(-38, 27), kp(-10, 17), kp(10, 10), kp(24, 6.5), kp(32, 5.2), kp(38, 4, 1), kp(41, -1.5, 1)], { fill: P.hill, w, seed: 'hill' });
        // the cliff under the light, hedges, grass
        sh(g, [kp(2, -1.5, 1), kp(6, 2.2), kp(16, 3), kp(27, 3.6), kp(35, 3.2), kp(38.6, 3.8, 1), kp(41, -1.5, 1)], { fill: P.cliff, w, seed: 'cliff' });
        T.ticks(g, [k.p(5, 1.6), k.p(38, 2.6), k.p(40, -1), k.p(4, -1)], { n: 9, dir: 1.4, spread: 0.3, len: [3, 6], w, seed: 'cliff-t', pair: 0.5 });
        ln(g, [k.p(-30, 17), k.p(-16, 15.5), k.p(-4, 11), k.p(8, 8.4)], { w, seed: 'hedge-a' });
        ln(g, [k.p(12, 7.4), k.p(20, 4.6), k.p(30, 4.4)], { w, seed: 'hedge-b' });
        T.ticks(g, [k.p(-40, 22), k.p(28, 5.6), k.p(28, 3.6), k.p(-40, 6)], { n: 12, dir: -1.1, spread: 0.3, len: [3, 6], w, seed: 'hill-t', pair: 0.7 });
        // telegraph poles down the skyline, 8 m each, their wires sagging from one to the next
        const poles = [[-52, 31.5], [-24, 21.5], [2, 12.6], [20, 7.4]];
        for (const [i, [X, Y]] of poles.entries()) {
            const [nX, nY] = i ? poles[i - 1] : [-84, 42];
            for (const d of [0, 1.1]) ln(g, [k.p(nX, nY + 7.2 - d), k.p((nX + X) / 2, (nY + Y) / 2 + 4.6 - d), k.p(X, Y + 7.2 - d)], { w: w * 0.9, seed: 'wire' + i + d, amp: 0.2 });
        }
        for (const [X, Y] of poles) {
            bar(g, k.p(X, Y - 0.5), k.p(X + 0.2, Y + 8), 0.55 * k.s, 0.45 * k.s, { fill: C.trunk, w, seed: 'pole' + X });
            ln(g, [k.p(X - 1.4, Y + 7.3), k.p(X + 1.7, Y + 7.5)], { w: w * 1.3, seed: 'pole-x' + X });
            ln(g, [k.p(X - 1, Y + 6.1), k.p(X + 1.3, Y + 6.3)], { w: w * 1.3, seed: 'pole-y' + X });
        }
        farPalm(g, k, -42, 28, 7, { seed: 'palm-far-a', lean: 1 });
        // the upper terrace, on the hill: houses 4.5–5 m wide, 6–7.5 m to the ridge
        const u = land(205, TOWN);
        house(g, u, -47, 12, 4.8, 5.6, { fill: C.peach, seed: 'hu1', lean: -1, tilt: 1, door: C.maroon });
        house(g, u, -41.6, 11.6, 4.5, 6.4, { fill: P.paleBlue, roof: P.tile, seed: 'hu2', lean: 1, tilt: -1, chim: 0.3 });
        house(g, u, -30, 10.6, 4.8, 5.8, { fill: P.pink, seed: 'hu3', lean: -1, tilt: 1.5 });
        // the chapel: a gable with a bell-cote
        house(g, u, -24.4, 10, 4.2, 6.2, { fill: P.cream, roof: P.slate, seed: 'chapel', gable: true, cols: 1, rows: 2, door: C.maroon });
        {
            const [bx, by] = u.p(-22.3, 18.6), z = u.s / 9, l = u.w;
            slab(g, [[bx - 4 * z, by - 10 * z], [bx + 4 * z, by - 10 * z], [bx + 5 * z, by], [bx - 5 * z, by]], { fill: P.cream, w: l, seed: 'bell', over: 0.8 });
            dot(g, bx, by - 4 * z, 1.8 * z, C.roadLine);
            ln(g, [[bx, by - 10 * z], [bx, by - 19 * z]], { w: l, seed: 'cross-a' });
            ln(g, [[bx - 3 * z, by - 15.5 * z], [bx + 3 * z, by - 15.5 * z]], { w: l, seed: 'cross-b' });
        }
        house(g, u, -14, 8.6, 4.8, 4.8, { fill: C.white, roof: P.tile, seed: 'hu5', tilt: 1, chim: 0.25 });
        // one palm on the hill above the terrace, standing clear of the uprights on the quay
        farPalm(g, u, 3.6, 6.4, 6.5, { seed: 'palm-far-b', lean: -0.5 });
        // the lower terrace along the harbour road, down to the net loft
        const t = land(176, TOWN);
        const row = [
            [5.2, 7.6, C.salmon, P.slate, C.navy], [4.5, 6.4, P.cream, P.tile, P.fishDeep], [5.4, 8, C.teal, P.slate, C.maroon], [4.4, 6.2, C.peach, P.slate, C.navy],
            [5.2, 7.4, P.lilac, P.tile, C.white], [4.8, 6, C.white, P.slate, C.red], [5.4, 6.8, P.paleBlue, P.slate, C.yellow], [4.6, 5.6, P.pink, P.tile, C.navy],
        ];
        let X = -42;
        for (const [i, [wm, hm, fill, roof, door]] of row.entries()) {
            house(g, t, X, 1.4, wm, hm, { fill, roof, door, seed: 'hl' + i, lean: (i % 3) - 1, tilt: ((i * 7) % 5) - 2, rh: 1.5 + (i % 2) * 0.35, chim: i % 2 ? 0.28 : 0.72, cols: wm > 5 ? 3 : 2, rows: hm > 7 ? 3 : 2 });
            X += wm + 0.25;
        }
        house(g, t, X + 0.4, 1.2, 6.2, 4.8, { fill: P.cliff, roof: P.slate, seed: 'loft', gable: true, cols: 3, rows: 2, door: P.fishDeep });
        lighthouse(g);
        // rocks off the point
        const rk = land(232);
        for (const [RX, r, key] of [[41.5, 1.9, 'a'], [45, 1.3, 'b'], [38.6, 1.1, 'c']]) sh(g, [[...rk.p(RX - r, -1.5), 1], rk.p(RX - r * 0.6, -1.5 + r * 0.6), rk.p(RX, -1.5 + r * 0.85), rk.p(RX + r * 0.7, -1.5 + r * 0.4), [...rk.p(RX + r, -1.5), 1]], { fill: P.rock, w: rk.w, seed: 'rock' + key });
    }

    // The light on the point: a round tower 20 m tall, built of projected rings (so far away
    // that they close to lines), its keeper's cottage beside it.
    function lighthouse(g) {
        const c = [31.2 + (LAND * 246) / 240, 3.4, 246], k = card(c[2]), w = k.w;
        slab(g, [k.p(c[0] - 15, 4.8), k.p(c[0] - 3.5, 4.4), k.p(c[0] - 3.5, 3.2), k.p(c[0] - 15, 3.4)], { fill: C.white, w, seed: 'lh-wall', over: 1 });
        house(g, k, c[0] - 12, 3.5, 7, 4, { fill: C.white, roof: P.tile, rh: 1.8, seed: 'lh-cot', cols: 2, rows: 1, door: P.coral, chim: 0.3, tilt: 1 });
        lathe(g, c, [[3.4, 0], [2.3, 16.4]], { fill: C.white, w, seed: 'lh-tower', bands: [[2.2, 5.8, C.red], [9.4, 13, C.red]], top: false });
        // door, two windows
        const d = k.p(c[0] - 0.3, c[1]);
        slab(g, [[d[0] - 0.9 * k.s, d[1] - 2.6 * k.s], [d[0] + 0.9 * k.s, d[1] - 2.6 * k.s], [d[0] + k.s, d[1] + 1], [d[0] - k.s, d[1] + 1]], { fill: C.navy, w, seed: 'lh-door', over: 0.6, edges: [0, 1, 3] });
        for (const [wx, wy] of [[0.5, 7.4], [-0.2, 14.4]]) T.pane(g, [k.p(c[0] + wx - 0.6, c[1] + wy + 1), k.p(c[0] + wx + 0.6, c[1] + wy + 1), k.p(c[0] + wx + 0.6, c[1] + wy - 0.8), k.p(c[0] + wx - 0.6, c[1] + wy - 0.8)], { w, seed: 'lh-w' + wy, gleams: 1 });
        // the gallery and its rail, the lantern, the cap
        lathe(g, c, [[3.3, 16.4], [3.4, 17.1]], { fill: P.slate, w, seed: 'lh-gal', top: false, under: false });
        for (let i = 0; i <= 5; i++) ln(g, [k.p(c[0] - 3.2 + i * 1.28, c[1] + 17.1), k.p(c[0] - 3.2 + i * 1.28, c[1] + 18.5)], { w: w * 0.9, seed: 'lh-gp' + i });
        ln(g, [k.p(c[0] - 3.5, c[1] + 18.5), k.p(c[0] + 3.5, c[1] + 18.5)], { w, seed: 'lh-gr' });
        const lq = [k.p(c[0] - 1.8, c[1] + 20.6), k.p(c[0] + 1.8, c[1] + 20.6), k.p(c[0] + 1.8, c[1] + 17.1), k.p(c[0] - 1.8, c[1] + 17.1)];
        T.pane(g, lq, { w, seed: 'lh-lamp', gleams: 2 });
        for (const u of [0.34, 0.67]) ln(g, [at(lq, u, 0), at(lq, u, 1)], { w, seed: 'lh-lm' + u });
        sh(g, [[...k.p(c[0] - 2.3, c[1] + 20.5), 1], k.p(c[0] - 1.3, c[1] + 22.1), k.p(c[0], c[1] + 22.7), k.p(c[0] + 1.3, c[1] + 22.1), [...k.p(c[0] + 2.3, c[1] + 20.5), 1]], { fill: C.red, w, seed: 'lh-cap' });
        dot(g, ...k.p(c[0], c[1] + 23.2), 0.45 * k.s, C.roadLine);
        ln(g, [k.p(c[0], c[1] + 23.4), k.p(c[0] + 0.1, c[1] + 25.4)], { w, seed: 'lh-rod' });
    }

    // --- the water ---------------------------------------------------------------------------
    // a wave: a nearly level line with a few soft kinks, `len` units long
    function wave(g, x, y, len, o = {}) {
        const { seed = 'wv', w = BG, amp = 2, color = C.ink } = o;
        const R = Motion.rng(seed), n = Math.max(2, Math.round(len / 15)), pts = [];
        for (let i = 0; i <= n; i++) pts.push([x + (len * i) / n, y + (i % 2 ? -1 : 1) * amp * (0.3 + R() * 0.9) * (i === 0 || i === n ? 0.2 : 1)]);
        T.line(g, pts, { w, seed, color });
        if (R() < 0.3 && len > 24) T.line(g, [[x + len * 0.55, y + w * 2.6], [x + len * 0.72, y + w * 2.2 + amp], [x + len * 0.9, y + w * 2.8]], { w, seed: seed + 'b', color });
    }
    function water(g) {
        g.fillStyle = C.sea;
        g.fillRect(0, H0, W, H - H0);
        ln(g, [[-10, H0], [W + 10, H0]], { w: 1.4, seed: 'horizon', amp: 0.2 });
        // waves 2.5–6.5 m long lying on the water: by projection they shorten and close up
        // towards the horizon
        const R = Motion.rng('waves'), made = [];
        for (let tries = 0; tries < 2600 && made.length < 150; tries++) {
            const dy = 2 + 86 * Math.pow(R(), 1.5), Z = (F * (EYE - WATER)) / dy, L = (2.5 + R() * 4) * sc(Z), x = -40 + R() * (W + 80 - L), y = H0 + dy, w = lw(Z);
            if (made.some(([mx, my, mL]) => Math.abs(my - y) < w * 3 && x < mx + mL + 10 && mx < x + L + 10)) continue;
            made.push([x, y, L]);
            wave(g, x, y, L, { seed: 'wv' + made.length, w, amp: Math.max(0.6, 0.07 * sc(Z)) });
        }
    }
    // foam on the water round something: a white shape with its outline, r metres across
    function foam(g, c, r, o = {}) {
        const s = sc(c[2]), [x, y] = pt([c[0], WATER, c[2]]), rx = r * s, ry = Math.max(1.6, (r * s * (EYE - WATER)) / c[2] * 1.4);
        sh(g, [[x - rx, y + ry * 0.2], [x - rx * 0.45, y - ry], [x + rx * 0.35, y - ry * 0.8], [x + rx, y + ry * 0.3], [x + rx * 0.3, y + ry], [x - rx * 0.5, y + ry * 0.9]], { fill: C.foam, w: lw(c[2]), seed: o.seed ?? 'foam' + c[0] });
    }

    // the far harbour wall: a breakwater 2.3 m out of the water, its rail, steps, palms and light
    function farWall(g) {
        const A = [-96, 114], B = [10.5, 96], top = 0.8, at3 = (u, Y) => [A[0] + (B[0] - A[0]) * u, Y, A[1] + (B[1] - A[1]) * u], w = lw(100), L = Math.hypot(B[0] - A[0], B[1] - A[1]);
        const p = (u, Y) => pt(at3(u, Y));
        // palms planted along it, behind the rail: 6 m
        for (const [u, hm, lean] of [[0.575, 6.4, 0.5], [0.69, 5.6, -0.4], [0.775, 6, 0.6]]) {
            const b = at3(u, top), s = sc(b[2]);
            T.palm(g, ...pt(b), hm * s, { w, fronds: 7, lean: lean * s, seed: 'wall-palm' + u });
        }
        slab(g, [p(0, top), p(1, top), p(1, WATER), p(0, WATER)], { fill: P.wall, w, seed: 'fw-face', over: 1 });
        g.fillStyle = P.wallTop;
        g.fill(T.pathOf([p(0, top), p(1, top), p(1, top - 0.45), p(0, top - 0.45)]));
        g.fillStyle = P.hillDeep;
        g.fill(T.pathOf([p(0, WATER + 0.5), p(1, WATER + 0.5), p(1, WATER), p(0, WATER)]));
        ln(g, [p(0, top), p(1, top)], { w, seed: 'fw-top' });
        ln(g, [p(0, top - 0.45), p(1, top - 0.45)], { w, seed: 'fw-cope' });
        ln(g, [p(0, WATER), p(1, WATER)], { w, seed: 'fw-foot' });
        ln(g, [p(1, top), p(1, WATER)], { w, seed: 'fw-end' });
        const R = Motion.rng('fw-j');
        for (let m = 2; m < L - 1; m += 1.8 + R() * 1.6) {
            const up = R() < 0.5, u = m / L;
            if (R() < 0.3) continue;
            ln(g, [p(u, up ? top - 0.5 : -0.3), p(u, up ? -0.2 : WATER + 0.55)], { w: w * 0.9, seed: 'fw-j' + m.toFixed(1) });
        }
        // the rail: posts 1 m high every 3 m, two bars
        for (let m = 1; m < L; m += 3) ln(g, [p(m / L, top), p(m / L, top + 1)], { w, seed: 'fw-p' + m });
        ln(g, [p(0, top + 1), p((L - 1) / L, top + 1)], { w, seed: 'fw-r1' });
        ln(g, [p(0, top + 0.5), p((L - 1) / L, top + 0.5)], { w: w * 0.9, seed: 'fw-r2' });
        // steps down to the water, an iron ladder, tyres hung as fenders
        const st = [];
        for (let i = 0; i <= 5; i++) st.push(p(0.79 + i * 0.006, top - i * 0.46), p(0.79 + (i + 1) * 0.006, top - i * 0.46));
        poly(g, [...st, p(0.826, WATER), p(0.79, WATER)], { fill: P.wallTop, w, seed: 'fw-steps' });
        for (const u of [0.72, 0.726]) ln(g, [p(u, top), p(u, WATER)], { w: w * 0.9, seed: 'fw-lad' + u });
        for (let Y = top - 0.3; Y > WATER; Y -= 0.38) ln(g, [p(0.72, Y), p(0.726, Y)], { w: w * 0.8, seed: 'fw-rung' + Y.toFixed(1), amp: 0 });
        for (const u of [0.66, 0.755, 0.84]) {
            const [x, y] = p(u, -0.35);
            ln(g, [p(u, top - 0.4), [x, y]], { w: w * 0.9, seed: 'fw-ty' + u });
            T.shape(g, T.ellipse(x, y, 0.42 * sc(100), 0.42 * sc(100), 0, 9), { fill: C.ink, w, seed: 'fw-tyre' + u, dense: true });
            dot(g, x, y, 0.17 * sc(100), P.wall);
        }
    }

    // --- boats -----------------------------------------------------------------------------------
    /**
     * A boat's hull built from sections. fr: its frame (x to the bow, y up from the keel, z across);
     * L × B metres; o.sheer: the gunwale's height at the stern, amidships and the bow; o.transom:
     * the stern's width against the beam; o.cut: a world height below which nothing shows (the
     * water). Returns the surface (at3(u, t, side): u from stern to bow, t from gunwale to keel)
     * and what is needed to draw on it.
     */
    function hullOf(fr, L, B, o = {}) {
        const { sheer = [0.5, 0.42, 0.7], transom = 0.72, rake = 0.1, cut = -Infinity, fore = 0.4, n = 12, bowOn = false } = o;
        const hb = (u) => (B / 2) * (u < 0.42 ? transom + (1 - transom) * Math.sin(((u / 0.42) * Math.PI) / 2) : Math.pow(Math.max(0, Math.cos((((u - 0.42) / 0.58) * Math.PI) / 2)), 0.7)); // (max: at the stem the cosine is −1e−17, and its power NaN: the bow's last plank was never drawn)
        const sy = (u) => sheer[1] + (sheer[0] - sheer[1]) * Math.pow(Math.max(0, 1 - u / 0.45), 2) + (sheer[2] - sheer[1]) * Math.pow(Math.max(0, (u - 0.45) / 0.55), 2);
        const ky = (u) => (u > 0.8 ? sy(u) * fore * Math.pow((u - 0.8) / 0.2, 2) : 0);
        const at3 = (u, t, sg) => {
            const S = Math.pow(1 - Math.pow(t, 2.6), 1 / 2.6);
            const p = fr.w((u - 0.5) * L + rake * L * Math.pow(Math.max(0, (u - 0.6) / 0.4), 2) * (1 - t * 0.8), sy(u) + (ky(u) - sy(u)) * t, sg * hb(u) * S);
            if (p[1] < cut) p[1] = cut;
            return p;
        };
        const facing0 = (u, t, sg) => {
            const e = 0.03, p = at3(u, t, sg);
            const du = sub(at3(Math.min(1, u + e), t, sg), at3(Math.max(0, u - e), t, sg)), dt = sub(at3(u, Math.min(1, t + e), sg), at3(u, Math.max(0, t - e), sg));
            let nn = cross(du, dt);
            if (dot3(nn, mul(fr.Z, sg)) < 0) nn = mul(nn, -1);
            return dot3(nn, sub(EYE3, p)) > 0;
        };
        // with the bow towards us the side we see runs all the way to the stem (the test above
        // gives up where the planks turn in to it, which left the bow unfinished)
        const nearSg = len3(sub(at3(0.5, 0, 1), EYE3)) < len3(sub(at3(0.5, 0, -1), EYE3)) ? 1 : -1;
        const facing = (u, t, sg) => facing0(u, t, sg) || (bowOn && sg === nearSg && u > 0.55);
        const ts = [0, 0.3, 0.62, 1], quads = [];
        for (const sg of [-1, 1]) for (let i = 0; i < n; i++) for (let j = 0; j < ts.length - 1; j++) quads.push([at3(i / n, ts[j], sg), at3((i + 1) / n, ts[j], sg), at3((i + 1) / n, ts[j + 1], sg), at3(i / n, ts[j + 1], sg)].map(pt));
        const tr = [];
        for (let j = 0; j <= 8; j++) tr.push(at3(0, j / 8, -1));
        for (let j = 8; j >= 0; j--) tr.push(at3(0, j / 8, 1));
        // t may be a number or a function of u (tAt(y): a level line y above the keel)
        const tv = (t, u) => (typeof t === 'function' ? t(u) : t), tAt = (y) => (u) => clamp((sy(u) - y) / (sy(u) - ky(u) || 1), 0, 1);
        // the stretches of the line at t, from u0 to u1, that we can see on side sg
        const runs = (t, sg, u0 = 0, u1 = 1, m = 28) => {
            const out = [];
            let cur = null;
            for (let i = 0; i <= m; i++) {
                const u = u0 + ((u1 - u0) * i) / m;
                const tt = tv(t, u);
                if (facing(clamp(u, 0.01, 0.99), clamp(tt, 0.02, 0.97), sg)) (cur ??= []).push(pt(at3(u, tt, sg)));
                else if (cur) {
                    out.push(cur);
                    cur = null;
                }
            }
            if (cur) out.push(cur);
            return out.filter((r) => r.length > 1);
        };
        return {
            at3, facing, sy, hb, runs, tAt, quads: [...quads, tr.map(pt)], transom: tr.map(pt),
            stern: dot3(mul(fr.X, -1), sub(EYE3, at3(0, 0.4, 0))) > 0, // do we see the transom?
            near: len3(sub(at3(0.5, 0, 1), EYE3)) < len3(sub(at3(0.5, 0, -1), EYE3)) ? 1 : -1,
            // a band of colour between two lines of the hull, where we see it
            band(g, t0, t1, fill, u0 = 0, u1 = 1, m = 24) {
                g.fillStyle = fill;
                g.strokeStyle = fill;
                g.lineWidth = 0.6;
                for (const sg of [-1, 1]) {
                    for (let i = 0; i < m; i++) {
                        const a = u0 + ((u1 - u0) * i) / m, b = u0 + ((u1 - u0) * (i + 1)) / m;
                        if (!facing(clamp((a + b) / 2, 0.01, 0.99), clamp((tv(t0, a) + tv(t1, a)) / 2, 0.02, 0.97), sg)) continue;
                        const p = T.pathOf([at3(a, tv(t0, a), sg), at3(b, tv(t0, b), sg), at3(b, tv(t1, b), sg), at3(a, tv(t1, a), sg)].map(pt));
                        g.fill(p);
                        g.stroke(p);
                    }
                }
            },
            lines(g, t, o2 = {}) {
                for (const sg of [-1, 1]) for (const [i, r] of runs(t, sg, o2.u0 ?? 0, o2.u1 ?? 1).entries()) T.line(g, r, { dense: true, seed: (o2.seed ?? 'hl') + sg + i, w: Math.max(1.3, o2.w ?? BG), amp: 0.2, color: o2.color ?? C.ink });
            },
        };
    }

    /**
     * A trawler riding in the harbour: 14 × 4.4 m, 1.5 m of freeboard amidships and 3 m at the
     * bow, the wheelhouse aft (2.4 m), the mast 7 m above the deck. at: [X, Z] of its middle,
     * yaw: where the bow points. Parts are drawn far to near, then the hull over their feet.
     */
    function trawler(g, at, yaw, o = {}) {
        const { hull = P.navy, boot = P.boot, cabin = C.white, roof = C.orange, seed = 'tr', reg = 'GH42', net = P.netPale, strake = C.white, L = 14, B = 4.4 } = o;
        const draft = 1.2, fr = frame([at[0], WATER - draft, at[1]], yaw), w = lw(at[1]), s = sc(at[1]);
        const hl = hullOf(fr, L, B, { sheer: [draft + 1.9, draft + 1.5, draft + 3], transom: 0.78, rake: 0.07, cut: WATER, fore: 0.25, n: 14 });
        const deck = draft + 0.7, S = (x, y, z) => fr.w((x * L) / 14, y, (z * B) / 4.4);
        const B3 = (a, b, d, oo) => bar3(g, a, b, d, { w, ...oo });
        const parts = [
            // the stern gallows
            [-6.3, () => {
                B3(S(-6.4, deck, -1.5), S(-6.1, deck + 3.3, -0.5), 0.2, { fill: P.spar, seed: seed + 'ga' });
                B3(S(-6.4, deck, 1.5), S(-6.1, deck + 3.3, 0.5), 0.2, { fill: P.spar, seed: seed + 'gb' });
                B3(S(-6.1, deck + 3.3, -0.7), S(-6.1, deck + 3.3, 0.7), 0.2, { fill: P.spar, seed: seed + 'gc' });
                ln3(g, [S(-6.1, deck + 3.2, 0), S(-6.1, deck + 2.3, 0)], { w, seed: seed + 'gl' });
                dot(g, ...pt(S(-6.1, deck + 2.2, 0)), Math.max(1.5, 0.16 * s), P.iron);
            }],
            // the wheelhouse: a box with windows on the faces we see, a door, a life ring; its roof and stack
            [-3.8, () => {
                const o3 = S(-3.8, deck - 0.3, 0);
                boxOf(g, S(-4.6, deck + 2.5, 0), [0.8, 1.2, 0.8], yaw, { fill: { all: hull }, w, seed: seed + 'stack', face: (f, pl) => { if (f.name !== 'top' && f.name !== 'bottom') { g.fillStyle = boot; g.fill(T.pathOf(pl.q(0, 0.7, pl.W, 0.95))); ln(g, [pl.p(0, 0.7), pl.p(pl.W, 0.7)], { w, seed: seed + 'sb' + f.name, amp: 0 }); ln(g, [pl.p(0, 0.95), pl.p(pl.W, 0.95)], { w, seed: seed + 'sc' + f.name, amp: 0 }); } } });
                boxOf(g, o3, [2.8, 2.7, 2.5], yaw, {
                    fill: { all: cabin, left: '#dcd8cc', right: '#dcd8cc' }, w, seed: seed + 'wh',
                    face: (f, pl) => {
                        if (f.name === 'top' || f.name === 'bottom') return;
                        const n = pl.W > 2.6 ? 3 : 2, m = 0.22, ww = (pl.W - m * (n + 1)) / n;
                        for (let i = 0; i < n; i++) T.pane(g, pl.q(m + i * (ww + m), 1.75, m + i * (ww + m) + ww, 2.45), { w, seed: seed + 'win' + f.name + i, gleams: 1 });
                        if (f.name === 'front' || f.name === 'back') {
                            const [cx, cy] = pl.p(pl.W / 2, 1.25), r = 0.3 * s;
                            T.shape(g, T.ellipse(cx, cy, r, r, 0, 10), { fill: C.red, w, seed: seed + 'lr' + f.name, dense: true });
                            dot(g, cx, cy, r * 0.45, cabin);
                        } else slab(g, pl.q(pl.W * 0.36, 0.3, pl.W * 0.36 + 0.7, 1.6), { fill: boot, w, seed: seed + 'door' + f.name, over: 0.6 });
                    },
                });
                boxOf(g, S(-3.7, deck + 2.4, 0), [3.3, 0.16, 2.9], yaw, { fill: roof, w, seed: seed + 'rf' });
                // radar, aerial, a lamp on the roof
                B3(S(-3.2, deck + 2.56, 0), S(-3.2, deck + 3.1, 0), 0.08, { fill: C.white, seed: seed + 'rd' });
                B3(S(-3.2, deck + 3.1, -0.6), S(-3.2, deck + 3.1, 0.6), 0.14, { fill: C.white, seed: seed + 'radar' });
                ln3(g, [S(-2.7, deck + 2.56, 0.8), S(-2.6, deck + 5.4, 0.8)], { w: w * 0.9, seed: seed + 'aer' });
                dot(g, ...pt(S(-4.9, deck + 2.75, -0.9)), Math.max(1.6, 0.14 * s), C.roadLine);
            }],
            // the mast, its crosstree and light, the boom with a net hung to dry, the rigging
            [0.8, () => {
                const top = S(0.8, deck + 7, 0);
                for (const [k, e] of [['fst', S(7, hl.sy(1) + 0.1, 0)], ['bst', S(-6.1, deck + 3.3, 0)], ['sh1', S(0.4, hl.sy(0.55), -B / 2)], ['sh2', S(0.4, hl.sy(0.55), B / 2)], ['sh3', S(1.4, hl.sy(0.6), -B / 2)], ['sh4', S(1.4, hl.sy(0.6), B / 2)]]) ln3(g, [top, e], { w: w * 0.85, seed: seed + k, amp: 0.15 });
                const b0 = S(0.9, deck + 2.2, 0), b1 = S(5.2, deck + 5.6, 0);
                const np = [lerp3(b0, b1, 0.3), b1, S(5, deck + 1.6, 0), S(3.6, deck + 0.9, 0), S(2.4, deck + 1, 0)].map(pt);
                const nd = sh(g, [[...np[0], 1], [...np[1], 1], np[2], np[3], [...np[4], 1]], { fill: net, w, seed: seed + 'nd' });
                netting(g, nd, Math.max(3.2, 0.36 * s), { w: Math.max(1.3, w * 0.8), seed: seed + 'ndh' });
                ln3(g, [top, b1], { w: w * 0.85, seed: seed + 'top' });
                B3(b0, b1, 0.2, { fill: P.spar, seed: seed + 'boom', d1: 0.14 });
                B3(S(0.8, deck - 0.2, 0), top, 0.3, { fill: P.spar, seed: seed + 'mast', d1: 0.18 });
                B3(S(0.8, deck + 5.3, -0.8), S(0.8, deck + 5.3, 0.8), 0.14, { fill: P.spar, seed: seed + 'ct' });
                dot(g, ...pt(add(top, [0, 0.2, 0])), Math.max(1.6, 0.16 * s), C.red);
                ln3(g, [b1, add(b1, [0, -0.9, 0])], { w, seed: seed + 'hk' });
                dot(g, ...pt(add(b1, [0, -1, 0])), Math.max(1.5, 0.14 * s), P.iron);
            }],
            // a heap of net on the foredeck with its floats, showing over the rail
            [3.6, () => {
                const hp = [S(2.2, deck + 0.6, 0), S(2.7, deck + 1.5, 0), S(3.6, deck + 1.9, 0), S(4.6, deck + 1.5, 0), S(5.2, deck + 0.6, 0)].map(pt);
                const heap = sh(g, [[...hp[0], 1], hp[1], hp[2], hp[3], [...hp[4], 1]], { fill: P.net, w, seed: seed + 'heap' });
                netting(g, heap, Math.max(3, 0.32 * s), { w: Math.max(1.3, w * 0.8), seed: seed + 'hh' });
                for (const [fx, fy] of [[2.8, 1.5], [3.7, 1.95], [4.5, 1.5]]) dot(g, ...pt(S(fx, deck + fy, 0)), Math.max(1.8, 0.17 * s), C.orange);
            }],
        ];
        // far parts first
        const dist = (x) => len3(sub(S(x, deck + 1, 0), EYE3));
        for (const [, draw] of parts.sort((a, b) => dist(b[0]) - dist(a[0]))) draw();
        // the ensign staff at the stern (the flag itself moves: Harbor.back)
        ln3(g, [S(-6.9, hl.sy(0), 0), S(-7.2, hl.sy(0) + 2.2, 0)], { w: w * 1.1, seed: seed + 'staff' });
        // the hull: the boot topping at the water, a painted strake under the rail
        union(g, hl.quads, { fill: hull, w, seed: seed + 'hull' });
        hl.band(g, hl.tAt(draft + 0.45), 1, boot);
        hl.band(g, 0.07, 0.15, strake);
        if (hl.stern) T.shape(g, hl.transom, { fill: hull, w, seed: seed + 'transom', dense: true, amp: 0.2 });
        hl.lines(g, hl.tAt(draft + 0.45), { w, seed: seed + 'bt' });
        hl.lines(g, 0.07, { w, seed: seed + 's1' });
        hl.lines(g, 0.15, { w, seed: seed + 's2' });
        // the stem, where we see the bow
        if (!hl.stern) T.line(g, [0, 0.25, 0.5, 0.75, 1].map((t) => pt(hl.at3(1, t, 1))), { w, seed: seed + 'stem' });
        // registration on the bow of the side we see, laid on the hull
        {
            const sg = hl.near, a = hl.at3(0.74, 0.2, sg), b = hl.at3(0.9, 0.2, sg), c = hl.at3(0.74, 0.34, sg);
            let u = unit(sub(b, a));
            const flip = pt(b)[0] < pt(a)[0];
            const pl = plane(flip ? b : a, flip ? mul(u, -1) : u, unit(sub(a, c)));
            const wm = len3(sub(b, a)), hm = len3(sub(a, c));
            if (hl.facing(0.82, 0.27, sg)) decal(g, pl, 0, -hm, wm, hm, (cg) => chalk(cg, reg, wm * 50, hm * 86, hm * 96, { seed: seed + 'reg', align: 'center' }), { nx: 3, ny: 1 });
        }
        // fenders and a tyre over the side we see
        for (const [u, col] of [[0.3, C.orange], [0.48, C.magenta], [0.64, null]]) {
            if (!hl.facing(u, 0.2, hl.near)) continue;
            const a = pt(hl.at3(u, 0.02, hl.near)), [bx, by] = pt(hl.at3(u, 0.36, hl.near));
            ln(g, [a, [bx, by]], { w, seed: seed + 'fd' + u });
            if (col) T.shape(g, T.ellipse(bx, by, 0.22 * s, 0.36 * s, 0, 10), { fill: col, w, seed: seed + 'fen' + u, dense: true });
            else {
                T.shape(g, T.ellipse(bx, by, 0.36 * s, 0.36 * s, 0, 10), { fill: C.ink, w, seed: seed + 'tyre', dense: true });
                dot(g, bx, by, 0.15 * s, hull);
            }
        }
        // foam under the forefoot
        const bow = hl.at3(0.97, 1, 1);
        foam(g, [bow[0], 0, bow[2]], 1.3, { seed: seed + 'foam' });
    }

    // a rowing boat on the water, 3.6 × 1.3 m: we look into it
    function rowingBoat(g, at, yaw, o = {}) {
        const { hull = C.white, band = C.blue, seed = 'rb' } = o;
        const fr = frame([at[0], WATER - 0.12, at[1]], yaw), w = lw(at[1]);
        const hl = hullOf(fr, 3.6, 1.3, { sheer: [0.56, 0.5, 0.66], transom: 0.7, rake: 0.06, cut: WATER, n: 10 });
        union(g, hl.quads, { fill: hull, w, seed });
        hl.band(g, 0, 0.3, band);
        hl.lines(g, 0.3, { w, seed: seed + 'l' });
        // the inside: between the two gunwales
        const far = [], nearG = [];
        for (let i = 0; i <= 12; i++) {
            far.push(pt(hl.at3(i / 12, 0, -hl.near)));
            nearG.push(pt(hl.at3(i / 12, 0, hl.near)));
        }
        T.shape(g, [...far, ...nearG.reverse()], { fill: C.wood, w, seed: seed + 'in', dense: true, amp: 0.2 });
        for (const u of [0.3, 0.58]) slab(g, [hl.at3(u, 0.08, -1), hl.at3(u + 0.07, 0.08, -1), hl.at3(u + 0.07, 0.08, 1), hl.at3(u, 0.08, 1)].map(pt), { fill: P.spar, w, seed: seed + 'th' + u, over: 0.3 });
        // an oar shipped across, the painter to its buoy
        bar3(g, fr.w(-0.6, 0.62, 0.3), fr.w(1.9, 0.9, -0.5), 0.07, { fill: P.spar, w, seed: seed + 'oar' });
        foam(g, [at[0] + fr.X[0] * 1.6, 0, at[1] + fr.X[2] * 1.6], 0.5, { seed: seed + 'foam' });
    }

    // a mooring buoy: a turned float 0.65 m across with a band and a ring
    function buoy(g, at, col, seed) {
        const c = [at[0], WATER - 0.12, at[1]];
        lathe(g, c, [[0.12, 0.1], [0.3, 0.2], [0.33, 0.42], [0.24, 0.62], [0.08, 0.7]], { fill: col, seed, n: 12, bands: [[0.36, 0.46, C.white]], top: false });
        ln3(g, [add(c, [0, 0.7, 0]), add(c, [0, 1.05, 0])], { seed: seed + 's' });
        foam(g, [at[0] + 0.3, 0, at[1] - 0.1], 0.5, { seed: seed + 'f' });
    }

    function harbour(g) {
        // the second trawler, far out beyond the harbour mouth; the first one riding inside; a
        // rowing boat and mooring buoys nearer
        trawler(g, BOAT_B.at, BOAT_B.yaw, { seed: 'tr-b', hull: C.green, boot: '#7b1f2a', cabin: P.cream, roof: P.coral, reg: 'GH7', net: C.salmon, strake: C.roadLine, L: 12, B: 4 });
        buoy(g, [9.5, 78], C.orange, 'buoy-a');
        trawler(g, BOAT_A.at, BOAT_A.yaw, { seed: 'tr-a' });
        buoy(g, [-9, 58], C.magenta, 'buoy-b');
        rowingBoat(g, [-7.6, 52], -0.5, { seed: 'rb' });
        buoy(g, [4.6, 47], C.roadLine, 'buoy-c');
    }

    // --- the quay: the ground we stand on ------------------------------------------------------
    function quay(g) {
        // everything nearer than the lip, down to the bottom of the frame
        const l0 = pt(Q(-30, 0)), l1 = pt(Q(8, 0)), yAt = (x) => l0[1] + ((x - l0[0]) * (l1[1] - l0[1])) / (l1[0] - l0[0]);
        g.fillStyle = P.quay;
        g.fill(T.pathOf([[-30, yAt(-30)], [W + 30, yAt(W + 30)], [W + 30, H + 30], [-30, H + 30]]));
        // coping stones along the lip, 0.45 m deep, a joint every 1.5 m
        g.fillStyle = P.coping;
        g.fill(T.pathOf([pt(Q(-30, 0)), pt(Q(8, 0)), pt(Q(8, 0.45)), pt(Q(-30, 0.45))]));
        gline(g, Q(-30, 0), Q(8, 0), { seed: 'cope-out', w: 1.9 });
        gline(g, Q(-30, 0.45), Q(8, 0.45), { seed: 'cope-in', w: 1.9 });
        const RC = Motion.rng('cope-j');
        for (let a = -22; a < 7.6; a += 1.5) if (RC() > 0.12) gline(g, Q(a, 0.02), Q(a, 0.44), { seed: 'cope-j' + a });
        // flagstones: courses 1.4 m deep that run with the lip, slabs 2.1 m long, the joints of
        // one course half a slab off the next; drawn in pieces, as a hand leaves them
        const R = Motion.rng('paving'), courses = [];
        for (let b = 0.45; b < 13; b += 1.4) courses.push(b);
        for (const [i, b] of courses.entries()) {
            if (i > 0) {
                let a = -20 + R() * 2;
                while (a < 9) {
                    const L = 0.8 + R() * 2.6, gap = R() < 0.75 ? 0.5 + R() * 2.4 : 0;
                    gline(g, Q(a, b), Q(Math.min(9, a + L), b), { seed: 'pj' + i + a.toFixed(1) });
                    a += L + gap;
                }
            }
            const off = (i % 2) * 1.05 + R() * 0.25;
            for (let a = -21 + off; a < 9; a += 2.1) {
                const e0 = R(), e1 = R();
                if (R() < 0.42) continue;
                gline(g, Q(a, b + 1.4 * (e0 < 0.3 ? e0 : 0)), Q(a, b + 1.4 * (e1 < 0.3 ? 1 - e1 : 1)), { seed: 'pc' + i + a.toFixed(1) });
            }
        }
        // a worn yellow line 0.26 m wide, 0.72 m in from the lip
        for (const [i, [a0, a1]] of [[-16, -12.2], [-11.4, -8.6], [-7.4, -2.6], [-1.9, 0.5], [1.3, 1.9], [5.3, 7.4]].entries()) slab(g, [pt(Q(a0, 0.72)), pt(Q(a1, 0.72)), pt(Q(a1, 0.98)), pt(Q(a0, 0.98))], { fill: C.roadLine, w: 1.4, seed: 'yl' + i, over: 0.4 });
        // and another, as worn, leading from the pier's gate back onto the quay
        for (const [i, [b0, b1]] of [[0.5, 1.5], [1.9, 3.3], [3.7, 4.5]].entries()) slab(g, [pt(Q(3.3, b0)), pt(Q(3.48, b0)), pt(Q(3.48, b1)), pt(Q(3.3, b1))], { fill: C.roadLine, w: 1.6, seed: 'yg' + i, over: 0.4 });
        // loose ticks, mostly in pairs, lying along the courses; bigger towards us
        const RT = Motion.rng('quay-ticks');
        for (let i = 0, made = 0; i < 400 && made < 46; i++) {
            const A = Q(-14 + RT() * 22, 1.2 + RT() * 9.2), L = 0.12 + RT() * 0.3, two = RT() < 0.55, k = RT();
            const [x, y] = pt(A);
            if (A[2] < 2.2 || x < -20 || x > W + 20) continue;
            // keep the middle of the ground, where the cast stands, almost clean
            if (A[2] < 5.4 && Math.abs(A[0]) < 1.5 && RT() < 0.6) continue;
            made++;
            const B = add(A, mul(LD, L)), w = clamp(lw(A[2]) * (A[2] < 4 ? 1.1 : 1), 1.4, T.LINE_FINE);
            gline(g, A, B, { seed: 'qt' + i, w, amp: 0.25 });
            if (two) gline(g, add(add(A, mul(LD, L * 0.2 * k)), mul(PD, -0.035 - 0.012 * A[2] * 0.3)), add(add(A, mul(LD, L * (0.6 + 0.3 * k))), mul(PD, -0.035 - 0.012 * A[2] * 0.3)), { seed: 'qt' + i + 'b', w, amp: 0.25 });
        }
    }

    // --- the pier -----------------------------------------------------------------------------------
    // a rail between two points of a deck: posts 1.08 m high every 1.5 m, two bars that pass behind them
    function rail(g, A, B, o = {}) {
        const { seed = 'rail', step = 1.5, h = 1.0, first = true, last = true } = o, L = len3(sub(B, A)), n = Math.max(1, Math.round(L / step));
        const P3 = (i, y) => add(lerp3(A, B, i / n), [0, y, 0]);
        const order = Array.from({ length: n + 1 }, (_, i) => i).sort((i, j) => P3(j, 0)[2] - P3(i, 0)[2]);
        for (const i of order) {
            if (i < n) for (const [y, t] of [[h - 0.06, 0.09], [h * 0.5, 0.075]]) slab(g, [P3(i, y + t / 2), P3(i + 1, y + t / 2), P3(i + 1, y - t / 2), P3(i, y - t / 2)].map(pt), { fill: C.greyDeep, w: lw(P3(i, 0)[2]), seed: seed + y + i, over: 0.3, edges: [0, 2] });
        }
        for (const i of order) {
            if ((i === 0 && !first) || (i === n && !last)) continue;
            const a = P3(i, 0), b = P3(i, h + 0.08), s = sc(a[2]), [x, y] = pt(b);
            bar3(g, a, b, 0.11, { fill: C.grey, seed: seed + 'p' + i });
            if (s > 30) slab(g, [[x - 0.085 * s, y - 0.045 * s], [x + 0.085 * s, y - 0.045 * s], [x + 0.075 * s, y + 0.01 * s], [x - 0.075 * s, y + 0.01 * s]], { fill: C.grey, w: lw(a[2]), seed: seed + 'c' + i, over: 0.4 });
        }
    }
    // a lamp post: a turned foot and shaft, a swan neck reaching along `arm`, a lantern hung from it
    function lamp(g, c, o = {}) {
        const { h = 4.6, seed = 'lamp', fill = '#3c5a78', arm = [1, 0, 0] } = o, w = lw(c[2]), s = sc(c[2]);
        lathe(g, c, [[0.17, 0], [0.14, 0.14], [0.09, 0.5], [0.062, 0.64], [0.045, h]], { fill, w, seed, rings: [0.5, 0.64, h * 0.62], top: false, n: 12 });
        const top = add(c, [0, h, 0]), A = (k, y) => add(top, add(mul(arm, k), [0, y, 0]));
        sh(g, T.ribbon([A(0, -0.1), A(0.04, 0.3), A(0.3, 0.44), A(0.56, 0.3), A(0.6, 0.02)].map(pt), Math.max(2, 0.075 * s), Math.max(1.6, 0.055 * s)), { fill, w, seed: seed + 'n', dense: true });
        const lc = A(0.6, -0.5);
        lathe(g, lc, [[0.07, -0.05], [0.09, 0], [0.16, 0.36]], { fill: C.yellow, w, seed: seed + 'g', n: 10, underFill: fill });
        lathe(g, lc, [[0.2, 0.36], [0.17, 0.42], [0.04, 0.52]], { fill, w, seed: seed + 'h', n: 10, under: false, top: false });
        ln3(g, [add(lc, [0, 0.02, 0]), add(lc, [0, 0.34, 0])], { w: w * 0.9, seed: seed + 'm' });
    }
    // a sloping board (a roof, an awning): its top when we look down on its plane, its underside when not
    function slope(g, q3, o = {}) {
        let n = cross(sub(q3[1], q3[0]), sub(q3[3], q3[0]));
        if (n[1] < 0) n = mul(n, -1);
        const topSeen = dot3(n, sub(EYE3, q3[0])) > 0, q = q3.map(pt);
        T.slab(g, q, { fill: topSeen ? o.fill : (o.under ?? o.fill), w: o.w ?? lw(q3[0][2]), seed: o.seed ?? 'slope', over: o.over ?? 1.2, inside: topSeen ? o.inside : o.insideUnder });
        return { topSeen, q };
    }

    function baitShed(g) {
        const o3 = PR(5.9, 4.35), fr = frame(o3, PHI), w = lw(o3[2]), Wd = 2.4, Dp = 2.0, Hh = 2.2, ridge = 2.85;
        const S3 = (x, y, z) => fr.w(x, y, z), S = (x, y, z) => pt(fr.w(x, y, z));
        const right = wallOf(fr, Wd, Dp, 'right'), front = wallOf(fr, Wd, Dp, 'front');
        // the wall towards the deck: planks, a net hung to dry, a float
        slab(g, right.q(0, 0, Dp, Hh), { fill: P.lilacDeep, w, seed: 'bait-side', over: 1.2 });
        planksOn(g, right, 0, Dp, 0.12, Hh, 0.34, { seed: 'bait-side-pl', w: w * 0.9, skip: 0.1 });
        const nq = [right.p(0.5, 1.9, 0.03), right.p(1.6, 1.9, 0.03), right.p(1.45, 0.9, 0.03), right.p(1.0, 0.7, 0.03), right.p(0.62, 1.0, 0.03)];
        const nd = sh(g, [[...nq[0], 1], [...nq[1], 1], nq[2], nq[3], nq[4]], { fill: P.netPale, w, seed: 'bait-net' });
        netting(g, nd, 4.6, { w: w * 0.75, seed: 'bait-netn' });
        // the front, with its gable
        slab(g, [S(-1.2, 0, -1), S(-1.2, Hh, -1), S(0, ridge - 0.06, -1), S(1.2, Hh, -1), S(1.2, 0, -1)], { fill: P.lilac, w, seed: 'bait-front', over: 1.2 });
        planksOn(g, front, 0, Wd, 0.12, Hh, 0.3, { seed: 'bait-pl', w: w * 0.9, skip: 0.12 });
        slab(g, front.q(0, 0, Wd, 0.12), { fill: P.lilacDeep, w, seed: 'bait-kick', over: 0.6 });
        // the door, ajar on the dark inside, and a step
        slab(g, front.q(0.22, 0, 1.06, 1.92, 0.01), { fill: P.navy, w, seed: 'bait-door', over: 0.8 });
        for (const u of [0.5, 0.78]) ln(g, [front.p(u, 0.06), front.p(u, 1.86)], { w: w * 0.85, seed: 'bait-door-l' + u });
        dot(g, ...front.p(0.94, 0.98, 0.02), Math.max(1.6, 0.04 * sc(o3[2])), C.roadLine);
        slab(g, front.q(0.16, 0, 1.12, 0.1, 0.22), { fill: C.wood, w, seed: 'bait-step', over: 0.5 });
        // the window: two panes, a sill, a box of geraniums' worth of floats under it
        T.pane(g, front.q(1.38, 1.0, 2.12, 1.66, 0.01), { w, seed: 'bait-win', gleams: 2 });
        ln(g, [front.p(1.75, 1.0, 0.01), front.p(1.75, 1.66, 0.01)], { w, seed: 'bait-mull' });
        slab(g, front.q(1.32, 0.93, 2.18, 1.0, 0.06), { fill: C.white, w, seed: 'bait-sill', over: 0.5 });
        // the roof's slope towards the deck, the barge boards on the gable
        slope(g, [S3(0, ridge, -1.2), S3(0, ridge, 1.2), S3(1.4, Hh - 0.1, 1.2), S3(1.4, Hh - 0.1, -1.2)], { fill: P.coral, under: C.woodDeep, w, seed: 'bait-roof' });
        for (const k of [-1, 1]) bar3(g, S3(k * 1.42, Hh - 0.12, -1.2), S3(0, ridge + 0.02, -1.2), 0.14, { fill: P.cream, w, seed: 'bait-barge' + k });
        dot(g, ...S(0, ridge - 0.3, -1.02), Math.max(1.8, 0.07 * sc(o3[2])), P.coral);
        // the board: BAIT, in the front's perspective
        slab(g, front.q(0.46, 1.97, 1.94, 2.4, 0.05), { fill: P.cream, w, seed: 'bait-sign', over: 0.9 });
        decal(g, front, 0.5, 1.99, 1.4, 0.39, (c, k) => T.sign(c, 'BAIT', 70, 34, { size: 38, fill: C.red, w: (BG * 0.8) / k, seed: 'bait-t', tilt: 0.05, track: 0.12 }), { out: 0.055, nx: 6, ny: 2 });
        // by the door: fish boxes, a bucket, a rod leaning on the wall
        boxOf(g, S3(1.75, 0, -1.45), [0.6, 0.25, 0.4], PHI + 0.2, { fill: C.blue, w, seed: 'bait-box-a' });
        boxOf(g, S3(1.72, 0.25, -1.43), [0.6, 0.25, 0.4], PHI - 0.1, { fill: C.orange, w, seed: 'bait-box-b' });
        lathe(g, S3(-0.75, 0, -1.4), [[0.12, 0], [0.16, 0.3]], { fill: C.red, w, seed: 'bait-bucket', n: 10, topFill: C.ink });
        ln3(g, [S3(-0.1, 0, -1.25), S3(0.12, 2.6, -1.02)], { w, seed: 'bait-rod' });
    }

    // the board over the pier's entrance: 3 × 1.4 m on two posts 4.1 m high, facing the quay
    function gateway(g) {
        const s0 = 0.25, A = PR(s0, 2.92), B = PR(s0, 0.08), w = lw(A[2]), pl = plane(add(A, [0, 2.6, 0]), LD, UP);
        // knee braces, then the posts
        for (const [k, c] of [['a', A], ['b', B]]) {
            boxOf(g, c, [0.2, 4.1, 0.2], PHI, { fill: { all: C.wood, right: C.woodDeep, left: C.woodDeep }, w, seed: 'gate-post' + k });
            for (const y of [0.9, 1.7, 3.4]) ln(g, [pt(add(c, [-0.02, y, 0])), pt(add(c, [-0.03, y + 0.3, 0]))], { w: w * 0.9, seed: 'gate-grain' + k + y });
            lathe(g, add(c, [0, 4.1, 0]), [[0.16, 0], [0.1, 0.1], [0.02, 0.2]], { fill: P.coral, w, seed: 'gate-cap' + k, n: 8, under: false, top: false });
        }
        // the life ring on its board, on the post nearer the quay's corner
        {
            const rc = [2.84, -1.05], bq = pl.q(rc[0] - 0.42, rc[1] - 0.42, rc[0] + 0.42, rc[1] + 0.42, 0.13);
            slab(g, bq, { fill: C.white, w, seed: 'ring-board', over: 0.8 });
            const circ = (r, n = 20) => Array.from({ length: n }, (_, i) => pl.p(rc[0] + Math.cos((i / n) * Math.PI * 2) * r, rc[1] + Math.sin((i / n) * Math.PI * 2) * r, 0.16));
            T.shape(g, circ(0.33), {
                fill: C.red, w, seed: 'ring', dense: true, amp: 0.15,
                inside: (c) => {
                    c.fillStyle = C.white;
                    for (const a of [0.5, 0.5 + Math.PI / 2, 0.5 + Math.PI, 0.5 - Math.PI / 2]) c.fill(T.pathOf([pl.p(rc[0], rc[1], 0.16), pl.p(rc[0] + Math.cos(a - 0.22) * 0.5, rc[1] + Math.sin(a - 0.22) * 0.5, 0.16), pl.p(rc[0] + Math.cos(a + 0.22) * 0.5, rc[1] + Math.sin(a + 0.22) * 0.5, 0.16)]));
                },
            });
            T.shape(g, circ(0.17, 14), { fill: C.white, w, seed: 'ring-in', dense: true, amp: 0.15 });
        }
        // the board, its edge towards the corner, its frame
        slab(g, [pl.p(2.98, 1.4, 0.12), pl.p(2.98, 1.4, 0.2), pl.p(2.98, 0, 0.2), pl.p(2.98, 0, 0.12)], { fill: C.woodDeep, w, seed: 'gate-edge', over: 0.5 });
        slab(g, pl.q(-0.14, 0, 2.98, 1.4, 0.2), { fill: P.cream, w, seed: 'gate-board', over: 2 });
        slab(g, pl.q(-0.04, 0.1, 2.88, 1.3, 0.2), { fill: null, w: w * 0.85, seed: 'gate-inner', over: 0.4, color: P.fishDeep });
        decal(g, pl, 0.02, 0.12, 2.8, 1.16, (c, k) => {
            T.sign(c, 'GULL', 136, 54, { size: 58, fill: C.red, drop: C.navy, seed: 'gh-a', w: (BG * 0.9) / k, tilt: 0.08 });
            T.sign(c, 'HARBOR', 142, 105, { size: 46, fill: [P.fish, C.roadLine], drop: C.navy, seed: 'gh-b', w: (BG * 0.9) / k, tilt: 0.07 });
        }, { out: 0.205, nx: 14, ny: 5 });
        for (const [u, v] of [[0.0, 0.07], [2.84, 0.07], [2.84, 1.33], [0.0, 1.33]]) dot(g, ...pl.p(u, v, 0.2), 2, C.ink);
        // a gull cut from a plank stands on top of it
        onPlane(g, pl, 0.42, 1.4, (c, k) => {
            const l = BG / k;
            T.shape(c, [[-22, -1, 1], [-15, -13], [-2, -17], [8, -26], [12, -38], [22, -42], [31, -38], [33, -31, 1], [45, -28, 1], [32, -24], [29, -12], [20, -1, 1]], { fill: C.white, w: l, seed: 'gh-gull' });
            T.shape(c, [[-22, -1, 1], [-34, -15, 1], [-13, -11, 1]], { fill: C.grey, w: l, seed: 'gh-gull-t' });
            T.shape(c, [[33, -31, 1], [45, -28, 1], [33, -25, 1]], { fill: C.orange, w: l * 0.9, seed: 'gh-gull-b' });
            T.shape(c, [[-11, -11, 1], [2, -16], [15, -12, 1], [4, -6]], { fill: C.grey, w: l * 0.9, seed: 'gh-gull-w' });
            dot(c, 24, -35, 1.7, C.ink);
        }, 0.2);
    }

    function pier(g) {
        const { w: PW, len, bay } = PIER;
        // under the deck: a bent of two piles every 3 m, cross-braced, a cap beam on each
        const bents = [];
        for (let s = len - 0.5; s > 1; s -= 3) bents.push(s);
        const pile = (s, c) => {
            const f = PR(s, c, WATER);
            lathe(g, f, [[0.16, 0], [0.14, 1.3]], { fill: C.wood, seed: 'pile' + s + c, n: 10, bands: [[0, 0.42, P.woodFar]], top: false });
            ln3(g, [add(f, [0.03, 0.6, -0.14]), add(f, [0.03, 1.05, -0.14])], { seed: 'pile-g' + s + c, w: lw(f[2]) * 0.9 });
            foam(g, [f[0] - 0.08, 0, f[2] - 0.12], 0.55, { seed: 'pf' + s + c });
        };
        for (const s of bents) {
            pile(s, PW - 0.2);
            bar3(g, PR(s, PW - 0.2, -0.45), PR(s, 0.2, -1.25), 0.13, { fill: P.woodFar, seed: 'xa' + s });
            bar3(g, PR(s, PW - 0.2, -1.25), PR(s, 0.2, -0.45), 0.13, { fill: P.woodFar, seed: 'xb' + s });
            bar3(g, PR(s, PW, -0.2), PR(s, 0, -0.2), 0.22, { fill: C.wood, seed: 'cap' + s });
        }
        for (const s of bents) pile(s, 0.2);
        // a waling bolted along the near piles
        for (let i = 0; i < bents.length - 1; i++) {
            const a = bents[i], b = bents[i + 1];
            slab(g, [PR(b, 0.03, -0.72), PR(a, 0.03, -0.72), PR(a, 0.03, -0.92), PR(b, 0.03, -0.92)].map(pt), { fill: C.wood, w: lw(PR(b, 0, 0)[2]), seed: 'wale' + i, over: 0.4 });
        }
        for (const s of bents) dot(g, ...pt(PR(s, 0.02, -0.82)), Math.max(1.2, 0.035 * sc(PR(s, 0, 0)[2])), C.ink);
        // the deck (and the bay that carries the shed), its planks laid across
        const wd = lw(16);
        slab(g, [PR(bay[0], PW), PR(bay[1], PW), PR(bay[1], bay[2]), PR(bay[0], bay[2])].map(pt), { fill: P.deck, w: wd, seed: 'bay', over: 1 });
        slab(g, [PR(0, PW), PR(len, PW), PR(len, 0), PR(0, 0)].map(pt), { fill: P.deck, w: wd, seed: 'deck', over: 1.2 });
        const R = Motion.rng('deck-planks');
        for (let s = 0.45; s < len - 0.2; s += s < 3 ? 0.45 : s < 8 ? 0.9 : s < 15 ? 1.8 : 3.6) {
            const e0 = R(), e1 = R(), inBay = s > bay[0] + 0.1 && s < bay[1] - 0.1;
            ln3(g, [PR(s, e0 < 0.25 ? e0 * 2 : 0.03), PR(s, e1 < 0.25 ? PW - e1 * 2 : inBay ? bay[2] - 0.05 : PW - 0.03)], { seed: 'plank' + s.toFixed(1), w: lw(PR(s, 0, 0)[2]) * 0.8 });
        }
        // the deck's edge towards us: a beam with its bolts
        slab(g, [PR(0, 0, 0), PR(len, 0, 0), PR(len, 0, -0.3), PR(0, 0, -0.3)].map(pt), { fill: C.wood, w: wd, seed: 'fascia', over: 1 });
        for (const s of bents) for (const d of [-0.08, 0.08]) dot(g, ...pt(PR(s + d, 0, -0.15)), Math.max(1.1, 0.03 * sc(PR(s, 0, 0)[2])), C.ink);
        // on the deck, far to near: the far rail beyond the bay, the end rail and its flagstaff,
        // the far lamp, the bay's rail, the shed, the far rail before the bay, the near lamp, the near rail
        rail(g, PR(len - 0.1, PW - 0.1), PR(len - 0.1, 0.1), { seed: 'rail-end', step: 1.4 });
        bar3(g, PR(len - 0.2, 1.5), PR(len - 0.2, 1.5, 5.4), 0.09, { fill: C.white, seed: 'pier-staff' });
        dot(g, ...pt(PR(len - 0.2, 1.5, 5.5)), 2.2, C.roadLine);
        rail(g, PR(len - 0.1, PW - 0.1), PR(bay[1], PW - 0.1), { seed: 'rail-far-b', first: false });
        lamp(g, PR(21, PW - 0.35), { seed: 'lamp-far', arm: mul(LD, 1) });
        rail(g, PR(bay[1], PW - 0.1), PR(bay[1], bay[2] - 0.1), { seed: 'rail-bay' });
        baitShed(g);
        rail(g, PR(bay[0], PW - 0.1), PR(0.55, PW - 0.1), { seed: 'rail-far-a' });
        lamp(g, PR(11.5, 0.35), { seed: 'lamp-near', arm: mul(LD, -1) });
        rail(g, PR(len - 0.1, 0.1), PR(0.55, 0.1), { seed: 'rail-near', first: false });
        gateway(g);
    }

    // --- what stands on the quay ---------------------------------------------------------------------
    // a mooring bollard 0.5 m high: a bed plate, a post that waists in, a mushroom head, the cross pin
    function bollard(g, c, o = {}) {
        const { seed = 'bol', turns = 0 } = o, w = lw(c[2]), side = unit(cross(UP, sub(EYE3, c)));
        for (const k of [-1, 1]) bar3(g, add(c, [0, 0.3, 0]), add(c, add(mul(side, k * 0.19), [0, 0.3, 0])), 0.075, { fill: P.iron, w, seed: seed + 'pin' + k, over: 0.2 });
        lathe(g, c, [[0.21, 0], [0.2, 0.035], [0.125, 0.05], [0.1, 0.2], [0.105, 0.36]], { fill: P.ironLight, w, seed: seed + 'post', top: false });
        // turns of rope round the waist
        for (let i = 0; i < turns; i++) {
            const arc = nearArc(add(c, [0, 0.085 + i * 0.056, 0]), 0.132 - i * 0.004, 16), d = Math.max(2.4, 0.056 * sc(c[2]));
            // where a turn goes round the back we see the tube end-on: a round shoulder each side
            for (const e of [arc[0], arc[arc.length - 1]]) T.shape(g, T.ellipse(e[0], e[1], d * 0.5, d * 0.5, 0, 10), { fill: P.rope, w, seed: seed + 'sh' + i + e[0].toFixed(0), amp: 0.1 });
            rope(g, arc, d, { seed: seed + 'turn' + i, w, dense: true, caps: 'none' });
        }
        lathe(g, c, [[0.105, 0.36], [0.175, 0.39], [0.185, 0.44], [0.15, 0.485], [0.06, 0.5]], { fill: P.iron, w, seed: seed + 'head', under: false });
        T.line(g, nearArc(add(c, [0, 0.44, 0]), 0.185).slice(2, 6), { w, seed: seed + 'gl', color: C.white, dense: true, amp: 0 });
    }
    // a fish box, 0.6 × 0.4 × 0.25 m: a rim, a hand hole on each face we see
    function fishBox(g, o3, yaw, fill, seed) {
        boxOf(g, o3, [0.6, 0.25, 0.4], yaw, {
            fill, w: lw(o3[2]), seed,
            face: (f, pl) => {
                if (f.name === 'top') return void slab(g, pl.q(0.05, 0.05, pl.W - 0.05, pl.H - 0.05), { fill: C.ink, w: lw(o3[2]) * 0.8, seed: seed + 'in', over: 0.2 });
                if (f.name === 'bottom') return;
                ln(g, [pl.p(0, 0.19), pl.p(pl.W, 0.19)], { w: lw(o3[2]) * 0.9, seed: seed + 'rim' + f.name });
                ln(g, [pl.p(pl.W * 0.36, 0.11), pl.p(pl.W * 0.64, 0.11)], { w: lw(o3[2]) * 1.5, seed: seed + 'hand' + f.name, amp: 0 });
            },
        });
    }

    function quayThings(g) {
        // along the lip, far to near (it comes towards us to the right): the rail, a bollard with a
        // line down to a boat below the wall, the hoops of a ladder, fish boxes, another bollard
        rail(g, Q(-3.7, 0.2), Q(-0.75, 0.2), { seed: 'qrail' });
        for (const a of [-0.42, -0.07]) {
            // (they go on down the wall's face, out of sight)
            const hoop = [Q(a, 0.5, 0), Q(a, 0.5, 0.75), Q(a, 0.35, 1.0), Q(a, 0.05, 1.05), Q(a, -0.1, 0.8), Q(a, -0.1, 0.02)].map(pt);
            ln(g, hoop, { w: 3.4, seed: 'lad' + a });
            ln(g, hoop, { w: 1.5, seed: 'lad' + a, color: C.roadLine });
        }
        // a bollard with a line made fast, running down over the lip to a boat below the wall
        rope3(g, [Q(0.62, 0.66, 0.16), Q(0.68, 0.36, 0.05), Q(0.74, 0.03, 0.02), Q(0.76, -0.04, 0.0)], 0.045, { seed: 'lip-line-a', lay: false });
        bollard(g, Q(0.55, 0.8), { seed: 'lip-bol-a', turns: 2 });
        // let into the stone: a drain grating, an iron ring on its plate
        {
            const a = 5.0, b = 5.9, q = [Q(a, b), Q(a + 0.6, b), Q(a + 0.6, b + 0.42), Q(a, b + 0.42)].map(pt);
            slab(g, q, { fill: P.iron, w: BG, seed: 'drain', over: 0.8 });
            for (let i = 1; i < 7; i++) ln(g, [pt(Q(a + (0.6 * i) / 7, b + 0.05)), pt(Q(a + (0.6 * i) / 7, b + 0.37))], { w: 1.8, seed: 'drain-b' + i });
        }
        {
            const c = [-0.95, 0, 5.0];
            slab(g, [[c[0] - 0.09, 0, c[2] + 0.16], [c[0] + 0.09, 0, c[2] + 0.16], [c[0] + 0.09, 0, c[2] + 0.02], [c[0] - 0.09, 0, c[2] + 0.02]].map(pt), { fill: P.ironLight, w: 1.9, seed: 'ring-plate', over: 0.5 });
            const el = Cam.circle([c[0], 0.012, c[2] - 0.06], 0.12, 16);
            T.line(g, el, { w: 5, seed: 'ring-out', closed: true, dense: true, amp: 0.1 });
            T.line(g, el, { w: 1.7, seed: 'ring-out', closed: true, dense: true, amp: 0.1, color: P.ironLight });
        }
    }

    /**
     * The dinghy on its launching trolley: 3 m long, 1.2 m in the beam, clinker built, standing
     * upright on its keel 0.2 m off the stone, low between its wheels, bow towards us. Its gunwale is above the camera's
     * eye, so we see the outside of the hull and nothing of the inside.
     */
    function dinghy(g) {
        const kh = 0.2, fr = frame([DINGHY.o[0], kh, DINGHY.o[2]], DINGHY.yaw), w = BG;
        const hl = hullOf(fr, 3, 1.2, { sheer: [0.5, 0.45, 0.63], transom: 0.82, rake: 0.07, fore: 0.5, n: 14, bowOn: true });
        const S = (x, y, z) => fr.w(x, y, z);
        // a wheel: a tyre 0.4 m across standing in the plane of the hull's length
        const wheel = (z, seed) => {
            const c = S(-0.15, 0.2 - kh, z), ringAt = (dz, r, n = 18) => Array.from({ length: n }, (_, i) => pt(add(add(c, mul(fr.Z, dz)), add(mul(fr.X, Math.cos((i / n) * Math.PI * 2) * r), [0, Math.sin((i / n) * Math.PI * 2) * r, 0]))));
            const out = Math.sign(z) * 0.045;
            union(g, [hull2d([...ringAt(-out, 0.2), ...ringAt(out, 0.2)])], { fill: C.ink, w, seed });
            const nearSide = dot3(mul(fr.Z, out), sub(EYE3, c)) > 0 ? out : -out;
            T.shape(g, ringAt(nearSide, 0.2), { fill: '#2b2f38', w: w * 0.8, seed: seed + 'f', dense: true, amp: 0.1 });
            T.shape(g, ringAt(nearSide, 0.1, 12), { fill: P.ironLight, w: w * 0.9, seed: seed + 'h', dense: true, amp: 0.1 });
            dot(g, ...pt(add(c, mul(fr.Z, nearSide))), 2.6, C.ink);
        };
        const nearZ = hl.near * 0.66;
        wheel(-nearZ, 'dg-wheel-far');
        // the trolley: axle, drawbar with a prop under its handle, two cradles under the bilge
        bar3(g, S(-0.15, 0.2 - kh, -0.62), S(-0.15, 0.2 - kh, 0.62), 0.06, { fill: P.iron, seed: 'dg-axle' });
        for (const x of [-0.15, 0.85]) for (const k of [-1, 1]) bar3(g, S(x, 0.22 - kh, k * 0.5), S(x, hl.sy((x + 1.5) / 3) * 0.42, k * hl.hb((x + 1.5) / 3) * 0.86), 0.06, { fill: P.iron, seed: 'dg-cr' + x + k });
        bar3(g, S(-1.2, 0.2 - kh, 0), S(2.15, 0.26 - kh, 0), 0.07, { fill: P.iron, seed: 'dg-bar' });
        bar3(g, S(2.05, 0.26 - kh, 0), S(2.0, -kh, 0), 0.05, { fill: P.iron, seed: 'dg-prop' });
        bar3(g, S(2.15, 0.26 - kh, -0.16), S(2.15, 0.26 - kh, 0.16), 0.05, { fill: P.ironLight, seed: 'dg-handle' });
        // the oars shipped, their blades resting on the bow
        for (const [k, z] of [['a', -0.2], ['b', 0.12]]) {
            const b0 = S(0.55, hl.sy(0.68) + 0.04, z * 0.9), b1 = S(1.2, hl.sy(0.9) + 0.1, z * 0.5), s = sc(b0[2]);
            bar3(g, S(-1.0, hl.sy(0.2) - 0.02, z), b0, 0.05, { fill: P.spar, seed: 'dg-oar' + k });
            sh(g, T.ribbon([pt(b0), pt(lerp3(b0, b1, 0.5)), pt(b1)], 0.06 * s, 0.11 * s, { mid: 0.15 * s }), { fill: P.spar, w, seed: 'dg-blade' + k, dense: true });
        }
        // the outboard on the transom: its cowl with a band, the tiller folded forward
        boxOf(g, S(-1.63, hl.sy(0) - 0.05, 0), [0.26, 0.3, 0.2], DINGHY.yaw, {
            fill: P.iron, w, seed: 'dg-ob',
            face: (f, pl) => {
                if (f.name === 'top' || f.name === 'bottom') return;
                g.fillStyle = C.red;
                g.fill(T.pathOf(pl.q(0, 0.16, pl.W, 0.22)));
            },
        });
        bar3(g, S(-1.5, hl.sy(0) + 0.12, 0), S(-1.05, hl.sy(0.15) + 0.1, 0.08), 0.035, { fill: P.ironLight, seed: 'dg-tiller' });
        // the hull: cream, a coral sheer strake, the lands of its planks
        union(g, hl.quads, { fill: P.cream, w, seed: 'dg-hull' });
        hl.band(g, 0, 0.17, P.coral);
        if (hl.stern) T.shape(g, hl.transom, { fill: P.cream, w, seed: 'dg-transom', dense: true, amp: 0.2 });
        for (const t of [0.17, 0.36, 0.56, 0.76]) hl.lines(g, t, { w: t < 0.2 ? w : w * 0.9, seed: 'dg-land', u1: 0.985 });
        // the gunwale's own line, and the stem: a post from the forefoot to a head above the sheer
        bar3(g, hl.at3(1, 0.6, 1), add(hl.at3(1, 0, 1), [0, 0.05, 0]), 0.05, { fill: P.coral, w, seed: 'dg-stempost' });
        // the keel's line under the forefoot, a ring in the stem with the painter coiled on the bar
        dot(g, ...pt(hl.at3(1, 0.3, 1)), 3, P.ironLight);
        rope3(g, [hl.at3(1, 0.3, 1), S(1.9, 0.5 - kh, 0.05), S(2.05, 0.3 - kh, 0)], 0.03, { seed: 'dg-painter', lay: false });
        // name on the bow of the side we see
        {
            const sg = hl.near, a = hl.at3(0.66, 0.045, sg), b = hl.at3(0.86, 0.045, sg), c = hl.at3(0.66, 0.15, sg);
            const flip = pt(b)[0] < pt(a)[0], u = unit(sub(b, a)), pl = plane(flip ? b : a, flip ? mul(u, -1) : u, unit(sub(a, c))), wm = len3(sub(b, a)), hm = len3(sub(a, c));
            if (hl.facing(0.76, 0.1, sg)) decal(g, pl, 0, -hm, wm, hm, (cg) => chalk(cg, 'PUFFIN', wm * 50, hm * 88, hm * 92, { seed: 'dg-name', align: 'center' }), { nx: 4, ny: 1 });
        }
        wheel(nearZ, 'dg-wheel-near');
    }

    // --- Aunt Dot's chip hut ----------------------------------------------------------------------
    // A box 3 × 2.4 × 2.2 m in its frame hutF (x along the front, z into the hut; the front wall
    // is z = −1.1). Everything on a wall is placed in metres on that wall's plane.
    const hutFront = wallOf(hutF, HUT.w, HUT.d, 'front'), hutRight = wallOf(hutF, HUT.w, HUT.d, 'right');
    const HW = lw(HUT.o[2]);
    const hatchQuad = () => hutFront.q(HUT.hatch[0], HUT.hatch[2], HUT.hatch[1], HUT.hatch[3]);
    // a bottle, a jar, a shaker: small turned things
    const turned = (g, c, prof, fill, seed, o = {}) => lathe(g, c, prof, { fill, w: HW * 0.9, seed, n: 10, ...o });

    // what Dot keeps inside, seen through the hatch: the back wall 2.1 m behind the front one
    function hutInside(g) {
        const S3 = hutF.w, back = plane(S3(-1.42, 0, 1.02), hutF.X, UP);
        slab(g, back.q(0, 0.3, 2.84, 2.34), { fill: P.inside, w: HW, seed: 'in-back', over: 0.3 });
        // the fryer's hood in the corner
        boxOf(g, S3(1.0, 1.42, 0.62), [0.8, 0.7, 0.72], HUT.yaw, {
            fill: { all: C.greyDeep, bottom: P.iron }, w: HW, seed: 'hood',
            face: (f, pl) => {
                if (f.name !== 'front') return;
                ln(g, [pl.p(0.06, 0.14), pl.p(pl.W - 0.06, 0.14)], { w: HW, seed: 'hood-l' });
                for (const u of [0.22, 0.4, 0.58]) ln(g, [pl.p(u, 0.3), pl.p(u, 0.52)], { w: HW * 0.9, seed: 'hood-v' + u });
            },
        });
        // a rail of tools on the back wall: a fish slice, a ladle, a frying basket
        ln(g, [back.p(0.2, 2.02, 0.03), back.p(1.75, 2.02, 0.03)], { w: HW, seed: 'tool-rail' });
        onPlane(g, back, 0.42, 2.02, (c, k) => {
            const l = HW / k;
            T.line(c, [[0, 0], [0, 13]], { w: l, seed: 'slice-h' });
            T.slab(c, [[-7, 13], [7, 13], [8, 27], [-8, 27]], { fill: C.grey, w: l, seed: 'slice', over: 0.5 });
            for (const x of [-3.5, 0, 3.5]) T.line(c, [[x, 16], [x, 24]], { w: l * 0.8, seed: 'slice-s' + x });
            T.line(c, [[34, 0], [34, 20]], { w: l, seed: 'ladle-h' });
            T.shape(c, [[26, 20, 1], [28, 29], [34, 32], [41, 29], [43, 20, 1]], { fill: C.grey, w: l, seed: 'ladle' });
            T.line(c, [[68, 0], [68, 11]], { w: l, seed: 'basket-h' });
            const bk = T.shape(c, [[56, 11, 1], [59, 29], [68, 33], [78, 29], [81, 11, 1]], { fill: C.roadLine, w: l, seed: 'basket' });
            netting(c, bk, 5, { w: l * 0.75, seed: 'basket-n' });
        }, 0.03);
        // a shelf with jars (pickled eggs, onions) and a radio
        const jar = (x, r, h, fill, lid, seed) => {
            turned(g, S3(x, 1.46, 0.9), [[r, 0], [r, h]], fill, seed, { top: false, under: false });
            turned(g, S3(x, 1.46 + h, 0.9), [[r * 1.08, 0], [r * 1.08, 0.035]], lid, seed + 'lid', { top: false, under: false });
        };
        jar(-1.12, 0.085, 0.21, C.glass, C.red, 'jar-a');
        for (const [dx, dy] of [[-0.03, 0.05], [0.035, 0.06], [-0.005, 0.12], [0.04, 0.15]]) {
            const [ex, ey] = pt(S3(-1.12 + dx, 1.46 + dy, 0.82));
            T.shape(g, T.ellipse(ex, ey, 4.6, 3.9, 0.3, 8), { fill: C.white, w: HW * 0.75, seed: 'egg' + dx, dense: true });
        }
        jar(-0.86, 0.07, 0.17, C.lime, C.roadLine, 'jar-b');
        boxOf(g, S3(-0.42, 1.46, 0.9), [0.34, 0.19, 0.12], HUT.yaw, {
            fill: C.salmon, w: HW, seed: 'radio',
            face: (f, pl) => {
                if (f.name !== 'front') return;
                dot(g, ...pl.p(0.09, 0.095), 0.055 * sc(HUT.o[2] + 0.9), C.ink);
                for (const v of [0.05, 0.095, 0.14]) ln(g, [pl.p(0.18, v), pl.p(0.3, v)], { w: HW * 0.8, seed: 'radio-l' + v });
            },
        });
        ln3(g, [S3(-0.28, 1.65, 0.9), S3(-0.2, 1.95, 0.9)], { w: HW * 0.9, seed: 'radio-aer' });
        boxOf(g, S3(-0.62, 1.42, 0.9), [1.5, 0.04, 0.24], HUT.yaw, { fill: { all: C.wood, bottom: C.woodDeep }, w: HW, seed: 'shelf', over: 0.4 });
        // today's fish on a card, a bulb on its flex
        const cq = back.q(2.0, 0.95, 2.36, 1.3, 0.02);
        slab(g, cq, { fill: P.cream, w: HW * 0.9, seed: 'card', over: 0.6 });
        onPlane(g, back, 2.03, 1.27, (c) => {
            chalk(c, 'COD', 2, 13, 13, { color: C.ink, seed: 'card-a' });
            chalk(c, 'HAKE', 2, 28, 13, { color: C.red, seed: 'card-b' });
        }, 0.025);
        ln3(g, [S3(-0.98, 2.36, 0.3), S3(-0.98, 2.1, 0.3)], { w: HW * 0.9, seed: 'flex' });
        const [bx, by] = pt(S3(-0.98, 2.03, 0.3)), bs = sc(HUT.o[2] + 0.3);
        T.shape(g, T.ellipse(bx, by, 0.05 * bs, 0.065 * bs, 0, 9), { fill: C.yellow, w: HW * 0.9, seed: 'bulb', dense: true });
    }

    // The counter (its board 1.05 m up, 0.4 deep, 0.3 of it outside the wall) and what stands on
    // it. Drawn with the hut and again over whoever serves (Harbor.counter). We look up at it:
    // its edge and underside show, not its top.
    function counterTop(g) {
        const S3 = hutF.w;
        // on it, back row first: sauce bottles and vinegar at one end, the bell, cones and salt at the other
        const bottle = (x, fill, seed) => {
            turned(g, S3(x, 1.05, -1.22), [[0.04, 0], [0.043, 0.13], [0.022, 0.17]], fill, seed, { top: false, under: false, bands: [[0.045, 0.11, C.white]] });
            turned(g, S3(x, 1.22, -1.22), [[0.02, 0], [0.008, 0.075]], C.white, seed + 'n', { top: false, under: false });
        };
        bottle(-0.84, C.red, 'sauce-k');
        bottle(-0.7, C.roadLine, 'sauce-m');
        turned(g, S3(-0.55, 1.05, -1.2), [[0.038, 0], [0.04, 0.11], [0.02, 0.17], [0.018, 0.23]], C.trunk, 'vinegar', { top: false, under: false });
        turned(g, S3(-0.55, 1.28, -1.2), [[0.022, 0], [0.022, 0.03]], C.grey, 'vinegar-cap', { top: false, under: false });
        turned(g, S3(-0.02, 1.05, -1.24), [[0.06, 0], [0.055, 0.03], [0.03, 0.055], [0.008, 0.062]], C.roadLine, 'bell', { top: false, under: false });
        dot(g, ...pt(S3(-0.02, 1.122, -1.24)), 1.7, C.ink);
        // paper cones stacked in their holder: flat triangles facing the front
        for (let i = 3; i >= 0; i--) {
            const y = 1.2 + i * 0.045, q = [S3(0.3, y + 0.16, -1.22), S3(0.46, y + 0.16, -1.22), S3(0.38, y - 0.08, -1.22)].map(pt);
            poly(g, q, { fill: P.cream, w: HW * 0.9, seed: 'cone' + i });
            ln(g, [mix(q[0], q[1], 0.3), mix(q[0], q[2], 0.8)], { w: HW * 0.8, seed: 'cone-l' + i, color: C.red });
        }
        turned(g, S3(0.38, 1.05, -1.22), [[0.07, 0], [0.085, 0.13]], C.greyDeep, 'cone-holder', { top: false, under: false });
        turned(g, S3(0.6, 1.05, -1.2), [[0.045, 0], [0.048, 0.1], [0.035, 0.13]], C.white, 'salt', { top: false, under: false });
        turned(g, S3(0.6, 1.18, -1.2), [[0.037, 0], [0.03, 0.03]], C.grey, 'salt-cap', { top: false, under: false });
        onPlane(g, plane(S3(0.57, 1.06, -1.25), hutF.X, UP), 0, 0.085, (c) => chalk(c, 'S', 0, 8, 9, { color: C.blue, seed: 'salt-s' }));
        // the board itself
        boxOf(g, S3(-0.15, 0.99, -1.2), [1.86, 0.06, 0.4], HUT.yaw, { fill: { all: C.wood, bottom: C.woodDeep, top: P.deck }, w: HW, seed: 'counter', over: 0.8 });
        const fq = plane(S3(-1.08, 0.99, -1.4), hutF.X, UP);
        for (const [u, L] of [[0.3, 0.22], [0.86, 0.15], [1.42, 0.2]]) ln(g, [fq.p(u, 0.03), fq.p(u + L, 0.03)], { w: HW * 0.8, seed: 'counter-t' + u });
    }

    function hut(g) {
        const S3 = hutF.w, S = hutF.s, F_ = hutFront, R_ = hutRight, [u0, u1, v0, v1] = HUT.hatch, w = HW;
        // behind the walls: the flue up through the roof, the stays of the sign
        lathe(g, S3(0.6, 2.5, 0.75), [[0.09, 0], [0.09, 1.0]], { fill: C.grey, w, seed: 'flue', rings: [0.3, 0.75], top: false, under: false, n: 12 });
        for (const k of [-0.06, 0.06]) ln3(g, [S3(0.6 + k, 3.5, 0.75), S3(0.6 + k, 3.6, 0.75)], { w, seed: 'flue-l' + k });
        lathe(g, S3(0.6, 3.58, 0.75), [[0.2, 0], [0.03, 0.17]], { fill: C.greyDeep, w, seed: 'flue-hat', n: 12, top: false });
        for (const x of [-1.0, 1.0]) ln3(g, [S3(x, 3.5, -0.86), S3(x, 2.5, 0.2)], { w, seed: 'sign-stay' + x });
        // the roof is a board 0.1 m thick that oversails the walls: its underside first
        const roof = Cam.box(S3(0, HUT.h, -0.08), [3.3, 0.1, 2.56], HUT.yaw);
        for (const f of roof) if (f.name === 'bottom') slab(g, f.pts, { fill: P.hutDeep, w, seed: 'hut-soffit', over: 1 });
        // the side wall: planks, the fuse box and its pipe
        slab(g, R_.q(0, 0, HUT.d, HUT.h), { fill: P.hutSide, w, seed: 'hut-side', over: 1.4 });
        planksOn(g, R_, 0.12, HUT.d, 0.12, HUT.h, 0.26, { seed: 'hut-side-pl', skip: 0.06, w });
        slab(g, R_.q(0, 0, HUT.d, 0.12), { fill: P.hutDeep, w, seed: 'hut-side-kick', over: 0.8 });
        slab(g, R_.q(0.5, 1.35, 0.82, 1.78, 0.07), { fill: C.grey, w: w * 0.9, seed: 'fuse', over: 0.6 });
        ln(g, [R_.p(0.66, 1.39, 0.07), R_.p(0.66, 1.74, 0.07)], { w: w * 0.9, seed: 'fuse-d' });
        dot(g, ...R_.p(0.74, 1.56, 0.07), 1.6, C.red);
        ln(g, [R_.p(0.66, 1.35, 0.03), R_.p(0.67, 0.14, 0.03)], { w, seed: 'fuse-pipe' });
        // the front wall: teal planks, a kick board, a cream post on the corner
        slab(g, F_.q(0, 0, HUT.w, HUT.h), { fill: P.hut, w, seed: 'hut-front', over: 1.6 });
        planksOn(g, F_, 0, HUT.w - 0.12, 0.12, HUT.h, 0.25, { seed: 'hut-pl', skip: 0.05, w });
        const RN = Motion.rng('hut-nails');
        for (let i = 0; i < 16; i++) dot(g, ...F_.p(0.2 + RN() * 2.5, RN() < 0.5 ? 0.95 - RN() * 0.04 : 0.2 + RN() * 0.03), 1.5, C.ink);
        slab(g, F_.q(0, 0, HUT.w, 0.12), { fill: P.hutDeep, w, seed: 'hut-kick', over: 1 });
        slab(g, F_.q(HUT.w - 0.13, 0, HUT.w, HUT.h), { fill: P.cream, w, seed: 'hut-post', over: 1.2 });
        slab(g, R_.q(0, 0, 0.13, HUT.h), { fill: '#ecdcb8', w, seed: 'hut-post-s', over: 1.2 });
        // the hatch: the dark of the hut and what is in it
        slab(g, hatchQuad(), { fill: P.insideDeep, w, seed: 'hatch', over: 1.2, inside: hutInside });
        // the shutter, rolled up: its last slats and the cord
        slab(g, F_.q(u0, v1 - 0.09, u1, v1, 0.02), { fill: C.grey, w, seed: 'shutter', over: 0.6 });
        for (const v of [0.03, 0.06]) ln(g, [F_.p(u0, v1 - v, 0.02), F_.p(u1, v1 - v, 0.02)], { w: w * 0.85, seed: 'shutter-s' + v });
        ln(g, [F_.p(u1 - 0.1, v1 - 0.09, 0.02), F_.p(u1 - 0.1, v1 - 0.4, 0.02)], { w: w * 0.9, seed: 'cord' });
        T.shape(g, T.ellipse(...F_.p(u1 - 0.1, v1 - 0.43, 0.02), 3.6, 3.6, 0, 8), { fill: null, w: w * 0.9, seed: 'cord-ring', dense: true });
        // the frame of the hatch
        for (const [a, k] of [[u0 - 0.09, 'l'], [u1, 'r']]) slab(g, F_.q(a, v0 - 0.02, a + 0.09, v1, 0.03), { fill: P.cream, w, seed: 'hatch-j' + k, over: 0.7 });
        // under the counter: the hut's fish on a roundel, a poster by the hatch, brackets
        const rc = [1.35, 0.52], disc = (r, n) => Array.from({ length: n }, (_, i) => F_.p(rc[0] + Math.cos((i / n) * Math.PI * 2) * r, rc[1] + Math.sin((i / n) * Math.PI * 2) * r, 0.02));
        T.shape(g, disc(0.34, 22), { fill: P.cream, w, seed: 'roundel', dense: true, amp: 0.2 });
        T.shape(g, disc(0.285, 20), { fill: null, w: w * 0.85, seed: 'roundel-in', dense: true, amp: 0.2, color: P.coral });
        onPlane(g, F_, rc[0], rc[1], (c, k) => fish(c, 0, 0, 21, { seed: 'roundel-fish', rot: -0.1, w: w / k }), 0.02);
        slab(g, F_.q(0.1, 1.16, 0.43, 1.72, 0.015), { fill: C.yellow, w, seed: 'poster', over: 0.9 });
        onPlane(g, F_, 0.1, 1.72, (c) => {
            chalk(c, '2 FOR', 3, 15, 13, { color: C.red, seed: 'poster-a', rot: -0.04 });
            chalk(c, '1', 9, 50, 36, { color: P.navy, seed: 'poster-b', rot: 0.06 });
        }, 0.02);
        for (const [a, b] of [[0.14, 1.69], [0.39, 1.69]]) dot(g, ...F_.p(a, b, 0.02), 1.7, C.red);
        for (const x of [-0.86, 0.56]) poly(g, [S(x, 0.99, -1.36), S(x, 0.99, -1.1), S(x, 0.7, -1.1), S(x, 0.74, -1.15)], { fill: P.cream, w, seed: 'bracket' + x });
        counterTop(g);
        // the roof's edges
        for (const f of roof) if (f.name !== 'bottom') slab(g, f.pts, { fill: P.cream, w, seed: 'hut-roof' + f.name, over: 1.4 });
        // the awning over the hatch: 0.9 m out, falling 0.4 m; stripes 0.2 m wide, a scalloped valance
        const ax0 = -1.15, n = 10, sw = 0.2, top = [2.38, -1.1], out = [1.92, -2.0];
        for (const x of [ax0, ax0 + n * sw]) ln3(g, [S3(x, 1.72, -1.1), S3(x, out[0], out[1])], { w: w * 1.1, seed: 'awn-arm' + x });
        for (let i = 0; i < n; i++) {
            const x = ax0 + i * sw;
            sh(g, [[...S(x, out[0], out[1]), 1], [...S(x + sw, out[0], out[1]), 1], [...S(x + sw, out[0] - 0.13, out[1]), 1], S(x + sw / 2, out[0] - 0.2, out[1]), [...S(x, out[0] - 0.13, out[1]), 1]], { fill: i % 2 ? P.cream : P.coral, w: w * 0.9, seed: 'val' + i });
        }
        slope(g, [S3(ax0, top[0], top[1]), S3(ax0 + n * sw, top[0], top[1]), S3(ax0 + n * sw, out[0], out[1]), S3(ax0, out[0], out[1])], {
            fill: P.cream, under: P.parasolUnder, w, seed: 'awning', over: 1.2,
            inside: (c) => {
                c.fillStyle = P.coral;
                for (let i = 0; i < n; i += 2) c.fill(T.pathOf([S(ax0 + i * sw, top[0], top[1]), S(ax0 + (i + 1) * sw, top[0], top[1]), S(ax0 + (i + 1) * sw, out[0], out[1]), S(ax0 + i * sw, out[0], out[1])]));
            },
        });
        for (let i = 1; i < n; i++) ln(g, [S(ax0 + i * sw, top[0], top[1]), S(ax0 + i * sw, out[0], out[1])], { w: w * 0.85, seed: 'awn-l' + i });
        // the sign on the roof: a navy board 2.6 × 0.9 m on two legs, DOT'S CHIPS, bulbs all round
        for (const x of [-1.0, 1.0]) boxOf(g, S3(x, 2.5, -0.9), [0.1, 0.26, 0.1], HUT.yaw, { fill: C.wood, w, seed: 'sign-leg' + x, over: 0.5 });
        const B_ = plane(S3(-1.3, 2.74, -0.94), hutF.X, UP);
        boxOf(g, S3(0, 2.74, -0.9), [2.6, 0.9, 0.08], HUT.yaw, { fill: { all: C.woodDeep, front: P.navy }, w, seed: 'dot-board', over: 1.8 });
        slab(g, B_.q(0.08, 0.07, 2.52, 0.83), { fill: null, w: w * 0.85, seed: 'dot-inner', over: 0.4, color: P.cream });
        decal(g, B_, 0.1, 0.06, 2.4, 0.8, (c, k) => {
            T.sign(c, "DOT'S", 62, 31, { size: 33, fill: C.white, drop: P.coral, seed: 'dot-a', tilt: 0.1, w: BG / k });
            T.sign(c, 'CHIPS', 136, 72, { size: 51, fill: C.roadLine, drop: P.coral, seed: 'dot-b', tilt: 0.08, track: 0.06, w: BG / k });
        }, { out: 0.005, nx: 12, ny: 4 });
        // the fish jumps over the board
        onPlane(g, B_, 1.96, 0.9, (c, k) => fish(c, 0, 0, 41, { seed: 'sign-fish', rot: -0.16, w: BG / k }), 0.03);
        const bulbs = [];
        for (let i = 0; i <= 11; i++) if (i < 7 || i > 10) bulbs.push([(2.6 * i) / 11, 0.9]);
        for (let i = 1; i <= 3; i++) bulbs.push([2.6, (0.9 * i) / 4], [0, (0.9 * i) / 4]);
        for (let i = 0; i <= 11; i++) bulbs.push([(2.6 * i) / 11, 0]);
        for (const [i, [a, b]] of bulbs.entries()) T.shape(g, T.ellipse(...B_.p(a, b, 0.03), 5, 5, 0, 9), { fill: i % 3 === 0 ? C.white : i % 3 === 1 ? C.yellow : P.coral, w: w * 0.85, seed: 'bulb' + i, dense: true });
    }

    // what stands round the hut, far to near
    function hutThings(g) {
        const S3 = hutF.w, w = HW;
        // Dot's old longboard leaning on the side wall: 2.3 m, its foot 0.5 m out from the wall
        {
            const foot = hutRight.w(1.5, 0, 0.5), head = hutRight.w(1.58, 2.24, 0.03), pl = plane(foot, hutF.Z, unit(sub(head, foot))), L = len3(sub(head, foot));
            const o = [[0, L, 1], [0.15, L * 0.84], [0.25, L * 0.55], [0.24, L * 0.22], [0.13, L * 0.03], [0, 0], [-0.13, L * 0.03], [-0.24, L * 0.22], [-0.25, L * 0.55], [-0.15, L * 0.84]].map(([a, b, c]) => [...pl.p(a, b), c]);
            sh(g, o, {
                fill: P.cream, w, seed: 'surf',
                inside: (c) => {
                    c.fillStyle = P.coral;
                    c.fill(T.pathOf(pl.q(-0.3, L * 0.3, 0.3, L * 0.4)));
                    c.fillStyle = P.fish;
                    c.fill(T.pathOf(pl.q(-0.3, L * 0.24, 0.3, L * 0.28)));
                },
            });
            ln(g, [pl.p(0, L * 0.04), pl.p(0, L * 0.5), pl.p(0, L * 0.96)], { w: w * 0.85, seed: 'surf-stringer' });
            onPlane(g, pl, 0.02, L * 0.66, (c, k) => fish(c, 0, 0, 11, { rot: -1.5, w: (w * 0.85) / k, seed: 'surf-fish' }));
        }
        // the gas bottle by the side wall, its hose to the hut
        {
            const c = S3(1.8, 0, 0.35);
            rope3(g, [add(c, [0, 0.74, 0]), add(c, [-0.05, 0.92, 0.05]), hutRight.w(1.3, 0.95, 0.05), hutRight.w(1.2, 0.7, 0.02)], 0.03, { seed: 'gas-hose', lay: false, fill: C.ink });
            lathe(g, c, [[0.15, 0], [0.16, 0.05], [0.16, 0.5], [0.12, 0.6], [0.06, 0.63]], { fill: C.orange, w, seed: 'gas', rings: [0.12, 0.46], top: false });
            lathe(g, c, [[0.1, 0.6], [0.1, 0.74]], { fill: P.iron, w, seed: 'gas-collar', top: false, n: 12 });
            ln3(g, [add(c, [-0.08, 0.2, -0.12]), add(c, [-0.08, 0.4, -0.12])], { w, seed: 'gas-gl', color: C.white });
        }
        // crates and a sack of spuds under the left of the counter
        boxOf(g, S3(-1.16, 0, -1.5), [0.62, 0.42, 0.44], HUT.yaw + 0.12, {
            fill: { all: C.wood, top: P.deck }, w, seed: 'crate-a',
            face: (f, pl) => {
                if (f.name === 'top' || f.name === 'bottom') return;
                for (const v of [0.14, 0.28]) ln(g, [pl.p(0, v), pl.p(pl.W, v)], { w, seed: 'crate-a' + f.name + v });
                for (const u of [0.07, pl.W - 0.07]) ln(g, [pl.p(u, 0), pl.p(u, pl.H)], { w, seed: 'crate-av' + f.name + u });
            },
        });
        fishBox(g, S3(-1.14, 0.42, -1.5), HUT.yaw - 0.1, C.blue, 'crate-b');
        {
            const c = S3(-0.62, 0, -1.42), pl = plane(c, hutF.X, UP);
            onPlane(g, pl, 0, 0, (cg, k) => {
                const l = w / k;
                T.shape(cg, [[-24, 0, 1], [-27, -34], [-21, -60], [-12, -70, 1], [-6, -64], [6, -72, 1], [16, -58], [25, -32], [23, 0, 1]], { fill: P.sack, w: l, seed: 'sack' });
                T.line(cg, [[-17, -63], [-6, -59], [10, -64]], { w: l, seed: 'sack-tie' });
                chalk(cg, 'SPUDS', -19, -20, 15, { color: C.maroon, seed: 'sack-t', rot: -0.06 });
                T.line(cg, [[-21, -42], [-18, -50]], { w: l * 0.9, seed: 'sack-f1' });
                T.line(cg, [[19, -8], [21, -18]], { w: l * 0.9, seed: 'sack-f2' });
            });
        }
        // the menu: a chalk board on an A frame, turned to the passers-by
        {
            const fa = frame(S3(1.5, 0, -2.15), HUT.yaw - 0.45), a = fa.w(-0.31, 0, -0.2), b = fa.w(-0.31, 0.78, 0.0), pl = plane(a, fa.X, unit(sub(b, a))), L = len3(sub(b, a));
            for (const x of [-0.29, 0.29]) bar3(g, fa.w(x, 0.76, 0.02), fa.w(x, 0, 0.26), 0.045, { fill: C.wood, w, seed: 'menu-leg' + x });
            slab(g, pl.q(0, 0, 0.62, L), { fill: C.wood, w, seed: 'menu-frame', over: 1.3 });
            slab(g, pl.q(0.05, 0.07, 0.57, L - 0.06), { fill: P.chalk, w: w * 0.85, seed: 'menu-board', over: 0.4 });
            decal(g, pl, 0.05, 0.07, 0.52, L - 0.13, (c) => {
                chalk(c, 'MENU', 26, 14, 14.5, { seed: 'menu-a', align: 'center', rot: -0.04, color: C.roadLine });
                c.strokeStyle = C.white;
                c.lineWidth = 1;
                c.beginPath();
                c.moveTo(7, 18.5);
                c.lineTo(45, 17.5);
                c.stroke();
                for (const [i, [t, p]] of [['CHIPS', '2'], ['FISH', '3'], ['PEAS', '1'], ['TEA', '1']].entries()) {
                    chalk(c, t, 5, 30.5 + i * 10.6, 10.5, { seed: 'menu-r' + i, rot: -0.03 });
                    chalk(c, p, 40, 30.5 + i * 10.6, 10.5, { seed: 'menu-p' + i, rot: -0.03, color: C.salmon });
                }
            }, { nx: 3, ny: 5, out: 0.004 });
        }
        // the bin by the corner: a drum with a domed lid and a flap, a cup left on it, a wrapper on the ground
        {
            const c = S3(2.05, 0, -1.5), s = sc(c[2]), toCam = unit([-c[0], 0, -c[2]]), pl = plane(add(c, mul(toCam, 0.27)), unit(cross(UP, toCam)), UP);
            lathe(g, c, [[0.25, 0], [0.27, 0.72]], { fill: C.green, w, seed: 'bin', rings: [0.08, 0.64], top: false, n: 20 });
            lathe(g, c, [[0.29, 0.72], [0.27, 0.8], [0.17, 0.9], [0.05, 0.93]], { fill: P.hutDeep, w, seed: 'bin-lid', under: false, n: 20 });
            slab(g, pl.q(-0.13, 0.76, 0.13, 0.87, 0.02), { fill: C.ink, w: w * 0.85, seed: 'bin-flap', over: 0.4 });
            slab(g, pl.q(-0.15, 0.25, 0.15, 0.5), { fill: C.white, w: w * 0.85, seed: 'bin-label', over: 0.5 });
            onPlane(g, pl, 0, 0.375, (cg, k) => fish(cg, 0, 0, 10.5, { w: (w * 0.85) / k, seed: 'bin-fish', flip: true }));
            const [wx, wy] = pt(add(c, [0.42, 0, -0.2]));
            sh(g, [[wx - 0.1 * s, wy, 1], [wx - 0.06 * s, wy - 0.06 * s], [wx + 0.04 * s, wy - 0.035 * s, 1], [wx + 0.08 * s, wy + 0.01 * s], [wx, wy + 0.02 * s]], { fill: P.cream, w: w * 0.85, seed: 'wrapper' });
        }
    }

    // --- the café table by the hut -----------------------------------------------------------------
    // Table 0.75 m high, its top 0.8 across (above the camera's eye: we see its edge and a sliver
    // of its underside); two stools 0.45 high; a parasol 2.3 m high and 1.9 across, seen from below.
    function cafe(g) {
        const c = TABLE, w = lw(c[2]);
        const stool = (p, seed) => {
            lathe(g, p, [[0.16, 0], [0.15, 0.02]], { fill: P.iron, w, seed: seed + 'f', n: 14 });
            bar3(g, add(p, [0, 0.02, 0]), add(p, [0, 0.41, 0]), 0.05, { fill: P.iron, w, seed: seed + 'l' });
            lathe(g, p, [[0.15, 0.4], [0.17, 0.42], [0.17, 0.45]], { fill: P.coral, w, seed: seed + 's', n: 14 });
        };
        const stools = [[0.66, 0, 0.3], [-0.5, 0, -0.5]].map((d) => add(c, d));
        for (const [i, p] of stools.entries()) if (p[2] > c[2]) stool(p, 'stool' + i);
        // the canopy: eight gores from the pole's top to a rim that sags between its ribs
        const apex = add(c, [0, 2.3, 0]), R = 0.95, n = 8, rim = (i) => [c[0] + Math.cos((i / n) * Math.PI * 2 + 0.2) * R, 1.95, c[2] + Math.sin((i / n) * Math.PI * 2 + 0.2) * R];
        const mid = (i) => { const a = ((i + 0.5) / n) * Math.PI * 2 + 0.2; return [c[0] + Math.cos(a) * R * 0.9, 1.985, c[2] + Math.sin(a) * R * 0.9]; };
        const gores = Array.from({ length: n }, (_, i) => {
            let nn = cross(sub(rim(i), apex), sub(rim(i + 1), apex));
            if (nn[1] < 0) nn = mul(nn, -1);
            return { i, top: dot3(nn, sub(EYE3, mid(i))) > 0, d: len3(sub(mid(i), EYE3)) };
        }).sort((a, b) => b.d - a.d);
        const gore = ({ i, top }) => sh(g, [[...pt(apex), 1], [...pt(rim(i)), 1], pt(mid(i)), [...pt(rim(i + 1)), 1]], { fill: top ? (i % 2 ? P.cream : P.coral) : i % 2 ? P.parasolUnder : '#e9a48c', w, seed: 'gore' + i });
        for (const gr of gores) if (!gr.top) gore(gr);
        // table: foot, pedestal (the parasol's pole runs on up through the top)
        lathe(g, c, [[0.25, 0], [0.22, 0.03]], { fill: P.iron, w, seed: 'tb-foot', n: 16 });
        bar3(g, add(c, [0, 0.03, 0]), add(c, [0, 0.72, 0]), 0.07, { fill: C.white, w, seed: 'tb-leg' });
        bar3(g, add(c, [0, 0.75, 0]), add(c, [0, 2.28, 0]), 0.045, { fill: C.grey, w, seed: 'ps-pole' });
        // a sauce bottle and a cone of chips somebody left
        turned(g, add(c, [0.16, 0.75, -0.08]), [[0.04, 0], [0.043, 0.13], [0.02, 0.17], [0.01, 0.24]], C.red, 'tb-bottle', { top: false, under: false, w });
        {
            const q = [add(c, [-0.3, 0.98, 0]), add(c, [-0.14, 0.98, 0]), add(c, [-0.2, 0.75, 0])].map(pt);
            for (const [k, dx] of [[0, -0.27], [1, -0.21], [2, -0.16]]) bar3(g, add(c, [dx, 0.97, 0]), add(c, [dx + (k - 1) * 0.02, 1.1, 0]), 0.022, { fill: C.roadLine, w: w * 0.8, seed: 'tb-chip' + k });
            poly(g, q, { fill: P.cream, w: w * 0.9, seed: 'tb-cone' });
        }
        lathe(g, c, [[0.4, 0.715], [0.4, 0.75]], { fill: C.white, underFill: C.grey, w, seed: 'tb-top', n: 22 });
        for (const gr of gores) if (gr.top) gore(gr);
        dot(g, ...pt(add(apex, [0, 0.04, 0])), 3.2, C.roadLine);
        for (const [i, p] of stools.entries()) if (p[2] <= c[2]) stool(p, 'stool' + i);
    }

    /**
     * A palm, foot on the ground at `foot`, hm metres tall: a trunk that bows and thins, ringed
     * (each ring the near half of a circle round it: they bow up above the horizon and down below
     * it); fronds as arcs that droop under their own weight, the far ones darker; coconuts.
     * o.lean: metres the head stands off the foot; o.sway (radians) rocks the crown, on twos.
     */
    function palmTree(g, foot, hm, o = {}) {
        const { lean = -0.5, sway = 0, seed = 'palm' } = o, s = sc(foot[2]), [x, y] = pt(foot), h = hm * s, w = lw(foot[2]), ln_ = lean * s;
        const top = [x + ln_ + sway * h * 0.25, y - h];
        const spine = [[x, y], [x + ln_ * 0.08, y - h * 0.34], [x + ln_ * 0.42, y - h * 0.68], top];
        sh(g, T.ribbon(spine, 0.36 * s, 0.22 * s, { step: 1 }), { fill: C.trunk, w, seed: seed + 'trunk', dense: true });
        const sp = T.path(spine);
        for (let k = 1; k < 15; k++) {
            const q = sp[Math.floor((k / 15) * (sp.length - 1))], hw = (0.18 - 0.07 * (k / 15)) * s, bow = (hw * (H0 - q[1])) / (F / (foot[2] / 1)) * 1.0;
            ln(g, [[q[0] - hw, q[1]], [q[0] - hw * 0.1, q[1] - bow * 1.15], [q[0] + hw * (k % 2 ? 0.92 : 0.5), q[1] - bow * 0.5]], { w: w * 0.9, seed: seed + 'ring' + k });
        }
        const frond = (a, len, far, key) => {
            a += sway * (0.6 + Math.abs(Math.cos(a)));
            const dx = Math.cos(a), dy = Math.sin(a), droop = len * (0.22 + 0.42 * Math.abs(dx)), n = 6;
            const at_ = (u) => [top[0] + dx * len * u, top[1] + dy * len * u + droop * u * u];
            const tan = (u) => {
                const tx = dx * len, ty = dy * len + 2 * droop * u, l = Math.hypot(tx, ty) || 1;
                return [tx / l, ty / l];
            };
            const wd = len * 0.17, up = [], dn = [];
            for (let i = 0; i <= n; i++) {
                const u = i / n, q = at_(u), [tx, ty] = tan(u), nx = -ty * Math.sign(dx || 1), ny = tx * Math.sign(dx || 1);
                const bulge = Math.sin(Math.PI * Math.min(1, u * 1.1 + 0.06));
                up.push([q[0] + nx * wd * 0.22 * bulge, q[1] + ny * wd * 0.22 * bulge]);
                if (i > 0 && i < n) {
                    dn.push([q[0] - nx * wd * 0.55 * bulge + tx * len * 0.02, q[1] - ny * wd * 0.55 * bulge + ty * len * 0.02, 1]);
                    dn.push([q[0] - nx * wd * 1.0 * bulge + tx * len * 0.05, q[1] - ny * wd * 1.0 * bulge + ty * len * 0.05]);
                }
            }
            const tip = at_(1.04);
            sh(g, [[...up[0], 1], ...up.slice(1), [tip[0], tip[1], 1], ...dn.reverse()], { fill: far ? C.palm : C.palmLight, w, seed: key });
            ln(g, [at_(0.06), at_(0.4), at_(0.72), at_(0.96)], { w: w * 0.85, seed: key + 'rib' });
        };
        const Fr = [[-2.7, 0.42, 1], [-0.45, 0.44, 1], [-1.95, 0.4, 1], [-1.15, 0.42, 1], [-3.25, 0.4, 0], [0.12, 0.42, 0], [-2.3, 0.5, 0], [-0.85, 0.5, 0], [-1.58, 0.4, 0]];
        for (const [i, [a, l, far]] of Fr.entries()) if (far) frond(a, h * l, 1, seed + 'f' + i);
        for (const [i, [a, l, far]] of Fr.entries()) if (!far) frond(a, h * l, 0, seed + 'f' + i);
        for (const [cx, cy, r] of [[-0.1, 0.14, 0.095], [0.08, 0.16, 0.1], [-0.01, 0.26, 0.09]]) T.shape(g, T.ellipse(top[0] + cx * s, top[1] + cy * s, r * s, r * s * 0.95, 0, 10), { fill: C.woodDeep, w: w * 0.85, seed: seed + 'nut' + cx, dense: true });
    }
    // the pit the palm grows from: a square of soil with a stone kerb
    function treePit(g) {
        const q = (r) => [[-r, -r], [r, -r], [r, r], [-r, r]].map(([dx, dz]) => pt([PALM[0] + dx * Math.cos(PHI) + dz * Math.sin(PHI), 0, PALM[2] - dx * Math.sin(PHI) + dz * Math.cos(PHI)]));
        slab(g, q(0.62), { fill: P.coping, w: lw(PALM[2]), seed: 'pit-kerb', over: 0.6 });
        slab(g, q(0.48), { fill: P.soil, w: lw(PALM[2]) * 0.9, seed: 'pit-soil', over: 0.3 });
    }

    function near(g) {
        cafe(g);
        hut(g);
        hutThings(g);
    }

    // --- the foreground: what stands in front of the cast -------------------------------------------
    /**
     * A lobster pot, 0.6 × 0.45 × 0.4 m: a slatted base, three bent hoops, netting over them, a
     * netted end with its entrance. fr: its frame (x along its length).
     */
    function lobsterPot(g, at, yaw, o = {}) {
        const { seed = 'pot', mesh = P.fish } = o, fr = frame(at, yaw), w = lw(at[2]), s = sc(at[2]);
        const HL = 0.3, RZ = 0.215, RY = 0.35, Y0 = 0.05;
        const S3 = (x, a) => fr.w(x, Y0 + Math.sin(a) * RY, Math.cos(a) * RZ), S = (x, a) => pt(S3(x, a));
        const facing = (x, a) => dot3(add(mul(fr.Z, Math.cos(a) * RY), [0, Math.sin(a) * RZ, 0]), sub(EYE3, S3(x, a))) > 0;
        const arc = (x, n = 14) => Array.from({ length: n + 1 }, (_, i) => S(x, (Math.PI * i) / n));
        // which end we see
        const end = dot3(fr.X, sub(EYE3, at)) > 0 ? 1 : -1;
        boxOf(g, at, [0.64, Y0, 0.47], yaw, {
            fill: { all: C.wood, top: C.woodDeep }, w, seed: seed + 'base',
            face: (f, pl) => {
                if (f.name === 'top' || f.name === 'bottom') return;
                for (let u = 0.11; u < pl.W - 0.05; u += 0.11) ln(g, [pl.p(u, 0), pl.p(u, pl.H)], { w: w * 0.85, seed: seed + 'slat' + f.name + u.toFixed(2) });
            },
        });
        // the netted body: one silhouette, then the meshes on the side we see
        union(g, [hull2d([...arc(-HL), ...arc(0), ...arc(HL)])], { fill: mesh, w, seed: seed + 'body' });
        const M = 9, step = Math.PI / M;
        for (let k = -M; k < 2 * M; k++) {
            for (const dir of [1, -1]) {
                let cur = null;
                const flush = () => {
                    if (cur && cur.length > 1) T.line(g, cur, { w: w * 0.8, seed: seed + 'net' + k + dir, dense: true, amp: 0.1 });
                    cur = null;
                };
                for (let i = 0; i <= 16; i++) {
                    const x = -HL + (2 * HL * i) / 16, a = k * step + dir * (i / 16) * step * 4.2;
                    if (a < 0.02 || a > Math.PI - 0.02 || !facing(x, a)) flush();
                    else (cur ??= []).push(S(x, a));
                }
                flush();
            }
        }
        // the hoops: withies bent over, the far ones only where they show
        const hoop = (x, key) => {
            const pts = [];
            for (let i = 0; i <= 20; i++) {
                const a = (Math.PI * i) / 20;
                if (x * end > 0 || facing(x, a)) pts.push(S(x, a));
            }
            if (pts.length > 2) T.shape(g, T.ribbon(pts, 0.036 * s, 0.036 * s, { dense: true }), { fill: C.wood, w, seed: seed + key, dense: true, amp: 0.15 });
        };
        hoop(-end * HL, 'hoop-far');
        hoop(0, 'hoop-mid');
        // the end towards us: netting round the entrance, a rope ring for its mouth
        const face = arc(end * HL, 18);
        T.shape(g, face, { fill: mesh, w, seed: seed + 'face', dense: true, amp: 0.15 });
        netting(g, face, 0.062 * s, { w: w * 0.8, seed: seed + 'facen' });
        hoop(end * HL, 'hoop-near');
        const mouth = (r, n = 16) => Array.from({ length: n }, (_, i) => pt(fr.w(end * (HL + 0.004), Y0 + 0.17 + Math.sin((i / n) * Math.PI * 2) * r, Math.cos((i / n) * Math.PI * 2) * r)));
        T.shape(g, mouth(0.085), { fill: C.ink, w, seed: seed + 'mouth', dense: true, amp: 0.15 });
        const mr = mouth(0.085, 20);
        rope(g, [...mr, mr[0]], 0.024 * s, { seed: seed + 'mouth-r', w: w * 0.85, dense: true });
        // a becket of rope on top to lift it by
        rope3(g, [S3(-0.13, 1.5), fr.w(-0.07, Y0 + RY + 0.045, 0.01), fr.w(0.07, Y0 + RY + 0.045, -0.01), S3(0.13, 1.64)], 0.02, { seed: seed + 'becket', w: w * 0.85 });
    }

    // a coil of rope lying on the stone, 0.6 m across: three layers, each of three turns side by
    // side round the hole in the middle, every turn a flat ring between two projected circles
    // with the lay of its strands; its end run out beside it
    function coil(g, c, o = {}) {
        const { fill = C.blue, seed = 'coil' } = o, w = lw(c[2]), t = 0.055, R0 = 0.27;
        // A hank left on the stone: five turns of the same size piled up, each a little out of
        // true. Seen from the low camera: the far halves of the turns (the inside of the pile,
        // through its hole) from the bottom up, then the near halves from the bottom up, so the
        // top turn is whole and each lower one shows as a band under it.
        const toCam = Math.atan2(-c[2], -c[0]);
        const turns = [[0, 0, 0], [0.018, -0.012, 0.01], [-0.014, 0.012, -0.012], [0.012, 0.008, 0.008], [-0.006, -0.01, 0]].map(([dx, dz, dr], i) => ({ cc: add(c, [dx, t / 2 + i * t * 0.9, dz]), r: R0 + dr }));
        // A turn of rope seen this flat is one closed tube: the ring's projected line stroked
        // with the rope's thickness (ink, then colour inside it), so its two ends are the tube's own
        // round turn-backs and its silhouette has no seam. (A band offset from the line folds on
        // itself at the ends, and separate «shoulders» read as blobs stuck on.) Under another turn
        // its middle is filled in (we never see down a lower turn's hole); the top turn shows the
        // pile's opening, a dark lens. The strands are then laid on the stretch that faces us.
        const K = 0.38, DEEP = '#2f66a8';
        const turn = (tn, i, top) => {
            const ring = T.pathOf(ring3(tn.cc, tn.r, 44).map(pt)), d = t * sc(tn.cc[2] - tn.r * 0.6);
            g.lineJoin = 'round';
            g.strokeStyle = C.ink;
            g.lineWidth = d + 2 * w;
            g.stroke(ring);
            g.fillStyle = fill;
            g.fill(ring);
            g.strokeStyle = fill;
            g.lineWidth = d;
            g.stroke(ring);
            if (top) T.shape(g, ring3(add(tn.cc, [0, t * 0.5, 0]), tn.r - t * 0.62, 30).map(pt), { fill: DEEP, w, seed: seed + 'hole', dense: true, amp: 0.1 });
            rope(g, ring3(tn.cc, tn.r, 22, toCam - Math.PI / 2 + K, toCam + Math.PI / 2 - K).map(pt), d, { seed: seed + 'nl' + i, w, dense: true, only: 'lay' });
        };
        // the tail: off the bottom turn and round towards the camera, its end whipped. It stays
        // clear of where Kit lands (X −0.3 … 0.1): a rope ending under a boot reads as stood on
        const tail = [[R0 * 0.72, t / 2, -R0 * 0.75], [R0 + 0.08, t / 2, -R0 * 0.7], [R0 + 0.2, t / 2, -R0 * 0.82], [R0 + 0.25, t / 2, -R0 * 1.05]].map((p) => add(c, p));
        rope3(g, tail, t, { fill, seed: seed + 't', w, caps: 'none' });
        const e = pt(tail[3]), e0 = pt(tail[2]), d = t * sc(tail[3][2]), ux = (e[0] - e0[0]) / (Math.hypot(e[0] - e0[0], e[1] - e0[1]) || 1), uy = (e[1] - e0[1]) / (Math.hypot(e[0] - e0[0], e[1] - e0[1]) || 1);
        slab(g, [[e[0] - ux * d * 0.5 + uy * d * 0.56, e[1] - uy * d * 0.5 - ux * d * 0.56], [e[0] + ux * d * 0.12 + uy * d * 0.56, e[1] + uy * d * 0.12 - ux * d * 0.56], [e[0] + ux * d * 0.12 - uy * d * 0.56, e[1] + uy * d * 0.12 + ux * d * 0.56], [e[0] - ux * d * 0.5 - uy * d * 0.56, e[1] - uy * d * 0.5 + ux * d * 0.56]], { fill: C.white, w: w * 0.9, seed: seed + 'whip', over: 0.2 });
        for (const [i, tn] of turns.entries()) turn(tn, i, i === turns.length - 1);
    }

    // a traffic cone 0.5 m tall on its square foot
    function trafficCone(g, c) {
        boxOf(g, c, [0.36, 0.03, 0.36], 0.4, { fill: C.orange, w: BG, seed: 'cone-base', over: 0.5 });
        lathe(g, c, [[0.15, 0.03], [0.14, 0.05], [0.036, 0.5]], { fill: C.orange, w: BG, seed: 'cone-body', bands: [[0.17, 0.26, C.white], [0.34, 0.41, C.white]], topFill: C.ink });
        ln3(g, [add(c, [-0.03, 0.4, -0.05]), add(c, [-0.045, 0.32, -0.075])], { w: BG, seed: 'cone-dent' });
        ln3(g, [add(c, [0.05, 0.1, -0.12]), add(c, [0.07, 0.06, -0.125])], { w: BG, seed: 'cone-scuff' });
    }

    function foreground(g) {
        // far to near: nothing touches anything else (see FORE for where each stands)
        const things = [
            [FORE.potA.o, () => lobsterPot(g, FORE.potA.o, FORE.potA.yaw, { seed: 'pot-a' })],
            [FORE.potB.o, () => lobsterPot(g, FORE.potB.o, FORE.potB.yaw, { seed: 'pot-b', mesh: C.orange })],
            [FORE.coil, () => coil(g, FORE.coil, { seed: 'coil' })],
            [FORE.cone, () => trafficCone(g, FORE.cone)],
            [FORE.bollard, () => {
                const c = FORE.bollard;
                // the line made fast: three turns, then away over the stone towards the lip
                rope3(g, [add(c, [0.11, 0.17, 0.04]), add(c, [0.26, 0.09, 0.14]), add(c, [0.44, 0.03, 0.26]), add(c, [0.75, 0.028, 0.5]), add(c, [1.1, 0.028, 0.85]), add(c, [1.6, 0.028, 1.15])], 0.056, { seed: 'bol-line', w: BG, caps: 'none' });
                bollard(g, c, { seed: 'fb', turns: 3 });
            }],
        ];
        for (const [, draw] of things.sort((a, b) => Math.hypot(b[0][0], b[0][2]) - Math.hypot(a[0][0], a[0][2]))) draw();
    }

    // --- what moves, on twos ---------------------------------------------------------------------------
    // a flag flying from the head of a staff: wm × hm metres, streaming along `dir`
    function flag(g, head, dir, d, o = {}) {
        const { fill = C.red, seed = 'flag', bar: stripe = C.white, wm = 1.1, hm = 0.7 } = o, w = lw(head[2]), ph = (d % 4) * 1.57;
        const top = [], bot = [];
        for (let i = 0; i <= 4; i++) {
            const u = i / 4, wv = Math.sin(u * 5.2 - ph) * 0.1 * wm * u, p = add(head, add(mul(dir, u * wm), [0, -wv - u * 0.08, 0]));
            top.push(pt(p));
            bot.push(pt(add(p, [0, -hm, 0])));
        }
        sh(g, [[...top[0], 1], ...top.slice(1, 4), [...top[4], 1], [...bot[4], 1], ...bot.slice(1, 4).reverse(), [...bot[0], 1]], {
            fill, w, seed: seed + (d % 4),
            inside: (c) => {
                c.fillStyle = stripe;
                c.fill(T.pathOf([...top.map((p, i) => mix(p, bot[i], 0.36)), ...bot.map((p, i) => mix(top[i], p, 0.66)).reverse()]));
            },
        });
    }
    // a string of pennants between two points, sagging, each one fluttering on its own beat
    function bunting(g, A, B, d, o = {}) {
        const { sag = 0.3, n = 8, seed = 'bunting' } = o, w = lw((A[2] + B[2]) / 2) * 0.9;
        const cols = [C.magenta, C.roadLine, P.fish, C.white, C.blue, C.lime, P.coral];
        const at3 = (u) => add(lerp3(A, B, u), [0, -Math.sin(u * Math.PI) * sag, 0]), along = unit(sub(B, A));
        ln(g, Array.from({ length: 9 }, (_, i) => pt(at3(i / 8))), { w, seed });
        for (let i = 0; i < n; i++) {
            const p0 = at3((i + 0.14) / n), p1 = at3((i + 0.86) / n), sw = Math.sin(d * 0.9 + i * 1.7) * 0.05;
            const tip = add(lerp3(p0, p1, 0.5), add(mul(along, sw), [0, -0.34 + Math.cos(d * 0.9 + i * 1.7) * 0.02, 0]));
            sh(g, [[...pt(p0), 1], [...pt(p1), 1], [...pt(tip), 1]], { fill: cols[i % cols.length], w, seed: seed + i });
        }
    }
    // a gull in the air at a world point, 1.3 m from tip to tip
    function gull(g, p, d, o = {}) {
        const { flip = false, seed = 'gull' } = o, [x, y] = pt(p), s = (1.3 * sc(p[2])) / 36, w = lw(p[2]) / s;
        const up = Math.floor(d / 3) % 2 === 0, k = up ? -1 : 0.55;
        g.save();
        g.translate(x, y + (up ? 0 : 1.5 * s));
        g.scale(flip ? -s : s, s);
        g.scale(0.1, 0.1); // drawn ten times up, so the kit's sampling stays fine
        const Z = (pts) => pts.map(([a, b, c]) => [a * 10, b * 10, c]), l = w * 10;
        T.shape(g, Z([[2, -1, 1], [8, -4 + k * 5], [17, -3 + k * 9, 1], [9, 1 + k * 3], [3, 2.4, 1]]), { fill: C.grey, w: l, seed: seed + 'fw' + up });
        T.shape(g, Z([[-11, 0.6, 1], [-4, -2.6], [5, -3], [10, -1.6], [13.4, 0.2, 1], [9, 1.6], [3, 3.4], [-5, 2.6]]), { fill: C.white, w: l, seed: seed + 'b' });
        T.shape(g, Z([[-3, -1, 1], [-8, -5 + k * 6], [-19, -3 + k * 11, 1], [-9, 1 + k * 3.4], [-1, 2.4, 1]]), { fill: C.white, w: l, seed: seed + 'nw' + up });
        dot(g, 94, -12, 8, C.ink);
        T.shape(g, Z([[12.4, -0.6, 1], [17, 0.6, 1], [12.6, 1.4, 1]]), { fill: C.orange, w: l * 0.8, seed: seed + 'bk' });
        g.restore();
    }
    // glints on the water: short white strokes that come and go
    const GLINTS = [[-13, 96], [2.5, 70], [10, 120], [-4.5, 84], [24, 150], [6, 52], [-1.5, 160], [14, 88], [33, 200]];
    function glints(g, d) {
        for (const [i, [X, Z]] of GLINTS.entries()) {
            if ((d + i * 4) % 12 >= 4) continue;
            const [x, y] = pt([X, WATER, Z]), L = 1.6 * sc(Z);
            T.line(g, [[x - L / 2, y], [x, y - 0.6], [x + L / 2, y + 0.3]], { w: lw(Z), seed: 'glint' + i, color: C.white, amp: 0.2 });
        }
    }

    // --- the layers ---------------------------------------------------------------------------------------
    function sea(g) {
        g.fillStyle = C.sky;
        g.fillRect(0, 0, W, H);
        water(g);
        headland(g);
        farWall(g);
    }
    function mid(g) {
        harbour(g);
        pier(g);
        quay(g);
        treePit(g);
        quayThings(g);
        dinghy(g);
    }
    const FULL = { x: 0, y: 0, w: W, h: H };
    const staffOf = (b, L) => frame([b.at[0], WATER - 1.2, b.at[1]], b.yaw).w((-7.2 * L) / 14, 5.3, 0);
    const hutS3 = hutF.w;

    function back(g, env, t) {
        K = env.k;
        const d = T.drawing(t);
        Motion.sprite('harbor-sea', FULL, env.k, sea).draw(g);
        glints(g, d);
        Motion.sprite('harbor-mid', FULL, env.k, mid).draw(g);
        // flags: the trawler's ensign at the head of its stern staff, the pier's at its end
        flag(g, staffOf(BOAT_A, 14), unit([-0.8, 0, -0.6]), d, { seed: 'flag-a' });
        flag(g, PR(PIER.len - 0.2, 1.5, 5.3), unit([0.9, 0, 0.3]), d + 1, { seed: 'flag-p', fill: P.fish, bar: C.roadLine, wm: 1.5, hm: 0.95 });
        // the palm behind the hut, swaying
        palmTree(g, PALM, PALM_H, { seed: 'palm-near', lean: -0.5, sway: Math.sin(d * 0.42) * 0.03 });
        Motion.sprite('harbor-near', { x: 0, y: 0, w: 900, h: 720 }, env.k, near).draw(g);
        // bunting from the sign's corner to the palm, and from its other corner out of frame
        bunting(g, hutS3(1.3, 3.66, -0.94), [PALM[0] - 0.2, 3.5, PALM[2] - 0.1], d, { n: 9, seed: 'bunt-a', sag: 0.42 });
        bunting(g, hutS3(-1.3, 3.66, -0.94), hutS3(-3.4, 3.2, -1.6), d + 3, { n: 6, seed: 'bunt-b', sag: 0.2 });
        // gulls, each on its own beat
        for (const [i, [X, Y, Z, flip]] of GULLS.entries()) gull(g, [X + Math.sin(d * 0.21 + i) * 0.08, Y + Math.cos(d * 0.3 + i * 2) * 0.07, Z], d + i * 2, { flip: !!flip, seed: 'gull' + i });
    }
    const GULLS = [[1.2, 14.2, 34, 0], [4.6, 9.6, 40, 1], [-0.8, 7.6, 46, 0], [27.5, 12.4, 44, 1], [9.5, 20.5, 52, 1], [-2.4, 11.4, 70, 0]];

    // the counter again, over whoever is serving (draw them clipped to AT.dot.clip first)
    function counter(g, env) {
        K = env.k;
        const b = AT.dot.counterBox;
        Motion.sprite('harbor-counter', { x: b[0], y: b[1], w: b[2], h: b[3] }, env.k, counterTop).draw(g);
    }
    function fore(g, env) {
        K = env.k;
        Motion.sprite('harbor-fore', { x: 0, y: 540, w: W, h: 360 }, env.k, foreground).draw(g);
    }

    // --- where things are, for the shots -------------------------------------------------------------------
    const bbox = (pts) => {
        const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), x = Math.min(...xs), y = Math.min(...ys);
        return [x, y, Math.max(...xs) - x, Math.max(...ys) - y].map((v) => Math.round(v));
    };
    const boxBB = (o3, [w, h, d], yaw = 0) => {
        const fr = frame(o3, yaw), pts = [];
        for (const x of [-w / 2, w / 2]) for (const y of [0, h]) for (const z of [-d / 2, d / 2]) pts.push(fr.s(x, y, z));
        return bbox(pts);
    };
    // the hatch as the camera sees it, from the sill up to the rolled shutter: whoever serves is clipped to it
    const hq = hutFront.q(HUT.hatch[0], HUT.hatch[2], HUT.hatch[1], HUT.hatch[3] - 0.09);
    const AT = {
        horizon: H0,
        // the quay's lip: its Z at a given X and its X at a given Z, the way it runs (dir) and the
        // way out over the water (out), two of its points on screen
        lip: { z: lipZ, x: (Z) => (L0[2] - Z) / Math.tan(PHI), dir: LD, out: PD, screen: [pt(Q(-14, 0)), pt(Q(6, 0))] },
        // the two points of the horizon the quay's paving, the lip and the pier run to
        vanish: [[CX + (F * LD[0]) / LD[2], H0], [CX + (F * PD[0]) / PD[2], H0]],
        // a clear landing spot for a kid, [X, Z]
        kit: [0.25, 2.6],
        // Dot stands inside the hut, behind the counter (1.05 m up): her feet in the world, the
        // hatch on screen as a quad [tl, tr, br, bl] and as its box [x, y, w, h], the box of the
        // sprite Harbor.counter paints over her
        dot: {
            foot: hutF.w(-0.1, 0, 0.1), hatch: hq, clip: bbox(hq), sill: 1.05,
            counterBox: (([x, y, w, h]) => [x - 8, y - 8, w + 16, h + 16])(bbox([[-1.12, 0.94, -1.42], [0.82, 0.94, -1.42], [-1.12, 1.52, -0.98], [0.82, 1.52, -0.98], [0.82, 0.94, -0.98], [-1.12, 1.4, -1.42]].map((p) => hutF.s(...p)))),
        },
        hut: { o: HUT.o, yaw: HUT.yaw, size: [HUT.w, HUT.h, HUT.d] },
        // the top of the foreground bollard, where a gull perches
        bollard: { top: [FORE.bollard[0], 0.5, FORE.bollard[2]] },
        table: TABLE, palm: PALM, dinghy: DINGHY.o,
        // the pier: where its near edge leaves the lip, the way it runs and the way across it,
        // its width and length; at(s, c, y): a point s metres out and c across, y above the deck
        pier: { start: PR(0, 0), dir: PD, across: mul(LD, -1), width: PIER.w, length: PIER.len, at: PR },
        // the foreground props: where each stands and its box on screen [x, y, w, h]
        fore: {
            potA: { o: FORE.potA.o, box: boxBB(FORE.potA.o, [0.64, 0.42, 0.47], FORE.potA.yaw) },
            potB: { o: FORE.potB.o, box: boxBB(FORE.potB.o, [0.64, 0.42, 0.47], FORE.potB.yaw) },
            coil: { o: FORE.coil, box: boxBB(add(FORE.coil, [0.13, 0, 0]), [0.9, 0.18, 0.64]) },
            cone: { o: FORE.cone, box: boxBB(FORE.cone, [0.36, 0.5, 0.36], 0.4) },
            bollard: { o: FORE.bollard, box: boxBB(FORE.bollard, [0.42, 0.5, 0.42]) },
        },
        // where the dev scene stands its reference figures (1.4 m and 1.8 m tall)
        guides: [
            [hutF.w(-0.35, 0, 0.1), 'hatch'], [[-0.6, 0, 2.6], 'Z2.6'], [[0.3, 0, 5], 'Z5'], [[0.3, 0, 8], 'Z8'], [PR(3, 1.2), 'pier'], [PR(5.9, 2.2), 'shed'],
            [hutF.w(-0.2, 0, -1.9), 'hut'], [add(TABLE, [0.75, 0, -0.3]), 'table'], [add(PALM, [-0.75, 0, 0]), 'palm'], [add(DINGHY.o, [-1.75, 0, -1.0]), 'dinghy'],
            [PR(0.25, 4.0), 'gate'], [PR(11.5, 1.2), 'lamp'], [[-0.2, 0, 2.6], 'pots'], [[0.5, 0, 2.5], 'cone/bollard'], [Q(1.4, 1.2), 'lip'],
        ],
    };

    window.Harbor = { back, counter, fore, AT };
})();
