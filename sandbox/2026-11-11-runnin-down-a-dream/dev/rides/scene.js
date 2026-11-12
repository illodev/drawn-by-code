// dev: the rides, to judge them at size. One sheet per second (render with --at 0,1,2,…
// --size 1728, so a logical unit is 1.08 px as in the film):
//   0  both cars at s = 85, at rest, through the tape      5  both at s = 85, bounce and lean at their extremes, through the tape
//   1  band car at s = 150, at rest                         6  the skeleton's poses and the dust (k = 0.08 … 0.92)
//   2  band car at s = 150, bounce 1, lean 0.25, exhaust    7  s = 300: the band car's nose and cockpit
//   3  hearse at s = 150, at rest                           8  s = 300: the band car's tail
//   4  hearse at s = 150, bounce 1, lean 0.25, flames       9  s = 300: the hearse's front      10  s = 300: the hearse's back
//   11, 12  the two cars empty at s = 150                  13, 14  the band car with the real band, when band-strings.js and band-rhythm.js are there
// Add 0.5 to a sheet's time for the same sheet two drawings later and the wheels at another angle.
Motion.scene({
    fps: 24, duration: 15, logical: [1600, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js', 'sandbox/2026-11-11-runnin-down-a-dream/rides.js',
        { src: 'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', optional: true }, { src: 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js', optional: true }],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    draw(g, t, env) {
        const C = Cereal, K = C.COL, sheet = Math.floor(t + 1e-6), half = t - sheet > 0.25, spin = half ? 0.9 : 0.2, tt = half ? 0.25 : 0;
        C.sunburst(g, 800, 560, { n: 14, rot: 0.2, a: K.sky, b: K.aqua });
        const lip = [[-40, 1040]];
        for (let i = 0; i <= 34; i++) lip.push([i * 50 - 50, 0]);
        lip.push([1640, 1040]);
        const floor = (y) => {
            const p = lip.map(([x, yy], i) => (i === 0 || i === lip.length - 1 ? [x, yy] : [x, y - 40 + (i % 2 ? 0 : 24)]));
            C.poly(g, p, { fill: K.navy, lw: 0 });
            C.poly(g, p.slice(1, -1), { ink: K.ink, lw: 5, close: false });
        };
        // stand-ins: Tom and the Devil on every seat
        const band = (g2, seats, s) => {
            const tom = (p, pose) => Rides.at(g2, s, p, (x, y, sc) => Cast.tom(g2, x, y, sc, pose));
            const order = seats.deck.map((p, i) => [p, i]).sort((a, b) => b[0][2] - a[0][2]);
            for (const [p, i] of order) tom(p, { shades: i % 2, strum: 0.3, mouth: i === 0 ? 'sing' : undefined });
            Rides.at(g2, s, seats.kit, (x, y, sc) => Devil.draw(g2, x, y, sc, { mood: 'shock', tail: 0.02 }));
            tom(seats.driver, { shades: 1, mouth: 'grin' });
        };
        const dead = (jaw) => (g2, seats, s) => {
            Rides.at(g2, s, seats.devil, (x, y, sc) => Devil.draw(g2, x, y, sc, { contract: true, trident: { ang: half ? 0.3 : 0 }, tail: 0.03 }));
            Rides.at(g2, s, seats.chauffeur, (x, y, sc) => Rides.skeleton(g2, x, y, sc, { jaw, headTilt: jaw * -0.12, shadow: false }));
        };
        const calm = { spin, t: tt, exhaust: 0.5, flames: 0.5 }, wild = { spin, t: tt, bounce: 1, lean: 0.25, exhaust: 1, flames: 1 };
        if (sheet === 0 || sheet === 5) {
            const o = sheet === 0 ? calm : wild;
            floor(470);
            Rides.bandCar(g, 520, 470, 85, o, band);
            Rides.bandCar(g, 1250, 470, 42, { ...o, bounce: sheet === 5 ? -0.5 : 0, lean: 0 }, band);
            C.sunburst(g, 800, 1400, { n: 14, rot: 0.2, a: K.purple, b: K.violet, R: 0 });
            g.save();
            g.beginPath();
            g.rect(0, 500, 1600, 500);
            g.clip();
            C.sunburst(g, 800, 760, { n: 14, rot: 0.5, a: K.pink, b: K.rose });
            floor(930);
            Rides.hearse(g, 520, 930, 85, o, dead(sheet === 5 ? 1 : 0));
            Rides.hearse(g, 1250, 930, 42, { ...o, bounce: sheet === 5 ? -0.5 : 0, lean: 0 }, dead(0.5));
            g.restore();
        } else if (sheet === 1 || sheet === 2) {
            floor(760);
            Rides.bandCar(g, 800, 760, 150, sheet === 1 ? calm : wild, band);
        } else if (sheet === 3 || sheet === 4) {
            C.sunburst(g, 800, 560, { n: 14, rot: 0.5, a: K.pink, b: K.rose });
            floor(880);
            Rides.hearse(g, 800, 880, 150, sheet === 3 ? calm : wild, dead(sheet === 4 ? 1 : 0));
        } else if (sheet === 6) {
            floor(520);
            Rides.skeleton(g, 170, 520, 190, {});
            Rides.skeleton(g, 520, 520, 190, { jaw: 1, headTilt: -0.14, hands: { l: [0.62, -1.25], r: [-0.62, -1.25] } });
            Rides.skeleton(g, 870, 520, 190, { jaw: 0.5, squash: 0.08, hands: { l: [0.7, -0.7], r: [-0.7, -0.7] } });
            Rides.skeleton(g, 1150, 520, 105, { jaw: 0 });
            Rides.skeleton(g, 1300, 520, 105, { jaw: 1, headTilt: -0.14 });
            Cast.tom(g, 1460, 520, 105, { shades: 1 });
            g.save();
            g.beginPath();
            g.rect(0, 540, 1600, 460);
            g.clip();
            C.sunburst(g, 800, 760, { n: 14, rot: 0.5, a: K.pink, b: K.rose });
            floor(930);
            [0.08, 0.25, 0.45, 0.68, 0.92].forEach((k, i) => Rides.dust(g, 290 + i * 300, 930, 110, k, 'a', tt));
            g.restore();
        } else if (sheet === 13 || sheet === 14) {
            // the real band, if the other files are there (a fit check, not a staging)
            floor(760);
            const real = (g2, seats, s) => {
                const put = (p, fn) => Rides.at(g2, s, p, fn);
                const S = typeof BandStrings !== 'undefined' ? BandStrings : null, R = typeof BandRhythm !== 'undefined' ? BandRhythm : null;
                if (R) put(seats.kit, (x, y, sc) => R.stan(g2, x, y, sc, { snare: 1, hat: 1 }));
                if (S) put(seats.deck[3], (x, y, sc) => S.howie(g2, x, y, sc, {}));
                if (S) put(seats.deck[1], (x, y, sc) => S.mike(g2, x, y, sc, {}));
                if (R) put(seats.deck[2], (x, y, sc) => R.benmont(g2, x, y, sc, {}));
                put(seats.deck[0], (x, y, sc) => Cast.tom(g2, x, y, sc, { shades: 1, mouth: 'sing' }));
                put(seats.driver, (x, y, sc) => Rides.skeleton(g2, x, y, sc, { shadow: false, hands: { l: [seats.wheel[0] - seats.driver[0] - 0.08, seats.wheel[1] - seats.driver[1]] } }));
            };
            Rides.bandCar(g, 800, 760, 150, sheet === 13 ? calm : wild, real);
        } else if (sheet === 11) {
            floor(760);
            Rides.bandCar(g, 800, 760, 150, { spin, t: tt });
        } else if (sheet === 12) {
            floor(880);
            Rides.hearse(g, 800, 880, 150, { spin, t: tt, bounce: -0.5 });
        } else {
            const [car, cx] = [[Rides.bandCar, -3.2], [Rides.bandCar, 2.6], [Rides.hearse, -1.9], [Rides.hearse, 1.6]][sheet - 7];
            floor(900);
            car(g, 800 + cx * 300, 900, 300, { ...calm, exhaust: 1, flames: 1 }, car === Rides.bandCar ? band : dead(0.6));
        }
    },
    post(ctx, t, env) {
        const sheet = Math.floor(t + 1e-6);
        if (sheet === 0 || sheet === 5) Cereal.post(ctx, t, env, { bezel: false });
    },
});
