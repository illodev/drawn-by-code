# Brief for a stratum · souvenir-test, the second passage

Round 7. The user saw the film of nine pictures and said (translated):

> «It becomes visually repetitive from the moment we leave the lemon trees. The images from
> the lemon tree on are practically the same: what changes is the composition, but the
> essence of the first part has been lost, that there were different layers and different
> elements, and it has become more like a passage where there is always a hole in the
> centre that it goes through. Could we condense, even if the video lasts quite a lot
> less, the elements that appear from about second 15 into layers, so that it is more like
> the first part in its format?»

So pictures 3 to 9 stop being pictures. Each world becomes **ONE stratum of things**, in
the format of the film's first part (`tableaux/passage.js`: read it again, and look at the
first two rows of `review/sheet-1.jpg`: that is the format the user likes). After the
lemon tree the camera crosses seven strata, 680 apart, one every second and a half:
green · still life · dark night · dome · patio · planes · forge, and at the end of them,
seen small from the first, the full moon.

## What a stratum is (and what it is not)

- **Three sheets of loose things**: far, middle and near, at `z + 150`, `z` and `z − 160`,
  each with box `{ x: -1200, y: -720, w: 2400, h: 1440 }`. Each thing is an object, whole,
  with its own light and its cast shadow on what lies under it: a jug, a lantern, a
  peacock, an anvil. **No architecture and no frames**: no wall, window, arch, door, ring,
  ledge that runs across, plate or hole. Nothing that reads as «an opening one goes
  through».
- **A body**: the far sheet carries a thick mass of your world's own matter (in the first
  passage it is a wreath of embroidered flowers) that covers the whole box except the way
  through, so the things lie on something and nothing behind shows round them. The mass is
  made of many separate pieces lying on one another (leaves, cloth folds, smoke and
  candles, tiles and fragments, pots and flowers, pasted papers, copper and olive), with
  an irregular, organic inner edge. It must not be the same piece repeated: vary kind,
  size, turn and tone.
- **The way through** is only where the mass thins out: an irregular gap of about
  430 × 300 units about the origin (the passage's wreath keeps flowers out of
  `hypot(x / 430, y / 300) < 1 + r / 380`). Its edge is leaves, cloth, smoke: never a drawn
  rim. In the middle and near sheets nothing comes within about 300 units of the axis.
- **Things large, lying on one another, cut by the frame**: far sheet 2–3 things about
  330–420 units from the axis; middle sheet 2–3 things at 450–580; near sheet 2 things at
  650–720, the largest (500–700 units tall), which the frame cuts. Seven to nine things in
  all: the best of your picture, the ones that say your world at a glance, plus two or
  three small ones to find (a creature, a fallen thing). What is read is the 1600 × 900
  about the origin when the sheet is 1000 away; compose for that, and for 1250 and 800.
- **Your world's own light and colour stay** (the moonlit greens, the tenebrist lamp, the
  flames, the gold, the dawn, the ochres, the fire): the strata must differ from each
  other at a glance. Paint the light into the things and the body; a stratum has no
  background of its own (behind it is the next world's stratum, 680 away, and the night).
- Everything else as before: no people, no imitation script, deterministic, each layer
  under 10 s to paint at 1920, the detail bar of `agent-brief.md` → «Second pass» at 1:1
  and 2×, everywhere in the frame.

## Contract

In your `tableaux/<name>.js` (leave `Tableau.<name>` itself as it is), add:

```js
Tableau.<name>.stratum = (z) => [ /* three layers: ids '<name>-s-far', '<name>-s-mid', '<name>-s-near' */ ];
```

Reuse your `things/<name>.js` drawers (add what the body needs there). Your bench is a
copy of `dev/stratum/scene.js` at `dev/<name>-stratum/scene.js` (edit its top block): it
flies the film's camera through your stratum and two more copies of it behind, so you see
its sheets slide over each other and over a stratum beyond.

```bash
node engine/review.mjs sandbox/2026-11-19-souvenir-test/dev/<name>-stratum/scene.js   # contact sheet
node engine/render.mjs sandbox/2026-11-19-souvenir-test/dev/<name>-stratum/scene.js --at 1.16,1.6,2.2   # 1920 stills (1.16 s: the middle sheet is 1000 away)
```

Done when: (1) a still at 1.16 s reads as a rich heap of your world's things on its mass,
overlapping, the near ones cut by the frame, with the next stratum showing through an
irregular gap and NOTHING that looks like a framed hole or a tunnel; (2) it holds up at
1:1 and 2× everywhere; (3) consecutive frames show the three sheets sliding over each
other; (4) set beside the first passage (`review/sheet-1.jpg`, first two rows) it is the
same kind of image in another world. No git. Report in ten lines: the things and where
they are, what the body is made of, paint seconds of the three layers, measured values of
the 1.16 s still (luminance 5/50/95 %, median saturation), anything weaker than the rest.
