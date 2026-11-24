// make-demo.jsx · builds a small After Effects project that shows Flock.jsx at work:
// a "Bird" precomp (a 0.5 s side-view flap cycle in its work area, and a head-on cycle
// after it marked "turn"), a "Leader" null keyed along a swoop with a loop, and the flock
// baked from them in the "Sky" comp.
//
// Run it in an empty project: File > Scripts > Run Script File… (Flock.jsx must sit next to it).
//
// Test mode (used by the repo to check the script without a person at the keyboard): set
// $.global.FLOCK_TEST_OUT to a folder before running it. It opens a new project, also builds
// "Sky shaped" and "Sky spread" (the shape controls pushed), "Turn check" and a round-1
// Controls layer to migrate, reads bird speeds back from AE, writes ae-log.txt after every
// step, ae-dump.json for check-ae.mjs (AE's numbers against Node's) and saves
// flock-demo.aep there; the runner renders it with aerender. It quits After Effects only if
// $.global.FLOCK_TEST_QUIT is set.
(function () {
    var OUT = $.global.FLOCK_TEST_OUT || null, QUIT = !!$.global.FLOCK_TEST_QUIT;
    var here = $.global.FLOCK_DIR ? new Folder($.global.FLOCK_DIR) : File($.fileName).parent;
    // $.global outlives this script in the AE session: cleared at once, so a later run by
    // hand builds the demo instead of repeating the test
    $.global.FLOCK_TEST_OUT = null;
    $.global.FLOCK_TEST_QUIT = null;
    $.global.FLOCK_DIR = null;
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
    var birdComp, comp, birdLayer, leader, shaped, rep;
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
        rep = $.global.FlockRig.build(comp, birdLayer, leader, { name: 'Flock', count: 80, spacing: 45, seed: 7 });
        note('build: ' + rep.toSource() + ' total ' + (new Date().getTime() - t) + ' ms');
        comp.openInViewer();
    });

    // Bird speeds in a comp, read back from AE: every 4th bird, every frame. extra = how much
    // the live controls add to a bird's speed (final vs baked position) × cruise; ratio = a
    // bird's speed / the sampled flock's mean baked speed that frame.
    function pct(a, p) {
        a.sort(function (x, y) {
            return x - y;
        });
        return a[Math.min(a.length - 1, Math.floor(p * a.length))];
    }
    function speeds(c, label) {
        var L = [], n, f, i, extra = [], ratio = [], maxMove = 0;
        for (n = 1; n <= c.numLayers; n++) if (c.layer(n).name.indexOf('Flock Bird ') === 0 && (L.length === 0 || n % 4 === 0)) L.push(c.layer(n).property('ADBE Transform Group').property('ADBE Position'));
        var pre = [], post = [];
        for (i = 0; i < L.length; i++) {
            pre.push([]);
            post.push([]);
            for (f = 0; f < 192; f++) {
                var a = L[i].valueAtTime(f / 24, true), b = L[i].valueAtTime(f / 24, false);
                pre[i].push(a);
                post[i].push(b);
                maxMove = Math.max(maxMove, Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
            }
            if (L[i].expressionError) throw new Error(label + ': ' + L[i].expressionError);
        }
        for (f = 1; f < 191; f++) {
            var mean = 0, v = [], s = [];
            for (i = 0; i < L.length; i++) {
                var sx = (pre[i][f + 1][0] - pre[i][f - 1][0]) * 12, sy = (pre[i][f + 1][1] - pre[i][f - 1][1]) * 12;
                var vx = (post[i][f + 1][0] - post[i][f - 1][0]) * 12, vy = (post[i][f + 1][1] - post[i][f - 1][1]) * 12;
                mean += Math.sqrt(sx * sx + sy * sy) / L.length;
                v.push(Math.sqrt(vx * vx + vy * vy));
                extra.push(Math.sqrt((vx - sx) * (vx - sx) + (vy - sy) * (vy - sy)) / rep.cruise);
            }
            for (i = 0; i < v.length; i++) ratio.push(v[i] / mean);
        }
        note(label + ' (' + L.length + ' birds, every frame): speed added by the controls p99 ' + q(pct(extra, 0.99)) + ', max ' + q(pct(extra, 1)) +
            ' x cruise; bird / flock speed p99 ' + q(pct(ratio, 0.99)) + ', max ' + q(pct(ratio, 1)) + '; largest move off the baked path ' + q(maxMove) + ' px');
    }

    if (ok && OUT) {
        step('defaults are the simulation', function () {
            // the round-1 migration above left Spread at 80: a copy at the true defaults
            var dc = comp.duplicate();
            dc.name = 'Sky defaults';
            dc.layer('Flock Controls').property('ADBE Effect Parade').property('Spread % (flock size)').property(1).setValue(100);
            speeds(dc, 'Sky defaults (Spread 100)');
            dc.remove();
            speeds(comp, 'Sky (Spread 80, migrated)');
        });
        step('wiggle speed', function () {
            // how fast AE's wiggle(freq, amt) moves, per freq x amt (Scatter's speed cap uses it)
            var tmp = comp.layers.addNull(comp.duration), p = tmp.property('ADBE Transform Group').property('ADBE Position'), sp = [], f;
            p.expression = 'wiggle(2, 50)';
            var prev = p.valueAtTime(0, false);
            for (f = 1; f <= 4800; f++) {
                var cur = p.valueAtTime(f / 240, false);
                sp.push(Math.sqrt((cur[0] - prev[0]) * (cur[0] - prev[0]) + (cur[1] - prev[1]) * (cur[1] - prev[1])) * 240 / (2 * 50));
                prev = cur;
            }
            tmp.remove();
            note('wiggle(2, 50) over 20 s: speed / (freq x amt) median ' + q(pct(sp, 0.5)) + ', p99 ' + q(pct(sp, 0.99)) + ', max ' + q(pct(sp, 1)));
        });
        step('spread comp', function () {
            var sc = comp.duplicate();
            sc.name = 'Sky spread';
            sc.layer('Flock Controls').property('ADBE Effect Parade').property('Spread % (flock size)').property(1).setValue(300);
            speeds(sc, 'Sky spread (Spread 300)');
        });
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
            var cfx = shaped.layer('Flock Center').property('ADBE Effect Parade'), names = [];
            for (var j = 1; j <= cfx.numProperties; j++) names.push(cfx.property(j).name + ' (' + cfx.property(j).property(1).numKeys + ' keys)');
            note('Flock Center effects: ' + names.join(', ') + '; bird 001: ' + shaped.layer('Flock Bird 001').property('ADBE Effect Parade').numProperties + ' effects');
            speeds(shaped, 'Sky shaped (Length 250, Width 55, Clumping 60, Scatter 12 at 0.7)');
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
        step('leader moved', function () {
            // The user's case: the leader's first key moved in a copy of the comp. The baked
            // flock stays put, so the leader check must show; a re-run in that comp must start
            // the flock at the new leader, and the check go away.
            var lm = comp.duplicate();
            lm.name = 'Leader moved';
            var lp = lm.layer('Leader').property('ADBE Transform Group').property('ADBE Position');
            var k1 = lp.keyValue(1);
            lp.setValueAtKey(1, [k1[0] - 590, k1[1] + 135, 0]);
            function startGap(c) {
                var p = c.layer('Flock Center').property('ADBE Transform Group').property('ADBE Position').valueAtTime(0, true), l = lp.valueAtTime(0.4, false);
                return Math.sqrt((p[0] - l[0]) * (p[0] - l[0]) + (p[1] - l[1]) * (p[1] - l[1]));
            }
            function check(c) {
                var L = c.layer('Flock Leader Check'), op = L.property('ADBE Transform Group').property('ADBE Opacity'), tx = L.property('ADBE Text Properties').property('ADBE Text Document');
                if (op.expressionError || tx.expressionError) throw new Error(c.name + ' leader check: ' + (op.expressionError || tx.expressionError));
                return 'opacity ' + op.valueAtTime(0, false) + (op.valueAtTime(0, false) > 0 ? ', "' + tx.valueAtTime(0, false).text + '"' : '');
            }
            note('leader moved (first key by -590, +135): flock starts ' + q(startGap(lm)) + ' px from the leader; leader check ' + check(lm) + '; in Sky: ' + check(comp));
            // The preview's rough guess (centre and size), read before re-running
            var pv = lm.layer('Flock Preview'), PT = [0.5, 2, 4, 7.9], est = [], ms = [];
            var guess = pv.property('ADBE Effect Parade').property('Flock Estimate').property(1);
            var shown = pv.property('ADBE Root Vectors Group').property('Flock Estimate').property('ADBE Vector Transform Group').property('ADBE Vector Group Opacity');
            var ringSize = pv.property('ADBE Root Vectors Group').property('Flock Zone').property('ADBE Vectors Group').property('Ring').property('ADBE Vector Ellipse Size');
            for (var j = 0; j < PT.length; j++) {
                var c0 = new Date().getTime();
                est.push([guess.valueAtTime(PT[j], false), ringSize.valueAtTime(PT[j], false)[0] / 2]);
                ms.push(new Date().getTime() - c0);
            }
            if (guess.expressionError) throw new Error('preview: ' + guess.expressionError);
            var dot1 = pv.property('ADBE Root Vectors Group').property('Flock Estimate').property('ADBE Vectors Group').property('Bird 1').property('ADBE Vector Ellipse Position');
            if (dot1.expressionError) throw new Error('preview dot: ' + dot1.expressionError);
            note('preview before the re-run: guess at 2 s ' + q(est[1][0]) + ', ring radius ' + q(est[1][1]) + ' px, shown at opacity ' + shown.valueAtTime(1, false) + ' (Sky: ' +
                comp.layer('Flock Preview').property('ADBE Root Vectors Group').property('Flock Estimate').property('ADBE Vector Transform Group').property('ADBE Vector Group Opacity').valueAtTime(1, false) +
                '); ' + ms.join(', ') + ' ms at ' + PT.join(', ') + ' s');
            // a copy to look at: the guides made renderable (aerender leaves guide layers out)
            var look = lm.duplicate();
            look.name = 'Preview look';
            var lnames = ['Flock Preview', 'Flock Leader Check'];
            for (j = 0; j < lnames.length; j++) {
                look.layer(lnames[j]).locked = false;
                look.layer(lnames[j]).guideLayer = false;
            }
            var t = new Date().getTime();
            $.global.FlockRig.build(lm, lm.layer('Bird'), lm.layer('Leader'), { name: 'Flock', count: 80, spacing: 45, seed: 7 });
            // the guess against the flock the re-run baked: birds inside the ring, centre off by
            var inside = 0, cnt = 0, offs = [];
            for (j = 0; j < PT.length; j++) {
                var g = est[j][0], ctr = lm.layer('Flock Center').property('ADBE Transform Group').property('ADBE Position').valueAtTime(PT[j], true);
                offs.push(q(Math.sqrt(Math.pow(ctr[0] - g[0], 2) + Math.pow(ctr[1] - g[1], 2))));
                for (var n2 = 1; n2 <= lm.numLayers; n2++) {
                    if (lm.layer(n2).name.indexOf('Flock Bird ') !== 0) continue;
                    var bp = lm.layer(n2).property('ADBE Transform Group').property('ADBE Position').valueAtTime(PT[j], false);
                    cnt++;
                    if (Math.sqrt(Math.pow(bp[0] - g[0], 2) + Math.pow(bp[1] - g[1], 2)) <= est[j][1]) inside++;
                }
            }
            note('preview vs the re-run: ' + Math.round((100 * inside) / cnt) + ' % of ' + cnt + ' birds inside the ring; guessed centre off by ' + offs.join(', ') + ' px at ' + PT.join(', ') + ' s');
            note('re-run in "Leader moved" (' + (new Date().getTime() - t) + ' ms): flock starts ' + q(startGap(lm)) + ' px from the leader (Sky: ' +
                q((function () {
                    var p = comp.layer('Flock Center').property('ADBE Transform Group').property('ADBE Position').valueAtTime(0, true);
                    var l = comp.layer('Leader').property('ADBE Transform Group').property('ADBE Position').valueAtTime(0.4, false);
                    return Math.sqrt((p[0] - l[0]) * (p[0] - l[0]) + (p[1] - l[1]) * (p[1] - l[1]));
                })()) + ' px); leader check ' + check(lm));
        });
        step('dump for check-ae.mjs', function () {
            // Everything AE baked and computed, for check-ae.mjs to compare with Node's own
            // numbers: plausible is not enough (a misread ?: once baked a different flock for
            // two rounds while every check here passed). Numbers through String(): ExtendScript's
            // toPrecision rounds negatives to integers.
            var t0 = new Date().getTime(), F = 192, f, n, i, parts = [];
            function arr(a) {
                var s = [];
                for (var j = 0; j < a.length; j++) s.push(a[j] instanceof Array ? arr(a[j]) : String(a[j]));
                return '[' + s.join(',') + ']';
            }
            function str(s) {
                return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n') + '"';
            }
            var lp = leader.property('ADBE Transform Group').property('ADBE Position'), LS = [];
            for (f = 0; f < F + 11; f++) LS.push(lp.valueAtTime(f / 24, false).slice(0, 2));
            parts.push('"leader":' + arr(LS));
            var stretched = comp.duplicate();
            stretched.name = 'Sky stretched';
            var sfx = stretched.layer('Flock Controls').property('ADBE Effect Parade');
            var set = [['Length % (along travel)', 250], ['Width % (across travel)', 55], ['Clumping (+ core, - even)', 60], ['Shape Angle (0 = travel)', 30]];
            for (i = 0; i < set.length; i++) sfx.property(set[i][0]).property(1).setValue(set[i][1]);
            var list = [comp];
            for (i = 1; i <= app.project.numItems; i++) if (app.project.item(i).name === 'Sky spread') list.push(app.project.item(i));
            list.push(stretched);
            var cj = [], dumped = [];
            for (i = 0; i < list.length; i++) dumped.push(list[i].name);
            for (var c = 0; c < list.length; c++) {
                var C = list[c], fx = C.layer('Flock Controls').property('ADBE Effect Parade'), ctl = [];
                for (i = 1; i <= fx.numProperties; i++) ctl.push(str(fx.property(i).name) + ':' + String(fx.property(i).property(1).value));
                var ctr = C.layer('Flock Center'), cp = ctr.property('ADBE Transform Group').property('ADBE Position'), cfx = ctr.property('ADBE Effect Parade');
                var CP = [], CR = [], CA = [], SH = [];
                var sw = cfx.property('Shape Window').property(1), sa = cfx.property('Shape Axis').property(1), sr = cfx.property('Shape Radius').property(1);
                for (f = 0; f < F; f++) {
                    CP.push(cp.valueAtTime(f / 24, true).slice(0, 2));
                    CR.push(cfx.property('Radius Sum').property(1).valueAtTime(f / 24, true));
                    CA.push(cfx.property('Axis Sum').property(1).valueAtTime(f / 24, true).slice(0, 2));
                    var ax = sa.valueAtTime(f / 24, false);
                    SH.push([sw.valueAtTime(f / 24, false), ax[0], ax[1], sr.valueAtTime(f / 24, false)]);
                }
                if (sw.expressionError || sa.expressionError || sr.expressionError) throw new Error(C.name + ' Flock Center: ' + (sw.expressionError || sa.expressionError || sr.expressionError));
                var birds = [], expr = '';
                for (n = 1; n <= C.numLayers; n++) {
                    var B = C.layer(n);
                    if (B.name.indexOf('Flock Bird ') !== 0) continue;
                    var bp = B.property('ADBE Transform Group').property('ADBE Position'), os = B.property('ADBE Effect Parade').property('Offset Sum').property(1);
                    var pre = [], post = [], sum = [];
                    for (f = 0; f < F; f++) {
                        pre.push(bp.valueAtTime(f / 24, true).slice(0, 2));
                        post.push(bp.valueAtTime(f / 24, false).slice(0, 2));
                        sum.push(os.valueAtTime(f / 24, true).slice(0, 2));
                    }
                    if (!expr) expr = bp.expression;
                    birds.push('{"name":' + str(B.name) + ',"pre":' + arr(pre) + ',"post":' + arr(post) + ',"sum":' + arr(sum) + '}');
                }
                cj.push('{"name":' + str(C.name) + ',"controls":{' + ctl.join(',') + '},"center":' + arr(CP) + ',"radiusSum":' + arr(CR) +
                    ',"axisSum":' + arr(CA) + ',"shape":' + arr(SH) + ',"windowExpression":' + str(sw.expression) +
                    ',"expression":' + str(expr) + ',"birds":[' + birds.join(',') + ']}');
            }
            parts.push('"comps":[' + cj.join(',') + ']');
            stretched.remove();
            var file = new File(OUT + '/ae-dump.json');
            file.encoding = 'UTF-8';
            file.open('w');
            file.write('{' + parts.join(',') + '}');
            file.close();
            note('dump: ' + dumped.length + ' comps (' + dumped.join(', ') + ') -> ae-dump.json, ' + (new Date().getTime() - t0) + ' ms');
        });
    }
    app.endUndoGroup();
    app.endSuppressDialogs(false);

    if (OUT) {
        note('flags left in the AE session: FLOCK_NO_UI ' + $.global.FLOCK_NO_UI + ', FLOCK_TEST_OUT ' + $.global.FLOCK_TEST_OUT + ', FLOCK_DIR ' + $.global.FLOCK_DIR);
        step('save', function () {
            app.project.save(new File(OUT + '/flock-demo.aep'));
            note('saved ' + OUT + '/flock-demo.aep');
        });
        if (QUIT) app.quit();
    } else if (log.length) {
        alert(log.join('\n'));
    }
})();
