// illomotion core: utilities shared by every style.
// Loaded as a classic <script> in engine/player.html; it defines two globals: Motion and Ease.
//
// A scene is declared like this (see .claude/skills/engine/SKILL.md):
//
//   Motion.scene({
//       fps: 24, duration: 6.5, logical: [1600, 900],
//       uses: ['styles/paper-cutout/paper.js'],           // paths from the repo root
//       fonts: [{ family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
//       bpm: 120, beatOffset: 0,                          // optional: musical grid
//       shots: [[0, 3, 'Intro'], [3, 6.5, 'Outro']],      // optional: edit
//       setup(env) { ... },                               // once, after fonts load
//       draw(g, t, env) { ... },                          // paints second t
//   });
const Motion = (() => {
    let def = null;

    function hashStr(s) {
        let h = 2166136261 >>> 0;
        for (const c of String(s)) {
            h ^= c.charCodeAt(0);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }

    // mulberry32: the same seed always gives the same sequence
    function rng(seed) {
        let a = typeof seed === 'number' ? seed >>> 0 : hashStr(seed);
        return () => {
            a |= 0;
            a = (a + 0x6d2b79f5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    // Smooth, deterministic 1D noise: value in [-1, 1] for any real x.
    function noise1(seed, x) {
        const i = Math.floor(x), f = x - i;
        const v = (n) => rng(hashStr(seed) ^ Math.imul(n, 2654435761))() * 2 - 1;
        const s = f * f * (3 - 2 * f);
        return v(i) + (v(i + 1) - v(i)) * s;
    }

    // --- sprite cache: expensive things are painted once at output resolution -----
    const cache = new Map();
    function sprite(key, box, scale, drawFn) {
        const k = key + '@' + scale.toFixed(4);
        if (!cache.has(k)) {
            const c = document.createElement('canvas');
            c.width = Math.max(1, Math.ceil(box.w * scale));
            c.height = Math.max(1, Math.ceil(box.h * scale));
            const g = c.getContext('2d');
            g.scale(scale, scale);
            g.translate(-box.x, -box.y);
            drawFn(g);
            cache.set(k, c);
        }
        const c = cache.get(k);
        return { canvas: c, box, draw: (ctx) => ctx.drawImage(c, box.x, box.y, box.w, box.h) };
    }

    // --- edit ----------------------------------------------------------------------
    // shots: [[start, end, name, fn?], ...] in seconds. Returns the active shot
    // and the local time inside it.
    function shotAt(shots, t) {
        const s = shots.find(([a, b]) => t >= a && t < b) ?? shots[shots.length - 1];
        return { shot: s, name: s[2], t0: s[0], t1: s[1], local: t - s[0], u: Ease.seg(t, s[0], s[1]) };
    }

    // --- rhythm --------------------------------------------------------------------
    const beatLen = (bpm) => 60 / bpm;
    // 1 right on the beat, then falls fast: for bounces and flashes in time
    const pulse = (t, bpm = 120, offset = 0, decay = 9) => {
        const L = beatLen(bpm);
        return Math.exp(-((((t - offset) % L) + L) % L) * decay);
    };
    const beatIndex = (t, bpm = 120, offset = 0) => Math.floor((t - offset) / beatLen(bpm));
    const onBeat = (t, bpm = 120, offset = 0) => Math.round((t - offset) / beatLen(bpm)) * beatLen(bpm) + offset;

    // --- camera --------------------------------------------------------------------
    function cam(g, env, cx, cy, zoom = 1, rot = 0) {
        g.translate(env.W / 2, env.H / 2);
        g.rotate(rot);
        g.scale(zoom, zoom);
        g.translate(-cx, -cy);
    }
    // deterministic shake (depends only on t)
    function shake(g, amt, t) {
        if (amt > 0) g.translate(Math.sin(t * 97) * amt, Math.cos(t * 83) * amt);
    }
    // Interpolates keyframes [[t, value], ...] with inOut between each pair.
    function keys(frames, t, ease = Ease.inOut) {
        if (t <= frames[0][0]) return frames[0][1];
        for (let i = 1; i < frames.length; i++) {
            const [t1, v1] = frames[i], [t0, v0] = frames[i - 1];
            if (t < t1) {
                const u = ease(Ease.seg(t, t0, t1));
                return Array.isArray(v0) ? v0.map((x, j) => Ease.lerp(x, v1[j], u)) : Ease.lerp(v0, v1, u);
            }
        }
        return frames[frames.length - 1][1];
    }

    // --- layers: offscreen canvases at output size ----------------------------------
    // For transitions and effects that need the shot already painted as an image.
    // layer(env, 'a', (g) => paintShotA(g)) returns the canvas with the shot painted
    // in logical coordinates; draw it on top with drawLayer(g, env, canvas).
    const layers = new Map();
    function layer(env, name, drawFn) {
        let c = layers.get(name);
        if (!c || c.width !== env.px[0] || c.height !== env.px[1]) {
            c = document.createElement('canvas');
            c.width = env.px[0];
            c.height = env.px[1];
            layers.set(name, c);
        }
        const g = c.getContext('2d');
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalAlpha = 1;
        g.globalCompositeOperation = 'source-over';
        g.filter = 'none';
        g.clearRect(0, 0, c.width, c.height);
        g.setTransform(env.k, 0, 0, env.k, 0, 0);
        g.save();
        drawFn(g);
        g.restore();
        return c;
    }
    const drawLayer = (g, env, c) => g.drawImage(c, 0, 0, env.W, env.H);

    // --- image onto any quadrilateral (fake perspective, bending, flipping) ----------
    // Canvas 2D only has affine transforms, so the quad is split into an n×n grid of
    // triangles, each drawn with its own affine map. quad: [tl, tr, br, bl] in the current
    // coordinates; src: a canvas/image; box: the source rect (defaults to the whole image).
    // o.bend(u, v) → [dx, dy] optional displacement to curl the surface (u, v in 0..1).
    function quad(g, src, q, n = 8, box = null, o = {}) {
        const sw = box ? box.w : src.width, sh = box ? box.h : src.height, sx0 = box ? box.x : 0, sy0 = box ? box.y : 0;
        const at = (u, v) => {
            const top = [q[0][0] + (q[1][0] - q[0][0]) * u, q[0][1] + (q[1][1] - q[0][1]) * u];
            const bot = [q[3][0] + (q[2][0] - q[3][0]) * u, q[3][1] + (q[2][1] - q[3][1]) * u];
            const p = [top[0] + (bot[0] - top[0]) * v, top[1] + (bot[1] - top[1]) * v];
            if (o.bend) {
                const [dx, dy] = o.bend(u, v);
                p[0] += dx;
                p[1] += dy;
            }
            return p;
        };
        const tri = (s0, s1, s2, d0, d1, d2) => {
            // affine map from source triangle to destination triangle
            const [x0, y0] = s0, [x1, y1] = s1, [x2, y2] = s2;
            const det = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
            if (Math.abs(det) < 1e-9) return;
            const a = ((d1[0] - d0[0]) * (y2 - y0) - (d2[0] - d0[0]) * (y1 - y0)) / det;
            const b = ((d1[1] - d0[1]) * (y2 - y0) - (d2[1] - d0[1]) * (y1 - y0)) / det;
            const c = ((d2[0] - d0[0]) * (x1 - x0) - (d1[0] - d0[0]) * (x2 - x0)) / det;
            const d = ((d2[1] - d0[1]) * (x1 - x0) - (d1[1] - d0[1]) * (x2 - x0)) / det;
            const e = d0[0] - a * x0 - c * y0, f = d0[1] - b * x0 - d * y0;
            // clip to the destination triangle, grown by ~1 unit so neighbours overlap (no seams)
            const cx = (d0[0] + d1[0] + d2[0]) / 3, cy = (d0[1] + d1[1] + d2[1]) / 3;
            const grow = (p) => {
                const dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1;
                return [p[0] + (dx / l) * 1.1, p[1] + (dy / l) * 1.1];
            };
            const [g0, g1, g2] = [grow(d0), grow(d1), grow(d2)];
            g.save();
            g.beginPath();
            g.moveTo(g0[0], g0[1]);
            g.lineTo(g1[0], g1[1]);
            g.lineTo(g2[0], g2[1]);
            g.closePath();
            g.clip();
            g.transform(a, b, c, d, e, f);
            g.drawImage(src, 0, 0);
            g.restore();
        };
        for (let j = 0; j < n; j++) {
            for (let i = 0; i < n; i++) {
                const u0 = i / n, u1 = (i + 1) / n, v0 = j / n, v1 = (j + 1) / n;
                const s = (u, v) => [sx0 + u * sw, sy0 + v * sh];
                const p00 = at(u0, v0), p10 = at(u1, v0), p11 = at(u1, v1), p01 = at(u0, v1);
                tri(s(u0, v0), s(u1, v0), s(u1, v1), p00, p10, p11);
                tri(s(u0, v0), s(u1, v1), s(u0, v1), p00, p11, p01);
            }
        }
    }

    return {
        scene: (d) => { def = d; },
        get def() { return def; },
        hashStr, rng, noise1, sprite, cache, shotAt, beatLen, pulse, beatIndex, onBeat, cam, shake, keys, layer, drawLayer, quad,
    };
})();

// Timing curves. x in [0, 1].
const Ease = {
    clamp: (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)),
    seg: (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a))),
    linear: (x) => x,
    inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    out: (x) => 1 - Math.pow(1 - x, 3),
    in: (x) => x * x * x,
    back: (x) => {
        const c1 = 1.7, c3 = c1 + 1;
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    },
    elastic: (x) => (x === 0 || x === 1 ? x : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
    // 0→1→0 over [a, a+dur]
    bump: (t, a, dur) => Math.sin(Ease.seg(t, a, a + dur) * Math.PI),
    // appears with a bounce at `at`
    pop: (t, at, dur = 0.35) => (t < at ? 0 : Ease.back(Ease.seg(t, at, at + dur))),
    lerp: (a, b, t) => a + (b - a) * t,
    lerpPt: (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t],
};
