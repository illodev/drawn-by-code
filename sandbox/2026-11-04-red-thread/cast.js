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
     * ('girl' | 'boy' | 'man' (straw kasa hat, knee robe) | 'woman' (bun, long kimono) |
     * 'elder' (old woman: grey bun, cane) | 'elderm' (old man: bald, beard, cane)), lean (rad, forward), look (rad, head up), sit (0..1), seatY,
     * feet: [near, far] or null, hands: [near, far] world targets or null, phone (0..1),
     * wind (hair blown, 0..1), t (time, for hair), id (seed) }
     */
    // what used to be a phone is a kawaraban sheet (f.phone, f.phoneAt, f.phoneRot)
    function heldSheet(g, f, hands) {
        if (!(f.phone > 0)) return;
        const p = f.phoneAt ?? (hands ? Ease.lerpPt(hands[0], hands[1], 0.5) : [f.x, f.y - f.h * 0.5]);
        const onGround = p[1] > f.y - f.h * 0.06;
        sheet(g, p, f.h, onGround ? 0.1 : (f.phoneRot ?? 0) * 0.25, f.phone, (f.id ?? 'x') + 'sheet');
        if (hands && !onGround) for (const hd of hands) S().dab(g, hd[0], hd[1], f.h * 0.016, f.h * 0.014, { seed: (f.id ?? 'x') + 'hold' + hd[0].toFixed(0), ink: 0.95 });
    }

    function figure(g, f) {
        if (['man', 'woman', 'elder', 'elderm'].includes(f.kind)) {
            const d = adultFigure(g, f);
            heldSheet(g, f, d._arms ? d.hands : null);
            return d;
        }
        const Sm = S(), h = f.h, s = f.face, id = f.id ?? f.kind;
        const ink = f.ink ?? 0.95;
        const adult = ['man', 'woman', 'elder', 'elderm'].includes(f.kind);
        const child = !adult;
        const longRobe = f.kind === 'woman' || f.kind === 'elder';
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

        const st = (pts, w, seed, o = {}) => Sm.stroke(g, pts, { w, ink, dry: o.dry ?? 0.35, seed: id + seed, taper: o.taper ?? [0.05, 0.15], blunt: o.blunt ?? 0.85, press: o.press, bleed: false });
        const foot = (ft, i) => st([ft, add(ft, [s * h * 0.06, 0])], h * 0.05, 'foot' + i, { taper: [0, 0.4] });

        // far leg, far arm (lighter: the far side is a second pass of thinner ink)
        g.save();
        g.globalAlpha *= 0.8;
        st([hip, legs[1].elbow, legs[1].end], h * 0.075, 'legF');
        foot(feet[1], 1);
        st([sh, arms[1].elbow, arms[1].end], h * 0.065, 'armF');
        Sm.dab(g, arms[1].end[0], arms[1].end[1], h * 0.03, h * 0.026, { seed: id + 'hf', ink });
        g.restore();
        if (f.cane) {
            // a walking stick from the far hand to the ground, a little ahead of the feet
            const hd = arms[1].end, tip = [hd[0] + s * h * 0.07, f.y];
            Sm.stroke(g, [add(hd, [0, -h * 0.03]), tip], { w: h * 0.022, ink, dry: 0.3, seed: id + 'cane', taper: [0, 0.1], blunt: 1, core: false, bleed: false });
        }
        if (longRobe) {
            // under a long robe only the near foot shows below the hem
            st([hip, legs[0].elbow, legs[0].end], h * 0.08, 'legN');
            foot(feet[0], 0);
        }

        // body: one broad stroke from neck to hem, pressed harder as it goes down, so it
        // flares like a robe (the girl's short kimono) or a jacket (the boy's hoodie)
        const girl = f.kind === 'girl';
        const hemDrop = { girl: 0.1, boy: 0.03, man: 0.2, woman: 0.4, elder: 0.38, elderm: 0.22 }[f.kind] ?? 0.05;
        const hem = add(add(hip, up, -h * hemDrop), [-(f.wind ?? 0) * h * 0.03 * s, 0]);
        const bodyW = { girl: 0.3, boy: 0.22, man: 0.25, woman: 0.24, elder: 0.25, elderm: 0.25 }[f.kind] ?? 0.22;
        const flare = girl || longRobe ? (u) => 0.48 + 0.62 * u : adult ? (u) => 0.75 + 0.35 * u : (u) => 0.82 + 0.25 * u;
        st([add(neck, up, -h * 0.005), add(hip, up, h * 0.13), hem], h * bodyW, 'body', { taper: [0, 0], blunt: 1, dry: 0.22, press: flare });
        if (f.kind === 'boy') {
            // hood lying on the back
            const back = add(neck, [-s * h * 0.055, h * 0.012]);
            Sm.dab(g, back[0], back[1], h * 0.055, h * 0.035, { seed: id + 'hood', ink, rot: -0.3 * s });
        }
        // clothing details, as paper left between strokes: the girl's sash and collar, the
        // boy's zip and pocket
        const paperLine = (pts, w, a = 0.75) => {
            g.save();
            g.strokeStyle = `rgba(246,244,239,${a})`;
            g.lineWidth = w;
            g.lineCap = 'round';
            g.beginPath();
            g.moveTo(pts[0][0], pts[0][1]);
            for (const p of pts) g.lineTo(p[0], p[1]);
            g.stroke();
            g.restore();
        };
        const across = [Math.cos(lean) , Math.sin(lean) * s];
        if (adult) {
            // sash (obi) and the crossed collar of a kimono
            const wa = add(hip, up, h * 0.11), hw = h * 0.075;
            paperLine([add(wa, across, -hw), add(wa, across, hw)], h * (longRobe ? 0.016 : 0.01), 0.7);
            const nk = add(neck, up, -h * 0.012);
            paperLine([add(nk, across, -s * h * 0.025), add(add(nk, up, -h * 0.08), across, s * h * 0.02)], h * 0.007, 0.6);
        } else if (girl) {
            const wa = add(hip, up, h * 0.1), hw = h * 0.085;
            paperLine([add(wa, across, -hw), add(wa, across, hw)], h * 0.012);
            paperLine([add(add(wa, up, -h * 0.022), across, -hw * 1.05), add(add(wa, up, -h * 0.022), across, hw * 1.05)], h * 0.008, 0.55);
            const nk = add(neck, up, -h * 0.015);
            paperLine([add(nk, across, -s * h * 0.03), add(add(nk, up, -h * 0.07), across, s * h * 0.025)], h * 0.008, 0.6);
        } else {
            const nk = add(neck, up, -h * 0.02);
            paperLine([nk, add(hip, up, h * 0.03)], h * 0.006, 0.45);
            const pk = add(add(hip, up, h * 0.07), across, s * h * 0.04);
            paperLine([pk, add(pk, across, s * h * 0.045)], h * 0.006, 0.5);
        }
        // near leg
        if (!longRobe) {
            st([hip, legs[0].elbow, legs[0].end], h * 0.08, 'legN');
            foot(feet[0], 0);
        }

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
                const tip = add(knot, [-s * h * (0.012 + 0.008 * i) + wind * h * 0.02 + fl, h * (0.032 + 0.016 * i) - wind * h * 0.008]);
                Sm.stroke(g, [knot, Ease.lerpPt(knot, tip, 0.5), tip], { w: h * 0.018, color: Sm.RED, ink: 0.95, dry: 0.2, seed: id + 'rib' + i, taper: [0, 0.5], blunt: 1 });
            }
            Sm.dab(g, knot[0], knot[1], h * 0.014, h * 0.012, { seed: id + 'tie', color: Sm.RED, ink: 1 });
        } else if (f.kind === 'man') {
            // a straw kasa: a wide shallow cone over the head
            const tip = add(head, rot(up, 0), headR * 1.25);
            const L1 = add(add(head, up, headR * 0.1), [Math.cos(lean), Math.sin(lean) * s], -headR * 2.3);
            const R1 = add(add(head, up, headR * 0.1), [Math.cos(lean), Math.sin(lean) * s], headR * 2.3);
            Sm.fillPoly(g, [L1, tip, R1, add(R1, up, -headR * 0.18), add(L1, up, -headR * 0.18)], Sm.tone(ink));
            Sm.stroke(g, [L1, add(head, up, headR * 0.0), R1], { w: headR * 0.35, ink, dry: 0.5, seed: id + 'brim', taper: [0.3, 0.3], blunt: 0.5, bleed: false });
        } else if (f.kind === 'woman' || f.kind === 'elder') {
            // hair gathered in a bun at the back, a pin through it; grey for the old woman
            const hairInk = f.kind === 'elder' ? 0.55 : ink;
            Sm.dab(g, head[0] - s * headR * 0.15, head[1] - headR * 0.25, headR * 1.05, headR * 0.85, { seed: id + 'hair', ink: hairInk, rough: 0.08 });
            const bun = add(head, [-s * headR * 0.85, -headR * 0.85]);
            Sm.dab(g, bun[0], bun[1], headR * 0.55, headR * 0.5, { seed: id + 'bun', ink: hairInk });
            Sm.stroke(g, [add(bun, [-headR * 0.9, headR * 0.2]), add(bun, [headR * 0.8, -headR * 0.3])], { w: headR * 0.12, ink, dry: 0.2, seed: id + 'pin', taper: [0, 0.2], core: false, bleed: false });
        } else if (f.kind === 'elderm') {
            // bald, a grey beard and a thin top-knot
            const chin = add(head, [s * headR * 0.45, headR * 0.75]);
            Sm.stroke(g, [chin, add(chin, [s * headR * 0.1, headR * 0.9])], { w: headR * 0.6, ink: 0.55, dry: 0.5, seed: id + 'beard', taper: [0, 0.8], blunt: 1, bleed: false });
            Sm.dab(g, head[0] - s * headR * 0.2, head[1] - headR * 1.0, headR * 0.3, headR * 0.22, { seed: id + 'knot', ink: 0.6 });
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
        if (f.kind === 'girl' || adult) {
            // a short wide sleeve hanging from the upper arm (her jacket)
            const m = Ease.lerpPt ? Ease.lerpPt(sh, arms[0].elbow, 0.7) : [(sh[0] + arms[0].elbow[0]) / 2, (sh[1] + arms[0].elbow[1]) / 2];
            st([sh, m, add(m, [0, h * 0.07])], h * 0.085, 'sleeve', { taper: [0, 0.5], dry: 0.5 });
        }
        Sm.dab(g, arms[0].end[0], arms[0].end[1], h * 0.032, h * 0.028, { seed: id + 'hn', ink });

        heldSheet(g, f, arms.map((a) => a.end));
        const heart = Ease.lerpPt(hip, sh, 0.62);
        const mouth = add(head, [s * headR * 0.95, headR * 0.3]);
        return { hip, sh, head, headR, heart, mouth, face: s, hands: arms.map((a) => a.end), feet };
    }

    // ---------------------------------------------------------------------------------------
    // Adults (round 12: «los trazos de los personajes son muy poco currados»), drawn like the
    // reference's boatman: slender (seven heads), a crisp silhouette edged in dry brush, the
    // kimono a grey wash with darker contours, calligraphic folds and paper showing through
    // where the light catches the cloth; a sash and a crossed collar; a woven straw kasa.
    function adultFigure(g, f) {
        const Sm = S(), h = f.h, s = f.face, id = f.id ?? f.kind, ink = f.ink ?? 0.95;
        const woman = f.kind === 'woman' || f.kind === 'elder', oldM = f.kind === 'elderm';
        const legL = h * 0.25, shinL = h * 0.24;
        const hip = [f.x, f.y - (legL + shinL) * 0.97];
        const lean = f.lean ?? 0;
        const up = [Math.sin(lean) * s, -Math.cos(lean)];
        const fw = [Math.cos(lean) * s, Math.sin(lean)];          // towards the face, across the body
        const P = (base, u, a) => add(add(base, up, u * h), fw, a * h);
        const sh = add(hip, up, h * 0.29), neck = add(hip, up, h * 0.335);
        const headDir = rot(up, -(f.look ?? 0) * s);
        const head = add(neck, headDir, h * 0.058), headR = h * 0.044;
        const feet = f.feet ?? [[f.x + s * h * 0.05, f.y], [f.x - s * h * 0.04, f.y]];
        const legs = feet.map((ft) => ik(hip, ft, legL, shinL, -s));
        const hands = f.hands ?? [P(sh, -0.28, 0.025), P(sh, -0.27, -0.03)];
        const arms = hands.map((hd, i) => ik(P(sh, 0, -0.012 * i), hd, h * 0.15, h * 0.145, f.elbow?.[i] ?? s));
        const st = (pts, w, seed, o = {}) => Sm.stroke(g, pts, { w, ink: o.ink ?? ink, dry: o.dry ?? 0.5, seed: id + seed, taper: o.taper ?? [0.1, 0.3], blunt: o.blunt ?? 0.7, press: o.press, bleed: false, raw: o.raw, core: o.core });
        const paperStroke = (pts, w, a, seed) => {
            g.save();
            g.globalAlpha *= a;
            Sm.stroke(g, pts, { w, ink: 1, color: Sm.PAPER, dry: 0.75, seed: id + seed, taper: [0.3, 0.5], core: false, bleed: false });
            g.restore();
        };
        // stride: how far apart the feet are, so the hem opens as they walk
        const stride = Math.abs(feet[0][0] - feet[1][0]) / h;
        const hemDrop = woman ? 0.43 : oldM ? 0.33 : 0.21;
        // a kimono narrows towards the ankles (a woman's most); a man's knee robe opens a little
        const hemW = (woman ? 0.058 : oldM ? 0.07 : 0.078) + stride * (woman ? 0.12 : 0.3);

        // far leg and arm, a lighter pass
        g.save();
        g.globalAlpha *= 0.85;
        if (!woman) {
            st([hip, legs[1].elbow, legs[1].end], h * 0.03, 'lf', { ink: ink * 0.7, dry: 0.55, taper: [0, 0.3] });
            st([feet[1], add(feet[1], [s * h * 0.045, 0])], h * 0.022, 'ff', { taper: [0, 0.5] });
        } else st([add(feet[1], [-s * h * 0.01, -h * 0.01]), add(feet[1], [s * h * 0.04, 0])], h * 0.02, 'ff', { taper: [0, 0.5] });
        st([P(sh, 0, -0.015), arms[1].elbow, Ease.lerpPt(arms[1].elbow, arms[1].end, 0.85)], h * 0.042, 'af', { ink: ink * 0.6, taper: [0.1, 0.1], dry: 0.65, press: (u) => 0.8 + 0.4 * u });
        g.restore();
        if (f.cane) {
            const hd = arms[1].end;
            st([add(hd, [0, -h * 0.03]), [hd[0] + s * h * 0.06, f.y]], h * 0.013, 'cane', { dry: 0.25, taper: [0, 0.05], core: false });
        }
        if (!woman) {
            // the near leg below the knee-length robe, and a straw sandal
            st([hip, legs[0].elbow, legs[0].end], h * 0.034, 'ln', { dry: 0.5, taper: [0, 0.3] });
            st([feet[0], add(feet[0], [s * h * 0.05, 0])], h * 0.024, 'fn', { taper: [0, 0.5] });
        } else st([add(feet[0], [-s * h * 0.01, -h * 0.012]), add(feet[0], [s * h * 0.045, 0])], h * 0.022, 'fn', { taper: [0, 0.5] });

        // the kimono, painted as sumi-e paints cloth: few strokes, each with a loaded start
        // and a dry tail. A faint wash for the body, one heavy curved stroke down the back
        // (the brush pressed at the shoulder, running dry at the hem), a lighter stroke down
        // the front, the paper left between them where the light falls. The skirt hangs
        // straight down from the hips whatever the torso does.
        const down = [0, 1];
        const hemC = add(add(hip, down, hemDrop * h), [s * 0.01 * h, 0]);
        const hemB = add(hemC, [-s * hemW * h, 0]), hemF = add(hemC, [s * hemW * 1.05 * h, 0]);
        const waistB = P(hip, 0.03, -0.055), waistF = P(hip, 0.03, 0.05);
        g.save();
        g.globalAlpha *= 0.32;
        Sm.fillPoly(g, [P(neck, 0, -0.025), P(sh, 0, -0.06), waistB, add(hemB, [s * 0.012 * h, -0.006 * h]), add(hemF, [-s * 0.012 * h, -0.006 * h]), waistF, P(sh, 0, 0.05), P(neck, 0, 0.022)], Sm.tone(0.8 * ink));
        g.restore();
        const mid = (a, b, k, off) => add(Ease.lerpPt(a, b, k), [s * off * h, 0]);
        // back: shoulder blade, small of the back, out to the hem
        st([P(neck, -0.01, -0.025), P(sh, -0.02, -0.055), mid(P(sh, -0.02, -0.055), waistB, 0.6, -0.008), waistB, mid(waistB, hemB, 0.55, -0.006), add(hemB, [s * 0.01 * h, -0.004 * h])],
            h * 0.075, 'rb', { ink, dry: 0.55, taper: [0.06, 0.12], blunt: 0.85, press: (u) => 1.25 - 0.7 * u });
        // front: collar, chest, belly, hem, lighter and drier
        st([P(neck, -0.01, 0.018), P(sh, -0.03, 0.05), waistF, mid(waistF, hemF, 0.5, 0.004), add(hemF, [-s * 0.01 * h, -0.004 * h])],
            h * 0.06, 'rf', { ink: ink * 0.7, dry: 0.7, taper: [0.1, 0.2], blunt: 0.7, press: (u) => 1.15 - 0.5 * u });
        // one fold from the knee and a broken hem line
        st([mid(hip, hemC, 0.35, -0.01), add(hemC, [-s * 0.02 * h, -0.01 * h])], h * 0.012, 'f1', { ink: 1, dry: 0.8, taper: [0.4, 0.2] });
        st([add(hemB, [0, -0.002 * h]), Ease.lerpPt(hemB, hemF, 0.55)], h * 0.016, 'hem', { dry: 0.75, taper: [0.1, 0.5] });
        // sash (obi) and crossed collar
        st([P(hip, 0.07, -0.06), P(hip, 0.072, 0.054)], h * (woman ? 0.042 : 0.026), 'obi', { ink: 1, dry: 0.4, taper: [0, 0.15], blunt: 1 });
        paperStroke([P(neck, -0.005, -0.016), P(sh, -0.07, 0.03)], h * 0.009, 0.7, 'col');

        // near arm: the kimono sleeve is wide and hangs; one stroke that swells towards its
        // mouth, and the hand a small grey dab coming out of it
        const nearSh = P(sh, -0.005, 0.0);
        st([nearSh, arms[0].elbow, Ease.lerpPt(arms[0].elbow, arms[0].end, 0.82)], h * 0.05, 'an',
            { ink: ink * 0.92, dry: 0.5, taper: [0.15, 0.05], blunt: 0.8, press: (u) => 0.75 + 0.55 * u });
        // the sleeve's hanging pocket (tamoto) under the forearm
        const m = Ease.lerpPt(arms[0].elbow, arms[0].end, 0.45);
        st([add(m, [0, -h * 0.01]), add(m, [-s * h * 0.006, h * (woman ? 0.085 : 0.05)])], h * (woman ? 0.05 : 0.04), 'tamoto', { ink: ink * 0.85, dry: 0.65, taper: [0, 0.7] });
        Sm.dab(g, arms[0].end[0], arms[0].end[1], h * 0.014, h * 0.012, { seed: id + 'hn', ink: ink * 0.8 });
        Sm.dab(g, arms[1].end[0], arms[1].end[1], h * 0.012, h * 0.011, { seed: id + 'hf', ink: ink * 0.7 });

        // head, then hair or hat
        st([neck, add(neck, headDir, h * 0.02)], h * 0.03, 'neck', { ink: 1, dry: 0.3, taper: [0, 0], blunt: 1 });
        Sm.dab(g, head[0], head[1], headR, headR * 1.1, { seed: id + 'head', ink: Math.min(1.15, ink * 1.2), rough: 0.05 });
        if (f.kind === 'man') {
            // the kasa in two strokes: a pale cone wash, then the brim as one flat stroke,
            // pressed in the middle, flicked off at both rims
            const c = add(head, up, headR * 0.45), tip = add(c, up, headR * 1.25);
            const L1 = add(c, fw, -headR * 2.6), R1 = add(c, fw, headR * 2.6);
            g.save();
            g.globalAlpha *= 0.55;
            g.globalAlpha /= 0.55;
            const cone = [L1, add(tip, fw, -headR * 0.15), add(tip, fw, headR * 0.15), R1];
            Sm.fillPoly(g, cone, Sm.PAPER);
            Sm.fillPoly(g, cone, Sm.tone(0.55 * ink));
            g.restore();
            st([add(L1, up, headR * 0.1), add(tip, fw, -headR * 0.1)], headR * 0.25, 'kl', { ink: ink * 0.8, dry: 0.7, taper: [0.2, 0.2] });
            st([L1, add(c, up, -headR * 0.1), R1], headR * 0.5, 'brim', { ink: 1, dry: 0.55, taper: [0.35, 0.45], blunt: 0.4, press: (u) => 0.7 + 0.6 * Math.sin(u * Math.PI) });
        } else if (woman) {
            const hairInk = f.kind === 'elder' ? 0.55 : ink;
            Sm.dab(g, head[0] - s * headR * 0.15, head[1] - headR * 0.25, headR * 1.05, headR * 0.85, { seed: id + 'hair', ink: hairInk, rough: 0.08 });
            const bun = add(head, [-s * headR * 0.85, -headR * 0.9]);
            Sm.dab(g, bun[0], bun[1], headR * 0.6, headR * 0.52, { seed: id + 'bun', ink: hairInk });
            st([add(bun, [-headR * 0.9, headR * 0.25]), add(bun, [headR * 0.85, -headR * 0.3])], headR * 0.12, 'pin', { dry: 0.2, taper: [0, 0.2], core: false });
        } else if (oldM) {
            const chin = add(head, [s * headR * 0.45, headR * 0.75]);
            st([chin, add(chin, [s * headR * 0.1, headR * 1.0])], headR * 0.55, 'beard', { ink: 0.55, dry: 0.55, taper: [0, 0.8], blunt: 1 });
            Sm.dab(g, head[0] - s * headR * 0.2, head[1] - headR * 1.0, headR * 0.3, headR * 0.22, { seed: id + 'knot', ink: 0.6 });
        }

        const heart = Ease.lerpPt(hip, sh, 0.62);
        const mouth = add(head, [s * headR * 0.95, headR * 0.3]);
        return { hip, sh, head, headR, heart, mouth, face: s, hands: arms.map((a) => a.end), feet, _arms: arms };
    }

    // the kawaraban: a broadsheet of news, held in both hands, columns of tiny print and a
    // little picture (this replaces the phones: the user found them out of period)
    function sheet(g, at, h, rot0, a = 1, seed = 'sh') {
        const Sm = S(), w = h * 0.17, hh = h * 0.12;
        g.save();
        g.globalAlpha *= a;
        g.translate(at[0], at[1]);
        g.rotate(rot0);
        Sm.fillPoly(g, [[-w / 2, -hh / 2], [w / 2, -hh / 2 + h * 0.004], [w / 2, hh / 2], [-w / 2, hh / 2 - h * 0.003]], '#f3efe4');
        g.strokeStyle = Sm.tone(0.6);
        g.lineWidth = Math.max(0.5, h * 0.003);
        g.strokeRect(-w / 2, -hh / 2, w, hh);
        // columns of print on the right half, a picture on the left
        g.strokeStyle = Sm.tone(0.75);
        for (let i = 0; i < 6; i++) {
            const x = w / 2 - w * 0.08 - i * w * 0.07;
            g.beginPath();
            g.moveTo(x, -hh * 0.38);
            g.lineTo(x, hh * (0.25 + 0.1 * Math.sin(i * 3.1)));
            g.stroke();
        }
        Sm.fillPoly(g, Sm.blobPts(-w * 0.22, 0, w * 0.15, hh * 0.25, 0, seed + 'pic', 0.3, 12), Sm.tone(0.7));
        g.restore();
    }

    return { figure, ik, adultFigure, sheet };
})();
