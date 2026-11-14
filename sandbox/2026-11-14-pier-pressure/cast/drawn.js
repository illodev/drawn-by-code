// pier-pressure · runs the cast's drawings written as code (cast/<who>-drawn.js): shapes of
// control points and strokes with a width, grouped by body part. Load after toon.js and
// before the drawings.
//   Drawn.def(who, pose, { w, h, line }, (part, S, L) => { … })   a drawing declares itself:
//       part(name); S(colour, points); L(points, width, closed?, colour?)
//   Drawn.add(who, pose, (part, S, L) => { … })   details authored by hand on top of one
//   Drawn.draw(g, who, pose, x, y, s, { parts: { head: { rot, at: [x, y], dx, dy } }, ink,
//       only: [names], hide: [names] })
//   Drawn.size(who, pose) → [w, h]
// Shapes are compiled once into paths through SkateToon.path (smooth runs between corners).
// All fills are painted first, then all strokes, each inside its part's transform, so a part
// can be turned about a point without its line being painted over by a neighbour.
const Drawn = (() => {
    const T = SkateToon;
    const defs = {};
    function def(who, pose, meta, build) {
        (defs[who] ??= {})[pose] = { meta, build, extra: [], parts: null };
    }
    // Details authored by hand on top of a drawing (cast/<who>-details.js): same callbacks;
    // part(name) goes back into an existing part. Fills land over the part's fills and under
    // every line; strokes after the part's own.
    function add(who, pose, build) {
        defs[who][pose].extra.push(build);
        defs[who][pose].parts = null;
    }
    function compile(d) {
        if (d.parts) return d.parts;
        const parts = [];
        let cur = null;
        const toPath = (pts, closed) => {
            const p = T.path(pts, closed), P = new Path2D();
            P.moveTo(p[0][0], p[0][1]);
            for (let i = 1; i < p.length; i++) P.lineTo(p[i][0], p[i][1]);
            if (closed) P.closePath();
            return P;
        };
        const cb = [
            (name) => {
                cur = parts.find((p) => p.name === name);
                if (!cur) parts.push((cur = { name, fills: [], lines: [] }));
            },
            (color, pts) => cur.fills.push({ color, P: toPath(pts, true) }),
            (pts, w, closed, color) => cur.lines.push({ w, color, P: toPath(pts, !!closed) }),
        ];
        d.build(...cb);
        for (const b of d.extra) b(...cb);
        return (d.parts = parts);
    }
    function draw(g, who, pose, x, y, s = 1, o = {}) {
        const d = defs[who][pose], parts = compile(d), ink = o.ink ?? T.COL.ink;
        const enter = (p) => {
            const m = o.parts?.[p.name];
            g.save();
            if (m) {
                const [ax, ay] = m.at ?? [0, 0];
                g.translate(ax + (m.dx ?? 0), ay + (m.dy ?? 0));
                g.rotate(m.rot ?? 0);
                g.translate(-ax, -ay);
            }
        };
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        const shown = (p) => (!o.only || o.only.includes(p.name)) && !(o.hide && o.hide.includes(p.name));
        for (const p of parts) {
            if (!shown(p)) continue;
            enter(p);
            for (const f of p.fills) {
                g.fillStyle = f.color;
                g.fill(f.P);
                if (f.color !== ink) {
                    // a hair of the colour itself closes the seam with its neighbour under the line
                    g.strokeStyle = f.color;
                    g.lineWidth = 0.7;
                    g.stroke(f.P);
                }
            }
            g.restore();
        }
        for (const p of parts) {
            if (!shown(p)) continue;
            enter(p);
            for (const l of p.lines) {
                g.strokeStyle = l.color ?? ink;
                g.lineWidth = l.w * (o.weight ?? 1);
                g.stroke(l.P);
            }
            g.restore();
        }
        g.restore();
    }
    return { def, add, draw, size: (who, pose) => [defs[who][pose].meta.w, defs[who][pose].meta.h], parts: (who, pose) => compile(defs[who][pose]).map((p) => p.name) };
})();
