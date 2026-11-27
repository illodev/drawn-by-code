// Effects shared by the segments. Global: Fx. Depends on Cereal.
const Fx = (() => {
    const C = Cereal, K = C.COL;

    // A flame: three nested tongues that change shape on twos. (x, y) is its foot.
    function flame(g, x, y, s, d, seed = 0) {
        const f = (((d + seed) % 3) + 3) % 3;
        const shapes = [
            [[-0.3, 0], [-0.38, -0.3], [-0.2, -0.52], [-0.24, -0.82], [0, -0.58], [0.06, -1.05], [0.28, -0.62], [0.2, -0.38], [0.4, -0.5], [0.3, 0]],
            [[-0.3, 0], [-0.42, -0.36], [-0.22, -0.42], [-0.1, -0.95], [0.08, -0.6], [0.22, -0.86], [0.26, -0.5], [0.42, -0.3], [0.3, 0]],
            [[-0.3, 0], [-0.34, -0.26], [-0.3, -0.66], [-0.1, -0.5], [0.02, -1.0], [0.16, -0.56], [0.34, -0.72], [0.36, -0.28], [0.3, 0]],
        ][f];
        const at = (k, dy) => C.curve(shapes.map(([px, py]) => [x + px * s * k, y + py * s * k + dy]), true, 5);
        C.poly(g, at(1, 0), { fill: K.red, ink: K.ink, lw: 3 });
        C.poly(g, at(0.68, -s * 0.02), { fill: K.orange, lw: 0 });
        C.poly(g, at(0.38, -s * 0.03), { fill: K.yellow, lw: 0 });
    }

    return { flame };
})();
