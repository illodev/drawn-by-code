// Tramo 4 · El clímax · caleidoscopio (18–23,5 s)
// Se abre desde el punto donde acabó el vórtice. Las piezas son pedazos de los tramos
// anteriores (ojos de rana, sombreros de seta, manchas, canicas) que salen del centro.
// Cambio de tono en el golpe de 20,5.
(() => {
    const E = Ease;
    const INK = Groovy.PAL.acido.ink, C = Groovy.PAL.acido.c;

    function piece(g, kind, x, y, s, rot, t) {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.scale(s, s);
        if (kind === 0) {
            // ojo de rana con espiral
            g.fillStyle = '#7cc26b';
            g.beginPath();
            g.arc(0, 0, 44, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#fbf6ec';
            g.beginPath();
            g.arc(0, 0, 30, 0, Math.PI * 2);
            g.fill();
            Canica.core(g, 0, 0, 26, t * 2);
        } else if (kind === 1) {
            // sombrero de seta
            const cap = [...Groovy.ellipse(0, 0, 60, 46, 30, Math.PI, Math.PI * 2), ...Groovy.ellipse(0, 0, 60, 14, 12, 0, Math.PI)];
            Groovy.shape(g, cap, C[1], { ink: INK, width: 5, echoes: [C[2]], echoStep: 6 });
            g.fillStyle = C[4];
            g.beginPath();
            g.arc(-18, -22, 9, 0, Math.PI * 2);
            g.arc(20, -14, 7, 0, Math.PI * 2);
            g.fill();
        } else if (kind === 2) {
            // mancha de aceite: anillos concéntricos
            ['#ff5fc8', '#ffd23f', '#18d6c4', '#7a2cff'].forEach((col, i) => {
                g.fillStyle = col;
                g.beginPath();
                g.ellipse(0, 0, 46 - i * 11, 36 - i * 8, 0, 0, Math.PI * 2);
                g.fill();
            });
        } else {
            // tentáculo ondulado
            g.strokeStyle = '#18d6c4';
            g.lineWidth = 16;
            g.lineCap = 'round';
            g.beginPath();
            for (let i = 0; i <= 12; i++) g.lineTo(i * 9 - 54, Math.sin(i * 0.8 + t * 6) * 14);
            g.stroke();
        }
        g.restore();
    }

    Tramo.calei = (g, t, env) => {
        const lt = t - 18;
        g.fillStyle = '#12051f';
        g.fillRect(0, 0, env.W, env.H);
        const open = E.out(E.seg(t, 18.0, 18.6));
        const beat = Motion.pulse(t, 120);
        const hue = lt * 25 + (t >= 20.5 ? 110 : 0);
        Kaleido.draw(g, env, {
            n: 8, rot: lt * 0.3, hue, sat: 1.5, scale: open * (1 + beat * 0.05),
            source: (s) => {
                // fondo de la cuña: bandas de color que salen del centro
                // de mayor a menor, o las pequeñas quedan tapadas
                const bands = Array.from({ length: 8 }, (_, i) => [((i * 110 + lt * 80) % 880) + 10, i]).sort((x, y) => y[0] - x[0]);
                for (const [rr, i] of bands) {
                    s.fillStyle = ['#2a0f35', '#3d1257', '#1a0a2e', '#4a1066'][i % 4];
                    s.beginPath();
                    s.arc(800, 450, rr, 0, Math.PI * 2);
                    s.fill();
                }
                const r = Motion.rng('calei');
                for (let i = 0; i < 18; i++) {
                    const a = 0.05 + r() * 0.68, speed = 60 + r() * 60;
                    const d = ((r() * 700 + lt * speed) % 760) + 30;
                    piece(s, i % 4, 800 + Math.cos(a) * d, 450 + Math.sin(a) * d, 0.5 + d / 900, r() * 6 + lt * (r() - 0.5) * 1.5, t + i);
                }
            },
        });
        // el cubo: la canica en el centro, grande, sin espejo
        Kaleido.beads(g, 800, 450, 88 * open, 16, 9 * open, lt * 1.5, [C[1], C[4], C[5], C[2]]);
        // nunca desaparece: en 18,0 es el punto del que nace todo
        Canica.draw(g, 800, 450, Math.max(10, 52 * open) * (1 + beat * 0.08), t, 'cartel');
    };
})();
