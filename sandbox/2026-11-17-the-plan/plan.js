// Ground floor plan, scale 1:100, in white: the architect's print. Everything is placed from
// bank.js (metres), through Bank.px / Bank.py.
(() => {
    const B = Bank, { px, py, S, W, D, T, P, NORTH } = B, PI = Math.PI;
    const m = (v) => v * S; // metres → sheet units
    // the parts of [a, b] left once the gaps are taken out
    const runs = (a, b, gaps) => {
        let out = [[a, b]];
        for (const [g0, g1] of gaps) out = out.flatMap(([p, q]) => (q <= g0 || p >= g1 ? [[p, q]] : [[p, g0], [g1, q]].filter(([u, v]) => v - u > 1e-6)));
        return out;
    };
    const WIN = { n: [[2, 5], [14.5, 17.5], [19, 22]], s: [[3, 6], [8.5, 11.5], [20.5, 23.5], [26, 29]], w: [[7.5, 10]], e: [[7.5, 10.5], [12, 14.5]] };
    const vparts = [7, 12, 24.5, 28.5];
    Film.plan = (D0) => {
        const Dr = D0;
        // --- setting out: the column grid, with its bubbles ---------------------------------------
        Dr.group('pl.grid', { overlap: 0.3 }).centre();
        for (const [i, [cx]] of B.COLS.entries()) {
            Dr.centre().line(px(cx), py(-1.25), px(cx), py(D + 0.9));
            Dr.fine().circle(px(cx), py(-1.25) - 6.5, 6.5).text(String(i + 1), px(cx), py(-1.25) - 3.9, 5.2, { align: 'center' });
        }
        Dr.centre().line(px(-1.2), py(10.5), px(W + 0.9), py(10.5));
        Dr.fine().circle(px(-1.2) - 6.5, py(10.5), 6.5).text('A', px(-1.2) - 6.5, py(10.5) + 2.6, 5.2, { align: 'center' });

        // --- outer walls: the two faces, broken at openings, with their jambs -----------------------
        Dr.group('pl.outer', { overlap: 0.25 }).bold();
        const doorS = [B.MAIN], doorW = [B.SIDE];
        for (const [a, b] of runs(0, W, [...doorS, ...WIN.s])) Dr.line(px(a), py(D), px(b), py(D));
        for (const [a, b] of runs(0, W, WIN.n)) Dr.line(px(a), py(0), px(b), py(0));
        for (const [a, b] of runs(0, D, [...doorW, ...WIN.w])) Dr.line(px(0), py(a), px(0), py(b));
        for (const [a, b] of runs(0, D, WIN.e)) Dr.line(px(W), py(a), px(W), py(b));
        const j = P / 2; // half a partition
        for (const [a, b] of runs(T, W - T, [...doorS, ...WIN.s])) Dr.line(px(a), py(D - T), px(b), py(D - T));
        for (const [a, b] of runs(T, W - T, [...WIN.n, ...vparts.map((x) => [x - j, x + j])])) Dr.line(px(a), py(T), px(b), py(T));
        for (const [a, b] of runs(T, D - T, [...doorW, ...WIN.w, [NORTH - j, NORTH + j]])) Dr.line(px(T), py(a), px(T), py(b));
        for (const [a, b] of runs(T, D - T, [...WIN.e, [NORTH - j, NORTH + j]])) Dr.line(px(W - T), py(a), px(W - T), py(b));
        for (const [a, b] of [...doorS, ...WIN.s]) for (const x of [a, b]) Dr.line(px(x), py(D - T), px(x), py(D));
        for (const [a, b] of WIN.n) for (const x of [a, b]) Dr.line(px(x), py(0), px(x), py(T));
        for (const [a, b] of [...doorW, ...WIN.w]) for (const y of [a, b]) Dr.line(px(0), py(y), px(T), py(y));
        for (const [a, b] of WIN.e) for (const y of [a, b]) Dr.line(px(W - T), py(y), px(W), py(y));

        // --- partitions ----------------------------------------------------------------------------
        Dr.group('pl.parts', { overlap: 0.25 }).bold();
        const openN = Object.values(B.DOORS), solidN = [[T, 12 + j], [24.5 - j, W - T]];
        for (const [x0, x1] of solidN) {
            for (const [a, b] of runs(x0, x1, [...openN, ...vparts.map((x) => [x - j, x + j])])) Dr.line(px(a), py(NORTH - j), px(b), py(NORTH - j));
            for (const [a, b] of runs(x0, x1, openN)) Dr.line(px(a), py(NORTH + j), px(b), py(NORTH + j));
        }
        for (const [a, b] of openN) for (const x of [a, b]) Dr.line(px(x), py(NORTH - j), px(x), py(NORTH + j));
        Dr.line(px(12 + j), py(NORTH - j), px(12 + j), py(NORTH + j)).line(px(24.5 - j), py(NORTH - j), px(24.5 - j), py(NORTH + j));
        for (const x of vparts) for (const s of [-j, j]) Dr.line(px(x + s), py(T), px(x + s), py(NORTH - j));

        // --- what the cut goes through, toned --------------------------------------------------------
        Dr.group('pl.poche', { overlap: 0.3 });
        const tone = (x0, y0, x1, y1) => Dr.fill([px(x0), py(y0), px(x1), py(y0), px(x1), py(y1), px(x0), py(y1)], 0.3, 26);
        for (const [a, b] of runs(0, W, WIN.n)) tone(a, 0, b, T);
        for (const [a, b] of runs(0, W, [...doorS, ...WIN.s])) tone(a, D - T, b, D);
        for (const [a, b] of runs(T, D - T, [...doorW, ...WIN.w])) tone(0, a, T, b);
        for (const [a, b] of runs(T, D - T, WIN.e)) tone(W - T, a, W, b);
        for (const [x0, x1] of solidN) for (const [a, b] of runs(x0, x1, openN)) tone(a, NORTH - j, b, NORTH + j);
        for (const x of vparts) tone(x - j, T, x + j, NORTH - j);

        // --- doors (leaf and swing) and windows --------------------------------------------------------
        Dr.group('pl.doors', { overlap: 0.15 });
        const door = (hx, hy, dir, swing, w) => { // hinge, the way the opening runs, the way the leaf stands open, width
            const a0 = Math.atan2(swing[1], swing[0]), a1 = Math.atan2(dir[1], dir[0]);
            Dr.med().line(px(hx), py(hy), px(hx + swing[0] * w), py(hy + swing[1] * w));
            let d = a1 - a0; if (d > PI) d -= 2 * PI; if (d < -PI) d += 2 * PI;
            Dr.fine().ellipse(px(hx), py(hy), m(w), m(w), a0, a0 + d);
        };
        door(B.DOORS.manager[0], NORTH, [1, 0], [0, -1], 0.9);
        door(B.DOORS.store[0], NORTH, [1, 0], [0, -1], 0.9);
        door(B.DOORS.stair[1], NORTH, [-1, 0], [0, 1], 0.9);
        door(T / 2, B.SIDE[0], [0, 1], [1, 0], 1.0);
        door(B.MAIN[0], D - T / 2, [1, 0], [0, -1], 1.4); door(B.MAIN[1], D - T / 2, [-1, 0], [0, -1], 1.4);
        Dr.med().rect(px(B.DOORS.lift[0]), py(NORTH - 0.06), m(0.7), m(0.12)).rect(px(B.DOORS.lift[1] - 0.7), py(NORTH - 0.06), m(0.7), m(0.12));
        const glass = (h, a, b, c0, c1) => { for (const f of [0.3, 0.5, 0.7]) { const c = c0 + (c1 - c0) * f; h ? Dr.line(px(a), py(c), px(b), py(c)) : Dr.line(px(c), py(a), px(c), py(b)); } };
        Dr.fine();
        for (const [a, b] of WIN.n) glass(true, a, b, 0, T);
        for (const [a, b] of WIN.s) glass(true, a, b, D - T, D);
        for (const [a, b] of WIN.w) glass(false, a, b, 0, T);
        for (const [a, b] of WIN.e) glass(false, a, b, W - T, W);
        // the draught lobby inside the main entrance
        Dr.fine().poly([px(14.2), py(D - T), px(14.2), py(13.9), px(17.8), py(13.9), px(17.8), py(D - T)]);
        Dr.poly([px(14.32), py(D - T), px(14.32), py(14.02), px(17.68), py(14.02), px(17.68), py(D - T)]);

        // --- fixtures ---------------------------------------------------------------------------------
        Dr.group('pl.fix', { overlap: 0.08 });
        for (const [cx, cy] of B.COLS) { Dr.bold().rect(px(cx - 0.25), py(cy - 0.25), m(0.5), m(0.5)); Dr.fill([px(cx - 0.25), py(cy - 0.25), px(cx + 0.25), py(cy - 0.25), px(cx + 0.25), py(cy + 0.25), px(cx - 0.25), py(cy + 0.25)], 0.45, 8); }
        const [c0, c1, cy0, cy1] = B.COUNTER;
        Dr.bold().rect(px(c0), py(cy0), m(c1 - c0), m(cy1 - cy0));
        Dr.fine().line(px(c0), py(cy0 + 0.22), px(c1), py(cy0 + 0.22));
        for (let i = 1; i < 5; i++) { const x = c0 + ((c1 - c0) * i) / 5; Dr.line(px(x), py(cy0), px(x), py(cy1 + 0.25)); }
        Dr.med().line(px(12 + j), py(cy1 - 0.1), px(c0), py(cy1 - 0.1)); // the staff gate
        Dr.pen(0.8, { dash: [1.2, 3.4] }).line(px(13), py(7.7), px(23.6), py(7.7));
        for (let x = 13; x <= 23.61; x += 2.65) Dr.dot(px(x), py(7.7), 1.25);
        // tellers: desks and chairs, a run of cabinets
        for (let i = 0; i < 5; i++) { const x = c0 + ((c1 - c0) * (i + 0.5)) / 5; Dr.fine().rect(px(x - 0.75), py(3.5), m(1.5), m(0.7)); Dr.circle(px(x), py(3.05), m(0.24)); }
        Dr.fine().rect(px(12.4), py(T + 0.08), m(11.8), m(0.55));
        for (let x = 13.2; x < 24; x += 0.8) Dr.line(px(x), py(T + 0.08), px(x), py(T + 0.63));
        // manager
        Dr.fine().rect(px(2.0), py(1.7), m(1.9), m(0.9)).circle(px(2.95), py(1.3), m(0.26)).circle(px(2.5), py(3.05), m(0.24)).circle(px(3.4), py(3.05), m(0.24));
        Dr.rect(px(T + 0.08), py(T + 0.08), m(0.5), m(2.6)).rect(px(5.0), py(3.5), m(1.6), m(0.75));
        // store: shelving, and the riser
        Dr.fine().rect(px(7.2), py(T + 0.08), m(3.3), m(0.5)).rect(px(7.2), py(T + 0.58), m(0.5), m(3.0));
        for (let x = 7.86; x < 10.4; x += 0.66) Dr.line(px(x), py(T + 0.08), px(x), py(T + 0.58));
        for (let y = 1.6; y < 4; y += 0.66) Dr.line(px(7.2), py(y), px(7.7), py(y));
        const [dx, dy, ds] = B.DUCT;
        Dr.med().rect(px(dx), py(dy), m(ds), m(ds));
        Dr.fine().line(px(dx), py(dy), px(dx + ds), py(dy + ds)).line(px(dx + ds), py(dy), px(dx), py(dy + ds));
        // stair: two flights, the arrow on the walking line, the break
        const sx0 = 24.6, sx1 = 28.4, mid = 26.5;
        Dr.fine().line(px(mid - 0.08), py(1.6), px(mid - 0.08), py(4.9)).line(px(mid + 0.08), py(1.6), px(mid + 0.08), py(4.9));
        for (let y = 1.6; y < 4.75; y += 0.29) { Dr.line(px(sx0), py(y), px(mid - 0.08), py(y)); Dr.line(px(mid + 0.08), py(y), px(sx1), py(y)); }
        Dr.med().poly([px(27.45), py(4.6), px(27.45), py(1.05), px(25.55), py(1.05), px(25.55), py(3.2)]);
        Blueprint.arrow(Dr, px(25.55), py(3.2), PI / 2, 6);
        Dr.dot(px(27.45), py(4.6), 1.1);
        Dr.med().poly([px(sx0), py(3.75), px(25.3), py(3.35), px(25.5), py(3.75), px(25.75), py(3.3), px(mid - 0.08), py(2.9)]);
        // lift
        Dr.med().rect(px(28.95), py(0.95), m(2.4), m(3.55));
        Dr.fine().rect(px(29.2), py(1.2), m(1.9), m(2.6)).line(px(29.2), py(1.2), px(31.1), py(3.8)).line(px(31.1), py(1.2), px(29.2), py(3.8));
        // the hall's furniture: two writing desks, benches under the windows
        Dr.fine().rect(px(3.6), py(9.0), m(2.2), m(0.7)).rect(px(19.2), py(10.15), m(2.2), m(0.7));
        Dr.rect(px(20.6), py(14.75), m(2.8), m(0.5)).rect(px(26.1), py(14.75), m(2.8), m(0.5)).rect(px(8.6), py(14.75), m(2.8), m(0.5));

        // --- the strong room, below: hidden lines, and its note ------------------------------------------
        Dr.group('pl.below', { overlap: 0.3 }).hidden().rect(px(B.STRONG.x[0]), py(B.STRONG.y[0] + 0.75), m(B.STRONG.x[1] - B.STRONG.x[0]), m(B.STRONG.y[1] - B.STRONG.y[0] - 0.75));

        // --- names ---------------------------------------------------------------------------------------
        Dr.group('pl.names', { overlap: 0.1 }).med();
        const name = (s, x, y, cap = 6, o = {}) => Dr.text(s, px(x), py(y), cap, { align: 'center', track: 0.18, ...o });
        name('MANAGER', 5.35, 1.55); name('STORE', 9.0, 2.2, 5.2); name('TELLERS', 18.25, 2.75, 6, { clear: true }); name('STAIR', 26.5, 0.98, 4.4); name('LIFT', 30.15, 2.6, 4.4, { clear: true });
        name('BANKING HALL', 16, 9.55, 7.4, { track: 0.3 });
        name('STRONG ROOM BELOW', 18.25, 1.72, 4.3, { clear: true }); name('SEE SECTION B–B', 18.25, 2.08, 3.6, { clear: true });
        Dr.fine().text('DUCT', px(dx + ds / 2), py(dy - 0.17), 3.7, { align: 'center' });
        name('DN', 27.45, 4.25, 3.6, { align: 'left' });

        // --- the section's marks, the overall sizes -------------------------------------------------------
        Dr.group('pl.marks', { overlap: 0.2 });
        for (const [x, s] of [[-1.55, 1], [W + 1.55, -1]]) {
            Dr.bold().line(px(x), py(B.SECTION_Y), px(x + s * 0.95), py(B.SECTION_Y));
            Dr.med().line(px(x), py(B.SECTION_Y), px(x), py(B.SECTION_Y - 0.7));
            Dr.fill([px(x), py(B.SECTION_Y - 1.05), px(x) - 3.4, py(B.SECTION_Y - 0.55), px(x) + 3.4, py(B.SECTION_Y - 0.55)], 1, 6);
            Dr.med().text('B', px(x), py(B.SECTION_Y + 0.62), 6.4, { align: 'center' });
        }
        Dr.fine().line(px(0), py(-0.2), px(0), py(-0.75)).line(px(W), py(-0.2), px(W), py(-0.75));
        Blueprint.dimH(Dr, py(-0.55), px(0), px(W), { label: W.toFixed(3), cap: 4.6 });
        Dr.fine().line(px(W + 0.25), py(0), px(W + 2.55), py(0)).line(px(W + 0.25), py(D), px(W + 2.55), py(D));
        Blueprint.dimV(Dr, px(W + 2.3), py(0), py(D), { label: D.toFixed(3), side: 1, cap: 5 });
        Blueprint.title(Dr.group('pl.title'), px(W / 2), py(D) + 40, 'GROUND FLOOR PLAN', 'SCALE 1:100', { cap: 7.6 });
    };
})();
