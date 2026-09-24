# Contributing

drawn-by-code wants to be a hub of animation styles made with code, and a record of how far
Claude can go as an animator. New styles, better styles, engine tools and sharper skills
are all welcome by pull request.

The easiest way to work is with [Claude Code](https://claude.com/claude-code) in this repo:
the skills in `.claude/skills/` already know the engine, the process and the review loop.
Ask it things like *"create a new risograph style"* or *"improve the hands in paper-cutout"*.

## Ground rules

- **Everything is drawn by code.** No generated images or video, no bitmap assets for what
  is on screen. Fonts must be freely licensed (OFL, with the licence in `fonts/`); sound
  effects must be free to use, with their source noted.
- **Deterministic.** A frame is a pure function of `t`: no `Math.random`, `Date` or state
  carried between frames (`Motion.rng(seed)` for randomness). `review.mjs` checks it.
- **Looked at, not assumed.** No style or change is done until it has been rendered and
  its frames looked at, cropped at full resolution. That is the detail bar (CLAUDE.md →
  «The detail bar»).
- **In English:** code, comments, skills, docs and commit messages. What is written inside
  a video is creative content in whatever language the video needs.
- **Public knowledge, not private material.** Share the how: skills, lessons, reviews.
  Never commit a client's source files (they go in an experiment's `private/`, which is
  gitignored), keys, or third-party footage and music.
- **Credit what you study.** A replica or a style study names and links the original
  author in its `brief.md`, in `sandbox/INDEX.md` and wherever it is shown.

## A new style

The `new-style` skill walks through it. A style is complete when it has:

1. `styles/<style>/<kit>.js`: the drawing helpers (a global with its own name).
2. `styles/<style>/template.js`: a few seconds showing the style in miniature, with no
   warnings from `node engine/review.mjs styles/<style>/template.js`.
3. `.claude/skills/style-<style>/SKILL.md`: code, rules, checklist and lessons. The
   rules and the checklist are what make two videos in the style look like the same hand.
4. A style test in `sandbox/<date>-<name>/` (`node engine/new.mjs <name> --style <style>`):
   `brief.md`, `scene.js`, `review.md` with its rounds, `review/sheet.jpg`, and the render
   in `render/<name>.mp4` with its `render/strip.jpg` (`node engine/strip.mjs`).
5. `styles/<style>/README.md` and `strip.jpg` (copy another style's README), a row in the
   README's style table and its strip, and a row in `sandbox/INDEX.md`.

A new style starts as **in testing**. It becomes **approved** when a video made with it
holds up to review and feedback.

## A better existing style

- Show the difference: before and after stills or strips of the same frame in the PR.
- Write the lesson into the style's skill (a rule, a checklist item or a line in
  «Lessons»), so the next video gets it for free.
- Run `review.mjs` on the style's template and on the experiments that use the style.

## The engine and the skills

- If you change `engine/`, run `review.mjs` on every `styles/*/template.js` and on the
  latest experiment: nothing may break.
- A new tool goes in `engine/`, with its usage in the header comment, the `engine` skill
  and `CLAUDE.md`'s map.
- A skill change keeps its voice: short rules, why they exist, the pitfall that taught them.

## Pull requests

Keep one idea per PR, include a strip or stills of the result, and fill in the checklist
in the PR template.
