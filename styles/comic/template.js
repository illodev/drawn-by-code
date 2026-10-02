// Comic style template: a sleepy mug, a sugar cube dropping in and a PLOP!, told in three
// panels that pop in on the beats. engine/new.mjs copies it as the scene.js of every new
// experiment.
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/comic/comic.js'],
    fonts: [
        { family: 'Bangers', src: 'fonts/Bangers-Regular.ttf' },
        { family: 'Comic Neue', src: 'fonts/ComicNeue-Bold.ttf', descriptors: { weight: '700' } },
    ],
    bpm: 120,
    shots: [[0, 4, 'Template']],

    draw(g, t, env) {
        const C = Comic, K = C.COL, E = Ease;
        const tt = C.onTwos(t); // every drawing holds for 1/12 s
        C.paper(g, env);

        const A = { x: 60, y: 60, w: 700, h: 780 }, B = { x: 790, y: 60, w: 750, h: 370 }, P = { x: 790, y: 460, w: 750, h: 380 };
        const splash = 1.5; // the cube lands on this beat

        // a panel pops in around its centre
        const pop = (r, at, fn, seed) => {
            const e = C.enter(t, at);
            if (!e.on) return;
            g.save();
            g.translate(r.x + r.w / 2, r.y + r.h / 2);
            g.scale(e.s, e.s);
            g.rotate((1 - e.u) * 0.05);
            g.translate(-(r.x + r.w / 2), -(r.y + r.h / 2));
            C.panel(g, r, fn, { seed });
            g.restore();
        };

        const mug = (g, x, y, s, awake) => {
            // body, band and handle; the face wakes up when the cube lands
            g.save();
            g.translate(x, y);
            g.scale(s, s);
            // the handle is a tube: a wide ink line with a narrower white one on top
            const hp = [[96, -150], [150, -150], [182, -120], [182, -60], [150, -30], [100, -30]];
            C.ink(g, hp, { w: 32, taper: [0, 0], wobble: 0.08, seed: 'handle' });
            C.ink(g, hp, { w: 19, taper: [0, 0], wobble: 0, color: K.white, seed: 'handle2' });
            const body = [[-120, -220], [120, -220], [112, 0], [100, 30], [-100, 30], [-112, 0]];
            C.shape(g, body, {
                fill: K.white, w: 7, seed: 'mug', smooth: false,
                shade: (c, p) => C.halftone(c, p, { color: K.sky, spacing: 12, r0: 0, r1: 4.2, dir: [1, 0.2], box: { x: -130, y: -230, w: 260, h: 270 } }),
            });
            C.shape(g, [[-116, -150], [116, -150], [114, -110], [-114, -110]], { fill: K.blue, w: 5, seed: 'band', smooth: false });
            C.shape(g, C.ellipse(0, -220, 120, 22, 40), { fill: '#6b3b22', w: 6, seed: 'rim', smooth: false });
            // face
            const blink = !awake && C.drawing(t) % 30 === 29;
            for (const ex of [-48, 48]) {
                if (awake) {
                    C.shape(g, C.ellipse(ex, -70, 26, 30, 30), { fill: K.white, w: 5, seed: 'eye' + ex, smooth: false });
                    g.fillStyle = K.ink;
                    g.beginPath();
                    g.arc(ex + 3, -68, 9, 0, Math.PI * 2);
                    g.fill();
                } else if (blink) {
                    C.ink(g, [[ex - 24, -66], [ex, -60], [ex + 24, -66]], { w: 6, seed: 'shut' + ex });
                } else {
                    C.shape(g, C.ellipse(ex, -66, 24, 18, 30), { fill: K.white, w: 5, seed: 'eye' + ex, smooth: false });
                    g.fillStyle = K.ink;
                    g.beginPath();
                    g.arc(ex + 10, -62, 7, 0, Math.PI * 2);
                    g.fill();
                    // heavy lid over the top half
                    g.save();
                    g.clip(C.pathOf(C.ellipse(ex, -66, 24, 18, 30)));
                    g.fillStyle = '#d9e8ef';
                    g.fillRect(ex - 30, -90, 60, 26);
                    g.restore();
                    C.ink(g, [[ex - 27, -64], [ex, -67], [ex + 27, -63]], { w: 7, taper: [0.15, 0.15], seed: 'lid' + ex });
                }
            }
            if (awake) C.shape(g, C.ellipse(0, -18, 16, 20, 24), { fill: '#6b3b22', w: 5, seed: 'oh', smooth: false });
            else C.ink(g, [[-26, -22], [0, -14], [30, -26]], { w: 6, seed: 'mouth' });
            g.restore();
        };

        // A · the mug on its table
        pop(A, 0, (c) => {
            const sky = C.rect(A.x, A.y, A.w, A.h);
            C.halftone(c, C.pathOf(sky), { color: K.sky, spacing: 16, r0: 1, r1: 6.5, dir: [0, 1], box: A });
            C.shape(c, [[A.x - 20, 640], [A.x + A.w + 20, 610], [A.x + A.w + 20, A.y + A.h + 20], [A.x - 20, A.y + A.h + 20]], {
                fill: K.orange, w: 7, smooth: false, seed: 'table',
                shade: (cc, p) => C.dots(cc, p, { color: K.red, spacing: 11, r: 2.4 }),
            });
            const awake = tt >= splash;
            if (!awake) {
                // steam: two wavy strokes that rise and sway, redrawn on twos
                for (let k = 0; k < 2; k++) {
                    const d = C.drawing(t) + k * 5, sx = 360 + k * 80;
                    const pts = Array.from({ length: 6 }, (_, i) => [sx + Math.sin(i * 1.2 + d * 0.7) * 14, 360 - i * 34 - (d % 6) * 4]);
                    C.ink(c, pts, { w: 5, taper: [0.5, 0.5], seed: 'steam' + k });
                }
            }
            const jolt = awake ? E.bump(tt, splash, 0.34) * 18 : 0;
            mug(c, 400, 660 - jolt, 1.25, awake);
            if (tt >= splash) {
                const u = E.out(E.seg(tt, splash, splash + 0.5));
                for (let i = 0; i < 7; i++) {
                    const a = -Math.PI / 2 + (i - 3) * 0.32, d = 60 + u * 110;
                    const px = 400 + Math.cos(a) * d, py = 380 + Math.sin(a) * d * 0.9 + u * u * 120;
                    if (u < 1) C.shape(c, C.ellipse(px, py, 11, 15, 16, a + Math.PI / 2), { fill: '#6b3b22', w: 3.5, seed: 'drop' + i, smooth: false });
                }
            }
            if (tt >= splash + 0.5) C.balloon(c, { x: 560, y: 190, rx: 90, ry: 70, tail: [470, 330], text: '!!', size: 64, seed: 'bal' });
        }, 'A');

        // B · the camera falls with the cube: it stays put and the speed lines stream up.
        // Once the cube has landed the panel holds its last drawing (a panel is a moment).
        pop(B, 0.5, (c) => {
            const t = Math.min(tt, splash - 1 / 12);
            c.fillStyle = K.yellow;
            c.fillRect(B.x, B.y, B.w, B.h);
            const r = Motion.rng('rain');
            const scroll = C.drawing(t) * 60;
            for (let i = 0; i < 26; i++) {
                const x = B.x + r() * B.w, len = 90 + r() * 160, y0 = r() * (B.h + 400);
                const y = B.y + B.h + 200 - ((y0 + scroll) % (B.h + 400));
                C.ink(c, [[x, y], [x, y + len]], { w: 4 + r() * 5, taper: [0.9, 0.05], seed: 'streak' + i, smooth: false });
            }
            c.save();
            c.translate(B.x + B.w / 2, B.y + B.h / 2 + Math.sin(C.drawing(t) * 1.3) * 6);
            c.rotate(0.35 + C.drawing(t) * 0.18);
            C.shape(c, C.rect(-60, -60, 120, 120), { fill: K.white, w: 7, smooth: false, seed: 'cube', shade: (cc, p) => C.dots(cc, p, { color: K.sky, spacing: 9, r: 1.8 }) });
            c.restore();
        }, 'B');

        // C · PLOP!
        pop(P, splash, (c) => {
            c.fillStyle = K.red;
            c.fillRect(P.x, P.y, P.w, P.h);
            C.dots(c, C.pathOf(C.rect(P.x, P.y, P.w, P.h)), { color: '#b72c22', spacing: 14, r: 4 });
            const s = 1 + 0.06 * Math.sin(C.drawing(t) * 1.9);
            C.burst(c, P.x + P.w / 2, P.y + P.h / 2, 250 * s, { ry: 150 * s, points: 14, fill: K.yellow, seed: 'plop' });
            C.sfx(c, 'PLOP!', P.x + P.w / 2 - 6, P.y + P.h / 2 + 4, { size: 150, rot: -0.1, seed: 'plop', fill: K.white, shade: K.blue });
        }, 'C');
    },

    post(ctx, t, env) {
        Comic.grainPost(ctx, env);
    },
});
