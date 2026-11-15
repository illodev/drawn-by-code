// pier-pressure · the opening of a cartoon that never existed, cut to its theme song (120 BPM,
// first beat at 0.05 s, 16 bars; the song is in private/, not in the repo: audio.json).
//
//   bars 1–2   Gull Harbor: the town's sign, then the quay, quiet
//   bars 3–4   KIT: her board drops in, then she does (this file, kitShot)
//   bar 5–9    HOAGIE · MILO · PIP · AUNT DOT · CAPTAIN, a bar each: in on the first beat, the
//              name on the third (film.js)
//   18–21 s    the song's break: Captain has the chips; the four set off after him
//   21–30 s    the chorus: down the pier, off its end, in the air
//   30 s       the last hit: the title
//
// Kit is animated pose to pose, on twos, from six drawn key poses (cast/kit-drop-drawn.js):
// tucked in the air → legs reaching for the ground → contact → deep crouch → pushing up →
// standing proud. Where and when each drawing is comes from physics in the set's metres
// (cam.js): a fall is h = H − g·t²/2 (2.3 m in 0.68 s), the board bounces with a restitution of
// 0.32, loses speed at each hit and rolls to a stop under friction, and jumps a little when
// she lands beside it; Captain's hops are jumps under the same gravity.
const DIR = 'sandbox/2026-11-14-pier-pressure/';
const B0 = 0.05; // the song's first beat
// the edit: [from, to, name, shot(g, t, u, env), how the camera gets there]; u is the time since
// the shot's cut. Without a fifth entry the shot carries on from the one before (the camera moves
// inside the shots); with one, the camera whips there: the last frame of the shot before and the
// first two of this one are smeared along the move (L, R: a pan; U: a tilt up; in, out: a zoom)
const EDIT = [
    [0, B0 + 4, 'GULL HARBOR', (g, t, u, env) => Film.harbor(g, t, Math.max(0, t - B0), env)],
    [B0 + 4, B0 + 8, 'KIT', (g, t, u, env) => kitShot(g, u, { ...env, k: env.k * 1.6 })],
    [B0 + 8, B0 + 10, 'HOAGIE', (g, t, u, env) => Film.hoagie(g, t, u, env)],
    [B0 + 10, B0 + 12, 'MILO', (g, t, u, env) => Film.milo(g, t, u, env), 'L'],
    [B0 + 12, B0 + 14, 'PIP', (g, t, u, env) => Film.pip(g, t, u, env)],
    [B0 + 14, B0 + 16, 'AUNT DOT', (g, t, u, env) => Film.dot(g, t, u, env), 'in'],
    [B0 + 16, B0 + 18, 'CAPTAIN', (g, t, u, env) => Film.captain(g, t, u, env), 'R'],
    [B0 + 18, B0 + 21, 'AFTER HIM', (g, t, u, env) => Film.chase0(g, t, u, env), 'out'],
    [B0 + 21, B0 + 26, 'THE PIER', (g, t, u, env) => Film.pier(g, t, u, env), 'R'],
    [B0 + 26, B0 + 28, 'OFF THE END', (g, t, u, env) => Film.leap(g, t, u, env)],
    [B0 + 28, B0 + 30, 'IN THE AIR', (g, t, u, env) => Film.hang(g, t, u, env), 'U'],
    [B0 + 30, 31.75, 'PIER PRESSURE', (g, t, u, env) => Film.title(g, t, u, env)],
];

