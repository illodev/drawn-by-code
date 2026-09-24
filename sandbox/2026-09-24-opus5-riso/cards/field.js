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
        eraseIn([pinkS, pink], (g) => { for (let k = 0; k < 22; k++) { const a = 1.75 + k * 0.075 + rot + (k % 3) * 0.01, w = 3 + (k % 4) * 1.5; g.moveTo(SUN[0], SUN[1]); g.lineTo(SUN[0] + Math.cos(a - w / 1400) * 900, SUN[1] + Math.sin(a - w / 1400) * 900); g.lineTo(SUN[0] + Math.cos(a + w / 1400) * 900, SUN[1] + Math.sin(a + w / 1400) * 900); g.closePath(); } g.fill(); });
        eraseIn(all, (g) => { g.arc(SUN[0], SUN[1], 92, 0, 7); g.fill(); });

        // the field: yellow + blue dots (green), rows of flowers to the vanishing point
        const HZ = (x) => 432 + (x - 330) * 0.022 + ((x - 700) / 400) ** 2 * 4;
        const field = []; for (let x = -10; x <= 1090; x += 30) field.push([x, HZ(x)]);
        const fpoly = [...field, [1090, 1090], [-10, 1090]];
        eraseIn([pinkS, pink], (g) => U.trace(g, fpoly) || g.fill());
        U.clipped(blueS, fpoly, false, (g) => { g.fillStyle = R.ramp(g, 0, 450, 0, 800, 0.02, 0.62); g.fillRect(0, 0, 1080, 1080); });
        U.clipped(navyS, fpoly, false, (g) => { g.fillStyle = R.ramp(g, 0, 600, 0, 1080, 0, 0.18); g.fillRect(0, 0, 1080, 1080); });
        const VP = [605, 410]; // (the rows converge on (605, 432) px: measured on the 13.25 s frame)
        const rows = [];
        for (let Z = 34; Z > 1.1; Z /= 1.15) rows.push(Z);
        for (const Z of rows) {
            const s = 26 / Z, sp = 82 / Z, y0 = VP[1] + 1000 / Z * 0.6 + 20;
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
                const r = Math.max(1.6, s * 0.95);
                if (r < 4) { navy.fillStyle = T(0.85); navy.beginPath(); navy.arc(x, y, r, 0, 7); navy.fill(); continue; }
                // leaves: a green star behind
                blue.fillStyle = T(0.65); blue.beginPath();
                for (let k = 0; k < 7; k++) { const a = k * 0.9 + c, L = r * 2.8; blue.moveTo(x, y); blue.lineTo(x + Math.cos(a - 0.3) * L * 0.5, y + Math.sin(a - 0.3) * L * 0.5 + r); blue.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L * 0.8 + r); blue.lineTo(x + Math.cos(a + 0.3) * L * 0.5, y + Math.sin(a + 0.3) * L * 0.5 + r); }
                blue.fill();
                // petals: an orange ring (pink dots on yellow), the brown head
                eraseIn([blue, blueS, navyS], (g) => { g.arc(x, y, r * 1.55, 0, 7); g.fill(); });
                pinkS.fillStyle = T(0.4); pinkS.beginPath(); pinkS.arc(x, y, r * 1.5, 0, 7); pinkS.fill();
                navy.fillStyle = T(0.92); navy.beginPath(); navy.arc(x, y, r, 0, 7); navy.fill();
                pink.fillStyle = T(0.5); pink.beginPath(); pink.arc(x, y, r, 0, 7); pink.fill();
                if (r > 12) U.speckle(pink, 'fs' + Math.round(x) + Math.round(y), 5, x - r * 0.6, y - r * 0.6, x + r * 0.6, y + r * 0.6, 1.5, 3, T(1));
            }
        }

        // the big leaf and the stem on the left
        const leaf = [[60, 840], [180, 800], [320, 830], [440, 900], [480, 990], [420, 1090], [60, 1090]];
        eraseIn(all, (g) => U.smooth(g, leaf) || g.fill());
        U.fill(yel, leaf, T(1), true); U.fill(blueS, leaf, T(0.7), true); U.fill(blue, leaf, T(0.3), true);
        eraseIn([blueS, blue], (g) => { g.lineWidth = 3; for (const [a, b] of [[[120, 1080], [300, 870]], [[190, 990], [110, 900]], [[240, 930], [380, 950]], [[180, 1030], [330, 1060]]]) { g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); } g.stroke(); });
        green([...leaf.slice(0, 6)], 3);
        const stem = [[150, 480], [138, 700], [112, 900], [92, 1090]];
        U.erase(all, stem, 30);
        U.stroke(yel, stem, 28, T(1)); U.stroke(blue, stem, 28, T(0.55)); U.stroke(navyS, stem.map(([x, y]) => [x + 7, y]), 12, T(0.35));
        eraseIn([blue, navyS], (g) => { g.lineWidth = 3; U.smooth(g, stem.map(([x, y]) => [x - 5, y]), false); g.stroke(); });
        green(stem.map(([x, y]) => [x - 14, y]), 2.5); green(stem.map(([x, y]) => [x + 14, y]), 2.5);
        // a side leaf off the stem, left
        const sl = [[135, 640], [80, 610], [10, 600], [-20, 660], [40, 700], [120, 690]];
        eraseIn(all, (g) => U.smooth(g, sl) || g.fill());
        U.fill(yel, sl, T(1), true); U.fill(blueS, sl, T(0.6), true); U.fill(blue, sl, T(0.25), true);
        green([...sl, sl[0]], 2.5);

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
                    U.clipped(pinkS, p, true, (g) => { g.fillStyle = R.radial(g, cx, cy, R0, R1, 0.42, 0.18); g.fillRect(0, 0, 1080, 1080); });
                    U.stroke(navy, [...p, p[0]], 2.4, T(0.8), true); U.stroke(blue, [...p, p[0]], 2.4, T(0.5), true);
                    // the fold down the middle of the petal
                    U.stroke(navy, [[cx + Math.cos(a) * (R0 + 10), cy + Math.sin(a) * (R0 + 10)], [cx + Math.cos(a) * (r1 - 25), cy + Math.sin(a) * (r1 - 25)]], 1.4, T(0.5));
                }
            }
            // the head: dark olive with red seeds in a Fibonacci spiral, a green heart
            eraseIn(all, (g) => { g.arc(cx, cy, R0, 0, 7); g.fill(); });
            // (inks fitted on the reference's heads: pink 0.7–0.95 over the yellow, navy 0.3 at the
            // rim rising to 0.6 round the heart, a trace of blue)
            yel.fillStyle = T(1); pink.fillStyle = T(0.8); blue.fillStyle = T(0.1);
            navy.fillStyle = R.radial(navy, cx, cy, R0 * 0.4, R0, 0.72, 0.42);
            for (const g of [yel, pink, navy, blue]) { g.beginPath(); g.arc(cx, cy, R0, 0, 7); g.fill(); }
            const seeds = Math.round(R0 * R0 / 22), GA = 2.39996;
            eraseIn([navy, blue], (g) => { for (let i = 0; i < seeds; i++) { const r = Math.sqrt(i / seeds) * R0 * 0.92, a = i * GA; if (r < R0 * 0.34) continue; const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, sz = 1.4 + r / R0 * 2.2; g.moveTo(x + sz, y); g.arc(x, y, sz, 0, 7); } g.fill(); });
            pink.fillStyle = T(1);
            pink.beginPath();
            for (let i = 0; i < seeds; i++) { const r = Math.sqrt(i / seeds) * R0 * 0.92, a = i * GA; if (r < R0 * 0.34) continue; const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, sz = 1.4 + r / R0 * 2.2; pink.moveTo(x + sz, y); pink.arc(x, y, sz, 0, 7); }
            pink.fill();
            // the heart: green seeds on dark
            blueS.fillStyle = T(0.7); blueS.beginPath(); blueS.arc(cx, cy, R0 * 0.34, 0, 7); blueS.fill();
            eraseIn([navy], (g) => { for (let i = 0; i < seeds; i++) { const r = Math.sqrt(i / seeds) * R0 * 0.92, a = i * GA; if (r >= R0 * 0.32) break; const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; g.moveTo(x + 2, y); g.arc(x, y, 2, 0, 7); } g.fill(); });
            // the dark rim round the head
            navy.strokeStyle = T(1); navy.lineWidth = 7; navy.beginPath(); navy.arc(cx, cy, R0, 0, 7); navy.stroke();
            blue.strokeStyle = T(0.6); blue.lineWidth = 7; blue.beginPath(); blue.arc(cx, cy, R0, 0, 7); blue.stroke();
            navy.lineWidth = 3; navy.strokeStyle = T(0.7); navy.beginPath(); navy.arc(cx, cy, R0 * 0.36, 0, 7); navy.stroke();
        };
        flower(155, 296, 106, 262, 'L', 0.1 + d * 0.004);
        flower(868, 928, 136, 318, 'R', 0.05 - d * 0.004);
    });
};
