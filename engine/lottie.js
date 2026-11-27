// Lottie / dotLottie animations as layers of a scene, played by dotlottie-web
// (LottieFiles' player: ThorVG compiled to WASM, MIT, npm @lottiefiles/dotlottie-web).
// Loaded as a classic script from `uses`; it defines the global Lottie.
//
//   uses: ['engine/lottie.js'],
//   async setup(env) {
//       return { badge: await Lottie.load(env, 'sandbox/x/badge.json', { w: 400 }) };
//   },
//   draw(g, t, env) {
//       env.state.badge.draw(g, t - 0.5, 600, 250);                       // top-left corner
//       env.state.badge.draw(g, t - 0.5, 800, 450, { anchor: [0.5, 0.5], loop: true });
//   },
//
// A Lottie is a keyframed asset, and the frame painted is a pure function of the local
// time: setFrame paints synchronously into the layer's own canvas, so scenes stay
// deterministic. The WASM engine is served from node_modules, never from the CDN, so
// renders work offline and always run the same version.
const Lottie = (() => {
    const PKG = 'node_modules/@lottiefiles/dotlottie-web/dist/';
    // paths from the repo root, like `uses` (the player lives in /engine/)
    const url = (p) => new URL('../' + p, location.href).href;
    let lib = null;
    const dotLottie = () => (lib ??= import(url(PKG + 'index.js')).then(
        (m) => {
            m.DotLottie.setWasmUrl(url(PKG + 'dotlottie-player.wasm'));
            return m.DotLottie;
        },
        () => {
            throw new Error('Lottie: missing @lottiefiles/dotlottie-web, run `npm install` at the repo root');
        },
    ));

    // load(env, src, opts) → a layer. src: a .json (Lottie) or .lottie file, from the repo root.
    //   w, h         size of the layer in logical units (one is enough for a .json: the other
    //                follows the composition's aspect; neither = the composition's own size)
    //   res          extra resolution (2 when a camera zooms into it); default 1 = output size
    //   fit, align   how the composition sits in w × h ('contain', [0.5, 0.5])
    //   animationId, themeId   pick inside a .lottie; themeData: a theme object or JSON string
    //   slots        slot values ({ id: value }) for compositions that declare slots
    //   interpolate  false = only whole frames of the composition (stepped, like AE preview)
    async function load(env, src, o = {}) {
        const DotLottie = await dotLottie();
        const res = await fetch(url(src));
        if (!res.ok) throw new Error(`Lottie: cannot load ${src} (${res.status})`);
        const isZip = /\.lottie$/i.test(src);
        const data = isZip ? await res.arrayBuffer() : await res.text();
        let { w, h } = o;
        if (!w || !h) {
            if (isZip) throw new Error(`Lottie: give { w, h } for ${src} (a .lottie is not read here)`);
            const comp = JSON.parse(data);
            const ar = comp.h / comp.w;
            if (!w && !h) [w, h] = [comp.w, comp.h];
            else if (!h) h = w * ar;
            else w = h / ar;
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.ceil(w * env.k * (o.res ?? 1)));
        canvas.height = Math.max(1, Math.ceil(h * env.k * (o.res ?? 1)));
        const player = new DotLottie({
            canvas, data,
            autoplay: false, loop: false,
            useFrameInterpolation: o.interpolate ?? true,
            layout: { fit: o.fit ?? 'contain', align: o.align ?? [0.5, 0.5] },
            // the canvas is never in the page: no resizing to its CSS box, no freezing it as
            // «offscreen», no devicePixelRatio
            renderConfig: { autoResize: false, freezeOnOffscreen: false, devicePixelRatio: 1 },
            ...(o.animationId ? { animationId: o.animationId } : {}),
            ...(o.themeId ? { themeId: o.themeId } : {}),
        });
        await new Promise((ok, ko) => {
            const timer = setTimeout(() => ko(new Error(`Lottie: ${src} did not load in 20 s`)), 20000);
            player.addEventListener('load', () => (clearTimeout(timer), ok()));
            player.addEventListener('loadError', (e) => (clearTimeout(timer), ko(new Error(`Lottie: ${src}: ${e.error?.message ?? e.error}`))));
        });
        if (o.themeData && !player.setThemeData(o.themeData)) throw new Error(`Lottie: ${src} rejected themeData`);
        if (o.slots) player.setSlots(o.slots);

        const frames = player.totalFrames, duration = player.duration, fps = frames / duration;
        // the player accepts frames 0 … frames − 1 (see the engine skill); a value outside is
        // ignored and the canvas would keep whatever frame came before: not deterministic
        const lastFrame = frames - 1;
        // local time in seconds → composition frame. loop: wraps (whole cycles of the
        // composition, frames long); otherwise holds the first and last frames.
        const frameAt = (tl, { loop = false, speed = 1 } = {}) => {
            let f = tl * speed * fps;
            if (loop) f = ((f % frames) + frames) % frames;
            if (o.interpolate === false) f = Math.floor(f + 1e-6);
            return Math.max(0, Math.min(lastFrame, f));
        };
        let shown = null;
        const paint = (f) => {
            if (f === shown) return;
            player.setFrame(f);
            if (Math.abs(player.currentFrame - f) > 0.01) throw new Error(`Lottie: ${src} did not take frame ${f} (it is at ${player.currentFrame})`);
            shown = f;
        };
        paint(0);
        return {
            src, player, canvas, w, h, frames, duration, fps,
            frameAt,
            // paints the frame for local time tl and returns the canvas (output pixels)
            at(tl, opts) {
                paint(frameAt(tl, opts));
                return canvas;
            },
            // paints at (x, y) in logical units; anchor [0.5, 0.5] = (x, y) is the centre
            draw(g, tl, x, y, opts = {}) {
                paint(frameAt(tl, opts));
                const [ax, ay] = opts.anchor ?? [0, 0];
                g.drawImage(canvas, x - ax * w, y - ay * h, w, h);
            },
        };
    }

    // The easing of a Lottie segment as an engine ease. In Lottie JSON the keyframe that
    // STARTS a segment carries both handles: its `o` (out of this key) and `i` (into the
    // next), as scalars (spatial properties) or per-dimension arrays (`dim` picks one):
    //   Lottie.ease(k)  ≡  Ease.bezier(k.o.x, k.o.y, k.i.x, k.i.y)  ≡  CSS cubic-bezier(…)
    // A key with h: 1 holds its value until the next key (Ease.steps(1) would be the same).
    const pickDim = (v, dim) => (Array.isArray(v) ? v[Math.min(dim, v.length - 1)] : v);
    const ease = (k, dim = 0) => {
        if (k.h === 1) return () => 0;
        if (!k.o || !k.i) throw new Error('Lottie.ease: this keyframe has no o / i handles (the last key ends the property)');
        return Ease.bezier(pickDim(k.o.x, dim), pickDim(k.o.y, dim), pickDim(k.i.x, dim), pickDim(k.i.y, dim));
    };

    return { load, ease };
})();
