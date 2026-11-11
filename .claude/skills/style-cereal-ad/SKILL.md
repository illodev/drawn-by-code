---
name: style-cereal-ad
description: '90s cereal commercial style (in testing): a Saturday-morning TV spot taped on VHS and played on a CRT. Flat cel colour with an even dark outline, box characters in oblique projection, spinning sunbursts, jagged starbursts, Memphis shapes, chunky extruded letters that hop on the beat, and a tape-and-tube finish (glass shape, chroma smear, tracking, PLAY ▶ on blue). Use it for '90s, retro TV, VHS, Saturday-morning cartoon, cereal ad, bumper or sing-along looks, music videos in that vein, or when working with styles/cereal-ad/.
---

# Style · '90s cereal commercial

**In testing.** Reference: `sandbox/2026-11-11-runnin-down-a-dream/` (`review/sheet.jpg`), a
videoclip that borrows the look. The look was measured on a cereal spot the user gave as a
reference; a piece in this style does not need cereal or a mascot.

## Code

`styles/cereal-ad/cereal.js` → `Cereal`. Declare the fonts you use (OFL, licences in `fonts/`):

```js
fonts: [
    { family: 'Anton', src: 'fonts/Anton-latin.woff2' },        // block capitals, extruded
    { family: 'Titan One', src: 'fonts/TitanOne-latin.woff2' }, // round, for bumpers
],
post(ctx, t, env) { Cereal.post(ctx, t, env); },                // the tape and the tube
```

- **Time:** `onTwos(t)`, `drawing(t)` (12 drawings a second).
- **Backdrops:** `sunburst(g, cx, cy, { n, rot, a, b })` (rotate it smoothly with `t`);
  `burst(g, cx, cy, { r0, r1, n, seed, fill, ink, lw, sx, sy })`, the jagged pop-art star.
- **Memphis:** `shape(g, kind, x, y, s, rot, color, lw)` with kinds `squiggle zig ring cross
  bar tri dots`; `memphis(g, t, items)` for hand-placed shapes that tick on twos;
  `confetti(g, t, { seed, n, box, palette, avoid })` for a scatter; `sparkle`, `note`.
- **Solids (oblique projection):** `box(g, x, y, w, h, D, { front, top, side }, { depth })`,
  `prism(g, pts, Dd, cols)` for any front shape (clockwise, y down) swept back,
  `prismOutline` for rounded ones (no facet lines), `drum` for a wheel or a drum facing us.
  `D = [dx, dy]` is the screen offset per unit of depth: with `[+, −]` tops and right sides
  show. Rotate a solid by rotating its points, then sweep with the same `D`.
- **Lettering:** `text3d(g, str, x, y, { size, face, side, side2, bands, depth, dir, ow,
  track, letter(i) → { s, rot, dy, hide, face } })`: every letter is its own solid.
- **Tape and tube:** `osd(g, env, 'PLAY', { play: true })` (also `STOP`, `REW`, `FF`), drawn
  in the picture; `post(ctx, t, env, { track, roll, snow, bezel })` in the scene's `post`.
  `track` 0..1 tears the picture and adds snow bars, `roll` slides it vertically.

## Style rules

- **Palette** (`Cereal.COL`): hot pink, magenta, yellow, gold, orange, red, purple, violet,
  navy, blue, teal, aqua, a warm white, and an ink that is a purple near-black `#241531`.
  Saturated, three or four colours a shot, one of them carrying the backdrop. Black clothes
  and objects are painted deep blue-violet so the outline still reads on them.
- **Line:** an even outline (about 3.2 units in a 1000-wide frame, details 2.2–2.6), round
  joins, the same ink everywhere. No brush swell: this is cel, not comic ink.
- **Colour:** flat fills; a solid's top is lighter and its side darker than its front. A
  gradient only where it is the subject (a printed card, a sunset sky).
- **Solids:** oblique, never perspective. Fronts keep their true shape, depth goes up and
  to the right. A box is filled only on its seen faces.
- **Box people:** a head box (the hair is the box, the face a panel on its front), a torso
  box, stub arms that end in a block mitt, two legs with shoes. Faces are two slot eyes, a
  small hooked nose and a mouth; expression comes from lids, the mouth and what covers the
  eyes (sunglasses). **No fingers, ever:** a mitt holds a thing by resting on it. A person is
  told apart by the hair's silhouette, the clothes and what they carry.
- **Motion:** drawings on twos, each event ticking from its own frame (see Lessons); spins
  and camera moves are smooth. Things arrive with an overshoot (2–3 drawings), land with a
  squash, then keep the beat (a pulse that falls within the beat). Letters hop alternately.
- **Backdrops:** a spinning sunburst, a starburst behind the subject that pops and breathes,
  a floor band with a zigzag lip in front of them (it is the stage), Memphis shapes in the
  margins. Three layers at least.
- **Lettering:** Anton capitals as solids: a pale face with a banded dark side for secondary
  lines, a yellow face with red and orange bands for the big word. Words land on beats, one
  letter per drawing when a word is spelled out. Flat condensed capitals for printed cards.
