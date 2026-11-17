# lightfield-test

- **Style:** lightfield (new: light photographed, not drawn; the first of the two
  «scientific» styles the user asked for, the other being false-colour micrographs)
- **Format:** 16:9 · 30.5 s · 24 fps (continuous motion, not on twos: this is footage)
- **Purpose / audience:** the style test of `lightfield`, grown into a short piece. The
  user: «Crees que podríamos replicar estos tonos y estilos como estilos
  científico/biológicos? Sé que son diferentes imágenes, pero es captar un poco el estilo
  científico», «Me gustaría probar la de lightfield primero», and after two rounds on the
  two reference shots: «Lo que yo haría es añadir algunas escenas nuevas, originales
  nuestras» → «Haz las tres que recomiendas, como una pieza montada».
- **One-line idea:** five lights, from the sky to the bench: the Sun comes up over the edge
  of the Earth, the Moon covers it, a beam of it is split by a prism, one of its colours
  goes through two slits a photon at a time, and a filament we made ourselves lights the
  title.
- **References** (the user's stills, kept in `private/`, never committed):
  - `limb169.png`: the Earth's limb at orbital sunrise (a film frame, 2.34:1, padded here
    to 16:9 with the black it already had): a thin band of air from deep red through white
    to navy on pure black, the sun as a white core with a red starburst, coarse grain.
  - `bulb169.png`: the title card of «InGenius by Veritasium» (cropped 12 px top and bottom
    to 16:9): a dusty amber filament bulb against a mottled blue wall, a pink haze of dust
    behind it, the cap out of focus, a glowing title over it. **Their logo is not
    reproduced**: the title here is our own (see below), and the logo's area is masked in the
    detail gate.
- **On-screen text (literal):** «lightfield» («light» in gold Lora, «field» in white
  Poppins Bold) and under it «drawn by code» (Lora). Only in the bulb shot.
- **Music / rhythm:** no beat grid (`bpm` undeclared). Score: a generated ambient piece in D
  (ElevenLabs Music v2.5, take 2 of four, in `private/music/`, never committed), laid uncut
  from second 0; a synthesised chord at totality (`music.mjs --totality`); synthesised sound
  design on the picture's frames (`sound-design.mjs`: photon ticks, the switch, the
  filament's hum). `sh mix-sound.sh` → `mix.wav`; without the private take it falls back to
  the fully synthesised score.
- **Must NOT happen:** anything that reads as drawn (outlines, flat fills, a clean vector
  edge); a flare or a glow painted on top instead of coming out of the lens; text that does
  not go through the same camera; the third-party logo.

## Shot list

| Time | Shot | What happens |
|---|---|---|
| 0–5.5 | Limb (reference) | Night side of the Earth from orbit, stars above and a few city lights drifting below. Daylight spreads along the limb from the left (the high blue air first, the low red air after); at 2.4 s the sun shows inside the band of air (never on the dark disc: it rises behind the planet) as a squashed red ember, climbs, rounds and whitens while its halo grows with it, and at 3.5 s the frame is the reference still. It keeps climbing, holding its brightness, until the cut. |
| 5.5–12 | Eclipse (ours) | The Moon slides over the Sun (a time-lapse that slows through totality). The crescent thins and breaks into beads on the Moon's mountains; the last bead is the diamond ring; the camera opens up 70 times and the corona is there: streamers over the Sun's equator, plumes over its poles, pink prominences on the limb, stars, a planet. At 5.3 s the first bead comes back on the other side and burns the frame out: the cut. |
| 12–18.5 | Prism (ours) | A dark bench. A shutter opens and a white beam grazes the table into a glass prism; the prism turns 11.5° and the white coming out of it opens from a narrow band into a fan of colours running out across the table and off the frame (no screen: the user's «quizás sin pared»). Dust in the air and on the table sparkles in it. |
| 18.5–24.5 | Slits (ours) | The same bench, red light, a black card with two slits. Almost nothing at first: single photons landing beyond the card, each a flash and then a dot. The source is turned up tenfold every 1.2 s; the dots gather into fingers fanning from the slits and into bars on the far card, and at last the wave itself, speckled. |
| 24.5–30.5 | Bulb (reference) | A cold bulb in studio light. At 0.55 s the filament starts as a dull red coil, climbs through orange, overshoots and settles white-hot at 2.5 s: the coating on the glass, the wires, the stem and the brass lip light up with it. From 2.3 s the title is emitted in front, and a glint crosses it. At 4.5 s the frame is the reference still. |

## What the three new shots are built from (no reference still: traits of the real thing)

- **Eclipse.** The corona is never round: bright ring at the limb, then streamers drawn to
  points over the magnetic equator and short fine plumes over the poles, all combed along
  field lines. Prominences are small, pink (hydrogen) and stand on the limb; the
  chromosphere is a hair of the same pink seen only at the contacts. Baily's beads are
  sunlight through lunar valleys, so the Moon's edge is rough; the last one is the diamond
  ring. The corona is a million times fainter than the disc, so it only exists for the
  camera once the disc is covered: exposure is animated (0.014 → 1). Earthshine shows the
  Moon's seas faintly. Licence taken: the time-lapse is not uniform.
- **Prism.** What a ray box on a dark table really shows: the beam is the streak it lays on
  the paper and on dust; near the prism the colours still overlap into white with coloured
  edges, and they separate with distance; violet is bent most; a twentieth of the beam
  bounces off the first face; glass is its edges, a sheen, the far edges seen through it
  and the flare where light goes in and out; turn the prism and the fan opens until the
  violet end is about to be totally reflected. Every colour's path is Snell's law. Licence
  taken: the glass's dispersion is stretched about three times.
- **Slits.** The real two-source pattern (paths added with their phases: hyperbolic
  fingers, bars on a screen) and the real way it builds up one photon at a time
  (exponential waits between hits per cell, flashes, then dots, then the wave with laser
  speckle). Licences taken: the wavelength is 1.4 cm of table, and the camera stops down as
  the source is turned up.

## Detail gate

- Limb: `node engine/detail.mjs sandbox/2026-11-16-lightfield-test/scene.js sandbox/2026-11-16-lightfield-test/private/limb.mp4 --times 3.5 --grid 12 --out sandbox/2026-11-16-lightfield-test/review/detail-limb`
- Bulb: `node engine/detail.mjs sandbox/2026-11-16-lightfield-test/scene.js sandbox/2026-11-16-lightfield-test/private/bulb.mp4 --times 29 --grid 12 --mask 0.27,0.33,0.5,0.34 --out sandbox/2026-11-16-lightfield-test/review/detail-bulb`

The `.mp4` references are the stills looped (`ffmpeg -loop 1 -i private/limb169.png -t 32 -r 24
-vf scale=1920:1080 private/limb.mp4`).
