// Crea un experimento nuevo en sandbox/ a partir de la plantilla de un estilo.
//
//   node engine/new.mjs <nombre> [--style papel-recortado] [--aspect 16:9|9:16|1:1|4:5] [--duration 6]
//
// Deja sandbox/AAAA-MM-DD-<nombre>/ con brief.md, scene.js y review.md, y lo apunta en
// sandbox/INDEX.md.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, parseArgs } from './browser.mjs';

const { pos, opt } = parseArgs(process.argv.slice(2));
const slug = (pos[0] ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const style = opt.style ?? 'papel-recortado';
const styles = fs.readdirSync(path.join(ROOT, 'styles')).filter((d) => fs.existsSync(path.join(ROOT, 'styles', d, 'template.js')));
if (!slug || !styles.includes(style)) {
    console.error(`Uso: node engine/new.mjs <nombre> [--style ${styles.join('|')}] [--aspect 16:9] [--duration 6]`);
    process.exit(1);
}
const ASPECTS = { '16:9': [1600, 900], '9:16': [900, 1600], '1:1': [1000, 1000], '4:5': [1000, 1250] };
const logical = ASPECTS[opt.aspect ?? '16:9'];
if (!logical) {
    console.error('Aspecto no válido: ' + Object.keys(ASPECTS).join(', '));
    process.exit(1);
}
const date = new Date().toISOString().slice(0, 10);
const name = `${date}-${slug}`;
const dir = path.join(ROOT, 'sandbox', name);
if (fs.existsSync(dir)) {
    console.error('Ya existe ' + dir);
    process.exit(1);
}
fs.mkdirSync(dir, { recursive: true });

let tpl = fs.readFileSync(path.join(ROOT, 'styles', style, 'template.js'), 'utf8');
tpl = tpl.replace(/^\/\/.*\n(\/\/.*\n)*/, `// ${name} · estilo ${style}\n`).replace(/logical: \[[^\]]*\]/, `logical: [${logical.join(', ')}]`);
if (opt.duration) tpl = tpl.replace(/duration: [\d.]+/, `duration: ${Number(opt.duration)}`);
fs.writeFileSync(path.join(dir, 'scene.js'), tpl);

fs.writeFileSync(path.join(dir, 'brief.md'), `# ${slug}

- **Estilo:** ${style}
- **Formato:** ${opt.aspect ?? '16:9'} · ${opt.duration ?? '?'} s · 24 fps
- **Para qué / para quién:**
- **Idea en una frase:**
- **Referencias:**
- **Texto en pantalla (literal):**
- **Música / ritmo:**
- **Lo que NO debe pasar:**

## Plano a plano

| Tiempo | Plano | Qué pasa |
|---|---|---|
| 0–? | | |
`);

fs.writeFileSync(path.join(dir, 'review.md'), `# Revisiones · ${slug}

Cada ronda: qué se vio (auto y a ojo), qué se cambió y qué lección sale. Las lecciones
que valen para otros vídeos se suben a la skill correspondiente (ver revisar/SKILL.md).

## Ronda 1
`);

const index = path.join(ROOT, 'sandbox', 'INDEX.md');
if (!fs.existsSync(index)) fs.writeFileSync(index, '# Experimentos\n\n| Fecha | Experimento | Estilo | Estado | Lección principal |\n|---|---|---|---|---|\n');
fs.appendFileSync(index, `| ${date} | [${slug}](${name}/) | ${style} | en curso | |\n`);

console.log(`sandbox/${name}/
  brief.md   ← rellénalo primero
  scene.js   ← la animación
  review.md  ← el diario de revisiones

Vista previa:  npm run preview   →  http://127.0.0.1:5173
Revisión:      node engine/review.mjs sandbox/${name}/scene.js
Render:        node engine/render.mjs sandbox/${name}/scene.js`);
