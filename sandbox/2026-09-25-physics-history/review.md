# Reviews · physics-history

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

## Round 1

### Round 1 (auto): assembly

**How it was built**

- The piece is one experiment with a file per segment (`segments/*.js`, each an IIFE that
  sets `Seg.<name> = { init, draw, atlas }`). `scene.js` only assembles.
- Newton → Faraday is the approved test (sandbox/2026-09-25-physics-newton-faraday),
  unchanged, wrapped as a segment.
- Galileo, Curie, Einstein and Schrödinger were each built by a parallel agent.
  - All four worked from one written brief: the contract, the quality bar and the user's
    feedback on the test.
  - Each had a dev scene in `dev/`.
  - Each join was given in exact screen coordinates.
- The atlas and the joins are the lead's work.

**The joins**, checked frame by frame at 7.84–8.0, 19.92–20.08, 25.84–26.0 and 31.84–32.0:

| Join | How it works | Checked |
|---|---|---|
| Galileo → Newton | The camera pushes through the amber ring Galileo pencils round Jupiter. The scene draws Newton's first frame inside the ring; Galileo stops drawing his own ring when the scene's takes over. | — |
| Faraday → Curie | Curie's first drawing calls Faraday's own `scale()`. The camera then pulls back: the strip is her electrometer's reading scale, and the beam comes from its mirror. | mean pixel difference 0.84/255 across the cut |
| Curie → Einstein | One track stretches into a full-width amber line at y = 450, which becomes Einstein's light beam (a match cut). | — |
| Einstein → Schrödinger | A single light-blue vertical line at x = 800 becomes the left wall of the box. | — |

**The atlas** (37–40 s):
- Six lenses in brass rims, echoing the first shot's lens, threaded by the amber line in
  reading order.
- Schrödinger's frame shrinks into its lens (his `draw` is his `atlas` from local 5, so the
  swap does not show), while the other lenses open on the quarter beats.

**The automatic review:** no warnings, no still stretches.
- Large jumps are flagged at 1.67–2.5 s (Galileo's cut on the beat at 2.0) and 18.5–19.3 s
  (the push into the dial and the spreading dark, the same as in the approved test).
- Painting takes 470 ms per frame at 960.

**Sound:**
- `music.mjs` is a synthesized score, regenerated rather than committed. At 120 BPM the
  motif gains an instrument per stage: glass → plucked string → brass → granular →
  strings → harmonics, and the whole ensemble resolves on D major at the atlas.
- Every half-second stretch sits between −16 and −24 dB mean.
- Six new ElevenLabs effects sit on their contacts (`audio.json`, onset-aligned):
  - brass ring at 1.08;
  - pencil at 6.5;
  - ball knock at 9.42;
  - magnet in and out at 14.85 and 16.85;
  - the two dishes at 20.92 and 22.92;
  - the sheet at 32.35.

**Lesson:** parallel agents sharing one folder of dev scenes overwrite each other's
`out/stills` and `review/`. Give each dev scene its own folder.
