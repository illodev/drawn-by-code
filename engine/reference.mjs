// Tools for working against a reference video (replicas, style studies).
//
//   node engine/reference.mjs sheets <video> [--every 0.25] [--from 0] [--to end] [--cols 7] [--cell 360] [--out dir]
//       Contact sheets labelled with each frame's second → <out>/sheet-N.jpg
//
//   node engine/reference.mjs compare <scene.js> <video> [--times 1,2.5 | --every 1] [--cell 480] [--out f.jpg]
//       Reference (left) and scene (right) at the same instants, with the mean color
//       difference of each pair (0 = identical, ~30 = similar, >60 = something else).
//       Default → <scene>/review/compare.jpg and compare.md
//
// No ffmpeg drawtext: the labels are painted in Chromium.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { openScene, findFfmpeg, findChrome, parseArgs, rel } from './browser.mjs';

const [cmd, ...rest] = process.argv.slice(2);
const { pos, opt } = parseArgs(rest);
const ffmpeg = findFfmpeg();
if (!ffmpeg) throw new Error('Missing ffmpeg');

function duration(video) {
    const r = spawnSync(ffmpeg, ['-i', video], { encoding: 'utf8' });
    const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(r.stderr);
    return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : 0;
}
// One frame of the reference at `t`, as a JPEG data URL `w` px wide.
function refFrame(video, t, w) {
    const r = spawnSync(ffmpeg, ['-v', 'error', '-ss', String(t), '-i', video, '-frames:v', '1', '-vf', `scale=${w}:-2`, '-f', 'image2pipe', '-c:v', 'mjpeg', '-q:v', '3', '-'], { maxBuffer: 1 << 26 });
    if (r.status !== 0 || !r.stdout.length) return null;
    return 'data:image/jpeg;base64,' + r.stdout.toString('base64');
}

// Lays out cells [{ img, label, sub }] in a grid inside Chromium.
async function compose(page, cells, cols, cellW, out) {
    const b64 = await page.evaluate(async ({ cells, cols, cellW }) => {
        const load = (src) => new Promise((ok) => {
            const im = new Image();
            im.onload = () => ok(im);
            im.onerror = () => ok(null);
            im.src = src;
        });
        const imgs = await Promise.all(cells.map((c) => (c.img ? load(c.img) : null)));
        const first = imgs.find(Boolean);
        const cellH = first ? Math.round((cellW * first.height) / first.width) : cellW;
        const lab = 28, rows = Math.ceil(cells.length / cols);
        const s = document.createElement('canvas');
        s.width = cols * cellW;
        s.height = rows * (cellH + lab);
        const g = s.getContext('2d');
        g.fillStyle = '#100817';
        g.fillRect(0, 0, s.width, s.height);
        cells.forEach((c, n) => {
            const x = (n % cols) * cellW, y = Math.floor(n / cols) * (cellH + lab);
            if (imgs[n]) g.drawImage(imgs[n], x, y + lab, cellW, cellH);
            g.fillStyle = c.color ?? '#e8dcef';
            g.font = '16px ui-monospace, monospace';
            g.fillText(c.label, x + 6, y + 19);
            g.strokeStyle = '#100817';
            g.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH + lab - 1);
        });
        return s.toDataURL('image/jpeg', 0.85).split(',')[1];
    }, { cells, cols, cellW });
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, Buffer.from(b64, 'base64'));
}

// Mean color difference between two images (scaled down to 64 px), in the page.
async function diff(page, a, b) {
    return page.evaluate(async ({ a, b }) => {
        const load = (src) => new Promise((ok) => {
            const im = new Image();
            im.onload = () => ok(im);
            im.src = src;
        });
        const [ia, ib] = await Promise.all([load(a), load(b)]);
        const W = 64, H = Math.round((64 * ia.height) / ia.width);
        const px = (im) => {
            const c = document.createElement('canvas');
            c.width = W;
            c.height = H;
            const g = c.getContext('2d');
            g.drawImage(im, 0, 0, W, H);
            return g.getImageData(0, 0, W, H).data;
        };
        const da = px(ia), db = px(ib);
        let s = 0;
        for (let i = 0; i < da.length; i += 4) s += (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2])) / 3;
        return s / (da.length / 4);
    }, { a, b });
}

async function blankPage() {
    const { chromium } = await import('playwright-core');
    const browser = await chromium.launch({ executablePath: findChrome(), args: ['--disable-gpu'] });
    const page = await browser.newPage();
    return { page, close: () => browser.close() };
}

