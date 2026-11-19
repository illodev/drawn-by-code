// Picture 2 · The lemon tree («un huerto claro donde madura el limonero», Machado), in the
// brush manner: no contour line, fruit and leaves modelled with light, blossom on top.
// Tableau.lemons(z) → the layers of the picture, its main plane at depth z.
window.Tableau = window.Tableau || {};
Tableau.lemons = (z0) => {
    const S = Souvenir, C = Citrus;
    const SHADE = 'rgba(6,20,10,0.62)';
    // paste a sprite and, first, its shadow on whatever paint is under it
    const paste = (g, sp, x, y, s, o = {}) => {
        if (o.shadow !== false) S.cast(g, (q) => C.put(q, sp, x, y, s, o), { blur: (o.soft ?? 13) * s, dx: 6 * s, dy: 10 * s, color: o.shade ?? SHADE });
        C.put(g, sp, x, y, s, o);
    };
    const R = (res, s) => Math.max(1.5, Math.ceil(res * s)); // sprite resolution for a paste scale

    // A shoot: a twig along `path`, leaves alternating along it, lemons hanging from it,
    // blossom at its tip. What is listed `front` is pasted over the fruit.
    //   leaves: how many, or [[u, side, scale, variant, front, kind], …]
    //   lemons: [[u, scale, rot, variant], …]   flowers: [[dx, dy, scale, variant, rot, fy], …] about the tip
    function shoot(g, res, o) {
        const r = Motion.rng('shoot' + o.seed);
        const line = S.curve(o.path, false, 16), n = line.length;
        const at = (u) => {
            const f = S.clamp(u) * (n - 1), i = Math.min(n - 2, Math.floor(f)), k = f - i;
            const p = line[i], q = line[i + 1];
            return { x: p[0] + (q[0] - p[0]) * k, y: p[1] + (q[1] - p[1]) * k, a: Math.atan2(q[1] - p[1], q[0] - p[0]) };
        };
        let leaves = o.leaves ?? 7;
        if (typeof leaves === 'number') {
            const m = leaves;
            leaves = [];
            for (let i = 0; i < m; i++) leaves.push([0.1 + (i / m) * 0.92, i % 2 ? 1 : -1, (o.leaf ?? 1.2) * (1.08 - 0.3 * (i / m)) * (0.8 + r() * 0.4), Math.floor(r() * 10), r() < 0.4, r() < 0.42 ? 'sun' : r() < 0.82 ? 'mid' : 'deep']);
        }
        const leafAt = ([u, side, s, v, , kind]) => {
            // every leaf at its own attitude: turned about its stalk, tipped towards or away
            const p = at(u), a = p.a + side * (0.45 + r() * 0.8);
            paste(g, C.leaf(v, a, R(res, s), o.kind ?? kind), p.x, p.y, s, { fy: 0.42 + r() * 0.58, fx: 0.62 + r() * 0.38 });
        };
        for (const l of leaves) if (!l[4]) leafAt(l);
        S.cast(g, (q) => S.put(q, C.twig(o.seed, o.path, o.w ?? 15, 6, R(res, 1))), { blur: 8, dx: 4, dy: 7, color: SHADE });
        S.put(g, C.twig(o.seed, o.path, o.w ?? 15, 6, R(res, 1)));
        for (const [u, s, rot, v] of o.lemons ?? []) {
            const p = at(u), sp = C.lemon(v, rot, R(res, s));
            const top = -(C.lemonShape(v)[0][1] - 15) * s; // from the stalk's end to the centre
            paste(g, sp, p.x - Math.sin(sp.rot) * top, p.y + Math.cos(sp.rot) * top, s, { soft: 18 });
        }
        for (const l of leaves) if (l[4]) leafAt(l);
        const tip = at(1);
        for (const [dx, dy, fs, fv, fr, fy] of o.flowers ?? []) {
            // a pedicel from the tip to the flower
            g.strokeStyle = '#6d8a3c';
            g.lineWidth = 3.2;
            g.lineCap = 'round';
            g.beginPath();
            g.moveTo(tip.x, tip.y);
            g.quadraticCurveTo(tip.x + dx * 0.2, tip.y + dy * 0.7, tip.x + dx, tip.y + dy);
            g.stroke();
            if (fv < 0) paste(g, C.bud(-fv, fr ?? 0, R(res, fs)), tip.x + dx, tip.y + dy, fs, { shade: 'rgba(14,30,24,0.5)' });
            else paste(g, C.blossom(fv, fr ?? 0, R(res, fs)), tip.x + dx, tip.y + dy, fs, { fy: fy ?? 1, shade: 'rgba(14,30,24,0.55)', soft: 8 });
        }
    }

    // Leaves scattered over a region: the depth of the tree behind the fruit.
    function foliage(g, res, { seed, box, n, scale = [1, 1.6], kind = 'deep' }) {
        const r = Motion.rng(seed);
        for (let i = 0; i < n; i++) {
            const x = box.x + r() * box.w, y = box.y + r() * box.h, a = r() * Math.PI * 2, s = scale[0] + r() * (scale[1] - scale[0]);
            paste(g, C.leaf(Math.floor(r() * 10), a, R(res, s), r() < 0.3 ? 'deep' : kind), x, y, s, { fy: 0.55 + r() * 0.45 });
        }
    }

    const plate = { x: -1500, y: -850, w: 3000, h: 1700 };
    const wide = { x: -1300, y: -740, w: 2600, h: 1480 };

    return [
        {
            // the dark of the tree: leaves in shade, a few holes of light
            id: 'lemons-plate', z: z0 + 420, box: plate,
            paint(g, res) {
                g.fillStyle = '#16301f';
                g.fillRect(plate.x, plate.y, plate.w, plate.h);
                foliage(g, res * 0.6, { seed: 'plate', box: plate, n: 130, scale: [1.5, 2.6], kind: 'mid' });
                // what is deep in the tree is closer in tone and cooler, but it is still a
                // bright orchard: the air between is green light, not darkness
                g.fillStyle = 'rgba(30,70,46,0.5)';
                g.fillRect(plate.x, plate.y, plate.w, plate.h);
                const r = Motion.rng('plate-light');
                for (let i = 0; i < 30; i++) {
                    const x = plate.x + r() * plate.w, y = plate.y + r() * plate.h, rad = 80 + r() * 170;
                    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
                    gr.addColorStop(0, `rgba(170,205,110,${0.12 + r() * 0.16})`);
                    gr.addColorStop(1, 'rgba(170,205,110,0)');
                    g.fillStyle = gr;
                    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
                }
                for (let i = 0; i < 14; i++) {
                    const x = plate.x + r() * plate.w, y = plate.y + r() * plate.h, rad = 90 + r() * 160;
                    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
                    gr.addColorStop(0, `rgba(6,22,14,${0.3 + r() * 0.25})`);
                    gr.addColorStop(1, 'rgba(6,22,14,0)');
                    g.fillStyle = gr;
                    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
                }
            },
        },
        {
            id: 'lemons-far', z: z0 + 210, box: wide,
            paint(g, res) {
                foliage(g, res, { seed: 'far-fill', box: wide, n: 60, scale: [0.9, 1.4], kind: 'mid' });
                shoot(g, res, { seed: 'f1', path: [[-1300, -520], [-1000, -470], [-760, -500], [-560, -430]], leaves: 12, lemons: [[0.62, 1.3, 0.3, 2]], kind: 'mid' });
                shoot(g, res, { seed: 'f2', path: [[-200, -760], [-90, -560], [60, -420], [120, -300]], leaves: 11, lemons: [[0.8, 1.35, -0.2, 3]] });
                shoot(g, res, { seed: 'f3', path: [[1300, -200], [1080, -80], [900, -60], [760, 30]], leaves: 12, lemons: [[0.7, 1.3, 0.15, 1]], kind: 'mid' });
                shoot(g, res, { seed: 'f4', path: [[-700, 760], [-560, 520], [-420, 380], [-300, 240]], leaves: 12, lemons: [[0.9, 1.25, -0.4, 0]] });
                shoot(g, res, { seed: 'f5', path: [[420, 780], [380, 560], [300, 420], [330, 300]], leaves: 11, lemons: [[0.55, 1.3, 0.2, 2]], kind: 'mid' });
                shoot(g, res, { seed: 'f6', path: [[-60, 60], [80, 20], [200, 60], [320, 10]], leaves: 9, lemons: [[0.5, 1.25, -0.1, 1]] });
                // a step back in the air: cooler and closer in tone, on the paint only
                g.globalCompositeOperation = 'source-atop';
                g.fillStyle = 'rgba(40,92,60,0.26)';
                g.fillRect(wide.x, wide.y, wide.w, wide.h);
                g.globalCompositeOperation = 'source-over';
            },
        },
        {
            id: 'lemons-hero', z: z0, box: wide,
            paint(g, res) {
                foliage(g, res, { seed: 'hero-fill', box: { x: -1250, y: -700, w: 2500, h: 1400 }, n: 46, scale: [0.9, 1.3], kind: 'deep' });
                shoot(g, res, { seed: 'h1', path: [[-1320, -330], [-1000, -400], [-700, -360], [-430, -400]], leaves: 14, lemons: [[0.74, 1.55, 0.2, 0], [0.4, 1.35, -0.2, 3]], flowers: [[70, -30, 1.3, 0, 0.4], [40, 70, 1.1, 1, 1.2, 0.8], [110, 40, 1.3, -1, 0.5]] });
                shoot(g, res, { seed: 'h2', path: [[1340, -560], [1010, -500], [700, -420], [330, -470]], leaves: 14, lemons: [[0.72, 1.6, -0.15, 1]], flowers: [[-80, 30, 1.25, 2, 0], [-30, -70, 1.2, -2, -1.2]] });
                shoot(g, res, { seed: 'h3', path: [[-1340, 420], [-1050, 300], [-820, 180], [-560, 150]], leaves: 13, lemons: [[0.66, 1.45, 0.4, 2], [0.95, 1.3, -0.1, 1]] });
                shoot(g, res, { seed: 'h4', path: [[1320, 300], [1050, 160], [820, 60], [560, 90]], leaves: 13, lemons: [[0.7, 1.5, -0.35, 3]], flowers: [[-60, 80, 1.3, 3, 0.8], [-140, 30, 1.1, 4, 2, 0.75], [-20, 150, 1.2, -1, 1.4]] });
                shoot(g, res, { seed: 'h5', path: [[-260, 760], [-220, 520], [-130, 330], [-60, 190]], leaves: 13, lemons: [[0.78, 1.5, 0.1, 1]], flowers: [[90, -50, 1.2, 5, 1.6], [130, 30, 1.0, 6, 0.3, 0.8]] });
                shoot(g, res, { seed: 'h6', path: [[520, 780], [470, 560], [380, 420], [250, 330]], leaves: 12, lemons: [[0.7, 1.45, -0.3, 0]], flowers: [[-70, -40, 1.15, 7, 0.9]] });
                shoot(g, res, { seed: 'h7', path: [[140, -780], [100, -600], [20, -470], [-60, -330]], leaves: 12, lemons: [[0.85, 1.4, 0.15, 2]], flowers: [[60, 60, 1.2, 8, 0.2], [-50, 70, 1.0, -1, 2.2]] });
            },
        },
        {
            id: 'lemons-near', z: z0 - 330, box: wide,
            paint(g, res) {
                shoot(g, res, { seed: 'n1', path: [[-1320, -140], [-1080, -170], [-880, -120], [-700, -150]], leaves: 8, lemons: [[0.8, 1.2, 0.25, 3]], leaf: 1.1 });
                shoot(g, res, { seed: 'n2', path: [[1320, 420], [1100, 330], [880, 260], [700, 180]], leaves: 8, lemons: [[0.78, 1.15, -0.3, 0]], flowers: [[-70, -40, 1.0, 1, 0.5]], leaf: 1.1 });
            },
        },
    ];
};
