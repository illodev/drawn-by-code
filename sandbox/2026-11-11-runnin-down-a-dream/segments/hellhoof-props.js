// Props and acting of «hellhoof» (segments/hellhoof.js): the Devil gives in to the music, one
// body part at a time. What devil.js's five moods and straight poses do not give is drawn here
// over his own drawing, in his own frame: a face that acts (lids, pupils that look anywhere,
// brows, eight mouths), the pompadour's bounce and its loose locks, arms that can go in front
// of the box's rail, a tail that can tick like a metronome, legs that can stamp on each other,
// his two box ushers, and the venue seen past him with its darks closed up.
// Units: his own (devil.js: 1 ≈ a head's width, the origin on the ground between the hooves).
// The house is chorus 3's: what the car threw off (Chorus3Props.dressing), the title on the
// banner (Chorus3Props.title) and the Devil's sore nose (Chorus3Props.devil) come from there.
// Global: HellhoofProps. Depends on Cereal, Song, Cast, Devil, Fx, Rig, Inferno, Chorus1Props
// (the cactus), Verse3bProps and Chorus3Props.
const HellhoofProps = (() => {
    const C = Cereal, K = C.COL, E = Ease, S = Song, TAU = Math.PI * 2;
    const D = Cast.D, Dd = Cast.Dd, DP = Devil.P;
    const HEAD = Devil.HEAD, T = HEAD.top, HW = HEAD.w / 2, CHIN = T + HEAD.h, EY = T + 0.44, MY = T + 0.7;
    const TORSO = Devil.TORSO, SH_R = [TORSO.x + 0.03, TORSO.y + 0.14], SH_L = [TORSO.x + TORSO.w - 0.03, TORSO.y + 0.14];
    const HIP = -(TORSO.y + TORSO.h); // 0.36: the body rocks about it
    const NO = [NaN, NaN]; // a mitt Devil.draw is asked not to draw (the canvas ignores a path that is not a number)
    const C3 = Chorus3Props, COLD = { scarf: false, nose: 1 }; // he has thrown the scarf; the sore nose of his cold stays
    const SCARF_AT = 142.7083; // when the scarf came down on the imp's mallet (chorus 3)
    const lerp = (a, b, u) => a + (b - a) * u;
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const cw = (pts) => {
        let a = 0;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i], q = pts[(i + 1) % pts.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return a > 0 ? pts : pts.slice().reverse();
    };
    const line = (g, pts, color, lw) => C.poly(g, pts, { ink: color, lw, close: false });
    const ribbon = (cl) => {
        const A = [], B = [];
        cl.forEach(([x, y, w], i) => {
            const a = cl[Math.max(0, i - 1)], b = cl[Math.min(cl.length - 1, i + 1)];
            const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
            A.push([x - (dy / l) * w, y + (dx / l) * w]);
            B.push([x + (dy / l) * w, y - (dx / l) * w]);
        });
        return [...A, ...B.reverse()];
    };

    // --- his frames ----------------------------------------------------------------------------
    // pose.rock turns the whole figure about the hips (in the box, where the parapet hides the
    // legs, that is his shoulders going); pose.dy lifts him.
    const rockXf = (g, x, y, s, pose) => {
        const r = pose.rock ?? 0;
        if (!r) return;
        g.translate(x, y - HIP * s);
        g.rotate(r);
        g.translate(-x, -(y - HIP * s));
    };
    // fn(L) draws in his units, with the pose's lean, squash and rock (L: the outline's width)
    function body(g, x, y, s, pose, fn) {
        const q = pose.squash ?? 0;
        g.save();
        rockXf(g, x, y, s, pose);
        g.translate(x, y);
        g.scale(s, s);
        g.rotate(pose.lean ?? 0);
        g.scale(1 + q, 1 - q);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        fn(3.2 / s);
        g.restore();
    }
    const inHead = (g, pose, fn) => {
        g.save();
        g.translate(0, pose.headDy ?? 0);
        g.rotate(pose.headTilt ?? 0);
        fn();
        g.restore();
    };

    // --- the head's pieces, as devil.js draws them (it keeps its own to itself) -------------------
    function horn(g, L, sx) {
        const outer = C.curve([[sx * 0.5, T + 0.03], [sx * 0.615, T - 0.13], [sx * 0.62, T - 0.31], [sx * 0.49, T - 0.47]], false, 8);
        const inner = C.curve([[sx * 0.49, T - 0.47], [sx * 0.515, T - 0.31], [sx * 0.46, T - 0.17], [sx * 0.29, T - 0.03]], false, 8);
        const z = 0.14, shp = cw([...outer, ...inner.slice(1)].map(([x, y]) => [x + D[0] * z, y + D[1] * z]));
        C.prism(g, shp, Dd(0.13), { front: DP.horn, top: DP.hornSide, side: DP.hornSide }, { lw: L, ink: DP.ink, sweepInk: null });
        C.prismOutline(g, shp, Dd(0.13), { lw: L, ink: DP.ink });
        g.strokeStyle = DP.hornLine;
        g.lineWidth = L * 0.9;
        g.lineCap = 'round';
        g.beginPath();
        for (const k of [0.22, 0.42, 0.6, 0.76]) {
            const a = outer[Math.round(k * (outer.length - 1))], b = inner[Math.round((1 - k) * (inner.length - 1))];
            const ox = D[0] * z, oy = D[1] * z;
            g.moveTo(a[0] + ox + (b[0] - a[0]) * 0.12, a[1] + oy + (b[1] - a[1]) * 0.12);
            g.quadraticCurveTo((a[0] + b[0]) / 2 + ox, (a[1] + b[1]) / 2 + oy - 0.025, b[0] + ox - (b[0] - a[0]) * 0.12, b[1] + oy - (b[1] - a[1]) * 0.12);
        }
        g.stroke();
    }
    // The pompadour again, its quiff thrown up by `lift` (0..1) and over by `dx`: it only ever
    // stands taller than devil.js's own, which it covers; the horns go back on top.
    function hair(g, L, lift, dx = 0) {
        const x0 = -HW, x1 = HW, d = HEAD.d;
        const crown = C.curve([[x0 - 0.02, T + 0.1], [x0 + 0.02, T - 0.1 - 0.03 * lift], [-0.2 + dx * 0.5, T - 0.2 - 0.13 * lift], [0.12 + dx, T - 0.27 - 0.22 * lift], [0.36 + dx * 0.6, T - 0.22 - 0.1 * lift], [x1 + 0.03, T - 0.08 - 0.01 * lift], [x1 + 0.025, T + 0.1]], false, 8);
        const shp = cw([[x0 - 0.02, T + 0.4], ...crown, [x1 + 0.025, T + 0.4], [x1 - 0.06, T + 0.4], [x1 - 0.085, T + 0.17], [0.2, T + 0.1], [0.02, T + 0.27], [-0.17, T + 0.1], [x0 + 0.085, T + 0.17], [x0 + 0.06, T + 0.4]]);
        C.prism(g, shp, Dd(d + 0.02), { front: DP.hair, top: DP.hairTop, side: DP.hairSide }, { lw: L, ink: DP.ink, sweepInk: null });
        C.prismOutline(g, shp, Dd(d + 0.02), { lw: L, ink: DP.ink });
        const up = 0.16 * lift;
        g.lineCap = 'round';
        g.strokeStyle = DP.sheen;
        g.lineWidth = L * 1.5;
        g.beginPath();
        g.moveTo(-0.3 + dx * 0.3, T - 0.07 - up * 0.5);
        g.quadraticCurveTo(-0.05 + dx * 0.7, T - 0.2 - up * 1.2, 0.26 + dx, T - 0.16 - up * 0.9);
        g.stroke();
        g.strokeStyle = DP.hairTop;
        g.lineWidth = L * 0.8;
        g.beginPath();
        g.moveTo(-0.36, T + 0.02);
        g.quadraticCurveTo(-0.16, T - 0.08 - up * 0.5, 0.02, T + 0.2);
        g.moveTo(0.36, T - 0.02);
        g.quadraticCurveTo(0.2, T - 0.07 - up * 0.5, 0.04, T + 0.2);
        g.stroke();
        horn(g, L, -1);
        horn(g, L, 1);
    }
    // Locks shaken loose over the brow: k 0..1 how far they fall (1: over the eyes), sw their swing.
    // A fat one off the widow's peak towards screen left, a thinner one the other way once k grows.
    function locks(g, L, k, sw = 0) {
        const lock = (x0, x1, y1, w, bend) => {
            const y0 = T + 0.15, cl = C.curve([[x0, y0], [lerp(x0, x1, 0.3) + bend, lerp(y0, y1, 0.36)], [lerp(x0, x1, 0.78) + bend * 0.7, lerp(y0, y1, 0.8)], [x1, y1]], false, 7), n = cl.length;
            C.poly(g, ribbon(cl.map(([x, y], i) => [x, y, w * (1 - Math.pow(i / (n - 1), 1.6)) + 0.004])), { fill: DP.hair, ink: DP.ink, lw: L * 0.9 });
            line(g, cl.slice(2, Math.floor(n * 0.6)).map(([x, y]) => [x - w * 0.25, y]), DP.sheen, L * 0.9);
        };
        lock(-0.02, -0.19 + sw * 0.1, T + 0.27 + 0.33 * k, 0.062, -0.05 + sw * 0.04);
        if (k > 0.5) lock(0.1, 0.24 + sw * 0.12, T + 0.25 + 0.3 * k, 0.056, 0.05 + sw * 0.04);
    }
    function moustache(g, L, droop = 0) {
        const mu = EY + 0.185;
        for (const sx of [-1, 1]) {
            const cl = C.curve([[sx * 0.012, mu], [sx * 0.11, mu + 0.02], [sx * 0.24, mu + 0.0 + droop], [sx * 0.34, mu - 0.06 + droop * 1.6], [sx * 0.335, mu - 0.115 + droop * 1.8]], false, 8);
            const n = cl.length;
            C.poly(g, ribbon(cl.map(([x, y], i) => [x, y, 0.022 * (1 - (i / (n - 1)) * 0.82)])), { fill: DP.hair, ink: DP.ink, lw: L * 0.5 });
        }
    }
    function goatee(g, L) {
        C.poly(g, [[-0.08, CHIN - 0.06], [0.08, CHIN - 0.06], [0.045, CHIN + 0.06], [0, CHIN + 0.13], [-0.045, CHIN + 0.06]], { fill: DP.hair, ink: DP.ink, lw: L });
        line(g, [[-0.03, CHIN - 0.03], [-0.012, CHIN + 0.055]], DP.sheen, L * 0.9);
    }

    /**
     * The face, painted again over the one devil.js gave him (the skin under the hairline is
     * cleared first). f:
     *   eye:   { h (the eye's height, 0.165 at rest), lx, ly (-1..1 where the pupils look), ph (the pupil's height),
     *            lid (0..1 the upper lid comes down), low (0..1 the lower lid comes up, as in a real smile),
     *            shut (null | 'happy' two arcs | 'tight' squeezed) }
     *   brow:  { tilt (inner end down: 0.085 anger, 0.045 mischief, negative worry), raise, cock (the screen-right one alone) }
     *   mouth: 'grit' | 'o' | 'oo' | 'flat' | 'wobble' | 'smile' | 'joy' | 'frown'; mk: its size
     *   droop: the moustache's tips (negative lifts them);  sweat: 0..1 a bead down the temple
     */
    function face(g, L, f) {
        const m = Math.max(0.02, L * 1.1);
        C.poly(g, [[-0.385, T + 0.17 + m], [-0.17, T + 0.1 + m], [0.02, T + 0.27 + m], [0.2, T + 0.1 + m], [0.385, T + 0.17 + m], [0.41, T + 0.4], [0.465, T + 0.42], [0.465, CHIN - m * 0.6], [-0.465, CHIN - m * 0.6], [-0.465, T + 0.42], [-0.41, T + 0.4]], { fill: DP.skin, lw: 0 });
        const e = { h: 0.165, lx: 0, ly: 0, lid: 0, low: 0, shut: null, ph: null, ...(f.eye ?? {}) };
        const br = { tilt: 0.045, raise: 0, cock: 0, ...(f.brow ?? {}) };
        for (const sx of [-1, 1]) {
            const ex = sx * 0.21, ew = 0.2, eh = Math.max(0.06, e.h);
            if (e.shut === 'happy') line(g, [[ex - 0.09, EY + 0.035], [ex, EY - 0.03], [ex + 0.09, EY + 0.035]], DP.ink, L * 1.5);
            else if (e.shut === 'tight') {
                line(g, [[ex - sx * 0.09, EY - 0.055], [ex + sx * 0.07, EY], [ex - sx * 0.09, EY + 0.055]], DP.ink, L * 1.5);
                line(g, [[ex - sx * 0.02, EY - 0.03], [ex + sx * 0.07, EY]], DP.ink, L * 1.1);
            } else {
                const ph = e.ph ?? Math.min(0.125, eh - 0.035), top = EY - eh / 2;
                const px = ex + clamp(e.lx, -1, 1) * 0.058, py = EY + clamp(e.ly, -1, 1) * Math.max(0, eh / 2 - ph / 2 - 0.016);
                g.beginPath();
                g.roundRect(ex - ew / 2, top, ew, eh, 0.045);
                g.fillStyle = DP.eye;
                g.fill();
                g.save();
                g.clip();
                g.fillStyle = DP.pupil;
                g.beginPath();
                g.roundRect(px - 0.021, py - ph / 2, 0.042, ph, 0.02);
                g.fill();
                g.fillStyle = DP.glint;
                g.fillRect(ex - 0.062 + e.lx * 0.025, top + 0.028 + Math.max(0, e.lid) * eh * 0.5, 0.03, 0.03);
                // the lids are skin, each with its edge
                if (e.lid > 0.02) {
                    g.fillStyle = DP.skin;
                    g.fillRect(ex - ew / 2 - 0.01, top - 0.01, ew + 0.02, eh * e.lid + 0.01);
                }
                if (e.low > 0.02) {
                    g.fillStyle = DP.skin;
                    g.beginPath();
                    g.ellipse(ex, EY + eh / 2 + 0.05, ew * 0.62, 0.05 + eh * e.low, 0, 0, TAU);
                    g.fill();
                    g.strokeStyle = DP.ink;
                    g.lineWidth = L * 0.9;
                    g.stroke();
                }
                g.restore();
                g.beginPath();
                g.roundRect(ex - ew / 2, top, ew, eh, 0.045);
                g.strokeStyle = DP.ink;
                g.lineWidth = L;
                g.stroke();
                const ly = top + 0.004 + eh * Math.max(0, e.lid);
                line(g, [[ex - ew / 2 - 0.012, ly], [ex + ew / 2 + 0.012, ly]], DP.ink, L * 1.7);
            }
            const tilt = br.tilt, by = EY - 0.16 - br.raise - (sx > 0 ? br.cock : 0) - Math.max(0, e.h - 0.165) * 0.6;
            const bi = [ex - sx * 0.125, by + tilt], bo = [ex + sx * 0.125, by - tilt * 0.9];
            C.poly(g, [[bi[0], bi[1] - 0.04], [(bi[0] + bo[0]) / 2, (bi[1] + bo[1]) / 2 - 0.05], [bo[0] + sx * 0.02, bo[1] - 0.012], [bo[0], bo[1] + 0.012], [(bi[0] + bo[0]) / 2, (bi[1] + bo[1]) / 2 + 0.012], [bi[0], bi[1] + 0.03]], { fill: DP.hair, ink: DP.ink, lw: L * 0.8 });
        }
        line(g, [[0.018, EY + 0.05], [0.018, EY + 0.16], [0.075, EY + 0.135]], DP.ink, L * 0.95);
        mouth(g, L, f.mouth ?? 'flat', f.mk ?? 1);
        moustache(g, L, f.droop ?? 0);
        goatee(g, L);
        // the sore nose of his cold, as Chorus3Props.devil paints it
        const nr = 0.082 * COLD.nose;
        g.beginPath();
        g.arc(0.045, -1.225, nr, 0, TAU);
        g.fillStyle = K.pink;
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = L;
        g.stroke();
        g.beginPath();
        g.arc(0.02, -1.25, nr * 0.3, 0, TAU);
        g.fillStyle = '#ffffff';
        g.fill();
        if (f.sweat > 0) {
            const u = clamp(f.sweat), bx = 0.4, by2 = T + 0.44 + 0.26 * u, r = 0.034;
            C.poly(g, [[bx, by2 - r * 2], ...C.ellipsePts(bx, by2, r, r, 10, 0, -0.5, Math.PI + 0.5)], { fill: '#bfeaff', ink: DP.ink, lw: L * 0.8 });
            g.fillStyle = '#ffffff';
            g.fillRect(bx - r * 0.5, by2 - r * 0.4, r * 0.4, r * 0.5);
        }
    }
    function mouth(g, L, kind, k) {
        const inside = (pts, rows) => {
            C.poly(g, pts, { fill: DP.mouth, lw: 0 });
            g.save();
            C.trace(g, pts);
            g.clip();
            rows();
            g.restore();
            C.poly(g, pts, { ink: DP.ink, lw: L });
        };
        if (kind === 'grit') {
            // his clenched teeth, as devil.js draws them angry
            const pts = [[-0.27, MY + 0.07], [-0.2, MY - 0.03], [0.2, MY - 0.03], [0.27, MY + 0.07], [0.2, MY + 0.14], [-0.2, MY + 0.14]];
            inside(pts, () => {
                g.fillStyle = DP.tooth;
                g.fillRect(-0.3, MY - 0.05, 0.6, 0.22);
                g.strokeStyle = DP.ink;
                g.lineWidth = L * 0.7;
                g.beginPath();
                g.moveTo(-0.3, MY + 0.055);
                for (let i = -5; i <= 5; i++) g.lineTo(i * 0.055, MY + 0.055 + (i % 2 ? 0.022 : -0.022));
                g.stroke();
            });
        } else if (kind === 'o') {
            inside(C.ellipsePts(0, MY + 0.05, 0.1 * k, 0.12 * k, 28), () => {
                g.fillStyle = DP.tongue;
                g.beginPath();
                g.ellipse(0, MY + 0.05 + 0.11 * k, 0.07 * k, 0.05 * k, 0, 0, TAU);
                g.fill();
                g.fillStyle = DP.tooth;
                g.fillRect(-0.06 * k, MY + 0.05 - 0.13 * k, 0.12 * k, 0.045 * k);
            });
        } else if (kind === 'oo') {
            // lips pushed forward round a small hole
            C.poly(g, C.ellipsePts(0, MY + 0.04, 0.058 * k, 0.062 * k, 20), { fill: DP.mouth, ink: DP.ink, lw: L });
            line(g, C.ellipsePts(0, MY + 0.04, 0.095 * k, 0.1 * k, 8, 0, 0.5, 2.64), DP.skinDark, L * 0.9);
        } else if (kind === 'flat') {
            line(g, C.curve([[-0.11 * k, MY + 0.035], [0, MY + 0.045], [0.11 * k, MY + 0.035]], false, 5), DP.ink, L * 1.3);
        } else if (kind === 'frown') {
            line(g, C.curve([[-0.16, MY + 0.085], [-0.08, MY + 0.04], [0.08, MY + 0.04], [0.16, MY + 0.085]], false, 5), DP.ink, L * 1.3);
            line(g, [[-0.05, MY + 0.11], [0.05, MY + 0.11]], DP.skinDark, L * 0.9);
        } else if (kind === 'wobble') {
            // a mouth that is fighting a smile: the line will not stay straight
            line(g, C.curve([[-0.19, MY + 0.02], [-0.12, MY + 0.06], [-0.04, MY + 0.02], [0.04, MY + 0.065], [0.12, MY + 0.025], [0.19, MY + 0.05]].map(([x, y]) => [x, MY + 0.04 + (y - MY - 0.04) * k]), false, 5), DP.ink, L * 1.3);
        } else if (kind === 'smile') {
            // the small real one: a closed curve, a dimple at each end, the lower lip's shade
            line(g, C.curve([[-0.165, MY + 0.0], [-0.09, MY + 0.05], [0, MY + 0.064], [0.09, MY + 0.05], [0.165, MY + 0.0]].map(([x, y]) => [x * k, y]), false, 6), DP.ink, L * 1.35);
            for (const sx of [-1, 1]) line(g, [[sx * 0.185 * k, MY - 0.03], [sx * 0.2 * k, MY + 0.012]], DP.ink, L * 1.0);
            line(g, [[-0.045, MY + 0.105], [0.045, MY + 0.105]], DP.skinDark, L * 0.9);
        } else if (kind === 'joy') {
            // the grin that is not the salesman's: wide open, the upper teeth as one row, the tongue up
            const dp = 0.19 * k;
            const upper = C.curve([[-0.27, MY - 0.055], [-0.13, MY - 0.02], [0, MY - 0.01], [0.13, MY - 0.02], [0.27, MY - 0.055]], false, 6);
            const lower = C.curve([[0.27, MY - 0.055], [0.21, MY + dp * 0.62], [0, MY + dp], [-0.21, MY + dp * 0.62], [-0.27, MY - 0.055]], false, 6);
            inside([...upper, ...lower.slice(1, -1)], () => {
                g.fillStyle = DP.tongue;
                g.beginPath();
                g.ellipse(0.01, MY + dp + 0.01, 0.13, 0.085 * k, 0, 0, TAU);
                g.fill();
                g.strokeStyle = DP.ink;
                g.lineWidth = L * 0.6;
                for (let i = -3; i < 3; i++) {
                    g.fillStyle = i === 1 ? DP.gold : DP.tooth;
                    g.beginPath();
                    g.roundRect(i * 0.078 + 0.003, MY - 0.1, 0.072, 0.145 - Math.abs(i + 0.5) * 0.008, [0, 0, 0.012, 0.012]);
                    g.fill();
                    g.stroke();
                }
            });
        }
    }

    // --- arms, tail, legs ---------------------------------------------------------------------
    // A sleeve, a white cuff with a gold link, a red block mitt: devil.js's own arm.
    function arm(g, L, sh, hand) {
        const w = 0.16, dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6;
        const ux = dx / len, uy = dy / len, nx = -uy * w * 0.5, ny = ux * w * 0.5;
        const quad = (a, b, k = 1) => cw([[sh[0] + ux * a + nx * k, sh[1] + uy * a + ny * k], [sh[0] + ux * b + nx * k, sh[1] + uy * b + ny * k], [sh[0] + ux * b - nx * k, sh[1] + uy * b - ny * k], [sh[0] + ux * a - nx * k, sh[1] + uy * a - ny * k]]);
        const c0 = Math.max(0.03, len - 0.14), c1 = Math.max(0.06, len - 0.075);
        C.prism(g, quad(-0.05, c0), Dd(0.16), { front: DP.suit, top: DP.suitTop, side: DP.suitSide }, { lw: L, ink: DP.ink });
        C.prism(g, quad(c0, c1, 1.12), Dd(0.17), { front: DP.shirt, top: DP.shirt, side: '#d9d4e6' }, { lw: L, ink: DP.ink });
        g.beginPath();
        g.arc(sh[0] + (ux * (c0 + c1)) / 2, sh[1] + (uy * (c0 + c1)) / 2, 0.016, 0, TAU);
        g.fillStyle = DP.button;
        g.fill();
        C.prism(g, quad(c1, len + 0.11), Dd(0.16), { front: DP.skin, top: DP.skinTop, side: DP.skinSide }, { lw: L, ink: DP.ink });
    }
    const shoulders = (pose) => [[SH_R[0], SH_R[1] - (pose.shrugR ?? 0)], [SH_L[0], SH_L[1] - (pose.shrugL ?? 0)]];
    /**
     * His arms for a pose (handR: the mitt on screen left; handL: on screen right), in his frame.
     * which: 'R' | 'L' | 'both' (R first: the left one crosses over it). Call it where the arm
     * belongs in depth: before Inferno.box's front half for mitts behind the rail, after it for
     * mitts over the rail.
     */
    function arms(g, x, y, s, pose, which = 'both') {
        const [shR, shL] = shoulders(pose);
        body(g, x, y, s, pose, (L) => {
            if (which !== 'L' && pose.handR) arm(g, L, shR, pose.handR);
            if (which !== 'R' && pose.handL) arm(g, L, shL, pose.handL);
        });
    }

    // The tail along seven control points (devil.js's own thickness, underside and spade).
    const TAIL = {
        rest: (sw = 0) => [[0.2, -0.46], [0.56, -0.34], [0.84, -0.44], [0.86, -0.72 + sw * 0.5], [0.72, -0.94 + sw], [0.84, -1.16 + sw * 1.4], [1.0, -1.26 + sw * 1.6]],
        // upright on a pivot behind the rail, swung to `ang` (0 = straight up, positive to screen right), its end lagging by `lag`
        tick: (ang, lag = 0, len = 1.08) => {
            const p = [1.0, -0.56], at = (l, a) => [p[0] + Math.sin(a) * l, p[1] - Math.cos(a) * l];
            return [[0.2, -0.46], [0.6, -0.33], [0.92, -0.38], p, at(len * 0.36, ang), at(len * 0.7, ang - lag * 0.5), at(len, ang - lag)];
        },
        // on the box's carpet, the spade curled up off it
        floor: (tw = 0) => [[0.2, -0.46], [0.45, -0.32], [0.53, -0.12], [0.6, -0.045], [0.66, -0.1 - tw * 0.01], [0.665, -0.2 - tw * 0.03], [0.62 - tw * 0.02, -0.27 - tw * 0.05]],
        // straight up, kinked like a bolt: a stamped hoof
        bolt: (f = 1) => [[0.2, -0.46], [0.44, -0.3], [0.56, -0.2], [0.63, -0.45], [0.53 - 0.02 * f, -0.66], [0.65 + 0.02 * f, -0.86], [0.58, -1.08]],
    };
    const mixPts = (a, b, u) => a.map((p, i) => [lerp(p[0], b[i][0], u), lerp(p[1], b[i][1], u)]);
    function tail(g, x, y, s, pose, ctrl) {
        body(g, x, y, s, pose, (L) => {
            const pts = C.curve(ctrl, false, 8), n = pts.length;
            C.poly(g, ribbon(pts.map(([px, py], i) => [px, py, 0.05 - 0.028 * (i / (n - 1))])), { fill: DP.skin, ink: DP.ink, lw: L });
            line(g, pts.slice(4, Math.floor(n * 0.55)).map(([px, py]) => [px + 0.012, py + 0.014]), DP.skinSide, L * 1.1);
            const e = pts[n - 1], f = pts[n - 3], a = Math.atan2(e[1] - f[1], e[0] - f[0]);
            const spade = [[-0.02, -0.03], [-0.07, -0.13], [0.06, -0.075], [0.2, 0], [0.06, 0.075], [-0.07, 0.13], [-0.02, 0.03]].map((p) => {
                const q = rot(p, a);
                return [e[0] + q[0], e[1] + q[1]];
            });
            C.prism(g, cw(spade), Dd(0.04), { front: DP.skin, top: DP.skinTop, side: DP.skinSide }, { lw: L, ink: DP.ink });
        });
    }
    // a point `u` (0..1) along the tail's control curve, for a mitt that takes it
    const tailAt = (ctrl, u) => {
        const pts = C.curve(ctrl, false, 8);
        return pts[Math.round(clamp(u) * (pts.length - 1))];
    };

    /**
     * His legs alone, as devil.js draws them, each hoof free to go where it likes (the cutaway):
     *   o: { R: { x, y, sq }, L: { x, y, sq } }  each hoof's offset from its place and its squash; the trouser leg
     *      runs from the hip to wherever the hoof is.  front: 'L' | 'R' the leg drawn last.
     */
    function legs(g, L, o = {}) {
        for (const sx of [-1, 1]) {
            const tx = sx * 0.17 + D[0] * 0.36, ty = D[1] * 0.36;
            C.poly(g, [[tx - 0.13, -0.42 + ty], [tx + 0.13, -0.42 + ty], [tx + 0.1 + sx * 0.02, -0.16 + ty], [tx + sx * 0.05, -0.1 + ty], [tx - 0.1 + sx * 0.02, -0.16 + ty]], { fill: DP.suitSide, ink: DP.ink, lw: L });
        }
        const leg = (sx) => {
            const p = (sx < 0 ? o.R : o.L) ?? {}, lx = sx * 0.19, hx = lx + (p.x ?? 0), hy = p.y ?? 0, q = p.sq ?? 0;
            // the trouser leg first: from the hip down to the hoof's top
            const top = [lx, -0.4], bot = [hx, hy - 0.115 * (1 - q) + 0.005];
            const quad = cw([[top[0] - 0.12, top[1]], [top[0] + 0.12, top[1]], [bot[0] + 0.12, bot[1]], [bot[0] - 0.12, bot[1]]]);
            if (bot[1] > top[1] + 0.02) {
                C.prism(g, quad, Dd(0.3), { front: DP.trouser, top: DP.trouser, side: DP.trouserSide }, { lw: L, ink: DP.ink });
                for (const px of [-0.06, 0, 0.06]) line(g, [[top[0] + px, top[1] + 0.015], [bot[0] + px, bot[1] - 0.01]], DP.stripe, L * 0.5);
            }
            g.save();
            g.translate(hx, hy);
            g.scale(1 + q, 1 - q);
            C.box(g, -0.14, -0.115, 0.28, 0.115, D, { front: DP.hoof, top: DP.hoofTop, side: DP.hoof }, { lw: L, ink: DP.ink, depth: 0.34 });
            C.poly(g, [[-0.02, -0.117], [0, -0.035], [0.02, -0.117]], { fill: DP.ink, ink: DP.ink, lw: L * 0.6 });
            line(g, [[-0.108, -0.082], [-0.05, -0.082]], DP.hoofShine, L * 1.1);
            g.restore();
        };
        if (o.front === 'R') {
            leg(1);
            leg(-1);
        } else {
            leg(-1);
            leg(1);
        }
    }

    /**
     * The Devil for this block: Devil.draw's body and head through Chorus3Props.devil (no scarf, the sore nose; no arms: draw them with arms(), no
     * tail: draw it with tail() first), then what the pose adds.
     *   pose: Devil.draw's { squash, lean, headDy, headTilt, mood, eyes, look, step, shadow } plus
     *         rock (the body turned about the hips), face (see face(); null keeps devil.js's own),
     *         quiff (0..1 the pompadour thrown up), quiffX, lock (0..1 loose locks over the brow), lockSw,
     *         clip: 'legs' (his own legs and tail are left out: the cutaway draws its own)
     */
    function devil(g, x, y, s, pose = {}) {
        const q = pose.squash ?? 0;
        g.save();
        rockXf(g, x, y, s, pose);
        if (pose.clip === 'legs') {
            // everything above the coat's hem, and nothing to the right of the coat below the head
            const yA = y - 0.9 * s, yB = y - (-(TORSO.y + TORSO.h) - 1.6 / s) * (1 - q) * s, xB = x + 0.492 * s * (1 + q);
            g.beginPath();
            g.moveTo(-2000, -2000);
            g.lineTo(3000, -2000);
            g.lineTo(3000, yA);
            g.lineTo(xB, yA);
            g.lineTo(xB, yB);
            g.lineTo(-2000, yB);
            g.closePath();
            g.clip();
        }
        C3.devil(g, x, y, s, { ...pose, handR: NO, handL: NO, trident: false, contract: false, pointer: null, tail: pose.clip === 'legs' ? 0 : NaN, shadow: pose.clip === 'legs' ? false : pose.shadow }, COLD);
        g.restore();
        if (pose.face || pose.quiff > 0.01 || pose.lock > 0.01) {
            body(g, x, y, s, pose, (L) => inHead(g, pose, () => {
                if (pose.quiff > 0.01) hair(g, L, pose.quiff, pose.quiffX ?? 0);
                if (pose.face) face(g, L, pose.face);
                if (pose.lock > 0.01) locks(g, L, pose.lock, pose.lockSw ?? 0);
            }));
        }
    }

    // --- the box ushers --------------------------------------------------------------------------
    /**
     * One of his two box ushers: the Devil's own imp (Devil.imp) in a velvet pillbox cap.
     *   x, y the stool's top under it; u its unit;  pose: Devil.imp's { hop, squash, mood, look, armUp, tail } and sway
     */
    function usher(g, x, y, u, pose = {}) {
        const q = pose.squash ?? 0, L = 3 / u, top = -1.02;
        g.save();
        g.translate(x, y);
        g.rotate(pose.sway ?? 0);
        Devil.imp(g, 0, 0, u, { shadow: false, ...pose });
        g.translate(0, -(pose.hop ?? 0) * u);
        g.scale(u, u);
        g.scale(1 + q, 1 - q);
        g.lineJoin = 'round';
        // the cap sits on the head's top between the horns, a little askew
        g.translate(0.07, top - 0.045);
        g.rotate(-0.1);
        const cap = [[-0.17, -0.2], [0.17, -0.2], [0.18, 0], [-0.18, 0]];
        C.prism(g, cap, Dd(0.22), { front: K.magenta, top: K.pink, side: '#a8176a' }, { lw: L, ink: K.ink });
        C.poly(g, [[-0.178, -0.065], [0.178, -0.065], [0.18, -0.02], [-0.18, -0.02]], { fill: K.gold, ink: K.ink, lw: L * 0.7 });
        g.beginPath();
        g.arc(0.04, -0.225, 0.035, 0, TAU);
        g.fillStyle = K.gold;
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = L * 0.7;
        g.stroke();
        g.restore();
    }

    // --- the venue seen past him -------------------------------------------------------------------
    // The camera on the set for the close shots: the banner at his head's height on the left, the
    // band under it, the front rows along the bottom. His box is drawn over it far larger than the
    // set's own (a long lens from beside the box).
    const PAST = { k: 1.18, cx: 703, cy: 542 };
    const SEATS = Rides.bandCarSeats(), WHEEL = [SEATS.wheel[0] - SEATS.driver[0] - 0.07, SEATS.wheel[1] - SEATS.driver[1] + 0.02];
    // the band as the chorus leaves it: Tom up front singing, the cactus in shades at the wheel
    const bandOn = (g, t, car, o = {}) => {
        const Pu = S.pulseAt(t);
        Rig.band(g, t, car.x, car.y, car.s, {
            spin: 0, bounce: 0.2 * Pu.pulse, sing: true, tomDrives: false,
            driver: (g2, sc) => Chorus1Props.cactus(g2, 0, 0, sc, { wheel: WHEEL, shades: 1, squash: 0.05 * Pu.pulse, wave: Pu.k % 2 ? Pu.pulse : -Pu.pulse * 0.6 }),
            ...o,
        });
    };
    const HOUSE = { heat: 1, density: 1, hype: 1, lighters: 0.35, wave: null }; // the house at full tilt
    // what the car threw off in chorus 3, where it stays: part 'back' after the venue, 'stage' after the band, 'front' after the crowd
    const dress = (g, t, view, part) => C3.dressing(g, t, { view, pan: 0, hype: HOUSE.hype, lighters: HOUSE.lighters, wave: HOUSE.wave, part, scarf: t - SCARF_AT });
    /**
     * The whole house in a view, in the venue's own order, with chorus 3's dressing:
     *   mid(g, St) draws between the venue and the band (his box), St = Inferno.stage(view, 0)
     */
    function house(g, t, view, mid = null) {
        const bk = S.pulseAt(t).pulse, vo = { view, pan: 0, heat: HOUSE.heat, beatK: bk }, St = Inferno.stage(view, 0);
        Inferno.venue(g, t, vo);
        dress(g, t, view, 'back');
        if (mid) mid(g, St);
        bandOn(g, t, St.car);
        dress(g, t, view, 'stage');
        Inferno.beams(g, t, { ...vo, front: true });
        Inferno.crowd(g, t, { ...vo, density: HOUSE.density, hype: HOUSE.hype, lighters: HOUSE.lighters, wave: HOUSE.wave });
        dress(g, t, view, 'front');
    }
    /**
     * The stage and the house past him, out of focus in the cel way: the whole venue as it is,
     * then every dark closed up into one tone (the outlines go with it) and the lights' top
     * taken off, so nothing behind him is drawn in ink.
     *   o: { title: { at: [t1, t2, t3], out } the title on the banner (Chorus3Props.title), in full ink: it is the hit }
     */
    function past(g, t, o = {}) {
        house(g, t, PAST);
        g.save();
        g.globalCompositeOperation = 'lighten';
        g.fillStyle = '#7a1832';
        g.fillRect(-20, -20, 1040, 1040);
        g.globalCompositeOperation = 'darken';
        g.fillStyle = '#ffd9b0';
        g.fillRect(-20, -20, 1040, 1040);
        g.restore();
        if (o.title) C3.title(g, t, { view: PAST, pan: 0, slam: true, ...o.title });
    }
    // A spot of the stage's rig crossing the box: a hard-edged flat wedge, screened.
    function sweep(g, t, o = {}) {
        const ph = (t - S.OFFSET) / S.BEAT;
        g.save();
        g.globalCompositeOperation = 'screen';
        for (const [per, off, col, ax, w, a] of [[6, 0.5, K.yellow, 250, 150, 0.2], [6, 3.5, K.pink, 760, 130, 0.17]]) {
            const u = (((ph + off) % per) + per) % per / per, dir = ax < 500 ? 1 : -1;
            const cx = dir > 0 ? lerp(-420, 1420, u) : lerp(1420, -420, u);
            g.globalAlpha = a * (o.k ?? 1);
            g.fillStyle = col;
            g.beginPath();
            g.moveTo(ax - 16, -260);
            g.lineTo(ax + 16, -260);
            g.lineTo(cx + w, 1100);
            g.lineTo(cx - w, 1100);
            g.closePath();
            g.fill();
        }
        g.restore();
    }

    // --- small effects --------------------------------------------------------------------------
    // a hit: a jagged white star for two drawings (d: drawings since the hit)
    function hit(g, x, y, r, d, seed = 'hellhoof-hit') {
        if (d < 0 || d > 1) return;
        C.burst(g, x, y, { r0: r * (0.5 + 0.12 * d), r1: r * (1 + 0.25 * d), n: 9, seed, rot: d * 0.3, fill: d ? K.yellow : K.white, ink: K.ink, lw: 3.2 });
    }
    // short strokes flying off a point (pain, a slap): n of them, u 0..1 their life
    function ticks(g, x, y, r, u, n = 5, a0 = -2.6, a1 = -0.5, color = K.white) {
        if (u <= 0 || u >= 1) return;
        for (let i = 0; i < n; i++) {
            const a = lerp(a0, a1, n === 1 ? 0.5 : i / (n - 1)), r0 = r * (0.55 + 0.6 * u), r1 = r * (0.8 + 0.75 * u);
            C.poly(g, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], { ink: K.ink, lw: 7.4, close: false });
            C.poly(g, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], { ink: color, lw: 3.4, close: false });
        }
    }
    // a puff of carpet dust: three lobes that open and thin out (u 0..1)
    function puff(g, x, y, r, u, dir = 1) {
        if (u <= 0 || u >= 1) return;
        const k = 1 - u;
        for (const [dx, dy, rr] of [[0, 0, 1], [0.9, -0.3, 0.7], [-0.6, -0.5, 0.6]]) {
            g.beginPath();
            g.arc(x + (dx * r + dir * r * 1.4 * u) , y + dy * r - r * 0.5 * u, Math.max(0.5, rr * r * (0.5 + 0.7 * u) * (0.4 + 0.6 * k)), 0, TAU);
            g.fillStyle = '#e0566a';
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = 3;
            g.stroke();
        }
    }

    return { NO, SH_R, SH_L, body, inHead, devil, face, arms, arm, tail, TAIL, tailAt, mixPts, legs, usher, past, house, PAST, HOUSE, SCARF_AT, bandOn, sweep, hit, ticks, puff, hair, locks };
})();
