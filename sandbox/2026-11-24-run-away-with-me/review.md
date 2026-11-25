# Review · run-away-with-me

## Round 0 · brief and the song's map (no picture yet)

The user's requests, translated:
- «I want to make a videoclip for "Run Away with Me" by Carly Rae Jepsen, in a retro neon
  style, but not the typical empty one.» Twelve synthwave references given (kept out of
  the repo).
- «I would like it to be very Miami: sex, drugs, party, the love of two people. Obviously
  the sex would not be explicit.»
- «The drug use would lead to lights, maybe "visual hallucinations"; we have to catch the
  music's jumps well.»

Done:
- Measured the song (`tools/measure-song.py`): 119.00 BPM with no drift, bar 0 at 0.415 s,
  sections from five bands per bar, every jump of level and bass on the beat grid.
- Word times from a local transcription (`tools/transcribe.py`, no paid service); chorus 2,
  which the model skipped, is chorus 1 moved by 33 bars, checked on a clip.
- `review/song-map.png`: bands, sections, jumps and sung phrases on one timeline.
- Script v1 in `brief.md`, every jump given its picture.

Open (asked): 16:9 and the whole song; permission to generate the two characters' design
sheets (about 433 credits a sheet, 4–6 sheets); words on screen (the title only, or also
neon signs).

## Round 1 · the style test (0:59–1:07), first render

The user, translated: «Yes, the whole song, in pieces, and we review as we go»; «yes» to the
character sheets; on words on screen: «I'd have to see it».

Done:
- **Cast sheets:** six generated sheets (three of her, three of him, gpt-image-2.5-sunburst
  at 2K, 275 credits each, 1,650 in all), asked on a pure green ground; they came back with
  a transparent ground (alpha), so no keying is needed. Kept in `private/ref/` until the user
  picks; `review/cast-*-options.jpg` shows them.
- **The style:** `styles/retro-neon/neon.js` (camera, light layer and bloom, tubes, glints,
  reflections, rim, the trip's toolkit) and `.claude/skills/style-retro-neon/` (in testing).
- **The style test** (`scene.js`, four shots on the bar lines of bars 29–32):
  A over the trunk behind the two of them, a lamp over them on every beat; B a fixed camera
  beside the causeway, the car coming in and drawing away towards downtown; C the crest in the
  bar without bass, a crane rising, the lamps dimming, then an in-breath; D the drop at 1:05
  («baby» lands on it): a flash, tracers from every light, halos, colour swinging pink to cyan,
  the city breathing on the kick, the deck and the bay turning into a grid of light.
- **Parallel agents:** the car (`props/car.js`) and the far world (`set/skyline.js`: sky,
  ~330 towers, a waterfront of Art Deco hotels with neon, a marina, the bay, the port and the
  cruise ship), from one brief (`briefs/style-test.md`). Both came back at the bar.
- **The causeway** (`set/causeway.js`): a planted median with shrubs and uplit royal palms,
  lamps every V × beat metres, neon tubes on both parapets, wet streaks on the asphalt, glints
  on the water, piers.
- **Faults found and fixed before showing:** light glowing through the car and the deck (two
  bloom passes, the car erasing the light behind it); tail lights burning to white; a sticker
  outline round the couple (rims on the picture only, thin); hue turning through green; lamp
  reflections as dots; a giant halo on the nearest lamp; the trip's grid over the car. Frame
  cost 310 → 210 ms at 1920 (bloom summed at low resolution).

Automatic review: no warnings, no state between frames; 222 ms a frame warm at 960.

Known and left: the couple costs ~40 ms a frame; shot A hides most of downtown behind the
hump (the crest is the reveal); the far world is ~70–90 ms in A and D.

## Round 2 (user) · «something more homemade, this drawn style, not a 3D render»

The user, translated: «Maybe I was looking for something more homemade, maybe this drawn
style, not a 3D render», with one of their references: a hand-drawn digital illustration of
a woman in a neon street (flat neon inks, a thick dark brush line, highlights laid on as
loose strokes of cyan, red and orange, buildings drawn with the same line).

→ Same world, cameras and timing; a new way of painting:
- Measured the reference's palette (k-means, 14 clusters): magenta #e106d3 18 %, navy
  #0f0138 15 %, salmon #f45a7f 10 %, deep blue #0e0558, violet #7407f0, blue #0f0ff1, indigo
  #200887, purple #ad19b0, plum #7a1581, cyan #67deef, with orange and gold accents.
- `styles/retro-neon/ink.js`: a brush stroke that tapers, varies its pressure and wobbles,
  with a new wobble on every drawing (12 a second: the line boils on twos); flat shapes with
  that line; loose strokes of light along an edge; patches of strokes.
- `tools/neonize.py`: the cast sheets repainted in the reference's inks per material (skin
  magenta → salmon → orange, white cloth violet → magenta, hair indigo), chosen against each
  material's median tone on a softened light (the sheets are a flat tone plus one shadow; a
  range mapping turned everything orange, a raw one made stubble into speckle), and the
  sheet's line thickened into ink. `ref/neon/`.
