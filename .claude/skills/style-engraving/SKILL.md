---
name: style-engraving
description: Engraving style (in testing): 3D scenes printed as a 19th-century copperplate engraving, like the plates of the «Description de l'Égypte» — tone made only of burin lines, a ruled sky, laid paper with foxing, one or two second inks (live blue, a gold wash). Instanced WebGL, so thousands of pieces are cheap. Use it for architecture, machines, archaeology, exploded views, scientific plates, or when working with styles/engraving/.
---

# Style · Engraving

Reference in testing: `sandbox/2026-09-26-pyramid-engraving/` (the pyramid that makes skies,
5–17 s: the waking joint and the exploded view). References the user chose: the plates of
Vol. V of the «Description de l'Égypte» (Pl. 9, 11, 13, 14 — Wikimedia Commons, NYPL).

## Code

`styles/engraving/engrave.js` → global `Engrave`.

- `Engrave.renderer(env, { scale })` → `R.mesh(name, geom)`, `R.render(g, key, frame)`.
  Built-in meshes: `box`, `pyramid`, `cylinder`, `sphere`; `Engrave.torus(r)` for rings.
- Instances: `Engrave.inst(arr, centre, material, half, seed, quat, glow, bias)` (16 floats).
  Materials: 0 limestone, 1 worn limestone, 2 obsidian, 3 gold, 4 live blue (emissive),
  5 sand (a flat `box` instance with `N.y` up is the desert: dunes bend its lines), 6 bronze.
- A draw: `{ mesh, inst: Float32Array, box: true }` (box = cut edges, pores, chips) or
  `tan: 'y'` for a round mesh hatched along its axis (cylinders; rings default to round it).
  `cast: false` for things that must not shadow (glow lines, dust).
- Frame: `cam, target, fov, sun, sunK, fill, lights: [[x,y,z,0,strength]]` (second-ink
  lights), `shadow: { center, radius }` (make the radius follow the subject: small in a
  close-up, or the shadows go blocky), `sky: { zenith, horizon }`, `fog`, `spacing` (px at
  1920), `frame` (the plate's image area; outside it, bare paper).
- The plate (margins, neat line, running heads, caption) is 2D on top, in IM Fell DW Pica SC
  (`fonts/IMFellDWPicaSC-Regular.ttf`, OFL). See the scene's `film.js`.

## The approved look (charcoal + aged print)

The user approved («¡Lo has clavado!») the **charcoal** mode with the **aged print** filter,
not the ruled burin lines: `charcoal: true` in the frame and `Engrave.ager(env).apply(g,
R.layer(key, f), { ink, paper, charcoal: true })` to paint. What makes it:

- stone faces drawn as a **mosaic of small hand-cut stones** in courses (`course`, world
  size of a course): joints as broken pencil marks on the lit side, dark stones with lighter
  joints in shade; the mosaic stays on up close (a big stone is still a drawn wall);
- tone laid as **graphite in short diagonal strokes** that catch on the paper's tooth only in
  the half-tones (lights stay clean, darks fill in); drawn marks stay crisp;
- the **aged print**: tone curve and gradient map measured on the plates (a greyish warm
  paper, a warm black), second inks carried over, softer lines, grain, toning patches, a
  darker rim; the sheet does not boil;
- light as in plate 11: sun from the front left (`sun: [-0.35, 0.5, 0.8]`, `sunK: 0.8`,
  `fill: 0.2`), a light rubbed sky (`zenith 0.22, horizon 0.15`).

Calibrate against the plate with `sandbox/2026-09-26-pyramid-engraving/plate-test.js`
(one smooth pyramid from afar) before touching a scene.

## Style rules

- **Tone is line width, never grey.** Lit stone keeps a few hairlines; shade thickens one
  set of parallel lines; a second, thinner crossing set only in the half-dark; deep shadow
  is heavy parallel lines with thin continuous light between (a dense mesh of crossings
  reads as perforated metal at video size).
- **Lines are fixed to the surface** and follow it (courses horizontal on walls, along a
  cylinder, round a ring), at a constant spacing on screen: they never swim over the
  object when the camera moves. Only the sky and the paper are fixed to the frame.
- **Cut lines are full ink.** Every stone's edge is a line; far stones lose it by thinning,
  never by turning grey. Joints seen edge-on are cut solid.
- **Colour is a second ink:** live blue prints solid (outlined) and tints the stone lines
  near it; gold is a wash under the dark lines, as on a hand-coloured plate. Three
  quarters of the frame stay ink on paper.
- The sky is ruled (straight horizontal lines, darker to the zenith); a band of bare paper
  at the horizon; the desert is thin lines everywhere bending with the dunes, lighter with
  distance.
- Dust and pores are stipple (solid dots), never tiny shaded cubes.

## Style checklist

- [ ] No flat grey anywhere at full size (crop edges, shadows, rings, glow).
- [ ] No band where the line density jumps (level changes fade their odd lines out).
- [ ] Close-ups: pores, chipped edges, joints; shadows sharp (shadow radius follows).
- [ ] Round things carry lines in their direction and an outline.
- [ ] Blue only on what is alive; gold only on metal.

## Lessons

- 2026-09-26 · pyramid-engraving · A line thinner than a pixel must print lighter (scale its
  coverage by width/AA), or every faded line becomes a half-tone smear and level changes
  show as diagonal bands of moiré.
- 2026-09-26 · pyramid-engraving · An exploded building reads when each face moves out along
  its own normal (the corners open into V gaps that show the inside); scaling the shells
  about the axis only makes a lattice that hides the heart.
- 2026-09-26 · pyramid-engraving · «It still doesn't look like it» three times: parallel burin
  hatching read as 3D with a filter. What the plates actually do was only seen by cropping
  the plate next to our render at the same size and measuring tones: faces are mosaics of
  tiny drawn stones and soft, grainy tone. Put the reference beside the render first.
- 2026-09-26 · pyramid-engraving · A ruling measured as dot(position, direction) races on a
  curved piece when the direction turns (rings, cylinders): measure arc length instead, and
  never add a per-piece offset to the position (it multiplies the error).
- 2026-09-26 · pyramid-engraving · The colour of «old» is measured, not guessed: a gradient
  map from the plates' own pixels (their paper is greyish, not cream) did more than any
  sepia tint.
