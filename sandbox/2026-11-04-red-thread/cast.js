// red-thread · the cast: ink-silhouette figures painted with a few brush strokes.
// Global: Cast. Depends on Sumi.
//
// A figure is a pose object (feet on the ground, lean, hands as world targets); limbs are
// solved with two-bone IK, so bone lengths never change. Everything is ink: who someone is
// reads from posture, hair and clothes, never from a face.
const Cast = (() => {
    const S = () => Sumi;

    function ik(a, t, l1, l2, bend) {
        const dx = t[0] - a[0], dy = t[1] - a[1];
        const d = Math.min(Math.hypot(dx, dy), (l1 + l2) * 0.999);
        const base = Math.atan2(dy, dx);
        const c = Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d || 1)));
        const ang = base + bend * Math.acos(c);
        const e = [a[0] + Math.cos(ang) * l1, a[1] + Math.sin(ang) * l1];
        const dir = Math.atan2(t[1] - e[1], t[0] - e[0]);
        return { elbow: e, end: [e[0] + Math.cos(dir) * l2, e[1] + Math.sin(dir) * l2] };
    }

    const add = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k];
    const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];

    /**
     * Pose: { x, y (ground under the hips), h (height), face (1 right, -1 left), kind
     * ('girl' | 'boy'), lean (rad, forward), look (rad, head up), sit (0..1), seatY,
     * feet: [near, far] or null, hands: [near, far] world targets or null, phone (0..1),
     * wind (hair blown, 0..1), t (time, for hair), id (seed) }
     */
    function figure(g, f) {
        const Sm = S(), h = f.h, s = f.face, id = f.id ?? f.kind;
        const ink = f.ink ?? 0.95;
        const child = true;
        const legL = h * 0.235, shinL = h * 0.225;
        const sit = f.sit ?? 0;
        // hips: standing height, or the seat
        const standHip = f.y - (legL + shinL) * 0.97;
        const hipY = sit > 0 ? standHip + ((f.seatY ?? f.y - h * 0.22) - standHip) * sit : standHip;
        const hip = [f.x, hipY];
        const lean = f.lean ?? 0;
        const up = [Math.sin(lean) * s, -Math.cos(lean)];
        const sh = add(hip, up, h * 0.27);
        const neck = add(hip, up, h * 0.31);
        const headDir = rot(up, -(f.look ?? 0) * s);
        const head = add(neck, headDir, h * (child ? 0.08 : 0.07));
        const headR = h * (child ? 0.074 : 0.065);

        // feet
        const feet = f.feet ?? (sit > 0.5
            ? [[f.x + s * h * 0.2, f.y], [f.x + s * h * 0.12, f.y]]
            : [[f.x + s * h * 0.06, f.y], [f.x - s * h * 0.05, f.y]]);
        const legs = feet.map((ft) => ik(hip, ft, legL, shinL, -s));   // knees point forward

        // arms: default hang
        const armL1 = h * 0.15, armL2 = h * 0.15;
        const hands = f.hands ?? [add(sh, [s * h * 0.03, h * 0.28]), add(sh, [-s * h * 0.03, h * 0.28])];
        const arms = hands.map((hd, i) => ik(add(sh, [-s * h * 0.015 * i, 0]), hd, armL1, armL2, f.elbow?.[i] ?? s));

        const st = (pts, w, seed, o = {}) => Sm.stroke(g, pts, { w, ink, dry: o.dry ?? 0.35, seed: id + seed, taper: o.taper ?? [0.05, 0.15], blunt: o.blunt ?? 0.85, press: o.press });
        const foot = (ft, i) => st([ft, add(ft, [s * h * 0.06, 0])], h * 0.05, 'foot' + i, { taper: [0, 0.4] });

        // far leg, far arm (lighter: the far side is a second pass of thinner ink)
        g.save();
        g.globalAlpha *= 0.8;
        st([hip, legs[1].elbow, legs[1].end], h * 0.075, 'legF');
        foot(feet[1], 1);
        st([sh, arms[1].elbow, arms[1].end], h * 0.065, 'armF');
        Sm.dab(g, arms[1].end[0], arms[1].end[1], h * 0.03, h * 0.026, { seed: id + 'hf', ink });
        g.restore();

        // body: one broad stroke from neck to hem, pressed harder as it goes down, so it
        // flares like a robe (the girl's short kimono) or a jacket (the boy's hoodie)
        const girl = f.kind === 'girl';
        const hem = add(add(hip, up, -h * (girl ? 0.1 : 0.03)), [-(f.wind ?? 0) * h * 0.03 * s, 0]);
        st([add(neck, up, -h * 0.005), add(hip, up, h * 0.13), hem], h * (girl ? 0.3 : 0.22), 'body',
            { taper: [0, 0], blunt: 1, dry: 0.22, press: girl ? (u) => 0.48 + 0.62 * u : (u) => 0.82 + 0.25 * u });
        if (!girl) {
            // hood lying on the back
            const back = add(neck, [-s * h * 0.055, h * 0.012]);
            Sm.dab(g, back[0], back[1], h * 0.055, h * 0.035, { seed: id + 'hood', ink, rot: -0.3 * s });
        }
        // near leg
        st([hip, legs[0].elbow, legs[0].end], h * 0.08, 'legN');
        foot(feet[0], 0);

        // head and hair
        Sm.dab(g, head[0], head[1], headR, headR * 1.05, { seed: id + 'head', ink, rough: 0.06 });
        const tt = f.t ?? 0, wind = f.wind ?? 0;
        if (f.kind === 'girl') {
            // bob: a wider dab over the back of the head down to the jaw, a fringe in front
            Sm.dab(g, head[0] - s * headR * 0.22, head[1] + headR * 0.05, headR * 1.12, headR * 1.08, { seed: id + 'bob', ink, rough: 0.1 });
            Sm.stroke(g, [add(head, [s * headR * 0.1, -headR * 0.95]), add(head, [s * headR * 0.85, -headR * 0.45])],
                { w: headR * 0.7, ink, dry: 0.5, seed: id + 'fringe', taper: [0, 0.6], blunt: 1 });
            // a red ribbon tied at the back, its two ends lifted by the wind
            const knot = add(head, [-s * headR * 0.95, -headR * 0.55]);
            for (let i = 0; i < 2; i++) {
                const fl = Math.sin(tt * 10 + i * 1.7) * h * 0.008;
                const tip = add(knot, [-s * h * (0.035 + 0.015 * i) + wind * h * 0.03, h * (0.01 + 0.022 * i) - wind * h * 0.012 + fl]);
                Sm.stroke(g, [knot, Ease.lerpPt(knot, tip, 0.5), tip], { w: h * 0.018, color: Sm.RED, ink: 0.95, dry: 0.2, seed: id + 'rib' + i, taper: [0, 0.5], blunt: 1 });
            }
            Sm.dab(g, knot[0], knot[1], h * 0.014, h * 0.012, { seed: id + 'tie', color: Sm.RED, ink: 1 });
        } else {
            // short spiky hair: a few strokes swept back from the crown
            for (let i = 0; i < 4; i++) {
                const a = -Math.PI / 2 + s * (-0.9 + i * 0.45);
                const r0 = add(head, [Math.cos(a) * headR * 0.6, Math.sin(a) * headR * 0.6]);
                const r1 = add(head, [Math.cos(a) * headR * 1.25 - s * headR * 0.25, Math.sin(a) * headR * 1.2]);
                Sm.stroke(g, [r0, r1], { w: h * 0.03, ink, dry: 0.4, seed: id + 'hair' + i, taper: [0, 0.8], blunt: 1 });
            }
        }

        // near arm and both hands
        st([sh, arms[0].elbow, arms[0].end], h * 0.07, 'armN', { taper: [0.05, 0.1] });
        if (f.kind === 'girl') {
            // a short wide sleeve hanging from the upper arm (her jacket)
            const m = Ease.lerpPt ? Ease.lerpPt(sh, arms[0].elbow, 0.7) : [(sh[0] + arms[0].elbow[0]) / 2, (sh[1] + arms[0].elbow[1]) / 2];
            st([sh, m, add(m, [0, h * 0.07])], h * 0.085, 'sleeve', { taper: [0, 0.5], dry: 0.5 });
        }
        Sm.dab(g, arms[0].end[0], arms[0].end[1], h * 0.032, h * 0.028, { seed: id + 'hn', ink });

        // the phone: a white cut in the ink and its cold light on the face
        const ph = f.phone ?? 0;
        if (ph > 0) {
            const p = f.phoneAt ?? Ease.lerpPt(arms[0].end, arms[1].end, 0.5);
            g.save();
            g.globalAlpha *= ph;
            const gl = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], h * 0.16);
            gl.addColorStop(0, `rgba(250,248,240,${(0.55 * (f.glow ?? 1)).toFixed(3)})`);
            gl.addColorStop(1, 'rgba(250,248,240,0)');
            g.fillStyle = gl;
            g.fillRect(p[0] - h * 0.2, p[1] - h * 0.2, h * 0.4, h * 0.4);
            g.translate(p[0], p[1]);
            g.rotate(f.phoneRot ?? -0.5 * s);
            g.fillStyle = '#f7f4ea';
            g.fillRect(-h * 0.022, -h * 0.036, h * 0.044, h * 0.072);
            g.restore();
        }
        return { hip, sh, head, headR, hands: arms.map((a) => a.end), feet };
    }

    return { figure, ik };
})();
