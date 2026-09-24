# Reviews · pixel-building

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

## Round 1 (auto)

**Measuring.** The reference is 1080², 10 fps, 51 frames. Pixel runs along the sign's
letters alternate 4 and 5 video px: the art pixel is fractional. `grab.mjs grid` tried every
grid from 64 to 480 cells and found 230 cells (4.696 px); finer grids (460) rebuild slightly
better only because they split each cell in two, so the tool keeps the coarsest grid within
20 % of the best error.

**Palette, three attempts** (wrong art pixels per frame against the reference's cell centres,
colour distance > 40):

| Attempt | Palette | Wrong cells / frame |
|---|---|---|
| every sampled colour votes | 279 colours, mostly codec noise | — (too many to encode) |
| only cells with a same-colour neighbour vote | 155 | 87 |
| + «unmix» lone cells towards saturated entries | 155 | 111: the right saturation, the wrong hue (magenta dots came out red) |
| + colours that only live in lone cells get their own entries | 178 | **51.5** (0.1 % of the 52,900 cells) |

The TV screen was the test: single dots in magenta, mint, purple and green on blue. Those
colours never appear in two adjacent cells anywhere, so a palette built from flat areas
cannot hold them; the median of the cell's inner pixels already has the right colour.

**Result.** `compare --every 0.5`: 1.4 whole frame; crops (roof, middle floors, the street
and van, the sign) 1.5–2.2 at 640 px per crop. Full-resolution frame-by-frame: mean
absolute difference 2.2/255, all 51 frames. Looked at: 6× zooms of the TV room, the courier
at the statue, the roof machine and kid, the sign with the passer-by and his «Gm» bubble,
the green room with the heart bubble, at 0.45, 1.65, 2.95, 4.25 s. Every sprite, bubble and
loop lands on the same frame; the remaining differences are the reference's codec blur
around dark lone pixels (eyes, outlines), visible only in the difference image.

`review.mjs`: no warnings (deterministic, no flashes). Template: no warnings.

**What could be better.** The actors are cut automatically, so a few group two things
(`plantAndTiger`, `courierAndStatue`, `doorAndEye`) and three are specks (`dishGlint`,
`laptopLed`, `groundSpeck`); a hand pass could split them. The ~50 remaining wrong cells per
frame are 1-pixel dark details whose true colour the codec destroyed.

## Merge (lead)

- The sprites in `building.js` were read off the reference pixel by pixel: that is the
  artist's work transcribed, not drawn by code. It moved to `private/` (gitignored) with the
  render made from it; the scene loads it as optional and shows a note without it. The kit,
  `grab.mjs`, the template and the skill are merged; the style's strip is the template's.