- `set/drawn.js`: the sky as brushed bands with stars and the reference's falling bars, the
  city as one drawn panorama laid through the camera, the bay as horizontal strokes under the
  lit columns of the city, the causeway with inked parapets, neon tubes, pools of lamp light
  in two flat tones, shrubs, palms in ink with strokes of light, lamps.
- The car (`props/car.js`) in a drawn mode: each opaque piece posterized to the palette and
  inked; the airbrush's translucent overlays, gradients and soft reflections dropped.
- The whole scene drawn on twos (time held for two frames), bloom kept only for the neon.
- Faults found before showing: a near lane dash drawn as a brush of its near width (a white
  blob: paint on the ground is a flat quad in perspective); every white turned red by the
  nearest-ink match (red only for real reds); gaps between sky bands (each band reaches the
  horizon); strokes of light on a near parapet ballooning (capped). Review: no warnings,
  100 ms a frame warm at 960.

## Round 3 (user) · «better, but many details and overlaps need refining: pixel perfection»

The user, translated: «Better, although many details and overlaps need refining. We have to
go to pixel perfection.»

→ An adversarial audit: 33 stills at 1920 (every 0.25 s), four reviewers who had drawn
nothing, one per shot, each cutting every frame into 480×360 tiles and reading them at 100 %.
About 80 faults, most of them shared:
- **Light through everything:** the drawn path had dropped the 3D path's occlusion; tubes,
  glints and the grid glowed across the car, the heads, palms and poles. Now the far world
  blooms first, and while the near world is painted every opaque Ink shape or stroke erases
  the light layer where it lies (`Ink.occlude`); the car still erases from its own layer.
- **The hump:** things beyond the crest drawn over the near deck (a V of tubes, cars on the
  water). Cutting each line at its first dip failed from the crane (the far road reappears).
  The deck is now two pieces, far (beyond the crest) then near, each with its standing
  things; a car is in the far piece only when all of it is past the crest.
- **The city:** laid with a bilinear quad, 10–35 px off its true projection, so its crown
  floated and its reflections missed it: now 96 exact strips, and the crown and reflections
  line up. Painted at screen scale, windows as two-floor bars.
- **Teleporting:** stars re-scattered every drawing (a skipped random draw), falling bars
  snapped back up, strokes of light re-placed every drawing (confetti): positions belong to
  the seed, the drawing only boils the line; sky things are fixed directions in the world.
- **Reflections where they cannot be:** lamp streaks 9 m long through the median, the car
  and the water: now broken strokes on the asphalt only.
- **Missing pieces:** parapet caps (the tube floated over water), the slot of water between
  the near parapet and the slab in shot B, the pier and tube reflections, a hole in the
  cockpit floor, the car's shadow, lamp bases.
- **Order:** shrubs drawn before every palm and pole: now sorted with them.
- **The car** (a parallel agent): its inks strobed on the beat (posterized from the lit
  shade): one ink per part now, the lamp laid on as strokes; seats, dash, tail, plate and
  wheels drawn; line weight by size.
- **The cast:** heads cut flat by the crop, fragments of the neighbouring views, his black
  hair a blob: recut with a margin, one connected piece, dark fills as hair.
- **The trip:** the screen-space rings crossed the car: hoops now stand in the world.
- **Shot B's camera** raised (the two tubes crossed in an X at the crest).
Then a second audit by two new reviewers on the corrected frames.

## Round 4 · the second audit (two new reviewers, A+B and C+D)

About 45 faults left after round 3, all fixed before showing:
- the dutch tilt of shot D tilted the world but not the sky and the bay (the city floated on a
  band of sky): sky and bay are now drawn in the camera's rolled frame, the sky's bands at
  fixed elevations (the crane no longer squashed them);
- palm crowns floated over flat-cut trunks: the trunk runs into a crownshaft and the crown;
  far crowns are flat silhouettes without ink (they had turned into a black shelf);
- the trip's hoops crossed the parapets and ended in a flat bar: arcs inside the parapets,
  only above the deck;
- the far tube was 4 px at any distance (a glowing V on her head at the crest): tubes and the
  grid's lines are as wide as they are at their distance;
- pools cut by a straight seam at the crest split: drawn in both pieces; near pools cut in
  the world; the median painted after the asphalt's contents, with its kerb faces;
- shrubs: spikes from overlapping lobes, then planter boxes: one envelope with bulging sides,
  a dark base and leaf clusters, light strokes lying on top;
- muddy translucent reflections: opaque palette strokes; pier reflections as broken strokes,
  not a film strip; the bay's band edges ragged and brushed;
- masts as hairlines beside a wide base plate: real thickness, lit edge on the edge;
- traffic as two boxes through the camera; the causeway now runs to the shore; the
  panorama reaches further left; falling bars kept off the road's column and the moon;
