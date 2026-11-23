// Picture 1 · The emblem, on an indigo night, in the emblem manner (contour + airbrush):
// a flamenco guitar from the front, two fans open behind it as wings, olive, carnations,
// swallows, a crescent moon, a ribbon. The origin is the centre of the guitar's mouth, and
// the camera dives through it. Tableau.emblem(z) → layers, the guitar's top at depth z.
window.Tableau = window.Tableau || {};
Tableau.NIGHT = '#1b1e3d';
Tableau.emblem = (z0) => {
    const S = Souvenir;
    const has = (n) => typeof window[n] !== 'undefined' || (() => { try { return eval('typeof ' + n) !== 'undefined'; } catch (e) { return false; } })();
    const frame = { x: -1000, y: -620, w: 2000, h: 1240 };
    const plate = { x: -1700, y: -1000, w: 3400, h: 2000 };
    const circleHole = (g, r) => {
        g.save();
        g.globalCompositeOperation = 'destination-out';
        g.fillStyle = '#000'; // opaque, whatever the last painter left: a translucent fill cuts half a hole
        g.beginPath();
        g.arc(0, 0, r, 0, 6.3);
        g.fill();
        g.restore();
    };
    return [
        {
            // The same shawl, three times larger and a step behind: from the far end of the
            // passage the night is already embroidered (seen small, its giant flowers are
            // flowers), and it leaves the frame as the camera comes to the real one.
            id: 'emblem-far-shawl', z: z0 + 100, box: { x: -5100, y: -3000, w: 10200, h: 6000 }, res: 0.3, hole: 165, brush: false, far: [0.12, 0.3],
            paint(g) {
                const b = { x: -5100, y: -3000, w: 10200, h: 6000 };
                const gr = g.createRadialGradient(0, 0, 300, 0, 0, 5200);
                gr.addColorStop(0, '#272b58');
                gr.addColorStop(1, Tableau.NIGHT);
                g.fillStyle = gr;
                g.fillRect(b.x, b.y, b.w, b.h);
                if (has('Shawl')) {
                    g.save();
                    g.scale(3, 3);
                    Shawl.ghost(g, plate, { seed: 'far', verses: false });
                    g.restore();
                }
                g.fillStyle = 'rgba(27,30,61,0.3)';
                g.fillRect(b.x, b.y, b.w, b.h);
                circleHole(g, 165);
            },
        },
        {
            // the night: indigo, deeper to the edges, with a shawl's embroidery ghosted in it
            id: 'emblem-plate', z: z0 + 90, box: plate, hole: 150,
            paint(g) {
                const gr = g.createRadialGradient(0, -60, 100, 0, 0, 1500);
                gr.addColorStop(0, '#2c2f63');
                gr.addColorStop(0.45, '#232750');
                gr.addColorStop(1, Tableau.NIGHT);
                g.fillStyle = gr;
                g.fillRect(plate.x, plate.y, plate.w, plate.h);
                if (has('Shawl')) Shawl.ghost(g, plate);
                if (has('Sky')) Sky.field(g, { box: { x: -1500, y: -900, w: 3000, h: 1100 }, seed: 'night', n: 90 });
                S.tooth(g, plate, { amp: 0.06 });
                // the plate has no edge: it dissolves into the night it is painted on
                g.save();
                g.globalCompositeOperation = 'destination-in';
                g.scale(1.7, 1);
                const fade = g.createRadialGradient(0, 0, 720, 0, 0, 990);
                fade.addColorStop(0, 'rgba(0,0,0,1)');
                fade.addColorStop(1, 'rgba(0,0,0,0)');
                g.fillStyle = fade;
                g.fillRect(plate.x, plate.y, plate.w, plate.h);
                g.restore();
                circleHole(g, 150);
            },
        },
        {
            // the emblem's own sky: the waxing moon in the corner the fans leave, and its stars
            // (everything else that used to lie round the emblem is now on the way to it:
            // tableaux/passage.js)
            id: 'emblem-sky', z: z0 + 75, box: frame,
            paint(g) {
                if (has('Sky')) {
                    Sky.moon(g, { x: 722, y: -292, r: 60, rot: -0.5, phase: 0.28 });
                    Sky.star(g, { x: 668, y: -392, r: 12, rot: 0.2 });
                    Sky.star(g, { x: 792, y: -212, r: 10, rot: 0.5, kind: 'silver' });
                    Sky.star(g, { x: -660, y: -372, r: 12, rot: 0.1, kind: 'silver' });
                    Sky.star(g, { x: -742, y: -236, r: 9, rot: 0.6 });
                }
                S.tooth(g, frame);
            },
        },
        {
            id: 'emblem-fans', z: z0 + 40, box: frame,
            paint(g) {
                Fan.draw(g, { x: -140, y: 190, r: 600, a0: Math.PI * 0.97, a1: Math.PI * 1.47, n: 14, seed: 'fanL' });
                Fan.draw(g, { x: 140, y: 190, r: 600, a0: Math.PI * 0.03, a1: -Math.PI * 0.47, n: 14, seed: 'fanR' });
                S.tooth(g, frame);
            },
        },
        {
            id: 'emblem-inside', z: z0 + 30, box: { x: -170, y: -170, w: 340, h: 340 }, hole: 50,
            paint(g) {
                if (has('Guitar')) Guitar.inside(g, { x: 0, y: 0, s: 1 });
                else {
                    const gr = g.createRadialGradient(0, 0, 40, 0, 0, 150);
                    gr.addColorStop(0, '#120a0c');
                    gr.addColorStop(1, '#2a1512');
                    g.fillStyle = gr;
                    g.beginPath();
                    g.arc(0, 0, 150, 0, 6.3);
                    g.fill();
                    circleHole(g, 50);
                }
            },
        },
        {
            // the wreath: two arms of olive hugging the guitar, carnations at its waist
            id: 'emblem-flowers', z: z0 + 12, box: frame,
            paint(g) {
                if (has('Garland')) {
                    Garland.olive(g, { path: [[-200, 440], [-395, 352], [-436, 140], [-356, -70], [-262, -214]], seed: 'left' });
                    Garland.olive(g, { path: [[200, 440], [395, 352], [436, 140], [356, -70], [262, -214]], seed: 'right' });
                    Garland.spray(g, { x: -250, y: 120, s: 1, rot: -0.5, seed: 'L' });
                    Garland.spray(g, { x: 250, y: 120, s: 1, rot: 0.5, seed: 'R' });
                }
                if (has('Fauna')) {
                    // life in the flowers: a bee feeding, one arriving, a ladybird on the olive,
                    // the lizard basking on the fan's guard
                    if (Fauna.lizard) Fauna.lizard(g, { x: -470, y: 232, s: 0.85, rot: -0.12, seed: 'lagarto' });
                    if (Fauna.bee) Fauna.bee(g, { x: -292, y: 52, s: 0.95, rot: 0.6, pose: 'feed', seed: 'b1' });
                    if (Fauna.bee) Fauna.bee(g, { x: 352, y: -6, s: 0.9, rot: 2.6, pose: 'fly', seed: 'b2' });
                    if (Fauna.ladybird) Fauna.ladybird(g, { x: -428, y: 96, s: 1.1, rot: -0.9, seed: 'l1' });
                }
                S.tooth(g, frame);
            },
        },
        {
            id: 'emblem-guitar', z: z0, box: { x: -330, y: -720, w: 660, h: 1240 }, hole: 64, brush: { amp: 0.05, slant: 1.45, wander: 0.25 },
            paint(g) {
                if (has('Guitar')) Guitar.body(g, { x: 0, y: 0, s: 1 });
                else {
                    // stand-in: a body with a mouth
                    const half = [[0, -225], [150, -215], [210, -82], [176, 60], [274, 300], [200, 460], [0, 495]];
                    const pts = S.curve([...half, ...half.slice(1, -1).reverse().map(([x, y]) => [-x, y])], true, 12);
                    S.piece(g, pts, { fill: '#e2b469', line: 3, shade: { color: '#a8742f', alpha: 0.8, w: 60 } });
                    circleHole(g, 64);
                }
                S.tooth(g, { x: -330, y: -720, w: 660, h: 1240 });
            },
        },
        {
            id: 'emblem-strings', z: z0 - 15, box: { x: -80, y: -720, w: 160, h: 1000 }, brush: false,
            paint(g) {
                if (has('Guitar')) Guitar.strings(g, { x: 0, y: 0, s: 1 });
            },
        },
        {
            id: 'emblem-ribbon', z: z0 - 20, box: frame,
            paint(g) {
                // the coins of everyone who passed, in order, hang from the ribbon's lower edge
                if (has('Coins')) {
                    const path = [];
                    for (let i = 0; i <= 24; i++) {
                        const u = i / 24, x = -348 + u * 696;
                        path.push([x, 338 + 62 - 38 * Math.pow(2 * u - 1, 2)]);
                    }
                    Coins.string(g, { path, kinds: Coins.KINDS, r: 27, seed: 'sarta' });
                }
                if (has('Ribbon')) Ribbon.draw(g, { x: 0, y: 338, s: 1, text: 'SONIDOS NEGROS', w: 980, h: 88 });
                S.tooth(g, frame);
            },
        },
        {
            // the swallows that come back («volverán las oscuras golondrinas»), one of them
            // with a key in its bill: the key of the house that was left
            id: 'emblem-front', z: z0 - 60, box: frame,
            paint(g) {
                if (has('Sky')) {
                    // kept clear of the moon and of the pomegranate: a wing across either reads as part of it
                    // the key hangs by its bow from the bill (the bill's tip is at about 373, −123)
                    if (has('Ribbon')) Ribbon.key(g, { x: 374, y: -60, s: 0.5, rot: Math.PI / 2 - 0.12 });
                    Sky.swallow(g, { x: -392, y: -176, s: 0.95, rot: 0.3, pose: 0, seed: 'a' });
                    Sky.swallow(g, { x: 430, y: -136, s: 0.88, rot: 0.2, flip: true, pose: 1, seed: 'b' });
                }
                S.tooth(g, frame);
            },
        },
    ];
};

