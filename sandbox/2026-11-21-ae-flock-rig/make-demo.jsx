// make-demo.jsx · builds a small After Effects project that shows Flock.jsx at work:
// a "Bird" precomp (a 0.5 s side-view flap cycle in its work area, and a head-on cycle
// after it marked "turn"), a "Leader" null keyed along a swoop with a loop, and the flock
// baked from them in the "Sky" comp.
//
// Run it in an empty project: File > Scripts > Run Script File… (Flock.jsx must sit next to it).
//
// Test mode (used by the repo to check the script without a person at the keyboard): set
// $.global.FLOCK_TEST_OUT to a folder before running it. It opens a new project, also builds
// "Sky shaped" (the shape controls pushed) and a round-1 Controls layer to migrate, writes
// ae-log.txt after every step and saves flock-demo.aep there; the runner renders it with
// aerender. It quits After Effects only if $.global.FLOCK_TEST_QUIT is set.
(function () {
    var OUT = $.global.FLOCK_TEST_OUT || null;
    var here = $.global.FLOCK_DIR ? new Folder($.global.FLOCK_DIR) : File($.fileName).parent;
    var log = [];
    function flush() {
        if (!OUT) return;
        try {
            Folder(OUT).create();
            var f = new File(OUT + '/ae-log.txt');
            f.encoding = 'UTF-8';
            f.open('w');
            f.write(log.join('\n') + '\n');
            f.close();
        } catch (e) {}
    }
    function note(s) {
        log.push(s);
        flush();
    }
    function msg(e) {
        try {
            return e.message + (e.line ? ' (line ' + e.line + ')' : '');
        } catch (e2) {
            return 'unprintable error';
        }
    }
    function step(name, fn) {
        try {
            fn();
            return true;
        } catch (e) {
            note('ERROR in ' + name + ': ' + msg(e));
            return false;
        }
    }
    function q(v) {
        if (v instanceof Array) {
            var a = [];
            for (var i = 0; i < v.length; i++) a.push(typeof v[i] === 'number' ? Math.round(v[i] * 100) / 100 : v[i]);
            return '[' + a.join(', ') + ']';
        }
        return typeof v === 'number' ? String(Math.round(v * 1000) / 1000) : String(v);
    }

    // ---- shape helpers (re-fetch groups by name: adding a property invalidates siblings) ----
    function contents(layer) {
        return layer.property('ADBE Root Vectors Group');
    }
    function group(layer, name) {
        contents(layer).addProperty('ADBE Vector Group').name = name;
    }
    function vectors(layer, name) {
        return contents(layer).property(name).property('ADBE Vectors Group');
    }
    function ellipse(layer, name, w, h, x, y) {
        var e = vectors(layer, name).addProperty('ADBE Vector Shape - Ellipse');
        e.property('ADBE Vector Ellipse Size').setValue([w, h]);
        e.property('ADBE Vector Ellipse Position').setValue([x, y]);
    }
    function shapeOf(verts) {
        var s = new Shape();
        s.vertices = verts;
        s.closed = true;
        return s;
    }
    function path(layer, name, verts) {
        var p = vectors(layer, name).addProperty('ADBE Vector Shape - Group');
        p.property('ADBE Vector Shape').setValue(shapeOf(verts));
        return p.propertyIndex;
    }
    function keyPath(layer, name, index, poses) {
        var sp = vectors(layer, name).property(index).property('ADBE Vector Shape');
        for (var i = 0; i < poses.length; i++) sp.setValueAtTime(poses[i][0], shapeOf(poses[i][1]));
    }
    function fill(layer, name, rgb) {
        vectors(layer, name).addProperty('ADBE Vector Graphic - Fill').property('ADBE Vector Fill Color').setValue(rgb);
    }
    // a head-on wing: s = 1 right, -1 left; a = +1 up, 0 level, -1 down
    function wingHeadOn(s, a) {
        var tipX = s * (19 - 4 * Math.abs(a)), tipY = -13 * a;
        return [[s * 2.5, -1.8], [s * 10, tipY * 0.5 - 2], [tipX, tipY], [s * 9, tipY * 0.4 + 1.5], [s * 2.5, 1.6]];
    }

    if (OUT) app.newProject(); // before suppressing dialogs: unsaved work gets AE's own prompt
    app.beginSuppressDialogs();
    app.beginUndoGroup('Flock demo');
    var proj = app.project, INK = [0.11, 0.14, 0.19];
    var birdComp, comp, birdLayer, leader, shaped;
    var ok = step('bird precomp', function () {
        // Bird: side view facing right in the work area (0-0.5 s), head-on view after it
        // (0.5-1 s) marked "turn"; wings keyed up, level, down, level, up.
        birdComp = proj.items.addComp('Bird', 120, 80, 1, 1.5, 24);
        birdComp.workAreaStart = 0;
        birdComp.workAreaDuration = 0.5;
        var sl = birdComp.layers.addShape();
        sl.name = 'Side view';
        sl.property('ADBE Transform Group').property('ADBE Position').setValue([60, 40]);
        group(sl, 'Wing');
        var UP = [[5, -1], [0, -10], [-8, -22], [-4, -8], [-6, 0]];
        var MID = [[5, -1], [0, -3], [-13, -4], [-6, -1], [-6, 0]];
        var DOWN = [[5, -1], [1, 7], [-6, 19], [-4, 6], [-6, 0]];
        var wi = path(sl, 'Wing', UP);
        fill(sl, 'Wing', INK);
        keyPath(sl, 'Wing', wi, [[0, UP], [0.125, MID], [0.25, DOWN], [0.375, MID], [0.5, UP]]);
        group(sl, 'Body');
        ellipse(sl, 'Body', 26, 8, 0, 0);
        ellipse(sl, 'Body', 8, 8, 12, -2);
        path(sl, 'Body', [[-11, -1], [-21, -6], [-20, 4]]);
        fill(sl, 'Body', INK);
        sl.outPoint = 0.5;

        var ho = birdComp.layers.addShape();
        ho.name = 'Head-on view';
        ho.property('ADBE Transform Group').property('ADBE Position').setValue([60, 40]);
        var sides = [['Right wing', 1], ['Left wing', -1]];
        for (var w = 0; w < sides.length; w++) {
            group(ho, sides[w][0]);
            var ix = path(ho, sides[w][0], wingHeadOn(sides[w][1], 1));
            fill(ho, sides[w][0], INK);
            var s = sides[w][1];
            keyPath(ho, sides[w][0], ix, [[0.5, wingHeadOn(s, 1)], [0.625, wingHeadOn(s, 0)], [0.75, wingHeadOn(s, -1)], [0.875, wingHeadOn(s, 0)], [1.0, wingHeadOn(s, 1)]]);
        }
        group(ho, 'Body');
        ellipse(ho, 'Body', 7.2, 8.8, 0, 0);
        fill(ho, 'Body', INK);
        ho.inPoint = 0.5;
        ho.outPoint = 1.0;
        var mv = new MarkerValue('turn');
        mv.duration = 0.5;
        birdComp.markerProperty.setValueAtTime(0.5, mv);
    });

    ok = ok && step('sky comp', function () {
        comp = proj.items.addComp('Sky', 1920, 1080, 1, 8, 24);
        var bg = comp.layers.addSolid([0.8, 0.83, 0.86], 'Sky gradient', 1920, 1080, 1, 8);
        var ramp = bg.property('ADBE Effect Parade').addProperty('ADBE Ramp');
        ramp.property(1).setValue([960, 0]);
        ramp.property(2).setValue([0.62, 0.72, 0.79]);
        ramp.property(3).setValue([960, 1080]);
        ramp.property(4).setValue([0.91, 0.89, 0.84]);
        bg.locked = true;
        birdLayer = comp.layers.add(birdComp);
        birdLayer.name = 'Bird';
        leader = comp.layers.addNull(8);
        leader.name = 'Leader';
        var KEYS = [[0.0, -160, 640], [1.2, 420, 520], [2.4, 900, 300], [3.3, 1180, 420], [4.1, 1010, 640],
            [4.9, 760, 520], [5.8, 1040, 330], [6.8, 1500, 380], [8.0, 2100, 260]];
        var lp = leader.property('ADBE Transform Group').property('ADBE Position');
        for (var k = 0; k < KEYS.length; k++) lp.setValueAtTime(KEYS[k][0], [KEYS[k][1], KEYS[k][2]]);
        for (k = 1; k <= lp.numKeys; k++) {
            lp.setInterpolationTypeAtKey(k, KeyframeInterpolationType.BEZIER);
            lp.setTemporalAutoBezierAtKey(k, true);
            lp.setSpatialAutoBezierAtKey(k, true);
        }
        comp.motionBlur = true;
    });

    if (ok && OUT) step('round-1 controls to migrate', function () {
        // what round 1 left: "Spread" and "Orient" sliders; a re-run must rename them in place
        var c = comp.layers.addNull(8);
        c.name = 'Flock Controls';
        c.moveBefore(birdLayer);
        var e = c.property('ADBE Effect Parade').addProperty('ADBE Slider Control');
        e.name = 'Spread';
        c.property('ADBE Effect Parade').property('Spread').property(1).setValue(80);
        c.property('ADBE Effect Parade').addProperty('ADBE Slider Control').name = 'Orient';
        c.property('ADBE Effect Parade').property('Orient').property(1).setValue(100);
    });

    ok = ok && step('build', function () {
        $.global.FLOCK_NO_UI = true;
        $.evalFile(new File(here.fsName + '/Flock.jsx'));
        var t = new Date().getTime();
        var rep = $.global.FlockRig.build(comp, birdLayer, leader, { name: 'Flock', count: 80, spacing: 45, seed: 7 });
        note('build: ' + rep.toSource() + ' total ' + (new Date().getTime() - t) + ' ms');
        comp.openInViewer();
    });

    if (ok && OUT) {
        step('controls', function () {
            var fx = comp.layer('Flock Controls').property('ADBE Effect Parade'), names = [];
            for (var i = 1; i <= fx.numProperties; i++) names.push(fx.property(i).name + ' = ' + q(fx.property(i).property(1).value));
            note('controls (' + fx.numProperties + '): ' + names.join(' | '));
        });
        step('expressions', function () {
            var birds = ['Flock Bird 001', 'Flock Bird 040', 'Flock Bird 080'], bad = 0, n, i;
            for (n = 0; n < birds.length; n++) {
                var b = comp.layer(birds[n]), tfg = b.property('ADBE Transform Group');
                var props = [['position', tfg.property('ADBE Position')], ['rotation', tfg.property('ADBE Rotate Z')], ['scale', tfg.property('ADBE Scale')], ['time remap', b.property('ADBE Time Remapping')]];
                for (i = 0; i < props.length; i++) {
                    var p = props[i][1];
                    if (p.expressionError) {
                        bad++;
                        note(birds[n] + ' ' + props[i][0] + ': EXPRESSION ERROR: ' + p.expressionError);
                    }
                    if (n === 0) note(props[i][0] + ': keys ' + p.numKeys + ', baked@3s ' + q(p.valueAtTime(3, true)) + ', final@3s ' + q(p.valueAtTime(3, false)));
                }
            }
            note('expression errors on 3 birds: ' + bad);
        });
        step('pose over time', function () {
            // every bird, every frame: rotation steps, head-on frames, narrowest side view
            var maxRot = 0, headOn = 0, minW = 9, frames = 0, birds = 0, n, f;
            for (n = 1; n <= comp.numLayers; n++) {
                var b = comp.layer(n);
                if (b.name.indexOf('Flock Bird ') !== 0) continue;
                birds++;
                var rot = b.property('ADBE Transform Group').property('ADBE Rotate Z');
                var sc = b.property('ADBE Transform Group').property('ADBE Scale'), tr = b.property('ADBE Time Remapping');
                var prev = null;
                for (f = 0; f < 192; f += 2) {
                    var t = f / 24, r = rot.valueAtTime(t, false), s = sc.valueAtTime(t, false), m = tr.valueAtTime(t, false);
                    if (prev !== null) maxRot = Math.max(maxRot, Math.abs(r - prev) / 2);
                    prev = r;
                    frames++;
                    if (m >= 0.5) headOn++;
                    else minW = Math.min(minW, Math.abs(s[0] / s[1]));
                }
            }
            note('pose (' + birds + ' birds, every 2nd frame): max rotation ' + q(maxRot) + ' deg/frame, head-on drawing in ' + headOn + ' of ' + frames + ' samples, narrowest side view ' + q(minW * 100) + ' % width');
        });
        step('shaped comp', function () {
            shaped = comp.duplicate();
            shaped.name = 'Sky shaped';
            var fx = shaped.layer('Flock Controls').property('ADBE Effect Parade');
            var set = [['Length % (along travel)', 250], ['Width % (across travel)', 55], ['Clumping (+ core, - even)', 60], ['Scatter px (per bird)', 12], ['Scatter Speed (0 = still)', 0.7]];
            for (var i = 0; i < set.length; i++) fx.property(set[i][0]).property(1).setValue(set[i][1]);
            var b = shaped.layer('Flock Bird 001').property('ADBE Transform Group').property('ADBE Position');
            note('shaped: bird 001 position@3s ' + q(b.valueAtTime(3, false)) + (b.expressionError ? ', EXPRESSION ERROR: ' + b.expressionError : ', expression ok'));
        });
        step('turn check comp', function () {
            // the demo path turns every bird through vertical (instant flips); here each
            // bird's Facing is driven to turn around level all the time, at its own moment,
            // to see Turn Width and the head-on drawing in AE
            var tc = comp.duplicate(), n, birds = 0, headOn = 0, narrow = 9, samples = 0, f;
            tc.name = 'Turn check';
            for (n = 1; n <= tc.numLayers; n++) {
                var b = tc.layer(n);
                if (b.name.indexOf('Flock Bird ') !== 0) continue;
                birds++;
                b.property('ADBE Effect Parade').property('Facing').property(1).expression = 'Math.sin(time * 2.5 + index * 0.9)';
            }
            for (n = 1; n <= tc.numLayers; n++) {
                var L = tc.layer(n);
                if (L.name.indexOf('Flock Bird ') !== 0) continue;
                var sc = L.property('ADBE Transform Group').property('ADBE Scale'), tr = L.property('ADBE Time Remapping');
                for (f = 0; f < 192; f += 4) {
                    var s = sc.valueAtTime(f / 24, false), m = tr.valueAtTime(f / 24, false);
                    samples++;
                    if (m >= 0.5) headOn++;
                    else narrow = Math.min(narrow, Math.abs(s[0] / s[1]));
                    if (sc.expressionError || tr.expressionError) throw new Error(L.name + ': ' + (sc.expressionError || tr.expressionError));
                }
            }
            note('turn check (' + birds + ' birds turning level): head-on drawing in ' + headOn + ' of ' + samples + ' samples (' + q((100 * headOn) / samples) + ' %), narrowest side view ' + q(narrow * 100) + ' % width');
        });
        step('rebuild', function () {
            var rep2 = $.global.FlockRig.build(comp, birdLayer, leader, { name: 'Flock', count: 80, spacing: 45, seed: 7 });
            note('rebuild: removed ' + rep2.removed + ', layers now ' + comp.numLayers + ', turn drawing ' + rep2.turnDrawing);
        });
    }
    app.endUndoGroup();
    app.endSuppressDialogs(false);

    if (OUT) {
        step('save', function () {
            app.project.save(new File(OUT + '/flock-demo.aep'));
            note('saved ' + OUT + '/flock-demo.aep');
        });
        if ($.global.FLOCK_TEST_QUIT) app.quit();
    } else if (log.length) {
        alert(log.join('\n'));
    }
})();
