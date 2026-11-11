// Props of «hellplug» (segments/hellplug.js): the wall socket carved in the proscenium's leg, the
// plug of the band's car and its cable, the cel night that falls when the plug comes out (flat
// darker tones with pools of light punched in them), sparks, the Devil sat on the floor, and
// where the crowd's lighters are, so each flame can light its own little pool.
//
// The set pieces (socket, plug, cable) are drawn in the venue's SET coordinates (inferno.js:
// the wide view's frame, floor line y = 800), inside HellplugProps.layer(g, view, pan, fn):
// fn(L) gets the factor that keeps a line's width in any view (lw · L).
// Global: HellplugProps. Depends on Cereal, Cast, Devil, Inferno, Song.
const HellplugProps = (() => {
    const C = Cereal, K = C.COL, TAU = Math.PI * 2, PI = Math.PI;
    const D = Cast.D, DP = Devil.P;
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
    const line = (g, pts, lw, ink = K.ink) => C.poly(g, pts, { ink, lw, close: false });
    const circ = (g, x, y, r, fill, lw, ink = K.ink) => {
        g.beginPath();
        g.arc(x, y, Math.max(0, r), 0, TAU);
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

    // Draw in the venue's set coordinates for a view (Inferno.cam): the stage's plane.
    function layer(g, view, pan, fn) {
        const V = Inferno.cam(view, pan);
        g.save();
        g.translate(500, 500);
        g.scale(V.k, V.k);
        g.translate(-V.cx, -V.cy);
        g.lineJoin = 'round';
        fn(1 / V.k);
        g.restore();
    }

    // =========================================================================================
    // The socket: an iron box set into the rock of the proscenium's left leg, a bone skull for a
    // faceplate, a conduit up the wall and a warning sign. The plug goes into its right side.
    // =========================================================================================
    const IRON = { front: '#3d3652', top: '#5d5788', side: '#2a2438', line: '#6c66a0' };
    const BONE = { front: '#f4edd8', top: '#fffdf4', side: '#cdbf9c', dark: '#2a2438' };
    const ROCK = { rim: '#c43349', rimD: '#6a1221', wall: '#8a1a2c' };
    // the box's front (x0..x1, y0..y1) and how far it stands out of the wall
    const SOCK = { x0: -100, x1: -26, y0: 670, y1: 774, depth: 56 };
    const SOCK_C = [(SOCK.x0 + SOCK.x1) / 2, (SOCK.y0 + SOCK.y1) / 2];
    const PLUG_Z = 10, PLUG_D = 36; // the plug's near face and its thickness, in depth
    // where the middle of the plug's pin face is when it is right in (its near face's plane)
    const HOME = [SOCK.x1 + D[0] * PLUG_Z, SOCK_C[1] + D[1] * PLUG_Z];

    /**
     * socket(g, L, o)   in set coordinates
     *   o: { live (0..1: the skull's eyes glow, 1 with the plug in), beat (0..1 the glow kicks),
     *        face ('calm' | 'strain' (brows down, teeth clenched) | 'dead' (dark, a wisp of smoke) | 'chomp' (eyes shut, happy)),
     *        d (the drawing, for the smoke), holes (true: the three holes show: the plug is out) }
     */
    function socket(g, L, o = {}) {
        const { x0, x1, y0, y1, depth } = SOCK, w = x1 - x0, h = y1 - y0, cx = SOCK_C[0], cy = SOCK_C[1];
        const live = clamp(o.live ?? 1), face = o.face ?? 'calm', bk = clamp(o.beat ?? 0), d = o.d ?? 0, lw = 3.2 * L;
        // the conduit up the wall, with two brackets
        const px = cx + 13;
        C.box(g, px - 7, 380, 14, y0 - 380, D, IRON, { depth: 12, lw });
        line(g, [[px - 2.5, 384], [px - 2.5, y0 - 4]], 2 * L, IRON.line);
        for (const by of [470, 570]) C.box(g, px - 13, by, 26, 9, D, { front: IRON.top, top: IRON.line, side: IRON.side }, { depth: 15, lw: 2.6 * L });
        // the warning sign: a yellow triangle with a bolt
        const sy = y0 - 76, sx0 = cx + 25, tri = [[sx0 + 26, sy + 22], [sx0 + 52, sy + 66], [sx0, sy + 66]];
        C.prism(g, tri, [2.4, -1.6], { front: K.yellow, top: '#fff59a', side: K.gold }, { lw: 2.8 * L });
        C.poly(g, [[sx0 + 28, sy + 34], [sx0 + 20, sy + 50], [sx0 + 26, sy + 50], [sx0 + 22, sy + 62], [sx0 + 34, sy + 45], [sx0 + 28, sy + 45], [sx0 + 32, sy + 34]], { fill: K.ink, lw: 0 });
        // the rock chiselled away round the box
        const rim = [[x0 - 12, y0 - 6], [x0 + w * 0.4, y0 - 12], [x1 + 3, y0 - 8], [x1 + 3, y1 + 9], [x0 + w * 0.5, y1 + 13], [x0 - 10, y1 + 8], [x0 - 15, cy + 6]];
        C.poly(g, rim, { fill: ROCK.rimD, ink: K.ink, lw });
        line(g, [[x0 - 9, y0 - 2], [x0 - 11, cy]], 2.2 * L, ROCK.rim);
        // the box
        C.box(g, x0, y0, w, h, D, IRON, { depth, lw });
        // its right side: the three holes (one over two), seen when the plug is out
        if (o.holes) {
            const hole = (z, dy, hh) => {
                const p = [x1 + D[0] * z, cy + dy + D[1] * z], q = [x1 + D[0] * (z + 9), cy + dy + D[1] * (z + 9)];
                C.poly(g, [[p[0], p[1] - hh], [q[0], q[1] - hh], [q[0], q[1] + hh], [p[0], p[1] + hh]], { fill: K.black, ink: K.ink, lw: 1.6 * L });
            };
            hole(23, -16, 6);
            hole(13, 14, 5);
            hole(33, 14, 5);
        }
        // a rivet in each corner of the front
        for (const [rx, ry] of [[x0 + 7, y0 + 7], [x1 - 7, y0 + 7], [x0 + 7, y1 - 7], [x1 - 7, y1 - 7]]) circ(g, rx, ry, 2.6, IRON.line, 1.4 * L);
        // the faceplate: a bone skull, facing us
        const sw = 52, sh = 62, sx = cx, top = cy - sh / 2 - 2, jw = sw * 0.62;
        const sk = [[sx - sw / 2, top], [sx + sw / 2, top], [sx + sw / 2, top + sh * 0.62], [sx + jw / 2, top + sh * 0.7], [sx + jw / 2, top + sh], [sx - jw / 2, top + sh], [sx - jw / 2, top + sh * 0.7], [sx - sw / 2, top + sh * 0.62]];
        C.prism(g, sk, [4.2, -2.8], BONE, { lw: 2.8 * L });
        const ey = top + sh * 0.36, ew = 15, eh = face === 'strain' ? 12 : 17;
        const glow = live > 0.05 ? (bk > 0.5 ? '#fff59a' : K.yellow) : BONE.dark;
        for (const s of [-1, 1]) {
            const ex = sx + s * 12.5;
            if (face === 'chomp') {
                // happy: two arcs
                line(g, [[ex - 7, ey + 4], [ex, ey - 4], [ex + 7, ey + 4]], 3 * L);
                continue;
            }
            g.beginPath();
            g.roundRect(ex - ew / 2, ey - eh / 2, ew, eh, 3);
            g.fillStyle = glow;
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = 2.2 * L;
            g.stroke();
            if (live > 0.05) {
                // the glow's core, a slit like the Devil's own eyes
                g.fillStyle = K.orange;
                g.fillRect(ex - 2.2, ey - eh / 2 + 2.5, 4.4, eh - 5);
            } else if (face === 'dead') {
                line(g, [[ex - 4, ey - 4], [ex + 4, ey + 4]], 2 * L, BONE.side);
                line(g, [[ex + 4, ey - 4], [ex - 4, ey + 4]], 2 * L, BONE.side);
            }
            if (face === 'strain') C.poly(g, [[ex - s * 9.5, ey - eh / 2 + 1], [ex + s * 9.5, ey - eh / 2 - 7], [ex + s * 9.5, ey - eh / 2 - 2.5], [ex - s * 9.5, ey - eh / 2 + 5.5]], { fill: K.ink, lw: 0 });
        }
        C.poly(g, [[sx, ey + 10], [sx + 4, ey + 18], [sx - 4, ey + 18]], { fill: BONE.dark, lw: 0 });
        // the teeth: a row, clenched to a zigzag under strain, open when it chomps
        const ty = top + sh * 0.82;
        g.strokeStyle = K.ink;
        g.lineWidth = 1.8 * L;
        g.lineCap = 'round';
        if (face === 'strain') {
            line(g, [[sx - jw / 2 + 2, ty], [sx - 10, ty - 4], [sx - 5, ty + 3], [sx, ty - 4], [sx + 5, ty + 3], [sx + 10, ty - 4], [sx + jw / 2 - 2, ty]], 2.2 * L);
        } else {
            g.beginPath();
            g.moveTo(sx - jw / 2, ty);
            g.lineTo(sx + jw / 2, ty);
            for (let i = -1; i <= 1; i++) {
                g.moveTo(sx + i * jw * 0.25, ty - (face === 'chomp' ? 5 : 0));
                g.lineTo(sx + i * jw * 0.25, top + sh);
            }
            g.stroke();
            if (face === 'chomp') line(g, [[sx - jw / 2, ty - 5], [sx + jw / 2, ty - 5]], 1.8 * L);
        }
        if (face === 'dead') {
            // a wisp of smoke off the holes, two drawings
            const f = ((d % 2) + 2) % 2, bx = x1 + 12, by = cy - 26;
            const wisp = C.curve([[bx, by], [bx + (f ? 7 : -3), by - 16], [bx + (f ? -2 : 8), by - 32], [bx + (f ? 6 : 1), by - 48]], false, 6);
            line(g, wisp, 7 * L);
            line(g, wisp, 3 * L, '#c9c3e6');
        }
    }

    // =========================================================================================
    // The plug: three pins, the size of the Devil's head. Local frame: the origin is the middle
    // of its pin face, the pins point to -x, the cable leaves along +x.
    // =========================================================================================
    const PLUG = { front: K.cream, top: K.white, side: '#e2c98a', line: '#c9a85e', pin: K.gold, pinTop: '#ffe98a', pinSide: '#e0a800' };
    const PLUG_BODY = [[0, -32], [46, -32], [60, -25], [70, -11], [70, 11], [60, 25], [46, 32], [0, 32]];
    const PLUG_TAIL = 92; // where the cable starts, along +x
    const PIN_LEN = 25;
    /**
     * plug(g, L, p, o)   p: the middle of its pin face (set coordinates; HOME when it is right in)
     *   o: { ang, out (how much of the pins shows: 0 right in … PIN_LEN and more: all of them),
     *        hot (0..1: the pins spark: a glint on each), d (the drawing) }
     */
    function plug(g, L, p, o = {}) {
        const ang = o.ang ?? 0, out = Math.min(PIN_LEN, o.out ?? PIN_LEN), lw = 3.2 * L, Dz = (z) => rot([D[0] * z, D[1] * z], -ang);
        g.save();
        g.translate(p[0], p[1]);
        g.rotate(ang);
        // the sweep keeps the film's direction however the plug is turned
        const sweep = Dz(PLUG_D);
        // pins: the far one of the lower pair, the upper one (the earth: longer), the near lower one
        const pin = (z, y, hh, len) => {
            const l = Math.min(len, out);
            if (l < 1.5) return;
            const o2 = Dz(z);
            C.prism(g, cw([[-l + o2[0], y - hh + o2[1]], [o2[0], y - hh + o2[1]], [o2[0], y + hh + o2[1]], [-l + o2[0], y + hh + o2[1]]]), Dz(7), { front: PLUG.pin, top: PLUG.pinTop, side: PLUG.pinSide }, { lw: 2.4 * L });
        };
        pin(24, 14, 4.5, PIN_LEN - 3);
        pin(13, -16, 5.5, PIN_LEN);
        pin(4, 14, 4.5, PIN_LEN - 3);
        // the body
        C.prism(g, PLUG_BODY, sweep, PLUG, { lw });
        // grip ribs, a bolt for a badge, a seam
        for (const rx of [10, 17, 24]) line(g, [[rx, -24], [rx, 24]], 2.2 * L, PLUG.line);
        C.poly(g, [[46, -18], [36, 1], [43, 1], [38, 17], [54, -4], [47, -4], [52, -18]], { fill: K.red, ink: K.ink, lw: 1.8 * L });
        line(g, [[3, -27], [43, -27]], 2 * L, K.white);
        // the strain relief: a ribbed sleeve
        const sl = cw([[70, -10], [PLUG_TAIL, -7.5], [PLUG_TAIL, 7.5], [70, 10]]);
        C.prism(g, sl, Dz(9), { front: CABLE.body, top: CABLE.top, side: CABLE.body }, { lw: 2.8 * L });
        for (const rx of [76, 82, 88]) line(g, [[rx, -8.6 + (rx - 70) * 0.1], [rx, 8.6 - (rx - 70) * 0.1]], 1.8 * L, CABLE.top);
        g.restore();
    }
    // a point of the plug's local frame in set coordinates
    const plugPt = (p, ang, q) => {
        const r = rot(q, ang);
        return [p[0] + r[0], p[1] + r[1]];
    };
    const plugTail = (p, ang = 0) => plugPt(p, ang, [PLUG_TAIL - 2, 0]);

    // =========================================================================================
    // The cable: fat, blue-black, a yellow band every so often. pts: its centreline (set
    // coordinates), already a dense polyline (C.curve).
    // =========================================================================================
    const CABLE = { body: '#3d3652', top: '#6c66a0', band: K.yellow, w: 12 };
    /** cable(g, L, pts, o)   o: { w, from, to (0..1: only that stretch of it), bands (false: none) } */
    function cable(g, L, pts, o = {}) {
        const w = o.w ?? CABLE.w, n = pts.length;
        if (n < 2) return;
        // lengths along it, so the bands keep their places
        const len = [0];
        for (let i = 1; i < n; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        const total = len[n - 1], a = (o.from ?? 0) * total, b = (o.to ?? 1) * total;
        const at = (s) => {
            let i = 1;
            while (i < n - 1 && len[i] < s) i++;
            const u = (s - len[i - 1]) / (len[i] - len[i - 1] || 1), p = pts[i - 1], q = pts[i], l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
            return { p: [lerp(p[0], q[0], u), lerp(p[1], q[1], u)], n: [-(q[1] - p[1]) / l, (q[0] - p[0]) / l] };
        };
        const part = [at(a).p, ...pts.filter((_, i) => len[i] > a && len[i] < b), at(b).p];
        g.save();
        g.lineCap = 'round';
        g.lineJoin = 'round';
        line(g, part, w + 6.4 * L);
        line(g, part, w, CABLE.body);
        // a highlight along its upper side
        line(g, part.map(([x, y]) => [x - w * 0.12, y - w * 0.22]), w * 0.2, CABLE.top);
        if (o.bands !== false) {
            for (let s = 34; s < total - 10; s += 58) {
                if (s < a + 4 || s > b - 4) continue;
                const q = at(s);
                line(g, [[q.p[0] - q.n[0] * w * 0.5, q.p[1] - q.n[1] * w * 0.5], [q.p[0] + q.n[0] * w * 0.5, q.p[1] + q.n[1] * w * 0.5]], 5, CABLE.band);
            }
        }
        g.restore();
    }
    // The other end: a jack plate on the car's flank, in front of the rear wheel's arch.
    const JACK = [271, 752];
    function jack(g, L) {
        const [x, y] = JACK;
        C.box(g, x - 11, y - 9, 22, 18, D, { front: '#d5dbea', top: '#fffdf4', side: '#8d95ad' }, { depth: 5, lw: 2.4 * L });
        circ(g, x, y, 5.5, K.black, 1.8 * L);
    }


    // =========================================================================================
    // The cel night: flat darker tones over the picture (a multiply), with hard-edged pools of
    // light punched in it. holes(c) and rim(c) only FILL shapes on the context they get (frame
    // coordinates); rim, if given, is a wider set of shapes that stays half dark round the holes.
    // =========================================================================================
    const NIGHT = { tone: '#ffffff', half: '#ffffff' };
    function night(g, env, holes, rim = null, tone = NIGHT.tone, half = NIGHT.half) {
        const A = Motion.layer(env, 'hellplug-night', (c) => {
            c.fillStyle = tone;
            c.fillRect(0, 0, 1000, 1000);
            c.globalCompositeOperation = 'destination-out';
            c.fillStyle = '#000';
            (rim ?? holes)(c);
        });
        g.save();
        g.globalCompositeOperation = 'multiply';
        Motion.drawLayer(g, env, A);
        if (rim) {
            const R = Motion.layer(env, 'hellplug-half', (c) => {
                c.fillStyle = half;
                rim(c);
                c.globalCompositeOperation = 'destination-out';
                c.fillStyle = '#000';
                holes(c);
            });
            Motion.drawLayer(g, env, R);
        }
        g.restore();
    }

    // =========================================================================================
    // The Devil's frame, for what we lay over him: his own units on a context (Devil.draw's
    // transform, down to his head when `head` is true).
    // =========================================================================================
    function inDevil(c, x, y, s, pose, head, fn) {
        const q = pose.squash ?? 0;
        c.save();
        c.translate(x, y);
        c.scale(s, s);
        c.rotate(pose.lean ?? 0);
        c.scale(1 + q, 1 - q);
        if (head) {
            c.translate(0, pose.headDy ?? 0);
            c.rotate(pose.headTilt ?? 0);
        }
        fn(c);
        c.restore();
    }
    // His eyes and his mouth as shapes to fill (his head's frame; the numbers are devil.js's):
    // in the dark they are all that shows of him.
    const FACE = { ey: -1.36, my: -1.1 };
    function faceHoles(c, mood = 'grin') {
        const { ey, my } = FACE;
        if (mood !== 'laugh') {
            for (const sx of [-1, 1]) {
                const eh = mood === 'shock' ? 0.22 : mood === 'sly' && sx > 0 ? 0.11 : 0.165;
                c.beginPath();
                c.roundRect(sx * 0.21 - 0.1, ey - eh / 2, 0.2, eh, 0.045);
                c.fill();
            }
        }
        let m;
        if (mood === 'shock') m = C.ellipsePts(0, my + 0.05, 0.1, 0.12, 24);
        else if (mood === 'angry') m = [[-0.27, my + 0.07], [-0.2, my - 0.03], [0.2, my - 0.03], [0.27, my + 0.07], [0.2, my + 0.14], [-0.2, my + 0.14]];
        else {
            const open = mood === 'laugh' ? 0.15 : 0.1;
            const upper = C.curve([[-0.31, my - 0.07], [-0.16, my - 0.005], [0, my + 0.012], [0.16, my - 0.005], [0.31, my - 0.07]], false, 6);
            const lower = C.curve([[0.31, my - 0.07], [0.19, my + open * 0.72], [0, my + open], [-0.19, my + open * 0.72], [-0.31, my - 0.07]], false, 6);
            m = [...upper, ...lower.slice(1, -1)];
        }
        C.trace(c, m);
        c.fill();
    }

    // =========================================================================================
    // The Devil sat on the floor. Devil.draw gives him down to his coat's hem (it is clipped at
    // the floor); the legs are ours, splayed along the floor, hooves up.
    //   (x, y): the floor under his seat;  pose: as Devil.draw's (lean tips the whole figure
    //   about his seat; tail: about 0.5 lays it flat on the floor)
    //   o: { legs: [left, right] angles of the two legs (radians from +x; default flat out to
    //        each side), shadow }
    // seatPose(pose) → the pose to hand to inDevil for the same figure (with x, y + seatDrop).
    // =========================================================================================
    const SEAT = 0.36; // his hem above his hooves
    const seatDrop = (pose, s) => SEAT * (1 - (pose.squash ?? 0)) * s;
    function leg(g, L, hip, a) {
        const u = [Math.cos(a), Math.sin(a)], n0 = [-u[1], u[0]], n = n0[1] < 0 ? n0 : [-n0[0], -n0[1]]; // n: the side the toes point to (up)
        const at = (k, v) => [hip[0] + u[0] * k + n[0] * v, hip[1] + u[1] * k + n[1] * v];
        const Dz = [D[0] * 0.22, D[1] * 0.22];
        C.prism(g, cw([at(-0.04, -0.12), at(0.3, -0.12), at(0.3, 0.12), at(-0.04, 0.12)]), Dz, { front: DP.trouser, top: DP.stripe, side: DP.trouserSide }, { lw: L });
        for (const v of [-0.06, 0, 0.06]) line(g, [at(0, v), at(0.285, v)], L * 0.5, DP.stripe);
        // the hoof: its sole to the end of the leg, the cloven toe up
        C.prism(g, cw([at(0.3, -0.13), at(0.42, -0.13), at(0.42, 0.24), at(0.3, 0.24)]), [D[0] * 0.26, D[1] * 0.26], { front: DP.hoof, top: DP.hoofTop, side: DP.hoof }, { lw: L });
        line(g, [at(0.33, 0.2), at(0.33, 0.1)], L * 1.1, DP.hoofShine);
        C.poly(g, [at(0.3, 0.245), at(0.36, 0.17), at(0.42, 0.245)], { fill: K.ink, lw: 0 });
    }
    function seated(g, x, y, s, pose = {}, o = {}) {
        const L = 3.2 / s, legs = o.legs ?? [PI - 0.06, 0.06];
        g.save();
        g.translate(x, y);
        g.rotate(pose.lean ?? 0);
        if (o.shadow !== false) {
            g.fillStyle = DP.shadow;
            g.beginPath();
            g.ellipse(0.04 * s, 0, 0.78 * s, 0.07 * s, 0, 0, TAU);
            g.fill();
        }
        g.save();
        g.beginPath();
        g.rect(-4 * s, -5 * s, 8 * s, 5 * s + 0.018 * s);
        g.clip();
        Devil.draw(g, 0, seatDrop(pose, s), s, { tail: 0.5, ...pose, lean: 0, shadow: false });
        g.restore();
        g.scale(s, s);
        g.lineJoin = 'round';
        leg(g, L, [0.17, -0.125], legs[1]);
        leg(g, L, [-0.17, -0.125], legs[0]);
        g.restore();
    }

    // =========================================================================================
    // Sparks: a jagged flash with bolts round it (three drawings), and the small ones that
    // sputter after. (x, y): where it is; r: its size.
    // =========================================================================================
    const zap = (seed, a, b, n = 4, amp = 0.22) => {
        const r = Motion.rng(seed), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
        return Array.from({ length: n + 1 }, (_, i) => {
            const u = i / n, o = i === 0 || i === n ? 0 : (i % 2 ? 1 : -1) * l * amp * (0.5 + r() * 0.6);
            return [a[0] + dx * u - (dy / l) * o, a[1] + dy * u + (dx / l) * o];
        });
    };
    // the bolts alone: n of them from r0 to r1 round (x, y), turned by `rot`
    function bolts(g, x, y, r0, r1, n, seed, lw, o = {}) {
        for (let i = 0; i < n; i++) {
            const a = (o.rot ?? 0) + (o.a0 ?? 0) + ((o.a1 ?? TAU) - (o.a0 ?? 0)) * (i + 0.5) / n, k = 0.8 + 0.4 * Motion.rng(seed + 'k' + i)();
            const pts = zap(seed + i, [x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1 * k, y + Math.sin(a) * r1 * k], 4, 0.2);
            line(g, pts, lw * 2.6);
            line(g, pts, lw, i % 2 ? K.yellow : K.white);
        }
    }
    const flashPts = (x, y, r, seed, rot = 0) => C.burstPts(x, y, { r0: r * 0.5, r1: r, n: 9, seed, jitter: 0.3, rot });
    function flash(g, x, y, r, seed, lw, rot = 0) {
        C.poly(g, flashPts(x, y, r, seed, rot), { fill: K.yellow, ink: K.ink, lw });
        C.poly(g, C.burstPts(x, y, { r0: r * 0.24, r1: r * 0.56, n: 9, seed, jitter: 0.3, rot }), { fill: K.white, lw: 0 });
    }

    // =========================================================================================
    // Where the pit's lighters are. Inferno.crowd decides who holds one from each fan's own
    // seeded numbers; the same numbers are read here (the list is built exactly as inferno.js
    // builds it), so every flame can punch its pool in the night and the first flames can be
    // counted. If inferno.js changes how it seeds the pit, this has to follow.
    // =========================================================================================
    const ROWS = [886, 922, 960, 1000], PITCH = 67;
    let pitList = null;
    function pit() {
        if (pitList) return pitList;
        pitList = [];
        ROWS.forEach((y, r) => {
            for (let i = -7; i <= 22; i++) {
                const rn = Motion.rng('inferno-pit:' + r + ':' + i), x = 12 + i * PITCH + (r % 2) * PITCH * 0.5 + (rn() - 0.5) * 10;
                const skel = rn() < (r === 0 ? 0.1 : 0.24), turnR = rn();
                const f = { r, x, y: y + (rn() - 0.5) * 6, skel, rank: rn(), thr: 0.06 + 0.8 * rn(), ph: rn() < 0.7 ? 0 : 0.5, amp: 0.7 + 0.6 * rn(), size: 0.92 + 0.14 * rn(), turnR, turnS: rn() < 0.5 ? -1 : 1, side: rn() < 0.5 ? -1 : 1, wear: Math.floor(rn() * 6), tee: Math.floor(rn() * 4) };
                f.hawk = rn() < 0.4 ? Math.floor(rn() * 4) : -1;
                f.light = rn();
                pitList.push(f);
            }
        });
        return pitList;
    }
    /**
     * lighterPoints(t, nl, x0, x1) → [{ x, y, r (the row), u (the fan's unit) }]: the flames' middles in set
     * coordinates for Inferno.crowd's `lighters: nl` at t, among the fans standing between x0 and x1.
     */
    function lighterPoints(t, nl, x0 = -1e9, x1 = 1e9) {
        const sway = Math.sin((C.onTwos(t) * TAU) / 2.4), out = [];
        for (const f of pit()) {
            if (f.x < x0 || f.x > x1 || !(f.light < nl * 0.85)) continue;
            const u = (f.skel ? 70 : 56) * f.size, up = f.skel ? [0.52, -1.5] : [0.66, -1.18], k = f.skel ? 0.9 : 1, ul = k * (f.skel ? 0.8 : 1), fl = 0.5 + 0.5 * nl;
            const foot = [up[0] * 0.9 + sway * 0.16, up[1] + 0.06 - 0.05 * k], c = rot([0, -(0.215 + (0.24 + 0.1 * fl) * 0.5) * ul], sway * 0.16);
            out.push({ x: f.x + sway * 3 + (foot[0] + c[0]) * u, y: f.y + (foot[1] + c[1]) * u, r: f.r, u });
        }
        return out;
    }
    // the `lighters` value at which exactly `count` of the fans between x0 and x1 hold a flame
    function lightersFor(count, x0, x1) {
        const v = pit().filter((f) => f.x >= x0 && f.x <= x1).map((f) => f.light).sort((a, b) => a - b);
        return count <= 0 ? 0 : count >= v.length ? 1 : ((v[count - 1] + v[count]) / 2) / 0.85;
    }

    return { layer, socket, SOCK, HOME, plug, plugPt, plugTail, PLUG_TAIL, PIN_LEN, cable, CABLE, jack, JACK, night, NIGHT, inDevil, faceHoles, seated, seatDrop, bolts, flash, flashPts, zap, lighterPoints, lightersFor, pit };
})();
