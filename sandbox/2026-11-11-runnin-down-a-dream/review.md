# Reviews · runnin-down-a-dream

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

## Before round 1 (user, while the style was being built)

- «Quiero hacer un vídeo, videoclip de la canción Runnin' Down A Dream de Tom Petty con
  estilo '90s cereal commercial, te paso video referencia de uno generado por claude»
- «Importante desde el segundo cero cada detalle contará, cada pixel tiene que ser perfecto.
  La canción acaba en el 4:21-4:22»
- «Referencias a Tom Petty And The Heartbreakers» (a band photo, the cover of *Full Moon
  Fever*, a frame of a band playing on a car)
- «Una cosa, no es un anuncio de cereales, es un videoclip. El estilo de cereal es referencia»

Translation: the reference gives the look only. A first plan with a cereal, a mascot and a
bowl was dropped before anything was drawn. The film is a videoclip with Tom and the band;
the tape, the tube, the cel drawing, the bursts and the lettering come from the reference;
the palette and the opening card from the album's cover. The video ends with the song's
fade (262 s).

## Round 1 (auto) · style test: the opening, 0–6 s

Built: the style kit (`styles/cereal-ad/`), Tom as a box person with his guitar (`cast.js`),
the song's clock (`song.js`) and the first three shots.

Measured on the reference rather than guessed: the glass (an inset of 2.2 % at the middle of
each edge growing with the 2.5th power to 5.7 % at the corners, a soft edge of about two
source pixels), a barrel of about 1 %, a 6 % fall-off, the bezel's black, the VCR's blue,
and the display's lettering (a thin slanted monoline with chamfered corners and a glow; its
place and size). The blue screen was compared side by side with the reference's first frame.

Seen and fixed, in three passes:

1. Character sheet at 500 units per head. The first Tom was a head on a guitar: arms as wide
   as planks hid the instrument, the hair hung over the whole jacket, the head box was twice
   as deep as it was wide. Fixed the proportions (longer legs and torso, a shallower head,
   arms 0.15 wide, the guitar at 0.86), gave the fringe curved curtains instead of a roof.
2. First stills. `PLAY ▶` sat on top of the name (now only over the blue); the card was
   mostly blank paper for half a second (the field and both lower bands now arrive with the
   first note, the moon rises through the pickup, the words land on notes 3 and 4); the
   title's words ran into each other (one line at 124, the big word at 246); the starburst
   covered the stage floor (the floor is drawn in front of it); scattered Memphis shapes
   fell behind letters and on top of each other (placed by hand now, and the twinkles too).
3. Full-resolution crops of the render. The sunglasses landed a drawing after the snare:
   with one global on-twos clock a hit on an odd frame waits for the next even one. Every
   event now ticks on twos from its own frame, and beats are snapped to frames.

`review.mjs`: no errors, deterministic, no flashes, no still stretches, 83 ms a frame warm.
One warning kept on purpose: the cut at 0.50 s is «off the beat» because it sits on the
guitar's first note (0.505 s), which is not on the grid.

Open questions for the user:

- Is Tom recognisable enough as a box person (blond curtains, blazer, red twelve-string), or
  does he need another signature (the top hat)?
- Which Heartbreaker plays what: they are assigned by look in the brief.
- Who made the reference spot, to credit it.

Not done yet, waiting for the style's approval: the README cover's carousel line and the
site's style line (new-style, step 7).

## Round 1 (user)

> «Se ve muy top, habría que ver como hacemos el resto de guion, que sea original y divertido
> con el toque "satanico" que tiene esta gente. Si no tienes la letra te la paso, por si la
> quieres de referencia, aunque ya sabes que normalmente letra y videoclip en estos temas
> tampoco tienen mucho que ver»

Translation into changes:

- The look and Tom are approved: they do not change from here.
- The script was only a list of places. Script v2 (brief.md) has a premise with a motor: the
  Devil as the tape's mascot, after Tom's signature, never getting it. Three ideas were
  crossed and the best of each kept (see the brief). The moon stays as the backdrop and as
  the solo's destination; it is no longer what is chased.
- The lyrics are a loose guide: each verse keeps its weather (sun, rain, night) and nothing
  else is illustrated.
