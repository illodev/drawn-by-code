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
        const lx = [-190, -250][line], ly = -200 + 400 * [0.36, 0.72][line] + 10;
        const w = WL.textW(g, NOTE_LINES[line].slice(0, Math.ceil(inLine)), 118);
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
            girl: idea ? { pose: 'pencil', eyes: 'open', mouth: 'o', look: [0.3, -0.6] } : { pose: 'desk', eyes: 'closed', mouth: 'smile' },
            extra: (gg) => {
                if (idea) WL.ticks(gg, 530, 598, 130, 165, 7, bump(t, 1.5, 0.3) + 0.4, C.star, -Math.PI * 0.95);
                // notebook on the desk
                WL.sprite('desk-book', { x: 290, y: 845, w: 380, h: 40 }, (c) => P.cutout(c, [[300, 852], [650, 852], [656, 876], [296, 876]], C.cover, 'deskbook', { border: 1.8, shadow: 0.2 }), 1.4).draw(gg);
            },
        });
    };

    // ------------------------------------------------------------------ 2–4
    Shots['Notepad · writing'] = (g, t, env) => writing(g, t, env, E.lerp(0, 7 / 16, E.seg(t, 2.05, 2.95)), [500, 500, 1]);
    Shots['Notepad · close'] = (g, t, env) => writing(g, t, env, E.lerp(7 / 16, 15.5 / 16, E.seg(t, 3.0, 3.72)), [430, 430, 1.35]);
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
                const K = 1.15, sx = 470 + u * 30, sy = 520 - u * 50, rot = -0.12 * u;
                WL.note(gg, sx, sy, 600 * K, 400 * K, rot, 'notepad-sheet', { torn: 1, text: NOTE_LINES, p: 1, size: 118 * K, lineX: [-190 * K, -250 * K], lineY: [0.36, 0.72] });
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
            girl: { pose: released ? 'release' : 'throw', eyes: 'open', look: [0.6, -0.8], mouth: released ? 'o' : 'smile' },
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

    // the rest is filled in shot by shot; until then, a neutral placeholder
    const todo = (name) => (g, t, env) => {
        Sets.sky(g, t, env);
        WL.write(g, name, 500, 520, 60, '#efe8cd', { align: 'center' });
    };
    for (const name of ['Sky · flight', 'Flower · catch', 'Flower · reads', 'Montage', 'Heart', 'Flower · answers', 'Exterior · arrival', 'Interior · reads', 'Note · close', 'Interior · joy', 'Exterior · lights', 'Interior · pins', 'Exterior · loop']) Shots[name] = todo(name);
})();
