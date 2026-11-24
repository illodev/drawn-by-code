// flock-math.js - the math behind the flock rig's live controls. build.mjs pastes it,
// comments stripped, into every expression Flock.jsx writes; the engine preview loads it
// with `uses`; test.mjs runs both against each other. Plain ES3 and ASCII only.

// Shape of the flock, without speeding birds up. The shape controls move each bird away
// from where the simulation put it. Applied to its offset of the moment, a bigger or longer
// flock would also multiply how fast birds move inside it, and a long flock turning with its
// heading would swing its tips round like a spinning top: edge birds far faster than the
// rest. So the shape works on each bird's MEAN offset over a window of W seconds (and on
// the flock's mean axis of travel over the same window), long enough that what it adds
// stays under a speed budget; the bird's quicker motion around that mean is kept as
// simulated, so at the default controls the flock is exactly the simulated one.

// The clumping factor at distance r from the centre (R: the flock's RMS radius).
function flockClump(r, R, clump) {
    var k = clump / 100;
    if (k < -0.9) k = -0.9;
    if (k > 3) k = 3;
    if (k === 0 || r < 0.000001 || R < 0.000001) return 1;
    var f = Math.pow(r / R, k);
    return f < 0.15 ? 0.15 : (f > 3 ? 3 : f);
}

// The window (s). Rref: the flock's typical RMS radius (px); budget: the most the shape may
// add to a bird's speed (px/s). A bird's mean offset moves at most 2 r / W (it can cross
// the flock, edge to edge, once per window), so W grows with how much the controls
// magnify that motion (e: along, across and, with clumping, outwards, where moving
// in or out is magnified (1 + k) times more) and with how much they stretch along a
// turning axis (ea).
function flockWindow(spread, len, wid, clump, Rref, budget) {
    var rTip = 2 * Rref, sp = spread / 100, e = 0, ea = 0, j, f, g, a, b, fr, k = clump / 100;
    if (k < -0.9) k = -0.9;
    if (k > 3) k = 3;
    for (j = 1; j <= 4; j++) {
        fr = j / 4;
        f = flockClump(fr * rTip, Rref, clump);
        g = f > 0.15 && f < 3 ? f * (1 + k) : f;   // the radial stretch (where not capped)
        a = Math.max(Math.abs((sp * len * f) / 100 - 1), Math.abs((sp * len * g) / 100 - 1)) * fr;
        b = Math.max(Math.abs((sp * wid * f) / 100 - 1), Math.abs((sp * wid * g) / 100 - 1)) * fr;
        if (a > e) e = a;
        if (b > e) e = b;
        a = ((sp * Math.abs(len - wid)) / 200) * f * fr;
        if (a > ea) ea = a;
    }
    if (budget <= 0) return 60;
    var W = (2 * rTip * (e + ea / 0.5)) / budget;
    return W > 60 ? 60 : W;
}

// A running sum at time t, read through get(t) (keys from t0 to t1, one every dt or more),
// carried on past both ends at the end's own rate: a window may reach outside the bake.
function flockSumAt(get, t, t0, t1, dt) {
    var tc = t < t0 ? t0 : (t > t1 ? t1 : t), a = get(tc);
    if (tc === t) return [a[0], a[1]];
    var e = tc === t0 ? get(t0 + dt) : get(t1 - dt), k = (t - tc) / dt;
    if (tc === t0) return [a[0] + (e[0] - a[0]) * k, a[1] + (e[1] - a[1]) * k];
    return [a[0] + (a[0] - e[0]) * k, a[1] + (a[1] - e[1]) * k];
}

// The mean over [t - W/2, t + W/2] of what a running sum adds up.
function flockMean(get, t, W, t0, t1, dt) {
    var a = flockSumAt(get, t - W / 2, t0, t1, dt), b = flockSumAt(get, t + W / 2, t0, t1, dt);
    return [(b[0] - a[0]) / W, (b[1] - a[1]) / W];
}

