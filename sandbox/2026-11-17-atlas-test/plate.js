// The plate: what the matched shot draws over the measured relief, in map px of the
// reference (1280 × 720). Rivers, the lake's shore, the canal's dashes and the villages'
// buildings are measured by tools/vectors.py into data/vectors.json; the roads, the village
// centres, the town's plan and the lettering are placed here, read off full-size crops of
// ref/atlas-4.png (out/crops, out/roads.png).
const Plate = (() => {
    const CITY = [1096, 550];
    // [points, main road?]
    const ROADS = [
        [[[1096, 550], [1140, 500], [1200, 440], [1266, 378]], true],          // north-east
        [[[1096, 550], [1102, 480], [1105, 400], [1105, 338]], false],         // north
        [[[1096, 550], [1170, 521], [1266, 519]], false],                      // east
        [[[1096, 550], [1170, 562], [1266, 573]], true],                       // east-south-east
        [[[1096, 550], [1135, 593], [1200, 618], [1266, 640]], true],          // south-east
        [[[1096, 550], [1130, 610], [1170, 660], [1205, 706]], false],         // south
        [[[1096, 550], [1060, 610], [1028, 660], [1000, 706]], true],          // south-south-west
        [[[1096, 550], [1020, 556], [940, 600], [865, 645], [790, 706]], true], // south-west
        [[[1020, 556], [940, 562], [875, 565], [780, 560], [700, 558]], false],  // west
        [[[875, 565], [875, 622]], false],
        [[[1060, 500], [1020, 470], [960, 440], [880, 418], [800, 398], [700, 368], [600, 318], [520, 272], [450, 238], [392, 206]], false], // up the valley
        [[[995, 370], [1080, 355], [1180, 343], [1266, 330]], false],          // across the north plain
        [[[995, 370], [940, 382], [905, 388]], false],
        [[[995, 370], [1040, 420], [1078, 470]], false],
    ];
    // village centres [x, y, houses, angle]
    const VILLAGES = [
        [1230, 340, 12, -0.15], [1145, 342, 7, -0.1], [1070, 366, 9, -0.12], [995, 410, 9, 0.2],
        [1217, 408, 10, -0.9], [1232, 512, 10, 0], [955, 512, 10, 0.4], [962, 575, 8, -0.4],
        [892, 605, 10, -0.6], [860, 616, 6, 0], [1030, 670, 8, -1.2], [1172, 664, 8, 0.4],
        [716, 536, 6, 0.2], [1250, 386, 6, -0.8], [915, 450, 5, 0.2], [1105, 425, 8, -1.5],
    ];
    const SPOKES = [0.13, 0.96, 2.13, 2.75, 3.65, 4.75, 5.49];   // the town's own radial streets
    // the plain (also in tools/layout.json, where the relief is held flat inside it)
    const PLAIN = [[780,  706],  [800,  650],  [850,  600],  [880,  575],  [930,  548],  [975,  522],  [960,  500],  [905,  482],  [880,  458],  [898,  420],  [925,  382],  [965,  352],  [1050,  335],  [1150,  322],  [1266,  310],  [1266,  706]];
    function draw(g, vec, hAt, o = {}) {
        const ink = o.ink ?? 1, letters = o.letters ?? 1;
        g.save();
        g.globalAlpha = ink;
        // the plain: parcels where the ground is low and flat, clear of the town and the water
        Atlas.fields(g, 760, 300, 1270, 710, (x, y) => Atlas.inside(PLAIN, x, y) && Math.hypot(x - CITY[0], y - CITY[1]) > 64, { cell: 24, row: 22, angle: -0.05, alpha: 0.75, edgeAlpha: 0.45, fill: 0.6, seed: 4 });
        Atlas.lake(g, vec.shore);
        Atlas.town(g, CITY[0], CITY[1], 70, { spokes: SPOKES, seed: 3 });
        for (const r of vec.rivers) Atlas.river(g, r.pts, r.w, { width: 0.7, edge: false, color: '#5f9fc6' });
        Atlas.channel(g, vec.dashes.map((d) => d.c), { width: 6.5 });
        // the water in the canal's bed, from the dam to its front
        if ((o.water ?? 0) > 0) {
            const w = Atlas.along(vec.dashes.map((d) => d.c), o.water);
            g.lineCap = 'round'; g.lineJoin = 'round';
            g.strokeStyle = '#9cc6da';
            g.lineWidth = 5.2;
            Atlas.pathOf(g, w.pts); g.stroke();
        }
        // main roads run through the town to its centre; lanes stop at its edge
        const outside = (pts) => { const out = []; for (const p of pts) if (Math.hypot(p[0] - CITY[0], p[1] - CITY[1]) > 66) out.push(p); return out; };
        for (const [pts, main] of ROADS) { const q = main ? pts : outside(pts); if (q.length > 1) Atlas.road(g, q, { main, width: main ? 3.6 : 1.1, alpha: 0.85 }); }
        VILLAGES.forEach(([x, y, n, a], i) => Atlas.village(g, x, y, n, i, { angle: a, spread: 8 }));
        Atlas.dam(g, [322, 183], [379, 151], { down: 1, bow: 0.13, depth: [0.36, 0.5] });
        Atlas.dashed(g, vec.dashes.map((d) => d.c), { upto: o.canal ?? 1, dash: 13.4, gap: 6.2, width: 3.8 });
        g.restore();
        g.save();
        g.globalAlpha = letters;
        Atlas.label(g, 'EMBALSE', 218.5, 116.5, { size: 15, width: 100 });
        Atlas.label(g, 'Canal', 625.5, 323.5, { size: 20, italic: true, angle: 0.31, spacing: 0.0, weight: 600 });
        Atlas.label(g, 'CIUDAD', 1187.5, 590, { size: 24, width: 86, weight: 500 });
        Atlas.scaleBar(g, 45, 684, 200, { size: 16, tick: 6, above: 12, width: 1.5, unitGap: 15 });
        g.restore();
    }
    return { draw, CITY, ROADS, VILLAGES, SPOKES };
})();