- A first drawing of the Devil is in `cast.js` (`Cast.devil`) and on the character sheet
  (`dev/cast/scene.js`): a red box with cream horns, slit eyes, a grin with a fang, a
  goatee, a bow tie, hooves, a tail, a trident and the contract. It is a concept sketch to
  judge the idea, not a finished character.

Waiting for the user: the premise, who plays what, the reference's author.

## Round 2 (user) · the Devil

> «"Vale la premisa del Diablo-mascota", vale, pero el diablo que has pasado le hace falta
> bastante curro, lo que dije al principio, prefiero detalle e ir al pixel que algo rápido»

and, on who is who in the photo: Tom in the middle; Mike Campbell (lead guitar) in the white
shirt with the dark bandana; Benmont Tench (keyboards) with the curls and the green shirt;
Stan Lynch (drums) the tall one at the back in the striped shirt and dark jacket; Howie
Epstein (bass) with the curls and the dark waistcoat.

Translation into changes:

- The premise is approved: script v2 stands.
- The first Devil was a plain red cube with features stuck on, sent as a «concept sketch». It
  should not have been sent: a sketch shown to the user is judged as the film. Redrawn from
  nothing as a full character in its own file (`devil.js`): a head box with a pompadour and
  a widow's peak, curled ribbed horns through the hair, pointed ears, slit eyes under brows
  that carry five moods, a waxed moustache, a grin with a gold tooth and two fangs, a
  goatee, a tailcoat with satin lapels, studs, a pocket square and a spotted bow tie, cuffs
  with links, pinstriped trousers, cloven hooves, a tapering tail with a spade, a forged
  trident with brass ferrules, a contract on a scroll with a wax seal. Judged on crops at
  400 units per head and through the tape at film size, in every mood.
- The band's looks go to the right men (the brief had three of the four roles wrong).
- Work continues piece by piece at that bar: the four Heartbreakers, their instruments and
  the two cars are being drawn as separate files, each with its own sheet.

### Round 2 (auto) · «Sign here!», bars 4–7 (6.0–11.67 s)

Built: the crossroads (a sunburst sky, the day moon, mesas as boxes with strata, the two
roads in oblique, a crossroads sign, a saguaro, a tumbleweed), the Devil's arrival out of a
flame on the snare, SIGN HERE!, a quill conjured and thrown to Tom, the insert of the
contract (the Devil's eyes follow the pen over the top of the sheet while Tom's mitt writes
«To my #1 fan! — Tom», one stroke a beat), and his reading of it: glee, shock, rage (the sky
turns red, flames on his horn tips) while Tom hops off.

Seen and fixed on the first stills: the trident's fork sat on top of his left horn (the hand
moved out); SIGN HERE! ran over the moon (the moon moved down); the crossroads sign was
hidden behind him (moved to the right edge); Memphis shapes at head height read as clutter
(moved to the band of sky between the words and the heads); «SOUL» was printed twice in the
small print; the quill covered what it had just written (smaller, laid further over); the
Devil's raised arms behind the sheet read as stray red shapes (only his mitts on its edge
now); a small crater made the moon look surprised.

## Round 3 (user)

> «Se ve chulo, seguimos» · «Seguimos»

No changes asked. Work went on at the same bar.

### Round 3 (auto) · the band, the cars, the road, «the getaway» and «Plan B»

Drawn in parallel by three agents from one shared brief (style skill, kit, `cast.js` as the
model, the approved frames as the bar, one file and one dev sheet each, no commits), then
reviewed by the lead on their sheets and at film size:

- `band-strings.js`: Mike Campbell (shaggy dark hair, white jacket, the bandana, a cream
  solid-body, a solo stance) and Howie Epstein (curls, waistcoat, a sunburst bass).
- `band-rhythm.js`: Benmont Tench (a round mass of curls, the green western shirt, a combo
  organ on an X stand) and Stan Lynch (the tall one, striped shirt, a full kit with a
  cracked heart on the bass drum). The hi-hat stands on screen right so no arm crosses his
  shirt.
- `rides.js`: the band's car (a red hot rod with a stage for a deck, a wall of speakers,
  flames, whitewalls), the Devil's hot-rod hearse with a pulpit on its roof, a skeleton
  chauffeur, and the dust of a car peeling out.

