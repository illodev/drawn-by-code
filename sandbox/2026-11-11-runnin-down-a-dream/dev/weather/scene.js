// dev: the weather props (weather.js), to judge them at size. One sheet per second; add 0.25,
// 0.5 or 0.75 to a sheet's time for its variants (the options at their extremes, other
// drawings). Render with --at 0,0.25,… --size 1080. The film-size sheets go through the tape
// and the tube as in the film; the close ones (s = 300) are flat.
//   0  the hearse tows the machine on the rain road (s = 84)     1  three machines standing alone: an imp cranks, the Devil cranks, iced
//   2  the machine at s = 300                                     3  its front end at s = 300: gearbox, crank, step, tow bar, an imp cranking
//   4  the storm cloud: grow 0 … 1, flash, rain                   5, 6, 7  the front crossing the frame (k = 0.22, 0.5, 0.8)
//   8  the canvas top on the band's car with the band (s = 84)    9, 10  the cockpit at s = 300: up and the wipers at their extremes
//  11  umbrellas held by Tom and the Devil (s = 200 and 84)      12  the umbrella at s = 300
//  13  the block of ice with the Devil (s = 200 and 84)          14  the block at s = 300
//  15  calendar pages flying past the car                        16  a page at s = 300
//  17  Hell frozen over (the office set of planb.js)             18  the same with its actors: the block, the imps dressed for it
//  19  the imps' scarf and earmuffs at s = 300                   20  the same at film size (s = 132 and 56), breath
Motion.scene({
    fps: 24, duration: 21, logical: [1000, 1000],
    uses: ['styles/cereal-ad/cereal.js', 'sandbox/2026-11-11-runnin-down-a-dream/song.js', 'sandbox/2026-11-11-runnin-down-a-dream/cast.js', 'sandbox/2026-11-11-runnin-down-a-dream/devil.js',
        'sandbox/2026-11-11-runnin-down-a-dream/fx.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-strings.js', 'sandbox/2026-11-11-runnin-down-a-dream/band-rhythm.js',
        'sandbox/2026-11-11-runnin-down-a-dream/rides.js', 'sandbox/2026-11-11-runnin-down-a-dream/rig.js', 'sandbox/2026-11-11-runnin-down-a-dream/world.js',
        'sandbox/2026-11-11-runnin-down-a-dream/segments/planb.js', 'sandbox/2026-11-11-runnin-down-a-dream/weather.js'],
    fonts: [{ family: 'Anton', src: 'fonts/Anton-latin.woff2' }],
    draw(g, t, env) {
        const C = Cereal, K = C.COL, W = Weather, sheet = Math.floor(t + 1e-6), v = Math.round((t - sheet) * 4) % 4, tt = 20.5 + v / 12;
        const CAR = Rig.CAR;
        const stage = (a, b, y = 838) => {
            C.sunburst(g, 500, 560, { n: 12, rot: 0.2, a, b });
            const lip = [[-40, 1040]];
            for (let i = 0; i <= 22; i++) lip.push([i * 50 - 50, y + (i % 2 ? 0 : 24)]);
            lip.push([1040, 1040]);
            C.poly(g, lip, { fill: K.navy, lw: 0 });
            C.poly(g, lip.slice(1, -1), { ink: K.ink, lw: 5, close: false });
        };
        const road = (theme, X = 4000) => {
            World.back(g, tt, X, theme, theme === 'day' ? { sun: { x: 800, y: 170, r: 70 } } : {});
        };
        // the band on its car as Rig.band seats it, with the canvas top round the driver
        const bandUnderTop = (x, y, s, o, up, wipe) => {
            const pz = Rig.playing(tt, {});
            Rides.bandCar(g, x, y, s, { spin: 0.4, bounce: o.bounce ?? 0, lean: o.lean ?? 0, exhaust: 0.5, t: tt }, (g2, seats, sc0) => {
                const put = (p, fn) => Rides.at(g2, sc0, p, (px, py, sc) => fn(px, py, sc));
                put(seats.kit, (px, py, sc) => BandRhythm.stan(g2, px, py, sc, pz.stan));
                put(seats.deck[3], (px, py, sc) => BandStrings.howie(g2, px, py, sc, pz.howie));
                put(seats.deck[2], (px, py, sc) => BandRhythm.benmont(g2, px, py, sc, pz.ben));
                put(seats.deck[0], (px, py, sc) => BandStrings.mike(g2, px, py, sc, pz.mike));
                if (up != null) W.softTop(g2, sc0, { up, part: 'back' });
                if (!o.empty) put(seats.driver, (px, py, sc) => Cast.tom(g2, px, py, sc, pz.tom));
                if (up != null) W.softTop(g2, sc0, { up, part: 'front' });
                if (wipe != null) W.wipers(g2, sc0, wipe);
            });
        };
        const imp = (x, y, s, pose, wearIt = null) => {
            Devil.imp(g, x, y, s, pose);
            if (wearIt) W.onImp(g, x, y, s, pose, wearIt);
        };

        if (sheet === 0) {
            // the hearse tows the machine through the rain it makes
            road('rain');
            const hx = 640, hy = World.LANE, ho = [{}, { bounce: 1 }, { bounce: -0.5 }, { lean: 0.2, bounce: 0.5 }][v];
            const mo = { towed: true, t: tt, spin: 0.7 + v, crank: v * 1.3, needles: [0.2, 1, 0.6, 0][v], puff: [0, 0.55, 1, 0][v], shake: [0, 1, 0.5, 0][v], iced: [0, 0, 0.5, 1][v] };
            const at = W.towedAt(hx, hy, CAR, ho);
            mo.pitch = at.pitch;
            W.machine(g, at.x, at.y, CAR, mo);
            Rig.hearse(g, tt, hx, hy, CAR, { spin: 0.7 + v, flames: 0.5, ...ho, devil: { mood: 'laugh', trident: true } });
            const P = W.machinePoints(mo), mouth = [at.x + P.mouth[0] * CAR, at.y + P.mouth[1] * CAR];
            W.stormCloud(g, mouth[0] - 60, mouth[1] - 250, CAR, { grow: 0.75, t: tt, rain: 1, fall: 3, flash: v === 1 ? 1 : 0 });
            W.stormCloud(g, mouth[0] - 6, mouth[1] - 40 - v * 22, CAR, { grow: [0, 0.12, 0.28, 0][v], t: tt });
            World.rain(g, tt, 1);
        } else if (sheet === 1) {
            road('day');
            const y = World.LANE;
            // an imp on the step
            const cr = [0, Math.PI / 2, Math.PI, Math.PI * 1.5][v], mo = { t: tt, crank: cr, needles: 0.3 + 0.2 * v, puff: v / 3, shake: v === 2 ? 1 : 0 };
            W.machine(g, 180, y, CAR, mo);
            const c = W.crankImp(cr, 0.67, mo);
            imp(180 + c.x * CAR, y + c.y * CAR, 0.67 * CAR, { armUp: c.armUp, hop: c.hop, squash: c.squash, look: -1, shadow: false, wear: 'hat' });
            // the Devil cranks from the ground
            const mo2 = { t: tt, crank: cr + 0.6, needles: 1, puff: 0.3 * v };
            W.machine(g, 500, y, CAR, mo2);
            const h = W.machinePoints(mo2).handle(cr + 0.6), dx = 500 + (h[0] + 0.86) * CAR, dy = y + 4;
            Devil.draw(g, dx, dy, CAR, { mood: 'laugh', handR: [(500 + h[0] * CAR - dx) / CAR, (y + h[1] * CAR - dy) / CAR], tail: 0.03 });
            // frozen
            W.machine(g, 830, y, CAR, { t: tt, iced: [0.33, 0.66, 1, 1][v], crank: 2.2, needles: 0.9, shake: v === 3 ? 1 : 0 });
        } else if (sheet === 2) {
            stage(K.sky, K.aqua, 950);
            W.machine(g, 520, 962, 300, { t: tt, crank: 0.7 + v, needles: [0.15, 1, 0.6, 0.9][v], puff: [0, 0.6, 0, 0][v], shake: [0, 1, 0, 0][v], iced: [0, 0, 0.5, 1][v], spin: v });
        } else if (sheet === 3) {
            stage(K.sky, K.aqua, 950);
            const cr = [0.3, Math.PI / 2, Math.PI, Math.PI * 1.5][v], mo = { t: tt, crank: cr, needles: 0.5, towed: v % 2 === 1, iced: v === 3 ? 0.7 : 0 };
            W.machine(g, 330, 930, 300, mo);
            const c = W.crankImp(cr, 0.67, mo);
            imp(330 + c.x * 300, 930 + c.y * 300, 0.67 * 300, { armUp: c.armUp, hop: c.hop, squash: c.squash, look: -1, shadow: false, wear: ['specs', 'hat', 'bow', 'hat'][v] });
        } else if (sheet === 4) {
            C.sunburst(g, 500, 730, { n: 12, rot: 0.2, a: '#7f88a8', b: '#8a93b3' });
            [0, 0.25, 0.5, 0.75, 1].forEach((gr, i) => W.stormCloud(g, 110 + i * 150 + i * i * 14, 270, CAR * 0.62, { grow: gr, t: tt }));
            W.stormCloud(g, 300, 620, 104, { grow: 1, t: tt, flash: [0, 0.4, 1, 0][v], rain: [0, 1, 1, 0.5][v], fall: 2.6 });
            W.stormCloud(g, 770, 560, 84, { grow: [0.05, 0.35, 0.6, 0.9][v], t: tt, rain: 1, flash: v === 3 ? 1 : 0 });
        } else if (sheet >= 5 && sheet <= 7) {
            const k = [0.22, 0.5, 0.8][sheet - 5] + v * 0.02, X = 4000 + v * 300;
            W.split(g, k, () => {
                World.back(g, tt, X, 'rain');
            }, () => {
                World.back(g, tt, X, 'day', { sun: { x: 800, y: 170, r: 70 } });
            });
            Rig.band(g, tt, 500, World.LANE, CAR, { spin: 0.4 + v, exhaust: 0.5 });
            W.split(g, k, () => World.rain(g, tt, 1), null);
            W.front(g, tt, k, { flash: v === 2 ? 1 : 0 });
        } else if (sheet === 8) {
            road('rain');
            bandUnderTop(500, World.LANE, CAR, {}, [1, 0, 0.35, 0.62][v], v === 0 ? 0.5 : null);
            World.rain(g, tt, 1);
            if (v === 0) W.drips(g, 500 + 2.3 * CAR, World.LANE - 2.45 * CAR, CAR, tt, 4, { w: 1.0 });
        } else if (sheet === 9 || sheet === 10) {
            stage('#7f88a8', '#8a93b3', 950);
            const up = sheet === 9 ? [1, 0, 0.35, 0.62][v] : [0.18, 0.5, 0.85, 1][v];
            const o = sheet === 10 && v === 3 ? { lean: 0.2, bounce: 1 } : sheet === 10 && v === 1 ? { empty: true } : {};
            bandUnderTop(500 - 2.25 * 300, 940, 300, o, up, sheet === 9 ? [0.9, null, null, null][v] : [null, null, -0.9, 0][v]);
        } else if (sheet === 11) {
            stage('#7f88a8', '#8a93b3');
            // Tom under an open one, the Devil with his furled, then opening
            const hand = [0.52, -0.86];
            const tl = [0.1, -0.5, 0.8, 0.3][v];
            W.umbrella(g, 260 + hand[0] * 200, 880 + hand[1] * 200, 200, { open: 1, tilt: tl, color: K.yellow });
            Cast.tom(g, 260, 880, 200, { shades: 1, windmill: null, fret: 0.3 });
            // Tom's own arm holds his guitar: a spare mitt for the sheet
            Cast.arm(g, Cast.TOM, 3.2, [260 + 0.33 * 200, 880 - 0.85 * 200], [260 + hand[0] * 200, 880 + hand[1] * 200]);
            const dh = [0.62, -0.8], op = [0, 0.35, 0.7, 1][v];
            W.umbrella(g, 690 + dh[0] * 200, 880 + dh[1] * 200, 200, { open: op, tilt: 0.25, color: K.magenta });
            Devil.draw(g, 690, 880, 200, { mood: op > 0.5 ? 'grin' : 'angry', handL: dh, tail: 0.02 });
            if (v !== 1) W.drips(g, 260 + hand[0] * 200 + Math.sin(tl) * 250, 880 + hand[1] * 200 - 248 + 0, 200, tt, 6, { w: 1.9 });
            // at the road's size
            W.umbrella(g, 480 + 0.6 * CAR, 400 - 0.8 * CAR, CAR, { open: 1, tilt: 0.2, color: K.teal });
            Devil.draw(g, 480, 400, CAR, { mood: 'sly', handL: [0.6, -0.8] });
            W.umbrella(g, 600 + 0.6 * CAR, 400 - 0.8 * CAR, CAR, { open: 0, tilt: 0.5, color: K.red });
            Devil.draw(g, 600, 400, CAR, { mood: 'angry', handL: [0.6, -0.8] });
        } else if (sheet === 12) {
            stage('#7f88a8', '#8a93b3', 950);
            W.umbrella(g, 500, 760, 300, { open: [1, 0, 0.5, 1][v], tilt: [0, 0.3, -0.3, 0.8][v], color: [K.yellow, K.magenta, K.teal, K.red][v] });
            W.drips(g, 500, 760 - 1.24 * 300, 300, tt, 6, { w: 1.9 });
        } else if (sheet === 13 || sheet === 14) {
            stage(K.pink, K.rose, sheet === 13 ? 838 : 950);
            const o = [{}, { crack: 1, shake: 1 }, { melt: 0.5, crack: 0.4 }, { melt: 1 }][v];
            const frozen = (x, y, s) => (g2) => {
                const hr = [-0.78, -1.0];
                W.crankArm(g2, x + hr[0] * s, y + hr[1] * s, s, 2.3);
                Devil.draw(g2, x, y, s, { mood: 'laugh', handR: hr, handL: [0.62, -0.92], headTilt: -0.06, tail: 0.02, shadow: false });
            };
            if (sheet === 13) {
                W.iceBlock(g, 330, 880, 200, { ...o, t: tt }, frozen(330, 880, 200));
                W.iceBlock(g, 760, 880, CAR, { ...o, t: tt }, frozen(760, 880, CAR));
                W.iceBlock(g, 760, 520, CAR, { melt: [0.15, 0.3, 0.75, 0.9][v], t: tt }, frozen(760, 520, CAR));
            } else {
                W.iceBlock(g, 480, 940, 300, { ...o, t: tt }, frozen(480, 940, 300));
            }
        } else if (sheet === 15) {
            road('rain', 4000 + v * 500);
            Rig.band(g, tt, 500, World.LANE, CAR, { spin: 0.4 + v, exhaust: 0.5 });
            World.rain(g, tt, 1);
            const days = ['MON', 'TUE', 'WED'];
            days.forEach((day, i) => W.calendar(g, 190 + i * 300 + v * 20, 300 + (i % 2) * 150 - v * 12, [CAR, 110, 140][(i + v) % 3], { day, rot: [-0.3, 0.2, -0.12, 0.5][(i + v) % 4], curl: [0.1, 0.5, 1, 0][(i + v) % 4] }));
        } else if (sheet === 16) {
            stage('#7f88a8', '#8a93b3', 950);
            W.calendar(g, 500, 480, 300, { day: ['MON', 'TUE', 'WED', 'MON'][v], rot: [0, -0.2, 0.15, 0.6][v], curl: [0, 0.5, 1, 0.3][v] });
        } else if (sheet === 17 || sheet === 18) {
            // the office set of planb.js without its actors (dev only: they are switched off while it draws)
            const dd = Devil.draw, di = Devil.imp;
            Devil.draw = () => {};
            Devil.imp = () => {};
            Seg.planb.draw(g, 55.375 - 1 / 24, env);
            Devil.draw = dd;
            Devil.imp = di;
            const k = sheet === 17 ? [1, 0.6, 0.25, 1][v] : 1;
            W.frozenHell(g, tt + (v === 3 ? 0.5 : 0), { k, swing: v === 3 ? 0.08 : 0 });
            if (sheet === 18) {
                const hr = [-0.78, -1.0], DX = 300, DY = 905, DS = 196;
                W.iceBlock(g, DX, DY, DS, { t: tt, crack: v === 1 ? 1 : 0, shake: v === 1 ? 1 : 0, melt: v === 2 ? 0.4 : 0 }, (g2) => {
                    W.crankArm(g2, DX + hr[0] * DS, DY + hr[1] * DS, DS, 2.3);
                    Devil.draw(g2, DX, DY, DS, { mood: 'laugh', handR: hr, handL: [0.62, -0.92], headTilt: -0.06, tail: 0.02, shadow: false });
                });
                [[530, 'specs', K.yellow], [680, 'hat', K.green], [830, 'bow', K.violet]].forEach(([ix, wear, col], i) => {
                    const pose = { wear, mood: i === 1 ? 'oops' : 'awe', look: -1, squash: (C.drawing(tt) + i) % 2 ? 0.05 : 0, armUp: i === 2 ? 0.6 : 0, tail: 0.03 };
                    imp(ix, 962, 132, pose, (g2) => {
                        W.scarf(g2, 132, col, { t: tt, blow: 0.4 });
                        W.earmuffs(g2, 132, wear);
                    });
                    W.breath(g, ix - 30, 962 - 0.45 * 132, 132, tt + i * 0.3, -1);
                });
            }
        } else if (sheet === 19) {
            stage(K.pink, K.rose, 950);
            [['specs', K.yellow], ['hat', K.green], ['bow', K.violet]].forEach(([wear, col], i) => {
                const pose = [{ wear }, { wear, hold: 'board', write: 0.5 }, { wear, hop: 0.2, squash: -0.05, mood: 'awe', armUp: 1 }, { wear, squash: 0.2, mood: 'oops' }][v];
                imp(180 + i * 320, 900, 270, pose, (g2) => {
                    W.scarf(g2, 270, col, { t: tt, blow: [0.3, 0.3, 1, -1][v], board: v === 1 });
                    W.earmuffs(g2, 270, wear);
                });
            });
            W.breath(g, 180 + 0.2 * 270, 900 - 0.42 * 270, 270, tt);
        } else if (sheet === 20) {
            stage(K.pink, K.rose);
            [['specs', K.yellow], ['hat', K.green], ['bow', K.violet]].forEach(([wear, col], i) => {
                const pose = { wear, mood: ['grin', 'awe', 'oops'][i], squash: 0.04 };
                imp(190 + i * 180, 880, 132, pose, (g2) => {
                    W.scarf(g2, 132, col, { t: tt, blow: 0.4 });
                    W.earmuffs(g2, 132, wear);
                });
                W.breath(g, 190 + i * 180 + 26, 880 - 0.42 * 132, 132, tt + i * 0.25);
                imp(720 + i * 80, 880, 56, pose, (g2) => {
                    W.scarf(g2, 56, col, { t: tt });
                    W.earmuffs(g2, 56, wear);
                });
                W.breath(g, 720 + i * 80 + 12, 880 - 0.42 * 56, 56, tt + i * 0.25);
            });
            W.closedBoard(g, 500, 180, 110, { swing: [0, 0.1, -0.1, 0][v] });
            Devil.draw(g, 880, 620, CAR, { mood: 'shock' });
            W.breath(g, 880 + 0.1 * CAR, 620 - 1.05 * CAR, CAR, tt);
        }
    },
    post(ctx, t, env) {
        const sheet = Math.floor(t + 1e-6);
        if ([0, 1, 5, 6, 7, 8, 11, 13, 15, 17, 18, 20].includes(sheet)) Cereal.post(ctx, t, env);
    },
});
