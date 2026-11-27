// red-thread · the set (river, banks, bridge, tree, sky) and shot 7, «The kite» (36–43 s).
// Global: RT. The set takes a world state `w` (see film.js: worldAt) so the same painting
// carries the whole film: the sun's red, the bridge (intact → cracked → fallen), the river's
// ink, the tree's bloom. Shot 7 is the approved style test: a gust carries the girl's red
// kite across the river; the boy looks up from his screen and catches the string.
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
            [0, 265], [T_GUST, 255], [2.6, 185], [3.6, 250], [4.6, 450], [T_CATCH, 500], [5.8, 270], [7, 235],
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
    // The whole landscape is ONE painting on one sheet (round 3): no parallax, nothing
    // translucent. It is painted back to front into a single cached sprite, each piece
    // knocking out what is behind it; mist is paper, not transparency.
    // the sun: grey when the red has gone out of the world. The red fades out of it evenly
    // (and comes back the same way): the grey disc shows through as the red thins (round 10:
    // a ring closing from the edge read as a glitch)
    const SUN = [1300, 235, 105];
    function sky(g, env, t, w = {}) {
        const red = w.red ?? 0, [x, y, r] = SUN;
        Sumi.halo(g, env, x, y, r, { color: '#6d6861', seed: 'grey' });
        if (red < 1) Sumi.sun(g, env, x, y, r, { color: '#8d877d', seed: 'grey', fade: 0.6 });
        if (red > 0) Sumi.sun(g, env, x, y, r, { seed: 'red', fade: 0.75, alpha: Ease.inOut(red) });
    }

    function landscape(g, env) {
        // far ranges: pale, broad washes (only paper and the sun are behind them)
        Motion.sprite('rt:farwash', { x: -600, y: 280, w: 3600, h: 420 }, env.k, (c) => {
            Sumi.mountains(c, env, 'far3', { x0: -500, x1: 1250, y: 630, h: 210, ink: 0.16, peaks: 2.6, blur: 5 });
            Sumi.mountains(c, env, 'far4', { x0: 1000, x1: 2900, y: 630, h: 170, ink: 0.13, peaks: 3.2, blur: 5 });
        }).draw(g);
        // karst peaks behind the right bank, right of the sun
        Sumi.peak(g, env, 'pk3B', 1600, 652, 120, 240, { shoulder: 0.85, slant: -0.05 });
        Sumi.peak(g, env, 'pk3A', 1420, 652, 190, 330, { shoulder: 0.62 });
        Motion.sprite('rt:land3', { x: -600, y: 300, w: 3600, h: 400 }, env.k, (c) => {
            // right bank: a wooded hill with the pavilion (inside the final framing)
            Sumi.hill(c, { x0: 1960, x1: 2700, base: 648, h: 120, peaks: 1.6, seed: 'hR1b', ink: 0.5, mist: 0.55 });
            const hr = Sumi.hill(c, { x0: 1560, x1: 2300, base: 652, h: 130, peaks: 1.1, sharp: 1.1, seed: 'hR1', ink: 0.85 });
            // the pavilion stands on the hill between the peaks and the boy, clear of the kite
            const at = (x) => hr.reduce((a, p) => (Math.abs(p[0] - x) < Math.abs(a[0] - x) ? p : a));
            const pv = at(1790);
            Sumi.foliage(c, pv[0] - 120, pv[1] + 22, 110, 50, { seed: 'fR2' });
            Sumi.pavilion(c, pv[0], pv[1] + 10, 115, { seed: 'pvR' });
            const fr = at(2060);
            Sumi.foliage(c, fr[0], fr[1] + 14, 150, 55, { seed: 'fR1' });
            // left bank: a hill with the pagoda among trees, between the tree and the girl
            Sumi.hill(c, { x0: 380, x1: 1150, base: 648, h: 150, peaks: 1.5, seed: 'hL1b', ink: 0.55, mist: 0.55 });
            const hl = Sumi.hill(c, { x0: 120, x1: 900, base: 652, h: 165, peaks: 1.25, sharp: 1.1, seed: 'hL1', ink: 0.88 });
            const topL = hl.reduce((a, p) => (p[1] < a[1] ? p : a));
            Sumi.foliage(c, topL[0] + 90, topL[1] + 14, 120, 60, { seed: 'fL1' });
            Sumi.pagoda(c, topL[0] - 20, topL[1] + 12, 175, { seed: 'pgL' });
            Sumi.foliage(c, topL[0] - 120, topL[1] + 30, 100, 50, { seed: 'fL2' });
            Sumi.hill(c, { x0: -500, x1: 260, base: 652, h: 80, peaks: 1.3, seed: 'hL0', ink: 0.75, mist: 0.6 });
        }).draw(g);
    }

    // three cranes crossing the sky with the wind, wings on twos
    function cranes(g, env, t) {
        for (const [i, x0, y0, s, ph] of [[0, 600, 105, 26, 0], [1, 500, 145, 22, 0.35], [2, 690, 170, 19, 0.7]]) {
            const x = x0 + t * 105, y = y0 + Math.sin(t * 1.3 + i) * 8;
            Sumi.crane(g, x, y, s, (t * 1.1 + ph) % 1, { seed: 'cr' + i, ink: 0.85, tilt: -0.08 });
        }
    }

    // --- the river (round 4) ----------------------------------------------------------------
    // The river comes from the far hills and opens into a wide pool in the foreground, held
    // between two promontories (the girl's on the left, the boy's on the right) and a small
    // bank in the bottom-left corner where the old tree stands, as in the reference: the
    // water reaches the bottom of the frame, so it never reads as a road.
    const HORIZON = 650;
    // the water-facing edge of each piece of land, from far to near
    const SHORE_L = [[1040, 650], [960, 662], [860, 688], [800, 722], [770, 765], [720, 808], [600, 842], [430, 872], [240, 905], [40, 940], [-200, 975], [-700, 990]];
    const SHORE_R = [[1330, 650], [1480, 660], [1640, 690], [1710, 714], [1760, 752], [1800, 800], [1880, 842], [2040, 875], [2260, 905], [2500, 930], [3100, 960]];
    const SHORE_T = [[-700, 1040], [-300, 1012], [0, 1002], [180, 1022], [300, 1070], [370, 1250]];
    const LANDS = [
        [[-700, HORIZON - 2], ...SHORE_L, [-700, 990]],
        [[3100, HORIZON - 2], ...SHORE_R.slice().reverse().map((p) => p).reverse(), [3100, 960]],
        [...SHORE_T, [-700, 1250]],
    ];

    // the water: long smooth grey bands and fine dark lines, darkest along the far shore and
    // fading to white towards the viewer (cached; it is part of the sheet)
    function water(g, env, t = 0) {
        // the current: the whole sheet of bands drifts slowly
        g.save();
        g.translate(18 * Math.sin(t * 0.21) + 6 * Math.sin(t * 0.53), 0);
        Motion.sprite('rt:water4', { x: -700, y: HORIZON - 10, w: 3800, h: 620 }, env.k, (c) => {
            const r = Motion.rng('water4');
            // the dark band where the water meets the far shore
            const gr = c.createLinearGradient(0, HORIZON, 0, HORIZON + 110);
            gr.addColorStop(0, Sumi.tone(0.32));
            gr.addColorStop(0.35, Sumi.tone(0.12));
            gr.addColorStop(1, Sumi.tone(0));
            c.fillStyle = gr;
            c.fillRect(-700, HORIZON, 3800, 110);
            // broad bands: long, flat, soft-edged, lighter and sparser towards the viewer
            for (let i = 0; i < 46; i++) {
                const v = Math.pow(r(), 1.6), y = HORIZON + 6 + v * 560;
                const len = 300 + r() * 1100, x = -500 + r() * 3400;
                Sumi.stroke(c, [[x, y], [x + len * 0.5, y + (r() - 0.5) * 3], [x + len, y + (r() - 0.5) * 2]],
                    { w: 8 + r() * 22 * (0.5 + v), ink: (0.1 + r() * 0.2) * (1 - v * 0.8), dry: 0.88, seed: 'wb' + i, taper: [0.35, 0.45], blunt: 0.25, core: r() < 0.5, bleed: false });
            }
            // fine dark lines running far across (the pencil-thin lines of the reference)
            for (let i = 0; i < 38; i++) {
                const v = Math.pow(r(), 1.4), y = HORIZON + 4 + v * 540;
                const len = 200 + r() * 900, x = -500 + r() * 3400;
                Sumi.stroke(c, [[x, y], [x + len, y + (r() - 0.5) * 2]],
                    { w: 1.6 + r() * 1.6, ink: (0.45 + r() * 0.4) * (1 - v * 0.5), dry: 0.5, seed: 'wl' + i, taper: [0.15, 0.2], blunt: 0.6, core: false, bleed: false });
            }
        }).draw(g);
        g.restore();
    }

    // reflections: the far landscape, the grey sun, the broken bridge and the red thread
    // mirrored about their water lines, drawn into a layer and laid on the water in thin
    // horizontal strips that shift and break with the current
    function reflections(g, env, t, c, spans = [], w = {}) {
        const L = Motion.layer(env, 'rt-refl', (q) => {
            view(q, c, 1);
            q.save();
            q.translate(0, HORIZON * 2);
            q.scale(1, -1);
            q.globalAlpha = 0.5;
            landscape(q, env);        // (no sun: its reflection read as a stain at the frame's edge)
            q.restore();
            q.save();
            q.translate(0, 722 * 2);
            q.scale(1, -1);
            bridge(q, env, true, w.bridge);
            q.restore();
            // red threads over the river, mirrored about the water surface under them
            spans.forEach((span, i) => {
                q.save();
                q.translate(0, 722 * 2);
                q.scale(1, -1);
                Sumi.stroke(q, span, { w: 2.4, ink: 0.6, color: Sumi.RED, dry: 0.2, seed: 'strRefl' + i, taper: [0, 0], blunt: 1, bleed: false, raw: true });
                q.restore();
            });
        });
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalCompositeOperation = 'darken';     // paper in the layer leaves the water as it is
        const W = env.px[0], H = env.px[1], sh = Math.max(2, Math.round(2.5 * env.k));
        for (let y = 0; y < H; y += sh) {
            const gap = Motion.noise1('rgap', y * 0.06 + t * 0.7);
            if (gap > 0.42) continue;                 // white cuts across the reflection
            const dx = Math.sin(y * 0.05 + t * 1.6) * 2.2 * env.k + Motion.noise1('rdx', y * 0.02 + t * 0.4) * 2 * env.k;
            g.globalAlpha = 0.5 + 0.2 * Math.max(0, -gap);
            g.drawImage(L, 0, y, W, sh, dx, y, W, sh);
        }
        g.restore();
    }

    // the land: opaque paper over the water, a damp grey band and a dry dark line along each
    // shore, stones with moss, grass, the boy's rock
    function lands(g, env) {
        Motion.sprite('rt:lands4', { x: -700, y: HORIZON - 10, w: 3800, h: 620 }, env.k, (c) => {
            const r = Motion.rng('lands4');
            for (const poly of LANDS) Sumi.fillPoly(c, poly, Sumi.PAPER);
            for (const [sh, side] of [[SHORE_L, 1], [SHORE_R, -1], [SHORE_T, 1]]) {
                const fine = Sumi.smooth(sh, 6).map(([x, y], i) => [x + 5 * Motion.noise1('sh4' + side + sh.length, i * 0.1), y + 3 * Motion.noise1('shy4' + side, i * 0.13)]);
                // damp band on the water side
                Sumi.stroke(c, fine.map(([x, y]) => [x + side * 6, y + 8]), { w: 16, ink: 0.28, dry: 0.85, seed: 'damp' + side + sh.length, taper: [0.1, 0.1], core: false, raw: true, bleed: false });
                // the shoreline: two or three strokes, heavier towards the viewer
                // the shoreline: short strokes with gaps, heavier towards the viewer, never one
                // continuous line (that reads as a kerb)
                const n = fine.length;
                let i0 = 0, k = 0;
                while (i0 < n - 3) {
                    const len = 5 + Math.floor(r() * 9), i1 = Math.min(n, i0 + len);
                    const u = i0 / n;
                    Sumi.stroke(c, fine.slice(i0, i1), { w: 4 + u * 9 * (0.6 + r() * 0.8), ink: 0.7 + r() * 0.25, dry: 0.7, seed: 'shl' + side + sh.length + k, taper: [0.25, 0.4], blunt: 0.5, raw: true, bleed: false });
                    i0 = i1 + (r() < 0.4 ? 1 + Math.floor(r() * 2) : -1);
                    k++;
                }
                // ground on the bank: dry grey strokes lying along the shore, fading inland
                for (let j = 0; j < 14; j++) {
                    const a = Math.floor(r() * (n - 8)), b = Math.min(n, a + 4 + Math.floor(r() * 8));
                    const off = 10 + r() * 60;
                    Sumi.stroke(c, fine.slice(a, b).map(([x, y]) => [x - side * off * 0.4, y - off]), { w: 3 + r() * 6, ink: 0.15 + r() * 0.2, dry: 0.9, seed: 'gr4' + side + sh.length + j, taper: [0.3, 0.4], raw: true, core: false, bleed: false });
                }
                // a second, lighter line behind the edge (the bank's lip), as in the reference
                const lip = fine.slice(Math.floor(n * 0.25)).map(([x, y]) => [x - side * 14, y - 12]);
                Sumi.stroke(c, lip, { w: 4, ink: 0.4, dry: 0.85, seed: 'lip' + side + sh.length, taper: [0.3, 0.4], raw: true, core: false, bleed: false });
                // stones with moss dots
                for (let i = 0; i < 6; i++) {
                    const p = fine[Math.floor((0.15 + 0.8 * r()) * (n - 1))];
                    const sz = 5 + (p[1] - HORIZON) * 0.035 * (0.6 + r());
                    const st = Sumi.blobPts(p[0], p[1] - sz * 0.3, sz * 1.5, sz, 0, 'st4' + side + i + sh.length, 0.15);
                    Sumi.fillPoly(c, st, Sumi.tone(0.22 + r() * 0.2));
                    Sumi.stroke(c, st.slice(14, 28), { w: sz * 0.35, ink: 0.85, dry: 0.6, seed: 'stc4' + side + i + sh.length, taper: [0.2, 0.3], bleed: false });
                    for (let k = 0; k < 3; k++) Sumi.dab(c, p[0] + (r() - 0.5) * sz * 2, p[1] - sz * (1 + r() * 0.4), 1.4 + r() * 1.4, 1.2 + r(), { seed: 'md4' + side + i + k + sh.length });
                }
            }
            // grass on the land, thinning away from the water
            const tuft = (x0, y, s, seed) => {
                const n = 3 + Math.floor(r() * 4);
                for (let j = 0; j < n; j++) {
                    const a = -Math.PI / 2 + (j - n / 2) * 0.25 + (r() - 0.5) * 0.3, hgt = s * (0.6 + r() * 0.6);
                    Sumi.stroke(c, [[x0 + j * 3, y], [x0 + j * 3 + Math.cos(a) * hgt * 0.5, y + Math.sin(a) * hgt * 0.5], [x0 + j * 3 + Math.cos(a) * hgt + 3, y + Math.sin(a) * hgt]],
                        { w: 2.5 + r() * 1.5, ink: 0.6 + r() * 0.3, dry: 0.4, seed: seed + j, taper: [0, 0.85], blunt: 1, bleed: false });
                }
            };
            for (let i = 0; i < 9; i++) tuft(250 + r() * 480, 700 + r() * 120, 16 + r() * 12, 'tL' + i);
            for (let i = 0; i < 9; i++) tuft(1820 + r() * 500, 700 + r() * 140, 16 + r() * 12, 'tR' + i);
            for (let i = 0; i < 5; i++) tuft(-200 + r() * 450, 1040 + r() * 80, 24 + r() * 14, 'tT' + i);
            // the boy's rock
            const rk = Sumi.blobPts(ROCK.x - 6, ROCK.y - 2, 58, 30, 0, 'rock', 0.12);
            Sumi.fillPoly(c, rk, Sumi.tone(0.22));
            Sumi.fillPoly(c, Sumi.blobPts(ROCK.x + 14, ROCK.y + 8, 40, 18, 0.1, 'rocksh', 0.15), Sumi.tone(0.25));
            Sumi.stroke(c, [...rk.slice(20), ...rk.slice(0, 13)], { w: 9, ink: 0.92, dry: 0.65, seed: 'rockc', taper: [0.15, 0.35], bleed: false });
            Sumi.stroke(c, rk.slice(13, 21), { w: 6, ink: 0.7, dry: 0.85, seed: 'rockb', taper: [0.2, 0.4], bleed: false });
            for (let k = 0; k < 6; k++) Sumi.dab(c, ROCK.x - 40 + k * 15, ROCK.y - 26 + (k % 2) * 4, 2.2, 1.8, { seed: 'rm' + k });
        }).draw(g);
    }

    // reeds in the shallows along the shores and two clumps out in the open water
    function reeds(g, env) {
        Motion.sprite('rt:reeds4', { x: -700, y: HORIZON - 100, w: 3800, h: 720 }, env.k, (c) => {
            const r = Motion.rng('reeds4');
            const along = (sh, u) => {
                const f = u * (sh.length - 1), i = Math.min(sh.length - 2, Math.floor(f));
                return Ease.lerpPt(sh[i], sh[i + 1], f - i);
            };
            for (const [sh, side, us] of [[SHORE_L, 1, [0.32, 0.45, 0.58, 0.7]], [SHORE_R, -1, [0.35, 0.5, 0.62, 0.72]]]) {
                for (const u of us) {
                    const p = along(sh, u + (r() - 0.5) * 0.04);
                    Sumi.reed(c, p[0] + side * (14 + r() * 26), p[1] + 10 + r() * 14, 26 + (p[1] - HORIZON) * 0.16, { seed: 'rd4' + side + u, ink: 0.88 });
                }
            }
            Sumi.reed(c, 1040, 1010, 58, { seed: 'rdA', ink: 0.9 });
            Sumi.reed(c, 1090, 1022, 46, { seed: 'rdB', ink: 0.9 });
            Sumi.reed(c, 1560, 990, 50, { seed: 'rdC', ink: 0.9 });
        }).draw(g);
    }

    // The bridge before it breaks: the same stubs and posts, with the middle span in four
    // planks under a railing. `st` = { mode: 'intact' | 'broken', crack 0..1, fall 0..1 }:
    // the crack opens down the middle, then the planks tip and drop into the river one by one
    // (free fall from their own release times), and the posts lean to where they end up in
    // the broken bridge. Once fallen, the cached broken sprite takes over.
    const deckY = (x) => 676 - 10 * Math.sin(Math.PI * (x - 820) / 860);
    const POSTS = [[1010, 665, 0], [1130, 690, 0.12], [1270, 700, -0.2], [1400, 684, 0.05], [1500, 668, 0]];
    const PLANKS = [[985, 1120, -1], [1120, 1250, -1], [1250, 1390, 1], [1390, 1525, 1]];
    const FALL_AT = [0.32, 0.08, 0.0, 0.22];        // release order: the cracked middle first
    function plankFall(i, fall) {
        const tt = Math.max(0, fall * 1.6 - FALL_AT[i]);   // seconds since release (fall spans ~1.6 s)
        return { drop: 0.5 * 1500 * tt * tt, rot: PLANKS[i][2] * 1.4 * tt, gone: 0.5 * 1500 * tt * tt > 90 };
    }
    function bridgeIntact(g, env, st) {
        const crack = st.crack ?? 0, fall = st.fall ?? 0;
        const sx = (seed) => 'bi' + seed;
        // stubs and their rails (as in the broken sprite, without splinters)
        Motion.sprite('rt:bridgeStubs', { x: 600, y: 560, w: 1300, h: 300 }, env.k, (c) => {
            for (const [a, b, sd] of [[[820, 676], [985, 670], 'L'], [[1525, 670], [1680, 676], 'R']]) {
                Sumi.stroke(c, [a, Ease.lerpPt(a, b, 0.5), b], { w: 13, ink: 0.92, dry: 0.45, seed: 'deck' + sd, taper: [0.02, 0.05], blunt: 1 });
            }
            for (const x of [850, 920, 975, 1540, 1600, 1660]) Sumi.stroke(c, [[x, deckY(x) - 4], [x + 1, deckY(x) - 34]], { w: 5, ink: 0.9, dry: 0.3, seed: 'rp' + x, taper: [0, 0.1] });
            Sumi.stroke(c, [[848, 643], [988, 637]], { w: 4, ink: 0.85, dry: 0.5, seed: 'railL', taper: [0.05, 0.05] });
            Sumi.stroke(c, [[1522, 637], [1662, 643]], { w: 4, ink: 0.85, dry: 0.5, seed: 'railR', taper: [0.05, 0.05] });
        }).draw(g);
        // posts: straight under the deck, leaning to their broken angle as the span falls
        const lean = Ease.inOut(Ease.seg(fall, 0.1, 0.8));
        for (const [x, top, tilt] of POSTS) {
            const bot = 722, t0 = deckY(x) + 4 + (top - deckY(x) - 4) * lean, tl = tilt * lean;
            Sumi.stroke(g, [[x, t0], [x + tl * (bot - t0), bot]], { w: 10, ink: 0.9, dry: 0.5, seed: 'post' + x, taper: [0, 0.05], blunt: 1, bleed: false });
            Sumi.stroke(g, [[x + tl * (bot - t0) - 15, bot + 2], [x + tl * (bot - t0) + 17, bot + 1]], { w: 3, ink: 0.55, dry: 0.6, seed: 'prw' + x, taper: [0.3, 0.3], bleed: false });
        }
        // the middle span: planks with their piece of railing; the crack separates 2 and 3
        PLANKS.forEach(([a, b, dir], i) => {
            const f = plankFall(i, fall);
            if (f.gone) return;
            const gapX = (i === 1 ? -1 : i === 2 ? 1 : 0) * 5 * crack;
            const pivot = dir < 0 ? [a, deckY(a)] : [b, deckY(b)];
            g.save();
            g.beginPath();
            g.rect(-1000, -1000, 4000, 1722);            // nothing shows below the waterline
            g.clip();
            g.translate(pivot[0] + gapX, pivot[1] + f.drop);
            g.rotate(f.rot);
            g.translate(-pivot[0], -pivot[1]);
            Sumi.stroke(g, [[a, deckY(a)], [(a + b) / 2, deckY((a + b) / 2)], [b, deckY(b)]], { w: 13, ink: 0.92, dry: 0.45, seed: sx('pl' + i), taper: [0.02, 0.02], blunt: 1, bleed: false });
            for (const x of [a + 30, b - 30]) Sumi.stroke(g, [[x, deckY(x) - 4], [x + 1, deckY(x) - 34]], { w: 5, ink: 0.9, dry: 0.3, seed: sx('rp' + i + x), taper: [0, 0.1], bleed: false });
            Sumi.stroke(g, [[a, deckY(a) - 33], [b, deckY(b) - 33]], { w: 4, ink: 0.85, dry: 0.5, seed: sx('rl' + i), taper: [0.02, 0.02], bleed: false });
            g.restore();
        });
        // the crack: a black zigzag down the middle of the deck, then splinters
        if (crack > 0 && fall < 0.05) {
            const pts = [[1250, 640], [1244, 652], [1255, 662], [1247, 672], [1253, 684]];
            Sumi.stroke(g, pts.slice(0, 1 + Math.ceil(crack * 4)), { w: 4, ink: 1, dry: 0.3, seed: 'crack', taper: [0, 0.4], core: false, bleed: false });
        }
    }
    // where the planks hit the water (for splashes): [x, time offset within the fall]
    const PLANK_SPLASH = PLANKS.map(([a, b], i) => [(a + b) / 2, FALL_AT[i] + Math.sqrt(2 * 50 / 1500)]);

    // the broken bridge: a deck stub from each bank, posts standing in the water
    // (their reflections come from the reflection pass)
    function bridge(g, env, mirror = false, st = null) {
        if (st && st.mode === 'intact') return bridgeIntact(g, env, st);
        Motion.sprite('rt:bridge4', { x: 600, y: 560, w: 1300, h: 300 }, env.k, (c) => {
            const deck = (a, b, seed) => {
                Sumi.stroke(c, [a, Ease.lerpPt(a, b, 0.5), b], { w: 13, ink: 0.92, dry: 0.45, seed, taper: [0.02, 0.15], blunt: 1 });
            };
            deck([820, 676], [985, 668], 'deckL');
            deck([1525, 668], [1680, 676], 'deckR');
            for (const [x, y, d] of [[985, 668, 1], [1525, 668, -1]]) {
                for (let i = 0; i < 4; i++) Sumi.stroke(c, [[x - d * 6, y - 4 + i * 3], [x + d * (10 + i * 7), y - 8 + i * 5]], { w: 3, ink: 0.85, dry: 0.3, seed: 'spl' + x + i, taper: [0, 0.8] });
            }
            for (const x of [850, 920, 975, 1540, 1600, 1660]) Sumi.stroke(c, [[x, 670], [x + 1, 640]], { w: 5, ink: 0.9, dry: 0.3, seed: 'rp' + x, taper: [0, 0.1] });
            Sumi.stroke(c, [[848, 643], [976, 640]], { w: 4, ink: 0.85, dry: 0.5, seed: 'railL', taper: [0.05, 0.2] });
            Sumi.stroke(c, [[1538, 640], [1662, 643]], { w: 4, ink: 0.85, dry: 0.5, seed: 'railR', taper: [0.05, 0.2] });
            for (const [x, top, tilt] of [[1010, 665, 0], [1130, 690, 0.12], [1270, 700, -0.2], [1400, 684, 0.05], [1500, 668, 0]]) {
                const bot = 722;
                Sumi.stroke(c, [[x, top], [x + tilt * (bot - top), bot]], { w: 10, ink: 0.9, dry: 0.5, seed: 'post' + x, taper: [0, 0.05], blunt: 1 });
                // a ring of disturbed water where the post enters it
                Sumi.stroke(c, [[x + tilt * (bot - top) - 15, bot + 2], [x + tilt * (bot - top) + 17, bot + 1]], { w: 3, ink: 0.55, dry: 0.6, seed: 'prw' + x, taper: [0.3, 0.3] });
            }
        }).draw(g);
    }

    // the old plum tree in the foreground: gnarled trunk, angular limbs, and the last red
    // blossoms in the world, which the gust strips off and carries over the river
    let grown = null, flowers = [], extraFlowers = [];
    // `bloom` 0..1: the extra blossoms of the tree in full flower (the start and the end of
    // the film); the base blossoms are the last ones, which stay through the grey part
    function tree(g, env, t, bloom = 0) {
        // the old tree sways a little in the wind, from its foot
        const sway = 0.006 * Math.sin(t * 0.9) + 0.003 * Math.sin(t * 2.3 + 1);
        g.save();
        g.translate(-90, 1100);
        g.rotate(sway);
        g.translate(90, -1100);
        Motion.sprite('rt:tree2', { x: -500, y: -500, w: 1600, h: 1650 }, env.k, (c) => {
            grown = Sumi.tree(c, {
                seed: 'plum', w: 78, gnarl: 0.8, ink: 0.95,
                trunk: [[-90, 1100], [-10, 900], [40, 700], [100, 560], [168, 474]],
                limbs: [
                    { p: [160, 480], a: -1.05, len: 400, w: 38, d: 4 },
                    { p: [120, 530], a: -2.1, len: 340, w: 26, d: 3 },
                    { p: [80, 600], a: -2.75, len: 300, w: 20, d: 3 },
                ],
            });
            flowers = Sumi.bloom(c, grown, { seed: 'plumb', density: 0.45, size: 14 });
        }).draw(g);
        if (bloom > 0) {
            const sp = Motion.sprite('rt:tree2extra', { x: -500, y: -500, w: 1600, h: 1650 }, env.k, (c) => {
                extraFlowers = Sumi.bloom(c, grown, { seed: 'plumx', density: 0.75, size: 13 });
            });
            g.save();
            g.globalAlpha *= bloom;
            sp.draw(g);
            g.restore();
        }
        g.restore();
    }

    // red petals blown off by the gust: they flutter across with the kite, settle on the
    // river and drift with the current (closed form per petal)
    function petals(g, env, t) {
        if (!flowers.length) return;
        const r = Motion.rng('petals');
        for (let i = 0; i < 34; i++) {
            const p0 = flowers[Math.floor(r() * flowers.length)];
            const t0 = T_GUST + r() * 1.3, vx = 330 + r() * 300, ph = r() * 6, fall = 50 + r() * 70;
            const dt = Math.max(0, t - t0);
            if (dt === 0) continue;
            let x = p0[0] + vx * 0.4 * dt + vx * 0.6 * (1 - Math.exp(-dt * 1.4)) / 1.4;
            let y = p0[1] + fall * dt + 9 * dt * dt + 20 * Math.sin(dt * 3.2 + ph);
            const surf = 760 + (i % 5) * 40;            // where this one meets the water
            let rot = ph + dt * (4 + (i % 3)), flip = Math.cos(dt * 5 + ph);
            if (y > surf) {
                // floating: slows to the current, flat, barely turning
                y = surf + Math.sin(t * 1.5 + i) * 1.5;
                rot = ph;
                flip = 0.45;
            }
            Sumi.petal(g, x, y, 6.5, rot, { flip });
        }
        // a few petals that were already floating on the water
        for (let i = 0; i < 9; i++) {
            const x = 850 + r() * 900 + t * 9, y = 760 + r() * 260;
            Sumi.petal(g, x, y, 5 + r() * 2, r() * 6, { flip: 0.4, ink: 0.8 });
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

    function kite(g, env, t, at = null) {
        const k = at ?? kiteAt(t);
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

    // the thread across the river after the catch (for its reflection), from the poses
    function spanFor(t, gp, bp) {
        if (t < T_CATCH) return null;
        const settle = Ease.out(Ease.seg(t, T_CATCH, T_CATCH + 0.8));
        return sag(gp.hands[0], bp.hands[0], 95 - 40 * settle + Math.sin(t * 2.1) * 6);
    }

    return { spline, SUN, deckY, PLANK_SPLASH, kiteAt, sag, flowersOf: () => flowers, extraOf: () => extraFlowers, HORIZON, GIRL, BOY, ROCK, landscape, cranes, reeds, lands, reflections, spanFor, W, H, cam, view, twos, sky, bridge, water, tree, petals, wind, kite, string, girlPose, boyPose };
})();
