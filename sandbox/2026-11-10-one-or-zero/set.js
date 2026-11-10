// one-or-zero · the carriage: everything that is built, typed straight into the grid.
// 192 × 54 cells. From left to right on the far wall: the glazed end panel (his terminal
// is read against its dark glass), a pole, the bench under four windows, a pole, the door.
// Everything here is far: it stays between 0.12 and 0.45, except the lamps.
const Carriage = (() => {
    const L = {
        ceil: 1, lamp: 2,                 // rows: ceiling line, tubes
        card: 3, cardH: 4,                // the strip of cards over the windows
        rail: 7,                          // the grab rail; straps hang two rows under it
        win: 10, winH: 15,                // the windows
        back: 25, seat: 40,               // top of the bench's back, the seat's front edge
        floor: 50,                        // where the wall meets the floor
        pane: [3, 8, 53, 17],             // the end panel's window: col, row, w, h
        poles: [58, 178],
        bench: [60, 177],                 // first and last column of the bench
        door: 180,
    };
    const BEAT = 0.625;
    const dim = { level: 0.26 }, mid = { level: 0.36 };

    // a card: a frame and two lines of copy
    function card(T, c, w, l1, l2, o = {}) {
        T.fill(c, L.card, w, L.cardH, ' ');
        T.box(c, L.card, w, L.cardH, { level: 0.22 });
        T.text(c + 2, L.card + 1, l1, { level: o.l1 ?? 0.5, bold: true });
        T.text(c + 2, L.card + 2, l2, { level: o.l2 ?? 0.3 });
    }

    // Tunnel lamps streak past, right to left, in the cold ink; ribs and cables of the
    // tunnel wall go by with them. Each is a closed formula of time.
    function tunnel(T, tq, wins, pane) {
        // the end panel's glass shows the tunnel too, but only along its foot: the rest is
        // where the terminal is read
        const inWin = (c, r) => wins.some(([c0, w, r0, h]) => c > c0 && c < c0 + w - 1 && r > r0 && r < r0 + h - 1)
            || (c > pane[0] && c < pane[0] + pane[1] - 1 && r === pane[2] + pane[3] - 2);
        const put = (c, r, ch, o) => inWin(c, r) && T.put(c, r, ch, o);
        const SPEED = 150;                                     // columns a second
        // the cables: two runs of dashes that crawl, one with brackets
        for (let c = 0; c < 192; c++) {
            const k = c + Math.floor(tq * SPEED);
            if (k % 7 < 4) put(c, L.win + 5, '─', { ink: 'cold', level: 0.16 });
            if (k % 11 < 8) put(c, L.win + 11, k % 44 === 0 ? '┬' : '─', { ink: 'cold', level: 0.14 });
        }
        // the ribs of the tunnel lining, and a number painted on the wall now and then
        for (let n = 0; n < 9; n++) {
            const x = 230 - ((((tq * SPEED + n * 31) % 279) + 279) % 279);
            for (let r = L.win + 1; r < L.win + L.winH - 1; r++) put(Math.round(x), r, '│', { ink: 'cold', level: 0.1 });
            if (n === 4) [...'K 142'].forEach((ch, i) => put(Math.round(x) + 3 + i, L.win + 8, ch, { ink: 'cold', level: 0.22 }));
        }
        // the lamps: a hot head and a tail that cools
        for (const [row, phase, span] of [[1, 0, 230], [1, 121, 230], [9, 60, 290], [6, 200, 350], [13, 150, 410]]) {
            const head = span - ((((tq * SPEED + phase) % span) + span) % span) - 30;
            [...'█▓▒═══════──--··'].forEach((ch, n) => put(Math.round(head) + n, L.win + row, ch, { ink: 'cold', level: 1 - n / 22 }));
        }
        // the glass: two faint streaks low on each pane
        for (const [c0, w, r0, h] of wins) {
            for (let k = 0; k < 4; k++) put(c0 + w - 5 - k, r0 + h - 6 + k, '/', { level: 0.12 });
            for (let k = 0; k < 3; k++) put(c0 + w - 9 - k, r0 + h - 5 + k, '/', { level: 0.09 });
        }
    }

    // o: { wins: [[c0, w], …] the windows behind the passengers, led (the sign's text), clock }
    function draw(T, t, tq, o) {
        const wins = o.wins.map(([c0, w]) => [c0, w, L.win, L.winH]);
        const [pc, pr, pw, ph] = L.pane;
        // --- ceiling: a cove with panel joints, the tubes, the light they throw ---------
        T.fill(0, L.ceil, 192, 1, '─', { level: 0.3 });
        for (let c = 14; c < 192; c += 29) T.put(c, L.ceil, '┬', { level: 0.3 });
        for (let n = 0, c = 6; c < 190; c += 29, n++) {
            const dying = n === 3 && Motion.noise1('tube', tq * 9) > 0.45;
            const lv = dying ? 0.25 : 0.95;
            T.put(c - 1, L.lamp, '▐', { level: lv * 0.5 }).fill(c, L.lamp, 15, 1, '▀', { level: lv }).put(c + 15, L.lamp, '▌', { level: lv * 0.5 });
        }
        // --- the strip of cards -------------------------------------------------------
        card(T, 2, 27, 'SMILE.', 'you are on camera 14');
        card(T, 30, 27, 'IN CASE OF DOUBT', 'keep scrolling ►');
        card(T, 60, 28, 'FEEL BETTER™', 'ask for the blue one');
        // the line: a loop, and where we are on it
        {
            const c = 89, w = 47, stops = ['wake', 'work', 'want', 'buy', 'owe', 'sleep', 'wake'];
            T.fill(c, L.card, w, L.cardH, ' ');
            T.box(c, L.card, w, L.cardH, { level: 0.22, title: 'LINE 7' });
            stops.forEach((name, n) => {
                const x = c + 4 + n * 6, here = n === 2;
                if (n) T.text(x - 5, L.card + 1, '─────', { level: 0.3 });
                T.put(x, L.card + 1, here ? '●' : '○', { level: here ? (Math.floor(tq * 2) % 2 ? 1 : 0.45) : 0.45 });
                T.text(x - Math.floor(name.length / 2), L.card + 2, name, { level: here ? 0.6 : 0.3 });
            });
            T.put(c + w - 3, L.card + 1, '►', { level: 0.3 });
        }
        // the sign: it scrolls a column every drawing
        {
            const c = 137, w = 26, msg = o.led, off = Math.floor(tq * 12) % msg.length;
            T.fill(c, L.card, w, L.cardH, ' ');
            T.box(c, L.card, w, L.cardH, { level: 0.22, double: true });
            T.text(c + 2, L.card + 1, (msg + msg).slice(off, off + w - 4), { ink: 'cold', level: 0.75 });
            T.text(c + 2, L.card + 2, `car 3/8        ${o.clock}`, { ink: 'cold', level: 0.35 });
        }
        card(T, 164, 14, '-50% TODAY', 'you deserve');
        T.fill(179, L.card + 1, 13, 1, ' ').text(182, L.card + 1, 'EXIT ►', { level: 0.5, bold: true });
        // --- the rail and its straps: every rail joint sends a wave down them -------------
        T.fill(L.bench[0], L.rail, L.bench[1] - L.bench[0] + 1, 1, '─', { level: 0.45 });
        for (let c = 66, n = 0; c < 176; c += 8, n++) {
            const ph = ((tq - n * 0.04) / (2 * BEAT)) % 1;
            const sw = ph < 0.1 ? 1 : ph < 0.2 ? 0 : ph < 0.3 ? -1 : 0;
            T.put(c, L.rail, '┬', { level: 0.45 }).put(c, L.rail + 1, sw > 0 ? '\\' : sw < 0 ? '/' : '│', mid).put(c + sw, L.rail + 2, 'O', { level: 0.42 });
        }
        // --- windows ---------------------------------------------------------------------
        for (const [c0, w, r0, h] of wins) {
            T.box(c0, r0, w, h, { level: 0.32, round: true });
            // the tube overhead, mirrored high in the glass
            T.fill(c0 + 4, r0 + 1, w - 10, 1, '¯', { level: 0.16 });
        }
        // --- the end panel: a wide sheet of dark glass in a frame --------------------------
        T.fill(1, L.rail, 56, 1, '═', dim);
        for (let r = L.rail + 1; r < L.floor; r++) T.put(1, r, '│', dim).put(56, r, '│', dim);
        T.box(pc, pr, pw, ph, { level: 0.32, round: true });
        T.text(49, 27, 'DO NOT', { level: 0.3 }).text(50, 28, 'LEAN', { level: 0.3 });
        T.fill(2, 46, 54, 1, '─', { level: 0.18 });
        // --- the door, half out of frame ----------------------------------------------------
        for (let r = L.rail; r < L.floor; r++) T.put(L.door, r, '║', dim).put(186, r, '▒', { level: 0.12 });
        T.fill(L.door, L.rail, 12, 1, '═', dim);
        T.box(182, L.win, 4, L.winH, { level: 0.28, round: true }).box(187, L.win, 6, L.winH, { level: 0.28, round: true });
        T.put(183, 31, '●', { ink: 'cold', level: Math.floor(tq * 1.6) % 2 ? 0.7 : 0.25 });
        wins.push([182, 4, L.win, L.winH], [187, 6, L.win, L.winH]);
        tunnel(T, tq, wins, [pc, pw, pr, ph]);
        // --- the bench: a padded back in three cushions, the seat's edge, the heater ------
        T.fill(L.bench[0], L.back, L.bench[1] - L.bench[0] + 1, 1, '▁', { level: 0.2 });
        for (let r = L.back + 1; r < L.seat; r++) T.fill(L.bench[0], r, L.bench[1] - L.bench[0] + 1, 1, '░', { level: 0.1 });
        for (const c of [89, 118, 147]) for (let r = L.back + 1; r < L.seat; r++) T.text(c, r, '││', { level: 0.2 });
        T.fill(L.bench[0] - 1, L.seat, L.bench[1] - L.bench[0] + 3, 1, '▀', { level: 0.2 });
        for (let c = L.bench[0] + 2; c < L.bench[1]; c += 2) T.put(c, L.seat + 4, '¦', { level: 0.14 }).put(c, L.seat + 5, '¦', { level: 0.14 });
        T.fill(L.bench[0], L.seat + 3, L.bench[1] - L.bench[0] + 1, 1, '─', { level: 0.14 }).fill(L.bench[0], L.seat + 6, L.bench[1] - L.bench[0] + 1, 1, '─', { level: 0.14 });
        // --- the floor: the joint with the wall, worn speckle, what people leave behind ---
        T.fill(0, L.floor, 192, 1, '─', { level: 0.3 });
        const rnd = Motion.rng('floor');
        for (let r = L.floor + 1; r < 53; r++) for (let c = 0; c < 192; c++) {
            const v = rnd();
            if (v < 0.1) T.put(c, r, v < 0.03 ? ',' : v < 0.06 ? '·' : '.', { level: 0.16 + v });
        }
        T.text(117, 51, '(=)', { level: 0.34 }).text(145, 52, '<//>', { level: 0.26 }).text(176, 51, '[#]', { level: 0.24 });
        // --- the poles: bright, they are nearer than the wall ------------------------------
        for (const c of L.poles) {
            for (let r = L.ceil + 1; r < L.floor; r++) T.put(c, r, '║', { level: 0.55 });
            T.put(c, L.ceil, '╦', { level: 0.5 }).put(c, L.floor, '╩', { level: 0.5 }).put(c, 30, '╬', { level: 0.7 });
        }
    }

    return { L, draw };
})();
