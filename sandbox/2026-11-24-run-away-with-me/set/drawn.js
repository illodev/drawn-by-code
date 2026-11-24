// The causeway, the bay and the city in the drawn manner of the user's reference (styles/
// retro-neon/ink.js): flat neon inks, a thick boiling brush line, light laid on as strokes.
// The geometry is Causeway's (metres, the same camera); only the painting differs.
// Global: Drawn.
const Drawn = (() => {
    const P = Ink.PAL;
    const hex = Neon.hex, css = Neon.css, mix = Neon.mix;
    const R0 = (s) => Motion.rng(s);

    // --- the sky: hard bands of ink from night to plum, stars, rain of light ---------------
    function sky(g, cam, T, d, fx, env, horizon) {
        const bands = [P.night, P.navy, P.deep, P.indigo, P.grape, P.plum, P.purple];
        const top = -60, h = horizon - top;
        // band edges sit closer together towards the horizon (the glow gathers there)
        const edges = bands.map((_, i) => top + h * (1 - Math.pow(1 - i / bands.length, 1.7)));
        for (let i = 0; i < bands.length; i++) {
            // every band reaches down to the horizon: the next one paints over it, so no wave can open a gap
            const y0 = edges[i], y1 = horizon + 4;
            g.fillStyle = bands[i];
            // the band's top edge wavers like a brush pass
            g.beginPath(); g.moveTo(-60, y1 + 2); g.lineTo(-60, y0);
            for (let x = -60; x <= env.W + 60; x += 40) g.lineTo(x, y0 + Ink.noise(900 + i, x / 140, 0) * 5);
            g.lineTo(env.W + 60, y1 + 2); g.closePath(); g.fill();
        }
        // a few dry strokes of the next band's ink inside each band: the sky is brushed, not filled
        for (let i = 1; i < bands.length; i++) {
            const y0 = edges[i], y1 = i + 1 < bands.length ? edges[i + 1] : horizon;
            Ink.strokes(g, -40, y0 + 2, env.W + 80, Math.max(4, (y1 - y0) * 0.8), { ang: 0, count: 10, len: 160, w: 3, cols: [bands[i - 1]], seed: 300 + i, d: 0, alpha: 0.5 });
        }
        // the hold makes the horizon band swell
        if (fx.hold > 0) { g.save(); g.globalAlpha = 0.35 * fx.hold; g.fillStyle = P.magenta; g.fillRect(-60, horizon - h * 0.12, env.W + 120, h * 0.12 + 4); g.restore(); }
        // stars: small four-point crosses, some twinkling on twos
        const R = R0('ink-stars');
        for (let i = 0; i < 90; i++) {
            const x = R() * env.W, y = top + 40 + Math.pow(R(), 1.6) * (h * 0.7), s = 1.5 + R() * 3.5, on = Ink.hsh(i, 3, d) > 0.15;
            if (!on) continue;
            g.strokeStyle = R() < 0.3 ? P.cyan : P.cream; g.lineWidth = Math.max(1, s * 0.35); g.lineCap = 'round';
            g.beginPath(); g.moveTo(x - s, y); g.lineTo(x + s, y); g.moveTo(x, y - s); g.lineTo(x, y + s); g.stroke();
        }
        // the reference's falling bars of light, high in the sky
        const R2 = R0('ink-rain');
        for (let i = 0; i < 7; i++) {
            const x = R2() * env.W, len = 30 + R2() * 60, y = top + R2() * h * 0.22 + ((T * (40 + R2() * 40)) % 60);
            g.save(); g.globalAlpha = 0.4; g.fillStyle = R2() < 0.5 ? P.violet : P.purple;
            g.beginPath(); g.roundRect(x, y, 10 + R2() * 8, len, 6); g.fill(); g.restore();
        }
        // the moon: cream, an ink ring, a salmon shadow
        const m = cam.p([2600, 1400, 7000]);
        if (m[2] > 1) {
            // a crescent: the cream disc, its dark side cut by a disc of the night it stands in,
            // an ink line round the lit edge only, two strokes of salmon on the lit side
            const r = 24, ox = 11, oy = -6;
            g.save(); g.fillStyle = P.cream; g.beginPath(); g.arc(m[0], m[1], r, 0, Math.PI * 2); g.fill();
            g.fillStyle = P.deep; g.beginPath(); g.arc(m[0] + ox, m[1] + oy, r * 0.88, 0, Math.PI * 2); g.fill(); g.restore();
            const arc = []; for (let i = 0; i <= 14; i++) { const a = Math.PI * 0.55 + (i / 14) * Math.PI * 1.15; arc.push([m[0] + Math.cos(a) * r, m[1] + Math.sin(a) * r]); }
            Ink.brush(g, arc, { w: 3, seed: 'moon', d, taper: 0.35 });
            Ink.hatch(g, [m[0] - r * 0.75, m[1] - r * 0.3], [m[0] - r * 0.55, m[1] + r * 0.55], { count: 2, len: 8, w: 2, col: P.salmon, seed: 77, d, n: [1, 0] });
        }
    }
    const circ = (x, y, r, n) => { const o = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; o.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } return o; };

    // --- the city: one drawn panorama painted once, laid through the camera ----------------
    // It is a billboard in the world (z = 2600, x −2600 … 2600, from the water up 300 m).
    const PAN = { z: 2600, x0: -2600, x1: 2600, y0: -4.5, y1: 300, pxm: 1.6 };
    let pano = null, panoCols = null;
    function buildPano() {
        const W = Math.round((PAN.x1 - PAN.x0) * PAN.pxm), H = Math.round((PAN.y1 - PAN.y0) * PAN.pxm);
        const c = document.createElement('canvas'); c.width = W; c.height = H;
        const g = c.getContext('2d'), R = R0('ink-city');
        const X = (x) => (x - PAN.x0) * PAN.pxm, Y = (y) => H - (y - PAN.y0) * PAN.pxm;
        const towers = [];
        for (let i = 0; i < 90; i++) {
            const x = (R() * 2 - 1) * 2200 + 200, centre = Math.exp(-(((x - 250) / 700) ** 2));
            towers.push({ x, w: 20 + R() * 45, h: 30 + centre * (70 + R() * 150) + R() * 25, kind: Math.floor(R() * 5), r: R() });
        }
        towers.push({ x: 300, w: 46, h: 240, kind: 9, r: 0.5 });             // the landmark
        towers.sort((a, b) => a.h - b.h);
        const bodies = [P.indigo, P.royal, P.violet, P.plum, P.grape, P.deep];
        const wins = [P.orange, P.gold, P.salmon, P.cyan, P.pink];
        for (const t of towers) {
            const x0 = X(t.x - t.w / 2), x1 = X(t.x + t.w / 2), yb = Y(0), yt = Y(t.h);
            const body = t.kind === 9 ? P.purple : bodies[Math.floor(t.r * bodies.length)];
            const pts = [[x0, yb], [x0, yt], [x1, yt], [x1, yb]];
            if (t.kind === 1 || t.kind === 9) { const s = (x1 - x0) * 0.22; pts.splice(2, 0, [x0 + s, yt - s * 0.9], [x1 - s, yt - s * 0.9]); pts[1] = [x0, yt]; }
            if (t.kind === 2) pts.splice(2, 0, [(x0 + x1) / 2, yt - (x1 - x0) * 0.6]);
            Ink.shape(g, pts, body, { w: 2.2, seed: Math.round(t.x * 7), jit: 0.6 });
            // a lit side
            g.save(); g.globalAlpha = 0.35; g.fillStyle = t.r < 0.5 ? P.magenta : P.blue; g.fillRect(x1 - (x1 - x0) * 0.25, yt + 2, (x1 - x0) * 0.22, yb - yt - 2); g.restore();
            // windows: little flat inks, by floors
            const fl = 3.6 * PAN.pxm, cols = Math.max(2, Math.round(t.w / 5)), cw = (x1 - x0) / cols;
            const wc = wins[Math.floor(t.r * 997) % wins.length];
            for (let y = yt + fl; y < yb - fl * 0.5; y += fl) for (let k = 0; k < cols; k++) {
                if (R() > 0.38) continue;
                g.fillStyle = R() < 0.8 ? wc : wins[Math.floor(R() * wins.length)];
                g.fillRect(x0 + k * cw + cw * 0.2, y, cw * 0.55, fl * 0.45);
            }
            // neon on the crowns
            if (t.kind === 1 || t.kind === 9 || t.r > 0.8) {
                g.strokeStyle = t.r < 0.4 ? P.cyan : P.pink; g.lineWidth = 2;
                g.beginPath(); g.moveTo(x0 + 2, yt + 3); g.lineTo(x1 - 2, yt + 3); g.stroke();
            }
        }
        // the waterfront: low hotels in salmon and magenta with orange windows, palms between
        for (let x = -2400; x < 2400; x += 40 + R() * 50) {
            const w = 30 + R() * 40, h = 14 + R() * 24, x0 = X(x), x1 = X(x + w), yb = Y(0), yt = Y(h);
            Ink.shape(g, [[x0, yb], [x0, yt], [x1, yt], [x1, yb]], R() < 0.5 ? P.salmon : P.magenta, { w: 2, seed: Math.round(x), jit: 0.5 });
            for (let y = yt + 4; y < yb - 3; y += 6) for (let xx = x0 + 3; xx < x1 - 4; xx += 6) if (R() < 0.5) { g.fillStyle = R() < 0.7 ? P.orange : P.gold; g.fillRect(xx, y, 3, 2.5); }
            g.strokeStyle = R() < 0.5 ? P.cyan : P.pink; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0, yt + 1); g.lineTo(x1, yt + 1); g.stroke();
            if (R() < 0.5) {   // a palm
                const px = x1 + 6, py = yb, ph = 16 + R() * 10;
                Ink.brush(g, [[px, py], [px + 2, py - ph * 0.5], [px + 1, py - ph]], { w: 2, seed: Math.round(x * 3) });
                for (let f = 0; f < 6; f++) { const a = Math.PI * (1.05 + f * 0.18); Ink.brush(g, [[px + 1, py - ph], [px + 1 + Math.cos(a) * 9, py - ph + Math.sin(a) * 4 + 3], [px + 1 + Math.cos(a) * 14, py - ph + 6]], { w: 1.6, seed: Math.round(x * 3 + f) }); }
            }
        }
        // the shore line, an ink stroke
        Ink.brush(g, [[0, Y(0)], [W * 0.5, Y(0) + 1], [W, Y(0)]], { w: 3, seed: 'shore' });
        // per column: the colour the bay will reflect
        const im = g.getImageData(0, Math.round(Y(60)), W, Math.round(Y(0) - Y(60))).data, cw = 8;
        panoCols = [];
        for (let x = 0; x < W; x += cw) {
            let r = 0, gg = 0, b = 0, n = 0, lit = 0;
            for (let y = 0; y < Y(0) - Y(60) - 1; y += 3) for (let k = 0; k < cw && x + k < W; k += 2) {
                const i = ((y | 0) * W + x + k) * 4; if (im[i + 3] < 10) continue;
                const l = im[i] + im[i + 1] + im[i + 2]; if (l > 380) { r += im[i]; gg += im[i + 1]; b += im[i + 2]; n++; } lit++;
            }
            panoCols.push(n ? [r / n, gg / n, b / n, n / Math.max(1, lit)] : null);
        }
        pano = c;
    }
    function city(g, cam, T, d, fx, env) {
        if (!pano) buildPano();
        const tl = cam.p([PAN.x0, PAN.y1, PAN.z]), tr = cam.p([PAN.x1, PAN.y1, PAN.z]), br = cam.p([PAN.x1, PAN.y0, PAN.z]), bl = cam.p([PAN.x0, PAN.y0, PAN.z]);
        if (tl[2] < 10) return;
        Motion.quad(g, pano, [tl, tr, br, bl], 4);
        // the landmark's crown: its colour changes on every bar (the film's lights)
        const crown = Skyline.crownColour ? Skyline.crownColour(T, fx) : hex(P.pink);
        const c0 = cam.p([300 - 18, 240 + 4, PAN.z]), c1 = cam.p([300 + 18, 240 + 4, PAN.z]);
        g.strokeStyle = css(crown); g.lineWidth = 3; g.beginPath(); g.moveTo(c0[0], c0[1]); g.lineTo(c1[0], c1[1]); g.stroke();
        return { bl, br };
    }

    // --- the bay: flat deep blue, the city laid on it as horizontal strokes -----------------
    function bay(g, L, cam, T, d, fx, env, horizon) {
        g.fillStyle = P.deep; g.fillRect(-60, horizon, env.W + 120, env.H - horizon + 60);
        // a darker band nearer the viewer, edged by a wavering line
        const y2 = horizon + (env.H - horizon) * 0.35;
        g.fillStyle = P.navy; g.beginPath(); g.moveTo(-60, env.H + 60);
        for (let x = -60; x <= env.W + 60; x += 40) g.lineTo(x, y2 + Ink.noise(55, x / 120, d) * 6);
        g.lineTo(env.W + 60, env.H + 60); g.closePath(); g.fill();
        if (!panoCols) return;
        // reflections: for each lit column of the city, a few dashes under it
        const W = pano.width, cw = 8;
        for (let i = 0; i < panoCols.length; i += 1) {
            const c = panoCols[i]; if (!c || c[3] < 0.02) continue;
            const xw = PAN.x0 + ((i * cw + cw / 2) / PAN.pxm);
            const p = cam.p([xw, Causeway.WATER, PAN.z]); if (p[2] < 10 || p[0] < -40 || p[0] > env.W + 40) continue;
            const n = Math.round(2 + c[3] * 10);
            for (let k = 0; k < n; k++) {
                const u = (k + 0.5) / n, yy = horizon + 2 + Math.pow(u, 1.6) * (env.H - horizon) * 0.55;
                const sway = Ink.noise(i * 7 + k, T * 0.8, 0) * 6;
                const len = (6 + 14 * u) * (0.6 + Ink.hsh(i, k, d) * 0.8);
                Ink.brush(g, [[p[0] - len / 2 + sway, yy], [p[0] + len / 2 + sway, yy + 0.5]], { w: 1.6 + 2 * u, col: css(c, 0.9), seed: i * 31 + k, d, taper: 0.4, wob: 0.4, alpha: 0.85 * (1 - u * 0.5) });
            }
        }
    }

    // --- the causeway ------------------------------------------------------------------------
    // returns the items (lamps, palms, traffic) for the scene to sort with the car
    function causeway(g, L, N, cam, T, d, fx) {
        const C = Causeway, zc = cam.pos[2], zFar = zc + 700, zNear = zc + 0.4;
        const y = C.y, items = [];
        const zs = []; for (let z = zNear; z < zFar; z += Math.max(2, (z - zc) * 0.06)) zs.push(z); zs.push(zFar);
        // the deck hides itself beyond its crest: walking a line from near to far, once its
        // screen height drops back below the highest point reached so far, the rest is behind
        // the hump (cut there, at the crossing)
        const visible = (P) => {
            const out = []; let minY = Infinity;
            for (const p of P) {
                if (p[1] <= minY + 0.4 || !out.length) { out.push(p); minY = Math.min(minY, p[1]); continue; }
                break;
            }
            return out;
        };
        const edge = (x, dy = 0) => visible(zs.map((z) => cam.p([x, y(z) + dy, z])).filter((p) => p[2] > 0.3).map((p) => [p[0], p[1]]));
        // the crest's silhouette on screen (the deck's own line along the median) and the depth
        // from which things stand behind it: they are drawn only above that line
        const mid = zs.map((z) => [z, cam.p([-2.4, y(z) + 0.2, z])]).filter(([, p]) => p[2] > 0.3);
        let crestY = Infinity, zHide = Infinity;
        for (const [z, p] of mid) { if (p[1] <= crestY + 0.4) crestY = Math.min(crestY, p[1]); else { zHide = z; break; } }
        const behind = (z, f) => () => {
            if (z < zHide) return f();
            g.save(); g.beginPath(); g.rect(-200, -400, cam.W + 400, crestY + 400); g.clip(); f(); g.restore();
        };
        const band = (xa, xb, dy, fill, o = {}) => { const A = edge(xa, dy), B = edge(xb, dy); if (A.length < 2 || B.length < 2) return; Ink.shape(g, A.concat(B.reverse()), fill, { w: o.w ?? 0, seed: o.seed ?? 'band' + xa, d, jit: 0 }); };
        // the deck's side slabs (seen from outside), the deck, the median
        if (cam.pos[0] > 7.9) band(7.9, 7.9, -1.3, null);
        { const A = edge(7.9, 0), B = edge(7.9, -1.3); if (A.length > 1) Ink.shape(g, A.concat(B.reverse()), P.indigo, { w: 2.5, seed: 'slabR', d, jit: 0 }); }
        { const A = edge(-12.3, 0), B = edge(-12.3, -1.3); if (A.length > 1 && cam.pos[0] < -12.3) Ink.shape(g, A.concat(B.reverse()), P.indigo, { w: 2.5, seed: 'slabL', d, jit: 0 }); }
        band(-11.8, 7.4, 0, P.deep);
        band(-4.4, -0.4, 0.18, P.grape, { w: 2, seed: 'median' });
        // pools of lamp light on the asphalt: two flat tones, ellipses on the road under each lamp
        const kN = Math.floor(((zNear + 0.5) / C.V + C.T0 - Song.bar0) / Song.beat) - 1;
        for (let k = kN + 60; k >= kN; k--) {
            const zl = C.lampZ(k); if (zl < zNear || zl > zc + 300) continue;
            for (const [xl, rx] of [[1.7, 3.4], [-6.5, 3.4]]) {
                const pool = (rz, col) => { const pts = []; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; pts.push(cam.p([xl + Math.cos(a) * rx * rz, y(zl) + 0.02, zl + Math.sin(a) * 6 * rz])); } if (pts.some((p) => p[2] < 0.3)) return; g.fillStyle = col; Neon.path(g, pts); g.fill(); };
                pool(1, P.indigo); pool(0.55, P.royal);
            }
        }
        // lane lines: brush dashes in cream and gold
        for (let zd = Math.floor(Math.min(zFar, zc + 260) / 12) * 12; zd >= zNear - 3; zd -= 12) {
            // paint on the road is a flat quad in perspective (a brush of its near width would balloon)
            for (const xx of [3.7, -8.1]) { const z0 = Math.max(zd, zNear), q = Neon.poly(cam, [[xx - 0.08, y(z0) + 0.01, z0], [xx + 0.08, y(z0) + 0.01, z0], [xx + 0.08, y(zd + 3) + 0.01, zd + 3], [xx - 0.08, y(zd + 3) + 0.01, zd + 3]]); if (q) Ink.shape(g, q, P.cream, { w: 0, seed: Math.round(zd * 3 + xx), d, jit: 0.8 }); }
        }
        for (const [xx, col] of [[-0.15, P.gold], [7.1, P.cream], [-4.65, P.gold], [-11.5, P.cream]]) { const A = edge(xx, 0.01); if (A.length > 1) Ink.brush(g, A, { w: 2.2, col, seed: 'edge' + xx, d, taper: 0.02, wob: 0.6 }); }
        // wet streaks under the lamps: a few vertical brush strokes of gold
        for (let k = kN + 40; k >= kN; k--) {
            const zl = C.lampZ(k); if (zl < zNear + 1 || zl > zc + 200) continue;
            for (const xh of [1.7, -6.5]) {
                const a = cam.p([xh, y(zl), zl]), b = cam.p([xh, y(zl) - 9, zl]); if (a[2] < 1 || b[2] < 1) continue;
                const s = cam.f / a[2];
                for (let j = 0; j < 3; j++) Ink.brush(g, [[a[0] + (j - 1) * 0.15 * s, a[1]], [a[0] + (j - 1) * 0.1 * s, a[1] + (b[1] - a[1]) * (0.5 + 0.2 * j)]], { w: Math.max(1, 0.12 * s), col: j === 1 ? P.gold : P.orange, seed: k * 11 + j, d, taper: 0.5, alpha: 0.75 });
            }
        }
        // the median's shrubs: ink blobs with a few strokes of light on top
        for (let zz = Math.floor(Math.min(zFar, zc + 200) / 2.4) * 2.4; zz >= zNear + 0.5; zz -= 2.4) {
            for (const xs of [-3.5, -1.3]) {
                const b = cam.p([xs, y(zz) + 0.18, zz]); if (b[2] < 0.8) continue;
                const s = cam.f / b[2], r = 0.55 * s, hgt = 0.7 * s, pts = [];
                for (let j = 0; j <= 9; j++) { const a = Math.PI + (j / 9) * Math.PI; pts.push([b[0] + Math.cos(a) * r * (1 + 0.12 * Math.sin(j * 2.3 + zz)), b[1] + Math.sin(a) * hgt]); }
                Ink.shape(g, pts, P.grape, { w: Math.max(1, 0.06 * s), seed: Math.round(zz * 10 + xs * 3), d, jit: 0.5 });
                if (s > 25) Ink.hatch(g, [b[0] - r * 0.6, b[1] - hgt * 0.8], [b[0] + r * 0.6, b[1] - hgt * 0.8], { count: 3, len: 0.25 * s, w: Math.max(1, 0.035 * s), col: P.mint, seed: Math.round(zz * 7), d, n: [0, 1] });
            }
        }
        // the parapets: flat strips with ink, and their neon tubes
        for (const [x0, x1, face, neon] of [[7.4, 7.9, P.plum, P.pink], [-12.3, -11.8, P.violet, P.cyan]]) {
            const inner = x0 > 0 ? x0 : x1;
            const A = edge(inner, 0), B = edge(inner, 1.05);
            if (A.length > 1) {
                Ink.shape(g, A.concat(B.slice().reverse()), face, { w: 0, seed: 'par' + x0, d, jit: 0 });
                Ink.brush(g, A, { w: 3.2, seed: 'parA' + x0, d, taper: 0.03 });
                Ink.brush(g, B, { w: 3.6, seed: 'parB' + x0, d, taper: 0.03 });
                // where a lamp stands, its light falls on the face as a handful of strokes
                for (let k = kN + 24; k >= kN; k--) {
                    const zl = C.lampZ(k); if (zl < zc + 2 || zl > zc + 160) continue;
                    const a = cam.p([inner, y(zl) + 0.85, zl - 3]), b = cam.p([inner, y(zl) + 0.85, zl + 3]); if (a[2] < 0.5 || b[2] < 0.5) continue;
                    const s = cam.f / a[2];
                    Ink.hatch(g, [a[0], a[1]], [b[0], b[1]], { count: 4, len: Math.min(55, 0.55 * s), w: Math.min(5, Math.max(1, 0.06 * s)), col: x0 > 0 ? P.salmon : P.pink, seed: k * 41 + (x0 > 0 ? 1 : 2), d, n: [0, 1], ang: 0.2, alpha: 0.8 });
                }
            }
            const T1 = edge((x0 + x1) / 2, 1.13);
            if (T1.length > 1) {
                const col = fx.hue ? css(Neon.shift(neon, fx.hue)) : neon;
                for (const c of [g, L]) { c.save(); c.strokeStyle = col; c.lineWidth = c === L ? 7 : 4; c.lineCap = 'round'; c.beginPath(); T1.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke(); c.strokeStyle = P.cream; c.lineWidth = 1.4; c.stroke(); c.restore(); }
            }
        }
        // lamps, palms, traffic
        for (let k = kN + 60; k >= kN - 1; k--) {
            const zl = C.lampZ(k); if (zl < zc + 0.6 || zl > zFar) continue;
            items.push({ z: zl, draw: behind(zl, () => lamp(g, L, cam, zl, d, fx)) });
            const zp = zl + Song.beat * C.V / 2;
            if (zp < zFar && zp > zc + 1) items.push({ z: zp, draw: behind(zp, () => palm(g, L, cam, -2.4 + (k % 2 ? 0.5 : -0.5), zp, k, T, d, fx)) });
        }
        for (const t of C.traffic(T)) if (t.z > zc + 2 && t.z < zFar) items.push({ z: t.z, draw: behind(t.z, () => car(g, L, cam, t, d, fx)) });
        return items;
    }

    function lamp(g, L, cam, z, d, fx) {
        const y = Causeway.y(z), base = cam.p([-2.4, y + 0.2, z]), top = cam.p([-2.4, y + 10.6, z]);
        if (top[2] < 0.5) return;
        const s = cam.f / top[2];
        Ink.brush(g, [[base[0], base[1]], [top[0], top[1]]], { w: Math.max(1.4, 0.2 * s), col: P.ink, seed: Math.round(z * 13), d, taper: 0.05 });
        for (const dir of [1, -1]) {
            const hx = -2.4 + dir * 4.1, mid = cam.p([-2.4 + dir * 1.6, y + 10.8, z]), end = cam.p([hx, y + 10.1, z]);
            if (end[2] < 0.5) continue;
            Ink.brush(g, [[top[0], top[1]], [mid[0], mid[1]], [end[0], end[1]]], { w: Math.max(1.2, 0.1 * s), col: P.ink, seed: Math.round(z * 17 + dir), d, taper: 0.1 });
            const hs = cam.f / end[2], hw = 0.45 * hs, hh = 0.14 * hs;
            const col = fx.lampCol ? css(fx.lampCol) : P.gold;
            Ink.shape(g, [[end[0] - hw, end[1] - hh * 0.4], [end[0] + hw, end[1] - hh * 0.4], [end[0] + hw * 0.8, end[1] + hh], [end[0] - hw * 0.8, end[1] + hh]], col, { w: Math.max(1, 0.05 * hs), seed: Math.round(z * 19 + dir), d, jit: 0.4 });
            Neon.last.glint(null, L, end[0], end[1] + hh * 0.3, Math.min(70, Math.max(3, 0.7 * hs)) * (fx.lampPower ?? 1), fx.lampCol ?? hex(P.orange), { lightOnly: true, alpha: 0.55, halo: fx.halo ?? 1, star: fx.star ?? 0, rays: 4 });
        }
    }

    function palm(g, L, cam, x, z, seed, T, d, fx) {
        const y = Causeway.y(z) + 0.18, R = Motion.rng('palm' + seed), H = 12 + R() * 3, lean = (R() - 0.5) * 0.6;
        const base = cam.p([x, y, z]), top = cam.p([x + lean, y + H, z]); if (top[2] < 0.6) return;
        const s = cam.f / top[2], sb = cam.f / base[2];
        // trunk: a tapered flat plum shape with ink and the uplight as strokes of salmon
        const tw0 = 0.32 * sb, tw1 = 0.2 * s;
        const trunk = [[base[0] - tw0, base[1]], [top[0] - tw1, top[1]], [top[0] + tw1, top[1]], [base[0] + tw0, base[1]]];
        Ink.shape(g, trunk, P.plum, { w: Math.max(1.2, 0.07 * s), seed: seed * 7 + 1, d, jit: 0.6 });
        Ink.hatch(g, [base[0] + tw0 * 0.4, base[1] - 0.3 * sb], [top[0] + tw1 * 0.4, top[1] + (base[1] - top[1]) * 0.45], { count: 6, len: Math.max(3, 0.35 * s), w: Math.max(1, 0.05 * s), col: P.salmon, seed: seed * 3, d, n: [1, 0], ang: 1.2 });
        // fronds: brush strokes arching out and down, with a few strokes of cyan light
        const n = 12, sway = Math.sin(T * 1.6 + seed) * 0.05;
        for (let i = 0; i < n; i++) {
            const an = (i / n) * Math.PI * 2 + R() * 0.25, dx = Math.cos(an), dz = Math.sin(an), len = 3.6 + R() * 1.2, arch = 0.9 + R() * 0.6;
            const P0 = [x + lean, y + H, z];
            const pt = (u) => cam.p([P0[0] + dx * len * u, P0[1] + arch * Math.sin(u * Math.PI * 0.8) - u * u * (1.6 + sway * 10 * dx), P0[2] + dz * len * u * 0.9]);
            const rib = []; for (let j = 0; j <= 8; j++) rib.push(pt(j / 8));
            if (rib.some((p) => p[2] < 0.5)) continue;
            const r2 = rib.map((p) => [p[0], p[1]]);
            Ink.brush(g, r2, { w: Math.max(1.4, 0.16 * s), col: P.ink, seed: seed * 101 + i, d, taper: 0.3 });
            // leaflets as short ink ticks hanging from the rib
            for (let j = 2; j <= 8; j += 1) { const p = r2[j], ll = (1 - j / 10) * 0.9 * s; Ink.brush(g, [[p[0], p[1]], [p[0] + dx * ll * 0.3, p[1] + ll]], { w: Math.max(1, 0.07 * s), col: P.ink, seed: seed * 997 + i * 13 + j, d, taper: 0.5, wob: 0.4 }); }
            if (i % 3 === 0) Ink.brush(g, r2.slice(1, 5).map((p) => [p[0], p[1] - 0.05 * s]), { w: Math.max(1, 0.05 * s), col: i % 2 ? P.cyan : P.pink, seed: seed * 31 + i, d, taper: 0.4 });
        }
    }

    function car(g, L, cam, t, d, fx) {
        const y = Causeway.y(t.z), p = cam.p([t.x, y + 0.6, t.z]); if (p[2] < 2) return;
        const s = cam.f / p[2];
        Ink.shape(g, [[p[0] - 0.9 * s, p[1] + 0.4 * s], [p[0] - 0.9 * s, p[1] - 0.3 * s], [p[0] - 0.6 * s, p[1] - 0.75 * s], [p[0] + 0.6 * s, p[1] - 0.75 * s], [p[0] + 0.9 * s, p[1] - 0.3 * s], [p[0] + 0.9 * s, p[1] + 0.4 * s]], P.indigo, { w: Math.max(1, 0.06 * s), seed: Math.round(t.z), d });
        const col = t.dir > 0 ? P.red : P.cream;
        for (const dx of [-0.6, 0.6]) { g.fillStyle = col; g.fillRect(p[0] + dx * s - 0.15 * s, p[1] - 0.15 * s, 0.3 * s, 0.14 * s); Neon.last.glint(null, L, p[0] + dx * s, p[1] - 0.08 * s, Math.max(2, 0.35 * s), hex(col), { lightOnly: true, alpha: 0.6, halo: fx.halo ?? 1 }); }
    }

    // the water under the causeway: piers as ink columns, lamps as stacks of gold strokes
    function underDeck(g, L, cam, T, d, fx) {
        const C = Causeway, zc = cam.pos[2];
        if (cam.pos[0] < 8) return;
        for (let z = Math.floor((zc + 400) / 24) * 24; z >= zc - 24; z -= 24) {
            const a = cam.p([7.0, C.WATER, z]), b = cam.p([7.0, C.y(z) - 1.3, z]); if (a[2] < 1) continue;
            const s = cam.f / a[2];
            Ink.shape(g, [[a[0] - 0.8 * s, a[1]], [b[0] - 0.8 * s, b[1]], [b[0] + 0.8 * s, b[1]], [a[0] + 0.8 * s, a[1]]], P.grape, { w: Math.max(1, 0.1 * s), seed: z, d, jit: 0 });
        }
        const kN = Math.floor(((zc + 0.5) / C.V + C.T0 - Song.bar0) / Song.beat);
        for (let k = kN + 34; k >= kN; k--) {
            const zl = C.lampZ(k); if (zl < zc + 2) continue;
            for (const xh of [1.7, -6.5]) {
                const top = cam.p([xh, C.WATER, zl]); if (top[2] < 2 || top[0] < -60 || top[0] > cam.W + 60) continue;
                const s = cam.f / top[2], len = 18 * s;
                for (let j = 0; j < 7; j++) {
                    const u = (j + 0.5) / 7, yy = top[1] + len * u * u, w = (0.6 + u * 1.6) * s * (0.5 + Ink.hsh(k, j, d));
                    Ink.brush(g, [[top[0] - w / 2, yy], [top[0] + w / 2, yy + 0.5]], { w: Math.max(1, 0.12 * s * (1 + u)), col: j % 2 ? P.orange : P.gold, seed: k * 17 + j, d, taper: 0.4, alpha: 0.85 * (1 - u * 0.6) });
                }
            }
        }
    }

    return { sky, city, bay, causeway, underDeck };
})();
