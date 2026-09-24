// Tramo 5 · El garabato · línea sobre blanco (22–28,5 s)
// El caleidoscopio era un dibujo dentro de un círculo en una hoja. Al lado, un
// personaje de línea lo mira; el dibujo se queda en línea y solo la canica conserva el
// color. Se escapa rodando, él la persigue, salta y la atrapa. Luego arruga la hoja.
(() => {
    const E = Ease, L = Linea;
    const CIRCLE = { x: 560, y: 420, r: 230 };
    const FLOOR = 770;
    Tramo.garabatoCirculo = CIRCLE;

    // la canica: centro del círculo → cae al suelo → rueda a la derecha → rebota y la
    // atrapa en el aire en 26,5 → en su mano
    function marble(t) {
        const R = 24;
        if (t < 24.8) return [CIRCLE.x, CIRCLE.y, 0];
        if (t < 25.3) {
            const u = E.seg(t, 24.8, 25.3);
            return [CIRCLE.x + 120 * u, E.lerp(CIRCLE.y, FLOOR - R, E.in(u)), u * 3];
        }
        if (t < 26.2) {
            const u = E.seg(t, 25.3, 26.2);
            const hop = Math.abs(Math.sin(u * Math.PI * 3)) * 40 * (1 - u);
            return [E.lerp(680, 1330, E.out(u)), FLOOR - R - hop, 3 + u * 20];
        }
        if (t < 26.5) {
            const u = E.seg(t, 26.2, 26.5);
            return [E.lerp(1330, 1360, u), FLOOR - R - Math.sin(u * Math.PI * 0.5) * 230, 23];
        }
        const h = hero(t);
        return [h.x + 50, h.y - 330, 23];
    }

    // el personaje: quieto mirando (23,5–25,4), corre (25,6–26,3), salta (26,2–26,9)
    function hero(t) {
        const run = E.inOut(E.seg(t, 25.5, 26.3));
        const x = E.lerp(1050, 1300, run);
        const jump = Math.sin(E.seg(t, 26.2, 26.9) * Math.PI) * 150;
        return { x, y: FLOOR - jump, run: t > 25.5 && t < 26.3, jump: jump > 1 };
    }

    function drawHero(g, t, h, m) {
        const { x, y } = h, s = { t, width: 6, jitter: 2 };
        const phase = t * 14;
        const legA = h.run ? Math.sin(phase) * 38 : h.jump ? 25 : 18;
        const legB = h.run ? -Math.sin(phase) * 38 : h.jump ? -25 : -18;
        const hip = [x, y - 110], neck = [x, y - 220];
        L.stroke(g, [hip, [x + legA, y - 55], [x + legA * 1.2, y]], { ...s, seed: 'pi' });
        L.stroke(g, [hip, [x + legB, y - 55], [x + legB * 1.2, y]], { ...s, seed: 'pd' });
        L.stroke(g, [neck, [x - 3, y - 165], hip], { ...s, seed: 'cuerpo' });
        // brazos: colgando, corriendo, o arriba con la canica
        const caught = t >= 26.5;
        if (caught) {
            L.stroke(g, [[x, y - 205], [x + 30, y - 270], [x + 50, y - 310]], { ...s, seed: 'bd' });
            L.stroke(g, [[x, y - 205], [x - 45, y - 240], [x - 60, y - 290]], { ...s, seed: 'bi' });
        } else {
            const sw = h.run ? Math.sin(phase) * 40 : 0;
            L.stroke(g, [[x, y - 205], [x + 35 + sw, y - 160], [x + 45 + sw, y - 120]], { ...s, seed: 'bd' });
            L.stroke(g, [[x, y - 205], [x - 35 - sw, y - 160], [x - 45 - sw, y - 120]], { ...s, seed: 'bi' });
        }
        // cabeza: mira a la canica
        const hx = x, hy = y - 280;
        L.stroke(g, L.circle(hx, hy, 58, 32), { ...s, seed: 'cabeza', closed: true });
        const dx = Math.max(-1, Math.min(1, (m[0] - hx) / 250)), dy = Math.max(-1, Math.min(1, (m[1] - hy) / 250));
        g.fillStyle = L.INK;
        for (const ex of [-20, 20]) {
            g.beginPath();
            g.arc(hx + ex + dx * 10, hy - 8 + dy * 8, 7, 0, Math.PI * 2);
            g.fill();
        }
        // boca: «o» de sorpresa cuando se escapa, sonrisa cuando la atrapa
        if (caught) L.stroke(g, [[hx - 22, hy + 22], [hx, hy + 34], [hx + 22, hy + 22]], { ...s, seed: 'boca', width: 5 });
        else if (t > 24.8) L.stroke(g, L.circle(hx + dx * 6, hy + 28, 9, 12), { ...s, seed: 'boca', width: 5, closed: true });
        else L.stroke(g, [[hx - 14, hy + 26], [hx + 14, hy + 26]], { ...s, seed: 'boca', width: 5 });
        // signo de interrogación mientras mira el dibujo
        const q = E.bump(t, 23.6, 1.2);
        if (q > 0.05) {
            g.save();
            g.globalAlpha = Math.min(1, q * 2);
            g.font = '64px "Hand"';
            g.fillStyle = L.INK;
            g.fillText('?', hx + 60, hy - 60);
            g.restore();
        }
    }

    // el dibujo del círculo en línea: una flor de 8 pétalos que gira despacio
    function lineMandala(g, t) {
        const { x, y, r } = CIRCLE;
        for (let k = 0; k < 8; k++) {
            const a = (k / 8) * Math.PI * 2 + (t - 22) * 0.3;
            const pts = [];
            for (let i = 0; i <= 16; i++) {
                const u = i / 16, w = Math.sin(u * Math.PI) * 38;
                pts.push([x + Math.cos(a) * (60 + u * 140) - Math.sin(a) * w, y + Math.sin(a) * (60 + u * 140) + Math.cos(a) * w]);
            }
            L.stroke(g, pts, { t, seed: 'petalo' + k, width: 4, jitter: 1.5 });
        }
        L.stroke(g, L.circle(x, y, 80, 32), { t, seed: 'centro', width: 4, closed: true });
    }

    // garabatos de la hoja: la página de un cuaderno, no un lienzo vacío
    function doodles(g, t) {
        const s = { t, width: 3.5, jitter: 1.6 };
        // sol arriba a la derecha, que gira despacio
        L.stroke(g, L.circle(1390, 140, 48, 28), { ...s, seed: 'sol', closed: true });
        for (let k = 0; k < 10; k++) {
            const a = (k / 10) * Math.PI * 2 + t * 0.4;
            L.stroke(g, [[1390 + Math.cos(a) * 64, 140 + Math.sin(a) * 64], [1390 + Math.cos(a) * 92, 140 + Math.sin(a) * 92]], { ...s, seed: 'rayo' + k });
        }
        // espiral arriba a la izquierda
        L.stroke(g, Array.from({ length: 50 }, (_, i) => {
            const a = i * 0.35 + t * 0.8, r = 4 + i * 1.3;
            return [150 + Math.cos(a) * r, 130 + Math.sin(a) * r];
        }), { ...s, seed: 'espiral' });
        // nube y flecha que señala el dibujo
        L.stroke(g, [[900, 170], [880, 140], [905, 110], [945, 115], [965, 90], [1010, 100], [1025, 135], [1060, 145], [1050, 175], [900, 170]], { ...s, seed: 'nube' });
        L.stroke(g, [[860, 330], [820, 360], [800, 395]], { ...s, seed: 'flecha' });
        L.stroke(g, [[782, 372], [800, 395], [826, 385]], { ...s, seed: 'punta' });
        // florecillas en el suelo
        [180, 300, 1460].forEach((x, i) => {
            L.stroke(g, [[x, FLOOR], [x + 4, FLOOR - 50]], { ...s, seed: 'tallo' + i });
            L.stroke(g, L.circle(x + 4, FLOOR - 62, 12, 14), { ...s, seed: 'flor' + i, closed: true });
        });
        // renglones de letra ilegible, como notas al margen
        for (let k = 0; k < 4; k++) {
            L.stroke(g, Array.from({ length: 18 }, (_, i) => [90 + i * 16, 560 + k * 34 + Math.sin(i * 1.7 + k) * 7 - (i % 3 === 0 ? 8 : 0)]), { ...s, width: 2.5, seed: 'nota' + k });
        }
    }

    // rastro de color: por donde rueda la canica, el blanco y negro se mancha de color
    function trail(g, t) {
        if (t < 24.9) return;
        const pts = [];
        // solo mientras toca el papel: cuando salta a la mano (26,2) ya no mancha
        for (let tt = 24.85; tt <= Math.min(t, 26.2); tt += 1 / 48) pts.push(marble(tt));
        g.save();
        g.lineCap = 'round';
        g.lineJoin = 'round';
        for (let i = 1; i < pts.length; i++) {
            g.strokeStyle = Canica.ARMS[Math.floor(i / 4) % 3];
            g.globalAlpha = 0.55;
            g.lineWidth = 26;
            g.beginPath();
            g.moveTo(pts[i - 1][0], pts[i - 1][1] + 10);
            g.lineTo(pts[i][0], pts[i][1] + 10);
            g.stroke();
        }
        g.restore();
    }

    // opts.inner = false: no pintar el contenido del círculo (lo pinta la transición)
    Tramo.garabato = (g, t, env, opts = {}) => {
        L.paper(g, env);
        doodles(g, t);
        trail(g, t);
        L.stroke(g, [[80, FLOOR + 4], [1520, FLOOR]], { t, seed: 'suelo', width: 4 });
        if (opts.inner !== false) {
            const drained = E.seg(t, 23.6, 24.4);
            if (drained < 1) {
                // el caleidoscopio se va vaciando de color hasta quedar en línea
                g.save();
                g.beginPath();
                g.arc(CIRCLE.x, CIRCLE.y, CIRCLE.r, 0, Math.PI * 2);
                g.clip();
                g.globalAlpha = 1 - drained;
                const fitS = (2 * CIRCLE.r) / env.H;
                Trans.zoomAt(g, fitS, [env.W / 2, env.H / 2], [CIRCLE.x, CIRCLE.y]);
                Tramo.calei(g, t, env);
                g.restore();
            }
            g.save();
            g.globalAlpha = drained;
            lineMandala(g, t);
            g.restore();
        }
        L.stroke(g, L.circle(CIRCLE.x, CIRCLE.y, CIRCLE.r, 64), { t, seed: 'circulo', width: 6, closed: true });
        const m = marble(t);
        const h = hero(t);
        drawHero(g, t, h, m);
        if (t >= 23.4) Canica.draw(g, m[0], m[1], t < 24.8 ? 40 : 24, t, 'linea');
    };

    Tramo.garabatoRim = (g, at, t) => L.stroke(g, L.circle(at.x, at.y, at.r, 64), { t, seed: 'circulo', width: 6, closed: true });

    // hoja arrugada: la página se encoge hasta una bola de papel en el centro
    Tramo.bola = (g, t, env, u) => {
        const page = Motion.layer(env, 'pagina', (p) => Tramo.garabato(p, t, env));
        const s = E.lerp(1, 0.09, E.in(u));
        const r = Motion.rng('arruga');
        g.save();
        g.translate(env.W / 2, env.H / 2);
        g.rotate(u * 1.2);
        g.scale(s, s);
        // contorno cada vez más irregular
        g.beginPath();
        for (let i = 0; i < 28; i++) {
            const a = (i / 28) * Math.PI * 2;
            const R = Math.hypot(env.W, env.H) / 2 * (1 - u * 0.35 * r());
            const rr = E.lerp(R, (env.H / 2) * (0.85 + r() * 0.3), E.seg(u, 0.2, 1));
            g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        g.closePath();
        g.clip();
        g.translate(-env.W / 2, -env.H / 2);
        // y además al rectángulo de la hoja: el contorno arrugado es más grande que ella
        g.beginPath();
        g.rect(0, 0, env.W, env.H);
        g.clip();
        Motion.drawLayer(g, env, page);
        // pliegues: facetas de luz y sombra (triángulos que parten de puntos de arruga),
        // que es lo que hace que se lea como papel arrugado y no como un polígono
        const r2 = Motion.rng('pliegues');
        const k = E.seg(u, 0.05, 0.6);
        const cx = env.W / 2, cy = env.H / 2;
        const knots = Array.from({ length: 7 }, () => [cx + (r2() - 0.5) * 1100, cy + (r2() - 0.5) * 700]);
        for (let i = 0; i < 26; i++) {
            const p0 = knots[i % knots.length], a = r2() * 6.28, b = a + 0.5 + r2() * 1.2, R = 500 + r2() * 700;
            g.fillStyle = r2() < 0.55 ? `rgba(30,20,10,${(0.05 + r2() * 0.12) * k})` : `rgba(255,255,255,${(0.2 + r2() * 0.3) * k})`;
            g.beginPath();
            g.moveTo(p0[0], p0[1]);
            g.lineTo(p0[0] + Math.cos(a) * R, p0[1] + Math.sin(a) * R);
            g.lineTo(p0[0] + Math.cos(b) * R, p0[1] + Math.sin(b) * R);
            g.closePath();
            g.fill();
        }
        g.restore();
    };
})();
