// 2026-11-19-souvenir-test · style souvenir
// «Recuerdo de Andalucía», style test: the emblem, and the dive through the guitar's mouth
// into the lemon tree.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
// One camera move at one pace, on the axis, from the first frame to the last: it never slows
// down, waits or turns towards anything. SPEED is in units of depth a second (the strata are
// 450 to 700 apart: one every second and a half or so); FOCUS is how far ahead of the camera
// the lens is set, for the whole film (each thing is sharp when it is that far, at the size
// it was painted for, soft before and blurred as it goes by).
const SPEED = 432, FOCUS = 1000, START = -775;
// Where things are along the axis. Picture 1 is the passage (its first stratum at Z0) and
// the emblem at its end; picture 2 the lemon tree, 1340 behind the guitar; every picture
// after it starts GAP behind the plate of the one before, whose hole it is first seen
// through. [name, depth from its first stratum to its plate] (the depths are repeated here
// because the film's length must be known before the pictures load).
const Z0 = 1000, ZG = Z0 + 3400, ZL = ZG + 1340, GAP = 700;
const PICTURES = [['green', 1760], ['stilllife', 1860], ['darknight', 1850], ['dome', 2100], ['patio', 2100], ['planes', 2100]];
const ZF = PICTURES.reduce((z, [, depth]) => z + GAP + depth, ZL + 420) + GAP; // the forge, the last picture
// The end. The forge's last sheet of things (the far olives) is GROVE behind its first; the
// moon behind it is painted MOON times larger and that much farther off, as a moon is: it
// barely grows while the cave and the grove go by, and once they are gone the camera,
// still at its pace, has HOLD seconds of sky in which she goes from 0.68 to 0.9 of her
// painted size, with the signature under her.
const GROVE = 1880, HOLD = 4;
const MOON_AT = (SPEED * HOLD) / (1 - 0.68 / 0.9); // how far she is when the grove has gone
const MOON = (0.68 * MOON_AT) / 1000; // 4.8
const LENGTH = Math.round(((ZF + GROVE + SPEED * HOLD - START) / SPEED) * 24) / 24;
// the night lifts in the first `lit` seconds; the last `out` seconds go back into the dark
const TIMES = { lit: 1.6, out: 0.9 };
const at = (z) => Math.round(((z - START) / SPEED) * 100) / 100; // when the camera is at depth z

