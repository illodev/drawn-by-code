---
name: style-pixel-art
description: Pixel art style, in testing: crisp square pixels on a low-res grid (e.g. 192 or 230 across) blown up with nearest-neighbour, sprites as string maps with a palette, tiny characters in small loops authored frame by frame at 10 fps, flat backgrounds. Use it for pixel art, 8-bit / 16-bit, retro game, sprite, «tiny people living in a building» loops, or when working with styles/pixel-art/.
---

# Style · Pixel art (in testing)

Style test: `sandbox/2026-09-24-pixel-building/` (a 1:1 replica of a pixel-art loop; its
`review/sheet.jpg` and `render/strip.jpg`). Template: `styles/pixel-art/template.js`.

## Code

`styles/pixel-art/pixel.js` defines `Pixel`:

```js
setup(env) {
    const pal = Pixel.palette({ K: '#2b2b3a', S: '#f2c7a0', R: '#e0525b' });   // or (symbols, hexList)
    return { scr: Pixel.fit(env, 192),                 // 192 art pixels across, scene aspect
             girl: Pixel.sprite(['.KKK.', 'KSSSK', '.RRR.'], pal) };            // '.' = see-through
},
draw(g, t, env) {
    const { scr, girl } = env.state, f = Pixel.frame(t, 10);   // the art's frame at 10 fps
    scr.clear('#97b1fd').rect(0, 88, 192, 1, '#6c87d4');
    scr.blit(girl, 40 + f, 77, { flip: false });                 // whole pixels only
    scr.text('LISBON', 10, 10, '#fefefc');                        // 3×5 font
    scr.present(g, env);                                          // nearest-neighbour blow-up
}
```

- Screen: `screen(w, h)` / `fit(env, across)`; `clear`, `px`, `rect`, `line` (Bresenham),
  `disc`, `blit(sprite, x, y, { flip, only })`, `text`, `textWidth`, `present`.
- Sprites: `sprite(rows, pal)` (compiled once, cached on the rows), `flip`, `recolor`.
- Time: `frame(t, fps)`, `loop(t, seq, fps, offset)` for a per-frame table of drawings.
- Measuring a reference: `node styles/pixel-art/grab.mjs grid <video>` (the grid), then
  `grab.mjs sprites <video> --cells N --min 100 --name Data --out data.js` (palette, still
  pieces, actors with drawings + the drawing per frame), `grab.mjs crop … --rect x,y,w,h`
  for one region as a string map to author from.

## Style rules

- **One grid.** Everything lives on the same art pixel grid: no scaling a sprite, no
  rotation, no sub-pixel positions, no anti-aliasing, no blur. Positions are integers;
  motion moves whole pixels per frame (a cloud: 1 px every 3 frames).
- **Frame rate of the art.** Scenes run at `fps: 10` (or 12): each frame is a drawing.
  Motion is a table of drawings per frame, never an eased curve.
- **Size.** 160–240 pixels across for a full scene; characters 7–16 px tall with a head
  of 4–6 px, eyes 1 px.
- **Palette.** Flat colours in ramps (light, base, shade; e.g. wall `#e98c67` with a shade
  side `#c46f4f`), a dark outline colour per material rather than pure black everywhere.
  Saturated 1-pixel accents (screen dots, a heart, lights) are what make it sparkle.
- **Backgrounds** flat (the reference: `#97b1fd` sky, a 1-px ground line), the detail
  goes into the objects.
- **Life.** Many small loops at once, each with its own length (a tail in 4 drawings, a
  screen blinking every frame, a bubble that pops: small for one frame, then full).
- **Text** in pixel fonts only (the kit's 3×5 or letters drawn as sprites), with a light
  top edge on signs.
- Forbidden: smoothing, gradients, drop shadows with blur, rotating sprites, easing.

## Style checklist

- [ ] Zoom a still to 400 %: every art pixel is a clean square of one colour.
- [ ] No sprite is drawn at a fractional position or scale (`Math.round` or integer maths).
- [ ] `fps` is the art's (10–12) and every loop is a table per frame.
- [ ] Each material has at least base + shade; lights and screens have saturated accents.
- [ ] Several independent loops; nothing on screen is dead for more than 1 s.
- [ ] Bubbles pop (1 frame small), characters change drawing, never slide.
- [ ] Replicas: `grab.mjs` for grid, palette and loops; crop-compare at full resolution.

## Lessons

<!-- date · experiment · one line -->
- 2026-09-24 · pixel-building · Measure the grid, never assume an integer scale: the reference's art pixel was 4.696 video px (230 across 1080), with runs of 4 and 5.
- 2026-09-24 · pixel-building · Pick the coarsest grid that rebuilds the frame within ~20 % of the best: 2× and 3× finer grids always score a bit better.
- 2026-09-24 · pixel-building · Sample each cell by the median of its inner pixels, a pixel away from the edges the codec blurs.
- 2026-09-24 · pixel-building · Build the palette from cells with a same-colour neighbour, then add the colours that only live in 1-pixel details (screen dots): the codec turns those into fake in-between colours otherwise.
- 2026-09-24 · pixel-building · Replicate loops as per-frame sequences of unique drawings (the still scene = per-cell mode over all frames); timing is then exact by construction.
