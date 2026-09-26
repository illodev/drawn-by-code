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
            [5.0, rel(0.045, 0.022, 0.19), rel(0, 0, 0), [0.55]],
            [6.5, rel(0.04, 0.03, 0.24), rel(0, 0.002, 0), [0.55]],
            [8.5, rel(0.01, 0.075, 0.4), rel(-0.01, 0.07, -0.2), [0.58]],
            [10.0, rel(0.0, 0.2, 1.0), rel(0, 0.06, -0.6), [0.62]],
            [12.0, [1.7, 1.35, 3.1], [0, 0.72, 0], [0.7]],
            [13.5, [3.4, 1.9, 4.3], [0, 0.85, 0], [0.72]],
            [15.5, [3.6, 1.95, 4.1], [0, 0.85, 0], [0.72]],
            [17.0, [2.3, 1.3, 2.75], [0, 0.55, 0.1], [0.74]],
        ];
    }
    function frame(g, t, env, o = {}) {
        KEYS = KEYS ?? keys();
        const P = Pyramid.build(t);
        const [cam, target, [fov0]] = path(KEYS, t);
        const plate = o.plate ? [0.075, 0.1, 0.925, 0.86] : [0, 0, 1, 1];
        // the plate's image area keeps the full-bleed composition: widen the lens to match
        const fov = o.plate ? 2 * Math.atan(Math.tan(fov0 / 2) / (plate[3] - plate[1])) : fov0;
        const dist = Math.hypot(cam[0] - target[0], cam[1] - target[1], cam[2] - target[2]);
        const f = {
            cam, target, fov, near: 0.01,
            sun: [-0.35, 0.5, 0.8], sunK: 0.8, fill: 0.2, ink: '#2e261d', paper: '#ebe1cb',
            draws: P.draws, lights: P.lights,
            shadow: { center: target, radius: Math.min(3.2, Math.max(1.5, dist * 0.8)) },
            sky: { zenith: 0.2, horizon: 0.08 },
            fog: [5, 22], spacing: 2.0, edge: 0.25, course: 0.0118, frame: plate, charcoal: true,
        };
        const img = env.state.R.layer((o.plate ? 'p' : 'f') + Math.round(t * 24), f);
        // the aged print (o.age === false shows the clean render, to compare)
        if (o.age === false) g.drawImage(img, 0, 0, env.W, env.H);
        else env.state.A.apply(g, img, { ink: f.ink, paper: f.paper, charcoal: f.charcoal });
        if (o.plate) {
            const W = env.W, H = env.H;
            const x0 = plate[0] * W, y0 = plate[1] * H, x1 = plate[2] * W, y1 = plate[3] * H;
            g.save();
            g.strokeStyle = '#2a2520';
            g.lineWidth = 1.6;
            g.strokeRect(x0, y0, x1 - x0, y1 - y0);
            g.lineWidth = 0.6;
            g.strokeRect(x0 - 7, y0 - 7, x1 - x0 + 14, y1 - y0 + 14);
            g.fillStyle = '#2a2520';
            g.textBaseline = 'alphabetic';
            g.font = '30px Fell';
            g.textAlign = 'left';
            g.fillText('A. Vol. VII.', x0, y0 - 26);
            g.textAlign = 'right';
            g.fillText('Pl. 3.', x1, y0 - 26);
            g.textAlign = 'center';
            g.font = '46px Fell';
            g.save();
            g.translate(W / 2, y0 - 24);
            g.scale(1.25, 1);
            g.fillText('PYRAMIDE DES CIEUX.', 0, 0);
            g.restore();
            g.font = '26px Fell';
            g.fillText("VUE DE LA PYRAMIDE OUVERTE, ET DE SA MACHINE, PRISE AU CRÉPUSCULE.", W / 2, y1 + 58);
            g.font = '15px Fell';
            g.textAlign = 'left';
            g.fillText('Code del.', x0, y1 + 24);
            g.textAlign = 'right';
            g.fillText('Claude sculp.', x1, y1 + 24);
            g.restore();
        }
    }
    function setup(env) {
        const R = Engrave.renderer(env, { scale: 2 });
        R.mesh('ring', Engrave.torus(0.085));
        return { R, A: Engrave.ager(env) };
    }
    return { frame, setup };
})();
