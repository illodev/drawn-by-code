// Plantilla del estilo caleidoscopio: unas piezas de colores que giran y se alejan del
// centro, multiplicadas por 8 espejos.
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/caleidoscopio/kit.js'],
    bpm: 120,
    shots: [[0, 4, 'Plantilla']],

    draw(g, t, env) {
        g.fillStyle = '#12051f';
        g.fillRect(0, 0, env.W, env.H);
        const cols = ['#ff2e88', '#ffd23f', '#18d6c4', '#7a2cff', '#c6ff2e'];
        Kaleido.draw(g, env, {
            n: 8, rot: t * 0.5, hue: t * 40, scale: Ease.out(Ease.seg(t, 0, 0.6)),
            source: (s) => {
                const r = Motion.rng('piezas');
                for (let i = 0; i < 26; i++) {
                    const a = r() * 0.8, d = ((r() * 600 + t * 120) % 650) + 20;
                    s.fillStyle = cols[i % cols.length];
                    s.beginPath();
                    s.ellipse(800 + Math.cos(a) * d, 450 + Math.sin(a) * d, 18 + r() * 40, 10 + r() * 20, a + t, 0, Math.PI * 2);
                    s.fill();
                }
            },
        });
        Kaleido.beads(g, 800, 450, 90, 16, 8, t, cols);
    },
});