- **Tape and tube:** every frame goes through `post`. The glass, the barrel, the fall-off
  and the display's lettering are measured: do not retune them by eye. Tracking trouble is
  an event (the tape starting, an edit), a few frames long, never a constant haze. The
  display (`PLAY ▶`) shows over the VCR's blue, not over a title.
- **Safe area:** the glass hides about 5 % at each corner and the tube bends the edges: keep
  text and faces 80 units inside a 1000-unit frame.
- **Forbidden:** fingers, perspective, brush-like line, soft shading, scattered shapes behind
  lettering, tape damage that hides the drawing.

## Detail

Crop each element at the output's size and check: every solid's three tones and closed
outline; a face readable at 180 px across; an instrument with its parts (pickups, guard,
frets, tuners, strings); letters whose sides show their bands; no shape touching a letter.

## Style checklist

- [ ] Does every frame pass through `Cereal.post`, with tracking only at tape events?
- [ ] Are all solids oblique with the same `D`, three tones, one outline width?
- [ ] Do hits land on their frame (each event's own on-twos clock), and do letters, the burst and the figure keep the beat between them?
- [ ] Is the backdrop three layers (sunburst, burst, floor) plus Memphis shapes placed by hand, none behind lettering?
- [ ] Hands: block mitts resting on what they hold, no fingers, sleeves ending before the mitt?
- [ ] Is everything important 80 units inside the frame (the glass eats the corners)?
- [ ] Does the last frame hold as a poster?

## Lessons

- 2026-11-11 · runnin-down-a-dream · With one global on-twos clock a hit on an odd frame waits for the next even one (sunglasses landed a drawing after the snare): give each event its own clock, `at + floor((t − at) · 12) / 12`, with `at` snapped to a frame.
- 2026-11-11 · runnin-down-a-dream · A box person's arms as wide as the torso hide what they hold: 0.15 of the head's width, and a head no deeper than half its width.
- 2026-11-11 · runnin-down-a-dream · A two-tone print of a character (a card, a poster) is the same drawing with a black-or-white palette on its own layer, multiplied onto the field: lights take the field's colour, like a duotone cover.
- 2026-11-11 · runnin-down-a-dream · A card that builds piece by piece must never be mostly blank: bring the empty bands in with the first hit and let the words land on the later ones.
- 2026-11-11 · runnin-down-a-dream · A pop that starts from nothing is seen a drawing after its hit: start it at 0.6 of its size on the hit's own frame (`Song.pop` in that experiment).
- 2026-11-11 · runnin-down-a-dream · The glass hides the bottom 50 units as well as the corners: when people must stand in front of a car (on the near verge), lower the camera instead of staging on the last strip of the frame.
- 2026-11-11 · runnin-down-a-dream · A scrolling set's foreground layer belongs to travelling shots only: on a static shot the one big near object sits on an actor for the whole shot.
- 2026-11-11 · runnin-down-a-dream · Rigs keep the beat: put «the band on its car, everybody playing on the kick and the snare» in one module (who is aboard, what the car does, pose overrides), so segments stage the action instead of posing five people.
- 2026-11-11 · runnin-down-a-dream · A shot that lays a piece of its own over a generated set (a side road across the verge, a pit) first clears the set's objects from under it (`World.back`'s `clear`): the user caught a road painted over a cactus's foot.
- 2026-11-11 · runnin-down-a-dream round 10 · A block arm is a sleeve, a cuff and a mitt along one line from the shoulder: with the mitt straight under the shoulder (resting on a rail at chest height) it has no length and reads as a peg clipped to the rail. Give every resting arm an angle and a visible sleeve (mitts meeting at the middle), and crop the pose at full size before the block is done.
- 2026-11-11 · runnin-down-a-dream round 10 · On a crowded stage, check both mitts of every player at the closest framing the film uses, not in the wide: a mitt hidden exactly behind a neighbour leaves a cuff floating on the neighbour («los brazos de algunos personajes»). Either the mitt is in sight on its instrument or the whole forearm is hidden; fix it in the rig (who stands where, how low he frets), so every block gets it. Two players whose necks point at each other: draw the one behind first, whole, and keep the front one's instrument and mitts unbroken.
- 2026-11-11 · runnin-down-a-dream round 10 · Someone standing in front of a prop and reaching into it is drawn in parts (the reaching arm, the prop's contents, the prop's near wall whole, then the body), never by clipping the prop at the body's side: the gap between the body and the clip shows the prop sawn off.
- 2026-11-11 · runnin-down-a-dream round 10 · The root fix for the peg arms: every stub-arm drawer bends an arm shorter than 0.3 units at an elbow (`Cast.elbow(sh, hand)` → the elbow, out to the shoulder's side; `Cast.upperArm` draws the sleeve to it, the drawer then draws its forearm from the elbow). Arms long enough stay exactly as they were, and the bend grows from nothing, so nothing jumps. A new character's arm drawer starts with those two calls.
- 2026-11-11 · runnin-down-a-dream round 11 · Clothes on a box character are worn, not attached: a scarf drawn as one more extruded box, after the whole figure, is a brick held in front of the chin. Anything round a neck, a wrist or a waist is soft (curved edges that sag, stripes that follow the curve), goes on between the body and the head (the head and the arms are painted after it) and is narrower in front than the thing it goes round is wide. A rig offers a `wear` hook at that depth so no block has to paint clothes on top.
