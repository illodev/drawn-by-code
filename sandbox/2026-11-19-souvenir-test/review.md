# Review · souvenir-test

A new style (souvenir) and its style test: «Recuerdo de Andalucía», the emblem and the dive
through the guitar's mouth into the lemon tree. The reference (a video game's intro
sequence, given by the user for its style only) stays in `out/` and none of its content is
reproduced.

### Round 0 · the study and the plan

**The user:** «I want to make similar art, but not the same. It is only the reference for
the style.» Asked what world ours should paint: «Andalusia, and deep references, some
harder to understand and others less so. Magic, enchantment (embrujo), rootedness, culture,
poetry, art, and so on. We can debate it.» No people for now.

What was measured on the reference before drawing anything (brief.md has the table): one
continuous dive through five nested paintings, each in its own manner and its own hue
family; blacks lifted to 0.21–0.43, lights at 0.73–0.85; near layers far out of focus; a
radial smear through every hole. A script of five pictures of Andalusia was proposed to the
user to debate (brief.md); the test builds pictures 1 and 2 and the way between them.

How the paint was found, in the order it failed:

1. **A distance field as the volume** gave a faceted lemon (a crease along the ridge that
   the light finds). → a balloon over the outline (∇²u = −1, √(4u)), exact for spheres.
2. **A correct sphere looked like a 3D render**: bump-mapped pores read as hammered metal,
   and the gradient was airless. → pores a tenth as deep, a ramp of eight tones with the
   shadows redder and deeper, a raking light so a third of the form is in shadow.
3. **Brush strokes as translucent colour** flattened it again (pale strokes lifted the
   shadows). → strokes painted in greys on mid-grey and read back as tone before the ramp.
4. **Leaves all from one point, all flat to the camera, all the same gloss** read as a
   wallpaper. → shoots (a twig, leaves alternating along it, fruit hanging by its stalk,
   blossom on pedicels at the tip), every leaf at its own attitude, three lights for a
   leaf, a gloss only some have, a broken painted edge.
5. **A dark, moody tree** (median luminance 0.33 against the reference fruit picture's
   0.50). → the far layers are green light, not darkness (0.47).
6. **The emblem manner** (contour + airbrush) was set on the fan: carved sticks, a pleated
   leaf with a face in the light and one in shade on every fold, a garland painted across
   the pleats and shaded by them, lace.

Bugs worth remembering: a hole cut with `destination-out` after a painter that left a
translucent `fillStyle` was only 30 % cut (the lemon tree showed veiled in indigo through
the guitar's mouth); texture tiles pasted one by one left a seam; twelve averaged
exposures of the whip-in showed as twelve ghosts (now smeared along the zoom).

The rest of the emblem (guitar, olive and carnations, swallows and moon, ribbon and key,
castanets, cards and a pomegranate) was painted by five agents in parallel from
`agent-brief.md`, one file each, while the lead built the camera, the lemon tree, the fan
and the embroidery of the night.

### Round 1 (auto) · the emblem assembled

The five agents came back in about 40 minutes, all at the bar on their first pass (their
reports are summarised in the style skill): a flamenco guitar with a rosette of Granada
marquetry and its maker's label inside the mouth; olive arms with olives in three
ripenesses and carnations built petal by petal; two swallows of about 150 pieces each, a
moon painted on a sphere with its real seas, eight-pointed stars; the ribbon as one strip
of cloth with «SONIDOS NEGROS» set on its curve, an old gilt key, a horseshoe; castanets
with their cord and tassels, three aces of the Spanish deck, a pomegranate with seventy
arils.

What I saw on the first assembly, at full size, and what changed:

- **The moon sat on the fan** (its earthshine read as a dark blot on the silk) · 2.6 s ·
  → moved to the one corner of sky the fans leave, with three stars.
- **The ribbon was cut by the bottom of the frame** and too near (its layer was 60 in
  front) · whole hold · → its own layer 20 in front, higher, and the camera looks 52 units
  below the axis during the hold, coming back onto it to go through the mouth.
- **The olive was hidden behind the fans** · → two arms hugging the guitar, in front of
  the fans' sticks, behind the carnations at the waist.
- **A swallow's wing lay across the moon, the other across the pomegranate** (tangents:
  each read as part of the thing behind) · → both birds moved clear.
