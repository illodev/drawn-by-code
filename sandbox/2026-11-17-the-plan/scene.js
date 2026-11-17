// 2026-11-17-the-plan · style blueprint
// «The Plan»: a perfect plan in red pencil over a bank's blueprint, carried out on it by
// three numbered marks. One sheet, one camera, no cuts. White is the building (and moves by
// itself), red is the plan. Every time and place comes from bank.js.
const DIR = 'sandbox/2026-11-17-the-plan/';
// when each group is drafted: [from, to] in seconds. White first, then red.
const WHEN = {
    'pl.grid': [0.2, 1.1], 'pl.outer': [0.8, 2.6], 'pl.parts': [2.2, 3.4], 'pl.poche': [3.0, 4.2], 'pl.doors': [3.6, 4.8], 'pl.fix': [4.2, 6.6],
    'pl.below': [5.8, 6.6], 'pl.names': [6.2, 7.6], 'pl.marks': [6.8, 7.6], 'pl.title': [7.0, 7.8],
    'ck.box': [7.8, 8.6], 'def.cams': [8.2, 9.3], 'def.beat': [9.2, 11.2], 'rev.beat': [39.4, 42.4], 'rev.note': [41.6, 42.8],
    // the section, set out from the plan in a few seconds
    'pj.down': [47.5, 49.0], 'se.cut': [48.6, 49.9], 'se.tone': [49.5, 50.6], 'se.duct': [49.3, 50.3], 'se.hall': [49.6, 51.0], 'se.lobby': [49.9, 51.1],
    'se.earth': [50.6, 51.8], 'se.names': [51.0, 52.2], 'se.levels': [51.4, 52.6], 'se.title': [52.0, 52.8],
    // off the frame until the end
    'ex.notes': [8, 12], 'ex.legend': [10, 14], 'ex.north': [9, 10], 'ex.detail': [12, 14], 'ex.detailTitle': [14, 15], 'tb.frame': [5, 6], 'tb.text': [6, 8.5], 'tb.revA': [8.5, 9],
    'tb.revB': [67.0, 68.3], 'tb.revCell': [68.0, 68.6],
    // the pencil
    'r.in': [15.2, 16.5], 'r.a': [16.4, 18.0], 'r.wait': [17.9, 18.5], 'r.b': [18.6, 20.4], 'r.gap': [20.2, 21.0], 'r.store': [21.0, 22.0],
    'r.c': [22.2, 24.2], 'r.stair': [24.0, 24.9], 'r.strike': [42.9, 43.7], 'r.q': [43.8, 44.3], 'r.duct': [46.2, 47.5],
    'r.boxC': [60.5, 61.2], 'r.numC': [61.1, 61.8], 'r.box': [60.5, 61.2], 'r.num': [61.1, 61.8], 'r.away': [62.6, 64.3], 'r.tick': [68.9, 69.3],
};
// the camera over the sheet: [t, [x, y, zoom]]. The plan; in on its west half while the pencil
// works and out again to see the whole plan; in for the crossing; down the projection lines to the
// section; across to detail C for the strong room's door; back to the riser for the line they
// leave by; the whole sheet
const WEST = [384, 240, 2.1], ALL = [478, 266, 1.86]; // the west half, where the plan is carried out; the whole plan
const CAM = [[0, [392, 222, 2.2]], [0.8, [392, 222, 2.2]], [6.2, ALL], [14.4, ALL], [16.4, WEST], [21.9, WEST], [23.6, ALL], [25.7, ALL], [27.6, WEST], [47, [388, 242, 2.1]],
    [50.2, [478, 656, 1.86]], [53.6, [482, 658, 1.9]], [55.7, [1208, 474, 2.06]], [61.9, [1212, 476, 2.1]], [63.9, [478, 652, 1.86]], [66.2, [478, 640, 1.86]], [69.4, [800, 450, 1]], [72, [800, 450, 1]]];
