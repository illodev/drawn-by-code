// Tools for working against a reference video (replicas, style studies).
//
//   node engine/reference.mjs sheets <video> [--every 0.25] [--from 0] [--to end] [--cols 7] [--cell 360] [--out dir]
//       Contact sheets labelled with each frame's second → <out>/sheet-N.jpg
//
//   node engine/reference.mjs compare <scene.js> <video> [--times 1,2.5 | --every 1] [--cell 480] [--crop x,y,w,h] [--out f.jpg]
//       Reference (left) and scene (right) at the same instants, with the mean color
//       difference of each pair (0 = identical, ~30 = similar, >60 = something else).
//       Default → <scene>/review/compare.jpg and compare.md
//
//   node engine/reference.mjs colors <video> <second> name=x,y …
//       Mean color at each point (x, y as fractions): copy palettes instead of guessing.
//
//   node engine/reference.mjs track <video> --color '#d9735e' [--tol 40] [--from 0] [--to end] [--crop x,y,w,h]
//       Follows everything of one color frame by frame: centre, box (2–98 % of the pixels,
//       so stray specks do not count) and area, in thousandths of the frame. For copying the
//       motion of a character 1:1 (bounces, squash, arcs) instead of eyeballing it.
//
//   node engine/reference.mjs cuts <video> [--from 0] [--to end]
//       Exact cut frames (the frame edges change colour at once): cuts land on frames.
//
//   node engine/reference.mjs box <video|image> <second> --color '#302222' [--tol 40] [--region x0,y0,x1,y1]
//       Box (2–98 %) of one colour inside a region, in logical units (0–1000). Run it on the
//       reference and on your own still (`render.mjs --at`, same size) to compare positions
//       and sizes of one element: hair, ink of a text, a prop.
//
//   node engine/reference.mjs runs <video|image> <second> --row 0.6 | --col 0.3 [--tol 18]
//       Colour runs along one row or column (start–end:#colour): measures edges of paper,
//       bands of sky, ruled lines, margins, in logical units.
//
//   node engine/reference.mjs face <video> --body '#d2745e' [--from] [--to]
//       Per drawing (every 2 frames), the centroid of dark marks (eyes, mouth) surrounded by
//       the body colour: where a character's face is, even when its limbs change.
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
// crop: [x, y, w, h] as fractions of the frame, to look at details at full resolution.
function refFrame(video, t, w, crop = null) {
    const vf = (crop ? `crop=iw*${crop[2]}:ih*${crop[3]}:iw*${crop[0]}:ih*${crop[1]},` : '') + `scale=${w}:-2`;
    const r = spawnSync(ffmpeg, ['-v', 'error', '-ss', String(t), '-i', video, '-frames:v', '1', '-vf', vf, '-f', 'image2pipe', '-c:v', 'mjpeg', '-q:v', '3', '-'], { maxBuffer: 1 << 26 });
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
    // --crop x,y,w,h (fractions): compare a region (hands, faces) at full detail
    const crop = opt.crop ? String(opt.crop).split(',').map(Number) : null;
    const { page, info, close } = await openScene(scene, { size: crop ? Math.min(4320, Math.round(cell / crop[2])) : cell * 2 });
    const cells = [], rows = [];
    for (const t of times) {
        const i = Math.min(info.total - 1, Math.round(t * info.fps));
        const ours = 'data:image/jpeg;base64,' + (await page.evaluate(([i, crop]) => {
            window.renderFrame(i);
            const c = document.getElementById('c');
            if (!crop) return c.toDataURL('image/jpeg', 0.9).split(',')[1];
            const o = document.createElement('canvas');
            o.width = Math.round(c.width * crop[2]);
            o.height = Math.round(c.height * crop[3]);
            o.getContext('2d').drawImage(c, -c.width * crop[0], -c.height * crop[1]);
            return o.toDataURL('image/jpeg', 0.9).split(',')[1];
        }, [i, crop]));
        const ref = refFrame(video, t, cell, crop);
        const d = ref ? await diff(page, ref, ours) : NaN;
        rows.push([t, d]);
        const col = d < 30 ? '#8fe3b0' : d < 60 ? '#ffd23f' : '#ff7a7a';
        cells.push({ img: ref, label: `REF ${t.toFixed(2)} s` }, { img: ours, label: `OURS · diff ${d.toFixed(0)}`, color: col });
    }
    await compose(page, cells, 4, cell, out);
    await close();
    // instants the reference doesn't have (past its end) are left out of the mean
    const valid = rows.filter(([, d]) => Number.isFinite(d));
    const mean = valid.reduce((s, [, d]) => s + d, 0) / Math.max(1, valid.length);
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
} else if (cmd === 'track') {
    const video = pos[0];
    const hex = String(opt.color ?? '#d9735e').replace('#', '');
    const target = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const tol = Number(opt.tol ?? 40), W = 400;
    const from = Number(opt.from ?? 0), to = Number(opt.to ?? duration(video));
    const crop = opt.crop ? String(opt.crop).split(',').map(Number) : [0, 0, 1, 1];
    const vf = `crop=iw*${crop[2]}:ih*${crop[3]}:iw*${crop[0]}:ih*${crop[1]},scale=${W}:${W}`;
    const r = spawnSync(ffmpeg, ['-v', 'error', '-ss', String(from), '-t', String(to - from), '-i', video, '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 30 });
    const fr = W * W * 3, n = Math.floor(r.stdout.length / fr), fps = 24;
    const q = (arr, f) => arr[Math.min(arr.length - 1, Math.floor(arr.length * f))];
    const k = (v, a) => Math.round((crop[a] + (v / W) * crop[a + 2]) * 1000);
    console.log('   t      cx   cy    x0   x1   y0   y1    w    h   area');
    for (let i = 0; i < n; i++) {
        const xs = [], ys = [];
        for (let y = 0; y < W; y++) {
            for (let x = 0; x < W; x++) {
                const o = i * fr + (y * W + x) * 3;
                const d = Math.abs(r.stdout[o] - target[0]) + Math.abs(r.stdout[o + 1] - target[1]) + Math.abs(r.stdout[o + 2] - target[2]);
                if (d < tol) (xs.push(x), ys.push(y));
            }
        }
        const t = (from + i / fps).toFixed(3);
        if (xs.length < 20) {
            console.log(`${t}   —`);
            continue;
        }
        xs.sort((a, b) => a - b);
        ys.sort((a, b) => a - b);
        const [x0, x1, y0, y1] = [k(q(xs, 0.02), 0), k(q(xs, 0.98), 0), k(q(ys, 0.02), 1), k(q(ys, 0.98), 1)];
        const cx = k(xs.reduce((a, b) => a + b) / xs.length, 0), cy = k(ys.reduce((a, b) => a + b) / ys.length, 1);
        const pad = (v, w = 4) => String(v).padStart(w);
        console.log(`${t} ${pad(cx, 5)}${pad(cy, 5)} ${pad(x0, 5)}${pad(x1, 5)}${pad(y0, 5)}${pad(y1, 5)} ${pad(x1 - x0, 5)}${pad(y1 - y0, 5)} ${pad(Math.round((xs.length / (W * W)) * 1000 * crop[2] * crop[3]), 6)}`);
    }
} else if (cmd === 'cuts' || cmd === 'box' || cmd === 'runs' || cmd === 'face') {
    const src = pos[0], isImage = /\.(png|jpe?g|webp)$/i.test(src);
    const hex2rgb = (h) => [0, 2, 4].map((i) => parseInt(String(h).replace('#', '').slice(i, i + 2), 16));
    const dist = (buf, o, c) => Math.abs(buf[o] - c[0]) + Math.abs(buf[o + 1] - c[1]) + Math.abs(buf[o + 2] - c[2]);
    // raw RGB frames of `src` at W×W (one frame at t, or every frame in [from, to))
    const frames = (W, t, from, to) => {
        const args = ['-v', 'error'];
        if (!isImage) args.push('-ss', String(t ?? from), ...(to !== undefined ? ['-t', String(to - from)] : []));
        args.push('-i', src, ...(t !== undefined || isImage ? ['-frames:v', '1'] : []), '-vf', `scale=${W}:${W}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-');
        const r = spawnSync(ffmpeg, args, { maxBuffer: 1 << 30 });
        return { buf: r.stdout, n: Math.floor(r.stdout.length / (W * W * 3)) };
    };
    if (cmd === 'cuts') {
        const W = 64, from = Number(opt.from ?? 0), to = Number(opt.to ?? duration(src));
        const { buf, n } = frames(W, undefined, from, to);
        let prev = null;
        for (let i = 0; i < n; i++) {
            const c = [0, 0, 0];
            for (const [x, y] of [[2, 2], [61, 2], [2, 61], [61, 61], [3, 30], [60, 30]]) for (let k = 0; k < 3; k++) c[k] += buf[i * W * W * 3 + (y * W + x) * 3 + k] / 6;
            if (prev && Math.abs(c[0] - prev[0]) + Math.abs(c[1] - prev[1]) + Math.abs(c[2] - prev[2]) > 30) console.log(`cut at frame ${Math.round(from * 24) + i} (${(from + i / 24).toFixed(3)} s)`);
            prev = c;
        }
    } else if (cmd === 'box') {
        const W = 1000, { buf } = frames(W, Number(pos[1] ?? 0)), col = hex2rgb(opt.color ?? '#000000'), tol = Number(opt.tol ?? 40);
        const [x0, y0, x1, y1] = String(opt.region ?? '0,0,1000,1000').split(',').map(Number);
        const xs = [], ys = [];
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (dist(buf, (y * W + x) * 3, col) < tol) (xs.push(x), ys.push(y));
        xs.sort((a, b) => a - b);
        ys.sort((a, b) => a - b);
        const q = (a, f) => a[Math.floor(a.length * f)];
        console.log(xs.length > 30 ? `x ${q(xs, 0.02)}–${q(xs, 0.98)}  y ${q(ys, 0.02)}–${q(ys, 0.98)}  pixels ${xs.length}` : 'not found');
    } else if (cmd === 'runs') {
        const W = 1000, { buf } = frames(W, Number(pos[1] ?? 0)), tol = Number(opt.tol ?? 18);
        const row = opt.row !== undefined, at = Math.round(Number(opt.row ?? opt.col) * W);
        const px = (i) => [0, 1, 2].map((k) => buf[((row ? at : i) * W + (row ? i : at)) * 3 + k]);
        const runs = [];
        let cur = null;
        for (let i = 0; i < W; i++) {
            const p = px(i);
            if (cur && Math.abs(p[0] - cur.c[0]) + Math.abs(p[1] - cur.c[1]) + Math.abs(p[2] - cur.c[2]) < tol) (cur.n++, (cur.c = cur.c.map((v, k) => v + (p[k] - v) / cur.n)));
            else runs.push((cur = { i, n: 1, c: p }));
        }
        console.log(runs.filter((q) => q.n >= 4).map((q) => `${q.i}–${q.i + q.n - 1}:#${q.c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`).join('  '));
    } else {
        const W = 500, from = Number(opt.from ?? 0), to = Number(opt.to ?? duration(src)), body = hex2rgb(opt.body ?? '#d2745e');
        const { buf, n } = frames(W, undefined, from, to), fr = W * W * 3, R = 7;
        for (let i = 0; i < n; i += 2) {
            const on = new Uint8Array(W * W);
            for (let j = 0; j < W * W; j++) on[j] = dist(buf, i * fr + j * 3, body) < 40 ? 1 : 0;
            let sx = 0, sy = 0, c = 0;
            for (let y = R; y < W - R; y++) for (let x = R; x < W - R; x++) {
                const o = i * fr + (y * W + x) * 3;
                if (buf[o] + buf[o + 1] + buf[o + 2] > 170) continue;
                let s = 0, tot = 0;
                for (let dy = -R; dy <= R; dy += 2) for (let dx = -R; dx <= R; dx += 2) (s += on[(y + dy) * W + x + dx]), tot++;
                if (s / tot > 0.45) (sx += x, sy += y, c++);
            }
            console.log((from + i / 24).toFixed(3), c > 15 ? `face ${Math.round((sx / c / W) * 1000)} ${Math.round((sy / c / W) * 1000)}` : '—');
        }
    }
} else {
    console.error('Usage: node engine/reference.mjs sheets <video> … | compare <scene.js> <video> … | colors <video> <s> name=x,y … | track <video> --color #hex … | cuts <video> | box <src> <s> --color #hex | runs <src> <s> --row y | face <video> --body #hex');
    process.exit(1);
}
