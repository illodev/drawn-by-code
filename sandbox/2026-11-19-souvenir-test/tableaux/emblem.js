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
    const wheel = { x: -1250, y: -760, w: 2500, h: 1520 }; // the first, wide framing and a margin
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
            // The wheel of relics behind the emblem, clockwise from the bottom left, oldest
            // first: Tartessos, Phoenicians, Greeks, Rome up the left side; Visigoths and
            // Byzantines at the top; al-Andalus down the right; the kingdoms and the fair
            // at the bottom right. Every call is guarded: a piece that is not painted yet
            // is simply not there.
            id: 'emblem-charms', z: z0 + 75, box: wheel, brush: { amp: 0.06 },
            paint(g) {
                const R = has('Relics') ? Relics : {}, H = has('Heirlooms') ? Heirlooms : {}, P = has('Papers') ? Papers : {}, W = has('Wares') ? Wares : {}, C = has('Charms') ? Charms : {};
                const put = (o, name, a) => o[name] && o[name](g, a);
                // under everything: the papers
                put(P, 'poster', { x: -700, y: 520, s: 0.95, rot: -0.14 });
                put(P, 'plaque', { x: 820, y: 560, s: 0.95, rot: 0.06 });
                put(P, 'ticket', { x: 560, y: 560, s: 0.9, rot: -0.2 });
                // the left side, going up: Tartessos, the Phoenicians, the Greeks, Rome
                put(R, 'stele', { x: -1010, y: 520, s: 0.8, rot: 0.12 });
                put(R, 'carambolo', { x: -905, y: 400, s: 0.92, rot: -0.12 });
                put(R, 'murex', { x: -925, y: 170, s: 0.95, rot: 0.3 });
                put(R, 'helmet', { x: -915, y: -90, s: 0.95, rot: -0.08 });
                put(R, 'amphora', { x: -905, y: -410, s: 0.9, rot: -0.45 });
                put(R, 'mosaic', { x: -500, y: -545, s: 0.78, rot: 0.07 });
                // the top: Visigoths and Byzantines
                put(H, 'votive', { x: 520, y: -560, s: 0.72, rot: 0 });
                put(W, 'peineta', { x: -235, y: -560, s: 0.7, rot: -0.2 });
                // the right side, going down: al-Andalus
                put(H, 'astrolabe', { x: 885, y: -390, s: 0.92, rot: 0.12 });
                put(H, 'fawn', { x: 925, y: -80, s: 0.95, rot: 0 });
                put(H, 'alicatado', { x: 930, y: 205, s: 0.72, rot: 0.1 });
                // the books of those who were born here, passed through or chose this land,
                // a painter's palette, and things of the three faiths
                const L = has('Library') ? Library : {}, D = has('Devotion') ? Devotion : {};
                put(L, 'books', { x: 1030, y: 250, s: 0.8, rot: 0.04 });
                put(L, 'palette', { x: 300, y: -570, s: 0.8, rot: 0.3 });
                put(L, 'score', { x: -330, y: 600, s: 0.85, rot: -0.1 });
                // (the niche plaque is left out: its painter knows of no Andalusi ivory like it,
                // and the wheel only holds things that exist)
                put(D, 'lampara', { x: -1060, y: -250, s: 0.8, rot: 0, servant: true });
                put(D, 'incensario', { x: 740, y: -560, s: 0.75, rot: 0 });
                put(D, 'cirio', { x: -1080, y: 120, s: 0.9, rot: 0.05 });
                put(D, 'rosario', { x: 300, y: 590, s: 0.8, rot: 0.2 });
                put(D, 'jamsa', { x: 1060, y: 520, s: 0.8, rot: -0.1 });
                // the bottom corners: the house and the fair
                put(C, 'pomegranate', { x: -676, y: -322, s: 0.9, rot: 0.25 });
                put(W, 'botijo', { x: -820, y: 600, s: 0.9, rot: 0.06 });
                put(C, 'castanets', { x: -672, y: 372, s: 0.82, rot: -0.35 });
                put(P, 'matchbox', { x: -470, y: 560, s: 0.85, rot: 0.3 });
                put(P, 'stamp', { x: -555, y: 432, s: 0.9, rot: -0.18 });
                put(W, 'fino', { x: 965, y: 440, s: 0.85, rot: 0.05 });
                put(C, 'cards', { x: 640, y: 366, s: 0.8, rot: 0.2 });
                put(W, 'biznaga', { x: 770, y: 250, s: 0.6, rot: 0.25 });
                // a breath of the night over them
                g.globalCompositeOperation = 'source-atop';
                g.fillStyle = 'rgba(35,39,80,0.2)';
                g.fillRect(wheel.x, wheel.y, wheel.w, wheel.h);
                g.globalCompositeOperation = 'source-over';
                if (has('Sky')) {
                    // the waxing moon in the one corner of sky the fans leave, and its stars
                    Sky.moon(g, { x: 632, y: -306, r: 56, rot: -0.5, phase: 0.28 });
                    Sky.star(g, { x: 548, y: -372, r: 13, rot: 0.2 });
                    Sky.star(g, { x: 716, y: -226, r: 10, rot: 0.5, kind: 'silver' });
                    Sky.star(g, { x: -560, y: -392, r: 11, rot: 0.1, kind: 'silver' });
                    Sky.star(g, { x: -742, y: -196, r: 9, rot: 0.6 });
                }
                // the fair's lanterns across the top
                put(W, 'farolillos', { x: -1150, y: -640, s: 1, n: 9, len: 2300, sag: 150, seed: 'feria' });
                S.tooth(g, wheel);
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
                // two jewels in the strips of night beside the neck: the Visigoths' eagle
                // and the Byzantines' cross
                if (has('Heirlooms')) {
                    if (Heirlooms.eagle) Heirlooms.eagle(g, { x: -116, y: -318, s: 0.62, rot: -0.05 });
                    if (Heirlooms.byzantine) Heirlooms.byzantine(g, { x: 118, y: -322, s: 0.62, rot: 0.06 });
                }
                if (has('Fauna')) {
                    // life in the flowers: a bee feeding, one arriving, a ladybird on the olive,
                    // a butterfly by the pomegranate, the lizard basking on the fan's guard
                    if (Fauna.lizard) Fauna.lizard(g, { x: -470, y: 232, s: 0.85, rot: -0.12, seed: 'lagarto' });
                    if (Fauna.bee) Fauna.bee(g, { x: -292, y: 52, s: 0.95, rot: 0.6, pose: 'feed', seed: 'b1' });
                    if (Fauna.bee) Fauna.bee(g, { x: 352, y: -6, s: 0.9, rot: 2.6, pose: 'fly', seed: 'b2' });
                    if (Fauna.ladybird) Fauna.ladybird(g, { x: -428, y: 96, s: 1.1, rot: -0.9, seed: 'l1' });
                    if (Fauna.butterfly) Fauna.butterfly(g, { x: -560, y: -250, s: 0.8, rot: 0.5, fold: 0.25, seed: 'm1' });
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
