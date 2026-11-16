// pier-pressure · the opening of a cartoon that never existed, cut to its theme song (120 BPM,
// first beat at 0.05 s, 16 bars; the song is in private/, not in the repo: audio.json).
//
//   bars 1–2   Gull Harbor: the town's sign, then the quay, quiet
//   0–7 s      the cold open: the chase in black shapes on a field of rays, in colour when the band comes in
//   7–11 s     KIT, in the harbour: her board drops in, then she does (this file, kitShot)
//   11–21 s    HOAGIE · MILO · PIP · AUNT DOT · CAPTAIN, a bar each: in on the first beat, the
//              name on the third, which is where the song says it (film.js)
//   21–23 s    Captain has the chips; the four set off after him
//   23–30 s    the chorus: down the pier, off its end, in the air
//   30 s       the last hit: the title
//
// Kit is animated pose to pose, on twos, from six drawn key poses (cast/kit-drop-a/-b-drawn.js):
// tucked in the air → legs reaching for the ground → contact → deep crouch → pushing up →
// standing proud, with four drawings between them (cast/kit-land-drawn.js). Where and when each drawing is comes from physics in the set's metres
// (cam.js): a fall is h = H − g·t²/2 (2.3 m in 0.68 s), the board bounces with a restitution of
// 0.32, loses speed at each hit and rolls to a stop under friction, and jumps a little when
// she lands beside it; Captain's hops are jumps under the same gravity.
const DIR = 'sandbox/2026-11-14-pier-pressure/';
// the cast's drawings: one file per sheet (ref/<sheet>.png, on green; tools/green.py)
const FINISH = { amount: 1, soft: 1, grain: 1, paint: 1 }; // null: the clean drawings
const SHEETS = ['kit-sheet', 'kit-drop-a', 'kit-drop-b', 'kit-ride', 'hoagie-sheet', 'hoagie-keys', 'hoagie-seq-turn', 'hoagie-seq-thumb', 'milo-sheet', 'milo-keys', 'pip-sheet', 'pip-keys', 'dot-sheet', 'dot-keys', 'captain-sheet', 'captain-keys', 'hoagie-seq-tween', 'hoagie-run', 'milo-run', 'kit-skate', 'pip-scoot', 'captain-flap', 'hoagie-leap', 'milo-leap', 'kit-leap', 'pip-leap', 'kit-land', 'dot-shake'];
const B0 = 0.05; // the song's first beat
// the edit: [from, to, name, shot(g, t, u, env), how the camera gets there]; u is the time since
// the shot's cut. Without a fifth entry the shot carries on from the one before (the camera moves
// inside the shots); with one, the camera whips there: the last frame of the shot before and the
// first two of this one are smeared along the move (L, R: a pan; U: a tilt up; in, out: a zoom)
const EDIT = [
    // The cut follows the song's words (a transcription with the time of each word; kept private):
    //    0.1 a squawk · 2.04 eight dry stabs · 4.04 the band comes in      the cold open (film.js cold)
    //    6.04 «Down at Gull Harbor, the tide's comin' in»      the first of them jumps, and the frame goes up with her to the harbour; she lands on it at 8.05
    //   10.06 «Kit's got the board»   12.00 «Hoagie's got the grin»   14.02 «Milo's got a plan»
    //   16.02 «Pip's got the nerve»   18.08 «Aunt Dot's yellin'»: each card comes in on its name
    //   19.48 «Hey, mind the curve!»  over the gull making off with her chips
    //   21.56 «Pier Pressure! (Hey!)» twice: they set off; the pier
    //   26.02 «First one down»: off the end · 28.02 «last one dry»: in the air · 30.04 «Pressure»: the title
    [0, B0 + 7, 'COLD OPEN', (g, t, u, env) => Film.cold(g, t, Math.max(0, t - B0), env, { paint: (gg) => kitShot(gg, 0, { ...env, k: env.k * 1.6 }, { noKit: true }), ...KIT_AT() })],
    // (in her last half second we are already looking through Hoagie's camcorder)
    [B0 + 7, B0 + 11, 'KIT', (g, t, u, env) => { kitShot(g, u, { ...env, k: env.k * 1.6 }); if (u >= 3.5) Film.viewfinder(g, t); }],
    [B0 + 11, B0 + 13, 'HOAGIE', (g, t, u, env) => Film.hoagie(g, t, u, env, (gg) => kitShot(gg, 4 - 1 / 24, { ...env, k: env.k * 1.6 }))],
    [B0 + 13, B0 + 15, 'MILO', (g, t, u, env, prev) => Film.milo(g, t, u, env, prev)],
    [B0 + 15, B0 + 17, 'PIP', (g, t, u, env, prev) => Film.pip(g, t, u, env, prev)],
    [B0 + 17, B0 + 19, 'AUNT DOT', (g, t, u, env, prev) => Film.dot(g, t, u, env, prev)],
    [B0 + 19, B0 + 21, 'CAPTAIN', (g, t, u, env, prev) => Film.captain(g, t, u, env, prev)],
    [B0 + 21, B0 + 23, 'AFTER HIM', (g, t, u, env) => Film.chase0(g, t, u, env), 'out'],
    [B0 + 23, B0 + 26, 'THE PIER', (g, t, u, env) => Film.pier(g, t, u, env), 'R'],
    [B0 + 26, B0 + 28, 'OFF THE END', (g, t, u, env) => Film.leap(g, t, u, env)],
    [B0 + 28, B0 + 30, 'IN THE AIR', (g, t, u, env) => Film.hang(g, t, u, env), 'U'],
    [B0 + 30, 31.75, 'PIER PRESSURE', (g, t, u, env) => Film.title(g, t, u, env)],
];

