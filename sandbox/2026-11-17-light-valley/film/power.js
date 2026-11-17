// The power house: shot 4, Upstream (15–18 s), by day, the river pouring through the gorge
// into it; shot 9, The switch (39–42 s), at night inside, the knife switch thrown and the
// film's first ochre.
(() => {
    const C = Corriente, W = C.W, R = C.R, { lerp, poly, fillPoly, boxOf } = C;

    // --- shot 4: upstream (day) --------------------------------------------------------
    const GORGE_L = (x) => 140 + x * 0.55, GORGE_R = (x) => 980 - (x - 700) * 0.0;
    C.shots.upstream = (blk, t, d) => {
        blk.begin();
        blk.base('upstream', (b) => {
            C.day(b);
            C.daySky(b, [0, 0, 1280, 220], { seed: 'up-sky' });
            // the gorge's two walls of rock, black dashes down their faces
            const left = [[-10, 120], [140, 180], [330, 300], [470, 430], [560, 560], [600, 730], [-10, 730]];
            const right = [[1290, 90], [1100, 140], [960, 250], [880, 380], [840, 520], [820, 730], [1290, 730]];
            C.range(b, (x) => (x < 600 ? lerp(120, 560, Math.max(0, x) / 600) : 600), -10, 600, 740, { day: true, seed: 'up-l', ink: 0.4 });
            C.range(b, (x) => (x > 840 ? lerp(520, 90, (x - 840) / 450) : 520), 840, 1290, 740, { day: true, seed: 'up-r', ink: 0.44 });
            void left; void right;
            // the penstock: a pipe down the right wall into the house
            b.ink((g) => { g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.moveTo(1240, 120); g.quadraticCurveTo(1060, 260, 930, 360); g.stroke(); });
            b.cut((g) => { const r = R('pipe'); W.groove(g, [[1236, 116], [1056, 254], [928, 352]], 3, r); for (let i = 0; i < 6; i++) { const f = i / 6, x = lerp(1236, 930, f), y = lerp(118, 356, f) - Math.sin(f * 3.14) * 30; W.groove(g, [[x - 8, y - 6], [x + 6, y + 10]], 1.6, r); } });
            // the house: stone walls, a tiled roof, arched windows, the tailrace arch at the foot
            const wall = [[600, 360], [900, 340], [900, 580], [600, 600]];
            b.hatch({ ink: true, box: boxOf(wall), clip: poly(wall), dir: -0.05, sp: 4, len: [8, 22], gap: [4, 12], wMin: 1, wMax: 3.4, fit: 6, seed: 'ph-wall', tone: (x) => 0.28 + 0.2 * (x - 600) / 300 });
            b.ink((g) => { const r = R('ph'); W.groove(g, [[600, 360], [900, 340], [900, 580], [600, 600], [600, 360]], 3, r); fillPoly(g, [[580, 364], [750, 270], [920, 344], [900, 352], [750, 286], [600, 372]]); });
            b.hatch({ ink: true, box: [580, 270, 920, 372], clip: poly([[580, 364], [750, 270], [920, 344]]), dir: 0, sp: 3.6, len: [6, 16], gap: [2, 6], wMin: 1, wMax: 2.6, fit: 5, seed: 'ph-roof', tone: 0.55 });
            for (const x of [640, 720, 800]) b.ink((g) => { g.beginPath(); g.moveTo(x, 470); g.lineTo(x, 420); g.arc(x + 22, 420, 22, Math.PI, 0); g.lineTo(x + 44, 470); g.closePath(); g.fill(); });
            b.ink((g) => { g.beginPath(); g.moveTo(690, 600); g.lineTo(690, 560); g.arc(750, 560, 60, Math.PI, 0); g.lineTo(810, 596); g.closePath(); g.fill(); });
            // the first wire leaves the roof for the valley, off the right edge
            b.ink((g) => { const r = R('wire0'); for (const x of [700, 760, 820]) { g.fillRect(x - 1.5, 268 - (x - 700) * 0.15, 3, 22); } W.groove(g, C.catenary([820, 262], [1290, 300], 30), 1.4, r, { taper: 2 }); W.groove(g, C.catenary([760, 270], [1290, 320], 34), 1.4, r, { taper: 2 }); });
        });
        // the water: out of the tailrace arch and down the gorge, black dashes running
        blk.ink((g) => {
            const r = R('tail');
            for (let i = 0; i < 70; i++) {
                const u = (r() + d * 0.04) % 1, y = lerp(600, 740, u), half = lerp(50, 300, u), x = 750 + (r() - 0.5) * 2 * half;
                W.gouge(g, x - 10 - u * 30, y, x + 10 + u * 40, y + 1, 1 + u * 2.6, r, { asym: 1.1 });
            }
        });
        // spray at the arch: short white flecks over the black water, flickering per drawing
        blk.cut((g) => { const r = R('spray' + (d % 4)); for (let i = 0; i < 30; i++) { const x = 700 + r() * 100, y = 580 + r() * 30; W.gouge(g, x, y, x + 4 + r() * 8, y - 2 - r() * 6, 1.4, r); } });
    };

    // --- shot 9: the switch (night, inside) ----------------------------------------------
    const LEVER = [640, 470];  // the hinge of the blade
    C.shots.switch = (blk, t, d) => {
        const thrown = 9;
        blk.begin();
        blk.base('switch', (b) => {
            C.night(b);
            // the turbine's housing in the dark, a few edges catching the moon from a window
            b.cut((g) => { const r = R('turb'); g.lineWidth = 2; g.beginPath(); g.arc(240, 620, 170, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); W.groove(g, [[60, 640], [430, 640]], 2, r); for (let i = 0; i < 10; i++) W.groove(g, [[90 + i * 30, 600], [110 + i * 30, 560]], 1.3, r); });
            // the marble panel: a pale slab (carved light), bolts, the gauge, the switch's jaws
            b.cut((g) => g.fillRect(470, 140, 340, 460));
            b.hatch({ ink: true, box: [470, 140, 810, 600], dir: 0.9, sp: 5, len: [20, 70], gap: [20, 60], wMin: 0.9, wMax: 2, fit: 10, seed: 'marble', tone: 0.12 });
            b.ink((g) => { const r = R('panel'); W.groove(g, [[470, 140], [810, 140], [810, 600], [470, 600], [470, 140]], 4, r); for (const [x, y] of [[490, 160], [790, 160], [490, 580], [790, 580]]) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); } g.beginPath(); g.arc(640, 240, 52, 0, 7); g.lineWidth = 5; g.stroke(); g.fillRect(612, 300, 56, 18); g.fillRect(612, 452, 56, 30); });
            // the bulb on its bracket above the panel
            b.ink((g) => { g.fillRect(636, 60, 8, 50); g.beginPath(); g.ellipse(640, 124, 13, 17, 0, 0, 7); g.fill(); });
        });
        // the gauge's needle swings when the current comes
        const k = d - thrown, a = d < thrown ? -2.2 : -2.2 + Math.min(1.5, 1.5 * C.clamp(k / 3)) + (k >= 3 ? Math.sin(k * 0.9) * 0.08 * Math.exp(-k / 8) : 0);
        blk.ink((g) => W.groove(g, [[640, 240], [640 + Math.cos(a) * 42, 240 + Math.sin(a) * 42]], 3, R('needle')));
        // the blade and its handle: up (open), then thrown down into the jaws on the beat
        const ang = d < thrown - 2 ? -1.35 : d < thrown ? lerp(-1.35, -0.4, (d - thrown + 2) / 2) : Math.PI / 2 - 0.02;
        const tip = [LEVER[0] + Math.cos(ang) * 150, LEVER[1] + Math.sin(ang) * 150];
        blk.ink((g) => { g.lineWidth = 11; g.lineCap = 'butt'; g.beginPath(); g.moveTo(LEVER[0], LEVER[1]); g.lineTo(tip[0], tip[1]); g.stroke(); g.lineWidth = 16; g.beginPath(); g.moveTo(tip[0] + Math.cos(ang) * 4, tip[1] + Math.sin(ang) * 4); g.lineTo(tip[0] + Math.cos(ang) * 44, tip[1] + Math.sin(ang) * 44); g.stroke(); });
        blk.cut((g) => W.groove(g, [[LEVER[0] + 3, LEVER[1]], [tip[0] + 3, tip[1]]], 2, R('blade')));
        // the hand on the handle (a fist from the dark), until it lets go after the throw
        if (d < thrown + 8) {
            const hx = tip[0] + Math.cos(ang) * 30, hy = tip[1] + Math.sin(ang) * 30;
            blk.ink((g) => { g.beginPath(); g.ellipse(hx, hy, 22, 18, ang, 0, 7); g.fill(); g.lineWidth = 34; g.lineCap = 'round'; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + 240, hy + 160); g.stroke(); });
            blk.cut((g) => { const r = R('hand'); W.groove(g, [[hx - 18, hy - 8], [hx - 6, hy - 18], [hx + 12, hy - 16]], 1.4, r); for (let i = 0; i < 3; i++) W.gouge(g, hx - 10 + i * 8, hy - 2, hx - 6 + i * 8, hy + 10, 1, r); W.groove(g, [[hx + 20, hy - 10], [hx + 240, hy + 140]], 1.6, r); });
        }
        // the first ochre: the bulb comes on as the blade closes
        if (d >= thrown + 1) C.bulb(blk, 640, 124, 11, 14, d - thrown - 1, { rays: 7, ring: 2.4 });
        if (d >= thrown + 2) blk.ochre((g) => { const p = C.clamp((d - thrown - 1) / 3); g.beginPath(); g.moveTo(560, 140); g.lineTo(720, 140); g.lineTo(800 + 40 * p, 600); g.lineTo(480 - 40 * p, 600); g.closePath(); g.globalAlpha = 0.85; g.fill(); });
    };
})();
