// Front elevation, scale 1:100: the tower, the keeper's house, the terrace, dimensions.
(() => {
    const CX = 424, { Y, H, r, GY, M } = LH, PI = Math.PI;
    const lit = (u) => 0.1 + 0.55 * Blueprint.noise.sstep(-0.1, -0.85, u) + 0.3 * Blueprint.noise.sstep(0.55, 0.95, u); // how strongly the stone joints show round the drum
    Sheet.EL = { CX };

    Sheet.parts.push('elevation');
    Sheet.elevation = (D) => {
        // --- axis and ground ------------------------------------------------------------
        D.group('el.axis').centre().line(CX, 24, CX, 606);
        D.group('el.ground').bold().line(153, GY, 493, GY);

        // --- the tower's outline, each side from the ground up -----------------------------
        const P = LH.profile();
        D.group('el.outL').bold().poly(P.map(([rr, m]) => [CX - rr, Y(m)]));
        D.group('el.outR').bold().poly(P.map(([rr, m]) => [CX + rr, Y(m)]));
        // the horizontal edges of each ring
        D.group('el.bands', { overlap: 0.3 }).med();
        for (const m of [H.plinth, H.belt, H.neck, H.neck1, H.deck0, H.deck, H.sill, H.sill1, H.glass, H.cornice]) {
            const rr = Math.max(r(m - 1e-4), r(m + 1e-4));
            D.line(CX - rr, Y(m), CX + rr, Y(m));
        }
        D.fine().line(CX - 59.5, Y(5.3), CX + 59.5, Y(5.3));
        // corbels under the gallery: a ring of 20 brackets, the front ones seen
        D.group('el.corbels', { overlap: 0.3 }).fine();
        for (let k = -4; k <= 4; k++) {
            const th = (k * PI) / 10, s = Math.sin(th), c = Math.cos(th), hw = 2.6 * c;
            for (const side of [-1, 1]) {
                const pts = [];
                for (let i = 0; i <= 6; i++) { const m = H.neck1 + ((H.deck0 - H.neck1) * i) / 6; pts.push([CX + r(m) * s + side * hw * (0.55 + 0.45 * (i / 6)), Y(m)]); }
                D.poly(pts);
            }
            D.line(CX + 39.6 * s - hw * 0.55, Y(H.neck1 + 0.12), CX + 39.6 * s + hw * 0.55, Y(H.neck1 + 0.12));
        }

        // --- gallery railing: 24 standards round the deck, three rails --------------------
        D.group('el.rail', { overlap: 0.25 }).fine();
        for (const m of [H.rail, H.rail - 0.12, H.deck + 0.75, H.deck + 0.4]) D.line(CX - 46, Y(m), CX + 46, Y(m));
        for (let k = -6; k <= 6; k++) {
            const x = CX + 45.5 * Math.sin((k * PI) / 12);
            D.line(x, Y(H.deck), x, Y(H.rail + 0.1));
        }

        // --- lantern: murette, glazing with 16 astragals round it, cornice, dome, vent ball ----
        D.group('el.lantern', { overlap: 0.25 }).med();
        for (let k = -3; k <= 3; k++) { const x = CX + 29.5 * Math.sin((k * PI) / 8); D.line(x, Y(H.sill1), x, Y(H.glass)); D.fine(); }
        for (const f of [1 / 3, 2 / 3]) { const m = H.sill1 + (H.glass - H.sill1) * f; D.line(CX - 29.5, Y(m), CX + 29.5, Y(m)); D.line(CX - 29.5, Y(m) + 1.4, CX + 29.5, Y(m) + 1.4); }
        for (const k of [-2, -1, 1, 2]) { const x = CX + 33.5 * Math.sin((k * PI) / 5.2); D.fine().line(x, Y(H.sill), x, Y(H.deck)); }
        // the optic seen through the glass
        D.faint().ellipse(CX, Y(H.focal), 12.9, 18, 0, PI * 2);
        for (const dy of [-9, -4.5, 0, 4.5, 9]) { const w = 12.9 * Math.sqrt(1 - (dy / 18) ** 2); D.line(CX - w, Y(H.focal) + dy, CX + w, Y(H.focal) + dy); }
        D.group('el.dome', { overlap: 0.3 }).fine();
        for (const k of [-3, -2, -1, 1, 2, 3]) {
            const s = Math.sin((k * PI) / 8), pts = [];
            for (let i = 0; i <= 12; i++) { const m = H.cornice + ((H.dome - H.cornice) * i) / 12; pts.push([CX + (LH.dome(m) - 0.5) * s, Y(m)]); }
            D.poly(pts);
        }
        D.med().rect(CX - 2.5, Y(H.ball) + 4.2, 5, Y(H.dome) - Y(H.ball) - 4.2);
        D.circle(CX, Y(H.ball), 5.2);
        D.line(CX, Y(H.ball) - 5.2, CX, Y(H.top));

        // --- windows on the axis ------------------------------------------------------------
        const boxes = [];
        D.group('el.windows', { overlap: 0.2 });
        for (const m of LH.WINDOWS) {
            const x = CX - 6.5, y = Y(m) - 12.5, w = 13, h = 25;
            boxes.push([x - 2.5, y - 3.5, w + 5, h + 6.5]);
            D.bold().rect(x, y, w, h);
            D.fine().rect(x + 1.8, y + 1.8, w - 3.6, h - 3.6);
            D.line(CX, y + 1.8, CX, y + h - 1.8);
            for (const f of [1 / 3, 2 / 3]) D.line(x + 1.8, y + 1.8 + (h - 3.6) * f, x + w - 1.8, y + 1.8 + (h - 3.6) * f);
            D.med().line(x - 2.2, y + h + 1.6, x + w + 2.2, y + h + 1.6);
            D.fine().line(x - 2.2, y + h + 3, x + w + 2.2, y + h + 3);
            D.line(x - 1.5, y - 2.2, x + w + 1.5, y - 2.2);
            D.line(x - 1.5, y - 2.2, x - 1.5, y); D.line(x + w + 1.5, y - 2.2, x + w + 1.5, y);
        }
        const clear = (x0, x1, y) => { // the parts of a horizontal run that miss the windows
            let runs = [[x0, x1]];
            for (const [bx, by, bw, bh] of boxes) if (y > by && y < by + bh) runs = runs.flatMap(([a, b]) => (b <= bx || a >= bx + bw ? [[a, b]] : [[a, bx], [bx + bw, b]].filter(([p, q]) => q - p > 0.5)));
            return runs;
        };

        // --- masonry: courses, and joints set out round the drum (so they crowd at the edges) ----
        D.group('el.courses', { overlap: 0.04 });
        const courses = [];
        for (let m = 0.5; m < H.plinth - 0.2; m += 0.5) courses.push(m);
        for (let m = H.belt + 0.4; m < H.neck - 0.2; m += 0.4) courses.push(m);
        const U = [-1, -0.8, -0.55, -0.25, 0.1, 0.5, 0.75, 1];
        courses.forEach((m, ci) => {
            const rr = r(m), y = Y(m);
            for (let i = 0; i + 1 < U.length; i++) {
                D.pen(0.8, { a: lit((U[i] + U[i + 1]) / 2) * 0.85 });
                for (const [a, b] of clear(CX + U[i] * rr, CX + U[i + 1] * rr, y)) D.line(a, y, b, y);
            }
            const top = ci + 1 < courses.length && courses[ci + 1] - m < 0.6 ? courses[ci + 1] : m < H.plinth ? H.plinth : H.neck;
            const n = m < H.plinth ? 22 : 28;
            for (let k = -Math.floor(n / 4); k <= Math.floor(n / 4); k++) {
                const th = ((k + (ci % 2) * 0.5) * 2 * PI) / n, s = Math.sin(th);
                if (Math.abs(th) > PI / 2 - 0.05) continue;
                const x0 = CX + rr * s, x1 = CX + r(top - 1e-4) * s, y1 = Y(top);
                if (boxes.some(([bx, by, bw, bh]) => x0 > bx && x0 < bx + bw && y > by && y1 < by + bh)) continue;
                D.pen(0.75, { a: lit(s) * 0.55 }).line(x0, y, x1, y1);
            }
        });
        // the rounding of the drum: light from the left, a reflected edge on the right
        D.group('el.shade');
        const drum = (m0, m1) => [CX - r(m0), Y(m0), CX + r(m0), Y(m0), CX + r(m1 - 1e-4), Y(m1), CX - r(m1 - 1e-4), Y(m1)];
        const tone = [[0, 0.5], [0.12, 0.42], [0.3, 0.2], [0.46, 0.04], [0.74, 0.0], [0.9, 0.1], [1, 0.26]];
        D.shade(drum(0, H.plinth), [CX - 61, 0, CX + 61, 0], tone);
        D.shade(drum(H.belt, H.neck), [CX - 50, 0, CX + 50, 0], tone);

        // --- the keeper's house -----------------------------------------------------------------
        const wallR = CX - r(3.2), eave = 480, ridge = 447;
        D.group('el.house', { overlap: 0.25 }).bold();
        D.poly([223, GY, 223, eave + 2.5]);
        D.poly([219, eave + 2.5, 219, eave, CX - r(3.2) + 0.5, eave]);
        D.med().line(219, eave + 2.5, wallR, eave + 2.5);
        D.poly([219.5, eave, 242, ridge, CX - r(5.5), ridge]);
        D.fine().line(243, ridge + 2, CX - r(5.4), ridge + 2);
        // chimneys with their caps and pots
        for (const cx of [249.5, 345]) {
            D.med().poly([cx - 7.5, ridge, cx - 7.5, 424, cx + 7.5, 424, cx + 7.5, ridge]);
            D.rect(cx - 9, 420.5, 18, 3.5);
            D.fine().line(cx - 7.5, 428, cx + 7.5, 428);
            for (const px of [-4.6, 1.2]) D.rect(cx + px, 414.5, 3.6, 6);
        }
        // sash windows, the door with its hood and panels, two steps
        D.group('el.joinery', { overlap: 0.15 });
        const hb = []; // boxes the wall's courses stop at
        for (const x of [245, 325]) {
            const y = 491, w = 16, h = 27;
            hb.push([x - 2.5, y - 3, w + 5, h + 6.5]);
            D.med().rect(x, y, w, h);
            D.fine().rect(x + 2, y + 2, w - 4, h - 4);
            D.line(x + w / 2, y + 2, x + w / 2, y + h - 2);
            for (const f of [1 / 3, 2 / 3]) D.line(x + 2, y + 2 + (h - 4) * f, x + w - 2, y + 2 + (h - 4) * f);
            D.med().line(x - 2.5, y + h + 1.6, x + w + 2.5, y + h + 1.6);
            D.fine().line(x - 2.5, y + h + 3.2, x + w + 2.5, y + h + 3.2);
            D.line(x - 1.5, y - 2.4, x + w + 1.5, y - 2.4);
        }
        hb.push([282, 484, 23, 42]);
        D.med().rect(285, 491, 17, 34);
        D.fine().rect(287, 497.5, 13, 27.5);
        D.line(293.5, 497.5, 293.5, GY);
        for (const [px, py, pw, ph] of [[288.4, 499.5, 3.8, 10], [294.8, 499.5, 3.8, 10], [288.4, 512, 3.8, 10.5], [294.8, 512, 3.8, 10.5]]) D.rect(px, py, pw, ph);
        D.line(287, 494.2, 300, 494.2);
        D.med().line(282.5, 488.5, 304.5, 488.5);
        D.fine().line(283.5, 486.6, 303.5, 486.6);
        D.ellipse(293.5, 486.6, 6.5, 2.6, PI, PI * 2);
        D.med().line(281, GY + 2.6, 306, GY + 2.6);
        D.fine().line(278.5, GY + 5, 308.5, GY + 5);
        // the yard wall and its pier
        D.group('el.yard', { overlap: 0.2 }).med();
        D.poly([223, 509, 165, 509]);
        D.fine().line(165, 511.6, 223, 511.6);
        D.med().rect(153, 504, 12, 21);
        D.rect(151.4, 500.6, 15.2, 3.4);
        // slates on the roof, ashlar on the walls
        D.group('el.stone', { overlap: 0.04 });
        const hip = (y) => 219.5 + ((242 - 219.5) * (eave - y)) / (eave - ridge);
        for (let i = 1, y = ridge + 4.6; y < eave - 1; y += 4.6, i++) {
            D.pen(0.8, { a: 0.6 }).line(hip(y) + 1, y, CX - r((GY - y) / M), y);
            D.pen(0.7, { a: 0.4 });
            for (let x = hip(y) + 4 + (i % 2) * 3.7; x < CX - r((GY - y) / M) - 1; x += 7.4) D.line(x, y, x, Math.min(y + 4.6, eave));
        }
        const walls = [[223, wallR, eave + 2.5, GY, 5.3, 12.5], [165, 223, 511.6, GY, 4.5, 11]];
        for (const [x0, x1, y0, y1, ch, cw] of walls) {
            for (let i = 0, y = y1 - ch; y > y0 + 1; y -= ch, i++) {
                const xr = x1 === wallR ? CX - r((GY - y) / M) : x1;
                let runs = [[x0, xr]];
                for (const [bx, by, bw, bh] of hb) if (y > by && y < by + bh) runs = runs.flatMap(([a, b]) => (b <= bx || a >= bx + bw ? [[a, b]] : [[a, bx], [bx + bw, b]].filter(([p, q]) => q - p > 0.5)));
                D.pen(0.8, { a: 0.55 });
                for (const [a, b] of runs) D.line(a, y, b, y);
                D.pen(0.7, { a: 0.42 });
                for (let x = x0 + cw * (0.5 + (i % 2) * 0.5); x < xr - 1; x += cw) if (!hb.some(([bx, by, bw, bh]) => x > bx && x < bx + bw && y + ch > by && y < by + bh)) D.line(x, y, x, y + ch);
            }
        }
        // quoins at the house's free corner
        D.pen(0.8, { a: 0.7 });
        for (let i = 0, y = GY - 5.3; y > eave + 3; y -= 5.3, i++) D.line(223, y, 223 + (i % 2 ? 7 : 4.5), y);

        // --- the terrace in section and the foundation behind the rock ---------------------------
        D.group('el.terrace', { overlap: 0.1 });
        const under = [153, 541, 196, 546, 250, 542, 300, 549, 352, 544, 410, 548, 458, 543, 493, 539];
        D.pen(0.8, { a: 0.75 }).hatch([153, GY, 493, GY, ...under.reduceRight((a, v, i) => (i % 2 ? a : a.concat(under[i], under[i + 1])), [])], { gap: 4.6 });
        D.pen(1.2, { cap: 'round' }).curve(under); // where the masonry meets the rock
        D.hidden().poly([349, GY + 21, 349, 596, 499, 596, 499, GY + 17]);

        // --- dimensions ---------------------------------------------------------------------
        D.group('el.dims', { overlap: 0.2 }).fine();
        const dx = 322, top = Y(H.top), ys = [top, Y(H.deck), Y(H.belt), GY];
        D.line(dx - 7, ys[0], CX - 9, ys[0]);
        D.line(dx - 7, ys[1], CX - 50, ys[1]);
        D.line(dx - 7, ys[2], CX - 62, ys[2]);
        for (let i = 0; i < 3; i++) {
            const lab = LH.fig((ys[i + 1] - ys[i]) / M);
            Blueprint.dimV(D, dx, ys[i], ys[i + 1], i < 2 ? { label: lab, side: -1 } : { label: lab, side: 1, at: 0.42 });
        }
        Blueprint.title(D.group('el.title'), 395, 635, 'FRONT ELEVATION', 'SCALE 1:100');
    };
})();
