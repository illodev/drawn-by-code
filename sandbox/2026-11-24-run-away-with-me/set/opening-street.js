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

    // is any of these world points on (or near) the screen, in front of the camera?
    function seen(cam, pts, m = 80) {
        let l = false, r = false, u = false, inF = false;
        for (const p of pts) { const q = cam.p(p); if (q[2] < 0.5) continue; inF = true; if (q[0] > -m) l = true; if (q[0] < cam.W + m) r = true; if (q[1] < cam.H + m) u = true; }
        return inF && l && r && u;
    }
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
            const xe = h.kind === 3 ? h.x1 - 2.8 : h.x1 - 0.4;                 // the rounded corner of the speed-line hotels
            add([[h.x0 + 0.4, h.h - 0.5, zf], [xe, h.h - 0.5, zf]], c1, 0.1);
            if (h.kind === 3) for (let i = 1; i <= 2; i++) add([[h.x0 + 0.4, h.h - 0.5 - i * 0.45, zf], [xe, h.h - 0.5 - i * 0.45, zf]], i % 2 ? c2 : c1, 0.07);
            // the first eyebrow, and every eyebrow on the speed-line hotels
            for (let f = 1; f <= h.floors; f++) if (f === 1 || h.kind === 3 || (h.party && f % 2 === 1)) add([[h.x0 + 0.6, 3.6 + (f - 1) * 3.1 + 2.55, zf - 0.75], [xe - 0.2, 3.6 + (f - 1) * 3.1 + 2.55, zf - 0.75]], f === 1 ? c2 : c1, 0.07);
            if (h.fin) {
                const fz = zf - 1.3;
                add([[cx - 0.75, 4.2, fz], [cx - 0.75, h.finH - 0.4, fz]], c2, 0.1); add([[cx + 0.75, 4.2, fz], [cx + 0.75, h.finH - 0.4, fz]], c2, 0.1);
                TUBES[TUBES.length - 1].fin = TUBES[TUBES.length - 2].fin = TUBES[TUBES.length - 1].edge = TUBES[TUBES.length - 2].edge = true;
                for (let y = 5.2; y < h.finH - 1.2; y += 1.6) { add([[cx - 0.5, y, fz - 0.02], [cx, y + 0.55, fz - 0.02], [cx + 0.5, y, fz - 0.02]], c1, 0.08); Object.assign(TUBES[TUBES.length - 1], { fin: true, y }); }
            }
            if (h.kind === 2) for (const px of [h.x0 + 3, h.x1 - 3]) { const pts = []; for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI * 2; pts.push([px + Math.cos(a) * 0.9, h.h - 2.4 + Math.sin(a) * 0.9, zf]); } add(pts, c2, 0.08, true); }
            // the canopy over the door
            add([[cx - 2.6, 3.4, Z.face - 3.2], [cx + 2.6, 3.4, Z.face - 3.2]], h.party ? P.magenta : c1, 0.09);
            // a neon shape between the top floors (no lettering anywhere)
            if (!h.fin) {
                const sx = h.kind === 2 ? cx - 2 : cx, sy = h.h - 3.6, zz = zf - 0.05, kind = h.seed % 5, P3 = (pts) => pts.map(([u, v]) => [sx + u, sy + v, zz]);
                if (kind === 0) { add(P3([[-0.9, 1.1], [0.9, 1.1], [0, 0.1], [-0.9, 1.1]]), c2, 0.07); add(P3([[0, 0.1], [0, -0.7], [-0.45, -0.8], [0.45, -0.8]]), c2, 0.07); add(P3([[0.35, 0.95], [0.55, 1.15], [0.75, 0.95], [0.55, 0.75], [0.35, 0.95]]), P.mint, 0.06); }
                else if (kind === 1) { const st = []; for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.45 : 1.1; st.push([Math.cos(a) * r, -Math.sin(a) * r]); } add(P3(st), c2, 0.07); }
                else if (kind === 2) { for (let r = 0; r < 2; r++) { const wv = []; for (let i = 0; i <= 24; i++) wv.push([-2.2 + i * 0.185, Math.sin(i * 0.55) * 0.3 - r * 0.55]); add(P3(wv), r ? c1 : c2, 0.07); } }
                else if (kind === 3) { add(P3([[0, -1.1], [0.1, -0.3], [0.05, 0.5], [0, 1.0]]), P.gold, 0.07); for (const a of [0.3, 1.1, 2.0, 2.8]) add(P3([[0, 1.0], [Math.cos(a) * 0.6, 1.0 + Math.sin(a) * 0.35], [Math.cos(a) * 1.0, 0.75 + Math.sin(a) * 0.2]]), P.mint, 0.06); }
                else { add(P3([[-0.2, -1.0], [-0.1, -0.2], [0.25, 0.3], [0.2, 0.8], [-0.1, 1.0], [-0.35, 0.8]]), P.pink, 0.07); add(P3([[-0.35, 0.8], [-0.6, 0.65]]), P.gold, 0.06); add(P3([[-0.1, -0.2], [-0.9, -0.3], [-1.2, -0.6], [-0.4, -0.55], [-0.1, -0.2]]), P.pink, 0.07); }
            }
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
        if (!seen(cam, [[h.x0, 0, zf], [h.x1, 0, zf], [h.x0, h.finH + 1, zf], [h.x1, h.finH + 1, zf], [h.x0, 0, zb], [h.x1, 0, zb]])) return;
        const s = cam.f / c0[2], W = lw(s, 0.07), sd = h.seed * 1000;
        const quad = (pts, col, o = {}) => { const q = Neon.poly(cam, pts); if (q) Ink.shape(g, q, col, { w: o.w ?? W, seed: sd + (o.k ?? 0), d, jit: o.jit ?? 0.5, light: o.light }); return q; };
        const shade = css(mix(body, '#1a0450', 0.45));
        // the side faces (into the block), darker; a speed-line hotel rounds its right corner
        const rc = h.kind === 3 ? 2.6 : 0, xr = h.x1 - rc;
        if (cam.pos[0] < h.x0) quad([[h.x0, 0, zf], [h.x0, 0, zb], [h.x0, h.h, zb], [h.x0, h.h, zf]], shade, { k: 1 });
        if (cam.pos[0] > h.x1) quad([[h.x1, 0, zf + rc], [h.x1, 0, zb], [h.x1, h.h, zb], [h.x1, h.h, zf + rc]], shade, { k: 2 });
        if (rc) for (let i = 0; i < 6; i++) {
            const a0 = (i / 6) * Math.PI / 2, a1 = ((i + 1) / 6) * Math.PI / 2, P0 = [xr + Math.sin(a0) * rc, zf + rc - Math.cos(a0) * rc], P1 = [xr + Math.sin(a1) * rc, zf + rc - Math.cos(a1) * rc];
            const nx = Math.sin((a0 + a1) / 2), nz = -Math.cos((a0 + a1) / 2); if ((cam.pos[0] - P0[0]) * nx + (cam.pos[2] - P0[1]) * nz <= 0) continue;
            quad([[P0[0], 0, P0[1]], [P0[0], h.h, P0[1]], [P1[0], h.h, P1[1]], [P1[0], 0, P1[1]]], css(mix(body, '#1a0450', 0.08 + i * 0.07)), { k: 5 + i, w: i === 5 ? W : 0, jit: 0 });
            for (let j = 0; j < 3; j++) { const yy = h.h - 1.4 - j * 0.45; quad([[P0[0], yy, P0[1] - 0.02], [P1[0], yy, P1[1] - 0.02], [P1[0], yy - 0.15, P1[1] - 0.02], [P0[0], yy - 0.15, P0[1] - 0.02]], trim, { w: 0, k: 60 + i * 3 + j, jit: 0 }); }
            for (let f = 1; f <= h.floors; f++) { const y0 = 3.6 + (f - 1) * 3.1 + 0.9, um = (P0[0] + P1[0]) / 2, vm = (P0[1] + P1[1]) / 2, dx = (P1[0] - P0[0]) * 0.3, dz = (P1[1] - P0[1]) * 0.3; quad([[um - dx, y0, vm - dz - 0.02], [um + dx, y0, vm + dz - 0.02], [um + dx, y0 + 1.3, vm + dz - 0.02], [um - dx, y0 + 1.3, vm - dz - 0.02]], (i + f) % 3 ? P.orange : '#1a0a4a', { k: 80 + i * 7 + f, w: lw(s, 0.03), light: (i + f) % 3 > 0 }); }
        }
        // the front, with a stepped crown on the stepped hotels
        let front = [[h.x0, 0, zf], [h.x0, h.h, zf], [xr, h.h, zf], [xr, 0, zf]];
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
        if (h.kind === 3 || h.party) for (let i = 0; i < 3; i++) quad([[h.x0, h.h - 1.4 - i * 0.45, zl], [xr, h.h - 1.4 - i * 0.45, zl], [xr, h.h - 1.55 - i * 0.45, zl], [h.x0, h.h - 1.55 - i * 0.45, zl]], trim, { w: 0, k: 20 + i, jit: 0 });
        // pilasters: a band at each end of the front (and beside the door bay), a shadow line on one side
        for (const [xa, xb] of [[h.x0, h.x0 + 0.75], [xr - 0.75, xr]].concat(h.fin ? [] : [[cx - 3.4, cx - 2.9], [cx + 2.9, cx + 3.4]])) {
            const q = quad([[xa, 3.6, zl - 0.01], [xb, 3.6, zl - 0.01], [xb, h.h - 0.2, zl - 0.01], [xa, h.h - 0.2, zl - 0.01]], css(mix(trim, body, 0.45)), { w: 0, k: 500 + Math.round(xa * 3), jit: 0 });
            if (q && s > 10) { const a = cam.p([xb, 3.7, zl - 0.02]), b = cam.p([xb, h.h - 0.3, zl - 0.02]); Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: lw(s, 0.04), col: shade, seed: sd + 510 + Math.round(xa * 3), d, taper: 0.05 }); }
        }
        if (h.kind === 1) for (const dx of [-3.2, -2.6, 2.6, 3.2]) quad([[cx + dx - 0.12, 3.8, zl], [cx + dx + 0.12, 3.8, zl], [cx + dx + 0.12, h.h - 0.3, zl], [cx + dx - 0.12, h.h - 0.3, zl]], trim, { w: 0, k: 30 + dx * 10, jit: 0 });
        // the porch: a dark band, openings lit gold, piers between them
        quad([[h.x0, 0, zl], [h.x0, 3.6, zl], [h.x1, 3.6, zl], [h.x1, 0, zl]], dark, { k: 4 });
        const nOp = Math.max(3, Math.round((h.x1 - h.x0) / 4.2)), opW = (h.x1 - h.x0 - 1) / nOp;
        for (let i = 0; i < nOp; i++) {
            const xa = h.x0 + 0.5 + i * opW + 0.35, xb = xa + opW - 0.7, door = Math.abs((xa + xb) / 2 - cx) < opW * 0.6;
            const warm = door ? P.gold : Ink.hsh(h.seed, i, 2) < 0.7 ? P.orange : P.salmon;
            const q = quad([[xa, 0.15, zl], [xa, door ? 3.0 : 2.7, zl], [xb, door ? 3.0 : 2.7, zl], [xb, 0.15, zl]], warm, { k: 40 + i, w: lw(s, 0.05), light: true });
            if (q) { const a = cam.p([xa + 0.2, 2.5, zl]), b = cam.p([xb - 0.2, 2.5, zl]); if (s > 14) Ink.hatch(g, [a[0], a[1]], [b[0], b[1]], { count: 3, len: cap(1.4 * s, 5, 50), w: cap(0.05 * s, 1, 3), col: P.cream, seed: sd + 50 + i, d, n: [0, 1], ang: 0.1, alpha: 0.6 }); }
            // a striped awning over the opening, its front edge scalloped
            if (!door && (h.kind === 1 || h.kind === 3 || h.kind === 2) && s > 6) {
                const zo = zf - 1.3, y0 = 3.15, y1 = 2.55, n = 6, cA = h.kind === 2 ? P.cyan : P.salmon, cB = P.cream;
                for (let j = 0; j < n; j++) { const u0 = xa - 0.1 + (xb - xa + 0.2) * (j / n), u1 = xa - 0.1 + (xb - xa + 0.2) * ((j + 1) / n); quad([[u0, y0, zf - 0.02], [u1, y0, zf - 0.02], [u1, y1, zo], [u0, y1, zo]], j % 2 ? cA : cB, { w: 0, k: 600 + i * 10 + j, jit: 0 }); }
                const sc = []; for (let j = 0; j <= n * 2; j++) { const u = xa - 0.1 + (xb - xa + 0.2) * (j / (n * 2)); sc.push(cam.p([u, y1 - (j % 2 ? 0.16 : 0), zo])); }
                if (sc.every((p) => p[2] > 0.5)) { Ink.brush(g, sc.map((p) => [p[0], p[1]]), { w: lw(s, 0.035), seed: sd + 650 + i, d, taper: 0.05 }); const e0 = cam.p([xa - 0.1, y0, zf - 0.02]), e1 = cam.p([xa - 0.1, y1, zo]); Ink.brush(g, [[e0[0], e0[1]], [e1[0], e1[1]]], { w: lw(s, 0.035), seed: sd + 660 + i, d, taper: 0.05 }); }
            }
        }
        // the street lamps' light on the facade: a fan of warm strokes up the wall from each lamp
        for (let li = 0; li < 26; li++) {
            const lx = -150 + li * 13 + 6; if (lx < h.x0 + 3.6 || lx > xr - 3.6 || s < 8) continue;
            for (let j = 0; j < 7; j++) {
                const a = -Math.PI / 2 + (j - 3) * 0.32, r0 = 0.6, r1 = 1.6 + Ink.hsh(li, j, 6) * 1.6, P0 = cam.p([lx + Math.cos(a) * r0, 4.6 - Math.sin(a) * r0, zl - 0.03]), P1 = cam.p([lx + Math.cos(a) * r1, 4.6 - Math.sin(a) * r1, zl - 0.03]);
                Ink.brush(g, [[P0[0], P0[1]], [P1[0], P1[1]]], { w: cap(0.06 * s, 1, 3.5), col: j % 2 ? P.gold : P.cream, seed: sd + 700 + li * 9 + j, d, taper: 0.6, alpha: 0.55, light: true });
            }
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
                if (h.party && f === h.floors && fx.beatCol && T >= 0.43) col = (i + Math.floor(Song.beatAt(T))) % 3 ? fx.beatCol : '#1a0a4a';
                if (xb > xr - 0.3) continue;
                // the frame round the window (a lighter reveal), the glass, a sill
                if (s > 9) quad([[xa - 0.12, y0 - 0.12, zl], [xa - 0.12, y1 + 0.1, zl], [xb + 0.12, y1 + 0.1, zl], [xb + 0.12, y0 - 0.12, zl]], css(mix(trim, body, 0.3)), { k: 90 + f * 40 + i, w: 0, jit: 0 });
                const dark0 = col === '#1a0a4a', q = quad([[xa, y0, zl], [xa, y1, zl], [xb, y1, zl], [xb, y0, zl]], col, { k: 100 + f * 40 + i, w: s > 14 ? lw(s, 0.035) : 0, light: !dark0 });
                if (!q) continue;
                if (!dark0 && s > 16) { L.save(); L.globalAlpha = 0.35; L.fillStyle = col; L.beginPath(); q.forEach((p, j) => (j ? L.lineTo(p[0], p[1]) : L.moveTo(p[0], p[1]))); L.closePath(); L.fill(); L.restore(); }
                if (s < 11) continue;
                const W2 = (u, v) => { const p = cam.p([xa + (xb - xa) * u, y0 + (y1 - y0) * v, zl - 0.01]); return [p[0], p[1]]; }, r2 = Ink.hsh(h.seed * 37 + f, i, 8);
                if (!dark0 && r2 < 0.35) for (let j = 1; j < 6; j++) Ink.brush(g, [W2(0.04, j / 6), W2(0.96, j / 6)], { w: cap(0.025 * s, 0.8, 2.2), col: css(mix(col, '#3a1050', 0.45)), seed: sd + f * 50 + i * 7 + j, d, taper: 0.1, wob: 0.2 });
                else if (!dark0 && r2 < 0.65) { Ink.shape(g, [W2(0, 0), W2(0, 1), W2(0.3, 1), W2(0.22, 0.5), W2(0.28, 0)], r2 < 0.5 ? P.salmon : P.plum, { w: 0, seed: sd + 800 + f * 40 + i, d, jit: 0.3 }); Ink.shape(g, [W2(1, 0), W2(1, 1), W2(0.7, 1), W2(0.78, 0.5), W2(0.72, 0)], r2 < 0.5 ? P.salmon : P.plum, { w: 0, seed: sd + 900 + f * 40 + i, d, jit: 0.3 }); }
                else if (!dark0 && r2 < 0.75 && s > 20) { const c = W2(0.45, 0.55), ss = cam.f / cam.view([xa, y0, zl])[2]; OpeningFigures.draw(g, c[0], c[1] + 0.8 * ss, ss, { pose: 'stand', look: OpeningFigures.look(h.seed * 50 + f * 9 + i), seed: h.seed * 50 + f * 9 + i, d, rim: 0, flip: false }); }
                // mullion and transom in the dark ink, a sill in the trim
                Ink.brush(g, [W2(0.5, 0), W2(0.5, 1)], { w: lw(s, 0.03), seed: sd + f * 7 + i, d, taper: 0.1 });
                if (s > 18) Ink.brush(g, [W2(0, 0.72), W2(1, 0.72)], { w: lw(s, 0.025), seed: sd + f * 9 + i, d, taper: 0.1 });
                quad([[xa - 0.15, y0 - 0.16, zl - 0.05], [xb + 0.15, y0 - 0.16, zl - 0.05], [xb + 0.15, y0 - 0.04, zl - 0.05], [xa - 0.15, y0 - 0.04, zl - 0.05]], trim, { w: 0, k: 950 + f * 40 + i, jit: 0 });
            }
            // the eyebrow: the shadow it throws on the wall, its underside, its edge in the trim
            const ye = y1 + 0.3;
            quad([[h.x0 + 0.5, ye - 0.45, zl - 0.01], [xr - 0.5, ye - 0.45, zl - 0.01], [xr - 0.5, ye, zl - 0.01], [h.x0 + 0.5, ye, zl - 0.01]], css(mix(body, '#0b0230', 0.55)), { k: 190 + f, w: 0, jit: 0 });
            quad([[h.x0 + 0.5, ye, zf], [xr - 0.5, ye, zf], [xr - 0.5, ye, zf - 0.8], [h.x0 + 0.5, ye, zf - 0.8]], css(mix(body, '#0b0230', 0.6)), { k: 200 + f, w: 0, jit: 0 });
            quad([[h.x0 + 0.5, ye, zf - 0.8], [xr - 0.5, ye, zf - 0.8], [xr - 0.5, ye + 0.22, zf - 0.8], [h.x0 + 0.5, ye + 0.22, zf - 0.8]], trim, { k: 220 + f, w: lw(s, 0.035) });
        }
        // portholes: round windows inside their neon rings
        if (h.kind === 2) for (const px of [h.x0 + 3, h.x1 - 3]) { const pts = []; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; pts.push([px + Math.cos(a) * 0.72, h.h - 2.4 + Math.sin(a) * 0.72, zl - 0.01]); } quad(pts, P.orange, { k: 980 + px, w: lw(s, 0.04), light: true }); const c = cam.p([px, h.h - 2.4, zl - 0.02]), l = cam.p([px, h.h - 1.68, zl - 0.02]); Ink.brush(g, [[c[0], l[1]], [c[0], 2 * c[1] - l[1]]], { w: lw(s, 0.03), seed: sd + 990 + px, d, taper: 0.1 }); }
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
        // the park: a path along it, pools of its lamps' light on the grass, grass in loose strokes
        strip(Z.parkKerb - 3.2, Z.parkKerb - 1.0, 0.11, '#3a1480', 'ppath');
        for (let i = 0; i < 26; i++) {
            const lx = PARK_LAMP(i); for (const [r, col] of [[3.2, '#3a1290'], [1.8, '#5a1aa8']]) { const pts = []; for (let j = 0; j < 20; j++) { const a = (j / 20) * Math.PI * 2; pts.push([lx + Math.cos(a) * r * 1.3, 0.115, Z.parkKerb - 1.6 + Math.sin(a) * r * 0.8]); } const q = Neon.poly(cam, pts); if (q) Ink.shape(g, q, col, { w: 0, seed: 'pp' + i + r, d, jit: 0 }); }
        }
        // grass in loose strokes on a grid fixed in the world, only round the camera when it stands in the park
        if (cam.pos[2] < Z.parkKerb) {
            const GC = [P.plum, P.purple, '#5a2aa8', P.grape, P.salmon], paths = GC.map(() => []);
            for (let gx = Math.floor(cam.pos[0] - 14); gx < cam.pos[0] + 14; gx += 0.55) for (let gz = Z.wall + 0.5; gz < Z.parkKerb - 0.3; gz += gz < 7 ? 0.35 : 0.7) {
                const ci = Math.round(gx * 10), cj = Math.round(gz * 10), x = gx + Ink.hsh(ci, cj, 1) * 0.9, z = gz + Ink.hsh(ci, cj, 2) * 0.7;
                if (z > Z.parkKerb - 3.2 && z < Z.parkKerb - 1.0) continue;
                const a = cam.p([x, 0.11, z]); if (a[2] < 0.8 || a[0] < -30 || a[0] > env.W + 30 || a[1] > env.H + 10) continue;
                const ln = 0.25 + Ink.hsh(ci, cj, 3) * 0.35, b = cam.p([x + ln, 0.11, z + 0.06]), sw = cam.f / a[2], j = (Ink.hsh(ci, cj, d % 4 + 10) - 0.5) * 0.02 * sw;
                paths[(ci + cj) % 5].push([a[0], a[1], (a[0] + b[0]) / 2 + j, (a[1] + b[1]) / 2 - 0.05 * sw, b[0], b[1], cap(0.03 * sw, 1, 4)]);
            }
            g.save(); g.lineCap = 'round'; g.globalAlpha = 0.85;
            paths.forEach((ps, i) => { g.strokeStyle = GC[i]; for (const [x0, y0, x1, y1, x2, y2, w] of ps) { g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x1, y1, x2, y2); g.stroke(); } });
            g.restore();
        }
        // a clipped hedge along the park's walk: lumps with a dark base, leaf ticks, light on top
        for (let hx = Math.floor((cam.pos[0] - 40) / 1.6) * 1.6; hx < cam.pos[0] + 60; hx += 1.6) {
            const z = Z.parkKerb - 3.5, b = cam.p([hx, 0.11, z]), t = cam.p([hx, 0.9, z]); if (b[2] < 1 || b[0] < -80 || b[0] > env.W + 80) continue;
            const sw = cam.f / b[2], w = 0.95 * sw, hh = b[1] - t[1], pts = [[b[0] - w, b[1]]];
            for (let i = 0; i <= 12; i++) { const u = i / 12, a = Math.PI * (1 - u); pts.push([b[0] + Math.cos(a) * w, b[1] - hh * (0.25 + 0.75 * Math.sin(a)) - Math.sin(u * Math.PI * 4 + hx) * hh * 0.1]); }
            pts.push([b[0] + w, b[1]]);
            Ink.shape(g, pts, Math.round(hx / 1.6) % 2 ? P.royal : '#4a10c8', { w: lw(sw, 0.03), seed: 'hg' + hx, d, jit: 0.4 });
            if (sw > 20) for (let i = 0; i < 4; i++) { const u = (i + 0.5) / 4, x = b[0] - w * 0.7 + w * 1.4 * u, y = b[1] - hh * (0.75 + 0.2 * Math.sin(u * Math.PI)); Ink.brush(g, [[x - 0.12 * sw, y + 0.03 * sw], [x + 0.12 * sw, y]], { w: cap(0.03 * sw, 1, 3), col: i % 2 ? P.cyan : P.pink, seed: 'hl' + hx + i, d, taper: 0.5, light: true }); }
        }
        // the park's coral wall along the beach
        { const pts = xs.map((x) => [x, 0.9, Z.wall]).concat(xs.slice().reverse().map((x) => [x, -0.4, Z.wall])); const q = Neon.poly(cam, pts); if (q) Ink.shape(g, q, P.plum, { w: 2.4, seed: 'pwall', d, jit: 0 }); }
        strip(Z.kerb, Z.face, 0, '#1a0670', 'under');                     // the road runs on under the kerb
        const road = strip(Z.parkKerb, Z.kerb, 0, '#1a0670', 'road');
        // on the wet road (clipped to it): the lane paint, a crosswalk at the party hotel, manholes,
        // and every light of the street mirrored as broken vertical strokes in its colour
        if (road) {
            g.save(); g.beginPath(); road.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.clip();
            const flat = (pts, col, k, light = true) => { const q = Neon.poly(cam, pts); if (q) Ink.shape(g, q, col, { w: 0, seed: k, d, jit: 0, light }); return q; };
            for (let x = -200; x < 240; x += 9) flat([[x, 0.01, 19.03], [x + 3, 0.01, 19.03], [x + 3, 0.01, 19.17], [x, 0.01, 19.17]], '#e8b04a', 'lane' + x);
            for (const z of [13.2, 24.8]) flat(xs.map((x) => [x, 0.01, z - 0.06]).concat(xs.slice().reverse().map((x) => [x, 0.01, z + 0.06])), '#9a86d0', 'edge' + z);
            const ph = H.find((h) => h.party), pcx = (ph.x0 + ph.x1) / 2;
            for (let z = 13.0; z < 25; z += 1.1) flat([[pcx - 1.6, 0.012, z], [pcx + 1.6, 0.012, z], [pcx + 1.6, 0.012, z + 0.55], [pcx - 1.6, 0.012, z + 0.55]], '#c8b8f0', 'zebra' + z);
            for (const [mx, mz] of [[pcx - 21, 16.2], [pcx + 15, 22.3], [-68, 17.4], [-44, 21.6], [36, 16.4]]) {
                const ring = []; for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; ring.push([mx + Math.cos(a) * 0.36, 0.012, mz + Math.sin(a) * 0.36]); }
                const q = Neon.poly(cam, ring); if (!q) continue;
                Ink.shape(g, q, '#0b0230', { w: 1.4, ink: '#5a3aa0', seed: 'mh' + mx, d, jit: 0.2 });
                const c = cam.p([mx, 0.012, mz]); if (c[2] > 1) { const r = 0.36 * cam.f / c[2]; Ink.brush(g, [[c[0] - r * 0.6, c[1] - r * 0.05], [c[0] + r * 0.2, c[1] - r * 0.12]], { w: cap(0.02 * cam.f / c[2], 1, 2.5), col: P.pink, seed: 'mhl' + mx, d, taper: 0.4, light: true }); }
            }
            // the reflections: from the foot of each light straight down the wet road, stretched,
            // broken into dashes that waver (cheap canvas strokes; the far ones are a few pixels)
            const streak = (src, col, wm, a, seed) => {
                const foot = cam.p([src[0], 0, src[2]]), mir = cam.p([src[0], -src[1], src[2]]);
                if (foot[2] < 1 || mir[2] < 1 || foot[2] > 320 || foot[0] < -60 || foot[0] > env.W + 60) return;
                const sp = cam.f / foot[2], len = (mir[1] - foot[1]) * 1.7 + 0.3 * sp, w = cap(wm * sp, 0.8, 14);
                g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round';
                for (let j = 0; j < 5; j++) {
                    const u0 = j / 5 + Ink.hsh(seed, j, 1) * 0.07, u1 = u0 + (0.45 + 0.4 * Ink.hsh(seed, j, 2)) / 5;
                    const wob = Ink.noise(seed * 3 + j, T * 1.6, 0) * w * 0.7, x0 = foot[0] + (mir[0] - foot[0]) * u0 * 0.6 + wob;
                    g.globalAlpha = a * (1 - j * 0.15); g.beginPath(); g.moveTo(x0, foot[1] + len * u0); g.lineTo(x0 + wob * 0.3, foot[1] + len * u1); g.stroke();
                }
                g.globalAlpha = 1;
            };
            let sd = 1;
            for (const t of TUBES) { const on = lit(t, T); if (on <= 0) continue; const n = Math.min(4, t.pts.length + 1); for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, k = Math.min(t.pts.length - 2, Math.floor(u * (t.pts.length - 1))), f = u * (t.pts.length - 1) - k, A = t.pts[k], B2 = t.pts[k + 1]; streak([A[0] + (B2[0] - A[0]) * f, A[1] + (B2[1] - A[1]) * f, A[2]], t.col, 0.12, 0.65 * on, sd++); } }
            for (const h of H) {
                if (Math.abs((h.x0 + h.x1) / 2 - cam.pos[0]) > 170) continue;
                const cw = (h.x1 - h.x0 - 2) / h.cols, xr = h.x1 - (h.kind === 3 ? 2.6 : 0);
                for (let f = 1; f <= h.floors; f++) for (let i = 0; i < h.cols; i++) {
                    const xm = h.x0 + 1 + i * cw + cw * 0.5, r = Ink.hsh(h.seed * 31 + f, i, 4); if (r >= 0.62 || xm > xr - 0.6) continue;
                    streak([xm, 3.6 + (f - 1) * 3.1 + 1.5, Z.face], r < 0.42 ? P.orange : r < 0.55 ? P.gold : P.salmon, 0.4, 0.4, sd++);
                }
                const nOp = Math.max(3, Math.round((h.x1 - h.x0) / 4.2)), opW = (h.x1 - h.x0 - 1) / nOp;
                for (let i = 0; i < nOp; i++) streak([h.x0 + 0.5 + (i + 0.5) * opW, 1.5, Z.face], i % 2 ? P.gold : P.orange, 0.9, 0.45, sd++);
            }
            for (let i = 0; i < 26; i++) streak([-150 + i * 13 + 6, 4.2, Z.kerb + 0.9], P.gold, 0.3, 0.6, 500 + i);
            for (let i = 0; i < 26; i++) streak([PARK_LAMP(i), 4.2, Z.parkKerb - 0.6], P.gold, 0.3, 0.6, 540 + i);
            for (const c of drivers(T)) for (const end of [-1, 1]) { const front = end === c.dir; for (const dz of [-0.62, 0.62]) streak([c.x + end * 2.46, 0.7, c.z + dz], front ? P.cream : P.red, 0.25, front ? 0.8 : 0.7, 700 + Math.round(c.x) + end * 3 + dz * 5); }
            g.restore();
        }
        // the kerb faces, standing between the road and the walks
        for (const [z, hgt, k] of [[Z.kerb, 0.15, 'kf1'], [Z.parkKerb, 0.12, 'kf2']]) { const pts = xs.map((x) => [x, hgt, z]).concat(xs.slice().reverse().map((x) => [x, 0, z])); const q = Neon.poly(cam, pts); if (q) Ink.shape(g, q, P.grape, { w: 0, seed: k, d, jit: 0 }); }
        strip(Z.kerb, Z.face, 0.15, '#3a1080', 'walk');
        // the kerb lines
        for (const z of [Z.parkKerb, Z.kerb]) { const E = xs.map((x) => cam.p([x, 0.13, z])).filter((p) => p[2] > 0.5).map((p) => [p[0], p[1]]); if (E.length > 1) Ink.brush(g, E, { w: 2.2, seed: 'kl' + z, d, taper: 0.02 }); }
        // the kerbs' top edges catch the street's light: broken strokes, pink on the hotels' side, cyan on the park's
        for (const [z, y0, col] of [[Z.kerb, 0.15, P.pink], [Z.parkKerb, 0.12, P.cyan]]) for (let x = -200; x < 240; x += 4) {
            if (Ink.hsh(x, 3, 3) < 0.3) continue;
            const a = cam.p([x, y0 + 0.01, z + 0.04]), b = cam.p([x + 2.6, y0 + 0.01, z + 0.04]); if (a[2] < 1 || b[2] < 1 || Math.max(a[0], b[0]) < -20 || Math.min(a[0], b[0]) > env.W + 20) continue;
            Ink.brush(g, [[a[0], a[1]], [b[0], b[1]]], { w: cap(0.05 * cam.f / a[2], 1, 3), col, seed: 'ke' + x + z, d, taper: 0.4, alpha: 0.7, light: true });
        }
    }

    // --- palms (the causeway's palm, standing on flat ground) -----------------------------------
    function palm(g, cam, x, yb, z, seed, T, d) {
        const R = Motion.rng('opalm' + seed), H = 9 + R() * 4, lean = (R() - 0.5) * 1.2;
        const top = cam.p([x + lean, yb + H, z]); if (top[2] < 0.6) return;
        if (!seen(cam, [[x - 5, yb, z], [x + 5, yb, z], [x - 5, yb + H + 2, z], [x + 5, yb + H + 2, z]])) return;
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
        if (!seen(cam, [[x - Lh, 0, z - Wh], [x + Lh, 0, z + Wh], [x - Lh, 1.5, z + Wh], [x + Lh, 1.5, z - Wh]])) return;
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
        { x: -76, z: 24.2, dir: 1, col: '#f45a7f' }, { x: -64, z: 24.2, dir: 1, col: '#f4ecd8' }, { x: -55, z: 24.2, dir: 1, col: '#c25fd0' },
        { x: -55, z: 13.8, dir: -1, col: '#9a7ae8' }, { x: -42, z: 13.8, dir: -1, col: '#f9a07a' }, { x: -24, z: 13.8, dir: -1, col: '#3fb8c0' }, { x: 18, z: 13.8, dir: -1, col: '#f4ecd8' },
    ];
    // the cars driving: one each way, cruising at walking-plus speeds (the strip at night)
    const drivers = (T) => [
        { x: -60 + (T - 0) * 9.5, z: 17, dir: 1, col: '#f4ecd8', moving: true },
        { x: 95 - (T - 0) * 8.0, z: 21.2, dir: -1, col: '#e86ad0', moving: true },
        { x: -96 + (T - 4.9) * 12, z: 18.3, dir: 1, col: '#3fb8c0', moving: true },
        { x: 120 - (T - 4.4) * 10, z: 21.6, dir: -1, col: '#f4ecd8', moving: true },
        { x: 62 - (T - 4.4) * 9, z: 21.6, dir: -1, col: '#f9a07a', moving: true },
    ];

    // --- people on the sidewalks: walkers on twos, couples, people walking dogs, groups talking --
    const walkPh = (T, r) => Math.floor((T * 12 + r * 12) / 3) % 4;
    function walkers(T) {
        const out = [], span = 340, wrap = (x) => ((x + 150) % span + span) % span - 150;
        for (let i = 0; i < 40; i++) {
            const r = (k) => Ink.hsh(i, k, 91), far = r(1) < 0.62, dir = r(2) < 0.5 ? 1 : -1, v = 1.05 + r(3) * 0.5;
            const z = far ? Z.kerb + 1.2 + r(4) * 2.8 : Z.parkKerb - 1.2 - r(4) * 1.6, x = wrap(-150 + r(5) * span + dir * v * T), ph = walkPh(T, r(6));
            const kind = r(7) < 0.22 ? 'couple' : r(7) < 0.3 ? 'dog' : 'one';
            out.push({ x, z, flip: dir < 0, pose: (kind === 'dog' ? 'wd' : 'w') + ph, seed: 300 + i, dog: kind === 'dog' ? { dir, ph } : null });
            if (kind === 'couple') out.push({ x: x - dir * 0.15, z: z + (far ? -0.55 : 0.55), flip: dir < 0, pose: 'w' + ((ph + 2) % 4), seed: 360 + i });
        }
        // groups standing at doors, turning to talk on the beat
        const groups = [[-3.5, 7], [-62, 3], [41, 4], [-30, 3]];
        let n = 0;
        for (const [gx, cnt] of groups) for (let i = 0; i < cnt; i++, n++) {
            const r = (k) => Ink.hsh(n, k, 92), x = gx + i * 1.05 + r(1) * 0.5, z = Z.face - 3.6 - r(2) * 1.6;
            const b = Math.floor(Song.beatAt(T) / 2 + r(3) * 4);
            out.push({ x, z, flip: (b + i) % 2 === 0, pose: Ink.hsh(n, b, 93) < 0.5 ? 'talk' : 'stand', seed: 400 + n });
        }
        return out;
    }
    // café terraces on the sidewalk in front of a few hotels: round tables under striped
    // umbrellas, a candle on each, people sitting at them
    let CAFES = null;
    function cafes() {
        if (CAFES) return CAFES;
        CAFES = [];
        for (const h of H) {
            if (h.party || h.seed % 3 !== 1) continue;
            const cx = (h.x0 + h.x1) / 2;
            for (let x = h.x0 + 2; x < h.x1 - 2; x += 2.9) if (Math.abs(x - cx) > 2.2) for (const z of [27.4, 28.9]) if (Ink.hsh(Math.round(x * 10), z, 5) < 0.8) CAFES.push({ x, z, seed: CAFES.length + 1, col: [P.salmon, P.cyan, P.pink, P.mint][(h.seed + CAFES.length) % 4] });
        }
        return CAFES;
    }
    function cafe(g, L, cam, c, T, d) {
        const pc = cam.p([c.x, 0.75, c.z]); if (pc[2] < 1.5 || !seen(cam, [[c.x - 1.3, 0, c.z], [c.x + 1.3, 0, c.z], [c.x - 1.3, 2.5, c.z], [c.x + 1.3, 2.5, c.z]])) return;
        const s = cam.f / pc[2], W = lw(s, 0.035), ring = (r, y, n = 16) => { const o = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; o.push([c.x + Math.cos(a) * r, y, c.z + Math.sin(a) * r]); } return o; };
        // the people behind the table, the table, the people in front of it
        const sitter = (dz, k) => { const p = cam.p([c.x + (k ? 0.12 : -0.15), 0.15, c.z + dz]); if (p[2] < 1) return; const b = Math.floor(Song.beatAt(T) / 2 + k * 2 + c.seed); OpeningFigures.draw(g, p[0], p[1], cam.f / p[2], { pose: Ink.hsh(c.seed, b + k, 4) < 0.35 ? 'sitDrink' : 'sit', look: OpeningFigures.look(700 + c.seed * 2 + k), seed: 700 + c.seed * 2 + k, d, rim: 1, flip: k === 1 }); };
        const behind = cam.pos[2] < c.z ? 0.55 : -0.55;
        sitter(behind, 0);
        const leg0 = cam.p([c.x, 0.15, c.z]), leg1 = cam.p([c.x, 0.75, c.z]); Ink.brush(g, [[leg0[0], leg0[1]], [leg1[0], leg1[1]]], { w: cap(0.06 * s, 1, 5), seed: 'tl' + c.seed, d, taper: 0.05 });
        const top = Neon.poly(cam, ring(0.42, 0.75)); if (top) Ink.shape(g, top, P.cream, { w: W, seed: 'tt' + c.seed, d, jit: 0.3 });
        const cn = cam.p([c.x, 0.82, c.z]); Neon.last.glint(g, L, cn[0], cn[1], cap(0.12 * s, 2, 14), hex(P.gold), { alpha: 0.85 });
        // the umbrella: a pole and a striped cone, its triangles far to near, a scalloped hem
        const p0 = cam.p([c.x, 0.75, c.z]), p1 = cam.p([c.x, 2.4, c.z]); Ink.brush(g, [[p0[0], p0[1]], [p1[0], p1[1]]], { w: cap(0.04 * s, 1, 4), seed: 'up' + c.seed, d, taper: 0.05 });
        const rim = ring(1.15, 2.0, 12), apex = [c.x, 2.45, c.z], tris = [];
        for (let i = 0; i < 12; i++) { const a = rim[i], b = rim[(i + 1) % 12]; tris.push({ pts: [apex, a, b], i, dep: cam.view([(a[0] + b[0]) / 2, 2.1, (a[2] + b[2]) / 2])[2] }); }
        tris.sort((a, b) => b.dep - a.dep);
        for (const t of tris) { const q = Neon.poly(cam, t.pts); if (q) Ink.shape(g, q, t.i % 2 ? c.col : P.cream, { w: lw(s, 0.025), seed: 'um' + c.seed + '-' + t.i, d, jit: 0.3 }); }
        sitter(-behind, 1);
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
        for (let i = 0; i < 26; i++) { const x = PARK_LAMP(i), z = Z.parkKerb - 0.6; items.push({ depth: dist([x, 4, z]), draw: () => lampPost(g, L, cam, x, z, d) }); }
        const pcx = (H.find((h) => h.party).x0 + H.find((h) => h.party).x1) / 2;
        for (const c of CARS.filter((c) => Math.abs(c.x - pcx) > 9 && c.x > -70).concat(drivers(T))) items.push({ depth: dist([c.x, 0.7, c.z]), draw: () => car(g, L, cam, c, d) });
        const rimCols = [P.cyan, P.magenta];
        for (const w of walkers(T)) items.push({ depth: dist([w.x, 1, w.z]), draw: () => {
            const p = cam.p([w.x, 0.15, w.z]); if (p[2] < 1 || p[0] < -200 || p[0] > env.W + 200) return;
            const sp = cam.f / p[2], lk = OpeningFigures.look(w.seed);
            OpeningFigures.draw(g, p[0], p[1], sp, { pose: w.pose, look: lk, flip: w.flip, seed: w.seed, d, rim: 1, cols: rimCols });
            if (w.dog) { const k = lk.height / 1.75, hand = cam.p([w.x + w.dog.dir * 0.3 * k, 0.15 + 1.0 * k, w.z]), dp = cam.p([w.x + w.dog.dir * 1.0, 0.15, w.z - 0.1]); if (dp[2] > 1) OpeningFigures.dog(g, dp[0], dp[1], cam.f / dp[2], { flip: w.dog.dir < 0, phase: w.dog.ph, d, seed: w.seed * 3, lead: [hand[0], hand[1]] }); }
        } });
        for (const c of cafes()) items.push({ depth: dist([c.x, 1, c.z]), draw: () => cafe(g, L, cam, c, T, d) });
        items.sort((a, b) => b.depth - a.depth);
        for (const it of items) if (it.depth > 0.5) it.draw();
        Ink.occlude(null);
        N.bloom(g, L, { strength: 0.42, core: 0.55 });
        return fx;
    }

    const PARK_LAMP = (i) => -150 + i * 13;
    // a street lamp of the period on the hotels' kerb: a post, a globe
    function lampPost(g, L, cam, x, z, d) {
        const b = cam.p([x, 0.15, z]), t = cam.p([x, 4.4, z]); if (t[2] < 1 || t[0] < -60 || t[0] > cam.W + 60) return;
        const s = cam.f / t[2];
        Ink.shape(g, [[b[0] - 0.07 * s, b[1]], [t[0] - 0.05 * s, t[1]], [t[0] + 0.05 * s, t[1]], [b[0] + 0.07 * s, b[1]]], '#1a0450', { w: lw(s, 0.03), seed: Math.round(x * 3), d, jit: 0.3 });
        const r = 0.22 * s, pts = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; pts.push([t[0] + Math.cos(a) * r, t[1] - r + Math.sin(a) * r]); }
        Ink.shape(g, pts, P.cream, { w: lw(s, 0.03), seed: Math.round(x * 5), d, light: true });
        Neon.last.glint(null, L, t[0], t[1] - r, Math.max(4, 1.2 * s), hex(P.gold), { lightOnly: true, alpha: 0.5, halo: 1 });
    }

    window.OpeningStreet = { frame, Z, hotels: () => { if (!H) build(); return H; }, lit, tubes: () => TUBES };
})();