- **An idea found while composing:** the key had no place of its own, so one swallow now
  comes back with it in its bill (Bécquer's swallows return; the key of the house that
  was left). First placed by eye it hung 30 units from the bill: read off a render, moved,
  checked at 1:1.
- **Flat frames at 0–0.5 s** (`review.mjs`: a single colour) · → the night has its stars
  from the first frame; they stream outwards when the camera leaves.
- **The flare was a stock lens flare with two long arms** · → an eight-pointed star, four
  long rays and four short.
- **The rosette was never seen large and sharp**: the camera crossed the last 900 units in
  a few frames and the smear ate it · 3.8–4.0 s · → a key at 3.92 s makes the approach
  linger on the mouth (the guitar grows to twice its size in half a second) before the
  0.7 s plunge.

`review.mjs` on the final render: no warnings, deterministic; one large jump outside cuts,
at 4.00 s, which is the camera going through the mouth. 192 frames at 1920 × 1080 in 3 min.

Known and left for the user to judge (not evident faults, choices):

- No sound yet. The reference's own is not used; a score would be generated only with
  the user's go-ahead.
- The lemon tree's blossom is smoother than its leaves; its twigs are thin.
- The capitals of the motto take 41 % of the ribbon's face, not the half that was asked
  (the text is wide in this typeface); the ribbon was lengthened to 980 instead.
- The agents' good helpers (airbrush and contour for `form` sprites, turning geometry
  instead of the canvas) still live in their own files: to move into the kit before the
  next picture is painted.

### Round 2 (user)

**The user:** «I think we are on the right track. I would like it to be packed with
details, and very worked at the level of every pixel, like the reference. Do it with a
great deal of detail and with quality.»

What it means, from a 1:1 side by side of the two emblems (the reference's figures and
flowers against our fan, swallow and guitar):

- **The reference has no quiet patch.** Between its figures the ground is a carpet of small
  painted flowers and leaves, each with its line and three tones; ours has large areas of
  regular fill: the silk of the fans (stripes), the indigo ground (a ghost of embroidery),
  the guitar's top. Repetition is not detail.
- **Its paint varies inside every shape** (strokes, folds, temperature); ours is clean
  gradient plus tooth: vector with an airbrush.
- **It is full of things to find**; ours can be taken in at once.

The plan (a second parallel pass, six agents, one file each, while the lead works on the
paint itself and the composition):

1. The fans as real painted fans: a miniature landscape on each silk leaf (Granada: the
   Alhambra under the Sierra Nevada; Seville: the Giralda and the Torre del Oro on the
   river), blonda lace, pierced sticks, a tassel.
2. The night's ground as a dense painted shawl (peonies, jasmine, leaves, birds), and
   verses ghosted in it.
3. Papers: a poster of the 1922 Concurso de Cante Jondo, a street-name tile, a lottery
   ticket, a stamp, a matchbox.
4. Wares: a botijo, a bottle of fino and its glass, a peineta, a biznaga of jasmine, feria
   lanterns.
5. Creatures and water: bees, a butterfly, a ladybird, a lizard, a gecko, a goldfinch, a
   snail, dew drops.
6. The lemon tree: thorns, green lemons, blemished leaves, clusters of buds, drops, and a
   denser composition.

The lead: a hand in the paint (strokes inside every fill, edges that are not ruled), the
guitar's wear, a wider first framing so the corners hold the collage, more time on the
emblem.

**The user, a few minutes later:** «References can also be made to the history of
Andalusia, its civilizations too: Tartessos, Phoenicians, Greeks, Carthaginians, Romans,
Visigoths, Byzantines, Muslims, and so on.»

What it becomes: (a) a string of coins hanging from the ribbon, one per people and in
order (Carambolo gold, the tunas of Gadir and Melqart, the Barcid elephant, the plough of
Obulco, Hadrian's Hispania with her rabbit, Leovigild's tremissis of Seville, the cross of
Spania, a Caliphate dirham, an Almohad dinar, a square Nasrid dirham, the excelente with
the pomegranate, the Pillars of Hercules on a piece of eight); (b) a wheel of relics round
the emblem, oldest first (the Carambolo pectoral, a murex and its purple, the Corinthian
helmet of the ría de Huelva, a Baetican oil amphora, a mosaic of Italica, an eagle fibula,
a votive crown of Torredonjimeno, a Byzantine cross, an Andalusi astrolabe, the fawn of
Madinat al-Zahra, Nasrid cut-tile work). Arabic script on coins and instruments is
suggested as a Kufic texture, never written: the real legends are religious formulae.
Three more agents (coins, relics, heirlooms). To debate with the user later: the whole
dive as a descent through time, each picture an older layer, down to Tartessos.

