# Skate toon

The look of a late-'90s extreme-sports TV cartoon: a thin, even, hand-held black line, flat
saturated colour with no shading under a yellow sky, kids with huge heads, goggle eyes and
wide toothy mouths in clothes far too big, chunky boots, fat-fingered hands, sets in crooked
perspective with loose tick marks. Characters and places are always our own.

**Status:** in testing · **Skill:** [`style-skate-toon`](../../.claude/skills/style-skate-toon/SKILL.md) (the rules and the checklist that keep every video in the style consistent)

Model sheet of its first cast: [`sandbox/2026-11-14-pier-pressure/review/cast.jpg`](../../sandbox/2026-11-14-pier-pressure/review/cast.jpg).

## Start a video in this style

```bash
node engine/new.mjs my-test --style skate-toon --duration 4
npm run preview    # http://127.0.0.1:5173
```

`template.js` is the minimal scene `new.mjs` copies.

## Files

| File | What it gives |
|---|---|
| `template.js` | a kid on a sea wall waving on the beat, a palm, a hand-lettered sign |
| `toon.js` | `SkateToon`: the palette, the hand-held line, flat shapes, one-skin unions, ribbons, set pieces whose corners overshoot, tick marks, glass, palms, sign lettering, the hand chart |
| `kid.js` | `SkateKid`: the figure from a spec and a pose (head, face and mouths, hanging clothes, soft-jointed limbs, boots), with hooks for hair, prints and props |

Font: [Bangers](../../fonts/OFL-Bangers.txt), SIL OFL 1.1.
