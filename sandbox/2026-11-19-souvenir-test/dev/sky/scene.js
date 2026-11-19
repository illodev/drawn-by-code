// Dev sheet for things/sky.js: the swallows, the moon and the stars on the indigo ground.
// Five pages, one every 0.2 s (render with --at 0,0.21,0.42,0.63,0.84):
//   0  the sheet: everything at film size, and 2× close-ups of a head, a wing and the moon (raw paint)
//   1  both swallows whole at 2×
//   2  the tails, the moon's phases and the stars at 2×
//   3  other turns, mirrors and sizes (does the light stay at the top left?)
//   4  the sheet again, through the lens' finish
const SKYDIR = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', SKYDIR + 'things/sky.js'],
    draw(g, t) {
        const S = Souvenir, page = Math.min(4, Math.floor(t * 5 + 1e-6));
        g.fillStyle = '#232749';
        g.fillRect(0, 0, 1600, 900);
        const win = (x, y, w, h, fn) => {
            g.save();
            g.beginPath();
            g.rect(x, y, w, h);
            g.clip();
            g.fillStyle = '#20244a';
            g.fillRect(x, y, w, h);
            fn();
            g.restore();
            g.strokeStyle = 'rgba(217,164,65,0.5)';
            g.lineWidth = 1;
            g.strokeRect(x, y, w, h);
        };
        const left = { rot: 0.2, pose: 0, seed: 'left' }, right = { rot: 0.2, pose: 1, flip: true, seed: 'right' };
        if (page === 1) {
            Sky.swallow(g, { x: 430, y: 450, s: 2, ...left });
            Sky.swallow(g, { x: 1230, y: 450, s: 2, ...right });
        } else if (page === 2) {
            win(20, 20, 500, 420, () => Sky.swallow(g, { x: 530, y: 250, s: 2, ...left }));
            win(540, 20, 500, 420, () => Sky.swallow(g, { x: 540, y: 250, s: 2, ...right }));
            Sky.moon(g, { x: 1200, y: 230, r: 130, phase: 0.15 });
            Sky.moon(g, { x: 1440, y: 230, r: 100, phase: 0.75 });
            Sky.moon(g, { x: 190, y: 680, r: 180, phase: 0.5 });
            Sky.moon(g, { x: 600, y: 680, r: 180, phase: 1 });
            let x = 860;
            for (const kind of ['gold', 'silver']) for (const r of [60, 36, 20]) {
                Sky.star(g, { x: x + r, y: 560, r, kind });
                x += r * 2 + 24;
            }
            x = 870;
            for (const r of [24, 16, 10, 6, 4, 2]) {
                Sky.spark(g, { x: x + r, y: 700, r });
                x += r * 2 + 30;
            }
            win(860, 760, 700, 120, () => {
                g.save();
                g.translate(860, 760);
                g.scale(2, 2);
                Sky.field(g, { box: { x: 0, y: 0, w: 350, h: 60 }, seed: 'zoom', n: 16 });
                g.restore();
            });
        } else if (page === 3) {
            Sky.swallow(g, { x: 230, y: 230, rot: -0.5, pose: 0, flip: true, seed: 'a' });
            Sky.swallow(g, { x: 600, y: 220, rot: 0.7, pose: 1, seed: 'b' });
            Sky.swallow(g, { x: 930, y: 230, rot: -0.3, pose: 1, seed: 'c' });
            Sky.swallow(g, { x: 1300, y: 230, rot: 1.2, pose: 0, s: 1.25, seed: 'd' });
            Sky.swallow(g, { x: 150, y: 600, rot: 0, pose: 0, s: 0.6, seed: 'e' });
            Sky.swallow(g, { x: 150, y: 780, rot: 0, pose: 1, s: 0.6, flip: true, seed: 'f' });
            let x = 300;
            for (const phase of [0.15, 0.28, 0.4, 0.6, 0.85, 1]) {
                Sky.moon(g, { x: x + 90, y: 560, r: 90, phase });
                Sky.moon(g, { x: x + 90, y: 770, r: 60, phase, rot: 0.6 });
                x += 205;
            }
            for (let i = 0; i < 6; i++) Sky.star(g, { x: 1560, y: 470 + i * 70, r: 24, rot: i * 0.13, kind: i % 2 ? 'silver' : 'gold' });
            // the room each pose takes about its anchor, at s = 1 and rot = 0
            g.fillStyle = '#d9dcea';
            g.font = '15px monospace';
            [0, 1].forEach((pose, i) => {
                const b = Sky.swallowBox(g, { pose });
                g.fillText(`pose ${pose}: x ${(b.x + 9).toFixed(0)} … ${(b.x + b.w - 9).toFixed(0)}, y ${(b.y + 9).toFixed(0)} … ${(b.y + b.h - 9).toFixed(0)}`, 20, 440 + i * 22);
            });
        } else {
            Sky.field(g, { box: { x: 30, y: 20, w: 1540, h: 420 }, seed: 'dev', n: 70 });
            Sky.moon(g, { x: 800, y: 130, r: 90 });
            Sky.moon(g, { x: 705, y: 300, r: 44, phase: 0.5 });
            Sky.moon(g, { x: 895, y: 300, r: 44, phase: 1 });
            let x = 610;
            for (const kind of ['gold', 'silver']) for (const r of [30, 18, 10]) {
                Sky.star(g, { x: x + r, y: 405, r, kind });
                x += r * 2 + 22;
            }
            Sky.swallow(g, { x: 360, y: 230, ...left });
            Sky.swallow(g, { x: 1250, y: 260, ...right });
            // 2×: the head, a wing, the moon
            win(20, 470, 500, 410, () => Sky.swallow(g, { x: 120, y: 640, s: 2, ...left }));
            win(550, 470, 500, 410, () => Sky.swallow(g, { x: 880, y: 440, s: 2, ...left }));
            win(1080, 470, 500, 410, () => Sky.moon(g, { x: 1330, y: 675, r: 180 }));
        }
        S.tooth(g, { x: 0, y: 0, w: 1600, h: 900 });
    },
    post(ctx, t, env) {
        if (t >= 0.8) Souvenir.finish(ctx, env, 0);
    },
});
