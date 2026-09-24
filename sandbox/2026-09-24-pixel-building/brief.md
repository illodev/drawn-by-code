# pixel-building

- **Style:** pixel-art (the style test that introduces it)
- **Format:** 1:1 · 5.1 s · 10 fps (the reference's own frame rate), rendered at 1080²
- **Purpose / audience:** internal study. A 1:1 replica of someone else's pixel-art loop, to build
  and prove the `pixel-art` kit and the measuring tool `styles/pixel-art/grab.mjs`.
- **Reference:** a video from X, author to be credited (link to come from the user). The
  original design and animation are theirs; this replica is never published as ours. The
  reference video and its audio stay out of git (`out/reference.mp4`, `references/`), and
  the committed render has no audio (`-an`).
- **One-line idea:** a building in cutaway on a flat periwinkle sky: tiny people typing, a cat
  in a window, a man eating on a walking machine on the roof, a van «F.A.S.T», a statue, a
  blue creature, a sign «LISBON / N.TOKYO» with a cat on it, speech bubbles popping.
- **On-screen text (literal):** F.A.S.T · LISBON · N.TOKYO · «Gm» (a bubble)
- **Music / rhythm:** none in the replica (the reference's audio is not used).
- **Must NOT happen:** smoothing (every art pixel stays a crisp square), sub-pixel motion,
  eased motion (the reference changes drawing on whole frames), reference frames in git.

## Measurements

| What | Value | How |
|---|---|---|
| Grid | 230 × 230 art pixels, 4.696 video px each, offset 0 | `grab.mjs grid` (coarsest grid within 20 % of the best rebuild error) |
| Frame rate | 10 fps, 51 frames, every frame a new drawing | ffmpeg header + per-frame sprite sequences |
| Palette | 178 colours (162 from flat areas + 16 that only live in 1-pixel details) | `grab.mjs sprites` |
| Background | `#97b1fd` | most frequent cell colour |
| Actors | 23 moving things, 3–44 drawings each | changing cells grouped with a 3-cell gap |

## Shot list

| Time | Shot | What happens |
|---|---|---|
| 0–5.1 | Building | One still wide shot; ~20 small loops run at once (see the cast in `scene.js`) |
