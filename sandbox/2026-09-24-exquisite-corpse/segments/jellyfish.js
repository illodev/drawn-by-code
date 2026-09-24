// Segment 3 · The jellyfish · liquid light (10.5–18 s)
// What happens: the marble is what gives the sea its color. Some blobs condense into a
// jellyfish (12–13.3) with the marble inside; the jellyfish swims upward in strokes (it
// contracts on every bar and glides) and on every beat the marble emits a wave of light
// that passes through the jellyfish and tints the sea behind. At 16.3 the marble reaches
// the center of the screen, where the vortex swallows everything.
(() => {
    const E = Ease;
    const START = [800, 600], END = [800, 470]; // bell center (the marble is 20 higher)
    const STROKES = [13.5, 14.5, 15.5]; // strokes, on the downbeat

    // bell contraction (0 relaxed, 1 contracted) and accumulated progress
    function swim(t) {
        let c = 0, prog = 0;
        STROKES.forEach((s, k) => {
            c = Math.max(c, E.bump(t, s, 0.4));
            prog += E.out(E.seg(t, s, s + 0.7)) / STROKES.length;
        });
        return { c, prog };
    }
    function bellCenter(t) {
        const { prog } = swim(t);
        const p = E.lerpPt(START, END, prog);
        const wander = Math.sin((t - 12) * 1.3) * 50 * (1 - E.seg(t, 15.5, 16.3));
        return [p[0] + wander, p[1]];
    }

    // light waves: one per beat from 13.0, coming out of the marble
    function pulses(t) {
        const out = [];
        const HUES = [60, 180, 300, 120, 30, 240, 90];
        for (let n = 0; n < 8; n++) {
            const tb = 13.0 + n * 0.5, age = t - tb;
            if (age < 0 || age > 2.4) continue;
            const b = bellCenter(tb);
            out.push({ x: b[0], y: b[1] - 20, r: age * 650, w: 50, hue: HUES[n % HUES.length], amp: 0.9 * Math.exp(-age * 1.1) });
        }
        return out;
    }

    // the sea: many small faint blobs rising (plankton)
    function sea(t, env) {
        const r = Motion.rng('mar');
        return Array.from({ length: 22 }, () => {
            const x0 = r() * env.W, y0 = r() * (env.H + 240), sp = 25 + r() * 45, ph = r() * 6.28;
            return {
                x: x0 + Math.sin(t * 0.6 + ph) * 40,
                y: ((((y0 - t * sp) % (env.H + 240)) + env.H + 240) % (env.H + 240)) - 120,
                r: 22 + r() * 34,
                hue: [200, 260, 170, 300, 230][Math.floor(r() * 5)],
            };
        });
    }

    // the jellyfish: target positions of all its blobs
    function jelly(t) {
        const B = bellCenter(t), { c } = swim(t);
        const sx = 1 - 0.22 * c, sy = 1 + 0.15 * c;
        const K = 0.72; // jellyfish scale: fully on screen, with room around it
        const out = [];
        const add = (x, y, r, hue, part) => out.push({ x: B[0] + x * sx * K, y: B[1] + y * sy * K, r: r * K, hue, part });
        // bell: dome, fill and scalloped edge (yellow, which marks the silhouette)
        for (let i = 0; i < 11; i++) {
            const a = Math.PI + (i / 10) * Math.PI;
            add(Math.cos(a) * 160, Math.sin(a) * 120, 44, 305, 'campana');
        }
        add(0, -45, 70, 290, 'campana');
        add(-75, -20, 50, 295, 'campana');
        add(75, -20, 50, 295, 'campana');
        for (let i = 0; i < 9; i++) add(-160 + i * 40, 10 + (i % 2) * 12, 24, 50, 'borde');
        // oral arms: two thick ribbons that undulate a lot
        for (const s of [-1, 1]) {
            for (let j = 0; j < 9; j++) {
                add(s * 22 + Math.sin(t * 4 - j * 0.6 + s) * (6 + j * 5), 40 + j * 26 * (1 + 0.15 * c), 22 - j, 275, 'brazo');
            }
        }
        // tentacles: long thin threads that trail behind when swimming. Spaced at least
        // 4× their radius apart: otherwise the halos merge and come out as one mass
        [-150, -90, 90, 150].forEach((x0, k) => {
            for (let j = 0; j < 15; j++) {
                const spread = 1 + 0.3 * c * (j / 14);
                add(x0 * spread + Math.sin(t * 3.5 - j * 0.45 + k * 1.1) * (3 + j * 3), 30 + j * 24 * (1 + 0.2 * c), 11 - j * 0.4, 185, 'tentaculo');
            }
        });
        return out;
    }

    Segment.jellyfish = (g, t, env) => {
        const P = pulses(t);
        // background: the faint sea, which is also tinted by the waves
        Liquid.field(g, env, sea(t, env), { res: 320, gain: 0.42, glow: 0.4, hueShift: (t - 10.5) * 10, pulses: P });
        // bubbles: small crisp dots rising (density without clutter)
        const r = Motion.rng('burbujas');
        g.save();
        for (let i = 0; i < 46; i++) {
            const x = r() * env.W, y0 = r() * (env.H + 100), sp = 40 + r() * 90, rad = 2 + r() * 5;
            const y = ((((y0 - t * sp) % (env.H + 100)) + env.H + 100) % (env.H + 100)) - 50;
            g.globalAlpha = 0.25 + r() * 0.35;
            g.strokeStyle = '#bfe9ff';
            g.lineWidth = 1.5;
            g.beginPath();
            g.arc(x + Math.sin(t * 2 + i) * 8, y, rad, 0, Math.PI * 2);
            g.stroke();
        }
        g.restore();
        // the jellyfish: condenses from scattered blobs and then swims
        const target = jelly(t);
        const rs = Motion.rng('dispersas');
        const blobs = target.map((b, i) => {
            const from = [env.W * (0.08 + 0.84 * rs()), env.H * (0.1 + 0.8 * rs())];
            const drift = [from[0] + Math.sin(t * 0.8 + i) * 60, from[1] + Math.cos(t * 0.7 + i) * 50];
            const u = E.inOut(E.seg(t, 12.0 + (i % 20) * 0.02, 13.3 + (i % 20) * 0.02));
            const p = E.lerpPt(drift, [b.x, b.y], u);
            // loose, they are small particles that gather (big ones = color soup)
            return { x: p[0], y: p[1], r: b.r * E.lerp(0.45, 1, u), hue: b.hue };
        });
        Liquid.field(g, env, blobs, { res: 340, transparent: true, glow: 0.8, hueShift: (t - 12) * 6, pulses: P });
        const B = bellCenter(t);
        const pre = E.seg(t, 12.0, 13.3);
        // before condensing, the marble comes from where the mushroom left it (800, 400)
        const m = E.lerpPt([800, 400], [B[0], B[1] - 20], E.inOut(pre));
        Marble.draw(g, m[0], m[1], 34 * (1 + Motion.pulse(t, 120) * 0.12 * E.seg(t, 12.9, 13.1)), t, 'liquid');
    };
})();
