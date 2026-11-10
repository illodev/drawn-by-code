---
name: style-terminal
description: Terminal style, in testing: the whole frame is one character grid, like a text-mode screen. Pictures are painted as light and turned into characters (strokes become | / \ _ - ( ), flat areas a density ramp, a scanned shape fills with its own words), text is typed into the cells, and the grid is finished like a tube (phosphor bloom, scanlines, vignette, grain, glitches on the hits). Near-black, phosphor white and one red. Use it for hacker, terminal, ASCII art, text mode, CRT, glitch, cyber or «made of code» looks, or when working with styles/terminal/.
---

# Style · Terminal (in testing)

Style test: `sandbox/2026-11-10-one-or-zero/` (a carriage at night, `cat people/*`; its
`review/sheet.jpg` and `render/strip.jpg`). Template: `styles/terminal/template.js`.

## Code

`styles/terminal/term.js` defines `Term`. A scene makes one terminal and, every frame,
starts it, writes into it and presents it:

```js
fonts: [{ family: 'TermMono', src: 'fonts/JetBrainsMono-Regular.ttf', descriptors: { weight: '400' } },
        { family: 'TermMono', src: 'fonts/JetBrainsMono-Bold.ttf', descriptors: { weight: '700' } }],
logical: [1920, 1080],                                                   // or [1600, 900] with 160 × 45
setup(env) { return { T: Term.make(env, { cols: 192, rows: 54 }) }; },   // cells of 10 × 20 units
draw(g, t, env) {
    const T = env.state.T;
    T.begin(t);
    T.picture((p) => { /* ordinary canvas drawing, logical units */ }, { /* options */ });
    T.text(4, 6, '$ cat people/*', { scale: 2 });
    T.cursor(32, 6, { scale: 2 });
    T.present(g, env);
}
```

- **Cells:** `put(c, r, ch, o)`, `text(c, r, str, o)` (`scale` 2 or 3 for large text,
  `align`, `opaque`), `fill(c, r, w, h, ch, o)` (a space clears), `box(c, r, w, h, o)`
  (`double`, `title`), `cursor(c, r, o)` (blinks; `solid`, `since`, `scale`),
  `tint(c, r, w, h, ink, level)` (recolours what is there), `at(c, r)`. Options: `ink`
  (`'ink'`, `'red'`, `'cold'`, `'amber'`, `'bg'`), `level` 0..1, `bold`, `bg` (inverse
  video). `T.x(c)`, `T.y(r)`, `T.col(x)`, `T.row(y)` convert between cells and units.
- **Pictures:** `picture(fn, o)`. `fn(p)` paints in a small buffer (4 × 8 samples per
  cell); the kit then gives every cell a character. A cell an edge or a stroke crosses
  gets the character whose shape fits it (`set`: `'art'` by default, strokes and corners
  only; `'ascii'`, `'lines'`, `'soft'`, `'binary'`, `'blocks'` or your own string); a flat
  cell gets one from a density ramp (`ramp`), or the next letter of a text (`fill`,
  `fillLevel`). Colour picks the nearest ink. The buffer starts transparent: **black
  paint hides** what earlier calls put in those cells, unpainted cells keep it. Other
  options: `gain`, `min`, `edge`, `mass`, `slack`, `dim`, `ink`, `over`.
- **Materials:** `mats: [{ color, ramp, ink, dim, fill }]`. A part painted in a shade of
  `color` gets `ramp` in its flat cells instead of the picture's: hair in strands (`|`), a
  pinstripe (`¦`), a knit (`+`), leather (`▒`), fur (`*`). See `Cast.MATS` in the style test.
- **Light:** `edge: Infinity` makes every lit cell a step of the ramp (no strokes): the
  pass for shaded cloth, a glow, a gradient. Lay a second `picture` with only strokes over it.
- **Text in time:** `Term.typed(str, t, t0, cps)` (a person: uneven keys, a breath at
  spaces and punctuation), `Term.printed(str, t, t0, cps)` (the machine: an even rate),
  `Term.scramble(str, u, t)` (a line that resolves out of noise). Each returns the text
  so far (`.text`, `.n`, `.done`, `.end`).
- **Effects for one frame:** set `T.fx = { rgb, tear, corrupt, dim, seed }` before
  `present`. `Term.make` options: `cols`, `rows`, `inks`, `glow`, `scanlines`, `grain`,
  `roll`.
- Box-drawing, block and shape characters (`─│┌┐└┘╭╮╰╯═║╔╗╚╝╠╣╦╩╬ █▓▒░▀▄▌▐ ▁▂▃▅▆▇ ●○■□▮▯►◄▲▼◆`)
  are painted by the kit, not by the font, so frames and solid areas join without seams;
  `box(…, { round: true })` uses the rounded corners.

