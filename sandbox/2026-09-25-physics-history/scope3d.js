// Galileo's telescope as a real 3D object, drawn as riso separations with a perspective
// camera, so the eyepiece's face, the tube and its rings always agree (circles in planes
// perpendicular to the axis project as the right ellipses; the tube's sides are the tangents
// of its end circles). Global: Scope3D.
//
//   Scope3D.draw(press, view, o)
//     view: { eye: [x, y, z], target: [x, y, z], flen, c: [cx, cy], roll }   (world units)
//     o: { turn (focusing collar, 0..1), sweep (the amber reflection, -1..1 or null),
//          glow (the point of light in the glass, 0..1), t }
//   Scope3D.orbit(k, o)  a view from the side (k = 0) round to looking down the axis from
//                        behind the eyepiece (k = 1), aimed at the eyepiece; o: { dist, flen, c, roll }
//
// World: the tube's axis is +x (s = 0 at the eyepiece's face, the objective at s = 1500), y up.
const Scope3D = (() => {
    const { put, ink, line, circle } = Ph;
    const BRASS = { yellow: 1, 'pink.s': 0.22, 'navy.s': 0.08 };
    const BRASS_SH = { yellow: 1, 'pink.s': 0.4, 'navy.s': 0.45 };
    const BRASS_DK = { yellow: 1, 'pink.s': 0.55, 'navy.s': 0.78 };
    const LEATHER = { pink: 0.85, 'yellow.s': 0.55, 'navy.s': 0.5 };
    const LEATHER_LT = { pink: 0.7, 'yellow.s': 0.5, 'navy.s': 0.22 };
    const LEATHER_DK = { pink: 0.9, 'yellow.s': 0.6, 'navy.s': 0.82 };
    const GOLD = { yellow: 1, 'pink.s': 0.18 };
    // [s0, s1, r0, r1, look]: the eyepiece cup, the draw tube, the collar, the leather, the objective
    const PARTS = [
        [0, 9, 15, 15, 'cup'], [9, 24, 11, 11, 'draw'], [24, 46, 17, 17, 'collar'],
        [46, 1470, 19, 30, 'leather'], [1470, 1500, 33, 34, 'cell'],
    ];

    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

    function camera(v) {
        const f = norm(sub(v.target, v.eye)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f);
        const cr = Math.cos(v.roll ?? 0), sr = Math.sin(v.roll ?? 0);
        const proj = (p) => {
            const q = sub(p, v.eye), x = dot(q, r), y = dot(q, u), z = Math.max(1e-3, dot(q, f));
            const X = (v.flen * x) / z, Y = (-v.flen * y) / z;
            return [v.c[0] + X * cr - Y * sr, v.c[1] + X * sr + Y * cr, z];
        };
        return { proj, f, eye: v.eye };
    }
    const ringPt = (s, r, a) => [s, r * Math.cos(a), r * Math.sin(a)];
    // convex hull (monotone chain) of screen points
    function hull(pts) {
        const p = pts.map((q) => [q[0], q[1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
        const lo = [], hi = [];
        for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
        for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
        return lo.slice(0, -1).concat(hi.slice(0, -1));
    }
    const polyPath = (pts) => (g) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
    const N = 48;
    const ring = (C, s, r) => Array.from({ length: N }, (_, i) => C.proj(ringPt(s, r, (i / N) * Math.PI * 2)));

    // the arc of a ring at s that faces the camera (its outward normal towards the eye)
    function visibleArcs(C, s, r, a0 = 0, a1 = Math.PI * 2, n = 64) {
        const out = [];
        let cur = [];
        for (let i = 0; i <= n; i++) {
            const a = a0 + (a1 - a0) * (i / n), p = ringPt(s, r, a), nrm = [0, Math.cos(a), Math.sin(a)];
            const vis = dot(nrm, sub(C.eye, p)) > 0;
            if (vis) cur.push(C.proj(p)); else if (cur.length) { out.push(cur); cur = []; }
        }
        if (cur.length) out.push(cur);
        return out;
    }

    function draw(press, v, o = {}) {
        const C = camera(v), turn = o.turn ?? 0;
        const facesEye = C.eye[0] < 0; // behind the eyepiece: we see the faces towards -s
        // far to near: from the objective to the eyepiece when we are behind it
        const parts = facesEye ? PARTS.slice().reverse() : PARTS.slice();
        const sc = (s) => { const p = C.proj([s, 0, 0]), q = C.proj([s, 1, 0]); return Math.hypot(q[0] - p[0], q[1] - p[1]); }; // px per unit at s
        for (const [s0, s1, r0, r1, look] of parts) {
            const a = ring(C, s0, r0), b = ring(C, s1, r1), sil = hull(a.concat(b));
            const base = look === 'leather' ? LEATHER : look === 'draw' ? BRASS_SH : BRASS;
            put(press, polyPath(sil), base);
            // cylinder shading: a lit band along the top, a dark one underneath (in the tube's frame)
            const band = (a0, a1, spec) => {
                const pts = [];
                for (let i = 0; i <= 12; i++) { const an = a0 + (a1 - a0) * i / 12; pts.push(C.proj(ringPt(s0, r0 * 1.001, an))); }
                for (let i = 12; i >= 0; i--) { const an = a0 + (a1 - a0) * i / 12; pts.push(C.proj(ringPt(s1, r1 * 1.001, an))); }
                press.save(); press.clip(polyPath(sil)); ink(press, polyPath(pts), spec); press.restore();
            };
            if (look === 'leather') { band(-0.7, 0.15, LEATHER_LT); band(2.3, 4.0, { 'navy.s': 0.35 }); }
            else {
                band(2.2, 4.0, { 'navy.s': 0.45, 'pink.s': 0.25 });
                band(1.2, 2.2, { 'navy.s': 0.18, 'pink.s': 0.12 });
                // a paper glint along the lit top of the brass
                press.knockout((g) => { Ph.poly(g, Ph.outline([C.proj(ringPt(s0 + 1, r0 * 1.001, -0.35)), C.proj(ringPt(s1 - 1, r1 * 1.001, -0.35))], Ph.taper(Math.max(1.2, 1.2 * sc(s0)), 0.3, 0.3))); g.fill(); });
            }
            if (look === 'leather') {
                // gold tooling: double fillets and dotted bands round the tube
                for (let s = 110; s < s1 - 60; s += 110) {
                    const r = r0 + (r1 - r0) * (s - s0) / (s1 - s0);
                    for (const ds of [0, 10]) for (const arc of visibleArcs(C, s + ds, r * 1.01)) if (arc.length > 1) line(press, arc, Math.max(1.2, 3 * sc(s) / 3), GOLD);
                }
                // a paper glint along the lit top edge
                press.knockout((g) => { Ph.poly(g, Ph.outline([C.proj(ringPt(s0 + 40, r0, -0.45)), C.proj(ringPt(s1 - 60, r1, -0.45))], Ph.taper(Math.max(1.5, 3 * sc(s0) / 3), 0.3, 0.3))); g.fill(); });
            }
            if (look === 'collar') {
                // knurls: lines along the axis, turning with the collar; only the visible ones
                for (let k = 0; k < 24; k++) {
                    const an = (k / 24) * Math.PI * 2 + turn * 2, p = ringPt(s0 + 2, r0, an);
                    if (dot([0, Math.cos(an), Math.sin(an)], sub(C.eye, p)) <= 0) continue;
                    line(press, [C.proj(ringPt(s0 + 2, r0 * 1.01, an)), C.proj(ringPt(s1 - 2, r1 * 1.01, an))], Math.max(1, 1.6 * sc(s0) / 2), { navy: 0.9, 'pink.s': 0.3 });
                }
            }
            // the end face towards the camera, if it shows
            const face = facesEye ? [s0, r0] : [s1, r1];
            const nrm = facesEye ? [-1, 0, 0] : [1, 0, 0];
            if (dot(nrm, sub(C.eye, [face[0], 0, 0])) > 0) {
                const fr = ring(C, face[0], face[1]);
                put(press, polyPath(fr), look === 'leather' ? LEATHER_DK : BRASS_SH);
                if (look === 'cup') eyepieceFace(press, C, o, sc);
            }
        }
    }

    // the eyepiece's face at s = 0: a brass rim with a bevel and knurling, the glass inside
    function eyepieceFace(press, C, o, sc) {
        const k = sc(0), rimOut = ring(C, 0, 15), rimIn = ring(C, 0, 11);
        put(press, polyPath(rimOut), BRASS);
        // shade the rim's lower left, lit upper right
        const sh = C.proj(ringPt(0, 14, 2.4));
        press.save(); press.clip(polyPath(rimOut));
        ink(press, (g) => g.rect(-5000, -5000, 12000, 12000), { 'navy.s': (g) => Riso.radial(g, sh[0], sh[1], k * 2, k * 22, 0.55, 0), 'pink.s': (g) => Riso.radial(g, sh[0], sh[1], k * 2, k * 22, 0.35, 0) });
        press.restore();
        line(press, ring(C, 0, 12).concat([ring(C, 0, 12)[0]]), Math.max(1.5, k * 0.9), BRASS_SH);
        line(press, ring(C, 0, 14.6).concat([ring(C, 0, 14.6)[0]]), Math.max(1, k * 0.4), BRASS_DK);
        for (let i = 0; i < 90; i++) { const an = (i / 90) * Math.PI * 2; line(press, [C.proj(ringPt(0, 13.9, an)), C.proj(ringPt(0, 15.05, an))], Math.max(1, k * 0.25), { navy: 0.85, 'pink.s': 0.3 }); }
        press.knockout((g) => { Ph.poly(g, Ph.outline(Array.from({ length: 16 }, (_, i) => C.proj(ringPt(0, 13, -1.3 + i * 0.06))), Ph.taper(Math.max(1.5, k * 1.1), 0.3, 0.3))); g.fill(); });
        // dust on the rim
        const rr = Motion.rng('rim3d');
        for (let i = 0; i < 30; i++) { const p = C.proj(ringPt(-0.1, 11.6 + rr() * 3, rr() * 6.283)); put(press, circle(p[0], p[1], Math.max(0.8, k * (0.18 + rr() * 0.22))), rr() < 0.55 ? { 'blue.s': 0.12, 'yellow.s': 0.06 } : { navy: 0.8, 'pink.s': 0.4 }); }
        // the glass: deep blue, concentric reflections of the lens surfaces, a sheen
        put(press, polyPath(rimIn), { blue: 0.62, 'navy.s': 0.5 });
        press.save(); press.clip(polyPath(rimIn));
        for (const [r, w, spec] of [[9.5, 0.5, { 'blue.s': 0.45, 'navy.s': 0.3 }], [7.5, 0.45, { 'blue.s': 0.4, 'navy.s': 0.4 }], [5.5, 0.4, { navy: 0.9, 'blue.s': 0.4 }], [3.2, 0.5, { navy: 1, 'blue.s': 0.5 }]]) {
            const pts = ring(C, -0.05, r); line(press, pts.concat([pts[0]]), Math.max(1, k * w), spec);
        }
        const cc = C.proj([-0.05, 0, 0]);
        put(press, polyPath(ring(C, -0.05, 2.2)), { navy: 1, yellow: 0.7 });
        const sp = C.proj(ringPt(-0.05, 6, -0.9));
        press.knockout((g) => { g.fillStyle = Riso.radial(g, sp[0], sp[1], k, k * 9, 0.35, 0); g.beginPath(); g.arc(sp[0], sp[1], k * 9, 0, 6.2832); g.fill(); });
        // the amber reflection of the candle sweeping across the glass (a band in the glass's plane)
        if (o.sweep != null && o.sweep > -1.2 && o.sweep < 1.2) {
            const pts = [];
            for (let i = 0; i <= 16; i++) { const v = -11 + 22 * i / 16; pts.push(C.proj([-0.06, v, o.sweep * 11 + 0.02 * v * v])); }
            line(press, pts, Ph.taper(k * 3.2, 0.45, 0.45), { 'yellow.s': 0.75, 'pink.s': 0.4 });
            line(press, pts, Ph.taper(k * 1.3, 0.4, 0.4), { yellow: 1, 'pink.s': 0.5 }, { knock: false });
        }
        // the point of light gathering at the centre
        if (o.glow > 0) {
            const R = k * 6 * o.glow;
            press.knockout((g) => { g.fillStyle = Riso.radial(g, cc[0], cc[1], 1, R, 0.8, 0); g.beginPath(); g.arc(cc[0], cc[1], R, 0, 6.2832); g.fill(); });
            ink(press, circle(cc[0], cc[1], R), { 'yellow.s': (g) => Riso.radial(g, cc[0], cc[1], 1, R, 0.9, 0) });
            put(press, circle(cc[0], cc[1], k * 0.9 * o.glow), { yellow: 1 });
        }
        press.restore();
    }

    // a view on an arc round the eyepiece: from the side (k = 0) to behind it, down the axis (k = 1)
    function orbit(k, o) {
        const phi = k * Math.PI / 2, d = o.dist;
        return { eye: [-Math.sin(phi) * d + (o.dx ?? 0), 0, Math.cos(phi) * d], target: [o.aim ?? 0, 0, 0], flen: o.flen, c: o.c, roll: o.roll ?? 0 };
    }
    return { draw, orbit, camera, PARTS };
})();
