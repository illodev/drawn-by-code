// Faraday's laboratory in the basement of the Royal Institution, October 1831, as a 3D set for
// the camera of coil3d.js: a brick wall with a shelf of glassware, an Argand lamp, the bench
// (its top seen low, its front with drawers), the iron induction ring and his notebook, the
// galvanometer, a spark gap on glass pillars and the silk-covered leads; and Faraday himself,
// standing behind the bench. Flat things are drawn as cards: a plane in 3D mapped to the
// screen by the affine map of its projected corners, split in tiles where it is large, so
// perspective holds. Global: FarLab.
//
// World (lab units, 1 ≈ 1.35 mm): y up, the bench top at y = 0, z towards the camera; the coil
// lies along x at y = 95, z = 0, centred on x = 0.
//
//   FarLab.card(press, C, O, U, V, fn)      draw fn in plane coordinates (u, v) mapped to O + u·U + v·V
//   FarLab.back(press, C, t)                the wall, shelf and lamp (behind everything)
//   FarLab.bench(press, C, t)               the bench top and what lies on it, the front
//   FarLab.galvanometer(press, C, theta, t) the dial with its needle (theta from vertical)
//   FarLab.sparkGap(press, C, spark, t)     the two knobs and, when spark > 0, the spark
//   FarLab.leads(press, C)                  the wires from the coil to the gap and the dial
//   FarLab.GALV, FarLab.GAP                 their places
const FarLab = (() => {
    const { put, ink, line, smooth, poly, taper, circle, ellipse } = Ph;
    const L = Ease.lerp;
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const BRICK = { 'pink.s': 0.5, 'yellow.s': 0.45, 'navy.s': 0.82 };
    const MORTAR = { 'yellow.s': 0.3, 'pink.s': 0.25, 'navy.s': 0.75 };
    const WOOD = { 'yellow.s': 0.8, 'pink.s': 0.58, 'navy.s': 0.5 };
    const WOOD_LT = { 'yellow.s': 0.7, 'pink.s': 0.42, 'navy.s': 0.25 };
    const WOOD_DK = { 'yellow.s': 0.85, 'pink.s': 0.65, 'navy.s': 0.85 };
    const BRASS = { yellow: 1, 'pink.s': 0.22, 'navy.s': 0.08 };
    const BRASS_SH = { yellow: 1, 'pink.s': 0.4, 'navy.s': 0.45 };
    const GLASS = { 'blue.s': 0.35, 'navy.s': 0.3 };
    const PAPER = { 'yellow.s': 0.18, 'pink.s': 0.06, 'navy.s': 0.05 };
    const SILK = { 'yellow.s': 0.45, 'blue.s': 0.55, 'navy.s': 0.3 };
    const IRON = { navy: 0.9, 'blue.s': 0.3, 'pink.s': 0.2 };
    const INKC = { navy: 1, 'pink.s': 0.4 };

    const GALV = { x: 330, z: -120, y: 175, r: 95, pivot: 40 };   // dial centre height; pivot below it
    const GAP = { x: 150, z: 60, y: 92, gap: 9 };                  // the spark gap's middle

    // a plane: O + u·U + v·V, drawn in (u, v); skipped if its centre is behind the camera
    function card(press, C, O, U, V, fn, near = 20) {
        const o = C.proj(O);
        if (dot(sub(O, C.eye), C.f) < near) return false;
        const a = C.proj([O[0] + U[0], O[1] + U[1], O[2] + U[2]]), b = C.proj([O[0] + V[0], O[1] + V[1], O[2] + V[2]]);
        press.save();
        press.each((g) => g.transform(a[0] - o[0], a[1] - o[1], b[0] - o[0], b[1] - o[1], o[0], o[1]));
        fn();
        press.restore();
        return true;
    }
    // a large plane in tiles, each with its own affine map, clipped to its own square
    function tiled(press, C, O, U, V, u0, u1, v0, v1, step, fn) {
        for (let u = u0; u < u1; u += step) for (let v = v0; v < v1; v += step) {
            const Ot = [O[0] + U[0] * u + V[0] * v, O[1] + U[1] * u + V[1] * v, O[2] + U[2] * u + V[2] * v];
            card(press, C, Ot, U, V, () => {
                press.save(); press.clip((g) => g.rect(-3, -3, step + 6, step + 6));
                press.each((g) => g.translate(-u, -v));
                fn(u, v);
                press.restore();
            }, 1);
        }
    }

    // ── the back wall: brick, a shallow arch, a shelf of glassware, the lamp's light ─────────
    function back(press, C, t) {
        ink(press, (g) => g.rect(-200, -200, 2000, 1300), { blue: 0.9, 'navy.s': 0.9, 'pink.s': 0.3 });
        const O = [-1400, 1400, -800], U = [1, 0, 0], V = [0, -1, 0];
        tiled(press, C, O, U, V, 0, 3000, 0, 1800, 300, (u0, v0) => {
            put(press, (g) => g.rect(u0 - 4, v0 - 4, 308, 308), MORTAR);
            // bricks in English bond, uneven, a few darker, soot towards the top
            for (let row = Math.floor(v0 / 28); row * 28 < v0 + 300; row++) {
                const off = row % 2 ? 0 : 34, rr = Motion.rng('br' + row);
                for (let k = Math.floor((u0 - off) / 68) - 1; k * 68 + off < u0 + 300; k++) {
                    const x = k * 68 + off, jitter = Math.sin(k * 3.1 + row * 1.7);
                    const tone = 0.6 + 0.12 * Math.sin(k * 7.3 + row * 3.9);
                    put(press, (g) => g.rect(x + 2, row * 28 + 2, 64 + jitter, 24), { ...BRICK, 'pink.s': BRICK['pink.s'] * tone + 0.2, 'navy.s': Math.min(1, BRICK['navy.s'] + (1400 - row * 28 > 900 ? 0.1 : 0)) });
                    if (Math.sin(k * 11.7 + row * 5.3) > 0.7) ink(press, (g) => g.rect(x + 8, row * 28 + 6, 30, 5), { 'navy.s': 0.2 });
                }
            }
        });
        // a shallow brick arch over a recess (darker), behind Faraday
        card(press, C, [-900, 700, -790], U, V, () => {
            put(press, (g) => { g.beginPath(); g.moveTo(0, 700); g.lineTo(0, 200); g.arc(300, 200, 300, Math.PI, 0); g.lineTo(600, 700); g.closePath(); }, { navy: 1, 'pink.s': 0.4, 'yellow.s': 0.3 });
            for (let i = 0; i <= 16; i++) { const a = Math.PI + (i / 16) * Math.PI; line(press, [[300 + Math.cos(a) * 300, 200 + Math.sin(a) * 300], [300 + Math.cos(a) * 350, 200 + Math.sin(a) * 350]], 3, MORTAR); }
        });
        // the shelf: a plank on iron brackets, glassware, a Leyden jar, a hank of wire
        card(press, C, [-100, 620, -780], U, V, () => {
            put(press, (g) => g.rect(0, 0, 1100, 22), WOOD);
            put(press, (g) => g.rect(0, 0, 1100, 5), WOOD_LT);
            for (const bx of [80, 1020]) line(press, [[bx, 22], [bx, 70], [bx - 50, 22]], 6, IRON);
            const glint = (x, y, h) => press.knockout((g) => { Ph.poly(g, Ph.outline([[x, y], [x + 2, y + h]], taper(4))); g.fill(); });
            put(press, circle(120, -46, 40), GLASS); put(press, (g) => g.rect(110, -140, 20, 60), GLASS);
            press.save(); press.clip(circle(120, -46, 40)); put(press, (g) => g.rect(70, -50, 100, 60), { 'pink.s': 0.55, 'blue.s': 0.3 }); press.restore();
            glint(100, -74, 24);
            put(press, (g) => smooth(g, [[230, 0], [230, -100], [242, -120], [242, -140], [266, -140], [266, -120], [278, -100], [278, 0]]), { 'yellow.s': 0.7, 'pink.s': 0.55, 'navy.s': 0.4 });
            put(press, (g) => g.rect(244, -158, 20, 20), { 'yellow.s': 0.5, 'navy.s': 0.5 });
            glint(238, -94, 60);
            put(press, (g) => g.rect(340, -110, 80, 110), GLASS);
            put(press, (g) => g.rect(340, -60, 80, 60), { 'navy.s': 0.25, 'yellow.s': 0.15 });
            line(press, [[380, -110], [380, -170]], 5, { 'yellow.s': 0.6, 'navy.s': 0.4 });
            put(press, circle(380, -178, 12), BRASS_SH);
            glint(348, -100, 34);
            for (const [x, c] of [[480, { 'blue.s': 0.5, yellow: 0.5, 'navy.s': 0.3 }], [550, { 'pink.s': 0.5, 'navy.s': 0.45 }], [620, GLASS]]) {
                put(press, (g) => g.rect(x, -64, 50, 64), c);
                put(press, (g) => g.rect(x - 4, -74, 58, 12), { 'yellow.s': 0.3, 'navy.s': 0.5 });
                glint(x + 8, -58, 30);
            }
            // retort on a stand
            line(press, [[760, 0], [760, -180]], 5, IRON);
            line(press, [[760, -120], [800, -120]], 4, IRON);
            put(press, circle(820, -100, 34), GLASS);
            line(press, [[840, -120], [930, -160], [990, -150]], taper(10, 0.1, 0.8), GLASS);
            glint(806, -118, 20);
            // a hank of copper wire hanging from a peg under the shelf
            line(press, [[900, 22], [900, 44]], 6, WOOD_DK);
            for (let i = 0; i < 7; i++) {
                const pts = [];
                for (let k = 0; k <= 40; k++) { const a = (k / 40) * Math.PI * 2; pts.push([894 + i * 2.4 + Math.cos(a) * (40 - i), 96 + Math.sin(a) * (48 - i * 1.2)]); }
                line(press, pts, 4, { 'yellow.s': 0.75, 'pink.s': 0.6, 'navy.s': i % 2 ? 0.5 : 0.3 });
            }
        });
        // the Argand lamp's warm pool of light on the wall, up and left
        const lp = C.proj([-700, 420, -400]);
        const R = (700 * C.flen) / lp[2];
        press.knockout((g) => { g.fillStyle = Riso.radial(g, lp[0], lp[1], R * 0.05, R, 0.5, 0); g.beginPath(); g.arc(lp[0], lp[1], R, 0, 6.2832); g.fill(); });
        ink(press, circle(lp[0], lp[1], R), { 'yellow.s': (g) => Riso.radial(g, lp[0], lp[1], R * 0.05, R, 0.5, 0) });
    }
    // the Argand lamp standing on the bench's back left: a brass column, a glass chimney, the
    // flame flickering
    function lamp(press, C, t) {
        const fl = Motion.noise1('arg', Math.floor(t * 12) * 0.7);
        card(press, C, [-700, 0, -220], [1, 0, 0], [0, -1, 0], () => {
            put(press, (g) => smooth(g, [[-50, 0], [50, 0], [30, -20], [12, -30], [12, -300], [30, -320], [30, -340], [-30, -340], [-30, -320], [-12, -300], [-12, -30], [-30, -20]]), BRASS_SH);
            line(press, [[-4, -30], [-4, -300]], 4, BRASS);
            put(press, (g) => smooth(g, [[-24, -340], [24, -340], [30, -380], [18, -420], [16, -500], [-16, -500], [-18, -420], [-30, -380]]), { 'blue.s': 0.2, 'yellow.s': 0.2 });
            put(press, (g) => smooth(g, [[0, -440 - fl * 8], [10, -400], [6, -370], [-6, -370], [-10, -400]]), { yellow: 1, 'pink.s': 0.3 });
            press.knockout((g) => { g.fillStyle = Riso.radial(g, 0, -400, 4, 160, 0.55 + fl * 0.05, 0); g.beginPath(); g.arc(0, -400, 160, 0, 6.2832); g.fill(); });
            ink(press, circle(0, -400, 160), { 'yellow.s': (g) => Riso.radial(g, 0, -400, 4, 160, 0.4, 0) });
            put(press, (g) => smooth(g, [[-70, -500], [70, -500], [40, -540], [-40, -540]]), { 'yellow.s': 0.35, 'pink.s': 0.2, 'navy.s': 0.3 });
        });
    }

    // ── the bench ────────────────────────────────────────────────────────────────────────
    function bench(press, C, t) {
        // the top: planks along x, grain, stains, scorch marks; seen low it is a thin band
        tiled(press, C, [-1200, 0, -300], [1, 0, 0], [0, 0, 1], 0, 2600, 0, 420, 420, () => {
            put(press, (g) => g.rect(-2, -2, 2604, 424), WOOD);
            for (let i = 0; i < 6; i++) {
                line(press, [[0, i * 70], [2600, i * 70]], 3, WOOD_DK, { knock: false });
                for (let k = 0; k < 20; k++) line(press, [[k * 130 + Math.sin(i * 3 + k) * 40, i * 70 + 20 + Math.sin(k) * 10], [k * 130 + 90, i * 70 + 24 + Math.sin(k * 2) * 10]], 2, WOOD_LT, { knock: false });
            }
            ink(press, ellipse(1500, 140, 60, 26), { 'navy.s': 0.2 });
            ink(press, ellipse(700, 330, 40, 18), { 'navy.s': 0.25 });
        });
        // the front: a thick edge, a panel with drawers and brass pulls
        card(press, C, [-1200, 0, 120], [1, 0, 0], [0, -1, 0], () => {
            put(press, (g) => g.rect(0, 0, 2600, 40), WOOD_LT);
            put(press, (g) => g.rect(0, 40, 2600, 700), WOOD_DK);
            for (let k = 0; k < 6; k++) {
                put(press, (g) => g.rect(120 + k * 420, 70, 360, 160), WOOD);
                line(press, [[120 + k * 420, 232], [480 + k * 420, 232]], 4, { navy: 1 });
                put(press, ellipse(300 + k * 420, 150, 22, 10), BRASS_SH);
            }
        });
        lamp(press, C, t);
        // Faraday's notebook, open, lying on the bench (sketches of rings and helices)
        card(press, C, [60, 0.5, -200], [1, 0, 0], [0, 0, 1], () => {
            put(press, (g) => poly(g, [[0, 0], [150, -6], [300, 0], [300, 200], [150, 206], [0, 200]]), PAPER);
            line(press, [[150, -6], [150, 206]], 2, { 'navy.s': 0.4 });
            for (let i = 0; i < 9; i++) for (const s0 of [14, 164]) line(press, [[s0, 20 + i * 18], [s0 + 110 - (i % 3) * 20, 20 + i * 18]], 1.6, { 'navy.s': 0.5 }, { knock: false });
            line(press, Array.from({ length: 30 }, (_, i) => [60 + Math.cos(i / 29 * 6.28) * 30, 150 + Math.sin(i / 29 * 6.28) * 22]), 2, { 'navy.s': 0.6 });
        });
        // the iron ring of August 1831, wound with two coils, lying flat behind the helix
        card(press, C, [-260, 1, -190], [1, 0, 0], [0, 0, 1], () => {
            put(press, (g) => { g.beginPath(); g.ellipse(0, 0, 90, 90, 0, 0, 6.2832); g.ellipse(0, 0, 58, 58, 0, 0, 6.2832, true); }, IRON);
            for (let k = 0; k < 26; k++) { const a = (k / 26) * 6.2832; if (Math.cos(a) > -0.2 && Math.cos(a) < 0.3) continue; line(press, [[Math.cos(a) * 54, Math.sin(a) * 54], [Math.cos(a) * 94, Math.sin(a) * 94]], 6, { 'yellow.s': 0.8, 'pink.s': 0.62, 'navy.s': 0.3 }); }
        });
        card(press, C, [-260, 0, -190], [1, 0, 0], [0, -1, 0], () => {
            // its thickness seen from the side (a low band)
            put(press, (g) => g.rect(-90, -16, 180, 16), IRON);
            for (let k = 0; k < 12; k++) line(press, [[-86 + k * 7, -16], [-84 + k * 7, 0]], 3, { 'yellow.s': 0.8, 'pink.s': 0.62, 'navy.s': 0.3 });
            for (let k = 0; k < 12; k++) line(press, [[8 + k * 7, -16], [10 + k * 7, 0]], 3, { 'yellow.s': 0.8, 'pink.s': 0.62, 'navy.s': 0.4 });
        });
        // inkwell and quill
        card(press, C, [560, 0, -200], [1, 0, 0], [0, -1, 0], () => {
            put(press, (g) => smooth(g, [[-34, 0], [34, 0], [30, -40], [16, -50], [-16, -50], [-30, -40]]), { navy: 1, 'blue.s': 0.4 });
            put(press, ellipse(0, -50, 16, 5), { navy: 1 });
            line(press, [[4, -48], [40, -170], [60, -230]], taper(4, 0.1, 0.1), PAPER);
            line(press, [[40, -170], [70, -220], [58, -238], [44, -200]], taper(14, 0.2, 0.6), PAPER);
        });
        // the wooden saddles under the helix
        for (const sx of [-100, 100]) card(press, C, [sx, 0, 0], [1, 0, 0], [0, -1, 0], () => {
            put(press, (g) => poly(g, [[-26, 0], [26, 0], [26, -36], [12, -30], [0, -26], [-12, -30], [-26, -36]]), WOOD);
            line(press, [[-26, -36], [0, -26], [26, -36]], 3, WOOD_LT);
        });
    }

    // ── the galvanometer: a brass drum on a wooden stand, a card scale, a needle ────────────
    function galvanometer(press, C, theta, t) {
        card(press, C, [GALV.x, GALV.y, GALV.z], [1, 0, 0], [0, -1, 0], () => {
            const r = GALV.r, pv = [0, GALV.pivot], nd = r * 0.86;
            put(press, (g) => g.rect(-120, GALV.y - 30, 240, 30), WOOD);
            put(press, (g) => g.rect(-120, GALV.y - 36, 240, 8), WOOD_LT);
            put(press, (g) => poly(g, [[-30, GALV.y - 36], [30, GALV.y - 36], [22, r - 6], [-22, r - 6]]), BRASS_SH);
            for (const tx of [-80, 80]) { put(press, (g) => g.rect(tx - 8, GALV.y - 50, 16, 16), BRASS); put(press, ellipse(tx, GALV.y - 50, 10, 4), BRASS_SH); }
            put(press, circle(0, 0, r), BRASS);
            ink(press, circle(0, 0, r), { 'navy.s': (g) => Riso.radial(g, r * 0.3, -r * 0.4, r * 0.4, r * 1.2, 0, 0.55) });
            put(press, circle(0, 0, r - 10), BRASS_SH);
            for (let i = 0; i < 4; i++) { const a = Math.PI / 4 + (i * Math.PI) / 2; put(press, circle(Math.cos(a) * (r - 5), Math.sin(a) * (r - 5), 4), BRASS_SH); }
            put(press, circle(0, 0, r - 15), PAPER);
            ink(press, circle(0, 0, r - 15), { 'navy.s': (g) => Riso.radial(g, 8, -8, r * 0.5, r, 0, 0.2) });
            for (const sg of [-1, 1]) { const arcP = []; for (let a = -Math.PI / 2 + sg * 0.56; Math.abs(a + Math.PI / 2) <= 0.74; a += sg * 0.03) arcP.push([pv[0] + Math.cos(a) * (nd - 10), pv[1] + Math.sin(a) * (nd - 10)]); line(press, arcP, 6, { 'pink.s': 0.7 }); }
            for (let i = -8; i <= 8; i++) { const a = -Math.PI / 2 + i * 0.09, l = i === 0 ? 16 : i % 4 === 0 ? 11 : 6, ro = nd - 4; line(press, [[pv[0] + Math.cos(a) * ro, pv[1] + Math.sin(a) * ro], [pv[0] + Math.cos(a) * (ro - l), pv[1] + Math.sin(a) * (ro - l)]], i === 0 ? 3.4 : 2.4, { navy: 1 }); }
            const arc = []; for (let a = -Math.PI / 2 - 0.75; a <= -Math.PI / 2 + 0.75; a += 0.05) arc.push([pv[0] + Math.cos(a) * (nd - 2), pv[1] + Math.sin(a) * (nd - 2)]);
            line(press, arc, 2.4, { navy: 1 });
            const a = -Math.PI / 2 + theta, tip = [pv[0] + Math.cos(a) * (nd - 8), pv[1] + Math.sin(a) * (nd - 8)];
            line(press, [[pv[0] - Math.cos(a) * 14, pv[1] - Math.sin(a) * 14], tip], (u) => 6 - 4.4 * u, { navy: 1, 'pink.s': 0.5 });
            put(press, circle(pv[0] - Math.cos(a) * 14, pv[1] - Math.sin(a) * 14, 5), { navy: 1, 'pink.s': 0.4 });
            put(press, circle(pv[0], pv[1], 8), BRASS_SH);
            press.knockout(circle(pv[0] + 2.4, pv[1] - 2.4, 2));
            const gl = []; for (let b = -2.5; b <= -1.7; b += 0.05) gl.push([Math.cos(b) * (r - 22), Math.sin(b) * (r - 22)]);
            press.knockout((g) => { Ph.poly(g, Ph.outline(gl, taper(6, 0.3, 0.3))); g.fill(); });
        });
    }

    // ── the spark gap: two brass knobs on glass pillars; the spark jumps between them ───────
    function sparkGap(press, C, spark, t) {
        card(press, C, [GAP.x, 0, GAP.z], [1, 0, 0], [0, -1, 0], () => {
            put(press, (g) => g.rect(-80, -16, 160, 16), WOOD);
            put(press, (g) => g.rect(-80, -20, 160, 6), WOOD_LT);
            for (const sx of [-1, 1]) {
                const px = sx * 56;
                put(press, (g) => g.rect(px - 7, -GAP.y, 14, GAP.y - 16), GLASS);
                press.knockout((g) => { Ph.poly(g, Ph.outline([[px - 3, -GAP.y + 6], [px - 3, -24]], taper(3))); g.fill(); });
                put(press, ellipse(px, -GAP.y, 10, 5), BRASS_SH);
                line(press, [[px, -GAP.y], [sx * (GAP.gap / 2 + 12), -GAP.y]], 5, BRASS);
                put(press, circle(sx * (GAP.gap / 2 + 9), -GAP.y, 9), BRASS);
                press.knockout(circle(sx * (GAP.gap / 2 + 9) - 3, -GAP.y - 3, 2.4));
                put(press, circle(px, -8, 8), BRASS_SH); // the terminal
            }
            if (spark > 0) {
                // a bright, forking thread between the knobs, a small hard halo, a few sparks
                const rs = Motion.rng('spark' + Math.floor(t * 24)), pts = [[-GAP.gap / 2, -GAP.y]];
                for (let i = 1; i < 6; i++) pts.push([-GAP.gap / 2 + (GAP.gap * i) / 6, -GAP.y + (rs() - 0.5) * 10]);
                pts.push([GAP.gap / 2, -GAP.y]);
                put(press, circle(0, -GAP.y, 22), { 'blue.s': 0.45, 'yellow.s': 0.3 });
                put(press, circle(0, -GAP.y, 12), { 'blue.s': 0.25, yellow: 0.5 });
                for (let k = 0; k < 6; k++) { const a = rs() * 6.28, l = 16 + rs() * 22; line(press, [[Math.cos(a) * 8, -GAP.y + Math.sin(a) * 8], [Math.cos(a) * l, -GAP.y + Math.sin(a) * l]], taper(2.4, 0.1, 0.9), { yellow: 0.8, 'blue.s': 0.3 }); }
                line(press, pts, 4, { yellow: 0.5, 'blue.s': 0.4 });
                press.knockout((g) => { Ph.poly(g, Ph.outline(pts, 1.8)); g.fill(); });
            }
        });
    }

    // ── the leads: silk-covered wire from the coil's ends, along the bench, to the gap's
    // terminals and on to the galvanometer's ──────────────────────────────────────────────
    function leads(press, C) {
        const wire = (pts3) => {
            const P = pts3.map((p) => C.proj(p)).filter((q) => q[2] > 5).map((q) => [q[0], q[1]]);
            if (P.length < 2) return;
            const w = Math.max(2, (4 * C.flen) / C.proj(pts3[Math.floor(pts3.length / 2)])[2]);
            line(press, P, w, SILK);
            line(press, P.map(([x, y]) => [x, y + w * 0.3]), w * 0.3, { navy: 0.8 }, { knock: false });
        };
        wire([[-128, 30, 10], [-120, 4, 40], [-40, 2, 90], [60, 2, 90], [GAP.x - 56, 2, GAP.z + 10], [GAP.x - 56, 8, GAP.z]]);
        wire([[128, 30, 10], [132, 4, 30], [GAP.x + 56, 2, GAP.z + 12], [GAP.x + 56, 8, GAP.z]]);
        wire([[GAP.x - 56, 2, GAP.z - 6], [GAP.x - 40, 2, GAP.z - 60], [GALV.x - 80, 2, GALV.z + 40], [GALV.x - 80, GALV.y - 60, GALV.z + 2]]);
        wire([[GAP.x + 56, 2, GAP.z - 6], [GAP.x + 100, 2, GAP.z - 50], [GALV.x + 80, 2, GALV.z + 40], [GALV.x + 80, GALV.y - 60, GALV.z + 2]]);
    }

    return { card, tiled, back, bench, galvanometer, sparkGap, leads, GALV, GAP };
})();
