// one-or-zero · the terminal itself: status bars, the pane where he reads, the records
// that stay with each passenger, the brackets the cursor leaves. All typed into the grid.
const UI = (() => {
    const meter = (v) => ' ▁▂▃▅▆▇█'[Math.max(0, Math.min(7, Math.round(v * 7)))];

    // Top bar: where we are, what the machine is doing, the time. Bottom bar: the session's
    // windows, one per command of the film; `now` is the one in use.
    function bars(T, t, tq, o) {
        const bar = { bg: 'ink', bgLevel: 0.09 };
        T.fill(0, 0, 192, 1, ' ', bar).fill(0, 53, 192, 1, ' ', bar);
        T.text(1, 0, '◆ tty1', { ...bar, level: 0.9, bold: true });
        T.text(9, 0, `│ anon@line-7:/car/3 │ ${o.cmd}`, { ...bar, level: 0.8 });
        // the load follows the work: it jumps when a record is read
        let cpu = '';
        for (let n = 0; n < 10; n++) cpu += meter(0.12 + 0.2 * (Motion.noise1('cpu' + n, tq * 3) + 1) / 2 + 0.7 * o.busy * (0.5 + 0.5 * Motion.noise1('b' + n, tq * 6)));
        let net = '';
        for (let n = 0; n < 6; n++) net += meter(0.3 + 0.35 * Motion.noise1('net' + n, tq * 2.2));
        const right = `cpu ${cpu} │ mem ▅▅▆▅ │ net ${net} │ ${o.clock} `;
        T.text(192 - right.length, 0, right, { ...bar, level: 0.8 });
        T.text(1, 53, '[1|0]', { ...bar, level: 0.9, bold: true });
        let c = 8;
        o.windows.forEach((w, n) => {
            const label = ` ${n}:${w}${n === o.now ? '*' : n === o.now + 1 ? '-' : ' '}`;
            T.text(c, 53, label, n === o.now ? { bg: 'ink', bgLevel: 0.75, ink: 'bg', bold: true } : { ...bar, level: 0.75 });
            c += label.length + 1;
        });
        const tail = `"line-7" ${o.clock.slice(0, 5)} 10-nov `;
        T.text(192 - tail.length, 53, tail, { ...bar, level: 0.75 });
    }

    // The brackets that hold a scanned passenger, with what the scan found on them.
    function brackets(T, c0, r0, w, h, id, pct) {
        const o = { ink: 'red', level: 0.9 }, r1 = r0 + h - 1, c1 = c0 + w - 1;
        T.text(c0, r0, '┌──', o).text(c1 - 2, r0, '──┐', o).text(c0, r1, '└──', o).text(c1 - 2, r1, '──┘', o);
        for (const r of [r0 + 1, r0 + 2, r1 - 1, r1 - 2]) T.put(c0, r, '│', o).put(c1, r, '│', o);
        // ticks down both sides, like a rule
        for (let r = r0 + 5; r < r1 - 3; r += 4) T.put(c0, r, '·', { ink: 'red', level: 0.5 }).put(c1, r, '·', { ink: 'red', level: 0.5 });
        T.text(c0 + 4, r0, ` id ${id} `, { ink: 'red', level: 0.7, opaque: true });
        T.text(c1 - 10, r1, ` ${pct}% ok `, { ink: 'red', level: 0.6, opaque: true });
    }

    return { bars, brackets, meter };
})();
