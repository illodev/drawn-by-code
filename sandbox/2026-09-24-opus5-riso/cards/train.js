// Card «train» (reference ≈ 12.83–12.96 s, full frame). A night train crossing a tall
// viaduct: pink carriages (pink flat, navy dots) with yellow and red windows and olive
// undercarriages (navy + yellow), a white headlight throwing a yellow beam; the viaduct's
// navy deck and piers edged in green (blue + yellow); through the arches a dotted sky and a
// purple hill with a thin lit rim; white ripples on the river below; thin rain lines. The
// sky is blue and pink dots on paper, darker (flat navy) in the top-left corner.
// Authored in reference pixels (1080 frame) through G5.px. CARDS.train(press, t).
var CARDS = CARDS || {};
CARDS.train = (press, t) => {
    const R = Riso, T = R.tone, U = G5;
    const d = Math.floor(t * 12 + 1e-6);
    const P = (ink, k) => press.plate(ink, k);
    const pink = P('pink'), pinkS = P('pink', 'screen'), yel = P('yellow'), yelS = P('yellow', 'screen');
    const blue = P('blue'), blueS = P('blue', 'screen'), navy = P('navy'), navyS = P('navy', 'screen');
    const all = [pink, pinkS, yel, yelS, blue, blueS, navy, navyS];
    const eraseIn = (plates, fn) => { for (const g of plates) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; g.beginPath(); fn(g); g.restore(); } };
    const rect = (g, x, y, w, h, v) => { g.fillStyle = T(v); g.fillRect(x, y, w, h); };
    const dx = d * 3; // the train rolls right a little on twos

    U.px(press, () => {
        // sky: blue, navy and pink dots on paper; the top-left corner flat navy
        blueS.fillStyle = R.ramp(blueS, 0, 250, 0, 600, 0.7, 0.42); blueS.fillRect(0, 0, 1080, 1080);
        navyS.fillStyle = R.ramp(navyS, 0, 0, 0, 700, 0.04, 0.2); navyS.fillRect(0, 0, 1080, 1080);
        pinkS.fillStyle = R.ramp(pinkS, 0, 200, 0, 600, 0.08, 0.45); pinkS.fillRect(0, 0, 1080, 1080);
        const corner = [[0, 0], [760, 0], [520, 120], [260, 240], [0, 340]];
        navy.save(); navy.beginPath(); U.trace(navy, corner); navy.clip();
        navy.fillStyle = R.ramp(navy, 0, 0, 500, 250, 0.5, 0.3); navy.fillRect(0, 0, 1080, 400); navy.restore();
        U.fill(blue, corner, T(0.6));
        eraseIn([pinkS], (g) => U.trace(g, corner) || g.fill());
        U.fill(pinkS, corner, T(0.08));
        U.speckle(pink, 'tr-st', 25, 0, 0, 1080, 300, 1.2, 2.2, T(1));
        eraseIn([navy, navyS, blueS], (g) => { const r = Motion.rng('tr-ws'); for (let k = 0; k < 30; k++) { const x = r() * 1080, y = r() * 330, rr = 1.2 + r() * 1.5; g.moveTo(x + rr, y); g.arc(x, y, rr, 0, 7); } g.fill(); });

        // through the arches: a purple hill with a lit rim, a pale mist, the river
        const hill = [[-10, 652], [60, 662], [140, 670], [205, 650], [300, 640], [470, 630], [540, 636], [670, 640], [745, 592], [810, 562], [880, 552], [960, 560], [1090, 575], [1090, 1090], [-10, 1090]];
        eraseIn([blueS, pinkS, navyS], (g) => U.trace(g, hill) || g.fill());
        U.fill(navy, hill, T(0.85), false);
        U.fill(pinkS, hill, T(0.22));
        U.fill(blueS, hill, T(0.2));
        U.stroke(yel, hill.slice(0, 13), 3, T(0.9), true);
        eraseIn([navy], (g) => { g.lineWidth = 2; U.smooth(g, hill.slice(0, 13), false); g.stroke(); });
        // the mist: soft paper patches with dots (lighter)
        for (const [x, y, rx, ry] of [[1000, 720, 160, 200], [230, 860, 200, 60], [850, 900, 150, 70]]) {
            navy.save(); navy.globalCompositeOperation = 'destination-out'; navy.translate(x, y); navy.scale(1, ry / rx); U.glow(navy, 0, 0, rx, 0.85, 0); navy.restore();
        }
        // the river: white ripples (knocked out) with yellow flecks
        const rr = Motion.rng('tr-riv');
        eraseIn(all, (g) => { g.lineWidth = 3; for (let k = 0; k < 40; k++) { const x = rr() * 1080, y = 1005 + rr() * 75, l = 20 + rr() * 70; g.moveTo(x, y); g.lineTo(x + l, y - 1); } g.stroke(); });
        U.speckle(yel, 'tr-rv', 30, 0, 1000, 1080, 1080, 1.5, 3, T(1));

        // the viaduct: a navy deck sloping gently, piers, arches
        const deckTop = (x) => 425 + x * 0.05;
        const piers = [[-20, 42], [146, 192], [296, 344], [472, 522], [672, 724], [902, 962]];
        const archTop = (x) => deckTop(x) + 16 + x * 0.03;
        // arches between the piers: round-headed, springing one radius below their crown
        const arches = [];
        for (let i = 0; i < piers.length; i++) {
            const a = piers[i][1], b = piers[i + 1] ? piers[i + 1][0] : 1100, c = (a + b) / 2, rad = (b - a) / 2;
            arches.push([a, b, c, rad, archTop(c) + rad * 0.9]);
        }
        // piers: tapered columns, a green edge on the left
        for (const [l, r] of piers) {
            const col = [[l, deckTop(l) + 40], [r, deckTop(r) + 40], [r + 22, 1090], [l - 22, 1090]];
            eraseIn([pinkS, blueS, navyS], (g) => U.trace(g, col) || g.fill());
            U.fill(navy, col, T(1));
            U.fill(blue, col, T(0.45));
            U.fill(yel, col, T(0.3));
            const ar = arches.find((q) => Math.abs(q[1] - l) < 1 || Math.abs(q[0] - l) < 1);
            const top = ar ? ar[4] : deckTop(l) + 60;
            U.erase([navy, navyS, blueS, pinkS], [[l, top], [l - 22, 1090]], 7, false);
            U.stroke(blue, [[l, top], [l - 22, 1090]], 6, T(0.9));
            U.stroke(yel, [[l, top], [l - 22, 1090]], 6, T(1));
        }
        // the deck and the spandrels: navy over everything above the arches
        const deck = [[-20, deckTop(-20)], [1100, deckTop(1100)]];
        for (let i = arches.length - 1; i >= 0; i--) {
            const [a, b, c, rad, sp] = arches[i];
            deck.push([b, sp]);
            for (let k = 0; k <= 12; k++) { const an = (k / 12) * Math.PI; deck.push([c + Math.cos(an) * rad, sp - Math.sin(an) * rad * 0.9]); }
            deck.push([a, sp]);
        }
        deck.push([-20, 520]);
        eraseIn([pinkS, blueS, navyS], (g) => U.trace(g, deck) || g.fill());
        U.fill(navy, deck, T(1));
        U.fill(blue, deck, T(0.35));
        U.fill(yel, deck, T(0.2));
        // green rail line along the deck top and a second one lower
        U.erase([navy, navyS, blueS], [[-20, deckTop(-20)], [1100, deckTop(1100)]], 5, false);
        U.stroke(blue, [[-20, deckTop(-20)], [1100, deckTop(1100)]], 4, T(1));
        U.stroke(yel, [[-20, deckTop(-20)], [1100, deckTop(1100)]], 4, T(0.9));
        U.stroke(blueS, [[-20, deckTop(-20) + 22], [1100, deckTop(1100) + 22]], 3, T(0.7));
        // small ribs under the deck (cornice brackets)
        blue.strokeStyle = T(0.7); blue.lineWidth = 2;
        for (let x = 20; x < 1080; x += 42) { blue.beginPath(); blue.moveTo(x, deckTop(x) + 22); blue.lineTo(x - 3, deckTop(x) + 36); blue.stroke(); }

        // rain: thin blue lines sloping down to the right across everything
        blue.strokeStyle = T(0.8); blue.lineWidth = 1.8;
        const rn = Motion.rng('tr-rain' + (d % 2));
        for (let k = 0; k < 34; k++) { const x = rn() * 1200 - 100, y = 450 + rn() * 630, l = 60 + rn() * 90; blue.beginPath(); blue.moveTo(x, y); blue.lineTo(x + l, y + l * 0.22); blue.stroke(); }

        // the train ------------------------------------------------------------------------
        press.save(); press.each((g) => g.translate(dx, dx * 0.05));
        const cars = [[-40, 190, 333, 50, 20], [205, 455, 337, 56, 22], [475, 728, 340, 70, 24]];
        for (const [x0, x1, y0, h, uh] of cars) {
            const body = x1 === 728 ? [[x0, y0], [690, y0 + 2], [730, y0 + 62], [x1, y0 + h], [x0, y0 + h]] : [[x0, y0], [x1, y0 + 2], [x1, y0 + h], [x0, y0 + h - 1]];
            eraseIn(all, (g) => U.trace(g, body) || g.fill());
            U.fill(pink, body, T(0.9));
            U.fill(navyS, body, T(0.3));
            // roof highlight (paper line) and a lower pink stripe
            eraseIn(all, (g) => { g.lineWidth = 2; g.moveTo(x0, y0 + 5); g.lineTo(Math.min(x1, 690) - 4, y0 + 7); g.stroke(); });
            // undercarriage: olive (navy + yellow)
            const uc = [[x0, y0 + h], [x1 - 4, y0 + h + 2], [x1 - 8, y0 + h + uh], [x0, y0 + h + uh - 2]];
            eraseIn(all, (g) => U.trace(g, uc) || g.fill());
            U.fill(navy, uc, T(0.95)); U.fill(yel, uc, T(0.8));
        }
        // windows: yellow and red (pink + yellow) squares
        const W = [['r', 0, 342, 22, 22], ['y', 28, 345, 18, 22], ['r', 83, 345, 20, 22], ['y', 108, 345, 18, 22], ['y', 135, 345, 18, 22],
            ['y', 222, 348, 25, 28], ['y', 255, 348, 22, 28], ['y', 320, 350, 22, 30], ['r', 388, 352, 25, 32],
            ['y', 493, 355, 30, 35], ['r', 575, 357, 30, 38]];
        for (const [c, x, y, w, h] of W) {
            const q = [[x, y], [x + w, y + 1], [x + w, y + h], [x, y + h]];
            eraseIn(all, (g) => U.trace(g, q) || g.fill());
            U.fill(yel, q, T(1));
            if (c === 'r') U.fill(pink, q, T(0.8));
        }
        // the windscreen
        const ws = [[664, 352], [700, 352], [720, 390], [664, 390]];
        eraseIn(all, (g) => U.trace(g, ws) || g.fill());
        U.fill(yel, ws, T(0.85));
        // wheels / lamps on the undercarriages: yellow rings with a red centre
        for (const [x, y] of [[25, 392], [45, 392], [130, 394], [150, 394], [255, 407], [282, 407], [382, 410], [410, 411], [530, 426], [556, 426]]) {
            eraseIn([navy], (g) => { g.arc(x, y, 6, 0, 7); g.fill(); });
            yel.strokeStyle = T(1); yel.lineWidth = 2; yel.beginPath(); yel.arc(x, y, 5, 0, 7); yel.stroke();
            pink.fillStyle = T(0.8); pink.beginPath(); pink.arc(x, y, 2.4, 0, 7); pink.fill();
        }
        press.restore();

        // the headlight: a white disc with fine rays, and the yellow beam
        const H = [742 + dx, 418 + dx * 0.05];
        const beam = [[H[0], H[1] - 8], [1090, 392], [1090, 458], [H[0], H[1] + 10]];
        eraseIn([navy, navyS, blueS, pinkS], (g) => U.trace(g, beam) || g.fill());
        U.fill(yel, beam, T(0.95));
        U.clipped(navyS, beam, false, (g) => { g.fillStyle = R.ramp(g, H[0], 0, 1080, 0, 0, 0.35); g.fillRect(0, 0, 1080, 1080); });
        U.speckle(navy, 'tr-beam', 40, 800, 400, 1080, 450, 1, 2, T(0.8));
        eraseIn(all, (g) => { g.arc(H[0], H[1], 21, 0, 7); g.fill(); });
        eraseIn(all, (g) => { g.lineWidth = 1.5; for (let k = 0; k < 10; k++) { const a = k * 0.63 + 0.2; g.moveTo(H[0] + Math.cos(a) * 22, H[1] + Math.sin(a) * 22); g.lineTo(H[0] + Math.cos(a) * 34, H[1] + Math.sin(a) * 34); } g.stroke(); });
    });
};
