// One frame of the film, shared by the full-bleed scene and the plate variant (the image
// inside a printed plate: margins, neat line, running heads and a caption in the plate's
// capitals). The plate is for the opening and closing frames; the film itself is full bleed.
const PyramidFilm = (() => {
    const CAM = { cam: [3.4, 1.8, 4.3], target: [0, 0.85, 0], fov: 0.72 };
    function frame(g, t, env, o = {}) {
        const e = Ease.inOut(Ease.seg(t, 10, 13.5));
        const P = Pyramid.build(t, e);
        const plate = o.plate ? [0.075, 0.1, 0.925, 0.86] : [0, 0, 1, 1];
        // the plate's image area keeps the full-bleed composition: widen the lens to match
        const fov = o.plate ? 2 * Math.atan(Math.tan(CAM.fov / 2) / (plate[3] - plate[1])) : CAM.fov;
        env.state.R.render(g, (o.plate ? 'p' : 'f') + Math.round(t * 24), {
            ...CAM, fov,
            sun: [-0.45, 0.42, 0.8], sunK: 1.0, fill: 0.3,
            draws: P.draws, lights: P.lights,
            shadow: { center: [0, 0.9, 0], radius: 3.2 },
            sky: { zenith: 0.62, horizon: 0.03 },
            fog: [5, 22], spacing: 6, frame: plate,
        });
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
        const R = Engrave.renderer(env, { scale: 1 });
        R.mesh('ring', Engrave.torus(0.085));
        return { R };
    }
    return { frame, setup };
})();