Motion.scene({
    fps: 24,
    duration: LENGTH,
    logical: [1600, 900],
    uses: [
        'styles/souvenir/souvenir.js',
        DIR + 'things/citrus.js', DIR + 'things/fan.js', DIR + 'things/shawl.js',
        DIR + 'things/guitar.js', DIR + 'things/garland.js', DIR + 'things/sky.js',
        DIR + 'things/ribbon.js', DIR + 'things/charms.js',
        DIR + 'things/papers.js', DIR + 'things/wares.js', DIR + 'things/fauna.js',
        DIR + 'things/coins.js', DIR + 'things/relics.js', DIR + 'things/heirlooms.js',
        DIR + 'things/library.js', DIR + 'things/devotion.js',
        DIR + 'tableaux/passage.js', DIR + 'tableaux/emblem.js', DIR + 'tableaux/lemons.js',
        ...[...PICTURES.map((p) => p[0]), 'forge'].flatMap((n) => [DIR + `things/${n}.js`, DIR + `tableaux/${n}.js`]),
    ],
    fonts: [
        { family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }, { family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' }, { family: 'Anton', src: 'fonts/Anton-latin.woff2' },
        { family: 'Lora', src: 'fonts/Lora-Medium-latin.woff2' }, { family: 'Titan One', src: 'fonts/TitanOne-latin.woff2' },
    ],
    // one take: these only name its parts for the contact sheet (a picture begins when the
    // camera goes through the plate of the one before)
    shots: (() => {
        const cuts = [[0, 'The passage'], [at(ZG - 1500), 'The guitar'], [at(ZG), 'The lemon tree']];
        let z = ZL + 420;
        for (const [name, depth] of PICTURES) {
            cuts.push([at(z), name]);
            z += GAP + depth;
        }
        cuts.push([at(z), 'forge'], [at(ZF + GROVE), 'The moon']);
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
        // A picture is first seen through the hole of the one before: all of it, its plate
        // too, comes out of the night together with the plate that hole is in (never later:
        // a hole on nothing reads as a blue disc in the middle of the picture). The picture
        // after it does not follow: it is timed on the distance this plate would have kept
        // on its own (`own`), so only one picture ahead is ever out of the night.
        const behind = (plate, ls) => {
            const [f0, f1] = plate.own ?? plate.far;
            return ls.map(far).map((l) => ({ ...l, own: l.far, far: [Math.min(l.far[0], 1000 / (l.z - plate.z + 1000 / f0)), Math.min(l.far[1], 1000 / (l.z - plate.z + 1000 / f1))] }));
        };
        const plateOf = (ls) => ls.reduce((a, l) => (l.z > a.z ? l : a));
        let z = ZL + Tableau.lemons.depth, plate = plateOf(layers);
        for (const [name, depth] of PICTURES) {
            const T = Tableau[name];
            if (T.depth !== depth) throw new Error(`${name}: depth ${T.depth}, the film expects ${depth}`);
            const ls = behind(plate, T(z + GAP));
            layers.push(...ls);
            // the dark night's way out is light: the gap behind its hole is full of it, in
            // five thin veils, so the camera comes out of it little by little
            if (name === 'darknight') {
                const big = { x: -1800, y: -1050, w: 3600, h: 2100 }, end = plateOf(ls);
                for (let i = 0; i < 5; i++) layers.push(...behind(end, [{
                    id: 'light-' + i, z: end.z + 70 + i * 120, box: big, res: 0.12, brush: false,
                    paint(g) {
                        const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1300);
                        gr.addColorStop(0, 'rgba(246,214,128,0.2)');
                        gr.addColorStop(0.35, 'rgba(236,196,106,0.13)');
                        gr.addColorStop(1, 'rgba(226,180,90,0.05)');
                        g.fillStyle = gr;
                        g.fillRect(big.x, big.y, big.w, big.h);
                    },
                }, { z: 1e9 }]).filter((l) => l.id));
            }
            plate = plateOf(ls);
            z += GAP + depth;
        }
        // The forge; its moon and its sky are taken MOON times farther and painted that
        // much larger (the same pixels: `res` goes down as the box goes up), kept sharp
        // (they are too far for this lens to blur) and shown from where they were meant to.
        const rear = (l, back, show) => {
            const m = MOON, b = l.box;
            return {
                ...l, z: ZF + GROVE + MOON_AT + back * m, res: (l.res ?? 1) / m, blur: 0.1, far: show,
                box: { x: b.x * m, y: b.y * m, w: b.w * m, h: b.h * m },
                paint(g, res) {
                    g.scale(m, m);
                    l.paint(g, res * m);
                },
            };
        };
        const s0 = 1000 / MOON_AT; // the moon's scale when the grove has gone
        const forge = Tableau.forge(ZF), cave = forge.filter((l) => l.id !== 'forge-moon' && l.id !== 'forge-sky');
        // (the cave's last sheet is not a plate: it follows the hole like the rest)
        layers.push(...behind(plate, [...cave, { z: 1e9 }]).filter((l) => l.id));
        layers.push(rear(forge.find((l) => l.id === 'forge-moon'), 0, [s0 * 0.76, s0 * 0.85]), rear(forge.find((l) => l.id === 'forge-sky'), 400, [s0 * 0.6, s0 * 0.7]));
        // The signature, lettered under the moon in the film's own letter (the ribbon's), on
        // her layer's scale: it comes up as the grove leaves the frame.
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
        }, -0.2, [s0 * 0.985, s0 * 1.06]));
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
