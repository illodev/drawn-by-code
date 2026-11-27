# lottie-layer

- **Style:** none (engine test card, flat)
- **Format:** 16:9 · 5 s · 24 fps
- **Purpose / audience:** test `engine/lottie.js`: Lottie files played by dotlottie-web
  (ThorVG in WASM) as layers of a scene, deterministic per frame
- **One-line idea:** a hand-written Lottie badge plays twice next to three tracks proving
  that `Lottie.ease` / `Ease.bezier` reproduce a Lottie's timing exactly
- **References:** none (both Lottie files are written by `make-lottie.mjs`)
- **On-screen text (literal):** «Lottie layer», «engine/lottie.js · dotlottie-web (ThorVG in
  WASM) · every frame = f(t)», «badge.json · written by code, no After Effects», «Lottie · a
  60 fps composition», «code · Lottie.ease on the same keyframes», «both · the dot stays
  inside the ring», a time / frame readout
- **Music / rhythm:** none
- **Must NOT happen:** a frame that depends on the previous one (seeking must be exact); the
  code dot leaving the Lottie ring

## Shot list

| Time | Shot | What happens |
|---|---|---|
| 0–5 | Test card | Badge pops in at 0.6 s (disc overshoot, shock ring, two waves of dots, the check draws on) and again at 3.4 s; from 1 s the ring travels the track and back (cubic-bezier .7,0,.3,1 out, .2,.8,.2,1 back) on the Lottie, code and overlaid tracks |
