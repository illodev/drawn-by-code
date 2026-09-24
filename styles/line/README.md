# Line

![Line](strip.jpg)

A black line on white paper that wobbles on purpose (line boil), like hand-drawn animation at 12 drawings a second.

**Status:** approved · **Skill:** [`style-line`](../../.claude/skills/style-line/SKILL.md) (the rules and the checklist that keep every video in the style consistent)

## Start a video in this style

```bash
node engine/new.mjs my-test --style line --duration 5
npm run preview    # http://127.0.0.1:5173
```

`template.js` is the minimal scene `new.mjs` copies.

## Files

| File | What it gives |
|---|---|
| `template.js` | a few seconds showing the style in miniature |
| `kit.js` | `LineArt`: boiling strokes (on twos), circles, paper, resampling |

## Made with it

- [exquisite-corpse](../../sandbox/2026-09-24-exquisite-corpse/) · the doodle, 23.5–27.5 s · [mp4](../../sandbox/2026-09-24-exquisite-corpse/render/)
