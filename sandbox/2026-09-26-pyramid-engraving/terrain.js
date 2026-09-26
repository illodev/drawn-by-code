// The ground, after plate 11 of the «Description de l'Égypte»: the pyramid stands on a flat
// plateau; between it and the camera the rock has been cut back in levels (an excavation:
// terraces with broken, crumbling edges stepping down to a sandy floor), and beyond, soft
// dunes. One heightfield, dense near the pyramid and coarse far off, split in two meshes by
// slope: steep faces are rock (drawn as stone), gentle ones are sand.
const Terrain = (() => {
    const E = (a, b, x) => { const t = Math.min(Math.max((x - a) / (b - a), 0), 1); return t * t * (3 - 2 * t); };
    // value noise, deterministic
    const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
    const vn = (x, y) => {
        const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
        const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
        const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
        return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };
    const ridge = (x, y) => 1 - Math.abs(2 * vn(x, y) - 1);
    const fbm = (x, y) => 0.55 * vn(x, y) + 0.3 * vn(x * 2.1 + 5, y * 2.1) + 0.15 * vn(x * 4.3, y * 4.3 + 9);
    // the excavation, as the plate draws it: not regular terraces but one broken escarpment
    // along the front of the plateau. Its edge wanders; the drop is tall in some stretches and
    // low in others; the face is a sheer spur here and a soft eroded slope there, cut by
    // gullies; a second, partial ledge shows only in some stretches.
        function height(x, z) {
        const r = Math.max(Math.abs(x), Math.abs(z));
        // dunes: long, low swells, bigger far off and to the sides; the plateau stays flat
        // dunes everywhere, the plateau too: long swells with a crest (a steep lee side), sand
        // banked against the pyramid's foot; only its footprint is level
        const far = E(1.2, 9, Math.hypot(x * 0.8, z - 1));
        const sw = fbm(x * 0.35 + 3, z * 0.55), crestD = Math.pow(ridge(x * 0.28 + z * 0.12, z * 0.5 + 2), 3);
        let h = (0.05 + 0.3 * far) * (sw - 0.45) + (0.03 + 0.12 * far) * crestD + 0.012 * (fbm(x * 2.5, z * 2.5) - 0.5);
        h *= E(1.05, 1.5, r);
        h += 0.05 * E(1.5, 1.02, r) * E(0.9, 1.05, r);          // sand banked at the foot
        // the foreground, as in the plate: mounds of rock and spoil from the excavation, their
        // crest line rising and falling (peaks, saddles, a gap), faces broken into facets and
        // gullies that catch the light or turn away from it; they hide part of the plateau
        const band = E(5.0, 3.2, Math.abs(x + 0.4 * Math.sin(z * 0.7)));
        if (band > 0 && z > 2.1 && z < 5.0) {
            const crest = Math.max(0, 0.02 + 0.28 * Math.pow(fbm(x * 0.7 + 4, 1.5), 1.6) + 0.07 * (ridge(x * 1.9, 3) - 0.5) + 0.03 * (vn(x * 5, 1) - 0.5));
            const zc = 3.05 + 0.35 * (fbm(x * 0.6, 7) - 0.5);                     // where the crest runs
            const wBack = 0.35 + 0.3 * fbm(x * 0.9, 9), wFront = 0.5 + 0.5 * fbm(x * 0.7, 2);
            const d = z < zc ? (zc - z) / wBack : (z - zc) / wFront;             // steeper towards the pyramid
            let m = crest * Math.max(0, 1 - d * d) ** 1.2;
            // facets and gullies down the slopes
            m += (0.05 * (ridge(x * 3.2 + z * 0.6, z * 2.2) - 0.55) + 0.02 * (fbm(x * 9, z * 9) - 0.5)) * Math.min(1, m / 0.05);
            // loose stones
            m += 0.015 * Math.max(0, vn(x * 18, z * 18) - 0.72) * 4;
            h = Math.max(h, h + m * band);
        }
        return h;
    }
    // sample positions: dense in [a, b], stretched outside
    function axis(a, b, step, far) {
        const xs = [];
        for (let x = a; x <= b + 1e-9; x += step) xs.push(x);
        let d = step;
        for (let x = a - step; x > -far; x -= (d *= 1.12)) xs.unshift(x);
        d = step;
        for (let x = b + step; x < far; x += (d *= 1.12)) xs.push(x);
        return xs;
    }
    function meshes() {
        const xs = axis(-4.5, 4.5, 0.03, 60), zs = axis(-2.5, 6.5, 0.03, 60);
        const nx = xs.length, nz = zs.length;
        const H = new Float32Array(nx * nz);
        for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) H[j * nx + i] = height(xs[i], zs[j]);
        const P = [];
        for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
            const i0 = Math.max(i - 1, 0), i1 = Math.min(i + 1, nx - 1), j0 = Math.max(j - 1, 0), j1 = Math.min(j + 1, nz - 1);
            const dx = (H[j * nx + i1] - H[j * nx + i0]) / (xs[i1] - xs[i0]), dz = (H[j1 * nx + i] - H[j0 * nx + i]) / (zs[j1] - zs[j0]);
            const l = Math.hypot(dx, 1, dz);
            P.push(xs[i], H[j * nx + i], zs[j], -dx / l, 1 / l, -dz / l);
        }
        const rock = [], sand = [];
        for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) {
            const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
            const ny = Math.min(P[a * 6 + 4], P[b * 6 + 4], P[c * 6 + 4], P[d * 6 + 4]);
            (ny < 0.9 ? rock : sand).push(a, c, b, b, c, d);
        }
        return { rock: { P, I: rock }, sand: { P, I: sand } };
    }
    return { height, meshes };
})();
