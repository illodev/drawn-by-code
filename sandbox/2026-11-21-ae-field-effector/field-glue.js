// field-glue.js - the part of the expressions that reads After Effects, plain ES3 and ASCII
// only. build.mjs pastes it (without comments) after field-math.js into the expressions
// FieldEffector.jsx writes; test.mjs runs it against a mock of AE's expression objects.
//
// It turns the effector's field nulls (found through its "Field 1 ... K" Layer Controls,
// so renaming a field never breaks anything) into the plain numbers fxEvaluate takes.
//
// In an expression, effect("X")(1) is a Property object, not a number: arithmetic converts
// it, but ===, !== and if () do not (a checkbox Property is always "true"). Every control
// is read with .value.

// the field's "Custom Curve" slider as a function of t (0 ... 1): only the shape of its
// keys matters, from the first key to the last, so they can sit anywhere on the timeline
function fxCustom(C) {
    return function (t) {
        var n = C.numKeys;
        if (n < 2) return t;
        var t0 = C.key(1).time, t1 = C.key(n).time, v0 = C.key(1).value, v1 = C.key(n).value;
        if (t1 <= t0 || v1 === v0) return t;
        return (C.valueAtTime(t0 + t * (t1 - t0)) - v0) / (v1 - v0);
    };
}

// one field null, seen from the comp-space point (px, py); throws if F is not a field
function fxRead(F, px, py) {
    var e = function (name) { return F.effect(name)(1).value; };
    var P = {
        shape: e("Shape"), size: e("Size"), falloff: e("Falloff"), curve: e("Curve"),
        strength: e("Strength"), invert: e("Invert"), edgeNoise: e("Edge Noise"),
        noiseSize: e("Noise Size"), noiseSpeed: e("Noise Speed"), seed: e("Seed"), blend: e("Blend")
    };
    var A = F.transform.anchorPoint.value, l = F.fromComp([px, py]), c = F.toComp(A);
    var x1 = F.toComp([A[0] + 1, A[1]]), ax = x1[0] - c[0], ay = x1[1] - c[1];
    var al = Math.sqrt(ax * ax + ay * ay);
    if (al < 0.000001) al = 0.000001;
    return {
        P: P, lx: l[0] - A[0], ly: l[1] - A[1], cx: c[0], cy: c[1], ax: ax / al, ay: ay / al,
        custom: fxCustom(F.effect("Custom Curve")(1))
    };
}

// every field of effector E (K Layer Controls) at the comp-space point (px, py), time t.
// A control that points at no layer, at a layer without the field's controls (AE re-aims a
// Layer Control when its layer is deleted) or at a field already counted is skipped.
function fxAt(E, K, px, py, t) {
    var fields = [], seen = {};
    for (var i = 1; i <= K; i++) {
        try {
            var F = E.effect("Field " + i)(1);
            if (F && !seen["L" + F.index]) {
                fields.push(fxRead(F, px, py));
                seen["L" + F.index] = true;
            }
        } catch (err) {}
    }
    return fxEvaluate(fields, px, py, t);
}
