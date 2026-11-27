// drawon-geom.js - measuring strokes, for the script (not the expressions). Plain ES3: it runs
// in ExtendScript inside "Constant Speed Draw-On.jsx", in Node (test.mjs) and in the engine
// preview (scene.js).
//
// Paths are { v, i, o, closed } like After Effects' Shape (tangents relative to their vertex,
// y down). An affine map is [a, b, c, d, e, f]: x' = a x + b y + e, y' = c x + d y + f.
//
// What it rests on, measured in AE 27 (probe/trim-probe.jsx, probe/fit.mjs):
// - Trim Paths cuts at a fraction of the arc length, in the space of the group holding it
//   (worst 0.05 px off); Individually runs through the paths by length, top to bottom.
// - A shape group's transform is Position + R(rotation) K(skew) S(scale) (p - Anchor), with
//   K = R(-axis) [[1, -tan skew], [0, 1]] R(axis) (AE's boxes reproduced to 0.000 px).
// - Rectangles start at the top-right corner (below it when rounded), ellipses and stars at the
//   top, all clockwise. Shape Direction 3 reverses the way from the same first point (open
//   bezier paths: from the last point); 1 and 2 both leave it as drawn (probe 2).
var DG = (function () {
    var K = 0.5522847498307936;     // a quarter circle as one cubic
    var RAD = Math.PI / 180, sqrt = Math.sqrt, abs = Math.abs;
    // Gauss-Legendre, 8 points on [-1, 1]
    var GX = [-0.9602898564975363, -0.7966664774136267, -0.5255324099163290, -0.1834346424956498, 0.1834346424956498, 0.5255324099163290, 0.7966664774136267, 0.9602898564975363];
    var GW = [0.1012285362903763, 0.2223810344533745, 0.3137066458778873, 0.3626837833783620, 0.3626837833783620, 0.3137066458778873, 0.2223810344533745, 0.1012285362903763];

    // ---- affine maps ----
    var ID = [1, 0, 0, 1, 0, 0];
    // a after b (apply b first)
    function mul(a, b) {
        return [a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3], a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3],
            a[0] * b[4] + a[1] * b[5] + a[4], a[2] * b[4] + a[3] * b[5] + a[5]];
    }
    function apply(m, p) {
        return [m[0] * p[0] + m[1] * p[1] + m[4], m[2] * p[0] + m[3] * p[1] + m[5]];
    }
    function rot(deg) {
        var c = Math.cos(deg * RAD), s = Math.sin(deg * RAD);
        return [c, -s, s, c, 0, 0];
    }
    // a shape group's transform { a: anchor, p: position, s: scale %, k: skew, ka: skew axis, r: rotation }
    function groupMatrix(t) {
        var S = [t.s[0] / 100, 0, 0, t.s[1] / 100, 0, 0];
        var Kx = mul(rot(-t.ka), mul([1, -Math.tan(t.k * RAD), 0, 1, 0, 0], rot(t.ka)));
        var M = mul(rot(t.r), mul(Kx, S));
        M = mul(M, [1, 0, 0, 1, -t.a[0], -t.a[1]]);
        M[4] += t.p[0];
        M[5] += t.p[1];
        return M;
    }
    // how far m is from a rotation and a uniform scale (0 = not at all): a stretched or skewed
    // map makes the pen faster one way than the other
    function stretch(m) {
        var sx = sqrt(m[0] * m[0] + m[2] * m[2]), sy = sqrt(m[1] * m[1] + m[3] * m[3]);
        var dot = (m[0] * m[1] + m[2] * m[3]) / (sx * sy || 1);
        return abs(sx - sy) / (Math.max(sx, sy) || 1) + abs(dot);
    }
    function mapPath(m, P) {
        var v = [], i = [], o = [], k, q, lin = [m[0], m[1], m[2], m[3], 0, 0];
        for (k = 0; k < P.v.length; k++) {
            q = apply(m, P.v[k]);
            v.push(q);
            i.push(apply(lin, P.i[k]));
            o.push(apply(lin, P.o[k]));
        }
        return { v: v, i: i, o: o, closed: P.closed };
    }

    // ---- AE's parametric shapes as paths (where its Trim Paths starts, which way it goes) ----
    function reverse(P) {
        // the same outline the other way round, from the same first point
        var n = P.v.length, v = [], i = [], o = [], k, j;
        for (k = 0; k < n; k++) {
            j = P.closed ? (n - k) % n : n - 1 - k;
            v.push(P.v[j]);
            i.push(P.o[j]);
            o.push(P.i[j]);
        }
        return { v: v, i: i, o: o, closed: P.closed };
    }
    function rect(size, pos, round, dir) {
        var w = size[0] / 2, h = size[1] / 2, r = Math.min(Math.max(round, 0), w, h), x = pos[0], y = pos[1], P, k = r * K;
        if (r <= 0) {
            P = { v: [[x + w, y - h], [x + w, y + h], [x - w, y + h], [x - w, y - h]], i: [[0, 0], [0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0], [0, 0]], closed: true };
        } else {
            P = {
                v: [[x + w, y - h + r], [x + w, y + h - r], [x + w - r, y + h], [x - w + r, y + h], [x - w, y + h - r], [x - w, y - h + r], [x - w + r, y - h], [x + w - r, y - h]],
                i: [[0, -k], [0, 0], [k, 0], [0, 0], [0, k], [0, 0], [-k, 0], [0, 0]],
                o: [[0, 0], [0, k], [0, 0], [-k, 0], [0, 0], [0, -k], [0, 0], [k, 0]],
                closed: true
            };
        }
        return dir == 3 ? reverse(P) : P;
    }
    function ellipse(size, pos, dir) {
        var a = size[0] / 2, b = size[1] / 2, x = pos[0], y = pos[1];
        var P = {
            v: [[x, y - b], [x + a, y], [x, y + b], [x - a, y]],
            i: [[-a * K, 0], [0, -b * K], [a * K, 0], [0, b * K]],
            o: [[a * K, 0], [0, b * K], [-a * K, 0], [0, -b * K]],
            closed: true
        };
        return dir == 3 ? reverse(P) : P;
    }
    // type 1 star, 2 polygon; roundness is left out (the length is then a little short)
    function star(type, points, pos, rotation, inner, outer, dir) {
        var n = Math.max(3, Math.round(points)), v = [], z = [], k, a, r, step = type == 2 ? 360 / n : 180 / n;
        for (k = 0; k < (type == 2 ? n : 2 * n); k++) {
            a = (rotation + k * step) * RAD;
            r = type == 2 || k % 2 === 0 ? outer : inner;
            v.push([pos[0] + r * Math.sin(a), pos[1] - r * Math.cos(a)]);
            z.push([0, 0]);
        }
        var P = { v: v, i: z, o: z.slice(0), closed: true };
        return dir == 3 ? reverse(P) : P;
    }

    // ---- lengths ----
    function segs(P) {
        var out = [], n = P.v.length, k, a, b, j;
        for (k = 0; k < n - 1 + (P.closed && n > 1 ? 1 : 0); k++) {
            j = (k + 1) % n;
            a = P.v[k];
            b = P.v[j];
            out.push([a[0], a[1], a[0] + P.o[k][0], a[1] + P.o[k][1], b[0] + P.i[j][0], b[1] + P.i[j][1], b[0], b[1]]);
        }
        return out;
    }
    function point(c, t) {
        var u = 1 - t, A = u * u * u, B = 3 * u * u * t, C = 3 * u * t * t, D = t * t * t;
        return [A * c[0] + B * c[2] + C * c[4] + D * c[6], A * c[1] + B * c[3] + C * c[5] + D * c[7]];
    }
    function speedAt(c, t) {
        var u = 1 - t;
        var x = 3 * u * u * (c[2] - c[0]) + 6 * u * t * (c[4] - c[2]) + 3 * t * t * (c[6] - c[4]);
        var y = 3 * u * u * (c[3] - c[1]) + 6 * u * t * (c[5] - c[3]) + 3 * t * t * (c[7] - c[5]);
        return sqrt(x * x + y * y);
    }
    // arc length of segment c between t0 and t1
    function arc(c, t0, t1) {
        var h = (t1 - t0) / 2, m = (t0 + t1) / 2, s = 0;
        for (var g = 0; g < 8; g++) s += GW[g] * speedAt(c, m + h * GX[g]);
        return s * h;
    }

    // Samples a stroke, items = [{ P, M }] in the order Trim Paths runs through them: each path P
    // in its own group's space and M, that space -> comp (affine). Returns, at N + 1 points per
    // segment, the distance Trim Paths counts and the distance the eye sees (comp pixels).
    // Trim Paths counts each path's length in its own group, before that group's transform: a
    // root trim over a group scaled 200 % gives it the share of its unscaled length (probe 2).
    // An item may carry Q instead of M: its sample points already in the comp, in the order
    // points(item) gives them (a 3D layer seen through a camera is not affine: After Effects
    // places every point itself).
    var N = 24;
    function points(item) {
        var out = [], sg = segs(item.P), s, j;
        for (s = 0; s < sg.length; s++) for (j = s === 0 ? 0 : 1; j <= N; j++) out.push(apply(item.M, point(sg[s], j / N)));
        return out;
    }
    function sample(items) {
        var T = [0], V = [0], pts = [], tAcc = 0, vAcc = 0, vHalf = 0, prev = null, prev2 = null, p, q, k, s, c, sg, j, dx, dy, M, Q, qi;
        for (k = 0; k < items.length; k++) {
            sg = segs(items[k].P);
            M = items[k].M;
            Q = items[k].Q;
            qi = 0;
            if (!sg.length) continue;
            // the next path starts afresh (the jump between paths is not drawn)
            prev = null;
            prev2 = null;
            for (s = 0; s < sg.length; s++) {
                c = sg[s];
                for (j = s === 0 ? 0 : 1; j <= N; j++) {
                    p = point(c, j / N);
                    q = Q ? Q[qi++] : apply(M, p);
                    if (prev) {
                        tAcc += arc(c, (j - 1) / N, j / N);
                        dx = q[0] - prev[0];
                        dy = q[1] - prev[1];
                        vAcc += sqrt(dx * dx + dy * dy);
                        if (j % 2 === 0 && prev2) {
                            dx = q[0] - prev2[0];
                            dy = q[1] - prev2[1];
                            vHalf += sqrt(dx * dx + dy * dy);
                        }
                        T.push(tAcc);
                        V.push(vAcc);
                    }
                    if (j % 2 === 0) prev2 = q;
                    prev = q;
                    pts.push(q);
                }
            }
        }
        return { T: T, V: V, pts: pts, vHalf: vHalf };
    }

    var KNOTS = 64;      // a stretched stroke's table: 0.24 % of its length off at worst (0.64 % with 32)
    // { len (comp px), trimLen, map (0 or KNOTS + 1 trim fractions), first, last, box, center, closed }
    function measure(items) {
        var S = sample(items), n = S.T.length, tL = S.T[n - 1], vL = S.V[n - 1], k, j, map = [], dev = 0, paths = [];
        for (k = 0; k < items.length; k++) paths.push(items[k].P);
        if (!(tL > 0) || S.pts.length < 2) return { len: 0, trimLen: 0, map: 0, first: S.pts[0] || [0, 0], last: S.pts[0] || [0, 0], box: [0, 0, 0, 0], center: S.pts[0] || [0, 0], closed: true };
        // Richardson on the chord sums (every point, every other point): curves converge fast
        var len = vL + (vL - S.vHalf) / 3;
        if (abs(vL - S.vHalf) > vL * 0.01 || !(len > 0)) len = vL;
        j = 0;
        for (k = 0; k <= KNOTS; k++) {
            var target = (vL * k) / KNOTS;
            while (j < n - 2 && S.V[j + 1] < target) j++;
            var span = S.V[j + 1] - S.V[j], f = span > 0 ? (target - S.V[j]) / span : 0;
            var tf = (S.T[j] + (S.T[j + 1] - S.T[j]) * Math.min(Math.max(f, 0), 1)) / tL;
            map.push(Math.round(tf * 1e5) / 1e5);
            dev = Math.max(dev, abs(tf - k / KNOTS));
        }
        map[0] = 0;
        map[KNOTS] = 1;
        var x0 = 1e30, y0 = 1e30, x1 = -1e30, y1 = -1e30;
        for (k = 0; k < S.pts.length; k++) {
            x0 = Math.min(x0, S.pts[k][0]);
            y0 = Math.min(y0, S.pts[k][1]);
            x1 = Math.max(x1, S.pts[k][0]);
            y1 = Math.max(y1, S.pts[k][1]);
        }
        var closed = paths.length === 1 && paths[0].closed;
        return {
            len: len, trimLen: tL, map: dev > 0.002 ? map : 0, deviation: dev,
            first: S.pts[0], last: S.pts[S.pts.length - 1], box: [x0, y0, x1, y1], center: [(x0 + x1) / 2, (y0 + y1) / 2], closed: closed
        };
    }

    // ---- orders ----
    var ORDERS = ['Layer order', 'Reverse layer order', 'Left to right', 'Right to left', 'Top to bottom', 'Bottom to top', 'Center out', 'Outside in', 'Random'];
    // Park-Miller, exact in doubles: the same shuffle in ExtendScript and Node
    function shuffle(n, seed) {
        var a = [], k, j, t, s = seed % 2147483647;
        if (s <= 0) s += 2147483646;
        for (k = 0; k < n; k++) a.push(k);
        for (k = n - 1; k > 0; k--) {
            s = (s * 16807) % 2147483647;
            j = Math.floor(((s - 1) / 2147483646) * (k + 1));
            t = a[k];
            a[k] = a[j];
            a[j] = t;
        }
        return a;
    }
    // strokes: [{ stack (draw order in the timeline), center, first, last, closed }] ->
    // { rank: [order][stroke], flip: [order][stroke] }
    function orders(strokes, seed) {
        var n = strokes.length, rank = [], flip = [], o, k, idx, cx = 0, cy = 0, x0 = 1e30, y0 = 1e30, x1 = -1e30, y1 = -1e30;
        for (k = 0; k < n; k++) {
            x0 = Math.min(x0, strokes[k].center[0]);
            y0 = Math.min(y0, strokes[k].center[1]);
            x1 = Math.max(x1, strokes[k].center[0]);
            y1 = Math.max(y1, strokes[k].center[1]);
        }
        cx = (x0 + x1) / 2;
        cy = (y0 + y1) / 2;
        function dist(p) {
            return sqrt((p[0] - cx) * (p[0] - cx) + (p[1] - cy) * (p[1] - cy));
        }
        var rnd = shuffle(n, seed || 1);
        var key = [
            function (s) { return s.stack; },
            function (s) { return -s.stack; },
            function (s) { return s.center[0]; },
            function (s) { return -s.center[0]; },
            function (s) { return s.center[1]; },
            function (s) { return -s.center[1]; },
            function (s) { return dist(s.center); },
            function (s) { return -dist(s.center); },
            function (s, k2) { return rnd[k2]; }
        ];
        // does "Follow the order" reverse an open stroke? (its end comes first in this order)
        var later = [
            null, null,
            function (s) { return s.last[0] < s.first[0] - 0.5; },
            function (s) { return s.last[0] > s.first[0] + 0.5; },
            function (s) { return s.last[1] < s.first[1] - 0.5; },
            function (s) { return s.last[1] > s.first[1] + 0.5; },
            function (s) { return dist(s.last) < dist(s.first) - 0.5; },
            function (s) { return dist(s.last) > dist(s.first) + 0.5; },
            null
        ];
        for (o = 0; o < ORDERS.length; o++) {
            idx = [];
            for (k = 0; k < n; k++) idx.push({ k: k, v: key[o](strokes[k], k), s: strokes[k].stack });
            // ExtendScript's sort is not stable: ties go by timeline order
            idx.sort(function (a, b) {
                return (a.v - b.v) || (a.s - b.s) || (a.k - b.k);
            });
            var r = [], f = [];
            for (k = 0; k < n; k++) r[idx[k].k] = k;
            for (k = 0; k < n; k++) f.push(later[o] && !strokes[k].closed && later[o](strokes[k]) ? 1 : 0);
            rank.push(r);
            flip.push(f);
        }
        return { rank: rank, flip: flip };
    }

    return {
        ID: ID, mul: mul, apply: apply, groupMatrix: groupMatrix, stretch: stretch, mapPath: mapPath,
        rect: rect, ellipse: ellipse, star: star, reverse: reverse, segs: segs, point: point, arc: arc,
        sample: sample, points: points, measure: measure, ORDERS: ORDERS, orders: orders, shuffle: shuffle, KNOTS: KNOTS
    };
})();