## Style rules

- **One grid, one screen.** Everything is a character in a cell of the same grid. For
  16:9 either 192 × 54 on a 1920 × 1080 logical frame (a cell is 10 × 20 px at 1920: the
  one with room for a dressed set, and the style test's) or 160 × 45 on 1600 × 900
  (12 × 24 px: bolder, for a few large things). Glyphs stay whole pixels. Nothing is drawn
  on top of the grid, nothing is scaled or rotated; large text is the terminal's own
  double or triple size. A film uses one grid from start to end.
- **A frame is a designed place, not a diagram.** Three things are always there. *The
  set, dressed:* whatever the place really has, typed in box characters, and something to
  read on it that belongs to the film's world (the carriage: a strip of cards with ads, the
  line's map with its stops, a sign that scrolls, a rail with straps that swing, windows
  with the tunnel going by, a bench with cushions, a heater, a floor with what people drop,
  poles, a door with its notice). *People with things:* each one a silhouette of their own,
  clothes in their own material, something they hold or have beside them. *The terminal as
  a product:* a status bar at the top (where we are, meters that follow the work, a clock
  that runs), the session's windows at the bottom (one per chapter of the film), a framed
  pane with a title and a scroll bar, file names and permissions on every record, a number
  and a reading on every bracket. Small text at low brightness is what makes it rich.
- **Three ways to make an image, each for its job.** *Typed* straight into cells for
  anything straight or regular (walls, windows, lamps, frames, bars, tables: box and block
  characters). *Line drawings* through `picture` for anything alive (people, hands,
  animals, cloth). *Light* through `picture` for round or soft things (a moon, a glow, a
  gradient). Do not draw a window frame as a stroke or a face with box characters.
- **Letters mean text.** Pictures are made of symbols only (`'art'` set, symbol ramps).
  A letter on screen is always something to read: a command, a record, a name, or a body
  that has been turned into its own data (`fill`). That contrast is the style's strongest
  image; do not waste it by shading with letters.