if (cmd === 'sheets') {
    const video = pos[0];
    const every = Number(opt.every ?? 0.25), cols = Number(opt.cols ?? 7), cell = Number(opt.cell ?? 360);
    const from = Number(opt.from ?? 0), to = Number(opt.to ?? duration(video) - 0.01);
    const out = opt.out ?? path.join(os.tmpdir(), 'reference');
    const { page, close } = await blankPage();
    const times = [];
    for (let t = from; t <= to + 1e-6; t += every) times.push(+t.toFixed(3));
    const per = cols * Math.max(1, Math.floor(2400 / cell));
    for (let n = 0; n * per < times.length; n++) {
        const cells = times.slice(n * per, (n + 1) * per).map((t) => ({ img: refFrame(video, t, cell), label: `${t.toFixed(2)} s · f${Math.round(t * 24)}` }));
        const f = path.join(out, `sheet-${n + 1}.jpg`);
        await compose(page, cells, cols, cell, f);
        console.log(f);
    }
    await close();
} else if (cmd === 'compare') {
    const [scene, video] = pos;
    const cell = Number(opt.cell ?? 480);
    const dur = duration(video);
    let times;
    if (opt.times) times = String(opt.times).split(',').map(Number);
    else {
        times = [];
        for (let t = 0; t < dur; t += Number(opt.every ?? 1)) times.push(+t.toFixed(3));
    }
    const dir = path.dirname(path.resolve(scene));
    const out = opt.out ?? path.join(dir, 'review', 'compare.jpg');
    const { page, info, close } = await openScene(scene, { size: cell * 2 });
    const cells = [], rows = [];
    for (const t of times) {
        const i = Math.min(info.total - 1, Math.round(t * info.fps));
        const ours = 'data:image/jpeg;base64,' + (await page.evaluate((i) => {
            window.renderFrame(i);
            return document.getElementById('c').toDataURL('image/jpeg', 0.9).split(',')[1];
        }, i));
        const ref = refFrame(video, t, cell);
        const d = ref ? await diff(page, ref, ours) : NaN;
        rows.push([t, d]);
        const col = d < 30 ? '#8fe3b0' : d < 60 ? '#ffd23f' : '#ff7a7a';
        cells.push({ img: ref, label: `REF ${t.toFixed(2)} s` }, { img: ours, label: `OURS · diff ${d.toFixed(0)}`, color: col });
    }
    await compose(page, cells, 4, cell, out);
    await close();
    const mean = rows.reduce((s, [, d]) => s + d, 0) / rows.length;
    const md = [`# Comparison with the reference · ${rel(scene)}`, '', `Reference: \`${path.basename(video)}\` · mean difference **${mean.toFixed(1)}** (0 = identical, <30 similar, >60 something else)`, '', '| Second | Difference |', '|---|---|', ...rows.map(([t, d]) => `| ${t.toFixed(2)} | ${d.toFixed(1)}${d >= 60 ? ' ⚠' : ''} |`), '', `![compare](${path.basename(out)})`, ''];
    fs.writeFileSync(out.replace(/\.jpg$/, '.md'), md.join('\n'));
    console.log(md.slice(0, 3).join('\n'));
    console.log('→ ' + rel(out));
} else if (cmd === 'colors') {
    // node engine/reference.mjs colors <video> <second> name=x,y …   (x, y from 0 to 1)
    // Mean color (5×5 px) at each point: to copy palettes without guessing.
    const [video, t, ...pts] = pos;
    const img = refFrame(video, Number(t), 1000);
    const { page, close } = await blankPage();
    const res = await page.evaluate(async ({ img, pts }) => {
        const im = new Image();
        await new Promise((ok) => ((im.onload = ok), (im.src = img)));
        const c = document.createElement('canvas');
        c.width = im.width;
        c.height = im.height;
        const g = c.getContext('2d');
        g.drawImage(im, 0, 0);
        return pts.map((p) => {
            const [name, xy] = p.includes('=') ? p.split('=') : [p, p];
            const [x, y] = xy.split(',').map(Number);
            const d = g.getImageData(Math.round(x * im.width) - 2, Math.round(y * im.height) - 2, 5, 5).data;
            const avg = [0, 1, 2].map((k) => Math.round(Array.from({ length: 25 }, (_, i) => d[i * 4 + k]).reduce((a, b) => a + b) / 25));
            return `${name.padEnd(14)} #${avg.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
        });
    }, { img, pts });
    console.log(res.join('\n'));
    await close();
} else {
    console.error('Usage: node engine/reference.mjs sheets <video> … | compare <scene.js> <video> … | colors <video> <s> name=x,y …');
    process.exit(1);
}
