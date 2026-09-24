// 2026-09-24-opus5-riso · a 1:1 study (not published as ours) of a risograph-printed film
// (references/opus5-risograph.mp4, author to be credited): illustrations open one inside the
// other in circles round a blue dot, a mosaic of all of them, orbits, «opus 5 · claude».
// Style test first: the lighthouse card, printed by styles/risograph (Riso).
const DIR = 'sandbox/2026-09-24-opus5-riso/';
Motion.scene({
    fps: 24,
    duration: 2,
    logical: [1000, 1000],
    uses: ['styles/risograph/riso.js', DIR + 'cards/lighthouse.js'],
    shots: [[0, 2, 'Lighthouse']],
    setup(env) {
        return { press: Riso.press(env) };
    },
    draw(g, t, env) {
        const { press } = env.state, d = Math.floor(t * 12 + 1e-6);
        press.begin(d);
        CARDS.lighthouse(press, d / 12);
        // the blue dot at the centre, on top of everything
        const n = press.plate('navy');
        n.fillStyle = Riso.tone(1);
        n.beginPath();
        n.arc(500, 500, 9, 0, 7);
        n.fill();
        press.print(g, { key: d });
    },
});
