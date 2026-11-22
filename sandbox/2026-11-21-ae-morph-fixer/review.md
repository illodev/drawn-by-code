# Review · ae-morph-fixer

## Round 1 · 2026-11-21 (automatic + inside After Effects 2026)

**Node** (`test.mjs`, 4,235 checks pass): the demo's 10 keys (4–10 points) become 64 points
each, every key within 0.065 px of its drawing (exact mode: 22 points, 3.5e-12 px), the
twist cut by 76–85 % per morph (points travel 224–241 px around the shape before, 36–55
after). 360 random morphs (1 in 6 rebuilt): rebuilt keys within 0.091 px, smooth points
0.000° off smooth halfway through every morph, a second run never changes anything; 26
random shapes with loops or cusps fell back to keeping their points, and say so.

Fixed while testing, in order:

- The shape check said splits moved shapes by up to 1.8 px. They didn't (brute force:
  ≤ 0.007): the projection refined each point on the segment of its nearest sample, which at
  a sharp tip can be the wrong one. → Every candidate segment refined, golden-section search
  (Newton stalls at cusps), and a brute-force recheck before any failure is believed.
- Directions compared each key with the previous one, so a near-zero-area key (a figure
  eight) could flip the rest of the chain. → All compared with the first key that has a
  clear direction; keys without one are left alone.
- **In-betweens were lumpy**, and more points only made them serrated. After Effects blends
  each handle in a straight line: a smooth point stays smooth halfway only if its two
  handles keep the same length ratio in both keys. Kept or split points rarely agree. → A
  rebuild mode (now the default): points at the same outline fractions in every key, every
  handle a third of the arc to its neighbour, corners pinned exactly at each key's own
  fraction (merging near ones gave their neighbours different spacing again). Each key
  within 0.1 px or it falls back to the exact mode.
- The quick tolerance check (cheap enough for ExtendScript) came in under the truth on
  tight bends: it now looks both ways, samples the original densely, flags a rebuilt
  segment whose handle points back against its chord (a fold), and aims at 80 % of the
  promise.
- A second run rebuilt a matched path (264 → 1,056 points): "already matched" and the
  alignment took the start decision separately and disagreed. → One shared decision; the
  rebuild starts at 16–64 points and grows only as needed.

**Inside After Effects** (`make-demo.jsx` in test mode, AE 2026 / 26.5; `review/ae-log.txt`):
all checks pass. Fix: 2 s for 10 keys. Key times, interpolation and easing unchanged; Before
untouched; a second run changes nothing; a Mask Path is fixed too; a path with an
expression is skipped; selecting the layer finds its path; the start dot (a
`path.points()[0]` expression) rides the first point. AE interpolates the fixed keys point
by point with Easy Ease as smoothstep, within 0.002 px of the preview's model.

- **AE stores path points as 32-bit floats** (0.00004 px off the computed keys).
- **ExtendScript and Node disagreed by 20 px** on the same keys. Two causes: ExtendScript's
  `sort` isn't stable (ties in the rebuild's share-out went elsewhere) → every comparator
  breaks ties by index; and AE's float-rounded inputs pick another, equally good, start on a
  symmetric shape (a five-point star) → the test now fixes AE's own stored inputs in Node:
  same numbers to 0.00004 px.
- **Render** (`aerender`, 14 s): mean difference **1.1** between AE's After half and the
  engine preview over 9 times. The Before half shows what the rig is for: AE's own morphs of
  these keys collapse into slivers and twisted ribbons.

**Not yet seen by the user.** Open questions for round 2: their own shapes (type outlines,
logos), compound paths with matching sub-paths, a tolerance option in the dialog.
