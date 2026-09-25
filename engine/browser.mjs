// Static server + headless Chromium to open a scene in engine/player.html.
// Used by render.mjs, review.mjs and serve.mjs.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TYPES = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json', '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff2': 'font/woff2', '.png': 'image/png',
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.md': 'text/plain; charset=utf-8',
};

export function serve(port = 0, extra = null) {
    const server = http.createServer((req, res) => {
        const url = new URL(req.url, 'http://x');
        if (url.pathname === '/favicon.ico') return res.writeHead(204), res.end();
        if (extra && extra(url, res)) return;
        const file = path.join(ROOT, decodeURIComponent(url.pathname));
        if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
            // an optional script (a private, uncommitted file) that is absent: an empty script,
            // not a 404, so renders stay free of console errors
            if (url.searchParams.has('optional') && file.endsWith('.js')) { res.writeHead(200, { 'Content-Type': TYPES['.js'] }); return res.end('/* optional file absent */'); }
            res.writeHead(404);
            return res.end('not found');
        }
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
        fs.createReadStream(file).pipe(res);
    });
    return new Promise((ok) => server.listen(port, '127.0.0.1', () => ok({ server, port: server.address().port })));
}

export function findChrome() {
    if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
    const candidates = [];
    const pw = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
    if (fs.existsSync(pw)) {
        for (const d of fs.readdirSync(pw).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse()) {
            candidates.push(path.join(pw, d, 'chrome-linux', 'chrome'), path.join(pw, d, 'chrome-linux64', 'chrome'));
        }
    }
    candidates.push(
        '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    );
    return candidates.find((p) => fs.existsSync(p)) ?? null;
}

export function findFfmpeg() {
    if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
    const r = spawnSync('ffmpeg', ['-version']);
    return r.status === 0 ? 'ffmpeg' : null;
}

// Relative to the repo root, with forward slashes.
export const rel = (p) => path.relative(ROOT, path.resolve(p)).split(path.sep).join('/');

export async function openScene(scenePath, { size } = {}) {
    let chromium;
    try {
        ({ chromium } = await import('playwright-core'));
    } catch {
        throw new Error('Missing playwright-core: run `npm install` at the repo root.');
    }
    const executablePath = findChrome();
    if (!executablePath) throw new Error('Chrome/Chromium not found: set its path with CHROME_PATH=/path/to/chrome');
    const { server, port } = await serve();
    const browser = await chromium.launch({ executablePath, args: ['--disable-gpu', '--font-render-hinting=none'] });
    const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
    const errors = [];
    page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
        console.log('[page]', m.text());
    });
    page.on('pageerror', (e) => {
        errors.push(e.message);
        console.error('[page error]', e.message);
    });
    const q = new URLSearchParams({ scene: rel(scenePath), render: '1' });
    if (size) q.set('size', String(size));
    await page.goto(`http://127.0.0.1:${port}/engine/player.html?${q}`);
    try {
        await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
    } catch (e) {
        const msg = await page.evaluate(() => document.getElementById('err')?.textContent).catch(() => '');
        await browser.close();
        server.close();
        throw new Error('The scene never reached READY.\n' + (msg || errors.join('\n') || e.message));
    }
    const info = await page.evaluate(() => window.SCENE_INFO);
    return {
        page, info, errors,
        close: async () => {
            await browser.close();
            server.close();
        },
    };
}

// Arguments: --key value and --flag.
export function parseArgs(argv, flags = []) {
    const pos = [], opt = {};
    for (let i = 0; i < argv.length; i++) {
        if (!argv[i].startsWith('--')) pos.push(argv[i]);
        else {
            const k = argv[i].slice(2);
            if (flags.includes(k)) opt[k] = true;
            else opt[k] = argv[++i];
        }
    }
    return { pos, opt };
}