// The new offset of a bird from the centre. (mx, my): its mean offset over the window;
// (dx, dy): its offset now; (ax, ay): the mean axis of travel (doubled-angle vector, length
// <= 1; it shortens where the flock turns or slows, and the stretch fades with it below 0.5);
// R: the flock's mean RMS radius over the window. Controls in %, ang in degrees:
//   spread: overall size        len / wid: along / across the axis of travel
//   ang: shape axis vs travel   clump: > 0 = dense core with stragglers, < 0 = evened out
function flockShape(mx, my, dx, dy, ax, ay, R, spread, len, wid, ang, clump) {
    var f = flockClump(Math.sqrt(mx * mx + my * my), R, clump);
    var n = Math.sqrt(ax * ax + ay * ay), g = n > 0.5 ? n : 0.5;
    var a2 = (ang * Math.PI) / 90, c = Math.cos(a2), s = Math.sin(a2);
    var bx = (ax * c - ay * s) / g, by = (ax * s + ay * c) / g;
    var sp = (spread / 100) * f, m = (len + wid) / 200, d = (len - wid) / 200;
    var u = mx * (m + d * bx) + my * d * by, v = mx * d * by + my * (m - d * bx);
    return [u * sp + dx - mx, v * sp + dy - my];
}

// Scatter's wiggles per second, capped so a bird never wanders faster than budget px/s.
// AE's wiggle(freq, amt) moves at up to 3.3 * freq * amt px/s (measured in After Effects
// 2027 over 20 s: median 1.0, p99 2.9); 4 leaves a margin.
function flockScatterSpeed(spd, amt, budget) {
    var cap = budget / (4 * amt);
    return spd < cap ? spd : cap;
}

// Turning around. face: -1 ... 1 (baked; passes through 0 mid-turn); faces: 1 if the bird
// is drawn facing right, -1 if left; minW: narrowest side view, 0 ... 1; headOn: share of
// the turn that shows the head-on drawing, 0 ... 1 (only when the precomp has one).
// Returns [signed horizontal scale factor, 1 = show the head-on drawing / 0 = side view].
function flockFacing(face, faces, minW, headOn, hasTurn) {
    var w = Math.abs(face), sg = face < 0 ? -1 : 1;
    if (minW < 0) minW = 0;
    if (minW > 1) minW = 1;
    if (hasTurn && headOn > 0) {
        if (headOn >= 1) return w >= 1 ? [sg * faces, 0] : [1, 1];
        if (w < headOn) return [1, 1];
        w = (w - headOn) / (1 - headOn);
    }
    return [sg * faces * (minW + (1 - minW) * w), 0];
}

// Bird scale in %. d: baked depth scale (1 = the leader's plane); persp, size, sizeVar in
// %; r: this bird's size random, -1 ... 1.
function flockSize(d, persp, size, sizeVar, r) {
    return Math.pow(d, persp / 100) * (size / 100) * (1 + (sizeVar / 100) * r) * 100;
}

// The layer's [x, y] scale. fac: flockFacing's result; s: flockSize; up: the baked
// vertical sign (-1 = the bird is in its upside-down pose, rotated by about 180 degrees).
// The head-on drawing is never mirrored: both axes take the sign, which undoes the 180.
function flockScale(fac, s, up) {
    return fac[1] ? [up * s, up * s] : [fac[0] * s, up * s];
}

// Rotation with Orient (%): the bird's tilt away from level, scaled. Level is the
// nearest multiple of 180 degrees (180 = the upside-down pose flying level).
function flockOrient(rot, orient) {
    var level = Math.round(rot / 180) * 180;
    return level + ((rot - level) * orient) / 100;
}

// Where in its flap cycle a bird is, 0 ... 1. p: baked phase (cycles, includes the bird's
// own offset R); speed, desync in %.
function flockCycle(p, R, speed, desync) {
    var q = ((p - R) * speed) / 100 + (R * desync) / 100;
    return q - Math.floor(q);
}
