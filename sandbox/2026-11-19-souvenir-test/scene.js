// 2026-11-19-souvenir-test · style souvenir
// «Recuerdo de Andalucía»: a passage of strata to the guitar, through its mouth into the
// lemon tree, and a second passage of seven worlds to the full moon.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
// One camera move at one pace, on the axis, from the first frame to the last: it never slows
// down, waits or turns towards anything. SPEED is in units of depth a second; FOCUS is how
// far ahead of the camera the lens is set, for the whole film (each thing is sharp when it
// is that far, at the size it was painted for, soft before and blurred as it goes by).
const SPEED = 432, FOCUS = 1000, START = -775;
// Where things are along the axis. Two passages of strata of things, STEP apart (one every
// second and a half), each with something at its end that is seen small from its start:
//   the first (five strata from Z0: by the candle, Tartessos and the sea, Rome and the
//   Goths, al-Andalus, the house and the fair) goes towards the guitar, at ZG;
//   through the guitar's mouth, the lemon tree, at ZL;
//   the second (seven strata from ZS, one world each) goes towards the full moon.
const STEP = 680, Z0 = 1000, ZG = Z0 + 5 * STEP, ZL = ZG + 1340, ZS = ZL + 700;
const WORLDS = ['green', 'stilllife', 'darknight', 'dome', 'patio', 'planes', 'forge'];
const ZEND = ZS + (WORLDS.length - 1) * STEP + 150; // the last sheet of the last stratum
// The moon is painted MOON times larger than her sheet and is that much farther off: she
// is small at the start of the second passage (a fifth of her painted size), half of it when
// the last stratum has gone, and then the camera, still at its pace, has HOLD seconds of
// sky in which she grows to 0.9, with the signature under her.
const HOLD = 4;
const MOON_AT = (SPEED * HOLD) / (1 - 0.5 / 0.9); // how far she is when the last stratum has gone
const MOON = (0.5 * MOON_AT) / 1000; // 1.94
const LENGTH = Math.round(((ZEND + SPEED * HOLD - START) / SPEED) * 24) / 24;
// the night lifts in the first `lit` seconds; the last `out` seconds go back into the dark
const TIMES = { lit: 1.6, out: 0.9 };
const at = (z) => Math.round(((z - START) / SPEED) * 100) / 100; // when the camera is at depth z

