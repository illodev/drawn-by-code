// Measures pixel art in a video: the grid, the palette, the still scene and every loop.
//
//   node styles/pixel-art/grab.mjs grid <video> [--frame 0]
//       Finds the art's pixel size (in video pixels) and the grid's offset: tries every
//       grid from 64 to 480 cells and keeps the one whose flat cells best rebuild the frame.
//
//   node styles/pixel-art/grab.mjs sprites <video> --cells 230 [--tol 20] [--out data.js] [--name PixelData]
//       Samples the centre of every cell of every frame (the median of its inner pixels,
//       away from the blurred cell edges), clusters the colours into a palette (the video's
//       compression noise collapses back into the artist's flat colours), takes the still
//       scene as the per-cell mode over all frames, and cuts everything that changes into
//       actors: connected groups of changing cells, each with its unique drawings (as
//       string maps, '.' = see-through) and the drawing shown at each frame.
//       Writes a JS file that defines one global: { cells, palette, base, actors }.
//
//   node styles/pixel-art/grab.mjs crop <video> --cells 230 --frame 12 --rect x,y,w,h [--tol 20]
//       Prints one region of one frame as a string map, for authoring a sprite by hand.
//
// The output is data to author from, not a copy to ship blindly: name the actors, look at
// their drawings, and redraw what compression smeared (single-pixel eyes, 1-cell outlines).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { findFfmpeg, parseArgs } from '../../engine/browser.mjs';

const [cmd, video, ...rest] = process.argv.slice(2);
const { opt } = parseArgs(rest);
const ffmpeg = findFfmpeg();
if (!cmd || !video) {
    console.log('usage: grab.mjs grid|sprites|crop <video> [options] (see the header)');
    process.exit(1);
}

function probe(v) {
    const r = spawnSync(ffmpeg, ['-i', v], { encoding: 'utf8' });
    const m = /, (\d{2,5})x(\d{2,5})[, ]/.exec(r.stderr);
    const f = /, ([\d.]+) fps/.exec(r.stderr);
    return { w: +m[1], h: +m[2], fps: f ? +f[1] : 24 };
}
function frames(v, w, h) {
    const r = spawnSync(ffmpeg, ['-v', 'error', '-i', v, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 30 });
    const n = Math.floor(r.stdout.length / (w * h * 3));
    return Array.from({ length: n }, (_, i) => r.stdout.subarray(i * w * h * 3, (i + 1) * w * h * 3));
}
const median = (a) => {
    a.sort((x, y) => x - y);
    return a[a.length >> 1];
};
// Colour of cell (i, j): median of the pixels whose centres lie a pixel inside the cell.
function cellColor(buf, w, p, ox, oy, i, j) {
    const x0 = Math.ceil(ox + i * p + 0.5), x1 = Math.floor(ox + (i + 1) * p - 1.5);
    const y0 = Math.ceil(oy + j * p + 0.5), y1 = Math.floor(oy + (j + 1) * p - 1.5);
    const r = [], g = [], b = [];
    for (let y = Math.max(0, y0); y <= y1; y++) {
        for (let x = Math.max(0, x0); x <= Math.min(w - 1, x1); x++) {
            const k = (y * w + x) * 3;
            r.push(buf[k]); g.push(buf[k + 1]); b.push(buf[k + 2]);
        }
    }
    if (!r.length) {
        const k = (Math.round(oy + (j + 0.5) * p) * w + Math.round(ox + (i + 0.5) * p)) * 3;
        return [buf[k], buf[k + 1], buf[k + 2]];
    }
    return [median(r), median(g), median(b)];
}
const dist = (a, b) => Math.hypot(a[0] - b[0], (a[1] - b[1]) * 1.2, a[2] - b[2]);
const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

