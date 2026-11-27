---
name: engine
description: Technical reference for the drawn-by-code engine. Use it when writing or debugging a scene's code (scene.js), when rendering to MP4 or stills, when touching engine/ or a style kit, or when something jitters, runs slow or doesn't load. Covers the Motion.scene contract, determinism, units, caching and commands.
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

**Scenes outside this repo.** A client's pieces can live in the client's own (private)
repo and still use this engine. Mark the root of that folder with a `drawn-by-code.json`
(its presence is the contract; `{}` is enough). Every tool then takes a scene path under it:
the server mounts that root at `/@ext/`, so inside it paths from the root are written
`'@ext/…'` (`const DIR = '@ext/pieces/x/'`, `uses: ['@ext/brand/brand.js']`, fonts
`'@ext/brand/fonts/…'`), while this repo's kits, fonts and effects keep their paths
(`'styles/…'`, `'fonts/…'`). Nothing outside the two roots is served. `new.mjs --in <dir>`
creates the experiment there (and logs it in that folder's `INDEX.md`); the preview lists
those scenes with `node engine/serve.mjs --ext <root>`. Lessons that generalize still come
back here, to the skills; only the client's material stays there.

Utilities in `engine/core.js`: `Motion.rng(seed)`, `noise1`, `sprite(key, box,
scale, draw)`, `shotAt`, `pulse(t, bpm)`, `beatIndex`, `onBeat`, `cam(g, env, cx, cy,
zoom, rot)`, `shake`, `keys([[t, v, ease?], …], t)`, `stagger`, `seq` (see «Timing»); and
`Ease.seg/inOut/out/in/back/elastic/bump/pop/lerp/lerpPt` plus the GSAP families
(`Ease.power3.out`, `Ease.get('back.out(2)')`) and `Ease.spring` (see «Timing»). `Motion.layer(env, name, fn)` paints a shot on a separate canvas
(at output size) and `Motion.drawLayer` pastes it: for transitions and mirrors. The local-time pattern is `const u = Ease.out(Ease.seg(t, 2.0, 2.6))`.
`Motion.quad(g, src, [tl, tr, br, bl], n, box, { bend })` maps an image onto any
quadrilateral (triangle-subdivided affine), with an optional bend: paper in perspective,
a page turning, a note flipping over.

**Animating on twos:** hand animation changes drawing every 1/12 s. Index per-drawing
tables with `const d = Math.floor((t - t0) * 12 + 1e-6)` and hold the drawing between;
smooth curves look wrong next to a reference animated on twos.

## Timing

GSAP's curves, stagger and timeline placement, plus a physical spring with anime.js's
parameters, ported to `core.js` as pure functions:
they only turn `t` into numbers, so frames stay a pure function of t. The eases are the
same formulas as GSAP 3.15 (checked sample by sample), so a curve named in a brief, a
GSAP snippet or an After Effects habit means the same thing here.

**Eases.** `Ease.get(spec)` takes a function or a string and caches it (cheap per frame):
`'power1'…'power4'` (quad…quint), `'sine'`, `'expo'`, `'circ'`, `'bounce'`, `'back'`,
`'elastic'`, each `.in` / `.out` / `.inOut` (no type = `.out`, as in GSAP); `'none'`;
`'back.out(2.2)'` (overshoot), `'elastic.out(1.2, 0.4)'` (amplitude, period); `'steps(6)'`;
`'cubic-bezier(.2, .8, .2, 1)'` (CSS / Figma / AE values); `'wiggle(5)'`,
`'wiggle.inOut(4)'` (oscillates and returns to 0: multiply by an amplitude). The families
are also plain objects: `Ease.power3.out(x)`. The old short names keep their values:
`Ease.in/out/inOut` are power2 (cubic), `Ease.back` is `back.out(1.7)`, `Ease.elastic` is
`elastic.out(1, 0.3)`. Names and arguments are checked: a typo throws, it never falls back
to linear.

| The move | Curve |
|---|---|
| Something arrives and settles (entrances, a label landing) | `power2.out` – `power3.out`; `expo.out` for a snappy UI feel |
| Something leaves (exits off frame) | `power2.in`, shorter than its entrance (≈ 70 %) |
| A to B with both ends on screen | `power2.inOut`; `sine.inOut` when it should feel soft |
| Icons, badges, buttons popping in | `back.out(1.4–2)` (more overshoot = more playful) |
| Something with weight that lands and settles (cards, a logo, panels, a caught throw) | `spring(0.2–0.4, 0.4–0.6)`; `spring(0, …)` when it must not overshoot |
| Something springy, small and playful | `elastic.out(1, 0.4–0.5)`, sparingly |
| A fall that lands | `bounce.out`, or real physics |
| Camera moves, slow drifts, breathing loops | `sine.inOut` / `power1.inOut`, never back or elastic |
| Constant motion: wheels, tickers, progress bars | `none` |
| Stop-motion, hand-made styles | `steps(n)` or the on-twos tables above |

Starting durations at 24 fps: small elements 0.25–0.4 s, medium 0.4–0.6 s, full-frame
0.6–1 s, camera 1–3 s. A style's skill and the review loop override these.

**Keys with their own ease.** `Motion.keys([[0, 0], [0.5, 120, 'back.out(2)'], [1.4, 80, 'sine.inOut']], t)`:
a third entry shapes the segment that arrives at that key; the rest use the default
(`Ease.inOut`). Two-entry keys behave as before.

**Stagger.** `Motion.stagger(i, n, { each: 0.05, from: 'center' })` → item i's delay in
seconds. `from`: `'start'`, `'center'`, `'end'`, `'edges'`, `'random'` (fixed by `seed`), an
index, or `[fx, fy]` with `grid: [rows, cols]` (`axis: 'x' | 'y'` keeps one axis). `amount`
is the total spread instead of `each`; `ease` bunches the delays (`'power2.in'`). One
difference from GSAP, on purpose: `each` is always the gap between neighbours. GSAP
doubles it when `from` is `'center'`.

**Sequences.** Build once (in `setup` or at the top of scene.js), read in `draw`:

```js
const tl = Motion.seq([
    ['title', 0.6],                                   // at the end so far (0)
    ['sub', 0.5, '-=0.2'],                            // overlaps title by 0.2 s
    ['icon', 0.4, '<0.1'],                            // 0.1 s after sub starts
    ['dots', 0.3, '>', { n: 5, stagger: { each: 0.05, from: 'center' }, ease: 'back.out(1.6)' }],
    { label: 'outro', at: '+=0.8' },                  // a hold, then a label
    ['fade', 0.5, 'outro'],
], { start: 1.0, ease: 'power3.out' });               // seq default ease; GSAP's is power1.out

const u = tl.u('title', t);                           // eased 0..1
const d = tl.u('dots', t, null, i);                   // copy i of the group
const [a, b] = tl.span('sub');                        // seconds, for anything else
```

`at` is GSAP's position parameter: a number (seconds from `start`), `'+=x'` / `'-=x'` from
the end so far (`'-=25%'` of the item's own duration), `'<'` / `'>'` the previous item's
start / end with an offset (`'<0.2'`, `'>-0.1'`, `'<50%'`), a label (`'outro+=0.3'`).
Omitted = the end so far, not the end of the previous item, as in GSAP. Placement is
checked against a paused GSAP timeline. Overlap is what makes motion read as one
gesture: start the next piece before the last one settles (`'-=0.15'`, `'<0.1'`) instead
of chaining them end to end. `tl.end` is the sequence's last second, which helps with
`duration` and the shot list.

**Springs.** `Ease.spring({ bounce, duration, velocity })` (or `{ mass, stiffness, damping }`,
anime.js's parameters) is a damped spring solved in closed form, so frames can be asked in
any order. `duration` is the time of one swing, about when it looks arrived; `bounce` 0 =
no overshoot, 0.3 ≈ 5 %, 0.5 ≈ 16 %, 0.7 ≈ 37 %; below 0 it crawls in (overdamped). Unlike
`back` and `elastic`, the overshoot and the ringing come from one physical setting, so
pieces sharing a bounce feel like one material, and `velocity` (distances per second)
carries a throw into its landing.

```js
const S = Ease.spring({ bounce: 0.35, duration: 0.5 });
const x = Ease.lerp(-200, 600, S.at(t - 2.0));               // seconds since it started
const tl = Motion.seq([['logo', S.settle, 1.0, { ease: S }], ['tag', 0.4, '<0.35']]);
Motion.keys([[0, 0], [S.settle, 100, S]], t);                // or 'spring(0.35, 0.5)' anywhere an ease goes
```

`S.settle` is when it stays within 0.01 % of the target: ≈ 1.9 × `duration` up to bounce
0.3, ≈ 3.5 × at 0.6. Give it as the item's duration so the spring keeps its own timing (a
squeezed or stretched duration changes how fast it swings). The tail is long and nearly
invisible, so place what follows from the spring's start (`'<0.35'`), not its end (`'>'`).
`S.vel(s)` is its speed then, in distances per second: to retarget mid-move without a kink,
start the next spring with `velocity: S.vel(s) × old distance ÷ new distance`; it also sizes
motion-blur samples. Checked against an RK4 simulation
(error < 1e-12) and a rendered check scene.

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

## Lottie layers

`engine/lottie.js` (in `uses`) plays Lottie `.json` and dotLottie `.lottie` files through
dotlottie-web (LottieFiles' player: ThorVG in WASM, MIT, `@lottiefiles/dotlottie-web` in
package.json). The WASM engine is served from node_modules, never the CDN. A layer is
loaded in `setup` and painted at a local time:

```js
uses: ['engine/lottie.js'],
async setup(env) { return { badge: await Lottie.load(env, DIR + 'badge.json', { w: 440 }) }; },
draw(g, t, env) { env.state.badge.draw(g, t - 0.6, 420, 515, { anchor: [0.5, 0.5] }); },
```

`load` options: `w` / `h` in logical units (one is enough for a .json), `res` (extra
resolution under a camera zoom), `fit` / `align`, `animationId` / `themeId` / `themeData` /
`slots`, `interpolate: false` (whole composition frames only). The layer has
`draw(g, tl, x, y, { anchor, loop, speed })`, `at(tl, opts)` → its canvas (for
`Motion.quad`, masks, `Motion.layer`), `frameAt(tl)`, `frames`, `duration`, `fps`.

- **Deterministic.** `setFrame` paints synchronously, so the frame is a pure function of
  t; review.mjs's out-of-order check passes. The player ignores frames outside
  `0 … frames − 1` (negative ones too) and keeps the last frame painted, a bug that only
  shows when frames are painted out of order: `lottie.js` clamps, and throws if a frame
  did not take.
- **When it fits:** flat vector motion (icons, UI micro-interactions, badges, loaders, a
  designer's After Effects export) in product and flat pieces. Not the hand-made styles:
  Lottie has no paper, grain, ink or texture, and ThorVG skips most AE effects. A Lottie
  inside a textured style still has to pass that style's «Detail» checklist. Check the
  licence of any downloaded Lottie; hand-written ones have none to check.
- **Writing Lottie by code:** `sandbox/2026-11-21-lottie-layer/make-lottie.mjs` is a small
  vocabulary (shape layers, groups, ellipse, path, fill, stroke, trim path, parenting,
  hold keys, spatial position) that writes Bodymovin 5.x JSON; ThorVG played all of it.
- **Easing read from a Lottie.** The keyframe that starts a segment carries both handles
  (`o` out of it, `i` into the next): `Lottie.ease(key)` = `Ease.bezier(o.x, o.y, i.x,
  i.y)` = CSS `cubic-bezier`; AE «Easy Ease» is `cubic-bezier(.333, 0, .667, 1)`. On the
  test card, a dot drawn by code with `Lottie.ease` on the composition's own keyframes stays
  within 0.4 logical units of ThorVG's dot on every frame, so curves from a designer's
  Lottie or AE file can be reused 1:1 in code (with the measuring tools of **replicate**).

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
node engine/render.mjs sandbox/x/scene.js --size 1920 --gpu   # on a machine with a graphics card (prints the GL it got; a laptop's discrete NVIDIA card is tried first, through PRIME offload; MOTION_IGPU=1 skips it)
node engine/mix.mjs sandbox/x/audio.json                  # mix.wav
node engine/strip.mjs sandbox/x/render/x.mp4 sandbox/x/render/strip.jpg --at 1,3,5   # a film strip for READMEs
node engine/gif.mjs sandbox/x/render/x.mp4 sandbox/x/render/x.gif --clips 2-6,10-14 --frame 480x270   # a looping GIF (< ~5 MB); --frame: the exact size every tile of the README's gallery has (a square film is fitted whole, over a blurred copy of itself)
# working against a reference video (replicas, style studies)
node engine/reference.mjs sheets ref.mp4 --every 0.25      # labelled contact sheets
node engine/reference.mjs compare sandbox/x/scene.js ref.mp4 --times 2,3.5 --crop 0.3,0.2,0.4,0.4
node engine/reference.mjs colors ref.mp4 3.5 skin=0.42,0.31 # sampled palette
node engine/reference.mjs track ref.mp4 --color '#d2745e' --from 10 --to 12   # per-frame box
node engine/reference.mjs cuts ref.mp4                                         # exact cut frames
node engine/reference.mjs box ref.mp4 1.75 --color '#302222' --region 150,100,850,800
node engine/reference.mjs runs out/stills/t_3.79s.png 0 --row 0.6               # edges along a row
node engine/reference.mjs face ref.mp4 --body '#d2745e' --from 12 --to 12.5    # face per drawing
node engine/detail.mjs sandbox/x/scene.js ref.mp4 --times 3.5 --grid 12 --mask 0.27,0.33,0.5,0.34   # the detail gate; --mask leaves out what must not be copied (a logo)
# a scene outside this repo (a folder marked with drawn-by-code.json)
node engine/new.mjs x --in ../client/marketing/pieces --aspect 9:16
node engine/serve.mjs --ext ../client/marketing
node engine/render.mjs ../client/marketing/pieces/2026-10-01-x/scene.js --at 1
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
- 2026-09-24 · saas-promo · Key tables compared with `tq = Math.floor(t*12)/12` must be exact twelfths: 1.67 is not ≥ 20/12, so a drawing silently shifts. Write times as beats/halves/quarters or snap with `Math.round(a*12)/12`.
- 2026-09-25 · physics-history v2 · Never wait for a render with `until ! pgrep -f "render.mjs …"`: the waiting shell's own command line contains the pattern, so it waits forever. Run the render itself in the background and let its completion notify you.
- 2026-09-27 · pyramid-engraving · This container has no GPU: WebGL runs in SwiftShader, which executes every branch of a shader for every pixel (masked). An `if` never saves time there; what does: fewer call sites of heavy functions, relief gradients from `dFdx/dFdy` instead of extra evaluations, and shader variants compiled per draw (`#ifdef`, `variantFor` in the engraving kit). Profile before guessing: time one still at half size (fragment-bound work drops 4×), then knock features out one at a time. For long films, render with `--gpu` on a machine that has one.
- 2026-09-27 · pyramid-engraving · On a laptop with Intel + NVIDIA (Optimus), headless Chrome takes the integrated GPU unless the process is launched with PRIME offload (`__NV_PRIME_RENDER_OFFLOAD=1`, `__VK_LAYER_NV_optimus=NVIDIA_only`, `__GLX_VENDOR_LIBRARY_NAME=nvidia`); ANGLE on Vulkan there was 6× faster than OpenGL on the Intel (0.27 s vs 1.75 s a heavy frame), and only without `--enable-features=Vulkan`, which left no WebGL2. `--gpu` now tries it first.
- 2026-09-27 · pyramid-engraving · The same shader can differ by GPU: in GLSL ES 3.0 a fragment shader's `int`/`uint` default to `mediump` (16 bits on NVIDIA: an integer hash collapsed to a constant), and a float hash like `fract(p · 123.34 …)` amplifies a compiler's reassociation of `(i + 1) · k` into a visible jump at every noise lattice line. Declare `precision highp int`, hash lattices in integers, and check a still on each GPU you render on.
- 2026-09-30 · external product promo · Motion blur by averaging copies: paint each pass whole into its own layer (`Motion.layer`) and composite it with alpha 1/(k+1); painted straight onto the canvas, each pass's background washes out the previous ones and objects turn half transparent. Pick the number of samples from the real displacement in pixels, at least 3 as soon as anything moves (switching from 1 to 2 samples changes the edges in one frame, a visible jump), and never let it be 1 in a formula like `i / (n − 1)`: 0/0 gives NaN and the layer silently paints nothing (an empty frame).
- 2026-10-02 · product videos · A scaled `drawImage` with a source crop samples one pixel outside the crop (Chrome): a reused temporary canvas is cleared whole, not only the area about to be copied, or leftovers of the previous group show as a line. And `ctx.filter = 'blur()'` every frame doubled a scene's cost (105 → 47 ms for a frame): blur once into a sprite and stretch it.
- 2026-11-04 · red-thread · The scene file runs before the files in `uses` load: any top-level code that touches a kit's global (`const S = Sumi`, `shots: Film.SHOTS`) throws «X is not defined». Write `shots` as a literal and build helpers that need the kits in `setup()`.
- 2026-11-11 · runnin-down-a-dream · Never dispatch segments (or compare any time) on a rounded literal like 55.4167: frame 1330 is at 55.41666…, a hair before it, so the next block starts a frame late and the previous one draws a frame past its range (three blocks had lost their first frame, one of them a hit on the beat). Compute boundaries from the same function the blocks use (`Song.B(n)`, snapped to frames) and render both sides of every join.
- 2026-11-11 · runnin-down-a-dream round 11 · State between frames hides in helpers: a pose track that returns its shared base object before its first key, and a shot that adds to the pose (`pose.squash += …`), make every frame start from the last one's pose. A still on its own is right; the film played in order drifts (the Devil sank behind his rail over a bar, his arms sliding down the box: «the arms go through the balcony»). Anything a helper hands out to be modified is a copy. `review.mjs` tests three frames for this: on a long film run a pass over all of it (paint a frame, the one before, the frame again, compare: `sandbox/2026-11-11-runnin-down-a-dream/tools/check-state.mjs`) before the final render, and whenever a still and the film disagree, suspect this first.
- 2026-11-11 · runnin-down-a-dream round 11 · A long film is rendered in chunks (`--from/--to --audio none`, then `ffmpeg -f concat -c copy` and the audio muxed once): three chunks side by side on four cores. A chunk that dies with «Target crashed» is the browser out of memory (check `dmesg`: the container's memory limit killed chrome at ~9 GB), not a drawing fault: a stretch with a moving camera over cached sets fills the cache with one canvas per frame. Render that stretch alone, in pieces of a few seconds, and count every chunk's frames (`ffprobe nb_frames`) before joining.
- 2026-11-12 · site · A page that shows scenes live must not run them on load. The old site ran the README cover and fifteen templates in iframes on the page's own thread: the cover blocked the tab for 4.8 s on opening and the engraving plate for 4.7 s on scrolling to it (measured with a `longtask` PerformanceObserver in headless Chromium), sixteen stayed loaded, and browsers hung («it crashes and can't be opened»). Now films are posters until played and styles are stills until pressed, one iframe at a time, removed on close: no task over 50 ms while loading or scrolling. A same-origin iframe shares the page's thread, so anything heavy inside it freezes the page: measure blocking, not just errors, before publishing a page.
- 2026-11-14 · pier-pressure · Ink that is meant to end up hidden under a fill (an outline stroked before its fill, the inside of a self-overlapping band) bleeds as a hairline along an antialiased clip edge: each pass covers the edge pixels only partly. Put a clip's edges where no such ink lies, or redraw the fill alone through a slightly wider clip.
- 2026-11-14 · pier-pressure · A part redrawn in a later pass to change its depth (a forearm in front of a body) must be the very same geometry as the first pass, seeds and frame included, cut by a clip; a second, similar shape never lines up with the first.
- 2026-11-14 · pier-pressure · A silhouette from a 3D model: project the part's points and take their convex hull, one hull per convex part (a boot's shaft and vamp separately, joined as one skin), marking a corner where the hull turns more than ~50°; a single hull of a bent object loses the bend (a high-top became a wedge). Direction vectors are easy to get backwards: with z towards the viewer, a face is seen when its normal's z is positive; render one still per orientation before composing.
- 2026-11-14 · pier-pressure round 14 · A drawing with a piece «broken or not drawn» (the user's words for a boat's bow) may be a NaN: `Math.pow` of a cosine that should be 0 and is −1e−17 gives NaN, canvas paths skip NaN points silently, and no error is raised. Clamp before fractional powers and roots, and when a shape ends early at exactly the end of its parameter, print the points there before redrawing anything.
- 2026-11-14 · pier-pressure round 14 · In a projected set: a band round a turned shape is the surface between the two arcs that face the camera, never the hull of the two whole rings (that shows the far side: «as if you could see the back of the cone»); a rope is a smooth tube whose strands are S-shaped lines from edge to edge, tangent to the edges at both ends (a helix on a cylinder), never a ribbon with straight hatch marks («it looks 2D») nor a chain of overlapping lozenges («they have not turned out realistic»: it read as scales); a ring of something thick seen nearly edge-on (a turn of rope, a tyre lying flat) is its projected line stroked with the thickness, ink first and colour inside it, so its ends are its own round turn-backs: a band offset from the line folds on itself there, and separate end caps read as blobs with a seam («the edges are badly drawn»); two things at different depths whose tops are at the same height cross on screen (a board in front of a counter): make one clearly lower or move it aside.
- 2026-11-15 · pier-pressure round 30 · Blender is available as a second renderer for tests: `pip install bpy` into a scratch venv (5.3 with Python 3.13) and run a script with that Python; no graphics card needed. Flat cartoon colour = emission materials (convert sRGB hex to linear) with `view_transform = 'Standard'`, Cycles on the CPU at 1 sample (2–3 s a 1920 frame), `film_transparent` for frames to lay over an engine background with ffmpeg `overlay`. Ink outline = Freestyle: create the line set AND its line style, select silhouette + border + crease, and exclude small flat details through a collection (`select_by_collection`, `collection_negation = 'EXCLUSIVE'`). Example: `sandbox/2026-11-14-pier-pressure/blender/hoagie.py`.

- 2026-11-16 · lightfield-test · A reference that is a still works with every reference tool once it is a clip: pad or crop it to the scene's aspect and loop it (`ffmpeg -loop 1 -i still.png -t 6 -r 24 -vf scale=1920:1080 ref.mp4`); `detail.mjs` stretches the scene's frame to the reference's size, so a different aspect compares a distorted image.
- 2026-11-16 · lightfield-test · Post-processing in WebGL (bloom, blur pyramids): every pass divides `gl_FragCoord` by the size of **its own target**, passed as a uniform; deriving it from the source's texel size sampled a corner of each level and the bloom silently vanished. Float targets (`RGBA16F` with `EXT_color_buffer_float`) work in the headless browser's software GL.
- 2026-11-17 · lightfield-test · `render.mjs --from a --to b` renders the frame at `b` too, so chunks cut at the same second share a frame: joined with `concat -c copy` the film is a frame long per joint and stutters there. Count frames (`ffprobe -count_frames`) and join with `trim=end_frame=<n>` on every chunk but the last, or end each chunk one frame early (`--to b − 1/fps`).
- 2026-11-17 · micrograph-test · A software renderer (SwiftShader here) runs every branch of a fragment shader: an early `return` or `continue` saves nothing, so a loop that shades N particles costs N times the noise fields at every pixel. When the things do not overlap, find the nearest in a cheap loop and shade that one once (8 s → 1.8 s a frame); profile by switching parts of the shader off and timing three stills, not by guessing (moving 1 600 constants to a texture changed nothing).
- 2026-11-17 · micrograph-test · `detail.mjs` asked for an instant beyond the reference clip's end used to report NaN and FAIL; it now refuses with the clip's length. A still looped as a reference must last as long as the film when the gate runs at film seconds.
- 2026-11-21 · lottie-layer · A player that ignores an out-of-range seek and keeps its last frame (dotlottie-web outside `0 … frames − 1`) looks right when played in order and breaks only when frames are painted out of order: clamp every seek to the range the player really accepts, and check that the frame took.
