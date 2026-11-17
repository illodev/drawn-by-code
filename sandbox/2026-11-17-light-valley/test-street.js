// 2026-11-17-light-valley · the style test (kept as it was approved): the night the light reaches the
// street. One shot matched to ref/street-lit.png; the lamps, windows and the door are
// carved out of the black block one by one and the ochre block prints them.
Motion.scene({
    fps: 24,
    duration: 6,
    logical: [1280, 720],
    uses: ['styles/woodcut/woodcut.js', 'sandbox/2026-11-17-light-valley/tone.js', { src: 'sandbox/2026-11-17-light-valley/corr.js', optional: true }, 'sandbox/2026-11-17-light-valley/street.js'],
    shots: [[0, 6, 'Street']],
    setup(env) {
        return { blk: Woodcut.block(env) };
    },
    draw(g, t, env) {
        const { blk } = env.state, d = Math.floor(t * 12 + 1e-6);
        Street.draw(blk, d);
        blk.print(g, { key: d, seed: d });
    },
});