**The user, later:** «I would also include references to the poets, artists, religion and
so on, that passed through, were born in or chose this land. I would make it have darker
parts (almost mystical) and lighter parts, more abstract parts and more realistic ones,
hidden references… I don't know if I am explaining myself well. The length of the video
does not matter.»

What it means: contrast is the structure. The film is no longer five pictures in one key
but a longer dive that alternates dark and light, abstract and realistic, and every
picture hides references. A script of nine pictures is proposed to the user in brief.md
(the emblem, the lemon tree, the green dream, a tenebrist still life, the dark night, the
dome, the patio, the guitar broken into planes, the forge and the moon). For the emblem,
now: two more agents: the books of its poets and thinkers with their names on the spines
and a painter's palette (library), and objects of devotion of the three faiths (a Holy
Week candle, a thurible, a jet rosary, a Sephardic lamp, a silver hand amulet), without
faces and without sacred text written out.

#### Licences taken and facts not checked (from the painters' own reports)

The relics follow real, documented types, painted from knowledge and not from a source
open on the table. What their painters flagged, so nobody takes it for more than it is:

- **Carambolo:** the string's pendant is a composite of the hoard's motifs (no such disc
  exists); on the pectoral the layout of the rows, the petal count and the tube are from
  memory; the chain is the necklace's.
- **Gadir:** where the crescent, the pellet and the letters sit varies by issue; the
  Melqart head carries its club behind the neck as asked (most issues put it elsewhere).
- **Obulco:** the name is on the reverse here (usually by the head); the Iberian signs are
  plausible shapes, not a real legend.
- **Leovigild, Spania:** the cross on the king's breast and the cross on steps are the
  brief's choices, not types vouched for at that mint and denomination.
- **Excelente:** Roman capitals (early issues are Gothic), simplified quarterings.
- **The piece of eight:** the Pillars type was struck in the American mints (this follows
  Mexico's), not in Andalusia; it is here for the silver that came in through Seville and
  Cádiz, and for PLVS VLTRA.
- **Arabic script** on the Caliphate, Almohad and Nasrid coins and on the astrolabe is a
  texture of strokes, never text. A reader of Arabic should look at it before it is
  published. The devotional objects carry no imitation script at all.
- **Helmet:** the type's stock ornament, not the Huelva helmet's own. **Amphora:** the
  stamp and the painted name are from memory. **Mosaic:** a partridge in the manner of the
  House of the Birds, not a copy of a panel. **Stele:** a composite of the warrior stelae
  and the later lettered ones. **Murex pendant:** a later type than early Gadir.
- **Eagle, votive crown, Byzantine cross, astrolabe, fawn, tilework:** true to their types;
  the cell layouts, the cross's form, the rete's plan and the fawn's proportions are the
  painters' within the type. The votive crown hangs drops, not letters.
- **Devotion:** the niche plaque was left out (no such Andalusi ivory is known); jet
  rosaries belong to Santiago more than to Andalusia; silver filigree hands are more
  Maghrebi and later than Nasrid; the Sephardic lamp's type is debated between Spain and
  southern France.
- **Fans:** the Generalife is to the left of the Alhambra, as seen from the Albaicín.

### Round 2 (auto) · the second pass assembled

Eleven agents, about an hour, one file each (their reports are distilled into the style
skill). What came back, all at the bar on the first pass:

- **The fans** as painted fans: Granada at dusk (the Sierra Nevada, the Alhambra along
  its crest tower by tower, the Albaicín) and Seville by day (the Giralda, the Torre del
  Oro, the Triana bridge, boats on the river), each bent along its arc across the pleats,
  with «Recuerdo de Granada / de Sevilla» in a cartouche, tulle lace and pierced sticks.
  One fan dark and one light.
- **The ground** as a mantón de Manila: 11 075 embroidered motifs in satin stitch (the
  tone of every thread from its angle to the light), verses woven into the damask.
- **Thirteen coins** hanging from the ribbon, one per people, as struck reliefs.
- **A wheel of relics** round the emblem: the Carambolo gold, a murex and its purple, a
  Corinthian helmet, a Baetican amphora, a mosaic of Italica, a stele; an eagle fibula, a
  votive crown, a Byzantine cross on gold mosaic, an astrolabe (a true stereographic
  projection for 38° N), the fawn of Madinat al-Zahra, Nasrid cut-tile work.
- **Papers** (the poster of the 1922 Concurso de Cante Jondo, a street tile «Calle de
  Elvira», a lottery ticket, a stamp, a matchbox), **wares** (a botijo, fino and its glass,
  a peineta, a biznaga, feria lanterns), **the library** (fourteen spines from Seneca and
  Ibn Hazm to Lorca and Zambrano, a palette marked «D·V», the score of «El amor brujo»),
  **devotion** (a Holy Week candle, a thurible, a rosary, a Sephardic lamp, a hand amulet).
- **Creatures and water**: bees, a swallowtail, a ladybird, the ocellated lizard, a
  gecko, a goldfinch, a snail, dew.
- **The lemon tree** rebuilt: lemons at every age and from three sides, eight kinds of
  leaf with their blemishes, wood with thorns and scars, blossom at every stage, ants on
  the bough, sun dapples; six layers instead of four.

The lead's part: `brushwork` (strokes that follow each finished layer's own forms, a
drift of the mix: no edge moves), the painters' shared helpers lifted into the kit
(`sheet`, `sprayIn`, `stamp`, `reliefField`, `frame`; checked in `dev/kit`), a fix to
`S.dab` (it painted nothing on a path of two or three points: two painters' scuffs were
silently empty for rounds), the film retimed to 10.5 s with a wide arrival and a 3.3 s
push over the emblem.

