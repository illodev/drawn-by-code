// Renderiza una escena a MP4, a fotogramas sueltos o a fotos fijas.
//
//   node engine/render.mjs <scene.js>                      → <escena>/out/<nombre>.mp4
//   node engine/render.mjs <scene.js> --size 1920 --audio mezcla.wav
//   node engine/render.mjs <scene.js> --at 1.5,3,4.25      → <escena>/out/stills/*.png
//   node engine/render.mjs <scene.js> --frames --jpg       → <escena>/out/frames/f_0000.jpg…
//
// Opciones: --size <ancho px>  --from <s>  --to <s>  --step <fotogramas>  --out <ruta>
//           --audio <fichero>  --crf <n, 18 por defecto>  --jpg (con --frames)
// Los tiempos van en SEGUNDOS. Cada fotograma es determinista: el mismo t da la misma imagen.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { openScene, findFfmpeg, parseArgs } from './browser.mjs';

const { pos, opt } = parseArgs(process.argv.slice(2), ['frames', 'jpg']);
const scene = pos[0];
if (!scene || !fs.existsSync(scene)) {
    console.error('Uso: node engine/render.mjs <scene.js> [--size 1920] [--at 1,2.5] [--frames] [--from s] [--to s] [--audio f] [--out ruta]');
    process.exit(1);
}
const dir = path.dirname(path.resolve(scene));
const name = path.basename(dir);
const outBase = path.join(dir, 'out');
const { page, info, close, errors } = await openScene(scene, { size: opt.size ? Number(opt.size) : 1920 });
const { fps, total } = info;
const t0 = Date.now();
const grab = (i, type) =>
    page.evaluate(([i, type]) => {
        window.renderFrame(i);
        return document.getElementById('c').toDataURL(type, 0.95).split(',')[1];
    }, [i, type]);

try {
    if (opt.at) {
        const out = opt.out ?? path.join(outBase, 'stills');
        fs.mkdirSync(out, { recursive: true });
        for (const s of String(opt.at).split(',').map(Number)) {
            const i = Math.min(total - 1, Math.round(s * fps));
            const f = path.join(out, `t_${(i / fps).toFixed(2)}s.png`);
            fs.writeFileSync(f, Buffer.from(await grab(i, 'image/png'), 'base64'));
            console.log(f);
        }
    } else {
        const from = Math.round(Number(opt.from ?? 0) * fps);
        const to = Math.min(total - 1, opt.to !== undefined ? Math.round(Number(opt.to) * fps) : total - 1);
        const step = Number(opt.step ?? 1);
        if (opt.frames) {
            const out = opt.out ?? path.join(outBase, 'frames');
            fs.mkdirSync(out, { recursive: true });
            const ext = opt.jpg ? 'jpg' : 'png';
            for (let i = from; i <= to; i += step) {
                fs.writeFileSync(path.join(out, `f_${String(i).padStart(4, '0')}.${ext}`), Buffer.from(await grab(i, opt.jpg ? 'image/jpeg' : 'image/png'), 'base64'));
            }
            console.log(`fotogramas ${from}..${to} → ${out}`);
        } else {
            const ffmpeg = findFfmpeg();
            if (!ffmpeg) throw new Error('Falta ffmpeg (o FFMPEG_PATH). Usa --frames para sacar solo los fotogramas.');
            fs.mkdirSync(outBase, { recursive: true });
            const out = opt.out ?? path.join(outBase, `${name}.mp4`);
            const audio = opt.audio ?? (info.audio?.mix ? path.join(dir, info.audio.mix) : null);
            const args = ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps / step), '-c:v', 'mjpeg', '-i', '-'];
            if (audio && fs.existsSync(audio)) args.push('-ss', String(from / fps), '-i', audio, '-c:a', 'aac', '-b:a', '256k', '-shortest');
            args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', String(opt.crf ?? 18), '-preset', 'medium', '-movflags', '+faststart', out);
            const ff = spawn(ffmpeg, args, { stdio: ['pipe', 'inherit', 'inherit'] });
            const done = new Promise((ok, ko) => ff.on('close', (c) => (c === 0 ? ok() : ko(new Error('ffmpeg salió con ' + c)))));
            for (let i = from; i <= to; i += step) {
                const buf = Buffer.from(await grab(i, 'image/jpeg'), 'base64');
                if (!ff.stdin.write(buf)) await new Promise((ok) => ff.stdin.once('drain', ok));
                if ((i - from) % (fps * 5) === 0) process.stdout.write(`\r${(i / fps).toFixed(1)} / ${(to / fps).toFixed(1)} s`);
            }
            ff.stdin.end();
            await done;
            console.log(`\r${out}${audio && fs.existsSync(audio) ? ' (con audio)' : ''}`);
        }
    }
    console.log(`listo en ${((Date.now() - t0) / 1000).toFixed(1)} s`);
} finally {
    await close();
}
if (errors.length) {
    console.error(`\n${errors.length} error(es) en la página: revisa arriba.`);
    process.exitCode = 1;
}
