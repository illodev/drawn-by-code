// «Sign here!», 6.0–17.3 s (bars 4–11 of the riff). At a crossroads the Devil pops out of a
// flame with a contract; Tom signs without looking; it is an autograph.
//   bars 4–5  Crossroads   the Devil arrives, unrolls the contract, SIGN HERE!, conjures a quill
//   bar 6     Contract     the insert: Tom's mitt writes «To my #1 fan!» while the Devil peeks
//   bar 7     Autograph    he reads it: glee, shock, rage; Tom hops off
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, twos = S.twos, b = S.b, B = S.B;
    const T4 = B(4), T5 = B(5), T6 = B(6), T7 = B(7), T8 = B(8);
    const pop = S.pop;
    const bump = (t, at, dur = 0.3) => E.bump(twos(t, at), at, dur);
    const seg = (t, a, c) => E.seg(twos(t, a), a, c);
    const SAND = '#ffc21f', SAND_D = '#e09a12', ROAD = '#2f2a6b', ROAD_D = '#211c57';

    const flame = Fx.flame;

    // A quill: (x, y) is the nib, the feather goes up along `ang` (0 = straight up).
    function quill(g, x, y, s, ang) {
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        g.scale(s, s);
        const L = 3.2 / s;
        C.poly(g, [[-0.012, 0], [0, 0.05], [0.012, 0], [0.02, -0.5], [-0.02, -0.5]], { fill: '#fff1c4', ink: K.ink, lw: L * 0.8 });
        const vane = C.curve([[0, -0.36], [-0.12, -0.5], [-0.17, -0.75], [-0.1, -0.78], [-0.15, -0.98], [-0.06, -1.0], [-0.02, -1.24], [0.06, -1.02], [0.14, -1.0], [0.1, -0.8], [0.17, -0.74], [0.11, -0.5]], true, 5);
        C.poly(g, vane, { fill: '#2a2438', ink: K.ink, lw: L });
        C.poly(g, [[0, -0.4], [0, -1.12]], { ink: '#6c66a0', lw: L * 0.9, close: false });
        for (const [py, sx] of [[-0.6, -1], [-0.72, 1], [-0.88, -1], [-0.95, 1]]) C.poly(g, [[0, py], [sx * 0.09, py - 0.07]], { ink: '#4a4470', lw: L * 0.7, close: false });
        g.restore();
    }

    // A saguaro: a trunk and two arms, ribbed. (x, y) is its foot, h its height.
    function cactus(g, x, y, h, flip = 1) {
        const w = h * 0.2, col = { front: K.teal, top: K.aqua, side: K.tealDeep }, Dd = [h * 0.045, -h * 0.03];
        const part = (px, py, pw, ph) => {
            g.beginPath();
            g.roundRect(px + Dd[0], py + Dd[1], pw, ph, [pw / 2, pw / 2, 0, 0]);
            g.fillStyle = col.side;
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = 3;
            g.stroke();
            g.beginPath();
            g.roundRect(px, py, pw, ph, [pw / 2, pw / 2, 0, 0]);
            g.fillStyle = col.front;
            g.fill();
            g.stroke();
            C.poly(g, [[px + pw * 0.35, py + pw * 0.4], [px + pw * 0.35, py + ph - 3]], { ink: K.aqua, lw: 2.2, close: false });
            C.poly(g, [[px + pw * 0.68, py + pw * 0.45], [px + pw * 0.68, py + ph - 3]], { ink: K.tealDeep, lw: 2.2, close: false });
        };
        // arms first (their elbows tuck behind the trunk), then the trunk
        const a1 = x - flip * w * 1.55, a2 = x + flip * w * 1.5;
        part(a1 - w * 0.36, y - h * 0.72, w * 0.72, h * 0.3);
        g.fillStyle = K.teal;
        C.poly(g, [[a1 - w * 0.36, y - h * 0.44], [x, y - h * 0.44], [x, y - h * 0.3], [a1 + w * 0.1, y - h * 0.3], [a1 - w * 0.36, y - h * 0.36]], { fill: K.teal, ink: K.ink, lw: 3 });
        part(a2 - w * 0.36, y - h * 0.86, w * 0.72, h * 0.3);
        C.poly(g, [[a2 + w * 0.36, y - h * 0.58], [x, y - h * 0.58], [x, y - h * 0.44], [a2 - w * 0.1, y - h * 0.44], [a2 + w * 0.36, y - h * 0.5]], { fill: K.teal, ink: K.ink, lw: 3 });
        part(x - w / 2, y - h, w, h);
    }

    // The crossroads. rage 0..1 turns the sky red.
    function set(g, t, rage = 0) {
        const d = C.drawing(t);
        C.sunburst(g, 500, 720, { n: 12, rot: t * 0.12, a: rage > 0.5 ? '#ff5a3c' : K.sky, b: rage > 0.5 ? K.orange : '#8fe6f0' });
        // the day moon, the film's witness
        g.save();
        g.translate(868, 420);
        g.beginPath();
        g.arc(0, 0, 60, 0, C.TAU);
        g.fillStyle = '#fffbe8';
        g.fill();
        g.save();
        g.clip();
        g.fillStyle = '#dcd6f7';
        for (const [cx, cy, cr] of [[-24, -14, 16], [20, -30, 10], [26, 18, 18]]) {
            g.beginPath();
            g.ellipse(cx, cy, cr, cr * 0.82, -0.3, 0, C.TAU);
            g.fill();
        }
        g.restore();
        g.beginPath();
        g.arc(0, 0, 60, 0, C.TAU);
        g.strokeStyle = K.ink;
        g.lineWidth = 4;
        g.stroke();
        g.restore();
        C.memphis(g, t, [['squiggle', 112, 352, 44, -0.4, K.white], ['tri', 318, 372, 40, 0.3, K.yellow], ['zig', 520, 350, 52, 0.2, K.navy], ['cross', 706, 376, 40, 0.5, K.purple], ['bar', 944, 306, 44, -0.5, K.white]], { lw: 8 });
        // mesas: boxes with strata
        const mesa = (x, y, w, h, dep) => {
            C.box(g, x, y, w, h, [dep, -dep * 0.66], { front: K.purple, top: K.violet, side: '#5a2fb5' }, { lw: 4 });
            for (const k of [0.3, 0.55, 0.8]) C.poly(g, [[x + 3, y + h * k], [x + w - 3, y + h * k]], { ink: '#5a2fb5', lw: 3, close: false });
        };
        mesa(-30, 628, 290, 190, 46);
        mesa(742, 676, 300, 142, 40);
        mesa(450, 742, 150, 76, 26);
        // sand, with the horizon as an inked edge
        g.fillStyle = SAND;
        g.fillRect(-20, 812, 1040, 220);
        C.poly(g, [[-20, 812], [1020, 812]], { ink: K.ink, lw: 4, close: false });
        // the road into the distance crosses the road along the frame
        const sl = 1.5; // the oblique slope of depth lines on the ground
        const far = (y) => 470 - (y - 884) * sl;
        C.poly(g, [[far(812), 812], [far(812) + 150, 812], [far(1010) + 150, 1010], [far(1010), 1010]], { fill: ROAD, ink: K.ink, lw: 4 });
        g.fillStyle = ROAD;
        g.fillRect(-20, 884, 1040, 82);
        C.poly(g, [[-20, 884], [far(884), 884]], { ink: K.ink, lw: 4, close: false });
        C.poly(g, [[far(884) + 150, 884], [1020, 884]], { ink: K.ink, lw: 4, close: false });
        C.poly(g, [[-20, 966], [far(966), 966]], { ink: K.ink, lw: 4, close: false });
        C.poly(g, [[far(966) + 150, 966], [1020, 966]], { ink: K.ink, lw: 4, close: false });
        // centre lines: dashes along both roads
        for (let x = -10; x < 1020; x += 96) {
            if (x + 52 > far(925) - 14 && x < far(925) + 164) continue;
            C.poly(g, [[x, 925], [x + 52, 925]], { ink: K.yellow, lw: 7, close: false });
        }
        for (const y of [826, 854, 982]) C.poly(g, [[far(y) + 75, y], [far(y + 18) + 75, y + 18]], { ink: K.yellow, lw: 7, close: false });
        // pebbles and ripples on the sand
        const r = Motion.rng('sand');
        for (let i = 0; i < 16; i++) {
            const x = r() * 1000, y = 826 + r() * 44, w = 14 + r() * 22;
            if (x > far(y) - 30 && x < far(y) + 180) continue;
            C.poly(g, [[x, y], [x + w, y]], { ink: SAND_D, lw: 3, close: false });
        }
        // the crossroads sign on the far corner
        C.box(g, 912, 660, 12, 170, [5, -3.4], { front: '#7b4526', top: '#7b4526', side: '#55301b' }, { lw: 3 });
        const dia = [[918, 574], [976, 632], [918, 690], [860, 632]];
        C.prism(g, dia, [5, -3.4], { front: K.yellow, top: K.gold, side: '#e0a800' }, { lw: 4 });
        C.poly(g, [[918, 598], [918, 666]], { ink: K.ink, lw: 12, close: false });
        C.poly(g, [[884, 632], [952, 632]], { ink: K.ink, lw: 12, close: false });
        cactus(g, 78, 850, 150, 1);
        // a tumbleweed bowls across the far sand
        const tx = 1090 - (t - T4) * 210, hop = Math.abs(Math.sin((t - T4) * 5.2)) * 26;
        if (tx > -60) {
            g.save();
            g.translate(tx, 846 - hop);
            g.rotate(-d * 0.5);
            g.beginPath();
            g.arc(0, 0, 25, 0, C.TAU);
            g.fillStyle = '#e8b35a';
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = 3;
            g.stroke();
            g.strokeStyle = '#9a6a2a';
            g.lineWidth = 2.4;
            for (const [a0, rr, sw] of [[0, 17, 3.6], [1.9, 12, 4.4], [3.6, 20, 2.8], [5, 8, 4.8]]) {
                g.beginPath();
                g.arc(Math.cos(a0) * 4, Math.sin(a0) * 4, rr, a0, a0 + sw);
                g.stroke();
            }
            g.restore();
        }
    }

    const DX = 345, TX = 730, GY = 930; // the Devil's and Tom's marks on the road

    function crossroads(g, t, env, reading = false) {
        const P = S.pulseAt(t), pulse = P.pulse, ph = P.k + P.since, d = C.drawing(t);
        const tPop = b(17), tLand = b(18), tOpen = b(19), tSign = b(20), tHere = b(21), tQuill = b(22), tTake = b(23);
        const rageAt = b(30), shockAt = b(29);
        const rage = reading && t >= rageAt - 1e-6 ? 1 : 0;
        set(g, t, rage);

        // --- Tom: keeps the beat and never looks; in the last bar he hops off to the right
        let tx = TX, ty = GY;
        if (reading) {
            // two hops aside when the Devil blows up
            for (let n = 30; n <= 31; n++) {
                const u = E.seg(twos(t, b(n)), b(n), b(n) + S.BEAT * 0.8);
                tx += E.inOut(u) * 60;
                ty -= Math.sin(u * Math.PI) * 34;
            }
        }
        const tom = () => Cast.tom(g, tx, ty, 205, {
            squash: 0.05 * pulse, headDy: 0.02 * pulse, sway: -0.03 * Math.sin((ph - 0.3) * Math.PI),
            strum: Math.cos(ph * Math.PI * 2), fret: 0.3 + 0.5 * (Math.floor(ph / 2) % 2), shades: 1, mouth: reading ? 'grin' : 'smirk',
        });

        // --- the Devil
        const up = reading ? 1 : pop(t, tPop, 0.3);
        const devil = () => {
            if (up <= 0) return;
            const land = bump(t, tLand, 0.25), open = reading ? 1 : 0.12 + 0.88 * E.out(seg(t, tOpen, tOpen + 3 / 12));
            const pitch = reading ? 0 : E.out(seg(t, tSign, tSign + 2 / 12)) * (1 + 0.25 * pulse);
            let mood = 'grin', look = 1, sq = 0.16 * land + 0.04 * pulse, jx = 0, tilt = 0;
            if (!reading && t >= tQuill - 1e-6) mood = 'sly';
            if (reading) {
                mood = t >= rageAt - 1e-6 ? 'angry' : t >= shockAt - 1e-6 ? 'shock' : 'grin';
                sq = 0.04 * pulse - 0.14 * bump(t, shockAt, 0.3);
                jx = rage ? (d % 2 ? 5 : -5) : 0; // shaking with rage, on twos
                tilt = mood === 'grin' ? 0.05 : 0;
            }
            g.save();
            g.translate(DX + jx, GY + (1 - up) * 90);
            g.scale(up, up);
            Devil.draw(g, 0, 0, 215, {
                squash: sq, mood, look, tail: 0.04 * Math.sin(ph * Math.PI), headTilt: tilt, lean: 0.07 * pitch,
                trident: true, handR: [-0.95, -0.66], handL: reading ? [0.5, -0.74] : [0.6 + 0.2 * pitch, -0.7 - 0.06 * pitch],
                contract: { open, at: reading ? [0.2, -0.16] : [0.22, -0.2], ang: reading ? 0.06 + (rage ? (d % 2 ? 0.05 : -0.05) : 0) : 0.05, signed: reading },
            });
            g.restore();
        };

        // the flame he comes out of: it bursts on the snare and is gone two drawings after he lands
        const poof = t < tPop - 1e-6 || reading ? 0 : pop(t, tPop, 0.2) * (1 - E.in(seg(t, tLand, tLand + 3 / 12)));
        if (poof > 0) {
            C.burst(g, DX, 760, { r0: 170 * poof, r1: 290 * poof, n: 13, seed: 'poof', fill: K.red, ink: K.ink, lw: 5, rot: d % 2 ? 0.05 : 0 });
            C.burst(g, DX, 760, { r0: 125 * poof, r1: 215 * poof, n: 13, seed: 'poof2', fill: K.orange, lw: 0 });
            C.burst(g, DX, 760, { r0: 85 * poof, r1: 150 * poof, n: 11, seed: 'poof3', fill: K.yellow, lw: 0 });
        }
        if (tx < DX + 330) {
            tom();
            devil();
        } else {
            devil();
            tom();
        }
        if (poof > 0) {
            for (const [fx, fs, k] of [[-150, 110, 0], [-60, 150, 1], [70, 130, 2], [160, 100, 1]]) flame(g, DX + fx, GY + 6, fs * poof, d, k);
        }
        // rage: flames on his horn tips and a puff of steam from each ear
        if (rage) {
            const k = pop(t, rageAt, 0.2);
            flame(g, DX - 97, GY - 215 * 2.24 + 4, 60 * k, d, 0);
            flame(g, DX + 115, GY - 215 * 2.3 + 4, 60 * k, d, 1);
        }

        if (!reading) {
            // SIGN HERE!
            C.text3d(g, 'SIGN HERE!', 500, 262, {
                size: 172, dir: [0.72, 0.7], face: K.yellow, side: K.red, side2: K.orange, bands: 3, depth: 24, ow: 4.4, track: 2,
                letter: (i) => {
                    const at = i < 4 ? tSign : tHere, p = pop(t, at + (i < 4 ? i : i - 5) / 24, 0.25);
                    return p <= 0 ? { hide: true } : { s: p, rot: (i % 2 ? 1 : -1) * 0.04, dy: -10 * pulse * ((i + P.k) % 2 ? 1 : 0.3) };
                },
            });
            // the quill: conjured between them with a twinkle, then it darts to Tom's mitt
            const q = pop(t, tQuill, 0.25);
            if (q > 0) {
                const fly = E.inOut(seg(t, tTake, tTake + 3 / 12));
                const qx = E.lerp(590, TX - 92, fly), qy = E.lerp(560, GY - 150, fly) + (fly > 0 ? 0 : Math.sin(d * 0.9) * 6);
                quill(g, qx, qy, 150 * q, 0.5 - 0.3 * fly);
                const tw = bump(t, tQuill, 0.34);
                if (tw > 0) C.sparkle(g, 622, 478, 12 + 40 * tw, { color: K.white, ink: K.ink, lw: 3 });
            }
        }
    }

    // The insert: the parchment fills the frame, Tom's mitt writes, the Devil peeks over the top.
    function insert(g, t, env) {
        const d = C.drawing(t), P = S.pulseAt(t);
        g.fillStyle = K.purple;
        g.fillRect(0, 0, 1000, 1000);
        C.sunburst(g, 500, 300, { n: 10, rot: t * 0.2, a: K.purple, b: '#6a37cc' });
        // where the pen is: four strokes of writing, one per beat
        const beats = [b(24), b(25), b(26), b(27)];
        const done = beats.map((at) => E.out(seg(t, at, at + 3 / 12)));
        const pen = [[250, 668], [470, 668], [735, 668], [455, 792], [650, 792]];
        let px = pen[0][0], py = pen[0][1];
        done.forEach((k, i) => {
            const [ax, ay] = pen[i], [bx, by] = pen[i + 1];
            if (k > 0) {
                px = E.lerp(ax, bx, k);
                py = E.lerp(ay, by, k) - Math.sin(k * Math.PI * 3) * 14 * (k < 1 ? 1 : 0);
            }
        });
        const look = (px - 500) / 300;
        // the Devil, eyes over the edge, following the pen; his brows jump when it is done
        const jump = bump(t, beats[3] + 3 / 12, 0.3);
        Devil.draw(g, 500, 560 - jump * 16, 232, { mood: t >= beats[3] + 3 / 12 - 1e-6 ? 'shock' : 'sly', look, headDy: 0.012 * P.pulse });
        // the sheet
        g.save();
        g.translate(500, 640);
        g.rotate(-0.025);
        g.translate(-500, -640);
        C.box(g, 96, 296, 808, 900, [10, -7], { front: '#fff3d0', top: '#dcc690', side: '#dcc690' }, { lw: 5 });
        // his mitts hold its top edge
        for (const sx of [-1, 1]) C.box(g, 500 + sx * 300 - 44, 268, 88, 60, [14, -9], { front: Devil.P.skin, top: Devil.P.skinTop, side: Devil.P.skinSide }, { lw: 4 });
        g.font = '104px "Anton"';
        g.textAlign = 'center';
        g.textBaseline = 'alphabetic';
        g.fillStyle = K.ink;
        const head = [...'CONTRACT'];
        head.forEach((ch, i) => g.fillText(ch, 500 + (i - 3.5) * 82, 432));
        C.poly(g, [[170, 454], [830, 454]], { ink: K.ink, lw: 6, close: false });
        C.poly(g, [[170, 468], [830, 468]], { ink: K.ink, lw: 2.5, close: false });
        // small print: lines of dashes, with the one word that matters
        const r = Motion.rng('smallprint');
        let soul = false;
        for (let i = 0; i < 3; i++) {
            const y = 506 + i * 34;
            let x = 170;
            while (x < 820) {
                const w = 18 + r() * 60;
                if (i === 1 && x > 430 && !soul) {
                    soul = true;
                    g.font = '40px "Anton"';
                    g.fillStyle = K.red;
                    g.textAlign = 'left';
                    g.fillText('SOUL', x, y + 12);
                    x += 96;
                    continue;
                }
                C.poly(g, [[x, y], [Math.min(830, x + w), y]], { ink: '#8a6d3b', lw: 4, close: false });
                x += w + 12;
            }
        }
        // the line, its cross, the seal with its ribbons
        C.poly(g, [[250, 812], [700, 812]], { ink: K.ink, lw: 5, close: false });
        C.poly(g, [[176, 766], [222, 812]], { ink: K.ink, lw: 7, close: false });
        C.poly(g, [[222, 766], [176, 812]], { ink: K.ink, lw: 7, close: false });
        C.poly(g, [[756, 800], [728, 930], [770, 904], [800, 940], [812, 800]], { fill: K.magenta, ink: K.ink, lw: 4 });
        C.poly(g, C.ellipsePts(784, 780, 70, 70, 12, 0.2).map(([x, y], i) => (i % 2 ? [784 + (x - 784) * 0.86, 780 + (y - 780) * 0.86] : [x, y])), { fill: '#c9182c', ink: K.ink, lw: 4 });
        g.beginPath();
        g.arc(784, 780, 40, 0, C.TAU);
        g.strokeStyle = '#8f0f1f';
        g.lineWidth = 4;
        g.stroke();
        // the seal's mark: two little horns
        for (const sx of [-1, 1]) C.poly(g, C.curve([[784 + sx * 6, 796], [784 + sx * 26, 786], [784 + sx * 22, 760], [784 + sx * 14, 778]], true, 5), { fill: '#8f0f1f', lw: 0 });
        // what Tom writes, in blue ink, revealed as the pen passes
        g.font = '100px "Hand"';
        g.textAlign = 'left';
        g.fillStyle = '#2b3fd1';
        const write = (text, x, y, k, w) => {
            if (k <= 0) return;
            g.save();
            g.beginPath();
            g.rect(x - 10, y - 110, (w + 20) * k, 150);
            g.clip();
            g.fillText(text, x, y);
            g.restore();
        };
        write('To my', 250, 700, done[0], 210);
        write('#1 fan!', 478, 700, done[1], 250);
        write('— Tom', 455, 800, done[2] * 0 + done[3], 230);
        g.restore();
        // the quill in Tom's mitt, coming in from the bottom right
        const wob = done.some((k) => k > 0 && k < 1) ? (d % 2 ? 0.07 : -0.05) : 0;
        quill(g, px, py - 4, 262, 0.95 + wob);
        g.save();
        g.translate(px, py);
        g.scale(430, 430);
        Cast.arm(g, Cast.TOM, 3.2 / 430, [1.1, 1.2], [0.2, 0.1]);
        g.restore();
    }

    Seg.sign = {
        shots: [[T4, T6, 'Crossroads'], [T6, T7, 'Contract'], [T7, T8, 'Autograph']],
        draw(g, t, env) {
            if (t < T6 - 1e-6) crossroads(g, t, env);
            else if (t < T7 - 1e-6) insert(g, t, env);
            else crossroads(g, t, env, true);
        },
        post() {
            return {};
        },
    };
})();
