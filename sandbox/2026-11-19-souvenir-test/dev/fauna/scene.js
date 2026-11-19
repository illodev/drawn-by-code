// Dev sheet for things/fauna.js. Pages, one every 0.25 s (render with --at 0,0.25,0.5 … 2.75):
//   0  every creature at s = 1 in the emblem manner (line: true) on the indigo ground; webs; some at 3×
//   1  the brush manner (line: false) over leaves; drops on a leaf and on yellow; a corner web
//   2 / 3   bee, ladybird, snail at 5× (emblem / brush)
//   4 / 5   lizard and gecko at 3×, both poses (emblem / brush, on leaves)        6  at 5×
//   7 / 8   butterfly (fold 0, 0.25, 0.6, 1) and goldfinch (both poses, a slanted perch) at 3× (emblem / brush)
//   9       butterfly at 7×, goldfinch at 5×
//   10 / 11 everything turned and mirrored, with its box and its marks (feet gold, mouth rose, anchor blue)
// Everything is painted on a transparent layer first, as the picture does, so that a
// creature's cast lands on paint only (a leaf), never on the ground.
const FDIR = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 24, duration: 4, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', FDIR + 'things/citrus.js', FDIR + 'things/fauna.js'],
    setup() {
        return { layer: document.createElement('canvas') };
    },
    draw(g, t, env) {
        const S = Souvenir, page = Math.floor(t * 4 + 1e-6);
        const NIGHT = '#232749', GREEN = '#3f7a3c';
        const L = env.state.layer;
        if (L.width !== env.px[0]) {
            L.width = env.px[0];
            L.height = env.px[1];
        }
        const q = L.getContext('2d');
        q.setTransform(1, 0, 0, 1, 0, 0);
        q.clearRect(0, 0, L.width, L.height);
        q.setTransform(env.k, 0, 0, env.k, 0, 0);
        const ground = (c) => {
            g.fillStyle = c;
            g.fillRect(0, 0, 1600, 900);
        };
        const label = (txt, x, y) => {
            g.fillStyle = 'rgba(233,237,247,0.75)';
            g.font = '13px monospace';
            g.fillText(txt, x, y);
        };
        const res = Math.ceil(env.k * 2) / 2;
        const leaf = (v, x, y, rot, s = 1, kind = 'mid') => Citrus.put(q, Citrus.leaf(v, rot, Math.ceil(res * s * 2) / 2, kind), x, y, s);
        const twig = (x0, y0, x1, y1, w = 5) => {
            // a perch: the lemon tree's own wood if it is there, a plain painted stick otherwise
            const pts = [[x0, y0], [(x0 + x1) / 2, (y0 + y1) / 2], [x1, y1]];
            if (typeof Citrus.branch === 'function') return Citrus.branch(q, pts, { w0: w, w1: w * 0.85, seed: 'dev' + x0, shade: false });
            q.lineCap = 'round';
            for (const [col, lw, dy] of [['#3b2c20', w, 0], ['#8a7252', w * 0.5, -w * 0.18], ['#c9b58a', w * 0.14, -w * 0.3]]) {
                q.strokeStyle = col;
                q.lineWidth = lw;
                q.beginPath();
                q.moveTo(x0, y0 + dy);
                q.lineTo(x1, y1 + dy);
                q.stroke();
            }
        };
        const ALL = (line, y0) => {
            // every creature at s = 1, in two rows
            Fauna.bee(q, { x: 110, y: y0 + 70, line, pose: 'fly' });
            Fauna.bee(q, { x: 230, y: y0 + 70, line, pose: 'feed' });
            Fauna.ladybird(q, { x: 330, y: y0 + 70, line, rot: -0.5 });
            Fauna.snail(q, { x: 450, y: y0 + 70, line, trail: 26 });
            if (!line) return 0;
            Fauna.lizard(q, { x: 700, y: y0 + 80, line });
            Fauna.gecko(q, { x: 960, y: y0 + 80, line });
            Fauna.butterfly(q, { x: 1140, y: y0 + 80, line, rot: -1.2 });
            Fauna.butterfly(q, { x: 1260, y: y0 + 90, line, fold: 1 });
            const pf = [1350, y0 + 123, 1450, y0 + 123];
            twig(pf[0] - 20, pf[1], pf[2] + 10, pf[3]);
            Fauna.goldfinch(q, { x: 1400, y: y0 + 80, line });
            return 0;
        };
        if (page === 0) {
            ground(NIGHT);
            ALL(true, 20);
            Fauna.web(q, { x: 1560, y: 30, r: 150, a0: Math.PI / 2, a1: Math.PI, seed: 'corner' });
            Fauna.web(q, { x: 1150, y: 760, to: [1420, 860], r: 70, seed: 'span' });
            // 3×
            Fauna.bee(q, { x: 220, y: 470, s: 3, line: true, pose: 'fly' });
            Fauna.bee(q, { x: 520, y: 470, s: 3, line: true, pose: 'feed' });
            Fauna.ladybird(q, { x: 760, y: 470, s: 3, line: true, rot: -0.5 });
            Fauna.snail(q, { x: 1000, y: 470, s: 3, line: true, trail: 26 });
        } else if (page === 1) {
            ground(GREEN);
            leaf(1, 60, 150, 0.1, 1.5, 'sun');
            leaf(2, 380, 60, 0.5, 1.4, 'mid');
            leaf(3, 80, 480, -0.2, 2.2, 'mid');
            leaf(4, 620, 470, 0.3, 2.2, 'sun');
            q.fillStyle = '#e9c230';
            q.fillRect(1180, 40, 380, 380);
            ALL(false, 20);
            Fauna.drop(q, { x: 1260, y: 120, r: 8 });
            Fauna.drop(q, { x: 1320, y: 130, r: 16 });
            Fauna.drop(q, { x: 1420, y: 150, r: 34 });
            Fauna.drops(q, { box: { x: 1200, y: 220, w: 340, h: 180 }, n: 14, seed: 'yellow' });
            Fauna.drop(q, { x: 130, y: 160, r: 8 });
            Fauna.drop(q, { x: 180, y: 172, r: 5 });
            Fauna.drops(q, { box: { x: 80, y: 380, w: 420, h: 200 }, n: 12, seed: 'leaf', rMax: 12 });
            Fauna.bee(q, { x: 760, y: 600, s: 3, line: false, pose: 'fly' });
            Fauna.ladybird(q, { x: 950, y: 560, s: 3, line: false, rot: 0.4 });
            Fauna.snail(q, { x: 1150, y: 600, s: 3, line: false });
            Fauna.web(q, { x: 30, y: 870, r: 170, a0: -Math.PI / 2, a1: 0, seed: 'leafcorner' });
            leaf(5, 1180, 520, 0.2, 1.6, 'mid');
            Fauna.lizard(q, { x: 1370, y: 560, line: false, rot: 0.2 });
            Fauna.gecko(q, { x: 1480, y: 760, line: false, flip: true });
            Fauna.butterfly(q, { x: 1300, y: 720, line: false, rot: -1 });
            twig(1000, 863, 1140, 863, 5);
            Fauna.goldfinch(q, { x: 1070, y: 820, line: false });
        } else if (page === 4) {
            ground(NIGHT);
            Fauna.lizard(q, { x: 480, y: 250, s: 3, line: true, tear: true });
            Fauna.gecko(q, { x: 1250, y: 260, s: 3, line: true });
            Fauna.lizard(q, { x: 420, y: 680, s: 3, line: true, pose: 1, rot: 0.3 });
            Fauna.gecko(q, { x: 1200, y: 690, s: 3, line: true, pose: 1, flip: true });
        } else if (page === 5) {
            ground(GREEN);
            leaf(3, 80, 250, -0.1, 3.4, 'mid');
            leaf(4, 760, 620, 0.2, 3.2, 'sun');
            Fauna.lizard(q, { x: 480, y: 250, s: 3, line: false });
            Fauna.gecko(q, { x: 1250, y: 260, s: 3, line: false });
            Fauna.lizard(q, { x: 420, y: 680, s: 3, line: false, pose: 1, rot: 0.3 });
            Fauna.gecko(q, { x: 1200, y: 690, s: 3, line: false, pose: 1, flip: true });
        } else if (page === 6) {
            ground(NIGHT);
            Fauna.lizard(q, { x: 700, y: 300, s: 5, line: true, tear: true });
            Fauna.gecko(q, { x: 760, y: 700, s: 5, line: true });
        } else if (page === 7 || page === 8) {
            const line = page === 7;
            ground(line ? NIGHT : GREEN);
            if (!line) leaf(3, 60, 250, -0.1, 3.2, 'mid');
            Fauna.butterfly(q, { x: 260, y: 230, s: 3, line, rot: -Math.PI / 2, fold: 0 });
            Fauna.butterfly(q, { x: 640, y: 230, s: 3, line, rot: -1.1, fold: 0.25 });
            Fauna.butterfly(q, { x: 980, y: 230, s: 3, line, rot: -0.5, fold: 0.6 });
            Fauna.butterfly(q, { x: 1330, y: 260, s: 3, line, fold: 1 });
            twig(160, 808, 620, 800, 13);
            Fauna.goldfinch(q, { x: 380, y: 680, s: 3, line });
            twig(780, 808, 1200, 800, 13);
            Fauna.goldfinch(q, { x: 960, y: 680, s: 3, line, pose: 1 });
            twig(1260, 780, 1580, 840, 13);
            Fauna.goldfinch(q, { x: 1420, y: 680, s: 3, line, flip: true, look: 'ahead', perch: [1260, 780, 1580, 840] });
        } else if (page === 9) {
            ground(NIGHT);
            Fauna.butterfly(q, { x: 420, y: 430, s: 7, line: true, rot: -1.2, fold: 0.2 });
            twig(880, 760, 1560, 750, 20);
            Fauna.goldfinch(q, { x: 1200, y: 548, s: 5, line: true });
        } else if (page === 10 || page === 11) {
            // every creature turned and mirrored: does the light stay at the top left? and its marks:
            // feet (gold), mouth (rose), and the box it covers
            const line = page === 10;
            ground(line ? NIGHT : GREEN);
            const show = (kind, o) => {
                Fauna[kind](q, o);
                const b = Fauna.box(q, kind, o), m = Fauna.marks(q, kind, o);
                q.strokeStyle = 'rgba(217,164,65,0.35)';
                q.lineWidth = 0.6;
                q.strokeRect(b.x, b.y, b.w, b.h);
                const dot = (p, c) => {
                    q.fillStyle = c;
                    q.beginPath();
                    q.arc(p[0], p[1], 2.2, 0, 7);
                    q.fill();
                };
                for (const p of m.feet ?? []) dot(p, '#f6dc8a');
                if (m.mouth) dot(m.mouth, '#ff7a9a');
                dot([o.x, o.y], '#7fe0ff');
            };
            const rots = [0, 0.8, -1.2, 2.4];
            rots.forEach((rot, i) => {
                const x = 140 + i * 180, flip = i === 3;
                show('bee', { x, y: 80, s: 1.6, rot, flip, line });
                show('bee', { x, y: 220, s: 1.6, rot, flip, line, pose: 'feed' });
                show('ladybird', { x, y: 330, s: 3, rot, flip, line });
                show('snail', { x, y: 450, s: 1.6, rot: rot * 0.3, flip, line });
                show('butterfly', { x, y: 620, s: 1.3, rot, flip, line });
                show('butterfly', { x, y: 800, s: 1.3, rot: rot * 0.3, flip, line, fold: 1 });
                show('lizard', { x: 960 + (i % 2) * 330, y: 110 + Math.floor(i / 2) * 200, s: 1.2, rot, flip, line, pose: i % 2 });
                show('gecko', { x: 960 + (i % 2) * 330, y: 500 + Math.floor(i / 2) * 150, s: 1.3, rot, flip, line, pose: i % 2 });
                twig(840 + i * 190, 866 + i * 4, 980 + i * 190, 858 + i * 6, 5);
                show('goldfinch', { x: 910 + i * 190, y: 820, s: 1, rot: 0, flip: i > 1, line, pose: i % 2, perch: [840 + i * 190, 866 + i * 4, 980 + i * 190, 858 + i * 6] });
            });
            if (page === 10 && !env.state.logged) {
                env.state.logged = true;
                const r1 = (v) => Math.round(v * 10) / 10, out = {};
                for (const [kind, o] of [['bee', {}], ['bee', { pose: 'feed' }], ['ladybird', {}], ['snail', {}], ['snail', { trail: 20 }], ['butterfly', { fold: 0 }], ['butterfly', {}], ['butterfly', { fold: 1 }], ['lizard', {}], ['lizard', { pose: 1 }], ['gecko', {}], ['gecko', { pose: 1 }], ['goldfinch', {}], ['goldfinch', { pose: 1 }], ['goldfinch', { look: 'ahead' }]]) {
                    const b = Fauna.box(q, kind, { x: 0, y: 0, ...o }), m = Fauna.marks(q, kind, { x: 0, y: 0, ...o });
                    const mm = {};
                    for (const [k2, v] of Object.entries(m)) mm[k2] = Array.isArray(v[0]) ? v.map((p) => p.map(r1)) : v.map(r1);
                    out[kind + JSON.stringify(o)] = { box: [r1(b.x), r1(b.y), r1(b.x + b.w), r1(b.y + b.h)], ...mm };
                }
                console.warn('FAUNA-MARKS ' + JSON.stringify(out));
            }
        } else if (page === 2) {
            ground(NIGHT);
            Fauna.bee(q, { x: 330, y: 300, s: 5, line: true, pose: 'fly' });
            Fauna.bee(q, { x: 900, y: 300, s: 5, line: true, pose: 'feed' });
            Fauna.ladybird(q, { x: 1350, y: 250, s: 5, line: true, rot: -0.5 });
            Fauna.snail(q, { x: 420, y: 700, s: 5, line: true, trail: 20 });
            Fauna.ladybird(q, { x: 1350, y: 650, s: 8, line: true, rot: 0.9, flip: true });
        } else {
            ground(GREEN);
            Fauna.bee(q, { x: 330, y: 300, s: 5, line: false, pose: 'fly' });
            Fauna.bee(q, { x: 900, y: 300, s: 5, line: false, pose: 'feed' });
            Fauna.ladybird(q, { x: 1350, y: 250, s: 5, line: false, rot: -0.5 });
            Fauna.snail(q, { x: 420, y: 700, s: 5, line: false, trail: 20 });
        }
        S.tooth(q, { x: 0, y: 0, w: 1600, h: 900 });
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.drawImage(L, 0, 0);
        g.restore();
        label('fauna · page ' + page, 14, 890);
    },
});
