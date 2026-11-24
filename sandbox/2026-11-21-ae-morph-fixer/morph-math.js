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
    // more lobes for a few frames (real type: a into e, M into W). Among starts that travel
    // about as little as the best one (CROSS_SLACK more squared distance at most), the fix takes
    // one whose in-betweens don't cross. Checked on 64 points of each outline (every other
    // sample) at 19 in-betweens: a crossover can last under a tenth of the morph (a into e:
    // around u = 0.45 only), and nine checks missed it.
    var XU = [];
    for (var xu = 1; xu < 20; xu++) XU.push(xu / 20);
    var CROSS_SLACK = 1.2, CROSS_TRIES = 12;

    // do segments ab and pq cross (strictly)?
    function crosses(a, b, p, q) {
        var d1 = (q[0] - p[0]) * (a[1] - p[1]) - (q[1] - p[1]) * (a[0] - p[0]);
        var d2 = (q[0] - p[0]) * (b[1] - p[1]) - (q[1] - p[1]) * (b[0] - p[0]);
        var d3 = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
        var d4 = (b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]);
        return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
    }

    // how many times the closed outline through pts crosses itself (up to `limit`): edges
    // sorted by their left end, so only edges that overlap in x are compared
    function selfCrossings(pts, limit) {
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
                if (crosses(e.a, e.b, f.a, f.b) && ++c >= limit) return c;
            }
        }
        return c;
    }

    // 64 points of b's outline read from grid offset q, around its centre, turned by theta (the
    // turn laying it onto a), next to a's 64 around its centre: { a, b }
    function pairPoints(b, q, theta) {
        var A = b.SA, B = b.SB, ca = Math.cos(theta || 0), sa = Math.sin(theta || 0), pa = [], pb = [];
        for (var j = 0; j < N; j += 2) {
            var p = A.pts[j], r = B.pts[(j + q) % N], x = r[0] - B.cx, y = r[1] - B.cy;
            pa.push([p[0] - A.cx, p[1] - A.cy]);
            pb.push([x * ca - y * sa, x * sa + y * ca]);
        }
        return { a: pa, b: pb };
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

    // the start plan's grid offset q crosses over: try the grid offsets that cost at most
    // CROSS_SLACK times the best match, the current start (0) first and then the cheapest, and
    // take the first that doesn't cross and whose grid neighbours don't either (a start on the
    // edge of a crossing-free run still crossed between the checked in-betweens); else the
    // first that doesn't cross, else the one that crosses least. stay: only the current start
    // is tried (whether a path is already fixed: a start that keeps it from crossing over
    // counts as fine, so a second run doesn't chase sampling noise). Keys that cross themselves
    // are left as drawn. -> { q, crossings, was (the crossings at q) }
    function untangle(b, q, stay) {
        function clear(k) {
            return crossover(pairPoints(b, k, b.turn ? b.thetas[k] : 0), 1) === 0;
        }
        var pp = pairPoints(b, q, b.turn ? b.thetas[q] : 0), was = crossover(pp, 1000);
        if (!was) return { q: q, crossings: 0, was: 0 };
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
                // staying put wins a tie (the count is sampled: a little noisy)
                if (c <= bestC) {
                    bestC = c;
                    bestQ = ck;
                }
                continue;
            }
            if (c === 0) {
                if (clear((ck + 1) % N) && clear((ck + N - 1) % N)) return { q: ck, crossings: 0, was: was };
                if (edge < 0) edge = ck;
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
        for (j = 0; j < pairs.length; j++) {
            var p = pairs[j], rx = p[0] * cs - p[1] * sn - p[2], ry = p[0] * sn + p[1] * cs - p[3];
            e += rx * rx + ry * ry;
        }
        var size = Math.sqrt(aa / pairs.length);
        if (Math.sqrt(e / pairs.length) > Math.max(0.5, 0.002 * size)) return null;
        var deg = th * 180 / Math.PI;
        return Math.abs(deg) < 1 ? null : { deg: deg };
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
        var b = chooseOffset(prev, P, o), off = 0, theta = 0, symmetric = false;
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
            } else if (ss.length) {
                // the current start when it is symmetric and the cheapest symmetric one isn't 5 % cheaper
                var pick = stay && !(ss[0].e < stay.e * GAIN) ? stay : ss[0];
                if (pick.e <= cap) {
                    off = pick === stay ? 0 : pick.off;
                    symmetric = true;
                }
            }
        }
        var q0 = Math.round(off * N) % N, x = { q: q0, crossings: 0, was: 0 };
        if (o.crossover !== false) x = untangle(b, q0, !!o.stay);
        var untangled = x.q !== q0;
        if (untangled) {
            off = x.q / N;
            theta = b.turn ? b.thetas[x.q] : 0;
            symmetric = false;
        }
        if (!off) return { off: 0, near: 0, nd: 0, turn: b.turn, theta: theta, crossings: x.crossings, untangled: untangled, symmetric: symmetric };
        var nv = nearestVertex(P, off);
        return { off: off, near: nv.k, nd: nv.d, turn: b.turn, theta: theta, crossings: x.crossings, untangled: untangled, symmetric: symmetric };
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
                info.untangled = plan.untangled;      // a start chosen so the in-betweens don't cross
                info.crossings = plan.crossings;      // what they still cross (sampled), 0 mostly
                info.symmetric = plan.symmetric;      // a start chosen so the morph stays mirror-symmetric
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
                for (c = 0; c < cs.length; c++) if (Math.abs(cs[c].f - f) <= 1e-9 && !hit) hit = cs[c];
            }
            if (hit) {
                pts.push({ p: [P.v[hit.k][0], P.v[hit.k][1]], f: hit.f, din: hit.din, dout: hit.dout });
            } else {
                var L = locate(M, wrap(P, f) * M.total), sg = seg(P, L.k), d = dirAt(sg, L.t);
                pts.push({ p: bez(sg, L.t), f: f, din: d, dout: d });
            }
        }
        var R = { v: [], i: [], o: [], closed: P.closed };
        for (j = 0; j < n; j++) {
            var prev = j > 0 ? pts[j - 1].f : (P.closed ? pts[n - 1].f - 1 : null);
            var next = j < n - 1 ? pts[j + 1].f : (P.closed ? pts[0].f + 1 : null);
            var li = prev === null ? 0 : (pts[j].f - prev) * M.total / 3, lo = next === null ? 0 : (next - pts[j].f) * M.total / 3;
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
    function strays(A, MA, B, dense) {
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
                    var f = (MX.start[j] + MX.cum[j][q]) / MX.total;     // the sample's own arc fraction
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
    function rebuild(paths, maxPoints, tol, tick) {
        var Ms = [], p, most = 0;
        for (p = 0; p < paths.length; p++) {
            Ms.push(measure(paths[p]));
            if (paths[p].v.length > most) most = paths[p].v.length;
        }
        var cap = Math.max(4, Math.round(maxPoints || 100));
        // start small (4 per drawn point, 16 to 64) and add points only as the tolerance needs
        var N = Math.min(cap, Math.min(64, Math.max(16, 4 * most))), out, worst;
        for (var round = 0; round < 8; round++) {
            var F = layout(paths, Ms, N);
            out = [];
            worst = 0;
            for (p = 0; p < paths.length; p++) {
                if (tick) tick(0.3 + 0.6 * (round + p / paths.length) / 8);
                out.push(resample(paths[p], Ms[p], F));
                worst = Math.max(worst, strays(paths[p], Ms[p], out[p]));
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
            for (p = 0; p < paths.length; p++) worst = Math.max(worst, strays(paths[p], Ms[p], out[p], true));
        }
        return { paths: out, deviation: worst, failed: worst >= 1e9, capped: capped };
    }

    // nothing to do: same points, same direction, and no start would move; with turns, a step
    // that turns still counts (the keys of a path fixed before, its in-betweens removed)
    function matched(paths, o, turns, drawn) {
        // the decision align() takes, but a start that keeps the morph from crossing over counts
        // as fine without looking for another (untangle's stay)
        var so = { stay: true }, key;
        for (key in o) if (key !== 'stay') so[key] = o[key];
        for (var k = 1; k < paths.length; k++) {
            if (paths[k].v.length !== paths[0].v.length) return false;
            if (paths[0].closed) {
                if (o.direction && o.sign) {
                    var w = winding(paths[k]);
                    if (w && w !== o.sign) return false;
                }
                if (o.start) {
                    var plan = startPlan(paths[k - 1], paths[k], pairOpts(so, drawn && drawn[k], 0));
                    if (plan.nd > SNAP || plan.near > 0) return false;
                    if (plan.turn && !turns) return false;      // a turn to take out of the path
                }
            } else if (o.direction && rms(paths[k - 1], reverse(paths[k])) < rms(paths[k - 1], paths[k]) * GAIN) {
                return false;
            }
        }
        return true;
    }

    // fix(paths, { mode, maxPoints, tolerance, start, direction }) -> { paths, keys, matched,
    // mode, fellBack, deviation, capped }. mode 'smooth' (default) rebuilds the points for
    // kink-free in-betweens, at most maxPoints (100) per key, each key within `tolerance` px
    // (0.1) unless the cap stops it first (capped: true, deviation = how far it got); 'exact'
    // keeps every point as drawn and only adds points by splitting (the cap doesn't apply).
    // keys[k]: { reversed, moved, added, before, after }, before/after = RMS travel (px) from
    // the previous key, around the centres. A path that already matches comes back untouched;
    // one that matches but for a turn keeps its points (kept: true) and has the turn taken out.
    function fix(paths, opt) {
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
        if (matched(paths, o, false, drawn)) {
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
        var kept = !!(o.rotate && paths[0].closed && matched(paths, o, true, drawn)), mode = o.mode;
        if (kept) {
            res = { paths: [], deviation: 0, capped: false };
            for (k = 0; k < paths.length; k++) {
                res.paths.push(copy(paths[k]));
                var kp = k ? startPlan(paths[k - 1], paths[k], pairOpts(o, drawn[k], 0)) : null;
                keys.push({ reversed: false, moved: false, offset: 0, turn: kp ? kp.turn : false, drawn: kp ? kp.drawn : 0, keptDrawn: kp ? kp.keptDrawn : false });
            }
        } else {
            var al = [copy(paths[0])], shift = [0];
            keys.push({ reversed: false, moved: false, offset: 0 });
            for (k = 1; k < paths.length; k++) {
                if (tick) tick(0.3 * k / paths.length);
                // a key drawn as a turn keeps its pairing: its start moves as far as the previous one's did
                var r = align(al[k - 1], copy(paths[k]), pairOpts(o, drawn[k], shift[k - 1]));
                al.push(r.P);
                keys.push(r.info);
                shift.push(r.info.moved ? r.info.offset : 0);
            }
            if (mode !== 'exact') {
                res = rebuild(al, o.maxPoints, o.tolerance, tick);
                if (res.failed) mode = 'exact';       // loops or cusps the rebuild can't follow
            }
            if (mode === 'exact') res = { paths: unify(al).paths, deviation: 0, capped: false };
        }
        for (k = 0; k < paths.length; k++) {
            keys[k].added = res.paths[k].v.length - paths[k].v.length;
            keys[k].before = k ? rms(paths[k - 1], paths[k]) : 0;
            keys[k].after = k ? rms(res.paths[k - 1], res.paths[k]) : 0;
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
    // -> { keys, moved (pieces dealt to another property), grown (pieces that grow or shrink) }
    function matchPieces(keys) {
        var K = keys.length, n = keys[0].length, k, p, j;
        for (k = 0; k < K; k++) {
            if (keys[k].length !== n) throw new Error('keys with different numbers of pieces');
            for (p = 0; p < n; p++) if (!keys[k][p].closed) return { keys: keys, moved: 0, grown: 0 };
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
        return { keys: out, moved: moved, grown: grown };
    }

    return {
        fix: fix, align: align, unify: unify, rebuild: rebuild, corners: corners, insert: insert, reverse: reverse, rotate: rotate,
        measure: measure, at: at, fractions: fractions, area: area, winding: winding, rms: rms, deviation: deviation,
        lerp: lerp, copy: copy, seg: seg, segCount: segCount, bez: bez, turnPath: turnPath, turnFrom: turnFrom,
        swing: swing, progressOf: progressOf, matchPieces: matchPieces, pieceInfo: pieceInfo,
        // a closed path's mirror axes: 'round' or [{ phi (radians), pole (fraction), e }] (tests)
        mirrorAxes: function (P, thorough) { return mirrorAxes(samples(P, measure(P), thorough ? 2 * N : N), thorough); },
        // how far two paths part (px), quick two-way check (what the rebuild holds to its tolerance)
        gap: function (A, B) { return strays(A, measure(A), B); }
    };
})();
