// Sets: interior (yellow wall), night exterior, sky, top-down desk.
(() => {
    const P = Paper, E = Ease, C = WL.COL;

    // ---------------------------------------------------------------- INTERIOR
    // o.girl: girl options (x, s, pose, eyes, mouth…) ; o.zoom / o.cx / o.cy: camera
    // o.extra(g): what goes in front (note, plane) ; o.pinned(g): note pinned on the wall
    Sets.interior = (g, t, env, o = {}) => {
        g.save();
        Motion.cam(g, env, o.cx ?? 500, o.cy ?? 500, o.zoom ?? 1);
        WL.sprite('int-bg', { x: -200, y: -200, w: 1400, h: 1400 }, (c) => {
            // window frame: cream paper with scribbled text
            c.fillStyle = C.frame;
            c.fillRect(-200, -200, 1400, 1400);
            WL.scribbleFill(c, { x: -200, y: -200, w: 1400, h: 1400 }, '#b9ad91', 'frame', { lineH: 22, alpha: 0.5, width: 1.1, scale: 1.2 });
            // yellow wall
            P.cutout(c, [[40, 38], [962, 36], [962, 880], [40, 880]], C.wall, 'wall', { border: 2.6, shadow: 0.1, tex: { len: [60, 160], h: [14, 24], alpha: [0.3, 0.6] } });
            // curtains: bands that narrow in the middle
            const curtain = (x0, dir, seed) => {
                const pts = [];
                for (let i = 0; i <= 20; i++) {
                    const y = 38 + (i / 20) * 842, u = i / 20;
                    pts.push([x0 + dir * (125 - Math.sin(u * Math.PI) * 60 + (u > 0.5 ? (u - 0.5) * 60 : 0)), y]);
                }
                P.cutout(c, [[x0, 38], ...pts, [x0, 880]], C.curtain, seed, { border: 2.4, shadow: 0.12, tex: { angle: Math.PI / 2, alpha: [0.3, 0.55] } });
            };
            curtain(40, 1, 'curtainL');
            curtain(962, -1, 'curtainR');
            // drawing of the flower, taped to the wall
            P.cutout(c, [[780, 140], [915, 132], [920, 300], [785, 305]], '#fbf8ef', 'drawing', { border: 1.8, shadow: 0.2, tex: { alpha: [0.1, 0.25] } });
            for (let k = 0; k < 12; k++) {
                const a = (k / 12) * Math.PI * 2;
                P.markerStroke(c, [[850 + Math.cos(a) * 8, 205 + Math.sin(a) * 8], [850 + Math.cos(a) * 42, 205 + Math.sin(a) * 42]], '#d9533f', 4, 'drw' + k, 0.9);
            }
            P.markerStroke(c, [[815, 280], [885, 278]], '#4f9a4a', 4, 'drwgreen', 0.9);
            P.cutout(c, [[830, 124], [872, 120], [874, 142], [832, 146]], '#e9e2b0', 'tape', { border: 0, shadow: 0, tex: false });
        }, 1.2).draw(g);
        if (o.pinned) o.pinned(g);
        if (o.behind) o.behind(g);
        // the girl sits lower than the desk edge (measured: hair top at y ≈ 400)
        const gx = o.girl?.x ?? 510, gy = 915, gs = o.girl?.s ?? 0.9;
        WL.girl(g, gx, gy, gs, { t, ...o.girl, layer: 'body' });
        WL.sprite('int-desk', { x: -200, y: 700, w: 1400, h: 700 }, (c) => {
            // desk and skirting
            P.cutout(c, [[-200, 868], [1200, 868], [1200, 925], [-200, 925]], C.desk, 'desk', { border: 2.2, shadow: 0.25, tex: { alpha: [0.25, 0.45] } });
            c.fillStyle = C.skirting;
            c.fillRect(-200, 925, 1400, 400);
            WL.scribbleFill(c, { x: -200, y: 930, w: 1400, h: 300 }, '#5d4a8e', 'skirting', { lineH: 24, alpha: 0.6 });
            // pot with a red flower
            P.cutout(c, [[790, 760], [900, 760], [890, 870], [800, 870]], C.pot, 'pot', { border: 2.4, shadow: 0.2 });
            P.cutout(c, P.noodle([[845, 760], [843, 700]], 8), C.leaf, 'stem', { border: 0, shadow: 0 });
            P.cutout(c, P.ellipse(815, 725, 16, 34).map(([x, y]) => [x + (y - 725) * 0.4, y]), C.leaf, 'leafL', { border: 2 });
            P.cutout(c, P.ellipse(878, 722, 16, 34).map(([x, y]) => [x - (y - 722) * 0.4, y]), C.leaf, 'leafR', { border: 2 });
            P.cutout(c, P.circleUnion([[0, -14, 10], [13, -4, 10], [8, 12, 10], [-8, 12, 10], [-13, -4, 10]]).map(([x, y]) => [x + 843, y + 690]), C.red, 'redflower', { border: 2 });
        }, 1.2).draw(g);
        WL.girl(g, gx, gy, gs, { t, ...o.girl, layer: 'arms' });
        if (o.extra) o.extra(g);
        g.restore();
    };

    // ---------------------------------------------------------------- SKY
    // Night background with lighter torn bands and stars.
    Sets.sky = (g, t, env, o = {}) => {
        WL.sprite('sky' + (o.key ?? ''), { x: -150, y: -150, w: 1300, h: 1300 }, (c) => {
            c.fillStyle = C.sky;
            c.fillRect(-150, -150, 1300, 1300);
            P.marker(c, { x: -150, y: -150, w: 1300, h: 1300 }, C.sky, 'sky', { len: [80, 200], h: [14, 26], lVar: 3, alpha: [0.3, 0.6], density: 1 });
            const bands = o.bands ?? [[300, 110, C.band], [470, 160, C.band2]];
            bands.forEach(([y, h, col], i) => {
                const top = [], bot = [];
                for (let x = -150; x <= 1150; x += 25) {
                    top.push([x, y + Math.sin(x * 0.011 + i) * 18 + Math.sin(x * 0.037) * 6]);
                    bot.push([x, y + h + Math.sin(x * 0.009 + i * 2) * 20]);
                }
                P.cutout(c, [...top, ...bot.reverse()], col, 'band' + i, { border: 2, borderVar: 0.8, shadow: 0.12, jag: 1.4, paper: '#dcd8e6', tex: { len: [80, 200], alpha: [0.3, 0.55] } });
            });
        }, 1.1).draw(g);
        const r = Motion.rng('stars' + (o.key ?? ''));
        for (let i = 0; i < (o.stars ?? 16); i++) {
            // stars twinkle on twos; 'o.starSize' for close shots
            const x = r() * 1000, y = r() * 1000, tw = 0.85 + 0.15 * Math.sin(Math.floor(t * 12) * 1.7 + i * 2);
            if (r() < 0.7) WL.star(g, x, y, (o.starSize ?? 9) * tw, r() * 0.6);
            else WL.plus(g, x, y, (o.starSize ?? 9) * 0.7 * tw);
        }
    };

    // ---------------------------------------------------------------- EXTERIOR
    // House on the left with the girl in the window, town on the right, flower above.
    // o.girl: small girl options ; o.flower: flower options ; o.over(g): in front
    Sets.exterior = (g, t, env, o = {}) => {
        Sets.sky(g, t, env, { key: 'ext', bands: [[235, 120, C.band], [470, 140, C.band2]], stars: 0 });
        const r = Motion.rng('ext-stars');
        for (let i = 0; i < 14; i++) {
            const x = 30 + r() * 940, y = 20 + r() * 380, tw = 0.8 + 0.2 * Math.sin(t * 5 + i);
            if (r() < 0.65) WL.star(g, x, y, 9 * tw, r());
            else WL.plus(g, x, y, 7 * tw);
        }
        // moon: a crescent (the full disc minus an offset disc)
        WL.sprite('moon2', { x: 70, y: 60, w: 140, h: 160 }, (c) => {
            P.cutout(c, P.ellipse(140, 135, 58, 60), C.moon, 'moon', { border: 0, shadow: 0, jag: 0.6, tex: { alpha: [0.15, 0.3] } });
            c.globalCompositeOperation = 'destination-out';
            c.beginPath();
            c.ellipse(168, 118, 52, 58, 0, 0, Math.PI * 2);
            c.fill();
            c.globalCompositeOperation = 'source-over';
        }, 1.4).draw(g);
        // flower
        if (o.flower !== false) {
            const f = o.flower ?? {};
            WL.flower(g, f.x ?? 665, f.y ?? 245, f.R ?? 150, { t, ...f });
            WL.ticks(g, f.x ?? 665, f.y ?? 245, 175, 215, 12, f.ticks ?? 0, C.star, 0.13);
        }
        if (o.sky) o.sky(g);
        // town (right)
        WL.sprite('town', { x: 580, y: 540, w: 460, h: 480 }, (c) => {
            const houses = [[600, 780, 150, 240, 60], [720, 650, 120, 380, 80], [800, 690, 130, 340, 60], [860, 760, 150, 260, 90], [920, 640, 110, 380, 70], [700, 900, 170, 120, 0], [840, 880, 150, 150, 0]];
            houses.forEach(([x, y, w, h, roof], i) => {
                const col = i % 2 ? C.town : C.town2;
                P.cutout(c, [[x, y], [x + w / 2, y - roof], [x + w, y], [x + w, y + h], [x, y + h]], col, 'house' + i, { border: 1.6, borderVar: 0.4, shadow: 0.2, paper: '#b9b6cf', jag: 0.8, tex: { alpha: [0.2, 0.45] } });
                const rr = P.rng('windows' + i);
                for (let yy = y + 30; yy < y + h - 30; yy += 62) {
                    for (let xx = x + 22; xx < x + w - 34; xx += 46) {
                        if (rr() < 0.35) continue;
                        c.fillStyle = C.window;
                        c.fillRect(xx, yy, 24, 28);
                        c.strokeStyle = C.town;
                        c.lineWidth = 2.5;
                        c.beginPath();
                        c.moveTo(xx + 12, yy);
                        c.lineTo(xx + 12, yy + 28);
                        c.moveTo(xx, yy + 14);
                        c.lineTo(xx + 24, yy + 14);
                        c.stroke();
                    }
                }
            });
            // cat on the roof
            c.fillStyle = '#0f0f22';
            c.beginPath();
            c.ellipse(862, 632, 16, 20, 0, 0, Math.PI * 2);
            c.arc(862, 604, 13, 0, Math.PI * 2);
            c.moveTo(851, 598);
            c.lineTo(853, 584);
            c.lineTo(859, 594);
            c.moveTo(865, 594);
            c.lineTo(872, 584);
            c.lineTo(874, 598);
            c.fill();
            c.strokeStyle = '#0f0f22';
            c.lineWidth = 4;
            c.beginPath();
            c.moveTo(876, 645);
            c.quadraticCurveTo(900, 640, 895, 615);
            c.stroke();
        }, 1.2).draw(g);
        if (o.town) o.town(g);
        // house (left) with window
        WL.sprite('house', { x: -80, y: 360, w: 700, h: 700 }, (c) => {
            P.cutout(c, [[-80, 445], [600, 395], [600, 1060], [-80, 1060]], C.house, 'wall2', { border: 2, shadow: 0.2, paper: '#cfc9de', tex: { alpha: [0.2, 0.4] } });
            WL.scribbleFill(c, { x: -60, y: 440, w: 650, h: 600 }, C.houseText, 'wallText', { lineH: 28, alpha: 0.55, width: 1.3 });
            P.cutout(c, [[-80, 420], [612, 372], [614, 405], [-80, 460]], C.roof, 'roof', { border: 2, shadow: 0.35, paper: '#cfc9de' });
            // ivy
            for (let i = 0; i < 12; i++) {
                const y = 520 + i * 42, x = 22 + Math.sin(i * 1.3) * 8;
                P.cutout(c, P.ellipse(x + (i % 2 ? 10 : -10), y, 11, 7).map(([a, b]) => [a, b]), '#5aa34f', 'ivy' + i, { border: 1.2, shadow: 0 });
            }
            P.markerStroke(c, Array.from({ length: 30 }, (_, i) => [22 + Math.sin(i * 0.55) * 10, 500 + i * 18]), '#3d7a36', 3, 'ivystem', 0.9);
            // window frame
            P.cutout(c, [[70, 535], [485, 535], [485, 930], [70, 930]], C.frame, 'windowFrame', { border: 2, shadow: 0.25 });
        }, 1.2).draw(g);
        // inside the window (the small girl), clipped
        // (the interior camera centres on screen: move the origin to the window centre first)
        g.save();
        g.beginPath();
        g.rect(98, 562, 360, 368);
        g.clip();
        g.translate(278 - 500, 746 - 500);
        Sets.interior(g, t, env, { zoom: 0.52, cx: 500, cy: 640, ...o.window, girl: { pose: 'desk', eyes: 'up', ...o.girl } });
        g.restore();
        // windowsill
        WL.sprite('sill', { x: 40, y: 915, w: 480, h: 60 }, (c) => P.cutout(c, [[50, 925], [505, 925], [505, 958], [50, 958]], C.desk, 'sill', { border: 2, shadow: 0.3 }), 1.2).draw(g);
        if (o.over) o.over(g);
    };

    // ---------------------------------------------------------------- DESK (top-down)
    // o.light: [x, y, r] of the lamp's circle of light (the fold happens right under it)
    Sets.desk = (g, t, env, o = {}) => {
        const [lx, ly, lr] = o.light ?? [330, 260, 420];
        WL.sprite('desktop' + lx + ly, { x: -200, y: -200, w: 1400, h: 1400 }, (c) => {
            c.fillStyle = C.wood;
            c.fillRect(-200, -200, 1400, 1400);
            P.marker(c, { x: -200, y: -200, w: 1400, h: 1400 }, C.wood, 'wood', { angle: 0.1, len: [100, 260], h: [10, 18], alpha: [0.3, 0.6], density: 1.1 });
            // circle of lamp light
            P.cutout(c, P.ellipse(lx, ly, lr, lr), C.light, 'light', { border: 0, shadow: 0, jag: 1.4, tex: { alpha: [0.2, 0.4] } });
            // crayons
            P.cutout(c, P.roundRect(-20, -9, 120, 18, 8).map(([x, y]) => [x * 0.96 - y * 0.28 + 880, x * 0.28 + y * 0.96 + 900]), '#6cc36a', 'crayon1', { border: 1.6 });
            P.cutout(c, P.roundRect(-20, -8, 100, 16, 8).map(([x, y]) => [x * 0.98 + y * 0.2 + 760, -x * 0.2 + y * 0.98 + 965]), '#d9473b', 'crayon2', { border: 1.6 });
        }, 1.1).draw(g);
        if (o.inner) o.inner(g);
    };

    // Notepad on the desk, measured on the reference (2–4 s, wide shot): purple backing, lined
    // sheet (rules every 71.8, turned −2.5°), spiral rings over the top edge. The sheet's text
    // is revealed by o.p (0–1); o.sheet === false leaves only the pad (the page was torn off).
    const PAD = { x: 506, y: 590, w: 818, h: 685, rot: -0.03 };
    const SHEET = { x: 508, y: 558, w: 742, h: 587, rot: -0.0436, rules: [0.142, 0.1223], margin: 0.108, lineX: [-283, -338], lineY: [0.415, 0.764] };
    Sets.PAD = PAD;
    Sets.SHEET = SHEET;
    Sets.NOTE_LINES = ['what do', 'you love?'];
    // text size: 'what do' spans 575 units on the reference
    Sets.noteSize = (g) => (592 * 100) / WL.textW(g, 'what do', 100, 'Hand', 0.05);
    Sets.notepad = (g, t, o = {}) => {
        WL.sprite('notepad2', { x: PAD.x - PAD.w / 2 - 30, y: PAD.y - PAD.h / 2 - 30, w: PAD.w + 60, h: PAD.h + 60 }, (c) => {
            const pts = P.roundRect(-PAD.w / 2, -PAD.h / 2, PAD.w, PAD.h, 8).map(([x, y]) => [PAD.x + x * Math.cos(PAD.rot) - y * Math.sin(PAD.rot), PAD.y + x * Math.sin(PAD.rot) + y * Math.cos(PAD.rot)]);
            P.cutout(c, pts, '#6a3c74', 'cover2', { border: 2.4, shadow: 0.3, tex: { alpha: [0.3, 0.6] } });
        }, 1.2).draw(g);
        g.save();
        g.translate(SHEET.x, SHEET.y);
        g.rotate(SHEET.rot);
        if (o.sheet === 'blank') WL.note(g, 0, 0, SHEET.w, SHEET.h, 0, 'notepad-next', { torn: 0, rules: SHEET.rules, margin: SHEET.margin });
        else if (o.sheet !== false) {
            WL.note(g, 0, 0, SHEET.w, SHEET.h, 0, 'notepad-sheet2', { torn: 0, rules: SHEET.rules, margin: SHEET.margin, text: Sets.NOTE_LINES, p: o.p ?? 0, size: Sets.noteSize(g), lineX: SHEET.lineX, lineY: SHEET.lineY });
        }
        if (o.under) o.under(g);
        // spiral: a hole in the sheet and a grey ring looping over its top edge
        WL.sprite('spiral2', { x: -400, y: -330, w: 800, h: 90 }, (c) => {
            for (let i = 0; i < 17; i++) {
                const xx = -366 + i * 43.75;
                c.fillStyle = 'rgba(60,30,70,0.55)';
                c.beginPath();
                c.ellipse(xx + 4, -262, 5, 6, 0, 0, Math.PI * 2);
                c.fill();
                P.markerStroke(c, Array.from({ length: 14 }, (_, k) => {
                    const a = Math.PI * (0.55 + (k / 13) * 1.1);
                    return [xx + Math.cos(a) * 9, -283 + Math.sin(a) * 24];
                }), '#9aa0ad', 6, 'ring' + i, 0.95);
            }
        }, 1.3).draw(g);
        g.restore();
    };
    // where the pen is when a fraction p of the text is written (world coordinates)
    Sets.penAt = (g, p) => {
        const L = Sets.NOTE_LINES, total = L.join('').length, chars = p * total;
        const line = chars <= L[0].length ? 0 : 1, inLine = line === 0 ? chars : chars - L[0].length;
        const size = Sets.noteSize(g), w = WL.textW(g, L[line].slice(0, Math.floor(inLine)), size, 'Hand', 0.05) + (inLine % 1) * size * 0.4;
        const lx = SHEET.lineX[line] + w, ly = -SHEET.h / 2 + SHEET.h * SHEET.lineY[line] - size * 0.28;
        return [SHEET.x + lx * Math.cos(SHEET.rot) - ly * Math.sin(SHEET.rot), SHEET.y + lx * Math.sin(SHEET.rot) + ly * Math.cos(SHEET.rot)];
    };
    // the arm that writes: the forearm leans with the pen, from an elbow off-screen bottom right
    // o.scale: the hand is nearer the camera than the paper, so a push-in enlarges it more
    Sets.writingArm = (g, tip, line, o = {}) => {
        const base = line === 0 ? [975, 1250] : [tip[0] + 0.42 * (1250 - tip[1]), 1250];
        WL.writingHand(g, tip, base, o);
    };
})();
