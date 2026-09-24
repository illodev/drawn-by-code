// Card «field» (reference ≈ 13.21–13.33 s, full frame). A sunflower field to the horizon:
// an orange sky (yellow flat, pink dots thinning towards the horizon) with a white sun and
// pale rays (the pink knocked out), rows of sunflowers shrinking to a vanishing point (brown
// heads, orange petals, green leaves on yellow + blue dots), and two big sunflowers in
// front: yellow petals shaded with pink dots and dark green outlines, heads of red seeds
// in a Fibonacci spiral on dark olive, green hearts; a stem and a big leaf on the left.
// Authored in reference pixels (1080 frame) through G5.px. CARDS.field(press, t).
var CARDS = CARDS || {};
CARDS.field = (press, t) => {
    const R = Riso, T = R.tone, U = G5;
    const d = Math.floor(t * 12 + 1e-6);
    const P = (ink, k) => press.plate(ink, k);
    const pink = P('pink'), pinkS = P('pink', 'screen'), yel = P('yellow'), yelS = P('yellow', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const all = [pink, pinkS, yel, yelS, blue, blueS, navy, navyS];
    const eraseIn = (plates, fn) => { for (const g of plates) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; g.beginPath(); fn(g); g.restore(); } };
    const green = (pts, w) => { U.stroke(navy, pts, w, T(0.75), true); U.stroke(blue, pts, w, T(0.6), true); };

    // the sky's pink is the reference's own screen (9.72 px at 78°, phase measured per drawing),
    // set in card units by G6.lattice before the px transform
    const LSK = [{ o: [-3.05, -2.76], a: [-9.5078, 2.0025], b: [2.0006, 9.5127] }, { o: [4.27, -1.88], a: [1.9996, 9.5108], b: [-9.5141, 2.0074] }][Math.min(1, d)];
    G6.lattice(pink, LSK, (m) => { m.fillStyle = R.ramp(m, 0, 0, 0, 360 / 1.08, 0.6, 0.04); m.fillRect(-20, -20, 1040, 460 / 1.08); });
    U.px(press, () => {
        // sky: yellow flat, pink dots thinning towards the horizon
        yel.fillStyle = T(1); yel.fillRect(0, 0, 1080, 1080);
        // the sun's rays: pale lines where the pink dots are knocked out, turning slowly
        const SUN = [1000, 40], rot = d * 0.008;
        // the sun's rays: pale yellow wedges where the pink dots are knocked out, fanning from the
        // sun to the lower left (angles 1.95–2.95 rad), 8–34 px wide, measured on the 13.25 s
        // frame; some start near the sun, some further out. Turning slowly.
        const RAYS = [[1.98, 26, 140, 760], [2.07, 12, 180, 700], [2.15, 30, 120, 820], [2.26, 10, 260, 760], [2.33, 22, 150, 800], [2.42, 14, 300, 900], [2.5, 34, 160, 880], [2.6, 12, 220, 700], [2.68, 20, 180, 900], [2.77, 9, 300, 760], [2.84, 16, 140, 960], [2.93, 8, 200, 640], [2.22, 6, 420, 620], [2.55, 7, 380, 700]];
        eraseIn([pinkS, pink], (g) => { for (const [a0, w, r0, r1] of RAYS) { const a = a0 + rot, c = Math.cos(a), sn = Math.sin(a), nx = -sn, ny = c; g.moveTo(SUN[0] + c * r0 - nx * w * 0.15, SUN[1] + sn * r0 - ny * w * 0.15); g.lineTo(SUN[0] + c * r0 + nx * w * 0.15, SUN[1] + sn * r0 + ny * w * 0.15); g.lineTo(SUN[0] + c * r1 + nx * w / 2, SUN[1] + sn * r1 + ny * w / 2); g.lineTo(SUN[0] + c * (r1 + 40), SUN[1] + sn * (r1 + 40)); g.lineTo(SUN[0] + c * r1 - nx * w / 2, SUN[1] + sn * r1 - ny * w / 2); g.closePath(); } g.globalAlpha = 0.85; g.fill(); });
        eraseIn(all, (g) => { g.arc(SUN[0], SUN[1], 92, 0, 7); g.fill(); });
        const rayPath = (g) => { for (const [a0, w, r0, r1] of RAYS) { const a = a0 + rot, c = Math.cos(a), sn = Math.sin(a), nx = -sn, ny = c, r2 = r1 + 400; g.moveTo(SUN[0] + c * r0, SUN[1] + sn * r0); g.lineTo(SUN[0] + c * r2 + nx * w * 0.8, SUN[1] + sn * r2 + ny * w * 0.8); g.lineTo(SUN[0] + c * r2 - nx * w * 0.8, SUN[1] + sn * r2 - ny * w * 0.8); g.closePath(); } };

        // the field: yellow + blue dots (green), rows of flowers to the vanishing point
        const HZ = (x) => 432 + (x - 330) * 0.022 + ((x - 700) / 400) ** 2 * 4;
        const field = []; for (let x = -10; x <= 1090; x += 30) field.push([x, HZ(x)]);
        const fpoly = [...field, [1090, 1090], [-10, 1090]];
        eraseIn([pinkS, pink], (g) => U.trace(g, fpoly) || g.fill());
        U.clipped(blueS, fpoly, false, (g) => { g.fillStyle = R.ramp(g, 0, 450, 0, 800, 0.02, 0.62); g.fillRect(0, 0, 1080, 1080); });
        U.clipped(navyS, fpoly, false, (g) => { g.fillStyle = R.ramp(g, 0, 600, 0, 1080, 0, 0.18); g.fillRect(0, 0, 1080, 1080); });
        // the sun's rays carry on over the field on the right: pale yellow-green wedges (the green lifted)
        U.clipped(blueS, fpoly, false, (g) => { g.globalCompositeOperation = 'destination-out'; g.globalAlpha = 0.55; g.beginPath(); rayPath(g); g.fill(); });
        // the near field is leafy: a blue solid under the screen from y 520 down
        U.clipped(blue, fpoly, false, (g) => { g.fillStyle = R.ramp(g, 0, 480, 0, 700, 0, 0.12); g.fillRect(0, 0, 1080, 1080); });
        const VP = [605, 410]; // (the rows converge on (605, 432) px: measured on the 13.25 s frame)
        const rows = [];
        for (let Z = 34; Z > 1.1; Z /= 1.15) rows.push(Z);
        for (const Z of rows) {
            const s = 30 / Z, sp = 86 / Z, y0 = VP[1] + 1000 / Z * 0.6 + 20;
            if (y0 > 1120) continue;
            const n = Math.ceil(700 / sp);
            const stag = (Math.round(Z * 10) % 2) * 0.5;
            for (let c = -n; c <= n; c++) {
                const hh = (k) => { const v = Math.sin(c * 12.9898 + Z * 78.233 + k * 3.7) * 43758.5453; return v - Math.floor(v); };
                const jx = s > 3 ? (hh(1) - 0.5) * sp * 0.35 : 0, jy = s > 3 ? (hh(2) - 0.5) * s * 1.2 : 0;
                const x = VP[0] + (c + stag) * sp + jx, y = y0 + ((x - VP[0]) / 700) ** 2 * 22 * (s / 6 + 0.3) + jy;
                if (x < -30 || x > 1110 || y < HZ(x) + 1) continue;
                // the near rows only fill the left of the field (the big flower and bare green on the right)
                if (y > 560 && x > 720 - (y - 560) * 0.6) continue;
                // (far away the heads never cover more than a third of their spacing: the field stays light)
                const r = Math.max(1.0, Math.min(s * 0.95, sp * 0.27));
                if (r < 4) { navy.fillStyle = T(0.85); navy.beginPath(); navy.arc(x, y, r, 0, 7); navy.fill(); continue; }
                // leaves: a green star behind
                navy.fillStyle = T(0.3); blue.fillStyle = T(0.85); blue.beginPath(); navy.beginPath();
                for (let k = 0; k < 7; k++) { const a = k * 0.9 + c, L = r * 2.8; for (const g of [blue, navy]) { g.moveTo(x, y); g.lineTo(x + Math.cos(a - 0.3) * L * 0.5, y + Math.sin(a - 0.3) * L * 0.5 + r); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L * 0.8 + r); g.lineTo(x + Math.cos(a + 0.3) * L * 0.5, y + Math.sin(a + 0.3) * L * 0.5 + r); } }
                blue.fill(); navy.fill();
                // petals: an orange ring (pink dots on yellow), the brown head
                // the petal ring is spiky (14 pointed petals), orange: pink dots on bare yellow
                const ring = (g) => { g.beginPath(); for (let k = 0; k < 28; k++) { const a = k / 28 * 6.2832 + c * 0.7, rr = k % 2 ? r * 1.25 : r * 1.75; k ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); };
                eraseIn([blue, blueS, navyS, navy], (g) => { ring(g); g.fill(); });
                pinkS.fillStyle = T(0.5); ring(pinkS); pinkS.fill();
                navy.fillStyle = T(0.92); navy.beginPath(); navy.arc(x, y, r, 0, 7); navy.fill();
                pink.fillStyle = T(0.5); pink.beginPath(); pink.arc(x, y, r, 0, 7); pink.fill();
                if (r > 7) {
                    // red seeds showing in the head: the navy knocked out under bright pink spots
                    const sb = [x - r * 0.62, y - r * 0.62, x + r * 0.62, y + r * 0.62], n2 = Math.round(r * 0.35), sd = 'fs' + Math.round(x) + Math.round(y);
                    eraseIn([navy], (g) => { U.speckle(g, sd, n2, ...sb, 1.8, r * 0.16 + 1.4, T(1)); });
                    U.speckle(pink, sd, n2, ...sb, 1.8, r * 0.16 + 1.4, T(1));
                }
            }
        }

        // leaves (measured on a 40 px grid of the 13.25 s frame): serrated edges, green (blue
        // solid over the yellow, a navy screen), pale yellow veins from a midrib
        const leafDraw = (outline, mid, veins) => {
            eraseIn(all, (g) => U.trace(g, outline) || g.fill());
            U.fill(yel, outline, T(1)); U.fill(blue, outline, T(0.3)); U.fill(blueS, outline, T(0.6)); U.fill(navyS, outline, T(0.06));
            eraseIn([blue, blueS, navyS], (g) => { g.lineCap = 'round'; g.lineWidth = 4; U.trace(g, mid, false); for (const v of veins) U.trace(g, v, false); g.stroke(); });
            green([...outline, outline[0]], 3);
        };
        const serr = (pts, amp, seed) => { const r = Motion.rng('sr' + seed), out = []; for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 16)), L = Math.hypot(x1 - x0, y1 - y0) || 1; for (let k = 0; k < n; k++) { const f = k / n; out.push([x0 + (x1 - x0) * f, y0 + (y1 - y0) * f]); out.push([x0 + (x1 - x0) * (f + 0.5 / n) - (y1 - y0) / L * amp * (0.6 + 0.6 * r()), y0 + (y1 - y0) * (f + 0.5 / n) + (x1 - x0) / L * amp * (0.6 + 0.6 * r())]); } } return out; };
        leafDraw(serr([[110, 885], [150, 835], [240, 812], [330, 825], [390, 870], [420, 950], [410, 1010], [380, 1090], [110, 1090]], -7, 'bl'),
            [[112, 890], [230, 915], [330, 945], [400, 965]],
            [[[180, 900], [230, 845]], [[260, 925], [310, 855]], [[330, 945], [370, 895]], [[180, 905], [150, 1000]], [[260, 928], [240, 1040]], [[330, 948], [330, 1060]]]);
        leafDraw(serr([[112, 700], [70, 620], [20, 595], [-20, 600], [-20, 760], [40, 740], [100, 715]], 6, 'sl'),
            [[112, 700], [50, 660], [-10, 640]], [[[60, 665], [40, 610]], [[30, 650], [0, 605]], [[70, 675], [30, 725]], [[30, 655], [0, 715]]]);
        // the stem: 40 px wide from (140, 480) to (90, 1090) px, green with two yellow highlight lines
        const stem = [[142, 480], [132, 700], [112, 900], [90, 1090]];
        U.erase(all, stem, 42);
        U.stroke(yel, stem, 40, T(1)); U.stroke(blue, stem, 40, T(0.72)); U.stroke(navyS, stem.map(([x, y]) => [x + 12, y]), 10, T(0.2));
        eraseIn([blue, navyS], (g) => { g.lineWidth = 4; U.smooth(g, stem.map(([x, y]) => [x - 8, y]), false); g.stroke(); g.beginPath(); g.lineWidth = 3; U.smooth(g, stem.map(([x, y]) => [x + 6, y]), false); g.stroke(); });
        green(stem.map(([x, y]) => [x - 20, y]), 3); green(stem.map(([x, y]) => [x + 20, y]), 3);

        // the big sunflowers
        const flower = (cx, cy, R0, R1, seed, spin) => {
            const rr = Motion.rng('fl' + seed);
            const petal = (a, r0, r1, w) => {
                const tip = [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1], base = [cx + Math.cos(a) * r0, cy + Math.sin(a) * r0];
                const m = (r0 + r1) * 0.5, nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
                return [base, [cx + Math.cos(a) * m + nx, cy + Math.sin(a) * m + ny], tip, [cx + Math.cos(a) * m - nx, cy + Math.sin(a) * m - ny]];
            };
            for (const [n, off, len, wf] of [[22, 0, 1, 1], [22, 0.5, 0.82, 0.95]]) {
                for (let k = 0; k < n; k++) {
                    const a = spin + (k + off) / n * Math.PI * 2 + (rr() - 0.5) * 0.06;
                    const r1 = R0 + (R1 - R0) * len * (0.9 + rr() * 0.14);
                    const p = petal(a, R0 * 0.8, r1, (R1 - R0) * 0.17 * wf);
                    eraseIn(all, (g) => U.smooth(g, p) || g.fill());
                    U.fill(yel, p, T(1), true);
                    // pink dots dense at the petal's base, thinning to bare pale yellow at the tip;
                    // a lit edge down one side (the pink lifted); a green outline (blue + a little navy)
                    U.clipped(pinkS, p, true, (g) => { g.fillStyle = R.radial(g, cx, cy, R0, R1, 0.55, 0.2); g.fillRect(0, 0, 1080, 1080); });
                    U.clipped(pinkS, p, true, (g) => { g.globalCompositeOperation = 'destination-out'; g.lineWidth = (R1 - R0) * 0.07; g.beginPath(); g.moveTo(p[0][0], p[0][1]); g.quadraticCurveTo(p[1][0], p[1][1], p[2][0], p[2][1]); g.stroke(); });
                    U.stroke(blue, [...p, p[0]], 4.2, T(0.9), true); U.stroke(navy, [...p, p[0]], 3, T(0.7), true);
                    // the fold down the middle of the petal
                    U.stroke(blue, [[cx + Math.cos(a) * (R0 + 10), cy + Math.sin(a) * (R0 + 10)], [cx + Math.cos(a) * (r1 - 30), cy + Math.sin(a) * (r1 - 30)]], 1.6, T(0.5));
                }
            }
            // the head: dark olive with red seeds in a Fibonacci spiral, a green heart
            eraseIn(all, (g) => { g.arc(cx, cy, R0, 0, 7); g.fill(); });
            // (inks fitted on the reference's heads: pink 0.7–0.95 over the yellow, navy 0.3 at the
            // rim rising to 0.6 round the heart, a trace of blue)
            yel.fillStyle = T(1); pink.fillStyle = T(0.95); blue.fillStyle = T(0.1);
            // (measured at 2×: bright red seeds in a spiral on a dark green-navy net, darkest in a
            // halo round the heart; the heart itself small green seeds on dark)
            yel.fillStyle = T(1); pink.fillStyle = T(0.95); blue.fillStyle = T(0.35);
            { const gr = navy.createRadialGradient(cx, cy, R0 * 0.25, cx, cy, R0); gr.addColorStop(0, T(0.95)); gr.addColorStop(0.2, T(0.9)); gr.addColorStop(0.45, T(0.72)); gr.addColorStop(1, T(0.8)); navy.fillStyle = gr; }
            for (const g of [yel, pink, navy, blue]) { g.beginPath(); g.arc(cx, cy, R0, 0, 7); g.fill(); }
            const seeds = Math.round(R0 * R0 / 22), GA = 2.39996;
            const seedAt = (i) => { const r = Math.sqrt(i / seeds) * R0 * 0.95, a = i * GA; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, r]; };
            // outer seeds: the navy and blue lifted under each, so the pink prints bright red
            eraseIn([navy, blue], (g) => { for (let i = 0; i < seeds; i++) { const [x, y, r] = seedAt(i); if (r < R0 * 0.36) continue; const sz = 1.3 + r / R0 * 2.1; g.moveTo(x + sz, y); g.arc(x, y, sz, 0, 7); } g.fill(); });
            // the heart (0.27 R0): pink lifted, green seeds (blue) on the dark navy
            eraseIn([pink], (g) => { g.arc(cx, cy, R0 * 0.27, 0, 7); g.fill(); });
            eraseIn([navy], (g) => { for (let i = 0; i < seeds; i++) { const [x, y, r] = seedAt(i); if (r >= R0 * 0.26) break; const sz = 1.5 + r / R0 * 4; g.moveTo(x + sz, y); g.arc(x, y, sz, 0, 7); } g.fill(); });
            blue.fillStyle = T(0.9); blue.beginPath(); blue.arc(cx, cy, R0 * 0.27, 0, 7); blue.fill();
            // the dark rim round the head
            navy.strokeStyle = T(0.7); navy.lineWidth = 8; navy.beginPath(); navy.arc(cx, cy, R0, 0, 7); navy.stroke();
            blue.strokeStyle = T(0.95); blue.lineWidth = 9; blue.beginPath(); blue.arc(cx, cy, R0, 0, 7); blue.stroke();
            
        };
        flower(155, 296, 106, 262, 'L', 0.1 + d * 0.004);
        flower(868, 928, 136, 318, 'R', 0.05 - d * 0.004);
    });
};
