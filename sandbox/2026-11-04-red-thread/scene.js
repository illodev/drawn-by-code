// 2026-11-04-red-thread · style sumi-e
// Style test: «The kite» (36–43 s of the film). A gust carries the girl's red kite across
// the river; the boy looks up from his screen, stands and catches the string: a red thread
// spans the river. The world is grey here: the kite and its string are the only red.
const RT = (() => {
    const W = 1600, H = 900;
    const WL = 700;                       // water level at the bridge's depth
    const GIRL = { x: 600, y: 760 }, BOY = { x: 1915, y: 790 }, ROCK = { x: 1950, y: 776 };
    const GH = 175, BH = 185, bk = BH / 135;

    // camera: [t, cx, cy, zoom]
    const CAM = [[0, 655, 522, 1.13], [1.4, 700, 512, 1.09], [4.6, 1225, 490, 0.82], [7, 1258, 486, 0.795]];
    // Monotone cubic through time keys (Fritsch–Carlson): velocity carries through every
    // key and never overshoots, so nothing stops dead at a key or comes back
    function spline(keys, t) {
        const n = keys.length;
        if (t <= keys[0][0]) return keys[0][1];
        if (t >= keys[n - 1][0]) return keys[n - 1][1];
        const d = [], m = [];
        for (let i = 0; i < n - 1; i++) d.push((keys[i + 1][1] - keys[i][1]) / (keys[i + 1][0] - keys[i][0]));
        m.push(0);   // start from rest
        for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i]));
        m.push(0);   // and come to rest
        let i = 0;
        while (t > keys[i + 1][0]) i++;
        const h = keys[i + 1][0] - keys[i][0], u = (t - keys[i][0]) / h, u2 = u * u, u3 = u2 * u;
        return (2 * u3 - 3 * u2 + 1) * keys[i][1] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * keys[i + 1][1] + (u3 - u2) * h * m[i + 1];
    }
    function cam(t) {
        const k = (i) => spline(CAM.map((c) => [c[0], c[i]]), t);
        return { cx: k(1), cy: k(2), z: k(3) };
    }
    // a layer at parallax p (0 = fixed to the sky, 1 = the ground plane)
    function view(g, c, p) {
        const z = 1 + (c.z - 1) * p;
        g.translate(W / 2, H / 2);
        g.scale(z, z);
        g.translate(-(W / 2 + (c.cx - W / 2) * p), -(H / 2 + (c.cy - H / 2) * p));
    }

    // --- choreography ---------------------------------------------------------------------
    const T_GUST = 1.5, T_LOOK = 3.7, T_STAND = 4.1, T_CATCH = 5.0;
    const twos = (t) => Math.floor(t * 12 + 1e-6) / 12;
    const hump = (u) => Math.sin(Math.PI * u);

    function kiteAt(t) {
        const n = (s, f) => Motion.noise1(s, t * f);
        // before the gust: tugging above the girl; the gust carries it over the river;
        // it dips past the boy; after the catch it rides the wind beyond him
        const path = spline([
            [0, 905], [T_GUST, 935], [2.6, 1330], [3.6, 1760], [4.6, 2060], [T_CATCH, 2110], [7, 2150],
        ], t);
        const py = spline([
            [0, 265], [T_GUST, 255], [2.6, 185], [3.6, 250], [4.6, 450], [T_CATCH, 500], [5.8, 330], [7, 300],
        ], t);
        return { x: path + n('kx', 1.3) * 14, y: py + n('ky', 1.7) * 12, rot: 0.25 + n('kr', 2.1) * 0.22 + (t > T_GUST && t < 3.6 ? 0.2 : 0) };
    }

    function girlPose(t) {
        const g = Ease.out(Ease.seg(t, T_GUST, T_GUST + 0.6)) - 0.35 * Ease.inOut(Ease.seg(t, 2.6, 3.6));
        const after = Ease.inOut(Ease.seg(t, T_CATCH, T_CATCH + 0.6));
        const k = kiteAt(t);
        const sx = GIRL.x + 28 * Ease.inOut(Ease.seg(t, T_GUST + 0.1, T_GUST + 0.5));
        const sh = [sx + 4, GIRL.y - 0.73 * GH];
        // the near hand reaches along the line towards the kite (or the boy, after)
        const tgt = t < T_CATCH ? [k.x, k.y] : [BOY.x, BOY.y - 120];
        const a = Math.atan2(tgt[1] - sh[1], tgt[0] - sh[0]);
        const reach = (30 + 10 * g) * GH / 125;
        const hand = [sh[0] + Math.cos(a) * reach, sh[1] + Math.sin(a) * reach + 4];
        return {
            x: sx, y: GIRL.y, h: GH, face: 1, kind: 'girl', id: 'girl',
            lean: 0.04 + 0.2 * g - 0.08 * after, look: 0.35 - 0.2 * after,
            feet: [[sx + 20 + 11 * g, GIRL.y], [GIRL.x - 8, GIRL.y]],
            hands: [hand, [sx - 3 + 14 * after, GIRL.y - 73 - 30 * hump(Ease.seg(t, 2.3, 4.6))]],
            wind: 0.35 + 0.65 * hump(Ease.seg(t, T_GUST, 4.0)), t,
        };
    }

    // the phone: in his hands while he sits; as he stands he lets it drop to the ground,
    // where it lies face up, its light fading
    function phoneAt(t, held, x) {
        const t0 = T_STAND + 0.15;
        if (t < t0) return held;
        const drop = BOY.y - 4 - held[1], tf = Math.sqrt(2 * drop / 2400);
        const u = Math.min(t - t0, tf);
        return [held[0] - 30 * Math.min(1, (t - t0) / tf), held[1] + 0.5 * 2400 * u * u];
    }

    function boyPose(t) {
        const look = Ease.out(Ease.seg(t, T_LOOK, T_LOOK + 0.35));
        const stand = Ease.inOut(Ease.seg(t, T_STAND, T_STAND + 0.5));
        const reach = Ease.out(Ease.seg(t, 4.45, T_CATCH));
        const pull = hump(Ease.seg(t, T_CATCH, T_CATCH + 0.6));
        const x = BOY.x - 14 * stand;
        const catchPt = stringAt(BOY.x - 24, T_CATCH - 1e-3);
        // phone hands in front of the chest while sitting; then the phone drops to the side
        const phoneH = [x - 30 * bk, BOY.y - (76 - 40 * stand) * bk];
        const nearRest = [x - (34 - 26 * stand) * bk, BOY.y - (70 - 20 * stand) * bk];
        const near = Ease.lerpPt(nearRest, [catchPt[0], catchPt[1] + 14 * pull], reach);
        return {
            x, y: BOY.y, h: BH, face: -1, kind: 'boy', id: 'boy',
            sit: 1 - stand, seatY: ROCK.y - 30,
            lean: 0.55 * (1 - stand) - 0.25 * look * (1 - stand) + 0.1 * stand - 0.12 * reach,
            look: -0.35 + 0.95 * look,
            feet: stand > 0.5 ? [[x - 30, BOY.y], [x + 19, BOY.y]] : [[x - 52, BOY.y], [x - 34, BOY.y]],
            hands: [near, Ease.lerpPt([x - 26 * bk, BOY.y - 74 * bk], [x + 6 * bk, BOY.y - 50 * bk], stand)],
            phone: 1, glow: 1 - 0.85 * Ease.seg(t, T_STAND + 0.5, 6.5), phoneAt: phoneAt(t, phoneH, x), phoneRot: 0.5 - 1.6 * Ease.in(Ease.seg(t, T_STAND + 0.15, T_STAND + 0.45)),
            t,
        };
    }

    // The string as a sagging curve from the girl's hand to the kite. Before the catch it
    // is one span; after it, two: girl → boy (across the river) and boy → kite.
    function sag(a, b, amount) {
        const pts = [];
        for (let i = 0; i <= 24; i++) {
            const u = i / 24;
            pts.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + amount * 4 * u * (1 - u)]);
        }
        return pts;
    }
    let girlHand = null;
    function stringAt(x, t) {
        const gp = girlPose(t), k = kiteAt(t);
        const sh = [gp.x + 4, GIRL.y - 0.73 * GH];
        const a = gp.hands[0], kk = [k.x - 8 * Math.sin(k.rot), k.y + 8 * Math.cos(k.rot)];
        const pts = sag(a, kk, 70 + 40 * hump(Ease.seg(t, T_GUST, 3.6)));
        for (let i = 1; i < pts.length; i++) if (pts[i][0] >= x) {
            const u = (x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]);
            return Ease.lerpPt(pts[i - 1], pts[i], u);
        }
        return pts[pts.length - 1];
    }

    // --- set pieces -----------------------------------------------------------------------
    function sky(g, env, t) {
        // the grey sun (the red has gone out of the world)
        Sumi.sun(g, env, 1180, 250, 105, { color: '#8d877d', seed: 'grey' });
        Sumi.mountains(g, env, 'far', { x0: 380, x1: 1500, y: 600, h: 300, ink: 0.2, peaks: 2.4, blur: 5 });
        Sumi.mountains(g, env, 'far2', { x0: 1150, x1: 2300, y: 600, h: 210, ink: 0.15, peaks: 3, blur: 5 });
    }

    function midground(g, env, t) {
        Sumi.mountains(g, env, 'midL', { x0: -500, x1: 1150, y: 640, h: 230, ink: 0.4, peaks: 2.2, sharp: 0.7, cun: 5 });
        Sumi.mountains(g, env, 'midR', { x0: 1350, x1: 2900, y: 640, h: 180, ink: 0.36, peaks: 2.6, sharp: 0.7, cun: 5 });
        // mist banks drifting across the foot of the mountains
        for (let i = 0; i < 3; i++) {
            const x = -300 + ((i * 1100 + t * 22) % 3300);
            const y = 600 + i * 18;
            const gr = g.createRadialGradient(x, y, 0, x, y, 520);
            gr.addColorStop(0, 'rgba(238,232,218,0.85)');
            gr.addColorStop(1, 'rgba(238,232,218,0)');
            g.save();
            g.translate(x, y);
            g.scale(1, 0.16);
            g.translate(-x, -y);
            g.fillStyle = gr;
            g.fillRect(x - 520, y - 520, 1040, 1040);
            g.restore();
        }
    }

    // banks: mostly empty paper, defined by the shoreline stroke, a darker wash along the
    // water and tufts of grass, as a painter would leave them
    const SHORE_L = [[1040, 640], [960, 655], [820, 700], [790, 740], [700, 790], [690, 860], [590, 960], [430, 1150]];
    const SHORE_R = [[1330, 640], [1470, 650], [1700, 702], [1720, 750], [1830, 800], [1880, 880], [2060, 980], [2350, 1150]];
    // the river's surface: a pale wash, darker towards the far shore, with the mountains
    // mirrored in it (soft, broken by the current)
    function waterSurface(g, env, t, c) {
        g.save();
        g.beginPath();
        clipWater(g);
        g.clip();
        const gr = g.createLinearGradient(0, 640, 0, 1150);
        gr.addColorStop(0, 'rgba(23,19,15,0.16)');
        gr.addColorStop(0.35, 'rgba(23,19,15,0.07)');
        gr.addColorStop(1, 'rgba(23,19,15,0.02)');
        g.fillStyle = gr;
        g.fillRect(-500, 600, 3400, 600);
        g.restore();
    }
    function mirrored(g, env, t, c) {
        // drawn in the midground layer's frame, flipped about the water line
        g.save();
        g.beginPath();
        clipWater(g);
        g.clip();
        g.globalAlpha = 0.32;
        g.translate(0, 642 * 2);
        g.scale(1, -1);
        Sumi.mountains(g, env, 'midL', { x0: -500, x1: 1150, y: 640, h: 230, ink: 0.4, peaks: 2.2, sharp: 0.7, cun: 5 });
        Sumi.mountains(g, env, 'midR', { x0: 1350, x1: 2900, y: 640, h: 180, ink: 0.36, peaks: 2.6, sharp: 0.7, cun: 5 });
        g.restore();
    }
    function water(g, env, t) {
        // ripples: horizontal dry strokes, denser near the shores, drifting slowly
        const r = Motion.rng('ripples');
        for (let i = 0; i < 60; i++) {
            const y = 650 + Math.pow(r(), 1.3) * 480;
            const depth = (y - 640) / 500;
            const xl = shoreX(SHORE_L, y), xr = shoreX(SHORE_R, y);
            const near = r() < 0.55;
            const x = near ? (r() < 0.5 ? xl + 10 + r() * 140 : xr - 150 + r() * 140) : xl + r() * (xr - xl);
            const len = 30 + r() * 120 * (0.5 + depth);
            const sp = Sumi.cachedStroke('rip' + i, [[0, 0], [len * 0.5, (r() - 0.5) * 3], [len, 0]],
                { w: 3 + depth * 9, ink: 0.12 + r() * 0.3, dry: 0.8, seed: 'rip' + i, taper: [0.25, 0.5] }, env.k);
            const dx = Math.sin(t * 0.6 + i) * 10 + t * 6 * (0.5 + r());
            g.save();
            g.beginPath();
            clipWater(g);
            g.clip();
            sp.draw(g, x - len / 2 + dx, y);
            g.restore();
        }
    }
    function shoreX(sh, y) {
        for (let i = 1; i < sh.length; i++) if (y <= sh[i][1]) {
            const u = (y - sh[i - 1][1]) / (sh[i][1] - sh[i - 1][1]);
            return sh[i - 1][0] + (sh[i][0] - sh[i - 1][0]) * u;
        }
        return sh[sh.length - 1][0];
    }
    function clipWater(g) {
        g.moveTo(SHORE_L[0][0], SHORE_L[0][1]);
        for (const p of SHORE_L) g.lineTo(p[0], p[1]);
        for (let i = SHORE_R.length - 1; i >= 0; i--) g.lineTo(SHORE_R[i][0], SHORE_R[i][1]);
        g.closePath();
    }

    function banks(g, env) {
        const key = 'banks';
        const box = { x: -500, y: 560, w: 3200, h: 700 };
        Motion.sprite('rt:' + key, box, env.k, (c) => {
            for (const [sh, side] of [[SHORE_L, -1], [SHORE_R, 1]]) {
                // a narrow damp band along the water's edge
                const w = Sumi.wash('bank' + side, box, env.k, (q) => {
                    q.moveTo(sh[0][0], sh[0][1]);
                    for (const p of sh) q.lineTo(p[0], p[1]);
                    for (let i = sh.length - 1; i >= 0; i--) q.lineTo(sh[i][0] + side * (10 + i * 7), sh[i][1] - 2);
                    q.closePath();
                }, { ink: 0.35, blur: 3, grain: 1 });
                c.drawImage(w.canvas, box.x, box.y, box.w, box.h);
                // the shoreline: two long strokes along a wandering edge, broken by stones
                const fine = Sumi.smooth(sh, 6).map(([x, y], i) => [x + side * 9 * Motion.noise1('sh' + side, i * 0.08), y]);
                const half = Math.floor(fine.length * 0.45);
                Sumi.stroke(c, fine.slice(0, half + 4), { w: 7, ink: 0.8, dry: 0.75, seed: 'shoreA' + side, taper: [0.3, 0.3], blunt: 0.5, raw: true });
                Sumi.stroke(c, fine.slice(half + 10), { w: 16, ink: 0.85, dry: 0.7, seed: 'shoreB' + side, taper: [0.15, 0.3], blunt: 0.6, raw: true });
                const r = Motion.rng('stones' + side);
                for (let i = 0; i < 7; i++) {
                    const p = fine[Math.floor((0.1 + 0.85 * r()) * (fine.length - 1))];
                    const sz = 6 + (p[1] - 640) * 0.05 * (0.6 + r());
                    const st = Sumi.blobPts(p[0] + side * sz * 0.6, p[1] - sz * 0.2, sz * 1.5, sz, 0, 'st' + side + i, 0.15);
                    Sumi.fillPoly(c, st, Sumi.tone(0.25 + r() * 0.2));
                    Sumi.stroke(c, st.slice(14, 28), { w: sz * 0.35, ink: 0.85, dry: 0.6, seed: 'stc' + side + i, taper: [0.2, 0.3] });
                    // moss dots (dian) on the stone
                    for (let k = 0; k < 3; k++) Sumi.dab(c, p[0] + side * sz * (r() * 1.5), p[1] - sz * (0.8 + r() * 0.4), 1.6 + r() * 1.6, 1.4 + r(), { seed: 'md' + side + i + k });
                }
                // reeds leaning out over the water
                for (let i = 0; i < 5; i++) {
                    const p = fine[Math.floor((0.2 + 0.75 * r()) * (fine.length - 1))];
                    for (let k = 0; k < 4; k++) {
                        const hgt = 30 + r() * 40 * (p[1] - 600) / 300, a = -Math.PI / 2 - side * (0.15 + k * 0.12 + r() * 0.1);
                        Sumi.stroke(c, [p, [p[0] + Math.cos(a) * hgt * 0.5, p[1] + Math.sin(a) * hgt * 0.5], [p[0] + Math.cos(a - side * 0.25) * hgt, p[1] + Math.sin(a - side * 0.25) * hgt]],
                            { w: 3.2, ink: 0.75, dry: 0.4, seed: 'rd' + side + i + k, taper: [0, 0.9], blunt: 1 });
                    }
                }
                // a few ground lines inland
                for (let i = 0; i < 4; i++) {
                    const y = 720 + r() * 360, x0 = shoreX(sh, y) + side * (60 + r() * 160), len = 90 + r() * 160;
                    Sumi.stroke(c, [[x0, y], [x0 + side * len * 0.5, y - 3], [x0 + side * len, y + 2]],
                        { w: 4 + r() * 4, ink: 0.22 + r() * 0.15, dry: 0.9, seed: 'gl' + side + i, taper: [0.3, 0.6], core: false });
                }
            }
            // grass tufts and stones on both banks
            const r = Motion.rng('tufts');
            for (let i = 0; i < 22; i++) {
                const side = i % 2 ? 1 : -1, sh = side < 0 ? SHORE_L : SHORE_R;
                const y = 650 + r() * 450, x0 = shoreX(sh, y) + side * (20 + r() * 420);
                const n = 3 + Math.floor(r() * 4), hgt = 14 + r() * 26 * (0.6 + (y - 650) / 400);
                for (let j = 0; j < n; j++) {
                    const a = -Math.PI / 2 + (j - n / 2) * 0.28 + (r() - 0.5) * 0.3;
                    Sumi.stroke(c, [[x0 + j * 3, y], [x0 + j * 3 + Math.cos(a) * hgt * 0.5, y + Math.sin(a) * hgt * 0.5], [x0 + j * 3 + Math.cos(a) * hgt + 4, y + Math.sin(a) * hgt]],
                        { w: 3 + r() * 2, ink: 0.55 + r() * 0.35, dry: 0.4, seed: 'tf' + i + j, taper: [0, 0.8], blunt: 1 });
                }
            }
            // the boy's rock: a pale wash body, a dark dry outline on the shadow side, moss dots
            const rk = Sumi.blobPts(ROCK.x - 6, ROCK.y - 2, 58, 30, 0, 'rock', 0.12);
            Sumi.fillPoly(c, rk, Sumi.tone(0.22));
            Sumi.fillPoly(c, Sumi.blobPts(ROCK.x + 14, ROCK.y + 8, 40, 18, 0.1, 'rocksh', 0.15), Sumi.tone(0.25));
            Sumi.stroke(c, [...rk.slice(20), ...rk.slice(0, 13)], { w: 9, ink: 0.92, dry: 0.65, seed: 'rockc', taper: [0.15, 0.35] });
            Sumi.stroke(c, rk.slice(13, 21), { w: 6, ink: 0.7, dry: 0.85, seed: 'rockb', taper: [0.2, 0.4] });
            for (let k = 0; k < 6; k++) Sumi.dab(c, ROCK.x - 40 + k * 15, ROCK.y - 26 + (k % 2) * 4, 2.2, 1.8, { seed: 'rm' + k });
        }).draw(g);
    }

    // the broken bridge: a deck stub from each bank, posts standing in the water
    function bridge(g, env) {
        Motion.sprite('rt:bridge', { x: 600, y: 560, w: 1300, h: 300 }, env.k, (c) => {
            const deck = (a, b, seed) => {
                Sumi.stroke(c, [a, Ease.lerpPt(a, b, 0.5), b], { w: 13, ink: 0.92, dry: 0.45, seed, taper: [0.02, 0.15], blunt: 1 });
            };
            deck([820, 676], [985, 668], 'deckL');
            deck([1525, 668], [1680, 676], 'deckR');
            // splintered ends
            for (const [x, y, d] of [[985, 668, 1], [1525, 668, -1]]) {
                for (let i = 0; i < 4; i++) Sumi.stroke(c, [[x - d * 6, y - 4 + i * 3], [x + d * (10 + i * 7), y - 8 + i * 5]], { w: 3, ink: 0.85, dry: 0.3, seed: 'spl' + x + i, taper: [0, 0.8] });
            }
            // railing posts on the stubs
            for (const x of [850, 920, 975, 1540, 1600, 1660]) Sumi.stroke(c, [[x, 670], [x + 1, 640]], { w: 5, ink: 0.9, dry: 0.3, seed: 'rp' + x, taper: [0, 0.1] });
            Sumi.stroke(c, [[848, 643], [976, 640]], { w: 4, ink: 0.85, dry: 0.5, seed: 'railL', taper: [0.05, 0.2] });
            Sumi.stroke(c, [[1538, 640], [1662, 643]], { w: 4, ink: 0.85, dry: 0.5, seed: 'railR', taper: [0.05, 0.2] });
            // posts in the water, some broken and tilted
            for (const [x, top, tilt] of [[1010, 665, 0], [1130, 690, 0.12], [1270, 700, -0.2], [1400, 684, 0.05], [1500, 668, 0]]) {
                const bot = 722;
                Sumi.stroke(c, [[x, top], [x + tilt * (bot - top), bot]], { w: 10, ink: 0.9, dry: 0.5, seed: 'post' + x, taper: [0, 0.05], blunt: 1 });
                // its reflection, broken by ripples
                const rx = x + tilt * (bot - top);
                Sumi.stroke(c, [[rx, bot + 4], [rx - 4, bot + 16], [rx + 4, bot + 28], [rx - 2, bot + 40]], { w: 8, ink: 0.3, dry: 0.75, seed: 'pr' + x, taper: [0.05, 0.6] });
                Sumi.stroke(c, [[rx - 16, bot + 3], [rx + 18, bot + 2]], { w: 3, ink: 0.5, dry: 0.6, seed: 'prw' + x, taper: [0.3, 0.3] });
            }
        }).draw(g);
    }

    // the old cherry tree in the foreground, bare: its blossoms went grey and fell
    const TREE = [[-60, 1080], [40, 860], [70, 640], [150, 470], [300, 330], [470, 250], [640, 215]];
    const BRANCHES = [
        [[150, 470], [90, 360], [20, 280]],
        [[300, 330], [330, 220], [400, 150]],
        [[470, 250], [560, 300], [690, 320]],
        [[640, 215], [740, 180], [810, 190]],
        [[640, 215], [700, 150], [760, 110]],
        [[90, 360], [130, 300], [190, 270]],
        [[400, 150], [470, 120], [540, 115]],
    ];
    function tree(g, env, t) {
        Motion.sprite('rt:tree', { x: -200, y: 0, w: 1100, h: 1150 }, env.k, (c) => {
            Sumi.stroke(c, TREE, { w: 70, ink: 0.95, dry: 0.55, seed: 'trunk', taper: [0, 0.75], blunt: 1, raw: false });
            // bark knots
            for (const [x, y] of [[48, 820], [80, 610], [180, 430]]) Sumi.dab(c, x, y, 9, 6, { seed: 'knot' + x, ink: 0.9 });
            BRANCHES.forEach((b, i) => Sumi.stroke(c, b, { w: 22 - i * 1.5, ink: 0.92, dry: 0.6, seed: 'br' + i, taper: [0, 0.8], blunt: 1 }));
            // twigs: alternating along each branch, leaning the way the branch grows
            const r = Motion.rng('twigs');
            BRANCHES.forEach((b, i) => {
                const dir = Math.atan2(b[2][1] - b[1][1], b[2][0] - b[1][0]);
                for (let k = 0; k < 3; k++) {
                    const p = Ease.lerpPt(b[0], b[2], 0.35 + k * 0.22 + r() * 0.08);
                    const a = dir + (k % 2 ? -1 : 1) * (0.5 + r() * 0.4), l = 22 + r() * 30;
                    Sumi.stroke(c, [p, [p[0] + Math.cos(a) * l * 0.5, p[1] + Math.sin(a) * l * 0.5], [p[0] + Math.cos(a + 0.2) * l, p[1] + Math.sin(a + 0.2) * l]],
                        { w: 5.5, ink: 0.85, dry: 0.5, seed: 'tw' + i + k, taper: [0, 0.9], blunt: 1 });
                }
            });
        }).draw(g);
    }

    // grey petals blown off by the gust (closed form per petal)
    function petals(g, env, t) {
        const r = Motion.rng('petals');
        for (let i = 0; i < 26; i++) {
            const b = BRANCHES[Math.floor(r() * BRANCHES.length)];
            const p0 = Ease.lerpPt(b[1], b[2], r());
            const t0 = T_GUST + r() * 1.2, vx = 380 + r() * 260, ph = r() * 6;
            const dt = t - t0;
            const x = dt > 0 ? p0[0] + vx * dt * (1 - Math.exp(-dt * 1.5)) / (1 - Math.exp(-1.5)) * 0.6 + vx * 0.4 * dt : p0[0];
            const y = dt > 0 ? p0[1] + 40 * dt + 22 * Math.sin(dt * 3.5 + ph) : p0[1];
            const a = ph + Math.max(0, dt) * 5;
            Sumi.dab(g, x, y, 5, 3, { rot: a, ink: 0.42, seed: 'pt' + i, rough: 0.25 });
        }
    }

    // wind: dry grey strokes sweeping left to right during the gust
    function wind(g, env, t) {
        for (let i = 0; i < 7; i++) {
            const t0 = T_GUST - 0.2 + i * 0.22, u = Ease.seg(t, t0, t0 + 1.6);
            if (u <= 0 || u >= 1) continue;
            const y = 180 + i * 47 + (i % 2) * 30, len = 260 + (i % 3) * 90;
            const x = -200 + u * 2200;
            const pts = [[x, y], [x + len * 0.4, y - 18], [x + len * 0.8, y - 10], [x + len, y + 8]];
            Sumi.stroke(g, pts, { w: 5, ink: 0.28 * Math.sin(Math.PI * u), dry: 0.85, seed: 'wind' + i, taper: [0.3, 0.6], bleed: false });
        }
    }

    function kite(g, env, t) {
        const k = kiteAt(t);
        g.save();
        g.translate(k.x, k.y);
        g.rotate(k.rot);
        // tails first (behind), two long red paper strips trailing downwind
        for (const [dx, ph] of [[-14, 0], [14, 1.3]]) {
            const pts = [];
            for (let i = 0; i <= 8; i++) pts.push([dx + Math.sin(t * 8 + ph - i * 0.8) * (3 + i * 2.2) - i * 7, 45 + i * 16]);
            Sumi.stroke(g, pts, { w: 6, ink: 0.9, color: Sumi.RED, dry: 0.35, seed: 'tail' + dx, taper: [0, 0.6], blunt: 1 });
        }
        Motion.sprite('rt:kite', { x: -45, y: -55, w: 90, h: 110 }, env.k * 1.5, (c) => {
            const q = [[-36, -46], [36, -46], [36, 46], [-36, 46]];
            const w = Sumi.wash('kitebody', { x: -45, y: -55, w: 90, h: 110 }, env.k * 1.5, (s) => {
                s.moveTo(q[0][0], q[0][1]);
                for (const p of q) s.lineTo(p[0], p[1]);
                s.closePath();
            }, { color: Sumi.RED, ink: 0.92, blur: 0.6, rim: 0.25, rimW: 5, grain: 0.6 });
            c.drawImage(w.canvas, -45, -55, 90, 110);
            // bamboo spars and frame
            Sumi.stroke(c, [[-36, -46], [36, 46]], { w: 2.4, ink: 0.85, dry: 0.3, seed: 'sp1', taper: [0, 0] });
            Sumi.stroke(c, [[36, -46], [-36, 46]], { w: 2.4, ink: 0.85, dry: 0.3, seed: 'sp2', taper: [0, 0] });
            // an ensō painted on the kite
            const ring = [];
            for (let i = 0; i <= 22; i++) {
                const a = -2.2 + (i / 22) * 5.6;
                ring.push([Math.cos(a) * 20, Math.sin(a) * 20]);
            }
            Sumi.stroke(c, ring, { w: 8, ink: 0.95, dry: 0.7, seed: 'enso', taper: [0.05, 0.5], blunt: 0.9 });
        }).draw(g);
        g.restore();
    }

    // the red string, one span or two after the catch
    function string(g, env, t, gp, bp) {
        const k = kiteAt(t), kk = [k.x - 8 * Math.sin(k.rot), k.y + 8 * Math.cos(k.rot)];
        const gh = gp.hands[0];   // the hands as drawn (Cast.figure's result)
        const draw = (pts, seed) => Sumi.stroke(g, pts, { w: 2.6, ink: 0.95, color: Sumi.RED, dry: 0.15, seed, taper: [0, 0], blunt: 1, bleed: false, raw: true });
        if (t < T_CATCH) {
            draw(sag(gh, kk, 70 + 40 * hump(Ease.seg(t, T_GUST, 3.6))), 'str');
        } else {
            const bh = bp.hands[0];
            const settle = Ease.elastic ? Ease.out(Ease.seg(t, T_CATCH, T_CATCH + 0.8)) : 1;
            const span = 95 - 40 * settle + Math.sin(t * 2.1) * 6;
            draw(sag(gh, bh, span), 'strA');
            draw(sag(bh, kk, 22), 'strB');
            return { span, gh, bh };
        }
        return null;
    }

    // the thread's reflection on the river, broken by the ripples
    function reflection(g, env, t, sp) {
        if (!sp) return;
        const pts = sag(sp.gh, sp.bh, sp.span);
        g.save();
        g.beginPath();
        clipWater(g);
        g.clip();
        g.strokeStyle = 'rgba(198,42,31,0.32)';
        g.lineWidth = 2;
        for (let i = 1; i < pts.length; i++) {
            const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
            if (Math.sin(i * 1.7 + t * 3) < -0.3) continue;
            const ry = (y) => 2 * (WL + 70) - y;
            g.beginPath();
            g.moveTo(ax + Math.sin(t * 2 + i) * 3, ry(ay));
            g.lineTo(bx + Math.sin(t * 2 + i) * 3, ry(by));
            g.stroke();
        }
        g.restore();
    }

    return { waterSurface, mirrored, W, H, cam, view, twos, sky, midground, banks, bridge, water, tree, petals, wind, kite, string, reflection, girlPose, boyPose };
})();

