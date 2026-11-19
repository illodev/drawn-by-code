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
