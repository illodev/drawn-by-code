// 2026-09-24-what-do-you-love · 1:1 replica of a paper-cutout reference (see brief.md)
// Each shot lives in segments/*.js; this file only assembles the edit.
const DIR = 'sandbox/2026-09-24-what-do-you-love/';
Motion.scene({
    fps: 24,
    duration: 28,
    logical: [1000, 1000],
    previewSize: 900,
    uses: [
        'styles/paper-cutout/paper.js', 'styles/paper-cutout/kit.js', 'styles/paper-cutout/detail.js',
        DIR + 'segments/common.js', DIR + 'segments/sets.js', DIR + 'segments/shots.js', DIR + 'segments/things.js',
        ...['words', 'music', 'sea', 'tree', 'dog', 'bread', 'rain', 'math', 'stars', 'octopus', 'tea', 'flowers', 'cat'].map((n) => DIR + 'segments/things/' + n + '.js'),
        DIR + 'segments/montage.js',
    ],
    fonts: [{ family: 'Stack', src: 'fonts/ShortStack-latin.woff2' }, { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
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
        [10, 10.5, 'Montage · words'],
        [10.5, 11, 'Montage · music'],
        [11, 11.5, 'Montage · the sea'],
        [11.5, 12, 'Montage · trees'],
        [12, 12.5, 'Montage · dogs'],
        [12.5, 13, 'Montage · bread'],
        [13, 13.5, 'Montage · rain'],
        [13.5, 14, 'Montage · math'],
        [14, 15, 'Montage · the stars'],
        [15, 15.25, 'Montage · octopus'],
        [15.25, 15.5, 'Montage · tea'],
        [15.5, 15.75, 'Montage · flowers'],
        [15.75, 16, 'Montage · cats'],
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
        // montage cards share one drawer: 'Montage · words' → Shots['Montage']
        (Shots[shot.name] ?? Shots[shot.name.split(' · ')[0]])(g, t, env, shot);
    },

    post(ctx, t, env) {
        WL.kit.grainPost(ctx, 0.35);
    },
});
