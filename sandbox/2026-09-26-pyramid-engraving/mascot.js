// The film's mark: the Claude mascot (the blocky creature: a body, two arm stubs, four legs,
// two slot eyes), drawn in live blue as thin bars, in the place of the notched triangle the
// script gave the mark (the user: «¿podemos cambiar los triángulos azules por la mascota de
// Claude?»). The same figure as the carved sign on the capitals (sdCritter in the kit).
//
// Mascot.draw(arr, c, q, width, glow, { w, k }) pushes material-4 instances into arr:
//   c      the figure's centre;  q  its plane (a rotation: +x its right, +y its up, +z out of it)
//   width  its width, arm to arm;  glow  the blue's strength
//   w      a bar's half width (default width / 60)
//   k      how much of it is drawn (0–1): one line traced from the top left clockwise round the
//          whole figure at an even pace, a bright point at its tip, then the two eyes drawn
//          downwards; it is painted, it never just appears
const Mascot = (() => {
    // the silhouette, clockwise from the top left (units: the sign's, 0.88 across, centred)
    const OUT = [[-0.28, 0.21], [0.28, 0.21], [0.28, 0.095], [0.44, 0.095], [0.44, -0.015], [0.28, -0.015], [0.28, -0.13],
        [0.245, -0.13], [0.245, -0.27], [0.175, -0.27], [0.175, -0.13], [0.105, -0.13], [0.105, -0.27], [0.035, -0.27], [0.035, -0.13],
        [-0.035, -0.13], [-0.035, -0.27], [-0.105, -0.27], [-0.105, -0.13], [-0.175, -0.13], [-0.175, -0.27], [-0.245, -0.27], [-0.245, -0.13],
        [-0.28, -0.13], [-0.28, -0.015], [-0.44, -0.015], [-0.44, 0.095], [-0.28, 0.095]].map(([x, y]) => [x, y + 0.03]);
    const EYES = [[-0.12, 0.1], [0.12, 0.1]], EH = [0.028, 0.06];
    const SEGS = OUT.map((a, i) => [a, OUT[(i + 1) % OUT.length]]);
    const LEN = SEGS.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]));
    // the path to trace: the outline, then each eye as a stroke down (with the hand's lift
    // between them counted as distance, so the pace stays even)
    const EYE_L = 2 * EH[1], LIFT = 0.12;
    const TOTAL = LEN.reduce((s, l) => s + l, 0) + 2 * (LIFT + EYE_L);
    function draw(arr, c, q, width, glow, o = {}) {
        const s = width / 0.88, w = o.w ?? width / 60, k = Math.max(0, Math.min(1, o.k ?? 1));
        const at = (x, y) => { const v = Engrave.qrot(q, [x * s, y * s, 0]); return [c[0] + v[0], c[1] + v[1], c[2] + v[2]]; };
        const bar = (a, e, wd) => {
            const d = [e[0] - a[0], e[1] - a[1]], len = Math.hypot(...d) * s;
            if (len < 1e-6) return;
            // along the segment (a box's long axis is its y), a little past each end so the
            // corners close
            const qz = Engrave.qmul(q, Engrave.quat([0, 0, 1], Math.atan2(-d[0], d[1])));
            Engrave.inst(arr, at((a[0] + e[0]) / 2, (a[1] + e[1]) / 2), 4, [wd, len / 2 + wd, w * 0.8], 0.5, qz, glow);
        };
        let left = k * TOTAL, tip = null;
        SEGS.forEach(([a, b], i) => {
            if (left <= 0) return;
            const f = Math.min(1, left / LEN[i]);
            left -= LEN[i];
            const e = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
            bar(a, e, w);
            if (f < 1) tip = e;
        });
        for (const [x, y] of EYES) {
            left -= LIFT;
            if (left <= 0) break;
            const f = Math.min(1, left / EYE_L);
            left -= EYE_L;
            const top = [x, y + EH[1]], e = [x, y + EH[1] - 2 * EH[1] * f];
            bar(top, e, EH[0] * s);
            if (f < 1) tip = e;
        }
        // the point that paints: brighter and a little wider than the line behind it
        if (tip && k < 1) Engrave.inst(arr, at(tip[0], tip[1]), 4, [w * 2.2, w * 2.2, w], 0.5, q, Math.min(1, glow * 1.6));
    }
    return { draw };
})();
