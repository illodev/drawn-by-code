// Kit del estilo línea: trazo negro sobre papel blanco que tiembla a propósito (line
// boil), como una animación dibujada a mano a 12 dibujos por segundo. Global: Linea.
// Depende de engine/core.js.
//
// Aquí el temblor SÍ es el estilo, pero es determinista: el dibujo cambia cada 1/12 s
// (en «doses»), con la semilla del trazo + el número de dibujo. Nunca con Math.random.
const Linea = (() => {
    const INK = '#15131a', PAPER = '#f7f4ec';

    // Número de dibujo: cambia `fps` veces por segundo (12 = animación en doses).
    const drawing = (t, fps = 12) => Math.floor(t * fps + 1e-6);

    function resample(pts, step) {
        const out = [pts[0]];
        for (let i = 1; i < pts.length; i++) {
            const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
            const d = Math.hypot(bx - ax, by - ay), m = Math.max(1, Math.round(d / step));
            for (let k = 1; k <= m; k++) out.push([ax + ((bx - ax) * k) / m, ay + ((by - ay) * k) / m]);
        }
        return out;
    }

    /**
     * Trazo que tiembla. pts: polilínea (o polígono si closed). jitter: amplitud del
     * temblor en unidades; width: grosor medio (varía un poco a lo largo, como un pincel).
     */
    function stroke(g, pts, { t = 0, seed = 's', width = 5, jitter = 2, color = INK, closed = false, fps = 12 } = {}) {
        const src = resample(closed ? [...pts, pts[0]] : pts, 10);
        const r = Motion.rng(seed + ':' + drawing(t, fps));
        // ruido de baja frecuencia: se desplaza a trozos, no punto a punto
        const knots = Array.from({ length: Math.ceil(src.length / 6) + 2 }, () => [(r() - 0.5) * 2 * jitter, (r() - 0.5) * 2 * jitter]);
        const p = src.map(([x, y], i) => {
            const k = i / 6, a = Math.floor(k), f = k - a, s = f * f * (3 - 2 * f);
            return [x + knots[a][0] + (knots[a + 1][0] - knots[a][0]) * s, y + knots[a][1] + (knots[a + 1][1] - knots[a][1]) * s];
        });
        g.strokeStyle = color;
        g.lineCap = 'round';
        g.lineJoin = 'round';
        // tramos con grosor variable
        for (let i = 1; i < p.length; i++) {
            g.lineWidth = width * (0.8 + 0.4 * Math.sin(i * 0.35 + r() * 0.5));
            g.beginPath();
            g.moveTo(p[i - 1][0], p[i - 1][1]);
            g.lineTo(p[i][0], p[i][1]);
            g.stroke();
        }
    }

    const circle = (cx, cy, r, n = 48, a0 = 0, a1 = Math.PI * 2) =>
        Array.from({ length: n + 1 }, (_, i) => {
            const a = a0 + ((a1 - a0) * i) / n;
            return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
        });

    // Papel blanco con una textura de fibra muy suave (cacheado).
    function paper(g, env, key = 'papel') {
        Motion.sprite('linea:' + key, { x: -300, y: -300, w: env.W + 600, h: env.H + 600 }, env.k, (c) => {
            c.fillStyle = PAPER;
            c.fillRect(-300, -300, env.W + 600, env.H + 600);
            const r = Motion.rng(key);
            c.strokeStyle = 'rgba(120,100,80,0.06)';
            c.lineWidth = 1;
            for (let i = 0; i < 900; i++) {
                const x = -300 + r() * (env.W + 600), y = -300 + r() * (env.H + 600), a = r() * Math.PI;
                c.beginPath();
                c.moveTo(x, y);
                c.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14);
                c.stroke();
            }
        }).draw(g);
    }

    return { INK, PAPER, drawing, stroke, circle, paper, resample };
})();
