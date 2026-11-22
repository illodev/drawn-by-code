// morph-ae.jsx - the After Effects half of MorphFixer.jsx (build.mjs puts morph-math.js in
// front of it and passes the script's `this` in as MORPH_HOST).
//
// A compact panel: Smooth / Exact, max points, Fix, ? (the instructions), and a status line
// whose tooltip holds the full report. Docked when the script is installed in
// Scripts/ScriptUI Panels (Window menu), a floating palette from File > Scripts.
// Fix works on the keyed paths selected (a shape layer's Path, a Mask Path, the groups or
// layers holding them): every keyframe gets the same number of points, the same direction
// and a start point that keeps the morph from spinning; key times and easing stay as they
// were. With two or more keyframes selected on a path, only those are fixed.
//
// ExtendScript is ES3: no let/const, arrows, JSON, Array.indexOf/forEach. Strings shown in AE
// stay ASCII.
var MorphFixer = (function () {
    var DEFAULTS = { mode: 'smooth', start: true, direction: true, maxPoints: 100, tolerance: 0.1 };
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

    // ---- turning: the turn goes into the shape group's transform --------------------------

    var TF = {
        group: 'ADBE Vector Transform Group', anchor: 'ADBE Vector Anchor', position: 'ADBE Vector Position',
        scale: 'ADBE Vector Scale', rotation: 'ADBE Vector Rotation', skew: 'ADBE Vector Skew'
    };
    var GEOMETRY = { 'ADBE Vector Shape - Group': 1, 'ADBE Vector Shape - Rect': 1, 'ADBE Vector Shape - Ellipse': 1, 'ADBE Vector Shape - Star': 1, 'ADBE Vector Group': 1 };

    // the shape group whose transform can carry this path's turn, or { why } it can't
    function turnGroup(prop, allKeys) {
        if (prop.matchName === 'ADBE Mask Shape') return { why: 'a mask has no transform of its own to turn' };
        var holder = prop.parentProperty, list = holder && holder.parentProperty, group = list && list.parentProperty;
        if (!group || group.matchName !== 'ADBE Vector Group') return { why: 'the path is not inside a group (select it and press Ctrl+G)' };
        var n = 0;
        for (var i = 1; i <= list.numProperties; i++) if (GEOMETRY[list.property(i).matchName]) n++;
        if (n !== 1) return { why: 'its group holds other shapes, which would turn with it' };
        if (!allKeys) return { why: 'only some keyframes are selected' };
        var t = group.property(TF.group), names = ['anchor', 'position', 'scale', 'rotation', 'skew'];
        for (i = 0; i < names.length; i++) {
            var p = t.property(TF[names[i]]);
            if (p.numKeys || (p.expression && p.expressionEnabled)) return { why: 'its group\'s transform is already animated' };
        }
        var sc = t.property(TF.scale).value;
        if (Math.abs(sc[0] - sc[1]) > 1e-6) return { why: 'its group is scaled unevenly' };
        if (Math.abs(t.property(TF.skew).value) > 1e-6) return { why: 'its group is skewed' };
        return { transform: t };
    }

    // keys the group's Anchor, Position and Rotation from turn (morph-math's pivots), on top of
    // the group's own static transform, with the path keys' times and easing; anchor and
    // position hold through a step that turns about a point
    function writeTurn(prop, idx, T, tr) {
        var a0 = tr.property(TF.anchor).value, p0 = tr.property(TF.position).value, r0 = tr.property(TF.rotation).value;
        var s0 = tr.property(TF.scale).value[0] / 100, ra = r0 * Math.PI / 180, cr = Math.cos(ra), sr = Math.sin(ra);
        var pA = tr.property(TF.anchor), pP = tr.property(TF.position), pR = tr.property(TF.rotation), k, approx = false;
        for (k = 0; k < idx.length; k++) {
            var t = prop.keyTime(idx[k]), A = T.anchor[k], P = T.position[k];
            var dx = (P[0] - a0[0]) * s0, dy = (P[1] - a0[1]) * s0;
            pA.setValueAtTime(t, [A[0], A[1]]);
            pP.setValueAtTime(t, [p0[0] + dx * cr - dy * sr, p0[1] + dx * sr + dy * cr]);
            pR.setValueAtTime(t, r0 + T.angles[k]);
        }
        var props = [pA, pP, pR], j;
        for (k = 0; k < idx.length; k++) {
            var tin = prop.keyInInterpolationType(idx[k]), tout = prop.keyOutInterpolationType(idx[k]);
            var ein = prop.keyInTemporalEase(idx[k])[0], eout = prop.keyOutTemporalEase(idx[k])[0];
            if (ein.speed || eout.speed) approx = true;        // only Easy Ease shapes (speed 0) copy exactly
            for (j = 0; j < props.length; j++) {
                var p = props[j], held = j < 2;
                var kin = held && k > 0 && T.hold[k - 1] ? KeyframeInterpolationType.HOLD : tin;
                var kout = held && T.hold[k] ? KeyframeInterpolationType.HOLD : tout;
                p.setInterpolationTypeAtKey(k + 1, kin, kout);
                if (kin === KeyframeInterpolationType.BEZIER || kout === KeyframeInterpolationType.BEZIER)
                    p.setTemporalEaseAtKey(k + 1, [new KeyframeEase(0, ein.influence)], [new KeyframeEase(0, eout.influence)]);
                if (j < 2 && p.isSpatial) {
                    p.setSpatialAutoBezierAtKey(k + 1, false);
                    p.setSpatialContinuousAtKey(k + 1, false);
                    p.setSpatialTangentsAtKey(k + 1, [0, 0], [0, 0]);
                }
            }
        }
        return approx;
    }

    // fixPath(pathProperty, options) -> a report: { label, keys, from, to, reversed, moved,
    // before, after, turned } or { label, skipped }
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
        var group = null;
        if (o.rotate) {
            group = turnGroup(prop, idx.length === prop.numKeys);
            if (group.why) {
                rep.noTurn = group.why;
                o.rotate = false;
            }
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
        if (r.turn) {
            rep.turned = r.turn.angles[r.turn.angles.length - 1] - r.turn.angles[0];
            rep.timingApprox = writeTurn(prop, idx, r.turn, group.transform);
        }
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
        rep.capped = r.capped;
        rep.deviation = r.deviation;
        return rep;
    }

    function round3(x) {
        return Math.ceil(x * 1000) / 1000;
    }

    function summary(rep) {
        if (rep.skipped) return rep.label + ': skipped, ' + rep.skipped + '.';
        if (rep.matched) return rep.label + ': already matched, left as it is.';
        var how, turned = '';
        if (rep.turned !== undefined) {
            turned = '; turned ' + Math.round(rep.turned) + ' deg by its group\'s Rotation' +
                (rep.timingApprox ? ' (custom key speeds approximated: Easy Ease shapes copy exactly)' : '');
        } else if (rep.noTurn) {
            turned = '; not turned: ' + rep.noTurn;
        }
        if (rep.fellBack) how = 'your points kept (it has loops or cusps the rebuild cannot follow)';
        else if (rep.mode === 'exact') how = 'your points kept, shapes exact';
        else if (rep.capped) how = 'rebuilt at the max: about ' + (Math.round(rep.deviation * 100) / 100) + ' px from each shape (raise max for a closer fit)';
        else how = 'rebuilt within ' + round3(rep.deviation) + ' px of each shape';
        return rep.label + ': ' + rep.keys + ' keys, ' + rep.from + ' -> ' + rep.to + ' points each' +
            (rep.reversed ? ', ' + rep.reversed + ' reversed' : '') + (rep.moved ? ', ' + rep.moved + ' start points moved' : '') +
            (rep.before ? '; points travel ' + Math.round(rep.before) + ' -> ' + Math.round(rep.after) + ' px around the shape' : '') +
            '; ' + how + turned + '.';
    }

    // fixes the keyed paths selected in the active comp -> { status, detail, reports }: a status
    // line for the panel and the full report for its tooltip
    function fixSelection(opts) {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) return { status: 'Open a comp first', detail: 'Open a composition and select keyed paths (or their layers).', reports: [] };
        var list = targets(comp);
        if (!list.length) {
            return {
                status: 'No keyed path selected', reports: [],
                detail: 'Select a Path or Mask Path with two keyframes or more, or the layers holding them.\n' +
                    'Rectangle, Ellipse and Polystar shapes: right-click > Convert to Bezier Path first.'
            };
        }
        var reps = [], lines = [], fixed = 0, matched = 0, skipped = 0, worst = 0, capped = false, lo = 1e9, hi = 0, turned = 0, i;
        app.beginUndoGroup('Morph Fixer');
        try {
            for (i = 0; i < list.length; i++) {
                var r = fixPath(list[i], opts);
                reps.push(r);
                lines.push(summary(r));
                if (r.skipped) skipped++;
                else if (r.matched) matched++;
                else {
                    fixed++;
                    if (r.to < lo) lo = r.to;
                    if (r.to > hi) hi = r.to;
                    if (r.mode === 'smooth' && r.deviation > worst) worst = r.deviation;
                    if (r.capped) capped = true;
                    if (r.turned !== undefined) turned++;
                }
            }
        } catch (e) {
            return { status: 'Error (hover)', detail: e.toString() + (e.line ? ' (line ' + e.line + ')' : ''), reports: reps };
        } finally {
            app.endUndoGroup();
        }
        var parts = [];
        if (fixed) parts.push('Fixed ' + fixed + ': ' + (lo === hi ? lo : lo + '-' + hi) + ' pts' + (worst ? (capped ? ', ~' : ', ') + round3(worst) + ' px' + (capped ? ' (max)' : '') : ''));
        if (turned) parts.push(turned + ' turned');
        if (matched) parts.push(matched + ' already matched');
        if (skipped) parts.push(skipped + ' skipped');
        return { status: parts.join(', '), detail: lines.join('\n'), reports: reps };
    }

    var INFO = 'Morph Fixer\n\n' +
        'Select keyed Paths or Mask Paths (or their layers, or 2+ keyframes on one path) and click Fix. ' +
        'Every keyframe gets the same points, the same direction and a start point that stops the morph from spinning. ' +
        'Key times and easing do not change. Undo puts everything back.\n\n' +
        'Smooth: rebuilds the points so in-betweens stay smooth. Each shape stays within 0.1 px of what you drew; corners stay exact. ' +
        'Max is the most points per key: if a shape needs more to stay within 0.1 px, the status shows how close it got.\n\n' +
        'Exact: keeps your points and only adds points by splitting curves where they lie. Shapes stay exact; ' +
        'in-betweens may show small kinks. Max does not apply.\n\n' +
        'Turn: for shapes that turn between keys (an F becoming an F on its side). Points are matched as if the shape turned, ' +
        'and the turn goes into the shape group\'s Rotation (with its Anchor and Position), so the shape swings round as a whole ' +
        'instead of shrinking through the middle. Steps that do not turn stay put. Needs the path alone in a group (Ctrl+G) ' +
        'whose transform is not animated; masks cannot turn.\n\n' +
        'Skipped and reported: paths with an expression, masks with feather points, keys mixing open and closed paths. ' +
        'Rectangle, Ellipse and Polystar shapes: right-click > Convert to Bezier Path first.\n\n' +
        'Hover the status line for the full report.';

    function setting(key, fallback) {
        try {
            return app.settings.haveSetting('MorphFixer', key) ? app.settings.getSetting('MorphFixer', key) : fallback;
        } catch (e) {
            return fallback;
        }
    }

    function save(key, value) {
        try {
            app.settings.saveSetting('MorphFixer', key, String(value));
        } catch (e) {}
    }

    // the panel: docked when the script sits in Scripts/ScriptUI Panels (host is a Panel),
    // otherwise a floating palette. One row: mode, max points, turn, Fix, ?; a status line.
    function buildUI(host) {
        var docked = host instanceof Panel;
        var w = docked ? host : new Window('palette', 'Morph Fixer', undefined, { resizeable: true });
        w.orientation = 'column';
        w.alignChildren = ['fill', 'top'];
        w.spacing = 3;
        w.margins = 5;
        var row = w.add('group');
        row.orientation = 'row';
        row.alignChildren = ['left', 'center'];
        row.spacing = 3;
        var mode = row.add('dropdownlist', undefined, ['Smooth', 'Exact']);
        mode.selection = setting('mode', 'smooth') === 'exact' ? 1 : 0;
        mode.helpTip = 'Smooth: rebuild the points for smooth in-betweens (each shape within 0.1 px).\nExact: keep your points, only split curves.';
        var maxLabel = row.add('statictext', undefined, 'max');
        var max = row.add('edittext', undefined, setting('max', '100'));
        max.characters = 3;
        max.helpTip = 'Most points per key (Smooth). More = a closer fit, heavier paths.';
        var turnBox = row.add('checkbox', undefined, 'turn');
        turnBox.value = setting('turn', 'false') === 'true';
        turnBox.helpTip = 'For shapes that turn between keys: the turn goes into the group\'s Rotation, so the shape swings round as a whole';
        var fixB = row.add('button', undefined, 'Fix');
        fixB.preferredSize = [36, 22];
        fixB.helpTip = 'Fix the selected keyed paths (or the paths on the selected layers)';
        var info = row.add('button', undefined, '?');
        info.preferredSize = [22, 22];
        info.helpTip = 'How it works';
        var status = w.add('statictext', undefined, 'Select keyed paths, then Fix', { truncate: 'end' });
        status.helpTip = 'Hover after a fix for the full report';
        function syncMode() {
            var smooth = mode.selection && mode.selection.index === 0;
            max.enabled = smooth;
            maxLabel.enabled = smooth;
        }
        syncMode();
        mode.onChange = function () {
            syncMode();
            save('mode', mode.selection.index === 1 ? 'exact' : 'smooth');
        };
        turnBox.onClick = function () {
            save('turn', turnBox.value);
        };
        max.onChange = function () {
            var n = Math.round(Number(max.text));
            if (!(n >= 4)) n = 100;
            max.text = String(n);
            save('max', n);
        };
        fixB.onClick = function () {
            var n = Math.round(Number(max.text));
            var res = fixSelection({ mode: mode.selection.index === 1 ? 'exact' : 'smooth', maxPoints: n >= 4 ? n : 100, rotate: turnBox.value });
            status.text = res.status;
            status.helpTip = res.detail;
            w.lastResult = res;
        };
        info.onClick = function () {
            alert(INFO, 'Morph Fixer');
        };
        w.controls = { mode: mode, max: max, turn: turnBox, fix: fixB, info: info, status: status };
        w.layout.layout(true);
        w.onResizing = w.onResize = function () {
            this.layout.resize();
        };
        if (!docked) {
            w.center();
            w.show();
        }
        return w;
    }

    return {
        fix: fixPath, fixSelection: fixSelection, targets: targets, describe: describe, summary: summary,
        buildUI: buildUI, run: buildUI, info: INFO, toMF: toMF, fromMF: fromMF
    };
})();

if (!$.global.MORPH_NO_UI) MorphFixer.run(MORPH_HOST);
