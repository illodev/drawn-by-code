// drawn-by-code core: utilities shared by every style.
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
    // Interpolates keyframes [[t, value], ...] (value: a number or an array of numbers).
    // A third entry [t, value, ease] shapes the segment that ARRIVES at that key, so one
    // move can ease out of a pose and overshoot into the next; the others use `ease`
    // (inOut by default). Eases are functions or Ease.get strings ('power3.out').
    function keys(frames, t, ease = Ease.inOut) {
        if (t <= frames[0][0]) return frames[0][1];
        for (let i = 1; i < frames.length; i++) {
            const [t1, v1, e1] = frames[i], [t0, v0] = frames[i - 1];
            if (t < t1) {
                const u = Ease.get(e1 ?? ease)(Ease.seg(t, t0, t1));
                return Array.isArray(v0) ? v0.map((x, j) => Ease.lerp(x, v1[j], u)) : Ease.lerp(v0, v1, u);
            }
        }
        return frames[frames.length - 1][1];
    }

    // --- choreography (ported from GSAP's stagger and timeline position parameter) ---
    // stagger(i, n, opts): the delay in seconds of item i out of n. It grows with the
    // item's distance from `from`, measured in items (or grid cells):
    //   each    seconds per item of distance (a number instead of opts means { each })
    //   amount  total spread, nearest to farthest item (overrides each)
    //   from    'start' (default) | 'center' | 'end' | 'edges' (edges first, centre last)
    //           | 'random' (a shuffled order, fixed by `seed`) | an index | [fx, fy] in 0..1 of the grid
    //   grid    [rows, cols]: items laid out row by row, distance measured in 2D
    //   axis    'x' | 'y': only that axis of the grid counts
    //   ease    how the delays are spread ('power2.in' bunches the first ones together)
    // Unlike GSAP, `each` is always the gap between neighbours, also from 'center'.
    const staggerCache = new Map();
    function staggerTable(n, o) {
        const key = JSON.stringify([n, o.from, o.grid, o.axis, o.seed]);
        let d = staggerCache.get(key);
        if (d) return d;
        const [rows, cols] = o.grid ?? [1, n];
        const from = o.from ?? 'start';
        let ox, oy;
        if (typeof from === 'number') {
            ox = from % cols;
            oy = Math.floor(from / cols);
        } else if (Array.isArray(from)) {
            ox = from[0] * (cols - 1);
            oy = from[1] * (rows - 1);
        } else {
            const r = { start: 0, center: 0.5, edges: 0.5, end: 1, random: 0 }[from];
            if (r === undefined) throw new Error(`stagger: unknown from "${from}"`);
            ox = r * (cols - 1);
            oy = r * (rows - 1);
        }
        d = [];
        for (let j = 0; j < n; j++) {
            const x = (j % cols) - ox, y = Math.floor(j / cols) - oy;
            d.push(o.axis === 'x' ? Math.abs(x) : o.axis === 'y' ? Math.abs(y) : Math.hypot(x, y));
        }
        if (from === 'random') {
            const r = rng(o.seed ?? 'stagger');
            for (let j = n - 1; j > 0; j--) {
                const k = Math.floor(r() * (j + 1));
                [d[j], d[k]] = [d[k], d[j]];
            }
        }
        const min = Math.min(...d), max = Math.max(...d);
        d = d.map((v) => (from === 'edges' ? max - v : v - min));
        d.span = max - min;
        staggerCache.set(key, d);
        return d;
    }
    function stagger(i, n, o = {}) {
        if (typeof o === 'number') o = { each: o };
        if (o.each == null && o.amount == null) throw new Error('stagger: give `each` or `amount`');
        if (n <= 1) return 0;
        const d = staggerTable(n, o);
        if (!d.span) return 0;
        const total = o.amount ?? o.each * d.span;
        return total * Ease.get(o.ease ?? 'none')(d[i] / d.span);
    }

    // seq(items, opts): a GSAP-style timeline resolved once (in setup, or at the top of
    // scene.js) and read every frame. It only computes start and end times, so frames
    // stay a pure function of t.
    //   items: [name, dur, at?, opts?] | { name, dur, at, ...opts } | { label, at }
    //   at (GSAP's position parameter):
    //     omitted        at the end of the sequence so far
    //     2.5            an absolute second (from opts.start)
    //     '+=0.3' '-=0.3'  after / overlapping the end of the sequence ('-=25%': a quarter
    //                    of this item's own duration)
    //     '<' '>'        the start / end of the previous item; '<0.2', '>-0.1', '<50%'
    //                    (offsets in seconds or % of the previous item's duration)
    //     'hit' 'hit+=0.2' 'hit-=0.2'  a label
    //   opts: ease (default for u), n + stagger (n copies, each delayed by
    //   Motion.stagger(i, n, stagger); the group counts as one item for '<' and '>').
    //   seq opts: start (second the sequence begins), ease (default for every item;
    //   GSAP's own default is 'power1.out').
    // Returns { u(name, t, ease?, i?) → eased 0..1, span(name, i?) → [t0, t1],
    //   label(name), end, items }.
    function seq(list, opts = {}) {
        const start = opts.start ?? 0, defEase = opts.ease ?? 'power1.out';
        const byName = new Map(), labels = new Map(), items = [];
        let end = start, prev = null;
        const num = (s, of) => (s.endsWith('%') ? (parseFloat(s) / 100) * of : parseFloat(s));
        const resolve = (at, dur) => {
            if (at == null) return end;
            if (typeof at === 'number') return start + at;
            let m = /^([+-])=(\d*\.?\d+%?)$/.exec(at);
            if (m) return end + (m[1] === '+' ? 1 : -1) * num(m[2], dur);
            m = /^([<>])([+-]?\d*\.?\d+%?)?$/.exec(at);
            if (m) {
                const base = prev ? (m[1] === '<' ? prev.t0 : prev.t1) : start;
                return base + (m[2] ? num(m[2], prev ? prev.t1 - prev.t0 : 0) : 0);
            }
            m = /^(.+?)(?:([+-])=(\d*\.?\d+))?$/.exec(at);
            if (m && labels.has(m[1])) return labels.get(m[1]) + (m[2] ? (m[2] === '+' ? 1 : -1) * parseFloat(m[3]) : 0);
            throw new Error(`seq: cannot place at "${at}" (unknown label or syntax)`);
        };
        for (const entry of list) {
            if (!Array.isArray(entry) && entry.label != null) {
                labels.set(entry.label, resolve(entry.at, 0));
                continue;
            }
            const it = Array.isArray(entry)
                ? { name: entry[0], dur: entry[1], at: entry[2], ...(entry[3] ?? {}) }
                : { ...entry };
            if (it.name == null || !(it.dur >= 0)) throw new Error(`seq: every item needs a name and a duration (${JSON.stringify(entry)})`);
            if (byName.has(it.name)) throw new Error(`seq: duplicate name "${it.name}"`);
            const t0 = resolve(it.at, it.dur), n = it.n ?? 1;
            const delays = Array.from({ length: n }, (_, i) => (n > 1 ? stagger(i, n, it.stagger ?? {}) : 0));
            const item = { name: it.name, dur: it.dur, n, t0, t1: t0 + Math.max(...delays) + it.dur, delays, ease: it.ease };
            items.push(item);
            byName.set(it.name, item);
            prev = item;
            end = Math.max(end, item.t1);
        }
        const get = (name) => {
            const it = byName.get(name);
            if (!it) throw new Error(`seq: no item "${name}"`);
            return it;
        };
        const span = (name, i) => {
            const it = get(name);
            if (i == null) return [it.t0, it.t1];
            const a = it.t0 + it.delays[i];
            return [a, a + it.dur];
        };
        return {
            items, end,
            span,
            label: (name) => {
                if (!labels.has(name)) throw new Error(`seq: no label "${name}"`);
                return labels.get(name);
            },
            // i: one copy of a staggered group; without it, the whole group's span
            u(name, t, ease, i) {
                const it = get(name);
                const [a, b] = span(name, it.n > 1 ? i : null);
                return Ease.get(ease ?? it.ease ?? defEase)(b > a ? Ease.seg(t, a, b) : t >= a ? 1 : 0);
            },
        };
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
        hashStr, rng, noise1, sprite, cache, shotAt, beatLen, pulse, beatIndex, onBeat, cam, shake, keys, stagger, seq, layer, drawLayer, quad,
    };
})();

