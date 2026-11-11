// 2026-11-11-runnin-down-a-dream · style cereal-ad
// A videoclip for «Runnin' Down a Dream» (Tom Petty, 1989), seen as a VHS tape on a CRT.
// This file only assembles: each stretch of the song is a segment in segments/, and every
// time comes from song.js (measured on the track).
Motion.scene({
    fps: 24,
    duration: 55.4167,
    logical: [1000, 1000],
    uses: [
        'styles/cereal-ad/cereal.js',
        'sandbox/2026-11-11-runnin-down-a-dream/song.js',
        'sandbox/2026-11-11-runnin-down-a-dream/cast.js',
        'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js',
        'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js',
        'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js',
        'sandbox/2026-11-11-runnin-down-a-dream/world.js',
        'sandbox/2026-11-11-runnin-down-a-dream/rig.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/open.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/sign.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/getaway.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse1a-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse1a.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse1b.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse1c-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse1c.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus1.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/planb.js',
    ],
    fonts: [
        { family: 'Anton', src: 'fonts/Anton-latin.woff2' },
        { family: 'Titan One', src: 'fonts/TitanOne-latin.woff2' },
        { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' },
    ],
    bpm: 169.97,
    beatOffset: 0.356,
    shots: [[0, 0.5, 'Blue'], [0.5, 1.75, 'Card'], [1.75, 6, 'Title'], [6, 8.8333, 'Crossroads'], [8.8333, 10.25, 'Contract'], [10.25, 11.6667, 'Autograph'], [11.6667, 17.2917, 'Getaway'],
        [17.2917, 20.125, 'Cruising'], [20.125, 24.375, 'Hitchhiker'], [24.375, 25.7917, 'Swap'], [25.7917, 28.5833, 'Fork'],
        [28.5833, 31.4167, 'Digging'], [31.4167, 32.8333, 'The hop'], [32.8333, 35.6667, 'Flying'],
        [35.6667, 38.5, 'Landing'], [38.5, 39.875, 'Kick'], [39.875, 44.125, 'Chase'], [44.125, 45.5417, 'Band'], [45.5417, 48.375, 'Blast'],
        [48.375, 55.4167, 'Plan B']],
    audio: { mix: 'private/song.mp3' },

    setup() {
        return { order: [[0, Seg.open], [6, Seg.sign], [11.6667, Seg.getaway], [17.2917, Seg.verse1a], [24.375, Seg.verse1b], [28.5833, Seg.verse1c], [35.6667, Seg.chorus1], [48.375, Seg.planb]] };
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
