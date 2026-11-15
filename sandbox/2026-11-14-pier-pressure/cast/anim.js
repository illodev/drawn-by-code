// pier-pressure · animating the cast's drawings from inside. A drawing is a set of control points
// (cast/drawn.js); here it gets pins, named places on the figure (the top of the head, the chin,
// the chest, the hips, each hand, each foot, what it holds, the loose ends of its hair), and when
// pins move the whole drawing bends to follow them, every control point turned and carried by the
// pins near it (a rigid moving-least-squares warp: the puppet pins of a compositing program, in
// forty lines). So a held drawing can breathe, nod, lean, pan a camera, wave a thumb, and its
// loose ends can arrive late; and two different drawings with the same pins can be bent towards
// each other, which is an in-between.
// Global: Anim. Load after drawn.js and the drawings.
//
//   Anim.rig(who, pose, { at: [x, y], m, pins: { name: [x, y] }, skin })
//       at: the point between the soles (drawing pixels); m: the drawing's pixels per metre;
//       pins in drawing pixels; skin: the colour of the lids (the nearest fill is used)
//   Anim.draw(g, who, pose, x, y, ppm, { move: { pin: [dx, dy] }, to: { pin: [x, y] },
//                                        blink, look, halo, weight })
//       the figure with `at` on (x, y) of the frame at ppm frame units per metre. move: pins
//       displaced, in metres (x right, y DOWN, as on the frame); to: pins sent to a place, in
//       metres from `at`. Pins not named stay where the drawing has them.
//   Anim.between(who, a, b, k) → { pose, to }   the drawing to use and where its pins go, k of the
//       way from pose a to pose b (k < 0: an anticipation, away from b; k > 1: an overshoot)
//   Anim.settle(f, f0, amp, freq, damp)   a loose end after a move at frame f0: amp · e^(−damp·n) ·
//       cos(freq·n), n frames later (0 before it). Closed form: nothing is carried between frames.
//   Anim.blink(f, at)   0…1 for a blink that starts at frame `at` (half, shut, shut, half)
const Anim = (() => {
    const rigs = {};
    const rig = (who, pose, r) => ((rigs[who] ??= {})[pose] = r);
    // the warp that takes pins P to Q: each point is turned and moved by the rigid motion that
    // best fits the pins, the near ones counting most
    function warper(P, Q, alpha = 1.15) {
        const n = P.length, w = new Float64Array(n);
        return ([x, y]) => {
            let sw = 0, px = 0, py = 0, qx = 0, qy = 0;
            for (let i = 0; i < n; i++) {
                const dx = P[i][0] - x, dy = P[i][1] - y, d2 = dx * dx + dy * dy;
                if (d2 < 1e-6) return [Q[i][0], Q[i][1]];
                w[i] = 1 / Math.pow(d2, alpha);
                sw += w[i]; px += w[i] * P[i][0]; py += w[i] * P[i][1]; qx += w[i] * Q[i][0]; qy += w[i] * Q[i][1];
            }
            px /= sw; py /= sw; qx /= sw; qy /= sw;
            let a = 0, b = 0;
            for (let i = 0; i < n; i++) {
                const ux = P[i][0] - px, uy = P[i][1] - py, vx = Q[i][0] - qx, vy = Q[i][1] - qy;
                a += w[i] * (ux * vx + uy * vy);
                b += w[i] * (ux * vy - uy * vx);
            }
            const L = Math.hypot(a, b) || 1, c = a / L, s = b / L, rx = x - px, ry = y - py;
            return [qx + c * rx - s * ry, qy + s * rx + c * ry];
        };
    }
    const lidOf = (who, pose, r) => {
        if (r.lid) return r.lid;
        const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)), want = hex(r.skin ?? '#f3bd90');
        return (r.lid = Drawn.colours(who, pose).reduce((best, c) => {
            const v = hex(c), dist = (v[0] - want[0]) ** 2 + (v[1] - want[1]) ** 2 + (v[2] - want[2]) ** 2;
            return dist < best[0] ? [dist, c] : best;
        }, [1e9, r.skin])[1]);
    };
    function draw(g, who, pose, x, y, ppm, o = {}) {
        const r = rigs[who][pose], s = ppm / r.m, names = Object.keys(r.pins);
        const P = names.map((n) => r.pins[n]);
        const Q = names.map((n, i) => {
            const t = o.to?.[n], mv = o.move?.[n];
            const base = t ? [r.at[0] + t[0] * r.m, r.at[1] + t[1] * r.m] : P[i];
            return mv ? [base[0] + mv[0] * r.m, base[1] + mv[1] * r.m] : base;
        });
        const still = !o.to && !o.move;
        Drawn.draw(g, who, pose, x - r.at[0] * s, y - r.at[1] * s, s, { warp: still ? null : warper(P, Q), blink: o.blink, look: o.look, face: r.pins.head ? [...r.pins.head, 0.36 * r.m] : null, lid: lidOf(who, pose, r), halo: o.halo, weight: o.weight, only: o.only, hide: o.hide });
    }
    // where a pose's pins are, in metres from its `at`
    const metres = (who, pose) => {
        const r = rigs[who][pose];
        return Object.fromEntries(Object.entries(r.pins).map(([n, p]) => [n, [(p[0] - r.at[0]) / r.m, (p[1] - r.at[1]) / r.m]]));
    };
    function between(who, a, b, k) {
        const A = metres(who, a), B = metres(who, b), to = {};
        for (const n of Object.keys(A)) if (B[n]) to[n] = [A[n][0] + (B[n][0] - A[n][0]) * k, A[n][1] + (B[n][1] - A[n][1]) * k];
        return { pose: k < 0.5 ? a : b, to };
    }
    const settle = (f, f0, amp, freq = 0.9, damp = 0.22) => (f < f0 ? 0 : amp * Math.exp(-damp * (f - f0)) * Math.cos(freq * (f - f0)));
    const blink = (f, at) => [0.55, 1, 1, 0.5][f - at] ?? 0;
    return { rig, draw, between, metres, settle, blink, warper, rigs };
})();

// --- the rigs ------------------------------------------------------------------------------------
// Pins read off each pose under a grid (drawing pixels). The same names on every pose of a
// character, so any two of them can be bent towards each other.
Anim.rig('hoagie', 'film', { at: [235, 660], m: 658 / 1.32, skin: '#f3bd90', pins: {
    cow: [270, 12], top: [270, 60], head: [285, 150], chin: [290, 228], earR: [405, 175], cam: [40, 140], handA: [130, 190], handB: [105, 105], elbow: [75, 262],
    chest: [240, 320], hem: [330, 400], hips: [225, 425], footL: [90, 595], footR: [385, 605] } });
Anim.rig('hoagie', 'proud', { at: [170, 505], m: 380, skin: '#f3bd90', pins: {
    cow: [125, 5], top: [140, 45], head: [150, 115], chin: [150, 178], earR: [245, 100], cam: [85, 240], handA: [100, 268], handB: [318, 150], thumb: [300, 108], elbow: [42, 245],
    chest: [170, 215], hem: [245, 300], hips: [165, 325], footL: [65, 470], footR: [272, 470] } });
