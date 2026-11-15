// pier-pressure · runs the cast's drawings written as code (cast/<who>-drawn.js): shapes of
// control points and strokes with a width, grouped by body part. Load after toon.js and
// before the drawings.
//   Drawn.def(who, pose, { w, h, line }, (part, S, L) => { … })   a drawing declares itself:
//       part(name); S(colour, points); L(points, width, closed?, colour?)
//   Drawn.add(who, pose, (part, S, L) => { … })   details authored by hand on top of one
//   Drawn.draw(g, who, pose, x, y, s, { parts: { head: { rot, at: [x, y], dx, dy, sx, sy } }, ink,
//       only: [names], hide: [names], layers: [[names], [names]] })
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
            (color, pts) => cur.fills.push({ color, pts, closed: true, P: toPath(pts, true) }),
            (pts, w, closed, color) => cur.lines.push({ w, color, pts, closed: !!closed, P: toPath(pts, !!closed) }),
        ];
        d.build(...cb);
        for (const b of d.extra) b(...cb);
        // the eyes: a white shape with a small black one inside it (its pupil). Found once, so a
        // drawing can blink (o.blink) and look about (o.look) without being drawn again
        const area = (q) => Math.abs(q.reduce((a, p, i) => a + p[0] * q[(i + 1) % q.length][1] - q[(i + 1) % q.length][0] * p[1], 0)) / 2;
        const mid = (q) => [q.reduce((a, p) => a + p[0], 0) / q.length, q.reduce((a, p) => a + p[1], 0) / q.length];
        const inside = ([x, y], q) => {
            let c = false;
            for (let i = 0, j = q.length - 1; i < q.length; j = i++) if ((q[i][1] > y) !== (q[j][1] > y) && x < ((q[j][0] - q[i][0]) * (y - q[i][1])) / (q[j][1] - q[i][1]) + q[i][0]) c = !c;
            return c;
        };
        for (const p of parts) {
            const whites = p.fills.filter((f) => f.color === T.COL.white && area(f.pts) > 150), blacks = p.fills.filter((f) => f.color === T.COL.ink);
            for (const w of whites) {
                const aw = area(w.pts), pupils = blacks.filter((k) => area(k.pts) < aw * 0.45 && inside(mid(k.pts), w.pts));
                if (pupils.length) {
                    w.eye = true;
                    for (const k of pupils) k.pupilOf = w;
                }
            }
        }
        d.toPath = toPath;
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
                g.scale(m.sx ?? 1, m.sy ?? 1);
                g.translate(-ax, -ay);
            }
        };
        // o.warp: a function of a point of the drawing ([x, y] → [x, y]). Every control point goes
        // through it and the shapes are built again from where they land: the drawing bends
        // (cast/anim.js). o.blink 0…1: the lids come down over the eyes (o.lid: their colour);
        // o.look [dx, dy]: the pupils move inside the eyes. o.halo { color, w }: a sticker's edge.
        const W = o.warp, wp = (pts) => pts.map((q) => { const r = W(q); return q.length > 2 ? [r[0], r[1], q[2]] : r; });
        const pathOf = (f) => (W ? d.toPath((f.wpts = wp(f.pts)), f.closed) : ((f.wpts = f.pts), f.P));
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.lineJoin = 'round';
        g.lineCap = 'round';
        if (o.halo) {
            g.fillStyle = g.strokeStyle = o.halo.color;
            g.lineWidth = o.halo.w * 2;
            for (const p of parts) {
                if ((o.only && o.only.length && !o.only.includes(p.name)) || (o.hide && o.hide.includes(p.name))) continue;
                enter(p); // (the edge goes where each part has been put; `only: []` paints the edge alone)
                g.fillStyle = g.strokeStyle = o.halo.color;
                g.lineWidth = o.halo.w * 2;
                for (const f of p.fills) { const P = pathOf(f); g.fill(P); g.stroke(P); }
                for (const l of p.lines) g.stroke(pathOf(l));
                g.restore();
            }
        }
        const shown = (p) => (!o.only || o.only.includes(p.name)) && !(o.hide && o.hide.includes(p.name));
        // o.layers: groups of parts painted one after another (each its fills, then its lines), so
        // a group that moves over another really covers it, lines and all; otherwise one group
        const groups = o.layers ? o.layers.map((names) => parts.filter((p) => names.includes(p.name))) : [parts];
        for (const group of groups) {
            for (const p of group) {
                if (!shown(p)) continue;
                enter(p);
                for (const f of p.fills) {
                    const P = pathOf(f);
                    f.cur = P;
                    g.fillStyle = f.color;
                    if (f.pupilOf && o.look && !(o.face && Math.hypot(f.pts[0][0] - o.face[0], f.pts[0][1] - o.face[1]) > o.face[2])) {
                        // a pupil, looking: moved, and kept inside its eye
                        g.save();
                        g.clip(f.pupilOf.cur);
                        g.translate(o.look[0], o.look[1]);
                        g.fill(P);
                        g.restore();
                        continue;
                    }
                    g.fill(P);
                    if (f.color !== ink) {
                        // a hair of the colour itself closes the seam with its neighbour under the line
                        g.strokeStyle = f.color;
                        g.lineWidth = 0.7;
                        g.stroke(P);
                    }
                }
                if (o.blink > 0) for (const f of p.fills) {
                    if (!f.eye) continue;
                    // (only the eyes of the face: a shoe's white toe cap with its eyelet is no eye)
                    if (o.face && Math.hypot(f.pts[0][0] - o.face[0], f.pts[0][1] - o.face[1]) > o.face[2]) continue;
                    // the lid: the eye's own shape filled from the top down, and its edge
                    const xs = f.wpts.map((q) => q[0]), ys = f.wpts.map((q) => q[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
                    const shut = o.blink >= 0.99;
                    // (shut, the lid's edge is a happy arc, bowed up; half shut, it sags)
                    const yl = y0 + (y1 - y0) * (shut ? 0.62 : o.blink * 0.72), sag = shut ? -(y1 - y0) * 0.2 : (y1 - y0) * 0.16 * o.blink;
                    f.box = [x0, y0, x1, y1];
                    g.save();
                    g.clip(f.cur);
                    g.fillStyle = o.blink >= 1 ? o.lid ?? '#f3bd90' : o.lid ?? '#f3bd90';
                    g.beginPath();
                    g.moveTo(x0 - 4, y0 - 4);
                    g.lineTo(x1 + 4, y0 - 4);
                    g.lineTo(x1 + 4, yl);
                    g.quadraticCurveTo((x0 + x1) / 2, yl + sag * 2, x0 - 4, yl);
                    g.closePath();
                    g.fill();
                    if (o.blink >= 1) g.fillRect(x0 - 4, y0 - 4, x1 - x0 + 8, y1 - y0 + 8);
                    if (!shut) {
                        g.strokeStyle = ink;
                        g.lineWidth = (d.meta.line ?? 2) * 1.1;
                        g.beginPath();
                        g.moveTo(x0 - 4, yl);
                        g.quadraticCurveTo((x0 + x1) / 2, yl + sag * 2, x1 + 4, yl);
                        g.stroke();
                    }
                    g.restore();
                    if (shut) { g.fillStyle = g.strokeStyle = o.lid ?? '#f3bd90'; g.lineWidth = 2.4; g.fill(f.cur); g.stroke(f.cur); }
                }
                g.restore();
            }
            for (const p of group) {
                if (!shown(p)) continue;
                enter(p);
                // (eyes shut: what is drawn inside an eye, its pupil's edge and its own outline, goes)
                const shutEyes = o.blink >= 0.99 ? p.fills.filter((f) => f.eye && f.box) : [];
                for (const l of p.lines) {
                    if (shutEyes.some((e) => { const m = (e.box[2] - e.box[0]) * 0.07; return l.pts.every((q) => q[0] > e.box[0] - m && q[0] < e.box[2] + m && q[1] > e.box[1] - m && q[1] < e.box[3] + m); })) continue;
                    g.strokeStyle = l.color ?? ink;
                    g.lineWidth = l.w * (o.weight ?? 1);
                    g.stroke(pathOf(l));
                }
                for (const e of shutEyes) {
                    const [x0, y0, x1, y1] = e.box, w = x1 - x0, h = y1 - y0;
                    g.strokeStyle = ink;
                    g.lineWidth = (d.meta.line ?? 2) * 1.15;
                    g.beginPath();
                    g.moveTo(x0 + w * 0.14, y0 + h * 0.62);
                    g.quadraticCurveTo(x0 + w * 0.5, y0 + h * 0.2, x1 - w * 0.14, y0 + h * 0.62);
                    g.stroke();
                }
                g.restore();
            }
        }
        g.restore();
    }
    const colours = (who, pose) => [...new Set(compile(defs[who][pose]).flatMap((p) => p.fills.map((f) => f.color)))];
    return { colours, def, add, draw, size: (who, pose) => [defs[who][pose].meta.w, defs[who][pose].meta.h], parts: (who, pose) => compile(defs[who][pose]).map((p) => p.name) };
})();
