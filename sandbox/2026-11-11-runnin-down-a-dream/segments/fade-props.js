// Props of «fade» (segments/fade.js): the Devil after the show. devil.js gives him buttoned up
// and bow-tied; here he is drawn over his own drawing, in his own frame, with the bow tie undone
// and hanging, the collar open and a towel round his neck, on legs that can shuffle (each hoof
// where the walk puts it), with the face that acts (HellhoofProps.face: the small real smile is
// that block's). Also his guitar alone, as the dressing room's stand holds it, for the mitt that
// carries it in; the framed autograph hung on its nail under a camera; the glint on its glass.
// Units: his own (devil.js: 1 ≈ a head's width, the origin on the ground between the hooves)
// unless said otherwise. Global: FadeProps.
// Depends on Cereal, Cast, Devil, Fx, Inferno, Skyward, HellhoofProps.
const FadeProps = (() => {
    const C = Cereal, K = C.COL, HP = HellhoofProps, P = Devil.P, T = Devil.TORSO;
    const Dd = Cast.Dd, HIP = -(T.y + T.h);
    const lerp = (a, b, u) => a + (b - a) * u;
    const line = (g, pts, color, lw) => C.poly(g, pts, { ink: color, lw, close: false });
    const cw = (pts) => {
        let a = 0;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i], q = pts[(i + 1) % pts.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return a > 0 ? pts : pts.slice().reverse();
    };
    // a band of varying width along a centreline [[x, y, halfWidth], …] (as devil.js draws the moustache)
    const band = (cl) => {
        const A = [], B = [];
        cl.forEach(([x, y, w], i) => {
            const a = cl[Math.max(0, i - 1)], b = cl[Math.min(cl.length - 1, i + 1)];
            const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
            A.push([x - (dy / l) * w, y + (dx / l) * w]);
            B.push([x + (dy / l) * w, y - (dx / l) * w]);
        });
        return [...A, ...B.reverse()];
    };
    const TOWEL = { front: '#fffdf4', side: '#d9d4e6', fold: '#cfc9e2', stripe: K.aqua };

    // --- what he wears after the show ------------------------------------------------------------
    // Painted over devil.js's chest, under his chin (the head's own line clips it, wherever the
    // head has nodded to): the shirt front and lapels again without the bow, the collar open, the
    // tie hanging in two strands, a towel round the neck. sw: how far the loose ends swing.
    function chest(g, L, pose, sw = 0) {
        const y = T.y, tilt = pose.headTilt ?? 0, c = Math.cos(tilt), sn = Math.sin(tilt), dy = (pose.headDy ?? 0) + 0.6 * L;
        const chin = (px) => [px * c + 0.9 * sn, px * sn - 0.9 * c + dy];
        g.save();
        g.beginPath();
        [chin(-3), chin(3), [3, 3], [-3, 3]].forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
        g.closePath();
        g.clip();
        // devil.js's shirt front, studs and lapels
        C.poly(g, [[-0.15, y], [0.15, y], [0.035, y + 0.44], [-0.035, y + 0.44]], { fill: P.shirt, ink: P.ink, lw: L * 0.8 });
        g.fillStyle = P.ink;
        for (const sy of [0.33, 0.39]) {
            g.beginPath();
            g.arc(0, y + sy, 0.011, 0, C.TAU);
            g.fill();
        }
        // the top stud is undone: the placket's line shows down the open shirt
        line(g, [[0.004, y + 0.1], [0.004, y + 0.3]], '#d9d4e6', L * 0.8);
        for (const s of [-1, 1]) {
            const lap = [[s * 0.15, y], [s * 0.3, y], [s * 0.3, y + 0.1], [s * 0.335, y + 0.15], [s * 0.25, y + 0.2], [s * 0.035, y + 0.44]];
            C.poly(g, lap, { fill: P.lapel, ink: P.ink, lw: L * 0.8 });
            line(g, [[s * 0.25, y + 0.2], [s * 0.3, y + 0.1]], P.ink, L * 0.7);
            line(g, [[s * 0.2, y + 0.06], [s * 0.085, y + 0.33]], P.lapelDark, L * 0.9);
        }
        // the bow tie, undone: a narrow band round the collar, each end widening to its wing
        const strand = (s, len, k) => {
            const x0 = s * 0.052, yT = y + 0.05, yN = yT + len * 0.52, yE = yT + len, dx = sw * k;
            const cl = [[x0, yT, 0.015], [x0 + s * 0.012 + dx * 0.2, yT + len * 0.28, 0.015], [x0 + s * 0.022 + dx * 0.5, yN, 0.02],
                [x0 + s * 0.028 + dx * 0.8, lerp(yN, yE, 0.5), 0.045], [x0 + s * 0.03 + dx, yE - 0.014, 0.048], [x0 + s * 0.03 + dx, yE, 0.04]];
            C.poly(g, band(cl), { fill: P.tie, ink: P.ink, lw: L * 0.8 });
            line(g, [[cl[2][0] - 0.014, cl[2][1]], [cl[2][0] + 0.014, cl[2][1] + 0.004]], P.tieDark, L * 0.8);
            g.fillStyle = P.lapel;
            for (const [u, v] of [[0.45, -0.018], [0.72, 0.016], [0.86, -0.014]]) {
                g.beginPath();
                g.arc(lerp(cl[2][0], cl[5][0], u) + v, lerp(yN, yE, u), 0.011, 0, C.TAU);
                g.fill();
            }
        };
        strand(-1, 0.29, 0.8);
        strand(1, 0.38, 1);
        // the open collar: a point each side of the goatee
        for (const s of [-1, 1]) C.poly(g, [[s * 0.012, y + 0.06], [s * 0.15, y + 0.055], [s * 0.118, y + 0.165]], { fill: P.shirt, ink: P.ink, lw: L * 0.8 });
        // the towel: its two ends down the chest, the screen-right one longer; two stripes and a fringe
        const end = (s, yb, k) => {
            const dx = sw * k, top = [[s * 0.115, y - 0.03], [s * 0.305, y - 0.03]], bot = [[s * 0.13 + dx, yb], [s * 0.325 + dx, yb - 0.012]];
            C.prism(g, cw([top[0], top[1], bot[1], bot[0]]), Dd(0.05), { front: TOWEL.front, top: TOWEL.front, side: TOWEL.side }, { lw: L, ink: P.ink });
            const at = (u, v) => [lerp(lerp(top[0][0], top[1][0], u), lerp(bot[0][0], bot[1][0], u), v), lerp(lerp(top[0][1], top[1][1], u), lerp(bot[0][1], bot[1][1], u), v)];
            line(g, [at(0.42, 0.24), at(0.46, 0.6), at(0.42, 0.8)], TOWEL.fold, L * 0.9);
            const span = bot[0][1] - top[0][1];
            for (const v of [1 - 0.05 / span, 1 - 0.085 / span]) line(g, [at(0.06, v), at(0.94, v)], TOWEL.stripe, L * 1.5);
            for (let i = 0; i <= 5; i++) {
                const p = at(0.06 + 0.176 * i, 1);
                line(g, [[p[0], p[1] + L * 0.5], [p[0] + dx * 0.15, p[1] + 0.03]], P.ink, L * 0.7);
            }
        };
        end(-1, y + 0.37, 0.9);
        end(1, y + 0.45, 1.2);
        g.restore();
    }

    /**
     * The Devil of this block at (x, y, s): shadow, tail, legs (each hoof where it is), devil.js's
     * body and head, what he wears now, the acting face, whatever he holds, then his arms.
     *   pose: { squash, rock (the body turned about the hips), headDy, headTilt, face (HellhoofProps.face's),
     *           handR, handL (his units; R is the mitt on screen left), shrugR, shrugL (shoulders up; negative: down),
     *           hoofR, hoofL ({ x, y, sq }: each hoof's offset from its place), front ('R' | 'L' the leg drawn last),
     *           tail (seven control points), sw (how far the towel and the tie swing),
     *           ground ([x, y] on screen: where his shadow lies), air (0..1 off the floor: the shadow shrinks) }
     *   mid(g): drawn in the caller's coordinates between his body and his arms (what the mitts are on)
     */
    function devil(g, x, y, s, pose, mid) {
        const still = { squash: 0 }, gr = pose.ground ?? [x, y], air = pose.air ?? 0;
        g.fillStyle = P.shadow;
        g.beginPath();
        g.ellipse(gr[0] + 0.06 * s, gr[1], 0.6 * s * (1 - 0.3 * air), 0.065 * s * (1 - 0.3 * air), 0, 0, C.TAU);
        g.fill();
        HP.tail(g, x, y, s, still, pose.tail ?? HP.TAIL.rest(0));
        HP.body(g, x, y, s, still, (L) => HP.legs(g, L, { R: pose.hoofR, L: pose.hoofL, front: pose.front }));
        HP.devil(g, x, y, s, { squash: pose.squash, rock: pose.rock, headDy: pose.headDy, headTilt: pose.headTilt, clip: 'legs' });
        HP.body(g, x, y, s, pose, (L) => {
            chest(g, L, pose, pose.sw ?? 0);
            if (pose.face) HP.inHead(g, pose, () => HP.face(g, L, pose.face));
        });
        if (mid) mid(g);
        HP.arms(g, x, y, s, pose, 'both');
    }
    // a point of the screen in his units, for a pose drawn at (x, y, s): where a mitt must be to touch it
    function toBody(x, y, s, pose, [px, py]) {
        let u = (px - x) / s, v = (py - y) / s;
        const r = pose.rock ?? 0, q = pose.squash ?? 0;
        if (r) {
            const c = Math.cos(-r), sn = Math.sin(-r), w = v + HIP;
            [u, v] = [u * c - w * sn, u * sn + w * c - HIP];
        }
        return [u / (1 + q), v / (1 - q)];
    }
    // a mitt no further from its shoulder than his arm goes
    function reach(sh, hand, max = 0.95) {
        const dx = hand[0] - sh[0], dy = hand[1] - sh[1], l = Math.hypot(dx, dy);
        return l <= max ? hand : [sh[0] + (dx / l) * max, sh[1] + (dy / l) * max];
    }

    // --- the guitar alone ---------------------------------------------------------------------------
    // As Skyward.backstage stands it in its cradle: (x, y) where its tail rests, s its scale (the
    // stand's own), the neck straight up; fl 0..1 the fire off its horns and its fork, d the drawing.
    // o: { rot, pivot: [x, y] } swings it about a point of the screen (the mitt that carries it).
    const NECK = [0.03, -1.0]; // where a mitt takes the neck, in the guitar's units from its tail
    function guitar(g, x, y, s, fl, d, o = {}) {
        g.save();
        if (o.rot) {
            g.translate(o.pivot[0], o.pivot[1]);
            g.rotate(o.rot);
            g.translate(-o.pivot[0], -o.pivot[1]);
        }
        if (fl > 0.02) {
            Fx.flame(g, x - 0.36 * s, y - 0.26 * s, 0.42 * s * fl * (1 + 0.1 * (d % 2)), d, 0);
            Fx.flame(g, x + 0.36 * s, y - 0.3 * s, 0.36 * s * fl * (1 + 0.1 * ((d + 1) % 2)), d, 2);
        }
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        Inferno.guitar(g, 3.2 / s, [0.02, -0.5], -Math.PI / 2 + 0.02, 1, 1);
        g.restore();
        if (fl > 0.5) Fx.flame(g, x + 0.04 * s, y - 1.6 * s, 0.2 * s * fl, d, 1);
        g.restore();
    }

    // --- the autograph on its nail --------------------------------------------------------------------
    const A_W = 1.24, A_H = 1.08, MOULD = 0.085; // Skyward.autograph's size and its moulding, in units of its s
    // a lower corner of the frame F ({ x, y, s, tilt }), sx −1 the screen-left one
    const corner = (F, sx) => {
        const c = Math.cos(F.tilt), sn = Math.sin(F.tilt), hw = (A_W / 2) * F.s * sx, hh = (A_H / 2) * F.s;
        return [F.x + hw * c - hh * sn, F.y + hw * sn + hh * c];
    };
    /**
     * The framed autograph hanging: F is Skyward.frameAt's result, cam the camera ({ Z, at([x, y]) → screen }):
     * the wire up to the nail, the frame, the nail's head over the wire. Drawn in screen units so its
     * outline keeps its width while the camera pushes in (the room behind it is drawn under the zoom).
     */
    function hung(g, cam, F, glint = 0.3) {
        const Z = cam.Z, nail = cam.at(Skyward.BACKSTAGE.nail), c = Math.cos(F.tilt), sn = Math.sin(F.tilt), hh = (A_H / 2) * F.s, hw = (A_W / 2) * 0.62 * F.s;
        g.lineJoin = g.lineCap = 'round';
        line(g, [cam.at([F.x - hw * c + hh * sn, F.y - hw * sn - hh * c]), nail, cam.at([F.x + hw * c + hh * sn, F.y + hw * sn - hh * c])], '#3a2012', Math.min(3.4, 2.6 * Z));
        const m = cam.at([F.x, F.y]);
        Skyward.autograph(g, m[0], m[1], F.s * Z, { tilt: F.tilt, glint });
        const r = 5.5 * Z;
        g.beginPath();
        g.arc(nail[0], nail[1], r, 0, C.TAU);
        g.fillStyle = '#c9cfe2';
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = Math.min(3.2, 2.4 * Z);
        g.stroke();
        g.beginPath();
        g.arc(nail[0] - 0.27 * r, nail[1] - 0.27 * r, 0.33 * r, 0, C.TAU);
        g.fillStyle = '#f4f6fc';
        g.fill();
    }
    // The glass glints once: a pair of bright bands crosses it from left to right (u 0 → 1), and a
    // star flares where they pass its upper corner.
    function glint(g, cam, F, u, d) {
        if (u <= 0 || u >= 1) return;
        const m = cam.at([F.x, F.y]), s = F.s * cam.Z, hw = A_W / 2 - MOULD, hh = A_H / 2 - MOULD, gx = lerp(-hw - 0.5, hw + 0.25, u), a = Math.sin(Math.PI * u);
        g.save();
        g.translate(m[0], m[1]);
        g.rotate(F.tilt);
        g.scale(s, s);
        g.save();
        g.beginPath();
        g.rect(-hw, -hh, 2 * hw, 2 * hh);
        g.clip();
        g.fillStyle = `rgba(255,255,255,${(0.2 + 0.5 * a).toFixed(3)})`;
        for (const [dx, w] of [[0, 0.13], [0.2, 0.045]]) {
            g.beginPath();
            g.moveTo(gx + dx + 0.27, -hh);
            g.lineTo(gx + dx + 0.27 + w, -hh);
            g.lineTo(gx + dx + w - 0.27, hh);
            g.lineTo(gx + dx - 0.27, hh);
            g.closePath();
            g.fill();
        }
        g.restore();
        g.restore();
        if (u > 0.3 && u < 0.72) {
            const k = [0.6, 1, 0.75, 0.4][Math.min(3, d)] ?? 0.4, c = Math.cos(F.tilt), sn = Math.sin(F.tilt), px = (-hw + 0.1) * s, py = (-hh + 0.1) * s;
            C.sparkle(g, m[0] + px * c - py * sn, m[1] + px * sn + py * c, 64 * k, { color: K.white, ink: K.ink, lw: 3, rot: 0.2 });
        }
    }

    // --- the VCR's title generator ---------------------------------------------------------------------
    // Cereal.osd's hand (a thin slanted monoline with chamfered corners, round caps and a soft glow,
    // glyphs on a 1 × 2 box, its size, slant, weight and advance) for the letters it does not have:
    // lower case with an x-height of 0.62 of the capitals, ascenders to the capitals' height.
    const XH = 2 - 1.24; // the x-height line, on the 1 × 2 box (0 the capitals' top, 2 the baseline)
    const GLYPHS = {
        i: [[[0.16, XH], [0.5, XH], [0.5, 2]], [[0.12, 2], [0.88, 2]], [[0.47, 0.2], [0.5, 0.26]]],
        l: [[[0.16, 0], [0.5, 0], [0.5, 2]], [[0.12, 2], [0.88, 2]]],
        o: [[[0.26, XH], [0.74, XH], [1, XH + 0.28], [1, 1.72], [0.74, 2], [0.26, 2], [0, 1.72], [0, XH + 0.28], [0.26, XH]]],
        d: [[[1, 0], [1, 2]], [[1, XH + 0.28], [0.74, XH], [0.26, XH], [0, XH + 0.28], [0, 1.72], [0.26, 2], [0.74, 2], [1, 1.72]]],
        e: [[[0, 1.4], [1, 1.4], [1, XH + 0.28], [0.74, XH], [0.26, XH], [0, XH + 0.28], [0, 1.72], [0.26, 2], [0.78, 2], [1, 1.8]]],
        v: [[[0, XH], [0.5, 2], [1, XH]]],
        x: [[[0, XH], [1, 2]], [[1, XH], [0, 2]]],
        C: [[[1, 0.3], [0.74, 0], [0.26, 0], [0, 0.3], [0, 1.7], [0.26, 2], [0.74, 2], [1, 1.7]]],
        a: [[[0.06, XH + 0.2], [0.28, XH], [0.74, XH], [1, XH + 0.28], [1, 2]], [[1, 1.34], [0.26, 1.34], [0, 1.54], [0, 1.78], [0.24, 2], [0.72, 2], [1, 1.74]]],
        u: [[[0, XH], [0, 1.72], [0.26, 2], [0.72, 2], [1, 1.74]], [[1, XH], [1, 2]]],
    };
    const OSD = { h: 65, w: 36, adv: 50.5, x: 103, slant: 0.13, lw: 5.4 }; // Cereal.osd's numbers
    /**
     * The first n characters of `text` in the VCR's display lettering, left-aligned with Cereal.osd's
     * words, its baseline at y (frame units); cursor: true draws the title generator's block after them.
     */
    function typed(g, text, y, n = text.length, cursor = false) {
        g.save();
        g.translate(OSD.x, y);
        g.transform(1, 0, -OSD.slant, 1, 0, 0);
        g.strokeStyle = g.fillStyle = '#ffffff';
        g.lineWidth = OSD.lw;
        g.lineCap = g.lineJoin = 'round';
        g.shadowColor = 'rgba(255,255,255,0.8)';
        g.shadowBlur = 14 * C.pxScale(g);
        const chars = [...text].slice(0, n);
        chars.forEach((ch, i) => {
            for (const st of GLYPHS[ch] ?? []) {
                g.beginPath();
                st.forEach(([px, py], j) => (j ? g.lineTo(i * OSD.adv + px * OSD.w, (py / 2 - 1) * OSD.h) : g.moveTo(i * OSD.adv + px * OSD.w, (py / 2 - 1) * OSD.h)));
                g.stroke();
            }
        });
        if (cursor) {
            g.beginPath();
            g.rect(chars.length * OSD.adv, -OSD.h, OSD.w, OSD.h);
            g.fill();
            g.stroke();
        }
        g.restore();
    }

    return { chest, devil, toBody, reach, guitar, NECK, corner, hung, glint, typed, A_W, A_H };
})();
