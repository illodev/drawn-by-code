// Card «ferris» (reference ≈ 10.2–10.45 s, full frame at 10.3): a Ferris wheel lit with
// bulbs at dusk, striped circus tents and stalls, a crescent moon. 1000 × 1000 units,
// measured on the 10.3 s frame. Needs _g3-util.js (G3).
var CARDS = CARDS || {};
const DRAW_FERRIS = (press, t) => {
    const R = Riso, T = R.tone, U = G3;
    const d = Math.floor(t * 12 + 1e-6);
    const pink = press.plate('pink'), pinkS = press.plate('pink', 'screen');
    const blue = press.plate('blue'), blueS = press.plate('blue', 'screen');
    const navy = press.plate('navy'), navyS = press.plate('navy', 'screen');
    const yellow = press.plate('yellow'), yellowS = press.plate('yellow', 'screen');
    const HX = 567, HY = 382, RIM = 296;
    const ink = (list, fn) => { for (const [g, v] of list) { g.save(); g.fillStyle = T(v); g.strokeStyle = T(v); fn(g); g.restore(); } };
    const knock = (fn) => press.knockout(fn);

    // ── dusk sky: a pink screen all over, navy dots at the top, yellow rising to orange below
    pinkS.fillStyle = R.ramp(pinkS, 0, 150, 0, 1000, 0.88, 0.6); pinkS.fillRect(0, 0, 1000, 1000);
    navyS.fillStyle = R.ramp(navyS, 0, 0, 0, 420, 0.4, 0); navyS.fillRect(0, 0, 1000, 450);
    blueS.fillStyle = R.ramp(blueS, 0, 0, 0, 330, 0.75, 0); blueS.fillRect(0, 0, 1000, 300);
    yellowS.fillStyle = R.ramp(yellowS, 0, 300, 0, 700, 0, 1); yellowS.fillRect(0, 300, 1000, 700);
    yellow.fillStyle = R.ramp(yellow, 0, 620, 0, 1000, 0, 0.45); yellow.fillRect(0, 620, 1000, 380);
    // stars (paper specks) in the navy
    const rs = Motion.rng('fe-stars');
    knock((g) => { for (let i = 0; i < 60; i++) { g.beginPath(); g.arc(rs() * 1000, rs() * 330, 0.9 + rs() * 1.2, 0, 7); g.fill(); } });
    // the crescent moon: paper
    knock((g) => {
        U.crescent(g, 106, 132, 52, 132, 116, 44); g.fill();
    });

    // ── the wheel: rim, dotted spokes with bulbs, the hub
    const bulb = (x, y, r = 5.2, hot = 0) => {
        knock((g) => { g.beginPath(); g.arc(x, y, r + 1.2, 0, 7); g.fill(); });
        U.disc(yellow, x, y, r, 1);
        pink.fillStyle = T(0.45 + 0.3 * hot); pink.beginPath(); pink.arc(x + r * 0.25, y + r * 0.3, r * 0.8, 0, 7); pink.fill();
        knock((g) => { g.beginPath(); g.arc(x - r * 0.3, y - r * 0.35, r * 0.35, 0, 7); g.fill(); });
    };
    const twinkle = (i) => ((i * 7 + d) % 5 === 0 ? 1 : 0); // a bulb or two brighter per drawing
    ink([[navy, 0.95]], (g) => {
        g.lineWidth = 6; g.beginPath(); g.arc(HX, HY, RIM, 0, 7); g.stroke();
        g.lineWidth = 3; g.beginPath(); g.arc(HX, HY, RIM - 26, 0, 7); g.stroke();
        g.lineWidth = 3; g.beginPath(); g.arc(HX, HY, 92, 0, 7); g.stroke();
        // dashed spokes
        g.lineWidth = 4; g.setLineDash([16, 12]);
        for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 + 0.1; g.beginPath(); g.moveTo(HX + Math.cos(a) * 95, HY + Math.sin(a) * 95); g.lineTo(HX + Math.cos(a) * (RIM - 26), HY + Math.sin(a) * (RIM - 26)); g.stroke(); }
        g.setLineDash([]);
        // the hub star: short thick spokes
        g.lineWidth = 4.5;
        for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; g.beginPath(); g.moveTo(HX + Math.cos(a) * 12, HY + Math.sin(a) * 12); g.lineTo(HX + Math.cos(a) * 46, HY + Math.sin(a) * 46); g.stroke(); }
        g.beginPath(); g.arc(HX, HY, 22, 0, 7); g.fill();
    });
    U.disc(yellow, HX, HY, 11); knock((g) => { g.beginPath(); g.arc(HX, HY, 11, 0, 7); g.fill(); }); U.disc(yellow, HX, HY, 11);
    // bulbs round the rim and along the spokes
    for (let i = 0; i < 68; i++) { const a = (i / 68) * Math.PI * 2; bulb(HX + Math.cos(a) * (RIM + 10), HY + Math.sin(a) * (RIM + 10), 5.6, twinkle(i)); }
    for (let i = 0; i < 60; i++) { const a = (i / 60) * Math.PI * 2 + 0.05; bulb(HX + Math.cos(a) * (RIM - 13), HY + Math.sin(a) * (RIM - 13), 3.6, 0); }
    for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + 0.1;
        for (let k = 0; k < 8; k++) { const r = 110 + k * 22; bulb(HX + Math.cos(a) * r, HY + Math.sin(a) * r, 4.2, twinkle(i + k)); }
    }
    for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; bulb(HX + Math.cos(a) * 70, HY + Math.sin(a) * 70, 3.4, 0); }

    // ── the A-frame: two tapered navy legs, bracing
    ink([[navy, 0.95]], (g) => {
        g.beginPath(); g.moveTo(HX - 10, HY + 10); g.lineTo(HX + 10, HY + 10); g.lineTo(392, 935); g.lineTo(360, 935); g.fill();
        g.beginPath(); g.moveTo(HX - 10, HY + 10); g.lineTo(HX + 10, HY + 10); g.lineTo(778, 935); g.lineTo(746, 935); g.fill();
        g.lineWidth = 4;
        g.beginPath(); g.moveTo(447, 728); g.lineTo(690, 728); g.stroke();
        g.beginPath(); g.moveTo(400, 885); g.lineTo(738, 885); g.stroke();
        g.lineWidth = 3;
        g.beginPath(); g.moveTo(440, 740); g.lineTo(735, 880); g.moveTo(697, 740); g.lineTo(402, 880); g.stroke();
        g.beginPath(); g.moveTo(420, 800); g.lineTo(718, 800); g.stroke();
    });

    // ── cabins: hung under the rim, coloured by overprint, a dark window with a pale pane
    const COLS = [
        [['blue', 0.95]], [['pink', 1], ['yellow', 1]], [['pinkS', 0.35]], [['yellow', 1]],
    ];
    const order = [0, 1, 2, 3, 0, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3];
    for (let i = 0; i < 18; i++) {
        const a = -Math.PI / 2 + (i / 18) * Math.PI * 2;
        const ax = HX + Math.cos(a) * RIM, ay = HY + Math.sin(a) * RIM, cx = ax, cy = ay + 40;
        const body = (g) => { g.beginPath(); g.moveTo(cx - 26, cy - 14); g.lineTo(cx + 26, cy - 14); g.quadraticCurveTo(cx + 30, cy + 22, cx + 16, cy + 26); g.lineTo(cx - 16, cy + 26); g.quadraticCurveTo(cx - 30, cy + 22, cx - 26, cy - 14); g.closePath(); };
        knock((g) => { body(g); g.fill(); });
        for (const [name, v] of COLS[order[i]]) { const g = name === 'pinkS' ? pinkS : press.plate(name); g.fillStyle = T(v); body(g); g.fill(); }
        // outline, roof and hanger in navy
        ink([[navy, 0.9]], (g) => {
            g.lineWidth = 2.6; body(g); g.stroke();
            g.beginPath(); g.moveTo(cx - 24, cy - 14); g.lineTo(cx - 9, cy - 28); g.lineTo(cx + 9, cy - 28); g.lineTo(cx + 24, cy - 14); g.fill();
            g.lineWidth = 2.5; g.beginPath(); g.moveTo(ax, ay); g.lineTo(cx, cy - 28); g.stroke();
            g.fillRect(cx - 19, cy - 6, 38, 19);
        });
        // the pane: paper with a light screen
        knock((g) => g.fillRect(cx - 13, cy - 2, 26, 10));
        if (order[i] === 3) U.poly(yellow, [[cx - 13, cy - 2], [cx + 13, cy - 2], [cx + 13, cy + 8], [cx - 13, cy + 8]], 0.5);
    }

    // ── tents: radial pink/paper stripes, blue screen shading on the right, scalloped valance
    const tent = (px, py, x0, x1, yb, seed) => {
        const cone = (g) => { g.moveTo(px, py); g.bezierCurveTo(px + (x1 - px) * 0.55, py + 10, x1 - 10, yb - 60, x1, yb); g.lineTo(x0, yb); g.bezierCurveTo(x0 + 10, yb - 60, px - (px - x0) * 0.55, py + 10, px, py); g.closePath(); };
        knock((g) => { g.beginPath(); cone(g); g.fill(); g.fillRect(x0, yb, x1 - x0, 1000 - yb); });
        // roof stripes
        pink.save(); pink.beginPath(); cone(pink); pink.clip(); pink.fillStyle = T(0.95);
        const n = 12;
        for (let i = 0; i < n; i += 2) {
            const u0 = i / n, u1 = (i + 1) / n;
            pink.beginPath(); pink.moveTo(px, py); pink.lineTo(x0 + (x1 - x0) * u0, yb + 4); pink.lineTo(x0 + (x1 - x0) * u1, yb + 4); pink.fill();
        }
        pink.restore();
        // walls: vertical stripes
        const w = (x1 - x0) / 12;
        pink.fillStyle = T(0.95);
        for (let i = 0; i < 12; i += 2) pink.fillRect(x0 + i * w + w * 0.5, yb, w, 1000 - yb);
        // shading: blue screen ramping in on the right, yellow screen on the paper at the left
        for (const [g, a, b] of [[blueS, 0, 0.6], [yellowS, 0.12, 0]]) {
            g.save(); g.beginPath(); cone(g); g.rect(x0, yb, x1 - x0, 1000 - yb); g.clip();
            g.fillStyle = R.ramp(g, x0 + (x1 - x0) * 0.35, 0, x1, 0, a, b); g.fillRect(x0, py, x1 - x0, 1000 - py); g.restore();
        }
        // the valance: red scallops
        for (let x = x0; x < x1; x += 16) {
            knock((g) => { g.beginPath(); g.arc(x + 8, yb + 2, 8, 0, Math.PI); g.fill(); });
            for (const g of [pink, yellow]) { g.fillStyle = T(1); g.beginPath(); g.arc(x + 8, yb + 2, 7, 0, Math.PI); g.fill(); g.fillRect(x, yb - 4, 16, 6); }
        }
        // the peak and a little flag
        ink([[navy, 0.9]], (g) => { g.lineWidth = 3; g.beginPath(); g.moveTo(px, py + 4); g.lineTo(px, py - 34); g.stroke(); });
        for (const g of [pink, yellow]) { g.fillStyle = T(1); g.beginPath(); g.moveTo(px + 1, py - 34); g.lineTo(px + 20, py - 28); g.lineTo(px + 1, py - 22); g.fill(); }
    };
    tent(148, 654, -10, 346, 795, 'l');
    tent(930, 738, 775, 1090, 832, 'r');

    // ── stalls along the bottom: striped roofs, dark bodies, bright signs
    const stall = (x0, x1, sign) => {
        const m = (x0 + x1) / 2;
        const roof = [[m, 908], [x1 + 4, 950], [x0 - 4, 950]];
        knock((g) => { U.path(g, roof); g.fill(); });
        pink.save(); U.path(pink, roof); pink.clip(); pink.fillStyle = T(0.95);
        for (let i = 0; i < 10; i += 2) { pink.beginPath(); pink.moveTo(m, 908); pink.lineTo(x0 + (x1 - x0) * (i / 10), 952); pink.lineTo(x0 + (x1 - x0) * ((i + 1) / 10), 952); pink.fill(); }
        pink.restore();
        for (let x = x0; x < x1; x += 13) for (const g of [pink, yellow]) { g.fillStyle = T(1); g.beginPath(); g.arc(x + 6.5, 952, 6, 0, Math.PI); g.fill(); }
        ink([[navy, 0.95], [yellow, 0.5]], (g) => g.fillRect(x0 + 6, 958, x1 - x0 - 12, 50));
        knock((g) => g.fillRect(x0 + 22, 968, x1 - x0 - 44, 26));
        for (const [n, v] of sign) press.plate(n).fillStyle = T(v), press.plate(n).fillRect(x0 + 22, 968, x1 - x0 - 44, 26);
        // tiny bulbs on the fascia
        for (let x = x0 + 12; x < x1 - 8; x += 18) U.disc(yellow, x, 963, 2.6);
    };
    stall(272, 404, [['pink', 1], ['yellow', 1]]);
    stall(418, 560, []);
    stall(572, 700, [['yellow', 1]]);
    stall(712, 836, [['pink', 1]]);

    // ── strings of bulbs (garlands)
    const garland = (pts, n, seed) => {
        const r = Motion.rng('fg' + seed);
        ink([[navy, 0.8]], (g) => { g.lineWidth = 1.8; U.smooth(g, pts, false); g.stroke(); });
        // bulbs along the curve (sampled on the polyline)
        const segs = []; let L = 0;
        for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); L += l; }
        for (let k = 0; k < n; k++) {
            let s = ((k + 0.5) / n) * L, j = 0;
            while (j < segs.length - 1 && s > segs[j]) { s -= segs[j]; j++; }
            const f = s / segs[j], x = pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, y = pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f + 4;
            const c = Math.floor(r() * 4);
            knock((g) => { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); });
            if (c === 1) U.disc(yellow, x, y, 4.6);
            if (c === 2) { U.disc(yellow, x, y, 4.6); U.disc(pink, x, y, 4.6); }
            if (c === 3) U.disc(pink, x, y, 4.6, 0.7);
        }
    };
    garland([[0, 700], [60, 672], [148, 652]], 8, 1);
    garland([[148, 652], [230, 700], [300, 760], [346, 800]], 12, 2);
    garland([[346, 800], [360, 810], [420, 845]], 4, 3);
    garland([[0, 888], [120, 915], [260, 950], [410, 965]], 20, 4);
    garland([[760, 815], [850, 775], [930, 738]], 9, 5);
    garland([[930, 738], [980, 720], [1000, 716]], 3, 6);
    garland([[700, 955], [850, 925], [1000, 880]], 14, 7);
    // a thin pole with a pennant line on the right
    ink([[navy, 0.85], [yellow, 0.6]], (g) => { g.lineWidth = 3; g.beginPath(); g.moveTo(915, 720); g.quadraticCurveTo(965, 640, 975, 530); g.stroke(); g.lineWidth = 2; g.beginPath(); g.moveTo(960, 640); g.quadraticCurveTo(990, 700, 1000, 720); g.stroke(); });
};
// the film pushes in on this card: 1.01 % a frame about the centre (four corner
// patches correlated frame to frame against f247 (10.292 s), the frame it was measured on); one scale
// per drawing
CARDS.ferris = (press, t) => {
    const z = G3.push(0.0101, Math.floor(t * 12 + 1e-6), 0.5);
    press.save();
    press.each((g) => { g.translate(500, 500); g.scale(z, z); g.translate(-500, -500); });
    DRAW_FERRIS(press, t);
    press.restore();
};
