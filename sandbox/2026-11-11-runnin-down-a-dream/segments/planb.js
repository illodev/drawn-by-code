// «Plan B», bars 34–38 (48.4–55.4 s): Hell's office. The Devil bins plan A, unrolls a
// blueprint headed PLAN B: RAIN and walks his imps through it; then he pulls the lever.
(() => {
    const Seg = (window.Seg = window.Seg || {});
    const C = Cereal, K = C.COL, E = Ease, S = Song, twos = S.twos, b = S.b, B = S.B, pop = S.pop;
    const T0 = B(34), T1 = B(39), n0 = 136; // the first beat of bar 34
    const at = (k) => b(n0 + k); // beat k of this segment
    const bump = (t, a, dur = 0.3) => E.bump(twos(t, a), a, dur);
    const seg = (t, a, c) => E.seg(twos(t, a), a, c);
    const WALL = '#8a1a2c', WALL_D = '#6a1221', WALL_L = '#a82338', FLOOR = '#3a0a14', GLOW = '#ff8a2b';
    const BLUE = '#2456d6', BLUE_L = '#4a7bf0', CHALK = '#fffdf4';

    function set(g, t, pulled) {
        const d = C.drawing(t);
        g.fillStyle = WALL;
        g.fillRect(0, 0, 1000, 1000);
        // the rock: facets, a few of them catching the light
        const r = Motion.rng('rock');
        for (let i = 0; i < 26; i++) {
            const x = r() * 1000, y = 60 + r() * 780, w = 50 + r() * 90, h = 30 + r() * 50, lit = r() < 0.3;
            C.poly(g, [[x, y], [x + w * 0.6, y - h * 0.4], [x + w, y + h * 0.2], [x + w * 0.5, y + h * 0.7]], { fill: lit ? WALL_L : WALL_D, lw: 0 });
        }
        // the window: Hell outside, a lava fall, far spires
        const win = new Path2D();
        win.moveTo(44, 400);
        win.lineTo(44, 210);
        win.quadraticCurveTo(44, 96, 148, 96);
        win.quadraticCurveTo(252, 96, 252, 210);
        win.lineTo(252, 400);
        win.closePath();
        g.save();
        g.clip(win);
        C.sunburst(g, 150, 420, { n: 10, rot: t * 0.15, a: '#ff5a3c', b: K.orange });
        for (const [sx, sh] of [[70, 150], [118, 96], [214, 170]]) C.poly(g, [[sx - 24, 400], [sx - 6, 400 - sh], [sx + 8, 400 - sh * 0.8], [sx + 26, 400]], { fill: '#7a1626', ink: K.ink, lw: 3 });
        g.fillStyle = K.yellow;
        g.fillRect(150, 96, 44, 320);
        g.fillStyle = K.orange;
        for (let i = 0; i < 6; i++) g.fillRect(150 + ((i * 17) % 34), 96 + ((i * 60 + d * 22) % 320), 10, 44);
        C.poly(g, [[150, 96], [150, 420]], { ink: K.ink, lw: 3, close: false });
        C.poly(g, [[194, 96], [194, 420]], { ink: K.ink, lw: 3, close: false });
        g.restore();
        g.strokeStyle = K.ink;
        g.lineWidth = 16;
        g.stroke(win);
        g.strokeStyle = WALL_L;
        g.lineWidth = 9;
        g.stroke(win);
        // sill
        C.box(g, 30, 398, 236, 20, [10, -7], { front: WALL_L, top: '#c43349', side: WALL_D }, { lw: 4 });
        // stalactites
        const rs = Motion.rng('stal');
        for (let x = 280; x < 1010; x += 56 + rs() * 40) {
            const w = 26 + rs() * 22, h = 50 + rs() * 80;
            C.prism(g, [[x - w, 0], [x + w, 0], [x, h]], [7, -5], { front: WALL_D, top: WALL_D, side: '#4a0c17' }, { lw: 4 });
        }
        // floor: dark, with cracks that glow
        g.fillStyle = FLOOR;
        g.fillRect(-20, 862, 1040, 160);
        C.poly(g, [[-20, 862], [1020, 862]], { ink: K.ink, lw: 5, close: false });
        for (const cr of [[[40, 920], [110, 904], [150, 930], [230, 914]], [[420, 968], [500, 950], [560, 974], [640, 956], [700, 978]], [[820, 900], [880, 916], [930, 896]]]) {
            C.poly(g, cr, { ink: K.ink, lw: 9, close: false });
            C.poly(g, cr, { ink: d % 4 < 2 ? GLOW : K.yellow, lw: 4, close: false });
        }
        // the lever on the wall: a plate, a slot, an arm with a red knob, its label
        const lx = 96, ly = 700;
        C.box(g, lx - 46, ly - 110, 92, 190, [8, -5], { front: '#4a4470', top: '#625c8c', side: '#353055' }, { lw: 4 });
        for (const [bx, by] of [[-34, -98], [34, -98], [-34, 68], [34, 68]]) {
            g.beginPath();
            g.arc(lx + bx, ly + by, 5, 0, C.TAU);
            g.fillStyle = '#c9cfe2';
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = 2;
            g.stroke();
        }
        C.poly(g, [[lx, ly - 76], [lx, ly + 6]], { ink: K.ink, lw: 14, close: false });
        const ang = -0.9 + 1.8 * pulled; // up → down
        const tip = [lx + 64 * Math.cos(ang), ly - 35 + 64 * Math.sin(ang)];
        C.poly(g, [[lx, ly - 35], tip], { ink: K.ink, lw: 15, close: false });
        C.poly(g, [[lx, ly - 35], tip], { ink: '#c9cfe2', lw: 8, close: false });
        g.beginPath();
        g.arc(tip[0], tip[1], 17, 0, C.TAU);
        g.fillStyle = K.red;
        g.fill();
        g.strokeStyle = K.ink;
        g.lineWidth = 4;
        g.stroke();
        g.fillStyle = '#ff8a7a';
        g.beginPath();
        g.arc(tip[0] - 5, tip[1] - 6, 5, 0, C.TAU);
        g.fill();
        C.box(g, lx - 40, ly + 28, 80, 40, [3, -2], { front: K.yellow, top: K.yellow, side: '#e0a800' }, { lw: 3 });
        g.fillStyle = K.ink;
        g.font = '30px "Anton"';
        g.textAlign = 'center';
        g.textBaseline = 'alphabetic';
        g.fillText('RAIN', lx, ly + 60);
        return tip;
    }

    // The easel and the blueprint. roll 0..1: how far the sheet has unrolled.
    function board(g, t, roll) {
        const x0 = 418, y0 = 150, w = 452, h = 440;
        // legs and the tray
        for (const [ax, bx] of [[x0 + 60, x0 + 10], [x0 + w - 60, x0 + w - 10]]) C.prism(g, [[ax - 9, y0 + 20], [ax + 9, y0 + 20], [bx + 9, 868], [bx - 9, 868]], [6, -4], { front: '#8a5a2e', top: '#8a5a2e', side: '#5e3b1c' }, { lw: 4 });
        C.box(g, x0 - 14, y0 - 12, w + 28, h + 30, [10, -7], { front: '#b9814a', top: '#d7a468', side: '#8a5a2e' }, { lw: 4 });
        C.box(g, x0 - 22, y0 + h + 10, w + 44, 16, [14, -10], { front: '#8a5a2e', top: '#b9814a', side: '#5e3b1c' }, { lw: 4 });
        // the sheet
        const sh = (h - 16) * roll;
        if (sh > 4) {
            g.fillStyle = BLUE;
            g.fillRect(x0 + 8, y0 + 8, w - 16, sh);
            g.save();
            g.beginPath();
            g.rect(x0 + 8, y0 + 8, w - 16, sh);
            g.clip();
            g.strokeStyle = BLUE_L;
            g.lineWidth = 1.6;
            g.beginPath();
            for (let x = x0 + 8; x < x0 + w; x += 36) {
                g.moveTo(x, y0);
                g.lineTo(x, y0 + h);
            }
            for (let y = y0 + 8; y < y0 + h; y += 36) {
                g.moveTo(x0, y);
                g.lineTo(x0 + w, y);
            }
            g.stroke();
            g.restore();
            g.strokeStyle = K.ink;
            g.lineWidth = 4;
            g.strokeRect(x0 + 8, y0 + 8, w - 16, sh);
        }
        // the roll, at the sheet's lower edge while it falls, and the two pins
        if (roll < 1) {
            g.beginPath();
            g.roundRect(x0 - 2, y0 + 2 + sh, w + 4, 22, 11);
            g.fillStyle = BLUE_L;
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = 4;
            g.stroke();
        }
        for (const px of [x0 + 26, x0 + w - 26]) {
            g.beginPath();
            g.arc(px, y0 + 22, 8, 0, C.TAU);
            g.fillStyle = K.red;
            g.fill();
            g.strokeStyle = K.ink;
            g.lineWidth = 3;
            g.stroke();
        }
        return { x0, y0, w, h };
    }

    // The plan, in chalk line: a machine with a crank, an arrow, a cloud, rain, a soaked car.
    function plan(g, t, R) {
        const { x0, y0 } = R, ch = (pts, lw = 5, close = false) => C.poly(g, pts, { ink: CHALK, lw, close });
        const show = (k) => pop(t, at(k), 0.2);
        const part = (k, cx, cy, fn) => {
            const p = show(k);
            if (p <= 0) return;
            g.save();
            g.translate(cx, cy);
            g.scale(p, p);
            g.translate(-cx, -cy);
            fn();
            g.restore();
        };
        // the heading
        C.text3d(g, 'PLAN B:', x0 + 138, y0 + 100, { size: 74, face: CHALK, side: K.ink, depth: 7, ow: 3, letter: () => { const p = show(4); return p <= 0 ? { hide: true } : { s: p }; } });
        C.text3d(g, 'RAIN', x0 + 338, y0 + 106, { size: 96, face: K.yellow, side: K.red, side2: K.orange, bands: 2, depth: 12, ow: 3.4, letter: (i) => { const p = pop(t, at(5) + i / 24, 0.2); return p <= 0 ? { hide: true } : { s: p, rot: (i % 2 ? 1 : -1) * 0.05 }; } });
        const mx = x0 + 96, my = y0 + 300;
        // 6 · the machine: a box, a funnel on top, dials
        part(6, mx, my, () => {
            ch([[mx - 56, my - 40], [mx + 56, my - 40], [mx + 56, my + 50], [mx - 56, my + 50]], 5, true);
            ch([[mx - 30, my - 40], [mx - 44, my - 84], [mx + 44, my - 84], [mx + 30, my - 40]]);
            for (const dx of [-28, 6]) {
                g.beginPath();
                g.arc(mx + dx, my + 2, 13, 0, C.TAU);
                g.strokeStyle = CHALK;
                g.lineWidth = 4;
                g.stroke();
                ch([[mx + dx, my + 2], [mx + dx + 8, my - 6]], 4);
            }
            ch([[mx - 40, my + 30], [mx + 40, my + 30]], 4);
        });
        // 7 · its crank, which turns once it is drawn
        part(7, mx + 56, my, () => {
            const a = C.drawing(t) * 0.9;
            ch([[mx + 56, my + 6], [mx + 84, my + 6]]);
            ch([[mx + 84, my + 6], [mx + 84 + Math.cos(a) * 24, my + 6 + Math.sin(a) * 24]]);
            g.beginPath();
            g.arc(mx + 84 + Math.cos(a) * 24, my + 6 + Math.sin(a) * 24, 7, 0, C.TAU);
            g.fillStyle = CHALK;
            g.fill();
        });
        // 8 · an arrow up to the cloud
        part(8, mx + 110, my - 100, () => {
            ch(C.curve([[mx + 30, my - 96], [mx + 70, my - 140], [mx + 150, my - 150]], false, 8));
            ch([[mx + 132, my - 166], [mx + 152, my - 150], [mx + 130, my - 136]]);
        });
        // 9 · the cloud
        const cx = x0 + 320, cy = y0 + 200;
        part(9, cx, cy, () => {
            const cl = new Path2D();
            for (const [lx, ly, lr] of [[-52, 8, 26], [-22, -12, 32], [18, -18, 36], [54, 2, 28]]) cl.arc(cx + lx, cy + ly, lr, 0, C.TAU);
            g.save();
            g.strokeStyle = CHALK;
            g.lineWidth = 10;
            g.stroke(cl);
            g.fillStyle = BLUE;
            g.fill(cl);
            g.restore();
        });
        // 10 · rain, falling on twos
        const rp = show(10);
        if (rp > 0) {
            const d = C.drawing(t);
            for (let i = 0; i < 7; i++) {
                const rx = cx - 66 + i * 22, off = ((d * 13 + i * 17) % 40);
                ch([[rx, cy + 44 + off], [rx - 7, cy + 64 + off]], 4);
                if (off < 22) ch([[rx - 4, cy + 86 + off], [rx - 11, cy + 106 + off]], 4);
            }
        }
        // 11 · the car, soaked: a box on two wheels, drops flying off it
        const kx = x0 + 320, ky = y0 + 384;
        part(11, kx, ky, () => {
            ch([[kx - 60, ky], [kx - 60, ky - 22], [kx - 30, ky - 24], [kx - 18, ky - 46], [kx + 26, ky - 46], [kx + 38, ky - 24], [kx + 62, ky - 20], [kx + 62, ky]], 5, true);
            for (const wx of [-34, 36]) {
                g.beginPath();
                g.arc(kx + wx, ky + 2, 13, 0, C.TAU);
                g.fillStyle = BLUE;
                g.fill();
                g.strokeStyle = CHALK;
                g.lineWidth = 5;
                g.stroke();
            }
            for (const [sx, sy, ex, ey] of [[-74, -30, -92, -44], [-70, -8, -94, -8], [76, -30, 94, -44], [78, -8, 100, -8]]) ch([[kx + sx, ky + sy], [kx + ex, ky + ey]], 4);
        });
    }

    function draw(g, t, env) {
        const P = S.pulseAt(t), d = C.drawing(t), ph = P.k + P.since;
        const pullAt = at(17), pulled = E.out(seg(t, pullAt, pullAt + 2 / 12));
        const rumble = t >= pullAt ? bump(t, pullAt + 2 / 12, 0.7) : 0;
        g.save();
        if (rumble > 0) g.translate(d % 2 ? 6 * rumble : -6 * rumble, d % 3 ? -4 * rumble : 4 * rumble);
        const knob = set(g, t, pulled);
        const R = board(g, t, t < at(2) - 1e-6 ? 0 : Math.min(1, 0.25 + 0.75 * E.out(seg(t, at(2), at(2) + 3 / 12))));
        if (t >= at(2) + 3 / 12 - 1e-6) plan(g, t, R);

        // the bin at the far right: plan A burns in it
        const bx = 936, by = 886, hit = bump(t, at(1), 0.4);
        Fx.flame(g, bx, by - 96, 70 + 60 * hit, d, 0);
        C.drum(g, bx, by - 52, 0, [0, 0], { front: '#4a4470' });
        C.box(g, bx - 46, by - 100, 92, 100, [10, -7], { front: '#6c66a0', top: '#2a2438', side: '#4a4470' }, { lw: 4 });
        for (const yy of [-78, -50, -22]) C.poly(g, [[bx - 46, by + yy], [bx + 46, by + yy]], { ink: '#4a4470', lw: 4, close: false });
        Fx.flame(g, bx - 16, by - 92, 44 + 30 * hit, d, 1);

        // the Devil: he lobs plan A over his shoulder into the bin, lectures, glares, pulls the lever
        const DS = 196, DY = 905;
        const q = seg(t, at(14), at(14) + 2 / 12) > 0 && t < at(16) - 1e-6; // an imp has a question
        const glare = t >= at(15) - 1e-6 && t < at(16) - 1e-6;
        const toLever = E.out(seg(t, at(16), at(16) + 3 / 12));
        const DX = 300;
        // what his cane points at on the sheet: the heading, the machine, the cloud, the car.
        // The cane keeps its length; it turns towards the mark and taps on the beat.
        const marks = [[4, [600, 262]], [6, [540, 440]], [9, [716, 356]], [11, [716, 520]]];
        let mark = marks[0][1];
        for (const [k, m] of marks) if (t >= at(k) - 1e-6) mark = m;
        const hL0 = [0.6, -0.78], mdx = (mark[0] - DX) / DS - hL0[0], mdy = (mark[1] - DY) / DS - hL0[1], ml = Math.hypot(mdx, mdy) || 1;
        const reach = 1.7 + 0.07 * (bump(t, at(6), 0.2) + bump(t, at(7), 0.2) + bump(t, at(9), 0.2) + bump(t, at(10), 0.2) + bump(t, at(11), 0.2));
        const aim = [hL0[0] + (mdx / ml) * reach, hL0[1] + (mdy / ml) * reach];
        const pointing = t >= at(4) - 1e-6 && t < at(16) - 1e-6;
        const throwU = E.seg(t, T0, at(0) + 4 / 24);
        const handR = t < at(16) - 1e-6 ? [-0.5 - 0.25 * Math.sin(throwU * Math.PI), -0.5 - 0.9 * Math.sin(throwU * Math.PI)] : [E.lerp(-0.5, (knob[0] - DX) / DS + 0.05, toLever), E.lerp(-0.5, (knob[1] - DY) / DS, toLever)];
        Devil.draw(g, DX, DY, DS, {
            squash: 0.04 * P.pulse + 0.08 * bump(t, at(17), 0.3), mood: glare ? 'angry' : t >= at(17) - 1e-6 ? 'laugh' : pointing ? 'sly' : 'grin',
            look: glare ? 1 : toLever > 0 ? -1 : 1, tail: 0.04 * Math.sin(ph * Math.PI), headTilt: glare ? 0.06 : 0, lean: -0.07 * toLever,
            handR, pointer: pointing ? aim : null, handL: pointing ? hL0 : [0.5, -0.5],
        });
        // plan A: a crumpled ball on its arc from his mitt to the bin, landing on the second beat
        const fl = (t - at(0)) / (at(1) - at(0));
        if (fl >= 0.12 && fl < 1) {
            const x = E.lerp(DX - 150, bx, fl), y = E.lerp(DY - 300, by - 110, fl) - Math.sin(fl * Math.PI) * 330;
            g.save();
            g.translate(x, y);
            g.rotate(d * 0.8);
            C.poly(g, [[-20, -8], [-8, -22], [10, -18], [22, -4], [16, 14], [-2, 22], [-18, 12]], { fill: '#fff3d0', ink: K.ink, lw: 3.4 });
            C.poly(g, [[-8, -10], [4, 0], [-4, 10]], { ink: '#8a6d3b', lw: 2.4, close: false });
            C.poly(g, [[6, -12], [12, 2]], { ink: '#8a6d3b', lw: 2.4, close: false });
            g.restore();
        }
        // sparks at the switch when it closes
        if (t >= pullAt + 2 / 12 - 1e-6) {
            const k = bump(t, pullAt + 2 / 12, 0.4);
            if (k > 0) for (let i = 0; i < 7; i++) C.sparkle(g, knob[0] + Math.cos(i * 0.9 + 0.4) * (30 + 60 * k), knob[1] + Math.sin(i * 0.9 + 0.4) * (30 + 60 * k), 8 + 16 * k, { color: i % 2 ? K.yellow : K.white, ink: K.ink, lw: 2.4 });
        }

        // the imps on the floor in front: they take notes on the beat, cheer, one asks, all brace
        const cheer = t >= at(12) - 1e-6 && t < at(14) - 1e-6, brace = t >= pullAt - 1e-6;
        [[500, 'specs'], [662, 'hat'], [824, 'bow']].forEach(([ix, wear], i) => {
            const asking = i === 1 && q, duck = i === 1 && glare;
            const hop = cheer ? Math.abs(Math.sin((ph + i * 0.33) * Math.PI)) * 0.28 : 0;
            Devil.imp(g, ix, 962, 132, {
                wear, hold: 'board', write: cheer || brace ? 0 : (P.k + i) % 2 ? P.pulse : -P.pulse, look: brace ? -1 : t < at(1) ? 1 : -0.6,
                mood: duck ? 'oops' : cheer || brace ? 'awe' : 'grin', hop, squash: duck ? 0.22 : 0.04 * P.pulse, armUp: asking ? 1 : cheer ? 0.8 : 0, tail: 0.05 * Math.sin((ph + i) * Math.PI),
            });
            if (asking && !duck) {
                const p = pop(t, at(14), 0.2);
                g.save();
                g.translate(ix + 96, 742);
                g.scale(p, p);
                C.burst(g, 0, 0, { r0: 34, r1: 50, n: 9, seed: 'q', jitter: 0.1, fill: K.white, ink: K.ink, lw: 3.4 });
                g.fillStyle = K.ink;
                g.font = '58px "Anton"';
                g.textAlign = 'center';
                g.textBaseline = 'alphabetic';
                g.fillText('?', 0, 21);
                g.restore();
            }
        });
        g.restore();
    }

    Seg.planb = { shots: [[T0, T1, 'Plan B']], draw, post: () => ({}) };
})();
