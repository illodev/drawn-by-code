// Picture 7 · The patio at dawn, in the brush manner and in dawn pastels.
// Tableau.patio(z0) → layers; Tableau.patio.depth, Tableau.patio.hole.
//
// The order: from the street's shade into the house's heart. First the zaguán, the cool hall
// that the Roman atrium became (its red and white arch as at the mosque, its tiles, the skein
// of Seville on a nail); then the patio's water and flowers (the fountain on the axis, its
// thread of water crossed by the camera, the wall of blue pots, the tin on its cane); then
// the gallery where the house works and rests (an arcade on reused marble columns, the well,
// the orange tree, the chair with a shawl left on it, the cat asleep, the canary); last the
// door into the house between two confronted peacocks, as on the ivory caskets of Madinat
// al-Zahra: the patio as the paradise garden, from Rome to the caliphs to a house in
// Córdoba this morning. Over the last wall, the moon, almost full, and far off in the haze
// the tower that was a minaret.
//
// Every sheet stands on the same floor: its foot at y = FLOOR in its own units (the eye is
// that far above the floor at the reading distance), so floors and thresholds agree in depth.
window.Tableau = window.Tableau || {};
Tableau.patio = (z0) => {
    const S = Souvenir, Pt = Patio;
    const FLOOR = 400;
    const box = { x: -1200, y: -720, w: 2400, h: 1440 };
    const plateBox = { x: -1550, y: -880, w: 3100, h: 1760 };
    const layer = (id, dz, o) => ({ id: 'patio-' + id, z: z0 + dz, box, brush: false, ...o });
    const has = (n) => typeof Pt[n] === 'function';

    // One wall standing across the axis, with its arches.
    //   arches: [archGeom's options + plain, surround, alfiz, interior(g, A)]; top: the wall's top
    function wallSheet(g, res, o) {
        const b = o.box ?? box;
        const As = o.arches.map((a) => ({ a, A: Pt.archGeom({ floor: FLOOR, ...a }) }));
        if (o.sky) Pt.sky(g, b, { y1: o.top + 4, seed: o.seed, ...(o.sky === true ? {} : o.sky) });
        if (o.beyond) o.beyond(g);
        Pt.floor(g, { floor: FLOOR, x0: b.x, x1: b.x + b.w, y1: b.y + b.h, seed: o.seed, ...(o.floorO ?? {}) });
        const keep = (x, y, rad) => {
            for (const { A } of As) if (Math.abs(x - A.cx) < A.extX + 70 + rad && y > A.extTop - 70 - rad) return false;
            return y - rad > o.top + 40 && y + rad < FLOOR - (o.dadoH ?? 50);
        };
        Pt.wall(g, res, {
            box: b, seed: o.seed, top: o.top, floor: FLOOR, damp: o.damp ?? 90, dark: o.dark ?? 0, ghost: o.ghost ?? 0.5,
            shape: (q) => {
                q.rect(b.x, o.top, b.w, FLOOR - o.top);
                for (const { A } of As) S.trace(q, A.front);
            },
            ok: o.ok ?? keep, flakes: o.flakes ?? 10, cracks: o.cracks, nails: o.nails, extra: o.extra, craze: o.craze,
        });
        if (o.dado) Pt.dado(g, { x0: b.x, x1: b.x + b.w, y0: FLOOR - o.dado, y1: FLOOR, gaps: As.map(({ A }) => [A.cx - A.xj - 2, A.cx + A.xj + 2]), seed: o.seed });
        if (o.skirting) skirting(g, b, o.skirting, As);
        for (const { a, A } of As) {
            if (a.interior) a.interior(g, A);
            Pt.arch(g, { floor: FLOOR, ...a, seed: o.seed + (a.cx ?? 0) });
        }
        if (o.eave) Pt.eave(g, { y: o.top, x0: b.x, x1: b.x + b.w, seed: o.seed, ...o.eave });
        return As.map(({ A }) => A);
    }
    // A band painted at the wall's foot (almagra or añil), its top edge brushed by hand.
    function skirting(g, b, o, As) {
        const r = Motion.rng('skirt' + o.color), h = o.h ?? 56, top = [];
        for (let x = b.x; x <= b.x + b.w; x += 10) top.push([x, FLOOR - h + 2.5 * S.noise2(x / 23, 1, 3) + 1.2 * S.noise2(x / 5, 2, 3)]);
        g.save();
        g.beginPath();
        S.trace(g, [...top, [b.x + b.w, FLOOR], [b.x, FLOOR]]);
        for (const { A } of As) S.trace(g, A.front);
        g.clip('evenodd');
        g.fillStyle = o.color;
        g.fillRect(b.x, FLOOR - h - 6, b.w, h + 6);
        for (let i = 0; i < b.w / 14; i++) S.dab(g, [[b.x + r() * b.w, FLOOR - r() * h], [b.x + r() * b.w, FLOOR - r() * h]], { w: 8 + r() * 14, color: r() < 0.5 ? '#ffffff' : '#30202a', alpha: 0.09, bristles: 7, seed: i });
        for (let i = 0; i < b.w / 25; i++) Pt.fillP(g, Pt.blob(b.x + r() * b.w, FLOOR - r() * h, 2 + r() * 8, 1.5 + r() * 4, 'sk' + i, 9, 0.5, r() * 3), 'rgba(236,226,214,0.8)');
        g.restore();
    }
    // Pots hung on a wall in loose rows round the arch, every one its own: pot, paint, plant.
    //   rows: [[y, x0, x1, step]], keep: (x, y) => false where nothing may hang
    function potWall(g, seed, rows, keep, o = {}) {
        const r = Motion.rng('potwall' + seed), list = [];
        for (const [y, xa, xb, step] of rows) {
            for (let x = xa + r() * step * 0.4; x < xb; x += step * (0.8 + r() * 0.45)) {
                const yy = y + (r() - 0.5) * 34;
                if (keep && !keep(x, yy)) continue;
                const k = r();
                const plant = k < 0.52 ? 'geranium' : k < 0.84 ? 'gitanilla' : 'cinta';
                const flower = plant === 'geranium' ? ['red', 'red', 'coral', 'pink', 'white', 'red', 'magenta'][Math.floor(r() * 7)] : ['pink', 'magenta', 'red', 'lilac', 'pink'][Math.floor(r() * 5)];
                const c2 = r();
                list.push({ x, y: yy, s: (o.s ?? 0.9) * (0.85 + r() * 0.3), tilt: S.clamp((yy / 1000) * 0.8, -0.3, 0.3), seed: seed + list.length, ring: o.ring ?? true, plant, flower,
                    color: c2 < 0.86 ? 'blue' : c2 < 0.91 ? 'green' : c2 < 0.96 ? 'white' : 'clay', w: 0.8 + r() * 0.5, umbels: 3 + Math.floor(r() * 3), chips: 0.3 + r() * 0.6 });
            }
        }
        for (const p of list) Pt.pot(g, p);
        return list;
    }
    // A veil of the air on a layer's paint (far things a little paler and cooler).
    const veil = (g, b, color) => {
        g.save();
        g.globalCompositeOperation = 'source-atop';
        g.fillStyle = color;
        g.fillRect(b.x, b.y, b.w, b.h);
        g.restore();
    };

    return [
        // ================================================================ 1 · the zaguán
        layer('hall', 0, {
            res: 0.75,
            paint(g, res) {
                // a tinaja with an aspidistra in the corner, a jar of blue and white with a fern
                Pt.tinaja(g, { x: -640, y: FLOOR, s: 1.2, seed: 'tin', plant: 'aspidistra' });
                Pt.tinaja(g, { x: 660, y: FLOOR, s: 1.0, seed: 'orza', plant: 'fern', color: 'blue' });
                Pt.dawn(g, box, res, { line: [[-1200, -2000], [1200, -2000]], shade: [0.8, 0.8, 0.92] });
                S.tooth(g, box, { amp: 0.05 });
            },
        }),
        layer('zaguan', 140, {
            paint(g, res) {
                wallSheet(g, res, {
                    seed: 'zaguan', top: -620, dark: 0.32, ghost: 0.7, flakes: 12, dado: 170,
                    arches: [{ R: 310, cy: -50, ext: 96, lift: 34, n: 21, k: 0.9, alfiz: { pad: 30, top: 36 } }],
                    cracks: [[430, -420, -0.9, 120, false], [-560, -440, 1.9, 160, true]],
                    nails: [[-640, -150, 'hole'], [560, -40, 'nail'], [790, 120, 'bent']],
                });
                Pt.ceiling(g, { x0: box.x, x1: box.x + box.w, top: box.y, foot: -620, seed: 'zaguan', nests: [-430], webs: [[1100, -620, 70], [-1150, -620, 60]] });
                Pt.madeja(g, { x: -600, y: -200, s: 1.2, seed: 'no8do' });
                Pt.lantern(g, { x: 640, y: -360, s: 1.3, seed: 'lz' });
                if (typeof Fauna !== 'undefined' && Fauna.gecko) Fauna.gecko(g, { x: 720, y: -250, s: 0.8, rot: -1.9, line: false, seed: 'gz' });
                Pt.tray(g, { x: 560, y: -120, r: 66, seed: 'bandeja' });
                Pt.frieze(g, { x0: box.x, x1: box.x + box.w, y: -600, h: 36, seed: 'zaguan' });
                Pt.plate(g, { x: -700, y: -380, r: 50, seed: 'fajalauza' });
                Pt.plate(g, { x: 820, y: -420, r: 40, seed: 'fajalauza2' });
                Pt.key(g, { x: -420, y: 40, s: 1.1 });
                // the hall is in shade, lit a little from the street behind the eye and the patio ahead
                Pt.dawn(g, box, res, { line: [[-1200, -2000], [1200, -2000]], shade: [0.8, 0.81, 0.93] });
                // but the sun comes in at the street door behind the eye, with the cancela's shadow
                Pt.sunPatch(g, [[-930, -560], [-600, -560], [-420, 230], [-760, 230]], { seed: 'cancela' });
                S.tooth(g, box, { amp: 0.05 });
            },
        }),
        // ================================================================ 2 · the patio: water and flowers
        layer('fountain', 670, {
            paint(g, res) {
                Pt.fountain(g, { x: 0, y: FLOOR, s: 1, seed: 'f', jet: 330 });
                // pots set on the fountain's rim
                Pt.pot(g, { x: -232, y: 300, s: 0.75, tilt: 0.3, seed: 'fr1', plant: 'geranium', flower: 'red', off: 0, umbels: 3 });
                Pt.pot(g, { x: 236, y: 298, s: 0.7, tilt: 0.3, seed: 'fr2', plant: 'gitanilla', flower: 'magenta', off: 0, len: 70 });
                Pt.dawn(g, box, res, { line: [[-1200, 40], [1200, 120]], seed: 'f' });
                // big pots standing on the floor at the sides, cut by the frame
                Pt.pot(g, { x: -600, y: 230, s: 2.0, tilt: 0.25, seed: 'fl1', plant: 'geranium', flower: 'red', color: 'clay', umbels: 6, w: 1.4, off: 0 });
                Pt.pot(g, { x: 640, y: 250, s: 2.1, tilt: 0.25, seed: 'fl2', plant: 'gitanilla', flower: 'pink', color: 'blue', trail: 8, len: 90, w: 1.3, off: 0 });
                S.tooth(g, box, { amp: 0.05 });
            },
        }),
        layer('cane', 790, {
            paint(g, res) {
                Pt.can(g, { x0: -470, y0: FLOOR - 4, x1: -400, y1: -470, seed: 'can' });
                Pt.pot(g, { x: -560, y: 300, s: 1.25, tilt: 0.28, seed: 'fl3', plant: 'cinta', color: 'blue', off: 0 });
                Pt.pot(g, { x: 470, y: 300, s: 1.3, tilt: 0.28, seed: 'fl4', plant: 'geranium', flower: 'white', color: 'blue', umbels: 4, off: 0 });
                Pt.dawn(g, box, res, { line: [[-1200, -230], [1200, -90]], seed: 'c' });
                S.tooth(g, box, { amp: 0.05 });
            },
        }),
        layer('pots', 910, {
            paint(g, res) {
                wallSheet(g, res, {
                    seed: 'pots', top: -500, sky: true, flakes: 9, skirting: { color: '#b8603e', h: 54 },
                    arches: [{ R: 300, cy: -30, ext: 80, lift: 24, n: 17, k: 0.92, plain: true, surround: { color: '#d8a650', w: 26 } }],
                    eave: { nests: [-640, -470, 520], grass: [-880, 260] },
                    cracks: [[250, -180, -1.1, 110, false]],
                    nails: [[-400, -300, 'nail'], [380, 40, 'hook'], [820, -200, 'hole']],
                });
                const clear = (x, y) => !(Math.abs(x) < 420 && y > -520) && Math.abs(x) < 1180;
                potWall(g, 'pw', [[-380, -1180, 1180, 160], [-220, -1180, 1180, 170], [-60, -1180, 1180, 180], [100, -1180, 1180, 190], [240, -1180, 1180, 210]], clear);
                if (typeof Fauna !== 'undefined' && Fauna.lizard) Fauna.lizard(g, { x: 470, y: 290, s: 0.75, rot: -0.3, line: false, seed: 'lz', pose: 0 });
                Pt.tilePanel(g, { x: 0, y: -428, cols: 5, rows: 3, t: 34, seed: 'bucaro' });
                Pt.dawn(g, box, res, { line: [[-1200, -250], [1200, -110]], seed: 'p' });
                S.tooth(g, box, { amp: 0.05 });
            },
        }),
        // ================================================================ 3 · the gallery
        layer('well', 1450, {
            paint(g, res) {
                Pt.well(g, { x: -500, y: FLOOR, s: 0.95, seed: 'pozo' });
                Pt.pot(g, { x: -620, y: 142, s: 0.8, tilt: 0.12, seed: 'wp', plant: 'geranium', flower: 'pink', off: 0, umbels: 3 });
                Pt.chair(g, { x: 470, y: FLOOR, s: 1.1, seed: 'silla' });
                Pt.dawn(g, box, res, { line: [[-1200, -200], [1200, -60]], seed: 'w' });
                S.tooth(g, box, { amp: 0.05 });
            },
        }),
        layer('orange', 1570, {
            paint(g, res) {
                Pt.orangeTree(g, { x: 700, y: FLOOR, s: 0.95, seed: 'naranjo' });
                Pt.pot(g, { x: -760, y: 300, s: 1.4, tilt: 0.28, seed: 'gp1', plant: 'cinta', color: 'white', off: 0 });
                Pt.dawn(g, box, res, { line: [[-1200, -380], [1200, -240]], seed: 'o' });
                S.tooth(g, box, { amp: 0.05 });
            },
        }),
        layer('gallery', 1690, {
            paint(g, res) {
                const R = 210, xj = R * Math.cos(Math.PI / 6), col = 18, side = xj * 2 + col * 2;
                const inside = (kind) => (q, A) => {
                    // the gallery's back wall in shade, seen through a side arch
                    q.save();
                    q.beginPath();
                    S.trace(q, A.back);
                    q.clip();
                    const gr = q.createLinearGradient(0, A.cy - A.R, 0, FLOOR);
                    gr.addColorStop(0, '#8c8aa8');
                    gr.addColorStop(0.7, '#a8a4bc');
                    gr.addColorStop(1, '#9a92a4');
                    q.fillStyle = gr;
                    q.fillRect(A.cx - 400, -800, 800, 1300);
                    // its floor of red tiles
                    q.fillStyle = '#9a5a46';
                    q.fillRect(A.cx - 400, FLOOR * 0.88, 800, 200);
                    for (let x = A.cx - 400; x < A.cx + 400; x += 22) Pt.lineP(q, [[x, FLOOR * 0.88], [x * 1.08, FLOOR]], 1, 'rgba(60,30,30,0.4)');
                    if (kind === 'door') {
                        const dx = A.cx * 0.92;
                        Pt.fillP(q, [[dx - 60, FLOOR * 0.88], [dx - 60, -140], [dx + 60, -140], [dx + 60, FLOOR * 0.88]], '#4a3430');
                        for (let i = 0; i < 4; i++) Pt.lineP(q, [[dx - 60 + 30 * (i + 0.5), -140], [dx - 60 + 30 * (i + 0.5), FLOOR * 0.88]], 1.2, 'rgba(20,10,10,0.5)');
                    } else {
                        // a window with its iron grille, a pot on the sill
                        const wx = A.cx * 0.92;
                        Pt.fillP(q, [[wx - 54, -120], [wx + 54, -120], [wx + 54, 60], [wx - 54, 60]], '#3a3448');
                        for (let i = -3; i <= 3; i++) Pt.lineP(q, [[wx + i * 15, -120], [wx + i * 15, 60]], 2, '#1a1418');
                        for (let j = 0; j < 4; j++) Pt.lineP(q, [[wx - 54, -90 + j * 45], [wx + 54, -90 + j * 45]], 2, '#1a1418');
                    }
                    q.restore();
                };
                wallSheet(g, res, {
                    seed: 'gallery', top: -420, sky: true, flakes: 8, skirting: { color: '#4a64a0', h: 50 },
                    arches: [
                        { R, cy: -40, ext: 66, lift: 22, n: 15, k: 0.94, imposts: false, jambs: false, clipX: [-xj - col, xj + col] },
                        { R, cy: -40, cx: -side, ext: 66, lift: 22, n: 15, k: 0.94, imposts: false, first: 1, clipX: [-side - 600, -xj - col] },
                        { R, cy: -40, cx: side, ext: 66, lift: 22, n: 15, k: 0.94, imposts: false, first: 1, clipX: [xj + col, side + 600] },
                    ],
                    eave: { nests: [700], grass: [-300] },
                });
                const imp = -40 + R * 0.5;
                for (const sx of [-1, 1]) Pt.column(g, { x: sx * (xj + col), top: imp + 6, foot: FLOOR, r: col, seed: 'col' + sx, marble: sx < 0 ? 'rose' : 'blue' });
                // the canary hung in the left arch, the jasmine on its wire over the right
                Pt.cage(g, { x: -side, y: -40 - R + 6, s: 1, seed: 'canario' });
                Pt.jasmine(g, { pts: [[680, -330], [860, -360], [1020, -330], [1190, -350]], seed: 'jz' });
                Pt.jasmine(g, { pts: [[-560, -330], [-300, -352], [0, -334], [300, -352], [560, -330]], seed: 'jz3', density: 0.9 });
                Pt.jasmine(g, { pts: [[-1190, -340], [-1000, -370], [-800, -330]], seed: 'jz2', density: 0.8 });
                Pt.dawn(g, box, res, { line: [[-1200, -230], [1200, -110]], seed: 'g' });
                S.tooth(g, box, { amp: 0.05 });
            },
        }),
        // ================================================================ 4 · the door between the peacocks
        layer('peacocks', 1980, {
            paint(g, res) {
                Pt.bench(g, { x0: -1200, x1: -215, top: 240, foot: FLOOR, seed: 'bl' });
                Pt.bench(g, { x0: 215, x1: 1200, top: 240, foot: FLOOR, seed: 'br' });
                Pt.pot(g, { x: -1010, y: 150, s: 1.1, tilt: 0.16, seed: 'bp1', plant: 'geranium', flower: 'red', color: 'blue', off: 10 });
                Pt.pot(g, { x: 1000, y: 150, s: 1.1, tilt: 0.16, seed: 'bp2', plant: 'geranium', flower: 'coral', color: 'blue', off: 10 });
                Pt.peacock(g, { x: -340, y: 240, s: 1.05, seed: 'L', drop: 160 });
                Pt.peacock(g, { x: 340, y: 240, s: 1.05, seed: 'R', flip: true, drop: 160 });
                Pt.dawn(g, box, res, { line: [[-1200, 150], [1200, 210]], seed: 'pk', shade: [0.72, 0.74, 0.88] });
                S.tooth(g, box, { amp: 0.05 });
            },
        }),
        {
            id: 'patio-plate', z: z0 + 2100, box: plateBox, res: 0.5, brush: false, hole: Tableau.patio.hole,
            paint(g, res) {
                const [A] = wallSheet(g, res, {
                    box: plateBox, seed: 'plate', top: -360, sky: { clouds: 9 }, flakes: 10,
                    arches: [{ R: 175, cy: -25, ext: 56, lift: 18, n: 15, k: 0.95, lobes: 9, alfiz: { pad: 24, top: 26 } }],
                    // far off in the haze over the wall: roofs, a palm, the tower that was a minaret
                    beyond: (q) => Pt.skyline(q, { y: -356 }),
                });
                Pt.moon(g, { x: 330, y: -470, r: 54 });
                // the dark of the house inside the door
                const gr = g.createRadialGradient(0, 30, 30, 0, 60, 380);
                gr.addColorStop(0, '#3e3038');
                gr.addColorStop(1, '#1e1824');
                g.fillStyle = gr;
                g.beginPath();
                S.trace(g, A.back);
                g.fill();
                // its leaves folded back against the reveals: studded boards
                for (const sx of [-1, 1]) {
                    const x0 = sx * A.xj * A.k, x1 = x0 - sx * 10;
                    Pt.fillP(g, [[x0, A.imp * A.k], [x1, A.imp * A.k], [x1, FLOOR * A.k], [x0, FLOOR * A.k]], '#5a3e32');
                    for (let y = A.imp; y < FLOOR * A.k; y += 22) Pt.disc(g, (x0 + x1) / 2, y, 1.6, '#c8a060');
                }
                // the light of the room beyond, spilling out round the way out into the dark,
                // on the floor of the hall inside and on a lamp's chain
                const glow = g.createRadialGradient(0, 0, Tableau.patio.hole * 0.9, 0, 0, Tableau.patio.hole * 2.1);
                glow.addColorStop(0, 'rgba(183,154,106,0.55)');
                glow.addColorStop(0.5, 'rgba(150,120,84,0.18)');
                glow.addColorStop(1, 'rgba(150,120,84,0)');
                g.save();
                g.beginPath();
                S.trace(g, A.back);
                g.clip();
                g.fillStyle = glow;
                g.fillRect(-400, -400, 800, 800);
                for (let i = -6; i <= 6; i++) Pt.lineP(g, [[i * 14, 150], [i * 34, FLOOR * A.k]], 1, `rgba(200,170,120,${0.25 - Math.abs(i) * 0.03})`);
                for (let j = 0; j < 5; j++) Pt.lineP(g, [[-160, 160 + j * j * 9], [160, 160 + j * j * 9]], 1, 'rgba(200,170,120,0.18)');
                Pt.lineP(g, [[0, A.cy - A.R + 10], [0, -150]], 1.4, 'rgba(70,56,50,0.9)');
                g.restore();
                Pt.dawn(g, plateBox, res, { line: [[-1550, -160], [1550, -40]], seed: 'pl' });
                // the way out
                g.globalCompositeOperation = 'destination-out';
                g.fillStyle = '#000';
                g.beginPath();
                g.arc(0, 0, Tableau.patio.hole, 0, Math.PI * 2);
                g.fill();
                g.globalCompositeOperation = 'source-over';
                S.tooth(g, plateBox, { amp: 0.05 });
            },
        },
    ];
};
Tableau.patio.depth = 2100;
Tableau.patio.hole = 140;

