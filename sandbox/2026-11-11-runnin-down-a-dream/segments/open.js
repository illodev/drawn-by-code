// The opening, 0–6 s: the VCR's blue screen in the half second of silence, a title card that
// builds on the four notes of the guitar's pickup, and the title shot when the band comes in.
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, twos = S.twos, b = S.b;


    // --- the card: the album's bands (black, a pink-to-yellow field, black, teal) ----
    const CARD = { paper: '#f3eee0', black: '#15101d', pink: '#f0559a', teal: '#1fb7be' };
    // text spread from x0 to x1 with even gaps, like the cover's lettering
    const spread = (g, text, x0, x1, y, size, color) => {
        g.font = `${size}px "Anton"`;
        g.textBaseline = 'alphabetic';
        g.textAlign = 'left';
        g.fillStyle = color;
        const chars = [...text], adv = chars.map((c) => g.measureText(c).width);
        const gap = (x1 - x0 - adv.reduce((a, b) => a + b, 0)) / (chars.length - 1);
        let x = x0;
        chars.forEach((c, i) => {
            g.fillText(c, x, y);
            x += adv[i] + gap;
        });
    };
    // a band or the field arriving: 0 before `at`, overshoots, settles (on twos)
    const arrive = (t, at) => (t < at - 1e-6 ? null : S.pop(t, at, 3 / 12));

    function card(g, t, env) {
        g.fillStyle = CARD.paper;
        g.fillRect(0, 0, 1000, 1000);
        const [n1, n2, n3, n4] = S.LICK;
        // note 1 · TOM PETTY drops in and the field unrolls under it; the full moon rises
        // through the pickup; note 2 · Tom pops up in front of it, printed in black
        const a1 = arrive(t, n1);
        if (a1 != null) {
            const dy = (a1 - 1) * 260, h = 440 * E.out(E.seg(twos(t, n1), n1 + 1 / 12, n1 + 4 / 12));
            const gr = g.createLinearGradient(0, 250, 0, 690);
            gr.addColorStop(0, '#ee4b93');
            gr.addColorStop(0.3, '#f58a4f');
            gr.addColorStop(0.52, '#f8c22c');
            gr.addColorStop(0.84, '#f5cf3e');
            gr.addColorStop(1, '#58c2a8');
            g.save();
            g.beginPath();
            g.rect(50, 250, 900, h);
            g.clip();
            g.fillStyle = gr;
            g.fillRect(50, 250, 900, 440);
            const my = 900 - 425 * E.out(E.seg(t, n1, S.BAND_IN)); // the moonrise is smooth
            g.beginPath();
            g.arc(500, my, 200, 0, C.TAU);
            g.fillStyle = 'rgba(255,250,225,0.5)';
            g.fill();
            g.strokeStyle = CARD.black;
            g.lineWidth = 5;
            g.stroke();
            const rise = S.pop(t, n2, 3 / 12);
            if (rise > 0) {
                const lay = Motion.layer(env, 'print', (c) => Cast.tom(c, 500, 800 + (1 - rise) * 470, 262, { strum: 0.2 }, Cast.print(Cast.TOM)));
                g.globalCompositeOperation = 'multiply';
                Motion.drawLayer(g, env, lay);
            }
            g.restore();
            g.fillStyle = CARD.black;
            g.fillRect(50, 50 + dy, 900, 200);
            spread(g, 'TOM PETTY', 96, 904, 216 + dy, 182, CARD.pink);
        }
        // the two lower bands arrive with note 1 as well, empty; their words land on
        // notes 3 and 4
        const a3 = arrive(t, n1 + 1 / 12), a4 = arrive(t, n1 + 2 / 12);
        if (a3 != null) {
            const dx = (a3 - 1) * 1000;
            g.fillStyle = CARD.black;
            g.fillRect(50 + dx, 690, 900, 150);
        }
        if (a4 != null) {
            const dx = (1 - a4) * 1000;
            g.fillStyle = CARD.teal;
            g.fillRect(50 + dx, 840, 900, 110);
        }
        const slam = (at, y, fn) => {
            if (t < at - 1e-6) return;
            const s = 1 + 0.16 * (1 - E.out(E.seg(twos(t, at), at, at + 2 / 12)));
            g.save();
            g.translate(500, y);
            g.scale(s, s);
            g.translate(-500, -y);
            fn();
            g.restore();
        };
        slam(n3, 765, () => spread(g, "RUNNIN' DOWN", 100, 900, 818, 143, CARD.teal));
        slam(n4, 895, () => spread(g, 'A DREAM', 150, 850, 930, 98, CARD.black));
    }

    // --- the title shot ---------------------------------------------------------------
    const T0 = S.BAND_IN; // 1.75
    function title(g, t, env) {
        const tt = C.onTwos(t);
        // the beat we are in (beats sit on frames), and the time since it, on twos
        let kb = Math.floor((t - S.OFFSET) / S.BEAT + 0.5);
        if (b(kb) > t + 1e-6) kb--;
        const since = (twos(t, b(kb)) - b(kb)) / S.BEAT, ph2 = kb + since;
        const pulse = Math.exp(-since * 3.2); // 1 on the beat, falls within it
        const L = (at) => twos(t, at); // an event's own clock, on twos from its frame
        const hit8 = E.bump(L(b(8)), b(8), 0.3); // DREAM lands
        const chord = E.bump(L(b(15)), b(15), 0.3); // the windmill's chord
        // a small punch in on the title's last word
        g.save();
        const z = 1 + 0.035 * hit8 + 0.025 * chord;
        g.translate(500, 560);
        g.scale(z, z);
        g.translate(-500, -560);

        C.sunburst(g, 500, 620, { n: 12, rot: t * 0.3, a: '#ff4fa5', b: '#ff86c3' });

        C.memphis(g, t, [
            ['ring', 84, 318, 56, 0, K.aqua], ['zig', 96, 452, 62, -0.5, K.navy], ['tri', 66, 590, 50, 0.4, K.white], ['squiggle', 98, 722, 44, -0.5, K.yellow],
            ['bar', 922, 322, 50, -0.6, K.yellow], ['dots', 918, 462, 66, 0.3, K.navy], ['squiggle', 912, 606, 44, 0.6, K.white], ['ring', 934, 742, 50, 0, K.purple],
            ['cross', 122, 236, 40, 0.5, K.purple], ['tri', 930, 226, 40, -0.3, K.aqua],
        ]);

        // the burst and the moon pop on the band's first hit
        const pop = S.pop(t, T0, 0.3);
        if (pop > 0) {
            const s = pop * (1 + 0.03 * pulse + 0.07 * hit8 + 0.05 * chord);
            C.burst(g, 500, 670, { r0: 300 * s, r1: 425 * s, n: 15, seed: 'title', rot: C.drawing(t) % 4 < 2 ? 0 : 0.035, fill: K.teal, ink: K.ink, lw: 5, sy: 0.86 });
        }
        const mp = S.pop(t, T0, 0.3);
        if (mp > 0) {
            const r = 238 * mp;
            g.save();
            g.translate(500, 668);
            g.beginPath();
            g.arc(0, 0, r, 0, C.TAU);
            g.fillStyle = '#fffbe8';
            g.fill();
            g.save();
            g.clip();
            g.fillStyle = '#dcd6f7';
            for (const [cx, cy, cr] of [[-0.55, -0.35, 0.2], [0.5, -0.5, 0.13], [0.62, 0.15, 0.24], [-0.7, 0.3, 0.11], [-0.2, -0.75, 0.09], [0.1, 0.8, 0.16]]) {
                g.beginPath();
                g.ellipse(cx * r, cy * r, cr * r, cr * r * 0.82, -0.3, 0, C.TAU);
                g.fill();
            }
            g.restore();
            g.beginPath();
            g.arc(0, 0, r, 0, C.TAU);
            g.strokeStyle = K.ink;
            g.lineWidth = 5;
            g.stroke();
            g.restore();
        }

        // floor: navy, with a zigzag lip (in front of the burst: it is the stage)
        const lip = [[-40, 1040]];
        for (let i = 0; i <= 22; i++) lip.push([i * 50 - 50, 868 + (i % 2 ? 0 : 24)]);
        lip.push([1040, 1040]);
        C.poly(g, lip, { fill: K.navy, lw: 0 });
        C.poly(g, lip.slice(1, -1), { ink: K.ink, lw: 5, close: false });
        C.poly(g, lip.slice(1, -1).map(([x, y]) => [x, y + 34]), { ink: K.yellow, lw: 7, close: false });

        // Tom lands on the hit, then keeps the beat
        const landAt = T0 + 1 / 12;
        const fall = 1 - E.in(E.seg(tt, T0, landAt));
        const shadesOn = b(13), shadesAt = shadesOn - 4 / 12; // they land on the snare
        const k = E.seg(L(shadesOn), shadesAt, shadesOn);
        const wm1 = b(15), wm0 = wm1 - 4 / 12, wl = L(wm1); // the arm comes down on the chord
        const pose = {
            squash: 0.2 * E.bump(tt, landAt, 0.25) + (tt > landAt + 0.25 ? 0.055 * pulse : 0) + 0.1 * chord - 0.12 * fall,
            headDy: 0.02 * pulse + 0.05 * E.bump(L(shadesOn), shadesOn, 0.25),
            sway: -0.035 * Math.sin((ph2 - 0.3) * Math.PI),
            strum: Math.cos(ph2 * Math.PI * 2),
            fret: 0.3 + 0.5 * (Math.floor(ph2 / 2) % 2),
            shades: t >= shadesAt - 1e-6 ? E.in(k) : null,
            mouth: t >= shadesOn - 1e-6 ? 'grin' : 'smirk',
            windmill: wl >= wm0 - 1e-6 && wl < wm1 - 1e-6 ? -Math.PI / 2 - E.seg(wl, wm0, wm1) * C.TAU * 0.92 : null,
        };
        if (tt >= T0) Cast.tom(g, 500, 912 - fall * 420, 215, pose);

        // notes rise from the guitar, one on every beat after the title is up
        for (let n = 9; n <= 16; n++) {
            const at = b(n), u = E.seg(L(at), at, at + 0.9);
            if (u <= 0 || u >= 1) continue;
            const side = n % 2 ? 1 : -1, r = Motion.rng('note' + n);
            const x = 500 + side * (200 + u * 150 + r() * 30), y = 720 - u * 170 - r() * 30;
            const s = 31 * Math.min(1, u * 6) * (u > 0.8 ? (1 - u) * 5 : 1);
            C.note(g, x, y + Math.sin(u * 9) * 8, s, { kind: n % 3 ? 1 : 2, color: n % 2 ? K.white : K.yellow, lw: 3, rot: side * 0.15 });
        }

        // the title: each word on its beat, each letter its own solid
        const hop = (i) => -9 * pulse * ((i + Math.floor(ph2 + 1e-6)) % 2 ? 1 : 0.35) * (tt > b(8) + 0.3 ? 1 : 0);
        const word = (text, x, y, size, when, o) =>
            C.text3d(g, text, x, y, {
                size, dir: [0.72, 0.7], ...o,
                letter: (i) => {
                    const w = when(i), p = S.pop(t, w, 0.25);
                    return p <= 0 ? { hide: true } : { s: p, rot: (i % 2 ? 1 : -1) * 0.035, dy: hop(i) - 10 * chord * (i % 2 ? 1 : 0.4) };
                },
            });
        // RUNNIN' letter by letter through the first two beats, DOWN and A on the next two
        word("RUNNIN' DOWN A", 500, 182, 124, (i) => (i < 7 ? T0 + i / 12 : i < 12 ? b(6) : b(7)), { face: K.white, side: K.ink, side2: K.white, bands: 4, depth: 16, ow: 3.4, track: 1 });
        word('DREAM', 500, 444, 246, () => b(8), { face: K.yellow, side: K.red, side2: K.orange, bands: 3, depth: 32, ow: 5.2, track: 4 });

        // the glint when the shades land
        const gl = E.bump(L(shadesOn), shadesOn, 0.34);
        if (gl > 0) C.sparkle(g, 556, 912 - 215 * 1.36, 14 + 44 * gl, { color: K.white, ink: K.ink, lw: 3, rot: 0.2 });
        // twinkles round the title
        [[86, 150], [932, 148], [158, 566], [846, 552], [72, 524], [934, 548], [58, 392]].forEach(([x, y], i) => {
            const f = (C.drawing(t) + i * 3) % 9;
            if (t > b(8) && f < 3) C.sparkle(g, x, y, 10 + f * 8, { color: K.white, ink: K.ink, lw: 2.5 });
        });
        g.restore();
    }


    Seg.open = {
        shots: [[0, 0.5, 'Blue'], [0.5, 1.75, 'Card'], [1.75, 6, 'Title']],
        draw(g, t, env) {
            if (t < 0.5 - 1e-6) {
                g.fillStyle = K.vcrBlue;
                g.fillRect(0, 0, 1000, 1000);
                C.osd(g, env, 'PLAY', { play: true }); // the VCR's display, over the blue
            } else if (t < S.BAND_IN - 1e-6) card(g, t, env);
            else title(g, t, env);
        },
        // the tape finds its tracking as the picture replaces the blue, and jumps at the edit
        post(t) {
            const f = Math.round(t * 24);
            const lock = [1, 0.8, 0.5, 0.3, 0.16, 0.07][f - 12] ?? 0, edit = [0.32, 0.12][f - 42] ?? 0;
            return { track: Math.max(lock, edit), roll: [0.3, 0.11, 0.035][f - 12] ?? 0 };
        },
    };
})();
