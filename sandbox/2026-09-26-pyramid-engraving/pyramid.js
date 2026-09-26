// The pyramid that makes skies: its stones, its shells and the machine inside, as instance
// lists for Engrave. Built once (every stone has its place, size and seed), placed per t.
//
// The building: a square pyramid (half base B, height HP) laid in NC courses. Each course is
// three shells of stones (the skin, 0, and two layers under it) round a hollow chamber: the
// machine (a stepped obsidian core with blue channels, a bronze axis, three gold rings)
// lives there.
// Opening (e = 0 closed … 1 open): each of the four faces moves out along its own face
// normal, the skin furthest, so the corners open into V-shaped gaps that show the shells
// under it and the machine at the heart; the stones also spread a little within their face
// (a lattice) and the courses part in bands of four. The silhouette stays a pyramid, larger.
const Pyramid = (() => {
    const B = 1, HP = 1.27, NC = 18, H = HP / NC, TK = 0.12;
    const SHELLS = [
        { out: 0.95, fs: 1.18, fy: 1.2, drift: 0.08 },
        { out: 0.52, fs: 1.12, fy: 1.13, drift: 0.05 },
        { out: 0.24, fs: 1.06, fy: 1.06, drift: 0.03 },
    ];
    const halfAt = (y) => B * (1 - y / HP);
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
                        const l = Math.min(0.14 + r() * 0.1, len - u);
                        const mid = u + l / 2, d = (wo + inner) / 2;
                        const cpos = ax === 0 ? [sg * d, y, mid] : [mid, y, sg * d];
                        const half = ax === 0 ? [(wo - inner) / 2 - 0.002, H / 2 - 0.0018, l / 2 - 0.002] : [l / 2 - 0.002, H / 2 - 0.0018, (wo - inner) / 2 - 0.002];
                        const n = ax === 0 ? [sg, 0, 0] : [0, 0, sg];
                        S.push({ c: cpos, half, shell: s, n, seed: r(), drift: r(), worn: r() < 0.12 ? 1 : 0 });
                        u += l;
                    }
                }
            }
        }
        return S;
    }
    let ST = null;
    function build(t, e) {
        ST = ST ?? stones();
        const box = [], dust = [], tops = [];
        // the ground
        Engrave.inst(box, [0, -0.5, 0], 5, [60, 0.5, 60], 0.5);
        const face = (n) => { const v = [n[0] * HP, B, n[2] * HP], l = Math.hypot(...v); return v.map((x) => x / l); };
        const place = (s, e) => {
            const sh = SHELLS[s.shell];
            const fs = 1 + (sh.fs - 1) * e, fy = 1 + (sh.fy - 1) * e;
            const nf = face(s.n), k = sh.out * e + sh.drift * e * (s.drift - 0.3);
            const band = Math.floor(s.c[1] / H / 4);
            return [s.c[0] * fs + nf[0] * k, s.c[1] * fy + nf[1] * k + band * 0.035 * e, s.c[2] * fs + nf[2] * k];
        };
        for (const s of ST) Engrave.inst(box, place(s, e), s.worn, s.half, s.seed);
        // the capstone rides the axis
        Engrave.inst(tops, [0, HP * (1 + 0.45 * e) + H * 0.2, 0], 0, [H * 1.1, H * 1.1, H * 1.1], 0.3);
        // the heart: a stepped obsidian core, blue channels along its steps, a bronze axis and
        // three gold rings turning round it
        const core = [], blue = [], cyl = [], rings = [];
        const TIERS = 7, TH = 0.08;
        for (let i = 0; i < TIERS; i++) {
            const hw = 0.5 - i * 0.065, y = TH * (i + 0.5);
            Engrave.inst(core, [0, y, 0], 2, [hw, TH / 2 - 0.002, hw], 0.3 + i * 0.1);
            // the channel: a glowing line along the four upper edges of the step
            for (const [dx, dz, lx, lz] of [[1, 0, 0.004, hw], [-1, 0, 0.004, hw], [0, 1, hw, 0.004], [0, -1, hw, 0.004]])
                Engrave.inst(blue, [dx * (hw + 0.004), y + TH / 2 - 0.006, dz * (hw + 0.004)], 4, [lx, 0.005, lz], 0.5, [0, 0, 0, 1], 0.6);
        }
        // closed, the machine is folded inside the chamber; it grows as the stone opens
        const g = 0.45 + 0.55 * e, ah = 0.2 + 0.3 * e;
        Engrave.inst(cyl, [0, TIERS * TH + ah, 0], 6, [0.03, ah, 0.03], 0.2);
        const R = [[0.36, 0.8, 0.35, 0.22], [0.58, 0.64, -0.55, 0.55], [0.8, 0.46, 0.8, 0.95]];
        R.forEach(([y, rad, sp, tilt], i) => {
            const q = Engrave.qmul(Engrave.quat([0, 1, 0], t * sp + i), Engrave.quat([1, 0, 0.3], tilt));
            Engrave.inst(rings, [0, (y + 0.1 * e * i) * (0.6 + 0.4 * e), 0], 3, [rad * g, rad * g, rad * g], 0.3 + i * 0.2, q);
        });
        // dust falling from the opened joints: dark stipples, each on its own closed-form fall
        const r = Motion.rng('pyramid-dust');
        for (let i = 0; i < 700; i++) {
            const s = ST[Math.floor(r() * ST.length)];
            const p0 = place(s, e);
            const ph = (t * (0.08 + r() * 0.1) + r()) % 1;
            const y = p0[1] - ph * 0.6;
            const sz = 0.003 + r() * 0.004, jx = r() - 0.5, jz = r() - 0.5, sd = r();
            if (y < 0.005 || e < 0.05) continue;
            Engrave.inst(dust, [p0[0] + jx * 0.06, y, p0[2] + jz * 0.06], 5, [sz, sz, sz], sd, [0, 0, 0, 1], 0, 0.75);
        }
        const draws = [
            { mesh: 'box', inst: new Float32Array(box), box: true },
            { mesh: 'pyramid', inst: new Float32Array(tops) },
            { mesh: 'box', inst: new Float32Array(core), box: true },
            { mesh: 'cylinder', inst: new Float32Array(cyl), tan: 'y' },
            { mesh: 'box', inst: new Float32Array(blue), box: true, cast: false },
            { mesh: 'ring', inst: new Float32Array(rings) },
            { mesh: 'box', inst: new Float32Array(dust), box: true, cast: false },
        ];
        const lights = [[0.55, 0.3, 0.55, 0, 0.9 * e], [-0.4, 0.3, 0.55, 0, 0.6 * e], [0.55, 0.35, -0.4, 0, 0.6 * e], [0, 0.75, 0, 0, 0.5 * e]];
        return { draws, lights, stones: ST.length };
    }
    return { build, B, HP };
})();
