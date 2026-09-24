# Reviews · clay3d-test

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

## Round 1 (auto, by eye at full size)

- WebGL2 exists in the headless Chromium (SwiftShader, on the CPU): a raymarcher works.
  First measure: 40 blobs with soft shadows ≈ 7 s per frame at 1920. With bounds and
  `scale` 0.6: ≈ 2.5 s per drawing.
- Black frame, no error: the wall plane had its sign inverted (the camera was inside it).
- Contour lines like wood grain on the face and everything round. Not the clay relief, not
  the depth of field (though 8-bit depth also banded: now the blur radius is stored), not
  the shadow steps alone: the bounding spheres acted as surfaces for the soft-shadow rays
  and cast rings of penumbra. Bounds now switch at a 0.5 margin; the shadow uses the
  improved estimate with fine steps.
- Head cropped at the top: camera pulled back. Glasses touching into a heart: smaller
  rings. Collar and shirt stuck out like ears in the toast: flattened. The logo floated
  over its bar as a figurine: now in relief on a clay plaque, gaps as in the SVG. Door with
  panels and a knob, a picture in the frame, a warm vignette and film grain per drawing.