Motion.scene({
    fps: 24,
    duration: LENGTH,
    logical: [1600, 900],
    // the score is the user's and is not in the repo: `sh score.sh` builds it from the take in
    // private/ (the render skips a mix that is not there)
    audio: { mix: 'private/score.wav' },
    uses: [
        'styles/souvenir/souvenir.js',
        DIR + 'things/citrus.js', DIR + 'things/fan.js', DIR + 'things/shawl.js',
        DIR + 'things/guitar.js', DIR + 'things/garland.js', DIR + 'things/sky.js',
        DIR + 'things/ribbon.js', DIR + 'things/charms.js',
        DIR + 'things/papers.js', DIR + 'things/wares.js', DIR + 'things/fauna.js',
        DIR + 'things/coins.js', DIR + 'things/relics.js', DIR + 'things/heirlooms.js',
        DIR + 'things/library.js', DIR + 'things/devotion.js',
        DIR + 'tableaux/passage.js', DIR + 'tableaux/emblem.js', DIR + 'tableaux/lemons.js',
        ...WORLDS.flatMap((n) => [DIR + `things/${n}.js`, DIR + `tableaux/${n}.js`]),
    ],
    fonts: [
        { family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }, { family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' }, { family: 'Anton', src: 'fonts/Anton-latin.woff2' },
        { family: 'Lora', src: 'fonts/Lora-Medium-latin.woff2' }, { family: 'Titan One', src: 'fonts/TitanOne-latin.woff2' },
    ],
    // one take: these only name its parts for the contact sheet (a stratum's part begins when
    // the one before is being crossed)
    shots: (() => {
        const cuts = [[0, 'The first passage'], [at(ZG - 1500), 'The guitar'], [at(ZG), 'The lemon tree']];
        WORLDS.forEach((name, i) => cuts.push([at(ZS + i * STEP - 1340), name]));
        cuts.push([at(ZEND), 'The moon']);
        return cuts.map(([t, name], i) => [t, i + 1 < cuts.length ? cuts[i + 1][0] : LENGTH, name]);
    })(),
    setup(env) {
        // Things come out of the night as the camera nears them (`far`): never all at once.
        const far = (l) => ({ far: [0.2, 0.36], ...l });
        const layers = [
            ...Tableau.passage(Z0),
            ...Tableau.emblem(ZG).map(far),
            // (the tree only shows once the guitar that hides it is whole: seen sooner, it is a green
            // rectangle in the night; it is in the brush manner: its strokes are in its own paint)
            ...Tableau.lemons(ZL).map((l) => ({ ...l, far: [0.26, 0.34], brush: false })),
        ];
        // The second passage: one stratum of things for each world, in the first passage's
        // format (three sheets, a body, a way through that is only a gap in the heap). None
        // shows before the lemon tree that hides them is whole.
        WORLDS.forEach((name, i) => {
            for (const l of Tableau[name].stratum(ZS + i * STEP).map(far)) layers.push({ ...l, far: [Math.max(l.far[0], 1000 / (l.z - 3000)), Math.max(l.far[1], 1000 / (l.z - 4200))] });
        });
        // The moon and her sky (the forge's own, the last thing of its world): MOON times
        // farther and painted that much larger (the same pixels: `res` goes down as the box
        // goes up), kept sharp (they are too far for this lens to blur), and out of the night
        // as soon as the lemon tree is: she is what the second passage goes to, as the guitar
        // is for the first, and no gap is ever left open on nothing.
        const rear = (l, back, show, grow = 1) => {
            const m = MOON * grow, b = l.box, z = ZEND + MOON_AT + back * MOON;
            return {
                ...l, z, res: (l.res ?? 1) / m, blur: 0.1, far: show.map((cam) => 1000 / (z - cam)),
                box: { x: b.x * m, y: b.y * m, w: b.w * m, h: b.h * m },
                paint(g, res) {
                    g.scale(m, m);
                    l.paint(g, res * m);
                },
            };
        };
        const forge = Tableau.forge(0);
        layers.push(rear(forge.find((l) => l.id === 'forge-moon'), 0, [ZL - 2800, ZL - 1900]), rear(forge.find((l) => l.id === 'forge-sky'), 400, [ZL - 2900, ZL - 2000], 1.3));
        // The signature, lettered under the moon in the film's own letter (the ribbon's), on
        // her layer's scale: it comes up as the last stratum leaves the frame.
        const sign = { x: -520, y: 368, w: 1040, h: 130 };
        layers.push(rear({
            id: 'signature', brush: false, box: sign,
            paint(g) {
                const S = Souvenir, text = 'illodev x Claude', y = sign.y + 84;
                const base = [];
                for (let i = 0; i <= 24; i++) base.push([-480 + (960 * i) / 24, y + 14 * Math.cos(((i / 24) * 2 - 1) * 1.5)]);
                const font = '80px "IM Fell DW Pica SC"';
                // a shadow of the night under the letters, then the letters in the moon's silver
                g.save();
                g.shadowColor = 'rgba(10,12,40,0.9)';
                g.shadowBlur = 14;
                S.textOn(g, text, base, { font, color: '#0d1030', spacing: 9 });
                g.restore();
                S.textOn(g, text, base.map(([x, yy]) => [x + 1.6, yy + 2]), { font, color: '#8f8db0', spacing: 9 });
                S.textOn(g, text, base, { font, color: '#eeeaf6', spacing: 9 });
                S.tooth(g, sign, { amp: 0.04 });
            },
        }, -0.2, [ZEND - 150, ZEND + 400]));
        return { rig: Souvenir.rig(env, layers) };
    },
    draw(g, t, env) {
        const st = env.state;
        const cam = (t) => ({ z: START + SPEED * t, focus: START + SPEED * t + FOCUS, aperture: 10 });
        env.state.samples = st.rig.draw(g, t, cam, { bg: Tableau.NIGHT, maxSamples: 8, shutter: 0.36 });
        // the film fades up from the night (never from nothing: the flame is there at once)
        // and goes back into it at the end, the camera still going in
        const dark = Math.max(0.7 * (1 - Ease.inOut(Ease.seg(t, 0, TIMES.lit))), Ease.inOut(Ease.seg(t, LENGTH - TIMES.out, LENGTH)));
        if (dark > 0.004) {
            g.fillStyle = Tableau.NIGHT;
            g.globalAlpha = dark;
            g.fillRect(0, 0, env.W, env.H);
            g.globalAlpha = 1;
        }
    },
    post(ctx, t, env) {
        Souvenir.finish(ctx, env, Math.round(t * env.fps));
    },
});
