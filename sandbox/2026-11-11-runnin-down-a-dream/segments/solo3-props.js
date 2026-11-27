// Props for «solo3» (bars 145–154: through the clouds to Heaven's doorstep, where the angels
// cover their ears and then join in) and for the blocks after it.
// Global: Solo3Props. Depends on Cereal, Song, Skyward, Devil.
//
// THE ESCORT — the three angels flying in formation round the band's car on their own wings,
// playing along: the harp slung and strummed like a guitar over the amps, the trumpet blown at
// the sky over the band, the ginger one flapping under the nose with her mitts in the air.
// Wings beat once a beat (down on the beat, four drawings), gold notes leave the harp on the
// odd beats and the trumpet on the even ones.
//
//     Finale.ride(g, t, x, y, s, o);                 // the car
//     Solo2Props.hangers(g, t, x, y, s, …);          // its hangers
//     Solo3Props.escort(g, t, x, y, s);              // the SAME x, y, s (the car's ground point and scale)
//     Skyward.ascentFront(g, t, Y, …);               // then whatever passes in front
//
//   o: { notes   false: no gold notes (default true)
//        at      { 0: [dx, dy], 1: …, 2: … } moves an angel off its mark, in car units (default none)
//        pose    { 0: {…}, 1: {…}, 2: {…} } a pose merged over an angel's own (Skyward.angel's pose)
//        only    [who, …] draws only these (default all three)
//        ooh     false: never the round mouth (default: who 0 and 2 sing while Song.ooh(t)) }
//   The formation (Solo3Props.ESCORT), as offsets of each angel's ground point from the car's,
//   in car units, all three at the car's own scale s:
//       who 0 (dark hair, glasses; harp)     (-1.45, -3.70)   mood 'rock', harp: true
//       who 1 (bald, moustache; trumpet)     ( 1.15, -3.60)   mood 'rock', trumpet: true, lean -0.2
//       who 2 (ginger curls; empty-handed)   ( 2.85,  2.85)   mood 'rock', both mitts up in turn
//   at Finale.CAR (500, 640, 84): (378, 329), (597, 338), (739, 879). Each bobs up to 0.06 s with
//   its wing beat. Solo3Props.escortPoints(t, x, y, s, o) → [{ who, x, y, s, pose } × 3] is what
//   escort draws (the poses at t), for a block that needs to lay something over one of them.
//
// Also here: the pieces of solo3's own shots (cloud rows, the torn ring, the glow inside the
// cloud, blown pages, the Devil's wave, gold notes, a tapping foot, a shooting star).
const Solo3Props = (() => {
    const C = Cereal, K = C.COL, S = Song, W = Skyward, TAU = Math.PI * 2, PI = Math.PI;
    const D = W.D, Dd = (z) => [D[0] * z, D[1] * z];
    const lerp = (a, b, u) => a + (b - a) * u;
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const seg = (v, a, b) => clamp((v - a) / (b - a));
    const smooth = (u) => {
        const v = clamp(u);
        return v * v * (3 - 2 * v);
    };
    const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const cw = (pts) => {
        let a = 0;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i], q = pts[(i + 1) % pts.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return a > 0 ? pts : pts.slice().reverse();
    };
    const line = (g, pts, lw, ink = K.ink) => C.poly(g, pts, { ink, lw, close: false });
    const oval = (g, x, y, rx, ry, fill, lw = 0, ink = K.ink, a = 0) => {
        g.beginPath();
        g.ellipse(x, y, rx, ry, a, 0, TAU);
        if (fill) {
            g.fillStyle = fill;
            g.fill();
        }
        if (lw > 0) {
            g.strokeStyle = ink;
            g.lineWidth = lw;
            g.stroke();
        }
    };
    // a band along a polyline of [x, y, half width]
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
    // the cloud tops' own colours (Skyward's night deck) and the inside of the big cloud
    const CLOUD = { top: '#fffbe8', shade: '#dcd6f7', under: '#b6aaee', deep: '#8f84d8', mass: '#3b2fa0', massD: '#2c2380', massL: '#b6aaee', lit: '#6a5fd6' };
    const GOLD = { front: '#ffc21f', top: '#ffe62e', side: '#c98a0e' };

    // =========================================================================================
    // Gold notes
    // =========================================================================================
    // One note born on a beat at (x, y): it pops, drifts along (vx, vy) (units of `u` per beat),
    // rocks on twos and shrinks out. age in beats (on twos); life in beats.
    function note(g, x, y, u, age, o = {}) {
        const life = o.life ?? 2.2;
        if (age < 0 || age >= life) return;
        const k = age / life, pop = age < 0.25 ? 0.6 + 0.4 * (age / 0.25) : 1, out = 1 - smooth(seg(k, 0.7, 1));
        const [vx, vy] = o.v ?? [0.3, -0.5], dr = Math.round(age * 4.2);
        const px = x + (vx * age + 0.05 * Math.sin(age * 5 + (o.seed ?? 0))) * u, py = y + (vy * age + (o.sink ?? 0) * age * age) * u;
        C.note(g, px, py, (o.size ?? 0.2) * u * pop * out, { color: o.color ?? K.gold, ink: K.ink, lw: Math.max(1.8, 0.03 * u), kind: o.kind ?? 1, rot: (dr % 2 ? 0.16 : -0.14) + (o.rot ?? 0) });
    }
    // The notes an instrument has let go by t: one on each beat k with k % every === phase,
    // from (x, y) (where the bell or the strings are NOW: they stay with the player's frame).
    function notes(g, t, x, y, u, o = {}) {
        const P = S.pulseAt(t), every = o.every ?? 2, phase = o.phase ?? 0, from = o.from ?? -Infinity, life = o.life ?? 2.2;
        for (let k = P.k - Math.ceil(life) - 1; k <= P.k; k++) {
            if (((k % every) + every) % every !== phase || S.b(k) < from - 1e-6) continue;
            const age = (S.twos(t, S.b(k)) - S.b(k)) / S.BEAT, r = Motion.rng('solo3-note:' + k + ':' + (o.seed ?? 0));
            const fan = (r() - 0.5) * (o.fan ?? 0.5), v = rot(o.v ?? [0.35, -0.55], fan);
            note(g, x, y, u, age, { ...o, v, kind: r() < 0.4 ? 2 : 1, seed: k, rot: fan * 0.5, life });
        }
    }

    // =========================================================================================
    // The escort
    // =========================================================================================
    const ESCORT = [
        { who: 0, at: [-1.45, -3.7], lean: 0.04 },
        { who: 1, at: [1.15, -3.6], lean: -0.2 },
        { who: 2, at: [2.85, 2.85], lean: 0 },
    ];
    const BEAT_WING = [0.1, 0.5, 1, 0.62], BEAT_BOB = [0.02, -0.04, -0.06, -0.01]; // down on the beat; the body rises after the stroke
    // a wing beat in time with the song: { flap (Skyward.angel's), bob (figure units, + down) }
    function beatWing(t, phase = 0) {
        const P = S.pulseAt(t), i = Math.floor((((P.since + phase) % 1) + 1) % 1 * 4 + 1e-6) % 4;
        return { flap: BEAT_WING[i], bob: BEAT_BOB[i] };
    }
    // the three poses of the escort at t (playing on the beat)
    function escortPoses(t) {
        const P = S.pulseAt(t), ph = P.k + P.since, p = P.pulse, even = P.k % 2 === 0;
        const w0 = beatWing(t, 0), w1 = beatWing(t, 0.25), w2 = beatWing(t, 0.5);
        return [
            { who: 0, mood: 'rock', harp: true, strum: Math.cos(ph * TAU), flap: w0.flap, bob: w0.bob, squash: 0.03 * p, headDy: 0.03 * p, headTilt: 0.05 * Math.sin(ph * PI), haloUp: 0.7 * p, halo: 0.1 * Math.sin(ph * PI), lean: ESCORT[0].lean },
            { who: 1, mood: 'rock', trumpet: true, armUp: 0.35 + 0.65 * p, flap: w1.flap, bob: w1.bob, squash: 0.03 * p, headDy: 0.02 * p, haloUp: 0.7 * p, halo: -0.1 * Math.sin(ph * PI), lean: ESCORT[1].lean - 0.05 * p },
            { who: 2, mood: 'rock', armUp: even ? 0.4 + 0.6 * p : 0.3, handR: even ? [-0.52, -0.52] : [-0.56, -1.2 - 0.62 * (0.4 + 0.6 * p)], flap: w2.flap, bob: w2.bob, squash: 0.04 * p, headDy: 0.03 * p, headTilt: even ? 0.06 : -0.06, haloUp: p, halo: 0.14 * Math.sin(ph * PI) },
        ];
    }
    function escortPoints(t, x, y, s, o = {}) {
        const poses = escortPoses(t);
        return ESCORT.map((e, i) => {
            const mv = o.at?.[i] ?? [0, 0], pose = { ...poses[i], ...(o.pose?.[i] ?? {}) };
            return { who: e.who, x: x + (e.at[0] + mv[0]) * s, y: y + (e.at[1] + mv[1] + (pose.bob ?? 0)) * s, s, pose };
        });
    }
    // where an angel's trumpet bell and harp strings are on screen for a pose (lean and squash applied)
    function angelProp(a) {
        const q = a.pose.squash ?? 0, out = ([px, py]) => {
            const r = rot([px * (1 + q), py * (1 - q)], a.pose.lean ?? 0);
            return [a.x + r[0] * a.s, a.y + r[1] * a.s];
        };
        return { bell: out([0.07 + Math.cos(-0.52) * 1.36, -1.09 + (a.pose.headDy ?? 0) + Math.sin(-0.52) * 1.36]), strings: out([-0.5, -0.8]), mouth: out([0, -1.09 + (a.pose.headDy ?? 0)]) };
    }
    // The round «ooh» mouth laid over an angel's own (who 0 and 2: the third has a trumpet at his lips).
    const SKIN = ['#b97a4f', '#f7c9a3', '#f6c2a0'];
    function oohMouth(g, a) {
        const p = a.pose, L = 3.2 / a.s, q = p.squash ?? 0, my = -1.84 + 0.74;
        g.save();
        g.translate(a.x, a.y);
        g.scale(a.s, a.s);
        g.rotate(p.lean ?? 0);
        g.scale(1 + q, 1 - q);
        g.translate(0, (p.sit ? 0.36 : 0) + (p.headDy ?? 0));
        g.rotate(p.headTilt ?? 0);
        g.fillStyle = SKIN[a.who];
        g.fillRect(-0.15, my - 0.083, 0.3, 0.18);
        oval(g, 0, my + 0.02, 0.066, 0.08, '#7a1f2e', L * 0.9);
        oval(g, 0.006, my + 0.062, 0.036, 0.026, '#ff8fa3');
        g.restore();
    }
    function angelNotes(g, t, a, o = {}) {
        const P = angelProp(a);
        if (a.pose.trumpet) notes(g, t, P.bell[0], P.bell[1], a.s, { phase: 0, v: rot([0.5, -0.42], a.pose.lean ?? 0), sink: 0.1, seed: 't', ...o });
        else if (a.pose.harp) notes(g, t, P.strings[0], P.strings[1], a.s, { phase: 1, v: [-0.42, -0.5], sink: 0.1, seed: 'h', ...o });
    }
    /** The three angels flying round a car at (x, y, s). See the header. */
    function escort(g, t, x, y, s, o = {}) {
        const pts = escortPoints(t, x, y, s, o), ooh = o.ooh !== false && S.ooh(t);
        for (const a of pts) {
            if (o.only && !o.only.includes(a.who)) continue;
            W.angel(g, a.x, a.y, a.s, a.pose);
            if (ooh && a.who !== 1 && a.pose.mood === 'rock') oohMouth(g, a);
            if (o.notes !== false && a.pose.mood === 'rock') angelNotes(g, t, a);
        }
    }

    // =========================================================================================
    // Cloud
    // =========================================================================================
    // Scalloped puffs as in rides.js and skyward.js: the outlines of the whole group first, the
    // fills on top, so touching puffs merge. list: [[x, y, r, bumps, a0], …]
    function puffs(g, list, fill, L, ink = K.ink) {
        const parts = [];
        for (const [x, y, r, n, a0] of list) {
            if (!(r > 0)) continue;
            parts.push([x, y, r * 0.74]);
            for (let i = 0; i < n; i++) {
                const a = a0 + (i / n) * TAU;
                parts.push([x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.4]);
            }
        }
        if (L > 0) {
            g.strokeStyle = ink;
            g.lineWidth = L * 2;
            g.lineJoin = 'round';
            for (const [x, y, r] of parts) {
                g.beginPath();
                g.arc(x, y, r, 0, TAU);
                g.stroke();
            }
        }
        g.fillStyle = fill;
        for (const [x, y, r] of parts) {
            g.beginPath();
            g.arc(x, y, r, 0, TAU);
            g.fill();
        }
        return parts;
    }
    // A piece of moonlit cloud: a puff with its shaded underside.
    function cloudPuff(g, x, y, r, n = 6, a0 = 0, L = 3.2, cols = CLOUD) {
        const parts = puffs(g, [[x, y, r, n, a0]], cols.top, L);
        g.save();
        g.beginPath();
        for (const [px, py, pr] of parts) {
            g.moveTo(px + pr, py);
            g.arc(px, py, pr, 0, TAU);
        }
        g.clip();
        g.fillStyle = cols.shade;
        g.beginPath();
        for (const [px, py, pr] of parts) {
            g.moveTo(px + r * 0.12 + pr, py + r * 0.5);
            g.arc(px + r * 0.12, py + r * 0.5, pr * 0.96, 0, TAU);
        }
        g.fill();
        g.restore();
    }
    /**
     * A row of cumulus across the frame, the same drawing as the ascent's own rows (skyward.js
     * keeps its to itself): bumps whose tops are about at y, a body `depth` deep under them.
     *   cols: { body, shade }   o: { depth, up (-1 hangs the bumps: an underside, its bottoms at y),
     *   lw, x0, x1 (the stretch it covers, default the whole frame), lift(x) → an offset per bump,
     *   inside(g) drawn clipped to the body (a glow), draw: false only builds the path }
     * Returns its Path2D.
     */
    function cloudRow(g, y, R, seed, xoff, cols, o = {}) {
        const { depth = 400, up = 1, lw = 4, x0 = -120, x1 = 1120, lift = null } = o;
        const sp = R * 1.3, body = new Path2D(), shade = new Path2D(), yb = y + up * R * 1.3;
        const add = (path, cx, cy, rr) => {
            path.moveTo(cx + rr, cy);
            path.arc(cx, cy, rr, 0, TAU);
        };
        let xa = Infinity, xb = -Infinity;
        for (let i = Math.floor((xoff + x0 - R * 1.3) / sp); i <= Math.ceil((xoff + x1 + R * 1.3) / sp); i++) {
            const r = Motion.rng(seed + ':' + i), cx = i * sp - xoff + (r() - 0.5) * sp * 0.5, rr = R * (0.58 + 0.66 * r());
            const dy = lift ? lift(cx) : 0, cy = y + up * (rr * 0.92 + R * 0.1 * r()) + dy, px = (i + 0.5) * sp - xoff;
            if (cx < x0 || cx > x1) continue;
            add(body, cx, cy, rr);
            add(body, px, y + up * R + (lift ? lift(px) : 0), R * 0.78);
            if (cols.shade) {
                add(shade, cx + R * 0.14, cy + up * R * 0.56, rr * 0.94);
                add(shade, px + R * 0.14, y + up * R * 1.56 + (lift ? lift(px) : 0), R * 0.74);
            }
            xa = Math.min(xa, cx - rr * 0.5);
            xb = Math.max(xb, px + R * 0.4);
        }
        if (xa > xb) return body;
        const bx0 = x0 <= -100 ? -60 : xa, bx1 = x1 >= 1100 ? 1060 : xb;
        body.rect(bx0, up > 0 ? yb : yb - depth, bx1 - bx0, depth);
        if (o.draw === false) return body;
        g.save();
        if (lw > 0) {
            g.save();
            g.beginPath();
            // only the scalloped edge is outlined, never the body's straight sides
            if (up > 0) g.rect(-80, y - 3000, 1160, 3000 + R * 1.3 + 1);
            else g.rect(-80, yb - 1, 1160, 3000);
            g.clip();
            g.strokeStyle = K.ink;
            g.lineWidth = lw * 2;
            g.lineJoin = 'round';
            g.stroke(body);
            g.restore();
        }
        g.fillStyle = cols.body;
        g.fill(body);
        g.clip(body);
        if (cols.shade) {
            shade.rect(bx0, up > 0 ? yb + R * 0.56 : yb - depth, bx1 - bx0, depth);
            g.fillStyle = cols.shade;
            g.fill(shade);
        }
        if (o.inside) o.inside(g);
        g.restore();
        return body;
    }
    // A scalloped blob (a lit patch inside cloud): a disc with bumps round it. Returns its Path2D.
    function blobPath(x, y, rx, ry, n, a0 = 0) {
        const p = new Path2D();
        p.ellipse(x, y, rx * 0.8, ry * 0.8, 0, 0, TAU);
        for (let i = 0; i < n; i++) {
            const a = a0 + (i / n) * TAU, bx = x + Math.cos(a) * rx * 0.72, by = y + Math.sin(a) * ry * 0.72, br = Math.min(rx, ry) * (0.34 + 0.1 * ((i * 7) % 3)) * (1 + 0.5 * Math.abs(Math.cos(a)) * (rx / ry - 1) * 0.3);
            p.moveTo(bx + br, by);
            p.arc(bx, by, br, 0, TAU);
        }
        return p;
    }
    /**
     * The glow of the Devil's flames inside cloud: nested scalloped patches, lighter and warmer
     * towards (x, y). k 0..1.6 its size (1 = about 150 units across the first step); d a drawing
     * number (the scallops turn a notch on twos). cols: the steps from outside in.
     */
    const GLOW_IN = ['#4e40bd', '#6f52cf', '#a763cf', '#e87fb0'];
    function glow(g, x, y, k, d, cols = GLOW_IN, u = 1) {
        if (k <= 0.02) return;
        const n = cols.length;
        cols.forEach((c, i) => {
            const r = u * 250 * k * Math.pow(1 - i / n, 1.25);
            g.fillStyle = c;
            g.fill(blobPath(x, y - r * 0.08 * i, r * 1.12, r * 0.86, 9 + (i % 2), (d % 2) * 0.33 + i * 0.7));
        });
    }
    /**
     * The ring of cloud a car tears off as it bursts through a cloud top: puffs on an ellipse
     * that opens, lifts, breaks up and falls behind.
     *   cx, cy, rx, ry  the hole;  e  0..1 its age (change it on twos);  part 'back' (the far
     *   half, drawn before the car) | 'front'
     */
    function tornRing(g, cx, cy, rx, ry, e, part, seed = 'ring') {
        if (e <= 0 || e >= 1) return;
        const n = 16, r = Motion.rng('solo3-' + seed), open = 1 - Math.pow(1 - e, 2.2), fade = 1 - smooth(seg(e, 0.55, 1));
        for (let i = 0; i < n; i++) {
            const a = (i / n) * TAU + 0.2, far = Math.sin(a) < 0, j = r(), j2 = r(), j3 = r();
            if ((part === 'back') !== far) continue;
            const k = 1 + open * (0.42 + 0.3 * j), lift = -Math.sin(Math.min(1, e * 1.5) * PI * 0.5) * (70 + 60 * j2) * (far ? 1.25 : 0.22) + (far ? 150 : 260) * e * e;
            const x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k * (1 + open * 0.8) + lift;
            const size = (far ? 44 + 26 * j3 : 34 + 18 * j3) * (0.75 + 0.5 * Math.min(1, e * 6)) * fade;
            if (size < 6) continue;
            cloudPuff(g, x, y, size, 5 + (i % 3), j * TAU + Math.round(e * 6) * 0.4, 3.2);
            // a crumb torn off each one
            if (e > 0.18 && i % 2 === 0) cloudPuff(g, x + Math.cos(a) * size * (0.9 + e * 2.2), y - size * (0.5 + e * 1.6), size * 0.34 * fade, 4, j2 * TAU, 2.6);
        }
    }

    // =========================================================================================
    // The Devil's wave: his picking mitt leaves the strings
    // =========================================================================================
    // Finale.ride's Devil is drawn by Inferno.devilGuitar, which keeps both mitts on the guitar.
    // Give it `strum: NaN` and the picking arm (and the strap's end, which swings with the
    // strum) are not drawn; this draws them back in his own frame: the strap's end as it hangs
    // at rest, and the arm from his shoulder to `hand` ([x, y] in his units).
    //   x, y, s   his ground point and scale on screen (Finale.hoodAt for a car at rest)
    //   pose      the pose he was drawn with (solo, lean, squash, tail are read)
    function devilArm(g, L, sh, hand) {
        const P = Devil.P, el = Cast.elbow(sh, hand);
        if (el) {
            // a short arm bends at the elbow: the sleeve down to it, then the cuff and the mitt
            Cast.upperArm(g, sh, el, 0.16, Cast.Dd(0.16), { front: P.suit, top: P.suitTop, side: P.suitSide }, { lw: L, ink: P.ink });
            sh = el;
        }
        const w = 0.16, dx = hand[0] - sh[0], dy = hand[1] - sh[1], len = Math.hypot(dx, dy) || 1e-6;
        const ux = dx / len, uy = dy / len, nx = -uy * w * 0.5, ny = ux * w * 0.5;
        const quad = (a, b, k = 1) => cw([[sh[0] + ux * a + nx * k, sh[1] + uy * a + ny * k], [sh[0] + ux * b + nx * k, sh[1] + uy * b + ny * k], [sh[0] + ux * b - nx * k, sh[1] + uy * b - ny * k], [sh[0] + ux * a - nx * k, sh[1] + uy * a - ny * k]]);
        const c0 = Math.max(0.03, len - 0.14), c1 = Math.max(0.06, len - 0.075);
        C.prism(g, quad(-0.05, c0), Dd(0.16), { front: P.suit, top: P.suitTop, side: P.suitSide }, { lw: L, ink: P.ink });
        C.prism(g, quad(c0, c1, 1.12), Dd(0.17), { front: P.shirt, top: P.shirt, side: '#d9d4e6' }, { lw: L, ink: P.ink });
        g.beginPath();
        g.arc(sh[0] + (ux * (c0 + c1)) / 2, sh[1] + (uy * (c0 + c1)) / 2, 0.016, 0, TAU);
        g.fillStyle = P.button;
        g.fill();
        C.prism(g, quad(c1, len + 0.11), Dd(0.16), { front: P.skin, top: P.skinTop, side: P.skinSide }, { lw: L, ink: P.ink });
    }
    function devilFrame(g, x, y, s, pose, fn) {
        const solo = clamp(pose.solo ?? 0), q = pose.squash ?? 0;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.rotate((pose.lean ?? 0) + 0.1 * solo); // devilGuitar leans him back with the solo (left-handed: mx = -1)
        g.scale(1 + q, 1 - q);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        fn(3.2 / s, solo);
        g.restore();
    }
    function devilWave(g, x, y, s, pose, hand, o = {}) {
        const P = Devil.P;
        devilFrame(g, x, y, s, pose, (L, solo) => {
            // the guitar's own frame (Inferno's axeRig, left-handed)
            const gAt = [lerp(-0.25, -0.03, solo), lerp(-0.45, -0.43, solo)], gAng = lerp(-0.27, -0.72, solo), gSc = 0.96;
            const onG = (p) => {
                const r = rot(p, gAng);
                return [-(r[0] * gSc + gAt[0]), r[1] * gSc + gAt[1]];
            };
            // the strap's end hangs off the tail spike: his tail's spade
            const e = onG([-0.47, 0.01]), sw = o.strap ?? 0.04; // (devilGuitar swings it with his tail and the strum; here it hangs)
            const cl = C.curve([[e[0], e[1]], [e[0] + 0.08, e[1] + 0.05], [e[0] + 0.17, e[1] + 0.02 + sw], [e[0] + 0.2, e[1] - 0.09 + sw * 1.6], [e[0] + 0.14, e[1] - 0.18 + sw * 2]], false, 5);
            C.poly(g, ribbon(cl.map(([px, py], i) => [px, py, 0.03 - 0.012 * (i / (cl.length - 1))])), { fill: P.skin, ink: K.ink, lw: L * 0.8 });
            const te = cl[cl.length - 1], tf = cl[cl.length - 3], ta = Math.atan2(te[1] - tf[1], te[0] - tf[0]);
            C.poly(g, cw([[-0.02, -0.02], [-0.05, -0.085], [0.04, -0.05], [0.13, 0], [0.04, 0.05], [-0.05, 0.085], [-0.02, 0.02]].map((p) => {
                const r = rot(p, ta);
                return [te[0] + r[0], te[1] + r[1]];
            })), { fill: P.skin, ink: K.ink, lw: L * 0.8 });
            // the arm: from the far shoulder (screen right) to the mitt in the air
            const T = Devil.TORSO, sh = [T.x + T.w - 0.03, T.y + 0.14];
            devilArm(g, L, sh, hand);
            // two arcs over the mitt's path while it wags (o.ticks: [from, to] the wag's two ends)
            if (o.ticks) {
                const ang = (p) => Math.atan2(p[1] - sh[1], p[0] - sh[0]), a0 = ang(o.ticks[0]) - 0.06, a1 = ang(o.ticks[1]) + 0.06, r0 = Math.hypot(hand[0] - sh[0], hand[1] - sh[1]) + 0.21;
                for (const [r, trim] of [[r0, 0], [r0 + 0.08, 0.1]]) {
                    const pts = [];
                    for (let i = 0; i <= 6; i++) {
                        const a = lerp(a0 + trim, a1 - trim, i / 6);
                        pts.push([sh[0] + Math.cos(a) * r, sh[1] + Math.sin(a) * r]);
                    }
                    line(g, pts, L * 0.9, K.white);
                }
            }
        });
    }
    // A bead of sweat by his temple (he is embarrassed): k 0..1 slides it down.
    function sweat(g, x, y, s, pose, k) {
        devilFrame(g, x, y, s, pose, (L) => {
            const px = -0.6, py = -1.66 + 0.2 * k + (pose.headDy ?? 0);
            const drop = C.curve([[px, py - 0.1], [px + 0.055, py + 0.0], [px + 0.04, py + 0.06], [px, py + 0.075], [px - 0.04, py + 0.06], [px - 0.055, py + 0.0]], true, 5);
            C.poly(g, drop, { fill: '#8cefe6', ink: K.ink, lw: L * 0.85 });
            line(g, [[px - 0.018, py + 0.0], [px - 0.022, py + 0.035]], L * 0.8, '#ffffff');
        });
    }

    // =========================================================================================
    // Heaven's doorstep
    // =========================================================================================
    /**
     * The book's leaves standing up in the blast, on the lectern Skyward.pearlyBits drew at
     * (x, y, s) (the lectern's own foot). k 0..1: 0 nothing; the leaves riffle (pass a value
     * that changes on twos); d a drawing number.
     */
    function leaves(g, x, y, s, k, d) {
        if (k <= 0) return;
        const L = 3.2 / s, z0 = 0.06, z1 = 0.64, sp = (z) => [D[0] * lerp(z0, z1, z), -1.3 + D[1] * lerp(z0, z1, z)];
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        for (let i = 0; i < 3; i++) {
            // each leaf turns about the spine: its free edge swings over from the left page to the right
            const a = PI * (0.42 + 0.2 * i + 0.1 * ((d + i) % 3)) * k, len = 0.44, bend = 0.1 * Math.sin(a);
            const tip = (z) => {
                const b = sp(z);
                return [b[0] - Math.cos(a) * len, b[1] - Math.sin(a) * len * 0.62 - 0.06];
            };
            const mid = (z) => {
                const b = sp(z), tp = tip(z);
                return [(b[0] + tp[0]) / 2 + bend * 0.4, (b[1] + tp[1]) / 2 - bend];
            };
            const edgeA = C.curve([sp(0), mid(0), tip(0)], false, 5), edgeB = C.curve([sp(1), mid(1), tip(1)], false, 5);
            C.poly(g, [...edgeA, ...edgeB.reverse()], { fill: i % 2 ? '#fff6d8' : '#fffdf4', ink: K.ink, lw: L * 0.9 });
            const ra = mid(0.33), rb = mid(0.66);
            line(g, [ra, rb], L * 0.6, '#b9b4dc');
        }
        g.restore();
    }
    /**
     * Loose pages blown out of the book: each a ruled sheet that tumbles away on twos.
     *   x, y  where they leave from;  u  figure scale;  age  seconds since the blast (on twos);
     *   dir   the way the blast carries them ([dx, dy], about unit length)
     */
    function pages(g, x, y, u, age, dir = [0.7, -0.7], n = 6) {
        if (age < 0) return;
        const r = Motion.rng('solo3-pages');
        for (let i = 0; i < n; i++) {
            const t0 = i * 0.07 + r() * 0.05, a = age - t0, v = 3.4 + r() * 2.2, fan = (r() - 0.5) * 1.3, spin = (r() < 0.5 ? -1 : 1) * (2.5 + r() * 3), ph = r() * TAU;
            if (a < 0 || a > 1.5) continue;
            const dv = rot(dir, fan), px = x + (dv[0] * v * a * (1 - 0.22 * a)) * u, py = y + (dv[1] * v * a * (1 - 0.3 * a) + 1.3 * a * a) * u;
            const ang = ph + spin * a, flip = Math.cos(a * 9 + ph), w = 0.3 * u, h = 0.4 * u * (0.25 + 0.75 * Math.abs(flip));
            g.save();
            g.translate(px, py);
            g.rotate(ang);
            C.poly(g, [[-w / 2, -h / 2], [w / 2, -h / 2 + h * 0.08], [w / 2, h / 2], [-w / 2, h / 2 - h * 0.08]], { fill: flip > 0 ? '#fffdf4' : '#fff1c4', ink: K.ink, lw: Math.max(1.6, 0.032 * u) });
            if (flip > 0) for (const k of [-0.22, 0, 0.22]) line(g, [[-w * 0.34, h * k], [w * 0.34, h * (k + 0.04)]], Math.max(1, 0.014 * u), '#b9b4dc');
            g.restore();
        }
    }
    /**
     * Skyward.angel with one foot (his right, screen left) drawn by us so it can tap: the
     * angel is drawn with that foot clipped out, then the foot, `lift` 0..1 up under the hem.
     * tap 0..1: two little marks either side as it comes down.
     */
    function angelTap(g, x, y, s, pose, lift = 0, tap = 0) {
        const L = 3.2 / s, q = pose.squash ?? 0, who = pose.who ?? 0;
        const skin = [{ front: '#b97a4f', top: '#d39a6c', side: '#8f5a37' }, { front: '#f7c9a3', top: '#fcdfc6', side: '#e0a17b' }, { front: '#f6c2a0', top: '#fcdfc6', side: '#d9906b' }][who];
        const frame = () => {
            g.translate(x, y);
            g.scale(s, s);
            g.rotate(pose.lean ?? 0);
            g.scale(1 + q, 1 - q);
        };
        const hole = [-0.33 - 2 * L, -0.1 + 0.55 * L, 0.39 + 4 * L, 0.1 + 2 * L];
        g.save();
        g.save();
        frame();
        g.beginPath();
        g.rect(-8, -8, 16, 16);
        g.rect(hole[0], hole[1], hole[2], hole[3]);
        g.restore();
        g.clip('evenodd');
        W.angel(g, x, y, s, pose);
        g.restore();
        g.save();
        frame();
        g.lineJoin = 'round';
        g.lineCap = 'round';
        g.beginPath();
        g.rect(hole[0] - 0.3, hole[1], hole[2] + 0.6, hole[3] + 0.3);
        g.clip();
        const fy = -0.042 * lift;
        C.box(g, -0.33, -0.11 + fy, 0.26, 0.11, D, skin, { lw: L, ink: K.ink, depth: 0.34 });
        line(g, [[-0.33, -0.07 + fy], [-0.07, -0.07 + fy]], L * 1.3, '#8a5a2e');
        if (tap > 0) {
            for (const sd of [-1, 1]) {
                const bx = sd < 0 ? -0.38 : 0.02;
                line(g, [[bx, -0.01], [bx + sd * 0.09 * tap, -0.06 * tap]], L);
                line(g, [[bx + sd * 0.01, 0.04], [bx + sd * 0.12 * tap, 0.04]], L);
            }
        }
        g.restore();
    }

    // =========================================================================================
    // A shooting star (the ascent's own drawing, on a clock of ours): u 0..1 along its fall.
    // =========================================================================================
    function shootingStar(g, x0, y0, dir, len, u) {
        if (u < 0 || u >= 1) return;
        const hx = x0 + dir * len * u, hy = y0 + len * 0.62 * u, tl = Math.min(u, 0.36) * len * (1 - u * 0.4);
        C.poly(g, [[hx, hy - 3.2], [hx, hy + 3.2], [hx - dir * tl, hy - tl * 0.62]], { fill: '#fffbe8', lw: 0 });
        C.sparkle(g, hx, hy, 15 * (1 - u * 0.5), { color: '#fffbe8' });
    }

    return { ESCORT, escort, escortPoints, escortPoses, beatWing, angelProp, angelNotes, oohMouth, note, notes, puffs, cloudPuff, cloudRow, blobPath, glow, GLOW_IN, tornRing, devilWave, devilArm, devilFrame, sweat, leaves, pages, angelTap, shootingStar, CLOUD, GOLD };
})();
