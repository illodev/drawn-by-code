// 2026-09-25-physics-history · style risograph
// «A history of physics in 40 seconds»: six ways of understanding the world, told without
// text. Galileo's moons of Jupiter, Newton's fall that is an orbit, Faraday's induction,
// Curie's measurement of radioactivity, Einstein's geometry that bends light, Schrödinger's
// waves, and an atlas where all six share one space. Printed per drawing (on twos).
//
// Each segment lives in segments/<name>.js as Seg.<name> = { init, draw, atlas } and draws on
// the riso plates in local time; this file only assembles: the shared ground, which segment
// plays, and the joins (the iris through Galileo's drawn ring, the atlas).
const DIR = 'sandbox/2026-09-25-physics-history/';

// [start, end, segment] in seconds of the piece
const PLAN = [[0, 8, 'galileo'], [8, 20, 'newtonFaraday'], [20, 26, 'curie'], [26, 32, 'einstein'], [32, 37, 'schrodinger'], [37, 40, 'atlas']];

function ground(press) {
    Ph.ink(press, (g) => g.rect(0, 0, 1600, 900), { blue: 0.9 });
    Ph.ink(press, (g) => g.rect(0, 0, 1600, 900), { 'navy.s': (g) => Riso.radial(g, 820, 420, 120, 1000, 0.5, 0.95) });
}

Motion.scene({
    fps: 24,
    duration: 40,
    logical: [1600, 900],
    bpm: 120,
    audio: { mix: 'mix.wav' }, // node music.mjs && node engine/mix.mjs audio.json (regenerated, not committed)
    uses: [
        'styles/risograph/riso.js', DIR + 'kit.js', DIR + 'cast.js', DIR + 'sets.js', DIR + 'earth.js',
        DIR + 'segments/newton-faraday.js',
        { src: DIR + 'segments/galileo.js', optional: true },
        { src: DIR + 'segments/curie.js', optional: true },
        { src: DIR + 'segments/einstein.js', optional: true },
        { src: DIR + 'segments/schrodinger.js', optional: true },
        { src: DIR + 'segments/atlas.js', optional: true },
    ],
    shots: PLAN.map(([a, b, n]) => [a, b, n]),
    setup(env) {
        const st = {};
        for (const [, , n] of PLAN) st[n] = Seg[n]?.init?.(env) ?? {};
        return { press: Riso.press(env), st };
    },
    draw(g, t, env) {
        const { press, st } = env.state;
        const d = Math.floor(t * 12 + 1e-6), tq = d / 12;
        press.begin(d);
        ground(press);
        const [a, , n] = PLAN.find(([a0, b0]) => tq >= a0 && tq < b0) ?? PLAN[PLAN.length - 1];
        const seg = Seg[n];
        if (seg) seg.draw(press, tq - a, st[n], { st, t: tq });
        else placeholder(press, n, tq - a);
        // the join into Newton's study: through the ring Galileo draws round Jupiter
        if (n === 'galileo' && seg?.ring) {
            const ring = seg.ring(tq - a);
            if (ring) {
                press.save();
                press.clip((g2) => g2.arc(ring.c[0], ring.c[1], ring.r, 0, Math.PI * 2));
                press.knockout((g2) => { g2.beginPath(); g2.rect(0, 0, 1600, 900); g2.fill(); });
                ground(press);
                Seg.newtonFaraday.draw(press, 0, st.newtonFaraday);
                press.restore();
                Ph.line(press, Array.from({ length: 73 }, (_, i) => [ring.c[0] + Math.cos(i / 72 * 6.2832) * ring.r, ring.c[1] + Math.sin(i / 72 * 6.2832) * ring.r]), ring.w ?? 10, { yellow: 1, 'pink.s': 0.55 });
            }
        }
        press.print(g, { key: d });
    },
});

// until a segment exists: its name and time, so the timing can be judged
function placeholder(press, n, lt) {
    Ph.put(press, Ph.circle(800, 450, 120 + 20 * Math.sin(lt * 3)), { 'yellow.s': 0.5, 'pink.s': 0.3 });
}
