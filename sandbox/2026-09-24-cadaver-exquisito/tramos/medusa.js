// Tramo 3 · La medusa · luz líquida (10,5–18 s)
// Las manchas de aceite derivan; entre 12,3 y 14 unas cuantas se juntan en una medusa
// (campana + tentáculos) con la canica dentro. En 15,5–16,5 la medusa va al centro de
// la pantalla, donde la transición en vórtice la engulle.
(() => {
    const E = Ease;
    const TENT = 4;

    function center(t, env) {
        const wander = [800 + 140 * Math.sin((t - 12) * 0.7), 400 + 50 * Math.sin((t - 12) * 1.1)];
        return E.lerpPt(wander, [env.W / 2, env.H / 2], E.inOut(E.seg(t, 15.3, 16.5)));
    }
    Tramo.medusaCentro = center;

    Tramo.medusa = (g, t, env) => {
        const hueShift = (t - 10.5) * 20;
        // fondo: pocas manchas, pequeñas y apartadas a los bordes, para que la medusa
        // sea lo único grande (con muchas, todo se funde en una sopa de color)
        const blobs = Liquid.drift('fondo', 5, t, env, { rMin: 45, rMax: 85, speed: 0.3, hues: [40, 120, 210, 60, 260] }).map((b) => {
            const dx = b.x - env.W / 2, dy = b.y - env.H / 2, d = Math.hypot(dx, dy) || 1;
            const push = Math.max(0, 520 - d) * 0.9;
            return { ...b, x: b.x + (dx / d) * push, y: b.y + (dy / d) * push * 0.6 };
        });
        const c = center(t, env);
        const form = E.inOut(E.seg(t, 12.3, 14.0));
        const r = Motion.rng('medusa');
        const scatter = () => [env.W * (0.15 + 0.7 * r()), env.H * (0.15 + 0.7 * r())];
        // campana: una cúpula de manchas magenta y un núcleo que la rellena; late
        const pulse = 1 + 0.07 * Math.sin(t * 4.5);
        const bellPts = [[0, 0, 80]];
        for (let i = 0; i < 9; i++) {
            const a = Math.PI + 0.12 + (i / 8) * (Math.PI - 0.24);
            bellPts.push([Math.cos(a) * 150, Math.sin(a) * 105, 46]);
        }
        for (let i = -3; i <= 3; i++) bellPts.push([i * 42, 18, 36]); // borde inferior recto
        bellPts.forEach(([bx, by, br], i) => {
            const target = [c[0] + bx * pulse, c[1] + by * pulse];
            const from = scatter();
            const p = E.lerpPt([from[0] + Math.sin(t + i) * 60, from[1] + Math.cos(t * 0.8 + i) * 50], target, form);
            blobs.push({ x: p[0], y: p[1], r: br * E.lerp(0.7, 1, form), hue: 300 + (i % 4) * 10 });
        });
        // tentáculos: cadenas finas y largas, turquesa, que ondulan con retraso
        for (let k = 0; k < TENT; k++) {
            for (let j = 0; j < 8; j++) {
                const tx = c[0] + (k - (TENT - 1) / 2) * 62 + Math.sin(t * 3 - j * 0.7 + k * 1.3) * (8 + j * 7);
                const ty = c[1] + 50 + j * 34;
                const from = scatter();
                const p = E.lerpPt(from, [tx, ty], E.inOut(E.seg(t, 12.6 + j * 0.12, 14.2 + j * 0.12)));
                blobs.push({ x: p[0], y: p[1], r: E.lerp(28, 21 - j * 1.4, form), hue: 185 + k * 8 });
            }
        }
        Liquid.field(g, env, blobs, { hueShift, glow: 0.7 });
        Canica.draw(g, c[0], c[1] - 30, 34, t, 'liquida');
    };
})();
