// pier-pressure · Kit over the quay of Gull Harbor: the first character replicated from her
// approved concept sheet (cast/kit-ref.js, measured by tools/trace.py), on the set, as a test
// of the series' look. She hangs in the air and drifts on twos; the palm, the flags and the
// gulls of the set move behind her.
const DIR = 'sandbox/2026-11-14-pier-pressure/';
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/skate-toon/toon.js', DIR + 'cast/ref.js', DIR + 'cast/kit-ref.js', DIR + 'set.js'],
    fonts: [{ family: 'Bangers', src: 'fonts/Bangers-Regular.ttf' }],
    bpm: 120,
    shots: [[0, 4, 'Kit over the quay']],

    draw(g, t, env) {
        const T = SkateToon, C = T.COL;
        const tt = T.onTwos(t), d = T.drawing(t);
        Harbor.back(g, env, t);
        // the sheet's pose is 740 × 720; she is drawn 1.04 of that, drifting and tipping a little
        const s = 1.04, [w, h] = Ref.size('kit', 'jump');
        g.save();
        g.translate(800 + Math.sin(tt * Math.PI * 0.5) * 6, 408 + Math.sin(tt * Math.PI) * 9);
        g.rotate(Math.sin(tt * Math.PI + 0.6) * 0.022);
        Ref.draw(g, 'kit', 'jump', (-w / 2) * s, (-h / 2) * s - 40, s);
        g.restore();
        Harbor.fore(g, env, t);
        g.save();
        g.translate(800, 816);
        g.rotate(-0.04);
        T.slab(g, [[-250, -62], [246, -74], [258, 62], [-244, 70]], { fill: C.navy, seed: 'title-board', over: 2.6, w: T.LINE });
        T.slab(g, [[-236, -50], [232, -61], [243, 50], [-231, 57]], { fill: null, seed: 'title-rule', over: 0.6, w: T.LINE_FINE, color: C.roadLine });
        T.sign(g, 'PIER PRESSURE', 4, 34, { size: 100, fill: [C.roadLine, C.white, C.magenta], drop: '#04628a', seed: 'title' + (d % 24 < 12 ? 0 : 1), w: T.LINE, track: 0.02 });
        g.restore();
    },
});
