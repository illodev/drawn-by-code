// The lemon tree, in the brush manner (no contour line: lit volumes, strokes that follow the
// form, edges broken by the last stroke). Every piece is painted once per pixel as a sprite
// (`Souvenir.form`) or as a tube (`branch`) and instanced by tableaux/lemons.js. Global: Citrus.
//
// ANATOMY · what a lemon tree really has, and where it is painted here
//
//   The fruit (`lemon`, `fruitlet`). A profile of revolution: an oval body, a nipple on a
//   slight neck, a collar (sometimes a drawn-out shoulder) under the calyx.
//     1  every age on one tree: the fruitlet just after petal fall, dark green and glossy,
//        with the withered style still on its tip; green lemons; turning ones (yellow coming
//        from the nipple end, or in blotches); ripe; over-ripe, deeper and duller
//     2  the peel's oil glands: pores as a dark speck with a light one beside it, towards
//        the lamp; around the sheen they glint
//     3  the calyx, «the button»: five sepals on the collar and a stout angular stalk
//     4  a green shoulder that the sun never reached, on some ripe ones
//     5  a russet scuff where a branch rubbed; a healed scratch, pale with a brown lip
//     6  sooty mould near the stalk, running down in drips
//     7  red scale: a few brown limpets with a pale nipple
//     8  an over-ripe one has a corky brown scar with cracks, or a split showing the pith
//     9  seen from the nipple end (the nipple as a boss with the style's scar) and from the
//        stalk end (the button in a dimple with furrows running out of it), not only in profile
//     10 light bounced up from the leaves into the rim of its shadow; the nipple keeps green
//
//   The leaf (`leaf`). A glossy trough on a short winged petiole with a joint under the
//   blade; the margin has shallow round teeth and waves; 7–11 veins to a side leave the
//   midrib at their own spacing, run forward and loop near the margin.
//     1  kinds: in the sun, in open shade, deep in the tree; the paler matt underside with
//        its raised midrib and gland dots; a young leaf, yellow-green, thin and limp; a
//        bronze-red one at a shoot's tip; an old one yellowing between veins that stay
//        green; a backlit one, glowing, veins and midrib dark, the shadow of a neighbour on it
//     2  the blade quilts between the veins, so the sky's sheen breaks at every vein
//     3  a leaf miner's silvery trail with its dark thread of frass
//     4  a bite out of the margin, a shot hole: both with a brown lip and a yellow halo
//     5  a dry brown tip behind a dark line
//     6  brown specks with a halo; a yellow blotch; sooty mould; scale along the midrib
//     7  the tip curled over, showing the underside and shading the blade
//     8  a thin light on the margin that faces the lamp (the leaf's thickness)
//     9  net veins between the main ones on some; none at all on the smoothest
//     10 the petiole's narrow wing, lighter than the blade
//
//   The wood (`branch`, `thorn`, `cut`, `scar`). Young shoots are green and angular (a
//   ridge runs down from every leaf); year-old wood is green striped with grey-brown; old
//   wood is grey-brown and fissured, with pale lenticels across the grain. Nodes swell; a
//   fallen leaf leaves a crescent scar with a bud above it; thorns stand in the axils, green
//   with a brown tip; a pruned stub shows its rings.
//
//   The blossom, azahar (`flower`, `bud`, `spent`, `petal`). Clusters at the shoot tips, at
//   every stage at once.
//     1  tight round buds flushed purple; long buds about to open, their seams showing
//     2  half-open: a cup of petals, purple outside, the anthers looking over its rim
//     3  open: five thick waxy petals (now and then four), white inside, curled back,
//        with a crease, brush strokes of sheen, a greenish claw
//     4  the outside of every petal is flushed purple and dotted with glands
//     5  20–30 stamens joined below into a white tube, each with a yellow anther with a
//        groove; older anthers go brown
//     6  pollen dusted on the petals around the column
//     7  the green pistil standing over the anthers, its sticky stigma with a glint
//     8  a bruise on a petal; a browning edge on an old flower
//     9  a spent flower: the calyx, the swelling ovary, the style, a dried stamen or two
//     10 the little green cup of the calyx with its teeth, on a pale pedicel
//
//   Water (`drop`): a dew drop is dark on the side of the lamp and bright on the far side,
//   with a point of light and a small shadow. And ants (`ant`) on the wood: they farm the scale.
//
// Units: a lemon is about 190 long, a leaf 160–250 (young ones 100–160), an open flower 100
// across, a long bud 45, a fruitlet 20–36.
//
// Light. Every sprite takes the angle it will be pasted at and bakes the house light for the
// nearest of eight turns (`sp.rot`); paste it at its TRUE angle with `Citrus.put(g, sp, x, y,
// s, { rot })`: the light is then at most 22° off, which no eye finds, and no two pieces sit
// at the same angle. Never mirror a sprite (a negative scale moves the lamp).
const Citrus = (() => {
    const S = Souvenir;
    const TAU = Math.PI * 2;
    const cache = new Map();
    const stat = { sprites: 0, px: 0 };
    const count = (sp) => {
        stat.sprites++;
        stat.px += sp.canvas.width * sp.canvas.height;
        return sp;
    };
    const memo = (key, fn) => {
        let v = cache.get(key);
        if (!v) {
            v = count(fn());
            cache.set(key, v);
        }
        return v;
    };
    const canvas = (w, h) => {
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.ceil(w));
        c.height = Math.max(1, Math.ceil(h));
        return c;
    };
    const NL = 8, LSTEP = TAU / NL;
    const lkey = (rot) => ((Math.round(rot / LSTEP) % NL) + NL) % NL;
    const LN = (() => {
        const l = Math.hypot(S.LIGHT[0], S.LIGHT[1], S.LIGHT[2]);
        return [S.LIGHT[0] / l, S.LIGHT[1] / l, S.LIGHT[2] / l];
    })();
    // towards the lamp, in the plane of a sprite baked for turn k
    const light2 = (k) => {
        const L = S.lightFor(k * LSTEP), l = Math.hypot(L[0], L[1]);
        return [L[0] / l, L[1] / l];
    };
    const toward = (rgb, r, g, b, k) => {
        rgb[0] += (r - rgb[0]) * k;
        rgb[1] += (g - rgb[1]) * k;
        rgb[2] += (b - rgb[2]) * k;
    };
    const disc = (g, x, y, r) => {
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        g.fill();
    };
    const oval = (g, x, y, rx, ry, a = 0) => {
        g.beginPath();
        g.ellipse(x, y, rx, ry, a, 0, TAU);
        g.fill();
    };
    const poly = (g, pts) => {
        g.beginPath();
        S.trace(g, pts);
        g.fill();
    };
    const line = (g, pts, w, color) => {
        g.lineWidth = w;
        g.strokeStyle = color;
        g.beginPath();
        S.trace(g, pts, false);
        g.stroke();
    };

    // Brush marks laid softly: what `draw` paints goes down through a blur of `blur` units,
    // in one pass (a filter on every stroke would cost a pass each).
    const softly = (g, blur, draw) => {
        const m = g.getTransform(), c = canvas(g.canvas.width, g.canvas.height), q = c.getContext('2d');
        q.setTransform(m);
        draw(q);
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.filter = `blur(${(blur * Math.hypot(m.a, m.b)).toFixed(2)}px)`;
        g.drawImage(c, 0, 0);
        g.restore();
    };

    // ------------------------------------------------------------------ pasting
    // Paste a sprite at its true angle (o.rot), tipped (fx: along it, fy: across it).
    function put(g, sp, x, y, s = 1, o = {}) {
        S.put(g, sp, { x, y, rot: o.rot ?? sp.rot ?? 0, sx: s * (o.fx ?? 1), sy: s * (o.fy ?? 1), alpha: o.alpha ?? 1 });
    }
    // A sprite's shadow, blurred once at a small size and kept: pasting it costs one
    // drawImage (the kit's `cast` blurs at full size on every paste).
    const SHADE = '#061c18';
    function shadowOf(sp, blur = 7, color = SHADE) {
        const key = blur + color;
        sp.sh = sp.sh || {};
        if (!sp.sh[key]) {
            const r0 = sp.canvas.width / sp.box.w, rs = Math.min(r0, Math.max(0.2, 2.4 / blur));
            const pad = blur * 2.1;
            const c = canvas((sp.box.w + pad * 2) * rs, (sp.box.h + pad * 2) * rs), q = c.getContext('2d');
            q.filter = `blur(${(blur * rs).toFixed(2)}px)`;
            q.drawImage(sp.canvas, pad * rs, pad * rs, sp.box.w * rs, sp.box.h * rs);
            q.filter = 'none';
            q.globalCompositeOperation = 'source-in';
            q.fillStyle = color;
            q.fillRect(0, 0, c.width, c.height);
            sp.sh[key] = { canvas: c, box: { x: sp.box.x - pad, y: sp.box.y - pad, w: c.width / rs, h: c.height / rs } };
        }
        return sp.sh[key];
    }
    // The shadow of a sprite on the paint already there (dx, dy in the caller's units).
    function shadow(g, sp, x, y, s = 1, o = {}) {
        const sh = shadowOf(sp, o.blur ?? 7, o.color ?? SHADE);
        g.save();
        g.globalCompositeOperation = 'source-atop';
        S.put(g, sh, { x: x + (o.dx ?? 5), y: y + (o.dy ?? 8), rot: o.rot ?? sp.rot ?? 0, sx: s * (o.fx ?? 1), sy: s * (o.fy ?? 1), alpha: o.alpha ?? 0.5 });
        g.restore();
    }
    // The same sprite under another light: its paint multiplied by a colour (the shade of the
    // tree), then a veil of the air's colour. A copy, kept with the sprite.
    function graded(sp, mul, veil = null, veilA = 0) {
        const key = mul + veil + veilA;
        sp.gr = sp.gr || {};
        if (!sp.gr[key]) {
            const c = canvas(sp.canvas.width, sp.canvas.height), q = c.getContext('2d');
            q.drawImage(sp.canvas, 0, 0);
            q.globalCompositeOperation = 'multiply';
            q.fillStyle = mul;
            q.fillRect(0, 0, c.width, c.height);
            if (veil) {
                q.globalCompositeOperation = 'source-over';
                q.globalAlpha = veilA;
                q.fillStyle = veil;
                q.fillRect(0, 0, c.width, c.height);
                q.globalAlpha = 1;
            }
            q.globalCompositeOperation = 'destination-in';
            q.drawImage(sp.canvas, 0, 0);
            sp.gr[key] = count({ ...sp, canvas: c, sh: null, gr: null });
        }
        return sp.gr[key];
    }

    // ------------------------------------------------------------------ lemon
    // Hanging nipple down: axis along +y, the stalk end at the top.
    const RIPE = [[0, '#3b280c'], [0.16, '#6e4a10'], [0.3, '#9b6d13'], [0.43, '#c5941a'], [0.56, '#e4b624'], [0.7, '#f3ce39'], [0.85, '#fadf68'], [1, '#fff2b2']];
    const OVER = [[0, '#3a2108'], [0.16, '#693c0c'], [0.3, '#96560f'], [0.43, '#bd7814'], [0.56, '#d99a1c'], [0.7, '#eab42c'], [0.85, '#f5cc54'], [1, '#fde49a']];
    const UNRIPE = [[0, '#13220c'], [0.16, '#213a12'], [0.3, '#33551a'], [0.43, '#4a7222'], [0.56, '#648e2a'], [0.7, '#84a938'], [0.85, '#adc95a'], [1, '#dbe99c']];
    const FRUITLET = [[0, '#0b190b'], [0.25, '#153015'], [0.5, '#244a1c'], [0.72, '#3b6e27'], [0.88, '#669c40'], [1, '#b2d484']];
    const TWIG_GREEN = [[0, '#16240f'], [0.25, '#2c431a'], [0.5, '#4d6a26'], [0.75, '#7d9a3c'], [1, '#b6cb6a']];
    const RIPE_FN = S.rampFn(RIPE, 0.92), UNRIPE_FN = S.rampFn(UNRIPE, 0.92);

    // view: 'side' (in profile), 'tip' (the nipple towards the eye), 'stalk' (the button towards it)
    function lemonShape(v = 0, view = 'side') {
        const r = Motion.rng('lemon' + v);
        const a = 88 * (0.92 + r() * 0.17), b = 64 * (0.93 + r() * 0.13), lean = (r() - 0.5) * 0.13;
        const nipL = a * (0.15 + r() * 0.1), nipW = b * (0.19 + r() * 0.07), fat = 1.9 + r() * 0.7;
        const neck = r() < 0.4 ? 0.04 + r() * 0.1 : 0; // a drawn-out shoulder under the calyx
        const l1 = r() * TAU, l2 = r() * TAU, lump = 0.012 + r() * 0.02;
        const turn = 0.3 + r() * 0.25;
        if (view !== 'side') {
            // the fruit turned towards the eye: a rounder outline, lumpy, the far end hidden
            const ry = b + (a - b) * turn, rx = b * 1.02, pts = [];
            for (let i = 0; i < 96; i++) {
                const th = (i / 96) * TAU, k = 1 + lump * Math.sin(th * 3 + l1) + lump * 0.7 * Math.sin(th * 5 + l2);
                pts.push([Math.cos(th) * rx * k, Math.sin(th) * ry * k]);
            }
            const f = [lean * 40, view === 'tip' ? ry - b * 0.3 : -(ry - b * 0.72)];
            return { pts, a, b, rx, ry, f, nipW, nipL, view, top: view === 'tip' ? [0, -ry + 8] : [f[0] - 2, f[1] - 20], tip: view === 'tip' ? f : [0, ry] };
        }
        const smax = (p, q, k) => 0.5 * (p + q + Math.sqrt((p - q) * (p - q) + k * k));
        const half = (y, ph) => {
            const body = Math.abs(y) < a ? b * Math.pow(1 - Math.pow(Math.abs(y / a), fat), 0.6) : 0;
            const yn = (y - a * 0.9) / nipL, nip = Math.abs(yn) < 1 ? nipW * Math.pow(1 - yn * yn, 0.55) : 0;
            const yt = (y + a * (0.99 + neck * 0.3)) / (a * (0.1 + neck)), top = Math.abs(yt) < 1 ? b * (0.17 + neck * 0.45) * Math.sqrt(1 - yt * yt) : 0;
            return Math.max(0, smax(smax(body, nip, 5), top, 3) - 3.2) * (1 + lump * Math.sin(y * 0.05 + ph));
        };
        const y0 = -a * (1.07 + neck * 1.28), y1 = a * 0.9 + nipL;
        const right = [], left = [];
        const n = 76;
        for (let i = 0; i <= n; i++) {
            // more points near the ends, where the outline turns fastest
            const u = 0.5 - 0.5 * Math.cos((i / n) * Math.PI), y = y0 + (y1 - y0) * u;
            right.push([half(y, l1) + lean * y, y]);
            left.push([-half(y, l2) + lean * y, y]);
        }
        return { pts: [...right, ...left.reverse()], a, b, view, top: [lean * y0, y0], tip: [lean * y1, y1] };
    }

    // The calyx seen from the side on the collar: five sepals and a stub of stalk.
    function button(g, box, res, L, v, top, k = 1) {
        const star = [], tips = [];
        for (let i = 0; i < 40; i++) {
            // five short blunt lobes: a button, not a star
            const a = (i / 40) * TAU + 0.2 + v, lobe = Math.pow(0.5 + 0.5 * Math.cos(5 * (a - 0.2 - v)), 0.8), rr = (9.6 + (2.9 + 1.2 * S.hashI(Math.floor((i + 4) / 8) % 5, v, 3, 5)) * lobe) * k;
            star.push([top[0] + Math.cos(a) * rr * 1.15, top[1] + 4.5 * k + Math.sin(a) * rr * 0.5]);
            if (i % 8 === 0) tips.push(star[i]);
            if (i % 8 === 4) tips.push(star[i]);
        }
        const stalk = [[top[0] - 3.9 * k, top[1] + 4 * k], [top[0] - 3 * k, top[1] - 10 * k], [top[0] - 3.4 * k, top[1] - 16 * k], [top[0] + 3.2 * k, top[1] - 16 * k], [top[0] + 3.1 * k, top[1] - 9 * k], [top[0] + 3.9 * k, top[1] + 4 * k]];
        const cal = S.form({
            box, res, seed: 'calyx' + v, light: L, relief: 0.8,
            mask: (q) => {
                poly(q, star);
                poly(q, stalk);
            },
            ramp: TWIG_GREEN, soft: 0.9, mottle: { amp: 0.07, freq: 0.2 },
            stroke: { amp: 0.08, freq: 0.2, tone: 3 },
            over: (q) => {
                // the sepals' pale tips, the seams between them, the stalk's ridges
                q.lineCap = 'round';
                for (let i = 0; i < 10; i += 2) {
                    const p = tips[i], c = [top[0], top[1] + 4 * k];
                    line(q, [[c[0] + (p[0] - c[0]) * 0.45, c[1] + (p[1] - c[1]) * 0.45], [c[0] + (p[0] - c[0]) * 0.92, c[1] + (p[1] - c[1]) * 0.92]], 0.7 * k, 'rgba(206,224,140,0.45)');
                    const s = tips[(i + 1) % 10];
                    line(q, [[c[0] + (s[0] - c[0]) * 0.4, c[1] + (s[1] - c[1]) * 0.4], s], 0.8 * k, 'rgba(14,30,10,0.5)');
                }
                line(q, [[top[0] - 1.2 * k, top[1] + 2 * k], [top[0] - 1 * k, top[1] - 15 * k]], 0.9 * k, 'rgba(210,226,150,0.4)');
                line(q, [[top[0] + 1.5 * k, top[1] + 2 * k], [top[0] + 1.3 * k, top[1] - 15 * k]], 0.8 * k, 'rgba(14,30,10,0.4)');
            },
        });
        g.save();
        g.shadowColor = 'rgba(60,40,6,0.6)';
        g.shadowBlur = 3 * res;
        g.shadowOffsetX = 1.5 * res;
        g.shadowOffsetY = 2 * res;
        g.drawImage(cal.canvas, box.x, box.y, box.w, box.h);
        g.restore();
    }

    // age: 'green' | 'turning' | 'ripe' | 'over'
    function lemon(v = 0, rot = 0, res = 2, o = {}) {
        const age = o.age ?? 'ripe', view = o.view ?? 'side', lk = lkey(rot);
        return memo(`lemon${v}/${age}/${view}/${lk}@${res}`, () => {
            const G = lemonShape(v, view), pts = G.pts;
            const box = S.bbox([...pts, G.top], 24);
            const r = Motion.rng('lemon-paint' + v + age + view);
            const L = S.lightFor(lk * LSTEP, [-0.62, -0.68, 0.22]);
            const l2 = light2(lk);
            const sd = S.seedOf('lemon' + v + age);
            const hx = L[0] * 44, hy = L[1] * (view === 'side' ? 58 : 46);
            const mode = age === 'turning' ? (v % 2 ? 'tip' : 'blotch') : null;
            const shoulder = age === 'ripe' && view === 'side' && r() < 0.45 ? 0.35 + r() * 0.4 : 0;
            const tmpY = [0, 0, 0], tmpG = [0, 0, 0];
            const f = G.f, bossR = (G.nipW ?? 12) * 1.15;
            // what happened to this one
            const marks = [];
            const spot = () => {
                const a = r() * TAU, d = Math.sqrt(r()) * 0.62;
                return [Math.cos(a) * G.b * d, Math.sin(a) * (G.ry ?? G.a) * d];
            };
            if (age !== 'green' && r() < 0.55) marks.push(['scuff', spot(), r() * TAU, 14 + r() * 16]);
            if (r() < 0.5) marks.push(['scratch', spot(), r() * TAU, 22 + r() * 34]);
            if (view === 'side' && r() < 0.24) marks.push(['mould']);
            if (r() < 0.26) marks.push(['scale', spot()]);
            if (age === 'over') marks.push([v % 2 ? 'split' : 'scar', spot(), r() * TAU]);
            const sp = S.form({
                box, res, seed: 'lemon' + v, light: L,
                mask: (g) => {
                    poly(g, pts);
                    if (view === 'tip') disc(g, f[0], f[1] + bossR * 0.5, bossR * 0.9);
                },
                // the peel's slow lumps; turned to the eye, the nipple as a boss in a shallow
                // moat, or the dimple the stalk sits in with its furrows
                height: (x, y) => {
                    let h = 0.6 * S.noise2(x * 0.07, y * 0.07, 9) + 0.05 * S.noise2(x * 0.5, y * 0.5, 5);
                    if (view === 'tip') {
                        const d = Math.hypot(x - f[0], y - f[1]);
                        h += 13 * Math.exp(-(d * d) / (bossR * bossR * 0.42)) - 2.2 * Math.exp(-Math.pow((d - bossR * 1.35) / (bossR * 0.42), 2));
                    } else if (view === 'stalk') {
                        const dx = x - f[0], dy = y - f[1], d = Math.hypot(dx, dy);
                        h += -3.2 * Math.exp(-(d * d) / 260) + 1.3 * Math.cos(Math.atan2(dy, dx) * 6 + v) * Math.exp(-d / 22) * S.smooth(3, 12, d);
                    }
                    return h;
                },
                ramp: age === 'green' ? UNRIPE : age === 'over' ? OVER : RIPE, soft: 0.92,
                edge: { rough: 1.6, freq: 0.2, amp: 0.7 },
                stroke: { amp: 0.05, freq: 0.03, tone: 9 },
                mottle: { amp: 0.035, freq: 0.014 },
                spec: { amp: age === 'over' ? 0.4 : 0.6, power: 11, from: 0.55, to: 0.95, ragged: 0.45, color: age === 'green' ? '#f0f8d6' : '#fff8d2' },
                markAmp: 0.34,
                marks: (g) => {
                    // strokes that follow the form: arcs about the point nearest the lamp
                    for (let i = 0; i < 74; i++) {
                        const rad = 14 + r() * 160, a0 = r() * TAU, span = (0.25 + r() * 0.5) * (40 / (rad + 30)) * 2.3;
                        const arc = [];
                        for (let k = 0; k <= 10; k++) arc.push([hx + Math.cos(a0 + (span * k) / 10) * rad, hy + Math.sin(a0 + (span * k) / 10) * rad * 1.12]);
                        S.dab(g, arc, { w: 4 + r() * 8, color: r() < 0.5 ? '#ffffff' : '#000000', alpha: 0.25 + r() * 0.35, bristles: 6, seed: 'ls' + v + '-' + i, dry: 0.55 });
                    }
                    // the oil glands: a dark speck and, towards the lamp, a light one
                    const p = 3.3;
                    for (let j = Math.floor(box.y / p); j < (box.y + box.h) / p; j++) {
                        for (let i = Math.floor(box.x / p); i < (box.x + box.w) / p; i++) {
                            const h1 = S.hashI(i, j, 1, sd), h2 = S.hashI(i, j, 2, sd), h3 = S.hashI(i, j, 3, sd);
                            if (h3 < 0.16) continue;
                            const x = (i + 0.15 + h1 * 0.7) * p, y = (j + 0.15 + h2 * 0.7) * p, rr = 0.45 + h3 * 0.5;
                            g.fillStyle = `rgba(0,0,0,${0.22 + h1 * 0.3})`;
                            disc(g, x, y, rr);
                            g.fillStyle = `rgba(255,255,255,${0.16 + h2 * 0.26})`;
                            disc(g, x + l2[0] * 0.9, y + l2[1] * 0.9, rr * 0.8);
                        }
                    }
                },
                tint: (x, y, tone, rgb, m) => {
                    // how ripe the peel is here: green holds on at the stalk, in blotches, or
                    // gives way from the nipple up
                    let ripe = 1;
                    if (mode) {
                        const n = S.noise2(x * 0.022, y * 0.022, sd) * 0.6 + S.noise2(x * 0.07, y * 0.07, sd + 1) * 0.3;
                        ripe = mode === 'tip' ? S.smooth(-0.42, 0.4, y / G.a + n * 0.55) : S.smooth(-0.28, 0.3, n * 1.5 + 0.1);
                    } else if (shoulder) {
                        ripe = 1 - shoulder * S.smooth(-G.a * 0.42, -G.a * 1.02, y + 16 * S.noise2(x * 0.05, y * 0.05, sd));
                    }
                    if (ripe < 0.995) {
                        const t = S.clamp(tone);
                        RIPE_FN(t, tmpY);
                        UNRIPE_FN(t, tmpG);
                        // the sheen (how far the paint has gone from its ramp to white) stays on top
                        const ks = S.clamp((rgb[2] - tmpY[2]) / Math.max(1, 210 - tmpY[2]));
                        toward(tmpG, 240, 248, 214, ks);
                        toward(rgb, tmpG[0], tmpG[1], tmpG[2], 1 - ripe);
                    }
                    if (age === 'over') {
                        // going soft: a duller, browner patch
                        const k = S.smooth(0.1, 0.6, S.noise2(x * 0.018 + 3, y * 0.018, sd + 4)) * 0.3;
                        toward(rgb, 150, 100, 30, k);
                    }
                    // light bounced up from the leaves into the shadow side's rim
                    const k = S.smooth(0.26, 0.06, tone) * S.smooth(0.22, 0.02, m) * 0.5;
                    toward(rgb, 92, 104, 34, k);
                    // the nipple's tip keeps a little green
                    const q = S.smooth(20, 2, Math.hypot(x - G.tip[0], y - G.tip[1] + 4)) * (view === 'stalk' ? 0 : 0.6);
                    rgb[0] *= 1 - 0.38 * q;
                    rgb[1] *= 1 - 0.14 * q;
                    rgb[2] *= 1 - 0.5 * q;
                },
                over: (g) => {
                    g.lineCap = 'round';
                    g.lineJoin = 'round';
                    // glands glinting around the sheen
                    for (let i = 0; i < 46; i++) {
                        const a = r() * TAU, d = 16 + r() * 34;
                        g.fillStyle = `rgba(255,252,222,${0.25 + r() * 0.5})`;
                        disc(g, hx * 0.86 + Math.cos(a) * d, hy * 0.86 + Math.sin(a) * d * 1.15, 0.4 + r() * 0.45);
                    }
                    for (const [what, p, ang, len] of marks) {
                        if (what === 'scuff') {
                            // russet: a net of dry tan strokes and a few dark specks
                            for (let i = 0; i < 26; i++) {
                                const a = ang + (r() - 0.5) * 0.9, d = (r() - 0.5) * len, e = (r() - 0.5) * len * 0.5, l = 3 + r() * 9;
                                const x = p[0] + Math.cos(ang) * d - Math.sin(ang) * e, y = p[1] + Math.sin(ang) * d + Math.cos(ang) * e;
                                S.dab(g, [[x - Math.cos(a) * l, y - Math.sin(a) * l], [x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l]], { w: 1.2 + r() * 2.2, color: r() < 0.7 ? '#a98448' : '#d8c088', alpha: 0.3 + r() * 0.3, bristles: 3, seed: 'sc' + v + i, dry: 0.7 });
                            }
                            for (let i = 0; i < 14; i++) {
                                g.fillStyle = `rgba(96,64,24,${0.3 + r() * 0.4})`;
                                disc(g, p[0] + (r() - 0.5) * len, p[1] + (r() - 0.5) * len * 0.6, 0.4 + r() * 0.7);
                            }
                        } else if (what === 'scratch') {
                            // healed: a pale line with a brown lip
                            const c = (r() - 0.5) * 0.5, sc = [];
                            for (let i = 0; i <= 12; i++) {
                                const u = i / 12 - 0.5, a = ang + c * u;
                                sc.push([p[0] + Math.cos(a) * u * len, p[1] + Math.sin(a) * u * len]);
                            }
                            S.ink(g, sc.map(([x, y]) => [x + 0.7, y + 0.8]), { w: 1.5, color: '#7c5a22', alpha: 0.65 });
                            S.ink(g, sc, { w: 1.3, color: '#f2dea0', alpha: 0.85 });
                        } else if (what === 'mould') {
                            // sooty mould under the button: a grey film, specks, drips running down
                            const mx = G.top[0] + (r() - 0.5) * 24, my = G.top[1] + 22;
                            const gr = g.createRadialGradient(mx, my, 0, mx, my, 40);
                            gr.addColorStop(0, 'rgba(40,40,26,0.3)');
                            gr.addColorStop(1, 'rgba(40,40,26,0)');
                            g.fillStyle = gr;
                            g.fillRect(mx - 40, my - 40, 80, 80);
                            for (let i = 0; i < 220; i++) {
                                const a = r() * TAU, d = Math.pow(r(), 1.5) * 42;
                                g.fillStyle = `rgba(30,32,22,${0.12 + r() * 0.3})`;
                                disc(g, mx + Math.cos(a) * d * 1.2, my - 6 + Math.abs(Math.sin(a)) * d, 0.25 + r() * 0.65);
                            }
                            for (let i = 0; i < 4; i++) {
                                const x = mx + (r() - 0.5) * 44, y = my - 4 + r() * 12;
                                S.ink(g, [[x, y], [x + 1, y + 10 + r() * 12], [x + 0.5, y + 20 + r() * 20]], { w: 0.9 + r() * 0.6, color: '#262a1c', alpha: 0.22 });
                            }
                        } else if (what === 'scale') {
                            // red scale: limpets with a pale nipple
                            for (let i = 0; i < 5 + Math.floor(r() * 5); i++) {
                                const x = p[0] + (r() - 0.5) * 22, y = p[1] + (r() - 0.5) * 22, rr = 1.4 + r() * 0.8;
                                g.fillStyle = 'rgba(70,40,10,0.45)';
                                disc(g, x - l2[0] * 0.8, y - l2[1] * 0.8, rr);
                                g.fillStyle = '#8a5630';
                                disc(g, x, y, rr);
                                g.fillStyle = '#d6aa74';
                                disc(g, x + l2[0] * 0.3, y + l2[1] * 0.3, rr * 0.36);
                            }
                        } else if (what === 'scar') {
                            // cork: a rough tan island built of dry dabs, a darker shore, cracks
                            const ca = Math.cos(ang), sa = Math.sin(ang);
                            for (let i = 0; i < 60; i++) {
                                const d = (r() - 0.5) * 30, e = (r() - 0.5) * 13 * (1 - Math.abs(d) / 20), a = ang + (r() - 0.5) * 1.2, l = 1.5 + r() * 4, edge = Math.abs(d) / 15 + Math.abs(e) / 6.5;
                                const x = p[0] + ca * d - sa * e, y = p[1] + sa * d + ca * e;
                                S.dab(g, [[x - Math.cos(a) * l, y - Math.sin(a) * l], [x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l]], { w: 1.6 + r() * 2.6, color: edge > 1 ? '#6e4a1e' : r() < 0.5 ? '#a8824a' : '#c6a468', alpha: 0.45 + r() * 0.4, bristles: 3, seed: 'cork' + v + i, dry: 0.5 });
                            }
                            for (let i = 0; i < 5; i++) {
                                const a = ang + (r() - 0.5) * 1.6, x = p[0] + (r() - 0.5) * 16, y = p[1] + (r() - 0.5) * 6, l = 2 + r() * 4;
                                S.ink(g, [[x - Math.cos(a) * l, y - Math.sin(a) * l], [x + 0.6, y + 0.4], [x + Math.cos(a) * l, y + Math.sin(a) * l]], { w: 0.7, color: '#3a2410', alpha: 0.7 });
                            }
                        } else if (what === 'split') {
                            // split: the peel has opened on the white pith
                            const sc = [];
                            for (let i = 0; i <= 14; i++) {
                                const u = i / 14 - 0.5;
                                sc.push([p[0] + Math.cos(ang) * u * 46 - Math.sin(ang) * Math.sin(u * 9) * 1.6, p[1] + Math.sin(ang) * u * 46 + Math.cos(ang) * Math.sin(u * 9) * 1.6]);
                            }
                            S.ink(g, sc, { w: 5.4, color: '#8a5a14', alpha: 0.5 });
                            S.ink(g, sc, { w: 2.8, color: '#3e280c' });
                            S.ink(g, sc.map(([x, y]) => [x - l2[0] * 1.1, y - l2[1] * 1.1]), { w: 0.9, color: '#f0e0a8', alpha: 0.6 });
                        }
                    }
                    if (view === 'tip') {
                        // where the style fell: a brown point with a ring
                        g.fillStyle = 'rgba(120,96,30,0.5)';
                        disc(g, f[0], f[1], 3.4);
                        g.fillStyle = '#5a3c16';
                        disc(g, f[0], f[1], 1.9);
                        g.fillStyle = 'rgba(255,240,180,0.7)';
                        disc(g, f[0] + l2[0] * 3.6, f[1] + l2[1] * 3.6, 1.1);
                    }
                },
            });
            const g = sp.canvas.getContext('2d');
            g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
            if (view === 'side') button(g, box, res, L, v, G.top);
            else if (view === 'stalk') {
                // the button seen from above: a star in its dimple, the stalk leaving upwards
                const star = [];
                for (let i = 0; i < 10; i++) {
                    const a = (i / 10) * TAU + v, rr = i % 2 ? 7.6 : 12.5 + 2 * S.hashI(i, v, 3, 5);
                    star.push([f[0] + Math.cos(a) * rr, f[1] + Math.sin(a) * rr * 0.86]);
                }
                const stalk = [[f[0] - 4.4, f[1] + 2], [f[0] - 5.6, f[1] - 20], [f[0] + 1.6, f[1] - 21], [f[0] + 4.2, f[1] + 1]];
                const cal = S.form({
                    box, res, seed: 'calyx' + v, light: L, relief: 0.7,
                    mask: (q) => {
                        poly(q, S.curve(star, true, 5));
                        poly(q, stalk);
                    },
                    ramp: TWIG_GREEN, soft: 0.9, mottle: { amp: 0.07, freq: 0.2 }, stroke: { amp: 0.08, freq: 0.2, tone: 3 },
                    over: (q) => {
                        q.lineCap = 'round';
                        for (let i = 0; i < 10; i += 2) {
                            line(q, [[f[0] + (star[i][0] - f[0]) * 0.3, f[1] + (star[i][1] - f[1]) * 0.3], star[i]], 0.8, 'rgba(206,224,140,0.5)');
                            line(q, [[f[0] + (star[i + 1][0] - f[0]) * 0.4, f[1] + (star[i + 1][1] - f[1]) * 0.4], star[i + 1]], 0.9, 'rgba(14,30,10,0.55)');
                        }
                    },
                });
                g.save();
                g.shadowColor = 'rgba(60,40,6,0.6)';
                g.shadowBlur = 3 * res;
                g.shadowOffsetX = 1.5 * res;
                g.shadowOffsetY = 2 * res;
                g.drawImage(cal.canvas, box.x, box.y, box.w, box.h);
                g.restore();
            }
            sp.rot = lk * LSTEP;
            sp.top = view === 'side' ? [G.top[0], G.top[1] - 15] : G.top; // where the stalk joins, unturned
            sp.G = G;
            return sp;
        });
    }

    // The fruit just after petal fall: a dark glossy egg, the withered style on its tip, the
    // calyx as wide as itself. Hangs along +y from (0, 0); `sp.top` is where its stalk ends.
    function fruitlet(v = 0, rot = 0, res = 3) {
        const lk = lkey(rot);
        return memo(`fruitlet${v}/${lk}@${res}`, () => {
            const r = Motion.rng('fruitlet' + v);
            const len = 20 + r() * 16, wid = len * (0.3 + r() * 0.07), lean = (r() - 0.5) * 0.2;
            const right = [], left = [];
            for (let i = 0; i <= 30; i++) {
                const u = i / 30, w = wid * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.86)), 0.56) * (1 - 0.16 * u * u);
                right.push([w + lean * u * len, u * len]);
                left.push([-w + lean * u * len, u * len]);
            }
            const pts = [...right, ...left.reverse()], tip = [lean * len, len];
            const box = S.bbox([...pts, [0, -12], [tip[0] + 6, tip[1] + 12], [tip[0] - 6, tip[1] + 12]], 8);
            const L = S.lightFor(lk * LSTEP), l2 = light2(lk);
            const sp = S.form({
                box, res, seed: 'fruitlet' + v, light: L,
                mask: (g) => poly(g, pts),
                height: (x, y) => 0.25 * S.noise2(x * 0.3, y * 0.3, 4),
                ramp: FRUITLET, soft: 0.9,
                edge: { rough: 0.8, freq: 0.4, amp: 0.6 },
                stroke: { amp: 0.07, freq: 0.1, tone: 6 },
                spec: { amp: 0.75, power: 18, from: 0.5, to: 0.92, ragged: 0.4, color: '#eaf6d0' },
                over: (g) => {
                    for (let i = 0; i < 40; i++) {
                        g.fillStyle = `rgba(190,220,130,${0.05 + r() * 0.1})`;
                        disc(g, (r() - 0.5) * wid * 2, r() * len, 0.25 + r() * 0.25);
                    }
                },
            });
            const g = sp.canvas.getContext('2d');
            g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
            // the style: a dry thread, kinked, with what is left of the stigma
            const c = (r() - 0.5) * 7, st = [tip, [tip[0] + c * 0.4, tip[1] + 3], [tip[0] + c, tip[1] + 6 + r() * 2], [tip[0] + c * 0.6, tip[1] + 9 + r() * 2]];
            g.lineCap = 'round';
            line(g, S.curve(st, false, 5), 1.1, '#3a2814');
            line(g, S.curve(st, false, 5).map(([x, y]) => [x + l2[0] * 0.35, y + l2[1] * 0.35]), 0.5, '#a88454');
            g.fillStyle = '#4a3418';
            disc(g, st[3][0], st[3][1], 1.2);
            button(g, box, res, L, v + 3, [0, 1.5], Math.max(0.42, wid / 17));
            sp.rot = lk * LSTEP;
            sp.top = [0, 1.5 - 15 * Math.max(0.42, wid / 17)];
            sp.len = len;
            return sp;
        });
    }

    // ------------------------------------------------------------------ leaf
    // The midrib runs along +x from the joint at (0, 0); the petiole is behind it.
    const RAMPS = {
        sun: [[0, '#143a1e'], [0.2, '#225a25'], [0.38, '#337a2b'], [0.54, '#4f9a34'], [0.7, '#74b842'], [0.86, '#a6d460'], [1, '#d8ee96']],
        mid: [[0, '#0f2a1c'], [0.2, '#1b4526'], [0.38, '#28632d'], [0.54, '#3b8036'], [0.7, '#57a044'], [0.86, '#82c05c'], [1, '#b4dd86']],
        under: [[0, '#27402a'], [0.25, '#43633c'], [0.5, '#6b8f56'], [0.75, '#98b876'], [1, '#c8dea2']],
        young: [[0, '#365614'], [0.25, '#5a8620'], [0.5, '#88b232'], [0.7, '#b0d24a'], [0.86, '#d1e872'], [1, '#eef6aa']],
        bronze: [[0, '#32160f'], [0.22, '#57271a'], [0.42, '#844226'], [0.6, '#ad653a'], [0.78, '#cf965a'], [1, '#f0d09a']],
        old: [[0, '#463e10'], [0.25, '#786a16'], [0.5, '#b09a24'], [0.7, '#d6c03e'], [0.86, '#ecdb6a'], [1, '#f8f0a8']],
        back: [[0, '#1f4014'], [0.3, '#3d6a1a'], [0.55, '#6c9a22'], [0.75, '#a2c432'], [0.9, '#cde24e'], [1, '#eef386']],
    };
    const SHEEN = { sun: '#eef8dc', mid: '#dcefe0', young: '#f6fbd6', bronze: '#fbe9d2', old: '#f8f4cc' };
    const UNDER_FN = S.rampFn(RAMPS.under, 0.9), MID_FN = S.rampFn(RAMPS.mid, 0.9), YOUNG_FN = S.rampFn(RAMPS.young, 0.9);
    const NT = 240;
    const P135 = new Float32Array(257).map((_, i) => Math.pow(i / 221.7, 1.35)); // av^1.35 for av in 0 … 1.15

    // The drawing of leaf number v: its outline, its veins, what has happened to it.
    const geoms = new Map();
    function leafGeom(v = 0, kind = 'mid') {
        const small = kind === 'young' || kind === 'bronze';
        const key = v + (small ? 's' : 'm');
        if (geoms.has(key)) return geoms.get(key);
        const r = Motion.rng('leaf' + key);
        const L = small ? 100 + r() * 60 : 158 + r() * 90, W = L * (small ? 0.15 + r() * 0.06 : 0.2 + r() * 0.085);
        const p = 0.66 + r() * 0.2, q = 0.7 + r() * 0.22, tp = 0.2 + r() * 0.22, kS = [0.9 + r() * 0.2, 0.9 + r() * 0.2];
        const bend = (r() - 0.5) * 0.34, sway = (r() - 0.5) * 0.07;
        const fold = small ? 0.3 + r() * 0.55 : 0.14 + r() * 0.5, twist = (r() - 0.5) * 1.1;
        const lift = (r() - 0.5) * 0.6, droop = r() * 0.6;
        const waves = 1.5 + r() * 3.5, wavy = r() < 0.62 ? 0.03 + r() * 0.1 : 0.008, ph = [r() * 6.28, r() * 6.28];
        const teeth = Math.round(L / (5 + r() * 2.5)), cren = small ? 0.2 : 0.22 + r() * 0.4;
        const pl = 12 + r() * 9, wing = 1 + r() * 1.7;
        const gloss = r(), quilt = 0.006 + r() * r() * 0.05, veinA = r(), net = r() < 0.3, strokeA = 0.5 + r() * 0.9, grain = [0.7 + r() * 1.4, 0.03 + r() * 0.05];
        const cV = 0.15 + r() * 0.16;
        // the veins: where each leaves the midrib, a side at a time, then tables that say, for
        // the vein line through any point, how far along the gap between two veins it is
        const veins = [0, 1].map(() => {
            const n = 7 + Math.floor(r() * 5), us = [];
            let u = 0.05 + r() * 0.05;
            for (let k = 0; k < n && u < 0.92; k++) {
                us.push(u);
                u += (0.84 / n) * (0.55 + r() * 0.9);
            }
            return us;
        });
        const tabs = veins.map((us) => {
            const g0 = us[1] - us[0], gn = us[us.length - 1] - us[us.length - 2];
            const ext = [us[0] - 3 * g0, us[0] - 2 * g0, us[0] - g0, ...us, us[us.length - 1] + gn, us[us.length - 1] + 2 * gn, us[us.length - 1] + 3 * gn];
            const t = new Float32Array(NT), gap = new Float32Array(NT), puff = new Float32Array(NT), groove = new Float32Array(NT), near = new Float32Array(NT);
            for (let i = 0, k = 0; i < NT; i++) {
                const s = -0.4 + (i / NT) * 1.4;
                while (k < ext.length - 2 && s > ext[k + 1]) k++;
                t[i] = S.clamp((s - ext[k]) / (ext[k + 1] - ext[k]));
                gap[i] = (ext[k + 1] - ext[k]) * L * 0.8;
                // how the blade swells between two veins, the groove a vein runs in, how near a vein is
                const dv = Math.min(t[i], 1 - t[i]) * gap[i];
                puff[i] = Math.pow(Math.sin(Math.PI * t[i]), 0.8);
                groove[i] = Math.exp(-(dv * dv) / 1.4);
                near[i] = Math.exp(-dv / 2.6);
            }
            return { t, gap, puff, groove, near };
        });
        const shape = (u) => (u <= 0 || u >= 1 ? 0 : W * Math.pow(Math.sin(Math.PI * Math.pow(u, p)), q) * (1 - tp * u * u));
        const B = (x) => bend * L * 4 * (x / L) * (1 - x / L) + sway * L * Math.sin((x / L) * 6.28);
        const wAt = (u, sd) => Math.max(2 * S.smooth(0.2, 0, u), shape(u) * kS[sd]);
        const n = Math.ceil(L / 1.6), up = [], dn = [];
        for (let i = 0; i <= n; i++) {
            const u = i / n, x = u * L, env = S.smooth(0.02, 0.14, u) * S.smooth(1, 0.82, u);
            const tooth = cren * env * Math.pow(Math.abs(Math.sin(Math.PI * teeth * u)), 0.7);
            up.push([x, B(x) - wAt(u, 0) * (1 + wavy * 0.5 * Math.sin(u * waves * 6.28 + ph[0])) - tooth]);
            dn.push([x, B(x) + wAt(u, 1) * (1 + wavy * 0.5 * Math.sin(u * waves * 6.28 + ph[1])) + tooth]);
        }
        // the petiole: a narrow wing that widens towards the joint
        const pu = [], pd = [];
        for (let i = 0; i <= 8; i++) {
            const k = i / 8, x = -pl + k * pl, w = 1.7 + wing * Math.pow(Math.sin(Math.PI * Math.pow(k, 1.7)), 0.8);
            pu.push([x, B(x) - w]);
            pd.push([x, B(x) + w]);
        }
        const pts = [...pu, ...up, ...dn.reverse(), ...pd.reverse()];
        dn.reverse();
        const at = (u, av, sd) => {
            const x = u * L;
            return [x, B(x) + (sd ? 1 : -1) * av * wAt(u, sd)];
        };
        // a point on vein k of side sd, av of the way to the margin
        const onVein = (sd, uk, av) => at(Math.min(0.985, uk + cV * Math.pow(av, 1.35) * (1 - uk * 0.55)), av, sd);
        // what happened to it
        const cuts = [], rims = [];
        const clean = r() < 0.3;
        if (!clean && r() < 0.24) {
            // a bite: two or three arcs out of the margin
            const sd = r() < 0.5 ? 0 : 1, u0 = 0.22 + r() * 0.6, m = 1 + Math.floor(r() * 2.4);
            for (let i = 0; i < m; i++) {
                const u = u0 + i * (0.035 + r() * 0.03), c = at(u, 1.02 + r() * 0.16, sd), rad = 6 + r() * 9;
                cuts.push(S.ellipse(c[0], c[1], rad, rad * (0.7 + r() * 0.3), 18, r() * 3).map(([x, y], j) => [x + (S.hashI(j, v, i, 5) - 0.5) * 1.6, y + (S.hashI(j, v, i, 6) - 0.5) * 1.6]));
            }
        }
        if (!clean && r() < 0.13) {
            for (let i = 0, m = 1 + Math.floor(r() * 2.2); i < m; i++) {
                const c = at(0.2 + r() * 0.6, 0.25 + r() * 0.5, r() < 0.5 ? 0 : 1), rad = 2.4 + r() * 4;
                cuts.push(S.ellipse(c[0], c[1], rad, rad * (0.6 + r() * 0.4), 12, r() * 3).map(([x, y], j) => [x + (S.hashI(j, v, i, 7) - 0.5) * 1.2, y + (S.hashI(j, v, i, 8) - 0.5) * 1.2]));
            }
        }
        const bl = {
            miner: !clean && r() < (small ? 0.24 : 0.1) ? [r() < 0.5 ? 0 : 1, 0.16 + r() * 0.3, r() * 6.28, 0.3 + r() * 0.3] : null,
            dry: !clean && r() < 0.13 ? 0.07 + r() * 0.1 : 0,
            spots: !clean && r() < 0.24 ? 2 + Math.floor(r() * 8) : 0,
            mould: !clean && r() < 0.07,
            scale: !clean && r() < 0.06,
            yellow: !clean && r() < 0.14 ? 1 + Math.floor(r() * 2) : 0,
            curl: r() < (small ? 0.26 : 0.09) ? 0.76 + r() * 0.12 : 0,
        };
        const G = { v, L, W, bend, fold, twist, lift, droop, waves, wavy, ph, gloss, quilt, veinA, net, strokeA, grain, cV, veins, tabs, shape, B, wAt, at, onVein, pts, up, dn, pl, cuts, rims, bl, kS };
        geoms.set(key, G);
        return G;
    }

    // kind: 'sun' | 'mid' | 'deep' | 'under' | 'young' | 'bronze' | 'old' | 'back'
    function leaf(v = 0, rot = 0, res = 2, kind = 'mid') {
        if (kind === 'deep') return graded(leaf(v, rot, res, 'mid'), '#5d9884', '#0c3a34', 0.1);
        const lk = lkey(rot);
        return memo(`leaf${v}/${lk}@${res}${kind}`, () => {
            const G = leafGeom(v, kind), { L, B, wAt, tabs, bl } = G;
            const box = S.bbox(G.pts, 5);
            const back = kind === 'back', under = kind === 'under';
            const r = Motion.rng('leaf-paint' + v + kind);
            const sd = S.seedOf('leaf' + v + kind);
            const l2 = light2(lk);
            const th = G.grain[0], ct = Math.cos(th), sn = Math.sin(th);
            const glossy = under || back ? 0 : G.gloss * (kind === 'sun' ? 1 : kind === 'old' ? 0.4 : 0.85);
            const tmp = [0, 0, 0];
            const rib = under ? -1.3 : 1.6; // the midrib is a groove above and a ridge below
            // per column of pixels: the midrib's height, the blade's half-widths, the margin's wave
            const cw = Math.ceil(box.w * res) + 2, cB = new Float32Array(cw), cW = [new Float32Array(cw), new Float32Array(cw)], cS = [new Float32Array(cw), new Float32Array(cw)];
            for (let i = 0; i < cw; i++) {
                const x = box.x + i / res, u = Math.min(1, x / L);
                cB[i] = B(x);
                for (const sd2 of [0, 1]) {
                    cW[sd2][i] = Math.max(1, wAt(u, sd2));
                    cS[sd2][i] = Math.sin(u * G.waves * 6.28 + G.ph[sd2]);
                }
            }
            // one look at a point, shared by the height, the brush and the colour: where it is
            // across the blade (yb, av, sd2), along it (u), and on which vein line (vs, vi)
            let qx = NaN, qy = NaN, yb = 0, u = 0, sd2 = 0, w = 1, av = 0, vi = 0, vs = 0, wave = 0;
            const look = (x, y) => {
                if (x === qx && y === qy) return;
                qx = x;
                qy = y;
                const c = Math.max(0, Math.min(cw - 1, Math.round((x - box.x) * res)));
                yb = y - cB[c];
                u = x > L ? 1 : x / L;
                sd2 = yb < 0 ? 0 : 1;
                w = cW[sd2][c];
                wave = cS[sd2][c];
                av = Math.abs(yb) / w;
                if (av > 1.15) av = 1.15;
                const A = G.cV * P135[(av * 221.7) | 0]; // the same curve `onVein` draws, solved for where the vein starts
                vs = (u - A) / (1 - 0.55 * A);
                vi = (((vs + 0.4) / 1.4) * NT) | 0;
                if (vi < 0) vi = 0;
                else if (vi >= NT) vi = NT - 1;
            };
            const fq = [0, 0, 0];
            const sp = S.form({
                box, res, seed: 'leaf' + v, light: back ? [-0.2, -0.24, 1] : S.lightFor(lk * LSTEP), inflate: 'none',
                mask: (g) => {
                    poly(g, G.pts);
                    g.globalCompositeOperation = 'destination-out';
                    for (const c of G.cuts) poly(g, c);
                    g.globalCompositeOperation = 'source-over';
                },
                height: (x, y) => {
                    look(x, y);
                    if (x <= 0) return -0.12 * yb * yb; // the petiole, round
                    const side = sd2 ? 1 : -1, T = tabs[sd2], a4 = av * av * av * av, du = u > 0.55 ? u - 0.55 : 0;
                    let h = G.fold * (1 + G.twist * side) * Math.abs(yb); // the trough
                    h += G.lift * (x - L / 2) * 0.35 - G.droop * du * du * L * 0.9; // a lifted or a drooping tip
                    h += G.wavy * w * 1.6 * av * av * wave; // the margin's waves
                    // the blade quilts between the veins, each vein in its groove
                    h += G.quilt * T.gap[vi] * T.puff[vi] * Math.min(1, av * 4) * (1 - a4 * 0.8) * (under ? -0.5 : 1);
                    h -= (under ? -0.45 : 0.3) * T.groove[vi] * Math.min(1, av * 5);
                    h += w * 0.1 * a4 * (side < 0 ? 1 : -0.6); // the margin turns
                    if (yb > -9 && yb < 9) h -= rib * Math.exp(-(yb * yb) / 5.8) * (1 - u * 0.6); // the midrib
                    return back ? h * 0.25 : h;
                },
                ramp: RAMPS[kind], soft: 0.86,
                edge: { rough: 1.7, freq: 0.24, amp: 0.85 },
                mottle: { amp: back ? 0.05 : 0.07, freq: 0.018 },
                stroke: {
                    amp: back ? 0.02 : 0.014 + 0.014 * G.strokeA,
                    // the brush follows the veins, out and forward from the midrib: streaks
                    // that run along the same curves the veins do, and change along them
                    field: (x, y) => {
                        look(x, y);
                        if (x <= 0) {
                            fq[0] = x * 0.05;
                            fq[1] = yb * 0.4;
                            fq[2] = 9;
                        } else {
                            fq[0] = vs * L * G.grain[1];
                            fq[1] = av * G.grain[0];
                            fq[2] = sd2 ? 3.7 : 0.2;
                        }
                        return fq;
                    },
                },
                markAmp: back ? 1 : 0.5,
                marks: (g) => {
                    g.lineCap = 'round';
                    const dabAlong = (pts, w, light, a, i) => S.dab(g, pts, { w, color: light ? '#ffffff' : '#000000', alpha: a, bristles: 4 + Math.floor(w / 2), seed: 'ld' + v + kind + i, dry: 0.5, taper: 0.7 });
                    if (back) {
                        // light through the blade: thinner towards the margin, the veins and the
                        // midrib dark, and the shadow of whatever lies on its far side
                        g.fillStyle = 'rgba(0,0,0,0.2)';
                        g.fillRect(box.x, box.y, box.w, box.h);
                        for (const sd2 of [0, 1]) {
                            G.veins[sd2].forEach((uk, k) => {
                                const pts = [];
                                for (let j = 0; j <= 12; j++) pts.push(G.onVein(sd2, uk, (j / 12) * 0.95));
                                line(g, pts.slice(0, 7), 1.5, 'rgba(0,0,0,0.5)');
                                line(g, pts.slice(6), 0.9, 'rgba(0,0,0,0.4)');
                                // the net between two veins
                                const un = G.veins[sd2][k + 1];
                                if (un) for (let j = 0; j < 3; j++) {
                                    const a0 = 0.15 + r() * 0.7;
                                    line(g, S.curve([G.onVein(sd2, uk, a0), G.onVein(sd2, uk + (un - uk) * 0.4, a0 + (r() - 0.5) * 0.1), G.onVein(sd2, uk + (un - uk) * 0.7, a0 + (r() - 0.5) * 0.1), G.onVein(sd2, un, a0 + (r() - 0.5) * 0.16)], false, 4), 0.5, 'rgba(0,0,0,0.2)');
                                }
                            });
                        }
                        const a = r() * 6.28, c = G.at(0.3 + r() * 0.4, 0.2, r() < 0.5 ? 0 : 1), ll = L * (0.5 + r() * 0.3);
                        g.fillStyle = 'rgba(0,0,0,0.42)';
                        g.save();
                        g.filter = 'blur(1.2px)';
                        g.beginPath();
                        g.ellipse(c[0] + Math.cos(a) * ll * 0.5, c[1] + Math.sin(a) * ll * 0.5, ll * 0.56, ll * 0.2, a, 0, TAU);
                        g.fill();
                        g.restore();
                        for (let i = 0; i < 10; i++) {
                            const sd2 = i % 2, u0 = 0.1 + r() * 0.7, av = 0.2 + r() * 0.7, pts = [];
                            for (let j = 0; j <= 6; j++) pts.push(G.at(u0 + j * 0.03, av, sd2));
                            dabAlong(pts, 3 + r() * 5, r() < 0.5, 0.08 + r() * 0.1, i);
                        }
                        return;
                    }
                    // the paint mixed lighter here and darker there; strokes laid between the
                    // veins, out from the midrib; darker ones along the veins; a long one or
                    // two down the blade. All laid wet: their edges are soft
                    softly(g, 0.45 + r() * 0.4, (q0) => {
                        const dabOn = (pts, w, light, a, i) => S.dab(q0, pts, { w, color: light ? '#ffffff' : '#000000', alpha: a, bristles: 3 + Math.floor(w / 2.5), seed: 'ld' + v + kind + i, dry: 0.4, taper: 0.8 });
                        for (let j = 0; j < 5; j++) {
                            const p = G.at(0.12 + r() * 0.76, r() * 0.75, j % 2), rad = 16 + r() * 34, gr = q0.createRadialGradient(p[0], p[1], 0, p[0], p[1], rad), c = r() < 0.5 ? '255,255,255' : '0,0,0', a = 0.1 + r() * 0.16;
                            gr.addColorStop(0, `rgba(${c},${a})`);
                            gr.addColorStop(1, `rgba(${c},0)`);
                            q0.fillStyle = gr;
                            q0.fillRect(p[0] - rad, p[1] - rad, rad * 2, rad * 2);
                        }
                        let i = 0;
                        for (const sd2 of [0, 1]) {
                            const us = G.veins[sd2];
                            for (let k = 0; k < us.length - 1; k++) {
                                for (let j = 0, m = Math.floor(r() * 3.6 * G.strokeA); j < m; j++) {
                                    const uk = us[k] + (us[k + 1] - us[k]) * (0.15 + r() * 0.7), a0 = r() * 0.35, a1 = a0 + 0.4 + r() * 0.5, pts = [];
                                    for (let q = 0; q <= 8; q++) pts.push(G.onVein(sd2, uk, Math.min(1, a0 + ((a1 - a0) * q) / 8)));
                                    dabOn(pts, 1.4 + r() * r() * 6, r() < 0.6, 0.16 + r() * 0.3, i++);
                                }
                                if (r() < 0.35) {
                                    const pts = [];
                                    for (let q = 0; q <= 8; q++) pts.push(G.onVein(sd2, us[k] + 0.008, 0.04 + (q / 8) * (0.4 + r() * 0.5)));
                                    dabOn(pts, 1.8 + r() * 2.2, false, 0.16 + r() * 0.2, i++);
                                }
                            }
                            for (let j = 0, m = Math.floor(r() * 2.4); j < m; j++) {
                                const av = 0.1 + r() * 0.5, u0 = 0.06 + r() * 0.4, u1 = u0 + 0.25 + r() * 0.4, pts = [];
                                for (let q = 0; q <= 10; q++) pts.push(G.at(Math.min(0.97, u0 + ((u1 - u0) * q) / 10), av * (1 - 0.3 * (q / 10)), sd2));
                                dabOn(pts, 3 + r() * 6, r() < 0.6, 0.12 + r() * 0.2, i++);
                            }
                        }
                    });
                    // then the hairs of a small dry brush, sharp: short strokes along the veins
                    for (const sd2 of [0, 1]) {
                        const us = G.veins[sd2];
                        for (let j = 0, m = Math.round(L * (0.3 + 0.3 * G.strokeA)); j < m; j++) {
                            const k = Math.floor(r() * (us.length - 1)), uk = us[k] + (us[k + 1] - us[k]) * r(), a0 = 0.04 + r() * 0.8, a1 = Math.min(0.97, a0 + 0.08 + r() * 0.22);
                            line(g, [G.onVein(sd2, uk, a0), G.onVein(sd2, uk, (a0 + a1) / 2), G.onVein(sd2, uk, a1)], 0.45 + r() * 0.5, r() < 0.55 ? `rgba(255,255,255,${0.1 + r() * 0.2})` : `rgba(0,0,0,${0.08 + r() * 0.16})`);
                        }
                    }
                },
                // the sky mirrored in the leaf: a band on glossy leaves, a hint on the others
                spec: SHEEN[kind] && glossy > 0.12 ? { amp: 0.22 + 0.6 * glossy, power: 7 + 16 * (1 - glossy), from: 0.62 - 0.12 * glossy, to: 0.92, ragged: 0.9, color: SHEEN[kind] } : null,
                tint: (x, y, tone, rgb, m) => {
                    look(x, y);
                    if (x <= 0) {
                        // the petiole and its wing: paler, yellower
                        toward(rgb, 150, 178, 78, back ? 0 : 0.34);
                        return;
                    }
                    if (kind === 'old') {
                        // yellowing between veins that stay green
                        const gk = S.clamp(Math.max(tabs[sd2].near[vi], Math.exp(-Math.abs(yb) / 5)) * (0.8 - 0.5 * S.smooth(0.3, 0.95, u)) + 0.3 * S.noise2(x * 0.03, y * 0.05, sd + 6));
                        MID_FN(S.clamp(tone + 0.08), tmp);
                        toward(rgb, tmp[0], tmp[1], tmp[2], gk);
                    } else if (kind === 'bronze') {
                        // red at the tip and the margins, already green by the midrib
                        const gk = S.smooth(0.75, 0.05, u + av * 0.35 + 0.2 * S.noise2(x * 0.03, y * 0.05, sd)) * 0.75;
                        YOUNG_FN(S.clamp(tone * 0.9), tmp);
                        toward(rgb, tmp[0], tmp[1], tmp[2], gk);
                    } else if (kind === 'young') {
                        // thin: the light comes through towards the margin
                        toward(rgb, 226, 236, 120, S.smooth(0.4, 1, av) * 0.22);
                    } else if (!back) {
                        // a warm and a cool passage in every leaf
                        const n = S.noise2(x * 0.016 + 5, y * 0.03, sd + 2);
                        rgb[0] += n * 16;
                        rgb[2] -= n * 12;
                    }
                    if (bl.curl) {
                        // the tip curled over: the underside shows, and shades the blade
                        const b0 = bl.curl + 0.1 * (yb / w) * (sd2 ? 1 : -0.6);
                        const k = S.smooth(b0, b0 + 0.012, u), e = S.smooth(b0 - 0.05, b0, u) * (1 - k);
                        if (k > 0) {
                            UNDER_FN(S.clamp(0.42 + 0.3 * S.noise2(x * 0.05, y * 0.09, sd + 8) + (tone - 0.5) * 0.3), tmp);
                            toward(rgb, tmp[0], tmp[1], tmp[2], k);
                        }
                        if (e > 0) {
                            rgb[0] *= 1 - 0.62 * e;
                            rgb[1] *= 1 - 0.5 * e;
                            rgb[2] *= 1 - 0.42 * e;
                        }
                    }
                    if (bl.dry) {
                        // a dry tip: brown paper behind a dark line, a yellow halo before it
                        const b0 = 1 - bl.dry + 0.035 * S.noise2(y * 0.16, 1.5, sd) - 0.05 * av;
                        const k = S.smooth(b0, b0 + 0.012, u);
                        toward(rgb, 200, 190, 70, S.smooth(b0 - 0.08, b0, u) * (1 - k) * 0.55);
                        toward(rgb, 60, 36, 14, S.smooth(b0 - 0.006, b0, u) * (1 - k) * 0.6);
                        const pap = 0.78 + 0.5 * S.clamp(tone) + 0.1 * S.noise2(x * 0.4, y * 0.4, sd);
                        toward(rgb, 156 * pap, 112 * pap, 62 * pap, k * 0.92);
                    }
                    // darker at the stalk, and where the blade turns away at its edge
                    const k = S.smooth(0.3, 0, u) * (back ? 0.2 : 0.38) + S.smooth(0.045, 0, m) * S.smooth(0.55, 0.25, tone) * 0.3;
                    rgb[0] *= 1 - k;
                    rgb[1] *= 1 - k * 0.85;
                    rgb[2] *= 1 - k * 0.8;
                },
                over: (g) => {
                    g.lineCap = 'round';
                    g.lineJoin = 'round';
                    // the veins: quiet hairlines that run forward and loop near the margin
                    if (!back) {
                        const va = (under ? 0.34 : kind === 'old' ? 0.12 : 0.07 + 0.2 * G.veinA) * (G.veinA < 0.2 && !under ? 0 : 1);
                        const vc = under ? '214,230,188' : kind === 'bronze' ? '250,214,160' : kind === 'old' ? '120,150,60' : kind === 'young' ? '236,246,170' : '200,228,150';
                        if (va > 0) for (const sd2 of [0, 1]) {
                            const us = G.veins[sd2];
                            us.forEach((uk, k) => {
                                const pts = [];
                                for (let j = 0; j <= 10; j++) pts.push(G.onVein(sd2, uk, (j / 10) * 0.9));
                                const un = us[k + 1];
                                if (un) pts.push(G.onVein(sd2, uk + (un - uk) * 0.35, 0.93), G.onVein(sd2, uk + (un - uk) * 0.7, 0.9));
                                line(g, pts.slice(0, 6), 1.15, `rgba(${vc},${va})`);
                                line(g, pts.slice(5), 0.75, `rgba(${vc},${va * 0.85})`);
                                if ((G.net || under) && un) for (let j = 0; j < 3; j++) {
                                    const a0 = 0.2 + r() * 0.65;
                                    line(g, S.curve([G.onVein(sd2, uk, a0), G.onVein(sd2, uk + (un - uk) * 0.35, a0 + (r() - 0.5) * 0.1), G.onVein(sd2, uk + (un - uk) * 0.7, a0 + (r() - 0.5) * 0.1), G.onVein(sd2, un, a0 + (r() - 0.5) * 0.14)], false, 4), 0.45, `rgba(${vc},${va * 0.45})`);
                                }
                            });
                        }
                    }
                    // the midrib: light, tapering to the tip, with its own shade under it
                    const ribC = back ? '#2c5216' : under ? '#c6dba0' : kind === 'sun' ? '#d2e89c' : kind === 'young' ? '#eef6b4' : kind === 'bronze' ? '#f4cf98' : kind === 'old' ? '#9cbc5a' : '#b9d98b';
                    const w0 = (under ? 3.2 : back ? 3 : 2.6) * (0.85 + 0.3 * G.veinA);
                    for (const [col, ww, off] of [[back ? 'rgba(20,48,12,0.35)' : 'rgba(14,40,24,0.5)', w0 + 0.9, 1.2], [ribC, w0, 0]]) {
                        const a1 = [], a2 = [];
                        for (let i = 0; i <= 44; i++) {
                            const u = i / 44, x = -G.pl + u * (L * 0.985 + G.pl), w = ww * (1 - u * 0.86) * 0.5;
                            a1.push([x - l2[0] * off, B(x) - l2[1] * off - w]);
                            a2.push([x - l2[0] * off, B(x) - l2[1] * off + w]);
                        }
                        g.fillStyle = col;
                        poly(g, [...a1, ...a2.reverse()]);
                    }
                    // the joint under the blade
                    line(g, [[0.5, B(0) - 2.4], [0, B(0) + 2.4]], 0.9, 'rgba(18,40,16,0.5)');
                    // the leaf's thickness: a thin light on the margin that faces the lamp
                    if (!back && !under) {
                        const lit = l2[1] < 0 ? G.up : G.dn, a = Math.floor(lit.length * (0.12 + r() * 0.2)), b = Math.floor(lit.length * (0.6 + r() * 0.3));
                        line(g, lit.slice(a, b).map(([x, y]) => [x - l2[0] * 0.8, y - l2[1] * 0.8]), 1, kind === 'bronze' ? 'rgba(255,226,180,0.4)' : 'rgba(232,246,176,0.4)');
                    }
                    if (under) {
                        // gland dots
                        for (let i = 0; i < 130; i++) {
                            const p = G.at(0.05 + r() * 0.9, r() * 0.9, i % 2);
                            g.fillStyle = `rgba(30,58,34,${0.14 + r() * 0.16})`;
                            disc(g, p[0], p[1], 0.35 + r() * 0.35);
                        }
                    }
                    // --- what happened to it
                    for (const c of G.cuts) {
                        // the lip of a bite or a hole: brown, with a yellow halo
                        g.lineWidth = 6;
                        g.strokeStyle = back ? 'rgba(226,210,90,0.35)' : 'rgba(206,196,86,0.3)';
                        g.beginPath();
                        S.trace(g, c);
                        g.stroke();
                        g.lineWidth = 2.6;
                        g.strokeStyle = 'rgba(96,62,22,0.8)';
                        g.stroke();
                    }
                    if (bl.yellow) for (let i = 0; i < bl.yellow; i++) {
                        const p = G.at(0.2 + r() * 0.6, 0.15 + r() * 0.6, i % 2), rad = 12 + r() * 20;
                        const gr = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], rad);
                        gr.addColorStop(0, 'rgba(222,212,84,0.55)');
                        gr.addColorStop(0.6, 'rgba(214,206,80,0.3)');
                        gr.addColorStop(1, 'rgba(214,206,80,0)');
                        g.fillStyle = gr;
                        g.fillRect(p[0] - rad, p[1] - rad, rad * 2, rad * 2);
                    }
                    if (bl.spots) for (let i = 0; i < bl.spots; i++) {
                        const p = G.at(0.1 + r() * 0.8, 0.1 + r() * 0.8, r() < 0.5 ? 0 : 1), rad = 0.45 + r() * r() * 1.5;
                        g.fillStyle = 'rgba(206,198,90,0.22)';
                        oval(g, p[0], p[1], rad * 2.6, rad * 2, r() * 3);
                        g.fillStyle = `rgba(88,56,24,${0.45 + r() * 0.4})`;
                        oval(g, p[0], p[1], rad, rad * (0.6 + r() * 0.4), r() * 3);
                    }
                    if (bl.miner) {
                        // a leaf miner's gallery: a silvery ribbon that wanders, the dark
                        // thread of its frass down the middle, the chamber at its end
                        const [sd2, u0, ph, a0] = bl.miner, tr = [];
                        for (let i = 0; i <= 70; i++) {
                            const t = i / 70;
                            tr.push(G.at(u0 + t * 0.34 + 0.012 * Math.sin(t * 17 + ph), S.clamp(a0 + 0.2 * Math.sin(t * 9.5 + ph * 2) * (0.5 + 0.5 * t) + 0.07 * Math.sin(t * 24 + ph) + 0.02 * Math.sin(t * 55), 0.1, 0.86), sd2));
                        }
                        const silver = back ? '244,246,200' : '206,222,208';
                        line(g, tr, 2.6, 'rgba(26,52,30,0.28)');
                        line(g, tr.slice(0, 36), 1.5, `rgba(${silver},0.6)`);
                        line(g, tr.slice(35), 2, `rgba(${silver},0.72)`);
                        line(g, tr.map(([x, y], i) => [x + 0.3 * Math.sin(i * 0.9), y + 0.3 * Math.cos(i * 0.7)]), 0.45, 'rgba(52,44,24,0.6)');
                        g.fillStyle = `rgba(${silver},0.72)`;
                        oval(g, tr[70][0], tr[70][1], 3, 1.9, r() * 3);
                    }
                    if (bl.scale) for (let i = 0, x0 = L * (0.1 + r() * 0.3); i < 9; i++) {
                        // scale insects huddled along the midrib
                        const x = x0 + (r() - 0.3) * L * 0.16, y = B(x) + (r() - 0.5) * 5, rr = 0.8 + r() * 0.7;
                        g.fillStyle = 'rgba(10,30,14,0.45)';
                        disc(g, x - l2[0] * 0.6, y - l2[1] * 0.6, rr);
                        g.fillStyle = r() < 0.5 ? '#7a6248' : '#8e6a44';
                        disc(g, x, y, rr);
                        g.fillStyle = '#cdb492';
                        disc(g, x + l2[0] * 0.25, y + l2[1] * 0.25, rr * 0.35);
                    }
                    if (bl.mould) {
                        const p = G.at(0.3 + r() * 0.4, 0.4, r() < 0.5 ? 0 : 1);
                        const gr = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], 34);
                        gr.addColorStop(0, 'rgba(26,30,22,0.3)');
                        gr.addColorStop(1, 'rgba(26,30,22,0)');
                        g.fillStyle = gr;
                        g.fillRect(p[0] - 34, p[1] - 34, 68, 68);
                        for (let i = 0; i < 160; i++) {
                            const a = r() * TAU, d = Math.pow(r(), 1.4) * 30;
                            g.fillStyle = `rgba(22,26,20,${0.12 + r() * 0.28})`;
                            disc(g, p[0] + Math.cos(a) * d * 1.5, p[1] + Math.sin(a) * d * 0.7, 0.25 + r() * 0.6);
                        }
                    }
                },
            });
            sp.rot = lk * LSTEP;
            sp.len = L;
            sp.G = G;
            return sp;
        });
    }

    // ------------------------------------------------------------------ blossom
    // White is shaded lighter than expected, towards lilac; the claw of a petal is greenish,
    // its outside flushed purple.
    const WHITE = [[0, '#6c688a'], [0.2, '#9894b2'], [0.4, '#c4c0d2'], [0.6, '#e4e0de'], [0.8, '#f5f1e8'], [1, '#fffcf2']];

    // One thick petal along +x from the flower's centre, baked for the angle `lrot`.
    //   out: how much of its purple outside shows (0 the inside, 1 a bud's petal)
    //   old: a browning edge; cup: how far it curls back
    function petal(key, lrot, res, o = {}) {
        const len = o.len ?? 48, wid = o.wid ?? 13, cup = o.cup ?? 0.6, out = o.out ?? 0, old = o.old ?? 0;
        const lk = lkey(lrot);
        return memo(`petal${key}/${lk}@${res}/${len.toFixed(1)}/${wid.toFixed(1)}/${cup.toFixed(2)}/${out}/${old}`, () => {
            const r = Motion.rng('petal' + key);
            const as = (r() - 0.5) * 0.16, hook = (r() - 0.5) * 0.14 * len, pts = [];
            const n = 40, bow = (u) => hook * u * u;
            // oblong, widest above the middle, the tip blunt with a small point
            const hw = (u) => wid * Math.pow(Math.sin(Math.PI * Math.pow(u, 1.06)), 0.6) * (1 - 0.1 * u * u) + 0.9 * S.smooth(0.9, 0.97, u) * S.smooth(1, 0.97, u);
            for (let i = 0; i <= n; i++) {
                const u = i / n;
                pts.push([4 + u * len, bow(u) - hw(u) * (1 + as)]);
            }
            for (let i = n; i >= 0; i--) {
                const u = i / n;
                pts.push([4 + u * len, bow(u) + hw(u) * (1 - as)]);
            }
            const box = S.bbox(pts, 4), sd = S.seedOf('petal' + key);
            const bruise = r() < 0.3 ? [len * (0.35 + r() * 0.5), (r() - 0.5) * wid, 2 + r() * 3.5] : null;
            return S.form({
                box, res, seed: 'petal' + key, light: S.lightFor(lk * LSTEP), relief: 0.6,
                mask: (g) => poly(g, pts),
                // thick petals curl back at the tip and keep a crease down the middle
                height: (x, y) => {
                    const u = x / len, yb = y - bow(u);
                    return -cup * Math.pow(Math.max(0, u - 0.4), 2) * len * 0.85 - 1.5 * Math.exp(-(yb * yb) / 2.6) * S.smooth(len, len * 0.2, x) + 0.4 * S.noise2(x * 0.16, y * 0.3, sd);
                },
                ramp: WHITE, soft: 0.9,
                edge: { rough: 1.1, freq: 0.3, amp: 0.7 },
                mottle: { amp: 0.05, freq: 0.06 },
                stroke: { amp: 0.1, field: (x, y) => [x * 0.014, y * 0.3, 0.5] },
                markAmp: 0.46,
                marks: (g) => {
                    // the brush goes down the petal, a few times
                    softly(g, 0.3, (q0) => {
                        for (let i = 0; i < 9; i++) {
                            const y0 = (r() - 0.5) * 1.5, u0 = r() * 0.45, u1 = u0 + 0.3 + r() * 0.4, st = [];
                            for (let k = 0; k <= 6; k++) {
                                const u = Math.min(1, u0 + ((u1 - u0) * k) / 6);
                                st.push([4 + u * len, bow(u) + y0 * hw(u)]);
                            }
                            S.dab(q0, st, { w: 1.4 + r() * 3.4, color: r() < 0.5 ? '#ffffff' : '#000000', alpha: 0.22 + r() * 0.36, bristles: 4, seed: 'pd' + key + i, dry: 0.5, taper: 0.8 });
                        }
                    });
                },
                spec: { amp: 0.35, power: 15, from: 0.5, to: 0.95, ragged: 0.6, color: '#fffef6' },
                tint: (x, y, tone, rgb) => {
                    const u = x / len;
                    // green-yellow where the petal leaves the cup
                    toward(rgb, 204, 214, 138, S.smooth(0.36, 0, u) * 0.55);
                    // the purple of its outside: a bud's whole petal, the edge of an open one
                    const n = S.noise2(x * 0.05, y * 0.12, sd + 3);
                    const pk = out * S.smooth(0.1, 0.95, u + n * 0.3) * 0.5 + (1 - out) * S.smooth(0.8, 1.02, u + n * 0.1) * 0.14;
                    toward(rgb, 184, 124, 166, pk);
                    if (old) toward(rgb, 170, 124, 76, old * S.smooth(0.62, 1, u + n * 0.25 + (Math.abs(y) / wid) * 0.25) * 0.8);
                },
                over: (g) => {
                    if (bruise) {
                        const gr = g.createRadialGradient(bruise[0], bruise[1], 0, bruise[0], bruise[1], bruise[2]);
                        gr.addColorStop(0, 'rgba(150,120,84,0.5)');
                        gr.addColorStop(1, 'rgba(170,140,100,0)');
                        g.fillStyle = gr;
                        g.fillRect(bruise[0] - 6, bruise[1] - 6, 12, 12);
                    }
                    if (out > 0.3) {
                        // glands, as on the peel
                        for (let i = 0; i < 46; i++) {
                            g.fillStyle = `rgba(110,120,70,${0.12 + r() * 0.18})`;
                            disc(g, 6 + r() * len * 0.95, (r() - 0.5) * wid * 1.7, 0.3 + r() * 0.3);
                        }
                    }
                },
            });
        });
    }

    // One anther: a yellow grain with a groove, darker on the side away from the lamp.
    function anther(g, x, y, a, l2, k = 1, brown = false) {
        g.fillStyle = brown ? '#6a4212' : '#96600f';
        oval(g, x - l2[0] * 0.55 * k, y - l2[1] * 0.55 * k, 2.05 * k, 1.25 * k, a);
        g.fillStyle = brown ? '#b98a34' : '#f0c232';
        oval(g, x, y, 1.9 * k, 1.1 * k, a);
        g.strokeStyle = brown ? 'rgba(80,50,10,0.6)' : 'rgba(150,100,10,0.65)';
        g.lineWidth = 0.4 * k;
        g.beginPath();
        g.moveTo(x - Math.cos(a) * 1.4 * k, y - Math.sin(a) * 1.4 * k);
        g.lineTo(x + Math.cos(a) * 1.4 * k, y + Math.sin(a) * 1.4 * k);
        g.stroke();
        g.fillStyle = 'rgba(255,246,190,0.85)';
        oval(g, x + l2[0] * 0.5 * k, y + l2[1] * 0.5 * k, 0.75 * k, 0.42 * k, a);
    }
    // The stigma: a sticky green-yellow knob with a glint.
    function stigma(g, x, y, rad, l2) {
        g.fillStyle = '#44601c';
        disc(g, x - l2[0] * 0.5, y - l2[1] * 0.5, rad);
        g.fillStyle = '#a2b23c';
        disc(g, x, y, rad * 0.92);
        g.fillStyle = '#d3d868';
        disc(g, x + l2[0] * rad * 0.3, y + l2[1] * rad * 0.3, rad * 0.55);
        g.fillStyle = 'rgba(255,255,236,0.92)';
        disc(g, x + l2[0] * rad * 0.42, y + l2[1] * rad * 0.42, rad * 0.22);
    }
    // The calyx from the side: a little green cup with blunt teeth, its foot at (x, y),
    // opening towards `ang`; painted as a lit volume straight onto g (a sprite's own canvas).
    function cupOf(g, x, y, ang, w, h, lk, res, key = 0) {
        const c = Math.cos(ang), s = Math.sin(ang), P = (a, b) => [x + a * c - b * s, y + a * s + b * c];
        const pts = S.curve([P(-1.5, -w * 0.2), P(h * 0.3, -w * 0.44), P(h * 0.85, -w * 0.52), P(h * 1.14, -w * 0.4), P(h * 0.8, -w * 0.2), P(h * 1.22, 0), P(h * 0.8, w * 0.2), P(h * 1.14, w * 0.4), P(h * 0.85, w * 0.52), P(h * 0.3, w * 0.44), P(-1.5, w * 0.2)], true, 5);
        const box = S.bbox(pts, 2);
        const sp = S.form({
            box, res, seed: 'cup' + key, light: S.lightFor(lk * LSTEP), relief: 0.9,
            mask: (q) => poly(q, pts),
            ramp: TWIG_GREEN, soft: 0.9, mottle: { amp: 0.07, freq: 0.3 }, stroke: { amp: 0.06, freq: 0.3, tone: 3 },
            over: (q) => {
                q.lineCap = 'round';
                line(q, [P(h * 0.3, w * 0.14), P(h * 0.8, w * 0.2)], 0.55, 'rgba(14,30,10,0.5)');
                line(q, [P(h * 0.3, -w * 0.14), P(h * 0.8, -w * 0.2)], 0.55, 'rgba(14,30,10,0.5)');
                line(q, [P(h * 0.95, w * 0.42), P(h * 1.12, w * 0.38)], 0.6, 'rgba(214,230,150,0.6)');
                line(q, [P(h * 1.05, -w * 0.06), P(h * 1.18, 0)], 0.6, 'rgba(214,230,150,0.6)');
            },
        });
        g.save();
        g.shadowColor = 'rgba(40,44,60,0.5)';
        g.shadowBlur = 1.6 * res;
        g.shadowOffsetX = 0.8 * res;
        g.shadowOffsetY = 1 * res;
        g.drawImage(sp.canvas, box.x, box.y, box.w, box.h);
        g.restore();
    }

    // pose: 'face' (open, seen from the front), 'tilt' (open, three-quarters, its axis
    // leaning up), 'side' (open, in profile), 'half' (a cup opening). The axis of 'side' and
    // 'half' is −y (up) at rot 0 and `sp.base` is the foot of the calyx, where the pedicel ends.
    function flower(v = 0, rot = 0, res = 2, pose = 'face') {
        const lk = lkey(rot);
        return memo(`flower${v}/${pose}/${lk}@${res}`, () => {
            const r = Motion.rng('flower' + v + pose);
            const bake = lk * LSTEP, l2 = light2(lk);
            const box = pose === 'half' ? { x: -40, y: -66, w: 80, h: 86 } : pose === 'side' ? { x: -68, y: -52, w: 136, h: 114 } : { x: -66, y: -70, w: 132, h: 136 };
            const c = canvas(box.w * res, box.h * res), g = c.getContext('2d');
            g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
            g.lineCap = 'round';
            const old = v % 5 === 4 ? 0.9 : 0;
            // a petal and, first, its shadow on the petals under it
            const lay = (key, a, o, at = [0, 0]) => {
                const p = petal(key, bake + a, res, o);
                g.save();
                g.globalCompositeOperation = 'source-atop';
                g.translate(at[0], at[1]);
                g.rotate(a);
                g.shadowColor = 'rgba(64,60,98,0.6)';
                g.shadowBlur = 5 * res;
                g.shadowOffsetX = -l2[0] * 3.2 * res;
                g.shadowOffsetY = -l2[1] * 3.2 * res;
                g.drawImage(p.canvas, p.box.x, p.box.y, p.box.w, p.box.h);
                g.restore();
                S.put(g, p, { x: at[0], y: at[1], rot: a });
            };
            // a soft patch of shade on the paint already there
            const shade = (x, y, rx, ry, col) => {
                g.save();
                g.globalCompositeOperation = 'source-atop';
                const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1);
                gr.addColorStop(0, col);
                gr.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
                g.translate(x, y);
                g.scale(rx, ry);
                g.fillStyle = gr;
                g.fillRect(-1, -1, 2, 2);
                g.restore();
            };
            const pollen = (cx, cy, n, r0, r1, sq = 1) => {
                g.save();
                g.globalCompositeOperation = 'source-atop';
                for (let i = 0; i < n; i++) {
                    const a = r() * TAU, d = r0 + Math.pow(r(), 1.5) * (r1 - r0);
                    g.fillStyle = `rgba(${r() < 0.3 ? '190,140,30' : '238,196,52'},${0.5 + r() * 0.45})`;
                    disc(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d * sq, 0.35 + r() * 0.45);
                }
                g.restore();
            };
            // a filament: white, grey on the side away from the lamp, never quite straight
            const filament = (x0, y0, x1, y1, dim = false) => {
                const mx = (x0 + x1) / 2 + (r() - 0.5) * 1.6, my = (y0 + y1) / 2 + (r() - 0.5) * 1.6, pts = S.curve([[x0, y0], [mx, my], [x1, y1]], false, 4);
                line(g, pts.map(([x, y]) => [x - l2[0] * 0.3, y - l2[1] * 0.3]), 1.6, dim ? '#8e8aa6' : '#a9a6bc');
                line(g, pts, 1.05, dim ? '#d2cedc' : '#f8f5ea');
            };
            if (pose === 'face' || pose === 'tilt') {
                const sq = pose === 'tilt' ? 0.6 : 1, n = v % 7 === 3 ? 4 : 5, a0 = r() * TAU;
                const order = n === 5 ? [0, 2, 4, 1, 3] : [0, 2, 1, 3];
                for (const k of order) {
                    const a = a0 + (k / n) * TAU + (r() - 0.5) * 0.3, len = 43 + r() * 10, wid = 11 + r() * 3;
                    // leaning up, the far petals (pointing up) shorten and the near ones face the eye
                    const vx = Math.cos(a) * len, vy = Math.sin(a) * len * sq * (sq < 1 && Math.sin(a) < 0 ? 0.82 : 1);
                    lay(`${v}-${k}`, Math.atan2(vy, vx), { len: Math.hypot(vx, vy), wid: wid * (sq < 1 ? 0.8 + 0.2 * Math.abs(Math.cos(a)) : 1), cup: 0.45 + r() * 0.9, old: old && r() < 0.7 ? old : 0, out: 0 });
                }
                // the column of stamens, joined below into a tube, and its shadow on the petals
                const m = 22 + Math.floor(r() * 9), top = pose === 'tilt' ? [0, -15] : [0, 0], ra = 8.4 + r() * 2.2;
                shade(-l2[0] * 7 + top[0] * 0.3, -l2[1] * 7 + top[1] * 0.3, 19, 19 * (sq < 1 ? 0.8 : 1), 'rgba(70,66,104,0.5)');
                pollen(top[0] * 0.5, top[1] * 0.5, 30, 12, 36, sq < 1 ? 0.75 : 1);
                g.fillStyle = '#b9bf8a';
                oval(g, 0, 0, 6.6, 6.6 * sq);
                g.fillStyle = '#5a6638';
                oval(g, -l2[0], -l2[1] * sq, 4.6, 4.6 * sq);
                // the anthers crowd about the stigma in bundles, no two at one height
                const st = [];
                for (let i = 0; i < m; i++) {
                    const a = (Math.floor(i / 3) / Math.ceil(m / 3)) * TAU + (r() - 0.5) * 0.7;
                    st.push([a, ra * (pose === 'tilt' ? 0.3 + 0.75 * Math.sqrt(r()) : 0.56 + r() * 0.62), r() < (old ? 0.7 : 0.14)]);
                }
                st.sort((p, q) => Math.sin(p[0]) * p[1] - Math.sin(q[0]) * q[1]);
                const tipOf = ([a, rr]) => [top[0] + Math.cos(a) * rr, top[1] + Math.sin(a) * rr * sq];
                const half = st.findIndex((s) => Math.sin(s[0]) > 0);
                const draw = (list) => {
                    for (const s of list) {
                        const t = tipOf(s);
                        filament(Math.cos(s[0]) * 3.4, Math.sin(s[0]) * 3.4 * sq, t[0], t[1], Math.cos(s[0]) * l2[0] + Math.sin(s[0]) * l2[1] < -0.2);
                    }
                    for (const s of list) {
                        const t = tipOf(s);
                        anther(g, t[0], t[1], s[0] + 1.57 + (r() - 0.5) * 1.6, l2, 0.9 + r() * 0.3, s[2]);
                    }
                };
                draw(st.slice(0, half < 0 ? st.length : half));
                // the pistil stands over them
                if (pose === 'tilt') {
                    line(g, [[0.3, top[1] + 1], [0.6, top[1] - 6]], 2.8, '#3e5a1c');
                    line(g, [[0.3 + l2[0] * 0.5, top[1] + 1], [0.6 + l2[0] * 0.5, top[1] - 6]], 1.3, '#9ab84a');
                    stigma(g, 0.6, top[1] - 8, 3.6, l2);
                }
                if (half >= 0) draw(st.slice(half));
                if (pose === 'face') stigma(g, (r() - 0.5) * 2, (r() - 0.5) * 2, 3.7, l2);
            } else if (pose === 'side') {
                // in profile: the petals curl back and down, the column stands up out of them
                const P = [[Math.PI + 0.22, 0.8, 0.45], [-0.22, 0.8, 0.45], [Math.PI - 0.5, 1, 0.25], [0.5, 1, 0.25]];
                P.forEach(([a, k, o], i) => {
                    if (i === 2) {
                        // the calyx and the tube, before the near petals
                        cupOf(g, 0, 10, -Math.PI / 2, 15, 8.5, lk, res, v);
                        const h = 25 + r() * 4;
                        for (let j = 0; j < 9; j++) {
                            const u = j / 8 - 0.5;
                            filament(u * 8.4, -1, u * 12.5 + (r() - 0.5), -h + Math.abs(u) * 2 + r() * 2, u * l2[0] < -0.1);
                        }
                        line(g, [[0, -h + 2], [1.2, -h - 6]], 2.6, '#3e5a1c');
                        line(g, [[l2[0] * 0.5, -h + 2], [1.2 + l2[0] * 0.5, -h - 6]], 1.2, '#9ab84a');
                        const ring = [];
                        for (let j = 0; j < 16; j++) ring.push([r() * TAU, r(), Math.sqrt(r())]);
                        ring.sort((p, q) => Math.sin(p[0]) * p[2] - Math.sin(q[0]) * q[2]);
                        for (const [t, q, d] of ring) anther(g, Math.cos(t) * 7.4 * d, -h + Math.sin(t) * 2.8 * d + q * 1.6 - 1, t + 1.57 + (q - 0.5) * 2, l2, 1, q < (old ? 0.7 : 0.15));
                        stigma(g, 1.2, -h - 8, 3.7, l2);
                    }
                    lay(`${v}s${i}`, a + (r() - 0.5) * 0.26, { len: (44 + r() * 8) * k, wid: 11.5 + r() * 2.5, cup: 1.1 + r() * 0.6, out: o, old: old && r() < 0.6 ? old : 0 }, [0, -1]);
                });
                // the petal that comes at the eye, short and broad
                lay(`${v}s4`, Math.PI / 2 + (r() - 0.5) * 0.5, { len: 24 + r() * 6, wid: 14, cup: 0.3, out: 0.15 }, [0, -4]);
                pollen(0, -6, 12, 4, 26, 0.8);
            } else {
                // half open: a cup of three petals seen from outside, the anthers over its rim
                for (const [i, a, k] of [[0, -Math.PI / 2 - 0.36, 0.92], [1, -Math.PI / 2 + 0.36, 0.92]]) lay(`${v}h${i}`, a + (r() - 0.5) * 0.1, { len: (44 + r() * 5) * k, wid: 13, cup: -0.5 - r() * 0.3, out: 0.6 }, [0, 2]);
                for (let j = 0; j < 9; j++) {
                    const x = (j / 8 - 0.5) * 19 + (r() - 0.5) * 2, y = -39 - r() * 6 + Math.abs(j - 4) * 1.1;
                    filament(x * 0.7, -30, x, y + 1);
                    anther(g, x, y, r() * 3, l2, 1, r() < 0.1);
                }
                stigma(g, 0.5, -48, 3.4, l2);
                lay(`${v}h2`, -Math.PI / 2 + (r() - 0.5) * 0.14, { len: 41 + r() * 4, wid: 14.5, cup: -0.35, out: 0.75 }, [0, 3]);
                cupOf(g, 0, 5, -Math.PI / 2, 15.5, 8.5, lk, res, v);
            }
            return { canvas: c, box, rot: bake, base: pose === 'side' ? [0, 10] : pose === 'half' ? [0, 5] : [0, 0] };
        });
    }

    // A closed bud along +x from its foot at (0, 0): `long` about to open (35–46 units, its
    // seams showing), or a tight round one (17–22); a waxy egg, some flushed purple, in its
    // green cup.
    function bud(v = 0, rot = 0, res = 2, long = true) {
        const lk = lkey(rot);
        return memo(`bud${v}/${long ? 'l' : 'r'}/${lk}@${res}`, () => {
            const r = Motion.rng('bud' + v + long);
            const len = long ? 29 + r() * 11 : 11 + r() * 5, wid = long ? 8.6 + r() * 2.4 : 6.6 + r() * 1.6, fat = long ? 0.75 + r() * 0.2 : 1;
            const pts = S.ellipse(len * 0.5 + 6, 0, len * 0.5, wid, 44).map(([x, y]) => [x, y * (fat + (1.2 - fat) * S.smooth(6, len, x))]);
            const box = S.bbox([...pts, [-4, -9], [-4, 9]], 4), sd = S.seedOf('bud' + v);
            const flush = [r() < 0.35 ? 0.06 + r() * 0.12 : 0.26 + r() * 0.34, (r() - 0.5) * 2];
            const sp = S.form({
                box, res, seed: 'bud' + v, light: S.lightFor(lk * LSTEP),
                mask: (g) => poly(g, pts),
                // the petals' seams: two shallow furrows that meet at the tip
                height: (x, y) => {
                    const u = (x - 6) / len, s1 = y - wid * 0.42 * Math.sin(Math.PI * Math.min(1, u * 0.97)), s2 = y + wid * 0.2 * Math.sin(Math.PI * Math.min(1, u * 0.97));
                    return long ? -0.5 * Math.exp(-(s1 * s1) / 0.9) - 0.4 * Math.exp(-(s2 * s2) / 0.9) : 0;
                },
                ramp: WHITE, soft: 0.9,
                edge: { rough: 0.8, freq: 0.4, amp: 0.6 },
                stroke: { amp: 0.08, field: (x, y) => [x * 0.02, y * 0.24, 0.5] },
                mottle: { amp: 0.05, freq: 0.1 },
                spec: { amp: 0.4, power: 16, from: 0.5, to: 0.95, ragged: 0.5, color: '#fffef6' },
                tint: (x, y, tone, rgb) => {
                    // the flush: stronger towards the tip and on one flank; green still at the foot
                    const n = S.noise2(x * 0.07, y * 0.16, sd);
                    toward(rgb, 180, 116, 160, S.smooth(len * 0.05, len * 1.05, x + n * 8) * flush[0] * (0.6 + 0.4 * S.clamp((y / wid) * flush[1] + 0.5)));
                    toward(rgb, 176, 200, 118, S.smooth(len * 0.45, 0, x - 6) * 0.55);
                },
                over: (g) => {
                    for (let i = 0; i < (long ? 60 : 24); i++) {
                        g.fillStyle = `rgba(104,116,66,${0.1 + r() * 0.16})`;
                        disc(g, 7 + r() * len, (r() - 0.5) * wid * 1.8, 0.26 + r() * 0.3);
                    }
                },
            });
            const g = sp.canvas.getContext('2d');
            g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
            cupOf(g, -1, 0, 0, long ? 12.5 : 11, long ? 8 : 6.5, lk, res, v);
            sp.rot = lk * LSTEP;
            sp.len = len + 6;
            return sp;
        });
    }

    // What is left when the petals have fallen: the calyx, the ovary swelling in it, the
    // stout style with its stigma going brown, a dried stamen or two, perhaps one brown
    // petal still hanging. Axis −y, foot at (0, 10).
    function spent(v = 0, rot = 0, res = 2) {
        const lk = lkey(rot);
        return memo(`spent${v}/${lk}@${res}`, () => {
            const r = Motion.rng('spent' + v), bake = lk * LSTEP, l2 = light2(lk);
            const box = { x: -30, y: -36, w: 60, h: 60 };
            const c = canvas(box.w * res, box.h * res), g = c.getContext('2d');
            g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
            g.lineCap = 'round';
            if (v % 2 === 0) S.put(g, petal('sp' + v, bake + 2.2, res, { len: 24, wid: 8, cup: 1.4, out: 0.4, old: 1 }), { x: 2, y: 4, rot: 2.2 });
            for (let i = 0; i < 2 + (v % 3); i++) {
                // dried stamens: brown threads that have let go
                const a = -1.57 + (r() - 0.5) * 2.4, l = 10 + r() * 7;
                const th = S.curve([[0, 2], [Math.cos(a) * l * 0.5, Math.sin(a) * l * 0.5 + 3], [Math.cos(a) * l + (r() - 0.5) * 6, Math.sin(a) * l + 6 + r() * 6]], false, 6);
                line(g, th, 0.7, '#8a6a3a');
                g.fillStyle = '#6a4a1c';
                oval(g, th[th.length - 1][0], th[th.length - 1][1], 1.2, 0.7, r() * 3);
            }
            // the ovary in its cup, the style (stout, kinked), the stigma
            const lean = (r() - 0.5) * 7, sty = S.curve([[0, 0], [lean * 0.3, -8], [lean, -15 - r() * 4]], false, 8), top = sty[sty.length - 1];
            line(g, sty, 3.3, '#2c4418');
            line(g, sty.map(([x, y]) => [x + l2[0] * 0.6, y + l2[1] * 0.6]), 1.7, '#86a244');
            g.fillStyle = '#4e3a16';
            disc(g, top[0] - l2[0] * 0.4, top[1] - l2[1] * 0.4, 3.2);
            g.fillStyle = '#9a8236';
            disc(g, top[0], top[1], 2.9);
            g.fillStyle = '#d0c070';
            disc(g, top[0] + l2[0] * 1.1, top[1] + l2[1] * 1.1, 1.2);
            g.fillStyle = '#1c3412';
            oval(g, -l2[0] * 0.6, 3 - l2[1] * 0.6, 4.6, 5);
            g.fillStyle = '#3c6a26';
            oval(g, 0, 3, 4.3, 4.7);
            g.fillStyle = '#7aa844';
            oval(g, l2[0] * 1.3, 3 + l2[1] * 1.3, 2.2, 2.6);
            g.fillStyle = 'rgba(232,246,200,0.8)';
            disc(g, l2[0] * 2, 3 + l2[1] * 2, 0.8);
            cupOf(g, 0, 10, -Math.PI / 2, 14.5, 7.5, lk, res, v);
            return { canvas: c, box, rot: bake, base: [0, 10] };
        });
    }

    // ------------------------------------------------------------------ wood
    // A shoot painted per pixel as a lit tube along `pts` (the caller's units), straight onto
    // `g` (which must not be turned): no sprite, nothing to paste.
    //   w0, w1  its width at the start and at the end; taper: the exponent between
    //   green   [u0, u1]: where along it the grey-brown wood turns to the green of a young
    //           shoot ([0, 0] all green, [2, 3] all wood)
    //   nodes   distances along it where it swells (a leaf, a spur)
    //   thorn   true: a thorn (green, its last third brown and sharp)
    //   raw     the points are already dense; shade: false to skip its cast shadow
    const WOOD_FN = S.rampFn([[0, '#221a14'], [0.22, '#433527'], [0.45, '#6b5840'], [0.65, '#927d5c'], [0.85, '#bca982'], [1, '#e0d3ae']], 0.9);
    const SHOOT_FN = S.rampFn([[0, '#142310'], [0.25, '#294319'], [0.5, '#4a6a25'], [0.72, '#7a9a39'], [0.9, '#acc660'], [1, '#d5e390']], 0.9);
    let scratch = null;
    function branch(g, pts, o = {}) {
        const w0 = o.w0 ?? 10, w1 = o.w1 ?? w0 * 0.5, green = o.green ?? [2, 3], sd = S.seedOf(o.seed ?? 'branch'), nodes = o.nodes ?? [];
        // dens < 1 paints it at a fraction of the layer's pixels and stretches it (for layers the lens blurs)
        const m = g.getTransform(), dq = o.dens ?? 1, k = Math.hypot(m.a, m.b) * dq;
        const dense = o.raw ? pts : S.curve(pts, false, 10);
        // the axis at even steps, in device pixels
        const step = Math.max(1.5, Math.min(4, Math.min(w0, w1 || w0) * 0.6));
        const X = [dense[0][0]], Y = [dense[0][1]];
        let need = step;
        for (let i = 1; i < dense.length; i++) {
            let ax = dense[i - 1][0], ay = dense[i - 1][1];
            const bx = dense[i][0], by = dense[i][1];
            let d = Math.hypot(bx - ax, by - ay);
            while (d >= need && d > 0) {
                const q = need / d;
                ax += (bx - ax) * q;
                ay += (by - ay) * q;
                X.push(ax);
                Y.push(ay);
                d -= need;
                need = step;
            }
            need -= d;
        }
        const last = dense[dense.length - 1];
        if (Math.hypot(last[0] - X[X.length - 1], last[1] - Y[Y.length - 1]) > 0.3) {
            X.push(last[0]);
            Y.push(last[1]);
        }
        const n = X.length;
        if (n < 2) return;
        const D = new Float32Array(n), HW = new Float32Array(n), PX = new Float32Array(n), PY = new Float32Array(n);
        for (let i = 1; i < n; i++) D[i] = D[i - 1] + Math.hypot(X[i] - X[i - 1], Y[i] - Y[i - 1]);
        const total = D[n - 1];
        let wmax = 0;
        for (let i = 0; i < n; i++) {
            const u = D[i] / total;
            let w = (w0 + (w1 - w0) * Math.pow(u, o.taper ?? 1)) * 0.5 * (1 + (o.thorn ? 0 : 0.08) * S.noise2(D[i] * 0.03, 1.5, sd + 3));
            for (const nd of nodes) w *= 1 + 0.22 * Math.exp(-Math.pow((D[i] - nd) / 4.5, 2));
            HW[i] = w * k;
            if (HW[i] > wmax) wmax = HW[i];
            PX[i] = (m.a * X[i] + m.e) * dq;
            PY[i] = (m.d * Y[i] + m.f) * dq;
        }
        if (o.shade !== false && !o.thorn) {
            // its shadow on the paint under it: three soft passes of one line
            g.save();
            g.globalCompositeOperation = 'source-atop';
            g.lineCap = 'round';
            g.lineJoin = 'round';
            g.strokeStyle = SHADE;
            const wm = (w0 + w1) * 0.5, off = Math.max(2, wm * 0.5);
            g.beginPath();
            for (let i = 0; i < n; i += 2) g.lineTo(X[i] + off * 0.62, Y[i] + off);
            g.lineTo(X[n - 1] + off * 0.62, Y[n - 1] + off);
            for (const [ww, a] of [[1.9, 0.1], [1.35, 0.14], [0.8, 0.18]]) {
                g.lineWidth = wm * ww + 1.5;
                g.globalAlpha = a * (o.shadeA ?? 1);
                g.stroke();
            }
            g.restore();
        }
        const ext = Math.ceil((wmax + 2) / (step * k)) + 2, CH = 8;
        const SXv = new Float32Array(n), SYv = new Float32Array(n), IL = new Float32Array(n);
        for (let i = 0; i < n - 1; i++) {
            SXv[i] = PX[i + 1] - PX[i];
            SYv[i] = PY[i + 1] - PY[i];
            IL[i] = 1 / (SXv[i] * SXv[i] + SYv[i] * SYv[i] || 1);
        }
        if (!scratch) scratch = canvas(64, 64);
        const c1 = [0, 0, 0], c2 = [0, 0, 0];
        const lx = LN[0], ly = LN[1], lz = LN[2];
        const woody = green[0] > 0;
        for (let i0 = 0; i0 < n - 1; i0 += CH) {
            const i1 = Math.min(n - 1, i0 + CH), ja = Math.max(0, i0 - ext), jb = Math.min(n - 1, i1 + ext);
            let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
            for (let i = i0; i <= i1; i++) {
                const p = HW[i] + 2;
                if (PX[i] - p < x0) x0 = PX[i] - p;
                if (PY[i] - p < y0) y0 = PY[i] - p;
                if (PX[i] + p > x1) x1 = PX[i] + p;
                if (PY[i] + p > y1) y1 = PY[i] + p;
            }
            x0 = Math.floor(x0);
            y0 = Math.floor(y0);
            const w = Math.ceil(x1) - x0, h = Math.ceil(y1) - y0;
            if (w < 1 || h < 1) continue;
            const img = new ImageData(w, h), px = img.data;
            let any = false;
            for (let yy = 0; yy < h; yy++) {
                for (let xx = 0; xx < w; xx++) {
                    const cx = x0 + xx + 0.5, cy = y0 + yy + 0.5;
                    let best = 1e12, bj = -1, bt = 0, bex = 0, bey = 0;
                    for (let j = ja; j < jb; j++) {
                        const ax = cx - PX[j], ay = cy - PY[j];
                        let t = (ax * SXv[j] + ay * SYv[j]) * IL[j];
                        t = t < 0 ? 0 : t > 1 ? 1 : t;
                        const ex = ax - SXv[j] * t, ey = ay - SYv[j] * t, d2 = ex * ex + ey * ey;
                        if (d2 < best) {
                            best = d2;
                            bj = j;
                            bt = t;
                            bex = ex;
                            bey = ey;
                        }
                    }
                    if (bj < i0 || bj >= i1) continue; // another stretch owns this pixel
                    const dist = Math.sqrt(best), hw = HW[bj] + (HW[bj + 1] - HW[bj]) * bt;
                    if (dist > hw + 1) continue;
                    const q = Math.min(1, dist / hw), arc = D[bj] + (D[bj + 1] - D[bj]) * bt;
                    const side = bex * -SYv[bj] + bey * SXv[bj] < 0 ? -1 : 1, cu = (side * dist) / k, u = arc / total;
                    const nx = dist > 0 ? bex / dist : 0, ny = dist > 0 ? bey / dist : 0;
                    // a round section under the house light, with a little light bounced into
                    // the rim of its shadow
                    const lam = (nx * lx + ny * ly) * q + Math.sqrt(1 - q * q) * lz;
                    let tone = 0.5 + 0.5 * lam + 0.07 * S.smooth(0.72, 1, q) * (lam < 0 ? 1 : 0);
                    let gm = o.thorn ? 1 : S.smooth(green[0], green[1], u + 0.07 * S.noise2(arc * 0.02, cu * 0.3, sd + 5));
                    // bark: fissures along the grain; a young shoot is smooth, with one ridge
                    const fis = S.noise2(arc * 0.035, cu * 0.55 + 7, sd) * 0.6 + S.noise2(arc * 0.17, cu * 1.2, sd + 1) * 0.4;
                    tone += fis * (0.24 * (1 - gm) + 0.04);
                    if (woody && gm < 0.7) tone -= 0.24 * S.smooth(0.42, 0.62, S.noise2(arc * 0.02, cu * 0.95 + 3, sd + 13)) * (1 - gm); // cracks
                    if (gm > 0.02) {
                        const qr = 0.45 * Math.sin(arc * 0.012 + sd), e = (side * q - qr) / 0.2;
                        tone += gm * (0.1 * Math.exp(-e * e) - 0.07 * Math.exp(-(e - 1.6) * (e - 1.6)));
                    }
                    let pale = 0;
                    if (woody && gm < 0.9) {
                        // lenticels: pale marks across the grain
                        const ci = Math.floor(arc / 13), cj = Math.floor((cu + 60) / 5), hh = S.hashI(ci, cj, 0, sd);
                        if (hh < 0.16) {
                            const ex = (arc - (ci + 0.15 + 0.7 * S.hashI(ci, cj, 1, sd)) * 13) / (0.6 + hh * 3), ey = (cu + 60 - (cj + 0.2 + 0.6 * S.hashI(ci, cj, 2, sd)) * 5) / (1.1 + hh * 7);
                            pale = S.smooth(1, 0.3, ex * ex + ey * ey) * (1 - gm) * 0.7;
                            tone += 0.1 * pale;
                        }
                        // year-old wood is still green in stripes
                        gm = Math.max(gm, S.smooth(0.15, 0.6, S.noise2(arc * 0.018, cu * 0.8, sd + 9)) * (o.stripes ?? 0.45));
                    }
                    tone = tone < 0 ? 0 : tone > 1 ? 1 : tone;
                    WOOD_FN(tone, c1);
                    if (gm > 0) {
                        SHOOT_FN(tone, c2);
                        toward(c1, c2[0], c2[1], c2[2], gm);
                    }
                    if (pale) toward(c1, 226, 214, 176, pale * 0.5);
                    if (woody && gm < 0.5) {
                        // lichen: grey-green crusts on the old wood
                        const li = S.smooth(0.3, 0.5, S.noise2(arc * 0.011 + 9, cu * 0.1, sd + 15)) * S.smooth(-0.3, 0.3, S.noise2(arc * 0.5, cu * 0.5, sd + 16));
                        if (li > 0) toward(c1, 150 + 60 * tone, 168 + 60 * tone, 130 + 50 * tone, li * 0.5 * (1 - gm));
                    }
                    if (o.thorn) toward(c1, 110 + 90 * tone, 62 + 60 * tone, 26 + 30 * tone, S.smooth(0.42, 0.9, u));
                    let a = hw + 0.5 - dist;
                    a = a < 0 ? 0 : a > 1 ? 1 : a;
                    if (hw > 2.4 * k && !o.thorn) {
                        // the edge breaks up in its last stroke
                        const nz = S.noise2(arc * 0.3, cu * 0.3, sd + 21) * 0.65 + S.noise2(arc * 0.8, cu * 0.8, sd + 22) * 0.35;
                        a *= S.smooth(0.25, 0.75, (hw - dist) / (1.1 * k) + nz * 0.8 + 0.15);
                    }
                    if (a <= 0) continue;
                    const i = (yy * w + xx) * 4;
                    px[i] = c1[0];
                    px[i + 1] = c1[1];
                    px[i + 2] = c1[2];
                    px[i + 3] = a * 255;
                    any = true;
                }
            }
            if (!any) continue;
            if (scratch.width < w + 2 || scratch.height < h + 2) {
                scratch.width = Math.max(scratch.width, w + 2);
                scratch.height = Math.max(scratch.height, h + 2);
            }
            const sg = scratch.getContext('2d');
            if (dq !== 1) sg.clearRect(0, 0, w + 2, h + 2); // a stretched crop samples a pixel beyond itself
            sg.putImageData(img, 0, 0);
            g.save();
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.drawImage(scratch, 0, 0, w, h, x0 / dq, y0 / dq, w / dq, h / dq);
            g.restore();
        }
    }
    // A thorn in an axil: green, its last third brown, sharp.
    function thorn(g, x, y, ang, len = 16, seed = 1) {
        branch(g, [[x, y], [x + Math.cos(ang) * len * 0.5, y + Math.sin(ang) * len * 0.5], [x + Math.cos(ang) * len, y + Math.sin(ang) * len]], { w0: Math.min(4.6, 2.4 + len * 0.1), w1: 0.5, taper: 0.85, thorn: true, raw: true, seed: 'thorn' + seed });
        // a glint on its flank
        const nx = -Math.sin(ang), ny = Math.cos(ang), lit = nx * LN[0] + ny * LN[1] > 0 ? 1 : -1;
        g.save();
        g.lineCap = 'round';
        line(g, [[x + Math.cos(ang) * len * 0.15 + nx * lit * 0.7, y + Math.sin(ang) * len * 0.15 + ny * lit * 0.7], [x + Math.cos(ang) * len * 0.62 + nx * lit * 0.35, y + Math.sin(ang) * len * 0.62 + ny * lit * 0.35]], 0.55, 'rgba(232,244,170,0.6)');
        g.restore();
    }
    // The face of a pruned stub at (x, y), the cut looking along `ang`: pale wood, its rings,
    // the pith, a check, the bark's lip.
    function cut(g, x, y, ang, w = 16, seed = 1) {
        const r = Motion.rng('cut' + seed);
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        g.fillStyle = '#3a2c1e';
        oval(g, 0.6, 0.8, w * 0.27, w * 0.54);
        g.fillStyle = '#d6c292';
        oval(g, 0, 0, w * 0.24, w * 0.5);
        g.fillStyle = 'rgba(244,234,196,0.7)';
        oval(g, -w * 0.05, -w * 0.12, w * 0.12, w * 0.26);
        g.strokeStyle = 'rgba(128,100,58,0.6)';
        for (const q of [0.78, 0.55, 0.32]) {
            g.lineWidth = 0.6 + r() * 0.4;
            g.beginPath();
            g.ellipse((r() - 0.5) * 0.6, (r() - 0.5) * 0.8, w * 0.24 * q, w * 0.5 * q, 0, 0, TAU);
            g.stroke();
        }
        g.fillStyle = '#6a5232';
        oval(g, 0.2, 0.3, w * 0.035, w * 0.07);
        g.lineCap = 'round';
        line(g, [[0.2, 0.3], [w * 0.1, w * 0.3], [w * 0.16, w * 0.4]], 0.7, 'rgba(70,50,26,0.7)');
        g.restore();
    }
    // Where a leaf fell: a pale crescent with its trace, and the bud above it.
    function scar(g, x, y, ang, w = 8) {
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        g.lineCap = 'round';
        g.lineWidth = 1.3;
        g.strokeStyle = 'rgba(226,212,170,0.85)';
        g.beginPath();
        g.arc(0, 0, w * 0.3, 0.3, Math.PI - 0.3);
        g.stroke();
        g.lineWidth = 0.6;
        g.strokeStyle = 'rgba(40,28,16,0.7)';
        g.beginPath();
        g.arc(0, 0.9, w * 0.3, 0.4, Math.PI - 0.4);
        g.stroke();
        g.fillStyle = '#2a3c14';
        oval(g, 0.4, -w * 0.16 + 0.5, 1.9, 1.5);
        g.fillStyle = '#86a046';
        oval(g, 0, -w * 0.16, 1.5, 1.2);
        g.restore();
    }

    // ------------------------------------------------------------------ water
    // A dew drop on whatever is painted under it: dark towards the lamp, bright on the far
    // side (the light it gathers), a point of light, a small shadow. `hang`: about to fall.
    function drop(g, { x = 0, y = 0, r = 5, hang = 0, sq = 1 } = {}) {
        const lx = LN[0] / Math.hypot(LN[0], LN[1]), ly = LN[1] / Math.hypot(LN[0], LN[1]);
        g.save();
        g.translate(x, y);
        g.scale(1, sq);
        const body = () => {
            g.beginPath();
            if (hang) {
                g.moveTo(0, -r * (1 + hang * 1.6));
                g.bezierCurveTo(r * 0.2, -r * 1.1, r, -r * 0.7, r, 0);
                g.arc(0, 0, r, 0, Math.PI);
                g.bezierCurveTo(-r, -r * 0.7, -r * 0.2, -r * 1.1, 0, -r * (1 + hang * 1.6));
            } else g.arc(0, 0, r, 0, TAU);
        };
        // its shadow, and the bright spill of light beyond it
        g.save();
        g.globalCompositeOperation = 'source-atop';
        g.fillStyle = 'rgba(6,24,18,0.42)';
        g.beginPath();
        g.ellipse(-lx * r * 0.42, -ly * r * 0.42, r * 1.02, r * 1.02, 0, 0, TAU);
        g.fill();
        g.restore();
        body();
        const gr = g.createLinearGradient(lx * r, ly * r, -lx * r, -ly * r);
        gr.addColorStop(0, 'rgba(4,26,16,0.55)');
        gr.addColorStop(0.45, 'rgba(20,50,30,0.16)');
        gr.addColorStop(0.75, 'rgba(240,255,210,0.3)');
        gr.addColorStop(1, 'rgba(255,255,226,0.72)');
        g.fillStyle = gr;
        g.fill();
        g.lineWidth = Math.max(0.5, r * 0.11);
        g.strokeStyle = 'rgba(6,30,18,0.5)';
        body();
        g.stroke();
        g.strokeStyle = 'rgba(255,255,236,0.8)';
        g.beginPath();
        g.arc(0, 0, r * 0.82, Math.atan2(-ly, -lx) - 0.8, Math.atan2(-ly, -lx) + 0.8);
        g.stroke();
        g.fillStyle = 'rgba(255,255,248,0.96)';
        oval(g, lx * r * 0.42, ly * r * 0.42, r * 0.26, r * 0.19, Math.atan2(ly, lx) + 1.57);
        g.fillStyle = 'rgba(255,255,248,0.7)';
        disc(g, lx * r * 0.1 + ly * r * 0.36, ly * r * 0.1 - lx * r * 0.36, r * 0.09);
        g.restore();
    }

    // An ant on the bough (they farm the scale): head, thorax, a gloss on the gaster, six
    // legs, elbowed antennae. About 9 long at s = 1, heading along `rot`.
    function ant(g, { x = 0, y = 0, rot = 0, s = 1 } = {}) {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(s, s);
        g.lineCap = 'round';
        g.strokeStyle = '#1c120c';
        g.lineWidth = 0.42;
        for (const [x0, a] of [[0.6, -1.9], [0, -1.5], [-0.6, -1.1], [0.6, 1.9], [0, 1.5], [-0.6, 1.1]]) {
            g.beginPath();
            g.moveTo(x0, 0);
            g.lineTo(x0 + Math.cos(a) * 1.6, Math.sin(a) * 1.9);
            g.lineTo(x0 + Math.cos(a) * 1.6 + (a < 0 ? 1 : 1) * 0.9, Math.sin(a) * 3.3);
            g.stroke();
        }
        for (const sg of [-1, 1]) {
            g.beginPath();
            g.moveTo(2.9, sg * 0.4);
            g.lineTo(3.9, sg * 1.5);
            g.lineTo(5.2, sg * 1.2);
            g.stroke();
        }
        g.fillStyle = '#20140e';
        oval(g, -2.7, 0, 2.3, 1.55);
        oval(g, 0, 0, 1.5, 0.95);
        oval(g, 2.5, 0, 1.25, 1.1);
        g.restore();
        // the gloss stays towards the lamp however the ant is turned
        const c = Math.cos(rot), sn = Math.sin(rot), lx = LN[0] * 0.6 * s, ly = LN[1] * 0.6 * s;
        g.fillStyle = 'rgba(214,170,130,0.75)';
        oval(g, x - 2.7 * s * c + lx, y - 2.7 * s * sn + ly, 0.9 * s, 0.45 * s, rot);
        disc(g, x + 2.5 * s * c + lx * 0.7, y + 2.5 * s * sn + ly * 0.7, 0.3 * s);
    }

    const stats = () => ({ sprites: stat.sprites, px: stat.px, mb: Math.round((stat.px * 4) / 1048576) });
    return { lemon, lemonShape, fruitlet, leaf, leafGeom, flower, bud, spent, petal, branch, thorn, cut, scar, ant, drop, put, shadow, shadowOf, graded, stats, lkey, LSTEP, SHADE };
})();
