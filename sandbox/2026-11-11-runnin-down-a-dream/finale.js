// The finale's shared pieces, so the solo's blocks meet each other without copying numbers:
// the climb's clock (how high the car is at film time t) and the ride itself (the band on
// its car, the cactus at the wheel, the Devil playing his flaming guitar on the hood).
// Global: Finale. Depends on Song, Rig, Rides, Inferno, Chorus1Props, Skyward.
const Finale = (() => {
    const S = Song, C = Cereal;
    // --- the climb -----------------------------------------------------------------------------
    // Height above the desert floor, in Skyward's units, at the first frame of some bars. The
    // car leaves the crater on bar 141, is under the cloud base on 145, level with the cloud
    // tops (the angels) through 150–153, out of the air by 161 and at the moon on 165.
    const KEYS = [[141, 0], [143, 620], [145, 1700], [148, 3500], [150, 4050], [153, 4500], [155, 6200], [158, 8300], [161, 9800], [165, 12000]];
    const T = KEYS.map(([b]) => S.B(b)), H = KEYS.map(([, h]) => h);
    // monotone cubic through the keys (Fritsch–Carlson): the speed never jumps, the car never drops
    const n = T.length, d = [], m = new Array(n);
    for (let i = 0; i < n - 1; i++) d.push((H[i + 1] - H[i]) / (T[i + 1] - T[i]));
    m[0] = d[0];
    m[n - 1] = 0; // it comes to rest at the moon
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i]);
    const Y = (t) => {
        if (t <= T[0]) return 0;
        if (t >= T[n - 1]) return H[n - 1];
        let i = 0;
        while (t >= T[i + 1]) i++;
        const h = T[i + 1] - T[i], u = (t - T[i]) / h, u2 = u * u, u3 = u2 * u;
        return (2 * u3 - 3 * u2 + 1) * H[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * H[i + 1] + (u3 - u2) * h * m[i + 1];
    };
    // where the car sits in the frame during the climb (its ground point), and its scale
    const CAR = { x: 500, y: 640, s: 84 };

    // --- the ride ------------------------------------------------------------------------------
    const SEATS = Rides.bandCarSeats();
    const WHEEL = [SEATS.wheel[0] - SEATS.driver[0] - 0.07, SEATS.wheel[1] - SEATS.driver[1] + 0.02];
    const HOOD = [3.98, -1.2]; // where the Devil's hooves stand on the hood, in the car's units (screen offsets from its ground point)
    /**
     * The band's car as it is from the solo on: everybody playing, Tom up front on the deck,
     * the cactus in shades at the wheel, and the Devil on the hood with his flaming guitar,
     * facing the band.
     *   o: what Rig.band takes (spin, bounce, lean, exhaust, pose, solo, shadow …; shadow is
     *      false by default: the car is in the air for most of the finale), plus
     *      devil: a pose merged over his playing pose (Inferno.devilGuitar), or false to leave him out
     *      cactus: a pose merged over the driver's
     */
    function ride(g, t, x, y, s, o = {}) {
        const P = S.pulseAt(t), ph = P.k + P.since;
        Rig.band(g, t, x, y, s, {
            tomDrives: false, sing: true, shadow: false, solo: 0.6, exhaust: 0.6, ...o,
            driver: (g2, sc) => Chorus1Props.cactus(g2, 0, 0, sc, { shades: 1, squash: 0.05 * P.pulse, wave: P.k % 2 ? P.pulse : -P.pulse * 0.6, wheel: WHEEL, ...(o.cactus ?? {}) }),
        });
        if (o.devil === false) return;
        // on the hood, in the car body's own frame (it leans and bounces with it)
        const rx = -3.55, rR = 0.56;
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.translate(rx, -rR);
        g.rotate(-(o.lean ?? 0));
        g.translate(-rx, rR);
        g.translate(0, (o.bounce ?? 0) * 0.1);
        g.scale(1 / s, 1 / s);
        Inferno.devilGuitar(g, HOOD[0] * s, HOOD[1] * s, s, {
            mood: 'grin', look: -1, shadow: false, squash: 0.045 * P.pulse, headDy: 0.02 * P.pulse, tail: 0.05 * Math.sin(ph * Math.PI),
            strum: Math.cos(ph * Math.PI * 2), fret: 0.2 + 0.3 * (Math.floor(ph / 2) % 3), solo: 0.5, flames: 1, shred: 0, t, ...(o.devil ?? {}),
        });
        g.restore();
    }
    // the Devil's ground point on the hood, on screen, for a car at rest (no lean, no bounce)
    const hoodAt = (x, y, s) => [x + HOOD[0] * s, y + HOOD[1] * s];

    return { Y, KEYS, CAR, HOOD, ride, hoodAt };
})();
