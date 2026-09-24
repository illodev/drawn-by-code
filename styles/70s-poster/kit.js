// 70s poster style kit (Fillmore / Yellow Submarine psychedelia): flat acid colors,
// thick outlines, concentric echoes, sunbursts, undulating shapes and melting letters.
// Global: Groovy. Depends on engine/core.js.
const Groovy = (() => {
    const E = Ease;
    // Palettes: always a dark ink + 4–5 acid colors that clash with each other.
    const PAL = {
        acid: { ink: '#2a0f35', c: ['#ff6a13', '#ff2e88', '#c6ff2e', '#7a2cff', '#ffd23f', '#18d6c4'] },
        sunset: { ink: '#3b0d1f', c: ['#ffb000', '#ff5a1f', '#e8175d', '#a4133c', '#fff1c1'] },
        submarine: { ink: '#10213a', c: ['#ffde00', '#ff7aa2', '#00b8d9', '#7ce05b', '#ff5e3a'] },
    };

    // Alternating sunburst rays from (cx, cy), full bleed.
    function sunburst(g, env, cx, cy, n, rot, colors) {
        const R = Math.hypot(env.W, env.H) * 1.2;
        for (let i = 0; i < n; i++) {
            const a0 = rot + (i / n) * Math.PI * 2, a1 = rot + ((i + 1) / n) * Math.PI * 2;
            g.fillStyle = colors[i % colors.length];
            g.beginPath();
            g.moveTo(cx, cy);
            g.arc(cx, cy, R, a0, a1 + 0.002);
            g.closePath();
            g.fill();
        }
    }

    // Undulating concentric rings (a "waves" background or a hypnotic target).
    function rings(g, cx, cy, n, step, t, colors, wob = 0.08) {
        for (let i = n; i > 0; i--) {
            g.fillStyle = colors[i % colors.length];
            g.beginPath();
            const r = i * step;
            for (let k = 0; k <= 96; k++) {
                const a = (k / 96) * Math.PI * 2;
                const rr = r * (1 + Math.sin(a * 5 + t * 2 + i * 0.7) * wob);
                g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
            }
            g.fill();
        }
    }

    // Offsets a closed outline along its normal with a wave: the shape "breathes".
    // It is a smooth function of t (no noise), so it doesn't jitter: it undulates.
    function wavy(pts, amp, freq, phase) {
        const n = pts.length;
        return pts.map((p, i) => {
            const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
            const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
            const o = Math.sin((i / n) * Math.PI * 2 * freq + phase) * amp;
            return [p[0] + (dy / d) * o, p[1] - (dx / d) * o];
        });
    }

    const path = (g, pts) => {
        g.beginPath();
        g.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
        g.closePath();
    };

    // Flat shape with a thick outline and, optionally, echoes: rings of color
    // around the outline (the hallmark of the 70s poster).
    function shape(g, pts, fill, o = {}) {
        const { ink = '#2a0f35', width = 6, echoes = [], echoStep = 10 } = o;
        g.lineJoin = 'round';
        // from outside in: each echo is a color band with its own ink rim
        for (let i = echoes.length; i > 0; i--) {
            const w = width + i * echoStep * 2;
            path(g, pts);
            g.strokeStyle = ink;
            g.lineWidth = w + width * 0.8;
            g.stroke();
            path(g, pts);
            g.strokeStyle = echoes[i - 1];
            g.lineWidth = w;
            g.stroke();
        }
        path(g, pts);
        g.fillStyle = fill;
        g.fill();
        if (width > 0) {
            g.strokeStyle = ink;
            g.lineWidth = width;
            g.stroke();
        }
    }

    function ellipse(cx, cy, rx, ry, n = 72, a0 = 0, a1 = Math.PI * 2) {
        const out = [];
        for (let i = 0; i <= n; i++) {
            const a = a0 + ((a1 - a0) * i) / n;
            out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
        }
        return out;
    }

    // Thick ink stroke (arms, mouths, curls).
    function line(g, pts, color, width) {
        g.strokeStyle = color;
        g.lineWidth = width;
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.beginPath();
        g.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
        g.stroke();
    }

    /**
     * Melting poster lettering. The text is painted once (with outline and echo) into
     * a sprite; then it is drawn in thin vertical strips and each strip drops according to a
     * fixed drip profile (seed) × `melt` (0 = intact, 1 = dripped). `wave` makes it
     * undulate with t. The drops stay hanging: it reads as paint, not as a fade.
     */
    function melt(g, env, text, x, y, size, o = {}) {
        const { t = 0, melt: m = 0, wave = 0, fill = '#ffd23f', ink = '#2a0f35', echo = '#ff2e88', font = 'Shrikhand', seed = text } = o;
        const probe = document.createElement('canvas').getContext('2d');
        probe.font = `${size}px "${font}"`;
        const w = probe.measureText(text).width + size * 0.6, h = size * 1.6;
        const box = { x: -w / 2, y: -h * 0.72, w, h: h * 1.1 };
        const spr = Motion.sprite('melt:' + text + size + fill + echo + font, box, env.k * 1.2, (c) => {
            c.font = `${size}px "${font}"`;
            c.textAlign = 'center';
            c.textBaseline = 'alphabetic';
            c.lineJoin = 'round';
            c.strokeStyle = echo;
            c.lineWidth = size * 0.22;
            c.strokeText(text, 0, 0);
            c.strokeStyle = ink;
            c.lineWidth = size * 0.1;
            c.strokeText(text, 0, 0);
            c.fillStyle = fill;
            c.fillText(text, 0, 0);
        });
        // drip profile: a few rounded drops (bell curves) over a gentle sag of the
        // whole text; no per-column noise, which reads as spikes
        const r = Motion.rng('melt' + seed);
        const cols = Math.ceil(w / 4);
        const drops = Array.from({ length: Math.max(3, Math.round(w / (size * 0.55))) }, () => ({
            x: r() * w, wid: size * (0.08 + r() * 0.12), depth: 0.25 + r() * 0.75,
        }));
        const prof = Array.from({ length: cols }, (_, i) => {
            const x = i * 4;
            let v = 0.12;
            for (const d of drops) v = Math.max(v, d.depth * Math.exp(-(((x - d.x) / d.wid) ** 2)));
            return v;
        });
        const src = spr.canvas, sx = src.width / box.w;
        for (let i = 0; i < cols; i++) {
            const bx = box.x + i * 4;
            const dy = prof[i] * m * size * 1.6 + Math.sin(bx * 0.015 + t * 3) * wave;
            const stretch = 1 + prof[i] * m * 0.9;
            g.drawImage(src, (bx - box.x) * sx, 0, 4 * sx + 1, src.height, x + bx, y + box.y + dy * 0.5, 4.3, box.h * stretch);
        }
    }

    return { PAL, sunburst, rings, wavy, shape, ellipse, line, melt, path };
})();
