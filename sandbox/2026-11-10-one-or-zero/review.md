# Reviews · one-or-zero

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

The user's request (2026-11-10): «Quiero crear un nuevo vídeo basado en Mr. Robot y su
filosofía, ejemplos de escenas que me gustan», followed by four passages: people and their
vulnerabilities, «are you a one or a zero?», «is any of it real?» and the speech about
control. The brief turns them into one terminal session of five commands; this folder holds
the style test for it (the carriage, `cat people/*`), in a style made for the film.

## Round 1 (auto) · the style and the first pass of the shot

- No style in `styles/` could carry it: new style **terminal** (`styles/terminal/term.js`,
  skill `style-terminal`): the frame is one character grid; pictures are painted in a small
  buffer and turned into characters; text is typed into cells; a tube finish (bloom,
  scanlines, vignette, grain) and glitches. Font: JetBrains Mono (OFL), added to `fonts/`.
- First carriage: passengers shaded by tone (grey fills converted with the whole ASCII
  set). At 16 cells wide they read as **robots made of letters**, merged into one grey band
  with the bench behind them. The hooded figure, seen from behind, was a dotted blob.
- Changed: people are line drawings (a black shape, a thin outline, a faint flat texture);
  pictures use symbols only, so letters are kept for text; four passengers at 1.4× with a
  gap between them instead of five; the bench is two lines, not a fill; the hood is in
  profile in the lower left corner (a nose, lips, a chin, one red eye), lit from the right.

## Round 2 (auto) · the matcher

- By eye, in crops at full size: stray quote marks beside every outline, `{ } [ ] = + ~`
  where a line should be, and the old man's cane and shins broken into dashes.
- The dashes were strokes running along the border between two cells: each cell saw half a
  stroke at its edge and the sparsest character won. A wider slide fixed some and broke the
  rest (the window slid off the stroke and matched `¯`). A probe with one vertical and one
  horizontal stroke at eight sub-cell offsets showed it; the matcher now: drops cells a
  stroke only clips, leaves a border stroke to the neighbour that holds more of it, lets
  the cell slide two samples across but never lose its light, weighs uncovered light more
  than extra ink, and compares against thickened glyphs. The probe gives `|` and `¯ - _`,
  one cell each, at every offset.
- The edge set went down to `/ \ | _ - ¯ ' , . ( )`. Parts thinner than a cell (a cap's
  brim, a cane, a tail, headphone ears, hands as tiny ovals) made runs of parentheses: they
  are single strokes now, and the phone sits between the forearms' round ends.

## Round 3 (auto) · layout, timing, sound

- The first record opened large over the ceiling lamps and the sentence ran across the
  passengers' shins. Now everything the terminal says is one block in the empty corner over
  the hood, at 2×: the command, the record being printed, then the sentence. The small
  record of each passenger sits inside the window behind them (the window frame is its
  frame, numbered in its top edge).
- The command was 1× in a corner: it is the line that tells the shot, so it is 2×.
- Records typed at a person's rate overran their slot (the third line of 01 was still
  printing when 02 was scanned). The machine prints at an even 30–90 characters a second
  (`Term.printed`); only what he types (`Term.typed`) has a person's rhythm. The last two
  scans moved a quarter beat earlier so all four records are complete before the hit.
- `review.mjs`: no warnings (deterministic, no flashes, nothing still for a second),
  74 ms a frame at 960.
- Sound: a 20 s cue from ElevenLabs Music v2.5 through the user's connector (two takes,
  about 300 credits each), prompt: «Dark minimal electronic thriller underscore at exactly
  96 BPM in D minor. A low analog synth drone, a steady pulsing sub-bass note on every beat
  from the very first second, a sparse hypnotic arpeggiated synth pattern in sixteenth
  notes, cold glassy high pad, soft muted kick on each beat, no snare, no melody lead.
  Tense, cold, restrained and hypnotic, steady energy throughout with no intro and no
  build; crisp modern production.» Both measured 96.00 BPM; take A is steady from its first
  second (kick 0.49 s into the file), so the cut starts there. Under it a synthesized
  carriage (rumble, a double knock every two beats) and the library's keys, scan and
  glitch on the scene's constants (`sound.sh`, `audio.json`). Mix: −16.0 LUFS, the hits
  3–4 LU over the bed.
