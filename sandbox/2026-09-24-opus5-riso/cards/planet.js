// Card «planet» (reference 12.0–12.125 s, frames 288–290; re-inked and mirrored in the pink
// run): a ringed planet close up, pink with red (pink + yellow) bands curving round it, a
// navy shadow to the lower left, yellow rings with paper grooves passing behind and in front,
// a blue sky with coarse navy dots. Authored in reference px on frame 288: the disc fitted to
// row scans (centre 406.8, 696.9, r 483.6), the rings as two ellipses fitted with that centre
// (inner 623 × 191, outer 1127 × 329, tilted −15.6°), the bands from column scans, screens
// fitted with a DFT (14.4 px: sky navy 33.1°, planet yellow 48.3°, shadow navy 17.85°).
// Needs _g4-util.js (G4).
var CARDS = CARDS || {};
CARDS.planet = (press, t, lf = 0) => {
    const U = G4, T = U.T;
    const Y = press.plate('yellow'), P = press.plate('pink'), B = press.plate('blue'), N = press.plate('navy');
    // the pink run re-uses the drawing mirrored (the scene flips the plates), framed a little
    // smaller and pushing in 1 % a frame: disc fitted on 570 (659.0, 695.2, r 457.4) =
    // the mirrored disc scaled 0.9458 about (411, 666); push about (536, 548) (570 → 572).
    // In the drawing's own (unmirrored) space those centres mirror to x' = 1080 − x.
    const mirrored = press.plate('pink').getTransform().a < 0;
    U.refpx(press);
    const PX = 406.8, PY = 696.9, PR = 483.6;
    if (mirrored) {
        const zf = Math.pow(1.01, lf);
        press.each((g) => { g.translate(544, 548); g.scale(zf, zf); g.translate(-544, -548); g.translate(669, 666); g.scale(0.9458, 0.9458); g.translate(-669, -666); });
    }

    // ── sky: blue, coarse navy dots (heavier to the left), white stars, pink specks
    B.fillStyle = T(1); B.fillRect(-60, -60, 1200, 1200);
    U.screen(press, 'navy', { p: 14.5, a: 33.1, x: 203, y: 85.1 }, (g) => { g.fillStyle = U.lin(g, 0, 0, 1080, 0, [[0, 0.32], [1, 0.26]]); g.fillRect(-60, -60, 1200, 1200); }, { jit: 0.25, pj: 0.04, edge: 1 });
    U.specks(P, 'pl-sky', 220, [0, 0, 1080, 1080], 1, 2.4, 0.9);
    U.speckle(press, 'pl-sky', 160, [0, 0, 1080, 1080], 0.9, 2);

    // ── the rings: bands between the fitted inner (f = 0) and outer (f = 1) ellipses
    const ROT = -15.6 * Math.PI / 180, IN = [623, 191], OUT = [1127, 329];
    const E = (f) => [IN[0] + (OUT[0] - IN[0]) * f, IN[1] + (OUT[1] - IN[1]) * f];
    const ell = (g, f) => { const [a, b] = E(f); g.moveTo(PX + Math.cos(ROT) * a, PY + Math.sin(ROT) * a); g.ellipse(PX, PY, a, b, ROT, 0, Math.PI * 2); };
    const annulus = (g, f0, f1) => { g.beginPath(); ell(g, f1); ell(g, f0); };
    // colour profiles across the front ring (columns 300, 580, 850): from the inner edge,
    // yellow bands and paper stripes, a dark gap (what is behind, with navy and pink
    // hairlines) at 0.575–0.655, then the wide outer band
    const BANDS = [[0, 0.03], [0.075, 0.12], [0.13, 0.16], [0.2, 0.44], [0.47, 0.5], [0.54, 0.575], [0.71, 1]];
    const ring = () => {
        press.knockout((g) => { annulus(g, 0, 0.575); g.fill('evenodd'); annulus(g, 0.655, 1); g.fill('evenodd'); });
        Y.fillStyle = T(1);
        for (const [f0, f1] of BANDS) { annulus(Y, f0, f1); Y.fill('evenodd'); }
        // paper grooves inside the wide bands
        press.knockout((g) => { for (const [f0, f1] of [[0.29, 0.297], [0.36, 0.366], [0.81, 0.817], [0.9, 0.908]]) { annulus(g, f0, f1); g.fill('evenodd'); } });
        for (const [f0, f1, g] of [[0.59, 0.605, N], [0.63, 0.645, P], [0.605, 0.62, B]]) { g.fillStyle = T(1); annulus(g, f0, f1); g.fill('evenodd'); }
    };
    ring();

    // ── the planet: pink all over, red bands (yellow screen with soft edges), a navy shadow
    const disc = (g) => { g.beginPath(); g.arc(PX, PY, PR, 0, 7); };
    press.knockout((g) => { disc(g); g.fill(); });
    P.fillStyle = T(1); disc(P); P.fill();
    // the bands, measured by column scans (upper / lower edges, x every 50 px)
    const R1 = [[-20, 470], [60, 460], [110, 458], [160, 442], [210, 433], [260, 430], [310, 420], [360, 395], [410, 377], [460, 364], [510, 349], [560, 330], [610, 298], [650, 250], [690, 180]];
    const R2 = [[[-20, 652], [60, 656], [110, 662], [160, 668], [210, 661], [260, 651], [310, 650], [360, 639], [410, 622], [460, 608], [510, 592], [560, 579], [610, 553], [660, 530], [710, 498], [760, 456], [810, 441], [860, 380]], [[860, 520], [810, 560], [760, 598], [710, 629], [660, 656], [610, 677], [560, 697], [510, 712], [460, 723], [410, 734], [360, 745], [310, 758], [260, 764], [210, 770], [160, 778], [110, 784], [60, 790], [-20, 795]]];
    const R3 = [[[-20, 848], [100, 850], [200, 850], [300, 848], [360, 846], [410, 839], [460, 824], [510, 813], [560, 798], [610, 783], [660, 765], [710, 738], [760, 711], [810, 679], [860, 630], [900, 580]], [[900, 650], [860, 692], [810, 723], [760, 749], [710, 772], [660, 794], [610, 811], [560, 829], [510, 846], [460, 861], [410, 876], [360, 889], [300, 902], [200, 915], [100, 925], [-20, 930]]];
    U.screen(press, 'yellow', { p: 14.33, a: 48.3, x: 267.6, y: 479.3 }, (g) => {
        g.save(); disc(g); g.clip();
        g.filter = 'blur(9px)';
        g.fillStyle = T(1);
        g.beginPath(); g.moveTo(-40, 150); R1.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(900, 150); g.closePath(); g.fill();
        for (const [a, b] of [R2, R3]) { g.beginPath(); a.concat(b).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); }
        // the lower rim below the front ring reads red too
        g.fillStyle = U.lin(g, 0, 880, 0, 980, [[0, 0], [1, 1]]); g.fillRect(-40, 880, 1000, 400);
        g.restore();
    }, { box: [-80, 200, 900, 1100], jit: 0.2, edge: 1 });
    // the shadow: navy dots growing to the lower left
    U.screen(press, 'navy', { p: 14.39, a: 17.85, x: 136.9, y: 752 }, (g) => {
        g.save(); disc(g); g.clip();
        g.fillStyle = U.lin(g, 420, 540, 90, 900, [[0, 0], [0.3, 0.12], [0.6, 0.45], [0.8, 0.75], [1, 0.9]]); g.fillRect(-80, 200, 1000, 1000);
        g.restore();
    }, { box: [-80, 200, 900, 1100], jit: 0.2, edge: 1 });
    // dust and highlights on the planet
    press.save(); press.clip((g) => g.arc(PX, PY, PR, 0, 7));
    U.speckle(press, 'pl-disc', 260, [-80, 210, 900, 1080], 0.8, 1.8);
    press.restore();
    U.specks(Y, 'pl-disc', 30, [150, 260, 800, 700], 1.6, 3.2, 1);

    // ── the front of the rings, over the planet: below the rings' long axis
    const ca = Math.cos(ROT), sa = Math.sin(ROT);
    press.save();
    press.clip((g) => { g.moveTo(PX - ca * 3000, PY - sa * 3000); g.lineTo(PX + ca * 3000, PY + sa * 3000); g.lineTo(PX + ca * 3000 - sa * 3000, PY + sa * 3000 + ca * 3000); g.lineTo(PX - ca * 3000 - sa * 3000, PY - sa * 3000 + ca * 3000); g.closePath(); });
    ring();
    press.restore();
    press.restore();
};
