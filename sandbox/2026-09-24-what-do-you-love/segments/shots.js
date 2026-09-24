// Shots of the replica, by name (the same names as `shots` in scene.js).
// Each one is (g, t, env, shot) => void; shot.local is the time inside the shot.
const Shots = {};
(() => {
    const P = Paper, E = Ease, C = WL.COL;
    const bump = (t, a, d) => E.bump(t, a, d);

    // ------------------------------------------------------------------ helpers
    // paper planes rising from the town towards the flower, in a loop
    function risingPlanes(g, t, n = 3, speed = 0.55) {
        for (let k = 0; k < n; k++) {
            const u = (((t * speed + k / n) % 1) + 1) % 1;
            const path = P.bezier([990, 760], [1010, 480], [880, 330], [735, 285], 30);
            const i = Math.min(path.length - 2, Math.floor(u * (path.length - 1)));
            const [x, y] = path[i], [x2, y2] = path[i + 1];
            WL.trail(g, path.slice(Math.max(0, i - 9), i + 1));
            WL.plane(g, x, y, 0.55 + 0.25 * (1 - u), Math.atan2(y2 - y, x2 - x));
        }
    }
    const NOTE_LINES = ['what do', 'you love?'];
    // notepad + writing arm, with a camera (cx, cy, zoom)
    function writing(g, t, env, p, cam, withArm = true, hand = 1) {
        Sets.desk(g, t, env, {
            inner: (gg) => {
                gg.save();
                Motion.cam(gg, env, cam[0], cam[1], cam[2]);
                Sets.notepad(gg, t, { p });
                if (withArm && p < 1) {
                    const [px, py] = Sets.penAt(gg, p);
                    const wob = Math.sin(t * 40) * 2;
                    Sets.writingArm(gg, [px, py + wob], p * 16 <= 7 ? 0 : 1, { scale: hand });
                } else if (withArm) Sets.writingArm(gg, [905, 640], 1, { scale: hand });
                gg.restore();
            },
        });
    }

    // ------------------------------------------------------------------ 0–1.5
    Shots['Exterior · planes'] = (g, t, env) => {
        Sets.exterior(g, t, env, {
            flower: { ticks: bump(t, 0.35, 0.55), wiggle: bump(t, 0.35, 0.55) },
            girl: { eyes: 'up', mouth: 'smile' },
            sky: (gg) => risingPlanes(gg, t),
        });
    };

    // ------------------------------------------------------------------ 1.5–2
    Shots['Interior · idea'] = (g, t, env) => {
        const idea = t < 1.72;
        Sets.interior(g, t, env, {
            girl: idea ? { pose: 'pencil', eyes: 'open', mouth: 'o', look: [0.3, -0.6] } : { pose: 'desk', eyes: 'closed', mouth: 'grin' },
            extra: (gg) => {
                if (idea) WL.ticks(gg, 505, 505, 180, 222, 7, bump(t, 1.5, 0.3) + 0.4, '#fbf1d6', -Math.PI * 0.95);
                // notebook on the desk
                WL.sprite('desk-book', { x: 290, y: 845, w: 380, h: 40 }, (c) => P.cutout(c, [[300, 852], [650, 852], [656, 876], [296, 876]], C.cover, 'deskbook', { border: 1.8, shadow: 0.2 }), 1.4).draw(gg);
            },
        });
    };

    // ------------------------------------------------------------------ 2–4
    // writing speed measured on the reference: ~8 letters/s, then ~9 in the close-up (16 letters)
    Shots['Notepad · writing'] = (g, t, env) => writing(g, t, env, Motion.keys([[2, 0.8], [2.25, 4], [2.5, 5.5], [2.75, 7]], t, E.linear) / 16, [500, 500, 1]);
    Shots['Notepad · close'] = (g, t, env) => writing(g, t, env, Math.min(15.6, 7.2 + (t - 3) * 9.3) / 16, [533, 651, 1.235], true, 1.45);
    Shots['Notepad · done'] = (g, t, env) => writing(g, t, env, 1, [500, 500, 1]);

    // ------------------------------------------------------------------ 4–4.5
    // Measured on the reference, one row per drawing (1/12 s): where line 1 of the page starts
    // on screen (x, y of 'what'), its turn and scale; then both mittens. The page is yanked off
    // the spiral (white snap lines, scraps flying), lifts towards the camera (the whole pad
    // grows 15 %), then slides down, uncovering the next blank page under the rings.
    const TEAR = [
        [[217, 513, -0.12, 0.96], [126, 329], [802, 235]],
        [[209, 533, -0.13, 0.96], [104, 354], [792, 222]],
        [[169, 561, -0.15, 1.094], [63, 336], [833, 229]],
        [[171, 593, -0.1, 1.094], [83, 312], [854, 250]],
        [[180, 638, -0.07, 1.094], [94, 385], [875, 333]],
        [[185, 686, -0.05, 1.094], [94, 469], [896, 417]],
    ];
    Shots['Tear'] = (g, t, env) => {
        const d = Math.min(5, Math.floor((t - 4) * 12 + 1e-6));
        const [[lx, ly, rot, S], hl, hr] = TEAR[d];
        const SH = Sets.SHEET;
        // page centre on screen from the start of line 1
        const ox = -SH.lineX[0], oy = SH.h / 2 - SH.h * SH.lineY[0];
        const cx = lx + (ox * Math.cos(rot) - oy * Math.sin(rot)) * S, cy = ly + (ox * Math.sin(rot) + oy * Math.cos(rot)) * S;
        Sets.desk(g, t, env, {
            inner: (gg) => {
                gg.save();
                if (d >= 2) (gg.translate(450, 479), gg.scale(1.15, 1.15), gg.translate(-450, -479));
                Sets.notepad(gg, t, { sheet: d >= 3 ? 'blank' : false });
                gg.restore();
                // the page's shadow on the pad while it is lifted
                const P2 = Sets.PAD;
                gg.save();
                if (d >= 2) (gg.translate(450, 479), gg.scale(1.15, 1.15), gg.translate(-450, -479));
                gg.beginPath();
                gg.rect(P2.x - P2.w / 2, P2.y - P2.h / 2, P2.w, P2.h);
                gg.restore();
                gg.save();
                gg.clip();
                gg.translate(cx + 14, cy + 24);
                gg.rotate(rot);
                gg.scale(S, S);
                gg.fillStyle = '#3b2442';
                gg.fillRect(-SH.w / 2, -SH.h / 2 + 20, SH.w, SH.h - 10);
                gg.restore();
                // the page itself, torn along the perforation
                gg.save();
                gg.translate(cx, cy);
                gg.rotate(rot);
                gg.scale(S, S);
                WL.note(gg, 0, 0, SH.w, SH.h, 0, 'torn-page', { torn: 2, rules: SH.rules, margin: SH.margin, text: NOTE_LINES, p: 1, size: Sets.noteSize(gg), lineX: SH.lineX, lineY: SH.lineY });
                // snap lines at the torn edge on the first drawing
                if (d === 0) for (const [a, b] of [[[-300, -330], [-330, -372]], [[-150, -335], [-168, -385]], [[210, -340], [228, -386]], [[330, -330], [362, -370]]]) P.markerStroke(gg, [a, b], '#fbf7ee', 7, 'snap' + a[0], 0.95);
                gg.restore();
                // the rings stay with the pad (over the page while it is still caught in them)
                if (d < 3) {
                    gg.save();
                    if (d >= 2) (gg.translate(450, 479), gg.scale(1.15, 1.15), gg.translate(-450, -479));
                    gg.translate(SH.x, SH.y);
                    gg.rotate(SH.rot);
                    WL.sprite('spiral2', { x: -400, y: -330, w: 800, h: 90 }, () => {}, 1.3).draw(gg);
                    gg.restore();
                }
                // scraps of paper from the ring holes, flying up and out (on twos)
                if (d >= 1) {
                    const r = Motion.rng('scraps'), u = (d - 1 + 0.5) / 5;
                    for (let i = 0; i < 14; i++) {
                        const x0 = 150 + r() * 700, vx = (x0 - 500) * (0.25 + r() * 0.3), vy = -(90 + r() * 120), sz = 9 + r() * 9, spin = (r() - 0.5) * 6, late = r() * 0.3;
                        const v = Math.max(0, u - late);
                        if (v <= 0) continue;
                        const x = x0 + vx * v, y = 262 + vy * v + 160 * v * v;
                        const bit = WL.sprite('scrap' + (i % 5), { x: -16, y: -16, w: 32, h: 32 }, (c) => {
                            const rr = P.rng('scrap' + (i % 5));
                            P.cutout(c, PaperDetail.spline(Array.from({ length: 7 }, (_, k) => [Math.cos((k / 7) * 6.283) * (8 + rr() * 5), Math.sin((k / 7) * 6.283) * (7 + rr() * 5)]), 5), '#f7f3e7', 'scrap' + (i % 5), { border: 1.4, shadow: 0.15 });
                            if (i % 5 < 3) (c.strokeStyle = C.rule, c.lineWidth = 2, c.beginPath(), c.moveTo(-10, (i % 3) * 3 - 2), c.lineTo(10, (i % 3) * 3 - 1), c.stroke());
                        }, 2);
                        gg.save();
                        gg.translate(x, y);
                        gg.rotate(spin * v);
                        gg.scale(sz / 12, sz / 12);
                        bit.draw(gg);
                        gg.restore();
                    }
                }
                // mittens on the page, arms coming in from both sides
                WL.mitten(gg, hl[0], hl[1], 112, [hl[0] - 330, hl[1] + 700], false);
                WL.mitten(gg, hr[0], hr[1], 112, [hr[0] + 330, hr[1] + 700], true);
            },
        });
    };

    // ------------------------------------------------------------------ 4.5–5.25
    // Folding the plane under the lamp, traced drawing by drawing (1/12 s each) on the
    // reference: the page seen from the back (the pen stroke shows through), top corners folded
    // in, the «house», the nose folded narrower (side flaps shaded), the finished dart. Each
    // row: [shape, mittens L/R, sparkles?]. Shapes are paper polygons with creases.
    const PAGE = '#f7f3e7', FLAP = '#e5dec9', CREASE = '#5d5862';
    const FOLD_SHAPES = {
        sheet: { out: [[312, 212], [688, 212], [688, 788], [312, 788]], creases: [[[322, 400], [322, 775]]], mark: [[537, 670], [600, 645], [655, 680]] },
        flaps: { out: [[312, 212], [688, 212], [688, 788], [312, 788]], flaps: [[[312, 212], [500, 212], [312, 375]], [[688, 212], [500, 212], [688, 375]]], creases: [[[500, 212], [500, 788]]], mark: [[575, 622], [630, 612]] },
        house: { out: [[506, 217], [689, 403], [681, 796], [311, 796], [311, 403]], creases: [[[506, 225], [496, 786]], [[430, 404], [543, 404]]], mark: [[450, 646], [540, 629]] },
        dart: { out: [[500, 207], [643, 379], [639, 786], [369, 786], [354, 379]], flaps: [[[500, 207], [354, 379], [369, 786], [423, 786], [410, 471]], [[500, 207], [643, 379], [639, 786], [579, 786], [590, 471]]], creases: [[[500, 214], [500, 780]], [[314, 390], [686, 390]]], mark: [[455, 632], [545, 618]] },
        plane: { out: [[500, 212], [587, 475], [587, 787], [412, 787], [412, 475]], creases: [[[500, 220], [500, 780]], [[312, 400], [688, 400]]], mark: [[475, 650], [537, 637]] },
    };
    const FOLD = [
        ['sheet', [312, 637], [587, 762], 1],
        ['sheet', [312, 712], [587, 750], 0],
        ['flaps', [175, 512], [812, 562], 0],
        ['house', [407, 407], [600, 414], 2],
        ['house', [375, 412], [600, 412], 0],
        ['dart', [243, 700], [771, 700], 0],
        ['plane', [437, 725], [575, 725], 3],
        ['plane', [425, 737], [587, 725], 0],
        ['plane', [475, 762], [600, 750], 0, -0.13],
    ];
    const SPARKLES = {
        1: [[[262, 100], [285, 118]], [[738, 100], [715, 118]], [[160, 310], [185, 318]], [[840, 310], [815, 318]]],
        2: [[[429, 64], [436, 100]], [[569, 64], [562, 100]], [[303, 164], [326, 190]], [[697, 164], [674, 190]], [[224, 337], [257, 349]], [[776, 337], [743, 349]]],
        3: [[[440, 170], [447, 205]], [[560, 170], [553, 205]], [[330, 250], [362, 268]], [[670, 250], [638, 268]]],
    };
    function foldedPaper(c, key) {
        const f = FOLD_SHAPES[key];
        const rules = (cc, box) => {
            cc.strokeStyle = C.rule;
            cc.lineWidth = 2.2;
            for (let y = 296; y < 800; y += 71) (cc.beginPath(), cc.moveTo(box.x, y), cc.lineTo(box.x + box.w, y), cc.stroke());
        };
        P.cutout(c, f.out, PAGE, 'fold-' + key, { border: 2.2, paper: '#fffdf6', shadow: 0.22, jag: 0.5, tex: { lVar: 1.2, sVar: 1.5, alpha: [0.12, 0.3] }, inner: rules });
        for (const [i, fl] of (f.flaps ?? []).entries()) P.cutout(c, fl, FLAP, 'flap-' + key + i, { border: 0, shadow: 0.08, jag: 0.4, tex: { alpha: [0.1, 0.25] }, inner: rules });
        for (const [a, b] of f.creases) P.markerStroke(c, [a, b], CREASE, 3, 'crease' + key + a[0], 0.85);
        // the pen stroke showing through from the front
        P.markerStroke(c, f.mark, '#6f8fd0', 9, 'mark' + key, 0.9);
        P.markerStroke(c, f.mark, '#3f66b8', 5, 'mark2' + key, 0.95);
    }
    Shots['Fold'] = (g, t, env) => {
        const d = Math.min(FOLD.length - 1, Math.floor((t - 4.5) * 12 + 1e-6));
        const [key, hl, hr, spark, rot = 0] = FOLD[d];
        Sets.desk(g, t, env, {
            light: [496, 436, 420],
            inner: (gg) => {
                if (spark) for (const [a, b] of SPARKLES[spark]) P.markerStroke(gg, [a, b], '#f3dc93', 6, 'spark' + a[0] + a[1], 0.95);
                gg.save();
                if (rot) (gg.translate(500, 500), gg.rotate(rot), gg.translate(-500, -500));
                WL.sprite('folded-' + key, { x: 290, y: 190, w: 420, h: 620 }, (c) => foldedPaper(c, key), 1.4).draw(gg);
                gg.restore();
                // mittens, the arms reaching in from the bottom corners
                WL.mitten(gg, hl[0], hl[1], 100, [-250, 1150], false);
                WL.mitten(gg, hr[0], hr[1], 100, [1250, 1150], true);
            },
        });
    };

    // ------------------------------------------------------------------ 5.25–6
    Shots['Interior · throw'] = (g, t, env) => {
        const released = t >= 5.42;
        Sets.interior(g, t, env, {
            girl: { pose: released ? 'release' : 'throw', eyes: 'up', look: [0.6, -0.8], mouth: released ? 'o' : 'smile' },
            extra: (gg) => {
                const hand = WL.girlHand(released ? 'release' : 'throw', 1);
                if (!released) WL.plane(gg, hand[0] + 8, hand[1] - 22, 1.1, -0.9);
                else {
                    const u = E.out(E.seg(t, 5.42, 5.9));
                    const x = E.lerp(hand[0] + 30, 1100, u), y = E.lerp(hand[1] - 40, 80, u);
                    if (u < 1) {
                        WL.trail(gg, [[hand[0] + 30, hand[1] - 40], [x, y]]);
                        WL.plane(gg, x, y, 1.4 - u * 0.5, -0.75);
                    }
                    // motion lines behind the hand
                    const m = bump(t, 5.42, 0.3);
                    if (m > 0.05) for (let k = 0; k < 3; k++) P.markerStroke(gg, [[hand[0] - 60 + k * 20, hand[1] + 40 + k * 25], [hand[0] - 10 + k * 20, hand[1] - 10 + k * 25]], '#fbf6ec', 5, 'mline' + k, m);
                }
            },
        });
    };

    // ------------------------------------------------------------------ 6–7
    // a low town silhouette along the bottom of the open sky
    function skyline(g) {
        WL.sprite('skyline', { x: -50, y: 780, w: 1100, h: 260 }, (c) => {
            const r = P.rng('skyline');
            for (let x = -40; x < 1060; x += 70 + r() * 40) {
                const h = 70 + r() * 110, w = 70 + r() * 40;
                P.cutout(c, [[x, 1000 - h], [x + w / 2, 1000 - h - 30 - r() * 30], [x + w, 1000 - h], [x + w, 1040], [x, 1040]], r() < 0.5 ? C.town : C.town2, 'sk' + x, { border: 1.4, paper: '#b9b6cf', shadow: 0.2, jag: 0.8 });
                for (let yy = 1000 - h + 25; yy < 990; yy += 40) if (r() < 0.6) (c.fillStyle = C.window, c.fillRect(x + 15 + r() * (w - 40), yy, 16, 18));
            }
        }, 1.2).draw(g);
    }
    function moon(g, x = 140, y = 135, s = 1) {
        g.save();
        g.translate(x - 140 * s, y - 135 * s);
        g.scale(s, s);
        WL.sprite('moon2', { x: 70, y: 60, w: 140, h: 160 }, (c) => {
            P.cutout(c, P.ellipse(140, 135, 58, 60), C.moon, 'moon', { border: 0, shadow: 0, jag: 0.6, tex: { alpha: [0.15, 0.3] } });
            c.globalCompositeOperation = 'destination-out';
            c.beginPath();
            c.ellipse(168, 118, 52, 58, 0, 0, Math.PI * 2);
            c.fill();
            c.globalCompositeOperation = 'source-over';
        }, 1.4).draw(g);
        g.restore();
    }
    Shots['Sky · flight'] = (g, t, env) => {
        Sets.sky(g, t, env, { key: 'open', bands: [[160, 90, C.band], [430, 120, C.band2], [640, 90, C.band]] });
        moon(g, 330, 230, 0.8);
        WL.flower(g, 890, 110, 85, { t, rot: t * 0.5, wiggle: 0.3 });
        skyline(g);
        const u = E.inOut(E.seg(t, 6.0, 6.95));
        const path = P.bezier([-40, 1000], [250, 700], [520, 420], [800, 210], 40);
        const k = Math.min(path.length - 2, Math.floor(u * (path.length - 1)));
        WL.trail(g, path.slice(0, k + 1));
        WL.plane(g, path[k][0], path[k][1], 1.2 - u * 0.4, Math.atan2(path[k + 1][1] - path[k][1], path[k + 1][0] - path[k][0]));
    };

    // ------------------------------------------------------------------ 7–7.5
    // Close sky (7–10 s, 18–20 s), measured: three bands with torn white tops.
    const skyClose = (g, t, env, key = 'close') => Sets.sky(g, t, env, { key, bands: [[270, 290, '#272b64'], [560, 520, '#323a7e']], stars: 24, starSize: 13 });
    // The flower's close-up look: bigger face, fatter rays than the wide shots
    const CLOSE = { face: 1, rayW: 1.35, spread: 0.3, crown: 0 };
    const FACES = { oo: ['open', 'o'], os: ['open', 'smile'], cs: ['closed', 'smile'], ct: ['closed', 'think'], cw: ['closed', 'wavy'], hs: ['happy', 'smile'], hg: ['happy', 'grin'] };
    // 7–7.5: the plane hits her lower-left rays and she catches it between them.
    // One row per drawing: [face x, face y, R, expression, plane x, y, rotation, impact ticks]
    const CATCH = [
        [452, 421, 355, 'oo', 262, 600, -0.62, 1],
        [461, 420, 335, 'oo', 282, 603, -0.75, 1],
        [473, 422, 320, 'oo', 305, 612, -1.0, 0],
        [471, 424, 318, 'os', 350, 700, 1.9, 0],
        [469, 425, 330, 'os', 408, 712, 1.72, 0],
        [471, 427, 330, 'os', 420, 712, 1.62, 0],
    ];
    Shots['Flower · catch'] = (g, t, env) => {
        skyClose(g, t, env);
        const d = Math.min(5, Math.floor((t - 7) * 12 + 1e-6));
        const [fx, fy, R, ex, px, py, prot, ticks] = CATCH[d];
        const [eyes, mouth] = FACES[ex];
        if (ticks) WL.ticks(g, px - 10, py + 40, 95, 135, 9, 0.9, '#f0dc8a', 0.4);
        WL.flower(g, fx, fy, R, {
            t: 7 + d / 12, ...CLOSE, eyes, mouth, rot: 0.08,
            frontArc: [1.9, 2.5], note: (gg) => WL.plane(gg, px, py, 3.6, prot),
        });
    };

    // 7.5–10: she unfolds the note, reads it, thinks, gets it («!»), and hugs it contentedly
    // (her rays shrink). One row per drawing: [face x, face y, expression, ray excite, note
    // bottom, note width]. Between events she bobs in a 3-drawing cycle (squash, up, up).
    const READS = [];
    {
        const expr = (t) => (t < 7.83 ? 'oo' : t < 7.99 ? 'os' : t < 8.49 ? 'cs' : t < 8.74 ? 'ct' : t < 8.99 ? 'cw' : t < 9.24 ? 'oo' : t < 9.49 ? 'hg' : 'hs');
        for (let d = 0; d < 30; d++) {
            const t = 7.5 + d / 12, cyc = d % 3;
            let fy = cyc === 0 ? 421 : 408, ex = cyc === 0 ? 0.88 : 1, bottom = 905, fx = 471;
            if (t >= 8.74 && t < 8.99) (fx = 490, (fy = 392));
            if (t >= 8.99 && t < 9.24) ((fy = 396), (ex = 1.12), (bottom = 893));
            if (t >= 9.24) {
                const k = Math.floor((t - 9.25) * 4 + 1e-6); // three steps of 0.25 s: each shrinks
                fy = [431, 443, 456][k];
                bottom = [812, 824, 835][k];
                ex = [[0.8, 0.9, 0.9], [0.62, 0.7, 0.7], [0.46, 0.54, 0.54]][k][cyc];
            }
            READS.push([fx, fy, expr(t), ex, bottom, t < 7.66 ? 275 : 425]);
        }
    }
    const NOTE_H = 345;
    Shots['Flower · reads'] = (g, t, env) => {
        skyClose(g, t, env);
        const d = Math.min(READS.length - 1, Math.floor((t - 7.5) * 12 + 1e-6));
        const [fx, fy, ex, excite, bottom, nw] = READS[d];
        const [eyes, mouth] = FACES[ex];
        const R = 305, top = bottom - NOTE_H, nx = 468;
        // arms reach the note's top corners; legs end just below the note
        const arms = [[(nx - nw / 2 + 22 - fx) / R, (top + 12 - fy) / R], [(nx + nw / 2 - 22 - fx) / R, (top + 12 - fy) / R]];
        const opened = nw > 300;
        const size = (334 * 100) / WL.textW(g, 'what do', 100, 'Hand', 0.05);
        WL.flower(g, fx, fy, R, {
            t: 7.5 + d / 12, ...CLOSE, pose: 'holding', eyes, mouth, excite, arms, mitt: 0.72,
            legs: (bottom + 40 - fy) / R, legSpread: 0.36,
            note: (gg) => WL.note(gg, nx, bottom - NOTE_H / 2, nw, NOTE_H, 0.005, opened ? 'flower-note3' : 'flower-note-folded', opened
                ? { torn: 1, text: ['what do', 'you love?'], p: 1, size, lineX: [-163, -196], lineY: [0.44, 0.76] }
                : { torn: 1 }),
        });
        // the pen stroke seen through the folded note, and flashes as it opens
        if (!opened) P.markerStroke(g, [[510, 862], [532, 858], [546, 866]], '#3f66b8', 6, 'fold-mark', 0.9);
        if (t < 7.75) for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
            const x0 = nx + s * (nw / 2 + 22), y0 = 690 + k * 70;
            P.markerStroke(g, [[x0, y0 + (k - 1) * 8 * s * 0], [x0 + s * 38, y0 + (k - 1) * 14]], '#f3e7c4', 5, 'nflash' + s + k, 0.9);
        }
        // thought bubbles: three salmon dots, smallest first, while she thinks
        const DOTS = [[686, 194, 12, 7.99], [748, 132, 18, 8.16], [817, 58, 30, 8.33]];
        if (t >= 7.99 && t < 8.99) for (const [x, y, r, at] of DOTS) {
            if (t < at) continue;
            const grow = t - at < 0.09 ? 0.7 : 1;
            WL.sprite('tdot' + r, { x: -r - 6, y: -r - 6, w: 2 * r + 12, h: 2 * r + 12 }, (c) => P.cutout(c, P.ellipse(0, 0, r, r), C.flower, 'tdot' + r, { border: 0, shadow: 0.1, jag: 0.5, tex: { alpha: [0.25, 0.5] } }), 2)
                .draw((g.save(), g.translate(x, y), g.scale(grow, grow), g));
            g.restore();
        }
        // «!» and a burst of ticks and sparkles when she gets it
        if (t >= 8.99 && t < 9.24) {
            P.markerStroke(g, [[903, 104], [899, 246]], '#d9473b', 27, 'excl2', 1);
            WL.sprite('excl-dot', { x: -20, y: -20, w: 40, h: 40 }, (c) => P.cutout(c, P.ellipse(0, 0, 14, 14), '#d9473b', 'excldot', { border: 0, shadow: 0, jag: 0.5 }), 2).draw((g.save(), g.translate(895, 290), g));
            g.restore();
            WL.ticks(g, fx, fy, 400, 445, 14, 0.9, '#f0dc8a', 0.2);
            WL.plus(g, 217, 240, 14, '#f0dc8a');
            WL.plus(g, 118, 760, 10, '#f0dc8a');
        }
        if (t >= 9.24 && t < 9.74) (WL.plus(g, 861, 181, 22, '#f0dc8a'), WL.plus(g, 153, 593, 12, '#f0dc8a'));
    };

    // ------------------------------------------------------------------ 18–20
    // Her answer, drawing by drawing: she holds the note up, hugs it and turns it round (in
    // perspective), shows the back (the question shows through, «you» circled, signed with a
    // little flower), folds it into a plane and throws it down to the town.
    // [face x, y, excite, expression, note]
    //   note: ['front'] | ['flip', u] | ['back', circle, doodle] | ['fold', shape] | ['throw', x, y, rot] | ['gone']
    const ANSWER = [
        [505, 462, 1, 'os', ['front']], [507, 462, 1, 'os', ['front']], [508, 461, 1, 'os', ['front']], [506, 473, 0.95, 'os', ['front']],
        [502, 465, 1.12, 'hs', ['front']], [507, 459, 1.12, 'hs', ['front']],
        [494, 476, 1, 'hs', ['flip', 0.14]], [502, 462, 1, 'hs', ['flip', 0.27]], [506, 472, 1, 'os', ['flip', 0.38]],
        [510, 470, 1, 'os', ['back', 1, 0]], [512, 469, 1, 'os', ['back', 1, 0.5]], [508, 460, 1, 'os', ['back', 1, 1]],
        [513, 486, 0.95, 'cs', ['fold', 'sheet']], [509, 470, 1, 'cs', ['fold', 'flaps']], [515, 481, 0.95, 'cs', ['fold', 'house']],
        [515, 486, 0.95, 'os', ['fold', 'plane']], [507, 470, 1, 'os', ['fold', 'plane']],
        [510, 437, 1.1, 'hg', ['throw', 720, 222, -0.8]], [476, 506, 1, 'oo', ['throw', 400, 740, 2.3]], [482, 496, 1, 'oo', ['throw', 320, 805, 2.2]],
        [477, 498, 1, 'os', ['throw', 240, 900, 2.15]], [493, 514, 1, 'os', ['throw', 200, 985, 2.1]], [506, 485, 1, 'hs', ['gone']], [503, 488, 1, 'hs', ['gone']],
    ];
    Shots['Flower · answers'] = (g, t, env) => {
        skyClose(g, t, env, 'answer');
        moon(g, 150, 162, 0.7);
        const d = Math.min(ANSWER.length - 1, Math.floor((t - 18) * 12 + 1e-6));
        const [fx, fy, excite, ex, note] = ANSWER[d];
        const [eyes, mouth] = FACES[ex];
        const R = 228, kind = note[0], tt = 18 + d / 12;
        const NW = 325, NH = 256;
        const text = { torn: 1, text: ['what do', 'you love?'], p: 1, size: (250 * 100) / WL.textW(g, 'what do', 100, 'Hand', 0.05), lineX: [-125, -144], lineY: [0.42, 0.74] };
        if (kind === 'front' || kind === 'flip' || kind === 'back') {
            const back = kind === 'back', flip = kind === 'flip';
            const cx = 500, top = back ? 659 : 534, nw = back ? 300 : NW;
            // arms to the note's top corners (hanging lower and wider once it is turned round)
            const arms = back ? [[(cx - 170 - fx) / R, (top + 20 - fy) / R], [(cx + 180 - fx) / R, (top + 30 - fy) / R]]
                : flip ? [[(337 - fx) / R, (547 - fy) / R], [(625 - fx) / R, (578 - fy) / R]]
                    : [[(cx - nw / 2 + 20 - fx) / R, (top + 18 - fy) / R], [(cx + nw / 2 - 20 - fx) / R, (top + 18 - fy) / R]];
            WL.flower(g, fx, fy, R, {
                t: tt, ...CLOSE, pose: 'holding', eyes, mouth, excite, arms, mitt: flip ? 0.9 : 0.72,
                legs: flip ? 1.1 : back ? 1.45 : (top + NH - 30 - fy) / R, legSpread: flip ? 0.75 : back ? 0.22 : 0.26,
                note: (gg) => {
                    if (flip) {
                        gg.save();
                        // (the answer is on the back: the front turns without the circle)
                        gg.translate(495, 640 + (note[1] > 0.3 ? 90 : 0));
                        gg.rotate(-0.08);
                        WL.noteFlip(gg, 0, 0, NW, NH, note[1], 'answer-note2', text);
                        gg.restore();
                    } else if (back) WL.note(gg, cx, top + NH / 2, nw, NH, 0.01, 'answer-back', { ...text, flip: true, circle: note[1], doodle: note[2] });
                    else WL.note(gg, cx, top + NH / 2, NW, NH, 0, 'answer-front', text);
                },
            });
            if (flip) {
                // the legs grip the note's bottom corners as she turns it
                for (const [x, y] of [[350, 678], [612, 715]]) WL.sprite('flower-mitt0', { x: -30, y: -30, w: 60, h: 60 }, () => {}, 3).draw((g.save(), g.translate(x, y), g.scale(R / 150 * 1.1, R / 150 * 1.1), g));
                for (let i = 0; i < 2; i++) g.restore();
            }
        } else if (kind === 'fold') {
            // the folded paper, small and upright, mittens at its bottom corners
            const kx = 0.62, k = 0.43, cx = 497, top = 590, shape = note[1];
            WL.flower(g, fx, fy, R, {
                t: tt, ...CLOSE, pose: 'holding', eyes, mouth, excite, mitt: 0.72,
                arms: [[(cx - 105 - fx) / R, (top + 205 - fy) / R], [(cx + 105 - fx) / R, (top + 205 - fy) / R]], legs: 1.3,
                elbows: [[(cx - 150 - fx) / R, (top + 20 - fy) / R], [(cx + 150 - fx) / R, (top + 20 - fy) / R]],
                note: (gg) => {
                    gg.save();
                    gg.translate(cx, top + 0.5 * 576 * k);
                    gg.scale(kx, k);
                    gg.translate(-500, -500);
                    WL.sprite('folded-' + shape, { x: 290, y: 190, w: 420, h: 620 }, (c) => foldedPaper(c, shape), 1.4).draw(gg);
                    gg.restore();
                },
            });
            if (shape === 'house' || shape === 'plane') for (const sd of [-1, 1]) for (let j = 0; j < 2; j++) P.markerStroke(g, [[cx + sd * 110, 640 + j * 90], [cx + sd * 140, 628 + j * 90]], '#f3e7c4', 4, 'foldtick' + sd + j, 0.85);
        } else {
            WL.flower(g, fx, fy, R * 1.05, { t: tt, ...CLOSE, eyes, mouth, excite, rot: 0.15 });
            // the thrown plane and its dashed trail back to her hands
            if (kind === 'throw') {
                const [, x, y, rot] = note;
                if (d > 17) WL.trail(g, [[430, 640], [x + 20, y - 30]]);
                WL.plane(g, x, y, 3, rot);
                if (d === 17) WL.ticks(g, x, y, 60, 90, 6, 0.9, '#f3e7c4', -1.2);
            } else WL.trail(g, [[430, 640], [180, 1020]]);
        }
    };

    // ------------------------------------------------------------------ 20–21
    Shots['Exterior · arrival'] = (g, t, env) => {
        const u = E.inOut(E.seg(t, 20.0, 20.5));
        const path = P.bezier([650, 320], [620, 520], [480, 560], [360, 700], 30);
        const k = Math.min(path.length - 2, Math.floor(u * (path.length - 1)));
        const caught = t >= 20.5;
        Sets.exterior(g, t, env, {
            flower: { mouth: 'smile', ticks: 0 },
            girl: caught ? { pose: 'wave', eyes: 'open', mouth: 'o' } : { pose: 'desk', eyes: 'up' },
            // the caught plane in her raised hand (drawn inside the window's own camera)
            window: caught ? { extra: (gi) => { const [hx, hy] = WL.girlHand('wave', 1); WL.plane(gi, hx + 10, hy - 20, 1.3, -0.4); } } : {},
            over: (gg) => {
                if (!caught) {
                    WL.trail(gg, path.slice(0, k + 1));
                    WL.plane(gg, path[k][0], path[k][1], 0.8, Math.atan2(path[k + 1][1] - path[k][1], path[k + 1][0] - path[k][0]));
                }
            },
        });
    };

    // ------------------------------------------------------------------ 21–22
    Shots['Interior · reads'] = (g, t, env) => {
        // she unfolds the plane in two steps (measured: 125 wide, then 166, open at 21.5 s)
        const d = Math.floor((t - 21) * 12 + 1e-6), stage = d < 3 ? 0 : d < 6 ? 1 : 2;
        Sets.interior(g, t, env, {
            girl: { pose: 'note', eyes: 'open', look: [0, 0.6], mouth: t > 21.66 ? 'o' : 'smile' },
            extra: (gg) => {
                const [lx, ly] = WL.girlHand('note', 0), [rx] = WL.girlHand('note', 1);
                const cx = (lx + rx) / 2;
                if (stage < 2) {
                    const w = stage ? 166 : 125, h = 236, key = stage ? 'unfold-half' : 'unfold-plane';
                    WL.sprite(key, { x: -w / 2 - 10, y: -h / 2 - 10, w: w + 20, h: h + 20 }, (c) => {
                        const pts = stage ? [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]] : [[0, -h / 2], [w / 2, -h / 2 + 40], [w / 2, h / 2], [-w / 2, h / 2], [-w / 2, -h / 2 + 40]];
                        P.cutout(c, pts, C.paper, key, { border: 1.8, paper: '#fffdf6', shadow: 0.2, jag: 0.5, tex: { alpha: [0.12, 0.3] }, inner: (cc) => {
                            cc.strokeStyle = C.rule;
                            cc.lineWidth = 1.6;
                            for (let y = -h / 2 + 30; y < h / 2; y += 32) (cc.beginPath(), cc.moveTo(-w / 2, y), cc.lineTo(w / 2, y), cc.stroke());
                        } });
                        P.markerStroke(c, [[0, -h / 2 + 6], [0, h / 2 - 6]], '#8f8a92', 2, key + 'crease', 0.8);
                        P.markerStroke(c, [[-14, 62], [14, 58]], '#3f66b8', 4, key + 'mark', 0.9);
                    }, 2).draw((gg.save(), gg.translate(cx, ly - 55), gg));
                    gg.restore();
                } else {
                    WL.note(gg, cx, ly - 60, rx - lx + 60, 250, 0, 'girl-note3', { torn: 1, flip: true, text: ['what do', 'you love?'], p: 1, size: 70, lineX: [-122, -150], lineY: [0.4, 0.72], circle: 1, doodle: 1 });
                }
                // her hands on the paper's sides
                for (const [hx, sd] of [[cx - (stage === 0 ? 70 : stage === 1 ? 90 : (rx - lx) / 2 + 30), -1], [cx + (stage === 0 ? 70 : stage === 1 ? 90 : (rx - lx) / 2 + 30), 1]]) WL.hand(gg, hx, ly - 30, 22, sd * 0.3, 'fist', sd < 0);
            },
        });
    };

    // ------------------------------------------------------------------ 22–22.75
    Shots['Note · close'] = (g, t, env) => {
        WL.flat(g, env, 'note-wall', C.wall);
        const shake = Math.sin(t * 30) * 0.004;
        // measured: 'what do' spans 561 units; the signature flower sparkles on twos
        const size = (561 * 100) / WL.textW(g, 'what do', 100, 'Hand', 0.05);
        WL.note(g, 493, 496, 736, 569, -0.025 + shake, 'close-note2', { torn: 1, text: ['what do', 'you love?'], p: 1, size, lineX: [-271, -340], lineY: [0.415, 0.733], circle: 1, doodle: 1 });
        const tw = Math.floor(t * 12) % 2;
        WL.ticks(g, 752, 683, 62, 88, 8, tw ? 0.9 : 0.6, '#d9533f', tw * 0.4);
        for (const s of [-1, 1]) {
            WL.tube(g, [[500 + s * 620, 1150], [500 + s * 520, 990], [500 + s * 400, 840]], 110, C.sweater, 'closeArm' + s);
            WL.hand(g, 500 + s * 388, 830, 55, -s * 0.6, 'pinch', s < 0);
        }
    };

    // ------------------------------------------------------------------ 22.75–24
    Shots['Interior · joy'] = (g, t, env) => {
        const stage = t < 22.95 ? 0 : t < 23.4 ? 1 : 2;
        // she leans in towards the camera: 20 % bigger than in the other interior shots
        const GS = 1.08, hand = (pose, i) => WL.girlHand(pose, i, 510, 915, GS);
        Sets.interior(g, t, env, {
            girl: { s: GS, ...(stage === 0 ? { pose: 'note', eyes: 'open', mouth: 'o' } : stage === 1 ? { pose: 'note', eyes: 'happy', mouth: 'grin' } : { pose: 'hug', eyes: 'closed', mouth: 'smile', tilt: -0.08 }) },
            extra: (gg) => {
                if (stage < 2) {
                    const [lx, ly] = hand('note', 0), [rx] = hand('note', 1);
                    WL.note(gg, (lx + rx) / 2, ly - 72, rx - lx + 72, 252, 0, 'girl-note-j', { torn: 1, flip: true, text: ['what do', 'you love?'], p: 1, size: 60, lineX: [-120, -156], lineY: [0.42, 0.74], circle: 1, doodle: 1 });
                } else {
                    WL.note(gg, 510, 765, 396, 228, 0.05, 'girl-note-hug2', { torn: 1, flip: true, text: ['what do', 'you love?'], p: 1, size: 53, lineX: [-108, -138], lineY: [0.42, 0.74], circle: 1, doodle: 1 });
                    const [hx, hy] = hand('hug', 0);
                    WL.hand(gg, hx, hy, 29);
                    // paper hearts pop out and drift up (measured: red at 23.5 s, pink at 23.75 s)
                    [[733, 392, '#d9473b', 23.5, 1], [283, 362, '#ef9fb5', 23.75, 0.7]].forEach(([x, y, col, at, k], i) => {
                        const u = E.seg(t, at, at + 0.5);
                        if (u <= 0) return;
                        const heart = WL.sprite('joy-heart' + i, { x: -30, y: -30, w: 60, h: 60 }, (c) => P.cutout(c, PaperDetail.spline([[0, 20], [-20, 2], [-22, -12], [-12, -20], [0, -12], [12, -20], [22, -12], [20, 2]], 6), col, 'joyheart' + i, { border: 2.4, shadow: 0.15 }), 2.4);
                        gg.save();
                        gg.translate(x, y - u * 22);
                        gg.scale(E.back(Math.min(1, u * 3)) * k, E.back(Math.min(1, u * 3)) * k);
                        heart.draw(gg);
                        gg.restore();
                    });
                }
            },
        });
    };

    // ------------------------------------------------------------------ 24–26
    Shots['Exterior · lights'] = (g, t, env) => {
        const r = Motion.rng('town-lights');
        const lights = Array.from({ length: 11 }, (_, i) => [640 + r() * 340, 640 + r() * 330, 24.05 + i * 0.1]);
        Sets.exterior(g, t, env, {
            flower: { pose: 'holding', arms: [[-0.35, 0.9], [0.45, 0.8]], mouth: 'grin', ticks: E.bump(t, 25.4, 0.5), wiggle: E.bump(t, 25.4, 0.5) },
            girl: t >= 25.0 ? { pose: 'wave', eyes: 'happy', mouth: 'grin' } : { pose: 'desk', eyes: 'up', mouth: 'smile' },
            town: (gg) => {
                lights.forEach(([x, y, at], i) => {
                    const u = E.back(E.seg(t, at, at + 0.2));
                    if (u <= 0) return;
                    if (t < at + 0.3) WL.trail(gg, [[660, 330], [x, y]], 'rgba(240,235,220,0.5)');
                    gg.fillStyle = '#f7e3a0';
                    gg.beginPath();
                    gg.arc(x, y, 17 * u, 0, Math.PI * 2);
                    gg.fill();
                    WL.plus(gg, x, y, 7 * u, '#b8892f');
                });
            },
        });
    };

    // ------------------------------------------------------------------ 26–27
    Shots['Interior · pins'] = (g, t, env) => {
        const pinned = t >= 26.2, hug = t >= 26.45;
        Sets.interior(g, t, env, {
            girl: { x: 410, pose: hug ? 'hug' : 'pin', eyes: hug ? 'closed' : 'happy', mouth: hug ? 'smile' : 'grin' },
            pinned: (gg) => {
                WL.note(gg, 750, 517, 267, 217, 0.03, 'pinned-note2', { torn: 1, text: ['what do', 'you love?'], p: 1, size: 50, lineX: [-92, -118], lineY: [0.4, 0.72], circle: 1, doodle: 1 });
                if (pinned) WL.ticks(gg, 750, 517, 160, 195, 12, E.bump(t, 26.2, 0.35), C.star);
            },
            extra: (gg) => {
                if (!hug) {
                    const [hx, hy] = WL.girlHand('pin', 1, 410);
                    WL.hand(gg, hx, hy, 24);
                }
            },
        });
    };

    // ------------------------------------------------------------------ 27–28
    Shots['Exterior · loop'] = (g, t, env) => {
        Sets.exterior(g, t, env, {
            flower: { ticks: E.bump(t, 27.4, 0.5), wiggle: E.bump(t, 27.4, 0.5) },
            girl: { eyes: 'up', mouth: 'smile' },
            sky: (gg) => risingPlanes(gg, t),
        });
    };
})();
