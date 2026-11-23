// A flamenco guitar seen from the front, upright, in the emblem manner (contour + airbrush):
// a spruce top with its grain, a rosewood binding with purfling, a rosette in Granada
// marquetry, a tied bridge, an ebony fingerboard with its frets, six strings. Global: Guitar.
//
// Units at s = 1 are 1.5 per millimetre of a real guitar. The ORIGIN is the centre of the
// sound hole; y grows downwards; the neck goes up and leaves the drawing at y = −700 (no
// head). The body runs from y = −225 (the 12th fret) to y = +495 and is 548 wide.
//
//   Guitar.body(g, { x, y, s, knots })     body, top, binding, rosette, bridge, neck and
//                                          fingerboard, with a real hole (transparent, radius
//                                          64 · s), the strings' shadows and (knots, default
//                                          true) their knots on the tie block; no strings
//   Guitar.strings(g, { x, y, s, knots })  the six strings from the top of the drawing to the
//                                          saddle, on transparent, for a nearer layer;
//                                          knots: true (default false) ties them here instead
//   Guitar.inside(g, { x, y, s })          the inside of the box seen through the mouth: a disc
//                                          of radius 150 with a transparent hole of radius 50;
//                                          its label needs the font 'IM Fell DW Pica SC'
//   Guitar.outline(s)                      the body's outline polygon about the origin
//   Guitar.stringX(i, y)                   where string i (0 = sixth, on the left) is at height y
//   Guitar.fretY(n), HOLE, JOIN, TOP, SADDLE, BRIDGE   the measures the drawing is built on
//
// The drawers paint once, static, onto the caller's context. body and inside paint into a
// canvas of their own first, on the output's pixel grid, so their shadows and holes touch
// nothing else on the caller's layer. The light is baked for an upright guitar.
const Guitar = (() => {
    const S = Souvenir;
    const TAU = Math.PI * 2;
    const COL = {
        spruce: '#e2b469', rosewood: '#4a2420', rosewoodDeep: '#231014', ebony: '#2a1e20', ebonyDeep: '#0d0a15',
        cedar: '#c98850', cedarDeep: '#6a3620', bone: '#f1e8d2', boneShade: '#a8997c',
        // the marquetry's woods: stained red and green, bone, ebony, a yellow wood for gold
        red: '#b8322f', redDeep: '#7a1428', green: '#2a7a54', greenDeep: '#0f4634', gold: '#d9a441', black: '#1c1822',
    };
    const LDIR = [-S.SHADE_DIR[0], -S.SHADE_DIR[1]]; // towards the light, in the picture's plane

    // ------------------------------------------------------------------ measures
    const HOLE = 64, JOIN = -225, TOP = -700, SADDLE = 257;
    const SCALE = 2 * (SADDLE - JOIN); // the 12th fret is at the body's edge, half-way to the saddle
    const fretY = (n) => SADDLE - SCALE * Math.pow(2, -n / 12);
    const fbHalf = (y) => 45 + (y - JOIN) * (6 / 483); // the fingerboard narrows towards the nut
    const fbEnd = (x) => -66.5 + 120 - Math.sqrt(14400 - x * x); // its end: a shallow curve over the mouth
    const FB_CORNER = 47.1;
    const GAUGE = [2.5, 2.2, 1.9, 2.1, 1.8, 1.55]; // sixth … first, drawn a little heavier than life
    const stringX = (i, y) => {
        const a = -33 + 13.2 * i, b = -43 + 17.2 * i;
        return a + ((b - a) * (y - JOIN)) / (SADDLE - JOIN);
    };
    // the bridge: front edge, back edge, the wings' reach, the block's half-width, and the
    // block's parts from the mouth side: ramp, saddle seat, channel, tie block
    const BR = { y0: 247, y1: 289, half: 142, block: 64, ramp: 252.4, seat: 262, tie0: 267.5, tie1: 287 };

    // The plantilla, right half then mirrored: two superelliptic bouts (widest 210 at y = −82
    // and 274 at y = +300), and between them a flank whose slope swings like a sine, in to
    // the waist (176 at y = +60) and out again, so the curve has no corner anywhere. Traced
    // finely, then stepped off evenly along its length.
    const OUT = (() => {
        const fine = [], Q = Math.PI / 2;
        for (let k = 0; k < 240; k++) {
            const th = (1 - k / 240) * Q;
            fine.push([210 * Math.pow(Math.cos(th), 2 / 2.4), -82 - 143 * Math.pow(Math.sin(th), 2 / 2.4)]);
        }
        // [from y, to y, half-width at the start, at the end, where the slope is steepest]
        for (const [y0, y1, x0, x1, yi] of [[-82, 60, 210, 176, -5], [60, 300, 176, 274, 190]]) {
            const a = yi - y0, b = y1 - yi, m = (x1 - x0) / ((a + b) / Q);
            for (let y = y0; y < y1; y += 1) fine.push([y < yi ? x0 + ((m * a) / Q) * (1 - Math.cos((Q * (y - y0)) / a)) : x0 + (m * a) / Q + ((m * b) / Q) * Math.sin((Q * (y - yi)) / b), y]);
        }
        for (let k = 0; k <= 280; k++) {
            const th = (k / 280) * Q;
            fine.push([274 * Math.pow(Math.cos(th), 2 / 2.45), 300 + 195 * Math.pow(Math.sin(th), 2 / 2.45)]);
        }
        fine[0][0] = 0;
        fine[fine.length - 1][0] = 0;
        let len = 0;
        const at = [0];
        for (let i = 1; i < fine.length; i++) at.push((len += Math.hypot(fine[i][0] - fine[i - 1][0], fine[i][1] - fine[i - 1][1])));
        const n = Math.round(len / 6), right = [];
        for (let k = 0, i = 0; k <= n; k++) {
            const d = (len * k) / n;
            while (i < fine.length - 2 && at[i + 1] < d) i++;
            const u = (d - at[i]) / (at[i + 1] - at[i] || 1);
            right.push([fine[i][0] + (fine[i + 1][0] - fine[i][0]) * u, fine[i][1] + (fine[i + 1][1] - fine[i][1]) * u]);
        }
        const left = right.slice(1, -1).reverse().map(([x, y]) => [-x, y]);
        return S.curve([...right, ...left], true, 2);
    })();
    const outline = (s = 1) => OUT.map(([x, y]) => [x * s, y * s]);

    // ------------------------------------------------------------------ helpers
    const P = (r, a) => [Math.cos(a) * r, Math.sin(a) * r];
    const arcPts = (r, a0, a1, n = 24) => {
        const out = [];
        for (let i = 0; i <= n; i++) out.push(P(r, a0 + ((a1 - a0) * i) / n));
        return out;
    };
    // unit normals to the right of travel: inwards on a clockwise outline
    const normals = (pts, closed = true) => pts.map((p, i) => {
        const n = pts.length;
        const a = closed ? pts[(i - 1 + n) % n] : pts[Math.max(0, i - 1)], b = closed ? pts[(i + 1) % n] : pts[Math.min(n - 1, i + 1)];
        const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1;
        return [-ty / l, tx / l];
    });
    const offset = (pts, d, closed = true) => {
        const nn = normals(pts, closed);
        return pts.map((p, i) => [p[0] + nn[i][0] * d, p[1] + nn[i][1] * d]);
    };
    const fillPoly = (g, pts, col) => {
        g.fillStyle = col;
        g.beginPath();
        S.trace(g, pts);
        g.fill();
    };
    const line = (g, pts, w, col, close = false) => {
        g.strokeStyle = col;
        g.lineWidth = w;
        g.beginPath();
        S.trace(g, pts, close);
        g.stroke();
    };
    // the band between two insets of a closed outline
    const band = (g, pts, d0, d1, col) => {
        g.fillStyle = col;
        g.beginPath();
        S.trace(g, offset(pts, d0));
        S.trace(g, offset(pts, d1));
        g.fill('evenodd');
    };
    // a band along a closed outline that is only as wide as its edge faces `dir`: the light a
    // rounded edge catches, or the shade on its far side
    function rim(g, pts, { inset = 0, w = 1, color = '#fffdf2', alpha = 1, dir = LDIR, from = 0.05, to = 0.9 } = {}) {
        const nn = normals(pts), A = [], B = [];
        for (let i = 0; i < pts.length; i++) {
            const f = S.smooth(from, to, -nn[i][0] * dir[0] - nn[i][1] * dir[1]), h = (w * f) / 2;
            A.push([pts[i][0] + nn[i][0] * (inset - h), pts[i][1] + nn[i][1] * (inset - h)]);
            B.push([pts[i][0] + nn[i][0] * (inset + h), pts[i][1] + nn[i][1] * (inset + h)]);
        }
        g.save();
        g.globalAlpha *= alpha;
        g.fillStyle = color;
        g.beginPath();
        S.trace(g, A);
        S.trace(g, B);
        g.fill('evenodd');
        g.restore();
    }
    // a soft line: the shadow of a string
    function soft(g, pts, w, rgb, a, spread = 1) {
        g.save();
        g.lineCap = 'butt';
        g.lineJoin = 'round';
        for (const [k, al] of [[1 + 2.4 * spread, 0.2], [1 + 1.1 * spread, 0.34], [1, 0.5]]) {
            g.strokeStyle = `rgba(${rgb},${(a * al).toFixed(3)})`;
            g.lineWidth = w * k;
            g.beginPath();
            S.trace(g, pts, false);
            g.stroke();
        }
        g.restore();
    }
    const glow = (g, x, y, R, a, c = '255,244,206') => {
        const gr = g.createRadialGradient(x, y, 0, x, y, R);
        gr.addColorStop(0, `rgba(${c},${a})`);
        gr.addColorStop(0.5, `rgba(${c},${a * 0.42})`);
        gr.addColorStop(1, `rgba(${c},0)`);
        g.fillStyle = gr;
        g.fillRect(x - R, y - R, R * 2, R * 2);
    };
    const roundRect = (x0, y0, x1, y1, r, n = 4) => {
        const out = [];
        for (const [cx, cy, a0] of [[x1 - r, y0 + r, -Math.PI / 2], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, Math.PI / 2], [x0 + r, y0 + r, Math.PI]]) {
            for (let i = 0; i <= n; i++) out.push([cx + Math.cos(a0 + (i / n) * (Math.PI / 2)) * r, cy + Math.sin(a0 + (i / n) * (Math.PI / 2)) * r]);
        }
        return out;
    };
    // a piece's colour, a little lighter or darker: inlaid wood and bone are never one tone
    const toner = (rnd) => (c, amt = 0.16) => {
        const u = rnd();
        return u < 0.5 ? S.mix(c, '#1a1420', (0.5 - u) * 2 * amt) : S.mix(c, '#fff6dc', (u - 0.5) * 2 * amt * 0.8);
    };

    // Paints `paint(q)` (in the guitar's own units) into a canvas of its own, on the pixel
    // grid of the caller's context when that is not turned, and pastes it: so `source-atop`
    // shadows and `destination-out` holes stay inside the guitar.
    function layer(g, x, y, s, box, paint) {
        const m = g.getTransform();
        const c = document.createElement('canvas');
        const q = c.getContext('2d');
        if (Math.abs(m.b) < 1e-6 && Math.abs(m.c) < 1e-6 && m.a > 0 && m.d > 0) {
            const X0 = Math.max(0, Math.floor(m.a * (x + box.x * s) + m.e)), Y0 = Math.max(0, Math.floor(m.d * (y + box.y * s) + m.f));
            const X1 = Math.min(g.canvas.width, Math.ceil(m.a * (x + (box.x + box.w) * s) + m.e)), Y1 = Math.min(g.canvas.height, Math.ceil(m.d * (y + (box.y + box.h) * s) + m.f));
            if (X1 <= X0 || Y1 <= Y0) return;
            c.width = X1 - X0;
            c.height = Y1 - Y0;
            q.setTransform(m.a * s, 0, 0, m.d * s, m.a * x + m.e - X0, m.d * y + m.f - Y0);
            paint(q);
            g.save();
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.drawImage(c, X0, Y0);
            g.restore();
        } else {
            const res = Math.min(8, Math.max(0.25, Math.hypot(m.a, m.b) * s));
            c.width = Math.ceil(box.w * res);
            c.height = Math.ceil(box.h * res);
            q.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
            paint(q);
            g.save();
            g.translate(x, y);
            g.scale(s, s);
            g.drawImage(c, box.x, box.y, c.width / res, c.height / res);
            g.restore();
        }
    }
    const punch = (q, r) => {
        q.save();
        q.globalCompositeOperation = 'destination-out';
        q.fillStyle = '#000';
        q.beginPath();
        q.arc(0, 0, r, 0, TAU);
        q.fill();
        q.restore();
    };

    // ------------------------------------------------------------------ the rosette
    // Granada marquetry (taracea): concentric lines of bone and ebony, a ring of red blocks,
    // a rope of little leaning tiles, gold lines, and in the middle a band of eight-pointed
    // stars, each ray two facets. Every tile is its own piece; the ebony ground shows in
    // the joints.
    function rosette(g) {
        const rnd = Motion.rng('guitar-rosette'), tone = toner(rnd);
        const ring = (r0, r1, col) => {
            g.fillStyle = col;
            g.beginPath();
            g.arc(0, 0, r1, 0, TAU);
            g.arc(0, 0, r0, 0, TAU, true);
            g.fill();
        };
        const seg = (r0, r1, a0, a1, col) => {
            g.fillStyle = col;
            g.beginPath();
            g.arc(0, 0, r1, a0, a1);
            g.arc(0, 0, r0, a1, a0, true);
            g.closePath();
            g.fill();
        };
        const blocks = (r0, r1, n, c) => {
            const da = TAU / n;
            for (let i = 0; i < n; i++) {
                seg(r0, r1, i * da + da * 0.03, i * da + da * 0.72, tone(c, 0.2));
                seg(r0, r1, i * da + da * 0.78, i * da + da * 0.97, tone(COL.bone, 0.1));
            }
        };
        const rope = (r0, r1, n, cols) => {
            const rm = (r0 + r1) / 2, da = TAU / n, sk = (rm - r0) / rm;
            for (let i = 0; i < n; i++) {
                const c = cols[i % cols.length];
                if (!c) continue;
                const a = i * da, col = tone(c, 0.12);
                fillPoly(g, [P(r0, a), P(r0, a + da), P(rm, a + da + sk), P(rm, a + sk)], col);
                fillPoly(g, [P(rm, a + sk), P(rm, a + da + sk), P(r1, a + da), P(r1, a)], S.mix(col, '#20141c', 0.16));
            }
        };
        ring(70, 102, COL.black);
        ring(70.8, 71.6, COL.bone);
        blocks(72.2, 74, 120, COL.red);
        ring(74, 74.7, COL.bone);
        rope(75.2, 78.4, 232, [COL.bone, null, COL.red, null]);
        ring(78.9, 79.6, COL.gold);
        // the stars: eight rays, each two facets (one to the light, one away), bone on the
        // cardinal rays, red and green by turns on the diagonals; gold lozenges and a bone
        // dot where two stars meet
        const N = 40, rc = 86, da = TAU / N, half = (rc * da) / 2, R = 5.75, a = R * 0.541;
        for (let i = 0; i < N; i++) {
            const ac = (i + 0.5) * da;
            const M = (u, v) => P(rc + v, ac + u / rc); // tile coordinates: u along the ring, v outwards
            const o = M(0, 0);
            for (let j = 0; j < 8; j++) {
                const th = (j * Math.PI) / 4, e = Math.PI / 8;
                const tip = M(R * Math.cos(th), R * Math.sin(th)), l = M(a * Math.cos(th - e), a * Math.sin(th - e)), rr = M(a * Math.cos(th + e), a * Math.sin(th + e));
                const card = j % 2 === 0, odd = i % 2 === 1;
                fillPoly(g, [o, l, tip], tone(card ? COL.bone : odd ? COL.green : COL.red, 0.1));
                fillPoly(g, [o, tip, rr], tone(card ? '#c9b488' : odd ? COL.greenDeep : COL.redDeep, 0.1));
            }
            for (const v of [-4.1, 4.1]) fillPoly(g, [M(half - 1.85, v), M(half, v - 1.6), M(half + 1.85, v), M(half, v + 1.6)], tone(COL.gold, 0.16));
            const c = M(half, 0);
            g.fillStyle = tone(COL.bone, 0.1);
            g.beginPath();
            g.arc(c[0], c[1], 0.78, 0, TAU);
            g.fill();
        }
        ring(92.4, 93.1, COL.gold);
        rope(93.6, 96.8, 284, [COL.bone, null, COL.green, null]);
        ring(97.3, 98, COL.bone);
        blocks(98, 99.8, 160, COL.green);
        ring(100.4, 101.2, COL.bone);
        // under the varnish: a breath of light on the lit side, of shade on the other
        const gr = g.createLinearGradient(-66, -83, 66, 83);
        gr.addColorStop(0, 'rgba(255,248,214,0.2)');
        gr.addColorStop(0.42, 'rgba(255,248,214,0)');
        gr.addColorStop(0.6, 'rgba(22,10,34,0)');
        gr.addColorStop(1, 'rgba(22,10,34,0.3)');
        ring(70, 102, gr);
        g.lineWidth = 1.5;
        g.strokeStyle = S.INK;
        for (const r of [70.1, 101.9]) {
            g.beginPath();
            g.arc(0, 0, r, 0, TAU);
            g.stroke();
        }
    }

    // ------------------------------------------------------------------ the golpeador
    // The tap plate: clear, glued on the top below and beside the mouth. Barely there: an
    // edge, a sheen, and the scratches of the nails.
    const PLATE = (() => {
        // hand-cut: it leaves the rosette's sides, swells a little towards the bridge and
        // stops short of it; the same on both sides of the strings
        const rr = 106, cut = 0.287;
        const side = S.curve([P(rr, -cut), [113, -31.5], [126, -31], [136, -26], [141, -14], [143, 10], [144, 60], [146, 120], [147, 170], [146, 205], [141, 226], [130, 237], [110, 240], [50, 240.5], [0, 240.5]], false, 8).slice(1);
        // clockwise, like every outline here: round under the mouth from left to right,
        // down the right side, back along the bridge and up the left side
        return [...arcPts(rr, Math.PI + cut, -cut, 44), ...side, ...side.slice(0, -1).reverse().map(([x, y]) => [-x, y])];
    })();
    function golpeador(g) {
        const rnd = Motion.rng('guitar-golpeador');
        g.save();
        g.beginPath();
        S.trace(g, PLATE);
        g.clip();
        // the wood under it is a shade deeper, as under glass
        g.fillStyle = 'rgba(190,120,36,0.1)';
        g.fillRect(-150, -50, 300, 300);
        // the sheen: slanted bars of light, broken off softly
        for (const [cx, w, a] of [[-78, 26, 0.3], [-36, 7, 0.2], [84, 44, 0.13]]) {
            const dx = 0.82, dy = 0.57; // across the bars
            const gr = g.createLinearGradient(cx - dx * w, 100 - dy * w, cx + dx * w, 100 + dy * w);
            gr.addColorStop(0, 'rgba(255,252,236,0)');
            gr.addColorStop(0.5, `rgba(255,252,236,${a})`);
            gr.addColorStop(1, 'rgba(255,252,236,0)');
            g.fillStyle = gr;
            g.fillRect(-150, -50, 300, 300);
        }
        // golpes: where the ring finger lands, below the first string, and the thumb above the sixth
        g.lineCap = 'round';
        for (let i = 0; i < 46; i++) {
            const low = i < 32, cx = low ? 60 + rnd() * 62 : -122 + rnd() * 54, cy = low ? 70 + rnd() * 120 : 20 + rnd() * 100;
            const l = 2 + rnd() * 7, a = 0.9 + rnd() * 1.2;
            g.strokeStyle = rnd() < 0.5 ? `rgba(255,250,230,${0.1 + rnd() * 0.14})` : `rgba(120,74,30,${0.08 + rnd() * 0.12})`;
            g.lineWidth = 0.4 + rnd() * 0.5;
            g.beginPath();
            g.moveTo(cx, cy);
            g.quadraticCurveTo(cx + Math.cos(a) * l * 0.5 + 1, cy + Math.sin(a) * l * 0.5, cx + Math.cos(a) * l, cy + Math.sin(a) * l);
            g.stroke();
        }
        g.restore();
        // its edge: a hair of shade all round, light where it faces the light
        line(g, PLATE, 0.6, 'rgba(118,72,30,0.2)', true);
        rim(g, PLATE, { inset: 0.5, w: 1.1, color: '#fffbe6', alpha: 0.5 });
        rim(g, PLATE, { inset: -0.5, w: 1.5, color: '#6e3f1c', alpha: 0.34, dir: S.SHADE_DIR });
    }

    // ------------------------------------------------------------------ strings
    // Where each string ties: it drops from the saddle into the tie block, comes back over
    // it from behind, hooks under itself and twists round itself; the tail lies along the
    // back edge.
    function knot(i) {
        const x = stringX(i, SADDLE), n = i < 3 ? 2 : 3, t0 = BR.tie0, t1 = BR.tie1;
        const over = S.curve([[x - 0.4, t1 + 1.3], [x - 0.4, t1 - 6], [x - 0.5, t0 + 3], [x - 1.5, t0 + 0.4], [x - 1.4, t0 - 1.4], [x, t0 - 2.3], [x + 1.5, t0 - 1.4], [x + 1.8, t0 + 0.4], [x + 2.5, t0 + 2]], false, 5);
        const wraps = [];
        for (let k = 0; k < n; k++) {
            const yk = t0 + (n === 2 ? 5.6 : 4.2) + k * (n === 2 ? 6.6 : 4.9);
            wraps.push([[x - 3.3, yk - 1.8], [x - 0.4, yk], [x + 2.5, yk + 1.8]]);
        }
        const last = wraps[n - 1][2];
        const tail = S.curve([last, [last[0] + 1.6, last[1] + 1.5], [x + 6.5, t1 - 1.5], [x + 11.5, t1 - 1.2]], false, 5);
        return { x, drop: [[x, SADDLE], [x, t0 + 0.8]], over, wraps, tail };
    }
    const stringLine = (i, y0 = TOP, y1 = SADDLE) => [[stringX(i, y0), y0], [stringX(i, y1), y1]];

    // One run of string. Basses are wound (silver on a bronze shade, the winding as fine
    // slanted ticks); trebles are clear nylon (a pale core inside a darker edge).
    function strand(g, pts, i, k, o = {}) {
        const w = GAUGE[i] * (o.thin ?? 1), dim = o.dim ?? 0;
        const sh = (c) => (dim ? S.mix(c, '#1a1424', dim) : c);
        const off = (d) => offset(pts, d, false);
        g.save();
        g.lineCap = o.cap ?? 'butt';
        g.lineJoin = 'round';
        if (i < 3) {
            line(g, pts, w, sh('#322d3d'));
            line(g, pts, w * 0.7, sh('#b3aca0'));
            line(g, off(w * 0.17), w * 0.24, S.rgba(sh('#7d5c36'), 0.8));
            // the winding: no finer than the output can hold
            const p = Math.max(w * 0.42, 2.3 / k), nn = normals(pts, false);
            g.strokeStyle = S.rgba(sh('#2a2436'), 0.5);
            g.lineWidth = p * 0.36;
            g.lineCap = 'butt';
            g.beginPath();
            let carry = 0;
            for (let j = 1; j < pts.length; j++) {
                const a = pts[j - 1], b = pts[j], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, tx = (b[0] - a[0]) / L, ty = (b[1] - a[1]) / L;
                const nx = nn[j][0], ny = nn[j][1];
                for (let d = carry; d < L; d += p) {
                    const cx = a[0] + tx * d, cy = a[1] + ty * d;
                    g.moveTo(cx - nx * w * 0.36 - tx * w * 0.16, cy - ny * w * 0.36 - ty * w * 0.16);
                    g.lineTo(cx + nx * w * 0.36 + tx * w * 0.16, cy + ny * w * 0.36 + ty * w * 0.16);
                }
                carry = (carry - L) % p;
                if (carry < 0) carry += p;
            }
            g.stroke();
            g.lineCap = o.cap ?? 'butt';
            line(g, off(-w * 0.16), w * 0.22, S.rgba(sh('#fdf9ea'), 0.95));
        } else {
            line(g, pts, w, S.rgba(sh('#4a3f58'), 0.66));
            line(g, pts, w * 0.62, S.rgba(sh('#f6f0e0'), 0.86));
            line(g, off(-w * 0.14), w * 0.2, S.rgba(sh('#fffffa'), 0.96));
        }
        g.restore();
    }

    // A knot is painted in two passes, so that the string itself can lie between them: first
    // the strand that comes back over the block and hooks under the string, and the string's
    // dive from the saddle into the block; then the turns and the tail.
    function tieUnder(g, i, k) {
        const kn = knot(i);
        strand(g, kn.over, i, k, { cap: 'round', thin: 0.9 });
        // behind the saddle the string is out of the light
        strand(g, kn.drop, i, k, { dim: 0.3 });
    }
    function tieOver(g, i, k) {
        const kn = knot(i);
        for (const wr of kn.wraps) {
            // each turn rides over the strand under it: a hair of shade first
            g.save();
            g.lineCap = 'round';
            line(g, wr.map(([px, py]) => [px + 0.4, py + 0.75]), GAUGE[i] * 1.2, 'rgba(14,8,18,0.6)');
            g.restore();
            strand(g, wr, i, k, { cap: 'round', thin: 1.12 });
        }
        strand(g, kn.tail, i, k, { cap: 'round', thin: 0.9 });
        // the cut end
        const e = kn.tail[kn.tail.length - 1];
        g.fillStyle = i < 3 ? '#8a6a40' : 'rgba(250,246,232,0.9)';
        g.beginPath();
        g.arc(e[0], e[1], GAUGE[i] * 0.3, 0, TAU);
        g.fill();
    }

    // The six strings, from the top of the drawing to the saddle. The knots lie on the tie
    // block, so by default they are painted with the body (on a nearer layer they would
    // slide off the bridge as the camera comes in); `knots: true` paints them here instead
    // (then call body with `knots: false`).
    function strings(g, o = {}) {
        const { x = 0, y = 0, s = 1, knots = false } = o;
        const k = S.pxScale(g) * s;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        for (let i = 0; i < 6; i++) {
            if (knots) tieUnder(g, i, k);
            strand(g, stringLine(i), i, k);
            if (knots) tieOver(g, i, k);
        }
        g.restore();
    }

    // ------------------------------------------------------------------ the top
    function paintTop(d) {
        const r = Motion.rng('guitar-top');
        // slow drifts of tone along the grain, the same on both halves (the top is bookmatched)
        for (let i = 0; i < 16; i++) {
            const cx = 12 + r() * 250, w = 8 + r() * 30, c = r() < 0.55 ? '150,92,34' : '255,236,180', a = 0.05 + r() * 0.08;
            for (const side of [-1, 1]) {
                const gr = d.createLinearGradient(side * (cx - w), 0, side * (cx + w), 0);
                gr.addColorStop(0, `rgba(${c},0)`);
                gr.addColorStop(0.5, `rgba(${c},${a})`);
                gr.addColorStop(1, `rgba(${c},0)`);
                d.fillStyle = gr;
                d.fillRect(side * cx - w, -230, w * 2, 730);
            }
        }
        // the grain: hairlines of latewood, tighter at the centre joint, mirrored about it
        d.lineCap = 'butt';
        for (let gx = 0.8; gx < 278;) {
            const dark = r() < 0.74, a = dark ? 0.1 + r() * 0.24 : 0.12 + r() * 0.2, w = 0.38 + r() * 0.5, ph = r() * 40, amp = 0.35 + r() * 0.6;
            d.strokeStyle = dark ? `rgba(146,88,30,${a})` : `rgba(253,232,176,${a})`;
            d.lineWidth = w;
            for (const side of [-1, 1]) {
                d.beginPath();
                for (let yy = -230; yy <= 500; yy += 26) {
                    const X = side * (gx + amp * S.noise2(yy * 0.011, ph, 5));
                    if (yy === -230) d.moveTo(X, yy);
                    else d.lineTo(X, yy);
                }
                d.stroke();
            }
            gx += (1.05 + r() * 1.5) * (1 + (0.45 * gx) / 274);
        }
        // silking: the rays of quarter-sawn spruce, short gleams across the grain
        d.strokeStyle = 'rgba(255,243,206,0.13)';
        for (let i = 0; i < 260; i++) {
            const fx = 4 + r() * 262, fy = -215 + r() * 700, l = 2.5 + r() * 7, tilt = (r() - 0.5) * 0.8;
            d.lineWidth = 0.45 + r() * 0.4;
            for (const side of [-1, 1]) {
                d.beginPath();
                d.moveTo(side * fx, fy);
                d.lineTo(side * (fx + l), fy + tilt);
                d.stroke();
            }
        }
        // the centre joint
        line(d, [[0, -228], [0, 498]], 0.6, 'rgba(132,82,34,0.4)');
        // airbrush: darker to the edge all round, deeper on the side away from the light,
        // and the varnish taking the light on the upper left of each bout
        S.spray(d, OUT, { color: '#ad6222', alpha: 0.8, w: 78, push: 0 });
        S.spray(d, OUT, { color: '#7c421d', alpha: 0.6, w: 24, push: 0 });
        S.spray(d, OUT, { color: '#69341f', alpha: 0.66, w: 104, push: 76 });
        S.spray(d, OUT, { color: '#4c2b3c', alpha: 0.34, w: 56, push: 40 });
        S.spray(d, OUT, { color: '#fff1c8', alpha: 0.4, w: 70, push: 58, dir: LDIR });
        glow(d, -100, -132, 130, 0.5, '255,246,214');
        glow(d, -128, 200, 215, 0.5, '255,246,214');
        // and darker where things stand over it: under the strings, round the bridge, round
        // the rosette, beside the fingerboard
        const puff = (pts, o) => S.cast(d, (q) => { q.fillStyle = '#000'; q.beginPath(); S.trace(q, pts); q.fill('evenodd'); }, o);
        puff([[-46, 96], [52, 96], [66, 250], [-60, 250]], { blur: 24, dx: 3, dy: 0, color: 'rgba(146,82,28,0.34)' });
        puff(roundRect(-BR.half, BR.y0, BR.half, BR.y1, 8), { blur: 22, dx: 4, dy: 8, color: 'rgba(120,60,20,0.42)' });
        puff(S.ellipse(0, 0, 104, 104, 60), { blur: 13, dx: 2.5, dy: 3.5, color: 'rgba(124,66,22,0.5)' });
        puff([[-50, -226], [50, -226], [50, -60], [-50, -60]], { blur: 16, dx: 5, dy: 3, color: 'rgba(124,66,22,0.42)' });
        // the varnish's gleam: a soft crescent inside the lit flank of each bout
        S.cast(d, (q) => rim(q, OUT, { inset: 23, w: 10, color: '#000', from: 0.5, to: 1 }), { blur: 6, dx: 0, dy: 0, color: 'rgba(255,249,226,0.55)' });
        golpeador(d);
        rosette(d);
        // the mouth's cut edge: the top is thin, and its far lip catches the light
        const far = Math.atan2(S.SHADE_DIR[1], S.SHADE_DIR[0]);
        S.ink(d, arcPts(67.2, far - 1.15, far + 1.15, 30), { w: 1.2, color: '#fbe9bb', alpha: 0.85 });
        S.ink(d, arcPts(68.2, far + Math.PI - 1.2, far + Math.PI + 1.2, 30), { w: 2.6, color: '#8a5526', alpha: 0.45 });
        // the strings' shadows on the top: thin, soft, a little towards the lower right
        for (let i = 0; i < 6; i++) {
            const pts = [];
            for (let yy = -72; yy <= BR.y0 + 6; yy += 20) pts.push([stringX(i, yy) + 4.6 + ((yy + 72) / 320) * 2, yy]);
            soft(d, pts, GAUGE[i] + 0.3, '78,38,14', 0.8, 0.55);
        }
        // the binding: rosewood round the edge, and the purfling's light and dark lines
        const bind = d.createLinearGradient(-210, -250, 230, 520);
        bind.addColorStop(0, '#864a36');
        bind.addColorStop(0.45, '#5a2a22');
        bind.addColorStop(1, '#32151a');
        band(d, OUT, -2, 6.6, bind);
        band(d, OUT, 6.6, 7.7, '#efe0b8');
        band(d, OUT, 7.7, 8.7, '#2c1a1c');
        band(d, OUT, 8.7, 9.8, '#ecd9aa');
        band(d, OUT, 9.8, 10.5, 'rgba(74,38,22,0.78)');
        // the rosewood's figure: dark and pale streaks that run with the band and drift across it
        const fr = Motion.rng('guitar-binding'), nO = OUT.length, nn = normals(OUT);
        for (let i = 0; i < 280; i++) {
            const i0 = Math.floor(fr() * nO), len = 8 + Math.floor(fr() * 44), d0 = 0.8 + fr() * 4.6, d1 = d0 + (fr() - 0.5) * 1.6, pts = [];
            for (let k = 0; k <= len; k++) {
                const j = (i0 + k) % nO, dd = d0 + (d1 - d0) * (k / len);
                pts.push([OUT[j][0] + nn[j][0] * dd, OUT[j][1] + nn[j][1] * dd]);
            }
            S.ink(d, pts, { w: 0.45 + fr() * 0.7, color: fr() < 0.6 ? '#1c090e' : '#b47050', alpha: 0.22 + fr() * 0.3 });
        }
        // its rounded edge takes the light on the upper left and loses it on the lower right
        rim(d, OUT, { inset: 1.9, w: 2.2, color: '#d09a78', alpha: 0.85 });
        rim(d, OUT, { inset: 4.8, w: 3.6, color: '#12080e', alpha: 0.5, dir: S.SHADE_DIR });
        rim(d, OUT, { inset: 8.2, w: 3.4, color: '#24101c', alpha: 0.4, dir: S.SHADE_DIR });
        // where the two strips of binding meet, at the butt
        line(d, [[0, 488], [0, 496]], 0.6, 'rgba(16,6,10,0.7)');
    }

    // ------------------------------------------------------------------ the bridge
    function bridge(q) {
        // the right half: the block's corner, the wing tapering to a rounded end, and back
        const rgt = [[BR.block, 247], [72, 248.3], [104, 250], [127, 251.3]];
        for (let i = 0; i <= 7; i++) rgt.push([135.2 + 6.8 * Math.sin((i / 7) * Math.PI / 2), 258.6 - 6.8 * Math.cos((i / 7) * Math.PI / 2)]);
        for (let i = 0; i <= 7; i++) rgt.push([135.2 + 6.8 * Math.cos((i / 7) * Math.PI / 2), 277.4 + 6.8 * Math.sin((i / 7) * Math.PI / 2)]);
        rgt.push([127, 284.7], [104, 286], [72, 287.7], [BR.block, 289]);
        const pts = [...rgt, ...rgt.slice().reverse().map(([x, y]) => [-x, y])];
        const B = BR.block, r = Motion.rng('guitar-bridge'), tone = toner(r);
        S.piece(q, pts, {
            fill: { from: [0, 247], to: [0, 289], stops: [[0, '#5f3127'], [0.5, COL.rosewood], [1, '#34171a']] },
            line: 2.3, heavy: 0.8,
            cast: { blur: 7, dx: 4, dy: 6.5, color: 'rgba(66,30,10,0.62)' },
            detail: (d) => {
                // the wings: arched, so a ridge of light and a far side in shade; lower at the ends
                for (const side of [-1, 1]) {
                    const x0 = side > 0 ? B : -BR.half, gr = d.createLinearGradient(0, 249, 0, 288);
                    gr.addColorStop(0, 'rgba(18,6,12,0.3)');
                    gr.addColorStop(0.27, 'rgba(236,160,116,0.55)');
                    gr.addColorStop(0.5, 'rgba(226,150,108,0)');
                    gr.addColorStop(0.75, 'rgba(14,5,12,0.12)');
                    gr.addColorStop(1, 'rgba(14,5,12,0.6)');
                    d.fillStyle = gr;
                    d.fillRect(x0, 246, BR.half - B, 44);
                    const en = d.createLinearGradient(side * 112, 0, side * 143, 0);
                    en.addColorStop(0, 'rgba(14,5,12,0)');
                    en.addColorStop(1, side > 0 ? 'rgba(14,5,12,0.6)' : 'rgba(14,5,12,0.2)');
                    d.fillStyle = en;
                    d.fillRect(x0, 246, BR.half - B, 44);
                }
                // the block stands above the wings and shades the right one
                const st = d.createLinearGradient(B, 0, B + 15, 0);
                st.addColorStop(0, 'rgba(10,4,10,0.62)');
                st.addColorStop(1, 'rgba(10,4,10,0)');
                d.fillStyle = st;
                d.fillRect(B, 246, 15, 44);
                // the block's faces, from the mouth side: ramp, seat, channel, tie block, back bevel
                const face = (y0, y1, c0, c1) => {
                    const gr = d.createLinearGradient(0, y0, 0, y1);
                    gr.addColorStop(0, c0);
                    gr.addColorStop(1, c1);
                    d.fillStyle = gr;
                    d.fillRect(-B, y0, B * 2, y1 - y0);
                };
                face(BR.y0, BR.ramp, '#8a4f3a', '#643328');
                face(BR.ramp, BR.seat, '#54281f', '#43201c');
                face(BR.seat, BR.tie0, '#10060a', '#3a1b1a');
                face(BR.tie0, BR.tie1, '#6a372b', '#3c1b1a');
                face(BR.tie1, BR.y1, '#2a1216', '#1c0b10');
                // the grain of the rosewood: dark and light streaks along the bridge
                d.lineCap = 'round';
                for (let i = 0; i < 150; i++) {
                    const gx = -BR.half + r() * BR.half * 2, gy = 248 + r() * 40, l = 10 + r() * 90, sl = (r() - 0.5) * 1.6;
                    d.strokeStyle = r() < 0.6 ? `rgba(24,8,12,${0.25 + r() * 0.3})` : `rgba(168,96,68,${0.18 + r() * 0.26})`;
                    d.lineWidth = 0.35 + r() * 0.6;
                    d.beginPath();
                    d.moveTo(gx, gy);
                    d.quadraticCurveTo(gx + l * 0.5, gy + sl, gx + l, gy + sl * 0.3);
                    d.stroke();
                }
                // the saddle's slot
                fillPoly(d, roundRect(-59, 254, 59.2, 260.2, 1.2), '#12070b');
                // the tie block's edges, inlaid in bone with a gleam of pearl
                for (const [y0, y1] of [[268.3, 271.2], [283.3, 286.2]]) {
                    fillPoly(d, [[-B + 1.2, y0 - 0.5], [B - 1.2, y0 - 0.5], [B - 1.2, y1 + 0.5], [-B + 1.2, y1 + 0.5]], '#170a0e');
                    for (let x0 = -B + 1.8, k = 0; x0 < B - 2; k++) {
                        const w = Math.min(B - 1.8 - x0, 7 + r() * 9);
                        fillPoly(d, [[x0, y0], [x0 + w - 0.35, y0], [x0 + w - 0.35, y1], [x0, y1]], S.mix(tone(COL.bone, 0.1), ['#f3d6d6', '#d3ecdf', '#d6dcf2', '#f6efc8'][k % 4], 0.3 + r() * 0.3));
                        x0 += w;
                    }
                    line(d, [[-B + 2, y0 + 0.75], [B - 2, y0 + 0.75]], 0.5, 'rgba(255,253,242,0.7)');
                }
                // and down its middle a rope of the rosette's tiles
                fillPoly(d, [[-B + 1.2, 274.4], [B - 1.2, 274.4], [B - 1.2, 280.2], [-B + 1.2, 280.2]], COL.black);
                line(d, [[-B + 1.6, 275], [B - 1.6, 275]], 0.5, COL.bone);
                line(d, [[-B + 1.6, 279.6], [B - 1.6, 279.6]], 0.5, COL.bone);
                for (let k = 0, x0 = -B + 2; x0 < B - 5; k++, x0 += 2.5) {
                    const c = [COL.bone, COL.red, COL.bone, COL.green][k % 4], col = tone(c, 0.12);
                    fillPoly(d, [[x0, 275.5], [x0 + 2.1, 275.5], [x0 + 3.9, 277.3], [x0 + 1.8, 277.3]], col);
                    fillPoly(d, [[x0 + 1.8, 277.3], [x0 + 3.9, 277.3], [x0 + 2.1, 279.1], [x0, 279.1]], S.mix(col, '#20141c', 0.18));
                }
                // light along the tie block's front edge and the ramp's lip; ink where the faces meet
                line(d, [[-B, BR.tie0 + 0.6], [B, BR.tie0 + 0.6]], 0.7, 'rgba(236,170,130,0.55)');
                line(d, [[-B, BR.y0 + 1.6], [B, BR.y0 + 1.6]], 0.8, 'rgba(240,176,136,0.5)');
                for (const [yy, w] of [[BR.ramp, 0.8], [BR.seat, 1.1], [BR.tie0, 1.2], [BR.tie1, 0.9]]) line(d, [[-B, yy], [B, yy]], w, S.INK);
                for (const side of [-1, 1]) line(d, [[side * B, 246], [side * B, 290]], 1.3, S.INK);
                line(d, [[-B + 0.9, 247], [-B + 0.9, 289]], 0.7, 'rgba(232,160,120,0.5)');
                // the whole of it turned to the light: shade from the lower right, light on the upper left
                S.spray(d, pts, { color: COL.rosewoodDeep, alpha: 0.7, w: 8, push: 5 });
                S.spray(d, pts, { color: '#d69a78', alpha: 0.4, w: 5, push: 3.4, dir: LDIR });
            },
        });
        // the saddle: a bar of bone in its slot, nicked where each string bears on it
        S.piece(q, roundRect(-58.2, 254.5, 58.2, 259.5, 1.3), {
            fill: { from: [0, 254.5], to: [0, 259.5], stops: [[0, '#fbf6e8'], [0.55, COL.bone], [1, '#c8b995']] },
            line: 0.95, heavy: 0.6,
            shade: { color: COL.boneShade, alpha: 0.8, w: 2.4, push: 1.5 },
            detail: (d) => {
                for (const side of [-1, 1]) {
                    const gr = d.createLinearGradient(side * 44, 0, side * 59, 0);
                    gr.addColorStop(0, 'rgba(196,160,96,0)');
                    gr.addColorStop(1, 'rgba(196,160,96,0.5)');
                    d.fillStyle = gr;
                    d.fillRect(side > 0 ? 44 : -59, 254, 15, 6);
                }
                line(d, [[-55, 255.6], [52, 255.6]], 0.6, 'rgba(255,253,242,0.9)');
                for (let i = 0; i < 6; i++) fillPoly(d, [[stringX(i, SADDLE) - GAUGE[i] * 0.7, 254.5], [stringX(i, SADDLE) + GAUGE[i] * 0.9, 254.5], [stringX(i, SADDLE) + GAUGE[i] * 0.5, 259.5], [stringX(i, SADDLE) - GAUGE[i] * 0.3, 259.5]], 'rgba(90,70,50,0.3)');
            },
        });
        // the strings' shadows on the bridge: over the ramp, down behind the saddle, and
        // under every turn of the knots
        q.save();
        q.beginPath();
        S.trace(q, pts);
        q.clip();
        const sh = (p, dx, dy) => p.map(([x, y]) => [x + dx, y + dy]);
        for (let i = 0; i < 6; i++) {
            const kn = knot(i), w = GAUGE[i];
            soft(q, sh([[stringX(i, 240), 240], [stringX(i, 254.4), 254.4]], 2.2, 0), w, '8,3,10', 0.75, 0.8);
            soft(q, sh(kn.drop.map(([x, y]) => [x, Math.max(y, 259.6)]), 1.4, 0), w, '4,2,8', 0.7, 0.6);
            for (const p of [kn.over, ...kn.wraps, kn.tail]) soft(q, sh(p, 1.1, 1.5), w + 0.2, '6,2,8', 0.85, 0.7);
        }
        q.restore();
    }

    // ------------------------------------------------------------------ neck and fingerboard
    function neck(q) {
        const e0 = fbHalf(TOP) + 6.2, e1 = fbHalf(JOIN + 4) + 6.8, r = Motion.rng('guitar-neck');
        const pts = [[-e0, TOP], [e0, TOP], [e1, JOIN + 4], [-e1, JOIN + 4]];
        S.piece(q, pts, {
            fill: COL.cedar, line: 2.2, heavy: 0.8,
            // a neck is round: it falls away from the light at both edges, more on the right
            shade: [{ color: COL.cedarDeep, alpha: 0.9, w: 4.5, push: 2.6 }, { color: '#8a4a26', alpha: 0.7, w: 2.6, push: 0 }],
            detail: (d) => {
                // cedar: long straight pores
                for (let i = 0; i < 90; i++) {
                    const side = r() < 0.5 ? -1 : 1, gx = side * (fbHalf(-460) - 1 + r() * 7.4), gy = TOP + r() * 480, l = 8 + r() * 40;
                    line(d, [[gx, gy], [gx + (side * l * 6) / 483, gy + l]], 0.35 + r() * 0.4, r() < 0.6 ? `rgba(92,44,22,${0.3 + r() * 0.3})` : `rgba(240,184,130,${0.25 + r() * 0.25})`);
                }
            },
        });
    }

    function fingerboard(q) {
        const r = Motion.rng('guitar-fingerboard');
        const pts = [[-fbHalf(TOP), TOP], [fbHalf(TOP), TOP], [FB_CORNER, fbEnd(FB_CORNER)]];
        for (let k = 1; k < 16; k++) pts.push([FB_CORNER * (1 - k / 8), fbEnd(FB_CORNER * (1 - k / 8))]);
        pts.push([-FB_CORNER, fbEnd(FB_CORNER)]);
        S.piece(q, pts, {
            fill: COL.ebony, line: 2.2, heavy: 0.8,
            cast: { blur: 4.5, dx: 3.2, dy: 3.6, color: 'rgba(54,24,10,0.62)' },
            shade: { color: COL.ebonyDeep, alpha: 0.9, w: 13, push: 8 },
            light: { color: '#a3969c', alpha: 0.6, w: 15, push: 10 },
            detail: (d) => {
                // polished ebony: a cool sheen down the lit third, and the wood's faint streaks
                const gr = d.createLinearGradient(-34, 0, 2, 0);
                gr.addColorStop(0, 'rgba(176,160,164,0)');
                gr.addColorStop(0.45, 'rgba(176,160,164,0.3)');
                gr.addColorStop(1, 'rgba(176,160,164,0)');
                d.fillStyle = gr;
                d.fillRect(-50, TOP, 100, 660);
                d.lineCap = 'round';
                for (let i = 0; i < 70; i++) {
                    const gx = -46 + r() * 92, gy = TOP - 60 + r() * 640, l = 90 + r() * 260;
                    line(d, [[gx, gy], [gx + (gx * l * 0.0124) / 46, gy + l]], 0.4 + r() * 0.7, r() < 0.55 ? `rgba(120,96,92,${0.1 + r() * 0.14})` : `rgba(8,4,8,${0.16 + r() * 0.2})`);
                }
                // the frets: nickel-silver bars, each with its light and the shade it throws.
                // The 19th is in two halves: the mouth takes its middle.
                for (let n = 1; n <= 19; n++) {
                    const fy = fretY(n), hw = fbHalf(fy) - 1.2, h = 1.55;
                    for (const [x0, x1] of n === 19 ? [[-hw, -35.6], [35.6, hw]] : [[-hw, hw]]) {
                        fillPoly(d, roundRect(x0 + 0.7, fy - h + 1.5, x1 + 0.9, fy + h + 1.7, 0.7), 'rgba(3,2,8,0.6)');
                        const fg = d.createLinearGradient(0, fy - h, 0, fy + h);
                        fg.addColorStop(0, '#fffdf0');
                        fg.addColorStop(0.3, '#e2e1ea');
                        fg.addColorStop(0.64, '#a09eb6');
                        fg.addColorStop(1, '#55526e');
                        const bar = roundRect(x0, fy - h, x1, fy + h, 0.75);
                        fillPoly(d, bar, fg);
                        // the crown turns away from the light towards the right
                        const fx = d.createLinearGradient(x0, 0, x1, 0);
                        fx.addColorStop(0, 'rgba(40,36,64,0)');
                        fx.addColorStop(0.55, 'rgba(40,36,64,0)');
                        fx.addColorStop(1, 'rgba(40,36,64,0.42)');
                        fillPoly(d, bar, fx);
                        line(d, bar, 0.5, S.rgba(S.INK, 0.85), true);
                        const L = x1 - x0;
                        S.ink(d, [[x0 + L * 0.08, fy - h * 0.42], [x0 + L * 0.3, fy - h * 0.42], [x0 + L * 0.52, fy - h * 0.42]], { w: 0.85, color: '#fffdf2', alpha: 0.95 });
                    }
                }
            },
        });
        // the strings' shadows on the fingerboard: close under them, so only the frets show it
        q.save();
        q.beginPath();
        S.trace(q, pts);
        q.clip();
        for (let i = 0; i < 6; i++) {
            const p = [];
            for (let yy = TOP; yy <= -50; yy += 50) p.push([stringX(i, yy) + 1.3 + ((yy - TOP) / 650) * 1.9, yy]);
            soft(q, p, GAUGE[i], '6,4,14', 0.8, 0.5);
        }
        q.restore();
    }

    function body(g, o = {}) {
        const { x = 0, y = 0, s = 1, knots = true } = o;
        layer(g, x, y, s, { x: -290, y: TOP - 4, w: 580, h: 506 - TOP + 4 }, (q) => {
            neck(q);
            S.piece(q, OUT, {
                fill: { from: [-190, -230], to: [200, 500], stops: [[0, '#ecc57e'], [0.5, COL.spruce], [1, '#d7a35a']] },
                line: 3, heavy: 0.85,
                detail: paintTop,
            });
            bridge(q);
            if (knots) {
                for (let i = 0; i < 6; i++) {
                    tieUnder(q, i, S.pxScale(q));
                    tieOver(q, i, S.pxScale(q));
                }
            }
            fingerboard(q);
            // the mouth: its contour, then the hole itself
            q.lineWidth = 2.4;
            q.strokeStyle = S.INK;
            q.beginPath();
            q.arc(0, 0, HOLE + 1.15, 0, TAU);
            q.stroke();
            q.lineWidth = 1.6;
            q.beginPath();
            q.arc(-0.5, -0.65, HOLE + 1.6, 0, TAU);
            q.stroke();
            punch(q, HOLE);
        });
    }

    // ------------------------------------------------------------------ the inside
    // What the mouth shows before the next picture: the back of the box from the inside
    // (cypress, bookmatched, its centre strip, one brace across), lit only by what comes in
    // through the mouth, and the maker's label, its lettering set round the mouth.
    const FELL = "'IM Fell DW Pica SC', 'IM Fell DW Pica', Georgia, 'Times New Roman', serif";
    function inside(g, o = {}) {
        const { x = 0, y = 0, s = 1 } = o;
        layer(g, x, y, s, { x: -158, y: -158, w: 316, h: 316 }, (q) => {
            const r = Motion.rng('guitar-inside');
            q.save();
            q.beginPath();
            q.arc(0, 0, 157.5, 0, TAU);
            q.clip();
            q.fillStyle = '#60401f';
            q.fillRect(-158, -158, 316, 316);
            // the back's grain
            for (let gx = 1.2; gx < 158;) {
                const dark = r() < 0.6, a = 0.14 + r() * 0.26, w = 0.4 + r() * 0.7;
                for (const side of [-1, 1]) line(q, [[side * gx, -158], [side * (gx + 0.6), 158]], w, dark ? `rgba(40,20,10,${a})` : `rgba(206,160,96,${a * 0.8})`);
                gx += 1.2 + r() * 2.6;
            }
            // the centre strip: a ribbon of cross-grain wood over the joint, proud of the back
            fillPoly(q, [[13.5, -158], [13.5, 158], [-9.5, 158], [-9.5, -158]], 'rgba(10,5,6,0.5)');
            S.piece(q, [[-10.5, -160], [10.5, -160], [10.5, 160], [-10.5, 160]], {
                fill: '#775228', line: 0.9, ink: '#1c0f0c', heavy: 0.5,
                shade: { color: '#3c2212', alpha: 0.7, w: 4, push: 2.5 },
                light: { color: '#e2b47a', alpha: 0.5, w: 2.4, push: 1.6 },
                detail: (d) => {
                    for (let i = 0; i < 150; i++) {
                        const yy = -158 + r() * 316;
                        line(d, [[-10.5, yy], [10.5, yy + (r() - 0.5) * 0.8]], 0.3 + r() * 0.5, r() < 0.6 ? `rgba(48,26,12,${0.2 + r() * 0.25})` : `rgba(226,180,120,${0.15 + r() * 0.2})`);
                    }
                },
            });
            // a brace: a bar of spruce across the back, rounded on top
            fillPoly(q, [[-158, -66], [158, -66], [158, -57], [-158, -57]], 'rgba(8,4,5,0.55)');
            S.piece(q, [[-160, -80], [160, -80], [160, -66], [-160, -66]], {
                fill: { from: [0, -80], to: [0, -66], stops: [[0, '#6c4a28'], [0.4, '#a27a48'], [1, '#52351c']] },
                line: 1, ink: '#1c0f0c', heavy: 0.5,
                detail: (d) => {
                    for (let i = 0; i < 60; i++) {
                        const yy = -80 + r() * 14, x0 = -158 + r() * 260, l = 20 + r() * 80;
                        line(d, [[x0, yy], [x0 + l, yy + (r() - 0.5) * 0.6]], 0.3 + r() * 0.4, r() < 0.55 ? `rgba(60,34,14,${0.2 + r() * 0.25})` : `rgba(240,204,150,${0.16 + r() * 0.2})`);
                    }
                    line(d, [[-158, -75.2], [158, -75.2]], 0.7, 'rgba(250,222,170,0.4)');
                },
            });
            label(q);
            // the dark of the box: light only where the mouth lets it in, low on the right
            const dk = q.createRadialGradient(18, 28, 0, 18, 28, 172);
            for (const [t, a] of [[0, 0.1], [0.2, 0.15], [0.34, 0.36], [0.46, 0.6], [0.6, 0.78], [0.8, 0.88], [1, 0.93]]) dk.addColorStop(t, `rgba(17,8,9,${a})`);
            q.fillStyle = dk;
            q.fillRect(-158, -158, 316, 316);
            // the rim of the way through
            q.lineWidth = 2.2;
            q.strokeStyle = '#0d0707';
            q.beginPath();
            q.arc(0, 0, 51, 0, TAU);
            q.stroke();
            q.restore();
            // a soft outer edge, and the hole to the next picture
            q.save();
            q.globalCompositeOperation = 'destination-in';
            const fe = q.createRadialGradient(0, 0, 150, 0, 0, 157);
            fe.addColorStop(0, 'rgba(0,0,0,1)');
            fe.addColorStop(1, 'rgba(0,0,0,0)');
            q.fillStyle = fe;
            q.fillRect(-158, -158, 316, 316);
            q.restore();
            punch(q, 50);
        });
    }

    // The maker's label: old cream paper glued a little askew, a printed double rule, and a
    // banderole that bends round the mouth with the trade in it; the town below.
    function label(q) {
        const r = Motion.rng('guitar-label');
        const INKC = '#3a2016';
        q.save();
        q.rotate(-0.04);
        // the sheet: its edges are not quite straight
        const X0 = -77, X1 = 77, Y0 = 16.5, Y1 = 137, paper = [];
        const edge = (ax, ay, bx, by, n) => {
            for (let i = 0; i < n; i++) {
                const u = i / n, w = 0.45 * S.noise2(u * 9 + ax * 0.3, ay * 0.2 + by, 3);
                paper.push([ax + (bx - ax) * u + (ay === by ? 0 : w), ay + (by - ay) * u + (ay === by ? w : 0)]);
            }
        };
        edge(X0, Y0, X1, Y0, 26);
        edge(X1, Y0, X1, Y1, 20);
        edge(X1, Y1, X0, Y1, 26);
        edge(X0, Y1, X0, Y0, 20);
        S.piece(q, paper, {
            fill: { from: [0, Y0], to: [0, Y1], stops: [[0, '#f0e2bb'], [0.5, '#e6d4a6'], [1, '#d6c08e']] },
            line: 1, ink: '#22120e', heavy: 0.6,
            cast: { blur: 2.6, dx: 1.3, dy: 1.7, color: 'rgba(8,4,4,0.75)' },
            shade: [{ color: '#a07c40', alpha: 0.5, w: 12, push: 3 }, { color: '#b08a4c', alpha: 0.35, w: 7, push: 0 }],
            detail: (d) => {
                // age: a tide mark, foxing, the pull of the glue
                const stain = S.curve([[-66, 30], [-44, 24], [-30, 36], [-36, 52], [-56, 56], [-70, 46]], true, 8);
                fillPoly(d, stain, 'rgba(160,112,52,0.13)');
                line(d, stain, 0.7, 'rgba(128,84,36,0.24)', true);
                for (let i = 0; i < 90; i++) {
                    const fx = X0 + r() * (X1 - X0), fy = Y0 + r() * (Y1 - Y0);
                    d.fillStyle = `rgba(136,86,36,${0.1 + r() * 0.26})`;
                    d.beginPath();
                    d.ellipse(fx, fy, 0.3 + r() * 1.1, 0.3 + r() * 0.9, r() * 3, 0, TAU);
                    d.fill();
                }
                for (let i = 0; i < 40; i++) {
                    const fx = X0 + r() * (X1 - X0), fy = Y0 + r() * (Y1 - Y0), l = 4 + r() * 12, a = r() * 3.2;
                    line(d, [[fx, fy], [fx + Math.cos(a) * l, fy + Math.sin(a) * l]], 0.3, r() < 0.5 ? 'rgba(255,250,226,0.3)' : 'rgba(150,110,60,0.2)');
                }
                // the printed frame: a thick rule and a thin one
                line(d, roundRect(X0 + 3.6, Y0 + 3.6, X1 - 3.6, Y1 - 3.6, 0.6, 1), 1.2, S.rgba(INKC, 0.9), true);
                line(d, roundRect(X0 + 5.9, Y0 + 5.9, X1 - 5.9, Y1 - 5.9, 0.4, 1), 0.42, S.rgba(INKC, 0.85), true);
                // the banderole: two pairs of rules bent round the mouth, closed at their ends
                const A0 = 0.5, A1 = Math.PI - 0.5;
                d.lineCap = 'butt';
                for (const [rr, w] of [[54.2, 0.95], [55.8, 0.36], [66.6, 0.36], [68.2, 0.95]]) line(d, arcPts(rr, A0, A1, 48), w, S.rgba(INKC, 0.9));
                for (const a of [A0, A1]) {
                    line(d, [P(54.2, a), P(68.2, a)], 0.95, S.rgba(INKC, 0.9));
                    // a fleuron beyond each end
                    const c = P(61.2, a + (a < 1 ? -0.085 : 0.085)), u = P(1, a), v = P(1, a + Math.PI / 2);
                    fillPoly(d, [[c[0] + u[0] * 3.3, c[1] + u[1] * 3.3], [c[0] + v[0] * 1.5, c[1] + v[1] * 1.5], [c[0] - u[0] * 3.3, c[1] - u[1] * 3.3], [c[0] - v[0] * 1.5, c[1] - v[1] * 1.5]], S.rgba(INKC, 0.9));
                }
                // the trade, fitted to the banderole
                const fit = (text, len, max, sp) => {
                    d.font = `100px ${FELL}`;
                    return Math.min(max, len / (d.measureText(text).width / 100 + [...text].length * sp));
                };
                const t1 = 'CONSTRUCTOR DE GUITARRAS', f1 = fit(t1, 63.6 * (A1 - A0 - 0.14), 8.6, 0.07);
                S.textOn(d, t1, arcPts(63.9, A1 - 0.07, A0 + 0.07, 60), { font: `${f1.toFixed(2)}px ${FELL}`, color: S.rgba(INKC, 0.94), spacing: f1 * 0.07 });
                // the town, larger, on the next turn out; the year and the number beside it
                S.textOn(d, 'GRANADA', arcPts(86.5, Math.PI / 2 + 0.5, Math.PI / 2 - 0.5, 40), { font: `13.5px ${FELL}`, color: S.rgba(INKC, 0.94), spacing: 2.4 });
                S.textOn(d, 'AÑO 1926', arcPts(85, Math.PI / 2 + 0.98, Math.PI / 2 + 0.6, 20), { font: `6.4px ${FELL}`, color: S.rgba(INKC, 0.9), spacing: 0.5 });
                S.textOn(d, 'N.º 114', arcPts(85, Math.PI / 2 - 0.6, Math.PI / 2 - 0.98, 20), { font: `6.4px ${FELL}`, color: S.rgba(INKC, 0.9), spacing: 0.5 });
                for (const a of [Math.PI / 2 + 0.55, Math.PI / 2 - 0.55]) {
                    const c = P(81.6, a);
                    fillPoly(d, [[c[0] - 1.6, c[1]], [c[0], c[1] - 1.6], [c[0] + 1.6, c[1]], [c[0], c[1] + 1.6]], S.rgba(INKC, 0.9));
                }
                // a rule, and the maker's hand under it in brown ink
                line(d, [[-46, 103], [46, 103]], 0.5, S.rgba(INKC, 0.85));
                fillPoly(d, [[-2.4, 103], [0, 101.2], [2.4, 103], [0, 104.8]], S.rgba(INKC, 0.9));
                const sig = S.curve([[-40, 121], [-37, 111], [-32, 107], [-30, 115], [-34, 124], [-28, 121], [-24, 115], [-21, 121], [-18, 116], [-15, 121], [-11, 115], [-8, 121], [-4, 116], [0, 121], [4, 112], [7, 106], [6, 118], [9, 121], [14, 116], [17, 121], [22, 117], [27, 120], [36, 116], [45, 118]], false, 6);
                S.ink(d, sig, { w: 1, color: '#5a3520', alpha: 0.85, taper: [0.6, 1] });
                S.ink(d, S.curve([[-46, 127], [-12, 130], [28, 125], [50, 119]], false, 8), { w: 1.2, color: '#5a3520', alpha: 0.8 });
            },
        });
        q.restore();
    }

    return { body, strings, inside, outline, stringX, fretY, HOLE, SADDLE, JOIN, TOP, BRIDGE: BR, COL };
})();
