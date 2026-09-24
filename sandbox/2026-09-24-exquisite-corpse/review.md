# Reviews · exquisite-corpse

Reference: *Rick and Morty · Exquisite Corpse*. The analysis (contact sheets of the whole
video and at 5 fps across four style changes) produced the four transitions used here:
engulf (0:15), frame within the frame (1:04), vortex (2:31) and entering through the mouth
(3:17).

## Round 1 (auto · full sheet)

- **Enter through the eye (5.2 s):** the portal replaced the eye from the first frame and
  a flat pink disc showed. → `fadeIn` in `Trans.enter`: the eye's spiral is seen first.
- **Engulf (11 s):** each cloud left its whole ring and a tangle came out on top of the
  liquid light. → in `Trans.engulf`, the edges are painted before `b`.
- **Jellyfish:** 34 big blobs, a shapeless soup. → 5 small background ones pushed to the
  edges, a dome bell (magenta) and 4 thin tentacles (turquoise).
- **Marble:** too small to be the common thread (radius 24 → 32–40) and it disappeared at
  18.0 s. → minimum radius of 10 at the vortex point.
- **Kaleidoscope:** after the hue change, brown colors. → `saturate` 1.5 and a 110° hue
  rotation; the background bands, from largest to smallest.
- Kits: the poster's melt came out as spikes (→ round drips) and the liquid light made
  moiré in the center of the blobs (→ rings on a capped logarithmic scale).

## Round 2 (auto · full-size stills + audio)

- The crumpled sheet (28 s) was a polygon with stripes. → light and shadow facets, and
  clipping to the sheet's rectangle too (facets were peeking outside).
- The kaleidoscope changed almost entirely every 1/6 s. → rotation 0.3 rad/s and pieces
  at half speed. `review.mjs` now measures **flashes** (0 here) and separates jumps from
  cuts.
- Audio: the frog and the return were almost silent next to the kick. → pad and sitar
  louder and kick quieter.
- **Intentional:** at 18.0 s `review.mjs` flags a flat frame: it is the point (the marble
  at radius 10) the kaleidoscope is born from.

## Round 3 (user)

> «No está mal para ser el primero. Pero me falta densidad y dinamismo. Sobre todo en esa
> escena [la medusa, 0:15] se entiende que sea psicodélico, pero no entiendo la escena en sí.»

(“Not bad for a first one. But it lacks density and dynamism. Especially in that scene
[the jellyfish, 0:15] I get that it is psychedelic, but I don't understand the scene itself.”)

- **Diagnosis:** the jellyfish was a look with no action. Describing the shot in one
  sentence gives «a glowing blob floats»: nothing happens, it has no context (the void)
  and no clear silhouette (the tentacles merged into one mass). In the rest, empty
  backgrounds and moments with only one thing moving.
- **Jellyfish, remade around an action:** *the marble gives color to the sea*. Particles
  that gather into a jellyfish (scalloped bell, oral arms, 4 thin separated tentacles)
  that swims in strokes on every bar (contracts, rises, glides), and on every beat the
  marble emits a wave of light that passes through it and tints the sea. The background
  sea is a second faint layer of rising plankton, with bubbles.
- **Liquid light kit:** transparent layers (`transparent`), per-layer brightness (`gain`)
  and light waves (`pulses`).
- **Density in the rest:**
  - Frog: ripples in the water, the marble's reflection, a fish that jumps in the dead
    time (1–1.9 s) and a second lily pad with a flower.
  - Mushroom: a chorus of small mushrooms on the offbeat and spinning daisies.
  - Doodle: the sheet full of wobbling doodles, and the marble leaves a color trail as it
    rolls (the color spreads into the line world).

## Round 4 (user)

> «Está muy bien.»

(“It's very good.”)

Approved. The four new styles go from «in testing» to approved, with this video as the
reference.

**Pending for a next version:** the kaleidoscope (18–22 s) is now the segment with the
least action. It is a pattern that spins, but nothing happens; it could be solved by
applying the rule of «one action you can tell in one sentence».
