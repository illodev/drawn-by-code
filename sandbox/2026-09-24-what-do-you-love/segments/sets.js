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

    // (EXTERIOR: Sets.exterior lives in exterior.js, the town in town.js)

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
        const size = Sets.noteSize(g), sp = WL.lineSpacings(g, L, size, 'Hand', 0.05)[line];
        const w = WL.textW(g, L[line].slice(0, Math.floor(inLine)), size, 'Hand', sp) + (inLine % 1) * size * 0.4;
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
