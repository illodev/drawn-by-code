// Terminal style kit: the whole frame is one character grid, like a text-mode screen.
// Loaded as a classic <script>; it defines the global Term.
//
// Nothing is drawn with shapes on the final frame: every picture is first painted in a
// small sample buffer (ordinary canvas drawing, in the scene's logical units) and then
// turned into characters, cell by cell. Flat areas take a character from a density ramp;
// cells a stroke or an edge crosses take the character whose own shape fits it best (a
// `/` along a slope, `_` under a floor, `|` up a wall, `(` round a curve). Text is written
// straight into the cells. The grid is then drawn from pre-tinted glyph atlases and
// finished like a tube: bloom, scanlines, a vignette, grain, and glitches on demand.
// Rules and the detail bar: .claude/skills/style-terminal/SKILL.md
//
//   setup(env) { return { T: Term.make(env, { cols: 160, rows: 45 }) }; }
//   draw(g, t, env) {
//       const T = env.state.T;
//       T.begin(t);
//       T.picture((p) => { p.fillStyle = '#fff'; p.fillRect(200, 300, 400, 300); });
//       T.text(4, 2, 'hello', { ink: 'red' });
//       T.present(g, env);
//   }
const Term = (() => {
    const PAL = {
        bg: '#05070a',          // the tube switched on, showing nothing
        ink: '#dfe8e4',         // phosphor white, a little cold
        red: '#ff2e3f',         // the only colour: the cursor, the wound, the choice
        cold: '#5fb4c8',        // a second, rare ink for light that is not ours (windows, screens)
        amber: '#ffb347',       // a third, rarer still (sodium light, warnings)
    };
    const FAMILY = 'TermMono';
    const FONTS = [
        { family: FAMILY, src: 'fonts/JetBrainsMono-Regular.ttf', descriptors: { weight: '400' } },
        { family: FAMILY, src: 'fonts/JetBrainsMono-Bold.ttf', descriptors: { weight: '700' } },
    ];
    const SX = 4, SY = 8, D = SX * SY;      // samples per cell for shape matching
    const LEVELS = 12;                      // brightness steps per ink

    // --- the glyph table ----------------------------------------------------------------
    let ASCII = '';
    for (let c = 33; c < 127; c++) ASCII += String.fromCharCode(c);
    const LATIN = 'áéíóúüñÁÉÍÓÚÜÑ¿¡·«»©®°±×÷…—•→←↑↓™¯¦≡≈';
    const BOX = '─│┌┐└┘├┤┬┴┼═║╔╗╚╝╭╮╰╯╠╣╦╩╬';
    const BLOCK = '█▓▒░▀▄▌▐●○■□▮▯▁▂▃▅▆▇►◄▲▼◆';
    const GLYPHS = [' ', ...ASCII, ...LATIN, ...BOX, ...BLOCK];
    const INDEX = new Map(GLYPHS.map((ch, i) => [ch, i]));
    const gi = (ch) => INDEX.get(ch) ?? INDEX.get('?');

    // Character sets a picture can be drawn with.
    const SETS = {
        art: '/\\|_-¯\',.()',                                  // strokes and corners only: the default
        ascii: ASCII,                                           // letters and digits too
        lines: '/\\|_-=()[]<>\'"`,.:;~^+!',                     // outlines only, no letters
        soft: '.,:;\'"`-_~^=+*!|/\\()<>ilctvxzo',               // light textures
        binary: '01',
        blocks: '░▒▓█▀▄▌▐',
    };
    // Density ramps for flat areas, sparse to dense.
    const RAMPS = {
        art: ' .·:-=+*%#@',
        ascii: ' .·:-=+*cox%#8@',
        lines: ' .·:-=+',
        soft: ' .·:;~=+*',
        binary: ' 01',
        blocks: ' ░▒▓█',
    };

    function hexRgb(h) {
        const n = parseInt(h.slice(1), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    // Box-drawing and block characters are painted, not typeset: they must fill the cell
    // exactly so frames and solid areas join without seams at any size.
    function special(g, ch, x, y, w, h) {
        const th = Math.max(1, Math.round(w / 7));
        const cx = x + Math.round((w - th) / 2), cy = y + Math.round((h - th) / 2);
        const H = (a, b) => g.fillRect(a, cy, b - a, th), V = (a, b) => g.fillRect(cx, a, th, b - a);
        const L = x, R = x + w, T = y, B = y + h, mx = cx + th, my = cy + th;
        const ring = (path) => { g.save(); g.lineWidth = th; g.strokeStyle = g.fillStyle; g.beginPath(); path(); g.stroke(); g.restore(); };
        const tri = (x0, y0, x1, y1, x2, y2) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.lineTo(x2, y2); g.fill(); };
        // a corner's arc: centre (ax, ay) on the cell's corner, radii to the mid-edges
        const arc = (ax, ay, a0, a1) => {
            g.save();
            g.beginPath();
            g.rect(x, y, w, h);
            g.clip();
            g.lineWidth = th;
            g.strokeStyle = g.fillStyle;
            g.beginPath();
            g.ellipse(ax, ay, Math.abs(ax - (cx + th / 2)), Math.abs(ay - (cy + th / 2)), 0, a0, a1);
            g.stroke();
            g.restore();
        };
        const dots = (level) => {
            // stipple on a grid of w/3: level 1 = quarter, 2 = checker, 3 = three quarters
            const s = Math.max(1, Math.round(w / 6));
            for (let j = 0; j * s < h; j++) for (let i = 0; i * s < w; i++) {
                const on = level === 2 ? (i + j) % 2 === 0 : level === 1 ? i % 2 === 0 && (j + (i >> 1)) % 2 === 0 : !(i % 2 === 1 && (j + (i >> 1)) % 2 === 1);
                if (on) g.fillRect(x + i * s, y + j * s, Math.min(s, w - i * s), Math.min(s, h - j * s));
            }
        };
        switch (ch) {
            case '█': g.fillRect(x, y, w, h); return true;
            case '●': g.beginPath(); g.arc(x + w / 2, y + h / 2, w * 0.42, 0, Math.PI * 2); g.fill(); return true;
            case '○': ring(() => g.arc(x + w / 2, y + h / 2, w * 0.36, 0, Math.PI * 2)); return true;
            case '■': g.fillRect(x + Math.round(w * 0.12), y + Math.round(h / 2 - w * 0.38), Math.round(w * 0.76), Math.round(w * 0.76)); return true;
            case '□': ring(() => g.rect(x + w * 0.16, y + h / 2 - w * 0.34, w * 0.68, w * 0.68)); return true;
            case '▮': g.fillRect(x + Math.round(w * 0.2), y + Math.round(h * 0.2), Math.round(w * 0.6), Math.round(h * 0.6)); return true;
            case '▯': ring(() => g.rect(x + w * 0.24, y + h * 0.22, w * 0.52, h * 0.56)); return true;
            case '▁': case '▂': case '▃': case '▅': case '▆': case '▇': {
                const hh = Math.round((h * { '▁': 1, '▂': 2, '▃': 3, '▅': 5, '▆': 6, '▇': 7 }[ch]) / 8);
                g.fillRect(x, y + h - hh, w, hh);
                return true;
            }
            case '►': tri(x + w * 0.1, y + h * 0.26, x + w * 0.9, y + h / 2, x + w * 0.1, y + h * 0.74); return true;
            case '◄': tri(x + w * 0.9, y + h * 0.26, x + w * 0.1, y + h / 2, x + w * 0.9, y + h * 0.74); return true;
            case '▲': tri(x + w * 0.05, y + h * 0.68, x + w / 2, y + h * 0.3, x + w * 0.95, y + h * 0.68); return true;
            case '▼': tri(x + w * 0.05, y + h * 0.32, x + w / 2, y + h * 0.7, x + w * 0.95, y + h * 0.32); return true;
            case '◆': g.beginPath(); g.moveTo(x + w / 2, y + h / 2 - w * 0.48); g.lineTo(x + w * 0.96, y + h / 2); g.lineTo(x + w / 2, y + h / 2 + w * 0.48); g.lineTo(x + w * 0.04, y + h / 2); g.fill(); return true;
            // rounded corners: a quarter of a circle that meets the straight lines mid-edge
            case '╭': arc(x + w, y + h, Math.PI, Math.PI * 1.5); return true;
            case '╮': arc(x, y + h, Math.PI * 1.5, Math.PI * 2); return true;
            case '╰': arc(x + w, y, Math.PI * 0.5, Math.PI); return true;
            case '╯': arc(x, y, 0, Math.PI * 0.5); return true;
            case '╠': g.fillRect(cx - th, T, th, h); g.fillRect(cx + th, T, th, cy - T); g.fillRect(cx + th, cy + th, th, B - cy - th); g.fillRect(cx + th, cy - th, R - cx - th, th); g.fillRect(cx + th, cy + th, R - cx - th, th); return true;
            case '╣': g.fillRect(cx + th, T, th, h); g.fillRect(cx - th, T, th, cy - T); g.fillRect(cx - th, cy + th, th, B - cy - th); g.fillRect(L, cy - th, cx - L, th); g.fillRect(L, cy + th, cx - L, th); return true;
            case '╦': g.fillRect(L, cy - th, w, th); g.fillRect(L, cy + th, cx - L, th); g.fillRect(cx + th, cy + th, R - cx - th, th); g.fillRect(cx - th, cy + th, th, B - cy - th); g.fillRect(cx + th, cy + th, th, B - cy - th); return true;
            case '╩': g.fillRect(L, cy + th, w, th); g.fillRect(L, cy - th, cx - L, th); g.fillRect(cx + th, cy - th, R - cx - th, th); g.fillRect(cx - th, T, th, cy - T); g.fillRect(cx + th, T, th, cy - T); return true;
            case '╬': g.fillRect(L, cy - th, cx - L, th); g.fillRect(cx + th, cy - th, R - cx - th, th); g.fillRect(L, cy + th, cx - L, th); g.fillRect(cx + th, cy + th, R - cx - th, th); g.fillRect(cx - th, T, th, cy - T); g.fillRect(cx + th, T, th, cy - T); g.fillRect(cx - th, cy + th, th, B - cy - th); g.fillRect(cx + th, cy + th, th, B - cy - th); return true;
            case '▀': g.fillRect(x, y, w, Math.round(h / 2)); return true;
            case '▄': g.fillRect(x, y + Math.round(h / 2), w, h - Math.round(h / 2)); return true;
            case '▌': g.fillRect(x, y, Math.round(w / 2), h); return true;
            case '▐': g.fillRect(x + Math.round(w / 2), y, w - Math.round(w / 2), h); return true;
            case '░': dots(1); return true;
            case '▒': dots(2); return true;
            case '▓': dots(3); return true;
            case '─': H(L, R); return true;
            case '│': V(T, B); return true;
            case '┌': H(cx, R); V(cy, B); return true;
            case '┐': H(L, mx); V(cy, B); return true;
            case '└': H(cx, R); V(T, my); return true;
            case '┘': H(L, mx); V(T, my); return true;
            case '├': V(T, B); H(cx, R); return true;
            case '┤': V(T, B); H(L, mx); return true;
            case '┬': H(L, R); V(cy, B); return true;
            case '┴': H(L, R); V(T, my); return true;
            case '┼': H(L, R); V(T, B); return true;
            case '═': g.fillRect(L, cy - th, w, th); g.fillRect(L, cy + th, w, th); return true;
            case '║': g.fillRect(cx - th, T, th, h); g.fillRect(cx + th, T, th, h); return true;
            case '╔': g.fillRect(cx - th, cy - th, R - cx + th, th); g.fillRect(cx + th, cy + th, R - cx - th, th); g.fillRect(cx - th, cy - th, th, B - cy + th); g.fillRect(cx + th, cy + th, th, B - cy - th); return true;
            case '╗': g.fillRect(L, cy - th, cx + 2 * th - L, th); g.fillRect(L, cy + th, cx - L, th); g.fillRect(cx + th, cy - th, th, B - cy + th); g.fillRect(cx - th, cy + th, th, B - cy - th); return true;
            case '╚': g.fillRect(cx - th, cy + th, R - cx + th, th); g.fillRect(cx + th, cy - th, R - cx - th, th); g.fillRect(cx - th, T, th, cy + 2 * th - T); g.fillRect(cx + th, T, th, cy - T); return true;
            case '╝': g.fillRect(L, cy + th, cx + 2 * th - L, th); g.fillRect(L, cy - th, cx - L, th); g.fillRect(cx + th, T, th, cy + 2 * th - T); g.fillRect(cx - th, T, th, cy - T); return true;
        }
        return false;
    }

    // Paints one glyph of the table in a cell whose top-left corner is (x, y).
    function paintGlyph(g, ch, x, y, w, h, weight) {
        if (ch === ' ' || special(g, ch, x, y, w, h)) return;
        g.font = `${weight} ${w / 0.6}px ${FAMILY}`;      // the font's advance is 0.6 em
        g.textBaseline = 'alphabetic';
        g.textAlign = 'center';
        g.fillText(ch, x + w / 2, y + h * 0.775);
    }

    // What each glyph looks like at SX×SY samples: its ink coverage per sample, then
    // normalised so the glyph's densest sample is 1 (edge cells are matched on shape alone).
    let DESC = null, COVER = null;
    function describe() {
        if (DESC) return;
        const w = 24, h = 48, c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const g = c.getContext('2d', { willReadFrequently: true });
        DESC = new Float32Array(GLYPHS.length * D);
        COVER = new Float32Array(GLYPHS.length);
        GLYPHS.forEach((ch, n) => {
            g.clearRect(0, 0, w, h);
            g.fillStyle = '#fff';
            paintGlyph(g, ch, 0, 0, w, h, 400);
            // a picture's strokes are about a sample and a half thick, a glyph's less than
            // half a sample: thicken the glyph so the two are compared like with like
            if (!BOX.includes(ch) && !BLOCK.includes(ch) && ch !== ' ') {
                g.strokeStyle = '#fff';
                g.lineWidth = w * 0.2;
                g.lineJoin = 'round';
                g.strokeText(ch, w / 2, h * 0.775);
            }
            const d = g.getImageData(0, 0, w, h).data;
            const bw = w / SX, bh = h / SY;
            let max = 0, sum = 0;
            for (let j = 0; j < SY; j++) for (let i = 0; i < SX; i++) {
                let s = 0;
                for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) s += d[((j * bh + y) * w + i * bw + x) * 4 + 3];
                const v = s / (bw * bh * 255);
                DESC[n * D + j * SX + i] = v;
                max = Math.max(max, v);
                sum += v;
            }
            COVER[n] = sum / D;
            if (max > 0) for (let i = 0; i < D; i++) DESC[n * D + i] /= max;
        });
    }

    // --- typing ---------------------------------------------------------------------------
    // How many characters of `str` a person has typed by second t, starting at t0. Keys do
    // not fall evenly: each has its own small delay (seeded by the text), and spaces and
    // punctuation take a breath. Deterministic.
    const typeTimes = new Map();
    function typed(str, t, t0 = 0, cps = 14) {
        const key = str + '|' + cps;
        let at = typeTimes.get(key);
        if (!at) {
            const rnd = Motion.rng('type:' + str);
            at = [];
            let x = 0;
            for (const ch of str) {
                at.push(x);
                x += (0.55 + rnd() * 0.9) / cps + (ch === ' ' ? 0.35 / cps : 0) + (/[.,:;?!]/.test(ch) ? 2.2 / cps : 0);
            }
            at.push(x);
            typeTimes.set(key, at);
        }
        let n = 0;
        while (n < str.length && t - t0 >= at[n]) n++;
        return { n, text: str.slice(0, n), done: n >= str.length, end: t0 + at[str.length] };
    }

    // The same for text the machine prints: an even rate, no breaths.
    function printed(str, t, t0 = 0, cps = 30) {
        const n = Math.max(0, Math.min(str.length, Math.floor((t - t0) * cps + 1e-6)));
        return { n, text: str.slice(0, n), done: n >= str.length, end: t0 + str.length / cps };
    }

    // A text that resolves out of noise: u in 0..1, characters settle left to right while
    // the unsettled ones change every 1/12 s.
    function scramble(str, u, t, seed = 'scr') {
        if (u >= 1) return str;
        const pool = '01#%&$@/\\<>[]{}=+*?!';
        const f = Math.floor(t * 12 + 1e-6);
        let out = '';
        for (let i = 0; i < str.length; i++) {
            const ch = str[i];
            const settle = (i + 1) / (str.length + 1);
            if (ch === ' ' || u * 1.15 >= settle + 0.15 * Motion.rng(seed + ':' + i)()) out += ch;
            else out += u <= 0 ? ' ' : pool[Math.floor(Motion.rng(`${seed}:${i}:${f}`)() * pool.length)];
        }
        return out;
    }

    // --- a terminal ---------------------------------------------------------------------
    function make(env, o = {}) {
        describe();
        const cols = o.cols ?? 160, rows = o.rows ?? 45;
        const inks = { ...PAL, ...(o.inks ?? {}) };
        const inkNames = Object.keys(inks);              // 'bg' is an ink too: dark text on a lit cell
        const inkRgb = inkNames.map((k) => hexRgb(inks[k]));
        const BG = inkNames.indexOf('bg');
        const inkId = (name) => Math.max(0, inkNames.indexOf(name));
        const [PW, PH] = env.px;
        const pcw = PW / cols, pch = PH / rows;            // a cell, in output pixels
        const cw = env.W / cols, ch = env.H / rows;        // a cell, in logical units
        const N = cols * rows;

        const canvas = (w, h, opt) => {
            const c = document.createElement('canvas');
            c.width = Math.max(1, Math.round(w));
            c.height = Math.max(1, Math.round(h));
            return [c, c.getContext('2d', opt)];
        };
        // sample buffer for pictures
        const bw = cols * SX, bh = rows * SY;
        const [pic, pg] = canvas(bw, bh, { willReadFrequently: true });
        const lum = new Float32Array(bw * bh), v = new Float32Array(D);
        const sMax = new Float32Array(N), sLo = new Float32Array(N), sSum = new Float32Array(N), sA = new Float32Array(N);
        const sCx = new Float32Array(N), sCy = new Float32Array(N), sInk = new Uint8Array(N), sMat = new Uint8Array(N);
        // the grid
        const glyph = new Uint16Array(N), ink = new Uint8Array(N), level = new Uint8Array(N), bold = new Uint8Array(N);
        const back = new Uint8Array(N), backLevel = new Uint8Array(N);
        let big = [];                                      // texts larger than one cell
        // output layers
        const [glyphs, gg] = canvas(PW, PH);
        const [screen, sg] = canvas(PW, PH);
        const [tmp, tg] = canvas(PW, PH);
        const blooms = [2, 4, 8, 16].map((d) => canvas(PW / d, PH / d));

        // -- atlases: every glyph, pre-tinted, one canvas per ink × level × weight × scale --
        const atlases = new Map();
        const masters = new Map();
        const geo = (scale) => {
            const gw = Math.max(1, Math.round(pcw * scale)), gh = Math.max(1, Math.round(pch * scale));
            return { gw, gh, pad: Math.ceil(gh * 0.2), aw: Math.max(1, Math.round(pcw * scale)) + 2 };
        };
        function master(weight, scale) {
            const key = weight + '|' + scale;
            if (!masters.has(key)) {
                const { gw, gh, pad, aw } = geo(scale);
                const [c, g] = canvas(GLYPHS.length * aw, gh + 2 * pad);
                g.fillStyle = '#fff';
                GLYPHS.forEach((ch, n) => paintGlyph(g, ch, n * aw + 1, pad, gw, gh, weight));
                masters.set(key, c);
            }
            return masters.get(key);
        }
        const tone = (inkIx, lv) => {
            const [r, gr, b] = inkRgb[inkIx];
            if (inkIx === BG) return inks.bg;
            // a perceptual-ish curve: the lowest step is still visible on the tube
            const a = 0.1 + 0.9 * Math.pow(lv / LEVELS, 1.35);
            return `rgb(${Math.round(r * a)},${Math.round(gr * a)},${Math.round(b * a)})`;
        };
        function atlas(inkIx, lv, weight, scale) {
            const key = `${inkIx}|${lv}|${weight}|${scale}`;
            if (!atlases.has(key)) {
                const m = master(weight, scale);
                const [c, g] = canvas(m.width, m.height);
                g.drawImage(m, 0, 0);
                g.globalCompositeOperation = 'source-in';
                g.fillStyle = tone(inkIx, lv);
                g.fillRect(0, 0, c.width, c.height);
                atlases.set(key, c);
            }
            return atlases.get(key);
        }

        // -- static finishing layers ------------------------------------------------------
        const [scan, scg] = canvas(4, Math.max(2, Math.round(pch / 8)));
        scg.fillStyle = '#fff';
        scg.fillRect(0, 0, 4, scan.height);
        scg.fillStyle = `rgba(0,0,0,${o.scanlines ?? 0.26})`;
        scg.fillRect(0, scan.height - 1, 4, 1);
        const scanPattern = sg.createPattern(scan, 'repeat');
        const [vig, vg] = canvas(PW / 4, PH / 4);
        {
            const w = vig.width, h = vig.height;
            const gr = vg.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, Math.hypot(w, h) * 0.56);
            gr.addColorStop(0, 'rgba(0,0,0,0)');
            gr.addColorStop(0.7, 'rgba(0,0,0,0.28)');
            gr.addColorStop(1, 'rgba(0,0,0,0.72)');
            vg.fillStyle = gr;
            vg.fillRect(0, 0, w, h);
        }
        const [lift, lg] = canvas(PW / 8, PH / 8);
        {
            const w = lift.width, h = lift.height, [r, g2, b] = hexRgb(inks.ink);
            const gr = lg.createRadialGradient(w / 2, h * 0.46, 0, w / 2, h * 0.46, w * 0.62);
            gr.addColorStop(0, `rgba(${r},${g2},${b},0.05)`);
            gr.addColorStop(1, `rgba(${r},${g2},${b},0)`);
            lg.fillStyle = gr;
            lg.fillRect(0, 0, w, h);
        }
        const NOISE = 6, grain = [];
        for (let n = 0; n < NOISE; n++) {
            const [c, g] = canvas(256, 256);
            const im = g.createImageData(256, 256), rnd = Motion.rng('term-grain-' + n);
            for (let i = 0; i < 256 * 256; i++) {
                const v = Math.floor(rnd() * 255);
                im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v;
                im.data[i * 4 + 3] = 255;
            }
            g.putImageData(im, 0, 0);
            grain.push(sg.createPattern(c, 'repeat'));
        }

        const T = {
            cols, rows, cw, ch, inks, PAL: inks, t: 0,
            fx: {},
            x: (c) => c * cw, y: (r) => r * ch,
            col: (x) => Math.floor(x / cw), row: (y) => Math.floor(y / ch),

            // Starts a frame: an empty grid, no effects.
            begin(t) {
                T.t = t;
                glyph.fill(0);
                back.fill(0);
                big = [];
                T.fx = {};
                return T;
            },

            // One character in one cell. o: { ink, level (0..1), bold, bg (ink name), bgLevel }
            put(c, r, chr, o = {}) {
                if (c < 0 || r < 0 || c >= cols || r >= rows) return T;
                const i = r * cols + c;
                glyph[i] = gi(chr);
                ink[i] = inkId(o.ink ?? 'ink');
                level[i] = Math.max(1, Math.round((o.level ?? 1) * LEVELS));
                bold[i] = o.bold ? 1 : 0;
                if (o.bg) {
                    back[i] = inkId(o.bg) + 1;
                    backLevel[i] = Math.max(1, Math.round((o.bgLevel ?? 1) * LEVELS));
                }
                return T;
            },

            // A string from (c, r) to the right. `scale` 2 or 3 writes it double or triple
            // size (each character takes scale×scale cells, like a terminal's double-height
            // line); `align` 'center' or 'right' anchors it on c.
            text(c, r, str, o = {}) {
                const s = o.scale ?? 1, chars = [...str];
                if (o.align === 'center') c = Math.round(c - (chars.length * s) / 2);
                else if (o.align === 'right') c -= chars.length * s;
                if (s === 1) {
                    chars.forEach((chr, n) => (chr === ' ' && !o.bg && !o.opaque ? null : T.put(c + n, r, chr, o)));
                    return T;
                }
                for (let n = 0; n < chars.length; n++) for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) {
                    const cc = c + n * s + i, rr = r + j;
                    if (cc >= 0 && rr >= 0 && cc < cols && rr < rows && (chars[n] !== ' ' || o.opaque)) glyph[rr * cols + cc] = 0;
                }
                big.push({ c, r, chars, s, ink: inkId(o.ink ?? 'ink'), level: Math.max(1, Math.round((o.level ?? 1) * LEVELS)), weight: o.bold ? 700 : 400 });
                return T;
            },

            // Fills a rectangle of cells with one character (a space clears it).
            fill(c, r, w, h, chr, o = {}) {
                for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
                    if (chr === ' ' && !o.bg) {
                        const cc = c + i, rr = r + j;
                        if (cc >= 0 && rr >= 0 && cc < cols && rr < rows) glyph[rr * cols + cc] = back[rr * cols + cc] = 0;
                    } else T.put(c + i, r + j, chr, o);
                }
                return T;
            },

            // A frame of box-drawing characters; o.double for ═║, o.round for rounded corners,
            // o.title for a caption in the top edge.
            box(c, r, w, h, o = {}) {
                const [tl, tr, bl, br, hz, vt] = o.double ? '╔╗╚╝═║' : o.round ? '╭╮╰╯─│' : '┌┐└┘─│';
                for (let i = 1; i < w - 1; i++) T.put(c + i, r, hz, o).put(c + i, r + h - 1, hz, o);
                for (let j = 1; j < h - 1; j++) T.put(c, r + j, vt, o).put(c + w - 1, r + j, vt, o);
                T.put(c, r, tl, o).put(c + w - 1, r, tr, o).put(c, r + h - 1, bl, o).put(c + w - 1, r + h - 1, br, o);
                if (o.title) T.text(c + 2, r, ` ${o.title} `, { ...o, opaque: true });
                return T;
            },

            // The block cursor. It blinks (on 0.53 s, off 0.53 s) unless o.solid.
            cursor(c, r, o = {}) {
                const on = o.solid || ((T.t - (o.since ?? 0)) % 1.06 + 1.06) % 1.06 < 0.53;
                if (on) for (let j = 0; j < (o.scale ?? 1); j++) for (let i = 0; i < (o.scale ?? 1); i++) T.put(c + i, r + j, '█', { ink: o.ink ?? 'red', level: o.level ?? 1 });
                return T;
            },

            // Paints a picture and turns it into characters.
            //   fn(p): ordinary canvas drawing in the scene's logical units. Light is what
            //          gets characters; colour picks the ink.
            //   o.set    'art' (symbols only, the default) | 'ascii' | 'lines' | 'soft' | 'binary' |
            //            'blocks', or a string of characters
            //   o.ramp   characters for flat areas, sparse to dense (defaults to the set's)
            //   o.fill   a text poured into the flat lit cells instead of ramp characters
            //            (o.fillLevel: how bright, 0..1)
            //   o.mats   materials: [{ color, ramp, ink, dim, fill }]. Paint a part in a shade
            //            of `color` and its flat cells take `ramp` instead of the picture's
            //            (hair in strands, a suit in pinstripes); `fill: false` keeps a
            //            poured text out of it
            //   o.ink    force an ink (otherwise the nearest ink to the painted colour)
            //   o.gain   multiplies the light before choosing (1)
            //   o.min    light below this leaves the cell as it was (0.06)
            //   o.edge   how much a cell must vary to be treated as an edge (0.3)
            //   o.slack  samples a stroke may sit off-centre and still get its character (2 across, 1 down)
            //   o.mass   light a cell needs (summed over its 32 samples) for a stroke to count (3)
            //   o.dim    multiplies the brightness of the characters (1)
            //   o.over   true: every dark cell of this picture erases what was there
            // The buffer starts transparent: painting black hides what earlier pictures
            // and texts put in those cells, leaving a cell unpainted keeps it.
            picture(fn, o = {}) {
                pg.setTransform(1, 0, 0, 1, 0, 0);
                pg.globalAlpha = 1;
                pg.globalCompositeOperation = 'source-over';
                pg.filter = 'none';
                pg.clearRect(0, 0, bw, bh);
                pg.setTransform(bw / env.W, 0, 0, bh / env.H, 0, 0);
                pg.save();
                fn(pg);
                pg.restore();
                const data = pg.getImageData(0, 0, bw, bh).data;
                const setName = o.set ?? 'art';
                const cand = Uint16Array.from([...(SETS[setName] ?? setName)].map(gi));
                const ramp = [...(o.ramp ?? RAMPS[setName] ?? RAMPS.art)].map(gi);
                const gain = o.gain ?? 1, min = o.min ?? 0.06, edge = o.edge ?? 0.3, dim = o.dim ?? 1;
                const forced = o.ink ? inkId(o.ink) : -1;
                const fillText = o.fill ? [...o.fill] : null;
                // materials: a painted colour that stands for a texture of its own
                const mats = (o.mats ?? []).map((m) => {
                    const [r, g2, b] = hexRgb(m.color), len = Math.hypot(r, g2, b) || 1;
                    return { dir: [r / len, g2 / len, b / len], ramp: m.ramp ? [...m.ramp].map(gi) : null, ink: m.ink ? inkId(m.ink) : inkId('ink'), dim: m.dim ?? 1, fill: m.fill !== false };
                });
                const slackX = o.slack ?? 2, slackY = Math.min(1, o.slack ?? 1);   // samples a stroke may sit off-centre
                // light per sample
                for (let q = 0, n = 0; n < bw * bh; n++, q += 4) {
                    const al = data[q + 3];
                    lum[n] = al ? Math.min(1, (Math.max(data[q], data[q + 1], data[q + 2]) / 255) * (al / 255) * gain) : 0;
                }
                // pass 1 · what each cell holds: its light, where that light sits, its colour
                for (let r = 0, i = 0; r < rows; r++) for (let c = 0; c < cols; c++, i++) {
                    let max = 0, lo = 1, sum = 0, mx = 0, my = 0, R = 0, G = 0, B = 0, A = 0;
                    for (let j = 0; j < SY; j++) {
                        let n = (r * SY + j) * bw + c * SX;
                        for (let k = 0; k < SX; k++, n++) {
                            const l = lum[n], al = data[n * 4 + 3];
                            if (l > max) max = l;
                            if (l < lo) lo = l;
                            sum += l;
                            mx += l * k;
                            my += l * j;
                            R += data[n * 4] * al; G += data[n * 4 + 1] * al; B += data[n * 4 + 2] * al;
                            A += al;
                        }
                    }
                    sMax[i] = max; sLo[i] = lo; sSum[i] = sum; sA[i] = A;
                    sCx[i] = sum ? mx / sum / (SX - 1) : 0.5;
                    sCy[i] = sum ? my / sum / (SY - 1) : 0.5;
                    // nearest ink, or material, by direction of the colour
                    let best = 0, bs = -1, mat = 0;
                    const len = Math.hypot(R, G, B) || 1;
                    for (let n = 0; n < inkRgb.length; n++) {
                        if (n === BG) continue;
                        const [ir, ig, ib] = inkRgb[n];
                        const q = (R * ir + G * ig + B * ib) / (len * Math.hypot(ir, ig, ib));
                        if (q > bs) { bs = q; best = n; }
                    }
                    for (let n = 0; n < mats.length; n++) {
                        const d = mats[n].dir, q = (R * d[0] + G * d[1] + B * d[2]) / len;
                        if (q > bs) { bs = q; best = mats[n].ink; mat = n + 1; }
                    }
                    sInk[i] = forced >= 0 ? forced : best;
                    sMat[i] = mat;
                }
                // pass 2 · a character for each
                let poured = 0;
                const clear = (i) => { if (o.over || sA[i] > 127 * D) glyph[i] = back[i] = 0; };
                for (let r = 0, i = 0; r < rows; r++) for (let c = 0; c < cols; c++, i++) {
                    const max = sMax[i], lo = sLo[i], sum = sSum[i];
                    // dark: if it was painted, it hides what was behind; untouched, it leaves it
                    if (max < min) { clear(i); continue; }
                    const mean = sum / D, M = sMat[i] ? mats[sMat[i] - 1] : null;
                    let g = 0, bright = mean;
                    const flat = max - lo < edge * Math.max(max, 0.25);
                    if (fillText && (flat || o.fillAll) && (!M || M.fill)) {
                        // a text poured into the body of the shape; its edges stay matched
                        g = gi(fillText[(o.fillFlow ? poured++ : c + r * (o.fillShift ?? 7)) % fillText.length]);
                        bright = o.fillLevel ?? (flat ? mean : max * 0.6);
                    } else if (flat) {
                        // flat: a character from the ramp by brightness
                        const rp = M && M.ramp ? M.ramp : ramp;
                        g = rp[Math.min(rp.length - 1, Math.round(Math.pow(mean, o.gamma ?? 0.8) * (rp.length - 1)))];
                    } else {
                        // A stroke or an edge crosses the cell. Two cells must not both claim
                        // a stroke that runs along the border between them, and a sliver of a
                        // neighbour's shape is not worth a character: when the light hugs one
                        // side and the cell on that side holds more of it, leave it to that cell.
                        const cx = sCx[i], cy = sCy[i];
                        if (sum < (o.mass ?? 3)
                            || (cx < 0.2 && c > 0 && sSum[i - 1] >= sum) || (cx > 0.8 && c < cols - 1 && sSum[i + 1] > sum)
                            || (cy < 0.14 && r > 0 && sSum[i - cols] >= sum) || (cy > 0.86 && r < rows - 1 && sSum[i + cols] > sum)) { clear(i); continue; }
                        // The character whose shape fits best, letting the cell slide a
                        // sample or two (a stroke rarely falls dead centre, and `|` should
                        // still be `|`). Light a character leaves uncovered costs more than
                        // ink it adds, or the sparsest character would always win.
                        const span = max - lo;
                        let bd = Infinity;
                        for (let sy = -slackY; sy <= slackY; sy++) for (let sx = -slackX; sx <= slackX; sx++) {
                            const pen = 0.4 * (Math.abs(sx) + Math.abs(sy));
                            let held = 0;
                            for (let j = 0; j < SY; j++) {
                                const yy = Math.min(bh - 1, Math.max(0, r * SY + j + sy)) * bw;
                                for (let k = 0; k < SX; k++) {
                                    const xx = Math.min(bw - 1, Math.max(0, c * SX + k + sx));
                                    held += lum[yy + xx];
                                    v[j * SX + k] = Math.max(0, Math.min(1, (lum[yy + xx] - lo) / span));
                                }
                            }
                            // a slide may centre the cell's light, never lose it: an emptied
                            // window would match the sparsest character
                            if ((sx || sy) && held < sum * 0.94) continue;
                            for (let n = 0; n < cand.length; n++) {
                                const off = cand[n] * D;
                                let d = pen;
                                for (let k = 0; k < D && d < bd; k++) {
                                    const e = v[k] - DESC[off + k];
                                    d += e > 0 ? 1.6 * e * e : e * e;
                                }
                                if (d < bd) { bd = d; g = cand[n]; }
                            }
                        }
                        bright = max * 0.8 + mean * 0.2;
                    }
                    if (!g) { if (o.over) glyph[i] = 0; continue; }
                    glyph[i] = g;
                    bold[i] = o.bold ? 1 : 0;
                    back[i] = 0;
                    level[i] = Math.max(1, Math.min(LEVELS, Math.round(Math.pow(bright, o.levelGamma ?? 0.7) * dim * (M ? M.dim : 1) * LEVELS)));
                    ink[i] = sInk[i];
                }
                return T;
            },

            // Recolours the characters already in a rectangle of cells (a scan line, a selection).
            tint(c, r, w, h, inkName, lv) {
                for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
                    const cc = c + i, rr = r + j;
                    if (cc < 0 || rr < 0 || cc >= cols || rr >= rows || !glyph[rr * cols + cc]) continue;
                    ink[rr * cols + cc] = inkId(inkName);
                    if (lv !== undefined) level[rr * cols + cc] = Math.max(1, Math.round(lv * LEVELS));
                }
                return T;
            },

            // Reads a cell back (for effects that build on what is already there).
            at(c, r) {
                const i = r * cols + c;
                return { ch: GLYPHS[glyph[i]], ink: inkNames[ink[i]], level: level[i] / LEVELS };
            },

            // Draws the grid on g and finishes it like a tube. Effects for this frame go in
            // T.fx before calling: { corrupt 0..1, tear 0..1, rgb px (logical), dim 0..1,
            // roll 0..1, seed }.
            present(g, env) {
                const fx = T.fx, f = Math.round(T.t * env.fps);
                const frnd = Motion.rng(`term-fx:${fx.seed ?? ''}:${f}`);
                // 1 · glyphs on a clear layer
                gg.setTransform(1, 0, 0, 1, 0, 0);
                gg.clearRect(0, 0, PW, PH);
                const { gw, gh, pad, aw } = geo(1);
                const corrupt = fx.corrupt ?? 0;
                for (let r = 0; r < rows; r++) {
                    const y = Math.round(r * pch);
                    for (let c = 0; c < cols; c++) {
                        const i = r * cols + c;
                        let gl = glyph[i];
                        if (corrupt > 0 && frnd() < corrupt * (gl ? 1 : 0.06)) gl = 1 + Math.floor(frnd() * 94);
                        if (!gl && !back[i]) continue;
                        const x = Math.round(c * pcw);
                        if (back[i]) {
                            gg.fillStyle = tone(back[i] - 1, backLevel[i]);
                            gg.fillRect(x, y, Math.round((c + 1) * pcw) - x, Math.round((r + 1) * pch) - y);
                        }
                        if (gl === 0) continue;
                        const a = atlas(ink[i], glyph[i] ? level[i] : Math.ceil(LEVELS * 0.5), bold[i] ? 700 : 400, 1);
                        gg.drawImage(a, gl * aw + 1, 0, gw, gh + 2 * pad, x, y - pad, gw, gh + 2 * pad);
                    }
                }
                for (const b of big) {
                    const q = geo(b.s), a = atlas(b.ink, b.level, b.weight, b.s);
                    b.chars.forEach((chr, n) => {
                        const gl = gi(chr);
                        if (gl) gg.drawImage(a, gl * q.aw + 1, 0, q.gw, q.gh + 2 * q.pad, Math.round((b.c + n * b.s) * pcw), Math.round(b.r * pch) - q.pad, q.gw, q.gh + 2 * q.pad);
                    });
                }
                // 2 · the tube: background, glyphs, bloom
                sg.setTransform(1, 0, 0, 1, 0, 0);
                sg.globalCompositeOperation = 'source-over';
                sg.globalAlpha = 1;
                sg.fillStyle = inks.bg;
                sg.fillRect(0, 0, PW, PH);
                sg.drawImage(lift, 0, 0, PW, PH);
                sg.drawImage(glyphs, 0, 0);
                let src = glyphs;
                for (const [c, bg2] of blooms) {
                    bg2.clearRect(0, 0, c.width, c.height);
                    bg2.drawImage(src, 0, 0, c.width, c.height);
                    src = c;
                }
                sg.globalCompositeOperation = 'lighter';
                const glow = o.glow ?? 1;
                [0.2, 0.3, 0.34, 0.3].forEach((a, n) => {
                    sg.globalAlpha = a * glow;
                    sg.drawImage(blooms[n][0], 0, 0, PW, PH);
                });
                sg.globalAlpha = 1;
                // 3 · glitches (before the tube's own structure, which stays put)
                if (fx.rgb) {
                    const dx = Math.round(fx.rgb * env.k);
                    tg.setTransform(1, 0, 0, 1, 0, 0);
                    tg.globalCompositeOperation = 'source-over';
                    tg.clearRect(0, 0, PW, PH);
                    tg.drawImage(screen, 0, 0);
                    sg.globalCompositeOperation = 'multiply';
                    sg.fillStyle = '#00ffff';
                    sg.fillRect(0, 0, PW, PH);                 // keep green and blue in place
                    tg.globalCompositeOperation = 'multiply';
                    tg.fillStyle = '#ff0000';
                    tg.fillRect(0, 0, PW, PH);                 // the red plate slides
                    sg.globalCompositeOperation = 'lighter';
                    sg.drawImage(tmp, dx, 0);
                }
                if (fx.tear) {
                    tg.setTransform(1, 0, 0, 1, 0, 0);
                    tg.globalCompositeOperation = 'source-over';
                    tg.clearRect(0, 0, PW, PH);
                    tg.drawImage(screen, 0, 0);
                    sg.globalCompositeOperation = 'source-over';
                    const bands = 2 + Math.floor(frnd() * 4);
                    for (let n = 0; n < bands; n++) {
                        const r0 = Math.floor(frnd() * rows), hh = 1 + Math.floor(frnd() * 3);
                        const dx = Math.round((frnd() - 0.5) * 2 * fx.tear * 14) * Math.round(pcw);
                        const y = Math.round(r0 * pch), h = Math.round(hh * pch);
                        sg.fillStyle = inks.bg;
                        sg.fillRect(0, y, PW, h);
                        sg.drawImage(tmp, 0, y, PW, h, dx, y, PW, h);
                    }
                }
                // 4 · the tube's structure: scanlines, a slow roll bar, vignette, grain
                sg.globalCompositeOperation = 'multiply';
                sg.fillStyle = scanPattern;
                sg.fillRect(0, 0, PW, PH);
                sg.globalCompositeOperation = 'source-over';
                if (o.roll !== 0) {
                    const ry = (((T.t * (o.roll ?? 0.11)) % 1) * 1.4 - 0.2) * PH, rh = PH * 0.16;
                    const gr = sg.createLinearGradient(0, ry, 0, ry + rh);
                    gr.addColorStop(0, 'rgba(255,255,255,0)');
                    gr.addColorStop(0.5, 'rgba(255,255,255,0.022)');
                    gr.addColorStop(1, 'rgba(255,255,255,0)');
                    sg.fillStyle = gr;
                    sg.fillRect(0, ry, PW, rh);
                }
                sg.drawImage(vig, 0, 0, PW, PH);
                sg.globalCompositeOperation = 'lighter';
                sg.globalAlpha = o.grain ?? 0.035;
                sg.fillStyle = grain[f % NOISE];
                sg.save();
                sg.translate(Math.floor(frnd() * 256), Math.floor(frnd() * 256));
                sg.fillRect(-256, -256, PW + 512, PH + 512);
                sg.restore();
                sg.globalAlpha = 1;
                sg.globalCompositeOperation = 'source-over';
                if (fx.dim) {
                    sg.fillStyle = `rgba(0,0,0,${fx.dim})`;
                    sg.fillRect(0, 0, PW, PH);
                }
                g.drawImage(screen, 0, 0, env.W, env.H);
                return T;
            },
        };
        return T;
    }

    return { make, typed, printed, scramble, PAL, FONTS, FAMILY, GLYPHS, SETS, RAMPS, LEVELS };
})();
