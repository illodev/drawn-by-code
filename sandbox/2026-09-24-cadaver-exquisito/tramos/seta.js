// Tramo 2 · La seta · cartel de los 70 (5–12 s)
// Rayos que giran, una seta que baila al compás, «¡GLUP!» que cae y se derrite, la canica
// rebotando en el sombrero y el estornudo de esporas que engulle el plano.
(() => {
    const E = Ease, G = Groovy;
    const PAL = G.PAL.acido, INK = PAL.ink, C = PAL.c;
    const SETA = { x: 800, y: 800 };

    // la canica: cae del túnel del ojo (7,3), rebota en el sombrero en cada golpe de
    // 8,0 a 10,0 de un lado a otro y, con el estornudo (10,5), sale disparada al centro
    function marble(t) {
        if (t < 7.3) return null;
        const capY = 470;
        if (t < 8.0) {
            const u = E.in(E.seg(t, 7.3, 8.0));
            return [800, E.lerp(-60, capY, u)];
        }
        if (t < 10.5) {
            const k = Math.floor((t - 8.0) / 0.5), f = ((t - 8.0) % 0.5) / 0.5;
            const x0 = 800 + (k % 2 ? 110 : -110) * (k > 0 ? 1 : 0), x1 = 800 + (k % 2 ? -110 : 110);
            return [E.lerp(x0, x1, f), capY - Math.sin(f * Math.PI) * 170];
        }
        const u = E.out(E.seg(t, 10.5, 11.2));
        return [E.lerp(800, 800, u), E.lerp(capY, 400, u)];
    }
    Tramo.setaCanica = marble;

    Tramo.seta = (g, t, env) => {
        const beat = Motion.pulse(t, 120);
        G.sunburst(g, env, 800, 560, 22, t * 0.35, [C[0], C[4]]);
        G.rings(g, 800, 560, 5, 80 + beat * 6, t, [C[1], C[5], C[3], C[2], C[1]], 0.06);

        // --- la seta: se balancea al compás y se aplasta en cada golpe ------------------
        const sneezeIn = E.seg(t, 10.0, 10.45), sneeze = E.bump(t, 10.45, 0.4);
        const sway = Math.sin(((t - 0.0) * Math.PI * 2) / 1.0) * 0.07 * (1 - sneezeIn);
        const squash = 1 - beat * 0.06 + sneezeIn * 0.1 - sneeze * 0.18;
        g.save();
        g.translate(SETA.x, SETA.y);
        g.rotate(sway);
        g.scale(1 / Math.sqrt(squash), squash);
        // brazos que bailan (arriba en el golpe)
        for (const s of [-1, 1]) {
            const up = Math.sin(t * Math.PI * 2 + (s > 0 ? Math.PI : 0)) * 50;
            const arm = [[s * 60, -160], [s * 130, -190 - up * 0.4], [s * 175, -250 - up]];
            G.line(g, arm, INK, 26);
            G.line(g, arm, '#fff1c1', 14);
        }
        // tallo con cara
        const stem = G.wavy([...G.ellipse(0, -140, 85, 150, 60, 0, Math.PI), ...G.ellipse(0, -200, 70, 40, 30, Math.PI, Math.PI * 2)], 5, 5, t * 4);
        G.shape(g, stem, '#fff1c1', { ink: INK, width: 7 });
        const blink = E.bump(t, 9.2, 0.18) + sneezeIn;
        for (const s of [-1, 1]) {
            g.fillStyle = INK;
            g.beginPath();
            g.ellipse(s * 32, -150, 16, Math.max(2, 16 * (1 - blink)), 0, 0, Math.PI * 2);
            g.fill();
            // párpado caído: mirada «groovy»
            g.fillStyle = '#ffc9a8';
            g.fillRect(s * 32 - 18, -168, 36, 12 + blink * 16);
            G.line(g, [[s * 32 - 18, -156 + blink * 16], [s * 32 + 18, -156 + blink * 16]], INK, 5);
        }
        const mouthOpen = sneeze > 0.05 ? sneeze : 0;
        if (mouthOpen) {
            g.fillStyle = INK;
            g.beginPath();
            g.ellipse(0, -95, 28, 30 * mouthOpen, 0, 0, Math.PI * 2);
            g.fill();
        } else G.line(g, [[-34, -104], [-12, -88], [12, -88], [34, -104]], INK, 6);
        // sombrero con lunares y ecos
        const inflate = 1 + sneezeIn * 0.12;
        const cap = G.wavy([...G.ellipse(0, -330, 250 * inflate, 190 * inflate, 80, Math.PI, Math.PI * 2), ...G.ellipse(0, -330, 250 * inflate, 50, 40, 0, Math.PI)], 7, 7, t * 3);
        G.shape(g, cap, C[1], { ink: INK, width: 8, echoes: [C[2], C[3]], echoStep: 10 });
        g.save();
        G.path(g, cap);
        g.clip();
        [[-130, -420, 42], [20, -470, 36], [140, -400, 48], [-40, -370, 26], [90, -480, 22], [-190, -360, 24]].forEach(([x, y, r], i) => {
            G.shape(g, G.wavy(G.ellipse(x, y, r, r * 0.8, 36), 2, 4, t * 5 + i), C[4], { ink: INK, width: 5 });
        });
        g.restore();
        g.restore();

        // --- ¡GLUP! cae en 6,4, rebota y se derrite -----------------------------------
        const drop = E.back(E.seg(t, 6.4, 6.9));
        if (t > 6.4) {
            g.save();
            g.globalAlpha = 1 - E.seg(t, 9.6, 10.2);
            G.melt(g, env, '¡GLUP!', 800, E.lerp(-150, 190, drop), 170, { t, melt: E.inOut(E.seg(t, 7.2, 9.6)) * 0.9, wave: 6, fill: C[2], echo: C[3], ink: INK });
            g.restore();
        }

        // --- la canica ---------------------------------------------------------------
        const m = marble(t);
        if (m) Canica.draw(g, m[0], m[1], 40, t, 'cartel');
    };

    // borde de cada nube de esporas en el engullido: filete de tinta + eco de color
    Tramo.setaEspora = (g, x, y, r, i) => {
        g.lineWidth = 16;
        g.strokeStyle = INK;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.stroke();
        g.lineWidth = 8;
        g.strokeStyle = [C[2], C[4], C[5]][i % 3];
        g.stroke();
    };
})();
