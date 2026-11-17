// Woodcut style template: a corner of a village at night cut in a plank and printed. The
// sky in long horizontal cuts, a slope in flicks that run downhill, a stone house, and a
// street lamp that comes on: its bulb is carved out, its cone carved down from the hood
// over three drawings, the ochre block prints the light and the black left standing in it.
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1280, 720],
    uses: ['styles/woodcut/woodcut.js'],
    shots: [[0, 4, 'Template']],
    setup(env) {
        return { blk: Woodcut.block(env) };
    },
    draw(g, t, env) {
        const { blk } = env.state, W = Woodcut, d = Math.floor(t * 12 + 1e-6);
        const ss = (a, b, x) => { const u = W.clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
        const ridge = (x) => 300 + 90 * Math.sin(x / 210 + 0.6) + 30 * Math.sin(x / 70);
        const slope = (g2) => { g2.moveTo(-10, 730); for (let x = -10; x <= 1290; x += 10) g2.lineTo(x, ridge(x)); g2.lineTo(1290, 730); g2.closePath(); };
        const wall = [[640, 330], [1000, 260], [1000, 640], [640, 640]];
        const roof = (g2) => { g2.moveTo(612, 340); g2.lineTo(1000, 236); g2.lineTo(1010, 250); g2.lineTo(640, 350); g2.closePath(); };
        const L = { x: 470, y: 330, hw: 28 };
        blk.begin();
        blk.base('night', (b) => {
            b.ink((k) => k.fillRect(-10, -10, 1300, 740));
            // the sky: long horizontal cuts, more of them towards the horizon
            b.hatch({ box: [0, 0, 1280, 480], dir: 0, sp: 3.4, len: [16, 120], gap: [8, 50], wMin: 1, wMax: 5, fit: 8, seed: 'tpl-sky', tone: (x, y) => 0.06 + 0.42 * ss(20, 420, y) * (0.6 + 0.8 * W.noise2('tpl-band', x / 300, y / 14)) });
            b.cut((k) => { k.beginPath(); k.ellipse(250, 120, 30, 29, 0, 0, 7); k.fill(); });
            // the slope: flicks down the fall line, lit along the ridge, dark below
            b.ink((k) => { k.beginPath(); slope(k); k.fill(); });
            b.hatch({ box: [0, 180, 1280, 720], clip: slope, dir: (x) => (ridge(x + 6) > ridge(x - 6) ? 0.75 : 2.4), sp: 4, len: [8, 30], gap: [6, 18], run: [1, 3], wMin: 1.1, wMax: 4, fit: 8, seed: 'tpl-slope', tone: (x, y) => 0.28 * (1 - ss(0, 260, y - ridge(x))) + 0.04 });
            // the house: rubble stone carved to a tone that falls away from the corner, a tiled roof
            b.ink((k) => { k.beginPath(); wall.forEach(([x, y], i) => (i ? k.lineTo(x, y) : k.moveTo(x, y))); k.fill(); k.beginPath(); roof(k); k.fill(); });
            b.cut((k) => W.masonry(k, [[640, 260], [1000, 260], [1000, 640], [640, 640]], { courses: 26, stone: [10, 26], tone: (x) => 0.32 * (1 - ss(640, 1000, x)) + 0.04, seed: 'tpl-wall' }));
            b.hatch({ box: [612, 236, 1010, 350], clip: roof, dir: -0.26, sp: 3.4, len: [8, 20], gap: [4, 10], wMin: 1, wMax: 3, tone: 0.3, fit: 6, seed: 'tpl-roof' });
            b.cut((k) => { const r = Motion.rng('tpl-edges'); W.groove(k, [[610, 341], [1004, 236]], 2.4, r); W.groove(k, [[641, 352], [641, 640]], 2, r); });
            // the street: cobbles cut across, a little lighter towards us
            b.ink((k) => k.fillRect(-10, 600, 1300, 130));
            b.hatch({ box: [0, 600, 1280, 720], dir: 0.06, sp: 3.6, len: [10, 40], gap: [6, 20], wMin: 1, wMax: 3.6, fit: 8, seed: 'tpl-street', tone: (x, y) => 0.12 + 0.14 * ss(600, 720, y) });
            b.cut((k) => W.groove(k, [[-10, 601], [1290, 599]], 2.2, Motion.rng('tpl-kerb')));
            // the window, black until it is lit; the lamp's pole, bar and hood
            b.ink((k) => { k.fillRect(752, 400, 46, 80); k.fillRect(554, 270, 12, 334); k.fillRect(L.x, L.y - 22, 94, 4); k.fillRect(L.x - 2, L.y - 22, 4, 8); k.beginPath(); k.moveTo(L.x - L.hw, L.y + 2); k.quadraticCurveTo(L.x - L.hw * 0.7, L.y - 5, L.x - 10, L.y - 14); k.quadraticCurveTo(L.x, L.y - 18, L.x + 10, L.y - 14); k.quadraticCurveTo(L.x + L.hw * 0.7, L.y - 5, L.x + L.hw, L.y + 2); k.closePath(); k.fill(); });
            b.cut((k) => { const r = Motion.rng('tpl-hood'); W.groove(k, [[L.x - L.hw + 1, L.y + 1], [L.x - 16, L.y - 9], [L.x, L.y - 16]], 2, r); W.groove(k, [[L.x - L.hw - 1, L.y + 3], [L.x + L.hw + 1, L.y + 3]], 1.6, r); W.groove(k, [[557, 274], [557, 600]], 2.2, r); });
        });
        if (d >= 12) {
            // the lamp comes on: the bulb is paper, the ochre rings it, the cone is carved down
            const k = d - 12, p = W.clamp(k / 3), top = L.y + 3, fy = 596, yb = top + (fy - top) * p, tw = L.hw * 0.7;
            const bulb = (k2) => { k2.beginPath(); k2.ellipse(L.x, L.y + 3, 10, 6, 0, 0, Math.PI); k2.fill(); };
            const cone = (k2) => { const f = (yb - top) / (fy - top); k2.moveTo(L.x - tw, top); k2.lineTo(L.x + tw, top); k2.lineTo(L.x + tw + 80 * f, yb); k2.lineTo(L.x - tw - 90 * f, yb); k2.closePath(); };
            blk.cut(bulb);
            if (k >= 1) {
                blk.cut((k2) => { k2.beginPath(); cone(k2); k2.fill(); });
                blk.ochre((k2) => { k2.beginPath(); cone(k2); k2.fill(); k2.globalCompositeOperation = 'destination-out'; bulb(k2); });
                blk.hatch({ ink: true, box: [L.x - 160, top, L.x + 150, yb], clip: cone, dir: (x, y) => Math.atan2(y - L.y, x - L.x), sp: 3.4, len: [6, 20], gap: [5, 14], wMin: 0.9, wMax: 2, fit: 5, seed: 'tpl-cone', tone: (x, y) => 0.22 * ss(top + 4, top + 50, y) + 0.18 * ss(480, 596, y) });
            }
        }
        if (d >= 15) {
            // its light on the cobbles: the ochre under the street, more of it carved
            const pp = W.clamp((d - 14) / 3), pr = Motion.rng('tpl-poolshape');
            const pts = Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2, m = 0.75 + 0.4 * pr(); return [L.x - 6 + Math.cos(a) * 150 * pp * m, 640 + Math.sin(a) * 34 * m]; });
            const pool = (k2) => { pts.forEach(([x, y]) => k2.lineTo(x, y)); k2.closePath(); };
            blk.ochre((k2) => { k2.beginPath(); pool(k2); k2.fill(); });
            blk.hatch({ box: [L.x - 160, 604, L.x + 150, 680], clip: pool, dir: 0.06, sp: 3, len: [10, 36], gap: [4, 12], wMin: 1, wMax: 3, fit: 6, tone: 0.45, seed: 'tpl-pool' });
        }
        if (d >= 18) {
            blk.cut((k2) => k2.fillRect(756, 404, 38 * W.clamp((d - 17) / 2), 72));
            blk.ochre((k2) => k2.fillRect(752, 400, 46, 80));
            blk.ink((k2) => { k2.fillRect(773, 404, 3, 72); k2.fillRect(756, 436, 38, 3); });
        }
        blk.print(g, { key: d, seed: d });
    },
});
