// pier-pressure · new frames made by editing the code of a drawing we already have. Hoagie's
// settled thumbs-up drawing (`a3`, cast/hoagie-thumb-drawn.js: the sheet's drawing as shapes of
// control points, cut into cowlick, head, thumb arm, torso, shorts and legs) is the whole of
// every frame here, with all its detail: a frame only puts its pieces down again (the upper
// body lower or higher over the legs, the head about the neck, the cowlick about its root, the
// arm about its sleeve). Nothing in a frame is drawn by hand except what hides a join: a patch
// of the drawing's own skin and shirt colour behind the head, and lids of its skin colour.
// Global: HoagieEdit. Load after drawn.js and hoagie-thumb-drawn.js.
//
//   HoagieEdit.frame(g, x, y, s, { crouch, head, cow, lids, swing, halo })
//       the point between his soles on (x, y), s frame units per drawing pixel.
//       crouch (drawing pixels, negative = stretched up), head, cow and swing (radians), lids 0…1
const HoagieEdit = (() => {
    const AT = [136, 454], NECK = [132, 162], SLEEVE = [222, 178], ROOT = [143, 42];
    let paint = null;
    const paints = () => {
        if (paint) return paint;
        const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)), cols = Drawn.colours('hoagie', 'a3');
        const near = (want) => cols.reduce((b, c) => { const v = hex(c), w = hex(want), d = (v[0] - w[0]) ** 2 + (v[1] - w[1]) ** 2 + (v[2] - w[2]) ** 2; return d < b[0] ? [d, c] : b; }, [1e9, want])[1];
        return (paint = { skin: near('#f3bd90'), shirt: near('#e76823') });
    };
    function frame(g, x, y, s, o = {}) {
        const { crouch = 0, head = 0, cow = 0, lids = 0, swing = 0 } = o, P = paints();
        const c = Math.cos(head), sn = Math.sin(head), rx = ROOT[0] - NECK[0], ry = ROOT[1] - NECK[1];
        const parts = {
            shorts: { dy: crouch * 0.85 },
            torso: { dy: crouch },
            arm: { at: SLEEVE, rot: swing, dy: crouch },
            head: { at: NECK, rot: head, dy: crouch * 1.1 },
            cow: { at: ROOT, rot: head + cow, dx: NECK[0] + rx * c - ry * sn - ROOT[0], dy: NECK[1] + rx * sn + ry * c - ROOT[1] + crouch * 1.1 },
        };
        const X = x - AT[0] * s, Y = y - AT[1] * s;
        const layer = (names, extra = {}) => Drawn.draw(g, 'hoagie', 'a3', X, Y, s, { parts, only: names, ...extra });
        if (o.halo) Drawn.draw(g, 'hoagie', 'a3', X, Y, s, { parts, halo: o.halo, only: [] });
        layer(['legs']);
        layer(['shorts']);
        layer(['arm']);
        // behind the shirt and the head, where the head's turning would open a gap
        g.save();
        g.translate(X, Y + crouch * s);
        g.scale(s, s);
        g.fillStyle = P.shirt;
        g.beginPath(); g.moveTo(84, 172); g.lineTo(104, 156); g.lineTo(188, 154); g.lineTo(204, 166); g.lineTo(196, 180); g.lineTo(90, 182); g.closePath(); g.fill();
        g.fillStyle = P.skin;
        g.beginPath(); g.ellipse(134, 160, 44, 16, 0, 0, 6.3); g.fill();
        g.restore();
        layer(['torso']);
        layer(['head', 'cow'], { blink: lids, lid: P.skin, face: [130, 100, 120] });
    }
    return { frame, AT };
})();
