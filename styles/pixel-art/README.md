# Pixel art

![Pixel art](strip.jpg)

Crisp square pixels on a low-res grid blown up with nearest-neighbour, sprites drawn as
string maps with a palette, and loops authored frame by frame at 10 fps.

**Status:** in testing · **Skill:** [`style-pixel-art`](../../.claude/skills/style-pixel-art/SKILL.md) (the rules and the checklist that keep every video in the style consistent)

## Start a video in this style

```bash
node engine/new.mjs my-test --style pixel-art --duration 4
npm run preview    # http://127.0.0.1:5173
```

`template.js` is the minimal scene `new.mjs` copies.

## Files

| File | What it gives |
|---|---|
| `template.js` | a few seconds showing the style in miniature |
| `pixel.js` | `Pixel`: a low-res screen (`rect`, `line`, `disc`, `blit`, `text` in a 3×5 font, `present`), sprites from string maps, palettes, flips, recolours, frame and loop indices |
| `grab.mjs` | measures pixel art in a video: the grid, the palette, the still scene and every loop, as sprite maps |

## Made with it

- [pixel-building](../../sandbox/2026-09-24-pixel-building/) · a 1:1 study of a pixel-art loop from X (author to be credited). Its sprites were transcribed from the video, so they are the artist's pixels: they stay in the experiment's `private/` and are not published. The kit and `grab.mjs` are ours.
