// Picture 8 · planes. The guitar of picture 1 broken into planes: a homage to the Cubism that
// a painter from Málaga began, in ochre, grey, umber, black and one blue, with combed wood
// grain, sand and pasted papers (things/planes.js). No existing work is copied.
//
// The order is a way back. First (stratum 1) the café table where the papers were pasted:
// the wall with its wallpaper, nailed up; a bottle and a glass of Málaga moscatel; the corner
// of a newspaper (ours) whose date is the painter's birthday and whose news is the full moon
// over the port, a guitar heard all night in the square where he was born, and a teacher who
// paints pigeons with his son. Then (stratum 2) the instrument comes apart under the full
// moon on the one blue, with the father's pigeon's wing beside it: its head and pegs, a
// malagueña's score, a ladder of frets, a second sound hole in the wrong place, the ace of
// coins of picture 1 torn in half. Then (stratum 3) the guitar is whole, for an instant, with
// the label of picture 1's maker pasted on its top, and last (the plate) its sound hole,
// black, into the forge's fire (picture 9).
//
// The guitar adds up only from one place: CSTAR, the camera position at which s3a is 1000
// away (focus). There the frame is s2c's body with its way through, and s3a, s3b and the
// plate seen through it; each piece is painted at the size that makes it register from
// CSTAR (K(off)): on s2c the top of the neck, the lower bout, the bridge and the strings'
// last run (outside the way through, soft at that instant); on s3a the left upper bout and
// the waist as planes and the strings over the end of the fingerboard; on s3b the right of
// the soundboard, the rosette and the end of the fingerboard round its round way through;
// on the plate the black of the sound hole. A moment before, the far pieces lie small inside
// the near ones; a moment after, the near ones have slid out past them. The strings jump
// plane to plane: s2c over the neck and to the bridge, s3a over the fingerboard, s3b over
// the soundboard (with the shadows of s3a's), the plate over the black ring.
//
// Every sheet is composed inside the window through which the bodies in front of it ever
// show it (s1a ±690 × 430, s1b ±800 × 520, s1c ±920 × 590, s2a ±560 × 390, s2b ±650 × 450,
// s2c ±800 × 510, s3a ±520 × 330, s3b ±620 × 400, plate ±530 × 370): nothing is painted
// where the camera never looks.
//
// Things to find (read at once / the deep one): the newspaper's date, «martes 25 de octubre»,
// and «núm. 1.881» (his birthday and year); the Plaza de la Merced; the pigeons painted with
// his son's help (his father, José Ruiz Blasco); the score's chords, A minor, G, F, E (the
// Andalusian cadence of a malagueña); a nail painted with its shadow (Braque's, the friend
// he began it with); the wallpaper and the combed grain (Braque was a house painter's son);
// sand in the paint; the ace of coins of picture 1; moscatel from the Montes de Málaga.
window.Tableau = window.Tableau || {};
Tableau.planes = (z0) => {
    const S = Souvenir, P = Planes, C = P.PAL, TAU = Math.PI * 2;
    const OFF = Tableau.planes.OFF, CSTAR = Tableau.planes.CSTAR, SG = Tableau.planes.SG;
    const K = (off) => (off - CSTAR) / 1000; // how much smaller than on screen a piece on `off` is painted
    const B = { x: -1200, y: -720, w: 2400, h: 1440 };
    const BOX = P.rect(B.x, B.y, B.w, B.h);
    const PB = { x: -900, y: -620, w: 1800, h: 1240 };
    // the middle and near sheets of a stratum are only ever seen through the way through of
    // the body before them: their windows are smaller than the frame (see the header)
    const MB = { x: -820, y: -530, w: 1640, h: 1060 };

    // ---------------------------------------------------------------- helpers
    // a body: the sheet cut into facets of the colours given (weights by repetition), each a
    // plane; tex(i, r, col) may give a texture and other options
    function body(g, poly, o) {
        const r = Motion.rng('body/' + o.seed), cells = P.facets(poly, { n: o.n ?? 30, seed: o.seed, min: o.min ?? 6000 });
        cells.forEach((c, i) => {
            const m = P.centroid(c), nz = S.noise2(m[0] * 0.0016, m[1] * 0.0016, S.seedOf(o.seed)) * 0.5 + 0.5;
            const col = o.colors[Math.floor((nz * 0.6 + r() * 0.4) * o.colors.length * 0.999)];
            const t = o.tex ? o.tex(i, r, col, c) : null;
            P.plane(g, c, { color: col, seed: o.seed + i, dir: (o.dir ?? -0.7) + (r() - 0.5) * 1.3, pent: r() < 0.18 ? [10 + r() * 14, -8 + r() * 16, (r() - 0.5) * 0.08] : null, ...(t ?? {}) });
            // a scrap pinned on some
            const area = Math.abs(P.area(c));
            r();
            if (o.extras !== false && area > 12000 && r() < 0.08) P.scrap(g, { x: m[0], y: m[1], w: 70 + r() * 50, h: 50 + r() * 40, rot: (r() - 0.5) * 0.5, seed: o.seed + 'sc' + i, kind: r() < 0.6 ? 'news' : 'score', torn: [1 + Math.floor(r() * 2)], pins: r() < 0.5 ? [[-20, -14]] : [] });
            // a patch of charcoal hatching in a corner of some of them
            if (r() < (o.hatch ?? 0.4)) {
                const v = c[Math.floor(r() * c.length)];
                P.hatch(g, c, { angle: [0.5, 1.1, -0.6, 2.0, 0.9][Math.floor(r() * 5)], at: [m[0] + (v[0] - m[0]) * 0.55, m[1] + (v[1] - m[1]) * 0.55], seed: o.seed + 'h' + i, len: 40 + r() * 50, gap: 5 + r() * 3, color: col === C.black || col === C.umberD ? '#c9bea4' : undefined, alpha: col === C.black ? 0.35 : 0.55 });
            }
        });
        return cells;
    }
    // long ruled lines across a sheet: the scaffolding the planes hang on
    function scaffold(g, seed, n, keepOut) {
        const r = Motion.rng('sca/' + seed);
        for (let i = 0; i < n; i++) {
            const a = [0, Math.PI / 2, 0.62, -0.62, 1.1][i % 5] + (r() - 0.5) * 0.1, c = [(r() - 0.5) * 2000, (r() - 0.5) * 1200], l = 260 + r() * 520;
            const p0 = [c[0] - (Math.cos(a) * l) / 2, c[1] - (Math.sin(a) * l) / 2], p1 = [c[0] + (Math.cos(a) * l) / 2, c[1] + (Math.sin(a) * l) / 2];
            if (keepOut && [0, 0.25, 0.5, 0.75, 1].some((u) => P.inPoly(keepOut, p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u))) continue;
            P.ruled(g, p0, p1, { w: 2.2 + r() * 1.6, alpha: 0.75, seed: seed + 'l' + i, over: [0, 0] });
        }
    }
    // the way through: cut clean, and the planes darkened and drawn round its edge
    function cutOpening(g, poly, seed) {
        g.save();
        g.globalCompositeOperation = 'destination-out';
        g.fillStyle = '#000';
        g.beginPath();
        S.trace(g, poly);
        g.fill();
        g.restore();
        g.save();
        g.globalCompositeOperation = 'source-atop';
        g.shadowColor = 'rgba(20,12,10,0.7)';
        g.shadowBlur = 26 * S.pxScale(g);
        g.strokeStyle = 'rgba(20,12,10,0.6)';
        g.lineWidth = 14;
        g.beginPath();
        S.trace(g, poly);
        g.stroke();
        g.restore();
        for (let i = 0; i < poly.length; i++) if (i % 2 === 0 || poly.length < 5) P.ruled(g, poly[i], poly[(i + 1) % poly.length], { w: 3, seed: seed + 'op' + i, over: [6, 40] });
    }
    const circleCut = (g, R) => {
        g.save();
        g.globalCompositeOperation = 'destination-out';
        g.fillStyle = '#000';
        g.beginPath();
        g.arc(0, 0, R, 0, TAU);
        g.fill();
        g.restore();
    };
    // a run of the guitar's outline (scaled by m) where pred holds, in order
    function run(m, pred) {
        const o = Guitar.outline(m), n = o.length;
        let start = -1;
        for (let i = 0; i < n; i++) if (pred(o[i]) && !pred(o[(i - 1 + n) % n])) start = i;
        const out = [];
        for (let k = 0, i = start; k < n && pred(o[i]); k++, i = (i + 1) % n) out.push(o[i]);
        return out;
    }
    // a crescent along a run of outline, w deep towards `c`
    function crescent(pts, w, c = [0, 0], taper = 0.75) {
        const inner = pts.map((p, k) => {
            const u = k / (pts.length - 1), f = 1 - taper * Math.pow(Math.abs(2 * u - 1), 2.5), d = Math.hypot(p[0] - c[0], p[1] - c[1]) || 1;
            return [p[0] + ((c[0] - p[0]) / d) * w * f, p[1] + ((c[1] - p[1]) / d) * w * f];
        });
        return [...pts, ...inner.reverse()];
    }
    // the six strings between screen heights y0 and y1 (CSTAR's screen units), painted on the
    // layer at `off`, where they lie on that layer
    function strings(g, off, y0, y1, o = {}) {
        const k = K(off), m = SG * k;
        for (let i = 0; i < 6; i++) {
            const a = [Guitar.stringX(i, y0 / SG) * m, y0 * k], b = [Guitar.stringX(i, y1 / SG) * m, y1 * k];
            P.stringSeg(g, a, b, i, { k: Math.max(1, m * 0.8), shadow: o.shadow ?? 0, only: o.only });
        }
    }
    // the fingerboard between two screen heights, as a ladder with its frets
    function board(g, off, y0, y1, o = {}) {
        const k = K(off), m = SG * k, fb = (gy) => (45 + (gy - Guitar.JOIN) * (6 / 483)) * m;
        const frets = [];
        for (let n = 1; n <= 19; n++) {
            const y = Guitar.fretY(n) * SG;
            if (y > y0 && y < y1) frets.push((y - y0) / (y1 - y0));
        }
        P.ladder(g, { axis: [[0, y0 * k], [0, y1 * k]], half: (u) => fb((y0 + (y1 - y0) * u) / SG), frets, seed: o.seed ?? 'board' + off, over: 10 * m, fh: 2.4 * m, castD: 6 * m });
    }
    const soundboard = () => ({ colors: [C.ochreL, C.ochre, C.ochreL, C.ochreD, C.ochreP], tex: (i, r) => ({ tex: i % 6 === 4 ? 'sand' : 'comb', texO: { dir: Math.PI / 2 + (r() - 0.5) * 0.3, color: C.umber, alpha: 0.6, density: 0.05, pitch: 2.6 + r() * 1.4, teeth: 7 + Math.floor(r() * 5), knots: r() < 0.5 ? 1 : 0, wave: 1.4 }, dir: Math.PI / 2 + (r() - 0.5) * 0.5 }) });
    const layer = (id, off, paint, o = {}) => ({ id: 'planes-' + id, z: z0 + off, box: o.box ?? MB, res: o.res, hole: o.hole, far: o.far ?? [0.18, 0.32], brush: o.brush ?? { amp: 0.035 }, paint });

    // ---------------------------------------------------------------- stratum 1 · the café table
    const O1 = [[-178, -192], [204, -170], [216, 152], [-194, 174]];
    const s1c = layer('table-wall', OFF.s1c, (g) => {
        body(g, BOX, { seed: 'wall', n: 56, colors: [C.greyL, C.grey, C.greyC, C.umber, C.grey, C.burnt, C.greyD, C.black, C.ochreD], tex: (i, r, col) => (i % 6 === 2 ? { tex: 'sand', texO: { density: 0.05 } } : i % 9 === 4 && col !== C.black ? { tex: 'dots', texO: { color: C.bone, pitch: 12 } } : i % 7 === 5 && (col === C.greyL || col === C.grey) ? { tex: 'marble' } : null) });
        scaffold(g, 'wall', 12, O1);
        P.wallpaper(g, { x: -640, y: -600, w: 196, h: 860, rot: 0.035, seed: 'wpA', pins: [[60, 70]] });
        P.wallpaper(g, { x: 660, y: -600, w: 160, h: 1400, rot: -0.055, seed: 'wpB', torn: [], pins: [[-60, 40], [50, 46]] });
        P.scrap(g, { x: 470, y: 330, w: 130, h: 150, rot: 0.08, seed: 'sc2', kind: 'ad', word: 'ANÍS', torn: [2, 3] });
        P.bottle(g, { x: -370, y: 340, s: 1.02, seed: 'bot' });
        P.nail(g, { x: -632, y: -566, size: 2.3, seed: 'nail' });
        cutOpening(g, O1, 'o1');
        S.tooth(g, B);
    }, { box: B, far: [0.2, 0.36] });
    const s1b = layer('table-papers', OFF.s1b, (g) => {
        // the table top, combed like wood, the glass on it
        const top = [[-830, 420], [-300, 392], [250, 470], [830, 404], [830, 540], [-830, 540]];
        P.plane(g, top, { color: C.ochre, seed: 'top', dir: 0.05, tex: 'comb', texO: { dir: 0.04, color: C.umberD, alpha: 0.55, pitch: 3, teeth: 9, knots: 2 }, lines: [0, 1, 2], shadeW: 90 });
        P.plane(g, [[212, -560], [262, -586], [300, 140], [224, 168]], { color: C.black, seed: 'np-sh', dir: -1.4, lines: 'all' });
        P.newspaper(g, { x: 238, y: -476, rot: 0.045, seed: 'brisa' });
        P.label(g, { x: -322, y: 150, s: 0.74, rot: -0.05, seed: 'moscatel', torn: [3, 4] });
        P.glass(g, { x: 430, y: 300, s: 1.15, seed: 'copa' });
        P.scrap(g, { x: -560, y: -330, w: 150, h: 96, rot: -0.12, seed: 'sc1', kind: 'news', pins: [[-62, -36]] });
        S.tooth(g, B);
    }, { far: [0.2, 0.36] });
    const s1a = layer('table-near', OFF.s1a, (g) => {
        P.plane(g, [[-830, -540], [-120, -540], [-250, -236], [-830, -150]], { color: C.black, seed: 'n-black', dir: -0.5, lines: [1, 2], tex: 'dots', texO: { color: C.ochreL, pitch: 17, r: 3.2 } });
        P.hatch(g, [[-830, -540], [-120, -540], [-250, -236], [-830, -150]], { angle: -0.6, at: [-330, -330], seed: 'n-bh', len: 110, gap: 9, w: 2.6, color: '#d8ccb0', alpha: 0.6 });
        P.plane(g, [[-830, -100], [-420, -70], [-360, 540], [-830, 540]], { color: C.grey, seed: 'n-grey', dir: -1.2, lines: [1], pent: [14, -10, 0.04] });
        P.plane(g, [[300, 336], [830, 282], [830, 540], [220, 540]], { color: C.ochreL, seed: 'n-board', dir: 0.15, tex: 'comb', texO: { dir: 0.12, color: C.umberD, alpha: 0.6, pitch: 3.6, teeth: 8, knots: 2 }, lines: [0, 3] });
        P.plane(g, [[400, -540], [830, -540], [830, -40], [560, -120]], { color: C.umber, seed: 'n-umber', dir: -0.4, lines: [2, 3], pent: [16, 12, 0.05] });
        P.plane(g, [[-330, 300], [60, 250], [110, 540], [-300, 540]], { color: C.greyD, seed: 'n-low', dir: 0.9, lines: [0, 1], tex: 'dots', texO: { color: C.ochreL, pitch: 13 } });
        P.stencil(g, 'CAFÉ', { x: -540, y: 236, rot: -0.07, size: 112, color: C.bone, seed: 'cafe' });
        P.hatch(g, [[-830, -100], [-420, -70], [-360, 540], [-830, 540]], { angle: 1.1, at: [-520, 420], seed: 'n-h', len: 90, gap: 8, w: 2.2 });
        S.tooth(g, MB);
    }, { far: [0.2, 0.36] });

    // ---------------------------------------------------------------- stratum 2 · the instrument apart
    const O2 = [[-236, -126], [40, -178], [240, -72], [210, 154], [-118, 174], [-254, 40]];
    const s2c = layer('apart-body', OFF.s2c, (g) => {
        const m = SG * K(OFF.s2c);
        body(g, BOX, { seed: 'apart', n: 60, colors: [C.umber, C.burnt, C.black, C.ochre, C.ochreD, C.greyD, C.grey, C.umber], tex: (i, r, col) => (i % 4 === 1 ? { tex: 'sand', texO: { density: 0.05 } } : col === C.grey || col === C.greyD ? { tex: i % 3 ? 'marble' : 'dots', texO: { color: C.bone, pitch: 11 } } : col === C.ochre || col === C.ochreD ? { tex: 'comb', texO: { dir: (r() - 0.5) * 0.4 + (r() < 0.5 ? 0 : Math.PI / 2), color: C.umberD, alpha: 0.55 } } : null) });
        scaffold(g, 'apart', 12, O2);
        // the lower bouts, as planes: a combed one in the light, a black one in shade
        g.save();
        g.beginPath();
        S.trace(g, Guitar.outline(m));
        g.clip();
        body(g, [[-300, 104], [300, 104], [300, 520], [-300, 520]], { seed: 'lower', n: 7, min: 9000, extras: false, ...soundboard() });
        g.restore();
        P.charcoal(g, run(m, ([x, y]) => y > 90), { w: 3.2, seed: 'lbc' });
        P.plane(g, crescent(run(m, ([x, y]) => x < -5 && y > 40), 50, [0, 300]), { color: C.ochre, seed: 'lbL', dir: 1.2, tex: 'comb', texO: { dir: 1.4, color: C.umber, alpha: 0.5 }, lines: null });
        P.plane(g, crescent(run(m, ([x, y]) => x > 5 && y > 40), 64, [0, 300]), { color: C.black, seed: 'lbR', dir: -1.2, lines: null });
        // a second sound hole, in the wrong place
        P.blackDisc(g, { x: -150, y: 318, r: 64 * m * 1.05, seed: 'hole2' });
        // what of the guitar lies outside the way through when it adds up: the neck above,
        // the bridge and the strings' last run below
        board(g, OFF.s2c, -720, Guitar.JOIN * SG, { seed: 'neck' });
        strings(g, OFF.s2c, -720, Guitar.JOIN * SG);
        P.bridge(g, { x: 0, y: 0, s: m, seed: 'puente' });
        strings(g, OFF.s2c, 236, (Guitar.BRIDGE.seat - 5) * SG, { shadow: 3 });
        // the one blue: the night, the full moon on it
        P.plane(g, [[176, -500], [700, -520], [720, -150], [430, -120], [228, -206]], { color: C.blue, under: C.blueD, seed: 'blue', dir: -0.5, colors: [C.blue, C.blue, P.tone(C.blue, 0.06), P.tone(C.blue, -0.08)], vary: 0.04, lines: [0, 1, 3] });
        P.moon(g, { x: 340, y: -300, r: 84, seed: 'luna' });
        P.plane(g, [[226, -246], [330, -196], [292, -128], [214, -170]], { color: C.ochre, seed: 'moonplane', dir: 0.4, lines: 'all' });
        P.score(g, { x: -566, y: -70, s: 0.86, rot: -0.06, seed: 'malaguena' });
        P.wing(g, { x: 566, y: -214, rot: -0.06, s: 0.5, seed: 'paloma' });
        cutOpening(g, O2, 'o2');
        S.tooth(g, B);
    }, { box: B, far: [0.16, 0.3] });
    const s2b = layer('apart-head', OFF.s2b, (g) => {
        P.plane(g, [[290, -96], [566, -116], [586, 236], [272, 256]], { color: C.umber, seed: 'cardbed', dir: -0.3, tex: 'sand', texO: { density: 0.06 } });
        P.plane(g, [[-650, -500], [-262, -520], [-228, -60], [-620, -20]], { color: C.ochreD, seed: 'headbed', dir: 1.1, tex: 'comb', texO: { dir: 1.2, color: C.umberD, alpha: 0.5 }, lines: [0, 2] });
        P.head(g, { x: -430, y: -128, rot: -0.2, s: 0.84, seed: 'clavijero' });
        P.card(g, { x: 404, y: 60, s: 1.04, rot: 0.18, tear: 0.3, seed: 'oros' });
        S.tooth(g, MB);
    }, { far: [0.16, 0.3] });
    const s2a = layer('apart-near', OFF.s2a, (g) => {
        P.plane(g, [[-660, 150], [-330, 168], [-360, 430], [-660, 430]], { color: C.burnt, seed: 'labelbed', dir: 0.4, tex: 'sand', texO: { density: 0.05 }, lines: [0, 1] });
        P.label(g, { x: -490, y: 296, s: 1.02, rot: -0.12, seed: 'moscatel2', torn: [6, 7] });
        const frets = [];
        for (let n = 0; n < 9; n++) frets.push(1 - Math.pow(2, -n / 12) * 0.95);
        P.ladder(g, { axis: [[226, -500], [660, -150]], half: (u) => 56 - u * 8, frets, seed: 'ladder', over: 24, fh: 4.6 });
        P.plane(g, [[350, 196], [660, 170], [660, 430], [330, 430]], { color: C.grey, seed: 'a-grey', dir: -0.9, lines: [0, 3], pent: [12, 8, -0.04] });
        P.stencil(g, 'CANTE', { x: 500, y: 336, rot: -0.06, size: 66, color: C.black, seed: 'cante', alpha: 0.8 });
        S.tooth(g, MB);
    }, { far: [0.16, 0.3] });

    // ---------------------------------------------------------------- stratum 3 · the guitar, whole for an instant
    const s3a = layer('whole-neck', OFF.s3a, (g) => {
        const m = SG * K(OFF.s3a);
        // the bouts' curves as planes
        g.save();
        g.beginPath();
        S.trace(g, Guitar.outline(m));
        g.clip();
        P.plane(g, [[-420, -420], [-96, -420], [-96, -152], [-206, -152], [-206, 104], [-420, 104]], { color: C.ochreL, seed: 'ubL', dir: Math.PI / 2 - 0.2, tex: 'comb', texO: { dir: Math.PI / 2 + 0.06, color: C.umber, alpha: 0.5, knots: 1 }, lines: [1, 2, 3, 4], shade: 3, light: 0 });
        g.restore();
        P.charcoal(g, run(m, ([x, y]) => x < -60 && y < 110 && y > -400), { w: 3.4, seed: 'ubLc' });
        P.plane(g, crescent(run(m, ([x, y]) => x > 2 && y > -20 && y < 300), 48, [0, 120]), { color: C.burnt, seed: 'waR', dir: 1.3, lines: null, tex: 'sand', texO: { density: 0.05 } });
        // the strings over the end of the fingerboard
        strings(g, OFF.s3a, -300, -Guitar.HOLE * SG - 6);
        S.tooth(g, MB);
    }, { far: [0.14, 0.26] });
    const s3b = layer('whole-top', OFF.s3b, (g) => {
        const k = K(OFF.s3b), m = SG * k, R = Guitar.HOLE * m, out = Guitar.outline(m);
        body(g, BOX, { seed: 'night', n: 48, extras: false, colors: [C.greyD, C.umber, C.black, C.grey, C.burnt, C.greyL, C.ochreD], tex: (i) => (i % 5 === 3 ? { tex: 'sand', texO: { density: 0.05 } } : null) });
        // the soundboard: the body's outline, cut into combed planes
        // (only its right and its middle: the left upper bout is on s3a, the lower bout on s2c)
        const frag = [[-262, -470], [520, -470], [520, 205], [-262, 205]];
        g.save();
        g.beginPath();
        S.trace(g, out);
        g.clip();
        body(g, frag, { seed: 'top', n: 18, min: 7000, extras: false, ...soundboard() });
        g.restore();
        P.charcoal(g, out.filter(([x, y]) => x > -40 && y < 260), { w: 3.4, seed: 'outline' });
        // the tap plate below the rosette, the maker's label of picture 1 pasted outside the
        // box, and a scrap of the newspaper
        P.golpeador(g, [[108, 160], [262, 126], [300, 300], [150, 334]], { seed: 'golpe' });
        P.scrap(g, { x: 212, y: -258, w: 132, h: 78, rot: 0.1, seed: 'etiqueta', kind: 'label', torn: [1] });
        P.scrap(g, { x: -196, y: 150, w: 110, h: 70, rot: -0.22, seed: 'sc5', kind: 'news', torn: [0, 3] });
        P.rosette(g, { r0: 70 * m, r1: 102 * m, seed: 'rosa', slip: 7 });
        board(g, OFF.s3b, Guitar.JOIN * SG, -66.5 * SG, { seed: 'boardend' });
        strings(g, OFF.s3b, Guitar.HOLE * SG + 8, 236, { shadow: 4 });
        // the shadows of the strings that run above, on s3a, over the end of the fingerboard
        strings(g, OFF.s3b, -300, -Guitar.HOLE * SG - 6, { shadow: 6, only: 'shadow' });
        // the hole drawn again, not where it is
        const ci = S.ellipse(38, -30, R * 1.32, R * 1.32, 80);
        P.charcoal(g, [...ci.slice(5, 80), ci[0]], { w: 2.6, seed: 'ci2', alpha: 0.8 });
        circleCut(g, R);
        g.save();
        g.globalCompositeOperation = 'source-atop';
        g.strokeStyle = 'rgba(16,10,8,0.7)';
        g.shadowColor = 'rgba(16,10,8,0.8)';
        g.shadowBlur = 16 * S.pxScale(g);
        g.lineWidth = 8;
        g.beginPath();
        g.arc(0, 0, R + 2, 0, TAU);
        g.stroke();
        g.restore();
        S.tooth(g, B);
    }, { box: B, hole: Guitar.HOLE * SG * K(Tableau.planes.OFF.s3b), far: [0.14, 0.26] });

    // ---------------------------------------------------------------- the plate · the sound hole
    const plate = layer('hole', OFF.plate, (g) => {
        const m = SG * K(OFF.plate), out = Guitar.outline(m);
        body(g, P.rect(PB.x, PB.y, PB.w, PB.h), { seed: 'room', n: 46, colors: [C.umber, C.black, C.greyD, C.burnt, C.grey, C.umberD], tex: (i) => (i % 4 === 0 ? { tex: 'sand', texO: { density: 0.04 } } : null) });
        // the top round the hole only: the rest of the guitar is in front
        const near = S.ellipse(30, 40, 640, 560, 9, 0.3);
        g.save();
        g.beginPath();
        S.trace(g, out);
        g.clip();
        body(g, near, { seed: 'plateTop', n: 18, min: 10000, extras: false, ...soundboard() });
        g.restore();
        P.charcoal(g, out.filter(([x, y]) => Math.hypot((x - 30) / 640, (y - 40) / 560) < 1 && x > 0), { w: 4, seed: 'pout' });
        P.scrap(g, { x: -400, y: 240, w: 150, h: 110, rot: 0.15, seed: 'sc6', kind: 'score' });
        P.golpeador(g, [[200, 260], [400, 220], [440, 420], [240, 460]], { seed: 'golpeP', n: 120 });
        P.rosette(g, { r0: 186, r1: 102 * m, seed: 'rosa2', slip: 10 });
        board(g, OFF.plate, Guitar.JOIN * SG, -192 / K(OFF.plate), { seed: 'boardP' });
        P.blackDisc(g, { r: 182, seed: 'boca' });
        strings(g, OFF.plate, -900 / K(OFF.plate), 330, { shadow: 6 });
        circleCut(g, Tableau.planes.hole);
        S.tooth(g, PB);
    }, { box: PB, hole: Tableau.planes.hole, far: [0.12, 0.22] });

    return [s1a, s1b, s1c, s2a, s2b, s2c, s3a, s3b, plate];
};
// depths of the sheets from z0; the camera position (from z0) at which the guitar adds up;
// the guitar's size on screen then, in picture 1's units
Tableau.planes.OFF = { s1a: 0, s1b: 140, s1c: 290, s2a: 760, s2b: 900, s2c: 1050, s3a: 1420, s3b: 1560, plate: 2100 };
Tableau.planes.CSTAR = 420;
Tableau.planes.SG = 1.53;
Tableau.planes.depth = 2100;
Tableau.planes.hole = 150;

