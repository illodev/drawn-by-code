// 2026-11-17-blueprint-test · style blueprint
// The sheet of a lighthouse drafts itself in the order a draughtsman would set it out:
// axis and ground, the elevation from the ground up, the section, the details, the lettering.
// Authored in the reference still's pixels (1280 × 720), painted through K = 1.25 onto the
// 1600 × 900 frame.
const DIR = 'sandbox/2026-11-17-blueprint-test/';
// when each group of the drawing is drafted: [from, to] in seconds
const PLAN = {
    'el.axis': [0.1, 0.9], 'el.ground': [0.4, 1.0], 'el.outL': [0.8, 2.5], 'el.outR': [0.8, 2.5], 'el.bands': [2.1, 2.7], 'el.corbels': [2.4, 3.0], 'el.rail': [2.7, 3.3],
    'el.lantern': [2.9, 3.6], 'el.dome': [3.3, 3.9], 'el.windows': [2.5, 3.1], 'el.house': [2.2, 3.2], 'el.joinery': [3.0, 3.8], 'el.yard': [3.2, 3.7],
    'el.courses': [3.0, 4.7], 'el.stone': [3.5, 4.7], 'el.shade': [4.1, 5.0], 'el.terrace': [3.6, 4.4], 'el.rocks': [3.9, 5.5], 'el.dims': [4.7, 5.6], 'el.title': [5.2, 5.8],
    'se.axis': [5.1, 5.7], 'se.ground': [5.3, 5.8], 'se.found': [5.6, 6.2], 'se.walls': [5.8, 6.9], 'se.hatch': [6.4, 7.6], 'se.foundHatch': [6.4, 7.2], 'se.reveals': [6.8, 7.2],
    'se.floors': [6.8, 7.3], 'se.stair': [7.0, 8.4], 'se.lantern': [7.3, 8.1], 'se.house': [7.5, 8.1], 'se.earth': [7.2, 8.4], 'se.rock': [7.8, 8.6], 'se.levels': [8.1, 9.1], 'se.title': [8.7, 9.2],
    'op.axis': [8.9, 9.3], 'op.lens': [9.1, 10.5], 'op.dims': [10.3, 10.9], 'op.title': [10.7, 11.1],
    'pl.axis': [9.7, 10.1], 'pl.circles': [9.9, 10.7], 'pl.detail': [10.5, 11.1], 'pl.dims': [11.0, 11.4], 'pl.title': [11.2, 11.6],
    'si.north': [9.5, 10.1], 'si.coast': [9.7, 11.1], 'si.lines': [10.7, 11.3], 'si.title': [11.1, 11.6],
    'sb.bar': [10.9, 11.6], 'tb.frame': [11.2, 11.7], 'tb.text': [11.5, 12.4],
};
// the camera over the sheet, in the still's pixels: [t, [x, y, zoom]]. It starts close on the
// ground line, rises and widens with the tower, crosses to the section and pulls back to the
// whole sheet for the details and the lettering
const CAM = [[0, [424, 462, 1.6]], [0.8, [424, 462, 1.6]], [3.6, [562, 345, 1.14]], [5.0, [562, 345, 1.14]], [6.6, [718, 345, 1.14]], [8.7, [718, 345, 1.14]], [10.4, [640, 360, 1]], [14, [640, 360, 1]]];
Motion.scene({
    fps: 24,
    duration: 14,
    logical: [1600, 900],
    uses: ['styles/blueprint/blueprint.js', DIR + 'lighthouse.js', DIR + 'elevation.js', DIR + 'trace-rocks.js', DIR + 'rocks.js', DIR + 'trace-coast.js', DIR + 'trace-slope.js', DIR + 'section.js', DIR + 'details.js'],
    fonts: [{ family: 'RoutedGothic', src: 'fonts/RoutedGothic.ttf' }],
    shots: [[0, 14, 'Sheet']],

    setup(env) {
        const D = Blueprint.drawing({ u: 0.8 });
        for (const part of Sheet.parts) Sheet[part](D);
        for (const name of D.groups.keys()) if (!PLAN[name]) throw new Error('no time for ' + name);
        return { D };
    },

    draw(g, t, env) {
        const K = 1.25, E = Ease;
        const [cx, cy, zoom] = Motion.keys(CAM, t);
        const reveal = (name) => { const [a, b] = PLAN[name], u = E.seg(t, a, b); return 0.6 * u + 0.4 * E.inOut(u); };
        Blueprint.frame(g, env, { cam: [cx * K, cy * K, zoom], zoomMax: 1.6, paper: { folds: { x: [0.505], y: [0.375, 0.614] }, seed: 'sheet-f' } }, (ink) => {
            ink.scale(K, K);
            env.state.D.paint(ink, reveal);
        });
    },
});
