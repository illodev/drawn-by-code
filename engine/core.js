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

    return {
        scene: (d) => { def = d; },
        get def() { return def; },
        hashStr, rng, noise1, sprite, cache, shotAt, beatLen, pulse, beatIndex, onBeat, cam, shake, keys, layer, drawLayer,
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
