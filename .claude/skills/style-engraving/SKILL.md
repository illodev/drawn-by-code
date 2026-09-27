---
name: style-engraving
description: Engraving style (in testing): 3D scenes drawn as a plate of the «Description de l'Égypte» — charcoal tone on toothed paper, masonry drawn stone by stone, temple walls in low relief (registers of offering scenes, Hathor capitals, starred ceilings), an aged print measured on the originals, one live blue and a gold wash as second inks. Instanced WebGL, so thousands of pieces are cheap. Use it for architecture, archaeology, temples, machines, exploded views, scientific plates, or when working with styles/engraving/.
---

# Style · Engraving

Reference in testing: `sandbox/2026-09-26-pyramid-engraving/` («The pyramid that makes skies»,
63.6 s, ten shots from the desert to a sky inside a seed). References the user chose: the
plates of the «Description de l'Égypte»: Vol. V (Giza, Pl. 9, 11, 13, 14) for the outside,
Vol. IV (Dendera, Pl. 17, 25, 30) for walls, friezes and interiors (Wikimedia Commons, NYPL).

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

## Interiors (the temple)

Draw flag and frame field for a room inside: `interior: true` in the frame. Then:

- **Walls are one dressed surface, not stones, and no stone is left empty** (worked on a
  corner bench, `bench.js`, beside a crop of Dendera at the same size). A tall box
  (`vH.y > 0.6`) or a column (`cylinder` with `tan: 'y'`) inside is decorated by
  `templeWall()`: a dado of lotus stems; three registers, each a row of panels (a king
  offering at an altar to two or three gods, standing or enthroned) whose figures fill the
  register's height; columns of signs between ruled verticals fill every gap; a frieze of
  text and uprights, a torus bound with a spiral band, a fluted cornice. Columns are stacks
  of thin bands of signs, cartouches and uprights over one scene register.
- **Relief is the wall's own tone,** a shade lighter, drawn by its bevel (the edge towards
  the light pale, the far edge dark), a fine contour and inner lines. White cut-out figures
  read as stickers.
- **Figures follow the canon** (`sdStanding`, `sdGoddess`, `sdSeated`): profile head with
  wig, frontal shoulders, narrow waist, legs with knee and calf, long feet in a stride,
  arms with elbows and hands; kilt and apron, or the sheath dress; crowns (`crown()`).
  Inner lines (`figureInner`, `seatedInner`) are masked to each figure's own body.
- **Signs are invented** (`glyphSign`, 16 of them), combined in pairs per cell so they do not
  repeat. Never real hieroglyphs.
- **Capitals:** a box draw with `hathor: true` carries, on each side, the creature (the
  user's choice, in the place of Hathor's face) in relief in a sunk ruled niche, framed by
  the shrine with its winged disc and uraei, the wig band, banded lappets ending in curls,
  the bead collar; text in the corners; no masonry courses. The flared `capital` below
  takes `hathor: true` too: two rows of ribbed lotus petals.
- **Ceilings** (`templeCeiling`): bands between beams, one subject each: vultures with
  spread wings, stars on a sunk field, boats of the hours; text along the edges, signs on
  the beams.
- **Floors**: large flagstones in rows (frame field `flag` sets their width per room), each
  its own slight tone, worn lighter where walked, broken joints that still read in shade,
  sand beside them and in drifts, cracks, chipped corners, pits, pebbles with a shadow;
  loose stones (`rock`, drawn in flat facets with their arrises) and furniture from
  `props.js`.
- **Metal is engraved:** rings as an armillary's (rules, a graduated scale on one face,
  signs on the other; slim tubes bands every 10°), rods with collars and spiral fluting.
- **Anything built is carried:** walkways and slabs run into walls and sit on stepped
  corbels or struts; nothing hangs in the air unless the story says so.
- The paper's tooth is finer indoors (`grain: 0.45` in the ager), or the carving drowns.
- Light comes in as the story needs (slits with dust motes in the beams: bias −1 prints a
  mote as bare paper; a shaft lit from above); `fill ≈ 0.4` so shade stays drawn.

A night sky (inside the seed): `sky` above 1 (a dark rubbed ground), stars as `sphere`
instances with bias −1 (bare paper), sizes small and many (thousands), an engraved star as
four long and four short thin rays.

## Style rules

- **Tone is graphite on toothed paper,** never a flat grey: laid in short diagonal strokes,
  catching on the tooth only in the half-tones. Drawn marks (joints, relief edges, signs)
  stay crisp lines.
- **Outside, stone is a mosaic of small hand-cut stones** in courses; up close (a course
  over ~22–70 px) the limestone takes over: vugs with a lit lip, pits, coin fossils, cracks,
  broken arrises, sand in the joints, a mottle; no wavy dashes. Inside, walls are dressed and decorated (above).
- **Textures belong to the piece** (`vQ`, the piece's own space): they never swim when the
  piece or the camera moves. Round pieces measure arc length, not a dot product.
- **Colour is a second ink:** live blue on what is alive (channels, marks, the seed), gold as
  a wash on metal; three quarters of the frame stay ink on paper.
- **The ground is drawn:** dunes everywhere with lee slopes in shade, patchy wind ripples
  (dark lee strokes), mottling, pebbles; no flat patch next to a busy one.
- Dust, pores, pebbles and stars are stipple; motes in light are bare paper. A grain never
  grows past ~16 px on screen (the vertex shader clamps it), or it passes the lens as a disc.
- Nothing crosses stone: rings are sized to the room they turn in, slabs keep their gaps.

## Style checklist

- [ ] Side by side with the plate at the same size: tones measured, not guessed.
- [ ] No flat grey at full size (walls in light, shaded faces, metal, sand).
- [ ] Walls inside: registers readable but not shouting; no two neighbouring panels alike.
- [ ] Every room furnished and dirty (tables, jars, statues, rubble, dust at the walls).
- [ ] Nothing in the foreground covering half the frame by accident (rings, mounds, blocks).
- [ ] Blue only on what is alive; gold only on metal.
- [ ] Every element cropped at full size: no blank stone, ceiling, floor, capital or metal.
- [ ] Nothing built floating: every slab, walkway, beam has its bearing.

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
- 2026-09-26 · pyramid-engraving · «The walls don't look Egyptian»: the fix came from the
  plates themselves (Dendera): smooth dressed walls filled edge to edge with registers, not
  stones with a few signs. Download the references first and copy their structure.
- 2026-09-26 · pyramid-engraving · «The glyphs repeat»: one sign per cell from a fixed grid
  repeats visibly; vary the panel widths, the composition per panel, pair signs per cell and
  offset each wall.
- 2026-09-26 · pyramid-engraving · A low camera on a lit foreground mound flattens the whole
  frame; look over the dunes so their lit and shaded sides read.
- 2026-09-27 · pyramid-engraving · «Trabaja más en detalle y zonas más pequeñas»: one bench
  scene (a corner with wall, column, capital, ceiling, floor) with a view per element, each
  compared at full size with the plate, moved the rooms further in a night than the film
  shots had in days. Give every bench view its own layer key: the renderer memoises the
  layer by key and silently returns the first view.
- 2026-09-27 · pyramid-engraving · The figures stayed «schematic» until they were rebuilt
  from the canon (tapered limbs with knee, calf, ankle; frontal shoulders; profile head),
  not by adding lines to stick figures.
