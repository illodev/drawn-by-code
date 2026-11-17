# Reviews · lightfield-test

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

## Before round 1 (user)

- On the bulb still: «Cómo definirías este estilo de dibujo?»
- With the limb still, the bulb again and three colourised micrographs: «Crees que podríamos
  replicar estos tonos y estilos como estilos científico/biológicos? Sé que son diferentes
  imágenes, pero es captar un poco el estilo científico»
- «Me gustaría probar la de lightfield primero»

Translation: two styles, not one, because the physics are opposite: in micrographs things
are a density tinted in false colour; in the limb and the bulb things are light that
overflows the lens. This experiment is the second one, `lightfield`. The stills are the bar
for tones, grain and optics; the title is our own (their logo is not copied).

## Round 1 (auto) · the style kit, and the two shots matched to the stills

Built: `styles/lightfield/` (scenes as radiance, a camera with an HDR target, a seven-octave
bloom with halation, iris rays, aberration, a toe and a film curve, grain), two fonts
(Poppins Bold, Lora Medium, OFL), and one file per shot.

**Limb.** Measured on the still, not guessed: the limb's circle (centre 0.015, −3.283 and
radius 3.313 in frame heights, fitted on the lower edge to ± 2 px), the colour of the air
every 4 px across the band (33 samples: red at the ground, white, periwinkle, navy), how
the band thins (to 0.70) and dims (to 0.46) along the arc, the sun's place (29 px above the
edge, 0.174 rad left of the top). Seen and fixed:

- the first render had no visible bloom: the downsample pass sampled a quarter of each
  level (`gl_FragCoord · texel · 0.5`). Each target now gets its own size.
- rays came out as bars ending in a stub: an exponential tail that falls to e⁻⁴ on a
  source of thousands saturates the film along its whole length. `falloff` (default 9), a
  redder tint and octave 4 give tapered, fat, soft rays like the still's.
- the sun was 15× too bright (a white ball 130 px across); the lens's wide octaves laid a
  brown veil on space, where the still is pure black: a `toe` in the film (with its exact
  inverse inside `emit()`, so measured colours stay measured) and lighter wide octaves.
- the band near the sun whitens and thickens on the still: an aureole term along the arc.

**Bulb.** Read off the still in its own pixels: the outline (a 203 px sphere over a neck
profile every 20 px), the filament (595–737, y 256), the leads and supports, the stem (a
pinched press on a glass tube), the cap and its thread pitch (14.3 px), 33 named colour
points. Seen and fixed, in order:

- everything washed out: bloom 0.28 with a filament at 950 flooded the frame and turned the
  blue wall purple. Bloom 0.17, wide octaves near zero, halation only from octave 5.
- the glow in the glass was a smooth radial gradient with orange dots on a grid: now sand
  (a grain a pixel across, in clumps, one in seventy sparkling), a cloudy lobe **above**
  the filament fitted to five measurements, and nothing sparkling where no light reaches.
- the filament was a wavy line (a 2.4 px coil aliased into a tilde), then a perfect
  rounded bar: now a band of uneven thickness with flares at its clamps and specks burning
  round it.
- the key highlight went through four shapes (a solid band, a hairline, a clean crescent,
  a white sticker a third of the dome wide). What it is on the still: a strip 4 to ~55 px
  inside the right edge, creamy up the dome, blown along the side, narrow at the bottom,
  feathered inward. It only looked right once its radiance dropped from 7 to ≈ 3 so the
  feather survives the film curve.
- the stem was a cartoon (a wavy rectangle with a loop, four ruled lines): now a height
  field whose normal picks up the filament in gold and the key in white, sealed wires, a
  meniscus, and strip lights in a cylinder with a wobble.
- the cap's thread was a ladder of ridges, then a row of LEDs: now slanted soft dashes of
  uneven brightness in two columns (bokeh), one yellow glint, a thin brass rim.
- chromatic aberration split every white speck into an orange and a blue dot: `ca` 0.0005.
- the dome's upper-left outline looked 13 px inside the circle; flattening it gave an onion
  dome. It was the dark rim of the glass: geometry restored, a 12 px dark band added.
- the wall: measured on a grid (within 10–20 levels of the still everywhere), fewer
  scuffs, a pool of light behind the bulb, a pink haze with flecks of dust in it.

**Motion and density.** Limb: stars in three magnitudes, a few city lights carried round the
night side (two tries read as lava before they were sparse enough), daylight spreading
along the limb, the sun through the air from red to white. Bulb: cold bulb in studio light,
ember, overshoot, settle, tremble; title after the light; push in; dust never still.

