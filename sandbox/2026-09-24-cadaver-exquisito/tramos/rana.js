// Tramo 1 · La rana · papel recortado (0–6 s, y otra vez al final con t negativo)
// La canica baja flotando, la rana la caza con la lengua en 3,5 y se le ponen los ojos
// en espiral. Funciona para t < 0 (la canica todavía bajando) para cerrar el bucle.
(() => {
    const P = Paper, E = Ease;
    const FROG = { x: 620, y: 712, s: 1.3 };
    const EYES = [[-55, -150], [55, -150]];
    const MOUTH = [0, -62];

    // cámara: empuje lento hasta 4,5 y luego quieta (la transición parte de aquí)
    const camZ = (t) => E.lerp(1, 1.12, E.inOut(E.seg(t, 0, 4.5)));
    const CAM = [700, 470];
    const world = (p) => [FROG.x + p[0] * FROG.s, FROG.y + p[1] * FROG.s];

    function marblePos(t) {
        const p = E.seg(t, -1.5, 3.4);
        return [1250 - 330 * p + Math.sin(t * 2.3) * 35, -40 + 360 * E.out(p) + Math.sin(t * 3.1) * 18];
    }

    // posición en pantalla del ojo derecho (para Trans.enter)
    Tramo.ranaOjo = (env, t) => {
        const z = camZ(t);
        return { p: Tramo.toScreen(env, world(EYES[1]), CAM[0], CAM[1], z), r: 26 * FROG.s * z };
    };

    function eye(g, kit, x, y, open, look, spiral, t, seed) {
        const white = kit.sprite('rana-ojo', { x: -34, y: -34, w: 68, h: 68 }, (c) => {
            P.cutout(c, P.ellipse(0, 0, 27, 27), '#fbf6ec', 'rana-ojo', { border: 0, shadow: 0.15, tex: { alpha: [0.15, 0.3] } });
        }, 2.5);
        g.save();
        g.translate(x, y);
        white.draw(g);
        g.restore();
        if (spiral > 0) {
            // ojos de canica: la espiral de colores gira y crece
            g.save();
            g.beginPath();
            g.arc(x, y, 26, 0, Math.PI * 2);
            g.clip();
            Canica.core(g, x, y, 26 * E.out(spiral), t * 1.6);
            g.restore();
            return;
        }
        if (open < 0.08) {
            g.fillStyle = '#4f9a4a';
            g.beginPath();
            g.arc(x, y, 28, 0, Math.PI * 2);
            g.fill();
            P.markerStroke(g, P.bezier([x - 22, y + 2], [x - 8, y + 13], [x + 8, y + 13], [x + 22, y + 2], 10), '#1f2a1a', 5, seed);
            return;
        }
        g.save();
        g.beginPath();
        g.arc(x, y, 27, 0, Math.PI * 2);
        g.clip();
        g.fillStyle = '#1f2a1a';
        g.beginPath();
        g.arc(x + look[0] * 9, y + look[1] * 9, 12, 0, Math.PI * 2);
        g.fill();
        const lidY = y - 27 + (1 - open) * 54;
        g.fillStyle = '#4f9a4a';
        g.fillRect(x - 30, y - 30, 60, lidY - (y - 30));
        g.restore();
        P.markerStroke(g, [[x - 26, lidY + 1], [x + 26, lidY - 1]], '#1f2a1a', 4.5, seed + 'l', 0.85);
    }

    Tramo.rana = (g, t, env) => {
        const kit = env.state.kit;
        g.save();
        Motion.cam(g, env, CAM[0], CAM[1], camZ(t));
        kit.paperBg(g, 'noche', '#1b2444', { bleed: 500 });
        // luna y estanque
        kit.sprite('luna', { x: 1180, y: 60, w: 220, h: 220 }, (c) => {
            P.cutout(c, P.ellipse(1290, 170, 78, 78), '#f4ecda', 'luna', { border: 0, shadow: 0, tex: { alpha: [0.2, 0.4] } });
        }).draw(g);
        kit.sprite('agua', { x: -500, y: 600, w: 2600, h: 900 }, (c) => {
            const top = [];
            for (let x = -500; x <= 2100; x += 40) top.push([x, 640 + Math.sin(x * 0.01) * 8]);
            P.cutout(c, [...top, [2100, 1500], [-500, 1500]], '#1f4d6b', 'agua', { border: 0, shadow: 0.3, jag: 1.4, tex: { angle: 0, len: [80, 200], alpha: [0.3, 0.6] } });
            for (let i = 0; i < 5; i++) P.markerStroke(c, [[150 + i * 320, 780 + (i % 2) * 60], [260 + i * 320, 780 + (i % 2) * 60]], '#3f7196', 5, 'ola' + i, 0.7);
        }).draw(g);
        // juncos que se balancean (recortes fijos que giran)
        for (let i = 0; i < 4; i++) {
            const bx = [80, 170, 1330, 1450][i];
            const reed = kit.sprite('junco' + i, { x: -30, y: -420, w: 60, h: 430 }, (c) => {
                P.cutout(c, P.noodle([[0, 0], [4, -150], [-6, -300], [0, -400 + i * 30]], 16, 8), '#2f6b45', 'junco' + i, { border: 2.4 });
                P.cutout(c, P.roundRect(-11, -330 + i * 30, 22, 90, 11), '#8a5a3a', 'espiga' + i, { border: 2.4 });
            }, 1.5);
            g.save();
            g.translate(bx, 660);
            g.rotate(Math.sin(t * 1.3 + i) * 0.05);
            reed.draw(g);
            g.restore();
        }
        // nenúfar
        kit.sprite('nenufar', { x: FROG.x - 230, y: FROG.y - 70, w: 460, h: 140 }, (c) => {
            const pad = P.ellipse(FROG.x, FROG.y, 200, 48, 90).filter((_, i) => i < 84 || i > 88);
            P.cutout(c, [...pad, [FROG.x, FROG.y]], '#3f8f5a', 'nenufar', { border: 3 });
        }).draw(g);

        // --- la rana ---------------------------------------------------------------
        const caught = t >= 3.5;
        const gulp = E.bump(t, 3.9, 0.35);
        const breathe = Math.sin(t * 2.2) * 0.02;
        g.save();
        g.translate(FROG.x, FROG.y);
        g.scale(FROG.s * (1 + gulp * 0.06), FROG.s * (1 + breathe - gulp * 0.03));
        kit.sprite('rana', { x: -170, y: -210, w: 340, h: 220 }, (c) => {
            // ancas a los lados, cuerpo y bultos de los ojos en una sola silueta
            P.cutout(c, P.ellipse(-105, -28, 62, 34), '#5fa857', 'anca-i', { border: 3 });
            P.cutout(c, P.ellipse(105, -28, 62, 34), '#5fa857', 'anca-d', { border: 3 });
            const body = P.circleUnion([[0, -70, 95], [-58, -118, 50], [58, -118, 50], [-70, -45, 60], [70, -45, 60]]).map(([x, y]) => [x, y + 0]);
            P.cutout(c, body, '#7cc26b', 'rana', { border: 3.4 });
            P.cutout(c, P.ellipse(0, -35, 62, 36), '#cfe6a0', 'barriga', { border: 0, shadow: 0 });
        }, 2).draw(g);
        // manos
        for (const sx of [-1, 1]) {
            const hand = kit.sprite('mano' + sx, { x: -30, y: -20, w: 60, h: 30 }, (c) => P.cutout(c, P.ellipse(0, 0, 24, 11), '#5fa857', 'mano' + sx, { border: 2.4 }), 2);
            g.save();
            g.translate(sx * 48, -4);
            hand.draw(g);
            g.restore();
        }
        // ojos: dormidos; uno se abre en 2,5, los dos en 3,0; espirales desde 4,5
        const m = marblePos(t);
        const eyeW = world(EYES[1]);
        const look = caught ? [0, 0] : [Math.max(-1, Math.min(1, (m[0] - eyeW[0]) / 300)), Math.max(-1, Math.min(1, (m[1] - eyeW[1]) / 300))];
        const opens = [E.out(E.seg(t, 3.0, 3.15)), E.out(E.seg(t, 2.5, 2.65))];
        const wide = 1 + E.bump(t, 3.9, 0.5) * 0.15;
        const spiral = E.seg(t, 4.3, 4.8);
        EYES.forEach(([ex, ey], i) => eye(g, kit, ex, ey, Math.min(1, opens[i] * 0.8 * wide), look, spiral, t, 'rojo' + i));
        // boca: sonrisa tranquila; abierta cuando dispara la lengua
        const shoot = E.bump(t, 3.3, 0.55);
        if (shoot > 0.1) {
            g.fillStyle = '#6b1f33';
            g.beginPath();
            g.ellipse(MOUTH[0], MOUTH[1] + 4, 40, 14 * shoot, 0, 0, Math.PI * 2);
            g.fill();
        } else P.markerStroke(g, P.bezier([-58, -66], [-25, -50], [25, -50], [58, -66], 12), '#1f2a1a', 5, 'boca-rana');
        g.restore();

        // --- lengua y canica ---------------------------------------------------------
        const mouthW = world(MOUTH);
        const ext = E.out(E.seg(t, 3.3, 3.5)), ret = E.inOut(E.seg(t, 3.55, 3.85));
        const target = marblePos(3.5);
        if (ext > 0 && ret < 1) {
            const tip = E.lerpPt(mouthW, target, ext * (1 - ret));
            const mid = E.lerpPt(mouthW, tip, 0.5);
            g.save();
            P.tracePath(g, P.noodle(P.bezier(mouthW, [mid[0], mid[1] + 30], [mid[0], mid[1] - 10], tip, 16), 18, 26));
            g.fillStyle = '#e8577a';
            g.fill();
            g.restore();
            if (caught) Canica.draw(g, tip[0], tip[1], 32, t, 'papel');
        }
        if (!caught) Canica.draw(g, m[0], m[1], 32, t, 'papel');
        g.restore();
    };
})();