Motion.scene({
    fps: 24,
    duration: 7,
    logical: [1600, 900],
    uses: ['styles/sumi-e/sumi.js', 'sandbox/2026-11-04-red-thread/cast.js'],
    bpm: 60,
    shots: [[0, 7, 'The kite']],
    audio: { mix: 'mix.wav' },   // node sandbox/2026-11-04-red-thread/music.mjs

    draw(g, t, env) {
        const c = RT.cam(t), tq = RT.twos(t);
        const layer = (p, fn) => {
            g.save();
            RT.view(g, c, p);
            fn();
            g.restore();
        };
        layer(1, () => Sumi.paper(g, env, { x: -500, y: -300, w: 3300, h: 1650 }, { res: 1.1 }));
        layer(0.25, () => RT.sky(g, env, t));
        layer(0.55, () => {
            RT.midground(g, env, t);
        });
        layer(1, () => {
            RT.waterSurface(g, env, t, c);
            RT.mirrored(g, env, t, c);
            RT.banks(g, env);
            RT.water(g, env, t);
            RT.bridge(g, env);
            const gd = Cast.figure(g, RT.girlPose(tq)), bd = Cast.figure(g, RT.boyPose(tq));
            RT.string(g, env, tq, gd, bd);
            RT.kite(g, env, tq);
            RT.wind(g, env, t);
        });
        layer(1.12, () => {
            RT.tree(g, env, t);
            RT.petals(g, env, tq);
        });
    },

    post(ctx, t, env) {
        const c = RT.cam(t), k = env.k;
        // the paper's tooth moves with the ground plane, so it reads as the sheet, not a lens
        Sumi.tooth(ctx, env, { scale: 1.3 * c.z, ox: (800 - c.cx * c.z) * k, oy: (450 - c.cy * c.z) * k });
    },
});