if (cmd === 'grid') {
    const { w, h } = probe(video);
    const buf = frames(video, w, h)[Number(opt.frame ?? 0)];
    // error of rebuilding rows (axis x) with flat cells of size p at offset o
    const err = (p, o) => {
        let e = 0, n = 0;
        for (let y = 0; y < h; y += 3) {
            for (let x = 0; x < w; x++) {
                const c = Math.floor((x - o) / p), sx = Math.round(o + (c + 0.5) * p);
                if (sx < 0 || sx >= w) continue;
                const a = (y * w + x) * 3, b = (y * w + sx) * 3;
                e += Math.abs(buf[a] - buf[b]) + Math.abs(buf[a + 1] - buf[b + 1]) + Math.abs(buf[a + 2] - buf[b + 2]);
                n++;
            }
        }
        return e / n;
    };
    let best = [];
    for (let cells = 64; cells <= 480; cells++) {
        const p = w / cells;
        let e = Infinity, bo = 0;
        for (let o = -p / 2; o < p / 2; o += p / 8) {
            const v = err(p, o);
            if (v < e) { e = v; bo = o; }
        }
        best.push({ cells, p: +p.toFixed(4), offset: +bo.toFixed(2), err: +e.toFixed(3) });
    }
    // finer grids (2×, 3× the real one) always rebuild a bit better: keep the coarsest grid
    // within 20 % of the best error
    const min = Math.min(...best.map((b) => b.err));
    const pick = best.find((b) => b.err <= min * 1.2);
    best.sort((a, b) => a.err - b.err);
    console.table(best.slice(0, 6));
    console.log(`grid: ${pick.cells} cells across, ${pick.p} video px per art pixel (offset ${pick.offset})`);
    process.exit(0);
}

const cells = Number(opt.cells ?? 0);
if (!cells) throw new Error('--cells N (run `grid` first)');
const { w, h } = probe(video);
const p = w / cells, rows = Math.round(h / p);
const ox = Number(opt.ox ?? 0), oy = Number(opt.oy ?? 0);
const all = frames(video, w, h);
const only = cmd === 'crop' ? [Number(opt.frame ?? 0)] : all.map((_, i) => i);
const sampled = only.map((f) => {
    const out = new Array(cells * rows);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cells; i++) out[j * cells + i] = cellColor(all[f], w, p, ox, oy, i, j);
    return out;
});

// palette: frequent colours first; a colour joins an entry closer than tol, else starts one
const tol = Number(opt.tol ?? 20);
// Only "confident" cells vote: a cell with a neighbour of nearly the same colour. Lone cells
// (1-pixel eyes, outlines) are smeared by the codec's chroma subsampling and would each
// add a fake in-between colour; they are mapped to the nearest real colour afterwards.
const counts = new Map(), loneCounts = new Map();
const same = Number(opt.same ?? 10);
for (const fr of sampled) {
    for (let j = 0; j < rows; j++) for (let i = 0; i < cells; i++) {
        const c = fr[j * cells + i];
        const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
            const x = i + dx, y = j + dy;
            return x >= 0 && y >= 0 && x < cells && y < rows && dist(c, fr[y * cells + x]) < same;
        });
        const k = c.join(',');
        if (!nb) {
            loneCounts.set(k, (loneCounts.get(k) ?? 0) + 1);
            continue;
        }
        counts.set(k, (counts.get(k) ?? 0) + 1);
    }
}
const byFreq = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => [k.split(',').map(Number), n]);
const pal = [];
for (const [c, n] of byFreq) {
    let bi = -1, bd = tol;
    for (let i = 0; i < pal.length; i++) {
        const d = dist(c, pal[i].c);
        if (d < bd) { bd = d; bi = i; }
    }
    if (bi < 0) pal.push({ c: c.slice(), sum: c.map((v) => v * n), n });
    else {
        const e = pal[bi];
        e.sum = e.sum.map((v, k) => v + c[k] * n);
        e.n += n;
    }
}
// entries seen in fewer than `minCount` cells are compression noise: fold them into the nearest
const minCount = Number(opt.min ?? 3);
let entries = pal.filter((e) => e.n >= minCount).map((e) => e.c);
const nearest = (c) => {
    let bi = 0, bd = Infinity;
    for (let i = 0; i < entries.length; i++) {
        const d = dist(c, entries[i]);
        if (d < bd) { bd = d; bi = i; }
    }
    return bi;
};
// two passes of k-means-like refinement
for (let pass = 0; pass < 2; pass++) {
    const sum = entries.map(() => [0, 0, 0, 0]);
    for (const [c, n] of byFreq) {
        const i = nearest(c);
        sum[i][0] += c[0] * n; sum[i][1] += c[1] * n; sum[i][2] += c[2] * n; sum[i][3] += n;
    }
    entries = entries.map((e, i) => (sum[i][3] ? sum[i].slice(0, 3).map((v) => v / sum[i][3]) : e));
}
// Colours that only live in lone cells (a magenta dot among blue) never vote above: give
// them entries too when they are far from every entry and steady (seen in many samples).
{
    const lone = [];
    for (const [k, n] of [...loneCounts.entries()].sort((a, b) => b[1] - a[1])) {
        const c = k.split(',').map(Number);
        if (dist(c, entries[nearest(c)]) > tol * 1.5) lone.push([c, n]);
    }
    const extra = [];
    for (const [c, n] of lone) {
        const e = extra.find((x) => dist(c, x.c) < tol);
        if (e) e.n += n;
        else extra.push({ c, n });
    }
    for (const e of extra) if (e.n >= Number(opt.minLone ?? 25)) entries.push(e.c);
}
// order by frequency so the background gets the first symbol
// Lone cells (no neighbour of the same colour: a 1-pixel eye, a dot on a screen) come out
// of the codec blended with what surrounds them, so a saturated pink dot on blue reads as a
// muted mauve. Unmix: find the palette colour p and the blend a (0–0.6) with
// sample ≈ (1 − a)·p + a·surroundings, preferring small blends.
const unmix = Number(opt.unmix ?? 1);
const idx = sampled.map((fr) => fr.map((c, q) => {
    const i = q % cells, j = (q / cells) | 0;
    const nbs = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const x = i + dx, y = j + dy;
        if ((dx || dy) && x >= 0 && y >= 0 && x < cells && y < rows) nbs.push(fr[y * cells + x]);
    }
    if (!unmix || nbs.some((n) => dist(c, n) < same)) return nearest(c);
    const n = [0, 1, 2].map((k) => nbs.reduce((s, v) => s + v[k], 0) / nbs.length);
    let bi = nearest(c), bd = dist(c, entries[bi]);
    for (let e = 0; e < entries.length; e++) {
        for (let a = 0.1; a <= 0.6; a += 0.1) {
            const m = [0, 1, 2].map((k) => (1 - a) * entries[e][k] + a * n[k]);
            const d = dist(c, m) + a * 25;
            if (d < bd) { bd = d; bi = e; }
        }
    }
    return bi;
}));
const freq = entries.map(() => 0);
for (const fr of idx) for (const i of fr) freq[i]++;
const order = entries.map((_, i) => i).filter((i) => freq[i] > 0).sort((a, b) => freq[b] - freq[a]);
const remap = new Map(order.map((o, n) => [o, n]));
const palette = order.map((o) => hex(entries[o]));
const ix = idx.map((fr) => fr.map((i) => remap.get(i)));
// symbols: one printable character per palette entry ('.' is kept for see-through)
// (then Latin letters with accents: rich pieces use well over 90 colours)
const SYM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,-/:;<=>?@[]^_{|}~' +
    Array.from({ length: 0x24f - 0xc0 + 1 }, (_, i) => String.fromCharCode(0xc0 + i)).filter((ch) => ch !== '×' && ch !== '÷').join('');
