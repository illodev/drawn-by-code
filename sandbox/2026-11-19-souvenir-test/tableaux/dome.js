// Picture 6 · The dome. The ceilings of al-Andalus as one ascent, seen from below looking
// straight up, in the emblem manner: the only picture with no thing in it, pure geometry, lit
// from above (looking up, the light is where the dome opens: every piece is lit on the side
// that faces the axis). Things/dome.js paints every ring; this file stacks them.
//
// The order is an ascent through the materials and back through time, from the hand to the
// light: clay first (the cut-tile dado of the walls, Nasrid, 14th c.), then plaster (the
// carved walls and the knot band where the inscription would run), the air of the hall
// (dust in the first light, a spider's thread), wood (the carpenters' frieze of corbels and
// their ceiling of interlaced stars), plaster again become light (the muqarnas of the Two
// Sisters, with the sixteen windows of its drum and the moon in one of them), then glass and
// gold (the ribbed dome before the mihrab of Córdoba, 10th c., the oldest of all, laid by a
// master sent from Byzantium), and last the lantern at the crown, open to the dawn. Earth,
// tree, light, sky: the oldest work is the highest.
//
// Every tier is a ring about the axis, narrower as it goes up, and each one's opening is the
// way through: a rectangle (the hall), a square (its walls), a square of corbels, an
// octagon (the ceiling), three sixteen-pointed stars (the muqarnas), an octagon of ribs, an
// octagon of gold, and the eight-pointed star of the lantern (hole 125).
// Hidden: a swift's nest in the corner of the cornice (and another between two corbels); one
// tessera missing, its socket red, in the gold to the upper left of the axis; the moon in the
// upper left window of the drum; a lath gone from the ceiling, its nails showing; a cell of
// the muqarnas restored in whiter plaster; a cobweb in a cell; one tile put back in the wrong
// colour.
//   Tableau.dome(z0) → layers; z0 is the first stratum (the dado)
window.Tableau = window.Tableau || {};
Tableau.dome = (z0) => {
    const S = Souvenir, D = Dome;
    const B = (hx, hy) => ({ x: -hx, y: -hy, w: hx * 2, h: hy * 2 });
    const layer = (id, dz, box, paint, o = {}) => ({
        id: 'dome-' + id, z: z0 + dz, box, brush: { amp: 0.05 },
        paint(g) {
            paint(g, box);
            S.tooth(g, box, { amp: 0.05 });
        },
        ...o,
    });
    return [
        // 1 · clay and plaster: the walls of the hall
        layer('dado', 0, B(920, 580), (g, box) => D.dado(g, { box, hx: 480, hy: 290 })),
        layer('plaster', 150, B(880, 580), (g, box) => D.plaster(g, { box, h: 270 })),
        // the air of the hall
        layer('air', 350, B(1000, 640), (g, box) => D.air(g, { box }), { brush: false }),
        // 2 · wood: the frieze of corbels, the ceiling of interlaced stars
        layer('corbels', 560, B(720, 560), (g, box) => D.corbels(g, { box, h: 300 })),
        layer('lattice', 700, B(820, 600), (g, box) => D.lattice(g, { box, r: 270 })),
        // 3 · plaster become light: the muqarnas, three tiers
        layer('muqarnas-0', 1150, B(680, 520), (g, box) => D.muqarnas(g, { box, tier: 0 })),
        layer('muqarnas-1', 1280, B(480, 440), (g, box) => D.muqarnas(g, { box, tier: 1 })),
        layer('muqarnas-2', 1410, B(440, 420), (g, box) => D.muqarnas(g, { box, tier: 2 })),
        // 4 · glass and gold: Córdoba
        layer('ribs', 1800, B(600, 460), (g, box) => D.ribs(g, { box })),
        layer('mosaic', 1930, B(700, 520), (g, box) => D.mosaic(g, { box, r: 215 })),
        // the crown, open to the dawn
        layer('crown', 2100, B(520, 440), (g, box) => D.crown(g, { box }), { hole: 125 }),
    ];
};
Tableau.dome.depth = 2100;
Tableau.dome.hole = 125;
// flat views for dev/dome/flat.js: a layer, the point of it in the middle, the scale
Tableau.dome.views = [
    { id: 'dome-dado', x: 0, y: 0, s: 0.64 },
    { id: 'dome-plaster', x: 0, y: 0, s: 0.9 },
    { id: 'dome-air', x: 0, y: 0, s: 0.64 },
    { id: 'dome-corbels', x: 0, y: 0, s: 1 },
    { id: 'dome-lattice', x: 0, y: 0, s: 1 },
    { id: 'dome-muqarnas-0', x: 0, y: 0, s: 1 },
    { id: 'dome-muqarnas-1', x: 0, y: 0, s: 1 },
    { id: 'dome-muqarnas-2', x: 0, y: 0, s: 1 },
    { id: 'dome-ribs', x: 0, y: 0, s: 1 },
    { id: 'dome-mosaic', x: 0, y: 0, s: 1 },
    { id: 'dome-crown', x: 0, y: 0, s: 1 },
];
