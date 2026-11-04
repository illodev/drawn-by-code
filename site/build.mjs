// Builds the site for GitHub Pages into _site/: the pages from site/, and next to them the
// parts of the repo the live scenes and the films need, at the same paths as in the repo.
// In the repo the site reaches those files through ../ (open site/index.html from a server
// at the repo root); in _site they sit beside the pages, so ../ becomes ./
//   node site/build.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, '_site');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const copy = (from, to = from) => {
    const src = path.join(ROOT, from), dst = path.join(OUT, to);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.cpSync(src, dst, {
        recursive: true,
        // render output, review sheets and anything private stay out
        filter: (p) => !/(^|\/)(out|review|private|node_modules)(\/|$)/.test(path.relative(ROOT, p)) && !p.endsWith('.mp4') || from.endsWith('.mp4'),
    });
};

// the pages, with their repo-root references pointed at ./
for (const f of fs.readdirSync(path.join(ROOT, 'site'))) {
    if (f === 'build.mjs') continue;
    const src = path.join(ROOT, 'site', f);
    if (/\.(html|css|js)$/.test(f)) {
        let s = fs.readFileSync(src, 'utf8');
        s = s.replace(/data-root="\.\.\/"/g, 'data-root="./"').replace(/url\('\.\.\/fonts\//g, "url('fonts/").replace(/(src|href)="\.\.\//g, '$1="./');
        fs.writeFileSync(path.join(OUT, f), s);
    } else copy(path.join('site', f), f);
}

// what the live scenes load
copy('engine/core.js');
copy('fonts');
copy('styles');
for (const f of ['sandbox/2026-09-24-readme-cover/scene.js', 'sandbox/2026-09-24-readme-cover/capture.js', 'sandbox/2026-09-24-clay3d-test/set.js']) copy(f);

// the films (the player and the hover previews read them from their experiment folders)
const films = fs.readFileSync(path.join(ROOT, 'site/site.js'), 'utf8').matchAll(/\['([a-z][\w-]*)', '(\d{4}-\d{2}-\d{2}-[\w-]+)'/g);
for (const [, id, dir] of films) copy(`sandbox/${dir}/render/${id}.mp4`);
// the rendered cover: the hero shows it while the live one loads, or if it cannot run
copy('sandbox/2026-09-24-readme-cover/render/readme-cover.mp4');

fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
const size = (d) => fs.readdirSync(d, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? size(path.join(d, e.name)) : fs.statSync(path.join(d, e.name)).size), 0);
console.log(`_site: ${(size(OUT) / 1e6).toFixed(1)} MB`);