// Round 7 · the world as ONE stratum of loose things (stratum-brief.md), in the format of the
// film's first passage. The body (far sheet) is the papier collé itself: scumbled planes of
// ochre, grey, umber and black, combed wood, sand, marble, dots, wallpaper strips and torn
// news and music pasted over one another at all angles, stopping round an irregular gap.
// On it, and on the two sheets in front, the things whole, each on a cut-out plane with its
// shadow: far, the full moon on the one blue, the glass, the torn ace of coins, a wallpaper
// strip with its painted nail, «CAFÉ» stencilled on a black plane; middle, the guitar's
// body in planes (to one side, its sound hole a small black disc), the bottle with its
// MOSCATEL label, the corner of «LA BRISA», the pigeon's wing to find; near, the head with
// its pegs, the «MALAGUEÑA» score and the ladder of frets, cut by the frame.
//   Tableau.planes.stratum(z) → three layers, the middle one at z
Tableau.planes.stratum = (z) => {
    const S = Souvenir, P = Planes, C = P.PAL;
    const box = { x: -1200, y: -720, w: 2400, h: 1440 };
    // a cut-out plane for a thing to lie on, with its shadow painted as paint of its own (on a
    // transparent sheet `cast` has nothing to fall on)
    function bed(g, pts, o = {}) {
        const [dx, dy] = P.shadeDir(g), k = S.pxScale(g), BIG = 20000, d = o.d ?? 14;
        g.save();
        g.setTransform(g.getTransform().translate(-BIG, 0));
        g.shadowColor = o.shadow ?? 'rgba(16,10,8,0.55)';
        g.shadowBlur = (o.blur ?? 16) * k;
        g.shadowOffsetX = BIG * k + dx * d * k;
        g.shadowOffsetY = dy * d * k;
        P.fill(g, pts, '#000');
        g.restore();
        if (o.color) P.plane(g, pts, { cast: false, seed: o.seed, dir: o.dir ?? -0.5, color: o.color, tex: o.tex, texO: o.texO, lines: o.lines, colors: o.colors });
    }
    const layer = (id, dz, paint) => ({ id: 'planes-s-' + id, z: z + dz, box, brush: { amp: 0.035 }, paint(g) {
        paint(g);
        S.tooth(g, box);
    } });
    return [
        layer('far', 150, (g) => {
            P.collage(g, { box, seed: 'stratum', gap: [430, 300], n: 130, size: 320 });
            // the corner of «LA BRISA» at the top, its corner pinned by the painted nail
            P.newspaper(g, { x: 70, y: -704, s: 0.8, rot: 0.05, seed: 's-brisa' });
            P.nail(g, { x: 84, y: -690, size: 2.2, seed: 's-nail' });
            // the one blue, and the full moon on it, to the right
            const blue = P.quad(450, -170, 300, 250, 0.12, 22);
            bed(g, blue, { color: C.blue, seed: 's-blue', colors: [C.blue, C.blue, P.tone(C.blue, 0.06), P.tone(C.blue, -0.08)], lines: [0, 2] });
            P.moon(g, { x: 446, y: -176, r: 96, seed: 's-luna' });
            // «CAFÉ» on a black plane, top left
            bed(g, P.quad(-300, -410, 360, 124, -0.08, 14), { color: C.black, seed: 's-cafe', lines: [0, 2] });
            P.stencil(g, 'CAFÉ', { x: -300, y: -383, rot: -0.08, size: 80, color: C.bone, seed: 's-cafe' });
            // low down: the glass on a grey plane, the pigeon's wing to find; the torn ace of coins
            bed(g, P.quad(70, 330, 200, 280, 0.08, 10), { color: C.greyL, seed: 's-glassbed', tex: 'marble' });
            P.glass(g, { x: 66, y: 410, s: 1.0, seed: 's-copa' });
            P.wing(g, { x: -170, y: 360, rot: 0.1, s: 0.44, seed: 's-paloma' });
            P.card(g, { x: 340, y: 330, s: 1.0, rot: -0.16, tear: 0.28, seed: 's-oros' });
        }),
        layer('mid', 0, (g) => {
            // the guitar's body in planes, to the left
            bed(g, P.quad(-560, -10, 500, 760, 0.1, 30), { color: C.greyD, seed: 's-gbed', tex: 'dots', texO: { color: C.ochreL, pitch: 14 } });
            P.guitarPlanes(g, { x: -540, y: -40, s: 0.72, rot: -0.1, seed: 's-guitar' });
            // the bottle with its label, to the right
            bed(g, P.quad(560, 40, 250, 660, -0.08, 12), { color: C.ochre, seed: 's-bbed', tex: 'comb', texO: { dir: 1.5, color: C.umberD, alpha: 0.55 } });
            P.bottle(g, { x: 556, y: 340, s: 0.86, rot: -0.04, seed: 's-bot' });
            P.label(g, { x: 548, y: 196, s: 0.58, rot: -0.06, seed: 's-moscatel', torn: [3] });
        }),
        layer('near', -160, (g) => {
            bed(g, P.quad(-640, -470, 340, 600, -0.95, 30), { color: C.ochreD, seed: 's-hbed', tex: 'comb', texO: { dir: 1.1, color: C.umberD, alpha: 0.5 }, lines: [0, 2] });
            P.head(g, { x: -440, y: -300, rot: -0.95, s: 1.45, seed: 's-clavijero' });
            bed(g, [[440, 236], [860, 280], [830, 760], [400, 760]], { d: 8, blur: 10 });
            P.score(g, { x: 440, y: 236, s: 1.28, rot: 0.1, seed: 's-malaguena' });
            const frets = [];
            for (let n = 0; n < 10; n++) frets.push(1 - Math.pow(2, -n / 12) * 0.95);
            P.ladder(g, { axis: [[-960, 640], [-440, 340]], half: (u) => 74 - u * 10, frets, seed: 's-ladder', over: 30, fh: 6, castD: 0 });
        }),
    ];
};

