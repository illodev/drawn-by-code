# Reviews · lottie-layer

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

## Round 1

- **Automatic:** no warnings (the out-of-order hash check passes with two Lottie players in
  the scene, one of them replayed backwards at 3.4 s); 3 ms/frame. A first cut at 6 s had a
  1.5 s still stretch at the end: cut to 5 s.
- **Measured:** pixel centroids of the Lottie ring (top track) and the code dot (middle
  track) on all 120 frames at 1920: worst gap 0.41 logical units (≈ 0.5 px, centroid noise).
  The 60 fps composition seeks cleanly from a 24 fps scene with frame interpolation on.
- **By eye (crops of the badge at 0.75–1.13 s):** disc overshoot, shock ring fading out,
  two waves of dots, the check parented to the disc (it scales with it) and drawing itself
  on through the trim path; clean antialiased edges, no dark fringes (the pixel buffer is
  straight alpha).
- **Probe:** `setFrame` outside `0 … frames − 1` (240, 241, −1) is ignored and the canvas
  keeps the previous frame. `lottie.js` clamps to that range and throws if a frame did not
  take.
- **Lessons → engine skill («Lottie layers»):** the frame range above; in Lottie JSON the
  key that starts a segment carries both bezier handles, so `Lottie.ease(key)` =
  `Ease.bezier(o.x, o.y, i.x, i.y)`; Lottie fits flat motion, not the textured styles.
