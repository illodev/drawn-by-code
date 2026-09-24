// Automatic review of a scene: the first half of the improvement loop.
//
//   node engine/review.mjs <scene.js> [--cell 480] [--cols 4] [--every 0.5] [--times 1,2.5]
//
// Writes to <scene>/review/:
//   sheet.jpg  contact sheet (start, middle and end of each shot, or every --every s)
//   auto.md    objective checks: errors, determinism, motion, speed
// What can't be measured (legibility, composition, style) Claude judges by looking at
// the sheet and the stills: see .claude/skills/review/SKILL.md
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { openScene, parseArgs, rel } from './browser.mjs';

const { pos, opt } = parseArgs(process.argv.slice(2));
const scene = pos[0];
if (!scene || !fs.existsSync(scene)) {
    console.error('Usage: node engine/review.mjs <scene.js> [--cell 480] [--cols 4] [--every 0.5] [--times 1,2.5]');
    process.exit(1);
}
const dir = path.dirname(path.resolve(scene));
const out = path.join(dir, 'review');
fs.mkdirSync(out, { recursive: true });
const cellW = Number(opt.cell ?? 480);
const { page, info, close, errors } = await openScene(scene, { size: Math.max(960, cellW * 2) });
const { fps, total, duration, shots } = info;
const T = (i) => i / fps;
const fmt = (s) => s.toFixed(2) + ' s';
const report = [];
const warn = [];

