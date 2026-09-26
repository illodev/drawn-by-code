// One frame of the film, shared by the full-bleed scene and the plate variant (the image
// inside a printed plate: margins, neat line, running heads and a caption in the plate's
// capitals). The plate is for the opening and closing frames; the film itself is full bleed.
//
// The camera (PIR-02, PIR-03): a macro on the first stone's mark, backing off just enough
// for the opening to gain room; looking down the slot at the rings lining up; then a rising
// retreat to the whole opened building, held; at 16 s it leans to the V gap of the near
// corner and starts in. Keys are relative to the first stone's face until 10 s.
const PyramidFilm = (() => {
    // Hermite through keys with time-aware tangents: the camera never stops at a key
    function path(keys, t) {
        if (t <= keys[0][0]) return keys[0].slice(1);
        const n = keys.length;
        if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
        let i = 0;
        while (keys[i + 1][0] < t) i++;
        const [t0] = keys[i], [t1] = keys[i + 1], h = t1 - t0, u = (t - t0) / h;
        const tan = (j) => {
            if (j === 0 || j === n - 1) return keys[j].slice(1).map((v) => v.map(() => 0));
            const dt = keys[j + 1][0] - keys[j - 1][0];
            return keys[j].slice(1).map((v, a) => v.map((_, c) => (keys[j + 1][a + 1][c] - keys[j - 1][a + 1][c]) / dt));
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
            [0.0, [-1.55, 0.32, 5.6], [-0.95, 0.5, 0], [0.66]],
            [2.5, [-0.9, 0.3, 4.1], [0.0, 0.45, 0.2], [0.62]],
            [4.0, rel(-0.18, 0.06, 0.75), rel(-0.03, 0.03, 0), [0.58]],
            [5.0, rel(0.045, 0.022, 0.19), rel(0, 0, 0), [0.55]],
            [6.5, rel(0.04, 0.03, 0.24), rel(0, 0.002, 0), [0.55]],
            [8.5, rel(0.01, 0.075, 0.4), rel(-0.01, 0.07, -0.2), [0.58]],
            [10.0, rel(0.0, 0.2, 1.0), rel(0, 0.06, -0.6), [0.62]],
            [12.0, [1.7, 1.35, 3.1], [0, 0.72, 0], [0.7]],
            [13.5, [3.4, 1.9, 4.3], [0, 0.85, 0], [0.72]],
            [15.5, [3.6, 1.95, 4.1], [0, 0.85, 0], [0.72]],
            [17.0, [1.2, 0.75, 1.45], [0, 0.4, 0], [0.74]],
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
    function storyTime(t) {
        if (t < PLATE_OUT) return t * 0.3;
        const u0 = PLATE_OUT * 0.3, t1 = 5 + LAG;
        if (t < t1) return u0 + ((t - PLATE_OUT) * (5 - u0)) / (t1 - PLATE_OUT);
        return t - LAG;
    }
    function frame(g, t, env, o = {}) {
        KEYS = KEYS ?? keys();
        // story time: the plate holds and goes in (0–2.9 s) with the camera still, the dust
        // devil drifting slowly; once the plate has gone the travelling runs (2.9–6.6 s); from
        // there the film runs 1.6 s behind the script's timings
        const u = storyTime(t);
        // PIR-04 onwards: the gallery inside (a hidden cut through the entrance ring)
        const inside = u >= Gallery.T0, shaft = u >= Shaft.T0 && u < Resonance.T0, reso = u >= Resonance.T0 && u < Nursery.T0, nurse = u >= Nursery.T0 && u < Seed.T0, seed = u >= Seed.T0;
        const P = seed ? Seed.build(u) : nurse ? Nursery.build(u) : reso ? Resonance.build(u) : shaft ? Shaft.build(u) : inside ? Gallery.build(u) : Pyramid.build(u);
        let cam, target, fov0, up;
        if (seed) ({ cam, target, fov: fov0, up } = Seed.camera(u));
        else if (nurse) ({ cam, target, fov: fov0, up } = Nursery.camera(u));
        else if (reso) ({ cam, target, fov: fov0, up } = Resonance.camera(u));
        else if (shaft) ({ cam, target, fov: fov0, up } = Shaft.camera(u));
        else [cam, target, [fov0]] = inside ? path(Gallery.KEYS, u) : path(KEYS, t < PLATE_OUT ? 0 : u);
        const s = plateScale(t, o);
        const on = s < PLATE_FILL - 1e-4;
        // the image area, scaled about the centre; the lens is widened so that area shows the
        // full-bleed composition (at full scale it is exactly the film's lens)
        const rect = on ? PLATE.map((v) => 0.5 + (v - 0.5) * s) : [0, 0, 1, 1];
        const fov = on ? 2 * Math.atan(Math.tan(fov0 / 2) / ((PLATE[3] - PLATE[1]) * s)) : fov0;
        const dist = Math.hypot(cam[0] - target[0], cam[1] - target[1], cam[2] - target[2]);
        const f = {
            cam, target, fov, near: 0.01,
            sun: [-0.75, 0.38, 0.55], sunK: 0.85, fill: 0.2, ink: '#2e261d', paper: '#ebe1cb',
            draws: P.draws, lights: P.lights,
            shadow: { center: target, radius: Math.min(6, Math.max(1.5, dist * 1.1)) },
            sky: { zenith: 0.22, horizon: 0.15, dusk: 0.35 },
            fog: [5, 22], spacing: 2.0, edge: 0.25, course: 0.0118, frame: rect, charcoal: true,
        };
        if (inside) Object.assign(f, seed ? Seed.frameParams(u) : nurse ? Nursery.frameParams : reso ? Resonance.frameParams : shaft ? Shaft.frameParams : Gallery.frameParams);
        if (reso) f.shadow = { center: [cam[0], 2, cam[2] - 3], radius: 9 };
        if (up) f.up = up;
        const img = env.state.R.layer((on ? 'p' : 'f') + Math.round(t * 24), f);
        // outside to inside: the camera flies into the dark of the opened stone and comes out
        // of the dark through the entrance ring; the dark is rubbed in before the print, so it
        // carries the charcoal grain (16.6–17.4 story time)
        const dark = Math.max(Math.max(0, 1 - Math.abs(u - 17) / 0.4), reso ? Resonance.dim(u) : nurse ? 0.8 * (1 - Ease.inOut(Ease.seg(u, 38, 38.5))) : seed ? Seed.dim(u) : 0);
        if (dark > 0) {
            const m = img.getContext('2d');
            m.save();
            m.globalAlpha = Math.min(1, dark * 1.25);
            m.fillStyle = '#3a342d';
            m.fillRect(0, 0, img.width, img.height);
            m.restore();
        }
        // the aged print (o.age === false shows the clean render, to compare)
        if (o.age === false) g.drawImage(img, 0, 0, env.W, env.H);
        // indoors the paper's tooth is kept finer so the carved detail survives the print
        else env.state.A.apply(g, img, { ink: f.ink, paper: f.paper, charcoal: f.charcoal, grain: inside ? 0.45 : 1 });
        if (on) {
            const open = u > 10;
            drawPlate(g, env, s, open ? 'VUE DE LA PYRAMIDE OUVERTE, ET DE SA MACHINE, PRISE AU CRÉPUSCULE.' : 'VUE DE LA GRANDE PYRAMIDE, PRISE AU CRÉPUSCULE.');
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
    return { frame, setup, storyTime, LAG };
})();
