// Card «fireworks» (reference ≈ 9.2–9.45 s, full frame at 9.3): fireworks over a harbour at
// night, reflections in the water, a sailing boat, a crane. Drawn on the riso plates in the
// reference's 1000 × 1000 units, measured on the 9.3 s frame. Needs _g3-util.js (G3).
var CARDS = CARDS || {};
const DRAW_FIREWORKS = (press, t) => {
    const R = Riso, T = R.tone, U = G3;
    const d = Math.floor(t * 12 + 1e-6), grow = 1 + 0.025 * d; // bursts open a little on twos
    const pink = press.plate('pink'), pinkS = press.plate('pink', 'screen');
    const blue = press.plate('blue'), blueS = press.plate('blue', 'screen');
    const navy = press.plate('navy'), navyS = press.plate('navy', 'screen');
    const yellow = press.plate('yellow'), yellowS = press.plate('yellow', 'screen');
    const HOR = 655; // the waterline

    // ── sky: navy + blue dots at the top, pink rising to a purple haze at the horizon
    navyS.fillStyle = R.ramp(navyS, 0, 0, 0, HOR, 0.5, 0.72);
    navyS.fillRect(0, 0, 1000, HOR);
    blueS.fillStyle = R.ramp(blueS, 0, 0, 0, HOR, 0.72, 0.45);
    blueS.fillRect(0, 0, 1000, HOR);
    pinkS.fillStyle = R.ramp(pinkS, 0, 220, 0, HOR, 0.02, 0.5);
    pinkS.fillRect(0, 0, 1000, HOR);
    // soft purple smoke drifting across the middle
    for (const [x, y, rx, ry, v] of [[160, 470, 260, 70, 0.28], [520, 560, 300, 60, 0.3], [880, 330, 200, 90, 0.18], [420, 200, 160, 110, 0.12]]) {
        pinkS.fillStyle = R.radial(pinkS, x, y, 0, rx, v, 0);
        pinkS.save(); pinkS.translate(x, y); pinkS.scale(1, ry / rx); pinkS.translate(-x, -y);
        pinkS.fillRect(x - rx, y - rx, rx * 2, rx * 2);
        pinkS.restore();
    }
    // stars: paper specks
    const rs = Motion.rng('fw-stars');
    press.knockout((g) => {
        for (let i = 0; i < 170; i++) {
            const x = rs() * 1000, y = rs() * (HOR - 40), r = 0.8 + rs() * 1.6;
            g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
        }
    });

    // ── bursts
    const rays = (seed, cx, cy, R0, R1, n, fn) => {
        const r = Motion.rng('fw' + seed);
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.08;
            const L = (R1 * (0.66 + 0.34 * r())) * grow, sag = Math.max(0, Math.sin(a)) * 0.12 + 0.03;
            // a ray bends down a little (gravity): quadratic from the centre
            const x0 = cx + Math.cos(a) * R0, y0 = cy + Math.sin(a) * R0;
            const x1 = cx + Math.cos(a) * L, y1 = cy + Math.sin(a) * L + sag * L * 0.35;
            const xm = cx + Math.cos(a) * L * 0.6, ym = cy + Math.sin(a) * L * 0.6 + sag * L * 0.08;
            fn(x0, y0, xm, ym, x1, y1, r, i);
        }
    };
    const curve = (g, x0, y0, xm, ym, x1, y1, w) => {
        g.lineWidth = w; g.lineCap = 'round';
        g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(xm, ym, x1, y1); g.stroke();
    };
    // a big yellow chrysanthemum: thick tapering rays with round tips, the sky knocked out under them
    const bigYellow = (g, knock) => rays('y', 269, 272, 38, 250, 84, (x0, y0, xm, ym, x1, y1, r, i) => {
        const w = (i % 3 === 0 ? 5.2 : 3.8) + r() * 1.4, pad = knock ? 1.5 : 0;
        g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(xm, ym, x1, y1);
        g.lineCap = 'round';
        g.lineWidth = w * 0.45 + pad; g.stroke();
        // widening outer part
        g.beginPath(); const u = 0.45; g.moveTo(x0 + (xm - x0) * u, y0 + (ym - y0) * u); g.quadraticCurveTo(xm, ym, x1, y1);
        g.lineWidth = w + pad; g.stroke();
        g.beginPath(); g.arc(x1, y1, w * 0.7 + 1.4 + pad, 0, 7); g.fill();
    });
    press.knockout((g) => bigYellow(g, true));
    yellow.strokeStyle = T(1); yellow.fillStyle = T(1);
    bigYellow(yellow, false);
    // its heart: the sky with paper dots
    press.knockout((g) => {
        const r = Motion.rng('fw-heart');
        for (let i = 0; i < 70; i++) {
            const a = r() * 7, rr = Math.sqrt(r()) * 44;
            g.beginPath(); g.arc(269 + Math.cos(a) * rr, 266 + Math.sin(a) * rr, 2.6, 0, 7); g.fill();
        }
    });

    // the pink peony: dotted pink rays (a dense pink screen), long drooping trails, a yellow ring
    const pinkRays = (g, w) => rays('p', 742, 186, 20, 196, 58, (x0, y0, xm, ym, x1, y1, r, i) => {
        curve(g, x0, y0, xm, ym, x1, y1, w * (0.7 + r() * 0.6));
    });
    press.knockout((g) => pinkRays(g, 6.4));
    pinkS.strokeStyle = T(0.66); pinkRays(pinkS, 7);
    // falling willow trails below the peony
    const willow = (g, w) => {
        const r = Motion.rng('fw-willow');
        for (let i = 0; i < 16; i++) {
            const x = 640 + i * 13 + r() * 8, y0 = 270 + r() * 30, y1 = 350 + r() * 70;
            g.lineWidth = w; g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + (x - 742) * 0.1, (y0 + y1) / 2, x + (x - 742) * 0.15, y1); g.stroke();
        }
    };
    press.knockout((g) => willow(g, 3));
    pinkS.strokeStyle = T(0.6); willow(pinkS, 3.5);
    yellow.fillStyle = T(1);
    for (let i = 0; i < 22; i++) {
        const a = (i / 22) * Math.PI * 2 + 0.1, rr = (82 + 14 * Math.sin(i * 2.3)) * grow;
        const x = 742 + Math.cos(a) * rr, y = 186 + Math.sin(a) * rr, r = 2.8 + (i % 3);
        press.knockout((g) => { g.beginPath(); g.arc(x, y, r + 1, 0, 7); g.fill(); });
        U.disc(yellow, x, y, r);
    }

    // the white burst: thin paper rays with a faint pink tinge
    const whiteRays = (g) => rays('w', 603, 487, 0, 112, 78, (x0, y0, xm, ym, x1, y1, r) => {
        curve(g, x0, y0, xm, ym, x1, y1, 2.4 + r() * 1.4);
        g.beginPath(); g.arc(x1, y1, 2.6, 0, 7); g.fill();
    });
    press.knockout(whiteRays);
    pinkS.strokeStyle = T(0.08); pinkS.fillStyle = T(0.08); whiteRays(pinkS);

    // the red-orange burst (pink + yellow) and the small yellow one
    const thin = (seed, cx, cy, R1, n, w) => (g) => rays(seed, cx, cy, 0, R1, n, (x0, y0, xm, ym, x1, y1, r) => {
        curve(g, x0, y0, xm, ym, x1, y1, w * (0.8 + r() * 0.5));
        g.beginPath(); g.arc(x1, y1, w * 0.9, 0, 7); g.fill();
    });
    const orange = thin('o', 95, 537, 92, 56, 2.6), small = thin('s', 925, 503, 80, 58, 2.6);
    press.knockout(orange); press.knockout(small);
    for (const g of [pink, yellow]) { g.strokeStyle = T(1); g.fillStyle = T(1); orange(g); }
    yellow.strokeStyle = T(1); yellow.fillStyle = T(1); small(yellow);

    // rising trails (pale pink lines from the harbour)
    const trails = (g, w) => {
        for (const [x, y0, x1] of [[276, 525, 280], [752, 395, 748], [926, 580, 930], [99, 625, 97]]) {
            g.lineWidth = w; g.beginPath(); g.moveTo(x1, 640); g.bezierCurveTo(x1 + 4, 600, x - 5, y0 + 50, x, y0); g.stroke();
        }
    };
    press.knockout((g) => trails(g, 3.4));
    pinkS.strokeStyle = T(0.45); trails(pinkS, 3);

    // ── the crane (dark olive: navy + yellow + a little pink)
    const dark = (fn) => { for (const [g, v] of [[navy, 0.9], [yellow, 1]]) { g.save(); g.strokeStyle = T(v); g.fillStyle = T(v); fn(g); g.restore(); } };
    dark((g) => {
        g.lineCap = 'butt';
        for (const x of [812, 834]) { g.lineWidth = 6; g.beginPath(); g.moveTo(x, 372); g.lineTo(x + (x - 823) * 0.25, 640); g.stroke(); }
        g.lineWidth = 2.4;
        for (let y = 420; y < 630; y += 42) { g.beginPath(); g.moveTo(812, y); g.lineTo(837, y + 42); g.moveTo(837, y); g.lineTo(812, y + 42); g.stroke(); }
        g.lineWidth = 8.5; g.beginPath(); g.moveTo(628, 410); g.lineTo(902, 406); g.stroke();
        g.lineWidth = 3.4; g.beginPath(); g.moveTo(640, 404); g.lineTo(826, 366); g.lineTo(900, 404); g.stroke();
        g.lineWidth = 2; g.beginPath(); g.moveTo(690, 410); g.lineTo(691, 548); g.stroke();
        g.fillRect(663, 546, 38, 34);
    });
    // ── the harbour skyline: warehouses and a quay
    const sky = [[0, 598, 18], [112, 612, 205], [300, 622, 420], [455, 612, 535], [540, 600, 672], [672, 618, 790], [860, 622, 960], [965, 612, 1000]];
    dark((g) => {
        g.fillRect(0, 632, 1000, HOR - 632 + 2);
        for (const [x0, y, x1] of sky) g.fillRect(x0, y, x1 - x0, 640 - y);
    });
    // quay lights
    const rl = Motion.rng('fw-lights');
    for (let i = 0; i < 26; i++) {
        const x = rl() * 1000, y = 612 + rl() * 38, k = rl();
        press.knockout((g) => { g.beginPath(); g.arc(x, y, 2.4, 0, 7); g.fill(); });
        if (k < 0.7) U.disc(yellow, x, y, 2.6); else U.disc(pink, x, y, 2.6);
    }

    // ── the water: purple (navy + pink) with pale blue streaks
    navy.fillStyle = T(1); navy.fillRect(0, HOR, 1000, 345);
    pink.fillStyle = T(0.2); pink.fillRect(0, HOR, 1000, 345);
    blue.fillStyle = T(0.12); blue.fillRect(0, HOR, 1000, 345);
    // mottled: darker navy clouds in the water
    for (const [x, y, rr] of [[150, 760, 180], [520, 930, 220], [860, 820, 170], [380, 700, 120]]) { navy.fillStyle = R.radial(navy, x, y, 0, rr, 0.18, 0); navy.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    const rw = Motion.rng('fw-water');
    const streaks = [];
    for (let i = 0; i < 180; i++) {
        const y = HOR + 8 + rw() * 340, x = rw() * 1050 - 50, L = 15 + rw() * 70;
        streaks.push([x, y, L, 1.8 + rw() * 1.8]);
    }
    for (const g of [navy, pink]) {
        g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000';
        for (const [x, y, L, w] of streaks) g.fillRect(x, y, L, w);
        g.restore();
    }
    blue.fillStyle = T(1);
    for (const [x, y, L, w] of streaks) blue.fillRect(x, y, L, w);

    // reflections: stacked bars of each burst's colour, breaking up downwards
    const refl = (seed, cx, spread, y0, y1, inks, n, maxW) => {
        const r = Motion.rng('fwr' + seed), bars = [];
        for (let i = 0; i < n; i++) {
            const u = r(), y = y0 + u * u * (y1 - y0) * 1.05, w = maxW * (1 - 0.6 * u) * (0.4 + 0.8 * r());
            const x = cx + (r() - 0.5) * spread * (1 + u * 0.8);
            bars.push([x - w / 2, y, w, 3 + r() * 3.5]);
        }
        press.knockout((g) => bars.forEach(([x, y, w, h]) => g.fillRect(x - 1, y - 1, w + 2, h + 2)));
        for (const [ink, v] of inks) { const g = press.plate(ink); g.fillStyle = T(v); bars.forEach(([x, y, w, h]) => g.fillRect(x, y, w, h)); }
    };
    refl('y', 262, 150, HOR + 8, 1000, [['yellow', 1]], 85, 70);
    refl('p', 750, 90, HOR + 8, 880, [['pink', 1]], 60, 80);
    refl('w', 605, 60, HOR + 8, 820, [], 22, 50);
    refl('o', 92, 30, HOR + 8, 1000, [['pink', 1], ['yellow', 1]], 30, 34);
    refl('s', 925, 30, HOR + 8, 1000, [['yellow', 1]], 32, 38);
    refl('m', 500, 900, 880, 1000, [['yellow', 1]], 16, 30);
    refl('n', 700, 700, 880, 1000, [['pink', 1]], 18, 26);

    // grain in the water: pink and paper specks
    const rk = Motion.rng('fw-specks');
    for (let i = 0; i < 260; i++) {
        const x = rk() * 1000, y = HOR + rk() * 345, r = 0.8 + rk() * 1.3;
        if (rk() < 0.5) U.disc(pink, x, y, r); else press.knockout((g) => { g.beginPath(); g.arc(x, y, r * 0.8, 0, 7); g.fill(); });
    }

    // ── the sailing boat and its mast, rigging, and reflection
    dark((g) => {
        g.lineCap = 'round';
        g.lineWidth = 5.5; g.beginPath(); g.moveTo(430, 512); g.lineTo(431, 842); g.stroke();
        g.lineWidth = 2; g.beginPath(); g.moveTo(208, 836); g.lineTo(430, 520); g.lineTo(585, 800); g.stroke();
        g.beginPath(); g.moveTo(200, 838); g.lineTo(608, 830); g.quadraticCurveTo(590, 862, 565, 890); g.lineTo(222, 892); g.quadraticCurveTo(206, 866, 200, 838); g.fill();
        g.beginPath(); g.moveTo(275, 838); g.lineTo(290, 818); g.lineTo(410, 816); g.lineTo(420, 836); g.fill();
        // mast reflection, broken
        g.lineWidth = 4;
        for (let y = 895; y < 1000; y += 14) { g.beginPath(); g.moveTo(431, y); g.lineTo(431, y + 8); g.stroke(); }
        g.globalAlpha = 0.6; g.fillRect(240, 895, 300, 10);
    });
    for (const x of [252, 318, 372]) { press.knockout((g) => { g.beginPath(); g.arc(x, 852, 3, 0, 7); g.fill(); }); U.disc(yellow, x, 852, 3.2); }
    U.disc(pink, 430, 512, 4); U.disc(yellow, 430, 512, 2);
    // the small motor boat
    dark((g) => {
        g.beginPath(); g.moveTo(680, 732); g.lineTo(862, 736); g.lineTo(846, 757); g.lineTo(700, 757); g.fill();
        g.beginPath(); g.moveTo(752, 734); g.lineTo(756, 706); g.lineTo(818, 706); g.lineTo(826, 734); g.fill();
        g.lineWidth = 2; g.beginPath(); g.moveTo(800, 706); g.lineTo(800, 690); g.stroke();
    });
    for (const x of [781, 798]) { press.knockout((g) => { g.beginPath(); g.arc(x, 719, 4.5, 0, 7); g.fill(); }); U.disc(yellow, x, 719, 4.6); }
    // a dinghy on the left
    dark((g) => { g.beginPath(); g.moveTo(112, 712); g.lineTo(195, 713); g.lineTo(185, 722); g.lineTo(120, 722); g.fill(); });
};
// the film pushes in on this card: 0.76 % a frame about the centre (four corner
// patches correlated frame to frame against f223 (9.292 s), the frame it was measured on); one scale
// per frame
CARDS.fireworks = (press, t, lf) => {
    const z = G3.push(0.0076, t, lf, 1);
    press.save();
    press.each((g) => { g.translate(500, 500); g.scale(z, z); g.translate(-500, -500); });
    DRAW_FIREWORKS(press, t);
    press.restore();
};
