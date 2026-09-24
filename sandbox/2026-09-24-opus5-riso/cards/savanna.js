// Card «savanna» (reference 13.75–13.875 s, full frame). An umbrella pine and two cypresses
// in silhouette against a sunset over a striped field: yellow printed flat over the whole card,
// the reference's own pink screen (12.96 px, 78°) turning the sky red at the top and thinning
// to bare yellow round the glow low on the right, a murmuration cloud (three linked loops of
// olive specks), red streaks, birds, a dark hedge line, and a field of blue screen (9.72 px,
// 18°) with yellow furrow crests converging on a vanishing point. Everything measured on the
// 13.75 s frame in reference px (1080 = 1000 units): colour-run scans for the silhouettes,
// ink coverages fitted on 90 × 54 px blocks, lattices fitted per drawing.
// Needs cards/_g6-util.js.
var CARDS = CARDS || {};
CARDS.savanna = (press, t) => {
    const T = Riso.tone, U = G6;
    const pink = press.plate('pink'), blue = press.plate('blue'), navy = press.plate('navy'), yellow = press.plate('yellow');
    const d = Math.min(1, Math.floor(t * 12 + 1e-6));
    const px = (v) => v / 1.08, P = (pts) => pts.map(([x, y]) => [x / 1.08, y / 1.08]);
    const vramp = (g, y0, y1, stops) => { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([f, v]) => gr.addColorStop(f, T(v))); return gr; };
    // the second drawing is the same print moved (-4, 1.5) px (both screens' phases shift by it)
    press.save();
    if (d === 1) press.each((g) => g.translate(px(-4.1), px(1.5)));

    // yellow flat over everything
    yellow.fillStyle = T(1); yellow.fillRect(-20, -20, 1040, 1040);

    // the sky's pink screen: coverage 0.95 at the top, 0.6 at a third, 0.44 low down; bare in
    // a flattened glow round (745, 690) px
    const LP = { o: [0.52, -6.15], a: [2.6984, 12.6783], b: [-12.6751, 2.6956] };
    U.lattice(pink, LP, (m) => {
        m.fillStyle = vramp(m, 0, px(880), [[0, 0.97], [0.12, 0.9], [0.26, 0.74], [0.37, 0.64], [0.49, 0.49], [0.7, 0.46], [0.88, 0.44], [1, 0.44]]);
        m.fillRect(-20, -20, 1040, px(900));
        m.globalCompositeOperation = 'destination-out'; m.fillStyle = T(0.8); m.fillRect(-20, px(845), 1040, 400); m.globalCompositeOperation = 'source-over';
        // the glow low in the sky: the pink thins to nothing in a wide flat ellipse round
        // (760, 690) px (coverage 0.0–0.2 over x 600–900, y 590–760), and along the horizon
        // behind the tree (0.2–0.35 at y 700–790, x 180–600)
        m.globalCompositeOperation = 'destination-out';
        const gl = m.createRadialGradient(0, 0, 0, 0, 0, 1);
        gl.addColorStop(0, T(0.9)); gl.addColorStop(0.45, T(0.8)); gl.addColorStop(0.75, T(0.5)); gl.addColorStop(1, T(0));
        m.save(); m.translate(px(760), px(690)); m.scale(px(390), px(200)); m.fillStyle = gl; m.beginPath(); m.arc(0, 0, 1, 0, 7); m.fill(); m.restore();
        m.save(); m.translate(px(420), px(760)); m.scale(px(330), px(55)); m.fillStyle = gl; m.globalAlpha = 0.6; m.beginPath(); m.arc(0, 0, 1, 0, 7); m.fill(); m.restore();
    });

    // the murmuration: three linked loops of specks (dense rims ~45 px wide, sparse insides);
    // each speck a tiny tapered dash (a bird at that distance), navy with a little blue: olive
    // on the red sky. Rim centre-lines measured on a speck-density map (15 × 20 px cells).
    const loops = [
        [[20, 200], [10, 130], [45, 70], [110, 42], [200, 40], [270, 70], [300, 120], [270, 175], [200, 205], [100, 212]],
        [[390, 190], [480, 168], [580, 180], [640, 230], [690, 300], [690, 370], [620, 400], [520, 405], [440, 395], [405, 320]],
        [[795, 200], [880, 160], [980, 135], [1075, 125], [1085, 260], [1060, 360], [980, 395], [860, 395], [795, 360], [785, 280]],
    ];
    const fills = [0.004, 0.009, 0.008];
    const bridges = [[[270, 110], [320, 140], [380, 165], [440, 175]], [[600, 395], [700, 393], [800, 392], [900, 390], [975, 385]]];
    const rs = Motion.rng('svmur');
    const smoothPts = (pts, closed) => {
        const out = [], n = pts.length;
        for (let i = 0; i < (closed ? n : n - 1); i++) {
            const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
            for (let k = 0; k < 8; k++) {
                const s = k / 8, s2 = s * s, s3 = s2 * s;
                out.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * s + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * s2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * s3)));
            }
        }
        return out;
    };
    const specks = [];
    const along = (pts, closed, per, spread) => {
        const sp = smoothPts(pts, closed);
        for (let i = 0; i < sp.length - (closed ? 0 : 1); i++) {
            const [x0, y0] = sp[i], [x1, y1] = sp[(i + 1) % sp.length], L = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
            const n = Math.round(L * per);
            for (let k = 0; k < n; k++) { const f = rs(), o = (rs() + rs() + rs() + rs() - 2) * spread; specks.push([x0 + (x1 - x0) * f + nx * o, y0 + (y1 - y0) * f + ny * o]); }
        }
        return sp;
    };
    const rims = loops.map((l) => along(l, true, 3.4, 27));
    bridges.forEach((br) => along(br, false, 2.6, 22));
    // the insides: sparse
    rims.forEach((sp, li) => {
        const xs = sp.map((p) => p[0]), ys = sp.map((p) => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
        const n = Math.round((x1 - x0) * (y1 - y0) * fills[li]);
        for (let k = 0; k < n; k++) specks.push([x0 + rs() * (x1 - x0), y0 + rs() * (y1 - y0), sp]);
    });
    const inside = (p, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c; } return c; };
    // each speck is a little bird: a curved comma 5–9 px long. Measured at 3×, about half
    // are bright green (the pink knocked out under them, blue over the yellow) and half dark
    // olive (navy); under the band a faint olive haze (navy screen).
    const r2 = Motion.rng('svmur2'), green = new Path2D(), dark = new Path2D();
    for (const sp of specks) {
        if (sp[2] && !inside(sp, sp[2])) continue;
        const a = r2() * 6.28, len = 2.8 + r2() * 2.6, w = 1.6 + r2() * 1.2, bend = (r2() - 0.5) * 3, ca = Math.cos(a), sa = Math.sin(a);
        const x = px(sp[0]), y = px(sp[1]), q = r2() < 0.6 ? green : dark;
        q.moveTo(x - ca * len, y - sa * len);
        q.quadraticCurveTo(x - sa * (w + bend), y + ca * (w + bend), x + ca * len, y + sa * len);
        q.quadraticCurveTo(x + sa * (w - bend) * 0.2, y - ca * (w - bend) * 0.2, x - ca * len, y - sa * len);
    }
    pink.save(); pink.globalCompositeOperation = 'destination-out'; pink.fillStyle = T(1); pink.fill(green); pink.restore();
    blue.fillStyle = T(0.95); blue.fill(green);
    navy.fillStyle = T(0.85); navy.fill(dark); blue.fillStyle = T(0.4); blue.fill(dark);
    { const hz = press.plate('navy', 'screen'); hz.save(); hz.strokeStyle = T(0.08); hz.lineWidth = px(62); hz.lineJoin = 'round'; for (const sp of rims) { hz.beginPath(); P(sp).forEach(([x, y], i) => (i ? hz.lineTo(x, y) : hz.moveTo(x, y))); hz.closePath(); hz.stroke(); } hz.restore(); }

    // red streak clouds low on the right: pink brush lines over the yellow (739–771, 793–809 px)
    const streak = (x0, x1, y0, y1, w, seed) => {
        const r = Motion.rng('svst' + seed), top = [], bot = [];
        for (let i = 0; i <= 24; i++) { const f = i / 24, x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f + Math.sin(f * 9 + seed) * 1.2, hw = w * Math.sin(Math.PI * Math.min(1, f * 1.15)) ** 0.6 * (0.8 + 0.4 * r()); top.push([x, y - hw]); bot.unshift([x, y + hw]); }
        U.poly(pink, P([...top, ...bot]), T(0.95));
    };
    // (measured: the upper streak 6–8 px thick, 410→965 px, falling 30 px; a thin one inside it;
    // the lower 5 px thick, 590→945)
    streak(405, 965, 738, 772, 4.2, 1); streak(470, 760, 750, 761, 1.8, 2); streak(588, 948, 794, 810, 3.2, 3); streak(700, 900, 781, 786, 1.2, 4);
    // six swallows on the right (dark-blob bounding boxes on the 13.75 s frame): swept wings,
    // forked tails, dark olive (navy over the yellow, the pink knocked out under them)
    const birds = [[1063, 428, 40, 2.3, 1], [1024, 484, 26, 2.6, -0.5], [981, 551, 32, 2.2, 0.5], [1066, 606, 48, 2.0, 1], [937, 628, 36, 2.4, -0.2], [884, 481, 13, 2.8, 0]];
    const bp = new Path2D();
    for (const [x, y, sz, a, w] of birds) { const q = P(U.swallow(x, y, sz, a, w)); q.forEach(([bx, by], i) => (i ? bp.lineTo(bx, by) : bp.moveTo(bx, by))); bp.closePath(); }
    pink.save(); pink.globalCompositeOperation = 'destination-out'; pink.fillStyle = T(1); pink.fill(bp); pink.restore();
    navy.fillStyle = T(0.9); navy.fill(bp); blue.fillStyle = T(0.5); blue.fill(bp);

    // silhouettes: one flat dark olive-brown (fitted: navy 0.66, blue 0.75, pink 0.35 over the
    // yellow). Every shape goes into one Path2D and is filled once per plate, so overlaps
    // (a cypress over the hedge) don't print darker.
    const silP = new Path2D();
    const add = (pts) => { P(pts).forEach(([x, y], i) => (i ? silP.lineTo(x, y) : silP.moveTo(x, y))); silP.closePath(); };
    // hedge: top and bottom edges measured every 30 px; the top a run of small rounded bushes
    const hedgeTop = [[-10, 780], [30, 785], [90, 796], [180, 797], [210, 810], [240, 806], [270, 814], [300, 818], [330, 808], [360, 805], [420, 809], [480, 816], [510, 823], [540, 816], [570, 812], [630, 819], [690, 832], [750, 825], [810, 831], [870, 832], [930, 838]];
    const hedgeBot = [[945, 880], [900, 876], [780, 872], [640, 868], [600, 861], [540, 859], [480, 854], [390, 851], [300, 846], [210, 842], [120, 839], [30, 832], [-10, 831]];
    const rh = Motion.rng('svhedge');
    const bumpy = (pts, amp) => { const out = []; for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(1, Math.round(Math.abs(x1 - x0) / 7)); for (let k = 0; k < n; k++) { const f = k / n, x = x0 + (x1 - x0) * f; out.push([x, y0 + (y1 - y0) * f + (rh() - 0.5) * amp * 0.5 - Math.abs(Math.sin(x / 13 + Math.sin(x / 41))) * amp]); } } out.push(pts[pts.length - 1]); return out; };
    add([...bumpy(hedgeTop, 7), ...hedgeBot]);
    // the bush on the right: a lumpy mass of scallop-edged clumps (bbox 935–1080 × 758–886 px)
    for (const [cx, cy, rx, ry, sd] of [[985, 812, 48, 40, 1], [1030, 790, 50, 36, 2], [1070, 795, 30, 40, 3], [960, 850, 30, 32, 4], [1020, 850, 70, 38, 5], [1000, 775, 26, 18, 6]]) add(U.scallop(cx, cy, rx, ry, Math.round(rx / 6), 4, 'bu' + sd));
    // cypresses: flames with ragged sides (small leafy notches), measured from the scans
    const cyp = (cx, top, hw, bot, seed) => {
        const r = Motion.rng('svcy' + seed), L = [], R = [];
        for (let i = 0; i <= 40; i++) {
            const f = i / 40, y = top + (bot - top) * f, w = hw * Math.pow(Math.sin(Math.min(1, f * 1.45) * Math.PI / 2), 0.8) * (1 - 0.1 * f);
            // lumpy sides: low-frequency bulges (6–8 px) plus small leafy notches
            const lump = Math.min(1, f * 5), nr = (5 * Math.sin(f * 17 + seed) + 3 * Math.sin(f * 41 + seed * 2) + (i % 2 ? 3 : -1) * r()) * lump, nl = (5 * Math.sin(f * 19 + seed * 3) + 3 * Math.sin(f * 37 + seed) + (i % 2 ? -1 : 3) * r()) * lump;
            R.push([cx + w + nr, y]); L.unshift([cx - w - nl, y]);
        }
        return [...R, ...L];
    };
    add(cyp(84, 512, 42, 836, 1)); add(cyp(146, 586, 28, 840, 2));
    // the umbrella pine: the canopy is nine clumps, each a scallop-edged ellipse (their union
    // gives the bumpy crown); trunk and four branches as tapered blades
    const lobes = [[245, 652, 58, 42], [305, 596, 70, 48], [392, 575, 82, 55], [478, 582, 72, 50], [540, 628, 56, 44], [560, 690, 38, 30], [430, 655, 62, 30], [330, 660, 58, 32], [215, 686, 34, 22], [395, 630, 90, 36]];
    lobes.forEach(([x, y, rx, ry], i) => add(U.scallop(x, y, rx, ry, Math.round(rx / 7), 5, 'lb' + i)));
    add([[366, 832], [371, 760], [374, 700], [391, 700], [395, 760], [400, 832]]);
    for (const [x0, y0, x1, y1, w, b] of [[380, 740, 298, 680, 11, 6], [384, 742, 505, 697, 10, -8], [379, 726, 355, 664, 9, 3], [386, 726, 422, 668, 8, -3]]) add(U.blade(x0, y0, x1, y1, w, b));
    pink.save(); pink.globalCompositeOperation = 'destination-out'; pink.fillStyle = T(1); pink.fill(silP); pink.restore();
    for (const [g, v] of [[navy, 0.68], [blue, 0.76], [pink, 0.36]]) { g.fillStyle = T(v); g.fill(silP); }
    // light on the crowns and the cypresses' sunward side: the navy thinned in soft patches
    // (dark green-olive), and the ink grainy (pinholes and a mottle), measured at 3×
    navy.save(); navy.clip(silP); navy.globalCompositeOperation = 'destination-out';
    for (const [x, y, rx, ry] of [...lobes.slice(0, 5).map(([x, y, rx, ry]) => [x - rx * 0.2, y - ry * 0.4, rx * 0.45, ry * 0.3]), [92, 620, 22, 80], [152, 680, 12, 60], ]) {
        const gr = navy.createRadialGradient(px(x), px(y), 0, px(x), px(y), px(rx)); gr.addColorStop(0, T(0.25)); gr.addColorStop(1, T(0));
        navy.fillStyle = gr; navy.save(); navy.translate(px(x), px(y)); navy.scale(1, ry / rx); navy.translate(-px(x), -px(y)); navy.beginPath(); navy.arc(px(x), px(y), px(rx), 0, 7); navy.fill(); navy.restore();
    }
    { const rg = Motion.rng('svgrain'), gp = new Path2D(); for (let i = 0; i < 2600; i++) { const x = rg() * 1000, y = px(500) + rg() * px(390), r = 0.35 + rg() * 0.9; gp.moveTo(x + r, y); gp.arc(x, y, r, 0, 6.2832); } navy.fillStyle = T(0.55); navy.fill(gp); }
    navy.restore();
    // grass tufts by the bush: tall tapered blades, dark olive, one pale green
    { const gp = new Path2D(), gl = new Path2D(); for (const [x0, y0, x1, y1, w, b, lt] of [[948, 800, 905, 718, 4, 6, 0], [955, 802, 930, 735, 3.5, -4, 0], [962, 800, 958, 722, 3, 3, 1], [940, 806, 918, 760, 3, -3, 0], [970, 796, 985, 745, 3, -4, 0], [930, 812, 890, 770, 2.5, 4, 1]]) { const q = lt ? gl : gp; P(U.blade(x0, y0, x1, y1, w, b)).forEach(([x, y], i) => (i ? q.lineTo(x, y) : q.moveTo(x, y))); q.closePath(); }
      pink.save(); pink.globalCompositeOperation = 'destination-out'; pink.fillStyle = T(1); pink.fill(gp); pink.fill(gl); pink.restore();
      navy.fillStyle = T(0.75); navy.fill(gp); blue.fillStyle = T(0.8); blue.fill(gp); blue.fill(gl); }

    // the field: the blue screen (9.72 px, 18°) over the yellow; a light far band on the left
    // (a diagonal from (0, 925) to (560, 866) px), dark near the horizon, then furrows whose
    // crests are yellow (blue lifted) converging on (778, 874) px
    const field = P([[-20, 830], [1100, 830], [1100, 1100], [-20, 1100]]);
    const VP = [778, 874];
    const LB = { o: [-2.28, 0.60], a: [-2.9741, 9.2597], b: [9.2517, 2.9840] };
    // the furrows: measured crest lines (bright yellow, x at y = 1060 px, some in pairs) with a
    // broad dark-green band between each pair of crests (the blue solid plus a navy screen)
    // and the lighter green screen either side; all converge on the vanishing point. Beyond the
    // measured ones the pattern repeats outwards by angle.
    const X60 = [33, 106, 131, 186, 260, 284, 334, 355, 404, 416, 475, 539, 571, 603, 665, 724, 734, 784, 805, 839, 857, 893, 950, 1001, 1010, 1041];
    // (and where they cross the left edge, x = 5 px)
    const Y5 = [907, 918, 961, 978, 988, 999, 1011, 1027, 1044, 1068];
    const ang = [...Y5.map((y) => Math.atan2(y - VP[1], 5 - VP[0])), ...X60.map((x) => Math.atan2(1060 - VP[1], x - VP[0]))].sort((p, q) => q - p);
    for (let k = 0; k < 4; k++) ang.push(ang[ang.length - 1] - (ang[ang.length - 4] - ang[ang.length - 1]) / 3);
    const ray = (g, a, wBottom, a0 = 0.08) => { const L = 900, c = Math.cos(a), sn = Math.sin(a), hw = Math.atan2(wBottom / 2, 200 / Math.max(0.2, sn)); g.moveTo(px(VP[0] + Math.cos(a) * L * a0 * 0.1), px(VP[1] + Math.sin(a) * L * a0 * 0.1)); g.lineTo(px(VP[0] + Math.cos(a - hw) * 1600), px(VP[1] + Math.sin(a - hw) * 1600)); g.lineTo(px(VP[0] + Math.cos(a + hw) * 1600), px(VP[1] + Math.sin(a + hw) * 1600)); g.closePath(); };
    const bands = new Path2D(), crestP = new Path2D();
    for (let i = 0; i < ang.length - 1; i++) { const da = ang[i] - ang[i + 1]; if (da > 0.02) { const m = (ang[i] + ang[i + 1]) / 2, hw = da * 0.26; bands.moveTo(px(VP[0]), px(VP[1])); bands.lineTo(px(VP[0] + Math.cos(m - hw) * 1600), px(VP[1] + Math.sin(m - hw) * 1600)); bands.lineTo(px(VP[0] + Math.cos(m + hw) * 1600), px(VP[1] + Math.sin(m + hw) * 1600)); bands.closePath(); } }
    // a crest is ~6 px wide at the frame's edge and starts ~25 px below the horizon
    for (const a of ang) { const c = Math.cos(a), sn = Math.sin(a), rEnd = Math.min(sn > 0.01 ? (1080 - VP[1]) / sn : 2000, c < -0.01 ? -VP[0] / c : c > 0.01 ? (1080 - VP[0]) / c : 2000), hw = 3 / rEnd, r0 = 25 / Math.max(0.15, sn); crestP.moveTo(px(VP[0] + c * r0), px(VP[1] + sn * r0)); crestP.lineTo(px(VP[0] + Math.cos(a - hw) * 1600), px(VP[1] + Math.sin(a - hw) * 1600)); crestP.lineTo(px(VP[0] + Math.cos(a + hw) * 1600), px(VP[1] + Math.sin(a + hw) * 1600)); crestP.closePath(); }
    U.lattice(blue, LB, (m) => {
        U.clipped(m, field, (h) => {
            h.fillStyle = vramp(h, px(840), px(1080), [[0, 1.0], [0.45, 0.85], [1, 0.72]]);
            h.fillRect(-20, 0, 1040, 1100);
            h.globalCompositeOperation = 'destination-out';
            // the far band: light (bare yellow with sparse dots)
            h.fillStyle = T(0.75); U.path(h, P([[-20, 830], [560, 830], [560, 866], [-20, 927]])); h.fill();
        });
    }, { min: 0.05 });
    const fieldP = new Path2D(); P([[-20, 872], [1100, 872], [1100, 1100], [-20, 1100]]).forEach(([x, y], i) => (i ? fieldP.lineTo(x, y) : fieldP.moveTo(x, y)));
    blue.save(); blue.clip(fieldP); blue.fillStyle = T(0.95); blue.fill(bands); blue.globalCompositeOperation = 'destination-out'; blue.fillStyle = T(1); blue.fill(crestP); blue.restore();
    { const ns = press.plate('navy', 'screen'); ns.save(); ns.clip(fieldP); ns.fillStyle = T(0.3); ns.fill(bands); ns.restore(); }
    // red flecks in the field (the reference's field carries a sparse pink screen)
    U.clipped(press.plate('pink', 'screen'), field, (h) => { h.fillStyle = T(0.07); h.fillRect(-20, 0, 1040, 1100); });
    // the far band's navy tint (olive)
    U.clipped(press.plate('navy', 'screen'), P([[-20, 830], [560, 830], [560, 866], [-20, 927]]), (h) => { h.fillStyle = T(0.22); h.fillRect(-20, 0, 1040, 1100); });
    press.restore();
};
