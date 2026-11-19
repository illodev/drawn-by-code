// Picture 1, the way in · The passage. Not a poster the camera approaches: strata of things
// hundreds of units apart along the axis, each overlapping the next and leaving a way
// through. Each comes out of the dark as the camera nears it, is crossed, and uncovers the
// one behind. Depth is time and light: it starts by a candle, in the dark, and goes through
// Tartessos and the sea, Rome and the Goths, al-Andalus, the house and the fair, towards
// the guitar (tableaux/emblem.js), which is the last stratum.
//   Tableau.passage(z0) → layers; the first stratum at depth z0, one every STEP after it.
//   Tableau.passage.depth → how far the last stratum is from the first
window.Tableau = window.Tableau || {};
Tableau.passage = (z0) => {
    const S = Souvenir;
    const G = (n) => { try { return eval(n); } catch (e) { return {}; } };
    const R = G('Relics'), H = G('Heirlooms'), P = G('Papers'), W = G('Wares'), C = G('Charms'), L = G('Library'), D = G('Devotion'), F = G('Fauna');
    const NIGHT = [27, 30, 61];
    const box = { x: -1200, y: -720, w: 2400, h: 1440 };
    const STEP = Tableau.passage.step;

    // One stratum: three sheets (far, middle, near) a little apart, so even inside a stratum
    // things slide over each other. `veil` is how much of the night still lies on it (the
    // passage brightens as it goes in); `lamp` a warm light falling on it from a flame.
    //   each sheet: (put) => { put(owner, 'name', { x, y, s, rot, … }); … }
    // The body of a stratum: a thick wreath of the shawl's own flowers and leaves round the
    // way through, so each stratum is a mass that frames the next one and not loose things
    // on the night. Wider than the frame, open in the middle.
    const Sh = G('Shawl');
    function wreath(g, seed, hue) {
        if (!Sh.peony) return;
        const r = Motion.rng('wreath' + seed);
        const spots = [];
        for (let i = 0; i < 520 && spots.length < 74; i++) {
            const x = (r() * 2 - 1) * 1180, y = (r() * 2 - 1) * 700, rad = 62 + r() * 86;
            // the way through: an oval that no flower enters
            if (Math.hypot(x / 430, y / 300) < 1 + rad / 380) continue;
            if (spots.some((q) => Math.hypot(q[0] - x, q[1] - y) < (q[2] + rad) * 0.72)) continue;
            spots.push([x, y, rad]);
        }
        // leaves first, then the flowers over them, far from the centre first
        spots.sort((p, q) => Math.hypot(q[0], q[1]) - Math.hypot(p[0], p[1]));
        if (Sh.leaf) for (const [x, y, rad] of spots) for (let k = 0; k < 5; k++) Sh.leaf(g, { x, y, a: r() * 6.28, len: rad * (1.5 + r() * 0.8), wid: rad * 0.5, bend: (r() - 0.5) * 0.8, seed: seed + x + k });
        spots.forEach(([x, y, rad], i) => {
            const kind = ['peony', 'rose', 'mum', 'peony'][(i + hue) % 4];
            (Sh[kind] || Sh.peony)(g, { x, y, r: rad, seed: seed + i });
        });
    }

    // One stratum: three sheets (far, middle, near) a little apart, so even inside a stratum
    // things slide over each other. `veil` is how much of the night still lies on it (the
    // passage brightens as it goes in); `lamp` a warm light falling on it from a flame.
    // The pieces are big and lie on one another: at the distance the camera reads a stratum
    // from, the near ones are cut by the frame.
    //   each sheet: (put) => { put(owner, 'name', { x, y, s, rot, … }); … }
    function stratum(id, n, veil, sheets, lamp = null) {
        const z = z0 + n * STEP;
        return sheets.map((paintSheet, i) => ({
            id: `passage-${id}-${i}`, z: z + [150, 0, -160][i], box, far: [0.2, 0.36], brush: { amp: 0.06 },
            paint(g) {
                const grow = [1.3, 1.45, 1.5][i], out = [1.0, 1.1, 1.14][i];
                const put = (o, name, a) => o && o[name] && o[name](g, { ...a, x: a.x * out, y: a.y * out, s: (a.s ?? 1) * grow });
                if (i === 0) wreath(g, id, n);
                paintSheet(put, g);
                g.save();
                g.globalCompositeOperation = 'source-atop';
                if (veil > 0) {
                    g.fillStyle = `rgba(${NIGHT.join(',')},${veil})`;
                    g.fillRect(box.x, box.y, box.w, box.h);
                }
                if (lamp) {
                    // what the flame reaches is warm, on the paint only
                    const gr = g.createRadialGradient(lamp.x, lamp.y, 20, lamp.x, lamp.y, lamp.r);
                    gr.addColorStop(0, 'rgba(255,196,120,0.5)');
                    gr.addColorStop(0.45, 'rgba(255,170,90,0.2)');
                    gr.addColorStop(1, 'rgba(255,170,90,0)');
                    g.fillStyle = gr;
                    g.fillRect(box.x, box.y, box.w, box.h);
                }
                g.restore();
                S.tooth(g, box);
            },
        }));
    }

    return [
        // 0 · By the candle: the things of the three faiths, in the dark
        ...stratum('vela', 0, 0.3, [
            (put) => {
                put(W, 'peineta', { x: -360, y: -330, s: 1.15, rot: -0.18 });
                put(W, 'biznaga', { x: 250, y: -360, s: 1.0, rot: 0.2 });
                put(D, 'jamsa', { x: 330, y: 330, s: 1.1, rot: -0.1 });
            },
            (put) => {
                put(D, 'lampara', { x: -470, y: 250, s: 1.1, rot: 0, servant: true });
                put(D, 'rosario', { x: 520, y: -210, s: 1.2, rot: 0.25 });
            },
            (put) => {
                put(D, 'incensario', { x: -640, y: -170, s: 1.7, rot: 0 });
                put(D, 'cirio', { x: 610, y: 150, s: 1.7, rot: 0.03 });
            },
        ], { x: 700, y: -260, r: 1000 }),
        // 1 · Tartessos and the sea: gold, the Phoenicians' purple, the Greeks' bronze
        ...stratum('mar', 1, 0.18, [
            (put) => {
                put(C, 'pomegranate', { x: -330, y: 330, s: 1.2, rot: 0.25 });
                put(F, 'butterfly', { x: -150, y: 395, s: 1.2, rot: -0.9, fold: 0.25, seed: 'm1', cast: false });
                put(R, 'stele', { x: 300, y: -340, s: 1.15, rot: 0.1 });
            },
            (put) => {
                put(R, 'carambolo', { x: -450, y: -270, s: 1.35, rot: -0.12 });
                put(R, 'murex', { x: 480, y: 300, s: 1.45, rot: 0.3 });
            },
            (put) => {
                put(R, 'helmet', { x: 680, y: -140, s: 1.7, rot: 0.06 });
                put(W, 'botijo', { x: -690, y: 240, s: 1.6, rot: 0.06 });
            },
        ]),
        // 2 · Rome and the Goths: oil, a floor, garnets, a crown, Byzantium's gold
        ...stratum('roma', 2, 0.1, [
            (put) => {
                put(H, 'votive', { x: 310, y: -330, s: 1.15, rot: 0 });
                put(H, 'byzantine', { x: -340, y: 320, s: 1.25, rot: 0.06 });
            },
            (put) => {
                put(R, 'mosaic', { x: 470, y: 290, s: 1.4, rot: 0.07 });
                put(H, 'eagle', { x: -430, y: -260, s: 1.4, rot: -0.05 });
            },
            (put) => {
                put(R, 'amphora', { x: -680, y: 130, s: 1.75, rot: -0.42 });
                put(P, 'plaque', { x: 640, y: -330, s: 1.5, rot: 0.06 });
            },
        ]),
        // 3 · Al-Andalus: the stars' instrument, the caliph's fawn, cut tile, the books
        ...stratum('andalus', 3, 0.05, [
            (put) => {
                put(H, 'alicatado', { x: 360, y: -330, s: 1.05, rot: 0.1 });
                put(L, 'palette', { x: -330, y: 340, s: 1.1, rot: 0.22 });
                put(F, 'gecko', { x: 300, y: -250, s: 1.2, rot: 2.4, seed: 'g1' });
            },
            (put) => {
                put(H, 'fawn', { x: 500, y: 260, s: 1.4, rot: 0 });
                put(L, 'books', { x: -520, y: -180, s: 1.15, rot: -0.03 });
            },
            (put) => {
                put(H, 'astrolabe', { x: -660, y: 250, s: 1.7, rot: 0.12 });
                put(W, 'fino', { x: 690, y: -110, s: 1.7, rot: 0.04 });
            },
        ]),
        // 4 · The house and the fair: papers, cards, castanets, lanterns overhead
        ...stratum('feria', 4, 0, [
            (put) => {
                // high enough that no lantern hangs in the way through
                put(W, 'farolillos', { x: -1150, y: -640, s: 0.8, n: 8, len: 2300, sag: 120, seed: 'feria' });
                put(L, 'score', { x: -330, y: 330, s: 1.15, rot: -0.1 });
                put(P, 'ticket', { x: 330, y: 340, s: 1.1, rot: -0.16 });
            },
            (put) => {
                put(P, 'poster', { x: -520, y: -150, s: 1.05, rot: -0.1 });
                put(C, 'cards', { x: 500, y: 250, s: 1.2, rot: 0.2 });
                put(P, 'stamp', { x: 330, y: -330, s: 1.3, rot: 0.14 });
            },
            (put) => {
                put(C, 'castanets', { x: 650, y: -230, s: 1.7, rot: -0.3 });
                put(P, 'matchbox', { x: -640, y: 340, s: 1.7, rot: 0.3 });
            },
        ]),
    ];
};
Tableau.passage.step = 680;
Tableau.passage.depth = 5 * 680; // from the first stratum to the guitar
