// Interchangeable backdrops for the felt cats. Each backdrop paints the set in 2D (logical
// 900×1600) and says how the set lights the wool: the key's direction and colour, the fill
// colour, and how dark the caught floor shadow is. The camera is shared (Stage.CAM) so a set
// can put things on the floor in perspective with Stage.project([x, y, z]).
//
//   Backdrops.list                    names
//   Backdrops.get(name) → { paint(g, t, env), light: { light, keyCol, fillCol, key, fill,
//                           shadow }, front?(g, t, env) }   front paints over the cats
const Stage = (() => {
    // a level camera at the kittens' head height (measured: the horizon sits at mid-frame
    // and the feet at 0.71 of the height, the cats 0.26 of it)
    const CAM = { cam: [0, 0.8, 6], target: [0, 0.8, 0], fov: 0.62 };
    const F = 0.5 / Math.tan(CAM.fov / 2) * 1600;
    const project = ([x, y, z]) => {
        const dz = CAM.cam[2] - z;
        return [450 + (x / dz) * F, 800 - ((y - CAM.cam[1]) / dz) * F, F / dz];
    };
    return { CAM, project, HORIZON: 800 };
})();

const Backdrops = (() => {
    // felt pieces in 2D: a shape filled, speckled with fibres of two shades, and a fuzzy rim
    // of short stray strokes; cached (the sets are still)
    function felt(g, path, col, o = {}) {
        const r = Motion.rng(o.seed ?? 'felt');
        g.save();
        g.fillStyle = col;
        g.fill(path);
        g.clip(path);
        const [x0, y0, x1, y1] = o.box ?? [0, 0, 900, 1600];
        const n = Math.round((x1 - x0) * (y1 - y0) * (o.density ?? 0.05));
        for (let i = 0; i < n; i++) {
            const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), a = r() * Math.PI, l = 3 + r() * 7;
            g.strokeStyle = r() < 0.5 ? (o.light ?? 'rgba(255,255,255,0.10)') : (o.dark ?? 'rgba(0,0,0,0.10)');
            g.lineWidth = 0.7 + r() * 0.6;
            g.beginPath();
            g.moveTo(x, y);
            g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + (r() - 0.5) * 3, y + Math.sin(a) * l * 0.5 + (r() - 0.5) * 3, x + Math.cos(a) * l, y + Math.sin(a) * l);
            g.stroke();
        }
        // soft shading towards the bottom of each piece: felt pieces are pillowy
        if (o.shade !== false) {
            const gr = g.createLinearGradient(0, y0, 0, y1);
            gr.addColorStop(0, 'rgba(255,255,255,0.06)');
            gr.addColorStop(1, 'rgba(0,0,0,0.14)');
            g.fillStyle = gr;
            g.fillRect(x0, y0, x1 - x0, y1 - y0);
        }
        g.restore();
        // stray fibres over the edge
        if (o.pts) {
            g.save();
            g.strokeStyle = col;
            g.globalAlpha = 0.7;
            const P = o.pts;
            for (let i = 0; i < P.length; i++) {
                const [ax, ay] = P[i], [bx, by] = P[(i + 1) % P.length];
                const len = Math.hypot(bx - ax, by - ay), k = Math.ceil(len / 3);
                for (let j = 0; j < k; j++) {
                    const u = j / k, x = ax + (bx - ax) * u, y = ay + (by - ay) * u;
                    const a = Math.atan2(by - ay, bx - ax) - Math.PI / 2 + (r() - 0.5) * 1.6, l = 2 + r() * 5;
                    g.lineWidth = 0.6 + r() * 0.5;
                    g.beginPath();
                    g.moveTo(x - Math.cos(a) * 1.5, y - Math.sin(a) * 1.5);
                    g.quadraticCurveTo(x + Math.cos(a) * l * 0.6 + (r() - 0.5) * 3, y + Math.sin(a) * l * 0.6 + (r() - 0.5) * 3, x + Math.cos(a) * l, y + Math.sin(a) * l);
                    g.stroke();
                }
            }
            g.restore();
        }
    }
    // a closed wobbly outline through points (hand-cut felt), as a Path2D and its samples
    function blob(pts, seed, wob = 3) {
        const r = Motion.rng(seed), out = [];
        for (let i = 0; i < pts.length; i++) {
            const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
            const k = Math.max(2, Math.ceil(Math.hypot(bx - ax, by - ay) / 14));
            for (let j = 0; j < k; j++) {
                const u = j / k;
                out.push([ax + (bx - ax) * u + (r() - 0.5) * wob, ay + (by - ay) * u + (r() - 0.5) * wob]);
            }
        }
        const p = new Path2D();
        out.forEach(([x, y], i) => {
            const [nx, ny] = out[(i + 1) % out.length];
            if (i === 0) p.moveTo((x + nx) / 2, (y + ny) / 2);
            else p.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2);
        });
        const [x, y] = out[0], [nx, ny] = out[1];
        p.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2);
        p.closePath();
        return { path: p, pts: out };
    }
    const ellipsePts = (cx, cy, rx, ry, n = 28) => Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * 2 * Math.PI) * rx, cy + Math.sin((i / n) * 2 * Math.PI) * ry]);
    const cached = {};
    function still(env, name, fn) {
        if (!cached[name]) {
            const c = document.createElement('canvas');
            c.width = env.px[0];
            c.height = env.px[1];
            const g = c.getContext('2d');
            g.scale(env.px[0] / 900, env.px[1] / 1600);
            fn(g);
            cached[name] = c;
        }
        return cached[name];
    }
    const paste = (g, img) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(img, 0, 0); g.restore(); };

    // ── desert: a felt diorama of the old west at golden hour ──────────────────────────
    function cactus(g, x, y, s, seed) {
        const col = '#5f8a4a';
        const parts = [
            [[x - 16 * s, y], [x - 18 * s, y - 150 * s], [x - 8 * s, y - 175 * s], [x + 8 * s, y - 175 * s], [x + 18 * s, y - 150 * s], [x + 16 * s, y]],
            [[x - 14 * s, y - 70 * s], [x - 55 * s, y - 72 * s], [x - 62 * s, y - 120 * s], [x - 48 * s, y - 128 * s], [x - 40 * s, y - 92 * s], [x - 14 * s, y - 92 * s]],
            [[x + 14 * s, y - 95 * s], [x + 50 * s, y - 97 * s], [x + 56 * s, y - 140 * s], [x + 42 * s, y - 146 * s], [x + 36 * s, y - 115 * s], [x + 14 * s, y - 117 * s]],
        ];
        parts.forEach((p, i) => {
            const b = blob(p, seed + i, 2.5 * s);
            felt(g, b.path, col, { seed: seed + 'f' + i, pts: b.pts, box: [x - 70 * s, y - 180 * s, x + 70 * s, y], density: 0.08 });
        });
        // ribs: stitched lines
        g.save();
        g.strokeStyle = 'rgba(40,70,35,0.55)';
        g.lineWidth = 1.3 * s;
        g.setLineDash([5 * s, 4 * s]);
        for (const dx of [-7, 0, 7]) {
            g.beginPath();
            g.moveTo(x + dx * s, y - 5 * s);
            g.lineTo(x + dx * 1.1 * s, y - 165 * s);
            g.stroke();
        }
        g.restore();
    }
    const desert = {
        light: { light: [-0.7, 0.55, 0.6], keyCol: [1.0, 0.82, 0.62], fillCol: [0.62, 0.62, 0.78], key: 2.2, fill: 0.7, shadow: 0.6 },
        paint(g, t, env) {
            paste(g, still(env, 'desert', (g) => {
                const sky = g.createLinearGradient(0, 0, 0, 800);
                sky.addColorStop(0, '#f2b58a');
                sky.addColorStop(0.55, '#f6d3a3');
                sky.addColorStop(1, '#f7e2bf');
                g.fillStyle = sky;
                g.fillRect(0, 0, 900, 820);
                // the sun: a felt disc with a paler ring
                const sun = blob(ellipsePts(640, 470, 95, 95, 36), 'sun', 2);
                felt(g, sun.path, '#f9e8b0', { seed: 'sunf', pts: sun.pts, box: [540, 370, 740, 570] });
                // clouds: long felt strips
                for (const [cx, cy, w, sd] of [[220, 330, 190, 'c1'], [700, 250, 150, 'c2'], [480, 560, 120, 'c3']]) {
                    const c = blob([[cx - w, cy + 10], [cx - w * 0.6, cy - 16], [cx, cy - 22], [cx + w * 0.7, cy - 12], [cx + w, cy + 10]], sd, 3);
                    felt(g, c.path, '#fbeede', { seed: sd + 'f', pts: c.pts, box: [cx - w, cy - 25, cx + w, cy + 12] });
                }
                // mesas: two ranges, far (lilac) and near (rust)
                const far = blob([[0, 820], [0, 640], [90, 630], [120, 600], [300, 598], [330, 640], [520, 646], [560, 610], [700, 606], [735, 650], [900, 655], [900, 820]], 'mesa1', 3);
                felt(g, far.path, '#c79a9a', { seed: 'm1', pts: far.pts, box: [0, 590, 900, 820] });
                const near = blob([[0, 820], [0, 700], [150, 700], [185, 660], [360, 662], [400, 712], [640, 716], [690, 684], [820, 684], [860, 722], [900, 724], [900, 820]], 'mesa2', 3);
                felt(g, near.path, '#c46f4c', { seed: 'm2', pts: near.pts, box: [0, 650, 900, 820] });
                // the sand: a felt ground in perspective with little stitched dunes
                const sand = g.createLinearGradient(0, 780, 0, 1600);
                sand.addColorStop(0, '#e6b77f');
                sand.addColorStop(1, '#d99e62');
                const ground = blob([[-20, 790], [920, 790], [920, 1620], [-20, 1620]], 'sand', 2);
                felt(g, ground.path, '#e3b27a', { seed: 'sandf', box: [0, 780, 900, 1600], density: 0.03, shade: false });
                g.fillStyle = sand;
                g.globalAlpha = 0.5;
                g.fill(ground.path);
                g.globalAlpha = 1;
                g.strokeStyle = 'rgba(160,100,55,0.35)';
                g.lineWidth = 2;
                g.setLineDash([7, 6]);
                for (const [x, y, w] of [[120, 900, 140], [620, 880, 170], [300, 1330, 220], [700, 1420, 160], [80, 1500, 150]]) {
                    g.beginPath();
                    g.ellipse(x, y, w, w * 0.09, 0, Math.PI * 1.05, Math.PI * 1.95);
                    g.stroke();
                }
                g.setLineDash([]);
                cactus(g, 110, 1010, 1.25, 'cA');
                cactus(g, 790, 930, 0.8, 'cB');
                cactus(g, 560, 790, 0.35, 'cC');
                // pebbles
                for (const [x, y, rr, sd] of [[250, 1250, 16, 'p1'], [280, 1262, 9, 'p2'], [760, 1300, 13, 'p3'], [610, 1480, 20, 'p4']]) {
                    const p = blob(ellipsePts(x, y, rr, rr * 0.6, 14), sd, 1.5);
                    felt(g, p.path, '#a58a74', { seed: sd + 'f', pts: p.pts, box: [x - rr, y - rr, x + rr, y + rr] });
                }
            }));
            // a tumbleweed rolling across in the far ground: a ring of loose brown yarn
            const u = ((t / 7) % 1), x = -80 + u * 1060, y = 860 - Math.abs(Math.sin(t * 5)) * 18, a = t * 4;
            g.save();
            g.translate(x, y);
            g.rotate(a);
            g.strokeStyle = 'rgba(140,100,60,0.85)';
            g.lineWidth = 1.6;
            const r = Motion.rng('weed');
            for (let i = 0; i < 26; i++) {
                const a0 = r() * 6.28, a1 = a0 + 1 + r() * 2, rr = 14 + r() * 10;
                g.beginPath();
                g.ellipse(0, 0, rr, rr * (0.6 + r() * 0.4), r() * 3, a0, a1);
                g.stroke();
            }
            g.restore();
        },
    };

    // ── kitchen: the cats dance on a wooden table by a sunny window ──────────────────
    const kitchen = {
        light: { light: [-0.8, 0.5, 0.45], keyCol: [1.0, 0.97, 0.9], fillCol: [0.72, 0.78, 0.86], key: 2.0, fill: 0.8, shadow: 0.55 },
        paint(g, t, env) {
            paste(g, still(env, 'kitchen', (g) => {
                // wall: tiles
                g.fillStyle = '#e9efe9';
                g.fillRect(0, 0, 900, 900);
                g.strokeStyle = 'rgba(120,140,130,0.35)';
                g.lineWidth = 2;
                for (let y = 40; y < 900; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(900, y); g.stroke(); }
                for (let y = 40, row = 0; y < 900; y += 64, row++) for (let x = (row % 2) * 32; x < 900; x += 64) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 64); g.stroke(); }
                // window with light
                g.fillStyle = '#bcd9ea';
                g.fillRect(70, 140, 330, 420);
                const sky = g.createLinearGradient(0, 140, 0, 560);
                sky.addColorStop(0, '#a9d2ef');
                sky.addColorStop(1, '#e5f2f6');
                g.fillStyle = sky;
                g.fillRect(84, 154, 302, 392);
                g.fillStyle = '#9cc58a';
                g.beginPath();
                g.ellipse(160, 560, 150, 70, 0, Math.PI, 0);
                g.ellipse(330, 560, 120, 55, 0, Math.PI, 0);
                g.fill();
                g.fillStyle = '#f7f4ee';
                g.fillRect(226, 150, 18, 400);
                g.fillRect(80, 340, 312, 16);
                g.strokeStyle = '#f7f4ee';
                g.lineWidth = 16;
                g.strokeRect(70, 140, 330, 420);
                // shelf with jars
                g.fillStyle = '#b98758';
                g.fillRect(500, 360, 360, 18);
                for (const [x, w, h, c] of [[520, 60, 90, '#e9b94f'], [600, 50, 70, '#c4533f'], [680, 70, 110, '#7aa56a'], [780, 46, 60, '#f2e3c6']]) {
                    g.fillStyle = 'rgba(255,255,255,0.55)';
                    g.fillRect(x, 360 - h, w, h);
                    g.fillStyle = c;
                    g.fillRect(x + 5, 360 - h * 0.75, w - 10, h * 0.75 - 4);
                    g.fillStyle = '#8b6a4a';
                    g.fillRect(x - 2, 360 - h - 10, w + 4, 12);
                }
                // table: wood planks in perspective from the horizon down
                const top = 860;
                const wood = g.createLinearGradient(0, top, 0, 1600);
                wood.addColorStop(0, '#c89464');
                wood.addColorStop(1, '#a8703f');
                g.fillStyle = wood;
                g.fillRect(0, top, 900, 740);
                g.fillStyle = '#8a5a33';
                g.fillRect(0, top - 14, 900, 16);
                const vp = [450, 800];
                g.strokeStyle = 'rgba(90,55,25,0.45)';
                g.lineWidth = 2.5;
                for (let i = -8; i <= 8; i++) {
                    const xb = 450 + i * 190;
                    const k = (top - vp[1]) / (1600 - vp[1]);
                    g.beginPath();
                    g.moveTo(vp[0] + (xb - vp[0]) * k, top);
                    g.lineTo(xb, 1600);
                    g.stroke();
                }
                const r = Motion.rng('grain');
                g.strokeStyle = 'rgba(110,65,30,0.18)';
                g.lineWidth = 1.2;
                for (let i = 0; i < 160; i++) {
                    const y = top + r() ** 1.6 * 740, x = r() * 900, l = 40 + r() * 120 * (y / 900);
                    g.beginPath();
                    g.moveTo(x, y);
                    g.bezierCurveTo(x + l * 0.3, y + 3, x + l * 0.6, y - 3, x + l, y + 1);
                    g.stroke();
                }
                // window light on the table
                g.fillStyle = 'rgba(255,245,210,0.18)';
                g.beginPath();
                g.moveTo(160, top);
                g.lineTo(520, top);
                g.lineTo(900, 1600);
                g.lineTo(250, 1600);
                g.fill();
                // a felt cup and a spoon at the back
                const cup = blob([[610, 930], [700, 930], [694, 1010], [616, 1010]], 'cup', 2);
                felt(g, cup.path, '#e7735a', { seed: 'cupf', pts: cup.pts, box: [600, 920, 710, 1015] });
                g.strokeStyle = '#e7735a';
                g.lineWidth = 9;
                g.beginPath();
                g.ellipse(706, 965, 16, 22, 0, -1.4, 1.4);
                g.stroke();
            }));
        },
    };

    // ── disco: a dark stage, a lit dance floor, coloured spots on the beat ─────────────
    const disco = {
        light: { light: [0.5, 0.75, 0.6], keyCol: [1.0, 0.55, 0.85], fillCol: [0.35, 0.55, 1.0], key: 2.0, fill: 0.9, shadow: 0.7 },
        paint(g, t, env) {
            const beat = Math.floor(t * 123 / 60);
            g.fillStyle = '#140d22';
            g.fillRect(0, 0, 900, 1600);
            // back curtain folds
            for (let i = 0; i < 12; i++) {
                const x = i * 80;
                const gr = g.createLinearGradient(x, 0, x + 80, 0);
                gr.addColorStop(0, 'rgba(90,20,70,0.0)');
                gr.addColorStop(0.5, 'rgba(120,30,90,0.35)');
                gr.addColorStop(1, 'rgba(90,20,70,0.0)');
                g.fillStyle = gr;
                g.fillRect(x, 0, 80, 820);
            }
            // floor tiles in perspective, some lit per beat
            const vp = [450, 800], top = 820, P = Stage.project;
            for (let iz = 0; iz < 9; iz++) for (let ix = -6; ix < 6; ix++) {
                const z0 = 1.5 - iz * 0.5, z1 = z0 - 0.5, x0 = ix * 0.5, x1 = x0 + 0.5;
                const q = [P([x0, 0, z0]), P([x1, 0, z0]), P([x1, 0, z1]), P([x0, 0, z1])];
                const lit = Motion.rng('tile' + ix + '_' + iz + '_' + beat)() < 0.3;
                const hue = ['#ff4fa8', '#4fc3ff', '#ffd84f', '#8a5cff'][(ix + iz + beat + 20) % 4];
                g.fillStyle = lit ? hue : '#2a2140';
                g.globalAlpha = lit ? 0.85 : 1;
                g.beginPath();
                q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
                g.closePath();
                g.fill();
                g.globalAlpha = 1;
                g.strokeStyle = '#0c0816';
                g.lineWidth = 3;
                g.stroke();
            }
            // spot beams
            for (let i = 0; i < 3; i++) {
                const a = Math.sin(t * 1.3 + i * 2.1) * 0.35, x0 = 150 + i * 300;
                const gr = g.createLinearGradient(x0, 0, x0, 1200);
                const c = ['255,80,170', '80,200,255', '255,220,90'][i];
                gr.addColorStop(0, `rgba(${c},0.5)`);
                gr.addColorStop(1, `rgba(${c},0)`);
                g.fillStyle = gr;
                g.beginPath();
                g.moveTo(x0 - 10, 0);
                g.lineTo(x0 + 10, 0);
                g.lineTo(x0 + 1200 * Math.sin(a) + 160, 1250);
                g.lineTo(x0 + 1200 * Math.sin(a) - 160, 1250);
                g.fill();
            }
            // mirror ball
            const bx = 450, by = 150, R = 80;
            g.save();
            g.beginPath();
            g.arc(bx, by, R, 0, Math.PI * 2);
            g.clip();
            g.fillStyle = '#6f6f86';
            g.fillRect(bx - R, by - R, 2 * R, 2 * R);
            for (let j = -8; j <= 8; j++) for (let i = -8; i <= 8; i++) {
                const v = Motion.rng('mb' + i + '_' + j + '_' + (Math.floor(t * 8) % 5))();
                g.fillStyle = `rgba(${200 + v * 55},${200 + v * 55},${230 + v * 25},${0.3 + v * 0.7})`;
                g.fillRect(bx + i * 10 + 1, by + j * 10 + 1, 8, 8);
            }
            g.restore();
            g.strokeStyle = '#999';
            g.lineWidth = 2;
            g.beginPath();
            g.moveTo(bx, 0);
            g.lineTo(bx, by - R);
            g.stroke();
        },
    };
    const sets = { desert, kitchen, disco };
    return { list: Object.keys(sets), get: (n) => sets[n] };
})();
