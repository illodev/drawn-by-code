// The work, by day (paper is the daylight, the drawing is the black left standing):
// shot 5, The drum (18–21 s); shot 6, The pole (21–27 s); shot 7, The span (27–30 s); and
// the day inserts of the nights (a hammer, a tamping bar, the drum on its stand).
(() => {
    const C = Corriente, W = C.W, R = C.R, { lerp, poly, fillPoly, boxOf } = C;

    // --- bodies -------------------------------------------------------------------------
    // a two-bone arm or leg from a root to a target: the joint bends to the side given
    function ik(a, t, l1, l2, bend) {
        const dx = t[0] - a[0], dy = t[1] - a[1], D = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01);
        const ang = Math.atan2(dy, dx), c = (l1 * l1 + D * D - l2 * l2) / (2 * l1 * D), off = Math.acos(C.clamp(c, -1, 1)) * bend;
        const j = [a[0] + Math.cos(ang + off) * l1, a[1] + Math.sin(ang + off) * l1];
        const e = [a[0] + Math.cos(ang) * D, a[1] + Math.sin(ang) * D];
        return [j, e];
    }
    // a worker: hips at (x, y), leaning lean (radians, + forwards to the facing side), hands
    // reaching for two targets, feet planted; f = 1 faces right, −1 left. s = scale (1 ≈ 180 tall)
    function worker(x, y, o) {
        const s = o.s ?? 1, f = o.f ?? 1, lean = o.lean ?? 0;
        const hip = [x, y], up = [Math.sin(lean) * f, -Math.cos(lean)];
        const sh = [x + up[0] * 62 * s, y + up[1] * 62 * s], head = [sh[0] + up[0] * 26 * s + f * 3 * s, sh[1] + up[1] * 26 * s];
        const P = { head, neck: [sh[0] + up[0] * 10 * s, sh[1] + up[1] * 10 * s], shoulderL: [sh[0] - f * 9 * s, sh[1] + 2 * s], shoulderR: [sh[0] + f * 9 * s, sh[1]], hipL: [x - f * 8 * s, y], hipR: [x + f * 8 * s, y] };
        const [eL, hL] = ik(P.shoulderL, o.handL, 30 * s, 28 * s, -f), [eR, hR] = ik(P.shoulderR, o.handR, 30 * s, 28 * s, -f);
        Object.assign(P, { elbowL: eL, handL: hL, elbowR: eR, handR: hR });
        const [kL, fL] = ik(P.hipL, o.footL, 42 * s, 42 * s, f), [kR, fR] = ik(P.hipR, o.footR, 42 * s, 42 * s, f);
        Object.assign(P, { kneeL: kL, footL: fL, kneeR: kR, footR: fR });
        return P;
    }
    function drawWorker(b, P, o = {}) {
        b.ink((g) => C.figure(g, P, { limb: 11, scale: o.s ?? 1, cap: true, face: o.f ?? 1 }));
        b.cut((g) => C.figureCuts(g, P, { limb: 11, scale: o.s ?? 1, seed: o.seed ?? 'w', side: -(o.f ?? 1), folds: 3, w: 1.6 }));
    }
    // the mule, in profile facing right, a walk cycle of four drawings, the cable drum on its pack
    function mule(b, x, y, s, step, o = {}) {
        const ph = step % 4, leg = (i) => Math.sin((ph + i) * Math.PI / 2) * 12 * s;
        b.ink((g) => {
            g.beginPath(); g.ellipse(x, y, 62 * s, 28 * s, 0, 0, 7); g.fill();
            fillPoly(g, [[x + 46 * s, y - 14 * s], [x + 70 * s, y - 58 * s], [x + 84 * s, y - 52 * s], [x + 64 * s, y]]);
            g.beginPath(); g.ellipse(x + 88 * s, y - 52 * s, 22 * s, 11 * s, 0.5, 0, 7); g.fill();
            fillPoly(g, [[x + 72 * s, y - 64 * s], [x + 70 * s, y - 92 * s], [x + 80 * s, y - 66 * s]]);
            fillPoly(g, [[x + 80 * s, y - 64 * s], [x + 84 * s, y - 90 * s], [x + 88 * s, y - 62 * s]]);
            g.lineWidth = 9 * s; g.lineCap = 'round';
            for (const [i, lx] of [[0, -44], [1, -30], [2, 34], [3, 48]].map(([i, l]) => [i, l])) { g.beginPath(); g.moveTo(x + lx * s, y + 10 * s); g.lineTo(x + lx * s + leg(i), y + 58 * s); g.stroke(); }
            g.lineWidth = 4 * s; g.beginPath(); g.moveTo(x - 60 * s, y - 6 * s); g.quadraticCurveTo(x - 80 * s, y + 10 * s, x - 74 * s, y + 36 * s); g.stroke();
        });
        b.cut((g) => { const r = R('mule'); W.groove(g, [[x - 50 * s, y - 18 * s], [x + 40 * s, y - 24 * s]], 1.6 * s, r); W.groove(g, [[x + 50 * s, y - 20 * s], [x + 72 * s, y - 52 * s]], 1.4 * s, r); g.beginPath(); g.arc(x + 92 * s, y - 56 * s, 2 * s, 0, 7); g.fill(); });
        if (o.drum !== false) {
            const cx = x - 4 * s, cy = y - 46 * s, rr = 34 * s, a = (o.turn ?? 0);
            b.ink((g) => { g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.fill(); });
            b.cut((g) => { const r = R('drum'); g.lineWidth = 1.6 * s; for (let i = 1; i <= 4; i++) { g.beginPath(); g.arc(cx, cy, rr * (0.3 + i * 0.16), 0, 7); g.stroke(); } for (let i = 0; i < 6; i++) { const q = a + i * Math.PI / 3; W.groove(g, [[cx, cy], [cx + Math.cos(q) * rr * 0.9, cy + Math.sin(q) * rr * 0.9]], 1.4 * s, r); } });
        }
        return [x - 4 * s, y - 46 * s];
    }

    // a day landscape behind the work: mountains, the valley far below, a line of poles
    function dayBack(b, horizon, o = {}) {
        C.day(b);
        C.daySky(b, [0, 0, 1280, horizon], { seed: (o.seed ?? 'db') + 'sky' });
        C.range(b, (x) => horizon - 40 - 90 * Math.max(0, Math.sin(x / 260 + (o.ph ?? 0.3))) - 30 * Math.sin(x / 90), -10, 1290, horizon + 220, { day: true, seed: (o.seed ?? 'db') + 'far', ink: 0.26 });
    }

    // --- shot 5: the drum (18–21 s) ------------------------------------------------------
    C.shots.drum = (blk, t, d) => {
        blk.begin();
        // the slope and the switchback path, rising to the right
        blk.base('drum', (b) => {
            dayBack(b, 230, { seed: 'drum', ph: 1.2 });
            const slope = [[-10, 330], [1290, 210], [1290, 730], [-10, 730]];
            b.hatch({ ink: true, box: boxOf(slope), clip: poly(slope), dir: 0.9, sp: 5, len: [10, 30], gap: [10, 26], run: [1, 3], wMin: 1, wMax: 4, fit: 8, seed: 'drum-slope', tone: (x, y) => 0.18 + 0.2 * C.sstep(330, 700, y) });
            b.ink((g) => { const r = R('path'); W.groove(g, [[-10, 560], [1290, 420]], 2.6, r, { taper: 10 }); W.groove(g, [[-10, 600], [1290, 458]], 1.8, r, { taper: 10 }); });
            b.cut((g) => g.fill(new Path2D('M-10 563 L1290 423 L1290 455 L-10 597 Z')));
        });
        // the mule climbs the path, the muleteer ahead; the wire pays out behind the drum
        const u = t / 3, mx = lerp(300, 760, u), my = 560 - (mx + 10) * 0.108 - 52;
        const step = d;
        const hub = mule(blk, mx, my, 1.25, step, { turn: -d * 0.35 });
        const man = worker(mx + 200, my + 22, { s: 1.05, f: 1, lean: 0.12, handL: [mx + 150, my - 50], handR: [mx + 214, my - 4], footL: [mx + 186 + (d % 4 < 2 ? 10 : -10), my + 112], footR: [mx + 214 + (d % 4 < 2 ? -10 : 10), my + 108] });
        drawWorker(blk, man, { s: 1.05, f: 1, seed: 'muleteer' });
        blk.ink((g) => { const r = R('halter'); W.groove(g, [[mx + 104, my - 48], [mx + 150, my - 50]], 1.6, r); W.groove(g, C.catenary([hub[0] - 30, hub[1] + 10], [-20, 600], 14), 2, r, { taper: 2 }); });
    };

    // --- shot 6: the pole (21–27 s) --------------------------------------------------------
    const FOOT = [720, 538], POLE_L = 400;
    C.shots.pole = (blk, t, d) => {
        blk.begin();
        blk.base('pole', (b) => {
            dayBack(b, 250, { seed: 'pole', ph: 0.2 });
            // the far valley at the lower right: a few roofs and the poles already standing
            b.ink((g) => { const r = R('farv'); for (let i = 0; i < 9; i++) { const x = 1000 + i * 30, y = 600 + (i % 3) * 8; g.fillRect(x, y, 22, 12); } for (let i = 0; i < 4; i++) { const x = 900 + i * 90, y = 470 + i * 34; g.fillRect(x, y - 70 + i * 8, 4, 70 - i * 8); g.fillRect(x - 10, y - 66 + i * 8, 24, 3); } });
            const slope = [[-10, 330], [1290, 650], [1290, 730], [-10, 730]];
            b.hatch({ ink: true, box: boxOf(slope), clip: poly(slope), dir: 0.55, sp: 4.4, len: [10, 34], gap: [8, 22], run: [1, 3], wMin: 1, wMax: 4.5, fit: 8, seed: 'pole-slope', tone: (x, y) => 0.24 + 0.28 * C.sstep(330, 720, y) });
            b.ink((g) => W.groove(g, [[-10, 330], [1290, 650]], 2.4, R('slopeedge'), { taper: 10 }));
            b.ink((g) => { g.beginPath(); g.ellipse(FOOT[0], FOOT[1] + 6, 30, 9, 0.24, 0, 7); g.fill(); });
        });
        // the pole's angle: lying on the shear legs, raised in three pulls, dropped on the bar
        const pulls = [9, 18, 27], drop = 36;
        let a = 0.42; for (const p of pulls) a += 0.27 * C.clamp((d - p + 1) / 3);
        if (d >= drop) a = Math.PI / 2;
        const sink = d >= drop ? Math.min(10, (d - drop + 1) * 5) : 0;
        const base = [FOOT[0] - Math.cos(a) * 30, FOOT[1] + sink], top = [base[0] - Math.cos(a) * POLE_L, base[1] - Math.sin(a) * POLE_L];
        const pull = pulls.some((p) => d >= p && d < p + 3);
        // the shear legs (an A frame) under the pole until it stands
        if (d < drop) blk.ink((g) => { const cx = lerp(base[0], top[0], 0.55), cy = lerp(base[1], top[1], 0.55); g.lineWidth = 9; g.beginPath(); g.moveTo(cx - 60, 560); g.lineTo(cx, cy); g.lineTo(cx + 40, 600); g.stroke(); });
        blk.ink((g) => { g.lineWidth = 16; g.lineCap = 'butt'; g.beginPath(); g.moveTo(base[0], base[1]); g.lineTo(top[0], top[1]); g.stroke(); const ca = Math.cos(a), sa = Math.sin(a); g.lineWidth = 6; g.beginPath(); g.moveTo(top[0] + sa * 40 + ca * 18, top[1] - ca * 40 + sa * 18); g.lineTo(top[0] - sa * 40 + ca * 18, top[1] + ca * 40 + sa * 18); g.stroke(); });
        blk.cut((g) => { const r = R('pole'); W.groove(g, [[base[0] + 4 * Math.sin(a), base[1]], [top[0] + 4 * Math.sin(a), top[1]]], 2.2, r, { taper: 8 }); for (let i = 0; i < 5; i++) { const f = 0.15 + i * 0.17; W.gouge(g, lerp(base[0], top[0], f), lerp(base[1], top[1], f), lerp(base[0], top[0], f + 0.08), lerp(base[1], top[1], f + 0.08), 1.2, r); } });
        // the ropes from the pole's top down to the two haulers uphill
        const lean = pull ? 0.42 : 0.12, hx = pull ? -16 : 0;
        const H1 = worker(240 + hx, 362, { s: 1.15, f: -1, lean, handL: [280 + hx, 318 + (pull ? 14 : 0)], handR: [300 + hx, 322 + (pull ? 14 : 0)], footL: [210, 474], footR: [290, 492] });
        const H2 = worker(390 + hx, 404, { s: 1.15, f: -1, lean, handL: [430 + hx, 362 + (pull ? 14 : 0)], handR: [450 + hx, 366 + (pull ? 14 : 0)], footL: [360, 520], footR: [440, 536] });
        blk.ink((g) => { const r = R('ropes'); W.groove(g, [[top[0], top[1] + 10], [H1.handR[0], H1.handR[1]], [H1.handL[0] - 60, H1.handL[1] + 24]], 2.4, r, { taper: 2 }); W.groove(g, [[top[0], top[1] + 16], [H2.handR[0], H2.handR[1]], [H2.handL[0] - 50, H2.handL[1] + 26]], 2.4, r, { taper: 2 }); });
        drawWorker(blk, H1, { s: 1.15, f: -1, seed: 'h1' });
        drawWorker(blk, H2, { s: 1.15, f: -1, seed: 'h2' });
        // the man with the pike pushing at mid pole, the man at the foot with the bar
        const mid = [lerp(base[0], top[0], 0.4), lerp(base[1], top[1], 0.4)];
        const pike = worker(mid[0] + 150, 560, { s: 1.15, f: -1, lean: pull ? 0.5 : 0.3, handL: [mid[0] + 60, mid[1] + 40], handR: [mid[0] + 100, mid[1] + 70], footL: [mid[0] + 120, 676], footR: [mid[0] + 200, 690] });
        blk.ink((g) => { g.lineWidth = 6; g.beginPath(); g.moveTo(mid[0], mid[1]); g.lineTo(mid[0] + 130, mid[1] + 110); g.stroke(); });
        drawWorker(blk, pike, { s: 1.15, f: -1, seed: 'pike' });
        const bar = worker(FOOT[0] + 110, 580, { s: 1.1, f: -1, lean: 0.6, handL: [FOOT[0] + 40, FOOT[1] - 30], handR: [FOOT[0] + 66, FOOT[1] - 50], footL: [FOOT[0] + 90, 690], footR: [FOOT[0] + 150, 700] });
        blk.ink((g) => { g.lineWidth = 5; g.beginPath(); g.moveTo(FOOT[0] + 10, FOOT[1] + 6); g.lineTo(FOOT[0] + 80, FOOT[1] - 70); g.stroke(); });
        drawWorker(blk, bar, { s: 1.1, f: -1, seed: 'bar' });
        // the mule with the drum waits at the left, ears turning
        mule(blk, 120, 560, 0.9, 0, { turn: 0.4 });
        // dust at the foot when the pole drops
        if (d >= drop && d < drop + 8) blk.ink((g) => { const r = R('dust' + d); for (let i = 0; i < 18; i++) { const a2 = Math.PI + r() * Math.PI, rr = 20 + (d - drop) * 8 * r(); W.gouge(g, FOOT[0] + Math.cos(a2) * rr, FOOT[1] + Math.sin(a2) * rr * 0.4, FOOT[0] + Math.cos(a2) * (rr + 8), FOOT[1] + Math.sin(a2) * (rr + 8) * 0.4, 1.4, r); } });
    };

    // --- shot 7: the span (27–30 s): the lineman at the top pulls the wire taut ------------
    C.shots.span = (blk, t, d) => {
        const taut = 18;
        blk.begin();
        blk.base('span', (b) => {
            C.day(b);
            C.daySky(b, [0, 0, 1280, 720], { seed: 'span-sky', dark: 0.22 });
            // the pole from below, tapering up to the crossarm; the next pole far down the slope
            b.ink((g) => { fillPoly(g, [[600, 730], [660, 730], [646, 190], [614, 190]]); g.fillRect(500, 196, 260, 14); for (const x of [516, 630, 744]) { g.fillRect(x - 5, 172, 10, 26); g.beginPath(); g.ellipse(x, 172, 9, 6, 0, 0, 7); g.fill(); } g.fillRect(1080, 470, 6, 260); g.fillRect(1062, 474, 42, 4); });
            b.cut((g) => { const r = R('spanpole'); W.groove(g, [[619, 196], [606, 726]], 2.4, r); for (let i = 0; i < 9; i++) W.gouge(g, 620 + i % 2 * 12, 260 + i * 50, 628 + i % 2 * 12, 300 + i * 50, 1.3, r); });
            b.ink((g) => { g.beginPath(); g.moveTo(-10, 760); g.lineTo(1290, 650); g.lineTo(1290, 730); g.lineTo(-10, 730); g.fill(); });
        });
        // the lineman: legs round the pole, spurs dug in, his belt round it; he pulls the wire
        const pull = d >= taut - 3 && d < taut;
        const L = worker(596, 330, { s: 1.15, f: 1, lean: pull ? -0.35 : -0.1, handL: [pull ? 520 : 560, pull ? 230 : 250], handR: [740, 190], footL: [610, 430], footR: [650, 420] });
        drawWorker(blk, L, { s: 1.15, f: 1, seed: 'lineman' });
        blk.ink((g) => { g.lineWidth = 4; g.beginPath(); g.ellipse(632, 330, 36, 10, 0, 0, 7); g.stroke(); });
        // the wire: slack (a deep sag off to the left), snapping to a taut catenary on the beat
        const sag = d < taut ? 160 - (pull ? (d - taut + 3) * 30 : 0) : 26 + Math.max(0, 10 - (d - taut) * 4) * Math.cos((d - taut) * 1.8);
        blk.ink((g) => { const r = R('span-wire'); W.groove(g, C.catenary([-20, 250], [744, 168], sag), 2.4, r, { taper: 2 }); if (d >= taut) W.groove(g, C.catenary([744, 168], [1083, 474], 40), 2, r, { taper: 2 }); });
    };

    // --- the day inserts between the nights (1.5 s each) ------------------------------------
    C.shots.insert = (blk, t, d, env, v) => {
        blk.begin();
        blk.base('insert' + v, (b) => {
            C.day(b);
            const ground = [[-10, 470], [1290, 430], [1290, 730], [-10, 730]];
            b.hatch({ ink: true, box: boxOf(ground), clip: poly(ground), dir: 0.08, sp: 4, len: [10, 40], gap: [6, 22], wMin: 1, wMax: 4, fit: 8, seed: 'ins' + v, tone: 0.34 });
            C.daySky(b, [0, 0, 1280, 450], { seed: 'inssky' + v });
        });
        const k = d % 18;
        if (v === 0) {
            // a sledgehammer drives a stake: up, then down on the beat, dust flying
            const a = k < 7 ? lerp(-2.4, -2.9, k / 7) : k < 9 ? lerp(-2.9, -1.2, (k - 7) / 2) : -1.2;
            const pivot = [520, 300], head = [pivot[0] + Math.cos(a + Math.PI) * -260, pivot[1] + Math.sin(a + Math.PI) * -260];
            blk.ink((g) => { g.fillRect(616, 330, 40, 160); g.lineWidth = 12; g.beginPath(); g.moveTo(pivot[0] - 140, pivot[1] + 120); g.lineTo(head[0], head[1]); g.stroke(); g.save(); g.translate(head[0], head[1]); g.rotate(a); g.fillRect(-22, -40, 44, 80); g.restore(); g.lineWidth = 46; g.lineCap = 'round'; g.beginPath(); g.moveTo(pivot[0] - 140, pivot[1] + 120); g.lineTo(-60, 560); g.stroke(); });
            if (k >= 9 && k < 14) blk.ink((g) => { const r = R('chips' + k); for (let i = 0; i < 16; i++) { const q = -Math.PI * r(), rr = 30 + (k - 9) * 14; W.gouge(g, 636 + Math.cos(q) * rr, 330 + Math.sin(q) * rr * 0.6, 636 + Math.cos(q) * (rr + 9), 330 + Math.sin(q) * (rr + 9) * 0.6, 2, r); } });
        } else if (v === 1) {
            // a tamping bar packs the earth round a pole's foot, two strokes
            const y = 360 + Math.abs(Math.sin((k / 18) * Math.PI * 2)) * 70;
            blk.ink((g) => { g.fillRect(620, -10, 46, 520); g.lineWidth = 9; g.beginPath(); g.moveTo(480, y - 260); g.lineTo(560, y + 80); g.stroke(); g.lineWidth = 40; g.lineCap = 'round'; g.beginPath(); g.moveTo(500, y - 170); g.lineTo(200, y - 300); g.stroke(); g.beginPath(); g.moveTo(520, y - 90); g.lineTo(260, y - 200); g.stroke(); });
            blk.cut((g) => W.groove(g, [[630, 0], [630, 500]], 3, R('ipole')));
        } else {
            // the drum on its stand turns, the wire running off it up the slope
            const cx = 520, cy = 340;
            blk.ink((g) => { g.lineWidth = 12; g.beginPath(); g.moveTo(cx - 120, 520); g.lineTo(cx, cy); g.lineTo(cx + 120, 520); g.stroke(); g.beginPath(); g.arc(cx, cy, 150, 0, 7); g.fill(); W.groove(g, [[cx + 150, cy - 30], [1290, 120]], 3, R('iwire'), { taper: 2 }); });
            blk.cut((g) => { const r = R('idrum'); g.lineWidth = 3; for (let i = 1; i <= 5; i++) { g.beginPath(); g.arc(cx, cy, 30 + i * 22, 0, 7); g.stroke(); } for (let i = 0; i < 6; i++) { const q = -d * 0.2 + i * Math.PI / 3; W.groove(g, [[cx, cy], [cx + Math.cos(q) * 140, cy + Math.sin(q) * 140]], 3, r); } });
        }
    };
})();
