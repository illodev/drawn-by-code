// Card «flower» (reference 22.1–22.6 s, over the orbits; measured on the 22.6 s frame, where it
// is whole). Not full frame: the flower on bare paper. Ten pink petals (a pink screen, a
// teal-blue outline, white veins knocked out) round a six-armed pinwheel star in orange
// (pink flat + yellow screen) with yellow leading edges, pink veins, a dark outline (navy
// over the orange), and a dotted navy ring at the heart. It grows on twos: petals one or two
// per drawing, then the star, then the ring (22.12 → 22.45 s in the reference).
//
// CARDS.flower(press, t)                       at the measured place (centre 500, 498; the
//                                              petals span ≈ 317–773 × 278–741 units)
// CARDS.flower.at(press, t, cx, cy, s, rot)    anywhere: centre, scale (1 = measured), turn
// No util needed.
var CARDS = CARDS || {};
(() => {
    const T = (v) => Riso.tone(v);
    const C0 = [500, 498];
    // outer petals: tips measured (units), drawn back to front; `w` = half-width / length,
    // `lean` pushes the bulge to one side (the petals are lopsided, like a pinwheel)
    const PETALS = [
        { tip: [470, 278], w: 0.36, lean: 0.25 }, { tip: [678, 590], w: 0.34, lean: 0.25 }, { tip: [382, 648], w: 0.36, lean: 0.25 },
        { tip: [773, 410], w: 0.26, lean: 0.3 }, { tip: [521, 741], w: 0.33, lean: 0.2 }, { tip: [317, 537], w: 0.34, lean: 0.2 },
        { tip: [600, 340], w: 0.38, lean: 0.2 }, { tip: [678, 725], w: 0.32, lean: 0.25 }, { tip: [326, 419], w: 0.34, lean: 0.3 }, { tip: [377, 299], w: 0.33, lean: 0.2 },
    ];
    // the order they appear in (drawings of 1/12 s)
    const GROW = [0, 3, 0, 1, 1, 2, 2, 3, 1, 0];
    // the star's arm tips (units), clockwise from the top
    const ARMS = [[468, 322], [572, 410], [650, 538], [598, 630], [360, 556], [398, 420]];

    // a lopsided leaf from base b to tip p: returns a closed path builder
    const leaf = (g, b, p, w, lean) => {
        const dx = p[0] - b[0], dy = p[1] - b[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
        const at = (f, o) => [b[0] + ux * L * f + nx * o * L, b[1] + uy * L * f + ny * o * L];
        const a1 = at(0.2, w * 1.25 * (1 + lean)), a2 = at(0.62, w * 0.75 * (1 + lean)), c1 = at(0.25, -w * 1.2 * (1 - lean)), c2 = at(0.66, -w * 0.6 * (1 - lean));
        g.moveTo(b[0], b[1]);
        g.bezierCurveTo(a1[0], a1[1], a2[0], a2[1], p[0], p[1]);
        g.bezierCurveTo(c2[0], c2[1], c1[0], c1[1], b[0], b[1]);
        g.closePath();
        return { at, L, ux, uy, nx, ny };
    };

    function draw(press, t, cx = C0[0], cy = C0[1], s = 1, rot = 0) {
        const pinkS = press.plate('pink', 'screen'), pink = press.plate('pink');
        const blue = press.plate('blue');
        const navy = press.plate('navy');
        const yellowS = press.plate('yellow', 'screen'), yellow = press.plate('yellow');
        const d = Math.floor(t * 12 + 1e-6);
        press.save();
        press.each((g) => { g.translate(cx, cy); g.rotate(rot); g.scale(s, s); g.translate(-C0[0], -C0[1]); });

        // the petals, back to front: knock out what is behind, pink screen, blue outline,
        // white veins (midrib + a few side veins)
        PETALS.forEach((pt, i) => {
            if (GROW[i] > d) return;
            const pop = GROW[i] === d ? 0.8 : 1; // a petal is a little short on its first drawing
            const tip = [C0[0] + (pt.tip[0] - C0[0]) * pop, C0[1] + (pt.tip[1] - C0[1]) * pop];
            const ang = Math.atan2(tip[1] - C0[1], tip[0] - C0[0]);
            const base = [C0[0] + Math.cos(ang + 0.5) * 22, C0[1] + Math.sin(ang + 0.5) * 22];
            let geo;
            press.knockout((g) => { g.beginPath(); geo = leaf(g, base, tip, pt.w, pt.lean); g.fill(); });
            pinkS.fillStyle = T(0.62); pinkS.beginPath(); leaf(pinkS, base, tip, pt.w, pt.lean); pinkS.fill();
            press.knockout((g) => {
                g.lineCap = 'round';
                g.lineWidth = 2.6;
                g.beginPath(); const m0 = geo.at(0.2, 0.02), m1 = geo.at(0.93, 0.0); g.moveTo(...m0); g.quadraticCurveTo(...geo.at(0.6, 0.05), ...m1); g.stroke();
                g.lineWidth = 1.8;
                for (const [f, side] of [[0.38, 1], [0.55, 1], [0.72, 1], [0.45, -1], [0.65, -1]]) {
                    const a = geo.at(f, 0.02 * side), e = geo.at(f + 0.14, pt.w * 0.72 * side * (side > 0 ? 1 + pt.lean : 1 - pt.lean));
                    g.beginPath(); g.moveTo(...a); g.lineTo(...e); g.stroke();
                }
            });
            blue.save(); blue.lineWidth = 4.6; blue.lineJoin = 'round'; blue.strokeStyle = T(0.95); blue.beginPath(); leaf(blue, base, tip, pt.w, pt.lean); blue.stroke(); blue.restore();
        });

        // the star: six curved arms (pinwheel), from d = 3
        if (d >= 3) {
            const k = d === 3 ? 0.7 : 1;
            const star = (g) => {
                g.beginPath();
                ARMS.forEach((p, i) => {
                    const tip = [C0[0] + (p[0] - C0[0]) * k, C0[1] + (p[1] - C0[1]) * k];
                    const a = Math.atan2(tip[1] - C0[1], tip[0] - C0[0]), L = Math.hypot(tip[0] - C0[0], tip[1] - C0[1]);
                    const next = ARMS[(i + 1) % ARMS.length], an = Math.atan2(next[1] - C0[1], next[0] - C0[0]);
                    let mid = (a + an) / 2; if (an < a) mid += Math.PI; // the notch between arms
                    const notch = [C0[0] + Math.cos(mid) * 44 * k, C0[1] + Math.sin(mid) * 44 * k];
                    const c1 = [C0[0] + Math.cos(a - 0.75) * L * 0.8, C0[1] + Math.sin(a - 0.75) * L * 0.8];
                    const c2 = [C0[0] + Math.cos(a + 0.3) * L * 0.55, C0[1] + Math.sin(a + 0.3) * L * 0.55];
                    if (i === 0) { const pn = ARMS[ARMS.length - 1], ap = Math.atan2(pn[1] - C0[1], pn[0] - C0[0]); let m = (ap + a) / 2; if (a < ap) m += Math.PI; g.moveTo(C0[0] + Math.cos(m) * 44 * k, C0[1] + Math.sin(m) * 44 * k); }
                    g.quadraticCurveTo(c1[0], c1[1], tip[0], tip[1]);
                    g.quadraticCurveTo(c2[0], c2[1], notch[0], notch[1]);
                });
                g.closePath();
            };
            press.knockout((g) => { star(g); g.fill(); });
            // red-orange: yellow flat under a dense pink screen (the yellow shows between the dots)
            yellow.fillStyle = T(1); star(yellow); yellow.fill();
            pinkS.fillStyle = T(0.8); star(pinkS); pinkS.fill();
            pink.fillStyle = T(0.25); star(pink); pink.fill();
            // leading edges in bright yellow (the pink lifted), pink veins (the yellow lifted)
            const U_pinkLine = (a, b) => { pink.save(); pink.lineCap = 'round'; pink.lineWidth = 2.2; pink.strokeStyle = T(1); pink.beginPath(); pink.moveTo(...a); pink.lineTo(...b); pink.stroke(); pink.restore(); };
            ARMS.forEach((p) => {
                const tip = [C0[0] + (p[0] - C0[0]) * k, C0[1] + (p[1] - C0[1]) * k];
                const a = Math.atan2(tip[1] - C0[1], tip[0] - C0[0]), L = Math.hypot(tip[0] - C0[0], tip[1] - C0[1]);
                const e0 = [C0[0] + Math.cos(a - 0.5) * L * 0.4, C0[1] + Math.sin(a - 0.5) * L * 0.4], e1 = [C0[0] + Math.cos(a - 0.2) * L * 0.78, C0[1] + Math.sin(a - 0.2) * L * 0.78];
                for (const g of [pink, pinkS]) { g.save(); g.globalCompositeOperation = 'destination-out'; g.lineCap = 'round'; g.lineWidth = 9; g.beginPath(); g.moveTo(...e0); g.quadraticCurveTo(e1[0], e1[1], tip[0] * 0.97 + C0[0] * 0.03, tip[1] * 0.97 + C0[1] * 0.03); g.stroke(); g.restore(); }
                yellow.save(); yellow.lineCap = 'round'; yellow.lineWidth = 8; yellow.strokeStyle = T(1); yellow.beginPath(); yellow.moveTo(...e0); yellow.quadraticCurveTo(e1[0], e1[1], tip[0] * 0.97 + C0[0] * 0.03, tip[1] * 0.97 + C0[1] * 0.03); yellow.stroke(); yellow.restore();
                const v0 = [C0[0] + Math.cos(a + 0.15) * L * 0.4, C0[1] + Math.sin(a + 0.15) * L * 0.4], v1 = [C0[0] + Math.cos(a + 0.05) * L * 0.8, C0[1] + Math.sin(a + 0.05) * L * 0.8];
                for (const g of [yellow]) { g.save(); g.globalCompositeOperation = 'destination-out'; g.lineCap = 'round'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(...v0); g.lineTo(...v1); g.stroke(); g.restore(); }
                U_pinkLine(v0, v1);
            });
            navy.save(); navy.lineWidth = 4; navy.lineJoin = 'round'; navy.strokeStyle = T(0.85); star(navy); navy.stroke(); navy.restore();
            blue.save(); blue.lineWidth = 1.6; blue.strokeStyle = T(0.6); star(blue); blue.stroke(); blue.restore();
        }
        // the heart: a dotted navy ring with tiny yellow ticks inside, from d = 4
        if (d >= 4) {
            navy.fillStyle = T(0.95);
            navy.beginPath();
            for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, x = C0[0] - 3 + Math.cos(a) * 28, y = C0[1] + 2 + Math.sin(a) * 28; navy.moveTo(x + 2.6, y); navy.arc(x, y, 2.6, 0, 7); }
            navy.fill();
            for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.4; yellow.save(); yellow.lineWidth = 2; yellow.strokeStyle = T(1); yellow.lineCap = 'round'; yellow.beginPath(); yellow.moveTo(C0[0] - 3 + Math.cos(a) * 9, C0[1] + 2 + Math.sin(a) * 9); yellow.lineTo(C0[0] - 3 + Math.cos(a) * 16, C0[1] + 2 + Math.sin(a) * 16); yellow.stroke(); yellow.restore(); }
        }
        press.restore();
    }
    CARDS.flower = (press, t) => draw(press, t);
    CARDS.flower.at = draw;
})();
