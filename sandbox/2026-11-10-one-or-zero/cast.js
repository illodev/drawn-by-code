// one-or-zero · the cast, as line drawings for Term.picture to turn into characters.
// Every drawer takes the picture context `p` (logical units). A part is drawn as a black
// shape (it hides what is behind), a thin bright outline (the kit turns strokes into
// | / \ _ - ( )) and, inside, a flat faint tone that becomes a texture. What the texture
// is says what the part is made of: each material is painted in its own hue and the kit
// gives it its own character (hair in strands, a pinstripe, a knit, leather, fur).
// Nothing outlined is thinner than a cell (10 × 20 on screen): two edges inside one cell
// turn into noise, so a brim, a strap or a cane is one stroke.
const Cast = (() => {
    const LW = 3.6;                               // an outline, in logical units on screen
    const grey = (v) => {
        const n = Math.round(Math.max(0, Math.min(1, v)) * 255);
        return `rgb(${n},${n},${n})`;
    };
    // The materials: a hue to paint with, the characters its flat cells get, how bright.
    // (Hues away from the inks: white, red, cyan, amber.)
    const HUE = { hair: [1, 0.5, 1], knit: [0.5, 1, 0.5], weave: [0.5, 0.5, 1], hide: [1, 1, 0.5] };
    const hex = ([r, g, b]) => '#' + [r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
    const mat = (m, v) => {
        const [r, g, b] = HUE[m];
        return `rgb(${Math.round(r * v * 255)},${Math.round(g * v * 255)},${Math.round(b * v * 255)})`;
    };
    // What each hue means for each of them. A material's tone is always TONE: low enough
    // for the outline over it to still read as a stroke (a fill brighter than about half
    // its outline swallows it), and the ramp repeats the character so any tone picks it.
    const TONE = 0.32;
    const M = (hue, ch, dim) => ({ color: hex(HUE[hue]), ramp: ' ' + ch.repeat(3), dim });
    const MATS = {
        dog: [M('hair', '|', 1), M('knit', '=', 0.9), M('weave', '*', 1.7), M('hide', '▒', 0.55)],
        suit: [M('hair', '=', 0.9), M('weave', '¦', 0.6), M('hide', '▒', 0.55)],
        teen: [M('hair', '▒', 0.7), M('weave', ':', 0.6), M('hide', '▒', 0.6)],
        old: [M('hair', ':', 0.8), M('knit', '+', 0.6), M('hide', '▒', 0.55)],
        hood: [{ ...M('hide', '·', 0.9), fill: false }, M('weave', '▒', 0.6)],
    };

    // A drawing session at a place and a scale; it keeps the outline the same thickness
    // on screen whatever the scale.
    function pen(p, x, y, s) {
        p.save();
        p.translate(x, y);
        p.scale(s, s);
        p.lineJoin = 'round';
        p.lineCap = 'round';
        const lw = LW / s;
        const run = (pts, close) => {
            p.beginPath();
            pts.forEach(([a, b], n) => (n ? p.lineTo(a, b) : p.moveTo(a, b)));
            if (close) p.closePath();
        };
        const P = {
            lw,
            // a closed shape: path() builds it; o: { fill (tone inside), mat, line, w, ink }
            shape(path, o = {}) {
                p.fillStyle = '#000';
                path();
                p.fill();
                if (o.fill) {
                    p.fillStyle = o.mat ? mat(o.mat, o.fill) : grey(o.fill);
                    path();
                    p.fill();
                }
                if (o.line !== 0) {
                    p.strokeStyle = o.ink ?? grey(o.line ?? 0.9);
                    p.lineWidth = lw * (o.w ?? 1);
                    path();
                    p.stroke();
                }
            },
            // an open stroke through points
            line(pts, o = {}) {
                p.strokeStyle = o.ink ?? grey(o.line ?? 0.9);
                p.lineWidth = lw * (o.w ?? 1);
                run(pts);
                p.stroke();
            },
            // a limb: a thick stroke drawn as its two edges, with its texture between them
            limb(pts, w, o = {}) {
                p.strokeStyle = grey(o.line ?? 0.9);
                p.lineWidth = w;
                run(pts);
                p.stroke();
                p.strokeStyle = '#000';
                p.lineWidth = w - 2 * lw;
                p.stroke();
                if (o.fill) {
                    p.strokeStyle = o.mat ? mat(o.mat, o.fill) : grey(o.fill);
                    p.stroke();
                }
            },
            ell: (x0, y0, rx, ry, rot = 0) => () => {
                p.beginPath();
                p.ellipse(x0, y0, rx, ry, rot, 0, Math.PI * 2);
            },
            rect: (x0, y0, w, h, r = 0) => () => {
                p.beginPath();
                p.roundRect(x0, y0, w, h, r);
            },
            poly: (pts) => () => run(pts, true),
            // a rectangle of whole cells, counted from the drawing's origin (which the scene
            // puts on a cell corner): a filled block or a hole lands on cells exactly
            cells: (c, r, w, h) => () => {
                p.beginPath();
                p.rect((c * 10) / s, (r * 20) / s, (w * 10) / s, (h * 20) / s);
            },
            dot(x0, y0, r, v = 1) {
                p.fillStyle = v ? grey(v) : '#000';
                p.beginPath();
                p.arc(x0, y0, r, 0, Math.PI * 2);
                p.fill();
            },
            end: () => p.restore(),
        };
        return P;
    }
    const COLD = '#5fb4c8', RED = '#ff2e3f';

    // --- a head seen from the front, bowed ----------------------------------------------------
    // Drawn in the pen's units round (x, y). kind: 'dog' (a bob and a fringe), 'suit' (a
    // side parting), 'teen' (a cap and headphones), 'old' (a flat cap, a moustache).
    // lit: the phone lights the jaw from below.
    function head(p, P, x, y, kind, o = {}) {
        const rx = 34, ry = 42;
        p.save();
        p.translate(x, y);
        p.rotate(o.tilt ?? 0);
        // neck
        P.limb([[0, 30], [0, 68]], 34, { line: 0.7 });
        // ears: one stroke each
        if (kind === 'suit' || kind === 'old') {
            P.line([[-rx - 1, -4], [-rx - 8, 4], [-rx - 3, 18]], { line: 0.75 });
            P.line([[rx + 1, -4], [rx + 8, 4], [rx + 3, 18]], { line: 0.75 });
        }
        // the face
        P.shape(P.ell(0, 0, rx, ry), { line: 0.95 });
        if (o.lit) {
            // the phone's light under the chin and along the jaw
            p.strokeStyle = COLD;
            p.lineWidth = P.lw * 1.3;
            p.beginPath();
            p.ellipse(0, 0, rx, ry, 0, Math.PI * 0.2, Math.PI * 0.8);
            p.stroke();
        }
        // lids lowered to the screen, a nose, a mouth
        const shut = kind === 'old';
        P.line([[-21, shut ? 8 : 6], [-8, shut ? 9 : 6]], { line: 0.95 });
        P.line([[8, shut ? 9 : 6], [21, shut ? 8 : 6]], { line: 0.95 });
        P.line([[1, 0], [-2, 17], [5, 18]], { line: 0.5 });
        if (kind !== 'old') P.line([[-7, 29], [7, 29]], { line: 0.75 });
        // hair, or what covers it
        const cap = (drop = 0, lift = 0) => () => {
            p.beginPath();
            p.ellipse(0, -4 - lift, rx + 3, ry + lift, 0, Math.PI, Math.PI * 2);
            p.quadraticCurveTo(0, -30 + drop, -rx - 3, -4 - lift);
            p.closePath();
        };
        if (kind === 'dog') {
            // a bob: the crown, a straight fringe, a curtain down each side to the jaw
            P.shape(P.rect(-rx - 11, -12, 19, 62, 9), { fill: TONE, mat: 'hair', line: 0.9 });
            P.shape(P.rect(rx - 8, -12, 19, 62, 9), { fill: TONE, mat: 'hair', line: 0.9 });
            P.shape(cap(10, 3), { fill: TONE, mat: 'hair', line: 0.9 });
        } else if (kind === 'suit') {
            // combed flat with a parting
            P.shape(cap(4), { fill: TONE, mat: 'hair', line: 0.9 });
            P.line([[-14, -42], [-22, -22]], { ink: '#000', w: 1.6 });
        } else if (kind === 'teen') {
            // a cap, its peak toward us, and headphones over it: a band and two padded cups
            P.shape(cap(2, 2), { fill: 0.14, line: 0.9 });
            P.line([[-rx - 9, -17], [rx + 9, -17]], { line: 1, w: 1.7 });
            p.strokeStyle = grey(0.95);
            p.lineWidth = P.lw * 1.5;
            p.beginPath();
            p.ellipse(0, -6, rx + 12, ry + 14, 0, Math.PI * 1.05, Math.PI * 1.95);
            p.stroke();
            P.shape(P.rect(-rx - 21, -12, 20, 46, 9), { fill: TONE, mat: 'hair', line: 1 });
            P.shape(P.rect(rx + 1, -12, 20, 46, 9), { fill: TONE, mat: 'hair', line: 1 });
        } else if (kind === 'old') {
            // a flat cap: a low crown, a brim wider than the head; white hair at the temples
            P.line([[-rx - 4, -6], [-rx - 6, 10]], { line: 0.6 });
            P.line([[rx + 4, -6], [rx + 6, 10]], { line: 0.6 });
            P.shape(() => {
                p.beginPath();
                p.ellipse(0, -18, rx + 9, ry - 12, 0, Math.PI, Math.PI * 2);
                p.closePath();
            }, { fill: TONE, mat: 'knit', line: 0.9 });
            P.line([[-rx - 19, -17], [rx + 19, -17]], { line: 1, w: 1.7 });
            P.line([[-13, 24], [13, 24]], { line: 0.95, w: 1.9 });
        }
        p.restore();
    }

    // --- a phone between two fists (the forearms' round ends): a lit slab of 4 × 4 cells,
    // the brightest cold thing in the carriage
    function phone(p, P) {
        p.fillStyle = '#000';
        P.cells(-2, -7, 4, 4)();
        p.fill();
        p.fillStyle = COLD;
        P.cells(-2, -7, 4, 4)();
        p.fill();
    }

    // --- a seated passenger, facing us ------------------------------------------------------
    // (x, y) is the middle of the seat's front edge; s scales. o: kind 'dog' | 'suit' |
    // 'teen' | 'old', tilt (the head), lean, nod, beat (the phase of their small loop)
    function seated(p, x, y, s, o = {}) {
        const P = pen(p, x, y, s);
        const kind = o.kind, lean = o.lean ?? 0;
        const old = kind === 'old', dog = kind === 'dog', teen = kind === 'teen', suit = kind === 'suit';
        const sp = teen ? 50 : old ? 44 : 37;
        // what they wear, as [tone, material]
        const top = suit ? [TONE, 'weave'] : old ? [TONE, 'knit'] : [dog ? 0.2 : 0.13];
        const legs = suit ? [TONE, 'weave'] : teen ? [TONE, 'weave'] : [0.1];
        // her handbag on the floor beside her: a soft body, a handle
        if (dog) {
            P.line([[66, 122], [68, 104], [86, 104], [88, 122]], { line: 0.75 });
            P.shape(P.rect(58, 124, 38, 46, 7), { fill: TONE, mat: 'hide', line: 0.9 });
        }
        // shins with a crease, shoes with a sole; knees toward us
        for (const k of [-1, 1]) {
            P.limb([[k * sp, 16], [k * (sp + 3), 150]], 40, { fill: legs[0], mat: legs[1] });
            if (!teen) P.line([[k * sp, 30], [k * (sp + 3), 138]], { line: 0.4 });
            if (dog) P.line([[k * (sp + 2) - 19, 96], [k * (sp + 2) + 19, 96]], { line: 0.85 });      // the top of a boot
            P.shape(P.rect(k * (sp + 6) - 31, 146, 62, 26, 11), teen ? { line: 0.95 } : { fill: TONE, mat: 'hide', line: 0.9 });
            P.line([[k * (sp + 6) - 26, 172], [k * (sp + 6) + 26, 172]], { line: 1, w: teen ? 2.4 : 1.5 });
            P.shape(P.ell(k * sp, 0, 27, 23), { fill: legs[0], mat: legs[1], line: 0.9 });
        }
        if (teen) {
            // a skateboard on end between his knees: grip tape, trucks, wheels
            P.shape(P.rect(-11, -46, 22, 222, 11), { fill: TONE, mat: 'hide', line: 0.95 });
            for (const wy of [-10, 146]) {
                P.line([[-22, wy], [22, wy]], { line: 0.95, w: 1.4 });
                P.dot(-25, wy, 7.5, 1);
                P.dot(25, wy, 7.5, 1);
            }
        }
        // torso
        const torso = () => {
            p.beginPath();
            p.moveTo(-26 + lean, -206);
            p.quadraticCurveTo(-62 + lean, -204, -68 + lean, -170);
            p.lineTo(-55, -8);
            p.lineTo(55, -8);
            p.lineTo(68 + lean, -170);
            p.quadraticCurveTo(62 + lean, -204, 26 + lean, -206);
            p.closePath();
        };
        if (teen) P.shape(P.ell(lean, -212, 50, 22), { fill: 0.13, line: 0.85 });           // the hood, down on his shoulders
        P.shape(torso, { fill: top[0], mat: top[1], line: 0.9 });
        if (suit) {
            // a white shirt between the lapels
            P.shape(P.poly([[-24 + lean, -206], [24 + lean, -206], [lean * 0.5, -140]]), { fill: 0.45, line: 0.9 });
            P.line([[0, -140], [0, -100]], { line: 0.8, w: 1.5 });                           // his tie
            // the badge of where he works, clipped to his pocket
            P.shape(P.cells(3, -9, 3, 2), { line: 0.8 });
        } else if (teen) {
            // drawstrings
            P.line([[-14 + lean, -196], [-16, -140]], { line: 0.8 });
            P.line([[14 + lean, -196], [16, -140]], { line: 0.8 });
        } else if (dog) {
            // a coat, and a striped scarf with one end hanging
            P.shape(P.rect(-40 + lean, -200, 30, 62, 8), { fill: TONE, mat: 'knit', line: 0.9 });
            P.shape(P.rect(-34 + lean, -220, 68, 30, 13), { fill: TONE, mat: 'knit', line: 0.9 });
        } else if (old) {
            // a cardigan open over a white shirt
            P.shape(P.poly([[-22, -206], [22, -206], [0, -124]]), { fill: 0.45, line: 0.9 });
            P.line([[0, -124], [0, -84]], { line: 0.7 });
        }
        // arms: down the sides, forearms in to what they hold
        const hy = old ? -62 : dog ? -30 : -78, hx = old ? 10 : dog ? 50 : 30;
        for (const k of [-1, 1]) {
            P.limb([[k * 62 + lean, -176], [k * 67, -94], [k * hx, hy]], 30, { fill: top[0], mat: top[1] });
        }
        if (dog) {
            // a small white dog sitting on her lap, facing us: the brightest thing she has.
            // A tail that wags, a body, two ears, a head; its eyes and nose are holes of
            // exactly one cell in the fur.
            const wag = Math.round(Math.sin((o.beat ?? 0) * Math.PI * 2));
            P.line([[32, -22], [48 + wag * 8, -46], [52 + wag * 16, -68]], { line: 1, w: 1.4 });
            P.shape(P.rect(-34, -70, 68, 64, 24), { fill: TONE, mat: 'weave', line: 1 });
            P.shape(P.poly([[-31, -96], [-29, -134], [-8, -110]]), { fill: TONE, mat: 'weave', line: 1 });
            P.shape(P.poly([[31, -96], [29, -134], [8, -110]]), { fill: TONE, mat: 'weave', line: 1 });
            P.shape(P.ell(0, -86, 34, 29), { fill: TONE, mat: 'weave', line: 1 });
            p.fillStyle = '#000';
            for (const [c, r, w] of [[-2, -7, 1], [1, -7, 1], [-1, -6, 2]]) {
                P.cells(c, r, w, 1)();
                p.fill();
            }
            // her hands on its flanks
            P.shape(P.ell(-44, -30, 14, 12), { line: 0.9 });
            P.shape(P.ell(44, -30, 14, 12), { line: 0.9 });
        } else if (old) {
            // both hands, one on the other, on a cane with a crook
            P.line([[18, -92], [10, -104], [-2, -100], [0, -80], [0, 172]], { line: 1, w: 1.4 });
            P.shape(P.ell(0, -64, 27, 17), { line: 0.9 });
        } else phone(p, P);
        head(p, P, lean, -262 + (o.nod ?? 0), kind, { tilt: o.tilt, lit: suit || teen });
        P.end();
    }

    // Characters typed over a drawing where a stroke cannot do the job: glasses.
    // Returns [[x, y, text, options], …] in logical units for the scene to place.
    function stamps(kind, x, y, s, o = {}) {
        const hy = y + (-262 + (o.nod ?? 0) + 7) * s;
        if (kind === 'suit') return [[x - 35, hy, '(-)-(-)', { level: 0.95 }]];
        if (kind === 'old') return [[x - 35, hy, '(-)-(-)', { level: 0.8 }]];
        return [];
    }

    // --- the one who watches: a hood in profile, close, in the lower left corner -------------
    // (x, y) is the middle of his head; s scales him. The carriage lights him from the
    // right: the front of the hood and the chest catch it, the back falls off into the dark.
    // He is drawn in two passes, because cloth is light and not line: `hoodTone` paints the
    // shading (the scene converts it with edge: Infinity, so every cell is a step of the
    // ramp), `hoodLines` only strokes, laid over it.
    const hoodCloth = (p) => {
        // from the peak of the hood, back over the crown, down the nape and the back,
        // across the bottom, up the chest to the collar and up the hem of the opening
        p.beginPath();
        p.moveTo(86, -96);
        p.bezierCurveTo(62, -152, -30, -162, -84, -118);
        p.bezierCurveTo(-140, -72, -150, 10, -134, 72);
        p.bezierCurveTo(-176, 98, -214, 152, -228, 240);
        p.lineTo(-236, 460);
        p.lineTo(224, 460);
        p.bezierCurveTo(212, 340, 178, 252, 130, 198);
        p.bezierCurveTo(102, 170, 64, 152, 46, 134);
        p.bezierCurveTo(58, 96, 52, 30, 58, -24);
        p.bezierCurveTo(62, -56, 72, -80, 86, -96);
        p.closePath();
    };
    const hoodFace = (p) => {
        // past the hem: brow, nose, lips, chin, jaw, throat
        p.beginPath();
        p.moveTo(60, -84);
        p.lineTo(92, -82);
        p.quadraticCurveTo(112, -58, 104, -32);
        p.lineTo(140, 16);
        p.quadraticCurveTo(140, 28, 118, 30);
        p.lineTo(124, 44);
        p.lineTo(112, 52);
        p.lineTo(120, 64);
        p.quadraticCurveTo(122, 96, 96, 104);
        p.lineTo(64, 112);
        p.lineTo(40, 150);
        p.lineTo(20, 40);
        p.closePath();
    };
    const STRAP = [[-34, 116], [6, 240], [14, 470]];

    function hoodTone(p, x, y, s = 1) {
        const P = pen(p, x, y, s);
        // a dark margin so the carriage never touches him; the face is skin, kept clean
        p.strokeStyle = '#000';
        p.fillStyle = '#000';
        p.lineWidth = 34;
        hoodCloth(p);
        p.stroke();
        hoodFace(p);
        p.fill();
        // two days without shaving: along the jaw, the chin and the lip
        p.save();
        hoodFace(p);
        p.clip();
        p.strokeStyle = mat('hide', TONE);
        p.lineWidth = 24;
        p.beginPath();
        p.moveTo(72, 46);
        p.quadraticCurveTo(84, 94, 110, 84);
        p.stroke();
        p.restore();
        // the cloth: lit from the right, falling off toward his back
        hoodCloth(p);
        p.fill();
        p.save();
        hoodCloth(p);
        p.clip();
        // light: the lamps on the crown and the front of the hood, the carriage on his chest
        const lamp = (cx, cy, r, v) => {
            const g = p.createRadialGradient(cx, cy, 0, cx, cy, r);
            g.addColorStop(0, grey(v));
            g.addColorStop(0.5, grey(v * 0.5));
            g.addColorStop(1, grey(0));
            p.fillStyle = g;
            p.fillRect(-260, -180, 520, 660);
        };
        p.fillStyle = grey(0.07);
        p.fillRect(-260, -180, 520, 660);
        p.globalCompositeOperation = 'lighter';
        lamp(80, -70, 300, 0.5);
        lamp(-20, -190, 190, 0.3);
        lamp(190, 330, 300, 0.5);
        // and his own screen, somewhere below the frame: its red on the chest
        const rg = p.createRadialGradient(170, 430, 0, 170, 430, 250);
        rg.addColorStop(0, 'rgba(255,46,63,0.85)');
        rg.addColorStop(0.6, 'rgba(255,46,63,0.3)');
        rg.addColorStop(1, 'rgba(255,46,63,0)');
        p.fillStyle = rg;
        p.fillRect(-260, -180, 520, 660);
        p.globalCompositeOperation = 'source-over';
        // folds: a soft valley and a lit ridge beside it. Round the back of the head from
        // the peak, the drape from the nape over the shoulder, the pull down the chest.
        const fold = (a, w = 18, lift = 0.2) => {
            const path = (dx) => {
                p.beginPath();
                p.moveTo(a[0] + dx, a[1]);
                p.bezierCurveTo(a[2] + dx, a[3], a[4] + dx, a[5], a[6] + dx, a[7]);
                p.stroke();
            };
            p.strokeStyle = 'rgba(0,0,0,0.55)';
            p.lineWidth = w;
            path(0);
            p.strokeStyle = `rgba(255,255,255,${lift})`;
            p.lineWidth = w;
            path(w);
        };
        fold([36, -150, -30, -112, -64, -20, -58, 74], 18, 0.16);
        fold([-20, -156, -96, -126, -132, -40, -122, 62], 16, 0.1);
        fold([-104, 92, -150, 180, -148, 300, -160, 460], 22, 0.12);
        fold([-52, 136, -84, 240, -70, 340, -84, 460], 20, 0.16);
        fold([70, 176, 50, 260, 74, 360, 62, 460], 20, 0.22);
        fold([138, 240, 126, 300, 156, 380, 150, 460], 18, 0.24);
        // inside the opening, behind the face: no light at all
        p.fillStyle = '#000';
        p.beginPath();
        p.moveTo(58, -24);
        p.bezierCurveTo(52, 30, 58, 96, 46, 134);
        p.lineTo(20, 120);
        p.lineTo(34, -40);
        p.closePath();
        p.fill();
        // the strap of a pack over the near shoulder: webbing
        p.strokeStyle = mat('weave', TONE);
        p.lineWidth = 40;
        p.beginPath();
        STRAP.forEach(([a, b], n) => (n ? p.lineTo(a, b) : p.moveTo(a, b)));
        p.stroke();
        p.restore();
        P.end();
    }

    function hoodLines(p, x, y, s = 1) {
        const P = pen(p, x, y, s);
        // the face. From the brow to the tip of the nose the lamps light it; everything
        // that faces down (under the nose, the lips, the chin, the jaw) takes the red of
        // the screen in his hand.
        p.strokeStyle = grey(1);
        p.lineWidth = P.lw * 1.2;
        p.beginPath();
        p.moveTo(92, -82);
        p.quadraticCurveTo(112, -58, 104, -32);
        p.lineTo(140, 16);
        p.stroke();
        p.strokeStyle = RED;
        p.beginPath();
        p.moveTo(140, 16);
        p.quadraticCurveTo(140, 28, 118, 30);
        p.lineTo(124, 44);
        p.lineTo(112, 52);
        p.lineTo(120, 64);
        p.quadraticCurveTo(122, 96, 96, 104);
        p.lineTo(64, 112);
        p.lineTo(44, 144);
        p.stroke();
        // (the eye itself is stamped by the scene: the cursor's reflection)
        P.line([[78, -50], [106, -54]], { line: 0.95 });
        P.line([[113, 52], [93, 55]], { ink: RED });
        // the seam where the hood is sewn to the body
        P.line([[-134, 72], [-90, 112], [-20, 134], [46, 134]], { line: 0.5 });
        // the strap's edges, its buckle
        p.save();
        hoodCloth(p);
        p.clip();
        for (const dx of [-21, 21]) P.line(STRAP.map(([a, b]) => [a + dx, b]), { line: 0.75 });
        P.shape(P.rect(-20, 280, 52, 34, 4), { line: 1 });
        p.restore();
        // the lit edges: the hem round the opening and over the peak, the chest line
        p.strokeStyle = grey(1);
        p.lineWidth = P.lw * 1.3;
        p.beginPath();
        p.moveTo(46, 134);
        p.bezierCurveTo(58, 96, 52, 30, 58, -24);
        p.bezierCurveTo(62, -56, 72, -80, 86, -96);
        p.bezierCurveTo(70, -128, 40, -142, 10, -146);
        p.stroke();
        p.beginPath();
        p.moveTo(46, 134);
        p.bezierCurveTo(64, 152, 102, 170, 130, 198);
        p.bezierCurveTo(178, 252, 212, 340, 224, 460);
        p.stroke();
        // the far edges, away from the light
        p.strokeStyle = grey(0.5);
        p.lineWidth = P.lw;
        p.beginPath();
        p.moveTo(10, -146);
        p.bezierCurveTo(-26, -152, -58, -138, -84, -118);
        p.bezierCurveTo(-140, -72, -150, 10, -134, 72);
        p.bezierCurveTo(-176, 98, -214, 152, -228, 240);
        p.lineTo(-236, 460);
        p.stroke();
        // the drawstrings and their tips
        P.line([[64, 150], [58, 232]], { line: 0.85 });
        P.line([[90, 166], [88, 250]], { line: 0.85 });
        P.line([[58, 236], [57, 254]], { line: 1, w: 2 });
        P.line([[88, 254], [88, 272]], { line: 1, w: 2 });
        P.end();
    }

    return { grey, seated, hoodTone, hoodLines, head, pen, MATS, stamps };
})();
