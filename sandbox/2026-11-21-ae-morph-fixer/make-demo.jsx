// make-demo.jsx - builds the Morph Fixer demo in After Effects (demo-spec.js, the morph that
// scene.js previews): "Morph demo", 8 s, the same keyed path twice, "Before" as drawn and
// "After" fixed by MorphFixer.jsx, each with an orange dot on its first point.
//
// Run it from File > Scripts > Run Script File... with MorphFixer.jsx and demo-spec.js next
// to it. It opens a new project: if the current one has unsaved changes, After Effects asks
// first (cancel and nothing happens).
//
// Test mode (the repo's check): set $.global.MORPH_TEST_OUT to a folder. It then also checks
// every key's shape, time and easing against the originals, a second run, a mask path, a
// path with an expression, and that After Effects interpolates the fixed keys the way the
// preview does; it writes ae-log.txt and saves morph-fixer-demo.aep there (render it with
// aerender). After Effects stays open. Every step is guarded: nothing raises a dialog.
(function () {
    var OUT = $.global.MORPH_TEST_OUT || null;
    var here = $.global.MORPH_DIR ? new Folder($.global.MORPH_DIR) : File($.fileName).parent;
    var log = [], fails = 0;
    function note(s) {
        log.push(s);
    }
    function check(what, ok, detail) {
        if (!ok) fails++;
        note((ok ? 'ok   ' : 'FAIL ') + what + (detail !== undefined ? ' · ' + detail : ''));
    }
    function safe(e) {
        try {
            return e.message + (e.line ? ' (line ' + e.line + ')' : '');
        } catch (x) {
            return 'unreadable error';
        }
    }
    function readText(name) {
        var f = new File(here.fsName + '/' + name);
        f.encoding = 'UTF-8';
        f.open('r');
        var s = f.read();
        f.close();
        return s;
    }
    function rgb(c) {
        return [c[0] / 255, c[1] / 255, c[2] / 255];
    }
    function tf(L, mn) {
        return L.property('ADBE Transform Group').property(mn);
    }

    if (!app.newProject()) return;      // AE asks about unsaved work first
    if (OUT) {
        app.beginSuppressDialogs();
        Folder(OUT).create();
    }
    var comp = null, before = null, after = null, D = null, MFm = null, MFx = null;
    try {
        eval(readText('demo-spec.js'));     // $.evalFile would not put MD on $.global
        D = MD;
        $.global.MORPH_NO_UI = true;
        $.evalFile(new File(here.fsName + '/MorphFixer.jsx'));
        MFx = $.global.MorphFixer;
        MFm = $.global.MorphFixerMath;
        app.beginUndoGroup('Morph Fixer demo');
        comp = app.project.items.addComp('Morph demo', D.size[0], D.size[1], 1, D.duration, D.fps);
        comp.layers.addSolid(rgb(D.colors.bg), 'Background', D.size[0], D.size[1], 1, D.duration).locked = true;
        before = shapeLayer(comp, 'Before', D.before);
        after = shapeLayer(comp, 'After', D.after);
        marker(comp, 'Before');
        marker(comp, 'After');
        label(comp, 'Before', D.before[0]);
        label(comp, 'After', D.after[0]);
        var tFix = new Date().getTime();
        var rep = MFx.fix(pathOf(after), { minPoints: D.minPoints });
        note('fix (' + (new Date().getTime() - tFix) + ' ms): ' + MFx.summary(rep));
        comp.openInViewer();
        app.endUndoGroup();
    } catch (e) {
        fails++;
        note('ERROR building the demo: ' + safe(e));
    }

    // a shape layer at `at` whose group "Morph" holds the keyed path and a fill
    function shapeLayer(comp, name, at) {
        var L = comp.layers.addShape();
        L.name = name;
        tf(L, 'ADBE Position').setValue([at[0], at[1], 0]);
        var root = L.property('ADBE Root Vectors Group');
        root.addProperty('ADBE Vector Group').name = 'Morph';
        var vec = function () { return L.property('ADBE Root Vectors Group').property('Morph').property('ADBE Vectors Group'); };
        vec().addProperty('ADBE Vector Shape - Group');
        vec().addProperty('ADBE Vector Graphic - Fill');
        vec().property(2).property('ADBE Vector Fill Color').setValue(rgb(D.colors.shape));
        var p = vec().property(1).property('ADBE Vector Shape');
        for (var k = 0; k < D.keys.length; k++) p.setValueAtTime(D.keys[k][0], MFx.fromMF(D.shapes[D.keys[k][1]]));
        for (k = 1; k <= p.numKeys; k++) {
            p.setInterpolationTypeAtKey(k, KeyframeInterpolationType.BEZIER);
            p.setTemporalEaseAtKey(k, [new KeyframeEase(0, 33.333)], [new KeyframeEase(0, 33.333)]);
        }
        return L;
    }

    function pathOf(L) {
        return L.property('ADBE Root Vectors Group').property('Morph').property('ADBE Vectors Group').property(1).property('ADBE Vector Shape');
    }

    // an orange dot riding the path's first point
    function marker(comp, of) {
        var M = comp.layers.addShape();
        M.name = of + ' start';
        M.property('ADBE Root Vectors Group').addProperty('ADBE Vector Group').name = 'Dot';
        var vec = function () { return M.property('ADBE Root Vectors Group').property('Dot').property('ADBE Vectors Group'); };
        vec().addProperty('ADBE Vector Shape - Ellipse');
        vec().addProperty('ADBE Vector Graphic - Fill');
        vec().property(1).property('ADBE Vector Ellipse Size').setValue([24, 24]);
        vec().property(2).property('ADBE Vector Fill Color').setValue(rgb(D.colors.marker));
        tf(M, 'ADBE Anchor Point').setValue([0, 0, 0]);
        tf(M, 'ADBE Position').expression = 'var L = thisComp.layer(' + '"' + of + '"' + ');\n' +
            'var p = L.content("Morph").content("Path 1").path.points()[0];\n' +
            'var c = L.toComp(p);\n[c[0], c[1]];';
    }

    function label(comp, text, x) {
        var T = comp.layers.addText(text);
        var src = T.property('ADBE Text Properties').property('ADBE Text Document');
        var td = src.value;
        td.fontSize = 46;
        td.fillColor = rgb(D.colors.label);
        try {
            td.font = 'Arial-BoldMT';
        } catch (e) {}
        td.justification = ParagraphJustification.CENTER_JUSTIFY;
        src.setValue(td);
        tf(T, 'ADBE Position').setValue([x, D.labelY, 0]);
    }

    // ---- test mode --------------------------------------------------------------------------

    function keyShapes(p) {
        var out = [];
        for (var k = 1; k <= p.numKeys; k++) out.push(MFx.toMF(p.keyValue(k)));
        return out;
    }

    function maxDiff(A, B) {
        if (A.v.length !== B.v.length) return 1e9;
        var d = 0, k, c;
        for (k = 0; k < A.v.length; k++)
            for (c = 0; c < 2; c++) {
                d = Math.max(d, Math.abs(A.v[k][c] - B.v[k][c]), Math.abs(A.i[k][c] - B.i[k][c]), Math.abs(A.o[k][c] - B.o[k][c]));
            }
        return d;
    }

    function step(label, fn) {
        try {
            fn();
        } catch (e) {
            fails++;
            note('FAIL ' + label + ' threw: ' + safe(e));
        }
    }

    if (OUT && comp && after) {
        var pa = pathOf(after), pb = pathOf(before);
        step('shapes', function () {
            var A = keyShapes(pa), B = keyShapes(pb), n = A[0].v.length, same = true, worst = 0, k;
            for (k = 0; k < A.length; k++) if (A[k].v.length !== n) same = false;
            check('every After key has the same number of points (' + n + ')', same && n >= D.minPoints);
            // the keys stored are exactly what the math computes (test.mjs proves those numbers
            // stay within 0.1 px of the drawn shapes, and that Node computes the same ones)
            var ref = MFm.fix(B, { minPoints: D.minPoints });
            for (k = 0; k < A.length; k++) worst = Math.max(worst, maxDiff(A[k], ref.paths[k]));
            // AE keeps path points as 32-bit floats: ~1e-7 of the coordinate (0.00004 px here)
            check('After Effects stores the keys the math computes (to 32-bit float)', worst < 1e-4, 'largest difference ' + worst);
            check('the rebuild measured every key within 0.1 px of its drawn shape', ref.deviation <= 0.1 && ref.mode === 'smooth', ref.mode + ', ' + ref.deviation + ' px');
            // the keys as After Effects stores them, inputs (Before) then outputs (After), for
            // test.mjs to fix the same inputs in Node and compare (AE rounds points to 32-bit
            // floats, and on a symmetric shape that's enough to pick another, equal, start)
            var lines = [];
            for (k = 0; k < B.length; k++) lines.push(B[k].toSource());
            for (k = 0; k < A.length; k++) lines.push(A[k].toSource());
            var kf = new File(OUT + '/ae-keys.txt');
            kf.encoding = 'UTF-8';
            kf.open('w');
            kf.write(lines.join('\n') + '\n');
            kf.close();
            var orig = [];
            for (k = 0; k < D.keys.length; k++) orig.push(D.shapes[D.keys[k][1]].v.length);
            var bc = [];
            for (k = 0; k < B.length; k++) bc.push(B[k].v.length);
            check('Before is untouched', bc.join(',') === orig.join(','), bc.join(','));
        });
        step('timing', function () {
            var ok = true, k;
            for (k = 1; k <= pa.numKeys; k++) {
                if (Math.abs(pa.keyTime(k) - pb.keyTime(k)) > 1e-9) ok = false;
                if (pa.keyInInterpolationType(k) !== pb.keyInInterpolationType(k)) ok = false;
                if (Math.abs(pa.keyInTemporalEase(k)[0].influence - pb.keyInTemporalEase(k)[0].influence) > 1e-6) ok = false;
                if (Math.abs(pa.keyOutTemporalEase(k)[0].speed - pb.keyOutTemporalEase(k)[0].speed) > 1e-6) ok = false;
            }
            check('key times, interpolation and easing unchanged', ok);
        });
        step('second run', function () {
            var A = keyShapes(pa);
            MFx.fix(pa, { minPoints: D.minPoints });
            var A2 = keyShapes(pa), worst = 0;
            for (var k = 0; k < A.length; k++) worst = Math.max(worst, maxDiff(A[k], A2[k]));
            check('a second run changes nothing', worst < 1e-6, 'largest change ' + worst);
        });
        step('interpolation', function () {
            // AE between two keys with the same points: every vertex and tangent in a line, the
            // time eased (Easy Ease = smoothstep). The preview draws exactly that.
            var A = keyShapes(pa), worst = 0, at = '', k;
            for (k = 1; k < pa.numKeys; k++) {
                var t0 = pa.keyTime(k), t1 = pa.keyTime(k + 1);
                for (var q = 1; q < 4; q++) {
                    var u = q / 4, t = t0 + (t1 - t0) * u, s = u * u * (3 - 2 * u);
                    var got = MFx.toMF(pa.valueAtTime(t, false)), want = MFm.lerp(A[k - 1], A[k], s);
                    var d = maxDiff(got, want);
                    if (d > worst) {
                        worst = d;
                        at = 'key ' + k + ' + ' + u;
                    }
                }
            }
            check('AE interpolates the fixed keys point by point, eased (as the preview does)', worst < 0.05, 'largest difference ' + worst + ' px at ' + at);
        });
        step('marker', function () {
            var m = tf(comp.layer('After start'), 'ADBE Position'), v = null, err = '';
            for (var attempt = 0; attempt < 2 && !v; attempt++) {     // once failed right after a rewrite of the keys
                try {
                    v = m.valueAtTime(2.0, false);
                } catch (e) {
                    err = safe(e);
                }
            }
            check('start dot expression evaluates (on the star\'s first point at 2 s)', v && !m.expressionError && Math.abs(v[0] - 1400) < 1, (v ? v[0] + ', ' + v[1] : 'no value') + (err ? ' · first try: ' + err : '') + ' ' + m.expressionError);
        });
        step('mask', function () {
            var mc = app.project.items.addComp('Mask test', 600, 600, 1, 3, 24);
            var S = mc.layers.addSolid([0.5, 0.5, 0.5], 'Masked', 600, 600, 1, 3);
            var mask = S.property('ADBE Mask Parade').addProperty('ADBE Mask Atom');
            var mp = S.property('ADBE Mask Parade').property(1).property('ADBE Mask Shape');
            var pick = [0, 1, 3];
            for (var k = 0; k < pick.length; k++) {
                var P = MFm.copy(D.shapes[pick[k]]);
                for (var j = 0; j < P.v.length; j++) {
                    P.v[j][0] += 300;
                    P.v[j][1] += 300;
                }
                mp.setValueAtTime(k, MFx.fromMF(P));
            }
            var r = MFx.fix(mp), n = mp.keyValue(1).vertices.length, same = true;
            for (k = 2; k <= mp.numKeys; k++) if (mp.keyValue(k).vertices.length !== n) same = false;
            check('a Mask Path is fixed too', !r.skipped && same, MFx.summary(r));
        });
        step('expression', function () {
            var ec = app.project.items.addComp('Expression test', 400, 400, 1, 2, 24);
            var L = ec.layers.addShape();
            L.property('ADBE Root Vectors Group').addProperty('ADBE Vector Shape - Group');
            var p = L.property('ADBE Root Vectors Group').property(1).property('ADBE Vector Shape');
            p.setValueAtTime(0, MFx.fromMF(D.shapes[0]));
            p.setValueAtTime(1, MFx.fromMF(D.shapes[1]));
            p.expression = 'value';
            var r = MFx.fix(p);
            check('a path with an expression is skipped and reported', !!r.skipped && p.keyValue(1).vertices.length === 4, MFx.summary(r));
        });
        step('targets', function () {
            comp.openInViewer();
            for (var i = 1; i <= comp.numLayers; i++) comp.layer(i).selected = false;
            after.selected = true;
            var t = MFx.targets(comp);
            check('selecting the layer finds its path', t.length === 1, t.length ? MFx.describe(t[0]) : 'none');
            after.selected = false;
        });
        try {
            app.project.save(new File(OUT + '/morph-fixer-demo.aep'));
            note('saved ' + OUT + '/morph-fixer-demo.aep');
        } catch (e2) {
            fails++;
            note('save failed: ' + safe(e2));
        }
        note(fails ? fails + ' check(s) FAILED' : 'all checks pass');
    }
    if (OUT) {
        try {
            app.endSuppressDialogs(false);
        } catch (x) {}
        try {
            var f = new File(OUT + '/ae-log.txt');
            f.encoding = 'UTF-8';
            f.open('w');
            f.write(log.join('\n') + '\n');
            f.close();
        } catch (x2) {}
    } else if (fails) {
        alert(log.join('\n'));
    }
})();