try {
    // 1 · Paint speed
    let t0 = performance.now();
    const probe = [0, Math.floor(total / 3), Math.floor((2 * total) / 3), total - 1];
    for (const i of probe) await page.evaluate((i) => window.renderFrame(i), i);
    const msFirst = (performance.now() - t0) / probe.length;
    t0 = performance.now();
    for (const i of probe) await page.evaluate((i) => window.renderFrame(i), i);
    const msWarm = (performance.now() - t0) / probe.length;

    // 2 · Determinism: the same frame, painted in a different order, must come out identical
    const hashOf = async (i) => {
        const d = await page.evaluate((i) => {
            window.renderFrame(i);
            return document.getElementById('c').toDataURL('image/png');
        }, i);
        return crypto.createHash('sha1').update(d).digest('hex');
    };
    const detFrames = [...new Set([Math.floor(total * 0.2), Math.floor(total * 0.55), total - 1])];
    const first = [];
    for (const i of detFrames) first.push(await hashOf(i));
    for (const i of [0, Math.floor(total / 2), 3]) await page.evaluate((i) => window.renderFrame(i), Math.min(i, total - 1));
    const nondet = [];
    for (let n = 0; n < detFrames.length; n++) if ((await hashOf(detFrames[n])) !== first[n]) nondet.push(detFrames[n]);
    if (nondet.length) warn.push(`**Non-deterministic** at ${nondet.map((i) => fmt(T(i))).join(', ')}: the frame changes depending on what was painted before (leftover state, Math.random, Date, a badly keyed cache).`);

    // 3 · Motion: mean difference between thumbnails every 1/6 s
    const stepF = Math.max(1, Math.round(fps / 6));
    const thumbs = [];
    const holes = [];
    const meanLum = new Array(total);
    // every frame: the mean brightness of each one is used to detect flashes;
    // the thumbnails every 1/6 s, for motion energy
    for (let i = 0; i < total; i++) {
        const th = await page.evaluate((i) => window.thumb(i), i);
        meanLum[i] = th.lum.reduce((a, b) => a + b, 0) / th.lum.length;
        if (i % stepF === 0) {
            thumbs.push([i, th.lum]);
            if (th.holes > 0.002) holes.push([i, th.holes]);
        }
    }
    // Flashes (photosensitivity): rises or drops in mean brightness of more than 10 %
    // within ≤ 2 frames. More than 3 in one second is a real risk (WCAG 2.3.1).
    const flashes = [];
    for (let i = 2; i < total; i++) {
        const d = meanLum[i] - meanLum[i - 2];
        if (Math.abs(d) > 25.5 && (!flashes.length || i - flashes[flashes.length - 1] > 2)) flashes.push(i);
    }
    const flashSecs = [];
    for (let s = 0; s < Math.ceil(duration); s++) {
        const n = flashes.filter((i) => i / fps >= s && i / fps < s + 1).length;
        if (n > 3) flashSecs.push(`${s}–${s + 1} s (${n})`);
    }
    if (flashSecs.length) warn.push(`**Flashes** more than 3 per second (photosensitivity risk): ${flashSecs.join(', ')}. Soften the brightness changes or lower the contrast.`);
    if (holes.length) warn.push(`**Transparent holes** (the empty canvas shows through: a background that doesn't cover the camera, or nothing painted) at ${holes.slice(0, 6).map(([i, h]) => `${fmt(T(i))} (${(h * 100).toFixed(1)} %)`).join(', ')}${holes.length > 6 ? '…' : ''}.`);
    const diffs = [];
    for (let n = 1; n < thumbs.length; n++) {
        const a = thumbs[n - 1][1], b = thumbs[n][1];
        let s = 0;
        for (let p = 0; p < a.length; p++) s += Math.abs(a[p] - b[p]);
        diffs.push([thumbs[n][0], s / a.length]);
    }
    const STILL = 0.25; // below this, for practical purposes nothing moves
    const still = [];
    let run = null;
    for (const [i, d] of diffs) {
        if (d < STILL) run = run ?? [i - stepF, i];
        if (d < STILL) run[1] = i;
        else if (run) (still.push(run), (run = null));
    }
    if (run) still.push(run);
    const longStill = still.filter(([a, b]) => T(b - a) >= 1.0);
    const flat = thumbs.filter(([, px]) => {
        const m = px.reduce((s, v) => s + v, 0) / px.length;
        return px.reduce((s, v) => s + (v - m) ** 2, 0) / px.length < 4;
    });
    if (flat.length) warn.push(`**Flat frames** (a single color) at ${flat.slice(0, 6).map(([i]) => fmt(T(i))).join(', ')}${flat.length > 6 ? '…' : ''}.`);
    // large jumps that do NOT fall on a shot cut (the ones at cuts are normal)
    const cuts = shots.slice(1).map(([a]) => a);
    const jumps = diffs.filter(([i, d]) => d > 40 && !cuts.some((c) => Math.abs(T(i) - c) <= 0.34));

    // energy per second, as a strip of blocks
    const blocks = ' ▁▂▃▄▅▆▇█';
    const perSec = [];
    for (let s = 0; s < Math.ceil(duration); s++) {
        const ds = diffs.filter(([i]) => T(i) > s && T(i) <= s + 1).map(([, d]) => d);
        perSec.push(ds.length ? ds.reduce((a, b) => a + b, 0) / ds.length : 0);
    }
    const maxE = Math.max(1e-6, ...perSec);
    // square root: so a camera pan doesn't flatten the small movements
    const strip = perSec.map((e) => blocks[Math.min(8, Math.round(Math.sqrt(e / maxE) * 8))]).join('');

    // 4 · Cuts and rhythm: do the cuts land on the beat?
    const offBeat = [];
    if (info.bpm && shots.length) {
        const L = 60 / info.bpm;
        for (const [a] of shots.slice(1)) {
            const ph = (((a - info.beatOffset) % L) + L) % L;
            const dist = Math.min(ph, L - ph);
            if (dist > 0.5 / fps) offBeat.push(`${fmt(a)} (${(dist * 1000).toFixed(0)} ms off the beat)`);
        }
        if (offBeat.length) warn.push(`**Cuts off the beat** (${info.bpm} BPM): ${offBeat.join(', ')}.`);
    }

    // 5 · Contact sheet
    let times;
    if (opt.times) times = String(opt.times).split(',').map(Number);
    else if (opt.every) {
        times = [];
        for (let t = 0; t < duration; t += Number(opt.every)) times.push(t);
    } else if (shots.length) {
        times = shots.flatMap(([a, b]) => {
            const d = b - a;
            return d < 1.2 ? [a + d / 2] : [a + Math.min(0.15, d * 0.1), a + d / 2, b - Math.min(0.15, d * 0.1)];
        });
    } else {
        const n = 12;
        times = Array.from({ length: n }, (_, k) => (duration * (k + 0.5)) / n);
    }
    times = times.map((t) => Math.min(t, duration - 1 / fps));
    const cols = Number(opt.cols ?? (times.length <= 6 ? 3 : 4));
    const PER = cols * 6;
    const sheets = [];
    for (let n = 0; n * PER < times.length; n++) {
        const f = path.join(out, times.length > PER ? `sheet-${n + 1}.jpg` : 'sheet.jpg');
        const b64 = await page.evaluate((o) => window.contactSheet(o), { times: times.slice(n * PER, (n + 1) * PER), cols, cellW });
        fs.writeFileSync(f, Buffer.from(b64, 'base64'));
        sheets.push(f);
    }

    // 6 · Report
    report.push(`# Automatic review · ${rel(scene)}`, '');
    report.push(`${info.px[0]}×${info.px[1]} px · ${fps} fps · ${fmt(duration)} · ${total} frames${info.bpm ? ` · ${info.bpm} BPM` : ''}`, '');
    report.push('## Warnings', '');
    if (errors.length) warn.unshift(`**Errors in the page** (${errors.length}): ${[...new Set(errors)].slice(0, 5).join(' | ')}`);
    report.push(...(warn.length ? warn.map((w) => `- ${w}`) : ['- None.']), '');
    report.push('## Motion', '');
    report.push('Energy per second (how much the image changes):', '', '```', strip, [...Array(Math.ceil(duration)).keys()].map((s) => (s % 5 === 0 ? String(s).padEnd(5) : '')).join(''), '```', '');
    report.push(longStill.length
        ? `Still stretches of 1 s or more (intended? a visual pause that looks like a glitch is a bug): ${longStill.map(([a, b]) => `${fmt(T(a))}–${fmt(T(b))}`).join(', ')}.`
        : 'No still stretches of 1 s or more.');
    if (jumps.length) report.push('', `Large jumps outside cuts (can be normal in dense patterns; check whether they bother): ${jumps.slice(0, 12).map(([i]) => fmt(T(i))).join(', ')}.`);
    report.push('', '## Speed', '', `Painting: ${msFirst.toFixed(0)} ms/frame cold, ${msWarm.toFixed(0)} ms warm → full render ≈ ${((msWarm * total) / 1000).toFixed(0)} s at this size.`);
    if (msWarm > 400) report.push('', '> Slow: cache static elements with `Motion.sprite` and lower the texture density.');
    report.push('', '## Contact sheet', '', ...sheets.map((f) => `![sheet](${path.basename(f)})`), '');
    fs.writeFileSync(path.join(out, 'auto.md'), report.join('\n'));
    console.log(report.join('\n'));
    console.log('\n→ ' + [...sheets, path.join(out, 'auto.md')].map(rel).join('\n→ '));
} finally {
    await close();
}
