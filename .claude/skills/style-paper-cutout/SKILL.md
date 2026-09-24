---
name: style-paper-cutout
description: Paper-cutout animation style drawn with code (torn edges, marker fill, grain, handwriting), the style of a previous paper-cutout short. Use it when asked for a warm, handmade or character video, or anything "paper/collage/cutout/stop-motion"-like, or when working with styles/paper-cutout/.
---

# Style · Paper cutout

Approved reference: `sandbox/2026-09-24-coffee-first/` (look at `review/sheet.jpg`
before starting).

## Code

- `styles/paper-cutout/paper.js` → `Paper`: `cutout(ctx, poly, color, seed, o)` is the
  base piece (torn white edge + color + marker strokes + pasted-paper shadow).
  Shapes: `roundRect`, `ellipse`, `circleUnion` (clouds, soft silhouettes), `noodle`
  (strips for arms and legs), `bezier`. Strokes: `markerStroke`, `scribble` (illegible
  writing), `marker` (texture). `grainTile` for grain.
- `styles/paper-cutout/kit.js` → `PaperKit.make(env, { font })`: `hand` (text that writes
  itself), `title` (text + underline), `sfxWord` («zap!»), `paperBg`, `glow`, `sheet`,
  `ticket`, `wisp` (a wisp of steam or smoke), `grainPost` and the `COL` palette.
- Characters as **puppets**: one function per character that takes `{ t, armL, armR,
  legL, legR, look, blink, … }` and is drawn with the origin **between the feet** (up is
  negative). Arms and legs are `noodle`s through shoulder-elbow-hand.
- If the hand rests on the body, the arm is painted in two passes (all of it behind, and
  from the elbow in front) so it reads as an arm akimbo and not as a mug handle.

## Style rules

- **Nothing boils:** every piece has its fixed seed. The tear and the texture are the
  same in every frame. Life comes from motion (breathing, swaying, blinking), not from
  a jittering outline.
- **Palette:** dark, muted background (aubergine `#3a2146`) with saturated pieces on top
  (orange `#f2643c`, mint `#6cc9a1`, yellow `#e9b949`). Ink `#2a1826`, never pure
  black. Cream `#f4ecda` for text on dark.
- **White edge** on every main piece; backgrounds have no edge.
- **Pasted-paper shadow**, short and offset down-right: the light is always the same
  across the whole piece.
- **Lettering:** Patrick Hand for everything handwritten (labels, notes, onomatopoeia).
  Brand/CTA text in the brand's typeface, never the handwritten font. An orange marker
  underline drawn right after the text.
- **Characters:** heavy-lidded eyes with a sidelong glance, a crooked half-smile; limbs
  one shade darker than the body. No blush unless it's for kids.
- **Camera:** frontal shots like a paper puppet theater; moves are gentle pushes (`cam`
  with `inOut`). Impacts are seen from above or head-on, never in profile against a wall.
- **What changes shape is animated like stop-motion:** steam, smoke, water, flames… are
  fixed cutouts (a sprite with its seed) that shift, rotate, scale and fade out, several
  staggered. Never regenerate, every frame, an outline with a torn edge that deforms: the
  tear is recomputed and boils.
  Whatever comes out of a container is painted **in front**, in the container's
  coordinates, and clipped (`clip`) to «above the surface» ∪ «the surface ellipse»; the
  piece starts hidden under the surface and emerges as it rises. Painting it behind the
  container makes it come out from behind the rim.
- **Steam and smoke = `kit.wisp`**, translucent tissue paper and not strips of opaque
  paper: it is born very thin, widens as it rises, drifts to one side (all wisps to the
  same side), curls and ends in a point. Few wisps (2–3 sources). Constant-width, opaque,
  vertical strips read as tentacles.
- **Eyes:** open, white + pupil + heavy lid (one shade darker than the face) that never
  lifts all the way. Closed, the lid covers **all** the white and the curved lash goes on
  top; if white shows, it reads «looking down», not «asleep».
- **Forbidden:** soft gradients and pure black.

## Style checklist

- [ ] Does any outline or texture change between two consecutive frames without the piece moving?
- [ ] Do all main pieces have a white edge and a shadow toward the same side?
- [ ] Is there any soft gradient or pure black?
- [ ] Is brand text in the brand's typeface and handwriting in Patrick Hand?
- [ ] Are the characters identical to their approved version (proportions, colors, face)?
- [ ] Are QR codes, stamps and documents complete and well made, not half-done?
- [ ] Is the grain visible across the whole image, text included?
- [ ] Is anything that changes shape (steam, smoke) made of fixed pieces and not by deforming a torn outline?

## Lessons

- 2026-09-23 · paper-short · Several characters in a row jumping at once read as a bug: stagger them or give one of them the lead.
- 2026-09-23 · paper-short · Stamps and impacts are seen from above (the rubber comes down toward the camera), not sideways against a wall.
- 2026-09-23 · paper-short · QR codes, stamps and documents are drawn complete and for real: half-made objects look like a bug.
- 2026-09-23 · paper-short · A visual joke that needs explaining is cut.
- 2026-09-23 · paper-short · A different setting per block; the same book of pages for everything gets repetitive.
- 2026-09-23 · paper-short · Characters always alive: they breathe, sway and blink with `t` even when not acting.
- 2026-09-24 · coffee-first · Steam as a deformed strip without an edge looked flat and off-style; as fixed cutouts that rise and fade, it works (now in Rules).
- 2026-09-24 · coffee-first · A character-object (the cup) reads as a character with just heavy-lidded eyes and a marker mouth: no arms needed for a short shot.
- 2026-09-24 · coffee-first · The user saw «tentacles» where I saw steam: constant-width, opaque, vertical strips. The good recipe is in Rules (`kit.wisp`).
- 2026-09-24 · exquisite-corpse · `markerStroke` sets its own `globalAlpha`: to fade it out, pass the alpha as a parameter, don't set it beforehand.
- 2026-09-24 · what-do-you-love · The old ban on stars and sparkles came from a client brief, not from the style; a paper-cutout reference uses both. Brand rules live in the brief, not here.
