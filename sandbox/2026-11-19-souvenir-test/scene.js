// 2026-11-19-souvenir-test · style souvenir
// «Recuerdo de Andalucía»: a passage of strata to the guitar, through its mouth into the
// lemon tree, and a second passage of seven worlds to the full moon.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
// One flight down the axis that never stops gathering speed and turning (round 8: «the
// camera keeps increasing its speed and keeps turning, because the pace is very slow»). It
// starts at the old pace (430 units of depth a second), its speed grows by the same ratio
// every second up to 1700 as the last world goes by, and it lands on the moon in the last
// HOLD seconds; it rolls one whole turn on its axis over the flight, more as it goes faster,
// and lands level. The lens is set FOCUS ahead for the whole film (each thing is sharp when
// it is that far, soft before and blurred as it goes by).
const FOCUS = 1000, START = -775, PACE = { v0: 430, vmax: 1700, hold: 4 };
// Where things are along the axis. Two passages of loose things, STEP apart, each with
// something at its end that is seen small from its start:
//   the first (five strata from Z0: by the candle, Tartessos and the sea, Rome and the
//   Goths, al-Andalus, the house and the fair) goes towards the guitar, at ZG;
//   through the guitar's mouth, the lemon tree, at ZL;
//   the second (seven strata from ZS, one world each) goes towards the full moon.
// Every thing floats loose at its own depth (a stratum is a slab ± 280 deep): nothing is
// tied to a sheet or a frame (round 8: «each one loose, floating»).
const STEP = 680, Z0 = 1000, ZG = Z0 + 5 * STEP, ZL = ZG + 1340, ZS = ZL + 700;
const WORLDS = ['green', 'stilllife', 'darknight', 'dome', 'patio', 'planes', 'forge'];
const ZEND = ZS + (WORLDS.length - 1) * STEP + 280; // the last thing of the last world
// The flight is a table made once the kit is loaded (the duration and the shots are read
// after that, so they can come from it).
let F = null;
const fly = () => (F ??= Souvenir.flight({ start: START, ...PACE, peakAt: ZEND, focus: FOCUS, aperture: 10 }));
const LENGTH = () => Math.round(fly().length * 24) / 24;
const at = (z) => Math.round(fly().tOf(z) * 100) / 100; // when the camera is at depth z
// The moon is painted MOON times larger than her sheet and is that much farther off: half
// her painted size when the last world has gone by, 0.9 of it at the end of the landing.
const moon = () => {
    const away = (fly().end - ZEND) / (1 - 0.5 / 0.9);
    return { away, m: (0.5 * away) / 1000 };
};
// the night lifts in the first `lit` seconds; the last `out` seconds go back into the dark
const TIMES = { lit: 1.6, out: 0.9 };
// a world's loose pieces if it has them (round 8), its stratum of sheets if not
const piecesOf = (T, z) => (T.loose ? T.loose(z) : T.stratum ? T.stratum(z) : T(z));
// things come out of the night as the camera nears them: never all at once, never a speck
const FAR = [0.24, 0.45];

Motion.scene({
    fps: 24,
    get duration() {
        return LENGTH();
    },
    logical: [1600, 900],
    // the score is the user's and is not in the repo: their track, cut to the film, goes to
    // private/bso.wav (the render skips a mix that is not there)
    audio: { mix: 'private/bso.wav' },
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
    get shots() {
        const cuts = [[0, 'The first passage'], [at(ZG - 1500), 'The guitar'], [at(ZG), 'The lemon tree']];
        WORLDS.forEach((name, i) => cuts.push([at(ZS + i * STEP - 1000), name]));
        cuts.push([at(ZEND), 'The moon']);
        return cuts.map(([t, name], i) => [t, i + 1 < cuts.length ? cuts[i + 1][0] : LENGTH(), name]);
    },
    setup(env) {
        const far = (l) => ({ far: FAR, ...l });
        const layers = [
            ...piecesOf(Tableau.passage, Z0).map(far),
            // the guitar is seen small from the start: it is what the first passage goes to
            ...piecesOf(Tableau.emblem, ZG).map((l) => (l.loose ? far(l) : { far: [0.16, 0.3], ...l })),
            ...piecesOf(Tableau.lemons, ZL).map((l) => ({ ...far(l), brush: false })),
        ];
        // The second passage: one slab of loose things for each world. None shows before the
        // camera is past the guitar (seen through its mouth, the lemons are what fills it).
        WORLDS.forEach((name, i) => {
            for (const l of piecesOf(Tableau[name], ZS + i * STEP).map(far)) layers.push({ ...l, far: [Math.max(l.far[0], 1000 / (l.z - ZG + 600)), Math.max(l.far[1], 1000 / (l.z - ZG - 300))] });
        });
        // The moon and her sky (the forge's own, the last thing of its world): MOON times
        // farther and painted that much larger (the same pixels: `res` goes down as the box
        // goes up), kept sharp (they are too far for this lens to blur), out of the night as
        // soon as the lemon tree is. The sky has no edges: it thins into the night all round
        // (a rectangle of sky would be a frame, and the camera rolls).
        const { away, m: MOON } = moon();
        const rear = (l, back, show, grow = 1, fade = null) => {
            const m = MOON * grow, b = l.box, z = ZEND + away + back * MOON;
            return {
                ...l, z, res: (l.res ?? 1) / m, blur: 0.1, far: show.map((cam) => 1000 / (z - cam)),
                box: { x: b.x * m, y: b.y * m, w: b.w * m, h: b.h * m },
                paint(g, res) {
                    g.save();
                    g.scale(m, m);
                    l.paint(g, res * m);
                    g.restore();
                    if (fade) {
                        const r = Math.min(b.w, b.h) * 0.5 * m, gr = g.createRadialGradient(0, 0, r * fade, 0, 0, r);
                        gr.addColorStop(0, 'rgba(0,0,0,1)');
                        gr.addColorStop(1, 'rgba(0,0,0,0)');
                        g.save();
                        g.globalCompositeOperation = 'destination-in';
                        g.setTransform(g.getTransform().scaleSelf(b.w / Math.min(b.w, b.h), b.h / Math.min(b.w, b.h)));
                        g.fillStyle = gr;
                        g.fillRect(-r * 2, -r * 2, r * 4, r * 4);
                        g.restore();
                    }
                },
            };
        };
        const forge = Tableau.forge(0);
        layers.push(rear(forge.find((l) => l.id === 'forge-moon'), 0, [ZL - 2800, ZL - 1900]), rear(forge.find((l) => l.id === 'forge-sky'), 400, [ZL - 2900, ZL - 2000], 1.6, 0.55));
        // The signature, lettered under the moon in the film's own letter (the ribbon's), on
        // her layer's scale: it comes up as the last world leaves the frame, and the roll ends
        // level, so it lands straight.
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
        env.state.samples = st.rig.draw(g, t, fly().at, { bg: Tableau.NIGHT, maxSamples: 8, shutter: 0.36 });
        // the film fades up from the night (never from nothing: the flame is there at once)
        // and goes back into it at the end, the camera still going in
        const dark = Math.max(0.7 * (1 - Ease.inOut(Ease.seg(t, 0, TIMES.lit))), Ease.inOut(Ease.seg(t, LENGTH() - TIMES.out, LENGTH())));
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
