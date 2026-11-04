# Reviews · red-thread

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

## Round 1 (auto) · style test «The kite» (7 s)

Built the sumi-e kit from the user's four references and the first shot: the gust carries
the girl's red kite across the river and the boy catches its string.

What was seen and changed, in order:
- The brush read as a striped cable (thin parallel bristles, no ink body) → a wet core that
  narrows where the brush dries, wider overlapping bristles, edge bristles that wander.
- The paper's tooth read as a stucco wall and repeated as a grid → a 512 px tile, amount
  0.45 → 0.17, anchored to the ground plane so it pans with the sheet.
- The red string was invisible: `Ease.bump` takes `(t, start, dur)`, so the poses got NaN;
  and thin strokes had six sub-pixel bristles → a local hump, and 3 bristles for a string.
- Mountains with a continuous outline and «icicle» texture strokes read as wire → boneless
  washes with a darker band under the ridge, contour and texture off by default.
- Washes along the banks read as a grey arch / a road → banks left as paper: a wandering
  shoreline in two strokes, stones with moss dots, reeds; the river got a pale wash and
  mirrored mountains.
- Figures: the girl's ponytail read as a beak and the ribbon as a red eye → a bob with a
  fringe, the red ribbon tied at the back, a robe pressed wider towards the hem.
- The catch failed: the string passed above the boy's reach and attached to his hand's
  target in the air → the kite dips lower, the string is anchored to the hands as drawn.
  He now lets his phone fall to the ground (it lies there, its light fading) as he reaches.
- Camera and kite stopped dead at every key (eased segments) → monotone spline.
- The kite started tangled in the tree → moved clear; it now rhymes with the grey sun.

`review.mjs`: no warnings; 33 ms/frame warm.

Open questions for the user:
- The river runs from the far mountains towards the viewer; it still reads a little like a
  road from some frames. Alternative: a river crossing the frame sideways, the two banks
  near and far (but then «two sides» reads less clearly).
- The closing line «Antes de ser bandos, fuimos vecinos.» is a proposal.

## Round 2 (user)

> No está mal, pero quizás me faltan más detalles y atención a los detalles, mi mejor
> referencia es esta. (image: a sakura tree against a red sun with halo rings, three cranes,
> karst peaks, pagodas on wooded hills, a boatman, a torii in the water, reeds, red petals)

What the reference has that the test did not, measured on it: pure white paper (254) with no
relief; a grainy dry-brush texture inside every stroke; a gnarled trunk with dark edges and a
lighter hatched inside; angular, finely forked limbs with sharp twigs; distinct blossoms with
dark hearts, pale veins, red rings and dots; a sun fading from red to pink with halo rings;
cranes; karst peaks running down into mist; tree clumps and pagodas; reeds in the water;
petals in the air and on the water.

## Round 2 (auto)

- Kit: `grain`, `tree`, `bloom`/`blossom`/`petal`, `crane`, `peak`, `foliage`, `pagoda`,
  `reed`, `halo`, a sun that fades; paper → clean white, tooth → 0.05. Each piece checked in
  `dev/kit-lab.js` (tree: chained strokes gave square steps at the joints → one stroke per
  limb, trunk painted over the roots; blossoms a red mass → fewer, larger; cranes too small →
  wings as an arm plus primaries; peaks with stepped sides → a smooth column, streaks clipped).
- Shot: the bare tree became a grown plum tree with the last red blossoms in the world; the
  gust strips them and the petals follow the kite across, settle on the river and drift. Two
  villages (pagoda + tree clumps) on either side, karst peaks behind the right bank, three
  cranes crossing the grey sun with its halo, reeds in the shallows, broad grey water strokes.
- Figures: no wet bleed (it left a pale box around them), a sash and collar on the girl, a zip
  and pocket on the boy, the ribbon hanging downwind instead of sticking out.
- Composition: the tree's low limb crossed the girl and the string → limbs reshaped to keep
  the right side open; pagodas shrunk (they read as tall as the girl); the sun moved right so
  the kite does not sit on it at the start; cranes placed to be on screen during the shot.

`review.mjs`: no warnings; 62 ms/frame warm.
