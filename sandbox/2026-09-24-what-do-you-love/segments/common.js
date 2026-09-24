// «what do you love?» replica · shared pieces: palette, marker text, note, paper plane,
// stars, the flower and the girl. Logical units 1000×1000.
const Sets = {};

const WL = (() => {
    const P = Paper, E = Ease;
    const COL = {
        sky: '#1e2051', band: '#2b2e65', band2: '#343b81', moon: '#efe8cd', star: '#e8cf6e',
        flower: '#d8765f', flowerDark: '#c56a55', flowerCheek: '#e98b87', eye: '#231a1f',
        house: '#3f3470', houseText: '#5b4f8a', roof: '#2a2455', town: '#1a1c46', town2: '#23255a', window: '#f0c95a',
        wall: '#f0cc51', curtain: '#df848d', frame: '#ece3c9', desk: '#c6a175', skirting: '#3c2a64',
        skin: '#e3ad8b', cheek: '#ec8e8e', hair: '#302222', clip: '#f2cf3b', sweater: '#389486', sweaterDark: '#2d7f72', collar: '#faf8f1',
        wood: '#b8895b', light: '#d3aa6a', cover: '#5b3a86', paper: '#f7f3e7', rule: '#b7c3de', margin: '#e59a8c', ink: '#3862b1',
        pot: '#c9774e', leaf: '#5aa34f', red: '#d9473b',
    };
    let kit = null;
    const init = (env) => (kit = PaperKit.make(env, { font: 'Stack' }));
    const sprite = (...a) => kit.sprite(...a);

    // --- marker text (Short Stack + a second translucent pass) -------------------------
    const widths = new Map();
    function write(g, text, x, y, size, color = COL.ink, o = {}) {
        const p = o.p ?? 1;
        if (p <= 0) return 0;
        g.save();
        g.font = `${size}px "${o.font ?? 'Stack'}"`;
        g.textBaseline = 'alphabetic';
        // o.spacing: extra letter spacing in em (hand lettering leaves gaps between letters)
        g.letterSpacing = `${(o.spacing ?? 0) * size}px`;
        const key = g.font + text + g.letterSpacing;
        if (!widths.has(key)) widths.set(key, Array.from({ length: text.length + 1 }, (_, i) => g.measureText(text.slice(0, i)).width));
        const xs = widths.get(key), total = xs[xs.length - 1];
        const x0 = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
        const shown = p * text.length;
        // o.sy: squash or stretch the lettering vertically about the baseline
        if (o.sy) (g.translate(0, y), g.scale(1, o.sy), g.translate(0, -y));
        g.beginPath();
        g.rect(x0 - size, y - size * 1.3, xs[Math.floor(shown)] + (xs[Math.min(text.length, Math.floor(shown) + 1)] - xs[Math.floor(shown)]) * (shown % 1) + size, size * 2);
        g.clip();
        g.lineJoin = 'round';
        g.lineCap = 'round';
        g.fillStyle = color;
        g.strokeStyle = color;
        g.lineWidth = size * (o.stroke ?? 0.05);
        g.globalAlpha = o.alpha ?? 0.95;
        if (o.halo) {
            // felt-tip marker: the glyph in the lighter rim colour, and inside it the glyph
            // thinned (eroded by o.core em per side) in the ink colour
            const m = g.getTransform(), k = Math.max(0.5, Math.min(6, Math.hypot(m.a, m.b)));
            const img = markerGlyphs(text, size, o.font ?? 'Stack', o.spacing ?? 0, color, o.halo, o.core ?? 0.02, o.rim ?? 0.004, Math.ceil(k * 4) / 4);
            g.globalAlpha = o.alpha ?? 1;
            g.drawImage(img.c, x0 + img.ox, y + img.oy, img.w, img.h);
        } else {
            g.fillText(text, x0, y);
            if (g.lineWidth > 0) g.strokeText(text, x0, y);
            g.globalAlpha = (o.alpha ?? 1) * 0.3;
            g.fillText(text, x0 + size * 0.015, y + size * 0.012);
        }
        g.restore();
        return total;
    }
    // The reference's hand lettering keeps «you love?» 1.21× as wide as «what do»; Patrick Hand
    // makes it 1.27×, which pushed the '?' off the page. Later lines get their letter spacing
    // adjusted to keep that ratio to the first line (ratio: null keeps the font's own).
    const LINE_RATIO = 1.21;
    function lineSpacings(g, lines, size, font, spacing, ratio = LINE_RATIO) {
        if (!ratio || lines.length < 2) return lines.map(() => spacing);
        const w0 = textW(g, lines[0], size, font, spacing);
        return lines.map((ln, i) => {
            if (i === 0) return spacing;
            return spacing + (w0 * ratio - textW(g, ln, size, font, spacing)) / (ln.length * size);
        });
    }
    // cached felt-tip lettering (see write): rendered at the drawing scale k
    const glyphCache = new Map();
    function markerGlyphs(text, size, font, spacing, color, halo, core, rim, k) {
        const key = [text, size.toFixed(2), font, spacing, color, halo, core, rim, k].join('|');
        if (glyphCache.has(key)) return glyphCache.get(key);
        const pad = size * 0.6, mk = () => document.createElement('canvas');
        const c = mk(), probe = c.getContext('2d');
        probe.font = `${size}px "${font}"`;
        probe.letterSpacing = `${spacing * size}px`;
        const w = probe.measureText(text).width + pad * 2, h = size * 1.7;
        const setup = (cv) => {
            cv.width = Math.ceil(w * k);
            cv.height = Math.ceil(h * k);
            const q = cv.getContext('2d');
            q.scale(k, k);
            q.font = `${size}px "${font}"`;
            q.letterSpacing = `${spacing * size}px`;
            q.lineJoin = 'round';
            q.lineCap = 'round';
            return q;
        };
        const q = setup(c), bx = pad, by = size * 1.2;
        q.fillStyle = q.strokeStyle = halo;
        q.lineWidth = size * rim * 2;
        q.fillText(text, bx, by);
        if (rim > 0) q.strokeText(text, bx, by);
        const cc = mk(), qc = setup(cc);
        qc.fillStyle = color;
        qc.fillText(text, bx, by);
        qc.globalCompositeOperation = 'destination-out';
        qc.lineWidth = size * core * 2;
        qc.strokeText(text, bx, by);
        q.setTransform(1, 0, 0, 1, 0, 0);
        q.drawImage(cc, 0, 0);
        const out = { c, ox: -bx, oy: -by, w: c.width / k, h: c.height / k };
        glyphCache.set(key, out);
        return out;
    }
    const textW = (g, text, size, font = 'Stack', spacing = 0) => ((g.font = `${size}px "${font}"`), (g.letterSpacing = `${spacing * size}px`), g.measureText(text).width);

    // --- lined paper (the note) -----------------------------------------------------------
    // (x, y) centre; w, h size; o.text: [line1, line2] revealed by o.p (0–1); o.circle: «you» circled
    function note(g, x, y, w, h, rot, seed, o = {}) {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        if (o.flip) g.scale(-1, 1);
        sprite('note:' + seed + w + 'x' + h + (o.torn ?? 1) + (o.rules ?? ''), { x: -w / 2 - 10, y: -h / 2 - 12, w: w + 20, h: h + 24 }, (c) => {
            // top edge torn off the spiral binding: irregular tabs, the odd deep notch where a
            // ring hole tore; the other edges hand-cut (corners slightly off, sides not straight)
            const r = P.rng(seed + 'teeth');
            const top = [];
            if (o.torn === 0) top.push([-w / 2, -h / 2], [w / 2, -h / 2]);
            else if (o.torn === 2) {
                // torn along the perforation: square tabs with notches between them
                let x = -w / 2;
                top.push([x, -h / 2 + 0.018 * h]);
                while (x < w / 2) {
                    const tab = Math.min(w / 2 - x, (0.03 + r() * 0.012) * w), gap = (0.018 + r() * 0.01) * w, up = r() * 0.008 * h;
                    top.push([x, -h / 2 + up], [x + tab, -h / 2 + up + (r() - 0.5) * 0.006 * h]);
                    x += tab;
                    if (x >= w / 2) break;
                    const deep = 0.014 * h + r() * 0.008 * h;
                    top.push([x, -h / 2 + deep], [Math.min(w / 2, x + gap), -h / 2 + deep + (r() - 0.5) * 0.008 * h]);
                    x += gap;
                }
            } else {
                let x = -w / 2;
                top.push([x, -h / 2 + 4]);
                while (x < w / 2) {
                    const step = Math.min(w / 2 - x, (0.018 + r() * 0.03) * w);
                    const deep = r() < 0.18;
                    const hgt = deep ? 0.05 * h + r() * 0.03 * h : r() * 0.03 * h;
                    top.push([x + step * 0.2, -h / 2 + hgt], [x + step * 0.8, -h / 2 + hgt]);
                    x += step;
                    top.push([x, -h / 2 + r() * 0.012 * h]);
                }
            }
            const off = () => (r() - 0.5) * Math.min(w, h) * 0.012;
            const side = (a, b, n) => Array.from({ length: n }, (_, i) => [a[0] + (b[0] - a[0]) * ((i + 1) / (n + 1)) + off(), a[1] + (b[1] - a[1]) * ((i + 1) / (n + 1)) + off()]);
            const tr = [w / 2 + off(), -h / 2 + 2], br = [w / 2 + off(), h / 2 + off()], bl = [-w / 2 + off(), h / 2 + off()];
            const outline = [...top, tr, ...side(tr, br, 3), br, ...side(br, bl, 4), bl, ...side(bl, top[0], 3)];
            P.cutout(c, outline, COL.paper, seed, {
                border: 2.2, paper: '#fffdf6', shadow: 0.22, jag: 0.6, tex: { lVar: 1.2, sVar: 1.5, alpha: [0.15, 0.35] },
                inner: (cc) => {
                    cc.strokeStyle = COL.rule;
                    cc.lineWidth = Math.max(1, h * 0.006);
                    // o.rules: [first rule, spacing] as fractions of h ; o.margin: fraction of w
                    const [r0, dr] = o.rules ?? [0.22, 0.155], mx = -w / 2 + w * (o.margin ?? 0.07);
                    for (let yy = -h / 2 + h * r0; yy < h / 2; yy += h * dr) (cc.beginPath(), cc.moveTo(-w / 2, yy), cc.lineTo(w / 2, yy), cc.stroke());
                    cc.strokeStyle = COL.margin;
                    cc.beginPath();
                    cc.moveTo(mx, -h / 2);
                    cc.lineTo(mx, h / 2);
                    cc.stroke();
                },
            });
        }, 1.5).draw(g);
        if (o.flip) g.scale(-1, 1);
        const lines = o.text ?? [];
        // text size: given, or the largest that fits the longest line in 84 % of the width
        const longest = lines.reduce((a, l) => (l.length > a.length ? l : a), '');
        const font = o.font ?? 'Hand', spacing = o.spacing ?? 0.05, size = o.size ?? Math.min(h * 0.3, (w * 0.84 * 100) / Math.max(1, textW(g, longest, 100, font, spacing)));
        // per-line letter spacing so each line keeps the reference's proportions
        const spacings = lineSpacings(g, lines, size, font, spacing, o.lineRatio);
        if (lines.length) {
            const p = o.p ?? 1, total = lines.join('').length;
            let done = 0;
            g.save();
            // back side: the text shows through, mirrored and faded (write() and
            // markerStroke() set their own alpha, so it is passed to them explicitly)
            const ink = o.flip ? 0.26 : 0.95;
            if (o.flip) g.scale(-1, 1);
            lines.forEach((ln, i) => {
                const lp = Math.max(0, Math.min(1, (p * total - done) / ln.length));
                done += ln.length;
                const lx = o.lineX?.[i] ?? -w / 2 + w * (i === 0 ? 0.16 : 0.08);
                const ly = -h / 2 + h * (o.lineY?.[i] ?? (0.42 + i * 0.3));
                write(g, ln, lx, ly, size, COL.ink, { p: lp, alpha: ink, halo: '#6389cb', font, spacing: spacings[i], core: 0.012, rim: 0.003, sy: o.sy ?? 0.92 });
                if (o.circle && i === 1 && ln.startsWith('you')) {
                    const cw = textW(g, 'you', size, font, spacings[i]);
                    const u = o.circle;
                    if (u > 0) {
                        const pts = [];
                        for (let k = 0; k <= 40 * u; k++) {
                            const a = Math.PI * 0.9 + (k / 40) * Math.PI * 2.15;
                            pts.push([lx + cw / 2 + Math.cos(a) * cw * 0.62, ly - size * 0.3 + Math.sin(a) * size * 0.46]);
                        }
                        if (pts.length > 1) P.markerStroke(g, pts, '#d65a45', size * 0.065, 'circle' + seed, ink);
                    }
                }
            });
            if (o.doodle) flowerDoodle(g, w * 0.3, h * 0.3, h * 0.1, o.doodle, ink);
            g.restore();
        }
        g.restore();
    }

    // the note as an image (cached), to put it in perspective with Motion.quad
    function noteImage(key, w, h, o = {}) {
        return sprite('noteimg:' + key + w + 'x' + h + (o.flip ? 'b' : 'f') + (o.circle ?? 0) + (o.doodle ?? 0), { x: -w / 2 - 14, y: -h / 2 - 16, w: w + 28, h: h + 32 }, (c) => note(c, 0, 0, w, h, 0, key, o), 2);
    }
    // a note turning over around its vertical axis, in perspective. u: 0 front → 1 back
    function noteFlip(g, x, y, w, h, u, key, o = {}) {
        const th = u * Math.PI, cs = Math.cos(th), sn = Math.sin(th);
        const img = noteImage(key, w, h, { ...o, flip: cs < 0 });
        const hw = (w / 2 + 14) * Math.abs(cs), hl = (h / 2 + 16) * (1 + 0.14 * sn), hr = (h / 2 + 16) * (1 - 0.14 * sn);
        const L = cs >= 0 ? [[x - hw, y - hl], [x - hw, y + hl]] : [[x - hw, y - hr], [x - hw, y + hr]];
        const Rr = cs >= 0 ? [[x + hw, y - hr], [x + hw, y + hr]] : [[x + hw, y - hl], [x + hw, y + hl]];
        if (hw < 1) return;
        Motion.quad(g, img.canvas, [L[0], Rr[0], Rr[1], L[1]], 6);
    }

    // little marker-drawn flower (the flower's signature on the note)
    // (a little spark of fat marker petals round a dot, drawn petal by petal with p)
    function flowerDoodle(g, x, y, r, p = 1, alpha = 0.9) {
        for (let k = 0; k < 9; k++) {
            if (k / 9 > p) break;
            const a = -Math.PI / 2 + (k / 9) * Math.PI * 2;
            P.markerStroke(g, [[x + Math.cos(a) * r * 0.25, y + Math.sin(a) * r * 0.25], [x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95]], '#d9533f', r * 0.26, 'doodle' + k, alpha);
        }
        if (p >= 1) {
            g.save();
            g.globalAlpha = alpha;
            g.fillStyle = '#c9412f';
            g.beginPath();
            g.arc(x, y, r * 0.28, 0, Math.PI * 2);
            g.fill();
            g.restore();
        }
    }

    // --- paper plane ----------------------------------------------------------------------
    // points towards +x; s = scale (1 ≈ 60 long)
    function plane(g, x, y, s, rot, seed = 'plane') {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(s, s);
        sprite('plane', { x: -40, y: -24, w: 76, h: 48 }, (c) => {
            P.cutout(c, [[30, 0], [-32, -18], [-18, 0], [-32, 16]], '#fbf8f0', 'plane', { border: 0, shadow: 0.25, jag: 0.4, tex: { alpha: [0.1, 0.25] } });
            P.cutout(c, [[30, 0], [-18, 0], [-26, 10]], '#dcd6c8', 'plane2', { border: 0, shadow: 0, jag: 0.3, tex: false });
            c.strokeStyle = '#b9b2a2';
            c.lineWidth = 0.8;
            c.beginPath();
            c.moveTo(30, 0);
            c.lineTo(-24, -4);
            c.stroke();
        }, 3).draw(g);
        g.restore();
    }
    // dotted trail behind a path
    function trail(g, pts, color = 'rgba(240,235,220,0.8)') {
        g.save();
        g.strokeStyle = color;
        g.lineWidth = 2.2;
        g.setLineDash([6, 8]);
        g.lineCap = 'round';
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.stroke();
        g.restore();
    }

    // --- stars and sparkles -----------------------------------------------------------------
    function star(g, x, y, r, rot = 0) {
        const s = sprite('star', { x: -12, y: -12, w: 24, h: 24 }, (c) => {
            const pts = [];
            for (let i = 0; i < 10; i++) {
                const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? 4 : 9.5;
                pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
            }
            P.cutout(c, pts, COL.star, 'star', { border: 0, shadow: 0, jag: 0.3, tex: false });
        }, 4);
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(r / 10, r / 10);
        s.draw(g);
        g.restore();
    }
    function plus(g, x, y, r, color = '#e8e2cf') {
        g.save();
        g.strokeStyle = color;
        g.lineWidth = r * 0.28;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x - r, y);
        g.lineTo(x + r, y);
        g.moveTo(x, y - r);
        g.lineTo(x, y + r);
        g.stroke();
        g.restore();
    }
    // little yellow ticks around something that shakes or shines (u: 0→1→0)
    function ticks(g, x, y, r0, r1, n, u, color = COL.star, rot = 0) {
        if (u <= 0.02) return;
        g.save();
        g.strokeStyle = color;
        g.lineCap = 'round';
        g.lineWidth = 4;
        g.globalAlpha = Math.min(1, u * 1.5);
        for (let k = 0; k < n; k++) {
            const a = rot + (k / n) * Math.PI * 2;
            const a0 = r0 + (r1 - r0) * 0.2 * u, a1 = r0 + (r1 - r0) * (0.3 + 0.7 * u);
            g.beginPath();
            g.moveTo(x + Math.cos(a) * a0, y + Math.sin(a) * a0);
            g.lineTo(x + Math.cos(a) * a1, y + Math.sin(a) * a1);
            g.stroke();
        }
        g.restore();
    }

    // «scribbled text» texture (walls, frames): rows of illegible handwriting
    function scribbleFill(c, box, color, seed, o = {}) {
        const lh = o.lineH ?? 26;
        for (let yy = box.y + lh; yy < box.y + box.h; yy += lh) P.scribble(c, box.x, yy, box.w, 1, lh, color, seed + yy, { alpha: o.alpha ?? 0.45, width: o.width ?? 1.4, scale: o.scale ?? 1.5 });
    }

    // flat marker-textured background (montage cards, walls)
    function flat(g, env, key, color, o = {}) {
        kit.paperBg(g, key, color, { bleed: o.bleed ?? 80, tex: { len: [40, 120], h: [10, 18], lVar: 2.5, alpha: [0.3, 0.6], density: 1 } });
    }

    // =====================================================================================
    // THE FLOWER (Claude): an irregular spark of rays that are alive — every ray has its own
    // length, width and angle, and lengths change on twos (every 1/12 s) like hand animation.
    // Each ray is cut ONCE (fixed torn edge) and only scaled to its length, in small steps
    // on twos, so the paper edge never re-tears (nothing boils).
    // (x, y) = centre of the face; R = typical ray length.
    // o.pose: 'free' (rays all round) | 'holding' (upper fan, arms to the note, legs)
    // o.note(g): draws the held note between the body and the hands (holding pose)
    // o.excite: >1 rays stretch (surprise), <1 they shrink (content) ; o.mouth: 'smile' | 'o'
    // | 'grin' | 'think' ; o.eyes: 'open' | 'closed' | 'happy' | 'squint' ; o.rot ; o.wiggle 0–1
    // o.arms: [[x, y], [x, y]] hand positions in R units (holding pose)
    // o.sx, o.sy: squash & stretch of the RAYS only (screen axes), the face never deforms
    // o.rayW: ray width factor ; o.spread: how unequal the ray lengths are (free pose)
    // o.face: face size factor ; o.faceTilt: the face turns on its own (sneezes, spins)
    // =====================================================================================
    function raySprite(k) {
        // a rounded ray, slightly narrower at the base and bulbous at the tip
        return sprite('ray2-' + (k % 5), { x: -8, y: -20, w: 136, h: 40 }, (c) => {
            const r = P.rng('ray2' + (k % 5));
            const pts = [];
            const len = 120, w0 = 9 + r() * 2, w1 = 12 + r() * 3;
            for (let i = 0; i <= 12; i++) pts.push([(i / 12) * (len - w1), -(w0 + (w1 - w0) * (i / 12)) + (r() - 0.5) * 1.2]);
            for (let i = 0; i <= 10; i++) {
                const a = -Math.PI / 2 + (i / 10) * Math.PI;
                pts.push([len - w1 + Math.cos(a) * w1, Math.sin(a) * w1]);
            }
            for (let i = 12; i >= 0; i--) pts.push([(i / 12) * (len - w1), w0 + (w1 - w0) * (i / 12) + (r() - 0.5) * 1.2]);
            P.cutout(c, pts, COL.flower, 'ray2' + (k % 5), { border: 2.4, shadow: 0.1, jag: 0.8, tex: { angle: 0, alpha: [0.25, 0.5], len: [14, 36] } });
        }, 3.2);
    }
    // one ray from the centre along angle a, reaching length L (R units → logical via R)
    function drawRay(g, k, a, L, w, R) {
        const sp = raySprite(k), k2 = R / 100;
        g.save();
        g.rotate(a);
        // the sprite is 120 long: scale it to exactly L (small, stepped changes → no boiling)
        // short rays get a little slimmer too, or they read as blobs
        g.scale((L * R) / 120, (w / 0.21) * k2 * 0.95 * Math.min(1, 0.45 + 0.7 * L));
        sp.draw(g);
        g.restore();
    }
    // stepped time: rays change on twos
    const twos = (t) => Math.floor(t * 12) / 12;
    function flower(g, x, y, R, o = {}) {
        const t = o.t ?? 0, tt = twos(t), wig = o.wiggle ?? 0, ex = o.excite ?? 1;
        const r = P.rng('flower-rays');
        g.save();
        g.translate(x, y);
        g.rotate((o.tilt ?? 0) + Math.sin(t * 30) * 0.04 * wig);
        const life = (k) => 1 + 0.07 * Math.sin(tt * 5.3 + k * 2.1) + 0.04 * Math.sin(tt * 8.9 + k * 0.7);
        const holding = o.pose === 'holding';
        const rays = [];
        if (holding) {
            // upper fan of 9 rays, irregular
            // a wide fan: the side rays point slightly down; thin rays with gaps between them
            for (let k = 0; k < 9; k++) {
                const a = -Math.PI - 0.32 + (k / 8) * (Math.PI + 0.64) + (r() - 0.5) * 0.1;
                const L = (0.85 + r() * 0.28 + (k === 4 ? (o.crown ?? 0.15) : 0)) * ex * life(k);
                rays.push([k, a, L, (0.13 + r() * 0.03) * (o.rayW ?? 1)]);
            }
            // legs: two short thick rays down, behind the note
            for (const sd of [-1, 1]) rays.push([10 + sd, Math.PI / 2 - sd * (o.legSpread ?? 0.3), (o.legs ?? 1.62) * life(sd + 20), 0.2 * (o.rayW ?? 1)]);
        } else {
            for (let k = 0; k < 12; k++) {
                const a = (o.rot ?? 0) + (k / 12) * Math.PI * 2 + (r() - 0.5) * 0.14 + Math.sin(t * 8 + k) * 0.03 * wig;
                const sp = o.spread ?? 0.25, L = (0.97 - sp / 2 + r() * sp) * ex * life(k);
                // squash & stretch: the ray reaches the ellipse (sx, sy) in screen axes
                const as = a + (o.tilt ?? 0), st = Math.hypot((o.sx ?? 1) * Math.cos(as), (o.sy ?? 1) * Math.sin(as));
                rays.push([k, a, L * st, (0.14 + r() * 0.03) * (o.rayW ?? 1)]);
            }
        }
        // o.frontArc: [from, to] angles (free pose) whose rays are drawn over o.note (a plane
        // caught between two rays)
        const inFront = ([, a]) => {
            if (!o.frontArc || holding) return false;
            const m = (x) => ((x % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            const [f0, f1] = o.frontArc.map(m), am = m(a);
            return f0 <= f1 ? am >= f0 && am <= f1 : am >= f0 || am <= f1;
        };
        for (const ray of rays) if (!inFront(ray)) drawRay(g, ray[0], ray[1], ray[2], ray[3], R);
        // arms (upper part) behind the note
        const arms = holding ? (o.arms ?? [[-0.5, 0.62], [0.5, 0.62]]) : [];
        const elbows = o.elbows ?? arms.map(([hx, hy]) => [hx * 0.5, hy * 0.5]);
        arms.forEach(([hx, hy], i) => {
            const [ex_, ey_] = elbows[i];
            drawRay(g, 30 + i, Math.atan2(ey_, ex_), Math.hypot(ex_, ey_) + 0.1, 0.18 * (o.rayW ?? 1), R);
        });
        // body: a soft salmon blob under the face, without a paper edge
        const bodyAndFace = () => {
            sprite('flower-body2', { x: -44, y: -44, w: 88, h: 88 }, (c) => {
                P.cutout(c, PaperDetail.spline([[-30, -8], [-18, -30], [8, -32], [30, -14], [32, 12], [14, 30], [-12, 30], [-30, 14]], 6), COL.flower, 'fbody', { border: 0, shadow: 0, jag: 0.6, tex: { alpha: [0.25, 0.5] } });
            }, 3).draw((g.save(), g.scale(R / 100, R / 100), g));
            g.restore();
            g.save();
            g.rotate(o.faceTilt ?? 0);
            face(g, R * (o.face ?? 1), o);
            g.restore();
        };
        bodyAndFace();
        g.restore();
        // the note, then forearms and round hands in front of it
        if (o.note) o.note(g);
        if (o.frontArc && !holding) {
            g.save();
            g.translate(x, y);
            g.rotate((o.tilt ?? 0) + Math.sin(t * 30) * 0.04 * wig);
            for (const ray of rays) if (inFront(ray)) drawRay(g, ray[0], ray[1], ray[2], ray[3], R);
            // the face stays on top of everything
            bodyAndFace();
            g.restore();
        }
        if (holding) {
            g.save();
            g.translate(x, y);
            g.rotate((o.tilt ?? 0) + Math.sin(t * 30) * 0.04 * wig);
            arms.forEach(([hx, hy], i) => {
                const [ex_, ey_] = elbows[i];
                const a = Math.atan2(hy - ey_, hx - ex_), L = Math.hypot(hx - ex_, hy - ey_);
                g.save();
                g.translate(ex_ * R, ey_ * R);
                drawRay(g, 32 + i, a, L, 0.2 * (o.rayW ?? 1), R);
                g.restore();
                // the hand: a round mitt of its own, gripping the corner
                const mitt = sprite('flower-mitt' + i, { x: -30, y: -30, w: 60, h: 60 }, (c) => P.cutout(c, PaperDetail.spline([[-20, -8], [-10, -20], [8, -21], [21, -8], [20, 10], [6, 20], [-10, 19], [-21, 7]], 5), COL.flower, 'mitt' + i, { border: 2.4, shadow: 0.2, tex: { alpha: [0.25, 0.5] } }), 3);
                g.save();
                g.translate(hx * R, hy * R);
                g.scale((R / 150) * (o.mitt ?? 1), (R / 150) * (o.mitt ?? 1));
                mitt.draw(g);
                g.restore();
            });
            g.restore();
        }
    }
    function face(g, R, o) {
        const k = R / 110;
        g.save();
        g.scale(k, k);
        const eyes = o.eyes ?? 'open';
        g.fillStyle = COL.flowerCheek;
        for (const s of [-1, 1]) (g.beginPath(), g.ellipse(s * 21, 8, 7, 5, 0, 0, Math.PI * 2), g.fill());
        g.strokeStyle = COL.eye;
        g.fillStyle = COL.eye;
        g.lineCap = 'round';
        g.lineWidth = 2.6;
        for (const s of [-1, 1]) {
            if (eyes === 'open') {
                g.beginPath();
                g.arc(s * 12, -4, 5, 0, Math.PI * 2);
                g.fill();
                g.fillStyle = '#fff';
                g.beginPath();
                g.arc(s * 12 + 1.6, -5.8, 1.6, 0, Math.PI * 2);
                g.fill();
                g.fillStyle = COL.eye;
            } else if (eyes === 'happy') {
                g.beginPath();
                g.arc(s * 12, -1, 4.5, Math.PI * 1.1, Math.PI * 1.9);
                g.stroke();
            } else if (eyes === 'squint') {
                // > <  (screwed shut: a sneeze, a big laugh)
                g.beginPath();
                g.moveTo(s * 15.5, -8.5);
                g.lineTo(s * 9, -4.5);
                g.lineTo(s * 15.5, -0.5);
                g.stroke();
            } else {
                g.beginPath();
                g.arc(s * 12, -6, 4.5, Math.PI * 0.15, Math.PI * 0.85);
                g.stroke();
            }
        }
        const m = o.mouth ?? 'smile';
        g.lineWidth = 2.4;
        if (m === 'o') {
            g.beginPath();
            g.ellipse(0, 9, 3.2, 3.6, 0, 0, Math.PI * 2);
            g.stroke();
        } else if (m === 'grin') {
            // open laugh: a dark D with the tongue showing at the bottom
            g.save();
            g.beginPath();
            g.moveTo(-6, 5);
            g.quadraticCurveTo(0, 4, 6, 5);
            g.quadraticCurveTo(6, 13.5, 0, 13.5);
            g.quadraticCurveTo(-6, 13.5, -6, 5);
            g.closePath();
            g.fillStyle = '#3b1d2c';
            g.fill();
            g.clip();
            g.fillStyle = '#e98b9a';
            g.beginPath();
            g.ellipse(0.4, 13.2, 4.2, 3.2, 0, 0, Math.PI * 2);
            g.fill();
            g.restore();
        } else if (m === 'wavy') {
            // unsure: a little zigzag
            g.beginPath();
            g.moveTo(-5.5, 8.5);
            g.quadraticCurveTo(-2.75, 5.5, 0, 8.5);
            g.quadraticCurveTo(2.75, 11.5, 5.5, 8.5);
            g.stroke();
        } else if (m === 'think') {
            g.beginPath();
            g.moveTo(-3, 9);
            g.lineTo(4, 7.5);
            g.stroke();
        } else {
            g.beginPath();
            g.arc(0, 4, 4.8, Math.PI * 0.15, Math.PI * 0.85);
            g.stroke();
        }
        g.restore();
    }

    // =====================================================================================
    // THE GIRL (bust behind the desk), built like the reference: every part is its own piece
    // of paper (hair back, face, fringe, clip, neck, collar, torso, upper arms, forearms,
    // hands), with knit on the sweater and brushed strands on the hair.
    // (x, y) = centre of the desk edge; s = scale (1 = the interior medium shot at 0.9).
    // o.pose: 'desk' | 'pencil' | 'throw' | 'release' | 'wave' | 'note' | 'hug' | 'pin'
    // o.eyes: 'open' | 'up' | 'closed' | 'happy' | 'surprised' ; o.mouth: 'smile' | 'o' | 'grin'
    // o.look: [dx, dy] ; o.tilt: head tilt
    // =====================================================================================
    const D = PaperDetail;
    // [shoulder, elbow, hand] per arm (left, right), desk at y = 0
    const ARMS = {
        desk: [[[-104, -236], [-178, -72], [-62, -22]], [[104, -236], [178, -72], [62, -22]]],
        pencil: [[[-104, -236], [-178, -72], [-62, -22]], [[104, -236], [212, -150], [192, -365]]],
        throw: [[[-104, -236], [-178, -72], [-62, -22]], [[104, -236], [218, -285], [292, -430]]],
        release: [[[-104, -236], [-178, -72], [-62, -22]], [[104, -236], [238, -300], [340, -415]]],
        wave: [[[-104, -236], [-178, -72], [-62, -22]], [[104, -236], [228, -232], [228, -412]]],
        note: [[[-104, -236], [-188, -88], [-132, -135]], [[104, -236], [188, -88], [132, -135]]],
        hug: [[[-104, -236], [-168, -72], [8, -150]], [[104, -236], [168, -72], [-8, -150]]],
        pin: [[[-104, -236], [-178, -72], [-62, -22]], [[104, -236], [236, -200], [267, -367]]],
    };
    const HANDS = { desk: [null, null], pencil: [null, 'fist'], throw: [null, 'fist'], release: [null, 'open'], wave: [null, 'wave'], note: ['pinch', 'pinch'], hug: ['fist', 'fist'], pin: [null, 'open'] };

    const sweaterPiece = (c, pts, seed, w = 3) => P.cutout(c, pts, COL.sweater, seed, { border: w, shadow: 0.16, tex: { alpha: [0.2, 0.4] }, inner: (cc, box) => D.knit(cc, box, COL.sweater, { seed, alpha: 0.1 }) });
    // one straight arm segment as its own cutout (cached per rounded geometry)
    function segment(g, a, b, w, seed) {
        const key = 'seg:' + seed + [a, b].map(([x, y]) => Math.round(x / 2) + ',' + Math.round(y / 2)).join(';') + w;
        const bb = P.bbox([a, b], w + 12);
        sprite(key, bb, (c) => sweaterPiece(c, P.noodle([a, b], w), seed, 2.6), 1.4).draw(g);
    }
    // o.layer: 'body' (torso and head) or 'arms' (arms, hands, pencil), so a desk can go
    // between them: the torso sinks behind the desk edge, the forearms rest on top of it
    function girl(g, x, y, s, o = {}) {
        const t = o.t ?? 0;
        const pose = o.pose ?? 'desk';
        const arms = o.arms ?? ARMS[pose];
        const body = o.layer !== 'arms', limbs = o.layer !== 'body';
        g.save();
        g.translate(x, y + Math.sin(t * 2.2) * 2);
        g.scale(s, s);
        if (body) {
        // torso with knit, then the neck, the little bow and the pointed collar
        sprite('girl-torso3', { x: -170, y: -300, w: 340, h: 310 }, (c) => {
            sweaterPiece(c, D.spline([[-104, -262], [-40, -284], [40, -284], [104, -262], [130, -190], [146, 0], [-146, 0], [-130, -190]], 6), 'torso');
        }, 1.4).draw(g);
        sprite('girl-neck2', { x: -50, y: -345, w: 100, h: 90 }, (c) => {
            P.cutout(c, P.roundRect(-22, -338, 44, 70, 12), COL.skin, 'neck', { border: 0, shadow: 0, tex: { alpha: [0.12, 0.25] } });
        }, 1.6).draw(g);
        sprite('girl-collar', { x: -110, y: -300, w: 220, h: 80 }, (c) => {
            P.cutout(c, [[-4, -276], [-86, -286], [-66, -238]], COL.collar, 'collarL', { border: 1.8, shadow: 0.18 });
            P.cutout(c, [[4, -276], [86, -286], [66, -238]], COL.collar, 'collarR', { border: 1.8, shadow: 0.18 });
            P.cutout(c, D.spline([[-12, -284], [0, -278], [12, -284], [10, -270], [0, -274], [-10, -270]], 4), '#f2a7ae', 'bow', { border: 1.2, shadow: 0.15 });
        }, 1.6).draw(g);
        if (o.layer === 'body') head(g, o);
        }
        // arms: upper arm, forearm (each its own piece), hand
        if (limbs) for (let i = 0; i < 2; i++) {
            const [sh, el, hd] = arms[i];
            segment(g, sh, el, 54, 'upper' + i);
            segment(g, el, hd, 50, 'fore' + i);
            const hp = (o.hands ?? HANDS[pose] ?? [null, null])[i];
            if (hp) {
                const rot = Math.atan2(hd[1] - el[1], hd[0] - el[0]) + Math.PI / 2;
                D.hand(g, hd[0], hd[1], 58, rot, hp, { skin: COL.skin, mirror: i === 0 });
            }
        }
        if (limbs && pose === 'pencil') {
            const [hx, hy] = arms[1][2];
            P.markerStroke(g, [[hx - 4, hy - 20], [hx - 16, hy - 92]], '#3862b1', 11, 'pencil', 1);
        }
        if (!o.layer) head(g, o);
        g.restore();
    }
    function head(g, o) {
        g.save();
        g.translate(0, -415);
        g.rotate(o.tilt ?? 0);
        g.scale(1.16, 1.16);
        // hair: the back piece (a bob that reaches the jaw and turns in) with brushed strands
        sprite('girl-hair', { x: -140, y: -145, w: 280, h: 250 }, (c) => {
            P.cutout(c, D.spline([[-118, 80], [-128, 0], [-116, -84], [-76, -124], [0, -134], [76, -124], [116, -84], [128, 0], [118, 80], [94, 94], [72, 72], [-72, 72], [-94, 94]], 8), COL.hair, 'hairback', { border: 3, shadow: 0.18, tex: false, inner: (cc, box) => D.strands(cc, box, COL.hair, { seed: 'hairback', angle: Math.PI / 2 }) });
        }, 1.6).draw(g);
        // face: an egg, narrower than the bob (measured 195 against 285), round full chin
        sprite('girl-face2', { x: -100, y: -115, w: 200, h: 235 }, (c) => {
            P.cutout(c, D.spline([[-74, -66], [-48, -98], [0, -106], [48, -98], [74, -66], [84, -8], [78, 48], [48, 92], [0, 108], [-48, 92], [-78, 48], [-84, -8]], 8), COL.skin, 'face2', { border: 2.6, shadow: 0.12, tex: { alpha: [0.12, 0.25] } });
        }, 1.6).draw(g);
        // fringe: its own piece, asymmetric edge across the forehead
        sprite('girl-fringe2', { x: -125, y: -150, w: 250, h: 150 }, (c) => {
            P.cutout(c, D.spline([[-106, -8], [-108, -78], [-64, -122], [0, -132], [62, -122], [104, -84], [108, -40], [88, -44], [58, -58], [26, -64], [0, -58], [-28, -44], [-58, -26], [-84, -12]], 8), COL.hair, 'fringe2', { border: 2.4, shadow: 0.2, tex: false, inner: (cc, box) => D.strands(cc, box, COL.hair, { seed: 'fringe', angle: Math.PI * 0.42 }) });
            P.cutout(c, P.roundRect(-30, -10, 60, 20, 6).map(([px, py]) => [px * Math.cos(-0.42) - py * Math.sin(-0.42) + 50, px * Math.sin(-0.42) + py * Math.cos(-0.42) - 86]), COL.clip, 'clip', { border: 1.8, shadow: 0.15 });
        }, 1.6).draw(g);
        // cheeks and a tiny nose
        g.fillStyle = COL.cheek;
        for (const sd of [-1, 1]) (g.beginPath(), g.ellipse(sd * 52, 30, 20, 19, 0, 0, Math.PI * 2), g.fill());
        g.strokeStyle = PaperDetail.shade(COL.skin, -18);
        g.lineWidth = 3;
        g.lineCap = 'round';
        g.beginPath();
        g.arc(0, 20, 5, Math.PI * 0.2, Math.PI * 0.8);
        g.stroke();
        // eyes and brows
        const eyes = o.eyes ?? 'open', look = o.look ?? [0, 0];
        g.strokeStyle = COL.eye;
        g.fillStyle = COL.eye;
        g.lineWidth = 4.5;
        for (const sd of [-1, 1]) {
            const ex = sd * 34, ey = -4;
            if (eyes === 'closed') {
                g.lineWidth = 5;
                g.beginPath();
                g.moveTo(ex - sd * 11, ey - 2);
                g.lineTo(ex + sd * 12, ey + 1);
                g.stroke();
            } else if (eyes === 'happy') {
                g.beginPath();
                g.arc(ex, ey + 6, 12, Math.PI * 1.15, Math.PI * 1.85);
                g.stroke();
            } else if (eyes === 'up') {
                g.fillStyle = '#fbf6ec';
                g.beginPath();
                g.arc(ex, ey, 13, 0, Math.PI * 2);
                g.fill();
                g.lineWidth = 2.5;
                g.stroke();
                g.fillStyle = COL.eye;
                g.beginPath();
                g.arc(ex + look[0] * 4, ey - 5, 6.5, 0, Math.PI * 2);
                g.fill();
            } else {
                g.beginPath();
                g.arc(ex + look[0] * 4, ey + look[1] * 4, 8, 0, Math.PI * 2);
                g.fill();
                g.fillStyle = '#fff';
                g.beginPath();
                g.arc(ex + look[0] * 4 + 2.5, ey + look[1] * 4 - 3, 2.6, 0, Math.PI * 2);
                g.fill();
                g.fillStyle = COL.eye;
            }
            // brows: short strokes, raised when surprised
            g.lineWidth = 4.2;
            const by = eyes === 'surprised' ? -36 : -30;
            g.beginPath();
            g.moveTo(ex - 12, by + (eyes === 'surprised' ? 4 : 1) * 1);
            g.quadraticCurveTo(ex, by - (eyes === 'surprised' ? 6 : 3), ex + 12, by + 2);
            g.stroke();
            g.lineWidth = 4.5;
        }
        // mouth
        const m = o.mouth ?? 'smile';
        g.lineWidth = 4.5;
        if (m === 'o') {
            g.fillStyle = COL.eye;
            g.beginPath();
            g.ellipse(0, 50, 8, 10, 0, 0, Math.PI * 2);
            g.fill();
        } else if (m === 'grin') {
            g.fillStyle = '#2a1a1e';
            g.beginPath();
            g.moveTo(-21, 40);
            g.quadraticCurveTo(0, 46, 21, 40);
            g.quadraticCurveTo(10, 64, 0, 64);
            g.quadraticCurveTo(-10, 64, -21, 40);
            g.closePath();
            g.fill();
        } else {
            g.beginPath();
            g.arc(0, 30, 18, Math.PI * 0.22, Math.PI * 0.78);
            g.stroke();
        }
        g.restore();
    }

    // a sleeve (arm strip with knit) from a 3-point path, cached per rounded geometry
    function tube(g, pts, w, color, seed) {
        const key = 'tube:' + seed + pts.map(([a, b]) => Math.round(a / 2) + ',' + Math.round(b / 2)).join(';') + w;
        const bb = P.bbox(pts, w + 12);
        sprite(key, bb, (c) => {
            P.cutout(c, P.noodle(P.bezier(pts[0], pts[1], pts[1], pts[2], 16), w, w * 0.9), color, seed, { border: 2.6, shadow: 0.15, jag: 0.7, tex: { alpha: [0.2, 0.4] }, inner: (cc, box) => D.knit(cc, box, color, { seed, size: 9 * w / 70 }) });
        }, 1.4).draw(g);
    }
    // a detailed paper hand: size r ≈ palm radius (as the old round hands), rot in radians
    // o: extra PaperDetail.hand options (part: 'back' | 'front' to put a held note between)
    function hand(g, x, y, r, rot = 0, pose = 'pinch', mirror = false, o = {}) {
        D.hand(g, x, y, r * 1.9, rot, pose, { skin: COL.skin, mirror, ...o });
    }

    // The writing hand of the notepad shots, traced from the reference close-up (3.4 s): a fist
    // seen from the back holding a blue marker. Back of the hand, four curled fingers (each its
    // own piece, each overlapping the next), the thumb lying across them, the marker through
    // the fist (tip and labelled cap showing), a ribbed cuff and the knitted sleeve.
    // Authored in the reference crop's pixels with the marker tip at GRIP.tip and the forearm
    // along GRIP.axis; drawn at GRIP.k logical units per crop pixel (the wide shot's scale).
    const GRIP = { tip: [25, 545], wrist: [640, 500], axis: Math.atan2(-0.87, -0.48), k: 0.2067 };
    const capsule = (a, b, r) => P.noodle([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], b], 2 * r, 2 * r);
    function writingHand(g, tip, base, o = {}) {
        const ang = Math.atan2(tip[1] - base[1], tip[0] - base[0]) - GRIP.axis, k = GRIP.k * (o.scale ?? 1);
        // the sleeve: one fixed strip from the wrist back to the elbow (never re-cut)
        const sleeve = sprite('grip-sleeve2', { x: -30, y: -300, w: 4860, h: 600 }, (c) => {
            P.cutout(c, P.roundRect(0, -272, 4800, 544, 60), '#389082', 'gripsleeve', { border: 4, shadow: 0.15, jag: 1, step: 3, tex: { alpha: [0.2, 0.4], len: [60, 160], h: [20, 36] }, inner: (cc, box) => D.knit(cc, box, '#389082', { seed: 'gripknit', size: 36, alpha: 0.16 }) });
        }, 0.3);
        const hand = sprite('grip-hand2', { x: -40, y: -60, w: 1040, h: 900 }, (c) => {
            const cut = (pts, col, seed, oo = {}) => P.cutout(c, pts, col, seed, { border: 4, shadow: 0.14, jag: 1.1, step: 3, tex: { alpha: [0.15, 0.3] }, ...oo });
            // marker: body from the tip to the cap, white label bands
            const T = [25, 545], d = [0.785, -0.62], n = [0.62, 0.785];
            const at = (s, w) => [T[0] + d[0] * s + n[0] * w, T[1] + d[1] * s + n[1] * w];
            cut(capsule(at(40, 0), at(820, 0), 50), '#375eaf', 'gripmarker', { border: 3 });
            const band = (s0, s1) => [at(s0, -50), at(s1, -50), at(s1, 50), at(s0, 50)];
            cut(band(150, 215), '#dde6f3', 'griplabel1', { border: 0, shadow: 0 });
            cut(band(655, 790), '#dde6f3', 'griplabel2', { border: 0, shadow: 0, inner: (cc) => {
                cc.strokeStyle = '#2f4f9a';
                cc.lineWidth = 9;
                cc.lineCap = 'round';
                cc.beginPath();
                const [ax, ay] = at(690, -18), [bx, by] = at(716, 18), [ex, ey] = at(760, -30);
                cc.moveTo(ax, ay);
                cc.lineTo(bx, by);
                cc.lineTo(ex, ey);
                cc.stroke();
            } });
            // back of the hand
            cut(D.spline([[240, 470], [300, 410], [420, 300], [560, 170], [650, 100], [760, 185], [822, 268], [836, 340], [800, 386], [620, 480], [410, 612], [335, 592], [252, 522]], 8), '#d5a484', 'gripback');
            // fingers, top one first: each overlaps the next
            [[[400, 72], [522, 208], 56], [[300, 142], [430, 290], 58], [[210, 222], [330, 350], 56], [[160, 330], [236, 420], 52]]
                .forEach(([a, b, r], i) => cut(capsule(a, b, r), '#e4b291', 'gripfinger' + i));
            // thumb across the fingers
            cut(capsule([482, 356], [742, 258], 56), '#e6b595', 'gripthumb');
            // ribbed cuff
            cut(D.spline([[398, 612], [630, 484], [862, 356], [908, 438], [951, 518], [719, 646], [487, 774], [442, 694]], 5), '#328274', 'gripcuff', {
                border: 3, inner: (cc, box) => {
                    cc.strokeStyle = D.shade('#328274', -8);
                    cc.globalAlpha = 0.6;
                    cc.lineWidth = 9;
                    for (let s = -800; s < 1200; s += 36) {
                        cc.beginPath();
                        cc.moveTo(s, 200);
                        cc.lineTo(s + 0.48 * 900, 200 + 0.87 * 900);
                        cc.stroke();
                    }
                    cc.globalAlpha = 1;
                },
            });
        }, 0.3);
        g.save();
        g.translate(tip[0], tip[1]);
        g.rotate(ang);
        g.scale(k, k);
        g.translate(-GRIP.tip[0], -GRIP.tip[1]);
        // sleeve from the cuff down along the forearm axis (pointing away from the fist)
        g.save();
        g.translate(700, 620);
        g.rotate(GRIP.axis + Math.PI);
        sleeve.draw(g);
        g.restore();
        hand.draw(g);
        g.restore();
    }

    // Mitten hand seen from the back, as in the tear shot: a domed mitten, the thumb its own
    // piece on the inner side, a ribbed cuff and a knitted sleeve running off towards `toward`.
    // (x, y) = centre of the mitten; size ≈ its width; mirror for the right hand.
    function mitten(g, x, y, size, toward, mirror = false) {
        const k = size / 110, ang = Math.atan2(toward[1] - y, toward[0] - x) - Math.PI / 2;
        const m = sprite('mitten2', { x: -80, y: -80, w: 170, h: 190 }, (c) => {
            P.cutout(c, D.spline([[42, 2], [66, -10], [80, 6], [72, 30], [48, 40]], 6), D.shade(COL.skin, -3), 'mitthumb', { border: 2.4, shadow: 0.12, tex: { alpha: [0.12, 0.25] } });
            P.cutout(c, D.spline([[-50, 44], [-58, -6], [-46, -52], [-4, -66], [36, -54], [52, -12], [48, 44]], 7), COL.skin, 'mitpalm', { border: 2.6, shadow: 0.15, tex: { alpha: [0.12, 0.25], angle: -1.2 } });
            P.cutout(c, D.spline([[42, 4], [66, -8], [78, 8], [70, 28], [50, 36]], 6), D.shade(COL.skin, -2), 'mitthumb2', { border: 2, shadow: 0.08, tex: { alpha: [0.12, 0.25] } });
        }, 2.2);
        const cuff = sprite('mitcuff', { x: -80, y: 20, w: 160, h: 90 }, (c) => {
            P.cutout(c, P.roundRect(-62, 34, 124, 50, 8), COL.sweaterDark, 'mitcuff', { border: 2.4, shadow: 0.18, inner: (cc, box) => D.rib(cc, box, COL.sweaterDark, { step: 11, width: 4 }) });
        }, 2.2);
        const sleeve = sprite('mitsleeve', { x: -90, y: 60, w: 180, h: 760 }, (c) => {
            P.cutout(c, P.roundRect(-78, 70, 156, 720, 30), '#389082', 'mitsleeve', { border: 2.6, shadow: 0.15, tex: { alpha: [0.2, 0.4] }, inner: (cc, box) => D.knit(cc, box, '#389082', { seed: 'mitknit', size: 14, alpha: 0.18 }) });
        }, 1.6);
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        g.scale(mirror ? -k : k, k);
        sleeve.draw(g);
        cuff.draw(g);
        g.restore();
        g.save();
        g.translate(x, y);
        g.rotate(ang * 0.35);
        g.scale(mirror ? -k : k, k);
        m.draw(g);
        g.restore();
    }

    // where a girl's hand ends up on screen (i: 0 left, 1 right), for props held in it
    const girlHand = (pose, i, x = 510, y = 915, s = 0.9) => [x + ARMS[pose][i][2][0] * s, y + ARMS[pose][i][2][1] * s];

    return { COL, init, lineSpacings, writingHand, mitten, girlHand, noteImage, noteFlip, get kit() { return kit; }, sprite, write, textW, note, flowerDoodle, plane, trail, star, plus, ticks, scribbleFill, flat, flower, girl, ARMS, hand, tube };
})();
