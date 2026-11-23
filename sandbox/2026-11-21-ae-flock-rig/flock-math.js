// flock-math.js - the math behind the flock rig's live controls. build.mjs pastes it,
// comments stripped, into every expression Flock.jsx writes; the engine preview loads it
// with `uses`; test.mjs runs both against each other. Plain ES3 and ASCII only.

// Shape of the flock. (ox, oy): a bird's offset from the flock's centre (px); R: the
// flock's RMS radius; hd: its heading (degrees). Returns the new offset.
//   spread: % overall size        len / wid: % along / across the shape axis
//   ang: shape axis vs heading (degrees; 0 = along the direction of travel)
//   clump: % pull towards the core; > 0 = dense core with stragglers, < 0 = evened out
function flockShape(ox, oy, R, hd, spread, len, wid, ang, clump) {
    var k = clump / 100;
    if (k < -0.9) k = -0.9;
    if (k > 3) k = 3;
    var r = Math.sqrt(ox * ox + oy * oy);
    if (k !== 0 && r > 0.000001 && R > 0.000001) {
        var f = Math.pow(r / R, k);
        if (f < 0.15) f = 0.15;
        if (f > 3) f = 3;
        ox = ox * f;
        oy = oy * f;
    }
    var a = ((hd + ang) * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    var u = ((ox * c + oy * s) * len) / 100, v = ((-ox * s + oy * c) * wid) / 100;
    var sp = spread / 100;
    return [(u * c - v * s) * sp, (u * s + v * c) * sp];
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