// Timing curves. x in [0, 1].
//
// The short names (in / out / inOut = cubic, back, elastic) keep their original values.
// The families below are ported from GSAP (same formulas, same names), so a curve
// named in a motion spec or a GSAP/After Effects habit means the same thing here:
//   Ease.power3.out(x)   Ease.sine.inOut(x)   Ease.get('back.out(2.2)')(x)
// Ease.get(spec) takes a function or a GSAP-style string and is cached, so it is cheap
// to call every frame. See the engine skill («Timing») for which curve fits which move.
const Ease = (() => {
    const PI = Math.PI, HALF_PI = PI / 2, TAU = PI * 2;

    // A family from its in-curve: out mirrors it, inOut joins the two halves (as in GSAP).
    const family = (easeIn, easeOut = (p) => 1 - easeIn(1 - p),
        easeInOut = (p) => (p < 0.5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2)) =>
        ({ in: easeIn, out: easeOut, inOut: easeInOut });
    // inOut built from an out-curve (GSAP uses it for elastic)
    const inOutFromOut = (easeOut) => (p) => (p < 0.5 ? (1 - easeOut(1 - p * 2)) / 2 : 0.5 + easeOut((p - 0.5) * 2) / 2);
    const pick = (fam, type) => {
        const f = fam[type ?? 'out'];
        if (!f) throw new Error(`Unknown ease type "${type}" (in, out or inOut)`);
        return f;
    };

    const linear = (p) => p;
    const none = { in: linear, out: linear, inOut: linear };
    // power1 = quad, power2 = cubic, power3 = quart, power4 = quint
    const power = (n) => (n === 0 ? none : family((p) => p ** (n + 1)));

    const bounceOut = (p) => {
        const n1 = 7.5625, c = 2.75;
        if (p < 1 / c) return n1 * p * p;
        if (p < 2 / c) return n1 * (p - 1.5 / c) ** 2 + 0.75;
        if (p < 2.5 / c) return n1 * (p - 2.25 / c) ** 2 + 0.9375;
        return n1 * (p - 2.625 / c) ** 2 + 0.984375;
    };

    // overshoot: how far it passes the target (GSAP default 1.70158 ≈ 10%)
    const back = (type, overshoot = 1.70158) =>
        pick(family((p) => (p ? p * p * ((overshoot + 1) * p - overshoot) : 0)), type);

    // amplitude ≥ 1 swings further; period: seconds-free length of one wobble (smaller = faster)
    const elastic = (type, amplitude = 1, period) => {
        const p1 = amplitude >= 1 ? amplitude : 1;
        const per = (period || (type === 'inOut' ? 0.45 : 0.3)) / (amplitude < 1 ? amplitude : 1);
        const p3 = (per / TAU) * (Math.asin(1 / p1) || 0);
        const w = TAU / per;
        const easeOut = (p) => (p === 1 ? 1 : p1 * 2 ** (-10 * p) * Math.sin((p - p3) * w) + 1);
        if (type === 'in') return (p) => 1 - easeOut(1 - p);
        if (type === 'inOut') return inOutFromOut(easeOut);
        return easeOut;
    };

    // n held values, like a stop-motion move (immediateStart jumps at the very start)
    const steps = (n = 1, immediateStart = false) => {
        const p1 = 1 / n, p2 = n + (immediateStart ? 0 : 1), p3 = immediateStart ? 1 : 0, max = 1 - 1e-8;
        return (p) => (Math.floor(p2 * Math.max(0, Math.min(max, p))) + p3) * p1;
    };

    // CSS / After Effects / Figma cubic-bezier(x1, y1, x2, y2)
    const bezier = (x1, y1, x2, y2) => {
        x1 = Math.max(0, Math.min(1, x1));
        x2 = Math.max(0, Math.min(1, x2));
        const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
        const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
        const sx = (s) => ((ax * s + bx) * s + cx) * s;
        const sy = (s) => ((ay * s + by) * s + cy) * s;
        const dsx = (s) => (3 * ax * s + 2 * bx) * s + cx;
        const solve = (x) => {
            let s = x;
            for (let i = 0; i < 8; i++) {
                const e = sx(s) - x;
                if (Math.abs(e) < 1e-7) return s;
                const d = dsx(s);
                if (Math.abs(d) < 1e-6) break;
                s -= e / d;
            }
            let lo = 0, hi = 1;
            s = x;
            for (let i = 0; i < 50 && hi - lo > 1e-9; i++) {
                if (sx(s) < x) lo = s;
                else hi = s;
                s = (lo + hi) / 2;
            }
            return s;
        };
        return (x) => (x <= 0 ? 0 : x >= 1 ? 1 : sy(solve(x)));
    };

    // n oscillations that start and end at 0 (a buzz, a «no», a bell, a nudge):
    // multiply by an amplitude. out = fades, inOut = swells then fades, uniform = constant.
    // Inspired by GSAP's CustomWiggle, not a copy of its curves.
    const wiggle = (n = 6, type = 'out') => {
        const env = { out: (p) => 1 - p, inOut: (p) => Math.sin(p * PI), uniform: () => 1 }[type];
        if (!env) throw new Error(`Unknown wiggle type "${type}" (out, inOut or uniform)`);
        return (p) => Math.sin(p * n * TAU) * env(p);
    };

    // A damped spring from 0 to 1, solved in closed form: no simulation and no state, so
    // any second can be asked in any order. The parameters follow anime.js v4's spring()
    // (MIT); the bounce/duration mapping is SwiftUI's. Set it one of two ways:
    //   { bounce, duration }  as a designer says it. duration: seconds of one swing
    //                         (≈ when it looks arrived); bounce 0 = no overshoot, 0.3 ≈ 5 %,
    //                         0.5 ≈ 16 %, 0.7 ≈ 37 %; below 0 = overdamped (slower, no swing).
    //   { mass, stiffness, damping }  physical (anime.js defaults 1, 100, 10 ≈ bounce 0.5).
    //   velocity  starting speed in distances per second (motion carried in from a throw).
    // Returns an ease over its own settle time, so it works anywhere an ease does (seq,
    // keys, Ease.get('spring(0.3, 0.5)')), plus:
    //   s.at(seconds)   the value that many seconds after it starts (0 before, 1 once settled)
    //   s.vel(seconds)  its speed then, in distances per second (to hand off to the next spring)
    //   s.settle        seconds until it stays within 0.01 % of the target: give seq this
    //                   as the item's duration so the curve keeps its real timing.
    const springCache = new Map();
    const spring = (o = {}) => {
        const key = JSON.stringify(o);
        if (springCache.has(key)) return springCache.get(key);
        let w0, zeta;
        if (o.mass != null || o.stiffness != null || o.damping != null) {
            const m = o.mass ?? 1, k = o.stiffness ?? 100, c = o.damping ?? 10;
            if (!(m > 0 && k > 0 && c >= 0)) throw new Error(`spring: mass and stiffness must be > 0, damping ≥ 0 (${key})`);
            w0 = Math.sqrt(k / m);
            zeta = c / (2 * Math.sqrt(k * m));
        } else {
            const b = o.bounce ?? 0.3, d = o.duration ?? 0.5;
            if (!(b > -1 && b < 1 && d > 0)) throw new Error(`spring: bounce must be in (−1, 1) and duration > 0 (${key})`);
            w0 = TAU / d;
            zeta = b >= 0 ? 1 - b : 1 / (1 + b);
        }
        if (zeta < 0.02) throw new Error(`spring: too little damping, it would never settle (${key})`);
        const v0 = o.velocity ?? 0;
        // e(τ) = x(τ) − 1, with e(0) = −1 and e'(0) = v0
        let e, de, bound;
        if (Math.abs(zeta - 1) < 1e-6) {
            const B = v0 - w0;
            e = (s) => Math.exp(-w0 * s) * (-1 + B * s);
            de = (s) => Math.exp(-w0 * s) * (B + w0 - w0 * B * s);
            bound = (s) => Math.exp(-w0 * s) * (1 + Math.abs(B) * s);
        } else if (zeta < 1) {
            const wd = w0 * Math.sqrt(1 - zeta * zeta), a = zeta * w0, B = (v0 - a) / wd;
            e = (s) => Math.exp(-a * s) * (-Math.cos(wd * s) + B * Math.sin(wd * s));
            de = (s) => Math.exp(-a * s) * ((a + B * wd) * Math.cos(wd * s) + (wd - a * B) * Math.sin(wd * s));
            bound = (s) => Math.exp(-a * s) * Math.hypot(1, B);
        } else {
            const q = w0 * Math.sqrt(zeta * zeta - 1), r1 = -zeta * w0 + q, r2 = -zeta * w0 - q;
            const C2 = (v0 + r1) / (r2 - r1), C1 = -1 - C2;
            e = (s) => C1 * Math.exp(r1 * s) + C2 * Math.exp(r2 * s);
            de = (s) => C1 * r1 * Math.exp(r1 * s) + C2 * r2 * Math.exp(r2 * s);
            bound = (s) => Math.abs(C1) * Math.exp(r1 * s) + Math.abs(C2) * Math.exp(r2 * s);
        }
        // settle: past the first time the envelope stays under eps, then back to the last
        // real crossing (the envelope alone would leave a long invisible tail)
        const eps = 1e-4;
        let T = 1 / w0;
        while (bound(T) >= eps && T < 600) T *= 1.5;
        let settle = T;
        const n = 4000, h = T / n;
        for (let j = n; j >= 0; j--) {
            if (Math.abs(e(j * h)) >= eps) {
                settle = Math.min(T, (j + 1) * h);
                break;
            }
        }
        const at = (s) => (s <= 0 ? 0 : s >= settle ? 1 : 1 + e(s));
        const f = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 + e(p * settle));
        f.at = at;
        f.vel = (s) => (s < 0 ? 0 : s >= settle ? 0 : de(s));
        f.settle = settle;
        f.zeta = zeta;
        springCache.set(key, f);
        return f;
    };

    const families = {
        none, linear: none,
        power0: none, power1: power(1), power2: power(2), power3: power(3), power4: power(4),
        sine: family((p) => (p === 1 ? 1 : 1 - Math.cos(p * HALF_PI))),
        // GSAP ≥ 3.15's blend: plain 2^(10(p−1)) starts at 0.001, not 0
        expo: family((p) => 2 ** (10 * (p - 1)) * p + p ** 6 * (1 - p)),
        circ: family((p) => -(Math.sqrt(1 - p * p) - 1)),
        bounce: family((p) => 1 - bounceOut(1 - p), bounceOut),
    };
    families.quad = families.power1;
    families.cubic = families.power2;
    families.quart = families.power3;
    families.quint = families.strong = families.power4;

    // 'power3.out', 'sine.inOut', 'expo' (= .out, as in GSAP), 'none', 'back.out(2.2)',
    // 'elastic.out(1, 0.4)', 'steps(6)', 'wiggle(5)', 'wiggle.inOut(5)',
    // 'cubic-bezier(.2, .8, .2, 1)', 'spring(bounce, duration, velocity?)',
    // or the short names 'in', 'out', 'inOut'.
    const cache = new Map();
    const parse = (spec) => {
        const m = /^\s*([a-zA-Z][\w-]*?)(?:\.(\w+))?\s*(?:\(([^)]*)\))?\s*$/.exec(spec);
        if (!m) throw new Error(`Unreadable ease "${spec}"`);
        const name = m[1].toLowerCase(), type = m[2];
        const types = name === 'wiggle' ? ['out', 'inOut', 'uniform'] : ['in', 'out', 'inOut'];
        if (type && !types.includes(type)) throw new Error(`Ease "${spec}": type must be ${types.join(', ')}`);
        const args = m[3] ? m[3].split(',').map((s) => s.trim()).filter(Boolean).map(Number) : [];
        if (args.some(Number.isNaN)) throw new Error(`Ease "${spec}": arguments must be numbers`);
        if (!type && !args.length && ['in', 'out', 'inout'].includes(name)) return Ease[name === 'inout' ? 'inOut' : name];
        if (families[name]) return pick(families[name], type);
        if (name === 'back') return back(type, ...args);
        if (name === 'elastic') return elastic(type ?? 'out', ...args);
        if (name === 'steps') return steps(...args);
        if (name === 'wiggle') return wiggle(args[0], type ?? 'out');
        if (name === 'spring') {
            if (type) throw new Error(`Ease "${spec}": a spring has no in/out type`);
            return spring({ bounce: args[0], duration: args[1], velocity: args[2] });
        }
        if (name === 'cubic-bezier' || name === 'bezier') {
            if (args.length !== 4) throw new Error(`Ease "${spec}" needs 4 numbers`);
            return bezier(...args);
        }
        throw new Error(`Unknown ease "${spec}"`);
    };
    const get = (spec) => {
        if (typeof spec === 'function') return spec;
        if (spec == null) return linear;
        if (!cache.has(spec)) cache.set(spec, parse(String(spec)));
        return cache.get(spec);
    };

    const Ease = {
        clamp: (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)),
        seg: (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a))),
        linear,
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
        // GSAP families: Ease.power3.out, Ease.sine.inOut, Ease.bounce.out, …
        power0: families.power0, power1: families.power1, power2: families.power2,
        power3: families.power3, power4: families.power4,
        sine: families.sine, expo: families.expo, circ: families.circ, bounce: families.bounce,
        // configurable curves
        steps, bezier, wiggle, spring,
        get,
    };
    return Ease;
})();