- **Line drawings** (see `Cast.pen` in the style test's `cast.js`): every part is a black
  shape (so it hides what is behind), a thin bright outline and, inside, a flat faint tone
  that becomes a texture; skin stays clean. The outline is 3.6 units on screen whatever
  the figure's scale. Four things keep them clean:
  - **Nothing outlined is thinner than a cell** (10 × 20 units): two edges inside one cell
    turn into noise, so a brim, a strap, a cane or a tail is one stroke, and two details
    are never closer than a cell. Eyes are short lids (`- -`), not dots.
  - **A fill stays under about a third of its outline's light** (0.1–0.35): brighter, the
    cell reads as flat and the outline over it is lost. A material's character comes from
    its ramp (`mats`), never from a brighter tone.
  - **Filled blocks and holes land on whole cells:** put the figure's origin on a cell
    corner and size a phone's screen or a dog's eye in cells (`P.cells`), or its edge
    spills into half-characters.
  - **Glasses and the like are typed** over the drawing (`(-)-(-)`), not drawn.
- **Light is a separate pass.** Cloth that catches light (the lead's hood) is painted as
  gradients and soft folds and converted with `edge: Infinity`, then its outlines, seams
  and features are stroked in a second picture over it. In one pass, every soft gradient
  turns into stray strokes.
- **Light has a colour and a side.** The lamps light from above in white; other people's
  screens light them from below in cyan (a jaw, a chest); his own lights him from below
  in red (lips, chin, jaw, one eye). That is all the red a face ever gets.
- **Size.** A person needs a head of about 10 × 6 cells to have a face; smaller than
  that, author them as a silhouette. The lead is large (his head 30 × 16 cells), in a
  lower corner; over him, a calm dark surface of the set (a sheet of glass) is where the
  terminal's large text is read.
- **Palette.** Near-black `#05070a`, phosphor white `#dfe8e4` in twelve brightness steps,
  and red `#ff2e3f` as the only colour: the cursor, the labels, the mark of what was
  chosen. A cold cyan `#5fb4c8` only for light that comes from somewhere else (screens,
  lamps passing outside). Never green rain.
- **Brightness is depth.** The set at 0.1–0.45 (only lamps brighter), people's outlines
  0.8–1, their texture 0.2–0.45, text to read at 1. A solid block glows much more than a glyph of the same
  level: keep `█▀▄` areas low unless they are lamps.
- **Motion.** Pictures move on twos (snap their time to 1/12 s) and in whole cells when
  typed; text appears as typing (a person) or printing (the machine), never fading in.
  A change of state is a scan line that travels (one row per drawing), not a crossfade.
  Something far keeps its own clock (lamps, a ticker), each person has one small loop.
- **Text.** What a viewer must read is at `scale: 2` (20 × 40 px a character at 1920 on
  the 192 grid) or 3; 1× text is labels and the set's own lettering. Every command is a real one and means what it does.
  Labels red, values white. The cursor is solid while typing and blinks while waiting.
- **Glitches are punctuation.** `rgb` + `tear` for 3–4 frames on a hit that lands on a
  beat, at most two or three in ten seconds; `corrupt` for a signal going bad. Never as a
  permanent texture.
- **The tube.** Bloom, scanlines, vignette and grain come from the kit and stay as they
  are: do not add another filter on top.
- Forbidden: anything drawn outside the grid, smooth scaling, letters as shading,
  gibberish «hacking» text, more than one accent colour, strobing.

## Detail (the bar)

Crop every element at full resolution (1920) and check, character by character:

- Outlines are continuous runs of `| / \ _ - ¯ ( )`; no stray marks beside them, no
  doubled lines, no runs of parentheses (a sign of a part thinner than a cell).
- Every figure has its own silhouette (hair, hat, what they carry) and an interior: a
  texture per material (no two neighbours in the same cloth), a face with lids, a nose and
  a mouth, hands that hold something, shoes with a sole.
- The set has something to read in every band of the frame and nothing in it is a bare
  rectangle: frames have titles, glass has a reflection, a wall has its joints.
- The terminal's own furniture is there (bars, pane, labels) and its numbers move.
- Things are told apart by texture and brightness, not by outline alone.
- Typed set pieces line up: frames close, columns share their edges.
- Text never touches a frame or another text; nothing to read in the outer 5 %.

## Style checklist

- [ ] Is every pixel of the picture a character on the one grid (nothing drawn over it)?
- [ ] Do letters appear only where there is something to read?
- [ ] Is the red only on the cursor and what it has marked, and always on screen?
- [ ] Is the text a viewer must read at 2× or larger, and long enough on screen?
- [ ] Do pictures move on twos and typed pieces in whole cells?
- [ ] Is any outlined part thinner than a cell? (Make it one stroke.) Any fill brighter
      than a third of its outline? Any filled block off the cell grid?
- [ ] Is the set dressed, do the people have things, does the terminal have its furniture?
- [ ] Glitches only on hits, no more than three flashes a second (`review.mjs`)?
- [ ] After encoding (`-crf 26`), is the 1× text still crisp in a frame of the MP4?

## Lessons

<!-- date · experiment · one line -->
- 2026-11-10 · one-or-zero · Shading a small figure by tone turns it into a robot made of letters: draw people as line drawings (a black shape, a thin outline, a faint flat texture) and let the kit turn the strokes into characters.
- 2026-11-10 · one-or-zero · A stroke that runs along the border between two cells came out as dashes, and a slide wide enough to fix it let the window slide off the stroke and match the sparsest character: when touching the matcher, probe it with one vertical and one horizontal stroke at eight sub-cell offsets (it must give `|` and `¯ - _` in one cell each) before looking at a scene.
- 2026-11-10 · one-or-zero · Glyph strokes are far thinner than a picture's strokes at the buffer's sampling: descriptors are taken from thickened glyphs, or nothing compares like with like.
- 2026-11-10 · one-or-zero · What the terminal prints goes in the empty corner over the lead, large, under the command that produced it; the same record small next to its owner. One text block that reads like a real session beats labels scattered over the picture.
- 2026-11-10 · one-or-zero · Machine output at a human typing rate took twice its slot: `printed` (even, 30–90 characters a second) for the machine, `typed` only for what a person types.
- 2026-11-10 · one-or-zero · «Creo que hacen falta muchos más detalles a nivel de diseño»: a correct, clean frame (four outlined people, empty windows, a prompt) read as unfinished. What changed it: a finer grid (192 × 54), a set dressed with things to read from the film's own world, a material and an object for every person, light with a colour and a side, and the terminal designed as a product (bars, pane, file names, readings).
- 2026-11-10 · one-or-zero · A material painted bright (0.85) swallowed every outline over it: the kit tells a stroke from a fill by contrast inside the cell. One low tone for all materials; the ramp picks the character.
- 2026-11-10 · one-or-zero · Shading and strokes in one picture gave runs of stray `( ) /` wherever a gradient crossed a cell: paint light as its own pass with `edge: Infinity`, strokes over it.
- 2026-11-10 · one-or-zero · A dog's eyes drawn as dots turned its face into noise; as holes of exactly one cell in the fur they are eyes. Whatever is filled or cut out is sized in cells.
- 2026-11-10 · one-or-zero · A `fill` with a space and a background drew nothing (the kit skipped empty cells before painting their background): bars and inverse labels need that path, fixed in `present`.
