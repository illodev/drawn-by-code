# Brief for an element agent · souvenir-test

You are painting ONE group of elements of an emblem for `drawn-by-code`: animations drawn
with deterministic canvas-2D code, rendered frame by frame in headless Chromium. Everything
in the repo (code, comments, notes) is in ENGLISH. Read this whole file before you start.

## The job

A new style, **souvenir**: a place told through its painted emblems, in the manner of
tattoo flash, cigar-box and fruit-crate labels and holiday postcards. Opaque paint
modelled with light, never flat vector. The first film is «Recuerdo de Andalucía»: a
camera dives through five nested pictures. Picture 1 is **the emblem**, on an indigo night:
a flamenco guitar seen from the front, two open fans behind it as wings, an olive wreath,
carnations, swallows, a crescent moon, a ribbon with a motto. The camera dives through the
guitar's sound hole into a lemon tree.

**Why detail is the whole job (the user's standing rule):** nothing is shown to the user
until it holds up cropped at full resolution; «the user should never have to point out an
evident detail». An element made of five ellipses, a flat fill with an outline, generic
clip-art shapes or vector-clean gradients reads as low effort at a glance. Every element is
its own set of pieces with organic shapes, a texture that says what it is made of, real
light on it, and the small true details of the real object (look at how the real thing is
built before drawing it: how a guitar's bridge ties its strings, how an olive leaf is
silver underneath, how a swallow's tail forks).

## The manner (emblem manner: line + airbrush)

Look first at the bar. These are frames of the user's style reference (third-party footage:
never copy it into the repo, never reproduce its content, only its level of finish):

- `/tmp/claude-0/-home-user-drawn-by-code/4bdefda1-4465-5c66-aa86-9c20f61fd010/scratchpad/ref/full/f2.45.jpg` (the whole emblem)
- `/tmp/claude-0/-home-user-drawn-by-code/4bdefda1-4465-5c66-aa86-9c20f61fd010/scratchpad/ref/crops/A.jpg` (wing feathers and figures at 2×)
- `.../scratchpad/ref/crops/B.jpg` (gold scrollwork, a stone column at 2×)

What makes it read as painted:

1. **A dark contour** on every piece: blue-black (`Souvenir.INK`, `#191c38`), 2–3 units wide
   at full size, a little heavier on the side away from the light; inner lines thinner
   (1–1.5). Never pure black, never hairlines.
2. **Airbrushed modelling inside every piece**: a darker tone of the local colour sprayed
   in from the shadow side and from under whatever overlaps it, a lighter tone on the lit
   side, a small clean highlight where a form turns to the light. No piece is one flat
   colour; no gradient is a plain two-stop linear fill across a whole object.
3. **Each piece shades the one under it** (a soft cast shadow, `cast`), so overlapping
   pieces (feathers, petals, leaves, sticks) separate.
4. **Colours are rich but a little muted**, with hue shifts: shadows cooler and deeper
   (towards blue/violet/deep red), lights warmer. No pure #ff0000, #ffffff or #000000.
5. **The light comes from the top left** for every element (`Souvenir.LIGHT`,
   `Souvenir.SHADE_DIR`). A sprite that will be pasted rotated bakes its light with
   `Souvenir.lightFor(rot)`.
6. **Built from many pieces**: a bird is head, eye, beak, throat patch, breast, back,
   each wing's coverts and flight feathers one by one, the tail's feathers; a flower is
   its petals; a ribbon is its faces and folds.

## The kit (read it: `styles/souvenir/souvenir.js`, global `Souvenir`, here `S`)

- `S.piece(g, pts, { fill, shade, light, detail, line, ink, heavy, cast })`: one piece in
  the emblem manner. `pts` is a closed polygon (densify curves with `S.curve(pts, closed,
  seg)`, `S.ellipse(cx, cy, rx, ry, n, rot)`, `S.xf(pts, {x, y, rot, sx, sy})`).
- `S.spray(g, pts, { color, alpha, w, push, dir })`: airbrush in from an edge (inside a
  clip; `piece` does it for `shade`/`light`).
- `S.ink(g, pts, { w, color, taper, alpha })`: a brush-pen line (tapered ends).
- `S.cast(g, drawFn, { blur, dx, dy, color })`: only the shadow of what `drawFn` paints,
  only on paint already there.
- `S.form({ box, res, mask, ramp, soft, light, inflate, relief, height, stroke, mottle,
  marks, spec, tint, over })` → `{ canvas, box }`: a piece painted per pixel as a lit
  volume (a balloon over the outline, or a bevel, or your own height field), then
  `S.put(g, sprite, { x, y, rot, s })`. Use it for round things (an olive, a bird's body,
  a moon, a clay jug); `soft: 1` gives an airbrushed gradient, `spec` a sheen. Slow:
  call it once per sprite and cache (a `Map` keyed by variant/rot/res).
- `S.dab` (a dry-brush stroke), `S.textOn(g, text, baseline, { font, color, spacing,
  glyph })` (lettering along a curve), `S.tooth(g, box)` (board grain, the lead applies it).
- Colour helpers: `S.mix(a, b, t)`, `S.rgba(hex, a)`; `S.hashI`, `S.noise2/3`; `Motion.rng(seed)`.

Model files (finished or nearly, follow their structure and bar):
`sandbox/2026-11-19-souvenir-test/things/fan.js` (emblem manner, pieces + airbrush) and
`things/citrus.js` (per-pixel `form` sprites, cached). Read both.

## The contract

- ONE file per group: `sandbox/2026-11-19-souvenir-test/things/<name>.js`, wrapped in an
  IIFE that defines ONE global (`const Guitar = (() => { … })();`). Files share one global
  scope in the page: no other top-level names.
- Drawers paint **once, static** (no time argument): `X.thing(g, { x, y, s, rot, seed, … })`
  in the caller's units, onto a context that may already be scaled. Use `S.pxScale(g)` when
  you need the output resolution (for `form` sprites: `res = S.pxScale(g) * s`, rounded up to
  0.5 steps, cached by it).
- Deterministic: no `Math.random`, no `Date`, no state between calls. Randomness =
  `Motion.rng('stable-seed')`.
- You edit ONLY your own file(s) and your dev scene. `styles/souvenir/souvenir.js`, the
  other `things/*.js`, `tableaux/`, `scene.js` are read-only for you: if you need a kit
  change, do it inside your file and say so in the report. Do NOT commit, do NOT push, do
  not use git at all (other agents and the lead share this working tree).

## How to work

Your dev scene: `sandbox/2026-11-19-souvenir-test/dev/<name>/scene.js` (copy
`dev/specimens/scene.js`): your elements big on the indigo ground `#232749`, at the size
they will have in the film and at 2×. Render and LOOK:

```bash
node engine/render.mjs sandbox/2026-11-19-souvenir-test/dev/<name>/scene.js --at 0
# → dev/<name>/out/stills/t_0.00s.png  (1920 × 1080; Read it)
# a crop at 2× of one element:
ffmpeg -v error -y -i <still.png> -vf "crop=600:400:X:Y,scale=1200:-1:flags=lanczos" /tmp/claude-0/-home-user-drawn-by-code/4bdefda1-4465-5c66-aa86-9c20f61fd010/scratchpad/agents/<name>/crop.png
```

Loop: look at the real object (what you know of it; name its parts) → build piece by piece →
render → Read the still and a 2× crop of every element → compare with the bar above → fix.
At least four rounds; you are done when a 2× crop of each element shows a contour with
weight, airbrushed modelling on every piece, overlap shadows, true details, and nothing
that reads as a geometric primitive. Do not include `S.finish` in your judgement only: it
softens; judge the raw paint too (`post` off).

Scratch images go in `/tmp/claude-0/-home-user-drawn-by-code/4bdefda1-4465-5c66-aa86-9c20f61fd010/scratchpad/agents/<name>/`, never in the repo.

## Palette of picture 1 (use these, vary around them)

ink `#191c38` · night `#232749`, deep `#161a36` · fan green `#1f7350` / `#46a676` /
`#0b3a2f` · cream `#ecdcb4`, ivory `#f4efe4` · gold `#d9a441` / `#f6dc8a` / `#8a5a17` ·
carnation red `#cf3a3c` / `#7a1428` / `#f39a8c` · moon silver `#d9dcea` / `#8f8db0` ·
spruce `#e2b469` / `#f1d59a` / `#a8742f` · rosewood `#4a2420` · olive leaf `#5f7a45`
above, `#b9c4a0` below.

## Second pass · «packed with details» (read this if your task says «wave 2»)

The user saw the first assembly and said: «I think we are on the right track. I would like
it to be packed with details, and very worked at the level of every pixel, like the
reference. Do it with a great deal of detail and with quality.»

Look at where we stand: `/tmp/claude-0/-home-user-drawn-by-code/4bdefda1-4465-5c66-aa86-9c20f61fd010/scratchpad/recuerdo-de-andalucia-emblema.png`
(our emblem, a full frame) and `…/scratchpad/cmp-a.jpg` (the reference, left, and ours,
right, both at 1:1). What the side by side shows:

1. **The reference has no quiet patch.** Any 150 × 150 px square of it holds several drawn
   things: a flower with its line and three tones, a fold, a strand of hair, a stamen.
   Ours has large areas of regular fill. **Repetition is not detail:** fourteen identical
   pleats, a row of identical scallops or a tiled motif read as a pattern fill. Whatever
   repeats must vary (size, turn, tone, a missing one, wear) and carry drawing of its own.
2. **Its paint varies inside every shape:** strokes that follow the form, a warm and a
   cool passage, a darker accent in the turn, a broken edge. A gradient plus a contour is
   vector with an airbrush.
3. **It is full of things to find.** Small true details that reward a second look: a
   stitch, a chip, a label with its lettering, a fly, a thread come loose, a maker's mark.

So for this pass the bar is: **crop any 300 × 300 px of your element from the 1920 render
and count at least eight distinct drawn features in it**, and **zoom to 4×: there is still
drawing there** (hairlines of 1–1.5 units, stipple, hatching, grain, wear), nothing is a
bare gradient. Work from knowledge of the real thing: before painting, write down (in a
comment at the top of your file) the anatomy and the ten small true details of each
object, then paint every one of them.

The elements of the first pass are your models of finish now: `things/guitar.js` (the
rosette, the bridge), `things/sky.js` (the swallow), `things/garland.js` (the carnation),
`things/ribbon.js` (the cloth and the key), `things/charms.js` (the pomegranate, the
cards). Read at least two of them and reuse their tricks (see «Helpers» in
`.claude/skills/style-souvenir/SKILL.md`, which also lists the lessons their painters
left: read its «Detail» and «Lessons» sections first).

Everything else in this brief still holds: the manner, the light from the top left, the
contract (one file, one global, static drawers, deterministic, turn the geometry and not
the canvas), no git, look at every image you make, the report.

## Report (your final message, concise)

1. Files written and the global's API (every drawer's signature and the size of the thing
   in units at `s = 1`, with its anchor point).
2. What each element is built from (pieces, textures), and what a 2× crop still shows as
   weaker than the bar. An element with «still off» items is not finished: fix it first.
3. Any kit change you needed, kept in your file (name it).
4. One-line lessons that would help the next painter in this manner.
