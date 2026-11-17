// Atlas style template: a corner of a school-atlas plate, the reservoir at the head of a valley,
// and a canal that leaves the dam and draws itself down the valley in red dashes while the
// camera leans in a little. Relief, tints and contours come from the kit; the terrain is the
// kit's sample (a piece of the style test's plate).
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/atlas/atlas.js', 'styles/atlas/sample.js'],
    fonts: [
        { family: 'Garamond', src: 'fonts/EBGaramond-latin.woff2' },
        { family: 'Garamond', src: 'fonts/EBGaramond-Italic-latin.woff2', descriptors: { style: 'italic' } },
    ],
    shots: [[0, 4, 'Template']],
    setup(env) {
        return { R: Atlas.relief(env, AtlasSample.terrain()) };
    },
    draw(g, t, env) {
        const S = AtlasSample, [w, h] = S.size;
        const lean = Ease.inOut(Ease.seg(t, 0, 4));
        const view = { cx: w / 2 + 14 * lean, cy: h / 2 + 6 * lean, zoom: 1.04 + 0.1 * lean };
        env.state.R.draw(g, view, { span: w, contour: 1.5, erosion: [5, 0.12, 1.2], lineAlpha: 0.6, lineWidth: 0.9 });
        Atlas.onMap(g, env, view, w, () => {
            Atlas.lake(g, S.shore, { lines: [[0, 0.85, 1], [2.3, 0.7, 0.85], [4.0, 0.6, 0.65], [6.0, 0.55, 0.45]] });
            for (const r of S.rivers) Atlas.river(g, r.pts, r.w, { width: 0.7, edge: false, color: '#5f9fc6' });
            Atlas.channel(g, S.canal, { width: 4.9 });
            Atlas.dam(g, [166.5, 122.3], [209.3, 98.3], { down: 1, bow: 0.13, depth: [0.36, 0.5] });
            Atlas.dashed(g, S.canal, { upto: Ease.out(Ease.seg(t, 0.6, 3.2)), dash: 10, gap: 4.7, width: 2.9 });
            Atlas.label(g, 'EMBALSE', 89, 72.5, { size: 11.3, width: 75 });
            Atlas.label(g, 'Canal', 395, 228, { size: 14, italic: true, angle: 0.31, weight: 600 });
        });
    },
});
