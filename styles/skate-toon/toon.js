// Skate toon style kit: the look of a late-'90s extreme-sports TV cartoon. A thin, even,
// hand-held black line that wanders a little, flat saturated colour with no shading, a yellow
// sky, sets in crooked perspective whose corners overshoot and whose surfaces carry loose tick
// marks. Global: SkateToon. Depends on engine/core.js. Characters are in kid.js (SkateKid).
//
// Sizes are in the caller's local units: pass `w` (line width) as LINE / scale when drawing
// under a scale, and wobble, sampling and overshoot follow it. Everything is seeded by the
// piece, never by the frame: a held drawing is identical on every frame.
const SkateToon = (() => {
    // Measured on the user's reference frames (flat promo art of the genre).
    const COL = {
        ink: '#120c0e',
        white: '#fffdf6',
        sky: '#ffe36d', skyDeep: '#fcd24a',
        sea: '#027da1', seaDeep: '#04628a', foam: '#ffffff',
        sand: '#e2c196', sandDeep: '#cfa672',
        road: '#3e7999', roadDeep: '#2f6482', roadLine: '#fef200',
        kerb: '#b9c6cc', concrete: '#ccdcd4', concreteDeep: '#a9bcb6',
        wood: '#ad923b', woodDeep: '#665002', trunk: '#a8630a',
        palm: '#3f5a26', palmLight: '#5d7f33',
        teal: '#84ccbc', glass: '#ccecf4', salmon: '#fcac84', orange: '#f47c3c', peach: '#fcac54',
        skin: '#fcb950', skinPale: '#fcdcc4', skinBrown: '#b9692f', skinTan: '#e8964a',
        mouth: '#7b1f2a', tongue: '#f58aa0',
        magenta: '#eb008b', blue: '#4c8ccc', navy: '#00549d', maroon: '#a70531', red: '#e3312b',
        yellow: '#feea8b', khaki: '#d2c005', olive: '#8a8a10', lime: '#a6d93a', green: '#1e8a4c',
        purple: '#946cc4', grey: '#bcccdc', greyDeep: '#7d8e9c', shoe: '#d6e6e5', bottle: '#134e45',
    };
    const LINE = 3; // character outline, logical units in a 1600-wide frame
    const LINE_BG = 2.2; // sets and props
    const LINE_FINE = 2.5; // folds, creases, teeth: the genre draws them almost as heavy as the contour

    // Drawings change 12 times a second (on twos); each event keeps its own clock (t0).
    const drawing = (t, t0 = 0) => Math.floor((t - t0) * 12 + 1e-6);
    const onTwos = (t, t0 = 0) => t0 + drawing(t, t0) / 12;

    // --- paths ---------------------------------------------------------------------------
    // Catmull-Rom through the points, densified.
    function curve(pts, closed = false) {
        const n = pts.length;
        if (n < 3) return pts.map((p) => [p[0], p[1]]);
        const at = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
        const out = [];
        const last = closed ? n : n - 1;
        for (let i = 0; i < last; i++) {
            const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
            const m = 10;
            for (let k = 0; k < m; k++) {
                const u = k / m, u2 = u * u, u3 = u2 * u;
                const b0 = -0.5 * u3 + u2 - 0.5 * u, b1 = 1.5 * u3 - 2.5 * u2 + 1, b2 = -1.5 * u3 + 2 * u2 + 0.5 * u, b3 = 0.5 * u3 - 0.5 * u2;
                out.push([p0[0] * b0 + p1[0] * b1 + p2[0] * b2 + p3[0] * b3, p0[1] * b0 + p1[1] * b1 + p2[1] * b2 + p3[1] * b3]);
            }
        }
        if (!closed) out.push([pts[n - 1][0], pts[n - 1][1]]);
        return out;
    }

    // A path from control points: [x, y] is a smooth point, [x, y, 1] a corner. The curve
    // runs smoothly between corners and breaks at them (the pointed corners of this style).
    function path(spec, closed = false) {
        const n = spec.length;
        const corners = [];
        for (let i = 0; i < n; i++) if (spec[i][2]) corners.push(i);
        if (!corners.length) return curve(spec, closed);
        const out = [];
        const runs = [];
        if (closed) {
            for (let c = 0; c < corners.length; c++) {
                const a = corners[c], b = corners[(c + 1) % corners.length];
                const run = [];
                for (let i = a; ; i = (i + 1) % n) {
                    run.push(spec[i]);
                    if (i === b && run.length > 1) break;
                    if (run.length > n + 1) break;
                }
                runs.push(run);
            }
        } else {
            let a = 0;
            for (const c of [...corners, n - 1]) {
                if (c > a) runs.push(spec.slice(a, c + 1));
                a = c;
            }
        }
        for (const run of runs) {
            const c = curve(run, false);
            if (out.length) c.shift();
            out.push(...c);
        }
        if (closed) out.pop();
        return out;
    }

    function resample(pts, step) {
        const out = [pts[0]];
        let carry = 0;
        for (let i = 1; i < pts.length; i++) {
            const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
            const d = Math.hypot(bx - ax, by - ay);
            if (d < 1e-9) continue;
            let s = step - carry;
            while (s <= d) {
                out.push([ax + ((bx - ax) * s) / d, ay + ((by - ay) * s) / d]);
                s += step;
            }
            carry = d - (s - step);
        }
        const L = pts[pts.length - 1], E = out[out.length - 1];
        if (Math.hypot(L[0] - E[0], L[1] - E[1]) > step * 0.3) out.push(L);
        else out[out.length - 1] = L;
        return out;
    }

    // The hand: the path wanders off its true line by a fraction of the line's width, slowly.
    // Closed paths blend the noise so the seam does not jump.
    function wander(pts, o = {}) {
        const { seed = 'w', w = LINE, amp = 0.3, closed = false, len = 11 } = o;
        let p = closed ? [...pts, pts[0]] : pts;
        p = resample(p, Math.max(0.25, w * 0.85));
        if (p.length < 3 || amp <= 0) return closed ? p.slice(0, -1) : p;
        const s = [0];
        for (let i = 1; i < p.length; i++) s.push(s[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
        const L = s[s.length - 1] || 1, lam = w * len, a = w * amp;
        const out = [];
        for (let i = 0; i < p.length; i++) {
            const pa = p[Math.max(0, i - 1)], pb = p[Math.min(p.length - 1, i + 1)];
            let tx = pb[0] - pa[0], ty = pb[1] - pa[1];
            const tl = Math.hypot(tx, ty) || 1;
            tx /= tl;
            ty /= tl;
            let nz = Motion.noise1(seed, s[i] / lam);
            if (closed) {
                const u = s[i] / L;
                nz = nz * (1 - u) + Motion.noise1(seed, (s[i] - L) / lam) * u;
            } else {
                // open lines keep their ends where they were put
                nz *= Math.min(1, s[i] / (w * 2), (L - s[i]) / (w * 2));
            }
            out.push([p[i][0] - ty * a * nz, p[i][1] + tx * a * nz]);
        }
        if (closed) out.pop();
        return out;
    }

    const pathOf = (pts, closed = true) => {
        const p = new Path2D();
        p.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
        if (closed) p.closePath();
        return p;
    };
    const ellipse = (cx, cy, rx, ry, rot = 0, n = 14) =>
        Array.from({ length: n }, (_, i) => {
            const a = (i / n) * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
            return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
        });
    // A capsule from a to b, radius ra at a and rb at b (a finger, a sausage). Dense polygon.
    function capsule(a, b, ra, rb = ra, n = 10) {
        const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
        const out = [];
        for (let i = 0; i <= n; i++) {
            const t = ang + Math.PI / 2 + (i / n) * Math.PI;
            out.push([a[0] + Math.cos(t) * ra, a[1] + Math.sin(t) * ra]);
        }
        for (let i = 0; i <= n; i++) {
            const t = ang - Math.PI / 2 + (i / n) * Math.PI;
            out.push([b[0] + Math.cos(t) * rb, b[1] + Math.sin(t) * rb]);
        }
        return out;
    }
    /**
     * A band of varying width along a smooth centreline (a limb, a sleeve, a lock of hair):
     * returns its dense outline, ends cut square. w0, w1: widths at the start and the end;
     * o.mid: width at the middle (a bulge or a waist), o.tip: true rounds the far end,
     * o.wave: [amp, n] ripples both edges (hair, cloth), o.dense: pts are already a polyline.
     */
    function ribbon(pts, w0, w1 = w0, o = {}) {
        let c = o.dense ? pts : path(pts);
        c = resample(c, o.step ?? 0.7);
        const n = c.length, L = [], R = [];
        const wave = o.wave ?? null;
        for (let i = 0; i < n; i++) {
            const a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)];
            let tx = b[0] - a[0], ty = b[1] - a[1];
            const tl = Math.hypot(tx, ty) || 1;
            tx /= tl;
            ty /= tl;
            const u = i / (n - 1);
            let wd = w0 + (w1 - w0) * u;
            if (o.mid != null) wd += (o.mid - (w0 + w1) / 2) * Math.sin(u * Math.PI);
            if (o.tip) wd *= Math.sqrt(Math.max(0, 1 - Math.pow(Math.max(0, (u - 0.72) / 0.28), 2)));
            const wv = wave ? wave[0] * Math.sin(u * Math.PI * wave[1]) * Math.min(1, u * 4) : 0;
            L.push([c[i][0] - ty * (wd / 2 + wv), c[i][1] + tx * (wd / 2 + wv)]);
            R.push([c[i][0] + ty * (wd / 2 - wv), c[i][1] - tx * (wd / 2 - wv)]);
        }
        return [...L, ...R.reverse()];
    }
    const inPoly = (pt, poly) => {
        let c = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const [xi, yi] = poly[i], [xj, yj] = poly[j];
            if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
        }
        return c;
    };

    // --- the line ---------------------------------------------------------------------------
    /**
     * The style's line: thin, even, hand-held. pts: control points ([x, y] smooth, [x, y, 1]
     * corner) unless dense: true. Options: w (width, local units), color, seed, closed,
     * amp (how far it wanders, × w; 0 for a path that already wandered), taper (open ends thin
     * a little, like a marker lifted), cap.
     */
    function line(g, pts, o = {}) {
        const { w = LINE, color = COL.ink, seed = 'line', closed = false, dense = false, amp = 0.3, taper = true, cap = 'round' } = o;
        if (!pts || pts.length < 2) return;
        let p = dense ? pts : path(pts, closed);
        p = wander(p, { seed, w, amp, closed });
        if (closed) p = [...p, p[0], p[1]];
        const n = p.length;
        g.strokeStyle = color;
        g.lineCap = cap;
        g.lineJoin = 'round';
        const RUN = 3;
        let s = 0;
        const total = n * w * 0.85;
        for (let i = 0; i < n - 1; i += RUN) {
            const e = Math.min(n - 1, i + RUN);
            s = i * w * 0.85;
            let f = 1 + 0.13 * Motion.noise1(seed + 'w', s / (w * 7));
            if (!closed && taper) f *= 0.72 + 0.28 * Math.min(1, s / (w * 2.5), (total - s) / (w * 2.5));
            g.lineWidth = w * f;
            g.beginPath();
            g.moveTo(p[i][0], p[i][1]);
            for (let k = i + 1; k <= e; k++) g.lineTo(p[k][0], p[k][1]);
            g.stroke();
        }
    }

    /**
     * A flat shape with its outline. Returns the wandered outline (dense), so details can be
     * clipped to it. o.fill (null for line only), o.w, o.seed, o.dense, o.stroke: false for a
     * fill with no outline, o.inside(g) paints clipped inside the shape before the outline.
     */
    function shape(g, pts, o = {}) {
        const { fill = COL.white, w = LINE, seed = 'shape', dense = false, stroke = true, color = COL.ink, amp = 0.3, inside = null } = o;
        const p = wander(dense ? pts : path(pts, true), { seed, w, amp, closed: true });
        const P = pathOf(p);
        if (fill) {
            g.fillStyle = fill;
            g.fill(P);
        }
        if (inside) {
            g.save();
            g.clip(P);
            inside(g);
            g.restore();
        }
        if (stroke) line(g, p, { w, seed, closed: true, dense: true, amp: 0, color });
        return p;
    }

    /**
     * One skin: several overlapping pieces (an arm and its hand, a palm and its fingers) drawn
     * as one silhouette: every outline is inked first, twice as wide, then every piece is
     * filled on top, so only the union keeps its line. parts: dense polygons, or
     * { tube: pts, d } for a limb of even width d along a centreline.
     */
    function skin(g, parts, o = {}) {
        const { fill = COL.skin, w = LINE, seed = 'skin', color = COL.ink } = o;
        const done = parts.map((part, i) => {
            if (part.tube) {
                const c = wander(path(part.tube), { seed: seed + i, w, amp: 0.25 });
                return { tube: c, d: part.d, cap: part.cap ?? 'round' };
            }
            return { poly: wander(part, { seed: seed + i, w, amp: 0.25, closed: true }) };
        });
        g.lineJoin = 'round';
        for (const [pass, col] of [[0, color], [1, fill]]) {
            g.strokeStyle = col;
            g.fillStyle = col;
            for (const d of done) {
                if (d.tube) {
                    g.lineCap = d.cap;
                    g.lineWidth = d.d + (pass === 0 ? 2 * w : 0);
                    g.beginPath();
                    const n = d.tube.length;
                    // a square-cut end is filled a hair past its ink, or the ink's edge shows as a line
                    const ext = (p, q) => {
                        const l = Math.hypot(p[0] - q[0], p[1] - q[1]) || 1, k = pass === 1 && d.cap === 'butt' ? (w * 0.6) / l : 0;
                        return [p[0] + (p[0] - q[0]) * k, p[1] + (p[1] - q[1]) * k];
                    };
                    g.moveTo(...ext(d.tube[0], d.tube[1]));
                    for (let k = 1; k < n - 1; k++) g.lineTo(d.tube[k][0], d.tube[k][1]);
                    g.lineTo(...ext(d.tube[n - 1], d.tube[n - 2]));
                    g.stroke();
                } else if (pass === 0) {
                    g.lineWidth = 2 * w;
                    g.lineCap = 'round';
                    g.stroke(pathOf(d.poly));
                } else g.fill(pathOf(d.poly));
            }
        }
        return done;
    }
    // A limb on its own: an outlined tube of even width.
    const tube = (g, pts, d, o = {}) => skin(g, [{ tube: pts, d, cap: o.cap ?? 'round' }], o);

    // --- set dressing ---------------------------------------------------------------------
    /**
     * A flat-sided piece of a set (a wall, a sign, a plank): the polygon is filled and every
     * edge is ruled separately by hand, so corners overshoot a little. o.over: overshoot in
     * units of w; o.edges: which edges to draw (default all); o.inside(g) clipped inside.
     */
    function slab(g, quad, o = {}) {
        const { fill = COL.concrete, w = LINE_BG, seed = 'slab', over = 1.6, edges = null, inside = null, color = COL.ink } = o;
        const P = pathOf(quad);
        if (fill) {
            g.fillStyle = fill;
            g.fill(P);
            // a hair of the fill under the lines, so no background shows at the corners
            g.strokeStyle = fill;
            g.lineWidth = w * 0.5;
            g.stroke(P);
        }
        if (inside) {
            g.save();
            g.clip(P);
            inside(g);
            g.restore();
        }
        const R = Motion.rng(seed);
        for (let i = 0; i < quad.length; i++) {
            const a = quad[i], b = quad[(i + 1) % quad.length];
            const o0 = R() * over * w, o1 = R() * over * w;
            if (edges && !edges.includes(i)) continue;
            const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (b[0] - a[0]) / d, uy = (b[1] - a[1]) / d;
            line(g, [[a[0] - ux * o0, a[1] - uy * o0], [b[0] + ux * o1, b[1] + uy * o1]], { w, seed: seed + i, color, amp: 0.35 });
        }
    }

    /**
     * Loose tick marks on a surface (the genre's only texture): short strokes, often in
     * pairs, scattered inside a polygon. o.n, o.dir (radians), o.spread, o.len [min, max],
     * o.pair (chance of a second stroke beside the first), o.avoid: [[x, y, r], …] kept clear.
     */
    function ticks(g, poly, o = {}) {
        const { n = 12, dir = 0, spread = 0.2, len = [9, 22], w = LINE_FINE, seed = 'ticks', color = COL.ink, pair = 0.35, avoid = [] } = o;
        const R = Motion.rng(seed);
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const [x, y] of poly) {
            x0 = Math.min(x0, x);
            y0 = Math.min(y0, y);
            x1 = Math.max(x1, x);
            y1 = Math.max(y1, y);
        }
        let made = 0;
        for (let tries = 0; tries < n * 12 && made < n; tries++) {
            const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0);
            const a = dir + (R() - 0.5) * 2 * spread, L = len[0] + R() * (len[1] - len[0]);
            const two = R() < pair, gap = w * (2.2 + R() * 1.5), k = R();
            const dx = (Math.cos(a) * L) / 2, dy = (Math.sin(a) * L) / 2;
            if (!inPoly([x - dx, y - dy], poly) || !inPoly([x + dx, y + dy], poly)) continue;
            if (avoid.some(([ax, ay, ar]) => Math.hypot(x - ax, y - ay) < ar)) continue;
            line(g, [[x - dx, y - dy], [x + dx, y + dy]], { w, seed: seed + made, color, amp: 0.25 });
            if (two) {
                const nx = -Math.sin(a) * gap, ny = Math.cos(a) * gap, sh = 0.45 + k * 0.3;
                line(g, [[x - dx * sh + nx, y - dy * sh + ny], [x + dx * sh + nx, y + dy * sh + ny]], { w, seed: seed + made + 'b', color, amp: 0.25 });
            }
            made++;
        }
    }

    // A pane of glass: flat fill, ruled frame, two or three slanted gleam strokes.
    function pane(g, quad, o = {}) {
        const { fill = COL.glass, w = LINE_BG, seed = 'pane', gleams = 2 } = o;
        slab(g, quad, { fill, w, seed, over: 1.2 });
        const R = Motion.rng(seed + 'g');
        const at = (u, v) => {
            const top = [quad[0][0] + (quad[1][0] - quad[0][0]) * u, quad[0][1] + (quad[1][1] - quad[0][1]) * u];
            const bot = [quad[3][0] + (quad[2][0] - quad[3][0]) * u, quad[3][1] + (quad[2][1] - quad[3][1]) * u];
            return [top[0] + (bot[0] - top[0]) * v, top[1] + (bot[1] - top[1]) * v];
        };
        for (let i = 0; i < gleams; i++) {
            const u = 0.2 + R() * 0.55, v = 0.2 + R() * 0.5, l = 0.1 + R() * 0.1;
            line(g, [at(u, v + l), at(u + l * 0.9, v - l * 0.4)], { w: w * 0.9, seed: seed + 'g' + i, amp: 0.2 });
            if (R() < 0.6) line(g, [at(u + 0.07, v + l * 0.9), at(u + 0.07 + l * 0.5, v + l * 0.25)], { w: w * 0.9, seed: seed + 'h' + i, amp: 0.2 });
        }
    }

    /**
     * A palm tree, foot at (x, y), h tall. The trunk leans and thins upwards with ring ticks;
     * the fronds are saw-edged blades. o.lean (units the top moves sideways), o.sway (radians
     * added to every frond: animate it on twos), o.fronds, o.seed, o.w.
     */
    function palm(g, x, y, h, o = {}) {
        const { lean = h * 0.08, sway = 0, fronds = 7, seed = 'palm', w = LINE_BG, trunk = COL.trunk, leaf = COL.palm } = o;
        const R = Motion.rng(seed);
        const tw = h * 0.045;
        const top = [x + lean + sway * h * 0.12, y - h];
        const mid = [x + lean * 0.25, y - h * 0.5];
        const side = (k) => path([[x + k * tw, y], [mid[0] + k * tw * 0.75, mid[1]], [top[0] + k * tw * 0.5, top[1]]]);
        const L = side(-1), Rr = side(1).reverse();
        const frond = (ang, len, key) => {
            // a blade: a bent spine with saw teeth on both edges
            const n = 9, pts = [], back = [];
            const droop = 0.9 + R() * 0.5;
            for (let i = 0; i <= n; i++) {
                const u = i / n;
                const a = ang + Math.sign(Math.cos(ang) || 1) * droop * u * u;
                const sx = top[0] + Math.cos(ang) * len * u * 0.55 + Math.cos(a) * len * u * 0.45;
                const sy = top[1] + Math.sin(ang) * len * u * 0.55 + Math.sin(a) * len * u * 0.45 + len * 0.28 * u * u;
                const wd = len * 0.13 * Math.sin(Math.PI * Math.min(1, u * 1.15 + 0.08)) * (i % 2 ? 1 : 0.5);
                const nx = -Math.sin(a), ny = Math.cos(a);
                pts.push([sx + nx * wd, sy + ny * wd, 1]);
                back.push([sx - nx * wd, sy - ny * wd, 1]);
            }
            shape(g, [...pts, ...back.reverse()], { fill: leaf, w, seed: key });
        };
        const order = Array.from({ length: fronds }, (_, i) => i);
        // far fronds first (those pointing up), near ones (drooping to the sides) last
        const angs = order.map((i) => -Math.PI / 2 + ((i + 0.5) / fronds - 0.5) * Math.PI * 1.55 + (R() - 0.5) * 0.25 + sway);
        const lens = order.map(() => h * (0.3 + R() * 0.12));
        order.sort((a, b) => Math.abs(Math.cos(angs[a])) - Math.abs(Math.cos(angs[b])));
        for (const i of order.slice(0, Math.floor(fronds / 2))) frond(angs[i], lens[i], seed + 'f' + i);
        shape(g, [...L, ...Rr], { fill: trunk, w, seed: seed + 't', dense: true });
        for (let i = 1; i < 7; i++) {
            const u = i / 7 + (R() - 0.5) * 0.05, cx = x + lean * 0.25 * (u * 2) * (u < 0.5 ? 1 : 0) + (u >= 0.5 ? lean * 0.25 + (lean * 0.75 + sway * h * 0.12) * (u - 0.5) * 2 : 0);
            const cy = y - h * u, ww = tw * (1 - 0.5 * u) * 0.7;
            line(g, [[cx - ww, cy], [cx - ww * 0.1, cy + tw * 0.25], [cx + ww * (0.3 + R() * 0.5), cy]], { w: w * 0.9, seed: seed + 'r' + i });
        }
        for (const i of order.slice(Math.floor(fronds / 2))) frond(angs[i], lens[i], seed + 'f' + i);
    }

    /**
     * Hand lettering for signs: each capital is its own slanted block letter (fill, outline,
     * optional drop), jostling on the baseline. font: an OFL family loaded by the scene.
     */
    function sign(g, str, x, y, o = {}) {
        const { size = 60, font = 'Bangers', fill = COL.red, w = LINE_BG, seed = 'sign', drop = null, track = 0.04, tilt = 0.07, align = 'center', outline = COL.ink } = o;
        const R = Motion.rng(seed);
        g.save();
        g.font = `${size}px "${font}"`;
        g.textBaseline = 'alphabetic';
        g.textAlign = 'left';
        g.lineJoin = 'round';
        const ws = [...str].map((c) => g.measureText(c).width + size * track);
        const total = ws.reduce((a, b) => a + b, 0);
        let cx = x - (align === 'center' ? total / 2 : align === 'right' ? total : 0);
        [...str].forEach((c, i) => {
            const rot = (R() - 0.5) * 2 * tilt, dy = (R() - 0.5) * size * 0.08, f = Array.isArray(fill) ? fill[i % fill.length] : fill;
            g.save();
            g.translate(cx + ws[i] / 2, y + dy);
            g.rotate(rot);
            if (drop) {
                g.fillStyle = drop;
                g.strokeStyle = outline;
                g.lineWidth = w * 2;
                g.strokeText(c, -ws[i] / 2 + size * 0.06, size * 0.06);
                g.fillText(c, -ws[i] / 2 + size * 0.06, size * 0.06);
            }
            g.strokeStyle = outline;
            g.lineWidth = w * 2;
            g.strokeText(c, -ws[i] / 2, 0);
            g.fillStyle = f;
            g.fillText(c, -ws[i] / 2, 0);
            g.restore();
            cx += ws[i];
        });
        g.restore();
        return total;
    }

    // --- hands ------------------------------------------------------------------------------
    /**
     * A hand in one skin: wrist at the origin, fingers towards −y, size = the hand's length.
     * Drawn as a RIGHT hand seen from the palm (thumb at +x); o.side 'L' mirrors it, o.back
     * shows the back of the hand (mirrored again, no palm crease). The caller rotates it to
     * continue the forearm. Poses, each after a frame of the user's references:
     *   open   five splayed, tapered fingers and a short thumb, a hooked crease in the palm
     *          (the genre's default hand, raised or hanging)
     *   fist   a mitten of four curled fingers seen from their backs, three lines between
     *          them, the thumb folded across below (a fist on a hip, a pumped fist)
     *   thumb  the same fist turned so the curled fingers stack towards us, the thumb up
     * Returns nothing; draws arm-less. To join it to an arm in one skin, pass o.arm:
     * { pts, d } (a tube in the same local frame, ending at the origin).
     */
    function handParts(pose, s) {
        const P = (x, y) => [x * s, y * s];
        // a finger: a sausage of even width along a slightly bent centreline
        const F = (pts, r) => ({ tube: pts.map((p) => P(...p)), d: 2 * r * s });
        if (pose === 'open' || pose === 'relaxed') {
            const k = pose === 'relaxed' ? 0.55 : 1; // how far the fingers fan out
            const fan = (pts) => pts.map(([x, y], i) => [x * (i ? (i === 1 ? 0.5 + 0.5 * k : k) : 1) + (i ? (1 - k) * 0.03 : 0), y]);
            const palm = path([P(-0.2, -0.05), P(-0.3, -0.26), P(-0.27, -0.5), P(-0.03, -0.59), P(0.21, -0.54), P(0.3, -0.36), P(0.21, -0.1), P(0, -0.01)], true);
            const fingers = [
                F(fan([[-0.23, -0.47], [-0.36, -0.61], [-0.48, -0.68]]), 0.07), // little
                F(fan([[-0.09, -0.54], [-0.16, -0.77], [-0.21, -0.96]]), 0.078), // ring
                F(fan([[0.06, -0.56], [0.07, -0.81], [0.11, -1.01]]), 0.08), // middle, the longest
                F(fan([[0.2, -0.5], [0.28, -0.71], [0.4, -0.86]]), 0.078), // index
                // the thumb: a fat root at the heel of the palm, the tip hooking upwards
                F([[0.14, -0.2], [0.34, -0.29]], 0.112),
                F([[0.34, -0.29], [0.49 - (1 - k) * 0.1, -0.4], [0.55 - (1 - k) * 0.16, -0.55]], 0.082),
            ];
            return {
                skin: [palm, ...fingers],
                lines: [[P(-0.07, -0.24), P(0.05, -0.29), P(0.1, -0.4)], [P(-0.13, -0.37), P(-0.05, -0.34)]],
                back: [[P(-0.12, -0.5), P(-0.07, -0.53)], [P(0.02, -0.54), P(0.08, -0.53)]],
            };
        }
        if (pose === 'fist') {
            // the backs of four curled fingers: a block with a knuckle for each, the thumb
            // folded across below them
            const block = path([P(-0.25, -0.1), P(-0.3, -0.42), P(-0.27, -0.6), P(0.25, -0.6), P(0.28, -0.42), P(0.23, -0.1), P(0, -0.03)], true);
            const knuckles = [-0.2, -0.065, 0.07, 0.2].map((x, i) => path(ellipse(x * s, (-0.63 - (i === 1 || i === 2 ? 0.035 : 0)) * s, 0.082 * s, 0.1 * s, 0, 8), true));
            const thumb = [F([[0.3, -0.24], [0.12, -0.33], [-0.05, -0.31]], 0.09)];
            return {
                skin: [block, ...knuckles, ...thumb],
                lines: [[P(-0.135, -0.7), P(-0.14, -0.5)], [P(0, -0.74), P(0, -0.52)], [P(0.135, -0.7), P(0.14, -0.5)]],
                over: thumb,
            };
        }
        if (pose === 'thumb') {
            // a fist seen from the thumb's side: the four fingers curl towards us one above
            // the other, the thumb stands up from a fat root
            const block = path([P(-0.08, -0.04), P(0.24, -0.07), P(0.31, -0.36), P(0.26, -0.7), P(-0.06, -0.72), P(-0.2, -0.4)], true);
            const curls = [-0.62, -0.47, -0.32, -0.17].map((y, i) => F([[0.12, y], [-0.21 + (i === 3 ? 0.04 : 0), y + 0.01]], 0.085));
            return {
                skin: [block, ...curls, F([[0.2, -0.56], [0.25, -0.8]], 0.12), F([[0.25, -0.8], [0.25, -0.97], [0.2, -1.1]], 0.095)],
                lines: [[P(-0.29, -0.545), P(0.02, -0.545), P(0.1, -0.5)], [P(-0.29, -0.395), P(0.02, -0.395), P(0.1, -0.35)], [P(-0.27, -0.245), P(0.02, -0.245), P(0.1, -0.2)], [P(0.12, -0.7), P(0.16, -0.62), P(0.12, -0.56)]],
            };
        }
        if (pose === 'point') {
            const block = path([P(-0.25, -0.1), P(-0.3, -0.42), P(-0.25, -0.6), P(0.1, -0.62), P(0.28, -0.5), P(0.23, -0.1), P(0, -0.03)], true);
            return {
                skin: [block, F([[0.18, -0.5], [0.22, -0.8], [0.24, -1.04]], 0.08), ...[-0.19, -0.05, 0.08].map((x) => path(ellipse(x * s, -0.63 * s, 0.082 * s, 0.09 * s, 0, 8), true)), F([[0.24, -0.26], [0.06, -0.33], [-0.1, -0.3]], 0.088)],
                lines: [[P(-0.12, -0.7), P(-0.125, -0.52)], [P(0.015, -0.71), P(0.015, -0.52)]],
            };
        }
        return handParts('open', s);
    }
    function hand(g, pose, size, o = {}) {
        const { side = 'R', back = false, fill = COL.skin, w = LINE, seed = 'hand', arm = null } = o;
        const mirror = (side === 'L') !== back;
        const parts = handParts(pose, size);
        g.save();
        if (mirror) g.scale(-1, 1);
        const armPart = !arm ? [] : arm.poly ? [arm.poly.map(([x, y]) => [mirror ? -x : x, y])] : [{ tube: arm.pts.map(([x, y, c]) => [mirror ? -x : x, y, c]), d: arm.d, cap: 'butt' }];
        if (o.armOnly) {
            // the arm alone, drawn exactly as it is with its hand (same seeds, same frame)
            skin(g, armPart, { fill, w, seed: seed + pose });
            g.restore();
            return;
        }
        skin(g, [...armPart, ...parts.skin], { fill, w, seed: seed + pose });
        // a piece that lies across the others (the thumb over the fist) keeps its own line
        if (parts.over) skin(g, parts.over, { fill, w, seed: seed + 'o' });
        const fine = (LINE_FINE / LINE) * w;
        if (!(back && pose === 'open')) for (const [i, l] of parts.lines.entries()) line(g, l, { w: fine, seed: seed + 'l' + i });
        else for (const [i, l] of parts.back.entries()) line(g, l, { w: fine, seed: seed + 'b' + i });
        g.restore();
    }

    return {
        COL, LINE, LINE_BG, LINE_FINE, drawing, onTwos,
        curve, path, resample, wander, pathOf, ellipse, capsule, ribbon, inPoly,
        line, shape, skin, tube, slab, ticks, pane, palm, sign, hand, handParts,
    };
})();
