---
name: replicate
description: How to replicate a reference video 1:1 (or study a style from one) with the drawn-by-code engine, measuring instead of guessing, element by element, until the difference only shows when zooming in. Use it whenever the user gives a video to copy, recreate, match or "make it like this", when working on sandbox/2026-09-24-what-do-you-love, or when a piece has to reach the detail level of a finished film. Covers the workflow, the measuring tools in engine/reference.mjs, per-drawing choreography, recipes, pitfalls with their fixes, and splitting the work across parallel agents.
---

# Replicate a reference video

**Credit the original.** A replica is a study of someone else's work: name the author and
link the original in the experiment's `brief.md`, in `sandbox/INDEX.md` and wherever the
replica is shown (the README's gallery). Keep the reference video and its soundtrack out of
git (`out/`), and commit the replica's render without the original's audio (`-an`).

Worked example: `sandbox/2026-09-24-what-do-you-love/`, a replica of [a video by Kevin Ngo](https://x.com/kevin_t_ngo/status/2102437977435893771)
([@kevin_t_ngo](https://x.com/kevin_t_ngo)) (a 28 s paper-cutout film, 2160²,
24 fps, animated on twos). Its whole-video difference went 29 → 22.6 (animatic) → 14.2
(detail pass), and the user's verdict was «I have to zoom in to see differences». Its
`review.md` tells the story round by round; `segments/README.md` explains how it is built.

**Transcribing is copying.** A tool that reads an artist's pixels (or vectors, or frames) off
the reference and replays them is a copy of their art, not a drawing by code: keep that
data in the experiment's `private/` (gitignored), never commit or publish it, and say so in
the brief. What goes in the repo is the kit, the tools and the lessons (pixel-building).

Rights: a replica of someone else's film is an **internal study**. The reference video and
its audio stay in the experiment's `out/` (gitignored), never in the repo, and the result
is never published as ours.

## The four principles

1. **Detail is the job.** Timing and palette give you an animatic. The user judges the craft
   of every element at a glance: a dog made of five ellipses, round hands, a ring drawn as
   one stroke or polygonal shapes read as low effort next to a reference built piece by
   piece. Hold every element to the style's detail bar (paper-cutout: «Detail» in
   **style-paper-cutout**).
2. **Measure, never eyeball.** Positions, sizes, colours, timing, speed: every number in the
   scene comes from a probe on the reference (below). Eyeballed values were wrong by
   15–50 % every single time (the flower 17 % small, the girl 47 units too high, the
   writing too slow, the '?' off the page).
3. **Work per drawing.** Hand animation changes drawing every 2 frames (1/12 s) and holds.
   Author motion as tables with **one row per drawing** (`d = Math.floor((t - t0) * 12 +
   1e-6)`), not as smooth curves; ease curves look wrong next to a film animated on twos.
4. **One element per file, compared at full resolution.** Every object is its own file with
   a small drawer contract; each is crop-compared against the reference until the same
   pieces, shapes, colours, textures and layering show side by side.

## Workflow

0. **Set up.** Reference in `<exp>/out/reference.mp4`; its audio extracted to
   `out/reference-audio.wav` and used as `audio: { mix: 'out/reference-audio.wav' }` so the
   renders are judged with the real timing. Logical space = the frame (`logical: [1000,
   1000]` for a square video: 1 unit = 2.16 px at 2160, and fractions × 1000 = units).
1. **Shot list.** `reference.mjs sheets --every 0.25` to read the film, `reference.mjs cuts`
   for the exact cut frames (cuts land on frames). Declare every cut, even 0.25 s cards, as
   a shot in `shots` (review.mjs then stops reporting them as jumps).
2. **Palette.** `reference.mjs colors <video> <s> name=x,y …` for every colour, never
   guessed.
3. **Animatic** of the whole film first (structure, timing, rough shapes), compared with
   `compare --every 0.5`. Then the detail pass, element by element (most of the time goes
   here: in the example the detail pass took several times longer than the animatic).
4. **Measure each element.** Full-resolution crops with a grid
   (`ffmpeg -ss T -i ref.mp4 -frames:v 1 -vf "crop=W:H:X:Y,scale=…,drawgrid=w=50:h=50:t=1:c=black@0.25"`),
   a strip of one shot's drawings (`-vf "select='not(mod(n\,2))',scale=400:400,tile=6x1"`),
   `box` for where a colour sits, `runs` for edges and bands, `track`/`face` for motion.
5. **Build** the element in its own file, authored in measured coordinates (reference
   pixels or logical units around an anchor), so that it lands 1:1 with scale 1.
6. **Calibrate against your own render.** Render the stretch small
   (`render.mjs --from a --to b --size 500 --out x.mp4`) and run *the same probe* on it.
   Compare the two tables and correct factors (our flower's horizontal reach turned out to
   be 0.92 R, not 1.07 R as assumed).
7. **Crop-compare** (`compare --times … --crop x,y,w,h`, fractions) until the side by side
   matches; then the whole video (`compare --every 1`) for the number. The number helps;
   your eyes decide. Look at every image you produce.
8. **Log the round** in `review.md` (what the user said verbatim, what was measured, what
   changed, the new number) and move the lessons into the skills.

## Measuring tools (`engine/reference.mjs`)

| Command | What it answers |
|---|---|
| `sheets <video> --every 0.25` | the film at a glance, labelled with seconds and frames |
| `cuts <video>` | exact cut frames |
| `colors <video> <s> name=x,y …` | the palette (5×5 px mean at fractions of the frame) |
| `box <video\|png> <s> --color #hex --region x0,y0,x1,y1` | where a colour sits (2–98 % box, logical units): hair, ink of a text, a prop. Run it on your still too |
| `runs <video\|png> <s> --row 0.6` (or `--col`) | colour runs along a line: paper edges, margins, sky bands, ruled lines |
| `track <video> --color #hex --from --to [--crop]` | per frame: centre, box, area of a colour. The motion of a character (bounce, squash, reach) |
| `face <video> --body #hex --from --to` | per drawing: centroid of the dark marks inside the body colour = where the face is, even when the limbs change |
| `compare <scene> <video> --times … [--crop] [--every]` | side by side with a difference number per pair |

Throwaway probes are fine for one-off questions (a text's ink box, a column scan); when one
proves useful twice, add it here.

## Recipes that worked

- **A character's performance per drawing** (the flower in the montage): a table
  `[face x, face y, reach, vertical stretch, expression, face tilt]` per drawing from
  `track` + `face`, and a bounce pattern (big entry, squash, recover, stretch up, settle).
  Squash & stretch the *limbs/rays* only; the face never deforms. Expressions change with
  the drawing (open 'o' on the entry, squint on the squash, open laugh on the stretch).
- **Entry accents:** radial dashes only on a card's first drawing (colour, centre, radii and
  count measured per card); a 7–8 % bigger object on the first drawing only where the
  reference has it (measure; not every card pops).
- **Card words:** the word writes itself as a fast wipe (≈1.5 letters on the first drawing,
  whole by 0.16 s), width/tilt/baseline measured per card.
- **Objects the character sits inside** (letters flying out of a book, a boat, a cup): a
  back and a front layer with the character between them (`order: 'split'`).
- **Writing on paper:** the pen follows the text metrics (`penAt`: width of the written
  prefix + a fraction of the next letter), at the measured letters per second (keys per
  drawing), the forearm leaning from an off-screen elbow.
- **Paper actions** drawing by drawing: tearing along the perforation (square tabs, scraps
  flying up, the lifted page's shadow clipped to the pad, the next blank page under the
  rings), folding a plane (a table of five paper shapes with flaps and creases, mittens at
  the corners), turning a note over in perspective (`noteFlip` on `Motion.quad`; the
  front turns without the answer written on the back).
- **Lettering to match hand-lettering:** pick the closest free font, then measure: width of
  each line, x-height (squash with `sy`), line ratio (per-line letter spacing), stroke
  (felt-tip = a thinned core inside a lighter rim).
- **Miniatures** (the heart gathering every object): redrawn chunkier with fewer pieces, not
  just scaled; pop-in order measured per drawing.
- **The same character in several framings** (girl in the interior, small in the window,
  bigger when she leans in): one puppet with a scale and layers (`layer: 'body' | 'arms'`)
  so a desk can go between torso and forearms.

## Pitfalls met, and their fixes

| Symptom | Cause | Fix |
|---|---|---|
| The '?' ran off the page | the font's second line is relatively wider (1.27× vs 1.21×) | per-line letter spacing keeping the reference's line ratio (`WL.lineSpacings`) |
| Bold, flat text next to a felt-tip reference | `strokeText` over `fillText` only thickens | erode the glyph with a `destination-out` stroke on an offscreen canvas, inside a lighter rim; cache per scale (`getTransform()`) |
| Shaded pieces painted as brown blobs | `shade()` returned `hsla()`, `Paper.marker` parses hex | colour helpers return hex |
| The character sat 47 units too high in every interior | anchor guessed | `box` of the hair on the reference and on our still; move the anchor |
| The flower 17 % too small | reach vs radius assumed | calibrate by tracking our own render |
| Drawings one frame late | `ffmpeg -ss` rounding lands on the next frame | seek at `frame/24 − 0.004` |
| `track` catches other things | the colour is shared | tighter `--tol`, `--crop`, or a colour unique to the character |
| Rays looked like blobs when short | width kept constant | short rays slimmer too |
| A caught plane drawn over or under the whole flower | one layer | rays in an arc drawn over the plane, the face over everything |
| Waves / tentacles / steam «boiled» | outline re-torn every frame | 2–4 cached replacement drawings swapped on twos |
| A hole looked like a grey ring | a ring polygon filled | `PaperDetail.punch` (torn rim + `destination-out`) |
| Cup, band, tag bulged | `spline` overshoots between long and short segments | `cspline` (centripetal) or a torn polygon for straight paper |
| Blurry sprite | cached at low resolution | sprite `res` ≥ 1.1 × the largest scale it is drawn at |
| Knit screamed at small size | texture alpha tuned at full size | knit alpha 0.1–0.2 on small pieces |
| `review.mjs` flags flashes at 15–16 s | the reference's own 0.25 s colour cards | documented in review.md; a real piece would soften them |
| Subagent worktrees ended up in a commit | `git add -A` with `.claude/worktrees/` present | `.claude/worktrees/` in `.gitignore` |

## Splitting the work across agents

A replica has dozens of elements; parallel agents (Agent tool with `isolation: "worktree"`)
did four groups of montage objects and the exterior shots while the lead did the
choreography.

- **Contract first:** one file per element with a tiny drawer contract
  (`Things.x(g, x, y, s, t, part?)`), shared helpers in a kit file. Agents edit only their
  own files and their rows in the shared tables; the lead owns choreography, the character
  and common kits.
- **Brief:** copy `agent-brief.md` from this folder and fill it in: the user's words (why
  detail matters), setup (`ln -s <repo>/node_modules node_modules` in the worktree), the
  files and the contract, coordinates, tools, rules (deterministic, cut once, look at every
  image, commit but don't push) and the report format (values for the shared tables,
  remaining differences, helper candidates, one-line lessons).
- **Merge by file:** `git checkout <agent-branch> -- <their files>`, then copy their table
  values by hand and verify with `compare`. Never merge a shared file wholesale: their
  version is stale.
- **Harvest the reports:** agents found real lessons (layering by whose white border is on
  top, replacement drawings, two-strip rings, miniatures redrawn chunkier). Move them into
  the skills and promote their good helpers into the style kit (that is how `cspline`,
  `taper`, `curl`, `markerPath`, `punch`, `wordBars`, `sheetMusic` and `mapPaper` reached
  `PaperDetail`).

## Lessons

<!-- date · experiment · one line -->
- 2026-09-24 · what-do-you-love · Whole-frame comparisons hid the lack of craft; the user saw it at once. Crop every element at full resolution.
- 2026-09-24 · what-do-you-love · Pin a moving prop (a paper plane) by three measured points per drawing (an affine map): perspective and banking come for free, where position + angle + scale never matched.
- 2026-09-24 · what-do-you-love · Key a pose at a few drawings but correct the position every drawing with the tracked centre; straight lines between keys lose the arc.
- 2026-09-24 · what-do-you-love · Measure secondary motion before animating it: the head sway assumed for the girl in the window was a perfectly still head in the reference.
- 2026-09-24 · what-do-you-love · A growing dashed trail must anchor its dash pattern to the path's start, or the dashes crawl.
- 2026-09-24 · what-do-you-love · Check the drawing phase once (which frames start a drawing) with frame-to-frame differences decoded without seeking.
- 2026-09-24 · what-do-you-love · After the measured detail pass the user needed to zoom in to see differences; the one thing seen at a glance (the '?' off the page) came from a font metric nobody had measured. Measure text too.
