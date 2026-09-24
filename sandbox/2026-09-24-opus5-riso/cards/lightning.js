// Card «lightning» (reference 12.125–12.25 s, full frame): a storm at sea at night. Olive
// black (navy + yellow) storm cloud with an orange glow where the bolt leaves it, a blue band
// of sky lit pink round the bolt, a yellow bolt with red edges striking an indigo sea, a
// green wave rising on the right with a white crest and foam, white rain everywhere.
// Measured on the 12.17 s frame in 1000 × 1000 units. The glow flickers on twos. Needs
// cards/_g4-util.js.
var CARDS = CARDS || {};
CARDS.lightning = (press, t) => {
    const U = G4, T = U.T, d = Math.floor(t * 12 + 1e-6);
    const Y = press.plate('yellow'), P = press.plate('pink'), B = press.plate('blue'), N = press.plate('navy');
    const YS = press.plate('yellow', 'screen'), PS = press.plate('pink', 'screen'), BS = press.plate('blue', 'screen'), NS = press.plate('navy', 'screen');
    const flash = d % 2 ? 0.85 : 1;

    // base: the olive black of the cloud and the foreground, a few pink/green specks
    N.fillStyle = T(1); N.fillRect(0, 0, 1000, 1000);
    Y.fillStyle = T(1); Y.fillRect(0, 0, 1000, 1000);
    PS.fillStyle = T(0.12); PS.fillRect(0, 0, 1000, 1000);
    // the orange glow in the cloud: the navy thins out, pink and yellow screens come in
    const glow = (g, stops) => { g.save(); g.translate(560, 235); g.scale(1.5, 1); g.fillStyle = U.rad(g, 0, 0, 10, 170, stops); g.fillRect(-250, -250, 500, 500); g.restore(); };
    U.erase([N], (g) => glow(g, [[0, 1], [0.6, 0.75], [1, 0]]));
    glow(PS, [[0, 0.75 * flash], [0.7, 0.45 * flash], [1, 0]]);

    // the sky band: blue with navy dots, lit pink round the bolt
    const top = [[0, 368], [60, 358], [100, 362], [125, 380], [160, 392], [200, 385], [230, 370], [250, 330], [275, 318], [300, 330], [330, 350], [380, 345], [420, 330], [450, 320], [500, 295], [560, 285], [620, 272], [700, 248], [740, 240], [780, 228], [830, 225], [870, 215], [900, 195], [950, 185], [1000, 172]];
    const band = top.concat([[1010, 172], [1010, 642], [0, 652], [-10, 652], [-10, 368]]);
    press.knockout((g) => { U.path(g, band); g.fill(); });
    U.poly(BS, band, 0.9); U.poly(NS, band, 0.62);
    U.clip(PS, (g) => U.path(g, band), (c) => { c.fillStyle = U.rad(c, 540, 470, 40, 330, [[0, 0.85 * flash], [0.5, 0.55 * flash], [1, 0]]); c.fillRect(0, 150, 1000, 520); });
    U.clip(NS, (g) => U.path(g, band), (c) => { c.save(); c.globalCompositeOperation = 'destination-out'; c.fillStyle = U.rad(c, 540, 470, 40, 300, [[0, 0.7], [1, 0]]); c.fillRect(0, 150, 1000, 520); c.restore(); });
    U.clip(BS, (g) => U.path(g, band), (c) => { c.save(); c.globalCompositeOperation = 'destination-out'; c.fillStyle = U.rad(c, 540, 470, 40, 300, [[0, 0.5], [1, 0]]); c.fillRect(0, 150, 1000, 520); c.restore(); });
    U.seg(P, top, 3, 1);

    // the sea: indigo (navy + blue + a pink screen) with light streaks
    const sea = [[0, 652], [1000, 640], [1000, 1010], [0, 1010]];
    press.knockout((g) => { U.path(g, sea); g.fill(); });
    U.poly(N, sea, 0.78); U.poly(B, sea, 0.55); U.poly(PS, sea, 0.42);
    const sr = Motion.rng('seastreak');
    for (let i = 0; i < 26; i++) {
        const y = 670 + sr() * 300, x = sr() * 900, w = 40 + sr() * 110;
        U.erase([N], (g) => { g.fillStyle = '#000'; g.fillRect(x, y, w, 3); });
    }
    // the bolt's reflection: short yellow and red dashes down from the strike
    for (let i = 0; i < 22; i++) {
        const y = 668 + i * 11 + sr() * 4, w = 18 + sr() * 40 * (1 - i / 30), x = 410 + (sr() - 0.5) * 60 - i * 1.5;
        press.knockout((g) => g.fillRect(x - w / 2, y, w, 4.5));
        U.poly(Y, [[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + 4.5], [x - w / 2, y + 4.5]], 1);
        if (i % 3 === 1) U.poly(P, [[x - w / 2, y], [x - w / 2 + 8, y], [x - w / 2 + 8, y + 4.5], [x - w / 2, y + 4.5]], 1);
    }

    // the foreground under the wave: olive black again, and the wave: a green body (yellow +
    // blue screen) under a white crest, curling at the right with foam
    const crest = [[250, 1010], [380, 905], [540, 795], [700, 705], [800, 668], [880, 650], [930, 646], [965, 662], [990, 700], [1000, 740]];
    const fg = crest.concat([[1010, 740], [1010, 1010]]);
    press.knockout((g) => { U.path(g, fg); g.fill(); });
    for (const g of [N, Y]) U.poly(g, fg, 1);
    PS.fillStyle = T(0.1); U.path(PS, fg); PS.fill();
    const body = crest.slice(0, 7).concat([[930, 712], [880, 730], [800, 770], [700, 820], [560, 905], [470, 970], [420, 1010]]);
    U.poly(N, body, 0); press.knockout((g) => { U.path(g, body); g.fill(); });
    U.poly(Y, body, 1);
    U.clip(BS, (g) => U.path(g, body), (c) => { c.fillStyle = U.lin(c, 0, 660, 0, 1000, [[0, 0.45], [1, 0.85]]); c.fillRect(250, 600, 760, 420); });
    U.clip(NS, (g) => U.path(g, body), (c) => { c.fillStyle = U.lin(c, 700, 700, 760, 820, [[0, 0], [1, 0.5]]); c.fillRect(250, 600, 760, 420); });
    // the curl: blue water inside the breaking wave, white foam spray
    const curl = [[930, 700], [965, 700], [985, 740], [980, 790], [955, 810], [920, 800], [880, 820], [870, 870], [920, 900], [1010, 900], [1010, 700]];
    press.knockout((g) => { U.smooth(g, curl, true); g.fill(); });
    U.blob(N, curl, 1); U.blob(B, curl, 0.8); U.blob(PS, curl, 0.25);
    press.knockout((g) => {
        g.lineCap = 'round'; g.lineJoin = 'round';
        g.lineWidth = 6; U.smooth(g, crest.slice(1, 8), false); g.stroke();
        g.lineWidth = 5; U.smooth(g, [[965, 668], [992, 700], [1000, 745], [990, 790], [972, 810], [955, 800]], false); g.stroke();
        const fr = Motion.rng('foam' + (d % 2));
        for (let i = 0; i < 40; i++) { const a = fr() * 6.28, r = 20 + fr() * 50, x = 975 + Math.cos(a) * r * 0.6, y = 730 + Math.sin(a) * r * 1.1; g.beginPath(); g.arc(x, y, 1.5 + fr() * 3.5, 0, 7); g.fill(); }
        g.lineWidth = 2.5; for (let i = 0; i < 10; i++) { const x = 900 + fr() * 100, y = 660 + fr() * 150; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (fr() - 0.5) * 20, y - 6 - fr() * 10); g.stroke(); }
    });
    // green rain on the wave
    const gr = Motion.rng('greenrain');
    for (let i = 0; i < 40; i++) { const x = 420 + gr() * 520, y = 700 + gr() * 300; U.seg(B, [[x, y], [x - 5, y + 28]], 2, 1); }

    // the bolts: yellow cores with red (pink) edges; thin branches in the cloud
    const bolt = (pts, w, seed, amp = 6) => {
        const p = U.jag(pts, seed, amp, 14);
        U.seg(P, p, w + 4, 1);
        press.knockout((g) => { g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); p.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
        U.seg(Y, p, w + 4, 1);
    };
    bolt([[590, 250], [582, 300], [560, 360], [545, 400], [520, 440], [500, 480], [475, 520], [460, 560], [445, 600], [425, 640], [410, 656]], 9, 'main', 7);
    bolt([[585, 290], [560, 355], [530, 420], [505, 470], [480, 530], [470, 590], [462, 640]], 4, 'main2', 6);
    bolt([[560, 360], [600, 400], [640, 425], [688, 440], [660, 470], [665, 495]], 3.5, 'br1');
    bolt([[595, 300], [615, 345], [645, 385]], 3, 'br2');
    bolt([[500, 480], [530, 520], [560, 560], [575, 590]], 3, 'br3');
    bolt([[520, 440], [480, 470], [455, 500]], 2.5, 'br4');
    bolt([[478, 530], [500, 570], [505, 615]], 2.5, 'br5');
    for (const [pts, s] of [[[[590, 250], [560, 200], [520, 170], [470, 160]], 'c1'], [[[590, 250], [600, 190], [585, 130], [560, 80]], 'c2'], [[[590, 250], [640, 210], [690, 180], [740, 150]], 'c3'], [[[600, 190], [650, 150], [690, 100]], 'c4'], [[[520, 170], [500, 130], [470, 110]], 'c5'], [[[640, 210], [690, 230], [720, 260]], 'c6']]) {
        const p = U.jag(pts, s, 7, 10);
        U.seg(Y, p, 2.4, 1);
        U.seg(P, p.map(([x, y]) => [x + 2, y + 1]), 1.2, 0.8);
    }
    bolt([[120, 335], [150, 380], [180, 470], [170, 520], [200, 560], [195, 600], [205, 660]], 3, 'left', 5);
    // the splash where it strikes
    press.knockout((g) => { g.beginPath(); g.ellipse(410, 655, 34, 8, 0, 0, 7); g.fill(); });
    U.ell(Y, 410, 655, 34, 8, 0, 1);
    for (let i = 0; i < 9; i++) { const a = -Math.PI + (i / 8) * Math.PI; U.seg(Y, [[410 + Math.cos(a) * 12, 652 + Math.sin(a) * 6], [410 + Math.cos(a) * 38, 650 + Math.sin(a) * 28]], 2.4, 1); }

    // rain: white streaks knocked out of everything, slanting
    press.knockout((g) => {
        const r = Motion.rng('rain' + (d % 2));
        g.lineCap = 'round'; g.lineWidth = 2;
        g.beginPath();
        for (let i = 0; i < 260; i++) { const x = r() * 1040, y = r() * 1000, L = 12 + r() * 16; g.moveTo(x, y); g.lineTo(x - L * 0.18, y + L); }
        g.stroke();
    });
    U.specks(P, 'lightpk', 40, [0, 0, 1000, 1000], 1, 2.2);
    U.specks(B, 'lightgr', 40, [0, 0, 1000, 370], 1, 2.2);
};
