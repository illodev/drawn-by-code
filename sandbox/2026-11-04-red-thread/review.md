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
