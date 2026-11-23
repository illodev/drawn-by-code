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
        layer('lattice', 700, B(760, 560), (g, box) => D.lattice(g, { box, r: 270 })),
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

// Round 7 · The dome as ONE stratum of loose things, in the format of the film's first part:
// the ceilings of al-Andalus broken into the fragments a restorer's workshop holds, lying on
// one another on a heap of their own matter, lit from the top left like the rest of the film.
//   far (z + 150): the heap (loose gold tesserae, glass, plaster chips with azure and red,
//     stucco leaves, cut tiles of the five glazes) round an irregular gap; on it a length of
//     the knot band (upper left), a slab of the gold mosaic with its scroll and the one
//     tessera missing, loose tesserae spilt beside it (upper right), a panel of the dado
//     snapped across a corner, its mortar bed showing (lower left), a lump of plaster with
//     the swift's nest (lower right)
//   middle (z): a block of muqarnas cells (upper left), a lattice window of the drum with the
//     gibbous moon behind its star grid (right), a length of Córdoba's rib with the spider
//     hanging from it (below)
//   near (z − 160): a piece of the ceiling of stars with its gilt pendant (left) and a
//     painted corbel with a stub of its beam (right), the largest, cut by the frame
// Every fragment is painted by the ring painter it came from (things/dome.js, `fragment`).
Tableau.dome.stratum = (z) => {
    const S = Souvenir, D = Dome, box = { x: -1200, y: -720, w: 2400, h: 1440 };
    const sheet = (id, dz, paint) => ({
        id: 'dome-s-' + id, z: z + dz, box, brush: { amp: 0.05 },
        paint(g) {
            paint(g, box);
            S.tooth(g, box, { amp: 0.05 });
        },
    });
    return [sheet('far', 150, D.stratumFar), sheet('mid', 0, D.stratumMid), sheet('near', -160, D.stratumNear)];
};

