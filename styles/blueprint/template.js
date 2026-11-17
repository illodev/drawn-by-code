// Blueprint style template: a pipe flange drafts itself (plan, section, a dimension, its title).
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/blueprint/blueprint.js'],
    fonts: [{ family: 'RoutedGothic', src: 'fonts/RoutedGothic.ttf' }],
    shots: [[0, 4, 'Template']],

    setup(env) {
        const D = Blueprint.drawing(), cx = 560, cy = 400, PI = Math.PI;
        // centre lines first, as on the board
        D.group('axes', { overlap: 0.3 }).centre().line(cx - 280, cy, cx + 280, cy).line(cx, cy - 280, cx, cy + 280).line(1060, cy, 1400, cy);
        D.centre().circle(cx, cy, 175);
        // plan: the flange, its bore, eight bolt holes on their circle
        D.group('plan', { overlap: 0.2 }).bold().circle(cx, cy, 230).circle(cx, cy, 95);
        D.med().circle(cx, cy, 112);
        for (let k = 0; k < 8; k++) { const a = (k * PI) / 4 + PI / 8; D.med().circle(cx + 175 * Math.cos(a), cy + 175 * Math.sin(a), 17); }
        // section: what the cut goes through is hatched; the bore and the holes are not
        const X = 1150, cut = [[cy - 230, cy - 192], [cy - 158, cy - 95], [cy + 95, cy + 158], [cy + 192, cy + 230]];
        D.group('section', { overlap: 0.25 }).bold();
        const wide = [56, 150, 150, 56]; // the flange's rim, the hub either side of the bore
        cut.forEach(([a, b], i) => D.rect(X, a, wide[i], b - a));
        D.med().line(X, cy - 230, X, cy + 230).line(X + 56, cy - 192, X + 56, cy - 158).line(X + 56, cy + 158, X + 56, cy + 192);
        D.group('hatch', { overlap: 0.05 }).fine();
        cut.forEach(([a, b], i) => D.hatch([X, a, X + wide[i], a, X + wide[i], b, X, b], { gap: 9 }));
        // a dimension and the title
        D.group('dims', { overlap: 0.2 }).fine().line(cx - 230, cy + 20, cx - 230, cy + 318).line(cx + 230, cy + 20, cx + 230, cy + 318);
        Blueprint.dimH(D, cy + 300, cx - 230, cx + 230, { label: 'Ø 460', cap: 15, arrow: 13 });
        Blueprint.title(D.group('title'), 800, 800, 'PIPE FLANGE', 'SCALE 1:2', { cap: 20 });
        return { D };
    },

    draw(g, t, env) {
        const when = { axes: [0.1, 0.8], plan: [0.6, 1.8], section: [1.5, 2.3], hatch: [2.1, 2.9], dims: [2.6, 3.1], title: [2.9, 3.5] };
        const push = 1.06 - 0.06 * Ease.inOut(Ease.seg(t, 0, 3.6));
        Blueprint.frame(g, env, { cam: [800, 450, push], zoomMax: 1.06 }, (ink) => env.state.D.paint(ink, (name) => Ease.seg(t, when[name][0], when[name][1])));
    },
});
