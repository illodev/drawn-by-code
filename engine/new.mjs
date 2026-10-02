// Creates a new experiment in sandbox/ from a style's template.
//
//   node engine/new.mjs <name> [--style paper-cutout] [--aspect 16:9|9:16|1:1|4:5] [--duration 6]
//   node engine/new.mjs <name> --in ../client/marketing/pieces   → in an external root
//
// Creates sandbox/YYYY-MM-DD-<name>/ with brief.md, scene.js and review.md, and logs it in
// sandbox/INDEX.md. With --in, the same inside that folder (and its INDEX.md), which must sit
// under an external root (a folder with a drawn-by-code.json, see browser.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, parseArgs, extRoot, EXT_MARK } from './browser.mjs';

const { pos, opt } = parseArgs(process.argv.slice(2));
const slug = (pos[0] ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const style = opt.style ?? 'paper-cutout';
const styles = fs.readdirSync(path.join(ROOT, 'styles')).filter((d) => fs.existsSync(path.join(ROOT, 'styles', d, 'template.js')));
if (!slug || !styles.includes(style)) {
    console.error(`Usage: node engine/new.mjs <name> [--style ${styles.join('|')}] [--aspect 16:9] [--duration 6]`);
    process.exit(1);
}
const ASPECTS = { '16:9': [1600, 900], '9:16': [900, 1600], '1:1': [1000, 1000], '4:5': [1000, 1250] };
const logical = ASPECTS[opt.aspect ?? '16:9'];
if (!logical) {
    console.error('Invalid aspect: ' + Object.keys(ASPECTS).join(', '));
    process.exit(1);
}
const base = opt.in ? path.resolve(opt.in) : path.join(ROOT, 'sandbox');
if (opt.in && !extRoot(base)) {
    console.error(`--in must be under an external root (a folder with a ${EXT_MARK}): ${opt.in}`);
    process.exit(1);
}
const date = new Date().toISOString().slice(0, 10);
const name = `${date}-${slug}`;
const dir = path.join(base, name);
if (fs.existsSync(dir)) {
    console.error('Already exists: ' + dir);
    process.exit(1);
}
fs.mkdirSync(dir, { recursive: true });

let tpl = fs.readFileSync(path.join(ROOT, 'styles', style, 'template.js'), 'utf8');
tpl = tpl.replace(/^\/\/.*\n(\/\/.*\n)*/, `// ${name} · style ${style}\n`).replace(/logical: \[[^\]]*\]/, `logical: [${logical.join(', ')}]`);
if (opt.duration) tpl = tpl.replace(/duration: [\d.]+/, `duration: ${Number(opt.duration)}`);
fs.writeFileSync(path.join(dir, 'scene.js'), tpl);

fs.writeFileSync(path.join(dir, 'brief.md'), `# ${slug}

- **Style:** ${style}
- **Format:** ${opt.aspect ?? '16:9'} · ${opt.duration ?? '?'} s · 24 fps
- **Purpose / audience:**
- **One-line idea:**
- **References:**
- **On-screen text (literal):**
- **Music / rhythm:**
- **Must NOT happen:**

## Shot list

| Time | Shot | What happens |
|---|---|---|
| 0–? | | |
`);

fs.writeFileSync(path.join(dir, 'review.md'), `# Reviews · ${slug}

Each round: what was seen (automatic and by eye), what was changed and what lesson comes out.
Lessons that apply to other videos go up to the matching skill (see review/SKILL.md).

## Round 1
`);

const index = path.join(base, 'INDEX.md');
if (!fs.existsSync(index)) fs.writeFileSync(index, '# Experiments\n\n| Date | Experiment | Style | Status | Main lesson |\n|---|---|---|---|---|\n');
fs.appendFileSync(index, `| ${date} | [${slug}](${name}/) | ${style} | in progress | |\n`);

// Commands as they run from the current folder (the absolute path when it is shorter).
const here = (p) => {
    const r = path.relative(process.cwd(), p) || '.';
    return (r.length <= p.length ? r : p).split(path.sep).join('/');
};
const scene = here(path.join(dir, 'scene.js')), engine = here(path.join(ROOT, 'engine'));
console.log(`${here(dir)}/
  brief.md   ← fill this in first
  scene.js   ← the animation
  review.md  ← the review log

Preview:  node ${engine}/serve.mjs${opt.in ? ' --ext ' + here(extRoot(base)) : ''}   →  http://127.0.0.1:5173
Review:   node ${engine}/review.mjs ${scene}
Render:   node ${engine}/render.mjs ${scene}`);
