# Reviews · runnin-down-a-dream

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

## Before round 1 (user, while the style was being built)

- «Quiero hacer un vídeo, videoclip de la canción Runnin' Down A Dream de Tom Petty con
  estilo '90s cereal commercial, te paso video referencia de uno generado por claude»
- «Importante desde el segundo cero cada detalle contará, cada pixel tiene que ser perfecto.
  La canción acaba en el 4:21-4:22»
- «Referencias a Tom Petty And The Heartbreakers» (a band photo, the cover of *Full Moon
  Fever*, a frame of a band playing on a car)
- «Una cosa, no es un anuncio de cereales, es un videoclip. El estilo de cereal es referencia»

Translation: the reference gives the look only. A first plan with a cereal, a mascot and a
bowl was dropped before anything was drawn. The film is a videoclip with Tom and the band;
the tape, the tube, the cel drawing, the bursts and the lettering come from the reference;
the palette and the opening card from the album's cover. The video ends with the song's
fade (262 s).

## Round 1 (auto) · style test: the opening, 0–6 s

Built: the style kit (`styles/cereal-ad/`), Tom as a box person with his guitar (`cast.js`),
the song's clock (`song.js`) and the first three shots.

Measured on the reference rather than guessed: the glass (an inset of 2.2 % at the middle of
each edge growing with the 2.5th power to 5.7 % at the corners, a soft edge of about two
source pixels), a barrel of about 1 %, a 6 % fall-off, the bezel's black, the VCR's blue,
and the display's lettering (a thin slanted monoline with chamfered corners and a glow; its
place and size). The blue screen was compared side by side with the reference's first frame.

Seen and fixed, in three passes:

1. Character sheet at 500 units per head. The first Tom was a head on a guitar: arms as wide
   as planks hid the instrument, the hair hung over the whole jacket, the head box was twice
   as deep as it was wide. Fixed the proportions (longer legs and torso, a shallower head,
   arms 0.15 wide, the guitar at 0.86), gave the fringe curved curtains instead of a roof.
2. First stills. `PLAY ▶` sat on top of the name (now only over the blue); the card was
   mostly blank paper for half a second (the field and both lower bands now arrive with the
   first note, the moon rises through the pickup, the words land on notes 3 and 4); the
   title's words ran into each other (one line at 124, the big word at 246); the starburst
   covered the stage floor (the floor is drawn in front of it); scattered Memphis shapes
   fell behind letters and on top of each other (placed by hand now, and the twinkles too).
3. Full-resolution crops of the render. The sunglasses landed a drawing after the snare:
   with one global on-twos clock a hit on an odd frame waits for the next even one. Every
   event now ticks on twos from its own frame, and beats are snapped to frames.

`review.mjs`: no errors, deterministic, no flashes, no still stretches, 83 ms a frame warm.
One warning kept on purpose: the cut at 0.50 s is «off the beat» because it sits on the
guitar's first note (0.505 s), which is not on the grid.

Open questions for the user:

- Is Tom recognisable enough as a box person (blond curtains, blazer, red twelve-string), or
  does he need another signature (the top hat)?
- Which Heartbreaker plays what: they are assigned by look in the brief.
- Who made the reference spot, to credit it.

Not done yet, waiting for the style's approval: the README cover's carousel line and the
site's style line (new-style, step 7).
