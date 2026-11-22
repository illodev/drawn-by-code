// morph-ae.jsx - the After Effects half of MorphFixer.jsx (build.mjs puts morph-math.js in
// front of it).
//
// Select keyed paths (a shape layer's Path, a Mask Path, the groups or layers holding them)
// and run MorphFixer.jsx. Every keyframe of each path gets the same number of points, the
// same direction and a start point that keeps the morph from spinning; each key's shape,
// time and easing stay exactly as they were. With two or more keyframes selected on a path,
// only those are fixed.
//
// ExtendScript is ES3: no let/const, arrows, JSON, Array.indexOf/forEach.
var MorphFixer = (function () {
    var DEFAULTS = { mode: 'smooth', start: true, direction: true, minPoints: 0, tolerance: 0.1 };
    var SKIP_NAMES = { 'ADBE Root Vectors Group': 1, 'ADBE Vectors Group': 1, 'ADBE Mask Parade': 1 };

    function isPath(p) {
        return p && p.propertyType === PropertyType.PROPERTY && p.propertyValueType === PropertyValueType.SHAPE;
    }

    // every path with two keys or more under a layer or group
    function collect(group, out) {
        for (var i = 1; i <= group.numProperties; i++) {
            var p = group.property(i);
            if (!p) continue;
            if (isPath(p)) {
                if (p.numKeys >= 2) out.push(p);
            } else if (p.propertyType !== PropertyType.PROPERTY) {
                collect(p, out);
            }
        }
        return out;
    }

    // "Layer > Group > Path", for reports (and to tell paths apart)
    function describe(p) {
        var names = [], q = p;
        while (q && q.parentProperty) {
            if (!SKIP_NAMES[q.matchName]) names.unshift(q.name);
            q = q.parentProperty;
        }
        var layer = p.propertyGroup(p.propertyDepth);
        return layer.index + '. ' + layer.name + ' > ' + names.join(' > ');
    }

    // the keyed paths in the selection: selected paths, groups, else whole layers
    function targets(comp) {
        var found = [], out = [], seen = {}, sel = comp.selectedProperties, i;
        for (i = 0; i < sel.length; i++) {
            if (isPath(sel[i])) {
                if (sel[i].numKeys >= 2) found.push(sel[i]);
            } else if (sel[i].propertyType !== PropertyType.PROPERTY) {
                collect(sel[i], found);
            }
        }
        if (!found.length) for (i = 0; i < comp.selectedLayers.length; i++) collect(comp.selectedLayers[i], found);
        for (i = 0; i < found.length; i++) {
            var id = describe(found[i]);
            if (!seen[id]) {
                seen[id] = true;
                out.push(found[i]);
            }
        }
        return out;
    }

    function toMF(s) {
        return { v: s.vertices, i: s.inTangents, o: s.outTangents, closed: s.closed };
    }

    function fromMF(P) {
        var s = new Shape();
        s.vertices = P.v;
        s.inTangents = P.i;
        s.outTangents = P.o;
        s.closed = P.closed;
        return s;
    }

    // fixPath(pathProperty, options) -> a report: { label, keys, from, to, reversed, moved,
    // before, after } or { label, skipped }
    function fixPath(prop, opts) {
        var o = {}, k;
        for (k in DEFAULTS) o[k] = DEFAULTS[k];
        if (opts) for (k in opts) o[k] = opts[k];
        var rep = { label: describe(prop) };
        if (prop.expression !== '' && prop.expressionEnabled) {
            rep.skipped = 'it has an expression';
            return rep;
        }
        var idx = [], sel = prop.selectedKeys;
        if (sel && sel.length >= 2) for (k = 0; k < sel.length; k++) idx.push(sel[k]);
        else for (k = 1; k <= prop.numKeys; k++) idx.push(k);
        if (idx.length < 2) {
            rep.skipped = 'fewer than two keyframes';
            return rep;
        }
        var paths = [], counts = [];
        for (k = 0; k < idx.length; k++) {
            var s = prop.keyValue(idx[k]);
            if (s.featherSegLocs && s.featherSegLocs.length) {
                rep.skipped = 'its mask has feather points (they belong to segments that would move)';
                return rep;
            }
            paths.push(toMF(s));
            counts.push(s.vertices.length);
        }
        var r;
        try {
            r = MF.fix(paths, o);
        } catch (e) {
            rep.skipped = e.message;
            return rep;
        }
        if (r.matched) {
            rep.matched = true;
            rep.keys = idx.length;
            return rep;
        }
        for (k = 0; k < idx.length; k++) prop.setValueAtKey(idx[k], fromMF(r.paths[k]));
        var lo = counts[0], hi = counts[0], rev = 0, mov = 0, b = 0, a = 0, n = 0;
        for (k = 0; k < idx.length; k++) {
            if (counts[k] < lo) lo = counts[k];
            if (counts[k] > hi) hi = counts[k];
            if (r.keys[k].reversed) rev++;
            if (r.keys[k].moved) mov++;
            if (k && r.keys[k].before > 0.001) {
                b += r.keys[k].before;
                a += r.keys[k].after;
                n++;
            }
        }
        rep.keys = idx.length;
        rep.from = lo === hi ? String(lo) : lo + '-' + hi;
        rep.to = r.paths[0].v.length;
        rep.reversed = rev;
        rep.moved = mov;
        rep.before = n ? b / n : 0;
        rep.after = n ? a / n : 0;
        rep.mode = r.mode;
        rep.fellBack = r.fellBack;
        rep.deviation = r.deviation;
        return rep;
    }

    function summary(rep) {
        if (rep.skipped) return rep.label + ': skipped, ' + rep.skipped + '.';
        if (rep.matched) return rep.label + ': already matched, left as it is.';
        return rep.label + ': ' + rep.keys + ' keys, ' + rep.from + ' -> ' + rep.to + ' points each' +
            (rep.reversed ? ', ' + rep.reversed + ' reversed' : '') + (rep.moved ? ', ' + rep.moved + ' start points moved' : '') +
            (rep.before ? '; points travel ' + Math.round(rep.before) + ' -> ' + Math.round(rep.after) + ' px around the shape' : '') +
            (rep.mode === 'smooth' ? '; rebuilt within ' + (Math.ceil(rep.deviation * 1000) / 1000) + ' px of each shape' : '; your points kept, shapes exact') +
            (rep.fellBack ? ' (it has loops or cusps the rebuild cannot follow within 0.1 px)' : '') + '.';
    }

    function run() {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            alert('Morph Fixer: open a composition and select the keyed paths (or their layers).');
            return;
        }
        var list = targets(comp);
        if (!list.length) {
            alert('Morph Fixer: select a Path or Mask Path with two keyframes or more (or the layers holding them).\n' +
                'Rectangle, Ellipse and Polystar shapes need converting first: right-click > Convert to Bezier Path.');
            return;
        }
        var w = new Window('dialog', 'Morph Fixer');
        w.orientation = 'column';
        w.alignChildren = 'fill';
        var names = [];
        for (var i = 0; i < list.length && i < 6; i++) names.push(describe(list[i]));
        w.add('statictext', undefined, list.length + ' keyed path' + (list.length === 1 ? '' : 's') + ': ' + names.join(', ') + (list.length > 6 ? '...' : ''));
        var pm = w.add('panel', undefined, 'Points (every key ends with the same number)');
        pm.alignChildren = 'left';
        var rSmooth = pm.add('radiobutton', undefined, 'Rebuild them: smooth in-betweens, each shape kept within 0.1 px, corners exact');
        var rExact = pm.add('radiobutton', undefined, 'Keep mine: shapes exact to the bit, in-betweens may show small kinks');
        rSmooth.value = true;
        var r = pm.add('group');
        r.add('statictext', undefined, 'At least');
        var eMin = r.add('edittext', undefined, '0');
        eMin.characters = 4;
        r.add('statictext', undefined, 'points per key (0 = as many as the shapes need)');
        var p = w.add('panel', undefined, 'Also');
        p.alignChildren = 'left';
        var cStart = p.add('checkbox', undefined, 'Slide start points so the morph doesn\'t spin');
        cStart.value = true;
        var cDir = p.add('checkbox', undefined, 'Match direction so shapes don\'t turn inside out');
        cDir.value = true;
        w.add('statictext', undefined, 'With 2+ keyframes selected on a path, only those are fixed. Undo puts everything back.');
        var bt = w.add('group');
        bt.alignment = 'right';
        bt.add('button', undefined, 'Cancel', { name: 'cancel' });
        bt.add('button', undefined, 'Fix', { name: 'ok' });
        if (w.show() !== 1) return;
        var minPoints = Math.max(0, Math.round(Number(eMin.text) || 0));
        app.beginUndoGroup('Morph Fixer');
        var lines = [];
        try {
            for (i = 0; i < list.length; i++) {
                lines.push(summary(fixPath(list[i], { mode: rExact.value ? 'exact' : 'smooth', start: cStart.value, direction: cDir.value, minPoints: minPoints })));
            }
            alert('Morph Fixer\n\n' + lines.join('\n'));
        } catch (e) {
            alert('Morph Fixer: ' + e.toString() + (e.line ? ' (line ' + e.line + ')' : ''));
        } finally {
            app.endUndoGroup();
        }
    }

    return { fix: fixPath, targets: targets, describe: describe, summary: summary, run: run, toMF: toMF, fromMF: fromMF };
})();

if (!$.global.MORPH_NO_UI) MorphFixer.run();
