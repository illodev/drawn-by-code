---
name: style-sumi-e
description: Sumi-e style, in testing: Japanese ink painting on washi — one black ink in many greys, brush strokes with tapered ends and dry-brush streaks (kasure), boneless mountain washes dissolving into mist, water as horizontal dry strokes with reflections, tiny ink-silhouette people, vermilion as the only colour (a sun, blossoms, a thread). Use it for Japanese, ink, brush, zen, haiku, parable or «tinta china» looks, or when working with styles/sumi-e/.
---

# Style · Sumi-e

In testing. Style test: `sandbox/2026-11-04-red-thread/` («The kite», 7 s; review/sheet.jpg).
The bar is the user's best reference (round 2): a sakura tree against a red sun with halo
rings, cranes, karst peaks, a boatman, a torii in the water, on clean white paper with a
grainy dry brush. Every frame should hold that density of detail.

## Code

`styles/sumi-e/sumi.js` → `Sumi`:

| Call | What it paints |
|---|---|
| `stroke(g, pts, { w, ink, dry, prog, taper, blunt, press, color, seed, raw, core, bleed })` | a brush stroke: a solid wet core that narrows where the brush runs dry, overlapping bristles that leave white streaks (kasure) and a ragged edge. `ink` 0..1 is the tone (water, not colour), `dry` 0..1 how fast it runs out, `prog` draws it on |
| `cachedStroke(key, pts, opts, k)` | the same, as a sprite you move (`.draw(g, dx, dy)`): ripples, rain, distant figures |
| `dab(g, x, y, rx, ry, { ink, color, rot, rough, seed })` | a wet ink blob with a drying rim: heads, hands, buds, petals, moss dots |
| `wash(key, box, k, shapeFn, { ink, blur, rim, fade, grain, color })` | a soft-edged wet area (bokashi), granulated, optionally fading down into mist; returns a sprite |
| `mountains(g, env, key, { x0, x1, y, h, ink, peaks, sharp, blur, contour, cun })` | a boneless (mokkotsu) range: a wash dense under the ridge that dissolves into mist; contour and texture strokes are optional and off by default |
| `sun(g, env, x, y, r, { color, alpha })` | the sumi-e sun: a ragged disc with dry horizontal streaks (RED, or a grey) |
| `paper(g, env, box)` · `grain(ctx, env, { scale, ox, oy, amount })` | clean white washi (faint fibres), and the dry-brush grain over all the ink from `post` (screen-composited paper flecks and streaks, invisible on paper), anchored to the ground plane. `tooth` (an embossed relief) exists but the bar is ≈ 0.05 |
| `tree(c, { trunk, limbs: [{ p, a, len, w, d }], w, gnarl, seed })` | an old plum tree grown from a seed: a trunk with dark edges, a lighter hatched bark and knots, painted over the limbs' roots; each limb ONE tapering stroke whose leader zigzags on while side limbs fork alternately. Returns `{ tips, twigs }` for blossoms |
| `bloom(g, grown, { density, size })` · `blossom(g, x, y, r, { profile, bud })` · `petal(g, x, y, s, rot, { flip })` | blossoms at the tips and on young twigs (front and profile flowers, buds, red rings and dots in the air); a single flower (petals with pale veins, a deep red heart, ink stamens); a loose petal. `bloom` returns the flower positions (for petals that fall) |
| `crane(g, x, y, s, flap, { dir, tilt })` | a crane in flight: long neck and beak, trailing legs, wings as an arm plus fanned primaries; `flap` 0..1 on twos |
| `hill(c, { x0, x1, base, h, peaks, ink, mist })` | an opaque hill: broken dark ridge line, broad dry strokes running down the slope, foot lost in paper-white mist; returns the ridge (to stand temples and trees on it) |
| `peak(g, env, key, x, base, w, h, { shoulder, slant })` | an opaque, lopsided karst column (x = left foot): steep left side, slanted top, a shoulder on the right; black top from vertical strokes, streaks running down into mist |
| `foliage(c, x, y, w, h)` · `pagoda(c, x, y, s, { tiers })` · `pavilion(c, x, y, s)` · `torii(c, x, y, s)` · `roof(c, x, y, rw, rh)` | distant trees as flat pads of short strokes; temples as solid ink silhouettes with up-swept eaves and paper-white railings; a torii with its reflection |
| `reed(c, x, y, h)` · `halo(g, env, x, y, r)` · `mistFoot(c, x0, x1, y0, y1)` | reeds in the shallows; broken halo rings around a sun; fade what is clipped back to paper (opaque mist) |
| `seal(g, env, x, y, size, text)` | a red hanko with the characters cut out |
| `smooth`, `blobPts`, `fillPoly`, `tone`, `mix`, `INK`, `PAPER`, `RED` | helpers |

