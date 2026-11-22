// flock-ae.jsx · the After Effects half of Flock.jsx (build.mjs joins it with flock-sim.js).
//
// In the active comp: one bird layer (a precomp holding one flap cycle in its work area, or
// any footage) and one leader layer (a keyed null). Bakes the comp's work area into
// <name> Bird 001…N: native layers with position, rotation, scale and a "Flap Phase" slider
// keyed every frame, and light expressions that read the sliders on <name> Controls, so the
// look is art-directed live. Re-running replaces the birds and keeps the Controls (and the
// values you set on them).
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
        slider: 'ADBE Slider Control'
    };
    // live controls: name, default value
    var CONTROLS = [
        ['Spread', 100],
        ['Bird Size', 100],
        ['Size Variation', 20],
        ['Perspective', 100],
        ['Orient', 100],
        ['Flap Speed', 100],
        ['Flap Desync', 100]
    ];
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

    function ensureControls(comp, name, above) {
        var c = findLayer(comp, name + ' Controls');
        if (!c) {
            c = comp.layers.addNull(comp.duration);
            c.name = name + ' Controls';
            c.label = 2;
            c.moveBefore(above);
        }
        for (var i = 0; i < CONTROLS.length; i++) {
            var fx = c.property(MN.effects);
            if (!fx.property(CONTROLS[i][0])) {
                var e = fx.addProperty(MN.slider);
                e.name = CONTROLS[i][0];
                e.property(1).setValue(CONTROLS[i][1]);
            }
        }
        return c;
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
            if (l.name.indexOf(bird) === 0 || l.name === name + ' Center') {
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
        var C = q(o.name + ' Controls');
        var kt = keyTimes(t0, F, fps, Math.max(1, Math.round(o.keyStep)));
        var times = kt.times, idx = kt.idx, n, f, j;

        // centroid, for Spread
        var center = comp.layers.addNull(comp.duration);
        center.name = o.name + ' Center';
        var cv = [];
        for (j = 0; j < idx.length; j++) cv.push([sim.center.x[idx[j]], sim.center.y[idx[j]], 0]);
        setKeys(tf(center, MN.position), times, cv);
        center.moveAfter(controls);
        center.guideLayer = true;
        center.enabled = false;
        center.shy = true;

        var exprPos = 'var c = thisComp.layer(' + C + ');\n' +
            'var m = thisComp.layer(' + q(o.name + ' Center') + ').transform.position;\n' +
            'm + (value - m) * c.effect("Spread")(1) / 100;';
        var exprRot = 'value * thisComp.layer(' + C + ').effect("Orient")(1) / 100;';
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
            var P = [], Rt = [], S = [], Ph = [];
            for (j = 0; j < idx.length; j++) {
                f = idx[j];
                P.push([b.x[f], b.y[f], 0]);
                Rt.push(b.rot[f]);
                S.push([b.sx[f], b.sy[f], 100]);
                Ph.push(b.phase[f]);
            }
            var pos = tf(dup, MN.position), rot = tf(dup, MN.rotation), sc = tf(dup, MN.scale);
            setKeys(pos, times, P);
            setKeys(rot, times, Rt);
            setKeys(sc, times, S);
            pos.expression = exprPos;
            rot.expression = exprRot;
            sc.expression = 'var c = thisComp.layer(' + C + ');\n' +
                'var r = ' + b.size.toFixed(4) + ';  // this bird\'s size, -1 … 1\n' +
                'var k = c.effect("Bird Size")(1) / 100 * (1 + c.effect("Size Variation")(1) / 100 * r);\n' +
                'var d = Math.max(Math.abs(value[1]), 0.001);   // depth scale × 100 (baked)\n' +
                'var s = Math.pow(d / 100, c.effect("Perspective")(1) / 100) * k * 100;\n' +
                '[value[0] / d * s, s];';
            if (cyc) {
                var fx = dup.property(MN.effects).addProperty(MN.slider);
                fx.name = 'Flap Phase';
                fx.property(1).setValuesAtTimes(times, Ph);
                // keep the two keys AE adds: removing the last Time Remap key turns
                // time remapping off and hides the property; the expression overrides them
                var tr = dup.property(MN.timeRemap);
                tr.expression = 'var c = thisComp.layer(' + C + ');\n' +
                    'var R = ' + b.offset.toFixed(4) + ';  // this bird\'s phase offset (cycles)\n' +
                    'var p = (effect("Flap Phase")(1) - R) * c.effect("Flap Speed")(1) / 100 + R * c.effect("Flap Desync")(1) / 100;\n' +
                    'p = p - Math.floor(p);\n' +
                    cyc.start + ' + p * ' + cyc.length + ';';
            }
            dup.motionBlur = true;
            dup.shy = true;
            if (n % 4 === 0) say(0.4 + 0.6 * (n / sim.order.length), 'Baking bird ' + (n + 1) + ' of ' + sim.order.length);
        }
        bird.enabled = false; // the original stays as the template for the next build
        comp.hideShyLayers = true;

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
        if (g.bird) ddBird.selection = g.bird.index - 1;
        if (g.leader) ddLeader.selection = g.leader.index - 1;

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
                'Shy layers are hidden: toggle "Hide shy layers" to see them.');
        } catch (e) {
            pw.close();
            alert('Flock: ' + e.toString() + (e.line ? ' (line ' + e.line + ')' : ''));
        } finally {
            app.endUndoGroup();
        }
    }

    return { build: build, run: run, defaults: DEFAULTS, controls: CONTROLS };
})();

if (!$.global.FLOCK_NO_UI) FlockRig.run();
