// flock-ae.jsx · the After Effects half of Flock.jsx (build.mjs joins it with flock-sim.js
// and pastes flock-math.js into the expressions).
//
// In the active comp: one bird layer (a precomp holding one flap cycle in its work area, or
// any footage) and one leader layer (a keyed null). Bakes the comp's work area into
// <name> Bird 001…N: native layers with position, rotation, scale and "Facing" / "Flap
// Phase" sliders keyed every frame, and expressions that read the sliders on <name>
// Controls, so the shape and look are art-directed live. Re-running replaces the birds and
// keeps the Controls (and the values you set on them).
//
// ExtendScript is ES3: no let/const, arrows, JSON, Array.indexOf/forEach.
var FlockRig = (function () {
    var MN = {
        transform: 'ADBE Transform Group',
        position: 'ADBE Position',
        rotation: 'ADBE Rotate Z',
        scale: 'ADBE Scale',
        timeRemap: 'ADBE Time Remapping',
        effects: 'ADBE Effect Parade',
        slider: 'ADBE Slider Control',
        point: 'ADBE Point Control',
        angle: 'ADBE Angle Control'
    };
    // Live controls on "<name> Controls", in panel order. The names explain themselves in
    // the Effect Controls panel; `old` is the round-1 name, renamed in place (value kept).
    var CONTROLS = [
        { key: 'spread', name: 'Spread % (flock size)', value: 100, old: 'Spread' },
        { key: 'length', name: 'Length % (along travel)', value: 100 },
        { key: 'width', name: 'Width % (across travel)', value: 100 },
        { key: 'angle', name: 'Shape Angle (0 = travel)', value: 0, angle: true },
        { key: 'clump', name: 'Clumping (+ core, - even)', value: 0 },
        { key: 'scatter', name: 'Scatter px (per bird)', value: 0 },
        { key: 'scatterSpeed', name: 'Scatter Speed (0 = still)', value: 0.5 },
        { key: 'scatterSeed', name: 'Scatter Seed', value: 1 },
        { key: 'size', name: 'Bird Size %', value: 100, old: 'Bird Size' },
        { key: 'sizeVar', name: 'Size Variation % (+/-)', value: 20, old: 'Size Variation' },
        { key: 'persp', name: 'Perspective % (depth size)', value: 100, old: 'Perspective' },
        { key: 'orient', name: 'Orient % (0 = always level)', value: 100, old: 'Orient' },
        { key: 'turnWidth', name: 'Turn Width % (0 = edge-on)', value: 30 },
        { key: 'headOn', name: 'Head-On % (turn drawing)', value: 60 },
        { key: 'flapSpeed', name: 'Flap Speed %', value: 100, old: 'Flap Speed' },
        { key: 'desync', name: 'Flap Desync % (0 = unison)', value: 100, old: 'Flap Desync' }
    ];
    var FLOCK_MATH = ''; // build.mjs puts flock-math.js here (comments stripped)
    // The most the live controls may add to a bird's speed, as a share of the flock's
    // cruising speed: the shape controls, then the scatter on top.
    var SHAPE_BUDGET = 0.35, SCATTER_BUDGET = 0.1;
    var DEFAULTS = {
        name: 'Flock',
        count: 80,
        spacing: 40,
        follow: 50,
        lead: 0.4,
        turbulence: 40,
        glide: 50,
        seed: 1,
        preroll: 3,
        keyStep: 1,
        faces: 1
    };

    function q(s) {
        return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    }

    function pad(n, w) {
        var s = String(n);
        while (s.length < w) s = '0' + s;
        return s;
    }

    function findLayer(comp, name) {
        for (var i = 1; i <= comp.numLayers; i++) if (comp.layer(i).name === name) return comp.layer(i);
        return null;
    }

    function tf(layer, mn) {
        return layer.property(MN.transform).property(mn);
    }

    function clearProp(prop) {
        if (prop.expression !== '') prop.expression = '';
        while (prop.numKeys > 0) prop.removeKey(prop.numKeys);
    }

    function isBirdSource(layer) {
        return layer instanceof AVLayer && !layer.nullLayer && layer.source &&
            (layer.source instanceof CompItem || layer.source instanceof FootageItem);
    }

    function cycleOf(layer) {
        var s = layer.source;
        if (s instanceof CompItem) return { start: s.workAreaStart, length: s.workAreaDuration };
        if (s instanceof FootageItem && s.mainSource && !s.mainSource.isStill && s.duration > 0) return { start: 0, length: s.duration };
        return null; // a still: no flapping
    }

    // The leader's comp-space position per frame, read through a temporary null so that
    // parenting, anchor points and expressions on the leader are all accounted for.
    function sampleLeader(comp, leader, t0, F, fps) {
        var tmp = comp.layers.addNull(comp.duration);
        tmp.name = 'Flock sampler (temporary)';
        var pos = tf(tmp, MN.position);
        // by index, not name: several layers can share a name
        pos.expression = 'var L = thisComp.layer(' + leader.index + '); var p = L.toComp(L.anchorPoint); [p[0], p[1]];';
        var X = [], Y = [];
        for (var f = 0; f < F; f++) {
            var v = pos.valueAtTime(t0 + f / fps, false);
            X.push(v[0]);
            Y.push(v[1]);
        }
        var err = pos.expressionError;
        tmp.remove();
        if (err) throw new Error('Could not read the leader\'s position: ' + err);
        return { x: X, y: Y };
    }

    // A turn drawing: a composition marker in the bird precomp whose comment contains
    // "turn", at the start of a head-on flap cycle (the marker's duration = that cycle's
    // length; 0 = as long as the side-view cycle).
    function turnOf(layer, cyc) {
        var s = layer.source;
        if (!cyc || !(s instanceof CompItem) || !s.markerProperty) return null;
        var mk = s.markerProperty;
        for (var i = 1; i <= mk.numKeys; i++) {
            var v = mk.keyValue(i);
            if (/turn/i.test(v.comment)) return { start: mk.keyTime(i), length: v.duration > 0 ? v.duration : cyc.length };
        }
        return null;
    }

    function ensureControls(comp, name, above) {
        var c = findLayer(comp, name + ' Controls');
        if (!c) {
            c = comp.layers.addNull(comp.duration);
            c.name = name + ' Controls';
            c.label = 2;
            c.moveBefore(above);
        }
        var i, C, fx, e;
        for (i = 0; i < CONTROLS.length; i++) {
            C = CONTROLS[i];
            fx = c.property(MN.effects);
            if (fx.property(C.name)) continue;
            if (C.old && fx.property(C.old)) {
                fx.property(C.old).name = C.name; // a round-1 rig: keep the value
                continue;
            }
            e = fx.addProperty(C.angle ? MN.angle : MN.slider);
            e.name = C.name;
            c.property(MN.effects).property(C.name).property(1).setValue(C.value);
        }
        for (i = 0; i < CONTROLS.length; i++) {
            e = c.property(MN.effects).property(CONTROLS[i].name);
            if (e.propertyIndex !== i + 1) e.moveTo(i + 1);
        }
        return c;
    }

    // The expressions a bird carries, as strings (test.mjs runs these very strings).
    // k: { name, id (bird number), faces (1 | -1), size (-1 … 1), offset (0 … 1),
    //      cycle: { start, length } | null, turn: { start, length } | null,
    //      t0, t1: first and last baked key (s), dt: one frame (s), radius: the flock's
    //      typical RMS radius (px), cruise: its cruising speed (px/s), leader: its name }
    function expressions(k) {
        var N = {}, i;
        for (i = 0; i < CONTROLS.length; i++) N[CONTROLS[i].key] = 'v(' + q(CONTROLS[i].name) + ')';
        var ctl = 'var c = thisComp.layer(' + q(k.name + ' Controls') + ');\n' +
            'function v(n) { return c.effect(n)(1).value; }\n';
        var head = FLOCK_MATH + '\n' + ctl;
        var face = 'flockFacing(effect("Facing")(1).value, ' + k.faces + ', ' + N.turnWidth + ' / 100, ' +
            N.headOn + ' / 100, ' + (k.turn ? 'true' : 'false') + ')';
        var out = {}, T = k.t0 + ', ' + k.t1 + ', ' + k.dt;
        // On Flock Center, once a frame for the whole flock: the window the shape works over
        // (long enough to keep birds at flying speed), and the flock's mean axis of travel
        // and mean radius over it, from the baked running sums.
        out.window = '// Flock rig: shape window (s)\n' + head +
            'Math.max(' + 2 * k.dt + ', flockWindow(' + N.spread + ', ' + N.length + ', ' + N.width + ', ' + N.clump + ', ' +
            k.radius + ', ' + SHAPE_BUDGET * k.cruise + '));';
        out.axis = '// Flock rig: mean axis of travel over the shape window\n' + head +
            'var W = effect("Shape Window")(1).value, S = effect("Axis Sum")(1);\n' +
            'flockMean(function (t) { return S.valueAtTime(t); }, time, W, ' + T + ');';
        out.radius = '// Flock rig: mean radius over the shape window\n' + head +
            'var W = effect("Shape Window")(1).value, S = effect("Radius Sum")(1);\n' +
            'flockMean(function (t) { return [S.valueAtTime(t), 0]; }, time, W, ' + T + ')[0];';
        if (k.leader) {
            // The leader check (a guide text layer): how far the leader now is from the path the
            // flock was simulated on. The birds are baked keys, so a moved leader needs a re-run;
            // this says so in the viewer instead of nothing. Compared at the baked keys only
            // (up to 200 of them), where the stored path is exact: between keys it is a straight
            // blend that cuts a fast curve's corners by a few px, a false "moved" (seen: 3.1 px).
            var chk = 'function flockLeaderOff() {\n' +
                '    var L, P;\n' +
                '    try {\n' +
                '        L = thisComp.layer(' + q(k.leader) + ');\n' +
                '        P = thisComp.layer(' + q(k.name + ' Center') + ').effect("Leader Path")(1);\n' +
                '    } catch (e) {\n' +
                '        return -1;\n' +
                '    }\n' +
                '    var n = P.numKeys, step = Math.max(1, Math.ceil(n / 200)), d = 0, i, key, t, a, b;\n' +
                '    for (i = 1; i <= n; i += step) {\n' +
                '        key = P.key(i);\n' +
                '        t = key.time;\n' +
                '        a = L.toComp(L.anchorPoint.valueAtTime(t), t);\n' +
                '        b = key.value;\n' +
                '        d = Math.max(d, Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1])));\n' +
                '    }\n' +
                '    return d;\n' +
                '}\n' +
                'var d = flockLeaderOff();\n';
            out.checkOpacity = '// Flock rig: leader check\n' + chk + '(d < 0 || d > 2) ? 100 : 0;';
            out.checkText = '// Flock rig: leader check\n' + chk + 'd < 0 ? ' +
                q(k.name + ': can\'t find the leader "' + k.leader + '". Re-run Flock.jsx.') + ' : ' +
                q(k.name + ': the leader has moved since the bake (up to ') + ' + Math.round(d) + ' +
                q(' px). The birds still fly the old path: re-run Flock.jsx in this comp.') + ';';
        }
        out.position = '// Flock rig: position (shape and scatter)\n' + head +
            'var M = thisComp.layer(' + q(k.name + ' Center') + ');\n' +
            'var m = M.transform.position.value;\n' +
            'var sp = ' + N.spread + ', ln = ' + N.length + ', wd = ' + N.width + ', cl = ' + N.clump + ';\n' +
            'var p = [value[0], value[1]];\n' +
            'if (sp != 100 || ln != 100 || wd != 100 || cl != 0) {\n' +
            '    // the shape works on this bird\'s mean offset over the window (Flock Center)\n' +
            '    var W = M.effect("Shape Window")(1).value, A = M.effect("Shape Axis")(1).value, OS = effect("Offset Sum")(1);\n' +
            '    var d = flockMean(function (t) { return OS.valueAtTime(t); }, time, W, ' + T + ');\n' +
            '    var o = flockShape(d[0], d[1], value[0] - m[0], value[1] - m[1], A[0], A[1], M.effect("Shape Radius")(1).value, ' +
            'sp, ln, wd, ' + N.angle + ', cl);\n' +
            '    p = [m[0] + o[0], m[1] + o[1]];\n' +
            '}\n' +
            'var amt = ' + N.scatter + ';\n' +
            'if (amt > 0) {\n' +
            '    var spd = flockScatterSpeed(' + N.scatterSpeed + ', amt, ' + SCATTER_BUDGET * k.cruise + ');\n' +
            '    seedRandom(Math.round(' + N.scatterSeed + ') * 1013 + ' + k.id + ', spd <= 0);\n' +
            '    var w = spd > 0 ? sub(wiggle(spd, amt), value) : [random(-amt, amt), random(-amt, amt)];\n' +
            '    p = [p[0] + w[0], p[1] + w[1]];\n' +
            '}\n' +
            'p;';
        out.rotation = '// Flock rig: rotation\n' + head + 'flockOrient(value, ' + N.orient + ');';
        out.scale = '// Flock rig: scale (size, depth, turning)\n' + head +
            'var f = ' + face + ';\n' +
            'var s = flockSize(Math.max(Math.abs(value[1]), 0.001) / 100, ' + N.persp + ', ' + N.size + ', ' + N.sizeVar + ', ' + k.size.toFixed(4) + ');\n' +
            'flockScale(f, s, value[1] < 0 ? -1 : 1);';
        if (k.cycle) {
            out.timeRemap = '// Flock rig: time remap (flap cycle, head-on drawing)\n' + head +
                'var f = ' + face + ';\n' +
                'var q = flockCycle(effect("Flap Phase")(1).value, ' + k.offset.toFixed(4) + ', ' + N.flapSpeed + ', ' + N.desync + ');\n' +
                (k.turn ? 'f[1] ? ' + k.turn.start + ' + q * ' + k.turn.length + ' : ' : '') +
                k.cycle.start + ' + q * ' + k.cycle.length + ';';
        }
        return out;
    }

    // The leader check's look: bold yellow with a thick near-black outline, readable over a
    // light sky, a dark one or the birds (orange without an outline was hard to read).
    function styleCheck(layer) {
        var tdp = layer.property('ADBE Text Properties').property('ADBE Text Document'), td = tdp.value;
        try {
            td.font = 'Arial-BoldMT';
        } catch (e) {}
        td.fontSize = 30;
        td.applyFill = true;
        td.fillColor = [1, 0.86, 0.2];
        td.applyStroke = true;
        td.strokeColor = [0.06, 0.06, 0.08];
        td.strokeWidth = 6;
        td.strokeOverFill = false;
        td.justification = ParagraphJustification.LEFT_JUSTIFY;
        tdp.setValue(td);
        tf(layer, MN.position).setValue([40, 60]);
    }

    function addKeyedPoint(layer, name, times, values) {
        layer.property(MN.effects).addProperty(MN.point).name = name;
        layer.property(MN.effects).property(name).property(1).setValuesAtTimes(times, values);
    }

    function addKeyedSlider(layer, name, times, values) {
        layer.property(MN.effects).addProperty(MN.slider).name = name;
        layer.property(MN.effects).property(name).property(1).setValuesAtTimes(times, values);
    }

    function readSettings(controls) {
        if (!controls || !controls.comment) return null;
        try {
            var s = eval(controls.comment);
            return s && typeof s === 'object' ? s : null;
        } catch (e) {
            return null;
        }
    }

    function removePrevious(comp, name) {
        var bird = name + ' Bird ', n = 0;
        for (var i = comp.numLayers; i >= 1; i--) {
            var l = comp.layer(i);
            if (l.name.indexOf(bird) === 0 || l.name === name + ' Center' || l.name === name + ' Leader Check') {
                l.locked = false;
                l.remove();
                n++;
            }
        }
        return n;
    }

    function keyTimes(t0, F, fps, step) {
        var idx = [], times = [];
        for (var f = 0; f < F; f += step) idx.push(f);
        if (idx[idx.length - 1] !== F - 1) idx.push(F - 1);
        for (var k = 0; k < idx.length; k++) times.push(t0 + idx[k] / fps);
        return { idx: idx, times: times };
    }

    function setKeys(prop, times, values) {
        clearProp(prop);
        if (prop.matchName === MN.position && prop.dimensionsSeparated) prop.dimensionsSeparated = false;
        prop.setValuesAtTimes(times, values);
    }

    // build(comp, birdLayer, leaderLayer, options, progress?) → a report object
    function build(comp, bird, leader, opts, progress) {
        var o = {}, k;
        for (k in DEFAULTS) o[k] = DEFAULTS[k];
        for (k in opts) o[k] = opts[k];
        if (!(comp instanceof CompItem)) throw new Error('Open a composition first.');
        if (!isBirdSource(bird)) throw new Error('The bird must be a precomp or footage layer.');
        if (!leader || leader === bird) throw new Error('Pick a leader layer different from the bird.');
        if (bird.name.indexOf(o.name + ' Bird ') === 0) throw new Error('"' + bird.name + '" is a generated bird: pick the original bird layer.');
        var say = progress || function () {};
        var fps = comp.frameRate, t0 = comp.workAreaStart;
        var F = Math.max(2, Math.round(comp.workAreaDuration * fps));
        var t1 = t0 + F / fps;
        var report = { frames: F, fps: fps };
        var clock = new Date().getTime();

        say(0, 'Reading the leader');
        var removed = removePrevious(comp, o.name);
        // sampled past the work area by the lead, so the flock aims ahead to the very end
        var L = sampleLeader(comp, leader, t0, F + Math.ceil(Math.max(0, o.lead) * fps) + 1, fps);
        var cyc = cycleOf(bird);
        var turn = turnOf(bird, cyc);
        report.turnDrawing = turn ? turn.start + ' + ' + turn.length + ' s' : 'none';

        say(0.02, 'Simulating ' + o.count + ' birds');
        var sim = FlockSim.run({
            leaderX: L.x, leaderY: L.y, frames: F, lead: o.lead, fps: fps,
            count: o.count, spacing: o.spacing, follow: o.follow, turbulence: o.turbulence,
            glide: o.glide, seed: o.seed, preroll: o.preroll, faces: o.faces,
            cycle: cyc ? cyc.length : 0.5,
            progress: function (u) { say(0.02 + 0.38 * u, 'Simulating ' + o.count + ' birds'); }
        });
        report.simMs = new Date().getTime() - clock;
        clock = new Date().getTime();

        var controls = ensureControls(comp, o.name, bird);
        var kt = keyTimes(t0, F, fps, Math.max(1, Math.round(o.keyStep)));
        var times = kt.times, idx = kt.idx, n, f, j;

        // the flock's centre, size and heading: what the shape controls work around
        var center = comp.layers.addNull(comp.duration);
        center.name = o.name + ' Center';
        var cv = [], cr = [], ch = [], ca = [], cs = [], lpath = [];
        for (j = 0; j < idx.length; j++) {
            cv.push([sim.center.x[idx[j]], sim.center.y[idx[j]], 0]);
            cr.push(sim.center.radius[idx[j]]);
            ch.push(sim.center.heading[idx[j]]);
            ca.push([sim.center.axisX[idx[j]], sim.center.axisY[idx[j]]]);
            cs.push(sim.center.radiusSum[idx[j]]);
            lpath.push([L.x[idx[j]], L.y[idx[j]]]);
        }
        setKeys(tf(center, MN.position), times, cv);
        addKeyedSlider(center, 'Radius', times, cr);
        addKeyedSlider(center, 'Heading', times, ch);
        // running sums: the expressions read the flock's mean axis of travel and mean radius
        // over any window
        addKeyedPoint(center, 'Axis Sum', times, ca);
        addKeyedSlider(center, 'Radius Sum', times, cs);
        // the leader's path as simulated, for the leader check
        addKeyedPoint(center, 'Leader Path', times, lpath);
        // computed once a frame for every bird to read
        var kf = {
            name: o.name, id: 0, faces: 1, size: 0, offset: 0, cycle: null, turn: null,
            t0: times[0], t1: times[times.length - 1], dt: 1 / fps,
            radius: Math.round(sim.center.radiusRef * 100) / 100, cruise: Math.round(sim.stats.cruise),
            leader: leader.name
        };
        var cex = expressions(kf);
        center.property(MN.effects).addProperty(MN.slider).name = 'Shape Window';
        center.property(MN.effects).addProperty(MN.point).name = 'Shape Axis';
        center.property(MN.effects).addProperty(MN.slider).name = 'Shape Radius';
        center.property(MN.effects).property('Shape Window').property(1).expression = cex.window;
        center.property(MN.effects).property('Shape Axis').property(1).expression = cex.axis;
        center.property(MN.effects).property('Shape Radius').property(1).expression = cex.radius;
        center.moveAfter(controls);
        center.guideLayer = true;
        center.enabled = false;
        center.shy = true;

        for (n = 0; n < sim.order.length; n++) {
            var i = sim.order[n], b = sim.birds[i];
            var dup = bird.duplicate();
            dup.name = o.name + ' Bird ' + pad(n + 1, 3);
            dup.parent = null;
            if (dup.threeDLayer) dup.threeDLayer = false;
            dup.enabled = true;
            if (cyc) {
                dup.timeRemapEnabled = true;
                dup.startTime = t0;
                dup.inPoint = t0;
                dup.outPoint = t1;
            } else {
                dup.inPoint = t0;
                dup.outPoint = t1;
            }
            var P = [], Rt = [], S = [], Fc = [], Ph = [], Os = [];
            for (j = 0; j < idx.length; j++) {
                f = idx[j];
                P.push([b.x[f], b.y[f], 0]);
                Rt.push(b.rot[f]);
                S.push([100 * b.ds[f], 100 * b.ds[f] * b.up[f], 100]); // depth and the upside-down pose; facing is its own slider
                Fc.push(b.face[f]);
                Ph.push(b.phase[f]);
                Os.push([b.sumX[f], b.sumY[f]]);
            }
            var pos = tf(dup, MN.position), rot = tf(dup, MN.rotation), sc = tf(dup, MN.scale);
            setKeys(pos, times, P);
            setKeys(rot, times, Rt);
            setKeys(sc, times, S);
            addKeyedSlider(dup, 'Facing', times, Fc);
            if (cyc) addKeyedSlider(dup, 'Flap Phase', times, Ph);
            // a running sum: its mean offset from the centre over any window
            addKeyedPoint(dup, 'Offset Sum', times, Os);
            var ex = expressions({
                name: o.name, id: n + 1, faces: o.faces === -1 ? -1 : 1, size: b.size, offset: b.offset, cycle: cyc, turn: turn,
                t0: times[0], t1: times[times.length - 1], dt: 1 / fps,
                radius: Math.round(sim.center.radiusRef * 100) / 100, cruise: Math.round(sim.stats.cruise)
            });
            // re-fetched: adding effects invalidates references to the layer's properties
            tf(dup, MN.position).expression = ex.position;
            tf(dup, MN.rotation).expression = ex.rotation;
            tf(dup, MN.scale).expression = ex.scale;
            // keep the two keys AE adds: removing the last Time Remap key turns time
            // remapping off and hides the property; the expression overrides them
            if (cyc) dup.property(MN.timeRemap).expression = ex.timeRemap;
            dup.motionBlur = true;
            dup.shy = true;
            if (n % 4 === 0) say(0.4 + 0.6 * (n / sim.order.length), 'Baking bird ' + (n + 1) + ' of ' + sim.order.length);
        }
        bird.enabled = false; // the original stays as the template for the next build
        comp.hideShyLayers = true;

        // A guide line at the top of the viewer (never rendered) that appears when the leader
        // no longer matches the path the flock was simulated on: the birds are baked keys,
        // so moving the leader needs a re-run.
        var ck = comp.layers.addText(o.name);
        ck.name = o.name + ' Leader Check';
        styleCheck(ck);
        ck.property('ADBE Text Properties').property('ADBE Text Document').expression = cex.checkText;
        tf(ck, 'ADBE Opacity').expression = cex.checkOpacity;
        ck.guideLayer = true;
        ck.label = 2;
        ck.locked = true;
        report.leaderCheck = ck.name;

        var saved = {};
        for (k in DEFAULTS) saved[k] = o[k];
        saved.bird = bird.name;
        saved.leader = leader.name;
        controls.comment = saved.toSource();

        report.bakeMs = new Date().getTime() - clock;
        report.birds = sim.order.length;
        report.keysPerProperty = times.length;
        report.removed = removed;
        report.cruise = Math.round(sim.stats.cruise);
        say(1, 'Done');
        return report;
    }

    // ---- dialog -------------------------------------------------------------------------

    function layerList(comp) {
        var names = [];
        for (var i = 1; i <= comp.numLayers; i++) names.push(i + '. ' + comp.layer(i).name);
        return names;
    }

    function guessLayers(comp, name) {
        var bird = null, leader = null, sel = comp.selectedLayers, i;
        var prev = readSettings(findLayer(comp, name + ' Controls'));
        for (i = 0; i < sel.length; i++) {
            if (!bird && isBirdSource(sel[i]) && sel[i].name.indexOf(name + ' Bird ') !== 0) bird = sel[i];
            else if (!leader && sel[i] !== bird) leader = sel[i];
        }
        if (prev) {
            if (!bird && prev.bird) bird = findLayer(comp, prev.bird);
            if (!leader && prev.leader) leader = findLayer(comp, prev.leader);
        }
        if (!leader) for (i = 1; i <= comp.numLayers; i++) if (comp.layer(i).nullLayer && comp.layer(i).name.indexOf(name) !== 0) { leader = comp.layer(i); break; }
        return { bird: bird, leader: leader, prev: prev };
    }

    function showDialog(comp) {
        var g = guessLayers(comp, DEFAULTS.name);
        var s = {}, k;
        for (k in DEFAULTS) s[k] = DEFAULTS[k];
        if (g.prev) for (k in g.prev) s[k] = g.prev[k];

        var w = new Window('dialog', 'Flock');
        w.orientation = 'column';
        w.alignChildren = 'fill';
        var names = layerList(comp);

        var pl = w.add('panel', undefined, 'Layers');
        pl.alignChildren = 'left';
        var r1 = pl.add('group');
        r1.add('statictext', undefined, 'Bird (precomp, one flap cycle in its work area):').preferredSize.width = 300;
        var ddBird = r1.add('dropdownlist', undefined, names);
        ddBird.preferredSize.width = 220;
        var r2 = pl.add('group');
        r2.add('statictext', undefined, 'Leader (keyed null the flock follows):').preferredSize.width = 300;
        var ddLeader = r2.add('dropdownlist', undefined, names);
        ddLeader.preferredSize.width = 220;
        var r3 = pl.add('group');
        r3.add('statictext', undefined, 'The bird in its precomp faces:').preferredSize.width = 300;
        var ddFaces = r3.add('dropdownlist', undefined, ['Right', 'Left']);
        ddFaces.selection = s.faces === -1 ? 1 : 0;
        var turnInfo = pl.add('statictext', undefined, '', { multiline: true });
        turnInfo.preferredSize = [530, 32];
        ddBird.onChange = function () {
            var L = ddBird.selection ? comp.layer(ddBird.selection.index + 1) : null;
            var cy = L && isBirdSource(L) ? cycleOf(L) : null, tn = L && cy ? turnOf(L, cy) : null;
            turnInfo.text = tn ?
                'Turn drawing found (marker "turn" at ' + tn.start + ' s): birds show it head-on while turning.' :
                'No turn drawing: turning birds squash sideways. For a head-on view, add a head-on flap cycle to the precomp and a composition marker named "turn" at its start.';
        };
        if (g.bird) ddBird.selection = g.bird.index - 1;
        if (g.leader) ddLeader.selection = g.leader.index - 1;
        ddBird.onChange();

        var ps = w.add('panel', undefined, 'Simulation (re-run to change)');
        ps.alignChildren = 'left';
        var fields = {};
        function field(key, label, help) {
            var r = ps.add('group');
            r.add('statictext', undefined, label).preferredSize.width = 150;
            var e = r.add('edittext', undefined, String(s[key]));
            e.characters = 7;
            r.add('statictext', undefined, help);
            fields[key] = e;
        }
        field('name', 'Flock name', 'layer prefix; one Controls layer per name');
        field('count', 'Birds', 'layers to create');
        field('spacing', 'Spacing (px)', 'usual gap between neighbours');
        field('follow', 'Follow (0-100)', 'how closely the flock tracks the leader');
        field('lead', 'Lead (s)', 'aims this far ahead on the path (0 = trails the null)');
        field('turbulence', 'Turbulence (0-100)', 'wandering inside the flock');
        field('glide', 'Glide (0-100)', 'slower flapping when diving');
        field('seed', 'Seed', 'a different flock, same settings');
        field('preroll', 'Pre-roll (s)', 'simulated before the work area');
        field('keyStep', 'Key every', 'frames (1 = every frame)');

        var dur = Math.round(comp.workAreaDuration * comp.frameRate);
        w.add('statictext', undefined, 'Bakes the work area (' + dur + ' frames). Live look: sliders on "<name> Controls".');
        var bt = w.add('group');
        bt.alignment = 'right';
        bt.add('button', undefined, 'Cancel', { name: 'cancel' });
        bt.add('button', undefined, 'Build', { name: 'ok' });
        if (w.show() !== 1) return null;
        if (!ddBird.selection || !ddLeader.selection) {
            alert('Pick a bird layer and a leader layer.');
            return null;
        }
        var out = {
            bird: comp.layer(ddBird.selection.index + 1),
            leader: comp.layer(ddLeader.selection.index + 1),
            opts: { faces: ddFaces.selection.index === 1 ? -1 : 1 }
        };
        for (k in fields) {
            var v = fields[k].text;
            out.opts[k] = k === 'name' ? (v.replace(/^\s+|\s+$/g, '') || 'Flock') : Number(v);
            if (k !== 'name' && isNaN(out.opts[k])) {
                alert('"' + v + '" is not a number.');
                return null;
            }
        }
        return out;
    }

    function run() {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            alert('Flock: open the composition that holds the bird and the leader.');
            return;
        }
        var d = showDialog(comp);
        if (!d) return;
        var pw = new Window('palette', 'Flock');
        var label = pw.add('statictext', undefined, 'Starting');
        label.preferredSize.width = 320;
        var bar = pw.add('progressbar', undefined, 0, 100);
        bar.preferredSize.width = 320;
        pw.show();
        app.beginUndoGroup('Flock');
        try {
            var rep = build(comp, d.bird, d.leader, d.opts, function (u, msg) {
                bar.value = Math.round(u * 100);
                label.text = msg;
                pw.update();
            });
            pw.close();
            alert('Flock: ' + rep.birds + ' birds over ' + rep.frames + ' frames (simulation ' +
                (rep.simMs / 1000).toFixed(1) + ' s, baking ' + (rep.bakeMs / 1000).toFixed(1) + ' s).\n' +
                'Turn drawing: ' + rep.turnDrawing + '.\n' +
                'Shy layers are hidden: toggle "Hide shy layers" to see them.');
        } catch (e) {
            pw.close();
            alert('Flock: ' + e.toString() + (e.line ? ' (line ' + e.line + ')' : ''));
        } finally {
            app.endUndoGroup();
        }
    }

    return { build: build, run: run, defaults: DEFAULTS, controls: CONTROLS, expressions: expressions, styleCheck: styleCheck, math: FLOCK_MATH };
})();

// FLOCK_NO_UI: a test loads the script without the dialog. $.global outlives the script in
// an AE session, so the flag is used up here: one left behind by a test must not silently
// stop the user's own next run (it did once).
var FLOCK_SKIP_UI = $.global.FLOCK_NO_UI === true;
$.global.FLOCK_NO_UI = false;
if (!FLOCK_SKIP_UI) FlockRig.run();
