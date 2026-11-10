// one-or-zero · the cast, as line drawings for Term.picture to turn into characters.
// Every drawer takes the picture context `p` (logical units, 1600×900). A part is drawn as
// a black shape (it hides what is behind), a thin bright outline (the kit turns strokes
// into | / \ _ - ( ) ' , .) and, inside, a flat faint grey that becomes a sparse texture:
// cloth is dots, hair is denser, skin stays clean. Nothing outlined is thinner than a cell
// (10 × 20 on screen): two edges inside one cell turn into noise, so a brim, a strap or a
// cane is one stroke.
const Cast = (() => {
    const LW = 3.6;                               // an outline, in logical units on screen
    const grey = (v) => {
        const n = Math.round(Math.max(0, Math.min(1, v)) * 255);
        return `rgb(${n},${n},${n})`;
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
        const P = {
            lw,
            // a closed shape: path() builds it; o: { fill (grey inside), line (grey outline) }
            shape(path, o = {}) {
                p.fillStyle = '#000';
                path();
                p.fill();
                if (o.fill) {
                    p.fillStyle = grey(o.fill);
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
            // an open stroke
            line(pts, o = {}) {
                p.strokeStyle = o.ink ?? grey(o.line ?? 0.9);
                p.lineWidth = lw * (o.w ?? 1);
                p.beginPath();
                pts.forEach(([a, b], n) => (n ? p.lineTo(a, b) : p.moveTo(a, b)));
                p.stroke();
            },
            // a limb: a thick stroke drawn as its two edges
            limb(pts, w, o = {}) {
                const run = () => {
                    p.beginPath();
                    pts.forEach(([a, b], n) => (n ? p.lineTo(a, b) : p.moveTo(a, b)));
                    p.stroke();
                };
                p.strokeStyle = grey(o.line ?? 0.9);
                p.lineWidth = w;
                run();
                p.strokeStyle = '#000';
                p.lineWidth = w - 2 * lw;
                run();
                if (o.fill) {
                    p.strokeStyle = grey(o.fill);
                    run();
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
            poly: (pts) => () => {
                p.beginPath();
                pts.forEach(([a, b], n) => (n ? p.lineTo(a, b) : p.moveTo(a, b)));
                p.closePath();
            },
            dot(x0, y0, r, v = 1) {
                p.fillStyle = grey(v);
                p.beginPath();
                p.arc(x0, y0, r, 0, Math.PI * 2);
                p.fill();
            },
            end: () => p.restore(),
        };
        return P;
    }

    // --- a head seen from the front, bowed ----------------------------------------------------
    // Drawn in the pen's units round (x, y). o: hair 'short' | 'bun' | 'cap' | 'hat',
    // eyes 'down' | 'shut' | 'open'
    function head(p, P, x, y, o = {}) {
        const rx = 34, ry = 42;
        p.save();
        p.translate(x, y);
        p.rotate(o.tilt ?? 0);
        // neck
        P.limb([[0, 30], [0, 66]], 34, { line: 0.7 });
        // ears, behind the face
        // the face
        P.shape(P.ell(0, 0, rx, ry), { line: 0.95 });
        // eyes lowered to the screen: two short lids; a nose, a mouth
        const ey = 6;
        P.line([[-21, ey], [-8, ey]], { line: 0.95 });
        P.line([[8, ey], [21, ey]], { line: 0.95 });
        if (o.hair !== 'hat') P.line([[-6, 26], [6, 26]], { line: 0.75 });
        // hair, or what covers it
        const hairTop = () => {
            p.beginPath();
            p.ellipse(0, -4, rx + 3, ry, 0, Math.PI, Math.PI * 2);
            p.quadraticCurveTo(0, -30, -rx - 3, -4);
            p.closePath();
        };
        if (o.hair === 'bun') {
            P.shape(P.ell(0, -ry - 14, 19, 17), { fill: 0.5, line: 0.9 });
            P.shape(hairTop, { fill: 0.5, line: 0.9 });
            // two strands down the sides of her face
            P.line([[-rx - 5, -6], [-rx - 8, 46]], { line: 0.9 });
            P.line([[rx + 5, -6], [rx + 8, 46]], { line: 0.9 });
        } else if (o.hair === 'cap') {
            // a cap, its peak toward us, and headphones over it
            P.shape(hairTop, { fill: 0.2, line: 0.9 });
            P.line([[-rx - 8, -16], [rx + 8, -16]], { line: 1, w: 1.6 });
            p.strokeStyle = grey(0.95);
            p.lineWidth = P.lw * 1.6;
            p.beginPath();
            p.ellipse(0, -6, rx + 11, ry + 12, 0, Math.PI * 1.06, Math.PI * 1.94);
            p.stroke();
            P.shape(P.rect(-rx - 19, -12, 18, 44, 8), { fill: 0.75, line: 1 });
            P.shape(P.rect(rx + 1, -12, 18, 44, 8), { fill: 0.75, line: 1 });
        } else if (o.hair === 'hat') {
            // a flat cap: a low crown, a brim wider than the head
            P.shape(() => {
                p.beginPath();
                p.ellipse(0, -18, rx + 8, ry - 12, 0, Math.PI, Math.PI * 2);
                p.closePath();
            }, { fill: 0.32, line: 0.9 });
            P.line([[-rx - 18, -16], [rx + 18, -16]], { line: 1, w: 1.6 });
            // a moustache
            P.line([[-13, 22], [13, 22]], { line: 0.95, w: 1.8 });
        } else {
            P.shape(hairTop, { fill: 0.42, line: 0.9 });
        }
        p.restore();
    }

    // --- a seated passenger, facing us ------------------------------------------------------
    // (x, y) is the middle of the seat's front edge; s scales. o: kind 'dog' | 'suit' |
    // 'teen' | 'old', hair, cloth (the grey of the texture), nod, tilt, beat (loop phase)
    function seated(p, x, y, s, o = {}) {
        const P = pen(p, x, y, s);
        const c = o.cloth ?? 0.14, lean = o.lean ?? 0;
        const old = o.kind === 'old', dog = o.kind === 'dog', teen = o.kind === 'teen';
        const spread = teen ? 50 : old ? 44 : 36;
        // shins, down past the frame; knees toward us
        for (const k of [-1, 1]) {
            P.limb([[k * spread, 16], [k * (spread + 4), 190]], 38, { fill: o.legs ?? 0.1 });
            P.shape(P.ell(k * spread, 2, 25, 22), { fill: o.legs ?? 0.1, line: 0.85 });
        }
        if (teen) {
            // a skateboard on end between his knees: deck, trucks, wheels
            P.shape(P.rect(-9, -40, 18, 232, 9), { fill: 0.55, line: 0.95 });
            for (const wy of [-8, 150]) {
                P.dot(-19, wy, 7, 1);
                P.dot(19, wy, 7, 1);
            }
        }
        // torso
        P.shape(() => {
            p.beginPath();
            p.moveTo(-26 + lean, -206);
            p.quadraticCurveTo(-62 + lean, -204, -68 + lean, -170);
            p.lineTo(-54, -8);
            p.lineTo(54, -8);
            p.lineTo(68 + lean, -170);
            p.quadraticCurveTo(62 + lean, -204, 26 + lean, -206);
            p.closePath();
        }, { fill: c, line: 0.9 });
        if (o.kind === 'suit') {
            // lapels, a shirt front and a tie
            P.shape(P.poly([[-22 + lean, -206], [22 + lean, -206], [lean * 0.5, -112]]), { line: 0.9 });
            P.shape(P.poly([[-6 + lean, -200], [6 + lean, -200], [5, -138], [0, -124], [-5, -138]]), { fill: 0.85, line: 0.9 });
        } else if (teen) {
            // a hood down on his shoulders, a pocket across the front
            P.line([[-30 + lean, -200], [0, -176], [30 + lean, -200]], { line: 0.8 });
        } else if (dog) {
            // a scarf
            P.shape(P.rect(-32 + lean, -216, 64, 28, 12), { fill: 0.5, line: 0.9 });
        } else if (old) {
            // a cardigan: a row of buttons
            for (const by of [-170, -136, -102]) P.dot(0, by, 4, 0.9);
            P.line([[-20, -206], [0, -182], [20, -206]], { line: 0.8 });
        }
        // arms
        const hy = old ? -64 : dog ? -30 : -80, hx = old ? 9 : dog ? 50 : 30;
        for (const k of [-1, 1]) P.limb([[k * 62 + lean, -176], [k * 66, -92], [k * hx, hy]], 28, { fill: c });
        if (dog) {
            // a small white dog sitting on her lap, facing us: the brightest thing she has.
            // Body, two ears up, a head, dark eyes and nose; its tail wags.
            const wag = Math.round(Math.sin((o.beat ?? 0) * Math.PI * 2));
            P.line([[30, -24], [46 + wag * 8, -50], [50 + wag * 16, -74]], { line: 1, w: 1.4 });
            P.shape(P.rect(-34, -84, 68, 76, 26), { fill: 0.62, line: 1 });
            P.shape(P.poly([[-30, -112], [-26, -150], [-6, -124]]), { fill: 0.9, line: 1 });
            P.shape(P.poly([[30, -112], [26, -150], [6, -124]]), { fill: 0.9, line: 1 });
            P.shape(P.ell(0, -102, 32, 27), { fill: 0.9, line: 1 });
            p.fillStyle = '#000';
            for (const [ex, ey2, er] of [[-13, -106, 6.5], [13, -106, 6.5], [0, -90, 6]]) {
                p.beginPath();
                p.arc(ex, ey2, er, 0, Math.PI * 2);
                p.fill();
            }
            // her hands on its flanks
            P.shape(P.ell(-44, -32, 13, 11), { line: 0.9 });
            P.shape(P.ell(44, -32, 13, 11), { line: 0.9 });
        } else if (old) {
            // both hands on a cane planted between his feet
            P.line([[0, -56], [0, 190]], { line: 1, w: 1.4 });
            P.shape(P.ell(0, -68, 26, 17), { line: 0.9 });
        } else {
            // the phone, lit, between his fists (the forearms' round ends)
            P.shape(P.rect(-17, hy - 44, 34, 60, 5), { fill: 1, ink: '#5fb4c8', w: 1.4 });
            p.fillStyle = '#5fb4c8';
            p.beginPath();
            p.roundRect(-13, hy - 40, 26, 52, 3);
            p.fill();
        }
        head(p, P, lean, -262 + (o.nod ?? 0), { hair: o.hair, tilt: o.tilt, eyes: old ? 'shut' : 'down' });
        P.end();
    }

    // --- the one who watches: a hood in profile, close, in the lower left corner -------------
    // (x, y) is the middle of his head; s scales him. o: blink 0..1
    function hood(p, x, y, s = 1, o = {}) {
        const P = pen(p, x, y, s);
        const cloth = () => {
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
        // a dark margin so the carriage never touches him
        p.strokeStyle = '#000';
        p.lineWidth = 34;
        cloth();
        p.stroke();
        // the face, past the hem: brow, nose, lips, chin, jaw, throat
        P.shape(() => {
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
        }, { line: 1, w: 1.2 });
        // the eye under the brow, the brow itself, the mouth
        // (the eye itself is stamped by the scene: it is the one red thing he has)
        P.line([[80, -48], [104, -52]], { line: 0.95 });
        // the nostril's wing, the line from the nose to the mouth's corner, the ear's hint
        P.line([[118, 22], [110, 14]], { line: 0.7 });
        P.line([[112, 52], [92, 54]], { line: 0.8 });
        // the cloth
        P.shape(cloth, { fill: 0.13, line: 0 });
        // the lit edges: the hem round the opening and over the peak, the chest line
        p.strokeStyle = grey(1);
        p.lineWidth = P.lw * 1.3;
        p.beginPath();
        p.moveTo(46, 134);
        p.bezierCurveTo(58, 96, 52, 30, 58, -24);
        p.bezierCurveTo(62, -56, 72, -80, 86, -96);
        p.bezierCurveTo(70, -128, 40, -142, 10, -146);
        p.stroke();
        p.strokeStyle = grey(1);
        p.lineWidth = P.lw * 1.3;
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
        // the fold where the hood meets the shoulder, the drawstrings
        P.line([[-134, 72], [-90, 110], [-20, 132], [46, 134]], { line: 0.45 });
        P.line([[60, 150], [56, 240]], { line: 0.85 });
        P.line([[84, 164], [82, 250]], { line: 0.85 });
        P.end();
    }

    return { grey, seated, hood, head, pen };
})();
