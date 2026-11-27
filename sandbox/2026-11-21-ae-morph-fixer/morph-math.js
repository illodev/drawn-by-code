// morph-math.js - the morph fixer's math, plain ES3: runs in ExtendScript ("Mask Morph Fixer.jsx"),
// Node (test.mjs) and the engine preview (scene.js).
//
// A path is { v: [[x, y], ...], i: [[dx, dy], ...], o: [[dx, dy], ...], closed: bool }, like
// an After Effects Shape: vertices, and in/out tangents relative to their vertex.
//
// MF.fix(paths, options) takes the shapes of a path's keyframes and returns them with the
// same number of points, the same direction and aligned start points, each shape unchanged:
// points are only added by splitting a bezier segment where it is (de Casteljau), the start
// only moves along the outline and the direction is only reversed.
var MF = (function () {
    var SUB = 24;           // samples per segment for arc length
    var N = 128;            // samples per outline when comparing shapes
    var EPS = 0.002;        // fractions of the outline closer than this are the same point
    var SNAP = 0.004;       // a new start this close to an existing point uses that point
    var GAIN = 0.95;        // a start or direction change must cut the error by 5 % or more

    function copy(P) {
        var R = { v: [], i: [], o: [], closed: P.closed };
        for (var k = 0; k < P.v.length; k++) {
            R.v.push([P.v[k][0], P.v[k][1]]);
            R.i.push([P.i[k][0], P.i[k][1]]);
            R.o.push([P.o[k][0], P.o[k][1]]);
        }
        return R;
    }

    function segCount(P) {
        return P.closed ? P.v.length : P.v.length - 1;
    }

    // segment k as 8 numbers: p0, p1, p2, p3
    function seg(P, k) {
        var n = P.v.length, k1 = (k + 1) % n, a = P.v[k], b = P.v[k1];
        return [a[0], a[1], a[0] + P.o[k][0], a[1] + P.o[k][1], b[0] + P.i[k1][0], b[1] + P.i[k1][1], b[0], b[1]];
    }

    function bez(c, t) {
        var u = 1 - t, a = u * u * u, b = 3 * u * u * t, d = 3 * u * t * t, e = t * t * t;
        return [a * c[0] + b * c[2] + d * c[4] + e * c[6], a * c[1] + b * c[3] + d * c[5] + e * c[7]];
    }

    // derivative, for projecting a point onto a segment
    function dbez(c, t) {
        var u = 1 - t;
        return [3 * u * u * (c[2] - c[0]) + 6 * u * t * (c[4] - c[2]) + 3 * t * t * (c[6] - c[4]),
            3 * u * u * (c[3] - c[1]) + 6 * u * t * (c[5] - c[3]) + 3 * t * t * (c[7] - c[5])];
    }

    // cumulative arc length, SUB samples per segment
    function measure(P) {
        var m = segCount(P), cum = [], start = [], total = 0;
        for (var k = 0; k < m; k++) {
            var c = seg(P, k), row = [0], px = c[0], py = c[1], acc = 0;
            for (var j = 1; j <= SUB; j++) {
                var p = bez(c, j / SUB), dx = p[0] - px, dy = p[1] - py;
                acc += Math.sqrt(dx * dx + dy * dy);
                row.push(acc);
                px = p[0];
                py = p[1];
            }
            start.push(total);
            cum.push(row);
            total += acc;
        }
        start.push(total);
        return { cum: cum, start: start, total: total, m: m };
    }

    // arc length s -> segment k and parameter t
    function locate(M, s) {
        if (M.m < 1 || M.total <= 0 || s <= 0) return { k: 0, t: 0 };
        if (s >= M.total) return { k: M.m - 1, t: 1 };
        var lo = 0, hi = M.m - 1;
        while (lo < hi) {
            var mid = (lo + hi + 1) >> 1;
            if (M.start[mid] <= s) lo = mid;
            else hi = mid - 1;
        }
        var r = s - M.start[lo], row = M.cum[lo], j = 1;
        while (j < SUB && row[j] < r) j++;
        var a = row[j - 1], b = row[j], f = b > a ? (r - a) / (b - a) : 0;
        return { k: lo, t: (j - 1 + f) / SUB };
    }

    function wrap(P, f) {
        return P.closed ? f - Math.floor(f) : (f < 0 ? 0 : (f > 1 ? 1 : f));
    }

    // the point at fraction f of the outline
    function at(P, M, f) {
        var L = locate(M, wrap(P, f) * M.total);
        return bez(seg(P, L.k), L.t);
    }

    // where each vertex sits, as a fraction of the outline
    function fractions(P, M) {
        var out = [], n = P.v.length;
        for (var k = 0; k < n; k++) out.push(M.total > 0 ? M.start[k < M.m ? k : M.m] / M.total : (n > 1 ? k / (n - 1) : 0));
        return out;
    }

    // de Casteljau: segment c split at t into [left, right]
    function split(c, t) {
        var x01 = c[0] + (c[2] - c[0]) * t, y01 = c[1] + (c[3] - c[1]) * t;
        var x12 = c[2] + (c[4] - c[2]) * t, y12 = c[3] + (c[5] - c[3]) * t;
        var x23 = c[4] + (c[6] - c[4]) * t, y23 = c[5] + (c[7] - c[5]) * t;
        var xa = x01 + (x12 - x01) * t, ya = y01 + (y12 - y01) * t;
        var xb = x12 + (x23 - x12) * t, yb = y12 + (y23 - y12) * t;
        var x = xa + (xb - xa) * t, y = ya + (yb - ya) * t;
        return [[c[0], c[1], x01, y01, xa, ya, x, y], [x, y, xb, yb, x23, y23, c[6], c[7]]];
    }

    // adds points at the outline fractions fr, without changing the shape
    function insert(P, fr) {
        if (!fr.length) return copy(P);
        var M = measure(P), n = P.v.length, byK = [], k, j;
        for (k = 0; k < M.m; k++) byK.push([]);
        for (j = 0; j < fr.length; j++) {
            var L = locate(M, wrap(P, fr[j]) * M.total);
            byK[L.k].push(L.t);
        }
        var inT = [], outT = [], extra = [];
        for (k = 0; k < n; k++) {
            inT.push([P.i[k][0], P.i[k][1]]);
            outT.push([P.o[k][0], P.o[k][1]]);
            extra.push([]);
        }
        for (k = 0; k < M.m; k++) {
            var ts = byK[k];
            if (!ts.length) continue;
            ts.sort(function (a, b) { return a - b; });
            var c = seg(P, k), pieces = [], done = 0;
            for (j = 0; j < ts.length; j++) {
                var tt = 1 - done > 1e-12 ? (ts[j] - done) / (1 - done) : 0;
                var s2 = split(c, tt < 0 ? 0 : (tt > 1 ? 1 : tt));
                pieces.push(s2[0]);
                c = s2[1];
                done = ts[j];
            }
            pieces.push(c);
            outT[k] = [pieces[0][2] - pieces[0][0], pieces[0][3] - pieces[0][1]];
            for (j = 1; j < pieces.length; j++) {
                var pp = pieces[j], q = pieces[j - 1];
                extra[k].push({ v: [pp[0], pp[1]], i: [q[4] - q[6], q[5] - q[7]], o: [pp[2] - pp[0], pp[3] - pp[1]] });
            }
            var last = pieces[pieces.length - 1];
            inT[(k + 1) % n] = [last[4] - last[6], last[5] - last[7]];
        }
        var R = { v: [], i: [], o: [], closed: P.closed };
        for (k = 0; k < n; k++) {
            R.v.push([P.v[k][0], P.v[k][1]]);
            R.i.push(inT[k]);
            R.o.push(outT[k]);
            for (j = 0; j < extra[k].length; j++) {
                R.v.push(extra[k][j].v);
                R.i.push(extra[k][j].i);
                R.o.push(extra[k][j].o);
            }
        }
        return R;
    }

    // the same outline drawn the other way (a closed path keeps its start point)
    function reverse(P) {
        var n = P.v.length, R = { v: [], i: [], o: [], closed: P.closed };
        for (var k = 0; k < n; k++) {
            var s = P.closed ? (n - k) % n : n - 1 - k;
            R.v.push([P.v[s][0], P.v[s][1]]);
            R.i.push([P.o[s][0], P.o[s][1]]);
            R.o.push([P.i[s][0], P.i[s][1]]);
        }
        return R;
    }

    // a closed path starting at vertex s
    function rotate(P, s) {
        var n = P.v.length, R = { v: [], i: [], o: [], closed: P.closed };
        for (var k = 0; k < n; k++) {
            var j = (s + k) % n;
            R.v.push([P.v[j][0], P.v[j][1]]);
            R.i.push([P.i[j][0], P.i[j][1]]);
            R.o.push([P.o[j][0], P.o[j][1]]);
        }
        return R;
    }

    // N points (or count) evenly spaced along the outline (from its start), and their mean
    function samples(P, M, count) {
        var n = count || N, pts = [], cx = 0, cy = 0, cnt = P.closed ? n : n - 1;
        for (var j = 0; j < n; j++) {
            var p = at(P, M, j / cnt);
            pts.push(p);
            cx += p[0];
            cy += p[1];
        }
        return { pts: pts, cx: cx / n, cy: cy / n };
    }

    // signed area (positive = clockwise on screen, y down)
    function area(P) {
        var s = samples(P, measure(P)).pts, a = 0;
        for (var j = 0; j < s.length; j++) {
            var p = s[j], q = s[(j + 1) % s.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return a / 2;
    }

    // Matching points a_j (of A) and b_j (of B), each around its own centre. Without turn:
    // the sum of squared distances. With turn: the same after the rotation that best lays B
    // onto A (2D Procrustes: theta = atan2(S', Sd), the residual |a|^2 + |b|^2 - 2 |(Sd, S')|).
    // Returns { e, theta } (theta in radians, clockwise on screen like AE: R(theta) b ~ a).
    function fit(sa2, sb2, sd, sc, plain, turn) {
        if (!turn) return { e: plain, theta: 0 };
        var e = sa2 + sb2 - 2 * Math.sqrt(sd * sd + sc * sc);
        return { e: e > 0 ? e : 0, theta: Math.atan2(sc, sd) };
    }

    // the match of A's samples with B read from fraction off on
    function errorAt(SA, P, M, cB, off, turn) {
        var plain = 0, sa2 = 0, sb2 = 0, sd = 0, sc = 0, cnt = P.closed ? N : N - 1;
        for (var j = 0; j < N; j++) {
            var b = at(P, M, off + j / cnt);
            var ax = SA.pts[j][0] - SA.cx, ay = SA.pts[j][1] - SA.cy, bx = b[0] - cB[0], by = b[1] - cB[1];
            plain += (ax - bx) * (ax - bx) + (ay - by) * (ay - by);
            sa2 += ax * ax + ay * ay;
            sb2 += bx * bx + by * by;
            sd += ax * bx + ay * by;
            sc += ay * bx - ax * by;
        }
        return fit(sa2, sb2, sd, sc, plain, turn);
    }

    // the start offset of closed path B that best matches A (turn: allowing B to be turned):
    // { off, err, err0 (at offset 0), theta (radians, the turn laying B onto A) }
    function bestOffset(A, B, turn) {
        var SA = samples(A, measure(A)), MB = measure(B), SB = samples(B, MB), cB = [SB.cx, SB.cy];
        var best = 0, bestE = -1, q, j, sa2 = 0, sb2 = 0, grid = [], thetas = [];
        for (j = 0; j < N; j++) {
            sa2 += (SA.pts[j][0] - SA.cx) * (SA.pts[j][0] - SA.cx) + (SA.pts[j][1] - SA.cy) * (SA.pts[j][1] - SA.cy);
            sb2 += (SB.pts[j][0] - SB.cx) * (SB.pts[j][0] - SB.cx) + (SB.pts[j][1] - SB.cy) * (SB.pts[j][1] - SB.cy);
        }
        for (q = 0; q < N; q++) {        // every offset on the sample grid
            var plain = 0, sd = 0, sc = 0;
            for (j = 0; j < N; j++) {
                var b = SB.pts[(j + q) % N];
                var ax = SA.pts[j][0] - SA.cx, ay = SA.pts[j][1] - SA.cy, bx = b[0] - SB.cx, by = b[1] - SB.cy;
                plain += (ax - bx) * (ax - bx) + (ay - by) * (ay - by);
                sd += ax * bx + ay * by;
                sc += ay * bx - ax * by;
            }
            var fq = fit(sa2, sb2, sd, sc, plain, turn), e = fq.e;
            grid.push(e);
            thetas.push(fq.theta);
            if (bestE < 0 || e < bestE) {
                bestE = e;
                best = q;
            }
        }
        // golden-section refinement between the grid neighbours
        var lo = (best - 1) / N, hi = (best + 1) / N, g = 0.6180339887;
        var x1 = hi - g * (hi - lo), x2 = lo + g * (hi - lo);
        var f1 = errorAt(SA, B, MB, cB, x1, turn).e, f2 = errorAt(SA, B, MB, cB, x2, turn).e;
        for (var it = 0; it < 24; it++) {
            if (f1 < f2) {
                hi = x2;
                x2 = x1;
                f2 = f1;
                x1 = hi - g * (hi - lo);
                f1 = errorAt(SA, B, MB, cB, x1, turn).e;
            } else {
                lo = x1;
                x1 = x2;
                f1 = f2;
                x2 = lo + g * (hi - lo);
                f2 = errorAt(SA, B, MB, cB, x2, turn).e;
            }
        }
        var off = (lo + hi) / 2, r = errorAt(SA, B, MB, cB, off, turn);
        if (r.e > bestE) {
            off = best / N;
            r = errorAt(SA, B, MB, cB, off, turn);
        }
        return {
            off: off - Math.floor(off), err: r.e, err0: errorAt(SA, B, MB, cB, 0, turn).e, theta: r.theta, turn: !!turn,
            grid: grid, thetas: thetas, SA: SA, SB: SB
        };
    }

    // how closed path P should be matched to prev. With o.rotate, a match that allows a turn
    // wins when it cuts the error by TURN_GAIN or more (a circle never "turns": no gain), and
    // only against a plain match that is really off: over 0.5 px RMS. Two near-identical keys
    // (a hold) otherwise "turn" on rounding noise, and a symmetric star spins a tip round.
    var TURN_GAIN = 0.8, TURN_FLOOR = 0.25 * N;
    function chooseOffset(prev, P, o) {
        var plain = bestOffset(prev, P, false);
        if (!o.rotate || plain.err <= TURN_FLOOR) return plain;
        var turned = bestOffset(prev, P, true);
        return turned.err < plain.err * TURN_GAIN ? turned : plain;
    }

    // RMS distance (px) between matching points of two keys, around their centres
    function rms(A, B) {
        var SA = samples(A, measure(A)), MB = measure(B), SB = samples(B, MB);
        return Math.sqrt(errorAt(SA, B, MB, [SB.cx, SB.cy], 0, false).e / N);
    }

    function circDist(a, b) {
        var d = a - b;
        d = d - Math.floor(d);
        return d > 0.5 ? 1 - d : d;
    }

    // the vertex nearest outline fraction f: { k, d }
    function nearestVertex(P, f) {
        var fr = fractions(P, measure(P)), k = 0, d = 1;
        for (var j = 0; j < fr.length; j++) {
            if (circDist(fr[j], f) < d) {
                d = circDist(fr[j], f);
                k = j;
            }
        }
        return { k: k, d: d };
    }

    // ---- crossover: an in-between whose outline crosses itself ------------------------------
    // A morph can pass through outlines that cross themselves: the shape pinches into two or
    // more lobes for a few frames (real type: a into e, M into W). Among the starts, cheapest
    // first (CROSS_TRIES of them), the fix takes one whose in-betweens don't cross. Checked on 64
    // points of each outline (every other sample) at 19 in-betweens: a crossover can last under
    // a tenth of the morph (a into e: around u = 0.45 only), and nine checks missed it. Travel
    // only orders them (0.19, the user: "aesthetic and intentional movement is what's important,
    // not efficiency"): within 20 % more travel, 201 of 540 letter pairs still crossed and 188
    // pinched; from any start, 141 and 144, for 10 % more travel and time.
    var XU = [];
    for (var xu = 1; xu < 20; xu++) XU.push(xu / 20);
    var CROSS_SLACK = Infinity, CROSS_TRIES = 48;

    // do segments ab and pq cross (strictly)?
    function crosses(a, b, p, q) {
        var d1 = (q[0] - p[0]) * (a[1] - p[1]) - (q[1] - p[1]) * (a[0] - p[0]);
        var d2 = (q[0] - p[0]) * (b[1] - p[1]) - (q[1] - p[1]) * (b[0] - p[0]);
        var d3 = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
        var d4 = (b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]);
        return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
    }

    // do ab and pq cross, an end within a millionth (of the two lengths) of the other's line
    // counting as touching, not crossing? A warp built symmetric meets itself exactly on the
    // axis, where slivers a hundredth of a pixel long read as crossings in rounding
    function crossesClearly(a, b, p, q) {
        var e = 1e-6 * Math.sqrt(((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1])) * ((q[0] - p[0]) * (q[0] - p[0]) + (q[1] - p[1]) * (q[1] - p[1])));
        var d1 = (q[0] - p[0]) * (a[1] - p[1]) - (q[1] - p[1]) * (a[0] - p[0]);
        var d2 = (q[0] - p[0]) * (b[1] - p[1]) - (q[1] - p[1]) * (b[0] - p[0]);
        var d3 = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
        var d4 = (b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]);
        return ((d1 > e && d2 < -e) || (d1 < -e && d2 > e)) && ((d3 > e && d4 < -e) || (d3 < -e && d4 > e));
    }

    // how many times the closed outline through pts crosses itself (up to `limit`): edges
    // sorted by their left end, so only edges that overlap in x are compared (clearly: touching
    // edges don't count, as crossesClearly)
    function selfCrossings(pts, limit, clearly) {
        var n = pts.length, ed = [], i, j, c = 0;
        for (i = 0; i < n; i++) {
            var a = pts[i], b = pts[(i + 1) % n];
            ed.push({ i: i, a: a, b: b, x0: Math.min(a[0], b[0]), x1: Math.max(a[0], b[0]), y0: Math.min(a[1], b[1]), y1: Math.max(a[1], b[1]) });
        }
        ed.sort(function (p, q) { return (p.x0 - q.x0) || (p.i - q.i); });
        for (i = 0; i < n; i++) {
            var e = ed[i];
            for (j = i + 1; j < n && ed[j].x0 <= e.x1; j++) {
                var f = ed[j], d = e.i - f.i;
                if (d === 1 || d === -1 || d === n - 1 || d === 1 - n) continue;      // neighbours meet
                if (f.y0 > e.y1 || f.y1 < e.y0) continue;
                if ((clearly ? crossesClearly(e.a, e.b, f.a, f.b) : crosses(e.a, e.b, f.a, f.b)) && ++c >= limit) return c;
            }
        }
        return c;
    }

    // 64 points of b's outline read from grid offset q, around its centre, turned by theta (the
    // turn laying it onto a), next to a's 64 around its centre: { a, b }. every 1: all 128
    function pairPoints(b, q, theta, every) {
        var A = b.SA, B = b.SB, ca = Math.cos(theta || 0), sa = Math.sin(theta || 0), pa = [], pb = [];
        for (var j = 0; j < N; j += every || 2) {
            var p = A.pts[j], r = B.pts[(j + q) % N], x = r[0] - B.cx, y = r[1] - B.cy;
            pa.push([p[0] - A.cx, p[1] - A.cy]);
            pb.push([x * ca - y * sa, x * sa + y * ca]);
        }
        return { a: pa, b: pb };
    }

    // pairPoints at a start between grid steps: B's start at fraction f of its outline (a
    // symmetric start sits where the axes say, not on the grid; a quarter step off read a
    // mirror-symmetric morph as crossing itself where its two halves meet on the axis)
    function pairAt(b, f, every) {
        var A = b.SA, B = b.SB, pa = [], pb = [];
        for (var j = 0; j < N; j += every || 2) {
            var p = A.pts[j], r = sampleAt(B.pts, j + f * N);
            pa.push([p[0] - A.cx, p[1] - A.cy]);
            pb.push([r[0] - B.cx, r[1] - B.cy]);
        }
        return { a: pa, b: pb };
    }

    // ---- near-touching: an in-between whose outline nearly meets itself --------------------
    // An outline that only just misses itself reads as one about to break into two (the user:
    // "animation that only barely escapes overlap is also unsatisfying"). Its neck is the least
    // distance between two of its 64 points at least NECK_GAP apart round the outline; a morph
    // pinches when an in-between's neck drops under NECK_MU of the thinner key's (the keys' own
    // narrow parts, a stroke or a gap, set the scale). Grid-hashed by that distance, so each
    // in-between costs about its 64 points.
    var NECK_GAP = 4, NECK_MU = 0.5;

    // the least distance between points of the closed loop pts at least NECK_GAP apart (exact)
    function neckOf(pts) {
        var n = pts.length, m = Infinity, i, j;
        for (i = 0; i < n; i++) {
            for (j = i + NECK_GAP; j < n; j++) {
                if (n - (j - i) < NECK_GAP) continue;
                var dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], d = dx * dx + dy * dy;
                if (d < m) m = d;
            }
        }
        return Math.sqrt(m);
    }

    // do two points of pts at least NECK_GAP apart come within thr of each other? (Cells counted
    // from the loop's own corner: a cell number past 2^53 can't be stepped through, and a key with
    // no neck at all, a 2-point loop, once made thr ~1e-16 and the loop below never ended.)
    function nearlyMeets(pts, thr) {
        var n = pts.length, cells = {}, t2 = thr * thr, i, x0 = Infinity, y0 = Infinity;
        for (i = 0; i < n; i++) {
            if (pts[i][0] < x0) x0 = pts[i][0];
            if (pts[i][1] < y0) y0 = pts[i][1];
        }
        for (i = 0; i < n; i++) {
            var cx = Math.floor((pts[i][0] - x0) / thr), cy = Math.floor((pts[i][1] - y0) / thr);
            if (cx > 1e9 || cy > 1e9) return false;
            for (var gx = cx - 1; gx <= cx + 1; gx++) {
                for (var gy = cy - 1; gy <= cy + 1; gy++) {
                    var list = cells[gx + ',' + gy];
                    if (!list) continue;
                    for (var k = 0; k < list.length; k++) {
                        var j = list[k], g = i - j;
                        if (g < NECK_GAP || n - g < NECK_GAP) continue;
                        var dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1];
                        if (dx * dx + dy * dy < t2) return true;
                    }
                }
            }
            var key = cx + ',' + cy;
            (cells[key] || (cells[key] = [])).push(i);
        }
        return false;
    }

    // does the morph between matched points pp pinch (any in-between's neck under thr)?
    function pinches(pp, thr) {
        var A = pp.a, B = pp.b, least = Math.min(loopArea(A), loopArea(B));
        for (var u = 0; u < XU.length; u++) {
            var pts = [], w = XU[u];
            for (var j = 0; j < A.length; j++) pts.push([A[j][0] + (B[j][0] - A[j][0]) * w, A[j][1] + (B[j][1] - A[j][1]) * w]);
            if (thr > 1e-3 && nearlyMeets(pts, thr)) return true;      // (keys that already touch themselves: nothing to keep)
            if (u % 2 === 0 && collapses(pts, least)) return true;
        }
        return false;
    }

    // ---- collapsing: an in-between that loses its mass -------------------------------------
    // A morph can stay clear of itself and still fold its shape flat on the way: an F drawn
    // turned 90 deg, blended point by point, shrinks to half its area halfway. Graceful motion
    // keeps the mass: an in-between under COLLAPSE_MU of the smaller key's area counts as a pinch
    // (for the start, for the warp). Measured on every other of the 19 in-betweens.
    var COLLAPSE_MU = 0.6;

    // the area (unsigned) of the closed loop through pts
    function loopArea(pts) {
        var a = 0;
        for (var j = 0; j < pts.length; j++) {
            var p = pts[j], q = pts[(j + 1) % pts.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return Math.abs(a / 2);
    }

    // does the morph between matched points pp collapse (every other in-between)?
    function collapsesPP(pp) {
        var least = Math.min(loopArea(pp.a), loopArea(pp.b));
        for (var u = 0; u < XU.length; u += 2) {
            var pts = [], w = XU[u];
            for (var j = 0; j < pp.a.length; j++) pts.push([pp.a[j][0] + (pp.b[j][0] - pp.a[j][0]) * w, pp.a[j][1] + (pp.b[j][1] - pp.a[j][1]) * w]);
            if (collapses(pts, least)) return true;
        }
        return false;
    }

    // does the loop pts hold under COLLAPSE_MU of area least?
    function collapses(pts, least) {
        return least > 1e-9 && loopArea(pts) < COLLAPSE_MU * least;
    }

    // crossings summed over the in-betweens of a morph between matched points (up to `limit`)
    function crossover(pp, limit) {
        var total = 0, A = pp.a, B = pp.b;
        for (var u = 0; u < XU.length && total < limit; u++) {
            var pts = [], w = XU[u];
            for (var j = 0; j < A.length; j++) pts.push([A[j][0] + (B[j][0] - A[j][0]) * w, A[j][1] + (B[j][1] - A[j][1]) * w]);
            total += selfCrossings(pts, limit - total);
        }
        return total;
    }

    // the start plan's grid offset q crosses over, or pinches (comes within NECK_MU of the
    // keys' thinnest part): try the grid offsets that cost at most CROSS_SLACK times the best
    // match, the current start (0) first and then the cheapest, and take the first that neither
    // crosses nor pinches and whose grid neighbours don't either (a start on the edge of a clear
    // run still crossed between the checked in-betweens); else the first that doesn't cross
    // (when q crosses: a start that only pinches is kept as it is), else the one that crosses
    // least. stay: only the current start is tried (whether a path is already fixed: a start
    // that keeps it from crossing over counts as fine, so a second run doesn't chase sampling
    // noise). Keys that cross themselves are left as drawn.
    // -> { q, crossings, was (the crossings at q), pinched (q pinched and this one doesn't) }
    function untangle(b, q, stay, neck) {
        var pp = pairPoints(b, q, b.turn ? b.thetas[q] : 0), was = crossover(pp, 1000);
        // the keys' necks (a cyclic shift of B's samples doesn't change its own); neck false: off
        var thr = neck === false ? 0 : NECK_MU * Math.min(neckOf(pp.a), neckOf(pairPoints(b, 0, 0).b));
        function bad(k) {
            var p = pairPoints(b, k, b.turn ? b.thetas[k] : 0);
            return crossover(p, 1) > 0 || pinches(p, thr);
        }
        function clear(k) {
            return crossover(pairPoints(b, k, b.turn ? b.thetas[k] : 0), 1) === 0;
        }
        // a crossing the 64 points show but all 128 don't is the coarse outline's, not the
        // morph's: with any start allowed, such a near miss sent a fix to a start far round, and
        // the rebuilt keys, sampled afresh, read clean, so a second fix moved it back
        if (was && crossover(pairPoints(b, q, b.turn ? b.thetas[q] : 0, 1), 1) === 0) was = 0;
        if (!was) {
            // no crossing: only a pinch is worth a new start, and only one that is clear of both
            if (stay || !pinches(pp, thr)) return { q: q, crossings: 0, was: 0 };
            var limit0 = b.err * CROSS_SLACK, c0 = [], j0;
            for (j0 = 0; j0 < N; j0++) if (j0 !== q && b.grid[j0] <= limit0) c0.push(j0);
            c0.sort(function (x, y) { return (b.grid[x] - b.grid[y]) || (x - y); });
            if (q !== 0 && b.grid[0] <= limit0) c0.unshift(0);
            // (a new start must not trade the pinch for a small twist the 64-point check misses:
            // & into $ did, so it is checked again on all 128 points)
            for (j0 = 0; j0 < c0.length && j0 < CROSS_TRIES; j0++) {
                var cj = c0[j0];
                if (bad(cj) || bad((cj + 1) % N) || bad((cj + N - 1) % N)) continue;
                if (crossover(pairPoints(b, cj, b.turn ? b.thetas[cj] : 0, 1), 1) === 0) return { q: cj, crossings: 0, was: 0, pinched: true };
            }
            return { q: q, crossings: 0, was: 0 };
        }
        // keys that cross themselves: no new start is looked for (staying put is still allowed:
        // whether a key crosses itself can flip with the sampling)
        // (crossings 0: drawn that way, nothing to report)
        if (!stay && (selfCrossings(pp.a, 1) || selfCrossings(pairPoints(b, 0, 0).b, 1))) return { q: q, crossings: 0, was: was };
        var cand = [], limitE = b.err * CROSS_SLACK, k;
        for (k = 1; k < N && !stay; k++) if (k !== q && b.grid[k] <= limitE) cand.push(k);
        cand.sort(function (x, y) { return (b.grid[x] - b.grid[y]) || (x - y); });
        if (q !== 0 && b.grid[0] <= limitE) cand.unshift(0);
        var bestQ = q, bestC = was, edge = -1;
        for (k = 0; k < cand.length && k < CROSS_TRIES; k++) {
            var ck = cand[k], c = crossover(pairPoints(b, ck, b.turn ? b.thetas[ck] : 0), stay ? bestC + 1 : bestC);
            if (stay) {
                // staying put wins a tie (the count is sampled: a little noisy), unless the morph
                // from there collapses (an F drawn turned 90 deg: half its area halfway)
                if (c <= bestC && !collapsesPP(pairPoints(b, ck, b.turn ? b.thetas[ck] : 0))) {
                    bestC = c;
                    bestQ = ck;
                }
                continue;
            }
            if (c === 0) {
                var pk = pairPoints(b, ck, b.turn ? b.thetas[ck] : 0);
                if (clear((ck + 1) % N) && clear((ck + N - 1) % N) && !pinches(pk, thr)) return { q: ck, crossings: 0, was: was };
                // (one that only nearly touches still beats crossing; one that collapses doesn't:
                // the F drawn turned 90 deg, its drawn pairing at half its area halfway)
                if (edge < 0 && !collapsesPP(pk)) edge = ck;
            } else if (c < bestC) {
                bestC = c;
                bestQ = ck;
            }
        }
        if (edge >= 0) return { q: edge, crossings: 0, was: was };
        return { q: bestQ, crossings: bestC, was: was };
    }

    // ---- symmetry: a morph between shapes that share a mirror axis, kept symmetric -----------
    // When both keys are mirror-symmetric about axes of the same direction, reading the next key
    // from the start that sits as far from its pole (where the axis meets the outline) as the
    // previous key's start sits from its own makes every point move as the mirror of its
    // partner. Least travel otherwise picks one of two mirror-image swirls on a tie (a star into
    // the same star turned 36 deg, a plus into an x): 79-89 % asymmetric, where the symmetric
    // match cost 3-4 % more travel. Rotational symmetry needs nothing: any start keeps it.
    // o.symmetry: undefined = taken when it costs at most SYM_SLACK times the best match's
    // (squared) error, 'force' = taken whatever it costs, false = never (tests).
    var SYM_TOL = 0.02;                     // mirror-symmetric: matches its mirror within 2 % of its size (RMS)
    var SYM_TOL_LOOSE = 0.04;               // with the sym option: 4 % (hand-drawn shapes, a little uneven)
    var SYM_ANGLE = 2 * Math.PI / 180;      // two keys' axes are the same within 2 deg
    var SYM_SLACK = 1.2;

    // the point at fractional sample index x of a closed sample loop (between samples: linear)
    function sampleAt(pts, x) {
        var n = pts.length, i = Math.floor(x), f = x - i;
        var a = pts[((i % n) + n) % n], b = pts[(((i + 1) % n) + n) % n];
        return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    }

    // RMS distance, over the shape's size, between samples S and their mirror about the line
    // through S's centre at angle phi, sample j paired with the point at index 2p - j (p: the pole)
    function mirrorError(S, phi, p) {
        var cs = Math.cos(2 * phi), sn = Math.sin(2 * phi), e = 0, n = S.pts.length;
        for (var j = 0; j < n; j++) {
            var a = S.pts[j], b = sampleAt(S.pts, 2 * p - j), dx = b[0] - S.cx, dy = b[1] - S.cy;
            var rx = S.cx + dx * cs + dy * sn - a[0], ry = S.cy + dx * sn - dy * cs - a[1];
            e += rx * rx + ry * ry;
        }
        return Math.sqrt(e / n) / S.size;
    }

    // where the line through S's centre at angle phi crosses the outline (sample indices), and
    // which of those works best as the pole of a mirror at phi: { p, e } (e Infinity: none)
    // near: only the crossing nearest that sample index is tried (refining an axis: the pole
    // moves only a little with the angle)
    function poleAt(S, phi, near) {
        var n = S.pts.length, sn = Math.sin(phi), cs = Math.cos(phi), d = [], best = { p: 0, e: Infinity }, j, ps = [];
        for (j = 0; j < n; j++) d.push(-(S.pts[j][0] - S.cx) * sn + (S.pts[j][1] - S.cy) * cs);
        for (j = 0; j < n; j++) {
            var d0 = d[j], d1 = d[(j + 1) % n];
            if ((d0 <= 0) !== (d1 <= 0)) ps.push(j + d0 / (d0 - d1));
        }
        if (near !== undefined && ps.length > 1) {
            var k0 = 0, gap = n;
            for (j = 0; j < ps.length; j++) {
                var g = Math.abs(ps[j] - near) % n;
                if (Math.min(g, n - g) < gap) {
                    gap = Math.min(g, n - g);
                    k0 = j;
                }
            }
            ps = [ps[k0]];
        }
        for (j = 0; j < ps.length; j++) {
            var e = mirrorError(S, phi, ps[j]);
            if (e < best.e) best = { p: ps[j], e: e };
        }
        return best;
    }

    // S with its size (RMS distance of the samples from their centre)
    function sized(S) {
        if (S.size === undefined) {
            var r = 0;
            for (var j = 0; j < S.pts.length; j++) r += (S.pts[j][0] - S.cx) * (S.pts[j][0] - S.cx) + (S.pts[j][1] - S.cy) * (S.pts[j][1] - S.cy);
            S.size = Math.sqrt(r / S.pts.length) || 1;
        }
        return S;
    }

    // the mirror axes of a closed outline's samples: 'round' (a circle: every axis), or
    // [{ phi (radians, 0..pi), pole (fraction of the outline from its start), e }]. Quick (every
    // fix): the principal axes (a mirror axis always is one); for a shape with no main direction
    // (a regular polygon, a star, a plus) the directions to every point locally farthest from or
    // nearest to the centre (the plus's upright axis runs through the middle of an arm's end, a
    // local nearest, not one of the strong ones), at most 24; within SYM_TOL. thorough (the sym
    // option): also every angle in 2 deg steps, within SYM_TOL_LOOSE (hand-drawn shapes, a
    // little uneven). Each candidate refined by small turns of the angle.
    function mirrorAxes(S, thorough) {
        sized(S);
        var tol = thorough ? SYM_TOL_LOOSE : SYM_TOL, apart = (thorough ? 0.9 : 3) * Math.PI / 180;
        var n = S.pts.length, sxx = 0, syy = 0, sxy = 0, r = [], j, cand = [], out = [];
        for (j = 0; j < n; j++) {
            var dx = S.pts[j][0] - S.cx, dy = S.pts[j][1] - S.cy;
            sxx += dx * dx;
            syy += dy * dy;
            sxy += dx * dy;
            r.push(Math.sqrt(dx * dx + dy * dy));
        }
        var rmin = r[0], rmax = r[0];
        for (j = 1; j < n; j++) {
            if (r[j] < rmin) rmin = r[j];
            if (r[j] > rmax) rmax = r[j];
        }
        if (rmax - rmin < 0.01 * S.size) return 'round';
        var half = (sxx - syy) / 2, dd = Math.sqrt(half * half + sxy * sxy), mean = (sxx + syy) / 2;
        var t = 0.5 * Math.atan2(2 * sxy, sxx - syy);
        S.principal = mean - dd < 0.95 * (mean + dd) ? t : null;       // null: no main direction
        // candidate directions, each kept once (a tip and the opposite valley give one axis)
        function add(a) {
            for (var q = 0; q < cand.length; q++) if (angleGap(cand[q], a) < apart) return;
            cand.push(a);
        }
        if (S.principal !== null) {
            add(t);
            add(t + Math.PI / 2);
        } else {
            for (j = 0; j < n && cand.length < 24; j++) {
                var rp = r[(j + n - 1) % n], rn = r[(j + 1) % n];
                if ((r[j] >= rp && r[j] > rn) || (r[j] <= rp && r[j] < rn)) add(Math.atan2(S.pts[j][1] - S.cy, S.pts[j][0] - S.cx));
            }
        }
        var sweepFrom = cand.length;
        if (thorough) for (j = 0; j < 90; j++) add(j * 2 * Math.PI / 180);
        // a quarter of the samples screens the candidates (the sweep's 90 angles, mostly)
        var coarse = S;
        if (n >= 128) {
            coarse = { pts: [], cx: S.cx, cy: S.cy, size: S.size };
            for (j = 0; j < n; j += 4) coarse.pts.push(S.pts[j]);
        }
        for (var c = 0; c < cand.length; c++) {
            // a sweep angle is within 1 deg of any axis: a stricter screen, finer first steps
            var sweep = c >= sweepFrom, phi = cand[c], step = (sweep ? 0.5 : 1) * Math.PI / 180, near = false;
            // an axis already found close by: the same one
            for (var f = 0; f < out.length && !near; f++) near = angleGap(out[f].phi, phi) < 4 * Math.PI / 180;
            if (near) continue;
            // far from a mirror: not worth refining (a corner between samples puts its candidate a
            // few degrees off: the plus's diagonal started 3.3 deg off, at 9.9 %)
            var pc = poleAt(coarse, phi);
            if (pc.e > (sweep ? 2.5 * tol : Math.max(4 * tol, 0.15))) continue;
            var pa = poleAt(S, phi, pc.p * (n / coarse.pts.length));
            for (var it = 0; it < 16 && step > 0.02 * Math.PI / 180; it++) {
                var lo = poleAt(S, phi - step, pa.p), hi = poleAt(S, phi + step, pa.p);
                if (lo.e < pa.e && lo.e <= hi.e) {
                    phi -= step;
                    pa = lo;
                } else if (hi.e < pa.e) {
                    phi += step;
                    pa = hi;
                } else {
                    step /= 2;
                }
            }
            if (pa.e > tol) continue;
            phi = phi - Math.floor(phi / Math.PI) * Math.PI;
            // within 4 deg of one found: the same axis, the better of the two kept (a rounded
            // square's error rises slowly near its axes, and 42 deg passed the loose test too)
            var dup = -1;
            for (var k = 0; k < out.length && dup < 0; k++) if (angleGap(out[k].phi, phi) < 4 * Math.PI / 180) dup = k;
            if (dup < 0) out.push({ phi: phi, pole: pa.p / n, e: pa.e });
            else if (pa.e < out[dup].e) out[dup] = { phi: phi, pole: pa.p / n, e: pa.e };
        }
        return out;
    }

    // how far apart two axis directions are (radians, mod pi)
    function angleGap(a, b) {
        var d = Math.abs(a - b) % Math.PI;
        return d > Math.PI / 2 ? Math.PI - d : d;
    }

    // the starts of P (fractions from its current start) that make the morph from b.SA (the
    // previous key's samples) mirror-symmetric, cheapest first: [{ off, e }] (e: squared match
    // error, as b.grid). Empty when the keys share no mirror axis, or both are round.
    // thorough (the sym option): twice the samples, every angle tried, a looser tolerance
    function symmetricStarts(b, prev, P, M, thorough) {
        var SA = thorough ? samples(prev, measure(prev), 2 * N) : b.SA, SB = thorough ? samples(P, M, 2 * N) : b.SB;
        var axA = mirrorAxes(SA, thorough), pairs = [], i, j, out = [];
        if (axA !== 'round' && !axA.length) return out;       // the previous key has no mirror axis
        var axB = mirrorAxes(SB, thorough);
        if (axA === 'round' && axB === 'round') return out;
        if (axA === 'round' || axB === 'round') {
            var axes = axA === 'round' ? axB : axA, roundS = sized(axA === 'round' ? SA : SB);
            for (i = 0; i < axes.length; i++) {
                var pr = poleAt(roundS, axes[i].phi), pole = { phi: axes[i].phi, pole: pr.p / roundS.pts.length };
                pairs.push(axA === 'round' ? [pole, axes[i]] : [axes[i], pole]);
            }
        } else {
            for (i = 0; i < axA.length; i++) for (j = 0; j < axB.length; j++) if (angleGap(axA[i].phi, axB[j].phi) < SYM_ANGLE) pairs.push([axA[i], axB[j]]);
        }
        var cB = [b.SB.cx, b.SB.cy];
        for (i = 0; i < pairs.length; i++) {
            for (var h = 0; h < 2; h++) {
                var off = pairs[i][1].pole - pairs[i][0].pole + h / 2;
                off = off - Math.floor(off);
                var dupe = false;
                for (j = 0; j < out.length && !dupe; j++) dupe = circDist(out[j].off, off) < 0.25 / N;
                if (!dupe) out.push({ off: off, e: errorAt(b.SA, P, M, cB, off, false).e });
            }
        }
        out.sort(function (x, y) { return (x.e - y.e) || (x.off - y.off); });
        return out;
    }

    // ---- a key drawn as a turn of the previous one (Free Transform: the same points, turned) --
    // B's points and handles are A's turned by one angle (and scaled evenly, if at all), point
    // for point: the designer animated a turn. Least travel throws that pairing away, and for a
    // shape the turn maps onto itself (a star turned a tip, a gear a tooth) it leaves no motion
    // at all, or a pulse. -> { deg } (the drawn turn, clockwise on screen like AE) or null
    var DRAWN_SMALL = 30;       // deg: without turn, a drawn turn up to this is kept as drawn
    function drawnTurn(A, B) {
        var n = A.v.length, k;
        if (!A.closed || n !== B.v.length || n < 3) return null;
        var ca = [0, 0], cb = [0, 0];
        for (k = 0; k < n; k++) {
            ca[0] += A.v[k][0] / n;
            ca[1] += A.v[k][1] / n;
            cb[0] += B.v[k][0] / n;
            cb[1] += B.v[k][1] / n;
        }
        // vertices around their centres, and both handles, as vector pairs (a, b)
        var pairs = [];
        for (k = 0; k < n; k++) {
            pairs.push([A.v[k][0] - ca[0], A.v[k][1] - ca[1], B.v[k][0] - cb[0], B.v[k][1] - cb[1]]);
            pairs.push([A.i[k][0], A.i[k][1], B.i[k][0], B.i[k][1]]);
            pairs.push([A.o[k][0], A.o[k][1], B.o[k][0], B.o[k][1]]);
        }
        var sd = 0, sc = 0, aa = 0, j;
        for (j = 0; j < pairs.length; j++) {
            var q = pairs[j];
            sd += q[0] * q[2] + q[1] * q[3];
            sc += q[0] * q[3] - q[1] * q[2];
            aa += q[0] * q[0] + q[1] * q[1];
        }
        if (aa <= 0) return null;
        var th = Math.atan2(sc, sd), s = Math.sqrt(sd * sd + sc * sc) / aa, cs = s * Math.cos(th), sn = s * Math.sin(th), e = 0;
        // a turn keeps about its size: a piece shrunk to a dot (or grown from one) fits any
        // angle within half a pixel
        if (s < 0.1 || s > 10) return null;
        for (j = 0; j < pairs.length; j++) {
            var p = pairs[j], rx = p[0] * cs - p[1] * sn - p[2], ry = p[0] * sn + p[1] * cs - p[3];
            e += rx * rx + ry * ry;
        }
        var size = Math.sqrt(aa / pairs.length);
        if (Math.sqrt(e / pairs.length) > Math.max(0.5, 0.002 * size)) return null;
        var deg = th * 180 / Math.PI;
        return Math.abs(deg) < 1 ? null : { deg: deg };
    }

    // the angle (deg) that best turns A onto B, point for point (vertices about their centres, and
    // the handles), whether or not B is exactly a turned A: a turn's in-between keys are turned
    // copies blended a little. The sign is AE's (clockwise on screen); the panel only ever divides
    // two of these, so it doesn't matter. 0 when the paths don't share their points.
    function turnBetween(A, B) {
        var n = A.v.length, k;
        if (n !== B.v.length || n < 2) return 0;
        var ca = [0, 0], cb = [0, 0];
        for (k = 0; k < n; k++) {
            ca[0] += A.v[k][0] / n;
            ca[1] += A.v[k][1] / n;
            cb[0] += B.v[k][0] / n;
            cb[1] += B.v[k][1] / n;
        }
        var sd = 0, sc = 0;
        function add(ax, ay, bx, by) {
            sd += ax * bx + ay * by;
            sc += ax * by - ay * bx;
        }
        for (k = 0; k < n; k++) {
            add(A.v[k][0] - ca[0], A.v[k][1] - ca[1], B.v[k][0] - cb[0], B.v[k][1] - cb[1]);
            add(A.i[k][0], A.i[k][1], B.i[k][0], B.i[k][1]);
            add(A.o[k][0], A.o[k][1], B.o[k][0], B.o[k][1]);
        }
        return Math.atan2(sc, sd) * 180 / Math.PI;
    }

    // o for one step: the drawn turn into this key and how far the previous key's start moved
    // (a fraction of its outline), so the drawn pairing can be kept
    function pairOpts(o, drawn, shift) {
        if (!drawn) return o;
        var p = {}, key;
        for (key in o) p[key] = o[key];
        p.drawn = drawn;
        p.drawnShift = shift || 0;
        return p;
    }

    // where closed path P should start to follow prev (startPlanAll, plus o.drawn): a key drawn
    // as a turn keeps the drawn pairing (its start moved as far as the previous key's did): with
    // turn, swung by the drawn angle; without, when least travel would erase the motion (under a
    // quarter of the drawn travel) or costs about the same (within GAIN). Otherwise the usual
    // plan, marked with the drawn turn so the report can suggest turn. -> the plan, with drawn
    // (deg, or 0) and keptDrawn
    function startPlan(prev, P, o) {
        if (o.drawn) {
            var dOff = o.drawnShift || 0, keepIt = !!o.rotate;
            if (!keepIt) {
                // a small turn barely shrinks blended straight (by cos(deg / 2): 1.2 % at 18 deg),
                // and it is what was drawn (a gear turned half a tooth pulsed instead: less travel)
                keepIt = Math.abs(o.drawn.deg) <= DRAWN_SMALL;
            }
            if (!keepIt) {
                var bD = bestOffset(prev, P, false), eD = errorAt(bD.SA, P, measure(P), [bD.SB.cx, bD.SB.cy], dOff, false).e;
                keepIt = eD * GAIN <= bD.err || bD.err < 0.0625 * eD;
            }
            if (keepIt) {
                var dp = { off: dOff, near: 0, nd: 0, turn: !!o.rotate, theta: 0, crossings: 0, untangled: false, symmetric: false, drawn: o.drawn.deg, keptDrawn: true };
                if (dOff) {
                    var nvD = nearestVertex(P, dOff);
                    dp.near = nvD.k;
                    dp.nd = nvD.d;
                }
                return dp;
            }
        }
        var plan = startPlanAll(prev, P, o);
        plan.drawn = o.drawn ? o.drawn.deg : 0;
        plan.keptDrawn = false;
        return plan;
    }

    // where closed path P should start to follow prev: { off, near, nd, turn, theta, crossings,
    // untangled, symmetric } (near: the vertex nearest the best fraction) or, when moving the
    // start gains under 5 % and neither keeps the morph symmetric nor from crossing over,
    // { near: 0, nd: 0 } with the turn found at the current start. In order: no crossover, then
    // symmetry, then least travel. crossings: what the in-betweens still cross (sampled)
    function startPlanAll(prev, P, o) {
        var b = chooseOffset(prev, P, o), off = 0, theta = 0, symmetric = false, symStart = false;
        if (b.err < b.err0 * GAIN) {
            off = b.off;
            theta = b.theta;
        } else if (b.turn) {
            theta = bestAt0(prev, P);
        }
        // symmetry (steps that turn are swung whole instead, which doesn't swirl)
        if (o.symmetry !== false && !b.turn) {
            var force = o.symmetry === 'force', ss = symmetricStarts(b, prev, P, measure(P), force), cap = force ? Infinity : b.err * SYM_SLACK, near = null, stay = null, s;
            for (s = 0; s < ss.length; s++) {
                if (!near && circDist(ss[s].off, off) < 2 / N) near = ss[s];
                if (!stay && circDist(ss[s].off, 0) < 0.5 / N) stay = ss[s];
            }
            if (near) {
                // nearly symmetric already (within 2 grid steps): onto the symmetric start exactly
                // (a star into a plus was left 0.27 % of its outline off: a little lopsided),
                // unless only a hair away (a hold's identical keys: that moved its start 0.04 px)
                if (circDist(near.off, off) > 0.25 / N) off = circDist(near.off, 0) < 0.5 / N ? 0 : near.off;
                symStart = true;
            } else if (ss.length) {
                // the current start when it is symmetric and the cheapest symmetric one isn't 5 % cheaper
                var pick = stay && !(ss[0].e < stay.e * GAIN) ? stay : ss[0];
                if (pick.e <= cap) {
                    off = pick === stay ? 0 : pick.off;
                    symmetric = true;
                    symStart = true;
                }
            }
        }
        var q0 = Math.round(off * N) % N, x = { q: q0, crossings: 0, was: 0 };
        // staying put (a second fix): a start that already keeps the morph clean (no crossing,
        // pinch or collapse) isn't traded for another clean one that only travels less (0.19:
        // travel is a tie-breaker), unless the other is symmetric. With any start allowed, a
        // first fix that found the cheapest start borderline pinched took a clean one far round;
        // the rebuilt keys, sampled afresh, read the cheapest as clean, and a second fix moved back
        if (o.stay && q0 !== 0 && !symStart && !o.drawn && o.crossover !== false) {
            var p0 = pairPoints(b, 0, b.turn ? b.thetas[0] : 0), thr0 = o.neck === false ? 0 : NECK_MU * Math.min(neckOf(p0.a), neckOf(pairPoints(b, 0, 0).b));
            if (crossover(p0, 1) === 0 && !pinches(p0, thr0)) return { off: 0, near: 0, nd: 0, turn: b.turn, theta: b.turn ? b.thetas[0] : 0, crossings: 0, untangled: false, unpinched: false, symmetric: false };
        }
        // sym on: a symmetric start is left only to escape a crossing (a knot), and then for
        // another symmetric start first; a pinch or a collapse doesn't trade it for a lopsided
        // one. With any start allowed (0.19) an arrow up into an arrow down tumbled over
        // lopsided, spiked, 44 px off symmetric, rather than melt evenly into a lozenge (its
        // in-betweens shrink under the collapse limit), and a T into an upside-down T turned half
        // round. The user: symmetric motion is the more graceful "most if not all of the time".
        var symOff = -1, symRejected = false;
        if (symStart && force && o.crossover !== false) {
            var offs = [off], si, sj;
            for (si = 0; si < ss.length; si++) {
                for (sj = 0; sj < offs.length && circDist(offs[sj], ss[si].off) >= 0.5 / N; sj++);
                if (sj === offs.length) offs.push(ss[si].off);
            }
            // (o.symTrust: the fix found every symmetric start crossing on samples, and tries the
            // first on the final paths, which have the last word)
            if (o.symTrust) {
                symOff = off;
                x = { q: q0, crossings: 0, was: 0 };
            }
            for (si = 0; si < offs.length && symOff < 0; si++) {
                var qs = Math.round(offs[si] * N) % N;
                // (a crossing the 64 points show but all 128 don't is the coarse outline's)
                if (crossover(pairAt(b, offs[si]), 1) === 0 || crossover(pairAt(b, offs[si], 1), 1) === 0) {
                    symOff = offs[si];
                    x = { q: qs, crossings: 0, was: 0 };
                }
            }
        }
        symRejected = symStart && force && o.crossover !== false && symOff < 0;
        if (o.crossover !== false && symOff < 0) x = untangle(b, q0, !!o.stay, o.neck);
        var untangled = x.q !== q0, unpinched = !!x.pinched;
        if (symOff >= 0) {
            // (onto that symmetric start exactly, not its grid step)
            if (untangled) {
                off = symOff;
                symmetric = true;
            }
        } else if (untangled) {
            off = x.q / N;
            theta = b.turn ? b.thetas[x.q] : 0;
            symmetric = false;
        }
        if (!off) return { off: 0, near: 0, nd: 0, turn: b.turn, theta: theta, crossings: x.crossings, untangled: untangled, unpinched: unpinched, symmetric: symmetric, symRejected: symRejected };
        var nv = nearestVertex(P, off);
        return { off: off, near: nv.k, nd: nv.d, turn: b.turn, theta: theta, crossings: x.crossings, untangled: untangled, unpinched: unpinched, symmetric: symmetric, symRejected: symRejected };
    }

    // the turn laying P onto prev, keeping P's start
    function bestAt0(prev, P) {
        var SA = samples(prev, measure(prev)), MP = measure(P), SP = samples(P, MP);
        return errorAt(SA, P, MP, [SP.cx, SP.cy], 0, true).theta;
    }

    // the direction a closed path is drawn in: 1 clockwise, -1 counter-clockwise, 0 when it
    // has no clear one (a figure eight, a sliver: under 1 % of a circle with its perimeter)
    function winding(P) {
        var a = area(P), L = measure(P).total;
        if (L <= 0 || Math.abs(a) < 0.01 * L * L / (4 * Math.PI)) return 0;
        return a > 0 ? 1 : -1;
    }

    // key P made to follow key prev: drawn in direction opt.sign (the reference key's), and
    // starting where the morph from prev travels least
    function align(prev, P, opt) {
        var info = { reversed: false, moved: false, offset: 0, turn: false };
        if (P.closed) {
            if (opt.direction && opt.sign) {
                var w = winding(P);
                if (w && w !== opt.sign) {
                    P = reverse(P);
                    info.reversed = true;
                }
            }
            if (opt.start && P.v.length > 1) {
                var plan = startPlan(prev, P, opt);
                info.turn = plan.turn;
                info.untangled = plan.untangled;      // a start chosen so the in-betweens don't cross (or nearly touch)
                info.unpinched = plan.unpinched;      // ... nearly touch, where the first choice only did that
                info.crossings = plan.crossings;      // what they still cross (sampled), 0 mostly
                info.symmetric = plan.symmetric;      // a start chosen so the morph stays mirror-symmetric
                if (plan.symRejected) info.symRejected = true;      // (sym on) every symmetric start crossed, on samples
                info.drawn = plan.drawn;              // drawn as a turn of the previous key (deg), 0 if not
                info.keptDrawn = plan.keptDrawn;      // ... and that pairing kept
                var near = plan.near;
                if (plan.nd > SNAP) {
                    P = insert(P, [plan.off]);
                    near = nearestVertex(P, plan.off).k;
                }
                if (near > 0) {
                    P = rotate(P, near);
                    info.moved = true;
                    info.offset = plan.off;
                }
            }
        } else if (opt.direction) {
            // an open path: flip it when its ends then land nearer the previous key's
            var R = reverse(P);
            if (rms(prev, R) < rms(prev, P) * GAIN) {
                P = R;
                info.reversed = true;
            }
        }
        return { P: P, info: info };
    }

    // every key gets a point wherever any key has one (by outline fraction): same count,
    // and point j of every key at the same fraction of its own outline
    function unify(paths) {
        var all = [], p, j, np = paths.length;
        for (p = 0; p < np; p++) {
            var fr = fractions(paths[p], measure(paths[p]));
            for (j = 0; j < fr.length; j++) all.push({ f: fr[j], p: p });
        }
        // every sort breaks ties: ExtendScript's sort is not stable, V8's is, and the two must agree
        for (j = 0; j < all.length; j++) all[j].idx = j;
        all.sort(function (a, b) { return (a.f - b.f) || (a.idx - b.idx); });
        var clusters = [], cur = null;
        for (j = 0; j < all.length; j++) {
            if (cur && all[j].f - cur.last <= EPS) {
                cur.items.push(all[j]);
                cur.last = all[j].f;
            } else {
                cur = { items: [all[j]], last: all[j].f };
                clusters.push(cur);
            }
        }
        var ins = [];
        for (p = 0; p < np; p++) ins.push([]);
        for (var c = 0; c < clusters.length; c++) {
            var it = clusters[c].items, cnt = [], own = [], m = 0, sum = 0;
            for (p = 0; p <= np; p++) {
                cnt.push(0);
                own.push(0);
            }
            for (j = 0; j < it.length; j++) {
                cnt[it[j].p]++;
                own[it[j].p] = it[j].f;
                sum += it[j].f;
            }
            for (p = 0; p <= np; p++) if (cnt[p] > m) m = cnt[p];
            var pos = sum / it.length;
            for (p = 0; p < np; p++)
                for (j = cnt[p]; j < m; j++) ins[p].push(cnt[p] > 0 ? own[p] : pos);
        }
        var out = [], added = [];
        for (p = 0; p < np; p++) {
            out.push(insert(paths[p], ins[p]));
            added.push(ins[p].length);
        }
        return { paths: out, added: added };
    }

    // ---- rebuild: every key resampled at the same fractions, handles sized by arc length ----
    //
    // After Effects blends each handle of a point in a straight line, so halfway through a
    // morph a smooth point stays smooth only if the ratio of its two handle lengths is the
    // same in both keys. Points kept as drawn (or split where they fall) rarely agree, and
    // the in-betweens show small kinks. Rebuilt, every smooth point's handles are the arcs to
    // its neighbours / 3: the same ratio in every key, since the fractions are shared.

    function unit(x, y) {
        var l = Math.sqrt(x * x + y * y);
        return l > 1e-12 ? [x / l, y / l] : null;
    }

    // direction a segment leaves its start (t = 0) or arrives at its end (t = 1), falling
    // back to the next control point when a handle has zero length
    function endDir(c, atEnd) {
        if (atEnd) return unit(c[6] - c[4], c[7] - c[5]) || unit(c[6] - c[2], c[7] - c[3]) || unit(c[6] - c[0], c[7] - c[1]);
        return unit(c[2] - c[0], c[3] - c[1]) || unit(c[4] - c[0], c[5] - c[1]) || unit(c[6] - c[0], c[7] - c[1]);
    }

    function dirAt(c, t) {
        if (t <= 1e-9) return endDir(c, false);
        if (t >= 1 - 1e-9) return endDir(c, true);
        var d = dbez(c, t);
        return unit(d[0], d[1]) || endDir(c, t > 0.5);
    }

    // ---- warp: outlines paired by what they are, not by how far round ---------------------
    // Spread evenly from their starts, two outlines pair points by how far round they are, and
    // between unlike shapes that folds: a T into an upside-down T crossed itself 31 times on the
    // way, u into n 16. A warp pairs them by dynamic time warping over samples of both (every
    // start of B tried), where a stretch of one outline may also pair with a single point of the
    // other: a bar that shrinks away, a stem that grows out of a bar. Its price: travel (how far
    // points move, around each shape's centre) plus WARP_BEND times how much each little piece
    // of outline turns on the way, and WARP_STRETCH of that for growing or shrinking along
    // itself. So pieces slide or grow rather than swing round: the T's bar shrinks while the
    // upside-down T's grows, E's bottom arm draws back into its stem, u's bowl rolls up into n's
    // arch. Found coarse (WARP_COARSE samples, every start) then fine (WARP_N, around the
    // best coarse starts in turn), straightened into a few runs, and kept only where its
    // in-betweens neither cross nor pinch (or spreading evenly pinches too). review.md, round 20.
    // Off unless o.warp is true (the panel's "shape"): inside After Effects it made the demo's
    // fixes about 3 times as slow (bench/warp-demo.jsx).
    var WARP_N = 80, WARP_COARSE = 24, WARP_BEND = 0.1, WARP_STRETCH = 0.1, WARP_TRIES = 3, WARP_SAME = 2, WARP_SAME_NOW = 1.5, WARP_STRAIGHT = 4, WARP_BAND = 2, WARP_REACH = 0.15, WARP_SYM = 0.001;
    var WARP_STEPS = [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [3, 1], [1, 3], [3, 2], [2, 3]];

    // a closed outline at fractions: its start and corners exactly, the rest every 1/n (none
    // closer than 0.35/n to a corner); points around the outline's centre. -> { f, p, corner }
    function warpSamples(P, M, n) {
        var cs = corners(P, M), fs = [0], S = samples(P, M), j, k;
        for (j = 0; j < cs.length; j++) fs.push(cs[j].f);
        for (k = 1; k < n; k++) {
            var ok = true;
            for (j = 0; j < cs.length && ok; j++) if (circDist(k / n, cs[j].f) < 0.35 / n) ok = false;
            if (ok) fs.push(k / n);
        }
        fs.sort(function (a, b) { return a - b; });
        var out = { f: [], p: [], corner: [] };
        for (j = 0; j < fs.length; j++) {
            if (fs[j] > 1 - 1e-9 || (out.f.length && fs[j] - out.f[out.f.length - 1] < 1e-9)) continue;
            var q = at(P, M, fs[j]), c = false;
            for (k = 0; k < cs.length; k++) if (circDist(fs[j], cs[k].f) < 1e-9) c = true;
            out.f.push(fs[j]);
            out.p.push([q[0] - S.cx, q[1] - S.cy]);
            out.corner.push(c);
        }
        return out;
    }

    // DTW round both outlines: A's samples from its start, B's from each start in `shifts`
    // (indices into SB). -> { costs: [cost per shift], best: { s, cost, path: [[a, b, cornerA,
    // cornerB], ...] } } with a from A's start round to it again, b likewise from B's start s;
    // all: every shift's { s, cost, path } as well. band: { path, r }: only pairs within r (a
    // fraction) of a coarser pairing's path are tried (FastDTW): the fine search costs a fifth
    function warpDTW(SA, SB, shifts, all, band, steps) {
        var n = SA.f.length, m = SB.f.length, W = m + 1, i, j, t, d, out = { costs: [], best: null, all: [] };
        // per step size d (0..3, see WARP_STEPS): A's piece from sample i, its length, and the
        // fraction it spans, at d * (n + 1) + i; likewise B's per start. Travel per pair of
        // samples, once per start. (Flat arrays, filled by index: in ExtendScript every lookup
        // and push counts; the fix ran 15 times slower there with the first version)
        var N1 = n + 1, ax = new Array(N1), ay = new Array(N1), af = new Array(N1), Ax = [], Ay = [], Al = [], Af = [];
        for (i = 0; i <= n; i++) {
            ax[i] = SA.p[i % n][0];
            ay[i] = SA.p[i % n][1];
            af[i] = i < n ? SA.f[i] : SA.f[0] + 1;
        }
        for (d = 0; d < 4; d++) {
            for (i = 0; i <= n; i++) {
                var i2d = i + d <= n ? i + d : n, ux = ax[i2d] - ax[i], uy = ay[i2d] - ay[i];
                Ax[d * N1 + i] = ux;
                Ay[d * N1 + i] = uy;
                Al[d * N1 + i] = Math.sqrt(ux * ux + uy * uy);
                Af[d * N1 + i] = af[i2d] - af[i];
            }
        }
        var nS = steps || WARP_STEPS.length, sa = [], sb = [];
        for (t = 0; t < nS; t++) {
            sa[t] = WARP_STEPS[t][0];
            sb[t] = WARP_STEPS[t][1];
        }
        for (var si = 0; si < shifts.length; si++) {
            var s = shifts[si], M1 = m + 1, bx = new Array(M1), by = new Array(M1), bf = new Array(M1), Bx = [], By = [], Bl = [], Bf = [];
            for (j = 0; j <= m; j++) {
                var q = (s + j) % m;
                bx[j] = SB.p[q][0];
                by[j] = SB.p[q][1];
                bf[j] = SB.f[q] + (s + j >= m ? 1 : 0);
            }
            for (d = 0; d < 4; d++) {
                for (j = 0; j <= m; j++) {
                    var j2d = j + d <= m ? j + d : m, vx = bx[j2d] - bx[j], vy = by[j2d] - by[j];
                    Bx[d * M1 + j] = vx;
                    By[d * M1 + j] = vy;
                    Bl[d * M1 + j] = Math.sqrt(vx * vx + vy * vy);
                    Bf[d * M1 + j] = bf[j2d] - bf[j];
                }
            }
            // the j each i may pair with: all, or the band about the coarser path; the table
            // holds only those cells, row i's cell j at base[i] + j
            var jlo = new Array(N1), jhi = new Array(N1), base = new Array(N1), tot = 0;
            for (i = 0; i <= n; i++) {
                jlo[i] = 0;
                jhi[i] = m;
            }
            if (band) warpBand(band, af, bf, jlo, jhi);
            for (i = 0; i <= n; i++) {
                base[i] = tot - jlo[i];
                tot += jhi[i] - jlo[i] + 1;
            }
            var cost = new Array(tot), from = new Array(tot), trav = new Array(tot), c0, k;
            for (i = 0; i <= n; i++) {
                for (j = jlo[i]; j <= jhi[i]; j++) {
                    var tx = ax[i] - bx[j], ty = ay[i] - by[j];
                    k = base[i] + j;
                    trav[k] = tx * tx + ty * ty;
                    cost[k] = Infinity;
                    from[k] = -1;
                }
            }
            cost[0] = 0;
            for (i = 0; i <= n; i++) {
                var bi = base[i], hi = jhi[i];
                for (j = jlo[i]; j <= hi; j++) {
                    c0 = cost[bi + j];
                    if (c0 === Infinity) continue;
                    for (var st = 0; st < nS; st++) {
                        var di = sa[st], dj = sb[st], i2 = i + di, j2 = j + dj;
                        if (i2 > n || j2 > jhi[i2] || j2 < jlo[i2]) continue;
                        var ka = di * N1 + i, kb = dj * M1 + j, dt = (Af[ka] + Bf[kb]) / 2, la = Al[ka], lb = Bl[kb], k2 = base[i2] + j2;
                        var c = c0 + trav[k2] * dt + WARP_BEND * (2 * (la * lb - Ax[ka] * Bx[kb] - Ay[ka] * By[kb]) + WARP_STRETCH * (la - lb) * (la - lb)) / (dt > 1e-12 ? dt : 1e-12);
                        if (c < cost[k2]) {
                            cost[k2] = c;
                            from[k2] = i * W + j;
                        }
                    }
                }
            }
            var total = cost[base[n] + m];
            out.costs.push(total);
            if (all || !out.best || total < out.best.cost) {
                var path = [];
                for (t = n * W + m; t >= 0; ) {
                    var ii = Math.floor(t / W), jj = t % W;
                    path.push([af[ii], bf[jj], SA.corner[ii % n], SB.corner[(s + jj) % m]]);
                    t = from[base[ii] + jj];
                }
                path.reverse();
                var r = { s: s, cost: total, path: path };
                if (all) out.all.push(r);
                if (!out.best || total < out.best.cost) out.best = r;
            }
        }
        return out;
    }

    // FastDTW's band: for each fine sample i of A, the samples j of B (fractions bf, from this
    // start) within band.r of the coarse path (its nodes [a, b], b from the coarse start; this
    // start's b moved by whole turns to sit by it) -> jlo[i], jhi[i]
    function warpBand(band, af, bf, jlo, jhi) {
        var P = band.path, r = band.r, n = af.length - 1, m = bf.length - 1, off = Math.round(P[0][1] - bf[0]), i, k = 0, j0 = 0, j1 = 0;
        for (i = 0; i <= n; i++) {
            var a0 = af[i] - r, a1 = af[i] + r, lo = Infinity, hi = -Infinity;
            while (k < P.length - 1 && P[k + 1][0] < a0) k++;
            // the path's b over [a0, a1]: its nodes there, and where it enters and leaves
            for (var q = k; q < P.length; q++) {
                var p = P[q], nx = q + 1 < P.length ? P[q + 1] : null;
                if (p[0] >= a0 && p[0] <= a1) {
                    lo = Math.min(lo, p[1]);
                    hi = Math.max(hi, p[1]);
                }
                if (nx && p[0] <= a1 && nx[0] >= a0 && nx[0] > p[0]) {
                    var e0 = Math.max(a0, p[0]), e1 = Math.min(a1, nx[0]);
                    var b0 = p[1] + (nx[1] - p[1]) * (e0 - p[0]) / (nx[0] - p[0]), b1 = p[1] + (nx[1] - p[1]) * (e1 - p[0]) / (nx[0] - p[0]);
                    lo = Math.min(lo, b0, b1);
                    hi = Math.max(hi, b0, b1);
                }
                if (p[0] > a1) break;
            }
            lo -= r + off;
            hi += r - off;
            while (j0 < m && bf[j0] < lo) j0++;
            if (j1 < j0) j1 = j0;
            while (j1 < m && bf[j1 + 1] <= hi) j1++;
            jlo[i] = Math.min(j0, m);
            jhi[i] = Math.max(j1, jlo[i]);
        }
        jlo[0] = 0;
        jhi[n] = m;
        if (jhi[0] < 0) jhi[0] = 0;
        if (jlo[n] > m) jlo[n] = m;
    }

    // the DTW path as a few straight runs: Douglas-Peucker in (a, b) within tol, keeping both
    // ends and every node at a corner of either outline. -> [[a, b], ...]
    function warpStraighten(path, tol) {
        var n = path.length, keep = [], todo = [], last = 0, k;
        for (k = 0; k < n; k++) keep.push(k === 0 || k === n - 1 || path[k][2] || path[k][3]);
        for (k = 1; k < n; k++) {
            if (!keep[k]) continue;
            todo.push([last, k]);
            last = k;
        }
        while (todo.length) {
            var ab = todo.pop(), a = ab[0], b = ab[1], far = -1, fd = tol;
            var dx = path[b][0] - path[a][0], dy = path[b][1] - path[a][1], L = Math.sqrt(dx * dx + dy * dy) || 1;
            for (k = a + 1; k < b; k++) {
                var d = Math.abs((path[k][0] - path[a][0]) * dy - (path[k][1] - path[a][1]) * dx) / L;
                if (d > fd) {
                    fd = d;
                    far = k;
                }
            }
            if (far >= 0) {
                keep[far] = true;
                todo.push([a, far]);
                todo.push([far, b]);
            }
        }
        var out = [];
        for (k = 0; k < n; k++) if (keep[k]) out.push([path[k][0], path[k][1]]);
        return out;
    }

    // count points along a pairing (spaced by the joint parameter), on A and on B: { a, b }
    function warpPoints(A, MA, B, MB, pairs, count) {
        var len = [0], total = 0, k, out = { a: [], b: [] };
        for (k = 1; k < pairs.length; k++) {
            len.push((pairs[k][0] - pairs[k - 1][0]) + (pairs[k][1] - pairs[k - 1][1]));
            total += len[k];
        }
        k = 1;
        var acc = 0;
        for (var s = 0; s < count; s++) {
            var t = s / count * total;
            while (k < pairs.length - 1 && acc + len[k] < t) acc += len[k++];
            var w = len[k] ? (t - acc) / len[k] : 0;
            out.a.push(at(A, MA, pairs[k - 1][0] + (pairs[k][0] - pairs[k - 1][0]) * w));
            out.b.push(at(B, MB, pairs[k - 1][1] + (pairs[k][1] - pairs[k - 1][1]) * w));
        }
        return out;
    }

    // a loop's points respaced evenly along its own length
    function respace(pts, count) {
        var n = pts.length, cum = [0], out = [], k;
        for (k = 0; k < n; k++) {
            var q = pts[(k + 1) % n];
            cum.push(cum[k] + Math.sqrt((q[0] - pts[k][0]) * (q[0] - pts[k][0]) + (q[1] - pts[k][1]) * (q[1] - pts[k][1])));
        }
        k = 0;
        for (var s = 0; s < count; s++) {
            var t = s / count * cum[n];
            while (k < n - 1 && cum[k + 1] < t) k++;
            var w = (t - cum[k]) / ((cum[k + 1] - cum[k]) || 1), p = pts[k], r = pts[(k + 1) % n];
            out.push([p[0] + (r[0] - p[0]) * w, p[1] + (r[1] - p[1]) * w]);
        }
        return out;
    }

    // does a pairing's morph cross over or pinch (under thr)? { cross, pinch }, 96 points
    // along it at the 19 in-betweens; the neck on 64 points respaced along each in-between
    // (pinches at every other in-between: a neck doesn't come and go within a twentieth of the
    // morph, and the pinch test was a fifth of a fix's time; crossings at all 19, which the
    // final paths are checked for again)
    function warpCheck(A, MA, B, MB, pairs, thr) {
        var pp = warpPoints(A, MA, B, MB, pairs, 96), out = { cross: 0, pinch: false }, n = pp.a.length, least = Math.min(loopArea(pp.a), loopArea(pp.b));
        for (var u = 0; u < XU.length; u++) {
            var pts = new Array(n), w = XU[u];
            for (var j = 0; j < n; j++) pts[j] = [pp.a[j][0] + (pp.b[j][0] - pp.a[j][0]) * w, pp.a[j][1] + (pp.b[j][1] - pp.a[j][1]) * w];
            out.cross += selfCrossings(distinct(pts), 1, true);
            if (out.cross) return out;
            if (!out.pinch && u % 2 === 0 && ((thr > 1e-3 && nearlyMeets(respace(pts, 64), thr)) || collapses(pts, least))) out.pinch = true;
        }
        return out;
    }

    // what a pairing costs, priced finely (about 256 steps round) the way the DTW prices it
    // (travelOnly: its travel alone)
    function warpPrice(A, B, pairs, travelOnly) {
        var MA = measure(A), MB = measure(B), SA = samples(A, MA), SB = samples(B, MB), c = 0, k;
        var pa = at(A, MA, pairs[0][0]), pb = at(B, MB, pairs[0][1]);
        for (k = 1; k < pairs.length; k++) {
            var da = pairs[k][0] - pairs[k - 1][0], db = pairs[k][1] - pairs[k - 1][1], n = Math.max(1, Math.ceil((da + db) * 128));
            for (var s = 1; s <= n; s++) {
                var qa = at(A, MA, pairs[k - 1][0] + da * s / n), qb = at(B, MB, pairs[k - 1][1] + db * s / n);
                var dt = (da + db) / 2 / n, tx = (qa[0] - SA.cx) - (qb[0] - SB.cx), ty = (qa[1] - SA.cy) - (qb[1] - SB.cy);
                var ux = qa[0] - pa[0], uy = qa[1] - pa[1], vx = qb[0] - pb[0], vy = qb[1] - pb[1];
                var la = Math.sqrt(ux * ux + uy * uy), lb = Math.sqrt(vx * vx + vy * vy);
                c += (tx * tx + ty * ty) * dt + (travelOnly ? 0 : WARP_BEND * (2 * (la * lb - ux * vx - uy * vy) + WARP_STRETCH * (la - lb) * (la - lb)) / (dt > 1e-12 ? dt : 1e-12));
                pa = qa;
                pb = qb;
            }
        }
        return c;
    }

    // the pairing the points themselves make (point k with point k, as AE morphs them)
    function vertexPairs(A, B) {
        var fa = fractions(A, measure(A)), fb = fractions(B, measure(B)), out = [];
        for (var k = 0; k < fa.length; k++) out.push([fa[k], fb[k]]);
        out.push([fa[0] + 1, fb[0] + 1]);
        return out;
    }

    // the warp for the step A -> B (closed, same direction), or null when it crosses over, or
    // pinches where spreading evenly doesn't. -> { pairs: [[a, b], ...] from [0, b0] to
    // [1, b0 + 1] (a: A's fraction, b: B's, unwrapped), cost, pinch }
    // (thorough: the axes found as the sym option finds them, for shapes drawn a little unevenly)
    function warpStep(A, B, tick, thorough) {
        var MA = measure(A), MB = measure(B);
        if (seedStep(A, MA, B, MB) || sameKey(A, B)) return null;
        // keys that share a mirror axis are only ever paired symmetrically: by a warp built so
        // (warpMirror), or, failing that, spread evenly from a symmetric start
        var thr = NECK_MU * Math.min(neckOf(samples(A, MA, 64).pts), neckOf(samples(B, MB, 64).pts));
        var axes = sharedAxes(samples(A, MA, thorough ? 2 * N : N), samples(B, MB, thorough ? 2 * N : N), thorough);
        if (axes.length) return warpMirror(A, MA, B, MB, axes, thr);
        // coarse: B's starts within WARP_REACH of its start as aligned (on the tests' type, all
        // 66 warped steps took one within 0.125), with the plain steps only
        var cA = warpSamples(A, MA, WARP_COARSE), cB = warpSamples(B, MB, WARP_COARSE), all = [], j, idx = [];
        for (j = 0; j < cB.f.length; j++) if (circDist(cB.f[j], 0) <= WARP_REACH) all.push(j);
        var coarse = warpDTW(cA, cB, all, true, null, 5), order = [];
        for (j = 0; j < all.length; j++) order.push(j);
        order.sort(function (x, y) { return (coarse.costs[x] - coarse.costs[y]) || (x - y); });
        for (j = 0; j < order.length; j++) idx.push(all[order[j]]);
        if (tick) tick();
        // the coarse starts in turn, cheapest first: each refined among the fine starts within
        // half a coarse step, and kept if its morph keeps clear; up to WARP_TRIES of them (N into
        // Z: the cheapest crossed once, another didn't). One that only pinches, kept if
        // spreading evenly pinches as well
        var fA = warpSamples(A, MA, WARP_N), fB = warpSamples(B, MB, WARP_N), seen = {}, tried = 0, pinched = null;
        for (var r = 0; r < order.length && tried < WARP_TRIES; r++) {
            if (coarse.costs[order[r]] === Infinity) break;
            // the fine start nearest the coarse one (its neighbours as well found the same
            // pairings on the tests' type, for a third more time)
            var f0 = cB.f[idx[r]], shifts = [], near = -1;
            for (j = 0; j < fB.f.length; j++) if (near < 0 || circDist(fB.f[j], f0) < circDist(fB.f[near], f0)) near = j;
            if (seen[near]) continue;
            seen[near] = true;
            shifts.push(near);
            var fine = warpDTW(fA, fB, shifts, false, { path: coarse.all[order[r]].path, r: WARP_BAND / WARP_COARSE }).best;
            if (tick) tick();
            if (fine.cost === Infinity) continue;
            tried++;
            var pairs = warpStraighten(fine.path, WARP_STRAIGHT / WARP_N), chk = warpCheck(A, MA, B, MB, pairs, thr);
            if (chk.cross) continue;
            if (!chk.pinch) return { pairs: pairs, cost: fine.cost, pinch: false };
            if (!pinched) pinched = { pairs: pairs, cost: fine.cost, pinch: true };
        }
        if (pinched) {
            var ev = warpCheck(A, MA, B, MB, [[0, 0], [1, 1]], thr);
            if (ev.cross || ev.pinch) return pinched;
        }
        return null;
    }

    // ---- the mirrored warp: keys that share mirror axes, paired slice by slice ----------------
    // Keys that share k mirror axes cross each of them twice: 2k poles round each outline, equally
    // far apart. A's slice from one pole to the next is paired by DTW, end to end, with a slice
    // of B between two of its poles, and that pairing is mirrored about each pole in turn all the
    // way round: the morph is then exactly as symmetric as its keys, and every arm of a star or
    // a plus does the same thing at the same time (mirrored about one axis only, a star's top
    // point flattened while the others turned: symmetric, but not in unison). Every way of laying
    // A's slice on B's is tried (B's 2k slices), the cheapest whose morph keeps clear is taken;
    // with none, the axes one at a time (each half mirrored onto the other). -> as warpStep,
    // mirror: k (the axes kept)
    function warpMirror(A, MA, B, MB, axes, thr) {
        var SA = sized(samples(A, MA, 4 * N)), SB = sized(samples(B, MB, 4 * N)), k = axes.length, x;
        if (k > 1) {
            var pa = mirrorPoles(A, MA, SA, axes), pb = mirrorPoles(B, MB, SB, axes);
            if (pa && pb) {
                var w = mirrorSlices(A, MA, B, MB, pa[0].f, onAxis(pb, pa[0].axis), 1 / (2 * k), thr);
                if (w) {
                    w.mirror = k;
                    return w;
                }
            }
        }
        // one axis at a time (the first two), A's half from its pole against B's from either pole
        var best = null;
        for (x = 0; x < k && x < 2; x++) {
            var qa = mirrorPoles(A, MA, SA, [axes[x]]), qb = mirrorPoles(B, MB, SB, [axes[x]]);
            if (!qa || !qb) continue;
            var r = mirrorSlices(A, MA, B, MB, qa[0].f, onAxis(qb, 0), 0.5, thr);
            if (r && (!best || (best.pinch && !r.pinch) || (best.pinch === r.pinch && r.cost < best.cost))) best = r;
        }
        if (best) best.mirror = 1;
        return best;
    }

    // the 2k poles of P on axes (each crossed twice), sorted round the outline: [{ f, axis (its
    // index) }], or null when they aren't about equally far apart (the axes don't share P's symmetry)
    function mirrorPoles(P, M, S, axes) {
        var out = [], j, k2 = 2 * axes.length;
        for (j = 0; j < axes.length; j++) {
            var p = poleAt(S, axes[j]);
            if (!(p.e < Infinity)) return null;
            var f0 = poleOn(P, M, S, axes[j], p.p);
            out.push({ f: f0 - Math.floor(f0), axis: j });
            out.push({ f: f0 + 0.5 - Math.floor(f0 + 0.5), axis: j });
        }
        out.sort(function (x, y) { return x.f - y.f; });
        for (j = 0; j < k2; j++) {
            var gap = (j + 1 < k2 ? out[j + 1].f : out[0].f + 1) - out[j].f;
            if (Math.abs(gap - 1 / k2) > 0.25 / k2) return null;
        }
        return out;
    }

    // the fractions of the poles on one axis (B's slice must start on the axis A's does: started
    // on another, the arms swirl round instead of mirroring)
    function onAxis(poles, axis) {
        var out = [];
        for (var j = 0; j < poles.length; j++) if (poles[j].axis === axis) out.push(poles[j].f);
        return out;
    }

    // A's slice from pole a0 (length L, a pole to the next) against each of B's slices (from each
    // of its poles), paired by DTW and mirrored about each pole in turn round the outline: the
    // cheapest whose morph keeps clear (or only pinches where spreading evenly does too)
    function mirrorSlices(A, MA, B, MB, a0, poles, L, thr) {
        var best = null, pinched = null, SAs = warpSpan(A, MA, a0, a0 + L, WARP_N), turns = Math.round(1 / L);
        for (var j = 0; j < poles.length; j++) {
            var b0 = poles[j], r = warpOpen(SAs, warpSpan(B, MB, b0, b0 + L, WARP_N));
            if (r.cost === Infinity || (best && r.cost >= best.cost)) continue;
            var arc = warpStraighten(r.path, WARP_STRAIGHT / WARP_N), full = arc.slice(0), prev = arc, i, q;
            for (i = 1; i < turns; i++) {
                var ai = a0 + i * L, bi = b0 + i * L, next = [[ai, bi]];
                for (q = prev.length - 2; q >= 0; q--) next.push([2 * ai - prev[q][0], 2 * bi - prev[q][1]]);
                for (q = 1; q < next.length; q++) full.push(next[q]);
                prev = next;
            }
            var pairs = warpRotate(full, 0), chk = warpCheck(A, MA, B, MB, pairs, thr);
            if (chk.cross) continue;
            if (!chk.pinch) best = { pairs: pairs, cost: r.cost, pinch: false };
            else if (!pinched || r.cost < pinched.cost) pinched = { pairs: pairs, cost: r.cost, pinch: true };
        }
        if (best) return best;
        if (pinched) {
            var ev = warpCheck(A, MA, B, MB, [[0, 0], [1, 1]], thr);
            if (ev.cross || ev.pinch) return pinched;
        }
        return null;
    }

    // the fraction where P's outline crosses the axis at angle phi through S's centre, refined
    // from the samples' crossing at index p by halving on the curve itself (a pole taken
    // between samples left a star's mirrored morph 0.6 % off symmetric)
    function poleOn(P, M, S, phi, p) {
        var n = S.pts.length, sn = Math.sin(phi), cs = Math.cos(phi), lo = (p - 1) / n, hi = (p + 1) / n;
        var side = function (f) { var q = at(P, M, f); return -(q[0] - S.cx) * sn + (q[1] - S.cy) * cs; };
        var dl = side(lo);
        if ((dl <= 0) === (side(hi) <= 0)) return p / n;      // no crossing to refine between them
        for (var k = 0; k < 40; k++) {
            var mid = (lo + hi) / 2, dm = side(mid);
            if ((dm <= 0) === (dl <= 0)) {
                lo = mid;
                dl = dm;
            } else hi = mid;
        }
        return (lo + hi) / 2;
    }

    // P sampled from fraction f0 to f1 (f0 < f1, unwrapped): both ends and the corners between
    // exactly, the rest every 1/n of the outline (none within 0.35/n of those), around P's centre
    function warpSpan(P, M, f0, f1, n) {
        var cs = corners(P, M), fs = [f0, f1], S = samples(P, M), j, k;
        for (j = 0; j < cs.length; j++) {
            var c = f0 + (((cs[j].f - f0) % 1) + 1) % 1;
            if (c > f0 + 1e-9 && c < f1 - 1e-9) fs.push(c);
        }
        for (k = Math.ceil(f0 * n + 1e-9); k <= Math.floor(f1 * n - 1e-9); k++) {
            var ok = true;
            for (j = 0; j < fs.length && ok; j++) if (Math.abs(k / n - fs[j]) < 0.35 / n) ok = false;
            if (ok) fs.push(k / n);
        }
        fs.sort(function (a, b) { return a - b; });
        var out = { f: [], p: [], corner: [] };
        for (j = 0; j < fs.length; j++) {
            if (out.f.length && fs[j] - out.f[out.f.length - 1] < 1e-9) continue;
            var q = at(P, M, fs[j]), cc = false;
            for (k = 0; k < cs.length; k++) if (circDist(fs[j], cs[k].f) < 1e-9) cc = true;
            out.f.push(fs[j]);
            out.p.push([q[0] - S.cx, q[1] - S.cy]);
            out.corner.push(cc);
        }
        return out;
    }

    // DTW between two open spans, end paired with end, priced as warpDTW prices a step
    // -> { cost, path: [[a, b, cornerA, cornerB], ...] }
    function warpOpen(SA, SB) {
        var n = SA.f.length - 1, m = SB.f.length - 1, W = m + 1, i, j, t, cost = new Array((n + 1) * W), from = new Array((n + 1) * W);
        for (t = 0; t < cost.length; t++) {
            cost[t] = Infinity;
            from[t] = -1;
        }
        cost[0] = 0;
        for (i = 0; i <= n; i++) {
            for (j = 0; j <= m; j++) {
                var c0 = cost[i * W + j];
                if (c0 === Infinity) continue;
                for (var st = 0; st < WARP_STEPS.length; st++) {
                    var i2 = i + WARP_STEPS[st][0], j2 = j + WARP_STEPS[st][1];
                    if (i2 > n || j2 > m) continue;
                    var a0 = SA.p[i], a1 = SA.p[i2], b0 = SB.p[j], b1 = SB.p[j2], dt = ((SA.f[i2] - SA.f[i]) + (SB.f[j2] - SB.f[j])) / 2;
                    var tx = a1[0] - b1[0], ty = a1[1] - b1[1], ux = a1[0] - a0[0], uy = a1[1] - a0[1], vx = b1[0] - b0[0], vy = b1[1] - b0[1];
                    var la = Math.sqrt(ux * ux + uy * uy), lb = Math.sqrt(vx * vx + vy * vy);
                    var c = c0 + (tx * tx + ty * ty) * dt + WARP_BEND * (2 * (la * lb - ux * vx - uy * vy) + WARP_STRETCH * (la - lb) * (la - lb)) / (dt > 1e-12 ? dt : 1e-12);
                    var k2 = i2 * W + j2;
                    if (c < cost[k2]) {
                        cost[k2] = c;
                        from[k2] = i * W + j;
                    }
                }
            }
        }
        var path = [];
        for (t = n * W + m; t >= 0; t = from[t]) {
            var ii = Math.floor(t / W), jj = t % W;
            path.push([SA.f[ii], SB.f[jj], SA.corner[ii], SB.corner[jj]]);
        }
        path.reverse();
        return { cost: cost[n * W + m], path: path };
    }

    // the mirror axes two keys share (directions, radians): none when either has none, or
    // both are round (any pairing keeps a circle a circle)
    function sharedAxes(SA, SB, thorough) {
        var a = mirrorAxes(SA, thorough), b = mirrorAxes(SB, thorough), out = [], i, j;
        if (a === 'round' && b === 'round') return out;
        if (a === 'round' || b === 'round') {
            var only = a === 'round' ? b : a;
            for (i = 0; i < only.length; i++) out.push(only[i].phi);
            return out;
        }
        for (i = 0; i < a.length; i++) {
            for (j = 0; j < b.length; j++) {
                var d = Math.abs(a[i].phi - b[j].phi) % Math.PI;
                if (Math.min(d, Math.PI - d) < SYM_ANGLE) {
                    out.push(a[i].phi);
                    break;
                }
            }
        }
        return out;
    }

    // does a pairing's morph stay mirror-symmetric about one of the axes its keys share (at 20,
    // 40, 60, 80 %)? Keys that share an axis keep it with their even pairing (symmetric starts), so
    // a warp has to as well: a star into the same star turned 36 deg swirled otherwise
    function keepsAxes(A, MA, B, MB, pairs, axes) {
        var pp = warpPoints(A, MA, B, MB, pairs, 128), us = [0.2, 0.4, 0.6, 0.8];
        for (var q = 0; q < us.length; q++) {
            var pts = [], j, cx = 0, cy = 0;
            for (j = 0; j < pp.a.length; j++) pts.push([pp.a[j][0] + (pp.b[j][0] - pp.a[j][0]) * us[q], pp.a[j][1] + (pp.b[j][1] - pp.a[j][1]) * us[q]]);
            pts = respace(distinct(pts), N);
            for (j = 0; j < pts.length; j++) {
                cx += pts[j][0];
                cy += pts[j][1];
            }
            if (!keepsAxis(sized({ pts: pts, cx: cx / pts.length, cy: cy / pts.length }), axes)) return false;
        }
        return true;
    }

    // do samples S keep one of the axes? Their mirror error about each, measured directly:
    // clearly symmetric (under WARP_SYM) or clearly not (over SYM_TOL) settles it; in between,
    // the axis search the keys were measured with decides (within SYM_ANGLE). That search every
    // time cost the symmetry demo ten minutes in After Effects
    function keepsAxis(S, axes) {
        var close = false, j;
        for (j = 0; j < axes.length; j++) {
            var e = poleAt(S, axes[j]).e;
            if (e <= WARP_SYM) return true;
            if (e <= SYM_TOL) close = true;
        }
        if (!close) return false;
        var ax = mirrorAxes(S);
        if (ax === 'round') return true;
        for (j = 0; j < axes.length; j++) {
            for (var i = 0; i < ax.length; i++) {
                var d = Math.abs(ax[i].phi - axes[j]) % Math.PI;
                if (Math.min(d, Math.PI - d) < SYM_ANGLE) return true;
            }
        }
        return false;
    }

    // a step with a key that is a seed (under 2 % of the other's size: a hole waiting to grow,
    // or gone, as matchPieces deals it): nothing to pair by shape (the hole's own timing grows
    // or shrinks it), and the seed must come out as dealt, or a second fix moves it
    function seedStep(A, MA, B, MB) {
        var dA = pieceInfo(A).diag, dB = pieceInfo(B).diag;
        return !(MA.total > 1e-6) || !(MB.total > 1e-6) || dA < 0.02 * dB || dB < 0.02 * dA;
    }

    // the same key twice (a hold): nothing to pair
    function sameKey(A, B) {
        if (A.v.length !== B.v.length) return false;
        for (var k = 0; k < A.v.length; k++) {
            if (Math.abs(A.v[k][0] - B.v[k][0]) > 1e-9 || Math.abs(A.v[k][1] - B.v[k][1]) > 1e-9) return false;
            if (Math.abs(A.i[k][0] - B.i[k][0]) > 1e-9 || Math.abs(A.i[k][1] - B.i[k][1]) > 1e-9) return false;
            if (Math.abs(A.o[k][0] - B.o[k][0]) > 1e-9 || Math.abs(A.o[k][1] - B.o[k][1]) > 1e-9) return false;
        }
        return true;
    }

    // the cheapest warp from both keys' own starts (the yardstick a second fix holds a pairing to)
    function warpHere(A, MA, B, MB) {
        var best = warpDTW(warpSamples(A, MA, WARP_N), warpSamples(B, MB, WARP_N), [0]).best;
        return warpStraighten(best.path, WARP_STRAIGHT / WARP_N);
    }

    // pairs P (a from p0 to p0 + 1) read from a = t0 instead (the first node there, if a run
    // of them holds a = t0); b unchanged, a moved by whole turns to start exactly at t0
    function warpRotate(P, t0) {
        var p0 = P[0][0], t = p0 + (t0 - p0 - Math.floor(t0 - p0)), n = P.length, k = 0, x, out = [], j, on;
        while (k < n - 1 && P[k][0] < t - 1e-12) k++;
        on = Math.abs(P[k][0] - t) <= 1e-12;
        if (on) x = [t, P[k][1]];
        else {
            var w = (t - P[k - 1][0]) / (P[k][0] - P[k - 1][0]);
            x = [t, P[k - 1][1] + (P[k][1] - P[k - 1][1]) * w];
        }
        out.push(x);
        for (j = on ? k + 1 : k; j < n - 1; j++) out.push([P[j][0], P[j][1]]);
        for (j = 0; j < k; j++) out.push([P[j][0] + 1, P[j][1] + 1]);
        out.push([x[0] + 1, x[1] + 1]);
        var d = t0 - t;
        for (j = 0; j < out.length; j++) out[j][0] += d;
        return out;
    }

    // breakpoints T (tuples of keys 0..c, key c's fraction from t0 to t0 + 1) and pairs P (key
    // c -> key c + 1, a from t0 to t0 + 1) merged into tuples of keys 0..c + 1. Where both hold
    // key c still, T's run goes first (key c + 1 waits), then P's (keys 0..c wait)
    function warpMerge(T, P, c) {
        var out = [], i = 0, j = 0, nT = T.length, nP = P.length, q, r;
        while (i < nT || j < nP) {
            var vt = i < nT ? T[i][c] : Infinity, vp = j < nP ? P[j][0] : Infinity;
            if (Math.abs(vt - vp) <= 1e-12) {
                var hold = P[j][1], lastT = T[i];
                while (i < nT && Math.abs(T[i][c] - vt) <= 1e-12) {
                    r = T[i].slice(0);
                    r.push(hold);
                    out.push(r);
                    lastT = T[i++];
                }
                for (j++; j < nP && Math.abs(P[j][0] - vp) <= 1e-12; j++) {
                    r = lastT.slice(0);
                    r.push(P[j][1]);
                    out.push(r);
                }
            } else if (vt < vp) {
                var w = (vt - P[j - 1][0]) / (P[j][0] - P[j - 1][0]);
                r = T[i++].slice(0);
                r.push(P[j - 1][1] + (P[j][1] - P[j - 1][1]) * w);
                out.push(r);
            } else {
                var w2 = (vp - T[i - 1][c]) / (T[i][c] - T[i - 1][c]);
                r = [];
                for (q = 0; q < T[i].length; q++) r.push(T[i - 1][q] + (T[i][q] - T[i - 1][q]) * w2);
                r.push(P[j++][1]);
                out.push(r);
            }
        }
        return out;
    }

    // a breakpoint where key k is at fraction f (once round), unless one is there already
    function warpInsert(T, k, f) {
        var t0 = T[0][k], v = t0 + (f - t0 - Math.floor(f - t0)), j;
        for (j = 0; j < T.length; j++) if (Math.abs(T[j][k] - v) <= 1e-9 || Math.abs(T[j][k] - v - 1) <= 1e-9) return T;
        for (j = 0; j < T.length - 1; j++) {
            if (T[j][k] < v && v < T[j + 1][k]) {
                var w = (v - T[j][k]) / (T[j + 1][k] - T[j][k]), r = [];
                for (var q = 0; q < T[j].length; q++) r.push(T[j][q] + (T[j + 1][q] - T[j][q]) * w);
                T.splice(j + 1, 0, r);
                return T;
            }
        }
        return T;
    }

    // every step's pairing (steps[k]: key k-1 -> key k; [[0, 0], [1, 1]] spreads it evenly)
    // composed into one shared parameter: breakpoints [f_0 .. f_K-1], each key's fraction
    // (unwrapped, none going back), from key 0's start round to it again, with every key's
    // corners among them
    function warpCompose(steps, paths, Ms) {
        var T = [], j, k;
        for (j = 0; j < steps[1].length; j++) T.push([steps[1][j][0], steps[1][j][1]]);
        for (k = 2; k < steps.length; k++) T = warpMerge(T, warpRotate(steps[k], T[0][k - 1]), k - 1);
        for (k = 0; k < paths.length; k++) {
            var cs = corners(paths[k], Ms[k]);
            for (j = 0; j < cs.length; j++) T = warpInsert(T, k, cs[j].f);
        }
        return T;
    }

    // layout() for a warp: the breakpoints pinned, the remaining points spread over the gaps
    // between them by the longest span any key has there (where one key holds still and
    // another runs on, the one running needs its points as much as anywhere: by the keys' mean
    // span u into n needed 160 points for what took 29 spread evenly). -> F[k] for each key:
    // [{ f, pinned, t }]
    function warpLayout(T, total) {
        var K = T[0].length, pins = [], j, k, q;
        for (j = 0; j < T.length - 1; j++) {
            var same = j > 0;
            for (k = 0; k < K && same; k++) if (Math.abs(T[j][k] - pins[pins.length - 1].t[k]) > 1e-12) same = false;
            if (!same) pins.push({ t: T[j], next: T[j + 1] });
            else pins[pins.length - 1].next = T[j + 1];
        }
        var free = Math.max(0, total - pins.length), given = 0, order = [], sum = 0;
        for (j = 0; j < pins.length; j++) {
            pins[j].len = 0;
            for (k = 0; k < K; k++) pins[j].len = Math.max(pins[j].len, pins[j].next[k] - pins[j].t[k]);
            sum += pins[j].len;
        }
        for (j = 0; j < pins.length; j++) {
            var share = free * pins[j].len / (sum || 1);
            pins[j].n = Math.floor(share);
            pins[j].rem = share - pins[j].n;
            pins[j].idx = j;
            given += pins[j].n;
            order.push(pins[j]);
        }
        order.sort(function (x, y) { return (y.rem - x.rem) || (x.idx - y.idx); });
        for (j = 0; j < order.length && given < free; j++) {
            order[j].n++;
            given++;
        }
        // t: the shared parameter at each point, the keys' mean fraction (once round: 1)
        var F = [], mean = function (tu) { var m = 0; for (var g = 0; g < K; g++) m += tu[g]; return m / K; };
        for (k = 0; k < K; k++) F.push([]);
        for (j = 0; j < pins.length; j++) {
            var t0 = mean(pins[j].t), t1 = mean(pins[j].next);
            for (k = 0; k < K; k++) {
                F[k].push({ f: pins[j].t[k], pinned: true, t: t0 });
                for (q = 1; q <= pins[j].n; q++) F[k].push({ f: pins[j].t[k] + (pins[j].next[k] - pins[j].t[k]) * q / (pins[j].n + 1), pinned: false, t: t0 + (t1 - t0) * q / (pins[j].n + 1) });
            }
        }
        return F;
    }

    // the warps of a set of aligned keys: for each step, a warp where one is clean (not across a
    // turn taken out, nor a key drawn as a turn and kept as drawn, nor one switched off in
    // o.noWarp), else even. -> null when no step warps, else { T (breakpoints), warped: [k] }
    function warpChain(al, keys, o, tick) {
        var steps = [null], any = false, k;
        for (k = 1; k < al.length; k++) {
            var w = null;
            if (!keys[k].turn && !keys[k].keptDrawn && !(o.noWarp && o.noWarp[k])) {
                if (o.memo && o.memo.warps.hasOwnProperty(k)) w = o.memo.warps[k];
                else {
                    w = warpStep(al[k - 1], al[k], tick ? function () { tick(0.3 * k / al.length); } : null, o.symmetry === 'force');
                    if (o.memo) o.memo.warps[k] = w;
                }
            }
            steps.push(w ? w.pairs : [[0, 0], [1, 1]]);
            keys[k].warped = !!w;
            keys[k].mirrored = !!(w && w.mirror);
            if (w) any = true;
        }
        if (!any) return null;
        var Ms = [];
        for (k = 0; k < al.length; k++) Ms.push(measure(al[k]));
        return warpCompose(steps, al, Ms);
    }

    // how many breakpoints a warp may have: maxPoints, or the corners if they alone need more
    function warpRoom(paths, maxPoints) {
        var c = 1;
        for (var k = 0; k < paths.length; k++) c += corners(paths[k], measure(paths[k])).length;
        return Math.max(Math.max(4, Math.round(maxPoints || 100)), c);
    }

    // RMS travel (px) of the points as they pair (point k with point k), around the centres:
    // 4 points a segment
    function rmsPaired(A, B) {
        var pa = [], pb = [], ca = [0, 0], cb = [0, 0], k, t, s = 0;
        for (k = 0; k < segCount(A); k++) {
            for (t = 0; t < 4; t++) {
                var p = bez(seg(A, k), t / 4), q = bez(seg(B, k), t / 4);
                pa.push(p);
                pb.push(q);
                ca[0] += p[0];
                ca[1] += p[1];
                cb[0] += q[0];
                cb[1] += q[1];
            }
        }
        for (k = 0; k < pa.length; k++) {
            var dx = (pa[k][0] - ca[0] / pa.length) - (pb[k][0] - cb[0] / pb.length), dy = (pa[k][1] - ca[1] / pa.length) - (pb[k][1] - cb[1] / pb.length);
            s += dx * dx + dy * dy;
        }
        return Math.sqrt(s / pa.length);
    }

    // the vertices where the outline turns (in and out directions differ by more than 8 deg)
    function corners(P, M) {
        var out = [], n = P.v.length, fr = fractions(P, M), m = segCount(P);
        for (var k = 0; k < n; k++) {
            var din = (P.closed || k > 0) ? endDir(seg(P, (k - 1 + m) % m), true) : null;
            var dout = (P.closed || k < n - 1) ? endDir(seg(P, k % m), false) : null;
            if (!P.closed && (k === 0 || k === n - 1)) {
                out.push({ f: fr[k], k: k, din: din || dout, dout: dout || din });
                continue;
            }
            if (!din || !dout) continue;
            if (din[0] * dout[0] + din[1] * dout[1] < 0.990268) out.push({ f: fr[k], k: k, din: din, dout: dout });
        }
        return out;
    }

    // the shared fractions: every key's corners (clustered) and 0, the rest spread evenly
    function layout(paths, Ms, total) {
        var pins = [{ f: 0 }], p, j;
        for (p = 0; p < paths.length; p++) {
            var cs = corners(paths[p], Ms[p]);
            for (j = 0; j < cs.length; j++) pins.push({ f: cs[j].f });
        }
        if (!paths[0].closed) pins.push({ f: 1 });
        pins.sort(function (a, b) { return a.f - b.f; });
        // every key's corners stay at their own exact fraction (merging near ones would give
        // their neighbours different spacing, hence handle ratios, in different keys)
        var fixed = [];
        for (j = 0; j < pins.length; j++) {
            if (!fixed.length || pins[j].f - fixed[fixed.length - 1] > 1e-9) fixed.push(pins[j].f);
        }
        if (paths[0].closed && fixed.length > 1 && 1 - fixed[fixed.length - 1] <= 1e-9) fixed.pop();
        // spread the remaining points over the gaps between pinned fractions, by length
        var gaps = [], nG = paths[0].closed ? fixed.length : fixed.length - 1, free = Math.max(0, total - (paths[0].closed ? fixed.length : fixed.length));
        for (j = 0; j < nG; j++) {
            var a = fixed[j], b = j + 1 < fixed.length ? fixed[j + 1] : 1;
            gaps.push({ a: a, len: b - a, n: 0, rem: 0 });
        }
        var given = 0;
        for (j = 0; j < gaps.length; j++) {
            var share = free * gaps[j].len;
            gaps[j].n = Math.floor(share);
            gaps[j].rem = share - gaps[j].n;
            given += gaps[j].n;
        }
        var order = gaps.slice(0);
        for (j = 0; j < order.length; j++) order[j].idx = j;
        order.sort(function (x, y) { return (y.rem - x.rem) || (x.idx - y.idx); });
        for (j = 0; j < order.length && given < free; j++) {
            order[j].n++;
            given++;
        }
        var F = [];
        for (j = 0; j < gaps.length; j++) {
            F.push({ f: gaps[j].a, pinned: true });
            for (var q = 1; q <= gaps[j].n; q++) F.push({ f: gaps[j].a + gaps[j].len * q / (gaps[j].n + 1), pinned: false });
        }
        if (!paths[0].closed) F.push({ f: 1, pinned: true });
        return F;
    }

    // key P rebuilt on the fractions F
    function resample(P, M, F) {
        var cs = corners(P, M), n = F.length, pts = [], j, c;
        for (j = 0; j < n; j++) {
            var f = F[j].f, hit = null;
            if (F[j].pinned) {
                for (c = 0; c < cs.length; c++) if (circDist(cs[c].f, f) <= 1e-9 && !hit) hit = cs[c];
            }
            if (hit) {
                pts.push({ p: [P.v[hit.k][0], P.v[hit.k][1]], f: hit.f + Math.round(f - hit.f), din: hit.din, dout: hit.dout, corner: true, t: F[j].t });
            } else {
                var L = locate(M, wrap(P, f) * M.total), sg = seg(P, L.k), d = dirAt(sg, L.t);
                pts.push({ p: bez(sg, L.t), f: f, din: d, dout: d, t: F[j].t });
            }
        }
        var R = { v: [], i: [], o: [], closed: P.closed };
        for (j = 0; j < n; j++) {
            var prev = j > 0 ? pts[j - 1].f : (P.closed ? pts[n - 1].f - 1 : null);
            var next = j < n - 1 ? pts[j + 1].f : (P.closed ? pts[0].f + 1 : null);
            var li = prev === null ? 0 : (pts[j].f - prev) * M.total / 3, lo = next === null ? 0 : (next - pts[j].f) * M.total / 3;
            // a warp's point where the key changes pace (it runs faster on one side than the
            // other) but the outline is smooth: both handles at one pace, so every key's in and
            // out handles keep the same ratio (the shared parameter's) and the in-betweens, the
            // keys' blend, stay smooth there too. Where the key holds still on one side that
            // handle stays 0 (a piece grows out of this point: a real corner on the way)
            if (F[j].t !== undefined && !pts[j].corner && li > 0 && lo > 0) {
                var tp = j > 0 ? F[j - 1].t : F[n - 1].t - 1, tn = j < n - 1 ? F[j + 1].t : F[0].t + 1;
                if (pts[j].t - tp > 1e-12 && tn - pts[j].t > 1e-12) {
                    var pace = Math.sqrt((li / (pts[j].t - tp)) * (lo / (tn - pts[j].t)));
                    li = pace * (pts[j].t - tp);
                    lo = pace * (tn - pts[j].t);
                }
            }
            var di = pts[j].din || [0, 0], dd = pts[j].dout || [0, 0];
            R.v.push(pts[j].p);
            R.i.push([-di[0] * li, -di[1] * li]);
            R.o.push([dd[0] * lo, dd[1] * lo]);
        }
        return R;
    }

    // squared distance from point pt to path P near fraction f (its segment and neighbours)
    function near2(P, M, pt, f) {
        var L = locate(M, wrap(P, f) * M.total), mP = segCount(P), e2;
        var d2 = refine(seg(P, L.k), pt, L.t, 0.25);
        if (L.t < 0.25 && (P.closed || L.k > 0)) {
            e2 = refine(seg(P, (L.k - 1 + mP) % mP), pt, 1, 0.25);
            if (e2 < d2) d2 = e2;
        }
        if (L.t > 0.75 && (P.closed || L.k < mP - 1)) {
            e2 = refine(seg(P, (L.k + 1) % mP), pt, 0, 0.25);
            if (e2 < d2) d2 = e2;
        }
        return d2;
    }

    // how far original A and rebuilt B part (px), looking both ways near the same fraction:
    // B's segments at their quarter points (they are short), A's long ones at every one of
    // their SUB arc-length samples (a quarter point can miss where B cuts a tight bend).
    // Cheap enough for ExtendScript.
    // (off: B starts at A's fraction off, as a warp can start a key elsewhere)
    function strays(A, MA, B, dense, off) {
        var MB = measure(B), worst = 0, pass, j, q, mB = segCount(B);
        // a rebuilt segment whose handle points back against its chord is folding over a hook
        // or a bend too tight for its length: not followed (more points, or keep the originals)
        for (j = 0; j < mB; j++) {
            var s = seg(B, j), cx = s[6] - s[0], cy = s[7] - s[1];
            if (cx * cx + cy * cy < 1e-12) continue;
            if ((s[2] - s[0]) * cx + (s[3] - s[1]) * cy < 0 || (s[6] - s[4]) * cx + (s[7] - s[5]) * cy < 0) return 1e9;
        }
        // B's short segments near their ends and middle, A's long ones at every arc sample
        var bq = [3, 6, 12, 18, 21];
        for (pass = 0; pass < 2; pass++) {
            var X = pass ? A : B, MX = pass ? MA : MB, Y = pass ? B : A, MY = pass ? MB : MA, m = segCount(X);
            if (MX.total <= 0) continue;
            for (j = 0; j < m; j++) {
                var c = seg(X, j), n = pass || dense ? SUB - 1 : bq.length;
                for (var i = 0; i < n; i++) {
                    q = pass || dense ? i + 1 : bq[i];
                    var f = (MX.start[j] + MX.cum[j][q]) / MX.total + (off ? (pass ? -off : off) : 0);     // the sample's own arc fraction, in Y's
                    var d = Math.sqrt(near2(Y, MY, bez(c, q / SUB), f));
                    if (d > worst) worst = d;
                }
            }
        }
        return worst;
    }

    // every key rebuilt with the same points, at most maxPoints (corners and the start always
    // get one, so a path with more corners than that gets one per corner); more points until
    // each key is within tol px or the cap is reached
    function rebuild(paths, maxPoints, tol, tick, T) {
        var Ms = [], p, most = 0;
        for (p = 0; p < paths.length; p++) {
            Ms.push(measure(paths[p]));
            if (paths[p].v.length > most) most = paths[p].v.length;
        }
        var cap = Math.max(4, Math.round(maxPoints || 100));
        // start small (4 per drawn point, 16 to 64) and add points only as the tolerance needs
        var N = Math.min(cap, Math.min(64, Math.max(16, 4 * most))), out, worst;
        for (var round = 0; round < 8; round++) {
            // shared fractions, or with a warp each key's own (T: the steps' warps composed)
            var F = T ? warpLayout(T, N) : layout(paths, Ms, N);
            out = [];
            worst = 0;
            for (p = 0; p < paths.length; p++) {
                if (tick) tick(0.3 + 0.6 * (round + p / paths.length) / 8);
                out.push(resample(paths[p], Ms[p], T ? F[p] : F));
                worst = Math.max(worst, strays(paths[p], Ms[p], out[p], false, T ? F[p][0].f : 0));
            }
            // aim at 80 % of the promise: the quick check can come in ~15 % under the truth
            if (worst <= tol * 0.8 || N >= cap) break;
            N = Math.min(cap, Math.ceil(N * 1.6));
        }
        // a fold (strays = 1e9): loops or cusps it can't follow at this density, fix() keeps
        // the drawn points instead; otherwise short of tol only because of the cap: say how far,
        // measured again densely (that number is shown to the designer)
        var capped = worst > tol * 0.8 && worst < 1e9;
        if (capped) {
            worst = 0;
            for (p = 0; p < paths.length; p++) worst = Math.max(worst, strays(paths[p], Ms[p], out[p], true, T ? F[p][0].f : 0));
        }
        return { paths: out, deviation: worst, failed: worst >= 1e9, capped: capped };
    }

    // nothing to do: same points, same direction, and no start would move; with turns, a step
    // that turns still counts (the keys of a path fixed before, its in-betweens removed)
    function matched(paths, o, turns, drawn) {
        // the decision align() takes, but a start that keeps the morph from crossing over counts
        // as fine without looking for another (untangle's stay)
        var so = { stay: true }, key, k, plans = [null];
        for (key in o) if (key !== 'stay') so[key] = o[key];
        var warping = o.warp === true && o.mode !== 'exact' && paths[0].closed && !!o.start;
        for (k = 1; k < paths.length; k++) {
            if (paths[k].v.length !== paths[0].v.length) return false;
            if (paths[0].closed) {
                if (o.direction && o.sign) {
                    var wd = winding(paths[k]);
                    if (wd && wd !== o.sign) return false;
                }
                if (o.start) {
                    var plan = startPlan(paths[k - 1], paths[k], pairOpts(so, drawn && drawn[k], 0));
                    if (plan.turn && !turns) return false;      // a turn to take out of the path
                    plans.push(plan);
                }
            } else if (o.direction && rms(paths[k - 1], reverse(paths[k])) < rms(paths[k - 1], paths[k]) * GAIN) {
                return false;
            }
        }
        if (!paths[0].closed || !o.start) return true;
        // With the warp a step is matched when its points already pair cleanly (neither the
        // in-betweens nor the final paths cross or pinch, and a mirror axis the keys share is
        // kept) and cost at most WARP_SAME times what the cheapest warp from these same two
        // starts costs: a path warped before (measured on the tests' warped keys fixed again:
        // 0.3 to 1.9 times, mostly 1.0) is left as it is, keys drawn to match by point number
        // are fixed (an L into the L flipped, 6 points each: 2.3 times; T into an upside-down
        // T 6.7). Or when the fix spread it evenly before (its points at the same fractions in
        // both keys); or, as without the warp, when the start needs no move and no warp is
        // clean (u into n drawn with matching starts crosses itself 26 times: a warp is clean,
        // so it isn't matched). A fresh warp isn't the yardstick: found on the rebuilt keys it
        // can pick another start than on the drawn ones (E into F: a third cheaper)
        var waiting = [], steps = [null], any = false;
        for (k = 1; k < paths.length; k++) {
            var startOk = !(plans[k].nd > SNAP || plans[k].near > 0);
            steps.push([[0, 0], [1, 1]]);
            var A = paths[k - 1], B = paths[k], MA = measure(A), MB = measure(B);
            if (!warping || plans[k].turn || (drawn && drawn[k]) || sameKey(A, B) || seedStep(A, MA, B, MB)) {
                if (!startOk) return false;
                continue;
            }
            var vp = vertexPairs(A, B), even = true;
            for (var j = 0; j < vp.length && even; j++) if (Math.abs(vp[j][1] - vp[j][0]) > 0.003) even = false;
            if (startOk && even) continue;
            var thr = NECK_MU * Math.min(neckOf(samples(A, MA, 64).pts), neckOf(samples(B, MB, 64).pts));
            var chk = warpCheck(A, MA, B, MB, vp, thr);
            if (!chk.cross && !chk.pinch && !finalCrosses(A, B)) {
                var axes = sharedAxes(samples(A, MA), samples(B, MB));
                if (!axes.length || keepsAxes(A, MA, B, MB, vp, axes)) {
                    var mine = warpPrice(A, B, vp);
                    if (mine <= WARP_SAME * warpPrice(A, B, warpHere(A, MA, B, MB)) + 1e-3) continue;
                    // a warp the fix took on a later try (M into W: the two cheaper ones crossed)
                    // costs more than the best from its starts, which crosses: held to the warp
                    // the fix would take now instead (an L drawn point for point: 2.3 times it)
                    var now = warpStep(A, B, null, o.symmetry === 'force');
                    if (now && mine <= WARP_SAME_NOW * warpPrice(A, B, now.pairs) + 1e-3) continue;
                }
            }
            if (!startOk) return false;
            waiting.push(k);
        }
        // the steps left: matched only if none has a clean warp, or the warps' breakpoints
        // alone pass the point cap (the fix then spreads evenly, as it found them)
        for (var q = 0; q < waiting.length; q++) {
            var w = warpStep(paths[waiting[q] - 1], paths[waiting[q]], null, o.symmetry === 'force');
            if (w) {
                steps[waiting[q]] = w.pairs;
                any = true;
            }
        }
        if (!any) return true;
        var Ms = [];
        for (k = 0; k < paths.length; k++) Ms.push(measure(paths[k]));
        return warpCompose(steps, paths, Ms).length - 1 > warpRoom(paths, o.maxPoints);
    }

    // fix(paths, { mode, maxPoints, tolerance, start, direction }) -> { paths, keys, matched,
    // mode, fellBack, deviation, capped }. mode 'smooth' (default) rebuilds the points for
    // kink-free in-betweens, at most maxPoints (100) per key, each key within `tolerance` px
    // (0.1) unless the cap stops it first (capped: true, deviation = how far it got); 'exact'
    // keeps every point as drawn and only adds points by splitting (the cap doesn't apply).
    // keys[k]: { reversed, moved, added, before, after }, before/after = RMS travel (px) from
    // the previous key, around the centres. A path that already matches comes back untouched;
    // one that matches but for a turn keeps its points (kept: true) and has the turn taken out.
    // A start moved off a pinch is chosen on samples; the rebuilt path can still twist a little
    // where they don't look (& into $: crossing itself at 45 % of the morph, between samples).
    // So the final paths of such a step are checked for crossings (4 chords a segment, the 19
    // in-betweens), and if one crosses the fix is done again without the pinch rule.
    function fix(paths, opt) {
        var o2 = {}, key, k, round;
        if (opt) for (key in opt) o2[key] = opt[key];
        o2.noWarp = {};
        // sym on, steps whose symmetric starts all crossed on samples: true = tried with the
        // symmetric start anyway, false = that crossed on the final paths too
        o2.symKeep = {};
        // what a retry can reuse: whether the keys matched, their alignment (same pinch rule),
        // each step's warp (o2.memo, read by fixOnce and warpChain)
        o2.memo = { warps: {} };
        if (opt && opt.progress) {
            var hi = 0;
            o2.progress = function (f) {
                hi = Math.max(hi, f);
                return opt.progress(hi);
            };
        }
        for (round = 0; round < 1 + 3 * paths.length; round++) {
            var r = fixOnce(paths, o2), again = false;
            for (k = 1; k < r.keys.length; k++) {
                var kk = r.keys[k];
                // sym on: the samples said every symmetric start crosses; the final paths decide
                // (an arrow up into an arrow down crossed on samples, never on its final paths)
                if (kk.symRejected && o2.symKeep[k] === undefined) {
                    o2.symKeep[k] = true;
                    again = true;
                    continue;
                }
                if (o2.symKeep[k] === true && !kk.warped && finalCrosses(r.paths[k - 1], r.paths[k])) {
                    o2.symKeep[k] = false;
                    again = true;
                    continue;
                }
                // a warped step whose keys share a mirror axis must keep it as After Effects
                // blends the final paths (checked on samples first, which borderline cases pass)
                if (kk.warped && !kk.mirrored && r.paths[0].closed && !finalKeepsAxes(r.paths[k - 1], r.paths[k])) {
                    o2.noWarp[k] = true;
                    again = true;
                    continue;
                }
                if (!(kk.warped || (kk.unpinched && o2.neck !== false)) || !finalCrosses(r.paths[k - 1], r.paths[k])) continue;
                // a warped step crossing between its samples is spread evenly instead; a start
                // moved off a pinch, kept as it was
                if (kk.warped) o2.noWarp[k] = true;
                else o2.neck = false;
                again = true;
            }
            if (!again) break;
        }
        // a warp the max stops far short of the shapes: its breakpoints take points the outline
        // needs (random keys at max 24: matched as drawn without it, 14 px off with it). Kept
        // if it stays within 10 times the tolerance (at max 100, letters warped come 0.2-0.5 px
        // off, said in the report, for a morph that no longer crosses itself), or about as
        // close as the fix without it (a quarter more at most)
        var warped = false;
        for (k = 1; k < r.keys.length; k++) if (r.keys[k].warped) warped = true;
        if (warped && r.capped && r.deviation > 10 * (opt && opt.tolerance !== undefined ? opt.tolerance : 0.1)) {
            var o3 = {};
            if (opt) for (key in opt) o3[key] = opt[key];
            o3.warp = false;
            var plain = fix(paths, o3), tol = o3.tolerance === undefined ? 0.1 : o3.tolerance;
            if (r.deviation > Math.max(10 * tol, (plain.matched || !plain.capped ? 0 : plain.deviation) * 1.25)) return plain;
        }
        return r;
    }

    // the fraction of A where B starts (B rebuilt from A, maybe from elsewhere round: a warp)
    function startOn(A, B) {
        if (!A.closed) return 0;
        var M = measure(A), best = 0, bd = Infinity;
        for (var j = 0; j < 512; j++) {
            var p = at(A, M, j / 512), d = (p[0] - B.v[0][0]) * (p[0] - B.v[0][0]) + (p[1] - B.v[0][1]) * (p[1] - B.v[0][1]);
            if (d < bd - 1e-9) {
                bd = d;
                best = j / 512;
            }
        }
        return best;
    }

    // do the final paths A -> B keep a mirror axis both share (at 20, 40, 60, 80 %)? True when
    // they share none
    function finalKeepsAxes(A, B) {
        var axes = sharedAxes(samples(A, measure(A)), samples(B, measure(B))), us = [0.2, 0.4, 0.6, 0.8];
        if (!axes.length) return true;
        for (var q = 0; q < us.length; q++) {
            var L = lerp(A, B, us[q]);
            if (!keepsAxis(sized(samples(L, measure(L))), axes)) return false;
        }
        return true;
    }

    // do the in-betweens of the final paths A -> B cross themselves (4 chords a segment, 19)?
    // (4 chords a segment, also on dense paths: 2 saved half a second a step in After Effects
    // and let C into D through, crossing itself)
    function finalCrosses(A, B) {
        var per = 4;
        for (var u = 0; u < XU.length; u++) {
            var L = lerp(A, B, XU[u]), pts = [];
            for (var g = 0; g < segCount(L); g++) {
                var c = seg(L, g);
                for (var t = 0; t < per; t++) pts.push(bez(c, t / per));
            }
            if (selfCrossings(distinct(pts), 1, true)) return true;
        }
        return false;
    }

    // a loop's points without repeats (points a warp keeps together in both keys of a step,
    // while a third key moves, are one point there: their rounding noise isn't a crossing)
    function distinct(pts) {
        var out = [], k;
        for (k = 0; k < pts.length; k++) {
            var p = out.length ? out[out.length - 1] : null;
            if (!p || Math.abs(pts[k][0] - p[0]) > 1e-6 || Math.abs(pts[k][1] - p[1]) > 1e-6) out.push(pts[k]);
        }
        while (out.length > 1 && Math.abs(out[0][0] - out[out.length - 1][0]) <= 1e-6 && Math.abs(out[0][1] - out[out.length - 1][1]) <= 1e-6) out.pop();
        return out;
    }

    function fixOnce(paths, opt) {
        var o = { mode: 'smooth', start: true, direction: true, maxPoints: 100, tolerance: 0.1 }, k;
        if (opt) for (k in opt) o[k] = opt[k];
        if (paths.length < 2) throw new Error('needs two keyframes or more');
        for (k = 0; k < paths.length; k++) {
            if (paths[k].closed !== paths[0].closed) throw new Error('some keyframes are open paths and some closed');
            if (paths[k].v.length < 2) throw new Error('a keyframe has fewer than two points');
        }
        // the reference direction: the first key that has a clear one
        o.sign = 0;
        if (paths[0].closed) for (k = 0; k < paths.length && !o.sign; k++) o.sign = winding(paths[k]);
        // keys drawn as a turn of the previous one (point for point)
        var drawn = [null];
        for (k = 1; k < paths.length; k++) drawn.push(drawnTurn(paths[k - 1], paths[k]));
        var keys = [], res;
        var memo = o.memo || null;
        if (!(memo && memo.unmatched) && matched(paths, o, false, drawn)) {
            res = { paths: [], deviation: 0 };
            for (k = 0; k < paths.length; k++) {
                res.paths.push(copy(paths[k]));
                // drawn as a turn (and left as drawn): the report can suggest turn
                keys.push({ reversed: false, moved: false, added: 0, before: k ? rms(paths[k - 1], paths[k]) : 0, drawn: drawn[k] ? drawn[k].deg : 0, keptDrawn: !!drawn[k] });
                keys[k].after = keys[k].before;
            }
            return { paths: res.paths, keys: keys, matched: true, deviation: 0 };
        }
        // o.progress(fraction 0...1) is called as the work goes; returning true cancels: fix()
        // then throws { cancelled: true } (nothing is written by the math, so nothing changes)
        var tick = o.progress ? function (f) {
            if (o.progress(f)) throw { cancelled: true, message: 'cancelled' };
        } : null;
        // the same points, starts and direction, only turned (a path fixed before with turn on,
        // its in-betweens removed): kept as they are, and the turn taken out again, so fixing
        // twice writes the same keys
        if (memo) memo.unmatched = true;
        var kept = !!(o.rotate && paths[0].closed && !(memo && memo.unkept) && matched(paths, o, true, drawn)), mode = o.mode;
        if (memo && !kept) memo.unkept = true;
        if (kept) {
            res = { paths: [], deviation: 0, capped: false };
            for (k = 0; k < paths.length; k++) {
                res.paths.push(copy(paths[k]));
                var kp = k ? startPlan(paths[k - 1], paths[k], pairOpts(o, drawn[k], 0)) : null;
                keys.push({ reversed: false, moved: false, offset: 0, turn: kp ? kp.turn : false, drawn: kp ? kp.drawn : 0, keptDrawn: kp ? kp.keptDrawn : false });
            }
        } else {
            var keepSig = '', key5;
            for (key5 in (o.symKeep || {})) keepSig += key5 + ':' + o.symKeep[key5] + ';';
            var al = [copy(paths[0])], shift = [0], again = memo && memo.al && memo.neck === o.neck && memo.keep === keepSig;
            keys.push({ reversed: false, moved: false, offset: 0 });
            for (k = 1; k < paths.length; k++) {
                if (again) {
                    al.push(copy(memo.al[k]));
                    var info = {}, key3;
                    for (key3 in memo.infos[k]) info[key3] = memo.infos[k][key3];
                    keys.push(info);
                    continue;
                }
                if (tick) tick(0.3 * k / paths.length);
                // a key drawn as a turn keeps its pairing: its start moves as far as the previous one's did
                // (the warp comes after: its samples sit relative to each key's start, and from the
                // start as drawn a T into an upside-down T came out lopsided, losing its mirror axis)
                var po = pairOpts(o, drawn[k], shift[k - 1]);
                if (o.symKeep && o.symKeep[k] === true) {
                    var pt = {}, key6;
                    for (key6 in po) pt[key6] = po[key6];
                    pt.symTrust = true;
                    po = pt;
                }
                var r = align(al[k - 1], copy(paths[k]), po);
                al.push(r.P);
                keys.push(r.info);
                shift.push(r.info.moved ? r.info.offset : 0);
            }
            if (memo && !again) {
                memo.neck = o.neck;
                memo.keep = keepSig;
                memo.al = [];
                memo.infos = [];
                memo.warps = {};
                for (k = 0; k < al.length; k++) {
                    memo.al.push(copy(al[k]));
                    var copyInfo = {}, key4;
                    for (key4 in keys[k]) copyInfo[key4] = keys[k][key4];
                    memo.infos.push(copyInfo);
                }
            }
            if (mode !== 'exact') {
                // closed outlines paired by what they are (warp), where that is clean
                var T = o.warp === true && paths[0].closed ? warpChain(al, keys, o, tick) : null;
                var dropped = T && T.length - 1 > warpRoom(al, o.maxPoints);
                if (!dropped) {
                    res = rebuild(al, o.maxPoints, o.tolerance, tick, T);
                    dropped = res.failed && T;
                }
                if (dropped) {
                    for (k = 1; k < keys.length; k++) keys[k].warped = false;
                    res = rebuild(al, o.maxPoints, o.tolerance, tick);
                }
                if (res.failed) mode = 'exact';       // loops or cusps the rebuild can't follow
            }
            if (mode === 'exact') res = { paths: unify(al).paths, deviation: 0, capped: false };
        }
        for (k = 0; k < paths.length; k++) {
            keys[k].added = res.paths[k].v.length - paths[k].v.length;
            keys[k].before = k ? rms(paths[k - 1], paths[k]) : 0;
            if (mode === 'exact') keys[k].warped = false;
            keys[k].after = k ? (keys[k].warped ? rmsPaired(res.paths[k - 1], res.paths[k]) : rms(res.paths[k - 1], res.paths[k])) : 0;
            // a warped step pairs its own way: the start chosen against crossing or pinching
            // isn't what keeps it clear, so it isn't reported
            if (keys[k].warped) keys[k].untangled = keys[k].unpinched = false;
        }
        // the turn (o.rotate, closed paths, some pair turned): taken out of the keys, which come
        // back around their centres and unturned ("local"), with the cumulative angle (degrees,
        // clockwise like AE) and centre of each key, from which the swing between keys
        // (pivots, swing) is drawn into the path.
        // placed = the keys where they were: turnPath(local[k], centres[k], angles[k]).
        var turn = null, placed = null;
        if (o.rotate && paths[0].closed) {
            var any = false;
            for (k = 1; k < paths.length; k++) if (keys[k].turn) any = true;
            if (any) {
                var angles = [0], centres = [], local = [];
                for (k = 0; k < paths.length; k++) {
                    var Sk = samples(res.paths[k], measure(res.paths[k]));
                    centres.push([Sk.cx, Sk.cy]);
                    if (k) angles.push(angles[k - 1] + (keys[k].turn ? turnFrom(res.paths[k - 1], res.paths[k]) : 0));
                }
                for (k = 0; k < paths.length; k++) {
                    local.push(turnPath(res.paths[k], centres[k], -angles[k], true));
                    keys[k].angle = angles[k];
                    keys[k].after = k ? rms(local[k - 1], local[k]) : 0;
                }
                turn = pivots(angles, centres, res.paths);
                placed = res.paths;
                res.paths = local;
            }
        }
        return {
            paths: res.paths, keys: keys, matched: false, deviation: res.deviation, capped: !!res.capped,
            mode: mode, fellBack: mode !== o.mode, turn: turn, placed: placed, kept: kept
        };
    }

    // The swing, as the group transform that would show the local keys where they were drawn
    // and turn them the way they were turned; swing() draws it into in-between path keys, so no
    // transform is keyed. A step that turns (2 deg or more) turns about its fixed point q,
    // the one point the step leaves in place ((I - R) q = c1 - R c0): anchor and position hold
    // still through the step (hold keys) while Rotation turns, so the shape swings on an arc.
    // A step that only slides keeps an anchor and moves its position (eased like the path).
    // Shown at key k: position[k] + R(angles[k]) (local[k] - anchor[k]) = the key as drawn.
    // -> { angles, anchor[k], position[k], hold[k] (the step from k turns about a point) }
    function pivots(angles, centres, placedPaths) {
        var K = angles.length, anchor = [], position = [], hold = [], k, size = 0;
        for (k = 0; k < K; k++) {
            var ar = area(placedPaths[k]);
            size = Math.max(size, Math.sqrt(ar < 0 ? -ar : ar));
        }
        var A = [0, 0];
        for (k = K - 2; k >= 0; k--) {
            // the step from key k to key k+1, last to first so a slide can take the next anchor
            var phi = (angles[k + 1] - angles[k]) * Math.PI / 180, q = null;
            if (Math.abs(phi) >= 2 * Math.PI / 180) {
                var c = Math.cos(phi), s = Math.sin(phi), c0 = centres[k], c1 = centres[k + 1];
                var rx = c1[0] - (c0[0] * c - c0[1] * s), ry = c1[1] - (c0[0] * s + c0[1] * c);
                var det = (1 - c) * (1 - c) + s * s;      // |I - R|
                // (I - R)^-1 = [[1 - c, -s], [s, 1 - c]] / det
                q = [((1 - c) * rx - s * ry) / det, (s * rx + (1 - c) * ry) / det];
                var dq = Math.sqrt((q[0] - c0[0]) * (q[0] - c0[0]) + (q[1] - c0[1]) * (q[1] - c0[1]));
                if (dq > 20 * size) q = null;             // nearly a slide: the point is far off
            }
            if (q) {
                // the pivot in key k's local frame: R(-angle k) (q - centre k)
                var a = -angles[k] * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), qx = q[0] - centres[k][0], qy = q[1] - centres[k][1];
                A = [qx * ca - qy * sa, qx * sa + qy * ca];
                anchor[k] = A;
                position[k] = q;
                hold[k] = true;
            } else {
                // a slide: keep the anchor of the step after (so the keys meet), move the position
                anchor[k] = A;
                hold[k] = false;
            }
        }
        // positions for slides, and the last key: centre + R(angle) anchor
        for (k = 0; k < K; k++) {
            if (k === K - 1) {
                anchor[k] = K > 1 ? anchor[k - 1] : [0, 0];
                hold[k] = false;
            }
            if (!hold[k] || k === K - 1) {
                var b = angles[k] * Math.PI / 180, cb = Math.cos(b), sb = Math.sin(b), Ak = anchor[k];
                position[k] = [centres[k][0] + Ak[0] * cb - Ak[1] * sb, centres[k][1] + Ak[0] * sb + Ak[1] * cb];
            }
        }
        return { angles: angles, centres: centres, anchor: anchor, position: position, hold: hold };
    }

    // the angle (degrees, clockwise on screen) that turns A onto B, their starts matching
    function turnFrom(A, B) {
        var SB = samples(B, measure(B)), MA = measure(A), SA = samples(A, MA);
        return errorAt(SB, A, MA, [SA.cx, SA.cy], 0, true).theta * 180 / Math.PI;
    }

    // P turned by deg about the origin and moved by c (local -> placed), or, with toLocal,
    // moved by -c then turned by deg (placed -> local: turnPath(P, c, -angle, true))
    function turnPath(P, c, deg, toLocal) {
        var a = deg * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a), R = { v: [], i: [], o: [], closed: P.closed };
        var rot = function (x, y) { return [x * cs - y * sn, x * sn + y * cs]; };
        for (var k = 0; k < P.v.length; k++) {
            if (toLocal) R.v.push(rot(P.v[k][0] - c[0], P.v[k][1] - c[1]));
            else {
                var q = rot(P.v[k][0], P.v[k][1]);
                R.v.push([q[0] + c[0], q[1] + c[1]]);
            }
            R.i.push(rot(P.i[k][0], P.i[k][1]));
            R.o.push(rot(P.o[k][0], P.o[k][1]));
        }
        return R;
    }

    function dist2(c, t, q) {
        var p = bez(c, t);
        return (p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]);
    }

    // squared distance from q to segment c, by golden-section search around parameter t0
    // (no derivatives: the curve may have cusps where Newton steps stall)
    function refine(c, q, t0, w) {
        var lo = t0 - w, hi = t0 + w, g = 0.6180339887;
        if (lo < 0) lo = 0;
        if (hi > 1) hi = 1;
        var x1 = hi - g * (hi - lo), x2 = lo + g * (hi - lo), f1 = dist2(c, x1, q), f2 = dist2(c, x2, q);
        for (var it = 0; it < 40; it++) {
            if (f1 < f2) {
                hi = x2;
                x2 = x1;
                f2 = f1;
                x1 = hi - g * (hi - lo);
                f1 = dist2(c, x1, q);
            } else {
                lo = x1;
                x1 = x2;
                f1 = f2;
                x2 = lo + g * (hi - lo);
                f2 = dist2(c, x2, q);
            }
        }
        var d = dist2(c, (lo + hi) / 2, q), e = dist2(c, t0, q);
        return d < e ? d : e;
    }

    // the largest distance from a point of B to the outline of A (px): 0 = same shape.
    // Each sample of B is found among dense samples of A, then refined on the three nearest
    // segments (two segments meet at a sharp tip: the nearest sample can sit on the wrong one).
    function deviation(A, B) {
        var S = 128, mA = segCount(A), mB = segCount(B), segsA = [], dense = [], k, j, s, worst = 0;
        for (k = 0; k < mA; k++) {
            segsA.push(seg(A, k));
            var row = [];
            for (j = 0; j <= S; j++) row.push(bez(segsA[k], j / S));
            dense.push(row);
        }
        for (k = 0; k < mB; k++) {
            var cB = seg(B, k);
            for (j = 0; j <= 16; j++) {
                var q = bez(cB, j / 16), cand = [];
                for (s = 0; s < mA; s++) {
                    var bd = -1, bt = 0;
                    for (var i = 0; i <= S; i++) {
                        var p = dense[s][i], d = (p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]);
                        if (bd < 0 || d < bd) {
                            bd = d;
                            bt = i / S;
                        }
                    }
                    cand.push({ s: s, d: bd, t: bt });
                }
                cand.sort(function (a, b) { return (a.d - b.d) || (a.s - b.s); });
                var best = cand[0].d;
                for (s = 0; s < cand.length && s < 3; s++) {
                    var r = refine(segsA[cand[s].s], q, cand[s].t, 1 / S);
                    if (r < best) best = r;
                }
                if (Math.sqrt(best) > worst) worst = Math.sqrt(best);
            }
        }
        return worst;
    }

    // a path at time u (0 ... 1) between two keys with the same number of points, the way
    // After Effects interpolates a Path: every vertex and tangent in a straight line
    function lerp(A, B, u) {
        var R = { v: [], i: [], o: [], closed: A.closed };
        for (var k = 0; k < A.v.length; k++) {
            R.v.push([A.v[k][0] + (B.v[k][0] - A.v[k][0]) * u, A.v[k][1] + (B.v[k][1] - A.v[k][1]) * u]);
            R.i.push([A.i[k][0] + (B.i[k][0] - A.i[k][0]) * u, A.i[k][1] + (B.i[k][1] - A.i[k][1]) * u]);
            R.o.push([A.o[k][0] + (B.o[k][0] - A.o[k][0]) * u, A.o[k][1] + (B.o[k][1] - A.o[k][1]) * u]);
        }
        return R;
    }

    // ---- a turn written into the path itself (shape paths and masks alike) --------------------

    // the shape at progress u (0 ... 1) of the step from key k, exactly as the group transform
    // of pivots() would show it: position + R(angle) (local - anchor), the angle eased with u,
    // the anchor and position held through a step that turns about a point and eased like the
    // path through a slide. Baked one key a frame, it swings on the same arc.
    function swing(T, local, k, u) {
        var L = lerp(local[k], local[k + 1], u), a = T.angles[k] + (T.angles[k + 1] - T.angles[k]) * u;
        var A = T.hold[k] ? T.anchor[k] : mix2(T.anchor[k], T.anchor[k + 1], u);
        var P = T.hold[k] ? T.position[k] : mix2(T.position[k], T.position[k + 1], u);
        var M = { v: [], i: L.i, o: L.o, closed: L.closed };
        for (var j = 0; j < L.v.length; j++) M.v.push([L.v[j][0] - A[0], L.v[j][1] - A[1]]);
        return turnPath(M, P, a);
    }

    function mix2(a, b, u) {
        return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    }

    // how far (0 ... 1) shape V sits between keys A and B (same points): After Effects' own
    // eased progress, read back from the path it shows, least squares over every vertex and
    // tangent. Bakes in-betweens with the timing the keys already had.
    function progressOf(V, A, B) {
        var num = 0, den = 0, j, c, parts = ['v', 'i', 'o'], q;
        for (q = 0; q < 3; q++) {
            var a = A[parts[q]], b = B[parts[q]], v = V[parts[q]];
            for (j = 0; j < a.length; j++) {
                for (c = 0; c < 2; c++) {
                    var d = b[j][c] - a[j][c];
                    num += (v[j][c] - a[j][c]) * d;
                    den += d * d;
                }
            }
        }
        if (den < 1e-12) return 0;
        var u = num / den;
        return u < 0 ? 0 : (u > 1 ? 1 : u);
    }

    // ---- pieces: a letter with holes, a shape in several parts ----

    function pieceInfo(P) {
        var S = samples(P, measure(P)), ar = area(P), xs = [1e9, -1e9, 1e9, -1e9];
        for (var j = 0; j < P.v.length; j++) {
            xs[0] = Math.min(xs[0], P.v[j][0]);
            xs[1] = Math.max(xs[1], P.v[j][0]);
            xs[2] = Math.min(xs[2], P.v[j][1]);
            xs[3] = Math.max(xs[3], P.v[j][1]);
        }
        var diag = Math.sqrt((xs[1] - xs[0]) * (xs[1] - xs[0]) + (xs[3] - xs[2]) * (xs[3] - xs[2]));
        return { c: [S.cx, S.cy], size: Math.sqrt(ar < 0 ? -ar : ar), sign: ar > 0 ? 1 : (ar < 0 ? -1 : 0), box: xs, diag: diag };
    }

    // every order of 0 ... n-1 (n is small: a letter has at most a handful of pieces)
    function orders(n) {
        var out = [], cur = [], used = [];
        function go() {
            if (cur.length === n) {
                out.push(cur.slice(0));
                return;
            }
            for (var i = 0; i < n; i++) {
                if (used[i]) continue;
                used[i] = true;
                cur.push(i);
                go();
                cur.pop();
                used[i] = false;
            }
        }
        go();
        return out;
    }

    // A shape in several pieces: keys[k][p] is the path of piece p (one Path property each) at
    // key k. Each key's pieces are dealt out to the properties so every property morphs between
    // pieces that correspond (outline to outline, a hole to the hole nearest it), keeping the
    // drawn order unless another cuts the cost by 20 % or more. A piece missing at a key (drawn
    // as a dot or collapsed: under 3 % of that key's largest piece) grows from a point: it
    // becomes a tiny copy of the same property's piece at the nearest key that has one, at the
    // dot if the dot sits inside the shape, else at that piece's centre. Closed paths only.
    // -> { keys, moved (pieces dealt to another property), grown (pieces that grow or shrink),
    // roles (roles[k][p]: 1 an outline, -1 a hole, 0 missing at that key; null for open paths) }
    function matchPieces(keys) {
        var K = keys.length, n = keys[0].length, k, p, j;
        for (k = 0; k < K; k++) {
            if (keys[k].length !== n) throw new Error('keys with different numbers of pieces');
            for (p = 0; p < n; p++) if (!keys[k][p].closed) return { keys: keys, moved: 0, grown: 0, roles: null };
        }
        var info = [], out = [];
        for (k = 0; k < K; k++) {
            var row = [], big = 0, sign = 0;
            for (p = 0; p < n; p++) {
                var I = pieceInfo(keys[k][p]);
                row.push(I);
                if (I.size > big) {
                    big = I.size;
                    sign = I.sign;
                }
            }
            for (p = 0; p < n; p++) {
                row[p].absent = row[p].size < 0.03 * big || row[p].diag < 1;
                row[p].hole = !row[p].absent && row[p].sign !== 0 && row[p].sign !== sign;
            }
            info.push(row);
        }
        var all = n <= 7 ? orders(n) : null, order = [], moved = 0;
        for (p = 0; p < n; p++) order.push(p);
        out.push(keys[0].slice(0));
        var prev = info[0];
        for (k = 1; k < K; k++) {
            var cur = info[k], S = 1e-9;
            for (p = 0; p < n; p++) S = Math.max(S, prev[p].size, cur[p].size);
            var cost = function (a, b) {
                if (a.absent && b.absent) return 0;
                if (a.absent || b.absent) return 0.3;
                var dx = (a.c[0] - b.c[0]) / S, dy = (a.c[1] - b.c[1]) / S, ds = (a.size - b.size) / S;
                return dx * dx + dy * dy + ds * ds + (a.hole !== b.hole ? 0.5 : 0);
            };
            var total = function (ord) {
                var t = 0;
                for (var q = 0; q < n; q++) t += cost(prev[q], cur[ord[q]]);
                return t;
            };
            var best = order.slice(0), keep = total(best), bestCost = keep;
            if (all) {
                for (j = 0; j < all.length; j++) {
                    var c = total(all[j]);
                    if (c < bestCost - 1e-12) {
                        bestCost = c;
                        best = all[j];
                    }
                }
            }
            if (bestCost > keep * 0.8) best = order.slice(0);      // not clearly better: keep
            var row2 = [], inf2 = [];
            for (p = 0; p < n; p++) {
                row2.push(keys[k][best[p]]);
                inf2.push(cur[best[p]]);
                if (best[p] !== p) moved++;
            }
            out.push(row2);
            info[k] = inf2;
            prev = inf2;
        }
        // missing pieces grow from (or shrink to) a point
        var grown = 0;
        for (p = 0; p < n; p++) {
            for (k = 0; k < K; k++) {
                if (!info[k][p].absent) continue;
                var src = -1;
                for (var d = 1; d < K && src < 0; d++) {
                    if (k + d < K && !info[k + d][p].absent) src = k + d;
                    else if (k - d >= 0 && !info[k - d][p].absent) src = k - d;
                }
                if (src < 0) continue;
                var R = out[src][p], Ri = info[src][p], at = Ri.c, dot = info[k][p].c, box = null;
                for (j = 0; j < n; j++) {
                    if (info[k][j].absent) continue;
                    var bx = info[k][j].box;
                    box = box ? [Math.min(box[0], bx[0]), Math.max(box[1], bx[1]), Math.min(box[2], bx[2]), Math.max(box[3], bx[3])] : bx.slice(0);
                }
                // the dot where it was drawn: inside the shape's other pieces, or anywhere when
                // the shape has no other piece at that key
                if (!box || (dot[0] >= box[0] && dot[0] <= box[1] && dot[1] >= box[2] && dot[1] <= box[3])) at = dot;
                var s = 0.002, T = { v: [], i: [], o: [], closed: true };
                for (j = 0; j < R.v.length; j++) {
                    T.v.push([at[0] + (R.v[j][0] - Ri.c[0]) * s, at[1] + (R.v[j][1] - Ri.c[1]) * s]);
                    T.i.push([R.i[j][0] * s, R.i[j][1] * s]);
                    T.o.push([R.o[j][0] * s, R.o[j][1] * s]);
                }
                out[k][p] = T;
                grown++;
            }
        }
        var roles = [];
        for (k = 0; k < K; k++) {
            roles.push([]);
            for (p = 0; p < n; p++) roles[k].push(info[k][p].absent ? 0 : (info[k][p].hole ? -1 : 1));
        }
        return { keys: out, moved: moved, grown: grown, roles: roles };
    }

    // ---- holes kept inside their letter ----
    //
    // A hole is its own path, drawn the other way round: where the outline no longer surrounds
    // it, After Effects' non-zero fill paints it, a dark blob. Blending a hole point by point
    // does that when it closes while its letter opens (O into C), opens while it closes (C into
    // e), or stays a hole but strays across the letter (b into e). And a hole that only just
    // stays inside reads as one about to break out. So a hole keeps a good margin (HOLE_MU: at
    // least half the clearance it has at its keys) or it doesn't morph at all: it shrinks to
    // nothing over the first HOLE_SWAP of the outline's progress, then, after a short pause
    // while the letter changes most, grows into its new shape where that one sits over the
    // last HOLE_SWAP. A hole that closes for good only shrinks, staggered ahead of the letter
    // (gone by HOLE_CLOSE: the O's hole before it turns into a C); one that opens only grows,
    // once the letter is all but done (from HOLE_OPEN). It shrinks to and grows from its pole
    // (the point farthest inside it) and rides along with the outline's centre; a window is
    // shortened only as far as the margin needs.
    // fixed[p][k]: piece p's fixed path at key k (the same points in every key); roles from
    // matchPieces; skip[k] true leaves step k alone. -> [{ piece, step, kind ('close', 'open'
    // or 'swap'), a (gone by), b (grows from), pa, pb (poles), dco (the outline's centre moves
    // by it over the step), ca, cb (its clearance at the keys) }], only for holes that don't
    // keep their margin when blended. MF.holeAt gives the hole at any u as planned; the panel
    // writes it as a key or two (MF.holeKeyed: the same, timed by eased keys).
    var HOLE_MU = 0.5, HOLE_CLOSE = 0.3, HOLE_OPEN = 0.7, HOLE_SWAP = 0.4;

    // The geometry below runs many times a fix: in ExtendScript, made objects cost far more than
    // arithmetic (round 14: path and point objects made B into 8 take 22 s instead of 2), so it
    // works on flat arrays of numbers.

    // the outline of the path at u between A and B (same points), per chords a segment, scaled
    // by s about (cx, cy): appended to xs, ys
    function poly(A, B, u, per, s, cx, cy, xs, ys) {
        var n = A.v.length, k, t;
        for (k = 0; k < n; k++) {
            var k1 = (k + 1) % n, Av = A.v[k], Bv = B.v[k], Aw = A.v[k1], Bw = B.v[k1];
            var ax = Av[0] + (Bv[0] - Av[0]) * u, ay = Av[1] + (Bv[1] - Av[1]) * u;
            var dx = Aw[0] + (Bw[0] - Aw[0]) * u, dy = Aw[1] + (Bw[1] - Aw[1]) * u;
            var bx = ax + A.o[k][0] + (B.o[k][0] - A.o[k][0]) * u, by = ay + A.o[k][1] + (B.o[k][1] - A.o[k][1]) * u;
            var ex = dx + A.i[k1][0] + (B.i[k1][0] - A.i[k1][0]) * u, ey = dy + A.i[k1][1] + (B.i[k1][1] - A.i[k1][1]) * u;
            for (t = 0; t < per; t++) {
                var q = t / per, r = 1 - q, w0 = r * r * r, w1 = 3 * r * r * q, w2 = 3 * r * q * q, w3 = q * q * q;
                xs.push(cx + (w0 * ax + w1 * bx + w2 * ex + w3 * dx - cx) * s);
                ys.push(cy + (w0 * ay + w1 * by + w2 * ey + w3 * dy - cy) * s);
            }
        }
    }

    // the outlines O0[q] morphing into O1[q], at u: their edges (4 chords a segment) filed in
    // bands by height, for many point-inside tests
    function region(O0, O1, u) {
        var X = [], Y = [], NX = [], q, j, b;
        for (q = 0; q < O0.length; q++) {
            var s0 = X.length;
            poly(O0[q], O1[q], u, 4, 1, 0, 0, X, Y);
            for (j = s0; j < X.length; j++) NX.push(j + 1 < X.length ? j + 1 : s0);
        }
        var y0 = 1e9, y1 = -1e9;
        for (j = 0; j < Y.length; j++) {
            if (Y[j] < y0) y0 = Y[j];
            if (Y[j] > y1) y1 = Y[j];
        }
        var NB = 32, h = (y1 - y0) / NB || 1, bands = [];
        for (b = 0; b < NB; b++) bands.push([]);
        for (j = 0; j < X.length; j++) {
            var ya = Y[j], yb = Y[NX[j]], lo = Math.floor(((ya < yb ? ya : yb) - y0) / h), hi = Math.floor(((ya < yb ? yb : ya) - y0) / h);
            if (lo < 0) lo = 0;
            if (hi > NB - 1) hi = NB - 1;
            for (b = lo; b <= hi; b++) bands[b].push(j);
        }
        return { X: X, Y: Y, NX: NX, y0: y0, h: h, NB: NB, bands: bands };
    }

    // non-zero winding: inside the region's outlines
    function inRegion(R, x, y) {
        var b = Math.floor((y - R.y0) / R.h);
        if (b < 0 || b >= R.NB) return false;
        var L = R.bands[b], X = R.X, Y = R.Y, NX = R.NX, w = 0;
        for (var m = 0; m < L.length; m++) {
            var j = L[m], k = NX[j], ya = Y[j], yb = Y[k];
            if ((ya <= y) !== (yb <= y) && X[j] + (y - ya) / (yb - ya) * (X[k] - X[j]) < x) w += yb > ya ? 1 : -1;
        }
        return w !== 0;
    }

    // the points (X, Y) scaled by s about (cx, cy), moved by (tx, ty), all inside region R, each
    // pushed pad px further from the centre first
    function holeIn(X, Y, R, s, cx, cy, pad, tx, ty) {
        var ox = cx + (tx || 0), oy = cy + (ty || 0);
        for (var j = 0; j < X.length; j++) {
            var dx = X[j] - cx, dy = Y[j] - cy, d = Math.sqrt(dx * dx + dy * dy) || 1, f = s + pad / d;
            if (!inRegion(R, ox + dx * f, oy + dy * f)) return false;
        }
        return true;
    }

    // a path's vertex box diagonal; the mean of its vertices (at u between A and B)
    function diagOf(P) {
        var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        for (var j = 0; j < P.v.length; j++) {
            x0 = Math.min(x0, P.v[j][0]);
            x1 = Math.max(x1, P.v[j][0]);
            y0 = Math.min(y0, P.v[j][1]);
            y1 = Math.max(y1, P.v[j][1]);
        }
        return Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
    }
    function centreAt(A, B, u) {
        var c = [0, 0], n = A.v.length;
        for (var j = 0; j < n; j++) {
            c[0] += (A.v[j][0] + (B.v[j][0] - A.v[j][0]) * u) / n;
            c[1] += (A.v[j][1] + (B.v[j][1] - A.v[j][1]) * u) / n;
        }
        return c;
    }
    function centre(P) {
        return centreAt(P, P, 0);
    }

    // P scaled by s about c (handles too), then moved by (tx, ty)
    function scaled(P, s, c, tx, ty) {
        var R = { v: [], i: [], o: [], closed: P.closed };
        tx = tx || 0;
        ty = ty || 0;
        for (var j = 0; j < P.v.length; j++) {
            R.v.push([c[0] + tx + (P.v[j][0] - c[0]) * s, c[1] + ty + (P.v[j][1] - c[1]) * s]);
            R.i.push([P.i[j][0] * s, P.i[j][1] * s]);
            R.o.push([P.o[j][0] * s, P.o[j][1] * s]);
        }
        return R;
    }

    // the pole of a closed path: the point inside it farthest from its outline (where a hole
    // closes to and opens from), on a 10 x 10 grid, then twice on finer ones around the best
    function pole(P) {
        var X = [], Y = [], j, i;
        poly(P, P, 0, 3, 1, 0, 0, X, Y);
        var R = region([P], [P], 0), x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        for (j = 0; j < X.length; j++) {
            x0 = Math.min(x0, X[j]);
            x1 = Math.max(x1, X[j]);
            y0 = Math.min(y0, Y[j]);
            y1 = Math.max(y1, Y[j]);
        }
        // the distance from (x, y) to the outline, 0 outside it
        function depth(x, y) {
            if (!inRegion(R, x, y)) return 0;
            var m = 1e18;
            for (var e = 0; e < X.length; e++) {
                var e1 = (e + 1) % X.length, ax = X[e], ay = Y[e], bx = X[e1] - ax, by = Y[e1] - ay, L = bx * bx + by * by;
                var t = L > 0 ? ((x - ax) * bx + (y - ay) * by) / L : 0;
                t = t < 0 ? 0 : (t > 1 ? 1 : t);
                var qx = ax + bx * t - x, qy = ay + by * t - y, d2 = qx * qx + qy * qy;
                if (d2 < m) m = d2;
            }
            return Math.sqrt(m);
        }
        var best = [(x0 + x1) / 2, (y0 + y1) / 2], bd = depth(best[0], best[1]), sx = (x1 - x0) / 10, sy = (y1 - y0) / 10;
        for (j = 0; j < 10; j++) {
            for (i = 0; i < 10; i++) {
                var gx = x0 + (i + 0.5) * sx, gy = y0 + (j + 0.5) * sy, gd = depth(gx, gy);
                if (gd > bd) {
                    bd = gd;
                    best = [gx, gy];
                }
            }
        }
        for (var round = 0; round < 2; round++) {
            sx /= 3;
            sy /= 3;
            var c0 = best;
            for (j = -2; j <= 2; j++) {
                for (i = -2; i <= 2; i++) {
                    var hx = c0[0] + i * sx, hy = c0[1] + j * sy, hd = depth(hx, hy);
                    if (hd > bd) {
                        bd = hd;
                        best = [hx, hy];
                    }
                }
            }
        }
        return best;
    }

    // a path with every point at c: a hole closed to nothing (After Effects draws no area)
    function closedAt(P, c) {
        var R = { v: [], i: [], o: [], closed: P.closed };
        for (var j = 0; j < P.v.length; j++) {
            R.v.push([c[0], c[1]]);
            R.i.push([0, 0]);
            R.o.push([0, 0]);
        }
        return R;
    }

    function smooth(x) {
        x = x < 0 ? 0 : (x > 1 ? 1 : x);
        return x * x * (3 - 2 * x);
    }

    // a hole at a key, against the outlines there: its points, pole, size and clearance (the
    // largest pad from its pole that still fits inside: about the thickness of ink round it)
    function holeAtKey(H, O) {
        var X = [], Y = [];
        poly(H, H, 0, 2, 1, 0, 0, X, Y);
        var p = pole(H), span = diagOf(H), R = region(O, O, 0), lo = 0, hi = span;
        if (!holeIn(X, Y, R, 1, p[0], p[1], 0)) return { X: X, Y: Y, p: p, span: span, clear: 0 };
        for (var it = 0; it < 8; it++) {
            var m = (lo + hi) / 2;
            if (holeIn(X, Y, R, 1, p[0], p[1], m)) lo = m;
            else hi = m;
        }
        return { X: X, Y: Y, p: p, span: span, clear: lo };
    }

    // The longest window (up to pref of the outline's progress) over which hole K (at its key,
    // from O0's side) can shrink to nothing about its pole, riding with the outline's centre
    // (dco over the whole step), and stay inside the outlines morphing from O0 to O1 with pad
    // to spare. Checked at 10 steps of the window, then twice as finely.
    function shrinkWindow(K, O0, O1, dco, pad, pref) {
        function fits(a, n) {
            for (var j = 1; j <= n; j++) {
                var u = a * j / n, s = 1 - smooth(j / n);
                if (K.span * s < 1) continue;
                if (!holeIn(K.X, K.Y, region(O0, O1, u), s, K.p[0], K.p[1], pad, dco[0] * u, dco[1] * u)) return false;
            }
            return true;
        }
        var a = pref;
        if (!fits(a, 10)) {
            var lo = 0, hi = pref;
            for (var it = 0; it < 6; it++) {
                var m = (lo + hi) / 2;
                if (fits(m, 10)) lo = m;
                else hi = m;
            }
            a = lo;
        }
        for (var k = 0; k < 6 && a > 0.02 && !fits(a, 20); k++) a *= 0.85;
        return Math.max(a, 0.02);
    }

    function holeTiming(fixed, roles, skip) {
        var out = [], n = fixed.length, p, q, k, cache = {};
        if (!roles || !n) return out;
        for (k = 0; k + 1 < roles.length; k++) {
            if (skip && skip[k]) continue;      // steps left alone (the panel's turning ones)
            for (p = 0; p < n; p++) {
                var a = roles[k][p], b = roles[k + 1][p];
                if (!((a === -1 && b === 0) || (a === 0 && b === -1) || (a === -1 && b === -1))) continue;
                var O0 = [], O1 = [];
                for (q = 0; q < n; q++) {
                    if (q === p || roles[k][q] === -1 || roles[k + 1][q] === -1 || (!roles[k][q] && !roles[k + 1][q])) continue;
                    O0.push(fixed[q][k]);
                    O1.push(fixed[q][k + 1]);
                }
                if (!O0.length) continue;
                var A = fixed[p][k], B = fixed[p][k + 1], c0 = [0, 0], c1 = [0, 0], cnt = 0, j;
                // the outlines' centre (their points' mean: it moves in a straight line too)
                for (q = 0; q < O0.length; q++) {
                    for (j = 0; j < O0[q].v.length; j++) {
                        c0[0] += O0[q].v[j][0];
                        c0[1] += O0[q].v[j][1];
                        c1[0] += O1[q].v[j][0];
                        c1[1] += O1[q].v[j][1];
                        cnt++;
                    }
                }
                var dco = [(c1[0] - c0[0]) / cnt, (c1[1] - c0[1]) / cnt], back = [-dco[0], -dco[1]];
                var KA = a === -1 ? (cache[p + ':' + k] || (cache[p + ':' + k] = holeAtKey(A, O0))) : null;
                var KB = b === -1 ? (cache[p + ':' + (k + 1)] || (cache[p + ':' + (k + 1)] = holeAtKey(B, O1))) : null;
                if ((KA && !KA.clear) || (KB && !KB.clear)) continue;      // drawn outside its outline: left alone
                if (KA && KB && blendKeeps(A, B, O0, O1, KA, KB)) continue;
                var e = { piece: p, step: k, kind: KA && KB ? 'swap' : (KA ? 'close' : 'open'), a: 0, b: 1, dco: dco, ca: KA ? KA.clear : 0, cb: KB ? KB.clear : 0 };
                if (KA) {
                    e.pa = KA.p;
                    e.a = shrinkWindow(KA, O0, O1, dco, Math.max(1, HOLE_MU * KA.clear), KB ? HOLE_SWAP : HOLE_CLOSE);
                }
                if (KB) {
                    // growing is shrinking played backwards
                    e.pb = KB.p;
                    e.b = 1 - shrinkWindow(KB, O1, O0, back, Math.max(1, HOLE_MU * KB.clear), KA ? HOLE_SWAP : 1 - HOLE_OPEN);
                }
                out.push(e);
            }
        }
        return out;
    }

    // blended point by point, the hole keeps at least HOLE_MU of its keys' clearance (from its
    // pole, moving in a straight line between theirs) at 15 in-betweens
    function blendKeeps(A, B, O0, O1, KA, KB) {
        for (var j = 1; j < 16; j++) {
            var u = j / 16, X = [], Y = [], px = KA.p[0] + (KB.p[0] - KA.p[0]) * u, py = KA.p[1] + (KB.p[1] - KA.p[1]) * u;
            poly(A, B, u, 2, 1, 0, 0, X, Y);
            var pad = Math.max(1, HOLE_MU * (KA.clear + (KB.clear - KA.clear) * u));
            if (!holeIn(X, Y, region(O0, O1, u), 1, px, py, pad)) return false;
        }
        return true;
    }

    // the hole at outline progress u: shrinking (u < a), closed (a to b), growing (u > b)
    function holeAt(t, A, B, u) {
        if (u <= 0) return A;
        if (u >= 1) return B;
        if (u < t.a) return scaled(A, 1 - smooth(u / t.a), t.pa, t.dco[0] * u, t.dco[1] * u);
        if (u > t.b) return scaled(B, smooth((u - t.b) / (1 - t.b)), t.pb, t.dco[0] * (u - 1), t.dco[1] * (u - 1));
        var side = t.kind === 'close' || (t.kind === 'swap' && u < (t.a + t.b) / 2);
        return side ? closedAt(A, [t.pa[0] + t.dco[0] * u, t.pa[1] + t.dco[1] * u]) : closedAt(B, [t.pb[0] + t.dco[0] * (u - 1), t.pb[1] + t.dco[1] * (u - 1)]);
    }

    // where a timed hole is at u: 'shrink', 'gone' or 'grow'
    function holePhase(t, u) {
        return u < t.a ? 'shrink' : (u > t.b ? 'grow' : 'gone');
    }

    // the hole closed to nothing at outline progress u, on A's side (where it shrank to) or B's
    // (where it will grow from): the value of the key the panel writes there
    function holeGone(t, P, u, side) {
        return side === 'a' ? closedAt(P, [t.pa[0] + t.dco[0] * u, t.pa[1] + t.dco[1] * u]) : closedAt(P, [t.pb[0] + t.dco[0] * (u - 1), t.pb[1] + t.dco[1] * (u - 1)]);
    }

    // the hole as the panel writes it, at a share tau of the step's time: a key of nothing where
    // the outline's progress reaches a (gone) and one where it reaches b (grows from), the hole
    // blended into and out of them, each segment eased by ease (the drawn keys' timing, mapping
    // the share of time to progress: Easy Ease in After Effects). Blending a shape with a key of
    // nothing scales it, so only the timing differs from MF.holeAt. For the preview and tests.
    function holeKeyed(t, A, B, tau, ease) {
        if (tau <= 0) return A;
        if (tau >= 1) return B;
        function inv(y) {
            var lo = 0, hi = 1;
            for (var i = 0; i < 40; i++) {
                var m = (lo + hi) / 2;
                if (ease(m) < y) lo = m;
                else hi = m;
            }
            return (lo + hi) / 2;
        }
        var ta = t.kind === 'open' ? 0 : inv(t.a), tb = t.kind === 'close' ? 1 : inv(t.b);
        var gA = t.kind === 'open' ? null : holeGone(t, A, t.a, 'a'), gB = t.kind === 'close' ? null : holeGone(t, B, t.b, 'b');
        if (gA && tau < ta) return lerp(A, gA, ease(tau / ta));
        if (gB && tau > tb) return lerp(gB, B, ease((tau - tb) / (1 - tb)));
        if (!gB) return gA;
        if (!gA) return gB;
        return tb > ta ? lerp(gA, gB, (tau - ta) / (tb - ta)) : gB;
    }

    // a path closed to a point (every point at one place, no handles): a hole key of nothing
    function isClosed(P) {
        for (var j = 0; j < P.v.length; j++) {
            if (Math.abs(P.v[j][0] - P.v[0][0]) > 1e-6 || Math.abs(P.v[j][1] - P.v[0][1]) > 1e-6) return false;
            if (P.i[j][0] || P.i[j][1] || P.o[j][0] || P.o[j][1]) return false;
        }
        return P.v.length > 0;
    }

    // hole H (as After Effects shows it at a frame) inside the outlines with the margin the plan
    // keeps (HOLE_MU of clear, its clearance at its key), pushed out from its centre; a hole under
    // a pixel across is gone
    function holeKeeps(H, outlines, clear) {
        if (diagOf(H) < 1) return true;
        var X = [], Y = [], c = centre(H);
        poly(H, H, 0, 2, 1, 0, 0, X, Y);
        return holeIn(X, Y, region(outlines, outlines, 0), 1, c[0], c[1], Math.max(1, HOLE_MU * clear));
    }

    // the share of hole H's outline (sampled) lying outside the outlines: what AE's fill would
    // paint. 0 for a hole under a pixel across (tests: Node, and AE's own frames)
    function holeOutside(H, outlines) {
        if (diagOf(H) < 1) return 0;
        var R = region(outlines, outlines, 0), X = [], Y = [], out = 0;
        poly(H, H, 0, 3, 1, 0, 0, X, Y);
        for (var j = 0; j < X.length; j++) if (!inRegion(R, X[j], Y[j])) out++;
        return X.length ? out / X.length : 0;
    }

    return {
        fix: fix, align: align, unify: unify, rebuild: rebuild, corners: corners, insert: insert, reverse: reverse, rotate: rotate,
        measure: measure, at: at, fractions: fractions, area: area, winding: winding, rms: rms, deviation: deviation,
        lerp: lerp, copy: copy, seg: seg, segCount: segCount, bez: bez, turnPath: turnPath, turnFrom: turnFrom,
        swing: swing, progressOf: progressOf, matchPieces: matchPieces, pieceInfo: pieceInfo,
        holeTiming: holeTiming, holePhase: holePhase, holeAt: holeAt, holeOutside: holeOutside, holeGone: holeGone,
        holeKeyed: holeKeyed, holeKeeps: holeKeeps, isClosed: isClosed, turnBetween: turnBetween,
        warpStep: warpStep, warpPrice: warpPrice, vertexPairs: vertexPairs, rmsPaired: rmsPaired,
        // a closed path's mirror axes: 'round' or [{ phi (radians), pole (fraction), e }] (tests)
        mirrorAxes: function (P, thorough) { return mirrorAxes(samples(P, measure(P), thorough ? 2 * N : N), thorough); },
        // how far two paths part (px), quick two-way check (what the rebuild holds to its tolerance)
        gap: function (A, B) { return strays(A, measure(A), B, false, startOn(A, B)); }
    };
})();
