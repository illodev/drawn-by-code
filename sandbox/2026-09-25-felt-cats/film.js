// The film: the three felt cats dance (dance.js) on a set (backdrops.js). One scene file per
// set calls FeltFilm(name): the cats, the dance, the camera and the music are the same, only
// the backdrop and its light change («same cats, 800 sets»).
// A scene file (scene.js) lists the files and the music, and hands setup/draw to
// FeltFilm(name) (film.js is loaded by then).
// The glasses cat pees while it dances: a puddle grows where it stood, and a new one starts
// wherever it moves to (drop times below; each grows to its size in about a second).
function FeltFilm(setName, o = {}) {
    const S = 'sandbox/2026-09-25-felt-cats/';
    const DROPS = [[0.6, 0.15], [3.0, 0.08], [5.2, 0.1], [7.6, 0.08], [10.6, 0.09], [12.8, 0.08], [14.6, 0.1]];
    function puddle(t) {
        // at most 6 blobs: the latest ones (older ones have merged into the first)
        const out = [];
        for (const [t0, r] of DROPS) {
            if (t < t0) continue;
            const p = Dance.at(t0).poses[2];
            const g = 1 - Math.exp(-(t - t0) * 2.2);
            out.push([p.x + 0.01, (p.z ?? 0) + 0.02, r * g]);
        }
        return out.slice(-6);
    }
    const film = {
        setup(env) {
            return { film, R: Felt3D.renderer(env, { scene: Cats.GLSL, scale: o.scale ?? 0.6, params: Cats.PARAMS }) };
        },
        draw(g, t, env) {
            const D = Dance.at(t), set = Backdrops.get(setName);
            // the set zooms with the camera (the same 2D zoom the cats get in the shader)
            const [Z, u, v] = D.zoom;
            g.save();
            g.translate(u * 900, v * 1600);
            g.scale(Z, Z);
            g.translate(-u * 900, -v * 1600);
            set.paint(g, D.tq, env);
            g.restore();
            const d = Math.round(D.tq * 15);
            env.state.R.render(g, d, { p: Cats.pack(D.poses, puddle(D.tq)), boil: d % 3, ...Stage.CAM, ...set.light, zoom: D.zoom });
            if (set.front) set.front(g, D.tq, env);
        },
    };
    return film;
}
