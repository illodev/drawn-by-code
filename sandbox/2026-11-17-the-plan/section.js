// Section B–B, scale 1:100, in white: cut along the hall, looking north, drawn straight under
// the plan so that every wall drops onto its own line. Above ground the hall's north wall is
// seen beyond the cut (the doors, the counter and its screen); below, the lobby's, with the
// grille the riser ends in and the strong room's round door.
(() => {
    const B = Bank, { px, sz, py, S, W, T, Z } = B, PI = Math.PI, m = (v) => v * S;
    const box = (x0, z0, x1, z1) => [px(x0), sz(z0), px(x1), sz(z0), px(x1), sz(z1), px(x0), sz(z1)];
    const [dx, , ds] = B.DUCT, DC = B.STRONG;
    Film.section = (D) => {
        // --- projection: the plan's walls and the riser dropped onto the section ----------------------
        D.group('pj.down', { overlap: 0.35 }).pen(0.75, { a: 0.5 });
        for (const x of [0, W]) D.line(px(x), py(B.D) + 3, px(x), sz(Z.parapet) - 3);
        D.pen(0.75, { a: 0.6 });
        for (const x of [dx, dx + ds]) D.line(px(x), py(B.DUCT[1] + ds) + 2, px(x), sz(Z.cowl) - 3);

        // --- what the cut goes through: walls, slabs, footings --------------------------------------
        const cut = [
            [px(0), sz(Z.parapet), px(T), sz(Z.parapet), px(T), sz(Z.baseSlab), px(0), sz(Z.baseSlab)],
            [px(W - T), sz(Z.parapet), px(W), sz(Z.parapet), px(W), sz(Z.baseSlab), px(W - T), sz(Z.baseSlab)],
            box(T, Z.roofTop, W - T, Z.roof), box(T, 0, W - T, Z.slab),
            [px(-0.5), sz(Z.base), px(W + 0.5), sz(Z.base), px(W + 0.5), sz(Z.baseSlab - 0.25), px(-0.5), sz(Z.baseSlab - 0.25)],
        ];
        D.group('se.cut', { overlap: 0.3 }).bold();
        D.poly([px(0), sz(Z.base), px(0), sz(Z.parapet), px(T), sz(Z.parapet), px(T), sz(Z.roofTop), px(W - T), sz(Z.roofTop), px(W - T), sz(Z.parapet), px(W), sz(Z.parapet), px(W), sz(Z.base)]);
        D.line(px(T), sz(Z.roof), px(W - T), sz(Z.roof));
        D.poly([px(T), sz(Z.roof), px(T), sz(0), px(W - T), sz(0), px(W - T), sz(Z.roof)]);
        D.poly([px(T), sz(Z.slab), px(W - T), sz(Z.slab)]);
        D.poly([px(T), sz(Z.slab), px(T), sz(Z.base), px(W - T), sz(Z.base), px(W - T), sz(Z.slab)]);
        D.poly([px(0), sz(Z.base), px(-0.5), sz(Z.base), px(-0.5), sz(Z.baseSlab - 0.25), px(W + 0.5), sz(Z.baseSlab - 0.25), px(W + 0.5), sz(Z.base), px(W), sz(Z.base)]);
        D.group('se.tone', { overlap: 0.3 });
        for (const p of cut) D.fill(p, 0.3, 26);
        D.pen(0.8, { a: 0.8 });
        for (const p of cut.slice(2)) D.hatch(p, { gap: 3.2 });

        // --- the ground outside, and earth against the basement -------------------------------------
        D.group('se.earth', { overlap: 0.06 }).bold().line(px(-2.7), sz(0), px(0), sz(0)).line(px(W), sz(0), px(W + 2.7), sz(0));
        D.pen(0.85, { a: 0.75 });
        D.hatch([px(-2.7), sz(0), px(0), sz(0), px(0), sz(Z.base), px(-0.5), sz(Z.base), px(-0.5), sz(Z.baseSlab - 0.25), px(-2.7), sz(Z.baseSlab - 0.25)], { gap: 7 });
        D.hatch([px(W + 2.7), sz(0), px(W), sz(0), px(W), sz(Z.base), px(W + 0.5), sz(Z.base), px(W + 0.5), sz(Z.baseSlab - 0.25), px(W + 2.7), sz(Z.baseSlab - 0.25)], { gap: 7 });

        // --- beyond the cut, ground floor: the hall's north wall ----------------------------------------
        D.group('se.hall', { overlap: 0.1 });
        const leaf = (a, b, h, z0 = 0) => { D.med().rect(px(a), sz(z0 + h), m(b - a), m(h)); D.fine().rect(px(a) + 1.6, sz(z0 + h) + 1.6, m(b - a) - 3.2, m(h) - 1.6); };
        leaf(...B.DOORS.manager, 2.1); leaf(...B.DOORS.store, 2.1); leaf(...B.DOORS.stair, 2.1);
        for (const [a, b] of [B.DOORS.manager, B.DOORS.store, B.DOORS.stair]) D.dot(px(b) - 4, sz(1.02), 0.9);
        D.med().rect(px(B.DOORS.lift[0]), sz(2.2), m(1.4), m(2.2)).fine().line(px(30.1), sz(2.2), px(30.1), sz(0)).rect(px(31.05), sz(1.35), m(0.22), m(0.34));
        // the counter: its front in panels, the top, the screen with a hatch at each position
        const [c0, c1] = B.COUNTER;
        D.med().rect(px(c0), sz(1.05), m(c1 - c0), m(1.05)).line(px(c0 - 0.06), sz(1.1), px(c1 + 0.06), sz(1.1));
        D.fine().rect(px(c0), sz(2.35), m(c1 - c0), m(1.25)).line(px(c0), sz(2.22), px(c1), sz(2.22));
        for (let i = 0; i <= 5; i++) {
            const x = c0 + ((c1 - c0) * i) / 5;
            if (i > 0 && i < 5) D.fine().line(px(x), sz(2.35), px(x), sz(0));
            if (i < 5) { const cxm = x + (c1 - c0) / 10; D.fine().rect(px(cxm - 0.42), sz(1.5), m(0.84), m(0.4)); D.rect(px(x + 0.2), sz(0.86), m((c1 - c0) / 5 - 0.4), m(0.68)); }
        }
        D.pen(0.75, { a: 0.6 }).line(px(T), sz(3.55), px(W - T), sz(3.55)); // a picture rail
        // the riser behind the wall (hidden), and its cowl above the roof
        D.group('se.duct', { overlap: 0.3 }).hidden();
        for (const x of [dx, dx + ds]) D.line(px(x), sz(Z.roof), px(x), sz(0)).line(px(x), sz(Z.slab), px(x), sz(B.LOBBY.grille + 0.25));
        D.med().poly([px(dx), sz(Z.roofTop), px(dx), sz(Z.cowl - 0.35), px(dx - 0.2), sz(Z.cowl - 0.35), px(dx - 0.2), sz(Z.cowl), px(dx + ds + 0.2), sz(Z.cowl), px(dx + ds + 0.2), sz(Z.cowl - 0.35), px(dx + ds), sz(Z.cowl - 0.35), px(dx + ds), sz(Z.roofTop)]);
        D.fine(); for (let z = Z.roofTop + 0.3; z < Z.cowl - 0.45; z += 0.22) D.line(px(dx) + 2, sz(z), px(dx + ds) - 2, sz(z));

        // --- beyond the cut, basement: the lobby's north wall -------------------------------------------
        D.group('se.lobby', { overlap: 0.1 });
        leaf(3.0, 3.9, 2.1, Z.base); leaf(...B.DOORS.stair, 2.1, Z.base);
        D.dot(px(3.9) - 4, sz(Z.base + 1.02), 0.9).dot(px(B.DOORS.stair[1]) - 4, sz(Z.base + 1.02), 0.9);
        D.med().rect(px(B.DOORS.lift[0]), sz(Z.base + 2.2), m(1.4), m(2.2)).fine().line(px(30.1), sz(Z.base + 2.2), px(30.1), sz(Z.base));
        // the grille the riser ends in
        const gz = B.LOBBY.grille;
        D.med().rect(px(dx - 0.06), sz(gz + 0.31), m(ds + 0.12), m(0.62));
        D.fine(); for (let z = gz - 0.22; z < gz + 0.26; z += 0.11) D.line(px(dx) + 1.4, sz(z), px(dx + ds) - 1.4, sz(z));
        // the door is small here: a ring round it and a bubble send the reader to detail C
        D.centre().circle(px(DC.door), sz(DC.cz), m(1.62));
        D.fine().line(px(DC.door) + m(1.62), sz(DC.cz), px(DC.door) + m(1.62) + 9, sz(DC.cz)).circle(px(DC.door) + m(1.62) + 14.5, sz(DC.cz), 5.5).text('C', px(DC.door) + m(1.62) + 14.5, sz(DC.cz) + 2.2, 4.4, { align: 'center' });
        // plant, seen through nothing: two tanks drawn on the wall's far side, hidden
        D.hidden().rect(px(1.0), sz(Z.base + 1.9), m(1.5), m(1.9)).rect(px(4.6), sz(Z.base + 1.5), m(1.7), m(1.5));
        D.pen(0.75, { a: 0.6 }).line(px(T), sz(Z.base + 2.75), px(W - T), sz(Z.base + 2.75)); // a dado of pipes
        D.pen(0.75, { a: 0.6 }).line(px(T), sz(Z.base + 2.9), px(W - T), sz(Z.base + 2.9));

        // --- names, levels, title ---------------------------------------------------------------------
        D.group('se.names', { overlap: 0.1 }).med();
        const name = (s, x, z, cap = 5.2, o = {}) => D.text(s, px(x), sz(z), cap, { align: 'center', track: 0.2, ...o });
        name('BANKING HALL', 20.6, 2.95, 5.6, { track: 0.3 }); name('LOBBY', 7.4, Z.base + 1.55, 5); name('STRONG ROOM', DC.door, DC.cz + 1.48, 4.4);
        name('PLANT', 3.45, Z.base + 2.35, 3.6); name('STORE', 9.5, 2.36, 3.6); name('MANAGER', 3.45, 2.36, 3.6); name('STAIR', 26.5, 2.36, 3.6); name('LIFT', 30.1, 2.46, 3.6);
        D.fine().text('DUCT', px(dx + ds) + 5, sz(Z.cowl - 0.42), 3.7);
        D.group('se.levels', { overlap: 0.2 });
        for (const [z, s] of [[Z.roofTop, 'ROOF  +' + Z.roofTop.toFixed(3)], [0, 'GROUND FLOOR  ±0.000'], [Z.base, 'BASEMENT  −' + (-Z.base).toFixed(3)]]) Blueprint.level(D, px(W + 1.45), sz(z), s, { cap: 4.6, from: px(W) + 3 });
        Blueprint.title(D.group('se.title'), px(W / 2), sz(Z.baseSlab) + 34, 'SECTION B–B', 'SCALE 1:100', { cap: 7.6 });
    };

    // --- the strong room's door, every frame: a disc on its hinge, a hand wheel, eight bolts ------------
    // k: units to the metre. on 0..1 drafted; wheel: turns; bolts 0..1 drawn back; open 0..1 swung.
    // inside(g): draws what is seen through the opening (it is clipped to it).
    Film.door = (g, cx, cy, k, o = {}) => {
        const on = o.on ?? 1, wheel = o.wheel ?? 0, bolts = o.bolts ?? 0, open = o.open ?? 0, R = k * 1.0, lw = (o.lw ?? 1) * 0.62;
        if (on <= 0) return;
        const arc = (r, a0 = 0, a1 = PI * 2, w = 1.3) => { g.lineWidth = w * lw; g.beginPath(); g.arc(cx, cy, r, a0, a0 + (a1 - a0) * Math.min(1, on * 1.4)); g.stroke(); };
        g.save();
        g.strokeStyle = g.fillStyle = '#fff';
        // the frame: two rings and the hinge
        arc(R * 1.24, -PI / 2, PI * 1.5, 1.75); arc(R, -PI / 2, PI * 1.5, 1.3);
        g.globalAlpha = Math.min(1, on * 2);
        g.lineWidth = 1.3 * lw;
        for (const s of [-0.55, 0.55]) g.strokeRect(cx - R * 1.42, cy + R * s - R * 0.13, R * 0.22, R * 0.26);
        if (open > 0.02 && o.inside) { g.save(); g.beginPath(); g.arc(cx, cy, R - 0.6 * lw, 0, PI * 2); g.clip(); o.inside(g); g.restore(); }
        // the leaf, turning on the hinge side: seen more and more edge-on
        const hx = cx - R * 1.2, c = Math.cos((open * 80 * PI) / 180);
        g.translate(hx, 0); g.scale(c, 1); g.translate(-hx, 0);
        g.globalAlpha = Math.min(1, on * 1.6);
        if (open > 0.02) { g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(cx, cy, R * 0.985, 0, PI * 2); g.fill(); g.restore(); g.save(); g.globalAlpha = 0.16; g.beginPath(); g.arc(cx, cy, R * 0.985, 0, PI * 2); g.fill(); g.restore(); }
        g.lineWidth = 1.75 * lw; g.beginPath(); g.arc(cx, cy, R * 0.985, 0, PI * 2 * Math.min(1, on * 1.3)); g.stroke();
        g.lineWidth = 0.95 * lw; g.beginPath(); g.arc(cx, cy, R * 0.86, 0, PI * 2 * Math.min(1, on * 1.3)); g.stroke();
        g.beginPath(); g.arc(cx, cy, R * 0.6, 0, PI * 2 * Math.min(1, on * 1.3)); g.stroke();
        if (on > 0.5) {
            g.globalAlpha = Math.min(1, (on - 0.5) * 2);
            // bolts: bars that reach into the frame, drawn back by the wheel
            for (let i = 0; i < 8; i++) {
                const a = (i * PI) / 4 + PI / 8, r0 = R * (0.6 - 0.0 * bolts), r1 = R * (1.1 - 0.2 * bolts), w = R * 0.045;
                g.save(); g.translate(cx, cy); g.rotate(a);
                g.lineWidth = 0.95 * lw; g.strokeRect(r0, -w, r1 - r0, 2 * w);
                g.globalAlpha *= 0.5; g.fillRect(r0 + (r1 - r0) * 0.72, -w, (r1 - r0) * 0.28, 2 * w);
                g.restore();
            }
            // the hand wheel and its hub
            g.save(); g.translate(cx, cy); g.rotate(wheel);
            g.lineWidth = 1.5 * lw; g.beginPath(); g.arc(0, 0, R * 0.36, 0, PI * 2); g.stroke();
            g.lineWidth = 0.95 * lw; g.beginPath(); g.arc(0, 0, R * 0.31, 0, PI * 2); g.stroke();
            for (let i = 0; i < 5; i++) { const a = (i * PI * 2) / 5; g.lineWidth = 1.3 * lw; g.beginPath(); g.moveTo(Math.cos(a) * R * 0.09, Math.sin(a) * R * 0.09); g.lineTo(Math.cos(a) * R * 0.31, Math.sin(a) * R * 0.31); g.stroke(); g.beginPath(); g.arc(Math.cos(a) * R * 0.36, Math.sin(a) * R * 0.36, R * 0.035, 0, PI * 2); g.fill(); }
            g.restore();
            g.lineWidth = 1.3 * lw; g.beginPath(); g.arc(cx, cy, R * 0.09, 0, PI * 2); g.stroke();
            g.beginPath(); g.arc(cx, cy, R * 0.03, 0, PI * 2); g.fill();
        }
        g.restore();
    };
    // the wall of boxes seen through the open door; `on` 0..1 as it is drafted, row by row
    Film.boxes = (g, cx, cy, k, on) => {
        if (on <= 0) return;
        const bw = 0.3 * k, bh = 0.2 * k, R = k;
        g.save();
        g.strokeStyle = g.fillStyle = '#fff';
        g.lineWidth = Math.max(0.5, k * 0.008);
        const rows = Math.ceil((2 * R) / bh), cols = Math.ceil((2 * R) / bw) + 1, shown = on * rows;
        for (let r = 0; r < Math.min(rows, Math.ceil(shown)); r++) {
            const y = cy - R + r * bh, a = Math.min(1, shown - r);
            g.globalAlpha = 0.8 * a;
            g.beginPath(); g.moveTo(cx - R, y); g.lineTo(cx - R + 2 * R * a, y); g.stroke();
            for (let c = 0; c <= cols * a; c++) { const x = cx - R + c * bw - 0.1 * k; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + bh); g.stroke(); g.beginPath(); g.arc(x + bw * 0.5, y + bh * 0.55, Math.max(0.42, k * 0.011), 0, PI * 2); g.fill(); }
        }
        g.restore();
    };
    // where box 0412 is in that wall (centre, in metres from the door's centre)
    Film.BOX = [0.25, -0.3]; // the middle of a box: column 4, row 3 of the wall as Film.boxes draws it
})();
