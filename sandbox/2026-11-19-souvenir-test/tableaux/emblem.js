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
            // what lies behind the emblem, seen through more air: the fruit that names Granada,
            // castanets, cards of the Spanish deck
            id: 'emblem-charms', z: z0 + 75, box: frame,
            paint(g) {
                if (has('Charms')) {
                    Charms.pomegranate(g, { x: -676, y: -322, s: 0.9, rot: 0.25 });
                    Charms.castanets(g, { x: -672, y: 372, s: 0.82, rot: -0.35 });
                    Charms.cards(g, { x: 640, y: 366, s: 0.8, rot: 0.2 });
                }
                // a breath of the night over them
                g.globalCompositeOperation = 'source-atop';
                g.fillStyle = 'rgba(35,39,80,0.3)';
                g.fillRect(frame.x, frame.y, frame.w, frame.h);
                g.globalCompositeOperation = 'source-over';
                if (has('Sky')) {
                    // the waxing moon in the one corner of sky the fans leave, and its stars
                    Sky.moon(g, { x: 632, y: -306, r: 56, rot: -0.5, phase: 0.28 });
                    Sky.star(g, { x: 548, y: -372, r: 13, rot: 0.2 });
                    Sky.star(g, { x: 716, y: -226, r: 10, rot: 0.5, kind: 'silver' });
                    Sky.star(g, { x: -560, y: -392, r: 11, rot: 0.1, kind: 'silver' });
                    Sky.star(g, { x: -742, y: -196, r: 9, rot: 0.6 });
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
                S.tooth(g, frame);
            },
        },
        {
            id: 'emblem-guitar', z: z0, box: { x: -330, y: -720, w: 660, h: 1240 }, hole: 64,
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
            id: 'emblem-strings', z: z0 - 15, box: { x: -80, y: -720, w: 160, h: 1000 },
            paint(g) {
                if (has('Guitar')) Guitar.strings(g, { x: 0, y: 0, s: 1 });
            },
        },
        {
            id: 'emblem-ribbon', z: z0 - 20, box: frame,
            paint(g) {
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
