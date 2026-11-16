// Skate toon characters: the figure of the genre, built the way its drawings are built. A
// huge head with its own silhouette, goggle eyes, a wide mouth with real teeth, a stick neck;
// clothes far too big that hang from the shoulders (a shirt almost as wide as the head, flap
// sleeves, shorts like a box), thin limbs coming out of them, chunky boots, fat-fingered
// hands. A spec says who it is, a pose what it does. Global: SkateKid. Load after toon.js.
//
//   SkateKid.draw(g, spec, pose, x, y, s)      feet on (x, y), s = output units per local unit
//
// Local units: a kid is about 100 tall, y grows downwards, the ground is y = 0. Index 0 is
// the limb on the screen's left (the character's RIGHT, palms to the camera), 1 the other.
//
// Pose (all optional):
//   hip: [dx, drop]            the hips move sideways / come down (a crouch)
//   turn                       −1..1: the body turns to the screen's left/right: the far
//                              shoulder and hip come in, both feet point that way
//   lean                       spine rotation, radians, + leans to the screen's right
//   tilt                       extra rotation of the shoulder line (one shoulder up)
//   feet: [[x, lift, rot, o], ×2] ankles: x from the centre, lift off the ground, shoe rotation;
//                              o: { flip, scale, view: 'side'|'sole' } (a boot kicked at the
//                              camera is bigger and shows its sole)
//   handScale: [k, k]          a hand held towards the camera is bigger
//   knee: [±1, ±1]             which side each knee bends to (default outwards)
//   arms: [[a1, a2], ×2]       upper arm from straight down, + outwards (π = straight up);
//                              a2 = the forearm's extra bend, same sense
//   hands: ['open'|'relaxed'|'fist'|'thumb'|'point', ×2], handRot, handBack: [bool, bool]
//   armFront: [bool|'fore', ×2] the arm passes in front of the torso and the head; 'fore':
//                              only the forearm does (a fist on a hip), the upper arm and
//                              its sleeve stay behind the body
//   head: { tilt, turn, dx, dy }   turn −1..1: a real three-quarter head (1 = looking screen
//                              right): the eyes part, the far one reaches the edge, the nose
//                              goes between them, the near ear moves inside the outline. A
//                              head turned left is the mirror image of one turned right.
//   face: { look: [x, y], lid, blink, brow, mouth, wide }
const SkateKid = (() => {
    const T = SkateToon;
    const C = T.COL;
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
    const mul = (a, k) => [a[0] * k, a[1] * k];
    const mix = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    const unit = (a) => {
        const l = Math.hypot(a[0], a[1]) || 1;
        return [a[0] / l, a[1] / l];
    };
    const shade = (hex, k) => {
        const n = parseInt(hex.slice(1), 16);
        const f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
        return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join('');
    };

    const DEF = {
        seed: 'kid', skin: C.skin,
        leg: 30, ankle: 8.4, torso: 23, neck: 5.5, shoulder: 9.5, hipW: 6, stance: 11.5,
        upper: 14, fore: 13.5, hand: 12.5, armD: [3.7, 3.1], legD: [4.3, 3.6], neckD: 3.7,
        head: { w: 46, h: 36, pts: null },
        eye: { x: 0, y: -2, r: [7.2, 6.6], gap: 0.6, pupil: 0.19, lash: false, brow: false, tall: 1.08 },
        nose: { x: 0, y: 5, kind: 'c', size: 3 },
        mouth: { x: 0, y: 11, w: 20, gap: false, braces: false },
        ear: { y: 2, r: 4.6 },
        freckles: null,
        top: { color: C.yellow, sleeve: 9.5, sleeveW: 12.5, bw: 16, hem: 3.5, neckW: 4.3, collar: 'round', collarColor: null },
        bottom: { kind: 'shorts', color: C.maroon, len: 1.12, wide: [12.5, 15], band: null },
        shoes: { upper: C.shoe, sole: C.white, stripe: C.roadLine, size: 1 },
        socks: null, pads: null,
    };
    const POSE = {
        hip: [0, 0], turn: 0, lean: 0, tilt: 0, feet: null, handScale: [1, 1], knee: [-1, 1], arms: [[0.4, 0.2], [0.4, 0.2]],
        hands: ['open', 'open'], handRot: [0, 0], handBack: [false, false], armFront: [false, false],
        head: { tilt: 0, turn: 0, dx: 0, dy: 0 }, face: { look: [0, 0], lid: 0, blink: false, brow: 0, mouth: 'smile', wide: 1 },
    };
    const pair = (v, a = 1.08, b = 0.92) => (Array.isArray(v) ? v : [v * a, v * b]);
    const merge = (spec) => {
        const S = { ...DEF, ...spec };
        for (const k of ['head', 'eye', 'nose', 'mouth', 'ear', 'top', 'bottom', 'shoes']) S[k] = { ...DEF[k], ...(spec[k] ?? {}) };
        S.armD = pair(S.armD);
        S.legD = pair(S.legD);
        S.bottom.wide = pair(S.bottom.wide, 0.92, 1.1);
        return S;
    };
    const mergePose = (pose = {}) => ({ ...POSE, ...pose, head: { ...POSE.head, ...(pose.head ?? {}) }, face: { ...POSE.face, ...(pose.face ?? {}) } });

    // Two-bone IK: the joint between a and b with bone lengths l1, l2, bent to side `dir` (x).
    function bend(a, b, l1, l2, dir) {
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const d0 = Math.hypot(dx, dy) || 1e-6;
        const d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(l1 + l2 - 0.01, d0));
        const ux = dx / d0, uy = dy / d0;
        const x = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
        let px = -uy, py = ux;
        if (Math.abs(px) < 0.05) {
            if (py > 0) (px = -px), (py = -py); // a level limb bends upwards
        } else if (Math.sign(px) !== Math.sign(dir)) (px = -px), (py = -py);
        const k = d0 / d; // a foot out of reach stretches the leg instead of leaving it
        return [a[0] + (ux * x + px * h) * k, a[1] + (uy * x + py * h) * k];
    }

    /** Joints of a spec in a pose (local units). */
    function rig(spec, pose) {
        const S = spec.__merged ? spec : merge(spec), P = mergePose(pose);
        const feet = P.feet ?? [[-S.stance, 0, 0], [S.stance, 0, 0]];
        const ankle = feet.map(([x, lift]) => [x, -(S.ankle + lift)]);
        const hipC = [P.hip[0], -(S.ankle + S.leg) + P.hip[1]];
        const bt = P.turn, far = (sd) => 1 - 0.32 * Math.max(0, sd * bt) + 0.08 * Math.max(0, -sd * bt);
        const hipJ = [[hipC[0] - S.hipW * far(-1), hipC[1]], [hipC[0] + S.hipW * far(1), hipC[1]]];
        const knee = [0, 1].map((i) => bend(hipJ[i], ankle[i], S.leg / 2, S.leg / 2, P.knee[i]));
        const tor = (p) => add(hipC, rot(p, P.lean));
        const neckBase = tor([0, -S.torso]);
        const sh = [-1, 1].map((s) => add(neckBase, rot([s * S.shoulder * far(s), 1.4], P.lean + P.tilt)));
        const dir = (i, a) => rot([(i ? 1 : -1) * Math.sin(a), Math.cos(a)], P.lean);
        const elbow = [0, 1].map((i) => add(sh[i], mul(dir(i, P.arms[i][0]), S.upper)));
        const wrist = [0, 1].map((i) => add(elbow[i], mul(dir(i, P.arms[i][0] + P.arms[i][1]), S.fore)));
        const headC = add(add(neckBase, rot([0, -(S.neck + S.head.h / 2 - 1.5)], P.lean * 0.6)), [P.head.dx, P.head.dy]);
        return { S, P, feet, ankle, hipC, hipJ, knee, tor, neckBase, sh, elbow, wrist, headC, far, headRot: P.lean * 0.6 + P.head.tilt };
    }
    // a soft joint: the limb's centreline rounds the corner instead of breaking at it
    const soft = (a, j, b, k = 0.72) => [a, mix(a, j, k), j, mix(j, b, 1 - k), b];

    // --- shoes --------------------------------------------------------------------------------
    // A chunky boot in three-quarter view pointing to +x: a round toe box, a tongue standing
    // out of the opening, lace bars, a heel tab, and a thick sole with a coloured welt and a
    // tread. The ankle is at the origin, the sole's bottom at y = +ankle. `flip` mirrors it.
    function shoe(g, K, sh, flip, key) {
        const z = (K.S.ankle / 11) * (sh.size ?? 1), w = K.w, hi = sh.high ? -3.6 : 0;
        const p = (pts) => pts.map(([x, y, c]) => [(flip ? -x : x) * z, y * z, c]);
        // the tongue
        T.shape(g, p([[0.4, -6.6 + hi, 1], [1, -11 + hi], [4.4, -11.8 + hi], [6.6, -9.2 + hi], [7.4, -5 + hi * 0.6, 1]]), { fill: sh.tongue ?? sh.upper, w, seed: key + 'tg' });
        // the upper: collar, instep, a toe box that swells
        T.shape(g, p([[-6.4, -5.2 + hi, 1], [-5.4, -8.4 + hi], [-1, -9 + hi], [2.6, -7.6 + hi, 1], [6.4, -5.4 + hi * 0.5], [11, -4.6], [16.4, -4.4], [21.4, -2.2], [23.8, 2.2], [23, 6.8, 1], [8, 7.2], [-7.2, 6.6, 1], [-8.2, 0]]), { fill: sh.upper, w, seed: key + 'u' });
        if (sh.cap) T.shape(g, p([[14.6, -4.6, 1], [16.4, -4.4], [21.4, -2.2], [23.8, 2.2], [23, 6.8, 1], [15.4, 7.2, 1], [16.2, 1.4]]), { fill: sh.cap, w: K.fine, seed: key + 'cap' });
        else T.line(g, p([[14.6, -4.4], [16.2, 1.4], [15.4, 6.6]]), { w: K.fine, seed: key + 'c' });
        if (sh.velcro) {
            for (const [x0, k] of [[5, 0], [9.4, 1]]) T.shape(g, p([[x0, -6.8 + k * 0.9 + hi * 0.5, 1], [x0 + 3.6, -6.2 + k * 0.9 + hi * 0.4, 1], [x0 + 5.8, 0.4 + k * 0.5, 1], [x0 + 2.4, -0.2 + k * 0.5, 1]]), { fill: sh.velcro, w: K.fine, seed: key + 'v' + k });
        } else {
            // lace bars across the instep
            const bars = sh.high ? [[3.6, -10.2, 7.4, -8.2], [5.4, -7.6, 9.6, -5.8], [8, -5.4, 12, -3.9], [11, -3.6, 14.2, -2.4]] : [[4.6, -7.4 + hi, 8.6, -5.6 + hi], [7.4, -5.2, 11.4, -3.8], [10.6, -3.6, 14, -2.4]];
            bars.forEach(([x0, y0, x1, y1], i) => T.line(g, p([[x0, y0], [x1, y1]]), { w: K.fine, seed: key + 'l' + i, color: sh.lace ?? C.ink }));
        }
        // heel tab and counter
        T.line(g, p([[-5.2, -7.4 + hi], [-3.8, -1], [-5.4, 5.4]]), { w: K.fine, seed: key + 'h' });
        T.line(g, p([[-6.8, -5.6 + hi], [-8.4, -7.4 + hi], [-6.2, -8.6 + hi]]), { w: K.fine, seed: key + 'tab' });
        if (sh.high) {
            const [cx, cy] = p([[0.6, -3.4]])[0];
            T.shape(g, T.ellipse(cx, cy, 2.6 * z, 2.5 * z, 0, 10), { fill: sh.patch ?? C.white, w: K.fine, seed: key + 'pt' });
            g.fillStyle = sh.stripe ?? C.red;
            g.beginPath();
            for (let i = 0; i < 10; i++) {
                const a = -Math.PI / 2 + (i / 10) * Math.PI * 2, r = (i % 2 ? 0.75 : 1.7) * z;
                g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
            }
            g.fill();
        }
        // the sole: a thick slab that curls up at the toe, a welt in colour, a tread
        T.shape(g, p([[-8, 5.6, 1], [8, 6.6], [23.8, 5.4, 1], [25.6, 7.6], [24.8, 10], [22.6, 11, 1], [8, 11.2], [-7.6, 11, 1], [-9, 8.4]]), { fill: sh.sole, w, seed: key + 's' });
        if (sh.stripe) {
            T.line(g, p([[-8.4, 7.9], [8, 8.7], [25, 7.7]]), { w: K.fine * 0.8 + w * 0.9, seed: key + 'st0', taper: false, cap: 'butt' });
            T.line(g, p([[-8.4, 7.9], [8, 8.7], [25, 7.7]]), { w: w * 0.9, seed: key + 'st0', color: sh.stripe, taper: false, cap: 'butt' });
        }
        for (const tx of [-4, 0.6, 5.2, 9.8, 14.4, 19]) T.line(g, p([[tx, 9.9], [tx + 0.4, 11]]), { w: K.fine * 0.8, seed: key + 'tr' + tx, amp: 0 });
    }

    function legs(g, K) {
        const { S, J, w } = K;
        const pants = S.bottom.kind === 'pants';
        for (const i of [0, 1]) {
            if (!pants) T.shape(g, T.ribbon(soft(J.hipJ[i], J.knee[i], J.ankle[i]), S.legD[0], S.legD[1]), { fill: S.skin, w, seed: S.seed + 'leg' + i, dense: true });
            if (S.socks) {
                // a slouchy sock: wider than the leg, wrinkled, a hem at the top
                const a = J.ankle[i], top = mix(a, J.knee[i], S.socks.up), d = S.legD[1] + 1.5;
                T.shape(g, T.ribbon([top, mix(top, a, 0.5), add(a, [0, 1])], d + 0.5, d + 0.9, { wave: [0.3, 5] }), { fill: S.socks.color, w, seed: S.seed + 'sock' + i, dense: true });
                const u = unit(sub(a, top)), n = [-u[1], u[0]], r = d / 2;
                for (const [k, col] of (S.socks.stripes ?? []).entries()) {
                    const q = mix(top, a, 0.16 + k * 0.17);
                    T.line(g, [add(q, mul(n, -r)), add(q, mul(n, r))], { w: K.fine * 1.25, seed: S.seed + 'ss' + i + k, color: col, taper: false, amp: 0.1, cap: 'butt' });
                }
                for (const k of [0.52, 0.74]) {
                    const q = mix(top, a, k), s = i ? 1 : -1;
                    T.line(g, [add(q, mul(n, s * r * 0.9)), add(add(q, mul(n, s * r * 0.1)), mul(u, 0.8))], { w: K.fine, seed: S.seed + 'sw' + i + k });
                }
            }
        }
    }
    // The same boot kicked at the camera: its sole, toe towards −y, a sliver of the upper at
    // the instep's side. The ankle is at the origin (behind the heel).
    function shoeSole(g, K, sh, flip, key) {
        const z = (K.S.ankle / 11) * (sh.size ?? 1), w = K.w;
        const p = (pts) => pts.map(([x, y, c]) => [(flip ? -x : x) * z, y * z, c]);
        T.shape(g, p([[-5.4, 5, 1], [-10.4, -3], [-10.6, -12], [-7.4, -19], [-6.6, -11], [-6, -2]]), { fill: sh.upper, w, seed: key + 'su' });
        const out = [[-5.4, 6.4], [-6.6, -2], [-7.6, -12], [-5.6, -19.6], [0, -22.6], [5.8, -19.8], [8.4, -12], [7.2, -3], [6.2, 6.4], [3.2, 10], [-2.6, 10]];
        T.shape(g, p(out), { fill: sh.sole, w, seed: key + 'so' });
        if (sh.stripe) T.line(g, p(out.map(([x, y]) => [x * 0.86, (y + 6) * 0.9 - 6])), { w: w * 0.8, seed: key + 'sw', color: sh.stripe, closed: true });
        // the tread: a block under the ball of the foot, one under the heel, ribs across both
        const fore = [[-4.6, -5.4, 1], [-5, -12], [-3.6, -17.4], [0, -19.4], [3.8, -17.6], [5.6, -12], [4.8, -5.2, 1]];
        const heel = [[-3.6, 0.2, 1], [3.8, 0.2, 1], [4, 5], [1.8, 7.4], [-1.6, 7.4], [-3.8, 5]];
        T.shape(g, p(fore), { fill: sh.tread ?? C.grey, w: K.fine, seed: key + 'tf' });
        T.shape(g, p(heel), { fill: sh.tread ?? C.grey, w: K.fine, seed: key + 'th' });
        for (const y of [-16.4, -13.8, -11.2, -8.6]) T.line(g, p([[-4.4 + Math.abs(y + 12) * 0.14, y], [4.6 - Math.abs(y + 12) * 0.14, y + 0.3]]), { w: K.fine * 0.9, seed: key + 'rb' + y, amp: 0.1 });
        for (const y of [2.4, 4.6]) T.line(g, p([[-3.2, y], [3.4, y + 0.2]]), { w: K.fine * 0.9, seed: key + 'rh' + y, amp: 0.1 });
        const [ax, ay] = p([[0.4, -2.6]])[0];
        T.shape(g, T.ellipse(ax, ay, 2.2 * z, 1.3 * z, 0, 8), { fill: sh.stripe ?? C.red, w: K.fine * 0.8, seed: key + 'arch' });
    }
    function shoes(g, K) {
        const { S, J } = K, bt = K.P.turn;
        // the far foot first, so a boot kicked forwards lies over the other leg
        const order = (J.feet[0][3]?.scale ?? 1) > (J.feet[1][3]?.scale ?? 1) ? [1, 0] : [0, 1];
        for (const i of order) {
            const o = J.feet[i][3] ?? {};
            const flip = o.flip ?? (Math.abs(bt) > 0.45 ? bt < 0 : i === 0);
            g.save();
            g.translate(J.ankle[i][0], J.ankle[i][1]);
            g.rotate(J.feet[i][2] ?? 0);
            if (o.scale) g.scale(o.scale, o.scale);
            const KK = o.scale ? { ...K, w: K.w / o.scale, fine: K.fine / o.scale } : K;
            (o.view === 'sole' ? shoeSole : S.shoe ?? shoe)(g, KK, S.shoes, flip, S.seed + 'shoe' + i);
            g.restore();
        }
    }

    // Shorts like a box, or trousers: a pelvis and two wide legs in one piece, each ending
    // in a hem with its band; folds from the crotch and above the hem.
    function bottom(g, K) {
        const { S, J, w } = K, B = S.bottom, hc = J.hipC, [w0, w1] = B.wide;
        const top = S.hipW + w0 * 0.5;
        const pelvis = T.path([[hc[0] - top, hc[1] - 5, 1], [hc[0] + top, hc[1] - 5, 1], [hc[0] + top + 0.4, hc[1] + 2], [hc[0], hc[1] + w0 * 0.5], [hc[0] - top - 0.4, hc[1] + 2]], true);
        const parts = [pelvis], hems = [];
        for (const i of [0, 1]) {
            const h = J.hipJ[i], k = J.knee[i], a = J.ankle[i];
            let line, end, u;
            if (B.kind === 'pants') {
                end = mix(k, a, B.len ?? 0.94);
                line = soft(h, k, end);
                u = unit(sub(end, k));
            } else {
                const L = B.len * (S.leg / 2);
                u = unit(sub(k, h));
                // past the knee the cloth hangs straight down
                end = B.len <= 1 ? add(h, mul(u, L)) : add(k, mul(unit(add(mul(u, 0.35), [0, 1])), L - S.leg / 2));
                line = B.len <= 1 ? [h, end] : soft(h, k, end, 0.8);
                if (B.len > 1) u = unit(sub(end, k));
            }
            parts.push(T.ribbon(line, w0, w1, { step: 0.6 }));
            hems.push([end, u, w1, h]);
        }
        T.skin(g, parts, { fill: B.color, w, seed: S.seed + 'bot' });
        hems.forEach(([e, u, d, hj], i) => {
            const n = [-u[1], u[0]], r = d / 2, s = i ? 1 : -1;
            // the hem bows towards us; its band is a second line (or a strip of colour)
            const hem = (off, bow) => [add(add(e, mul(n, -r - w * 0.2)), mul(u, off)), add(e, mul(u, off + bow)), add(add(e, mul(n, r + w * 0.2)), mul(u, off))];
            if (B.band) T.shape(g, [...T.path(hem(-2.6, 0.9)), ...T.path(hem(0, 1.1)).reverse()], { fill: B.band, w: K.fine, seed: S.seed + 'band' + i, dense: true });
            else T.line(g, hem(-2.2, 0.9), { w: K.fine, seed: S.seed + 'hem2' + i, taper: false });
            T.line(g, hem(0, 1.1), { w, seed: S.seed + 'hem' + i, taper: false });
            // folds: two from the crotch, one above the hem
            const c0 = add(hc, [s * 1.2, w0 * 0.34]);
            T.line(g, [c0, add(c0, [s * 3.4, 2.2]), add(c0, [s * 5.6, 5.4])], { w: K.fine, seed: S.seed + 'fold' + i });
            T.line(g, [add(hj, [s * w0 * 0.42, 0.6]), add(hj, [s * w0 * 0.2, 2.6]), add(hj, [s * w0 * 0.3, 5.2])], { w: K.fine, seed: S.seed + 'foldb' + i });
            T.line(g, [add(add(e, mul(n, s * r * 0.5)), mul(u, -6.4)), add(add(e, mul(n, s * r * 0.1)), mul(u, -4.6))], { w: K.fine, seed: S.seed + 'foldc' + i });
        });
        // the middle seam
        T.line(g, [[hc[0] + 0.3, hc[1] - 3], [hc[0] - 0.2, hc[1] + w0 * 0.44]], { w: K.fine, seed: S.seed + 'seam' });
        if (B.draw) B.draw(g, K, hems);
        if (S.pads) for (const i of [0, 1]) {
            const k = J.knee[i], u = unit(sub(J.ankle[i], J.hipJ[i])), a = Math.atan2(u[1], u[0]) - Math.PI / 2;
            T.shape(g, T.ellipse(k[0], k[1], S.legD[0] * 1.2, S.legD[0] * 1.5, a, 12), { fill: S.pads, w, seed: S.seed + 'pad' + i });
            const n = [-u[1], u[0]];
            T.line(g, [add(k, mul(n, -S.legD[0] * 0.7)), add(k, mul(u, -0.6)), add(k, mul(n, S.legD[0] * 0.7))], { w: K.fine, seed: S.seed + 'padl' + i });
        }
    }

    // A flap sleeve: far wider than the arm, its hem a wave, one fold along it.
    function sleeve(g, K, i) {
        const { S, J, w } = K, tp = S.top;
        if (!tp.sleeve) return;
        const s = i ? 1 : -1;
        const u = unit(sub(J.elbow[i], J.sh[i]));
        // n points to the sleeve's upper/outer edge whichever way the arm goes
        let n = [-u[1], u[0]];
        if (n[1] > 0 || (Math.abs(n[1]) < 0.2 && n[0] * s < 0)) n = mul(n, -1);
        const L = tp.sleeve, W = tp.sleeveW, at = (a, b) => add(add(J.sh[i], mul(u, a)), mul(n, b));
        T.shape(g, [[...at(-2.6, 3.8), 1], at(L * 0.5, W * 0.5), [...at(L, W * 0.54), 1], at(L + 1, W * 0.2), at(L + 0.1, -W * 0.14), [...at(L - 0.9, -W * 0.52), 1], at(L * 0.45, -W * 0.44), [...at(0.6, -5), 1]], {
            fill: tp.sleeveColor ?? tp.color, w, seed: S.seed + 'slv' + i,
            inside: tp.sleevePrint ? (gg) => tp.sleevePrint(gg, K, at, L, W) : null,
        });
        if (tp.cuff) T.line(g, [at(L - 2, W * 0.5), at(L - 1.1, W * 0.18), at(L - 2, -W * 0.14), at(L - 2.8, -W * 0.47)], { w: K.fine * 1.1, seed: S.seed + 'cuff' + i, color: tp.cuff, taper: false });
        T.line(g, [at(1.4, 1.6), at(L * 0.5, 0.4), at(L - 2.6, -W * 0.22)], { w: K.fine, seed: S.seed + 'sf' + i });
        T.line(g, [at(L - 3.4, W * 0.3), at(L - 1.4, W * 0.36)], { w: K.fine, seed: S.seed + 'sg' + i });
    }
    // part: 'all', 'back' (the whole arm without its hand: the half of a 'fore' arm that stays
    // behind the body) or 'fore' (the same drawing, clipped to beyond the elbow)
    function arm(g, K, i, part = 'all') {
        const { S, J, P, w } = K;
        const fa = unit(sub(J.wrist[i], J.elbow[i]));
        if (part === 'fore') {
            // everything past a line across the forearm just below the elbow
            // a narrow band along the forearm, starting where the upper arm has left it (so a
            // folded arm brings none of itself, or of its sleeve, forward), widening for the hand
            const ua = unit(sub(J.sh[i], J.elbow[i])), sin = Math.abs(ua[0] * fa[1] - ua[1] * fa[0]);
            const nar = S.armD[0] / 2 + w * 1.6, k0 = Math.min(S.fore * 0.5, (S.armD[0] / 2 + w * 2 + 1.2) / Math.max(0.4, sin) + 1);
            const c = add(J.elbow[i], mul(fa, k0)), n = [-fa[1], fa[0]], lat = S.hand, L = S.fore - k0 - 3, far = S.fore + S.hand * 1.5;
            g.save();
            g.beginPath();
            for (const [a, b] of [[-nar, 0], [nar, 0], [nar, L], [lat, L], [lat, far], [-lat, far], [-lat, L], [-nar, L]]) g.lineTo(c[0] + n[0] * a + fa[0] * b, c[1] + n[1] * a + fa[1] * b);
            g.clip();
        }
        const th = Math.atan2(fa[0], -fa[1]) + (P.handRot[i] ?? 0);
        const loc = (p) => rot(sub(p, J.wrist[i]), -th);
        const poly = T.ribbon(soft(J.sh[i], J.elbow[i], J.wrist[i]), S.armD[0], S.armD[1], { step: 0.5 }).map(loc);
        g.save();
        g.translate(J.wrist[i][0], J.wrist[i][1]);
        g.rotate(th);
        T.hand(g, P.hands[i], S.hand * (P.handScale[i] ?? 1), { side: i === 0 ? 'R' : 'L', back: P.handBack[i], fill: S.skin, w, seed: S.seed + 'hand' + i, arm: { poly }, armOnly: part === 'back' });
        g.restore();
        if (part === 'back') return sleeve(g, K, i);
        if (S.wrist?.[i]) {
            const q = mix(J.wrist[i], J.elbow[i], 0.2), n = [-fa[1], fa[0]], r = S.armD[1] / 2 + w * 0.4;
            T.shape(g, [[...add(add(q, mul(n, -r)), mul(fa, -1.1)), 1], [...add(add(q, mul(n, r)), mul(fa, -1.1)), 1], [...add(add(q, mul(n, r)), mul(fa, 1.1)), 1], [...add(add(q, mul(n, -r)), mul(fa, 1.1)), 1]], { fill: S.wrist[i], w: K.fine, seed: S.seed + 'wb' + i });
        }
        if (part === 'fore') g.restore();
        else sleeve(g, K, i);
    }

    // The shirt: hung from the shoulders, wider at the hem, which sags and ripples; the cloth
    // below the chest hangs towards the ground whatever the spine does.
    function torso(g, K) {
        const { S, J, w } = K, tp = S.top, t = S.torso, P = K.P;
        const bt = P.turn, sw = S.shoulder + 2.4, bw = tp.bw, hem = tp.hem, nk = tp.neckW;
        const sx = (sd) => sd * (S.shoulder * J.far(sd) + 2.4), bx = (sd) => sd * bw * (1 - 0.2 * Math.max(0, sd * bt)), nx = bt * 1.8;
        const hang = -Math.sin(P.lean) * (t + hem) * 0.55; // the hem lags behind a lean
        const shY = (s) => -t + 1.2 + Math.sin(P.tilt) * s * S.shoulder;
        const hemY = (x) => hem + 1.3 * (1 - Math.pow(x / bw, 2)) + 0.5 * Math.sin((x / bw) * 5 + 1);
        const hx = (x) => x + hang;
        const outline = [
            [nx - nk, shY(-1) - 1.7, 1], [sx(-1), shY(-1), 1], [sx(-1) - 0.5, -t + 7.5], [bx(-1) * 0.96 + hang * 0.4, -t * 0.34],
            [hx(bx(-1)), hem - 0.3, 1], [hx(bx(-1) * 0.5), hemY(-bw * 0.5)], [hx(0), hemY(0)], [hx(bx(1) * 0.5), hemY(bw * 0.5)], [hx(bx(1)), hem - 0.5, 1],
            [bx(1) * 0.96 + hang * 0.4, -t * 0.34], [sx(1) + 0.5, -t + 7.5], [sx(1), shY(1), 1], [nx + nk, shY(1) - 1.7, 1],
            ...(tp.collar === 'v' ? [[nx, -t + 5.4, 1]] : [[nx + nk * 0.6, -t + 1.4], [nx, -t + 2.3], [nx - nk * 0.6, -t + 1.4]]),
        ];
        // B.fx: how far the chest's middle has turned (prints and pockets follow it)
        const B = { t, bw, hem, sw, nk, hang, hemY, hx, nx, fx: bt * bw * 0.22 };
        g.save();
        g.translate(J.hipC[0], J.hipC[1]);
        g.rotate(P.lean);
        T.shape(g, outline, { fill: tp.color, w, seed: S.seed + 'top', inside: tp.print ? (gg) => tp.print(gg, K, B) : null });
        // folds: from each armpit (under a sleeve), and a crease that echoes the hem
        if (tp.sleeve) {
            T.line(g, [[-sw + 0.6, -t + 8.6], [-sw + 3.2, -t + 11.4], [-sw + 3.4, -t + 14.6]], { w: K.fine, seed: S.seed + 'tf1' });
            T.line(g, [[sw - 0.8, -t + 9], [sw - 3, -t + 12.4]], { w: K.fine, seed: S.seed + 'tf2' });
        }
        T.line(g, [[hx(-bw * 0.72), hem - 3.4], [hx(-bw * 0.2), hemY(-bw * 0.2) - 2.9], [hx(bw * 0.3), hemY(bw * 0.3) - 3.3]], { w: K.fine, seed: S.seed + 'tf3' });
        T.line(g, [[hx(bw * 0.86), hem - 6.6], [hx(bw * 0.7), hem - 3.2]], { w: K.fine, seed: S.seed + 'tf4' });
        if (tp.draw) tp.draw(g, K, B);
        g.restore();
    }
    function neck(g, K) {
        const { S, J, w } = K, tp = S.top, t = S.torso;
        const nx = K.P.turn * 1.8;
        const base = J.tor([nx, -t + 2.4]);
        T.shape(g, T.ribbon([base, J.headC], S.neckD, S.neckD * 0.94), { fill: S.skin, w, seed: S.seed + 'neck', dense: true });
        if (tp.collar === 'round') {
            // the collar's rib passes in front of the neck
            const nk = tp.neckW;
            g.save();
            g.translate(J.hipC[0], J.hipC[1]);
            g.rotate(K.P.lean);
            g.translate(nx, 0);
            const band = T.ribbon([[-nk - 0.2, -t - 0.9], [-nk * 0.62, -t + 1.7], [0, -t + 2.7], [nk * 0.62, -t + 1.7], [nk + 0.2, -t - 0.9]], 2.3, 2.3);
            T.shape(g, band, { fill: tp.collarColor ?? tp.color, w: K.fine, seed: S.seed + 'col', dense: true });
            for (const x of [-0.5, -0.2, 0.12, 0.42]) T.line(g, [[x * nk * 1.7, -t + 1.3 + (1 - Math.abs(x) * 2.2) * 0.6], [x * nk * 1.9, -t + 3.2 + (1 - Math.abs(x) * 2.2) * 0.8]], { w: K.fine * 0.75, seed: S.seed + 'rib' + x, amp: 0 });
            g.restore();
        }
    }

    // --- the face -----------------------------------------------------------------------------
    function eyes(g, K, H) {
        const { S, w } = K, E = S.eye, F = K.P.face;
        const wide = F.wide ?? 1;
        // the head's frame always faces right: eye 0 is the near one, eye 1 the far one, which
        // narrows and moves out to the edge as the head turns, the nose coming between them
        const a = H.turn, gap = E.gap + a * (E.spread ?? S.head.w * 0.085);
        H.eyes = [0, 1].map((i) => {
            const ry = E.r[i] * (i ? 1 - 0.08 * a : 1 + 0.05 * a) * (E.tall ?? 1.08) * wide;
            const r = E.r[i] * (i ? 1 - 0.24 * a : 1 + 0.05 * a) * wide;
            return { r, ry, y: E.y + (i ? 0.5 + a * 1.2 : -0.3) };
        });
        H.eyes[0].x = E.x + H.fx - gap / 2 - H.eyes[0].r;
        H.eyes[1].x = E.x + H.fx + gap / 2 + H.eyes[1].r;
        H.eyes.forEach((e, i) => {
            const key = S.seed + 'eye' + i, s = i ? 1 : -1;
            if (F.blink) {
                T.line(g, [[e.x - e.r * 0.95, e.y - e.r * 0.05], [e.x, e.y + e.r * 0.45], [e.x + e.r * 0.95, e.y - e.r * 0.05]], { w, seed: key + 'b' });
                if (E.lash) for (let k = 0; k < 3; k++) T.line(g, [[e.x + s * e.r * (0.25 + k * 0.3), e.y + e.r * (0.38 - k * 0.14)], [e.x + s * e.r * (0.42 + k * 0.36), e.y + e.r * (0.74 - k * 0.12)]], { w: K.fine, seed: key + 'bl' + k });
            } else {
                const lid = Math.max(0, Math.min(0.85, F.lid ?? 0));
                const pr = e.r * (E.pupil ?? 0.19);
                let lx = F.look[0] * H.d, ly = F.look[1];
                const ll = Math.hypot(lx, ly);
                if (ll > 1) (lx /= ll), (ly /= ll);
                const reach = e.r - pr - w * 0.9;
                const py = Math.max(e.y + ly * reach, e.y - e.ry + lid * 2 * e.ry + pr * 0.9);
                T.shape(g, T.ellipse(e.x, e.y, e.r, e.ry, s * 0.1, 14), {
                    fill: C.white, w, seed: key,
                    inside: (gg) => {
                        gg.fillStyle = C.ink;
                        gg.beginPath();
                        gg.ellipse(e.x + lx * reach, py, pr, pr * 1.1, 0, 0, Math.PI * 2);
                        gg.fill();
                        if (lid > 0) {
                            const yl = e.y - e.ry + lid * 2 * e.ry;
                            gg.fillStyle = S.lidColor ?? S.skin;
                            gg.fillRect(e.x - e.r * 1.2, e.y - e.ry * 1.3, e.r * 2.4, yl - (e.y - e.ry * 1.3));
                            T.line(gg, [[e.x - e.r * 1.1, yl - s * 0.3], [e.x, yl + e.r * 0.06], [e.x + e.r * 1.1, yl + s * 0.3]], { w, seed: key + 'lid' });
                        }
                    },
                });
                if (E.lash) {
                    // three lashes fanning from the outer top of each eye
                    for (let k = 0; k < 3; k++) {
                        const a = -Math.PI / 2 + s * (0.42 + k * 0.36);
                        const p0 = [e.x + Math.cos(a) * e.r * 0.98, e.y + Math.sin(a) * e.ry], p1 = [e.x + Math.cos(a + s * 0.14) * (e.r + 3.2), e.y + Math.sin(a + s * 0.14) * (e.ry + 3.2)];
                        T.line(g, [p0, p1], { w: K.fine, seed: key + 'la' + k });
                    }
                }
            }
            if (E.brow) {
                const b = F.brow ?? 0, by = e.y - e.ry - 2.8 - Math.max(0, b) * 1.8;
                // b < 0 frowns (inner ends down), b > 0 lifts
                T.line(g, [[e.x - s * e.r * 0.7, by + Math.min(0, b) * -2.6], [e.x + s * e.r * 0.1, by - 1 + Math.min(0, b) * -1], [e.x + s * e.r * 0.9, by + 0.9 + Math.min(0, b) * 1.2]], { w: w * (E.browW ?? 1.15), seed: key + 'br', taper: false });
            }
        });
    }
    function nose(g, K, H) {
        const { S, w } = K, N = S.nose, x = N.x + H.fx * 1.05 + H.turn * 1.6, y = N.y - H.turn * (N.rise ?? 1.2), z = N.size * (1 + 0.25 * H.turn);
        const d = 1; // the head's frame faces right
        const key = S.seed + 'nose';
        // 'c': a hook with a curl of nostril, as the genre draws small noses
        if (N.kind === 'c') T.line(g, [[x - d * z * 0.5, y - z * 1.1], [x + d * z * 0.5, y - z * 0.7], [x + d * z * 0.95, y + z * 0.1], [x + d * z * 0.4, y + z * 0.75], [x - d * z * 0.5, y + z * 0.55], [x - d * z * 0.75, y - z * 0.05], [x - d * z * 0.35, y - z * 0.3]], { w, seed: key });
        else if (N.kind === 'u') T.line(g, [[x - z * 0.9, y - z * 0.5], [x - z * 0.7, y + z * 0.45], [x, y + z * 0.75], [x + z * 0.7, y + z * 0.45], [x + z * 0.9, y - z * 0.5]], { w, seed: key });
        else if (N.kind === 'tri') T.line(g, [[x - d * z * 0.15, y - z * 1.5], [x + d * z * 1.05, y + z * 0.35, 1], [x + d * z * 0.2, y + z * 0.75], [x - d * z * 0.35, y + z * 0.5]], { w, seed: key });
        else if (N.kind === 'big') T.shape(g, [[x - d * z * 0.5, y - z * 1.3], [x + d * z * 0.9, y - z * 0.2], [x + d * z * 0.8, y + z * 0.8], [x - d * z * 0.4, y + z * 0.9], [x - d * z * 0.9, y]], { fill: N.color ?? S.skin, w, seed: key });
    }
    /**
     * Mouths, each built from its pieces (lips' line, a row of separate teeth, the dark of
     * the mouth, a tongue). kind: smile, grin (both rows of teeth, clenched), open (top teeth,
     * tongue), yell (wider, both rows), ooh, flat, frown, smirk. M.gap: a missing front
     * tooth; M.braces.
     */
    function mouth(g, K, H) {
        const { S, w } = K, M = S.mouth, kind = K.P.face.mouth ?? 'smile';
        const x = M.x + H.fx * 1.1, y = M.y, mw = M.w * (1 - 0.14 * H.turn), h = mw / 2;
        const key = S.seed + 'mouth';
        const cheeks = (yy = 0) => {
            for (const s of [-1, 1]) T.line(g, [[x + s * (h + 0.4), y + yy - 2.6], [x + s * (h + 1.9), y + yy - 0.6], [x + s * (h + 1.2), y + yy + 1.8]], { w: K.fine, seed: key + 'ch' + s });
        };
        // a row of n teeth hanging from the curve top(u) (u 0..1), each with a rounded end
        const row = (gg, top, n, len, up = false, id = 'r') => {
            for (let i = 0; i < n; i++) {
                const u0 = i / n, u1 = (i + 1) / n, a = top(u0), b = top(u1), d = up ? -1 : 1;
                if (M.gap && !up && i === (M.gapAt ?? Math.floor(n / 2))) continue;
                const l = len * (0.86 + 0.14 * Math.sin(((i + 0.5) / n) * Math.PI));
                T.shape(gg, [[a[0], a[1] - d * 2.5, 1], [b[0], b[1] - d * 2.5, 1], [b[0] - 0.1, b[1] + d * l * 0.7], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + d * l], [a[0] + 0.1, a[1] + d * l * 0.7]], { fill: C.white, w: K.fine, seed: key + id + i });
                if (M.braces && !up) {
                    const cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2 + l * 0.42;
                    gg.fillStyle = C.grey;
                    gg.strokeStyle = C.ink;
                    gg.lineWidth = K.fine * 0.45;
                    gg.fillRect(cx - 0.85, cy - 0.85, 1.7, 1.7);
                    gg.strokeRect(cx - 0.85, cy - 0.85, 1.7, 1.7);
                }
            }
            if (M.braces && !up) T.line(gg, Array.from({ length: 7 }, (_, i) => add(top(i / 6), [0, len * 0.42])), { w: K.fine * 0.6, seed: key + 'wire', color: C.greyDeep, taper: false, amp: 0 });
        };
        if (kind === 'smile') {
            T.line(g, [[x - h, y - 1.8], [x - h * 0.45, y + 1.6], [x + h * 0.45, y + 1.6], [x + h, y - 1.8]], { w, seed: key });
            cheeks(-1.4);
        } else if (kind === 'smirk') {
            T.line(g, [[x - h * 0.8, y + 0.8], [x - h * 0.1, y + 1.6], [x + h * 0.7, y - 0.2], [x + h, y - 2.6]], { w, seed: key });
            T.line(g, [[x + h + 0.6, y - 4.8], [x + h + 2, y - 2.6], [x + h + 1, y - 0.6]], { w: K.fine, seed: key + 'ch' });
            T.line(g, [[x - h * 0.3, y + 4], [x + h * 0.2, y + 4.2]], { w: K.fine, seed: key + 'lip' });
        } else if (kind === 'flat') T.line(g, [[x - h * 0.7, y + 0.3], [x, y], [x + h * 0.7, y + 0.4]], { w, seed: key });
        else if (kind === 'frown') {
            T.line(g, [[x - h * 0.8, y + 1.8], [x - h * 0.3, y - 0.8], [x + h * 0.3, y - 0.8], [x + h * 0.8, y + 1.8]], { w, seed: key });
        } else if (kind === 'ooh') T.shape(g, T.ellipse(x, y + 1, mw * 0.17, mw * 0.21, 0, 12), { fill: C.mouth, w, seed: key });
        else if (kind === 'grin') {
            // clenched: two rows meeting on a line that follows the smile
            const th = mw * 0.2, sag = 2.4;
            const mid = (u) => [x - h * 0.96 + u * mw * 0.96, y + th * 0.36 + sag * (1 - Math.pow(2 * u - 1, 2)) - 1.2];
            T.shape(g, [[x - h, y - 2.6, 1], [x - h * 0.45, y - 0.4], [x + h * 0.45, y - 0.4], [x + h, y - 2.6, 1], [x + h * 0.6, y + th + 1], [x, y + th + 2.4], [x - h * 0.6, y + th + 1]], {
                fill: C.white, w, seed: key,
                inside: (gg) => {
                    T.line(gg, Array.from({ length: 9 }, (_, i) => mid(i / 8)), { w: K.fine, seed: key + 'mid', taper: false });
                    for (let i = 1; i < 7; i++) {
                        const p = mid(i / 7), q = mid((i - 0.5) / 7);
                        T.line(gg, [[p[0], p[1] - th], [p[0], p[1]]], { w: K.fine, seed: key + 'tu' + i, amp: 0.1, taper: false });
                        T.line(gg, [[q[0], q[1]], [q[0], q[1] + th]], { w: K.fine, seed: key + 'tl' + i, amp: 0.1, taper: false });
                    }
                    if (M.gap) {
                        const p = mid(0.5 + 1 / 14);
                        gg.fillStyle = C.mouth;
                        gg.fillRect(p[0] - mw * 0.075, p[1] - th - 1, mw * 0.075, th + 0.6);
                        T.line(gg, [[p[0] - mw * 0.075, p[1] - th], [p[0] - mw * 0.075, p[1]]], { w: K.fine, seed: key + 'gp', amp: 0, taper: false });
                    }
                    if (M.braces) {
                        T.line(gg, Array.from({ length: 9 }, (_, i) => add(mid(i / 8), [0, -th * 0.48])), { w: K.fine * 0.6, seed: key + 'wire', color: C.greyDeep, taper: false, amp: 0 });
                        for (let i = 0; i < 7; i++) {
                            const p = add(mid((i + 0.5) / 7), [0, -th * 0.48]);
                            gg.fillStyle = C.grey;
                            gg.strokeStyle = C.ink;
                            gg.lineWidth = K.fine * 0.45;
                            gg.fillRect(p[0] - 0.9, p[1] - 0.9, 1.8, 1.8);
                            gg.strokeRect(p[0] - 0.9, p[1] - 0.9, 1.8, 1.8);
                        }
                    }
                },
            });
            cheeks(-2.4);
        } else {
            // open / yell: a bowl under a smiling top lip
            const dep = kind === 'yell' ? mw * 0.74 : mw * 0.5, th = mw * 0.17;
            const top = (u) => [x - h * 0.94 + u * mw * 0.94, y - 2 + 2 * (1 - Math.pow(2 * u - 1, 2))];
            T.shape(g, [[x - h, y - 2.4, 1], [x - h * 0.4, y - 0.4], [x + h * 0.4, y - 0.4], [x + h, y - 2.4, 1], [x + h * 0.82, y + dep * 0.55], [x + h * 0.32, y + dep], [x - h * 0.32, y + dep], [x - h * 0.82, y + dep * 0.55]], {
                fill: C.mouth, w, seed: key,
                inside: (gg) => {
                    // the dark at the back, then the tongue, then the teeth
                    gg.fillStyle = '#3d0f17';
                    gg.beginPath();
                    gg.ellipse(x, y + dep * 0.28, h * 0.62, dep * 0.3, 0, 0, Math.PI * 2);
                    gg.fill();
                    T.shape(gg, [[x - h * 0.56, y + dep * 1.1], [x - h * 0.5, y + dep * 0.72], [x - h * 0.12, y + dep * 0.56], [x + h * 0.2, y + dep * 0.62], [x + h * 0.58, y + dep * 0.78], [x + h * 0.6, y + dep * 1.1]], { fill: C.tongue, w: K.fine, seed: key + 'tg' });
                    T.line(gg, [[x + h * 0.02, y + dep * 0.64], [x + h * 0.08, y + dep * 0.92]], { w: K.fine, seed: key + 'tl' });
                    row(gg, top, 6, th + 1.2);
                    if (kind === 'yell') row(gg, (u) => [x - h * 0.6 + u * mw * 0.6, y + dep * (0.86 + 0.16 * (1 - Math.pow(2 * u - 1, 2)))], 5, th * 0.8, true, 'lo');
                },
            });
            cheeks(-2.2);
            T.line(g, [[x - h * 0.28, y + dep + 2.8], [x + h * 0.02, y + dep + 3.4], [x + h * 0.3, y + dep + 2.6]], { w: K.fine, seed: key + 'lip' });
        }
    }
    function ears(K, H) {
        const { S } = K, r = S.ear.r, hw = S.head.w / 2, a = H.turn;
        if (!r) return [];
        const out = [];
        for (const s of [-1, 1]) {
            // the near ear (on the left of a head facing right) moves in from the edge as the
            // head turns; the far one goes behind the head
            if (s > 0 && a > 0.25) continue;
            const x = s * (hw - 0.8 + (S.ear.out ?? 0)) + (s < 0 ? a * hw * 0.34 : -a * r * 4);
            const y = S.ear.y + (s < 0 ? a * 1.2 : 0), k = s < 0 ? 1 + a * 0.15 : 1;
            const poly = T.path([[x - s * r * 0.3, y - r * 0.9 * k], [x + s * r * 0.6, y - r * 1.25 * k], [x + s * r * 1.3, y - r * 0.6 * k], [x + s * r * 1.2, y + r * 0.5 * k], [x + s * r * 0.5, y + r * 1.2 * k], [x - s * r * 0.3, y + r * 0.8 * k]], true);
            out.push({ s, x, y, r, poly, inside: s < 0 && a > 0.3 });
        }
        return out;
    }
    function head(g, K) {
        const { S, J, P, w } = K, hd = S.head;
        const t = P.head.turn, a = Math.min(1, Math.abs(t)), d = t < 0 ? -1 : 1;
        const H = { w: hd.w, h: hd.h, turn: a, d, fx: a * hd.w * (hd.slide ?? 0.2) };
        g.save();
        g.translate(J.headC[0], J.headC[1]);
        g.rotate(J.headRot);
        g.scale(d, 1); // a head turned left is the mirror of one turned right
        if (S.hairBack) S.hairBack(g, K, H);
        let pts = hd.pts ?? [[-hd.w * 0.36, -hd.h * 0.46], [hd.w * 0.3, -hd.h * 0.5], [hd.w * 0.5, -hd.h * 0.08], [hd.w * 0.4, hd.h * 0.36], [0, hd.h * 0.5], [-hd.w * 0.42, hd.h * 0.34], [-hd.w * 0.5, -hd.h * 0.1]];
        // the three-quarter outline (same points, moved): the back of the skull out, the face's side in
        if (hd.pts34) pts = pts.map((q, i) => [q[0] + (hd.pts34[i][0] - q[0]) * a, q[1] + (hd.pts34[i][1] - q[1]) * a, q[2]]);
        const E = ears(K, H);
        H.outline = T.path(pts, true);
        T.skin(g, [...E.filter((e) => !e.inside).map((e) => e.poly), H.outline], { fill: S.skin, w, seed: S.seed + 'head' });
        for (const e of E) {
            // an ear inside the outline keeps its own line
            if (e.inside) T.shape(g, e.poly, { fill: S.skin, w, seed: S.seed + 'earin', dense: true });
            T.line(g, [[e.x + e.s * e.r * 0.2, e.y - e.r * 0.55], [e.x + e.s * e.r * 0.85, e.y - e.r * 0.5], [e.x + e.s * e.r * 0.8, e.y + e.r * 0.2], [e.x + e.s * e.r * 0.3, e.y + e.r * 0.35]], { w: K.fine, seed: S.seed + 'ear' + e.s });
            T.line(g, [[e.x + e.s * e.r * 0.5, e.y - e.r * 0.05], [e.x + e.s * e.r * 0.25, e.y + e.r * 0.62]], { w: K.fine, seed: S.seed + 'earb' + e.s });
        }
        if (S.freckles) {
            g.fillStyle = S.freckleColor ?? shade(S.skin, 0.62);
            for (const [fx, fy] of S.freckles) {
                g.beginPath();
                g.arc(fx * (1 - 0.1 * a) + H.fx, fy, K.fine * 0.36, 0, Math.PI * 2);
                g.fill();
            }
        }
        if (S.underFace) S.underFace(g, K, H);
        mouth(g, K, H);
        nose(g, K, H);
        eyes(g, K, H);
        if (S.face) S.face(g, K, H);
        if (S.hairFront) S.hairFront(g, K, H);
        g.restore();
    }

    /** Draws a character: feet at (x, y), s output units per local unit. Returns its joints. */
    function draw(g, spec, pose, x = 0, y = 0, s = 1) {
        const S = spec.__merged ? spec : merge(spec);
        const J = rig({ ...S, __merged: true }, pose);
        const K = { T, S, P: J.P, J, w: T.LINE / s, fine: T.LINE_FINE / s, s };
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        if (S.behind) S.behind(g, K);
        legs(g, K);
        shoes(g, K);
        bottom(g, K);
        for (const i of [0, 1]) if (!K.P.armFront[i]) arm(g, K, i);
            else if (K.P.armFront[i] === 'fore') arm(g, K, i, 'back');
        torso(g, K);
        if (S.over) S.over(g, K);
        neck(g, K);
        head(g, K);
        for (const i of [0, 1]) if (K.P.armFront[i]) arm(g, K, i, K.P.armFront[i] === 'fore' ? 'fore' : 'all');
        if (S.front) S.front(g, K);
        g.restore();
        return J;
    }

    return { draw, rig, merge, bend, shoe, soft, shade, DEF, rot, add, sub, mul, mix, unit };
})();
