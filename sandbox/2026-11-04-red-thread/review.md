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

## Round 3 (user)

> Te paso de nuevo la referencia. El paisaje es un desastre, las montañas parecen condones y
> los templos no sé ni que decirte, con el movimiento se transparenta todo y unas cosas se
> mueven con el propio movimiento, en general, un desastre

Translated into changes: (1) peaks: the symmetric rounded columns → lopsided jagged karst
built like the reference's (black top of vertical strokes, a shoulder, streaks into mist);
(2) temples: stacked grey boxes → solid ink silhouettes with up-swept eaves and white
railings (a five-storey pagoda, a pavilion like the reference's), standing on the ridges;
(3) transparency: washes and mirrored mountains were translucent → every piece knocks out
what is behind in paper, mist is paper, the reflections of the mountains are gone; (4)
«things move with the motion»: layers had parallax (0.25–1.12) and drifting mist → the whole
landscape is one sheet that moves as a single painting; only the kite, the children, petals,
cranes, wind and water move on their own.

## Round 3 (auto)

- `dev/land-lab.js` rebuilds the reference's middle band piece by piece: hills (first an
  icicle fringe → broad strokes down the slope), peaks (blob with stalactites → a toned body
  under the streaks), trees (broccoli → flat pads), paper (mottling made the opaque pieces
  show as slabs → plain sheet).
- Re-laid out for the first and last framing: the left village (hill, pagoda, trees) between
  the tree and the girl; the peaks right of the sun; the pavilion on the right hill between
  the peaks and the boy, clear of the kite, which now climbs away after the catch; cranes
  higher, clear of the kite; one limb shortened off the string; the water as wide soft bands.

`review.mjs`: no warnings; 43 ms/frame warm.

## Round 4 (user)

> Sí, sigue con el río y el agua

## Round 4 (auto)

- Measured the reference's water (crop 2×): white paper, long flat soft-ended grey bands,
  pencil-thin dark lines running far across, mirrored objects in broken horizontal strips,
  red petals floating, reeds in the open water, shores as broken strokes with a damp band.
- The river no longer runs as a corridor to the vanishing point (it read as a road): it
  opens into a pool that reaches the bottom of the frame, held between the girl's and the
  boy's promontories and a corner of bank under the tree.
- Water: one cached sheet of bands and fine lines; reflections of the far landscape, the
  grey sun, the broken bridge and (after the catch) the red thread, laid in strips that
  drift and break with the current. The thread's first reflection was mirrored about the
  wrong line (it showed as a second thread far below) → mirrored about the bridge's waterline.
- Land: opaque paper over the water, shores of short broken strokes (a single line read as a
  kerb), ground strokes along them, stones with moss, grass; reeds in the shallows and two
  clumps out in the water.

`review.mjs`: no warnings; 56 ms/frame warm.

## Round 5 (user)

> Vale, la frase me sirve, sigue con el animatic

## Animatic v1 (auto)

The whole film, 68 s, 11 shots, on the approved style test's set. Structure:
- `kite.js` (RT): the set, now driven by a world state (sun red/grey, bridge intact → cracked
  → fallen, river ink, tree bloom) and shot 7 unchanged. `film.js` (Film): one timeline for
  every villager, the threads (born, slack, snapped, reborn), shouts, slogans, clouds, rain,
  petals, text. `scene.js`: the edit. `cast.js`: adults (kasa hat, long kimono with bun, old
  woman and old man with canes).
- Music: `music.mjs` extended to 68 s (yo scale for the village and the return, in scale
  from the screens to the kite; phone pings, taiko on each shout, string snaps, rain, a bell
  on the seals).

Seen and fixed before showing:
- Yuji Syuku's Latin glyphs are a thin mincho, not a brush: Latin text → Kaushan Script.
- Thread reflections in the village shots doubled the red lines all over the water → off
  there (kept for the one thread after the catch).
- The sun's reflection showed as a red stain at the bottom edge → the sun is not mirrored.
- Shot 8: the other villagers stood around the girl and hid her → off frame until shot 9;
  kasaL and kasaR come in behind the children, the elders in front.
- Shot 8's pan (1070 units in 1.6 s at zoom 1.25) tripped the jump check → 2.2 s, and the
  right bank's events moved 0.6–0.8 s later (music re-cued).
- The title over the sun → in the empty sky right of it, the seal under its end; the closing
  line above the sun with its seal after the last word.

`review.mjs`: one warning, «flat frames» at 0–0.2 s: the blank sheet before the ink blooms,
intentional. 155 ms/frame warm at 960.

Known animatic-level gaps (for the final): crowds read as dark masses in shots 2–5; slogans
and clouds are placeholders; the children's hand-holding in shot 2 and the hug in shot 10
are rough; no sound effects beyond the score.
