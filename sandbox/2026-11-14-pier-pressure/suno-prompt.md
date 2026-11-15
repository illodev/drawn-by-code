# «Pier Pressure» · theme song prompt (Suno, Custom mode)

The opening is cut at 120 BPM and runs 24 s, with the title shouted at the end (see `brief.md`).

## Style of Music

```
late-90s kids cartoon theme song, surf punk, 120 BPM, twangy reverb surf guitar riff, fast palm-muted power chords, punchy live drums with tom fills, bouncy bass, gang vocals of kids shouting, bright, sunny, mischievous, lo-fi TV mix, short and tight, ends on a hard stop
```

## Lyrics

```
[Intro: seagull squawk, surf guitar slide, drum fill]

[Verse - fast, shouted]
Down at Gull Harbor, the tide's coming in
Kit's got the board, Hoagie's got the grin
Milo's got a plan and Pip's got the nerve
Aunt Dot's yelling "Hey! Mind the curve!"

[Chorus - gang vocals]
Pier Pressure! (Hey!)
Pier Pressure! (Hey!)
First one down, last one dry
Pier Pressure!

[Outro: hard stop, one seagull squawk]
```

## What the cut needs

- **120 BPM.** At another tempo the cuts are re-timed from a measurement
  (`node engine/tempo.mjs <song>`), but at 120 nothing moves.
- **24–30 s of song.** Suno tends to run long: keep the take whose first «Pier Pressure!» lands
  before 0:15; the ending is cut on the hard stop.
- No names of real shows or bands in the style field.
- The song file itself is not committed (`.wav`/third-party audio stay out of the repo); the
  mix is described in `audio.json`.
