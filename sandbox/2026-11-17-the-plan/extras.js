// The rest of the sheet, in white: notes, the legend, detail C (the strong room's door at
// 1:25), the revision table and the title block.
(() => {
    const B = Bank, PI = Math.PI;
    Film.DETAIL = { x: 1400, y: 468, k: 96 };
    Film.extras = (D) => {
        // --- notes ---------------------------------------------------------------------------
        const nx = 968;
        D.group('ex.notes', { overlap: 0.06 }).med().text('NOTES', nx, 88, 6.4, { track: 0.24 }).line(nx, 92, nx + 42, 92);
        const beat = Math.round(B.lengthOf(B.BEAT) / B.VG);
        ['1.  ALL DIMENSIONS IN METRES. LEVELS FROM THE BANKING HALL FLOOR.', '2.  STRONG ROOM UNDER TELLERS; ITS DOOR OPENS TO THE LOBBY. SEE B–B AND DETAIL C.',
            '3.  CAMERAS PAN BETWEEN THE LIMITS DRAWN, AT THE REACH DRAWN.', `4.  ONE GUARD AT NIGHT. HE WALKS HIS BEAT ONCE IN ${beat} s.`, '5.  DUCT RISER FROM LOBBY TO ROOF, 900 x 900 CLEAR. CAT LADDER ON THE WEST PARAPET.']
            .forEach((s, i) => D.fine().text(s, nx, 108 + i * 12.5, 4.1, { track: 0.14 }));
        // --- legend ----------------------------------------------------------------------------
        const ly = 196;
        D.group('ex.legend', { overlap: 0.08 }).med().text('LEGEND', nx, ly, 6.4, { track: 0.24 }).line(nx, ly + 4, nx + 49, ly + 4);
        const row = (i) => ly + 24 + i * 15;
        D.fill([nx + 2, row(0) - 5, nx + 9, row(0) - 5, nx + 9, row(0), nx + 2, row(0)], 0.95, 5).med().poly([nx + 9, row(0) - 4, nx + 13, row(0) - 6, nx + 13, row(0) + 1, nx + 9, row(0) - 1], true);
        D.fine().poly([nx + 36, row(0) - 8, nx + 15, row(0) - 2.5, nx + 36, row(0) + 3]);
        D.pen(1.1, { dash: [0.6, 3.6], cap: 'round' }).line(nx + 2, row(1) - 2.5, nx + 36, row(1) - 2.5);
        D.med().rect(nx + 12, row(2) - 7.5, 10, 10).fine().line(nx + 12, row(2) - 7.5, nx + 22, row(2) + 2.5).line(nx + 22, row(2) - 7.5, nx + 12, row(2) + 2.5);
        D.hidden().line(nx + 2, row(3) - 2.5, nx + 36, row(3) - 2.5);
        D.med().poly([nx + 17, row(4) - 8, nx + 22.4, row(4) + 1.2, nx + 11.6, row(4) + 1.2], true);
        ['CAMERA, AND ITS SWEEP', "GUARD'S BEAT", 'DUCT RISER', 'HIDDEN, OR BELOW', 'REVISION'].forEach((s, i) => D.fine().text(s, nx + 48, row(i), 4.1, { track: 0.14 }));
        // north point
        const ax = 1500, ay = 118;
        D.group('ex.north', { overlap: 0.2 }).med().circle(ax, ay, 15);
        D.fill([ax, ay - 23, ax - 4.2, ay + 9, ax, ay + 4, ax + 4.2, ay + 9], 0.95, 6).fine().line(ax, ay + 4, ax, ay + 22).text('N', ax, ay - 27, 5.6, { align: 'center' });
        // --- detail C: the strong room's door -----------------------------------------------------
        const { x: cx, y: cy, k } = Film.DETAIL;
        D.group('ex.detail', { overlap: 0.2 }).centre().line(cx - 1.5 * k, cy, cx + 1.45 * k, cy).line(cx, cy - 1.42 * k, cx, cy + 1.42 * k);
        // the lobby's floor under it
        D.bold().line(cx - 3.7 * k, cy + 1.15 * k, cx + 1.7 * k, cy + 1.15 * k);
        D.pen(0.8, { a: 0.7 }).hatch([cx - 3.7 * k, cy + 1.15 * k, cx + 1.7 * k, cy + 1.15 * k, cx + 1.7 * k, cy + 1.24 * k, cx - 3.7 * k, cy + 1.24 * k], { gap: 3.4 });
        D.fine().line(cx - k, cy + 1.3 * k, cx - k, cy + 1.62 * k).line(cx + k, cy + 1.3 * k, cx + k, cy + 1.62 * k);
        Blueprint.dimH(D, cy + 1.52 * k, cx - k, cx + k, { label: 'Ø 2.000', cap: 5.4 });
        D.fine().poly([cx + 0.78 * k, cy - 0.78 * k, cx + 1.25 * k, cy - 1.22 * k, cx + 1.62 * k, cy - 1.22 * k]).text('8 BOLTS', cx + 1.27 * k, cy - 1.26 * k, 4.2);
        D.poly([cx + 0.2 * k, cy + 0.3 * k, cx + 1.22 * k, cy + 1.12 * k, cx + 1.62 * k, cy + 1.12 * k]).text('HAND WHEEL', cx + 1.24 * k, cy + 1.08 * k, 4.2);
        Blueprint.title(D.group('ex.detailTitle'), cx, cy + 1.96 * k, 'DETAIL C · STRONG ROOM DOOR', 'SCALE 1:25', { cap: 6.6 });
        // --- revisions and the title block -----------------------------------------------------------
        const x0 = 1262, x1 = 1562, r0 = 1090, b0 = 1150; // the revision table, the title block under it
        D.group('tb.frame', { overlap: 0.3 }).bold().rect(x0, b0, x1 - x0, 120).med();
        for (const y of [30, 50, 74, 98]) D.line(x0, b0 + y, x1, b0 + y);
        D.line(x0 + 150, b0 + 50, x0 + 150, b0 + 98);
        D.med().rect(x0, r0, x1 - x0, 48).line(x0, r0 + 16, x1, r0 + 16).line(x0, r0 + 32, x1, r0 + 32).line(x0 + 34, r0, x0 + 34, r0 + 48).line(x1 - 78, r0, x1 - 78, r0 + 48);
        D.group('tb.text', { overlap: 0.08 }).med();
        D.text('FIRST MERIDIAN BANK', (x0 + x1) / 2, b0 + 21, 9.4, { align: 'center', track: 0.16 });
        D.text('PLANS, SECTION AND AXONOMETRIC', (x0 + x1) / 2, b0 + 43.5, 5, { align: 'center', track: 0.18 });
        D.fine().text('DRG NO.', x0 + 9, b0 + 65.5, 4.2).med().text('0412', x0 + 52, b0 + 66, 6.4).fine().text('REV.', x0 + 159, b0 + 65.5, 4.2);
        D.fine().text('SCALE', x0 + 9, b0 + 89.5, 4.2).med().text('1:100', x0 + 52, b0 + 90, 5.6).fine().text('DATE', x0 + 159, b0 + 89.5, 4.2).med().text('17 NOV 2026', x0 + 196, b0 + 90, 5.6);
        D.med().text('ILLODEV x CLAUDE', (x0 + x1) / 2, b0 + 112.5, 5.6, { align: 'center', track: 0.24 });
        D.fine().text('REV', x0 + 17, r0 + 11.5, 3.8, { align: 'center' }).text('DESCRIPTION', x0 + 42, r0 + 11.5, 3.8).text('DATE', x1 - 70, r0 + 11.5, 3.8);
        D.text('A', x0 + 17, r0 + 27.5, 4.4, { align: 'center' }).text('FIRST ISSUE', x0 + 42, r0 + 27.5, 4).text('03 NOV 2026', x1 - 70, r0 + 27.5, 4);
        D.group('tb.revA').med().text('A', x0 + 196, b0 + 66, 6.4);
        // rev. B: lettered at the end
        D.group('tb.revB', { overlap: 0.1 }).fine().text('B', x0 + 17, r0 + 43.5, 4.4, { align: 'center' }).text("GUARD'S BEAT CHANGED", x0 + 42, r0 + 43.5, 4).text('17 NOV 2026', x1 - 70, r0 + 43.5, 4);
        D.group('tb.revCell', { overlap: 0.3 }).med().line(x0 + 193, b0 + 63, x0 + 205, b0 + 63).text('B', x0 + 212, b0 + 66, 6.4);
        Film.TICK = [x0 + 96, b0 + 64];
        Film.BLOCK = [x0, r0, x1 - x0, b0 + 120 - r0];
    };
})();
