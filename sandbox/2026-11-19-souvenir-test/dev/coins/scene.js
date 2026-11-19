// Dev sheet for things/coins.js: the thirteen coins of the string. One page per second:
//   0      at film size (r = 32): a row on the indigo ground, a row on a warm ivory strip,
//          the string on a sagging path of 700 units, and a string under a ribbon's edge
//   1      all thirteen at 3×, each in the box Coins.box promises for it
//   2–4    at 6× (five, five, three)
//   5, 6   the string at 3×, its left and its right half
//   7      page 0 with the board's tooth and the lens finish
//   8      all thirteen at 3× on ivory and on spruce
//   9      painted on a transparent sheet first, as a layer of the film is (casts fall
//          only on paint), then laid on the night
// Pages 0–6 and 8–9 are raw paint.
const SV = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 24, duration: 10, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', SV + 'things/coins.js'],
    draw(g, t, env) {
        const S = Souvenir, K = Coins.KINDS, page = Math.floor(t + 1e-6);
        const night = () => {
            g.fillStyle = '#232749';
            g.fillRect(0, 0, 1600, 900);
        };
        const label = (txt, x, y, col = 'rgba(255,255,255,0.45)') => {
            g.fillStyle = col;
            g.font = '12px monospace';
            g.textAlign = 'center';
            g.fillText(txt, x, y);
        };
        const sag = (x0, x1, y, drop, n = 80) => {
            const pts = [];
            for (let i = 0; i <= n; i++) {
                const u = i / n;
                pts.push([x0 + (x1 - x0) * u, y + drop * (1 - Math.pow(2 * u - 1, 2))]);
            }
            return pts;
        };
        const film = (q) => {
            // a strip of the ribbon's ivory
            q.fillStyle = '#eadfc4';
            q.fillRect(0, 196, 1600, 112);
            K.forEach((kind, i) => {
                Coins.coin(q, { x: 100 + i * 116.6, y: 104, kind });
                Coins.coin(q, { x: 100 + i * 116.6, y: 252, kind, pierced: true, rot: (i % 3 - 1) * 0.12 });
            });
            Coins.string(q, { path: sag(450, 1150, 372, 42), seed: 'dev' });
            // as it will hang: from the lower edge of a ribbon, across the night and a guitar
            q.fillStyle = '#e2b469';
            q.beginPath();
            q.ellipse(800, 1010, 330, 300, 0, 0, 7);
            q.fill();
            const edge = sag(390, 1210, 640, 34);
            q.fillStyle = '#f4efe4';
            q.beginPath();
            q.moveTo(390, 560);
            for (const p of edge) q.lineTo(p[0], p[1]);
            q.lineTo(1210, 560);
            q.fill();
            Coins.string(q, { path: edge, seed: 'ribbon' });
        };
        if (page === 0 || page === 7) {
            night();
            film(g);
            K.forEach((kind, i) => label(kind, 100 + i * 116.6, 168));
            if (page === 7) S.tooth(g, { x: 0, y: 0, w: 1600, h: 900 });
        } else if (page === 1 || page === 8) {
            night();
            if (page === 8) {
                g.fillStyle = '#eadfc4';
                g.fillRect(0, 0, 1600, 450);
                g.fillStyle = '#e2b469';
                g.fillRect(0, 450, 1600, 450);
            }
            K.forEach((kind, i) => {
                const row = i < 7 ? 0 : 1, col = row ? i - 7 : i, n = row ? 6 : 7;
                const x = 800 + (col - (n - 1) / 2) * 222, y = 232 + row * 440;
                if (page === 1) {
                    // the box the kit promises for it
                    const b = Coins.box(kind, 96);
                    g.strokeStyle = 'rgba(255,255,255,0.18)';
                    g.lineWidth = 0.6;
                    g.strokeRect(x + b.x, y + b.y, b.w, b.h);
                }
                Coins.coin(g, { x, y, r: 96, kind, pierced: page === 8 });
                label(kind, x, y + 150, page === 8 ? 'rgba(40,30,60,0.7)' : undefined);
            });
        } else if (page >= 2 && page <= 4) {
            night();
            const set = [K.slice(0, 5), K.slice(5, 10), K.slice(10)][page - 2];
            const pos = set.length === 5 ? [[290, 235], [800, 235], [1310, 235], [545, 665], [1055, 665]] : [[330, 250], [330, 680], [1090, 450]];
            set.forEach((kind, i) => {
                Coins.coin(g, { x: pos[i][0], y: pos[i][1], r: 192, kind, pierced: kind === 'nasrid' });
                label(kind, pos[i][0] + (set.length === 5 ? 0 : 300), pos[i][1] + (set.length === 5 ? 222 : 0));
            });
        } else if (page === 5 || page === 6) {
            night();
            g.save();
            g.translate(800, 450);
            g.scale(3, 3);
            g.translate(page === 5 ? -625 : -975, -440);
            Coins.string(g, { path: sag(450, 1150, 372, 42), seed: 'dev' });
            g.restore();
        } else {
            night();
            const sheet = Motion.layer(env, 'coins-sheet', (q) => {
                K.forEach((kind, i) => Coins.coin(q, { x: 100 + i * 116.6, y: 104, kind }));
                Coins.string(q, { path: sag(450, 1150, 250, 42), seed: 'dev' });
                q.save();
                q.translate(800, 640);
                q.scale(2, 2);
                Coins.string(q, { path: sag(-350, 350, -60, 30), seed: 'dev', kinds: K.slice().reverse() });
                q.restore();
            });
            Motion.drawLayer(g, env, sheet);
        }
    },
    post(ctx, t, env) {
        if (Math.floor(t + 1e-6) === 7) Souvenir.finish(ctx, env, 0);
    },
});
