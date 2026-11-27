// make-demo.jsx - builds the Constant Speed Draw-On demo in After Effects (demo-spec.js, the
// drawing scene.js previews):
//   "Same duration"   every stroke's Trim Paths keyed End 0 -> 100 % over the same 0.34 s, one
//                     after another, the way keying by hand goes
//   "Constant speed"  the same drawing rigged by "Constant Speed Draw-On.jsx": One after
//                     another, fitted to the same total time
//   "Draw-On demo"    the two side by side
//
// Run it from File > Scripts > Run Script File... with "Constant Speed Draw-On.jsx" (the test
// build in out/test-build/) and demo-spec.js next to it. It opens a new project: if the current
// one has unsaved changes, After Effects asks first.
//
// Test mode (the repo's check): set $.global.DRAWON_TEST_OUT to a folder. It then also builds a
// speed test (straight lines in plain, scaled, stretched, parented, skewed and 3D layers) and
// measures in AE how fast each pen tip moves, from the trimmed layers' boxes; it checks the
// lengths against the spec, Update, a renamed controls layer, Remove (a stroke, then the whole
// rig), the warning before switching a Trim Paths off (cancelled, then accepted), a selected
// Trim Paths, My own start times, the panel and the guide's size. It writes ae-log.txt and
// saves draw-on-demo.aep there (render it with aerender). Every step is guarded: nothing
// raises a dialog.
(function () {
    var OUT = $.global.DRAWON_TEST_OUT || null;
    var here = $.global.DRAWON_DIR ? new Folder($.global.DRAWON_DIR) : File($.fileName).parent;
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
            return String(e.message) + (e.line ? ' (line ' + e.line + ')' : '');
        } catch (x) {
            return 'unreadable error';
        }
    }
    function flush() {
        if (!OUT) return;
        var f = new File(OUT + '/ae-log.txt');
        f.encoding = 'UTF-8';
        f.open('w');
        f.write(log.join('\n') + '\n\n' + (fails ? fails + ' FAILED' : 'all passed') + '\n');
        f.close();
    }
    function step(name, f) {
        try {
            f();
        } catch (e) {
            fails++;
            note('FAIL ' + name + ' threw: ' + safe(e));
        }
        flush();
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
    function r3(x) {
        return Math.round(x * 1000) / 1000;
    }

    if (!app.newProject()) return;      // AE asks about unsaved work first
    if (OUT) {
        app.beginSuppressDialogs();
        Folder(OUT).create();
    }
    var D = null, DO = null, DGx = null, before = null, after = null, demo = null, res = null;
    step('load', function () {
        eval(readText('demo-spec.js'));     // $.evalFile would not put DS on $.global
        D = DS;
        $.global.DRAWON_NO_UI = true;
        $.evalFile(new File(here.fsName + '/out/test-build/Constant Speed Draw-On.jsx'));     // the test build (build.mjs)
        $.global.DRAWON_NO_UI = false;      // $.global lives all session: a panel opened later must build
        DO = $.global.DrawOn;
        DGx = $.global.DrawOnGeom;
        DO.ask = function () {
            return true;                    // tests answer the question themselves (no dialog)
        };
        note('After Effects ' + app.version + ', ' + DO.name + ' ' + DO.version);
    });

    // ---- building the drawing ----
    function shapeLayer(comp, spec) {
        var L = comp.layers.addShape(), k, j;
        L.name = spec.name;
        var root = L.property('ADBE Root Vectors Group');
        for (k = 0; k < spec.groups.length; k++) root.addProperty('ADBE Vector Group');
        for (k = 0; k < spec.groups.length; k++) {
            var g = spec.groups[k], grp = L.property('ADBE Root Vectors Group').property(k + 1);
            grp.name = g.name;
            var n = g.paths ? g.paths.length : g.shapes.length;
            for (j = 0; j < n; j++) {
                var kind = g.paths ? 'ADBE Vector Shape - Group' : (g.shapes[j].kind === 'ellipse' ? 'ADBE Vector Shape - Ellipse' : 'ADBE Vector Shape - Star');
                L.property('ADBE Root Vectors Group').property(k + 1).property('ADBE Vectors Group').addProperty(kind);
            }
            L.property('ADBE Root Vectors Group').property(k + 1).property('ADBE Vectors Group').addProperty('ADBE Vector Graphic - Stroke');
            var vec = L.property('ADBE Root Vectors Group').property(k + 1).property('ADBE Vectors Group');
            for (j = 0; j < n; j++) {
                var p = vec.property(j + 1);
                p.name = g.paths ? (j === 0 ? 'Outline' : 'Hole ' + j) : g.shapes[j].kind;
                if (g.paths) {
                    var s = new Shape();
                    s.vertices = g.paths[j].v;
                    s.inTangents = g.paths[j].i;
                    s.outTangents = g.paths[j].o;
                    s.closed = g.paths[j].closed;
                    var target = vec.property(j + 1), sh = target ? target.property('ADBE Vector Shape') : null;
                    if (!sh) throw new Error(spec.name + ' group ' + (k + 1) + ' item ' + (j + 1) + ': ' + (target ? target.matchName : 'none') + ' of ' + vec.numProperties);
                    sh.setValue(s);
                } else if (g.shapes[j].kind === 'ellipse') {
                    vec.property(j + 1).property('ADBE Vector Ellipse Size').setValue(g.shapes[j].size);
                    vec.property(j + 1).property('ADBE Vector Ellipse Position').setValue(g.shapes[j].position);
                } else {
                    var st = vec.property(j + 1);
                    st.property('ADBE Vector Star Points').setValue(g.shapes[j].points);
                    st.property('ADBE Vector Star Inner Radius').setValue(g.shapes[j].inner);
                    st.property('ADBE Vector Star Outer Radius').setValue(g.shapes[j].outer);
                    st.property('ADBE Vector Star Rotation').setValue(g.shapes[j].rotation);
                    st.property('ADBE Vector Star Position').setValue(g.shapes[j].position);
                }
            }
            var stroke = vec.property(n + 1);
            stroke.property('ADBE Vector Stroke Color').setValue(rgb(spec.color));
            stroke.property('ADBE Vector Stroke Width').setValue(spec.width);
            stroke.property('ADBE Vector Stroke Line Cap').setValue(2);
            stroke.property('ADBE Vector Stroke Line Join').setValue(2);
            if (g.transform) {
                var t = L.property('ADBE Root Vectors Group').property(k + 1).property('ADBE Vector Transform Group');
                t.property('ADBE Vector Anchor').setValue(g.transform.a);
                t.property('ADBE Vector Position').setValue(g.transform.p);
                t.property('ADBE Vector Scale').setValue(g.transform.s);
                t.property('ADBE Vector Skew').setValue(g.transform.k);
                t.property('ADBE Vector Skew Axis').setValue(g.transform.ka);
                t.property('ADBE Vector Rotation').setValue(g.transform.r);
            }
        }
        tf(L, 'ADBE Anchor Point').setValue([0, 0]);
        tf(L, 'ADBE Position').setValue(spec.position);
        tf(L, 'ADBE Scale').setValue(spec.scale);
        tf(L, 'ADBE Rotate Z').setValue(spec.rotation);
        return L;
    }
    function trimOf(L, k) {
        var vec = L.property('ADBE Root Vectors Group').property(k).property('ADBE Vectors Group');
        for (var j = vec.numProperties; j >= 1; j--) if (vec.property(j).matchName === 'ADBE Vector Filter - Trim') return vec.property(j);
        return null;
    }
    function addTrim(L, k, keys) {
        L.property('ADBE Root Vectors Group').property(k).property('ADBE Vectors Group').addProperty('ADBE Vector Filter - Trim');
        var E = trimOf(L, k).property('ADBE Vector Trim End');
        E.setValueAtTime(keys[0][0], keys[0][1]);
        E.setValueAtTime(keys[1][0], keys[1][1]);
    }
    // the drawing in a new comp: spec layers top to bottom in the timeline (Word first)
    function buildDrawing(name, keyAll) {
        var comp = app.project.items.addComp(name, D.size[0], D.size[1], 1, D.duration, D.fps);
        comp.bgColor = rgb(D.bg);
        var k, layers = {}, n = 0;
        for (k = D.layers.length - 1; k >= 0; k--) layers[D.layers[k].name] = shapeLayer(comp, D.layers[k]);
        for (k = 0; k < D.nulls.length; k++) {
            var N = comp.layers.addNull();
            N.name = D.nulls[k].name;
            tf(N, 'ADBE Position').setValue(D.nulls[k].position);
            tf(N, 'ADBE Scale').setValue(D.nulls[k].scale);
            tf(N, 'ADBE Rotate Z').setValue(D.nulls[k].rotation);
            N.moveToEnd();
            layers[N.name] = N;
        }
        // setParentWithJump keeps the child's own values: assigning .parent compensates them like
        // the pick-whip, so the child would stay where it was instead of following the spec
        for (k = 0; k < D.layers.length; k++) if (D.layers[k].parent) layers[D.layers[k].name].setParentWithJump(layers[D.layers[k].parent]);
        for (k = 0; k < D.layers.length; k++) {
            for (var g = 0; g < D.layers[k].groups.length; g++, n++) {
                var G = D.layers[k].groups[g];
                if (keyAll) addTrim(layers[D.layers[k].name], g + 1, [[D.sameDuration.start + n * D.sameDuration.each, 0], [D.sameDuration.start + (n + 1) * D.sameDuration.each, 100]]);
                else if (G.trimKeys) addTrim(layers[D.layers[k].name], g + 1, G.trimKeys);
            }
        }
        return { comp: comp, layers: layers, strokes: n };
    }
    function selectOnly(comp, list) {
        comp.openInViewer();
        for (var i = 1; i <= comp.numLayers; i++) comp.layer(i).selected = false;
        for (i = 0; i < list.length; i++) list[i].selected = true;
    }
    function shapeLayers(comp) {
        var out = [];
        for (var i = 1; i <= comp.numLayers; i++) if (comp.layer(i) instanceof ShapeLayer) out.push(comp.layer(i));
        return out;
    }
    function setControl(ctl, key, v) {
        ctl.property('ADBE Effect Parade').property(DO.CTL[key]).property(1).setValue(v);
    }
    function controlValue(ctl, key, t) {
        return ctl.property('ADBE Effect Parade').property(DO.CTL[key]).property(1).valueAtTime(t, false);
    }
    // every Start/End expression of a rig's trims in a comp, as text, for comparisons
    function rigTexts(comp) {
        var out = [];
        function walk(list) {
            for (var k = 1; k <= list.numProperties; k++) {
                var p = list.property(k);
                if (p.matchName === 'ADBE Vector Group') walk(p.property('ADBE Vectors Group'));
                else if (p.matchName === 'ADBE Vector Filter - Trim') out.push(p.property('ADBE Vector Trim Start').expression + '\n' + p.property('ADBE Vector Trim End').expression);
            }
        }
        for (var l = 1; l <= comp.numLayers; l++) if (comp.layer(l) instanceof ShapeLayer) walk(comp.layer(l).property('ADBE Root Vectors Group'));
        return out.join('\n----\n');
    }
    // errors in the rig's expressions (evaluated first: AE fills expressionError when it runs one)
    function expressionErrors(comp, t) {
        var bad = [];
        function look(p, where) {
            if (p.expression === '') return;
            try {
                p.valueAtTime(t, false);
            } catch (e) {}
            if (!p.expressionEnabled || p.expressionError !== '') bad.push(where + ': ' + (p.expressionError || 'switched off'));
        }
        function walk(list, where) {
            for (var k = 1; k <= list.numProperties; k++) {
                var p = list.property(k);
                if (p.matchName === 'ADBE Vector Group') walk(p.property('ADBE Vectors Group'), where + ' > ' + p.name);
                else if (p.matchName === 'ADBE Vector Filter - Trim') {
                    look(p.property('ADBE Vector Trim Start'), where + ' Start');
                    look(p.property('ADBE Vector Trim End'), where + ' End');
                }
            }
        }
        for (var l = 1; l <= comp.numLayers; l++) {
            var L = comp.layer(l);
            if (L instanceof ShapeLayer) walk(L.property('ADBE Root Vectors Group'), L.name);
            var fx = L.property('ADBE Effect Parade');
            for (var e = 1; fx && e <= fx.numProperties; e++) if (fx.property(e).numProperties >= 1 && fx.property(e).property(1).canSetExpression) look(fx.property(e).property(1), L.name + ' > ' + fx.property(e).name);
        }
        return bad;
    }
    // comp points of [layer, layer-space point, time] triples, through one probe expression
    function toCompMany(comp, list) {
        var probe = comp.layers.addText('probe'), src = ['var o = [], q;'], k;
        try {
            for (k = 0; k < list.length; k++) src.push('q = thisComp.layer(' + list[k][0].index + ').toComp([' + list[k][1][0] + ', ' + list[k][1][1] + '], ' + list[k][2] + '); o.push(q[0], q[1]);');
            src.push('o.join(",");');
            var st = probe.property('ADBE Text Properties').property('ADBE Text Document');
            st.expression = src.join('\n');
            var parts = String(st.valueAtTime(0, false).text).split(','), out = [];
            for (k = 0; k < list.length; k++) out.push([Number(parts[2 * k]), Number(parts[2 * k + 1])]);
            return out;
        } finally {
            probe.remove();
        }
    }

    step('same duration', function () {
        before = buildDrawing('Same duration', true);
        check('Same duration: ' + before.strokes + ' strokes keyed', before.strokes === 13);
    });
    step('constant speed', function () {
        after = buildDrawing('Constant speed', false);
        selectOnly(after.comp, shapeLayers(after.comp));
        res = DO.apply();
        note('Apply: ' + res.status);
        check('Apply rigs all 13 strokes', res.strokes && res.strokes.length === 13, res.status + ' / ' + res.detail);
        var ctl = res.controls;
        setControl(ctl, 'fit', 1);
        setControl(ctl, 'duration', 13 * D.sameDuration.each);
        setControl(ctl, 'start', D.sameDuration.start);
        check('the default timing is One after another (not every stroke was keyed)', controlValue(ctl, 'mode', 0) === 2, controlValue(ctl, 'mode', 0));
        var bad = expressionErrors(after.comp, 1);
        check('no expression errors after Apply', bad.length === 0, bad.join('; '));
        check('Drawing time = the fitted duration', Math.abs(controlValue(ctl, 'total', 0) - 13 * D.sameDuration.each) < 1e-6, controlValue(ctl, 'total', 0));
        note('speed used ' + r3(controlValue(ctl, 'speedUsed', 0)) + ' px/s, drawing time ' + r3(controlValue(ctl, 'total', 0)) + ' s');
    });

    // the lengths the script measured through AE's transforms and toComp, against the same
    // drawing composed in plain math from the spec (layer, parent, group transforms)
    step('lengths', function () {
        var byName = {}, k, g, expect = [];
        for (k = 0; k < D.nulls.length; k++) byName[D.nulls[k].name] = D.nulls[k];
        for (k = 0; k < D.layers.length; k++) byName[D.layers[k].name] = D.layers[k];
        function layerM(L) {
            var c = Math.cos(L.rotation * Math.PI / 180), s = Math.sin(L.rotation * Math.PI / 180);
            var M = [c * L.scale[0] / 100, -s * L.scale[1] / 100, s * L.scale[0] / 100, c * L.scale[1] / 100, L.position[0], L.position[1]];
            return L.parent ? DGx.mul(layerM(byName[L.parent]), M) : M;
        }
        for (k = 0; k < D.layers.length; k++) {
            var ML = layerM(D.layers[k]);
            for (g = 0; g < D.layers[k].groups.length; g++) {
                var G = D.layers[k].groups[g], M = G.transform ? DGx.mul(ML, DGx.groupMatrix(G.transform)) : ML, items = [];
                if (G.paths) for (var j = 0; j < G.paths.length; j++) items.push({ P: G.paths[j], M: M });
                else items.push({ P: G.shapes[0].kind === 'ellipse' ? DGx.ellipse(G.shapes[0].size, G.shapes[0].position, 1) : DGx.star(1, G.shapes[0].points, G.shapes[0].position, G.shapes[0].rotation, G.shapes[0].inner, G.shapes[0].outer, 1), M: M });
                expect.push(DGx.measure(items).len);
            }
        }
        var got = [];
        for (k = 0; k < res.strokes.length; k++) got[res.strokes[k].stack] = res.strokes[k].m.len;
        var worst = 0, lines = [];
        for (k = 0; k < expect.length; k++) {
            worst = Math.max(worst, Math.abs(got[k] - expect[k]) / expect[k]);
            lines.push(r3(got[k]));
        }
        check('lengths measured in AE = the spec composed in plain math (worst ' + r3(worst * 100) + ' %)', worst < 0.0005, lines.join(', '));
        var stretched = 0;
        for (k = 0; k < res.strokes.length; k++) if (res.strokes[k].m.map) stretched++;
        check('only the lasso (a stretched group) carries a stretch table', stretched === 1, stretched);
    });

    // the pen speed measured in AE: straight lines whose drawn part is read from the layer's box
    // (sourceRectAtTime, trims included) and placed in the comp by toComp
    step('speed test', function () {
        var comp = app.project.items.addComp('Speed test', 1920, 1080, 1, 4, 24), k;
        var mover = comp.layers.addNull();
        mover.name = 'Mover';
        tf(mover, 'ADBE Position').setValue([960, 900]);
        tf(mover, 'ADBE Scale').setValue([80, 80]);
        tf(mover, 'ADBE Rotate Z').setValue(-20);
        var cases = [
            { name: 'plain', pos: [960, 120] },
            { name: 'layer 50 %', pos: [960, 240], scale: [50, 50] },
            { name: 'layer 150 x 70 %, turned', pos: [960, 380], scale: [150, 70], rot: 30 },
            { name: 'parented', pos: [0, -600], parent: true },
            { name: 'group stretched and skewed', pos: [960, 620], group: { a: [0, 0], p: [0, 0], s: [220, 60], k: 25, ka: 10, r: 15 } },
            { name: '3D, turned 50 deg', pos: [960, 760], threeD: 50 },
            { name: 'two paths in a group', pos: [960, 1000], second: true }
        ];
        var line = new Shape();
        line.vertices = [[-200, 0], [200, 0]];
        line.inTangents = [[0, 0], [0, 0]];
        line.outTangents = [[0, 0], [0, 0]];
        line.closed = false;
        var layers = [];
        for (k = cases.length - 1; k >= 0; k--) {
            var c = cases[k], L = comp.layers.addShape();
            L.name = c.name;
            var vec = L.property('ADBE Root Vectors Group').addProperty('ADBE Vector Group').property('ADBE Vectors Group');
            vec.addProperty('ADBE Vector Shape - Group');
            if (c.second) vec.addProperty('ADBE Vector Shape - Group');
            vec.addProperty('ADBE Vector Graphic - Stroke');
            vec = L.property('ADBE Root Vectors Group').property(1).property('ADBE Vectors Group');
            vec.property(1).property('ADBE Vector Shape').setValue(line);
            if (c.second) {
                // a second line 100 px long, below the first, drawn after it (Individually)
                var l2 = new Shape();
                l2.vertices = [[-200, 30], [-100, 30]];
                l2.inTangents = [[0, 0], [0, 0]];
                l2.outTangents = [[0, 0], [0, 0]];
                l2.closed = false;
                vec.property(2).property('ADBE Vector Shape').setValue(l2);
            }
            if (c.group) {
                var t = L.property('ADBE Root Vectors Group').property(1).property('ADBE Vector Transform Group');
                t.property('ADBE Vector Scale').setValue(c.group.s);
                t.property('ADBE Vector Skew').setValue(c.group.k);
                t.property('ADBE Vector Skew Axis').setValue(c.group.ka);
                t.property('ADBE Vector Rotation').setValue(c.group.r);
            }
            if (c.threeD) {
                L.threeDLayer = true;
                tf(L, 'ADBE Rotate Y').setValue(c.threeD);
            }
            tf(L, 'ADBE Anchor Point').setValue(c.threeD ? [0, 0, 0] : [0, 0]);
            tf(L, 'ADBE Position').setValue(c.threeD ? [c.pos[0], c.pos[1], 0] : c.pos);
            if (c.scale) tf(L, 'ADBE Scale').setValue(c.scale);
            if (c.rot) tf(L, 'ADBE Rotate Z').setValue(c.rot);
            if (c.parent) L.setParentWithJump(mover);
            layers.unshift(L);
        }
        selectOnly(comp, layers);
        var r = DO.apply();
        check('speed test: Apply rigs ' + cases.length + ' strokes', r.strokes && r.strokes.length === cases.length, r.status);
        setControl(r.controls, 'mode', 1);          // Together: every line starts at once
        setControl(r.controls, 'start', 0.5);
        setControl(r.controls, 'speed', 300);
        var v = controlValue(r.controls, 'speedUsed', 0), worst = 0, rows = [];
        // where each line starts in its layer: (-200, 0) through its group's transform
        for (k = 0; k < cases.length; k++) {
            var Lk = layers[k], A = cases[k].group ? DGx.apply(DGx.groupMatrix(cases[k].group), [-200, 0]) : [-200, 0];
            var len = 0;
            for (var s = 0; s < r.strokes.length; s++) if (r.strokes[s].layer.index === Lk.index) len = r.strokes[s].m.len;
            var t0 = 0.5, t1 = t0 + len / v, samples = [], times = [];
            for (var tt = t0 + 0.06; tt < t1 - 0.06 && times.length < 12; tt += 0.07) {
                // the first line only (two paths: the second starts when the first ends)
                var lim = cases[k].second ? t0 + (400 / 500) * (t1 - t0) - 0.06 : t1 - 0.06;
                if (tt > lim) break;
                var box = Lk.sourceRectAtTime(tt, false);
                // the tip is the corner of the drawn part's box away from the start (with two
                // paths, the second one's first point is in the box too: the line is level there)
                var tip = [Math.abs(box.left - A[0]) < 0.01 ? box.left + box.width : box.left, Math.abs(box.top - A[1]) < 0.01 ? box.top + box.height : box.top];
                if (cases[k].second) tip[1] = A[1];
                samples.push([Lk, tip, tt]);
                times.push(tt);
            }
            var pts = toCompMany(comp, samples), speeds = [];
            for (var q = 1; q < pts.length; q++) {
                var dx = pts[q][0] - pts[q - 1][0], dy = pts[q][1] - pts[q - 1][1];
                speeds.push(Math.sqrt(dx * dx + dy * dy) / (times[q] - times[q - 1]));
            }
            var lo = 1e9, hi = 0;
            for (q = 0; q < speeds.length; q++) {
                lo = Math.min(lo, speeds[q]);
                hi = Math.max(hi, speeds[q]);
                worst = Math.max(worst, Math.abs(speeds[q] - v) / v);
            }
            rows.push(cases[k].name + ' ' + r3(len) + ' px: ' + r3(lo) + '-' + r3(hi) + ' px/s');
        }
        note('speed test at ' + r3(v) + ' px/s:\n     ' + rows.join('\n     '));
        check('every pen tip moves at the speed, in every layer (worst ' + r3(worst * 100) + ' %)', worst < 0.005, r3(worst * 100) + ' %');
        var bad = expressionErrors(comp, 1);
        check('speed test: no expression errors', bad.length === 0, bad.join('; '));
    });

    step('update', function () {
        var textBefore = rigTexts(after.comp);
        selectOnly(after.comp, []);
        var r = DO.update();
        note('Update: ' + r.status);
        check('Update with nothing moved rewrites nothing', rigTexts(after.comp) === textBefore);
    });

    step('rename', function () {
        var ctl = DO.controlsOf(after.comp, res.rig), Lw = after.layers.Word;
        var T = trimOf(Lw, 1), v0 = T.property('ADBE Vector Trim End').valueAtTime(1.0, false);
        ctl.name = 'Renamed controls';
        T = trimOf(Lw, 1);
        var v1 = T.property('ADBE Vector Trim End').valueAtTime(1.0, false);
        check('renaming the controls layer changes nothing (Layer Controls, not names)', v0 === v1 && expressionErrors(after.comp, 1).length === 0, v0 + ' / ' + v1);
        ctl.name = res.rig + ' Controls';
    });

    // the comp shown side by side
    step('demo comp', function () {
        demo = app.project.items.addComp('Draw-On demo', 1920, 1080, 1, D.duration, D.fps);
        demo.bgColor = rgb(D.bg);
        function label(text, x, y, size, c) {
            var T = demo.layers.addText(text), doc = T.property('ADBE Text Properties').property('ADBE Text Document').value;
            doc.resetCharStyle();
            doc.fontSize = size;
            doc.fillColor = rgb(c);
            try {
                doc.font = 'SegoePrint';
            } catch (e) {}
            doc.justification = ParagraphJustification.CENTER_JUSTIFY;
            T.property('ADBE Text Properties').property('ADBE Text Document').setValue(doc);
            tf(T, 'ADBE Position').setValue([x, y]);
            return T;
        }
        var a = demo.layers.add(before.comp), b = demo.layers.add(after.comp);
        tf(a, 'ADBE Scale').setValue([50, 50]);
        tf(a, 'ADBE Position').setValue([480, 540]);
        tf(b, 'ADBE Scale').setValue([50, 50]);
        tf(b, 'ADBE Position').setValue([1440, 540]);
        var line = demo.layers.addShape();
        line.name = 'Divider';
        var vec = line.property('ADBE Root Vectors Group').addProperty('ADBE Vector Group').property('ADBE Vectors Group');
        vec.addProperty('ADBE Vector Shape - Rect');
        vec.addProperty('ADBE Vector Graphic - Fill');
        vec = line.property('ADBE Root Vectors Group').property(1).property('ADBE Vectors Group');
        vec.property(1).property('ADBE Vector Rect Size').setValue([4, 620]);
        vec.property(2).property('ADBE Vector Fill Color').setValue([1, 1, 1]);
        vec.property(2).property('ADBE Vector Fill Opacity').setValue(12);
        tf(line, 'ADBE Anchor Point').setValue([0, 0]);
        tf(line, 'ADBE Position').setValue([960, 540]);
        label('Same duration', 480, 210, 50, [200, 205, 225]);
        label('Constant speed', 1440, 210, 50, [200, 205, 225]);
        label('every stroke 0.34 s', 480, 900, 28, [140, 146, 170]);
        label('every stroke ' + Math.round(controlValue(res.controls, 'speedUsed', 0)) + ' px/s', 1440, 900, 28, [140, 146, 170]);
        demo.openInViewer();
    });

    // My own start times: the star's own keys (0.4 s -> 1.6 s) set when it starts
    step('own start times', function () {
        var dup = buildDrawing('My own start times', false), comp = dup.comp;
        selectOnly(comp, [dup.layers.Star]);
        var r = DO.apply();
        check('a stroke keyed by the designer: My own start times is the default', controlValue(r.controls, 'mode', 0) === 4, controlValue(r.controls, 'mode', 0));
        var v = controlValue(r.controls, 'speedUsed', 0), len = r.strokes[0].m.len, T = trimOf(dup.layers.Star, 1);
        // its own pen speed: the star drew its length in 1.2 s (rounded to two figures)
        check('the default speed is the designer\'s own (' + r3(v) + ' px/s for ' + r3(len) + ' px in 1.2 s)', Math.abs(v - len / 1.2) / (len / 1.2) < 0.05);
        var mid = T.property('ADBE Vector Trim End').valueAtTime(0.4 + len / v / 2, false);
        check('it starts at its first key: half drawn at 0.4 s + half its time', Math.abs(mid - 50) < 0.01, mid);
        check('nothing drawn before its first key', T.property('ADBE Vector Trim End').valueAtTime(0.35, false) === 0);
    });

    // the warning before switching a designer's Trim Paths off: cancelled, then accepted; a
    // selected Trim Paths is one stroke as it is
    step('root trim', function () {
        var comp = app.project.items.addComp('Root trim', 1920, 1080, 1, 4, 24);
        function make(name) {
            var L = comp.layers.addShape();
            L.name = name;
            var root = L.property('ADBE Root Vectors Group');
            root.addProperty('ADBE Vector Group');
            root.addProperty('ADBE Vector Group');
            root.addProperty('ADBE Vector Filter - Trim');
            for (var k = 1; k <= 2; k++) {
                var vec = L.property('ADBE Root Vectors Group').property(k).property('ADBE Vectors Group');
                vec.addProperty('ADBE Vector Shape - Group');
                vec.addProperty('ADBE Vector Graphic - Stroke');
                var s = new Shape();
                s.vertices = [[0, 100 * k], [k === 1 ? 200 : 600, 100 * k]];
                s.inTangents = [[0, 0], [0, 0]];
                s.outTangents = [[0, 0], [0, 0]];
                s.closed = false;
                L.property('ADBE Root Vectors Group').property(k).property('ADBE Vectors Group').property(1).property('ADBE Vector Shape').setValue(s);
            }
            var T = L.property('ADBE Root Vectors Group').property(3);
            T.property('ADBE Vector Trim End').setValueAtTime(0, 0);
            T.property('ADBE Vector Trim End').setValueAtTime(2, 100);
            return L;
        }
        var A = make('Groups under one trim'), B = make('Trim selected');
        var asked = null;
        DO.ask = function (warned) {
            asked = warned;
            return false;
        };
        selectOnly(comp, [A]);
        var n0 = comp.numLayers, r = DO.apply();
        var kinds = asked && asked[0] ? asked[0].kinds.join(',') : '';
        check('a Trim Paths over the strokes: asked first (code off)', kinds.indexOf('off') >= 0, kinds);
        var told = 0;
        for (var w = 0; asked && w < asked.length; w++) told += asked[w].items.length;
        check('one Trim Paths cutting two strokes is one warning, not one per stroke', told === 1, told);
        check('cancelled: nothing changed', r.cancelled && comp.numLayers === n0 && A.property('ADBE Root Vectors Group').property(3).enabled === true && A.property('ADBE Root Vectors Group').property(1).property('ADBE Vectors Group').numProperties === 2);
        DO.ask = function () {
            return true;
        };
        selectOnly(comp, [A]);
        r = DO.apply();
        var RT = A.property('ADBE Root Vectors Group').property(3);
        check('accepted: one stroke per group, the Trim Paths above them switched off', r.strokes.length === 2 && RT.enabled === false, r.status);
        // B: its own Trim Paths selected: one stroke over both groups, set to Individually
        for (var i = 1; i <= comp.numLayers; i++) comp.layer(i).selected = false;
        var BT = B.property('ADBE Root Vectors Group').property(3);
        BT.selected = true;
        r = DO.apply();
        BT = B.property('ADBE Root Vectors Group').property(3);
        check('a selected Trim Paths: one stroke over both groups, now Individually', r.strokes.length === 1 && BT.property('ADBE Vector Trim Type').value === 2 && Math.abs(r.strokes[0].m.len - 800) < 0.01, r.status);
        check('no expression errors', expressionErrors(comp, 1).length === 0, expressionErrors(comp, 1).join('; '));
        // Remove everything: A's root trim back on, B's trim back to Simultaneously with its keys
        var rigs = DO.rigNames(comp), k;
        for (k = 0; k < rigs.length; k++) {
            selectOnly(comp, [DO.controlsOf(comp, rigs[k])]);
            DO.remove();
        }
        RT = A.property('ADBE Root Vectors Group').property(3);
        BT = B.property('ADBE Root Vectors Group').property(3);
        check('Remove: the switched-off Trim Paths is back on, its marker gone', RT.enabled === true && RT.property('ADBE Vector Trim Offset').expression === '');
        check('Remove: the selected Trim Paths is as it was (Simultaneously, keys, no expression)', BT.property('ADBE Vector Trim Type').value === 1 && BT.property('ADBE Vector Trim End').expression === '' && BT.property('ADBE Vector Trim End').valueAtTime(1, false) === 50);
        check('Remove: no rig, no Layer Control, no added Trim Paths left', comp.numLayers === 2 && A.property('ADBE Effect Parade').numProperties === 0 && A.property('ADBE Root Vectors Group').property(1).property('ADBE Vectors Group').numProperties === 2, comp.numLayers);
    });

    // Remove on the demo's own copy: one stroke, then the whole rig
    step('remove', function () {
        var dup = buildDrawing('Remove test', false), comp = dup.comp;
        selectOnly(comp, shapeLayers(comp));
        var r = DO.apply(), Tstar = trimOf(dup.layers.Star, 1);
        for (var i = 1; i <= comp.numLayers; i++) comp.layer(i).selected = false;
        Tstar.selected = true;
        var rr = DO.remove();
        Tstar = trimOf(dup.layers.Star, 1);
        check('Remove one stroke: the star\'s own keys are back', Tstar.property('ADBE Vector Trim End').expression === '' && Tstar.property('ADBE Vector Trim End').valueAtTime(1.0, false) === 50, rr.status);
        check('Remove one stroke: 12 strokes left in the rig', DO.members(comp, r.rig).length === 12);
        check('Remove one stroke: the star\'s layer has no Layer Control left', dup.layers.Star.property('ADBE Effect Parade').numProperties === 0);
        selectOnly(comp, [DO.controlsOf(comp, r.rig)]);
        rr = DO.remove();
        var added = 0;
        for (var l = 1; l <= comp.numLayers; l++) {
            var L = comp.layer(l);
            if (!(L instanceof ShapeLayer)) continue;
            for (var g = 1; g <= L.property('ADBE Root Vectors Group').numProperties; g++) if (trimOf(L, g)) added++;
            if (L.property('ADBE Effect Parade').numProperties) added += 100;
        }
        check('Remove the rig: only the star\'s own Trim Paths is left, no controls', added === 1 && !DO.controlsOf(comp, r.rig), added + ' / ' + rr.status);
    });

    // the panel, docked (a panel inside a window takes the docked path) and the guide's size
    step('panel', function () {
        var win = new Window('palette', 'dock test');
        var host = win.add('panel');
        host.preferredSize = [320, 70];
        var w = DO.buildUI(host);
        win.layout.layout(true);
        check('panel: built docked', w.docked === true && !!w.controls.apply);
        var g = DO.buildInfo(false);
        g.layout.layout(true);
        check('panel ?: guide size ' + g.size.width + ' x ' + g.size.height + ' px', g.size.width > 360 && g.size.width < 640 && g.size.height < 800);
        g.close();
        win.close();
    });

    if (OUT) {
        step('save', function () {
            demo.openInViewer();
            app.project.save(new File(OUT + '/draw-on-demo.aep'));
        });
        app.endSuppressDialogs(false);
    }
    note('');
    note(fails ? fails + ' FAILED' : 'all passed');
    flush();
})();
