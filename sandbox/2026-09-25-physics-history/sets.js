// Set dressing for physics-newton-faraday: the rooms (panelled wall, floor), chairs and the
// small props that fill the study and the laboratory. Every function takes S (a spec filter,
// for fading) and K (the knockout option), so a set can dissolve into dots. Global: Sets.
const Sets = (() => {
    const { put, ink, line, smooth, poly, taper, circle, ellipse } = Ph;
    const id = (s) => s, KN = { knock: true };
    const WOOD_DK = { 'yellow.s': 0.8, 'pink.s': 0.65, 'navy.s': 0.72 };
    const WOOD = { 'yellow.s': 0.85, 'pink.s': 0.6, 'navy.s': 0.45 };
    const WOOD_LT = { 'yellow.s': 0.7, 'pink.s': 0.42, 'navy.s': 0.2 };
    const GRAIN = { 'pink.s': 0.8, 'navy.s': 0.8, 'yellow.s': 0.9 };

    // the wall's lower panelling (wainscot) in the night: dark panels with lit mouldings
    function wainscot(press, x0, x1, top, bottom, S = id, K = KN) {
        put(press, (g) => g.rect(x0, top, x1 - x0, bottom - top), S({ blue: 0.9, 'navy.s': 0.9, 'pink.s': 0.18 }), K);
        put(press, (g) => g.rect(x0, top - 10, x1 - x0, 12), S({ 'blue.s': 0.55, 'navy.s': 0.45 }), K);
        const w = 150;
        for (let x = x0 + 20; x < x1 - 40; x += w + 24) {
            const p = [[x, top + 30], [x + w, top + 30], [x + w, bottom - 40], [x, bottom - 40]];
            line(press, [p[0], p[1]], 3, S({ 'blue.s': 0.5, 'navy.s': 0.4 }), K);
            line(press, [p[0], p[3]], 3, S({ 'blue.s': 0.5, 'navy.s': 0.4 }), K);
            line(press, [p[1], p[2]], 4, S({ navy: 1 }), K);
            line(press, [p[3], p[2]], 4, S({ navy: 1 }), K);
        }
    }
    // floorboards receding: planks with seams converging a little, lighter near the front
    function floor(press, x0, x1, y, S = id, K = KN) {
        put(press, (g) => g.rect(x0, y, x1 - x0, 1000 - y), S(WOOD_DK), K);
        put(press, (g) => g.rect(x0, y - 6, x1 - x0, 10), S({ 'yellow.s': 0.6, 'pink.s': 0.45, 'navy.s': 0.8 }), K);
        for (let i = 0; i < 4; i++) {
            const yy = y + 14 + i * i * 9 + i * 8;
            line(press, [[x0, yy], [x1, yy]], 1.8 + i * 0.5, S({ navy: 1 }), K);
        }
        const r = Motion.rng('floor' + x0);
        for (let i = 0; i < (x1 - x0) / 60; i++) {
            const xx = x0 + r() * (x1 - x0), yy = y + 18 + r() * 80;
            line(press, [[xx, yy], [xx + 60 + r() * 120, yy + 1]], 1.6, S(GRAIN), K);
        }
    }
    // a chair in side view, back to the left (the sitter faces right). local units: the seat's
    // back corner at (0, 0); o: { back: height, depth, floor (y), style: 'carved' | 'windsor' }
    function chair(press, o, S = id, K = KN) {
        const d = o.depth, fl = o.floor, bh = o.back;
        // far legs (darker, a little offset), then near legs, seat, back
        for (const [dx, spec] of [[26, WOOD_DK], [0, WOOD]]) {
            put(press, (g) => poly(g, [[dx - 4, 0], [dx + 16, 0], [dx + 14, fl], [dx - 2, fl]]), S(spec), K);
            put(press, (g) => poly(g, [[d + dx - 18, 0], [d + dx, 0], [d + dx - 2, fl], [d + dx - 16, fl]]), S(spec), K);
            put(press, (g) => g.rect(dx, fl * 0.62, d, 10), S(spec), K);
        }
        // turned bulges on the near legs
        for (const x of [6, d - 9]) for (const y of [fl * 0.35, fl * 0.8]) put(press, ellipse(x, y, 11, 16), S(WOOD), K);
        put(press, (g) => g.rect(-4, -18, d + 10, 22), S(WOOD_LT), K);
        line(press, [[-4, 4], [d + 6, 4]], 3, S({ navy: 1, 'pink.s': 0.3 }), K);
        if (o.style === 'carved') {
            // two tall posts with finials, a leather panel with brass nails, a carved crest
            put(press, (g) => poly(g, [[-18, 0], [2, 0], [4, -bh], [-12, -bh]]), S(WOOD), K);
            put(press, (g) => poly(g, [[14, 0], [30, 0], [34, -bh + 10], [20, -bh + 10]]), S(WOOD_DK), K);
            for (const x of [-4, 27]) put(press, circle(x, -bh - (x < 0 ? 8 : -2), 11), S(WOOD_LT), K);
            put(press, (g) => poly(g, [[-2, -30], [22, -30], [26, -bh + 50], [2, -bh + 50]]), S({ pink: 0.9, 'yellow.s': 0.6, 'navy.s': 0.55 }), K);
            for (let y = -40; y > -bh + 60; y -= 26) put(press, circle(0, y, 3.2), S({ yellow: 1, 'pink.s': 0.2 }), K);
            put(press, (g) => smooth(g, [[-10, -bh + 30], [10, -bh + 14], [30, -bh + 24], [30, -bh + 50], [-10, -bh + 50]]), S(WOOD_LT), K);
            line(press, [[-4, -bh + 32], [8, -bh + 24], [22, -bh + 32]], 2.5, S({ navy: 1 }), K);
        } else {
            // windsor: a bent bow with spindles
            line(press, [[-6, 0], [-14, -bh * 0.6], [-4, -bh]], 12, S(WOOD), K);
            line(press, [[24, 0], [20, -bh * 0.6], [30, -bh + 6]], 10, S(WOOD_DK), K);
            for (let i = 1; i < 4; i++) line(press, [[-6 + i * 8, -12], [-10 + i * 9, -bh + 10]], 4, S(WOOD_LT), K);
        }
    }
    // a wall shelf with books standing and lying, and Newton's reflecting telescope
    function studyShelf(press, x, y, w, S = id, K = KN) {
        const r = Motion.rng('shelfbooks');
        const COVERS = [{ pink: 1, 'navy.s': 0.6 }, { 'blue.s': 0.8, yellow: 1, 'navy.s': 0.4 }, { navy: 1, 'pink.s': 0.5 }, { 'yellow.s': 0.8, 'pink.s': 0.7, 'navy.s': 0.4 }, { blue: 0.9, 'navy.s': 0.45 }];
        let bx = x + 10;
        for (let i = 0; i < 9; i++) {
            const bw = 16 + r() * 14, bh = 70 + r() * 40, c = COVERS[i % COVERS.length];
            const tilt = i === 6 ? 0.28 : 0;
            press.save();
            press.each((g) => { g.translate(bx, y); g.rotate(tilt); });
            put(press, (g) => g.rect(0, -bh, bw, bh), S(c), K);
            line(press, [[2, -bh + 12], [bw - 2, -bh + 12]], 2.4, S({ yellow: 1, 'pink.s': 0.2 }), K);
            line(press, [[2, -18], [bw - 2, -18]], 2.4, S({ yellow: 1, 'pink.s': 0.2 }), K);
            press.restore();
            bx += bw + 2 + (i === 5 ? 14 : 0);
        }
        // the telescope: a short tube on a ball-and-socket stand
        const tx = x + w - 200;
        put(press, (g) => poly(g, [[tx + 50, y], [tx + 90, y], [tx + 76, y - 16], [tx + 64, y - 16]]), S(WOOD_DK), K);
        put(press, circle(tx + 70, y - 24, 12), S(WOOD), K);
        press.save();
        press.each((g) => { g.translate(tx + 70, y - 36); g.rotate(-0.35); });
        put(press, (g) => g.rect(-60, -18, 150, 36), S({ 'yellow.s': 0.6, 'pink.s': 0.3, 'navy.s': 0.45 }), K);
        put(press, (g) => g.rect(-60, -18, 150, 8), S({ 'yellow.s': 0.4, 'pink.s': 0.15 }), K);
        put(press, (g) => g.rect(84, -22, 10, 44), S({ yellow: 1, 'pink.s': 0.3 }), K);
        put(press, (g) => g.rect(30, -30, 16, 12), S({ yellow: 1, 'pink.s': 0.3 }), K);
        press.restore();
        // the plank and its brackets
        put(press, (g) => g.rect(x, y, w, 14), S(WOOD), K);
        put(press, (g) => g.rect(x, y, w, 4), S(WOOD_LT), K);
        for (const bx2 of [x + 40, x + w - 40]) put(press, (g) => poly(g, [[bx2 - 6, y + 14], [bx2 + 6, y + 14], [bx2 + 6, y + 50], [bx2 - 22, y + 20]]), S(WOOD_DK), K);
    }
    // curtains either side of a window: heavy cloth with folds, tied back
    function curtains(press, x, y, w, h, S = id, K = KN) {
        for (const [cx, dir] of [[x - 40, 1], [x + w + 40, -1]]) {
            const pts = [[cx - 40 * dir, y - 40], [cx + 40 * dir, y - 40], [cx + 30 * dir, y + h * 0.55], [cx + 44 * dir, y + h + 60], [cx - 36 * dir, y + h + 60], [cx - 30 * dir, y + h * 0.55]];
            put(press, (g) => smooth(g, pts), S({ pink: 0.85, 'navy.s': 0.72, 'yellow.s': 0.3 }), K);
            for (const k of [-20, 0, 20]) line(press, [[cx + k * dir, y - 30], [cx + (k * 0.4) * dir, y + h * 0.55], [cx + (k + 10) * dir, y + h + 50]], taper(4), S({ navy: 1, pink: 0.6 }), K);
            put(press, ellipse(cx, y + h * 0.55, 34, 8), S({ yellow: 1, 'pink.s': 0.4 }), K);
        }
        put(press, (g) => g.rect(x - 110, y - 52, w + 220, 12), S(WOOD), K);
        for (const ex of [x - 110, x + w + 110]) put(press, circle(ex, y - 46, 10), S(WOOD_LT), K);
    }
    // an inkwell with a quill, and an hourglass
    function inkwell(press, x, y, S = id, K = KN) {
        put(press, (g) => smooth(g, [[x - 26, y], [x - 22, y - 30], [x - 10, y - 38], [x + 10, y - 38], [x + 22, y - 30], [x + 26, y]]), S({ navy: 1, 'blue.s': 0.4 }), K);
        put(press, ellipse(x, y - 38, 12, 4), S({ navy: 1, yellow: 0.8 }), K);
        press.knockout((g) => { Ph.poly(g, Ph.outline([[x - 14, y - 30], [x - 18, y - 8]], taper(4))); g.fill(); });
        // the quill: a shaft leaning out, the vane in paper with barbs
        line(press, [[x + 2, y - 36], [x + 46, y - 150]], 3, S({ 'yellow.s': 0.3, 'navy.s': 0.3 }), K);
        const vane = [[x + 18, y - 70], [x + 40, y - 100], [x + 58, y - 160], [x + 50, y - 164], [x + 30, y - 120], [x + 14, y - 80]];
        put(press, (g) => smooth(g, vane), S({ 'yellow.s': 0.12, 'blue.s': 0.08 }), K);
        for (let i = 0; i < 6; i++) line(press, [[x + 20 + i * 6, y - 78 - i * 14], [x + 34 + i * 5, y - 84 - i * 14]], 1.5, S({ 'blue.s': 0.4, 'navy.s': 0.2 }), K);
        line(press, [[x + 6, y - 50], [x + 46, y - 150]], 1.8, S({ navy: 0.8 }), K);
    }
    function hourglass(press, x, y, tq, S = id, K = KN) {
        const h = 90, w = 44, sand = (tq * 0.08) % 1;
        put(press, (g) => g.rect(x - w / 2 - 6, y - 10, w + 12, 10), S(WOOD), K);
        put(press, (g) => g.rect(x - w / 2 - 6, y - h - 10, w + 12, 10), S(WOOD), K);
        for (const sx of [-w / 2 - 2, w / 2 - 2]) put(press, (g) => g.rect(x + sx, y - h, 4, h - 10), S(WOOD_DK), K);
        const glass = (g) => { g.beginPath(); g.moveTo(x - w / 2 + 6, y - h); g.lineTo(x + w / 2 - 6, y - h); g.quadraticCurveTo(x + 4, y - h / 2 - 6, x + 3, y - h / 2); g.quadraticCurveTo(x + 4, y - h / 2 + 6, x + w / 2 - 6, y - 10); g.lineTo(x - w / 2 + 6, y - 10); g.quadraticCurveTo(x - 4, y - h / 2 + 6, x - 3, y - h / 2); g.quadraticCurveTo(x - 4, y - h / 2 - 6, x - w / 2 + 6, y - h); g.closePath(); };
        put(press, glass, S({ 'blue.s': 0.3 }), K);
        press.save();
        press.clip(glass);
        put(press, (g) => g.rect(x - w, y - h / 2 - 28 + sand * 20, w * 2, 30), S({ yellow: 1, 'pink.s': 0.35 }), K);
        put(press, (g) => g.rect(x - w, y - 30 - sand * 14, w * 2, 30), S({ yellow: 1, 'pink.s': 0.35 }), K);
        press.restore();
        line(press, [[x, y - h / 2], [x, y - 30 - sand * 14]], 2, S({ yellow: 1, 'pink.s': 0.35 }), K);
    }
    // a hanging oil lamp (Argand style): chain, brass font, glass chimney, a warm glow that sways
    function lamp(press, x, y, tq, S = id, K = KN) {
        const sw = Math.sin(tq * 1.7) * 0.03;
        press.save();
        press.each((g) => { g.translate(x, -20); g.rotate(sw); g.translate(-x, 20); });
        press.knockout((g) => { g.fillStyle = Riso.radial(g, x, y + 40, 10, 200, 0.5, 0); g.beginPath(); g.arc(x, y + 40, 200, 0, Math.PI * 2); g.fill(); });
        ink(press, circle(x, y + 40, 200), { 'yellow.s': (g) => Riso.radial(g, x, y + 40, 10, 200, 0.5, 0) });
        line(press, [[x, -20], [x, y - 30]], 4, S({ navy: 1, 'yellow.s': 0.5 }), K);
        put(press, (g) => smooth(g, [[x - 40, y - 20], [x + 40, y - 20], [x + 30, y + 10], [x - 30, y + 10]]), S({ yellow: 1, 'pink.s': 0.3, 'navy.s': 0.3 }), K);
        put(press, (g) => g.rect(x - 12, y + 10, 24, 60), S({ 'yellow.s': 0.3, 'blue.s': 0.1 }), K);
        put(press, (g) => smooth(g, [[x, y + 30], [x + 7, y + 48], [x, y + 60], [x - 7, y + 48]]), S({ yellow: 1, 'pink.s': 0.25 }), K);
        put(press, ellipse(x, y + 72, 44, 10), S({ yellow: 1, 'pink.s': 0.4, 'navy.s': 0.35 }), K);
        press.restore();
    }
    // Volta's pile on a small stand: alternating copper and zinc discs with wet card between
    function pile(press, x, y, S = id, K = KN) {
        put(press, (g) => g.rect(x - 40, y - 12, 80, 12), S(WOOD), K);
        for (let i = 0; i < 12; i++) {
            const yy = y - 16 - i * 10;
            put(press, ellipse(x, yy, 26, 6), S(i % 2 ? { 'yellow.s': 0.8, 'pink.s': 0.65, 'navy.s': 0.2 } : { 'blue.s': 0.3, 'navy.s': 0.35 }), K);
        }
        for (const sx of [-34, 34]) line(press, [[x + sx, y - 12], [x + sx, y - 150]], 5, S({ 'yellow.s': 0.5, 'navy.s': 0.5 }), K);
        put(press, (g) => g.rect(x - 38, y - 158, 76, 10), S(WOOD), K);
    }
    // an open notebook lying on the bench, with rows of script-like marks (no letters)
    function notebook(press, x, y, S = id, K = KN) {
        put(press, (g) => poly(g, [[x - 80, y], [x, y - 8], [x + 80, y], [x + 70, y + 16], [x, y + 10], [x - 90, y + 16]]), S({ 'yellow.s': 0.14, 'pink.s': 0.05 }), K);
        line(press, [[x, y - 8], [x, y + 10]], 2, S({ 'navy.s': 0.5 }), K);
        for (let i = 0; i < 3; i++) for (const s of [-1, 1]) line(press, [[x + s * 12, y - 2 + i * 5], [x + s * (60 - i * 4), y + i * 5]], 1.3, S({ 'navy.s': 0.6 }), K);
    }
    // stars popping in over the night (screen space), each twinkling
    function stars(press, x0, x1, f, tq) {
        const r = Motion.rng('night-stars');
        for (let i = 0; i < 150; i++) {
            const x = x0 + r() * (x1 - x0), y = r() * 900, at = r(), big = r() > 0.82;
            if (f < at) { r(); continue; }
            const tw = 0.7 + 0.3 * Motion.noise1('st' + i, tq * 2.5), s = (big ? 6 : 3.4) * tw * Math.min(1, (f - at) * 6), c = { 'yellow.s': big ? 0.6 : 0.3, 'blue.s': r() * 0.3 };
            put(press, circle(x, y, s), c);
            // the bright ones get four thin rays
            if (big) for (const [dx, dy] of [[1, 0], [0, 1]]) Ph.line(press, [[x - dx * s * 3, y - dy * s * 3], [x + dx * s * 3, y + dy * s * 3]], Ph.taper(2.2, 0.5, 0.5), c);
        }
    }
    return { wainscot, floor, chair, studyShelf, curtains, inkwell, hourglass, lamp, pile, notebook, stars };
})();
