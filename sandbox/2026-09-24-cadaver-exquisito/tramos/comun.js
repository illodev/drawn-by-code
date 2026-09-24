// Lo que comparten todos los tramos: la canica (el hilo conductor) y utilidades.
const Tramo = {};

// La canica: esfera oscura con tres brazos de color que giran. Siempre es lo más
// saturado del plano. Se adapta al estilo del tramo, pero su diseño no cambia:
// fondo violeta, brazos magenta/amarillo/turquesa, brillo arriba a la izquierda.
const Canica = (() => {
    const BASE = '#3b1a6b', ARMS = ['#ff2e88', '#ffd23f', '#18d6c4'];

    function core(g, x, y, r, t) {
        g.save();
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.clip();
        g.fillStyle = BASE;
        g.fillRect(x - r, y - r, 2 * r, 2 * r);
        g.lineCap = 'round';
        for (let k = 0; k < 3; k++) {
            g.strokeStyle = ARMS[k];
            g.lineWidth = r * 0.34;
            g.beginPath();
            for (let i = 0; i <= 20; i++) {
                const u = i / 20, a = t * 3 + (k * Math.PI * 2) / 3 + u * 2.6;
                const px = x + Math.cos(a) * r * u * 1.05, py = y + Math.sin(a) * r * u * 1.05;
                i ? g.lineTo(px, py) : g.moveTo(px, py);
            }
            g.stroke();
        }
        g.fillStyle = 'rgba(255,255,255,0.85)';
        g.beginPath();
        g.ellipse(x - r * 0.38, y - r * 0.42, r * 0.22, r * 0.14, -0.6, 0, Math.PI * 2);
        g.fill();
        g.restore();
    }

    // style: 'papel' | 'cartel' | 'liquida' | 'linea' | 'plana'
    function draw(g, x, y, r, t, style = 'plana') {
        if (style === 'papel') {
            // halo de papel claro (sin degradados) + filo blanco rasgado
            g.save();
            g.globalAlpha = 0.22;
            g.fillStyle = '#ffe9a8';
            g.beginPath();
            g.arc(x, y, r * 2.1, 0, Math.PI * 2);
            g.fill();
            g.globalAlpha = 0.18;
            g.beginPath();
            g.arc(x, y, r * 1.55, 0, Math.PI * 2);
            g.fill();
            g.restore();
            const filo = Motion.sprite('canica-filo' + r, { x: -r - 8, y: -r - 8, w: 2 * r + 16, h: 2 * r + 16 }, 3, (c) => {
                Paper.cutout(c, Paper.ellipse(0, 0, r + 1, r + 1), BASE, 'canica', { border: 3, shadow: 0.2, tex: false });
            });
            g.save();
            g.translate(x, y);
            filo.draw(g);
            g.restore();
            core(g, x, y, r, t);
        } else if (style === 'cartel') {
            g.fillStyle = '#2a0f35';
            g.beginPath();
            g.arc(x, y, r + 5, 0, Math.PI * 2);
            g.fill();
            core(g, x, y, r, t);
        } else if (style === 'liquida') {
            Liquid.glowDot(g, x, y, r * 1.1, '#ff5fc8');
            core(g, x, y, r, t);
        } else if (style === 'linea') {
            core(g, x, y, r, t);
            Linea.stroke(g, Linea.circle(x, y, r + 2, 24), { t, seed: 'canica', width: 4, jitter: 1.2, closed: true });
        } else core(g, x, y, r, t);
    }

    return { draw, core, BASE, ARMS };
})();

// Paso de coordenadas de un plano con cámara (Motion.cam) a pantalla.
Tramo.toScreen = (env, p, cx, cy, z) => [(p[0] - cx) * z + env.W / 2, (p[1] - cy) * z + env.H / 2];
