// 2026-11-17-atlas-test · style atlas (the style test)
// The plate as the reference drew it (0–2 s: the detail gate's instants), then the water leaves
// the reservoir: the canal's bed fills with water from the dam down to the town while the camera
// follows the front, and pulls back to the whole plate when it arrives.
const DIR = '/sandbox/2026-11-17-atlas-test/';
Motion.scene({
    fps: 24,
    duration: 12,
    logical: [1600, 900],
    uses: ['styles/atlas/atlas.js', 'sandbox/2026-11-17-atlas-test/plate.js'],
    fonts: [
        { family: 'Garamond', src: 'fonts/EBGaramond-latin.woff2' },
        { family: 'Garamond', src: 'fonts/EBGaramond-Italic-latin.woff2', descriptors: { style: 'italic' } },
    ],
    shots: [[0, 12, 'Plate']],
    async setup(env) {
        const meta = await (await fetch(DIR + 'data/height.json')).json();
        const vec = await (await fetch(DIR + 'data/vectors.json')).json();
        const height = await Atlas.load(DIR + 'data/height.u16', meta, DIR + 'data/tint.u16');
        const hAt = (x, y) => height.data[Math.min(height.h - 1, Math.max(0, Math.round(y))) * height.w + Math.min(height.w - 1, Math.max(0, Math.round(x)))];
        return { R: Atlas.relief(env, height), vec, hAt, canal: vec.dashes.map((d) => d.c) };
    },
    draw(g, t, env) {
        const { R, vec, hAt, canal } = env.state;
        // 0–1.5 s the plate is printed: the relief comes up out of the paper, then its ink, then
        // its lettering; 1.5–2 s it holds as the reference drew it (the detail gate's instant)
        const relief = 0.35 + 0.65 * Ease.inOut(Ease.seg(t, 0.0, 0.9)), ink = Ease.inOut(Ease.seg(t, 0.5, 1.2)), letters = Ease.inOut(Ease.seg(t, 1.0, 1.5));
        // the water's front: leaves the dam at 3.0 s, reaches the town at 8.2 s
        const u = Ease.inOut(Ease.seg(t, 3.0, 8.2));
        const front = Atlas.along(canal, u).at, dam = canal[0];
        // the camera: in onto the dam, along with the water, easing out as the water nears the
        // town (so it keeps moving where the frame's edge stops it), back to the whole plate
        const kIn = Ease.inOut(Ease.seg(t, 2.0, 3.3)), kOut = Ease.inOut(Ease.seg(t, 8.0, 10.2));
        const k = kIn * (1 - kOut);
        const zoomNear = 1.7 - 0.35 * Ease.inOut(Ease.seg(t, 6.2, 8.2));
        const c = t < 3.3 ? { cx: dam[0], cy: dam[1] } : { cx: front[0], cy: front[1] };
        const view = {
            cx: Ease.lerp(640, c.cx, k),
            cy: Ease.lerp(360, c.cy, k),
            zoom: Math.exp(Ease.lerp(0, Math.log(zoomNear), k)),
        };
        // never past the plate's frame: the heightfield ends there
        const hw = 625 / view.zoom, hh = 345 / view.zoom;
        const clamp = (v, lo, hi, mid) => (lo > hi ? mid : Math.min(hi, Math.max(lo, v)));
        view.cx = clamp(view.cx, 21 + hw, 1259 - hw, 640);
        view.cy = clamp(view.cy, 21 + hh, 699 - hh, 360);
        R.draw(g, view, { span: 1280, contour: 2.6, erosion: [7, 0.12, 1.2], lineAlpha: 0.6, lineWidth: 0.9, fade: 1 - relief });
        Atlas.onMap(g, env, view, 1280, () => {
            Plate.draw(g, vec, hAt, { water: u, ink, letters });
            Atlas.neatline(g, { W: 1280, H: 720 });     // the page's frame, in map px: it leaves as we go in
        });
    },
});
