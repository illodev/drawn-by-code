---
name: animate
description: Directs the creation of a code-made animation or video in illomotion, from brief to final MP4. Use it whenever the user asks for a video, animation, motion graphics, explainer, product/launch video, reel, intro, animated logo or "a test" of a style; also to resume an experiment in sandbox/. Orchestrates the other skills (engine, review, sound and the chosen style's skill).
---

# Animate: from brief to video

Every video is made **with code** (2D canvas, deterministic, frame by frame) and reviewed
by looking at real frames. Nothing is signed off without being rendered and looked at.

## 0 · Before anything

- `sh engine/setup.sh` if there is no `node_modules/` or `ffmpeg` is missing.
- Read `sandbox/INDEX.md` (what has already been tried) and the relevant style skill.
- Available styles: folders in `styles/` with their skill `.claude/skills/style-*`. If
  the request fits none of them, use the **new-style** skill before going on.

## 1 · Brief (don't animate without one)

`node engine/new.mjs <name> --style <style> --aspect 16:9 --duration <s>` creates
`sandbox/YYYY-MM-DD-<name>/` with `brief.md`, `scene.js` and `review.md`.

Fill in `brief.md` with the user (ask only what you can't infer): what it's for, the idea
in one sentence, literal on-screen text, format, music, what must not happen. If there is
a product or brand, **nothing promises more than its website**: note the source of every
claim.

## 2 · Shot-by-shot script

A `Time | Shot | What happens` table in the brief. Rules that have already cost us dearly:

- **Every shot, one action you can tell in a sentence with a verb** ("the marble dyes the
  sea on every beat"), not a look ("a psychedelic jellyfish"). If the sentence is "X
  floats" or "X glows", the action is missing: the style doesn't replace it.
- **Density in layers:** a moving background, secondary elements with their own rhythm
  (on the offbeat, smaller and less saturated) and a protagonist. An empty background or
  a single moving thing reads as poor, especially in psychedelic styles.
- **One evolving visual idea** (the box that empties and the vase that grows) is worth
  more than a list of scenes. Look for the object that changes over the video.
- **Vary the structure** of each block: the same formula repeated gets boring by the
  third use.
- **Cuts on the music beat.** At 120 BPM, multiples of 0.5 s. Declare `bpm` in the scene
  and `review.mjs` will warn about cuts off the beat.
- **Nothing still for more than 1 s** except the ending: visual silence looks like a bug.
- **Every joke has to read** at normal speed and without explanation.
- **Short climax** (2–3 s). Six seconds of climax is tiring.
- **Stylize from reality:** before drawing a phenomenon or a gesture (steam, smoke, water,
  fire, cloth, a jump, a walk), look at a real reference (photo or video) and note the
  3–4 traits that make it recognizable. The style simplifies those traits, it doesn't
  invent them: otherwise you get the cliché (three-tentacle steam).
- **Several styles in one video** (exquisite corpse): a **through-line** that crosses
  every segment (an object that is always visible and the most saturated thing in the
  shot) and transitions that pass through it (skill **transitions**). Each segment a
  clearly different style, not the same one with other colors. If it can close as a
  loop, close it.
- For long pieces, cross 2–3 different script proposals and keep the best of each before
  animating.

## 3 · Style test (4–7 s)

A single shot, the most representative one, at final quality. This is where the look of
the characters and typography is locked: **what is approved here doesn't change later**
(the main character changed between the style test and the animatic and it had to be
undone). Run the
**review** loop and show it to the user before going on.

## 4 · Animatic

The whole structure with a timecode and shot-name label, unpolished. It is for judging
rhythm and comprehension. Iterate versions (v1, v2…) with **review**; record in
`review.md` what didn't work in each.

## 5 · Final

Polish, audio (skill **sound**), format versions if needed (vertical 9:16 recomposed, not
cropped). Render: `node engine/render.mjs <scene.js> --size 1920`.

**The level of detail is the job.** An animatic look (merged body parts, round hands,
plain ellipses, flat paper) is not a final, however good the timing. Before calling a
piece final, crop every element at full resolution and hold it to the style's detail bar
(paper-cutout: «Detail» in its skill). Budget for it: in a replica the detail pass took
several times longer than the animatic, and it is what the user judges first.

For big pieces, split the detail work: one file per object/prop with a small drawer
contract (`(g, x, y, s, t, part?)`), and give groups of objects to parallel agents with a
written brief; keep choreography and shared kits with the lead.

## How to organize a large scene

For more than one shot, the scene declares `shots: [[start, end, 'Name'], …]` and `draw`
dispatches with `Motion.shotAt(shots, t)`. One function per shot (`shotX(g, t)`), shared
pieces (characters, props) in functions or in a separate file in the experiment folder,
loaded from `uses`.

## At the end of every work session

1. `review.md` up to date and the `sandbox/INDEX.md` row with status and main lesson.
2. Generalizable lessons moved up to their skill (see **review**).
3. Commit with the experiment and the skills touched. Videos and frames (`out/`) are not
   committed; the contact sheet (`review/sheet.jpg`) is, it is the visual history.
