# ae-flock-rig

- **Style:** none (a tool for After Effects; the engine scene is a diagnostic preview)
- **Format:** 16:9 · 8 s · 24 fps (preview and demo project)
- **Purpose / audience:** a senior motion designer who works in After Effects. Proof of
  concept for "code does the count, AE keeps the look": a flock that follows a keyed null,
  baked into native layers the designer styles and art-directs with sliders.
- **One-line idea:** select a bird precomp and a leader null, run `Flock.jsx`, get N birds
  with keyed position / rotation / scale / flap phase and a `Flock Controls` null with live
  sliders (Spread, Bird Size, Size Variation, Perspective, Orient, Flap Speed, Flap Desync).
- **References:** none (boids: separation, alignment, cohesion, plus a damped spring to the
  leader with a dead zone the size of the flock, and sine-wave turbulence)
- **On-screen text:** none
- **Music / rhythm:** none
- **Must NOT happen:** a bird snapping its rotation from one frame to the next; a re-run that
  stacks a second flock on the first; expressions that error when the comp opens; a 2D
  bird flying upside down after turning around; different numbers in the preview and in AE.

## Pieces

| File | What it is |
|---|---|
| `flock-sim.js` | The simulation, plain ES3: runs in After Effects, Node and the engine |
| `flock-ae.jsx` | The After Effects half: dialog, leader sampling, layer building, expressions |
| `build.mjs` | Joins both into `Flock.jsx` and lints for ES3 |
| `Flock.jsx` | The deliverable: one file to run in After Effects |
| `make-demo.jsx` | Builds a demo project (bird precomp, leader null, flock); test mode renders and logs |
| `scene.js` | Engine preview of the same simulation, drawn the way the rig shows it |
