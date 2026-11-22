// make-demo.jsx · builds a small After Effects project that shows Flock.jsx at work:
// a "Bird" precomp (one 0.5 s flap cycle drawn with shape layers), a "Leader" null keyed
// along a swoop with a loop, and the flock baked from them in the "Sky" comp.
//
// Run it in an empty project: File > Scripts > Run Script File… (Flock.jsx must sit next to it).
//
// Test mode (used by the repo to check the script without a person at the keyboard): set
// $.global.FLOCK_TEST_OUT to a folder before running it; it then renders stills and a
// video there, writes ae-log.txt and saves flock-demo.aep (and quits After Effects if
// $.global.FLOCK_TEST_QUIT is set).
(function () {
    var OUT = $.global.FLOCK_TEST_OUT || null;
    var here = $.global.FLOCK_DIR ? new Folder($.global.FLOCK_DIR) : File($.fileName).parent;
    var log = [];
    function note(s) {
        log.push(s);
    }
    function q(v) {
        if (v instanceof Array) {
            var a = [];
            for (var i = 0; i < v.length; i++) a.push(typeof v[i] === 'number' ? Math.round(v[i] * 100) / 100 : v[i]);
            return '[' + a.join(', ') + ']';
        }
        return String(v);
    }

    // ---- shape helpers (re-fetch groups by name: adding a property invalidates siblings) ----
    function contents(layer) {
        return layer.property('ADBE Root Vectors Group');
    }
    function group(layer, name) {
        var g = contents(layer).addProperty('ADBE Vector Group');
        g.name = name;
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
    function fill(layer, name, rgb) {
        var f = vectors(layer, name).addProperty('ADBE Vector Graphic - Fill');
        f.property('ADBE Vector Fill Color').setValue(rgb);
    }

    app.beginSuppressDialogs();
    app.beginUndoGroup('Flock demo');
    try {
        if (OUT) {
            app.newProject();
            Folder(OUT).create();
        }
        var proj = app.project;
        var INK = [0.11, 0.14, 0.19];

        // Bird: drawn facing right, centred; wing keyed up → level → down → level → up.
        var birdComp = proj.items.addComp('Bird', 120, 80, 1, 1, 24);
        birdComp.workAreaStart = 0;
        birdComp.workAreaDuration = 0.5;
        var sl = birdComp.layers.addShape();
        sl.name = 'Bird shape';
        sl.property('ADBE Transform Group').property('ADBE Position').setValue([60, 40]);
        group(sl, 'Wing');
        var wi = path(sl, 'Wing', [[5, -1], [0, -10], [-8, -22], [-4, -8], [-6, 0]]);
        fill(sl, 'Wing', INK);
        var wp = vectors(sl, 'Wing').property(wi).property('ADBE Vector Shape');
        var UP = [[5, -1], [0, -10], [-8, -22], [-4, -8], [-6, 0]];
        var MID = [[5, -1], [0, -3], [-13, -4], [-6, -1], [-6, 0]];
        var DOWN = [[5, -1], [1, 7], [-6, 19], [-4, 6], [-6, 0]];
        var poses = [[0, UP], [0.125, MID], [0.25, DOWN], [0.375, MID], [0.5, UP]];
        for (var pi = 0; pi < poses.length; pi++) wp.setValueAtTime(poses[pi][0], shapeOf(poses[pi][1]));
        group(sl, 'Body');
        ellipse(sl, 'Body', 26, 8, 0, 0);
        ellipse(sl, 'Body', 8, 8, 12, -2);
        path(sl, 'Body', [[-11, -1], [-21, -6], [-20, 4]]);
        fill(sl, 'Body', INK);

        // Sky: background, leader, bird layer
        var comp = proj.items.addComp('Sky', 1920, 1080, 1, 8, 24);
        var bg = comp.layers.addSolid([0.8, 0.83, 0.86], 'Sky gradient', 1920, 1080, 1, 8);
        var ramp = bg.property('ADBE Effect Parade').addProperty('ADBE Ramp');
        ramp.property(1).setValue([960, 0]);
        ramp.property(2).setValue([0.62, 0.72, 0.79]);
        ramp.property(3).setValue([960, 1080]);
        ramp.property(4).setValue([0.91, 0.89, 0.84]);
        bg.locked = true;

        var birdLayer = comp.layers.add(birdComp);
        birdLayer.name = 'Bird';
        var leader = comp.layers.addNull(8);
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

        $.global.FLOCK_NO_UI = true;
        $.evalFile(new File(here.fsName + '/Flock.jsx'));
        var t = new Date().getTime();
        var rep = FlockRig.build(comp, birdLayer, leader, { name: 'Flock', count: 80, spacing: 45, seed: 7 });
        note('build: ' + rep.toSource() + ' total ' + (new Date().getTime() - t) + ' ms');
        comp.openInViewer();

        if (OUT) {
            // what got built
            note('layers: ' + comp.numLayers + ' · top 5: ' + [comp.layer(1).name, comp.layer(2).name, comp.layer(3).name, comp.layer(4).name, comp.layer(5).name].join(' | '));
            var b1 = comp.layer('Flock Bird 001');
            var tfg = b1.property('ADBE Transform Group');
            var props = [['position', tfg.property('ADBE Position')], ['rotation', tfg.property('ADBE Rotate Z')], ['scale', tfg.property('ADBE Scale')], ['time remap', b1.property('ADBE Time Remapping')]];
            for (var n = 0; n < props.length; n++) {
                var p = props[n][1];
                note(props[n][0] + ': keys ' + p.numKeys + ', baked@3s ' + q(p.valueAtTime(3, true)) + ', final@3s ' + q(p.valueAtTime(3, false)) + (p.expressionError ? ', EXPRESSION ERROR: ' + p.expressionError : ', expression ok'));
            }
            note('flap phase keys: ' + b1.property('ADBE Effect Parade').property('Flap Phase').property(1).numKeys);
            note('bird source enabled: ' + birdLayer.enabled + ', hideShyLayers: ' + comp.hideShyLayers);
            // a re-run must replace the birds, not add to them
            var rep2 = FlockRig.build(comp, birdLayer, leader, { name: 'Flock', count: 80, spacing: 45, seed: 7 });
            note('rebuild: removed ' + rep2.removed + ', layers now ' + comp.numLayers);

            // renders
            var rq = proj.renderQueue, tmpl = null, vid = null;
            var probe = rq.items.add(comp);
            var names = probe.outputModule(1).templates;
            note('output templates: ' + names.join(' | '));
            for (n = 0; n < names.length; n++) {
                if (!tmpl && /png/i.test(names[n])) tmpl = names[n];
                if (!vid && /h\.?264/i.test(names[n])) vid = names[n];
            }
            if (!tmpl) for (n = 0; n < names.length; n++) if (!tmpl && /tiff/i.test(names[n])) tmpl = names[n];
            probe.remove();
            var stills = [2, 3.5, 4.6, 6];
            for (n = 0; n < stills.length; n++) {
                var it = rq.items.add(comp);
                it.timeSpanStart = stills[n];
                it.timeSpanDuration = 1 / comp.frameRate;
                var om = it.outputModule(1);
                if (tmpl) om.applyTemplate(tmpl);
                om.file = new File(OUT + '/still_' + stills[n].toFixed(1).replace('.', '-') + '_[#####]' + (/png/i.test(tmpl) ? '.png' : '.tif'));
            }
            if (vid) {
                var iv = rq.items.add(comp);
                iv.outputModule(1).applyTemplate(vid);
                iv.outputModule(1).file = new File(OUT + '/flock-ae.mp4');
            }
            t = new Date().getTime();
            rq.render();
            note('render: ' + (new Date().getTime() - t) + ' ms, still template ' + tmpl + ', video template ' + vid);
        }
    } catch (e) {
        note('ERROR: ' + e.toString() + (e.line ? ' (line ' + e.line + ', ' + (e.fileName || '') + ')' : ''));
    } finally {
        app.endUndoGroup();
        app.endSuppressDialogs(false);
    }

    if (OUT) {
        try {
            app.project.save(new File(OUT + '/flock-demo.aep'));
            note('saved ' + OUT + '/flock-demo.aep');
        } catch (e2) {
            note('save failed: ' + e2.toString());
        }
        var f = new File(OUT + '/ae-log.txt');
        f.encoding = 'UTF-8';
        f.open('w');
        f.write(log.join('\n') + '\n');
        f.close();
        if ($.global.FLOCK_TEST_QUIT) app.quit();
    } else if (log.length) {
        alert(log.join('\n'));
    }
})();