// «KIT» (4 s, from 7.05, the first shot in the harbour). She comes down ON her board: the black
// shape that led the cold open and jumped out of the top of it comes down into the quay from
// above (7.55) and lands on the song's beat at 8.05, where she is seen for the first time (a drawing of
// white, and she is in colour); low on the board, then up on it pointing the way; her card comes
// in on 10.05, as the song says her name. Nobody is seen before they are named.
const KIT_AT = () => {
    const A = Harbor.AT, KZ = A.kit[1], S = Cam.scale(KZ), KP = (S * 1.34) / 575, [gx, gy] = Cam.pt([-0.1, 0, KZ]);
    const m3 = Drawn.meta('kit', 'j3'), below = (m3.h - 8 - m3.at[1]) * ((KP * 429) / m3.m); // from her middle to her wheels, in the air
    return { KZ, S, KP, gx, gy, below, apex: -below - 30 }; // (the top of her jump: just out of the top of the frame; she fills it, there is no room to hang in it)
};
const DOT_UP = 30; // how far up her shaking drawings stand behind the counter
function kitShot(g, t, env, o = {}) {
    const T = SkateToon, C = T.COL, A = Harbor.AT, G = 9.81;
    const DROP = 0.5, LAND = 1.0, CARD = 3.0;
    const tw = (at) => at + Math.floor((t - at) * 12 + 1e-6) / 12; // t held on twos, on an event's own clock
    const { KZ, S, KP, gx, gy, below, apex } = KIT_AT(), KXW = -0.1;
    const at = (X, Y) => Cam.pt([X, Y, KZ]);
    const tau = tw(LAND) - LAND, dl = Math.round(tau * 12); // her drawings, counted from the landing

    // the quay takes her landing: three drawings of shake, drawn a touch bigger so the frame stays covered
    g.save();
    g.save();
    if (tau >= 0 && dl < 3) {
        g.translate(800 + [0, 4, -2][dl], 450 + [9, -5, 2][dl]);
        g.scale(1.02, 1.02);
        g.translate(-800, -450);
    }
    Harbor.back(g, env, t);
    // Aunt Dot (1.8 m) inside her hut, behind her counter, shaking her fry basket
    {
        const [, , dZ] = A.dot.foot, [dx, dy] = Cam.pt(A.dot.foot);
        g.save();
        g.beginPath();
        A.dot.hatch.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
        g.clip();
        // (four drawings of her own, cast/dot-shake-drawn.js: the basket up on every beat, six drawings a
        // shake; when Kit lands she stops with it half up and looks, blinks, and goes back to it)
        const n = Math.floor(t * 12 + 1e-6), since = Math.round((tw(LAND) - LAND) * 12), looks = !o.noKit && since >= 0 && since < 10;
        Film.put(g, 'dot', looks ? 'k2' : ['k3', 'k3', 'k4', 'k1', 'k1', 'k2'][n % 6], dx - 92, dy - DOT_UP, Cam.scale(dZ) / Film.M.dot.m, { blink: looks ? Film.blinkAt(t, LAND + 5 / 24) : 0 });
        g.restore();
        Harbor.counter(g, env);
    }
    // a puff of dust: a ring of lumps that spread and shrink (k: 0 at the hit … 1 gone)
    const puff = (X, k, n, size, key) => {
        if (k < 0 || k >= 1) return;
        const [px, py] = at(X, 0);
        for (let i = 0; i < n; i++) {
            const a = Math.PI * (1.05 + (0.9 * i) / (n - 1)), spread = (0.35 + 0.65 * (1 - (1 - k) * (1 - k))) * size * 3.2, r = size * (1 - k) * (0.7 + 0.3 * ((i * 7) % 3) / 2);
            if (r < 2.5) continue; // too small to draw
            const x = px + Math.cos(a) * spread * 1.5, y = py + Math.sin(a) * spread * 0.38 - size * 0.3;
            T.shape(g, [[x - r, y], [x - r * 0.6, y - r * 0.8], [x, y - r * 0.6], [x + r * 0.5, y - r * 0.95], [x + r, y - r * 0.1], [x + r * 0.6, y + r * 0.5], [x - r * 0.4, y + r * 0.55]], { fill: C.white, w: T.LINE_BG, seed: key + i });
        }
    };
    if (!o.noKit) {
        if (t < LAND) {
            // half a second of the harbour without her (its sign, as the song says its name); then she
            // comes down into it from above, standing on her board, a flat black shape still, faster and faster
            const tq = tw(0), k = (tq - DROP) / (LAND - DROP);
            if (tq >= DROP) KitAct.pose(g, 'j3', gx, apex + (gy - below - apex) * k * k, KP, { sil: C.ink });
        } else KitAct.pose(g, dl < 6 ? 'glide' : 'point', gx, gy, KP); // low on the board, six drawings; then up on it, pointing the way
    }
    if (dl >= 0 && !o.noKit) {
        puff(KXW - 0.35, tau / 0.42, 5, 26, 'kd');
        puff(KXW + 0.4, tau / 0.42, 5, 26, 'ke');
        if (dl < 2) for (let i = 0; i < 7; i++) {
            const a = Math.PI * (1.1 + i * 0.133), r0 = 330 + dl * 34, r1 = r0 + 56 - dl * 16;
            T.line(g, [[gx + Math.cos(a) * r0 * 1.1, gy - 230 + Math.sin(a) * r0], [gx + Math.cos(a) * r1 * 1.1, gy - 230 + Math.sin(a) * r1]], { w: T.LINE, seed: 'tick' + i });
        }
    }
    Harbor.fore(g, env, t);
    // Captain (0.46 m) on the foreground bollard: one jump, when she lands, under the same gravity.
    // Only the `bird` part of his perch drawing is used (the bollard of his sheet stays out)
    {
        const u = tw(LAND + 1 / 24) - (LAND + 1 / 24), v = 1.75, hgt = o.noKit || u < 0 || u > (2 * v) / G ? 0 : v * u - (G * u * u) / 2;
        Film.put3(g, 'captain', 'perch', [A.bollard.top[0], A.bollard.top[1] + hgt, A.bollard.top[2]], { only: ['bird'] });
    }
    g.restore();
    // the landing: one drawing of white, and she is seen
    if (dl === 0 && !o.noKit) { g.fillStyle = 'rgba(255, 253, 246, 0.8)'; g.fillRect(0, 0, 1600, 900); }
    // her name, slammed onto the frame as the song says it
    Film.card(g, t, CARD, 'KIT', 'GOT THE BOARD', 330, 720, { fill: C.magenta, drop: C.navy });
    g.restore();
}

