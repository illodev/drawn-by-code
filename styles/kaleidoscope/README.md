# Kaleidoscope

![Kaleidoscope](strip.jpg)

Radial mirror symmetry, pieces coming out of the centre, rotation and colour cycling.

**Status:** approved · **Skill:** [`style-kaleidoscope`](../../.claude/skills/style-kaleidoscope/SKILL.md) (the rules and the checklist that keep every video in the style consistent)

## Start a video in this style

```bash
node engine/new.mjs my-test --style kaleidoscope --duration 5
npm run preview    # http://127.0.0.1:5173
```

`template.js` is the minimal scene `new.mjs` copies.

## Files

| File | What it gives |
|---|---|
| `template.js` | a few seconds showing the style in miniature |
| `kit.js` | `Kaleido`: draws any motif mirrored in wedges round the centre; beads |

## Made with it

- [exquisite-corpse](../../sandbox/2026-09-24-exquisite-corpse/) · the climax, 18–22 s · [mp4](../../sandbox/2026-09-24-exquisite-corpse/render/)
