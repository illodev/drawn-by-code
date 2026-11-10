// 2026-11-10-one-or-zero · style terminal
// Style test: «cat people/*». A carriage at night; the one in the hood watches from the
// corner; he types a command and the red cursor walks the bench, opening every passenger
// as the same three-line record.
(() => {
    const BPM = 96, B = 60 / BPM;                 // one beat = 0.625 s = 15 frames
    const beat = (n) => n * B;

    // The passengers: where they sit (centre column), who they are, what their record says.
    const PEOPLE = [
        { col: 61, kind: 'dog', hair: 'bun', cloth: 0.14, tilt: 0.1, rows: [['loves', 'her dog'], ['wants', 'company'], ['fears', 'the silence']] },
        { col: 87, kind: 'suit', hair: 'short', cloth: 0.22, tilt: -0.04, rows: [['loves', 'winning'], ['wants', 'a promotion'], ['fears', 'being seen']] },
        { col: 113, kind: 'teen', hair: 'cap', cloth: 0.14, tilt: 0.06, lean: -8, rows: [['loves', 'his music'], ['wants', 'out'], ['fears', 'being no one']] },
        { col: 139, kind: 'old', hair: 'hat', cloth: 0.18, tilt: -0.05, rows: [['loves', 'Marta'], ['wants', 'more time'], ['fears', 'forgetting']] },
    ];
    const SEAT_Y = 700, FIG = 1.4;                // the seat's front edge; the passengers' scale
    const WIN = PEOPLE.map((P) => [P.col - 11, 23]);   // a window behind each: [first col, width]
    const WIN_R = 5, WIN_H = 14;
    const HOOD = [200, 560, 1.3];                 // where he is: head centre and scale
    // when the cursor reaches each of them, and how fast their record is printed
    const SCAN = [beat(3), beat(7.5), beat(8.75), beat(9.75)];
    const CPS = [30, 60, 75, 90];
    const ALL = beat(11);                         // the fourth line, on all of them at once
    const LINE = beat(11.5);                      // the sentence
    const CMD = 'cat people/*';
    const SENTENCE = ['different details.', 'same vulnerability.'];
    const PANE = [4, 6];                          // his terminal, in the empty corner: col, row (2× text)

    Motion.scene({
        fps: 24,
        duration: 10,
        logical: [1600, 900],
        uses: ['styles/terminal/term.js', 'sandbox/2026-11-10-one-or-zero/cast.js'],
        fonts: [
            { family: 'TermMono', src: 'fonts/JetBrainsMono-Regular.ttf', descriptors: { weight: '400' } },
            { family: 'TermMono', src: 'fonts/JetBrainsMono-Bold.ttf', descriptors: { weight: '700' } },
        ],
        bpm: BPM,
        shots: [[0, 10, 'Carriage']],
        audio: { mix: 'mix.wav' },                 // sh sound.sh (needs the generated cue in private/)

        setup(env) {
            return { T: Term.make(env, { cols: 160, rows: 45 }) };
        },

        draw(g, t, env) {
            const T = env.state.T, E = Ease;
            T.begin(t);
            const tq = Math.floor(t * 12 + 1e-6) / 12;      // pictures move on twos
            carriage(T, t, tq);
            people(T, t, tq);
            watcher(T, t);
            output(T, t);
            // the hits: the command lands, the fourth line lands
            const hit = Math.max(E.bump(t, SCAN[0] - 0.03, 0.17), E.bump(t, ALL - 0.03, 0.21));
            if (hit > 0.05) T.fx = { rgb: 5 * hit, tear: 0.45 * hit, seed: 'hit' };
            T.present(g, env);
        },
    });

    // --- the carriage, drawn straight in characters ------------------------------------------
    function carriage(T, t, tq) {
        const dim = { level: 0.3 };
        // ceiling and its tubes; one of them is dying
        T.fill(0, 2, 160, 1, '═', { level: 0.3 });
        for (let c = 8; c < 160; c += 26) {
            const dying = c === 86 && Motion.noise1('tube', tq * 9) > 0.45;
            T.fill(c, 3, 14, 1, '▀', { level: dying ? 0.3 : 0.95 });
        }
        // windows: frames, and the tunnel going by behind them
        for (const [c0, w] of WIN) T.box(c0, WIN_R, w, WIN_H, dim);
        tunnel(T, tq);
        // the bench: the top of its back, the seat's edge, the heater under it
        T.fill(47, 21, 106, 1, '_', { level: 0.3 });
        T.fill(46, 35, 108, 1, '▀', { level: 0.16 });
        for (let c = 49; c < 152; c += 3) T.put(c, 39, '=', { level: 0.16 });
        // the pole at the end of the bench, the doors beyond
        for (let r = 4; r < 45; r++) T.put(155, r, '║', { level: 0.55 });
        T.box(157, 5, 6, 42, dim);
    }

    // Tunnel lamps streak past the windows, right to left, in the cold ink. Each lamp is a
    // closed formula of time: it leaves on one side and comes back on the other.
    function tunnel(T, tq) {
        const inWin = (c) => WIN.some(([c0, w]) => c > c0 && c < c0 + w - 1);
        const lamps = [[8, 0, 200, 150], [8, 96, 200, 150], [14, 50, 260, 150], [11, 170, 330, 150]];
        for (const [row, phase, span, speed] of lamps) {
            const head = span - (((tq * speed + phase) % span) + span) % span - 20;
            [...'█▓▒═══════──--··'].forEach((ch, n) => {
                const c = Math.round(head) + n;
                if (inWin(c)) T.put(c, row, ch, { ink: 'cold', level: 1 - n / 24 });
            });
        }
        // the cable along the tunnel wall: dashes that crawl
        for (let c = 0; c < 160; c++) {
            if (inWin(c) && (c + Math.floor(tq * 150)) % 6 < 3) T.put(c, 16, '-', { ink: 'cold', level: 0.2 });
        }
    }

    // --- the passengers ------------------------------------------------------------------------
    function person(p, i, tq) {
        const P = PEOPLE[i], o = { kind: P.kind, hair: P.hair, cloth: P.cloth, tilt: P.tilt, lean: P.lean };
        if (P.kind === 'dog') o.beat = tq * 2.4;
        if (P.kind === 'teen') o.nod = (tq / B) % 1 < 0.34 ? 6 : 0;                              // nods on the beat
        if (P.kind === 'old') o.nod = Math.round(Math.max(0, Math.sin(tq * 1.1 - 1)) * 2) * 6;   // dozes off
        Cast.seated(p, P.col * 10, SEAT_Y, FIG, o);
    }
    const BOX_R = 11, BOX_H = 28;                              // the brackets round a passenger

    function people(T, t, tq) {
        PEOPLE.forEach((P, i) => {
            const u = (t - SCAN[i]) / 0.42, c0 = P.col - 12, w = 25;
            const data = P.rows.map(([, v]) => v).join(' · ') + ' · ';
            const split = T.y(BOX_R + Math.min(1, Math.max(0, u)) * BOX_H);
            // above the scan line he is already data; below it he is still a drawing
            if (u > 0) T.picture((p) => {
                p.beginPath();
                p.rect(0, 0, 1600, split);
                p.clip();
                person(p, i, tq);
            }, { fill: data, fillLevel: 0.34, dim: 0.9 });
            if (u < 1) T.picture((p) => {
                p.beginPath();
                p.rect(0, split, 1600, 900);
                p.clip();
                person(p, i, tq);
            });
            if (u > 0 && u < 1) T.tint(c0, T.row(split), w, 1, 'red', 1);
            // the brackets that hold him
            if (u > 0) {
                const o = { ink: 'red', level: 0.9 }, r1 = BOX_R + BOX_H - 1;
                T.text(c0, BOX_R, '┌─', o).text(c0 + w - 2, BOX_R, '─┐', o).text(c0, r1, '└─', o).text(c0 + w - 2, r1, '─┘', o);
                T.put(c0, BOX_R + 1, '│', o).put(c0 + w - 1, BOX_R + 1, '│', o).put(c0, r1 - 1, '│', o).put(c0 + w - 1, r1 - 1, '│', o);
            }
        });
    }

    // --- the one who watches -------------------------------------------------------------------
    // He blinks now and then (closed for two drawings). His eye is the only red he has: the
    // cursor's reflection.
    const blink = (t) => [1.2, 4.4, 4.7, 8.4].some((b) => t >= b && t < b + 2 / 12);
    function watcher(T, t) {
        const [x, y, s] = HOOD;
        T.picture((p) => Cast.hood(p, x, y, s, {}));
        T.put(T.col(x + 95 * s), T.row(y - 30 * s), blink(t) ? '-' : '●', { ink: 'red', level: 1 });
    }

    // --- what the terminal says ----------------------------------------------------------
    // In the empty corner above him, large: the command he types, the record being printed,
    // then the sentence. In each window, small: the record that stays with its passenger.
    function output(T, t) {
        const [pc, pr] = PANE;
        const cmd = Term.typed(CMD, t, 0.45, 13);
        T.text(pc, pr, '$ ' + cmd.text, { scale: 2 });
        let cur = t < SCAN[0] ? [pc + 4 + cmd.n * 2, pr, 2, cmd.done ? cmd.end : null] : null;
        PEOPLE.forEach((P, i) => {
            const t0 = SCAN[i] + (i ? 0.12 : 0.3);                          // after the scan line has started down
            if (t < t0) return;
            const id = String(i + 1).padStart(2, '0'), [wc] = WIN[i];
            const shown = t < (i < 3 ? SCAN[i + 1] + 0.12 : ALL);           // this record is the one in the pane
            T.fill(wc + 1, WIN_R + 1, 21, 4 + (t >= ALL ? 1 : 0), ' ');
            T.text(wc + 2, WIN_R, ` ${id} `, { opaque: true, level: 0.8 });
            if (shown) T.text(pc, pr + 3, `── ${id} ${'─'.repeat(14)}`, { scale: 2, level: 0.55 });
            let at = t0 + (i ? 0.06 : 0.15);
            P.rows.forEach(([k, v], n) => {
                const label = (k + ':').padEnd(7), ty = Term.printed(label + v, t, at, CPS[i]);
                at = ty.end + (i === 0 ? 0.25 : 0.04);
                if (!ty.n) return;
                const key = ty.text.slice(0, 7).trimEnd(), val = ty.text.slice(7);
                T.text(wc + 2, WIN_R + 1 + n, key, { ink: 'red' }).text(wc + 9, WIN_R + 1 + n, val);
                if (!shown) return;
                const r = pr + 5 + n * 2;
                T.text(pc, r, key, { scale: 2, ink: 'red' }).text(pc + 14, r, val, { scale: 2 });
                if (!ty.done || n === 2) cur = [pc + ty.n * 2, r, 2, ty.done ? ty.end : null];
            });
            if (t >= ALL) T.text(wc + 2, WIN_R + 4, 'vulnerable: yes', { ink: 'red', bold: true });
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
