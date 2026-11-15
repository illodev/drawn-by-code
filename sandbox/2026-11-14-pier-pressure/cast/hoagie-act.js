// pier-pressure · Hoagie's own frames. His settled thumbs-up drawing (`a3`, cast/hoagie-thumb-
// drawn.js) is cut into pieces: legs (with socks and shoes), shorts, the thumb arm, torso (shirt,
// camcorder, the hand that holds it), head, cowlick. A new frame is those pieces put down again:
// the upper body lower or higher over the legs (seen from the front, bending the knees is the
// shorts coming down over the shins), the head turned about the neck, the thumb arm turned about
// where it leaves the sleeve, the cowlick about its root, the lids down over the eyes. Each piece
// keeps its drawing, whole: nothing is stretched or bent. Global: HoagieAct. Load after drawn.js
// and hoagie-thumb-drawn.js.
//
//   HoagieAct.proud(g, x, y, s, { crouch, head, arm, cow, blink, halo })
//       the point between his soles on (x, y), s frame units per drawing pixel.
//       crouch: how far the upper body has come down (drawing pixels; negative = up on the stretch)
//       head: radians about the neck (positive = tipped to our right); arm: radians about the
//       sleeve (positive = the thumb coming down); cow: the cowlick about its root; blink 0…1
const HoagieAct = (() => {
    const AT = [136, 454], NECK = [132, 162], SLEEVE = [222, 178], ROOT = [143, 42];
    let paint = null;
    // the two paints the joins are patched with: his skin and his shirt, as this drawing has them
    const paints = () => {
        if (paint) return paint;
        const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)), cols = Drawn.colours('hoagie', 'a3');
        const near = (want) => cols.reduce((b, c) => { const v = hex(c), w = hex(want), d = (v[0] - w[0]) ** 2 + (v[1] - w[1]) ** 2 + (v[2] - w[2]) ** 2; return d < b[0] ? [d, c] : b; }, [1e9, want])[1];
        return (paint = { skin: near('#f3bd90'), shirt: near('#e76823') });
    };
    function proud(g, x, y, s, o = {}) {
        const { crouch = 0, head = 0, arm = 0, cow = 0, blink = 0 } = o, P = paints();
        // where the head's turning takes the cowlick's root
        const c = Math.cos(head), sn = Math.sin(head), rx = ROOT[0] - NECK[0], ry = ROOT[1] - NECK[1];
        const parts = {
            shorts: { dy: crouch * 0.85 },
            torso: { dy: crouch },
            arm: { at: SLEEVE, rot: arm, dy: crouch },
            head: { at: NECK, rot: head, dy: crouch * 1.1 },
            cow: { at: ROOT, rot: head + cow, dx: NECK[0] + rx * c - ry * sn - ROOT[0], dy: NECK[1] + rx * sn + ry * c - ROOT[1] + crouch * 1.1 },
        };
        const X = x - AT[0] * s, Y = y - AT[1] * s, layer = (names, extra = {}) => Drawn.draw(g, 'hoagie', 'a3', X, Y, s, { parts, only: names, ...extra });
        if (o.halo) Drawn.draw(g, 'hoagie', 'a3', X, Y, s, { parts, halo: o.halo, only: [] });
        // far to near, each piece covering what is behind it
        layer(['legs']);
        layer(['shorts']);
        layer(['arm']);
        // behind the shirt and the head, where the head's turning would open a gap: his neck and
        // the top of his shoulders (the torso is painted over them, so only the gap shows them)
        g.save();
        g.translate(X, Y + crouch * s);
        g.scale(s, s);
        g.fillStyle = P.shirt;
        g.beginPath(); g.moveTo(84, 172); g.lineTo(104, 156); g.lineTo(188, 154); g.lineTo(204, 166); g.lineTo(196, 180); g.lineTo(90, 182); g.closePath(); g.fill();
        g.fillStyle = P.skin;
        g.beginPath(); g.ellipse(134, 160, 44, 16, 0, 0, 6.3); g.fill();
        g.restore();
        layer(['torso']);
        layer(['head', 'cow'], { blink, lid: P.skin, face: [130, 100, 120] });
    }
    return { proud, AT };
})();
