// Kaleidoscope style kit: mirrored radial symmetry, rotation, color cycling.
// Global: Kaleido. Depends on engine/core.js.
//
// Anything painted with `source(g)` becomes a kaleidoscope: it is painted to a layer
// and repeated `n` times around (cx, cy), alternating plain and mirrored wedges.
const Kaleido = (() => {
    /**
     * n: number of wedges (even, so the mirrors close up); rot: global rotation;
     * scale: global size (0 = a point); hue: hue-rotate degrees; sat: saturation.
     * The source should have content near (cx, cy) within angle 0..2π/n: that is what
     * shows; everything else falls outside the wedge.
     */
    function draw(g, env, { source, n = 8, cx = env.W / 2, cy = env.H / 2, rot = 0, scale = 1, hue = 0, sat = 1.2, key = 'kaleido' }) {
        if (scale <= 0.001) return;
        const src = Motion.layer(env, key, source);
        const R = Math.hypot(env.W, env.H);
        const wedge = (Math.PI * 2) / n;
        g.save();
        g.filter = hue || sat !== 1 ? `hue-rotate(${hue}deg) saturate(${sat})` : 'none';
        for (let k = 0; k < n; k++) {
            g.save();
            g.translate(cx, cy);
            g.scale(scale, scale);
            g.rotate(rot + k * wedge);
            if (k % 2) {
                g.rotate(wedge);
                g.scale(1, -1);
            }
            g.beginPath();
            g.moveTo(0, 0);
            g.arc(0, 0, R / Math.max(0.05, scale), -0.004, wedge + 0.004);
            g.closePath();
            g.clip();
            g.translate(-cx, -cy);
            Motion.drawLayer(g, env, src);
            g.restore();
        }
        g.restore();
    }

    // Decorative ring of beads (the kaleidoscope's brass rim, or a mandala).
    function beads(g, cx, cy, r, count, size, t, colors) {
        for (let i = 0; i < count; i++) {
            const a = (i / count) * Math.PI * 2 + t;
            g.fillStyle = colors[i % colors.length];
            g.beginPath();
            g.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, size * (1 + 0.3 * Math.sin(t * 4 + i)), 0, Math.PI * 2);
            g.fill();
        }
    }

    return { draw, beads };
})();