By the lead:

- `world.js`: the road, the film's main set, in three weathers (day, rain, night). First
  pass had boxes for mesas (they read as office blocks: now sloped walls, a ledge, a flat
  top) and clouds over the sun and the moon (clouds now keep off them).
- `rig.js`: the band on its car and the Devil on his hearse keeping the beat by themselves
  (kick on 1 and 3, snare on 2 and 4, eighths on the hat), so a segment only says who is
  aboard and what the car does.
- `segments/getaway.js`, bars 8–11: the car skids in, the Devil leaps aside, the
  Heartbreakers pop aboard one per beat, Tom hops in, a wheelie, the dust swallows the
  Devil, he stamps, the hearse pulls up, he climbs to the pulpit. Seen and fixed: a
  foreground cactus of the road set stood on the Devil for the whole shot (a static shot
  draws no foreground layer); the near verge, where he and Tom stand, was under the glass
  (the camera now looks 46 units lower); the dust was a puff (2.5 times larger); two signs
  on top of each other.
- `segments/planb.js`, bars 34–38 (not yet in the film's order: verse 1 and chorus 1 come
  first): Hell's office, the blueprint, three imps. Seen and fixed: the lever was behind
  his head when he pulled it (moved down beside him); the cane changed length with its
  target (fixed length, turning towards the mark); the imps were too small to read.
- The first Devil sketch is gone from `cast.js`; `devil.js` is the only one.

`review.mjs` on 0–17.3 s: no errors, deterministic, no flashes, no still stretches, 87 ms a
frame warm; the one warning is the cut on the first guitar note, kept on purpose.

## Round 4 (user)

> «Cómo vamos?»

A progress question; no changes asked.

### Round 4 (auto) · verse 1, chorus 1 and Plan B in the film (17.3–55.4 s)

Four blocks animated in parallel, each one segment file with its own dev scene, from one
shared brief (the segment contract, the rig and the road, the rules that had already cost
rounds, the detail bar, exact screen states at the joins that are not hard cuts):

- `verse1a` (bars 12–16): cruising with notes streaming off the car, the hearse overtaking;
  the hitchhiker: a boater his horns go through, joke glasses, `RIDE?`; the car's pass
  strips the disguise and spins him like a top; the sign comes down on his horns, `RATS!`.
- `verse1b` (bars 17–19): the swapped sign: `HEAVEN` and `HELL` change nails, the band
  drives straight on, the chauffeur reads `HEAVEN`, salutes and takes the ramp into Hell's
  mouth.
- `verse1c` (bars 20–24): the pit dug a stroke a beat, a sheet painted like the road, the
  car hops it on a kick and the lip gives way under the Devil; then the flight.
- `chorus1` (bars 25–33): the landing, the title, a close shot of Stan's kick and its shock
  wave, the hearse bursting out of the road and being shoved back on every kick, the band
  close, the big wave that throws the hearse off; a cactus in shades at the wheel.

Lead's review, on each block's sheet and then on the assembled render:

- `verse1b`: the boards' original places were on screen for two frames, so the gag had no
  «before». Sent back: beat 68 is now a hold on the untouched sign, the swap starts on 69.
- `verse1a`: two foreground cacti of the road set crossed the hearse's entrance and the cut
  (`World.front` can now skip a cell; the shot skips those two).
- `verse1c` → `chorus1`: the flight ended with Tom at the wheel, the chorus begins with
  Tom on the deck. Found by the flight's own agent. Solved as an event, not a jump: at the
  top of the arc, weightless, Tom floats out of the seat and comes down on the deck while
  Mike drifts back.
- Shared files gained what three blocks had each worked round: `shadow: false` on the cars
  and the Devil, a `driver` hook on the band's rig, a chauffeur pose on the hearse's.

`review.mjs` on the whole 55.4 s: no errors, deterministic, no flashes, no still stretches,
95 ms a frame warm; the one warning is the cut on the first guitar note, kept on purpose.
Nine frames of the assembled render looked at, among them both sides of the one join that
is not a cut (35.62 and 35.70): the car comes down and lands in place.

Not done: the film has only been judged on frames, not heard against the track by anyone.

