// Card «kettle» (reference ≈ 9.7–9.95 s, full frame at 9.8): a red enamel kettle whistling in
// front of a tiled kitchen wall, steam curling up. 1000 × 1000 units, measured on the 9.8 s
// frame. Needs _g3-util.js (G3).
var CARDS = CARDS || {};
CARDS.kettle = (press, t) => {
    const R = Riso, T = R.tone, U = G3;
    const d = Math.floor(t * 12 + 1e-6);
    const pink = press.plate('pink'), pinkS = press.plate('pink', 'screen');
    const blue = press.plate('blue'), blueS = press.plate('blue', 'screen');
    const navy = press.plate('navy'), navyS = press.plate('navy', 'screen');
    const yellow = press.plate('yellow'), yellowS = press.plate('yellow', 'screen');
    const fillS = (g, pts, v) => { g.fillStyle = typeof v === 'number' ? T(v) : v; U.smooth(g, pts); g.fill(); };
    const fillP = (g, pts, v) => { g.fillStyle = typeof v === 'number' ? T(v) : v; U.path(g, pts); g.fill(); };
    const knockP = (g, fn) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; fn(g); g.restore(); };

    // ── the wall: blue-screened tiles with white grout, each tile a little different
    const VX = [-40, 146, 332, 522, 713, 905, 1100], HY = [-130, 58, 243, 430, 612, 790, 968, 1150];
    const rt = Motion.rng('kt-tiles');
    for (let i = 0; i < VX.length - 1; i++) for (let j = 0; j < HY.length - 1; j++) {
        const x0 = VX[i] + 4, x1 = VX[i + 1] - 4, y0 = HY[j] + 4, y1 = HY[j + 1] - 4;
        const v = 0.3 + rt() * 0.07;
        // a soft diagonal sheen across the tile: the screen lighter along a band
        const gr = blueS.createLinearGradient(x0, y1, x1, y0);
        const s = 0.3 + rt() * 0.4;
        gr.addColorStop(0, T(v + 0.06)); gr.addColorStop(Math.max(0, s - 0.12), T(v)); gr.addColorStop(s, T(v * 0.75)); gr.addColorStop(Math.min(1, s + 0.12), T(v)); gr.addColorStop(1, T(v - 0.03));
        blueS.fillStyle = gr;
        blueS.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
    // the odd tile with a thin white glint line
    press.knockout((g) => {
        g.lineWidth = 2.2;
        for (const [x, y, L] of [[170, 700, 70], [360, 330, 60], [560, 150, 50], [740, 120, 80], [180, 880, 50], [930, 470, 50]]) { g.beginPath(); g.moveTo(x, y + L * 0.7); g.lineTo(x + L, y); g.stroke(); }
    });

    // ── steam: a paper cloud rising from the spout (the screen fades out at its edge)
    const lift = d * 4;
    const steam = [[168, 556], [128, 470], [104, 390], [104, 320], [132, 250], [168, 180], [232, 100], [290, 40], [330, -40], [860, -40], [835, 10], [770, 25], [705, 50], [650, 85], [570, 105], [500, 125], [450, 180], [380, 232], [312, 248], [255, 290], [214, 360], [200, 440], [214, 520]].map(([x, y]) => [x, y - lift * (1 - y / 700)]);
    // soft edge: knock a slightly larger cloud partly, then the cloud fully
    press.knockout((g) => { g.globalAlpha = 0.45; g.lineWidth = 34; g.lineJoin = 'round'; U.smooth(g, steam); g.stroke(); g.globalAlpha = 1; U.smooth(g, steam); g.fill(); });
    // puff outlines: short blue scallops along the underside
    const scallop = (x0, y0, x1, y1, bulge) => { blue.beginPath(); blue.moveTo(x0, y0); blue.quadraticCurveTo((x0 + x1) / 2 + bulge, (y0 + y1) / 2 + bulge, x1, y1); blue.stroke(); };
    blue.save(); blue.strokeStyle = T(0.95); blue.lineWidth = 3; blue.lineCap = 'round';
    scallop(318, 238 - lift * 0.66, 350, 160 - lift * 0.8, 10);
    scallop(385, 222 - lift * 0.66, 460, 168 - lift * 0.77, 12);
    scallop(452, 170 - lift * 0.7, 490, 78 - lift * 0.9, 10);
    scallop(610, 100 - lift * 0.85, 690, 0 - lift, 16);
    scallop(760, 22 - lift, 835, -5 - lift, 6);
    blue.restore();

    // ── the handle: a thick dark arch (navy over yellow and pink: near black), a yellow glint
    const handle = (g, w) => {
        g.lineWidth = w; g.lineCap = 'round';
        g.beginPath(); g.moveTo(528, 660); g.bezierCurveTo(520, 420, 600, 300, 730, 290); g.bezierCurveTo(870, 285, 960, 330, 990, 460); g.lineTo(1000, 560); g.stroke();
    };
    press.knockout((g) => handle(g, 50));
    for (const [g, v] of [[navy, 1], [yellow, 1], [pink, 0.3]]) { g.save(); g.strokeStyle = T(v); handle(g, 44); g.restore(); }
    // the glint along its inner left side: yellow only (navy and pink knocked)
    for (const g of [navy, pink]) knockP(g, (k) => { k.lineWidth = 5; k.lineCap = 'round'; k.beginPath(); k.moveTo(522, 630); k.bezierCurveTo(525, 470, 590, 360, 720, 318); k.stroke(); });

    // ── the kettle body: red (pink + yellow), texture, navy shading at the left
    const body = [[378, 1000], [384, 900], [406, 800], [458, 710], [532, 648], [606, 624], [1000, 612], [1000, 1000]];
    const spout = [[410, 905], [335, 850], [272, 780], [222, 700], [190, 628], [242, 622], [300, 668], [362, 730], [430, 790], [440, 860]];
    const lid = [[590, 612], [600, 580], [640, 545], [720, 527], [820, 522], [905, 535], [945, 560], [950, 598], [940, 612]];
    press.knockout((g) => { U.smooth(g, spout); g.fill(); U.path(g, body); g.fill(); U.smooth(g, lid); g.fill(); });
    for (const [g, v] of [[pink, 0.95], [yellowS, 0.62], [yellow, 0.05]]) { fillS(g, spout, v); fillP(g, body, v); fillS(g, lid, v); }
    // enamel grain: the yellow is stippled (pink shows through in fine specks), not screened
    const rg = Motion.rng('kt-grain');
    for (const [g, n, r0] of [[yellowS, 2600, 1.1], [pink, 700, 0.8]]) {
        g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.beginPath();
        for (let i = 0; i < n; i++) { const x = 190 + rg() * 810, y = 500 + rg() * 500, r = r0 * (0.6 + rg() * 0.8); g.moveTo(x + r, y); g.arc(x, y, r, 0, 7); }
        g.fill(); g.restore();
    }
    // enamel texture: a light pink screen breaking the flat, paper and yellow specks
        const rk = Motion.rng('kt-specks');
    for (let i = 0; i < 90; i++) {
        const x = 420 + rk() * 580, y = 540 + rk() * 460;
        if (rk() < 0.5) press.knockout((g) => { g.beginPath(); g.arc(x, y, 1 + rk() * 1.2, 0, 7); g.fill(); });
        else U.disc(yellow, x, y, 1.6);
    }
    // shading: navy dots down the left of the body and the underside of the spout
    navyS.save(); U.path(navyS, body); navyS.clip();
    navyS.fillStyle = R.ramp(navyS, 380, 0, 500, 0, 0.75, 0); navyS.fillRect(370, 780, 200, 220);
    navyS.restore();
    navyS.save(); U.smooth(navyS, spout); navyS.clip();
    navyS.fillStyle = R.ramp(navyS, 300, 700, 250, 800, 0, 0.6); navyS.fillRect(180, 640, 280, 280);
    navyS.restore();
    // the lid: navy dots on its right shoulder, a white rim highlight, the dark seam
    navyS.save(); U.smooth(navyS, lid); navyS.clip();
    navyS.fillStyle = R.ramp(navyS, 800, 0, 950, 0, 0, 0.6); navyS.fillRect(780, 510, 180, 110); navyS.restore();
    press.knockout((g) => { g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(638, 560); g.quadraticCurveTo(680, 540, 740, 534); g.stroke(); });
    for (const [g, v] of [[navy, 0.95], [pink, 0.4]]) U.stroke(g, [[600, 612], [760, 605], [1000, 604]], 8, v);
    press.knockout((g) => { g.lineWidth = 3; g.beginPath(); g.moveTo(610, 620); g.lineTo(1000, 614); g.stroke(); });
    blueS.fillStyle = T(0.6); blueS.fillRect(946, 585, 54, 22);
    // the knob
    for (const [g, v] of [[navy, 0.95], [yellow, 0.9], [pink, 0.4]]) U.ell(g, 768, 497, 38, 30, 0, v);
    for (const [g, v] of [[navy, 0.95], [yellow, 0.9]]) g.fillRect(752, 520, 32, 10);
    knockP(navy, (g) => { g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.arc(768, 500, 24, 3.6, 4.4); g.stroke(); });
    knockP(pink, (g) => { g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.arc(768, 500, 24, 3.6, 4.4); g.stroke(); });

    // ── the reflection: a window (paper) with pink glazing bars, the handle's dark shadow above
    const win = [[462, 768], [506, 712], [628, 680], [606, 738], [612, 748], [494, 812]];
    press.knockout((g) => { U.path(g, win); g.fill(); });
    for (const [g, v] of [[pink, 0.85]]) { U.stroke(g, [[480, 780], [620, 710]], 3, v); U.stroke(g, [[548, 700], [553, 790]], 3, v); }
    for (const [g, v] of [[navy, 0.95], [yellow, 0.8]]) fillP(g, [[505, 715], [520, 660], [540, 640], [545, 700]], v);
    // the rim highlight down the left edge
    press.knockout((g) => { g.lineWidth = 4.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(560, 650); g.quadraticCurveTo(450, 740, 418, 960); g.stroke(); });
    // the dark outline on the body's left edge
    for (const [g, v] of [[navy, 0.9], [yellow, 0.6]]) { g.save(); g.strokeStyle = T(v); g.lineWidth = 5; g.beginPath(); g.moveTo(378, 1000); g.lineTo(384, 900); g.quadraticCurveTo(396, 820, 428, 770); g.stroke(); g.restore(); }

    // ── the spout's whistle: a dark cap, a wire clip with a ball
    const cap = [[172, 548], [190, 532], [212, 545], [245, 612], [230, 632], [205, 638], [182, 600]];
    press.knockout((g) => { U.smooth(g, cap); g.fill(); });
    for (const [g, v] of [[navy, 0.95], [yellow, 0.9], [pink, 0.4]]) fillS(g, cap, v);
    knockP(navy, (g) => { g.lineWidth = 3.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(190, 548); g.lineTo(226, 605); g.stroke(); });
    knockP(pink, (g) => { g.lineWidth = 3.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(190, 548); g.lineTo(226, 605); g.stroke(); });
    for (const [g, v] of [[navy, 0.95], [yellow, 0.8]]) { U.stroke(g, [[232, 598], [262, 588], [285, 596], [300, 614]], 3.5, v); U.disc(g, 302, 618, 9, v); }
    press.knockout((g) => { g.beginPath(); g.arc(299, 614, 2.5, 0, 7); g.fill(); });
};
