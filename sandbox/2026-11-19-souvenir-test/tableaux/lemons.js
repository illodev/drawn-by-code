// Picture 2 · The lemon tree («un huerto claro donde madura el limonero», Machado), in the
// brush manner: no contour line, fruit and leaves modelled with light, blossom on top.
// Tableau.lemons(z) → the layers of the picture, its main plane at depth z.
//
// Every layer is `brush: false` for the rig: the strokes are in the paint already.
//
// Six depths: a plate that closes the tree, a far and a middle layer stepped back in the
// air, the main layer (the only one in focus), a front layer just this side of it and a
// near one that leaves the frame blurred. The camera arrives on the axis (the origin of
// every layer); GAP is the darker rest a little off it, between two lemons, that the next
// dive goes through: in the main layer nothing is painted within 131 units of the origin
// (the free oval is about 270 wide and 370 tall about (7, −30): x −128 … 142, y −218 … 151),
// and the layers behind are darkest there. Coordinates are those of the main layer, whose
// frame at arrival is 1600 × 900 about the origin; another layer `dz` behind it lines up
// with it at 1 / K(dz).
//
// What a second look finds (main layer unless said): a goldfinch on the twig at (−452, −108),
// its feather below it; a bee feeding at (652, −292) and one arriving (front layer); a snail
// and eight ants on the big bough; a ladybird at (468, 62); a web in the fork at (478, −176);
// a swallowtail behind the leaves (middle layer); dew on both lemons by the rest and on the
// leaves of the sprays; fallen petals, two dead leaves, a pruned stub, thorns, leaf scars.
// The creatures and the lens drops are `Fauna`'s when that file is loaded; without it the
// picture still has its own drops (`Citrus.drop`).
window.Tableau = window.Tableau || {};
Tableau.lemons = (z0) => {
    const S = Souvenir, C = Citrus;
    const TAU = Math.PI * 2;
    const fauna = (name) => (typeof Fauna !== 'undefined' && typeof Fauna[name] === 'function' ? Fauna : null);
    const GAP = { x: 15, y: 5, r: 125 };
    const K = (dz) => 1010 / (1010 + dz); // how much smaller a layer `dz` behind the main one is seen
    const gapAt = (dz, pad = 0) => ({ x: GAP.x / K(dz), y: GAP.y / K(dz), r: (GAP.r + pad) / K(dz) });
    const Q = (res, q) => Math.max(0.5, Math.round(res * q * 4) / 4); // a sprite's pixels per unit, in quarter steps
    // Layers that the lens blurs are painted smaller (the rig's `res`), and their sprites
    // with them: two classes of sprite in all, shared between the layers of a class.
    const SOFT = { plate: 0.55, far: 0.7, near: 0.6 };
    const canvas = (w, h) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        return c;
    };
    const turn = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];

    // Leaves are drawn from a pool: every kind has a few drawings for each of the eight
    // lights, so no two leaves at different angles are the same drawing.
    const POOL = { sun: 6, mid: 7, deep: 7, under: 2, young: 3, bronze: 2, old: 2, back: 3 };
    const OFF = { sun: 0, mid: 10, deep: 10, under: 20, young: 30, bronze: 40, old: 50, back: 60 };
    const leafV = (kind, rot, pick) => C.lkey(rot) * 100 + OFF[kind] + (pick % POOL[kind]);

    // ------------------------------------------------------------------ a layer's painter
    // soft: the layer's own `res` if the lens blurs it (its sprites are then of the small class)
    // gap: the rest to keep clear, in this layer's units
    function painter(g, res, soft = 0, gap = null) {
        const full = soft ? res / soft : res, q = soft ? 0.5 : 1, rl = Q(full, 1.5 * q), P = { g, res, gap };
        P.clear = (x, y, pad = 0) => !gap || Math.hypot(x - gap.x, y - gap.y) > gap.r + pad;
        // a leaf whose petiole starts at the node (x, y), pointing along `rot`
        P.leaf = (x, y, rot, s, kind, pick, o = {}) => {
            if (gap && kind === 'back' && !P.clear(x, y, 230)) kind = 'deep'; // nothing glows around the rest
            let sp = C.leaf(leafV(kind, rot, pick), rot, rl, kind);
            if (o.dead) sp = C.graded(sp, '#b98a58', '#6a4a26', 0.25); // a dead leaf: brown paper
            const G = sp.G, fx = o.fx ?? 1, fy = o.fy ?? 1;
            if (gap && !o.any) for (const u of [0.45, 0.75, 1]) {
                if (!P.clear(x + Math.cos(rot) * G.L * s * fx * u, y + Math.sin(rot) * G.L * s * fx * u, u === 1 ? -14 : 0)) return null;
            }
            const [ox, oy] = turn(G.pl * fx * s, -G.B(-G.pl) * fy * s, rot), jx = x + ox, jy = y + oy;
            if (o.sh !== 0) C.shadow(g, sp, jx, jy, s, { rot, fx, fy, dx: (o.dx ?? 5) * s, dy: (o.dy ?? 9) * s, alpha: o.sh ?? 0.42, blur: o.blur ?? 7 });
            C.put(g, sp, jx, jy, s, { rot, fx, fy });
            return { sp, x: jx, y: jy, rot, s, fx, fy, at: (u, av = 0, sd = 0) => {
                const p = G.at(u, av, sd), [px, py] = turn(p[0] * fx * s, p[1] * fy * s, rot);
                return [jx + px, jy + py];
            } };
        };
        // a lemon hanging from the end of its stalk at (tx, ty); returns its middle
        P.lemon = (tx, ty, rot, s, v, o = {}) => {
            const sp = C.lemon(v, rot, Q(full, 1.4 * q * s), o), [ox, oy] = turn(sp.top[0] * s, sp.top[1] * s, rot), x = tx - ox, y = ty - oy;
            if (o.sh !== 0) C.shadow(g, sp, x, y, s, { rot, dx: 9 * s, dy: 15 * s, alpha: o.sh ?? 0.5, blur: 12 });
            C.put(g, sp, x, y, s, { rot });
            return { x, y, s, rot, sp, at: (px, py) => {
                const [qx, qy] = turn(px * s, py * s, rot);
                return [x + qx, y + qy];
            } };
        };
        P.stalk = (pts, w0, w1, seed, o = {}) => C.branch(g, pts, { w0, w1, green: [0, 0], seed, ...o });
        P.wood = (pts, o) => C.branch(g, pts, { dens: soft ? 0.6 : 1, ...o });
        // a pedicel from the hub (x, y) towards `dir`, `len` long, and what it carries:
        // 'face' | 'tilt' | 'side' | 'half' | 'bud' | 'round' | 'spent' | 'fruitlet'
        P.bloom = (x, y, dir, len, kind, v, s = 1, o = {}) => {
            const ex = x + Math.cos(dir) * len, ey = y + Math.sin(dir) * len + (kind === 'fruitlet' ? len * 0.3 : 0);
            const bow = (o.bow ?? 0.14) * len, mx = (x + ex) / 2 - Math.sin(dir) * bow, my = (y + ey) / 2 + Math.cos(dir) * bow;
            const end = Math.atan2(ey - my, ex - mx);
            if (len > 2) C.branch(g, [[x, y], [mx, my], [ex, ey]], { w0: 3.1 * s, w1: (kind === 'fruitlet' ? 3 : 2.5) * s, green: [0, 0], seed: 'ped' + kind + v + Math.round(x), shadeA: 0.8 });
            const rs = Q(full, 1.6 * q * s);
            let sp, rot, px = ex, py = ey;
            if (kind === 'bud' || kind === 'round') {
                rot = end;
                sp = C.bud(v, rot, rs, kind === 'bud');
            } else if (kind === 'fruitlet') {
                rot = o.rot ?? (end - Math.PI / 2) * 0.5;
                sp = C.fruitlet(v, rot, rs);
                const [ox, oy] = turn(sp.top[0] * s, sp.top[1] * s, rot);
                px -= ox;
                py -= oy;
            } else if (kind === 'face') {
                rot = o.rot ?? v * 2.4;
                sp = C.flower(v, rot, rs, 'face');
            } else {
                rot = end + Math.PI / 2;
                sp = kind === 'spent' ? C.spent(v, rot, rs) : C.flower(v, rot, rs, kind);
                const [ox, oy] = turn(sp.base[0] * s, sp.base[1] * s, rot);
                px -= ox;
                py -= oy;
            }
            if (o.sh !== 0) C.shadow(g, sp, px, py, s, { rot, dx: 5 * s, dy: 8 * s, alpha: o.sh ?? 0.42, blur: 6 });
            C.put(g, sp, px, py, s, { rot });
            return { x: px, y: py, rot, s };
        };
        // a fallen petal lying on what is there
        P.petal = (x, y, rot, v, o = {}) => {
            const sp = C.petal('loose' + v, rot, Q(full, 1.6 * q), { len: 40 + (v % 3) * 4, wid: 11.5, cup: 0.9, old: o.old ?? 0, out: o.out ?? 0 });
            C.shadow(g, sp, x, y, 1, { rot, dx: 2.5, dy: 4, alpha: 0.45, blur: 3 });
            C.put(g, sp, x, y, 1, { rot, fy: o.fy ?? 0.8 });
        };
        // water: the other painter's lens if it is there, ours if not
        P.drop = (x, y, r, o = {}) => {
            const F = fauna('drop');
            if (F && !o.hang) F.drop(g, { x, y, r, ...o });
            else C.drop(g, { x, y, r, hang: o.hang ?? 0, sq: o.squash ?? 1 });
        };
        return P;
    }

    // A path with its length: at(d) → the point d along it and its heading.
    const track = (ctrl, seg = 14) => {
        const pts = ctrl.length > 2 ? S.curve(ctrl, false, seg) : ctrl, D = [0];
        for (let i = 1; i < pts.length; i++) D.push(D[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        const len = D[D.length - 1];
        return { pts, len, at: (d) => {
            d = Math.max(0, Math.min(len, d));
            let i = 1;
            while (i < pts.length - 1 && D[i] < d) i++;
            const k = (d - D[i - 1]) / (D[i] - D[i - 1] || 1), p = pts[i - 1], q = pts[i];
            return { x: p[0] + (q[0] - p[0]) * k, y: p[1] + (q[1] - p[1]) * k, a: Math.atan2(q[1] - p[1], q[0] - p[0]) };
        } };
    };

    // A shoot the way it grows: wood along `path`, a node every `gap` units (closer towards
    // the tip), a leaf at each node on alternate sides, pulled down by its weight; thorns in
    // some axils; fruit on stalks; whatever the tip carries.
    //   w0, w1, green   as Citrus.branch;  s: the size of everything on it
    //   kinds           the leaves' kinds, drawn at random;  leafy: the share of nodes with a leaf
    //   thorns          the share of nodes with a thorn;  scars: nodes without a leaf show one
    //   fruits          [{ u, e: [dx, dy], rot, s, v, age, view, behind }]  e: the stalk's end from the node
    //   tip             'flush' (young leaves), or a list for P.bloom: [[dir, len, kind, v, s], …]
    function shoot(P, o) {
        const r = Motion.rng('shoot' + o.seed), T = track(o.path), g = P.g, s = o.s ?? 1;
        const nodes = [];
        let d = (o.from ?? 0.08) * T.len, side = r() < 0.5 ? 1 : -1;
        while (d < T.len * (o.to ?? 0.985)) {
            nodes.push({ d, u: d / T.len, side });
            side = r() < 0.86 ? -side : side;
            d += (o.gap ?? 46) * s * (0.72 + r() * 0.56) * (1 - 0.42 * (d / T.len));
        }
        const kinds = o.kinds ?? ['sun', 'mid', 'mid', 'mid', 'deep'];
        const leaves = [];
        for (const n of nodes) {
            n.leaf = r() < (o.leafy ?? 0.94);
            const p = T.at(n.d);
            let a = p.a + n.side * (0.5 + r() * 0.62);
            a += (o.droop ?? 0.3) * (0.4 + r() * 0.9) * Math.sin(Math.PI / 2 - a); // its weight
            let kind = kinds[Math.floor(r() * kinds.length)];
            if (o.tip === 'flush' && n.u > 0.76) kind = r() < 0.55 ? 'bronze' : 'young';
            else if (n.u > 0.88 && r() < 0.4 && !o.plain) kind = 'young';
            else if (!o.plain && r() < 0.035) kind = 'old';
            else if (!o.plain && r() < 0.05) kind = 'under';
            const small = kind === 'young' || kind === 'bronze';
            const ls = s * (o.leaf ?? 1) * (0.8 + r() * 0.38) * (small ? 1 : 1 - 0.22 * n.u * n.u), edge = r() < 0.1;
            const L = { x: p.x, y: p.y, a, kind, s: ls, pick: Math.floor(r() * 97), fx: 0.64 + r() * 0.36, fy: edge ? 0.14 + r() * 0.16 : 0.56 + r() * 0.44, front: r() < 0.5 };
            if (n.leaf) leaves.push(L);
        }
        for (const l of leaves) if (!l.front) l.got = P.leaf(l.x, l.y, l.a, l.s, l.kind, l.pick, l);
        // fruit that hangs behind the wood
        const fruit = (f) => {
            const p = T.at(f.u * T.len), e = [p.x + f.e[0], p.y + f.e[1]], fs = f.s ?? 1.2;
            const stalk = () => P.stalk([[p.x, p.y], [p.x + f.e[0] * 0.3, p.y + f.e[1] * 0.55], e], 5 * fs, 6 * fs, 'stalk' + o.seed + f.v);
            // seen from its stalk end, the stalk comes at the eye, over the fruit
            if (f.view !== 'stalk') stalk();
            f.got = P.lemon(e[0], e[1], f.rot ?? 0, fs, f.v, { age: f.age, view: f.view });
            if (f.view === 'stalk') stalk();
        };
        for (const f of o.fruits ?? []) if (f.behind) fruit(f);
        P.wood(T.pts, { raw: true, w0: (o.w0 ?? 7) * s, w1: (o.w1 ?? 3) * s, green: o.green ?? [0, 0], seed: 'wood' + o.seed, nodes: nodes.map((n) => n.d), stripes: o.stripes, taper: o.taper });
        for (const n of nodes) {
            const p = T.at(n.d), w = ((o.w0 ?? 7) + ((o.w1 ?? 3) - (o.w0 ?? 7)) * n.u) * s;
            if (!n.leaf && o.scars !== false && w > 5) C.scar(g, p.x - Math.sin(p.a) * n.side * w * 0.2, p.y + Math.cos(p.a) * n.side * w * 0.2, p.a + (n.side > 0 ? 0 : Math.PI), Math.min(11, w * 0.7));
            if (r() < (o.thorns ?? 0)) {
                const a = p.a + n.side * (1.15 + r() * 0.5), len = (8 + r() * r() * 22) * s;
                if (P.clear(p.x + Math.cos(a) * len, p.y + Math.sin(a) * len)) C.thorn(g, p.x + Math.cos(a) * w * 0.3, p.y + Math.sin(a) * w * 0.3, a, len, o.seed + n.d);
            }
        }
        for (const f of o.fruits ?? []) if (!f.behind) fruit(f);
        for (const l of leaves) if (l.front) l.got = P.leaf(l.x, l.y, l.a, l.s, l.kind, l.pick, l);
        if (Array.isArray(o.tip)) {
            const e = T.at(T.len);
            for (const [dir, len, kind, v, fs, extra] of o.tip) P.bloom(e.x, e.y, e.a + dir, len, kind, v, (fs ?? 1) * s, extra);
        }
        return { T, nodes, fruits: o.fruits, leaves };
    }
    // Dew on the leaves a shoot carries in front: one to three drops on each of the first n.
    const dew = (P, sh, n, seed) => {
        const r = Motion.rng('dew' + seed);
        for (const l of sh.leaves.filter((l) => l.front && l.got).slice(0, n)) {
            for (let i = 0, m = 1 + Math.floor(r() * 2.6); i < m; i++) P.drop(...l.got.at(0.2 + r() * 0.6, 0.15 + r() * 0.6, r() < 0.5 ? 0 : 1), 2 + r() * r() * 4.5);
        }
    };
    // A feather the finch has let fall: a black vane with a yellow edge, grey down at its foot.
    const feather = (g, x, y, rot, len = 30) => {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.lineCap = 'round';
        g.globalCompositeOperation = 'source-atop';
        g.fillStyle = 'rgba(6,24,18,0.35)';
        g.beginPath();
        g.ellipse(len * 0.55 + 2, 3, len * 0.5, 4.5, 0, 0, TAU);
        g.fill();
        g.globalCompositeOperation = 'source-over';
        const r = Motion.rng('feather' + x);
        for (let i = 0; i < 12; i++) {
            // down
            const a = (r() - 0.5) * 2.6;
            g.strokeStyle = `rgba(206,204,208,${0.4 + r() * 0.4})`;
            g.lineWidth = 0.5;
            g.beginPath();
            g.moveTo(len * 0.12 + r() * len * 0.14, 0);
            g.quadraticCurveTo(len * 0.1 + Math.cos(a) * 3, Math.sin(a) * 4, len * 0.08 + Math.cos(a) * 5, Math.sin(a) * (5 + r() * 3));
            g.stroke();
        }
        for (const [side, col, w] of [[-1, '#24211f', 5], [-1, '#45403a', 2.4], [1, '#d8ae24', 4.2], [1, '#f4d860', 2]]) {
            for (let i = 0; i < 44; i++) {
                // barbs, a few of them parted
                const u = 0.2 + (i / 44) * 0.79, wd = w * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.75)), 0.7) * (i % 11 === 7 ? 0.55 : 0.9 + r() * 0.2);
                g.strokeStyle = col;
                g.lineWidth = 0.7;
                g.beginPath();
                g.moveTo(u * len, -0.8 * Math.sin(u * Math.PI));
                g.quadraticCurveTo(u * len + wd * 0.3, side * wd * 0.6, u * len + wd * 0.8, side * wd);
                g.stroke();
            }
        }
        g.strokeStyle = '#f0e8d0';
        g.lineWidth = 0.75;
        g.beginPath();
        g.moveTo(0, 0);
        g.quadraticCurveTo(len * 0.5, -0.8, len, 0);
        g.stroke();
        g.restore();
    };
    // A short leafy shoot from (x, y) heading `dir`, bending under its own weight.
    const sprig = (P, x, y, dir, len, seed, o = {}) => {
        const sag = (o.sag ?? 0.16) * len * Math.cos(dir), bend = (o.bend ?? 0) * len;
        const nx = -Math.sin(dir), ny = Math.cos(dir);
        return shoot(P, {
            path: [[x, y], [x + Math.cos(dir) * len * 0.36 + nx * bend * 0.6, y + Math.sin(dir) * len * 0.36 + ny * bend * 0.6 + Math.abs(sag) * 0.2], [x + Math.cos(dir) * len * 0.72 + nx * bend, y + Math.sin(dir) * len * 0.72 + ny * bend + Math.abs(sag) * 0.6], [x + Math.cos(dir) * len + nx * bend * 0.8, y + Math.sin(dir) * len + ny * bend * 0.8 + Math.abs(sag)]],
            seed, w0: 5.6, w1: 2.6, gap: 42, ...o,
        });
    };
    // A handful of leaves about a point: the depth of the tree between the shoots.
    const clump = (P, x, y, n, s, kinds, seed, o = {}) => {
        const r = Motion.rng('clump' + seed), a0 = r() * TAU;
        for (let i = 0; i < n; i++) {
            const a = a0 + (i / n) * TAU * (o.fan ?? 1) + (r() - 0.5) * 0.9;
            P.leaf(x + (r() - 0.5) * 30, y + (r() - 0.5) * 30, a, s * (0.82 + r() * 0.4), kinds[Math.floor(r() * kinds.length)], Math.floor(r() * 97), { fx: 0.6 + r() * 0.4, fy: 0.45 + r() * 0.55, sh: o.sh ?? 0.36 });
        }
    };

    // ------------------------------------------------------------------ the light through the tree
    // Sun and shade laid over a finished layer, on its paint only: `paint(q, light, dark)`
    // draws lights (white) and shades (black) on a grey map, a quarter of the layer's size,
    // and every painted pixel is then warmed and lifted, or cooled and lowered, by it.
    function relight(g, box, res, paint, o = {}) {
        const W = g.canvas.width, H = g.canvas.height, f = 0.25;
        const small = canvas(Math.ceil(W * f), Math.ceil(H * f)), q = small.getContext('2d');
        q.fillStyle = '#808080';
        q.fillRect(0, 0, small.width, small.height);
        q.setTransform(res * f, 0, 0, res * f, -box.x * res * f, -box.y * res * f);
        paint(q);
        const map = canvas(W, H), mq = map.getContext('2d', { willReadFrequently: true });
        mq.imageSmoothingQuality = 'high';
        mq.drawImage(small, 0, 0, W, H);
        const L = mq.getImageData(0, 0, W, H).data;
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        const img = g.getImageData(0, 0, W, H), px = img.data;
        const sunK = o.sun ?? 1, shK = o.shade ?? 1;
        for (let i = 0; i < px.length; i += 4) {
            if (!px[i + 3]) continue;
            const l = L[i];
            if (l > 129) {
                const k = ((l - 128) / 127) * sunK;
                px[i] = Math.min(252, px[i] * (1 + 0.42 * k) + 16 * k);
                px[i + 1] = Math.min(252, px[i + 1] * (1 + 0.36 * k) + 12 * k);
                px[i + 2] = Math.min(246, px[i + 2] * (1 + 0.1 * k));
            } else if (l < 127) {
                const k = ((128 - l) / 128) * shK;
                px[i] *= 1 - 0.52 * k;
                px[i + 1] *= 1 - 0.38 * k;
                px[i + 2] *= 1 - 0.27 * k;
            }
        }
        g.putImageData(img, 0, 0);
        g.restore();
    }
    // The map for a layer: pools of shade, then the sun in patches that slant with the light.
    const dapple = (seed, box, o = {}) => (q) => {
        const r = Motion.rng('dapple' + seed), m = q.getTransform();
        // each group of marks goes down through one blur (a filter per mark costs a pass each)
        const group = (blur, draw) => {
            const c = canvas(q.canvas.width, q.canvas.height), p = c.getContext('2d');
            p.setTransform(m);
            draw((x, y, rx, ry, a, col) => {
                p.fillStyle = col;
                p.beginPath();
                p.ellipse(x, y, rx, ry, a, 0, TAU);
                p.fill();
            });
            q.save();
            q.setTransform(1, 0, 0, 1, 0, 0);
            q.filter = `blur(${(blur * m.a).toFixed(2)}px)`;
            q.drawImage(c, 0, 0);
            q.restore();
        };
        // the tree is lighter towards the sun
        const gr = q.createLinearGradient(box.x, box.y, box.x + box.w * 0.7, box.y + box.h);
        gr.addColorStop(0, `rgba(255,255,255,${o.lift ?? 0.14})`);
        gr.addColorStop(0.55, 'rgba(128,128,128,0)');
        gr.addColorStop(1, `rgba(0,0,0,${o.fall ?? 0.22})`);
        q.fillStyle = gr;
        q.fillRect(box.x, box.y, box.w, box.h);
        group(22, (blob) => {
            for (let i = 0; i < (o.pools ?? 26); i++) blob(box.x + r() * box.w, box.y + r() * box.h, 110 + r() * 220, 70 + r() * 130, r() * 3, `rgba(0,0,0,${0.16 + r() * 0.3})`);
            for (const [x, y, rad, a] of o.dark ?? []) blob(x, y, rad, rad, 0, `rgba(0,0,0,${a})`);
        });
        group(7, (blob) => {
            for (let i = 0; i < (o.suns ?? 46); i++) {
                const x = box.x + r() * box.w, y = box.y + r() * box.h, a = 0.75 + (r() - 0.5) * 0.7, n = 2 + Math.floor(r() * 5), al = 0.35 + r() * 0.5;
                for (let j = 0; j < n; j++) blob(x + (r() - 0.5) * 150, y + (r() - 0.5) * 110, 22 + r() * 70, 10 + r() * 30, a + (r() - 0.5) * 0.5, `rgba(255,255,255,${al})`);
            }
        });
        group(3.5, (blob) => {
            for (let i = 0; i < (o.flecks ?? 60); i++) blob(box.x + r() * box.w, box.y + r() * box.h, 6 + r() * 12, 4 + r() * 8, 0.75 + (r() - 0.5), `rgba(255,255,255,${0.25 + r() * 0.45})`);
            for (const [x, y, rx, ry, a, al] of o.lit ?? []) blob(x, y, rx, ry, a, `rgba(255,255,255,${al})`);
        });
    };
    // Air between the eye and a far layer: its paint drifts towards the tree's own blue-green.
    const veil = (g, box, color) => {
        g.save();
        g.globalCompositeOperation = 'source-atop';
        g.fillStyle = color;
        g.fillRect(box.x, box.y, box.w, box.h);
        g.restore();
    };

    const plate = { x: -1500, y: -850, w: 3000, h: 1700 };
    const wide = { x: -1300, y: -740, w: 2600, h: 1480 };
    // sprigs growing from a bough at even steps, above and below it
    const along = (P, T, o) => {
        const r = Motion.rng('along' + o.seed);
        let d = (o.from ?? 0.04) * T.len, up = r() < 0.5;
        while (d < T.len * (o.to ?? 0.98)) {
            const p = T.at(d), dir = p.a + (up ? -1 : 1) * (0.7 + r() * 0.8), len = (o.len ?? 190) * (0.7 + r() * 0.6);
            if (!o.skip || !o.skip(p.x, p.y, dir, len)) sprig(P, p.x, p.y, dir, len, o.seed + '-' + Math.round(d), { thorns: 0.25, ...(o.with ?? {}), tip: r() < (o.flush ?? 0.3) ? 'flush' : undefined });
            up = !up;
            d += (o.every ?? 170) * (0.7 + r() * 0.6);
        }
    };

    return [
        {
            // the inside of the tree, closing the picture: green light, limbs, leaves in
            // masses, a few holes on the sky; darkest behind the rest where the dive goes on
            id: 'lemons-plate', brush: false, z: z0 + 420, box: plate, res: SOFT.plate, hole: Tableau.lemons.hole * 0.85,
            paint(g, res) {
                const gp = gapAt(420), P = painter(g, res, SOFT.plate);
                const gr = g.createLinearGradient(plate.x, plate.y, plate.x + plate.w * 0.6, plate.y + plate.h);
                gr.addColorStop(0, '#2f5c34');
                gr.addColorStop(0.5, '#1b3d2c');
                gr.addColorStop(1, '#11261f');
                g.fillStyle = gr;
                g.fillRect(plate.x, plate.y, plate.w, plate.h);
                const r = Motion.rng('plate');
                // holes on the sky, high up and to the sun's side
                for (let i = 0; i < 26; i++) {
                    const x = plate.x + r() * plate.w, y = plate.y + r() * r() * plate.h * 0.8, rad = 14 + r() * 40;
                    if (Math.hypot(x - gp.x, y - gp.y) < gp.r + 220) continue;
                    const sk = g.createRadialGradient(x, y, 0, x, y, rad);
                    sk.addColorStop(0, 'rgba(236,246,214,0.95)');
                    sk.addColorStop(0.6, 'rgba(206,232,170,0.7)');
                    sk.addColorStop(1, 'rgba(160,206,120,0)');
                    g.fillStyle = sk;
                    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
                }
                // limbs
                P.wood([[-1500, 420], [-900, 180], [-380, -160], [60, -420], [380, -850]], { w0: 70, w1: 44, seed: 'plate-limb1', shade: false });
                P.wood([[-380, -160], [100, -40], [640, 30], [1100, -120], [1500, -80]], { w0: 40, w1: 26, seed: 'plate-limb2', shade: false });
                P.wood([[300, 850], [420, 500], [640, 30]], { w0: 46, w1: 34, seed: 'plate-limb3', shade: false });
                // leaves in masses, real size: from here they are a texture
                for (let i = 0; i < 330; i++) {
                    const x = plate.x + r() * plate.w, y = plate.y + r() * plate.h, near = Math.hypot(x - gp.x, y - gp.y) < gp.r + 150;
                    P.leaf(x, y, r() * TAU, 1.1 + r() * 0.5, near ? 'deep' : r() < 0.13 ? 'back' : r() < 0.62 ? 'deep' : r() < 0.9 ? 'mid' : 'sun', Math.floor(r() * 97), { fx: 0.6 + r() * 0.4, fy: 0.45 + r() * 0.55, sh: 0 });
                }
                relight(g, plate, res, dapple('plate', plate, { pools: 34, suns: 40, flecks: 0, lift: 0.2, fall: 0.34, dark: [[gp.x, gp.y, gp.r * 1.9, 0.9]] }), { sun: 0.8 });
                veil(g, plate, 'rgba(24,66,66,0.26)');
                S.tooth(g, plate, { amp: 0.05 });
                // the way out, on the axis, in the dark of the rest: a ragged hole among the
                // leaves (the next picture is seen through it)
                const rim = [];
                for (let i = 0; i < 48; i++) {
                    const a = (i / 48) * TAU, rr = Tableau.lemons.hole * (1 + 0.1 * S.noise2(Math.cos(a) * 2.2 + 7, Math.sin(a) * 2.2 + 3) + 0.05 * Math.sin(a * 9 + 1));
                    rim.push([Math.cos(a) * rr, Math.sin(a) * rr]);
                }
                g.save();
                g.globalCompositeOperation = 'destination-out';
                g.fillStyle = '#000'; // opaque, whatever the last painter left
                g.beginPath();
                S.trace(g, S.curve(rim, true, 6));
                g.fill();
                g.restore();
            },
        },
        {
            // far in the tree: a limb, boughs, leaves lit from behind, a few lemons
            id: 'lemons-far', brush: false, z: z0 + 210, box: wide, res: SOFT.far,
            paint(g, res) {
                const gp = gapAt(210, 30), P = painter(g, res, SOFT.far, gp);
                const r = Motion.rng('far');
                for (let i = 0; i < 90; i++) {
                    const x = wide.x + r() * wide.w, y = wide.y + r() * wide.h;
                    if (P.clear(x, y, 60)) clump(P, x, y, 4 + Math.floor(r() * 3), 1.05, ['deep', 'deep', 'deep', 'mid'], 'far' + i, { sh: 0 });
                }
                P.wood([[-760, 760], [-700, 380], [-640, 40], [-690, -330], [-640, -760]], { w0: 62, w1: 40, seed: 'far-limb' });
                const b1 = track([[-650, 60], [-380, -130], [-60, -270], [330, -330], [700, -300], [1000, -400], [1320, -440]]);
                P.wood(b1.pts, { raw: true, w0: 30, w1: 14, seed: 'far-b1' });
                const b2 = track([[-690, 330], [-420, 420], [-120, 360], [260, 300], [620, 380], [980, 330], [1320, 420]]);
                P.wood(b2.pts, { raw: true, w0: 24, w1: 11, seed: 'far-b2' });
                along(P, b1, { seed: 'fb1', every: 150, len: 210, with: { kinds: ['mid', 'back', 'mid', 'sun', 'back'], plain: true, thorns: 0 } });
                along(P, b2, { seed: 'fb2', every: 150, len: 210, with: { kinds: ['mid', 'back', 'mid', 'deep'], plain: true, thorns: 0 } });
                for (const [x, y, dir, len] of [[-1300, -520, 0.3, 300], [-1300, 200, -0.2, 320], [1300, 60, 3.3, 320], [1300, -640, 2.7, 300], [-200, 740, -1.2, 300], [760, 740, -1.9, 300], [-1100, 700, -0.9, 320], [200, -740, 1.3, 260], [-420, -740, 1.8, 260]]) {
                    sprig(P, x, y, dir, len, 'far-edge' + x + y, { kinds: ['mid', 'back', 'sun', 'mid'], plain: true });
                }
                // lemons: seen small, quiet
                for (const [x, y, v, age, s] of [[-330, 250, 11, 'ripe', 1.05], [470, -150, 12, 'ripe', 1], [860, 110, 13, 'turning', 1.05], [-980, -250, 14, 'ripe', 1.1], [-150, -470, 15, 'green', 0.9], [1040, -330, 16, 'ripe', 1], [-900, 440, 17, 'ripe', 1.05], [330, 480, 18, 'turning', 1]]) {
                    P.stalk([[x - 6, y - 46], [x - 2, y - 20], [x, y]], 5, 6, 'far-stalk' + v, { shade: false });
                    P.lemon(x, y, (S.hashI(v, 1, 2, 3) - 0.5) * 0.6, s, v, { age });
                }
                relight(g, wide, res, dapple('far', wide, { pools: 26, suns: 36, flecks: 20, dark: [[gp.x, gp.y, gp.r * 1.8, 0.9]] }), { sun: 0.9 });
                veil(g, wide, 'rgba(22,64,62,0.3)');
                S.tooth(g, wide, { amp: 0.05 });
            },
        },
        {
            // a step behind the main layer: almost sharp
            id: 'lemons-mid', brush: false, z: z0 + 90, box: wide,
            paint(g, res) {
                const gp = gapAt(90, 20), P = painter(g, res, 0, gp);
                const r = Motion.rng('mid');
                for (let i = 0; i < 64; i++) {
                    const x = wide.x + r() * wide.w, y = wide.y + r() * wide.h;
                    if (P.clear(x, y, 50)) clump(P, x, y, 4 + Math.floor(r() * 3), 1, ['deep', 'deep', 'deep', 'mid'], 'mid' + i, { sh: 0.34 });
                }
                const m1 = track([[-1320, 560], [-900, 420], [-470, 330], [-60, 270], [330, 190], [680, 40], [1000, -200], [1320, -470]]);
                C.branch(g, m1.pts, { raw: true, w0: 22, w1: 11, seed: 'mid-m1' });
                const m2 = track([[-1320, -260], [-960, -330], [-600, -470], [-260, -520], [100, -640]]);
                C.branch(g, m2.pts, { raw: true, w0: 16, w1: 9, seed: 'mid-m2', green: [0.7, 1.1] });
                along(P, m1, { seed: 'mm1', every: 140, len: 200, with: { kinds: ['mid', 'sun', 'back', 'mid', 'deep'] }, skip: (x, y, dir, len) => !P.clear(x + Math.cos(dir) * len * 0.6, y + Math.sin(dir) * len * 0.6, 40) });
                along(P, m2, { seed: 'mm2', every: 140, len: 200, with: { kinds: ['mid', 'back', 'sun', 'back'] } });
                for (const [x, y, dir, len] of [[1300, 300, 3.5, 300], [1300, -150, 3.0, 280], [-1300, 100, 0.2, 300], [500, 740, -1.5, 300], [-560, 740, -1.3, 280], [900, -740, 2.0, 280], [520, -740, 1.4, 260], [-900, 740, -1.0, 280]]) {
                    sprig(P, x, y, dir, len, 'mid-edge' + x + y, { kinds: ['mid', 'sun', 'back', 'mid'] });
                }
                for (const [x, y, v, age, s, rot] of [[-760, 40, 21, 'ripe', 1.1, 0.2], [560, 300, 22, 'green', 0.95, -0.3], [860, -330, 23, 'ripe', 1.1, 0.1], [-420, -430, 24, 'turning', 1.05, -0.15], [60, 420, 25, 'ripe', 1.05, 0.25]]) {
                    if (!P.clear(x, y + 110, 80)) continue;
                    P.stalk([[x - 8, y - 50], [x - 3, y - 22], [x, y]], 5, 6, 'mid-stalk' + v, { shade: false });
                    P.lemon(x, y, rot, s, v, { age });
                }
                // a swallowtail behind the leaves, where the main layer lets it show
                const B = fauna('butterfly');
                if (B) B.butterfly(g, { x: 440, y: -224, s: 1.25, rot: -0.5, fold: 0.3, line: false });
                relight(g, wide, res, dapple('mid', wide, { pools: 26, suns: 44, flecks: 40, dark: [[gp.x, gp.y, gp.r * 1.6, 0.85]] }), { sun: 0.9, shade: 1.15 });
                veil(g, wide, 'rgba(18,60,48,0.2)');
                S.tooth(g, wide, { amp: 0.055 });
            },
        },
        {
            id: 'lemons-hero', brush: false, z: z0, box: wide,
            paint(g, res) {
                const P = painter(g, res, 0, { ...GAP });
                const r = Motion.rng('hero');
                const F = (n) => fauna(n);
                // --- 1 · the shade between the shoots: dark leaves, sharp
                for (let j = 0; j < 9; j++) {
                    for (let i = 0; i < 14; i++) {
                        const x = wide.x + ((i + 0.2 + r() * 0.6) / 14) * wide.w, y = wide.y + ((j + 0.2 + r() * 0.6) / 9) * wide.h;
                        if (P.clear(x, y, 70) && r() < 0.8) clump(P, x, y, 3 + Math.floor(r() * 3), 1, ['deep', 'deep', 'mid'], 'under' + i + '-' + j, { sh: 0.4 });
                    }
                }
                // --- 2 · the boughs and their leafy shoots
                const A = track([[-1320, -610], [-980, -500], [-640, -395], [-330, -300], [-60, -238], [200, -215], [470, -170], [740, -95], [1010, 30], [1320, 210]]);
                const B = track([[-1320, 60], [-1050, 100], [-820, 165], [-600, 250], [-420, 350], [-300, 470], [-240, 640]]);
                const gapSkip = (x, y, dir, len) => !P.clear(x + Math.cos(dir) * len * 0.55, y + Math.sin(dir) * len * 0.55, 60);
                along(P, A, { seed: 'hA', every: 150, len: 200, skip: gapSkip, with: { kinds: ['sun', 'mid', 'mid', 'mid', 'deep'] } });
                along(P, B, { seed: 'hB', every: 150, len: 190, skip: gapSkip, with: { kinds: ['sun', 'mid', 'mid', 'deep'] } });
                for (const [x, y, dir, len] of [[1300, -560, 2.9, 300], [1300, 520, 3.6, 320], [820, 740, -2.0, 300], [80, 740, -1.4, 260], [-760, 740, -1.2, 300], [-1300, 420, -0.1, 300], [-1300, -250, 0.4, 280], [-560, -740, 1.2, 240], [330, -740, 1.7, 260], [900, -740, 2.2, 280], [1300, -160, 3.3, 260], [-1000, 740, -0.8, 280]]) {
                    // towards the sun, a few leaves with the light behind them
                    sprig(P, x, y, dir, len, 'h-edge' + x + y, { thorns: 0.2, kinds: x < -500 && y < 0 ? ['sun', 'back', 'mid', 'back', 'mid'] : undefined });
                }
                // the rest is closed above and below: leaves come down from the bough and up from the spray under it
                sprig(P, -40, -236, 1.9, 110, 'gap-top-a', { kinds: ['mid', 'deep', 'sun'], gap: 34 });
                sprig(P, 96, -226, 1.3, 100, 'gap-top-b', { kinds: ['mid', 'sun', 'deep'], gap: 34 });
                sprig(P, 84, 312, -1.5, 120, 'gap-low-a', { kinds: ['mid', 'sun', 'deep'], gap: 34, sag: 0 });
                sprig(P, -70, 300, -1.3, 110, 'gap-low-b', { kinds: ['deep', 'mid'], gap: 34, sag: 0 });
                C.branch(g, A.pts, { raw: true, w0: 34, w1: 14, seed: 'bough-A', nodes: [300, 620, 980, 1270, 1560, 1900] });
                // ants going up and down the bough
                for (const [u, off, back] of [[0.36, -6, 0], [0.385, 3, 1], [0.41, -3, 0], [0.445, 5, 0], [0.52, -5, 1], [0.6, 2, 0], [0.63, -4, 0], [0.71, 3, 1]]) {
                    const p = A.at(A.len * u);
                    C.ant(g, { x: p.x - Math.sin(p.a) * off, y: p.y + Math.cos(p.a) * off, rot: p.a + (back ? Math.PI : 0) + (off % 2 ? 0.2 : -0.15), s: 1.35 });
                }
                C.branch(g, B.pts, { raw: true, w0: 15, w1: 9, seed: 'bough-B', green: [0.75, 1.2], nodes: [260, 520, 800] });
                // a pruned stub on the big bough, and where leaves fell
                const st = A.at(A.len * 0.335);
                C.branch(g, [[st.x, st.y], [st.x + 14, st.y - 24], [st.x + 22, st.y - 42]], { w0: 20, w1: 17, seed: 'stub' });
                C.cut(g, st.x + 24, st.y - 46, -1.05, 18, 3);
                for (const u of [0.14, 0.22, 0.47, 0.58, 0.7, 0.83]) {
                    const p = A.at(A.len * u);
                    C.scar(g, p.x + 3, p.y - 5, p.a, 9);
                }
                // --- 3 · fruiting twigs
                // upper left: a lemon seen from below
                shoot(P, { seed: 'tT1', path: [[-610, -388], [-590, -350], [-570, -318], [-562, -300]], w0: 6.5, w1: 5.5, gap: 30, green: [0.2, 0.8], kinds: ['sun', 'mid'], fruits: [{ u: 1, e: [0, 6], s: 1.1, v: 6, view: 'tip', rot: 0.1 }] });
                // left of the gap: three on one spur, touching
                const TL = shoot(P, { seed: 'tL', path: [[-352, -306], [-312, -248], [-250, -186], [-206, -150]], w0: 7.5, w1: 6, gap: 36, green: [0.1, 0.7], kinds: ['sun', 'mid', 'sun'], thorns: 0.4,
                    fruits: [{ u: 0.42, e: [-38, 36], s: 1.12, v: 1, age: 'turning', rot: -0.25, behind: true }, { u: 1, e: [8, 26], s: 1.32, v: 3, age: 'ripe', rot: 0.12 }] });
                shoot(P, { seed: 'tL3', path: [[-560, -86], [-480, -30], [-400, 20], [-338, 46]], w0: 6.5, w1: 5, gap: 44, kinds: ['mid', 'sun'], thorns: 0.5, fruits: [{ u: 1, e: [8, 16], s: 0.92, v: 0, age: 'green', rot: 0.3 }] });
                // right of the gap: one in the leaf's shadow, one behind it
                shoot(P, { seed: 'tR2', path: [[318, -196], [342, -168], [356, -140], [362, -122]], w0: 6, w1: 5, gap: 30, kinds: ['mid', 'sun'], fruits: [{ u: 1, e: [0, 6], s: 0.86, v: 2, age: 'green', rot: 0.3 }] });
                const TR = shoot(P, { seed: 'tR', path: [[150, -222], [172, -204], [190, -190], [200, -180]], w0: 7, w1: 6, gap: 22, from: 0.3, leafy: 0, green: [0.1, 0.7], fruits: [{ u: 1, e: [0, 22], s: 1.28, v: 9, age: 'ripe', rot: -0.18 }] });
                // far right: an over-ripe one, scarred
                shoot(P, { seed: 'tO', path: [[600, -134], [626, -70], [642, -10], [648, 30]], w0: 6.5, w1: 5.5, gap: 34, green: [0.1, 0.6], kinds: ['mid', 'sun'], thorns: 0.4,
                    fruits: [{ u: 1, e: [2, 26], s: 1.2, v: 4, age: 'over', rot: 0.06 }] });
                // low right: one seen from above, on a twig that comes down to it
                shoot(P, { seed: 'tS', path: [[470, 130], [440, 180], [404, 226], [384, 252]], w0: 6, w1: 5, gap: 36, to: 0.6, kinds: ['sun', 'mid'], fruits: [{ u: 1, e: [-4, 12], s: 1.1, v: 7, view: 'stalk', rot: -0.1 }] });
                // low left: a green one and a turning one on the lower bough
                shoot(P, { seed: 'tG', path: [[-740, 196], [-720, 220], [-706, 240], [-700, 250]], w0: 6, w1: 5, gap: 24, leafy: 0.6, kinds: ['mid'], fruits: [{ u: 1, e: [0, 8], s: 1, v: 10, age: 'green', rot: 0.05 }] });
                shoot(P, { seed: 'tG2', path: [[-610, 246], [-600, 268], [-594, 286], [-590, 296]], w0: 6, w1: 5, gap: 24, leafy: 0.6, kinds: ['sun'], fruits: [{ u: 1, e: [0, 6], s: 1.08, v: 8, age: 'turning', rot: -0.2 }] });
                // the leaf whose shadow lies across the ripe lemon on the right
                const R1 = TR.fruits[0].got;
                {
                    const sp = C.leaf(leafV('sun', 0.95, 2), 0.95, Q(res, 1.5), 'sun');
                    C.shadow(g, sp, 150, -236, 1.12, { rot: 0.95, fx: 0.9, dx: 26, dy: 34, alpha: 0.5, blur: 11 });
                    const lf = P.leaf(136, -246, 0.95, 1.12, 'sun', 2, { fx: 0.9, sh: 0, any: true });
                    P.drop(...lf.at(0.42, 0.4, 1), 5);
                    P.drop(...lf.at(0.6, 0.3, 0), 3);
                    P.drop(...lf.at(0.99, 0, 0), 3, { hang: 0.5 });
                }
                // --- 4 · blossom
                // top centre, over the gap
                const K1 = shoot(P, { seed: 'k1', path: [[-84, -242], [-30, -300], [44, -332], [118, -312]], w0: 6, w1: 3.4, gap: 38, kinds: ['sun', 'mid', 'young'], thorns: 0.3,
                    tip: [[-1.9, 34, 'bud', 1, 1], [-1.2, 46, 'tilt', 1, 0.95], [-0.5, 30, 'round', 2, 1], [0.1, 54, 'face', 0, 1], [0.75, 40, 'half', 3, 0.95], [1.5, 36, 'bud', 4, 0.9], [2.3, 24, 'round', 5, 1]] });
                // upper right, where the bee is
                const K2 = shoot(P, { seed: 'k2', path: [[474, -172], [500, -238], [546, -284], [604, -300]], w0: 6.5, w1: 3.4, gap: 40, kinds: ['sun', 'mid', 'sun'], thorns: 0.3,
                    tip: [[-2.2, 30, 'round', 6, 1], [-1.4, 50, 'side', 2, 0.95], [-0.7, 38, 'bud', 7, 1], [0.0, 58, 'face', 5, 1.02], [0.8, 44, 'tilt', 4, 0.95], [1.5, 40, 'bud', 8, 0.95], [2.1, 30, 'spent', 1, 1]] });
                // below the gap
                const K3 = shoot(P, { seed: 'k3', path: [[-304, 424], [-204, 342], [-92, 292], [8, 286]], w0: 7, w1: 3.6, gap: 40, green: [0.05, 0.4], kinds: ['sun', 'mid', 'sun', 'mid'], thorns: 0.35,
                    tip: [[-2.1, 34, 'spent', 2, 1], [-1.35, 52, 'face', 3, 1], [-0.6, 40, 'bud', 9, 1], [0.1, 62, 'side', 1, 1], [0.7, 30, 'round', 10, 1], [1.2, 56, 'tilt', 6, 1], [1.9, 44, 'half', 2, 0.95], [2.6, 30, 'fruitlet', 1, 1.1], [3.1, 26, 'fruitlet', 2, 1]] });
                // far left, and low on the right: smaller sprays
                shoot(P, { seed: 'k4', path: [[-900, -470], [-850, -400], [-800, -340], [-776, -290]], w0: 5.5, w1: 3.2, gap: 40, kinds: ['sun', 'mid'], tip: [[-0.9, 44, 'face', 8, 0.95], [0.2, 40, 'half', 5, 0.9], [1.0, 34, 'bud', 11, 0.95], [-1.8, 28, 'round', 12, 1]] });
                shoot(P, { seed: 'k5', path: [[840, 150], [800, 230], [750, 290], [700, 318]], w0: 5.5, w1: 3.2, gap: 40, kinds: ['mid', 'sun'], tip: [[-1.1, 40, 'half', 6, 0.95], [-0.2, 46, 'tilt', 7, 0.9], [0.7, 30, 'spent', 3, 1], [1.4, 34, 'fruitlet', 3, 1.2], [2.2, 28, 'round', 13, 1], [-2, 30, 'fruitlet', 4, 1]] });
                // low on the left, a spray still in bud; on the right, fruit just set
                shoot(P, { seed: 'k6', path: [[-470, 420], [-430, 350], [-380, 300], [-330, 276]], w0: 5.5, w1: 3.2, gap: 40, kinds: ['sun', 'mid'], tip: [[-1.3, 34, 'bud', 15, 0.95], [-0.5, 44, 'half', 8, 0.9], [0.3, 36, 'bud', 16, 1], [1.0, 26, 'round', 17, 1], [1.8, 30, 'round', 18, 1], [-2.1, 24, 'round', 19, 0.9]] });
                shoot(P, { seed: 'k7', path: [[820, -40], [790, 10], [770, 50], [760, 80]], w0: 5.5, w1: 3.4, gap: 34, kinds: ['mid', 'sun'], tip: [[-0.8, 30, 'fruitlet', 5, 1.2], [0.2, 36, 'fruitlet', 6, 1], [1.0, 26, 'spent', 4, 1], [1.7, 30, 'fruitlet', 7, 1.3], [-1.6, 24, 'spent', 5, 0.95]] });
                // two dead leaves caught in the tree
                P.leaf(-150, 392, 0.4, 0.9, 'old', 3, { dead: true, fx: 0.8, fy: 0.7, any: true });
                P.leaf(430, -30, 2.2, 0.85, 'old', 5, { dead: true, fx: 0.85, fy: 0.5 });
                // fallen petals, caught on the leaves below the sprays
                P.petal(-70, 392, 0.5, 1, { old: 0.5 });
                P.petal(122, 384, 2.4, 2);
                P.petal(590, -196, 1.2, 3, { old: 0.9 });
                P.petal(-838, -196, -0.4, 4);
                // --- 5 · life and water
                const web = F('web');
                if (web) web.web(g, { x: 478, y: -176, r: 62, a0: -1.45, a1: -0.1, seed: 'fork' });
                const bee = F('bee'), lady = F('ladybird'), finch = F('goldfinch'), snail = F('snail');
                // a snail on its way along the bough
                const sp0 = A.at(A.len * 0.492);
                if (snail) snail.snail(g, { x: sp0.x + 6, y: sp0.y - 32, s: 0.85, rot: sp0.a, line: false, trail: 60 });
                if (bee) bee.bee(g, { x: 652, y: -292, s: 0.82, rot: 0.5, pose: 'feed', line: false });
                if (lady) lady.ladybird(g, { x: 468, y: 62, s: 1.05, rot: 0.6, line: false });
                if (finch) finch.goldfinch(g, { x: -452, y: -108, s: 2.1, flip: true, pose: 0, line: false, perch: [-520, -58, -400, 20] });
                feather(g, -376, 148, 0.5, 40);
                for (const [sh, n] of [[K1, 2], [K2, 2], [K3, 3], [TL, 2]]) dew(P, sh, n, sh.T.len);
                const L1 = TL.fruits[1].got, tipOf = (f) => f.at(f.sp.G.tip[0], f.sp.G.tip[1] + 3);
                for (const [f, x, y, rad] of [[L1, -22, -50, 7], [L1, 16, 30, 4.5], [L1, -38, 52, 3], [R1, 24, 40, 6.5], [R1, -18, -44, 3.6]]) P.drop(...f.at(x, y), rad);
                P.drop(...tipOf(R1), 4, { hang: 0.5 });
                P.drop(...tipOf(L1), 3.2, { hang: 0.4 });
                // --- 6 · the sun comes through in patches
                relight(g, wide, res, dapple('hero', wide, { pools: 40, suns: 42, flecks: 70, lift: 0.06, fall: 0.36,
                    // the sun comes down a slant from the top left: the lemons either side of the rest and the three sprays stand in it; the far corners are in shade
                    lit: [[-230, -30, 80, 46, 0.8, 0.5], [236, -70, 70, 40, 0.8, 0.45], [60, -330, 90, 40, 0.5, 0.5], [600, -300, 90, 46, 0.7, 0.5], [-40, 300, 100, 44, 0.6, 0.45], [-520, -260, 120, 50, 0.6, 0.4], [420, 240, 110, 50, 0.7, 0.35]],
                    dark: [[-780, 380, 260, 0.34], [780, -400, 240, 0.3], [820, 420, 230, 0.34], [-60, 440, 150, 0.2], [520, 20, 130, 0.22], [-640, 60, 150, 0.22]] }), { sun: 0.9, shade: 1.2 });
                S.tooth(g, wide, { amp: 0.06 });
            },
        },
        {
            // just this side of the main layer: a few things at the edges, a little soft
            id: 'lemons-front', brush: false, z: z0 - 110, box: wide,
            paint(g, res) {
                const P = painter(g, res, 0);
                sprig(P, -420, -560, 1.2, 240, 'front-1', { kinds: ['sun', 'mid', 'sun'], tip: [[-0.6, 40, 'face', 9, 0.95], [0.4, 36, 'bud', 14, 0.95], [1.2, 30, 'round', 15, 1]] });
                sprig(P, -900, -60, 0.3, 260, 'front-2', { kinds: ['mid', 'sun', 'mid'], tip: 'flush' });
                sprig(P, 940, -520, 2.75, 220, 'front-4', { kinds: ['mid', 'deep', 'sun'] });
                const bee = fauna('bee');
                if (bee) bee.bee(g, { x: -236, y: -300, s: 0.9, rot: 2.9, flip: true, pose: 'fly', line: false, cast: false });
                relight(g, wide, res, dapple('front', wide, { pools: 10, suns: 30, flecks: 20 }));
                S.tooth(g, wide, { amp: 0.05 });
            },
        },
        {
            // what the camera brushes past: leaves and a lemon at the frame's corners, blurred
            id: 'lemons-near', brush: false, z: z0 - 330, box: wide, res: SOFT.near,
            paint(g, res) {
                const P = painter(g, res, SOFT.near);
                sprig(P, -900, 330, -0.5, 420, 'near-1', { kinds: ['mid', 'deep', 'mid'], plain: true, leaf: 1.15, gap: 60 });
                sprig(P, -940, -480, 0.5, 400, 'near-2', { kinds: ['mid', 'deep'], plain: true, leaf: 1.15, gap: 60 });
                shoot(P, { seed: 'near-3', path: [[-900, -130], [-760, -100], [-640, -76], [-540, -64]], w0: 9, w1: 6, gap: 60, kinds: ['mid', 'deep'], plain: true, leaf: 1.1, fruits: [{ u: 1, e: [6, 20], s: 1.15, v: 19, age: 'ripe', rot: -0.2 }] });
                veil(g, wide, 'rgba(10,40,34,0.2)');
                S.tooth(g, wide, { amp: 0.05 });
            },
        },
    ];
};
// from the main plane to the plate, and the radius of the way out cut through the plate: wider
// than anything the gap between the lemons lets the camera see of it (the rest, ±135 × ±185 in
// the main plane, covers ±192 × ±263 of the plate from where the tree is read), so the opening
// is edged by leaves, never by the plate's own rim
Tableau.lemons.depth = 420;
Tableau.lemons.hole = 290;

