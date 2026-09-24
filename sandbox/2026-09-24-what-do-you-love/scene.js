// 2026-09-24-what-do-you-love · 1:1 replica of a paper-cutout reference (see brief.md)
// Each shot lives in segments/*.js; this file only assembles the edit.
const DIR = 'sandbox/2026-09-24-what-do-you-love/';
Motion.scene({
    fps: 24,
    duration: 28,
    logical: [1000, 1000],
    previewSize: 900,
    uses: [
        'styles/paper-cutout/paper.js', 'styles/paper-cutout/kit.js',
        DIR + 'segments/common.js', DIR + 'segments/sets.js', DIR + 'segments/shots.js', DIR + 'segments/montage.js',
    ],
    fonts: [{ family: 'Stack', src: 'fonts/ShortStack-latin.woff2' }],
    // cut list measured on the reference (cuts land on quarter seconds)
    shots: [
        [0, 1.5, 'Exterior · planes'],
        [1.5, 2, 'Interior · idea'],
        [2, 3, 'Notepad · writing'],
        [3, 3.75, 'Notepad · close'],
        [3.75, 4, 'Notepad · done'],
        [4, 4.5, 'Tear'],
        [4.5, 5.25, 'Fold'],
        [5.25, 6, 'Interior · throw'],
        [6, 7, 'Sky · flight'],
        [7, 7.5, 'Flower · catch'],
        [7.5, 10, 'Flower · reads'],
        [10, 16, 'Montage'],
        [16, 18, 'Heart'],
        [18, 20, 'Flower · answers'],
        [20, 21, 'Exterior · arrival'],
        [21, 22, 'Interior · reads'],
        [22, 22.75, 'Note · close'],
        [22.75, 24, 'Interior · joy'],
        [24, 26, 'Exterior · lights'],
        [26, 27, 'Interior · pins'],
        [27, 28, 'Exterior · loop'],
    ],
    audio: { mix: 'out/reference-audio.wav' },

    setup(env) {
        WL.init(env);
        return {};
    },

    draw(g, t, env) {
        const shot = Motion.shotAt(this.shots, t);
        Shots[shot.name](g, t, env, shot);
    },

    post(ctx, t, env) {
        WL.kit.grainPost(ctx, 0.35);
    },
});