// Round 8 · the world as LOOSE floating pieces (loose-brief.md): the papier collé taken off
// its sheets, every piece a thing of its own at its own depth in z ± 280, all round the
// axis, turning and drifting on its own. The heroes, one each, 330–930 from the axis and
// spread over every angle (clockwise from the right): the torn ace of coins; the bottle of
// moscatel with its label on its combed plane; the «MALAGUEÑA» score; a broken piece of the
// guitar's top with its rosette; the glass on its marble plane; «CAFÉ» stencilled on black;
// the father's pigeon's wing; the guitar's body in planes; the bridge with its tied strings
// on a sliver of the top; the corner of «LA BRISA» with the painted nail through it; the
// fingerboard as a ladder with its strings; the full moon on the one blue; the head with its
// pegs; a strip of wallpaper, nailed. Three small things to find: a fallen primary feather,
// a peg come off the head, a broken string curled up. The matter (the far sheet's collage
// of round 7) broken into 62 fragments: cut planes of every colour of the world, combed,
// sanded, marbled, dotted and hatched, each a card with its thickness; scraps of the news,
// the score, the labels and the wallpaper; letters cut out of the headline and stencilled;
// frets, pieces of the guitar's side with their binding, rosette arcs, strings across a
// plank, sound holes drawn twice, shards of the blue, coverts fallen from the wing.
//   Tableau.planes.loose(z) → one layer per piece, z − 280 … z + 280
Tableau.planes.loose = (z) => {
    const S = Souvenir, P = Planes, C = P.PAL, D2R = Math.PI / 180;
    const pol = (deg, R) => [Math.cos(deg * D2R) * R, Math.sin(deg * D2R) * R];
    const rotP = (x, y, rot) => [x * Math.cos(rot) - y * Math.sin(rot), x * Math.sin(rot) + y * Math.cos(rot)];
    const piece = (id, dz, cx, cy, hw, hh, paint, o = {}) => {
        const box = { x: cx - hw, y: cy - hh, w: hw * 2, h: hh * 2 };
        return { id: 'planes-l-' + id, z: z + dz, loose: o.loose ?? true, box, brush: { amp: 0.035 }, paint(g) {
            paint(g);
            P.glow(g, box);
            S.tooth(g, box);
        } };
    };
    const L = [];
    // ---------------------------------------------------------------- heroes
    const hero = (id, deg, R, dz, hw, hh, paint) => {
        const [x, y] = pol(deg, R);
        L.push(piece(id, dz, x, y, hw, hh, (g) => paint(g, x, y)));
    };
    hero('card', 10, 460, -40, 330, 330, (g, x, y) => P.card(g, { x, y, s: 1.6, rot: 0.28, tear: 0.26, seed: 'l-oros' }));
    hero('bottle', 36, 700, 210, 400, 500, (g, x, y) => {
        const rot = -0.22, at = (lx, ly) => {
            const [u, v] = rotP(lx, ly, rot);
            return [x + u, y + v];
        };
        const [fx, fy] = at(60, -40);
        P.fragment(g, { pts: P.cut(fx, fy, 290, 470, rot + 0.06, 'trap', 'l-bbed', 3), seed: 'l-bbed', color: C.ochre, tex: 'comb', texO: { dir: rot + 1.5, color: C.umberD, alpha: 0.55, knots: 1 }, lines: [0, 1] });
        const [bx, by] = at(-12, 270);
        P.bottle(g, { x: bx, y: by, s: 0.9, rot, seed: 'l-bot' });
        const [lx, ly] = at(-14, 80);
        P.label(g, { x: lx, y: ly, s: 0.64, rot: rot - 0.05, seed: 'l-moscatel', torn: [3] });
    });
    hero('score', 61, 760, 120, 380, 380, (g, x, y) => {
        const s = 1.05, rot = 0.14, [u, v] = rotP(-160 * s, -210 * s, rot);
        P.score(g, { x: x + u, y: y + v, s, rot, seed: 'l-malaguena' });
    });
    hero('rosette', 87, 500, -150, 330, 300, (g, x, y) => {
        // a broken piece of the top: an arc of the rosette, the edge of the sound hole
        const pts = P.cut(x, y, 390, 300, -0.3, 'penta', 'l-top', 2), c = [x - 90, y + 90];
        P.fragment(g, {
            pts, seed: 'l-top', color: C.ochreL, colors: [C.ochreL, C.ochreP, C.ochreL, C.ochre], dir: 1.4, tex: 'comb', texO: { dir: 1.5, color: C.umber, alpha: 0.5, pitch: 2.6, knots: 1 }, lines: [1, 3],
            on: (q) => {
                P.rosette(q, { cx: c[0], cy: c[1], r0: 96, r1: 142, seed: 'l-rosa', slip: 7 });
                P.blackDisc(q, { x: c[0], y: c[1], r: 89, seed: 'l-boca' });
                for (let i = 0; i < 6; i++) P.stringSeg(q, [c[0] - 46 + i * 15, c[1] - 360], [c[0] - 38 + i * 14, c[1] + 360], i, { shadow: 4, k: 1.2 });
            },
        });
    });
    hero('glass', 113, 580, 30, 320, 360, (g, x, y) => {
        P.fragment(g, { pts: P.cut(x + 36, y + 10, 280, 440, 0.1, 'penta', 'l-gbed'), seed: 'l-gbed', color: C.greyL, tex: 'marble', lines: [0, 2, 3] });
        P.glass(g, { x: x - 6, y: y - 22, s: 1.5, rot: 0.06, seed: 'l-copa' });
    });
    hero('cafe', 139, 860, -110, 360, 260, (g, x, y) => {
        const rot = -0.5, pts = P.cut(x, y, 500, 180, rot, 'quad', 'l-cafe', 2);
        P.fragment(g, { pts, seed: 'l-cafe', color: C.black, tex: 'dots', texO: { color: C.ochreL, pitch: 15, r: 2.6 }, lines: [0], on: (q) => P.overPlane(q, pts, [x + rotP(130, 0, rot)[0], y + rotP(130, 0, rot)[1]], rot + 1.3, { color: C.ochreD, seed: 'l-cafe2', tex: 'sand' }) });
        const [u, v] = rotP(-40, 40, rot);
        P.stencil(g, 'CAFÉ', { x: x + u, y: y + v, rot, size: 114, color: C.bone, seed: 'l-cafe' });
    });
    hero('wing', 164, 650, 170, 500, 400, (g, x, y) => P.wing(g, { x: x + 24, y: y - 110, s: 1.2, rot: -0.28, seed: 'l-paloma' }));
    hero('guitar', 194, 660, -10, 500, 520, (g, x, y) => P.guitarPlanes(g, { x, y, s: 0.78, rot: 0.42, neck: -330, seed: 'l-guitar' }));
    hero('bridge', 218, 880, 250, 330, 260, (g, x, y) => {
        const rot = 0.55, pts = P.cut(x, y, 440, 160, rot, 'sliver', 'l-br', 3);
        P.fragment(g, {
            pts, seed: 'l-br', color: C.ochre, colors: [C.ochreL, C.ochre, C.ochreP], dir: rot, tex: 'comb', texO: { dir: rot, color: C.umber, alpha: 0.55, pitch: 2.4 }, lines: [0],
            on: (q) => {
                q.save();
                q.translate(x, y);
                q.rotate(rot - Math.PI / 2);
                q.scale(1.2, 1.2);
                q.translate(0, -262);
                for (let i = 0; i < 6; i++) P.stringSeg(q, [Guitar.stringX(i, Guitar.SADDLE), 0], [Guitar.stringX(i, Guitar.SADDLE) * 0.9, 252], i, { shadow: 3 });
                P.bridge(q, { x: 0, y: 0, s: 1, seed: 'l-puente' });
                q.restore();
            },
        });
    });
    hero('news', 242, 760, -240, 380, 380, (g, x, y) => {
        const s = 0.86, rot = -0.14, [u, v] = rotP(-215 * s, -280 * s, rot);
        P.newspaper(g, { x: x + u, y: y + v, s, rot, seed: 'l-brisa' });
        const [nx, ny] = rotP(14 * s, 16 * s, rot);
        P.nail(g, { x: x + u + nx + 2, y: y + v + ny + 4, size: 1.5, seed: 'l-nail' });
    });
    hero('neck', 268, 480, 100, 400, 240, (g, x, y) => {
        // the fingerboard as a ladder, lying across the radius, its strings over it
        const t = [Math.cos(177 * D2R), Math.sin(177 * D2R)], n = [-t[1], t[0]], Lh = 320;
        const A = [x - t[0] * Lh, y - t[1] * Lh], B = [x + t[0] * Lh, y + t[1] * Lh], hw = (u) => 36 + u * 7;
        const frets = [];
        for (let k = 0; k < 9; k++) frets.push(1 - Math.pow(2, -k / 12) * 0.96 + 0.02);
        const P2 = (u, v) => [A[0] + (B[0] - A[0]) * u + n[0] * v, A[1] + (B[1] - A[1]) * u + n[1] * v];
        g.save();
        P.clip(g, [P2(-0.01, -50), P2(1.01, -50), P2(1.01, 50), P2(-0.01, 50)]);
        P.thick(g, [P2(0, -hw(0)), P2(0, hw(0)), P2(1, hw(1)), P2(1, -hw(1))], { d: 4 });
        P.ladder(g, { axis: [A, B], half: hw, frets, seed: 'l-ladder', over: 10, fh: 4, castD: 5 });
        // the nut at its end, bone, with its notches
        P.plane(g, [P2(-0.004, -hw(0) - 1), P2(0.02, -hw(0) - 1), P2(0.02, hw(0) + 1), P2(-0.004, hw(0) + 1)], { color: C.bone, seed: 'l-nut', lines: 'all', over: [0, 1], shade: null, light: null, cast: false });
        for (let i = 0; i < 6; i++) P.stringSeg(g, P2(0.005, (i - 2.5) * 11.5), P2(1, (i - 2.5) * 13), i, { shadow: 4, k: 1.3 });
        g.restore();
    });
    hero('moon', 294, 760, 60, 330, 310, (g, x, y) => {
        const pts = P.cut(x, y, 410, 350, 0.2, 'penta', 'l-blue', 4);
        P.fragment(g, { pts, seed: 'l-blue', color: C.blue, under: C.blueD, colors: [C.blue, C.blue, P.tone(C.blue, 0.06), P.tone(C.blue, -0.08)], lines: [0, 2], edge: '#1c2436', on: (q) => P.overPlane(q, pts, [x + 90, y + 135], 0.5, { color: C.ochre, seed: 'l-mplane', tex: 'comb', texO: { dir: 0.4, color: C.umberD, alpha: 0.5 } }) });
        P.moon(g, { x: x - 22, y: y - 20, r: 118, seed: 'l-luna' });
    });
    hero('head', 320, 580, -190, 380, 380, (g, x, y) => {
        const rot = 0.62, [u, v] = rotP(0, 150 * 1.05, rot);
        P.head(g, { x: x + u, y: y + v, rot, s: 1.05, seed: 'l-clavijero' });
    });
    hero('wallpaper', 345, 900, -70, 420, 420, (g, x, y) => {
        const rot = 1.35 + 0.08, [u, v] = rotP(0, -310, rot);
        P.wallpaper(g, { x: x + u, y: y + v, w: 170, h: 620, rot, seed: 'l-wp', torn: [2], pins: [] });
        const [nx, ny] = rotP(-30, 34, rot);
        P.nail(g, { x: x + u + nx, y: y + v + ny, size: 1.6, seed: 'l-nail2' });
    });
    // ---------------------------------------------------------------- things to find
    {
        const [x, y] = pol(228, 340);
        L.push(piece('feather', -270, x, y, 150, 150, (g) => P.quill(g, { x: x - 50, y: y - 30, a: 0.55, l: 128, w: 22, bend: 0.3, seed: 'l-quill' })));
    }
    {
        const [x, y] = pol(44, 340);
        L.push(piece('peg', 20, x, y, 110, 110, (g) => P.peg(g, { x: x - 55, y: y + 10, rot: -0.3, s: 0.9, seed: 'l-peg' })));
    }
    {
        const [x, y] = pol(302, 330);
        L.push(piece('string', 200, x, y, 110, 110, (g) => P.coil(g, { x, y, r: 30, i: 1, a: 0.7, seed: 'l-coil' })));
    }
    // ---------------------------------------------------------------- the matter
    const r = Motion.rng('planes-loose-matter');
    const pick = (list) => list[Math.floor(r() * list.length) % list.length];
    const kinds = [
        ...Array(31).fill('facet'), ...Array(9).fill('pasted'), 'news', 'news', 'score', 'score', 'ad', 'label', 'wall', 'wall', 'news',
        'letters', 'letters', 'letters', 'headline', 'headline', 'frets', 'frets', 'frets', 'rim', 'rim', 'rim', 'strings', 'strings', 'strings',
        'arc', 'arc', 'blue', 'blue', 'blue', 'disc', 'disc', 'covert', 'covert', 'covert', 'sketch', 'sketch', 'rim', 'strings', 'headline', 'letters',
    ];
    for (let i = kinds.length - 1; i > 0; i--) {
        const k = Math.floor(r() * (i + 1));
        [kinds[i], kinds[k]] = [kinds[k], kinds[i]];
    }
    const N = kinds.length;
    const FACET = [C.ochre, C.ochreL, C.ochreD, C.ochre, C.grey, C.greyL, C.greyC, C.greyD, C.umber, C.burnt, C.black, C.grey, C.ochreL];
    const texFor = (col) => {
        if (col === C.ochre || col === C.ochreL || col === C.ochreD) return r() < 0.65 ? { tex: 'comb', texO: { dir: r() * Math.PI, color: C.umberD, alpha: 0.55, knots: r() < 0.4 ? 1 : 0, pitch: 2.6 + r() * 1.2 } } : { tex: 'sand', texO: { density: 0.05 } };
        if (col === C.grey || col === C.greyL || col === C.greyC) return r() < 0.4 ? { tex: 'marble' } : r() < 0.5 ? { tex: 'dots', texO: { color: C.bone, pitch: 10 + r() * 5 } } : {};
        if (col === C.black) return r() < 0.6 ? { tex: 'dots', texO: { color: C.ochreL, pitch: 12 + r() * 5, r: 2.4 } } : {};
        return r() < 0.4 ? { tex: 'sand', texO: { density: 0.05 } } : {};
    };
    const WORDS = ['VINO', 'OLÉ', 'SOL', 'TINTO', 'ORO', 'DOS', 'LA', 'MAR'];
    const HEADS = ['LUNA', 'LLENA', 'PUERTO', 'BRISA', 'MÁLAGA'];
    for (let i = 0; i < N; i++) {
        const kind = kinds[i], seed = 'l-m' + i;
        const v = Math.pow((i + r() * 0.9) / N, 2.3);
        const sz = 85 + 115 * r(), deg = (i * 137.508 + (r() - 0.5) * 14) % 360;
        const R = Math.max(268 + sz * 0.62, 285 + 1215 * v), [x, y] = pol(deg, R);
        const dz = -272 + 544 * ((i * 0.6180339 + r() * 0.15) % 1), rot0 = r() * Math.PI * 2, rot = kind === 'letters' || kind === 'headline' ? (rot0 / Math.PI - 1) * 1.1 : rot0;
        let half = sz * 0.95 + 40, paint;
        const shape = pick(['shard', 'sliver', 'trap', 'penta', 'quad', 'penta', 'trap']);
        if (kind === 'facet' || kind === 'pasted' || kind === 'sketch') {
            const col = kind === 'sketch' ? pick([C.bone, C.greyL, C.ochreP]) : pick(FACET), w = sz * (0.85 + r() * 0.5), h = sz * (0.55 + r() * 0.55);
            half = Math.max(w, h) * 0.8 + 40;
            const tx = kind === 'sketch' ? {} : texFor(col), pts = P.cut(x, y, w, h, rot, shape, seed, r() < 0.25 ? 1 : -1), over = r(), hatch = r(), sub = r(), ang = r() * Math.PI, sk = pick(['news', 'score', 'ad']);
            const pent = r() < 0.2 ? [8, -6, 0.04] : null, col2 = pick(FACET.filter((c) => c !== col)), tx2 = texFor(C.grey), word = WORDS[(i * 7 + 2) % WORDS.length];
            paint = (g) => P.fragment(g, {
                pts, seed, color: col, ...tx, pent,
                on: (q) => {
                    if (over < 0.4) P.overPlane(q, pts, [x + Math.cos(ang) * w * 0.22, y + Math.sin(ang) * h * 0.22], ang, { color: col2, seed: seed + 'o', ...tx2 });
                    if (kind === 'pasted') P.scrap(q, { x: x + Math.cos(ang) * w * 0.25, y: y + Math.sin(ang) * h * 0.2, w: w * 0.6, h: h * 0.55, rot: rot + (sub - 0.5) * 0.8, seed: seed + 'p', kind: sk, word, torn: [1, 2], pins: sub < 0.5 ? [[-w * 0.2, -h * 0.15]] : [] });
                    if (kind === 'sketch') {
                        // a charcoal study of the guitar's curve, drawn twice, and its hatching
                        const o = Guitar.outline(sz / 520), off = [x - (o[20][0] ?? 0), y - (o[20][1] ?? 0)];
                        P.charcoal(q, o.slice(0, 60).map(([px, py]) => [px + off[0], py + off[1]]), { w: 2.6, seed: seed + 'c1' });
                        P.charcoal(q, o.slice(4, 56).map(([px, py]) => [px + off[0] + 9, py + off[1] - 6]), { w: 1.6, alpha: 0.55, seed: seed + 'c2' });
                        P.hatch(q, pts, { angle: 0.9, at: [x + w * 0.15, y + h * 0.1], seed: seed + 'h', len: sz * 0.4, gap: 5 });
                    } else if (hatch < 0.35) P.hatch(q, pts, { angle: ang + 0.8, at: [x - w * 0.2, y + h * 0.15], seed: seed + 'h', len: sz * 0.35, gap: 5 + hatch * 6, color: col === C.black || col === C.umber || col === C.burnt || col === C.greyD ? '#cfc3a8' : undefined, alpha: 0.55 });
                },
            });
        } else if (kind === 'news' || kind === 'score' || kind === 'ad' || kind === 'label') {
            const w = sz * (0.9 + r() * 0.3), h = sz * (0.6 + r() * 0.3), word = WORDS[(i * 3) % WORDS.length], pins = r() < 0.5 ? [[-w * 0.3, -h * 0.25]] : [];
            half = Math.max(w, h) * 0.75 + 30;
            paint = (g) => {
                P.thick(g, S.xf([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], { x, y, rot }), { d: 1.2, color: '#3b3125', core: 'rgba(0,0,0,0)' });
                P.scrap(g, { x, y, w, h, rot, seed, kind, word, torn: [1, 2], pins });
            };
        } else if (kind === 'wall') {
            const w = sz * 0.55, h = sz * 1.5, [u, v] = rotP(0, -h / 2, rot);
            half = h * 0.6 + 30;
            paint = (g) => P.wallpaper(g, { x: x + u, y: y + v, w, h, rot, seed, torn: [0, 2], pins: [] });
        } else if (kind === 'letters') {
            const col = pick([C.black, C.ochreD, C.greyD, C.burnt, C.bone]), word = WORDS[(i * 5 + 1) % WORDS.length], w = sz * (1.1 + r() * 0.3), h = sz * 0.55, pts = P.cut(x, y, w, h, rot, 'quad', seed, r() < 0.5 ? 1 : -1), tx = texFor(col);
            half = w * 0.6 + 40;
            paint = (g) => {
                P.fragment(g, { pts, seed, color: col, ...tx, lines: [0, 2] });
                const [u, v] = rotP(0, h * 0.2, rot);
                P.stencil(g, word, { x: x + u, y: y + v, rot, size: Math.min(h * 0.6, (w * 0.8) / (word.length * 0.6)), color: col === C.bone ? C.black : C.bone, seed: seed + 'st' });
            };
        } else if (kind === 'headline') {
            const w = sz * 1.1, h = sz * 0.44, text = pick(HEADS), hdx = (r() - 0.5) * w * 0.4, hdy = (r() - 0.5) * h * 0.3;
            half = w * 0.6 + 30;
            paint = (g) => P.headline(g, { x, y, rot, w, h, text, dx: hdx, dy: hdy, seed, torn: [1] });
        } else if (kind === 'frets') {
            const Lh = sz * 0.7, t = [Math.cos(rot), Math.sin(rot)], n = [-t[1], t[0]], hw = sz * 0.22, f0 = r() * 0.2, strung = [0, 1, 2, 3, 4, 5].map(() => r() < 0.7);
            const A = [x - t[0] * Lh, y - t[1] * Lh], B = [x + t[0] * Lh, y + t[1] * Lh], P2 = (u, vv) => [A[0] + (B[0] - A[0]) * u + n[0] * vv, A[1] + (B[1] - A[1]) * u + n[1] * vv];
            half = Lh + 40;
            paint = (g) => {
                g.save();
                P.clip(g, [P2(0, -hw - 18), P2(1, -hw - 18), P2(1, hw + 18), P2(0, hw + 18)]);
                P.thick(g, [P2(0, -hw), P2(0, hw), P2(1, hw), P2(1, -hw)], { d: 3.5 });
                P.ladder(g, { axis: [A, B], half: () => hw, frets: [0.2 + f0, 0.48 + f0 * 0.7, 0.72 + f0 * 0.3].filter((u) => u < 0.97), seed, over: 8, fh: 3.4, castD: 4 });
                for (let k = 0; k < 6; k++) if (strung[k]) P.stringSeg(g, P2(0, (k - 2.5) * hw * 0.3), P2(1, (k - 2.5) * hw * 0.3), k, { shadow: 3, k: 0.9 });
                g.restore();
            };
        } else if (kind === 'rim') {
            const s = sz / 260, f0 = r(), f1 = f0 + 0.09 + r() * 0.06;
            half = sz * 1.1 + 50;
            paint = (g) => P.rim(g, { x, y, s, rot, f0, f1, w: 26 + sz * 0.15, seed });
        } else if (kind === 'strings') {
            const w = sz * 1.2, h = sz * 0.5, pts = P.cut(x, y, w, h, rot, 'sliver', seed), n0 = 2 + Math.floor(r() * 4), col = pick([C.ochreL, C.ochre, C.greyD, C.black]), tx = texFor(col);
            half = w * 0.6 + 40;
            paint = (g) => P.fragment(g, {
                pts, seed, color: col, ...tx, lines: [1],
                on: (q) => {
                    const t = [Math.cos(rot + 0.15), Math.sin(rot + 0.15)], nn = [-t[1], t[0]];
                    for (let k = 0; k < n0; k++) {
                        const o = (k - (n0 - 1) / 2) * 11, c = [x + nn[0] * o, y + nn[1] * o];
                        P.stringSeg(q, [c[0] - t[0] * w, c[1] - t[1] * w], [c[0] + t[0] * w, c[1] + t[1] * w], (k + i) % 6, { shadow: 4, k: 1.2 });
                    }
                },
            });
        } else if (kind === 'arc') {
            const rr = sz * 0.75, span = 0.9 + r() * 0.5, a0 = rot, cxy = [x - Math.cos(a0 + span / 2) * rr, y - Math.sin(a0 + span / 2) * rr];
            const ring = [];
            for (let k = 0; k <= 12; k++) ring.push([cxy[0] + Math.cos(a0 + (span * k) / 12) * (rr + 28), cxy[1] + Math.sin(a0 + (span * k) / 12) * (rr + 28)]);
            for (let k = 12; k >= 0; k--) ring.push([cxy[0] + Math.cos(a0 + (span * k) / 12) * (rr * 0.62 - 12), cxy[1] + Math.sin(a0 + (span * k) / 12) * (rr * 0.62 - 12)]);
            half = rr + 70;
            paint = (g) => P.fragment(g, {
                pts: ring, seed, color: C.ochreL, colors: [C.ochreL, C.ochreP, C.ochre], tex: 'comb', texO: { dir: a0 + 1.6, color: C.umber, alpha: 0.5, pitch: 2.5 }, lines: [12, 25],
                on: (q) => P.rosette(q, { cx: cxy[0], cy: cxy[1], r0: rr * 0.68, r1: rr, seed: seed + 'r', slip: 5 }),
            });
        } else if (kind === 'blue') {
            const w = sz * (0.8 + r() * 0.4), h = sz * (0.6 + r() * 0.4), pts = P.cut(x, y, w, h, rot, shape, seed), moon = r() < 0.4;
            half = Math.max(w, h) * 0.8 + 40;
            paint = (g) => P.fragment(g, {
                pts, seed, color: C.blue, under: C.blueD, colors: [C.blue, P.tone(C.blue, 0.05), P.tone(C.blue, -0.08)], edge: '#1c2436', lines: 'some',
                on: (q) => {
                    if (moon) P.moon(q, { x: x + w * 0.42, y: y - h * 0.2, r: sz * 0.45, seed: seed + 'moon' });
                    else P.hatch(q, pts, { angle: rot + 0.7, seed: seed + 'h', len: sz * 0.3, gap: 6, color: '#a9b6cc', alpha: 0.4 });
                },
            });
        } else if (kind === 'disc') {
            const w = sz * 1.1, h = sz * 0.95, pts = P.cut(x, y, w, h, rot, 'penta', seed), col = pick([C.ochre, C.ochreL, C.greyL]), tx = texFor(col);
            half = w * 0.8 + 40;
            paint = (g) => P.fragment(g, {
                pts, seed, color: col, ...tx, lines: 'some',
                on: (q) => {
                    P.blackDisc(q, { x: x - w * 0.08, y, r: sz * 0.26, seed: seed + 'd' });
                    const ci = S.ellipse(x + sz * 0.06, y - sz * 0.05, sz * 0.34, sz * 0.34, 60);
                    P.charcoal(q, [...ci.slice(6), ci[0]], { w: 2.2, alpha: 0.8, seed: seed + 'ci' });
                },
            });
        } else if (kind === 'covert') {
            half = sz * 0.8 + 40;
            const l = sz * 0.85, bar = r() < 0.5;
            paint = (g) => P.quill(g, { x: x - Math.cos(rot) * l * 0.5, y: y - Math.sin(rot) * l * 0.5, a: rot, l, w: l * 0.36, bend: 0.2, kind: 'covert', bar, seed });
        }
        L.push(piece('m' + i + '-' + kind, dz, x, y, half, half, paint));
    }
    return L;
};
