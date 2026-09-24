// Kit del estilo luz líquida: las proyecciones de aceite y tinta de los conciertos de los
// 60. Manchas que se funden (metaballs), con anillos de color como el aceite sobre agua,
// borde luminoso y halo. Global: Liquid. Depende de engine/core.js.
//
// El campo se calcula por píxel a baja resolución (`res` px de ancho) y se escala con
// suavizado: el desenfoque de la ampliación ES el aspecto de proyección. Determinista:
// solo depende de las manchas que le pases.
const Liquid = (() => {
    const E = Ease;

    function hsl2rgb(h, s, l) {
        h = ((h % 360) + 360) % 360 / 360;
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
        const f = (t) => {
            t = ((t % 1) + 1) % 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
    }

    let buf = null;
    /**
     * Pinta el campo de manchas. blobs: [{ x, y, r, hue }] en unidades lógicas.
     * o.bg: color de fondo [r,g,b]; o.bands: nº de anillos de aceite; o.hueShift: rota
     * todos los tonos; o.glow: intensidad del halo (0–1); o.res: ancho del cálculo.
     * o.transparent: fuera de las manchas no pinta nada (para poner una capa de figura
     * sobre otra de fondo). o.gain: multiplica el brillo (< 1 para capas de fondo).
     * o.pulses: [{ x, y, r, w, hue, amp }] ondas de luz circulares (radio r, grosor w) que
     * aclaran y tiñen lo que atraviesan; fuera de las manchas se ven como un anillo tenue.
     */
    function field(g, env, blobs, o = {}) {
        const { res = 360, bg = [8, 4, 18], bands = 2.2, hueShift = 0, glow = 0.6, threshold = 1, sat = 0.95, transparent = false, gain = 1, pulses = [] } = o;
        const w = res, h = Math.round((res * env.H) / env.W);
        if (!buf || buf.width !== w || buf.height !== h) {
            buf = document.createElement('canvas');
            buf.width = w;
            buf.height = h;
        }
        const bg2 = buf.getContext('2d');
        const img = bg2.createImageData(w, h);
        const d = img.data;
        const sx = env.W / w, sy = env.H / h;
        const n = blobs.length;
        const hues = blobs.map((b) => ((b.hue + hueShift) * Math.PI) / 180);
        for (let py = 0; py < h; py++) {
            const y = (py + 0.5) * sy;
            for (let px = 0; px < w; px++) {
                const x = (px + 0.5) * sx;
                let f = 0, hx = 0, hy = 0;
                for (let i = 0; i < n; i++) {
                    const b = blobs[i];
                    const dx = x - b.x, dy = y - b.y;
                    const c = (b.r * b.r) / (dx * dx + dy * dy + 1);
                    f += c;
                    // media circular de los tonos, ponderada por la influencia
                    hx += Math.cos(hues[i]) * c * c;
                    hy += Math.sin(hues[i]) * c * c;
                }
                // ondas: cuánto y de qué color tiñe cada una este píxel
                let boost = 0, phx = 0, phy = 0;
                for (const p of pulses) {
                    const dd = Math.hypot(x - p.x, y - p.y) - p.r;
                    const k = p.amp * Math.exp(-(dd * dd) / (p.w * p.w));
                    if (k > 0.01) {
                        boost += k;
                        phx += Math.cos((p.hue * Math.PI) / 180) * k;
                        phy += Math.sin((p.hue * Math.PI) / 180) * k;
                    }
                }
                boost = Math.min(1, boost);
                const k = (py * w + px) * 4;
                let r = bg[0], gg = bg[1], bl = bg[2], alpha = transparent ? 0 : 255;
                if (f > threshold * 0.55) {
                    let hue = (Math.atan2(hy, hx) * 180) / Math.PI;
                    if (boost > 0.01) {
                        // la onda arrastra el tono hacia el suyo
                        const a0 = (hue * Math.PI) / 180;
                        hue = (Math.atan2(Math.sin(a0) * (1 - boost) + phy, Math.cos(a0) * (1 - boost) + phx) * 180) / Math.PI;
                    }
                    if (f >= threshold) {
                        // anillos: la luminosidad sube y baja con el campo, como aceite; en
                        // escala logarítmica y con tope (en lineal se apiñan en un moiré en
                        // el centro de cada mancha), y deformados por una onda suave en x/y
                        const lf = Math.min(1.1, Math.log(f / threshold)) + 0.12 * Math.sin(x * 0.011 + y * 0.007) * Math.sin(y * 0.013 - x * 0.005);
                        const band = 0.5 + 0.5 * Math.cos(lf * bands * Math.PI);
                        const edge = Math.exp(-lf * 8);
                        const L = 0.32 + band * 0.22 + edge * 0.3 + boost * 0.25;
                        [r, gg, bl] = hsl2rgb(hue + band * 40, sat, Math.min(0.92, L));
                        r *= gain; gg *= gain; bl *= gain;
                        alpha = 255;
                    } else {
                        // halo: el color se derrama fuera del borde, cada vez más oscuro
                        const u = (f - threshold * 0.55) / (threshold * 0.45);
                        const [hr, hg, hb] = hsl2rgb(hue, sat, 0.3 + boost * 0.2);
                        const a = Math.min(1, Math.pow(u, 2.2) * glow * (1 + boost));
                        if (transparent) {
                            [r, gg, bl] = [hr * gain, hg * gain, hb * gain];
                            alpha = a * 255;
                        } else {
                            r = r + (hr * gain - r) * a;
                            gg = gg + (hg * gain - gg) * a;
                            bl = bl + (hb * gain - bl) * a;
                        }
                    }
                } else if (boost > 0.01) {
                    // en el agua vacía la onda se ve como un anillo de luz tenue
                    const [hr, hg, hb] = hsl2rgb((Math.atan2(phy, phx) * 180) / Math.PI, sat, 0.45);
                    const a = boost * 0.3;
                    if (transparent) {
                        [r, gg, bl] = [hr, hg, hb];
                        alpha = a * 255;
                    } else {
                        r += (hr - r) * a;
                        gg += (hg - gg) * a;
                        bl += (hb - bl) * a;
                    }
                }
                d[k] = r;
                d[k + 1] = gg;
                d[k + 2] = bl;
                d[k + 3] = alpha;
            }
        }
        bg2.putImageData(img, 0, 0);
        g.save();
        g.imageSmoothingEnabled = true;
        g.imageSmoothingQuality = 'high';
        g.drawImage(buf, 0, 0, env.W, env.H);
        g.restore();
    }

    /**
     * Manchas que derivan solas por la pantalla con trayectorias de Lissajous: cada una
     * con su semilla, así que el movimiento es fluido y siempre el mismo para el mismo t.
     */
    function drift(seed, n, t, env, o = {}) {
        const { rMin = 60, rMax = 150, speed = 0.25, hues = [300, 20, 190, 90, 260] } = o;
        const r = Motion.rng('drift' + seed);
        return Array.from({ length: n }, (_, i) => {
            const fx = 0.3 + r() * 0.7, fy = 0.3 + r() * 0.7, px = r() * 6.28, py = r() * 6.28;
            const rad = rMin + r() * (rMax - rMin);
            return {
                x: env.W * (0.5 + 0.45 * Math.sin(t * speed * fx * 2 + px)),
                y: env.H * (0.5 + 0.42 * Math.sin(t * speed * fy * 2 + py)),
                r: rad * (1 + 0.15 * Math.sin(t * 1.3 + i)),
                hue: hues[i % hues.length] + r() * 30,
            };
        });
    }

    // Punto de luz nítido (algo que debe verse por encima del líquido).
    function glowDot(g, x, y, r, color) {
        g.save();
        g.globalCompositeOperation = 'lighter';
        for (let i = 4; i > 0; i--) {
            g.globalAlpha = 0.12;
            g.fillStyle = color;
            g.beginPath();
            g.arc(x, y, r * (1 + i * 0.6), 0, Math.PI * 2);
            g.fill();
        }
        g.restore();
    }

    return { field, drift, glowDot, hsl2rgb };
})();
