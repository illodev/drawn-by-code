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
