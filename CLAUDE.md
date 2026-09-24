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
| `engine/` | Engine: `player.html`, `core.js`, `render.mjs`, `review.mjs`, `new.mjs`, `mix.mjs`, `serve.mjs` |
| `styles/<style>/` | Drawing kit and `template.js` for each style |
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

## Conventions

- Deterministic scenes: no `Math.random`, `Date` or state carried between frames.
- Committed: code, `brief.md`, `review.md`, `review/sheet.jpg`, `review/auto.md`, `audio.json`.
  Not committed: `out/` (MP4s, frames), `.wav`, third-party music, keys.
- Code, comments and docs in English, like the rest of the repo.
- If you change `engine/`, run `review.mjs` on `styles/*/template.js` and on the latest
  experiment to check nothing broke.
