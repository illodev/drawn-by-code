// The causeway across Biscayne Bay at night, in metres, projected through Neon.camera.
// x right, y up (0 = the deck where the climb starts), z forward (towards the city).
// Our carriageway x 0 … 7.4 (two lanes), a planted median x −4.4 … −0.4 with the lamps and
// royal palms, the other carriageway x −11.8 … −4.4, parapets at both edges with a neon tube
// along their tops (pink on our side, cyan on the far side). The deck stands on pairs of
// piers every 24 m over the water (y = WATER). The asphalt is wet: lamps, tubes and tail
// lights lie on it as long streaks. The car drives at V m/s in the left lane of our side; a
// lamp stands on the median every V × beat metres, so the car passes under one on every beat.
// The deck climbs over a hump whose top the car reaches in the bar where the bass leaves.
// Global: Causeway.
const Causeway = (() => {
    const V = 25;                                  // m/s (90 km/h)
    const T0 = 58.902;                             // song second at which the car is at z = 0
    const LANE = 1.85;                             // the car's x (left lane of our side)
    const HUMP = { z: 125, half: 150, h: 8 };      // crest at z = 125 m, 8 m above the start
    const WATER = -4.5;                            // the bay's surface
    const MEDIAN = [-4.4, -0.4], LAMP_X = -2.4, LAMP_H = 10, ARM = 4.1;
    const EDGE_R = 7.4, EDGE_L = -11.8;
    const carZ = (T) => V * (T - T0);
    function y(z) {
        const u = (z - HUMP.z) / HUMP.half;
        return Math.abs(u) >= 1 ? 0 : HUMP.h * Math.cos(u * Math.PI / 2) ** 2;
    }
    const slope = (z) => (y(z + 0.5) - y(z - 0.5));
    // lamp k stands where the couple is on beat k of the song
    const lampZ = (k) => carZ(Song.bar0 + k * Song.beat) - 0.5;
    const lampIndex = (z) => ((z + 0.5) / V + T0 - Song.bar0) / Song.beat;

    // how much the lamps light a point at z (pools of light along the road)
    function lampLight(z) {
        let s = 0;
        const k0 = Math.floor(lampIndex(z));
        for (let k = k0 - 1; k <= k0 + 2; k++) { const d = z - lampZ(k); s += Math.exp(-(d * d) / 22); }
        return Math.min(1.2, s);
    }

    // traffic: closed-form positions (no state)
    const AHEAD = [[62, 5.55, 22], [140, 1.85, 23.5], [210, 5.55, 21], [330, 1.85, 24], [420, 5.55, 20.5], [560, 5.55, 22.5]];
    const ONCOMING = [[90, -6.2, 24], [260, -9.8, 22], [380, -6.2, 26], [520, -9.8, 23], [700, -6.2, 25], [860, -9.8, 24]];
    function traffic(T) {
        const t = T - T0, out = [];
        for (const [z0, x, v] of AHEAD) out.push({ x, z: z0 + v * t, dir: 1 });
        for (const [z0, x, v] of ONCOMING) out.push({ x, z: z0 - v * t, dir: -1 });
        return out;
    }

    const P = Neon.PAL;
    const fogC = Neon.hex('#2a1250');
    const fogged = (col, z, zc) => Neon.mix(col, fogC, Math.min(0.85, Math.max(0, (z - zc) / 900)));
    const lampCol = (fx) => fx.lampCol ?? Neon.hex(P.sodium);
    const tubeCol = (c, fx) => (fx.hue ? Neon.shift(c, fx.hue, 1.1) : Neon.hex(c));

    // --- drawing --------------------------------------------------------------------------
    function draw(g, L, N, cam, T, fx) {
        const zc = cam.pos[2], zFar = zc + 800, zNear = zc + 0.4;
        const items = [];
        // slice boundaries, far to near: 3 m near the camera, longer with distance
        const cuts = []; for (let z = Math.floor(zNear / 3) * 3; z < zFar; z += Math.min(24, Math.max(3, Math.round((z - zc) * 0.03) * 3))) cuts.push(z);
        cuts.push(zFar);
        const slices = []; for (let i = cuts.length - 2; i >= 0; i--) slices.push([Math.max(cuts[i], zNear), cuts[i + 1]]);
        const kFar = Math.ceil(lampIndex(zFar)), kNear = Math.floor(lampIndex(zNear));
        const camAbove = (z) => cam.pos[1] > y(z) + 0.2;

        // 2 · the deck, in slices from far to near: asphalt pooled by the lamps, the edge slab,
        // lane marks, the median's planted strip
        for (const [za, zb] of slices) {
            const ya = y(za), yb = y(zb);
            const lit = zb - za > 4 ? 0.15 : lampLight(za + 1.5);
            const asphalt = Neon.mix('#161026', '#4a2846', Math.min(1, lit * 0.75));
            for (const [x0, x1] of [[EDGE_L, MEDIAN[0]], [MEDIAN[1], EDGE_R]]) {
                const q = Neon.poly(cam, [[x0, ya, za], [x1, ya, za], [x1, yb, zb], [x0, yb, zb]]);
                if (q) { g.fillStyle = Neon.css(fogged(asphalt, za, zc)); Neon.path(g, q); g.fill(); }
            }
            // the median: low curbs and a dark planted strip
            const m = Neon.poly(cam, [[MEDIAN[0], ya + 0.18, za], [MEDIAN[1], ya + 0.18, za], [MEDIAN[1], yb + 0.18, zb], [MEDIAN[0], yb + 0.18, zb]]);
            if (m) { g.fillStyle = Neon.css(fogged(Neon.mix('#14202a', '#3a3a3a', lit * 0.4), za, zc)); Neon.path(g, m); g.fill(); }
            for (const xx of MEDIAN) {
                const c = Neon.poly(cam, [[xx, ya, za], [xx, ya + 0.18, za], [xx, yb + 0.18, zb], [xx, yb, zb]]);
                if (c) { g.fillStyle = Neon.css(fogged(Neon.mix('#5a4a6a', '#d0a090', lit * 0.5), za, zc)); Neon.path(g, c); g.fill(); }
            }
            // the deck's edge slab, seen from the side (only from outside the deck)
            for (const xe of [EDGE_R + 0.5, EDGE_L - 0.5]) {
                if ((xe > 0) !== (cam.pos[0] > xe)) continue;
                const e = Neon.poly(cam, [[xe, ya, za], [xe, yb, zb], [xe, yb - 1.3, zb], [xe, ya - 1.3, za]]);
                if (e) { g.fillStyle = Neon.css(fogged(Neon.mix('#2a1c44', '#6a3a5a', lit * 0.4), za, zc)); Neon.path(g, e); g.fill(); }
            }
            const mark = (x, w, col, a) => { const q = Neon.poly(cam, [[x - w, ya + 0.01, za], [x + w, ya + 0.01, za], [x + w, yb + 0.01, zb], [x - w, yb + 0.01, zb]]); if (q) { g.fillStyle = Neon.css(fogged(Neon.mix(col, '#ffd9b0', lit * 0.5), za, zc), a); Neon.path(g, q); g.fill(); } };
            mark(-0.15, 0.07, '#f0c25a', 0.75); mark(EDGE_R - 0.3, 0.07, '#d8cfe8', 0.6);
            mark(-4.65, 0.07, '#f0c25a', 0.6); mark(EDGE_L + 0.3, 0.07, '#d8cfe8', 0.5);
        }
        for (let zd = Math.floor(Math.min(zFar, zc + 300) / 12) * 12; zd >= zNear - 3; zd -= 12) {
            const za = Math.max(zd, zNear), zb = zd + 3; if (zb <= za) continue;
            const ya = y(za), yb = y(zb), lit = lampLight(za + 1.5);
            for (const [x, a] of [[3.7, 0.85], [-8.1, 0.6]]) {
                const q = Neon.poly(cam, [[x - 0.08, ya + 0.01, za], [x + 0.08, ya + 0.01, za], [x + 0.08, yb + 0.01, zb], [x - 0.08, yb + 0.01, zb]]);
                if (q) { g.fillStyle = Neon.css(fogged(Neon.mix('#d8cfe8', '#ffd9b0', lit * 0.5), za, zc), a); Neon.path(g, q); g.fill(); }
            }
        }
        // 3 · the wet asphalt: every lamp head, tube and tail light lies on it as a streak
        roadStreaks(g, L, N, cam, T, fx, zc, zFar, zNear, kFar, kNear);

        if (fx.onDeck) fx.onDeck();                      // whatever lies on the asphalt (the trip's grid)
        // 4 · parapets with their neon tubes, far to near
        for (const [za, zb] of slices) {
            const ya = y(za), yb = y(zb);
            const lit = zb - za > 4 ? 0.15 : lampLight(za + 1.5);
            for (const [x0, x1, col, neon] of [[EDGE_R, EDGE_R + 0.5, '#4a3866', P.pink], [EDGE_L - 0.5, EDGE_L, '#3e3060', P.cyan]]) {
                const inner = x0 > 0 ? x0 : x1, outer = x0 > 0 ? x1 : x0, h = 1.05;
                const top = Neon.poly(cam, [[x0, ya + h, za], [x1, ya + h, za], [x1, yb + h, zb], [x0, yb + h, zb]]);
                const face = Neon.poly(cam, [[inner, ya, za], [inner, ya + h, za], [inner, yb + h, zb], [inner, yb, zb]]);
                const out = Neon.poly(cam, [[outer, ya - 1.3, za], [outer, ya + h, za], [outer, yb + h, zb], [outer, yb - 1.3, zb]]);
                const c = Neon.mix(col, '#d08080', Math.min(1, lit * 0.55));
                const seeInner = (cam.pos[0] < inner) === (x0 > 0);
                if (seeInner && face) { const gr = g.createLinearGradient(0, face[1][1], 0, face[0][1]); gr.addColorStop(0, Neon.css(fogged(c, za, zc))); gr.addColorStop(1, Neon.css(fogged(Neon.mix(c, '#0d0820', 0.55), za, zc))); g.fillStyle = gr; Neon.path(g, face); g.fill(); }
                if (!seeInner && out) { g.fillStyle = Neon.css(fogged(Neon.mix(c, '#100a24', 0.45), za, zc)); Neon.path(g, out); g.fill(); }
                if (top) { g.fillStyle = Neon.css(fogged(Neon.mix(c, '#ffffff', 0.08), za, zc)); Neon.path(g, top); g.fill(); }
                // the tube along the top
                const A = cam.p([(x0 + x1) / 2, ya + h + 0.08, za]), B = cam.p([(x0 + x1) / 2, yb + h + 0.08, zb]);
                if (A[2] > 0.3 && B[2] > 0.3) {
                    const w = Math.max(1.1, 0.07 * cam.f / A[2]);
                    N.tube(g, L, (c2) => { c2.beginPath(); c2.moveTo(A[0], A[1]); c2.lineTo(B[0], B[1]); }, fogged(tubeCol(neon, fx), za, zc), w, { white: 0.55, on: 1 - Math.min(0.6, (za - zc) / 1400) });
                }
            }
        }

        // the median's planting: low clipped shrubs in two rows, their tops lit by the lamps
        for (let zs = Math.floor(Math.min(zFar, zc + 260) / 2.2) * 2.2; zs >= zNear + 0.5; zs -= 2.2) {
            const R = Motion.rng('shrub' + Math.round(zs / 2.2));
            for (const xs of [MEDIAN[0] + 0.9, MEDIAN[1] - 0.9]) {
                const hgt = 0.55 + R() * 0.35, wid = 0.9 + R() * 0.5, zz = zs + R() * 0.8;
                const b = cam.p([xs + (R() - 0.5) * 0.4, y(zz) + 0.18, zz]); if (b[2] < 0.8) continue;
                const s = cam.f / b[2], lit = lampLight(zz);
                const dark = fogged(Neon.mix('#0f2a24', '#1c1530', 0.4), zz, zc), top = fogged(Neon.mix('#2a5a40', '#ff9a7a', lit * 0.5), zz, zc);
                g.fillStyle = Neon.css(dark);
                g.beginPath();
                for (let j = 0; j <= 10; j++) { const a = Math.PI + (j / 10) * Math.PI; const r = 1 + 0.12 * Math.sin(j * 2.7 + zz); g.lineTo(b[0] + Math.cos(a) * wid * 0.5 * s * r, b[1] + Math.sin(a) * hgt * s * r); }
                g.closePath(); g.fill();
                if (s > 6) {
                    // leaf clusters catching the lamp on the top of the shrub
                    g.fillStyle = Neon.css(top, 0.3 + lit * 0.45);
                    for (let j = 0; j < 7; j++) { const a = Math.PI * (1.2 + 0.6 * R()), r = 0.75 + 0.2 * R(); const px = b[0] + Math.cos(a) * wid * 0.5 * s * r, py = b[1] + Math.sin(a) * hgt * s * r; g.beginPath(); g.ellipse(px, py, 0.07 * s, 0.04 * s, a, 0, Math.PI * 2); g.fill(); }
                }
            }
        }
        // 5 · lamps, palms and traffic: the scene sorts them with our car
        for (let k = kFar; k >= kNear - 1; k--) {
            const zl = lampZ(k); if (zl < zc + 0.6 || zl > zFar) continue;
            items.push({ z: zl, draw: () => lamp(g, L, N, cam, zl, zc, fx) });
            const zp = zl + Song.beat * V / 2;
            if (zp < zFar && zp > zc + 1) items.push({ z: zp, draw: () => palm(g, L, N, cam, LAMP_X + (k % 2 ? 0.5 : -0.5), zp, zc, k, T, fx) });
        }
        for (const c of traffic(T)) if (c.z > zc + 2 && c.z < zFar) items.push({ z: c.z, draw: () => otherCar(g, L, N, cam, c, zc, fx) });
        return items;
    }

    // the part of the causeway that lies on the water (piers, reflections): drawn with the far
    // world, before its glow, so the deck covers it
    function water(g, L, N, cam, T, fx) {
        const zc = cam.pos[2], zFar = zc + 800, zNear = zc + 0.4;
        const kFar = Math.ceil(lampIndex(zFar)), kNear = Math.floor(lampIndex(zNear));
        // 1 · on the water, under the deck: the piers and every reflection of the causeway
        for (let z = Math.floor(zFar / 24) * 24; z >= Math.floor(zNear / 24) * 24 - 24; z -= 24) {
            if (z < zNear - 30) continue;
            for (const x of [EDGE_L + 1.2, -2.4, EDGE_R - 1.2]) {
                const yd = y(z) - 1.3;
                const q = Neon.poly(cam, [[x - 0.8, WATER, z], [x + 0.8, WATER, z], [x + 0.8, yd, z], [x - 0.8, yd, z]]);
                if (q) { const gr = g.createLinearGradient(0, q[2][1], 0, q[0][1]); gr.addColorStop(0, Neon.css(fogged('#3a2654', z, zc))); gr.addColorStop(1, Neon.css(fogged('#120a26', z, zc))); g.fillStyle = gr; Neon.path(g, q); g.fill(); }
            }
        }
        waterStreaks(g, L, N, cam, T, fx, zc, zFar, zNear, kFar, kNear);

    }

    // the lamp heads of lamp k, in world coordinates
    const heads = (zl) => { const yl = y(zl) + LAMP_H; return [[LAMP_X + ARM, yl, zl], [LAMP_X - ARM, yl, zl]]; };

    // reflections on the water (seen from beside the causeway): lamp heads and tubes, mirrored
    // in the bay's surface and broken into ripples
    function waterStreaks(g, L, N, cam, T, fx, zc, zFar, zNear, kFar, kNear) {
        if (cam.pos[1] < WATER) return;
        const R = (i) => Math.sin(i * 12.9898) * 43758.5453 % 1;
        for (let k = kFar; k >= kNear - 1; k--) {
            const zl = lampZ(k); if (zl < zNear || zl > zc + 420) continue;
            for (const h of heads(zl)) {
                const top = cam.p([h[0], WATER, h[2]]), mir = cam.p([h[0], 2 * WATER - h[1], h[2]]);
                if (top[2] < 2 || top[0] < -80 || top[0] > cam.W + 80 || top[1] > cam.H) continue;
                const len = mir[1] - top[1]; if (len < 2) continue;
                const s = cam.f / top[2], col = fogged(lampCol(fx), zl, zc);
                // a soft column of the lamp's colour under it, then glints on the swell: thin
                // horizontal strokes, wider and sparser towards the viewer, swaying with the water
                const L0 = top[1], L1 = top[1] + len * 1.5;
                const gr = g.createLinearGradient(0, L0, 0, L1);
                gr.addColorStop(0, Neon.css(col, 0.22)); gr.addColorStop(1, Neon.css(col, 0));
                g.fillStyle = gr; g.fillRect(top[0] - 0.35 * s, L0, 0.7 * s, L1 - L0);
                const n = 22;
                for (let i = 0; i < n; i++) {
                    const u = (i + 0.5) / n, yy = L0 + (L1 - L0) * u * u * 0.9 + (L1 - L0) * 0.1 * u;
                    const ph = Math.sin(i * 12.9 + k * 3.7) * 43758.5 % 1;
                    if (Math.abs(ph) < 0.25) continue;                       // gaps between glints
                    const wob = Math.sin(i * 2.3 + T * 2.6 + k) * (0.25 + u) * 0.5 * s;
                    const w = (0.5 + u * 1.6) * s * (0.5 + Math.abs(ph)), a = 0.55 * (1 - u) ** 1.1;
                    for (const c of [g, L]) { c.fillStyle = Neon.css(col, c === L ? a * 0.45 : a); c.fillRect(top[0] - w / 2 + wob, yy, w, Math.max(0.7, 0.03 * s * (1 + u))); }
                }
            }
        }
        // the tubes: their reflection is a broken line under each parapet
        for (const [xt, neon] of [[EDGE_R + 0.25, P.pink], [EDGE_L - 0.25, P.cyan]]) {
            const col = tubeCol(neon, fx);
            for (let z = Math.floor(Math.min(zFar, zc + 500) / 6) * 6; z >= zNear; z -= 6) {
                const ht = y(z) + 1.13, a = cam.p([xt, 2 * WATER - ht, z]), b = cam.p([xt, 2 * WATER - ht, z + 6]);
                if (a[2] < 2) continue;
                const s = cam.f / a[2], wob = Math.sin(z * 0.7 + T * 2.5) * 0.3 * s;
                for (const c of [g, L]) { c.strokeStyle = Neon.css(fogged(col, z, zc), c === L ? 0.25 : 0.4); c.lineWidth = Math.max(0.8, 0.12 * s); c.beginPath(); c.moveTo(a[0] + wob, a[1]); c.lineTo(b[0] + wob, b[1]); c.stroke(); }
            }
        }
    }

    // reflections on the wet asphalt: a light at height h over the deck shows as a streak
    // from the deck under it down to its mirror image, strongest near the source
    function roadStreaks(g, L, N, cam, T, fx, zc, zFar, zNear, kFar, kNear) {
        const streak = (x, yl, z, h, col, w, a) => {
            const top = cam.p([x, yl, z]), mir = cam.p([x, yl - h, z]);
            if (top[2] < 1.2 || mir[2] < 1.2) return;
            const len = mir[1] - top[1]; if (len < 1) return;
            const s = cam.f / top[2], ww = Math.max(1, w * s);
            const fade = 1 / (1 + Math.max(0, z - cam.pos[2]) / 70);
            const gr = g.createLinearGradient(0, top[1], 0, top[1] + len);
            gr.addColorStop(0, Neon.css(col, 0)); gr.addColorStop(0.08, Neon.css(col, a * fade)); gr.addColorStop(0.4, Neon.css(col, a * 0.35 * fade)); gr.addColorStop(1, Neon.css(col, 0));
            for (const c of [g, L]) { c.globalAlpha = c === L ? 0.35 : 1; c.fillStyle = gr; c.beginPath(); c.ellipse(top[0], top[1] + len / 2, ww / 2, len / 2, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
        };
        for (let k = kFar; k >= kNear - 1; k--) {
            const zl = lampZ(k); if (zl < zNear + 1 || zl > zFar) continue;
            for (const h of heads(zl)) streak(h[0], y(zl) + 0.01, zl, LAMP_H * 1.3, fogged(lampCol(fx), zl, zc), 0.32, 0.24);
        }
        for (const c of traffic(T)) {
            if (c.z < zNear + 2 || c.z > zFar) continue;
            const col = c.dir > 0 ? Neon.hex(P.red) : Neon.hex('#f4f0ff');
            for (const dx of [-0.65, 0.65]) streak(c.x + dx, y(c.z) + 0.01, c.z, 2.2, fogged(col, c.z, zc), 0.35, 0.5);
        }
    }

    // a lamp on the median: a tapered mast, two arms, two cobra heads with lit glass
    function lamp(g, L, N, cam, z, zc, fx) {
        const yb = y(z), base = cam.p([LAMP_X, yb + 0.2, z]), top = cam.p([LAMP_X, yb + LAMP_H + 0.6, z]);
        if (top[2] < 0.5) return;
        const s = cam.f / top[2], body = Neon.css(fogged('#2b2142', z, zc));
        g.fillStyle = body;
        g.beginPath(); g.moveTo(base[0] - 0.14 * s, base[1]); g.lineTo(base[0] + 0.14 * s, base[1]); g.lineTo(top[0] + 0.07 * s, top[1]); g.lineTo(top[0] - 0.07 * s, top[1]); g.fill();
        // a lit edge on the mast from the lamp above
        g.strokeStyle = Neon.css(fogged(lampCol(fx), z, zc), 0.45); g.lineWidth = Math.max(0.6, 0.03 * s);
        g.beginPath(); g.moveTo(base[0] + 0.12 * s, base[1]); g.lineTo(top[0] + 0.06 * s, top[1]); g.stroke();
        for (const h of heads(z)) {
            const dir = Math.sign(h[0] - LAMP_X);
            const mid = cam.p([LAMP_X + dir * ARM * 0.4, yb + LAMP_H + 0.75, z]), end = cam.p([h[0] - dir * 0.3, yb + LAMP_H + 0.12, z]);
            g.strokeStyle = body; g.lineWidth = Math.max(1, 0.1 * s); g.lineCap = 'round';
            g.beginPath(); g.moveTo(top[0], top[1]); g.quadraticCurveTo(mid[0], mid[1], end[0], end[1]); g.stroke();
            // the head: a hood, then its glass
            const hp = cam.p(h); if (hp[2] < 0.5) continue;
            const hs = cam.f / hp[2];
            const hood = [[h[0] - dir * 0.35, h[1] + 0.12, z], [h[0] + dir * 0.45, h[1] + 0.05, z], [h[0] + dir * 0.4, h[1] - 0.06, z], [h[0] - dir * 0.35, h[1] - 0.04, z]].map(cam.p);
            g.fillStyle = Neon.css(fogged('#3a2e52', z, zc)); Neon.path(g, hood); g.fill();
            const col = fogged(lampCol(fx), z, zc);
            for (const c of [g, L]) { c.fillStyle = Neon.css(Neon.mix(col, [255, 255, 255], 0.45)); c.beginPath(); c.ellipse(hp[0] + dir * 0.05 * hs, hp[1] - 0.02 * hs, 0.36 * hs, 0.07 * hs, 0, 0, Math.PI * 2); c.fill(); }
            N.glint(null, L, hp[0], hp[1], Math.min(110, Math.max(2, 0.95 * hs)), col, { lightOnly: true, halo: fx.halo ?? 1, star: fx.star ?? 0, rays: fx.trip ? 6 : 4, starLen: 3.4, alpha: Math.min(1, 0.6 + 200 / (z - zc + 40)) });
        }
    }

    // a royal palm: a smooth pale trunk swelling a little, a green crownshaft, and a crown of
    // arching fronds whose leaflets hang down; lit from the lamps on the near side
    function palm(g, L, N, cam, x, z, zc, seed, T, fx) {
        const yb = y(z) + 0.18, R = Motion.rng('palm' + seed), H = 12 + R() * 3;
        const lean = (R() - 0.5) * 0.6;
        const base = cam.p([x, yb, z]), top = cam.p([x + lean, yb + H, z]);
        if (top[2] < 0.6) return;
        const s = cam.f / top[2], sb = cam.f / base[2];
        const dark = fogged('#1c1432', z, zc), trunk = fogged('#4a3e5e', z, zc), rimC = fogged(Neon.mix(lampCol(fx), '#ff7ab8', 0.4), z, zc);
        // trunk: a tapered band with a slight swell low down
        const pts = [];
        for (let i = 0; i <= 10; i++) { const u = i / 10, p = cam.p([x + lean * u * u, yb + H * 0.86 * u, z]); const w = (0.32 + 0.1 * Math.sin(u * Math.PI * 0.8) - 0.12 * u) * (cam.f / p[2]); pts.push([p[0], p[1], w]); }
        // round: dark on the side away from the lamps, lit on the other, airbrushed across
        const tg = g.createLinearGradient(pts[0][0] - pts[0][2], 0, pts[0][0] + pts[0][2], 0);
        tg.addColorStop(0, Neon.css(Neon.mix(trunk, '#0c0820', 0.55))); tg.addColorStop(0.55, Neon.css(trunk)); tg.addColorStop(0.85, Neon.css(Neon.mix(trunk, '#e8b0d0', 0.35))); tg.addColorStop(1, Neon.css(Neon.mix(trunk, '#0c0820', 0.2)));
        g.fillStyle = tg;
        g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0] - p[2], p[1]) : g.moveTo(p[0] - p[2], p[1]))); for (let i = pts.length - 1; i >= 0; i--) g.lineTo(pts[i][0] + pts[i][2], pts[i][1]); g.fill();
        // the uplight at its foot washes the trunk with pink-white light, strongest low down
        const up = fogged(Neon.mix(P.pink, '#ffffff', 0.35), z, zc);
        const ug = g.createLinearGradient(0, pts[0][1], 0, pts[7][1]);
        ug.addColorStop(0, Neon.css(up, 0.55)); ug.addColorStop(1, Neon.css(up, 0));
        g.fillStyle = ug;
        g.beginPath(); for (let i = 0; i <= 7; i++) g.lineTo(pts[i][0] + pts[i][2] * 0.15, pts[i][1]); for (let i = 7; i >= 0; i--) g.lineTo(pts[i][0] + pts[i][2] * 0.95, pts[i][1]); g.fill();
        if (base[2] > 0.8) N.glint(g, L, base[0] + 0.25 * sb, base[1] - 0.05 * sb, Math.min(40, Math.max(1.5, 0.35 * sb)), up, { alpha: 0.8, halo: 1 });
        // rings on the trunk
        g.strokeStyle = Neon.css(dark, 0.5); g.lineWidth = Math.max(0.5, 0.015 * s);
        for (let i = 1; i < 10; i++) { const p = pts[i]; g.beginPath(); g.moveTo(p[0] - p[2], p[1]); g.lineTo(p[0] + p[2], p[1] + 0.02 * s); g.stroke(); }
        // the crownshaft
        const cs0 = cam.p([x + lean, yb + H * 0.86, z]), cs1 = cam.p([x + lean, yb + H * 0.98, z]);
        g.fillStyle = Neon.css(fogged('#1f4a4a', z, zc)); g.beginPath(); g.ellipse(cs0[0], (cs0[1] + cs1[1]) / 2, 0.26 * s, (cs0[1] - cs1[1]) / 2, 0, 0, Math.PI * 2); g.fill();
        // fronds
        const sway = Math.sin(T * 1.6 + seed) * 0.05;
        const n = 14;
        for (let i = 0; i < n; i++) {
            const an = (i / n) * Math.PI * 2 + R() * 0.25;
            const dx = Math.cos(an), dz = Math.sin(an), len = 3.6 + R() * 1.2, arch = 0.9 + R() * 0.6;
            const P0 = [x + lean, yb + H, z];
            const pt = (u) => [P0[0] + dx * len * u, P0[1] + arch * Math.sin(u * Math.PI * 0.8) - u * u * (1.6 + sway * 10 * dx), P0[2] + dz * len * u * 0.9];
            const rib = []; for (let j = 0; j <= 12; j++) rib.push(cam.p(pt(j / 12)));
            if (rib.some((p) => p[2] < 0.5)) continue;
            // leaflets: hanging strokes on both sides of the rib
            g.strokeStyle = Neon.css(dark); g.lineCap = 'round';
            for (let j = 2; j <= 12; j++) {
                const u = j / 12, p = rib[j], ss = cam.f / p[2], ll = (1 - u * 0.55) * 1.0 * ss;
                g.lineWidth = Math.max(0.6, 0.08 * ss);
                g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] + dx * ll * 0.35, p[1] + ll); g.stroke();
                g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] - dx * ll * 0.15, p[1] + ll * 0.9); g.stroke();
            }
            g.lineWidth = Math.max(0.8, 0.07 * s); g.strokeStyle = Neon.css(dark);
            g.beginPath(); rib.forEach((p, j) => (j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();
            // the lamp-lit top of the rib
            g.strokeStyle = Neon.css(rimC, 0.6); g.lineWidth = Math.max(0.5, 0.03 * s);
            g.beginPath(); rib.slice(0, 7).forEach((p, j) => (j ? g.lineTo(p[0], p[1] - 0.03 * s) : g.moveTo(p[0], p[1] - 0.03 * s))); g.stroke();
        }
    }

    // other cars: dark bodies with a lit roofline, red tail lights or white headlights
    function otherCar(g, L, N, cam, c, zc, fx) {
        const yb = y(c.z), p = cam.p([c.x, yb + 0.7, c.z]);
        if (p[2] < 2) return;
        const s = cam.f / p[2];
        g.fillStyle = Neon.css(fogged('#120c22', c.z, zc));
        g.beginPath(); g.roundRect(p[0] - 0.9 * s, p[1] - 0.45 * s, 1.8 * s, 0.75 * s, 0.15 * s); g.fill();
        g.beginPath(); g.roundRect(p[0] - 0.65 * s, p[1] - 0.95 * s, 1.3 * s, 0.55 * s, 0.2 * s); g.fill();
        g.strokeStyle = Neon.css(fogged(P.cyan, c.z, zc), 0.35); g.lineWidth = Math.max(0.5, 0.03 * s);
        g.beginPath(); g.moveTo(p[0] - 0.6 * s, p[1] - 0.93 * s); g.lineTo(p[0] + 0.6 * s, p[1] - 0.93 * s); g.stroke();
        const col = c.dir > 0 ? P.red : '#f4f0ff';
        const a = Math.min(1, 0.45 + 160 / (c.z - zc + 30));
        for (const dx of [-0.65, 0.65]) N.glint(g, L, p[0] + dx * s, p[1] - 0.1 * s, Math.max(1.5, 0.3 * s) * (c.dir < 0 ? 1.7 : 1), fogged(col, c.z, zc), { alpha: a, halo: fx.halo ?? 1, star: (fx.star ?? 0) * 0.6 });
    }

    // only the emitters, for the trip's tracers
    function lights(L, N, cam, T, fx) {
        const zc = cam.pos[2], zFar = zc + 400;
        for (let k = Math.ceil(lampIndex(zFar)); k >= Math.floor(lampIndex(zc)) - 1; k--) {
            const zl = lampZ(k); if (zl < zc + 1 || zl > zFar) continue;
            for (const h of heads(zl)) { const p = cam.p(h); if (p[2] < 0.5) continue; N.glint(null, L, p[0], p[1], Math.max(2, 0.95 * cam.f / p[2]), lampCol(fx), { lightOnly: true, halo: fx.halo, alpha: 0.7 }); }
        }
        for (const c of traffic(T)) {
            if (c.z < zc + 2 || c.z > zFar) continue;
            const p = cam.p([c.x, y(c.z) + 0.6, c.z]), s = cam.f / p[2];
            for (const dx of [-0.65, 0.65]) N.glint(null, L, p[0] + dx * s, p[1], Math.max(1.5, 0.3 * s), c.dir > 0 ? P.red : '#f4f0ff', { lightOnly: true, alpha: 0.7 });
        }
    }

    return { V, T0, LANE, WATER, carZ, y, slope, lampZ, lampLight, traffic, water, draw, lights };
})();
