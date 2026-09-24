// 2026-09-24-cadaver-exquisito · cinco estilos y cinco transiciones en 30 s
// Una canica pasa de criatura en criatura como el relevo de un cadáver exquisito.
// Cada tramo vive en tramos/*.js; aquí solo se monta y se enlaza con las transiciones.
const DIR = 'sandbox/2026-09-24-cadaver-exquisito/';
Motion.scene({
    fps: 24,
    duration: 30,
    logical: [1600, 900],
    uses: [
        'engine/transitions.js',
        'styles/papel-recortado/paper.js', 'styles/papel-recortado/kit.js',
        'styles/cartel-70s/kit.js', 'styles/luz-liquida/kit.js', 'styles/caleidoscopio/kit.js', 'styles/linea/kit.js',
        DIR + 'tramos/comun.js', DIR + 'tramos/rana.js', DIR + 'tramos/seta.js', DIR + 'tramos/medusa.js',
        DIR + 'tramos/calei.js', DIR + 'tramos/garabato.js',
    ],
    fonts: [
        { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' },
        { family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' },
    ],
    bpm: 120,
    audio: { mix: 'mezcla.wav' },
    // cada cambio de tramo es un golpe de música; las transiciones son planos propios
    shots: [
        [0, 5, 'Rana · papel'],
        [5, 6.5, '→ entrar por el ojo'],
        [6.5, 10.5, 'Seta · cartel 70s'],
        [10.5, 12, '→ engullir'],
        [12, 16.5, 'Medusa · luz líquida'],
        [16.5, 18, '→ vórtice'],
        [18, 22, 'Clímax · caleidoscopio'],
        [22, 23.5, '→ cuadro en el cuadro'],
        [23.5, 27.5, 'Garabato · línea'],
        [27.5, 28.5, '→ bola de papel'],
        [28.5, 30, '→ vuelta a la rana'],
    ],

    setup(env) {
        return { kit: PaperKit.make(env, { font: 'Hand' }) };
    },

    draw(g, t, env) {
        const E = Ease, T = Trans;
        const seg = (a, b) => E.seg(t, a, b);
        const rana = (gg) => Tramo.rana(gg, t, env);
        const ranaBucle = (gg) => Tramo.rana(gg, t - 30, env);
        const seta = (gg) => Tramo.seta(gg, t, env);
        const medusa = (gg) => Tramo.medusa(gg, t, env);
        const calei = (gg) => Tramo.calei(gg, t, env);
        const oscuro = (gg) => ((gg.fillStyle = '#08040f'), gg.fillRect(0, 0, env.W, env.H));
        const noche = (gg) => env.state.kit.paperBg(gg, 'noche', '#1b2444', { bleed: 500 });

        if (t < 5) rana(g);
        else if (t < 6.5) {
            const eye = Tramo.ranaOjo(env, 5);
            T.enter(g, env, seg(5, 6.5), { a: rana, b: seta, cx: eye.p[0], cy: eye.p[1], r0: eye.r * 0.95, zoom: 70, spin: 1.2 });
        } else if (t < 10.5) seta(g);
        else if (t < 12) T.engulf(g, env, seg(10.5, 12), { a: seta, b: medusa, origin: [800, 560], seed: 'esporas', count: 26, puff: Tramo.setaEspora });
        else if (t < 16.5) medusa(g);
        else if (t < 18) T.vortex(g, env, seg(16.5, 18), { a: medusa, b: oscuro, cx: env.W / 2, cy: env.H / 2, turns: 2.2 });
        else if (t < 22) calei(g);
        else if (t < 23.5) {
            T.frame(g, env, seg(22, 23.5), {
                inner: calei, outer: (gg) => Tramo.garabato(gg, t, env, { inner: false }), at: Tramo.garabatoCirculo,
                rim: (gg, at) => Tramo.garabatoRim(gg, at, t),
            });
        } else if (t < 27.5) Tramo.garabato(g, t, env);
        else if (t < 28.5) {
            noche(g);
            Tramo.bola(g, t, env, seg(27.5, 28.5));
        } else {
            // la bola de papel se abre y dentro está el estanque del principio
            const u = seg(28.5, 29.4);
            T.iris(g, env, u, {
                a: (gg) => (noche(gg), Tramo.bola(gg, 28.5, env, 1)), b: ranaBucle, cx: env.W / 2, cy: env.H / 2,
                edge: (gg, x, y, r) => {
                    if (r <= 0 || u >= 1) return;
                    gg.save();
                    gg.strokeStyle = Linea.PAPER;
                    gg.lineWidth = 26 * (1 - u) + 4;
                    gg.beginPath();
                    for (let i = 0; i <= 48; i++) {
                        const a = (i / 48) * Math.PI * 2, rr = r + Math.sin(i * 7.3) * 8;
                        gg.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
                    }
                    gg.stroke();
                    gg.restore();
                },
            });
        }
    },

    post(ctx, t, env) {
        // grano de papel en los tramos de papel y línea; los digitales van limpios
        const paper = t < 6.2 || t > 22.5;
        if (paper) env.state.kit.grainPost(ctx, t > 22.5 && t < 27.5 ? 0.25 : 0.45);
    },
});
