# magazine-ad-test

- **Style:** magazine-ad (new, in testing): a 1950s magazine advertisement, printed. Two
  spot inks (orange, turquoise) and a black key plate on cream stock, flat and through
  coarse halftone screens, a little out of register; brush-ink outlines that swell and
  taper; «atomic age» graphics (starbursts, boomerangs) and a hand-lettered brush-script
  word.
- **Format:** 16:9 · 30 s · 24 fps, drawings on twos · 120 BPM (cuts on the half second)
- **Purpose / audience:** the first film in `magazine-ad`, which is also its style test. How the style was found, in the user's words: «Let's look for serious
  and solid styles for a new video» → «Make them less serious» → «Generate reference
  images with ElevenLabs so I can understand you better» → «For whatever reason, in 3 out
  of 4 sessions you've chosen a lighthouse as the reference» → «I'd go for mid-century» →
  «Don't generate any more references with ElevenLabs» → «I like the magazine ad».
- **One-line idea:** a 1950s magazine ad prints itself, wakes up and sells a loaf, and the
  cat gets the first bite. A spot for an imaginary bakery, **Early Bird Bakery** (fictional,
  no real brand). The user: «I like it quite a lot; write a carefully crafted script and
  let's go with it.»
- **Two threads:** the print run (blank stock → three plates → back to blank stock), and the
  cat eyeing the bread (an ear in shot 2, the whole of shot 6, the bite in shot 8). The night
  in the window (shot 3) pays off as the sun rising behind the logotype (shot 8).
- **Characters:** Joe the baker and the cat, as drawn in `ref/C-a.png` and `ref/C-b.png`
  (no other drawings of them exist, and none will be generated): limited animation in the
  manner of a 1950s TV spot (held drawings, moving pieces), and cuts between the two
  panels where the action would need new poses.
- **References** (generated in the user's ElevenLabs flow, gpt-image-2.5-sunburst; no
  more will be generated):
  - `ref/C-a.png`, `ref/C-b.png`: the two takes of «1950s magazine advertisement» on the
    bakery motif, 1280 × 720. The style is measured on them.
  - `ref/search-1-six-looks.jpg`: the first round (six looks on one motif, a lighthouse:
    the stock motif the user called out); `ref/search-2-mid-century.jpg`: four kinds of
    mid-century on the bakery (A limited-animation cartoon, B picture book, C magazine ad,
    D geometric). C was chosen.
- **Measured** (`ref/C-*.png`): paper `#f4e2c5`; solids orange `#eb5f18`, turquoise
  `#1e8c97`, black `#141411`; the night outside the window is turquoise under black,
  `#0e4f6a` (three inks cannot make it: it prints teal-black); round dots, the colour screens
  ≈ 2 px a cell at 1280, the black's coarser; the colour plates sit 2–4 px (at 1280) off the
  black.
- **On-screen text (literal):** «Fresh!» (in the reference), «10¢ a loaf!», «Early Bird
  Bakery», «Baked while you sleep!», «Mill Street · open at 6 a.m.»
- **Voice-over (literal, a 1950s announcer):** «Before the sun comes up…» · «…while the whole
  town is fast asleep…» · «…Joe's pulling the first loaves from the oven!» · «Golden crust.
  Soft as a cloud inside.» · «Fresh every morning — just ten cents a loaf!» · «Early Bird
  Bakery. Baked while you sleep!»

- **Music:** a jaunty 1950s jingle at 120 BPM (sound stage, ElevenLabs), with the announcer.
- **Must not happen:** a fourth ink «because it is easier»; clean vector edges; a baker
  that moves by sliding a still drawing.

## Script

| Time | Shot | What happens (one action) | Sound |
|---|---|---|---|
| 0.0–3.0 | 1 · Press run | Blank cream stock. On 0.5, 1.5 and 2.5 s the plates print one by one with a thump (turquoise, orange, the black key); each lands a few pixels off register and settles | three press thumps |
| 3.0–6.0 | 2 · The page wakes | The starbursts spin and twinkle on the offbeats, «Fresh!» flashes on the beat, steam starts to rise in the oven, the cat's ear twitches | the jingle starts; VO 1 |
| 6.0–9.0 | 3 · The sleeping town | The camera pushes into the window (the dots grow as it goes in): the street lamp flickers and the last lit window goes dark | VO 2 |
| 9.0–13.0 | 4 · Joe at the oven | Back out to Joe: he draws the peel a hand's width out of the oven, the loaves slide out of the glow in a puff of steam, he blinks and his grin widens | VO 3, a whoosh |
| 13.0–16.0 | 5 · Golden crust | Push in on the loaves until the dots are big: the score lines crackle, steam curls up, flour dust falls | crackle; VO 4 |
| 16.0–19.0 | 6 · Somebody's watching | The cat on the flour sack: its head turns to follow the loaves, its tail swishes on every beat, a turquoise «!» starburst pops beside it | slide whistle |
| 19.0–23.0 | 7 · Ten cents | A boomerang wipes to the second panel (`ref/C-b.png`): Joe, leaning back with the peel out of the oven, laughs; a starburst badge «10¢ a loaf!» punches in on the beat | VO 5 |
| 23.0–28.0 | 8 · Early Bird | End card: «Early Bird Bakery» drops in letter by letter, a half sun of rays rises behind it, «Baked while you sleep!» brushes on, a loaf turns in a starburst, «Mill Street · open at 6 a.m.»; on the last word a bite vanishes from the loaf and a cat's tail whisks out of frame | VO 6; chomp |
| 28.0–30.0 | 9 · Lift-off | The plates lift off in reverse (black, orange, turquoise) back to blank stock | three soft thumps; the jingle's button |