if (opt.debug) { console.log(palette.map((c, i) => c + ":" + freq[order[i]]).join(" ")); process.exit(0); }
if (palette.length > SYM.length) throw new Error(`${palette.length} colours: raise --tol`);
const toRows = (get, x, y, cw, ch) => {
    const out = [];
    for (let j = 0; j < ch; j++) {
        let s = '';
        for (let i = 0; i < cw; i++) {
            const v = get(x + i, y + j);
            s += v < 0 ? '.' : SYM[v];
        }
        out.push(s);
    }
    return out;
};

if (cmd === 'crop') {
    const [x, y, cw, ch] = String(opt.rect).split(',').map(Number);
    console.log(palette.map((c, i) => `${SYM[i]}=${c}`).join(' '));
    console.log(toRows((i, j) => ix[0][j * cells + i], x, y, cw, ch).join('\n'));
    process.exit(0);
}

// still scene: the per-cell mode over all frames
const N = cells * rows, F = ix.length;
const base = new Array(N);
for (let c = 0; c < N; c++) {
    const m = new Map();
    for (let f = 0; f < F; f++) m.set(ix[f][c], (m.get(ix[f][c]) ?? 0) + 1);
    base[c] = [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
}
// a cell "moves" in a frame when it is a different palette entry AND visibly different
const moveTol = Number(opt.move ?? 28);
const differs = (f, c) => ix[f][c] !== base[c] && dist(entries[order[ix[f][c]]], entries[order[base[c]]]) > moveTol;
const moving = new Uint8Array(N);
for (let c = 0; c < N; c++) for (let f = 0; f < F; f++) if (differs(f, c)) { moving[c] = 1; break; }
// actors: groups of moving cells, joined across gaps of up to `gap` cells
const gap = Number(opt.gap ?? 3);
const label = new Int32Array(N).fill(-1);
const actors = [];
for (let c = 0; c < N; c++) {
    if (!moving[c] || label[c] >= 0) continue;
    const id = actors.length, stack = [c];
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0;
    label[c] = id;
    while (stack.length) {
        const q = stack.pop(), qx = q % cells, qy = (q / cells) | 0;
        x0 = Math.min(x0, qx); x1 = Math.max(x1, qx); y0 = Math.min(y0, qy); y1 = Math.max(y1, qy); n++;
        for (let dy = -gap; dy <= gap; dy++) for (let dx = -gap; dx <= gap; dx++) {
            const nx = qx + dx, ny = qy + dy;
            if (nx < 0 || ny < 0 || nx >= cells || ny >= rows) continue;
            const r = ny * cells + nx;
            if (moving[r] && label[r] < 0) { label[r] = id; stack.push(r); }
        }
    }
    actors.push({ x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, n });
}
// per actor and frame: the region's cells that differ from the still scene ('.' elsewhere)
// the still scene split into pieces: groups of non-background cells (8-connected), each
// with its own map ('.' = background), so the scene can name and place them one by one
const pieces = [];
const seen = new Uint8Array(N);
for (let c = 0; c < N; c++) {
    if (base[c] === 0 || seen[c]) continue;
    const stack = [c], cellsIn = [];
    seen[c] = 1;
    while (stack.length) {
        const q = stack.pop(), qx = q % cells, qy = (q / cells) | 0;
        cellsIn.push(q);
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const nx = qx + dx, ny = qy + dy, r = ny * cells + nx;
            if (nx < 0 || ny < 0 || nx >= cells || ny >= rows || seen[r] || base[r] === 0) continue;
            seen[r] = 1;
            stack.push(r);
        }
    }
    const xs = cellsIn.map((q) => q % cells), ys = cellsIn.map((q) => (q / cells) | 0);
    const x = Math.min(...xs), y = Math.min(...ys), pw = Math.max(...xs) - x + 1, ph = Math.max(...ys) - y + 1;
    const mine = new Set(cellsIn);
    pieces.push({ name: `p${pieces.length}`, x, y, w: pw, h: ph, map: toRows((i, j) => (mine.has(j * cells + i) ? base[j * cells + i] : -1), x, y, pw, ph) });
}
const out = { cells, rows, pixel: +p.toFixed(4), symbols: SYM.slice(0, palette.length), palette, bg: palette[0], pieces, actors: [] };
for (const a of actors) {
    if (a.n < Number(opt.minActor ?? 2)) continue;
    const draws = [], seq = [];
    for (let f = 0; f < F; f++) {
        const m = toRows((i, j) => (differs(f, j * cells + i) ? ix[f][j * cells + i] : -1), a.x, a.y, a.w, a.h).join('\n');
        let k = draws.indexOf(m);
        if (k < 0) { k = draws.length; draws.push(m); }
        seq.push(k);
    }
    out.actors.push({ name: `a${out.actors.length}`, x: a.x, y: a.y, w: a.w, h: a.h, draws: draws.map((d) => d.split('\n')), seq });
}
const name = opt.name ?? 'PixelData';
// readable output: one sprite row per line, so the maps can be read and edited by eye
const J = JSON.stringify;
const map = (rows, ind) => '[\n' + rows.map((r) => ind + '  ' + J(r)).join(',\n') + ',\n' + ind + ']';
const js = `// Measured with styles/pixel-art/grab.mjs from the reference (${cells}×${rows} cells, ${F} frames).\n` +
    `// Symbols index the palette; '.' = see-through. Actors: drawings + the drawing at each frame.\n` +
    `const ${name} = {\n  cells: ${cells}, rows: ${rows}, pixel: ${out.pixel},\n  symbols: ${J(out.symbols)},\n` +
    `  palette: ${J(palette)},\n  bg: ${J(out.bg)},\n  pieces: [\n` +
    pieces.map((q) => `    { name: ${J(q.name)}, x: ${q.x}, y: ${q.y}, map: ${map(q.map, '    ')} },\n`).join('') +
    `  ],\n  actors: [\n` +
    out.actors.map((a) => `    { name: ${J(a.name)}, x: ${a.x}, y: ${a.y}, seq: ${J(a.seq)}, draws: [\n` +
        a.draws.map((d) => `      ${map(d, '      ')},\n`).join('') + `    ] },\n`).join('') +
    `  ],\n};\n`;
if (opt.out) fs.writeFileSync(opt.out, js);
console.log(`${palette.length} colours · ${pieces.length} still pieces · ${out.actors.length} actors · ${F} frames`);
for (const q of pieces) console.log(`${q.name}: ${q.x},${q.y} ${q.w}×${q.h}`);
for (const a of out.actors) console.log(`${a.name}: ${a.x},${a.y} ${a.w}×${a.h} · ${a.draws.length} drawings · seq ${a.seq.join(' ')}`);