- the cast: a gold halo on both heads (removed), her strokes of light along the fall of the
  hair, the hair's inner lines in a hair ink, a stray piece of her shoulder (cut higher).
Review: no warnings; 137 ms a frame warm at 960.

## Round 5 · the second section: 0:47–1:39 (`drive.js`)

The user, translated: «I think we're going quite well; let's see if we can squeeze the 10 %
of the week's budget we have left in these 2.5 hours.» → the most film per token: the
approved causeway world, reused for the whole of bars 23–49 (52.4 s), no new set, no agents.

- `film.js`: the frame shared by every section (the far world bloomed, then the near world
  with occlusion, the car on its own layer, the trip, the flash) and the effects by song
  second: the bar without bass, the drop, the trip through chorus 1, and three blacks: «when
  the lights go out» (77.0 → the bar line at 79.07, 93.0 → 95.2) and the bar of near silence
  (97.22–99.24). In a black everything sinks into the night and the car and the two of them
  remain as a ring of neon (their layer grown a few pixels and cut by itself, glowing), with
  the tail lights; the lights come back with a flash. The style test now draws through it.
- `drive.js`: sixteen shots on bar lines. Pre-chorus: from high over the bay; low beside the
  wheels; the kiss on «lips in the streetlights» (close over the trunk, she leans into him,
  `Couple.drawn` turns each cut-out about the foot of the cut). Bars 29–32: the style test's
  four shots. Chorus 1: the grid from high above; low on the median side; the first black on
  «out»; the lights back beside the causeway; the crane; over the trunk in the trip; the
  second black; from above; the bar of silence pushing in on their outlines.
- The set is drawn forwards only (the deck from the camera's z on), so every camera looks
  ahead; shots from the front (their faces) need the causeway drawn in both directions first.
- The cast's front views are repainted too (`ref/neon/*-front.png`) for later.

## Round 6 · the whole song, in sections, by parallel agents

The user, translated: «Actually I don't care about the agents; the point is to spend that
10 %; for what we've done we've hardly spent anything really.» → the rest of the song is
built at once by six agents, one per stretch, on one contract:

- `sections/README.md`: a section is an IIFE that registers `Sections.<name> = { from, to,
  shots, setup, draw(g, env, T, d) }` in song seconds on bar lines; its setup's result lives
  in `env.state.sec.<name>`; its extra files are listed on its first line.
- `full.js` plays every registered section by song second (a card where one is missing) with
  the whole song; `drive.js` became the dev scene of `sections/drive.js`.
- `briefs/sections.md`: the brief every agent shares (the user's words, the files to read,
  the cast's limits: four standing views only, nothing explicit, one pill and its effect;
  the bar; what each may touch).
- The cast can stand anywhere: `Couple.standing(g, cam, who, feet, o)` with views front,
  three-quarter, side and back (the side views repainted by `tools/neonize.py`).
- Sections: opening (0:00–0:25, Ocean Drive and the party), escape (0:25–0:47, the pill, the
  bag, the car), drive (0:47–1:39, done), clouds (1:39–2:12, the high over the city), night
  (2:12–2:44, the night together by ellipsis), boat (2:44–3:18, the speedboat and the
  comedown), sunrise (3:18–4:13, the sun out of the sea, the title, the signature).

### Round 6 · what came back, and the second passes

Every section's first pass came back below the causeway's bar in the same ways: large flat
areas (sea, sand, road, roof, sky bands), empty lower thirds, figures as stiff mannequins or
robots, clouds as saucers, glows as concentric puddles, gold laid as dashes, light strokes
across the faces. Each got a numbered fix list from 1920 crops and a second pass:
- opening: the wet street mirrors every light; hotels with frames, eyebrows and their
  shadows, awnings, cafés; walkers, couples, dogs; a softer crowd (heads with hair, one
  shape per limb, far dancers as heads and raised arms); tall windows onto the night.
- escape: the opening's ballroom and Ocean Drive carry on (no second party room); a drawn
  still life with the pill; the bag on a real bed with the blinds' light bent over it.
- clouds: clouds lobed top and bottom in three inks; the roof, the diner and the laundromat
  lived in; wet streets with reflections and passers-by; far walls with cached textures.
- night: the room lived in (dresser, mirror, TV, door ajar, rug, the shirt draped), wider
  profiles (the sheet's pixels at ~1.2×), a Deco hotel.
- boat: the two of them waist-up behind a windscreen; the gold spreads as the hull's own
  ink; the dawn in brushed bands.
- sunrise: the sky in brushed bands fixed in azimuth; sea, swash and sand laid with strokes;
  a pier, a sailboat, gulls, a jogger and a dog.
- the cast (shared): its strokes of light only on the back view.
On screen as text, for the user to see: the invented hotel names (MOONGLOW, CORAL, PARADISO
and others), DINER, OPEN 24 HRS, LAUNDROMAT, HOTEL; the title and the signature.
