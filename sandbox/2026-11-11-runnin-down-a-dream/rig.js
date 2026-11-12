// The rigs: the band on its car and the Devil on his hearse, each keeping the beat without
// the segments having to pose everybody. A segment places a rig, says who is aboard and what
// the car is doing, and overrides only the poses its action needs.
// Global: Rig. Depends on Song, Cast, Devil, BandStrings, BandRhythm, Rides.
const Rig = (() => {
    const S = Song, C = Cereal, TAU = Math.PI * 2;

    // What everybody does on beat: { tom, mike, howie, ben, stan } poses at t. Mouths follow the
    // voices on the track word by word (Song.mouth, Song.backMouth); `sing: false` keeps Tom's shut.
    function playing(t, o = {}) {
        const P = S.pulseAt(t), ph = P.k + P.since, p = P.pulse, even = P.k % 2 === 0, d = C.drawing(t);
        const off = Math.exp(-((P.since * 2) % 1) * 2.4); // the eighth-note pulse
        const bm = S.backMouth(t), back = bm === 'eh' ? 'sing' : bm; // Benmont and Stan sing the backing voices
        const base = { squash: 0.045 * p, headDy: 0.02 * p, sway: -0.03 * Math.sin((ph - 0.3) * Math.PI) };
        return {
            tom: { ...base, shades: 1, strum: Math.cos(ph * TAU), fret: 0.3 + 0.5 * (Math.floor(ph / 2) % 2), mouth: (o.sing === false ? null : S.mouth(t)) ?? 'smirk' },
            mike: { ...base, strum: Math.cos(ph * TAU), fret: 0.2 + 0.35 * (Math.floor(ph / 2) % 3), solo: o.solo ?? 0, mouth: (o.solo ?? 0) > 0.5 ? 'sing' : 'smirk', eyes: (o.solo ?? 0) > 0.5 ? 'shut' : 'open' },
            howie: { ...base, pluck: Math.cos(ph * TAU), fret: 0.04 + 0.13 * (Math.floor(ph / 4) % 3), mouth: 'smirk' },
            ben: { ...base, handR: 0.18 + 0.1 * (P.k % 3), handL: 0.62 + 0.1 * ((P.k + 1) % 3), press: p, mouth: back ?? 'grin' },
            stan: { kick: even ? p : 0, snare: even ? 0 : p, hat: off, crash: P.k % 16 === 0 ? p : 0, headDy: 0.03 * p, sway: base.sway, squash: 0.03 * p, mouth: back ?? 'grin' },
        };
    }

    /**
     * The band on the car. x, y: the ground under the middle of the car; s: units per figure unit.
     *   o: { spin, bounce, lean, exhaust        the car (Rides.bandCar)
     *        aboard: { stan, ben, howie, mike, tom }   0..1 each (0 = not there, a pop-in scale between)
     *        tomDrives (default true: Tom at the wheel and Mike up front; false: Tom up front, nobody drives)
     *        driver(g, s)                       with tomDrives false: draws whatever sits at the wheel, at (0, 0)
     *        cockpit: { back(g, s), front(g, s) } drawn in the car's units behind and in front of whoever is at the
     *                                           wheel (the canvas top: Weather.softTop with part 'back' / 'front')
     *        shadow                             false when the car is off the ground
     *        sing, solo                         passed to playing()
     *        pose: { tom: {…}, … }              overrides merged over the beat's poses }
     */
    function band(g, t, x, y, s, o = {}) {
        const a = { stan: 1, ben: 1, howie: 1, mike: 1, tom: 1, ...(o.aboard ?? {}) };
        const pz = playing(t, o), ov = o.pose ?? {}, drives = o.tomDrives !== false;
        const pose = (who) => ({ ...pz[who], ...(ov[who] ?? {}) });
        Rides.bandCar(g, x, y, s, { spin: o.spin ?? 0, bounce: o.bounce ?? 0, lean: o.lean ?? 0, exhaust: o.exhaust ?? 0, shadow: o.shadow, t }, (g2, seats, sc0) => {
            const put = (p, k, fn) => {
                if (k <= 0) return;
                Rides.at(g2, sc0, p, (px, py, sc) => {
                    g2.save();
                    g2.translate(px, py);
                    g2.scale(k, k);
                    fn(sc);
                    g2.restore();
                });
            };
            // Howie stands on the deck's NEAR edge, in front of the kit's right side (its hi-hat, crash stand and floor
            // tom are behind him: seats.deck[3] is a near-row place), so he goes on after Stan and before Benmont,
            // whose keyboard stands in front of them both
            put(seats.kit, a.stan, (sc) => BandRhythm.stan(g2, 0, 0, sc, pose('stan')));
            put(seats.deck[3], a.howie, (sc) => BandStrings.howie(g2, 0, 0, sc, pose('howie')));
            if (!drives) put(seats.deck[1], a.mike, (sc) => BandStrings.mike(g2, 0, 0, sc, pose('mike')));
            put(seats.deck[2], a.ben, (sc) => BandRhythm.benmont(g2, 0, 0, sc, pose('ben')));
            if (drives) {
                put(seats.deck[0], a.mike, (sc) => BandStrings.mike(g2, 0, 0, sc, pose('mike')));
                if (o.cockpit?.back) o.cockpit.back(g2, sc0);
                put(seats.driver, a.tom, (sc) => Cast.tom(g2, 0, 0, sc, pose('tom')));
                if (o.cockpit?.front) o.cockpit.front(g2, sc0);
            } else {
                // whoever is at the wheel sits further from the camera than Tom on the deck's near edge: Tom's neck
                // and fretting mitt go over him (as in the first chorus), under the top's near side
                if (o.cockpit?.back) o.cockpit.back(g2, sc0);
                if (o.driver) put(seats.driver, 1, (sc) => o.driver(g2, sc)); // whoever is at the wheel instead: draw at (0, 0)
                put(seats.deck[0], a.tom, (sc) => Cast.tom(g2, 0, 0, sc, pose('tom')));
                if (o.cockpit?.front) o.cockpit.front(g2, sc0);
            }
        });
    }

    /**
     * The Devil's hearse. o: { spin, bounce, lean, flames, jaw (the chauffeur's laugh, 0..1),
     *   devil: a pose for Devil.draw, or false when he is not aboard; devilK: his pop-in scale;
     *   chauffeur: a pose merged over the skeleton's (hands, headTilt…); shadow: false off the ground }
     */
    function hearse(g, t, x, y, s, o = {}) {
        const P = S.pulseAt(t);
        Rides.hearse(g, x, y, s, { spin: o.spin ?? 0, bounce: o.bounce ?? 0, lean: o.lean ?? 0, flames: o.flames ?? 0.4, shadow: o.shadow, t }, (g2, seats, sc0) => {
            if (o.devil !== false) {
                Rides.at(g2, sc0, seats.devil, (px, py, sc) => {
                    const k = o.devilK ?? 1;
                    g2.save();
                    g2.translate(px, py);
                    g2.scale(k, k);
                    Devil.draw(g2, 0, 0, sc, { mood: 'grin', trident: true, squash: 0.04 * P.pulse, tail: 0.04 * Math.sin((P.k + P.since) * Math.PI), ...(o.devil ?? {}) });
                    g2.restore();
                });
            }
            Rides.at(g2, sc0, seats.chauffeur, (px, py, sc) => Rides.skeleton(g2, px, py, sc, { jaw: o.jaw ?? 0, headDy: 0.02 * P.pulse, shadow: false, ...(o.chauffeur ?? {}) }));
        });
    }

    // The road's clock for travelling shots: the distance driven at film time t. Verse 1 and
    // chorus 1 share it, so the world runs on across their cuts. 1100 units a second.
    const X = (t) => 3000 + 1100 * (t - S.B(12));
    const SPEED = 1100, CAR = 84; // units per second; the cars' scale on the road (units per figure unit)

    // Where a seat is on screen, for arcs that end on it: seat('band' | 'hearse', name, x, y, s).
    function seat(car, name, x, y, s) {
        const seats = car === 'band' ? Rides.bandCarSeats() : Rides.hearseSeats(), p = name.startsWith('deck') ? seats.deck[+name.slice(4)] : seats[name];
        return [x + p[0] * s, y + p[1] * s];
    }

    return { playing, band, hearse, seat, X, SPEED, CAR };
})();
