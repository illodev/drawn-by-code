// Card «grasshopper» (seen in a circle at 3.0 s; full frame, re-inked pink↔blue, at 14.25 s).
// A grasshopper silhouette on an arching grass stem against a huge yellow moon, motion
// dashes behind it, seed heads, a night sky with blue rings round the moon and grass blades
// at the bottom. Geometry measured on the full-frame 14.25 s view (reference pixels,
// G1.frame); inks from the circle view at 3.0 s. Separations: moon = yellow solid + pink
// screen ramping in towards the lower left (orange dots); silhouettes = navy + yellow +
// pink (dark brown-green) with red veins (navy knocked out); dashes = blue on yellow
// (green); sky = navy solid + pink screen, blue ring lines, white stars.
var CARDS = CARDS || {};
CARDS.grasshopper = (press, t) => {
    const { T, fill, stroke, taper, smoothPath, polyPath, clipped, specks } = G1;
    const P = (ink, k) => press.plate(ink, k);
    const pink = P('pink'), pinkS = P('pink', 'screen'), yellow = P('yellow'), yellowS = P('yellow', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const erase = (g, fn) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; g.lineCap = 'round'; fn(g); g.restore(); };
    const d = Math.floor(t * 12 + 1e-6);
    const MC = [566, 461], MR = 474;
    const moon = (g) => { g.arc(MC[0], MC[1], MR, 0, Math.PI * 2); };
    // silhouettes: navy + yellow + a little pink (dark brown-green)
    const dark = (pts, smooth = true) => { fill(yellow, pts, 1, smooth); fill(navy, pts, 1, smooth); fill(pink, pts, 0.12, smooth); };
    const darkT = (pts, w0, w1) => { taper(yellow, pts, w0, w1); taper(navy, pts, w0, w1); taper(pink, pts, w0, w1, 0.12); };

    G1.frame(press, () => {
        // --- sky: navy with pink dots, stars
        fill(navy, [[0, 0], [1080, 0], [1080, 1080], [0, 1080]], 0.95);
        pinkS.fillStyle = T(0.28); pinkS.fillRect(0, 0, 1080, 1080);
        specks(blue, 'gh-sky', 0, 0, 1080, 1080, 60, 1, 2.2);
        // blue ring lines round the moon and streaks in the sky
        Riso.ring(blue, MC[0], MC[1], MR + 30, 7, 'gh-r1', { wobble: 0.006 });
        Riso.ring(blue, MC[0], MC[1] + 10, MR + 84, 5, 'gh-r2', { wobble: 0.01 });
        for (const [a0, a1, r, w] of [[3.5, 4.3, MR + 140, 4], [3.9, 4.5, MR + 200, 3.5], [3.2, 3.7, MR + 170, 3]]) {
            const pts = []; for (let i = 0; i <= 10; i++) { const a = a0 + ((a1 - a0) * i) / 10; pts.push([MC[0] + Math.cos(a) * r, MC[1] + Math.sin(a) * r]); }
            taper(blue, pts, w * 0.4, w);
        }
        // stars: small four-point sparkles (knocked out, a yellow cross)
        for (const [x, y, s] of [[57, 33, 12], [1040, 58, 10], [1020, 1020, 12], [30, 760, 7]]) {
            press.knockout((g) => { g.fillRect(x - 1.5, y - s, 3, s * 2); g.fillRect(x - s, y - 1.5, s * 2, 3); });
            yellow.fillStyle = T(0.6); yellow.fillRect(x - 1, y - s * 0.6, 2, s * 1.2);
        }

        // --- the moon: yellow, orange dots thickening towards the lower left
        press.knockout((g) => { g.beginPath(); moon(g); g.fill(); });
        yellow.fillStyle = T(1); yellow.beginPath(); moon(yellow); yellow.fill();
        clipped(pinkS, moon, (g) => {
            const gr = g.createLinearGradient(820, 180, 250, 800);
            gr.addColorStop(0, T(0.0)); gr.addColorStop(0.35, T(0.07)); gr.addColorStop(1, T(0.24));
            g.fillStyle = gr; g.fillRect(0, 0, 1080, 1080);
        });
        clipped(pinkS, moon, (g) => { g.fillStyle = Riso.radial(g, MC[0], MC[1], MR - 70, MR, 0, 0.22); g.fillRect(0, 0, 1080, 1080); });
        // the motion dashes of the jump (green: blue on yellow); they flicker on twos
        const dashes = [[[310, 115], [355, 94], [400, 80]], [[220, 205], [244, 170], [272, 142]], [[315, 222], [368, 188], [422, 162]], [[155, 330], [168, 284], [190, 240]],
            [[240, 357], [262, 300], [290, 247]], [[397, 265], [420, 254], [442, 245]], [[350, 310], [362, 294], [375, 280]], [[322, 380], [328, 356], [337, 332]]];
        dashes.forEach((ds, i) => {
            if ((i + d) % 5 === 4) return;
            // bow each dash outward (away from the grasshopper), like a leap's arc
            const [a, m, b] = ds, dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
            const bow = [m[0] + (dy / l) * l * 0.12, m[1] - (dx / l) * l * 0.12];
            taper(blue, [a, bow, b], 5, 13);
        });

        // --- grass: the arching stem, other blades, seed heads
        darkT([[120, 1090], [210, 860], [330, 730], [470, 655], [620, 615], [760, 618], [880, 660], [970, 730], [1030, 800]], 22, 8);
        darkT([[330, 640], [300, 720], [255, 830], [210, 960], [190, 1090]], 5, 16);
        darkT([[560, 730], [520, 800], [470, 900], [430, 1000], [415, 1090]], 4, 12);
        darkT([[700, 640], [720, 700], [745, 780], [770, 860], [790, 950], [810, 1090]], 5, 12);
        // seed sprigs: a thin stalk with dark oval seeds
        const seed = (x, y, a, l, w) => { dark([[x, y], [x + Math.cos(a) * l * 0.5 - Math.sin(a) * w, y + Math.sin(a) * l * 0.5 + Math.cos(a) * w], [x + Math.cos(a) * l, y + Math.sin(a) * l], [x + Math.cos(a) * l * 0.5 + Math.sin(a) * w, y + Math.sin(a) * l * 0.5 - Math.cos(a) * w]]); };
        darkT([[590, 735], [520, 755], [460, 765], [400, 790], [370, 810]], 5, 3);
        for (const [x, y, a, l, w] of [[380, 800, 3.6, 46, 13], [420, 772, 3.4, 42, 12], [470, 762, 3.3, 40, 11], [455, 772, 2.0, 40, 11], [510, 758, 3.5, 36, 10], [505, 760, 2.1, 36, 10], [560, 745, 2.4, 30, 9]]) seed(x, y, a, l, w);
        darkT([[700, 650], [715, 700], [730, 760], [745, 820], [752, 870]], 5, 3);
        for (const [x, y, a, l, w] of [[712, 690, 0.4, 40, 11], [708, 690, 2.5, 36, 10], [726, 740, 0.5, 40, 11], [722, 745, 2.6, 36, 10], [740, 800, 0.9, 38, 11], [738, 805, 2.4, 36, 10], [750, 860, 1.4, 34, 10]]) seed(x, y, a, l, w);
        // the grass at the bottom: thin blades, some with yellow or pink edges
        const r = Motion.rng('gh-blades');
        for (let i = 0; i < 34; i++) {
            const x0 = r() * 1080, h = 90 + r() * 200, lean = (r() - 0.5) * 120;
            const pts = [[x0, 1090], [x0 + lean * 0.4, 1090 - h * 0.5], [x0 + lean, 1090 - h]];
            darkT(pts, 9, 1);
            if (i % 4 === 0) taper(yellow, pts.map(([x, y]) => [x + 4, y]), 3, 0.8);
            if (i % 5 === 1) taper(pinkS, pts.map(([x, y]) => [x - 4, y]), 3, 0.8);
        }
        dark([[-10, 1090], [-10, 1040], [80, 1030], [180, 1050], [300, 1040], [420, 1060], [560, 1045], [700, 1062], [860, 1046], [1000, 1060], [1090, 1044], [1090, 1090]], false);

        // --- the grasshopper (it breathes on twos: the body lifts 2 px)
        const by = (d % 2) * -2;
        press.save();
        press.each((g) => g.translate(0, by));
        // lower wing (behind), abdomen, upper wing, thorax, head
        const wing = (tip, base, w) => {
            const dx = base[0] - tip[0], dy = base[1] - tip[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
            return [tip, [tip[0] + dx * 0.25 + nx * w * 0.8, tip[1] + dy * 0.25 + ny * w * 0.8], [base[0] + nx * w * 0.6, base[1] + ny * w * 0.6], base, [base[0] - nx * w * 0.3, base[1] - ny * w * 0.3], [tip[0] + dx * 0.3 - nx * w * 0.4, tip[1] + dy * 0.3 - ny * w * 0.4]];
        };
        const lowWing = wing([355, 442], [640, 508], 44);
        const upWing = wing([373, 390], [652, 470], 48);
        const abdomen = [[385, 505], [450, 488], [560, 492], [640, 510], [652, 555], [600, 590], [500, 588], [430, 565], [398, 535]];
        dark(lowWing); dark(abdomen); dark(upWing);
        // red veins on the wings, a red line on the abdomen (navy knocked out, pink printed)
        const red = (fn) => { erase(navy, fn); pink.save(); pink.strokeStyle = T(1); pink.lineCap = 'round'; fn(pink); pink.restore(); };
        red((g) => {
            g.lineWidth = 2.4;
            for (const [a, b] of [[[410, 402], [640, 472]], [[440, 420], [620, 480]], [[470, 410], [600, 455]], [[420, 455], [610, 505]]]) { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
            for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(480 + i * 26, 430 + i * 7); g.lineTo(500 + i * 26, 418 + i * 7); g.stroke(); }
            g.beginPath(); g.moveTo(420, 530); g.quadraticCurveTo(520, 548, 630, 532); g.stroke();
        });
        dark(G1.blob(690, 505, 44, 34, 'gh-th', 0.04, 14));
        dark(G1.blob(758, 510, 36, 33, 'gh-hd', 0.03, 14));
        press.knockout((g) => { g.beginPath(); g.arc(768, 500, 7, 0, 7); g.fill(); });
        // antennae
        darkT([[772, 482], [810, 400], [860, 280], [916, 170]], 4, 2);
        darkT([[788, 494], [880, 460], [980, 430], [1075, 410]], 4, 2);
        // hind leg: a thick femur back to the knee, the spiny tibia down to the stem
        darkT([[645, 545], [560, 560], [460, 530], [385, 500], [362, 494]], 30, 10);
        darkT([[362, 494], [385, 540], [405, 580], [430, 615]], 8, 6);
        for (let i = 0; i < 4; i++) darkT([[372 + i * 14, 512 + i * 26], [355 + i * 14, 520 + i * 26]], 3, 1);
        darkT([[430, 615], [470, 622]], 6, 3);
        // front legs
        darkT([[680, 540], [665, 580], [690, 625]], 7, 4);
        darkT([[715, 540], [735, 580], [760, 612]], 7, 4);
        press.restore();
    });
};
