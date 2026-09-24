# Liquid light

![Liquid light](strip.jpg)

The oil-and-ink projections of 60s concerts: blobs that flow and merge (metaballs), shift colour and ring like oil on water.

**Status:** approved · **Skill:** [`style-liquid-light`](../../.claude/skills/style-liquid-light/SKILL.md) (the rules and the checklist that keep every video in the style consistent)

## Start a video in this style

```bash
node engine/new.mjs my-test --style liquid-light --duration 5
npm run preview    # http://127.0.0.1:5173
```

`template.js` is the minimal scene `new.mjs` copies.

## Files

| File | What it gives |
|---|---|
| `template.js` | a few seconds showing the style in miniature |
| `kit.js` | `Liquid`: the metaball field (flowing, merging, colour-cycling blobs), drift, glowing dots |

## Made with it

- [exquisite-corpse](../../sandbox/2026-09-24-exquisite-corpse/) · the jellyfish, 12–16.5 s · [mp4](../../sandbox/2026-09-24-exquisite-corpse/render/)