What I saw on assembly, at full size, and what changed:

- **Half the wheel was cut by the top of the frame** (pieces placed for the guitar layer's
  scale, not their own) · 1.75 s · → every piece re-placed whole inside what the widest
  framing shows of its layer (x ±1100, y −567…+671).
- **The lanterns hung in front of the crown, the palette and the comb** · → behind
  everything else on their layer.
- **The castanets and the stamp lay on the poster's headline** («CANTE JONDO» could not be
  read) · → the castanets onto the score of «El amor brujo», the stamp by the ticket; the
  poster reads from GRANADA to the date.
- **A swallow's wing tip touched the pomegranate** (a tangent) · → the fruit moved clear.
- **Objects of devotion carried bands of imitation script** · → left plain; the niche
  plaque left out (no such ivory is known).
- **The moon sat where the thurible's smoke rises** · → moved out along the fan's edge.

### Round 3 (user)

**The user:** «I like the quality of the details, they are quite accomplished. It does not
matter now whether they are more or less faithful to reality: what matters now is that
the message is there; in post-production we will review it and fine-tune it if needed.
The cover is incredible because it has a lot of references, but there is a problem: it
shows that there are a lot of symbols and they have been put there scattered all over the
paper. Another thing, I don't know if you noticed it in the video I sent you: the camera
travels and there are always elements overlapping. It is not a poster that the camera
approaches. It is overlap after overlap. So it would be good to break it down, above all
so that it is not seen as a drawing with a lot of references but as a passage of things
that come into view. Things I don't like: the entrance, not at all. It says nothing to
me; I don't think the star fits, nor that sudden zoom. I understand you took it from the
video I gave you, but we will have to look for something softer, something that makes
more sense in this art and in this matter of Andalusia. Let the camera go deeper, and as
it goes deeper the overlapping elements appear; not a collage of elements put there for
the sake of it. It is fine, it is cool, but there is not even time to see it all, and it
does not need to go so slowly that everything is seen: it is more that it goes in depth
and that not everything appears at once.»

What it means:

- **A picture is a passage, not a poster.** The emblem was a flat collage on ten planes
  within 150 units of depth: the camera approached it. Its pieces are redistributed along
  the axis in strata hundreds of units apart, each overlapping the next and leaving a way
  through; each stratum comes out of the dark, is crossed and uncovers the one behind.
- **The order means something:** depth is time and light. It starts in the dark with a
  candle and incense, crosses Tartessos and the sea, Rome and the Goths, al-Andalus, the
  house and the fair, and reaches the guitar; then the lemon tree in full day.
