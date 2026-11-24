// Downtown across the bay, 1985, invented: about forty towers at 2.2–3.4 km, glass and
// concrete slabs with lit floors, stepped Art Deco crowns lined with neon, one tall tower
// whose crown changes colour with the song (the film's «lights»), and in front of them the
// port: a cruise ship lit deck by deck, small boats, a plane crossing. Each facade is painted
// once into two sprites (the picture and its light) and placed through the camera.
// Global: Skyline.
const Skyline = (() => {
    const P = Neon.PAL;
    const PXM = 3;                                       // sprite pixels per metre
    let towers = null;

    function build() {
        const R = Motion.rng('skyline-1985');
        const out = [];
        // a dense centre, thinning to both sides; the tallest a little right of the road's axis
        for (let i = 0; i < 46; i++) {
            const u = (R() * 2 - 1), x = u * 1500 + 180;
            const centre = Math.exp(-(((x - 200) / 650) ** 2));
            const h = 25 + centre * (60 + R() * 120) + R() * 30;
            const w = 22 + R() * 38, z = 2200 + R() * 1100;
            out.push({ x, z, w, h, kind: R() < 0.35 ? 'glass' : R() < 0.5 ? 'deco' : 'slab', seed: i, R: R() });
        }
        // the landmark: a stepped tower whose crown is a colour that changes with the song
        out.push({ x: 300, z: 2600, w: 48, h: 230, kind: 'landmark', seed: 99, R: 0.5 });
        out.sort((a, b) => b.z - a.z);
        for (const t of out) paint(t);
        return out;
    }

    // facade sprites: pic (the building) and lit (only what emits)
    function paint(t) {
        const R = Motion.rng('tower' + t.seed);
        const W = Math.ceil(t.w * PXM), crownH = t.kind === 'deco' || t.kind === 'landmark' ? Math.ceil(t.w * 0.9 * PXM) : 0;
        const H = Math.ceil(t.h * PXM) + crownH;
        const pic = document.createElement('canvas'), lit = document.createElement('canvas');
        pic.width = lit.width = W; pic.height = lit.height = H;
        const g = pic.getContext('2d'), l = lit.getContext('2d');
        const top = crownH;                                 // the shaft starts below the crown
        // the shaft: dark, lifted at the foot by the street's glow and at the top by the sky
        const base = t.kind === 'glass' ? ['#1b1a46', '#2a2160', '#3b1f55'] : t.kind === 'slab' ? ['#221a3c', '#2c2147', '#4a2650'] : ['#2a2045', '#3a2a55', '#5a2c5c'];
        const gr = g.createLinearGradient(0, top, 0, H);
        gr.addColorStop(0, base[0]); gr.addColorStop(0.7, base[1]); gr.addColorStop(1, base[2]);
        g.fillStyle = gr; g.fillRect(0, top, W, H - top);
        // one side darker (the face turned away from the city's glow)
        g.fillStyle = 'rgba(8,5,22,0.35)'; g.fillRect(W * (t.R < 0.5 ? 0 : 0.72), top, W * 0.28, H - top);
        // floors and windows
        const floor = 3.6 * PXM, cols = Math.max(3, Math.round(t.w / (t.kind === 'glass' ? 2.4 : 3.2)));
        const cw = W / cols;
        const warm = ['#ffd08a', '#ffe2b0', '#ffb98a'], cool = ['#a8ecff', '#c6f3ff', '#ffc2ee'];
        const pal = R() < 0.6 ? warm : cool;
        const band = R() < 0.3;                             // whole floors lit as bands (offices)
        for (let y = top + floor * 0.5; y < H - floor * 0.6; y += floor) {
            const rowOn = band ? R() < 0.35 : null;
            for (let c = 0; c < cols; c++) {
                const on = rowOn ?? (R() < 0.33);
                const x = c * cw + cw * 0.18, ww = cw * 0.64, hh = floor * (t.kind === 'glass' ? 0.62 : 0.45);
                if (on) {
                    const col = pal[Math.floor(R() * pal.length)];
                    g.fillStyle = col; g.fillRect(x, y, ww, hh);
                    l.globalAlpha = 0.55 + R() * 0.45; l.fillStyle = col; l.fillRect(x, y, ww, hh);
                    l.globalAlpha = 1;
                } else {
                    g.fillStyle = t.kind === 'glass' ? 'rgba(120,110,200,0.18)' : 'rgba(10,6,26,0.55)'; g.fillRect(x, y, ww, hh);
                }
            }
        }
        // the crown: stepped Art Deco setbacks, or a pyramid for the landmark, lined with neon
        if (crownH) {
            const steps = t.kind === 'landmark' ? 4 : 3;
            g.fillStyle = base[1];
            l.lineWidth = Math.max(1.5, PXM * 0.6); l.lineJoin = 'round';
            const neon = t.kind === 'landmark' ? null : [P.pink, P.cyan, P.aqua, P.violet][Math.floor(R() * 4)];
            t.crown = [];
            for (let s = 0; s < steps; s++) {
                const inset = (s / steps) * W * 0.42, y0 = top - (s + 1) * (crownH / steps), y1 = top - s * (crownH / steps);
                g.fillRect(inset, y0, W - 2 * inset, y1 - y0 + 1);
                t.crown.push([inset, y0, W - 2 * inset, y1 - y0]);
                if (neon) { l.strokeStyle = neon; l.strokeRect(inset + 1, y0 + 1, W - 2 * inset - 2, y1 - y0); g.strokeStyle = neon; g.lineWidth = 1; g.strokeRect(inset + 1, y0 + 1, W - 2 * inset - 2, y1 - y0); }
            }
            if (t.kind === 'landmark') { g.beginPath(); g.moveTo(W * 0.42, top - crownH); g.lineTo(W / 2, top - crownH - W * 0.5); g.lineTo(W * 0.58, top - crownH); g.fill(); }
        }
        // a roof light (aircraft warning) on the tall ones
        if (t.h > 120) { l.fillStyle = P.red; l.beginPath(); l.arc(W / 2, 3, 3, 0, Math.PI * 2); l.fill(); }
        t.pic = pic; t.lit = lit; t.top = top; t.H = H;
    }

    // the landmark's crown colour: one colour per bar, turning through the neon palette
    const CROWN = [P.pink, P.cyan, P.violet, P.aqua, P.magenta, P.gold];
    function crownColour(T, fx) {
        const bar = Math.floor((T - Song.bar0) / (4 * Song.beat));
        const c = CROWN[((bar % CROWN.length) + CROWN.length) % CROWN.length];
        return fx.hue ? Neon.shift(c, fx.hue, 1.2) : Neon.hex(c);
    }

    // draw the city onto g (picture) and lg (light), as seen by cam. fx: { hue, breathe }
    function draw(g, lg, cam, T, fx = {}) {
        if (!towers) towers = build();
        const baseY = Causeway.WATER + 1;
        for (const t of towers) {
            const a = cam.p([t.x - t.w / 2, baseY + t.h + t.top / PXM, t.z]), b = cam.p([t.x + t.w / 2, baseY, t.z]);
            if (a[2] < 10) continue;
            const x = a[0], y = a[1], w = b[0] - a[0], h = b[1] - a[1];
            if (x > cam.W + 50 || x + w < -50) continue;
            g.drawImage(t.pic, x, y, w, h);
            lg.drawImage(t.lit, x, y, w, h);
            if (t.kind === 'landmark') {
                const col = crownColour(T, fx), sx = w / t.pic.width, sy = h / t.pic.height;
                lg.save(); lg.globalCompositeOperation = 'lighter';
                for (const [cx, cy, cw, ch] of t.crown) {
                    lg.strokeStyle = Neon.css(col); lg.lineWidth = Math.max(1.2, 2.2 * sx * PXM / 3);
                    lg.strokeRect(x + cx * sx, y + cy * sy, cw * sx, ch * sy);
                    lg.fillStyle = Neon.css(col, 0.45); lg.fillRect(x + cx * sx, y + cy * sy, cw * sx, ch * sy * 0.35);
                }
                lg.restore();
                g.save(); g.fillStyle = Neon.css(col, 0.6);
                for (const [cx, cy, cw, ch] of t.crown) g.fillRect(x + cx * sx, y + cy * sy, cw * sx, ch * sy * 0.35);
                g.restore();
            }
        }
        // the street level: a band of haze and a necklace of lights along the waterfront
        const l0 = cam.p([-1600, baseY + 2, 2150]), l1 = cam.p([1800, baseY + 2, 2150]);
        const R = Motion.rng('shore');
        for (let i = 0; i < 260; i++) {
            const u = R(), x = l0[0] + (l1[0] - l0[0]) * u, yy = l0[1] + (l1[1] - l0[1]) * u - R() * 3;
            const col = [P.sodium, '#fff0d0', P.pink, P.cyan][Math.floor(R() * 4)];
            lg.fillStyle = col; lg.globalAlpha = 0.5 + R() * 0.5; lg.fillRect(x, yy, 1.6, 1.6); lg.globalAlpha = 1;
        }
    }

    // the port: a cruise ship moored to the right of the road, lit deck by deck
    function ship(g, lg, cam, T, fx = {}) {
        const z = 1150, x0 = 260, len = 260, wl = Causeway.WATER;
        const a = cam.p([x0, wl, z]), b = cam.p([x0 + len, wl, z + 40]);
        if (a[2] < 5) return null;
        const s = cam.f / a[2];
        const hull = [[x0, wl, z], [x0 + len, wl, z + 40], [x0 + len + 8, wl + 12, z + 41], [x0 - 10, wl + 12, z - 1]].map(cam.p);
        g.fillStyle = '#d9d2ef'; Neon.path(g, hull); g.fill();
        g.fillStyle = 'rgba(40,24,80,0.5)'; Neon.path(g, [hull[0], hull[1], [hull[1][0], hull[1][1] - 3 * s], [hull[0][0], hull[0][1] - 3 * s]]); g.fill();
        // superstructure: decks stepping back, each a row of lit cabins
        const R = Motion.rng('ship');
        for (let d = 0; d < 6; d++) {
            const yb = wl + 12 + d * 3.2, inset = 20 + d * 12;
            const q = [[x0 + inset, yb, z + inset * 0.15], [x0 + len - inset * 0.6, yb, z + 40 - inset * 0.1], [x0 + len - inset * 0.6, yb + 3.2, z + 40 - inset * 0.1], [x0 + inset, yb + 3.2, z + inset * 0.15]].map(cam.p);
            g.fillStyle = d % 2 ? '#e8e2fa' : '#cfc6ea'; Neon.path(g, q); g.fill();
            const n = 46 - d * 5;
            for (let i = 0; i < n; i++) {
                if (R() < 0.25) continue;
                const u = (i + 0.5) / n, p0 = Neon.mix(q[0], q[1], u), y = p0[1] - 1.6 * s * 1.0;
                lg.fillStyle = R() < 0.8 ? '#ffe4b0' : P.cyan; lg.globalAlpha = 0.7 + R() * 0.3;
                lg.fillRect(p0[0], y, Math.max(1, 1.2 * s), Math.max(1, 1.0 * s)); lg.globalAlpha = 1;
            }
        }
        // funnel, mast lights, a string of bulbs from bow to mast
        const f0 = cam.p([x0 + len * 0.62, wl + 34, z + 26]), f1 = cam.p([x0 + len * 0.7, wl + 46, z + 28]);
        g.fillStyle = '#cf3f7a'; g.fillRect(f0[0], f1[1], f1[0] - f0[0], f0[1] - f1[1]);
        const bow = cam.p([x0 + len + 6, wl + 13, z + 41]), mast = cam.p([x0 + len * 0.8, wl + 52, z + 33]);
        for (let i = 0; i <= 24; i++) {
            const u = i / 24, x = bow[0] + (mast[0] - bow[0]) * u, y = bow[1] + (mast[1] - bow[1]) * u + Math.sin(u * Math.PI) * 4 * s;
            lg.fillStyle = [P.pink, P.yellow, P.cyan][i % 3]; lg.beginPath(); lg.arc(x, y, Math.max(0.8, 0.5 * s), 0, Math.PI * 2); lg.fill();
        }
        return Math.max(a[1], b[1]);                     // its waterline on screen
    }

    // small boats crossing the bay: a white running light and a red/green pair
    function boats(g, lg, cam, T) {
        for (const [x, z, v, ph] of [[-380, 900, 4, 0], [-160, 1500, -3, 2], [520, 700, 3.5, 1], [-700, 1300, 5, 3]]) {
            const xx = x + v * (T - 58), p = cam.p([xx, Causeway.WATER + 1.5, z]);
            if (p[2] < 5) continue;
            const s = cam.f / p[2];
            g.fillStyle = '#1a1230'; g.beginPath(); g.ellipse(p[0], p[1], 5 * s, 1.2 * s, 0, 0, Math.PI * 2); g.fill();
            lg.fillStyle = '#fff6e0'; lg.fillRect(p[0] - 0.6, p[1] - 3 * s, 1.5, 1.5);
            lg.fillStyle = v > 0 ? '#3fff8a' : P.red; lg.fillRect(p[0] + (v > 0 ? 3 : -3) * s, p[1] - 1.2 * s, 1.4, 1.4);
            // a wake: two thin pale lines behind
            g.strokeStyle = 'rgba(200,190,255,0.25)'; g.lineWidth = 1;
            g.beginPath(); g.moveTo(p[0] - Math.sign(v) * 5 * s, p[1]); g.lineTo(p[0] - Math.sign(v) * 40 * s, p[1] + 1.5 * s); g.stroke();
        }
    }


    // everything beyond the causeway, painted onto g (picture) and L (light):
    // the sky, the moon, a plane, the city, the bay with the city's reflection, swell, boats,
    // the cruise ship. fx: { hold, trip, kick, hue, breathe, halo, star }. Returns { horizon }.
    function world(g, L, N, cam, T, fx, env) {
        const hold = fx.hold ?? 0;
        const stops = ['#06041a', '#110a33', Neon.css(Neon.mix('#2a1250', '#3a1a66', hold)), Neon.css(Neon.mix('#5a1a66', '#7a2a78', hold)), Neon.css(Neon.mix('#b0306e', '#e0508a', hold * 0.8))];
        const horizon = cam.p([0, Causeway.WATER, 9000])[1];
        N.sky(g, -40, horizon + 4, { stops, stars: 160, t: T, seed: 'miami-sky' });
        moon(g, L, N, cam);
        plane(g, L, N, cam, T);
        // the city on its own layers (picture and light), so it can breathe and be mirrored
        const cityLit = Motion.layer(env, 'cityLit', () => {});
        const cl = cityLit.getContext('2d'); cl.setTransform(env.k, 0, 0, env.k, 0, 0); cl.globalCompositeOperation = 'lighter';
        const cityPic = Motion.layer(env, 'cityPic', (c) => draw(c, cl, cam, T, fx));
        if (fx.breathe > 0) N.breathe(g, cityPic, fx.breathe, T, { cy: horizon }); else g.drawImage(cityPic, 0, 0, env.W, env.H);
        L.save(); L.globalCompositeOperation = 'lighter';
        if (fx.breathe > 0) N.breathe(L, cityLit, fx.breathe, T, { cy: horizon }); else L.drawImage(cityLit, 0, 0, env.W, env.H);
        L.restore();
        // the bay: deep water, then the city's reflection broken by the swell
        const wgr = g.createLinearGradient(0, horizon, 0, env.H);
        wgr.addColorStop(0, '#2a1048'); wgr.addColorStop(0.25, '#130a2c'); wgr.addColorStop(1, '#07051a');
        g.fillStyle = wgr; g.fillRect(-50, horizon, env.W + 100, env.H - horizon + 50);
        N.reflect(g, cityPic, horizon, env.H, { t: T, amp: 5, alpha: 0.55, stretch: 1.0, rows: 110 });
        N.reflect(L, cityLit, horizon, env.H, { t: T, amp: 5, alpha: 0.35, stretch: 1.0, rows: 110 });
        swell(g, L, cam, T, horizon, env);
        boats(g, L, cam, T);
        ship(g, L, cam, T, fx);
        return { horizon };
    }

    // a thin crescent moon, high to the left, with its halo
    function moon(g, L, N, cam) {
        const p = cam.p([-2600, 1500, 7000]); if (p[2] < 1) return;
        const r = 26;
        N.glint(null, L, p[0], p[1], r * 3, '#c9b8ff', { lightOnly: true, alpha: 0.25 });
        g.save(); g.fillStyle = '#fff1dc'; g.beginPath(); g.arc(p[0], p[1], r, 0, Math.PI * 2); g.fill();
        g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(p[0] + r * 0.45, p[1] - r * 0.2, r * 0.92, 0, Math.PI * 2); g.fill(); g.restore();
        L.save(); L.fillStyle = 'rgba(255,240,220,0.6)'; L.beginPath(); L.arc(p[0] - r * 0.55, p[1] + r * 0.15, r * 0.4, 0, Math.PI * 2); L.fill(); L.restore();
    }

    // a plane on its way into the airport: white strobe, red and green wing lights
    function plane(g, L, N, cam, T) {
        const x = -1800 + (T - 58) * 70, p = cam.p([x, 700, 4200]); if (p[2] < 1) return;
        const blink = ((T * 1.1) % 1) < 0.08;
        N.glint(null, L, p[0], p[1], blink ? 10 : 3, '#ffffff', { lightOnly: true, star: blink ? 0.6 : 0 });
        L.fillStyle = '#ff3a4a'; L.fillRect(p[0] - 6, p[1] + 1, 2, 2); L.fillStyle = '#4aff8a'; L.fillRect(p[0] + 5, p[1] + 1, 2, 2);
    }

    // lines of swell on the bay, picking up the city's colours
    function swell(g, L, cam, T, horizon, env) {
        const R = Motion.rng('swell');
        for (let i = 0; i < 70; i++) {
            const z = 60 + Math.pow(R(), 1.6) * 2000, x = (R() * 2 - 1) * 1600, len = 10 + R() * 50;
            const ph = R() * 6, drift = Math.sin(T * 0.8 + ph) * 3;
            const a = cam.p([x + drift, Causeway.WATER, z]), b = cam.p([x + len + drift, Causeway.WATER, z]);
            if (a[2] < 3 || a[1] < horizon) continue;
            const col = [Neon.PAL.pink, Neon.PAL.cyan, '#ffb26a', '#b48cff'][i % 4];
            g.strokeStyle = Neon.rgba(col, 0.18 + 0.2 * R()); g.lineWidth = Math.max(0.6, 0.12 * cam.f / a[2]);
            g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
        }
    }

    return { world, draw, ship, boats, crownColour };
})();
