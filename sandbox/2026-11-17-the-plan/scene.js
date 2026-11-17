// 2026-11-17-the-plan · style blueprint
// «The Plan»: a perfect plan in red pencil over a bank's blueprint, carried out on it by
// three numbered marks. White is the building (and moves by itself), red is the plan. One
// sheet of six drawings (roof, ground floor, basement, section, axonometric, detail C), cut
// on the beat between close and wide framings of it. Every time and place is from bank.js.
const DIR = 'sandbox/2026-11-17-the-plan/';
// the edit: [from, to, name, framing at the start, at the end] with a framing [x, y, zoom] on
// the sheet, or { track } for a shot that follows the guard or a mark. Cuts on the half second
// (120 BPM).
const ALL = [478, 266, 1.86], WEST = [384, 240, 2.1], CLOCK = [172, 90, 5], AXON = [2560, 935, 1.25];
const EDIT = [
    [0, 2, 'Grid', [300, 190, 3.0], [325, 200, 2.9]],
    [2, 3.5, 'Stair', [700, 180, 3.2], [690, 186, 3.1]],
    [3.5, 5, 'Ground floor', ALL, [478, 266, 1.9]],
    [5, 6, 'Roof', [1960, 278, 1.86], [1964, 280, 1.9]],
    [6, 7, 'Basement', [478, 1108, 1.86], [478, 1106, 1.9]],
    [7, 8.5, 'Three levels', AXON, [2560, 935, 1.3]],
    [8.5, 9.5, 'Camera', [470, 392, 3.6], [462, 388, 3.5]],
    [9.5, 11, 'Guard', { track: 'guard', dx: -34, dy: 14, z: 3.4 }],
    [11, 12, 'The night runs', ALL, [474, 266, 1.9]],
    [12, 13, 'In', [236, 374, 3.4], [240, 368, 3.4]],
    [13, 14.5, 'Aisle', [244, 332, 3.3], [244, 262, 3.3]],
    [14.5, 16, 'Four seconds', [252, 238, 3.2], [300, 230, 3.2]],
    [16, 17, 'Store', [345, 188, 3.8], [349, 186, 3.8]],
    [17, 19, 'The plan', ALL, [478, 266, 1.9]],
    [19, 20.5, 'Clock', CLOCK, [172, 90, 5.2]],
    [20.5, 22.5, 'They are in', [244, 374, 3.3], [244, 338, 3.3]],
    [22.5, 24, 'West', WEST, [384, 238, 2.14]],
    [24, 25.5, 'Blind corner', [236, 264, 3.4], [240, 258, 3.4]],
    [25.5, 26, 'Clock', [172, 90, 5.2], [172, 90, 5.2]],
    [26, 28.5, 'Crossing', { track: 'mark0', dx: 52, dy: -6, z: 3.2 }],
    [28.5, 30.5, 'The door', [338, 206, 3.8], [342, 200, 3.8]],
    [30.5, 31.5, 'Safe', WEST, [384, 240, 2.12]],
    [31.5, 33, 'He stops', [492, 392, 3.8], [486, 384, 3.6]],
    [33, 34.5, 'Revision B', [420, 300, 2.5], [404, 290, 2.5]],
    [34.5, 35.5, 'Struck out', [430, 258, 3.6], [426, 260, 3.7]],
    [35.5, 36.5, 'Duct', [372, 180, 4.2], [376, 184, 4.4]],
    [36.5, 38.5, 'Down', [2600, 880, 1.7], [2600, 1030, 1.7]],
    [38.5, 40.5, 'Section', [430, 672, 2.3], [430, 690, 2.3]],
    [40.5, 42, 'Lobby', [470, 1070, 2.6], [492, 1070, 2.6]],
    [42, 43, 'The empty store', [345, 190, 3.8], [345, 186, 3.9]],
    [43, 44.5, 'The wheel', [1400, 470, 3.4], [1400, 470, 3.6]],
    [44.5, 45, 'A bolt', [1470, 498, 6], [1466, 496, 6]],
    [45, 46.5, 'It opens', [1330, 474, 2.2], [1342, 474, 2.2]],
    [46.5, 48, '0412', [1440, 484, 4.2], [1444, 484, 4.4]],
    [48, 49.5, 'Back', [482, 1040, 2.6], [452, 1040, 2.6]],
    [49.5, 51, 'Up', [2600, 1040, 1.7], [2600, 830, 1.7]],
    [51, 53, 'Out', [1792, 240, 2.4], [1760, 236, 2.4]],
    [53, 56, 'Revision', [1412, 1180, 3.2], [1412, 1182, 3.4]],
];
// when each group is drafted: [from, to] in seconds
const WHEN = {
    'pl.grid': [0.1, 0.8], 'pl.outer': [0.4, 2.0], 'pl.parts': [1.4, 2.4], 'pl.poche': [1.9, 2.8], 'pl.doors': [2.0, 2.9], 'pl.fix': [2.1, 3.6],
    'pl.below': [3.3, 3.8], 'pl.names': [3.5, 4.5], 'pl.marks': [3.9, 4.6], 'pl.title': [4.2, 4.8],
    'rf.out': [4.3, 5.2], 'rf.tone': [5.0, 5.5], 'rf.fix': [5.0, 5.9], 'rf.names': [5.5, 6.0], 'rf.title': [5.6, 6.0],
    'ba.out': [5.3, 6.3], 'ba.tone': [6.0, 6.6], 'ba.fix': [6.1, 6.9], 'ba.over': [6.3, 6.9], 'ba.names': [6.5, 7.0], 'ba.title': [6.6, 7.0],
    'ax.ties': [7.8, 8.4], 'ax.names': [7.9, 8.5], 'ax.title': [8.0, 8.5],
    'ck.box': [8.0, 8.6], 'def.cams': [8.4, 9.0], 'def.beat': [9.0, 10.4], 'rev.beat': [32.6, 34.2], 'rev.note': [33.7, 34.4],
    // drafted before they are shown
    'pj.down': [6, 7], 'se.cut': [6, 7], 'se.tone': [6, 7], 'se.duct': [6, 7], 'se.hall': [6, 7], 'se.lobby': [6, 7], 'se.earth': [6, 7], 'se.names': [6, 7], 'se.levels': [6, 7], 'se.title': [6, 7],
    'ex.notes': [5, 7], 'ex.legend': [5, 7], 'ex.north': [5, 6], 'ex.detail': [5, 7], 'ex.detailTitle': [6, 7], 'tb.frame': [5, 6], 'tb.text': [6, 8], 'tb.revA': [8, 8.5],
    'tb.revB': [53.2, 54.2], 'tb.revCell': [54.0, 54.5],
    // the pencil
    'r.in': [12.1, 12.9], 'r.a': [13.0, 14.0], 'r.wait': [13.9, 14.4], 'r.b': [14.5, 15.5], 'r.gap': [15.4, 15.9], 'r.store': [16.1, 16.8],
    'r.c': [17.0, 18.3], 'r.stair': [18.2, 18.8], 'r.strike': [34.5, 35.0], 'r.q': [35.0, 35.4], 'r.duct': [35.5, 36.4],
    'r.ax.down': [36.7, 38.2], 'r.boxC': [47.0, 47.5], 'r.numC': [47.4, 47.9], 'r.b.box': [47.0, 47.5], 'r.b.num': [47.4, 47.9], 'r.b.away': [48.0, 48.9],
    'r.ax.up': [49.6, 50.8], 'r.r.out': [51.2, 52.1], 'r.r.note': [52.0, 52.4], 'r.tick': [54.6, 55.0],
};
Motion.scene({
    fps: 24,
    duration: 56,
    logical: [1600, 900],
    bpm: 120,
    uses: ['styles/blueprint/blueprint.js', DIR + 'bank.js', DIR + 'plan.js', DIR + 'defences.js', DIR + 'section.js', DIR + 'levels.js', DIR + 'extras.js', DIR + 'pencil.js'],
    fonts: [{ family: 'RoutedGothic', src: 'fonts/RoutedGothic.ttf' }, { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' }],
    shots: [[0, 2, 'Grid'], [2, 3.5, 'Stair'], [3.5, 5, 'Ground floor'], [5, 6, 'Roof'], [6, 7, 'Basement'], [7, 8.5, 'Three levels'], [8.5, 9.5, 'Camera'], [9.5, 11, 'Guard'], [11, 12, 'The night runs'],
        [12, 13, 'In'], [13, 14.5, 'Aisle'], [14.5, 16, 'Four seconds'], [16, 17, 'Store'], [17, 19, 'The plan'], [19, 20.5, 'Clock'], [20.5, 22.5, 'They are in'], [22.5, 24, 'West'], [24, 25.5, 'Blind corner'],
        [25.5, 26, 'Clock'], [26, 28.5, 'Crossing'], [28.5, 30.5, 'The door'], [30.5, 31.5, 'Safe'], [31.5, 33, 'He stops'], [33, 34.5, 'Revision B'], [34.5, 35.5, 'Struck out'], [35.5, 36.5, 'Duct'],
        [36.5, 38.5, 'Down'], [38.5, 40.5, 'Section'], [40.5, 42, 'Lobby'], [42, 43, 'The empty store'], [43, 44.5, 'The wheel'], [44.5, 45, 'A bolt'], [45, 46.5, 'It opens'], [46.5, 48, '0412'],
        [48, 49.5, 'Back'], [49.5, 51, 'Up'], [51, 53, 'Out'], [53, 56, 'Revision']],

    setup(env) {
        const mk = () => Blueprint.drawing({ u: 0.62 });
        const W = { ground: mk(), section: mk(), basement: mk(), roof: mk(), axon: mk(), extras: mk() }; // white
        const R = { ground: mk(), basement: mk(), roof: mk(), axon: mk(), extras: mk() }; // red
        Film.plan(W.ground); Film.defences(W.ground); Film.section(W.section); Film.basement(W.basement); Film.roof(W.roof); Film.axon(W.axon); Film.extras(W.extras);
        Film.pencilGround(R.ground); Film.pencilBasement(R.basement); Film.pencilRoof(R.roof); Film.pencilAxon(R.axon); Film.pencilDetail(R.extras);
        for (const L of [...Object.values(W), ...Object.values(R)]) for (const name of L.groups.keys()) if (!WHEN[name]) throw new Error('no time for ' + name);
        const B = Bank, [SW, SH] = B.SHEET;
        // a framing kept on the sheet
        const fit = ([x, y, z]) => [Math.max(800 / z, Math.min(SW - 800 / z, x)), Math.max(450 / z, Math.min(SH - 450 / z, y)), z];
        const tracked = (s, t) => {
            const p = s.track === 'guard' ? B.guardAt(t) : B.markAt(+s.track.slice(4), t);
            return fit([B.px(p.x) + s.dx, B.py(p.y) + s.dy, s.z]);
        };
        // the camera at t, and the part of the sheet its shot ever shows (the paper is painted for that)
        const shots = EDIT.map(([a, b, name, A, Z]) => {
            const at = (t) => { if (A.track) return tracked(A, t); const u = (t - a) / (b - a), fa = fit(A), fz = fit(Z); return fa.map((v, i) => v + (fz[i] - v) * u); };
            let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, zm = 0;
            for (let i = 0; i <= 12; i++) { const [x, y, z] = at(a + ((b - a) * i) / 12); x0 = Math.min(x0, x - 800 / z); x1 = Math.max(x1, x + 800 / z); y0 = Math.min(y0, y - 450 / z); y1 = Math.max(y1, y + 450 / z); zm = Math.max(zm, z); }
            x0 = Math.max(0, Math.floor(x0 - 3)); y0 = Math.max(0, Math.floor(y0 - 3)); x1 = Math.min(SW, Math.ceil(x1 + 3)); y1 = Math.min(SH, Math.ceil(y1 + 3));
            return { a, b, name, at, view: [x0, y0, x1 - x0, y1 - y0], zm };
        });
        return { W, R, shots };
    },

    draw(g, t, env) {
        const E = Ease, B = Bank, { px, py, sz, TM, S } = B, { W, R, shots } = env.state, DC = B.STRONG, PI = Math.PI;
        const shot = shots.find((s) => t >= s.a && t < s.b) ?? shots[shots.length - 1];
        const [cx, cy, zoom] = shot.at(Math.min(t, shot.b - 1e-6));
        const reveal = (name) => { const [a, b] = WHEN[name], u = E.seg(t, a, b); return 0.6 * u + 0.4 * E.inOut(u); };
        // which drawings this frame shows (the others are not painted)
        const fx0 = cx - 800 / zoom, fx1 = cx + 800 / zoom, fy0 = cy - 450 / zoom, fy1 = cy + 450 / zoom;
        const sees = (x, y, w, h) => x < fx1 && x + w > fx0 && y < fy1 && y + h > fy0;
        const on = { ground: sees(30, 20, 900, 520), section: sees(30, 530, 1020, 330), basement: sees(90, 930, 800, 410), roof: sees(1560, 80, 830, 460), axon: sees(2280, 560, 800, 760), extras: sees(950, 60, 660, 640) || sees(1250, 1080, 330, 200) };
        const gd = B.guardAt(t), marks = [0, 1, 2].map((i) => B.markAt(i, t));
        const BT = [0, B.BY - B.PY], RT = [B.RX - B.PX, 0]; // where the basement and roof plans lie on the sheet
        const open = E.inOut(E.seg(t, 7.0, 7.9)); // the three levels come apart
        const AXL = { roof: B.axon('roof', open), ground: B.axon('ground', open), basement: B.axon('basement', open) };
        const wheel = E.inOut(E.seg(t, ...TM.wheel)) * PI * 4.4, bolts = E.inOut(E.seg(t, ...TM.bolts)), swing = E.inOut(E.seg(t, ...TM.swing)), boxes = E.seg(t, 45.6, 46.9);
        // a level in the axonometric: its lines only (no names, no dimensions, nothing of the night)
        const plate = (name) => (/^(pl\.(grid|names|marks|title|below)|ck\.|def\.|rev\.|ba\.(names|title|over)|rf\.(names|title))/.test(name) ? 0 : reveal(name));
        // a mark in the axonometric: on its level's plate, or between two of them in the riser
        const axPt = (mk) => {
            if (mk.at === 'riser') { const z0 = B.L[0].zf, zg = 0.22, zr = B.Z.roofTop + 0.22, lo = mk.z < zg, f = lo ? (mk.z - z0) / (zg - z0) : (mk.z - zg) / (zr - zg), a = (lo ? AXL.basement : AXL.ground).pt(...B.RISER), b = (lo ? AXL.ground : AXL.roof).pt(...B.RISER); return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; }
            return AXL[mk.at === 'basement' ? 'basement' : mk.at === 'roof' ? 'roof' : 'ground'].pt(mk.x, mk.y);
        };
        Blueprint.frame(g, env, { cam: [cx, cy, zoom], zoomMax: shot.zm, paper: { w: B.SHEET[0], h: B.SHEET[1], view: shot.view, folds: { x: [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875], y: [1 / 3, 2 / 3] }, seed: 'bank' } }, (ink) => {
            if (on.ground) {
                // rev. A's beat fades once rev. B is drawn: superseded
                W.ground.paint(ink, reveal, { alpha: (name) => (name === 'def.beat' ? 1 - 0.72 * E.seg(t, 33.6, 34.6) : 1) });
                // the night runs: sectors sweep, the guard walks his beat, the clock counts
                B.CAMS.forEach((c, i) => Film.sector(ink, c, t, E.seg(t, 8.7 + i * 0.2, 9.3 + i * 0.2)));
                const gOn = E.seg(t, 9.3, 9.6);
                if (gOn > 0) Film.token(ink, px(gd.x), py(gd.y), { nose: gd.h, on: gOn, w: 1.15 });
                Film.clock(ink, t, E.seg(t, 8.5, 8.8));
            }
            if (on.section) {
                W.section.paint(ink, reveal);
                Film.token(ink, px(gd.x), sz(0.27), { w: 1.15, hidden: gd.inStore });
                Film.door(ink, px(DC.door), sz(DC.cz), S, { wheel, bolts, open: swing, inside: (c) => Film.boxes(c, px(DC.door), sz(DC.cz), S, boxes) });
            }
            if (on.basement) { ink.save(); ink.translate(...BT); W.basement.paint(ink, reveal); Film.leaf(ink, swing); ink.restore(); }
            if (on.roof) { ink.save(); ink.translate(...RT); W.roof.paint(ink, reveal); ink.restore(); }
            if (on.axon) {
                for (const [lv, L] of [['basement', W.basement], ['ground', W.ground], ['roof', W.roof]]) { ink.save(); ink.transform(...AXL[lv].m); L.paint(ink, plate, { tip: false, weight: 1.7 }); if (lv === 'basement') Film.leaf(ink, swing); ink.restore(); }
                W.axon.paint(ink, reveal);
            }
            if (on.extras) {
                W.extras.paint(ink, reveal);
                const dc = Film.DETAIL;
                Film.door(ink, dc.x, dc.y, dc.k, { lw: 1.5, wheel, bolts, open: swing, inside: (c) => Film.boxes(c, dc.x, dc.y, dc.k, boxes) });
            }
        }, (pen) => {
            const label = (i) => ({ label: String(i + 1), font: 'Hand', w: 1.35 });
            if (on.ground) {
                R.ground.paint(pen, reveal);
                marks.forEach((mk, i) => {
                    const set = E.seg(t, 18.5 + i * 0.25, 19.0 + i * 0.25), l = B.L[i];
                    if (set > 0 && (mk.at === 'ground' || mk.at === 'store' || t < l.tAtDuct + 0.3)) { const p = B.markAt(i, Math.min(t, l.tAtDuct)); Film.token(pen, px(p.x), py(p.y), { ...label(i), on: set, scale: 1 - E.seg(t, l.tAtDuct, l.tAtDuct + 0.3) }); }
                });
            }
            if (on.section) marks.forEach((mk, i) => { if (mk.at !== 'gone' && mk.at !== 'roof' && mk.at !== 'ground') Film.token(pen, px(mk.x), sz(mk.z + 0.05), { ...label(i), hidden: mk.at === 'store' || (mk.at === 'riser' && mk.z > B.LOBBY.grille) }); });
            if (on.basement) {
                pen.save(); pen.translate(...BT); R.basement.paint(pen, reveal);
                marks.forEach((mk, i) => { if (mk.at === 'basement') Film.token(pen, px(mk.x), py(mk.y), { ...label(i), scale: E.seg(t, B.L[i].tGrille, B.L[i].tGrille + 0.3) * (1 - E.seg(t, B.L[i].tBack - 0.15, B.L[i].tBack + 0.1)) }); });
                pen.restore();
            }
            if (on.roof) {
                pen.save(); pen.translate(...RT); R.roof.paint(pen, reveal);
                marks.forEach((mk, i) => { if (mk.at === 'roof') Film.token(pen, px(mk.x), py(mk.y), { ...label(i), scale: E.seg(t, B.L[i].tRoof, B.L[i].tRoof + 0.25) * (1 - E.seg(t, B.L[i].tOff - 0.3, B.L[i].tOff)) }); });
                pen.restore();
            }
            if (on.axon) {
                pen.save(); pen.transform(...AXL.ground.m); R.ground.paint(pen, reveal, { tip: false, weight: 1.5 }); pen.restore();
                R.axon.paint(pen, reveal);
                marks.forEach((mk, i) => { if (mk.at !== 'gone' && t > 18.5) { const [x, y] = axPt(mk); Film.token(pen, x, y, { r: 0.42, w: 1.2, ...{ label: String(i + 1), font: 'Hand' }, scale: 0.5 }); } });
            }
            if (on.extras) {
                R.extras.paint(pen, reveal);
                const dc = Film.DETAIL;
                marks.forEach((mk, i) => {
                    const l = B.L[i], X = dc.x + (mk.x - DC.door) * dc.k, near = E.seg(X, dc.x - 3.68 * dc.k, dc.x - 3.4 * dc.k) * (1 - E.seg(t, l.tAway + 0.15, l.tAway + 0.5));
                    if (mk.at === 'basement' && near > 0 && mk.z < B.Z.base + 0.5) Film.token(pen, X, dc.y + (DC.cz - mk.z - 0.05) * dc.k, { label: String(i + 1), font: 'Hand', scale: near, w: 2.3, r: (0.27 * dc.k) / S, cap: 0.95 });
                });
            }
        });
    },
});
