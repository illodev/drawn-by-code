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

## Round 6 (user)

> Las letras las pondría en japones y la música la generaría con mi elevenlabs, te dejo la
> key en varible de entorno ELEVEN_KEY. Las transiciones deben ser de otra forma por ejemplo
> con mancha de tinta china en el papel o algo así, no tan brusca

- Text: the title is 赤い糸 («the red thread»), the closing line 敵味方に分かれる前、
  私たちは隣人だった。(«Before we split into friend and foe, we were neighbours», from the
  user's «Antes de ser bandos, fuimos vecinos»), both written vertically, right to left, each
  character brushed in from its top; the seal is 絆 («bond»). Font: Yuji Syuku (subset).
- Transitions: every cut is an ink blot (`inkBlot` in scene.js) 1.2 s long, centred on the
  cut: a drop lands where the next shot's subject is, spreads with broad lobes and a
  feathered edge plus satellite blots, black where it landed and diluted towards the edge,
  with a wet rim just inside the edge (the mask minus a blurred copy); inside it the next
  shot shows through as the ink thins. First version had spiky polygon edges (per-vertex
  noise on a huge radius) and stroked outlines of every blot (a web of lines) → noise over
  the angle, and a rim from the mask itself.
- Music: ELEVEN_KEY was not visible in this session (environment variables load when a
  session starts). Prepared: `gen-music.mjs` (one section per shot), `music.mjs --sfx` (the
  synthesized effects alone), `mix-final.sh`. To run in a new session.

## Round 7 (user)

> Veo que hay varias transiciones de tinta cuando solo era una no? de los adultos a los niños
> … Es que creo que solo debería haber una transición no? en los demás no creo que deberan
> haber xd, o sea, la escena es la misma y mismo personajes, meter transiciones hay hace que
> se vea peor todo.

- One ink blot only, at 32 s (the adults' quarrel → the girl alone in the rain). Everywhere
  else the film is one continuous camera per act (0–32 s and 32–68 s): each shot keeps its
  last framing and the camera travels to the next shot's next key (first try dropped the
  shot's last key instead: at 50 s the camera crossed half the set in 1.4 s).
- Seams made continuous: the grey shot's camera ends on the kite shot's first framing; the
  rain and the overcast end at 36 s; the cranes enter during the grey shot; the kite's wind
  noise settles into the kite shot's first position; at 43 s the children ease from the kite
  shot's last pose into the new one and the boy's phone stays on the ground. Measured: the
  mean frame difference across every old cut is 0.2–4.8 (camera motion), no jumps.

## Round 8 (user)

> La transición de la tinta no me convence, quizás usaría algo similar a la del inicio

- The ink blot at 32 s → the title's bloom: the adults' painting is erased to blank paper by
  blots that grow from the foreground back (30.9–32.0 s), the paper holds a breath, and the
  grey shot blooms onto it sky first, then the land (32.0–34.2 s), with the same blot shapes
  as the title. Largest frame-to-frame change in mean brightness: 17 of 255.

## Round 9 (user)

> He añadido el conector de ElevenLabs … Ya he permitido el dominio, sigue con la música

- Score generated with the ElevenLabs connector (Music v2.5, 68 s, instrumental, one prompt
  describing the film's shape second by second; flow FifylNo6wfjLV6je96nl, four takes).
  Downloads need `elevenlabsusercontent.com` in the environment's allowed domains.
- Picked by measurement, not by ear: loudness per second (and below 150 Hz, the taiko) of
  each take against the film's target shape. Take 3: correlation 0.57, no near-silent holes
  mid-film, taiko through the build and the quarrel, a drop to near silence exactly at
  31.5–36 s (the act change and the grey shot), a fade at the end. Take 1 had silent holes
  at 43–44 and 51–52 s; take 2 was flat; take 4 choppy.
- Mix (`mix-final.sh`): the score under the synthesized effects at −9 dB (water, wind, rain,
  phone pings, thread snaps, splashes, the seal's bell; the synthesized taiko is off, the score
  has its own), one static gain to −15.6 LUFS, a limiter at 4× with auto-level off (on, it
  pushed the mix to −13.5 LUFS and 0 dBFS). The picture was not re-rendered: the new mix was
  muxed onto the round-8 frames.

## Round 10 (user)

> Cuando se cruzan los dos en el puente ~ 15s creo que está mal, porque van a un lado después
> se juntan, y des pues se van otra vez como si se buguearan. La música me parece muy sosa.
> Hay algo es que no hay motivo de pelea, o sea, se pelean sin ningún sentido no? Debería
> haber algo que le diera sentido. Hay gente que pisa el rio, no sé si está hecho a propósito.
> El sol se le va el rojo de una forma rara. Le daría una vuelta en general a pulir detalles y
> dinamismo

- The bump: on the recoil the men turned round (facing followed the walking direction, and
  stepping back is walking the other way), then turned again. Now people keep a lane on the
  bridge (right-goers far, left-goers near); the two men walk down the middle, bump, step
  back without turning (`faceHold`) and then each moves to his side and passes.
- A reason to fight: the screens turn neighbours into demons. From 21 s the slogans leave
  each phone, cross the river and land on a face on the other bank as a white oni mask
  (horns, furious brows, fangs); the quarrel is shouted from behind the masks. A mask cracks
  in two and falls when its wearer lets the phone go (shot 9) or when the old hands hold the
  thread (kasaL at 46.4 s, kasaR at 49.4 s). Sounds: an ink splat as each lands, a crack as
  each breaks.
- People in the river: `tools/check-feet.mjs` evaluates every pose on the timeline against
  the water; it found the boy's start, the girl's and a woman's way off the bridge, and the
  two elders' spots in shot 8 in the water. All moved; it now reports nobody.
- The sun: the red no longer closes as a ring from the edge; it fades evenly over the grey
  disc and comes back the same way.
- Life: a slow sway and head turns on everyone standing, the old tree swaying from its foot,
  the river's bands drifting with the current, cranes over the opening, a small camera shake
  on every shout that lands.
- Music: a second ElevenLabs batch with a more cinematic prompt (string orchestra with koto,
  shakuhachi, shamisen and taiko, a main theme, wide dynamics). Take 8: 19 dB between the
  empty screens and the quarrel, full at the return and the end; its own drop came 2 s late,
  so it is ducked to near silence at 31.3–35.6 s where only the rain plays.

## Round 11 (user)

> No sé si sería mejor una causa externa alegorizando al sistema que nos divide sin saberlo
> … Sí, sigue con el kuroko

- The cause is now outside the villagers: the kuroko, the black-clad stagehand of Japanese
  theatre whom everyone agrees not to see. A giant hooded figure rises behind the mountains
  at 12.6 s (eclipsing the sun, a low rumble), arms held out over the valley with his hands
  hidden in the sleeves; from each sleeve hangs a puppeteer's control cross (ito-ayatsuri)
  with black strings down to the phones. Nobody looks up. The slogans run down his strings
  into the screens and from there across the river as the masks; a black string lashes each
  red thread just before it snaps; the ink clouds are gone. After the act change he returns
  faintly at 43 s; each villager's string breaks when the phone falls (or, for the two men,
  when their mask falls), and with no strings left he dissolves into the mist at 54–57 s.
- First silhouettes read as a gate (a T of blocks) and then as a yoke with sacks: what made
  him read was a rounded hood falling over the shoulders, a mesh veil, arms reaching down
  and out with bell sleeves (no hanging tamoto), the figure low enough for the hood to be in
  the village framing, texture strokes kept inside the cloth (`source-atop`), and nothing of
  him below the far shore line (clipped, or he showed through the water as a ghost).

## Round 12 (user)

> La música no suena para nada japonesa y los ritmos no pegan en absoluto con las escenas.
> Tanto los trazos de los personajes como del kuroko, son muy muy poco currados. El Kuroko no
> me inspira nada, no entiendo en qué momento pasa todo a mal. Las máscaras igual, no se
> entiende. … Revelación por pasos · Kawaraban · Por escenas, solo japonesa

- Story told in steps. 11.0 s: only a black sleeve comes down out of the sky over the bridge
  and lets broadsheets (kawaraban, the Edo news sheets; they replace the phones, which were
  out of period) see-saw down into each pair of hands; nobody looks up. 17.5–21 s: one sheet
  comes up to the camera and fills the frame, a woodblock print headed 対岸に鬼あり («there
  are demons on the other bank»): in its picture the neighbour across the river grows a
  horned shadow and an oni face while we read. The wind takes it, and behind it everyone
  already wears the mask (no more flying slogans). 26.3 s: at the first shout the camera pulls
  back and up (zoom 1.12 → 0.7) and finds the whole kuroko for the first time, arms raised
  like a puppeteer's, a control cross in each sleeve, a black string down to every sheet.
  In act 2 the sheets are let go and blow out over the river.
- Brushwork: the adults are painted, not cut out (a faint wash, a heavy curved stroke down
  the back pressed at the shoulder and running dry at the hem, a lighter front stroke, a
  sleeve that swells to its mouth, the kasa as one flat pressed stroke). The kuroko is
  painted like a mountain: a blurred ink halo, five broad body strokes dissolving into
  bristles, a pressed shoulder arc, a dome hood and a lighter faceless veil (paper under it:
  `tone` is alpha, a grey over black stayed black).
- Music: seven ElevenLabs pieces, one per scene, traditional Japanese instruments only
  (koto, shakuhachi, shamisen, taiko): A 0–12 koto and shakuhachi greeting, B 12–18 sparse
  shamisen and one taiko for the sleeve, C 18–26 taiko heartbeat quickening to the crack,
  D 26–32 kumi-daiko and tsugaru shamisen for the quarrel, E 32–43 lone shakuhachi in the
  rain and koto for the kite, F 43–57 a rising koto melody, G 57–68 the resolution. Four takes
  each; picked by loudness per second against the scene (several takes died to silence
  halfway, one was silent). Laid at each scene's start and crossfaded 0.4 s across the cut.
  Effects: paper flutter for each falling sheet and for the close-up, the rumble moved to
  the reveal.

## Round 13 (user)

> Me sigue faltando alma en general. La parte final haría que los niños fueran los únicos que
> se enlazaran con la cometa y los demás con las máscaras hasta que se cree el puente y
> comprendan que son iguales, entonces se caen las máscaras y desaparece el Kuroko. Los hilos
> solo en la primera parte. Que el puente no aparezca de golpe.

- Act 2: only the children are tied, by the kite string. The adults keep their masks and
  their broadsheets (a man still pulls at the string, the others shout); no red threads come
  back to anyone, and the elders no longer hold the string. The kuroko is a faint ghost over
  it all, his strings still on every sheet.
- The bridge is woven from the string, gradually (53.4–58.6 s): five strands run out from
  both banks and meet in the middle with a red flick and a small bell, the deck first, then
  the rails (the kite string becomes the top rail), then eleven hangers tied from the ends
  inwards. The sun's red and the river come back with it, only partly.
- The children walk out and meet in the middle; they bow to each other (the greeting of
  the opening) and take hands (60.9–62.4 s). Then the adults understand: their masks crack
  and fall one by one (62.7–63.7 s), the sheets blow away, the strings snap, the kuroko
  dissolves (63.4–66.2 s), the sun fills, the tree blooms; the adults bow across the river
  and the first of them step onto the bridge. The closing line writes itself at 64.6 s.

## Round 14 (user)

> Esa persona atraviesa el hilo y se superpone, hay más que también. Los pájaros
> desaparecen. Creo que quitaría los hilos rojos del principio. La música no me gusta, quiero
> algo más lofi japonés y que vaya cambiando el ritmo.

- Overlaps: a new check (`tools/check-overlap.mjs`) over the whole timeline found the man who
  grabbed the string walking through it and the girl, the elders and two men standing on the
  string's line, and people placed on the same spot on both banks (the title, the right bank
  at 12–21 s, the edge in the quarrel, the act-2 banks, the women walking through the
  children at the end). Nobody grabs the string now; the adults shout from behind the
  children; positions respaced (about 0.35 of a height apart); the shot-5 positions are
  where the walks arrive (no jump at 25.4 s); the two women stop beside the children.
- Birds: one flight per act that leaves the frame (they were drawn only in some shots and
  vanished at 18 s and 43 s and appeared mid-frame at 62 s).
- No red threads in the first part either: the greetings are bows; red is the sun, the
  blossoms and the children's kite string.
- Music: Japanese lo-fi, one ElevenLabs piece per scene in D, each with its own rhythm:
  boom-bap 75 BPM (village), no drums (the sleeve), half-time trap (the broadsheet and the
  split), double time 140 with taiko (the quarrel), rain and shakuhachi with a beat fading
  in (grey and the kite), a building 85 BPM beat (holding on, the bridge; take F4 after the user asked for another take), a breath and the
  full beat (the meeting and the end). Picked by loudness per second.

## Closed (user)

> Lo doy por bueno

Approved as it stands after round 15; the final render is clean (no timecode: `ANIMATIC = false`).
