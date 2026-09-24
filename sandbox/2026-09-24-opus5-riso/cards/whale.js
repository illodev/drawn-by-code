// Card «whale» (reference ≈ 11.0–11.25 s, full frame at 11.1): a whale gliding through blue
// water, shafts of light from above, rings of light round its head. 1000 × 1000 units,
// measured on the 11.1 s frame. Needs _g3-util.js (G3).
var CARDS = CARDS || {};
CARDS.whale = (press, t) => {
    const R = Riso, T = R.tone, U = G3;
    const d = Math.floor(t * 12 + 1e-6);
    const pink = press.plate('pink'), pinkS = press.plate('pink', 'screen');
    const blue = press.plate('blue'), blueS = press.plate('blue', 'screen');
    const navy = press.plate('navy'), navyS = press.plate('navy', 'screen');
    const yellow = press.plate('yellow'), yellowS = press.plate('yellow', 'screen');
    const off = (g, fn) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; fn(g); g.restore(); };
    const dx = d * 3, dy = -d * 1.2; // the whale glides up-right a little each drawing

    // ── water: a dense blue screen (paper shows as white dots), deeper to the bottom
    blueS.fillStyle = R.ramp(blueS, 0, 0, 0, 1000, 0.32, 0.85); blueS.fillRect(0, 0, 1000, 1000);
    navyS.fillStyle = R.ramp(navyS, 0, 500, 0, 1000, 0, 0.36); navyS.fillRect(0, 450, 1000, 550);
    pinkS.fillStyle = R.ramp(pinkS, 0, 700, 0, 1000, 0, 0.12); pinkS.fillRect(0, 700, 1000, 300);

    // ── shafts of light: yellow screen bands, the blue thinned inside them, fading downwards
    const shaft = (x0, x1, y0, x2, x3, y1, v) => {
        const pts = [[x0, y0], [x1, y0], [x3, y1], [x2, y1]];
        yellowS.fillStyle = R.ramp(yellowS, 0, y0, 0, y1, v, 0); U.path(yellowS, pts); yellowS.fill();
        off(blueS, (g) => { g.fillStyle = R.ramp(g, 0, y0, 0, y1, 0.3, 0); U.path(g, pts); g.fill(); });
        // streaks along the shaft: thin paper lines
        const r = Motion.rng('wh-sh' + x0);
        press.knockout((g) => { g.lineWidth = 1.4; for (let i = 0; i < 9; i++) { const u = r(), v2 = 0.3 + r() * 0.6; g.globalAlpha = 0.5; g.beginPath(); g.moveTo(x0 + (x1 - x0) * u + (x2 - x0) * v2 * 0.6, y0 + (y1 - y0) * v2 * 0.6); g.lineTo(x0 + (x1 - x0) * u + (x2 - x0) * v2, y0 + (y1 - y0) * v2); g.stroke(); } });
    };
    shaft(20, 110, 0, 150, 300, 560, 0.8);
    shaft(130, 230, 0, 260, 420, 700, 0.85);
    shaft(600, 700, 0, 700, 860, 520, 0.75);
    shaft(770, 860, 0, 840, 960, 320, 0.65);
    // sparkles: yellow flecks in the left shafts
    const rf = Motion.rng('wh-fleck');
    for (let i = 0; i < 24; i++) {
        const x = 200 + rf() * 180, y = 180 + rf() * 220, w = 6 + rf() * 12;
        off(blueS, (g) => { g.beginPath(); g.ellipse(x, y, w, 4, -0.3, 0, 7); g.fill(); });
        U.ell(yellow, x, y, w, 3.6, -0.3, 1);
    }

    // ── rings of light round the head: yellow arcs, each with a paper line inside
    const HC = [1030 + dx, 560 + dy];
    for (let i = 0; i < 9; i++) {
        const r = 75 + i * 50 + (d % 2) * 5, a0 = Math.PI * (1.0 + i * 0.012), a1 = Math.PI * (1.3 + i * 0.012);
        const w = i === 0 ? 14 : 6 - i * 0.35;
        press.knockout((g) => { g.lineWidth = w + 4; g.lineCap = 'round'; g.beginPath(); g.arc(HC[0], HC[1], r, a0, a1); g.stroke(); });
        yellow.save(); yellow.strokeStyle = T(1); yellow.lineWidth = w; yellow.lineCap = 'round';
        yellow.beginPath(); yellow.arc(HC[0], HC[1], r + 2, a0, a1); yellow.stroke(); yellow.restore();
    }

    // ── the whale: navy + pink (deep purple) with a blue screen, a blue stripe, grooves
    press.save();
    press.each((g) => g.translate(dx, dy));
    const body = [[95, 870], [200, 830], [320, 760], [460, 680], [600, 600], [720, 548], [830, 526], [900, 532], [938, 575], [940, 640], [915, 700], [840, 745], [720, 788], [600, 812], [460, 842], [300, 876], [150, 896]];
    const fluke = [[0, 790], [40, 810], [80, 850], [110, 880], [100, 900], [60, 940], [40, 1000], [0, 1000]];
    const fin = [[600, 805], [578, 850], [540, 900], [480, 950], [436, 972], [450, 940], [494, 880], [520, 836], [540, 808]];
    const all = (g) => { U.smooth(g, body, true, true); U.smooth(g, fluke, true, false); U.smooth(g, fin, true, false); };
    press.knockout((g) => { all(g); g.fill(); });
    for (const [g, v] of [[navy, 0.95], [pink, 0.3]]) { g.fillStyle = T(v); all(g); g.fill(); }
    // a faint blue sheen along the back (blue screen)
    blueS.save(); all(blueS); blueS.clip(); blueS.fillStyle = R.ramp(blueS, 0, 560, 0, 760, 0.5, 0); blueS.fillRect(0, 500, 1000, 300); blueS.restore();
    // the belly a touch lighter: less navy
    // the stripe along the flank: navy and pink knocked, blue shows
    const stripe = (g, w) => { g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(215, 846); g.bezierCurveTo(420, 740, 560, 620, 810, 568); g.stroke(); };
    off(navy, (g) => stripe(g, 8)); off(pink, (g) => stripe(g, 8));
    blue.save(); blue.strokeStyle = T(0.8); stripe(blue, 8); blue.restore();
    // speckles: pink and blue spots (barnacles)
    const rp = Motion.rng('wh-spots');
    for (let i = 0; i < 26; i++) {
        const x = 420 + rp() * 330, y = 620 + rp() * 140 - (x - 420) * 0.25, r = 2.5 + rp() * 3;
        if (rp() < 0.55) { off(navy, (g) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }); U.disc(pink, x, y, r, 1); }
        else { off(navy, (g) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }); off(pink, (g) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }); U.disc(blue, x, y, r, 0.8); }
    }
    // throat grooves: paper lines with a pink tint, fanning to the jaw
    for (let i = 0; i < 7; i++) {
        const ln = (g) => { g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(575 - i * 2, 800 - i * 10); g.quadraticCurveTo(760, 735 - i * 10, 912, 690 - i * 11); g.stroke(); };
        press.knockout(ln);
        pink.save(); pink.strokeStyle = T(0.35); pink.lineWidth = 1; pink.beginPath(); pink.moveTo(575 - i * 2, 801 - i * 10); pink.quadraticCurveTo(760, 736 - i * 10, 912, 691 - i * 11); pink.stroke(); pink.restore();
    }
    // the eye and the blowhole
    press.knockout((g) => { g.beginPath(); g.arc(866, 594, 7, 0, 7); g.fill(); });
    U.disc(navy, 868, 595, 3.5); U.disc(blue, 868, 595, 5, 0.6);
    press.knockout((g) => { g.lineWidth = 3; g.beginPath(); g.arc(872, 545, 9, 0, 7); g.stroke(); });
    pink.save(); pink.strokeStyle = T(1); pink.lineWidth = 2.6; pink.beginPath(); pink.arc(872, 545, 9, 0, 7); pink.stroke(); pink.restore();
    // the far flipper's edge: a paper line down the fin
    press.knockout((g) => { g.lineWidth = 2; g.beginPath(); g.moveTo(552, 806); g.quadraticCurveTo(500, 870, 440, 950); g.stroke(); });
    press.restore();
};
