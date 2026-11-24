---
name: new-style
description: Creates a new animation style in drawn-by-code (code kit + template + skill + style test). Use it when the user asks for a look no style in styles/ covers (e.g. kinetic typography, flat/product motion graphics, UI mockups, pixel art, line/sketch, isometric 3D, whiteboard explainer, glitch, retro VHS) or says "try another style".
---

# New style

A style is three things kept together:

```
styles/<style>/
  <kit>.js        reusable drawing helpers (a global with its own name, e.g. Kinetic)
  template.js     a minimal working scene: engine/new.mjs copies it
.claude/skills/style-<style>/SKILL.md
```

## Steps

1. **Define the look in words** with the user, and with 2–3 references if they have
   them: palette (with hex), typeface(s), kind of motion (elastic, mechanical, organic),
   texture (clean, grain, paper), camera, what is forbidden. If they bring a video,
   extract a contact sheet with
   `ffmpeg -i ref.mp4 -vf "fps=1,scale=480:-1,tile=4x3" -frames:v 1 sheet.jpg` and look
   at it.
2. **Fonts:** only freely licensed (OFL), in `fonts/` together with their license.
3. **Kit:** start small, with what the test needs. Follow the **engine** rules
   (determinism, caching). If something is useful for every style, it goes in
   `engine/core.js`.
4. **template.js:** 3–4 s showing the style in miniature: background, one piece entering
   with its characteristic motion, a text. It must pass `review.mjs` without warnings.
5. **Skill:** copy the structure below. The *Rules* and the *Checklist* are what make two
   videos in the same style look like they come from the same hand.
6. **Style test** in `sandbox/` with `engine/new.mjs … --style <style>`, the **review**
   loop and the user's approval. Until then, the style is *in testing* (say so in the
   skill's description).
7. Add the style to the README cover's carousel: one line in `STYLES` in
   `sandbox/2026-09-24-readme-cover/scene.js` (label, folder, the second of its template to
   show, its kits) and the fonts its template asks for in the cover's `fonts`, then re-render
   the cover (see that folder's review.md). The cover loads every template as a plain script
   into one page, so a template's top-level names must be its own (`const SPECIMEN_GLSL`, not
   a second `const TPL_GLSL`: the second one stops the page). Add the style to the table in `README.md`, and give its folder a `README.md` and a
   `strip.jpg` (`engine/strip.mjs` on the style test's render; copy another style's README).
8. Add the style to the site: one line in `STYLES` in `site/site.js` (folder, name, its look in
   a sentence, `'square'` or `'wide'`, 1 if it is raymarched in WebGL) and its still,
   `site/media/styles/<style>.jpg`: a frame of the template at 640×480 (the centre 4:3 of a
   `node engine/render.mjs styles/<style>/template.js --at <s> --size 960` still).

## Skill template

```markdown
---
name: style-<style>
description: <Name> style: <how it looks in one sentence>. Use it when asked for <kinds of video / keywords> or when working with styles/<style>/.
---

# Style · <Name>

Approved reference: sandbox/<experiment>/ (review/sheet.jpg)

## Code
<what the kit offers and how to use it>

## Style rules
<palette, typography, motion, camera, texture, forbidden>

## Style checklist
- [ ] …

## Lessons
```

## Lessons

- 2026-11-14 · pier-pressure · A character style is its construction before its finish: with the reference's line weight and palette exact, a figure with the wrong build (clothes as narrow as the neck, limbs of even width, generic heads, inner lines thinner than the contour) still read as a template. Measure the build on the reference (widths against the head, lengths against the height, line weight inside and outside) and put those numbers in the kit's defaults.
- 2026-11-14 · pier-pressure · A style after a show is the show's drawing manner only: design an original cast and place (names, silhouettes, outfits, town) with the user before drawing, and keep the reference frames out of the repo.
- 2026-11-14 · pier-pressure round 8 · A character style cannot be designed blind in code: five rounds of authored coordinates went from «the difference in the level of quality» to «it looks like a child drew it» without reaching a draughtsman's polish. For characters, get the design first (the user's drawings, or concept art generated and approved by the user) and replicate it by measurement, as the **replicate** skill does for films; ask for that reference at the first rejection of a character, not the fifth. And «natural» lines are steady and even: never answer «artificial» with wobble, uneven pressure or crossed corners.
- 2026-11-17 · micrograph-test · Write the template after the style test, from the test's own helpers: written beside it from memory, it drew spikes as clubs on sticks, the first thing the test had removed. What the test learned to draw goes into the kit (here `lumps`), and the template calls it.
- 2026-11-17 · micrograph-test · Before designing a kit's pipeline, measure on the references how the texture relates to the colour (here: grain only in luminance, channels following the tint): it told which model was the real one (a grey signal tinted afterwards) and three different stills came out of the same kit.
- 2026-11-17 · style search · «I haven't given you permission to use ElevenLabs»: asked to look for serious, solid styles, the first answer was a board of eight images generated on the user's ElevenLabs account, unasked. A search for a style starts in words: candidates named after real, findable references (a printmaker, a poster school, an atlas), what each is for, how the engine would build it. Generated images, like any paid service, wait for the user's go-ahead in that conversation; having the connector attached, or having used it in an earlier experiment, is not that go-ahead.
- 2026-11-19 · souvenir-test · A style's first picture can be painted in parallel as soon as the kit's manners work and ONE element is at the bar as a model: five agents, one file and one global each, from one brief (the manner in six points, the palette, the contract, the three crops of the reference to hold their work against, «do not use git») plus a task that gives each thing's real anatomy, its size in units and its anchor. All five came back at the bar in about 40 minutes; what the lead keeps is the camera, the composition and the picture nobody else can see whole.
- 2026-11-19 · souvenir-test · A reference that is another studio's film gives the manner, never the subject: ask the user what world theirs paints before drawing anything (the answer here, Andalusia with deep references, decided every element), and write the script's references down as «read at once / the deep one» so the debate is about content, not about paint.
- 2026-11-19 · souvenir-test round 2 · «Packed with details» is a second parallel pass, and it wants a different brief from the first: a density bar that can be counted (eight drawn things in any 300 × 300 px, drawing still there at 4×, repetition is not detail), the finished elements of the first pass named as models, «write the anatomy and ten true details of the real thing at the top of your file before painting», and a report that lists what was painted from memory. Eleven agents (two rewriting the lead's own weakest pieces, nine painting new things) came back at the bar in about an hour; the lead's job in that hour is the paint itself (a pass over every layer), the layout slots, and afterwards one pass for overlaps and for anything lying on what must be read.
- 2026-11-24 · run-away-with-me · Cast sheets asked from `gpt-image-2.5-sunburst` at 2K (16:9, high: 275 credits each) on «one flat pure green colour (#00FF00) everywhere» came back as PNGs with a transparent ground (alpha ~253 inside the figures, 0 outside): no keying at all. Measure each figure's box from the alpha (`cast/couple.js` in that experiment), cut the views a shot needs once into small canvases, and light them in the film (tint into the night, thin rims on the picture only): the drawing stays the sheet's and the light is the style's.