// ------------------------------------------------------------------ round 8 · loose pieces
// The lemon tree as a cloud of loose pieces, the door to the second passage: the camera comes
// out of the guitar's mouth (`o.guitar`, 1340 in front of z0) into it. Every piece is its own
// layer from z0 − 300 to z0 + 450, all round the axis. About a fifth of the matter crosses the
// axis (leaves, lemons, blossom, petals, a twig; most of it from z0 + 150 to z0 + 450): the
// camera flies through those, and they are what fills the guitar's mouth as it goes through,
// with only slivers of night. The rest keeps out of a core whose edge is ragged with angle
// and depth (175–385 from the axis, `edge`), densest just outside it: never a circle.
// Each piece comes out of the night only through the guitar's mouth: its `far` starts when the
// guitar is 600 away (later for a piece that is still seen round the guitar's body then: it
// fades in once the body hides it) and it is whole a third of that distance later, so the tree
// never glows behind the emblem.
// The brush manner (no contour); the sun comes through in patches painted into every piece
// from one map in the stratum's coordinates (`dapple`), so all the pieces share one light;
// what is far behind takes the tree's blue-green air.
//   heroes   a spur with two lemons touching (dew), an over-ripe one, one seen from below and
//            one from above, two ripe ones under a leaf's shadow, a green and a turning one,
//            three blossom sprays (a bee feeding on one, fruit just set on another), the
//            goldfinch on its twig, a stretch of the big bough with its ants, the snail and
//            a pruned stub, a forked twig holding the web, a flush of bronze leaves, the
//            swallowtail
//   matter   single leaves of every kind (sun, shade, backlit, young, bronze, yellowing,
//            dead), leafy twigs, lemons on their stalks, open flowers, buds, fruitlets,
//            fallen petals, thorny wood, a bee in flight, a ladybird on a leaf, ants, the
//            finch's feather
Tableau.lemons.loose = (z0, o = {}) => {
    const S = Souvenir, C = Citrus, TAU = Math.PI * 2, GZ = o.guitar ?? 1340;
    const F = (name) => (typeof Fauna !== 'undefined' && typeof Fauna[name] === 'function' ? Fauna : null);
    const Q = (res, q) => Math.max(0.5, Math.round(res * q * 4) / 4);
    const canvas = (w, h) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        return c;
    };
    const turn = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const POOL = { sun: 6, mid: 7, deep: 7, under: 2, young: 3, bronze: 2, old: 2, back: 3 };
    const OFF = { sun: 0, mid: 10, deep: 10, under: 20, young: 30, bronze: 40, old: 50, back: 60 };
    const leafV = (kind, rot, pick) => C.lkey(rot) * 100 + OFF[kind] + (pick % POOL[kind]);

    // ---------------------------------------------------------------- the stratum's painter
    // (the same hand as the picture's: tableaux/lemons.js above, without the rest to keep clear)
    function painter(g, res) {
        const rl = Q(res, 1.5), P = { g, res };
        P.leaf = (x, y, rot, s, kind, pick, o = {}) => {
            let sp = C.leaf(leafV(kind, rot, pick), rot, rl, kind);
            if (o.dead) sp = C.graded(sp, '#b98a58', '#6a4a26', 0.25);
            const G = sp.G, fx = o.fx ?? 1, fy = o.fy ?? 1;
            const [ox, oy] = turn(G.pl * fx * s, -G.B(-G.pl) * fy * s, rot), jx = x + ox, jy = y + oy;
            if (o.sh !== 0) C.shadow(g, sp, jx, jy, s, { rot, fx, fy, dx: (o.dx ?? 5) * s, dy: (o.dy ?? 9) * s, alpha: o.sh ?? 0.42, blur: o.blur ?? 7 });
            C.put(g, sp, jx, jy, s, { rot, fx, fy });
            return { sp, x: jx, y: jy, rot, s, fx, fy, at: (u, av = 0, sd = 0) => {
                const p = G.at(u, av, sd), [px, py] = turn(p[0] * fx * s, p[1] * fy * s, rot);
                return [jx + px, jy + py];
            } };
        };
        P.lemon = (tx, ty, rot, s, v, o = {}) => {
            const sp = C.lemon(v, rot, Q(res, 1.4 * s), o), [ox, oy] = turn(sp.top[0] * s, sp.top[1] * s, rot), x = tx - ox, y = ty - oy;
            if (o.sh !== 0) C.shadow(g, sp, x, y, s, { rot, dx: 9 * s, dy: 15 * s, alpha: o.sh ?? 0.5, blur: 12 });
            C.put(g, sp, x, y, s, { rot });
            return { x, y, s, rot, sp, at: (px, py) => {
                const [qx, qy] = turn(px * s, py * s, rot);
                return [x + qx, y + qy];
            } };
        };
        P.stalk = (pts, w0, w1, seed, o = {}) => C.branch(g, pts, { w0, w1, green: [0, 0], seed, ...o });
        P.wood = (pts, o) => C.branch(g, pts, o);
        P.bloom = (x, y, dir, len, kind, v, s = 1, o = {}) => {
            const ex = x + Math.cos(dir) * len, ey = y + Math.sin(dir) * len + (kind === 'fruitlet' ? len * 0.3 : 0);
            const bow = (o.bow ?? 0.14) * len, mx = (x + ex) / 2 - Math.sin(dir) * bow, my = (y + ey) / 2 + Math.cos(dir) * bow;
            const end = Math.atan2(ey - my, ex - mx);
            if (len > 2) C.branch(g, [[x, y], [mx, my], [ex, ey]], { w0: 3.1 * s, w1: (kind === 'fruitlet' ? 3 : 2.5) * s, green: [0, 0], seed: 'ped' + kind + v + Math.round(x), shadeA: 0.8 });
            const rs = Q(res, 1.6 * s);
            let sp, rot, px = ex, py = ey;
            if (kind === 'bud' || kind === 'round') {
                rot = end;
                sp = C.bud(v, rot, rs, kind === 'bud');
            } else if (kind === 'fruitlet') {
                rot = o.rot ?? (end - Math.PI / 2) * 0.5;
                sp = C.fruitlet(v, rot, rs);
                const [ox, oy] = turn(sp.top[0] * s, sp.top[1] * s, rot);
                px -= ox;
                py -= oy;
            } else if (kind === 'face') {
                rot = o.rot ?? v * 2.4;
                sp = C.flower(v, rot, rs, 'face');
            } else {
                rot = end + Math.PI / 2;
                sp = kind === 'spent' ? C.spent(v, rot, rs) : C.flower(v, rot, rs, kind);
                const [ox, oy] = turn(sp.base[0] * s, sp.base[1] * s, rot);
                px -= ox;
                py -= oy;
            }
            if (o.sh !== 0) C.shadow(g, sp, px, py, s, { rot, dx: 5 * s, dy: 8 * s, alpha: o.sh ?? 0.42, blur: 6 });
            C.put(g, sp, px, py, s, { rot });
            return { x: px, y: py, rot, s };
        };
        P.petal = (x, y, rot, v, o = {}) => {
            const sp = C.petal('loose' + v, rot, Q(res, 1.6), { len: 40 + (v % 3) * 4, wid: 11.5, cup: 0.9, old: o.old ?? 0, out: o.out ?? 0 });
            C.shadow(g, sp, x, y, 1, { rot, dx: 2.5, dy: 4, alpha: 0.45, blur: 3 });
            C.put(g, sp, x, y, o.s ?? 1, { rot, fy: o.fy ?? 0.8 });
        };
        P.drop = (x, y, r, o = {}) => {
            const Fd = F('drop');
            if (Fd && !o.hang) Fd.drop(g, { x, y, r, ...o });
            else C.drop(g, { x, y, r, hang: o.hang ?? 0, sq: o.squash ?? 1 });
        };
        return P;
    }
    const track = (ctrl, seg = 14) => {
        const pts = ctrl.length > 2 ? S.curve(ctrl, false, seg) : ctrl, D = [0];
        for (let i = 1; i < pts.length; i++) D.push(D[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        const len = D[D.length - 1];
        return { pts, len, at: (d) => {
            d = Math.max(0, Math.min(len, d));
            let i = 1;
            while (i < pts.length - 1 && D[i] < d) i++;
            const k = (d - D[i - 1]) / (D[i] - D[i - 1] || 1), p = pts[i - 1], q = pts[i];
            return { x: p[0] + (q[0] - p[0]) * k, y: p[1] + (q[1] - p[1]) * k, a: Math.atan2(q[1] - p[1], q[0] - p[0]) };
        } };
    };
    // a shoot the way it grows (see `shoot` in the picture above)
    function shoot(P, o) {
        const r = Motion.rng('lshoot' + o.seed), T = track(o.path), g = P.g, s = o.s ?? 1;
        const nodes = [];
        let d = (o.from ?? 0.08) * T.len, side = r() < 0.5 ? 1 : -1;
        while (d < T.len * (o.to ?? 0.985)) {
            nodes.push({ d, u: d / T.len, side });
            side = r() < 0.86 ? -side : side;
            d += (o.gap ?? 46) * s * (0.72 + r() * 0.56) * (1 - 0.42 * (d / T.len));
        }
        const kinds = o.kinds ?? ['sun', 'mid', 'mid', 'mid', 'deep'];
        const leaves = [];
        for (const n of nodes) {
            n.leaf = r() < (o.leafy ?? 0.94);
            const p = T.at(n.d);
            let a = p.a + n.side * (0.5 + r() * 0.62);
            a += (o.droop ?? 0.3) * (0.4 + r() * 0.9) * Math.sin(Math.PI / 2 - a);
            let kind = kinds[Math.floor(r() * kinds.length)];
            if (o.tip === 'flush' && n.u > 0.7) kind = r() < 0.55 ? 'bronze' : 'young';
            else if (n.u > 0.88 && r() < 0.4 && !o.plain) kind = 'young';
            else if (!o.plain && r() < 0.035) kind = 'old';
            else if (!o.plain && r() < 0.05) kind = 'under';
            const small = kind === 'young' || kind === 'bronze';
            const ls = s * (o.leaf ?? 1) * (0.8 + r() * 0.38) * (small ? 1 : 1 - 0.22 * n.u * n.u), edge = r() < 0.1;
            const L = { x: p.x, y: p.y, a, kind, s: ls, pick: Math.floor(r() * 97), fx: 0.64 + r() * 0.36, fy: edge ? 0.14 + r() * 0.16 : 0.56 + r() * 0.44, front: r() < 0.5 };
            if (n.leaf) leaves.push(L);
        }
        for (const l of leaves) if (!l.front) l.got = P.leaf(l.x, l.y, l.a, l.s, l.kind, l.pick, l);
        const fruit = (f) => {
            const p = T.at(f.u * T.len), e = [p.x + f.e[0], p.y + f.e[1]], fs = f.s ?? 1.2;
            const stalk = () => P.stalk([[p.x, p.y], [p.x + f.e[0] * 0.3, p.y + f.e[1] * 0.55], e], 5 * fs, 6 * fs, 'stalk' + o.seed + f.v);
            if (f.view !== 'stalk') stalk();
            f.got = P.lemon(e[0], e[1], f.rot ?? 0, fs, f.v, { age: f.age, view: f.view });
            if (f.view === 'stalk') stalk();
        };
        for (const f of o.fruits ?? []) if (f.behind) fruit(f);
        P.wood(T.pts, { raw: true, w0: (o.w0 ?? 7) * s, w1: (o.w1 ?? 3) * s, green: o.green ?? [0, 0], seed: 'lwood' + o.seed, nodes: nodes.map((n) => n.d), taper: o.taper });
        for (const n of nodes) {
            const p = T.at(n.d), w = ((o.w0 ?? 7) + ((o.w1 ?? 3) - (o.w0 ?? 7)) * n.u) * s;
            if (!n.leaf && o.scars !== false && w > 5) C.scar(g, p.x - Math.sin(p.a) * n.side * w * 0.2, p.y + Math.cos(p.a) * n.side * w * 0.2, p.a + (n.side > 0 ? 0 : Math.PI), Math.min(11, w * 0.7));
            if (r() < (o.thorns ?? 0)) {
                const a = p.a + n.side * (1.15 + r() * 0.5), len = (8 + r() * r() * 22) * s;
                C.thorn(g, p.x + Math.cos(a) * w * 0.3, p.y + Math.sin(a) * w * 0.3, a, len, o.seed + n.d);
            }
        }
        for (const f of o.fruits ?? []) if (!f.behind) fruit(f);
        for (const l of leaves) if (l.front) l.got = P.leaf(l.x, l.y, l.a, l.s, l.kind, l.pick, l);
        if (Array.isArray(o.tip)) {
            const e = T.at(T.len);
            for (const [dir, len, kind, v, fs, extra] of o.tip) P.bloom(e.x, e.y, e.a + dir, len, kind, v, (fs ?? 1) * s, extra);
        }
        return { T, nodes, fruits: o.fruits, leaves };
    }
    const dew = (P, sh, n, seed) => {
        const r = Motion.rng('ldew' + seed);
        for (const l of sh.leaves.filter((l) => l.front && l.got).slice(0, n)) {
            for (let i = 0, m = 1 + Math.floor(r() * 2.6); i < m; i++) P.drop(...l.got.at(0.2 + r() * 0.6, 0.15 + r() * 0.6, r() < 0.5 ? 0 : 1), 2 + r() * r() * 4.5);
        }
    };
    const sprig = (P, x, y, dir, len, seed, o = {}) => {
        const sag = (o.sag ?? 0.16) * len * Math.cos(dir), bend = (o.bend ?? 0) * len;
        const nx = -Math.sin(dir), ny = Math.cos(dir);
        return shoot(P, {
            path: [[x, y], [x + Math.cos(dir) * len * 0.36 + nx * bend * 0.6, y + Math.sin(dir) * len * 0.36 + ny * bend * 0.6 + Math.abs(sag) * 0.2], [x + Math.cos(dir) * len * 0.72 + nx * bend, y + Math.sin(dir) * len * 0.72 + ny * bend + Math.abs(sag) * 0.6], [x + Math.cos(dir) * len + nx * bend * 0.8, y + Math.sin(dir) * len + ny * bend * 0.8 + Math.abs(sag)]],
            seed, w0: 5.6, w1: 2.6, gap: 42, ...o,
        });
    };
    // the finch's fallen feather: a black vane with a yellow edge, grey down at its foot
    const feather = (g, x, y, rot, len = 30) => {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.lineCap = 'round';
        const r = Motion.rng('lfeather' + x);
        for (let i = 0; i < 12; i++) {
            const a = (r() - 0.5) * 2.6;
            g.strokeStyle = `rgba(206,204,208,${0.4 + r() * 0.4})`;
            g.lineWidth = 0.5;
            g.beginPath();
            g.moveTo(len * 0.12 + r() * len * 0.14, 0);
            g.quadraticCurveTo(len * 0.1 + Math.cos(a) * 3, Math.sin(a) * 4, len * 0.08 + Math.cos(a) * 5, Math.sin(a) * (5 + r() * 3));
            g.stroke();
        }
        for (const [side, col, w] of [[-1, '#24211f', 5], [-1, '#45403a', 2.4], [1, '#d8ae24', 4.2], [1, '#f4d860', 2]]) {
            for (let i = 0; i < 44; i++) {
                const u = 0.2 + (i / 44) * 0.79, wd = w * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.75)), 0.7) * (i % 11 === 7 ? 0.55 : 0.9 + r() * 0.2);
                g.strokeStyle = col;
                g.lineWidth = 0.7;
                g.beginPath();
                g.moveTo(u * len, -0.8 * Math.sin(u * Math.PI));
                g.quadraticCurveTo(u * len + wd * 0.3, side * wd * 0.6, u * len + wd * 0.8, side * wd);
                g.stroke();
            }
        }
        g.strokeStyle = '#f0e8d0';
        g.lineWidth = 0.75;
        g.beginPath();
        g.moveTo(0, 0);
        g.quadraticCurveTo(len * 0.5, -0.8, len, 0);
        g.stroke();
        g.restore();
    };

    // ---------------------------------------------------------------- the light through the tree
    // One map of sun and shade for the whole stratum (in its units), laid on each piece's paint:
    // pieces that float apart still stand in the same patches of sun.
    const BIG = { x: -1800, y: -1800, w: 3600, h: 3600 };
    function relight(g, box, res, paint, o = {}) {
        const W = g.canvas.width, H = g.canvas.height, f = 0.25;
        const small = canvas(Math.ceil(W * f), Math.ceil(H * f)), q = small.getContext('2d');
        q.fillStyle = '#808080';
        q.fillRect(0, 0, small.width, small.height);
        q.setTransform(res * f, 0, 0, res * f, -box.x * res * f, -box.y * res * f);
        paint(q, box);
        const map = canvas(W, H), mq = map.getContext('2d', { willReadFrequently: true });
        mq.imageSmoothingQuality = 'high';
        mq.drawImage(small, 0, 0, W, H);
        const L = mq.getImageData(0, 0, W, H).data;
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        const img = g.getImageData(0, 0, W, H), px = img.data;
        const sunK = o.sun ?? 1, shK = o.shade ?? 1;
        for (let i = 0; i < px.length; i += 4) {
            if (!px[i + 3]) continue;
            const l = L[i];
            if (l > 129) {
                const k = ((l - 128) / 127) * sunK;
                px[i] = Math.min(252, px[i] * (1 + 0.42 * k) + 16 * k);
                px[i + 1] = Math.min(252, px[i + 1] * (1 + 0.36 * k) + 12 * k);
                px[i + 2] = Math.min(246, px[i + 2] * (1 + 0.1 * k));
            } else if (l < 127) {
                const k = ((128 - l) / 128) * shK;
                px[i] *= 1 - 0.52 * k;
                px[i + 1] *= 1 - 0.38 * k;
                px[i + 2] *= 1 - 0.27 * k;
            }
        }
        g.putImageData(img, 0, 0);
        g.restore();
    }
    // The map: the blobs are drawn once as a list (in the stratum's units), and each piece only
    // draws those that touch it.
    const SUN = (() => {
        const r = Motion.rng('loose-dapple'), list = { pools: [], suns: [], flecks: [] }, b = BIG;
        for (let i = 0; i < 70; i++) list.pools.push([b.x + r() * b.w, b.y + r() * b.h, 110 + r() * 220, 70 + r() * 130, r() * 3, `rgba(0,0,0,${0.16 + r() * 0.3})`]);
        for (let i = 0; i < 130; i++) {
            const x = b.x + r() * b.w, y = b.y + r() * b.h, a = 0.75 + (r() - 0.5) * 0.7, n = 2 + Math.floor(r() * 5), al = 0.35 + r() * 0.5;
            for (let j = 0; j < n; j++) list.suns.push([x + (r() - 0.5) * 150, y + (r() - 0.5) * 110, 22 + r() * 70, 10 + r() * 30, a + (r() - 0.5) * 0.5, `rgba(255,255,255,${al})`]);
        }
        for (let i = 0; i < 200; i++) list.flecks.push([b.x + r() * b.w, b.y + r() * b.h, 6 + r() * 12, 4 + r() * 8, 0.75 + (r() - 0.5), `rgba(255,255,255,${0.25 + r() * 0.45})`]);
        return list;
    })();
    const dapple = (q, box) => {
        const m = q.getTransform();
        const group = (blur, list) => {
            const c = canvas(q.canvas.width, q.canvas.height), p = c.getContext('2d');
            p.setTransform(m);
            for (const [x, y, rx, ry, a, col] of list) {
                const R = Math.max(rx, ry) + blur * 3;
                if (x + R < box.x || x - R > box.x + box.w || y + R < box.y || y - R > box.y + box.h) continue;
                p.fillStyle = col;
                p.beginPath();
                p.ellipse(x, y, rx, ry, a, 0, TAU);
                p.fill();
            }
            q.save();
            q.setTransform(1, 0, 0, 1, 0, 0);
            q.filter = `blur(${(blur * m.a).toFixed(2)}px)`;
            q.drawImage(c, 0, 0);
            q.restore();
        };
        // the tree is lighter towards the sun (the top left of the stratum)
        const gr = q.createLinearGradient(-1300, -1300, 1300, 1300);
        gr.addColorStop(0, 'rgba(255,255,255,0.16)');
        gr.addColorStop(0.5, 'rgba(128,128,128,0)');
        gr.addColorStop(1, 'rgba(0,0,0,0.24)');
        q.fillStyle = gr;
        q.fillRect(box.x, box.y, box.w, box.h);
        group(22, SUN.pools);
        group(7, SUN.suns);
        group(3.5, SUN.flecks);
    };
    // air between the eye and what is deep in the tree: its paint drifts to the tree's blue-green
    const air = (g, box, dz) => {
        const k = S.clamp((dz - 60) / 390);
        if (k <= 0) return;
        g.save();
        g.globalCompositeOperation = 'source-atop';
        g.fillStyle = `rgba(22,64,62,${(0.3 * k).toFixed(3)})`;
        g.fillRect(box.x, box.y, box.w, box.h);
        g.restore();
    };

    const layers = [];
    const sq = (cx, cy, half) => ({ x: cx - half, y: cy - half, w: half * 2, h: half * 2 });
    // The core the rest keeps out of: its edge wanders with angle (and turns slowly with depth)
    const edge = (a, dz) => {
        const p = a + dz / 520, n = S.noise2(Math.cos(p) * 1.4 + 3.7, Math.sin(p) * 1.4 + 8.1) + 0.5 * S.noise2(Math.cos(p) * 3.3 + 11.2, Math.sin(p) * 3.3 + 2.4);
        return 175 + 210 * S.clamp(0.5 + 0.75 * n);
    };
    // When a piece may come out of the night: the guitar's body (its outline about the mouth)
    // hides what is behind it; a piece fades in from when the guitar is 600 away, or from when
    // the body first hides it whole if it is still seen round the guitar then.
    const BODY = typeof Guitar !== 'undefined' && Guitar.outline ? Guitar.outline(1) : S.ellipse(0, 135, 250, 360, 48);
    const inBody = (x, y) => {
        let c = false;
        for (let i = 0, j = BODY.length - 1; i < BODY.length; j = i++) {
            const [xi, yi] = BODY[i], [xj, yj] = BODY[j];
            if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
        }
        return c;
    };
    const toEdge = (x, y) => {
        let m = Infinity;
        for (let i = 0, j = BODY.length - 1; i < BODY.length; j = i++) {
            const [ax, ay] = BODY[j], [bx, by] = BODY[i], ex = bx - ax, ey = by - ay;
            const u = S.clamp(((x - ax) * ex + (y - ay) * ey) / (ex * ex + ey * ey || 1));
            m = Math.min(m, Math.hypot(x - ax - ex * u, y - ay - ey * u));
        }
        return m;
    };
    const farOf = (cx, cy, e, dz) => {
        const D = GZ + dz;
        let d1 = 70;
        for (let d = 1800; d >= 70; d -= 10) {
            const k = d / (d + D), x = cx * k, y = cy * k;
            if (inBody(x, y) && toEdge(x, y) >= e * k + 6) {
                d1 = d;
                break;
            }
        }
        const d0 = Math.max(75, Math.min(d1, 600)), dE = Math.max(66, d0 * 0.67);
        return [1000 / (d0 + D), 1000 / (dE + D)];
    };
    // a piece: `draw(P, g)` paints it at (cx, cy) in the stratum, in its local units (translated
    // there, never turned: the light stays where it is)
    const add = (id, dz, cx, cy, half, draw, o = {}) => {
        const box = sq(cx, cy, half);
        layers.push({
            id: 'lemons-l-' + id, z: z0 + dz, loose: true, brush: false, box, far: farOf(cx, cy, half * 0.75, dz),
            paint(g, res) {
                const P = painter(g, res);
                g.save();
                g.translate(cx, cy);
                draw(P, g);
                g.restore();
                relight(g, box, res, dapple, { sun: o.sun ?? 0.9, shade: 1.1 });
                air(g, box, dz);
                S.tooth(g, box, { amp: 0.05 });
            },
        });
        return { x: cx, y: cy, half, dz };
    };

    // ---------------------------------------------------------------- heroes
    const heroes = [];
    // a spur with two lemons touching, the turning one behind the ripe one, dew on them
    heroes.push(add('spur', -150, -500, -330, 400, (P) => {
        const T = shoot(P, { seed: 'tL', path: [[-110, -120], [-70, -62], [-8, 0], [36, 36]], w0: 8, w1: 6, gap: 36, green: [0.1, 0.7], kinds: ['sun', 'mid', 'sun'], thorns: 0.4,
            fruits: [{ u: 0.42, e: [-38, 36], s: 1.12, v: 1, age: 'turning', rot: -0.25, behind: true }, { u: 1, e: [8, 26], s: 1.32, v: 3, age: 'ripe', rot: 0.12 }] });
        sprig(P, -110, -120, -2.4, 150, 'spur-back', { kinds: ['mid', 'sun', 'deep'], w0: 7, w1: 4 });
        dew(P, T, 2, 'spur');
        const L1 = T.fruits[1].got, tip = (f) => f.at(f.sp.G.tip[0], f.sp.G.tip[1] + 3);
        for (const [x, y, rad] of [[-22, -50, 7], [16, 30, 4.5], [-38, 52, 3]]) P.drop(...L1.at(x, y), rad);
        P.drop(...tip(L1), 3.2, { hang: 0.4 });
    }));
    // the over-ripe one, scarred, on its twig
    heroes.push(add('over', 40, 640, 220, 340, (P) => {
        shoot(P, { seed: 'tO', path: [[-30, -150], [-4, -86], [12, -26], [18, 14]], w0: 7, w1: 5.5, gap: 34, green: [0.1, 0.6], kinds: ['mid', 'sun', 'deep'], thorns: 0.4,
            fruits: [{ u: 1, e: [2, 26], s: 1.3, v: 4, age: 'over', rot: 0.06 }] });
    }));
    // a lemon seen from below, its nipple at the eye
    heroes.push(add('below', 260, -180, 560, 320, (P) => {
        shoot(P, { seed: 'tT1', path: [[-90, -110], [-50, -60], [-12, -20], [0, 0]], w0: 7, w1: 5.5, gap: 32, green: [0.2, 0.8], kinds: ['sun', 'mid', 'back'], fruits: [{ u: 1, e: [0, 8], s: 1.3, v: 6, view: 'tip', rot: 0.1 }] });
    }));
    // one seen from above, the button in its dimple
    heroes.push(add('above', -40, 340, -480, 320, (P) => {
        shoot(P, { seed: 'tS', path: [[90, -110], [56, -60], [20, -20], [0, 2]], w0: 7, w1: 5, gap: 34, to: 0.7, kinds: ['sun', 'mid'], fruits: [{ u: 1, e: [-4, 12], s: 1.25, v: 7, view: 'stalk', rot: -0.1 }] });
    }));
    // two ripe ones under a leaf whose shadow lies across the nearer
    heroes.push(add('pair', -270, 420, 420, 340, (P, g) => {
        const T = shoot(P, { seed: 'tR', path: [[-40, -80], [-14, -50], [6, -30], [18, -16]], w0: 7.5, w1: 6, gap: 22, from: 0.3, leafy: 0, green: [0.1, 0.7],
            fruits: [{ u: 0.35, e: [-56, 30], s: 1.1, v: 5, age: 'ripe', rot: 0.2, behind: true }, { u: 1, e: [0, 22], s: 1.32, v: 9, age: 'ripe', rot: -0.18 }] });
        const sp = C.leaf(leafV('sun', 0.95, 2), 0.95, Q(P.res, 1.5), 'sun');
        C.shadow(g, sp, -20, -56, 1.12, { rot: 0.95, fx: 0.9, dx: 26, dy: 34, alpha: 0.5, blur: 11 });
        const lf = P.leaf(-34, -66, 0.95, 1.12, 'sun', 2, { fx: 0.9, sh: 0 });
        P.drop(...lf.at(0.42, 0.4, 1), 5);
        P.drop(...lf.at(0.6, 0.3, 0), 3);
        const R1 = T.fruits[1].got;
        for (const [x, y, rad] of [[24, 40, 6.5], [-18, -44, 3.6]]) P.drop(...R1.at(x, y), rad);
    }));
    // a green one and a turning one on one twig
    heroes.push(add('greens', 400, 760, -420, 330, (P) => {
        shoot(P, { seed: 'tG', path: [[-120, -90], [-70, -50], [-20, -4], [10, 24]], w0: 7, w1: 5, gap: 30, leafy: 0.8, kinds: ['mid', 'sun', 'deep'],
            fruits: [{ u: 0.5, e: [-10, 34], s: 1.05, v: 10, age: 'green', rot: 0.05, behind: true }, { u: 1, e: [0, 8], s: 1.12, v: 8, age: 'turning', rot: -0.2 }] });
    }));
    // blossom: a spray of every stage, with dew
    heroes.push(add('blossom', 120, 80, -660, 330, (P) => {
        const K = shoot(P, { seed: 'k1', path: [[-100, 50], [-46, -8], [28, -40], [102, -20]], w0: 6, w1: 3.4, gap: 38, kinds: ['sun', 'mid', 'young'], thorns: 0.3,
            tip: [[-1.9, 34, 'bud', 1, 1], [-1.2, 46, 'tilt', 1, 0.95], [-0.5, 30, 'round', 2, 1], [0.1, 54, 'face', 0, 1], [0.75, 40, 'half', 3, 0.95], [1.5, 36, 'bud', 4, 0.9], [2.3, 24, 'round', 5, 1]] });
        dew(P, K, 2, 'k1');
    }));
    // blossom with a bee feeding on it
    heroes.push(add('blossom-bee', -220, 700, -120, 330, (P, g) => {
        const K = shoot(P, { seed: 'k2', path: [[-66, 70], [-40, 4], [6, -42], [64, -58]], w0: 6.5, w1: 3.4, gap: 40, kinds: ['sun', 'mid', 'sun'], thorns: 0.3,
            tip: [[-2.2, 30, 'round', 6, 1], [-1.4, 50, 'side', 2, 0.95], [-0.7, 38, 'bud', 7, 1], [0.0, 58, 'face', 5, 1.02], [0.8, 44, 'tilt', 4, 0.95], [1.5, 40, 'bud', 8, 0.95], [2.1, 30, 'spent', 1, 1]] });
        dew(P, K, 2, 'k2');
        if (F('bee')) Fauna.bee(g, { x: 116, y: -50, s: 0.9, rot: 0.5, pose: 'feed', line: false });
    }));
    // blossom going over: spent flowers and fruit just set
    heroes.push(add('fruitset', 300, -700, 300, 350, (P) => {
        const K = shoot(P, { seed: 'k3', path: [[-154, 84], [-54, 2], [58, -48], [158, -54]], w0: 7, w1: 3.6, gap: 40, green: [0.05, 0.4], kinds: ['sun', 'mid', 'sun', 'mid'], thorns: 0.35,
            tip: [[-2.1, 34, 'spent', 2, 1], [-1.35, 52, 'face', 3, 1], [-0.6, 40, 'bud', 9, 1], [0.1, 62, 'side', 1, 1], [0.7, 30, 'round', 10, 1], [1.2, 56, 'tilt', 6, 1], [1.9, 44, 'half', 2, 0.95], [2.6, 30, 'fruitlet', 1, 1.1], [3.1, 26, 'fruitlet', 2, 1]] });
        dew(P, K, 3, 'k3');
    }));
    // the goldfinch on its twig, looking back over its shoulder
    heroes.push(add('goldfinch', -60, -720, -40, 380, (P, g) => {
        shoot(P, { seed: 'perch', path: [[-190, 60], [-80, 26], [40, 8], [170, -40]], w0: 8, w1: 3.4, gap: 44, kinds: ['sun', 'mid', 'mid', 'back'], thorns: 0.3, tip: 'flush' });
        if (F('goldfinch')) Fauna.goldfinch(g, { x: -12, y: -58, s: 2.1, flip: true, pose: 0, line: false, perch: [-80, 26, 40, 8] });
    }));
    // a stretch of the big bough: ants going up and down, the snail on its way, a pruned stub
    heroes.push(add('bough', 180, 120, 780, 560, (P, g) => {
        const A = track([[-300, 60], [-150, 20], [0, -8], [150, -20], [300, -64]]);
        for (const [u, dir] of [[0.12, -1.9], [0.3, 1.5], [0.55, -1.4], [0.7, 1.8], [0.9, -1.2]]) {
            const p = A.at(A.len * u);
            sprig(P, p.x, p.y, p.a + dir, 150 + (u * 100) % 50, 'bough-s' + u, { thorns: 0.25, kinds: ['sun', 'mid', 'mid', 'deep'] });
        }
        C.branch(g, A.pts, { raw: true, w0: 32, w1: 20, seed: 'bough-L', nodes: [120, 300, 470] });
        const st = A.at(A.len * 0.38);
        C.branch(g, [[st.x, st.y], [st.x + 14, st.y - 24], [st.x + 22, st.y - 42]], { w0: 20, w1: 17, seed: 'lstub' });
        C.cut(g, st.x + 24, st.y - 46, -1.05, 18, 3);
        for (const u of [0.18, 0.5, 0.64, 0.82]) {
            const p = A.at(A.len * u);
            C.scar(g, p.x + 3, p.y - 5, p.a, 9);
        }
        for (const [u, off, back] of [[0.08, -6, 0], [0.13, 3, 1], [0.2, -3, 0], [0.26, 5, 0], [0.6, -5, 1], [0.7, 2, 0], [0.74, -4, 0], [0.86, 3, 1]]) {
            const p = A.at(A.len * u);
            C.ant(g, { x: p.x - Math.sin(p.a) * off, y: p.y + Math.cos(p.a) * off, rot: p.a + (back ? Math.PI : 0) + (off % 2 ? 0.2 : -0.15), s: 1.35 });
        }
        const sp0 = A.at(A.len * 0.47);
        if (F('snail')) Fauna.snail(g, { x: sp0.x + 6, y: sp0.y - 30, s: 0.9, rot: sp0.a, line: false, trail: 60 });
    }));
    // a forked twig holding the web, dew strung on it
    heroes.push(add('web', 220, 860, 120, 400, (P, g) => {
        P.wood([[0, 120], [-2, 60], [0, 0]], { w0: 10, w1: 8, seed: 'fork0' });
        sprig(P, 0, 0, -2.25, 170, 'fork-l', { w0: 7, w1: 3, kinds: ['mid', 'sun', 'deep'] });
        sprig(P, 0, 0, -0.75, 170, 'fork-r', { w0: 7, w1: 3, kinds: ['mid', 'back', 'sun'] });
        if (F('web')) Fauna.web(g, { x: 0, y: 0, r: 110, a0: -2.2, a1: -0.8, seed: 'lfork' });
    }));
    // a flush of young growth, bronze and limp
    heroes.push(add('flush', 100, -900, 600, 380, (P) => {
        sprig(P, -120, 110, -0.75, 280, 'flush', { kinds: ['mid', 'sun'], tip: 'flush', w0: 6, w1: 2.4 });
    }));
    // the swallowtail, wings half open
    heroes.push(add('swallowtail', -250, -380, 620, 140, (P, g) => {
        if (F('butterfly')) Fauna.butterfly(g, { x: 0, y: 0, s: 1.7, rot: -0.5, fold: 0.3, line: false });
    }));

    // ---------------------------------------------------------------- matter
    const r = Motion.rng('lemons-loose');
    const KINDS = [
        ...Array(17).fill('leaf'), ...Array(24).fill('twig'), ...Array(11).fill('lemon'), ...Array(4).fill('petal'), ...Array(6).fill('flower'),
        ...Array(5).fill('buds'), ...Array(4).fill('fruitlets'), ...Array(3).fill('thorny'), 'bee', 'bee', 'ladybird', 'ants', 'feather', 'dead', 'dead',
    ];
    for (let i = KINDS.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [KINDS[i], KINDS[j]] = [KINDS[j], KINDS[i]];
    }
    // how far each kind's paint reaches from its place
    const EXT = { leaf: 150, twig: 250, lemon: 190, petal: 40, flower: 75, buds: 80, fruitlets: 75, thorny: 200, bee: 40, ladybird: 180, ants: 240, feather: 40, dead: 150 };
    const placed = heroes.slice();
    const clearOf = (x, y, half, dz) => {
        for (const p of placed) if (Math.abs(p.dz - dz) < 80 && Math.hypot(p.x - x, p.y - y) < (p.half + half) * 0.6) return false;
        return true;
    };
    const N = KINDS.length, GOLD = Math.PI * (3 - Math.sqrt(5));
    const LEAVES = ['sun', 'sun', 'mid', 'mid', 'mid', 'back', 'back', 'young', 'bronze', 'old', 'deep'];
    KINDS.forEach((kind, i) => {
        const dz = -300 + 750 * ((i + r()) / N), half = EXT[kind];
        let a = i * GOLD + r() * 0.5, out = half * 0.85 + 1150 * Math.pow(r(), 1.25), R, x, y, tries = 0;
        do {
            R = edge(a, dz) + out;
            x = Math.cos(a) * R;
            y = Math.sin(a) * R;
            if (clearOf(x, y, half, dz)) break;
            out += 35;
            a += 0.15;
        } while (++tries < 40);
        placed.push({ x, y, half, dz });
        // sprites come from small pools (a lemon, a flower, a petal is painted once per variant, light and size)
        const rot = r() * TAU, pick = Math.floor(r() * 97), v = pick % 12, seed = 'lm' + i;
        const draw = {
            leaf: (P) => {
                const kind = LEAVES[pick % LEAVES.length], s = 0.72 + r() * 0.25;
                const lf = P.leaf(-Math.cos(rot) * 40 * s, -Math.sin(rot) * 40 * s, rot, s, kind, pick, { fx: 0.75 + r() * 0.25, fy: 0.55 + r() * 0.45, sh: 0 });
                if (kind === 'sun' || kind === 'mid') P.drop(...lf.at(0.35 + r() * 0.4, 0.3, r() < 0.5 ? 0 : 1), 2.5 + r() * 3.5);
            },
            dead: (P) => P.leaf(-Math.cos(rot) * 80, -Math.sin(rot) * 80, rot, 0.8, 'old', pick, { dead: true, fx: 0.8, fy: 0.5 + r() * 0.4, sh: 0 }),
            twig: (P) => {
                const len = 120 + r() * 60, sh = sprig(P, -Math.cos(rot) * len * 0.5, -Math.sin(rot) * len * 0.5, rot, len, seed, { kinds: [LEAVES[pick % LEAVES.length], 'mid', 'sun', 'mid'], leaf: 0.72, thorns: 0.3, w0: 5, w1: 2.4, tip: r() < 0.25 ? 'flush' : undefined });
                if (r() < 0.4) dew(P, sh, 1, seed);
            },
            lemon: (P) => {
                const age = ['ripe', 'ripe', 'ripe', 'turning', 'green', 'over', 'ripe', 'turning'][pick % 8], s = [1, 1.12, 1.24][pick % 3];
                P.stalk([[-8, -60], [-3, -34], [0, -14]], 5, 6, seed + 'st', { shade: false });
                const L = P.lemon(0, -14, (r() - 0.5) * 0.5, s, v, { age });
                if (r() < 0.5) P.leaf(-8, -60, -2.2 + r() * 0.6, 0.72, ['sun', 'mid'][pick % 2], pick, { fx: 0.8, fy: 0.7 });
                if (r() < 0.6) P.drop(...L.at(-20 + r() * 30, -30 + r() * 50), 3 + r() * 3.5);
            },
            petal: (P) => {
                P.petal(0, 0, rot, v % 6, { old: [0, 0.45, 0.9][pick % 3], s: 1.1 });
                if (r() < 0.5) P.petal(16, 10, rot + 1.6, (v + 1) % 6, { old: [0.45, 0, 0.9][pick % 3], s: 0.95 });
            },
            flower: (P) => P.bloom(-Math.cos(rot) * 34, -Math.sin(rot) * 34, rot, 40, ['face', 'tilt', 'side', 'half', 'face'][pick % 5], v, 1.2, { sh: 0 }),
            buds: (P) => {
                for (const [d, len, k, w] of [[-0.7, 34, 'bud', 0], [0, 44, 'round', 1], [0.75, 30, 'bud', 2], [1.4, 26, 'round', 3]]) P.bloom(-Math.cos(rot) * 20, -Math.sin(rot) * 20, rot + d, len, k, (v % 5) * 4 + w, 1.15, { sh: 0.3 });
            },
            fruitlets: (P) => {
                for (const [d, len, k, w] of [[-0.6, 30, 'fruitlet', 0], [0.2, 36, 'spent', 1], [0.9, 28, 'fruitlet', 2]]) P.bloom(-Math.cos(rot) * 20, -Math.sin(rot) * 20, rot + d, len, k, (v % 4) * 3 + w, 1.2, { sh: 0.3 });
            },
            thorny: (P, g) => {
                const sh = shoot(P, { seed, path: [[-Math.cos(rot) * 90, -Math.sin(rot) * 90], [-Math.cos(rot) * 30, -Math.sin(rot) * 30 + 8], [Math.cos(rot) * 30, Math.sin(rot) * 30 + 6], [Math.cos(rot) * 90, Math.sin(rot) * 90]], w0: 11, w1: 7, gap: 40, leafy: 0.3, leaf: 0.7, thorns: 0.9, kinds: ['old', 'mid'] });
                C.cut(g, sh.T.pts[0][0], sh.T.pts[0][1], rot + Math.PI, 11, i);
            },
            bee: (P, g) => F('bee') && Fauna.bee(g, { x: 0, y: 0, s: 1.15, rot: rot, flip: rot > Math.PI, pose: 'fly', line: false, cast: false }),
            ladybird: (P, g) => {
                const lf = P.leaf(-Math.cos(rot) * 80, -Math.sin(rot) * 80, rot, 0.8, 'sun', pick, { fx: 0.9, fy: 0.8, sh: 0 });
                if (F('ladybird')) Fauna.ladybird(g, { x: lf.at(0.5, 0)[0], y: lf.at(0.5, 0)[1], s: 1.2, rot: rot + 0.4, line: false });
            },
            ants: (P, g) => {
                const sh = sprig(P, -Math.cos(rot) * 80, -Math.sin(rot) * 80, rot, 160, seed, { kinds: ['mid', 'sun'], leaf: 0.72, w0: 8, w1: 4, leafy: 0.5 });
                for (const u of [0.2, 0.34, 0.5, 0.66]) {
                    const p = sh.T.at(sh.T.len * u);
                    C.ant(g, { x: p.x, y: p.y + (u > 0.4 ? -2 : 2), rot: p.a + (u === 0.34 ? Math.PI : 0), s: 1.35 });
                }
            },
            feather: (P, g) => feather(g, -20, 0, rot, 44),
        }[kind];
        add(kind + i, dz, x, y, EXT[kind] * 1.35 + 40, draw);
    });

    // ---------------------------------------------------------------- across the axis
    // A fifth of the matter lies across the axis, most of it deep (z0 + 150 … 450): through the
    // guitar's mouth it is lemons and leaves; the camera flies through each one (it grows, blurs
    // and fades in its last 85 units).
    const rx = Motion.rng('lemons-across');
    const ACROSS = ['leaf', 'lemon', 'leaf', 'flower', 'leaf', 'petal', 'lemon', 'leaf', 'twig', 'leaf', 'flower', 'lemon', 'petal', 'leaf', 'buds', 'leaf', 'lemon', 'petal', 'twig', 'leaf'];
    ACROSS.forEach((kind, i) => {
        const deep = i % 10 < 7, n = deep ? 14 : 6, j = deep ? Math.floor((i * 7) / 10) : i % 6;
        const dz = deep ? 150 + 300 * ((j % n) + rx()) / n : -300 + 450 * ((j % n) + rx()) / n;
        const a = rx() * TAU, rot = rx() * TAU, pick = Math.floor(rx() * 97), v = pick % 12, seed = 'ax' + i;
        let R = 30 + 150 * Math.pow(rx(), 0.8), x = Math.cos(a) * R, y = Math.sin(a) * R, tries = 0;
        while (!clearOf(x, y, 90, dz) && ++tries < 20) {
            R += 25;
            x = Math.cos(a + tries) * R;
            y = Math.sin(a + tries) * R;
        }
        placed.push({ x, y, half: 90, dz });
        const draw = {
            leaf: (P) => {
                const k = ['sun', 'mid', 'back', 'sun', 'young', 'mid'][pick % 6], s = 0.75 + rx() * 0.25;
                const lf = P.leaf(-Math.cos(rot) * 90 * s, -Math.sin(rot) * 90 * s, rot, s, k, pick, { fx: 0.8 + rx() * 0.2, fy: 0.55 + rx() * 0.45, sh: 0 });
                if (rx() < 0.5) P.drop(...lf.at(0.35 + rx() * 0.4, 0.3, rx() < 0.5 ? 0 : 1), 2.5 + rx() * 3.5);
            },
            lemon: (P) => {
                P.stalk([[-8, -70], [-3, -40], [0, -22]], 5, 6, seed + 'st', { shade: false });
                const Lm = P.lemon(0, -22, (rx() - 0.5) * 0.5, pick % 2 ? 1.12 : 1.24, v, { age: ['ripe', 'ripe', 'turning', 'ripe', 'green'][pick % 5] });
                P.leaf(-8, -70, -2.4 + rx() * 1.2, 0.7, ['sun', 'mid'][pick % 2], pick, { fx: 0.85, fy: 0.7 });
                P.drop(...Lm.at(-16 + rx() * 26, -24 + rx() * 40), 3 + rx() * 3);
            },
            flower: (P) => {
                const hub = [-Math.cos(rot) * 30, -Math.sin(rot) * 30];
                for (const [d, len, k, w] of [[-0.8, 40, 'face', 0], [0, 46, 'tilt', 1], [0.8, 36, 'bud', 2], [1.5, 30, 'round', 3]]) P.bloom(hub[0], hub[1], rot + d, len, k, (v % 6) * 4 + w, 1.25, { sh: 0.3 });
            },
            buds: (P) => {
                for (const [d, len, k, w] of [[-0.7, 34, 'bud', 0], [0, 44, 'round', 1], [0.75, 30, 'bud', 2], [1.4, 26, 'round', 3]]) P.bloom(-Math.cos(rot) * 20, -Math.sin(rot) * 20, rot + d, len, k, (v % 5) * 4 + w, 1.2, { sh: 0.3 });
            },
            petal: (P) => {
                P.petal(0, 0, rot, v % 6, { old: [0, 0.45, 0.9][pick % 3], s: 1.2 });
                P.petal(20 * Math.cos(rot + 1.4), 20 * Math.sin(rot + 1.4), rot + 1.7, (v + 2) % 6, { old: [0.45, 0, 0.9][pick % 3], s: 1.05 });
            },
            twig: (P) => {
                const len = 170, sh = sprig(P, -Math.cos(rot) * len * 0.5, -Math.sin(rot) * len * 0.5, rot, len, seed, { kinds: ['sun', 'mid', 'back', 'mid'], leaf: 0.75, thorns: 0.3, w0: 5.5, w1: 2.4 });
                dew(P, sh, 1, seed);
            },
        }[kind];
        add('across-' + kind + i, dz, x, y, { leaf: 230, lemon: 260, flower: 150, buds: 130, petal: 90, twig: 340 }[kind], draw);
    });

    // ---------------------------------------------------------------- the lining
    // What fills the guitar's mouth as the camera goes through, and the frame from inside the
    // tree: single leaves pointing in at the axis, their tips stopping at the core's edge, and
    // lemons, flowers and petals just outside them, at every depth and more of them deep in
    // the tree (seen through the mouth from farther, they close the middle down).
    const rl = Motion.rng('lemons-lining'), NL = 104;
    for (let i = 0; i < NL; i++) {
        const dz = -300 + 750 * Math.pow((i + rl()) / NL, 0.7), a = i * GOLD * 1.0007 + 0.9 + rl() * 0.3, ca = Math.cos(a), sa = Math.sin(a);
        const k = i % 10, pick = Math.floor(rl() * 97), v = pick % 12, seed = 'ln' + i;
        if (k < 6) {
            // a leaf, its tip in: the node out at R, the blade along the way in, the tip 280–330 from the axis
            const kind = ['sun', 'mid', 'back', 'sun', 'young', 'mid', 'bronze', 'deep', 'mid', 'sun'][pick % 10], rot = a + Math.PI + (rl() - 0.5) * 0.5;
            const s = 0.66 + rl() * 0.34, fx = 0.82 + rl() * 0.18, G = C.leafGeom(leafV(kind, rot, pick), kind), L = (G.L + G.pl) * s * fx, R = edge(a, dz) + L + rl() * 50;
            add('lining-leaf' + i, dz, ca * (R - L / 2), sa * (R - L / 2), L * 0.8 + 70, (P) => {
                const lf = P.leaf(ca * L / 2, sa * L / 2, rot, s, kind, pick, { fx, fy: 0.5 + rl() * 0.5, sh: 0 });
                if (kind !== 'deep' && rl() < 0.5) P.drop(...lf.at(0.3 + rl() * 0.4, 0.3, rl() < 0.5 ? 0 : 1), 2.5 + rl() * 3.5);
            });
        } else if (k < 8) {
            // a lemon on its stalk, with a leaf
            const R = edge(a, dz) + 120 + rl() * 60, age = ['ripe', 'ripe', 'turning', 'green', 'ripe', 'over'][pick % 6];
            add('lining-lemon' + i, dz, ca * R, sa * R, 260, (P) => {
                P.stalk([[-8, -70], [-3, -40], [0, -22]], 5, 6, seed + 'st', { shade: false });
                const Lm = P.lemon(0, -22, (rl() - 0.5) * 0.5, pick % 2 ? 1 : 1.12, v, { age });
                P.leaf(-8, -70, a + Math.PI * (0.5 + rl()), 0.6, 'sun', pick, { fx: 0.85, fy: 0.7 });
                P.drop(...Lm.at(-16 + rl() * 26, -24 + rl() * 40), 3 + rl() * 3);
            });
        } else if (k === 8) {
            // an open flower on its pedicel, facing any way
            const R = edge(a, dz) + 70 + rl() * 50;
            add('lining-flower' + i, dz, ca * R, sa * R, 150, (P) => P.bloom(-ca * 30, -sa * 30, a + (rl() - 0.5), 40, ['face', 'tilt', 'face', 'half'][pick % 4], v, 1.25, { sh: 0 }));
        } else {
            // two fallen petals turning in the air
            const R = edge(a, dz) + 50 + rl() * 40;
            add('lining-petals' + i, dz, ca * R, sa * R, 110, (P) => {
                P.petal(0, 0, a + rl() * 3, v % 6, { old: [0, 0.45][pick % 2], s: 1.1 });
                P.petal(22 * Math.cos(a + 1.5), 22 * Math.sin(a + 1.5), a + 1.5 + rl() * 2, (v + 1) % 6, { old: [0.9, 0][pick % 2], s: 1 });
            });
        }
    }
    return layers;
};
