# Reviews · donde-miro

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

## Voice

Seventeen takes, one per line (`gen-voice.mjs`), each given the line before and after for
its intonation. Checked: a transcription of the whole track (Scribe) matches the script
word for word; no take ends inside a sound (last 40 ms silent). Take peaks run from −2 to
−10 dBFS: to level in the mix.

## Animatic v1 (auto)

Seen on stills at 960 across the film:

- The stain as bare canvas reads at once: a hole of linen cut by whole brush marks.
- The people of the present, laid as plain strokes, were sharper than everything round
  them (a pixel-art child, a stick umbrella). → each stroke now goes down twice: wide and
  half-way to grey, then itself.
- A passer-by crossing mid-frame lost head and chest under the patch and left two feet
  below it. → they cross in the near foreground, seen from the chest up, and his eye rests
  higher while they pass.
- At the end the child stayed small. → she walks further in, to the bottom of the frame.

`review.mjs` over the whole film: no warnings (deterministic, no holes, no flashes), no
still stretch of 1 s or more. A chunked render repeats a frame at each join (`--to` is
inclusive): the chunks are cut to their own frame count before joining
(`tools/render-chunks.sh`), 2472 frames against 103 s of voice.

Open:

- She (1974) is a still figure for 17 s; only the curtain, her hem, the cat's tail,
  leaves and swallows move. The film will want her to do something (lower her hand, smile,
  call).
- The child is a soft blob with a wave: is that enough, or should she be read more?
- No sound but the voice yet; no title.

## Round 1 (user), on animatic v1

> La verdad es que no me transmite nada, ni la voz, ni el timing, ni el guion, ni la imagen.

My reading, to be confirmed with the user before anything is rebuilt:

- **Script:** it explains a mechanism (the diagnosis, «the head fills the holes») and then
  lists three examples of it. It is a demonstration of an idea, not a person: no name, no
  temper, nothing only he would say. The closing lines are an aphorism.
- **Image:** a storybook village seen flat and from far away, pasted as a patch on grey.
  Her face is 30 px tall. I answered «every micro-detail counts» with an inventory of
  things (tins, labels, spokes); what the references have and this lacks is light, air
  and one face close enough to matter.
- **Voice:** a narrator's read, even and clean, chosen from its description. I cannot hear
  it; I only checked its words.
- **Timing:** every look lands on its word and every beat lasts the same; it is a list
  with a rhythm of one. No silence is used, and there is no sound but the voice.

What I skipped: the animate skill asks for two or three script proposals crossed before
animating, and for the look to be locked on one shot. I built 103 s on the first script.

Nothing is rebuilt until the user chooses a direction (see the message of this round).

## Round 2 (user)

> El problema es que cuando tienes que explicar lo que pasa, deja de tener gracia. Y el
> hombre lo explica, parece más que está contando como se ha hecho el video a otra cosa.
>
> La voz es malísima, el timing es ultralento.
>
> La imagen, es eso, una imagen, no un vídeo.

Translation into changes (test «Paseo», `paseo.js`, 14 s):

- **Nobody explains.** No narrator. The rule is carried by a mismatch the viewer works out
  alone: the picture is the past wherever he looks, the sound is the present. A bus goes
  by (engine, horn) and inside what he sees it is a donkey with a cart of oranges; a cash
  machine beeps and Anselmo waves from the door of his shop; a child runs up giggling and
  in the doorway his wife lowers her hand and waves.
- **No voice** in the test at all: the old man's was rejected, and I cannot judge one by
  ear. If he speaks later it will be to the people he sees, not to us, and the user picks
  the voice from samples.
- **Fast.** A gag every three seconds; the eye jumps in a fifth of a second; the patch is
  there from the first frame.
- **A video.** He walks (the street slides by, his step bobs). The people of 1974 move:
  they are painted again for every drawing (`Oil.sprite`): the donkey trots, the wheel
  turns, the driver bobs, Anselmo's arm swings, she lowers her hand from her brow and
  waves. The present moves too: the bus, the child running up and hopping.

### «Paseo» (auto)

Seen on stills at 1920 and on two motion sheets of the render:

- The bus was hidden whole by the patch, so nothing said «this is a car now». → the
  vehicle is longer than what he sees: its nose and tail stick out, grey and soft, on both
  sides of the donkey.
- Anselmo and she read at once and their waves are clear at 1:1; a held pose does not boil.
- `review.mjs`: no warnings.

Not judged: the sound. Five generated effects (square, his steps, bus with horn, cash
machine, a child running and giggling), levelled by measurement only.

## Round 3 (user)

> Qué versión de elevenlabs has usado. Recomiendo la v4. Y la voz una consolidada, esta es
> horrible y robótica. El guion cambiarlo entero. Y la imagen, no sé. La verdad que no sé ni
> si seguir con el vídeo.

Facts: the narrated animatic used `eleven_multilingual_v2` with «Luis, Pleasant, Mature,
Engaging», a voice picked from its description. The account has `eleven_v4`. Ranked by use
(`/v1/shared-voices`, Spanish, male, old), the established voices are «El Faraón - Powerful
and Resonant» (a warm grandfather, Latin American, 364 M characters in a year) and, in
peninsular Spanish, «Rafael - Expressive and Theatrical» (226 M).

Done: two 7 s samples with `eleven_v4`, one per voice, on two lines in the new register
(he speaks to the people he sees, he explains nothing): `private/audio/muestras/`.
Nothing else is built until the user decides whether the film goes on.

Rule from now on: the model is the newest the account has, the voice is chosen by its use
count, and the user hears samples before a script is recorded.

## Round 4 (user), on the two `eleven_v4` samples

> No me convence ninguna voz

Three generated voices rejected (Luis on multilingual v2, Rafael and El Faraón on v4). No
more are generated blind: the film either has no spoken voice (as «Paseo» already has
none) or a person records it. Whether the film goes on at all is still the user's call.
