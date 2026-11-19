// A folding fan, in the emblem manner: carved sticks, a pleated silk leaf that takes the
// light fold by fold, a garland of carnations painted across the pleats, a lace edge.
// Open, it is a wing. Global: Fan.
//   Fan.draw(g, { x, y, r, a0, a1, n, seed })   pivot at (x, y), opening from a0 to a1 (rad)
const Fan = (() => {
    const S = Souvenir;
    const COL = {
        leaf: '#1f7350', leafLight: '#46a676', leafDeep: '#0b3a2f',
        stick: '#ecdcb4', stickShade: '#9c7745', gold: '#d9a441', goldLight: '#f6dc8a', goldDeep: '#8a5a17',
        lace: '#f4efe4', laceShade: '#8f8db0', red: '#cf3a3c', redDeep: '#7a1428', redLight: '#f39a8c', sprig: '#a5d48c',
    };
    const pol = (x, y, r, a) => [x + Math.cos(a) * r, y + Math.sin(a) * r];
    const arc = (x, y, r, a0, a1, n = 12) => {
        const out = [];
        for (let i = 0; i <= n; i++) out.push(pol(x, y, r, a0 + ((a1 - a0) * i) / n));
        return out;
    };
    // a ruffled disc: a tier of a carnation's petals seen from above, each petal a round
    // lobe with a pinked (notched) edge
    const ruff = (x, y, r, n, depth, ph) => {
        const pts = [], m = n * 14, sd = Math.round(ph * 100);
        for (let i = 0; i < m; i++) {
            const a = (i / m) * 6.2832, u = (i / m) * n, k = Math.floor(u), f = u - k;
            const lobe = Math.pow(Math.sin(f * Math.PI), 0.55);
            const size = 0.86 + 0.14 * S.hashI(k, n, 2, sd);
            const pink = 0.035 * (Math.sin(f * Math.PI * 7) > 0 ? 1 : -1) * lobe;
            pts.push(pol(x, y, r * size * (1 - depth + depth * lobe + pink), a + ph));
        }
        return pts;
    };
    function carnation(g, x, y, r, seed) {
        const ph = (S.seedOf(seed) % 100) / 16;
        const lw = Math.max(0.9, r * 0.055);
        S.piece(g, ruff(x, y, r, 9, 0.3, ph), { fill: COL.red, line: lw, cast: { blur: r * 0.3, dx: r * 0.08, dy: r * 0.12, color: 'rgba(6,20,30,0.5)' }, shade: { color: COL.redDeep, alpha: 0.9, w: r * 0.5 }, light: { color: COL.redLight, alpha: 0.5, w: r * 0.16 } });
        S.piece(g, ruff(x - r * 0.04, y - r * 0.05, r * 0.74, 7, 0.32, ph + 0.5), { fill: '#d94a47', line: lw * 0.8, ink: COL.redDeep, cast: { blur: r * 0.2, dx: r * 0.05, dy: r * 0.08, color: 'rgba(70,6,24,0.6)' }, shade: { color: COL.redDeep, alpha: 0.8, w: r * 0.34 }, light: { color: COL.redLight, alpha: 0.6, w: r * 0.12 } });
        S.piece(g, ruff(x - r * 0.08, y - r * 0.1, r * 0.46, 5, 0.34, ph + 1.1), { fill: '#e8665c', line: lw * 0.7, ink: COL.redDeep, cast: { blur: r * 0.14, dx: r * 0.04, dy: r * 0.06, color: 'rgba(70,6,24,0.6)' }, shade: { color: COL.red, alpha: 0.8, w: r * 0.2 }, light: { color: '#ffd0c0', alpha: 0.7, w: r * 0.08 } });
        S.piece(g, ruff(x - r * 0.1, y - r * 0.13, r * 0.2, 4, 0.36, ph + 1.7), { fill: COL.redLight, line: lw * 0.6, ink: COL.redDeep, shade: { color: COL.red, alpha: 0.8, w: r * 0.1 } });
    }
    function sprig(g, x, y, a, len, seed) {
        const rnd = Motion.rng('sprig' + seed);
        for (let i = 0; i < 3; i++) {
            const aa = a + (i - 1) * 0.62 + (rnd() - 0.5) * 0.3, l = len * (0.75 + rnd() * 0.5);
            const tip = pol(x, y, l, aa), c = pol(x, y, l * 0.45, aa), nx = -Math.sin(aa) * l * 0.16, ny = Math.cos(aa) * l * 0.16;
            S.piece(g, S.curve([[x, y], [c[0] + nx, c[1] + ny], tip, [c[0] - nx, c[1] - ny]], true, 6), { fill: COL.sprig, line: 1.1, ink: '#0a3024', shade: { color: '#12553a', alpha: 0.75, w: l * 0.18 } });
        }
    }

    function draw(g, o) {
        const { x, y, r = 600, a0, a1, n = 20, seed = 'fan' } = o;
        const dir = a1 > a0 ? 1 : -1, step = (a1 - a0) / n, half = step / 2;
        const rIn = r * 0.44, rOut = r * 0.95, rm = (rIn + rOut) / 2;
        // 1 · the sticks, far guard first: a carved blade with pierced work and a gold stud
        for (let i = 0; i <= n; i++) {
            const a = a0 + step * i, guard = i === 0 || i === n;
            const px = -Math.sin(a), py = Math.cos(a);
            const prof = guard ? [[-0.05, 0.02], [0.1, 0.026], [0.3, 0.034], [0.6, 0.036], [0.94, 0.03], [0.965, 0.012]] : [[-0.05, 0.012], [0.08, 0.016], [0.2, 0.027], [0.3, 0.019], [0.4, 0.027], [0.47, 0.027]];
            const L = prof.map(([u, w]) => { const c = pol(x, y, r * u, a); return [c[0] - px * w * r, c[1] - py * w * r]; });
            const Rr = prof.map(([u, w]) => { const c = pol(x, y, r * u, a); return [c[0] + px * w * r, c[1] + py * w * r]; });
            const b = pol(x, y, 0, a), t = pol(x, y, guard ? rOut : rIn, a);
            S.piece(g, [...L, ...Rr.reverse()], {
                fill: { from: b, to: t, stops: [[0, COL.stickShade], [0.25, COL.stick], [1, '#f8efd6']] }, line: 1.8,
                cast: { blur: 5, dx: 2, dy: 3.5, color: 'rgba(24,16,40,0.55)' },
                shade: { color: COL.stickShade, alpha: 0.75, w: r * 0.014 },
                light: { color: '#fffbe8', alpha: 0.7, w: r * 0.006 },
                detail: (q) => {
                    const hole = (u, rw, rl, col) => {
                        const c = pol(x, y, r * u, a);
                        q.fillStyle = col;
                        q.beginPath();
                        q.ellipse(c[0], c[1], rl * r, rw * r, a, 0, 6.3);
                        q.fill();
                    };
                    hole(0.2, 0.008, 0.02, '#33263c');
                    hole(0.3, 0.0055, 0.0055, COL.gold);
                    hole(0.4, 0.008, 0.02, '#33263c');
                    if (guard) for (let k = 0; k < 6; k++) hole(0.5 + k * 0.075, 0.009, 0.014, k % 2 ? COL.gold : '#33263c');
                },
            });
        }
        // 2 · the silk: every fold has a face in the light and one in shade
        for (let j = 0; j < n * 2; j++) {
            const u = a0 + half * j, v = u + half, lit = j % 2 === 0;
            g.fillStyle = (() => {
                const gr = g.createLinearGradient(...pol(x, y, rIn, (u + v) / 2), ...pol(x, y, rOut, (u + v) / 2));
                gr.addColorStop(0, lit ? '#17624a' : COL.leafDeep);
                gr.addColorStop(0.5, lit ? COL.leafLight : COL.leaf);
                gr.addColorStop(1, lit ? '#3d9a6c' : '#175a44');
                return gr;
            })();
            g.beginPath();
            S.trace(g, [...arc(x, y, rIn, u, v, 4), ...arc(x, y, rOut, v, u, 5)]);
            g.fill();
            g.lineWidth = 0.8;
            g.strokeStyle = g.fillStyle;
            g.stroke();
        }
        // 3 · what is painted on the silk runs across the folds: gold bands and a garland
        g.save();
        g.beginPath();
        S.trace(g, [...arc(x, y, rIn, a0, a1, 40), ...arc(x, y, rOut, a1, a0, 40)]);
        g.clip();
        for (const [rr, w, c] of [[rIn + r * 0.028, r * 0.008, COL.goldDeep], [rIn + r * 0.028, r * 0.005, COL.gold], [rIn + r * 0.045, r * 0.002, COL.goldLight], [rOut - r * 0.03, r * 0.008, COL.goldDeep], [rOut - r * 0.03, r * 0.005, COL.gold], [rOut - r * 0.047, r * 0.002, COL.goldLight]]) {
            g.strokeStyle = c;
            g.lineWidth = w;
            g.beginPath();
            S.trace(g, arc(x, y, rr, a0, a1, 60), false);
            g.stroke();
        }
        // a vine through the middle of the band, flowers and sprigs along it
        const m = Math.max(3, Math.round(Math.abs(a1 - a0) / 0.2));
        const vine = [];
        for (let k = 0; k <= m * 6; k++) {
            const a = a0 + (k / (m * 6)) * (a1 - a0);
            vine.push(pol(x, y, rm + Math.sin((k / 6) * Math.PI) * r * 0.05, a));
        }
        S.ink(g, vine, { w: r * 0.008, color: '#0a3024', taper: [0, 0] });
        S.ink(g, vine, { w: r * 0.004, color: COL.sprig, taper: [0, 0] });
        const rnd = Motion.rng(seed);
        for (let k = 0; k < m; k++) {
            const a = a0 + ((k + 0.5) / m) * (a1 - a0), up = k % 2 ? 1 : -1;
            const c = pol(x, y, rm + up * r * 0.05, a);
            sprig(g, c[0], c[1], a + dir * 1.57 + 0.25, r * 0.085, seed + k);
            sprig(g, c[0], c[1], a - dir * 1.57 - 0.2, r * 0.08, seed + k + 'b');
            const bud = pol(x, y, rm - up * r * 0.07, a + (0.5 / m) * (a1 - a0));
            carnation(g, bud[0], bud[1], r * 0.022, seed + k + 'c');
            carnation(g, c[0], c[1], r * (0.046 + rnd() * 0.012), seed + k);
        }
        // the folds carry the paint with them: dark in each valley, a light on each crest
        for (let j = 0; j < n * 2; j++) {
            const u = a0 + half * j, v = u + half;
            const valley = j % 2 === 0 ? v : u, crest = j % 2 === 0 ? u : v;
            const gr = g.createLinearGradient(...pol(x, y, rm, valley), ...pol(x, y, rm, crest));
            gr.addColorStop(0, j % 2 ? 'rgba(4,16,34,0.62)' : 'rgba(4,16,34,0.4)');
            gr.addColorStop(0.55, j % 2 ? 'rgba(4,16,34,0.3)' : 'rgba(4,16,34,0)');
            gr.addColorStop(0.8, 'rgba(255,255,235,0)');
            gr.addColorStop(1, j % 2 ? 'rgba(255,255,235,0.05)' : 'rgba(255,255,235,0.22)');
            g.fillStyle = gr;
            g.beginPath();
            S.trace(g, [...arc(x, y, rIn, u, v, 4), ...arc(x, y, rOut, v, u, 5)]);
            g.fill();
        }
        // the sticks throw a shade onto the silk's inner edge
        const sg = g.createRadialGradient(x, y, rIn, x, y, rIn + r * 0.12);
        sg.addColorStop(0, 'rgba(6,14,30,0.55)');
        sg.addColorStop(1, 'rgba(6,14,30,0)');
        g.fillStyle = sg;
        g.fillRect(x - r, y - r, r * 2, r * 2);
        g.restore();
        // 4 · fold lines in ink, heavier on the valleys
        for (let j = 0; j <= n * 2; j++) {
            const a = a0 + half * j;
            S.ink(g, [pol(x, y, rIn, a), pol(x, y, rOut + r * 0.004, a)], { w: j % 2 ? r * 0.004 : r * 0.0026, taper: [0.3, 0.1] });
        }
        // 5 · the lace: a band, then a scallop with three eyelets on every fold
        for (let j = 0; j < n * 2; j++) {
            const u = a0 + half * j, v = u + half, am = (u + v) / 2, rs = (Math.abs(half) * rOut) / 2;
            const c = pol(x, y, rOut + r * 0.012, am);
            const sc = [];
            for (let k = 0; k <= 12; k++) {
                const t = (k / 12) * Math.PI, aa = am + (Math.cos(Math.PI - t) * half) / 2;
                sc.push(pol(x, y, rOut + r * 0.012 + Math.sin(t) * rs * 1.25, aa));
            }
            S.piece(g, [pol(x, y, rOut - r * 0.004, u), ...sc, pol(x, y, rOut - r * 0.004, v)], {
                fill: j % 2 ? '#d9d6e2' : COL.lace, line: r * 0.0028,
                shade: { color: COL.laceShade, alpha: 0.75, w: r * 0.012 },
                detail: (q) => {
                    q.fillStyle = 'rgba(30,34,78,0.6)';
                    for (const [da, dr] of [[-0.24, 0.3], [0.24, 0.3], [0, 0.72]]) {
                        const e = pol(x, y, rOut + r * 0.012 + rs * 1.25 * dr, am + da * half);
                        q.beginPath();
                        q.arc(e[0], e[1], rs * 0.15, 0, 6.3);
                        q.fill();
                    }
                    q.strokeStyle = 'rgba(30,34,78,0.4)';
                    q.lineWidth = r * 0.0016;
                    q.beginPath();
                    S.trace(q, arc(x, y, rOut + r * 0.008, u, v, 4), false);
                    q.stroke();
                },
            });
            void c;
        }
        g.strokeStyle = S.INK;
        g.lineWidth = r * 0.004;
        g.beginPath();
        S.trace(g, arc(x, y, rIn, a0, a1, 60), false);
        g.stroke();
        // 6 · the rivet
        S.piece(g, S.ellipse(x, y, r * 0.02, r * 0.02, 20), { fill: COL.gold, line: 1.8, cast: { blur: 4, dx: 2, dy: 3, color: 'rgba(24,16,40,0.6)' }, shade: { color: COL.goldDeep, alpha: 0.9, w: r * 0.012 }, light: { color: '#fff3c0', alpha: 0.95, w: r * 0.007 } });
    }
    return { draw, carnation, COL };
})();
