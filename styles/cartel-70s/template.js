// Plantilla del estilo cartel de los 70: rayos que giran, una forma con ecos que ondula y
// un rótulo que cae y se derrite.
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/cartel-70s/kit.js'],
    fonts: [{ family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' }],
    bpm: 120,
    shots: [[0, 4, 'Plantilla']],

    draw(g, t, env) {
        const P = Groovy.PAL.acido, E = Ease;
        Groovy.sunburst(g, env, 800, 470, 24, t * 0.25, [P.c[0], P.c[4]]);
        Groovy.rings(g, 800, 470, 6, 55, t, [P.c[1], P.c[5], P.c[2], P.c[3]]);
        const beat = Motion.pulse(t, 120);
        const blob = Groovy.wavy(Groovy.ellipse(800, 470, 170 * (1 + beat * 0.06), 150, 96), 12, 6, t * 3);
        Groovy.shape(g, blob, P.c[2], { ink: P.ink, width: 7, echoes: [P.c[1], P.c[3]], echoStep: 9 });
        const drop = E.out(E.seg(t, 0.3, 0.9));
        Groovy.melt(g, env, 'GROOVY', 800, E.lerp(-120, 200, drop), 150, { t, melt: E.inOut(E.seg(t, 1.5, 3.8)), wave: 8, fill: P.c[4], echo: P.c[1], ink: P.ink });
    },
});
