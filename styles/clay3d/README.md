# Clay 3D

![Clay 3D](strip.jpg)

Real 3D plasticine puppets, raymarched in WebGL2 inside the headless browser: lumpy pressed-on pieces (flat disc eyes, ball noses, hair in clumps), matte clay with fingerprints, soft studio light on a seamless backdrop, stop motion on twos. About 2.5 s per drawing at 1920.

**Status:** in testing · **Skill:** [`style-clay3d`](../../.claude/skills/style-clay3d/SKILL.md) (the rules and the checklist that keep every video in the style consistent)

## Start a video in this style

```bash
node engine/new.mjs my-test --style clay3d --duration 5
npm run preview    # http://127.0.0.1:5173
```

`template.js` is the minimal scene `new.mjs` copies.

## Files

| File | What it gives |
|---|---|
| `template.js` | a few seconds showing the style in miniature |
| `clay3d.js` | `Clay3D`: the raymarcher (prelude of shapes, lighting, soft shadows, depth of field, memo per drawing) |

## Made with it

- [clay3d-test](../../sandbox/2026-09-24-clay3d-test/) · Laura as a puppet: a wave and a thumbs up · [mp4](../../sandbox/2026-09-24-clay3d-test/render/)
