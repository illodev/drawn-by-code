// Card «snowflake» (reference 13.375–13.5 s, full frame). A big six-armed dendrite flake with
// a yellow hexagon heart on a sky that runs navy → purple → pink → red, with ghost flakes in
// pink screen, a plate crystal (top left), a column crystal and a small yellow flake.
// Measured on the 13.38 s frame (px / 1.08 = units). Needs cards/_g6-util.js.
var CARDS = CARDS || {};
CARDS.snowflake = (press, t) => {
    const R = Riso, T = R.tone, U = G6;
    const pinkS = press.plate('pink', 'screen'), pink = press.plate('pink');
    const blueS = press.plate('blue', 'screen'), blue = press.plate('blue');
    const navyS = press.plate('navy', 'screen'), navy = press.plate('navy');
    const yellowS = press.plate('yellow', 'screen'), yellow = press.plate('yellow');
    const d = Math.floor(t * 12 + 1e-6);

    // sky: navy solid at the top, then blue and pink (purple), pink and navy, and the red floor
    // (pink + yellow). Coverages fitted on 90 px blocks; every ink on the reference's own
    // screen here: one 7.56 px lattice at 12° shared by all four inks, phase per drawing.
    const LS = [{ o: [-2.10, -1.06], a: [-1.5606, 7.3947], b: [7.3974, 1.5613] }, { o: [-3.50, -0.89], a: [-1.5602, 7.3950], b: [7.3974, 1.5611] }][Math.min(1, d)];
    const vr = (g, stops) => { const gr = g.createLinearGradient(0, 0, 0, 1000); stops.forEach(([y, v]) => gr.addColorStop(Math.min(1, y / 1080), T(v))); return gr; };
    navy.fillStyle = vr(navy, [[0, 0.95], [270, 0.93], [350, 0], [1080, 0]]); navy.fillRect(0, 0, 1000, 1000);
    U.lattice(navy, LS, (m) => { m.fillStyle = vr(m, [[0, 0], [450, 0.05], [600, 0.15], [720, 0.5], [810, 0.38], [900, 0.3], [1080, 0.38]]); m.fillRect(-20, -20, 1040, 1040); });
    U.lattice(blue, LS, (m) => { m.fillStyle = vr(m, [[0, 0.1], [270, 0.35], [360, 0.95], [500, 0.8], [630, 0.55], [720, 0.1], [1080, 0]]); m.fillRect(-20, -20, 1040, 1040); });
    U.lattice(pink, LS, (m) => { m.fillStyle = vr(m, [[0, 0.3], [270, 0.35], [360, 0.88], [450, 0.98], [520, 1], [1080, 1]]); m.fillRect(-20, -20, 1040, 1040); m.fillStyle = Riso.radial(m, 860, 160, 0, 330, 0.3, 0); m.fillRect(-20, -20, 1040, 600); }, { max: 0.995 });
    pink.fillStyle = vr(pink, [[0, 0], [380, 0], [460, 0.9], [520, 0.95], [1080, 0.95]]); pink.fillRect(0, 0, 1000, 1000);
    U.lattice(yellow, LS, (m) => { m.fillStyle = vr(m, [[0, 0], [740, 0], [810, 0.22], [900, 0.48], [1080, 0.65]]); m.fillRect(-20, -20, 1040, 1040); });

    // the upper sky is cloudy: soft darker navy mottling and a lighter purple drift (measured
    // at 2×: blotches 80–200 units across)
    { const rc = Motion.rng('snowcl'); for (let i = 0; i < 16; i++) { const x = rc() * 1000, y = rc() * 450, r = 60 + rc() * 110; navy.fillStyle = Riso.radial(navy, x, y, 0, r, 0.18 + 0.2 * rc(), 0); navy.beginPath(); navy.arc(x, y, r, 0, 7); navy.fill(); } }
    // dark navy blobs (shadows of the ghost flakes) top right
    navy.fillStyle = T(0.95);
    // (measured on a crop of the 13.38 s frame, px → units: three dark lumps between the ghost's
    // arms, ragged)
    for (const b of [[[590, 50], [680, 40], [745, 90], [735, 175], [660, 205], [600, 160]], [[800, 175], [900, 165], [960, 220], [950, 320], [860, 330], [805, 270]], [[900, 305], [1000, 290], [1045, 350], [1030, 440], [940, 440], [895, 380]]]) { U.smooth(navy, b.map(([x, y]) => [x / 1.08, y / 1.08])); navy.fill(); pink.save(); pink.globalCompositeOperation = 'destination-out'; pink.fillStyle = T(1); U.smooth(pink, b.map(([x, y]) => [x / 1.08, y / 1.08])); pink.fill(); pink.restore(); }

    // ghost flakes: big dendrite branches in dense pink screen (top right, bottom left)
    const ghost = (g, cx, cy, len, a0, w, seed) => {
        const r = Motion.rng('gh' + seed);
        for (let k = 0; k < 6; k++) {
            const a = a0 + (k * Math.PI) / 3, ex = cx + Math.cos(a) * len, ey = cy + Math.sin(a) * len;
            U.stroke(g, [[cx, cy], [ex, ey]], w, g.strokeStyle, 'butt');
            for (let j = 1; j <= 3; j++) {
                const f = 0.3 + j * 0.2, bx = cx + Math.cos(a) * len * f, by = cy + Math.sin(a) * len * f, bl = len * (0.42 - j * 0.09) * (0.8 + 0.4 * r());
                for (const s of [-1, 1]) U.stroke(g, [[bx, by], [bx + Math.cos(a + s * 1.0) * bl, by + Math.sin(a + s * 1.0) * bl]], w * 0.8, g.strokeStyle, 'butt');
            }
        }
    };
    // the ghosts are bright pink: the navy and blue screens are lifted where they print
    const ghosts = (g, w, v = 1) => {
        g.strokeStyle = T(v);
        // the top-right ghost (measured): arms from a hub off the right edge at (1040, 110) px,
        // one left along the top to (570, 50), one down-left to (760, 380), one down the right
        // edge to (1030, 470); ~70 px wide, stubby side branches
        { const hub = [1040 / 1.08, 110 / 1.08], r = Motion.rng('ghtr');
          for (const [ex, ey] of [[660, 40], [770, 350], [1010, 470], [1080, -60]]) {
              const e = [ex / 1.08, ey / 1.08], a = Math.atan2(e[1] - hub[1], e[0] - hub[0]), L = Math.hypot(e[0] - hub[0], e[1] - hub[1]);
              U.stroke(g, [hub, e], 52 * w, g.strokeStyle, 'butt');
              for (const f of [0.45, 0.75]) { const bx = hub[0] + Math.cos(a) * L * f, by = hub[1] + Math.sin(a) * L * f, bl = L * (0.28 - f * 0.18) * (0.8 + 0.4 * r()); for (const sg of [-1, 1]) U.stroke(g, [[bx, by], [bx + Math.cos(a + sg * 1.05) * bl, by + Math.sin(a + sg * 1.05) * bl]], 30 * w, g.strokeStyle, 'butt'); }
          } }
        ghost(g, 70, 900, 300, -1.57, 48 * w, 'b');
        g.fillStyle = T(v);
        for (const [x, y, rx, ry] of [[285, 505, 55, 42], [72, 640, 42, 62], [850, 650, 40, 28], [320, 775, 82, 62]]) { g.beginPath(); g.ellipse(x, y, rx, ry, 0.3, 0, 7); g.fill(); }
    };
    // (the navy lifts a little so the gaps between the coarse pink dots read violet)
    // coarse dots, bigger than the press screen (the ghost is out of focus); under each dot
    // the navy and blue are lifted so the pink is bright, the gaps stay dark
    const gdots = (m) => U.dots(m, [[560, 0, 1000, 560], [0, 560, 480, 1000], [740, 600, 900, 980]], 13.5, 6, 0.05);
    // one mask, two tones: a half tone over the whole ghost (so it reads over the pink floor
    // too) and full ink in the dots; pink goes on, navy and blue come off by the same amount
    U.masked([[pink], [navy, 'destination-out'], [blue, 'destination-out']], (m) => ghosts(m, 1), (m) => {
        gdots(m);
        m.globalCompositeOperation = 'destination-over'; ghosts(m, 1, 0.4);
    });
    // pale scratches on the bottom-left ghost (white lines knocked out)
    press.knockout((g) => { for (let i = 0; i < 7; i++) U.stroke(g, [[285 + i * 4, 770 + i * 5], [370 - i * 3, 755 + i * 7]], 1.3); });

    // stars: white specks knocked out, pink asterisks, a few yellow specks low
    press.knockout((g) => U.speckle(g, [0, 0, 1000, 1000], 220, 0.6, 2.2, 'snowst'));
    U.speckle(pink, [0, 0, 1000, 600], 70, 0.8, 2.2, 'snowps');
    { const bs = press.plate('blue'); press.knockout((g) => U.speckle(g, [0, 0, 1000, 500], 40, 0.8, 1.8, 'snowbs')); }
    const aster = (g, x, y, r, w) => { for (let k = 0; k < 3; k++) { const a = (k * Math.PI) / 3 + 0.2; U.stroke(g, [[x - Math.cos(a) * r, y - Math.sin(a) * r], [x + Math.cos(a) * r, y + Math.sin(a) * r]], w); } };
    for (const [x, y, r] of [[553, 162, 13], [615, 97, 9], [685, 90, 11], [460, 320, 9], [815, 330, 10], [885, 535, 12], [640, 18, 8], [995, 200, 10]]) aster(pink, x, y, r, 2.4);
    press.knockout((g) => { for (const [x, y, r] of [[73, 707, 12], [68, 815, 11], [645, 45, 9], [985, 205, 11], [663, 18, 7], [230, 20, 6]]) aster(g, x, y, r, 2.2); });
    U.speckle(yellow, [250, 850, 800, 1000], 18, 1, 3, 'snowy');

    // the big flake: six measured arms from the hexagon (553, 375)
    const C = [553, 375];
    const ends = [[856, 419], [662, 639], [380, 579], [278, 347], [430, 130], [731, 171]];
    const arms = ends.map(([x, y]) => { const dx = x - C[0], dy = y - C[1], L = Math.hypot(dx, dy); return { a: Math.atan2(dy, dx), L }; });
    const at = (a, L, f) => [C[0] + Math.cos(a) * L * f, C[1] + Math.sin(a) * L * f];
    // (measured at 2×: each arm is a tapered blade, ~20 units wide at the hexagon, 6 at the
    // tip, ending in a V fork; the side branches are plumes: thick at the base, tapering,
    // leaning outwards, the longest at mid-arm, each with one or two short twigs; a blue
    // shadow edge down one side of every piece)
    const fl = new Path2D();
    const addBlade = (x0, y0, x1, y1, w, bend) => { const q = U.blade(x0, y0, x1, y1, w, bend); q.forEach(([x, y], i) => (i ? fl.lineTo(x, y) : fl.moveTo(x, y))); fl.closePath(); };
    arms.forEach(({ a, L }, k) => {
        const r = Motion.rng('arm' + k), [sx, sy] = at(a, L, 0.1), [ex, ey] = at(a, L, 1);
        addBlade(sx, sy, ex, ey, 17, 0);
        const tip = at(a, L, 0.95);
        for (const sg of [-1, 1]) addBlade(tip[0], tip[1], tip[0] + Math.cos(a + sg * 0.7) * 26, tip[1] + Math.sin(a + sg * 0.7) * 26, 6, 0);
        for (const [f, bl, side] of [[0.4, 0.28, 1], [0.44, 0.25, -1], [0.62, 0.26, 1], [0.66, 0.24, -1], [0.82, 0.14, 1], [0.84, 0.13, -1]]) {
            const b0 = at(a, L, f), ba = a + side * (0.95 + 0.15 * r()), len = L * bl * (0.8 + 0.4 * r());
            const b1 = [b0[0] + Math.cos(ba) * len, b0[1] + Math.sin(ba) * len];
            addBlade(b0[0], b0[1], b1[0], b1[1], 16, side * 4);
            if (bl > 0.18) for (const [g2, s2] of [[0.45, -side], [0.7, side]]) { const q = [b0[0] + Math.cos(ba) * len * g2, b0[1] + Math.sin(ba) * len * g2], tl = len * 0.42; addBlade(q[0], q[1], q[0] + Math.cos(ba + s2 * 0.9) * tl, q[1] + Math.sin(ba + s2 * 0.9) * tl, 9, 0); }
        }
    });
    blue.save(); blue.translate(2.5, 3.5); blue.fillStyle = T(0.8); blue.fill(fl); blue.restore();
    press.knockout((g) => g.fill(fl));
    // a fine blue ridge line down each arm, off-centre
    arms.forEach(({ a, L }) => { const o = [Math.cos(a + 1.57) * 3, Math.sin(a + 1.57) * 3]; U.stroke(blue, [at(a, L, 0.15), at(a, L, 0.9)].map(([x, y]) => [x + o[0], y + o[1]]), 1.8, T(0.85)); });

    // the hexagon: yellow plate, a green inner hexagon (blue over yellow), bevel spokes
    const hex = (cx, cy, r, a0) => Array.from({ length: 6 }, (_, i) => [cx + Math.cos(a0 + (i * Math.PI) / 3) * r, cy + Math.sin(a0 + (i * Math.PI) / 3) * r]);
    const a0 = arms[0].a;
    press.knockout((g) => { U.path(g, hex(C[0], C[1], 47, a0)); g.fill(); });
    U.poly(yellow, hex(C[0], C[1], 46, a0), T(1));
    blue.save(); blue.lineWidth = 4.2; blue.strokeStyle = T(1); blue.lineJoin = 'round'; U.path(blue, hex(C[0], C[1], 30, a0)); blue.stroke();
    const hi = hex(C[0], C[1], 30, a0), ho = hex(C[0], C[1], 45, a0);
    blue.lineWidth = 1.8; for (let i = 0; i < 6; i++) { blue.beginPath(); blue.moveTo(...hi[i]); blue.lineTo(...ho[i]); blue.stroke(); }
    blue.restore();
    U.poly(yellowS, hex(C[0], C[1], 28, a0), T(0.3));

    // plate crystal (top left): a white octagonal plate with blue spokes and a web
    const P = [88, 171];
    const oct = Array.from({ length: 8 }, (_, i) => { const a = 0.3 + (i * Math.PI) / 4, rr = 78 * (i % 2 ? 0.95 : 1.02); return [P[0] + Math.cos(a) * rr, P[1] + Math.sin(a) * rr]; });
    // the plate: its rim is ragged, a spike out from every corner (measured: 8–14 units)
    const octR = []; oct.forEach(([x, y], i) => { const [x2, y2] = oct[(i + 1) % 8], a = Math.atan2(y - P[1], x - P[0]); octR.push([x + Math.cos(a) * 12, y + Math.sin(a) * 12], [x, y], [(x + x2) / 2 + (x2 - x) * 0.1, (y + y2) / 2 + (y2 - y) * 0.1]); });
    U.stroke(blue, octR.concat([octR[0]]).map(([x, y]) => [x + 2.5, y + 3]), 3, T(0.85));
    press.knockout((g) => { U.path(g, octR); g.fill(); });
    for (let i = 0; i < 6; i++) {
        const a = -1.35 + (i * Math.PI) / 3, rr = 98;
        U.stroke(blue, [[P[0] - Math.cos(a) * 12, P[1] - Math.sin(a) * 12], [P[0] + Math.cos(a) * rr, P[1] + Math.sin(a) * rr]], 2.4, T(0.9));
    }
    press.knockout((g) => { for (let i = 0; i < 6; i++) { const a = -1.35 + (i * Math.PI) / 3; g.beginPath(); g.ellipse(P[0] + Math.cos(a) * 100, P[1] + Math.sin(a) * 100, 8, 3.5, a, 0, 7); g.fill(); } });
    blue.save(); blue.strokeStyle = T(0.8); blue.lineWidth = 1.6;
    for (const rr of [22, 40, 58, 72]) { U.path(blue, Array.from({ length: 8 }, (_, i) => { const a = 0.3 + (i * Math.PI) / 4 + rr * 0.004; return [P[0] + Math.cos(a) * rr, P[1] + Math.sin(a) * rr]; })); blue.stroke(); }
    blue.restore();

    // column crystal (right): a white bar with end caps, blue outline and a centre line
    press.save();
    press.each((g) => { g.translate(852, 575); g.rotate(0.46); });
    press.knockout((g) => { g.fillRect(-52, -20, 104, 40); g.beginPath(); g.ellipse(-56, 0, 6, 52, 0, 0, 7); g.ellipse(56, 0, 6, 52, 0, 0, 7); g.fill(); });
    U.stroke(blue, [[-52, -20], [52, -20]], 1.6, T(0.9));
    U.stroke(blue, [[-52, 20], [52, 20]], 2.2, T(0.9));
    U.stroke(blue, [[-52, 4], [52, 4]], 1.4, T(0.7));
    U.stroke(blue, [[-58, -50], [-58, 50]], 2.2, T(0.9));
    U.stroke(blue, [[58, -50], [58, 50]], 2.2, T(0.9));
    press.restore();

    // the small flake (bottom right): creamy white (yellow screen) with a yellow heart
    const S = [935, 868], sl = 108;
    const small = [];
    for (let k = 0; k < 6; k++) {
        const a = -0.52 + (k * Math.PI) / 3, e = [S[0] + Math.cos(a) * sl, S[1] + Math.sin(a) * sl];
        small.push({ pts: [S, e], w: 7 });
        for (const [f, bl] of [[0.45, 0.32], [0.7, 0.26], [0.9, 0.12]]) {
            const b0 = [S[0] + Math.cos(a) * sl * f, S[1] + Math.sin(a) * sl * f];
            for (const s of [-1, 1]) small.push({ pts: [b0, [b0[0] + Math.cos(a + s) * sl * bl, b0[1] + Math.sin(a + s) * sl * bl]], w: 4.5 });
        }
    }
    press.knockout((g) => { for (const s of small) U.stroke(g, s.pts, s.w); U.path(g, hex(S[0], S[1], 38, -0.52)); g.fill(); });
    for (const s of small) U.stroke(yellowS, s.pts, s.w, T(0.4));
    for (let k = 0; k < 6; k++) { const a = -0.52 + (k * Math.PI) / 3; U.stroke(blue, [[S[0] + Math.cos(a) * 38, S[1] + Math.sin(a) * 38 + 1.5], [S[0] + Math.cos(a) * sl, S[1] + Math.sin(a) * sl + 1.5]], 1.6, T(0.8)); }
    U.poly(yellow, hex(S[0], S[1], 37, -0.52), T(0.85));
    U.poly(yellowS, hex(S[0], S[1], 37, -0.52), T(0.4));
    blue.save(); blue.lineWidth = 2.6; blue.strokeStyle = T(1); U.path(blue, hex(S[0], S[1], 24, -0.52)); blue.stroke(); blue.restore();

    // twinkle on twos: two stars pop
    if (d % 2) press.knockout((g) => { aster(g, 610, 95, 12, 2.6); aster(g, 460, 318, 10, 2.4); });
};
