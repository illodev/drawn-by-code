// The lemon tree, in the brush manner (no contour line): lemons, leaves, blossom, buds and
// twigs, each painted once as a sprite and instanced. Global: Citrus.
// Units: a lemon is about 190 long, a leaf 170–230, a flower 100 across.
//
// Every drawer takes the angle it will be pasted at (`rot`) and bakes the light for it, so
// the light stays at the top left however a piece is turned. Angles are snapped to 1/16 of
// a turn: paste with `Citrus.put(g, sprite, x, y, s)`, which uses the snapped angle.
const Citrus = (() => {
    const S = Souvenir;
    const cache = new Map();
    const memo = (key, fn) => {
        if (!cache.has(key)) cache.set(key, fn());
        return cache.get(key);
    };
    const STEP = Math.PI / 8;
    const snap = (rot) => Math.round(rot / STEP) * STEP;
    const put = (g, sp, x, y, s = 1, o = {}) => S.put(g, sp, { x, y, rot: sp.rot ?? 0, sx: s * (o.fx ?? 1), sy: s * (o.fy ?? 1), alpha: o.alpha ?? 1 });

    // ------------------------------------------------------------------ lemon
    // Hanging nipple down: axis along +y, the stem end at the top. The outline is a profile
    // of revolution: an oval body drawn out at both ends, a nipple on a slight neck, a low
    // collar under the calyx.
    function lemonShape(v = 0) {
        const r = Motion.rng('lemon' + v);
        const a = 88 * (0.95 + r() * 0.12), b = 64 * (0.95 + r() * 0.1), lean = (r() - 0.5) * 0.12;
        const nipL = a * (0.17 + r() * 0.07), nipW = b * (0.2 + r() * 0.05), fat = 2 + r() * 0.5;
        const smax = (p, q, k) => 0.5 * (p + q + Math.sqrt((p - q) * (p - q) + k * k));
        const half = (y) => {
            const body = Math.abs(y) < a ? b * Math.pow(1 - Math.pow(Math.abs(y / a), fat), 0.6) : 0;
            const yn = (y - a * 0.9) / nipL, nip = Math.abs(yn) < 1 ? nipW * Math.pow(1 - yn * yn, 0.55) : 0;
            const yt = (y + a * 0.99) / (a * 0.1), top = Math.abs(yt) < 1 ? b * 0.17 * Math.sqrt(1 - yt * yt) : 0;
            return smax(smax(body, nip, 5), top, 3) - 3.2;
        };
        const y0 = -a * 1.07, y1 = a * 0.9 + nipL;
        const right = [], left = [];
        const n = 70;
        for (let i = 0; i <= n; i++) {
            // more points near the ends, where the outline turns fastest
            const u = 0.5 - 0.5 * Math.cos((i / n) * Math.PI), y = y0 + (y1 - y0) * u, w = Math.max(0, half(y));
            right.push([w + lean * y, y]);
            left.push([-w + lean * y, y]);
        }
        return [...right, ...left.reverse()];
    }
    const LEMON = [[0, '#3b280c'], [0.16, '#6e4a10'], [0.3, '#9b6d13'], [0.43, '#c5941a'], [0.56, '#e4b624'], [0.7, '#f3ce39'], [0.85, '#fadf68'], [1, '#fff2b2']];

    function lemon(v = 0, rot = 0, res = 2) {
        rot = snap(rot);
        return memo(`lemon${v}/${rot.toFixed(3)}@${res}`, () => {
            const pts = lemonShape(v);
            const box = S.bbox(pts, 22);
            const r = Motion.rng('lemon-strokes' + v);
            const L = S.lightFor(rot, [-0.62, -0.68, 0.22]);
            const top = [(pts[0][0] + pts[pts.length - 1][0]) / 2, pts[0][1]], tip = pts[70];
            const sp = S.form({
                box, res, seed: 'lemon' + v, light: L,
                mask: (g) => {
                    g.beginPath();
                    S.trace(g, pts);
                    g.fill();
                },
                // the peel: slow lumps, and pores too shallow to read as hammered metal
                height: (x, y) => 0.06 * S.noise2(x * 0.5, y * 0.5, 5) + 0.6 * S.noise2(x * 0.07, y * 0.07, 9),
                ramp: LEMON, soft: 0.92,
                edge: { rough: 1.6, freq: 0.2, amp: 0.7 },
                stroke: { amp: 0.05, freq: 0.03, tone: 9 },
                mottle: { amp: 0.03, freq: 0.014 },
                spec: { amp: 0.6, power: 11, from: 0.55, to: 0.95, ragged: 0.45, color: '#fff8d2' },
                markAmp: 0.34,
                marks: (g) => {
                    // strokes that follow the form: arcs about the point nearest the light
                    const hx = L[0] * 44, hy = L[1] * 58;
                    for (let i = 0; i < 70; i++) {
                        const rad = 14 + r() * 160, a0 = r() * Math.PI * 2, span = (0.25 + r() * 0.5) * (40 / (rad + 30)) * 2.3;
                        const arc = [];
                        for (let k = 0; k <= 10; k++) arc.push([hx + Math.cos(a0 + (span * k) / 10) * rad, hy + Math.sin(a0 + (span * k) / 10) * rad * 1.12]);
                        S.dab(g, arc, { w: 4 + r() * 8, color: r() < 0.5 ? '#ffffff' : '#000000', alpha: 0.25 + r() * 0.35, bristles: 6, seed: 'ls' + v + '-' + i, dry: 0.55 });
                    }
                },
                tint: (x, y, tone, rgb, m) => {
                    // light bounced up from the leaves into the shadow side's rim
                    const k = S.smooth(0.26, 0.06, tone) * S.smooth(0.22, 0.02, m) * 0.5;
                    rgb[0] += (92 - rgb[0]) * k;
                    rgb[1] += (104 - rgb[1]) * k;
                    rgb[2] += (34 - rgb[2]) * k;
                    // the nipple's tip keeps a little green
                    const q = S.smooth(20, 2, Math.hypot(x - tip[0], y - tip[1] + 4)) * 0.6;
                    rgb[0] += (rgb[0] * 0.62 - rgb[0]) * q;
                    rgb[1] += (rgb[1] * 0.86 - rgb[1]) * q;
                    rgb[2] += (rgb[2] * 0.5 - rgb[2]) * q;
                },
            });
            // the calyx: five sepals seen from the side and a stub of stalk, over the collar
            const g = sp.canvas.getContext('2d');
            g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
            const star = [];
            for (let k = 0; k < 10; k++) {
                const a = (k / 10) * Math.PI * 2 + 0.2 + v, rr = k % 2 ? 6.5 : 15.5;
                star.push([top[0] + Math.cos(a) * rr * 1.2, top[1] + 5 + Math.sin(a) * rr * 0.5]);
            }
            const stalk = [[top[0] - 3.6, top[1] + 4], [top[0] - 3, top[1] - 16], [top[0] + 3, top[1] - 16], [top[0] + 3.6, top[1] + 4]];
            const cal = S.form({
                box, res, seed: 'calyx' + v, light: L, relief: 0.8,
                mask: (g2) => {
                    g2.beginPath();
                    S.trace(g2, S.curve(star, true, 5));
                    g2.fill();
                    g2.beginPath();
                    S.trace(g2, stalk);
                    g2.fill();
                },
                ramp: TWIG_GREEN, soft: 0.9, mottle: { amp: 0.06, freq: 0.2 },
            });
            g.save();
            g.shadowColor = 'rgba(60,40,6,0.55)';
            g.shadowBlur = 3 * res;
            g.shadowOffsetX = 1.5 * res;
            g.shadowOffsetY = 2 * res;
            g.drawImage(cal.canvas, box.x, box.y, box.w, box.h);
            g.restore();
            sp.rot = rot;
            return sp;
        });
    }
    const TWIG_GREEN = [[0, '#16240f'], [0.25, '#2c431a'], [0.5, '#4d6a26'], [0.75, '#7d9a3c'], [1, '#b6cb6a']];

    // ------------------------------------------------------------------ leaf
    // The midrib runs along +x from the stalk at (0, 0). A citrus leaf is a glossy trough:
    // its halves rise from the midrib, so one takes the light and the other loses it.
    // Three lights for a leaf: in the sun, in the open shade, deep in the tree; and its
    // pale underside.
    const LEAF = [[0, '#0f2a1c'], [0.2, '#1b4526'], [0.38, '#28632d'], [0.54, '#3b8036'], [0.7, '#57a044'], [0.86, '#82c05c'], [1, '#b4dd86']];
    const LEAVES = {
        sun: { ramp: [[0, '#12321d'], [0.2, '#215226'], [0.38, '#31732c'], [0.54, '#4a9135'], [0.7, '#6eb043'], [0.86, '#9fce5f'], [1, '#d2ea8f']], sheen: '#eef8d0', gloss: 1 },
        mid: { ramp: LEAF, sheen: '#dcf1c6', gloss: 0.8 },
        deep: { ramp: [[0, '#081b15'], [0.25, '#0f3021'], [0.45, '#184529'], [0.62, '#235c32'], [0.8, '#35773e'], [1, '#55964f']], sheen: '#a9cdb6', gloss: 0.5 },
        under: { ramp: [[0, '#1c3322'], [0.25, '#35553a'], [0.5, '#5a7d55'], [0.75, '#86a873'], [1, '#b9d39e']], sheen: null, gloss: 0 },
    };

    function leafGeom(v) {
        const r = Motion.rng('leaf' + v);
        const L = 200 * (0.78 + r() * 0.44), W = L * (0.19 + r() * 0.1);
        const bend = (r() - 0.5) * 0.3, fold = 0.2 + r() * 0.5, twist = (r() - 0.5) * 1.1;
        const lift = (r() - 0.5) * 0.6, droop = r() * 0.6, waves = 2.5 + r() * 3, wavy = 0.02 + r() * 0.04, ph = r() * 6;
        const gloss = r(); // how much of the leaf mirrors the sky
        const wAt = (u) => W * Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(u, 0.74))), 0.78) * (1 - 0.3 * u * u);
        const B = (x) => bend * L * 4 * (x / L) * (1 - x / L);
        const up = [], dn = [];
        const n = 44;
        for (let i = 0; i <= n; i++) {
            const u = i / n, x = u * L, w = wAt(u);
            up.push([x, B(x) - w * (1 + wavy * Math.sin(u * waves * 6.28 + ph))]);
            dn.push([x, B(x) + w * (1 + wavy * Math.sin(u * waves * 6.28 + ph + 2))]);
        }
        const pts = [[-13, 1.9], [-13, -1.9], [-2, -2.5], ...up, ...dn.reverse(), [-2, 2.5]];
        return { L, W, bend, fold, twist, lift, droop, gloss, wAt, B, pts };
    }

    const LSTEP = Math.PI / 6;
    function leaf(v = 0, rot = 0, res = 2, kind = 'mid') {
        rot = Math.round(rot / LSTEP) * LSTEP;
        return memo(`leaf${v}/${rot.toFixed(3)}@${res}${kind}`, () => {
            const G = leafGeom(v), K = LEAVES[kind];
            const { L, wAt, B, pts } = G;
            const box = S.bbox(pts, 5);
            const th = 0.9, ct = Math.cos(th), sn = Math.sin(th);
            const glossy = G.gloss * K.gloss;
            const sp = S.form({
                box, res, seed: 'leaf' + v, light: S.lightFor(rot), inflate: 'none',
                mask: (g) => {
                    g.beginPath();
                    S.trace(g, pts);
                    g.fill();
                },
                height: (x, y) => {
                    const u = S.clamp(x / L), yb = y - B(x), w = Math.max(1, wAt(u)), vv = yb / w, av = Math.abs(vv), side = vv < 0 ? -1 : 1;
                    let h = G.fold * (1 + G.twist * side) * Math.abs(yb); // the trough
                    h += G.lift * (x - L / 2) * 0.35 - G.droop * Math.pow(Math.max(0, u - 0.55), 2) * L * 0.9; // lifted or drooping tip
                    h += 0.75 * Math.sin(6.28 * 9 * (u - 0.26 * av)) * av * (1 - av) * 4; // quilting between the veins
                    h += w * 0.1 * Math.pow(av, 4) * (side < 0 ? 1 : -0.6); // the margin turns
                    h -= 1.6 * Math.exp(-Math.pow(yb / 2.4, 2)); // the midrib's groove
                    return h;
                },
                ramp: K.ramp, soft: 0.86,
                edge: { rough: 2.2, freq: 0.22, amp: 0.9 },
                mottle: { amp: 0.07, freq: 0.018 },
                stroke: {
                    amp: 0.1,
                    // the brush follows the veins, out and forward from the midrib
                    field: (x, y) => {
                        const yb = Math.abs(y - B(x));
                        return [(x * ct + yb * sn) * 0.011, (-x * sn + yb * ct) * 0.13, y - B(x) < 0 ? 0.2 : 3.7];
                    },
                },
                // the sky mirrored in the leaf: a band on glossy leaves, a hint on the others
                spec: K.sheen ? { amp: 0.25 + 0.55 * glossy, power: 9 + 14 * (1 - glossy), from: 0.62 - 0.1 * glossy, to: 0.92, ragged: 0.7, color: K.sheen } : null,
                tint: (x, y, tone, rgb, m) => {
                    // darker at the stalk, and where the blade turns away at its edge
                    const k = S.smooth(0.3, 0, x / L) * 0.38 + S.smooth(0.045, 0, m) * S.smooth(0.55, 0.25, tone) * 0.3;
                    rgb[0] *= 1 - k;
                    rgb[1] *= 1 - k * 0.85;
                    rgb[2] *= 1 - k * 0.8;
                },
                over: (g) => {
                    g.lineCap = 'round';
                    // secondary veins: pale hairlines that curve forward to the margin
                    const r = Motion.rng('veins' + v);
                    g.strokeStyle = kind === 'under' ? 'rgba(210,228,180,0.36)' : kind === 'deep' ? 'rgba(120,170,120,0.16)' : 'rgba(196,226,150,0.2)';
                    for (const side of [-1, 1]) {
                        for (let k = 1; k <= 7; k++) {
                            const u0 = 0.08 + (k / 8) * 0.8 + (r() - 0.5) * 0.07, x0 = u0 * L;
                            g.lineWidth = 1.1 - k * 0.05;
                            g.beginPath();
                            g.moveTo(x0, B(x0));
                            for (let j = 1; j <= 8; j++) {
                                const q = j / 8, u = Math.min(0.99, u0 + q * 0.2 * (1 - u0 * 0.5)), x = u * L;
                                g.lineTo(x, B(x) + side * wAt(u) * Math.pow(q, 0.8) * 0.93);
                            }
                            g.stroke();
                        }
                    }
                    // the midrib: light, tapering to the tip, with its own shade under it
                    const rib = kind === 'under' ? '#cfe0b0' : kind === 'deep' ? '#6f9a62' : kind === 'sun' ? '#cfe69a' : '#b7d889';
                    for (const [col, w0, dy] of [['rgba(16,44,26,0.5)', 3.4, 1.3], [rib, 2.5, 0]]) {
                        const a1 = [], a2 = [];
                        for (let i = 0; i <= 40; i++) {
                            const u = i / 40, x = -12 + u * (L * 0.985 + 12), w = w0 * (1 - u * 0.85) * 0.5;
                            a1.push([x, B(Math.max(0, x)) + dy - w]);
                            a2.push([x, B(Math.max(0, x)) + dy + w]);
                        }
                        g.fillStyle = col;
                        g.beginPath();
                        S.trace(g, [...a1, ...a2.reverse()]);
                        g.fill();
                    }
                },
            });
            sp.rot = rot;
            sp.len = L;
            return sp;
        });
    }

    // ------------------------------------------------------------------ blossom
    const WHITE = [[0, '#77738f'], [0.22, '#a29fb8'], [0.42, '#cbc8d6'], [0.62, '#e8e5e3'], [0.82, '#f8f5ee'], [1, '#ffffff']];

    // One waxy petal along +x from the flower's centre.
    function petalSprite(v, rot, res, len, wid, cup) {
        const pts = [];
        const n = 40;
        for (let i = 0; i <= n; i++) {
            const u = i / n;
            pts.push([4 + u * len, -wid * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 0.52)]);
        }
        for (let i = n; i >= 0; i--) {
            const u = i / n;
            pts.push([4 + u * len, wid * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 0.52)]);
        }
        const box = S.bbox(pts, 4);
        return S.form({
            box, res, seed: 'petal' + v, light: S.lightFor(rot), relief: 0.5,
            mask: (g) => {
                g.beginPath();
                S.trace(g, pts);
                g.fill();
            },
            // thick petals curl back at the tip and keep a crease down the middle
            height: (x, y) => -cup * Math.pow(Math.max(0, x / len - 0.45), 2) * len * 0.8 - 0.9 * Math.exp(-Math.pow(y / 1.6, 2)) * S.smooth(len, len * 0.2, x),
            ramp: WHITE, soft: 0.9,
            edge: { rough: 1.1, freq: 0.3, amp: 0.7 },
            mottle: { amp: 0.05, freq: 0.06 },
            stroke: { amp: 0.16, field: (x, y) => [x * 0.014, y * 0.26, 0.5] },
            tint: (x, y, tone, rgb) => {
                // green-yellow where the petal leaves the cup
                const k = S.smooth(len * 0.34, 0, x) * 0.5;
                rgb[0] += (206 - rgb[0]) * k;
                rgb[1] += (214 - rgb[1]) * k;
                rgb[2] += (140 - rgb[2]) * k;
            },
        });
    }

    function blossom(v = 0, rot = 0, res = 2) {
        rot = snap(rot);
        return memo(`blossom${v}/${rot.toFixed(3)}@${res}`, () => {
            const r = Motion.rng('blossom' + v);
            const box = { x: -62, y: -62, w: 124, h: 124 };
            const c = document.createElement('canvas');
            c.width = Math.ceil(box.w * res);
            c.height = Math.ceil(box.h * res);
            const g = c.getContext('2d');
            g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
            const n = 5, a0 = r() * 6.28;
            const order = [0, 2, 4, 1, 3];
            for (const k of order) {
                const a = a0 + (k / n) * Math.PI * 2 + (r() - 0.5) * 0.22;
                const len = 44 + r() * 9, wid = 12.5 + r() * 3;
                const p = petalSprite(`${v}-${k}`, rot + a, res, len, wid, 0.5 + r() * 0.9);
                // each petal shades the one under it
                g.save();
                g.globalCompositeOperation = 'source-atop';
                g.translate(0, 0);
                g.rotate(a);
                g.shadowColor = 'rgba(70,66,100,0.55)';
                g.shadowBlur = 5 * res;
                g.shadowOffsetX = 2.5 * res;
                g.shadowOffsetY = 3 * res;
                g.drawImage(p.canvas, p.box.x, p.box.y, p.box.w, p.box.h);
                g.restore();
                S.put(g, p, { rot: a });
            }
            // the column of stamens: a pale cup, a ring of anthers, the green stigma
            g.fillStyle = '#e4dcae';
            g.beginPath();
            g.arc(0, 0, 8.5, 0, 6.3);
            g.fill();
            g.fillStyle = 'rgba(120,110,70,0.35)';
            g.beginPath();
            g.arc(1.2, 1.5, 8.5, 0, 6.3);
            g.arc(0, 0, 8.5, 0, 6.3, true);
            g.fill('evenodd');
            const m = 13;
            for (let i = 0; i < m; i++) {
                const a = (i / m) * 6.28 + r() * 0.3, rr = 7.2 + r() * 3.4;
                const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
                g.fillStyle = '#9a6a12';
                g.beginPath();
                g.ellipse(x + 0.5, y + 0.6, 3.1, 2, a + 1.5, 0, 6.3);
                g.fill();
                g.fillStyle = r() < 0.4 ? '#f7d24a' : '#eeb92c';
                g.beginPath();
                g.ellipse(x, y, 2.8, 1.8, a + 1.5, 0, 6.3);
                g.fill();
                g.fillStyle = 'rgba(255,246,190,0.8)';
                g.beginPath();
                g.ellipse(x - 0.6, y - 0.6, 1.1, 0.7, a + 1.5, 0, 6.3);
                g.fill();
            }
            g.fillStyle = '#7f9a3c';
            g.beginPath();
            g.arc(0, 0, 3.6, 0, 6.3);
            g.fill();
            g.fillStyle = '#c9dd7c';
            g.beginPath();
            g.arc(-0.9, -1, 1.7, 0, 6.3);
            g.fill();
            return { canvas: c, box, rot };
        });
    }

    // A closed bud: a waxy egg with a violet flush, in its green cup.
    function bud(v = 0, rot = 0, res = 2) {
        rot = snap(rot);
        return memo(`bud${v}/${rot.toFixed(3)}@${res}`, () => {
            const r = Motion.rng('bud' + v);
            const len = 26 + r() * 10, wid = 9 + r() * 3;
            const pts = S.ellipse(len * 0.5 + 6, 0, len * 0.5, wid, 40).map(([x, y]) => [x, y * (0.75 + 0.45 * S.smooth(6, len, x))]);
            const cup = [[0, -2], [5, -5.5], [13, -6.5], [15, 0], [13, 6.5], [5, 5.5], [0, 2]];
            const box = S.bbox([...pts, ...cup, [-14, 0]], 4);
            const sp = S.form({
                box, res, seed: 'bud' + v, light: S.lightFor(rot),
                mask: (g) => {
                    g.beginPath();
                    S.trace(g, pts);
                    g.fill();
                },
                ramp: WHITE, soft: 0.9,
                stroke: { amp: 0.05, field: (x, y) => [x * 0.02, y * 0.2, 0.5] },
                tint: (x, y, tone, rgb) => {
                    const k = S.smooth(len * 0.2, len * 1.05, x) * 0.5;
                    rgb[0] += (196 - rgb[0]) * k;
                    rgb[1] += (150 - rgb[1]) * k;
                    rgb[2] += (186 - rgb[2]) * k;
                },
            });
            const g = sp.canvas.getContext('2d');
            g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
            const cs = S.form({
                box, res, seed: 'cup' + v, light: S.lightFor(rot),
                mask: (g2) => {
                    g2.beginPath();
                    S.trace(g2, S.curve(cup, true, 8));
                    g2.fill();
                    g2.fillRect(-14, -1.6, 15, 3.2);
                },
                ramp: LEAF, soft: 0.9,
            });
            g.drawImage(cs.canvas, box.x, box.y, box.w, box.h);
            sp.rot = rot;
            return sp;
        });
    }

    // ------------------------------------------------------------------ twig
    // A woody shoot through the given points (the composition's own coordinates), thicker at
    // its start. Not instanced: one sprite per twig.
    const TWIG = [[0, '#17170d'], [0.25, '#33301a'], [0.5, '#585028'], [0.72, '#857a3c'], [1, '#bcb06a']];
    function twig(key, pts, w0 = 9, w1 = 4, res = 2) {
        return memo(`twig${key}@${res}`, () => {
            const line = S.curve(pts, false, 14);
            const n = line.length;
            const L = [], Rr = [];
            for (let i = 0; i < n; i++) {
                const p = line[Math.max(0, i - 1)], q = line[Math.min(n - 1, i + 1)];
                const tx = q[0] - p[0], ty = q[1] - p[1], tl = Math.hypot(tx, ty) || 1;
                const w = (w0 + (w1 - w0) * (i / (n - 1))) * (1 + 0.12 * S.noise2(i * 0.3, 1, S.seedOf(key))) * 0.5;
                L.push([line[i][0] - (ty / tl) * w, line[i][1] + (tx / tl) * w]);
                Rr.push([line[i][0] + (ty / tl) * w, line[i][1] - (tx / tl) * w]);
            }
            const poly = [...L, ...Rr.reverse()];
            const box = S.bbox(poly, 4);
            return S.form({
                box, res, seed: 'twig' + key,
                mask: (g) => {
                    g.beginPath();
                    S.trace(g, poly);
                    g.fill();
                },
                ramp: TWIG, soft: 0.9,
                edge: { rough: 1.2, freq: 0.3, amp: 0.8 },
                // bark: ridges along the shoot, a knot now and then
                height: (x, y) => 0.5 * S.noise2(x * 0.02, y * 0.3, 3) + 0.35 * S.noise2(x * 0.3, y * 0.02, 4),
                stroke: { amp: 0.12, freq: 0.08, tone: 4 },
                mottle: { amp: 0.1, freq: 0.05 },
            });
        });
    }

    return { lemon, lemonShape, leaf, leafGeom, blossom, bud, twig, put, snap };
})();
