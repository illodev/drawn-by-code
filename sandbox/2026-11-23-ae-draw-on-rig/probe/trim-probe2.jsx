// trim-probe2.jsx - the second round of measurements (a bridge job), for what the rig's AE half
// relies on:
//  1. Shape Direction values (1, 2, 3) on a bezier path, a rectangle and an ellipse: which ones
//     reverse the way Trim Paths runs;
//  2. a parent trim (Individually) over groups with their own scale: does it count lengths
//     before or after the groups' transforms?
//  3. where a rounded rectangle starts;
//  4. expression idioms: propertyGroup(1)(2), a Layer Control's layer, key(1).time of a trim
//     property; switching a trim off from a script (enabled = false).
// Writes out/probe/trim-probe2.txt.
(function () {
    var B = $.global.MMF_BRIDGE;
    var OUT = B.root + '/out/probe';
    new Folder(OUT).create();
    var lines = [];
    function put(k, v) {
        lines.push(k + ' = ' + (typeof v === 'object' && v !== null ? v.toSource() : String(v)));
    }
    function flush() {
        var f = new File(OUT + '/trim-probe2.txt');
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
        put('error', 'the open project is not ours: not touched');
        flush();
        return;
    }
    app.beginSuppressDialogs();
    var comp = app.project.items.addComp('Probe2', 1000, 1000, 1, 4, 24);
    function rect(L) {
        var r = L.sourceRectAtTime(0, false);
        return [Math.round(r.left * 100) / 100, Math.round(r.top * 100) / 100, Math.round(r.width * 100) / 100, Math.round(r.height * 100) / 100];
    }
    function zeros(n) {
        var a = [];
        for (var k = 0; k < n; k++) a.push([0, 0]);
        return a;
    }
    // one group: [shape of kind], stroke, trim
    function one(name, kind, setup) {
        var L = comp.layers.addShape();
        L.name = name;
        var vec = L.property('ADBE Root Vectors Group').addProperty('ADBE Vector Group').property('ADBE Vectors Group');
        vec.addProperty(kind);
        vec.addProperty('ADBE Vector Graphic - Stroke');
        vec.addProperty('ADBE Vector Filter - Trim');
        vec = L.property('ADBE Root Vectors Group').property(1).property('ADBE Vectors Group');
        setup(vec.property(1));
        return L;
    }
    function trim(L) {
        return L.property('ADBE Root Vectors Group').property(1).property('ADBE Vectors Group').property(3);
    }
    function sweep(name, L, ends) {
        var T = trim(L);
        for (var k = 0; k < ends.length; k++) {
            T.property('ADBE Vector Trim End').setValue(ends[k]);
            put(name + '.end' + ends[k], rect(L));
        }
        T.property('ADBE Vector Trim End').setValue(100);
    }

    step('direction', function () {
        var line = new Shape();
        line.vertices = [[0, 0], [100, 0], [100, 100]];
        line.inTangents = zeros(3);
        line.outTangents = zeros(3);
        line.closed = false;
        for (var d = 1; d <= 3; d++) {
            var kinds = [['bez', 'ADBE Vector Shape - Group'], ['rect', 'ADBE Vector Shape - Rect'], ['ell', 'ADBE Vector Shape - Ellipse']];
            for (var k = 0; k < kinds.length; k++) {
                var ok = true;
                var L = one(kinds[k][0] + d, kinds[k][1], function (p) {
                    if (kinds[k][0] === 'bez') p.property('ADBE Vector Shape').setValue(line);
                    if (kinds[k][0] === 'rect') p.property('ADBE Vector Rect Size').setValue([200, 100]);
                    if (kinds[k][0] === 'ell') p.property('ADBE Vector Ellipse Size').setValue([200, 100]);
                    try {
                        p.property('ADBE Vector Shape Direction').setValue(d);
                    } catch (e) {
                        ok = false;
                        put(kinds[k][0] + d + '.setError', safe(e));
                    }
                });
                if (ok) sweep(kinds[k][0] + d, L, [5, 25, 50]);
            }
        }
        // the bezier path's own Shape Direction property: present?
        var Lb = comp.layer('bez1');
        var pg = Lb.property('ADBE Root Vectors Group').property(1).property('ADBE Vectors Group').property(1);
        var names = [];
        for (var i = 1; i <= pg.numProperties; i++) names.push(pg.property(i).matchName + '=' + (pg.property(i).propertyValueType === PropertyValueType.SHAPE ? 'shape' : pg.property(i).value));
        put('bez.props', names.join(', '));
    });

    step('rounded', function () {
        var L = one('round', 'ADBE Vector Shape - Rect', function (p) {
            p.property('ADBE Vector Rect Size').setValue([200, 100]);
            p.property('ADBE Vector Rect Roundness').setValue(20);
        });
        sweep('round', L, [1, 2, 5, 10, 25, 50]);
    });

    // a root trim, Individually, over group 1 (a 100 px line scaled 200 %) and group 2 (a 300 px line)
    step('scaled', function () {
        var L = comp.layers.addShape();
        L.name = 'scaled';
        var root = L.property('ADBE Root Vectors Group');
        root.addProperty('ADBE Vector Group');
        root.addProperty('ADBE Vector Group');
        root.addProperty('ADBE Vector Filter - Trim');
        root = L.property('ADBE Root Vectors Group');
        var rows = [[[0, 0], [100, 0]], [[0, 100], [300, 100]]];
        for (var k = 1; k <= 2; k++) {
            var vec = root.property(k).property('ADBE Vectors Group');
            vec.addProperty('ADBE Vector Shape - Group');
            vec.addProperty('ADBE Vector Graphic - Stroke');
        }
        root = L.property('ADBE Root Vectors Group');
        for (k = 1; k <= 2; k++) {
            var s = new Shape();
            s.vertices = rows[k - 1];
            s.inTangents = zeros(2);
            s.outTangents = zeros(2);
            s.closed = false;
            root.property(k).property('ADBE Vectors Group').property(1).property('ADBE Vector Shape').setValue(s);
        }
        root.property(1).property('ADBE Vector Transform Group').property('ADBE Vector Scale').setValue([200, 200]);
        var T = L.property('ADBE Root Vectors Group').property(3);
        T.property('ADBE Vector Trim Type').setValue(2);
        var ends = [10, 25, 40, 50, 60, 75];
        for (k = 0; k < ends.length; k++) {
            T.property('ADBE Vector Trim End').setValue(ends[k]);
            put('scaled.end' + ends[k], rect(L));
        }
    });

    step('idioms', function () {
        var ctl = comp.layers.addNull();
        ctl.name = 'Ctl';
        ctl.property('ADBE Effect Parade').addProperty('ADBE Slider Control').name = 'Speed';
        ctl = comp.layer('Ctl');
        ctl.property('ADBE Effect Parade').property(1).property(1).setValue(42);
        var L = one('idioms', 'ADBE Vector Shape - Rect', function () {});
        var lc = L.property('ADBE Effect Parade').addProperty('ADBE Layer Control');
        lc.name = 'Rig';
        L.property('ADBE Effect Parade').property(1).property(1).setValue(comp.layer('Ctl').index);
        var T = trim(comp.layer('idioms'));
        var E = T.property('ADBE Vector Trim End');
        E.setValueAtTime(0.5, 0);
        E.setValueAtTime(1.5, 100);
        T = trim(comp.layer('idioms'));
        var S = T.property('ADBE Vector Trim Start');
        S.expression = 'var T = thisProperty.propertyGroup(1); var e = T(2); e.numKeys > 0 ? e.key(1).time * 10 : -1;';
        T = trim(comp.layer('idioms'));
        put('idiom.groupIndex', T.property('ADBE Vector Trim Start').valueAtTime(0, false) + ' error=' + T.property('ADBE Vector Trim Start').expressionError);
        T.property('ADBE Vector Trim Offset').expression = 'effect("Rig")(1).effect("Speed")(1).value';
        T = trim(comp.layer('idioms'));
        put('idiom.layerControl', T.property('ADBE Vector Trim Offset').valueAtTime(0, false) + ' error=' + T.property('ADBE Vector Trim Offset').expressionError);
        // End keeps its keys; an expression on it overrides them, and removing it gives them back
        T.property('ADBE Vector Trim End').expression = '50';
        T = trim(comp.layer('idioms'));
        put('idiom.override', T.property('ADBE Vector Trim End').valueAtTime(1.5, false));
        T.property('ADBE Vector Trim End').expression = '';
        T = trim(comp.layer('idioms'));
        put('idiom.restored', T.property('ADBE Vector Trim End').valueAtTime(1.5, false) + ' keys=' + T.property('ADBE Vector Trim End').numKeys);
        // switching a trim off
        var en = 'n/a';
        try {
            T.enabled = false;
            T = trim(comp.layer('idioms'));
            en = String(T.enabled) + ' canSetEnabled=' + T.canSetEnabled;
            T.enabled = true;
        } catch (e) {
            en = 'error ' + safe(e);
        }
        put('idiom.enabled', en);
        // a sourceRect while the trim's End is driven by an expression (what the AE test measures)
        T = trim(comp.layer('idioms'));
        T.property('ADBE Vector Trim Start').expression = '';
        T = trim(comp.layer('idioms'));
        T.property('ADBE Vector Trim End').expression = 'time * 50';
        put('idiom.rectAtTime', rect(comp.layer('idioms')) + ' / ' + (function () {
            var r = comp.layer('idioms').sourceRectAtTime(1, false);
            return [r.left, r.top, r.width, r.height].toSource();
        })());
        put('idiom.engine', app.project.expressionEngine);
    });

    var save = new File(OUT + '/trim-probe2.aep');
    step('save', function () {
        app.project.save(save);
    });
    app.endSuppressDialogs(false);
    put('done', true);
    flush();
})();
