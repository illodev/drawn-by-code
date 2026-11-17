// The other two levels, in white, each drawn in the ground floor plan's own space (Bank.px /
// Bank.py) so that the scene can lay it on the sheet with one translation and stack the three
// in the axonometric with one matrix: the basement (plant, lobby, strong room) and the roof.
(() => {
    const B = Bank, { px, py, S, W, D, T, P } = B, PI = Math.PI, m = (v) => v * S, DC = B.STRONG;
    const runs = (a, b, gaps) => { let out = [[a, b]]; for (const [g0, g1] of gaps) out = out.flatMap(([p, q]) => (q <= g0 || p >= g1 ? [[p, q]] : [[p, g0], [g1, q]].filter(([u, v]) => v - u > 1e-6))); return out; };
    const rect = (L, x0, y0, x1, y1) => L.rect(px(x0), py(y0), m(x1 - x0), m(y1 - y0));
    const tone = (L, x0, y0, x1, y1, a = 0.3) => L.fill([px(x0), py(y0), px(x1), py(y0), px(x1), py(y1), px(x0), py(y1)], a, 26);
    const name = (L, s, x, y, cap = 6, o = {}) => L.text(s, px(x), py(y), cap, { align: 'center', track: 0.18, ...o });

    // --- basement: the north strip is dug out, the lobby runs along it; the rest is earth -----------
    const SB = 8.85, LN = B.LOBBY.y[0], DOOR = [DC.door - 1, DC.door + 1]; // the basement's south wall; the lobby's north face; the round door
    Film.basement = (L) => {
        L.group('ba.out', { overlap: 0.25 }).bold();
        rect(L, 0, 0, W, SB); rect(L, T, T, 7 - 0.1, LN - 0.35); // the shell, the plant room
        // the strong room: thick walls, the round door in the one to the lobby
        L.poly([px(12.4), py(T), px(12.4), py(LN), px(DOOR[0]), py(LN), px(DOOR[0]), py(DC.y[1]), px(DC.x[0]), py(DC.y[1]), px(DC.x[0]), py(DC.y[0]), px(DC.x[1]), py(DC.y[0]), px(DC.x[1]), py(DC.y[1]), px(DOOR[1]), py(DC.y[1]), px(DOOR[1]), py(LN), px(23.6), py(LN), px(23.6), py(T)]);
        // the lobby: its north face (the plant's wall, the duct space, the stair and lift), its south wall
        for (const [a, b] of runs(T, 12.4, [[3.0, 3.9], [B.DUCT[0], B.DUCT[0] + B.DUCT[2]]])) { L.line(px(a), py(LN), px(b), py(LN)); if (b <= 7) L.line(px(a), py(LN - 0.35), px(b), py(LN - 0.35)); }
        for (const [a, b] of runs(23.6, W - T, [B.DOORS.stair, B.DOORS.lift])) { L.line(px(a), py(LN), px(b), py(LN)); L.line(px(Math.max(a, 24.4)), py(LN - 0.35), px(b), py(LN - 0.35)); }
        L.line(px(T), py(B.LOBBY.y[1]), px(W - T), py(B.LOBBY.y[1]));
        for (const x of [24.5, 28.5]) { L.line(px(x - 0.1), py(T), px(x - 0.1), py(LN - 0.35)); L.line(px(x + 0.1), py(T), px(x + 0.1), py(LN - 0.35)); }
        L.line(px(7.1), py(T), px(7.1), py(LN - 0.35));
        L.group('ba.tone', { overlap: 0.3 });
        tone(L, 0, 0, W, T); tone(L, 0, T, T, SB); tone(L, W - T, T, W, SB); tone(L, T, B.LOBBY.y[1], W - T, SB);
        tone(L, 12.4, T, DC.x[0], LN, 0.42); tone(L, DC.x[1], T, 23.6, LN, 0.42); tone(L, DC.x[0], T, DC.x[1], DC.y[0], 0.42);
        tone(L, DC.x[0], DC.y[1], DOOR[0], LN, 0.42); tone(L, DOOR[1], DC.y[1], DC.x[1], LN, 0.42);
        for (const [a, b] of runs(T, 7, [[3.0, 3.9]])) tone(L, a, LN - 0.35, b, LN);
        // --- fittings ---------------------------------------------------------------------------
        L.group('ba.fix', { overlap: 0.08 });
        // the wall of boxes: tiers along three sides of the strong room, a table in the middle
        L.fine();
        for (let x = DC.x[0] + 0.05; x < DC.x[1] - 0.3; x += 0.3) rect(L, x, DC.y[0], x + 0.3, DC.y[0] + 0.42);
        for (let y = DC.y[0] + 0.5; y < DC.y[1] - 0.3; y += 0.3) { rect(L, DC.x[0], y, DC.x[0] + 0.42, y + 0.3); rect(L, DC.x[1] - 0.42, y, DC.x[1], y + 0.3); }
        rect(L, 14.2, 2.45, 16.7, 3.35); // the table, clear of the way from the door to the boxes
        // the door's swing into the lobby, and its frame
        L.fine().ellipse(px(DOOR[0]), py(LN - 0.1), m(2), m(2), 0, PI / 2);
        L.med(); for (const x of DOOR) rect(L, x - 0.12, DC.y[1] - 0.05, x + 0.12, LN + 0.05);
        // the riser over, and its grille at the lobby's wall
        const [dx, dy, ds] = B.DUCT;
        L.hidden(); rect(L, dx, dy, dx + ds, dy + ds); L.line(px(dx), py(dy + ds), px(dx), py(LN)).line(px(dx + ds), py(dy + ds), px(dx + ds), py(LN));
        L.med(); rect(L, dx - 0.05, LN - 0.14, dx + ds + 0.05, LN + 0.08);
        L.fine(); for (let x = dx + 0.15; x < dx + ds; x += 0.15) L.line(px(x), py(LN - 0.14), px(x), py(LN + 0.08));
        // plant: two cylinders, a boiler, the pipes to the riser
        L.fine().circle(px(1.9), py(1.9), m(0.85)).circle(px(1.9), py(1.9), m(0.7)).circle(px(4.1), py(1.9), m(0.85)).circle(px(4.1), py(1.9), m(0.7));
        rect(L, 1.2, 3.4, 3.4, 4.6); rect(L, 5.4, 0.8, 6.5, 2.6);
        L.pen(0.8, { dash: [4, 2.4] }).poly([px(4.95), py(1.9), px(5.4), py(1.9)]).poly([px(6.5), py(1.7), px(8.6), py(1.7), px(8.6), py(4.4), px(dx), py(4.4)]);
        // doors
        const door = (hx, hy, sw, w) => { L.med().line(px(hx), py(hy), px(hx), py(hy + sw * w)); L.fine().ellipse(px(hx), py(hy), m(w), m(w), sw > 0 ? 0 : -PI / 2, sw > 0 ? PI / 2 : 0); };
        door(3.0, LN, 1, 0.9); door(B.DOORS.stair[0], LN, 1, 0.9);
        L.med().rect(px(B.DOORS.lift[0]), py(LN - 0.24), m(0.7), m(0.12)).rect(px(B.DOORS.lift[1] - 0.7), py(LN - 0.24), m(0.7), m(0.12));
        // stair and lift, as above
        const mid = 26.5;
        L.fine().line(px(mid - 0.08), py(1.6), px(mid - 0.08), py(LN - 0.35)).line(px(mid + 0.08), py(1.6), px(mid + 0.08), py(LN - 0.35));
        for (let y = 1.6; y < 5.0; y += 0.29) { L.line(px(24.6), py(y), px(mid - 0.08), py(y)); L.line(px(mid + 0.08), py(y), px(28.4), py(y)); }
        L.med().rect(px(28.95), py(0.95), m(2.4), m(3.55)); L.fine().rect(px(29.2), py(1.2), m(1.9), m(2.6)).line(px(29.2), py(1.2), px(31.1), py(3.8)).line(px(31.1), py(1.2), px(29.2), py(3.8));
        // the ground floor over, and the earth it stands on
        L.group('ba.over', { overlap: 0.2 }).centre().poly([px(0), py(SB), px(0), py(D), px(W), py(D), px(W), py(SB)]);
        L.pen(0.85, { a: 0.5 }).hatch([px(0.6), py(SB + 0.5), px(W - 0.6), py(SB + 0.5), px(W - 0.6), py(D - 0.5), px(0.6), py(D - 0.5)], { gap: 13, holes: [[px(10.2), py(11.1), px(21.8), py(11.1), px(21.8), py(14.5), px(10.2), py(14.5)]] });
        L.group('ba.names', { overlap: 0.1 }).med();
        name(L, 'STRONG ROOM', 16.2, 1.85, 6, { track: 0.24 }); name(L, 'LOBBY', 8.6, 7.25, 6, { track: 0.3 }); name(L, 'PLANT', 4.3, 3.9, 5.2); name(L, 'STAIR', 26.5, 0.98, 4.4); name(L, 'LIFT', 30.15, 2.6, 4.4, { clear: true });
        L.fine().text('RISER OVER', px(dx + ds / 2), py(dy - 0.17), 3.5, { align: 'center' });
        name(L, 'UNEXCAVATED', 16, 10.4, 4.6, { track: 0.3 });
        Blueprint.title(L.group('ba.title'), px(16), py(12.6), 'BASEMENT PLAN', 'SCALE 1:100', { cap: 7.6 });
    };
    // the strong room's door on the basement plan: a slab on its hinge, swung into the lobby
    Film.leaf = (g, open) => {
        const hx = px(DOOR[0] + 0.02), hy = py(LN - 0.1), a = (open * 86 * PI) / 180;
        g.save(); g.translate(hx, hy); g.rotate(a);
        g.strokeStyle = g.fillStyle = '#fff'; g.lineWidth = 1.05;
        g.globalAlpha = 0.5; g.fillRect(0, -m(0.3), m(1.96), m(0.3));
        g.globalAlpha = 1; g.strokeRect(0, -m(0.3), m(1.96), m(0.3));
        g.beginPath(); g.arc(m(0.98), -m(0.42), m(0.16), 0, PI * 2); g.stroke(); // the hand wheel, seen from above
        g.restore();
    };
    // where box 0412 is on the plan
    Film.BOX_PLAN = [DC.door + 0.3, DC.y[0] + 0.21];

    // --- roof ------------------------------------------------------------------------------------
    Film.roof = (L) => {
        L.group('rf.out', { overlap: 0.25 }).bold(); rect(L, 0, 0, W, D); L.med(); rect(L, T, T, W - T, D - T);
        L.fine(); rect(L, 0.14, 0.14, W - 0.14, D - 0.14);
        // the stair head and lift motor room
        L.bold(); rect(L, 24.5, T, W - T, 5.1); L.med().line(px(28.5), py(T), px(28.5), py(5.1));
        L.med().line(px(26.05), py(5.1), px(26.05), py(6.0)); L.fine().ellipse(px(26.05), py(5.1), m(0.9), m(0.9), 0, PI / 2);
        L.group('rf.tone', { overlap: 0.3 }); tone(L, 24.5, T, W - T, 5.1, 0.16);
        L.group('rf.fix', { overlap: 0.08 });
        // the lantern light over the banking hall: a ridge, hips, glazing bars
        L.bold(); rect(L, 10, 7.6, 22, 13); L.med(); rect(L, 10.25, 7.85, 21.75, 12.75);
        L.med().line(px(12.7), py(10.3), px(19.3), py(10.3));
        for (const [x, y] of [[10.25, 7.85], [10.25, 12.75]]) L.line(px(x), py(y), px(12.7), py(10.3));
        for (const [x, y] of [[21.75, 7.85], [21.75, 12.75]]) L.line(px(x), py(y), px(19.3), py(10.3));
        L.pen(0.8, { a: 0.75 });
        for (let x = 13.3; x < 19.2; x += 0.6) L.line(px(x), py(7.85), px(x), py(12.75));
        for (let y = 8.4; y < 12.7; y += 0.6) { const d = Math.abs(y - 10.3); L.line(px(10.25), py(y), px(10.25 + (2.45 - d) * (2.45 / 2.45)), py(y)); L.line(px(21.75), py(y), px(21.75 - (2.45 - d)), py(y)); }
        // the riser's cowl, two condensers, rainwater outlets and the falls to them, the cat ladder
        const [dx, dy, ds] = B.DUCT;
        L.bold(); rect(L, dx - 0.2, dy - 0.2, dx + ds + 0.2, dy + ds + 0.2); L.med(); rect(L, dx, dy, dx + ds, dy + ds);
        L.fine().line(px(dx), py(dy), px(dx + ds), py(dy + ds)).line(px(dx + ds), py(dy), px(dx), py(dy + ds));
        for (const x of [3.2, 5.6]) { L.med(); rect(L, x, 1.3, x + 1.7, 2.5); L.fine().circle(px(x + 0.85), py(1.9), m(0.45)).circle(px(x + 0.85), py(1.9), m(0.12)); }
        for (const [x, y, a] of [[1.3, 14.7, PI * 0.75], [30.7, 14.7, PI * 0.25], [1.3, 1.3, -PI * 0.75]]) {
            L.med().circle(px(x), py(y), m(0.2)); L.fine().circle(px(x), py(y), m(0.32));
            const ux = Math.cos(a), uy = Math.sin(a); L.fine().line(px(x - ux * 3.6), py(y - uy * 3.6), px(x - ux * 0.9), py(y - uy * 0.9)); Blueprint.arrow(L, px(x - ux * 0.9), py(y - uy * 0.9), a, 6.5);
        }
        L.med().line(px(-0.62), py(4.1), px(0.3), py(4.1)).line(px(-0.62), py(4.7), px(0.3), py(4.7));
        L.fine(); for (let x = -0.5; x < 0.3; x += 0.2) L.line(px(x), py(4.1), px(x), py(4.7));
        L.group('rf.names', { overlap: 0.1 }).med();
        name(L, 'LANTERN LIGHT', 16, 9.55, 4.6, { clear: true }); name(L, 'STAIR HEAD', 26.5, 2.6, 4.2); name(L, 'LIFT MOTORS', 30.2, 2.6, 4.2);
        L.fine().text('COWL', px(dx + ds + 0.42), py(dy + 0.62), 3.7).text('CONDENSERS', px(5.25), py(3.05), 3.7, { align: 'center' }).text('CAT LADDER', px(0.75), py(3.82), 3.7).text('FALL', px(4.4), py(12.25), 3.5).text('R.W.O.', px(1.95), py(15.0), 3.5);
        name(L, 'ROOF', 16, 4.4, 7.4, { track: 0.3 });
        Blueprint.title(L.group('rf.title'), px(16), py(D) + 40, 'ROOF PLAN', 'SCALE 1:100', { cap: 7.6 });
    };

    // --- the axonometric's own lines: the corners of the three levels tied together, their names -----
    Film.axon = (L) => {
        const A = { roof: B.axon('roof'), ground: B.axon('ground'), basement: B.axon('basement') };
        L.group('ax.ties', { overlap: 0.4 }).centre();
        for (const [x, y] of [[0, 0], [W, 0], [W, D], [0, D]]) { const a = A.roof.pt(x, y), b = A.basement.pt(x, y); L.line(a[0], a[1], b[0], b[1]); }
        L.group('ax.names', { overlap: 0.1 }).med();
        for (const [lv, s] of [['roof', 'ROOF  +4.600'], ['ground', 'GROUND FLOOR  ±0.000'], ['basement', 'BASEMENT  −3.800']]) { const p = A[lv].pt(W, 0); Blueprint.level(L, p[0] + 16, p[1] + 2, s, { cap: 4.6 }); }
        Blueprint.title(L.group('ax.title'), B.AX.x, B.AX.y + B.AX.gap + 12 * S * B.AX.k + 24, 'AXONOMETRIC · THREE LEVELS', 'NOT TO SCALE VERTICALLY', { cap: 7.6 });
    };
})();
