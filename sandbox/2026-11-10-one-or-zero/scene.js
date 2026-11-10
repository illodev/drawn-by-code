// 2026-11-10-one-or-zero · style terminal
// Style test: «cat people/*». A carriage at night; the one in the hood watches from the
// corner; he types a command and the red cursor walks the bench, opening every passenger
// as the same three-line record.
(() => {
    const BPM = 96, B = 60 / BPM;                 // one beat = 0.625 s = 15 frames
    const beat = (n) => n * B;
    const DIR = 'sandbox/2026-11-10-one-or-zero/';

    // The passengers: where they sit (centre column), who they are, what their record says.
    const PEOPLE = [
        { col: 75, kind: 'dog', tilt: 0.09, pct: 98, rows: [['loves', 'her dog'], ['wants', 'company'], ['fears', 'the silence']] },
        { col: 104, kind: 'suit', tilt: -0.04, pct: 97, rows: [['loves', 'winning'], ['wants', 'a promotion'], ['fears', 'being seen']] },
        { col: 133, kind: 'teen', tilt: 0.06, lean: -6, pct: 99, rows: [['loves', 'his music'], ['wants', 'out'], ['fears', 'being no one']] },
        { col: 162, kind: 'old', tilt: -0.05, pct: 96, rows: [['loves', 'Marta'], ['wants', 'more time'], ['fears', 'forgetting']] },
    ];
    const SEAT_Y = 800, FIG = 1.5;                // the seat's front edge; the passengers' scale
    const WIN = PEOPLE.map((P) => [P.col - 12, 25]);   // a window behind each: [first col, width]
    const WIN_R = 10;
    const HOOD = [250, 720, 1.55];                // where he is: head centre and scale
    const BOX = [16, 37];                         // the brackets round a passenger: first row, height
    // when the cursor reaches each of them, and how fast their record is printed
    const SCAN = [beat(3), beat(7.5), beat(8.75), beat(9.75)];
    const CPS = [30, 60, 75, 90];
    const ALL = beat(11);                         // the fourth line, on all of them at once
    const LINE = beat(11.5);                      // the sentence
    const CMD = 'cat people/*';
    const SENTENCE = ['different details.', 'same vulnerability.'];
    const PANE = [6, 11];                         // his terminal, on the end panel's glass: col, row (2× text)
    const LED = 'NEXT STOP: WANT · MIND THE GAP · THIS IS A LINE 7 LOOP SERVICE · ';

    Motion.scene({
        fps: 24,
        duration: 10,
        logical: [1920, 1080],
        uses: ['styles/terminal/term.js', DIR + 'set.js', DIR + 'ui.js', DIR + 'cast.js'],
        fonts: [
            { family: 'TermMono', src: 'fonts/JetBrainsMono-Regular.ttf', descriptors: { weight: '400' } },
            { family: 'TermMono', src: 'fonts/JetBrainsMono-Bold.ttf', descriptors: { weight: '700' } },
        ],
        bpm: BPM,
        shots: [[0, 10, 'Carriage']],
        audio: { mix: 'mix.wav' },                 // sh sound.sh (needs the generated cue in private/)

        setup(env) {
            return { T: Term.make(env, { cols: 192, rows: 54 }) };
        },

        draw(g, t, env) {
            const T = env.state.T, E = Ease;
            T.begin(t);
            const tq = Math.floor(t * 12 + 1e-6) / 12;      // pictures move on twos
            const sec = 4 + Math.floor(t), clock = `23:57:${String(sec).padStart(2, '0')}`;
            Carriage.draw(T, t, tq, { wins: WIN, led: LED, clock });
            people(T, t, tq);
            watcher(T, t);
            output(T, t);
            const busy = Math.max(...SCAN.map((s) => E.bump(t, s, 0.9)), E.bump(t, ALL, 0.7));
            UI.bars(T, t, tq, { cmd: t > 0.45 + 1.2 ? CMD : 'bash', busy, clock, windows: ['people', 'real', 'find', 'ps', 'kill'], now: 0 });
            // the hits: the command lands, the fourth line lands
            const hit = Math.max(E.bump(t, SCAN[0] - 0.03, 0.17), E.bump(t, ALL - 0.03, 0.21));
            if (hit > 0.05) T.fx = { rgb: 5 * hit, tear: 0.45 * hit, seed: 'hit' };
            T.present(g, env);
        },
    });

    // --- the passengers ------------------------------------------------------------------------
    const pose = (i, tq) => {
        const P = PEOPLE[i], o = { kind: P.kind, tilt: P.tilt, lean: P.lean };
        if (P.kind === 'dog') o.beat = tq * 2.4;
        if (P.kind === 'teen') o.nod = (tq / B) % 1 < 0.34 ? 5 : 0;                              // nods on the beat
        if (P.kind === 'old') o.nod = Math.round(Math.max(0, Math.sin(tq * 1.1 - 1)) * 2) * 5;   // dozes off
        return o;
    };
    const person = (p, i, tq) => Cast.seated(p, PEOPLE[i].col * 10, SEAT_Y, FIG, pose(i, tq));

    function people(T, t, tq) {
        PEOPLE.forEach((P, i) => {
            const u = (t - SCAN[i]) / 0.5, c0 = P.col - 13, w = 27, [r0, h] = BOX;
            const data = P.rows.map(([, v]) => v).join(' · ') + ' · ';
            const split = T.y(r0 + Math.min(1, Math.max(0, u)) * h);
            // above the scan line he is already data; below it he is still a drawing
            if (u > 0) T.picture((p) => {
                p.beginPath();
                p.rect(0, 0, 1920, split);
                p.clip();
                person(p, i, tq);
            }, { fill: data, fillLevel: 0.36, dim: 0.9, mats: Cast.MATS[P.kind] });
            if (u < 1) T.picture((p) => {
                p.beginPath();
                p.rect(0, split, 1920, 1080);
                p.clip();
                person(p, i, tq);
            }, { mats: Cast.MATS[P.kind] });
            Cast.stamps(P.kind, P.col * 10, SEAT_Y, FIG, pose(i, tq)).forEach(([x, y, str, o]) => T.text(T.col(x), T.row(y), str, o));
            if (u > 0 && u < 1) T.tint(c0, T.row(split), w, 1, 'red', 1);
            if (u > 0) UI.brackets(T, c0, r0, w, h, String(i + 1).padStart(2, '0'), P.pct);
        });
    }

    // --- the one who watches -------------------------------------------------------------------
    // He blinks now and then (closed for two drawings). His eye is the only red he has: the
    // cursor's reflection.
    const blink = (t) => [1.2, 4.4, 4.7, 8.4].some((b) => t >= b && t < b + 2 / 12);
    function watcher(T, t) {
        const [x, y, s] = HOOD;
        T.picture((p) => Cast.hoodTone(p, x, y, s), { mats: Cast.MATS.hood, edge: Infinity, ramp: ' .·:-=+*', gamma: 0.9 });
        T.picture((p) => Cast.hoodLines(p, x, y, s));
        T.put(T.col(x + 95 * s), T.row(y - 30 * s), blink(t) ? '-' : '●', { ink: 'red', level: 1 });
    }

    // --- what the terminal says ----------------------------------------------------------
    // On the end panel's glass, large: the command he types, the record being printed, then
    // the sentence. In each window, small: the record that stays with its passenger.
    function output(T, t) {
        const [pc, pr] = PANE, [fc, fr, fw] = Carriage.L.pane;
        T.text(fc + 2, fr, ' tty1 ', { level: 0.6, opaque: true });
        T.text(pc, pr - 2, 'last login: tonight 23:41 from /car/3', { level: 0.3 });
        // the pane's scroll bar: its thumb drops as the output grows
        const done = Math.min(1, Math.max(0, (t - SCAN[0]) / (LINE + 1.6 - SCAN[0])));
        for (let r = fr + 1; r < fr + 16; r++) T.put(fc + fw - 3, r, '│', { level: 0.16 });
        for (let k = 0; k < 4; k++) T.put(fc + fw - 3, fr + 1 + Math.round(done * 11) + k, '█', { level: 0.3 });
        const cmd = Term.typed(CMD, t, 0.45, 13);
        T.text(pc, pr, '$ ' + cmd.text, { scale: 2 });
        let cur = t < SCAN[0] ? [pc + 4 + cmd.n * 2, pr, 2, cmd.done ? cmd.end : null] : null;
        PEOPLE.forEach((P, i) => {
            const t0 = SCAN[i] + (i ? 0.12 : 0.3);                          // after the scan line has started down
            if (t < t0) return;
            const id = String(i + 1).padStart(2, '0'), [wc, ww] = WIN[i];
            const shown = t < (i < 3 ? SCAN[i + 1] + 0.12 : ALL);           // this record is the one in the pane
            // in the passenger's window: the file, world-readable, and its three lines
            T.fill(wc + 1, WIN_R + 1, ww - 2, 4 + (t >= ALL ? 1 : 0), ' ');
            T.text(wc + 2, WIN_R, ` people/${id} `, { opaque: true, level: 0.8 });
            T.text(wc + ww - 13, WIN_R, ' r--r--r-- ', { opaque: true, level: 0.4 });
            if (shown) {
                T.text(pc, pr + 3, `── ${id} ${'─'.repeat(11)}`, { scale: 2, level: 0.55 });
                T.text(pc + 36, pr + 4, 'r--r--r--', { level: 0.4 });
            }
            let at = t0 + (i ? 0.06 : 0.15);
            P.rows.forEach(([k, v], n) => {
                const label = (k + ':').padEnd(7), ty = Term.printed(label + v, t, at, CPS[i]);
                at = ty.end + (i === 0 ? 0.25 : 0.04);
                if (!ty.n) return;
                const key = ty.text.slice(0, 7).trimEnd(), val = ty.text.slice(7);
                T.text(wc + 3, WIN_R + 1 + n, key, { ink: 'red' }).text(wc + 10, WIN_R + 1 + n, val);
                if (!shown) return;
                const r = pr + 5 + n * 2;
                T.text(pc, r, key, { scale: 2, ink: 'red' }).text(pc + 14, r, val, { scale: 2 });
                if (!ty.done || n === 2) cur = [pc + ty.n * 2, r, 2, ty.done ? ty.end : null];
            });
            if (t >= ALL) T.text(wc + 3, WIN_R + 4, 'vulnerable: yes', { ink: 'red', bold: true });
        });
        // the sentence: his, so typed by hand
        if (t >= LINE) {
            let at = LINE;
            SENTENCE.forEach((line, n) => {
                const ty = Term.typed(line, t, at, 26);
                at = ty.end + 0.2;
                if (!ty.n && n) return;
                const r = pr + 4 + n * 3;
                T.text(pc, r, ty.text, { scale: 2, bold: true });
                if (!ty.done || n === SENTENCE.length - 1) cur = [pc + ty.n * 2, r, 2, ty.done ? ty.end : null];
            });
        } else if (t >= ALL) cur = null;
        if (cur) T.cursor(cur[0], cur[1], { scale: cur[2], solid: cur[3] === null, since: cur[3] ?? 0 });
    }
})();
