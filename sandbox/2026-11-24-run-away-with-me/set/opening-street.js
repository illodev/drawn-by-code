// Ocean Drive at night, 1985, in the drawn manner: a row of Art Deco hotels in pastel inks
// (porches lit gold, rows of windows under «eyebrow» ledges, fins and stepped crowns, round
// portholes), their neon on the eyebrows, fins, roofs and canopies striking on tube by tube
// from the first note (0.43) on the beat; the wet street mirroring the tubes in broken
// strokes; parked and passing cars of no make; palms in the park across the street; people
// walking on both sidewalks. Built in metres (x along the street, z away from the beach, y up)
// and painted through any Neon.camera. No lettering anywhere (no brand names, no title).
// Global: OpeningStreet.
(() => {
    const P = Ink.PAL, css = Neon.css, hex = Neon.hex, mix = Neon.mix;
    const cap = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const lw = (s, m = 0.05) => cap(m * s, 1.2, 5);
    // the street's sections (z): the park's wall, the park, its kerb, the road, the kerb, the sidewalk, the facades
    const Z = { wall: 3.5, parkKerb: 12.5, kerb: 25.5, face: 30, back: 46 };
    const BEAT = Song.beat;

    // --- the hotels -----------------------------------------------------------------------------
    const BODY = [
        ['#f45a7f', '#ffb0c8', P.plum],   // salmon, a pink trim
        ['#9a7ae8', '#d8c6ff', P.indigo], // lavender
        ['#e86ad0', '#ffc0f0', P.grape],  // orchid
        ['#3fb8c0', '#a8fff4', '#0e3a5a'],// mint at night
        ['#f9a07a', '#ffe0c0', P.plum],   // peach
        ['#c25fd0', '#f0b8ff', P.grape],
    ];
    const TUBE = [P.cyan, P.pink, P.magenta, P.aqua, P.gold, P.red, P.violet];
    let H = null, TUBES = null;
    function build() {
        const R = Motion.rng('opening-hotels');
        H = []; TUBES = [];
        let x = -150;
        while (x < 190) {
            const w = 20 + R() * 12, floors = 3 + Math.floor(R() * 2.2), hgt = 3.8 + floors * 3.1;
            const party = H.length && x <= -4 && x + w >= 4 && !H.some((h) => h.party);
            const kind = party ? 0 : Math.floor(R() * 4);           // 0 fin, 1 stepped crown, 2 portholes + corner tower, 3 speed lines
            H.push({ x0: x, x1: x + w, h: hgt, floors, col: BODY[Math.floor(R() * BODY.length)], kind, party, seed: H.length + 1,
                fin: kind === 0 || (kind === 1 && R() < 0.4), finH: hgt + 4 + R() * 5 + (party ? 3 : 0), cols: Math.max(5, Math.round(w / 3.3)), r: R(),
                tube: [TUBE[Math.floor(R() * TUBE.length)], TUBE[Math.floor(R() * TUBE.length)]] });
            x += w + 2.5 + R() * 3;
        }
        // the tubes of every hotel, in world points, with the order they strike in
        for (const h of H) {
            const zf = Z.face - 0.06, cx = (h.x0 + h.x1) / 2, [c1, c2] = h.party ? [P.cyan, P.magenta] : h.tube;
            const add = (pts, col, w = 0.09, ring = false) => TUBES.push({ pts, col, w, h, ring, cx: pts.reduce((a, p) => a + p[0], 0) / pts.length });
            add([[h.x0 + 0.4, h.h - 0.5, zf], [h.x1 - 0.4, h.h - 0.5, zf]], c1, 0.1);
            if (h.kind === 3) for (let i = 1; i <= 2; i++) add([[h.x0 + 0.4, h.h - 0.5 - i * 0.45, zf], [h.x1 - 0.4, h.h - 0.5 - i * 0.45, zf]], i % 2 ? c2 : c1, 0.07);
            // the first eyebrow, and every eyebrow on the speed-line hotels
            for (let f = 1; f <= h.floors; f++) if (f === 1 || h.kind === 3 || (h.party && f % 2 === 1)) add([[h.x0 + 0.6, 3.6 + (f - 1) * 3.1 + 2.55, zf - 0.75], [h.x1 - 0.6, 3.6 + (f - 1) * 3.1 + 2.55, zf - 0.75]], f === 1 ? c2 : c1, 0.07);
            if (h.fin) {
                const fz = zf - 1.3;
                add([[cx - 0.75, 4.2, fz], [cx - 0.75, h.finH - 0.4, fz]], c2, 0.1); add([[cx + 0.75, 4.2, fz], [cx + 0.75, h.finH - 0.4, fz]], c2, 0.1);
                TUBES[TUBES.length - 1].fin = TUBES[TUBES.length - 2].fin = TUBES[TUBES.length - 1].edge = TUBES[TUBES.length - 2].edge = true;
                for (let y = 5.2; y < h.finH - 1.2; y += 1.6) { add([[cx - 0.5, y, fz - 0.02], [cx, y + 0.55, fz - 0.02], [cx + 0.5, y, fz - 0.02]], c1, 0.08); Object.assign(TUBES[TUBES.length - 1], { fin: true, y }); }
            }
            if (h.kind === 2) for (const px of [h.x0 + 3, h.x1 - 3]) { const pts = []; for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI * 2; pts.push([px + Math.cos(a) * 0.9, h.h - 2.4 + Math.sin(a) * 0.9, zf]); } add(pts, c2, 0.08, true); }
            // the canopy over the door
            add([[cx - 2.6, 3.4, Z.face - 3.2], [cx + 2.6, 3.4, Z.face - 3.2]], h.party ? P.magenta : c1, 0.09);
        }
        // strike order: from the party hotel outwards, a little shuffled; beat j lights tubes [n(j), n(j+1))
        TUBES.forEach((t, i) => { t.key = Math.abs(t.cx) + Ink.hsh(i, 5, 1) * 30 - (t.h.party ? 60 : 0); });
        TUBES.sort((a, b) => a.key - b.key);
        // the party hotel's fin strikes first, on the first note (its two edges), then its chevrons
        // climb one an eighth note; the rest of the strip follows on the beat from bar 1
        const fin = TUBES.filter((t) => t.h.party && t.fin), rest = TUBES.filter((t) => !(t.h.party && t.fin));
        fin.sort((a, b) => (a.edge === b.edge ? a.y - b.y : a.edge ? -1 : 1));
        let ci = 0; for (const t of fin) t.on = t.edge ? 0.43 : 0.43 + (++ci) * BEAT / 2;
        rest.forEach((t, i) => { const j = Math.ceil(Math.pow(i + 1, 1 / 1.45)); t.on = Song.B(1) + (j - 1) * BEAT / 2; });
        TUBES = fin.concat(rest);
    }
    // a tube striking: a flicker on twos for a quarter of a second, then steady
    const FLICK = [1, 0, 0, 1, 0.4, 1];
    function lit(t, T) { const u = T - t.on; if (u < 0) return 0; const i = Math.floor(u * 12 + 1e-6); return i < FLICK.length ? FLICK[i] : 1; }

    function tube(g, L, cam, t, on, d) {
        const Q = t.pts.map(cam.p); if (Q.some((p) => p[2] < 0.4)) return;
        const s = cam.f / Q[0][2], wd = cap(t.w * s, 0.9, 7);
        const C = hex(t.col), core = css(mix(C, [255, 255, 255], 0.55));
        const path = (c) => { c.beginPath(); Q.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); };
        g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
        if (on <= 0) { path(g); g.strokeStyle = '#3a2470'; g.lineWidth = wd * 0.7; g.stroke(); g.restore(); return; }
        path(g); g.globalAlpha = on; g.strokeStyle = t.col; g.lineWidth = wd; g.stroke();
        if (wd > 1.6) { g.strokeStyle = core; g.lineWidth = wd * 0.38; g.stroke(); }
        g.restore();
        L.save(); L.lineCap = 'round'; L.lineJoin = 'round'; L.globalAlpha = 0.95 * on; L.strokeStyle = t.col; L.lineWidth = wd * 1.6; path(L); L.stroke(); L.restore();
    }

    // one hotel: its side face (when seen), the front with its porch, windows, eyebrows, crown,
    // fin and canopy. fx: { beatCol, kick } (the party's windows flash on the beat)
    function hotel(g, L, cam, h, T, d, fx) {
        const zf = Z.face, zb = Z.back, [body, trim, dark] = h.col, cx = (h.x0 + h.x1) / 2;
        const c0 = cam.p([cx, h.h / 2, zf]); if (c0[2] < 1) return;
        const s = cam.f / c0[2], W = lw(s, 0.07), sd = h.seed * 1000;
        const quad = (pts, col, o = {}) => { const q = Neon.poly(cam, pts); if (q) Ink.shape(g, q, col, { w: o.w ?? W, seed: sd + (o.k ?? 0), d, jit: o.jit ?? 0.5, light: o.light }); return q; };
        const shade = css(mix(body, '#1a0450', 0.45));
        // the side faces (into the block), darker
        if (cam.pos[0] < h.x0) quad([[h.x0, 0, zf], [h.x0, 0, zb], [h.x0, h.h, zb], [h.x0, h.h, zf]], shade, { k: 1 });
        if (cam.pos[0] > h.x1) quad([[h.x1, 0, zf], [h.x1, 0, zb], [h.x1, h.h, zb], [h.x1, h.h, zf]], shade, { k: 2 });
        // the front, with a stepped crown on the stepped hotels
        let front = [[h.x0, 0, zf], [h.x0, h.h, zf], [h.x1, h.h, zf], [h.x1, 0, zf]];
        if (h.kind === 1 || h.party) { const w3 = (h.x1 - h.x0) / 6; front = [[h.x0, 0, zf], [h.x0, h.h, zf], [cx - w3 * 1.5, h.h, zf], [cx - w3 * 1.5, h.h + 1.2, zf], [cx - w3 * 0.8, h.h + 1.2, zf], [cx - w3 * 0.8, h.h + 2.3, zf], [cx + w3 * 0.8, h.h + 2.3, zf], [cx + w3 * 0.8, h.h + 1.2, zf], [cx + w3 * 1.5, h.h + 1.2, zf], [cx + w3 * 1.5, h.h, zf], [h.x1, h.h, zf], [h.x1, 0, zf]]; }
        if (h.kind === 2) { const tx = h.x1 - 5; front = [[h.x0, 0, zf], [h.x0, h.h, zf], [tx, h.h, zf], [tx, h.h + 3.5, zf], [tx + 0.6, h.h + 3.5, zf], [tx + 0.6, h.h + 4.6, zf], [h.x1 - 0.6, h.h + 4.6, zf], [h.x1 - 0.6, h.h + 3.5, zf], [h.x1, h.h + 3.5, zf], [h.x1, 0, zf]]; }
        quad(front, body, { k: 3 });
        // a light wash down the facade: the street's glow from below, in strokes of the trim
        const zl = zf - 0.02;
        if (s > 12) {
            const a = cam.p([h.x0 + 0.5, 4.2, zl]), b = cam.p([h.x1 - 0.5, 4.2, zl]);
            Ink.hatch(g, [a[0], a[1]], [b[0], b[1]], { count: Math.round((h.x1 - h.x0) / 2), len: cap(1.2 * s, 6, 60), w: cap(0.06 * s, 1, 3.5), col: trim, seed: sd + 9, d, n: [0, -1], ang: 0.15, alpha: 0.55 });
        }
        // speed lines at the roof, vertical racing stripes beside the centre
        if (h.kind === 3 || h.party) for (let i = 0; i < 3; i++) quad([[h.x0, h.h - 1.4 - i * 0.45, zl], [h.x1, h.h - 1.4 - i * 0.45, zl], [h.x1, h.h - 1.55 - i * 0.45, zl], [h.x0, h.h - 1.55 - i * 0.45, zl]], trim, { w: 0, k: 20 + i, jit: 0 });
        if (h.kind === 1) for (const dx of [-3.2, -2.6, 2.6, 3.2]) quad([[cx + dx - 0.12, 3.8, zl], [cx + dx + 0.12, 3.8, zl], [cx + dx + 0.12, h.h - 0.3, zl], [cx + dx - 0.12, h.h - 0.3, zl]], trim, { w: 0, k: 30 + dx * 10, jit: 0 });
        // the porch: a dark band, openings lit gold, piers between them
        quad([[h.x0, 0, zl], [h.x0, 3.6, zl], [h.x1, 3.6, zl], [h.x1, 0, zl]], dark, { k: 4 });
        const nOp = Math.max(3, Math.round((h.x1 - h.x0) / 4.2)), opW = (h.x1 - h.x0 - 1) / nOp;
        for (let i = 0; i < nOp; i++) {
            const xa = h.x0 + 0.5 + i * opW + 0.35, xb = xa + opW - 0.7, door = Math.abs((xa + xb) / 2 - cx) < opW * 0.6;
            const warm = door ? P.gold : Ink.hsh(h.seed, i, 2) < 0.7 ? P.orange : P.salmon;
            const q = quad([[xa, 0.15, zl], [xa, door ? 3.0 : 2.7, zl], [xb, door ? 3.0 : 2.7, zl], [xb, 0.15, zl]], warm, { k: 40 + i, w: lw(s, 0.05), light: true });
            if (q) { const a = cam.p([xa + 0.2, 2.5, zl]), b = cam.p([xb - 0.2, 2.5, zl]); if (s > 14) Ink.hatch(g, [a[0], a[1]], [b[0], b[1]], { count: 3, len: cap(1.4 * s, 5, 50), w: cap(0.05 * s, 1, 3), col: P.cream, seed: sd + 50 + i, d, n: [0, 1], ang: 0.1, alpha: 0.6 }); }
        }
        // the floors: windows under eyebrow ledges
        const cw = (h.x1 - h.x0 - 2) / h.cols;
        for (let f = 1; f <= h.floors; f++) {
            const y0 = 3.6 + (f - 1) * 3.1 + 0.7, y1 = y0 + 1.6;
            for (let i = 0; i < h.cols; i++) {
                const xa = h.x0 + 1 + i * cw + cw * 0.22, xb = xa + cw * 0.56;
                if (h.fin && Math.abs((xa + xb) / 2 - cx) < 1.4) continue;
                const r = Ink.hsh(h.seed * 31 + f, i, 4);
                let col = r < 0.42 ? P.orange : r < 0.55 ? P.gold : r < 0.62 ? P.salmon : '#1a0a4a';
                if (h.party && f === h.floors && fx.beatCol) col = (i + Math.floor(Song.beatAt(T))) % 3 ? fx.beatCol : '#1a0a4a';
                const q = quad([[xa, y0, zl], [xa, y1, zl], [xb, y1, zl], [xb, y0, zl]], col, { k: 100 + f * 40 + i, w: s > 20 ? lw(s, 0.04) : 0, light: col !== '#1a0a4a' });
                if (q && col !== '#1a0a4a' && s > 16) { L.save(); L.globalAlpha = 0.35; L.fillStyle = col; L.beginPath(); q.forEach((p, j) => (j ? L.lineTo(p[0], p[1]) : L.moveTo(p[0], p[1]))); L.closePath(); L.fill(); L.restore(); }
                // the sash: a mullion and a sill line in the dark ink
                if (q && s > 28) { const m0 = cam.p([(xa + xb) / 2, y0, zl]), m1 = cam.p([(xa + xb) / 2, y1, zl]); Ink.brush(g, [[m0[0], m0[1]], [m1[0], m1[1]]], { w: lw(s, 0.03), seed: sd + f * 7 + i, d, taper: 0.1 }); }
            }
            // the eyebrow: its underside in shadow, its edge in the trim
            const ye = y1 + 0.3;
            quad([[h.x0 + 0.5, ye, zf], [h.x1 - 0.5, ye, zf], [h.x1 - 0.5, ye, zf - 0.8], [h.x0 + 0.5, ye, zf - 0.8]], shade, { k: 200 + f, w: 0, jit: 0 });
            quad([[h.x0 + 0.5, ye, zf - 0.8], [h.x1 - 0.5, ye, zf - 0.8], [h.x1 - 0.5, ye + 0.22, zf - 0.8], [h.x0 + 0.5, ye + 0.22, zf - 0.8]], trim, { k: 220 + f, w: lw(s, 0.035) });
        }
        // the fin: a blade standing out of the facade above the door, higher than the roof
        if (h.fin) {
            const fz = zf - 1.3;
            if (cam.pos[0] < cx - 0.8) quad([[cx - 0.8, 3.8, zf], [cx - 0.8, h.finH, zf], [cx - 0.8, h.finH, fz], [cx - 0.8, 3.8, fz]], shade, { k: 300 });
            if (cam.pos[0] > cx + 0.8) quad([[cx + 0.8, 3.8, zf], [cx + 0.8, h.finH, zf], [cx + 0.8, h.finH, fz], [cx + 0.8, 3.8, fz]], shade, { k: 301 });
            quad([[cx - 0.8, 3.8, fz], [cx - 0.8, h.finH - 1.2, fz], [cx - 0.45, h.finH - 1.2, fz], [cx - 0.45, h.finH, fz], [cx + 0.45, h.finH, fz], [cx + 0.45, h.finH - 1.2, fz], [cx + 0.8, h.finH - 1.2, fz], [cx + 0.8, 3.8, fz]], h.party ? P.grape : body, { k: 302 });
            const a = cam.p([cx - 0.6, 4.2, fz]), b = cam.p([cx - 0.6, h.finH - 1.5, fz]);
            if (s > 10) Ink.hatch(g, [a[0], a[1]], [b[0], b[1]], { count: 8, len: cap(0.5 * s, 4, 24), w: cap(0.05 * s, 1, 3), col: P.cream, seed: sd + 303, d, n: [1, 0], ang: 1.3, alpha: 0.6 });
        }
        // the canopy over the door: its underside lit, its edge
        quad([[cx - 2.7, 3.35, zf], [cx + 2.7, 3.35, zf], [cx + 2.7, 3.35, zf - 3.2], [cx - 2.7, 3.35, zf - 3.2]], P.gold, { k: 400, w: 0, jit: 0, light: true });
        quad([[cx - 2.7, 3.35, zf - 3.2], [cx + 2.7, 3.35, zf - 3.2], [cx + 2.7, 3.75, zf - 3.2], [cx - 2.7, 3.75, zf - 3.2]], dark, { k: 401 });
        for (const dx of [-2.5, 2.5]) { const a = cam.p([cx + dx, 0.15, zf - 3.1]), b = cam.p([cx + dx, 3.35, zf - 3.1]); if (a[2] > 1) Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.08 * cam.f / a[2], 1.2, 6), seed: sd + 410 + dx, d, taper: 0.05 }); }
        // the tubes of this hotel
        for (const t of TUBES) if (t.h === h) tube(g, L, cam, t, lit(t, T), d);
    }

    // --- the ground ------------------------------------------------------------------------------
    function ground(g, L, cam, T, d, fx, env) {
        const xs = []; for (let x = -200; x <= 240; x += 8) xs.push(x);
        const strip = (za, zb, y, col, k, o = {}) => { const pts = xs.map((x) => [x, y, za]).concat(xs.slice().reverse().map((x) => [x, y, zb])); const q = Neon.poly(cam, pts); if (q) Ink.shape(g, q, col, { w: 0, seed: k, d, jit: 0, ...o }); return q; };
        { const q = Neon.poly(cam, [[-12000, -1.2, -40], [12000, -1.2, -40], [12000, -1.2, -12000], [-12000, -1.2, -12000]]); if (q) Ink.shape(g, q, '#140548', { w: 0, seed: 'sea', d, jit: 0 }); }
        strip(-40, Z.wall, -0.4, '#5a2a8a', 'sand');
        // the sea: horizontal strokes, glints of the moon and a far boat
        const R = Motion.rng('opening-sea');
        for (let i = 0; i < 90; i++) {
            const x = -200 + R() * 900, z = -40 - Math.pow(R(), 1.5) * 500, p = cam.p([x + Math.sin(T * 0.6 + i) * 1.5, -1.2, z]); if (p[2] < 2 || p[0] < -60 || p[0] > env.W + 60) continue;
            const l = Math.min(60, 1200 / p[2] + 5);
            Ink.brush(g, [[p[0] - l / 2, p[1]], [p[0] + l / 2, p[1] + 0.5]], { w: Math.min(3.5, 0.8 + 60 / p[2]), col: [P.violet, P.royal, P.purple, P.cyan][i % 4], seed: 6100 + i, d, taper: 0.45, wob: 0.3, alpha: 0.75, light: true });
        }
        // the side streets between the hotels, then the land behind them out to the horizon
        strip(Z.face - 0.2, Z.back + 1, 0, '#120440', 'alleys');
        // the land behind the hotels, out to the horizon (seen through the side streets)
        { const q = Neon.poly(cam, [[-12000, -0.2, Z.back], [12000, -0.2, Z.back], [12000, -0.2, 12000], [-12000, -0.2, 12000]]); if (q) Ink.shape(g, q, '#0e0558', { w: 0, seed: 'land', d, jit: 0 }); }
        strip(Z.wall, Z.parkKerb, 0.1, '#2a0c66', 'park');
        // the park's coral wall along the beach
        { const pts = xs.map((x) => [x, 0.9, Z.wall]).concat(xs.slice().reverse().map((x) => [x, -0.4, Z.wall])); const q = Neon.poly(cam, pts); if (q) Ink.shape(g, q, P.plum, { w: 2.4, seed: 'pwall', d, jit: 0 }); }
        strip(Z.kerb, Z.face, 0, '#1a0670', 'under');                     // the road runs on under the kerb
        const road = strip(Z.parkKerb, Z.kerb, 0, '#1a0670', 'road');
        // on the wet road (clipped to it): the tubes mirrored as broken strokes, the lane paint
        if (road) {
            g.save(); g.beginPath(); road.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.clip();
            for (const zc of [19.1]) for (let x = -200; x < 240; x += 9) { const q = Neon.poly(cam, [[x, 0.01, zc - 0.07], [x + 3, 0.01, zc - 0.07], [x + 3, 0.01, zc + 0.07], [x, 0.01, zc + 0.07]]); if (q) Ink.shape(g, q, '#e8b04a', { w: 0, seed: 'lane' + x, d, jit: 0, light: true }); }
            for (const t of TUBES) {
                const on = lit(t, T); if (on <= 0) continue;
                const n = t.ring ? 4 : Math.min(8, t.pts.length + 3);
                for (let i = 0; i < n; i++) {
                    const u = n === 1 ? 0.5 : i / (n - 1), a = t.pts[0], b = t.pts[t.pts.length - 1];
                    const w = [a[0] + (b[0] - a[0]) * u, -(a[1] + (b[1] - a[1]) * u), a[2]];
                    const p = cam.p(w); if (p[2] < 1) continue;
                    const s = cam.f / p[2], l = cap(0.6 * s, 4, 40) * (0.6 + Ink.hsh(i, t.pts.length, 1)), wob = Ink.noise(i * 13 + t.pts.length, T * 1.3, 0) * 0.3 * s;
                    Ink.brush(g, [[p[0] - l / 2 + wob, p[1]], [p[0] + l / 2 + wob, p[1] + 0.5]], { w: cap(0.07 * s, 1, 4), col: t.col, seed: 6600 + i * 7 + Math.round(t.key), d, taper: 0.45, wob: 0.3, alpha: 0.7 * on, light: true });
                }
            }
            g.restore();
        }
        // the kerb faces, standing between the road and the walks
        for (const [z, hgt, k] of [[Z.kerb, 0.15, 'kf1'], [Z.parkKerb, 0.12, 'kf2']]) { const pts = xs.map((x) => [x, hgt, z]).concat(xs.slice().reverse().map((x) => [x, 0, z])); const q = Neon.poly(cam, pts); if (q) Ink.shape(g, q, P.grape, { w: 0, seed: k, d, jit: 0 }); }
        strip(Z.kerb, Z.face, 0.15, '#3a1080', 'walk');
        // the kerb lines
        for (const z of [Z.parkKerb, Z.kerb]) { const E = xs.map((x) => cam.p([x, 0.13, z])).filter((p) => p[2] > 0.5).map((p) => [p[0], p[1]]); if (E.length > 1) Ink.brush(g, E, { w: 2.2, seed: 'kl' + z, d, taper: 0.02 }); }
    }

    // --- palms (the causeway's palm, standing on flat ground) -----------------------------------
    function palm(g, cam, x, yb, z, seed, T, d) {
        const R = Motion.rng('opalm' + seed), H = 9 + R() * 4, lean = (R() - 0.5) * 1.2;
        const top = cam.p([x + lean, yb + H, z]); if (top[2] < 0.6) return;
        const s = cam.f / top[2];
        const pts = []; for (let i = 0; i <= 9; i++) { const u = i / 9, p = cam.p([x + lean * u * u, yb + H * 0.9 * u, z]), w = (0.26 + 0.05 * Math.sin(u * 2.4) - 0.09 * u) * cam.f / p[2]; pts.push([p[0], p[1], w]); }
        const outline = pts.map((p) => [p[0] - p[2], p[1]]).concat(pts.slice().reverse().map((p) => [p[0] + p[2], p[1]]));
        Ink.shape(g, outline, P.purple, { w: s > 7 ? lw(s, 0.06) : 0, seed: seed * 7 + 1, d, jit: s > 7 ? 0.5 : 0 });
        if (s > 10) for (let i = 1; i < 9; i++) { const p = pts[i]; Ink.brush(g, [[p[0] - p[2] * 0.8, p[1]], [p[0] + p[2] * 0.8, p[1] + p[2] * 0.12]], { w: cap(0.03 * s, 0.8, 2.5), seed: seed * 13 + i, d, taper: 0.4, alpha: 0.7 }); }
        if (s > 5) Ink.brush(g, pts.map((p) => [p[0] - p[2] * 0.62, p[1]]), { w: cap(0.05 * s, 1, 4), col: P.cyan, seed: seed * 17, d, taper: 0.3 });
        if (s > 14) Ink.hatch(g, [pts[0][0] + pts[0][2] * 0.4, pts[0][1] - 4], [pts[6][0] + pts[6][2] * 0.4, pts[6][1]], { count: s > 40 ? 7 : 4, len: cap(0.3 * s, 3, 26), w: cap(0.045 * s, 1, 4), col: P.salmon, seed: seed * 3, d, n: [1, 0], ang: 1.2 });
        const c0 = cam.p([x + lean, yb + H * 0.9, z]), c1 = cam.p([x + lean, yb + H, z]), cwd = 0.2 * cam.f / c0[2];
        Ink.shape(g, [[c0[0] - cwd, c0[1]], [c1[0] - cwd * 0.8, c1[1]], [c1[0] + cwd * 0.8, c1[1]], [c0[0] + cwd, c0[1]]], '#2a5a7a', { w: s > 7 ? lw(s, 0.05) : 0, seed: seed * 9, d, jit: 0.4 });
        const n = 14, sway = Math.sin(T * 1.4 + seed) * 0.06, fr = [];
        for (let i = 0; i < n; i++) { const an = (i / n) * Math.PI * 2 + R() * 0.25; fr.push({ an, dx: Math.cos(an), dz: Math.sin(an), len: 3.2 + R() * 1.2, arch: 0.9 + R() * 0.6 }); }
        fr.sort((a, b) => b.dz - a.dz);
        const P0 = [x + lean, yb + H, z];
        for (const f of fr) {
            const pt = (u) => cam.p([P0[0] + f.dx * f.len * u, P0[1] + f.arch * Math.sin(u * Math.PI * 0.7) - u * u * (2.4 + sway * 10 * f.dx), P0[2] + f.dz * f.len * u * 0.9]);
            const rib = []; for (let j = 0; j <= 8; j++) rib.push(pt(j / 8));
            if (rib.some((p) => p[2] < 0.5)) continue;
            const width = (j) => (0.26 * Math.sin((j / 8) * Math.PI * 0.95 + 0.1)) * cam.f / rib[j][2];
            const up = rib.map((p, j) => [p[0], p[1] - width(j) * 0.35]), dn = rib.map((p, j) => [p[0] + f.dx * width(j) * 0.2, p[1] + width(j) * 0.8]);
            Ink.shape(g, up.concat(dn.reverse()), f.dz > 0 ? P.grape : P.plum, { w: s > 9 ? lw(s, 0.05) : 0, seed: seed * 101 + Math.round(f.an * 10), d, jit: s > 9 ? 0.5 : 0 });
            if (s > 12) for (let j = 2; j <= 8; j++) { const p = rib[j], ll = width(j) * 1.1; Ink.brush(g, [[p[0], p[1] + width(j) * 0.4], [p[0] + f.dx * ll * 0.3, p[1] + ll]], { w: cap(0.04 * s, 1, 3), seed: seed * 997 + Math.round(f.an * 10) * 13 + j, d, taper: 0.5, wob: 0.4 }); }
            if (s > 6) Ink.brush(g, rib.slice(1, 6).map((p, j) => [p[0], p[1] - width(j + 1) * 0.3]), { w: cap(0.04 * s, 1, 3.5), col: f.dx > 0 ? P.pink : P.cyan, seed: seed * 31 + Math.round(f.an * 10), d, taper: 0.4 });
        }
    }

    // --- cars of no make: a long body, a cabin set back, wheels, chrome, lights ------------------
    function car(g, L, cam, c, d) {
        const { x, z, dir, col } = c, Lh = 2.45, Wh = 0.92;
        const pc = cam.p([x, 0.7, z]); if (pc[2] < 1.5) return;
        const s = cam.f / pc[2], W = lw(s, 0.035);
        const fx0 = x - Lh, fx1 = x + Lh;
        const boxes = [
            { x0: fx0, x1: fx1, y0: 0.3, y1: 0.95, z0: z - Wh, z1: z + Wh, col, k: 1 },
            { x0: x - 1.0 - dir * 0.25, x1: x + 1.0 - dir * 0.25, y0: 0.95, y1: 1.4, z0: z - Wh * 0.85, z1: z + Wh * 0.85, col: css(mix(col, '#1a0450', 0.25)), k: 2, cabin: true },
        ];
        for (const b of boxes) {
            const inset = b.cabin ? 0.28 : 0;
            const top = [[b.x0 + inset, b.y1, b.z0], [b.x1 - inset, b.y1, b.z0], [b.x1 - inset, b.y1, b.z1], [b.x0 + inset, b.y1, b.z1]];
            const faces = [
                [top, [0, 1, 0], 1.0],
                [[[b.x0, b.y0, b.z0], [b.x1, b.y0, b.z0], [b.x1 - inset, b.y1, b.z0], [b.x0 + inset, b.y1, b.z0]], [0, 0, -1], 0.8],
                [[[b.x0, b.y0, b.z1], [b.x1, b.y0, b.z1], [b.x1 - inset, b.y1, b.z1], [b.x0 + inset, b.y1, b.z1]], [0, 0, 1], 0.8],
                [[[b.x0, b.y0, b.z0], [b.x0, b.y0, b.z1], [b.x0 + inset, b.y1, b.z1], [b.x0 + inset, b.y1, b.z0]], [-1, 0, 0], 0.65],
                [[[b.x1, b.y0, b.z0], [b.x1, b.y0, b.z1], [b.x1 - inset, b.y1, b.z1], [b.x1 - inset, b.y1, b.z0]], [1, 0, 0], 0.65],
            ].filter(([pts, n]) => { const p = pts[0]; return (cam.pos[0] - p[0]) * n[0] + (cam.pos[1] - p[1]) * n[1] + (cam.pos[2] - p[2]) * n[2] > 0; });
            for (const [pts, n, k] of faces) {
                const q = Neon.poly(cam, pts); if (!q) continue;
                const glass = b.cabin && n[1] === 0;
                Ink.shape(g, q, glass ? '#2a1468' : css(mix(b.col, '#04022e', 1 - k)), { w: W, seed: Math.round(x * 3 + z * 7) + b.k * 10 + Math.round(k * 10), d, jit: 0.3 });
                if (glass && s > 18) { const m = q.reduce((a, p) => [a[0] + p[0] / q.length, a[1] + p[1] / q.length], [0, 0]); Ink.brush(g, [[m[0] - 0.25 * s, m[1] + 0.12 * s], [m[0] + 0.1 * s, m[1] - 0.12 * s]], { w: cap(0.03 * s, 1, 3), col: P.cyan, seed: Math.round(x * 5) + b.k, d, taper: 0.4, alpha: 0.8 }); }
            }
        }
        // the side seen: chrome along it, the wheels
        const zs = cam.pos[2] < z ? z - Wh - 0.01 : z + Wh + 0.01;
        if (Math.abs(cam.pos[2] - z) > Wh) {
            const a = cam.p([fx0 + 0.2, 0.72, zs]), b = cam.p([fx1 - 0.2, 0.72, zs]);
            if (a[2] > 1) Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.04 * s, 1, 3), col: P.cream, seed: Math.round(x * 11), d, taper: 0.2 });
            for (const wx of [fx0 + 0.9, fx1 - 0.9]) {
                const pts = []; for (let i = 0; i < 14; i++) { const an = (i / 14) * Math.PI * 2; pts.push([wx + Math.cos(an) * 0.34, 0.34 + Math.sin(an) * 0.34, zs]); }
                const q = Neon.poly(cam, pts); if (q) { Ink.shape(g, q, '#0b0230', { w: 0, seed: Math.round(wx * 7), d, jit: 0.3 }); const hc = cam.p([wx, 0.34, zs]); Ink.brush(g, [[hc[0] - 0.12 * s, hc[1]], [hc[0] + 0.12 * s, hc[1]]], { w: cap(0.05 * s, 1, 4), col: '#b8a2e8', seed: Math.round(wx * 9), d, taper: 0.3 }); }
            }
        }
        // the lights on the end seen: red tails at the back, cream heads at the front
        for (const end of [-1, 1]) {
            const xe = end > 0 ? fx1 + 0.01 : fx0 - 0.01, seen = end > 0 ? cam.pos[0] > xe : cam.pos[0] < xe; if (!seen) continue;
            const front = end === dir, lc = front ? P.cream : P.red;
            for (const dz of [-0.62, 0.62]) {
                const q = Neon.poly(cam, [[xe, 0.62, z + dz - 0.2], [xe, 0.62, z + dz + 0.2], [xe, 0.78, z + dz + 0.2], [xe, 0.78, z + dz - 0.2]]); if (!q) continue;
                Ink.shape(g, q, lc, { w: lw(s, 0.02), seed: Math.round(x * 13 + dz * 7 + end), d, light: true });
                const cc = cam.p([xe, 0.7, z + dz]);
                if (c.moving || !front) Neon.last.glint(null, L, cc[0], cc[1], Math.max(2, (front ? 0.5 : 0.3) * s), hex(lc), { lightOnly: true, alpha: c.moving ? 0.7 : 0.35, halo: 1 });
            }
        }
    }
    const CARS = [
        { x: -46, z: 24.2, dir: 1, col: '#9a7ae8' }, { x: -33, z: 24.2, dir: 1, col: '#3fb8c0' }, { x: -14, z: 24.2, dir: 1, col: '#f4ecd8' },
        { x: 11, z: 24.2, dir: 1, col: '#f45a7f' }, { x: 24, z: 24.2, dir: 1, col: '#c25fd0' }, { x: 44, z: 24.2, dir: 1, col: '#7dffc8' },
        { x: 63, z: 24.2, dir: 1, col: '#f9a07a' }, { x: 80, z: 24.2, dir: 1, col: '#9a7ae8' }, { x: 101, z: 24.2, dir: 1, col: '#e86ad0' },
        { x: 38, z: 13.8, dir: -1, col: '#3fb8c0' }, { x: 57, z: 13.8, dir: -1, col: '#f45a7f' }, { x: 130, z: 24.2, dir: 1, col: '#f4ecd8' },
    ];
    // the cars driving: one each way, cruising at walking-plus speeds (the strip at night)
    const drivers = (T) => [
        { x: -60 + (T - 0) * 9.5, z: 17, dir: 1, col: '#f4ecd8', moving: true },
        { x: 95 - (T - 0) * 8.0, z: 21.2, dir: -1, col: '#e86ad0', moving: true },
        { x: -150 + (T - 4.4) * 11, z: 17, dir: 1, col: '#3fb8c0', moving: true },
    ];

    // --- people on the sidewalks ----------------------------------------------------------------
    function walkers(T) {
        const out = [];
        for (let i = 0; i < 46; i++) {
            const r = (k) => Ink.hsh(i, k, 91), far = r(1) < 0.62, dir = r(2) < 0.5 ? 1 : -1, v = 1.05 + r(3) * 0.5;
            const z = far ? Z.kerb + 1.2 + r(4) * 2.8 : Z.parkKerb - 1.2 - r(4) * 1.6;
            const span = 340, x = ((-150 + r(5) * span + dir * v * T) % span + span) % span - 150;
            // a four-drawing walk, each drawing held three twelfths
            const ph = Math.floor((T * 12 + r(6) * 12) / 3) % 4;
            out.push({ x, z, flip: dir < 0, pose: 'w' + ph, seed: 300 + i });
        }
        // a few standing at the party hotel's door and at others, turning to talk on the beat
        for (let i = 0; i < 12; i++) {
            const r = (k) => Ink.hsh(i, k, 92), x = (i < 7 ? -3.5 + i * 1.1 : -70 + i * 17) + r(1) * 0.6, z = Z.face - 3.8 - r(2) * 1.4;
            const b = Math.floor(Song.beatAt(T) / 2 + r(3) * 4);
            out.push({ x, z, flip: (b + i) % 2 === 0, pose: Ink.hsh(i, b, 93) < 0.5 ? 'talk' : 'stand', seed: 400 + i });
        }
        return out;
    }

    // --- one frame of the street ----------------------------------------------------------------
    // o: { fx } from the section (beat colour for the party's windows)
    function frame(g, env, N, T, d, cam, o = {}) {
        if (!H) build();
        const fx = Film.effects(T);
        const sc = o.skyCam ?? cam, horizon = sc.p([sc.pos[0], 0, sc.pos[2] + 9000])[1];
        Ink.occlude(null);
        let L = N.light();
        Drawn.sky(g, sc, T, d, fx, env, horizon);
        Drawn.city(g, sc, T, d, fx, env);
        N.bloom(g, L, { strength: 0.35, core: 0.5 });
        L = N.light(); Ink.occlude(L);
        ground(g, L, cam, T, d, fx, env);
        // everything standing, far to near: hotels, palms, cars, people
        const items = [];
        const dist = (p) => cam.view(p)[2];
        // the hotels stand behind everything else in this set: first, the farthest along the street first
        for (const h of H) { const xn = Math.max(h.x0, Math.min(h.x1, cam.pos[0])); items.push({ depth: 1e5 + Math.hypot(xn - cam.pos[0], Z.face - cam.pos[2]), draw: () => hotel(g, L, cam, h, T, d, o) }); }
        for (let i = 0; i < 40; i++) { const x = -160 + i * 9 + Ink.hsh(i, 1, 5) * 3, z = 8.2 + Ink.hsh(i, 2, 5) * 1.6; items.push({ depth: dist([x, 4, z]), draw: () => palm(g, cam, x, 0.1, z, i + 1, T, d) }); }
        for (let i = 0; i < 26; i++) { const x = -150 + i * 13 + 6, z = Z.kerb + 0.9; items.push({ depth: dist([x, 4, z]), draw: () => lampPost(g, L, cam, x, z, d) }); }
        for (const c of CARS.concat(drivers(T))) items.push({ depth: dist([c.x, 0.7, c.z]), draw: () => car(g, L, cam, c, d) });
        const rimCols = [P.cyan, P.magenta];
        for (const w of walkers(T)) items.push({ depth: dist([w.x, 1, w.z]), draw: () => {
            const p = cam.p([w.x, 0.15, w.z]); if (p[2] < 1 || p[0] < -200 || p[0] > env.W + 200) return;
            OpeningFigures.draw(g, p[0], p[1], cam.f / p[2], { pose: w.pose, look: OpeningFigures.look(w.seed), flip: w.flip, seed: w.seed, d, rim: 1, cols: rimCols });
        } });
        items.sort((a, b) => b.depth - a.depth);
        for (const it of items) if (it.depth > 0.5) it.draw();
        Ink.occlude(null);
        N.bloom(g, L, { strength: 0.42, core: 0.55 });
        return fx;
    }

    // a street lamp of the period on the hotels' kerb: a post, a globe
    function lampPost(g, L, cam, x, z, d) {
        const b = cam.p([x, 0.15, z]), t = cam.p([x, 4.4, z]); if (t[2] < 1) return;
        const s = cam.f / t[2];
        Ink.shape(g, [[b[0] - 0.07 * s, b[1]], [t[0] - 0.05 * s, t[1]], [t[0] + 0.05 * s, t[1]], [b[0] + 0.07 * s, b[1]]], '#1a0450', { w: lw(s, 0.03), seed: Math.round(x * 3), d, jit: 0.3 });
        const r = 0.22 * s, pts = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; pts.push([t[0] + Math.cos(a) * r, t[1] - r + Math.sin(a) * r]); }
        Ink.shape(g, pts, P.cream, { w: lw(s, 0.03), seed: Math.round(x * 5), d, light: true });
        Neon.last.glint(null, L, t[0], t[1] - r, Math.max(4, 1.2 * s), hex(P.gold), { lightOnly: true, alpha: 0.5, halo: 1 });
    }

    window.OpeningStreet = { frame, Z, hotels: () => { if (!H) build(); return H; }, lit, tubes: () => TUBES };
})();