Figures: `sandbox/2026-11-04-red-thread/cast.js` (`Cast.figure`): ink silhouettes built
from a few strokes on an IK rig (fixed bone lengths, feet planted, hands as world targets).
It returns the hands as drawn: attach strings and props to those, never to the pose's
targets (a target out of reach leaves the prop hanging in the air).

## Style rules

- **One ink, many greys.** Tone is how much water: far mountains 0.15–0.2, middle 0.35–0.4,
  ground and figures 0.85–1. No other colours except vermilion.
- **Vermilion is meaning.** Only what the story is about is red (a sun, blossoms, a thread,
  a ribbon). If more than two things are red, nothing is.
- **The brush shows.** Every stroke lands blunt, leaves sharp and runs dry along its length.
  Thick strokes (trunks, banks) need `dry` ≥ 0.5 or they read as tubes; hair-thin lines
  (a kite string) use `dry` ≈ 0.15 and `taper: [0, 0]`.
- **One sheet, opaque.** The landscape is one painting: everything moves together with the
  camera (no parallax between layers), and every piece knocks out what is behind it in paper
  colour before it is inked. Mist is paper, never transparency. Layers that slide past each
  other, or washes you can see through, read as broken the moment the camera moves.
- **Landscape grammar (from the reference):** hills built from broad dry strokes down the
  slope with a broken dark ridge and trees on top; temples as solid black silhouettes with
  up-swept eaves standing ON a ridge; karst peaks lopsided and jagged, never symmetric
  rounded columns (they read as condoms); the far range as a pale wash. A contour, if any,
  is broken and dry: a continuous outline reads as wire.
- **Leave paper (ma).** Banks and sky are mostly empty paper defined by a few strokes: a
  shoreline, stones with moss dots, reeds, tufts. Washes along a whole bank read as a road.
- **Water (from the reference):** white paper crossed by long, flat, soft-ended grey bands
  and pencil-thin dark lines that run far across, darkest where it meets the far shore and
  fading to white towards the viewer. Reflections are the scene mirrored about its own water
  line (far landscape about the horizon, a bridge or thread about the surface under it),
  laid on in thin horizontal strips that shift and break with the current (`darken`, ~0.5).
  The land is opaque paper over the water: a shore of short broken strokes with gaps (one
  continuous line reads as a kerb), a damp grey band, stones with moss, reeds in the
  shallows.
- **A river must not read as a road:** never two parallel banks running to the vanishing
  point. Open it into a pool that reaches the bottom of the frame between promontories (and
  a corner of bank in the foreground), as in the reference.
- **People are ink silhouettes, no faces.** Who they are reads from posture, hair and
  clothes: a robe is one broad stroke pressed harder towards the hem; a hand at this size
  (figures 120–190 units tall) is one dab at the sleeve's end. Any close-up of a hand goes
  through the **hands** skill.
- **Motion:** figures and props on twos (`floor(t*12)/12`), camera and mist continuous.
  Keyed paths (camera, a kite) go through a monotone spline, never eased segments between
  keys: those stop dead at every key.
