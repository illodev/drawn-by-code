# Sections · the film's contract

The film is one song (251.4 s) cut into sections, one file each in `sections/`, all on the
same kit and the same look (the approved style test: `scene.js`, `drive.js`). A section
registers itself and is played by `full.js` (the whole film) or by its own dev scene.

```js
// sections/<name>.js — wrap everything in an IIFE: all files share one global scope
(() => {
    Sections.<name> = {
        from: 99.236, to: 131.50,          // song seconds, on bar lines (Song.B(n) = 0.415 + n·2.01672)
        shots: [[from, to, 'name'], …],    // song seconds, for the review's labels
        async setup(env) { … },            // optional: images, caches (env.state.N is the Neon kit);
                                           // what it returns is kept in env.state.sec.<name>
        draw(g, env, T, d) { … },          // T: song second (already on the 12-a-second grid), d: drawing index
    };
})();
```

- `g` is in logical units (1920 × 1080). Draw everything in the drawn manner (`styles/retro-
  neon/ink.js`): flat inks from `Ink.PAL`, an ink line on every opaque thing, light as strokes,
  neon glow through `env.state.N` (`N.light()`, `N.bloom()`), drawings on twos (d changes 12 a
  second; the scene already holds T for two frames).
- What the music does: `Film.effects(T)` (kick, bass, mid, trip, hold, black …) — extend it in
  your own section if you need cues of your own (do not edit film.js: say what you need).
- The cast: `Couple.standing(g, cam, who, feet, o)` (a whole figure at a world point, views
  'front' | 'tq' | 'side' | 'back', `flip`, `lean`, `sway`, `wind`, `T`, `d`; its strokes of light only on
  the back view unless `strokes: true`), `Couple.drawn(…)`
  in the car (see film.js `couple`). Their drawings are the user's approved sheets repainted
  by `tools/neonize.py` (`ref/neon/`).
- A camera: `Neon.camera({ pos, yaw, pitch, roll, f, W: env.W, H: env.H })` in metres.
- The files a section needs beyond the shared kit are listed on its first line
  (`// uses: set/<name>-x.js, props/<name>-y.js`) and added to `full.js`'s `uses`.
- Determinism: no Math.random, no Date, no state between frames.
