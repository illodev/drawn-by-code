# Brief for a picture agent · souvenir-test, pictures 3 to 9

You are painting ONE whole picture of a film for `drawn-by-code`: animations drawn with
deterministic canvas-2D code, rendered frame by frame in headless Chromium. Everything in
the repo (code, comments, notes) is in ENGLISH. Read this whole file, then `agent-brief.md`
(the manner, the kit, the bar for detail: all of it still holds) and
`.claude/skills/style-souvenir/SKILL.md` (the style's rules and every lesson so far).

## The film

«Recuerdo de Andalucía»: Andalusia told through nine painted pictures that one camera
dives through, each seen first through a hole of the one before. The user asked for
«deep references, some harder to understand and others less so: magic, enchantment
(embrujo), rootedness, culture, poetry, art»; the history of the land and its peoples;
its poets, artists and faiths (those born here, who passed through or chose it); «darker,
almost mystical parts and lighter ones, more abstract parts and more realistic ones,
hidden references». No people for now: no figures, faces, hands or human silhouettes.

Pictures 1 and 2 exist and the user likes their paint: look at them before anything else.

- `render/souvenir-test.mp4` and `review/sheet.jpg`: the film so far.
- `tableaux/passage.js` + `tableaux/emblem.js` (picture 1, the emblem manner) and
  `tableaux/lemons.js` (picture 2, the brush manner): how a picture is a stack of layers.
- `things/*.js`: the library painted so far (see the table in the style's skill). You may
  call any of it read-only (flowers of `Shawl`, creatures of `Fauna`, fruit of `Citrus`,
  cards of `Charms`…), but your picture needs its own things.

## What the user has corrected so far (do not repeat any of it)

1. **«Packed with details, very worked at the level of every pixel.»** The bar is in
   `agent-brief.md` → «Second pass»: any 300 × 300 px of the 1920 render holds at least
   eight distinct drawn things, there is still drawing at 4×, repetition is not detail.
2. **«It is not a poster that the camera approaches, it is overlap after overlap.»** A
   picture is a PASSAGE: its things are spread along the axis in strata hundreds of units
   apart, each overlapping the next and leaving a way through; each comes out of the dark
   as the camera nears it, is crossed, and uncovers the one behind. Never a flat painting
   with everything on it, never loose objects floating in haze.
3. **«The camera should have the same rhythm all the time.»** The camera is not yours:
   it goes in at 432 units a second, on the axis, focused 1000 ahead, for the whole film.
   It never slows, waits, turns or rises. Whatever must be read is painted large enough
   and placed so that it reads while it passes.

## The contract of a picture

Files (yours alone): `tableaux/<name>.js`, `things/<name>.js` (ONE global, your things)
and your test bench `dev/<name>/scene.js` (a copy of `dev/picture/scene.js` with its top
block edited). Everything else is read-only; if the kit lacks something, do it in your
files and say so in the report. No git at all (other agents share this working tree).

```js
window.Tableau = window.Tableau || {};
Tableau.<name> = (z0) => [ /* layers */ ];
Tableau.<name>.depth = 1800;   // from z0 (your first stratum) to your plate
Tableau.<name>.hole = 140;     // the radius of the way out, cut through your plate
```

A layer is `{ id, z, box: { x, y, w, h }, paint(g, res), res?, hole?, brush?, far?, blur? }`
(read the comment over `rig` in `styles/souvenir/souvenir.js`). Ids start with `<name>-`.
The origin of every layer is the axis: the centre of the frame.

**How the camera sees a layer.** A layer 1000 units ahead is drawn at its painted size
(1 unit = 1 logical unit of a 1600 × 900 frame) and is in focus; at distance `d` its scale
is `1000 / d` and its blur 10 × |scale − 1| units. So a sheet is read during the half
second in which it is 1250 to 800 away (the frame then shows 2000 × 1125 down to
1280 × 720 units of it); before that it is small and soft, after it large and blurred, and
it leaves by the edges of the frame. At 432 units a second.

**The structure of a picture.**

- **Three or four strata**, 450 to 700 units apart, each of two or three sheets 120 to 170
  apart (so things slide over each other even inside a stratum), and behind them a
  **plate** that closes the picture. Total depth 1400 to 2100 (3 to 5 seconds). At most
  12 layers.
- **Every stratum has a body**: its far sheet covers its whole box except the way through
  (foliage, a wall, cloth, smoke, stone, planes of colour), so that nothing behind shows
  round it. Boxes of about 2400 × 1440; the plate 3000 × 1700 or more, painted at
  `res` 0.4–0.6 (it is never in focus for long) but still painted, never a flat fill.
- **The way through** is on the axis in every sheet: an opening of about 400 × 280 units
  about the origin with nothing in it (it may narrow to 240 × 170 in one stratum, and it
  should not be the same oval every time: an arch, a gap between two things, a ring, a
  window). Things that the camera may brush through as a veil (smoke, a thread, a hanging
  leaf) can cross it. The largest pieces sit just outside it and lie on one another; the
  near sheets' pieces are larger and are cut by the frame.
- **The plate has the hole** to the next picture: on the axis, radius 120–165, cut clean
  (`g.fillStyle = '#000'` before `destination-out`), inside something that is a hole in
  your world (your section says what). Set `hole` on that layer.
- **Seen from before:** your picture first shows small, through the hole of the picture
  before, from 700–1300 units away: what lies on and round the axis of your strata is the
  promise the viewer goes towards. It must read as your picture's light and colour at a
  glance.
- **Order means something**: what comes first, what is uncovered last. Say what yours
  means in the comment at the top of your tableau.
- **Light from the top left** in every picture (`Souvenir.LIGHT`), unless your section
  gives the picture its own source (a flame, a fire): then that source is painted and
  everything is lit from it.
- **One manner and one family of hues per picture** (your section), and the frame's
  values measured against the mood: `ffmpeg … -vf signalstats` or a script on a still
  (luminance at 5/50/95 %, median saturation). Blacks are never pure: the film's grade
  lifts them, so paint the darks as dark colours.

**Rules.**

- No people. No copy of any existing artwork: a painter or a poem is present through its
  things and its light, never through its composition; no logos.
- **No imitation script.** Arabic or Hebrew lettering is not drawn, not even as texture:
  where a real object carries an inscription, the band is left plain or filled with
  geometry or leaves. Latin lettering only where the real thing has it, in Spanish, spelled
  right, short, painted on its object (`S.textOn`), with a font from `fonts/`.
- Deterministic (no `Math.random`, no `Date`, no state between calls; `Motion.rng(seed)`).
  Drawers paint once, static: only the camera moves.
- **Cost:** a layer paints in under 10 s at the 1920 render and the whole picture in
  under 60 s; `form` sprites are made once and cached; a `ctx.filter` blur is applied to a
  sheet, never to each of hundreds of marks. Paint inside `paint`, never at load.

## How to work

```bash
# from the repo root
node engine/review.mjs sandbox/2026-11-19-souvenir-test/dev/<name>/scene.js
#   → dev/<name>/review/sheet.jpg (the contact sheet: Read it) and auto.md
node engine/render.mjs sandbox/2026-11-19-souvenir-test/dev/<name>/scene.js --at 1.5,2.6,3.4
#   → dev/<name>/out/stills/t_X.XXs.png at 1920 × 1080 (Read them; crop at 1:1 and 2× with ffmpeg)
node engine/render.mjs sandbox/2026-11-19-souvenir-test/dev/<name>/scene.js --size 960
#   → dev/<name>/out/<name>.mp4, to check the passage in motion (tile consecutive frames:
#     ffmpeg -ss T -i <mp4> -vf "scale=480:-1,tile=4x3" -frames:v 1 -update 1 sheet.jpg)
```

To judge the paint without the lens, also render each sheet flat in a second dev scene
(`dev/<name>/flat.js`: draw one layer's `paint` at scale 1 on its ground, no rig).
Scratch images go in
`/tmp/claude-0/-home-user-drawn-by-code/4bdefda1-4465-5c66-aa86-9c20f61fd010/scratchpad/agents/<name>/`,
never in the repo.

The loop: write down what the real things are and their ten small true details each (a
comment at the top of `things/<name>.js`) → paint the things one by one on a flat sheet
and crop them at 2× until each passes the bar → compose the strata by their framings
(what is read at 1250, 1000 and 800) → fly the bench, Read the contact sheet and stills
→ fix → repeat. At least five rounds. You are done when:

1. the contact sheet shows a passage (a near stratum leaving, one being read, the next
   through its middle, the glow of the way out at the end), never a poster;
2. a still at the moment each stratum is 1000 away holds up cropped at 1:1 and at 2×
   against «Second pass», everywhere in the frame;
3. the way through is clear on the axis from the first frame to the last, and the last
   frames go through your hole with nothing popping, flashing or cut off;
4. `review.mjs` has no warnings you cannot explain, and the paint is within the cost.

An agent whose report lists things «still off» has not finished: fix them first.

## The pictures

The moon waxes through the film (a crescent in picture 1, full in picture 9): each
section says how yours is present. It can be hidden.

### 3 · `green` · «Verde que te quiero verde»

- **Manner:** a dream, half abstract. The brush manner (no contour line), almost
  monochrome: every green from black-green to a pale, cold moonlit green, silver for the
  moonlight, and ONE warm colour used once. Soft edges, haze between the strata, shapes
  that are half thing and half stroke.
- **Holds:** Lorca's «Romance sonámbulo», all of it without its people: green wind and
  green branches; «the ship upon the sea and the horse on the mountain» as ghosts in the
  haze; the fig tree that «rubs its wind with the sandpaper of its branches»; the
  mountain, «a thieving cat», bristling its sour agaves; «big stars of frost» and «the fish
  of shadow that opens the road of dawn»; the high green railings («barandales de la
  luna») where the water sounds; tin lanterns trembling on the roofs; a thousand crystal
  tambourines wounding the dawn; the cistern (aljibe) over whose water an «icicle of
  moon» hangs. The one warm colour: a trail of dark red drops (the poem's blood) or a
  golden chameleon on a branch: your choice, once.
- **Moon:** a thick waxing crescent, as the icicle of light on the cistern's water.
- **Way in:** from the dark rest between two lemons (deep green `#11261f`, hole 125).
  **Way out:** the cistern's mouth, black water: hole 140, into black (`#050506`).

### 4 · `stilllife` · the tenebrist still life

- **Manner:** hyper-real, the brush manner at its most exact, on black. One hard light
  from the top left, deep shadows, things in a row on stone ledges, each alone with its
  own cast shadow, each surface saying what it is (wet clay, pewter, glass with water,
  onion skin, linen). Hue family: black-brown, the ochres and whites of clay and linen,
  one or two saturated fruits.
- **Holds:** the Seville of Velázquez and Zurbarán and the Granada of Sánchez Cotán, by
  their things, never their compositions: a big water seller's jug with drops of water
  running down its belly; a glass of water with a fig at the bottom; a brass mortar,
  garlic, a red onion, eggs in a glazed clay dish, a knife jutting over the ledge's edge;
  white clay búcaros and a pewter plate; a quince and a cabbage hanging on strings in a
  stone window (the Carthusian's larder), a cut melon, a cardoon; a rose and a cup of
  water; Valdés Leal's candle just snuffed, its smoke rising («In ictu oculi», words
  that may be lettered small on a strip of paper). A fly on the fruit.
- **Passage:** ledge behind ledge and things hung on strings in the near sheets; the
  bodies are the black itself made of stone: walls, niches, the window's frame.
- **Moon:** a half moon, hidden: the reflection of a window in the glass, or the cut melon.
- **Way in:** from black water (`#050506`, hole 140). **Way out:** the black square of the
  stone window: hole 135 inside it, into a deeper black with one flame (`#07060a`).

### 5 · `darknight` · «En una noche oscura»

- **Manner:** the darkest and most mystical picture, half abstract: black and deep
  violet-blue, and light only from flames (painted: each flame lights what is near it,
  warm, falling off fast). Smoke as veils. Gold leaf used sparingly.
- **Holds:** St John of the Cross, who wrote the «Noche oscura» and the «Llama de amor
  viva» in Andalusia (prior in Granada, died in Úbeda): the secret ladder («por la
  secreta escala disfrazada»), the living flame, a lantern put out («sin otra luz y guía
  sino la que en el corazón ardía»), the mount he drew with its narrow path straight up
  the middle (as a diagram of paths, without its words), lilies («entre las azucenas
  olvidado»), a dove, the «silent music» as a psaltery or a vihuela without a player. Ibn
  Arabi of Murcia and Seville: his diagrams of concentric circles and interlaced rings
  (pure geometry, no script). The small hours of Holy Week: banks of tall candles, the
  wax run down them, a thurible's smoke, a silver lantern on a pole. Moths at the flames.
- **Passage:** rings: of candles, of smoke, of the diagram's circles, each smaller in the
  dark behind the last; the ladder goes in with the camera.
- **Moon:** a gibbous moon behind the smoke, barely there.
- **Way in:** from black (`#07060a`, hole 135): the first thing seen is one flame.
  **Way out:** the innermost circle, which is light: hole 130, into gold (`#e8c56a`).

### 6 · `dome` · the dome

- **Manner:** pure geometry, the only picture with no thing in it: the emblem manner
  (crisp pieces, contour, airbrushed relief) applied to architecture seen from below,
  looking straight up. Light from above, through the dome's windows. Hue family: ivory
  and gold with the blues, reds and greens of polychrome plaster and of glass tesserae.
- **Holds:** the ceilings of al-Andalus as one ascent: tiers of muqarnas (the star dome
  of the Alhambra's Hall of the Two Sisters, its sixteen lattice windows), the ribbed
  dome before Córdoba's mihrab with its gold Byzantine mosaic (tesserae one by one,
  vegetal scrolls), a carpentry ceiling of interlaced stars (lacería), cut-tile dados of
  eight- and sixteen-point stars, stucco of leaves (ataurique). Epigraphic bands are left
  plain or filled with knots: no script. A swift's nest in a corner; one tessera missing;
  a spider's thread; dust in the shafts of light.
- **Passage:** it is one already: each tier of the dome is a stratum, a ring round the
  axis, narrower as it goes up; the camera rises through them.
- **Moon:** a gibbous moon through one lattice window.
- **Way in:** from gold light (`#e8c56a`, hole 130). **Way out:** the star or lantern at
  the dome's crown, open to the sky: hole 125, into the pale rose-blue of dawn (`#e9c9c2`).

### 7 · `patio` · the patio at dawn

- **Manner:** realistic and light, the brush manner in dawn pastels with gilt touches:
  whitewash that is never white (rose, blue, straw), long soft shadows, clear air.
- **Holds:** the patio as the house's heart, from Rome's atrium to Córdoba's patios:
  horseshoe arches with red and white voussoirs one behind another; whitewashed walls
  hung with blue flowerpots of geraniums and gitanillas, each on its iron ring; a tiled
  dado; a marble fountain basin and its thread of water; an orange tree in a glazed
  pot, jasmine on a wire, a well with its pulley, a canary's cage, a rush chair with a
  shawl left on it, a watering can on a long cane (the one used for the high pots); two
  confronted peacocks as on the ivory caskets of Madinat al-Zahra (as a carved panel or
  two live birds on a wall); Seville's skein of wool (the madeja of NO8DO) hanging from
  a nail; swallows' nests under the eaves; a cat asleep; a lizard.
- **Passage:** arch behind arch, each a body of wall with its own things, the patio seen
  through them.
- **Moon:** almost full, pale in the dawn sky above the last wall.
- **Way in:** from dawn sky (`#e9c9c2`, hole 125). **Way out:** the dark of the last
  door, between the two peacocks: hole 140, into ochre and grey (`#b79a6a`).

### 8 · `planes` · the guitar broken into planes

- **Manner:** abstract, a homage to the Cubism that a painter from Málaga began: flat and
  shaded planes of ochre, grey, umber, black and a single blue, edges ruled and edges
  torn, imitation wood grain combed into paint, pasted papers. No existing work is
  copied: no composition, no title, no newspaper masthead of theirs.
- **Holds:** the guitar of picture 1 taken apart (read `things/guitar.js`: its rosette,
  bridge, head and pegs, its soundboard's grain are the pieces): the body's curve
  repeated as planes, the sound hole as two or three circles that do not agree, the
  strings as ruled lines that jump from plane to plane, the frets as a ladder; pasted
  papers of our own (a sheet of music, a strip of wallpaper, a wine label, the corner of
  a newspaper whose words are ours, in Spanish); a glass and a bottle as planes; a
  pigeon's wing (the painter's father painted pigeons); a playing card from picture 1;
  a nail painted with its shadow, as if the picture were pinned up; sand in the paint.
- **Passage:** this is the picture the dive suits best: the planes stand at different
  depths and slide over each other as the camera goes in, and they only add up to the
  guitar on the axis, for an instant, at the distance of focus.
- **Moon:** a full white disc among the planes.
- **Way in:** from ochre (`#b79a6a`, hole 140). **Way out:** the sound hole, a black disc:
  hole 150, into firelight (`#e2702a`).

### 9 · `forge` · the forge and the moon

- **Manner:** firelight: the brush manner, things modelled by an orange fire below and to
  one side (painted: the forge's hearth) against blue-black, rims of light, sparks. The
  last stratum turns cold: the night outside and the full moon.
- **Holds:** Lorca's «Romance de la luna, luna» («La luna vino a la fragua con su polisón
  de nardos») without its people: the anvil, the tongs, hammers and bellows of a
  Sacromonte cave forge, horseshoes and nails, tin for «necklaces and white rings»,
  tuberoses (nardos), the copper pans and painted plates hung on a cave's whitewashed
  wall; an owl («cómo canta la zumaya») in an olive; the olive grove outside, «bronze and
  dream»; a will-o'-the-wisp (Falla's «El amor brujo», written by a man who chose
  Granada); horse brasses and a bridle (the horseman is coming, «tocando el tambor del
  llano»); embers; a cricket's cage.
- **Passage:** the cave's vaults and its hung copper, the hearth and the anvil, the
  cave's mouth, the olive grove, and last the sky.
- **The end of the film:** your plate is the night sky and on it, on the axis, **the full
  moon**, large (radius about 300 units in the plate's own units), with its seas and
  craters painted as a lit sphere and its «bustle of tuberoses» round its lower half. It
  has NO hole (`Tableau.forge.hole = 0`): the film ends on it, and the lead letters the
  signature under it afterwards. Give the moon its own layer (`forge-moon`), the sky and
  stars another behind it.
- **Way in:** from a black disc (hole 150): the first thing seen is fire (`#e2702a`).

## Report (your final message, concise)

1. Files written; `depth`, `hole`; the layers in order (id, z offset from z0, box, res,
   seconds to paint).
2. What each stratum holds and what its order means; the hidden references, where.
3. The measured values of a mid-picture frame (luminance at 5/50/95 %, median saturation).
4. Any kit change you needed, kept in your files (name it); anything you reused from
   `things/`.
5. Licences you took with the real things, and facts you did not check.
6. One-line lessons that would help the next painter.
