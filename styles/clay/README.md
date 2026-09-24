# Clay (2D)

![Clay (2D)](strip.jpg)

Plasticine as illustration: flat silhouettes turned into soft 3D pieces (bevel, sheen, fingerprints, tool marks, soft shadows), stop motion with a boiling surface. Quick to render.

**Status:** in testing · **Skill:** [`style-clay`](../../.claude/skills/style-clay/SKILL.md) (the rules and the checklist that keep every video in the style consistent)

## Start a video in this style

```bash
node engine/new.mjs my-test --style clay --duration 5
npm run preview    # http://127.0.0.1:5173
```

`template.js` is the minimal scene `new.mjs` copies.

## Files

| File | What it gives |
|---|---|
| `template.js` | a few seconds showing the style in miniature |
| `clay.js` | `Clay`: clay pieces, lumpy outlines, sausages, contact shadows, clay letters |

## Made with it

- [fube-clay](../../sandbox/2026-09-24-fube-clay/) · the saas-promo invoice block redone in clay · [mp4](../../sandbox/2026-09-24-fube-clay/render/)
