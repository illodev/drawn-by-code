// Card «frogs» (reference 7.5–7.75 s, full frame): two frogs singing on a lily pad under a
// huge yellow moon, cattails and reeds, sound arcs. Authored in reference pixels (G2.px),
// measured on the 7.6 s frame. Separations: sky = navy (top) into pink dots (bottom); the
// moon = yellow with pink-dot maria (orange); frogs = yellow + blue (green) with navy dots
// on the back; sacs = yellow + pink dots; reeds = navy + yellow + blue (near black green).
// Per drawing: the sacs pump, the arcs grow, a green streak crosses the moon. Needs
// cards/_group2-util.js.
var CARDS = CARDS || {};
CARDS.frogs = (press, t) => {
    const { T, px, poly, disc, ell, ringS, fillWith, inside, blob, curve, taper, spline, speckle } = G2;
    const P = (ink, k) => press.plate(ink, k);
    const yellow = P('yellow'), yellowS = P('yellow', 'screen'), pink = P('pink'), pinkS = P('pink', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const d = Math.floor(t * 12 + 1e-6);
    const MX = 632, MY = 556, MRX = 428, MRY = 440; // the moon
    const moon = (g) => g.ellipse(MX, MY, MRX, MRY, 0, 0, 7);
    px(press, () => {
        // the sky: navy at the top thinning to dots, pink dots growing to near solid below
        const sky = (g, stops) => { const gr = g.createLinearGradient(0, 0, 0, 1080); for (const [p, v] of stops) gr.addColorStop(p, T(v)); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1080); };
        sky(navy, [[0, 1], [0.15, 0.9], [0.4, 0.35], [0.6, 0.08], [0.75, 0]]);
        sky(navyS, [[0, 0], [0.4, 0.12], [0.65, 0.3], [1, 0.28]]);
        // pink dots growing down the sky, printed clean: the navy is cleared under each dot
        const lerp = (st, y) => { for (let i = 1; i < st.length; i++) if (y <= st[i][0]) { const [a, va] = st[i - 1], [b, vb] = st[i]; return va + (vb - va) * (y - a) / (b - a); } return st[st.length - 1][1]; };
        const pd = (x, y) => lerp([[0, 0.1], [216, 0.2], [432, 0.6], [756, 0.85], [1080, 0.85]], y);
        G2.dots(pink, 0, 0, 1080, 1080, pd);
        sky(blue, [[0, 0.4], [0.3, 0.3], [0.5, 0.1], [0.7, 0]]);
        for (const g of [navy, blue]) { g.save(); g.globalCompositeOperation = 'destination-out'; G2.dots(g, 0, 0, 1080, 1080, (x, y) => pd(x, y) * 0.8); g.restore(); }
        sky(pink, [[0, 0], [0.3, 0.1], [0.45, 0.35], [0.7, 0.2], [1, 0.1]]);
        // the pink flecks in the navy (navy cleared under them so they print bright)
        for (const g of [navy, pink]) { if (g === navy) g.globalCompositeOperation = 'destination-out'; speckle(g, 'sky', 0, 0, 1080, 600, 900, 0.8, 2.2, 0.9); g.globalCompositeOperation = 'source-over'; }
        speckle(blue, 'skyb', 0, 0, 1080, 700, 60, 1.5, 3, 0.8);
        // the pink rings round the moon (some doubled)
        for (const [r, w] of [[492, 4], [548, 5], [560, 2.5], [612, 5], [676, 4.5], [690, 2.5], [746, 5]]) {
            navy.globalCompositeOperation = 'destination-out'; ringS(navy, MX, MY, r, w + 1, 1, Math.PI * 0.98, Math.PI * 2.02); navy.globalCompositeOperation = 'source-over';
            ringS(pink, MX, MY, r, w, 1, Math.PI * 0.98, Math.PI * 2.02);
        }
        // the moon: flat yellow, its edge a thin dark line, pink-dot maria (orange)
        press.knockout((g) => { g.beginPath(); moon(g); g.fill(); });
        fillWith(yellow, moon, T(1));
        inside(navy, moon, (g) => { g.lineWidth = 5; g.strokeStyle = T(0.45); g.beginPath(); g.ellipse(MX, MY, MRX, MRY, 0, 2.3, 4.2); g.stroke(); });
        inside(pinkS, moon, (g) => {
            g.filter = 'blur(14px)';
            for (const [pts, v] of [
                [[[300, 190], [470, 120], [660, 150], [690, 230], [620, 310], [520, 280], [420, 330], [300, 310]], 0.5],
                [[[200, 420], [290, 340], [370, 400], [400, 520], [330, 560], [300, 700], [390, 800], [300, 860], [210, 760], [190, 560]], 0.5],
                [[[930, 380], [1030, 360], [1070, 470], [1040, 590], [950, 580], [905, 470]], 0.5],
                [[[800, 595], [860, 590], [862, 655], [805, 660]], 0.55],
                [[[590, 420], [640, 400], [650, 440], [600, 450]], 0.2],
                [[[230, 560], [300, 600], [330, 760], [250, 800]], 0.35],
            ]) blob(g, pts, v);
            g.filter = 'none';
        });
        press.knockout((g) => speckle(g, 'moonw', 250, 150, 1050, 900, 40, 1, 2.2, 0.9));
        // a green streak across the moon (a dragonfly's flight), from the 2nd drawing
        if (d >= 1) {
            const k = Math.min(3, d) - 1, s0 = [[680 - k * 20, 145 + k * 25], [760 - k * 20, 180 + k * 30], [840 - k * 15, 245 + k * 30]];
            for (const g of [blue, navy]) taper(g, spline(s0, 16), 7, g === blue ? 1 : 0.5);
        }
        // the sound arcs: red (pink on the yellow), two fans that cross into a net
        const fan = (cx, cy, rs, a0, a1, w) => { for (const r of rs) { const pts = []; for (let i = 0; i <= 16; i++) { const a = a0 + (a1 - a0) * i / 16; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } taper(pink, pts, w, 1); } };
        const grow = [0, 12, 24][Math.min(2, d % 3)];
        fan(560, 1000, [220, 262, 304 + grow * 0.5], -1.3, -0.35, 6);
        fan(930, 990, [150, 195, 240 + grow * 0.5], -2.95, -2.05, 6);
        // the lily pads and the water: navy water, yellow reflections, dark green pads
        poly(navy, [[0, 1040], [1080, 1030], [1080, 1080], [0, 1080]], 0.8);
        poly(blue, [[0, 1040], [1080, 1030], [1080, 1080], [0, 1080]], 0.5);
        for (const [x0, x1, y] of [[480, 760, 1048], [560, 700, 1062], [900, 1060, 1044]]) { press.knockout((g) => curve(g, [[x0, y], [x1, y - 2]], 5, 1)); curve(yellow, [[x0, y], [x1, y - 2]], 5, 1); }
        // the reeds: near-black green blades and cattails (navy + yellow + blue)
        const reed = (pts, w) => { press.knockout((g) => taper(g, spline(pts, 20), w, 1)); for (const [g, v] of [[navy, 0.9], [yellow, 0.9], [blue, 0.6]]) taper(g, spline(pts, 20), w, v); };
        const stalk = (pts, w) => { press.knockout((g) => curve(g, pts, w, 1)); for (const [g, v] of [[navy, 0.9], [yellow, 0.9], [blue, 0.6]]) curve(g, pts, w, v); };
        const cattail = (x, y0, y1, w) => { press.knockout((g) => ell(g, x, (y0 + y1) / 2, w / 2, (y1 - y0) / 2, 0, 1)); for (const [g, v] of [[navy, 0.95], [yellow, 0.95], [blue, 0.5], [pinkS, 0.2]]) ell(g, x, (y0 + y1) / 2, w / 2, (y1 - y0) / 2, 0, v); };
        stalk([[62, 230], [60, 600], [52, 1080]], 9); cattail(68, 100, 230, 38); stalk([[68, 60], [68, 100]], 3);
        stalk([[190, 350], [176, 700], [160, 1080]], 9); cattail(192, 250, 355, 40); stalk([[194, 205], [192, 250]], 3);
        reed([[20, 1080], [30, 700], [15, 420]], 12);
        reed([[110, 1080], [140, 700], [210, 400], [255, 250]], 12);
        reed([[230, 1080], [240, 700], [252, 430]], 11);
        reed([[280, 900], [330, 700], [372, 515]], 8);
        reed([[130, 1080], [100, 800], [90, 640]], 8);
        stalk([[1000, 100], [1040, 500], [1072, 1080]], 8);
        cattail(1072, 350, 470, 34);
        reed([[1080, 1000], [1050, 700], [1020, 540]], 10);
        // a frog: green body (yellow + blue), navy dots on the back, a lit yellow edge,
        // eyes on top, a mouth line, the singing sac (yellow + pink dots, red rim)
        const frog = (o) => {
            const { x, y, s, sac } = o, fx = o.flip ? -1 : 1, X = (u) => x + u * s * fx, Y = (v) => y + v * s, Q = (p) => p.map(([u, v]) => [X(u), Y(v)]);
            const body = Q([[-330, 200], [-334, 100], [-300, 30], [-210, -32], [-80, -56], [40, -52], [100, -30], [114, 15], [92, 60], [20, 85], [-30, 200]]);
            press.knockout((g) => { g.beginPath(); G2.blobPath(g, body); g.fill(); });
            blob(yellow, body, 1); blob(blue, body, 1);
            // the back in shade: navy dots on the top half
            inside(navyS, (g) => G2.blobPath(g, body), (g) => { g.fillStyle = Riso.ramp(g, 0, Y(-60), 0, Y(60), 0.22, 0); g.fillRect(x - 400 * s, y - 60 * s, 600 * s, 330 * s); });
            // the lit belly and legs: blue as dots, not flat
            inside(blue, (g) => G2.blobPath(g, body), (g) => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = T(0.7); g.beginPath(); g.ellipse(X(-80), Y(210), 180 * s, 70 * s, -0.2 * fx, 0, 7); g.fill(); });
            inside(blueS, (g) => G2.blobPath(g, body), (g) => { g.fillStyle = T(0.55); g.beginPath(); g.ellipse(X(-80), Y(210), 180 * s, 70 * s, -0.2 * fx, 0, 7); g.fill(); });
            // the yellow rim of light along the back: blue kept only where the body shifted
            // down-right still covers (a lit crescent on the top-left edge), yellow flecks
            inside(blue, (g) => G2.blobPath(g, body), (g) => { g.globalCompositeOperation = 'destination-in'; g.fillStyle = T(1); g.beginPath(); G2.blobPath(g, body.map(([u, v]) => [u + 9 * s * fx, v + 11 * s])); g.fill(); });
            inside(blue, (g) => G2.blobPath(g, body), (g) => { g.globalCompositeOperation = 'destination-out'; speckle(g, 'fr' + x, X(-340), Y(-60), X(120), Y(200), 300 * s, 0.6, 1.2, 0.9); });
            // spots
            for (const [u, v, r] of o.spots) { disc(navy, X(u), Y(v), r * s, 0.9); disc(pink, X(u), Y(v), r * s, 0.5); disc(yellow, X(u), Y(v), r * s, 0.8); }
            // mouth, leg creases
            for (const g of [navy, pink]) curve(g, Q([[-50, 20], [20, 15], [80, 22], [114, 18]]), 7 * s, g === navy ? 0.9 : 0.4);
            for (const pts of o.creases) curve(navy, Q(pts), 5 * s, 0.85);
            // eyes: the far one (small, a dark ring) and the near one (big, red rim, pupil)
            const [ux, uy, fr] = o.far;
            ringS(navy, X(ux), Y(uy), fr * s, 7 * s, 0.9); ringS(pink, X(ux), Y(uy), fr * s, 7 * s, 0.5);
            inside(blue, (g) => g.arc(X(ux), Y(uy), fr * s - 3 * s, 0, 7), (g) => { g.globalCompositeOperation = 'destination-out'; g.fillRect(0, 0, 1080, 1080); });
            inside(navyS, (g) => g.arc(X(ux), Y(uy), fr * s - 3 * s, 0, 7), (g) => { g.globalCompositeOperation = 'destination-out'; g.fillRect(0, 0, 1080, 1080); });
            const [ex, ey, er] = o.eye;
            press.knockout((g) => { g.beginPath(); g.arc(X(ex), Y(ey), er * s, 0, 7); g.fill(); });
            disc(yellow, X(ex), Y(ey), er * s, 1);
            ringS(pink, X(ex), Y(ey), er * s - 3 * s, 7 * s, 1); ringS(navy, X(ex) + 2, Y(ey) + 2, er * s - 2 * s, 4 * s, 0.6, -0.3, 2.2);
            for (const [g, v] of [[navy, 1], [pink, 0.6], [yellow, 0.6]]) ell(g, X(ex + 2), Y(ey + 3), er * 0.52 * s, er * 0.33 * s, 0, v);
            press.knockout((g) => { g.beginPath(); g.ellipse(X(ex - 14), Y(ey - 12), 9 * s, 7 * s, -0.3, 0, 7); g.fill(); });
            // the sac
            const [sx, sy, sr] = sac;
            press.knockout((g) => { g.beginPath(); g.arc(sx, sy, sr, 0, 7); g.fill(); });
            disc(yellow, sx, sy, sr, 1);
            inside(pinkS, (g) => g.arc(sx, sy, sr, 0, 7), (g) => { g.fillStyle = Riso.radial(g, sx - sr * 0.35, sy - sr * 0.4, 0, sr * 1.3, 0.25, 0.75); g.fillRect(sx - sr, sy - sr, sr * 2, sr * 2); });
            ringS(pink, sx, sy, sr - 2, 5, 1, -1.2, 2.6); ringS(pink, sx, sy, sr - 2, 2.5, 0.8, 2.6, 5.1);
            press.knockout((g) => { g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.arc(sx, sy, sr * 0.78, -1.9, -1.1); g.stroke(); });
        };
        const pump = [0, 5, 9, 5][d % 4];
        frog({ x: 500, y: 890, s: 1, sac: [555, 1005, 56 + pump], eye: [-8, -52, 44], far: [-88, 10, 26],
            spots: [[-130, -24, 12], [-230, 20, 14], [-285, 150, 12], [-120, 55, 13], [-290, 20, 7]],
            creases: [[[-340, 70], [-200, 110], [-120, 130]], [[-80, 160], [-40, 180], [-10, 200]], [[-330, 270], [-230, 230], [-160, 190]]] });
        frog({ x: 929, y: 910, s: 0.62, flip: true, sac: [900, 990, 40 - pump * 0.5], eye: [-10, -52, 45], far: [-90, 24, 29],
            spots: [[-200, 10, 12], [-150, 60, 10]], creases: [[[-320, 100], [-220, 140], [-150, 150]]] });
        // the lily pad under them: dark green
        const pad = [[140, 1080], [180, 1050], [420, 1040], [640, 1052], [700, 1080]];
        for (const [g, v] of [[navy, 0.8], [yellow, 0.9], [blue, 0.8]]) poly(g, pad, v);
        const pad2 = [[820, 1080], [860, 1052], [1000, 1046], [1080, 1050], [1080, 1080]];
        for (const [g, v] of [[navy, 0.7], [yellow, 0.9], [blue, 0.8]]) poly(g, pad2, v);
    });
};