## Round 5 (user) · the first minute, heard against the track

> «Hay un par de detalles, Tom sigue cantando en partes en las que no canta y el cartel de
> runnin' down a dream, el primero sale un poco tarde y el segundo sale cuando dicen
> "Workin' on a mystery", te paso la letra entera» (the lyrics followed)

> «Otro detalle es que en el estribillo hay coros, no me acuerdo quien canta en los coros
> pero creo que te lo pasé antes. Y del 1:34 al 1:50 más o menos hay coros que dicen "uuhh
> uuhhh…" en el solo > 2:51 también por partes cada cierto tiempo dicen "uuhh uuhhh"»

Translation into changes:

- The film had only been judged on frames; the user was the first to hear it. Mouths were
  driven by a flag per shot («the vocal is in»), so Tom sang through every gap.
- Where the voices are was measured on the track (no listening): the verses' lead sits in
  the middle of the mix and the choruses' stacked voices and the «ooh» backing at its sides,
  so mid against side, and side alone, per sixteenth against the riff's bars, show them. A
  chorus is «Yeah» and five phrases in alternate bars. The windows are in `song.js`
  (`Song.LEAD`, `Song.OOH`, `Song.singing(t)`, `Song.backing(t)`), good to about a
  sixteenth; the solo's «ooh» windows are the least certain.
- `rig.js`: Tom's mouth opens only inside `Song.singing`; Benmont and Stan (the backing
  singers, by the line-up the user gave) sing inside `Song.backing`: the chorus's phrases
  and the «ooh»s. Segments that forced a singing mouth follow the same clock.
- Chorus 1's title: it popped a beat late and then again over «Workin' on a mystery». It now
  comes on the phrases that say it: on the first («runnin' down a dream», from the bar's
  second beat, the words as they are sung) and on the last (RUNNIN' with the big hit, the
  rest as sung, held to the cut). The second one moved right and the falling contract left:
  they collided on the first try.
- The break (1:32–1:50) has «ooh»s and the film is in the Devil's TV spot there: the spot's
  agent was told to give it a jingle choir of imps that sings them.
- Word-by-word timing was not obtained: the transcription connector has no upload tool in
  this session and its API is not reachable, and a fetch of public synced lyrics was
  blocked by the session's permission system. The user's ear is the check.

## Round 6 (user) · lip sync and a layering fault

> «las bocas no van sincronizadas con el audio»
> «Hay un fallo también en el contorno del hoyo se superpone al demonio» (with a screenshot)
> «Qué hace falta para que puedas hacer la transcripción?»

Translation into changes:

- Measuring the mix was not enough for mouths: it found phrases to within a sixteenth at
  best, missed that each verse's first line starts in the riff before it («It was a
  beautiful day» is sung at 12.5 s, during the getaway), and could not see words. What the
  transcription needed was an API key for the speech-to-text service, entered by the user
  through the session's secure form; with it the track was transcribed with word timestamps.
- `tools/make-vocals.py` turns that transcription (kept in `private/`, never committed) into
  what `song.js` holds: every sung word's start, end and a mouth shape (wide, half, round),
  and the eight times the title is sung. The words themselves stay out of the repo.
- `Song.mouth(t)` gives the lead's mouth for any frame (it shuts for a frame between words
  that touch); the rig uses it for Tom, and for Benmont and Stan in the choruses; Tom gained
  the half-open and round mouths. Tom now also sings in the getaway.
- Chorus 1's title follows the words: RUNNIN' on «runnin'» (35.62, the landing), DOWN A on
  «down», DREAM on «dream»; on the last phrase the whole title lands on «runnin'», which is
  the big hit, because the cut to Hell's office comes before «dream» is over.
- The pit in the digging shot was stroked after the Devil, so its edge crossed his coat.
  Layering fixed by the block's agent: floor, far walls and lip, the Devil clipped at the
  near lip, then only the near lip in front; his contact shadow is off where he has no
  ground under him. Checked on every drawing of the bar.

## Round 7 (user)

> «TOP!» (on the minute with word-level lip sync)
> «Otro detalle, el cactus sale tapado por la carretera» (with a screenshot of the getaway)

