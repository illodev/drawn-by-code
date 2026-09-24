// 2026-09-24-saas-promo · a 50 s marketing video for a client's invoicing product
// (paper-cutout). The client's copy, colours, fonts and logo load from private/ (not
// committed); without them the scene runs on the placeholder brand in brand-default.js.
// Each block of the edit is a function Shots.<name>(g, lt, env) (lt = seconds into the
// block) in segments/ or segments/blocks/; a missing block shows a placeholder card.
const DIR = 'sandbox/2026-09-24-saas-promo/';
const BLOCKS = ['chaos', 'cloud', 'expenses', 'collections', 'taxes', 'business', 'compliance', 'close'];
// [start, end, shot name, block function, block start]
const EDIT = [
    [0, 6, 'Chaos', 'chaos', 0], [6, 10, 'Cloud', 'cloud', 6],
    [10, 12, 'Invoice · issue', 'issue', 10], [12, 16, 'Invoice · send', 'send', 12],
    [16, 21, 'Expenses', 'expenses', 16], [21, 27, 'Collections', 'collections', 21], [27, 33, 'Taxes', 'taxes', 27],
    [33, 38, 'Business', 'business', 33], [38, 43, 'Compliance', 'compliance', 38], [43, 50, 'Close', 'close', 43],
];
Motion.scene({
    fps: 24,
    duration: 50,
    logical: [1600, 900],
    previewSize: 960,
    uses: [
        'styles/paper-cutout/paper.js', 'styles/paper-cutout/kit.js', 'styles/paper-cutout/detail.js',
        DIR + 'segments/brand-default.js', { src: DIR + 'private/brand.js', optional: true },
        DIR + 'segments/props.js', DIR + 'segments/laura.js', DIR + 'segments/office.js', DIR + 'segments/shots.js',
        ...BLOCKS.map((b) => DIR + 'segments/blocks/' + b + '.js'),
    ],
    fonts: [
        { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' },
        { family: 'Stack', src: 'fonts/ShortStack-latin.woff2' },
        { family: 'Geist', src: DIR + 'private/fonts/geist-latin-500-normal.woff2', descriptors: { weight: '500' }, optional: true },
        { family: 'Geist', src: DIR + 'private/fonts/geist-latin-700-normal.woff2', descriptors: { weight: '700' }, optional: true },
        { family: 'Geist Mono', src: DIR + 'private/fonts/geist-mono-latin-500-normal.woff2', optional: true },
    ],
    bpm: 120,
    shots: EDIT.map(([a, b, name]) => [a, b, name]),

    setup(env) {
        Props.init(env);
        return {};
    },

    draw(g, t, env) {
        const [, , name, fn, t0] = EDIT.find(([a, b]) => t >= a && t < b) ?? EDIT[EDIT.length - 1];
        if (Shots[fn]) return Shots[fn](g, t - t0, env);
        // placeholder card for a block not built yet
        Props.kit.paperBg(g, 'todo', '#3a3440');
        g.fillStyle = '#f5ecd4';
        g.font = '64px "Hand"';
        g.textAlign = 'center';
        g.fillText(name + ' · ' + (t - t0).toFixed(1) + ' s', 800, 470);
    },

    post(ctx, t, env) {
        Props.kit.grainPost(ctx, 0.35);
    },
});
