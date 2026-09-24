// Card «phone» (reference 6.95–7.3 s, full frame). A rotary telephone ringing: the handset
// jumps off its cradle on twos with white echo outlines and vibration ticks, rays and white
// rings behind, an orange table with a dotted shadow. Authored in reference pixels
// (G1.frame), measured on the 7.1 s frame. Separations: background = pink solid with yellow
// screen rays (orange dots); rings and highlights = knockouts; phone = blue solid (pink
// knocked out) with navy hatching and navy dots on the cups; dial ring = yellow; finger
// holes = paper with pink centres; table = pink + yellow solid, shadow = navy screen.
var CARDS = CARDS || {};
CARDS.phone = (press, t) => {
    const { T, fill, stroke, taper, smoothPath, polyPath, clipped, specks } = G1;
    const P = (ink, k) => press.plate(ink, k);
    const pink = P('pink'), pinkS = P('pink', 'screen'), yellow = P('yellow'), yellowS = P('yellow', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const erase = (g, fn) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; fn(g); g.restore(); };
    const d = Math.floor(t * 12 + 1e-6);
    // the handset's jiggle per drawing (dx, dy, tilt) and the rings' slight wobble
    const JIG = [[0, 0, 0], [-6, -8, -0.012], [5, -3, 0.01], [-3, -10, -0.006], [6, -5, 0.012], [-5, -2, -0.01]];
    const [jx, jy, ja] = JIG[d % JIG.length];

    G1.frame(press, () => {
        // --- background: flat pink, rays of yellow dots from behind the phone
        fill(pink, [[0, 0], [1080, 0], [1080, 940], [0, 940]], 0.88);
        const RC = [560, 510];
        for (let i = 0; i < 18; i++) {
            const a = (i / 18) * Math.PI * 2 + 0.09, s = 0.085;
            fill(yellowS, [RC, [RC[0] + Math.cos(a - s) * 1400, RC[1] + Math.sin(a - s) * 1400], [RC[0] + Math.cos(a + s) * 1400, RC[1] + Math.sin(a + s) * 1400]], 0.42);
        }
        erase(yellowS, (g) => { g.beginPath(); g.arc(RC[0], RC[1], 90, 0, 7); g.fill(); });
        // the rings (white, hand drawn)
        press.knockout((g) => {
            for (const [r, w, s] of [[395, 11, 'a'], [505, 9, 'b'], [620, 8, 'c']]) Riso.ring(g, 578, 502, r + (d % 2) * 3, w, 'ph' + s, { wobble: 0.02 });
        });
        press.knockout((g) => specks(g, 'ph-st', 0, 0, 1080, 930, 50, 1, 2.2));

        // --- the table: orange (pink + yellow), a navy edge, the dotted shadow, two cracks
        const table = [[-10, 932], [1090, 928], [1090, 1090], [-10, 1090]];
        fill(pink, table, 1);
        fill(yellow, table, 1);
        stroke(navy, [[0, 931], [540, 930], [1080, 926]], 4, 1, false);
        navyS.fillStyle = T(0.4);
        navyS.beginPath(); navyS.ellipse(560, 972, 480, 26, -0.01, 0, 7); navyS.fill();
        taper(navy, [[820, 948], [770, 990], [680, 1020], [640, 1030]], 4, 2);
        taper(navy, [[850, 1000], [760, 1040], [690, 1080]], 3, 2);
        specks(yellow, 'ph-tab', 0, 950, 1080, 1080, 40, 1.5, 3);

        // --- the body
        const body = [[168, 932], [172, 860], [190, 740], [230, 680], [272, 640], [320, 612], [540, 598], [770, 606], [812, 630], [852, 690], [890, 820], [906, 900], [900, 934]];
        const bodyPath = (g) => smoothPath(g, body, true, 0.12);
        press.knockout((g) => { bodyPath(g); g.fill(); });
        blue.fillStyle = T(1); bodyPath(blue); blue.fill();
        // right side shading: diagonal navy hatching
        clipped(navy, bodyPath, (g) => {
            const r = Motion.rng('ph-hatch');
            for (let i = 0; i < 70; i++) {
                const x = 620 + i * 5 + r() * 6, y = 600 + r() * 60;
                taper(g, [[x + 60, y], [x - 60, y + 330 + r() * 60]], 2.2 + r() * 1.4, 1.2, 0.85);
            }
        });
        clipped(navyS, bodyPath, (g) => { g.fillStyle = Riso.ramp(g, 640, 0, 900, 0, 0, 0.35); g.fillRect(620, 580, 300, 360); });
        // highlight on the left (white), a bottom rim line
        press.knockout((g) => {
            taper(g, [[330, 632], [280, 668], [240, 720], [222, 800], [216, 886]], 12, 7);
            taper(g, [[330, 632], [540, 624], [760, 628]], 9, 4);
            g.fillRect(430, 928, 460, 3);
        });
        // the cradle posts
        for (const x of [385, 692]) {
            const post = [[x - 30, 610], [x - 28, 560], [x - 22, 535], [x - 12, 535], [x - 10, 548], [x + 10, 548], [x + 12, 535], [x + 22, 535], [x + 28, 560], [x + 32, 610]];
            press.knockout((g) => { polyPath(g, post); g.fill(); });
            fill(blue, post, 1);
            press.knockout((g) => g.fillRect(x - 6, 552, 12, 20));
            taper(navy, [[x + 26, 560], [x + 30, 606]], 3, 2);
        }
        // the dial: a yellow ring, blue face, white finger holes with pink centres, the hub
        const DC = [542, 786];
        erase(blue, (g) => { g.lineWidth = 13; g.beginPath(); g.arc(DC[0], DC[1], 164, 0, 7); g.stroke(); });
        yellow.strokeStyle = T(1); yellow.lineWidth = 11; yellow.beginPath(); yellow.arc(DC[0], DC[1], 164, 0, 7); yellow.stroke();
        press.knockout((g) => { g.lineWidth = 3; g.beginPath(); g.arc(DC[0], DC[1], 154, 0, 7); g.stroke(); });
        const holes = [];
        for (let i = 0; i < 10; i++) { const a = Math.PI * 0.9 + (i / 9) * Math.PI * 1.43; holes.push([DC[0] + 4 + Math.cos(a) * 110, DC[1] - 8 + Math.sin(a) * 106]); }
        press.knockout((g) => { for (const [x, y] of holes) { g.beginPath(); g.arc(x, y, 29, 0, 7); g.fill(); } g.beginPath(); g.arc(DC[0], DC[1], 48, 0, 7); g.fill(); });
        pink.fillStyle = T(1);
        for (const [x, y] of holes) { pink.beginPath(); pink.arc(x + 4, y + 4, 7.5, 0, 7); pink.fill(); }
        pink.beginPath(); pink.arc(DC[0], DC[1], 19, 0, 7); pink.fill();
        press.knockout((g) => specks(g, 'ph-bst', 200, 620, 890, 920, 40, 1, 2.4));

        // --- the cord: navy coils from the left cup down round to the body
        const cord = [[205, 525], [140, 560], [95, 620], [75, 700], [85, 790], [120, 860], [165, 895]];
        for (let i = 0; i <= 30; i++) {
            const u = i / 30, k = u * (cord.length - 1), j = Math.min(cord.length - 2, Math.floor(k)), f = k - j;
            const x = cord[j][0] + (cord[j + 1][0] - cord[j][0]) * f, y = cord[j][1] + (cord[j + 1][1] - cord[j][1]) * f;
            navy.save(); navy.strokeStyle = T(1); navy.lineWidth = 5;
            navy.beginPath(); navy.ellipse(x, y, 22, 12, -0.35 + u * 0.6, 0.2, Math.PI * 2 - 0.4); navy.stroke();
            navy.restore();
        }

        // --- vibration ticks (navy), on twos they flick
        const ticks = [[232, 590, 22], [282, 588, 26], [330, 578, 24], [796, 510, 30], [846, 500, 34], [896, 494, 26]];
        for (const [x, y, h] of ticks) taper(navy, [[x, y - h / 2 + (d % 2) * 4], [x + 1, y + h / 2 + (d % 2) * 4]], 5, 3);

        // --- the handset (jiggles per drawing), with white echo outlines behind it
        const hand = [[200, 530], [180, 505], [186, 460], [222, 440], [300, 430], [365, 408], [445, 356], [540, 326], [650, 324], [740, 346], [800, 356], [880, 358], [926, 380], [930, 420], [900, 446], [800, 446], [752, 430], [712, 404], [640, 382], [560, 384], [475, 412], [385, 466], [364, 506], [322, 532], [250, 536]];
        press.knockout((g) => {
            for (const [ex, ey] of [[-38, -26], [22, -44]]) {
                g.save(); g.translate(ex * 0.8, ey * 0.8); g.lineWidth = 4; smoothPath(g, hand, true, 0.12); g.stroke(); g.restore();
            }
        });
        press.save();
        press.each((g) => { g.translate(jx, jy); g.translate(550, 420); g.rotate(ja); g.translate(-550, -420); });
        const handPath = (g) => smoothPath(g, hand, true, 0.12);
        press.knockout((g) => { handPath(g); g.fill(); });
        blue.fillStyle = T(1); handPath(blue); blue.fill();
        // the cups: navy dots, darker at the bottom
        for (const [cx, cy, rx, ry] of [[270, 486, 92, 50], [846, 402, 88, 46]]) {
            clipped(navyS, (g) => { g.ellipse(cx, cy, rx, ry, -0.08, 0, 7); }, (g) => { g.fillStyle = Riso.ramp(g, 0, cy - ry, 0, cy + ry, 0.3, 0.7); g.fillRect(cx - rx, cy - ry, rx * 2, ry * 2); });
        }
        // the white highlight along the top of the bar, a navy line under it
        press.knockout((g) => taper(g, [[196, 470], [260, 450], [365, 424], [450, 376], [540, 346], [650, 342], [760, 368], [880, 372]], 6, 9));
        taper(navy, [[380, 462], [470, 412], [560, 384], [650, 382], [720, 404]], 3, 2);
        press.restore();
    });
};
