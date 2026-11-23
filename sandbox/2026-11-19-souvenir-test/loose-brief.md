# Brief for a loose stratum · souvenir-test, round 8

The user saw round 7 (the film as two passages of strata, 30.5 s) and said (translated):

> «I want to change the soundtrack and the timing so that the camera keeps increasing its
> speed and keeps turning, because the pace is very slow.»
>
> «And maybe the pieces shouldn't be tied to frames; instead each one should be loose,
> floating.»

So two things change, and you do the second:

1. **The camera** (done, not yours): it no longer keeps one pace. It starts at about the
   old pace and gathers speed all the way (about 430 → 1700 units a second: a stratum
   every 1.5 s at the start, one every 0.4 s by the forge), then lands on the moon. It
   **rolls on its axis** as it goes, slowly at first and faster as it goes faster (one
   whole turn over the film, up to about 45° a second). There is no up and no down any
   more: the frame turns.
2. **The pieces come off their sheets.** Until now a stratum was three sheets (2400 × 1440
   boxes) with things painted on them and a body of matter covering the far one. Seen
   rolling, every sheet is a rectangle, a frame. From now on **every thing is its own
   layer, loose, floating at its own depth**: it turns slowly on itself, sways and drifts
   a little (the rig does that for you), and nothing holds it.

## What a loose stratum is

- **One layer per thing.** A jug, a lantern, a peacock, an anvil, one flower with its
  leaves, one tile, one scrap of cloth: each its own layer with its own depth. A layer is
  never a sheet with many things on it, never a ground, never a box painted to its edges.
- **Depths:** your stratum is a slab of depth from `z − 280` to `z + 280` (the next world's
  begins 680 further). Spread your pieces through all of it: no two large things at the
  same depth, so they slide over each other as the camera comes in.
- **Whole pieces, seen from any side.** What lay half hidden under something on the sheet
  is now whole. No cast shadow on a ground (there is none): a piece separates from what
  is behind it by its own contour, its own light and its depth (blur). No halo, no sticker
  outline.
- **Two kinds of pieces:**
  - **8 to 14 heroes**: the best things of your world, the ones that say it at a glance,
    250 to 650 units across, plus two or three small things to find (a creature, a fallen
    thing).
  - **40 to 80 pieces of your world's matter**: the body broken up. What was a mass on the
    far sheet (the wreath's flowers, the fig's leaves, the cloth's folds, the tiles, the
    smoke and candles, the copper and olive) now floats as single sprigs, flowers,
    scraps, shards, coins, sparks, petals, each a piece of its own, 40 to 200 units
    across, varied in kind, size, turn and tone (never the same piece repeated).
  - **Density:** at any moment the frame must be full of things at several depths, the
    night showing only in slivers between them. Their number is what fills the frame now,
    not a ground.
- **Around the axis, all round.** The camera flies down the axis: nothing comes within
  about 260 units of it (the guitar is the one exception, see below). Because the frame
  turns, compose in rings, not in a landscape: heroes 330 to 950 units from the axis,
  spread over every angle; matter anywhere from 280 to 1500, denser near the inside.
  A piece R from the axis is in frame while `R × 1000 / distance < ~600`: near the axis
  it grows large before it leaves the frame, far out it is seen only small and early.
- **Your world's light and colour stay**, painted into every piece (a light field over the
  whole stratum, like your relight / moon map / lamp, can be applied to each piece in its
  own paint, in world coordinates, with `source-atop`: then the pieces share one light).
  The strata must still differ from each other at a glance.
- **No architecture and no frames** (as in round 7): no wall, window, arch, door, ring,
  plate, ledge, hole. No people. No imitation script.

## Contract

In your `tableaux/<name>.js` (leave `Tableau.<name>` and `Tableau.<name>.stratum` as they
are), add:

```js
Tableau.<name>.loose = (z) => [ /* one layer per piece */ ];
// each: { id: '<name>-l-<what>', z: <depth in z ± 280>, loose: true,
//         box: { x, y, w, h },   // where it is painted, in stratum units: generous is fine
//         paint(g, res) { … },   // in stratum units, the thing at its place in the stratum
//         res?, brush? }
```

- **`loose: true`** makes the rig cut the layer to its paint (so the box can be generous:
  only what you paint counts) and float it about the middle of its paint. If a piece's
  paint reaches its box's edge, the render prints `[page] souvenir: loose layer … touches
  its box (widen it)`: no such line may be left. `loose: { spin, sway, bob, turn }`
  overrides its float (radians a second, radians, units, a fixed angle): leave the
  defaults unless a piece must not turn.
- Each piece paints in well under 3 s at 1920, the whole stratum in under 40 s.
- Reuse your `things/<name>.js` drawers and your stratum's code; add what the pieces need.
- Deterministic, as always (`Motion.rng(seed)`, no `Math.random`).

## How to work

Your bench is a copy of `dev/loose/scene.js` at `dev/<name>-loose/scene.js` (edit its top
block: NAME, USES, FONTS, SPEED). It flies a camera like the film's at that point (SPEED,
rolling at 0.6 radians a second) through your stratum and two copies of it 680 and 1360
behind, turned so they do not line up. `dev/loose/demo.js` is a demo stratum (the candle's
things and its wreath as loose pieces): it shows the mechanism, and is far too sparse.

```bash
node engine/render.mjs sandbox/2026-11-19-souvenir-test/dev/<name>-loose/scene.js --at 0.45,0.7,0.95   # 1920 stills (0.70 s: z is 1000 ahead)
node engine/render.mjs sandbox/2026-11-19-souvenir-test/dev/<name>-loose/scene.js --size 960            # the clip
node engine/review.mjs sandbox/2026-11-19-souvenir-test/dev/<name>-loose/scene.js                       # contact sheet
```

Read the stills; crop them at 1:1 and 2× with ffmpeg; tile consecutive frames of the clip
(`ffmpeg -ss T -i <mp4> -vf "scale=480:-1,tile=4x3" -frames:v 1 -update 1 sheet.jpg`).

Done when: (1) the 0.70 s still reads as a dense cloud of your world's things floating at
many depths all round the axis, every piece whole, no rectangle, ground or frame anywhere,
the night only in slivers; (2) it holds the detail bar of `agent-brief.md` → «Second pass»
at 1:1 and 2× everywhere; (3) consecutive frames show the pieces turning and drifting each
on its own, nothing flickering; (4) no «touches its box» line; (5) it is still your world at
a glance, set beside the others. **No git.** Report in ten lines: the heroes and where
they are, what the matter became and how many pieces, paint seconds, measured values of
the 0.70 s still (luminance 5/50/95 %, median saturation, share of frame that is night),
anything weaker than the rest.
