// make-demo.jsx - builds the Mask Morph Fixer demo in After Effects (demo-spec.js, the morph that
// scene.js previews): "Morph demo", 8 s, the same keyed path twice, "Before" as drawn and
// "After" fixed by "Mask Morph Fixer.jsx", each with an orange dot on its first point.
//
// Run it from File > Scripts > Run Script File... with "Mask Morph Fixer.jsx" and demo-spec.js next
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
    var comp = null, before = null, after = null, D = null, MFm = null, MFx = null, turnComp = null, master = null, asked = null;
    try {
        eval(readText('demo-spec.js'));     // $.evalFile would not put MD on $.global
        D = MD;
        $.global.MORPH_NO_UI = true;
        $.evalFile(new File(here.fsName + '/out/test-build/Mask Morph Fixer.jsx'));     // the test build (build.mjs)
        $.global.MORPH_NO_UI = false;       // $.global lives all session: a panel opened later must build
        MFx = $.global.MorphFixer;
        // tests answer the question before a fix themselves (no dialog); the default goes ahead
        if (OUT) MFx.ask = function (warned, seconds) {
            asked = { warned: warned, seconds: seconds };
            return true;
        };
        MFm = $.global.MorphFixerMath;
        app.beginUndoGroup('Mask Morph Fixer demo');
        var built = demoComp('Morph demo', D.duration, D.shapes, D.keys, { maxPoints: D.maxPoints });
        comp = built.comp;
        before = built.before;
        after = built.after;
        // the turn demo: an F turned a quarter at a time, fixed with turn on
        turnComp = demoComp('Turn demo', D.turn.duration, D.turn.shapes, D.turn.keys, { maxPoints: D.maxPoints, rotate: true }).comp;
        master = app.project.items.addComp('Mask Morph Fixer demo', D.size[0], D.size[1], 1, D.duration + D.turn.duration, D.fps);
        master.layers.add(turnComp).startTime = D.duration;
        master.layers.add(comp).startTime = 0;
        master.openInViewer();
        app.endUndoGroup();
    } catch (e) {
        fails++;
        note('ERROR building the demo: ' + safe(e));
    }

    // a comp with Before (the keys as drawn) and After (fixed with opts), dots and labels
    function demoComp(name, duration, shapes, keys, opts) {
        var c = app.project.items.addComp(name, D.size[0], D.size[1], 1, duration, D.fps);
        c.layers.addSolid(rgb(D.colors.bg), 'Background', D.size[0], D.size[1], 1, duration).locked = true;
        var b = shapeLayer(c, 'Before', D.before, shapes, keys), a = shapeLayer(c, 'After', D.after, shapes, keys);
        marker(c, 'Before');
        marker(c, 'After');
        label(c, 'Before', D.before[0]);
        label(c, 'After', D.after[0]);
        var tFix = new Date().getTime();
        var rep = MFx.fix(pathOf(a), opts);
        note(name + ' fix (' + (new Date().getTime() - tFix) + ' ms): ' + MFx.summary(rep));
        return { comp: c, before: b, after: a, report: rep };
    }

    // a shape layer at `at` whose group "Morph" holds the keyed path and a fill
    function shapeLayer(comp, name, at, shapes, keys) {
        var L = comp.layers.addShape();
        L.name = name;
        tf(L, 'ADBE Position').setValue([at[0], at[1], 0]);
        var root = L.property('ADBE Root Vectors Group');
        root.addProperty('ADBE Vector Group').name = 'Morph';
        var vec = function () { return L.property('ADBE Root Vectors Group').property('Morph').property('ADBE Vectors Group'); };
        vec().addProperty('ADBE Vector Shape - Group');
        vec().property(1).name = 'Outline';     // our own name: AE's own ("Path 1") changes with its language
        vec().addProperty('ADBE Vector Graphic - Fill');
        vec().property(2).property('ADBE Vector Fill Color').setValue(rgb(D.colors.shape));
        var p = vec().property(1).property('ADBE Vector Shape');
        for (var k = 0; k < keys.length; k++) p.setValueAtTime(keys[k][0], MFx.fromMF(shapes[keys[k][1]]));
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
        // path points are in the group's space: through the group's transform, then the layer's
        tf(M, 'ADBE Position').expression = 'var L = thisComp.layer(' + '"' + of + '"' + ');\n' +
            'var g = L.content("Morph").transform;\n' +
            'var p = L.content("Morph").content("Outline").path.points()[0];\n' +
            'var a = g.anchorPoint.value, o = g.position.value, s = g.scale.value[0] / 100, r = g.rotation.value * Math.PI / 180;\n' +
            'var x = (p[0] - a[0]) * s, y = (p[1] - a[1]) * s;\n' +
            'var c = L.toComp([o[0] + x * Math.cos(r) - y * Math.sin(r), o[1] + x * Math.sin(r) + y * Math.cos(r)]);\n' +
            '[c[0], c[1]];';
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
            check('every After key has the same number of points (' + n + ')', same && n <= D.maxPoints);
            // the keys stored are exactly what the math computes (test.mjs proves those numbers
            // stay within 0.1 px of the drawn shapes, and that Node computes the same ones)
            var ref = MFm.fix(B, { maxPoints: D.maxPoints });
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
            MFx.fix(pa, { maxPoints: D.maxPoints });
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
        step('turn', function () {
            var ta = turnComp.layer('After'), g = ta.property('ADBE Root Vectors Group').property('Morph').property('ADBE Vector Transform Group');
            var rot = g.property('ADBE Vector Rotation'), angles = [], k;
            for (k = 1; k <= rot.numKeys; k++) angles.push(Math.round(rot.keyValue(k) * 100) / 100);
            check('turn: the group Rotation is keyed with the path, 0 to 360', rot.numKeys === D.turn.keys.length && Math.abs(rot.keyValue(rot.numKeys) - 360) < 0.5, angles.join(' '));
            // the F's top-left corner (its first point) turned about (10, 0), on the After side
            function ideal(deg) {
                var a = deg * Math.PI / 180, x = -90 - 10, y = -150;
                return [D.after[0] + 10 + x * Math.cos(a) - y * Math.sin(a), D.after[1] + x * Math.sin(a) + y * Math.cos(a)];
            }
            var dot = tf(turnComp.layer('After start'), 'ADBE Position'), raw = tf(turnComp.layer('Before start'), 'ADBE Position');
            var probes = [[0.5, 0], [1.0, 45], [1.5, 90], [2.5, 135], [5.5, 315], [6.0, 360]], worst = 0, at = '';
            for (k = 0; k < probes.length; k++) {
                var v = dot.valueAtTime(probes[k][0], false), w = ideal(probes[k][1]);
                var d = Math.sqrt((v[0] - w[0]) * (v[0] - w[0]) + (v[1] - w[1]) * (v[1] - w[1]));
                if (d > worst) {
                    worst = d;
                    at = probes[k][0] + ' s';
                }
            }
            check('turn: the corner rides the arc of a real turn (keys and halfway)', worst < 0.5, 'worst ' + worst + ' px at ' + at);
            var rv = raw.valueAtTime(1.0, false), rw = ideal(45), bw = [rv[0] - D.before[0] + D.after[0], rv[1]];
            note('turn: halfway through the first quarter, the drawn keys put the corner ' +
                Math.round(Math.sqrt((bw[0] - rw[0]) * (bw[0] - rw[0]) + (bw[1] - rw[1]) * (bw[1] - rw[1]))) + ' px off the arc (straight line)');
        });
        step('panel', function () {
            // the real panel (a palette here), clicked through on fresh copies of Before; the
            // controls are set directly, not through their onChange (which saves the settings)
            var w = MFx.buildUI(null), c = w.controls, runs = [['Smooth', 0, '100'], ['Smooth, max 24', 0, '24'], ['Exact', 1, '100']];
            check('panel: one row (mode, max, Fix, ?) and a status line', c.mode && c.max && c.fix && c.info && c.status && c.mode.items.length === 2,
                'width ' + w.size.width + ' x ' + w.size.height + ' px');
            for (var r = 0; r < runs.length; r++) {
                comp.openInViewer();
                var dup = before.duplicate();
                dup.name = 'Panel test ' + r;
                for (var i = 1; i <= comp.numLayers; i++) comp.layer(i).selected = false;
                dup.selected = true;
                c.mode.selection = runs[r][1];
                c.max.text = runs[r][2];
                c.fix.notify('onClick');
                var res = w.lastResult, rep = res && res.reports[0];
                var ok = rep && !rep.skipped && (runs[r][1] === 1 ? rep.mode === 'exact' && rep.to === 22 : rep.mode === 'smooth' && rep.to <= Number(runs[r][2]));
                check('panel Fix (' + runs[r][0] + '): ' + c.status.text, !!ok, res ? res.detail : 'no result');
                if (runs[r][2] === '24') check('panel: the max shows in the status', /\(max\)/.test(c.status.text), c.status.text);
                dup.remove();
            }
            // turn ticked, on a copy of the turning F
            turnComp.openInViewer();
            var tdup = turnComp.layer('Before').duplicate();
            tdup.name = 'Panel turn test';
            for (i = 1; i <= turnComp.numLayers; i++) turnComp.layer(i).selected = false;
            tdup.selected = true;
            c.mode.selection = 0;
            c.max.text = '100';
            c.turn.value = true;
            c.fix.notify('onClick');
            var tr = w.lastResult && w.lastResult.reports[0];
            check('panel Fix (turn): ' + c.status.text, tr && Math.abs(tr.turned - 360) < 0.5 && /turned/.test(c.status.text), w.lastResult ? w.lastResult.detail : 'no result');
            tdup.remove();
            c.turn.value = false;
            check('panel: floating, titled ' + MFx.name, !w.docked && w.text === MFx.name, w.text);
            // ? opens the guide (a palette, never modal), with the install button when floating
            c.info.notify('onClick');
            var g = w.guide;
            check('panel ?: the guide opens, not modal', g && g.visible && g.type === 'palette', g ? g.type : 'none');
            if (g) {
                check('panel ?: guide size ' + g.size.width + ' x ' + g.size.height + ' px', g.size.width > 360 && g.size.width < 640 && g.size.height < 800);
                check('panel ?: an install button when floating', !!g.controls.install, g.controls.install ? g.controls.install.text : 'none');
                g.close();
            }
            w.close();
            // the docked path: the same panel built into a Panel host (what ScriptUI Panels passes)
            var dockWin = new Window('palette', 'dock test', undefined, { resizeable: true });
            var host = dockWin.add('panel');
            host.preferredSize = [300, 70];
            var dp = MFx.buildUI(host);
            dockWin.layout.layout(true);
            dockWin.show();
            check('panel docked: builds into the Panel host, no window of its own', dp === host && dp.docked && !!dp.controls.fix, 'host ' + host.size.width + ' x ' + host.size.height);
            dp.controls.info.notify('onClick');
            check('panel docked: the guide has no install button', dp.guide && !dp.guide.controls.install);
            if (dp.guide) dp.guide.close();
            dockWin.close();
        });
        step('install', function () {
            // into a scratch folder (the real one is the user's call): created, copied whole
            var dir = new Folder(OUT + '/panels/ScriptUI Panels');
            var res = MFx.install(dir);
            var copy = res.file ? new File(res.file) : null, src = new File(here.fsName + '/out/test-build/' + MFx.name + '.jsx');
            check('install: copies the script as "' + MFx.name + '.jsx"', res.ok && copy && copy.exists && copy.length === src.length &&
                File.decode(copy.name) === MFx.name + '.jsx', res.text + (copy ? ' (' + copy.length + ' of ' + src.length + ' bytes)' : ''));
            res = MFx.install(dir);
            check('install: a second install overwrites (an update)', res.ok && new File(res.file).length === src.length, res.text);
            var real = MFx.panelsFolder();
            check('install: the user panels folder is found', !!real && /After Effects[\/\\]\d+\.\d+[\/\\]Scripts[\/\\]ScriptUI Panels$/.test(real.fsName), real ? real.fsName : 'none');
            var copies = MFx.installedCopies();
            note('install: copies After Effects lists: ' + (copies.length ? copies.join(', ') : 'none'));
            check('install: not installed twice', copies.length <= 1);
        });

        // ---- before a fix: warnings about what depends on the points, the time estimate ----
        function only(L) {
            for (var i = 1; i <= L.containingComp.numLayers; i++) L.containingComp.layer(i).selected = false;
            L.selected = true;
        }
        // what the warnings found, by code: the sentences hold AE's own names, which change with
        // its language, the codes don't
        function kinds(w) {
            var k = [];
            for (var i = 0; w && i < w.length; i++) k = k.concat(w[i].kinds || []);
            return ',' + k.join(',') + ',';
        }
        function items(w) {
            var s = [];
            for (var i = 0; w && i < w.length; i++) s.push(w[i].items.join(' | '));
            return s.join(' || ');
        }
        step('warnings (shape)', function () {
            comp.openInViewer();
            var wd = before.duplicate();
            wd.name = 'Warn test';
            var list = function () { return pathOf(wd).parentProperty.parentProperty; };
            list().addProperty('ADBE Vector Filter - Trim');
            list().addProperty('ADBE Vector Graphic - Stroke');
            list().property(list().numProperties).property('ADBE Vector Stroke Dashes').addProperty('ADBE Vector Stroke Dash 1');
            only(wd);
            MFx.ask = function (warned, seconds) {
                asked = { warned: warned, seconds: seconds };
                return false;
            };
            asked = null;
            var res = MFx.fixSelection({ mode: 'smooth', maxPoints: 100 });
            var said = items(asked && asked.warned);
            check('warn: Trim Paths and dashes after the path are named before fixing', !!asked && /,trim,/.test(kinds(asked.warned)) && /,dashes,/.test(kinds(asked.warned)), said);
            check('warn: Cancel changes nothing', res.cancelled && pathOf(wd).keyValue(1).vertices.length === 4, res.status);
            // a null following the path's first point (as Create Nulls From Paths makes)
            var N = comp.layers.addNull();
            N.name = 'Follows Warn test';
            N.property('ADBE Transform Group').property('ADBE Position').expression =
                'thisComp.layer("Warn test").content("Morph").content("Outline").path.points()[0]';
            only(wd);
            asked = null;
            MFx.fixSelection({ mode: 'smooth', maxPoints: 100 });
            said = items(asked && asked.warned);
            check('warn: an expression reading the points (a null from Create Nulls From Paths)', !!asked && /,expression,/.test(kinds(asked.warned)) && said.indexOf('Follows Warn test') >= 0, said);
            MFx.ask = function (warned, seconds) {
                asked = { warned: warned, seconds: seconds };
                return true;
            };
            only(wd);
            res = MFx.fixSelection({ mode: 'smooth', maxPoints: 100 });
            check('warn: Fix anyway fixes, and the status counts the warnings', res.reports.length === 1 && !res.reports[0].skipped && /3 warnings \(hover\)/.test(res.status) &&
                /You were warned/.test(res.detail), res.status);
            N.remove();
            wd.remove();
        });
        step('warnings (mask)', function () {
            var a = new Shape(), b = new Shape();
            a.vertices = [[100, 100], [300, 100], [300, 300], [100, 300]];
            a.closed = true;
            b.vertices = [[200, 80], [320, 300], [80, 300]];
            b.closed = true;
            var S = comp.layers.addSolid([0.2, 0.2, 0.2], 'Stroke on a mask', 400, 400, 1);
            S.property('ADBE Mask Parade').addProperty('ADBE Mask Atom');
            S.property('ADBE Effect Parade').addProperty('ADBE Stroke');
            var mp = S.property('ADBE Mask Parade').property(1).property('ADBE Mask Shape');
            mp.setValueAtTime(0, a);
            mp.setValueAtTime(1, b);
            var w1 = MFx.needs(S.property('ADBE Mask Parade').property(1).property('ADBE Mask Shape'), comp, []);
            check('warn: an effect using the mask (Stroke)', /,effect,/.test(kinds([w1])), w1.items.join(' | '));
            var T = comp.layers.addText('text on a path');
            T.property('ADBE Mask Parade').addProperty('ADBE Mask Atom');
            var tp = T.property('ADBE Mask Parade').property(1).property('ADBE Mask Shape');
            tp.setValueAtTime(0, a);
            tp.setValueAtTime(1, b);
            T.property('ADBE Text Properties').property('ADBE Text Path Options').property('ADBE Text Path').setValue(1);
            var w2 = MFx.needs(T.property('ADBE Mask Parade').property(1).property('ADBE Mask Shape'), comp, []);
            check('warn: text running along the mask', /,text,/.test(kinds([w2])), w2.items.join(' | '));
            var w3 = MFx.needs(pathOf(after), comp, []);
            check('warn: nothing for a plain path', w3.items.length === 0, w3.items.join(' | '));
            T.remove();
            S.remove();
        });
        step('estimate', function () {
            // keyed blobs like bench/ae-bench.jsx: K keys of about n points
            var seed = 11;
            function rnd() {
                seed = (seed * 16807) % 2147483647;
                return seed / 2147483647;
            }
            function blobLayer(name, K, n) {
                var L = comp.layers.addShape();
                L.name = name;
                L.property('ADBE Root Vectors Group').addProperty('ADBE Vector Group');
                L.property('ADBE Root Vectors Group').property(1).property('ADBE Vectors Group').addProperty('ADBE Vector Shape - Group');
                var p = L.property('ADBE Root Vectors Group').property(1).property('ADBE Vectors Group').property(1).property('ADBE Vector Shape');
                for (var k = 0; k < K; k++) {
                    var s = new Shape(), v = [], ii = [], oo = [], m = Math.max(4, Math.round(n * (0.6 + 0.8 * rnd()))), ph = rnd() * 6;
                    for (var j = 0; j < m; j++) {
                        var t = ph + (j / m) * Math.PI * 2, r = 150 * (1 + 0.25 * Math.sin(3 * t + ph) + 0.1 * (rnd() - 0.5)), h = (Math.PI * 2 * r) / m / 3;
                        v.push([r * Math.cos(t), r * Math.sin(t)]);
                        ii.push([h * Math.sin(t), -h * Math.cos(t)]);
                        oo.push([-h * Math.sin(t), h * Math.cos(t)]);
                    }
                    s.vertices = v;
                    s.inTangents = ii;
                    s.outTangents = oo;
                    s.closed = true;
                    p.setValueAtTime(k * 0.25, s);
                }
                return L;
            }
            var big = blobLayer('Big job', 12, 60);
            only(big);
            MFx.ask = function (warned, seconds) {
                asked = { warned: warned, seconds: seconds };
                return false;
            };
            asked = null;
            var res = MFx.fixSelection({ mode: 'smooth', maxPoints: 100 });
            check('estimate: a long job (12 keys of ~60 points) asks first, with the time', !!asked && asked.seconds > 10 && res.cancelled,
                asked ? 'about ' + Math.round(asked.seconds) + ' s' : 'not asked');
            big.remove();
            // a mid job, estimated then timed for real: the estimate is within about 2x
            var mid = blobLayer('Mid job', 6, 16);
            only(mid);
            MFx.ask = function (warned, seconds) {
                asked = { warned: warned, seconds: seconds };
                return true;
            };
            var est = MFx.estimate([mid.property('ADBE Root Vectors Group').property(1).property('ADBE Vectors Group').property(1).property('ADBE Vector Shape')], { mode: 'smooth', maxPoints: 100 });
            var t0 = new Date().getTime();
            res = MFx.fixSelection({ mode: 'smooth', maxPoints: 100 });
            var took = (new Date().getTime() - t0) / 1000;
            check('estimate: within about 2x of the real time (6 keys of ~16 points)', took / est > 0.4 && took / est < 2.5,
                'estimated ' + est.toFixed(1) + ' s, took ' + took.toFixed(1) + ' s, this machine at ' + MFx.speed().toFixed(2) + 'x the reference');
            mid.remove();
        });
        step('on screen', function () {
            var sd = before.duplicate();
            sd.name = 'Scaled 200';
            sd.property('ADBE Transform Group').property('ADBE Scale').setValue([200, 200]);
            var r = MFx.fix(pathOf(sd), { maxPoints: 200 });
            check('on screen: a layer at 200 % is fixed within 0.1 comp px', r.scale === 2 && r.deviation <= 0.1 && r.pathDeviation <= 0.05, MFx.summary(r));
            sd.remove();
        });
        step('narrow dock and theme', function () {
            var dockWin = new Window('palette', 'narrow test', undefined, { resizeable: true });
            var host = dockWin.add('panel');
            host.preferredSize = [420, 90];
            var dp = MFx.buildUI(host);
            dockWin.layout.layout(true);
            dockWin.show();
            dp.fitWidth(170);
            var c = dp.controls, two = dp.twoRows && c.bar.orientation === 'column' && c.fix.windowBounds.top > c.mode.windowBounds.top + 10;
            dp.fitWidth(420);
            check('panel: breaks into two rows when docked narrow, one row when wide', two && !dp.twoRows && c.bar.orientation === 'row');
            dockWin.close();
            var th = MFx.theme();
            check('theme: read from After Effects (' + th + '), headings ' + (th === 'light' ? 'black' : 'white'),
                /^(light|dark|darkest)$/.test(th) && MFx.headingColor().join() === (th === 'light' ? '0,0,0' : '1,1,1'));
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
