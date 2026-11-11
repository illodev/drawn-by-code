// 2026-11-11-runnin-down-a-dream · style cereal-ad
// A videoclip for «Runnin' Down a Dream» (Tom Petty, 1989), seen as a VHS tape on a CRT.
// This file only assembles: each stretch of the song is a segment in segments/, and every
// time comes from song.js (measured on the track).
Motion.scene({
    fps: 24,
    duration: 182.5,
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
        'sandbox/2026-11-11-runnin-down-a-dream/weather.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2a-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2a.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2b-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2b.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2c-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse2c.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus2-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus2.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/breakad-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/breakad.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/breakrew-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/breakrew.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse3a-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse3a.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse3b-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/verse3b.js',
        'sandbox/2026-11-11-runnin-down-a-dream/inferno.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus3-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/chorus3.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/hellplug-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/hellplug.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/hellhoof-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/hellhoof.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/bridge-props.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/bridge.js',
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
        [48.375, 55.4167, 'Plan B'],
        [55.4167, 58.25, 'Feeling good'], [58.25, 62.5, 'Cruise control'], [62.5, 63.9167, 'Behind them'],
        [63.9167, 65.2917, 'The cloud grows'], [65.2917, 69.5417, 'Three days of rain'], [69.5417, 70.9583, 'Unstoppable'],
        [70.9583, 72.375, 'Cold'], [72.375, 75.2083, 'Hell freezes over'], [75.2083, 76.625, 'On ice'],
        [76.625, 79.4167, 'Sunshine'], [79.4167, 86.5, 'The thaw'], [86.5, 89.3333, 'Title'],
        [89.3333, 92.125, 'Bumper'], [92.125, 93.5417, 'Empty'], [93.5417, 94.9583, 'Burst'], [94.9583, 96.375, 'Souls wanted'], [96.375, 97.7917, 'Cash paid'], [97.7917, 100.625, 'Phone'], [100.625, 103.4167, 'End card'],
        [103.4167, 104.8333, 'REW'], [104.8333, 107.6667, 'Slowing'], [107.6667, 109.0833, 'The message'], [109.0833, 110.5, 'PLAY'],
        [110.5, 114.7083, 'Dusk'], [114.7083, 117.5417, 'Pedal'], [117.5417, 120.375, 'Time'],
        [120.375, 123.2083, 'Billboards'], [123.2083, 126.0417, 'The trap'], [126.0417, 131.6667, 'Pickin up'],
        [131.6667, 134.5, 'The entrance'], [134.5, 135.9167, 'Lights'], [135.9167, 137.3333, 'A foot taps'], [137.3333, 138.75, 'Won over'], [138.75, 140.125, 'Mitts up'], [140.125, 141.5417, 'The box'], [141.5417, 144.375, 'Full heat'],
        [144.375, 147.9167, 'The plug'], [147.9167, 150.0417, 'Lighters'], [150.0417, 152.8333, 'Chorus 4'], [152.8333, 154.25, 'Sing along'], [154.25, 155.6667, 'Full tilt'],
        [155.6667, 157.0833, 'Arms crossed'], [157.0833, 158.5, 'The hoof'], [158.5, 164.1667, 'One part at a time'], [164.1667, 166.9583, 'He lets go'], [166.9583, 168.375, 'The contract'],
        [168.375, 171.2083, 'Torn'], [171.2083, 175.4583, 'The fire'], [175.4583, 176.875, 'The house'], [176.875, 179.3333, 'The nod'], [179.3333, 179.6667, 'The peg'], [179.6667, 182.5, 'Face to face']],
    audio: { mix: 'private/song.mp3' },

    setup() {
        // each block starts on its bar's own frame (Song.B), never on a rounded literal: a
        // four-decimal time can fall a hair after the frame and hand the block over a frame late
        const B = Song.B;
        return {
            order: [[0, Seg.open], [6, Seg.sign], [B(8), Seg.getaway], [B(12), Seg.verse1a], [B(17), Seg.verse1b], [B(20), Seg.verse1c], [B(25), Seg.chorus1], [B(34), Seg.planb],
                [B(39), Seg.verse2a], [B(45), Seg.verse2b], [B(50), Seg.verse2c], [B(54), Seg.chorus2], [B(63), Seg.breakad], [B(73), Seg.breakrew], [B(78), Seg.verse3a], [B(85), Seg.verse3b],
                [B(93), Seg.chorus3], [B(102), Seg.hellplug], [B(110), Seg.hellhoof], [B(119), Seg.bridge]],
        };
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
