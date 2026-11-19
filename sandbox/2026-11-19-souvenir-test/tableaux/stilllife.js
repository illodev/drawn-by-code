// Picture 4 · The tenebrist still life: the Seville of Velázquez and Zurbarán and the Granada
// of Sánchez Cotán, through their things, never their compositions. Hyper-real, the brush
// manner at its most exact, on black: one hard light from the top left, things in a row on
// stone ledges, each alone with its own shadow. The bodies are the black itself made of
// stone: walls, an arch, a hatch, a window.
//
// The order is a fast: from water to the dark.
//   1 · Water (Velázquez's Seville): the water seller's jug sweating, a glass of water with a
//       fig at its bottom (his gift: the fig sweetens the water), white búcaros, pewter, a
//       folded cloth. Life, and what is given. Through a round arch.
//   2 · Bread (Velázquez's kitchens): the brass mortar and its pestle, garlic, a red onion
//       and one cut, a knife jutting over the edge, eggs in a glazed dish on linen, a braid of
//       garlic. The work of the house. Through a square hatch.
//   3 · The larder and the vanitas (Sánchez Cotán's Charterhouse in Granada; Zurbarán and
//       Valdés Leal in Seville): a quince and a cabbage hung on strings, a cut melon whose
//       slice is the hidden half moon, a cardoon; a cup of water and a rose on a pewter plate
//       (the offering); a candle put out a moment ago, its smoke rising, and the strip of
//       paper «IN ICTV OCVLI» («in the blink of an eye»). Fasting, and the end of the light.
//   Then the window's black square, and in it the way on: a deeper black where one flame
//   waits (picture 5). Each stratum is darker and barer than the one before.
//
// What a second look finds: drops running down the jug and the wet ring it leaves; bubbles
// on the fig; the caustic the glass throws inside its own shadow; a mason's mark on a
// ledge; salt blooming where damp rises in the first wall; a cobweb under a shelf and one
// in a corner of the arch; the pewter's touch mark; a down feather on an egg; the
// caterpillar's hole in the cabbage; the fly on the quince; the ember on the wick.
//   Tableau.stilllife(z0) → layers, the first stratum's nearest sheet at z0
//   Tableau.stilllife.depth: z0 → the plate; .hole: the plate's hole
window.Tableau = window.Tableau || {};
Tableau.stilllife = (z0) => {
    const S = Souvenir, St = Still, TAU = Math.PI * 2;
    const BOX = { x: -1200, y: -720, w: 2400, h: 1440 }, BODY = { x: -1300, y: -790, w: 2600, h: 1580 }, PLATE = { x: -1750, y: -1000, w: 3500, h: 2000 };
    const Z = Tableau.stilllife.Z;
    // The lamp over a sheet: it falls from the top left, strongest on what is near the
    // opening's left and front, dying out to the right and below. lo: what is left in the dark.
    //   peak: how much of the lamp reaches a wall's face (the beam falls on the things and
    //   the ledges; the wall behind them stays nearly black, but the reveal of an opening,
    //   nearer the window the light comes in by, catches it)
    const lampOf = (cx, cy, rad, lo, reveal = 1, peak = 1) => (x, y, f) => {
        const k = lo + (1 - lo) * S.smooth(rad, rad * 0.15, Math.hypot(x - cx, (y - cy) * 1.25));
        return f && f.kind === 'reveal' ? Math.min(1, k * reveal) : f && f.kind === 'face' ? k * peak : k;
    };
    // the dark taking a sheet's far side, on its paint only
    const dusk = (g, box, cx, cy, r0, r1, a, col = '6,4,3') => {
        g.save();
        g.globalCompositeOperation = 'source-atop';
        const gr = g.createRadialGradient(cx, cy, r0, cx, cy, r1);
        gr.addColorStop(0, `rgba(${col},0)`);
        gr.addColorStop(1, `rgba(${col},${a})`);
        g.fillStyle = gr;
        g.fillRect(box.x, box.y, box.w, box.h);
        g.restore();
    };
    // a thing on a ledge's top: how far back on it (0 the arris, 1 the back)
    const onTop = (G, back) => G.y - (G.y - G.y * G.k) * back;
    const cobweb = (g, cx, cy, r, a0, a1, seed) => {
        const rr = Motion.rng('web' + seed), spokes = [];
        for (let i = 0; i <= 9; i++) spokes.push(a0 + ((a1 - a0) * i) / 9 + (rr() - 0.5) * 0.08);
        for (const a of spokes) S.ink(g, [[cx, cy], [cx + Math.cos(a) * r, cy + Math.sin(a) * r]], { w: 0.5, color: '#b8b4ac', alpha: 0.35, taper: [0, 0.6] });
        for (let k = 1; k < 16; k++) {
            const d = (k / 16) * r * (0.9 + rr() * 0.1), pts = spokes.map((a) => [cx + Math.cos(a) * d, cy + Math.sin(a) * d + 1.5 * Math.sin(k)]);
            for (let i = 1; i < pts.length; i++) {
                const m = [(pts[i - 1][0] + pts[i][0]) / 2 - (pts[i][1] - pts[i - 1][1]) * 0.08, (pts[i - 1][1] + pts[i][1]) / 2 + 1.5];
                if (rr() < 0.9) S.ink(g, [pts[i - 1], m, pts[i]], { w: 0.4, color: '#c8c4bc', alpha: 0.28, taper: [0.2, 0.2] });
            }
        }
        // a strand torn loose, hanging, and a dead fly caught in it
        S.ink(g, [[cx + Math.cos(a1) * r * 0.7, cy + Math.sin(a1) * r * 0.7], [cx + Math.cos(a1) * r * 0.75 + 4, cy + Math.sin(a1) * r * 0.7 + 30], [cx + Math.cos(a1) * r * 0.7 + 2, cy + Math.sin(a1) * r * 0.7 + 52]], { w: 0.4, color: '#c8c4bc', alpha: 0.35 });
        St.disc(g, cx + Math.cos((a0 + a1) / 2) * r * 0.55, cy + Math.sin((a0 + a1) / 2) * r * 0.55, 2.2, 'rgba(30,24,20,0.8)');
    };
    const nail = (g, x, y, run = 60) => {
        // an iron nail driven into a joint, its rust run down the stone
        S.ink(g, [[x + 1, y + 3], [x + 2, y + run * 0.5], [x + 1, y + run]], { w: 4, color: '#3a1e0e', alpha: 0.35, taper: [0.2, 1] });
        St.disc(g, x + 2, y + 3, 4.4, 'rgba(0,0,0,0.6)');
        St.disc(g, x, y, 4, '#2a1c14');
        St.disc(g, x - 1.2, y - 1.2, 1.6, '#8a6a50');
    };
    const sheet = (id, dz, box, res, paint, o = {}) => ({
        id: 'stilllife-' + id, z: z0 + dz, box, res, brush: false, ...o,
        paint(g) {
            paint(g);
            // the board's tooth: on the near-black of a wall or the larder it shows as white
            // specks, so less of it there
            S.tooth(g, box, { amp: o.tooth ?? 0.045 });
        },
    });

    // ------------------------------------------------------------------ the openings
    // Each body's opening is wide: the next stratum is read through it (when the next
    // stratum's middle sheet is 1000 away, this wall is about 510 away and twice its size),
    // so its frame shows round the edges and everything behind it shows inside; the way
    // through is only the clear core of it.
    const arch = (() => {
        const R = 430, yS = -100, yB = 250, pts = [[R, yB], [R, yS]];
        for (let i = 1; i < 48; i++) {
            const a = -(i / 48) * Math.PI;
            pts.push([Math.cos(a) * R, yS + Math.sin(a) * R]);
        }
        pts.push([-R, yS], [-R, yB]);
        for (let i = 1; i < 8; i++) pts.push([-R + (2 * R * i) / 8, yB]);
        return pts;
    })();
    const rect = (x0, y0, x1, y1, n = 5) => {
        const pts = [];
        for (let i = 0; i < n; i++) pts.push([x0 + ((x1 - x0) * i) / n, y0]);
        for (let i = 0; i < n; i++) pts.push([x1, y0 + ((y1 - y0) * i) / n]);
        for (let i = 0; i < n; i++) pts.push([x1 - ((x1 - x0) * i) / n, y1]);
        for (let i = 0; i < n; i++) pts.push([x0, y1 - ((y1 - y0) * i) / n]);
        return pts;
    };
    const hatch = rect(-420, -290, 420, 230, 7);
    const window_ = rect(-440, -430, 440, 200, 8);

    return [
        // ============================================================== 3 · the larder: the plate
        // The window's black square: the dark of the larder, its back wall barely there, and
        // the hole (the mouth of a deeper dark) on the axis.
        sheet('plate', Z.plate, PLATE, 0.42, (g) => {
            St.wall(g, PLATE, { seed: 'plate', lamp: (x, y) => 0.02 + 0.12 * S.smooth(800, 0, Math.hypot(x + 300, y + 300)), amb: 0.02, course: 150, block: 360 });
            // an inner shelf deep in the larder, its edge barely caught by the lamp
            const G = St.ledge(g, { x0: -1750, x1: -170, y: 170, face: 50, d: 200, seed: 'plate-shelf', chips: 4, lamp: (x) => 0.12 + 0.2 * S.smooth(-200, -900, x), q: 0.8 });
            // on it, almost lost: a búcaro, a guess in the dark
            const bu = St.bucaroSprite('b', 150 / 1.2, St.resOf(g, 1.2), 'plate');
            g.save();
            g.globalAlpha = 0.35;
            St.put(g, bu, -330, 152, 1.2);
            g.restore();
            dusk(g, PLATE, -340, 60, 0, 420, 0.9);
            // the larder is nearly black: what is on its shelf is only a guess in the dark
            g.save();
            g.globalCompositeOperation = 'source-atop';
            g.fillStyle = 'rgba(6,4,3,0.5)';
            g.fillRect(-700, -200, 650, 420);
            g.restore();
            // the mouth of the deeper dark: a ring of worn stone round the hole
            const gr = g.createRadialGradient(0, 0, 130, 0, 0, 260);
            gr.addColorStop(0, 'rgba(4,3,2,0.95)');
            gr.addColorStop(1, 'rgba(4,3,2,0)');
            g.save();
            g.globalCompositeOperation = 'source-atop';
            g.fillStyle = gr;
            g.fillRect(-300, -300, 600, 600);
            g.restore();
            S.ink(g, Array.from({ length: 41 }, (_, i) => [Math.cos(Math.PI * 0.95 + (i / 40) * 1.3) * 140, Math.sin(Math.PI * 0.95 + (i / 40) * 1.3) * 140]), { w: 2.4, color: '#4a3e30', alpha: 0.6, taper: [0.8, 0.8] });
            g.save();
            g.globalCompositeOperation = 'destination-out';
            g.fillStyle = '#000';
            g.beginPath();
            g.arc(0, 0, Tableau.stilllife.hole, 0, TAU);
            g.fill();
            g.restore();
        }, { hole: Tableau.stilllife.hole, tooth: 0.015 }),

        // ============================================================== 3 · the larder: the window
        sheet('window', Z.s3 + 300, BODY, 0.8, (g) => {
            St.wall(g, BODY, { seed: 'window', open: window_, d: 260, course: 150, block: 360, lamp: lampOf(-650, -500, 1500, 0.02, 0.85, 0.2), amb: 0.025, gain: 0.8 });
            const k = 1000 / 1260;
            // hung from the window's head, as the Carthusians kept them: a quince and a cabbage
            St.hangString(g, [-292, -356], [-292, -330], { seed: 'wq', w: 2.2 });
            St.quince(g, { x: -292, y: -330, s: 1.15, seed: 'win' });
            St.fly(g, { x: -262, y: -196, rot: 0.7, s: 1.25 });
            St.hangString(g, [300, -356], [300, -340], { seed: 'wc', w: 2.2 });
            St.cabbage(g, { x: 300, y: -340, s: 1.05, seed: 'win' });
            // on the sill: the cardoon laid across, its leaves towards the light, and the slice
            // of melon, the hidden half moon
            St.cardoon(g, [430, 198], [70, 166], { seed: 'win' });
            const sl = St.melonSlice(St.resOf(g, 1.3), 'win');
            St.contact(g, -270, 196, 92, 9, 0.85);
            // laid rind up on its cut edge, as slices are: a pale half disc rising from the
            // stone, its green rim above (mirrored top to bottom: its lighting is flat, so
            // nothing about the lamp changes)
            S.put(g, sl, { x: -270, y: 197, sx: 1.3, sy: -1.3 });
            for (const [x, y] of [[-170, 198], [-160, 194], [-356, 196]]) St.oval(g, x, y, 3, 1.4, 0.3, '#e8dcb0');
            // the wall round it: a nail, a cobweb in the window's top corner
            nail(g, 640, -460, 90);
            cobweb(g, -440, -430, 80, -Math.PI, -Math.PI / 2, 'win');
            dusk(g, BODY, -700, -550, 300, 1700, 0.55);
        }, { tooth: 0.025 }),
        // ============================================================== 3 · hung on strings
        sheet('hung', Z.s3 + 150, BOX, 1, (g) => {
            // the melon on a ledge at the lower right, a slice gone from it, a fly at the cut
            const G = St.ledge(g, { x0: -1260, x1: 1260, y: 232, face: 100, d: 440, seed: 'hung', chips: 10, joint: -150, lamp: lampOf(-500, -300, 1900, 0.2) });
            const mb = St.melonBody(St.resOf(g, 1.15), 'hung'), yb = onTop(G, 0.5);
            St.castOn(g, mb, 680, yb, 1.15, { clip: G.top });
            St.contact(g, 680, yb, 160, 20);
            St.put(g, mb, 680, yb, 1.15);
            St.melonCut(g, 740, yb - 172, 56, 46, St.resOf(g), 'hung');
            St.fly(g, { x: 690, y: yb - 168, rot: 2.2, s: 1.2 });
            // two quinces lying on a ledge at the lower left, one with its leaf
            const y2 = onTop(G, 0.5);
            for (const [x, rot, sd] of [[-560, 1.45, 'h1'], [-420, -1.3, 'h2']]) {
                const q = St.quinceSprite(St.resOf(g), sd, rot);
                g.save();
                g.globalCompositeOperation = 'source-atop';
                // the sprite hangs from its stalk at (0, 0), its middle 70 below: lay that middle
                // on the stone at (x, y2 − 58)
                const ax = x + 70 * Math.sin(rot), ay = y2 - 58 - 70 * Math.cos(rot);
                S.put(g, St.shadowOf(q, 6), { x: ax + 40, y: ay + 16, rot, sy: 0.55, alpha: 0.7 });
                g.restore();
                S.put(g, q, { x: ax, y: ay, rot });
            }
            // in the middle of the ledge, low: melon seeds, a curl of rind, a fallen quince leaf
            for (const [x, y, a] of [[-60, y2 + 6, 0.3], [-40, y2 + 10, -0.5], [-20, y2 + 3, 1.1], [120, y2 + 8, 0.2]]) St.oval(g, x, y, 4.2, 2, a, '#e6d8a8');
            S.ink(g, [[30, y2 + 14], [70, y2 + 6], [110, y2 + 12], [130, y2 + 22]], { w: 7, color: '#24401e', alpha: 0.95 });
            S.ink(g, [[32, y2 + 11], [70, y2 + 3], [108, y2 + 9]], { w: 2.4, color: '#d8e0b0', alpha: 0.8 });
            // hung from a beam above the frame: a string of two quinces
            St.hangString(g, [-470, -800], [-470, -470], { seed: 'q2' });
            St.quince(g, { x: -470, y: -470, s: 1.15, seed: 'hq1' });
            dusk(g, BOX, -600, -400, 400, 1700, 0.45);
        }),
        // ============================================================== 3 · the offering and the candle
        sheet('vanitas', Z.s3, BOX, 1, (g) => {
            const G = St.ledge(g, { x0: -1260, x1: 1260, y: 284, face: 110, d: 440, seed: 'van', chips: 11, joint: 260, mark: [-900, 380], lamp: lampOf(-600, -200, 1900, 0.2) });
            const yb = onTop(G, 0.5);
            St.contact(g, -330, yb + 6, 190, 26, 0.7);
            St.plate(g, { x: -330, y: yb, r: 180, flat: true, ey: yb, seed: 'van' });
            const cp = St.cupSprite((yb - 8) / 1.3, St.resOf(g, 1.3), 'van');
            St.castOn(g, cp, -410, yb - 8, 1.3, { clip: G.top, alpha: 0.5 });
            St.put(g, cp, -410, yb - 8, 1.3);
            St.rose(g, { x: -270, y: yb - 2, s: 1.45, seed: 'van' });
            // the candle, put out a moment ago
            const G2 = G, y2 = onTop(G, 0.45);
            St.scatter(g, 80, 700, onTop(G, 0.9), onTop(G, 0.1), { crumb: 8, seed: 0 }, 'van');
            for (const [x, y] of [[520, y2 + 8], [548, y2 + 2], [300, y2 - 6]]) St.oval(g, x, y, 4, 2.2, 0, '#e8e0c8');
            // the burnt match it was lit with
            S.ink(g, [[560, y2 + 14], [640, y2 + 4]], { w: 3, color: '#c8a86a', alpha: 1 });
            St.oval(g, 562, y2 + 14, 4.5, 3, 0.2, '#1a1410');
            St.contact(g, 420, y2, 70, 10);
            const cs = St.candlestick(g, { x: 420, y: y2, wax: 200, s: 1.25, seed: 'van' });
            // the motto, dropped at the candle's foot, its end hanging over the edge
            // (the path runs from the hanging end up and along to the candle, so the letters
            // stand upright; they sit on the part that lies flat)
            St.motto(g, [[180, 344], [186, 296], [220, y2 + 22], [290, y2 + 8], [372, y2 + 2]], { w: 24, size: 17, text: 'IN ICTV OCVLI', align: 0.92 });
            St.smoke(g, cs.wick, { h: 600, drift: -260, alpha: 0.85, seed: 'van' });
            dusk(g, BOX, -500, -300, 500, 1700, 0.4);
        }),

        // ============================================================== 2 · bread: the hatch
        sheet('hatch', Z.s2 + 300, BODY, 0.8, (g) => {
            const lamp = lampOf(-600, -450, 1500, 0.02, 0.9, 0.22);
            St.wall(g, BODY, { seed: 'hatch', open: hatch, d: 220, course: 140, block: 340, lamp, amb: 0.025 });
            const G = St.ledge(g, { x0: -1300, x1: 1300, y: 250, face: 70, d: 280, seed: 'hatchshelf', chips: 8, joint: -60, lamp: lampOf(-500, -100, 1500, 0.15), q: 0.85 });
            const yb = onTop(G, 0.6);
            const pl = St.plateSprite(120, false, yb, St.resOf(g), 'hatch');
            St.castWall(g, pl, -640, yb, 1, { dx: 46, dy: 30, alpha: 0.5 });
            St.contact(g, -640, yb, 100, 8);
            St.put(g, pl, -640, yb);
            const bu = St.bucaroSprite('a', yb, St.resOf(g), 'hatch');
            St.castOn(g, bu, -480, yb + 6, 1, { clip: G.top });
            St.put(g, bu, -480, yb + 6);
            const jg = St.jugSprite(yb / 0.45, St.resOf(g, 0.45), 'hatch');
            St.castOn(g, jg, 560, yb, 0.45, { clip: G.top });
            St.contact(g, 560, yb, 45, 6);
            St.put(g, jg, 560, yb, 0.45);
            St.onion(g, { x: 720, y: yb - 46, s: 0.95, seed: 'hatch' });
            // the braid of garlic on its nail
            St.ristra(g, [880, -470], 470, { n: 9, s: 0.85, seed: 'hatch' });
            cobweb(g, 420, -290, 70, -Math.PI / 2, 0, 'hatch');
            dusk(g, BODY, -650, -450, 300, 1800, 0.5);
        }, { tooth: 0.025 }),
        // ============================================================== 2 · bread: the ledge of the kitchen
        sheet('kitchen', Z.s2 + 150, BOX, 1, (g) => {
            const G = St.ledge(g, { x0: -1200, x1: 1200, y: 210, face: 100, d: 460, seed: 'kitchen', chips: 9, joint: 700, lamp: lampOf(-500, -200, 1700, 0.25) });
            const yb = onTop(G, 0.5), K = 1.35;
            const mo = St.mortarSprite(yb / K, St.resOf(g, K), 'k'), ga = St.garlicSprite(St.resOf(g, 1.4), 'k'), ga2 = St.garlicSprite(St.resOf(g, 1.3), 'k2', 0.5), on = St.onionSprite(St.resOf(g, K), 'k');
            St.castOn(g, mo, -520, yb, K, { clip: G.top });
            St.castOn(g, ga, -300, yb + 6, 1.4, { clip: G.top });
            St.castOn(g, on, 330, yb - on.RY * K, K, { clip: G.top });
            for (const [x, rx] of [[-520, 112], [-300, 62], [330, 70], [470, 66]]) St.contact(g, x, yb + 4, rx, rx * 0.2);
            St.scatter(g, -720, -120, onTop(G, 0.85), onTop(G, 0.1), { pepper: 26, cumin: 30, crumb: 10 }, 'kitchen');
            St.scatter(g, 60, 260, onTop(G, 0.8), onTop(G, 0.2), { crumb: 12, skin: 4 }, 'kitchen2');
            St.put(g, mo, -520, yb, K);
            St.pestle(g, [-505, yb - 190], [-410, yb - 340], { seed: 'k' });
            St.put(g, ga2, -385, yb - 8, 1.3, { rot: 0.5 });
            St.put(g, ga, -300, yb + 6, 1.4);
            St.put(g, St.cloveSprite(St.resOf(g, 1.3), 'k', 0.3), -200, yb + 4, 1.3, { rot: 0.3 });
            St.put(g, St.cloveSprite(St.resOf(g, 1.3), 'k2', -0.4), -228, yb + 12, 1.2, { rot: -0.4 });
            // the knife on the stone, its handle jutting over the edge towards the eye; the
            // handle's shadow falls on the ledge's face
            g.save();
            g.globalCompositeOperation = 'source-atop';
            St.softly(g, 4, (q) => St.poly(q, [[70, 226], [128, 262], [136, 280], [80, 246]], 'rgba(5,3,2,0.7)'));
            g.restore();
            St.knife(g, [-120, yb - 22], [110, 252], { w: 0.95, seed: 'k' });
            St.onionHalf(g, { x: 470, y: yb - 54, s: K, seed: 'k' });
            St.put(g, on, 330, yb - on.RY * K, K);
            // papery skins come off the onion and the garlic
            for (const [x, y, a] of [[400, yb + 10, 0.4], [-250, yb + 12, -0.6], [220, yb + 6, 1.2], [580, yb + 8, 2.2]]) {
                St.poly(g, [[x, y], [x + Math.cos(a) * 18, y + Math.sin(a) * 6 - 3], [x + Math.cos(a) * 28, y + Math.sin(a) * 7 + 1], [x + Math.cos(a) * 10, y + 4]], x > 0 ? 'rgba(176,96,80,0.75)' : 'rgba(236,226,214,0.8)');
            }
            dusk(g, BOX, -400, -200, 500, 1800, 0.4);
        }),
        // ============================================================== 2 · bread: eggs, linen, the braid
        sheet('eggs', Z.s2, BOX, 1, (g) => {
            const G = St.ledge(g, { x0: -1260, x1: 1260, y: 330, face: 110, d: 420, seed: 'eggs', chips: 11, joint: -300, lamp: lampOf(-400, -200, 1900, 0.22) });
            St.linen(g, { x0: 380, x1: 840, y: 330, drop: 180, topY: onTop(G, 0.85), seed: 'eggs' });
            St.scatter(g, -300, 300, onTop(G, 0.85), onTop(G, 0.1), { crumb: 20, skin: 3, seed: 4 }, 'eggs');
            // a broken shell
            for (const [x, a] of [[120, 0.4], [150, 2.6]]) {
                const y = onTop(G, 0.35), pts = [];
                for (let k = 0; k <= 10; k++) pts.push([x + Math.cos(a + (k / 10) * Math.PI) * 16, y + Math.sin(a + (k / 10) * Math.PI) * 9]);
                St.poly(g, pts.map(([p, q]) => [p + 4, q + 3]), 'rgba(4,2,1,0.5)');
                St.poly(g, pts, '#d8b48c');
                S.ink(g, pts, { w: 1.2, color: '#f6ecdc', alpha: 0.8 });
            }
            St.contact(g, 610, onTop(G, 0.45), 180, 20, 0.6);
            St.eggDish(g, { x: 610, y: onTop(G, 0.45), s: 1.2, seed: 'eggs' });
            const G2 = G;
            const on = St.onionSprite(St.resOf(g, 1.2), 'e');
            St.castOn(g, on, -640, onTop(G2, 0.5) - on.RY * 1.2, 1.2, { clip: G2.top });
            St.put(g, on, -640, onTop(G2, 0.5) - on.RY * 1.2, 1.2);
            St.fig(g, { x: -500, y: onTop(G2, 0.4) - 14, rot: 0.3, seed: 'e1' });
            // hung from above the frame: the braid of garlic
            St.ristra(g, [-470, -780], 560, { n: 11, s: 1.1, seed: 'eggs' });
            dusk(g, BOX, -300, -200, 500, 1700, 0.35);
        }),

        // ============================================================== 1 · water: the arch
        sheet('arch', Z.s1 + 300, BODY, 0.8, (g) => {
            const lamp = lampOf(-600, -400, 1500, 0.02, 0.95, 0.24);
            St.wall(g, BODY, { seed: 'arch', open: arch, d: 220, course: 136, block: 330, lamp, amb: 0.03, salt: { y: 470, h: 260, a: 0.7 } });
            for (const side of [-1, 1]) {
                const G = St.ledge(g, side < 0 ? { x0: -1300, x1: -431, y: 250, face: 70, d: 220, seed: 'archL', chips: 6, lamp: lampOf(-700, 0, 1200, 0.2), q: 0.85 } : { x0: 431, x1: 1300, y: 250, face: 70, d: 220, seed: 'archR', chips: 6, mark: [1000, 290], lamp: lampOf(500, 0, 1300, 0.15), q: 0.85 });
                const yb = onTop(G, 0.6);
                if (side > 0) {
                    const pl = St.plateSprite(110, false, yb, St.resOf(g), 'arch');
                    St.castWall(g, pl, 760, yb, 1, { dx: 40, dy: 28, alpha: 0.5 });
                    St.contact(g, 760, yb, 90, 7);
                    St.put(g, pl, 760, yb);
                    for (const [kind, x, sd] of [['a', 540, 'a1'], ['b', 980, 'a2']]) {
                        const bu = St.bucaroSprite(kind, yb / 1.3, St.resOf(g, 1.3), sd);
                        St.castOn(g, bu, x, yb, 1.3, { clip: G.top });
                        St.contact(g, x, yb, 44, 6);
                        St.put(g, bu, x, yb, 1.3);
                    }
                } else {
                    const jg = St.jugSprite(yb / 0.42, St.resOf(g, 0.42), 'arch');
                    St.castOn(g, jg, -560, yb, 0.42, { clip: G.top });
                    St.contact(g, -560, yb, 42, 5);
                    St.put(g, jg, -560, yb, 0.42);
                }
            }
            // the arch's voussoirs: joints radiating from its centre, a keystone, the ring of
            // them a hair proud of the wall (a shadow under its outer edge)
            {
                const R0 = 430, R1 = 545, yS = -100, rv = Motion.rng('vous');
                const ringPts = (rr) => Array.from({ length: 49 }, (_, i) => [Math.cos(-Math.PI + (i / 48) * Math.PI) * rr, yS + Math.sin(-Math.PI + (i / 48) * Math.PI) * rr]);
                g.save();
                g.globalCompositeOperation = 'source-atop';
                S.ink(g, ringPts(R1 + 2), { w: 5, color: '#020101', alpha: 0.55, taper: [0, 0] });
                S.ink(g, ringPts(R1 - 1), { w: 1.2, color: '#5a4a38', alpha: 0.45, taper: [0, 0] });
                for (let i = 1; i < 17; i++) {
                    const a = -Math.PI + (i / 17) * Math.PI + (rv() - 0.5) * 0.02, c = Math.cos(a), sn = Math.sin(a);
                    const p0 = [c * R0, yS + sn * R0], p1 = [c * R1, yS + sn * R1];
                    S.ink(g, [p0, p1], { w: 3.4, color: '#030202', alpha: 0.75, taper: [0, 0] });
                    S.ink(g, [[p0[0] + 1.6, p0[1] + 1.6], [p1[0] + 1.6, p1[1] + 1.6]], { w: 0.8, color: '#6a5842', alpha: 0.35 * (c < 0 ? 1 : 0.4), taper: [0, 0] });
                }
                // the keystone, a little longer, with the mason's date cut in it
                St.poly(g, [[-30, yS - R0 - 2], [30, yS - R0 - 2], [38, yS - R1 - 22], [-38, yS - R1 - 22]], 'rgba(40,32,24,0.55)');
                S.ink(g, [[-38, yS - R1 - 22], [38, yS - R1 - 22]], { w: 1.2, color: '#6a5842', alpha: 0.5 });
                S.textOn(g, '1640', [[-26, yS - R0 - 40], [26, yS - R0 - 40]], { font: "18px 'IM Fell DW Pica SC', serif", color: 'rgba(8,6,4,0.85)', spacing: 1 });
                g.restore();
            }
            nail(g, 640, -420, 70);
            cobweb(g, -430, -100, 90, -Math.PI, -Math.PI * 0.62, 'arch');
            dusk(g, BODY, -650, -450, 300, 1800, 0.45);
        }, { tooth: 0.025 }),
        // ============================================================== 1 · water: the jug and the búcaros
        sheet('jug', Z.s1 + 150, BOX, 1, (g) => {
            const G = St.ledge(g, { x0: -1260, x1: 1260, y: 236, face: 100, d: 480, seed: 'jugL', chips: 11, joint: 120, ring: [-560, 170], mark: [-1000, 280], lamp: lampOf(-600, -300, 1900, 0.2) });
            const yb = onTop(G, 0.55), jg = St.jugSprite(yb, St.resOf(g), 'water');
            St.castOn(g, jg, -560, yb, 1, { clip: G.top });
            St.contact(g, -560, yb, 110, 16);
            St.put(g, jg, -560, yb);
            St.scatter(g, -300, 420, onTop(G, 0.9), onTop(G, 0.1), { crumb: 14, seed: 8, skin: 3, skinColor: 'rgba(120,70,90,0.8)' }, 'jug');
            // a drop fallen from the jug's foot onto the stone
            St.drop(g, -470, yb + 10, 3.4, { dark: [60, 46, 32], lit: [240, 226, 200] });
            const G2 = G, y2 = onTop(G, 0.6);
            for (const [kind, x, s, sd] of [['a', 520, 1.4, 'j1'], ['b', 700, 1.25, 'j2']]) {
                const bu = St.bucaroSprite(kind, y2 / s, St.resOf(g, s), sd);
                St.castOn(g, bu, x, y2, s, { clip: G2.top });
                St.contact(g, x, y2, 36 * s, 5);
                St.put(g, bu, x, y2, s);
            }
            St.fig(g, { x: 850, y: y2 - 12, rot: 2.8, seed: 'j3', s: 1.3 });
            St.fig(g, { x: 930, y: y2 - 6, rot: 0.4, seed: 'j4', s: 1.25 });
            dusk(g, BOX, -500, -300, 500, 1700, 0.35);
        }),
        // ============================================================== 1 · water: the glass and the cloth
        sheet('glass', Z.s1, BOX, 1, (g) => {
            const G = St.ledge(g, { x0: -1260, x1: 1260, y: 326, face: 110, d: 440, seed: 'glassR', chips: 11, joint: -120, lamp: lampOf(-500, -250, 1900, 0.22) });
            const yb = onTop(G, 0.55);
            St.puddle(g, 210, yb + 14, 46, 9, 'glass');
            St.scatter(g, -200, 760, onTop(G, 0.9), onTop(G, 0.08), { crumb: 22, seed: 10 }, 'glass');
            St.glassShadow(g, 296, yb, 1.25, { clip: G.top });
            St.contact(g, 296, yb, 76, 10, 0.6);
            St.glass(g, { x: 296, y: yb, s: 1.25, seed: 'water' });
            St.fig(g, { x: 470, y: yb + 6, rot: 0.2, seed: 'g1', s: 1.4 });
            St.fig(g, { x: 560, y: yb - 6, rot: 2.6, seed: 'g2', s: 1.3 });
            const G2 = G;
            St.linen(g, { x0: -640, x1: -250, y: 326, drop: 160, topY: onTop(G2, 0.85), seed: 'glass' });
            const bu = St.bucaroSprite('b', onTop(G2, 0.5) / 1.5, St.resOf(g, 1.5), 'g2');
            St.castOn(g, bu, -420, onTop(G2, 0.5), 1.5, { clip: G2.top });
            St.contact(g, -420, onTop(G2, 0.5), 52, 7);
            St.put(g, bu, -420, onTop(G2, 0.5), 1.5);
            // a shelf overhead, seen from below, a cobweb under it
            St.ledge(g, { x0: -1260, x1: 1260, y: -500, face: 70, d: 300, seed: 'glassTop', chips: 7, lamp: lampOf(-600, -400, 1600, 0.25) });
            cobweb(g, -760, -430, 90, Math.PI * 0.1, Math.PI * 0.9, 'glass');
            dusk(g, BOX, -400, -300, 500, 1700, 0.3);
        }),
    ];
};
// depths from z0 (the first stratum's nearest sheet): three strata, each of three sheets
// 150 apart, 640 between strata; the plate 280 behind the last wall
Tableau.stilllife.Z = { s1: 0, s2: 640, s3: 1280, plate: 1860 };
Tableau.stilllife.depth = 1860;
Tableau.stilllife.hole = 135;