Motion.scene({
    fps: 24,
    duration: 31.75,
    logical: [1600, 900],
    uses: ['styles/skate-toon/toon.js', 'styles/skate-toon/tv.js', DIR + 'cast/drawn.js', ...SHEETS.map((n) => DIR + 'cast/' + n + '-drawn.js'), DIR + 'cast/hoagie-edit.js', DIR + 'cast/kit-act.js', DIR + 'cam.js', DIR + 'set.js', DIR + 'film.js'],
    fonts: [{ family: 'Bangers', src: 'fonts/Bangers-Regular.ttf' }],
    bpm: 120,
    beatOffset: B0,
    shots: EDIT.map(([a, b, name]) => [a, b, name]),

    draw(g, t, env) {
        const i = Math.max(0, EDIT.findIndex(([from, to]) => t >= from && t < to)), [a, b, , shot, tr] = EDIT[i], next = EDIT[i + 1];
        const fr = Math.round((t - a) * 24), left = Math.round((b - t) * 24); // frames since the cut, and to the next
        // the smear of a whip: the frame stretched [sx, sy] and pushed dx along the move
        const OUT = { L: [9, 1, 220], R: [9, 1, -220], U: [1, 7, 0], in: [2.2, 2.2, 0], out: null };
        const IN = { L: [[6, 1, -260], [2.2, 1, -80]], R: [[6, 1, 260], [2.2, 1, 80]], U: [[1, 4.5, 0], [1, 1.8, 0]], in: [[1.45, 1.45, 0], [1.13, 1.13, 0]], out: [[2, 2, 0], [1.3, 1.3, 0]] };
        const sm = next?.[4] && left <= 1 ? OUT[next[4]] : tr && fr < 2 ? IN[tr][fr] : null;
        g.save();
        if (sm) {
            g.translate(800 + sm[2], 450);
            g.scale(sm[0], sm[1]);
            g.translate(-800, -450);
        }
        // (a shot may ask for the last frame of the one before it, to come in over it)
        const before = EDIT[i - 1], prev = before ? (gg) => before[3](gg, before[1] - 1 / 24, before[1] - before[0] - 1 / 24, env, null) : null;
        shot(g, t, t - a, env, prev);
        g.restore();
        if (sm) Film.streaks(g, t, sm);
    },
    // the broadcast finish (styles/skate-toon/tv.js): paint, film, standard-definition video
    post(ctx, t, env) { if (FINISH) SkateToonTV.post(ctx, t, env, FINISH); },
});
