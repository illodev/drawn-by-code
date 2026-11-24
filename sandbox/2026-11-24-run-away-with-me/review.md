# Review · run-away-with-me

## Round 0 · brief and the song's map (no picture yet)

The user's requests, translated:
- «I want to make a videoclip for "Run Away with Me" by Carly Rae Jepsen, in a retro neon
  style, but not the typical empty one.» Twelve synthwave references given (kept out of
  the repo).
- «I would like it to be very Miami: sex, drugs, party, the love of two people. Obviously
  the sex would not be explicit.»
- «The drug use would lead to lights, maybe "visual hallucinations"; we have to catch the
  music's jumps well.»

Done:
- Measured the song (`tools/measure-song.py`): 119.00 BPM with no drift, bar 0 at 0.415 s,
  sections from five bands per bar, every jump of level and bass on the beat grid.
- Word times from a local transcription (`tools/transcribe.py`, no paid service); chorus 2,
  which the model skipped, is chorus 1 moved by 33 bars, checked on a clip.
- `review/song-map.png`: bands, sections, jumps and sung phrases on one timeline.
- Script v1 in `brief.md`, every jump given its picture.

Open (asked): 16:9 and the whole song; permission to generate the two characters' design
sheets (about 433 credits a sheet, 4–6 sheets); words on screen (the title only, or also
neon signs).
