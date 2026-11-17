# Reviews · malaga-atlas

## Round 1 · Málaga, and a town like the plate's (the user, on the style test)

> «Can you do it of Málaga? Of that one, what fits least for me is the city, which doesn't
> look as much like the reference in its details.»

**The town.** Cropped at 8× beside the reference (`sandbox/2026-11-17-atlas-test/out/crops/
city6cmp.png`), the plate's town is a dense dark mass of irregular BLOCKS, each cut into tiny
LOTS (rounded dark-grey squares with a darker rim and hairline gaps), threaded by white
streets, wide for the main ones; ours was houses scattered on a pale ground, which read as
dots. The kit now draws towns that way (`Atlas.blocks` with `radialBlocks` for the plate's
radial town and `gridBlocks` for a real one): the style test's town was redrawn with it (its
gate unchanged, colour median 7.2).

**Málaga.** Real data, no reference to match (so the detail check is the style's checklist,
crop by crop): the relief from open elevation tiles at ≈ 30 m a pixel, renders crisp at once;
the sea, the reservoirs (the Limonero, Casasola), built-up land, fields and main roads read
by colour off OpenStreetMap tiles; the Guadalhorce and the Guadalmedina from Nominatim;
streams from the relief's drainage. The town is the closed built-up outline laid out as a
jittered street grid along its own grain (the direction of its streets in the tiles), its
core solid, its fringe and the houses in the hills as thin as the tiles say; a block is there
or not as a whole, so it reads as blocks and streets.

Faults found on the crops and fixed before showing:
- the grey mask PNG is opaque, so tinting it covered the whole map: its brightness is the alpha;
- the centre came out sparse (its tiles are cut by streets and labels): the outline's eroded
  core counts as solid town;
- roads and streams drew in pieces (short pieces at crossings dropped, ends not joined): kept
  and chained by their ends;
- pale halos round scattered houses: the town's ground only where it is dense;
- the sea looked like a khaki patch before the ink: it is printed with the relief.

`review.mjs`: no warnings; the only still stretch is the ending.
