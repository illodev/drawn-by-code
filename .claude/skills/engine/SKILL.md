---
name: engine
description: Technical reference for the illomotion engine. Use it when writing or debugging a scene's code (scene.js), when rendering to MP4 or stills, when touching engine/ or a style kit, or when something jitters, runs slow or doesn't load. Covers the Motion.scene contract, determinism, units, caching and commands.
---

# Engine

2D canvas in headless Chromium, frame by frame. No animation libraries: time is a
variable `t` and every frame is a **pure function of t**.

## Scene contract

```js
Motion.scene({
    fps: 24, duration: 6.5,
    logical: [1600, 900],          // logical units; the output is scaled (k = px/unit)
    uses: ['styles/paper-cutout/paper.js', 'styles/paper-cutout/kit.js', 'sandbox/x/cast.js'],
    fonts: [{ family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' },
            { family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' }],
    bpm: 120, beatOffset: 0,       // musical grid (review.mjs checks the cuts)
    shots: [[0, 4, 'Workshop'], [4, 8, 'Box']],
    audio: { mix: 'mix.wav' },  // render.mjs adds it automatically
    setup(env) { return { kit: PaperKit.make(env) }; },  // → env.state
    draw(g, t, env) { ... },       // logical coordinates; the canvas comes already scaled
    post(ctx, t, env) { ... },     // optional, in PIXELS: grain, vignette
});
```

`env`: `W, H` (logical), `k`, `fps`, `duration`, `total`, `px: [width, height]`, `state`.
Paths in `uses` and `fonts` are relative to the repo root. An entry can be optional
(`{ src: 'sandbox/x/private/brand.js', optional: true }`, fonts `{ family, src, optional:
true }`): it is skipped when missing. That is how a client's brand material stays in the
uncommitted `sandbox/*/private/` while the committed code still runs on a placeholder
brand.

Utilities in `engine/core.js`: `Motion.rng(seed)`, `noise1`, `sprite(key, box,
scale, draw)`, `shotAt`, `pulse(t, bpm)`, `beatIndex`, `onBeat`, `cam(g, env, cx, cy,
zoom, rot)`, `shake`, `keys([[t, v], …], t)`; and `Ease.seg/inOut/out/in/back/elastic/bump/
pop/lerp/lerpPt`. `Motion.layer(env, name, fn)` paints a shot on a separate canvas
(at output size) and `Motion.drawLayer` pastes it: for transitions and mirrors. The local-time pattern is `const u = Ease.out(Ease.seg(t, 2.0, 2.6))`.
`Motion.quad(g, src, [tl, tr, br, bl], n, box, { bend })` maps an image onto any
quadrilateral (triangle-subdivided affine), with an optional bend: paper in perspective,
a page turning, a note flipping over.

**Animating on twos:** hand animation changes drawing every 1/12 s. Index per-drawing
tables with `const d = Math.floor((t - t0) * 12 + 1e-6)` and hold the drawing between;
smooth curves look wrong next to a reference animated on twos.

## Determinism (golden rule)

- Forbidden: `Math.random()`, `Date`, `performance.now()` and state that accumulates
  between frames (positions that keep adding up, live particles). Everything is computed
  from `t`.
- Randomness = `Motion.rng('stable-seed')` or `Paper.rng`. The seed identifies the
  piece, **never the frame**, or the texture boils.
- Simulations (falls, paper rain): a closed-form formula per particle with its own seed,
  or a simulation fully precomputed in `setup` and indexed by frame.
- `review.mjs` paints the frames in a different order and compares hashes: if it warns,
  there is state.

## Long or multi-style scenes

One file per segment in `segments/` (each adds its function to a global object, e.g.
`Segment.frog = (g, t, env) => …`), loaded from `uses` together with the kits of every
style. `scene.js` only assembles: it decides which segment or which transition plays at
each `t`. See `sandbox/2026-09-24-exquisite-corpse/`.

## Performance

- Static things (backgrounds, cutouts, textures) are painted once with `Motion.sprite` /
  the kit's `sprite`, with a key that includes everything that changes their look.
- Marker texture is expensive: low `density` on large pieces, and always cached.
- Target: < 150 ms/frame warm at 1920. `review.mjs` measures it.

## Commands

```bash
npm run preview                                           # http://127.0.0.1:5173
node engine/review.mjs sandbox/x/scene.js                 # automatic review + sheet
node engine/render.mjs sandbox/x/scene.js --at 1.5,3.2    # stills at 1920 → out/stills
node engine/render.mjs sandbox/x/scene.js --size 1920     # MP4 → out/x.mp4
node engine/render.mjs sandbox/x/scene.js --size 1080 --from 4 --to 8   # a segment
node engine/mix.mjs sandbox/x/audio.json                  # mix.wav
# working against a reference video (replicas, style studies)
node engine/reference.mjs sheets ref.mp4 --every 0.25      # labelled contact sheets
node engine/reference.mjs compare sandbox/x/scene.js ref.mp4 --times 2,3.5 --crop 0.3,0.2,0.4,0.4
node engine/reference.mjs colors ref.mp4 3.5 skin=0.42,0.31 # sampled palette
node engine/reference.mjs track ref.mp4 --color '#d2745e' --from 10 --to 12   # per-frame box
node engine/reference.mjs cuts ref.mp4                                         # exact cut frames
node engine/reference.mjs box ref.mp4 1.75 --color '#302222' --region 150,100,850,800
node engine/reference.mjs runs out/stills/t_3.79s.png 0 --row 0.6               # edges along a row
node engine/reference.mjs face ref.mp4 --body '#d2745e' --from 12 --to 12.5    # face per drawing
```
The whole method for replicas is in the **replicate** skill.

Preview: space = pause, ←/→ one frame, shift+←/→ one second, `&t=3.5` in the URL.
Chrome: looked up in `CHROME_PATH`, `/opt/pw-browsers`, and the usual Linux/macOS paths.

## Debugging

- Black screen or no READY: `review.mjs` prints the page error. Typically: a wrong `uses`
  path, a font that doesn't load or an exception in `setup`.
- Text in a system font on the first frame: the font is not in `fonts`.
- Everything blurry: the sprite was cached at low resolution (raise `res`) or is scaled
  up a lot.

## Lessons

<!-- Added from the review loop: date · experiment · one-line lesson. -->
- 2026-09-24 · coffee-first · Everything that bleeds off the frame (backgrounds, floors, tables) must cover the camera's full travel: `paperBg(…, { bleed })` and pieces wider than the pan. `review.mjs` warns about «Transparent holes».
- 2026-09-24 · coffee-first · To cache a moving piece, draw the sprite at its origin and move it with `translate/rotate/scale`; the sprite key must not depend on t.
- 2026-09-24 · what-do-you-love · A text drawn with `strokeText` on top of `fillText` only gets bolder; a felt-tip look needs the glyph thinned: fill, then `destination-out` stroke on an offscreen canvas (cache it per scale from `getTransform()`).
