// 2026-09-24-saas-promo · a 50 s marketing video for a client's invoicing product
// (paper-cutout). The client's copy, colours, fonts and logo load from private/ (not
// committed); without them the scene runs on the placeholder brand in brand-default.js.
// STYLE TEST: only the invoice block (10–16 s of the final edit) for now.
const DIR = 'sandbox/2026-09-24-saas-promo/';
Motion.scene({
    fps: 24,
    duration: 6,
    logical: [1600, 900],
    previewSize: 960,
    uses: [
        'styles/paper-cutout/paper.js', 'styles/paper-cutout/kit.js', 'styles/paper-cutout/detail.js',
        DIR + 'segments/brand-default.js', { src: DIR + 'private/brand.js', optional: true },
        DIR + 'segments/props.js', DIR + 'segments/laura.js', DIR + 'segments/shots.js',
    ],
    fonts: [
        { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' },
        { family: 'Stack', src: 'fonts/ShortStack-latin.woff2' },
        { family: 'Geist', src: DIR + 'private/fonts/geist-latin-500-normal.woff2', descriptors: { weight: '500' }, optional: true },
        { family: 'Geist', src: DIR + 'private/fonts/geist-latin-700-normal.woff2', descriptors: { weight: '700' }, optional: true },
        { family: 'Geist Mono', src: DIR + 'private/fonts/geist-mono-latin-500-normal.woff2', optional: true },
    ],
    bpm: 120,
    shots: [[0, 2, 'Invoice · issue'], [2, 6, 'Invoice · send']],

    setup(env) {
        Props.init(env);
        return {};
    },

    draw(g, t, env) {
        if (t < 2) Shots.issue(g, t, env);
        else Shots.send(g, t - 2, env);
    },

    post(ctx, t, env) {
        Props.kit.grainPost(ctx, 0.35);
    },
});
