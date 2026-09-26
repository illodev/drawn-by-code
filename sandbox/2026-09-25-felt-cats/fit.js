// Pose fitting page (driven by fit.mjs): renders the cats' albedo at low resolution for any
// poses and scores it against a reference frame's class maps (cat / ginger / black), then
// refines the poses by coordinate descent from a starting guess. Nothing is drawn.
Motion.scene({
    fps: 30,
    duration: 15.84,
    logical: [900, 1600],
    uses: ['styles/felt3d/felt3d.js', 'sandbox/2026-09-25-felt-cats/cats.js',
        'sandbox/2026-09-25-felt-cats/keys/segA.js', 'sandbox/2026-09-25-felt-cats/keys/segB.js', 'sandbox/2026-09-25-felt-cats/keys/segC.js',
        { src: 'sandbox/2026-09-25-felt-cats/private/fit-poses.js', optional: true }, 'sandbox/2026-09-25-felt-cats/dance.js'],
    setup(env) {
        const R = Felt3D.renderer(env, { scene: Cats.GLSL, scale: 1.0, params: Cats.PARAMS });
        const W = R.W, H = R.H, N = W * H;
        let key = 0;
        const ctx = R.canvas.getContext('2d', { willReadFrequently: true });
        // class maps of a render: 3 planes (cat, ginger, black), box-blurred
        function classes(poses, zoom) {
            R.layer(key++, { p: Cats.pack(poses), boil: 0, ...Stage.CAM, zoom, shadow: 0, debug: 1 });
            const d = ctx.getImageData(0, 0, W, H).data;
            const m = new Float32Array(3 * N);
            for (let i = 0; i < N; i++) {
                const a = d[i * 4 + 3];
                if (a < 128) continue;
                const r = d[i * 4] * 255 / a, g = d[i * 4 + 1] * 255 / a, b = d[i * 4 + 2] * 255 / a;
                m[i] = 1;
                if (Math.max(r, g, b) < 70) m[2 * N + i] = 1;
                else if (r - b > 35) m[N + i] = 1;
            }
            return blur(m);
        }
        function blur(m) {
            const out = new Float32Array(m.length), tmp = new Float32Array(N), rad = 2;
            for (let c = 0; c < 3; c++) {
                const o = c * N;
                for (let y = 0; y < H; y++) {
                    let s = 0;
                    for (let x = -rad; x <= rad; x++) s += m[o + y * W + Math.min(W - 1, Math.max(0, x))];
                    for (let x = 0; x < W; x++) {
                        tmp[y * W + x] = s / (2 * rad + 1);
                        s += m[o + y * W + Math.min(W - 1, x + rad + 1)] - m[o + y * W + Math.max(0, x - rad)];
                    }
                }
                for (let x = 0; x < W; x++) {
                    let s = 0;
                    for (let y = -rad; y <= rad; y++) s += tmp[Math.min(H - 1, Math.max(0, y)) * W + x];
                    for (let y = 0; y < H; y++) {
                        out[o + y * W + x] = s / (2 * rad + 1);
                        s += tmp[Math.min(H - 1, y + rad + 1) * W + x] - tmp[Math.max(0, y - rad) * W + x];
                    }
                }
            }
            return out;
        }
        const WEIGHT = [1, 1, 1.5];
        function loss(ours, ref) {
            let s = 0;
            for (let c = 0; c < 3; c++) for (let i = 0, o = c * N; i < N; i++) s += WEIGHT[c] * Math.abs(ours[o + i] - ref[o + i]);
            return s / N;
        }
        const STEPS = {
            x: 0.03, z: 0.05, bob: 0.02, yaw: 0.2, pitch: 0.08, roll: 0.06, twist: 0.12, bend: 0.1,
            'head.0': 0.18, 'head.1': 0.14, 'head.2': 0.12,
            'armL.0': 0.3, 'armL.1': 0.3, 'armL.2': 0.35, 'armL.3': 0.25, 'armR.0': 0.3, 'armR.1': 0.3, 'armR.2': 0.35, 'armR.3': 0.25,
            'legL.0': 0.25, 'legL.1': 0.1, 'legR.0': 0.25, 'legR.1': 0.1, 'tail.0': 0.4, 'tail.1': 0.25, 'tail.2': 0.25,
        };
        const get = (p, f) => { const [a, i] = f.split('.'); return i === undefined ? p[a] : p[a][+i]; };
        const set = (p, f, v) => { const [a, i] = f.split('.'); if (i === undefined) p[a] = v; else p[a][+i] = v; };
        const clone = (p) => JSON.parse(JSON.stringify(p));
        // refine poses against one reference frame. prior: poses to stay near (smoothness and
        // the unobservable fields); lam: its weight per unit step
        function fit(refArr, start, prior, zoom, o = {}) {
            const ref = blur(new Float32Array(refArr));
            const lam = o.lam ?? 0.004, rounds = o.rounds ?? 3, fields = o.fields ?? Object.keys(STEPS);
            const cats = o.cats ?? [0, 1, 2];
            let P = start.map((p) => ({ ...clone(Cats.REST), ...clone(p) }));
            const Q = prior.map((p) => ({ ...clone(Cats.REST), ...clone(p) }));
            const reg = (P) => {
                let s = 0;
                for (const c of cats) for (const f of fields) { const d = (get(P[c], f) - get(Q[c], f)) / STEPS[f]; s += d * d; }
                return lam * s;
            };
            let best = loss(classes(P, zoom), ref), bestR = best + reg(P);
            const first = best;
            let evals = 1;
            for (let r = 0; r < rounds; r++) {
                const k = Math.pow(0.5, r);
                for (const c of cats) for (const f of fields) {
                    for (const sgn of [1, -1]) {
                        const T = P.map(clone);
                        set(T[c], f, get(T[c], f) + sgn * STEPS[f] * k);
                        const l = loss(classes(T, zoom), ref); evals++;
                        const lr = l + reg(T);
                        if (lr < bestR) { P = T; best = l; bestR = lr; break; }
                    }
                }
            }
            return { poses: P, loss: best, first, evals };
        }
        globalThis.FitAPI = { raw: (poses, zoom) => { R.layer(key++, { p: Cats.pack(poses), boil: 0, ...Stage.CAM, zoom, shadow: 0, debug: 1 }); return Array.from(ctx.getImageData(0, 0, 4, 1).data); }, W, H, fit, score: (refArr, poses, zoom) => loss(classes(poses, zoom), blur(new Float32Array(refArr))), classes: (p, z) => Array.from(classes(p, z)) };
        return { R };
    },
    draw() {},
});
