// field-math.js - the field's math, plain ES3 and ASCII only, shared by After Effects and
// the engine.
//
// build.mjs pastes this file (without comments) into the expressions FieldEffector.jsx
// writes, and the engine preview loads it with `uses`, so both compute the same weights.
// The noise uses only + - * / floor and 32-bit integer ops, which give the same bits in
// ExtendScript, AE's JavaScript expression engine, Node and Chromium.
//
// Coordinates: (lx, ly) is a point in the field null's layer space, relative to its anchor
// point, so the null's rotation and scale shape the field (scale it 200 x 50 % and a
// sphere becomes an ellipse).

// 32-bit integer multiply (Math.imul is not ES3)
function fxImul(a, b) {
    var ah = (a >>> 16) & 0xffff, al = a & 0xffff, bh = (b >>> 16) & 0xffff, bl = b & 0xffff;
    return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)) | 0;
}

// [0, 1) from three lattice integers
function fxHash(x, y, z) {
    var h = fxImul(x | 0, 0x27d4eb2d) ^ fxImul(y | 0, 0x165667b1) ^ fxImul(z | 0, 0x1b873593);
    h = fxImul(h ^ (h >>> 15), 0x2c1b3c6d);
    h = fxImul(h ^ (h >>> 12), 0x297a2d39);
    h = h ^ (h >>> 15);
    return (h >>> 0) / 4294967296;
}

// value noise on the integer lattice, smoothstep between corners: [0, 1)
function fxLattice(x, y, z) {
    var ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    var fx = x - ix, fy = y - iy, fz = z - iz;
    var u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
    var a = fxHash(ix, iy, iz), b = fxHash(ix + 1, iy, iz);
    var c = fxHash(ix, iy + 1, iz), d = fxHash(ix + 1, iy + 1, iz);
    var e = fxHash(ix, iy, iz + 1), f = fxHash(ix + 1, iy, iz + 1);
    var g = fxHash(ix, iy + 1, iz + 1), h = fxHash(ix + 1, iy + 1, iz + 1);
    var k0 = a + (b - a) * u, k1 = c + (d - c) * u, k2 = e + (f - e) * u, k3 = g + (h - g) * u;
    var m0 = k0 + (k1 - k0) * v, m1 = k2 + (k3 - k2) * v;
    return m0 + (m1 - m0) * w;
}

// two octaves, -1 ... 1
function fxNoise(x, y, z) {
    var n = fxLattice(x, y, z) + 0.5 * fxLattice(x * 2 + 17.3, y * 2 - 9.1, z * 2 + 4.7);
    return n / 0.75 - 1;
}

// falloff curve on t (0 at the field's edge, 1 where it is full):
// 1 Linear, 2 Smooth, 3 Ease In (gentle at the edge), 4 Ease Out (gentle at the full end),
// 5 Custom (the designer's keyed slider, passed in as a function)
function fxCurve(t, mode, custom) {
    if (mode === 2) return t * t * (3 - 2 * t);
    if (mode === 3) return t * t;
    if (mode === 4) return t * (2 - t);
    if (mode === 5 && custom) return custom(t);
    return t;
}

// signed distance from (lx, ly) to the field's region, negative inside:
// 1 Sphere (radius = size), 2 Box (half side = size), 3 Linear (the null's -X side)
function fxDistance(shape, size, lx, ly) {
    if (shape === 2) {
        var qx = (lx < 0 ? -lx : lx) - size, qy = (ly < 0 ? -ly : ly) - size;
        var ox = qx > 0 ? qx : 0, oy = qy > 0 ? qy : 0, m = qx > qy ? qx : qy;
        return Math.sqrt(ox * ox + oy * oy) + (m < 0 ? m : 0);
    }
    if (shape === 3) return lx;
    return Math.sqrt(lx * lx + ly * ly) - size;
}

