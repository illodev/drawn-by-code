// Card «balloons» (reference 12.25–12.375 s, full frame): hot-air balloons over layered
// hills at sunrise. Yellow sky with a pink screen at the top, a paper sun, pink and purple
// screened far hills, green (yellow + blue) near hills with tree clumps; six balloons (a big
// pink one with a zigzag and a white dotted band, a blue one, a striped one, a yellow one and
// two small ones). Measured on the 12.33 s frame in 1000 × 1000 units. The balloons bob on
// twos. Needs cards/_g4-util.js.
var CARDS = CARDS || {};
CARDS.balloons = (press, t) => {
    const U = G4, T = U.T, d = Math.floor(t * 12 + 1e-6);
    const Y = press.plate('yellow'), P = press.plate('pink'), B = press.plate('blue'), N = press.plate('navy');
    const YS = press.plate('yellow', 'screen'), PS = press.plate('pink', 'screen'), BS = press.plate('blue', 'screen'), NS = press.plate('navy', 'screen');
    const INK = { y: [Y], r: [Y, P], p: [P], g: [Y, B], b: [B], n: [N], w: [] };
    const all = (c, fn) => (INK[c] ?? []).forEach(fn);

    // sky: yellow, a pink screen coming in at the top; the sun: paper in a pale halo
    Y.fillStyle = U.lin(Y, 0, 150, 0, 300, [[0, 0], [1, 1]]); Y.fillRect(0, 150, 1000, 550);
    YS.fillStyle = U.lin(YS, 0, 0, 0, 300, [[0, 0.2], [1, 1]]); YS.fillRect(0, 0, 1000, 300);
    PS.fillStyle = U.lin(PS, 0, 0, 0, 260, [[0, 0.38], [0.5, 0.2], [1, 0]]); PS.fillRect(0, 0, 1000, 300);
    U.erase([Y], (g) => { g.fillStyle = U.rad(g, 715, 490, 100, 190, [[0, 0.6], [1, 0]]); g.fillRect(450, 250, 550, 450); });
    YS.fillStyle = U.rad(YS, 715, 490, 100, 190, [[0, 0.6], [1, 0]]); YS.fillRect(450, 250, 550, 450);
    press.knockout((g) => { g.beginPath(); g.arc(715, 490, 104, 0, 7); g.fill(); });
    Y.lineWidth = 2.5; Y.strokeStyle = T(1); Y.beginPath(); Y.arc(715, 490, 124, Math.PI * 1.05, Math.PI * 1.95); Y.stroke();

    // hills, back to front
    const hill = (topPts, fill, outline = true) => {
        const pts = [[-10, topPts[0][1]], ...topPts, [1010, topPts[topPts.length - 1][1]], [1010, 1010], [-10, 1010]];
        press.knockout((g) => { U.smooth(g, pts, true); g.fill(); });
        fill((g) => U.smooth(g, pts, true, false));
        if (outline) U.sline(B, [[-10, topPts[0][1]], ...topPts, [1010, topPts[topPts.length - 1][1]]], 2.5, 1);
    };
    const fillWith = (list) => (shape) => { for (const [g, v] of list) U.clip(g, shape, (c) => { c.fillStyle = typeof v === 'number' ? T(v) : v; c.fillRect(0, 0, 1000, 1000); }); };
    hill([[0, 512], [100, 515], [200, 524], [300, 530], [400, 535], [500, 540], [560, 553], [650, 565], [750, 580], [850, 598], [1000, 600]], fillWith([[PS, 0.5], [NS, 0.12]]));
    hill([[0, 572], [100, 580], [200, 598], [300, 604], [400, 598], [500, 590], [600, 591], [700, 602], [780, 620], [860, 640], [1000, 642]], fillWith([[PS, 0.42], [NS, 0.14], [BS, 0.08]]));
    hill([[0, 660], [150, 700], [300, 700], [450, 690], [600, 718], [750, 733], [900, 700], [1000, 690]], fillWith([[PS, 0.35], [NS, 0.28], [YS, 0.2]]));
    const greenTop = [[0, 718], [100, 716], [200, 742], [300, 778], [400, 776], [500, 790], [600, 808], [700, 800], [800, 810], [900, 822], [1000, 820]];
    hill(greenTop, fillWith([[Y, 1], [BS, 0.55]]));
    hill([[0, 870], [200, 850], [400, 832], [600, 850], [800, 862], [1000, 848]], fillWith([[Y, 1], [BS, 0.38]]), false);
    // tree clumps: solid blue on the yellow (dark green), fringed blobs
    const tr = Motion.rng('trees');
    const clump = (x, y, r) => { const pts = []; for (let i = 0; i < 10; i++) { const a = (i / 10) * 6.28, k = 0.75 + 0.35 * tr(); pts.push([x + Math.cos(a) * r * k, y + Math.sin(a) * r * 0.8 * k]); } U.blob(B, pts, 1); };
    B.save(); B.beginPath(); U.smooth(B, [[-10, 718], ...greenTop, [1010, 820], [1010, 1010], [-10, 1010]], true, false); B.clip();
    for (let i = 0; i < 60; i++) { const x = tr() * 1000, y = 740 + tr() * 200 + x * 0.04; clump(x, y, 10 + tr() * 22); }
    B.restore();
    const dk = [[-10, 955], [60, 935], [150, 950], [260, 930], [380, 950], [520, 940], [640, 925], [720, 945], [820, 935], [920, 950], [1010, 940], [1010, 1010], [-10, 1010]];
    U.blob(B, dk, 1); U.blob(NS, dk, 0.45);

    // a balloon: an envelope (round top, tapering to the neck), gores, bands, ropes, basket
    const balloon = (o) => {
        const { cx, cy, rx, ry, ny } = o;
        const half = (y) => { // half width at y
            if (y <= cy) return rx * Math.sqrt(Math.max(0, 1 - ((y - cy) / ry) ** 2));
            const f = (y - cy) / (ny - cy); return rx * Math.max(0.16, Math.cos(f * Math.PI / 2) ** 0.9 * (1 - 0.1 * f));
        };
        const outline = [];
        for (let i = 0; i <= 24; i++) { const y = cy - ry + ((ny - cy + ry) * i) / 24; outline.push([cx + half(y), y]); }
        for (let i = 24; i >= 0; i--) { const y = cy - ry + ((ny - cy + ry) * i) / 24; outline.push([cx - half(y), y]); }
        const env = (g) => U.path(g, outline);
        press.knockout((g) => { env(g); g.fill(); });
        // gores as stripes: u from -1 to 1 across; each gore its own inks
        const gore = (u0, u1) => { const pts = []; for (let i = 0; i <= 24; i++) { const y = cy - ry + ((ny - cy + ry) * i) / 24; pts.push([cx + half(y) * u0, y]); } for (let i = 24; i >= 0; i--) { const y = cy - ry + ((ny - cy + ry) * i) / 24; pts.push([cx + half(y) * u1, y]); } return pts; };
        const n = o.stripes ? o.stripes.length : 8;
        const us = []; for (let i = 0; i <= n; i++) us.push(Math.sin(-Math.PI / 2 + (Math.PI * i) / n));
        if (o.stripes) o.stripes.forEach((c, i) => all(c, (g) => U.poly(g, gore(us[i], us[i + 1]), 1)));
        else all(o.base, (g) => U.poly(g, outline, 1));
        for (const b of o.bands ?? []) b(env, half);
        // shade on the right: a navy screen ramp
        U.clip(NS, env, (c) => { c.fillStyle = U.lin(c, cx + rx * 0.1, 0, cx + rx, 0, [[0, 0], [1, o.shade ?? 0.45]]); c.fillRect(cx - rx, cy - ry, 2 * rx, ny - cy + ry); });
        for (let i = 1; i < n; i++) { const p = gore(us[i], us[i]).slice(0, 25); U.sline(B, p, o.lw ?? 2.5, 1); }
        U.sline(B, outline.concat([outline[0]]), o.lw ? o.lw + 1 : 3.5, 1);
        // ropes and basket
        const bw = o.bw ?? rx * 0.3, by = o.by ?? ny + rx * 0.35;
        U.seg(B, [[cx - half(ny) * 0.9, ny], [cx - bw / 2, by]], 1.6, 1);
        U.seg(B, [[cx + half(ny) * 0.9, ny], [cx + bw / 2, by]], 1.6, 1);
        for (const g of [Y, P]) U.poly(g, [[cx - bw / 2, by], [cx + bw / 2, by], [cx + bw * 0.45, by + bw * 0.5], [cx - bw * 0.45, by + bw * 0.5]], 1);
        U.poly(NS, [[cx - bw / 2, by], [cx + bw / 2, by], [cx + bw * 0.45, by + bw * 0.5], [cx - bw * 0.45, by + bw * 0.5]], 0.5);
    };
    const bob = [0, -3, -5, -3, 0, 2][d % 6];
    const zig = (x0, x1, y, h, step) => { const top = [], bot = []; for (let x = x0, k = 0; x <= x1 + step; x += step / 2, k++) { const yy = y + (k % 2 ? h : 0); top.push([x, yy]); bot.push([x, yy + h * 1.2]); } return top.concat(bot.reverse()); };

    // 5 · the small balloon top left, striped
    balloon({ cx: 135, cy: 42 + bob, rx: 32, ry: 36, ny: 82 + bob, stripes: ['r', 'g', 'y', 'r', 'g', 'y'], lw: 1.6, bw: 12, shade: 0.3 });
    // 2 · the blue balloon at the top: white zigzag, a green dotted band, navy skirt
    balloon({ cx: 590, cy: 92 + bob, rx: 62, ry: 56, ny: 162 + bob, base: 'b', lw: 2, bw: 20, shade: 0.35, bands: [
        (env) => { press.save(); press.clip(env); press.knockout((g) => { U.path(g, zig(520, 660, 70 + bob, 12, 34)); g.fill(); }); for (let x = 540; x < 650; x += 18) { U.disc(Y, x, 118 + bob, 7, 1); } U.poly(N, [[520, 135 + bob], [660, 135 + bob], [660, 170 + bob], [520, 170 + bob]], 1); press.restore(); },
    ] });
    // 3 · the striped balloon on the right
    balloon({ cx: 805, cy: 290 + bob, rx: 95, ry: 112, ny: 408 + bob, stripes: ['r', 'y', 'r', 'g', 'y', 'r', 'g', 'y', 'r', 'g'], lw: 2.2, bw: 26, by: 432 + bob, shade: 0.4 });
    // 4 · the yellow balloon over the hills: red zigzag, green bands
    balloon({ cx: 918, cy: 622 + bob, rx: 60, ry: 55, ny: 700 + bob, base: 'y', lw: 2, bw: 16, shade: 0.3, bands: [
        (env) => { press.save(); press.clip(env); U.poly(P, zig(850, 990, 598 + bob, 10, 26), 1); for (const y of [630, 650]) { U.poly(B, [[850, y + bob], [990, y + bob], [990, y + 9 + bob], [850, y + 9 + bob]], 1); } press.restore(); },
    ] });
    // 6 · the small balloon low in the middle: pink, white, red and blue gores
    balloon({ cx: 655, cy: 762 + bob, rx: 32, ry: 36, ny: 805 + bob, stripes: ['p', 'w', 'r', 'w', 'b', 'p'], lw: 1.5, bw: 10, shade: 0.25 });
    // 1 · the big pink balloon: red zigzag band, white band with blue dots, a red band, a
    // white hatched highlight
    balloon({ cx: 288, cy: 300 + bob, rx: 158, ry: 152, ny: 480 + bob, base: 'p', lw: 2.6, bw: 56, by: 535 + bob, shade: 0.5, bands: [
        (env) => {
            press.save(); press.clip(env);
            U.poly(Y, zig(120, 460, 228 + bob, 32, 66), 1);
            press.knockout((g) => { g.beginPath(); g.moveTo(120, 305 + bob); g.quadraticCurveTo(290, 298 + bob, 460, 305 + bob); g.lineTo(460, 350 + bob); g.quadraticCurveTo(290, 356 + bob, 120, 348 + bob); g.closePath(); g.fill(); });
            BS.fillStyle = U.lin(BS, 330, 0, 450, 0, [[0, 0], [1, 0.55]]); BS.fillRect(300, 300 + bob, 160, 55);
            for (let i = 0; i < 9; i++) U.disc(B, 147 + i * 35, 330 + bob, 9 - Math.abs(i - 4) * 0.4, 1);
            U.poly(Y, [[120, 385 + bob], [460, 385 + bob], [460, 420 + bob], [120, 420 + bob]], 1);
            U.poly(Y, [[120, 452 + bob], [460, 452 + bob], [460, 500 + bob], [120, 500 + bob]], 1);
            press.knockout((g) => { g.lineWidth = 3; g.lineCap = 'round'; for (let i = 0; i < 9; i++) { const x = 175 + i * 12, y = 175 + (i % 3) * 18 + bob; g.beginPath(); g.moveTo(x, y + 40); g.lineTo(x + 38, y); g.stroke(); } });
            press.restore();
        },
    ] });
};
