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
setup(env) { return { T: Term.make(env, { cols: 160, rows: 45 }) }; },   // cells of 10 × 20 units
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
- **Text in time:** `Term.typed(str, t, t0, cps)` (a person: uneven keys, a breath at
  spaces and punctuation), `Term.printed(str, t, t0, cps)` (the machine: an even rate),
  `Term.scramble(str, u, t)` (a line that resolves out of noise). Each returns the text
  so far (`.text`, `.n`, `.done`, `.end`).
- **Effects for one frame:** set `T.fx = { rgb, tear, corrupt, dim, seed }` before
  `present`. `Term.make` options: `cols`, `rows`, `inks`, `glow`, `scanlines`, `grain`,
  `roll`.
- Box-drawing and block characters (`─│┌┐└┘═║█▓▒░▀▄▌▐●`) are painted by the kit, not by
  the font, so frames and solid areas join without seams.

## Style rules

- **One grid, one screen.** Everything is a character in a cell of the same grid (160 × 45
  for 16:9; a cell is 12 × 24 px at 1920, so glyphs stay whole pixels). Nothing is drawn
  on top of the grid, nothing is scaled or rotated; large text is the terminal's own
  double or triple size. A film uses one grid from start to end.
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
  shape (so it hides what is behind), a thin bright outline and, inside, a flat faint grey
  that becomes a sparse texture (cloth 0.1–0.25 gives `·` or `:`, hair 0.4–0.6 denser,
  skin stays clean). The outline is 3.6 units on screen whatever the figure's scale.
  **Nothing outlined is thinner than a cell** (10 × 20 units): two edges inside one cell
  turn into noise, so a brim, a strap, a cane or a tail is one stroke. Eyes are short
  lids (`- -`), not dots.
- **Size.** A person needs a head of about 9 × 6 cells to have a face; smaller than that,
  author them as a silhouette. The lead is large (his head 25 × 14 cells), in a lower
  corner, with the rest of his half of the frame left empty: that corner of nothing is
  where the terminal's large text goes.
- **Palette.** Near-black `#05070a`, phosphor white `#dfe8e4` in twelve brightness steps,
  and red `#ff2e3f` as the only colour: the cursor, the labels, the mark of what was
  chosen. A cold cyan `#5fb4c8` only for light that comes from somewhere else (screens,
  lamps passing outside). Never green rain.
- **Brightness is depth.** The set at 0.15–0.35, people's outlines 0.8–1, their texture
  0.2–0.4, text to read at 1. A solid block glows much more than a glyph of the same
  level: keep `█▀▄` areas low unless they are lamps.
- **Motion.** Pictures move on twos (snap their time to 1/12 s) and in whole cells when
  typed; text appears as typing (a person) or printing (the machine), never fading in.
  A change of state is a scan line that travels (one row per drawing), not a crossfade.
  Something far keeps its own clock (lamps, a ticker), each person has one small loop.
- **Text.** What a viewer must read is at `scale: 2` (24 × 48 px a character at 1920) or
  3; 1× text is texture and labels. Every command is a real one and means what it does.
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
  texture for the cloth, a face with lids and a mouth, hands that hold something.
- Things are told apart by texture and brightness, not by outline alone.
- Typed set pieces line up: frames close, columns share their edges.
- Text never touches a frame or another text; nothing to read in the outer 5 %.

## Style checklist

- [ ] Is every pixel of the picture a character on the one grid (nothing drawn over it)?
- [ ] Do letters appear only where there is something to read?
- [ ] Is the red only on the cursor and what it has marked, and always on screen?
- [ ] Is the text a viewer must read at 2× or larger, and long enough on screen?
- [ ] Do pictures move on twos and typed pieces in whole cells?
- [ ] Is any outlined part thinner than a cell? (Make it one stroke.)
- [ ] Glitches only on hits, no more than three flashes a second (`review.mjs`)?
- [ ] After encoding (`-crf 26`), is the 1× text still crisp in a frame of the MP4?

## Lessons

<!-- date · experiment · one line -->
- 2026-11-10 · one-or-zero · Shading a small figure by tone turns it into a robot made of letters: draw people as line drawings (a black shape, a thin outline, a faint flat texture) and let the kit turn the strokes into characters.
- 2026-11-10 · one-or-zero · A stroke that runs along the border between two cells came out as dashes, and a slide wide enough to fix it let the window slide off the stroke and match the sparsest character: when touching the matcher, probe it with one vertical and one horizontal stroke at eight sub-cell offsets (it must give `|` and `¯ - _` in one cell each) before looking at a scene.
- 2026-11-10 · one-or-zero · Glyph strokes are far thinner than a picture's strokes at the buffer's sampling: descriptors are taken from thickened glyphs, or nothing compares like with like.
- 2026-11-10 · one-or-zero · What the terminal prints goes in the empty corner over the lead, large, under the command that produced it; the same record small next to its owner. One text block that reads like a real session beats labels scattered over the picture.
- 2026-11-10 · one-or-zero · Machine output at a human typing rate took twice its slot: `printed` (even, 30–90 characters a second) for the machine, `typed` only for what a person types.
