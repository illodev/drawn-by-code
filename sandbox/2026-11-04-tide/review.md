# tide · review

## Style test v1 (round 1, automatic)

What was fixed before showing it, from the stills:
- Thin sand read as grey static: the grain field now mixes fine grains with clumps, coverage is a soft ramp, and a covered grain in a thin layer transmits amber (per-channel absorption, blue first).
- The lamp's falloff went grey: the vignette falls off per channel (blue fastest), so the edges turn amber.
- The palm sweep left a hard black line and scan-line striations: the ridge is a broad lumpy mound, the wake a thin streaked film with short soft arcs.
- A generic sweep from the horizon down read as an erasure, not a wave: the transition is now a crest of sand with a curling lip that rolls across from the right, the old picture ahead of its face, the new one behind.
- Towers rose like a bar chart: each is poured as a mound that flattens and straightens as it rises; crenels are notches scraped out, not round presses (they read as light bulbs).
- People drawn as sticks and lost on a black beach: thicker limbs, a dress and a long-hair mass for one, short hair for the other; the wet sand by the water is a middle layer so silhouettes and footprints read on it; the sea's layers stop at the shore so they do not add up into black.
- Pressed eyes glowed like torches on adults: removed on the walkers, kept tiny on the child.

`review.mjs`: no warnings, 37 ms/frame warm.

The user approved the style test and the story («si»).

## Film v1 (round 2): the whole story, 45 s, with sound

Built on the approved test: `cast.js` holds the set and the cast (the kid in the sun hat that
passes down the family, walkers, the woman kneeling, the old woman sitting with her stick, the
castles as plans, the wave, a gull, a sheet to make a figure appear or blow away, letters
written with a finger); `scene.js` is one cut-less timeline whose light runs dawn → morning
→ noon → afternoon → sunset → a blue night → dawn.

Fixed from the stills before showing it:
- The opening laid the sea and the beach through hard rectangular clips: the unlaid sand is
  now wiped back with a soft, wavering edge and loose grains.
- The castle's base heap read as a black puddle on the wet sand: thinner and flatter.
- The old woman read as a lump (thick trunk, head merged with the bun): bigger, a slim
  rounded back, the head held forward on a thin neck.
- Her dissolve was invisible: twice the grains, bigger, and they live longer on the wind.

Sound: an ElevenLabs Music take (60 BPM, guitar and felt piano; the take that opens near
silence, chosen by its loudness per second) and three generated effects (a wave on every
crossing, sand pours on the opening and the towers, the wind on the dissolve), mixed by
`mix.sh` into `private/mix.wav` (never committed).

`review.mjs`: no warnings, 35 ms/frame warm.
