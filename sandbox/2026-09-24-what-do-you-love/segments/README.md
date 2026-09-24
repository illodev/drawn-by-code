# How the replica is built

A map for the next agent. The process and the lessons are in the `replicate` skill; the
rounds and the user's feedback in `../review.md`.

## Files (loaded in this order by `../scene.js`)

| File | Global | What it holds |
|---|---|---|
| `common.js` | `WL` | palette `COL`, lettering (`write` with felt-tip `halo`, `lineSpacings`, `textW`), the lined note (`note`, `noteImage`, `noteFlip` in perspective), the Claude **flower**, the **girl** puppet, the writing hand (`writingHand`), mittens, plane, trail, stars |
| `sets.js` | `Sets` | backgrounds: interior (girl between wall and desk layers), sky with torn bands, exterior (house + window + town), desk, notepad (measured `PAD`/`SHEET`), `penAt` |
| `shots.js` | `Shots` | one function per named shot in `scene.js` (`'Notepad · writing'`, `'Tear'`, `'Fold'`, `'Flower · reads'`…) |
| `things.js` | `Things.kit` | the object contract and helpers `place` (cached sprite at x, y, s) and `cut` |
| `things/*.js` | `Things.<name>` | one montage object per file, drawn 1:1 at scale 1 on its card |
| `montage.js` | `Shots['Montage']`, `Shots['Heart']` | the 13 cards and the heart: object placement, the flower's per-drawing performance, bursts, words, pop-in order |
| `exterior.js`, `town.js` | | (being rebuilt: the town collage, printed-paper planes, the exterior shots) |

## Contracts

- **Objects:** `Things.x(g, x, y, s, t, part?)`. `t` is global time, so objects know their
  own drawing (`Math.floor((t - start) * 12)`) and whether they are on their card or in the
  heart (`t >= 16` → simplified miniature). `part` is `'back'` or `'front'` for objects
  the flower sits inside (or `Things.x.back/.front`).
- **Cards:** `CARDS` rows `[start, end, word, background, thing, [x, y, s], ink, order]`,
  `order` = `'over' | 'under' | 'split'`. The flower's performance is `STEPS[thing]`, one
  row per drawing: `[face x, face y, ray reach, vertical stretch, expression, face tilt]`.
- **Flower** (`WL.flower(g, x, y, R, o)`): rays cut once and only scaled on twos; `o.sy`
  stretches the rays, never the face; `o.pose: 'holding'` with `arms`, `elbows`, `legs`,
  `mitt`, `note(g)` drawn between body and hands; `o.frontArc` draws some rays over
  `o.note` (a caught plane); expressions via `eyes`/`mouth`.
- **Girl** (`WL.girl(g, x, y, s, o)`): `pose` picks arms from `ARMS` (shoulder, elbow, hand)
  and hands from `HANDS`; `layer: 'body' | 'arms'` so the desk can go between; the hand
  positions for props come from `WL.girlHand(pose, i, x, y, s)`.

## Where the numbers come from

Every table (`STEPS`, `BURST`, `TEXT`, `TEAR`, `FOLD`, `CATCH`, `READS`, `ANSWER`, `PAD`,
`SHEET`, the objects' control points) was measured on the reference with
`engine/reference.mjs` (`track`, `face`, `box`, `runs`, `colors`, `cuts`) or traced from
full-resolution crops with a grid. When changing one, measure again rather than nudging
by eye, and compare the stretch with `compare --crop`.
