// drawon-time.js - when each stroke draws, the part of the rig that runs every frame. Plain ES3
// and ASCII: build.mjs pastes it (without comments) into the Start and End expressions of every
// Trim Paths the rig drives, and into the two computed sliders on the controls null; test.mjs
// and scene.js load it as it is.
//
// A stroke is { len, rank: [order], before: [order], flip: [order], own, map }:
//   len     its length in comp pixels (drawon-geom.js measures it, the script bakes it)
//   rank    its place in each of the 9 orders (0 = first), before = the length of the strokes
//           drawn ahead of it in that order, flip = 1 if "Follow the order" reverses it
//   own     its own start time (the first key of its Trim Paths, read live)
//   map     0, or the trim fraction at each of K + 1 even steps of the visual length: a stroke
//           in a stretched or skewed group would draw faster along its long side without it
// The controls c are the sliders on the controls null, read by drawon-glue.js:
//   mode    1 Together, 2 One after another, 3 Stagger, 4 My own start times
//   order   1-9 (DG.ORDERS), dir 1 As drawn, 2 Reversed, 3 Follow the order
//   after   1 Stay drawn, 2 Draw off (the start chases the end), 3 Rewind (played backwards)
//   start, gap, stagger, hold in seconds; ease, easeAll 0-100; speed px/s (> 0), total s
// Trim Paths measures by arc length (probe: 0.05 px at worst), so a linear progress is a
// constant speed inside a stroke; giving every stroke len / speed seconds makes it constant
// across strokes.

function dsClamp(x) {
    return x < 0 ? 0 : (x > 1 ? 1 : x);      // nested ?: in parentheses: ExtendScript reads a ? b : c ? d : e as (a ? b : c) ? d : e
}

// ease in and out by k (0 = linear, 100 = strong), symmetric; 0 and 1 stay put
function dsEase(x, k) {
    x = dsClamp(x);
    if (!(k > 0) || x <= 0 || x >= 1) return x;
    var a = 1 + 2 * (k > 100 ? 100 : k) / 100, p = Math.pow(x, a), q = Math.pow(1 - x, a);
    return p / (p + q);
}

// "Ease whole drawing": time inside the drawing [S, S + T] runs slow, fast, slow, so every
// stroke still moves at the same speed as the others at any moment
function dsWarp(t, S, T, k) {
    if (!(k > 0) || !(T > 0) || t <= S || t >= S + T) return t;
    return S + T * dsEase((t - S) / T, k);
}

// when stroke s starts drawing on
function dsBegin(c, s) {
    var o = c.order - 1;
    if (c.mode == 4) return s.own;
    if (c.mode == 1) return c.start;
    if (c.mode == 2) return c.start + Math.max(0, s.before[o] / c.speed + s.rank[o] * c.gap);
    return c.start + s.rank[o] * Math.max(0, c.stagger);
}

// how much of stroke s is drawn at time t, 0-1, before easing the stroke itself
function dsOn(c, s, t) {
    var t0 = dsBegin(c, s), d = s.len / c.speed;
    var u = c.mode == 4 ? t : dsWarp(t, c.start, c.total, c.easeAll);
    if (!(d > 0)) return u >= t0 ? 1 : 0;
    return dsEase((u - t0) / d, c.ease);
}

// a visual fraction of the stroke -> the trim fraction that reaches it
function dsMap(m, x) {
    x = dsClamp(x);
    if (!m) return x;
    var n = m.length - 1, f = x * n, i = Math.floor(f);
    if (i >= n) return m[n];
    return m[i] + (m[i + 1] - m[i]) * (f - i);
}

// [Start, End] of stroke s's Trim Paths at time t, in percent
function dsTrim(c, s, t) {
    var a = 0, b = dsOn(c, s, t), t0, end, off, hold = Math.max(0, c.hold), x, f;
    if (c.after > 1) {
        t0 = c.mode == 4 ? dsBegin(c, s) : c.start;
        end = c.mode == 4 ? t0 + s.len / c.speed : c.start + c.total;
        off = end + hold;
        if (t > off) {
            if (c.after == 2) a = dsOn(c, s, t - (off - t0));
            else b = dsOn(c, s, 2 * end + hold - t);
        }
    }
    f = c.dir == 2 ? 1 : (c.dir == 3 ? s.flip[c.order - 1] : 0);
    if (f) {
        x = 1 - b;
        b = 1 - a;
        a = x;
    }
    return [100 * dsMap(s.map, a), 100 * dsMap(s.map, b)];
}

// the length drawn before each stroke, for ranks r (a permutation of 0 ... n - 1)
function dsBefore(L, r) {
    var n = L.length, at = [], B = [], k, acc = 0;
    for (k = 0; k < n; k++) at[r[k]] = k;
    for (k = 0; k < n; k++) {
        B[at[k]] = acc;
        acc += L[at[k]];
    }
    return B;
}

// how long drawing on takes at speed v (seconds from c.start until the last stroke is done);
// L = every stroke's length, R = their ranks per order
function dsTotal(c, L, R, v) {
    var o = c.order - 1, r = R[o], B = c.mode == 2 ? dsBefore(L, r) : null, T = 0, k, e;
    for (k = 0; k < L.length; k++) {
        if (c.mode == 2) e = Math.max(0, B[k] / v + r[k] * c.gap) + L[k] / v;
        else if (c.mode == 3) e = r[k] * Math.max(0, c.stagger) + L[k] / v;
        else e = L[k] / v;
        if (e > T) T = e;
    }
    return T;
}

// the speed at which drawing on takes D seconds ("Fit to duration"); in My own start times,
// the longest stroke takes D. Gaps or staggers that alone take longer than D are left out
// (the drawing then runs over).
function dsFit(c, L, R, D) {
    var o = c.order - 1, r = R[o], B = c.mode == 2 ? dsBefore(L, r) : null, v = 0, k, w, room;
    if (!(D > 0)) D = 0.001;
    for (k = 0; k < L.length; k++) {
        w = L[k] / D;
        if (c.mode == 2) {
            room = D - r[k] * c.gap;
            if (room > 0) w = Math.max(w, (B[k] + L[k]) / room);
        } else if (c.mode == 3) {
            room = D - r[k] * Math.max(0, c.stagger);
            if (room > 0) w = Math.max(w, L[k] / room);
        }
        if (w > v) v = w;
    }
    return v > 0 ? v : 1;
}