// «KIT» (4 s): the board hits the stone on the shot's third beat (1.0 s), she lands on its fifth
// (2.0 s, where the song's bass drops out), she is up and her card is on a beat later.
function kitShot(g, t, env) {
    const T = SkateToon, C = T.COL, A = Harbor.AT;
    const G = 9.81, H0 = 2.3, TF = Math.sqrt((2 * H0) / G); // the drop: 2.3 m, 0.68 s
    const HIT = 1.0, LAND = 2.0, CARD = 2.5;
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

    // Aunt Dot (1.8 m) inside her hut, behind her counter: the clatter makes her look up
    {
        const [, , dZ] = A.dot.foot, [dx, dy] = Cam.pt(A.dot.foot), ds = (Cam.scale(dZ) * Cam.HEIGHT.dot) / 700, [dw] = Drawn.size('dot', 'stand');
        const up = t < HIT ? 0 : 7 * (1 - Math.exp(-9 * (tw(HIT) - HIT))) + (dl >= 0 && dl < 3 ? [3, 5, 2][dl] : 0);
        g.save();
        g.beginPath();
        A.dot.hatch.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
        g.clip();
        Drawn.draw(g, 'dot', 'stand', dx - (dw / 2) * ds, dy - 706 * ds - up, ds);
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
        if (dl < 0) {
            const u = tk - (LAND - TF), h = Math.max(0, H0 - (G * u * u) / 2), [px, py] = at(KXW - SKID - VX * (LAND - tk), h);
            // tucked, turning a little as she falls; then her legs go down for the ground
            // (the frame only sees the last metre and a half of the drop: three drawings)
            if (dl < -1) KitAct.pose(g, 'tuck', px, py, KP, { rot: [-0.1, 0.06, -0.04, 0.08, -0.03, 0.02, -0.06][dl + 8] });
            else KitAct.pose(g, 'reach', px, py, KP, { rot: -0.03 });
            return;
        }
        const [px, py] = at(KXW - SKID + slide, 0);
        // contact; the crouch, deepest on its second drawing; up through the half-way pose,
        // past standing by a hair, and settled; then she breathes on the beat
        const key = dl === 0 ? ['contact', 1, 1] : dl <= 3 ? ['crouch', [1.02, 1.05, 1.01][dl - 1], [0.97, 0.93, 0.99][dl - 1]] : dl <= 5 ? ['rise', 1, [0.97, 1.02][dl - 4]]
            : ['proud', 1, dl === 6 ? 1.035 : dl === 7 ? 0.985 : 1 + beat * 0.008];
        KitAct.pose(g, key[0], px, py, KP, { sx: key[1], sy: key[2] });
    };
    // the board: its flight and its roll; it jumps a little when she lands beside it
    const drawBoard = () => {
        const b = board(Math.min(tw(HIT - TF), 1.99));
        if (!b) return;
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
        const hgt = Math.max(hop(HIT + 1 / 12, 1.15), hop(LAND + 1 / 24, 1.75));
        const top = A.bollard.top, [bx, by] = Cam.pt([top[0], top[1] + hgt, top[2]]), cs = (Cam.scale(top[2]) * Cam.HEIGHT.captain) / 525;
        Drawn.draw(g, 'captain', 'perch', bx - 170 * cs, by - 527 * cs, cs, { only: ['bird'] });
    }
    g.restore();

    // her name, slammed onto the frame on the next beat
    if (t >= CARD) {
        const dc = Math.round((tw(CARD) - CARD) * 12), k = [0.6, 1.16, 0.95, 1][Math.min(3, dc)];
        g.save();
        g.translate(300, 748);
        g.scale(0.9, 0.9);
        g.rotate(-0.07 + [0.1, -0.03, 0.01, 0][Math.min(3, dc)]);
        g.scale(k, k);
        T.slab(g, [[-190, -104], [186, -118], [198, 70], [-182, 86]], { fill: C.magenta, seed: 'card', over: 2.4, w: T.LINE * 1.2 });
        T.slab(g, [[-174, -90], [171, -103], [182, 56], [-167, 71]], { fill: null, seed: 'card-rule', over: 0.5, w: T.LINE_FINE, color: C.roadLine });
        T.sign(g, 'KIT', 4, 44, { size: 188, fill: C.roadLine, drop: C.navy, seed: 'card-name', w: T.LINE * 1.1, track: 0.06, tilt: 0.05 });
        T.slab(g, [[-150, 62], [158, 50], [162, 104], [-146, 116]], { fill: C.white, seed: 'card-sub', over: 1.6, w: T.LINE });
        T.sign(g, 'FIRST ONE DOWN', 6, 102, { size: 44, fill: C.red, seed: 'card-role', w: T.LINE_FINE * 0.8, track: 0.03, tilt: 0.03, outline: C.white });
        g.restore();
    }
    g.restore();
}

Motion.scene({
    fps: 24,
    duration: 31.75,
    logical: [1600, 900],
    uses: ['styles/skate-toon/toon.js', DIR + 'cast/drawn.js', ...['kit', 'hoagie', 'milo', 'pip', 'dot', 'captain'].map((w) => DIR + 'cast/' + w + '-drawn.js'), DIR + 'cast/kit-details.js', DIR + 'cast/kit-drop-drawn.js', DIR + 'cast/kit-drop-details.js', DIR + 'cast/milo-keys-drawn.js', DIR + 'cast/captain-keys-drawn.js', DIR + 'cast/kit-ride-drawn.js', DIR + 'cast/kit-act.js', DIR + 'cam.js', DIR + 'set.js', DIR + 'film.js'],
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
        shot(g, t, t - a, env);
        g.restore();
        if (sm) Film.streaks(g, t, sm);
    },
});
