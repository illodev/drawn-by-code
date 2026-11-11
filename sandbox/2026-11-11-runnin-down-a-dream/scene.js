// 2026-11-11-runnin-down-a-dream · style cereal-ad
// A videoclip for «Runnin' Down a Dream» (Tom Petty, 1989), seen as a VHS tape on a CRT.
// This file only assembles: each stretch of the song is a segment in segments/, and every
// time comes from song.js (measured on the track).
Motion.scene({
    fps: 24,
    duration: 11.6667,
    logical: [1000, 1000],
    uses: [
        'styles/cereal-ad/cereal.js',
        'sandbox/2026-11-11-runnin-down-a-dream/song.js',
        'sandbox/2026-11-11-runnin-down-a-dream/cast.js',
        'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/open.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/sign.js',
    ],
    fonts: [
        { family: 'Anton', src: 'fonts/Anton-latin.woff2' },
        { family: 'Titan One', src: 'fonts/TitanOne-latin.woff2' },
        { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' },
    ],
    bpm: 169.97,
    beatOffset: 0.356,
    shots: [[0, 0.5, 'Blue'], [0.5, 1.75, 'Card'], [1.75, 6, 'Title'], [6, 8.8333, 'Crossroads'], [8.8333, 10.25, 'Contract'], [10.25, 11.6667, 'Autograph']],
    audio: { mix: 'private/song.mp3' },

    setup() {
        return { order: [[0, Seg.open], [6, Seg.sign]] };
    },

    draw(g, t, env) {
        const seg = env.state.order.filter(([from]) => t >= from - 1e-6).pop()[1];
        seg.draw(g, t, env);
    },

    post(ctx, t, env) {
        const seg = env.state.order.filter(([from]) => t >= from - 1e-6).pop()[1];
        Cereal.post(ctx, t, env, seg.post(t));
    },
});
