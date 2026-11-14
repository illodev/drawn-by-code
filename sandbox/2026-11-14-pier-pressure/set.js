// pier-pressure · the set: Gull Harbor, a cold-water fishing and surf town under the genre's
// flat yellow sky, seen from low on its stone quay in crooked wide-angle perspective.
//
//   Harbor.back(g, env, t)   paints the whole 1600×900 frame, opaque
//   Harbor.fore(g, env, t)   the props that stand in front of the cast (transparent elsewhere)
//   Harbor.GROUND            the feet line (770); Harbor.AT: the other coordinates a shot needs
//
// Depth order, back to front: sky · headland, town, lighthouse · sea · harbour wall, crane,
// trawlers · the pier · the quay and its slipway · [the tall palm, swaying] · Dot's chip hut and
// what stands round it · [bunting, flags, gulls] · — the cast — · bollard, cone, pots, rope.
// Static parts are cached once (Motion.sprite); what moves is drawn on twos.
(() => {
    const T = SkateToon, C = T.COL;
    const W = 1600, H = 900, GROUND = 770;
    const BG = T.LINE_BG, MID = 1.9, FAR = 1.7, TICK = T.LINE_FINE;
    const VP = [800, 560]; // where the quay's joints run to

    // the town's own colours, in the family of SkateToon.COL
    const P = {
        quay: '#b9b2c6', coping: '#d9d4e1', ramp: '#a29bb4', wet: '#7d9c8d', iron: '#4f5b6c', ironLight: '#76849a',
        hill: '#a3c26e', hillDeep: '#7fa64f', cliff: '#d9b77c', rock: '#8f93a6', wall: '#a7a1b6', wallTop: '#cdc8d6',
        slate: '#5f7388', tile: '#d0603a', cream: '#fff3d6', coral: '#f26b5b', fish: '#1cc0bb', fishDeep: '#17a3a0',
        hut: '#84ccbc', hutSide: '#69b5a5', hutDeep: '#4f9a8c', inside: '#22495a', navy: '#1c4f8f', boot: '#c8372d',
        deck: '#cdb260', woodFar: '#9a8233', under: '#665002', rope: '#e8cf8a', net: '#3f9a7a', netPale: '#a8d6b4',
        spar: '#f3dc9a', lilac: '#c3b0dd', pink: '#f7a8bb', paleBlue: '#9cc3e4', chalk: '#2f3a3c', sack: '#d8b47a',
    };

    // --- helpers ---------------------------------------------------------------------------
    const K = (pts) => pts.map(([x, y]) => [x, y, 1]);
    const mix = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    const ln = (g, pts, o = {}) => T.line(g, pts, { w: BG, ...o });
    const sh = (g, pts, o = {}) => T.shape(g, pts, { w: BG, ...o });
    const poly = (g, pts, o = {}) => T.shape(g, K(pts), { w: BG, ...o });
    const slab = (g, q, o = {}) => T.slab(g, q, { w: BG, ...o });
    const disc = (g, x, y, rx, ry = rx, o = {}) => T.shape(g, T.ellipse(x, y, rx, ry, o.rot ?? 0, o.n ?? 12), { w: BG, ...o });
    const dot = (g, x, y, r, col = C.ink) => {
        g.fillStyle = col;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
    };
    // a point of a quad [tl, tr, br, bl]
    const at = (q, u, v) => mix(mix(q[0], q[1], u), mix(q[3], q[2], u), v);
    // a straight bar from a to b, wa wide at a and wb at b, ruled like every slab
    const bar = (g, a, b, wa, wb, o = {}) => {
        const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / d, ny = (b[0] - a[0]) / d;
        const q = [[a[0] + (nx * wa) / 2, a[1] + (ny * wa) / 2], [b[0] + (nx * wb) / 2, b[1] + (ny * wb) / 2], [b[0] - (nx * wb) / 2, b[1] - (ny * wb) / 2], [a[0] - (nx * wa) / 2, a[1] - (ny * wa) / 2]];
        T.slab(g, q, { w: BG, over: 0.7, ...o });
        return q;
    };
    // plank lines across a quad, from its top edge to its bottom edge (or side to side), some
    // stopping short, a few missing
    function planks(g, q, n, o = {}) {
        const { seed = 'pl', w = BG, skip = 0.1, across = false, color = C.ink } = o;
        const R = Motion.rng(seed);
        for (let i = 1; i < n; i++) {
            const u = (i + (R() - 0.5) * 0.3) / n, a0 = R(), a1 = R(), sk = R();
            if (sk < skip) continue;
            const v0 = a0 < 0.25 ? a0 * 0.8 : 0, v1 = a1 < 0.25 ? 1 - a1 * 0.8 : 1;
            const A = across ? at(q, v0, u) : at(q, u, v0), B = across ? at(q, v1, u) : at(q, u, v1);
            T.line(g, [A, B], { w, seed: seed + i, color });
        }
    }
    // a wave: a long, nearly level line with a few soft kinks
    function wave(g, x, y, len, o = {}) {
        const { seed = 'wv', w = BG, amp = 2, color = C.ink, slope = 0 } = o;
        const R = Motion.rng(seed), n = Math.max(2, Math.round(len / 15)), pts = [];
        for (let i = 0; i <= n; i++) pts.push([x + (len * i) / n, y + (slope * len * i) / n + (i % 2 ? -1 : 1) * amp * (0.3 + R() * 0.9) * (i === 0 || i === n ? 0.2 : 1)]);
        T.line(g, pts, { w, seed, color });
        if (R() < 0.3 && len > 24) T.line(g, [[x + len * 0.55, y + w * 2.6], [x + len * 0.72, y + w * 2.2 + amp], [x + len * 0.9, y + w * 2.8]], { w, seed: seed + 'b', color });
    }
    // waves scattered in a box [x, y, w, h], never crowding each other
    function waves(g, box, n, o) {
        const { seed, len, w = BG, amp = 2, slope = 0, keep = null } = o;
        const R = Motion.rng(seed), made = [];
        for (let tries = 0; tries < n * 24 && made.length < n; tries++) {
            const L = len[0] + R() * (len[1] - len[0]), x = box[0] + R() * Math.max(1, box[2] - L), y = box[1] + R() * box[3];
            if (made.some(([mx, my, mL]) => Math.abs(my - y) < w * 3.4 && x < mx + mL + 14 && mx < x + L + 14)) continue;
            if (keep && !keep(x, y, L)) continue;
            made.push([x, y, L]);
            wave(g, x, y, L, { seed: seed + made.length, w, amp, slope });
        }
    }
    // a rope: a band with the lay of its strands
    function rope(g, pts, d, o = {}) {
        const { fill = P.rope, seed = 'rope', w = BG, dense = false } = o;
        const c = T.resample(dense ? pts : T.path(pts), d * 0.95);
        T.shape(g, T.ribbon(c, d, d, { dense: true }), { fill, w, seed, dense: true, amp: 0.15 });
        for (let i = 1; i < c.length - 1; i++) {
            const a = c[i - 1], b = c[i + 1], tl = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, tx = (b[0] - a[0]) / tl, ty = (b[1] - a[1]) / tl, h = d * 0.34;
            T.line(g, [[c[i][0] - ty * h - tx * h * 0.7, c[i][1] + tx * h - ty * h * 0.7], [c[i][0] + ty * h + tx * h * 0.7, c[i][1] - tx * h + ty * h * 0.7]], { w: w * 0.75, seed: seed + i, amp: 0, taper: false });
        }
    }
    // crossed lines clipped into a polygon: netting
    function netting(g, pts, step, o = {}) {
        const { w = FAR, seed = 'net', color = C.ink, dense = true } = o;
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const [x, y] of pts) {
            x0 = Math.min(x0, x);
            y0 = Math.min(y0, y);
            x1 = Math.max(x1, x);
            y1 = Math.max(y1, y);
        }
        g.save();
        g.clip(T.pathOf(dense ? pts : T.path(pts, true)));
        const h = y1 - y0;
        let i = 0;
        for (let x = x0 - h; x < x1 + h; x += step, i++) {
            T.line(g, [[x, y0], [x + h * 0.8, y1]], { w, seed: seed + 'a' + i, color, amp: 0.5 });
            T.line(g, [[x + h * 0.8, y0], [x, y1]], { w, seed: seed + 'b' + i, color, amp: 0.5 });
        }
        g.restore();
    }
    // loose lettering with no outline: chalk on a board, paint on a hull
    function chalk(g, str, x, y, size, o = {}) {
        const { color = C.white, rot = 0, seed = 'chalk', align = 'left', font = 'Bangers' } = o;
        const R = Motion.rng(seed);
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.font = `${size}px "${font}"`;
        g.textBaseline = 'alphabetic';
        g.textAlign = 'left';
        g.fillStyle = color;
        const ws = [...str].map((c) => g.measureText(c).width + size * 0.05);
        let cx = align === 'center' ? -ws.reduce((a, b) => a + b, 0) / 2 : 0;
        [...str].forEach((c, i) => {
            g.save();
            g.translate(cx, (R() - 0.5) * size * 0.1);
            g.rotate((R() - 0.5) * 0.12);
            g.fillText(c, 0, 0);
            g.restore();
            cx += ws[i];
        });
        g.restore();
    }
    // the hut's fish (the one on Dot's apron), nose to +x, about 2 units long, centred
    function fish(g, x, y, s, o = {}) {
        const { fill = P.fish, w = BG, seed = 'fish', rot = 0, flip = false } = o;
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(flip ? -s : s, s);
        const lw = w / s;
        T.shape(g, [[1, 0.02, 1], [0.62, -0.3], [0.1, -0.4], [-0.42, -0.2], [-0.62, -0.04, 1], [-1, -0.42, 1], [-0.88, 0.02], [-1, 0.44, 1], [-0.62, 0.1, 1], [-0.4, 0.24], [0.1, 0.4], [0.62, 0.3]], { fill, w: lw, seed });
        T.shape(g, [[0.3, -0.36, 1], [0.02, -0.62, 1], [-0.3, -0.3, 1]], { fill, w: lw, seed: seed + 'd' });
        T.line(g, [[0.5, -0.26], [0.4, 0], [0.5, 0.25]], { w: lw, seed: seed + 'g' });
        T.line(g, [[0.2, 0.1], [0, 0.22], [0.16, 0.3]], { w: lw, seed: seed + 'p' });
        for (const [fx, fy] of [[-0.1, -0.12], [-0.34, -0.02], [-0.1, 0.08]]) T.line(g, [[fx, fy - 0.07], [fx - 0.08, fy], [fx, fy + 0.07]], { w: lw * 0.9, seed: seed + 's' + fx });
        dot(g, 0.72, -0.08, 0.075, C.white);
        dot(g, 0.735, -0.08, 0.04, C.ink);
        T.line(g, [[0.86, 0.1], [0.74, 0.14]], { w: lw * 0.9, seed: seed + 'm' });
        g.restore();
    }

    // --- the far shore: headland, town, lighthouse --------------------------------------------
    function house(g, x, y, w, h, o) {
        const { fill, roof = P.slate, rh = 15, lean = 0, tilt = 0, seed, cols = 2, rows = 2, door = C.navy, chim = 0.72, lw = FAR, gable = false } = o;
        const tl = [x + lean, y - h], tr = [x + w + lean * 0.6, y - h + tilt], br = [x + w, y + 2], bl = [x, y + 2];
        const q = [tl, tr, br, bl];
        // the chimney stands behind the roof: a stack and two pots
        const cx = tl[0] + w * chim, cy = tl[1] - rh + tilt * chim;
        slab(g, [[cx - 4.5, cy - 9], [cx + 4.5, cy - 8.4], [cx + 4.8, cy + 6], [cx - 4.8, cy + 6]], { fill: P.cliff, w: lw, seed: seed + 'c', over: 1 });
        for (const k of [-2.2, 2.2]) slab(g, [[cx + k - 1.4, cy - 13.4], [cx + k + 1.4, cy - 13.4], [cx + k + 1.6, cy - 9], [cx + k - 1.6, cy - 9]], { fill: P.tile, w: lw, seed: seed + 'p' + k, over: 0.6 });
        if (gable) {
            // gable to the front: a wall with a point, a loft door and a hoist beam
            poly(g, [[tl[0] - 2, tl[1]], [mix(tl, tr, 0.5)[0], tl[1] - rh * 1.5], [tr[0] + 2, tr[1]], br, bl], { fill, w: lw, seed });
            ln(g, [[tl[0] - 4, tl[1] + 1], [mix(tl, tr, 0.5)[0], tl[1] - rh * 1.5 - 2], [tr[0] + 4, tr[1] + 1]].map((p) => [...p, 1]), { w: lw * 1.5, seed: seed + 'rf', color: roof });
            ln(g, [[tl[0] - 4, tl[1] + 1], [mix(tl, tr, 0.5)[0], tl[1] - rh * 1.5 - 2], [tr[0] + 4, tr[1] + 1]].map((p) => [...p, 1]), { w: lw * 0.6, seed: seed + 'rf', amp: 0 });
        } else {
            slab(g, [[tl[0] + w * 0.1, tl[1] - rh * 1.05], [tr[0] - w * 0.08, tr[1] - rh], [tr[0] + 3, tr[1] + 1], [tl[0] - 3, tl[1] + 1]], { fill: roof, w: lw, seed: seed + 'r', over: 1.2 });
            const R = Motion.rng(seed + 'rt');
            for (let i = 0; i < 3; i++) {
                const u = 0.15 + R() * 0.6, v = 0.3 + R() * 0.45;
                ln(g, [[tl[0] + w * u, tl[1] - rh * (1 - v)], [tl[0] + w * (u + 0.14), tl[1] - rh * (1 - v) + tilt * 0.14]], { w: lw, seed: seed + 'rt' + i });
            }
            slab(g, q, { fill, w: lw, seed, over: 1.2 });
        }
        // windows: panes with a cross bar and a gleam
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (r === rows - 1 && c === 0 && door) continue;
                const u0 = (c + 0.24) / cols, u1 = (c + 0.76) / cols, v0 = (r + 0.22) / (rows + 0.25), v1 = (r + 0.74) / (rows + 0.25);
                const wq = [at(q, u0, v0), at(q, u1, v0), at(q, u1, v1), at(q, u0, v1)];
                T.pane(g, wq, { w: lw, seed: seed + 'w' + r + c, gleams: 1 });
                slab(g, [[wq[3][0] - 1.5, wq[3][1]], [wq[2][0] + 1.5, wq[2][1]], [wq[2][0] + 1.5, wq[2][1] + 2.2], [wq[3][0] - 1.5, wq[3][1] + 2.2]], { fill: C.white, w: lw * 0.8, seed: seed + 'ws' + r + c, over: 0.4 });
            }
        }
        if (door) {
            const u0 = 0.2 / cols, u1 = 0.78 / cols, v0 = (rows - 1 + 0.2) / (rows + 0.25);
            slab(g, [at(q, u0, v0), at(q, u1, v0), at(q, u1, 1), at(q, u0, 1)], { fill: door, w: lw, seed: seed + 'd', over: 0.8, edges: [0, 1, 3] });
            dot(g, ...at(q, u1 - 0.06, v0 + (1 - v0) * 0.55), 1, C.roadLine);
        }
    }

    function pole(g, x, y0, y1, seed) {
        bar(g, [x, y1], [x + 1.5, y0], 3.4, 3, { fill: C.trunk, w: FAR, seed });
        ln(g, [[x - 8, y0 + 6.5], [x + 10, y0 + 5]], { w: FAR * 1.3, seed: seed + 'x' });
        ln(g, [[x - 5, y0 + 13], [x + 7, y0 + 12]], { w: FAR * 1.3, seed: seed + 'y' });
        for (const k of [-7, 9]) dot(g, x + k, y0 + 4, 1.5, C.teal);
    }

    function lighthouse(g) {
        const x = 1050, y = 532;
        // the keeper's cottage and its wall
        slab(g, [[982, 524], [1034, 526], [1034, 532], [982, 531]], { fill: C.white, w: FAR, seed: 'lh-wall', over: 1 });
        house(g, 996, 530, 34, 20, { fill: C.white, roof: P.tile, rh: 9, seed: 'lh-cot', cols: 2, rows: 1, door: P.coral, chim: 0.3, tilt: 1 });
        // the tower: bands of red and white, leaning a little out of the frame's centre
        const q = [[x - 10, y - 96], [x + 13, y - 95], [x + 17, y + 2], [x - 17, y + 2]];
        slab(g, q, {
            fill: C.white, w: FAR, seed: 'lh-tower',
            inside: (c) => {
                c.fillStyle = C.red;
                for (const [v0, v1] of [[0.08, 0.3], [0.52, 0.76]]) c.fill(T.pathOf([at(q, -0.2, v0), at(q, 1.2, v0 + 0.015), at(q, 1.2, v1 + 0.015), at(q, -0.2, v1)]));
            },
        });
        for (const v of [0.08, 0.3, 0.52, 0.76]) ln(g, [at(q, 0.02, v), at(q, 0.98, v + 0.015)], { w: FAR, seed: 'lh-b' + v });
        slab(g, [[x - 4.5, y - 13], [x + 4.5, y - 13], [x + 5, y + 2], [x - 5, y + 2]], { fill: C.navy, w: FAR, seed: 'lh-door', over: 0.6, edges: [0, 1, 3] });
        for (const [wx, wy] of [[x + 2, y - 40], [x - 1, y - 76]]) T.pane(g, [[wx - 3, wy - 5], [wx + 3, wy - 5], [wx + 3, wy + 4], [wx - 3, wy + 4]], { w: FAR, seed: 'lh-w' + wy, gleams: 1 });
        // the gallery and its rail, the lantern, the cap
        slab(g, [[x - 16, y - 100], [x + 19, y - 99], [x + 17, y - 94], [x - 14, y - 95]], { fill: P.slate, w: FAR, seed: 'lh-gal', over: 1 });
        for (let i = 0; i <= 5; i++) ln(g, [[x - 15 + i * 6.6, y - 100], [x - 15 + i * 6.6, y - 109]], { w: FAR * 0.95, seed: 'lh-gp' + i });
        ln(g, [[x - 17, y - 109], [x + 20, y - 108]], { w: FAR, seed: 'lh-gr' });
        const lq = [[x - 8, y - 121], [x + 11, y - 120.5], [x + 11, y - 100], [x - 8, y - 100]];
        T.pane(g, lq, { w: FAR, seed: 'lh-lamp', gleams: 2, fill: C.glass });
        for (const u of [0.34, 0.67]) ln(g, [at(lq, u, 0), at(lq, u, 1)], { w: FAR, seed: 'lh-lm' + u });
        sh(g, [[x - 11, y - 120, 1], [x - 6, y - 129], [x + 2, y - 132], [x + 10, y - 128], [x + 14, y - 119.5, 1]], { fill: C.red, w: FAR, seed: 'lh-cap' });
        disc(g, x + 2, y - 134.5, 2.4, 2.4, { fill: C.roadLine, w: FAR, seed: 'lh-ball', n: 8 });
        ln(g, [[x + 2, y - 137], [x + 2.6, y - 147]], { w: FAR, seed: 'lh-rod' });
    }

    function land(g) {
        // the headland falls from behind the hut to the point; hedges, grass, a cliff under the light
        sh(g, [[270, 562, 1], [270, 440], [420, 441], [560, 462], [700, 486], [820, 505], [940, 519], [1040, 528], [1094, 533], [1118, 553, 1]], { fill: P.hill, w: FAR, seed: 'hill' });
        sh(g, [[868, 554, 1], [892, 538], [950, 541], [1010, 545], [1066, 542], [1100, 541, 1], [1118, 553, 1]], { fill: P.cliff, w: FAR, seed: 'cliff' });
        T.ticks(g, [[880, 541], [1100, 544], [1108, 552], [878, 553]], { n: 9, dir: 1.4, spread: 0.3, len: [3, 6], w: FAR, seed: 'cliff-t', pair: 0.5 });
        ln(g, [[620, 500], [700, 506], [790, 522], [860, 524]], { w: FAR, seed: 'hedge-a' });
        ln(g, [[880, 512], [930, 530], [990, 534]], { w: FAR, seed: 'hedge-b' });
        T.ticks(g, [[600, 478], [1040, 530], [1030, 540], [600, 540]], { n: 14, dir: -1.1, spread: 0.3, len: [3, 6], w: FAR, seed: 'hill-t', pair: 0.7 });
        // telegraph poles on the skyline, their wires sagging from one to the next
        const poles = [[380, 368, 446], [618, 410, 476], [850, 462, 512]];
        for (const [i, [x, y0]] of poles.entries()) {
            const [nx, ny] = i ? poles[i - 1] : [250, 350];
            for (const k of [0, 6]) ln(g, [[nx + 1, ny + 5 + k], [(nx + x) / 2, (ny + y0) / 2 + 17 + k], [x, y0 + 5 + k]], { w: FAR * 0.95, seed: 'wire' + i + k, amp: 0.2 });
        }
        for (const [x, y0, y1] of poles) pole(g, x, y0, y1, 'pole' + x);
        ln(g, [[851, 468], [876, 512]], { w: FAR * 0.95, seed: 'stay' });
        // a palm or two up the hill: this coast is milder than it looks
        T.palm(g, 446, 446, 74, { w: FAR, lean: 9, fronds: 6, seed: 'palm-far-a' });
        // the upper terrace
        house(g, 356, 474, 38, 40, { fill: C.peach, seed: 'hu1', lean: -1, tilt: 1, rh: 12, door: C.maroon });
        house(g, 396, 476, 34, 46, { fill: P.paleBlue, roof: P.tile, seed: 'hu2', lean: 1, tilt: -1, rh: 12, chim: 0.3 });
        house(g, 478, 480, 36, 42, { fill: P.pink, seed: 'hu3', lean: -1, tilt: 1.5, rh: 12 });
        // the chapel: a gable with a bell-cote
        house(g, 520, 484, 30, 44, { fill: P.cream, roof: P.slate, seed: 'chapel', gable: true, rh: 12, cols: 1, rows: 2, door: C.maroon });
        slab(g, [[531, 414], [539, 414], [540, 424], [530, 424]], { fill: P.cream, w: FAR, seed: 'bell', over: 0.8 });
        dot(g, 535, 420, 1.8, C.roadLine);
        ln(g, [[535, 414], [535, 405]], { w: FAR, seed: 'cross-a' });
        ln(g, [[532, 408.5], [538, 408.5]], { w: FAR, seed: 'cross-b' });
        house(g, 592, 492, 36, 34, { fill: C.white, roof: P.tile, seed: 'hu5', tilt: 1, rh: 11, chim: 0.25 });
        T.palm(g, 666, 500, 66, { w: FAR, lean: -7, fronds: 6, seed: 'palm-far-b' });
        T.palm(g, 916, 524, 70, { w: FAR, lean: 8, fronds: 6, seed: 'palm-far-c' });
        // the lower terrace, down to the net loft at the end of the harbour wall
        const row = [
            [352, 50, 74, C.salmon, P.slate, C.navy], [404, 44, 62, P.cream, P.tile, P.fishDeep], [450, 52, 80, C.teal, P.slate, C.maroon], [504, 42, 60, C.peach, P.slate, C.navy],
            [548, 50, 72, P.lilac, P.tile, C.white], [600, 46, 56, C.white, P.slate, C.red], [648, 52, 66, P.paleBlue, P.slate, C.yellow], [702, 44, 52, P.pink, P.tile, C.navy],
        ];
        for (const [i, [x, w, h, fill, roof, door]] of row.entries()) house(g, x, 546, w, h, { fill, roof, door, seed: 'hl' + i, lean: (i % 3) - 1, tilt: ((i * 7) % 5) - 2, rh: 14 + (i % 2) * 3, chim: i % 2 ? 0.28 : 0.72, cols: w > 46 ? 3 : 2, rows: h > 64 ? 3 : 2 });
        house(g, 748, 548, 60, 46, { fill: P.cliff, roof: P.slate, seed: 'loft', gable: true, rh: 13, cols: 3, rows: 2, door: P.fishDeep });
        ln(g, [[778, 484], [796, 480]], { w: FAR * 1.4, seed: 'loft-beam' });
        ln(g, [[795, 480], [795, 492]], { w: FAR, seed: 'loft-hook' });
        lighthouse(g);
        // rocks off the point
        for (const [x, y, r, k] of [[1128, 553, 9, 'a'], [1146, 556, 6, 'b'], [1110, 556, 5, 'c']]) sh(g, [[x - r, y + 2, 1], [x - r * 0.6, y - r * 0.5], [x, y - r * 0.75], [x + r * 0.7, y - r * 0.3], [x + r, y + 2, 1]], { fill: P.rock, w: FAR, seed: 'rock' + k });
    }

    // --- the harbour: wall, crane, trawlers ---------------------------------------------------
    function harbourWall(g) {
        // top face, then the face of dressed stone with its weed line
        slab(g, [[330, 536], [826, 543], [846, 549], [330, 542]], { fill: P.wallTop, w: FAR, seed: 'hw-top', over: 1 });
        slab(g, [[330, 542], [846, 549], [846, 570], [330, 568]], { fill: P.wall, w: FAR, seed: 'hw-face', over: 1 });
        g.fillStyle = P.hillDeep;
        g.fill(T.pathOf([[330, 563], [846, 565.5], [846, 570], [330, 568]]));
        ln(g, [[330, 568], [846, 570]], { w: FAR, seed: 'hw-foot' });
        ln(g, [[340, 555], [520, 557], [700, 558], [846, 559.5]], { w: FAR, seed: 'hw-course' });
        const R = Motion.rng('hw-j');
        for (let x = 356; x < 840; x += 20 + R() * 14) {
            const up = R() < 0.5, y = 542 + ((x - 330) / 516) * 7;
            if (R() < 0.25) continue;
            ln(g, [[x, up ? y + 1 : y + 14], [x + 1, up ? y + 13 : y + 21]], { w: FAR * 0.95, seed: 'hw-j' + Math.round(x) });
        }
        // the rail along the top
        for (let x = 360; x < 826; x += 31) {
            const y = 536 + ((x - 330) / 496) * 7;
            ln(g, [[x, y], [x + 0.6, y - 12]], { w: FAR, seed: 'hw-p' + x });
        }
        ln(g, [[352, 524.5], [600, 528], [822, 531.5]], { w: FAR, seed: 'hw-r1' });
        ln(g, [[352, 530], [600, 533.5], [822, 537]], { w: FAR * 0.95, seed: 'hw-r2' });
        // steps down to the water, an iron ladder, tyres hung as fenders
        poly(g, [[866, 553], [846, 553], [846, 570], [880, 570], [880, 566], [873, 566], [873, 562], [866, 562], [866, 558], [859, 558], [859, 553]], { fill: P.wallTop, w: FAR, seed: 'hw-steps' });
        for (const x of [690, 696]) ln(g, [[x, 546], [x, 569]], { w: FAR * 0.95, seed: 'hw-lad' + x });
        for (let y = 551; y < 568; y += 4.5) ln(g, [[690, y], [696, y]], { w: FAR * 0.9, seed: 'hw-rung' + y, amp: 0 });
        for (const x of [574, 812]) {
            ln(g, [[x, 549], [x, 555]], { w: FAR * 0.9, seed: 'hw-ty' + x });
            disc(g, x, 559.5, 5, 5, { fill: C.ink, w: FAR, seed: 'hw-tyre' + x, n: 9 });
            dot(g, x, 559.5, 2, P.wall);
        }
        // the light at the end of the wall
        bar(g, [838, 546], [839, 520], 4.4, 3.6, { fill: C.white, w: FAR, seed: 'hw-light' });
        ln(g, [[836, 534], [841.5, 534]], { w: FAR * 1.6, seed: 'hw-band', color: C.green, amp: 0 });
        slab(g, [[834.5, 512], [843.5, 512], [843, 520], [835, 520]], { fill: C.lime, w: FAR, seed: 'hw-lamp', over: 0.6 });
        sh(g, [[833, 512, 1], [839, 506.5, 1], [845, 512, 1]], { fill: C.green, w: FAR, seed: 'hw-cap' });
    }

    function crane(g) {
        // a harbour crane: a pedestal, a cab, a lattice jib and its hook
        slab(g, [[534, 520], [556, 520.5], [558, 540], [532, 539.5]], { fill: P.iron, w: FAR, seed: 'cr-ped', over: 1 });
        const a = [552, 498], b = [622, 406];
        // stays from the mast to the jib
        bar(g, [541, 504], [538, 470], 4, 3, { fill: C.orange, w: FAR, seed: 'cr-mast' });
        ln(g, [[538, 471], b], { w: FAR * 0.95, seed: 'cr-stay1' });
        ln(g, [[538, 471], mix(a, b, 0.5)], { w: FAR * 0.95, seed: 'cr-stay2' });
        const q = bar(g, a, b, 12, 5, { fill: C.peach, w: FAR, seed: 'cr-jib' });
        for (let i = 0; i < 9; i++) {
            const u0 = i / 9, u1 = (i + 1) / 9;
            ln(g, [mix(q[0], q[1], u0), mix(q[3], q[2], u1)], { w: FAR * 0.95, seed: 'cr-l' + i, amp: 0.1 });
            ln(g, [mix(q[3], q[2], u0), mix(q[0], q[1], u1)], { w: FAR * 0.95, seed: 'cr-m' + i, amp: 0.1 });
        }
        disc(g, b[0], b[1], 3.6, 3.6, { fill: P.iron, w: FAR, seed: 'cr-sheave', n: 8 });
        ln(g, [[b[0] + 1, b[1] + 3], [b[0] + 2, 482]], { w: FAR * 0.95, seed: 'cr-cable' });
        slab(g, [[b[0] - 2, 482], [b[0] + 6, 482], [b[0] + 6, 490], [b[0] - 2, 490]], { fill: C.roadLine, w: FAR, seed: 'cr-block', over: 0.5 });
        ln(g, [[b[0] + 2, 490], [b[0] + 2.4, 495], [b[0] + 5.6, 498], [b[0] + 2.4, 501], [b[0] - 0.4, 498]], { w: FAR, seed: 'cr-hook' });
        // the cab: a box with a window and a flat hat
        slab(g, [[527, 496], [560, 495], [562, 521], [526, 521.5]], { fill: C.orange, w: FAR, seed: 'cr-cab', over: 1.2 });
        T.pane(g, [[542, 500], [557, 499.6], [557.6, 511], [542, 511.5]], { w: FAR, seed: 'cr-win', gleams: 1 });
        slab(g, [[523, 491.6], [564, 490.4], [564, 496], [523, 497]], { fill: P.iron, w: FAR, seed: 'cr-hat', over: 0.8 });
        ln(g, [[531, 503], [531.4, 517]], { w: FAR, seed: 'cr-door-a' });
        ln(g, [[537.6, 502.6], [538, 517]], { w: FAR, seed: 'cr-door-b' });
        // fish boxes stacked on the wall beside it
        for (const [x, y, c, k] of [[568, 530, C.blue, 0], [582, 530.4, C.orange, 1], [574, 522, C.yellow, 2], [502, 528, C.blue, 3], [506, 520, C.blue, 4]]) {
            slab(g, [[x, y], [x + 13, y + 0.2], [x + 12.6, y + 8.4], [x + 0.4, y + 8.2]], { fill: c, w: FAR, seed: 'cr-box' + k, over: 0.7 });
            ln(g, [[x + 3, y + 2.6], [x + 10, y + 2.8]], { w: FAR * 0.9, seed: 'cr-boxl' + k, amp: 0 });
        }
    }

    /**
     * A trawler, stern at x, waterline at y, bow to +x (flip: to −x), about 210 × 195 local units.
     * Drawn back to front: gallows, stack, wheelhouse, mast and gear, the net on deck, the hull,
     * then what hangs on the hull.
     */
    function trawler(g, x, y, s, o) {
        const { hull = P.navy, boot = P.boot, cabin = C.white, roof = C.orange, flip = false, seed = 'tr', reg = 'GH42', net = P.net, strake = C.white } = o;
        const w = FAR / s;
        const L = (pts, oo = {}) => T.line(g, pts, { w, seed: seed + (oo.k ?? ''), ...oo });
        const B = (a, b, wa, wb, oo) => bar(g, a, b, wa, wb, { w, ...oo });
        g.save();
        g.translate(x, y);
        g.scale(flip ? -s : s, s);
        // stern gallows
        B([2, -36], [9, -92], 4, 3.4, { fill: P.spar, seed: seed + 'ga' });
        B([19, -36], [12, -92], 4, 3.4, { fill: P.spar, seed: seed + 'gb' });
        disc(g, 10.5, -93, 3.6, 3.6, { fill: P.iron, w, seed: seed + 'gc', n: 8 });
        L([[10.5, -90], [10, -74]], { k: 'gl' });
        // the stack, the wheelhouse with its side, the roof and what sits on it
        slab(g, [[33, -104], [45, -103], [46, -80], [32, -80]], { fill: hull, w, seed: seed + 'st', over: 1, inside: (c) => { c.fillStyle = boot; c.fillRect(28, -99, 22, 6); } });
        L([[33, -99], [45, -98.5]], { k: 'st1', amp: 0 });
        L([[33, -93], [45, -92.5]], { k: 'st2', amp: 0 });
        slab(g, [[72, -75], [86, -70], [87, -30], [74, -30]], { fill: '#dcd8cc', w, seed: seed + 'ws', over: 1 });
        slab(g, [[25, -77], [72, -75], [74, -30], [24, -30]], { fill: cabin, w, seed: seed + 'wh', over: 1.2 });
        for (const [i, [a, b]] of [[30, 41], [44, 55], [58, 69]].entries()) T.pane(g, [[a, -71 + i * 0.4], [b, -70.6 + i * 0.4], [b, -57], [a, -57]], { w, seed: seed + 'win' + i, gleams: 1 });
        T.pane(g, [[76, -68], [83.4, -65.6], [83.6, -54], [76, -55]], { w, seed: seed + 'wins', gleams: 1 });
        disc(g, 34, -43, 6.4, 6.4, { fill: C.red, w, seed: seed + 'lr', n: 10 });
        dot(g, 34, -43, 2.8, cabin);
        L([[34, -49.4], [34, -46]], { k: 'lr1', color: C.white, amp: 0 });
        L([[34, -40], [34, -36.6]], { k: 'lr2', color: C.white, amp: 0 });
        slab(g, [[52, -52], [64, -51.6], [64, -30], [52, -30]], { fill: boot, w, seed: seed + 'door', over: 0.7, edges: [0, 1, 3] });
        dot(g, 58, -45, 2.3, C.glass);
        poly(g, [[20, -84], [78, -81], [91, -75], [89, -69.6], [76, -74.4], [21, -77]], { fill: roof, w, seed: seed + 'rf' });
        L([[50, -82], [50, -91]], { k: 'rd' });
        slab(g, [[41, -94.6], [60, -93.4], [60, -90], [41, -91]], { fill: C.white, w, seed: seed + 'radar', over: 0.6 });
        L([[66, -81], [68, -132]], { k: 'aer', w: w * 0.9 });
        disc(g, 26, -86.5, 3, 3, { fill: C.roadLine, w, seed: seed + 'lamp', n: 8 });
        // the mast, its crosstree and light, the derrick boom with a net hung to dry
        L([[131, -188], [205, -56]], { k: 'fst', w: w * 0.9 });
        L([[130, -186], [62, -81]], { k: 'bst', w: w * 0.9 });
        L([[130, -184], [11, -93]], { k: 'bst2', w: w * 0.9 });
        L([[130, -170], [108, -34]], { k: 'shr1', w: w * 0.9 });
        L([[131, -170], [152, -37]], { k: 'shr2', w: w * 0.9 });
        const np = [[147, -80, 1], [189, -121, 1], [186, -60], [170, -44], [150, -38, 1]];
        const nd = sh(g, np, { fill: P.netPale, w, seed: seed + 'nd' });
        netting(g, nd, 7.5, { w: w * 0.85, seed: seed + 'ndh' });
        L([[131, -190], [193, -125]], { k: 'top', w: w * 0.9 });
        B([129, -62], [193, -125], 5, 3.6, { fill: P.spar, seed: seed + 'boom' });
        B([128, -30], [131, -193], 6.4, 3.6, { fill: P.spar, seed: seed + 'mast' });
        B([119, -152], [142, -153], 3.2, 3.2, { fill: P.spar, seed: seed + 'ct' });
        disc(g, 131, -197, 3.2, 3.2, { fill: C.red, w, seed: seed + 'ml', n: 8 });
        L([[193, -124], [194, -106]], { k: 'hk' });
        disc(g, 194, -103, 3, 3, { fill: P.iron, w, seed: seed + 'blk', n: 8 });
        // on deck: a heap of net with its floats, a stack of boxes
        const heap = sh(g, [[78, -30, 1], [82, -45], [96, -53], [112, -46], [121, -30, 1]], { fill: net, w, seed: seed + 'heap' });
        netting(g, heap, 6.5, { w: w * 0.85, seed: seed + 'hh' });
        for (const [fx, fy] of [[84, -47], [99, -55], [113, -47]]) disc(g, fx, fy, 3.6, 3.6, { fill: C.orange, w, seed: seed + 'fl' + fx, n: 8 });
        // the hull: a sheer that lifts to the bow, a painted strake, the boot topping
        const strakePts = (dy) => [[-3, -40 + dy], [30, -35 + dy], [90, -32 + dy], [150, -37 + dy], [190, -46 + dy], [204, -53.5 + dy]];
        sh(g, [[-4, -40, 1], [30, -35], [90, -32], [150, -37], [190, -46], [207, -55, 1], [197, -26], [186, 2, 1], [100, 5], [10, 2, 1], [0, -18]], {
            fill: hull, w, seed: seed + 'hull',
            inside: (c) => {
                c.fillStyle = boot;
                c.fillRect(-10, -9, 230, 20);
                c.fillStyle = strake;
                c.fill(T.pathOf([...T.path(strakePts(6)), ...T.path(strakePts(11.5)).reverse()]));
            },
        });
        L([[5, -9], [100, -8.4], [190, -9]], { k: 'bt' });
        L(strakePts(6).slice(0, 5).concat([[202, -47]]), { k: 's1' });
        L(strakePts(11.5).slice(0, 5).concat([[200, -41.5]]), { k: 's2' });
        for (const sx of [44, 72, 118, 160]) L([[sx, -19], [sx + 6, -19]], { k: 'sc' + sx, w: w * 1.3, amp: 0 });
        // registration on the bow, never mirrored
        g.save();
        g.translate(flip ? 190 : 156, -13);
        g.scale(flip ? -1 : 1, 1);
        chalk(g, reg, 0, 0, 13, { seed: seed + 'reg', rot: flip ? 0.12 : -0.12 });
        g.restore();
        // fenders and a tyre over the side, the anchor at the hawse
        for (const [fx, c] of [[52, C.orange], [98, C.magenta]]) {
            L([[fx, -27], [fx, -19]], { k: 'fd' + fx });
            sh(g, T.ellipse(fx, -12, 5.6, 7.4, 0, 10), { fill: c, w, seed: seed + 'fen' + fx });
        }
        L([[138, -30], [138, -20]], { k: 'tyl' });
        disc(g, 138, -14, 6.6, 6.6, { fill: C.ink, w, seed: seed + 'tyre', n: 10 });
        dot(g, 138, -14, 2.8, hull);
        L([[192, -40], [192, -30], [188, -27], [196, -27]], { k: 'anc', w: w * 1.1 });
        // a lip of foam under the bow
        sh(g, [[170, 2], [186, -2], [200, 0], [214, 4], [198, 7], [180, 6]], { fill: C.foam, w, seed: seed + 'foam' });
        // the ensign staff at the stern
        L([[-2, -40], [-9, -80]], { k: 'staff', w: w * 1.1 });
        g.restore();
    }

    function smallBoat(g, x, y, s, o = {}) {
        const { hull = C.white, band = C.blue, seed = 'sb' } = o;
        const w = FAR / s;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        sh(g, [[-30, -12, 1], [-8, -9], [16, -10], [34, -16, 1], [26, 0, 1], [-24, 1, 1]], { fill: hull, w, seed, inside: (c) => { c.fillStyle = band; c.fill(T.pathOf([[-34, -14], [-8, -10], [16, -11], [38, -18], [38, -12], [16, -6], [-8, -5], [-34, -8]])); } });
        T.line(g, [[-28, -7.4], [-8, -4.8], [16, -5.8], [31, -11]], { w, seed: seed + 'l' });
        // an outboard cocked up at the stern, an oar, a thwart
        slab(g, [[-37, -24], [-29, -24], [-28, -11], [-35, -10]], { fill: P.iron, w, seed: seed + 'ob', over: 0.6 });
        T.line(g, [[-33, -10], [-37, 0]], { w, seed: seed + 'leg' });
        T.line(g, [[-10, -9], [22, -22]], { w: w * 1.2, seed: seed + 'oar' });
        sh(g, [[20, -24, 1], [29, -27], [31, -23, 1], [23, -20]], { fill: P.spar, w, seed: seed + 'blade' });
        g.restore();
    }

    function buoy(g, x, y, r, col, seed) {
        disc(g, x, y - r * 0.5, r, r * 0.92, { fill: col, w: FAR, seed, n: 10 });
        ln(g, [[x - r * 0.9, y - r * 0.5], [x, y - r * 0.2], [x + r * 0.9, y - r * 0.5]], { w: FAR * 0.95, seed: seed + 'b' });
        ln(g, [[x, y - r * 1.4], [x, y - r * 2]], { w: FAR, seed: seed + 's' });
        ln(g, [[x - r * 1.2, y + r * 0.5], [x - r * 0.3, y + r * 0.72], [x + r * 1.3, y + r * 0.5]], { w: FAR, seed: seed + 'w' });
    }

    function sea(g) {
        slab(g, [[-20, 546], [1620, 556], [1620, 920], [-20, 920]], { fill: C.sea, w: FAR, seed: 'sea', edges: [0] });
        // waves: short and thin at the horizon, long and loose near the quay
        waves(g, [300, 558, 1300, 14], 24, { seed: 'wv-a', len: [10, 26], w: FAR, amp: 0.9 });
        waves(g, [300, 574, 1300, 24], 38, { seed: 'wv-b', len: [18, 46], w: FAR, amp: 1.4 });
        waves(g, [300, 600, 1320, 46], 46, { seed: 'wv-c', len: [30, 90], w: MID, amp: 1.9 });
        waves(g, [1240, 650, 380, 110], 30, { seed: 'wv-d', len: [44, 130], w: BG, amp: 2.6, slope: 0.03 });
    }

    function harbour(g) {
        harbourWall(g);
        crane(g);
        // mooring lines from the quay's bollards to the big trawler
        ln(g, [[640, 634], [626, 600], [606, 570]], { w: FAR, seed: 'moor-a' });
        ln(g, [[905, 638], [860, 596], [806, 556]], { w: FAR, seed: 'moor-b' });
        trawler(g, 600, 607, 1, { seed: 'tr-a', hull: P.navy, roof: C.orange, reg: 'GH42' });
        trawler(g, 990, 586, 0.56, { seed: 'tr-b', hull: C.green, boot: '#7b1f2a', cabin: P.cream, roof: P.coral, flip: true, reg: 'GH7', net: C.orange, strake: C.roadLine });
        smallBoat(g, 712, 631, 1, { seed: 'sb-a' });
        buoy(g, 1126, 612, 6, C.orange, 'buoy-a');
        buoy(g, 566, 622, 6.5, C.magenta, 'buoy-b');
        buoy(g, 930, 624, 6, C.roadLine, 'buoy-c');
        // a channel marker out by the point
        bar(g, [1192, 600], [1193, 572], 3.4, 2.6, { fill: C.red, w: FAR, seed: 'mark' });
        sh(g, [[1187, 572, 1], [1193, 562, 1], [1199, 572, 1]], { fill: C.red, w: FAR, seed: 'mark-top' });
        sh(g, [[1182, 600], [1193, 596], [1204, 600], [1196, 604], [1186, 603]], { fill: C.foam, w: FAR, seed: 'mark-foam' });
    }

    // --- the pier -------------------------------------------------------------------------------
    // Everything along the pier runs to one point; s is how near (1 at the frame's right edge),
    // Y how far above (−) or below (+) the horizon at s = 1.
    const PV = [994, 559];
    const pp = (s, Y) => [PV[0] + 626 * s, PV[1] + s * Y];
    const PIER = { s0: 0.24, s1: 1.03, deck: -190, soffit: -146, back: -40, railTop: -318, railMid: -256, water: 131 };
    const BENTS = [0.905, 0.705, 0.55, 0.43, 0.335, 0.262];

    function lampPost(g, x, y, h, s, o = {}) {
        const { fill = '#3c5a78', seed = 'lamp', w = BG, side = -1, lean = 0 } = o;
        const top = [x + lean, y - h];
        // foot, shaft with its collars, a swan neck and a lantern hung from it
        sh(g, [[x - 9 * s, y, 1], [x - 7 * s, y - 10 * s], [x - 3.6 * s, y - 26 * s], [x + 3.6 * s, y - 26 * s], [x + 7 * s, y - 10 * s], [x + 9 * s, y, 1]], { fill, w, seed: seed + 'f' });
        bar(g, [x, y - 24 * s], top, 6.4 * s, 4.6 * s, { fill, w, seed: seed + 's' });
        for (const u of [0.12, 0.62]) {
            const c = mix([x, y - 24 * s], top, u);
            slab(g, [[c[0] - 5 * s, c[1] - 2.4 * s], [c[0] + 5 * s, c[1] - 2.4 * s], [c[0] + 5 * s, c[1] + 2.4 * s], [c[0] - 5 * s, c[1] + 2.4 * s]], { fill, w, seed: seed + 'c' + u, over: 0.5 });
        }
        const lx = top[0] + side * 30 * s, ly = top[1] + 12 * s;
        sh(g, T.ribbon([[top[0], top[1] + 4 * s], [top[0] + side * 2 * s, top[1] - 12 * s], [top[0] + side * 18 * s, top[1] - 17 * s], [lx, top[1] - 6 * s], [lx, ly - 2 * s]], 4.4 * s, 3.4 * s), { fill, w, seed: seed + 'n', dense: true });
        sh(g, [[lx - 10 * s, ly + 2 * s, 1], [lx - 5 * s, ly - 6 * s], [lx + 5 * s, ly - 6 * s], [lx + 10 * s, ly + 2 * s, 1]], { fill, w, seed: seed + 'h' });
        const q = [[lx - 8 * s, ly + 2 * s], [lx + 8 * s, ly + 2 * s], [lx + 5.4 * s, ly + 22 * s], [lx - 5.4 * s, ly + 22 * s]];
        T.pane(g, q, { fill: C.yellow, w, seed: seed + 'g', gleams: 1 });
        ln(g, [at(q, 0.5, 0), at(q, 0.5, 1)], { w: w * 0.9, seed: seed + 'm' });
        slab(g, [[lx - 6.4 * s, ly + 22 * s], [lx + 6.4 * s, ly + 22 * s], [lx + 5 * s, ly + 26 * s], [lx - 5 * s, ly + 26 * s]], { fill, w, seed: seed + 'b', over: 0.5 });
        return top;
    }

    function pier(g) {
        const { s0, s1, deck, soffit, back, railTop, railMid, water } = PIER;
        const lwOf = (s) => (s > 0.4 ? BG : MID);
        // the underside: one dark mass, with the dashes of its joists running to the far end
        const endX = pp(s0, 0)[0] - 34;
        slab(g, [pp(s0, soffit), pp(s1, soffit), pp(s1, back), [endX, pp(s0, back + 6)[1]]], { fill: P.under, w: BG, seed: 'pier-under', edges: [2, 3] });
        const R = Motion.rng('pier-ut');
        for (let i = 0; i < 34; i++) {
            const s = 0.3 + R() * 0.7, Y = soffit + 12 + R() * (back - soffit - 22), L = 0.03 + R() * 0.08;
            if (s + L > 1.02) continue;
            ln(g, [pp(s, Y), pp(s + L, Y)], { w: lwOf(s), seed: 'pier-ut' + i });
            if (R() < 0.4) ln(g, [pp(s + L * 0.3, Y + 8), pp(s + L * 0.85, Y + 8)], { w: lwOf(s), seed: 'pier-uu' + i });
        }
        // far piles, deeper under the deck
        const farX = (s) => pp(s, 0)[0] - 124 * s;
        for (const [i, s] of BENTS.entries()) {
            const x = farX(s), y0 = PV[1] - 74 * s, y1 = PV[1] + 86 * s;
            bar(g, [x + 1.5 * s, y0], [x, y1], 21 * s, 22 * s, { fill: P.woodFar, w: MID, seed: 'pier-fp' + i, edges: [0, 2] });
            ln(g, [[x - 11 * s, y1 - 16 * s], [x - 5 * s, y1 - 21 * s], [x + 0 * s, y1 - 15 * s], [x + 6 * s, y1 - 20 * s], [x + 11 * s, y1 - 15 * s]].map((p) => [...p, 1]), { w: MID * 0.95, seed: 'pier-fw' + i });
            ln(g, [[x - 3 * s, y0 + 40 * s], [x - 3.4 * s, y0 + 70 * s]], { w: MID * 0.95, seed: 'pier-fg' + i });
            sh(g, [[x - 19 * s, y1], [x - 8 * s, y1 - 4 * s], [x + 8 * s, y1 - 3.4 * s], [x + 20 * s, y1 + 0.5 * s], [x + 7 * s, y1 + 4 * s], [x - 9 * s, y1 + 3.6 * s]], { fill: C.foam, w: MID, seed: 'pier-ff' + i });
        }
        // cross braces from the near pile to the far one, the caps that carry the deck
        for (const [i, s] of BENTS.entries()) {
            const xn = pp(s, 0)[0], xf = farX(s);
            bar(g, [xn - 6 * s, PV[1] - 48 * s], [xf, PV[1] + 42 * s], 9 * s, 7 * s, { fill: P.woodFar, w: MID, seed: 'pier-xa' + i });
            bar(g, [xn - 6 * s, PV[1] + 80 * s], [xf, PV[1] - 36 * s], 9 * s, 7 * s, { fill: P.woodFar, w: MID, seed: 'pier-xb' + i });
            bar(g, [xn + 2 * s, PV[1] + (soffit + 12) * s], [xf - 4 * s, PV[1] - 70 * s], 17 * s, 12 * s, { fill: C.wood, w: lwOf(s), seed: 'pier-cap' + i });
        }
        // a waling along the near piles, knee braces up to the deck
        slab(g, [pp(s1, 24), pp(0.262, 24), pp(0.262, 38), pp(s1, 38)], { fill: C.wood, w: BG, seed: 'pier-wale', over: 0.8 });
        for (const [i, s] of BENTS.entries()) {
            const [xn] = pp(s, 0);
            for (const k of [-1, 1]) bar(g, [xn, PV[1] - 78 * s], [xn + k * 60 * s, PV[1] + (soffit - 3) * s], 11 * s, 10 * s, { fill: C.wood, w: lwOf(s), seed: 'pier-kn' + i + k });
        }
        // near piles: bolts at the waling, grain, the ragged wet line, a ring of foam
        for (const [i, s] of BENTS.entries()) {
            const [xn] = pp(s, 0), y0 = PV[1] + (soffit - 4) * s, y1 = PV[1] + water * s, lw = lwOf(s), hw = 17 * s;
            bar(g, [xn + 3 * s, y0], [xn, y1], 2 * hw, 2 * hw + 3 * s, { fill: C.wood, w: lw, seed: 'pier-np' + i, edges: [0, 2] });
            const wy = y1 - 26 * s;
            const zig = [[xn - hw - 1.4 * s, wy], [xn - 9 * s, wy - 7 * s], [xn - 3 * s, wy + 2 * s], [xn + 5 * s, wy - 6 * s], [xn + 10 * s, wy + 1 * s], [xn + hw + 1.2 * s, wy - 4 * s]];
            g.fillStyle = P.woodFar;
            g.fill(T.pathOf([...zig, [xn + hw + 1.4 * s, y1], [xn - hw - 1.4 * s, y1]]));
            ln(g, zig.map((p) => [...p, 1]), { w: lw, seed: 'pier-nw' + i });
            ln(g, [[xn - hw - 1.4 * s, wy - 2], [xn - hw - 1.5 * s, y1]], { w: lw, seed: 'pier-nl' + i });
            ln(g, [[xn + hw + 1.3 * s, wy - 6], [xn + hw + 1.5 * s, y1]], { w: lw, seed: 'pier-nr' + i });
            ln(g, [[xn - 6 * s, y0 + 70 * s], [xn - 6.6 * s, y0 + 112 * s]], { w: lw, seed: 'pier-g1' + i });
            ln(g, [[xn + 7 * s, y0 + 190 * s], [xn + 6.4 * s, y0 + 222 * s]], { w: lw, seed: 'pier-g2' + i });
            ln(g, [[xn + 1 * s, y0 + 200 * s], [xn + 0.6 * s, y0 + 214 * s]], { w: lw, seed: 'pier-g3' + i });
            ln(g, [[xn + 8 * s, y0 + 40 * s], [xn + 7.6 * s, y0 + 58 * s]], { w: lw, seed: 'pier-g4' + i });
            for (const k of [-7, 7]) dot(g, xn + k * s, PV[1] + 31 * s, Math.max(1.1, 2.2 * s), C.ink);
            sh(g, [[xn - 30 * s, y1 + 1 * s], [xn - 13 * s, y1 - 5 * s], [xn + 11 * s, y1 - 4 * s], [xn + 32 * s, y1 + 2 * s], [xn + 10 * s, y1 + 7 * s], [xn - 15 * s, y1 + 6.4 * s]], { fill: C.foam, w: lw, seed: 'pier-nf' + i });
        }
        // on the deck, behind the rail: the bait shed, a lamp, the posts of the sign, a flagstaff
        const shed = [pp(0.36, -398), pp(0.5, -398), pp(0.5, deck + 4), pp(0.36, deck + 4)];
        slab(g, [pp(0.345, -404), pp(0.52, -404), pp(0.5, -476), pp(0.365, -470)], { fill: P.coral, w: MID, seed: 'bait-roof', over: 1.2 });
        for (const u of [0.25, 0.5, 0.75]) ln(g, [mix(pp(0.365, -470), pp(0.5, -476), u), mix(pp(0.345, -404), pp(0.52, -404), u)], { w: FAR, seed: 'bait-rl' + u });
        slab(g, shed, { fill: P.lilac, w: MID, seed: 'bait', over: 1.2 });
        planks(g, shed, 8, { seed: 'bait-pl', w: FAR, skip: 0.2 });
        T.pane(g, [at(shed, 0.56, 0.42), at(shed, 0.9, 0.42), at(shed, 0.9, 0.72), at(shed, 0.56, 0.72)], { w: FAR, seed: 'bait-win', gleams: 1 });
        slab(g, [at(shed, 0.1, 0.42), at(shed, 0.42, 0.42), at(shed, 0.42, 1), at(shed, 0.1, 1)], { fill: P.navy, w: FAR, seed: 'bait-door', over: 0.6 });
        const bq = [at(shed, 0.1, 0.06), at(shed, 0.9, 0.06), at(shed, 0.9, 0.33), at(shed, 0.1, 0.33)];
        slab(g, bq, { fill: C.white, w: MID, seed: 'bait-sign', over: 0.8 });
        const bc = mix(bq[3], bq[2], 0.5);
        chalk(g, 'BAIT', bc[0], bc[1] - 3.4, 19, { color: C.red, align: 'center', rot: -0.22, seed: 'bait-t' });
        lampPost(g, ...pp(0.3, deck + 6), 300 * 0.3, 0.34, { seed: 'pier-lamp-b', w: FAR, side: 1, lean: 1 });
        bar(g, pp(0.262, deck + 6), [pp(0.262, 0)[0] + 3, PV[1] - 176], 3.4, 2.6, { fill: C.white, w: FAR, seed: 'pier-staff' });
        dot(g, pp(0.262, 0)[0] + 3, PV[1] - 178, 2.2, C.roadLine);
        bar(g, [1398, 440], [1392, 250], 9, 8, { fill: C.wood, w: BG, seed: 'sign-post-a' });
        bar(g, [1566, 390], [1572, 230], 10, 9, { fill: C.wood, w: BG, seed: 'sign-post-b' });
        // the deck's edge: plank ends over a heavy beam with its bolts and dashes
        slab(g, [pp(s0, deck), pp(s1, deck), pp(s1, soffit), pp(s0, soffit)], { fill: C.wood, w: BG, seed: 'pier-fascia', over: 1.2 });
        slab(g, [pp(s0, deck), pp(s1, deck), pp(s1, deck + 15), pp(s0, deck + 15)], { fill: P.deck, w: BG, seed: 'pier-deck', over: 1.2 });
        for (let s = s0 * 1.05; s < s1; s *= 1.05) ln(g, [pp(s, deck + 1), pp(s * 1.004, deck + 14)], { w: s > 0.5 ? MID : FAR, seed: 'pier-pe' + s.toFixed(3), amp: 0.15 });
        const RF = Motion.rng('pier-ft');
        for (let i = 0; i < 12; i++) {
            const s = 0.3 + RF() * 0.68, Y = soffit - 9 - RF() * 12, L = 0.02 + RF() * 0.04;
            ln(g, [pp(s, Y), pp(s + L, Y)], { w: lwOf(s), seed: 'pier-ft' + i });
        }
        for (const s of BENTS) for (const k of [-7, 7]) dot(g, pp(s, 0)[0] + k * s, PV[1] + (soffit - 14) * s, Math.max(1.1, 2.2 * s), C.ink);
        // the seaward end: the deck's edge turns the corner, a ladder goes down to the water
        poly(g, [pp(s0, deck), [endX, PV[1] + s0 * -60], [endX, PV[1] + s0 * (back + 6)], pp(s0, soffit)], { fill: P.woodFar, w: MID, seed: 'pier-end' });
        for (const k of [0, 5]) ln(g, [[pp(s0, 0)[0] + 5 + k, PV[1] + s0 * deck - 8], [pp(s0, 0)[0] + 4 + k, PV[1] + s0 * 118]], { w: FAR, seed: 'pier-lad' + k });
        for (let y = PV[1] + s0 * deck - 2; y < PV[1] + s0 * 112; y += 5.5) ln(g, [[pp(s0, 0)[0] + 4.6, y], [pp(s0, 0)[0] + 9.6, y]], { w: FAR * 0.9, seed: 'pier-rung' + y.toFixed(0), amp: 0 });
        // the rail: two bars that pass behind the posts
        const posts = [1.0, 0.905, 0.8, 0.705, 0.625, 0.55, 0.49, 0.43, 0.38, 0.335, 0.297, 0.262, 0.24];
        ln(g, [pp(s0, railTop + 4), [endX + 3, PV[1] + s0 * -96]], { w: FAR, seed: 'pier-er1' });
        ln(g, [pp(s0, railMid), [endX + 3, PV[1] + s0 * -80]], { w: FAR, seed: 'pier-er2' });
        ln(g, [[endX + 3, PV[1] + s0 * -98], [endX + 3, PV[1] + s0 * -60]], { w: FAR, seed: 'pier-er3' });
        slab(g, [pp(s0, railTop), pp(s1, railTop), pp(s1, railTop + 12), pp(s0, railTop + 12)], { fill: C.greyDeep, w: BG, seed: 'pier-rail-a', over: 0.8 });
        slab(g, [pp(s0, railMid), pp(s1, railMid), pp(s1, railMid + 10), pp(s0, railMid + 10)], { fill: C.greyDeep, w: BG, seed: 'pier-rail-b', over: 0.8 });
        for (const [i, s] of posts.entries()) {
            const a = pp(s, deck + 2), b = pp(s, railTop - 7);
            bar(g, a, [b[0] + 1.5 * s, b[1]], 13 * s, 12 * s, { fill: C.grey, w: s > 0.45 ? BG : MID, seed: 'pier-post' + i });
            if (s > 0.3) slab(g, [[b[0] - 9 * s, b[1] - 4 * s], [b[0] + 11.5 * s, b[1] - 4 * s], [b[0] + 10.5 * s, b[1] + 1 * s], [b[0] - 8 * s, b[1] + 1 * s]], { fill: C.grey, w: s > 0.45 ? BG : MID, seed: 'pier-pc' + i, over: 0.5 });
        }
        // a life ring on its board, a towel left on the rail
        const lr = pp(0.588, -282);
        slab(g, [[lr[0] - 21, lr[1] - 23], [lr[0] + 21, lr[1] - 26], [lr[0] + 22, lr[1] + 20], [lr[0] - 20, lr[1] + 23]], { fill: C.white, w: MID, seed: 'ring-board', over: 1 });
        disc(g, lr[0], lr[1] - 1, 16, 16.5, {
            fill: C.red, w: MID, seed: 'ring',
            inside: (c) => {
                c.fillStyle = C.white;
                c.save();
                c.translate(lr[0], lr[1] - 1);
                c.rotate(0.5);
                c.fillRect(-22, -4.6, 44, 9.2);
                c.fillRect(-4.6, -22, 9.2, 44);
                c.restore();
            },
        });
        disc(g, lr[0], lr[1] - 1, 7.4, 7.8, { fill: C.white, w: MID, seed: 'ring-in', n: 10 });
        const tw = [pp(0.845, railTop - 3), pp(0.9, railTop - 3), pp(0.905, railTop + 84), pp(0.85, railTop + 88)];
        slab(g, tw, {
            fill: C.magenta, w: BG, seed: 'towel',
            inside: (c) => {
                c.fillStyle = C.roadLine;
                for (const v of [0.18, 0.5, 0.8]) c.fill(T.pathOf([at(tw, -0.1, v), at(tw, 1.1, v), at(tw, 1.1, v + 0.12), at(tw, -0.1, v + 0.12)]));
            },
        });
        ln(g, [at(tw, 0.3, 0.3), at(tw, 0.34, 0.62)], { w: MID, seed: 'towel-f' });
        // the sign: a crooked board on two posts, hand lettered
        const sq = [[1376, 144], [1582, 116], [1590, 242], [1382, 262]];
        slab(g, sq, { fill: P.cream, w: BG, seed: 'gh-board', over: 2.2 });
        const iq = [at(sq, 0.04, 0.08), at(sq, 0.96, 0.08), at(sq, 0.96, 0.92), at(sq, 0.04, 0.92)];
        slab(g, iq, { fill: null, w: MID, seed: 'gh-inner', over: 0.4, color: P.fishDeep });
        g.save();
        g.translate(1480, 196);
        g.rotate(-0.115);
        T.sign(g, 'GULL', -4, 0, { size: 66, fill: C.red, drop: C.navy, seed: 'gh-a', w: MID, tilt: 0.09 });
        T.sign(g, 'HARBOR', 2, 52, { size: 50, fill: [P.fish, C.roadLine], drop: C.navy, seed: 'gh-b', w: MID, tilt: 0.08 });
        g.restore();
        for (const [u, v] of [[0.02, 0.05], [0.98, 0.05], [0.98, 0.95], [0.02, 0.95]]) dot(g, ...at(sq, u, v), 2.2, C.ink);
        // a gull cut from a plank stands on top of it: a beak, a wing, a tail
        sh(g, [[1404, 139, 1], [1410, 130], [1424, 127], [1432, 120], [1436, 110], [1445, 106], [1454, 110], [1456, 116, 1], [1467, 119, 1], [1455, 122], [1452, 132], [1444, 137, 1]], { fill: C.white, w: MID, seed: 'gh-gull' });
        sh(g, [[1404, 139, 1], [1394, 128, 1], [1412, 131, 1]], { fill: C.grey, w: MID, seed: 'gh-gull-t' });
        sh(g, [[1456, 116, 1], [1467, 119, 1], [1456, 121, 1]], { fill: C.orange, w: FAR, seed: 'gh-gull-b' });
        sh(g, [[1414, 131, 1], [1426, 127], [1438, 130, 1], [1428, 135]], { fill: C.grey, w: FAR, seed: 'gh-gull-w' });
        dot(g, 1447.5, 112, 1.5, C.ink);
        for (const x of [1428, 1436]) ln(g, [[x, 136], [x, 142]], { w: FAR, seed: 'gh-gull-l' + x, color: C.orange });
    }

    // --- the quay --------------------------------------------------------------------------------
    const LIP = [[-20, 630], [500, 639], [1090, 646]]; // the quay's far edge over the water
    const CREST = [[1090, 646], [1620, 842]]; // where the slipway starts to fall
    const SHORE = [[1300, 658], [1620, 728]]; // where the sea meets the slipway
    const crestY = (x) => 646 + ((x - 1090) * 196) / 530;
    const shoreY = (x) => (x < 1300 ? 646 + ((x - 1090) * 12) / 210 : 658 + ((x - 1300) * 70) / 320);

    function quay(g) {
        const flat = [[-20, 630], [500, 639], [1090, 646], [1620, 842], [1620, 920], [-20, 920]];
        // the slipway: a ramp of ribbed concrete falling away to the right, into the sea
        const ramp = [[1090, 646], [1300, 658], [1620, 728], [1620, 842]];
        slab(g, ramp, { fill: P.ramp, w: BG, seed: 'ramp', edges: [0] });
        // its wet foot, green with weed
        const weed = [[1262, 656, 1], [1300, 658, 1], [1620, 728, 1], [1620, 768, 1], [1560, 742], [1500, 734], [1440, 708], [1380, 702], [1320, 676]];
        g.fillStyle = P.wet;
        g.fill(T.pathOf(T.path(weed, true)));
        ln(g, [[1262, 656, 1], [1320, 676], [1380, 702], [1440, 708], [1500, 734], [1560, 742], [1620, 768, 1]], { w: MID, seed: 'ramp-wet' });
        // ribs for grip, running with the crest and closing up towards the water
        const R = Motion.rng('ramp-ribs');
        const rampAt = (x, k) => crestY(x) + (shoreY(x) - crestY(x)) * k;
        for (const [i, k] of [0.2, 0.38, 0.54, 0.68].entries()) {
            let x = 1180 + i * 46 + R() * 20;
            while (x < 1600) {
                const L = 90 + R() * 120, x1 = Math.min(1618, x + L);
                ln(g, [[x, rampAt(x, k)], [(x + x1) / 2, rampAt((x + x1) / 2, k)], [x1, rampAt(x1, k)]], { w: MID, seed: 'rib' + i + Math.round(x) });
                x = x1 + 26 + R() * 50;
            }
        }
        // joints down the slope
        for (const x of [1236, 1352, 1486]) ln(g, [[x, crestY(x) + 2], [x + 44, rampAt(x + 44, 0.72)]], { w: MID, seed: 'ramp-j' + x });
        // the quay itself
        slab(g, flat, { fill: P.quay, w: BG, seed: 'quay', edges: [0, 1] });
        // coping stones along the lip, each with its joint
        const cope = [[-20, 630], [500, 639], [1090, 646], [1078, 663], [500, 655], [-20, 646]];
        g.fillStyle = P.coping;
        g.fill(T.pathOf(cope));
        ln(g, [[-20, 646], [500, 655], [1078, 663]], { w: BG, seed: 'cope-in' });
        ln(g, [[-20, 630], [500, 639], [1092, 646.2]], { w: BG, seed: 'cope-out' });
        const RC = Motion.rng('cope-j');
        for (let x = 372; x < 1070; x += 54 + RC() * 40) {
            const y = 630 + (x + 20) * 0.0152 + 0.6;
            ln(g, [[x, y], [x + (x - VP[0]) * 0.035, y + 16]], { w: MID, seed: 'cope-j' + Math.round(x) });
        }
        // the crest of the slipway: a kerb of the same stone
        const kerb = [[1090, 646], [1620, 842], [1620, 866], [1078, 663]];
        g.fillStyle = P.coping;
        g.fill(T.pathOf(kerb));
        ln(g, [[1078, 663], [1620, 866]], { w: BG, seed: 'kerb-in' });
        ln(g, [[1090, 646], [1622, 842.6]], { w: BG, seed: 'kerb-out' });
        for (const x of [1150, 1226, 1320, 1432, 1560]) ln(g, [[x, crestY(x) + 0.6], [x - 16 - (x - 1090) * 0.02, crestY(x) + 20 + (x - 1090) * 0.014]], { w: MID, seed: 'kerb-j' + x });
        // flagstones: joints that run to the vanishing point, cross joints that bow with the lens;
        // drawn in pieces, as a hand leaves them
        g.save();
        g.clip(T.pathOf([[-20, 648], [500, 657], [1076, 665], [1620, 868], [1620, 920], [-20, 920]]));
        const RJ = Motion.rng('flag-j');
        for (const bx of [-640, -250, 130, 480, 820, 1150, 1500, 1900]) {
            const A = mix(VP, [bx, 900], 0.26), B = [bx, 900];
            let u = 0;
            while (u < 1) {
                const L = 0.12 + RJ() * 0.3, gap = RJ() < 0.55 ? 0.05 + RJ() * 0.16 : 0;
                ln(g, [mix(A, B, u), mix(A, B, Math.min(1, u + L))], { w: BG, seed: 'flag-r' + bx + u.toFixed(2) });
                u += L + gap;
            }
        }
        for (const [k, y] of [[0, 684], [1, 716], [2, 772], [3, 858]]) {
            let x = -20 - RJ() * 60;
            while (x < 1620) {
                const L = 110 + RJ() * 240, gap = RJ() < 0.6 ? 30 + RJ() * 120 : 0;
                const yy = (xx) => y - 6 + (xx / 1600) * 12 + Math.pow((xx - 800) / 800, 2) * (3 + k * 3);
                ln(g, [[x, yy(x)], [x + L / 2, yy(x + L / 2)], [x + L, yy(x + L)]], { w: BG, seed: 'flag-c' + k + Math.round(x) });
                x += L + gap;
            }
        }
        g.restore();
        // a worn yellow line painted along the lip and down the crest
        for (const [i, [x0, x1]] of [[520, 640], [668, 836], [884, 1010]].entries()) {
            const y = (x) => 664 + (x - 500) * 0.0136;
            slab(g, [[x0, y(x0)], [x1, y(x1)], [x1 + 2, y(x1) + 6.5], [x0 - 2, y(x0) + 6.5]], { fill: C.roadLine, w: MID, seed: 'yl' + i, over: 0.6 });
        }
        for (const [i, [x0, x1]] of [[1150, 1182], [1232, 1330], [1366, 1436]].entries()) {
            const y = (x) => crestY(x) + 26 + (x - 1090) * 0.03;
            slab(g, [[x0, y(x0)], [x1, y(x1)], [x1 - 4, y(x1) + 9 + i * 2], [x0 - 4, y(x0) + 8 + i * 2]], { fill: C.roadLine, w: MID, seed: 'ylc' + i, over: 0.6 });
        }
        // ticks, mostly in pairs, more of them near us
        T.ticks(g, [[330, 668], [1060, 676], [1240, 760], [330, 760]], { n: 12, dir: 0.01, spread: 0.08, len: [9, 22], w: BG, seed: 'quay-t1', pair: 0.6 });
        T.ticks(g, [[0, 770], [1340, 776], [1500, 890], [0, 890]], { n: 20, dir: 0, spread: 0.1, len: [12, 34], w: TICK, seed: 'quay-t2', pair: 0.6, avoid: [[930, 838, 60], [640, 814, 40]] });
        // a drain, an iron ring let into the stone
        const dq = [[896, 826], [962, 827], [970, 850], [890, 849]];
        slab(g, dq, { fill: P.iron, w: BG, seed: 'drain', over: 1 });
        for (let i = 1; i < 7; i++) ln(g, [at(dq, i / 7, 0.14), at(dq, i / 7, 0.86)], { w: MID, seed: 'drain-b' + i });
        ln(g, [[884, 854], [976, 855]], { w: BG, seed: 'drain-l' });
        slab(g, [[626, 804], [654, 804.6], [656, 814], [624, 813.4]], { fill: P.ironLight, w: MID, seed: 'ring-plate', over: 0.6 });
        disc(g, 640, 820, 15, 6.6, { fill: null, w: BG * 1.5, seed: 'ring-out', color: C.ink, n: 14 });
        disc(g, 640, 820, 15, 6.6, { fill: null, w: BG * 0.55, seed: 'ring-out', color: P.ironLight, n: 14 });
        // on the lip: small bollards for the trawler's lines, the hoops of a ladder, a ring
        for (const [x, y] of [[640, 641], [905, 644]]) {
            sh(g, [[x - 8, y + 9, 1], [x - 6, y - 6], [x - 10, y - 9], [x - 8, y - 15], [x + 8, y - 15], [x + 10, y - 9], [x + 6, y - 6], [x + 8, y + 9, 1]], { fill: P.iron, w: MID, seed: 'bol' + x });
            ln(g, [[x - 6, y - 4], [x + 6, y - 3.6]], { w: MID, seed: 'bol-r' + x });
            ln(g, [[x - 6, y - 0.6], [x + 6, y - 0.2]], { w: MID, seed: 'bol-s' + x });
        }
        for (const x of [764, 786]) ln(g, [[x, 652], [x, 624], [x + 5, 617], [x + 10, 624], [x + 10, 640]], { w: BG * 1.25, seed: 'lad' + x, color: C.ink });
        for (const x of [764, 786]) ln(g, [[x, 652], [x, 624], [x + 5, 617], [x + 10, 624], [x + 10, 640]], { w: BG * 0.45, seed: 'lad' + x, color: C.roadLine, amp: 0.3 });
        // a stretch of rail before the slip: two bars that pass behind their posts
        const railY = (x) => 637 + (x + 20) * 0.0152;
        for (const [h, t, k] of [[45, 6.4, 'a'], [24, 5.6, 'b']]) slab(g, [[950, railY(950) - h], [1092, railY(1092) - h - 1], [1092, railY(1092) - h - 1 + t], [950, railY(950) - h + t]], { fill: C.greyDeep, w: MID, seed: 'qrail-' + k, over: 0.8 });
        for (const x of [958, 1001, 1044, 1086]) {
            bar(g, [x, railY(x) + 2], [x + 1.6, railY(x) - 50], 8, 7.4, { fill: C.grey, w: BG, seed: 'qrail-p' + x });
            slab(g, [[x - 4.4, railY(x) - 53], [x + 7.6, railY(x) - 53], [x + 7, railY(x) - 49.4], [x - 3.8, railY(x) - 49.4]], { fill: C.grey, w: MID, seed: 'qrail-c' + x, over: 0.5 });
            slab(g, [[x - 7, railY(x) - 1], [x + 7, railY(x) - 0.6], [x + 8, railY(x) + 3.4], [x - 8, railY(x) + 3]], { fill: C.greyDeep, w: MID, seed: 'qrail-f' + x, over: 0.5 });
        }
        // the palm's bed: a ring cut in the stone
        disc(g, 470, 651, 24, 7, { fill: C.sandDeep, w: MID, seed: 'palm-bed', n: 14 });
        // fish boxes left by the top of the slip
        for (const [x, y, c, k] of [[1100, 674, C.blue, 0], [1108, 658, C.orange, 1], [1038, 670, C.blue, 2]]) {
            slab(g, [[x, y], [x + 44, y + 3], [x + 43, y + 20], [x + 1, y + 17]], { fill: c, w: BG, seed: 'qbox' + k, over: 1 });
            slab(g, [[x - 2, y - 3], [x + 46, y], [x + 46, y + 5], [x - 2, y + 2]], { fill: c, w: BG, seed: 'qboxr' + k, over: 0.8 });
            ln(g, [[x + 14, y + 9], [x + 30, y + 10.4]], { w: BG * 1.6, seed: 'qboxh' + k, amp: 0 });
        }
        // foam where the sea runs up the concrete: white shapes with their outline
        const RFm = Motion.rng('foam-slip'), up = [], dn = [];
        for (let x = 1296, i = 0; x <= 1640; x += 30 + RFm() * 14, i++) {
            up.push([x, shoreY(x) - 7 + (i % 2 ? 5 : -4) + RFm() * 4]);
            dn.push([x + 8, shoreY(x) + 8 + (i % 2 ? -4 : 6) + RFm() * 5 + (x - 1296) * 0.03]);
        }
        sh(g, [[1270, 656, 1], ...up, [1650, 730, 1], [1650, 762, 1], ...dn.reverse()], { fill: C.foam, w: BG, seed: 'foam-slip' });
        sh(g, [[1392, 652], [1414, 646], [1440, 653], [1418, 660]], { fill: C.foam, w: MID, seed: 'foam-b' });
        sh(g, [[1504, 676], [1530, 670], [1560, 680], [1586, 696], [1554, 692], [1528, 684]], { fill: C.foam, w: MID, seed: 'foam-c' });
        // the dinghy hauled up on its trolley, stern in the foam
        dinghy(g);
        // the lamp post at the head of the slip, with the harbour's notices
        lampPost(g, 1118, 668, 300, 0.84, { seed: 'quay-lamp', side: -1, lean: 6 });
        // (the notice rides on the post: both stand clear of where the cast plays)
        g.save();
        g.translate(-83, -22);
        const nq = [[1190, 514], [1230, 511], [1231, 552], [1191, 556]];
        slab(g, nq, { fill: C.white, w: BG, seed: 'notice', over: 1.2 });
        disc(g, 1210.5, 527, 9, 9, { fill: C.white, w: BG * 1.3, seed: 'notice-o', color: C.red, n: 12 });
        ln(g, [[1204, 533], [1217, 521]], { w: BG * 1.3, seed: 'notice-x', color: C.red });
        ln(g, [[1197, 544], [1224, 542.4]], { w: MID, seed: 'notice-l1' });
        ln(g, [[1200, 549.4], [1220, 548]], { w: MID, seed: 'notice-l2' });
        g.restore();
    }

    function dinghy(g) {
        g.save();
        g.translate(1474, 724);
        g.rotate(-0.3);
        g.scale(1.12, 1.12);
        // the trolley: a bar, an axle, a wheel
        bar(g, [-84, 17], [58, 15], 5, 5, { fill: P.iron, w: BG, seed: 'dg-bar' });
        disc(g, -86, 21, 5, 5, { fill: C.ink, w: MID, seed: 'dg-jockey', n: 9 });
        // the hull, clinker built: white with a coral sheer strake, the inside showing past the gunwale
        sh(g, [[-70, -10, 1], [-40, -20], [20, -22], [66, -14, 1], [62, 6, 1], [20, 14], [-36, 13], [-62, 4]], { fill: P.cream, w: BG, seed: 'dg-hull' });
        sh(g, [[-70, -10, 1], [-40, -20], [20, -22], [66, -14, 1], [64, -6, 1], [20, -13], [-40, -11], [-67, -3, 1]], { fill: P.coral, w: BG, seed: 'dg-sheer' });
        ln(g, [[-64, 0], [-36, 2], [20, 1], [63, 0]], { w: MID, seed: 'dg-st1' });
        ln(g, [[-58, 7], [-36, 8], [20, 8], [62, 4]], { w: MID, seed: 'dg-st2' });
        sh(g, [[-58, -15, 1], [-38, -24], [20, -26], [58, -19, 1], [20, -20], [-38, -18]], { fill: C.wood, w: MID, seed: 'dg-in' });
        ln(g, [[-14, -25], [-12, -19]], { w: BG, seed: 'dg-th1' });
        ln(g, [[24, -26], [25, -20]], { w: BG, seed: 'dg-th2' });
        // oars shipped, the outboard tilted at the transom
        bar(g, [-50, -22], [44, -33], 3.4, 3, { fill: P.spar, w: MID, seed: 'dg-oar' });
        sh(g, [[40, -37, 1], [64, -42], [70, -35], [46, -29, 1]], { fill: P.spar, w: MID, seed: 'dg-blade' });
        slab(g, [[62, -36], [78, -38], [80, -16], [66, -14]], { fill: P.iron, w: BG, seed: 'dg-ob', over: 0.8 });
        ln(g, [[66, -27], [77, -28.4]], { w: MID, seed: 'dg-obl', color: C.red });
        bar(g, [74, -15], [84, 6], 4, 3, { fill: P.ironLight, w: MID, seed: 'dg-leg' });
        // wheel in front of the hull
        disc(g, 6, 20, 14, 14, { fill: C.ink, w: BG, seed: 'dg-wheel', n: 12 });
        disc(g, 6, 20, 6.4, 6.4, { fill: P.ironLight, w: MID, seed: 'dg-hub', n: 9 });
        dot(g, 6, 20, 1.6, C.ink);
        g.restore();
    }

    // --- Dot's chip hut and what stands round it ----------------------------------------------
    const HUT = {
        front: [[-40, 249], [288, 262], [300, 734], [-30, 750]], // tl, tr, br, bl
        side: [[288, 262], [340, 290], [352, 700], [300, 734]],
        hatch: { u0: 0.22, u1: 0.9, v0: 0.19, v1: 0.535 },
    };

    function parasol(g) {
        const x = 474, y = 700;
        // the table and two stools behind the pole
        for (const [sx, k] of [[x - 46, 'a'], [x + 44, 'b']]) {
            bar(g, [sx, y - 4], [sx, y - 30], 4, 4, { fill: P.iron, w: BG, seed: 'stool-l' + k });
            sh(g, T.ellipse(sx, y - 31, 15, 5, 0, 10), { fill: P.coral, w: BG, seed: 'stool' + k });
            ln(g, [[sx - 9, y - 2], [sx + 9, y - 2]], { w: BG, seed: 'stool-f' + k });
        }
        for (const k of [-22, 22]) bar(g, [x + k, y - 44], [x + k * 1.25, y + 2], 4.4, 4, { fill: C.white, w: BG, seed: 'tb-leg' + k });
        bar(g, [x - 1, y + 4], [x + 2, y - 150], 5, 4.4, { fill: C.grey, w: BG, seed: 'ps-pole' });
        sh(g, T.ellipse(x, y - 48, 44, 10, -0.02, 14), { fill: C.white, w: BG, seed: 'tb-top' });
        ln(g, [[x - 42, y - 44], [x - 20, y - 38.6], [x + 14, y - 38], [x + 42, y - 43]], { w: BG, seed: 'tb-edge' });
        // a cone of chips somebody left, a bottle
        sh(g, [[x + 14, y - 49, 1], [x + 21, y - 71, 1], [x + 33, y - 69, 1]], { fill: P.cream, w: MID, seed: 'tb-cone' });
        for (const [cx, cy, r] of [[x + 22, y - 74, 0.5], [x + 27, y - 76, -0.2], [x + 31, y - 73, 0.2]]) bar(g, [cx, cy + 4], [cx + r * 6, cy - 7], 3.4, 3.4, { fill: C.roadLine, w: MID, seed: 'tb-chip' + cx });
        slab(g, [[x - 24, y - 71], [x - 15, y - 71], [x - 14, y - 50], [x - 25, y - 50]], { fill: C.red, w: MID, seed: 'tb-bottle', over: 0.6 });
        sh(g, [[x - 22, y - 71, 1], [x - 20.6, y - 79, 1], [x - 18.4, y - 79, 1], [x - 17, y - 71, 1]], { fill: C.white, w: MID, seed: 'tb-noz' });
        // the canopy: eight gores, alternately coral and cream, with a scalloped edge
        const top = [x + 2, y - 172], rim = [];
        for (let i = 0; i <= 5; i++) rim.push([x - 76 + i * 31 + (i === 0 ? -2 : 0), y - 128 + Math.abs(i - 2.5) * 3.4 - 6 + (i % 2) * 2]);
        const scallop = (a, b) => [a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 9], b];
        const edge = [];
        for (let i = 0; i < 5; i++) edge.push([...rim[i], 1], scallop(rim[i], rim[i + 1])[1]);
        edge.push([...rim[5], 1]);
        const out = sh(g, [[...top, 1], ...edge.reverse()], { fill: P.cream, w: BG, seed: 'ps-canopy' });
        g.save();
        g.clip(T.pathOf(out));
        g.fillStyle = P.coral;
        for (const i of [0, 2, 4]) g.fill(T.pathOf([top, [rim[i][0], rim[i][1] + 14], [rim[i + 1][0], rim[i + 1][1] + 14]]));
        g.restore();
        for (let i = 1; i < 5; i++) ln(g, [top, rim[i]], { w: BG, seed: 'ps-rib' + i });
        ln(g, out, { w: BG, seed: 'ps-canopy', dense: true, closed: true, amp: 0 });
        disc(g, top[0], top[1] - 4, 3.6, 3.6, { fill: C.roadLine, w: MID, seed: 'ps-knob', n: 8 });
    }

    function hutSide(g) {
        const S = HUT.side;
        // the flue: a pipe up past the roof with a hat on it
        bar(g, [343, 300], [338, 176], 15, 14, { fill: C.grey, w: BG, seed: 'flue' });
        for (const y of [214, 262]) ln(g, [[331, y], [346.6, y + 1]], { w: BG, seed: 'flue-b' + y });
        for (const k of [-5, 5]) ln(g, [[338 + k, 176], [338 + k, 166]], { w: BG, seed: 'flue-l' + k });
        sh(g, [[320, 168, 1], [338, 150, 1], [357, 168, 1]], { fill: C.greyDeep, w: BG, seed: 'flue-hat' });
        // the side wall: planks, a fuse box and its pipe
        slab(g, S, { fill: P.hutSide, w: BG, seed: 'hut-side', over: 1.4 });
        planks(g, S, 4, { seed: 'hut-side-pl', skip: 0 });
        const fq = [at(S, 0.3, 0.3), at(S, 0.8, 0.3), at(S, 0.8, 0.4), at(S, 0.3, 0.4)];
        slab(g, fq, { fill: C.grey, w: MID, seed: 'fuse', over: 0.6 });
        ln(g, [at(fq, 0.5, 0.08), at(fq, 0.5, 0.92)], { w: MID, seed: 'fuse-d' });
        dot(g, ...at(fq, 0.7, 0.5), 1.6, C.red);
        ln(g, [at(fq, 0.16, 0.3), at(fq, 0.36, 0.3)], { w: MID, seed: 'fuse-l' });
        ln(g, [at(S, 0.55, 0.4), at(S, 0.56, 0.9)], { w: BG, seed: 'fuse-pipe' });
        slab(g, [at(S, 0, 0.955), at(S, 1, 0.955), S[2], S[3]], { fill: P.hutDeep, w: BG, seed: 'hut-side-kick', over: 0.8 });
        // the roof's edge along the side
        slab(g, [[294, 236], [346, 266], [344, 293], [290, 264]], { fill: P.cream, w: BG, seed: 'hut-fascia-s', over: 1.2 });
    }

    function surfboard(g) {
        // Dot's old longboard, leaning on the side wall
        const pts = [[392, 722, 1], [372, 700], [352, 600], [346, 480], [354, 410, 1], [372, 470], [392, 590], [402, 700]];
        const out = sh(g, pts, { fill: P.cream, w: BG, seed: 'surf' });
        g.save();
        g.clip(T.pathOf(out));
        g.fillStyle = P.coral;
        g.fill(T.pathOf([[340, 560], [410, 548], [410, 574], [340, 588]]));
        g.fillStyle = P.fish;
        g.fill(T.pathOf([[340, 594], [410, 580], [410, 590], [340, 604]]));
        g.restore();
        ln(g, [[358, 430], [366, 560], [386, 706]], { w: MID, seed: 'surf-stringer' });
        ln(g, out, { w: BG, seed: 'surf', dense: true, closed: true, amp: 0 });
        fish(g, 364, 500, 11, { rot: -1.44, w: MID, seed: 'surf-fish' });
    }

    function gasBottle(g) {
        const x = 418, y = 724;
        sh(g, [[x - 17, y, 1], [x - 18, y - 60], [x - 12, y - 74], [x + 12, y - 74], [x + 18, y - 60], [x + 17, y, 1]], { fill: C.orange, w: BG, seed: 'gas' });
        slab(g, [[x - 12, y - 88], [x + 12, y - 88], [x + 11, y - 73], [x - 11, y - 73]], { fill: P.iron, w: BG, seed: 'gas-collar', over: 0.7 });
        g.fillStyle = P.hutSide;
        g.fill(T.pathOf([[x - 6, y - 85], [x + 6, y - 85], [x + 5.4, y - 77], [x - 5.4, y - 77]]));
        ln(g, [[x - 6, y - 85], [x + 6, y - 85], [x + 5.4, y - 77], [x - 5.4, y - 77], [x - 6, y - 85]].map((p) => [...p, 1]), { w: MID, seed: 'gas-hole' });
        ln(g, [[x - 17.4, y - 14], [x + 17.4, y - 14]], { w: BG, seed: 'gas-b1' });
        ln(g, [[x - 18, y - 52], [x + 18, y - 52]], { w: BG, seed: 'gas-b2' });
        ln(g, [[x - 8, y - 44], [x - 8.4, y - 24]], { w: BG, seed: 'gas-gl', color: C.white });
        // the hose to the wall
        ln(g, [[x, y - 88], [x - 6, y - 104], [x - 30, y - 108], [x - 66, y - 90]], { w: BG * 1.5, seed: 'gas-hose' });
    }

    function bin(g) {
        const x = 344, y = 752;
        // a drum with a swing lid, overfull
        sh(g, [[x - 26, y, 1], [x - 30, y - 70, 1], [x + 30, y - 71, 1], [x + 26, y, 1]], { fill: C.green, w: BG, seed: 'bin' });
        for (const k of [-0.5, 0, 0.5]) ln(g, [[x + k * 52, y - 62], [x + k * 46, y - 8]], { w: BG, seed: 'bin-r' + k });
        slab(g, [[x - 20, y - 44], [x + 20, y - 45], [x + 19, y - 24], [x - 19, y - 23]], { fill: C.white, w: MID, seed: 'bin-label', over: 0.6 });
        fish(g, x, y - 34, 13, { w: MID, seed: 'bin-fish', flip: true });
        sh(g, [[x - 33, y - 68, 1], [x - 26, y - 88], [x, y - 96], [x + 26, y - 89], [x + 33, y - 69, 1]], { fill: P.hutDeep, w: BG, seed: 'bin-lid' });
        slab(g, [[x - 15, y - 86], [x + 15, y - 87], [x + 16, y - 73], [x - 16, y - 72]], { fill: C.ink, w: MID, seed: 'bin-flap', over: 0.5 });
        // a cone and a cup sticking out
        sh(g, [[x - 4, y - 78, 1], [x - 14, y - 104, 1], [x + 2, y - 106, 1]], { fill: P.cream, w: MID, seed: 'bin-cone' });
        ln(g, [[x - 9, y - 100], [x - 4.4, y - 84]], { w: MID, seed: 'bin-cone-l', color: C.red });
        slab(g, [[x + 4, y - 100], [x + 16, y - 98], [x + 13, y - 78], [x + 5, y - 79]], { fill: C.white, w: MID, seed: 'bin-cup', over: 0.5 });
        ln(g, [[x + 5, y - 92], [x + 15, y - 90]], { w: MID * 1.4, seed: 'bin-cup-b', color: C.magenta });
        // a wrapper on the ground
        sh(g, [[x + 34, y - 2, 1], [x + 40, y - 12], [x + 52, y - 8, 1], [x + 56, y + 1], [x + 44, y + 4]], { fill: P.cream, w: MID, seed: 'wrapper' });
        ln(g, [[x + 40, y - 3], [x + 50, y - 4]], { w: MID, seed: 'wrapper-l' });
    }

    // The counter and what stands on it: drawn with the hut, and again over anyone who
    // stands in the hatch (Harbor.counter), so they are behind it.
    function counterTop(g) {
        slab(g, [[18, 506], [278, 505], [294, 520], [4, 522]], { fill: P.deck, w: BG, seed: 'counter-top', over: 1 });
        slab(g, [[4, 522], [294, 520], [294, 539], [5, 542]], { fill: C.wood, w: BG, seed: 'counter-edge', over: 1.2 });
        for (const [x, L] of [[60, 30], [150, 22], [156, 14], [228, 26]]) ln(g, [[x, 531 + (x % 3)], [x + L, 530.6 + (x % 3)]], { w: MID, seed: 'counter-t' + x + L });
        // on the counter: sauce bottles and vinegar at one end, the cones and salt at the other
        for (const [x, c, k] of [[30, C.red, 'k'], [52, C.roadLine, 'm']]) {
            sh(g, [[x - 9, 512, 1], [x - 9.4, 480], [x - 5, 470], [x + 5, 470], [x + 9.4, 480], [x + 9, 512, 1]], { fill: c, w: BG, seed: 'sauce' + k });
            sh(g, [[x - 4, 470, 1], [x - 1.6, 454, 1], [x + 1.6, 454, 1], [x + 4, 470, 1]], { fill: C.white, w: MID, seed: 'sauce-n' + k });
            slab(g, [[x - 6.4, 484], [x + 6.4, 484], [x + 6.4, 500], [x - 6.4, 500]], { fill: C.white, w: MID, seed: 'sauce-l' + k, over: 0.4 });
            ln(g, [[x - 3.6, 492], [x + 3.6, 492]], { w: MID, seed: 'sauce-t' + k });
        }
        sh(g, [[70, 513, 1], [69, 490], [73, 478], [74, 466, 1], [82, 466, 1], [83, 478], [87, 490], [86, 513, 1]], { fill: C.trunk, w: BG, seed: 'vinegar' });
        slab(g, [[73, 459], [83, 459], [83, 467], [73, 467]], { fill: C.grey, w: MID, seed: 'vinegar-cap', over: 0.4 });
        ln(g, [[74, 494], [74.4, 504]], { w: MID, seed: 'vinegar-gl', color: C.white });
        // a stack of paper cones in its holder
        for (let i = 3; i >= 0; i--) {
            const y = 478 - i * 9;
            sh(g, [[224, y, 1], [254, y - 1, 1], [241, y + 40, 1]], { fill: P.cream, w: MID, seed: 'cone' + i });
            ln(g, [[230, y + 3], [239, y + 30]], { w: MID, seed: 'cone-l' + i, color: C.red });
        }
        slab(g, [[226, 494], [254, 493], [252, 513], [229, 513.4]], { fill: C.greyDeep, w: BG, seed: 'cone-holder', over: 0.7 });
        // salt: a big shaker with holes
        sh(g, [[262, 512, 1], [261, 488], [266, 480], [276, 480], [281, 488], [280, 512, 1]], { fill: C.white, w: BG, seed: 'salt' });
        slab(g, [[264, 474], [278, 474], [278, 481], [264, 481]], { fill: C.grey, w: MID, seed: 'salt-cap', over: 0.4 });
        chalk(g, 'S', 267, 506, 17, { color: C.blue, seed: 'salt-s' });
        // a bell to ring for service
        sh(g, [[176, 508, 1], [178, 498], [188, 493], [198, 498], [200, 508, 1]], { fill: C.roadLine, w: MID, seed: 'bell' });
        dot(g, 188, 491, 2.2, C.ink);
    }

    function hutFront(g) {
        const F = HUT.front, { u0, u1, v0, v1 } = HUT.hatch;
        // the wall: teal planks, a kick board, a cream post on the corner
        slab(g, F, { fill: P.hut, w: BG, seed: 'hut-front', over: 1.6 });
        planks(g, F, 10, { seed: 'hut-pl', skip: 0.05 });
        const RN = Motion.rng('hut-nails');
        for (let i = 0; i < 16; i++) dot(g, ...at(F, 0.14 + RN() * 0.78, RN() < 0.5 ? 0.585 + RN() * 0.02 : 0.93 + RN() * 0.015), 1.5, C.ink);
        slab(g, [at(F, 0, 0.956), at(F, 1, 0.956), F[2], F[3]], { fill: P.hutDeep, w: BG, seed: 'hut-kick', over: 1 });
        slab(g, [at(F, 0.955, 0), F[1], F[2], at(F, 0.955, 1)], { fill: P.cream, w: BG, seed: 'hut-post', over: 1.2 });
        // the hatch: the dark of the hut, and what Dot keeps in it
        const hq = [at(F, u0, v0), at(F, u1, v0), at(F, u1, v1), at(F, u0, v1)];
        slab(g, hq, {
            fill: P.inside, w: BG, seed: 'hatch', over: 1.2,
            inside: (c) => {
                // the fryer's hood in the corner, a shelf of jars along the back
                poly(c, [[196, 330], [270, 332], [268, 398], [206, 392]], { fill: C.greyDeep, w: BG, seed: 'hood' });
                ln(c, [[206, 380], [266, 384]], { w: BG, seed: 'hood-l' });
                for (const x of [222, 238, 254]) ln(c, [[x, 350], [x - 1, 368]], { w: MID, seed: 'hood-v' + x });
                slab(c, [[30, 418], [200, 414], [200, 421], [30, 425]], { fill: C.wood, w: BG, seed: 'shelf', over: 0.4 });
                // jars and tins: pickled eggs, onions, a tub of salt, a radio
                slab(c, [[46, 384], [72, 383.4], [73, 417], [46, 418]], { fill: C.glass, w: MID, seed: 'jar-a', over: 0.6 });
                for (const [ex, ey] of [[54, 408], [64, 409], [58, 399], [66, 398]]) sh(c, T.ellipse(ex, ey, 5, 4.2, 0.3, 8), { fill: C.white, w: FAR, seed: 'egg' + ex + ey });
                slab(c, [[44, 378], [75, 377.4], [75, 384], [44, 385]], { fill: C.red, w: MID, seed: 'jar-a-lid', over: 0.5 });
                slab(c, [[82, 392], [104, 391.4], [104, 416.4], [82, 417]], { fill: C.lime, w: MID, seed: 'jar-b', over: 0.6 });
                slab(c, [[81, 386], [105, 385.4], [105, 392], [81, 392.6]], { fill: C.roadLine, w: MID, seed: 'jar-b-lid', over: 0.5 });
                ln(c, [[86, 400], [100, 399.6]], { w: MID, seed: 'jar-b-l' });
                slab(c, [[140, 388], [190, 386], [191, 414], [140, 415.4]], { fill: C.salmon, w: MID, seed: 'radio', over: 0.8 });
                disc(c, 154, 401, 8, 8, { fill: C.ink, w: MID, seed: 'radio-sp', n: 10 });
                for (const y of [394, 400, 406]) ln(c, [[168, y], [186, y - 0.6]], { w: FAR, seed: 'radio-l' + y });
                ln(c, [[186, 387], [198, 362]], { w: MID, seed: 'radio-aer' });
                // a rail of tools: a fish slice, a ladle, a basket
                ln(c, [[40, 352], [190, 350]], { w: BG, seed: 'tool-rail' });
                ln(c, [[60, 352], [60.6, 366]], { w: MID, seed: 'slice-h' });
                slab(c, [[53, 366], [68, 366], [69, 380], [52, 380]], { fill: C.grey, w: MID, seed: 'slice', over: 0.5 });
                for (const x of [57, 61, 65]) ln(c, [[x, 369], [x, 377]], { w: FAR, seed: 'slice-s' + x });
                ln(c, [[96, 351], [96.4, 372]], { w: MID, seed: 'ladle-h' });
                sh(c, [[88, 372, 1], [90, 381], [97, 384], [104, 381], [105, 372, 1]], { fill: C.grey, w: MID, seed: 'ladle' });
                ln(c, [[130, 351], [131, 362]], { w: MID, seed: 'basket-h' });
                const bk = sh(c, [[118, 362, 1], [121, 380], [131, 384], [142, 380], [145, 362, 1]], { fill: C.roadLine, w: MID, seed: 'basket' });
                netting(c, bk, 5, { w: FAR * 0.9, seed: 'basket-n' });
                // a bulb on its flex
                ln(c, [[166, 336], [165, 352]], { w: MID, seed: 'flex' });
                sh(c, T.ellipse(165, 359, 6, 7.4, 0, 9), { fill: C.yellow, w: MID, seed: 'bulb' });
                // today's prices on a card
                slab(c, [[206, 404], [254, 406], [253, 440], [205, 437]], { fill: P.cream, w: MID, seed: 'card', over: 0.8 });
                chalk(c, 'COD', 211, 420, 13, { color: C.ink, seed: 'card-a', rot: 0.04 });
                chalk(c, 'HAKE', 211, 434, 13, { color: C.red, seed: 'card-b', rot: 0.04 });
            },
        });
        // the shutter, rolled up: its last slats and the cord
        const sq = [at(F, u0, v0), at(F, u1, v0), at(F, u1, v0 + 0.045), at(F, u0, v0 + 0.045)];
        slab(g, sq, { fill: C.grey, w: BG, seed: 'shutter', over: 0.6 });
        for (const v of [0.35, 0.68]) ln(g, [at(sq, 0, v), at(sq, 1, v)], { w: MID, seed: 'shutter-s' + v });
        ln(g, [at(sq, 0.93, 1), [at(sq, 0.93, 1)[0] + 1, 408]], { w: MID, seed: 'cord' });
        disc(g, at(sq, 0.93, 1)[0] + 1, 412, 4, 4, { fill: null, w: MID, seed: 'cord-ring', n: 8 });
        // the frame of the hatch
        for (const [a, b, k] of [[at(F, u0 - 0.035, v0 - 0.01), at(F, u0 - 0.035, v1), 'l'], [at(F, u1 + 0.035, v0 - 0.01), at(F, u1 + 0.035, v1), 'r']]) bar(g, a, b, 11, 11, { fill: P.cream, w: BG, seed: 'hatch-j' + k });
        // the counter: its top, its edge, two brackets
        for (const [x, k] of [[46, 'a'], [258, 'b']]) {
            poly(g, [[x - 6, 536], [x + 8, 536], [x + 6, 548], [x - 3, 590], [x - 7, 590]], { fill: P.cream, w: BG, seed: 'bracket' + k });
            ln(g, [[x + 4, 546], [x - 3, 580]], { w: MID, seed: 'bracket-l' + k });
        }
        counterTop(g);
        // under the counter: the hut's fish on a roundel, a poster, a hook with a net of spuds
        disc(g, 138, 630, 50, 49, { fill: P.cream, w: BG, seed: 'roundel', n: 18 });
        disc(g, 138, 630, 42, 41, { fill: null, w: MID, seed: 'roundel-in', n: 18, color: P.coral });
        fish(g, 138, 630, 31, { seed: 'roundel-fish', rot: -0.1 });
        const pq = [[14, 572], [62, 569], [66, 640], [18, 644]];
        slab(g, pq, { fill: C.yellow, w: BG, seed: 'poster', over: 1 });
        chalk(g, '2 FOR', 20, 590, 17, { color: C.red, seed: 'poster-a', rot: -0.05 });
        chalk(g, '1', 30, 632, 44, { color: P.navy, seed: 'poster-b', rot: 0.06 });
        for (const [u, v] of [[0.08, 0.06], [0.92, 0.06]]) dot(g, ...at(pq, u, v), 1.8, C.red);
    }

    function hutTop(g) {
        // the roof's edge
        slab(g, [[-40, 222], [294, 236], [290, 264], [-40, 251]], { fill: P.cream, w: BG, seed: 'hut-fascia', over: 1.6 });
        ln(g, [[-40, 244], [292, 257.6]], { w: MID, seed: 'hut-fascia-l' });
        // the awning: stripes of coral and cream, a scalloped valance, two arms
        const A = [[-40, 268], [296, 277], [336, 318], [-40, 328]];
        const n = 9;
        const stripes = (c, q, clr) => {
            c.fillStyle = clr;
            for (let i = 0; i < n; i += 2) c.fill(T.pathOf([at(q, i / n, -0.1), at(q, (i + 1) / n, -0.1), at(q, (i + 1) / n, 1.1), at(q, i / n, 1.1)]));
        };
        ln(g, [[300, 296], [334, 322]], { w: BG * 1.2, seed: 'awn-arm' });
        ln(g, [[302, 340], [332, 322]], { w: BG * 1.2, seed: 'awn-arm2' });
        // valance first (it hangs behind the awning's front edge)
        const V = [A[3], A[2], [A[2][0] - 2, A[2][1] + 30], [A[3][0], A[3][1] + 32]];
        const vpts = [[...V[0], 1], [...V[1], 1]];
        for (let i = n; i > 0; i--) {
            const a = at(V, i / n, 1), b = at(V, (i - 1) / n, 1);
            vpts.push([a[0], a[1] - 9, 1], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 3]);
        }
        vpts.push([V[3][0], V[3][1] - 9, 1]);
        const vout = sh(g, vpts, { fill: P.cream, w: BG, seed: 'valance', inside: (c) => stripes(c, V, P.coral) });
        for (let i = 1; i < n; i++) ln(g, [at(V, i / n, 0), at(V, i / n, 0.72)], { w: MID, seed: 'val-l' + i });
        ln(g, vout, { w: BG, seed: 'valance', dense: true, closed: true, amp: 0 });
        slab(g, A, { fill: P.cream, w: BG, seed: 'awning', over: 1.4, inside: (c) => stripes(c, A, P.coral) });
        for (let i = 1; i < n; i++) ln(g, [at(A, i / n, 0), at(A, i / n, 1)], { w: MID, seed: 'awn-l' + i });
        // the sign on the roof: a navy board with a cream line, DOT'S CHIPS, bulbs all round
        for (const [x, k] of [[60, 'a'], [280, 'b']]) bar(g, [x, 240], [x + 3, 214], 8, 8, { fill: C.wood, w: BG, seed: 'sign-leg' + k });
        const S = [[16, 84], [330, 104], [322, 236], [20, 226]];
        slab(g, S, { fill: P.navy, w: BG, seed: 'dot-board', over: 2.4 });
        slab(g, [at(S, 0.035, 0.07), at(S, 0.965, 0.07), at(S, 0.965, 0.93), at(S, 0.035, 0.93)], { fill: null, w: MID, seed: 'dot-inner', over: 0.4, color: P.cream });
        g.save();
        g.translate(170, 160);
        g.rotate(0.064);
        T.sign(g, "DOT'S", -64, -14, { size: 60, fill: C.white, drop: P.coral, seed: 'dot-a', tilt: 0.1 });
        T.sign(g, 'CHIPS', 6, 64, { size: 96, fill: C.roadLine, drop: P.coral, seed: 'dot-b', tilt: 0.08, track: 0.06 });
        g.restore();
        // the fish jumps over the board
        fish(g, 236, 96, 62, { seed: 'sign-fish', rot: -0.16 });
        // bulbs
        const bulbs = [];
        for (let i = 0; i <= 11; i++) if (i < 6 || i > 9) bulbs.push(at(S, i / 11, 0));
        for (let i = 1; i <= 4; i++) bulbs.push(at(S, 1, i / 5), at(S, 0, i / 5));
        for (let i = 0; i <= 11; i++) bulbs.push(at(S, i / 11, 1));
        for (const [i, [x, y]] of bulbs.entries()) disc(g, x, y, 5.6, 5.6, { fill: i % 3 === 0 ? C.white : i % 3 === 1 ? C.yellow : P.coral, w: MID, seed: 'bulb' + i, n: 9 });
    }

    function hutFeet(g) {
        // a sack of spuds and two crates by the wall
        slab(g, [[-10, 690], [64, 688], [66, 752], [-10, 756]], { fill: C.wood, w: BG, seed: 'crate-a', over: 1 });
        for (const y of [706, 722, 738]) ln(g, [[-10, y + 1], [65, y - 1]], { w: BG, seed: 'crate-a' + y });
        for (const x of [8, 52]) ln(g, [[x, 690], [x + 1, 754]], { w: BG, seed: 'crate-av' + x });
        slab(g, [[0, 652], [56, 650], [58, 690], [0, 692]], { fill: C.blue, w: BG, seed: 'crate-b', over: 1 });
        slab(g, [[-4, 646], [60, 644], [60, 654], [-4, 656]], { fill: C.blue, w: BG, seed: 'crate-b-rim', over: 0.8 });
        ln(g, [[16, 670], [42, 669]], { w: BG * 1.8, seed: 'crate-b-h', amp: 0 });
        sh(g, [[62, 756, 1], [58, 712], [66, 676], [78, 664, 1], [84, 672], [96, 662, 1], [110, 680], [118, 716], [114, 756, 1]], { fill: P.sack, w: BG, seed: 'sack' });
        ln(g, [[72, 672], [84, 678], [100, 672]], { w: BG, seed: 'sack-tie' });
        chalk(g, 'SPUDS', 68, 728, 19, { color: C.maroon, seed: 'sack-t', rot: -0.06 });
        ln(g, [[66, 700], [70, 690]], { w: MID, seed: 'sack-f1' });
        ln(g, [[108, 742], [111, 730]], { w: MID, seed: 'sack-f2' });
        // the menu: a chalk board on an A frame
        const q = [[214, 640], [292, 636], [302, 760], [206, 766]];
        bar(g, [296, 646], [318, 752], 7, 7, { fill: C.wood, w: BG, seed: 'menu-leg' });
        slab(g, q, { fill: C.wood, w: BG, seed: 'menu-frame', over: 1.4 });
        const b = [at(q, 0.09, 0.07), at(q, 0.91, 0.07), at(q, 0.91, 0.9), at(q, 0.09, 0.9)];
        slab(g, b, { fill: P.chalk, w: MID, seed: 'menu-board', over: 0.5 });
        chalk(g, 'MENU', ...at(b, 0.5, 0.2), 23, { seed: 'menu-a', align: 'center', rot: -0.04, color: C.roadLine });
        ln(g, [at(b, 0.14, 0.26), at(b, 0.86, 0.25)], { w: MID, seed: 'menu-u', color: C.white });
        const rows = [['CHIPS', '1'], ['FISH', '3'], ['PEAS', '1'], ['TEA', '50']];
        for (const [i, [a, p]] of rows.entries()) {
            chalk(g, a, ...at(b, 0.1, 0.44 + i * 0.165), 17, { seed: 'menu-r' + i, rot: -0.04 });
            chalk(g, p, ...at(b, 0.74, 0.44 + i * 0.165), 17, { seed: 'menu-p' + i, rot: -0.04, color: C.salmon });
        }
    }

    function near(g) {
        parasol(g);
        surfboard(g);
        gasBottle(g);
        hutSide(g);
        hutFront(g);
        hutTop(g);
        bin(g);
        hutFeet(g);
    }

    // --- what moves, on twos -------------------------------------------------------------------
    function flag(g, x, y, s, d, o = {}) {
        const { fill = C.red, seed = 'flag', w = FAR, dir = 1, bar: stripe = C.white } = o;
        const ph = (d % 4) * 1.57;
        const top = [], bot = [];
        for (let i = 0; i <= 4; i++) {
            const u = i / 4, wv = Math.sin(u * 5.2 - ph) * 3.4 * s * u;
            top.push([x + dir * u * 34 * s, y + wv + u * 3 * s]);
            bot.push([x + dir * u * 33 * s, y + 20 * s + wv + u * 4 * s]);
        }
        const out = sh(g, [[...top[0], 1], ...top.slice(1, 4), [...top[4], 1], [...bot[4], 1], ...bot.slice(1, 4).reverse(), [...bot[0], 1]], {
            fill, w, seed: seed + (d % 4),
            inside: (c) => {
                c.fillStyle = stripe;
                c.fill(T.pathOf([...top.map(([px, py]) => [px, py + 7.4 * s]), ...bot.map(([px, py]) => [px, py - 7 * s]).reverse()]));
            },
        });
        return out;
    }

    // a string of pennants from a to b, sagging, each one fluttering on its own beat
    function bunting(g, a, b, d, o = {}) {
        const { sag = 14, n = 7, seed = 'bunting', drop = 24 } = o;
        const cols = [C.magenta, C.roadLine, P.fish, C.white, C.blue, C.lime, P.coral];
        const pt = (u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + Math.sin(u * Math.PI) * sag];
        ln(g, Array.from({ length: 9 }, (_, i) => pt(i / 8)), { w: MID, seed });
        for (let i = 0; i < n; i++) {
            const u0 = (i + 0.16) / n, u1 = (i + 0.84) / n, p0 = pt(u0), p1 = pt(u1);
            const sw = Math.sin(d * 0.9 + i * 1.7) * 3.2;
            const tip = [(p0[0] + p1[0]) / 2 + sw, (p0[1] + p1[1]) / 2 + drop + Math.cos(d * 0.9 + i * 1.7) * 1.4];
            sh(g, [[...p0, 1], [...p1, 1], [...tip, 1]], { fill: cols[i % cols.length], w: MID, seed: seed + i });
        }
    }

    function gull(g, x, y, s, d, o = {}) {
        const { flip = false, seed = 'gull' } = o;
        const up = Math.floor(d / 3) % 2 === 0, k = up ? -1 : 0.55;
        g.save();
        g.translate(x, y + (up ? 0 : 1.5));
        g.scale(flip ? -s : s, s);
        const w = FAR / s;
        // far wing, body, near wing
        sh(g, [[2, -1, 1], [8, -4 + k * 5], [17, -3 + k * 9, 1], [9, 1 + k * 3], [3, 2.4, 1]], { fill: C.grey, w, seed: seed + 'fw' + up });
        sh(g, [[-11, 0.6, 1], [-4, -2.6], [5, -3], [10, -1.6], [13.4, 0.2, 1], [9, 1.6], [3, 3.4], [-5, 2.6]], { fill: C.white, w, seed: seed + 'b' });
        sh(g, [[-3, -1, 1], [-8, -5 + k * 6], [-19, -3 + k * 11, 1], [-9, 1 + k * 3.4], [-1, 2.4, 1]], { fill: C.white, w, seed: seed + 'nw' + up });
        dot(g, 9.4, -1.2, 0.8, C.ink);
        sh(g, [[12.4, -0.6, 1], [17, 0.6, 1], [12.6, 1.4, 1]], { fill: C.orange, w: w * 0.8, seed: seed + 'bk' });
        g.restore();
    }

    // --- the foreground: what stands in front of the cast ---------------------------------------
    function lobsterPot(g, x, y, s, o = {}) {
        const { seed = 'pot', flip = false, mesh = P.fish, rot = 0 } = o;
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(flip ? -s : s, s);
        const w = BG / s, e = [96, -24]; // the pot runs back along e
        const arc = (dx, dy, n = 9) => Array.from({ length: n + 1 }, (_, i) => {
            const a = Math.PI * (1 - i / n);
            return [dx + Math.cos(a) * 46, dy - 6 - Math.sin(a) * 64];
        });
        const nearA = arc(0, 0), farA = arc(e[0], e[1]);
        // the far end and the netted body between the hoops
        const bout = T.shape(g, [[-46, 0], ...nearA.slice(0, 6), ...farA.slice(4), [46 + e[0], e[1]], [46, 0]], { fill: mesh, w, seed: seed + 'body', dense: true });
        netting(g, bout, 13, { w: w * 0.85, seed: seed + 'net' });
        T.line(g, bout, { w, seed: seed + 'body', dense: true, closed: true, amp: 0 });
        // the hoops: withies bent over, lashed to the base
        for (const u of [0.5, 1]) T.shape(g, T.ribbon(arc(e[0] * u, e[1] * u, 14).slice(u === 1 ? 6 : 5), 7, 7, { dense: true }), { fill: C.wood, w, seed: seed + 'hoop' + u, dense: true });
        // the near end: netting round the mouth
        const face = [[-46, 0], ...nearA, [46, 0]];
        T.shape(g, face, { fill: mesh, w, seed: seed + 'face', dense: true });
        netting(g, face, 12, { w: w * 0.85, seed: seed + 'facen' });
        T.shape(g, T.ribbon([[-46, 2], ...arc(0, 0, 16), [46, 2]], 8, 8, { dense: true }), { fill: C.wood, w, seed: seed + 'hoop0', dense: true });
        T.shape(g, T.ellipse(2, -30, 19, 21, 0, 14), { fill: C.ink, w, seed: seed + 'mouth' });
        T.shape(g, T.ribbon(T.path(T.ellipse(2, -30, 19, 21, 0, 14), true).concat([[21, -30]]), 5, 5, { dense: true }), { fill: P.rope, w, seed: seed + 'mouth-r', dense: true });
        // the base: slats of wood, weighted
        T.slab(g, [[-52, -4], [50, -4], [52, 8], [-54, 8]], { fill: C.wood, w, seed: seed + 'base', over: 1 });
        T.slab(g, [[50, -4], [50 + e[0], -4 + e[1]], [52 + e[0], 6 + e[1]], [52, 8]], { fill: C.woodDeep, w, seed: seed + 'base-s', over: 1 });
        for (const bx of [-30, -4, 24]) T.line(g, [[bx, -3], [bx - 1, 7]], { w, seed: seed + 'bs' + bx });
        for (const u of [0.3, 0.62]) T.line(g, [[51 + e[0] * u, -3 + e[1] * u], [52 + e[0] * u, 6 + e[1] * u]], { w, seed: seed + 'bt' + u });
        g.restore();
    }

    function coil(g, x, y, s, o = {}) {
        const { fill = C.blue, seed = 'coil' } = o;
        // a tail of rope first, then the turns from the bottom up
        rope(g, [[x + 40 * s, y - 2 * s], [x + 74 * s, y + 6 * s], [x + 104 * s, y - 4 * s], [x + 128 * s, y + 8 * s]], 11 * s, { fill, seed: seed + 't' });
        for (let i = 0; i < 4; i++) {
            const rx = (58 - i * 5) * s, ry = (20 - i * 1.6) * s, cy = y - i * 9 * s;
            const el = T.path(T.ellipse(x + (i % 2) * 2 * s, cy, rx, ry, 0, 18), true);
            rope(g, [...el, el[0]], 11 * s, { fill, seed: seed + i, dense: true });
        }
        sh(g, T.ellipse(x + 2 * s, y - 28 * s, 30 * s, 9 * s, 0, 14), { fill: P.quay, w: BG, seed: seed + 'hole' });
    }

    function bollard(g, x, y, s) {
        const w = BG / s;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        // the line made fast: away over the quay's edge
        rope(g, [[20, -40], [64, -52], [112, -96], [150, -112]], 9, { seed: 'bol-line', w });
        // a bed plate with its bolts, a stout post that waists in, a mushroom head
        T.shape(g, [[-44, 2, 1], [-40, -10, 1], [40, -11, 1], [45, 1, 1], [0, 6]], { fill: P.iron, w, seed: 'fb-foot' });
        for (const bx of [-32, 33]) {
            T.shape(g, T.ellipse(bx, -5, 4.4, 3, 0, 8), { fill: P.ironLight, w: w * 0.9, seed: 'fb-bolt' + bx });
        }
        T.shape(g, [[-25, -9, 1], [-21, -30], [-19, -58], [-22, -80, 1], [22, -80, 1], [19, -58], [21, -30], [25, -10, 1], [0, -6]], { fill: P.ironLight, w, seed: 'fb-post' });
        // three turns of rope round the waist
        for (let k = 0; k < 3; k++) {
            const yy = -26 - k * 11.5;
            rope(g, [[-25, yy + 1], [-10, yy + 6], [10, yy + 6], [25, yy]], 11, { seed: 'fb-rope' + k, w });
        }
        T.shape(g, [[-22, -78, 1], [-34, -84], [-37, -98], [-28, -112], [0, -119], [28, -112], [37, -98], [34, -84], [22, -78, 1]], { fill: P.iron, w, seed: 'fb-head' });
        T.line(g, [[-35, -93], [-18, -86], [18, -86], [35, -93]], { w, seed: 'fb-head-l' });
        T.line(g, [[-17, -110], [-2, -114]], { w, seed: 'fb-gl', color: C.white });
        T.line(g, [[-27, -102], [-23, -106]], { w, seed: 'fb-gl2', color: C.white });
        // the cross pin, rust
        for (const k of [-1, 1]) T.shape(g, T.ellipse(k * 26, -66, 7, 6, 0, 9), { fill: P.iron, w, seed: 'fb-pin' + k });
        for (const [px, py] of [[-10, -70], [9, -62], [-3, -14]]) T.line(g, [[px, py], [px + 0.6, py + 7]], { w, seed: 'fb-r' + px });
        g.restore();
    }

    function cone(g, x, y, s) {
        const w = BG / s;
        g.save();
        g.translate(x, y);
        g.rotate(-0.07);
        g.scale(s, s);
        T.shape(g, [[-34, 0, 1], [-30, -9, 1], [30, -10, 1], [35, -1, 1], [0, 5]], { fill: C.orange, w, seed: 'cone-base' });
        T.shape(g, [[-22, -8, 1], [-7, -92], [0, -97], [7, -92], [22, -9, 1], [0, -4]], {
            fill: C.orange, w, seed: 'cone-body',
            inside: (c) => {
                c.fillStyle = C.white;
                c.fill(T.pathOf([[-30, -42], [30, -43], [30, -27], [-30, -25]]));
                c.fill(T.pathOf([[-30, -70], [30, -71], [30, -60], [-30, -58]]));
            },
        });
        for (const [a, b] of [[[-16.4, -42], [16.4, -43]], [[-19.4, -25.6], [19.4, -27]], [[-11.4, -70], [11.4, -71]], [[-13.6, -58.4], [13.6, -60]]]) T.line(g, [a, [0, (a[1] + b[1]) / 2 + 3], b], { w, seed: 'cone-b' + a[1] });
        T.line(g, [[-6, -84], [-9, -76]], { w, seed: 'cone-dent' });
        T.line(g, [[8, -20], [11, -13]], { w, seed: 'cone-scuff' });
        g.restore();
    }

    function foreground(g) {
        lobsterPot(g, 208, 838, 0.82, { seed: 'pot-b', mesh: C.orange, flip: true, rot: 0.04 });
        coil(g, 262, 884, 1, { seed: 'coil' });
        lobsterPot(g, 70, 884, 1.12, { seed: 'pot-a' });
        // a float on its line beside the pots
        ln(g, [[150, 880], [170, 868], [186, 876]], { w: BG, seed: 'float-line' });
        cone(g, 1392, 892, 1);
        bollard(g, 1508, 890, 1.1);
    }

    // --- the two calls ---------------------------------------------------------------------------
    function far(g) {
        g.fillStyle = C.sky;
        g.fillRect(0, 0, W, H);
        sea(g);
        land(g);
        harbour(g);
        pier(g);
        quay(g);
    }

    function back(g, env, t) {
        const d = T.drawing(t);
        Motion.sprite('harbor-back', { x: 0, y: 0, w: W, h: H }, env.k, far).draw(g);
        // flags: the trawlers' ensigns at the heads of their stern staffs, the pier's
        flag(g, 591, 527, 0.62, d, { seed: 'flag-a', dir: -1 });
        flag(g, 995, 541.2, 0.42, d + 2, { seed: 'flag-b', fill: C.blue });
        flag(g, pp(0.262, 0)[0] + 4, PV[1] - 168, 0.8, d + 1, { seed: 'flag-p', fill: P.fish, bar: C.roadLine, dir: -1 });
        // the palm by the hut, swaying
        T.palm(g, 470, 651, 428, { seed: 'palm-near', lean: -46, sway: Math.sin(d * 0.42) * 0.028, fronds: 7, w: BG });
        Motion.sprite('harbor-near', { x: 0, y: 0, w: 640, h: H }, env.k, near).draw(g);
        bunting(g, [-14, 232], [146, 240], d, { n: 5, seed: 'bunt-a' });
        bunting(g, [146, 240], [296, 250], d + 3, { n: 5, seed: 'bunt-b' });
        // gulls, each on its own beat
        for (const [i, [x, y, s, flip]] of [[650, 110, 1.5, 0], [452, 62, 1.25, 1], [948, 318, 1.05, 0], [1500, 300, 0.95, 1], [760, 44, 0.9, 1], [560, 356, 0.85, 0]].entries()) gull(g, x + Math.sin(d * 0.21 + i) * 3, y + Math.cos(d * 0.3 + i * 2) * 2.4, s, d + i * 2, { flip: !!flip, seed: 'gull' + i });
    }

    // the counter again, over whoever is serving (draw them clipped to AT.hatch first)
    function counter(g, env) {
        Motion.sprite('harbor-counter', { x: 0, y: 440, w: 310, h: 110 }, env.k, counterTop).draw(g);
    }

    function fore(g, env) {
        Motion.sprite('harbor-fore', { x: 0, y: 700, w: W, h: 200 }, env.k, foreground).draw(g);
    }

    // the pier's lines at a given x (it runs to PV): where a character would stand or grind
    const pierY = (x, Y) => PV[1] + ((x - PV[0]) / 626) * Y;
    window.Harbor = {
        back, fore, counter, GROUND,
        AT: {
            horizon: 552, vanish: VP, lip: LIP, crest: CREST, shore: SHORE, crestY, shoreY,
            calm: { x0: 330, x1: 1270, y0: 150, y1: GROUND },
            hut: HUT, hatch: { x0: 34, x1: 260, y0: 346, y1: 516 }, counter: { x0: 4, x1: 294, y: 506 },
            quayRail: { x0: 950, x1: 1092, y: 607 }, lamp: [1118, 668],
            pier: { vanish: PV, at: pp, x0: 1144, deckY: (x) => pierY(x, PIER.deck), railY: (x) => pierY(x, PIER.railTop), ...PIER },
            fore: { pots: [12, 760, 250, 896], coil: [200, 846, 396, 900], cone: [1356, 795, 1428, 896], bollard: [1458, 760, 1560, 896] },
        },
    };
})();