// The patio as ONE stratum of loose things (the film's second passage, round 7): no wall,
// arch or door; the body is the patio's flowers themselves, blue pots and their geraniums,
// gitanillas, spider plants, jasmine and orange sprays heaped round an irregular gap, in the
// dawn (warm from the top left, cool rose-blue shade). On it, whole and large: the fountain's
// basin at the foot of the gap with its thread of water; the canary's cage, the skein hung as
// an eight and the pale moon among the jasmine; then the two peacocks facing each other
// across the gap with the well's pulley and bucket hanging between them from above; and
// nearest, cut by the frame, the rush chair with the shawl and the cat asleep, and the tin
// on its cane. To find: a lizard on a pot, a martin's nest, a Fajalauza plate and a brass
// tray half sunk in the leaves.
//   Tableau.patio.stratum(z) → three layers: 'patio-s-far' (z + 150), 'patio-s-mid' (z), 'patio-s-near' (z − 160)
Tableau.patio.stratum = (z) => {
    const S = Souvenir, Pt = Patio;
    const box = { x: -1200, y: -720, w: 2400, h: 1440 };
    // a thing on its own sheet, its shadow thrown on the paint already under it
    const thing = (g, b, paint, shadow = { dx: 16, dy: 20, blur: 9, alpha: 0.38 }) => {
        const sp = S.sheet(b, Pt.resOf(g), paint);
        if (shadow) Pt.castSprite(g, sp, { ...shadow, color: Pt.SHADOW });
        S.put(g, sp);
    };
    const finish = (g, seed) => {
        Pt.dawnGlow(g, box, { seed });
        S.tooth(g, box, { amp: 0.05 });
    };
    const layer = (id, dz, paint, o = {}) => ({ id: 'patio-s-' + id, z: z + dz, box, brush: false, paint, ...o });
    return [
        layer('far', 150, (g, res) => {
            Pt.flowerMass(g, res, box, { seed: 'stratum', gap: [430, 300], n: 78 });
            // the fountain's basin at the foot of the gap, its thread of water rising into it
            thing(g, { x: -280, y: 60, w: 560, h: 420 }, (q) => Pt.fountain(q, { x: 0, y: 470, s: 1, seed: 'sf', jet: 230 }), { dx: 22, dy: 16, blur: 12, alpha: 0.4 });
            Pt.pot(g, { x: -246, y: 372, s: 0.7, tilt: 0.3, seed: 'sfr1', plant: 'geranium', flower: 'red', off: 8, umbels: 3 });
            // among the jasmine above: the moon, pale, almost full; the cage; the skein
            Pt.moon(g, { x: -70, y: -430, r: 62 });
            Pt.jasmine(g, { pts: [[-330, -470], [-150, -400], [40, -470], [190, -520]], seed: 'smoon', density: 1.2, nails: false });
            thing(g, { x: 260, y: -560, w: 220, h: 380 }, (q) => Pt.cage(q, { x: 370, y: -470, s: 1.15, seed: 'scage', ground: false, chain: 80 }));
            thing(g, { x: -500, y: -430, w: 170, h: 270 }, (q) => Pt.madeja(q, { x: -410, y: -380, s: 1.3, seed: 'sno8do' }));
            // half sunk in the leaves: a Fajalauza plate, the brass tray; a martin's nest; the lizard
            Pt.plate(g, { x: -760, y: 300, r: 58, seed: 'sfaj', hung: false });
            Pt.tray(g, { x: 790, y: -260, r: 72, seed: 'stray', hung: false });
            Pt.nest(g, 660, 170, S.seedOf('snest'));
            if (typeof Fauna !== 'undefined' && Fauna.lizard) Fauna.lizard(g, { x: 560, y: 380, s: 0.8, rot: -0.5, line: false, seed: 'slz', pose: 1 });
            finish(g, 'sfar');
        }),
        layer('mid', 0, (g, res) => {
            // the two peacocks facing each other across the gap, their trains falling out of the frame
            Pt.peacock(g, { x: -560, y: 70, s: 1.25, seed: 'sL', drop: 620 });
            Pt.peacock(g, { x: 560, y: 70, s: 1.25, seed: 'sR', flip: true, drop: 620 });
            // the well's pulley hanging from above the frame, its bucket between them
            Pt.pulley(g, { x: 20, y: -590, s: 1.2, drop: 140, seed: 'spul' });
            finish(g, 'smid');
        }),
        layer('near', -160, (g, res) => {
            Pt.chair(g, { x: 720, y: 500, s: 1.65, seed: 'ssilla', ground: false });
            Pt.can(g, { x0: -1000, y0: 820, x1: -600, y1: -260, s: 1.4, seed: 'scan', ground: false });
            Pt.pot(g, { x: -820, y: 330, s: 1.6, tilt: 0.25, seed: 'snp', plant: 'gitanilla', flower: 'pink', color: 'blue', trail: 7, len: 110, off: 0 });
            finish(g, 'snear');
        }, { res: 0.8 }),
    ];
};
