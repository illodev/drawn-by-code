// trim-probe.jsx - measures, inside After Effects, what the rig relies on (a bridge job):
//  1. how Trim Paths maps End % to distance along one path (arc length, or bezier t, or
//     equal shares per segment), read from the trimmed layer's sourceRectAtTime;
//  2. how "Trim Multiple Shapes: Individually" splits the range between paths (by length or
//     in equal shares, and in which order), between paths in one group and between groups;
//  3. the shape group transform (anchor, position, scale, skew, skew axis, rotation), from the
//     bounding boxes of transformed paths, for fitting the math in Node;
//  4. whether renaming a layer or an effect updates expressions that name it;
//  5. the property tree (matchNames) of a group with Trim Paths, a rect, an ellipse, a star.
// Writes out/probe/trim-probe.txt (one "key = value" per line, read by probe/fit.mjs).
(function () {
    var B = $.global.MMF_BRIDGE;
    var OUT = B.root + '/out/probe';
    new Folder(OUT).create();
    var lines = [];
    function put(k, v) {
        lines.push(k + ' = ' + (typeof v === 'object' && v !== null ? v.toSource() : String(v)));
    }
    function flush() {
        var f = new File(OUT + '/trim-probe.txt');
        f.encoding = 'UTF-8';
        f.open('w');
        f.write(lines.join('\n') + '\n');
        f.close();
    }
    function safe(e) {
        try {
            return String(e.message) + (e.line ? ' (line ' + e.line + ')' : '');
        } catch (x) {
            return 'unprintable';
        }
    }
    function step(name, f) {
        try {
            f();
        } catch (e) {
            put('error.' + name, safe(e));
        }
        flush();
    }
    if (!B.freshProject()) {
        put('error', 'the open project is not empty: not touched');
        flush();
        return;
    }
    app.beginSuppressDialogs();
    var comp = app.project.items.addComp('Probe', 1000, 1000, 1, 4, 24);
    function shape(v, i, o, closed) {
        var s = new Shape();
        s.vertices = v;
        s.inTangents = i;
        s.outTangents = o;
        s.closed = !!closed;
        return s;
    }
    function zeros(n) {
        var a = [];
        for (var k = 0; k < n; k++) a.push([0, 0]);
        return a;
    }
    // a shape layer with one group holding the given paths, a stroke and (optionally) a trim
    function layerWith(name, paths, trimType) {
        var L = comp.layers.addShape();
        L.name = name;
        var root = L.property('ADBE Root Vectors Group');
        var g = root.addProperty('ADBE Vector Group');
        g.name = 'G';
        var vec = g.property('ADBE Vectors Group');
        for (var k = 0; k < paths.length; k++) {
            var p = vec.addProperty('ADBE Vector Shape - Group');
            p.name = 'P' + (k + 1);
        }
        vec.addProperty('ADBE Vector Graphic - Stroke');
        if (trimType) {
            var t = vec.addProperty('ADBE Vector Filter - Trim');
            t.name = 'T';
        }
        // fetch again after adding (adding invalidates siblings)
        vec = L.property('ADBE Root Vectors Group').property(1).property('ADBE Vectors Group');
        for (k = 0; k < paths.length; k++) vec.property(k + 1).property('ADBE Vector Shape').setValue(paths[k]);
        if (trimType) vec.property(vec.numProperties).property('ADBE Vector Trim Type').setValue(trimType);
        return L;
    }
    function trimOf(L) {
        var vec = L.property('ADBE Root Vectors Group').property(1).property('ADBE Vectors Group');
        return vec.property(vec.numProperties);
    }
    function rect(L) {
        var r = L.sourceRectAtTime(0, false);
        return [r.left, r.top, r.width, r.height];
    }
    function sweep(name, L, ends) {
        var T = trimOf(L);
        for (var k = 0; k < ends.length; k++) {
            T.property('ADBE Vector Trim End').setValue(ends[k]);
            put(name + '.end' + ends[k], rect(L));
        }
        T.property('ADBE Vector Trim End').setValue(100);
    }
    var ENDS = [0, 5, 10, 25, 40, 50, 60, 75, 90, 100];

    step('version', function () {
        put('ae', app.version);
    });

    // 1. one path
    step('single', function () {
        // A: a straight line whose bezier speed is very uneven (control points 0, 250, 300, 300)
        var A = layerWith('A', [shape([[0, 0], [300, 0]], [[0, 0], [0, 0]], [[250, 0], [0, 0]])], 1);
        sweep('A', A, ENDS);
        // B: two straight segments, 100 and 300 long
        var Bl = layerWith('B', [shape([[0, 0], [100, 0], [400, 0]], zeros(3), zeros(3))], 1);
        sweep('B', Bl, ENDS);
        // C: an S curve, monotone in x (control x 0, 150, 150, 300), so the right edge of the
        // box is where the trim ends
        var C = layerWith('C', [shape([[0, 0], [300, 0]], [[0, 0], [-150, 300]], [[150, -300], [0, 0]])], 1);
        sweep('C', C, ENDS);
        // D: three segments of very different bend, monotone in x
        var D = layerWith('D', [shape([[0, 0], [50, 0], [250, 40], [260, 400]], [[0, 0], [-20, 0], [-60, -80], [0, -10]], [[20, 0], [60, 80], [0, 10], [0, 0]])], 1);
        sweep('D', D, ENDS);
        // E: closed square, 100 a side, from (0,0) clockwise
        var E = layerWith('E', [shape([[0, 0], [100, 0], [100, 100], [0, 100]], zeros(4), zeros(4), true)], 1);
        sweep('E', E, [10, 25, 30, 50, 60, 75, 80, 90]);
    });

    // 2. several paths under one trim, Individually (2) and Simultaneously (1)
    step('multi', function () {
        var p1 = shape([[0, 0], [100, 0]], zeros(2), zeros(2));
        var p2 = shape([[0, 100], [300, 100]], zeros(2), zeros(2));
        var M = layerWith('M', [p1, p2], 2);
        sweep('M', M, ENDS);
        var MS = layerWith('MS', [p1, p2], 1);
        sweep('MS', MS, [10, 50]);
        // the long path on top
        var R = layerWith('R', [p2, p1], 2);
        sweep('R', R, ENDS);
        // three paths 100, 100, 200 (rows y = 0, 100, 200)
        var p3 = shape([[0, 200], [200, 200]], zeros(2), zeros(2));
        var p1b = shape([[0, 100], [100, 100]], zeros(2), zeros(2));
        var M3 = layerWith('M3', [p1, p1b, p3], 2);
        sweep('M3', M3, [10, 20, 25, 33, 40, 50, 60, 66, 75, 90]);
        // groups: a root trim (Individually) over two groups of one path each (100 then 300)
        var L = comp.layers.addShape();
        L.name = 'GR';
        var root = L.property('ADBE Root Vectors Group');
        root.addProperty('ADBE Vector Group');
        root.addProperty('ADBE Vector Group');
        root.addProperty('ADBE Vector Filter - Trim');
        root = L.property('ADBE Root Vectors Group');
        var paths = [p1, p2];
        for (var k = 1; k <= 2; k++) {
            var vec = root.property(k).property('ADBE Vectors Group');
            vec.addProperty('ADBE Vector Shape - Group');
            vec.addProperty('ADBE Vector Graphic - Stroke');
        }
        root = L.property('ADBE Root Vectors Group');
        for (k = 1; k <= 2; k++) root.property(k).property('ADBE Vectors Group').property(1).property('ADBE Vector Shape').setValue(paths[k - 1]);
        var T = root.property(3);
        T.property('ADBE Vector Trim Type').setValue(2);
        for (k = 0; k < ENDS.length; k++) {
            T.property('ADBE Vector Trim End').setValue(ENDS[k]);
            put('GR.end' + ENDS[k], rect(L));
        }
        // a parent trim also trims a child group's trim result? child trim at 50, parent sweep
        root.property(1).property('ADBE Vectors Group').addProperty('ADBE Vector Filter - Trim');
        root = L.property('ADBE Root Vectors Group');
        root.property(1).property('ADBE Vectors Group').property(3).property('ADBE Vector Trim End').setValue(50);
        T = root.property(3);
        for (k = 0; k < ENDS.length; k++) {
            T.property('ADBE Vector Trim End').setValue(ENDS[k]);
            put('GRchild50.end' + ENDS[k], rect(L));
        }
    });

    // 3. group transforms: boxes of a known path under transformed groups
    step('xform', function () {
        var P = shape([[0, 0], [120, 10], [60, 90]], [[0, 0], [-30, -20], [20, 0]], [[40, -30], [0, 30], [0, 0]], true);
        put('xform.path', [P.vertices, P.inTangents, P.outTangents]);
        var cases = [
            { a: [0, 0], p: [0, 0], s: [100, 100], k: 0, ka: 0, r: 0 },
            { a: [0, 0], p: [0, 0], s: [150, 60], k: 0, ka: 0, r: 0 },
            { a: [0, 0], p: [0, 0], s: [100, 100], k: 0, ka: 0, r: 30 },
            { a: [0, 0], p: [0, 0], s: [100, 100], k: 20, ka: 0, r: 0 },
            { a: [0, 0], p: [0, 0], s: [100, 100], k: 20, ka: 35, r: 0 },
            { a: [10, 20], p: [100, 50], s: [100, 100], k: 0, ka: 0, r: 0 },
            { a: [10, 20], p: [100, 50], s: [150, 60], k: 25, ka: 40, r: 30 },
            { a: [-5, 7], p: [20, -30], s: [-80, 130], k: -15, ka: 70, r: -50 }
        ];
        for (var c = 0; c < cases.length; c++) {
            var L = layerWith('X' + c, [P], 0);
            var tg = L.property('ADBE Root Vectors Group').property(1).property('ADBE Vector Transform Group');
            tg.property('ADBE Vector Anchor').setValue(cases[c].a);
            tg.property('ADBE Vector Position').setValue(cases[c].p);
            tg.property('ADBE Vector Scale').setValue(cases[c].s);
            tg.property('ADBE Vector Skew').setValue(cases[c].k);
            tg.property('ADBE Vector Skew Axis').setValue(cases[c].ka);
            tg.property('ADBE Vector Rotation').setValue(cases[c].r);
            put('xform.case' + c, cases[c]);
            put('xform.rect' + c, rect(L));
        }
        // nested: an outer group around the transformed group
        var N = comp.layers.addShape();
        N.name = 'XN';
        var outer = N.property('ADBE Root Vectors Group').addProperty('ADBE Vector Group');
        var inner = outer.property('ADBE Vectors Group').addProperty('ADBE Vector Group');
        inner.property('ADBE Vectors Group').addProperty('ADBE Vector Shape - Group');
        inner = N.property('ADBE Root Vectors Group').property(1).property('ADBE Vectors Group').property(1);
        inner.property('ADBE Vectors Group').property(1).property('ADBE Vector Shape').setValue(P);
        var it = inner.property('ADBE Vector Transform Group');
        it.property('ADBE Vector Scale').setValue([150, 60]);
        it.property('ADBE Vector Rotation').setValue(30);
        it.property('ADBE Vector Position').setValue([40, 0]);
        var ot = N.property('ADBE Root Vectors Group').property(1).property('ADBE Vector Transform Group');
        ot.property('ADBE Vector Scale').setValue([70, 140]);
        ot.property('ADBE Vector Rotation').setValue(-20);
        ot.property('ADBE Vector Skew').setValue(10);
        ot.property('ADBE Vector Skew Axis').setValue(15);
        put('xform.nested', { inner: { s: [150, 60], r: 30, p: [40, 0] }, outer: { s: [70, 140], r: -20, k: 10, ka: 15 } });
        put('xform.nestedRect', rect(N));
    });

    // 4. do expressions follow a renamed layer / effect?
    step('rename', function () {
        var ctl = comp.layers.addNull();
        ctl.name = 'Ctrl A';
        var fx = ctl.property('ADBE Effect Parade').addProperty('ADBE Slider Control');
        fx.name = 'Speed A';
        var user = comp.layers.addNull();
        user.name = 'Reader';
        var op = user.property('ADBE Transform Group').property('ADBE Opacity');
        op.expression = 'thisComp.layer("Ctrl A").effect("Speed A")(1).value + 10';
        ctl = comp.layer('Ctrl A');
        ctl.name = 'Ctrl B';
        ctl.property('ADBE Effect Parade').property(1).name = 'Speed B';
        op = comp.layer('Reader').property('ADBE Transform Group').property('ADBE Opacity');
        put('rename.expression', op.expression);
        put('rename.enabled', op.expressionEnabled);
        put('rename.error', op.expressionError);
        put('rename.value', op.valueAtTime(0, false));
    });

    // 5. property trees
    step('tree', function () {
        var L = comp.layers.addShape();
        L.name = 'Tree';
        var vec = L.property('ADBE Root Vectors Group').addProperty('ADBE Vector Group').property('ADBE Vectors Group');
        vec.addProperty('ADBE Vector Shape - Rect');
        vec.addProperty('ADBE Vector Shape - Ellipse');
        vec.addProperty('ADBE Vector Shape - Star');
        vec.addProperty('ADBE Vector Graphic - Stroke');
        vec.addProperty('ADBE Vector Filter - Trim');
        function dump(g, pre) {
            for (var k = 1; k <= g.numProperties; k++) {
                var p = g.property(k);
                var v = '';
                if (p.propertyType === PropertyType.PROPERTY) {
                    try {
                        v = ' = ' + (p.propertyValueType === PropertyValueType.SHAPE ? 'shape' : p.value.toSource());
                    } catch (e) {
                        v = ' = ?';
                    }
                }
                put('tree.' + pre + k, p.matchName + ' | ' + p.name + v);
                if (p.propertyType !== PropertyType.PROPERTY) dump(p, pre + k + '.');
            }
        }
        dump(L.property('ADBE Root Vectors Group'), '');
        // trims on parametric shapes: where they start and which way they go
        var shapes = ['ADBE Vector Shape - Rect', 'ADBE Vector Shape - Ellipse', 'ADBE Vector Shape - Star'];
        for (var s = 0; s < shapes.length; s++) {
            var Q = comp.layers.addShape();
            Q.name = 'Q' + s;
            var qv = Q.property('ADBE Root Vectors Group').addProperty('ADBE Vector Group').property('ADBE Vectors Group');
            qv.addProperty(shapes[s]);
            qv.addProperty('ADBE Vector Graphic - Stroke');
            qv.addProperty('ADBE Vector Filter - Trim');
            qv = Q.property('ADBE Root Vectors Group').property(1).property('ADBE Vectors Group');
            if (s === 0) qv.property(1).property('ADBE Vector Rect Size').setValue([200, 100]);
            if (s === 1) qv.property(1).property('ADBE Vector Ellipse Size').setValue([200, 100]);
            var T = qv.property(3);
            for (var e = 0; e < ENDS.length; e++) {
                T.property('ADBE Vector Trim End').setValue(ENDS[e]);
                put('Q' + s + '.end' + ENDS[e], rect(Q));
            }
        }
    });

    var save = new File(OUT + '/trim-probe.aep');
    step('save', function () {
        app.project.save(save);
    });
    app.endSuppressDialogs(false);
    put('done', true);
    flush();
})();
