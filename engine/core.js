// Núcleo de illomotion: utilidades comunes a todos los estilos.
// Se carga como <script> clásico en engine/player.html y deja dos globales: Motion y Ease.
//
// Una escena se declara así (ver .claude/skills/motor/SKILL.md):
//
//   Motion.scene({
//       fps: 24, duration: 6.5, logical: [1600, 900],
//       uses: ['styles/papel-recortado/paper.js'],        // rutas desde la raíz del repo
//       fonts: [{ family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
//       bpm: 120, beatOffset: 0,                          // opcional: rejilla musical
//       shots: [[0, 3, 'Entrada'], [3, 6.5, 'Cierre']],   // opcional: montaje
//       setup(env) { ... },                               // una vez, tras cargar fuentes
//       draw(g, t, env) { ... },                          // pinta el segundo t
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

    // mulberry32: la misma semilla da siempre la misma secuencia
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

    // Ruido 1D suave y determinista: valor en [-1, 1] para cualquier x real.
    function noise1(seed, x) {
        const i = Math.floor(x), f = x - i;
        const v = (n) => rng(hashStr(seed) ^ Math.imul(n, 2654435761))() * 2 - 1;
        const s = f * f * (3 - 2 * f);
        return v(i) + (v(i + 1) - v(i)) * s;
    }

    // --- caché de sprites: lo caro se pinta una vez a resolución de salida ---------
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

    // --- montaje -------------------------------------------------------------------
    // shots: [[inicio, fin, nombre, fn?], ...] en segundos. Devuelve el plano activo
    // y el tiempo local dentro de él.
    function shotAt(shots, t) {
        const s = shots.find(([a, b]) => t >= a && t < b) ?? shots[shots.length - 1];
        return { shot: s, name: s[2], t0: s[0], t1: s[1], local: t - s[0], u: Ease.seg(t, s[0], s[1]) };
    }

    // --- ritmo ---------------------------------------------------------------------
    const beatLen = (bpm) => 60 / bpm;
    // 1 justo en el golpe y cae rápido: para rebotes y destellos al compás
    const pulse = (t, bpm = 120, offset = 0, decay = 9) => {
        const L = beatLen(bpm);
        return Math.exp(-((((t - offset) % L) + L) % L) * decay);
    };
    const beatIndex = (t, bpm = 120, offset = 0) => Math.floor((t - offset) / beatLen(bpm));
    const onBeat = (t, bpm = 120, offset = 0) => Math.round((t - offset) / beatLen(bpm)) * beatLen(bpm) + offset;

    // --- cámara --------------------------------------------------------------------
    function cam(g, env, cx, cy, zoom = 1, rot = 0) {
        g.translate(env.W / 2, env.H / 2);
        g.rotate(rot);
        g.scale(zoom, zoom);
        g.translate(-cx, -cy);
    }
    // temblor determinista (depende solo de t)
    function shake(g, amt, t) {
        if (amt > 0) g.translate(Math.sin(t * 97) * amt, Math.cos(t * 83) * amt);
    }
    // Interpola por fotogramas clave [[t, valor], ...] con inOut entre cada par.
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

    return {
        scene: (d) => { def = d; },
        get def() { return def; },
        hashStr, rng, noise1, sprite, cache, shotAt, beatLen, pulse, beatIndex, onBeat, cam, shake, keys,
    };
})();

// Curvas de tiempo. x en [0, 1].
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
    // 0→1→0 en [a, a+dur]
    bump: (t, a, dur) => Math.sin(Ease.seg(t, a, a + dur) * Math.PI),
    // aparece con rebote en `at`
    pop: (t, at, dur = 0.35) => (t < at ? 0 : Ease.back(Ease.seg(t, at, at + dur))),
    lerp: (a, b, t) => a + (b - a) * t,
    lerpPt: (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t],
};
