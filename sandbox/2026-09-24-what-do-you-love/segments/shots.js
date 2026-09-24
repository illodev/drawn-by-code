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
    // the point of the notepad text being written, in notepad-local coordinates
    const NOTE_LINES = ['what do', 'you love?'];
    function penAt(g, p) {
        const total = NOTE_LINES.join('').length, chars = p * total;
        const line = chars <= NOTE_LINES[0].length ? 0 : 1;
        const inLine = line === 0 ? chars : chars - NOTE_LINES[0].length;
        const lx = [-200, -262][line], ly = -200 + 400 * [0.36, 0.7][line] + 10;
        const w = WL.textW(g, NOTE_LINES[line].slice(0, Math.ceil(inLine)), 100);
        return [lx + w, ly - 40];
    }
    // notepad + writing arm, with a camera (cx, cy, zoom)
    function writing(g, t, env, p, cam, withArm = true) {
        Sets.desk(g, t, env, {
            inner: (gg) => {
                gg.save();
                Motion.cam(gg, env, cam[0], cam[1], cam[2]);
                const NX = 470, NY = 480, NS = 1.18, NR = -0.02;
                Sets.notepad(gg, t, NX, NY, NS, NR, { p });
                if (withArm) {
                    const [px, py] = penAt(gg, p);
                    const wob = Math.sin(t * 40) * 3;
                    const hx = NX + (px * Math.cos(NR) - py * Math.sin(NR)) * NS, hy = NY + (px * Math.sin(NR) + py * Math.cos(NR)) * NS + wob;
                    Sets.writingArm(gg, hx, hy, { base: [1150, 1150] });
                }
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
                if (idea) WL.ticks(gg, 510, 540, 150, 190, 7, bump(t, 1.5, 0.3) + 0.4, C.star, -Math.PI * 0.95);
                // notebook on the desk
                WL.sprite('desk-book', { x: 290, y: 845, w: 380, h: 40 }, (c) => P.cutout(c, [[300, 852], [650, 852], [656, 876], [296, 876]], C.cover, 'deskbook', { border: 1.8, shadow: 0.2 }), 1.4).draw(gg);
            },
        });
    };

    // ------------------------------------------------------------------ 2–4
    Shots['Notepad · writing'] = (g, t, env) => writing(g, t, env, E.lerp(0, 7 / 16, E.seg(t, 2.05, 2.95)), [500, 500, 1]);
    Shots['Notepad · close'] = (g, t, env) => writing(g, t, env, E.lerp(7 / 16, 15.5 / 16, E.seg(t, 3.0, 3.72)), [540, 590, 1.35]);
    Shots['Notepad · done'] = (g, t, env) => writing(g, t, env, 1, [500, 500, 1]);

    // ------------------------------------------------------------------ 4–4.5
    Shots['Tear'] = (g, t, env) => {
        const u = E.out(E.seg(t, 4.0, 4.35));
        Sets.desk(g, t, env, {
            inner: (gg) => {
                gg.save();
                Motion.cam(gg, env, 500, 500, 1);
                Sets.notepad(gg, t, 470, 600, 1.15, 0.02, { sheet: false });
                // the sheet comes off, up and a little to the right
                const K = 1.3, sx = 460 + u * 20, sy = 540 - u * 40, rot = -0.13 * u;
                WL.note(gg, sx, sy, 600 * K, 400 * K, rot, 'notepad-sheet', { torn: 1, text: NOTE_LINES, p: 1, size: 118 * K * 0.9, lineX: [-200 * K, -265 * K], lineY: [0.36, 0.72] });
                // hands on the top corners
                for (const s of [-1, 1]) {
                    const hx = sx + s * 330 * Math.cos(rot) - (-215) * Math.sin(rot), hy = sy + s * 330 * Math.sin(rot) + (-215) * Math.cos(rot);
                    WL.tube(gg, [[hx + s * 260, hy + 500], [hx + s * 120, hy + 250], [hx, hy + 20]], 90, C.sweater, 'tearArm' + s);
                    WL.hand(gg, hx, hy, 40);
                }
                // paper bits jumping off the torn edge
                const r = Motion.rng('bits');
                for (let i = 0; i < 12; i++) {
                    const a = -Math.PI * (0.15 + r() * 0.7), v = 120 + r() * 160, b = E.seg(t, 4.12 + r() * 0.1, 4.5);
                    if (b <= 0 || b >= 1) continue;
                    gg.save();
                    gg.globalAlpha = 1 - b;
                    gg.fillStyle = '#fffdf6';
                    gg.beginPath();
                    gg.ellipse(sx - 330 + r() * 660 + Math.cos(a) * v * b, sy - 140 + Math.sin(a) * v * b + 200 * b * b, 6 + r() * 6, 4 + r() * 4, r() * 3, 0, Math.PI * 2);
                    gg.fill();
                    gg.restore();
                }
                gg.restore();
            },
        });
    };

    // ------------------------------------------------------------------ 4.5–5.25
    // folding over a circle of light: flat sheet → «house» (top corners folded) → plane
    Shots['Fold'] = (g, t, env) => {
        const f = t < 4.7 ? 0 : t < 4.95 ? 1 : 2;
        Sets.desk(g, t, env, {
            inner: (gg) => {
                WL.sprite('fold-light', { x: 150, y: 130, w: 700, h: 700 }, (c) => P.cutout(c, P.ellipse(500, 480, 330, 330), '#dcb679', 'foldlight', { border: 0, shadow: 0, jag: 1.3, tex: { alpha: [0.2, 0.4] } }), 1.2).draw(gg);
                WL.ticks(gg, 500, 480, 350, 400, 16, 0.6 + 0.2 * Math.sin(t * 20), '#f3dc9e');
                const shapes = [
                    [[380, 250], [620, 250], [620, 720], [380, 720]],
                    [[500, 250], [620, 400], [620, 720], [380, 720], [380, 400]],
                    [[500, 230], [560, 470], [540, 720], [460, 720], [440, 470]],
                ];
                const key = 'fold' + f;
                WL.sprite(key, { x: 340, y: 200, w: 320, h: 560 }, (c) => {
                    P.cutout(c, shapes[f], '#fbf8f0', key, { border: 0, shadow: 0.25, jag: 0.4, tex: { alpha: [0.1, 0.2] } });
                    c.strokeStyle = '#c9c2b2';
                    c.lineWidth = 2;
                    c.beginPath();
                    c.moveTo(500, shapes[f][0][1]);
                    c.lineTo(500, 720);
                    if (f === 1) (c.moveTo(380, 400), c.lineTo(620, 400));
                    c.stroke();
                    if (f === 0) for (let y = 300; y < 720; y += 55) (c.strokeStyle = C.rule, c.beginPath(), c.moveTo(380, y), c.lineTo(620, y), c.stroke());
                }, 1.4).draw(gg);
                // hands holding the bottom corners
                const hy = f === 2 ? 700 : 690;
                for (const s of [-1, 1]) {
                    const hx = 500 + s * (f === 2 ? 55 : 125);
                    WL.tube(gg, [[500 + s * 520, 1150], [500 + s * 330, 900], [hx + s * 10, hy + 20]], 90, C.sweater, 'foldArm' + s);
                    WL.hand(gg, hx, hy, 40);
                }
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
        Sets.interior(g, t, env, {
            girl: stage === 0 ? { pose: 'note', eyes: 'open', mouth: 'o' } : stage === 1 ? { pose: 'note', eyes: 'happy', mouth: 'grin' } : { pose: 'hug', eyes: 'closed', mouth: 'smile', tilt: -0.08 },
            extra: (gg) => {
                if (stage < 2) {
                    const [lx, ly] = WL.girlHand('note', 0), [rx] = WL.girlHand('note', 1);
                    WL.note(gg, (lx + rx) / 2, ly - 60, rx - lx + 60, 210, 0, 'girl-note', { torn: 1, flip: true, text: ['what do', 'you love?'], p: 1, size: 50, lineX: [-100, -130], lineY: [0.42, 0.74], circle: 1, doodle: 1 });
                } else {
                    WL.note(gg, 510, 790, 330, 190, 0.05, 'girl-note-hug', { torn: 1, flip: true, text: ['what do', 'you love?'], p: 1, size: 44, lineX: [-90, -115], lineY: [0.42, 0.74], circle: 1, doodle: 1 });
                    const [hx, hy] = WL.girlHand('hug', 0);
                    WL.hand(gg, hx, hy, 24);
                    // little hearts float up
                    [[730, 470, '#d9473b', 23.5], [300, 430, '#ef9fb5', 23.62]].forEach(([x, y, col, at], i) => {
                        const u = E.seg(t, at, at + 0.5);
                        if (u <= 0) return;
                        gg.save();
                        gg.translate(x + Math.sin(t * 6 + i) * 6, y - u * 40);
                        gg.scale(E.back(Math.min(1, u * 3)) * 1.4, E.back(Math.min(1, u * 3)) * 1.4);
                        gg.fillStyle = col;
                        gg.beginPath();
                        gg.moveTo(0, 12);
                        gg.bezierCurveTo(-26, -6, -12, -26, 0, -12);
                        gg.bezierCurveTo(12, -26, 26, -6, 0, 12);
                        gg.fill();
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
            girl: { x: 380, pose: hug ? 'hug' : 'pin', eyes: hug ? 'closed' : 'happy', mouth: hug ? 'smile' : 'grin' },
            pinned: (gg) => {
                WL.note(gg, 690, 470, 250, 170, 0.04, 'pinned-note', { torn: 1, text: ['what do', 'you love?'], p: 1, size: 44, lineX: [-80, -105], lineY: [0.42, 0.74], circle: 1, doodle: 1 });
                if (pinned) WL.ticks(gg, 690, 470, 150, 185, 12, E.bump(t, 26.2, 0.35), C.star);
            },
            extra: (gg) => {
                if (!hug) {
                    const [hx, hy] = WL.girlHand('pin', 1, 380);
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
