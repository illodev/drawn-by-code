// make-art.jsx - the real-artwork regression set inside After Effects. Reads out/art/cases.js
// (written by art/test-art.mjs: letter outlines from the repo's OFL fonts, keyed the way a
// designer keys them), builds every case as a shape layer (one group, one Path per piece, a
// fill), plus two mask cases (an O closing into a C as Add and Subtract masks; an F turning as
// a mask), fixes each through the panel's own fixSelection, and checks what AE then holds:
// every piece the same points in every key, the pieces matched as in Node, turns swung (the
// area halfway stays the letter's area), and the time against the estimate. Logs to
// out/ae/art-log.txt and saves out/ae/art.aep.
//
// Needs the test build (node build.mjs) and $.global.MORPH_DIR (this experiment's folder);
// run it through ae-bridge.jsx after MMF_BRIDGE.freshProject().
(function () {
    var here = $.global.MORPH_DIR || File($.fileName).parent.parent.fsName;
    var OUT = here + '/out/ae', log = [], fails = 0;
    function note(s) {
        log.push(s);
        var f = new File(OUT + '/art-log.txt');
        f.encoding = 'UTF-8';
        f.open('w');
        f.write(log.join('\n') + '\n');
        f.close();
    }
    function safe(e) {
        try {
            return String(e.message) + (e.line ? ' (line ' + e.line + ')' : '');
        } catch (x) {
            return 'error';
        }
    }
    function check(what, ok, detail) {
        if (!ok) fails++;
        note((ok ? 'ok   ' : 'FAIL ') + what + (detail !== undefined ? ' · ' + detail : ''));
    }
    function readText(p) {
        var f = new File(p);
        f.encoding = 'UTF-8';
        f.open('r');
        var s = f.read();
        f.close();
        return s;
    }
    $.global.MORPH_NO_UI = true;
    $.evalFile(new File(here + '/out/test-build/Mask Morph Fixer.jsx'));
    $.global.MORPH_NO_UI = false;
    var FX = $.global.MorphFixer, MF = $.global.MorphFixerMath;
    eval(readText(here + '/out/art/cases.js'));      // var ART = [...]
    FX.ask = function () {
        return true;
    };
    FX.escape = null;

    function only(L) {
        for (var i = 1; i <= L.containingComp.numLayers; i++) L.containingComp.layer(i).selected = false;
        L.selected = true;
    }
    function shapeOf(P) {
        return FX.fromMF(P);
    }
    // one shape layer: group "Glyph" holding a Path per piece (named by us) and a fill
    function glyphLayer(comp, name, keys) {
        var L = comp.layers.addShape();
        L.name = name;
        L.property('ADBE Root Vectors Group').addProperty('ADBE Vector Group').name = 'Glyph';
        var list = function () { return L.property('ADBE Root Vectors Group').property('Glyph').property('ADBE Vectors Group'); };
        var n = keys[0].length, p, k;
        for (p = 0; p < n; p++) list().addProperty('ADBE Vector Shape - Group');
        list().addProperty('ADBE Vector Graphic - Fill');
        for (p = 0; p < n; p++) {
            list().property(p + 1).name = 'Piece ' + (p + 1);
            var path = list().property(p + 1).property('ADBE Vector Shape');
            for (k = 0; k < keys.length; k++) path.setValueAtTime(k * 1, shapeOf(keys[k][p]));
        }
        return { layer: L, paths: function () { var a = []; for (var q = 1; q <= n; q++) a.push(list().property(q).property('ADBE Vector Shape')); return a; } };
    }
    function sameCounts(path) {
        var n = path.keyValue(1).vertices.length;
        for (var k = 2; k <= path.numKeys; k++) if (path.keyValue(k).vertices.length !== n) return false;
        return true;
    }
    function areaAt(path, t) {
        return Math.abs(MF.area(FX.toMF(path.valueAtTime(t, false))));
    }

    var comp = null, rows = [];
    try {
        for (var c = 0; c < ART.length; c++) {
            var C = ART[c];
            comp = app.project.items.addComp('Art ' + (c + 1), 1200, 1200, 1, ART[c].keys.length, 30);
            comp.openInViewer();
            var g = glyphLayer(comp, 'Case ' + (c + 1), C.keys);
            g.layer.property('ADBE Transform Group').property('ADBE Position').setValue([600, 600]);
            only(g.layer);
            var t0 = new Date().getTime();
            var res = FX.fixSelection({ mode: C.mode, maxPoints: C.max, rotate: C.rotate });
            var took = (new Date().getTime() - t0) / 1000;
            var paths = g.paths(), allSame = true, p;
            for (p = 0; p < paths.length; p++) if (!sameCounts(paths[p])) allSame = false;
            check(C.name + ': fixed', /Fixed|already/.test(res.status), res.status);
            check(C.name + ': every piece has the same points in every key', allSame);
            if (C.expect.grown) check(C.name + ': ' + C.expect.grown + ' keys where a piece grows from a point', res.grown === C.expect.grown, String(res.grown));
            if (C.expect.moved) check(C.name + ': pieces pasted out of order dealt back', res.moved > 0, String(res.moved));
            if (C.rotate) {
                // turned: halfway between the first two keys the letter keeps its area
                var a0 = 0, ah = 0;
                for (p = 0; p < paths.length; p++) {
                    a0 += areaAt(paths[p], 0);
                    ah += areaAt(paths[p], 0.5);
                }
                check(C.name + ': halfway keeps the letter\'s area (it swings, not squashes)', Math.abs(ah / a0 - 1) < 0.03, (ah / a0).toFixed(3));
                var baked = 0;
                for (p = 0; p < res.reports.length; p++) if (res.reports[p].baked) baked += res.reports[p].baked;
                note('     ' + (baked ? baked + ' in-between keys (pieces share the group)' : 'turned by the group\'s Rotation'));
            }
            rows.push('| ' + C.name + ' | ' + res.status + ' | ' + res.seconds.toFixed(1) + ' s | ' + took.toFixed(1) + ' s |');
            note('     estimated ' + res.seconds.toFixed(1) + ' s, took ' + took.toFixed(1) + ' s');
        }

        // masks: an O closing into a C (outline: Add, hole: Subtract, each its own group)
        comp = app.project.items.addComp('Art masks', 1200, 1200, 1, 3, 30);
        comp.openInViewer();
        var O = null, CC = null;
        for (c = 0; c < ART.length; c++) if (/^O into C and back/.test(ART[c].name)) O = ART[c];
        var S = comp.layers.addSolid([0.15, 0.2, 0.3], 'O into C (masks)', 1200, 1200, 1);
        var masks = S.property('ADBE Mask Parade');
        masks.addProperty('ADBE Mask Atom');
        masks.addProperty('ADBE Mask Atom');
        var m1 = masks.property(1), m2 = masks.property(2);
        m2.maskMode = MaskMode.SUBTRACT;
        var off = function (P) {
            var Q = MF.copy(P);
            for (var j = 0; j < Q.v.length; j++) Q.v[j] = [Q.v[j][0] + 600, Q.v[j][1] + 600];
            return Q;
        };
        // which piece is the outline: the bigger one at the first key
        var big = MF.pieceInfo(O.keys[0][0]).size > MF.pieceInfo(O.keys[0][1]).size ? 0 : 1;
        for (var k = 0; k < O.keys.length; k++) {
            var row = O.keys[k], outl = row[big], hole = row[1 - big];
            if (MF.pieceInfo(outl).size < MF.pieceInfo(hole).size) {
                var tmp = outl;
                outl = hole;
                hole = tmp;
            }
            masks.property(1).property('ADBE Mask Shape').setValueAtTime(k, shapeOf(off(outl)));
            masks.property(2).property('ADBE Mask Shape').setValueAtTime(k, shapeOf(off(hole)));
        }
        only(S);
        var mres = FX.fixSelection({ mode: 'smooth', maxPoints: 100 });
        var mp1 = masks.property(1).property('ADBE Mask Shape'), mp2 = masks.property(2).property('ADBE Mask Shape');
        check('masks O into C: both masks fixed, the same points in every key', sameCounts(mp1) && sameCounts(mp2), mres.status);
        check('masks O into C: the hole (a Subtract mask, its own piece) grows from the dot', mres.grown === 1, String(mres.grown));

        // a mask that turns: an F a quarter at a time, written into the mask as in-between keys
        var F = null;
        for (c = 0; c < ART.length; c++) if (/^An F turning/.test(ART[c].name)) F = ART[c];
        var S2 = comp.layers.addSolid([0.3, 0.2, 0.15], 'F turning (mask)', 1200, 1200, 1);
        S2.property('ADBE Mask Parade').addProperty('ADBE Mask Atom');
        var fm = function () { return S2.property('ADBE Mask Parade').property(1).property('ADBE Mask Shape'); };
        for (k = 0; k < F.keys.length && k < 3; k++) fm().setValueAtTime(k, shapeOf(off(F.keys[k][0])));
        var before = areaAt(fm(), 0.5) / areaAt(fm(), 0);
        only(S2);
        var fres = FX.fixSelection({ mode: 'smooth', maxPoints: 100, rotate: true });
        var fr = fres.reports[0] || {};
        check('mask turning: written as in-between keys', fr.baked > 0, (fr.baked || 0) + ' keys; ' + fres.status);
        var after = areaAt(fm(), 0.5) / areaAt(fm(), 0), mid = areaAt(fm(), 1.5) / areaAt(fm(), 0);
        check('mask turning: halfway keeps the F\'s area (as drawn: ' + before.toFixed(2) + ')', Math.abs(after - 1) < 0.03 && Math.abs(mid - 1) < 0.03, after.toFixed(3) + ', ' + mid.toFixed(3));
        var atKey = FX.toMF(fm().valueAtTime(1, false)), drawn = off(F.keys[1][0]);
        var dk = Math.max(MF.deviation(drawn, atKey), MF.deviation(atKey, drawn));
        check('mask turning: at each key the F is where it was drawn', dk < 0.15, dk.toFixed(3) + ' px');
        app.project.save(new File(OUT + '/art.aep'));
    } catch (e) {
        fails++;
        note('ERROR ' + safe(e));
    }
    var f2 = new File(OUT + '/art-times.md');
    f2.encoding = 'UTF-8';
    f2.open('w');
    f2.write('| Case | Status | Estimated | Took |\n|---|---|---|---|\n' + rows.join('\n') + '\n');
    f2.close();
    note(fails ? fails + ' check(s) FAILED' : 'all checks pass');
})();
