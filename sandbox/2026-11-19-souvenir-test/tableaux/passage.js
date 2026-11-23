// Picture 1, the way in · The passage. Not a poster the camera approaches: strata of things
// hundreds of units apart along the axis, each overlapping the next and leaving a way
// through. Each comes out of the dark as the camera nears it, is crossed, and uncovers the
// one behind. Depth is time and light: it starts by a candle, in the dark, and goes through
// Tartessos and the sea, Rome and the Goths, al-Andalus, the house and the fair, towards
// the guitar (tableaux/emblem.js), which is the last stratum.
//   Tableau.passage(z0) → layers; the first stratum at depth z0, one every STEP after it.
//   Tableau.passage.depth → how far the last stratum is from the first
window.Tableau = window.Tableau || {};
Tableau.passage = (z0) => {
    const S = Souvenir;
    const G = (n) => { try { return eval(n); } catch (e) { return {}; } };
    const R = G('Relics'), H = G('Heirlooms'), P = G('Papers'), W = G('Wares'), C = G('Charms'), L = G('Library'), D = G('Devotion'), F = G('Fauna');
    const NIGHT = [27, 30, 61];
    const box = { x: -1200, y: -720, w: 2400, h: 1440 };
    const STEP = Tableau.passage.step;

    // One stratum: three sheets (far, middle, near) a little apart, so even inside a stratum
    // things slide over each other. `veil` is how much of the night still lies on it (the
    // passage brightens as it goes in); `lamp` a warm light falling on it from a flame.
    //   each sheet: (put) => { put(owner, 'name', { x, y, s, rot, … }); … }
    // The body of a stratum: a thick wreath of the shawl's own flowers and leaves round the
    // way through, so each stratum is a mass that frames the next one and not loose things
    // on the night. Wider than the frame, open in the middle.
    const Sh = G('Shawl');
    function wreath(g, seed, hue) {
        if (!Sh.peony) return;
        const r = Motion.rng('wreath' + seed);
        const spots = [];
        for (let i = 0; i < 520 && spots.length < 74; i++) {
            const x = (r() * 2 - 1) * 1180, y = (r() * 2 - 1) * 700, rad = 62 + r() * 86;
            // the way through: an oval that no flower enters
            if (Math.hypot(x / 430, y / 300) < 1 + rad / 380) continue;
            if (spots.some((q) => Math.hypot(q[0] - x, q[1] - y) < (q[2] + rad) * 0.72)) continue;
            spots.push([x, y, rad]);
        }
        // leaves first, then the flowers over them, far from the centre first
        spots.sort((p, q) => Math.hypot(q[0], q[1]) - Math.hypot(p[0], p[1]));
        if (Sh.leaf) for (const [x, y, rad] of spots) for (let k = 0; k < 5; k++) Sh.leaf(g, { x, y, a: r() * 6.28, len: rad * (1.5 + r() * 0.8), wid: rad * 0.5, bend: (r() - 0.5) * 0.8, seed: seed + x + k });
        spots.forEach(([x, y, rad], i) => {
            const kind = ['peony', 'rose', 'mum', 'peony'][(i + hue) % 4];
            (Sh[kind] || Sh.peony)(g, { x, y, r: rad, seed: seed + i });
        });
    }

    // One stratum: three sheets (far, middle, near) a little apart, so even inside a stratum
    // things slide over each other. `veil` is how much of the night still lies on it (the
    // passage brightens as it goes in); `lamp` a warm light falling on it from a flame.
    // The pieces are big and lie on one another: at the distance the camera reads a stratum
    // from, the near ones are cut by the frame.
    //   each sheet: (put) => { put(owner, 'name', { x, y, s, rot, … }); … }
    function stratum(id, n, veil, sheets, lamp = null) {
        const z = z0 + n * STEP;
        return sheets.map((paintSheet, i) => ({
            id: `passage-${id}-${i}`, z: z + [150, 0, -160][i], box, far: [0.2, 0.36], brush: { amp: 0.06 },
            paint(g) {
                const grow = [1.3, 1.45, 1.5][i], out = [1.0, 1.1, 1.14][i];
                const put = (o, name, a) => o && o[name] && o[name](g, { ...a, x: a.x * out, y: a.y * out, s: (a.s ?? 1) * grow });
                if (i === 0) wreath(g, id, n);
                paintSheet(put, g);
                g.save();
                g.globalCompositeOperation = 'source-atop';
                if (veil > 0) {
                    g.fillStyle = `rgba(${NIGHT.join(',')},${veil})`;
                    g.fillRect(box.x, box.y, box.w, box.h);
                }
                if (lamp) {
                    // what the flame reaches is warm, on the paint only
                    const gr = g.createRadialGradient(lamp.x, lamp.y, 20, lamp.x, lamp.y, lamp.r);
                    gr.addColorStop(0, 'rgba(255,196,120,0.5)');
                    gr.addColorStop(0.45, 'rgba(255,170,90,0.2)');
                    gr.addColorStop(1, 'rgba(255,170,90,0)');
                    g.fillStyle = gr;
                    g.fillRect(box.x, box.y, box.w, box.h);
                }
                g.restore();
                S.tooth(g, box);
            },
        }));
    }

    return [
        // 0 · By the candle: the things of the three faiths, in the dark
        ...stratum('vela', 0, 0.3, [
            (put) => {
                put(W, 'peineta', { x: -360, y: -330, s: 1.15, rot: -0.18 });
                put(W, 'biznaga', { x: 250, y: -360, s: 1.0, rot: 0.2 });
                put(D, 'jamsa', { x: 330, y: 330, s: 1.1, rot: -0.1 });
            },
            (put) => {
                put(D, 'lampara', { x: -470, y: 250, s: 1.1, rot: 0, servant: true });
                put(D, 'rosario', { x: 520, y: -210, s: 1.2, rot: 0.25 });
            },
            (put) => {
                put(D, 'incensario', { x: -640, y: -170, s: 1.7, rot: 0 });
                put(D, 'cirio', { x: 610, y: 150, s: 1.7, rot: 0.03 });
            },
        ], { x: 700, y: -260, r: 1000 }),
        // 1 · Tartessos and the sea: gold, the Phoenicians' purple, the Greeks' bronze
        ...stratum('mar', 1, 0.18, [
            (put) => {
                put(C, 'pomegranate', { x: -330, y: 330, s: 1.2, rot: 0.25 });
                put(F, 'butterfly', { x: -150, y: 395, s: 1.2, rot: -0.9, fold: 0.25, seed: 'm1', cast: false });
                put(R, 'stele', { x: 300, y: -340, s: 1.15, rot: 0.1 });
            },
            (put) => {
                put(R, 'carambolo', { x: -450, y: -270, s: 1.35, rot: -0.12 });
                put(R, 'murex', { x: 480, y: 300, s: 1.45, rot: 0.3 });
            },
            (put) => {
                put(R, 'helmet', { x: 680, y: -140, s: 1.7, rot: 0.06 });
                put(W, 'botijo', { x: -690, y: 240, s: 1.6, rot: 0.06 });
            },
        ]),
        // 2 · Rome and the Goths: oil, a floor, garnets, a crown, Byzantium's gold
        ...stratum('roma', 2, 0.1, [
            (put) => {
                put(H, 'votive', { x: 310, y: -330, s: 1.15, rot: 0 });
                put(H, 'byzantine', { x: -340, y: 320, s: 1.25, rot: 0.06 });
            },
            (put) => {
                put(R, 'mosaic', { x: 470, y: 290, s: 1.4, rot: 0.07 });
                put(H, 'eagle', { x: -430, y: -260, s: 1.4, rot: -0.05 });
            },
            (put) => {
                put(R, 'amphora', { x: -680, y: 130, s: 1.75, rot: -0.42 });
                put(P, 'plaque', { x: 640, y: -330, s: 1.5, rot: 0.06 });
            },
        ]),
        // 3 · Al-Andalus: the stars' instrument, the caliph's fawn, cut tile, the books
        ...stratum('andalus', 3, 0.05, [
            (put) => {
                put(H, 'alicatado', { x: 360, y: -330, s: 1.05, rot: 0.1 });
                put(L, 'palette', { x: -330, y: 340, s: 1.1, rot: 0.22 });
                put(F, 'gecko', { x: 300, y: -250, s: 1.2, rot: 2.4, seed: 'g1' });
            },
            (put) => {
                put(H, 'fawn', { x: 500, y: 260, s: 1.4, rot: 0 });
                put(L, 'books', { x: -520, y: -180, s: 1.15, rot: -0.03 });
            },
            (put) => {
                put(H, 'astrolabe', { x: -660, y: 250, s: 1.7, rot: 0.12 });
                put(W, 'fino', { x: 690, y: -110, s: 1.7, rot: 0.04 });
            },
        ]),
        // 4 · The house and the fair: papers, cards, castanets, lanterns overhead
        ...stratum('feria', 4, 0, [
            (put) => {
                // high enough that no lantern hangs in the way through
                put(W, 'farolillos', { x: -1150, y: -640, s: 0.8, n: 8, len: 2300, sag: 120, seed: 'feria' });
                put(L, 'score', { x: -330, y: 330, s: 1.15, rot: -0.1 });
                put(P, 'ticket', { x: 330, y: 340, s: 1.1, rot: -0.16 });
            },
            (put) => {
                put(P, 'poster', { x: -520, y: -150, s: 1.05, rot: -0.1 });
                put(C, 'cards', { x: 500, y: 250, s: 1.2, rot: 0.2 });
                put(P, 'stamp', { x: 330, y: -330, s: 1.3, rot: 0.14 });
            },
            (put) => {
                put(C, 'castanets', { x: 650, y: -230, s: 1.7, rot: -0.3 });
                put(P, 'matchbox', { x: -640, y: 340, s: 1.7, rot: 0.3 });
            },
        ]),
    ];
};
Tableau.passage.step = 680;
Tableau.passage.depth = 5 * 680; // from the first stratum to the guitar

