# illomotion

Sandbox for generating animations and videos **with code** and Claude, so that every test
improves the skills that generate them. The repo (code, comments, docs, skills, commit
messages) is in English; conversation with the user may be in Spanish. On-screen text
inside videos is creative content and stays in whatever language the video needs.

## Map

| Path | What it is |
|---|---|
| `.claude/skills/animate/` | **Start here** for any video: the process from brief to MP4 |
| `.claude/skills/engine/` | Scene contract, determinism, commands |
| `.claude/skills/review/` | Automatic critique + feedback loop, and how lessons are distilled |
| `.claude/skills/sound/` | Music, sound effects, mixing |
| `.claude/skills/style-*/` | One skill per visual style |
| `.claude/skills/new-style/` | How to add a style |
| `.claude/skills/transitions/` | Transitions between shots and between styles (`engine/transitions.js`) |
| `.claude/skills/replicate/` | Copying a reference video 1:1: measure, per-drawing tables, element by element, parallel agents |
| `engine/` | Engine: `player.html`, `core.js`, `render.mjs`, `review.mjs`, `reference.mjs`, `tempo.mjs`, `new.mjs`, `mix.mjs`, `strip.mjs`, `serve.mjs` |
| `styles/<style>/` | Drawing kit, `template.js`, `README.md` and `strip.jpg` for each style |
| `sandbox/` | One experiment per folder (`YYYY-MM-DD-name/`), indexed in `INDEX.md` |
| `assets/sfx/`, `fonts/` | Freely licensed sound effects and fonts |

## Commands

```bash
sh engine/setup.sh                                  # dependencies + ffmpeg (the hook does it)
node engine/new.mjs <name> --style paper-cutout --aspect 16:9 --duration 6
npm run preview                                     # http://127.0.0.1:5173
node engine/review.mjs sandbox/<exp>/scene.js       # automatic review + contact sheet
node engine/render.mjs sandbox/<exp>/scene.js --at 1,2.5   # stills
node engine/render.mjs sandbox/<exp>/scene.js --size 1920  # MP4
node engine/reference.mjs compare sandbox/<exp>/scene.js ref.mp4 --times 2,4 --crop 0.3,0.2,0.4,0.4
```

## The loop (mandatory)

1. Never sign off on an animation without rendering it and **looking** at frames (Read on
   `review/sheet.jpg` and `out/stills/*.png`).
2. After every render: skill **review** (automatic critique, up to 3 rounds) before
   showing it to the user.
3. With the user's feedback: fix and **distill** whatever generalizes into the relevant
   skill (style, animate, engine, sound) or fix the engine.
4. One commit per round: `review(<experiment>): round N · <lesson>`, experiment and skills
   together.

## The detail bar

Detail is the job, not a polish step. Every element is its own set of pieces with organic
shapes, textures that say what it is made of and real hands; crop it at full resolution
before calling it done (style skill → «Detail»). Positions, sizes, colours and timing come
from measurements (`engine/reference.mjs`, skill **replicate**), never from guesses.

## Conventions

- Deterministic scenes: no `Math.random`, `Date` or state carried between frames.
- Committed: code, `brief.md`, `review.md`, `review/sheet.jpg`, `review/auto.md`, `audio.json`,
  and the latest render in `render/<name>.mp4` (re-encoded `-crf 26`, one file per
  experiment, overwritten each round) with its `render/strip.jpg` (`engine/strip.mjs`), which
  the README's gallery shows. Not committed: `out/` (full-quality MP4s, frames),
  `.wav`, keys, and third-party footage or audio (a reference video, a comparison with its
  frames, a render carrying the reference's soundtrack: commit it with `-an`).
- Code, comments and docs in English, like the rest of the repo.
- If you change `engine/`, run `review.mjs` on `styles/*/template.js` and on the latest
  experiment to check nothing broke.