// ------------------------------------------------------------------ round 8 · loose pieces
// The end of the first passage as loose pieces. The guitar is the ONE thing on the axis: one
// layer facing the camera, its mouth on the origin, `hole: 64` (the rig drops it once the
// mouth is wider than the frame), not loose (the camera's roll is all its turning), its
// strings in front of it; the camera flies through its mouth into the lemon tree, 1340 behind
// (Tableau.lemons.loose). Everything else of the emblem floats round it, each thing its own
// layer, between z0 − 60 and z0 + 400, all round the axis:
//   heroes   the Granada fan (up-left, 150 behind) and the Seville fan (down-right, 260
//            behind), two olive arms (the ladybird on the left one), two carnation sprays
//            (a bee feeding on the left one), the two swallows (one with the key of the
//            house in its bill), the waxing moon far behind, the ribbon «SONIDOS NEGROS»
//            with the string of coins of everyone who passed, the lizard with its tear
//   matter   the shawl's flowers, each with its own leaves (peonies, roses, chrysanthemums,
//            cups, sprays, plum boughs, a songbird, butterflies, a dragonfly), loose
//            carnations and buds, olive twigs, stars, coins, a bee in flight
// In front of the guitar nothing comes within 260 of the axis; behind it nothing comes into
// the mouth's cone while the mouth is in the frame (the inner edge of a piece `dz` behind
// is at least 64 (65 + dz) / 65 + 20 from the axis), so what fills the mouth is the lemon
// tree. No plate, no sky sheet, no far shawl: the night is embroidered with loose flowers.
// The light: the night thickens on each piece's paint away from the guitar and with depth.
Tableau.emblem.loose = (z0) => {
    const S = Souvenir, TAU = Math.PI * 2;
    const layers = [];
    const sq = (cx, cy, half) => ({ x: cx - half, y: cy - half, w: half * 2, h: half * 2 });
    // The night on the paint, in the stratum's coordinates: deeper away from the guitar,
    // and a veil of air on what is far behind it.
    const air = (g, box, dz) => {
        g.save();
        g.globalCompositeOperation = 'source-atop';
        const gr = g.createRadialGradient(0, 0, 420, 0, 0, 1550);
        gr.addColorStop(0, 'rgba(27,30,61,0)');
        gr.addColorStop(1, 'rgba(27,30,61,0.34)');
        g.fillStyle = gr;
        g.fillRect(box.x, box.y, box.w, box.h);
        const k = S.clamp((dz - 90) / 310);
        if (k > 0) {
            g.fillStyle = `rgba(30,34,72,${(0.26 * k).toFixed(3)})`;
            g.fillRect(box.x, box.y, box.w, box.h);
        }
        g.restore();
    };
    // The shawl's motifs cast the thickness of their work on the cloth; loose, there is no
    // cloth, so what is only shadow (never opaque) is taken off and the floss keeps its void.
    const unground = (g) => {
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        const W = g.canvas.width, H = g.canvas.height, img = g.getImageData(0, 0, W, H), d = img.data;
        for (let i = 3; i < d.length; i += 4) {
            const a = d[i];
            if (a < 246) d[i] = a <= 200 ? 0 : Math.round(255 * Math.pow((a - 200) / 46, 1.2));
        }
        g.putImageData(img, 0, 0);
        g.restore();
    };
    const add = (id, dz, box, draw, o = {}) => layers.push({
        id: 'emblem-l-' + id, z: z0 + dz, loose: o.loose ?? true, box, brush: o.brush ?? { amp: 0.06 }, ...(o.res ? { res: o.res } : {}),
        paint(g, res) {
            draw(g, res);
            if (o.air !== false) air(g, box, dz);
            S.tooth(g, box, { amp: 0.06 });
        },
    });

    // ---------------------------------------------------------------- the guitar, on the axis
    layers.push({
        id: 'emblem-l-guitar', z: z0, box: { x: -330, y: -720, w: 660, h: 1240 }, hole: 64, brush: { amp: 0.05, slant: 1.45, wander: 0.25 },
        paint(g) {
            Guitar.body(g, { x: 0, y: 0, s: 1 });
            S.tooth(g, { x: -330, y: -720, w: 660, h: 1240 });
        },
    });
    layers.push({
        id: 'emblem-l-strings', z: z0 - 15, box: { x: -80, y: -720, w: 160, h: 1000 }, brush: false,
        paint(g) {
            Guitar.strings(g, { x: 0, y: 0, s: 1 });
        },
    });

    // ---------------------------------------------------------------- heroes
    // the fans, as wings: Granada at dusk up-left, Seville in the morning down-right
    add('fan-granada', 150, sq(-300, -130, 560), (g) => Fan.draw(g, { x: -300, y: -130, r: 470, a0: Math.PI * 0.97, a1: Math.PI * 1.47, n: 14, seed: 'fanL' }));
    add('fan-sevilla', 270, sq(330, 210, 560), (g) => Fan.draw(g, { x: 330, y: 210, r: 470, a0: -Math.PI * 0.02, a1: Math.PI * 0.48, n: 14, seed: 'fanR' }));
    // the olive arms: the left one with the ladybird on its stem
    add('olive-left', 40, { x: -900, y: -60, w: 760, h: 820 }, (g) => {
        const path = [[-340, 660], [-560, 560], [-700, 380], [-730, 170], [-660, 0]];
        Garland.olive(g, { path, seed: 'loose-left', shoots: 2 });
        Fauna.ladybird(g, { x: -712, y: 300, s: 1.25, rot: -1.2, seed: 'l1' });
    });
    add('olive-right', 110, { x: 160, y: -980, w: 860, h: 800 }, (g) => Garland.olive(g, { path: [[300, -360], [470, -470], [560, -640], [600, -830]], seed: 'loose-right', s: 0.95, shoots: 1 }));
    // the carnations: the left spray with a bee feeding, the right one up and to the right
    add('carnations-left', -30, sq(-560, 230, 290), (g) => {
        Garland.spray(g, { x: -560, y: 200, s: 1, rot: -0.5, seed: 'L' });
        Fauna.bee(g, { x: -602, y: 132, s: 0.95, rot: 0.6, pose: 'feed', seed: 'b1' });
    });
    add('carnations-right', 60, sq(600, -230, 300), (g) => Garland.spray(g, { x: 600, y: -250, s: 1.05, rot: 0.55, seed: 'R' }));
    // the swallows that come back, one with the key of the house that was left in its bill
    add('swallow-key', -50, sq(700, 300, 300), (g) => {
        Ribbon.key(g, { x: 374 + 270, y: -60 + 430, s: 0.5, rot: Math.PI / 2 - 0.12 });
        Sky.swallow(g, { x: 430 + 270, y: -136 + 430, s: 0.88, rot: 0.2, flip: true, pose: 1, seed: 'b' });
    });
    add('swallow', -45, sq(-600, -380, 260), (g) => Sky.swallow(g, { x: -600, y: -380, s: 0.95, rot: 0.3, pose: 0, seed: 'a' }));
    // the waxing moon, far behind, between the neck and the right fan
    add('moon', 390, sq(560, -700, 160), (g) => Sky.moon(g, { x: 560, y: -700, r: 112, rot: -0.5, phase: 0.28 }), { air: false });
    // the shawl's peafowl, worked feather by feather, behind the neck, its train under the moon
    add('peafowl', 210, sq(-120, -520, 420), (g) => {
        Shawl.peafowl(g, { x: -220, y: -470, s: 1.55, rot: 0, flip: true, pose: 0, seed: 'pavo' });
        unground(g);
    });
    // the motto across the guitar's lower bout, and the coins of everyone who passed hanging from it
    add('ribbon', -35, { x: -470, y: 330, w: 940, h: 300 }, (g) => {
        const path = [];
        for (let i = 0; i <= 24; i++) {
            const u = i / 24;
            path.push([-275 + u * 550, 492 - 30 * Math.pow(2 * u - 1, 2)]);
        }
        Coins.string(g, { path, kinds: Coins.KINDS, r: 21, seed: 'sarta' });
        Ribbon.draw(g, { x: 0, y: 438, s: 1, text: 'SONIDOS NEGROS', w: 780, h: 80 });
    });
    // the lizard, weeping (Lorca: «El lagarto está llorando»)
    add('lizard', 110, sq(-800, 420, 190), (g) => Fauna.lizard(g, { x: -800, y: 420, s: 1.15, rot: -0.7, pose: 0, tear: true, seed: 'lagarto' }));

    // ---------------------------------------------------------------- matter
    // Each piece one thing, placed by depth (stratified), angle (a golden turn apart) and
    // distance (denser near the inside), pushed out until it clears the axis and its neighbours.
    const r = Motion.rng('emblem-loose');
    const KINDS = [
        ...Array(15).fill('peony'), ...Array(13).fill('rose'), ...Array(11).fill('mum'), ...Array(7).fill('cup'), ...Array(6).fill('spray'), ...Array(6).fill('bough'),
        ...Array(14).fill('carnation'), ...Array(6).fill('bud'), ...Array(6).fill('olive'), ...Array(10).fill('star'), ...Array(8).fill('coin'),
        'butterfly', 'butterfly', 'butterfly', 'dragonfly', 'dragonfly', 'songbird', 'songbird', 'songbird', 'bee', 'bee',
    ];
    // a deterministic shuffle, so kinds are not grouped by depth
    for (let i = KINDS.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [KINDS[i], KINDS[j]] = [KINDS[j], KINDS[i]];
    }
    const HALF = { peony: 2.5, rose: 2.4, mum: 2.6, cup: 2.6, spray: 1, bough: 1, carnation: 3.2, bud: 1, olive: 1, star: 1.15, coin: 1.5, butterfly: 1.6, dragonfly: 1.5, songbird: 1, bee: 1 };
    const placed = [];
    const clearOf = (x, y, half, dz) => {
        for (const p of placed) if (Math.abs(p.dz - dz) < 70 && Math.hypot(p.x - x, p.y - y) < (p.half + half) * 0.62) return false;
        return true;
    };
    // the heroes claim their room
    for (const [x, y, half, dz] of [[-560, -400, 380, 150], [560, 440, 380, 270], [-640, 320, 330, 40], [460, -600, 300, 110], [-560, 220, 240, 0], [600, -240, 250, 60], [700, 300, 230, -50], [-600, -380, 200, -45], [560, -700, 120, 390], [0, 440, 300, -35], [-800, 420, 140, 110], [-200, -520, 260, 210]]) placed.push({ x, y, half, dz });
    const N = KINDS.length, GOLD = Math.PI * (3 - Math.sqrt(5));
    KINDS.forEach((kind, i) => {
        const dz = -60 + 460 * ((i + r()) / N);
        let size, half;
        switch (kind) {
            case 'peony': size = 44 + r() * 46; break;
            case 'rose': size = 36 + r() * 36; break;
            case 'mum': size = 30 + r() * 26; break;
            case 'cup': size = 38 + r() * 20; break;
            case 'carnation': size = 32 + r() * 20; break;
            case 'star': size = 22 + r() * 18; break;
            case 'coin': size = 34 + r() * 10; break;
            case 'butterfly': size = 21 + r() * 5; break;
            case 'dragonfly': size = 28 + r() * 5; break;
            case 'spray': case 'bough': size = 150 + r() * 70; break;
            case 'olive': size = 260 + r() * 80; break;
            case 'songbird': size = 1.4 + r() * 0.5; break;
            case 'bud': size = 0.95 + r() * 0.3; break;
            case 'bee': size = 1.35; break;
        }
        half = kind === 'spray' || kind === 'bough' ? size * 0.62 : kind === 'olive' ? size * 0.66 : kind === 'songbird' ? 56 * size : kind === 'bud' ? 80 * size : kind === 'bee' ? 40 * size : size * HALF[kind];
        const need = Math.max(275, (64 * (65 + Math.max(0, dz))) / 65 + 20) + half;
        let a = i * GOLD + r() * 0.4, R = need + 1100 * Math.pow(r(), 2.2), x, y, tries = 0;
        do {
            x = Math.cos(a) * R;
            y = Math.sin(a) * R;
            if (clearOf(x, y, half, dz)) break;
            R += 40;
            a += 0.17;
        } while (++tries < 40);
        placed.push({ x, y, half, dz });
        const seed = 'em' + i, rot = r() * TAU, pick = r(), box = sq(x, y, half * 1.35 + 30);
        const leaves = (g, n, len, wid, hue) => {
            for (let k = 0; k < n; k++) Shawl.leaf(g, { x, y, a: rot + (k / n) * TAU + (r() - 0.5) * 0.7, len: len * (0.8 + r() * 0.4), wid: wid * (0.8 + r() * 0.4), bend: (r() - 0.5) * 0.6, hue, seed: seed + 'l' + k });
        };
        const paint = {
            peony: (g) => { leaves(g, 3 + Math.floor(pick * 2), size * 1.75, size * 0.62); Shawl.peony(g, { x, y, r: size, seed }); unground(g); },
            rose: (g) => { leaves(g, 3 + Math.floor(pick * 3), size * 1.7, size * 0.58); Shawl.rose(g, { x, y, r: size, seed }); unground(g); },
            mum: (g) => { leaves(g, 2 + Math.floor(pick * 3), size * 1.9, size * 0.62); Shawl.mum(g, { x, y, r: size, seed }); unground(g); },
            cup: (g) => {
                const ex = x - Math.cos(rot) * size * 0.6, ey = y - Math.sin(rot) * size * 0.6;
                for (let k = 0; k < 2; k++) Shawl.leaf(g, { x: ex, y: ey, a: rot + Math.PI + (k ? 0.9 : -0.9), len: size * 1.6, wid: size * 0.55, bend: k ? 0.3 : -0.3, seed: seed + 'l' + k });
                Shawl.bud(g, { x: x + Math.cos(rot + 1.4) * size * 1.2, y: y + Math.sin(rot + 1.4) * size * 1.2, r: size * 0.3, rot: rot + 0.9, seed: seed + 'b' });
                Shawl.cup(g, { x: ex, y: ey, r: size, rot, seed });
                unground(g);
            },
            spray: (g) => {
                const pts = [];
                for (let k = 0; k <= 4; k++) pts.push([x + Math.cos(rot) * (k / 4 - 0.5) * size + Math.sin(rot) * Math.sin(k * 1.3) * 14, y + Math.sin(rot) * (k / 4 - 0.5) * size - Math.cos(rot) * Math.sin(k * 1.3) * 14]);
                Shawl.spray(g, { pts, seed });
                unground(g);
            },
            bough: (g) => {
                const pts = [];
                for (let k = 0; k <= 5; k++) pts.push([x + Math.cos(rot) * (k / 5 - 0.5) * size + Math.sin(rot) * (r() - 0.5) * 26, y + Math.sin(rot) * (k / 5 - 0.5) * size - Math.cos(rot) * (r() - 0.5) * 26]);
                Shawl.bough(g, { pts, seed });
                unground(g);
            },
            butterfly: (g) => { Shawl.butterfly(g, { x, y, r: size, rot, seed }); unground(g); },
            dragonfly: (g) => { Shawl.dragonfly(g, { x, y, r: size, rot, seed }); unground(g); },
            songbird: (g) => { Shawl.songbird(g, { x, y, s: size, rot: (pick - 0.5) * 0.8, flip: pick < 0.5, seed }); unground(g); },
            carnation: (g) => Garland.carnation(g, { x, y, r: size, rot, seed, color: pick < 0.3 ? 'white' : 'red', stem: 1.6 + r() * 0.8, leaves: 1 }),
            bud: (g) => Garland.bud(g, { x, y, s: size, rot, seed, stem: 60, leaves: 1 }),
            olive: (g) => {
                const path = [];
                for (let k = 0; k <= 3; k++) path.push([x + Math.cos(rot) * (k / 3 - 0.5) * size + Math.sin(rot) * Math.sin(k * 1.1) * 22, y + Math.sin(rot) * (k / 3 - 0.5) * size - Math.cos(rot) * Math.sin(k * 1.1) * 22]);
                Garland.olive(g, { path, seed, s: 0.78, shoots: 0 });
            },
            star: (g) => Sky.star(g, { x, y, r: size, rot, kind: pick < 0.55 ? 'gold' : 'silver' }),
            coin: (g) => Coins.coin(g, { x, y, r: size, kind: Coins.KINDS[Math.floor(pick * Coins.KINDS.length)], rot: (r() - 0.5) * 1.2, seed }),
            bee: (g) => Fauna.bee(g, { x, y, s: size, rot: rot, pose: 'fly', seed }),
        }[kind];
        add(kind + i, dz, box, paint);
    });
    return layers;
};
