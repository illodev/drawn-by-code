// 2026-11-17-light-valley · style woodcut · «Corriente»: the night the electric light
// reaches a mountain valley, cut in a plank and printed. 75 s, 25 bars at 80 BPM (the score's
// first bar lands at 15 s: it is silent before, under the river and the carving).
// scene.js only assembles: every shot is a file in film/ that registers Corriente.shots[id].
// From 39 s the cuts sit a frame late, on the score's own bars (its beat is 0.7508 s, so by
// then its bars have drifted 26–54 ms from the round 3 s grid)
const B = (t) => (t >= 39 ? t + 1 / 24 : t);
const CORRIENTE_SHOTS = [
    [0, 6, 'The first cut', 'firstCut'], [6, 12, 'The valley without light', 'valleyDark'], [12, 15, 'The oil lamp', 'oilLamp'],
    [15, 18, 'Upstream', 'upstream'], [18, 21, 'The drum', 'drum'], [21, 27, 'The pole', 'pole'], [27, 30, 'The span', 'span'],
    [30, B(39), 'Nights', 'nights'], [B(39), B(42), 'The switch', 'switch'], [B(42), B(51), 'The street', 'street'],
    [B(51), B(57), 'The last oil lamp', 'lastLamp'], [B(57), B(66), 'The valley lit', 'valleyLit'], [B(66), 75, 'The print', 'print'],
];
Motion.scene({
    fps: 24,
    duration: 75,
    logical: [1280, 720],
    bpm: 79.92,
    beatOffset: 0.7348,   // the score's first bar is at 15.0 s once 0.34 s of its silence is trimmed
    uses: [
        'styles/woodcut/woodcut.js',
        'sandbox/2026-11-17-light-valley/tone.js', { src: 'sandbox/2026-11-17-light-valley/corr.js', optional: true },
        'sandbox/2026-11-17-light-valley/street.js',
        'sandbox/2026-11-17-light-valley/film/lib.js',
        'sandbox/2026-11-17-light-valley/film/valley.js',
        'sandbox/2026-11-17-light-valley/film/first-cut.js',
        'sandbox/2026-11-17-light-valley/film/rooms.js',
        'sandbox/2026-11-17-light-valley/film/power.js',
        'sandbox/2026-11-17-light-valley/film/work.js',
        'sandbox/2026-11-17-light-valley/film/street-film.js',
        'sandbox/2026-11-17-light-valley/film/print.js',
    ],
    shots: CORRIENTE_SHOTS.map(([a, b, name]) => [a, b, name]),
    fonts: [{ family: 'IMFell', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }],
    audio: { mix: 'private/mix.wav' },
    setup(env) {
        return { blk: Woodcut.block(env) };
    },
    draw(g, t, env) {
        const { blk } = env.state;
        const s = CORRIENTE_SHOTS.find(([a, b]) => t >= a && t < b) ?? CORRIENTE_SHOTS[CORRIENTE_SHOTS.length - 1];
        const dGlobal = Math.floor(t * 12 + 1e-6), d = Math.floor((t - s[0]) * 12 + 1e-6), tl = d / 12;
        const fn = Corriente.shots[s[3]];
        if (fn) fn(blk, tl, d, env, g); else { blk.begin(); Corriente.night(blk); }
        if (!Corriente.printed) blk.print(g, { key: dGlobal, seed: dGlobal });
        Corriente.printed = false;
    },
});
