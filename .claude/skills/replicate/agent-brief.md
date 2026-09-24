# Brief for an element agent (template)

Copy this file into your scratchpad, replace every `<…>`, and pass its path to the agent
(Agent tool, `isolation: "worktree"`). Keep the «Why» in the user's own words.

---

You are rebuilding `<elements>` of a 1:1 replica of a `<duration>` s `<style>` reference
video (`<size>`, 24 fps, animated on twos). The repo is `drawn-by-code`: animations drawn with
deterministic canvas-2D code, rendered with Playwright + ffmpeg. Everything in the repo
(code, comments) is in ENGLISH. The replica is for internal study only.

## Why (the user's words, translated)

<quote the user's feedback about detail, e.g. «every element has to go to detail»>. Detail
is the whole point of this job. Match the reference piece by piece: every sub-part its own
piece of paper, organic shapes, the reference's textures, exact colours, proportions and
layering, and the element's own secondary motion.

## Setup (you are in a git worktree)

```bash
ln -s <repo>/node_modules node_modules      # the worktree has none
REF=<repo>/<exp>/out/reference.mp4
S=<exp>
```

Never commit or copy reference frames or video into the repo. Scratch images go in
`<scratchpad>/agents/<your-name>/`.

## Files

- `<kit file>`: the contract and shared helpers (<describe>).
- `<your files>`: ONE FILE PER ELEMENT. This is what you edit.
- `<model file>`: the model to follow (measured piece by piece).
- `<shared table file>`: you may edit ONLY your rows (<which>). The lead is editing
  <what> in parallel: ignore it, do not touch <files>.
- Kits: `styles/<style>/paper.js`, `styles/<style>/detail.js` (see the style skill).

## Coordinates

<logical space = frame; units; how to author (reference pixels around an anchor, or logical
units) so that scale 1 lands 1:1>.

## Tools (run from the worktree root)

```bash
node engine/reference.mjs colors $REF <s> name=x,y …
node engine/reference.mjs box $REF <s> --color '#hex' --region x0,y0,x1,y1
node engine/reference.mjs runs $REF <s> --row 0.6
node engine/reference.mjs track $REF --color '#hex' --from a --to b
node engine/reference.mjs compare $S/scene.js $REF --times a,b --crop x,y,w,h --cell 700 --out <scratch>/cmp.jpg
ffmpeg -v error -y -ss <s> -i $REF -frames:v 1 -vf "crop=W:H:X:Y,scale=1000:-2,drawgrid=w=50:h=50:t=1:c=black@0.25" crop.png
ffmpeg -v error -y -ss <s> -t 0.5 -i $REF -vf "select='not(mod(n\,2))',scale=400:400,tile=6x1" -frames:v 1 strip.png
```

LOOK at every image you produce (Read tool). Loop: measure → build → crop-compare at full
resolution → fix → compare again, until the side by side shows the same pieces, shapes,
colours, textures and layering. Whatever moves in the reference moves the same way, per
drawing, in sync.

## Rules

- Deterministic: no `Math.random`, no `Date`, no state between frames.
- Nothing boils: every torn piece is cut ONCE inside a cached sprite and only moved,
  rotated or scaled. Where the reference redraws, use 2–4 cached replacement drawings.
- Keep drawers scale-agnostic if the element also appears in miniature.
- Commit in your worktree branch (`review(<exp>): round N · <elements> to detail`). Do not
  push.

## Report (final message, concise)

1. Branch, worktree path, files changed.
2. Per element: the values for the shared tables, the pieces / textures / motion built, the
   final crop-compare verdict (what still differs).
3. Changes you need in files you don't own (as a patch path, not applied).
4. Helpers worth promoting to the style kit, and one-line generalisable lessons.
