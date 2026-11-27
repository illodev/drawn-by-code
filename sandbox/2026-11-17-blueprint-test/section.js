// Section A–A, scale 1:100: the same lighthouse cut on its axis. Walls in poché, floors,
// the stair winding round its newel, the optic on its pedestal, the house broken off at the
// left, the foundations in the rock, and the levels.
(() => {
    const CX = 832, { Y, H, r, GY, M, WELL } = LH, PI = Math.PI;

    Sheet.parts.push('section');
    Sheet.section = (D) => {
        const P = LH.profile();
        D.group('se.axis').centre().line(CX, 24, CX, 612);
        D.group('se.ground').bold().line(688, 616, 999, 616);

        // --- cut walls: the outer face from the profile, the well's face inside ----------------
        const face = (side, ma, mb) => [[r(ma + 1e-4), ma], ...P.filter(([, m]) => m > ma + 1e-3 && m < mb - 1e-3), [r(mb - 1e-4), mb]].map(([rr, m]) => [CX + side * rr, Y(m)]);
        const wall = (side, ma, mb) => [...face(side, ma, mb), [CX + side * WELL, Y(mb)], [CX + side * WELL, Y(ma)]];
        const win = LH.WINDOWS.map((m) => [m - 0.9, m + 0.9]), open = { [-1]: [[0, 2.3], ...win], 1: win }; // the door and the front windows; the back windows
        const walls = [];
        for (const side of [-1, 1]) {
            let m0 = 0;
            for (const [a, b] of [...open[side], [H.neck, H.neck]]) { if (a > m0) walls.push(wall(side, m0, a)); m0 = b; }
        }
        // the gallery: corbel, deck and the watch room's ceiling in one piece
        const top = [...face(-1, H.neck, H.deck), ...face(1, H.neck, H.deck).reverse(), [CX + WELL, Y(H.neck)], [CX + WELL, Y(26.5)], [CX + 9, Y(26.5)], [CX + 9, Y(H.deck)], [CX - 9, Y(H.deck)], [CX - 9, Y(26.5)], [CX - WELL, Y(26.5)], [CX - WELL, Y(H.neck)]];
        const galleryL = [...face(-1, H.neck, H.deck), [CX - 9, Y(H.deck)], [CX - 9, Y(26.5)], [CX - WELL, Y(26.5)], [CX - WELL, Y(H.neck)]];
        const galleryR = galleryL.map(([x, y]) => [2 * CX - x, y]);
        const murette = (s) => [[CX + s * 33.5, Y(H.deck)], [CX + s * 33.5, Y(H.sill)], [CX + s * 34.5, Y(H.sill)], [CX + s * 34.5, Y(H.sill1)], [CX + s * 29.5, Y(H.sill1)], [CX + s * 29.5, Y(H.deck)]];
        const cut = [...walls, galleryL, galleryR, murette(-1), murette(1)];
        D.group('se.walls', { overlap: 0.3 }).bold();
        for (const p of cut) D.poly(p, true);
        D.group('se.hatch', { overlap: 0.05 }).pen(0.85, { a: 0.9 });
        for (const p of cut) D.hatch(p, { gap: 3.5 });
        // the window reveals seen beyond the cut
        D.group('se.reveals').fine();
        for (const side of [-1, 1]) for (const [a, b] of open[side]) {
            D.line(CX + side * r(a), Y(a), CX + side * r(b), Y(b)); // the embrasure's far jamb closes the wall's faces
            D.line(CX + side * WELL, Y(a), CX + side * WELL, Y(b));
            const xo = CX + side * (r((a + b) / 2) - 2.5);
            if (a === 0) { D.fine().line(xo + 14, Y(a), xo + 14, Y(b)); D.line(xo + 15.6, Y(a), xo + 15.6, Y(b)); continue; } // the door's leaf, at the middle of the wall
            D.med().line(xo, Y(a), xo, Y(b)); D.fine().line(xo - side * 1.6, Y(a), xo - side * 1.6, Y(b)); // the sash, near the outer face
            D.line(CX + side * (r(a) + 1.5), Y(a) + 1.2, CX + side * (r(a) - 4), Y(a) + 1.2); // its sill
        }

        // --- floors: slabs with the stair's opening, alternating sides -------------------------
        D.group('se.floors', { overlap: 0.3 });
        const slab = (x0, x1, m, th = 0.36) => { D.fill([x0, Y(m), x1, Y(m), x1, Y(m - th), x0, Y(m - th)], 0.82); D.med().rect(x0, Y(m), x1 - x0, th * M); };
        LH.FLOORS.forEach((m, i) => { const s = i % 2 ? 1 : -1; slab(CX - WELL, CX + s * 7 - 10, m); slab(CX + s * 7 + 10, CX + WELL, m); });
        slab(CX - WELL, CX + WELL, 0, 0.3);

        // --- the stair: a helix round the newel, 1½ turns a storey; the far half drawn faint ----
        D.group('se.stair', { overlap: 0.02 });
        const R = 23.5, levels = [0, ...LH.FLOORS, 26.5];
        D.fine().line(CX - 2.2, Y(0), CX - 2.2, Y(26.5)); D.line(CX + 2.2, Y(0), CX + 2.2, Y(26.5));
        for (let f = 0; f + 1 < levels.length; f++) {
            const ma = levels[f], mb = levels[f + 1] - (f + 2 < levels.length ? 0.36 : 0), n = 34, th0 = f % 2 ? PI * 0.55 : -PI * 0.45, turns = 1.5;
            const at = (i, rr, lift = 0) => { const th = th0 + (i / n) * turns * 2 * PI; return [CX + rr * Math.sin(th), Y(ma + ((mb - ma) * i) / n + lift), Math.cos(th)]; };
            for (const [lift, a] of [[0, 1], [0.95, 0.8]]) { // the string, then the handrail
                let run = [], front = null;
                for (let i = 0; i <= n * 4; i++) {
                    const p = at(i / 4, R, lift), isFront = p[2] >= 0;
                    if (front !== null && isFront !== front) { run.push([p[0], p[1]]); if (front || !lift) D.pen(front ? 1.05 : 0.75, { a: front ? a : 0.38 }).poly(run); run = []; }
                    run.push([p[0], p[1]]); front = isFront;
                }
                if (run.length > 1 && (front || !lift)) D.pen(front ? 1.05 : 0.75, { a: front ? a : 0.38 }).poly(run);
            }
            for (let i = 0; i <= n; i++) { // treads, with their risers at the string
                const o = at(i, R), c = at(i, 2.4), front = o[2] >= 0;
                D.pen(0.8, { a: front ? 0.9 : 0.3 }).line(c[0], c[1], o[0], o[1]);
                if (front && i < n) D.line(o[0], o[1], o[0], at(i + 1, R)[1]);
            }
        }

        // --- lantern: glazing, cornice, the dome's shell, the optic on its pedestal -------------
        D.group('se.lantern', { overlap: 0.2 });
        for (const s of [-1, 1]) {
            D.med().line(CX + s * 29.5, Y(H.sill1), CX + s * 29.5, Y(H.glass));
            D.fine().line(CX + s * 28.3, Y(H.sill1), CX + s * 28.3, Y(H.glass));
            D.fill([CX + s * 31.5, Y(H.glass), CX + s * 31.5, Y(H.cornice), CX + s * 27.5, Y(H.cornice), CX + s * 27.5, Y(H.glass)], 0.85);
            const outer = [], inner = [];
            for (let i = 0; i <= 14; i++) { const m = H.cornice + ((H.dome - H.cornice) * i) / 14; outer.push([CX + s * LH.dome(m), Y(m)]); inner.push([CX + s * Math.max(1.2, LH.dome(m) - 2), Y(m) + 1.6]); }
            D.bold().poly(outer); D.fine().poly(inner);
            for (const f of [1 / 3, 2 / 3]) { const y = Y(H.sill1 + (H.glass - H.sill1) * f); D.line(CX + s * 29.5, y, CX + s * 26.5, y); }
            // the gallery rail: its standard and rails
            D.med().line(CX + s * 45.5, Y(H.deck), CX + s * 45.5, Y(H.rail + 0.1));
            D.fine(); for (const m of [H.rail, H.deck + 0.75, H.deck + 0.4]) D.line(CX + s * 47, Y(m), CX + s * 44, Y(m));
        }
        D.med().rect(CX - 2.5, Y(H.ball) + 4.2, 5, Y(H.dome) - Y(H.ball) - 4.2);
        D.circle(CX, Y(H.ball), 5.2);
        D.line(CX, Y(H.ball) - 5.2, CX, Y(H.top));
        Sheet.optic(D, CX, Y(H.focal) - 18.2, 0.25, true);
        D.med().poly([CX - 4.5, Y(H.focal) + 19, CX - 4.5, Y(H.deck), CX + 4.5, Y(H.deck), CX + 4.5, Y(H.focal) + 19]);
        D.line(CX - 8, Y(H.deck) - 1.6, CX + 8, Y(H.deck) - 1.6);

        // --- the house, cut along its ridge and broken off -------------------------------------
        D.group('se.house', { overlap: 0.2 });
        const bx = 738, wl = CX - r(3.2);
        D.med().line(bx, 447, CX - r(5.57), 447); D.line(bx, 450.5, CX - r(5.3), 450.5);
        D.fill([bx, 447, CX - r(5.57), 447, CX - r(5.3), 450.5, bx, 450.5], 0.7);
        D.med().line(bx, 480, wl, 480); D.fine().line(bx, 483, wl + 0.3, 483);
        for (let x = bx + 9; x < wl - 3; x += 11) D.fine().line(x, 450.5, x, 480); // rafters beyond
        D.med().rect(bx, GY, wl - bx + 2, 4.2);
        D.fine().rect(747, 493, 13, 23); D.line(753.5, 493, 753.5, 516); D.line(747, 504.5, 760, 504.5);
        D.med().poly([bx, 440, bx, 462, bx - 3.5, 466, bx + 3.5, 472, bx, 476, bx, 500, bx - 3.5, 504, bx + 3.5, 510, bx, 514, bx, 534]); // the break line

        // --- foundations and the rock ------------------------------------------------------------
        const footL = [[CX - 66, GY], [CX - WELL + 3, GY], [CX - WELL + 3, 583], [CX - 66, 583]];
        const footR = footL.map(([x, y]) => [2 * CX - x, y]);
        const padL = [[CX - 80, 583], [CX - WELL + 14, 583], [CX - WELL + 14, 598], [CX - 80, 598]], padR = padL.map(([x, y]) => [2 * CX - x, y]);
        const land = [[688, 616], [688, 557], [704, 550], [722, 541], [738, 531], [bx, 529.2], [wl + 2, 529.2], [CX - 66, 529.2], [CX - 66, GY], [CX + 62, GY], [CX + 75, 527], [CX + 88, 533], [CX + 104, 541], [CX + 124, 552], [CX + 146, 578], [CX + 158, 600], [999, 616]];
        D.group('se.found', { overlap: 0.2 }).bold();
        D.poly(footL, true); D.poly(footR, true); D.med().poly(padL, true); D.poly(padR, true);
        D.group('se.foundHatch', { overlap: 0.05 }).pen(0.85, { a: 0.9 });
        for (const p of [footL, footR]) { D.hatch(p, { gap: 3.5 }); D.hatch(p, { gap: 7, angle: PI / 4 }); }
        D.pen(0.8).stipple(padL, { n: 150, seed: 'padL', r: 0.55 }); D.stipple(padR, { n: 150, seed: 'padR', r: 0.55 });
        D.group('se.earth', { overlap: 0.05 }).pen(0.9, { a: 0.85 });
        D.hatch(land, { gap: 7.5, holes: [footL, footR, padL, padR, [[CX - WELL, GY], [CX + WELL, GY], [CX + WELL, GY + 4.2], [CX - WELL, GY + 4.2]]] });
        D.group('se.rock', { overlap: 0.05 });
        D.pen(1.4, { cap: 'round' }).poly(land.slice(1, 6)); D.poly(land.slice(9));
        Sheet.freehand(D, Sheet.TRACE.slope.filter((s) => s[2] > 528), { dy: 0 });

        // --- levels ---------------------------------------------------------------------------------
        D.group('se.levels', { overlap: 0.15 });
        const lev = [[H.focal, 'FOCAL PLANE'], [H.deck, 'GALLERY'], [LH.FLOORS[2], 'TOWER FLOOR 3'], [LH.FLOORS[1], 'TOWER FLOOR 2'], [LH.FLOORS[0], 'TOWER FLOOR 1'], [0, 'ENTRANCE']];
        for (const [m, name] of lev) Blueprint.level(D, 919.5, Y(m), `${name}  EL. +${LH.fig(LH.EL0 + m)}`, { from: CX + r(m + 1e-3) + 3 });
        Blueprint.title(D.group('se.title'), 833, 635, 'SECTION A–A', 'SCALE 1:100');
    };
})();
