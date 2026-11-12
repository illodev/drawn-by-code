// «REW», bars 73–77 (103.42–110.5 s): somebody rewinds the tape of the Devil's TV spot, the
// way records were played backwards in the years of the satanic panic, and the message
// hidden in it is wholesome. The spot (segments/breakad.js) runs backwards in rewind search,
// slower on the beats, a frame that was never in it shows between the noise bars, and the
// tape stops dead on that frame: EAT YOUR VEGETABLES, the Devil caught at the table. Then
// PLAY, the picture rolls away and the VCR's blue is left for the next block to cut from.
// The hidden frame is drawn in segments/breakrew-props.js.
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, S = Song, b = S.b, B = S.B, R = BreakrewProps;
    const T0 = B(73), T1 = B(78), n0 = 292; // the first beat of bar 73
    const at = (k) => b(n0 + k); // beat k of this block
    const F = (t) => Math.round(t * S.FPS), EPS = 1e-6;
    const STOP = at(12), CLEAR = at(14), PLAY = at(16), ROLL = at(18);
    // the spot on the tape: its last frame, and where it begins after the bumper (bar 65)
    const TR0 = T0 - 1 / S.FPS, SPOT0 = B(65) + 1 / S.FPS;

    // --- the transport ---------------------------------------------------------------------
    // The rewind in stages: from, tape speed (× backwards), noise bars, their thickness, how
    // far the picture tears along them, how far the bands between them slip, how washed the
    // colour is, and the tape options for Cereal.post (kept low: its line jitter would shred
    // the display, which the VCR draws clean over the picture). The spot is 11.3 s long, so
    // the search runs at 5× (8× would be through it within the first bar), then 3×, 2×, 1×, ½×.
    const STAGES = [
        { from: T0, v: 0, bars: 2, thick: 22, tear: 44, slip: 6, wash: 0.2, track: 0.3, snow: 0.004 }, // the jolt: a frozen frame
        { from: T0 + 4 / S.FPS, v: 5, bars: 4, thick: 58, tear: 66, slip: 14, wash: 0.42, track: 0.2, snow: 0.005 },
        { from: at(4), v: 3, bars: 3, thick: 46, tear: 48, slip: 10, wash: 0.36, track: 0.17, snow: 0.004 },
        { from: at(6), v: 2, bars: 3, thick: 34, tear: 34, slip: 7, wash: 0.3, track: 0.14, snow: 0.003 },
        { from: at(8), v: 1, bars: 2, thick: 24, tear: 22, slip: 4, wash: 0.22, track: 0.11, snow: 0.0015 },
        { from: at(10), v: 0.5, bars: 2, thick: 14, tear: 12, slip: 2, wash: 0.14, track: 0.08, snow: 0 },
    ];
    const stageAt = (t) => STAGES.filter((s) => t >= s.from - EPS).pop() ?? STAGES[0];
    // seconds of tape rewound by t
    const wound = (t) => STAGES.reduce((sum, s, i) => sum + s.v * Math.max(0, Math.min(t, STAGES[i + 1]?.from ?? STOP) - s.from), 0);
    const tapeAt = (t) => Math.max(SPOT0, TR0 - wound(t));
    // The frame that was never in the spot, between two bars of its own: [beat, frames, from
    // y, to y of that frame]. A drawing long, then two; first its word, then his face, once
    // all of it (kept few and mostly narrow: each wide one is a change of brightness).
    const GLIMPSES = [
        [6, 2, 236, 432], [7, 2, 540, 770], [8, 4, 262, 790], [9, 2, 250, 420], [10, 4, -300, 1080], [11, 2, 570, 720],
    ].map(([k, n, y0, y1]) => ({ f: F(at(k)), n, y0, y1 }));
    // a hash of two integers, 0..1 (the tape's noise is seeded by the frame number)
    const h01 = (p, q) => {
        let x = Math.imul(p + 0x9e3779b9, 0x85ebca6b) ^ Math.imul(q + 0x7f4a7c15, 0xc2b2ae35);
        x ^= x >>> 15;
        x = Math.imul(x, 0x2c1b3c6d);
        x ^= x >>> 12;
        return (x >>> 0) / 4294967296;
    };
    // the noise bars of a frame, sorted down the picture; they roll with the tape
    const barsAt = (t, st) => {
        const f = F(t), span = 1100;
        return Array.from({ length: st.bars }, (_, j) => {
            const y = st.v > 0 ? (j / st.bars) * span + wound(t) * 62 + 240 : 260 + j * 420 + (h01(f, j) - 0.5) * 90;
            return { y: (((y % span) + span) % span) - 50, dir: j % 2 ? 1 : -1, m: 0.55 + 0.9 * h01(f, j + 17) };
        }).sort((p, q) => p.y - q.y);
    };

    // --- the picture on the tape -----------------------------------------------------------
    // The spot at tape time tr: the other block's draw. Without it (a dev scene that leaves
    // segments/breakad.js out) a labelled stand-in card that changes with tr.
    function spot(g, tr, env) {
        const ad = window.Seg && window.Seg.breakad;
        if (ad && ad.draw) return ad.draw(g, tr, env);
        const bar = Math.floor((tr - S.OFFSET) / S.BAR), u = (tr - S.OFFSET) / S.BAR - bar;
        const cols = [[K.pink, K.rose, K.yellow], [K.purple, K.violet, K.aqua], [K.orange, K.gold, K.navy], [K.teal, K.aqua, K.red]][bar % 4];
        C.sunburst(g, 500, 560, { n: 12, rot: tr * 0.4, a: cols[0], b: cols[1] });
        C.burst(g, 500, 560, { r0: 250, r1: 370, n: 14, seed: 'standin', fill: cols[2], ink: K.ink, lw: 5, sy: 0.9 });
        C.box(g, 180 + u * 520, 520 - 160 * Math.abs(Math.sin(u * Math.PI * 4)), 120, 120, [30, -20], { front: K.red, top: '#ff6f59', side: '#b0211f' }, { lw: 4 });
        C.text3d(g, `AD ${tr.toFixed(1)}`, 500, 330, { size: 150, face: K.white, side: K.ink, depth: 14, ow: 4 });
        g.font = '44px "Anton"';
        g.textAlign = 'center';
        g.fillStyle = K.ink;
        g.fillText('STAND-IN FOR SEG.BREAKAD', 500, 850);
    }

    // In search the picture loses its vertical lock by a notch: it drops, and the blank bar
    // between two fields shows along the top (the display is read on it). It drops with a
    // bounce when the rewind starts and hops again on every change of speed.
    const DROP = 172;
    const dropAt = (t) => {
        const st = stageAt(t), j = F(t) - F(st.from);
        return DROP + ((st.v === 0 ? [26, -10, 6] : st.v === 5 ? [] : [30, 10])[j] ?? 0) + Math.round((h01(F(t), 61) - 0.5) * 6);
    };
    // The frame in rewind search: the picture cut into bands by the noise bars, each band
    // slipped sideways and torn towards its bars, snow on the bars themselves.
    function search(g, t, env) {
        const f = F(t), st = stageAt(t), k = env.k, [W, H] = env.px, drop = dropAt(t), dpx = Math.round(drop * k);
        const pic = Motion.layer(env, 'breakrew-spot', (c) => spot(c, tapeAt(t), env));
        const gl = GLIMPSES.find((q) => f >= q.f && f < q.f + q.n);
        const frame = gl ? Motion.layer(env, 'breakrew-card', (c) => R.card(c, STOP, n0 + 12)) : null;
        // a glimpse brings its own two bars, which shiver
        const edges = gl ? [gl.y0 + drop + (h01(f, 41) - 0.5) * 14, gl.y1 + drop + (h01(f, 43) - 0.5) * 14] : null;
        const inside = (q) => q.y < drop + st.thick / 2 + 8 || (edges && edges[1] - edges[0] < 320 && q.y > edges[0] - 30 && q.y < edges[1] + 30); // none on the blank bar, none through a narrow glimpse
        const bars = barsAt(t, st).filter((q) => !inside(q))
            .concat(edges ? edges.map((y, i) => ({ y, dir: i ? 1 : -1, m: 0.7 + 0.5 * h01(f, 47 + i) })) : [], [{ y: drop, dir: 1, m: 0.3, thick: 13 }])
            .sort((p, q) => p.y - q.y);
        const bandOf = (y) => bars.filter((q) => q.y < y).length;
        g.fillStyle = '#0b0910';
        g.fillRect(0, 0, 1000, 1000);
        const rows = Math.max(2, Math.round(4 * k)); // strips of whole pixels
        for (let py = dpx; py < H; py += rows) {
            const y = (py + rows / 2) / k, band = bandOf(y);
            let dx = (h01(f, band + 31) - 0.5) * 2 * st.slip;
            for (const q of bars) dx += q.dir * q.m * st.tear * Math.exp(-Math.abs(y - q.y) / 24);
            const h = Math.min(rows, H - py);
            g.drawImage(edges && y > edges[0] && y < edges[1] ? frame : pic, 0, py - dpx, W, h, Math.round(dx * k) / k, py / k, W / k, h / k);
        }
        // the bars, on the tube's lines: inside one the picture is shredded line by line and
        // greyed, then dashes of snow, densest along its middle
        const LH = 1000 / 262, lh = Math.max(1, Math.round(LH * k)), TONES = ['#f4f1ea', '#f4f1ea', '#f4f1ea', '#c9c5d3', '#c9c5d3', '#807b90', K.black];
        for (const q of bars) {
            const half = (q.thick ?? st.thick) / 2;
            for (let row = Math.floor((q.y - half) / LH); row <= Math.ceil((q.y + half) / LH); row++) {
                const d = 1 - Math.abs((row + 0.5) * LH - q.y) / half;
                if (d <= 0 || row < 0 || row > 262) continue;
                const py = Math.round(row * LH * k), amp = 26 + 150 * d;
                if (py >= dpx) g.drawImage(pic, 0, py - dpx, W, lh, Math.round((h01(f * 31 + row, 5) - 0.5) * 2 * amp * k) / k, py / k, W / k, lh / k);
                g.fillStyle = `rgba(150,146,164,${0.2 + 0.4 * d})`;
                g.fillRect(0, py / k, 1000, lh / k);
                const n = Math.round(d * 30 + 2);
                for (let i = 0; i < n; i++) {
                    const u = h01(f * 131 + row, i), v = h01(f * 57 + row * 3, i + 99);
                    g.fillStyle = TONES[Math.floor(h01(row + f * 7, i + 7) * TONES.length)];
                    g.fillRect(u * 1090 - 45, py / k, 6 + v * v * 110, lh / k);
                }
            }
        }
        // search washes the colour out and lifts the blacks (of the picture, not of the bar)
        g.save();
        g.globalCompositeOperation = 'saturation';
        g.fillStyle = `rgba(128,128,128,${st.wash})`;
        g.fillRect(0, drop + 8, 1000, 1000);
        g.globalCompositeOperation = 'screen';
        const lift = Math.round(70 * st.wash);
        g.fillStyle = `rgb(${lift},${lift},${lift + 8})`;
        g.fillRect(0, drop + 8, 1000, 1000);
        g.restore();
    }

    // --- the VCR's display -----------------------------------------------------------------
    // Cereal.osd draws the words; the rewind's triangles and the tape counter are drawn here
    // in the same hand (its place, slant, weight and glow), digits as strokes on a 1 × 2 box.
    const DIGITS = {
        0: [[[0.26, 0], [0.74, 0], [1, 0.3], [1, 1.7], [0.74, 2], [0.26, 2], [0, 1.7], [0, 0.3], [0.26, 0]]],
        1: [[[0.14, 0.46], [0.56, 0], [0.56, 2]], [[0.12, 2], [1, 2]]],
        2: [[[0, 0.3], [0.26, 0], [0.74, 0], [1, 0.3], [1, 0.82], [0, 2], [1, 2]]],
        3: [[[0, 0], [1, 0], [0.42, 0.86], [0.76, 0.86], [1, 1.14], [1, 1.7], [0.74, 2], [0.26, 2], [0, 1.7]]],
        4: [[[0.76, 2], [0.76, 0], [0, 1.42], [1, 1.42]]],
        5: [[[1, 0], [0.06, 0], [0, 0.9], [0.74, 0.9], [1, 1.18], [1, 1.7], [0.74, 2], [0.26, 2], [0, 1.7]]],
        6: [[[0.92, 0], [0.42, 0], [0, 0.5], [0, 1.7], [0.26, 2], [0.74, 2], [1, 1.7], [1, 1.2], [0.74, 0.94], [0, 0.94]]],
        7: [[[0, 0], [1, 0], [0.38, 2]]],
        8: [[[0.26, 0], [0.74, 0], [1, 0.24], [1, 0.7], [0.74, 0.94], [0.26, 0.94], [0, 0.7], [0, 0.24], [0.26, 0]], [[0.26, 0.94], [0, 1.2], [0, 1.7], [0.26, 2], [0.74, 2], [1, 1.7], [1, 1.2], [0.74, 0.94]]],
        9: [[[0.08, 2], [0.58, 2], [1, 1.5], [1, 0.3], [0.74, 0], [0.26, 0], [0, 0.3], [0, 0.8], [0.26, 1.06], [1, 1.06]]],
        ':': [[[0.5, 0.6], [0.5, 0.66]], [[0.5, 1.4], [0.5, 1.46]]],
    };
    const OSD = { h: 65, w: 36, adv: 50.5, x: 103, y: 149, slant: 0.13, lw: 5.4, right: 897 }; // Cereal.osd's numbers, mirrored for the right edge
    function display(g, env, fn) {
        g.save();
        g.translate(OSD.x, OSD.y);
        g.transform(1, 0, -OSD.slant, 1, 0, 0);
        g.strokeStyle = g.fillStyle = '#ffffff';
        g.lineWidth = OSD.lw;
        g.lineCap = g.lineJoin = 'round';
        g.shadowColor = 'rgba(255,255,255,0.8)';
        g.shadowBlur = 14 * C.pxScale(g);
        fn();
        g.restore();
    }
    // REW's two triangles, pointing left: the play triangle mirrored and doubled
    function rewMarks(g, env) {
        display(g, env, () => {
            const tx = 3 * OSD.adv + 31, w = 47;
            for (const x of [tx, tx + w]) {
                g.beginPath();
                g.moveTo(x + w, -OSD.h * 0.98);
                g.lineTo(x, -OSD.h * 0.5);
                g.lineTo(x + w, -OSD.h * 0.02);
                g.closePath();
                g.fill();
            }
        });
    }
    // the tape counter, h:mm:ss, set from the right at the top of the safe area
    function counter(g, env, secs) {
        const s = Math.max(0, Math.floor(secs + EPS)), two = (v) => String(v).padStart(2, '0');
        const text = `${Math.floor(s / 3600)}:${two(Math.floor(s / 60) % 60)}:${two(s % 60)}`;
        const advOf = (ch) => (ch === ':' ? 30 : OSD.adv);
        const width = [...text].reduce((a, ch) => a + advOf(ch), 0) - (OSD.adv - OSD.w);
        display(g, env, () => {
            let cx = OSD.right - OSD.x - width;
            for (const ch of text) {
                const off = ch === ':' ? (30 - (OSD.adv - OSD.w)) / 2 - OSD.w / 2 : 0; // midway between its neighbours
                for (const stroke of DIGITS[ch]) {
                    g.beginPath();
                    stroke.forEach(([px, py], i) => (i ? g.lineTo(cx + off + px * OSD.w, (py / 2 - 1) * OSD.h) : g.moveTo(cx + off + px * OSD.w, (py / 2 - 1) * OSD.h)));
                    g.stroke();
                }
                cx += advOf(ch);
            }
        });
    }
    const blue = (g) => {
        g.fillStyle = K.vcrBlue;
        g.fillRect(0, 0, 1000, 1000);
    };

    // The picture's one roll as the tape takes up: how far it has slipped up, a frame at a
    // time from ROLL; the VCR's blue follows it in under the blanking bar.
    const SLIP = [0.03, 0.1, 0.24, 0.45, 0.68, 0.86, 0.96];

    function draw(g, t, env) {
        if (t < STOP - EPS) {
            search(g, t, env);
            C.osd(g, env, 'REW');
            rewMarks(g, env);
            counter(g, env, tapeAt(t));
            return;
        }
        const slip = t < ROLL - EPS ? 0 : SLIP[F(t) - F(ROLL)] ?? 1;
        if (slip < 1) {
            g.save();
            g.translate(0, -slip * 1000);
            R.card(g, t, n0 + 12);
            g.restore();
        }
        if (slip > 0) {
            const seam = (1 - slip) * 1000;
            g.save();
            g.translate(0, seam);
            blue(g);
            g.restore();
            if (slip < 1) {
                const gr = g.createLinearGradient(0, seam - 42, 0, seam + 42);
                [[0, 0], [0.16, 1], [0.84, 1], [1, 0]].forEach(([p, a]) => gr.addColorStop(p, `rgba(8,6,12,${a})`));
                g.fillStyle = gr;
                g.fillRect(0, seam - 42, 1000, 84);
            }
        }
        if (t < CLEAR - EPS) {
            C.osd(g, env, 'STOP');
            counter(g, env, tapeAt(STOP));
        } else if (t >= PLAY - EPS) C.osd(g, env, 'PLAY', { play: true });
    }

    // The tape: tearing and washed colour through the search, changing every frame, worse for
    // two frames when the transport changes speed; a twitch and a hop on STOP; lost tracking
    // while the picture rolls away; nothing on the blue.
    function post(t) {
        const f = F(t);
        if (t < STOP - EPS) {
            const st = stageAt(t), j = f - F(st.from), first = st === STAGES[0];
            return {
                track: st.track * (0.72 + 0.56 * h01(f, 3)) + (first || st.v === 5 ? 0 : [0.12, 0.05][j] ?? 0),
                snow: st.snow,
            };
        }
        const j = f - F(STOP), p = f - F(PLAY), r = f - F(ROLL);
        if (j < 3) return { track: [0.4, 0.18, 0.06][j], roll: [0.036, 0.012, 0][j] };
        if (p >= 0 && p < 2) return { track: [0.14, 0.05][p] };
        if (r >= 0 && r < SLIP.length) return { track: [0.2, 0.34, 0.48, 0.5, 0.4, 0.26, 0.12][r] };
        return {};
    }

    Seg.breakrew = { shots: [[T0, B(74), 'REW'], [B(74), STOP, 'Slowing'], [STOP, PLAY, 'The message'], [PLAY, T1, 'PLAY']], draw, post, tapeAt };
})();
