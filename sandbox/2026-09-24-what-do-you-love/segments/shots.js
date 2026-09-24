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
    const FL = [470, 420, 330]; // the flower in the close sky shots: x, y, R
    const skyClose = (g, t, env) => Sets.sky(g, t, env, { key: 'close', bands: [[250, 150, C.band], [520, 160, C.band2]], stars: 12 });
    Shots['Flower · catch'] = (g, t, env) => {
        skyClose(g, t, env);
        const hit = t >= 7.12;
        if (!hit) {
            const u = E.in(E.seg(t, 7.0, 7.12));
            WL.flower(g, FL[0], FL[1], FL[2], { t, rot: 0.1, mouth: 'o' });
            WL.plane(g, E.lerp(150, 380, u), E.lerp(820, 600, u), 2.2, -0.75);
        } else {
            const holdPlane = t < 7.32;
            WL.flower(g, FL[0], FL[1], FL[2], {
                t, pose: 'holding', mouth: 'o', wiggle: E.bump(t, 7.12, 0.2), arms: [[-0.3, 0.75], [0.3, 0.75]], excite: 1.1,
                note: (gg) => (holdPlane ? WL.plane(gg, FL[0], FL[1] + 280, 2.4, -Math.PI / 2) : WL.note(gg, FL[0], FL[1] + 280, 330 * E.out(E.seg(t, 7.32, 7.5)) + 40, 260, 0, 'flower-note', { torn: 1 })),
            });
        }
    };

    // ------------------------------------------------------------------ 7.5–10
    Shots['Flower · reads'] = (g, t, env) => {
        skyClose(g, t, env);
        // camera eases back and the flower bounces at the end
        const back = E.inOut(E.seg(t, 9.1, 9.6));
        const R = E.lerp(FL[2], 300, back), cy = E.lerp(FL[1], 400, back) - Math.abs(Math.sin((t - 9.1) * 10)) * 20 * back + Math.sin(t * 3) * 10;
        const thinking = t >= 7.95 && t < 9.0, eureka = t >= 9.0, surprised = t >= 9.0 && t < 9.2;
        // the note finishes unfolding: narrow and tall at 7.5, full width by 7.8
        const unfold = E.out(E.seg(t, 7.5, 7.8));
        const noteY = cy + R * 0.9, noteW = R * E.lerp(0.62, 1.34, unfold), noteH = R * 1.0;
        WL.flower(g, FL[0], cy, R, {
            t, pose: 'holding', arms: [[-0.64, 0.42], [0.64, 0.42]], tilt: Math.sin(t * 2.5) * 0.03,
            excite: 1 + 0.2 * E.bump(t, 8.95, 0.35) - 0.2 * E.seg(t, 9.3, 9.6),
            eyes: thinking ? 'closed' : surprised ? 'open' : eureka ? 'happy' : 'open', mouth: thinking ? 'think' : surprised ? 'o' : eureka ? 'smile' : 'o', wiggle: eureka ? E.bump(t, 9.0, 0.3) : 0,
            note: (gg) => WL.note(gg, FL[0], noteY, noteW, noteH, 0.01, 'flower-note2', { torn: 1, text: ['what do', 'you love?'], p: E.seg(t, 7.72, 7.8), lineY: [0.42, 0.74] }),
        });
        // thought bubbles, then «!»
        for (let k = 0; k < 3; k++) {
            const u = E.out(E.seg(t, 8.2 + k * 0.15, 8.4 + k * 0.15)) * (1 - E.seg(t, 8.95, 9.0));
            if (u <= 0) continue;
            g.fillStyle = C.flower;
            g.beginPath();
            g.arc(FL[0] + R * (0.75 + k * 0.22), cy - R * (0.55 + k * 0.28), (10 + k * 7) * u, 0, Math.PI * 2);
            g.fill();
        }
        if (eureka && t < 9.22) {
            const u = E.back(E.seg(t, 9.0, 9.15));
            g.save();
            g.translate(FL[0] + R * 1.05, cy - R * 0.6);
            g.scale(u, u);
            P.markerStroke(g, [[0, -60], [0, 10]], '#d9473b', 22, 'excl', 1);
            g.fillStyle = '#d9473b';
            g.beginPath();
            g.arc(0, 45, 12, 0, Math.PI * 2);
            g.fill();
            g.restore();
            WL.ticks(g, FL[0], cy, R * 1.15, R * 1.45, 12, E.bump(t, 9.0, 0.4), C.star, 0.1);
        }
    };

    // ------------------------------------------------------------------ 18–20
    Shots['Flower · answers'] = (g, t, env) => {
        Sets.sky(g, t, env, { key: 'answer', bands: [[240, 140, C.band], [470, 140, C.band2]], stars: 12 });
        moon(g, 150, 110, 0.9);
        const R = 230, fx = 480, fy = 420;
        const flip = E.inOut(E.seg(t, 18.35, 18.7)); // 0 front … 1 back
        const folded = t >= 18.95, thrown = t >= 19.4;
        if (!thrown) {
            // the answer: circle «you», sign it with a little flower, turn the note over (in
            // perspective), fold it into a plane
            const circleP = E.seg(t, 18.05, 18.3), doodleP = E.seg(t, 18.15, 18.3);
            const heldNote = (gg) => {
                if (folded) return WL.plane(gg, fx, fy + R * 0.95, 2.4, -Math.PI / 2);
                const o = { torn: 1, text: ['what do', 'you love?'], p: 1, size: 52, lineX: [-95, -125], lineY: [0.42, 0.74], circle: flip > 0 ? 1 : Math.round(circleP * 8) / 8, doodle: flip > 0 ? 1 : Math.round(doodleP * 8) / 8 };
                if (flip <= 0) WL.note(gg, fx, fy + R * 0.95, 290, 220, 0, 'answer-note', o);
                else WL.noteFlip(gg, fx, fy + R * 0.95, 290, 220, flip, 'answer-note', o);
            };
            WL.flower(g, fx, fy, R, { t, pose: 'holding', arms: [[-0.6, 0.5], [0.6, 0.5]], eyes: t < 18.3 ? 'open' : 'happy', mouth: 'smile', wiggle: E.bump(t, 18.3, 0.3), note: heldNote });
        } else {
            WL.flower(g, fx, fy, R, { t, rot: 0.15, mouth: 'o', wiggle: E.bump(t, 19.4, 0.3) });
            const u = E.in(E.seg(t, 19.4, 19.95));
            const x = E.lerp(fx - 100, 120, u), y = E.lerp(fy + 250, 1050, u);
            WL.trail(g, [[fx - 100, fy + 250], [x, y]]);
            WL.plane(g, x, y, 2 - u, 2.2);
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
        const open = E.out(E.seg(t, 21.1, 21.45));
        Sets.interior(g, t, env, {
            girl: { pose: 'note', eyes: 'open', look: [0, 0.6], mouth: t > 21.65 ? 'o' : 'smile' },
            extra: (gg) => {
                const [lx, ly] = WL.girlHand('note', 0), [rx] = WL.girlHand('note', 1);
                const w = E.lerp(80, rx - lx + 60, open);
                WL.note(gg, (lx + rx) / 2, ly - 60, w, 210, 0, 'girl-note', { torn: 1, flip: true, text: ['what do', 'you love?'], p: open > 0.6 ? 1 : 0, size: 50, lineX: [-100, -130], lineY: [0.42, 0.74], circle: 1, doodle: 1 });
            },
        });
    };

    // ------------------------------------------------------------------ 22–22.75
    Shots['Note · close'] = (g, t, env) => {
        WL.flat(g, env, 'note-wall', C.wall);
        const shake = Math.sin(t * 30) * 0.004;
        WL.note(g, 500, 470, 760, 560, -0.015 + shake, 'close-note', { torn: 1, text: ['what do', 'you love?'], p: 1, size: 132, lineX: [-250, -325], lineY: [0.4, 0.72], circle: 1, doodle: 1 });
        WL.ticks(g, 728, 668, 40, 70, 10, 0.5 + 0.4 * Math.sin(t * 16), '#d9473b');
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
