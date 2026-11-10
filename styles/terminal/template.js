// Terminal style template: someone types a command, a moon made of characters rises
// behind a skyline typed straight into the grid, and a line resolves out of noise.
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/terminal/term.js'],
    fonts: [
        { family: 'TermMono', src: 'fonts/JetBrainsMono-Regular.ttf', descriptors: { weight: '400' } },
        { family: 'TermMono', src: 'fonts/JetBrainsMono-Bold.ttf', descriptors: { weight: '700' } },
    ],
    shots: [[0, 4, 'Template']],

    setup(env) {
        // the skyline: [first column, width, height in rows], decided once
        const rnd = Motion.rng('skyline'), towers = [];
        for (let c = 0; c < 160;) {
            const w = 7 + Math.floor(rnd() * 10), h = 7 + Math.floor(rnd() * 14);
            towers.push([c, w, h, rnd()]);
            c += w + 1;
        }
        return { T: Term.make(env, { cols: 160, rows: 45 }), towers };
    },

    draw(g, t, env) {
        const { T, towers } = env.state, E = Ease;
        T.begin(t);
        // pictures move on twos, like a screen that refreshes: snap their time to 1/12 s
        const tq = Math.floor(t * 12 + 1e-6) / 12;
        const rise = E.out(E.seg(tq, 0.9, 2.8));
        // 1 · a picture: ordinary canvas drawing, turned into characters by the kit.
        //     Flat light becomes a density ramp, strokes become | / \ _ - ( )
        T.picture((p) => {
            const cx = 1080, cy = 760 - rise * 420, r = 190;
            const gr = p.createRadialGradient(cx - 70, cy - 80, 10, cx, cy, r * 1.1);
            gr.addColorStop(0, '#fff');
            gr.addColorStop(1, '#3a3a3a');
            p.fillStyle = gr;
            p.beginPath();
            p.arc(cx, cy, r, 0, Math.PI * 2);
            p.fill();
            p.strokeStyle = '#fff';
            p.lineWidth = 3.6;
            p.stroke();
            p.fillStyle = '#000';
            for (const [dx, dy, rr] of [[-70, -30, 34], [56, 44, 48], [-10, 96, 24], [84, -78, 22]]) {
                p.beginPath();
                p.arc(cx + dx, cy + dy, rr, 0, Math.PI * 2);
                p.fill();
                p.stroke();
            }
        }, { dim: 0.3 + 0.7 * rise });
        // 2 · the skyline, typed straight into the cells: each tower clears what is behind
        //     it, then gets a frame and a few lit windows (one of them red)
        for (const [c, w, h, seed] of towers) {
            const r0 = 45 - h;
            T.fill(c, r0, w, h, ' ');
            T.box(c, r0, w, h + 1, { level: 0.4 });
            const rnd = Motion.rng('win' + c);
            for (let r = r0 + 2; r < 44; r += 2) for (let cc = c + 2; cc < c + w - 2; cc += 2) {
                const lit = rnd() < 0.34, flick = Motion.noise1('w' + c + r + cc, tq * 1.3) > -0.25;
                if (lit && flick) T.put(cc, r, '▄', seed > 0.8 && rnd() < 0.3 ? { ink: 'red' } : { level: 0.3 + rnd() * 0.4 });
            }
        }
        // 3 · text: a command typed by a person, a line that resolves, the cursor waiting
        const cmd = Term.typed('cat /dev/moon', t, 0.3, 13);
        T.text(4, 3, '$ ' + cmd.text, { scale: 2 });
        T.cursor(8 + cmd.n * 2, 3, { scale: 2, solid: !cmd.done, since: cmd.end });
        T.text(4, 7, Term.scramble('everything on this screen is a character.', E.seg(t, 1.7, 2.9), t), { level: 0.6 });
        // a glitch when the command lands
        const hit = E.bump(t, cmd.end + 0.15, 0.17);
        if (hit > 0.05) T.fx = { rgb: 5 * hit, tear: 0.4 * hit };
        T.present(g, env);
    },
});
