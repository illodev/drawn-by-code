// One frame of the film, shared by the full-bleed scene and the plate variant (the image
// inside a printed plate: margins, neat line, running heads and a caption in the plate's
// capitals). The plate is for the opening and closing frames; the film itself is full bleed.
//
// The camera (PIR-02, PIR-03): a macro on the first stone's mark, backing off just enough
// for the opening to gain room; looking down the slot at the rings lining up; then a rising
// retreat to the whole opened building, held; at 16 s it leans to the V gap of the near
// corner and starts in. Keys are relative to the first stone's face until 10 s.
const PyramidFilm = (() => {
    // Hermite through keys with monotone tangents (Fritsch–Butland, per coordinate): the
    // camera never stops at a key where it keeps going the same way, and never overshoots a
    // key to come back to it (central-difference tangents did: «la cámara hace un zigzag raro»)
    function path(keys, t) {
        if (t <= keys[0][0]) return keys[0].slice(1);
        const n = keys.length;
        if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
        let i = 0;
        while (keys[i + 1][0] < t) i++;
        const [t0] = keys[i], [t1] = keys[i + 1], h = t1 - t0, u = (t - t0) / h;
        const tan = (j) => {
            if (j === 0 || j === n - 1) return keys[j].slice(1).map((v) => v.map(() => 0));
            const h0 = keys[j][0] - keys[j - 1][0], h1 = keys[j + 1][0] - keys[j][0];
            return keys[j].slice(1).map((v, a) => v.map((p, c) => {
                const d0 = (p - keys[j - 1][a + 1][c]) / h0, d1 = (keys[j + 1][a + 1][c] - p) / h1;
                if (d0 * d1 <= 0) return 0;
                return (3 * (h0 + h1)) / ((2 * h1 + h0) / d0 + (h1 + 2 * h0) / d1);
            }));
        };
        const m0 = tan(i), m1 = tan(i + 1);
        const h00 = 2 * u ** 3 - 3 * u * u + 1, h10 = u ** 3 - 2 * u * u + u, h01 = -2 * u ** 3 + 3 * u * u, h11 = u ** 3 - u * u;
        return keys[i].slice(1).map((v, a) => v.map((p0, c) => h00 * p0 + h10 * h * m0[a][c] + h01 * keys[i + 1][a + 1][c] + h11 * h * m1[a][c]));
    }
    let KEYS = null;
    function keys() {
        const s = Pyramid.S0(), x0 = s.c[0], y0 = s.c[1], f0 = s.c[2] + s.half[2];
        const rel = (dx, dy, dz) => [x0 + dx, y0 + dy, f0 + dz];
        // [t, cam, target, [fov]]
        return [
            // PIR-01: low, from the left of the face, the pyramid right of centre with air above
            // the apex and the foreground stone in the lower left; a diagonal travelling in
            // that ends following the grain to the joint
            // (held until the plate has let go, then off from rest: no jump at 2.9 s)
            [PLATE_OUT * 0.3, [-1.55, 0.32, 5.6], [-0.95, 0.5, 0], [0.66]],
            [2.5, [-0.9, 0.3, 4.1], [0.0, 0.45, 0.2], [0.62]],
            [4.0, rel(-0.18, 0.06, 0.75), rel(-0.03, 0.03, 0), [0.58]],
            [5.0, rel(0.045, 0.022, 0.19), rel(0, 0, 0), [0.55]],
            [6.5, rel(0.04, 0.03, 0.24), rel(0, 0.002, 0), [0.55]],
            [8.5, rel(0.01, 0.075, 0.4), rel(-0.01, 0.07, -0.2), [0.58]],
            [10.0, rel(0.0, 0.2, 1.0), rel(0, 0.06, -0.6), [0.62]],
            [12.0, [1.7, 1.35, 3.1], [0, 0.72, 0], [0.7]],
            [13.5, [3.4, 1.9, 4.3], [0, 0.85, 0], [0.72]],
            [15.5, [3.6, 1.95, 4.1], [0, 0.85, 0], [0.72]],
            // the lean into the V gap, lined up on the gate (junctions.js), and through it
            ...(() => {
                const G = Junctions.GATE, before = G.c.map((v, i) => v - G.d[i] * 0.9);
                return [[16.5, before, G.c.map((v, i) => v + G.d[i] * 0.6), [0.74]], [17.3, G.c, G.c.map((v, i) => v + G.d[i] * 1.5), [0.76]]];
            })(),
        ];
    }
    // The printed plate: the film opens on it (the closed pyramid, as a plate of the
    // «Description de l'Égypte»), holds, then the camera goes into the engraving: the plate
    // grows about the centre until its image area fills the frame and the margins, rules and
    // lettering pass out of shot; the travelling starts as the plate lets go.
    const PLATE = [0.075, 0.12, 0.925, 0.88];
    const PLATE_FILL = 1 / (PLATE[3] - PLATE[1]);            // scale at which the image fills
    function plateScale(t, o) {
        if (o.plate) return 1;
        const u = storyTime(t);
        // the end: the engraving draws back into its plate (story 59.0–60.4)
        if (u > 58.9) return PLATE_FILL - (PLATE_FILL - 1) * Ease.inOut(Ease.seg(u, 59.0, 60.4));
        return 1 + (PLATE_FILL - 1) * Ease.inOut(Ease.seg(t, 1.3, 2.9));
    }
    function drawPlate(g, env, s, caption) {
        const W = env.W, H = env.H;
        g.save();
        g.translate(W / 2, H / 2);
        g.scale(s, s);
        g.translate(-W / 2, -H / 2);
        const x0 = PLATE[0] * W, y0 = PLATE[1] * H, x1 = PLATE[2] * W, y1 = PLATE[3] * H;
        g.strokeStyle = 'rgba(42, 37, 32, 0.9)';
        g.fillStyle = 'rgba(42, 37, 32, 0.9)';
        g.lineWidth = 1.6;
        g.strokeRect(x0, y0, x1 - x0, y1 - y0);
        g.lineWidth = 0.6;
        g.strokeRect(x0 - 7, y0 - 7, x1 - x0 + 14, y1 - y0 + 14);
        g.textBaseline = 'alphabetic';
        g.font = '28px Fell';
        g.textAlign = 'left';
        g.fillText('A. Vol. VII.', x0, y0 - 24);
        g.textAlign = 'right';
        g.fillText('Pl. 3.', x1, y0 - 24);
        g.textAlign = 'center';
        g.font = '44px Fell';
        g.save();
        g.translate(W / 2, y0 - 22);
        g.scale(1.25, 1);
        g.fillText('PYRAMIDE DES CIEUX.', 0, 0);
        g.restore();
        g.font = '15px Fell';
        g.textAlign = 'left';
        g.fillText('Code del.', x0, y1 + 22);
        g.textAlign = 'right';
        g.fillText('illodev x Claude sculp.', x1, y1 + 22);
        g.textAlign = 'center';
        g.font = '24px Fell';
        g.fillText(caption, W / 2, y1 + 52);
        g.restore();
    }
    const PLATE_OUT = 2.9, LAG = 1.6;
    // story time: slow while the plate holds, then a Hermite that speeds up to the script's
    // rate (no kink in the camera's speed at 2.9 or 6.6 s)
    function storyTime(t) {
        if (t < PLATE_OUT) return t * 0.3;
        const u0 = PLATE_OUT * 0.3, t1 = 5 + LAG, T = t1 - PLATE_OUT;
        if (t < t1) {
            const k = (t - PLATE_OUT) / T;
            return (2 * k ** 3 - 3 * k * k + 1) * u0 + (k ** 3 - 2 * k * k + k) * T * 0.3 + (-2 * k ** 3 + 3 * k * k) * 5 + (k ** 3 - k * k) * T * 1;
        }
        return t - LAG;
    }
    // ---- the spaces: each room in its own coordinates, with its own light and camera ----
    const OUT = (u) => ({
        sun: [-0.75, 0.38, 0.55], sunK: 0.85, fill: 0.2,
        // (dusk deepens to the end, so the new star reads on it)
        sky: { zenith: 0.22 + 0.5 * Ease.inOut(Ease.seg(u, 53, 58.5)), horizon: 0.15 + 0.12 * Ease.inOut(Ease.seg(u, 53, 58.5)), dusk: 0.35 },
        fog: [5, 22], course: 0.0118, grain: 1,
    });
    const inside = (p) => ({ ...p, grain: 0.45 });       // indoors the paper's tooth is finer
    const SPACES = {
        out: {
            // (the climb from the moment the seed leaves its sky: the bridge into the pyramid
            // reads this space's camera from 51.4 on)
            build: (u) => (u >= Star.T0 ? Star.build(u) : u >= Seed.OUT ? Apex.build(u) : Pyramid.build(u, { ring: Junctions.pyramidRing(u) })),
            params: OUT,
            cam: (u) => {
                const c = pathCam(u >= Star.T0 ? Star.KEYS : u >= Seed.OUT ? Apex.KEYS : KEYS, u);
                // (climbing the axis the camera looks straight up: its up leans back towards the
                // shaft's far side, as it came in, so the view never flips)
                if (u >= Seed.OUT && u < Star.T0) {
                    const k = 1 - Ease.inOut(Ease.seg(u, 53.4, 54.8)), up = [0.6 * 0.9 * k, 1, 0.8 * 0.9 * k], l = Math.hypot(...up);
                    c.up = up.map((v) => v / l);
                }
                return c;
            },
        },
        gal: { build: (u) => Gallery.build(u), params: () => inside(Gallery.frameParams), cam: (u) => pathCam(Gallery.KEYS, u) },
        shaft: { build: (u) => Shaft.build(u), params: () => inside(Shaft.frameParams), cam: (u) => Shaft.camera(u) },
        reso: {
            build: (u) => Resonance.build(u),
            params: (u, c) => ({ ...inside(Resonance.frameParams), shadow: { center: [c.cam[0], 2, c.cam[2] - 3], radius: 9 } }),
            cam: (u) => Resonance.camera(u),
        },
        nurse: {
            build: (u) => (u < Seed.T0 ? Nursery.build(u) : Seed.outside(u)),
            params: () => inside(Nursery.frameParams),
            cam: (u) => Seed.outCamera(u),
        },
        seed: { build: (u) => Seed.inside(u), params: () => inside(Seed.skyParams), cam: (u) => Seed.inCamera(u) },
    };
    function pathCam(keys, u) {
        const [cam, target, [fov]] = path(keys, u);
        return { cam, target, up: [0, 1, 0], fov };
    }
    // one space's layer, with the spaces seen through its open portals laid under it (up to
    // two portals deep); returns a canvas at the renderer's size
    const COMP = [], MASK = [];
    // (via: the junction this space is seen through, which it must not open again backwards)
    function view(env, space, u, c, clip, depth, key, lens, via = null) {
        const R = env.state.R, S = SPACES[space];
        const P = S.build(u);
        const draws = P.draws.slice();
        const comp = (COMP[depth] = COMP[depth] ?? Object.assign(document.createElement('canvas'), { width: R.W, height: R.H }));
        const cg = comp.getContext('2d');
        cg.clearRect(0, 0, R.W, R.H);
        const open = depth < 2 ? Junctions.from(space, u).filter((po) => po.J !== via && Junctions.inView(po, c)) : [];
        const holes = open.map((po) => Junctions.hole(po));
        draws.push(...holes);
        const dist = Math.hypot(c.cam[0] - c.target[0], c.cam[1] - c.target[1], c.cam[2] - c.target[2]);
        const f = {
            cam: c.cam, target: c.target, up: c.up, fov: lens.fov(c.fov), near: 0.01 * (c.near ?? 1),
            ink: '#2e261d', paper: '#ebe1cb', draws, lights: P.lights,
            shadow: { center: c.target, radius: Math.min(6, Math.max(1.5, dist * 1.1)) },
            spacing: 2.0, edge: 0.25, frame: lens.rect, charcoal: true, sheet: lens.sheet, contour: 1, hatch: 1,
            ...S.params(u, c),
        };
        if (clip) f.clip = clip;
        // the spaces seen through its openings go under it; with more than one, each is cut to
        // its own opening (R.mask), or the last would show through every hole
        open.forEach((po, i) => {
            const cc = { cam: po.P.p(c.cam), target: po.P.p(c.target), up: po.P.d(c.up ?? [0, 1, 0]), fov: c.fov };
            const far = view(env, po.to, u, cc, po.clip, depth + 1, key + po.id, lens, po.J);
            if (open.length === 1) { cg.drawImage(far, 0, 0); return; }
            const tmp = (MASK[depth] = MASK[depth] ?? Object.assign(document.createElement('canvas'), { width: R.W, height: R.H })).getContext('2d');
            tmp.globalCompositeOperation = 'source-over';
            tmp.clearRect(0, 0, R.W, R.H);
            tmp.drawImage(far, 0, 0);
            tmp.globalCompositeOperation = 'destination-in';
            tmp.drawImage(R.mask(f, holes[i], holes.filter((_, j) => j !== i)), 0, 0);
            tmp.globalCompositeOperation = 'source-over';
            cg.drawImage(tmp.canvas, 0, 0);
        });
        cg.drawImage(R.layer(key + ':' + space, f), 0, 0);
        return comp;
    }
    function frame(g, t, env, o = {}) {
        KEYS = KEYS ?? keys();
        // story time: the plate holds and goes in (0–2.9 s) with the camera still, the dust
        // desert still; once the plate has gone the travelling runs (2.9–6.6 s); from
        // there the film runs 1.6 s behind the script's timings
        const u = storyTime(t);
        const w = Junctions.where(u, (sp, uu) => SPACES[sp].cam(uu));
        const s = plateScale(t, o);
        const on = s < PLATE_FILL - 1e-4;
        // the image area, scaled about the centre; the lens is widened so that area shows the
        // full-bleed composition (at full scale it is exactly the film's lens)
        const rect = on ? PLATE.map((v) => 0.5 + (v - 0.5) * s) : [0, 0, 1, 1];
        const lens = { rect, sheet: s, fov: (f0) => (on ? 2 * Math.atan(Math.tan(f0 / 2) / ((PLATE[3] - PLATE[1]) * s)) : f0) };
        const img = view(env, w.space, u, w, null, 0, (on ? 'p' : 'f') + Math.round(t * 24), lens);
        // the plates' colour (o.age === false shows the clean render, to compare)
        if (o.age === false) g.drawImage(img, 0, 0, env.W, env.H);
        else env.state.A.apply(g, img, { ink: '#2e261d', paper: '#ebe1cb' });
        if (on) {
            drawPlate(g, env, s, u > 50 ? "VUE DE LA GRANDE PYRAMIDE ET DE L'ÉTOILE NOUVELLE, PRISE AU CRÉPUSCULE." : 'VUE DE LA GRANDE PYRAMIDE, PRISE AU CRÉPUSCULE.');
        }
    }
    function setup(env) {
        const R = Engrave.renderer(env, { scale: 2 });
        R.mesh('ring', Engrave.torus(0.085));
        R.mesh('thin-ring', Engrave.torus(0.03));
        const T = Terrain.meshes();
        R.mesh('terrain-rock', T.rock);
        R.mesh('terrain-sand', T.sand);
        R.mesh('rock', Engrave.rock(7));
        // a flared column capital (open papyrus): a lathe profile, radius by height
        const cap = { P: [], I: [] }, NS = 40, NR = 12;
        for (let j = 0; j <= NR; j++) {
            const y = j / NR, r = 0.62 + 0.38 * Math.pow(y, 0.7), yy = y * 2 - 1;
            for (let i = 0; i <= NS; i++) {
                const a = (i / NS) * Math.PI * 2, c = Math.cos(a), s2 = Math.sin(a);
                const n = [c, -0.35 * 0.38, s2], l = Math.hypot(...n);
                cap.P.push(c * r, yy, s2 * r, n[0] / l, n[1] / l, n[2] / l);
            }
        }
        for (let j = 0; j < NR; j++) for (let i = 0; i < NS; i++) { const a = j * (NS + 1) + i, b = a + NS + 1; cap.I.push(a, b, a + 1, a + 1, b, b + 1); }
        R.mesh('capital', cap);
        // a jar: a lathe profile (foot, belly, shoulder, neck, lip)
        const vase = { P: [], I: [] }, VR = 16;
        const prof = (y) => { const t = (y + 1) / 2; return t < 0.08 ? 0.35 : t < 0.7 ? 0.35 + 0.65 * Math.sin(((t - 0.08) / 0.62) * Math.PI * 0.9) : t < 0.88 ? 0.55 - (t - 0.7) * 1.8 : 0.28 + (t > 0.95 ? 0.08 : 0); };
        for (let j = 0; j <= VR; j++) {
            const yy = (j / VR) * 2 - 1, rr = prof(yy);
            for (let i = 0; i <= NS; i++) { const a = (i / NS) * Math.PI * 2; vase.P.push(Math.cos(a) * rr, yy, Math.sin(a) * rr, Math.cos(a), 0, Math.sin(a)); }
        }
        for (let j = 0; j < VR; j++) for (let i = 0; i < NS; i++) { const a = j * (NS + 1) + i, b = a + NS + 1; vase.I.push(a, b, a + 1, a + 1, b, b + 1); }
        R.mesh('vase', vase);
        return { R, A: Engrave.ager(env) };
    }
    // where the camera is at story time u (for tools/geo.mjs)
    const where = (u) => { KEYS = KEYS ?? keys(); return Junctions.where(u, (sp, uu) => SPACES[sp].cam(uu)); };
    const bridges = () => { KEYS = KEYS ?? keys(); return Junctions.stats((sp, uu) => SPACES[sp].cam(uu)); };
    return { frame, setup, storyTime, where, bridges, LAG };
})();
