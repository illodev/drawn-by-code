// pier-pressure · Milo, 12: tunes the boards with bits from the harbour, works everything out
// and falls anyway. A tall narrow head, a blue flat-top, round glasses mended with tape, a
// sleeveless hoodie, tube socks to the knee, legs that go on for ever.
(() => {
    const T = SkateToon, C = T.COL, { dot, plaster, HAIR, turned } = Cast;
    const { add, mix } = SkateKid;
    const HOOD = C.purple, HOOD_D = '#7f58ad', BLUE = '#2a7de1', FRAME = '#7b1f2a';
    const milo = {
        seed: 'milo', skin: C.skin,
        leg: 41, torso: 25.5, shoulder: 10.4, hipW: 6.4, upper: 17, fore: 16.5, armD: [3.3, 2.8], legD: [3.8, 3.2], neck: 7, neckD: 3.3, stance: 10, hand: 12.5, ankle: 8.4,
        head: {
            w: 31, h: 47, slide: 0.2,
            pts: [[-9, -23], [6, -23.5], [14, -16], [15.5, 0], [13.6, 13], [7, 22], [-3, 23.6], [-12, 16], [-15.5, 0], [-14, -16]],
            pts34: [[-11, -23], [4, -24], [12, -17.5], [13.6, -1], [14.4, 12], [10, 21.6], [1, 24], [-11, 17], [-17, 0], [-16, -16]],
        },
        eye: { x: 0, y: -3, r: [5.9, 5.7], gap: 2.6, pupil: 0.21, brow: true, tall: 1.04 },
        nose: { x: 0, y: 7.4, kind: 'tri', size: 3.4 },
        mouth: { x: 0, y: 15.4, w: 12.5 },
        ear: { y: 1, r: 3.8 },
        top: {
            color: HOOD, sleeve: 0, bw: 16, hem: 3, neckW: 4.6, collar: null,
            draw: (g, K, B) => {
                // armhole bindings, a kangaroo pocket, drawstrings, a ribbed hem
                for (const s of [-1, 1]) T.line(g, [[s * (B.sw - 2.6), -B.t + 1.4], [s * (B.sw - 3.6), -B.t + 5], [s * (B.sw - 2.2), -B.t + 8.6]], { w: K.fine, seed: 'milo-arm' + s });
                const px = B.fx + B.hang * 0.6;
                T.shape(g, [[-8.6 + px, -7.6, 1], [8.6 + px, -7.6, 1], [12 + px, 0.6, 1], [-12 + px, 0.6, 1]], { fill: HOOD_D, w: K.fine, seed: 'milo-pkt' });
                T.line(g, [[B.nx - 1.8, -B.t + 2.2], [B.nx - 2.6, -B.t + 9]], { w: K.fine, seed: 'milo-ds1', color: C.white });
                T.line(g, [[B.nx + 1.8, -B.t + 2.2], [B.nx + 2.8, -B.t + 10.4]], { w: K.fine, seed: 'milo-ds2', color: C.white });
                dot(g, B.nx - 2.6, -B.t + 9.6, K.fine * 0.5, C.white);
                dot(g, B.nx + 2.8, -B.t + 11, K.fine * 0.5, C.white);
                T.line(g, [[B.hx(-B.bw), B.hem - 2.4], [B.hx(0), B.hemY(0) - 2.2], [B.hx(B.bw), B.hem - 2.6]], { w: K.fine, seed: 'milo-rib' });
                for (let i = -4; i <= 4; i++) T.line(g, [[B.hx(i * 2.9), B.hemY(i * 2.9) - 2], [B.hx(i * 2.9), B.hemY(i * 2.9) - 0.2]], { w: K.fine * 0.7, seed: 'milo-rb' + i, amp: 0 });
                // a spanner in the pocket
                T.shape(g, [[3.6 + px, -6.8, 1], [4.6 + px, -13, 1], [3.2 + px, -14.8], [4.2 + px, -17.2, 1], [5.6 + px, -15.4, 1], [7.2 + px, -15.4, 1], [8.4 + px, -17.2, 1], [8.9 + px, -14.6], [7.2 + px, -12.6, 1], [6.4 + px, -6.8, 1]], { fill: C.grey, w: K.fine, seed: 'milo-span' });
            },
        },
        bottom: { kind: 'shorts', color: '#9fb0bf', len: 0.84, wide: [13, 15] },
        socks: { color: C.white, up: 0.8, stripes: [C.red, C.navy] },
        shoes: { upper: '#353a55', sole: C.white, stripe: HAIR, tongue: '#353a55', lace: C.white, cap: null },
        behind: (g, K) => {
            // the hood, lying on his shoulders behind the neck
            const { J, S } = K, c = J.tor([0, -S.torso - 0.4]);
            T.shape(g, [[c[0] - 11.6, c[1] + 5, 1], [c[0] - 10.4, c[1] - 3.4], [c[0], c[1] - 7.4], [c[0] + 10.4, c[1] - 3.4], [c[0] + 11.6, c[1] + 5, 1]], { fill: HOOD_D, w: K.w, seed: 'milo-hood' });
            T.line(g, [[c[0] - 6.4, c[1] - 2.4], [c[0], c[1] - 4], [c[0] + 6.4, c[1] - 2.4]], { w: K.fine, seed: 'milo-hoodl' });
        },
        hairFront: (g, K, H) => {
            // a flat top: a tall block that flares, combed in vertical strokes
            const f = H.fx * 0.3;
            const a = H.turn;
            T.shape(g, turned([[-15.6 + a * 4.6, -7 + a * 7, 1], [-14 + a * 3, -16.4 + a * 4, 1], [-9 + f * 2, -19.8, 1], [-3 + f * 2.4, -17.4, 1], [3 + f * 2.4, -20, 1], [9 + f * 2, -17.6, 1], [14, -17.4 - a], [15.6, -10.4 - a * 5, 1], [16.6, -22], [19.8, -40.6, 1], [6, -43], [-7, -42], [-19, -39.6, 1], [-16.6, -22], [-16.6, -12]], a, 2.4, 0.2), { fill: BLUE, w: K.w, seed: 'milo-top' });
            const R = Motion.rng('milo-hair');
            for (let i = 0; i < 7; i++) {
                const x = -14 + i * 4.6 + R() * 1.6, y0 = -38.4 + R() * 5, l = 5 + R() * 8;
                T.line(g, [[x * 1.08, y0], [x, y0 + l]], { w: K.fine, seed: 'milo-hl' + i });
            }
        },
        face: (g, K, H) => {
            // round glasses, mended with tape at the bridge
            for (const [i, e] of H.eyes.entries()) {
                T.line(g, T.ellipse(e.x, e.y, e.r + 1.5, e.ry + 1.5, 0, 16), { w: K.w * 1.55, seed: 'milo-gl' + i, closed: true, color: FRAME, amp: 0.15 });
                T.line(g, [[e.x - e.r * 0.55, e.y - e.r * 0.2], [e.x - e.r * 0.15, e.y - e.r * 0.62]], { w: K.fine * 0.8, seed: 'milo-gg' + i, color: '#9fd4ea' });
            }
            const a = H.eyes[0], b = H.eyes[1], mx = (a.x + a.r + b.x - b.r) / 2, my = (a.y + b.y) / 2 - 0.6;
            T.shape(g, [[mx - 2.4, my - 1.8, 1], [mx + 2.4, my - 2, 1], [mx + 2.4, my + 1.6, 1], [mx - 2.4, my + 1.8, 1]], { fill: C.white, w: K.fine, seed: 'milo-tape' });
            T.line(g, [[mx - 0.6, my - 1.6], [mx + 0.4, my + 1.5]], { w: K.fine * 0.6, seed: 'milo-tape2' });
            // the arms of the glasses run back to the ears
            const earX = -14.7 + H.turn * 15.5 * 0.34;
            if (a.x - a.r - 1.6 > earX + 1) T.line(g, [[a.x - a.r - 1.6, a.y - 1], [earX, a.y + 0.6]], { w: K.w * 1.2, seed: 'milo-ar0', color: FRAME, taper: false });
            if (H.turn < 0.25) T.line(g, [[b.x + b.r + 1.6, b.y - 1], [15.6 - H.turn * 8, b.y + 0.6]], { w: K.w * 1.2, seed: 'milo-ar1', color: FRAME, taper: false });
            // a pencil behind the ear that shows
            const pk = H.turn > 0.25 ? -1 : 1, po = H.turn > 0.25 ? H.turn * 15.5 * 0.34 + 1 : 0;
            T.shape(g, [[pk * 16 + po, -7, 1], [pk * 18 + po, -7.4, 1], [pk * 20 + po, 3.4, 1], [pk * 19.2 + po, 6.2, 1], [pk * 17.8 + po, 3.8, 1]], { fill: C.roadLine, w: K.fine, seed: 'milo-pencil' });
            T.line(g, [[pk * 18 + po, 3.6], [pk * 19.9 + po, 3.4]], { w: K.fine * 0.7, seed: 'milo-pencil2', amp: 0 });
        },
        front: (g, K) => {
            // a calculator watch, and a plaster on the knee he landed on
            const { J, S } = K;
            const q = mix(J.wrist[1], J.elbow[1], 0.2);
            T.shape(g, [[q[0] - 2.5, q[1] - 2, 1], [q[0] + 2.5, q[1] - 2, 1], [q[0] + 2.5, q[1] + 2, 1], [q[0] - 2.5, q[1] + 2, 1]], { fill: '#353a55', w: K.fine, seed: 'milo-watch' });
            T.shape(g, [[q[0] - 1.5, q[1] - 1.2, 1], [q[0] + 1.5, q[1] - 1.2, 1], [q[0] + 1.5, q[1] + 0.2, 1], [q[0] - 1.5, q[1] + 0.2, 1]], { fill: '#9fd4ea', w: K.fine * 0.6, seed: 'milo-watchf' });
            const k = mix(J.knee[0], J.ankle[0], 0.06);
            plaster(g, K, k[0], k[1], 0.5, 2.9, 'milo-plaster');
        },
    };
    Cast.add('milo', milo, 1);
})();