// ================================================================== round 8 · loose
// Tableau.passage.loose(z0) → the same five strata (vela, mar, roma, andalus, feria, at
// z0 + n · STEP) as loose floating pieces, one layer per thing (round 8: «each one loose,
// floating»). Nothing lies on a sheet: each thing is cut to its own paint and floats at its
// own depth inside its stratum's slab (z ± 280), turning slowly on itself.
//   · heroes: each stratum's own things, whole, 250–650 units across, at 330–950 from the
//     axis, spread over every angle and through the slab's depth (neighbours in angle are
//     far apart in depth, so they slide over each other), plus two or three small finds;
//   · matter: the wreath broken up. What was one mass of the shawl's flowers on the far
//     sheet now floats as single heads with their leaves, half-open cups, sprays, boughs of
//     blossom, buds, ferns, little florets, butterflies and dragonflies, in each stratum's
//     own silks (the candle's wine and ivory, the sea's purples and blues, Rome's coral and
//     gold, al-Andalus's teal and gold, the fair's reds and pinks), and with them a little of
//     each world's own matter: coins of the peoples who struck them there, pomegranate
//     seeds, olive sprigs and olives, shards of cut tile, eight-pointed stars, carnations.
//     Denser near the axis, never within 260 of it.
//   · light: each stratum's veil (the night still lying on it, lifting as the passage goes
//     in) and, on the first one, the candle's warm lamp, laid on every piece in world
//     coordinates on its paint only, so the pieces of a stratum share one light.
// Every random choice is drawn when the layers are made, never while a piece paints: the
// pieces paint in whatever order the camera meets them.
Tableau.passage.loose = (z0) => {
    const S = Souvenir;
    const G = (n) => { try { return eval(n); } catch (e) { return {}; } };
    const R = G('Relics'), H = G('Heirlooms'), P = G('Papers'), W = G('Wares'), C = G('Charms'), L = G('Library'), D = G('Devotion'), F = G('Fauna');
    const Sh = G('Shawl'), Co = G('Coins'), Ga = G('Garland'), Rb = G('Ribbon'), Sk = G('Sky');
    const OWN = { R, H, P, W, C, L, D, F, Sh, Co, Ga, Rb, Sk };
    const NIGHT = [27, 30, 61], TAU = Math.PI * 2, STEP = Tableau.passage.step;
    const layers = [];

    // The stratum's light on a piece's paint: its veil of night, then the lamp.
    function lightOn(g, box, st) {
        g.save();
        g.globalCompositeOperation = 'source-atop';
        if (st.veil > 0) {
            g.fillStyle = `rgba(${NIGHT.join(',')},${st.veil})`;
            g.fillRect(box.x, box.y, box.w, box.h);
        }
        g.restore();
        if (st.lamp) lamp(g, st.lamp);
        S.tooth(g, box);
    }
    // The candle's light on a piece, per pixel and in world coordinates: what the flame
    // reaches is warmed and brightened in its own colours (a wash of light paint laid over
    // it would turn every flower near the flame the same tan).
    function lamp(g, { x: lx, y: ly, r }) {
        const c = g.canvas, m = g.getTransform(), img = g.getImageData(0, 0, c.width, c.height), px = img.data;
        g.save();
        for (let j = 0; j < c.height; j++) {
            const wy = (j + 0.5 - m.f) / m.d;
            for (let i = 0; i < c.width; i++) {
                const o = (j * c.width + i) * 4;
                if (!px[o + 3]) continue;
                const wx = (i + 0.5 - m.e) / m.a, d = Math.hypot(wx - lx, wy - ly) / r;
                if (d >= 1) continue;
                const f = (1 - d) * (1 - d) * (0.55 + 0.45 * Math.exp(-d * d * 12));
                px[o] = Math.min(255, px[o] * (1 + 0.95 * f) + 34 * f);
                px[o + 1] = Math.min(255, px[o + 1] * (1 + 0.55 * f) + 18 * f);
                px[o + 2] = Math.min(255, px[o + 2] * (1 + 0.12 * f) + 4 * f);
            }
        }
        g.putImageData(img, 0, 0);
        g.restore();
    }
    // One loose piece: `half` is half its box (generous: the rig cuts it to its paint).
    function add(st, id, dz, x, y, half, draw, o = {}) {
        const box = { x: x - half, y: y - half, w: half * 2, h: half * 2 };
        layers.push({
            id: `passage-l-${st.id}-${id}`, z: st.z + dz, loose: o.loose ?? true, brush: { amp: 0.06 }, box, ...(o.res ? { res: o.res } : {}),
            paint(g) {
                draw(g);
                lightOn(g, box, st);
            },
        });
    }
    const pol = (r, a, x = 0, y = 0) => [x + Math.cos(a) * r, y + Math.sin(a) * r];
    const pick = (list, r) => list[(r() * list.length) | 0];
    function stem(g, pts, sk, w) {
        g.save();
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.strokeStyle = sk[1];
        g.lineWidth = w + 1;
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.stroke();
        g.lineWidth = 1.1;
        for (let i = 0; i < pts.length - 1; i++) {
            const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(d / 2.6)), ux = (x1 - x0) / d, uy = (y1 - y0) / d;
            for (let j = 0; j < n; j++) {
                const t = j / n, cx = x0 + (x1 - x0) * t, cy = y0 + (y1 - y0) * t, ww = w * (1 - (i + t) / pts.length * 0.45) * 0.5;
                g.strokeStyle = sk[(i + j) % 3 ? 5 : 7];
                g.beginPath();
                g.moveTo(cx - uy * ww - ux * 1.6, cy + ux * ww - uy * 1.6);
                g.lineTo(cx + uy * ww + ux * 1.6, cy - ux * ww + uy * 1.6);
                g.stroke();
            }
        }
        g.restore();
    }

    // ---------------------------------------------------------------- the heroes
    // [owner, drawer, w, h (at s = 1), s, angle (degrees, clockwise from +x), R, depth slot, opts]
    // A hero is kept far enough out that nothing of it comes within about 260 of the axis.
    // Depth slots 0…n−1 spread the heroes evenly through the slab.
    function heroes(st, list) {
        const n = Math.max(...list.map((e) => e[7])) + 1;
        for (const [own, name, w, h, s0, deg, R0, slot, o = {}] of list) {
            const s = o.draw ? s0 : s0 * 1.12, ext = (Math.hypot(w, h) / 2) * s, Rr = Math.max(R0, 255 + ext * 0.8), a = (deg * Math.PI) / 180;
            const [x, y] = pol(Rr, a), dz = -255 + (510 * (slot + 0.5)) / n;
            const half = ext + (o.pad ?? 30) * s + 24, seed = o.seed ?? st.id + name;
            const draw = o.draw ? (g) => o.draw(g, x, y) : (g) => OWN[own][name](g, { x, y, s, rot: o.rot ?? 0, seed, ...(o.opts ?? {}) });
            add(st, name + (o.tag ?? ''), o.dz ?? dz, x, y, half, draw, { loose: o.loose });
            st.placed.push({ x, y, z: o.dz ?? dz, rad: ext });
        }
    }
    // A small thing to find: at (angle, R, dz) with a box of `half`.
    function find(st, id, deg, R0, dz, half, draw) {
        const [x, y] = pol(R0, (deg * Math.PI) / 180);
        add(st, id, dz, x, y, half, (g) => draw(g, x, y));
        st.placed.push({ x, y, z: dz, rad: half * 0.6 });
    }

    // ---------------------------------------------------------------- the matter
    // Each kind: (q, st) → { rad, paint(g, x, y) }, every choice drawn from q now.
    const KIND = {
        // a flower head with its leaves fanned out under it, and sometimes a bud
        bloom(q, st, k = 1) {
            const hr = (32 + q() * 38) * k, kind = pick(['peony', 'rose', 'mum', 'peony', 'rose', 'mum', 'peony'], q), bloom = pick(st.blooms, q), seed = 'h' + q();
            const nl = 3 + ((q() * 4) | 0), a0 = q() * TAU, spread = 1.8 + q() * 3.4, leaves = [];
            for (let j = 0; j < nl; j++) leaves.push({ a: a0 + (j / (nl - 1) - 0.5) * spread + (q() - 0.5) * 0.4, len: hr * (1.45 + q() * 0.8), wid: 0.38 + q() * 0.12, bend: (q() - 0.5) * 0.8, hue: pick(st.leaves, q), seed: 'l' + q(), kind: q() < 0.5 ? 'smooth' : undefined });
            const bud = q() < 0.4 ? { a: a0 + spread * 0.5 + 0.6 + q(), r: hr * (0.3 + q() * 0.12), seed: 'b' + q() } : null;
            const mr = kind === 'mum' ? hr * 0.85 : hr;
            // one in three has a smaller head of another kind beside it, on the far side from the bud
            const two = q() < 0.36 ? { a: a0 - spread * 0.5 - 0.4 - q() * 0.8, r: hr * (0.5 + q() * 0.22), kind: pick(['rose', 'mum', 'peony'].filter((k2) => k2 !== kind), q), bloom: q() < 0.5 ? bloom : pick(st.blooms, q), seed: 'h2' + q() } : null;
            return {
                rad: hr * (two ? 2.6 : 2.35),
                paint(g, x, y) {
                    for (const l of leaves) Sh.leaf(g, { x: x + Math.cos(l.a) * hr * 0.3, y: y + Math.sin(l.a) * hr * 0.3, a: l.a, len: l.len, wid: l.len * l.wid, bend: l.bend, hue: l.hue, seed: l.seed, kind: l.kind });
                    if (bud) Sh.bud(g, { x: x + Math.cos(bud.a) * hr * 1.45, y: y + Math.sin(bud.a) * hr * 1.45, r: bud.r, rot: bud.a, bloom, hue: leaves[0].hue, seed: bud.seed, stalk: 1.6 });
                    if (two) Sh[two.kind](g, { x: x + Math.cos(two.a) * hr * 1.25, y: y + Math.sin(two.a) * hr * 1.25, r: two.r, bloom: two.bloom, seed: two.seed });
                    Sh[kind](g, { x, y, r: mr, bloom, seed });
                },
            };
        },
        // a peony half open from the side, on its stalk
        cup(q, st, k = 1) {
            const r = (30 + q() * 22) * k, rot = q() * TAU, bloom = pick(st.blooms, q), hue = pick(st.leaves, q), seed = 'c' + q();
            const lf = { a: rot + Math.PI + (q() - 0.5) * 1.6, len: r * (1.1 + q() * 0.5), seed: 'cl' + q() };
            return {
                rad: r * 2.1,
                paint(g, x, y) {
                    const ax = x - Math.cos(rot) * r * 0.45, ay = y - Math.sin(rot) * r * 0.45, b = pol(r * 0.9, rot + Math.PI, ax, ay);
                    Sh.leaf(g, { x: b[0], y: b[1], a: lf.a, len: lf.len, wid: r * 0.5, bend: 0.4, hue, seed: lf.seed });
                    Sh.cup(g, { x: ax, y: ay, r, rot, bloom, hue, seed, stalk: 1.4 });
                },
            };
        },
        // a twig of small flowers, buds and leaflets
        spray(q, st, k = 1) {
            const len = (150 + q() * 110) * k, a = q() * TAU, bend = (q() - 0.5) * 1.2, hue = pick(st.leaves, q), bloom = pick(st.small, q), seed = 's' + q();
            return {
                rad: len / 2 + 26,
                paint(g, x, y) {
                    const p0 = pol(-len / 2, a, x, y), p1 = pol(len / 2, a, x, y), m = pol(len * 0.22 * bend, a + Math.PI / 2, x, y);
                    Sh.spray(g, { pts: [p0, [(p0[0] + m[0]) / 2, (p0[1] + m[1]) / 2], m, [(m[0] + p1[0]) / 2, (m[1] + p1[1]) / 2], p1], seed, hue, bloom });
                },
            };
        },
        // old wood with blossom on its spurs
        bough(q, st, k = 1) {
            const len = (170 + q() * 110) * k, a = q() * TAU, bloom = pick(st.small, q), seed = 'w' + q(), k1 = (q() - 0.5) * 0.5, k2 = (q() - 0.5) * 0.6;
            return {
                rad: len / 2 + 34,
                paint(g, x, y) {
                    const pts = [];
                    for (let i = 0; i <= 4; i++) {
                        const u = i / 4 - 0.5, side = (i % 2 ? k1 : k2) * len * 0.3;
                        pts.push([x + Math.cos(a) * u * len - Math.sin(a) * side, y + Math.sin(a) * u * len + Math.cos(a) * side]);
                    }
                    Sh.bough(g, { pts, bloom, seed });
                },
            };
        },
        // a leafy shoot: a stem in stem stitch with leaves set alternately along it, smaller
        // towards the tip, and one at the tip (never a fan of leaves from one point)
        leaves(q, st, k = 1) {
            const len = (130 + q() * 90) * k, a = q() * TAU, bend = (q() - 0.5) * 0.9, hue = pick(st.leaves, q), nl = 3 + ((q() * 3) | 0), list = [];
            let side = q() < 0.5 ? 1 : -1;
            for (let j = 0; j < nl; j++) {
                const u = 0.22 + (0.7 * j) / Math.max(1, nl - 1) + (q() - 0.5) * 0.06;
                list.push({ u, side, da: 0.55 + q() * 0.4, len: len * (0.5 - 0.22 * u) * (0.85 + q() * 0.3), wid: 0.34 + q() * 0.12, bend: (q() - 0.5) * 0.8, seed: 'v' + q(), hue: q() < 0.2 ? pick(st.leaves, q) : hue, kind: q() < 0.4 ? 'smooth' : undefined });
                side = -side;
            }
            const tip = { len: len * 0.3, seed: 'vt' + q() };
            return {
                rad: len * 0.62 + 30,
                paint(g, x, y) {
                    const at = (u) => {
                        const v = u - 0.5, th = a + bend * v;
                        return [x + Math.cos(a) * v * len - Math.sin(a) * bend * len * 0.12 * (1 - 4 * v * v), y + Math.sin(a) * v * len + Math.cos(a) * bend * len * 0.12 * (1 - 4 * v * v), th];
                    };
                    stem(g, Array.from({ length: 13 }, (_, i) => at(i / 12)), Sh.SILK[hue === 'autumn' ? 'gold' : 'moss'], 2.6 * k);
                    for (const l of list) {
                        const [px, py, th] = at(l.u);
                        Sh.leaf(g, { x: px, y: py, a: th + l.side * l.da, len: l.len, wid: l.len * l.wid, bend: l.bend, hue: l.hue, seed: l.seed, kind: l.kind });
                    }
                    const [ex, ey, et] = at(1);
                    Sh.leaf(g, { x: ex, y: ey, a: et, len: tip.len, wid: tip.len * 0.4, bend: 0.2, hue, seed: tip.seed, kind: 'smooth' });
                },
            };
        },
        fern(q, st, k = 1) {
            const len = (110 + q() * 80) * k, a = q() * TAU, bend = (q() - 0.5) * 1.6, seed = 'f' + q(), hue = pick(st.leaves, q);
            return {
                rad: len * 0.62 + 18,
                paint(g, x, y) {
                    Sh.fern(g, { x: x - Math.cos(a) * len * 0.5, y: y - Math.sin(a) * len * 0.5, a, len, bend, hue, seed });
                },
            };
        },
        // a knot of little flowers with a leaf or two and a bud
        florets(q, st, k = 1) {
            const nf = 3 + ((q() * 4) | 0), list = [], bloom = pick(st.small, q), a0 = q() * TAU, hue = pick(st.leaves, q), kind = pick(['round', 'notched', 'star'], q);
            for (let j = 0; j < nf; j++) list.push({ d: j ? (16 + q() * 24) * k : 0, a: a0 + j * 2.4 + q() * 0.6, r: (10 + q() * 12) * k, seed: 'o' + q(), bloom: q() < 0.75 ? bloom : pick(st.small, q) });
            const lv = [0, 1, 2].map(() => ({ a: q() * TAU, len: (36 + q() * 22) * k, seed: 'ol' + q() })), bud = { a: q() * TAU, r: (6 + q() * 3) * k, seed: 'ob' + q() };
            return {
                rad: 72 * k,
                paint(g, x, y) {
                    for (const l of lv) Sh.leaf(g, { x, y, a: l.a, len: l.len, wid: l.len * 0.42, bend: 0.3, hue, seed: l.seed, kind: 'smooth' });
                    Sh.bud(g, { x: x + Math.cos(bud.a) * 36 * k, y: y + Math.sin(bud.a) * 36 * k, r: bud.r, rot: bud.a, bloom, hue, seed: bud.seed, stalk: 1.5 });
                    for (const f of list) Sh.floret(g, { x: x + Math.cos(f.a) * f.d, y: y + Math.sin(f.a) * f.d, r: f.r, bloom: f.bloom, kind, seed: f.seed });
                },
            };
        },
        bud(q, st, k = 1) {
            const r = (14 + q() * 9) * k, rot = q() * TAU, bloom = pick(st.blooms, q), hue = pick(st.leaves, q), seed = 'u' + q(), la = rot + Math.PI + (q() < 0.5 ? 0.7 : -0.7);
            return {
                rad: r * 3.2,
                paint(g, x, y) {
                    const b = pol(r * 2.1, rot + Math.PI, x, y);
                    Sh.leaf(g, { x: b[0], y: b[1], a: la, len: r * 2.6, wid: r * 1.05, bend: 0.4, hue, seed: seed + 'l' });
                    Sh.bud(g, { x: x + Math.cos(rot) * r * 0.5, y: y + Math.sin(rot) * r * 0.5, r, rot, bloom, hue, seed, stalk: 1.7 });
                },
            };
        },
        fly(q, st, k = 1) {
            const dragon = q() < (st.dragonflies ?? 0.35), r = (dragon ? 27 + q() * 7 : 20 + q() * 8) * k, rot = q() * TAU, seed = 'y' + q();
            return { rad: r * 1.35, paint: (g, x, y) => Sh[dragon ? 'dragonfly' : 'butterfly'](g, { x, y, r, rot, seed }) };
        },
        // the world's own matter
        coin(q, st, k = 1) {
            const r = (34 + q() * 18) * k, kind = pick(st.coins, q), rot = (q() - 0.5) * 1.6, seed = 'k' + q();
            return { rad: r * 1.5, paint: (g, x, y) => Co.coin(g, { x, y, r, kind, rot, seed }) };
        },
        arils(q, st, k = 1) {
            const list = [];
            for (let j = 0, n = 3 + ((q() * 4) | 0); j < n; j++) list.push({ dx: (q() - 0.5) * 70 * k, dy: (q() - 0.5) * 70 * k, s: (1.8 + q() * 1) * k, rot: q() * TAU, seed: 'a' + q() });
            return { rad: 64 * k, paint: (g, x, y) => list.forEach((a) => C.aril(g, { x: x + a.dx, y: y + a.dy, s: a.s, rot: a.rot, seed: a.seed })) };
        },
        olive(q, st, k = 1) {
            const len = (250 + q() * 90) * k, a = q() * TAU, s = (0.6 + q() * 0.15) * k, bend = (q() - 0.5) * 0.5, seed = 'ov' + q(), shoots = q() < 0.4 ? 1 : 0;
            return {
                rad: len / 2 + 62 * s + 10,
                paint(g, x, y) {
                    const p0 = pol(-len / 2, a, x, y), p1 = pol(len / 2, a, x, y), m = pol(len * 0.18 * bend, a + Math.PI / 2, x, y);
                    Ga.olive(g, { path: [p0, m, p1], s, seed, shoots });
                },
            };
        },
        olives(q, st, k = 1) {
            const list = [], ripe = pick(['green', 'turning', 'black'], q);
            for (let j = 0, n = 2 + ((q() * 3) | 0); j < n; j++) list.push({ dx: (q() - 0.5) * 50 * k, dy: (q() - 0.5) * 50 * k, rot: q() * TAU, s: (1.1 + q() * 0.4) * k, ripe: q() < 0.6 ? ripe : pick(['green', 'turning', 'black'], q), v: (q() * 3) | 0 });
            return { rad: 56 * k, paint: (g, x, y) => list.forEach((o) => Ga.fruit(g, { x: x + o.dx, y: y + o.dy, rot: o.rot, s: o.s, ripe: o.ripe, v: o.v })) };
        },
        tile(q, st, k = 1) {
            const w = (90 + q() * 70) * k, h = (84 + q() * 60) * k, rot = q() * TAU, seed = 'tl' + ((q() * 1e6) | 0), period = 46 + q() * 26;
            return { rad: Math.hypot(w, h) / 2 + 16, paint: (g, x, y) => H.alicatado(g, { x, y, s: 1, rot, seed, w, h, period }) };
        },
        star(q, st, k = 1) {
            const r = (24 + q() * 24) * k, rot = q() * TAU, kind = q() < 0.7 ? 'gold' : 'silver';
            return { rad: r + 8, paint: (g, x, y) => Sk.star(g, { x, y, r, rot, kind }) };
        },
        carnation(q, st, k = 1) {
            const r = (32 + q() * 24) * k, rot = q() * TAU, color = q() < 0.65 ? 'red' : 'white', stem = 1.1 + q() * 1.1, seed = 'cn' + q();
            // the head faces along -rot's up; the middle of the whole thing is down its stem
            const c = ((1.25 + stem) * r - 0.75 * r) / 2;
            return {
                rad: ((1.25 + stem) * r + 0.75 * r) / 2 + r * 0.7,
                paint(g, x, y) {
                    Ga.carnation(g, { x: x - -Math.sin(rot) * c, y: y - Math.cos(rot) * c, r, rot, seed, color, stem, leaves: 1 });
                },
            };
        },
        gbud(q, st, k = 1) {
            const s = (0.8 + q() * 0.3) * k, rot = q() * TAU, seed = 'gb' + q(), stem = 40 + q() * 30, c = (stem + 54 * s - 54 * s) / 2;
            return {
                rad: (54 + 33) * s / 2 + stem / 2 + 30,
                paint(g, x, y) {
                    Ga.bud(g, { x: x - -Math.sin(rot) * c, y: y - Math.cos(rot) * c, s, rot, seed, stem, leaves: 1 });
                },
            };
        },
    };
    // `n` pieces of matter from `menu` ({ kind: weight }), placed by golden angle all round the
    // axis, denser inside, through the slab's depth, never piled on another at its depth.
    function matter(st, n, menu, outside = 0.1) {
        const r = Motion.rng('passage-loose/' + st.id), kinds = Object.entries(menu), total = kinds.reduce((a, [, w]) => a + w, 0);
        let made = 0;
        for (let tries = 0; made < n && tries < n * 30; tries++) {
            let u = r() * total, kind = kinds[0][0];
            for (const [k, w] of kinds) if ((u -= w) < 0) {
                kind = k;
                break;
            }
            // most inside 950 (what the frame holds when the stratum is read; the near side of the
            // slab reaches further out, since it fills the frame's corners as it comes), the rest (`outside`)
            // in an outer ring, larger, seen only small and early (and painted smaller): the
            // first stratum has the most there, since nothing in front of it fills the frame's sides
            const outer = r() < outside, q = Motion.rng(`passage-loose/${st.id}/${made}/${tries}`), it = KIND[kind](q, st, outer ? 1.4 : 1.12);
            const a = made * 2.39996 + st.turn + (r() - 0.5) * 0.5, w = r(), dz = -270 + r() * 540;
            const near = Math.min(1, Math.max(0, (-dz - 90) / 180)), Rr = outer ? 950 + 550 * w : Math.max(266 + it.rad * 0.9, 280 + (640 + 300 * near) * Math.pow(w, 1.35));
            const x = Math.cos(a) * Rr, y = Math.sin(a) * Rr;
            if (st.placed.some((p) => Math.abs(p.z - dz) < 60 && Math.hypot(p.x - x, p.y - y) < (p.rad + it.rad) * 0.55)) continue;
            st.placed.push({ x, y, z: dz, rad: it.rad });
            add(st, kind + made, dz, x, y, it.rad * 1.45 + 26, (g) => it.paint(g, x, y), { res: outer ? 0.6 : undefined });
            made++;
        }
    }
    const stratum = (id, n, veil, o) => ({ id, z: z0 + n * STEP, veil, placed: [], turn: n * 1.3, ...o });

    // ---------------------------------------------------------------- 0 · by the candle
    // The three faiths' things in the dark, the candle's flame the one light; the wreath's
    // flowers in the candle's colours: wine, rose, plum and the jasmine's ivory.
    {
        const st = stratum('vela', 0, 0.3, { blooms: ['wine', 'rose', 'plum', 'ivory', 'wine', 'coral', 'rose'], small: ['ivory', 'ivory', 'coral', 'rose', 'plum'], leaves: ['jade', 'teal', 'moss', 'jade'], dragonflies: 0.2 });
        // the candle stands upright to the right of the axis; its flame is the stratum's lamp
        const cs = 1.4, cx = 500;
        st.lamp = { x: cx, y: -232 * cs, r: 1150 };
        heroes(st, [
            ['D', 'cirio', 90, 420, cs, 0, cx, 3, { pad: 95, loose: { spin: 0.02, sway: 0.025 } }],
            ['D', 'jamsa', 140, 200, 1.55, 52, 470, 6],
            ['Rb', 'key', 300, 130, 1.35, 98, 520, 0, { rot: 0.45 }],
            ['D', 'lampara', 237, 224, 1.4, 142, 520, 5, { opts: { servant: true } }],
            ['D', 'incensario', 170, 330, 1.32, 188, 560, 1],
            ['W', 'peineta', 206, 233, 1.5, 233, 520, 7, { rot: -0.25 }],
            ['W', 'biznaga', 132, 296, 1.4, 272, 560, 4, { rot: 0.3 }],
            ['D', 'rosario', 220, 280, 1.5, 318, 560, 2, { rot: 0.25 }],
            // an outer ring, seen small and early
            ['D', 'jamsa', 140, 200, 1.2, 205, 900, 6, { tag: '2', rot: 0.6, seed: 'vela-jamsa-2' }],
            ['W', 'biznaga', 132, 296, 1.15, 25, 920, 1, { tag: '2', rot: -0.5, seed: 'vela-biznaga-2' }],
        ]);
        // finds: a little embroidered bird asleep on its twig, a ladybird, a fallen jasmine star
        find(st, 'songbird', 28, 360, 255, 110, (g, x, y) => Sh.songbird(g, { x, y, s: 1.5, rot: -0.2, seed: 'vela-bird' }));
        find(st, 'ladybird', 120, 330, -262, 50, (g, x, y) => {
            Sh.leaf(g, { x: x - 30, y: y + 6, a: -0.3, len: 64, wid: 26, bend: 0.3, hue: 'jade', seed: 'vela-lb-leaf' });
            F.ladybird(g, { x: x + 4, y: y - 4, s: 1.4, rot: -0.4, seed: 'vela-lb' });
        });
        find(st, 'jasmine', 300, 300, 140, 34, (g, x, y) => Sh.floret(g, { x, y, r: 16, bloom: 'ivory', kind: 'star', seed: 'vela-jas' }));
        matter(st, 112, { bloom: 36, cup: 8, spray: 7, bough: 4, leaves: 8, fern: 3, florets: 7, bud: 5, fly: 2 }, 0.3);
    }
    // ---------------------------------------------------------------- 1 · Tartessos and the sea
    // Gold, the Phoenicians' purple, the Greeks' bronze; flowers in the sea's purples and blues,
    // the coins of Gadir and the Barcids, pomegranate seeds.
    {
        const st = stratum('mar', 1, 0.18, { blooms: ['peri', 'plum', 'teal', 'ivory', 'plum', 'peri', 'wine'], small: ['peri', 'ivory', 'teal', 'plum', 'ivory'], leaves: ['teal', 'blue', 'jade', 'teal'], coins: ['tartessos', 'gadir', 'gadir-melqart', 'barcid'], dragonflies: 0.6 });
        heroes(st, [
            ['R', 'murex', 176, 156, 1.9, 18, 520, 3, { rot: 0.3 }],
            ['Co', 'coin', 180, 180, 1, 64, 470, 6, { draw: (g, x, y) => Co.coin(g, { x, y, r: 88, kind: 'barcid', rot: 0.2, seed: 'mar-barcid' }) }],
            ['C', 'pomegranate', 188, 264, 1.5, 108, 520, 0, { rot: 0.25 }],
            ['W', 'botijo', 186, 242, 1.6, 152, 560, 5, { rot: 0.06 }],
            ['R', 'carambolo', 236, 196, 1.6, 200, 560, 1, { rot: -0.12 }],
            ['Co', 'coin', 190, 190, 1, 246, 480, 7, { tag: '2', draw: (g, x, y) => Co.coin(g, { x, y, r: 92, kind: 'gadir', rot: -0.15, seed: 'mar-gadir' }) }],
            ['R', 'stele', 172, 262, 1.6, 290, 540, 4, { rot: 0.1 }],
            ['R', 'helmet', 204, 244, 1.7, 335, 600, 2, { rot: 0.06 }],
            ['R', 'murex', 176, 156, 1.25, 225, 900, 2, { tag: '2', rot: 2.2, seed: 'mar-murex-2' }],
            ['Co', 'coin', 170, 170, 1, 125, 900, 5, { tag: '3', draw: (g, x, y) => Co.coin(g, { x, y, r: 80, kind: 'gadir-melqart', rot: 0.4, seed: 'mar-melqart' }) }],
            ['R', 'stele', 172, 262, 1.15, 20, 930, 6, { tag: '2', rot: -0.7, seed: 'mar-stele-2' }],
        ]);
        find(st, 'butterfly', 84, 330, -268, 90, (g, x, y) => F.butterfly(g, { x, y, s: 1.3, rot: -0.9, fold: 0.25, seed: 'm1', cast: false }));
        find(st, 'snail', 300, 330, 150, 70, (g, x, y) => F.snail(g, { x, y, s: 1.4, rot: 0.3, seed: 'mar-snail' }));
        matter(st, 96, { bloom: 32, cup: 7, spray: 5, leaves: 7, fern: 4, florets: 6, bud: 4, fly: 3, coin: 8, arils: 4 });
    }
    // ---------------------------------------------------------------- 2 · Rome and the Goths
    // Oil, a floor, garnets, a crown, Byzantium's gold; flowers in coral and gold, olive sprigs
    // and olives, the coins of Obulco, Hadrian and the Visigothic kings.
    {
        const st = stratum('roma', 2, 0.1, { blooms: ['coral', 'gold', 'wine', 'rose', 'gold', 'ivory'], small: ['gold', 'ivory', 'coral', 'rose'], leaves: ['moss', 'autumn', 'jade', 'moss'], coins: ['obulco', 'hadrian', 'leovigild', 'spania'], dragonflies: 0.3 });
        heroes(st, [
            ['H', 'votive', 186, 290, 1.6, 12, 560, 4],
            ['Co', 'coin', 180, 180, 1, 52, 470, 7, { draw: (g, x, y) => Co.coin(g, { x, y, r: 86, kind: 'hadrian', rot: 0.1, seed: 'roma-hadrian' }) }],
            ['R', 'mosaic', 304, 244, 1.15, 95, 560, 1, { rot: 0.07 }],
            ['H', 'byzantine', 162, 212, 1.7, 138, 500, 5, { rot: 0.06 }],
            ['R', 'amphora', 264, 304, 1.35, 182, 600, 2, { rot: -0.42 }],
            ['Ga', 'olive', 520, 140, 1, 222, 560, 8, { draw: (g, x, y) => Ga.olive(g, { path: [[x - 230, y + 60], [x - 20, y - 30], [x + 230, y - 20]], s: 0.85, seed: 'roma-olive', shoots: 2 }) }],
            ['H', 'eagle', 136, 216, 1.8, 262, 500, 0, { rot: -0.05 }],
            ['Co', 'coin', 150, 150, 1, 300, 450, 6, { tag: '2', draw: (g, x, y) => Co.coin(g, { x, y, r: 84, kind: 'leovigild', rot: -0.2, seed: 'roma-leovigild' }) }],
            ['P', 'plaque', 333, 146, 1.3, 335, 600, 3, { rot: 0.06 }],
            ['Co', 'coin', 150, 150, 1, 160, 920, 7, { tag: '3', draw: (g, x, y) => Co.coin(g, { x, y, r: 76, kind: 'spania', rot: 0.3, seed: 'roma-spania' }) }],
            ['Ga', 'olive', 520, 140, 1, 30, 930, 4, { tag: '2', draw: (g, x, y) => Ga.olive(g, { path: [[x - 200, y - 50], [x, y + 30], [x + 210, y + 10]], s: 0.8, seed: 'roma-olive-2', shoots: 1 }) }],
        ]);
        find(st, 'lizard', 115, 340, 262, 130, (g, x, y) => F.lizard(g, { x, y, s: 0.85, rot: 0.6, seed: 'roma-lizard' }));
        find(st, 'bee', 320, 300, -262, 76, (g, x, y) => F.bee(g, { x, y, s: 1.3, rot: -0.3, seed: 'roma-bee' }));
        matter(st, 96, { bloom: 30, cup: 7, spray: 4, leaves: 6, florets: 5, bud: 4, olive: 8, olives: 4, coin: 7, fly: 2 });
    }
    // ---------------------------------------------------------------- 3 · al-Andalus
    // The stars' instrument, the caliph's fawn, cut tile, the books; flowers in teal and gold,
    // shards of cut tile, eight-pointed stars, the dirhams of the caliphate and the Nasrids.
    {
        const st = stratum('andalus', 3, 0.05, { blooms: ['teal', 'gold', 'ivory', 'teal', 'peri', 'coral'], small: ['ivory', 'gold', 'teal', 'ivory'], leaves: ['jade', 'teal', 'blue', 'jade'], coins: ['caliphate', 'almohad', 'nasrid'], dragonflies: 0.4 });
        heroes(st, [
            ['H', 'alicatado', 308, 308, 1.25, 15, 540, 2, { rot: 0.1 }],
            ['H', 'fawn', 182, 230, 1.7, 60, 520, 6],
            ['Co', 'coin', 190, 190, 1, 103, 470, 0, { draw: (g, x, y) => Co.coin(g, { x, y, r: 86, kind: 'caliphate', rot: 0.15, seed: 'andalus-caliphate' }) }],
            ['L', 'palette', 282, 204, 1.3, 146, 540, 4, { rot: 0.22 }],
            ['H', 'astrolabe', 230, 304, 1.6, 192, 600, 7, { rot: 0.12 }],
            ['Sk', 'star', 170, 170, 1, 236, 450, 1, { draw: (g, x, y) => Sk.star(g, { x, y, r: 78, rot: 0.2, kind: 'gold' }) }],
            ['L', 'books', 340, 418, 1.15, 282, 620, 5, { rot: -0.03 }],
            ['W', 'fino', 138, 334, 1.45, 330, 560, 3, { rot: 0.04 }],
            ['Co', 'coin', 160, 160, 1, 210, 900, 2, { tag: '2', draw: (g, x, y) => Co.coin(g, { x, y, r: 70, kind: 'nasrid', rot: 0.5, seed: 'andalus-nasrid' }) }],
            ['H', 'alicatado', 250, 220, 1, 120, 920, 5, { tag: '2', rot: 0.7, seed: 'andalus-alicatado-2', opts: { w: 240, h: 210, period: 64 } }],
            ['Sk', 'star', 120, 120, 1, 310, 920, 0, { tag: '2', draw: (g, x, y) => Sk.star(g, { x, y, r: 56, rot: 0.5, kind: 'silver' }) }],
        ]);
        find(st, 'gecko', 40, 330, -265, 100, (g, x, y) => F.gecko(g, { x, y, s: 1.3, rot: 2.4, seed: 'g1' }));
        find(st, 'goldfinch', 260, 330, 262, 120, (g, x, y) => F.goldfinch(g, { x, y, s: 1.05, rot: 0, seed: 'andalus-finch' }));
        matter(st, 96, { bloom: 30, cup: 6, spray: 5, bough: 3, leaves: 6, florets: 6, bud: 4, tile: 10, star: 5, coin: 5 });
    }
    // ---------------------------------------------------------------- 4 · the house and the fair
    // Papers, cards, castanets, lanterns; flowers in the fair's reds and pinks, carnations.
    {
        const st = stratum('feria', 4, 0, { blooms: ['rose', 'coral', 'ivory', 'gold', 'rose', 'wine', 'coral'], small: ['ivory', 'coral', 'rose', 'gold'], leaves: ['jade', 'moss', 'teal'], dragonflies: 0.3 });
        const lanterns = (seed, n, len) => (g, x, y) => W.farolillos(g, { x: x - len / 2, y: y - 100, s: 0.8, n, len, sag: 80, seed });
        heroes(st, [
            ['C', 'castanets', 232, 200, 1.7, 10, 540, 2, { rot: -0.3 }],
            ['P', 'ticket', 300, 140, 1.35, 52, 500, 6, { rot: -0.16 }],
            ['C', 'cards', 436, 268, 1.15, 98, 600, 0, { rot: 0.2 }],
            ['W', 'farolillos', 480, 220, 1, 140, 560, 7, { draw: lanterns('feria-a', 3, 440), pad: 20 }],
            ['P', 'matchbox', 270, 106, 1.8, 180, 560, 3, { rot: 0.3 }],
            ['L', 'score', 244, 184, 1.45, 222, 520, 5, { rot: -0.1 }],
            ['P', 'poster', 420, 600, 0.85, 268, 640, 1, { rot: -0.1 }],
            ['P', 'stamp', 90, 110, 1.9, 312, 460, 8, { rot: 0.14 }],
            ['Ga', 'spray', 260, 330, 1.15, 340, 620, 4, { rot: 0.3 }],
            ['W', 'farolillos', 520, 220, 1, 60, 920, 4, { tag: '2', draw: lanterns('feria-b', 4, 500), pad: 20 }],
            ['Ga', 'carnation', 180, 260, 1, 196, 900, 6, { draw: (g, x, y) => Ga.carnation(g, { x, y: y - 50, r: 78, rot: -0.3, seed: 'feria-clavel', color: 'red', stem: 1.6, leaves: 2 }) }],
            ['P', 'stamp', 90, 110, 1.5, 250, 930, 2, { tag: '2', rot: -0.4, seed: 'feria-stamp-2' }],
        ]);
        find(st, 'horseshoe', 160, 330, 262, 80, (g, x, y) => Rb.horseshoe(g, { x, y, s: 0.8, rot: 0.5 }));
        find(st, 'bee', 290, 300, -262, 76, (g, x, y) => F.bee(g, { x, y, s: 1.3, rot: 0.8, seed: 'feria-bee' }));
        matter(st, 96, { bloom: 28, cup: 7, spray: 5, leaves: 6, florets: 7, bud: 4, carnation: 14, gbud: 4, fly: 3 });
    }
    return layers;
};
