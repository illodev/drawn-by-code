// 2026-09-24-primero-cafe · estilo papel-recortado
// Una taza dormida cae sobre la mesa, su vapor la despierta y se escribe «Primero, café.»
Motion.scene({
    fps: 24,
    duration: 6,
    logical: [1600, 900],
    uses: ['styles/papel-recortado/paper.js', 'styles/papel-recortado/kit.js'],
    fonts: [{ family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
    bpm: 120,
    shots: [[0, 2, 'Mesa'], [2, 4, 'Vapor'], [4, 6, 'Frase']],
    audio: { mix: 'mezcla.wav' },

    setup(env) {
        return { kit: PaperKit.make(env, { font: 'Hand' }) };
    },

    draw(g, t, env) {
        const { kit } = env.state, P = Paper, E = Ease, C = kit.COL;
        const DESK = 640;
        const MUG = { w: 260, h: 230, color: C.mint, dark: C.mintDark };

        // cámara: en «Frase» se desplaza para dejar sitio a la ficha
        const cx = Motion.keys([[4.0, 800], [4.5, 1100]], t);
        g.save();
        Motion.cam(g, env, cx, 450, 1);

        kit.paperBg(g, 'pared', C.wall, { wallpaper: '#4d2e5c' });
        kit.glow(g, 800, 360, 330);
        // mesa
        kit.sprite('mesa', { x: -400, y: DESK - 20, w: 2400, h: 520 }, (c) => {
            P.cutout(c, [[-400, DESK], [2000, DESK - 4], [2000, 1100], [-400, 1100]], C.wood, 'mesa', { border: 0, shadow: 0.25, jag: 1.2, tex: { angle: 0.02, len: [80, 200], alpha: [0.3, 0.6] } });
        }).draw(g);

        // --- la taza: cae en el golpe de 0,5 s, se aplasta y rebota -------------------
        const fall = E.in(E.seg(t, 0.15, 0.5));
        const y = DESK - (1 - fall) * 700;
        const since = t - 0.5;
        const squash = since > 0 ? 0.2 * Math.exp(-since * 7) * Math.cos(since * 22) : 0;
        const breathe = t < 3 ? Math.sin(t * 2.4) * 0.03 : Math.sin(t * 3) * 0.01;
        const sy = 1 - squash + breathe, sx = 1 / Math.sqrt(sy);
        const S = 1.5; // escala de la taza
        const sway = t < 3 ? Math.sin(t * 1.2) * 0.03 * E.seg(t, 0.8, 1.2) : 0;

        // vapor, detrás de la taza: sale por detrás del borde
        for (let i = 0; i < 3; i++) steam(g, t, i, 800 + (i - 1) * 62 * S, y - MUG.h * S + 20);

        g.save();
        g.translate(800, y);
        g.rotate(sway);
        g.scale(sx * S, sy * S);
        mug(g, MUG);
        face(g, t);
        g.restore();

        // «z» que suben mientras duerme
        for (let n = 0; n < 3; n++) {
            const t0 = 0.9 + n * 0.55;
            const u = E.seg(t, t0, t0 + 1.2);
            if (u <= 0 || u >= 1 || t > 3) continue;
            g.save();
            g.globalAlpha = Math.sin(u * Math.PI);
            kit.hand(g, 'z', 1010 + u * 90 + n * 30, 330 - u * 200 - n * 20, 64 + n * 20, C.cream, { align: 'center' });
            g.restore();
        }

        // --- la ficha con la frase ---------------------------------------------------
        const inCard = E.out(E.seg(t, 4.0, 4.5));
        if (inCard > 0) {
            g.save();
            g.translate(1520, E.lerp(1150, 410, inCard));
            g.rotate(-0.035 + (1 - inCard) * 0.2);
            kit.sheet(g, 0, 0, 620, 270, 0, 'ficha', { lined: true, rows: 0, color: '#fbf6ec' });
            kit.title(g, t, 4.5, 'Primero, café.', -250, 28, 88, C.textInk, C.orange, { dur: 0.7 });
            g.restore();
        }
        g.restore();

        // ---------------------------------------------------------------------------
        function mug(g, M) {
            // asa: media rosca a la derecha, por detrás del cuerpo
            kit.sprite('asa', { x: 60, y: -220, w: 160, h: 180 }, (c) => {
                const arc = [];
                for (let a = -1.35; a <= 1.35; a += 0.15) arc.push([M.w / 2 - 6 + Math.cos(a) * 62, -120 + Math.sin(a) * 62]);
                P.cutout(c, P.noodle(arc, 30), M.dark, 'asa', { border: 3 });
            }, 2).draw(g);
            kit.sprite('taza', { x: -M.w / 2 - 12, y: -M.h - 40, w: M.w + 24, h: M.h + 52 }, (c) => {
                P.cutout(c, P.roundRect(-M.w / 2, -M.h, M.w, M.h, 34), M.color, 'taza', { border: 3.2 });
                // boca: borde interior y café
                P.cutout(c, P.ellipse(0, -M.h, M.w / 2 - 4, 26), M.dark, 'boca', { border: 2.4, shadow: 0 });
                P.cutout(c, P.ellipse(0, -M.h + 4, M.w / 2 - 22, 17), '#5a3524', 'cafe', { border: 0, shadow: 0, tex: { alpha: [0.3, 0.5] } });
            }, 2).draw(g);
        }

        function eye(g, x, yy, open, seed) {
            const white = kit.sprite('ojo', { x: -30, y: -30, w: 60, h: 60 }, (c) => {
                P.cutout(c, P.ellipse(0, 0, 21, 19), '#fbf6ec', 'ojo', { border: 0, shadow: 0.12, tex: { alpha: [0.15, 0.3] } });
            }, 2.5);
            g.save();
            g.translate(x, yy);
            white.draw(g);
            g.restore();
            if (open < 0.08) {
                // cerrado: el párpado tapa TODO el blanco y encima va la pestaña curva;
                // si asoma blanco bajo el trazo se lee como «mira abajo», no «duerme»
                g.fillStyle = C.mintDark;
                g.beginPath();
                g.ellipse(x, yy, 22, 20, 0, 0, Math.PI * 2);
                g.fill();
                P.markerStroke(g, P.bezier([x - 20, yy + 2], [x - 8, yy + 12], [x + 8, yy + 12], [x + 20, yy + 2], 10), C.ink, 5, seed);
                return;
            }
            g.save();
            g.beginPath();
            g.ellipse(x, yy, 21, 19, 0, 0, Math.PI * 2);
            g.clip();
            g.fillStyle = C.ink;
            g.beginPath();
            g.arc(x + 3, yy + 4, 9, 0, Math.PI * 2);
            g.fill();
            // párpado grueso que baja desde arriba (siempre algo caído: mirada de reojo)
            const lidY = yy - 19 + (1 - open) * 38;
            g.fillStyle = C.mintDark;
            g.fillRect(x - 25, yy - 25, 50, lidY - (yy - 25));
            g.restore();
            P.markerStroke(g, [[x - 22, lidY + 1], [x + 22, lidY - 1]], C.ink, 4, seed + 'l', 0.8);
        }

        function face(g, t) {
            const opens = (a) => E.out(E.seg(t, a, a + 0.15));
            const blink = (a) => 1 - E.bump(t, a, 0.2);
            let l = opens(3.0) * blink(4.3), r = opens(3.5) * blink(4.3);
            r *= 1 - E.bump(t, 5.0, 0.35); // guiño
            eye(g, -48, -140, l * 0.85, 'ojoL');
            eye(g, 48, -140, r * 0.85, 'ojoR');
            const awake = E.seg(t, 3.0, 3.6);
            const smile = E.lerp(2, 16, awake);
            P.markerStroke(g, P.bezier([-26, -92], [-10, -92 + smile], [10, -92 + smile], [30, -94 - awake * 6], 10), C.ink, 5, 'boca');
        }

        function steam(g, t, i, x0, y0) {
            // Cada columna suelta una tira de papel cada 1,2 s. La tira es un recorte fijo
            // (sprite) que sube, se inclina y se desvanece: si se deformara, el filo
            // rasgado se recalcularía en cada fotograma y hervería.
            const start = 1.9 + i * 0.3;
            const strip = kit.sprite('vapor' + i, { x: -40, y: -260, w: 80, h: 270 }, (c) => {
                const pts = [];
                for (let s = 0; s <= 240; s += 8) pts.push([Math.sin(s / 240 * Math.PI * 2 + i * 1.7) * 14, -s]);
                P.cutout(c, P.noodle(pts, 24, 7), C.cream, 'vapor' + i, { border: 2.2, shadow: 0, tex: { alpha: [0.15, 0.35] } });
            }, 2);
            for (let k = 0; k < 2; k++) {
                const rise = (t - start) / 2.4 - k * 0.5;
                if (rise < 0) continue;
                const f = rise % 1;
                g.save();
                g.globalAlpha = 0.9 * (1 - E.seg(f, 0.5, 1)) * E.seg(f, 0, 0.1) * (1 - E.seg(t, 4.3, 5.3) * 0.5);
                g.translate(x0, y0 + 200 - f * 320);
                g.rotate(Math.sin(t * 2 + i + k) * 0.08);
                g.scale(1 + f * 0.25, 1 + f * 0.25);
                strip.draw(g);
                g.restore();
            }
        }
    },

    post(ctx, t, env) {
        env.state.kit.grainPost(ctx);
    },
});
