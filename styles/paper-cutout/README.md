# Paper cutout

![Paper cutout](strip.jpg)

Torn paper with a white fibre edge, marker fill, grain and handwriting, animated on twos. Every element is its own set of pieces with textures that say what it is made of, and real hands.

**Status:** approved · **Skill:** [`style-paper-cutout`](../../.claude/skills/style-paper-cutout/SKILL.md) (the rules and the checklist that keep every video in the style consistent)

## Start a video in this style

```bash
node engine/new.mjs my-test --style paper-cutout --duration 5
npm run preview    # http://127.0.0.1:5173
```

`template.js` is the minimal scene `new.mjs` copies.

## Files

| File | What it gives |
|---|---|
| `template.js` | a few seconds showing the style in miniature |
| `paper.js` | `Paper`: torn cutouts, marker strokes, grain |
| `kit.js` | `PaperKit`: paper backgrounds, handwriting, titles, sheets, tickets, steam wisps, grain |
| `detail.js` | `PaperDetail`: hands (by side and view), knit, newsprint, wood grain, creases, splines |
| `showcase/` | every detail piece and hand pose on one scene |

## Made with it

- [saas-promo](../../sandbox/2026-09-24-saas-promo/) · the 50 s marketing video · [mp4](../../sandbox/2026-09-24-saas-promo/render/)
- [what-do-you-love](../../sandbox/2026-09-24-what-do-you-love/) · a 1:1 replica at full detail · [mp4](../../sandbox/2026-09-24-what-do-you-love/render/)
- [coffee-first](../../sandbox/2026-09-24-coffee-first/) · the first style test · [mp4](../../sandbox/2026-09-24-coffee-first/render/)
