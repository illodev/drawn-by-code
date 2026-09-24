---
name: new-style
description: Creates a new animation style in illomotion (code kit + template + skill + style test). Use it when the user asks for a look no style in styles/ covers (e.g. kinetic typography, flat/product motion graphics, UI mockups, pixel art, line/sketch, isometric 3D, whiteboard explainer, glitch, retro VHS) or says "try another style".
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
7. Add the style to the table in `README.md`.

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
