// 2026-11-17-magazine-ad-test · style magazine-ad
// Round 1: ref/C-a.png separated into its three inks (tools/separate.py → sep/C-a.js) and
// reprinted on the magazine-ad press: the reference's own shapes, this press's screens,
// paper and register. The pieces (the baker, the peel, the cat, the graphics) come next.
// fill a separation's plates: solids flat, tone bands on the screens (rings even-odd, each
// band laid over the last with its own alpha; see tools/separate.py)
function drawSep(press, S) {
    for (const ink of Ad.ORDER) {
        const P = S.plates[ink];
        if (!P) continue;
        const fill = (g, rings, a) => {
            g.fillStyle = Ad.tone(a);
            g.beginPath();
            for (const r of rings) { g.moveTo(r[0][0], r[0][1]); for (let i = 1; i < r.length; i++) g.lineTo(r[i][0], r[i][1]); g.closePath(); }
            g.fill('evenodd');
        };
        if (P.solid.length) fill(press.plate(ink), P.solid, 1);
        const sc = press.plate(ink, 'screen');
        for (const [a, rings] of P.bands) fill(sc, rings, a);
    }
}

Motion.scene({
    fps: 24,
    duration: 2,
    logical: [1600, 900],
    uses: ['styles/risograph/riso.js', 'styles/magazine-ad/ad.js', 'sandbox/2026-11-17-magazine-ad-test/sep/C-a.js'],
    fonts: [{ family: 'Kaushan Script', src: 'fonts/KaushanScript-Regular.ttf' }],
    shots: [[0, 2, 'Bakery set']],
    setup(env) {
        return { press: Ad.press(env) };
    },
    draw(g, t, env) {
        const { press } = env.state, d = Math.floor(t * 12 + 1e-6);
        press.begin(d);
        press.save();
        // the separation is in the reference's pixels (1280 wide)
        press.each((p) => p.scale(1600 / 1280, 1600 / 1280));
        // the reference, separated into its three inks by tools/separate.py, reprinted on this press
        drawSep(press, SEP['C-a']);

        press.restore();
        press.print(g, { key: d });
    },
});
