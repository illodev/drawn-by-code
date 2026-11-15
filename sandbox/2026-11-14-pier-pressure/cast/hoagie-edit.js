// pier-pressure · new frames made by editing the code of a drawing we already have. Hoagie's
// thumbs-up drawings (`a1`, `a2`, `a3`, cast/hoagie-seq-thumb-drawn.js: the sheet's drawings as shapes
// of control points, each cut into cowlick, head, thumb arm, torso, shorts and legs) are the whole
// of every frame here, with all its detail: a frame only puts its pieces down again (the upper
// body lower or higher over the legs, the head about the neck, the cowlick about its root, the
// arm about its sleeve). Nothing in a frame is drawn by hand except what hides a join: a patch
// of the drawing's own skin and shirt colour behind the head, and lids of its skin colour.
// Global: HoagieEdit. Load after drawn.js and hoagie-thumb-drawn.js.
//
//   HoagieEdit.frame(g, x, y, s, { pose, crouch, head, cow, lids, swing, halo })
//       pose: which cut drawing is edited: 'a1' the anticipation, 'a2' the thumb up on his toes, 'a3' settled
//       the point between his soles on (x, y), s frame units per drawing pixel.
//       crouch (drawing pixels, negative = stretched up), head, cow and swing (radians), lids 0…1
const HoagieEdit = (() => {
    // each cut drawing: its neck, where the thumb arm leaves the sleeve, the cowlick's root (its own
    // pixels, read off the sheet under a grid); the point between its soles comes with the drawing
    const POSES = {
        a1: { neck: [170, 165], sleeve: null, root: [158, 40] },       // the anticipation
        a2: { neck: [135, 215], sleeve: [236, 205], root: [95, 48] },  // the thumb, up on his toes
        a3: { neck: [160, 185], sleeve: [250, 205], root: [172, 44] }, // settled
    };
    let paint = null;
    const paints = () => {
        if (paint) return paint;
        const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)), cols = Drawn.colours('hoagie', 'a3');
        const near = (want) => cols.reduce((b, c) => { const v = hex(c), w = hex(want), d = (v[0] - w[0]) ** 2 + (v[1] - w[1]) ** 2 + (v[2] - w[2]) ** 2; return d < b[0] ? [d, c] : b; }, [1e9, want])[1];
        return (paint = { skin: near('#f3bd90'), shirt: near('#e76823') });
    };
    function frame(g, x, y, s, o = {}) {
        const { pose = 'a3', crouch = 0, head = 0, cow = 0, lids = 0, swing = 0 } = o, P = paints(), { neck: NECK, sleeve: SLEEVE, root: ROOT } = POSES[pose], AT = Drawn.meta('hoagie', pose).at;
        const c = Math.cos(head), sn = Math.sin(head), rx = ROOT[0] - NECK[0], ry = ROOT[1] - NECK[1];
        const parts = {
            shorts: { dy: crouch * 0.85 },
            torso: { dy: crouch },
            arm: { at: SLEEVE ?? [0, 0], rot: SLEEVE ? swing : 0, dy: crouch },
            head: { at: NECK, rot: head, dy: crouch * 1.1 },
            cow: { at: ROOT, rot: head + cow, dx: NECK[0] + rx * c - ry * sn - ROOT[0], dy: NECK[1] + rx * sn + ry * c - ROOT[1] + crouch * 1.1 },
        };
        const X = x - AT[0] * s, Y = y - AT[1] * s;
        const layer = (names, extra = {}) => Drawn.draw(g, 'hoagie', pose, X, Y, s, { parts, only: names, ...extra });
        if (o.halo) Drawn.draw(g, 'hoagie', pose, X, Y, s, { parts, halo: o.halo, only: [] });
        // (in `a2` the raised arm is in front of the head, and its fist's skin is one shape with the
        // face's: there the arm goes on last)
        const front = pose === 'a2';
        layer(['legs']);
        layer(['shorts']);
        if (!front) layer(['arm']);
        // behind the shirt and the head, where the head's turning would open a gap
        g.save();
        g.translate(X, Y + crouch * s);
        g.scale(s, s);
        if (pose === 'a3') {
            g.fillStyle = P.shirt;
            g.beginPath(); g.moveTo(112, 195); g.lineTo(132, 179); g.lineTo(216, 177); g.lineTo(232, 189); g.lineTo(224, 203); g.lineTo(118, 205); g.closePath(); g.fill();
        }
        g.fillStyle = P.skin;
        g.beginPath(); g.ellipse(NECK[0] + 2, NECK[1] - 2, 44, 16, 0, 0, 6.3); g.fill();
        g.restore();
        layer(['torso']);
        layer(['head', 'cow'], { blink: lids, lid: P.skin, face: [NECK[0], NECK[1] - 75, 130] });
        if (front) layer(['arm']);
    }
    return { frame, POSES };
})();
