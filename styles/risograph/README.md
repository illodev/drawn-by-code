# Risograph

![Risograph](strip.jpg)

Scenes printed like a riso print: four spot inks (fluorescent pink, yellow, blue, navy) on
warm paper, flat and halftone plates, overprints that make every other colour,
misregistration, uneven inking and paper grain.

**Status:** in testing · **Skill:** [`style-risograph`](../../.claude/skills/style-risograph/SKILL.md) (the rules and the checklist that keep every video in the style consistent)

## Start a video in this style

```bash
node engine/new.mjs my-test --style risograph --aspect 1:1 --duration 5
npm run preview    # http://127.0.0.1:5173
```

`template.js` is the minimal scene `new.mjs` copies.

## Files

| File | What it gives |
|---|---|
| `template.js` | a sun and hills printed in four inks, a ring drawn on |
| `riso.js` | `Riso`: the press (plates per ink, halftone screens, overprint, register, uneven ink, grain), hand-inked lines and rings, tone ramps |

## Made with it

- [opus5-riso](../../sandbox/2026-09-24-opus5-riso/) · a study of a riso-printed film (the lighthouse card) · [mp4](../../sandbox/2026-09-24-opus5-riso/render/)
