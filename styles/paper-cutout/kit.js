// High-level pieces of the paper-cutout style (text, backgrounds, sheets, props, grain).
// Use it in setup():  env.state.kit = PaperKit.make(env, { font: 'Hand' })
// Depends on engine/core.js and paper.js.
const PaperKit = (() => {
    const P = Paper, E = Ease;

    // Default palette: dark muted background, saturated pieces (wood, cream, mint, orange).
    // Change it per scene, but keep the idea: dark, muted background, vivid pieces.
    const COL = {
        ink: '#2a1826', wall: '#3a2146', glow: '#4f2b55', wood: '#b8814f', woodDark: '#96643a',
        cream: '#f4ecda', paper: '#f4eddd', mint: '#6cc9a1', mintDark: '#4fa983', orange: '#f2643c',
        red: '#d9412f', yellow: '#e9b949', lilac: '#b98ad0', textInk: '#33306e', rule: '#a9b9d8', margin: '#e58a78',
    };

    function make(env, { font = 'Hand' } = {}) {
        const { W, H, k } = env;
        // sprite cached at output resolution (k = px per logical unit)
        const sprite = (key, box, draw, res = 1.3) => Motion.sprite(key, box, k * res, draw);

        // Handwritten text that writes itself letter by letter (p from 0 to 1). Each letter
        // wobbles a little, always the same way (seed = the text), with a second ink pass.
        const letterW = new Map();
        function hand(g, text, x, y, size, color, o = {}) {
            const p = o.p ?? 1;
            if (p <= 0) return 0;
            g.font = `${o.weight ? o.weight + ' ' : ''}${size}px "${o.font ?? font}"`;
            g.fillStyle = color;
            g.textBaseline = 'alphabetic';
            const key = g.font + '|' + text;
            if (!letterW.has(key)) {
                const xs = [];
                for (let i = 0; i <= text.length; i++) xs.push(g.measureText(text.slice(0, i)).width);
                letterW.set(key, xs);
            }
            const xs = letterW.get(key);
            const total = xs[xs.length - 1];
            const x0 = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
            const shown = p * text.length;
            const r = P.rng('hand' + text);
            for (let i = 0; i < text.length; i++) {
                const dy = (r() - 0.5) * size * 0.05, rot = (r() - 0.5) * 0.05;
                if (i > shown) break;
                const frac = Math.min(1, shown - i);
                g.save();
                if (frac < 1) {
                    g.beginPath();
                    g.rect(x0 + xs[i] - 2, y - size * 1.2, (xs[i + 1] - xs[i]) * frac + 2, size * 1.8);
                    g.clip();
                }
                g.translate(x0 + xs[i], y + dy);
                g.rotate(rot);
                g.globalAlpha = o.alpha ?? 0.94;
                g.fillText(text[i], 0, 0);
                g.globalAlpha = (o.alpha ?? 1) * 0.25;
                g.fillText(text[i], size * 0.018, size * 0.012);
                g.restore();
            }
            return total;
        }
        const textW = (g, text, size, f = font) => ((g.font = `${size}px "${f}"`), g.measureText(text).width);

        // Written text + a marker underline drawn right after it.
        function title(g, t, t0, text, x, y, size, color = COL.cream, under = COL.orange, o = {}) {
            const p = E.seg(t, t0, t0 + (o.dur ?? 0.5));
            if (p <= 0) return;
            hand(g, text, x, y, size, color, { p, align: o.align });
            const w = textW(g, text, size);
            const xs = o.align === 'center' ? x - w / 2 : x;
            const u = E.seg(t, t0 + (o.dur ?? 0.5) * 0.7, t0 + (o.dur ?? 0.5) * 1.3);
            if (u > 0) P.markerStroke(g, [[xs - 4, y + size * 0.3], [xs - 4 + (w + 8) * u, y + size * 0.33]], under, size * 0.11, 'tl' + text, 0.9);
        }

        // Onomatopoeia that pops, rises and fades in 0.45 s ("whoosh!", "click!").
        function sfxWord(g, t, at, text, x, y, size = 54, color = COL.ink) {
            const u = E.seg(t, at, at + 0.45);
            if (u <= 0 || u >= 1) return;
            g.save();
            g.globalAlpha = 1 - u * u;
            g.translate(x, y - u * 30);
            const s = 0.8 + E.back(Math.min(1, u * 3)) * 0.3;
            g.scale(s, s);
            hand(g, text, 0, 0, size, color, { align: 'center' });
            g.restore();
        }

        // Full-bleed marker-painted paper background (cached).
        // `bleed` = extra margin on each side: raise it if the camera moves or zooms out
        // (otherwise the empty canvas shows at the edge; review.mjs flags it as "gaps").
        function paperBg(g, key, color, o = {}) {
            const b = o.bleed ?? 400;
            sprite('bg:' + key + color + b, { x: -b, y: -b, w: W + 2 * b, h: H + 2 * b }, (c) => {
                c.fillStyle = color;
                c.fillRect(-b, -b, W + 2 * b, H + 2 * b);
                P.marker(c, { x: -b - 40, y: -b - 20, w: W + 2 * b + 80, h: H + 2 * b + 40 }, color, key, { len: [60, 170], h: [12, 24], lVar: 3, alpha: [0.35, 0.7], density: 1.1, ...o.tex });
                if (o.wallpaper) for (let row = 0; row < (H + 2 * b) / 42 + 2; row++) P.scribble(c, -b, -b + 20 + row * 42, W + 2 * b, 1, 42, o.wallpaper, key + 'w' + row, { alpha: 0.28, width: 1.3, scale: 1.4 });
            }, 1.2).draw(g);
        }

        // Halo behind the main character (a lighter circle).
        function glow(g, x, y, r, color = COL.glow) {
            const s = sprite('glow:' + r + color, { x: -r - 10, y: -r - 10, w: 2 * r + 20, h: 2 * r + 20 }, (c) => {
                P.cutout(c, P.ellipse(0, 0, r, r), color, 'glow' + r, { border: 0, shadow: 0, jag: 0.6, tex: { alpha: [0.2, 0.45] } });
            });
            g.save();
            g.translate(x, y);
            s.draw(g);
            g.restore();
        }

        // Sheet with scribbled lines (the "text" nobody needs to read).
        function sheet(g, x, y, w, h, rot, seed, o = {}) {
            g.save();
            g.translate(x, y);
            g.rotate(rot);
            sprite('sheet:' + seed + w + 'x' + h, { x: -w / 2 - 8, y: -h / 2 - 8, w: w + 16, h: h + 16 }, (c) => {
                P.cutout(c, P.roundRect(-w / 2, -h / 2, w, h, 3), o.color ?? COL.paper, seed, {
                    border: 2.4, paper: '#fffaf0', shadow: 0.25, jag: 0.7, tex: { lVar: 1.6, sVar: 2, alpha: [0.2, 0.45] },
                    inner: (cc) => {
                        if (o.lined) {
                            cc.strokeStyle = COL.rule;
                            cc.lineWidth = 1.2;
                            for (let yy = -h / 2 + h * 0.2; yy < h / 2; yy += h * 0.16) (cc.beginPath(), cc.moveTo(-w / 2, yy), cc.lineTo(w / 2, yy), cc.stroke());
                            cc.strokeStyle = COL.margin;
                            cc.beginPath();
                            cc.moveTo(-w / 2 + w * 0.08, -h / 2);
                            cc.lineTo(-w / 2 + w * 0.08, h / 2);
                            cc.stroke();
                        }
                        if (o.title) {
                            cc.font = `${Math.round(h * 0.12)}px "${font}"`;
                            cc.fillStyle = o.titleColor ?? '#6d4a7a';
                            cc.fillText(o.title, -w / 2 + w * 0.08, -h / 2 + h * 0.17);
                        }
                        if (o.rows !== 0) P.scribble(cc, -w / 2 + w * 0.08, -h / 2 + h * (o.title ? 0.32 : 0.18), w * 0.84, o.rows ?? 4, h * 0.13, '#8b7f96', seed + 's', { alpha: 0.55, scale: h / 110 });
                    },
                });
            }, o.res ?? 1.6).draw(g);
            g.restore();
        }

        // Shopping receipt with a zigzag bottom edge.
        function ticket(g, x, y, s, rot, seed) {
            g.save();
            g.translate(x, y);
            g.rotate(rot);
            g.scale(s, s);
            sprite('ticket:' + seed, { x: -34, y: -60, w: 68, h: 120 }, (c) => {
                const zig = [];
                for (let i = 0; i <= 8; i++) zig.push([-26 + i * 6.5, 52 + (i % 2 ? 5 : 0)]);
                P.cutout(c, [[-26, -52], [26, -52], ...zig.reverse()], '#f7f3ea', seed, {
                    border: 2, shadow: 0.25, tex: { lVar: 1.2, alpha: [0.2, 0.4] },
                    inner: (cc) => P.scribble(cc, -20, -36, 40, 7, 11, '#7d7390', seed + 's', { alpha: 0.6, scale: 0.7 }),
                });
            }, 2 * s).draw(g);
            g.restore();
        }

        // Steam/smoke wisp in tissue paper: a ribbon that starts very thin, widens,
        // drifts towards `drift` (−1 left, 1 right), undulates and ends in a pointed curl.
        // Two layers: a wide faint halo + a denser core, translucent, no white edge.
        // Returns a fixed sprite with its origin at the base: animate it by moving it, never
        // by deforming it (see style-paper-cutout/SKILL.md).
        function wisp(seed, { len = 380, width = 16, drift = 1, color = COL.cream } = {}) {
            return sprite('wisp:' + seed + len + width + drift, { x: -len * 0.6, y: -len * 1.15, w: len * 1.2, h: len * 1.2 }, (c) => {
                const r = P.rng('wisp' + seed);
                const ph = r() * 6.28, waves = 1.4 + r() * 0.8, lean = (0.25 + r() * 0.25) * drift;
                const pts = [];
                for (let u = 0; u <= 1.0001; u += 0.02) {
                    const amp = len * (0.012 + 0.07 * u);
                    pts.push([lean * len * Math.pow(u, 1.6) + Math.sin(u * Math.PI * 2 * waves + ph) * amp, -u * len * 0.92]);
                }
                // final curl: keeps turning towards the drift side, with a shrinking radius
                let [x, y] = pts[pts.length - 1];
                const [px, py] = pts[pts.length - 2];
                let a = Math.atan2(y - py, x - px), step = len * 0.028;
                const curl = 0.28 * drift * (r() < 0.5 ? 1 : 0.8);
                for (let j = 0; j < 16; j++) {
                    a += curl;
                    step *= 0.9;
                    x += Math.cos(a) * step;
                    y += Math.sin(a) * step;
                    pts.push([x, y]);
                }
                const n = pts.length;
                const ribbon = (wMax) => {
                    const L = [], R = [];
                    for (let i = 0; i < n; i++) {
                        const u = i / (n - 1);
                        const w = (wMax * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.7)), 0.8) + 0.4) / 2;
                        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
                        const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
                        L.push([pts[i][0] - (dy / d) * w, pts[i][1] + (dx / d) * w]);
                        R.push([pts[i][0] + (dy / d) * w, pts[i][1] - (dx / d) * w]);
                    }
                    return [...L, ...R.reverse()];
                };
                c.globalAlpha = 0.35;
                P.cutout(c, ribbon(width * 2.2), color, seed + 'halo', { border: 0, shadow: 0, jag: 0.8, tex: { alpha: [0.1, 0.25] } });
                c.globalAlpha = 0.6;
                P.cutout(c, ribbon(width * 0.9), color, seed + 'nucleo', { border: 0, shadow: 0, jag: 0.5, tex: { alpha: [0.15, 0.3] } });
                c.globalAlpha = 1;
            }, 1.6);
        }

        // Paper grain on top of everything: use it in post(ctx) (pixel coordinates).
        const grain = P.grainTile(Math.round(256 * Math.max(1, k)), 'grain', 24);
        function grainPost(ctx, alpha = 0.5) {
            ctx.globalCompositeOperation = 'overlay';
            ctx.globalAlpha = alpha;
            ctx.fillStyle = ctx.createPattern(grain, 'repeat');
            ctx.fillRect(0, 0, env.px[0], env.px[1]);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        return { COL, sprite, hand, textW, title, sfxWord, paperBg, glow, sheet, ticket, wisp, grainPost };
    }

    return { COL, make };
})();
