// pier-pressure · the opening of a cartoon that never existed, cut to its theme song (120 BPM,
// first beat at 0.05 s, 16 bars; the song is in private/, not in the repo: audio.json).
//
//   bars 1–2   Gull Harbor: the town's sign, then the quay, quiet
//   0–2 s      GULL HARBOR: its sign, and back from it to the whole quay
//   2–11 s     KIT: her board drops in, then she does (this file, kitShot)
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
const SHEETS = ['kit-sheet', 'kit-drop-a', 'kit-drop-b', 'kit-ride', 'hoagie-sheet', 'hoagie-keys', 'hoagie-seq-turn', 'hoagie-seq-thumb', 'milo-sheet', 'milo-keys', 'pip-sheet', 'pip-keys', 'dot-sheet', 'dot-keys', 'captain-sheet', 'captain-keys', 'hoagie-seq-tween', 'hoagie-run', 'milo-run', 'kit-skate', 'pip-scoot', 'captain-flap', 'hoagie-leap', 'milo-leap', 'kit-leap', 'pip-leap', 'kit-land'];
const B0 = 0.05; // the song's first beat
// the edit: [from, to, name, shot(g, t, u, env), how the camera gets there]; u is the time since
// the shot's cut. Without a fifth entry the shot carries on from the one before (the camera moves
// inside the shots); with one, the camera whips there: the last frame of the shot before and the
// first two of this one are smeared along the move (L, R: a pan; U: a tilt up; in, out: a zoom)
const EDIT = [
    // The cut follows the song's words (a transcription with the time of each word; kept private):
    //    2.04 eight stabs: her board comes down · 4.04 the band comes in: she lands
    //    6.04 «Down at Gull Harbor, the tide's comin' in»      she rides out and round and in again
    //   10.06 «Kit's got the board»   12.00 «Hoagie's got the grin»   14.02 «Milo's got a plan»
    //   16.02 «Pip's got the nerve»   18.08 «Aunt Dot's yellin'»: each card comes in on its name
    //   19.48 «Hey, mind the curve!»  over the gull making off with her chips
    //   21.56 «Pier Pressure! (Hey!)» twice: they set off; the pier
    //   26.02 «First one down»: off the end · 28.02 «last one dry»: in the air · 30.04 «Pressure»: the title
    [0, B0 + 2, 'GULL HARBOR', (g, t, u, env) => Film.harbor(g, t, Math.max(0, t - B0), env)],
    // (in her last half second we are already looking through Hoagie's camcorder)
    [B0 + 2, B0 + 11, 'KIT', (g, t, u, env) => { kitShot(g, u, { ...env, k: env.k * 1.6 }); if (u >= 7.5) Film.viewfinder(g, t); }],
    [B0 + 11, B0 + 13, 'HOAGIE', (g, t, u, env) => Film.hoagie(g, t, u, env, (gg) => kitShot(gg, 9 - 1 / 24, { ...env, k: env.k * 1.6 }))],
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

// «KIT» (9 s, from 2.05): her board comes down through the song's eight dry stabs and hits the
// stone on the fifth (3.05); she lands as the whole band comes in (4.05); she is on the board and
// away at 5.55, back in from the left at 6.8, through «the tide's comin' in», and stops pointing
// the way at 9.05; her card comes in on 10.05, as the song says her name.
function kitShot(g, t, env) {
    const T = SkateToon, C = T.COL, A = Harbor.AT;
    const G = 9.81, H0 = 2.3, TF = Math.sqrt((2 * H0) / G); // the drop: 2.3 m, 0.68 s
    const HIT = 1.0, LAND = 2.0, CARD = 8.0;
    // ... and then she is on it: off to the right (RIDE), round the back of us, in again from the
    // left (BACK) and to a stop where she landed (STOP), pointing the way, for her card
    const RIDE = 3.5, BACK = 4.75, STOP = 7.0;
    const tw = (at) => at + Math.floor((t - at) * 12 + 1e-6) / 12; // t held on twos, on an event's own clock
    const KZ = A.kit[1], KXW = -0.1, S = Cam.scale(KZ);
    // her standing drawing (`proud`) is 575 of its pixels from the top of her head to her soles: 1.34 m
    const KP = (S * 1.34) / 575;
    const at = (X, Y) => Cam.pt([X, Y, KZ]);
    // the board ends up beside her, a step nearer the camera
    const BZ = KZ - 0.15, BS = (Cam.scale(BZ) * Cam.HEIGHT.kit) / 700, bat = (X, Y) => Cam.pt([X, Y, BZ]);

    // --- the board ------------------------------------------------------------------------
    // Its flight, three bounces and its roll, worked back from where it must stop: beside her
    // right boot. Each stage: [duration, sideways speed at its start, upward speed at its start].
    const E = 0.32, v1 = Math.sqrt(2 * G * H0), BX = 0.66;
    const stages = [[TF, 1.2, 0], [(2 * E * v1) / G, 0.62, E * v1], [(2 * E * E * v1) / G, 0.36, E * E * v1], [0.34, 0.36, 0]];
    const board = (tt) => {
        let t0 = HIT - TF, x = BX - 0.36 * 0.34 * 0.5 - stages[2][0] * 0.36 - stages[1][0] * 0.62 - TF * 1.2;
        if (tt < t0) return null;
        for (const [i, [dur, vx, vy]] of stages.entries()) {
            const u = tt - t0;
            if (u < dur || i === 3) {
                if (i === 3) {
                    // rolling: friction takes its speed off evenly, to nothing
                    const k = Math.min(1, u / dur);
                    return { x: x + vx * dur * (k - (k * k) / 2), h: 0, rot: 0, stage: 3, u };
                }
                const h = i === 0 ? H0 - (G * u * u) / 2 : vy * u - (G * u * u) / 2;
                // nose down in the fall, levelling as it comes; a rock on each bounce
                const rot = i === 0 ? -0.5 * (1 - u / dur) : (i === 1 ? 0.2 : -0.1) * Math.sin((u / dur) * Math.PI);
                return { x: x + vx * u, h: Math.max(0, h), rot, stage: i, u };
            }
            x += vx * dur;
            t0 += dur;
        }
    };
    const hits = [HIT, HIT + stages[1][0], HIT + stages[1][0] + stages[2][0]]; // when it meets the stone

    // --- Kit ---------------------------------------------------------------------------------
    const VX = 1.6, SKID = 0.1; // she comes down almost straight; her feet slide a hand's width
    const tk = tw(LAND), tau = tk - LAND, dl = Math.round(tau * 12); // her drawings, counted from the landing
    const slide = tau < 0 ? 0 : SKID * (1 - Math.pow(1 - Math.min(1, tau / 0.25), 2));
    const beat = Motion.pulse(tw(0), 120, 0, 6);

    // --- the frame ----------------------------------------------------------------------------
    // the quay takes her landing: three drawings of shake, drawn a touch bigger so the frame
    // stays covered
    g.save();
    g.save();
    if (tau >= 0 && dl < 3) {
        g.translate(800 + [0, 4, -2][dl], 450 + [7, -4, 2][dl]);
        g.scale(1.02, 1.02);
        g.translate(-800, -450);
    }
    Harbor.back(g, env, t);

    // Aunt Dot (1.8 m) inside her hut, behind her counter, a cone of chips held out as the opening
    // left her (and as the gull will find her): the clatter makes her blink, twice, and
    // so does the landing (her drawing stays where it is: slid up and down it was a cut-out)
    {
        const [, , dZ] = A.dot.foot, [dx, dy] = Cam.pt(A.dot.foot);
        g.save();
        g.beginPath();
        A.dot.hatch.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
        g.clip();
        Film.put(g, 'dot', 'serve', dx - 92, dy - 44, Cam.scale(dZ) / Film.M.dot.m, { blink: Math.max(Film.blinkAt(t, HIT + 2 / 24), Film.blinkAt(t, HIT + 8 / 24), Film.blinkAt(t, LAND + 3 / 24)) });
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

    // Kit: one drawing per pose, held on twos; each lands where the physics puts her
    const kit = () => {
        if (dl < -8) return;
        if (t >= RIDE) {
            // her riding drawings carry their own board: placed where the board lies, by its wheels
            const ride = (name, X) => { const [px, py] = bat(X, 0); KitAct.pose(g, name, px, py, (KP * Cam.scale(BZ)) / S); };
            const v = tw(RIDE) - RIDE, XS = KXW + 0.25;
            if (t < BACK) {
                // three drawings of push where the board lay, then low and gone
                if (v < 1.1) ride(v < 3 / 12 ? 'push' : 'glide', BX + 0.3 * v + 6.5 * v * v);
            } else if (t < STOP) {
                // in from the left on her pushing cycle, losing speed; the last third coasting, low
                const p = (tw(BACK) - BACK) / (STOP - BACK), n = Math.round((tw(BACK) - BACK) * 12);
                ride(p < 0.62 ? ['s1', 's2', 's3', 's4'][n % 4] : 'glide', XS - 4.2 * (1 - p) * (1 - p));
            } else ride('point', XS);
            return;
        }
        if (dl < 0) {
            const u = tk - (LAND - TF), h = Math.max(0, H0 - (G * u * u) / 2), [px, py] = at(KXW - SKID - VX * (LAND - tk), h);
            // tucked, coming upright as she falls (one slow turn, not a wobble); then her legs go
            // down for the ground (the frame only sees the last metre and a half of the drop)
            if (dl < -1) KitAct.pose(g, 'tuck', px, py, KP, { rot: -0.16 * Math.pow((-1 - dl) / 7, 1.5) });
            else KitAct.pose(g, 'reach', px, py, KP, { rot: -0.03 });
            return;
        }
        const [px, py] = at(KXW - SKID + slide, 0);
        // Ten drawings from the ground to standing, the keys with the frames between them
        // (cast/kit-land-drawn.js): contact · going down · the crouch, held two · coming up, one eye
        // open · half-way · almost up, the grin · up with her eyes shut, held two · proud, and she
        // holds it (the eyes-shut drawing faces us more than `proud` does: as a blink it would turn
        // her head, so it is not used as one)
        const SEQ = ['contact', 'n1', 'crouch', 'crouch', 'n2', 'rise', 'n3', 'n4', 'n4', 'proud'];
        KitAct.pose(g, SEQ[Math.min(dl, SEQ.length - 1)], px, py, KP);
    };
    // the board: its flight and its roll; it jumps a little when she lands beside it
    const drawBoard = () => {
        const b = board(Math.min(tw(HIT - TF), 1.99));
        if (!b || t >= RIDE) return;
        const u = tau, hopV = 1.1, hop = u < 0 || u > (2 * hopV) / G ? 0 : hopV * u - (G * u * u) / 2;
        const [bx, by] = bat(b.x + (u > 0 ? Math.min(u, (2 * hopV) / G) * 0.18 : 0), b.h + hop);
        KitAct.board(g, bx, by, BS, b.rot + (hop > 0 ? -0.16 * Math.sin((u / ((2 * hopV) / G)) * Math.PI) : 0));
    };
    // she is behind the board once she is down; in the air she passes in front of where it rolls
    kit();
    drawBoard();
    for (const [i, h] of hits.entries()) {
        const k = (tw(h) - h) / (0.34 - i * 0.08), bb = board(h), [px] = bat(bb.x, 0);
        puff(bb.x + (px - at(bb.x, 0)[0]) / S, k, 5, 20 - i * 6, 'bd' + i);
    }
    if (dl >= 0) {
        puff(KXW, tau / 0.42, 7, 30, 'kd');
        const [px, py] = at(KXW, 0);
        if (dl < 2) for (let i = 0; i < 7; i++) {
            const a = Math.PI * (1.1 + i * 0.133), r0 = 330 + dl * 34, r1 = r0 + 56 - dl * 16;
            T.line(g, [[px + Math.cos(a) * r0 * 1.1, py - 250 + Math.sin(a) * r0], [px + Math.cos(a) * r1 * 1.1, py - 250 + Math.sin(a) * r1]], { w: T.LINE, seed: 'tick' + i });
        }
    }
    Harbor.fore(g, env, t);

    // Captain (0.46 m) on the foreground bollard: a start at the clatter, a bigger one when she
    // lands; each a jump under the same gravity. Only the `bird` part of his perch drawing is used
    // (the bollard of his sheet is its `post` part, and stays out):
    // his feet end at y = 531 of it (measured on the sheet), about x = 170
    {
        const hop = (at0, v) => {
            const u = tw(at0) - at0;
            return u < 0 || u > (2 * v) / G ? 0 : v * u - (G * u * u) / 2;
        };
        const hgt = Math.max(hop(HIT + 1 / 12, 1.15), hop(LAND + 1 / 24, 1.75), hop(RIDE + 7 / 12, 1.4)); // (and as she goes past him)
        Film.put3(g, 'captain', 'perch', [A.bollard.top[0], A.bollard.top[1] + hgt, A.bollard.top[2]], { only: ['bird'] });
    }
    g.restore();

    // her name, slammed onto the frame on the next beat
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