- **The entrance** (a star, a flare, a whip-in: the reference's own device) is gone. The
  film fades up from the night on a candle flame and the camera simply starts to go in.
- **Speed:** a steady advance; nothing waits to be read.
- Fidelity of the relics is left for later, as the user says.

### Round 3 (auto) · a passage, not a poster

Built as the user asked. Picture 1 is now `tableaux/passage.js` + `tableaux/emblem.js`:
five strata 680 units apart and then the guitar, each stratum three sheets (far, middle,
near) with a way through on the axis. Every layer has `far`: it comes out of the night as
the camera nears it. The camera only goes in, at a steady pace (about 500 units a second:
a stratum every 1.3 s), with focus a stratum ahead; it settles on the guitar for a second
and a half and goes through the mouth. 15 s.

- **The entrance:** the film fades up from the night on a Holy Week candle and a thurible
  with its smoke, the flame warming what is near it; no star, no flare, no whip.
- **The order:** by the candle (the three faiths) · Tartessos and the sea · Rome and the
  Goths · al-Andalus · the house and the fair · the guitar · the lemon tree. Darkest at
  the start (a veil of the night on the paint, lighter stratum by stratum), full day at
  the end.
- **The guitar is seen at the end of the tunnel** from the second stratum on: what the
  passage goes towards.

What I saw on the first two tries and changed:

1. **A green rectangle in the middle of the night** (the lemon tree's plates showing
   before the guitar that hides them had faded in) · → the tree only appears once the
   guitar is whole.
2. **Loose things floating in haze**: the strata were rings of small separate objects, so
   it was the same scatter, in depth; and focus 1000 ahead with strata 680 apart left most
   of them soft · → each stratum has a body (a wreath of the shawl's own flowers and
   leaves round the way through), its pieces are 1.3–1.5 times larger and lie on one
   another, the near ones cut by the frame; a smaller aperture and less veil.
3. **A lantern hung on the axis, over the guitar's head** · → the string raised.

The emblem itself keeps only what is its own (guitar, fans, wreath, carnations, ribbon
and coins, swallows, moon); a far copy of the shawl, three times larger, keeps the night
embroidered from the far end of the passage.

`review.mjs` on the final render: no warnings, deterministic; the only large jumps outside
cuts are at 11.33 and 11.50 s, the camera going through the mouth. 360 frames at
1920 × 1080 in 23 minutes (the steady advance needs five to eight exposures a frame).

## Round 4 · one pace, on the axis, and a defocus that holds still

The user, of the passage: the camera should keep the same rhythm all the time; the blurs
flicker and are not well made; it should not pause on reaching the guitar, nor go up to
get into the guitar.

- **The camera:** `z = −775 + 432 t`, nothing else. No ease at the start, no settling on
  the guitar, no lingering on the rosette, no acceleration into the mouth, no rise (`y`
  is zero for the whole film: the mouth is on the axis, where the camera already was) and
  no roll. The night lifts and, at the end, comes back while the camera goes on (the last 0.9 s). 14 s.
- **The focus:** 1000 ahead of the camera for the whole film, in place of a track that
  ran ahead, rested on the guitar and racked to the tree. Each layer's blur now depends
  only on its distance.
- **The defocus (the kit's rig):** what flickered, found by tiling six consecutive frames
  of a corner: frames 1–3 crisp with combs along every edge, frames 4–6 suddenly soft and
  streaked. (1) The radial smear of the whole frame, sized by the nearest layer and
  switched on past a threshold, is gone: each layer is softened by its own step between
  exposures. (2) Layers are drawn from a pyramid of halves, never point-sampled from the
  full painting (the combs). (3) The blur's reduced copy keeps 3–6 px of blur and a fixed
  grid. (4) Exposures are counted against each layer's own blur (2–5 a frame, not 8).
  The same six frames now differ by a hair each.

Checked on the render: the contact sheet (every stratum sharp as it passes 1000, the
guitar on the axis, the mouth crossed at the same pace), and consecutive frames tiled at
three places (mid-passage, through the mouth, the end). `review.mjs`: deterministic, no
still stretches; it flags flat frames at 13.83 s, which is the film's last frames inside
the fade back to the night, as meant. 336 frames at 1920 × 1080 in 18 minutes (23 before,
for 360). The style's template has the same camera now and passes too.

## Round 5 · the other seven pictures

The user, after the film at one pace: «let us go on with the next layers». The script of
nine pictures in `brief.md` was taken as proposed (dark against light, abstract against
realistic), no people, the camera untouched.

- **Seven painters in parallel, one picture each**, from `picture-brief.md` (the three
  corrections so far as rules: packed, a passage, nothing depends on the camera) and a
  common test bench (`dev/picture/scene.js`: the film's camera through one picture, with
  stand-ins for the picture before and after). Each delivered `tableaux/<name>.js`,
  `things/<name>.js` and its bench; each contact sheet was read before assembling.
- **Assembly (`scene.js`):** every picture starts 700 behind the plate of the one before.
  What had to be solved there:
  1. **A hole on nothing is a blue disc.** With every layer fading in at its own distance,
     the picture behind a hole was still in the night when the hole was read, and, at
     the second try, its plate was (a violet disc in the middle of the lemon tree, of the
     fig, of the still life) · → a whole picture, plate included, comes out of the night
     together with the plate it is seen through; the picture after it is timed on the
     distance that plate would have kept on its own, so only one picture ahead is out.
  2. **«The innermost circle, which is light» showed a blurred blue dome** · → the gap
     behind the dark night's hole holds five thin veils of gold light: the camera comes
     out of the light little by little, and the dome clears.
  3. **The moon was whole for a quarter of a second** (painted 1200 behind the last
     olives) · → she and her sky are placed 4.8 times farther and drawn 4.8 times larger,
     kept sharp: she barely grows while the cave and the grove go by, and the camera, at
     its pace, has four seconds of sky with her and the signature.
  4. **The lemon tree had no way out** · → a ragged hole in its plate, in the dark rest
     between the two lemons.
  5. **A film of a hundred layers** · → the rig frees a layer once the camera is well
     past it.
- **The signature** `illodev x Claude` in the ribbon's letter, in the moon's silver,
  under her tuberoses; it comes up as the grove leaves the frame.

### Licences and unchecked facts (the painters' own lists, kept)

- **Green:** the moth's veins and the frog's iris recoloured to keep one warm colour;
  frost on summer leaves; glass tambourines; the cistern seen straight down. Not checked:
  whether *Graellsia isabellae* lives in Andalusia; the ship's rigging.
- **Still life:** see the painter's notes at the top of `tableaux/stilllife.js`.
- **Dark night:** candles in banks, not the triangular tenebrario; the veil is embroidered
  wool (Seville's is painted linen); the circles and the mount are evocations, not copies;
  no script anywhere. From memory: the escape by knotted blanket strips, the veil's
  rending on Holy Wednesday.
- **Dome:** the walls folded out flat; the muqarnas as rings of zigzags, not the real plan
  of thousands of prisms; the stacking of three ceilings into one ascent is imaginary;
  swifts given a cup nest; epigraphic bands filled with knots, no script. From memory:
  the Byzantine tesserae of al-Hakam II's mihrab, the Nasrid polychromy.
- **Patio:** the architecture compressed, the eye a metre above the floor; arch geometry,
  peacock anatomy and Fajalauza decoration from memory; the tower is generic.
- **Planes:** the newspaper «La Brisa», its street and its news are invented (not checked
  that no real paper had the name); the date and number on it are the painter's birthday
  and year; pigeon wing and peg heads from memory.
- **Forge:** the vault lit by an invented bounce of the fire; the full moon shaded as a
  sphere lit from the upper left; «zumaya» read as a scops owl; horse brasses on an
  Andalusian bridle; the palace on the hill is generic; seas and craters approximate.

### Checked on the render (round 5)

- The film was rendered in sixteen pieces of 4 s (the container restarted twice during
  whole renders; pieces on disk survive) and joined without re-encoding: 1512 frames, 63 s.
- Every pair of consecutive frames compared (mean absolute difference at 480 px, each
  against its six neighbours): no jump anywhere, none at the joins, none where a plate is
  dropped or a picture comes out of the night.
- One frame a second of the whole film read as two sheets: nine pictures, each first seen
  through the hole of the one before, the signature legible for the last three seconds.
- `review.mjs` on the whole scene: no warnings, deterministic, no still stretches (35
  minutes: it samples frames out of order, and each one repaints its layers).

## Round 6 · music

The user, with the film rendering: «can we put music on it?» Offered: one piece per
picture, one continuous piece, synthesised by code, or not yet; the user chose **one
continuous piece**, and, once the price could be read (an estimate costs nothing: 1 760
credits a take, 7 040 for four), **one take**. It was charged 960 credits.

- **Generated** with the ElevenLabs connector: a `music` node, Music v2.5, 64 s,
  instrumental. The prompt (sound only, the film's shape in seconds): «Solo flamenco
  guitar, instrumental: one nylon-string Spanish guitar alone, no other instruments, no
  vocals, no percussion except taps on the guitar's wood. E Phrygian. One continuous
  63-second take whose energy evolves: it starts from silence with slow, dark, free-time
  arpeggios over a low open string (first 9 seconds); a strong rasgueado strum around 10
  seconds; a brief bright major-key falseta, light and quick (until 16 s); then slow and
  mysterious, soft tremolo over sparse low notes (until 28 s); the darkest part, single
  deep notes with long gaps and soft knocks on the wood (until 34 s); it opens into
  flowing rising arpeggios that brighten and gather a 12-beat bulerías pulse (until
  47 s); fragmented, dissonant, percussive, stopping and starting (until 53 s); driving,
  heavy, hammered rhythmic strumming, intense (until 59 s); it ends on one full chord
  left to ring out into silence. Intimate, close-miked, dry and woody, natural room
  reverb.»
- **Measured, not heard** (level per second and per tenth of a second): one chord at
  second 0 that decays to −46 dBFS by second 8; the strum at 9.0–9.3 s (the guitar is in
  focus at 9.7); a quieter stretch at 30–33 s (the dark night is 28–34); dips at 42 and
  50 s; the last chord at 59.0 s (the grove leaves the frame at 59.0) ringing out to
  62.9 s. It is laid from second 0 uncut.
- **Done to it** (`score.sh`): the tail of the first chord lifted (up to +14 dB at 8 s)
  so the passage is not near silence; −15 LUFS, peak −1.5 dBFS; cut at 63 s.
- The take is the user's and stays out of the repo (`private/`); the committed render is
  silent until the user says whether it should carry the music.
- **Not known:** whether it sounds like a flamenco guitar, whether the lifted tail hisses,
  whether the sections say what the pictures do. Nobody here has listened.

## Round 7 · the worlds as strata, not pictures

The user, of the film of nine pictures: «It becomes visually repetitive from the moment
we leave the lemon trees. The images from the lemon tree on are practically the same:
what changes is the composition, but the essence of the first part has been lost, that
there were different layers and different elements, and it has become more like a passage
where there is always a hole in the centre that it goes through. Could we condense, even
if the video lasts quite a lot less, the elements that appear from about second 15 into
layers, so that it is more like the first part in its format?»

What went wrong was mine, in the brief: «a picture seen through the hole of the one
before» seven times over is seven tunnels with a framed hole (a window, an arch, a ring, a
door, a sound hole), however different the paint. The first part was liked for something
else: strata of loose things lying on one another, with the way through only a gap.

- **Each world is now ONE stratum of things** in the first passage's format
  (`stratum-brief.md`): three sheets, seven to nine whole things, a body of the world's
  own matter (fig leaves; linen and cabbage leaves; veil, velvet and candles; fragments of
  tile, plaster and mosaic; geraniums and pots; pasted papers; copper and olive), no
  architecture, no frame, no hole. The same seven painters recomposed their own things.
- **The film:** first passage → guitar → lemon tree → seven strata 680 apart → the moon.
  30.5 s (63 before). The moon is what the second passage goes to, as the guitar is for
  the first: small between the two lemons, half her size when the last stratum goes, and
  four seconds alone with the signature.
- **The lemon tree's way out** was a round hole in its plate (a dark eye in the tree): it
  is now wider than what the gap between the lemons lets the camera see, so the opening is
  edged by leaves.
- Sent back before assembling: the forge (a violet haze of soft copper discs: smoke taken
  off, hard firelight, the anvil as its emblem, fewer and more varied pieces); the patio
  (smooth peacocks, a skein that read as rubber, blotches of colour between the pots).
- **The score** is the same take, recut by measurement (`score.sh`): its first 26.75 s,
  joined in a softer stretch to its own last chord, which falls at 26.95 s as the
  signature comes up. Nobody here has listened.