// Round 8 · The dome LOOSE: no sheets, no heap, no ring. Every thing of the dome floats on its
// own at its own depth in z ± 280, all round the axis, turning slowly on itself (the rig).
//   heroes (12, 250–650 across, 330–950 from the axis, every angle, every depth): the slab of
//     gold mosaic with its scroll and the one tessera missing, a second slab from the border,
//     a wedge of the crown's gold flutes with the lantern's frame, a block of muqarnas cells,
//     a wedge of the pendant tier, a second wedge of the crown, a length of Córdoba's rib with the spider hanging from it, a corbel, a piece of the ceiling of
//     stars with its gilt pendant, the knot band, a panel of the cut-tile dado, the swift's
//     nest on its lump of plaster
//   to find: the tessera that is missing from the slab, floating near it (its cut side shows
//     the gold leaf between its glass base and cap); a swift's feather near the nest; the
//     spider on its thread
//   matter (118: 100 anywhere, denser inside, and 18 larger in an outer ring): bits broken from every ring, each from a point of its own (so no two alike):
//     gold mosaic most of all, then stucco leaves with their gilding, carved plaster, single muqarnas cells, laths of the
//     ceiling, cut tile, bits of rib and of the crown's flutes, two glass tesserae alone
// The gold leads: most of the matter is gold mosaic, the blue pieces (the dado, the plaster's
// azure) are few and far out, and `Dome.domeLight` takes the blues down a step and lays the
// crown's gold glow over everything near the axis.
Tableau.dome.loose = (z) => {
    const S = Souvenir, L = Dome.loose, TAU = Math.PI * 2;
    const at = (deg, R) => [Math.cos((deg * Math.PI) / 180) * R, Math.sin((deg * Math.PI) / 180) * R];
    const piece = (id, dz, kind, o, half) => {
        const box = { x: o.x - half, y: o.y - half, w: half * 2, h: half * 2 };
        return {
            id: 'dome-l-' + id, z: z + dz, loose: true, box, brush: { amp: 0.05 },
            paint(g) {
                L[kind](g, o);
                S.tooth(g, box, { amp: 0.05 });
            },
        };
    };
    // the heroes: [id, kind, angle°, R, dz, s, rot, local half-size, extra options]
    const HEROES = [
        ['mosaic', 'mosaic', 332, 470, 230, 1.6, 0.2, 215, { seed: 2 }],
        ['mosaic-border', 'mosaic', 168, 430, -150, 1.35, -0.5, 215, { seed: 12, at: [262, -60], outline: [[-120, -80], [110, -95], [130, 70], [-30, 100], [-125, 60]] }],
        ['crown', 'crown', 272, 440, 120, 1.6, 0.4, 185, { seed: 13, ang: -0.2 }],
        ['muqarnas', 'muqarnas', 208, 590, -30, 1.45, 2.75, 250, { seed: 5 }],
        ['crown-2', 'crown', 24, 600, 165, 1.75, -2.2, 185, { seed: 14, ang: 1.1, span: 0.74, reach: 345 }],
        ['rib', 'rib', 104, 700, -200, 1.6, -0.15, 200, { seed: 7, spider: [70, 27] }],
        ['knot', 'knot', 248, 840, 70, 1.3, -0.34, 262, { seed: 1 }],
        ['dado', 'dado', 150, 960, -262, 1.0, -0.18, 262, { seed: 3 }],
        ['ceiling', 'ceiling', 302, 840, -255, 1.0, 0.32, 375, { seed: 8 }],
        ['corbel', 'corbel', 62, 780, -110, 2.1, -0.85, 165, { seed: 9 }],
        ['nest', 'nest', 124, 520, 30, 1.6, 0.3, 140, { seed: 4 }],
        ['muqarnas-pendant', 'bit', 352, 690, -90, 2.0, 1.2, 140, { seed: 31, src: 'muq2', at: [0, -330], rad: 105, el: 0.8 }],
    ];
    const out = HEROES.map(([id, kind, deg, R, dz, s, rot, half, o]) => {
        const [x, y] = at(deg, R);
        return piece(id, dz, kind, { x, y, rot, s, ...o }, half * s + 40);
    });
    // the things to find
    {
        const [x, y] = at(318, 335);
        out.push(piece('tessera', 182, 'tessera', { x, y, rot: 0.5, s: 1.15, kind: 'gold', seed: 1 }, 90));
        const [fx, fy] = at(134, 372);
        out.push(piece('feather', -230, 'feather', { x: fx, y: fy, rot: -0.9, s: 1.05, seed: 1 }, 110));
    }
    // the matter: bits of every ring, each from a point of its own, at every depth
    const r = Motion.rng('dome-loose');
    const KINDS = [['mosaic', 22], ['leaf', 10], ['plaster', 7], ['muq0', 4], ['muq1', 6], ['muq2', 5], ['lattice', 4], ['dado', 3], ['rib', 3], ['crown', 4]];
    const pick = () => {
        let u = r() * KINDS.reduce((a, k) => a + k[1], 0);
        for (const [k, w] of KINDS) if ((u -= w) < 0) return k;
        return 'mosaic';
    };
    // where in each ring a bit can come from (ring units)
    const FROM = {
        mosaic: () => at(r() * 360, 250 + r() * 380),
        plaster: () => [(r() - 0.5) * 440, -(270 + 90 + r() * 240)],
        muq0: () => at(r() * 360, 300 + r() * 120),
        muq1: () => at(r() * 360, 280 + r() * 150),
        muq2: () => at(r() * 360, 260 + r() * 180),
        lattice: () => at(r() * 360, 320 + r() * 200),
        dado: () => [(r() - 0.5) * 760, -(290 + 70 + r() * 200)],
        rib: () => {
            const a0 = Math.PI / 8, t = 300 + r() * 340;
            return [262 * Math.cos(a0) - t * Math.sin(a0), 262 * Math.sin(a0) + t * Math.cos(a0)];
        },
        crown: () => at(r() * 360, 210 + r() * 110),
    };
    // the scale of each ring on the page (a tessera 8–12 units, a muqarnas cell 70–120)
    const SCALE = { mosaic: [1.4, 2.1], plaster: [1.2, 1.7], muq0: [2.0, 2.8], muq1: [1.8, 2.6], muq2: [1.8, 2.5], lattice: [1.3, 1.8], dado: [1.2, 1.6], rib: [1.4, 1.9], crown: [1.4, 2.0] };
    for (let i = 0; i < 100; i++) {
        const src = i === 20 || i === 47 ? 'glass' : pick();
        const across = 56 + Math.pow(r(), 1.1) * 165;
        const R = Math.max(272 + across / 2, 280 + Math.pow(r(), 1.3) * 1220), deg = r() * 360, dz = -280 + r() * 560, rot = r() * TAU;
        const [x, y] = at(deg, R);
        if (src === 'leaf') {
            const s = across / 100;
            out.push(piece('leaf' + i, dz, 'leaf', { x, y, rot, s, seed: i }, 95 * s + 30));
            continue;
        }
        if (src === 'glass') {
            out.push(piece('glass' + i, dz, 'tessera', { x, y, rot, s: 0.95 + r() * 0.3, kind: i === 20 ? 'green' : 'red', seed: 10 + i }, 80));
            continue;
        }
        const sc = SCALE[src], s = sc[0] + r() * (sc[1] - sc[0]), rad = across / 2 / s / 0.9;
        out.push(piece('bit' + i, dz, 'bit', { x, y, rot, s, src, at: FROM[src](), rad, seed: 100 + i, thick: 0.8 + r() * 0.5 }, rad * s * 1.15 + 60));
    }
    // and an outer ring of larger bits, one every twenty degrees, so that the frame's edges
    // are never bare night as it turns (seen early and small, beyond the heroes)
    for (let j = 0; j < 18; j++) {
        const src = ['mosaic', 'leaf', 'mosaic', 'plaster', 'mosaic', 'muq1', 'crown', 'mosaic', 'leaf'][j % 9], across = 150 + r() * 80;
        const [x, y] = at(j * 20 + (r() - 0.5) * 12, 720 + r() * 360), dz = -40 + r() * 320, rot = r() * TAU;
        if (src === 'leaf') {
            const s = across / 100;
            out.push(piece('outer' + j, dz, 'leaf', { x, y, rot, s, seed: 200 + j }, 95 * s + 30));
            continue;
        }
        const sc = SCALE[src], s = sc[0] + r() * (sc[1] - sc[0]), rad = across / 2 / s / 0.9;
        out.push(piece('outer' + j, dz, 'bit', { x, y, rot, s, src, at: FROM[src](), rad, seed: 300 + j, thick: 0.8 + r() * 0.5 }, rad * s * 1.15 + 60));
    }
    return out;
};
