// PIR-05 (script 24–31 s): «Gravity has architecture». The structure made in the gallery comes
// up through a ring in the floor of a tall square shaft lit from its open top, and rises along
// the axis. Around it, walkways in different orientations, each with its own «down»: a ledge
// (down −y), a slab laid flat on a wall (down +z), a bridge with things resting on its
// underside (down +y), a slope at 45°; dust and small blocks rest on each one by its own down.
// At 27 s a ring turns 90° and the structure's path curves smoothly from rising to running
// towards a tunnel in the far wall; the camera follows and rolls up to 90° about its line of
// sight, the blue channel on the far wall its reference line. A big block drifts across behind
// the structure. A console with seven radial sockets is set in the right wall.
// Units: the shaft is 3.6 wide, 7 high; y up, the tunnel on the −z wall at y 3.65.
const Shaft = (() => {
    const E = (u, a, b) => Ease.inOut(Ease.seg(u, a, b));
    const HW = 1.8, TOP = 7, TY = 3.65, TUN = 0.32;
    const L = 0.12, GR = 0.0034, PER = 13;
    const r3 = L / Math.sqrt(3);
    const V = [[r3, 0, 0], [-r3 / 2, 0, (r3 * Math.sqrt(3)) / 2], [-r3 / 2, 0, (-r3 * Math.sqrt(3)) / 2], [0, L * Math.sqrt(2 / 3), 0]];
    const C = [0, L * Math.sqrt(2 / 3) / 4, 0];
    const EDGES = [[0, 1], [1, 2], [2, 0], [0, 3], [1, 3], [2, 3]];
    const FACE = [[0, 1], [1, 3], [3, 0]];
    const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
    const add = (a, b) => a.map((v, i) => v + b[i]);
    const sub = (a, b) => a.map((v, i) => v - b[i]);
    const mul = (a, k) => a.map((v) => v * k);
    const norm = (a) => mul(a, 1 / Math.hypot(...a));
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const qrot = (q, v) => {
        const [x, y, z, w] = q, c1 = [y * v[2] - z * v[1] + w * v[0], z * v[0] - x * v[2] + w * v[1], x * v[1] - y * v[0] + w * v[2]];
        return [v[0] + 2 * (y * c1[2] - z * c1[1]), v[1] + 2 * (z * c1[0] - x * c1[2]), v[2] + 2 * (x * c1[1] - y * c1[0])];
    };
    const qTo = (d) => {
        const n = norm(d), c = n[1], ax = [n[2], 0, -n[0]], s = Math.hypot(ax[0], ax[2]);
        if (s < 1e-6) return c > 0 ? [0, 0, 0, 1] : [1, 0, 0, 0];
        return Engrave.quat(ax, Math.atan2(s, c));
    };
    // the structure's path: rise on the axis, then a smooth curve (constant speed through the
    // bend, no jump) into the tunnel. A cubic joins the straight rise to the straight run.
    const P0 = [0, 0.35, 0], P1 = [0, 2.7, 0], P2 = [0, TY, -0.9], P3 = [0, TY, -HW - 1.2];
    function bez(a, b, c, d, k) { const m = 1 - k; return a.map((_, i) => m * m * m * a[i] + 3 * m * m * k * b[i] + 3 * m * k * k * c[i] + k * k * k * d[i]); }
    function along(u) {
        // 24.0–26.6 rise, 26.6–27.8 the bend, 27.8–31 the run into the tunnel
        if (u < 26.6) return lerp3(P0, P1, Ease.out(Ease.seg(u, 24, 26.6)) * 0.85 + Ease.seg(u, 24, 26.6) * 0.15);
        if (u < 27.8) return bez(P1, [0, 3.35, 0], [0, TY, -0.35], P2, Ease.seg(u, 26.6, 27.8));
        return lerp3(P2, P3, Ease.inOut(Ease.seg(u, 27.8, 31.2)) * 0.9 + Ease.seg(u, 27.8, 31.2) * 0.1);
    }
    // the structure: tetrahedron of grains, marked face lit, turning slowly
    function structure(c, u, dust, blue) {
        const q = Engrave.quat([0, 1, 0], u * 0.6);
        const r = Motion.rng('shaft-structure');
        EDGES.forEach(([a, b]) => {
            for (let k = 0; k < PER; k++) {
                const off = qrot(q, sub(lerp3(V[a], V[b], (k + 0.5) / PER), C));
                const tremble = 0.0012 * Math.sin(u * 13 + r() * 20);
                Engrave.inst(dust, [c[0] + off[0], c[1] + off[1] + tremble, c[2] + off[2]], 5, [GR, GR, GR], r(), [0, 0, 0, 1], 0, 0.75);
            }
        });
        for (const [a, b] of FACE) {
            const pa = add(qrot(q, sub(V[a], C)), c), pb = add(qrot(q, sub(V[b], C)), c), d = sub(pb, pa);
            Engrave.inst(blue, lerp3(pa, pb, 0.5), 4, [0.0022, Math.hypot(...d) / 2, 0.0022], 0.5, qTo(d), 0.8);
        }
    }
    // a walkway: a slab whose top faces n (its own «up»), with blocks and dust resting on it
    function walkway(stone, small, dust, centre, n, half, seed) {
        const q = qTo(n);
        Engrave.inst(stone, centre, 1, half, 0.3 + seed * 0.1, q);
        const r = Motion.rng('walk-' + seed), t1 = norm(qrot(q, [1, 0, 0])), t2 = norm(qrot(q, [0, 0, 1]));
        for (let i = 0; i < 9; i++) {
            const s = 0.035 + r() * 0.07, a = (r() - 0.5) * 1.7 * half[0], b = (r() - 0.5) * 1.7 * half[2];
            const p = add(add(add(centre, mul(n, half[1] + s)), mul(t1, a)), mul(t2, b));
            Engrave.inst(small, p, i % 3 ? 0 : 1, [s * (0.8 + r() * 0.8), s, s * (0.8 + r() * 0.6)], r(), Engrave.qmul(q, Engrave.quat([0, 1, 0], r() * 3)));
        }
        for (let i = 0; i < 160; i++) {
            const a = (r() - 0.5) * 1.9 * half[0], b = (r() - 0.5) * 1.9 * half[2], sz = 0.003 + r() * 0.004;
            Engrave.inst(dust, add(add(add(centre, mul(n, half[1] + sz)), mul(t1, a)), mul(t2, b)), 5, [sz, sz, sz], r(), [0, 0, 0, 1], 0, 0.75);
        }
    }
    function build(u) {
        const stone = [], worn = [], small = [], obs = [], blue = [], dust = [], rings = [], gold = [], cyl = [], motes = [];
        // the shaft: floor, three solid walls, the far wall (−z) with the tunnel mouth
        Engrave.inst(worn, [0, -0.1, 0], 1, [HW + 0.2, 0.1, HW + 0.2], 0.21);
        Engrave.inst(stone, [-HW - 0.1, TOP / 2, 0], 0, [0.1, TOP / 2, HW + 0.2], 0.41);
        Engrave.inst(stone, [HW + 0.1, TOP / 2, 0], 0, [0.1, TOP / 2, HW + 0.2], 0.52);
        Engrave.inst(stone, [0, TOP / 2, HW + 0.1], 0, [HW, TOP / 2, 0.1], 0.63);
        const zf = -HW - 0.1;
        Engrave.inst(stone, [0, (TY - TUN) / 2, zf], 0, [HW, (TY - TUN) / 2, 0.1], 0.74);
        Engrave.inst(stone, [0, (TOP + TY + TUN) / 2, zf], 0, [HW, (TOP - TY - TUN) / 2, 0.1], 0.35);
        Engrave.inst(stone, [-(HW + TUN) / 2, TY, zf], 0, [(HW - TUN) / 2, TUN, 0.1], 0.46);
        Engrave.inst(stone, [(HW + TUN) / 2, TY, zf], 0, [(HW - TUN) / 2, TUN, 0.1], 0.57);
        // the tunnel beyond, and a faint blue triangle at its end (the next room)
        Engrave.inst(stone, [0, TY - TUN - 0.05, zf - 1.5], 1, [TUN + 0.1, 0.05, 1.5], 0.68);
        Engrave.inst(stone, [0, TY + TUN + 0.05, zf - 1.5], 0, [TUN + 0.1, 0.05, 1.5], 0.79);
        for (const sx of [-1, 1]) Engrave.inst(stone, [sx * (TUN + 0.05), TY, zf - 1.5], 0, [0.05, TUN, 1.5], 0.3 + sx * 0.1);
        Engrave.inst(obs, [0, TY, zf - 2.95], 2, [TUN, TUN, 0.05], 0.4);
        const tri = [[0, 0.22], [-0.2, -0.13], [0.2, -0.13]];
        for (let i = 0; i < 3; i++) {
            const a = tri[i], b = tri[(i + 1) % 3], d = [b[0] - a[0], b[1] - a[1], 0];
            Engrave.inst(blue, [(a[0] + b[0]) / 2, TY + (a[1] + b[1]) / 2, zf - 2.89], 4, [0.006, Math.hypot(d[0], d[1]) / 2, 0.006], 0.5, Engrave.quat([0, 0, 1], Math.atan2(-d[0], d[1])), 0.4);
        }
        // the blue channel: up the far wall from the floor ring to under the tunnel, the axis
        // the camera keeps as its reference while the world turns
        Engrave.inst(obs, [0, (TY - TUN) / 2, zf + 0.105], 2, [0.018, (TY - TUN) / 2, 0.006], 0.3);
        const pulse = (u * 0.8) % 1;
        Engrave.inst(blue, [0, (TY - TUN) / 2, zf + 0.112], 4, [0.008, (TY - TUN) / 2, 0.003], 0.5, [0, 0, 0, 1], 0.5);
        Engrave.inst(blue, [0, 0.1 + pulse * (TY - TUN - 0.2), zf + 0.115], 4, [0.012, 0.08, 0.004], 0.6, [0, 0, 0, 1], 0.9);
        Engrave.inst(obs, [0, 0.005, -HW / 2], 2, [0.018, 0.006, HW / 2], 0.3);
        Engrave.inst(blue, [0, 0.012, -HW / 2], 4, [0.008, 0.003, HW / 2], 0.5, [0, 0, 0, 1], 0.5);
        // the floor ring the structure comes up through
        Engrave.inst(rings, [0, 0.03, 0], 3, [0.36, 0.36, 0.36], 0.4, [0, 0, 0, 1]);
        // walkways in four orientations
        // (grouped round the far wall, where the camera looks all through the shot)
        // (each walkway is carried: built into the walls and set on stepped corbels or struts,
        // never a slab floating in the air)
        walkway(stone, small, dust, [-1.25, 2.1, -HW + 0.45], [0, 1, 0], [0.55, 0.05, 0.45], 1);           // ledge (down −y), into two walls
        for (const cx of [-1.45, -0.85]) for (let i = 0; i < 3; i++) {
            const d = 0.36 - i * 0.12, h = 0.06;
            Engrave.inst(stone, [cx, 2.05 - h * (i + 0.5) * 2, -HW + d / 2], 0, [0.07, h, d / 2], 0.2 + i * 0.1);
        }
        walkway(stone, small, dust, [0.95, 2.6, -HW + 0.05], [0, 0, 1], [0.45, 0.05, 0.4], 2);             // flat on the far wall (down −z)
        walkway(stone, small, dust, [0, 4.55, -HW + 0.5], [0, -1, 0], [HW, 0.06, 0.28], 3);                // bridge, things on its underside (down +y)
        for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) {                                            // its ends on corbels
            const d = 0.34 - i * 0.11, h = 0.06;
            Engrave.inst(stone, [sx * (HW - d / 2), 4.49 - h * (i + 0.5) * 2, -HW + 0.5], 0, [d / 2, h, 0.26], 0.4 + i * 0.1);
        }
        walkway(stone, small, dust, [-HW + 0.38, 3.4, -0.9], norm([1, 1, 0]), [0.42, 0.05, 0.5], 4);      // slope (down at 45°), its high end in the wall
        for (const sz of [-1.3, -0.5]) {                                                                   // two struts from the wall to its low end
            const A = [-HW, 2.72, sz], B = [-1.18, 3.08, sz], d = sub(B, A), len = Math.hypot(...d);
            Engrave.inst(stone, lerp3(A, B, 0.5), 0, [0.05, len / 2, 0.05], 0.7, Engrave.quat([0, 0, 1], Math.atan2(-d[0], d[1])));
        }
        walkway(stone, small, dust, [HW - 0.05, 3.3, -0.8], [-1, 0, 0], [0.45, 0.05, 0.5], 5);             // on the right wall (down +x)
        // the console: an obsidian disc in the right wall, seven radial sockets
        const qc = Engrave.quat([0, 0, 1], Math.PI / 2);
        Engrave.inst(cyl, [HW - 0.02, 1.9, 0.9], 2, [0.34, 0.03, 0.34], 0.5, qc);
        for (let i = 0; i < 7; i++) {
            const a = (i / 7) * Math.PI * 2 + 0.3, r = 0.2;
            const p = [HW - 0.055, 1.9 + Math.sin(a) * r, 0.9 + Math.cos(a) * r];
            Engrave.inst(gold, p, 3, [0.006, 0.075, 0.022], 0.3 + i * 0.1, Engrave.quat([1, 0, 0], -a));
            Engrave.inst(blue, [HW - 0.058, 1.9 + Math.sin(a) * (r - 0.04), 0.9 + Math.cos(a) * (r - 0.04)], 4, [0.004, 0.012, 0.012], 0.5, Engrave.quat([1, 0, 0], -a), 0.25 + 0.4 * E(u, 26.3, 26.9) * (1 - E(u, 27.6, 28.4)));
        }
        Engrave.inst(gold, [HW - 0.05, 1.9, 0.9], 3, [0.012, 0.05, 0.05], 0.8);
        // the ring that turns: it stands where the path bends, first flat (the structure would
        // go on up through it), then from 26.5 to 27.5 turns 90° to face the tunnel
        const turn = E(u, 26.5, 27.5);
        Engrave.inst(rings, [0, 3.38, -0.18], 3, [0.3, 0.3, 0.3], 0.6, Engrave.quat([1, 0, 0], (turn * Math.PI) / 2));
        // the big block drifting across behind the structure (depth)
        const kb = Ease.seg(u, 26.9, 30.2);
        if (kb > 0 && kb < 1) Engrave.inst(stone, [1.9 - kb * 3.8, 4.3 + 0.2 * kb, -1.25], 0, [0.35, 0.26, 0.3], 0.66, Engrave.quat([0.2, 1, 0.1], kb * 0.8));
        // the structure
        const c = along(u);
        structure(c, u, dust, blue);
        // light falling down the shaft: motes drifting in it
        const rm = Motion.rng('shaft-motes');
        for (let i = 0; i < 700; i++) {
            const x = (rm() - 0.5) * 2.6, z = (rm() - 0.5) * 2.6, y = (rm() * TOP + u * 0.05 * (0.5 + rm())) % TOP, sz = 0.0012 + rm() * 0.002;
            Engrave.inst(motes, [x, y, z], 5, [sz, sz, sz], rm(), [0, 0, 0, 1], 0, -1);
        }
        const draws = [
            { mesh: 'box', inst: new Float32Array(stone), box: true, masonry: true },
            { mesh: 'box', inst: new Float32Array(worn), box: true, masonry: true },
            { mesh: 'rock', inst: new Float32Array(small) },
            { mesh: 'box', inst: new Float32Array(obs), box: true },
            { mesh: 'box', inst: new Float32Array(gold), box: true },
            { mesh: 'cylinder', inst: new Float32Array(cyl), tan: 'y' },
            { mesh: 'box', inst: new Float32Array(blue), box: true, cast: false },
            { mesh: 'ring', inst: new Float32Array(rings) },
            { mesh: 'sphere', inst: new Float32Array(dust), cast: false },
            { mesh: 'sphere', inst: new Float32Array(motes), cast: false },
        ];
        const lights = [[c[0], c[1] + 0.03, c[2], 0, 0.3], [0, 1.2, zf + 0.3, 0, 0.25], [HW - 0.2, 1.9, 0.9, 0, 0.2], [0, TY, zf - 2.7, 0, 0.3]];
        return { draws, lights, centre: c };
    }
    // the camera follows the structure; up rolls about the line of sight up to 90°
    function camera(u) {
        const c = along(u);
        // before the bend: beside and below, looking up past it; after: behind, looking along
        // its run to the tunnel
        const k = E(u, 26.3, 28.0);
        const offA = [0.42, -0.2, 0.5], lookA = [0, 0.3, -0.35];
        const offB = [0.08, 0.06, 0.55], lookB = [0, 0, -1];
        const intro = 1 - E(u, 24, 25.2);                    // it comes up from below the lens
        const cam = add(c, add(lerp3(offA, offB, k), [0, -0.35 * intro, 0.25 * intro]));
        const target = add(c, lerp3(lookA, lookB, k));
        const f = norm(sub(target, cam));
        const roll = (Math.PI / 2) * E(u, 26.7, 29.6);
        // up: the world's up, made orthogonal to f, turned by roll about f (Rodrigues)
        let up0 = sub([0, 1, 0], mul(f, f[1]));
        up0 = norm(up0);
        const up = add(add(mul(up0, Math.cos(roll)), mul(cross(f, up0), Math.sin(roll))), mul(f, 0));
        return { cam, target, up, fov: 0.8 - 0.1 * k };
    }
    const frameParams = {
        sun: [0.25, 1, 0.3], sunK: 1.5, fill: 0.42, interior: true,
        shadow: { center: [0, 3.5, -0.3], radius: 5.5 },
        sky: { zenith: 0.9, horizon: 0.9, dusk: 0 },
        fog: [9, 30], course: 0.26,
    };
    return { build, camera, frameParams, structure, T0: 24, T1: 31 };
})();
