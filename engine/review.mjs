// Revisión automática de una escena: la primera mitad del bucle de mejora.
//
//   node engine/review.mjs <scene.js> [--cell 480] [--cols 4] [--every 0.5] [--times 1,2.5]
//
// Deja en <escena>/review/:
//   hoja.jpg   hoja de contacto (inicio, mitad y final de cada plano, o cada --every s)
//   auto.md    comprobaciones objetivas: errores, determinismo, movimiento, velocidad
// Lo que no se puede medir (legibilidad, composición, estilo) lo juzga Claude mirando
// la hoja y las fotos fijas: ver .claude/skills/revisar/SKILL.md
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { openScene, parseArgs, rel } from './browser.mjs';

const { pos, opt } = parseArgs(process.argv.slice(2));
const scene = pos[0];
if (!scene || !fs.existsSync(scene)) {
    console.error('Uso: node engine/review.mjs <scene.js> [--cell 480] [--cols 4] [--every 0.5] [--times 1,2.5]');
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
    // 1 · Velocidad de pintado
    let t0 = performance.now();
    const probe = [0, Math.floor(total / 3), Math.floor((2 * total) / 3), total - 1];
    for (const i of probe) await page.evaluate((i) => window.renderFrame(i), i);
    const msFirst = (performance.now() - t0) / probe.length;
    t0 = performance.now();
    for (const i of probe) await page.evaluate((i) => window.renderFrame(i), i);
    const msWarm = (performance.now() - t0) / probe.length;

    // 2 · Determinismo: el mismo fotograma, pintado en otro orden, debe salir idéntico
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
    if (nondet.length) warn.push(`**No determinista** en ${nondet.map((i) => fmt(T(i))).join(', ')}: el fotograma cambia según lo pintado antes (estado que se arrastra, Math.random, Date, caché mal clavada).`);

    // 3 · Movimiento: diferencia media entre miniaturas cada 1/6 s
    const stepF = Math.max(1, Math.round(fps / 6));
    const thumbs = [];
    const holes = [];
    const meanLum = new Array(total);
    // todos los fotogramas: el brillo medio de cada uno sirve para detectar destellos;
    // las miniaturas cada 1/6 s, para la energía de movimiento
    for (let i = 0; i < total; i++) {
        const th = await page.evaluate((i) => window.thumb(i), i);
        meanLum[i] = th.lum.reduce((a, b) => a + b, 0) / th.lum.length;
        if (i % stepF === 0) {
            thumbs.push([i, th.lum]);
            if (th.holes > 0.002) holes.push([i, th.holes]);
        }
    }
    // Destellos (fotosensibilidad): subidas o bajadas del brillo medio de más del 10 %
    // en ≤ 2 fotogramas. Más de 3 en un segundo es un riesgo real (criterio WCAG 2.3.1).
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
    if (flashSecs.length) warn.push(`**Destellos** de más de 3 por segundo (riesgo de fotosensibilidad): ${flashSecs.join(', ')}. Suaviza los cambios de brillo o baja el contraste.`);
    if (holes.length) warn.push(`**Huecos transparentes** (asoma el lienzo vacío: fondo que no cubre la cámara o nada pintado) en ${holes.slice(0, 6).map(([i, h]) => `${fmt(T(i))} (${(h * 100).toFixed(1)} %)`).join(', ')}${holes.length > 6 ? '…' : ''}.`);
    const diffs = [];
    for (let n = 1; n < thumbs.length; n++) {
        const a = thumbs[n - 1][1], b = thumbs[n][1];
        let s = 0;
        for (let p = 0; p < a.length; p++) s += Math.abs(a[p] - b[p]);
        diffs.push([thumbs[n][0], s / a.length]);
    }
    const STILL = 0.25; // por debajo, a efectos prácticos no se mueve nada
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
    if (flat.length) warn.push(`**Fotogramas planos** (un solo color) en ${flat.slice(0, 6).map(([i]) => fmt(T(i))).join(', ')}${flat.length > 6 ? '…' : ''}.`);
    // saltos grandes que NO caen en un corte de plano (los de los cortes son normales)
    const cuts = shots.slice(1).map(([a]) => a);
    const jumps = diffs.filter(([i, d]) => d > 40 && !cuts.some((c) => Math.abs(T(i) - c) <= 0.34));

    // energía por segundo, como una tira de bloques
    const blocks = ' ▁▂▃▄▅▆▇█';
    const perSec = [];
    for (let s = 0; s < Math.ceil(duration); s++) {
        const ds = diffs.filter(([i]) => T(i) > s && T(i) <= s + 1).map(([, d]) => d);
        perSec.push(ds.length ? ds.reduce((a, b) => a + b, 0) / ds.length : 0);
    }
    const maxE = Math.max(1e-6, ...perSec);
    // raíz cuadrada: que un barrido de cámara no aplaste los movimientos pequeños
    const strip = perSec.map((e) => blocks[Math.min(8, Math.round(Math.sqrt(e / maxE) * 8))]).join('');

    // 4 · Cortes y ritmo: ¿caen los cortes en golpe de música?
    const offBeat = [];
    if (info.bpm && shots.length) {
        const L = 60 / info.bpm;
        for (const [a] of shots.slice(1)) {
            const ph = (((a - info.beatOffset) % L) + L) % L;
            const dist = Math.min(ph, L - ph);
            if (dist > 0.5 / fps) offBeat.push(`${fmt(a)} (a ${(dist * 1000).toFixed(0)} ms del golpe)`);
        }
        if (offBeat.length) warn.push(`**Cortes fuera de golpe** (${info.bpm} BPM): ${offBeat.join(', ')}.`);
    }

    // 5 · Hoja de contacto
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
        const f = path.join(out, times.length > PER ? `hoja-${n + 1}.jpg` : 'hoja.jpg');
        const b64 = await page.evaluate((o) => window.contactSheet(o), { times: times.slice(n * PER, (n + 1) * PER), cols, cellW });
        fs.writeFileSync(f, Buffer.from(b64, 'base64'));
        sheets.push(f);
    }

    // 6 · Informe
    report.push(`# Revisión automática · ${rel(scene)}`, '');
    report.push(`${info.px[0]}×${info.px[1]} px · ${fps} fps · ${fmt(duration)} · ${total} fotogramas${info.bpm ? ` · ${info.bpm} BPM` : ''}`, '');
    report.push('## Avisos', '');
    if (errors.length) warn.unshift(`**Errores en la página** (${errors.length}): ${[...new Set(errors)].slice(0, 5).join(' | ')}`);
    report.push(...(warn.length ? warn.map((w) => `- ${w}`) : ['- Ninguno.']), '');
    report.push('## Movimiento', '');
    report.push('Energía por segundo (cuánto cambia la imagen):', '', '```', strip, [...Array(Math.ceil(duration)).keys()].map((s) => (s % 5 === 0 ? String(s).padEnd(5) : '')).join(''), '```', '');
    report.push(longStill.length
        ? `Tramos quietos de 1 s o más (¿intencionados? un silencio visual que parece fallo es un error): ${longStill.map(([a, b]) => `${fmt(T(a))}–${fmt(T(b))}`).join(', ')}.`
        : 'Sin tramos quietos de 1 s o más.');
    if (jumps.length) report.push('', `Saltos grandes fuera de los cortes (en patrones densos pueden ser normales; mira si molestan): ${jumps.slice(0, 12).map(([i]) => fmt(T(i))).join(', ')}.`);
    report.push('', '## Velocidad', '', `Pintado: ${msFirst.toFixed(0)} ms/fotograma en frío, ${msWarm.toFixed(0)} ms en caliente → render completo ≈ ${((msWarm * total) / 1000).toFixed(0)} s a este tamaño.`);
    if (msWarm > 400) report.push('', '> Lento: cachea lo estático con `Motion.sprite` y baja la densidad de las texturas.');
    report.push('', '## Hoja de contacto', '', ...sheets.map((f) => `![hoja](${path.basename(f)})`), '');
    fs.writeFileSync(path.join(out, 'auto.md'), report.join('\n'));
    console.log(report.join('\n'));
    console.log('\n→ ' + [...sheets, path.join(out, 'auto.md')].map(rel).join('\n→ '));
} finally {
    await close();
}
