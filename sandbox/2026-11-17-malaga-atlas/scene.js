// 2026-11-17-malaga-atlas · style atlas
// Málaga as a plate of the atlas: real relief and real map data (private/, tools/fetch.py).
// The plate is printed; then the water leaves the Limonero reservoir, runs down the
// Guadalmedina through the city to the sea with the camera after it, and the camera pulls back.
Motion.scene({
    fps: 24,
    duration: 12,
    logical: [1600, 900],
    uses: ['styles/atlas/atlas.js', 'sandbox/2026-11-17-malaga-atlas/plate.js'],
    fonts: [
        { family: 'Garamond', src: 'fonts/EBGaramond-latin.woff2' },
        { family: 'Garamond', src: 'fonts/EBGaramond-Italic-latin.woff2', descriptors: { style: 'italic' } },
    ],
    shots: [[0, 12, 'Plate']],
    async setup(env) {
        const M = await Malaga.load(env);
        return { M, R: Atlas.relief(env, M.height) };
    },
    draw(g, t, env) {
        const { M, R } = env.state;
        const relief = 0.35 + 0.65 * Ease.inOut(Ease.seg(t, 0.0, 0.9)), ink = Ease.inOut(Ease.seg(t, 0.5, 1.2)), letters = Ease.inOut(Ease.seg(t, 1.0, 1.5));
        // the water: leaves the dam at 3.0 s, reaches the sea at 8.0 s
        const u = Ease.inOut(Ease.seg(t, 3.0, 8.0));
        const front = Atlas.along(M.route, u).at;
        const kIn = Ease.inOut(Ease.seg(t, 2.0, 3.3)), kOut = Ease.inOut(Ease.seg(t, 8.6, 10.8));
        const k = kIn * (1 - kOut);
        const zoomNear = 2.0 - 0.3 * Ease.inOut(Ease.seg(t, 5.0, 8.0));
        const c = t < 3.3 ? { cx: M.dam[0], cy: M.dam[1] } : { cx: front[0], cy: front[1] - 10 };
        const view = {
            cx: Ease.lerp(640, c.cx, k),
            cy: Ease.lerp(360, c.cy, k),
            zoom: Math.exp(Ease.lerp(0, Math.log(zoomNear), k)),
        };
        const hw = 625 / view.zoom, hh = 345 / view.zoom;
        const clamp = (v, lo, hi, mid) => (lo > hi ? mid : Math.min(hi, Math.max(lo, v)));
        view.cx = clamp(view.cx, 21 + hw, 1259 - hw, 640);
        view.cy = clamp(view.cy, 21 + hh, 699 - hh, 360);
        R.draw(g, view, { span: 1280, contour: 3.0, erosion: [6, 0.1, 1.2], lineAlpha: 0.6, lineWidth: 0.9, fade: 1 - relief });
        Atlas.onMap(g, env, view, 1280, () => {
            Malaga.draw(g, M, { ink, letters, route: u, water: relief });
            Atlas.neatline(g, { W: 1280, H: 720 });
        });
    },
});