- **Paper and texture:** clean white paper (#f6f4ef), no embossed relief; the texture is in
  the ink: a dry-brush grain over everything (`grain`, ≈ 0.5), anchored to the ground plane.
- **Density of detail (the bar):** a frame has a foreground of detail (a grown tree with
  blossoms, reeds, stones), a middle ground with life (villages: pagodas and tree clumps;
  cranes; petals in the air and on the water) and a far ground of mist (washes, karst peaks,
  a sun with halo rings). A frame with fewer than three of these reads as a sketch.
- **Trees are grown, never hand-placed.** Branches drawn as a few hand-placed strokes read
  as sticks; `tree` gives angular zigzag limbs, alternate forks, straight young shoots and
  sharp tips. Keep its limbs out of the action's path (strings, faces).
- **Blossoms** are distinct flowers with a dark heart, not a red mass: density ≈ 0.45, size
  14–16 at a foreground tree. Red rings and dots around them are part of the look.
- **Forbidden:** outlines around everything, flat vector fills, gradients that look digital,
  colours other than ink and vermilion, cartoon faces.

## Style checklist

- [ ] Is red used only for what the story is about?
- [ ] Foreground, middle and far ground all carry detail (tree/reeds, villages/cranes/petals, mist/peaks/sun)?
- [ ] Does every piece hold up cropped at full resolution against the reference (joints, blossoms, wings)?
- [ ] Do thick strokes show dry streaks and ragged edges at full resolution (no tubes, no hatching)?
- [ ] Are mountains washes that dissolve into mist, with no continuous wire outline?
- [ ] Do the banks leave paper, and does the water read as water (wash, ripples, reflections)?
- [ ] Do figures read by silhouette alone, and do strings and props attach to the drawn hands?
- [ ] Does anything stop dead at a key (camera, flying objects)?

## Lessons

- 2026-11-04 · red-thread · `Ease.bump` in core is `(t, start, dur)`, not a 0..1 hump: passing one argument gives NaN, and the strokes fed by it silently vanish. Use a local `sin(π u)` for a hump.
- 2026-11-04 · red-thread · A brush made of thin parallel bristles reads as a striped cable: it needs a solid wet core that narrows where the brush runs dry, and few, wide, overlapping bristles on thin strokes (3 for a string), or they fall under a pixel.
- 2026-11-04 · red-thread round 2 · The user found the first test «missing detail» next to their best reference: measure the reference first (paper value, texture, what each element is made of) and build every element it has as its own kit piece, checked in a lab scene (`dev/kit-lab.js`) side by side, before composing the shot.
- 2026-11-04 · red-thread round 2 · A limb made of chained strokes shows a square step at every joint: draw a limb as one stroke from root to tip, start side limbs inside their parent, and paint the trunk over the limbs' roots.
- 2026-11-04 · red-thread round 2 · Things that cross the frame (cranes, petals) must be on screen during the shot, not entering in its last second: place them by where they are at the middle of the shot, then derive the start.
- 2026-11-04 · red-thread round 3 · The user called the landscape «a disaster»: rounded symmetric peaks «look like condoms», box temples read as nothing, and with the camera moving «everything shows through and some things move with the motion». Build landscape pieces opaque (paper knockout, mist as paper), paint the whole landscape as one sheet with no parallax, and copy each piece's construction from the reference (crop it 3× first) before drawing it.
- 2026-11-04 · red-thread round 3 · When layers are flattened, re-lay out the scene for every framing of the camera move (first and last frame): pieces placed for a parallax layer land elsewhere, off frame or behind the action.
- 2026-11-04 · red-thread round 4 · A thing's reflection is mirrored about the water surface directly under it, not under the viewer: a thread strung above a bridge reflects about the bridge's waterline, or its reflection lands far below and reads as a second thread.
- 2026-11-04 · red-thread animatic · Latin text in an ink film: a Western brush script (Kaushan Script) reads as brush; a Japanese brush font's Latin glyphs (Yuji Syuku) are a thin mincho. Keep the Japanese font for kanji (the seal). Never mirror the sun in the water at a wide framing: its reflection lands at the frame's bottom edge as a stain.
- 2026-11-04 · red-thread round 6 · The user wanted the text in Japanese: write it vertically (tategaki), columns top to bottom and right to left, brushed in character by character from the top, punctuation in the upper right of its cell, a red seal at the foot (`Film.writeVertical`, `Film.stamp`). Subset the Japanese font to the characters used (Yuji Syuku: 8 MB → 150 KB).
- 2026-11-04 · red-thread round 12 · The user found the figures and the kuroko «muy muy poco currados»: they were cut-out silhouettes (filled polygons, uniform straight bars). Paint a figure as sumi-e paints it: a faint wash for the body, then a few loaded strokes, each pressed at its start and running dry at its end (`press`, `dry`, curved paths through 4–6 points): one heavy stroke down the back, a lighter one down the front with paper left between, a sleeve that swells to its mouth, a hat as one flat stroke pressed in the middle. A giant figure is painted like a mountain: a blurred wash halo, five broad body strokes dissolving into bristles, a pressed arc for the shoulders.
- 2026-11-04 · red-thread round 12 · `Sumi.tone(v)` is ink at alpha `v`, so a grey over black stays black (the kuroko's veil vanished): paint paper first wherever something lighter sits on something dark, then the grey; and paint paper under a whole figure that stands in front of the sun.
