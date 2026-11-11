// Props for «solo5» (bars 167–178: the concert on the moon and the poster).
// Global: Solo5Props. Depends on Cereal, Song, Cast, Devil, Inferno, Skyward, Fx.
//
//   sky(g, t, o)              the night over the moon: the film's slow burst, stars that twinkle on
//                             twos, and the cover's field rising as hard-edged bands (o.warm 0..1,
//                             o.hor the height they rise from)
//   field(g, t)               the album cover's pink-to-yellow field as seven flat bands
//   earth(g, x, y, r)         the Earth, small and blue (the Americas, a swirl of cloud)
//   sun(g, x, y, r, t)        the road's sun in shades (world.js's drawing, free of the road's clock)
//   halo(g, x, y, s, o)       a spare halo: an angel's ring without its wire
//   mitt(g, x, y, s, who)     an angel's mitt laid over what it holds
//   windmill(g, x, y, s, a, o) the Devil's picking arm at the angle a, over Inferno.devilGuitar
//                             drawn with `strum: NaN` (the technique of segments/solo2.js)
//   strapEnd(g, x, y, s, o)   the end of his strap, which `strum: NaN` leaves out
//   title(g, t, x, y, o)      the film's title as its own solids (Chorus1Props.title's look, no star)
//   dust(g, x, y, s, age, o)  moon dust kicked up by something that lands
//   conduct(side, beat)       the cactus's two arms for Verse2aProps.cactus
const Solo5Props = (() => {
    const C = Cereal, K = C.COL, S = Song, TAU = Math.PI * 2, PI = Math.PI;
    const D = Cast.D, Dd = (z) => [D[0] * z, D[1] * z];
    const lerp = (a, b, u) => a + (b - a) * u;
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const seg = (v, a, b) => clamp((v - a) / (b - a));
    const smooth = (u) => {
        const v = clamp(u);
        return v * v * (3 - 2 * v);
    };
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const cw = (pts) => {
        let a = 0;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i], q = pts[(i + 1) % pts.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return a > 0 ? pts : pts.slice().reverse();
    };
    const line = (g, pts, lw, ink = K.ink) => C.poly(g, pts, { ink, lw, close: false });
    const circ = (g, x, y, r, fill, lw = 0, ink = K.ink) => {
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        if (fill) {
            g.fillStyle = fill;
            g.fill();
        }
        if (lw > 0) {
            g.strokeStyle = ink;
            g.lineWidth = lw;
            g.stroke();
        }
    };
    const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    const mix = (a, b, k) => {
        const A = hex(a), B = hex(b);
        return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * clamp(k)).toString(16).padStart(2, '0')).join('');
    };

    // =========================================================================================
    // The sky
    // =========================================================================================
    // The cover's field, top to bottom, as the film's dawn paints it (skyward.js): pink, orange,
    // yellow, here cut into seven flat bands.
    const PINK = '#ee4b93', ORANGE = '#f58a4f', YELLOW = '#f8c22c';
    const BANDS = [PINK, mix(PINK, ORANGE, 0.36), mix(PINK, ORANGE, 0.72), ORANGE, mix(ORANGE, YELLOW, 0.4), mix(ORANGE, YELLOW, 0.75), YELLOW];
    const EDGES = [0, 330, 420, 500, 580, 660, 750, 1000]; // where each band begins on the poster
    const rays = (g, t, cx, cy, alpha) => {
        g.save();
        g.globalAlpha = alpha;
        g.fillStyle = '#fffdf4';
        g.beginPath();
        for (let i = 0; i < 12; i++) {
            const a0 = t * 0.06 + (i / 12) * TAU, a1 = a0 + TAU / 24;
            g.moveTo(cx, cy);
            g.lineTo(cx + Math.cos(a0) * 1700, cy + Math.sin(a0) * 1700);
            g.lineTo(cx + Math.cos(a1) * 1700, cy + Math.sin(a1) * 1700);
            g.closePath();
        }
        g.fill();
        g.restore();
    };
    function field(g, t, o = {}) {
        for (let i = 0; i < BANDS.length; i++) {
            g.fillStyle = BANDS[i];
            g.fillRect(-50, EDGES[i], 1100, EDGES[i + 1] - EDGES[i] + 1);
        }
        rays(g, t, o.cx ?? 500, o.cy ?? 700, 0.1);
    }
    const STARS = (() => {
        const r = Motion.rng('solo5-stars'), out = [];
        for (let i = 0; i < 64; i++) out.push([r() * 1000, r() * 1000, 5 + r() * 9, Math.floor(r() * 12), i % 5 === 0]);
        return out;
    })();
    /**
     * o: { warm 0..1: the cover's bands rise from below `hor` (default 620): the pink first, the
     *      yellow last, each a flat band with a hard edge; at 1 the pink's top is 300 above hor.
     *      cx, cy: the burst's centre (default the moon's, far below);  dim: the stars' size 0..1 }
     */
    function sky(g, t, o = {}) {
        const d = C.drawing(t), warm = clamp(o.warm ?? 0), hor = o.hor ?? 620;
        C.sunburst(g, o.cx ?? 500, o.cy ?? 1100, { n: 12, rot: t * 0.06, a: '#0e0b2c', b: '#130f3a' });
        for (const [x, y, sz, ph, gold] of STARS) {
            const tw = (d + ph) % 12 < 2 ? 1.5 : 1;
            C.sparkle(g, x, y, sz * tw * (o.dim ?? 1), { color: gold ? K.yellow : '#fffbe8' });
        }
        if (warm > 0) {
            // seven bands; band i (0 the pink, on top) has risen (warm − i · 0.09) of its way
            for (let i = 0; i < BANDS.length; i++) {
                const k = smooth(seg(warm, i * 0.09, i * 0.09 + 0.46)), top = hor + 60 - k * (360 - i * 46);
                if (k <= 0) continue;
                g.fillStyle = BANDS[i];
                g.fillRect(-50, top, 1100, 1100 - top);
            }
        }
    }

    // =========================================================================================
    // The Earth and the sun
    // =========================================================================================
    const EARTH = { sea: '#3f8ef0', seaLit: '#6fb4ff', seaDark: '#2a5fd0', land: '#35c46a', landDark: '#1f9a50', cloud: '#fffdf4' };
    // the Americas on a unit disc (x right, y down), and the west of Africa and Europe on its edge
    const AMERICAS = [[-0.62, -0.5], [-0.5, -0.68], [-0.26, -0.8], [0.02, -0.8], [0.16, -0.7], [0.36, -0.64], [0.44, -0.48], [0.3, -0.42], [0.22, -0.3], [0.26, -0.2], [0.2, -0.1], [0.24, -0.02], [0.17, -0.03], [0.1, -0.16],
        [-0.02, -0.14], [-0.06, -0.04], [0.02, 0.06], [0.14, 0.1], [0.3, 0.08], [0.46, 0.18], [0.56, 0.3], [0.5, 0.46], [0.36, 0.58], [0.3, 0.76], [0.2, 0.9], [0.13, 0.86], [0.14, 0.62], [0.06, 0.44], [0.0, 0.3], [0.04, 0.16],
        [-0.08, 0.08], [-0.16, -0.06], [-0.3, -0.16], [-0.38, -0.3], [-0.5, -0.38]];
    const OLD_WORLD = [[0.74, -0.62], [0.9, -0.5], [1.1, -0.4], [1.1, 0.2], [0.92, 0.16], [0.8, 0.02], [0.72, -0.14], [0.78, -0.3], [0.7, -0.42]];
    function earth(g, x, y, r) {
        const lw = Math.max(2.4, Math.min(3.2, r * 0.09));
        g.save();
        g.translate(x, y);
        g.lineJoin = 'round';
        circ(g, 0, 0, r, EARTH.seaDark);
        g.save();
        g.beginPath();
        g.arc(0, 0, r, 0, TAU);
        g.clip();
        circ(g, -r * 0.09, -r * 0.08, r, EARTH.sea);
        circ(g, -r * 0.34, -r * 0.36, r * 0.34, EARTH.seaLit);
        const put = (pts) => pts.map(([px, py]) => [px * r, py * r]);
        for (const shape of [AMERICAS, OLD_WORLD]) {
            C.poly(g, put(shape).map(([px, py]) => [px + r * 0.04, py + r * 0.035]), { fill: EARTH.landDark, lw: 0 });
            C.poly(g, put(shape), { fill: EARTH.land, ink: K.ink, lw: lw * 0.6 });
        }
        // cloud: two streaks and an ice cap
        g.lineCap = 'round';
        line(g, C.curve(put([[-0.86, 0.3], [-0.5, 0.2], [-0.2, 0.28], [-0.02, 0.4]]), false, 5), r * 0.1, EARTH.cloud);
        line(g, C.curve(put([[0.3, -0.26], [0.5, -0.2], [0.7, -0.26]]), false, 4), r * 0.085, EARTH.cloud);
        line(g, C.curve(put([[-0.5, 0.66], [-0.2, 0.6], [0.02, 0.68]]), false, 4), r * 0.075, EARTH.cloud);
        circ(g, 0, -r * 1.02, r * 0.3, EARTH.cloud);
        circ(g, r * 0.1, r * 1.05, r * 0.26, EARTH.cloud);
        g.restore();
        circ(g, 0, 0, r, null, lw);
        g.restore();
    }
    function sun(g, x, y, r, t) {
        const d = C.drawing(t), bob = d % 4 < 2 ? 0 : 2;
        C.burst(g, x, y, { r0: r * 1.18, r1: r * 1.5, n: 14, seed: 'sun', jitter: 0.08, rot: d % 2 ? 0.06 : 0, fill: K.gold, ink: K.ink, lw: 3.2 });
        g.save();
        g.translate(x, y + bob);
        circ(g, 0, 0, r, K.yellow, 3.2);
        for (const sx of [-1, 1]) {
            const cx = sx * r * 0.36;
            C.poly(g, [[cx - r * 0.3, -r * 0.22], [cx + r * 0.3, -r * 0.22], [cx + r * 0.25, r * 0.08], [cx + r * 0.12, r * 0.16], [cx - r * 0.12, r * 0.16], [cx - r * 0.25, r * 0.08]], { fill: '#1d1626', ink: K.ink, lw: 2.6 });
            line(g, [[cx - r * 0.16, r * 0.04], [cx - r * 0.02, -r * 0.12]], 2.4, '#ffffff');
        }
        line(g, [[-r * 0.1, -r * 0.18], [r * 0.1, -r * 0.18]], 4, K.ink);
        line(g, [[-r * 0.3, r * 0.42], [-r * 0.08, r * 0.52], [r * 0.14, r * 0.5], [r * 0.34, r * 0.36]], 3.2, K.ink);
        g.restore();
    }

    // =========================================================================================
    // The swap
    // =========================================================================================
    const HALO = { ring: '#ffe62e', light: '#fffbe8', side: '#e0a800' };
    /**
     * A spare halo: the angels' ring (skyward.js) without the wire. (x, y) its middle; s the
     * figure unit; o: { tilt, k (its size, 1), part: 'back' | 'front' (the far and the near half
     * of the ring, to put it round something; default the whole ring) }
     */
    function halo(g, x, y, s, o = {}) {
        const k = o.k ?? 1, L = 3.2 / (s * k), part = o.part ?? 'both';
        if (k <= 0) return;
        g.save();
        g.translate(x, y);
        g.rotate(o.tilt ?? 0);
        g.scale(s * k, s * k);
        g.lineCap = 'butt';
        g.lineJoin = 'round';
        const arcs = part === 'back' ? [[PI, TAU]] : part === 'front' ? [[0, PI]] : [[0, TAU]];
        for (const [a0, a1] of arcs) {
            const whole = a1 - a0 > TAU - 1e-6, ring = C.ellipsePts(0, 0, 0.36, 0.105, whole ? 36 : 18, 0, a0, a1);
            C.poly(g, ring, { ink: K.ink, lw: 0.075 + 2 * L, close: whole });
            C.poly(g, ring, { ink: HALO.ring, lw: 0.075, close: whole });
        }
        if (part !== 'back') C.poly(g, C.ellipsePts(0, 0.012, 0.36, 0.105, 18, 0, 0.25, PI - 0.25), { ink: HALO.side, lw: 0.03, close: false });
        if (part !== 'front') C.poly(g, C.ellipsePts(0, -0.014, 0.36, 0.105, 12, 0, PI + 0.5, PI + 1.5), { ink: HALO.light, lw: 0.026, close: false });
        g.restore();
    }
    // An angel's mitt, laid over the thing it holds: (x, y) the mitt's middle on screen.
    const SKIN = [['#b97a4f', '#d39a6f', '#96603a'], ['#f7c9a3', '#fcdfc6', '#e0a17b'], ['#f6c2a0', '#fbd9c2', '#dc9b78']];
    function mitt(g, x, y, s, who = 0, ang = -PI / 2) {
        const c = SKIN[who] ?? SKIN[0], w = 0.075 * s, l = 0.09 * s, u = [Math.cos(ang), Math.sin(ang)], n = [-u[1], u[0]];
        const q = cw([[x - u[0] * l - n[0] * w, y - u[1] * l - n[1] * w], [x + u[0] * l - n[0] * w, y + u[1] * l - n[1] * w], [x + u[0] * l + n[0] * w, y + u[1] * l + n[1] * w], [x - u[0] * l + n[0] * w, y - u[1] * l + n[1] * w]]);
        C.prism(g, q, [D[0] * 0.15 * s, D[1] * 0.15 * s], { front: c[0], top: c[1], side: c[2] }, { lw: 3.2 });
    }

    // =========================================================================================
    // The Devil's windmill
    // =========================================================================================
    const DP = Devil.P, SH = [Devil.TORSO.x + Devil.TORSO.w - 0.03, Devil.TORSO.y + 0.14]; // his picking arm's shoulder (screen right)
    const ARM = 0.66;
    function devilArm(g, L, sh, hand) {
        const w = 0.16, dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6, ux = dx / len, uy = dy / len, nx = -uy * w * 0.5, ny = ux * w * 0.5;
        const quad = (a, c, k = 1) => cw([[sh[0] + ux * a + nx * k, sh[1] + uy * a + ny * k], [sh[0] + ux * c + nx * k, sh[1] + uy * c + ny * k], [sh[0] + ux * c - nx * k, sh[1] + uy * c - ny * k], [sh[0] + ux * a - nx * k, sh[1] + uy * a - ny * k]]);
        const c0 = Math.max(0.03, len - 0.14), c1 = Math.max(0.06, len - 0.075);
        C.prism(g, quad(-0.05, c0), Dd(0.16), { front: DP.suit, top: DP.suitTop, side: DP.suitSide }, { lw: L, ink: DP.ink });
        C.prism(g, quad(c0, c1, 1.12), Dd(0.17), { front: DP.shirt, top: DP.shirt, side: '#d9d4e6' }, { lw: L, ink: DP.ink });
        C.prism(g, quad(c1, len + 0.11), Dd(0.16), { front: DP.skin, top: DP.skinTop, side: DP.skinSide }, { lw: L, ink: DP.ink });
    }
    const inBody = (g, x, y, s, o, fn) => {
        g.save();
        g.lineJoin = 'round';
        g.translate(x, y);
        g.scale(s, s);
        g.rotate((o.lean ?? 0) + 0.1 * clamp(o.solo ?? 0.5));
        g.scale(1 + (o.squash ?? 0), 1 - (o.squash ?? 0));
        fn();
        g.restore();
    };
    /**
     * The Devil's picking arm thrown out at the angle `a` (radians; -PI / 2 straight up, 0 out
     * to screen right), over a Devil drawn by Inferno.devilGuitar with `strum: NaN`.
     *   (x, y) his ground point on screen, s his scale;  o: { lean, squash, solo (his pose's),
     *   from: the angle the mitt came from on the drawing before (a white crescent is left) }
     */
    function windmill(g, x, y, s, a, o = {}) {
        inBody(g, x, y, s, o, () => {
            if (o.from != null) {
                const pts = [], n = 10;
                for (let j = 0; j <= n; j++) {
                    const th = lerp(o.from, a, j / n);
                    pts.push([SH[0] + Math.cos(th) * (ARM + 0.2), SH[1] + Math.sin(th) * (ARM + 0.2)]);
                }
                for (let j = n; j >= 0; j--) {
                    const u = j / n, th = lerp(o.from, a, u), r = ARM + 0.2 - 0.17 * u;
                    pts.push([SH[0] + Math.cos(th) * r, SH[1] + Math.sin(th) * r]);
                }
                C.poly(g, pts, { fill: K.white, lw: 0 });
            }
            devilArm(g, 3.2 / s, SH, [SH[0] + Math.cos(a) * ARM, SH[1] + Math.sin(a) * ARM]);
        });
    }
    // The end of his strap (his tail's spade, hanging off the guitar's spike), which devilGuitar
    // cannot place when `strum` is not a number. The same drawing, at rest.
    const ribbon = (pts) => {
        const A = [], B = [];
        for (let i = 0; i < pts.length; i++) {
            const [px, py, w] = pts[i], p = pts[Math.max(0, i - 1)], q = pts[Math.min(pts.length - 1, i + 1)];
            const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1e-6, nx = -dy / l, ny = dx / l;
            A.push([px + nx * w, py + ny * w]);
            B.push([px - nx * w, py - ny * w]);
        }
        return cw([...A, ...B.reverse()]);
    };
    function strapEnd(g, x, y, s, o = {}) {
        const solo = clamp(o.solo ?? 0.5), gAt = [lerp(-0.25, -0.03, solo), lerp(-0.45, -0.43, solo)], gAng = lerp(-0.27, -0.72, solo), L = 3.2 / s;
        const onG = (p) => {
            const r = rot(p, gAng);
            return [-(r[0] * 0.96 + gAt[0]), r[1] * 0.96 + gAt[1]];
        };
        inBody(g, x, y, s, o, () => {
            const e = onG([-0.47, 0.01]), sw = (o.tail ?? 0) * 2;
            const cl = C.curve([[e[0], e[1]], [e[0] + 0.08, e[1] + 0.05], [e[0] + 0.17, e[1] + 0.02 + sw], [e[0] + 0.2, e[1] - 0.09 + sw * 1.6], [e[0] + 0.14, e[1] - 0.18 + sw * 2]], false, 5);
            C.poly(g, ribbon(cl.map(([px, py], i) => [px, py, 0.03 - 0.012 * (i / (cl.length - 1))])), { fill: DP.skin, ink: K.ink, lw: L * 0.8 });
            const te = cl[cl.length - 1], tf = cl[cl.length - 3], ta = Math.atan2(te[1] - tf[1], te[0] - tf[0]);
            C.poly(g, cw([[-0.02, -0.02], [-0.05, -0.085], [0.04, -0.05], [0.13, 0], [0.04, 0.05], [-0.05, 0.085], [-0.02, 0.02]].map((p) => {
                const r = rot(p, ta);
                return [te[0] + r[0], te[1] + r[1]];
            })), { fill: DP.skin, ink: K.ink, lw: L * 0.8 });
        });
    }

    // =========================================================================================
    // The title
    // =========================================================================================
    /**
     * The film's title as its own solids, in Chorus1Props.title's look: RUNNIN' and DOWN A
     * white with banded ink sides on one line, DREAM yellow with red and orange bands under it.
     *   (x, y) the middle of the first line's baseline;  o: { at: [t1, t2, t3] when RUNNIN',
     *   DOWN A and DREAM land; k: size (1 = 104 and 196) }
     * Each letter pops on its word's own clock and then hops on the beat, alternately.
     */
    function title(g, t, x, y, o) {
        const [t1, t2, t3] = o.at, k = o.k ?? 1, P = S.pulseAt(t), ph = P.k + P.since;
        if (t < t1 - 1e-6) return;
        const word = (text, wx, wy, size, when, opt) =>
            C.text3d(g, text, wx, wy, {
                size, dir: [0.72, 0.7], ...opt,
                letter: (i) => {
                    const w = when(i), p = S.pop(t, w, 0.25);
                    if (p <= 0) return { hide: true };
                    const settled = t > w + 0.3;
                    return { s: p, rot: (i % 2 ? 1 : -1) * 0.035, dy: settled ? -8 * k * P.pulse * ((i + Math.floor(ph + 1e-6)) % 2 ? 1 : 0.35) : 0 };
                },
            });
        word("RUNNIN' DOWN A", x, y, 104 * k, (i) => (i < 7 ? t1 : t2), { face: K.white, side: K.ink, side2: K.white, bands: 4, depth: 14 * k, ow: 3.2, track: 1 });
        word('DREAM', x, y + 196 * k, 196 * k, () => t3, { face: K.yellow, side: K.red, side2: K.orange, bands: 3, depth: 27 * k, ow: 4.6, track: 4 });
    }

    // =========================================================================================
    // Moon dust, and the conductor's arms
    // =========================================================================================
    const DUST = { fill: '#fffffa', far: '#dcd6f7' };
    /**
     * Dust kicked up where something lands on the moon: puffs that leave (x, y) to both sides,
     * grow and thin out slowly (there is hardly any gravity). s: figure unit; age: seconds
     * since the landing (held on twos by the caller); o: { n (puffs, 6), w (how far apart the
     * wheels or feet are, in figure units), seed, life (seconds, 1.3), size (1) }
     */
    function dust(g, x, y, s, age, o = {}) {
        const life = o.life ?? 1.3;
        if (age < 0 || age >= life) return;
        const u = age / life, e = 1 - Math.pow(1 - u, 2.4), n = o.n ?? 6, w = o.w ?? 1, r = Motion.rng('solo5-dust:' + (o.seed ?? 0)), d = Math.round(age * 12);
        const list = [];
        for (let i = 0; i < n; i++) {
            const dir = i % 2 ? 1 : -1, reach = 0.4 + 1.2 * r(), rise = 0.15 + 0.7 * r(), size = (0.2 + 0.2 * r()) * (o.size ?? 1), nb = 5 + Math.floor(r() * 3), a0 = r() * TAU;
            const rad = size * Math.min(1, 0.45 + u * 2.6) * Math.pow(1 - u, 0.5) * (1 + 0.05 * (((d + i) % 2) * 2 - 1));
            list.push([x + (dir * (w * 0.5 + reach * e)) * s, y - (rise * e + rad * 0.5) * s, rad * s, nb, a0 + 0.4 * (((d + i * 2) % 3) - 1)]);
        }
        const parts = [];
        for (const [px, py, rad, nb, a0] of list) {
            if (!(rad > 0.5)) continue;
            parts.push([px, py, rad * 0.74]);
            for (let i = 0; i < nb; i++) {
                const a = a0 + (i / nb) * TAU;
                parts.push([px + Math.cos(a) * rad * 0.62, py + Math.sin(a) * rad * 0.62, rad * 0.4]);
            }
        }
        g.strokeStyle = K.ink;
        g.lineWidth = 6.4;
        for (const [px, py, rad] of parts) {
            g.beginPath();
            g.arc(px, py, rad, 0, TAU);
            g.stroke();
        }
        g.fillStyle = o.fill ?? DUST.fill;
        for (const [px, py, rad] of parts) {
            g.beginPath();
            g.arc(px, py, rad, 0, TAU);
            g.fill();
        }
    }
    /**
     * The cactus conducting: its two arms as paths for Verse2aProps.cactus (armL, armR).
     *   side  -1 both arms sweep to screen left (it gives the phrase to whoever is there), 1 to
     *         the right, 0 both up and out (everybody);  k  -1..1 the beat's swing
     */
    function conduct(side, k = 0) {
        const hw = 0.21, bend = (pts) => C.curve(pts, false, 7);
        if (side === 0) {
            const up = 0.34 + 0.2 * k;
            return {
                armL: { pts: bend([[-hw + 0.06, -1.05], [-0.5, -1.08], [-0.62 - 0.06 * k, -1.2 - up * 0.5], [-0.66 - 0.1 * k, -1.34 - up]]), w: 0.18 },
                armR: { pts: bend([[hw - 0.06, -1.2], [0.5, -1.23], [0.62 + 0.06 * k, -1.35 - up * 0.5], [0.66 + 0.1 * k, -1.49 - up]]), w: 0.18 },
            };
        }
        const sx = side, lift = 0.1 * k;
        // the arm on that side points out and a little up; the other comes across in front of the trunk
        const out = bend([[sx * (hw - 0.06), -1.12], [sx * 0.5, -1.16 - lift], [sx * 0.8, -1.3 - lift * 2], [sx * 1.02, -1.5 - lift * 3]]);
        const over = bend([[-sx * (hw - 0.06), -1.3], [-sx * 0.46, -1.36], [-sx * 0.5, -1.62 - lift], [-sx * 0.16, -1.86 - lift * 2], [sx * 0.34, -1.9 - lift * 3]]);
        return sx < 0 ? { armL: { pts: out, w: 0.18 }, armR: { pts: over, w: 0.18 } } : { armR: { pts: out, w: 0.18 }, armL: { pts: over, w: 0.18 } };
    }

    return { PINK, ORANGE, YELLOW, BANDS, EDGES, field, sky, earth, sun, halo, mitt, windmill, strapEnd, title, dust, conduct, mix, HALO };
})();
