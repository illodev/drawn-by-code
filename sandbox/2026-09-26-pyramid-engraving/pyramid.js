// The pyramid that makes skies: its stones, its shells and the machine inside, as instance
// lists for Engrave. Built once (every stone has its place, size and seed), placed per t.
//
// The building: a square pyramid (half base B, height HP) laid in NC courses. Each course is
// three shells of stones (the skin, 0, and two layers under it) round a hollow chamber: the
// machine (a stepped obsidian core with blue channels, a bronze axis, three gold rings)
// lives there and is already turning before anything opens.
//
// The timeline (script PIR-01, PIR-02 and PIR-03):
//   0    the closed pyramid at dusk
//   2.5  a very faint blue line wakes in the joint under the first stone (S0, the +z face);
//        a falling grain of sand turns aside and drifts to it (the camera follows it in)
//   5.0  the blue line is clear
//   5.0  the mark on S0 (the Claude mascot) is painted line by line, until 6.8
//   6.0  S0 moves a few centimetres out, pressing dust from its lower edge
//   7.0  its neighbours answer: the opening spreads upwards and through the three shells,
//        a slot that shows the polished black core
//   9.0  the three rings of the machine line up, concentric, and the eye sees further in
//   10   the whole building answers: first the courses part in bands, then each face moves
//        out along its own normal, the skin furthest (the corners open into V gaps), until
//        13.5, when skin, shells and heart read apart; held to 15.5; the machine never stops
const Pyramid = (() => {
    const B = 1, HP = 1.27, NC = 30, H = HP / NC, TK = 0.08;
    const SHELLS = [
        { out: 0.95, fs: 1.18, fy: 1.2, drift: 0.08 },
        { out: 0.52, fs: 1.12, fy: 1.13, drift: 0.05 },
        { out: 0.24, fs: 1.06, fy: 1.06, drift: 0.03 },
    ];
    const halfAt = (y) => B * (1 - y / HP);
    const E = (t, a, b) => Ease.inOut(Ease.seg(t, a, b));
    function stones() {
        const r = Motion.rng('pyramid-stones');
        const S = [];
        for (let c = 0; c < NC; c++) {
            const y = (c + 0.5) * H, w = halfAt(c * H + H);
            for (let s = 0; s < 3; s++) {
                const wo = w - s * TK, wi = wo - TK;
                if (wo <= 0.02) break;
                const inner = Math.max(wi, 0);
                // four sides: ±x run the full length (they own the corners), ±z fit between
                for (const [ax, sg] of [[0, 1], [0, -1], [2, 1], [2, -1]]) {
                    const len = ax === 0 ? wo : inner;
                    if (len <= 0.01) continue;
                    let u = -len + (c % 2 ? r() * 0.05 : 0);
                    u = Math.max(u, -len);
                    while (u < len - 0.005) {
                        const l = Math.min(0.08 + r() * 0.08, len - u);
                        const mid = u + l / 2, d = (wo + inner) / 2;
                        const cpos = ax === 0 ? [sg * d, y, mid] : [mid, y, sg * d];
                        const half = ax === 0 ? [(wo - inner) / 2 - 0.002, H / 2 - 0.0009, l / 2 - 0.002] : [l / 2 - 0.002, H / 2 - 0.0009, (wo - inner) / 2 - 0.002];
                        const n = ax === 0 ? [sg, 0, 0] : [0, 0, sg];
                        // hand-cut and settled: sizes, seats and faces a little off true
                        const sh = [half[0] - r() * 0.0012, half[1] - r() * 0.0008, half[2] - r() * 0.0012];
                        const jit = [(r() - 0.5) * 0.002, (r() - 0.5) * 0.0008, (r() - 0.5) * 0.002];
                        const q = Engrave.quat([r() - 0.5, r() - 0.5, r() - 0.5], (r() - 0.5) * 0.025);
                        S.push({ c: cpos.map((v, i) => v + jit[i]), half: sh, q, course: c, shell: s, n, seed: r(), drift: r(), worn: r() < 0.12 ? 1 : 0 });
                        u += l;
                    }
                }
            }
        }
        // the first stone: skin, +z face, the sixth course, nearest x = 0.05
        const c0 = 8, y0 = (c0 + 0.5) * H;
        let S0 = null;
        for (const s of S) if (s.shell === 0 && s.n[2] === 1 && s.course === c0 && (!S0 || Math.abs(s.c[0] - 0.05) < Math.abs(S0.c[0] - 0.05))) S0 = s;
        S0.first = true;
        // the waking zone: stones of all three shells on the +z side around and above S0
        for (const s of S) {
            const rel = s.c[0] - S0.c[0], dy = s.c[1] - S0.c[1];
            s.dist = Math.hypot(s.c[0] - S0.c[0], s.c[1] - S0.c[1], s.c[2] - S0.c[2]);
            if (s.first || s.n[2] !== 1 || Math.abs(rel) > 0.22 || dy < -0.03 || dy > 0.3) continue;
            const side = Math.abs(rel) < 0.02 ? (s.seed < 0.5 ? -1 : 1) : Math.sign(rel);
            s.wake = {
                t0: 7 + dy * 4.2 + s.shell * 0.35 + Math.abs(rel) * 1.6,
                dx: side * (0.06 + 0.03 * s.shell) * (1.15 - Math.abs(rel) / 0.26),
                dz: 0.014 + 0.008 * s.seed,
            };
        }
        // slabs: the building opens in slabs, not stones. A slab is four courses of one shell on
        // one face, a third of a metre or so along it; its stones stay packed and move as one,
        // so every moving piece is a panel of many small drawn stones, as the plates draw walls
        const slabs = new Map();
        for (const s of S) {
            const ax = s.n[0] !== 0 ? 0 : 2, along = ax === 0 ? s.c[2] : s.c[0];
            const key = [s.shell, s.n[0], s.n[2], Math.floor(s.course / 4), Math.floor((along + 1.2) / 0.32)].join(',');
            if (!slabs.has(key)) slabs.set(key, { members: [], ax });
            slabs.get(key).members.push(s);
        }
        const rs = Motion.rng('pyramid-slabs');
        for (const sl of slabs.values()) {
            const m = sl.members;
            sl.c = [0, 1, 2].map((i) => m.reduce((a, s) => a + s.c[i], 0) / m.length);
            sl.shell = m[0].shell;
            sl.n = m[0].n;
            sl.drift = rs();
            sl.tilt = (rs() - 0.5) * 0.14;
            sl.dist = Math.hypot(sl.c[0] - S0.c[0], sl.c[1] - S0.c[1], sl.c[2] - S0.c[2]);
            for (const s of m) s.slab = sl;
        }
        return { S, S0 };
    }
    let ST = null;
    // the heart's rings: each sized every frame to the room the chamber has at its height (the
    // inner shell's face, moved out as the stone opens), so no ring ever cuts a stone, closed
    // or open; e is the openness
    const RINGS = [[0.36, 0.35, 0.14], [0.47, -0.55, 0.22], [0.58, 0.8, 0.3]];
    function ringPose(t, i, e) {
        const sh2 = SHELLS[2];
        const room = (y) => {
            const fy = 1 + (sh2.fy - 1) * e, fs = 1 + (sh2.fs - 1) * e;
            return (halfAt(Math.min(y / fy + H, HP)) - 3 * TK) * fs + sh2.out * e * 0.78 - 0.035;
        };
        const [y0r, sp, tilt] = RINGS[i];
        const y = y0r * (1 + 0.25 * e);
        let rad = 0.3;
        for (let k = 0; k < 4; k++) rad = Math.max(0.04, 0.92 * room(y + rad * Math.sin(tilt) + 0.02) / 1.085);
        const q = Engrave.qmul(Engrave.quat([0, 1, 0], t * sp + i), Engrave.quat([1, 0, 0.3], tilt));
        return { c: [0, y, 0], rad, q };
    }
    const face = (n) => { const v = [n[0] * HP, B, n[2] * HP], l = Math.hypot(...v); return v.map((x) => x / l); };
    // where a slab's centre is at t: the bands part, then its face moves out (the skin
    // furthest), and it turns a little about its own face line
    function slabAt(sl, t) {
        const sh = SHELLS[sl.shell];
        const eb = E(t, 10 + sl.dist * 0.5, 12 + sl.dist * 0.5);
        const eo = E(t, 11 + sl.dist * 0.4, 13.2 + sl.dist * 0.2);
        const fs = 1 + (sh.fs - 1) * eo, fy = 1 + (sh.fy - 1) * eb;
        const nf = face(sl.n), k = sh.out * eo + sh.drift * eo * (sl.drift - 0.3);
        const band = Math.floor(sl.c[1] / H / 4);
        const p = [sl.c[0] * fs + nf[0] * k, sl.c[1] * fy + nf[1] * k + band * 0.035 * eb, sl.c[2] * fs + nf[2] * k];
        const q = Engrave.quat(sl.ax === 0 ? [0, 0, 1] : [1, 0, 0], sl.tilt * eo);
        return { p, q };
    }
    const qrot = (q, v) => {
        const [x, y, z, w] = q, c1 = [y * v[2] - z * v[1] + w * v[0], z * v[0] - x * v[2] + w * v[1], x * v[1] - y * v[0] + w * v[2]];
        return [v[0] + 2 * (y * c1[2] - z * c1[1]), v[1] + 2 * (z * c1[0] - x * c1[2]), v[2] + 2 * (x * c1[1] - y * c1[0])];
    };
    // where a stone is at t (and its turn, in s.qt): carried by its slab, plus its own waking
    // slide for the stones round the first one
    function place(s, t) {
        const { p: sp, q: sq } = slabAt(s.slab, t);
        const o = qrot(sq, [s.c[0] - s.slab.c[0], s.c[1] - s.slab.c[1], s.c[2] - s.slab.c[2]]);
        const p = [sp[0] + o[0], sp[1] + o[1], sp[2] + o[2]];
        s.qt = Engrave.qmul(sq, s.q);
        if (s.first) {
            // out a few centimetres at 6 s (slow to start, stopping with weight), aside at 8 s
            p[2] += 0.025 * E(t, 6, 6.9);
            p[0] -= 0.1 * E(t, 8, 8.9);
        } else if (s.wake) {
            const w = E(t, s.wake.t0, s.wake.t0 + 0.9);
            p[0] += s.wake.dx * w;
            p[2] += s.wake.dz * w;
        }
        return p;
    }
    // o.stoneT(s): a stone's own time (closing, PIR-09, replays each stone's opening backwards);
    // o.e: openness of the capstone and the machine
    function build(t, o = {}) {
        ST = ST ?? stones();
        const { S, S0 } = ST;
        const e = o.e ?? E(t, 10.5, 13.5);
        const box = [], dust = [], tops = [], marks = [];
        for (const s of S) Engrave.inst(box, place(s, o.stoneT ? o.stoneT(s) : t), s.worn, s.half, s.seed, s.qt);
        // the capstone rides the axis
        // (the capstone: the size of one course, worn stone like the rest, drawn as masonry)
        Engrave.inst(tops, [0, HP * (1 + 0.45 * e) - H * 0.35, 0], 1, [H * 0.9, H * 0.65, H * 0.9], 0.3);
        // the first stone's joint and mark (they travel with it)
        const p0 = place(S0, o.stoneT ? o.stoneT(S0) : t), f0 = p0[2] + S0.half[2];
        // (the mark is painted, line by line, at an even pace over 1.8 s: mascot.js)
        const joint = Math.max(0.3 * E(t, 2.4, 3.2), E(t, 4.6, 5.6)), mark = Ease.seg(t, 5.0, 6.8);
        const jointGlow = 0.6 * (0.35 + 0.65 * E(t, 4.4, 5.4));
        // the joint line glows from inside the joint, thin
        if (joint > 0) Engrave.inst(marks, [p0[0], p0[1] - H / 2 - 0.0002, f0 - 0.006], 4, [S0.half[0] * 0.95 * Math.min(1, joint / 0.3), 0.0009, 0.004], 0.5, [0, 0, 0, 1], jointGlow * Math.min(1, joint / 0.3));
        // the mark: the Claude mascot, traced in live blue from its incision (mascot.js)
        if (mark > 0) Mascot.draw(marks, [p0[0], p0[1] + 0.002, f0 + 0.0004], [0, 0, 0, 1], 0.03, 0.7, { w: 0.0007, k: mark });
        // the heart: a stepped obsidian core, blue channels along its steps, a bronze axis and
        // three gold rings turning round it; closed, it is folded small inside the chamber
        const core = [], blue = [], cyl = [], rings = [];
        const TIERS = 6, TH = 0.05, CORE_TOP = TIERS * TH;
        for (let i = 0; i < TIERS; i++) {
            const hw = 0.3 - i * 0.045, y = TH * (i + 0.5);
            Engrave.inst(core, [0, y, 0], 2, [hw, TH / 2 - 0.002, hw], 0.3 + i * 0.1);
            for (const [dx, dz, lx, lz] of [[1, 0, 0.003, hw], [-1, 0, 0.003, hw], [0, 1, hw, 0.003], [0, -1, hw, 0.003]])
                Engrave.inst(blue, [dx * (hw + 0.003), y + TH / 2 - 0.005, dz * (hw + 0.003)], 4, [lx, 0.004, lz], 0.5, [0, 0, 0, 1], 0.6);
        }
        const ah = 0.25 + 0.3 * (o.axis ?? e);
        Engrave.inst(cyl, [0, CORE_TOP + ah, 0], 6, [0.022, ah, 0.022], 0.2);
        // the rings turn round the axis above the core (see ringPose); o.ring(i, pose) may
        // take one over (the gate the camera goes through, junctions.js)
        for (let i = 0; i < 3; i++) {
            let r = ringPose(t, i, e);
            if (o.ring) r = o.ring(i, r) ?? r;
            if (r) Engrave.inst(rings, r.c, 3, [r.rad, r.rad, r.rad], 0.3 + i * 0.2, r.q);
        }
        // in the slot, one small ring per shell: they come out edge-on as the stones part, and
        // at 9 s turn to face the eye, concentric, so the eye sees on through them
        const show = E(t, 8.1, 8.6), face9 = E(t, 8.6, 9.2);
        if (show > 0) for (let k = 0; k < 3; k++) {
            const yy = S0.c[1] + 0.07, zz = halfAt(yy + H) - TK * (k + 0.5) + 0.012;
            const q = Engrave.qmul(Engrave.quat([0, 1, 0], (1 - face9) * (Math.PI / 2) * (k % 2 ? 1 : -1)), Engrave.quat([1, 0, 0], Math.PI / 2));
            const rr = 0.03 * show * (1 - 0.12 * k);
            Engrave.inst(rings, [S0.c[0] - 0.01, yy, zz], 3, [rr, rr, rr], 0.2 + k * 0.2, q);
        }
        // dust. S0's lower edge presses out a puff at 6 s (each grain on its own closed-form
        // fall); from 10 s grains fall from every opened joint
        const r = Motion.rng('pyramid-dust');
        for (let i = 0; i < 260; i++) {
            const t0 = 6.05 + r() * 0.5, vx = (r() - 0.5) * 0.12, vz = 0.02 + r() * 0.06, vy = r() * 0.03;
            const x0 = (r() - 0.5) * 2 * S0.half[0], sz = 0.00025 + r() * 0.0004, sd = r();
            const u = t - t0;
            if (u < 0 || u > 3) continue;
            const y = S0.c[1] - H / 2 + vy * u - 0.5 * 0.35 * u * u;
            if (y < 0) continue;
            Engrave.inst(dust, [p0[0] + x0 + vx * u, y, f0 + 0.005 + vz * u], 5, [sz, sz, sz], sd, [0, 0, 0, 1], 0, 0.75);
        }
        for (let i = 0; i < 700; i++) {
            const s = S[Math.floor(r() * S.length)];
            const p = place(s, t);
            const ph = (t * (0.08 + r() * 0.1) + r()) % 1;
            const y = p[1] - ph * 0.6;
            const sz = 0.003 + r() * 0.004, jx = r() - 0.5, jz = r() - 0.5, sd = r();
            if (y < 0.005 || e < 0.05) continue;
            Engrave.inst(dust, [p[0] + jx * 0.06, y, p[2] + jz * 0.06], 5, [sz, sz, sz], sd, [0, 0, 0, 1], 0, 0.75);
        }
        // PIR-01. The grain of sand: it falls past the face, and at 2.9 s, as the joint wakes,
        // turns aside and drifts to it, arriving as the camera closes in (4.9 s)
        const jy = S0.c[1] - H / 2, jp = [S0.c[0] + 0.02, jy, S0.c[2] + S0.half[2] + 0.004];
        if (!o.quiet && t > 1.6 && t < 5.2) {
            const fall = (u) => [jp[0] - 0.55 + 0.04 * u, jp[1] + 0.62 - 0.5 * 0.28 * u * u, jp[2] + 0.34];
            let g;
            if (t < 2.9) g = fall(t - 1.6);
            else {
                const a0 = fall(1.3), u = Ease.inOut(Ease.seg(t, 2.9, 4.9));
                const c1 = [a0[0] + 0.12, a0[1] - 0.08, a0[2]], c2 = [jp[0] - 0.05, jp[1] + 0.03, jp[2] + 0.06];
                const b3 = (a, b, c, d) => (1 - u) ** 3 * a + 3 * (1 - u) ** 2 * u * b + 3 * (1 - u) * u * u * c + u ** 3 * d;
                g = [0, 1, 2].map((i) => b3(a0[i], c1[i], c2[i], jp[i]));
            }
            Engrave.inst(dust, g, 5, [0.0032, 0.0032, 0.0032], 0.4, [0, 0, 0, 1], 0, 0.75);
        }
        // the ground (terrain.js): the excavated rock and the sand, one instance each
        const rockG = [], sandG = [];
        Engrave.inst(rockG, [0, 0, 0], 1, [1, 1, 1], 0.37);
        Engrave.inst(sandG, [0, 0, 0], 5, [1, 1, 1], 0.61);
        // loose stones half sunk in the sand, thicker on the spoil mounds in front
        const loose = [];
        const rs2 = Motion.rng('pyramid-loose');
        for (let i = 0; i < 160; i++) {
            const x = (rs2() - 0.5) * 6, z = 1.9 + rs2() * 3.6, sz = 0.005 + Math.pow(rs2(), 4) * 0.035;
            if (Math.max(Math.abs(x), Math.abs(z)) < 1.25) continue;
            Engrave.inst(loose, [x, Terrain.height(x, z) + sz * 0.25, z], 1, [sz * (0.8 + rs2() * 0.6), sz * 0.6, sz * (0.8 + rs2() * 0.6)], rs2(), Engrave.quat([rs2() - 0.5, 1, rs2() - 0.5], rs2() * 6));
        }
        const draws = [
            { mesh: 'box', inst: new Float32Array(box), box: true },
            { mesh: 'pyramid', inst: new Float32Array(tops), masonry: true },
            { mesh: 'box', inst: new Float32Array(core), box: true },
            { mesh: 'cylinder', inst: new Float32Array(cyl), tan: 'y' },
            { mesh: 'box', inst: new Float32Array(blue), box: true, cast: false },
            { mesh: 'box', inst: new Float32Array(marks), box: true, cast: false },
            { mesh: 'ring', inst: new Float32Array(rings) },
            { mesh: 'sphere', inst: new Float32Array(dust), cast: false },
            { mesh: 'terrain-rock', inst: new Float32Array(sandG) },
            { mesh: 'terrain-sand', inst: new Float32Array(sandG) },
            { mesh: 'rock', inst: new Float32Array(loose) },
        ];
        // the machine's light shows once the slot opens; the mark lights its own stone
        const inner = Math.max(e, 0.35 * E(t, 7.2, 9));
        const lights = [
            [0.55, 0.3, 0.55, 0, 0.9 * e], [-0.4, 0.3, 0.55, 0, 0.6 * e], [0.55, 0.35, -0.4, 0, 0.6 * e],
            [0, 0.75, 0, 0, 0.5 * inner], [0, S0.c[1], 0.25, 0, 0.5 * inner],
        ];
        // (the mark lights no light of its own: it lightened the whole face round it, «las losas
        // se vuelven más claras»; its blue is in its lines)
        return { draws, lights, stones: S.length, S0: p0, S0face: f0 };
    }
    return { build, ringPose, B, HP, H, S0: () => (ST = ST ?? stones()).S0, all: () => (ST = ST ?? stones()).S };
})();
