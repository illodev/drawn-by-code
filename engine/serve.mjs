// Browser preview: lists every scene in the repo and plays them.
//
//   npm run preview            → http://127.0.0.1:5173
//   PORT=8080 npm run preview
import fs from 'node:fs';
import path from 'node:path';
import { serve, ROOT, rel } from './browser.mjs';

function scenes(dir) {
    const out = [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'out') continue;
        const p = path.join(dir, e.name);
        if (e.isDirectory()) out.push(...scenes(p));
        else if (e.name === 'scene.js' || e.name === 'template.js') out.push(rel(p));
    }
    return out;
}

const port = Number(process.env.PORT ?? 5173);
await serve(port, (url, res) => {
    if (url.pathname !== '/') return false;
    const list = ['sandbox', 'styles'].flatMap((d) => (fs.existsSync(path.join(ROOT, d)) ? scenes(path.join(ROOT, d)) : [])).sort().reverse();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!doctype html><meta charset="utf-8"><title>drawn-by-code</title>
<style>body{font:15px system-ui;background:#100817;color:#e8dcef;max-width:760px;margin:40px auto;padding:0 16px}a{color:#f2a07c}li{margin:6px 0}</style>
<h1>drawn-by-code</h1><h2>Scenes</h2><ul>${list.map((s) => `<li><a href="/engine/player.html?scene=${encodeURIComponent(s)}">${s}</a></li>`).join('')}</ul>`);
    return true;
});
console.log(`drawn-by-code → http://127.0.0.1:${port}`);