- The lip sync is approved.
- In the getaway the crossing road was painted over the road set's far verge, across a
  saguaro standing there. `World.back` takes `clear: [x0, x1]` (no cacti, rocks or signs on
  the far verge between those x) and the shot passes the crossing's span. Checked on a
  full-resolution crop. Rule for the style skill: a shot that lays its own piece over a
  generated set clears the set there first.

### Round 7 (auto) · verse 2, chorus 2, the break and verse 3 in the film (55.4–131.7 s)

Props first, then blocks, all in parallel from the shared brief (now with an addendum:
voices, the rig's new hooks, the weather props): `weather.js` (the rain machine as a
trailer, storm cloud and front, the canvas top and wipers, umbrella, ice block, calendar
pages, Hell frozen over), then eight blocks:

- `verse2a` a rainbow bridge for «anything was possible»; the cactus hits cruise control
  (the dash in a call-out, since a dash faces away in this projection), rubs his eyes and
  nods off; the hearse tows the rain machine in and it coughs out its first cloud.
- `verse2b` the cloud grows, the front crosses and drains the colour, MON TUE WED fly by,
  the top goes up, the band plays on soaked; the Devil cranks it himself, far too fast.
- `verse2c` the machine makes cold: the crank snaps, Hell freezes over (scarves, earmuffs, a
  snowman with horns, `HELL · CLOSED: SNOW`), the Devil in a block of ice at the roadside.
- `chorus2` the sun shoulders the clouds apart, the title as sung, the thaw (a sneezed ice
  cube, a towel), and the title's own letters come down on him: D, R, E as a wall he ends
  up behind, A and M on him; the title again on the last phrase.
- `breakad` a station bumper and the Devil's own TV spot in full cereal-ad form, with a
  trio of imps singing the track's «ooh»s as its jingle choir (added after the user heard
  them). `breakrew` the tape rewinds the spot and stops on the hidden frame.
- `verse3a` the sun pulls the night down like a blind; pedal down; the pass by the work
  site. `verse3b` billboards, the highway peeled up and laid on Hell's tongue, the car
  picking up everything of the Devil's, down the hatch.

Lead's review, on sheets and then on both sides of every join of the assembled film:

- **Blocks started a frame late.** The scene handed over on four-decimal times (55.4167),
  which can fall a hair after the frame: verse 1a, chorus 1, the getaway and three new
  blocks each lost their first frame (chorus 1's landing on the beat among them) to the
  block before, drawn out of its range. The order now uses `Song.B(n)`.
- **The sun left the frame.** It drifted left with the distance driven and was off the
  glass by the first chorus (found by verse 3a's agent). It now comes to rest near the
  left edge (`World.sunX`).
- Joins inside a continuing shot were closed by the blocks themselves: verse 2a → 2b and
  2b → 2c are pixel-identical at the cut; chorus 2's roadside was rebuilt on verse 2c's
  exported one when the two had diverged (machine hitched, block height, the scarf).
- The Devil's cold (teal scarf with white stripes) matches between verse 3a and 3b.

Open, for the next pass: the rewind was built on an earlier draft of the spot (it plays the
final one, but its glimpses were timed to the old); a `66` sign behind the hearse in the
thaw; one near cactus crossing the band in the billboards shot; the speedometer of verse
3a's pedal gag still out at its last frame.

## Round 8 (user) · the film to 2:12

> «Va de locos, me flipa!»
> «Pequeño detalle el hielo tapa el paraguas» (with a crop of the rain shot)

- In «Three days of rain» the sheet of water on the speaker stacks (pale blue with drips:
  it reads as ice) was painted in the late «everything the rain adds» pass, after Stan's
  umbrella, so it covered the umbrella's canopy. The stacks stand behind him: their water
  now has its own pass before the umbrella. Checked on three full-resolution crops.
- Also from the lead's own review of that render: a `66` road sign behind the hearse's
  pulpit in the ice and thaw shots (cleared with `World.back`'s `clear`), the one near
  cactus that crossed the band in the billboards shot (skipped), and the rewind checked
  against the final TV spot.
- The ten blocks animating the rest of the film were cut off by the account's usage limit
  and resumed on the user's «inténtalo de nuevo»; the four in Hell picked up from their
  files, the six of the finale had not written anything yet.
