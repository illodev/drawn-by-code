// Pixel art kit: everything is painted on a small grid of real pixels (a "screen" of,
// say, 230×230) and blown up to the output with nearest-neighbour, so every art pixel
// stays a crisp square. Global: Pixel.
//
//   const scr = Pixel.screen(230, 230);           // in setup
//   scr.clear('#97b1fd');                         // in draw: paint the frame...
//   scr.rect(10, 180, 60, 2, '#6c87d4');
//   scr.blit(Pixel.sprite(rows, pal), 40, 120);   // ...sprites from string maps...
//   scr.present(g, env);                          // ...then blow it up onto the canvas
//
// Sprites are string maps: one character per pixel, '.' (or ' ') = see-through, every
// other character looked up in a palette ({ A: '#fefefc', … } or symbols + a hex list).
// Animation is by frame index: Pixel.frame(t, 10) is the art's frame at 10 fps; loops
// are tables of drawings (Pixel.loop) so timing is authored per frame, never eased.
const Pixel = (() => {
    // '#rrggbb' or '#rrggbbaa' → 32-bit ABGR (little-endian ImageData order)
    const colCache = new Map();
    function col(hex) {
        if (typeof hex === 'number') return hex;
        let v = colCache.get(hex);
        if (v === undefined) {
            const h = hex.replace('#', '');
            const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
            const a = h.length >= 8 ? parseInt(h.slice(6, 8), 16) : 255;
            v = ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
            colCache.set(hex, v);
        }
        return v;
    }

    // Palette from { A: '#hex' } or from (symbols, ['#hex', …]).
    function palette(a, b) {
        const p = {};
        if (typeof a === 'string') [...a].forEach((ch, i) => (p[ch] = col(b[i])));
        else for (const k in a) p[k] = col(a[k]);
        return p;
    }

    // A sprite: rows of characters → { w, h, px: Uint32Array (0 = see-through) }.
    // Compiled once per (rows, palette) and cached on the rows array.
    function sprite(rows, pal) {
        if (rows.__px && rows.__pal === pal) return rows.__px;
        const h = rows.length, w = Math.max(...rows.map((r) => [...r].length));
        const px = new Uint32Array(w * h);
        rows.forEach((r, y) => {
            [...r].forEach((ch, x) => {
                if (ch !== '.' && ch !== ' ') {
                    const v = pal[ch];
                    if (v === undefined) throw new Error(`Pixel.sprite: '${ch}' is not in the palette`);
                    px[y * w + x] = v;
                }
            });
        });
        const s = { w, h, px };
        Object.defineProperty(rows, '__px', { value: s, writable: true, configurable: true });
        Object.defineProperty(rows, '__pal', { value: pal, writable: true, configurable: true });
        return s;
    }
    // The same sprite mirrored left-right (a character walking the other way).
    function flip(s) {
        if (s.__flip) return s.__flip;
        const px = new Uint32Array(s.w * s.h);
        for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) px[y * s.w + x] = s.px[y * s.w + (s.w - 1 - x)];
        s.__flip = { w: s.w, h: s.h, px, __flip: s };
        return s.__flip;
    }
    // One sprite's colours swapped ({ from: to } as hex): palette swaps, recoloured twins.
    function recolor(s, map) {
        const m = new Map(Object.entries(map).map(([a, b]) => [col(a), col(b)]));
        return { w: s.w, h: s.h, px: s.px.map((v) => m.get(v) ?? v) };
    }

    // The art's frame index at `fps` (10–12 for most pixel art), exact at frame edges.
    const frame = (t, fps = 10) => Math.floor(t * fps + 1e-6);
    // A loop authored per frame: seq = [drawing index per frame], wraps around.
    const loop = (t, seq, fps = 10, offset = 0) => seq[(((frame(t, fps) + offset) % seq.length) + seq.length) % seq.length];

    // A low-res screen: an ImageData buffer, a canvas of the same size and helpers that write
    // whole pixels (no anti-aliasing anywhere).
    function screen(w, h) {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const cx = c.getContext('2d');
        const img = cx.createImageData(w, h);
        const buf = new Uint32Array(img.data.buffer);
        const put = (x, y, v) => {
            if (x >= 0 && y >= 0 && x < w && y < h) buf[y * w + x] = v;
        };
        const S = {
            w, h, canvas: c, buf,
            clear(hex) { buf.fill(col(hex)); return S; },
            px(x, y, hex) { put(Math.round(x), Math.round(y), col(hex)); return S; },
            rect(x, y, rw, rh, hex) {
                const v = col(hex);
                x = Math.round(x); y = Math.round(y);
                for (let j = Math.max(0, y); j < Math.min(h, y + rh); j++) buf.fill(v, j * w + Math.max(0, x), j * w + Math.min(w, x + rw));
                return S;
            },
            // Bresenham: 1-pixel lines without anti-aliasing (stairs, not blur)
            line(x0, y0, x1, y1, hex) {
                const v = col(hex);
                x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
                const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
                let e = dx + dy;
                for (;;) {
                    put(x0, y0, v);
                    if (x0 === x1 && y0 === y1) break;
                    const e2 = 2 * e;
                    if (e2 >= dy) { e += dy; x0 += sx; }
                    if (e2 <= dx) { e += dx; y0 += sy; }
                }
                return S;
            },
            // filled disc on the grid (midpoint test per pixel)
            disc(cx0, cy0, r, hex) {
                const v = col(hex);
                for (let y = Math.floor(cy0 - r); y <= Math.ceil(cy0 + r); y++) {
                    for (let x = Math.floor(cx0 - r); x <= Math.ceil(cx0 + r); x++) {
                        if ((x + 0.5 - cx0) ** 2 + (y + 0.5 - cy0) ** 2 <= r * r) put(x, y, v);
                    }
                }
                return S;
            },
            // paste a sprite; opts.flip mirrors it, opts.only paints just one colour (a shadow)
            blit(s, x, y, o = {}) {
                if (o.flip) s = flip(s);
                x = Math.round(x); y = Math.round(y);
                const only = o.only !== undefined ? col(o.only) : 0;
                for (let j = 0; j < s.h; j++) {
                    const yy = y + j;
                    if (yy < 0 || yy >= h) continue;
                    for (let i = 0; i < s.w; i++) {
                        const v = s.px[j * s.w + i];
                        if (!v) continue;
                        const xx = x + i;
                        if (xx >= 0 && xx < w) buf[yy * w + xx] = only || v;
                    }
                }
                return S;
            },
            // text in the kit's 3×5 font (uppercase, digits, a few signs)
            text(str, x, y, hex, o = {}) {
                const v = col(hex), sp = o.spacing ?? 1;
                let cx0 = Math.round(x);
                for (const ch of String(str).toUpperCase()) {
                    const gl = FONT[ch] ?? FONT['?'];
                    const gw = gl[0].length;
                    gl.forEach((r, j) => [...r].forEach((b, i) => b === '#' && put(cx0 + i, Math.round(y) + j, v)));
                    cx0 += gw + sp;
                }
                return S;
            },
            textWidth(str, o = {}) {
                const sp = o.spacing ?? 1;
                return [...String(str).toUpperCase()].reduce((a, ch) => a + (FONT[ch] ?? FONT['?'])[0].length + sp, -sp);
            },
            // blow the screen up onto the (logical) canvas: nearest-neighbour, whole frame
            present(g, env, box = { x: 0, y: 0, w: env.W, h: env.H }) {
                cx.putImageData(img, 0, 0);
                g.save();
                g.imageSmoothingEnabled = false;
                g.drawImage(c, box.x, box.y, box.w, box.h);
                g.restore();
                return S;
            },
        };
        return S;
    }

    // A screen with `across` art pixels over the frame's width, in the scene's aspect.
    const fit = (env, across) => screen(across, Math.round((across * env.H) / env.W));

    // 3×5 font (space and 'I' narrower). Enough for signs, labels and small titles.
    const F = (s) => s.split('|');
    const FONT = {
        A: F('.#.|#.#|###|#.#|#.#'), B: F('##.|#.#|##.|#.#|##.'), C: F('.##|#..|#..|#..|.##'), D: F('##.|#.#|#.#|#.#|##.'),
        E: F('###|#..|##.|#..|###'), F: F('###|#..|##.|#..|#..'), G: F('.##|#..|#.#|#.#|.##'), H: F('#.#|#.#|###|#.#|#.#'),
        I: F('#|#|#|#|#'), J: F('..#|..#|..#|#.#|.#.'), K: F('#.#|#.#|##.|#.#|#.#'), L: F('#..|#..|#..|#..|###'),
        M: F('#...#|##.##|#.#.#|#...#|#...#'), N: F('#..#|##.#|#.##|#..#|#..#'), O: F('.#.|#.#|#.#|#.#|.#.'),
        P: F('##.|#.#|##.|#..|#..'), Q: F('.#.|#.#|#.#|##.|.##'), R: F('##.|#.#|##.|#.#|#.#'), S: F('.##|#..|.#.|..#|##.'),
        T: F('###|.#.|.#.|.#.|.#.'), U: F('#.#|#.#|#.#|#.#|###'), V: F('#.#|#.#|#.#|#.#|.#.'), W: F('#...#|#...#|#.#.#|##.##|#...#'),
        X: F('#.#|#.#|.#.|#.#|#.#'), Y: F('#.#|#.#|.#.|.#.|.#.'), Z: F('###|..#|.#.|#..|###'),
        0: F('###|#.#|#.#|#.#|###'), 1: F('.#|##|.#|.#|.#'), 2: F('##.|..#|.#.|#..|###'), 3: F('##.|..#|.#.|..#|##.'),
        4: F('#.#|#.#|###|..#|..#'), 5: F('###|#..|##.|..#|##.'), 6: F('.##|#..|###|#.#|###'), 7: F('###|..#|.#.|.#.|.#.'),
        8: F('###|#.#|###|#.#|###'), 9: F('###|#.#|###|..#|##.'),
        ' ': F('..|..|..|..|..'), '.': F('.|.|.|.|#'), ',': F('.|.|.|#|#'), '!': F('#|#|#|.|#'), '?': F('##.|..#|.#.|...|.#.'),
        '-': F('...|...|###|...|...'), ':': F('.|#|.|#|.'), "'": F('#|#|.|.|.'), '/': F('..#|..#|.#.|#..|#..'), '♥': F('.#.#.|#####|#####|.###.|..#..'),
    };

    return { col, palette, sprite, flip, recolor, frame, loop, screen, fit, FONT };
})();