- Downloading the cue needed `elevenlabsusercontent.com`, which the session's network
  refused: a personal cloud environment «drawn-by-code» was created for this repo with
  that one host allowed (approved by the user).

## Round 3 (user, while it was being built)

> «Tengo el conector de Elevenlabs activo y creo que los textos los vamos a poner en inglé»

- On-screen text is English (records, command, sentence); the brief says so.
- Music comes from the connector (above).

## Round 4 (user)

> «Creo que hacen falta muchos más detalles a nivel de diseño»

The frame was correct and bare: four outlined people on two lines of bench, empty window
frames, a prompt. Translated into a pass on everything that is designed:

- **Grid:** 192 × 54 on a 1920 × 1080 logical frame (was 160 × 45): 44 % more cells, glyphs
  still whole pixels (10 × 20 at 1920).
- **The set** (`set.js`, typed): a ceiling with panel joints and tubes; a strip of cards
  over the windows with copy from the film's world («FEEL BETTER™ ask for the blue one»,
  «SMILE. you are on camera 14», «IN CASE OF DOUBT keep scrolling», «-50% TODAY you
  deserve»); the map of LINE 7, a loop (wake, work, want, buy, owe, sleep, wake) with the
  next stop blinking; a sign that scrolls in cyan with a running clock; a rail whose straps
  swing in a wave on every rail joint; rounded windows with a reflection of the tube, the
  tunnel's ribs, cables, lamps and a painted number going by; a padded bench in cushions,
  its edge, the heater's slats; a floor with a joint, speckle and litter; poles with a
  collar; a door with its light; the glazed end panel with «DO NOT LEAN».
- **The terminal as a product** (`ui.js`): a top bar (tty, user@host:path, the running
  command, CPU meters that jump when a record is read, memory, network, a clock that
  runs), a bottom bar with the session's windows, one per command of the film
  (`0:people* 1:real 2:find 3:ps 4:kill`); the pane is the end panel's glass, with a
  title, a login line and a scroll bar; every record has a file name and its permissions
  (`people/01 r--r--r--`, readable by anyone); every bracket an id, ticks and a reading.
- **The people** (`cast.js`): each has a material of their own through `mats` (her hair in
  strands, his pinstripe, the boy's denim and padded headphones, the old man's knit),
  things (a striped scarf and a handbag; glasses and a badge; a cap, a hood, a skateboard
  with grip tape; a flat cap, glasses, a moustache, a cane with a crook), a nose, shoes
  with a sole, boots. The dog is fur with two eyes and a nose cut out as whole cells. A
  phone is a block of 4 × 4 cells of cyan and lights the jaw above it.
- **The lead:** twice the cells; the cloth is lit (the lamps on the crown and the front of
  the hood, falling off toward his back) and painted as its own pass; stubble; the strap
  of a pack with a buckle; drawstrings with tips. Brow and nose in the lamps' white;
  lips, chin and jaw in the red of his own screen, like his eye.
- Three things went wrong on the way and are now rules in the style's skill: a bright
  material swallowed the outlines over it; shading in the same pass as strokes gave stray
  parentheses; holes and blocks off the cell grid gave half-characters.
- `review.mjs`: no warnings; 113 ms a frame at 960. Timing and sound unchanged.

## Open for the user

- The look: the grid, the line-drawn people, the hood in profile with one red eye, the red
  cursor as the only colour. What is approved here is locked for the film.
- The script in `brief.md` (five commands, about 67 s): the order, what each command
  shows, and the two lines quoted from the series.
- The sentence of this shot: «different details. same vulnerability.» (mine) or the
  passage's own first line.
- A voice? The film is written to work as typed text with music; a narrator would change
  the timing.
