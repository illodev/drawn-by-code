// The road: the film's main set. A side view that scrolls to the left while the cars hold the
// middle of the frame, built in layers with their own share of the motion (sky and sun barely
// move, mesas a little, the verge almost with the road, the near verge faster than the road).
// One world, three weathers: a sunny day, three days of rain, a night with a full moon.
//
// Everything is placed by cell along the road (seeded by the cell's number), so the world is
// endless and the same X always shows the same things. X is the distance driven, in logical
// units. Global: World. Depends on Cereal.
const World = (() => {
    const C = Cereal, K = C.COL;
    const HOR = 690, ROAD0 = 822, ROAD1 = 944; // the horizon, the road's far and near edges
    const LANE = 905; // where wheels touch the road

    const THEMES = {
        day: {
            skyA: K.sky, skyB: '#8fe6f0', cloud: '#fffdf4', cloudUnder: '#cfe8ff',
            mesa: K.purple, mesaTop: K.violet, mesaSide: '#5a2fb5', dune: '#ff9d3c', duneLine: '#e8761f',
            sand: '#ffc21f', sandD: '#e09a12', road: '#2f2a6b', roadLine: K.yellow, roadEdge: '#fffdf4', crack: '#211c57',
            cactus: K.teal, cactusTop: K.aqua, cactusSide: K.tealDeep, rock: '#b388f0', rockSide: '#7d47e1', bush: K.green, bushD: '#1f9a50',
            wood: '#7b4526', woodSide: '#55301b', wire: K.ink, sign: K.yellow, signInk: K.ink, bone: '#fffdf4', near: '#c2470f',
        },
        rain: {
            skyA: '#7f88a8', skyB: '#8a93b3', cloud: '#565d7c', cloudUnder: '#434966',
            mesa: '#666c8c', mesaTop: '#8088a8', mesaSide: '#4f5574', dune: '#7a8099', duneLine: '#666c85',
            sand: '#9aa0b5', sandD: '#7f859c', road: '#3a3d55', roadLine: '#c9cde0', roadEdge: '#c9cde0', crack: '#2b2e42',
            cactus: '#6f8f90', cactusTop: '#93adad', cactusSide: '#55706f', rock: '#8a8fa8', rockSide: '#666c85', bush: '#6f8a7a', bushD: '#566b5f',
            wood: '#5d6175', woodSide: '#45485a', wire: '#2b2e42', sign: '#b9bdcc', signInk: '#2b2e42', bone: '#d5d8e2', near: '#4f5574',
        },
        night: {
            skyA: '#1b1750', skyB: '#231e62', cloud: '#3b2fa0', cloudUnder: '#2c2380',
            mesa: '#5a2fb5', mesaTop: K.purple, mesaSide: '#3b1f85', dune: '#3b2fa0', duneLine: '#2c2380',
            sand: '#4a3fc0', sandD: '#3b2fa0', road: '#15123a', roadLine: K.yellow, roadEdge: '#a888f5', crack: '#0d0b26',
            cactus: K.tealDeep, cactusTop: K.teal, cactusSide: '#0a6a64', rock: '#7d47e1', rockSide: '#5a2fb5', bush: '#0e8f86', bushD: '#0a6a64',
            wood: '#55301b', woodSide: '#3a2012', wire: '#0d0b26', sign: K.gold, signInk: K.ink, bone: '#dcd6f7', near: '#0d0b26',
        },
    };

    // Runs fn(i, x, r) for every cell of a layer that can be on screen. factor: the layer's
    // share of the motion; spacing: the cell's length; margin: how far off screen to draw.
    function cells(X, factor, spacing, margin, seed, fn) {
        const x0 = X * factor;
        for (let i = Math.floor((x0 - margin) / spacing); i <= Math.ceil((x0 + 1000 + margin) / spacing); i++) {
            const r = Motion.rng(seed + ':' + i);
            fn(i, i * spacing + r() * spacing * 0.6 - x0, r);
        }
    }

    // --- pieces ------------------------------------------------------------------------------
    function cloud(g, W, x, y, s) {
        const lobes = [[-0.9, 0.05, 0.42], [-0.42, -0.2, 0.52], [0.12, -0.34, 0.6], [0.66, -0.12, 0.46], [1.02, 0.1, 0.34]];
        const body = new Path2D();
        for (const [lx, ly, lr] of lobes) body.arc(x + lx * s, y + ly * s, lr * s, 0, C.TAU);
        body.rect(x - 1.1 * s, y, 2.3 * s, 0.32 * s);
        g.save();
        g.strokeStyle = K.ink;
        g.lineWidth = 8;
        g.lineJoin = 'round';
        g.stroke(body);
        g.fillStyle = W.cloud;
        g.fill(body);
        g.clip(body);
        g.fillStyle = W.cloudUnder;
        g.fillRect(x - 1.4 * s, y + 0.1 * s, 2.8 * s, 0.4 * s);
        g.restore();
    }

    // A mesa or a butte: sloped walls, a ledge half way up, a flat top, strata.
    function mesa(g, W, x, w, h, dep) {
        const y0 = HOR + 6, yt = HOR - h, yl = HOR - h * 0.5;
        const pts = [[x, y0], [x + w * 0.07, yl], [x + w * 0.15, yl - h * 0.05], [x + w * 0.2, yt], [x + w * 0.8, yt], [x + w * 0.85, yl - h * 0.05], [x + w * 0.93, yl], [x + w, y0]];
        C.prism(g, pts, [dep, -dep * 0.66], { front: W.mesa, top: W.mesaTop, side: W.mesaSide }, { lw: 4 });
        g.save();
        C.trace(g, pts);
        g.clip();
        for (const k of [0.2, 0.36, 0.66, 0.84]) C.poly(g, [[x, yt + h * k], [x + w, yt + h * k]], { ink: W.mesaSide, lw: 3, close: false });
        C.poly(g, [[x + w * 0.07, yl], [x + w * 0.93, yl]], { ink: W.mesaTop, lw: 4, close: false });
        g.restore();
        C.poly(g, pts, { ink: K.ink, lw: 4 });
    }

    // A saguaro: a trunk and two arms, ribbed. (x, y) is its foot.
    function cactus(g, W, x, y, h, flip = 1) {
        const w = h * 0.2, Dd = [h * 0.045, -h * 0.03];
        const part = (px, py, pw, ph) => {
            g.lineWidth = 3;
            g.strokeStyle = K.ink;
            g.beginPath();
            g.roundRect(px + Dd[0], py + Dd[1], pw, ph, [pw / 2, pw / 2, 0, 0]);
            g.fillStyle = W.cactusSide;
            g.fill();
            g.stroke();
            g.beginPath();
            g.roundRect(px, py, pw, ph, [pw / 2, pw / 2, 0, 0]);
            g.fillStyle = W.cactus;
            g.fill();
            g.stroke();
            C.poly(g, [[px + pw * 0.35, py + pw * 0.4], [px + pw * 0.35, py + ph - 3]], { ink: W.cactusTop, lw: 2.2, close: false });
            C.poly(g, [[px + pw * 0.68, py + pw * 0.45], [px + pw * 0.68, py + ph - 3]], { ink: W.cactusSide, lw: 2.2, close: false });
        };
        const a1 = x - flip * w * 1.55, a2 = x + flip * w * 1.5;
        part(a1 - w * 0.36, y - h * 0.72, w * 0.72, h * 0.3);
        C.poly(g, [[a1 - w * 0.36, y - h * 0.44], [x, y - h * 0.44], [x, y - h * 0.3], [a1 + w * 0.1, y - h * 0.3], [a1 - w * 0.36, y - h * 0.36]], { fill: W.cactus, ink: K.ink, lw: 3 });
        part(a2 - w * 0.36, y - h * 0.86, w * 0.72, h * 0.3);
        C.poly(g, [[a2 + w * 0.36, y - h * 0.58], [x, y - h * 0.58], [x, y - h * 0.44], [a2 - w * 0.1, y - h * 0.44], [a2 + w * 0.36, y - h * 0.5]], { fill: W.cactus, ink: K.ink, lw: 3 });
        part(x - w / 2, y - h, w, h);
    }

    function rock(g, W, x, y, s) {
        const pts = [[-0.5, 0], [-0.42, -0.34], [-0.12, -0.56], [0.26, -0.48], [0.5, -0.2], [0.52, 0]].map(([px, py]) => [x + px * s, y + py * s]);
        C.prism(g, pts, [s * 0.14, -s * 0.09], { front: W.rock, top: W.rock, side: W.rockSide }, { lw: 3 });
        C.poly(g, [[x - 0.2 * s, y - 0.36 * s], [x + 0.06 * s, y - 0.2 * s], [x + 0.02 * s, y]], { ink: W.rockSide, lw: 2.4, close: false });
    }

    function bush(g, W, x, y, s) {
        const body = new Path2D();
        for (const [lx, ly, lr] of [[-0.42, -0.2, 0.3], [0, -0.38, 0.38], [0.42, -0.22, 0.3]]) body.arc(x + lx * s, y + ly * s, lr * s, 0, C.TAU);
        body.rect(x - 0.7 * s, y - 0.2 * s, 1.4 * s, 0.2 * s);
        g.save();
        g.strokeStyle = K.ink;
        g.lineWidth = 6;
        g.lineJoin = 'round';
        g.stroke(body);
        g.fillStyle = W.bush;
        g.fill(body);
        g.clip(body);
        g.fillStyle = W.bushD;
        g.fillRect(x - s, y - 0.16 * s, 2 * s, 0.2 * s);
        g.restore();
    }

    // A steer's skull, the desert's own Memphis shape.
    function skull(g, W, x, y, s) {
        for (const sx of [-1, 1]) C.poly(g, C.curve([[x + sx * 0.16 * s, y - 0.5 * s], [x + sx * 0.5 * s, y - 0.56 * s], [x + sx * 0.66 * s, y - 0.84 * s], [x + sx * 0.5 * s, y - 0.66 * s], [x + sx * 0.18 * s, y - 0.4 * s]], true, 5), { fill: W.bone, ink: K.ink, lw: 2.6 });
        C.poly(g, [[x - 0.2 * s, y - 0.56 * s], [x + 0.2 * s, y - 0.56 * s], [x + 0.17 * s, y - 0.26 * s], [x + 0.1 * s, y], [x - 0.1 * s, y], [x - 0.17 * s, y - 0.26 * s]], { fill: W.bone, ink: K.ink, lw: 2.6 });
        g.fillStyle = K.ink;
        for (const sx of [-1, 1]) {
            g.beginPath();
            g.ellipse(x + sx * 0.09 * s, y - 0.4 * s, 0.05 * s, 0.065 * s, 0, 0, C.TAU);
            g.fill();
        }
    }

    // A small roadside sign on a post: a shield with a number, or a diamond with a mark.
    function sign(g, W, x, y, kind) {
        C.box(g, x - 4, y - 96, 8, 96, [4, -2.7], { front: W.wood, top: W.wood, side: W.woodSide }, { lw: 2.6 });
        if (kind === 0) {
            const sh = [[x - 26, y - 150], [x + 26, y - 150], [x + 26, y - 112], [x, y - 88], [x - 26, y - 112]];
            C.prism(g, sh, [4, -2.7], { front: '#fffdf4', top: '#fffdf4', side: '#c9cde0' }, { lw: 3 });
            g.fillStyle = K.ink;
            g.font = '34px "Anton"';
            g.textAlign = 'center';
            g.textBaseline = 'alphabetic';
            g.fillText('66', x, y - 108);
        } else {
            const dia = [[x, y - 164], [x + 36, y - 128], [x, y - 92], [x - 36, y - 128]];
            C.prism(g, dia, [4, -2.7], { front: W.sign, top: W.sign, side: '#e0a800' }, { lw: 3 });
            // a bend ahead
            C.poly(g, [[x - 10, y - 110], [x - 10, y - 130], [x + 8, y - 144]], { ink: W.signInk, lw: 6, close: false });
            C.poly(g, [[x + 1, y - 148], [x + 14, y - 148], [x + 12, y - 135]], { fill: W.signInk, ink: W.signInk, lw: 2 });
        }
    }

    // A telephone pole; wires are drawn between neighbours by the layer.
    const POLE_H = 250;
    function pole(g, W, x, y) {
        C.box(g, x - 6, y - POLE_H, 12, POLE_H, [5, -3.4], { front: W.wood, top: W.wood, side: W.woodSide }, { lw: 3 });
        C.box(g, x - 46, y - POLE_H + 22, 92, 10, [5, -3.4], { front: W.wood, top: W.wood, side: W.woodSide }, { lw: 3 });
        for (const dx of [-36, 36]) C.box(g, x + dx - 5, y - POLE_H + 10, 10, 12, [3, -2], { front: '#8cefe6', top: '#8cefe6', side: '#17b8a6' }, { lw: 2.4 });
    }

    // --- layers ------------------------------------------------------------------------------
    /**
     * Everything behind the cars. o: { sun: { x, y, r, shades } | null, moon: { x, y, r } | null,
     * stars (0..1), burst: [cx, cy] the sunburst's centre,
     * clear: [x0, x1] keeps the far verge free of cacti, rocks and signs between those screen x
     *        (where a shot lays something of its own across it: a side road, a pit) }
     */
    function back(g, t, X, theme, o = {}) {
        const W = THEMES[theme], d = C.drawing(t);
        const [bx, by] = o.burst ?? [500, HOR + 40];
        C.sunburst(g, bx, by, { n: 12, rot: t * 0.06, a: W.skyA, b: W.skyB });
        if (o.stars) {
            const r = Motion.rng('stars');
            for (let i = 0; i < 46; i++) {
                const x = r() * 1000, y = r() * (HOR - 60), s = 5 + r() * 9, ph = Math.floor(r() * 12);
                const tw = (d + ph) % 12 < 2 ? 1.5 : 1;
                C.sparkle(g, x - ((X * 0.01) % 1000 + 1000) % 1000 + (x < ((X * 0.01) % 1000 + 1000) % 1000 ? 1000 : 0), y, s * tw * o.stars, { color: i % 5 ? '#fffbe8' : K.yellow });
            }
        }
        if (o.moon) {
            const { x, y, r } = o.moon;
            g.save();
            g.translate(x - X * 0.006, y);
            g.beginPath();
            g.arc(0, 0, r, 0, C.TAU);
            g.fillStyle = '#fffbe8';
            g.fill();
            g.save();
            g.clip();
            g.fillStyle = '#dcd6f7';
            for (const [cx, cy, cr] of [[-0.42, -0.26, 0.26], [0.36, -0.5, 0.15], [0.44, 0.28, 0.3], [-0.5, 0.42, 0.14], [0.02, 0.06, 0.1], [-0.08, 0.74, 0.17]]) {
                g.beginPath();
                g.ellipse(cx * r, cy * r, cr * r, cr * r * 0.84, -0.3, 0, C.TAU);
                g.fill();
            }
            g.restore();
            g.beginPath();
            g.arc(0, 0, r, 0, C.TAU);
            g.strokeStyle = K.ink;
            g.lineWidth = Math.max(4, r * 0.03);
            g.stroke();
            g.restore();
        }
        if (o.sun) {
            // the sun wears shades too
            const { x, y, r } = o.sun, bob = d % 4 < 2 ? 0 : 3;
            C.burst(g, x - X * 0.004, y, { r0: r * 1.18, r1: r * 1.5, n: 14, seed: 'sun', jitter: 0.08, rot: d % 2 ? 0.06 : 0, fill: K.gold, ink: K.ink, lw: 4 });
            g.save();
            g.translate(x - X * 0.004, y + bob);
            g.beginPath();
            g.arc(0, 0, r, 0, C.TAU);
            g.fillStyle = K.yellow;
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = 4;
            g.stroke();
            for (const sx of [-1, 1]) {
                const cx = sx * r * 0.36;
                C.poly(g, [[cx - r * 0.3, -r * 0.22], [cx + r * 0.3, -r * 0.22], [cx + r * 0.25, r * 0.08], [cx + r * 0.12, r * 0.16], [cx - r * 0.12, r * 0.16], [cx - r * 0.25, r * 0.08]], { fill: '#1d1626', ink: K.ink, lw: 3 });
                C.poly(g, [[cx - r * 0.16, r * 0.04], [cx - r * 0.02, -r * 0.12]], { ink: '#ffffff', lw: 3, close: false });
            }
            C.poly(g, [[-r * 0.1, -r * 0.18], [r * 0.1, -r * 0.18]], { ink: K.ink, lw: 5, close: false });
            C.poly(g, [[-r * 0.3, r * 0.42], [-r * 0.08, r * 0.52], [r * 0.14, r * 0.5], [r * 0.34, r * 0.36]], { ink: K.ink, lw: 4, close: false });
            g.restore();
        }
        // clouds drift by, but never over the sun or the moon
        const keep = [o.sun && [o.sun.x - X * 0.004, o.sun.r * 1.6], o.moon && [o.moon.x - X * 0.006, o.moon.r * 1.15]].filter(Boolean);
        cells(X, 0.035, 430, 260, 'cloud', (i, x, r) => {
            const y = 130 + r() * 230, s = 60 + r() * 50;
            if (keep.some(([kx, kr]) => Math.abs(x - kx) < kr + s * 1.3)) return;
            cloud(g, W, x, y, s);
        });
        cells(X, 0.12, 470, 420, 'mesa', (i, x, r) => {
            const tall = r() < 0.3;
            mesa(g, W, x, tall ? 110 + r() * 50 : 210 + r() * 160, tall ? 190 + r() * 70 : 90 + r() * 90, 30 + r() * 20);
        });
        // dunes along the horizon
        const dune = [[-20, ROAD0]];
        for (let x = -20; x <= 1020; x += 20) {
            const wx = x + X * 0.25;
            dune.push([x, HOR - 16 - 12 * Math.sin(wx / 130) - 7 * Math.sin(wx / 47 + 1)]);
        }
        dune.push([1020, ROAD0]);
        C.poly(g, dune, { fill: W.dune, lw: 0 });
        C.poly(g, dune.slice(1, -1), { ink: K.ink, lw: 4, close: false });
        cells(X, 0.25, 210, 80, 'dunemark', (i, x, r) => C.poly(g, [[x, HOR + 6 + r() * 14], [x + 40 + r() * 50, HOR + 6 + r() * 14]], { ink: W.duneLine, lw: 3, close: false }));
        // the far verge
        g.fillStyle = W.sand;
        g.fillRect(-20, HOR + 34, 1040, ROAD0 - HOR);
        const edge = [];
        for (let x = -20; x <= 1020; x += 20) {
            const wx = x + X * 0.5;
            edge.push([x, HOR + 36 + 4 * Math.sin(wx / 90)]);
        }
        C.poly(g, edge, { ink: K.ink, lw: 4, close: false });
        cells(X, 0.6, 130, 60, 'ripple', (i, x, r) => C.poly(g, [[x, HOR + 52 + r() * 24], [x + 18 + r() * 30, HOR + 52 + r() * 24]], { ink: W.sandD, lw: 3, close: false }));
        // poles and their wires (two wires that sag between crossarms)
        const SP = 430, PF = 0.86, py = ROAD0 - 26;
        const px = (i) => i * SP - X * PF;
        for (let i = Math.floor((X * PF - 200) / SP) - 1; i <= Math.ceil((X * PF + 1200) / SP); i++) {
            for (const dx of [-36, 36]) {
                g.beginPath();
                g.moveTo(px(i) + dx, py - POLE_H + 8);
                g.quadraticCurveTo((px(i) + px(i + 1)) / 2 + dx, py - POLE_H + 62, px(i + 1) + dx, py - POLE_H + 8);
                g.strokeStyle = W.wire;
                g.lineWidth = 2.6;
                g.stroke();
            }
        }
        // things on the verge, far ones first
        const things = [];
        cells(X, 0.8, 250, 160, 'verge', (i, x, r) => {
            const k = r(), y = HOR + 62 + r() * 40;
            if (o.clear && x > o.clear[0] && x < o.clear[1]) return; // something of the shot's own lies across the verge here
            things.push([y, () => {
                if (k < 0.4) cactus(g, W, x, y, 96 + r() * 60, r() < 0.5 ? 1 : -1);
                else if (k < 0.58) rock(g, W, x, y, 50 + r() * 40);
                else if (k < 0.74) bush(g, W, x, y, 34 + r() * 22);
                else if (k < 0.84) skull(g, W, x, y, 44);
            }]);
        });
        for (let i = Math.floor((X * PF - 200) / SP); i <= Math.ceil((X * PF + 1200) / SP); i++) things.push([py, () => pole(g, W, px(i), py)]);
        cells(X, 0.92, 760, 80, 'sign', (i, x, r) => {
            if (o.clear && x > o.clear[0] && x < o.clear[1]) return;
            things.push([ROAD0 - 10, () => sign(g, W, x, ROAD0 - 10, i % 2)]);
        });
        things.sort((a, b2) => a[0] - b2[0]).forEach(([, fn]) => fn());
        // the road
        g.fillStyle = W.road;
        g.fillRect(-20, ROAD0, 1040, ROAD1 - ROAD0);
        C.poly(g, [[-20, ROAD0], [1020, ROAD0]], { ink: K.ink, lw: 4, close: false });
        C.poly(g, [[-20, ROAD0 + 12], [1020, ROAD0 + 12]], { ink: W.roadEdge, lw: 3.4, close: false });
        cells(X, 1, 170, 120, 'dash', (i) => {
            const x = i * 170 - X;
            C.poly(g, [[x, 866], [x + 86, 866]], { ink: W.roadLine, lw: 8, close: false });
        });
        cells(X, 1, 940, 160, 'crack', (i, x, r) => C.poly(g, [[x, ROAD0 + 30 + r() * 20], [x + 26, ROAD0 + 46 + r() * 20], [x + 40, ROAD0 + 40 + r() * 20], [x + 70, ROAD0 + 64 + r() * 20]], { ink: W.crack, lw: 3, close: false }));
        C.poly(g, [[-20, ROAD1 - 12], [1020, ROAD1 - 12]], { ink: W.roadEdge, lw: 3.4, close: false });
        // the near verge
        g.fillStyle = W.sand;
        g.fillRect(-20, ROAD1, 1040, 240); // deep enough for a camera that looks a little lower
        C.poly(g, [[-20, ROAD1], [1020, ROAD1]], { ink: K.ink, lw: 4, close: false });
        cells(X, 1.15, 110, 60, 'pebble', (i, x, r) => {
            const y = ROAD1 + 14 + r() * 36;
            if (r() < 0.5) C.poly(g, [[x, y], [x + 16 + r() * 26, y]], { ink: W.sandD, lw: 3.4, close: false });
            else {
                g.beginPath();
                g.ellipse(x, y, 7 + r() * 5, 4 + r() * 3, 0, 0, C.TAU);
                g.fillStyle = W.sandD;
                g.fill();
            }
        });
    }

    // What passes in front of the cars: now and then something near, big and fast.
    // o.skip(i): return true for a cell whose object would cross the action (i is the cell's number).
    function front(g, t, X, theme, o = {}) {
        const W = THEMES[theme];
        cells(X, 1.6, 1900, 400, 'near', (i, x, r) => {
            if (o.skip && o.skip(i)) return;
            const k = r();
            if (k < 0.45) cactus(g, { ...W, cactus: W.near, cactusTop: W.near, cactusSide: W.near }, x, 1040, 330, 1);
            else if (k < 0.75) bush(g, { ...W, bush: W.near, bushD: W.near }, x, 1030, 130);
        });
    }

    // Rain: slanted streaks that fall on twos, and splashes on the road.
    function rain(g, t, k = 1) {
        const d = C.drawing(t), r = Motion.rng('rain');
        g.lineCap = 'round';
        for (let i = 0; i < 70 * k; i++) {
            const x0 = r() * 1300, y0 = r() * 1100, sp = 1 + r() * 0.5, len = 40 + r() * 34;
            const y = (y0 + d * 96 * sp) % 1100 - 50, x = x0 - (((y0 + d * 96 * sp) % 1100) * 0.32);
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x - len * 0.32, y + len);
            g.strokeStyle = i % 3 ? '#c9cde0' : '#e4e7f2';
            g.lineWidth = 3;
            g.stroke();
        }
        const r2 = Motion.rng('splash');
        for (let i = 0; i < 16 * k; i++) {
            const x = r2() * 1000, y = ROAD0 + 14 + r2() * (ROAD1 - ROAD0 - 22), ph = Math.floor(r2() * 5);
            const f = (d + ph) % 5;
            if (f > 1) continue;
            const s = 7 + f * 7;
            C.poly(g, [[x - s, y - s * 0.7], [x - s * 0.3, y], [x + s * 0.3, y], [x + s, y - s * 0.7]], { ink: '#e4e7f2', lw: 2.6, close: false });
        }
    }

    return { THEMES, HOR, ROAD0, ROAD1, LANE, cells, back, front, rain, cactus, cloud, mesa, rock, bush, skull, sign, pole };
})();