**Automatic review:** no warnings (deterministic, no still stretch). 721 ms a frame warm at
960 (the bulb's shader; SwiftShader), ≈ 3 s at 1920.

**Detail gate (12 × 12, the match frames):**

| shot | colour median | colour p90 | too clean | too busy | flagged |
|---|---|---|---|---|---|
| Limb (t 3.5) | 0.7 | 6.6 | 0 % | 0 % | 0 |
| Bulb (t 10, their logo masked) | 7.5 | 19.2 | 0 % | 0 % | 0 |

Engine: `detail.mjs --mask x,y,w,h` (tiles left out, listed in the report), for what a
reference shows and the scene must not copy.

Open, for the user: no sound yet; the bulb passes the gate close to its colour limit
(median 7.5 of 8: our title is not their logo, and the dome's highlight is simpler than the
photograph's); whether `lightfield` should stay one style or the «film from orbit» and the
«studio macro» stocks become presets with names.

## Round 2 (user)

With three crops (our cap, our sun on the dark disc under the band, the dome next to the
reference's):

> Hay que arreglar cosas:
> - El sol parece que atraviesa la tierra, como si saliera de ella
> - Es normal que el sol no genere interferencias hasta que llega a un punto?
> - La bombilla le falta, el enrosque es muy plano, el corte de cristal metal se ve como una
>   raya recta, mejorar reflejos, la dispersión de la luz es muy "homogenea" y artificial,
>   faltan oscuros y poros

Translation into changes:

**«El sol parece que atraviesa la tierra».** The disc was only hidden below the solid edge,
so for a second it sat on the dark planet under the band: a sun in front of the Earth. It
rises *behind* it: the ground and the dense air just above hide it, and it is only ever seen
through the band. Now it is masked by the pixel's height in the air (nothing under 9 px
above the edge), it is squashed by refraction while low (0.35 → 0.8), it starts as a dim
red ember (power ∝ clear⁵, 1500 K → 5700 K) and its light pools in the band before it shows.

**«¿Es normal que no genere interferencias hasta que llega a un punto?»** No. It was the
kit: rays were cut by a hard threshold, so they popped on in one frame. A real iris has no
threshold; rays scale with the source. The bright pass is now a knee (m² / (m² + th²)):
rays grow from the first glimmer, and a broad dim area still throws none.

**The bulb.**
- *«el enrosque es muy plano»*: the cap was a flat slab 172 px wide with dots. On the still
  the shell is 132 px wide and its thread shows three ways even out of focus: a scalloped
  silhouette (a crest every 14.3 px, the right side half a turn behind the left: a helix),
  a band per turn (lit upper flank, black groove, slanted across the shell, uneven), and a
  soft slanted glint on each crest spilling past the edge; some turns mirror the filament
  as a warm dash.
- *«el corte de cristal metal se ve como una raya recta»*: the brass lip is now an ellipse
  seen a little from above, a thin arc broken into blurred beads, thicker and brighter
  under the stem, with a brown glow under it; the bulb's floor turns in on a round corner
  (it was a chamfer) and shows as two thin sagging arcs.
- *«mejorar reflejos»*: the key highlight in layers (a blown crescent brightest near the
  edge, cut by one dark bar of the box's frame; a warm grainy veil where the coating
  scatters it; a hair of light on the edge), a second, dim image of it on the inside of the
  far wall, jagged glints at the floor's corners.
- *«la dispersión de la luz es muy homogénea y artificial, faltan oscuros y poros»*: the
  glow was one smooth lobe. It is now what the still shows: a nucleus round the wire, a
  lobe over it, a darker ring (y 144–164, and from x 755 on the right), the far side of the
  dome nearly black, nothing under the wire beyond 95 px, clouds where the coating is thin;
  and the coating is sandpaper (grains of uneven brightness, one cell in eight a pit that
  takes no light, blotches, one grain in seventy sparkling). The golden cap of the dome is
  the studio's top light, not the filament's.
- the filament burns unevenly (knots at its supports, a fuzz of uneven height) and the
  wires are thinner and dimmer.

Tried and thrown away on the way: whiskers on the coil (needles), a key highlight with a
noise-chewed edge and two crossed bars (a crumpled sticker), glints as crisp ovals (a row
of LEDs), bands of full contrast across the cap (a ladder again).

**Detail gate after the round (12 × 12):** Limb PASS (colour median 0.7, no flagged tile);
Bulb PASS (colour median 7.8, p90 19.5, no flagged tile). Automatic review: no warnings.

What the gate could not see, and the user did: it compares one instant (the sun on the
disc happened a second before the match frame), and inside a tile it only weighs colour
and energy, not structure (a smooth lobe and a mottled one, a flat cap and a threaded one
score alike). Both went into the style's checklist.

## Round 3 (user)

With the limb reference again:

> Lo que yo haría es añadir algunas escenas nuevas, originales nuestras, podemos ver ideas.
> Y el único arreglo que veo por ahora es el sol, creo que el reflejo se ve demasiado
> altificial todavía, es como que los rayos son muy simetricos y llega a un punto en el que
> se ve el sol con los rayos subiendo y es como si una estrella de mar se moviera, creo que
> tiene demasiada intensidad. En el de la imagen que te pasé se ve más pequeño, más
> difuminado y parte de una zona central un poco más blanca y no tan estrellada

Translation: the bulb is accepted for now; the sun's flare is not. Fifteen distinct arms
of even length riding up with the sun read as a creature (a starfish), and the flare kept
growing after the match frame (power × 1.9). What the still shows is a small soft flower:
a pale round centre, a red halo, a ragged rim. Changes:

- the halo is now mostly **round**: the lens's two widest octaves carry it (weights 2.4 and
  0.6, tinted red), under a white octave (4.2) that gives the pale centre;
- the rays only scallop its rim: 19 of them at uneven angles (± 0.28 of the spacing),
  lengths 0.13–0.22, gains 0.45–1, at less than half the gain (0.19 → 0.07), a deeper red;
- the sun **holds its brightness** once it is up (the camera's exposure): it was doubling
  between the match frame and the cut;
- tried and dropped: rays at octave 5 (no rim left, a blob), 24 rays with free angles
  (they bunched into a «W» of three arms).

Detail gate, Limb: PASS (colour median 0.9, p90 7.7, no flagged tile). New scenes: ideas
proposed to the user, none built yet.

## Round 4 (user) · three scenes of our own, and the cut

> Haz las tres que recomiendas, como una pieza montada

(after «añadir algunas escenas nuevas, originales nuestras, podemos ver ideas» and six
proposals: eclipse, prism, double slit, match, aurora, cloud chamber; recommended and
chosen: the first three, between the two reference shots.)

Built, each from the traits of the real thing listed in `brief.md`, with no still to match:

**Eclipse** (`eclipse.js`). The Sun's disc at 5200 with limb darkening, the Moon a disc
with a ragged edge (so the thinning crescent breaks into beads by itself), a corona made of
an even inner ring plus five streamers that narrow to points and plumes over the poles,
combed along field lines, prominences, chromosphere, earthshine, stars, a planet. The
camera's exposure is the animation: 0.014 for the crescent, 1 for the corona, 60 when the
first bead returns (the frame burns out into the cut). Seen and fixed: a first corona that
was a radial sunburst with grey bars to the frame's edge (streamers shortened: ρ⁻³ and
steeper, fine combing kept for the poles only); prominences that were pink scribbles
(outlines!) → filled leaning tongues, bright at the foot, which hide the corona behind
them; a Moon shaded like a grey ball → flat and nearly black; too many stars.

**Prism** (`lab.js`, `prism.js`). A bench in perspective (a table plane, a camera above and
in front); the light is whatever skims the table. Fourteen wavelengths are traced through
the triangle in JS every frame (Snell in, Snell out) and handed to the shader as exit
points and angles. Seen and fixed: the violet end broke into separate rays and blobs
(fourteen samples of a continuous spectrum) → each ray is as wide as its share of the fan
at that distance and as much dimmer; the fan ran on behind the card → every ray stops where
the card stands; the block read as grey slate with ruled white edges → darker, its far
edges and its foot seen through it, edges broken and dim, the beam inside drawn where the
view ray really meets the sheet of light (low in the block: it was a bar across the middle
of the face); too much room light.

**Slits** (`slits.js`). The intensity is the two paths added with their phases; what shows
is what each cell of the table has collected: exponential waits to its first three
photons, a flash on arrival, then the wave with speckle once a cell has had about eight
hits; the source goes up ×10 every 1.2 s and the camera stops down with it. Seen and
fixed: speckle that was one value per cell (a mosaic of squares) → smooth-edged grains; a
barrier as long as the table; a final frame burnt flat red.

**The cut.** Limb → Eclipse (the Sun up, then the Sun covered) → the eclipse's burnt-out
frame → the bench, whose camera takes half a second to settle → the red end of the fan →
red photons → the bulb and the title.

Kit: nothing new was needed in `lightfield.js`; a shared bench (`lab.js`) stays in the
experiment until a second film wants it.

**Checks on the 30.5 s cut:** automatic review: no warnings (deterministic, no still stretch;
859 ms a frame warm at 960). Detail gate on the two reference shots, 12 × 12: Limb (t 3.5)
PASS, colour median 0.9, no flagged tile; Bulb (t 29, their logo masked) PASS, colour median
7.8, p90 19.5, no flagged tile. The three new shots have no reference: checked by eye at
full size against the style's checklist.

Render: three chunks side by side (`--from/--to`, 23 to 32 minutes each on this container).
`--to` is inclusive, so each joint had its frame twice: the chunks are joined with
`trim=end_frame=` on all but the last (732 frames, counted).

## Round 5 (user)

> Veo que has reaprovechado la pared del prisma en el de la rendija. Quizás lo haría
> diferente en el prisma.

Translation: the same grey card stood at the right of two consecutive shots, at nearly the
same place and angle, so the second read as the first redressed. In the Prism shot the fan
now lands on a sheet of **white paper stood on its edge and bowed into an arc**, hollow
side to the prism: the spectrum wraps round it, the colours climb it, it shades from one
end to the other as it turns through the room's light, its top edge is not cut dead
straight. The Slits shot keeps its flat grey card (bars want a flat screen). Only the
prism's stretch was rendered again and spliced in.

## Round 6 (user)

On the bowed sheet of round 5:

> Quizás sin pared?

Translation: no screen at all in the Prism shot. The sheet is gone: the fan runs out across
the table and off the frame, and what it lands on is the table's grain and the dust in the
air. The prism is the only object on the bench, which also sets it apart from the Slits
shot (a barrier and a card). Only the prism's stretch was rendered again and spliced in.

Lesson: the answer to «the same prop twice» was to take it away, not to redesign it. A
light that has a surface to skim does not need a screen to end on.

## Round 7 (user) · sound

> Vamos por la música

Plan: an ambient score for a science documentary plus sound design that lands on the
picture's frames (photons, the filament), which a generated track cannot do.

- **Generated score (not used yet).** Four 33 s takes made with the ElevenLabs connector
  (Music v2.5, instrumental, one prompt describing the arc; node «lightfield score» in the
  user's flows; 495 credits each). They could not be downloaded: this session runs on the
  Default environment, whose network policy does not allow `elevenlabsusercontent.com`
  (403 at the proxy); the environment saved for this repository has open network but a
  running session cannot move onto it; a fetch through the web tool was refused. Left for
  the user to decide (allow the host, or a new session on the repo's environment).
- **Synthesised score (in the film now)**, `music.mjs`: a slow piece in D whose harmony
  changes on the cuts and whose swells use the shots' own constants: a low fifth and a high
  glass note for the limb, D minor as the Sun shows (2.4 s); B flat breathing in to the
  last bead, a D minor ninth at totality (8.4 s), cut off with the picture at 12; F major
  seventh and one glass note per step of the fan (13.2–16.9 s, low and left to high and
  right); G minor then a suspended A growing with the photon count; D major following the
  filament's heat curve, a bell on the title (26.8 s).
- **Sound design**, `sound-design.mjs`: a sub swell at totality, air opening into the cut at
  12, the shutter, **photon ticks** as a Poisson process with the picture's own rate law
  (× e^1.92 a second) turning into a crackle and a hiss, the bulb's switch (25.05 s) and a
  mains hum that brightens with the heat curve.
- `mix-sound.sh`: both stems, one static gain, a limiter at 4× with `level=false`.

Checked without listening, by measurement: RMS per second follows the film (limb −37 → −16,
totality −15, bursting to −14 at the cut, prism −18, slits −22 → −16, bulb −12, out −29),
no stretch near silence inside the film, integrated −15.5 LUFS, peak −1.5 dBFS. First pass
problems caught the same way: the riser into the cut peaked at 0 dBFS (its gain was 12 dB
too high), the prism was 7 dB under everything else, the slits did not grow.

Not checked, and it matters: **nobody has listened to it.** Timbre, taste and whether the
ticks are pleasant are for the user's ears.

## Round 8 (user) · the generated score

> Creo que ya deberías poder acceder a elevenlabs

The file host is reachable now (the 403 on its bare root is the site's own answer to an
unsigned request, not the proxy's). The signed links of round 7 had expired: fresh ones
came from the flow's run status. All four takes are in `private/music/` (never committed).

Chosen by measuring, not by ear (level per second, strongest pitch class and brightness
per second, onsets at 50 ms):

| take | shape | verdict |
|---|---|---|
| 1 | one slow build on a D drone to 21–23 s, gone by 27 s | no ending for the bulb |
| 2 | D drone swelling at 3–7 s; brighter, moving harmony from 11.5 s (the arpeggio); a second section from 19 s peaking at 22–24.5 s; near-silence at 26–27 s; a chord struck at **27.00 s**, rung out by 30.5 s | **used** |
| 3 | almost nothing until 11 s, G/B/F♯ colours | misses the limb and the eclipse |
| 4 | one steady level from 3 to 26 s, then a fade | a bed with no shape |

Take 2 is laid from second 0 **uncut**: its sections fall on the film's cuts by themselves
(arpeggio with the prism at 12 s, the gathering section with the slits, its hush over the
cold bulb and the switch, its closing chord on the title, which starts at 26.8 s). All four
takes are in D throughout, so the one thing it lacks, an event at totality (it is fading
at 8.4 s), is supplied by the synthesised D minor ninth of `music.mjs --totality`, from
8.35 s to the cut at 12. Its closing chord, its quietest swell, is raised 5 dB (the step
taken inside its own near-silence at 26.95 s). The synthesised sound design stays under it
(ticks, switch, hum, the air into the cut). `mix-sound.sh` falls back to the fully
synthesised score when the private take is absent.

Measured: RMS per second −48 −32 −26 −19 −17 −16 | −18 −20 −18 −17 −19 −16 | −20 −17 −15
−16 −18 −23 | −26 −25 −20 −17 −14 −15 | −18 −23 −28 **−14** −23 −29 −39; integrated
−15.5 LUFS, peak −1.5 dBFS. **Still not listened to by anyone.**

## Round 9 (user) · the signature and a narrator

> Lo único que falta es la marca de illodev x Claude y quizás un narrador que diga cosas muy
> profundas con una voz grave

**The signature.** `illodev x Claude`, written exactly as in the other films (the user's
rule in runnin-down-a-dream), takes the place of «drawn by code» under the title: Lora
46 px, a warm white, emitted through the plate like the title, with its own fade (it comes
on at 27.75–28.5 s, after the title, and holds two seconds). It sits inside the area the
detail gate already masks. Only the bulb's stretch was rendered again.

**The narrator.** Five lines, one per shot, written for this film (English, like the
on-screen text), each true of what is on screen:

| second | line | lands on |
|---|---|---|
| 0.70 | Light never arrives. It has always been on its way. | the dark limb; the Sun shows at 2.4 |
| 6.80 | Hide the sun… and it shows you what it was hiding. | «and» at 8.58: totality is 8.4 |
| 13.60 | White is every colour, keeping a secret. | the fan opening, 13.2–16.9 |
| 19.60 | One at a time, light still knows the pattern. | single photons, then the fingers |
| 24.10 | And then… we learned to make our own. | spoken over the cut; «then» ends 25.02, the switch clicks 25.05, «own» meets the chord at 27.0 |

Voice: ElevenLabs v4, a deep documentary voice from the library («Connery»), each line
generated on its own with `[deep voice] [slowly]`, two takes; kept in `private/voice/`.
Chosen by measurement: speech bounds, the pause inside each line, the level of the last
40 ms against the peak (no take is cut off: −59 to −76 dB), and the lower-pitched take of
each pair. Placed by the second the first sound is heard (each file starts with 0.12–0.24 s
of air). The connector's transcription returned the script word for word with word times,
but it also returned the bracketed tags, so it is an alignment against the prompt, not an
independent hearing: the words are **not verified by a blind transcription**.

Mix: under each line the score and the sound design come down 6 dB (0.25 s down, 0.6 s
up; the last two lines bridged; nothing ducked after 26.9 s so the closing chord is whole).
Measured on stems in 100 ms windows where the voice is above −26 dB: voice minus bed median
15 dB, 10th percentile 6 dB, never under 2 dB; integrated −15.0 LUFS, peak −1.5 dBFS.

Still true: **nobody has listened to any of it.**

## Round 10 (user) · approved

> Está bien así, podemos abrir PR

The film is approved as it stands (the signature, the English narrator and its five lines
included). With it the style test is approved: `lightfield` leaves «in testing».

Left for later, said in the pull request: the style is not yet on the README cover's
carousel (it means rendering the cover again), and the narrator's words were aligned
against the script rather than transcribed blind.