// One field's weight: 0 ... 1 (beyond with a Custom curve that overshoots, or Invert of it).
// P holds the field's controls as plain numbers:
//   shape 1 Sphere 2 Box 3 Linear 4 Noise, size (px), falloff (% of size that ramps),
//   curve (see fxCurve), strength (%), invert (0/1), edgeNoise (px), noiseSize (px),
//   noiseSpeed (per second), seed
// t is the time in seconds.
function fxField(P, lx, ly, t, custom) {
    var size = P.size > 0 ? P.size : 0;
    var ns = P.noiseSize < 0 ? -P.noiseSize : P.noiseSize;
    if (ns < 1) ns = 1;
    var nz = t * P.noiseSpeed + P.seed * 7.31, w;
    if (P.shape === 4) {
        w = 0.5 + 0.5 * fxNoise(lx / ns, ly / ns, nz);
    } else {
        var d = fxDistance(P.shape, size, lx, ly);
        if (P.edgeNoise !== 0) d += P.edgeNoise * fxNoise(lx / ns, ly / ns, nz);
        var W = size * P.falloff / 100;
        if (W > 0.0001) w = -d / W;
        else w = d <= 0 ? 1 : 0;
    }
    w = w < 0 ? 0 : (w > 1 ? 1 : w);
    w = fxCurve(w, P.curve, custom);
    if (P.invert) w = 1 - w;
    return w * P.strength / 100;
}

// the weight so far (a) with the next field's (b): 1 Max, 2 Add, 3 Subtract, 4 Multiply, 5 Min
function fxBlend(a, b, mode) {
    if (mode === 2) return a + b;
    if (mode === 3) return a - b;
    if (mode === 4) return a * b;
    if (mode === 5) return a < b ? a : b;
    return a > b ? a : b;
}

// All fields at one layer. fields[i] = { P, lx, ly, cx, cy, ax, ay, custom }: P and
// (lx, ly) as in fxField, (cx, cy) the field's centre in comp space, (ax, ay) its X axis in
// comp space (unit length). (px, py) is the layer's rest position in comp space.
// Returns [weight, pushX, pushY]: the combined weight (never below 0) and the push
// direction (unit, or 0 0): away from the centre of spheres and boxes, along +X for linear
// fields, none for noise, mixed by each field's weight.
function fxEvaluate(fields, px, py, t) {
    var w = 0, dx = 0, dy = 0;
    for (var i = 0; i < fields.length; i++) {
        var f = fields[i], wi = fxField(f.P, f.lx, f.ly, t, f.custom);
        w = i === 0 ? wi : fxBlend(w, wi, f.P.blend);
        var ux = 0, uy = 0;
        if (f.P.shape === 3) {
            ux = f.ax;
            uy = f.ay;
        } else if (f.P.shape !== 4) {
            ux = px - f.cx;
            uy = py - f.cy;
            var l = Math.sqrt(ux * ux + uy * uy);
            if (l > 0.0001) {
                ux = ux / l;
                uy = uy / l;
            } else {
                ux = 0;
                uy = 0;
            }
        }
        var aw = wi < 0 ? -wi : wi;
        dx += ux * aw;
        dy += uy * aw;
    }
    var n = Math.sqrt(dx * dx + dy * dy);
    if (n > 0.0001) {
        dx = dx / n;
        dy = dy / n;
    } else {
        dx = 0;
        dy = 0;
    }
    return [w > 0 ? w : 0, dx, dy];
}

// The Anchor Point change that moves a 2D layer by (dx, dy) in its parent's space, given
// the layer's final rotation (degrees, clockwise like AE) and scale (%): anchor -= result.
// After Effects places a layer point q at  position + R(rot) S(scale) (q - anchor),  so
// lowering the anchor by S^-1 R^-1 (dx, dy) shifts every point by exactly (dx, dy) while it
// still rotates and scales about its own anchor.
function fxAnchorShift(dx, dy, rot, sx, sy) {
    var a = rot * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    sx = sx / 100;
    sy = sy / 100;
    if (sx < 0.0001 && sx > -0.0001) sx = sx < 0 ? -0.0001 : 0.0001;
    if (sy < 0.0001 && sy > -0.0001) sy = sy < 0 ? -0.0001 : 0.0001;
    return [(dx * c + dy * s) / sx, (dy * c - dx * s) / sy];
}
