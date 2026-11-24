// The car: an invented 1980s wedge convertible (no make, no badge, no logo). White paint, deep
// red leather, black urethane bumpers, a black louvered tail with a full-width ribbed strip of
// red tail lights, pop-up headlights raised for the night, wide tyres on flat-faced alloys, a
// pink-over-teal pinstripe along the crease. A 3D model in metres (x right, y up, z forward,
// origin on the ground under the middle of the car): 4.3 m long, 1.8 m wide, the doors' tops
// at 0.94 m, so every shot sees the same car.
// It is painted like the era's airbrushed car art, not shaded like CG: each panel is one shape
// filled with a gradient whose colours come from what it reflects at that point (the violet
// sky on what faces up, the city's pink horizon at grazing angles, the dark bay below), the
// warm lamp passing overhead on every beat (light.lamp), and two rims: the city's cyan on
// what faces forward, a magenta from behind. The lamps themselves slide over the hood and the
// deck as soft reflections. Thin highlight lines run along the shoulders, the crease, the
// tail's edge and the bumpers; the chrome glints.
// Global: Car.
//   Car.draw(g, L, N, cam, pose, light, people)
//       pose  { x, y, z, pitch }        world metres, pitch > 0 = nose up
//       light { lamp, hue, power, city, lamps? }   lamp 0..1 (peaks on the beat), hue: degrees
//             the trip turns the colours, power ≥ 1 in the trip, city: the rims' strength,
//             lamps: optional world points of the lamp heads overhead (else read from Causeway)
//       people(g, L): paints the two of them; called after the cockpit's floor and cushions,
//             before the seat backs and the rear deck as seen from behind (before the near door,
//             the hood and the windshield as seen from the side or the front)
//   Car.lights(L, N, cam, pose, light)   only what emits (tail lights, headlights, markers, the
//                                        dash), onto a light canvas: the trip's tracers
//   Car.W(pose, [x, y, z])               local → world
//   Car.SEATS                            the seats: { x, z, y } (cushion top), local
// Light goes on L only for what is painted after the people: whatever they cover must not
// glow through them (they are drawn on the picture only).
const Car = (() => {
    const P = Neon.PAL, hex = Neon.hex, css = Neon.css, mix = Neon.mix;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    // --- the shape (metres) -----------------------------------------------------------------
    // piecewise-linear profiles along z (tables in ascending z)
    const pw = (tab) => (z) => {
        if (z <= tab[0][0]) return tab[0][1];
        for (let i = 1; i < tab.length; i++) if (z <= tab[i][0]) { const [z0, v0] = tab[i - 1], [z1, v1] = tab[i]; return v0 + ((v1 - v0) * (z - z0)) / (z1 - z0); }
        return tab[tab.length - 1][1];
    };
    const ZT = -2.13, ZN = 2.14;                        // the tail panel, the nose's leading edge
    const Z_WS = 0.8, Z_CK = -1.0, Z_BOOT = -1.31;     // windshield base, cockpit's rear edge, end of the folded top's cover
    const XC = 0.75, FLOOR = 0.2;                      // the cockpit's half width (inside the doors), its floor
    const yb = pw([[ZT, 0.985], [-1.0, 0.942], [Z_WS, 0.885], [2.0, 0.625], [ZN, 0.578]]);   // shoulder: the wedge
    const xb = pw([[ZT, 0.815], [-1.7, 0.835], [-1.0, 0.848], [1.3, 0.85], [1.95, 0.83], [ZN, 0.78]]);
    const yc = pw([[ZT, 0.72], [ZN, 0.54]]);                                                  // crease, rising to the tail
    const xc = pw([[ZT, 0.893], [-1.7, 0.9], [1.45, 0.9], [1.98, 0.884], [ZN, 0.826]]);       // the widest line
    const YS = 0.2, XS = 0.858;                                                               // sill (tucked under)
    const R = 0.305, RIM = 0.205, ARCH = 0.35;
    const WHEELS = [{ z: 1.24, x: 0.755, w: 0.225 }, { z: -1.26, x: 0.762, w: 0.255 }];
    const SEATS = [{ x: -0.42, z: -0.62, y: 0.5 }, { x: 0.42, z: -0.62, y: 0.5 }];
    const ZS = [ZT, -1.75, -1.26, -0.6, 0.1, Z_WS, 1.24, 1.7, ZN];                            // stations for the gradients

    // vectors
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
    const lerp3 = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
    const add = (c, d, k) => [Math.min(255, c[0] + d[0] * k), Math.min(255, c[1] + d[1] * k), Math.min(255, c[2] + d[2] * k)];

    // the body's curves, per side s = ±1
    const shoulder = (s, z) => [s * xb(z), yb(z), z];
    const crease = (s, z) => [s * xc(z), yc(z), z];
    const sill = (s, z) => [s * XS, YS, z];
    // a point on the upper side (u: 0 shoulder → 1 crease) or the lower side (0 crease → 1 sill)
    const onUp = (s, z, u) => lerp3(shoulder(s, z), crease(s, z), u);
    const onLo = (s, z, u) => lerp3(crease(s, z), sill(s, z), u);
    // the normal of a band between two curves at z, turned to face `out`
    function bandN(A, B, z, out) {
        const e = 0.04, t = sub(lerp3(A(z + e), B(z + e), 0.5), lerp3(A(z - e), B(z - e), 0.5)), a = sub(A(z), B(z));
        const n = nrm(cross(t, a)); return dot(n, out) < 0 ? [-n[0], -n[1], -n[2]] : n;
    }
    const topN = (z) => nrm([0, 1, -(yb(z + 0.03) - yb(z - 0.03)) / 0.06]);
    const upN = (s, z) => bandN((q) => shoulder(s, q), (q) => crease(s, q), z, [s, 0.3, 0]);
    const loN = (s, z) => bandN((q) => crease(s, q), (q) => sill(s, q), z, [s, -0.3, 0]);
    // z samples along the body, for outlines and lines
    const along = (z0, z1, n) => { const a = []; for (let i = 0; i <= n; i++) a.push(z0 + ((z1 - z0) * i) / n); return a; };
    const ZB = along(ZT, ZN, 22);

    // --- materials: the colour of the thing in the dark (dark → lit by the sky above), how
    // much of the night it reflects (f0 head-on → f1 grazing), the lamp's warmth on it --------
    const MAT = {
        paint: { dark: hex('#3b3168'), lit: hex('#d8cef4'), f0: 0.16, f1: 0.8, fp: 1.7, rim: 1, warm: hex('#ffd3b0'), lampK: 0.6 },
        black: { dark: hex('#0a0712'), lit: hex('#2b2340'), f0: 0.05, f1: 0.42, fp: 2.4, rim: 0.5, warm: hex('#5a3a3a'), lampK: 0.35 },
        vinyl: { dark: hex('#0d0916'), lit: hex('#3a3050'), f0: 0.03, f1: 0.25, fp: 3, rim: 0.4, warm: hex('#6a4a48'), lampK: 0.4 },
        leather: { dark: hex('#2a0414'), lit: hex('#84162f'), f0: 0.05, f1: 0.35, fp: 2.6, rim: 0.7, warm: hex('#d4483e'), lampK: 0.5 },
        trim: { dark: hex('#120a1c'), lit: hex('#3a2346'), f0: 0.02, f1: 0.15, fp: 3, rim: 0.3, warm: hex('#5a2a30'), lampK: 0.3 },
        metal: { dark: hex('#4a4468'), lit: hex('#d8d2ee'), f0: 0.35, f1: 0.8, fp: 1.5, rim: 0.6, warm: hex('#ffd8b8'), lampK: 0.5 },
    };
    // what the night looks like in a reflected direction: e = its elevation (sine), zf = its
    // forward component (the city ahead makes the horizon hot pink, the bay behind is dimmer)
    const ENV = [[-1, '#07051a'], [-0.14, '#120a28'], [-0.03, '#2a1444'], [0.0, null], [0.05, '#b2388a'], [0.15, '#6a2490'], [0.36, '#33186a'], [1, '#170c3e']];

    // --- the frame: camera in the car's frame, the night's colours (turned by the trip) -----
    function frame(cam, pose, light) {
        const c = Math.cos(pose.pitch ?? 0), s = Math.sin(pose.pitch ?? 0);
        const Wp = (p) => [pose.x + p[0], pose.y + p[1] * c + p[2] * s, pose.z + p[2] * c - p[1] * s];
        const d = [cam.pos[0] - pose.x, cam.pos[1] - pose.y, cam.pos[2] - pose.z];
        const C = [d[0], d[1] * c - d[2] * s, d[1] * s + d[2] * c];
        const hue = light.drawn ? 0 : light.hue ?? 0;           // drawn: the car keeps its inks through the trip
        const sh = (h, k = 1) => (hue ? Neon.shift(h, hue * k) : hex(h));
        const F = {
            cam, pose, C, Wp, cp: c, sp: s, hue,
            pr: (p) => cam.p(Wp(p)),
            depth: (p) => cam.view(Wp(p))[2],
            poly: (pts) => Neon.poly(cam, pts.map(Wp)),
            lamp: clamp(light.lamp ?? 0, 0, 1.2), power: light.power ?? 1, city: light.city ?? 1,
            cyan: sh(P.cyan), magenta: sh('#ff3cc8'), pink: sh(P.pink), teal: sh('#2fd3c4'), warm: sh('#ffb070'),
            red: sh('#ff1236', 0.25), redDeep: sh('#8a0620', 0.25), amber: sh('#ff9a2a', 0.3), head: sh('#ffe7b8', 0.5),
            green: sh('#5dffb0'), dashCyan: sh('#38e8ff'),
            hz: [sh('#8a2a80'), sh('#ff78c0')],
            env: ENV.map(([e, h]) => [e, h ? sh(h) : null]),
            lit: false,                                    // true once the people are down: light may go on L
        };
        F.sc = (p) => cam.f / Math.max(0.05, F.depth(p));
        F.lamps = lampsNear(pose, light);
        // the drawn manner's ink line, by the car's size on screen (px per metre at its middle)
        F.S = cam.f / Math.max(0.5, F.depth([0, 0.6, 0]));
        F.w = clamp(0.02 * F.S, 1.1, 6.5);
        return F;
    }
    function envAt(F, e, zf) {
        const E = F.env, hz = mix(F.hz[0], F.hz[1], clamp((zf + 1) / 2, 0, 1));
        for (let i = 1; i < E.length; i++) if (e <= E[i][0] || i === E.length - 1) {
            const [e0, c0] = E[i - 1], [e1, c1] = E[i];
            return mix(c0 ?? hz, c1 ?? hz, clamp((e - e0) / (e1 - e0), 0, 1));
        }
        return E[E.length - 1][1];
    }
    // the colour of material m at local point p with normal n, seen from the camera
    function shade(F, p, n0, m) {
        if (DRAWN) return hex(dInk(m, n0));                     // one ink per part: no lamp, no view
        const v = nrm(sub(F.C, p)), n = nrm(n0);
        let nv = dot(n, v), N = n;
        if (nv < 0) { N = [-n[0], -n[1], -n[2]]; nv = -nv; }
        const r = [2 * nv * N[0] - v[0], 2 * nv * N[1] - v[1], 2 * nv * N[2] - v[2]];
        const e = r[1] * F.cp + r[2] * F.sp;
        const k = m.f0 + (m.f1 - m.f0) * Math.pow(clamp(1 - nv, 0, 1), m.fp);
        let d = mix(m.dark, m.lit, 0.5 + 0.5 * N[1]);
        d = add(d, F.cyan, m.rim * 0.16 * Math.max(0, N[2]) * F.city);
        d = add(d, F.magenta, m.rim * 0.13 * Math.max(0, -N[2]));
        d = mix(d, m.warm, Math.min(0.85, F.lamp * m.lampK * (0.18 + 0.82 * Math.max(0, N[1]))));
        return mix(d, envAt(F, e, r[2]), k);
    }

    // --- the drawn manner (light.drawn): flat inks from the reference's palette, a brush line ---
    // Each part keeps ONE ink, chosen by its material and which way it faces (never by the lamp
    // or the view, which made the inks flip across a threshold on every half beat): a white car
    // at night in this palette is pink on top, magenta on the upper sides, violet below the
    // crease, purple on the faces fore and aft. The passing lamp is laid on as strokes of gold
    // and salmon that sweep over the deck and the hood, never as a change of ink.
    let DRAWN = false, DR = 0, LCUR = null;
    const K = {
        ink: '#0b0230', deep: '#0e0558', indigo: '#200887', royal: '#3a10c8', violet: '#7407f0', purple: '#ad19b0',
        plum: '#7a1581', grape: '#420859', magenta: '#e106d3', salmon: '#f45a7f', pink: '#ff8ad8', light: '#ffc8ee',
        cream: '#ffe6f6', orange: '#f9a03a', gold: '#ffd25a', cyan: '#67deef', red: '#ff3050', mint: '#7dffc8',
    };
    const KSET = new Set(Object.values(K).map((h) => hex(h).join(',')));
    function dInk(m, n0) {
        const n = nrm(n0), up = n[1];
        if (m === MAT.paint) return up > 0.55 ? K.pink : Math.abs(n[2]) > 0.75 ? K.purple : up > -0.05 ? K.magenta : K.violet;
        if (m === MAT.metal) return up > 0.2 ? K.light : K.pink;
        if (m === MAT.leather) return up > 0.5 ? K.plum : K.grape;
        if (m === MAT.black) return up > 0.5 ? K.indigo : up < -0.5 ? K.ink : K.deep;
        if (m === MAT.vinyl) return up > 0.5 ? K.deep : K.ink;
        return up > 0.5 ? K.deep : K.grape;                     // trim: the dash, the console, the bulkhead
    }
    // a small deterministic noise (seed, i, drawing) → 0..1
    const hh = (a, b, c) => { let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 2147483647); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
    const POSTER = ['#0b0230', '#0e0558', '#200887', '#3a10c8', '#7407f0', '#ad19b0', '#7a1581', '#e106d3', '#f45a7f', '#ff8ad8', '#ffc8ee', '#f9a03a', '#ffd25a', '#67deef', '#ff3050', '#420859'].map(hex);
    const RED = POSTER[14];
    function posterize(c) {
        if (KSET.has(c.map(Math.round).join(','))) return c;    // already one of the car's inks
        // push saturation and pick the nearest ink of the palette
        const m = (c[0] + c[1] + c[2]) / 3, k = 1.6;
        const s = [m + (c[0] - m) * k, m + (c[1] - m) * k, m + (c[2] - m) * k].map((v) => clamp(v * 0.92, 0, 255));
        let best = POSTER[0], bd = 1e9;
        const reallyRed = c[0] > 150 && c[0] > 2.2 * c[1] && c[0] > 2.2 * c[2];
        for (const q of POSTER) {
            if (q === RED && !reallyRed) continue; const d = 2 * (s[0] - q[0]) ** 2 + 4 * (s[1] - q[1]) ** 2 + 3 * (s[2] - q[2]) ** 2; if (d < bd) { bd = d; best = q; } }
        return best;
    }
    // the nearest ink, opaque (the drawn manner has no translucent overlays)
    const posterCss = (col) => {
        if (typeof col !== 'string') return col;
        const m = col.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);
        if (m) return css(posterize([+m[1], +m[2], +m[3]]));
        if (col[0] === '#') return css(posterize(hex(col)));
        return col;
    };
    const alphaOf = (col) => { const am = typeof col === 'string' && col.match(/rgba\([^)]*,\s*([\d.]+)\)/); return am ? +am[1] : 1; };
    // the ink line, one rule by the car's size on screen (F.w, set in frame()): the silhouette
    // at F.w (about 6 px over the trunk, 4–5 px in the chase, ~1 px far away), the lines inside
    // the body at half that, the details thinner still
    const lineIn = (F, k = 0.5) => Math.max(1, k * F.w);
    // an ink line along a 3D polyline at k × the silhouette's weight
    function edge3(g, F, pts, k = 1, col = null, o = {}) {
        const q = pts.map((p) => F.pr(p)).filter((p) => p[2] >= 0.35).map((p) => [p[0], p[1]]);
        if (q.length < 2) return;
        Ink.brush(g, q, { w: Math.max(1, k * F.w), col: col ?? K.ink, seed: o.seed ?? ((q.length * 9173 + Math.round(q[0][0] * 7 + q[0][1] * 3)) | 0), d: DR, taper: o.taper ?? 0.06, wob: o.wob, closed: o.closed });
    }

    // --- painting helpers -----------------------------------------------------------------
    // an airbrushed fill: the outline (local points) filled with a gradient laid along the
    // screen from the first to the last stop; stops: [{ p, n, m? }]
    function grad(c, F, stops, m, alpha = 1) {
        if (DRAWN) { const st = stops[Math.floor(stops.length / 2)]; return css(posterize(shade(F, st.p, st.n, st.m ?? m)), alpha); }
        const pts = [];
        for (const st of stops) { const q = F.pr(st.p); if (q[2] > 0.35) pts.push([st, q]); }
        if (pts.length < 2) { const st = pts[0]?.[0] ?? stops[0]; return css(shade(F, st.p, st.n, st.m ?? m), alpha); }
        const a = pts[0][1], b = pts[pts.length - 1][1], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
        if (l2 < 4) return css(shade(F, pts[0][0].p, pts[0][0].n, m), alpha);
        const gr = c.createLinearGradient(a[0], a[1], b[0], b[1]);
        for (const [st, q] of pts) gr.addColorStop(clamp(((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / l2, 0, 1), css(shade(F, st.p, st.n, st.m ?? m), alpha));
        return gr;
    }
    // the same with explicit colours: pts [[p, colour]]
    function gradC(c, F, pts, alpha = 1) {
        if (DRAWN) return css(posterize(pts[Math.floor(pts.length / 2)][1]), alpha);
        const v = pts.map(([p, col]) => [F.pr(p), col]).filter(([q]) => q[2] > 0.35);
        if (v.length < 2) return css(pts[0][1], alpha);
        const a = v[0][0], b = v[v.length - 1][0], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
        if (l2 < 4) return css(v[0][1], alpha);
        const gr = c.createLinearGradient(a[0], a[1], b[0], b[1]);
        for (const [q, col] of v) gr.addColorStop(clamp(((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / l2, 0, 1), css(col, alpha));
        return gr;
    }
    // wk (drawn only): the ink line's weight as a multiple of the silhouette's (0 = no line)
    function fill(c, F, outline, style, wk = 0.5) {
        const q = F.poly(outline); if (!q) return null;
        if (DRAWN) {
            // the airbrush's translucent overlays and gradients have no place in the drawn manner:
            // only the opaque pieces are painted, flat, each with its ink line
            if (typeof style !== 'string') return q;
            if (alphaOf(style) < 0.6) return q;
            if (c === LCUR) { c.fillStyle = style; Neon.path(c, q); c.fill(); return q; }   // light: flat, no line
            Ink.shape(c, q, posterCss(style), { w: wk > 0 ? Math.max(1, wk * F.w) : 0, seed: (q.length * 7919 + Math.round(q[0][0] * 3)) | 0, d: DR, jit: 0.6 });
            return q;
        }
        c.fillStyle = style; Neon.path(c, q); c.fill(); return q;
    }
    // a 3D polyline stroked (points behind the camera break it)
    function line3(c, F, pts, style, w, cap = 'round') {
        if (DRAWN) {
            const q = pts.map((p) => F.pr(p)).filter((p) => p[2] >= 0.35).map((p) => [p[0], p[1]]);
            if (q.length < 2) return;
            if (typeof style === 'string' && alphaOf(style) < 0.3) return;     // the airbrush's faint hairlines
            const col = typeof style === 'string' ? posterCss(style) : K.cyan;
            Ink.brush(c, q, { w: Math.min(5, Math.max(1, w * 1.15)), col, seed: (q.length * 104729 + Math.round(q[0][1] * 5)) | 0, d: DR, taper: 0.25 });
            return;
        }
        c.beginPath(); let on = false, n = 0;
        for (const p of pts) { const q = F.pr(p); if (q[2] < 0.35) { on = false; continue; } if (on) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); on = true; n++; }
        if (n < 2) return;
        c.strokeStyle = style; c.lineWidth = w; c.lineCap = cap; c.lineJoin = 'round'; c.stroke();
    }
    const px = (F, m, p, min = 0.5) => Math.max(min, m * F.sc(p));
    const visible = (F, p, n) => dot(sub(F.C, p), n) > 0;
    // 0: the picture, 1: the light (only after the people). Reflections and rims go on the light
    // only in the airbrush; what emits (outsE) goes on it in both manners
    const outs = (F) => (F.lit && !DRAWN ? [0, 1] : [0]);
    const outsE = (F) => (F.lit ? [0, 1] : [0]);

    // a gradient along a whole line of the body (for rims): colours from the tail to the nose
    function lineGrad(c, F, p0, p1, cols) {
        let a = F.pr(p0), b = F.pr(p1);
        if (a[2] < 0.35 || b[2] < 0.35) {
            // pull the far end in front of the camera
            const lo = a[2] < 0.35 ? p0 : p1, hi = a[2] < 0.35 ? p1 : p0;
            let u0 = 0, u1 = 1; for (let i = 0; i < 14; i++) { const u = (u0 + u1) / 2; if (F.depth(lerp3(lo, hi, u)) < 0.4) u0 = u; else u1 = u; }
            const q = F.pr(lerp3(lo, hi, u1)); if (a[2] < 0.35) a = q; else b = q;
        }
        if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 1) return css(cols[0][1], cols[0][2]);
        const gr = c.createLinearGradient(a[0], a[1], b[0], b[1]);
        for (const [u, col, al] of cols) gr.addColorStop(u, css(col, al));
        return gr;
    }

    // --- the lamps overhead (for their reflections) ------------------------------------------
    function lampsNear(pose, light) {
        if (light.lamps) return light.lamps;
        if (typeof Causeway === 'undefined' || typeof Song === 'undefined') return [];
        const C = Causeway, k0 = Math.round(((pose.z + 0.5) / C.V + C.T0 - Song.bar0) / Song.beat), out = [];
        for (let k = k0 - 2; k <= k0 + 3; k++) {
            const zl = C.lampZ(k);
            if (C.heads) for (const h of C.heads(zl)) out.push(h);
            else out.push([pose.x - 0.15, C.y(zl) + 10, zl]);
        }
        return out;
    }
    // world → local
    function toLocal(F, P0) {
        const d = [P0[0] - F.pose.x, P0[1] - F.pose.y, P0[2] - F.pose.z];
        return [d[0], d[1] * F.cp - d[2] * F.sp, d[1] * F.sp + d[2] * F.cp];
    }
    // the lamps mirrored in a glossy face (plane p0, n), as soft warm smears clipped to its outline q
    function lampGlints(c, L, F, q, p0, n, size = 1) {
        if (DRAWN) return;                               // the drawn manner lays light as strokes, not reflections
        if (!q || !F.lamps.length) return;
        const col = F.warm;
        for (const W0 of F.lamps) {
            const Lp = toLocal(F, W0), dl = dot(sub(Lp, p0), n);
            if (dl <= 0) continue;
            const V = sub(Lp, [2 * dl * n[0], 2 * dl * n[1], 2 * dl * n[2]]);
            // where the line from the eye to the mirror image meets the face
            const dv = sub(V, F.C), den = dot(dv, n); if (Math.abs(den) < 1e-6) continue;
            const t = dot(sub(p0, F.C), n) / den; if (t <= 0 || t >= 1) continue;
            const Pm = [F.C[0] + dv[0] * t, F.C[1] + dv[1] * t, F.C[2] + dv[2] * t];
            const s = F.pr(Pm); if (s[2] < 0.35) continue;
            const dist = Math.hypot(Lp[0] - Pm[0], Lp[1] - Pm[1], Lp[2] - Pm[2]);
            const a = clamp(1.5 / (1 + (dist / 11) ** 2), 0, 1);
            if (a < 0.04) continue;
            const ax = F.pr([Pm[0] + 0.2, Pm[1], Pm[2]]), ang = Math.atan2(ax[1] - s[1], ax[0] - s[0]);
            const rr = 0.42 * size * F.sc(Pm);
            for (const i of outs(F)) {
                const cc = i ? L : c;
                cc.save(); Neon.path(cc, q); cc.clip();
                cc.translate(s[0], s[1]); cc.rotate(ang); cc.scale(1, 0.42);
                const gr = cc.createRadialGradient(0, 0, 0, 0, 0, rr);
                gr.addColorStop(0, css(mix(col, [255, 245, 230], 0.55), a * (i ? 0.35 : 0.85)));
                gr.addColorStop(0.18, css(col, a * (i ? 0.2 : 0.55)));
                gr.addColorStop(1, css(col, 0));
                cc.fillStyle = gr; cc.fillRect(-rr, -rr, 2 * rr, 2 * rr);
                cc.restore();
            }
        }
    }
    // the drawn manner's lamp: where a lamp overhead is mirrored in a top (plane p0, n), a few
    // strokes of gold, salmon and orange laid across the car, clipped to its outline q. They
    // sweep along the top as the car drives under the lamps, and swell with the lamp's own light
    // (light.lamp, on the beat)
    function lampStrokes(g, F, q, p0, n, zr, size = 1) {
        if (!q || !F.lamps.length) return;
        for (const W0 of F.lamps) {
            const Lp = toLocal(F, W0), dl = dot(sub(Lp, p0), n);
            if (dl <= 0) continue;
            const V = sub(Lp, [2 * dl * n[0], 2 * dl * n[1], 2 * dl * n[2]]);
            const dv = sub(V, F.C), den = dot(dv, n); if (Math.abs(den) < 1e-6) continue;
            const t = dot(sub(p0, F.C), n) / den; if (t <= 0 || t >= 1) continue;
            const Pm = [F.C[0] + dv[0] * t, F.C[1] + dv[1] * t, F.C[2] + dv[2] * t];
            if (Pm[2] < zr[0] - 0.3 || Pm[2] > zr[1] + 0.3 || Math.abs(Pm[0]) > 1.1) continue;
            const s = F.pr(Pm); if (s[2] < 0.35) continue;
            const dist = Math.hypot(Lp[0] - Pm[0], Lp[1] - Pm[1], Lp[2] - Pm[2]);
            const a = clamp(1.5 / (1 + (dist / 11) ** 2), 0, 1) * (0.45 + 0.55 * Math.min(1, F.lamp));
            if (a < 0.15) continue;
            const sc = F.sc(Pm), seed = 8100 + Math.round(W0[2] * 3 + W0[0] * 7);
            const n0 = 2 + Math.round(4 * a), half = (0.22 + 0.2 * a) * size;
            g.save(); Neon.path(g, q); g.clip();
            for (let i = 0; i < n0; i++) {
                const u = (i + 0.5) / n0 - 0.5, h0 = hh(seed, i, DR), h1 = hh(seed + 1, i, DR), h2 = hh(seed + 2, i, DR);
                const cz = Pm[2] + u * 0.32 * size + (h0 - 0.5) * 0.08, cx = Pm[0] + (h1 - 0.5) * 0.25;
                const l = half * (0.55 + 0.6 * h2) * (1 - Math.abs(u) * 0.8);
                const z1 = cz + 0.03 * (h0 - 0.5), y = (z) => yb(z) + 0.014;     // on the top's own curve
                const A = F.pr([cx - l, y(cz), cz]), B = F.pr([cx + l, y(z1), z1]);
                if (A[2] < 0.35 || B[2] < 0.35) continue;
                Ink.brush(g, [[A[0], A[1]], [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 - 0.004 * sc], [B[0], B[1]]], {
                    w: Math.max(1.2, (0.022 + 0.012 * a) * sc * (0.7 + 0.5 * h1)), col: [K.gold, K.salmon, K.orange, K.gold, K.salmon][i % 5],
                    seed: seed * 13 + i, d: DR, taper: 0.4, wob: 0.6,
                });
            }
            g.restore();
        }
    }

    // ==========================================================================================
    function draw(g, L, N, cam, pose, light = {}, people = null) {
        DRAWN = !!light.drawn; DR = light.d ?? 0; LCUR = L;
        const F = frame(cam, pose, light), C = F.C;
        g.save(); L.save();
        ground(g, L, F);
        // which side of each separating plane the camera is on decides what covers the cockpit
        const sideOut = { [-1]: -C[0] > XC, 1: C[0] > XC };
        const hoodNear = C[2] > Z_WS, deckNear = C[2] < Z_CK;
        const wsNear = dot(sub(C, [0, 0.89, Z_WS]), WS_N) > 0;
        for (const w of wheelOrder(F)) wheel(g, L, F, w.s, w.W);
        // far: what lies beyond the cockpit as seen from here
        if (!deckNear) { deck(g, L, F); boot(g, L, F); }
        if (!hoodNear) { hood(g, L, F); pods(g, L, F); }
        for (const s of [-1, 1]) if (!sideOut[s]) { side(g, L, F, s); doorTop(g, L, F, s); mirror(g, L, F, s); }
        if (!wsNear) windshield(g, L, F, false);
        // the cockpit and the two of them
        cockpit(g, L, F, people);
        // near: what lies between the camera and the cockpit
        for (const s of [-1, 1]) if (sideOut[s]) { side(g, L, F, s); doorTop(g, L, F, s); mirror(g, L, F, s); }
        if (deckNear) { boot(g, L, F); deck(g, L, F); }
        if (C[2] < ZT + 0.05) tail(g, L, F);
        bumperSides(g, L, F);
        if (hoodNear) { hood(g, L, F); pods(g, L, F); }
        if (C[2] > ZN - 0.05) nose(g, L, F);
        if (wsNear) windshield(g, L, F, true);
        g.restore(); L.restore();
    }

    // --- the ground: a contact shadow, the lights on the wet road ---------------------------
    function ground(g, L, F) {
        if (DRAWN) return groundD(g, F);
        // the car's shadow: soft rings of dark under it
        for (const [ex, ez, a] of [[0.32, 0.38, 0.16], [0.16, 0.2, 0.22], [0.02, 0.05, 0.32]]) {
            const o = [[-0.9 - ex, 0.004, -2.15 - ez], [0.9 + ex, 0.004, -2.15 - ez], [0.9 + ex, 0.004, 2.15 + ez], [-0.9 - ex, 0.004, 2.15 + ez]];
            fill(g, F, o, `rgba(4,2,12,${a})`);
        }
        for (const s of [-1, 1]) for (const w of WHEELS) fill(g, F, [[s * (w.x - 0.16), 0.005, w.z - 0.3], [s * (w.x + 0.15), 0.005, w.z - 0.3], [s * (w.x + 0.15), 0.005, w.z + 0.3], [s * (w.x - 0.16), 0.005, w.z + 0.3]], 'rgba(2,1,8,0.45)');
        // the tail lights on the wet asphalt: streaks running from under the bumper towards the eye
        const C = F.C;
        if (C[2] < ZT) for (const x of [-0.56, 0, 0.56]) streak(g, L, F, [x, 0.8, ZT - 0.08], F.red, x ? 0.3 : 0.18, x ? 0.55 : 0.25);
        if (C[2] > ZN) for (const x of [-0.6, 0.6]) streak(g, L, F, [x, 0.76, ZN + 0.08], F.head, 0.26, 0.45);
        // the headlights' pool on the road ahead (on the picture: the two of them may stand in front of it)
        const pool = F.poly([[-0.8, 0.006, 2.4], [0.8, 0.006, 2.4], [2.6, 0.006, 16], [-2.6, 0.006, 16]]);
        if (pool) {
            const a = F.pr([0, 0, 2.6]), b = F.pr([0, 0, 15]);
            if (a[2] > 0.35 && b[2] > 0.35 && Math.hypot(b[0] - a[0], b[1] - a[1]) > 2) {
                const gr = g.createLinearGradient(a[0], a[1], b[0], b[1]);
                gr.addColorStop(0, css(F.head, 0.16)); gr.addColorStop(0.35, css(F.head, 0.08)); gr.addColorStop(1, css(F.head, 0));
                g.fillStyle = gr; Neon.path(g, pool); g.fill();
            }
        }
    }
    // a light at local point p (height p[1]) mirrored in the wet road: a narrow streak on the
    // ground from under it towards the camera, brightest where the mirror image falls
    function streak(g, L, F, p, col, w, a) {
        const C = F.C, dx = C[0] - p[0], dz = C[2] - p[2], D = Math.hypot(dx, dz); if (D < 0.5) return;
        const ux = dx / D, uz = dz / D, len = Math.min(D * 0.8, 3.6);
        const spec = Math.min(len * 0.8, (D * p[1]) / (p[1] + Math.max(0.2, C[1])));
        const at = (d, hw) => [[p[0] + ux * d - uz * hw, 0.007, p[2] + uz * d + ux * hw], [p[0] + ux * d + uz * hw, 0.007, p[2] + uz * d - ux * hw]];
        const A = F.pr([p[0], 0, p[2]]), B = F.pr([p[0] + ux * len, 0, p[2] + uz * len]);
        if (A[2] < 0.35 || B[2] < 0.35 || Math.hypot(B[0] - A[0], B[1] - A[1]) < 2) return;
        const u = clamp(spec / len, 0.05, 0.85);
        for (const [hw0, hw1, k] of [[w * 0.5, w * 0.9, 0.45], [w * 0.14, w * 0.24, 1]]) {
            const [a0, b0] = at(0.05, hw0), [a1, b1] = at(len, hw1);
            const q = F.poly([a0, b0, b1, a1]); if (!q) continue;
            for (const [c, kk] of [[g, 0.5], [L, 0.45]]) {
                const gr = c.createLinearGradient(A[0], A[1], B[0], B[1]);
                gr.addColorStop(0, css(col, a * 0.15 * k * kk)); gr.addColorStop(u, css(col, a * k * kk)); gr.addColorStop(Math.min(1, u + 0.3), css(col, a * 0.3 * k * kk)); gr.addColorStop(1, css(col, 0));
                c.fillStyle = gr; Neon.path(c, q); c.fill();
            }
        }
    }
    // drawn: one opaque flat shadow under the car (0.15 m wider than the body all round, its
    // edge brushed) so the car sits on the road, and the lights on the wet road as brush dashes
    function groundD(g, F) {
        const hw = 0.9 + 0.15, hl = 2.15 + 0.15, r = 0.42, o = [];
        for (const [cx, cz, a0] of [[hw - r, hl - r, 0], [-(hw - r), hl - r, Math.PI / 2], [-(hw - r), -(hl - r), Math.PI], [hw - r, -(hl - r), Math.PI * 1.5]])
            for (let i = 0; i <= 4; i++) { const a = a0 + (i / 4) * (Math.PI / 2); o.push([cx + Math.cos(a) * r, 0.004, cz + Math.sin(a) * r]); }
        const q = F.poly(o);
        if (q) Ink.shape(g, q, K.ink, { w: Math.max(1.5, 1.3 * F.w), ink: K.ink, seed: 5101, d: DR, jit: 1.2 });
        const C = F.C;
        if (C[2] < ZT) for (const x of [-0.56, 0, 0.56]) streakD(g, F, [x, 0.8, ZT - 0.08], x ? [K.red, K.pink, K.red, K.salmon] : [K.magenta, K.pink], x ? 0.3 : 0.16);
        if (C[2] > ZN) for (const x of [-0.6, 0.6]) streakD(g, F, [x, 0.76, ZN + 0.08], [K.cream, K.gold], 0.26);
    }
    // a light at local p mirrored in the wet road: short broken dashes across the line from under
    // it towards the camera, widening towards the viewer, within ~3 m of road
    function streakD(g, F, p, cols, w) {
        const C = F.C, dx = C[0] - p[0], dz = C[2] - p[2], D = Math.hypot(dx, dz); if (D < 0.6) return;
        const ux = dx / D, uz = dz / D, len = Math.min(D * 0.75, 3);
        const seed = 6007 + Math.round(p[0] * 100) + (p[2] > 0 ? 500 : 0), n = 8;
        for (let i = 0; i < n; i++) {
            if (hh(seed + 9, i, DR) < 0.18) continue;                                // broken
            const u = (i + 0.25 + 0.5 * hh(seed, i, DR)) / n, d = 0.15 + (len - 0.15) * u;
            const half = w * (0.3 + 0.8 * u) * (0.75 + 0.5 * hh(seed + 1, i, DR));
            const off = (hh(seed + 3, i, DR) - 0.5) * w * 0.35;
            const cx = p[0] + ux * d - uz * off, cz = p[2] + uz * d + ux * off;
            const A = F.pr([cx - uz * half, 0.008, cz + ux * half]), B = F.pr([cx + uz * half, 0.008, cz - ux * half]);
            if (A[2] < 0.35 || B[2] < 0.35) continue;
            const t0 = F.pr([cx, 0.008, cz]), t1 = F.pr([cx + ux * 0.06, 0.008, cz + uz * 0.06]);
            const th = clamp(Math.hypot(t1[0] - t0[0], t1[1] - t0[1]), 1.2, Math.max(1.6, F.w));
            Ink.brush(g, [[A[0], A[1]], [B[0], B[1]]], { w: th, col: cols[i % cols.length], seed: seed * 7 + i, d: DR, taper: 0.35, wob: 0.4 });
        }
    }

    // --- wheels ------------------------------------------------------------------------------
    function wheelOrder(F) {
        const out = [];
        for (const s of [-1, 1]) for (const W of WHEELS) out.push({ s, W, d: F.depth([s * W.x, R, W.z]) });
        return out.sort((a, b) => b.d - a.d);
    }
    function wheel(g, L, F, s, Wh, inArch = false) {
        const C = F.C, cx = s * Wh.x, c = [cx, R, Wh.z];
        if (F.depth(c) < 0.6) return;
        const faceOut = s * C[0] > Wh.x + Wh.w / 2;
        // the wheel well, dark, before the tyre (only where the side is seen)
        if (!inArch && s * C[0] > XS) fill(g, F, archPts(s, Wh.z, 0.86), '#07040e');
        // the tyre: the hull of its two sidewalls
        const pts = [];
        for (const xx of [cx - Wh.w / 2, cx + Wh.w / 2]) for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; const q = F.pr([xx, R + Math.sin(a) * R, Wh.z + Math.cos(a) * R]); pts.push([q[0], q[1]]); }
        const hull = convex(pts);
        if (DRAWN) return wheelD(g, F, s, Wh, hull, faceOut);
        g.fillStyle = '#100b18'; Neon.path(g, hull); g.fill();
        // the tread seen end-on: a faint sheen of the sky across the top of the tyre
        g.save(); Neon.path(g, hull); g.clip();
        const top = F.pr([cx, 2 * R, Wh.z]), mid = F.pr(c);
        const tg = g.createLinearGradient(top[0], top[1], mid[0], mid[1]);
        tg.addColorStop(0, 'rgba(120,90,170,0.32)'); tg.addColorStop(0.5, 'rgba(60,40,90,0.08)'); tg.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = tg; g.fillRect(Math.min(...hull.map((p) => p[0])) - 2, top[1] - 2, Math.max(...hull.map((p) => p[0])) - Math.min(...hull.map((p) => p[0])) + 4, mid[1] - top[1] + 4);
        for (const [xx, al] of [[cx + s * Wh.w / 2, 0.4], [cx + s * Wh.w * 0.15, 0.16], [cx - s * Wh.w * 0.15, 0.16]]) {
            const ring = []; for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2; ring.push([xx, R + Math.sin(a) * R * 0.985, Wh.z + Math.cos(a) * R * 0.985]); }
            line3(g, F, ring, `rgba(120,96,170,${al})`, px(F, 0.008, c, 0.5));
        }
        g.restore();
        if (!faceOut) return;
        // the outer face, mapped as an ellipse: the sidewall, then a flat-faced alloy
        const xo = cx + s * Wh.w / 2;
        const o = F.pr([xo, R, Wh.z]), ey = F.pr([xo, 2 * R, Wh.z]), ez = F.pr([xo, R, Wh.z + R]);
        const a = [ez[0] - o[0], ez[1] - o[1]], b = [ey[0] - o[0], ey[1] - o[1]];
        if (Math.abs(a[0] * b[1] - a[1] * b[0]) < 4) return;
        const metal = shade(F, [xo, 0.4, Wh.z], [s, 0.15, 0], MAT.metal);
        const spin = -F.pose.z / R;
        g.save();
        g.transform(a[0], a[1], b[0], b[1], o[0], o[1]);
        // sidewall: rubber with the sky's sheen on its top
        g.fillStyle = '#17101f'; g.beginPath(); g.arc(0, 0, 0.985, 0, Math.PI * 2); g.fill();
        const sw = g.createLinearGradient(0, 1, 0, -1);
        sw.addColorStop(0, 'rgba(140,110,200,0.3)'); sw.addColorStop(0.35, 'rgba(60,40,90,0.05)'); sw.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = sw; g.beginPath(); g.arc(0, 0, 0.985, 0, Math.PI * 2); g.arc(0, 0, RIM / R, 0, Math.PI * 2, true); g.fill();
        // the flat face: a disc lit from above, its lip, a dial of round holes smeared by the spin
        const k = RIM / R;
        const dg = g.createLinearGradient(0, k, 0, -k);
        dg.addColorStop(0, css(mix(metal, [255, 250, 255], 0.35))); dg.addColorStop(0.55, css(metal)); dg.addColorStop(1, css(mix(metal, [20, 12, 40], 0.55)));
        g.fillStyle = dg; g.beginPath(); g.arc(0, 0, k, 0, Math.PI * 2); g.fill();
        g.strokeStyle = css(mix(metal, [255, 255, 255], 0.5)); g.lineWidth = 0.035; g.beginPath(); g.arc(0, 0, k * 0.97, Math.PI * 0.05, Math.PI * 0.95); g.stroke();
        g.strokeStyle = 'rgba(20,12,36,0.55)'; g.lineWidth = 0.03; g.beginPath(); g.arc(0, 0, k * 0.9, 0, Math.PI * 2); g.stroke();
        for (const [dphi, al] of [[0, 0.62], [0.13, 0.3], [-0.13, 0.3]]) {
            g.fillStyle = `rgba(18,10,32,${al})`;
            for (let i = 0; i < 8; i++) { const an = spin + dphi + (i / 8) * Math.PI * 2; g.beginPath(); g.arc(Math.cos(an) * k * 0.6, Math.sin(an) * k * 0.6, k * 0.17, 0, Math.PI * 2); g.fill(); }
        }
        g.fillStyle = css(mix(metal, [30, 20, 50], 0.4)); g.beginPath(); g.arc(0, 0, k * 0.26, 0, Math.PI * 2); g.fill();
        g.fillStyle = css(mix(metal, [255, 255, 255], 0.45)); g.beginPath(); g.arc(0, 0, k * 0.15, 0, Math.PI * 2); g.fill();
        g.restore();
    }
    // drawn: the tyre a flat deep ink with its line and a stroke of sky on the tread; the outer
    // face an inked sidewall, a pale flat-faced alloy whose dial of holes the spin smears into a
    // groove, a hub, a stroke of light on the lip
    function wheelD(g, F, s, Wh, hull, faceOut) {
        const cx = s * Wh.x, lw = lineIn(F), seed = 7300 + (s > 0 ? 50 : 0) + (Wh.z > 0 ? 7 : 0);
        Ink.shape(g, hull, K.deep, { w: lw, seed, d: DR, jit: 0.5 });
        const xo = cx + s * Wh.w / 2;
        if (!faceOut) {
            // seen end-on: the tread's top catches the sky
            const arc = []; for (let i = 0; i <= 6; i++) { const a = Math.PI * (0.3 + 0.4 * i / 6); arc.push([cx + s * Wh.w * 0.2, R + Math.sin(a) * R * 0.97, Wh.z + Math.cos(a) * R * 0.97]); }
            edge3(g, F, arc, 0.35, K.violet, { taper: 0.4 });
            return;
        }
        const o = F.pr([xo, R, Wh.z]), ey = F.pr([xo, 2 * R, Wh.z]), ez = F.pr([xo, R, Wh.z + R]);
        const a = [ez[0] - o[0], ez[1] - o[1]], b = [ey[0] - o[0], ey[1] - o[1]];
        if (Math.abs(a[0] * b[1] - a[1] * b[0]) < 4) return;
        const E = (u, v) => [o[0] + a[0] * u + b[0] * v, o[1] + a[1] * u + b[1] * v];
        const ell = (r, n = 22, c0 = 0, c1 = Math.PI * 2) => { const out = []; for (let i = 0; i < n; i++) { const t = c0 + ((c1 - c0) * i) / (c1 - c0 >= Math.PI * 2 - 1e-6 ? n : n - 1); out.push(E(Math.cos(t) * r, Math.sin(t) * r)); } return out; };
        const k = RIM / R, rpx = Math.hypot(b[0], b[1]);
        Ink.shape(g, ell(0.985, 26), K.deep, { w: lw, seed: seed + 1, d: DR, jit: 0.4 });
        Ink.brush(g, ell(0.9, 9, Math.PI * 0.3, Math.PI * 0.75), { w: Math.max(1, 0.05 * rpx), col: K.violet, seed: seed + 2, d: DR, taper: 0.4 });
        Ink.shape(g, ell(k, 22), K.light, { w: lw, seed: seed + 3, d: DR, jit: 0.3 });
        Ink.brush(g, ell(k * 0.6, 18), { w: Math.max(1, k * 0.3 * rpx), col: K.purple, seed: seed + 4, d: DR, closed: true, taper: 0, wob: 0.3 });
        Ink.brush(g, ell(k * 0.86, 8, Math.PI * 0.15, Math.PI * 0.7), { w: Math.max(1, 0.06 * k * rpx), col: K.cream, seed: seed + 5, d: DR, taper: 0.45 });
        Ink.brush(g, ell(k * 0.8, 6, Math.PI * 1.15, Math.PI * 1.5), { w: Math.max(1, 0.05 * k * rpx), col: K.cyan, seed: seed + 6, d: DR, taper: 0.45 });
        Ink.shape(g, ell(k * 0.24, 12), K.pink, { w: Math.max(1, 0.4 * F.w), seed: seed + 7, d: DR, jit: 0.2 });
    }
    function convex(P0) {
        const Q = P0.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
        const lo = [], up = [];
        for (const p of Q) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
        for (let i = Q.length - 1; i >= 0; i--) { const p = Q[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
        return lo.slice(0, -1).concat(up.slice(0, -1));
    }
    // the arch cut into the side round a wheel, as a closed outline at half-width x
    function archPts(s, zw, x = 0.89) {
        const out = [], a0 = Math.asin((YS - R) / ARCH);
        for (let i = 0; i <= 16; i++) { const a = a0 + ((Math.PI - 2 * a0) * i) / 16; out.push([s * x, R + Math.sin(a) * ARCH, zw + Math.cos(a) * ARCH]); }
        out.push([s * x, 0.05, zw - ARCH], [s * x, 0.05, zw + ARCH]);
        return out;
    }

    // --- the side of the body -----------------------------------------------------------------
    // the side's own clip: everything but the two wheel arches
    function clipArches(c, F, s) {
        c.beginPath(); c.rect(-5000, -5000, 12000, 12000);
        for (const W of WHEELS) { const q = F.poly(archPts(s, W.z)); if (q) q.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); }
        c.clip('evenodd');
    }
    const bandOutline = (s, f, z0, z1, u0, u1, n = 14) => { const zz = along(z0, z1, n); return zz.map((z) => f(s, z, u0)).concat(zz.reverse().map((z) => f(s, z, u1))); };

    function side(g, L, F, s) {
        const C = F.C;
        const upVis = visible(F, onUp(s, 0, 0.5), upN(s, 0)), loVis = visible(F, onLo(s, 0, 0.5), loN(s, 0));
        if (!upVis && !loVis) return;
        if (s * C[0] > XS) for (const W of WHEELS) {
            const q = F.poly(archPts(s, W.z)); if (!q) continue;
            g.save(); Neon.path(g, q); g.clip();
            fill(g, F, archPts(s, W.z, 0.86), '#07040e');
            wheel(g, L, F, s, W, true);
            g.restore();
        }
        g.save(); clipArches(g, F, s);
        // the lower side: the dark of the road and the bay reflected below the crease
        if (loVis) {
            const stops = ZS.map((z) => ({ p: onLo(s, z, 0.45), n: loN(s, z) }));
            fill(g, F, bandOutline(s, onLo, ZT, ZN, 0, 1, 22), grad(g, F, stops, MAT.paint));
            // the crease's shadow band and the road's glow near the sill
            fill(g, F, bandOutline(s, onLo, ZT + 0.02, ZN - 0.02, 0, 0.22, 22), 'rgba(16,8,38,0.38)');
            fill(g, F, bandOutline(s, onLo, ZT + 0.02, ZN - 0.02, 0.78, 1, 22), css(mix(F.warm, [90, 60, 140], 0.6), 0.1 + 0.12 * F.lamp));
            // the black rocker between the arches
            const rz0 = WHEELS[1].z + ARCH, rz1 = WHEELS[0].z - ARCH;
            fill(g, F, bandOutline(s, onLo, rz0, rz1, 0.7, 1.02, 6), grad(g, F, [{ p: onLo(s, rz0, 0.85), n: loN(s, rz0) }, { p: onLo(s, rz1, 0.85), n: loN(s, rz1) }], MAT.black));
            line3(g, F, along(rz0, rz1, 6).map((z) => onLo(s, z, 0.7)), 'rgba(170,140,220,0.35)', px(F, 0.006, onLo(s, 0, 0.7)));
        }
        if (upVis) {
            const stops = ZS.map((z) => ({ p: onUp(s, z, 0.5), n: upN(s, z) }));
            fill(g, F, bandOutline(s, onUp, ZT, ZN, 0, 1, 22), grad(g, F, stops, MAT.paint));
            // the shoulder catching the sky, the horizon's hot band just above the crease
            fill(g, F, bandOutline(s, onUp, ZT + 0.02, ZN - 0.02, 0, 0.16, 22), css(mix(envAt(F, 0.3, 0.5), [255, 240, 255], 0.5), 0.3));
            // the horizon reflected just above the crease: hot pink where the ray goes on to the city
            // the airbrush down the door: the sky's violet deepening towards the crease
            const zm = clamp(C[2], -1.2, 1.2), a0 = F.pr(onUp(s, zm, 0.12)), a1 = F.pr(onUp(s, zm, 0.7));
            if (a0[2] > 0.35 && a1[2] > 0.35 && Math.hypot(a1[0] - a0[0], a1[1] - a0[1]) > 1) {
                const vg = g.createLinearGradient(a0[0], a0[1], a1[0], a1[1]), vc = envAt(F, 0.16, 0);
                vg.addColorStop(0, css(vc, 0)); vg.addColorStop(1, css(vc, 0.3));
                fill(g, F, bandOutline(s, onUp, ZT + 0.01, ZN - 0.03, 0.12, 0.7, 22), vg);
            }
            const hz = ZS.map((z) => { const p = onUp(s, z, 0.8), v = nrm(sub(F.C, p)); return [p, mix(envAt(F, 0.012, -v[2]), [255, 120, 200], 0.2)]; });
            fill(g, F, bandOutline(s, onUp, ZT + 0.02, ZN - 0.05, 0.7, 0.94, 22), gradC(g, F, hz, 0.45));
            sideDetails(g, L, F, s);
        }
        // the crease: a crisp line of light along the body, the pinstripe under it
        const zz = along(ZT + 0.03, ZN - 0.06, 22);
        line3(g, F, zz.map((z) => onUp(s, z, 0.985)), css(mix(F.hz[1], [255, 255, 255], 0.55), 0.75), px(F, 0.007, crease(s, 0), 0.6));
        pinstripe(g, F, s);
        if (DRAWN) {
            // the silhouette against the road: the sill (broken by the arches) at full weight
            if (loVis) edge3(g, F, along(ZT + 0.01, ZN - 0.01, 30).map((z) => sill(s, z)), 1, null, { seed: 5200 + s });
            // the shoulder catches the sky: a few strokes of light just under it
            if (upVis) sideLight(g, F, s);
        }
        g.restore();
        if (DRAWN) {
            if (upVis) edge3(g, F, along(ZT, ZN, 26).map((z) => shoulder(s, z)), 1, null, { seed: 5210 + s });
            for (const z of [ZT, ZN]) edge3(g, F, [shoulder(s, z), crease(s, z), sill(s, z)], 0.8, null, { seed: 5220 + s + (z > 0 ? 3 : 0) });
        }
        // wheel-arch lips: the top of each arch catches the sky
        for (const W of WHEELS) {
            const lip = []; for (let i = 2; i <= 14; i++) { const a = Math.asin((YS - R) / ARCH) + ((Math.PI - 2 * Math.asin((YS - R) / ARCH)) * i) / 16; lip.push([s * 0.895, R + Math.sin(a) * (ARCH + 0.008), W.z + Math.cos(a) * (ARCH + 0.008)]); }
            line3(g, F, lip, 'rgba(14,8,30,0.85)', px(F, 0.018, [s * 0.9, 0.6, W.z]));
            line3(g, F, lip.map((p) => [p[0], p[1] + 0.012, p[2]]), css(mix(envAt(F, 0.2, 0), [255, 255, 255], 0.4), 0.55), px(F, 0.006, [s * 0.9, 0.6, W.z]));
        }
        // side markers: amber ahead, red behind
        marker(g, L, F, s, 1.86, 2.0, onLo, 0.06, 0.2, F.amber, 0.7);
        marker(g, L, F, s, -2.02, -1.88, onUp, 0.72, 0.86, F.red, 0.75);
    }
    function marker(g, L, F, s, z0, z1, f, u0, u1, col, a) {
        const o = bandOutline(s, f, z0, z1, u0, u1, 2);
        for (const i of outsE(F)) { const c = i ? L : g; fill(c, F, o, css(i ? col : mix(col, [255, 230, 200], 0.25), i ? a * 0.6 : 1), 0.25); }
    }
    // drawn: strokes of light pink laid down the upper side from the shoulder, and two of cyan
    // along the crease (the city's light), thinning out towards the tail
    function sideLight(g, F, s) {
        const seed = 5300 + (s > 0 ? 1 : 0), n = 9;
        for (let i = 0; i < n; i++) {
            const z = ZT + 0.3 + ((ZN - ZT - 0.6) * (i + 0.2 + 0.6 * hh(seed, i, DR))) / n;
            const l = 0.18 + 0.3 * hh(seed + 1, i, DR);
            const a = onUp(s, z, 0.06), b = onUp(s, z - 0.08, Math.min(0.75, 0.06 + l));
            edge3(g, F, [a, lerp3(a, b, 0.5), b], 0.3 + 0.15 * hh(seed + 2, i, DR), i % 3 === 2 ? K.pink : K.light, { seed: seed * 17 + i, taper: 0.45 });
        }
        for (const [z0, z1] of [[0.25, 1.3], [-1.6, -0.9]]) edge3(g, F, along(z0, z1, 6).map((z) => onUp(s, z, 0.9)), 0.3, K.cyan, { seed: seed + Math.round(z0 * 10), taper: 0.35 });
    }
    function pinstripe(g, F, s) {
        // pink over teal, a hair apart, from the nose to the tail
        const zz = along(ZT + 0.06, ZN - 0.12, 24);
        const off = (z, d) => { const c = crease(s, z), sh = shoulder(s, z), v = nrm(sub(sh, c)); return [c[0] + v[0] * d, c[1] + v[1] * d, c[2]]; };
        if (DRAWN) {
            // two brush lines, pink over cyan (fills this thin would be all ink line)
            for (const [d, col] of [[0.04, K.pink], [0.024, K.cyan]]) edge3(g, F, zz.map((z) => off(z, d)), 0.28, col, { seed: 5400 + (s > 0 ? 1 : 0) + Math.round(d * 1000), taper: 0.04 });
            return;
        }
        const lit = 0.55 + 0.35 * Math.min(1, F.lamp);
        for (const [d0, d1, col] of [[0.034, 0.046, F.pink], [0.018, 0.03, F.teal]]) {
            const o = zz.map((z) => off(z, d0)).concat(zz.slice().reverse().map((z) => off(z, d1)));
            fill(g, F, o, css(mix(col, [40, 20, 80], 1 - lit)));
        }
    }
    function sideDetails(g, L, F, s) {
        const dark = 'rgba(20,10,44,0.75)', hi = 'rgba(235,225,255,0.35)';
        // the door: its cut lines front and back, a flush handle
        for (const z of [0.74, -0.84]) {
            const pts = along(0, 1, 4).map((u) => onUp(s, z, u)).concat(along(0, 1, 4).map((u) => onLo(s, z, u)));
            line3(g, F, pts, dark, px(F, 0.008, pts[3]));
            line3(g, F, pts.map((p) => [p[0], p[1], p[2] + (z > 0 ? -0.012 : 0.012)]), hi, px(F, 0.004, pts[3]));
        }
        fill(g, F, bandOutline(s, onUp, -0.74, -0.56, 0.2, 0.3, 2), 'rgba(12,6,24,0.85)');
        line3(g, F, along(-0.74, -0.56, 2).map((z) => onUp(s, z, 0.31)), hi, px(F, 0.004, onUp(s, -0.65, 0.3)));
        // the rear quarter's intake: a tapered black scoop with three strakes
        const sc = [[-0.9, 0.22], [-1.52, 0.42], [-1.52, 0.8], [-0.9, 0.86]].map(([z, u]) => onUp(s, z, u));
        const sq = fill(g, F, sc, grad(g, F, [{ p: onUp(s, -0.9, 0.5), n: upN(s, -0.9) }, { p: onUp(s, -1.5, 0.6), n: upN(s, -1.5) }], MAT.black));
        if (sq) {
            for (const v of [0.3, 0.55, 0.78]) {
                const a = lerp3(sc[0], sc[3], v), b = lerp3(sc[1], sc[2], v);
                line3(g, F, [a, b], css(shade(F, a, upN(s, -1.2), MAT.paint), 0.9), px(F, 0.012, a));
            }
            line3(g, F, [sc[0], sc[1]], hi, px(F, 0.005, sc[0]));
        }
        // the fuel flap on the right
        if (s > 0) { const o = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; o.push(onUp(s, -1.78 + Math.cos(a) * 0.065, 0.4 + Math.sin(a) * 0.25)); } line3(g, F, o.concat([o[0]]), 'rgba(20,10,44,0.5)', px(F, 0.005, o[0])); }
    }

    // --- the tops --------------------------------------------------------------------------
    const topStops = (z0, z1) => ZS.filter((z) => z >= z0 - 1e-6 && z <= z1 + 1e-6).map((z) => ({ p: [0, yb(z) + 0.012, z], n: topN(z) }));
    const topOutline = (z0, z1, n = 10) => { const zz = along(z0, z1, n); return zz.map((z) => shoulder(-1, z)).concat(zz.reverse().map((z) => shoulder(1, z))); };
    // the shoulders' rim: magenta from behind, cyan from the city ahead, along both shoulders
    function shoulderRim(g, L, F, s, z0, z1) {
        const zz = along(z0, z1, Math.max(2, Math.round((z1 - z0) / 0.2)));
        const cols = [[0, F.magenta, 0.95], [0.42, mix(F.pink, [255, 235, 250], 0.45), 0.7], [1, F.cyan, 0.95]];
        const p = shoulder(s, (z0 + z1) / 2);
        for (const i of outs(F)) {
            const c = i ? L : g;
            const st = lineGrad(c, F, shoulder(s, ZT), shoulder(s, ZN), cols.map(([u, col, a]) => [u, col, a * (i ? 0.32 * F.city : 1)]));
            line3(c, F, zz.map((z) => shoulder(s, z)), st, px(F, i ? 0.014 : 0.009, p, 0.7));
        }
    }
    // crowned tops: darker where they roll over to the shoulders, a pale streak down the middle
    function crown(g, F, z0, z1) {
        for (const s of [-1, 1]) {
            const zz = along(z0, z1, 8);
            const o = zz.map((z) => shoulder(s, z)).concat(zz.slice().reverse().map((z) => [s * (xb(z) - 0.16), yb(z) + 0.01, z]));
            fill(g, F, o, 'rgba(26,14,60,0.2)');
        }
        const zz = along(z0, z1, 8);
        const o = zz.map((z) => [-0.1, yb(z) + 0.013, z]).concat(zz.slice().reverse().map((z) => [0.1, yb(z) + 0.013, z]));
        fill(g, F, o, css(mix(envAt(F, 0.25, 1), [255, 245, 255], 0.6), 0.1));
        // two hairlines of sky along the crown, fading at both ends
        const hi = mix(envAt(F, 0.06, 1), [255, 245, 255], 0.7);
        for (const sg of [-1, 1]) {
            const pts = zz.map((z) => [sg * (xb(z) - 0.13), yb(z) + 0.014, z]);
            line3(g, F, pts, lineGrad(g, F, pts[0], pts[pts.length - 1], [[0, hi, 0], [0.5, hi, 0.65], [1, hi, 0]]), px(F, 0.009, pts[4], 0.6));
        }
    }
    function hood(g, L, F) {
        if (F.C[1] < 0.6 && F.C[2] < Z_WS) return;
        const o = topOutline(Z_WS, ZN);
        const q = fill(g, F, o, grad(g, F, topStops(Z_WS, ZN), MAT.paint));
        if (!q) return;
        crown(g, F, Z_WS + 0.1, ZN - 0.02);
        lampGlints(g, L, F, q, [0, yb(1.4), 1.4], topN(1.4), 1.1);
        // the lid's seam and a pair of slim vents ahead of the windshield
        const seam = [[-0.56, 0.94], [-0.6, 1.92], [-0.45, 2.04], [0.45, 2.04], [0.6, 1.92], [0.56, 0.94]].map(([x, z]) => [x, yb(z) + 0.013, z]);
        line3(g, F, seam, 'rgba(26,14,56,0.55)', px(F, 0.006, seam[2]));
        line3(g, F, seam.map((p) => [p[0], p[1], p[2] - 0.012]), 'rgba(240,230,255,0.25)', px(F, 0.004, seam[2]));
        for (const x of [-0.32, 0.32]) for (let i = 0; i < 4; i++) {
            const z = 1.0 + i * 0.06, a = [x - 0.13, yb(z) + 0.014, z], b = [x + 0.13, yb(z) + 0.014, z];
            line3(g, F, [a, b], 'rgba(12,6,26,0.8)', px(F, 0.018, a), 'butt');
        }
        // the cowl: a black strip at the windshield's foot, the wipers parked on it
        const cowl = [[-0.74, 0.889, Z_WS], [0.74, 0.889, Z_WS], [0.74, yb(0.92) + 0.014, 0.92], [-0.74, yb(0.92) + 0.014, 0.92]];
        fill(g, F, cowl, grad(g, F, [{ p: [0, 0.89, 0.86], n: topN(0.86) }, { p: [0, 0.89, 0.86], n: topN(0.86) }], MAT.black));
        for (const x of [-0.5, 0.12]) line3(g, F, [[x - 0.02, 0.895, 0.86], [x + 0.5, 0.893, 0.84]], 'rgba(150,140,190,0.6)', px(F, 0.007, [x, 0.9, 0.85]));
        shoulderRim(g, L, F, -1, Z_WS, ZN); shoulderRim(g, L, F, 1, Z_WS, ZN);
    }
    function deck(g, L, F) {
        if (F.C[1] < 0.95 && F.C[2] > ZT) return;
        const o = topOutline(ZT, Z_CK);
        const q = fill(g, F, o, grad(g, F, topStops(ZT, Z_CK).concat([{ p: [0, yb(Z_CK) + 0.01, Z_CK], n: topN(Z_CK) }]), MAT.paint));
        if (!q) return;
        crown(g, F, ZT + 0.03, Z_CK);
        // the seats behind the two of them, mirrored dimly in the gloss near the cockpit
        if (F.C[2] < Z_CK && F.C[1] > yb(Z_CK)) {
            g.save(); Neon.path(g, q); g.clip();
            const h = yb(Z_CK) + 0.01, mir = (p) => [p[0], 2 * h - p[1], p[2]];
            const uy = nrm([0, 0.56, -0.18]);
            for (const st of SEATS) {
                const o = rrect([st.x, 0.73, -0.85], [1, 0, 0], uy, 0.255, 0.29, 0.1, 0.03).filter((p) => p[1] > h).map(mir);
                const hr = rrect([st.x, 1.055, -0.955], [1, 0, 0], uy, 0.13, 0.062, 0.058, 0.04).map(mir);
                for (const part of [o, hr]) {
                    const hq = part.length > 2 ? hullOf(F, part) : null; if (!hq) continue;
                    const y0 = Math.min(...hq.map((p) => p[1])), y1 = Math.max(...hq.map((p) => p[1]));
                    const rg = g.createLinearGradient(0, y0, 0, y1 + 1), col = mix(MAT.leather.lit, [40, 12, 50], 0.45);
                    rg.addColorStop(0, css(col, 0.2)); rg.addColorStop(1, css(col, 0));
                    g.fillStyle = rg; Neon.path(g, hq); g.fill();
                }
            }
            g.restore();
        }
        lampGlints(g, L, F, q, [0, yb(-1.7), -1.7], topN(-1.7), 0.9);
        // the lid's seam
        const seam = [[-0.66, -1.38], [-0.7, -1.95], [-0.62, -2.03], [0.62, -2.03], [0.7, -1.95], [0.66, -1.38], [-0.66, -1.38]].map(([x, z]) => [x, yb(z) + 0.012, z]);
        line3(g, F, seam, 'rgba(26,14,56,0.5)', px(F, 0.006, seam[2]));
        line3(g, F, seam.map((p) => [p[0], p[1], p[2] + 0.012]), 'rgba(240,230,255,0.22)', px(F, 0.004, seam[2]));
        // the ducktail's crest: a crisp line of light across the tail, magenta from behind
        const lip = along(-0.84, 0.84, 8).map((x) => [x, yb(ZT) + 0.004, ZT + 0.015]);
        for (const i of outs(F)) line3(i ? L : g, F, lip, css(mix(F.magenta, [255, 220, 255], i ? 0 : 0.35), i ? 0.3 * F.city : 0.9), px(F, i ? 0.014 : 0.009, lip[4], 0.7));
        shoulderRim(g, L, F, -1, ZT, Z_CK); shoulderRim(g, L, F, 1, ZT, Z_CK);
    }
    function boot(g, L, F) {
        // the folded top under a padded black cover behind the seats
        const zz = along(Z_CK, Z_BOOT, 4);
        const o = zz.map((z) => [-0.78, yb(z) + 0.012, z]).concat(zz.slice().reverse().map((z) => [0.78, yb(z) + 0.012, z]));
        const top = (z) => [0, yb(z) + 0.05, z];
        fill(g, F, o, grad(g, F, [{ p: [-0.78, yb(-1.15), -1.15], n: [-0.5, 0.86, 0] }, { p: top(-1.15), n: [0, 1, 0] }, { p: [0.78, yb(-1.15), -1.15], n: [0.5, 0.86, 0] }], MAT.vinyl));
        // the padding's crown and its welt, stitched
        const crest = along(-0.7, 0.7, 8).map((x) => [x, yb(-1.15) + 0.045 * (1 - (x / 0.78) ** 2), -1.16]);
        line3(g, F, crest, css(mix(envAt(F, 0.3, 0.5), [255, 255, 255], 0.3), 0.32), px(F, 0.02, crest[4]));
        line3(g, F, o.concat([o[0]]), 'rgba(4,2,10,0.9)', px(F, 0.008, crest[4]));
        line3(g, F, along(-0.72, 0.72, 10).map((x) => [x, yb(Z_CK) + 0.018, Z_CK - 0.03]), 'rgba(150,120,190,0.35)', px(F, 0.003, crest[4]));
    }
    function doorTop(g, L, F, s) {
        if (F.C[1] < yb(0)) { shoulderRim(g, L, F, s, Z_CK, Z_WS); return; }
        const zz = along(Z_CK, Z_WS, 6);
        const o = zz.map((z) => shoulder(s, z)).concat(zz.slice().reverse().map((z) => [s * XC, yb(z) - 0.004, z]));
        fill(g, F, o, grad(g, F, zz.filter((_, i) => i % 2 === 0).map((z) => ({ p: [s * 0.81, yb(z), z], n: nrm([s * 0.12, 1, -(yb(z + 0.03) - yb(z - 0.03)) / 0.06]) })), MAT.paint));
        // the inner edge: black rubber and a chrome bead
        line3(g, F, zz.map((z) => [s * (XC + 0.012), yb(z) + 0.002, z]), 'rgba(8,4,16,0.9)', px(F, 0.022, [s * XC, 0.94, -0.1]), 'butt');
        line3(g, F, zz.map((z) => [s * (XC + 0.026), yb(z) + 0.004, z]), css(mix(envAt(F, 0.2, 0.3), [255, 255, 255], 0.55), 0.85), px(F, 0.005, [s * XC, 0.94, -0.1]));
        shoulderRim(g, L, F, s, Z_CK, Z_WS);
    }
    function mirror(g, L, F, s) {
        // a wedge housing in black on a short stalk at the door's front
        const z0 = 0.56, z1 = 0.66, x0 = s * 0.9, x1 = s * 1.07, y0 = 0.975, y1 = 1.065;
        line3(g, F, [[s * 0.84, yb(0.62) + 0.01, 0.62], [s * 0.93, 1.0, 0.6]], '#0b0716', px(F, 0.03, [s * 0.9, 1, 0.6]));
        const box = (x, z) => [[x0, y0, z], [x1, y0 + 0.012, z], [x1, y1, z], [x0, y1 - 0.012, z]];
        const back = box(0, z0), front = box(0, z1);
        const faces = [
            [back, [0, 0, -1]], [front, [0, 0, 1]],
            [[back[0], back[1], front[1], front[0]], [0, -1, 0]], [[back[3], back[2], front[2], front[3]], [0, 1, 0]],
            [[back[1], back[2], front[2], front[1]], [s, 0, 0]], [[back[0], back[3], front[3], front[0]], [-s, 0, 0]],
        ];
        for (const [pts, n] of faces) {
            if (!visible(F, pts[0], n)) continue;
            fill(g, F, pts, css(shade(F, pts[0], n, MAT.black)));
            if (n[2] < 0) {
                const gl = [[x0 + s * 0.015, y0 + 0.014, z0 - 0.002], [x1 - s * 0.012, y0 + 0.022, z0 - 0.002], [x1 - s * 0.012, y1 - 0.012, z0 - 0.002], [x0 + s * 0.015, y1 - 0.02, z0 - 0.002]];
                const a = F.pr(gl[3]), b = F.pr(gl[0]);
                const gg = g.createLinearGradient(a[0], a[1], b[0], b[1]);
                gg.addColorStop(0, css(envAt(F, 0.3, -1))); gg.addColorStop(0.55, css(envAt(F, 0.04, -1))); gg.addColorStop(1, css(envAt(F, -0.05, -1)));
                fill(g, F, gl, gg);
            }
        }
        if (visible(F, back[0], [0, 0, -1])) line3(g, F, [back[3], back[2]], css(F.magenta, 0.7), px(F, 0.006, back[2]));
        else line3(g, F, [front[3], front[2]], css(F.cyan, 0.7), px(F, 0.006, front[2]));
        { const t = F.pr([x1 - s * 0.01, y1 - 0.01, z0]); if (t[2] > 0.5) glintAt(g, L, F, t, 0.02, mix(F.cyan, [255, 255, 255], 0.5), 0.3 + 0.3 * Math.min(1, F.lamp)); }
    }
    function glintAt(g, L, F, t, m, col, a) {
        const r = Math.max(1.2, m * F.cam.f / t[2]);
        for (const i of outs(F)) {
            const c = i ? L : g;
            c.save();
            const gr = c.createRadialGradient(t[0], t[1], 0, t[0], t[1], r * 3);
            gr.addColorStop(0, css(mix(col, [255, 255, 255], 0.7), a)); gr.addColorStop(0.25, css(col, a * 0.4)); gr.addColorStop(1, css(col, 0));
            c.fillStyle = gr; c.beginPath(); c.arc(t[0], t[1], r * 3, 0, Math.PI * 2); c.fill();
            c.strokeStyle = css(mix(col, [255, 255, 255], 0.6), a * 0.8); c.lineWidth = Math.max(0.6, r * 0.16);
            c.beginPath(); c.moveTo(t[0] - r * 5, t[1]); c.lineTo(t[0] + r * 5, t[1]); c.moveTo(t[0], t[1] - r * 3.2); c.lineTo(t[0], t[1] + r * 3.2); c.stroke();
            c.restore();
        }
    }

    // --- pop-up headlights, raised ------------------------------------------------------------
    function pods(g, L, F) {
        for (const s of [-1, 1]) {
            const xi = s * 0.4, xo = s * 0.78, zb = 1.5, zf = 1.79, yt = 0.835;
            const hb = (z) => yb(z) + 0.01;
            const B = [[xi, hb(zb), zb], [xo, hb(zb) - 0.004, zb], [xo, yt, zb + 0.02], [xi, yt, zb + 0.02]];   // back
            const Fr = [[xi, hb(zf), zf], [xo, hb(zf) - 0.004, zf], [xo, yt, zf], [xi, yt, zf]];            // front
            const faces = [
                [Fr, [0, 0, 1], 'front'], [B, [0, 0.08, -1], 'back'],
                [[B[3], B[2], Fr[2], Fr[3]], [0, 1, 0], 'top'],
                [[B[1], B[2], Fr[2], Fr[1]], [s, 0, 0], 'side'], [[B[0], B[3], Fr[3], Fr[0]], [-s, 0, 0], 'side'],
            ];
            for (const [pts, n, k] of faces) {
                if (!visible(F, pts[0], n)) continue;
                if (k === 'front') { headlamp(g, L, F, s, Fr); continue; }
                fill(g, F, pts, grad(g, F, [{ p: lerp3(pts[0], pts[1], 0.5), n }, { p: lerp3(pts[2], pts[3], 0.5), n }], MAT.paint));
            }
            // the city on the pod's front edge, the deck's shut line round its foot
            line3(g, F, [Fr[3], Fr[2]], css(F.cyan, 0.85), px(F, 0.007, Fr[2]));
            line3(g, F, [B[3], B[2]], css(mix(F.magenta, [255, 255, 255], 0.3), 0.55), px(F, 0.005, B[2]));
            line3(g, F, [B[0], B[1], Fr[1], Fr[0], B[0]], 'rgba(20,10,40,0.6)', px(F, 0.005, B[1]));
        }
    }
    function headlamp(g, L, F, s, Fr) {
        fill(g, F, Fr, css(shade(F, Fr[0], [0, 0, 1], MAT.black)));
        const lx0 = s * 0.43, lx1 = s * 0.75, ly0 = Fr[0][1] + 0.03, ly1 = 0.815, z = 1.795;
        const lens = [[lx0, ly0, z], [lx1, ly0, z], [lx1, ly1, z], [lx0, ly1, z]];
        const q = F.poly(lens); if (!q) return;
        const c = F.pr([(lx0 + lx1) / 2, (ly0 + ly1) / 2, z]), r = 0.2 * F.sc(lens[0]);
        for (const i of outs(F)) {
            const cc = i ? L : g;
            const gr = cc.createRadialGradient(c[0], c[1], 0, c[0], c[1], r);
            gr.addColorStop(0, css(mix(F.head, [255, 255, 255], 0.75), i ? 0.75 * F.power : 1));
            gr.addColorStop(0.45, css(F.head, i ? 0.5 * F.power : 1));
            gr.addColorStop(1, css(mix(F.head, [255, 170, 90], 0.4), i ? 0.3 : 1));
            cc.fillStyle = gr; Neon.path(cc, q); cc.fill();
        }
        // the reflector's ribs
        for (let k = 1; k < 4; k++) { const y = ly0 + ((ly1 - ly0) * k) / 4; line3(g, F, [[lx0, y, z + 0.002], [lx1, y, z + 0.002]], 'rgba(150,110,60,0.35)', px(F, 0.003, lens[0])); }
    }

    // --- the windshield ---------------------------------------------------------------------
    const WS = { b: 0.745, t: 0.645, yb: 0.889, yt: 1.19, zb: Z_WS, zt: 0.3 };
    const WS_N = nrm([0, WS.zb - WS.zt, WS.yt - WS.yb]);
    function windshield(g, L, F, front) {
        const glass = [[-WS.b, WS.yb, WS.zb], [WS.b, WS.yb, WS.zb], [WS.t, WS.yt, WS.zt], [-WS.t, WS.yt, WS.zt]];
        const q = F.poly(glass); if (!q) return;
        // the glass: the sky it reflects (strong from outside, faint from inside), the dash's
        // glow mirrored low on it from inside, two diagonal sheens
        const mid = [0, (WS.yb + WS.yt) / 2, (WS.zb + WS.zt) / 2];
        const v = nrm(sub(F.C, mid)), nv = Math.abs(dot(v, WS_N));
        const refl = front ? 0.18 + 0.55 * (1 - nv) ** 2 : 0.1;
        const a = F.pr([0, WS.yt, WS.zt]), b = F.pr([0, WS.yb, WS.zb]);
        const gr = g.createLinearGradient(a[0], a[1], b[0], b[1]);
        gr.addColorStop(0, css(envAt(F, 0.45, 0), refl)); gr.addColorStop(0.6, css(envAt(F, 0.12, front ? 1 : -1), refl * 0.8));
        gr.addColorStop(1, front ? css(envAt(F, 0.02, 1), refl) : css(F.dashCyan, 0.12));
        g.fillStyle = gr; Neon.path(g, q); g.fill();
        g.save(); Neon.path(g, q); g.clip();
        for (const [u0, w, al] of [[0.18, 0.1, 0.16], [0.36, 0.04, 0.12], [0.7, 0.14, 0.08]]) {
            const p = [lerp3(glass[0], glass[1], u0), lerp3(glass[0], glass[1], u0 + w), lerp3(glass[3], glass[2], u0 + w + 0.12), lerp3(glass[3], glass[2], u0 + 0.12)];
            fill(g, F, p, `rgba(235,225,255,${al})`);
        }
        g.restore();
        // the frame: thin chrome, bright where it faces the sky, dark beneath; the city's cyan on top
        const s0 = F.sc([0, WS.yt, WS.zt]);
        const frame = [[-0.765, 0.885, Z_WS + 0.005], [-0.66, 1.205, WS.zt - 0.01], [0.66, 1.205, WS.zt - 0.01], [0.765, 0.885, Z_WS + 0.005]];
        line3(g, F, frame, '#2a2040', Math.max(1.4, 0.034 * s0));
        line3(g, F, frame, css(mix(envAt(F, 0.3, 0.5), [255, 255, 255], 0.6)), Math.max(0.8, 0.016 * s0));
        const header = [[-0.66, 1.214, WS.zt - 0.012], [0.66, 1.214, WS.zt - 0.012]];
        for (const i of outs(F)) line3(i ? L : g, F, header, css(F.cyan, i ? 0.35 * F.city : 0.9), Math.max(0.7, (i ? 0.014 : 0.008) * s0));
        // the mirror inside, on the header
        const m = [[-0.11, 1.105, 0.34], [0.11, 1.105, 0.34], [0.11, 1.165, 0.325], [-0.11, 1.165, 0.325]];
        line3(g, F, [[0, 1.19, 0.31], [0, 1.15, 0.33]], '#120c1e', Math.max(1, 0.02 * s0));
        fill(g, F, m, '#120c1e');
        if (!front) fill(g, F, [[-0.1, 1.112, 0.338], [0.1, 1.112, 0.338], [0.1, 1.158, 0.324], [-0.1, 1.158, 0.324]], css(mix(envAt(F, 0.12, -1), [30, 20, 60], 0.45)));
        for (const x of [-0.66, 0.66]) { const t = F.pr([x, 1.205, WS.zt - 0.01]); if (t[2] > 0.5) glintAt(g, L, F, t, 0.016, mix(F.cyan, [255, 255, 255], 0.5), 0.3 + 0.35 * Math.min(1, F.lamp)); }
    }

    // --- the cockpit ------------------------------------------------------------------------
    // a seat's back: its rear plane passes through (y 0.48, z −0.75) and (y 1.04, z −0.93)
    const SB_N = nrm([0, -0.18, -0.56]);
    function cockpit(g, L, F, people) {
        const C = F.C;
        const behind = dot(sub(C, [0, 0.48, -0.75]), SB_N) > 0;
        // the low interior, only through the opening
        if (C[1] > yb(0) - 0.02) {
            const zz = along(Z_CK, Z_WS, 6);
            const open = zz.map((z) => [-XC, yb(z) - 0.004, z]).concat(zz.slice().reverse().map((z) => [XC, yb(z) - 0.004, z]));
            const q = F.poly(open);
            if (q) {
                g.save(); Neon.path(g, q); g.clip();
                interior(g, L, F, behind);
                if (behind) { dash(g, L, F); console_(g, F); wheelS(g, F); }
                else console_(g, F);
                for (const st of SEATS) cushion(g, F, st);
                g.restore();
            }
        }
        if (!behind) for (const st of SEATS) seatBack(g, L, F, st);
        if (people) people(g, L);
        F.lit = true;
        if (behind) for (const st of SEATS.slice().sort((a, b) => F.depth([b.x, 1, b.z]) - F.depth([a.x, 1, a.z]))) seatBack(g, L, F, st);
        else { wheelS(g, F); if (C[1] > 0.9) dash(g, L, F); }
    }
    function interior(g, L, F, behind) {
        const C = F.C;
        // floor: a dark wine carpet
        fill(g, F, [[-XC, FLOOR, Z_CK], [XC, FLOOR, Z_CK], [XC, FLOOR, Z_WS], [-XC, FLOOR, Z_WS]], '#1a0816');
        // the bulkhead behind the seats
        if (C[2] > Z_CK) fill(g, F, [[-XC, FLOOR, Z_CK], [XC, FLOOR, Z_CK], [XC, yb(Z_CK), Z_CK], [-XC, yb(Z_CK), Z_CK]], grad(g, F, [{ p: [0, 0.4, Z_CK], n: [0, 0, 1] }, { p: [0, 0.9, Z_CK], n: [0, 0.3, 1] }], MAT.trim));
        // the doors' inner panels: red leather pad over a dark lower half, an armrest, a chrome pull
        for (const s of [-1, 1]) {
            if (s * C[0] > XC) continue;
            const n = [-s, 0, 0], zz = along(Z_CK, Z_WS, 4);
            fill(g, F, zz.map((z) => [s * XC, FLOOR, z]).concat(zz.slice().reverse().map((z) => [s * XC, yb(z), z])), '#140a1a');
            const pad = zz.map((z) => [s * XC, yb(z) - 0.02, z]).concat(zz.slice().reverse().map((z) => [s * XC, yb(z) - 0.2, z]));
            fill(g, F, pad, grad(g, F, [{ p: [s * XC, 0.82, Z_CK], n }, { p: [s * XC, 0.8, Z_WS], n }], MAT.leather));
            line3(g, F, zz.map((z) => [s * XC, yb(z) - 0.2, z]), 'rgba(220,200,255,0.4)', px(F, 0.005, [s * XC, 0.7, 0]));
            line3(g, F, along(-0.55, 0.35, 3).map((z) => [s * (XC - 0.03), 0.6, z]), '#0a0610', px(F, 0.05, [s * XC, 0.6, 0]), 'butt');
            line3(g, F, [[s * (XC - 0.005), 0.72, 0.25], [s * (XC - 0.005), 0.72, 0.4]], css(mix(envAt(F, 0.2, 0), [255, 255, 255], 0.5), 0.8), px(F, 0.012, [s * XC, 0.7, 0.3]));
        }
    }
    function dash(g, L, F) {
        // the dash top under the windshield and its face towards the seats
        const top = [[-XC, 0.875, Z_WS], [XC, 0.875, Z_WS], [XC, 0.865, 0.52], [-XC, 0.865, 0.52]];
        const face = [[-XC, 0.865, 0.52], [XC, 0.865, 0.52], [XC, 0.52, 0.46], [-XC, 0.52, 0.46]];
        fill(g, F, top, grad(g, F, [{ p: [0, 0.87, 0.75], n: [0, 1, 0] }, { p: [0, 0.865, 0.55], n: [0, 1, 0] }], MAT.trim));
        if (F.C[2] < 0.5) {
            fill(g, F, face, grad(g, F, [{ p: [0, 0.85, 0.52], n: [0, 0.2, -1] }, { p: [0, 0.55, 0.46], n: [0, 0, -1] }], MAT.trim));
            // the binnacle in front of the driver: two big dials, two small, lit cyan and green
            const glow = [];
            for (const [x, y, r, col] of [[-0.52, 0.76, 0.062, F.dashCyan], [-0.33, 0.76, 0.062, F.dashCyan], [-0.63, 0.71, 0.032, F.green], [-0.22, 0.71, 0.032, F.green]]) glow.push([[x, y, 0.505], r, col]);
            // the radio in the centre stack: a green display and a row of keys
            glow.push([[-0.02, 0.69, 0.495], 0.03, F.green, 'bar']);
            for (const [p, r, col, kind] of glow) {
                const c = F.pr(p); if (c[2] < 0.35) continue;
                const rr = Math.max(0.8, r * F.sc(p));
                g.fillStyle = css(mix(col, [10, 20, 30], 0.55));
                if (kind === 'bar') g.fillRect(c[0] - rr * 2.2, c[1] - rr * 0.35, rr * 4.4, rr * 0.7);
                else { g.beginPath(); g.arc(c[0], c[1], rr, 0, Math.PI * 2); g.fill(); g.strokeStyle = css(col, 0.95); g.lineWidth = Math.max(0.6, rr * 0.18); g.beginPath(); g.arc(c[0], c[1], rr * 0.78, Math.PI * 0.75, Math.PI * 2.25); g.stroke(); g.strokeStyle = css(F.amber); g.lineWidth = Math.max(0.5, rr * 0.1); g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(c[0] - rr * 0.6, c[1] - rr * 0.35); g.stroke(); }
                if (kind === 'bar') { g.fillStyle = css(col, 0.95); g.fillRect(c[0] - rr * 1.9, c[1] - rr * 0.18, rr * 3.8, rr * 0.36); }
            }
        }
    }
    function console_(g, F) {
        fill(g, F, [[-0.11, 0.42, -0.6], [0.11, 0.42, -0.6], [0.11, 0.48, 0.45], [-0.11, 0.48, 0.45]], grad(g, F, [{ p: [0, 0.42, -0.5], n: [0, 1, 0] }, { p: [0, 0.48, 0.4], n: [0, 1, 0] }], MAT.trim));
        line3(g, F, [[0, 0.46, 0.05], [0, 0.64, 0.0]], '#0c0814', px(F, 0.02, [0, 0.55, 0]));
        const k = F.pr([0, 0.65, 0.0]);
        if (k[2] > 0.35) { const r = Math.max(1, 0.03 * F.sc([0, 0.65, 0])); g.fillStyle = css(mix(envAt(F, 0.3, 0), [255, 255, 255], 0.5)); g.beginPath(); g.arc(k[0], k[1], r, 0, Math.PI * 2); g.fill(); }
    }
    function wheelS(g, F) {
        // the steering wheel on the left: a black leather rim, three spokes, raked towards him
        const c = [-0.42, 0.8, 0.22], u = [1, 0, 0], v = nrm([0, 0.87, 0.5]), r = 0.185;
        const ring = along(0, Math.PI * 2, 24).map((a) => [c[0] + u[0] * Math.cos(a) * r, c[1] + v[1] * Math.sin(a) * r, c[2] + v[2] * Math.sin(a) * r]);
        line3(g, F, [[c[0], c[1] - 0.05, c[2] + 0.2], c], '#0b0714', px(F, 0.05, c));
        line3(g, F, ring, '#0d0816', px(F, 0.032, c));
        line3(g, F, ring.slice(4, 10), css(mix(envAt(F, 0.3, 0), [180, 160, 220], 0.4), 0.6), px(F, 0.008, c));
        for (const a of [0, Math.PI, Math.PI * 1.5]) line3(g, F, [c, [c[0] + Math.cos(a) * r, c[1] + v[1] * Math.sin(a) * r, c[2] + v[2] * Math.sin(a) * r]], '#130c1e', px(F, 0.03, c));
    }
    function cushion(g, F, st) {
        const x = st.x, y = st.y;
        const top = [[x - 0.24, y - 0.01, -0.68], [x + 0.24, y - 0.01, -0.68], [x + 0.24, y + 0.02, -0.08], [x - 0.24, y + 0.02, -0.08]];
        fill(g, F, top, grad(g, F, [{ p: [x, y, -0.65], n: [0, 1, 0] }, { p: [x, y + 0.02, -0.1], n: [0, 1, 0.2] }], MAT.leather));
        for (const dx of [-0.17, 0.17]) line3(g, F, [[x + dx, y + 0.03, -0.66], [x + dx, y + 0.05, -0.1]], css(shade(F, [x + dx, y, -0.4], [Math.sign(dx) * -0.4, 0.9, 0], MAT.leather)), px(F, 0.07, [x, y, -0.4]));
        if (F.C[2] > -0.08) fill(g, F, [[x - 0.24, 0.28, -0.06], [x + 0.24, 0.28, -0.06], [x + 0.24, y + 0.02, -0.08], [x - 0.24, y + 0.02, -0.08]], css(shade(F, [x, 0.4, -0.07], [0, 0, 1], MAT.leather)));
    }
    // a rounded rectangle in a plane: centre c, unit axes ux (across) and uy (up), half sizes,
    // the top corners' and the bottom corners' radii (counter-clockwise from the right side)
    function rrect(c, ux, uy, hw, hh, rT, rB, n = 4) {
        const out = [];
        const corner = (cx, cy, r, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * Math.PI / 2; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
        corner(hw - rT, hh - rT, rT, 0); corner(-hw + rT, hh - rT, rT, Math.PI / 2);
        corner(-hw + rB, -hh + rB, rB, Math.PI); corner(hw - rB, -hh + rB, rB, Math.PI * 1.5);
        return out.map(([a, b]) => [c[0] + ux[0] * a + uy[0] * b, c[1] + ux[1] * a + uy[1] * b, c[2] + ux[2] * a + uy[2] * b]);
    }
    const hullOf = (F, ...outlines) => { const pts = []; for (const o of outlines) for (const p of o) { const q = F.pr(p); if (q[2] < 0.35) return null; pts.push([q[0], q[1]]); } return convex(pts); };
    // a padded leather part: a rear and a front outline (rounded rects) joined by a roll; the
    // silhouette is the hull of both, the roll lit from above, the face towards the camera on top
    function pad(g, F, rear, front, nF, top, bottom) {
        const hull = hullOf(F, rear, front); if (!hull) return null;
        const t = F.pr(top), b = F.pr(bottom);
        const gr = g.createLinearGradient(t[0], t[1], b[0], b[1]);
        gr.addColorStop(0, css(shade(F, top, [0, 1, 0], MAT.leather))); gr.addColorStop(0.5, css(shade(F, lerp3(top, bottom, 0.5), [0.0, 0.3, -0.2], MAT.leather))); gr.addColorStop(1, css(mix(shade(F, bottom, [0, -0.2, -1], MAT.leather), [10, 0, 8], 0.3)));
        g.fillStyle = gr; Neon.path(g, hull); g.fill();
        const showFront = visible(F, front[0], nF);
        const face = showFront ? front : rear, n = showFront ? nF : [-nF[0], -nF[1], -nF[2]];
        const q = F.poly(face); if (!q) return null;
        const half = Math.floor(face.length / 2);
        const ft = lerp3(face[Math.floor(half / 2)], face[Math.floor(half / 2) + 1], 0.5), fb = lerp3(face[half + Math.floor(half / 2)], face[half + Math.floor(half / 2) + 1], 0.5);
        g.fillStyle = grad(g, F, [{ p: fb, n: nrm([n[0], n[1] - 0.25, n[2]]) }, { p: lerp3(fb, ft, 0.6), n }, { p: ft, n: nrm([n[0], n[1] + 0.6, n[2]]) }], MAT.leather);
        Neon.path(g, q); g.fill();
        return { showFront, face };
    }
    function seatBack(g, L, F, st) {
        const x = st.x;
        const uy = nrm([0, 0.56, -0.18]), ux = [1, 0, 0], nF = nrm([0, 0.18, 0.56]), T = 0.105;
        const off = (c, d) => [c[0] + nF[0] * d, c[1] + nF[1] * d, c[2] + nF[2] * d];
        const cR = [x, 0.73, -0.85], cF = off(cR, T);
        const rear = rrect(cR, ux, uy, 0.255, 0.29, 0.1, 0.03), front = rrect(cF, ux, uy, 0.245, 0.285, 0.09, 0.03);
        const r = pad(g, F, rear, front, nF, off([x, 1.02, -0.94], T * 0.5), [x, 0.46, -0.76]);
        if (!r) return;
        const w = (k) => Math.max(0.5, k * F.sc(cR));
        if (r.showFront) {
            // bolsters either side, the pleated centre
            for (const sg of [-1, 1]) line3(g, F, [off([x + sg * 0.16, 0.5, -0.67], T + 0.004), off([x + sg * 0.16, 1.0, -0.83], T + 0.004)], 'rgba(16,0,8,0.55)', w(0.008));
            for (const dx of [-0.08, 0, 0.08]) line3(g, F, [off([x + dx, 0.52, -0.68], T + 0.004), off([x + dx, 0.97, -0.82], T + 0.004)], 'rgba(16,0,8,0.35)', w(0.005));
        } else {
            // the shell's welt, stitched, and a map pocket
            const welt = rrect(off(cR, -0.004), ux, uy, 0.225, 0.26, 0.075, 0.02);
            line3(g, F, welt.concat([welt[0]]), 'rgba(14,0,8,0.5)', w(0.007));
            line3(g, F, welt.slice(0, 10).map((p) => [p[0], p[1] - 0.006, p[2]]), 'rgba(255,170,190,0.18)', w(0.004));
            const pk = [[x - 0.17, 0.66, -0.875], [x + 0.17, 0.66, -0.875]];
            line3(g, F, pk, 'rgba(14,0,8,0.55)', w(0.008));
            line3(g, F, pk.map((p) => [p[0], p[1] + 0.008, p[2] - 0.002]), 'rgba(255,170,190,0.2)', w(0.004));
        }
        // the headrest: a low pad set into the top of the back, behind the neck and well under the head
        const hc = [x, 1.055, -0.955], hF = off(hc, 0.085);
        const hR = rrect(hc, ux, uy, 0.13, 0.062, 0.058, 0.04), hFr = rrect(hF, ux, uy, 0.125, 0.06, 0.055, 0.04);
        pad(g, F, hR, hFr, nF, off([x, 1.12, -0.975], 0.04), [x, 1.0, -0.94]);
        // the rims on the tops: magenta from behind (cyan from the front), warmed by the lamp
        const rimCol = mix(F.C[2] < -0.8 ? F.magenta : F.cyan, F.warm, Math.min(0.6, F.lamp * 0.5));
        for (const i of outs(F)) {
            const c = i ? L : g, a = i ? 0.14 * F.city : 0.42;
            line3(c, F, rear.slice(1, 9), css(rimCol, a), Math.max(0.6, (i ? 0.01 : 0.005) * F.sc(cR)));
            line3(c, F, hR.slice(1, 9), css(rimCol, a), Math.max(0.6, (i ? 0.01 : 0.005) * F.sc(hc)));
        }
    }

    // --- the tail: a black louvered panel, the ribbed strip of tail lights, the bumper ------
    function tail(g, L, F) {
        const s = F.sc([0, 0.7, ZT]);
        const panel = [[-xb(ZT), yb(ZT), ZT], [xb(ZT), yb(ZT), ZT], [xc(ZT), yc(ZT), ZT], [XS + 0.02, 0.45, ZT + 0.02], [-XS - 0.02, 0.45, ZT + 0.02], [-xc(ZT), yc(ZT), ZT]];
        const q = fill(g, F, panel, grad(g, F, [{ p: [0, 0.97, ZT], n: nrm([0, 0.3, -1]) }, { p: [0, 0.72, ZT], n: [0, 0, -1] }, { p: [0, 0.48, ZT], n: nrm([0, -0.2, -1]) }], MAT.black));
        if (!q) return;
        const red = F.red, pw = F.power;
        const Y0 = 0.73, Y1 = 0.868, X = 0.835, zl = ZT - 0.004;
        // the louvers: slats across the panel, each a lit top edge over a shadow; red spill near the lights
        const slats = [0.955, 0.92, 0.895, 0.69, 0.655, 0.62, 0.585, 0.55, 0.515, 0.48];
        for (const y of slats) {
            const near = Math.max(0, 1 - Math.min(Math.abs(y - Y0), Math.abs(y - Y1)) / 0.12);
            const col = mix(mix(envAt(F, 0.25, -1), [190, 170, 230], 0.3), red, near * 0.6);
            const xs = y < 0.67 ? [[-X + 0.02, -0.19], [0.19, X - 0.02]] : [[-X + 0.01, X - 0.01]];
            for (const [a, b] of xs) {
                line3(g, F, [[a, y - 0.008, zl], [b, y - 0.008, zl]], 'rgba(2,0,6,0.85)', Math.max(0.6, 0.012 * s), 'butt');
                line3(g, F, [[a, y, zl], [b, y, zl]], css(col, 0.55 + near * 0.3), Math.max(0.5, 0.005 * s), 'butt');
            }
        }
        // the strip: red glass in segments, a dark gap between them, ribbed across
        const cells = [];
        const seg = (x0, x1, kind) => cells.push([x0, x1, kind]);
        for (const sg of [-1, 1]) {
            const xs = [0.835, 0.75, 0.64, 0.53, 0.42, 0.31, 0.215].map((x) => x * sg);
            for (let i = 0; i < xs.length - 1; i++) seg(Math.min(xs[i], xs[i + 1]), Math.max(xs[i], xs[i + 1]), i === 0 ? 'amber' : i === xs.length - 2 ? 'reverse' : 'red');
        }
        for (let i = 0; i < 4; i++) seg(-0.2 + i * 0.1, -0.2 + (i + 1) * 0.1, 'centre');
        fill(g, F, [[-X - 0.01, Y0 - 0.012, zl + 0.001], [X + 0.01, Y0 - 0.012, zl + 0.001], [X + 0.01, Y1 + 0.012, zl + 0.001], [-X - 0.01, Y1 + 0.012, zl + 0.001]], '#120208');
        const gap = 0.006;
        for (const [x0, x1, kind] of cells) {
            const cq = F.poly([[x0 + gap, Y0, zl], [x1 - gap, Y0, zl], [x1 - gap, Y1, zl], [x0 + gap, Y1, zl]]); if (!cq) continue;
            const lvl = kind === 'red' ? 1 : kind === 'centre' ? 0.55 : 0.22;
            const base = kind === 'amber' ? F.amber : kind === 'reverse' ? [235, 225, 245] : red;
            const top = F.pr([(x0 + x1) / 2, Y1, zl]), bot = F.pr([(x0 + x1) / 2, Y0, zl]);
            const gr = g.createLinearGradient(top[0], top[1], bot[0], bot[1]);
            if (kind === 'reverse') { gr.addColorStop(0, 'rgb(112,92,138)'); gr.addColorStop(0.5, 'rgb(70,54,96)'); gr.addColorStop(1, 'rgb(48,36,70)'); }
            else if (kind === 'amber') { gr.addColorStop(0, css(mix(base, [40, 10, 0], 0.45))); gr.addColorStop(0.5, css(mix(base, [40, 10, 0], 0.62))); gr.addColorStop(1, css(mix(base, [24, 6, 0], 0.78))); }
            else {
                const hot = mix(base, [255, 120, 140], 0.25 * lvl);
                gr.addColorStop(0, css(mix(base, [40, 0, 10], 0.55 - 0.2 * lvl)));
                gr.addColorStop(0.45, css(mix(hot, [40, 0, 10], 1 - lvl)));
                gr.addColorStop(0.58, css(mix(hot, [40, 0, 10], 1 - lvl)));
                gr.addColorStop(1, css(mix(base, [30, 0, 8], 0.7 - 0.25 * lvl)));
            }
            g.fillStyle = gr; Neon.path(g, cq); g.fill();
            if (kind !== 'reverse') { L.fillStyle = css(base, (kind === 'amber' ? 0.05 : 0.55 * lvl) * pw); Neon.path(L, cq); L.fill(); }
        }
        // the ribs across the strip, and the glass's sheen on its top edge
        for (const y of [Y0 + (Y1 - Y0) / 3, Y0 + (2 * (Y1 - Y0)) / 3]) line3(g, F, [[-X, y, zl - 0.001], [X, y, zl - 0.001]], 'rgba(60,0,16,0.5)', Math.max(0.5, 0.006 * s), 'butt');
        line3(g, F, [[-X, Y1 - 0.008, zl - 0.002], [X, Y1 - 0.008, zl - 0.002]], 'rgba(255,190,210,0.4)', Math.max(0.5, 0.004 * s), 'butt');
        // the plate in its recess, lit from above by a small lamp
        fill(g, F, [[-0.19, 0.505, zl + 0.01], [0.19, 0.505, zl + 0.01], [0.19, 0.695, zl + 0.01], [-0.19, 0.695, zl + 0.01]], '#05030a');
        const pl = [[-0.152, 0.522, zl - 0.002], [0.152, 0.522, zl - 0.002], [0.152, 0.674, zl - 0.002], [-0.152, 0.674, zl - 0.002]];
        const pq = F.poly(pl);
        if (pq) {
            const pt = F.pr([0, 0.674, zl]), pb = F.pr([0, 0.522, zl]);
            const pg = g.createLinearGradient(pt[0], pt[1], pb[0], pb[1]);
            pg.addColorStop(0, '#f4e6dc'); pg.addColorStop(1, '#a596ba');
            g.fillStyle = pg; Neon.path(g, pq); g.fill();
            g.strokeStyle = '#3a2a58'; g.lineWidth = Math.max(0.5, 0.006 * s); g.stroke();
            if (0.304 * s > 34) {
                // the lettering laid on the plate's plane (in millimetres), so it turns with it
                const o = F.pr([0, 0.6, zl - 0.003]), ax = F.pr([0.1, 0.6, zl - 0.003]), ay = F.pr([0, 0.7, zl - 0.003]);
                g.save(); g.transform((ax[0] - o[0]) / 100, (ax[1] - o[1]) / 100, -(ay[0] - o[0]) / 100, -(ay[1] - o[1]) / 100, o[0], o[1]);
                g.textAlign = 'center'; g.textBaseline = 'middle';
                g.fillStyle = '#c8326e'; g.font = '22px sans-serif'; g.fillText('SUNSHINE STATE', 0, -48);
                g.fillStyle = '#1d2a6e'; g.font = 'bold 62px sans-serif'; g.fillText('RUN 85', 0, 8);
                g.fillStyle = '#e07a2a'; g.beginPath(); g.arc(0, 52, 9, 0, Math.PI * 2); g.fill();
                g.restore();
            }
            const lamp = F.pr([0, 0.69, zl]);
            if (lamp[2] > 0.35) { L.fillStyle = 'rgba(255,240,220,0.18)'; L.beginPath(); L.ellipse(lamp[0], lamp[1], 0.12 * s, 0.025 * s, 0, 0, Math.PI * 2); L.fill(); }
        }
        // the bumper: black urethane, its top catching the sky, magenta on its edge
        const zb = ZT - 0.065;
        const bf = [[-0.905, 0.22, zb], [0.905, 0.22, zb], [0.905, 0.45, zb + 0.01], [-0.905, 0.45, zb + 0.01]];
        fill(g, F, bf, grad(g, F, [{ p: [0, 0.44, zb], n: nrm([0, 0.3, -1]) }, { p: [0, 0.24, zb], n: nrm([0, -0.3, -1]) }], MAT.black));
        if (F.C[1] > 0.46) fill(g, F, [[-0.905, 0.452, zb + 0.01], [0.905, 0.452, zb + 0.01], [0.9, 0.452, ZT + 0.03], [-0.9, 0.452, ZT + 0.03]], css(shade(F, [0, 0.45, zb], [0, 1, 0], MAT.black)));
        for (const i of outs(F)) line3(i ? L : g, F, [[-0.895, 0.452, zb + 0.005], [0.895, 0.452, zb + 0.005]], css(mix(F.magenta, [200, 170, 240], i ? 0 : 0.5), i ? 0.18 : 0.55), Math.max(0.6, 0.007 * s));
        fill(g, F, [[-0.9, 0.318, zb - 0.002], [0.9, 0.318, zb - 0.002], [0.9, 0.362, zb - 0.0015], [-0.9, 0.362, zb - 0.0015]], 'rgba(4,2,10,0.75)');
        line3(g, F, [[-0.89, 0.364, zb - 0.003], [0.89, 0.364, zb - 0.003]], css(mix(envAt(F, 0.2, -1), [220, 200, 255], 0.4), 0.5), Math.max(0.5, 0.004 * s));
        line3(g, F, [[-0.89, 0.24, zb - 0.002], [0.89, 0.24, zb - 0.002]], css(mix(F.red, [60, 0, 30], 0.5), 0.35), Math.max(0.5, 0.004 * s));
        // a lower lip and the two exhaust tips under it
        fill(g, F, [[-0.7, 0.15, ZT - 0.02], [0.7, 0.15, ZT - 0.02], [0.75, 0.22, zb], [-0.75, 0.22, zb]], '#07040e');
        for (const x of [-0.36, 0.36]) {
            const c = F.pr([x, 0.185, zb + 0.005]); if (c[2] < 0.35) continue;
            const r = 0.038 * F.sc([x, 0.185, zb]);
            g.fillStyle = '#05030a'; g.beginPath(); g.ellipse(c[0], c[1] - r * 0.3, r * 1.25, r * 0.95, 0, 0, Math.PI * 2); g.fill();
            g.strokeStyle = css(mix(envAt(F, 0.15, -1), [255, 230, 255], 0.25), 0.8); g.lineWidth = Math.max(0.5, r * 0.22);
            g.beginPath(); g.ellipse(c[0], c[1], r, r * 0.62, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
            g.strokeStyle = css(mix(F.red, [80, 0, 30], 0.4), 0.5); g.beginPath(); g.ellipse(c[0], c[1], r, r * 0.62, 0, Math.PI * 0.1, Math.PI * 0.9); g.stroke();
        }
    }
    // the bumpers' black wraps along the sides, ahead of and behind the wheels
    function bumperSides(g, L, F) {
        for (const s of [-1, 1]) {
            if (s * F.C[0] < 0.9) continue;
            for (const [z0, z1] of [[ZT - 0.065, WHEELS[1].z - ARCH - 0.02], [WHEELS[0].z + ARCH + 0.02, ZN + 0.05]]) {
                const o = [[s * 0.905, 0.22, z0], [s * 0.905, 0.22, z1], [s * 0.905, 0.45 + (z1 > 0 ? 0.01 : 0), z1], [s * 0.905, 0.45 + (z1 > 0 ? 0.01 : 0), z0]];
                fill(g, F, o, grad(g, F, [{ p: [s * 0.9, 0.44, z0], n: [s, 0.3, 0] }, { p: [s * 0.9, 0.25, z0], n: [s, -0.3, 0] }], MAT.black));
                line3(g, F, [[s * 0.906, 0.448, z0], [s * 0.906, 0.448, z1]], 'rgba(170,140,220,0.45)', px(F, 0.006, [s * 0.9, 0.45, (z0 + z1) / 2]));
            }
        }
    }

    // --- the nose: the wedge's edge, the black bumper with its slot and parking lights ------
    function nose(g, L, F) {
        const s = F.sc([0, 0.45, ZN]);
        const face = [[-xb(ZN), yb(ZN), ZN], [xb(ZN), yb(ZN), ZN], [xc(ZN), yc(ZN), ZN], [0.8, 0.47, ZN - 0.01], [-0.8, 0.47, ZN - 0.01], [-xc(ZN), yc(ZN), ZN]];
        fill(g, F, face, grad(g, F, [{ p: [0, 0.57, ZN], n: nrm([0, 0.5, 1]) }, { p: [0, 0.48, ZN], n: nrm([0, -0.1, 1]) }], MAT.paint));
        const zb = ZN + 0.05;
        fill(g, F, [[-0.84, 0.21, zb - 0.02], [0.84, 0.21, zb - 0.02], [0.84, 0.47, zb], [-0.84, 0.47, zb]], grad(g, F, [{ p: [0, 0.46, zb], n: nrm([0, 0.3, 1]) }, { p: [0, 0.23, zb], n: nrm([0, -0.3, 1]) }], MAT.black));
        if (F.C[1] > 0.47) fill(g, F, [[-0.84, 0.472, zb], [0.84, 0.472, zb], [0.8, 0.472, ZN - 0.01], [-0.8, 0.472, ZN - 0.01]], css(shade(F, [0, 0.47, zb], [0, 1, 0], MAT.black)));
        fill(g, F, [[-0.48, 0.29, zb + 0.001], [0.48, 0.29, zb + 0.001], [0.48, 0.355, zb + 0.001], [-0.48, 0.355, zb + 0.001]], '#040208');
        line3(g, F, [[-0.46, 0.322, zb + 0.002], [0.46, 0.322, zb + 0.002]], 'rgba(120,100,170,0.5)', Math.max(0.5, 0.006 * s));
        for (const i of outs(F)) {
            const c = i ? L : g;
            for (const sg of [-1, 1]) fill(c, F, [[sg * 0.56, 0.39, zb + 0.002], [sg * 0.77, 0.39, zb + 0.002], [sg * 0.77, 0.44, zb + 0.002], [sg * 0.56, 0.44, zb + 0.002]], css(i ? F.amber : mix(F.amber, [255, 230, 190], 0.35), i ? 0.45 * F.power : 1));
            // the wedge's leading edge, lit by the city
            line3(c, F, [[-xb(ZN), yb(ZN) + 0.003, ZN + 0.002], [xb(ZN), yb(ZN) + 0.003, ZN + 0.002]], css(F.cyan, i ? 0.32 * F.city : 0.9), px(F, i ? 0.014 : 0.008, [0, 0.58, ZN], 0.7));
        }
    }

    // --- only what emits, for the trip's tracers --------------------------------------------
    function lights(L, N, cam, pose, light = {}) {
        const F = frame(cam, pose, light), C = F.C;
        if (cam.view(F.Wp([0, 0.6, 0]))[2] < 0.5) return;
        L.save();
        const box = (x0, x1, y0, y1, z, col, a) => { const q = F.poly([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]]); if (q) { L.fillStyle = css(col, a); Neon.path(L, q); L.fill(); } };
        if (C[2] < ZT) {
            for (const sg of [-1, 1]) box(Math.min(sg * 0.31, sg * 0.75), Math.max(sg * 0.31, sg * 0.75), 0.735, 0.863, ZT - 0.004, F.red, 0.75 * F.power);
            box(-0.2, 0.2, 0.735, 0.863, ZT - 0.004, F.red, 0.4 * F.power);
        }
        if (C[2] > 1.8) for (const sg of [-1, 1]) {
            box(Math.min(sg * 0.43, sg * 0.75), Math.max(sg * 0.43, sg * 0.75), 0.72, 0.815, 1.795, F.head, 0.8 * F.power);
            box(Math.min(sg * 0.56, sg * 0.77), Math.max(sg * 0.56, sg * 0.77), 0.39, 0.44, ZN + 0.052, F.amber, 0.5);
        }
        for (const s of [-1, 1]) if (s * C[0] > 0.9) {
            for (const [z0, z1, f, u0, u1, col] of [[1.86, 2.0, onLo, 0.06, 0.2, F.amber], [-2.02, -1.88, onUp, 0.72, 0.86, F.red]]) {
                const q = F.poly(bandOutline(s, f, z0, z1, u0, u1, 2)); if (q) { L.fillStyle = css(col, 0.6); Neon.path(L, q); L.fill(); }
            }
        }
        if (C[1] > 1.0 && C[2] < 0.5) for (const [x, col] of [[-0.52, F.dashCyan], [-0.33, F.dashCyan], [-0.02, F.green]]) {
            const p = F.pr([x, 0.74, 0.5]); if (p[2] < 0.35) continue;
            const r = Math.max(0.8, 0.04 * F.sc([x, 0.74, 0.5]));
            L.fillStyle = css(col, 0.35); L.beginPath(); L.arc(p[0], p[1], r, 0, Math.PI * 2); L.fill();
        }
        L.restore();
    }

    // world point of a local point, for a car at pose (x, y, z, pitch)
    function W(pose, [x, y, z]) {
        const c = Math.cos(pose.pitch ?? 0), s = Math.sin(pose.pitch ?? 0);
        return [pose.x + x, pose.y + y * c + z * s, pose.z + z * c - y * s];
    }

    return { draw, lights, W, SEATS, DIM: { length: 4.3, width: 1.8, door: 0.94 } };
})();
