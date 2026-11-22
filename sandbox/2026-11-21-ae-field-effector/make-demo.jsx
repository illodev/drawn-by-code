// make-demo.jsx - builds a small After Effects project that shows FieldEffector.jsx at work
// (the demo in demo-spec.js, the same one scene.js previews): a "Tile" precomp (a rounded
// square whose dot grows over its 1 s work area), the comps "Sphere field" and "Linear field"
// (a 13 x 7 grid of tiles, one keyed field each) and "Field Effector demo", 9 s, playing them
// one after the other.
//
// Run it from File > Scripts > Run Script File... with FieldEffector.jsx and demo-spec.js
// next to it. It opens a new project: if the current one has unsaved changes, After Effects
// asks first (cancel and nothing happens).
//
// Test mode (the repo's check, run without a person at the keyboard): set $.global.FX_TEST_OUT
// to a folder. It then also compares every expression with field-math.js run here in
// ExtendScript, checks where the layers are drawn, a re-run, a removal, a second field and a
// deleted field, renders stills and a video into that folder, writes ae-log.txt and saves
// field-effector-demo.aep there. After Effects stays open.
(function () {
    var OUT = $.global.FX_TEST_OUT || null;
    var here = $.global.FX_DIR ? new Folder($.global.FX_DIR) : File($.fileName).parent;
    var log = [], fails = 0;
    function note(s) {
        log.push(s);
    }
    function check(what, ok, detail) {
        if (!ok) fails++;
        note((ok ? 'ok   ' : 'FAIL ') + what + (detail !== undefined ? ' · ' + detail : ''));
    }
    function r4(v) {
        if (v instanceof Array) {
            var a = [];
            for (var i = 0; i < v.length; i++) a.push(Math.round(v[i] * 1e4) / 1e4);
            return '[' + a.join(', ') + ']';
        }
        return String(Math.round(v * 1e4) / 1e4);
    }
    function rgb(c) {
        return [c[0] / 255, c[1] / 255, c[2] / 255];
    }

    var MN = {
        tf: 'ADBE Transform Group', anchor: 'ADBE Anchor Point', position: 'ADBE Position', scale: 'ADBE Scale',
        rotation: 'ADBE Rotate Z', opacity: 'ADBE Opacity', effects: 'ADBE Effect Parade', timeRemap: 'ADBE Time Remapping'
    };
    function tf(L, mn) {
        return L.property(MN.tf).property(mn);
    }
    function ctl(L, name) {
        return L.property(MN.effects).property(name).property(1);
    }
    // shape helpers: re-fetch groups by name (adding a property invalidates its siblings)
    function contents(L) {
        return L.property('ADBE Root Vectors Group');
    }
    function vectors(L, name) {
        return contents(L).property(name).property('ADBE Vectors Group');
    }
    function shapeGroup(L, name, kind, size, roundness, color) {
        contents(L).addProperty('ADBE Vector Group').name = name;
        var s = vectors(L, name).addProperty(kind === 'rect' ? 'ADBE Vector Shape - Rect' : 'ADBE Vector Shape - Ellipse');
        s = vectors(L, name).property(1);
        if (kind === 'rect') {
            s.property('ADBE Vector Rect Size').setValue(size);
            s.property('ADBE Vector Rect Roundness').setValue(roundness);
        } else {
            s.property('ADBE Vector Ellipse Size').setValue(size);
        }
        vectors(L, name).addProperty('ADBE Vector Graphic - Fill');
        vectors(L, name).property(2).property('ADBE Vector Fill Color').setValue(color);
    }
    function easeAll(prop, spatial) {
        for (var k = 1; k <= prop.numKeys; k++) {
            prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.BEZIER);
            prop.setTemporalEaseAtKey(k, [new KeyframeEase(0, 33.333)], [new KeyframeEase(0, 33.333)]);
            if (spatial) {
                prop.setSpatialAutoBezierAtKey(k, false);
                prop.setSpatialContinuousAtKey(k, false);
                prop.setSpatialTangentsAtKey(k, [0, 0, 0], [0, 0, 0]);
            }
        }
    }

    // ask before replacing the open project (only then suppress dialogs)
    if (!app.newProject()) return;
    if (OUT) {
        app.beginSuppressDialogs();
        Folder(OUT).create();
    }
    app.beginUndoGroup('Field Effector demo');
    var master = null, comps = [];
    try {
        // $.evalFile doesn't put a file's top-level vars on $.global: eval the text here
        var specFile = new File(here.fsName + '/demo-spec.js');
        specFile.encoding = 'UTF-8';
        specFile.open('r');
        eval(specFile.read());
        specFile.close();
        var D = FX_DEMO, G = D.grid, C = D.colors;
        $.global.FX_NO_UI = true;
        $.evalFile(new File(here.fsName + '/FieldEffector.jsx'));
        var FE = $.global.FieldEffector;
        var proj = app.project;

        // Tile: a rounded square; its dot scales 0 -> 100 % over the 1 s work area (linear keys)
        var tile = proj.items.addComp('Tile', G.box, G.box, 1, D.shot, D.fps);
        tile.workAreaStart = 0;
        tile.workAreaDuration = D.work;
        var sq = tile.layers.addShape();
        sq.name = 'Square';
        shapeGroup(sq, 'Square', 'rect', [G.tile, G.tile], G.radius, rgb(C.tile));
        var dot = tile.layers.addShape();
        dot.name = 'Dot';
        shapeGroup(dot, 'Dot', 'ellipse', [G.dot, G.dot], 0, rgb(C.dot));
        var ds = tf(dot, MN.scale);
        ds.setValueAtTime(0, [0, 0, 100]);
        ds.setValueAtTime(D.work, [100, 100, 100]);
        ds.setInterpolationTypeAtKey(1, KeyframeInterpolationType.LINEAR);
        ds.setInterpolationTypeAtKey(2, KeyframeInterpolationType.LINEAR);

        var FIELD_NAMES = { shape: 'Shape', size: 'Size', falloff: 'Falloff', curve: 'Curve', strength: 'Strength', invert: 'Invert',
            edgeNoise: 'Edge Noise', noiseSize: 'Noise Size', noiseSpeed: 'Noise Speed', seed: 'Seed', blend: 'Blend' };
        var CH_NAMES = { strength: 'Strength', offsetX: 'Offset X', offsetY: 'Offset Y', push: 'Push', scale: 'Scale',
            rotation: 'Rotation', opacity: 'Opacity', tint: 'Tint' };

        for (var si = 0; si < D.shots.length; si++) {
            var S = D.shots[si];
            var comp = proj.items.addComp(S.name, D.size[0], D.size[1], 1, D.shot, D.fps);
            var bg = comp.layers.addSolid(rgb(C.bg), 'Background', D.size[0], D.size[1], 1, D.shot);
            bg.locked = true;
            var tiles = [];
            for (var r = 0; r < G.rows; r++) {
                for (var c = 0; c < G.cols; c++) {
                    var L = comp.layers.add(tile);    // lands on top: the first tile ends up lowest
                    L.name = 'Tile ' + (r + 1) + '-' + (c + 1);
                    tf(L, MN.position).setValue([960 + (c - (G.cols - 1) / 2) * G.step, 540 + (r - (G.rows - 1) / 2) * G.step, 0]);
                    if (!S.time) {
                        // the precomp would play its dot by itself: hold it on its first frame
                        L.timeRemapEnabled = true;
                        L.property(MN.timeRemap).setValueAtKey(2, 0);
                        L.outPoint = D.shot;
                    }
                    tiles.push(L);
                }
            }
            var t0 = new Date().getTime();
            var rep = FE.apply(comp, tiles, { name: 'FX', tint: S.tint, time: S.time });
            note(S.name + ': apply ' + (new Date().getTime() - t0) + ' ms · ' + rep.toSource());

            var E = comp.layer('FX Effector'), F = comp.layer('FX Field 1'), k;
            for (k in CH_NAMES) ctl(E, CH_NAMES[k]).setValue(S.ch[k]);
            var tc = rgb(S.ch.tintColor);
            ctl(E, 'Tint Color').setValue([tc[0], tc[1], tc[2], 1]);
            for (k in FIELD_NAMES) ctl(F, FIELD_NAMES[k]).setValue(S.P[k]);
            var fp = tf(F, MN.position);
            for (k = 0; k < S.keys.length; k++) fp.setValueAtTime(S.keys[k][0], [S.keys[k][1], S.keys[k][2], 0]);
            easeAll(fp, true);
            if (S.custom) {
                var cc = ctl(F, 'Custom Curve');
                while (cc.numKeys > 0) cc.removeKey(cc.numKeys);
                for (k = 0; k < S.custom.length; k++) cc.setValueAtTime(F.inPoint + S.custom[k][0], S.custom[k][1]);
                easeAll(cc, false);
            }
            comps.push({ comp: comp, tiles: tiles, spec: S });
        }

        master = proj.items.addComp('Field Effector demo', D.size[0], D.size[1], 1, D.shot * D.shots.length, D.fps);
        for (si = D.shots.length - 1; si >= 0; si--) {
            var ml = master.layers.add(comps[si].comp);
            ml.startTime = si * D.shot;
        }
        master.openInViewer();

        if (OUT) test(FE, D, comps);
        // rendering inside the user's AE blocks it for minutes and failed once with «Error
        // Code: 3» until a restart: the repo renders the saved project with aerender instead
        if (OUT && $.global.FX_TEST_RENDER) render(proj, master, D);
    } catch (e) {
        fails++;
        note('ERROR: ' + e.toString() + (e.line ? ' (line ' + e.line + ', ' + (e.fileName || '') + ')' : ''));
    } finally {
        app.endUndoGroup();
        if (OUT) app.endSuppressDialogs(false);
    }

    // ---- test mode ------------------------------------------------------------------------

    function expressionProps(L) {
        var out = [], fx = L.property(MN.effects), i, j;
        var tfs = [MN.anchor, MN.scale, MN.rotation, MN.opacity];
        for (i = 0; i < tfs.length; i++) out.push([tfs[i], tf(L, tfs[i])]);
        for (i = 1; i <= fx.numProperties; i++)
            for (j = 1; j <= fx.property(i).numProperties; j++)
                if (fx.property(i).property(j).canSetExpression && fx.property(i).property(j).expression !== '')
                    out.push([fx.property(i).name + ' > ' + fx.property(i).property(j).name, fx.property(i).property(j)]);
        if (L.timeRemapEnabled) out.push(['Time Remap', L.property(MN.timeRemap)]);
        return out;
    }

    function errorsIn(tiles, t) {
        var errs = [], n = 0;
        for (var i = 0; i < tiles.length; i++) {
            var ps = expressionProps(tiles[i]);
            for (var j = 0; j < ps.length; j++) {
                if (ps[j][1].expression === '') continue;
                ps[j][1].valueAtTime(t, false);
                n++;
                if (ps[j][1].expressionError) errs.push(tiles[i].name + ' > ' + ps[j][0] + ': ' + ps[j][1].expressionError);
            }
        }
        return { errors: errs, count: n };
    }

    function test(FE, D, comps) {
        // the field math, run here in ExtendScript: the reference the expressions are held to
        eval(FE.math);
        var TIMES = [0.4, 1.1, 1.9, 2.6, 3.4, 4.2];
        for (var ci = 0; ci < comps.length; ci++) {
            var comp = comps[ci].comp, tiles = comps[ci].tiles, S = comps[ci].spec;
            var E = comp.layer('FX Effector'), F = comp.layer('FX Field 1');
            note('--- ' + comp.name + ': ' + comp.numLayers + ' layers, top: ' + comp.layer(1).name + ' | ' + comp.layer(2).name + ' | ' + comp.layer(3).name);

            var ex = errorsIn(tiles, 1.9);
            check('expressions evaluate without errors (' + ex.count + ')', ex.errors.length === 0, ex.errors.slice(0, 5).join('; '));
            var gz = comp.layer('FX Field 1 Gizmo');
            check('gizmo is a guide layer parented to the field', gz && gz.guideLayer && gz.parent && gz.parent.index === F.index);

            // weights: expression vs field-math.js
            var cc = ctl(F, 'Custom Curve');
            var custom = function (u) {
                var n = cc.numKeys;
                if (n < 2) return u;
                var a = cc.keyTime(1), b = cc.keyTime(n), v0 = cc.keyValue(1), v1 = cc.keyValue(n);
                return (cc.valueAtTime(a + u * (b - a), false) - v0) / (v1 - v0);
            };
            var worst = 0, worstAt = '', ti, i;
            var P = {};
            for (var key in { shape: 1, size: 1, falloff: 1, curve: 1, strength: 1, invert: 1, edgeNoise: 1, noiseSize: 1, noiseSpeed: 1, seed: 1, blend: 1 }) P[key] = S.P[key];
            // the `time` an expression sees at valueAtTime(t) is not exactly t: measure it (the noise uses it)
            var probe0 = comp.layers.addNull(comp.duration), pt = tf(probe0, MN.position), offsets = [];
            var F0 = tf(F, MN.anchor).value;
            note('field null anchor ' + r4(F0));
            for (ti = 0; ti < TIMES.length; ti++) {
                var t = TIMES[ti], fpos = tf(F, MN.position).valueAtTime(t, false);
                pt.expression = '[(time - ' + t + ') * 1000000000, 0];';
                var tAE = t + pt.valueAtTime(t, false)[0] / 1e9;
                offsets.push(r4((tAE - t) * 1e9) + ' ns');
                for (i = 0; i < tiles.length; i++) {
                    var p = tf(tiles[i], MN.position).valueAtTime(t, false);
                    var want = fxEvaluate([{ P: P, lx: p[0] - fpos[0], ly: p[1] - fpos[1], cx: fpos[0], cy: fpos[1], ax: 1, ay: 0, custom: custom }], p[0], p[1], tAE)[0] * S.ch.strength;
                    var got = ctl(tiles[i], 'FX Weight').valueAtTime(t, false);
                    if (Math.abs(got - want) > worst) {
                        worst = Math.abs(got - want);
                        worstAt = tiles[i].name + ' @' + t + ' got ' + got + ' want ' + want;
                    }
                }
            }
            probe0.remove();
            note('expression time minus requested time: ' + offsets.join(', '));
            check('weights match field-math.js (91 tiles x 6 times)', worst < 1e-5, 'worst ' + worst + (worst ? ' (' + worstAt + ')' : ''));

            // where each tile is drawn: its own anchor point's comp position = rest + offset/push
            var probe = comp.layers.addNull(comp.duration), pp = tf(probe, MN.position), worstPos = 0, maxShift = 0, half = G.box / 2;
            for (i = 0; i < tiles.length; i += 3) {
                pp.expression = 'var L = thisComp.layer(' + q(tiles[i].name) + '); var a = L.toComp([' + half + ', ' + half + ']); [a[0], a[1]];';
                for (ti = 0; ti < TIMES.length; ti += 2) {
                    t = TIMES[ti];
                    var rest = tf(tiles[i], MN.position).valueAtTime(t, false), fp2 = tf(F, MN.position).valueAtTime(t, false);
                    var w = ctl(tiles[i], 'FX Weight').valueAtTime(t, false) / 100;
                    var rr = fxEvaluate([{ P: P, lx: rest[0] - fp2[0], ly: rest[1] - fp2[1], cx: fp2[0], cy: fp2[1], ax: 1, ay: 0, custom: custom }], rest[0], rest[1], t);
                    var dx = (S.ch.offsetX + S.ch.push * rr[1]) * w, dy = (S.ch.offsetY + S.ch.push * rr[2]) * w;
                    var drawn = pp.valueAtTime(t, false);
                    worstPos = Math.max(worstPos, Math.sqrt(Math.pow(drawn[0] - rest[0] - dx, 2) + Math.pow(drawn[1] - rest[1] - dy, 2)));
                    maxShift = Math.max(maxShift, Math.sqrt(dx * dx + dy * dy));
                }
            }
            probe.remove();
            check('tiles are drawn at rest + offset/push (every 3rd tile, 3 times)', worstPos < 0.001, 'worst ' + r4(worstPos) + ' px, largest shift ' + r4(maxShift) + ' px');

            // nothing moves where the weight is 0
            var still = 0, moved = [];
            for (i = 0; i < tiles.length; i++) {
                if (ctl(tiles[i], 'FX Weight').valueAtTime(0, false) !== 0) continue;
                still++;
                var a0 = tf(tiles[i], MN.anchor).valueAtTime(0, false), s0 = tf(tiles[i], MN.scale).valueAtTime(0, false);
                var o0 = tf(tiles[i], MN.opacity).valueAtTime(0, false), rt0 = tf(tiles[i], MN.rotation).valueAtTime(0, false);
                if (a0[0] !== half || a0[1] !== half || s0[0] !== 100 || s0[1] !== 100 || o0 !== 100 || rt0 !== 0) moved.push(tiles[i].name);
            }
            check('weight 0 leaves the tile exactly as it was (' + still + ' tiles at 0 s)', still > 0 && moved.length === 0, moved.join(', '));

            // a re-run rewrites, it doesn't stack
            var nl = comp.numLayers, nfx = tiles[0].property(MN.effects).numProperties;
            var rep = FE.apply(comp, tiles, { name: 'FX', tint: S.tint, time: S.time });
            check('re-run keeps layers and effects', comp.numLayers === nl && tiles[0].property(MN.effects).numProperties === nfx && rep.kept.length === 0,
                nl + ' -> ' + comp.numLayers + ' layers, ' + nfx + ' -> ' + tiles[0].property(MN.effects).numProperties + ' effects, kept ' + rep.kept.length);

            // the designer's own expression is left alone
            tf(tiles[5], MN.rotation).expression = 'wiggle(1, 5)';
            rep = FE.apply(comp, [tiles[5]], { name: 'FX', tint: S.tint, time: S.time });
            check('a designer expression is kept and reported', tf(tiles[5], MN.rotation).expression === 'wiggle(1, 5)' && rep.kept.length === 1, rep.kept.join(', '));
            tf(tiles[5], MN.rotation).expression = '';
            FE.apply(comp, [tiles[5]], { name: 'FX', tint: S.tint, time: S.time });

            // removal gives the layer back, re-applying restores the rig
            var some = [tiles[0], tiles[1], tiles[2]];
            var n = FE.remove(comp, some, 'FX');
            var clean = true;
            for (i = 0; i < some.length; i++) {
                if (some[i].property(MN.effects).property('FX Weight') || some[i].property(MN.effects).property('FX Tint')) clean = false;
                if (tf(some[i], MN.anchor).expression || tf(some[i], MN.scale).expression || tf(some[i], MN.opacity).expression) clean = false;
                if (S.time && some[i].timeRemapEnabled) clean = false;
            }
            check('remove takes the rig off (' + n + ' layers)', n === 3 && clean);
            FE.apply(comp, some, { name: 'FX', tint: S.tint, time: S.time });
            check('re-apply after remove', FE.targets(comp, 'FX').length === tiles.length && (!S.time || some[0].timeRemapEnabled));

            if (ci === 0) {
                // a second field joins every target's expressions; deleting it is not an error
                var before = ctl(tiles[45], 'FX Weight').valueAtTime(1.9, false);
                var F2 = FE.addField(comp, 'FX');
                var w2 = tiles[45].property(MN.effects).property('FX Weight').property(1).expression;
                check('Add field: "' + F2.name + '" reaches every target', w2.indexOf('fxAt(E, 2,') >= 0 && errorsIn(tiles.slice(40, 50), 1.9).errors.length === 0);
                note('weight at tile 45, 1.9 s: ' + r4(before) + ' -> ' + r4(ctl(tiles[45], 'FX Weight').valueAtTime(1.9, false)) + ' with a second (Add) field');
                var g2 = comp.layer(F2.name + ' Gizmo');
                g2.locked = false;
                g2.remove();
                F2.remove();
                var ex2 = errorsIn(tiles.slice(40, 50), 1.9);
                check('a deleted field is skipped, not an error', ex2.errors.length === 0 && Math.abs(ctl(tiles[45], 'FX Weight').valueAtTime(1.9, false) - before) < 1e-9, ex2.errors.slice(0, 2).join('; '));
                E.property(MN.effects).property('Field 2').remove();
                FE.refresh(comp, 'FX');
                check('refresh back to one field', tiles[45].property(MN.effects).property('FX Weight').property(1).expression.indexOf('fxAt(E, 1,') >= 0);
                var op = tiles[0].property(MN.effects).property('FX Tint');
                if (op) note('Tint amount: max ' + op.property('ADBE Tint-0003').maxValue + ', at 1.9 s ' + r4(op.property('ADBE Tint-0003').valueAtTime(1.9, false)) +
                    ', at 0 s ' + r4(op.property('ADBE Tint-0003').valueAtTime(0, false)));
            }
            // speed: every tile's expressions at one frame
            var tt = new Date().getTime();
            errorsIn(tiles, 2.2);
            note('evaluating ' + ex.count + ' expressions: ' + (new Date().getTime() - tt) + ' ms');
        }
    }

    function q(s) {
        return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    }

    function render(proj, comp, D) {
        var rq = proj.renderQueue, tmpl = null, vid = null, n;
        var probe = rq.items.add(comp);
        var names = probe.outputModule(1).templates;
        for (n = 0; n < names.length; n++) {
            if (!tmpl && /png/i.test(names[n])) tmpl = names[n];
            if (!vid && /h\.?264/i.test(names[n])) vid = names[n];
        }
        if (!tmpl) for (n = 0; n < names.length; n++) if (!tmpl && /tiff/i.test(names[n])) tmpl = names[n];
        probe.remove();
        var stills = [1.4, 2.2, 3.0, 5.6, 6.6, 8.8];
        for (n = 0; n < stills.length; n++) {
            var it = rq.items.add(comp);
            it.timeSpanStart = stills[n];
            it.timeSpanDuration = 1 / comp.frameRate;
            var om = it.outputModule(1);
            if (tmpl) om.applyTemplate(tmpl);
            om.file = new File(OUT + '/ae_' + stills[n].toFixed(1).replace('.', '-') + '_[#####]' + (/png/i.test(tmpl) ? '.png' : '.tif'));
        }
        if (vid) {
            var iv = rq.items.add(comp);
            iv.outputModule(1).applyTemplate(vid);
            iv.outputModule(1).file = new File(OUT + '/field-effector-ae.mp4');
        }
        var t = new Date().getTime();
        rq.render();
        note('render: ' + (new Date().getTime() - t) + ' ms, still template ' + tmpl + ', video template ' + vid);
        var st = [];
        for (n = 1; n <= rq.numItems; n++) st.push(n + ':' + (rq.item(n).status === RQItemStatus.DONE ? 'done' : 'status ' + rq.item(n).status));
        check('every render queue item finished', st.join(' ').indexOf('status') < 0, st.join(' '));
    }

    if (OUT) {
        try {
            app.project.save(new File(OUT + '/field-effector-demo.aep'));
            note('saved ' + OUT + '/field-effector-demo.aep');
        } catch (e2) {
            note('save failed: ' + e2.toString());
        }
        note(fails ? fails + ' check(s) FAILED' : 'all checks pass');
        var f = new File(OUT + '/ae-log.txt');
        f.encoding = 'UTF-8';
        f.open('w');
        f.write(log.join('\n') + '\n');
        f.close();
    } else if (fails) {
        alert(log.join('\n'));
    }
})();
