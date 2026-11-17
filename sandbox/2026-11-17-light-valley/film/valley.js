// The valley, seen from above the village: a plank 1280 × 940 that the camera tilts down
// (shot 2) and up (shot 12) and holds on (the nights). The river comes out of a gorge at
// the saddle and winds past the village; the line of poles comes over the right shoulder
// and down the slope, one more stretch each night.
(() => {
    const C = Corriente, W = C.W, R = C.R, { lerp, sstep, poly, boxOf, fillPoly } = C;
    const PH = 940;
    const pw = (pts) => (x) => { if (x <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const a = pts[i - 1], b = pts[i]; return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); } return pts[pts.length - 1][1]; };
    const FAR = pw([[0, 330], [120, 300], [230, 250], [330, 296], [430, 356], [520, 392], [600, 368], [700, 300], [780, 326], [860, 372], [960, 330], [1060, 244], [1160, 270], [1280, 300]]);
    const LEFT = pw([[0, 410], [80, 430], [180, 470], [280, 522], [380, 590], [460, 660], [530, 742], [560, 790]]);
    const RIGHT = pw([[760, 760], [820, 700], [880, 650], [950, 598], [1020, 550], [1100, 500], [1180, 468], [1280, 458]]);
    const RIVER = [[536, 398], [556, 450], [592, 520], [578, 590], [612, 650], [596, 706], [588, 770], [604, 840], [640, 900], [668, 960]];
    const MOON = [330, 236, 26];
    // the poles: along the right slope, under its ridge, from the shoulder to the village
    const POLES = Array.from({ length: 10 }, (_, i) => { const f = i / 9, x = lerp(1236, 812, f); return [x, RIGHT(x) + lerp(48, 30, f), lerp(22, 38, f)]; });
    // houses of the village [x, y (eaves), w, h]; windows [x, y] that hold a candle or a bulb
    const HOUSES0 = [[600, 728, 34, 22], [640, 720, 40, 26], [688, 734, 30, 20], [722, 716, 44, 28], [772, 728, 36, 24], [816, 740, 32, 22], [632, 760, 38, 24], [676, 770, 44, 26], [728, 762, 40, 24], [778, 772, 36, 22], [826, 776, 30, 20], [590, 792, 40, 24], [700, 800, 46, 26], [760, 806, 38, 22]];
    const HOUSES = HOUSES0.map(([x, y, w, h]) => [700 + (x - 700) * 1.35, 760 + (y - 760) * 1.35, w * 1.35, h * 1.35]);
    const WINS = HOUSES.flatMap(([x, y, w, h], i) => [[x + w * 0.28, y + h * 0.45], [x + w * 0.68, y + h * 0.5]].slice(0, i % 3 === 0 ? 1 : 2));
    const CANDLES = [3, 11];
    // farmhouses scattered down the slope beside the line: dark until the light comes
    const FARMS = [2, 4, 5, 7, 8].map((i, j) => { const [x, y] = POLES[i]; return [x + (j % 2 ? -46 : 30), y + 8 + (j % 2) * 10, 22 + j * 2, 14 + j]; });   // the two windows that already hold a candle

    function set(b) {
        C.night(b);
        C.nightSky(b, [0, 0, 1280, 420], 400, { seed: 'v-sky', low: 0.34 });
        C.range(b, FAR, 0, 1280, 820, { seed: 'v-far', lit: 0.3 });
        // the valley floor: fields in terraces, cut along the contour
        const floor = [[380, 600], [900, 600], [1280, 700], [1280, PH], [0, PH], [0, 760]];
        b.ink((g) => fillPoly(g, floor));
        b.hatch({ box: boxOf(floor), clip: poly(floor), dir: (x, y) => 0.06 * Math.sin(x / 90 + y / 40), sp: 4.6, len: [16, 60], gap: [8, 30], wMin: 1, wMax: 3.6, fit: 8, seed: 'v-floor', tone: (x, y) => 0.16 * (0.5 + W.noise2('vf', x / 120, y / 30)) });
        C.range(b, LEFT, -10, 560, PH + 20, { seed: 'v-left', lit: 0.22 });
        C.range(b, RIGHT, 760, 1290, PH + 20, { seed: 'v-right', lit: 0.2 });
        // the river: out of the gorge and past the village, widening, cut in streaks
        b.cut((g) => {
            const r = R('v-river');
            for (let i = 0; i < RIVER.length - 1; i++) {
                const [a, c] = [RIVER[i], RIVER[i + 1]], w = lerp(3, 46, i / (RIVER.length - 1));
                for (let k = 0; k < Math.max(2, w / 4); k++) { const off = (r() - 0.5) * w, f0 = r() * 0.3, f1 = 0.6 + r() * 0.4; W.gouge(g, lerp(a[0], c[0], f0) + off, lerp(a[1], c[1], f0), lerp(a[0], c[0], f1) + off * 1.1, lerp(a[1], c[1], f1), 1.2 + r() * 2.2, r, { asym: 1.1 }); }
            }
        });
        // the village: houses, a church tower
        for (const [x, y, w, h] of HOUSES) C.house(b, { x, y, w, h, stone: 0.14, roofTone: 0.34 });
        for (const [x, y, w, h] of FARMS) C.house(b, { x, y, w, h, stone: 0.1, roofTone: 0.3 });
        b.ink((g) => { g.fillRect(690, 646, 22, 66); g.beginPath(); g.moveTo(685, 648); g.lineTo(701, 622); g.lineTo(717, 648); g.fill(); });
        b.cut((g) => { const r = R('v-tower'); W.groove(g, [[690, 648], [690, 710]], 1.5, r); W.groove(g, [[684, 649], [701, 621], [718, 649]], 1.5, r); g.fillRect(697, 656, 7, 11); W.masonry(g, [[692, 668], [711, 668], [711, 710], [692, 710]], { courses: 6, stone: [5, 10], tone: () => 0.3, seed: 'vt' }); });
    }

    // the moon at a phase: 0 new … 1 full (a crescent is ~0.2), lit from the right
    function moon(b, phase, ox, oy) {
        const [x, y, r] = MOON;
        b.cut((g) => { g.beginPath(); g.arc(x - ox, y - oy, r, 0, 7); g.fill(); });
        // the shadow: the same disc slid to the left, kept inside the moon (lit from the right)
        if (phase < 0.99) b.ink((g) => { g.save(); g.beginPath(); g.arc(x - ox, y - oy, r + 0.5, 0, 7); g.clip(); g.beginPath(); g.arc(x - ox - 2 * r * phase, y - oy, r * 1.04, 0, 7); g.fill(); g.restore(); });
        b.ink((g) => { const rr = R('moonband' + Math.round(phase * 10)); W.gouge(g, x - ox - r - 6, y - oy + 6, x - ox + r + 8, y - oy + 4, 1.4, rr, { asym: 1 }); });
    }
    // the line: poles 0..n standing (each a moonlit edge and a crossarm), wires between them
    function line(b, n, ox, oy, o = {}) {
        if (n < 1) return;
        b.cut((g) => {
            const r = R('v-line' + n);
            for (let i = 0; i < n && i < POLES.length; i++) {
                const [x, y, h] = POLES[i];
                W.groove(g, [[x - ox, y - oy], [x - ox, y - oy - h]], 2.1, r, { taper: 2 });
                W.groove(g, [[x - ox - h * 0.22, y - oy - h + 3], [x - ox + h * 0.22, y - oy - h + 3]], 1.1, r, { taper: 1 });
            }
            for (let i = 0; i < n - 1 && i < POLES.length - 1; i++) {
                const [a, c] = [POLES[i], POLES[i + 1]];
                W.groove(g, C.catenary([a[0] - ox, a[1] - oy - a[2] + 3], [c[0] - ox, c[1] - oy - c[2] + 3], 6), 1.6, r, { taper: 2, step: 3 });
            }
            // the first span comes over the shoulder from beyond the frame
            const a = POLES[0];
            W.groove(g, C.catenary([1300 - ox, a[1] - oy - a[2] - 30], [a[0] - ox, a[1] - oy - a[2] + 3], 8), 1.1, r, { taper: 2, step: 3 });
            if (o.toVillage && n >= POLES.length) { const c = POLES[POLES.length - 1]; W.groove(g, C.catenary([c[0] - ox, c[1] - oy - c[2] + 3], [790 - ox, 740 - oy], 5), 1.1, r, { taper: 2 }); }
        });
    }
    // smoke from two chimneys, curling up (drawn per drawing)
    function smoke(b, d, ox, oy) {
        b.cut((g) => {
            for (const [x, y, s] of [[654, 712, 0], [740, 706, 3]]) {
                const r = R('smoke' + s);
                for (let i = 0; i < 6; i++) {
                    const k = (d * 0.5 + i * 2.3 + s) % 12, yy = y - k * 6, xx = x + Math.sin((d + i * 5) * 0.35 + s) * k * 0.9;
                    W.gouge(g, xx - ox - 4, yy - oy, xx - ox + 6 + k * 0.6, yy - oy - 2, 1 + k * 0.08, r, { asym: 1, bend: 0.3 });
                }
            }
        });
    }
    // water: a few streaks running down the river (drawn per drawing on twos)
    function water(b, d, ox, oy) {
        b.cut((g) => {
            const r = R('water');
            for (let i = 0; i < 26; i++) {
                const seg = Math.floor(r() * (RIVER.length - 1)), [a, c] = [RIVER[seg], RIVER[seg + 1]], w = lerp(3, 40, seg / (RIVER.length - 1));
                const f = ((r() + d * 0.035) % 1), off = (r() - 0.5) * w;
                W.gouge(g, lerp(a[0], c[0], f) + off - ox, lerp(a[1], c[1], f) - oy, lerp(a[0], c[0], Math.min(1, f + 0.25)) + off - ox, lerp(a[1], c[1], Math.min(1, f + 0.25)) - oy, 1 + r() * 1.6, r, { asym: 1.2 });
            }
        });
    }
    // windows: a candle (paper white) or electric light (cut and ochre)
    function windows(b, which, ox, oy, electric) {
        for (const i of which) {
            const [x, y] = WINS[i];
            b.cut((g) => { g.fillRect(x - ox - 3, y - oy - 4, 6, 8); if (electric) W.rays(g, x - ox, y - oy, 0, Math.PI * 2, 6, 14, 7, 0.9, 'wl' + i); });
            if (electric) b.ochre((g) => { g.beginPath(); g.ellipse(x - ox, y - oy, 16, 13, 0, 0, 7); g.fill(); });
        }
    }
    // the village lit: every window, and lamps along its street with small cones
    function villageLit(b, k, ox, oy) {
        // the farms down the line: a lit window each, ringed in ochre
        for (const [i, [x, y, w, h]] of FARMS.entries()) {
            if (i * 3 > k) continue;
            const wx = x + w * 0.5 - ox, wy = y + h * 0.5 - oy;
            b.cut((g) => { g.fillRect(wx - 3, wy - 4, 6, 8); W.rays(g, wx, wy, 0, Math.PI * 2, 7, 22, 9, 1, 'fl' + i); });
            b.ochre((g) => { g.beginPath(); g.ellipse(wx, wy, 20, 15, 0, 0, 7); g.fill(); });
        }
        windows(b, WINS.map((_, i) => i).filter((i) => (i * 7) % 13 <= k), ox, oy, true);
        for (const [i, [x, y]] of [[606, 746], [664, 752], [716, 758], [770, 764], [824, 768]].entries()) {
            if (i * 2 > k) continue;
            const cone = (g) => { g.moveTo(x - ox - 1.5, y - oy); g.lineTo(x - ox + 1.5, y - oy); g.lineTo(x - ox + 11, y - oy + 24); g.lineTo(x - ox - 11, y - oy + 24); g.closePath(); };
            b.cut((g) => { g.beginPath(); cone(g); g.fill(); });
            b.ochre((g) => { g.beginPath(); cone(g); g.fill(); });
        }
    }

    // --- shot 2: the valley without light (6–12 s): tilt down to the village -------------
    C.shots.valleyDark = (blk, t, d) => {
        const u = Ease.inOut(C.clamp(t / 6)), oy = Math.round(220 * u);
        blk.begin();
        blk.plank('valley', 1280, PH, set);
        blk.view('valley', 0, oy);
        moon(blk, 0.2, 0, oy);
        water(blk, d, 0, oy);
        smoke(blk, d, 0, oy);
        windows(blk, CANDLES, 0, oy, false);
    };
    // --- shot 8: nights (30–39 s): three nights, the line a step closer each; day inserts
    C.shots.nights = (blk, t, d, env) => {
        const k = Math.floor(t / 1.5);
        if (k % 2 === 1) return C.shots.insert(blk, t - k * 1.5, d, env, (k - 1) / 2);
        const night = k / 2, oy = 170;
        blk.begin();
        blk.plank('valley', 1280, PH, set);
        blk.view('valley', 0, oy);
        moon(blk, [0.45, 0.68, 0.86][night], 0, oy);
        line(blk, [3, 6, 9][night], 0, oy);
        water(blk, d, 0, oy);
        smoke(blk, d + night * 7, 0, oy);
        windows(blk, CANDLES, 0, oy, false);
    };
    // --- shot 12: the valley lit (57–66 s): tilt up to the full moon, the title carved ----
    C.shots.valleyLit = (blk, t, d) => {
        const u = Ease.inOut(C.clamp((t - 1.5) / 5)), oy = Math.round(220 - 80 * u);
        blk.begin();
        blk.plank('valley', 1280, PH, set);
        blk.view('valley', 0, oy);
        moon(blk, 1, 0, oy);
        line(blk, 10, 0, oy, { toVillage: true });
        water(blk, d, 0, oy);
        villageLit(blk, 40, 0, oy);
        if (t >= 6) C.title(blk, Math.floor((t - 6) * 12));
    };

    Object.assign(C, { valley: { set, moon, line, PH, POLES, WINS, MOON } });
})();