Motion.scene({
    fps: 24,
    duration: 72,
    logical: [1600, 900],
    uses: ['styles/blueprint/blueprint.js', DIR + 'bank.js', DIR + 'plan.js', DIR + 'defences.js', DIR + 'section.js', DIR + 'extras.js', DIR + 'pencil.js'],
    fonts: [{ family: 'RoutedGothic', src: 'fonts/RoutedGothic.ttf' }, { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
    shots: [[0, 72, 'Sheet']],

    setup(env) {
        const D = Blueprint.drawing({ u: 0.62 }), R = Blueprint.drawing({ u: 0.62 });
        Film.plan(D);
        Film.defences(D);
        Film.section(D);
        Film.extras(D);
        Film.pencil(R);
        for (const L of [D, R]) for (const name of L.groups.keys()) if (!WHEN[name]) throw new Error('no time for ' + name);
        return { D, R };
    },

    draw(g, t, env) {
        const E = Ease, B = Bank, { px, py, sz, TM, S } = B, { D, R } = env.state, DC = B.STRONG;
        const [cx, cy, zoom] = Motion.keys(CAM, t);
        const reveal = (name) => { const [a, b] = WHEN[name], u = E.seg(t, a, b); return 0.6 * u + 0.4 * E.inOut(u); };
        // rev. A's beat fades once rev. B is drawn: superseded
        const dim = (name) => (name === 'def.beat' ? 1 - 0.72 * E.seg(t, 41.5, 43) : 1);
        const below = E.seg(t, 49.8, 50.3); // the section is there to stand on
        const gd = B.guardAt(t);
        Blueprint.frame(g, env, { cam: [cx, cy, zoom], zoomMax: 2.2, paper: { folds: { x: [0.25, 0.5, 0.75], y: [0.5] }, seed: 'bank' } }, (ink) => {
            D.paint(ink, reveal, { alpha: dim });
            // the night runs: sectors sweep, the guard walks his beat, the clock counts
            B.CAMS.forEach((c, i) => Film.sector(ink, c, t, E.seg(t, 9.3 + i * 0.35, 10.3 + i * 0.35)));
            const gOn = E.seg(t, 10.6, 11.1);
            if (gOn > 0) Film.token(ink, px(gd.x), py(gd.y), { nose: gd.h, on: gOn, w: 1.15 });
            Film.clock(ink, t, E.seg(t, 8.5, 8.8));
            // the same guard in the section: along the hall, and through the store's door (hidden)
            if (below > 0) Film.token(ink, px(gd.x), sz(0.27), { on: below, w: 1.15, hidden: gd.inStore, nose: gd.inStore ? null : -Math.PI / 2 });
            // the strong room's door: in the section, where the marks work it, and in detail C
            const wheel = E.inOut(E.seg(t, ...TM.wheel)) * Math.PI * 4.4, bolts = E.inOut(E.seg(t, ...TM.bolts)), open = E.inOut(E.seg(t, ...TM.swing));
            Film.door(ink, px(DC.door), sz(DC.cz), S, { on: E.seg(t, 50.2, 51.6), wheel, bolts, open, inside: (c) => Film.boxes(c, px(DC.door), sz(DC.cz), S, E.seg(t, 58.4, 60.3)) });
            const dc = Film.DETAIL;
            Film.door(ink, dc.x, dc.y, dc.k, { on: E.seg(t, 12, 14.5), lw: 1.5, wheel, bolts, open, inside: (c) => Film.boxes(c, dc.x, dc.y, dc.k, E.seg(t, 58.4, 60.3)) });
        }, (pen) => {
            R.paint(pen, reveal);
            for (let i = 0; i < 3; i++) {
                const on = E.seg(t, 24.7 + i * 0.3, 25.2 + i * 0.3), l = B.L[i], label = String(i + 1);
                if (on <= 0) continue;
                // on the plan, until the riser takes it
                if (t < l.tAtDuct + 0.3) { const mk = B.markAt(i, Math.min(t, l.tAtDuct)); Film.token(pen, px(mk.x), py(mk.y), { on, label, font: 'Hand', w: 1.35, scale: 1 - E.seg(t, l.tAtDuct, l.tAtDuct + 0.3) }); }
                // in the section: dashed while it is behind the wall we look at
                const mk = B.markAt(i, t);
                if (below > 0 && (mk.in === 'hidden' || mk.in === 'section')) Film.token(pen, px(mk.x), sz(mk.z + 0.05), { on: below, label, font: 'Hand', w: 1.35, hidden: mk.in === 'hidden', scale: 1 - E.seg(t, l.tTop - 0.25, l.tTop) });
                // and in detail C, at its scale, while it stands at the door
                const dc = Film.DETAIL, X = dc.x + (mk.x - DC.door) * dc.k, near = E.seg(X, dc.x - 3.68 * dc.k, dc.x - 3.4 * dc.k) * (1 - E.seg(t, l.tAway + 0.15, l.tAway + 0.5));
                if (mk.in === 'section' && near > 0 && mk.z < B.Z.base + 0.5) Film.token(pen, X, dc.y + (DC.cz - mk.z - 0.05) * dc.k, { on: 1, scale: near, label, font: 'Hand', w: 2.3, r: 0.27 * dc.k / S, cap: 0.95 });
            }
        });
    },
});
