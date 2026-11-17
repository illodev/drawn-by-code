// dev: the atlas relief on real terrain (python3 tools/dem.py fetches it into out/dem/)
const DIR = '/sandbox/2026-11-17-atlas-test/out/dem/';
Motion.scene({
    fps: 24, duration: 2, logical: [1600, 900],
    uses: ['styles/atlas/atlas.js'],
    shots: [[0, 2, 'DEM']],
    async setup(env) {
        const meta = await (await fetch(DIR + 'height.json')).json();
        const height = await Atlas.load(DIR + 'height.u16', meta, DIR + 'tint.u16');
        return { R: Atlas.relief(env, height) };
    },
    draw(g, t, env) {
        env.state.R.draw(g, { cx: 640, cy: 360, zoom: 1 }, { span: 1280, contour: 3.5, erosion: [7, 0.0, 1.2], lineAlpha: 0.8 });
    },
});
