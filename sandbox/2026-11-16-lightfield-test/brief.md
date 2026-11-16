# lightfield-test

- **Style:** lightfield (new: light photographed, not drawn; the first of the two
  «scientific» styles the user asked for, the other being false-colour micrographs)
- **Format:** 16:9 · 11.5 s · 24 fps (continuous motion, not on twos: this is footage)
- **Purpose / audience:** the style test of `lightfield`. The user: «Crees que podríamos
  replicar estos tonos y estilos como estilos científico/biológicos? Sé que son diferentes
  imágenes, pero es captar un poco el estilo científico» and then «Me gustaría probar la de
  lightfield primero».
- **One-line idea:** two lights come on: the sun over the edge of the Earth, and a filament
  in a bulb, which lights the title.
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
- **Music / rhythm:** none yet (no `bpm`): the cut is at 5.5 s. Sound would be a low
  drone with a filament hum; to do with the user (skill **sound**) if the style goes on.
- **Must NOT happen:** anything that reads as drawn (outlines, flat fills, a clean vector
  edge); a flare or a glow painted on top instead of coming out of the lens; text that does
  not go through the same camera; the third-party logo.

## Shot list

| Time | Shot | What happens |
|---|---|---|
| 0–5.5 | Limb | Night side of the Earth from orbit, stars above and a few city lights drifting below. Daylight spreads along the limb from the left (the high blue air first, the low red air after); at 2.4 s the sun shows inside the band of air (never on the dark disc: it rises behind the planet) as a squashed red ember, climbs, rounds and whitens while its halo and rays grow with it, and at 3.5 s the frame is the reference still: the starburst over the band. It keeps climbing and flooding the lens until the cut. |
| 5.5–11.5 | Bulb | A cold bulb in studio light. At 0.55 s the filament starts as a dull red coil, climbs through orange, overshoots and settles white-hot at 2.5 s: the dust on the glass, the wires, the glass stem and the brass rim light up with it and the haze behind brightens. From 2.3 s the title is emitted in front, and a glint crosses it. Slow push in to the end; at 4.5 s the frame is the reference still. |

## Detail gate

- Limb: `node engine/detail.mjs sandbox/2026-11-16-lightfield-test/scene.js sandbox/2026-11-16-lightfield-test/private/limb.mp4 --times 3.5 --grid 12 --out sandbox/2026-11-16-lightfield-test/review/detail-limb`
- Bulb: `node engine/detail.mjs sandbox/2026-11-16-lightfield-test/scene.js sandbox/2026-11-16-lightfield-test/private/bulb.mp4 --times 10 --grid 12 --mask 0.27,0.33,0.5,0.34 --out sandbox/2026-11-16-lightfield-test/review/detail-bulb`

The `.mp4` references are the stills looped (`ffmpeg -loop 1 -i private/limb169.png -t 6 -r 24
-vf scale=1920:1080 private/limb.mp4`).
