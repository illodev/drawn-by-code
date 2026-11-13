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
