// pier-pressure · draws the cast from the measured data of their approved concept sheets
// (cast/<who>-ref.js, written by tools/trace.py): every flat colour as polygons that run under
// the ink, then the ink itself. Load before the data files.
//   Ref.draw(g, 'kit', 'jump', x, y, s)    (x, y): the pose's top left; s: units per sheet pixel
//   Ref.size('kit', 'jump') → [w, h] in sheet pixels
(() => {
    const cache = new Map();
    const R = (window.Ref ??= {});
    // a pose's layers as Path2D, built once
    const paths = (who, pose) => {
        const key = who + '/' + pose;
        if (!cache.has(key)) {
            cache.set(key, R[who][pose].layers.map((l) => {
                const P = new Path2D();
                for (const poly of l.p) {
                    P.moveTo(poly[0][0], poly[0][1]);
                    for (let i = 1; i < poly.length; i++) P.lineTo(poly[i][0], poly[i][1]);
                    P.closePath();
                }
                return { c: l.c, P, ink: !!l.ink };
            }));
        }
        return cache.get(key);
    };
    Object.defineProperty(R, 'draw', {
        value(g, who, pose, x, y, s = 1) {
            g.save();
            g.translate(x, y);
            g.scale(s, s);
            g.lineJoin = 'round';
            for (const l of paths(who, pose)) {
                g.fillStyle = l.c;
                g.fill(l.P, 'evenodd');
                if (!l.ink) {
                    // a hair of the colour itself closes the seams between neighbours under the ink
                    g.strokeStyle = l.c;
                    g.lineWidth = 0.6;
                    g.stroke(l.P);
                }
            }
            g.restore();
        },
    });
    Object.defineProperty(R, 'size', { value: (who, pose) => [R[who][pose].w, R[who][pose].h] });
})();
