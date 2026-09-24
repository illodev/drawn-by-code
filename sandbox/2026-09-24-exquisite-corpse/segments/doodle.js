// Segment 5 · The doodle · line on white (22–28.5 s)
// The kaleidoscope was a drawing inside a circle on a sheet of paper. Next to it, a line
// character looks at it; the drawing turns into line and only the marble keeps its
// color. It rolls away, he chases it, jumps and catches it. Then he crumples the sheet.
(() => {
    const E = Ease, L = LineArt;
    const CIRCLE = { x: 560, y: 420, r: 230 };
    const FLOOR = 770;
    Segment.doodleCircle = CIRCLE;

    // the marble: center of the circle → falls to the floor → rolls right → bounces and
    // he catches it in the air at 26.5 → in his hand
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

    // the character: standing still looking (23.5–25.4), runs (25.6–26.3), jumps (26.2–26.9)
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
        // arms: hanging, running, or up holding the marble
        const caught = t >= 26.5;
        if (caught) {
            L.stroke(g, [[x, y - 205], [x + 30, y - 270], [x + 50, y - 310]], { ...s, seed: 'bd' });
            L.stroke(g, [[x, y - 205], [x - 45, y - 240], [x - 60, y - 290]], { ...s, seed: 'bi' });
        } else {
            const sw = h.run ? Math.sin(phase) * 40 : 0;
            L.stroke(g, [[x, y - 205], [x + 35 + sw, y - 160], [x + 45 + sw, y - 120]], { ...s, seed: 'bd' });
            L.stroke(g, [[x, y - 205], [x - 35 - sw, y - 160], [x - 45 - sw, y - 120]], { ...s, seed: 'bi' });
        }
        // head: looks at the marble
        const hx = x, hy = y - 280;
        L.stroke(g, L.circle(hx, hy, 58, 32), { ...s, seed: 'cabeza', closed: true });
        const dx = Math.max(-1, Math.min(1, (m[0] - hx) / 250)), dy = Math.max(-1, Math.min(1, (m[1] - hy) / 250));
        g.fillStyle = L.INK;
        for (const ex of [-20, 20]) {
            g.beginPath();
            g.arc(hx + ex + dx * 10, hy - 8 + dy * 8, 7, 0, Math.PI * 2);
            g.fill();
        }
        // mouth: surprised «o» when it escapes, smile when he catches it
        if (caught) L.stroke(g, [[hx - 22, hy + 22], [hx, hy + 34], [hx + 22, hy + 22]], { ...s, seed: 'boca', width: 5 });
        else if (t > 24.8) L.stroke(g, L.circle(hx + dx * 6, hy + 28, 9, 12), { ...s, seed: 'boca', width: 5, closed: true });
        else L.stroke(g, [[hx - 14, hy + 26], [hx + 14, hy + 26]], { ...s, seed: 'boca', width: 5 });
        // question mark while he looks at the drawing
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

    // the circle's drawing in line: an 8-petal flower slowly turning
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

    // doodles on the sheet: a notebook page, not an empty canvas
    function doodles(g, t) {
        const s = { t, width: 3.5, jitter: 1.6 };
        // sun at the top right, slowly turning
        L.stroke(g, L.circle(1390, 140, 48, 28), { ...s, seed: 'sol', closed: true });
        for (let k = 0; k < 10; k++) {
            const a = (k / 10) * Math.PI * 2 + t * 0.4;
            L.stroke(g, [[1390 + Math.cos(a) * 64, 140 + Math.sin(a) * 64], [1390 + Math.cos(a) * 92, 140 + Math.sin(a) * 92]], { ...s, seed: 'rayo' + k });
        }
        // spiral at the top left
        L.stroke(g, Array.from({ length: 50 }, (_, i) => {
            const a = i * 0.35 + t * 0.8, r = 4 + i * 1.3;
            return [150 + Math.cos(a) * r, 130 + Math.sin(a) * r];
        }), { ...s, seed: 'espiral' });
        // cloud and an arrow pointing at the drawing
        L.stroke(g, [[900, 170], [880, 140], [905, 110], [945, 115], [965, 90], [1010, 100], [1025, 135], [1060, 145], [1050, 175], [900, 170]], { ...s, seed: 'nube' });
        L.stroke(g, [[860, 330], [820, 360], [800, 395]], { ...s, seed: 'flecha' });
        L.stroke(g, [[782, 372], [800, 395], [826, 385]], { ...s, seed: 'punta' });
        // little flowers on the floor
        [180, 300, 1460].forEach((x, i) => {
            L.stroke(g, [[x, FLOOR], [x + 4, FLOOR - 50]], { ...s, seed: 'tallo' + i });
            L.stroke(g, L.circle(x + 4, FLOOR - 62, 12, 14), { ...s, seed: 'flor' + i, closed: true });
        });
        // lines of illegible handwriting, like margin notes
        for (let k = 0; k < 4; k++) {
            L.stroke(g, Array.from({ length: 18 }, (_, i) => [90 + i * 16, 560 + k * 34 + Math.sin(i * 1.7 + k) * 7 - (i % 3 === 0 ? 8 : 0)]), { ...s, width: 2.5, seed: 'nota' + k });
        }
    }

    // color trail: wherever the marble rolls, the black and white gets stained with color
    function trail(g, t) {
        if (t < 24.9) return;
        const pts = [];
        // only while it touches the paper: once it jumps to the hand (26.2) it no longer stains
        for (let tt = 24.85; tt <= Math.min(t, 26.2); tt += 1 / 48) pts.push(marble(tt));
        g.save();
        g.lineCap = 'round';
        g.lineJoin = 'round';
        for (let i = 1; i < pts.length; i++) {
            g.strokeStyle = Marble.ARMS[Math.floor(i / 4) % 3];
            g.globalAlpha = 0.55;
            g.lineWidth = 26;
            g.beginPath();
            g.moveTo(pts[i - 1][0], pts[i - 1][1] + 10);
            g.lineTo(pts[i][0], pts[i][1] + 10);
            g.stroke();
        }
        g.restore();
    }

    // opts.inner = false: do not paint the circle's contents (the transition paints them)
    Segment.doodle = (g, t, env, opts = {}) => {
        L.paper(g, env);
        doodles(g, t);
        trail(g, t);
        L.stroke(g, [[80, FLOOR + 4], [1520, FLOOR]], { t, seed: 'suelo', width: 4 });
        if (opts.inner !== false) {
            const drained = E.seg(t, 23.6, 24.4);
            if (drained < 1) {
                // the kaleidoscope drains of color until only line is left
                g.save();
                g.beginPath();
                g.arc(CIRCLE.x, CIRCLE.y, CIRCLE.r, 0, Math.PI * 2);
                g.clip();
                g.globalAlpha = 1 - drained;
                const fitS = (2 * CIRCLE.r) / env.H;
                Trans.zoomAt(g, fitS, [env.W / 2, env.H / 2], [CIRCLE.x, CIRCLE.y]);
                Segment.kaleido(g, t, env);
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
        if (t >= 23.4) Marble.draw(g, m[0], m[1], t < 24.8 ? 40 : 24, t, 'line');
    };

    Segment.doodleRim = (g, at, t) => L.stroke(g, L.circle(at.x, at.y, at.r, 64), { t, seed: 'circulo', width: 6, closed: true });

    // crumpled sheet: the page shrinks into a paper ball in the center
    Segment.paperBall = (g, t, env, u) => {
        const page = Motion.layer(env, 'pagina', (p) => Segment.doodle(p, t, env));
        const s = E.lerp(1, 0.09, E.in(u));
        const r = Motion.rng('arruga');
        g.save();
        g.translate(env.W / 2, env.H / 2);
        g.rotate(u * 1.2);
        g.scale(s, s);
        // an increasingly irregular outline
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
        // and also to the sheet's rectangle: the crumpled outline is bigger than it
        g.beginPath();
        g.rect(0, 0, env.W, env.H);
        g.clip();
        Motion.drawLayer(g, env, page);
        // creases: light and shadow facets (triangles starting from crumple points),
        // which is what makes it read as crumpled paper and not as a polygon
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
