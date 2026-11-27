// drawon-ae.jsx - the After Effects half of "Constant Speed Draw-On.jsx" (build.mjs puts
// drawon-geom.js in front of it, pastes drawon-time.js into DO_TIME and passes the script's
// `this` in as DRAWON_HOST).
//
// A compact panel: Apply, Update, Remove, ? (the guide), and a status line whose tooltip holds
// the full report. A dockable After Effects panel when the script sits in a ScriptUI Panels
// folder (Window menu); run from File > Scripts it floats, and the guide's Install button
// copies it into the user's ScriptUI Panels folder (no admin rights needed).
//
// Apply turns the selection (shape layers, groups, paths or Trim Paths) into strokes: each
// group that holds paths is one stroke, a selected Trim Paths is one stroke as it is. Every
// stroke gets a Trim Paths (its own, or one added at the end of its group) whose Start and End
// expressions carry the stroke's length in comp pixels and its place in every order; a
// controls null ("Draw-On Controls") holds the sliders they read, through a Layer Control on
// each rigged layer. Update re-measures; Remove takes strokes (or, with the controls layer
// selected, the whole rig) off and gives back what was there.
//
// ExtendScript is ES3: no let/const, arrows, JSON, Array.indexOf/forEach. Strings shown in AE
// stay ASCII. Properties are found by internal name only (AE's display names change with its
// language); names the rig writes itself (its controls, its effects) are its own.
var DO_TIME = '';

var DrawOn = (function () {
    var NAME = 'Constant Speed Draw-On', FILE_NAME = NAME + '.jsx', VERSION = '0.1.0';
    var SELF = String($.fileName || '');    // this script's own file (the installed copy when docked)
    var MAC = String($.os).indexOf('Mac') >= 0, KEY = MAC ? 'Cmd' : 'Ctrl';
    var MARK = '// ' + NAME + ': rig "';                         // first line of every expression it writes
    var OFF_MARK = '// ' + NAME + ' switched this Trim Paths off: rig "';
    var COMMENT = NAME + ' controls: rig "';                      // the controls null's comment
    var BASE = 'Draw-On';                                          // rigs are "Draw-On", "Draw-On 2"...

    var MN = {
        root: 'ADBE Root Vectors Group', group: 'ADBE Vector Group', vectors: 'ADBE Vectors Group',
        gtr: 'ADBE Vector Transform Group', anchor: 'ADBE Vector Anchor', position: 'ADBE Vector Position',
        scale: 'ADBE Vector Scale', skew: 'ADBE Vector Skew', skewAxis: 'ADBE Vector Skew Axis', rotation: 'ADBE Vector Rotation',
        path: 'ADBE Vector Shape - Group', shape: 'ADBE Vector Shape', rect: 'ADBE Vector Shape - Rect',
        ellipse: 'ADBE Vector Shape - Ellipse', star: 'ADBE Vector Shape - Star', direction: 'ADBE Vector Shape Direction',
        rectSize: 'ADBE Vector Rect Size', rectPos: 'ADBE Vector Rect Position', rectRound: 'ADBE Vector Rect Roundness',
        ellSize: 'ADBE Vector Ellipse Size', ellPos: 'ADBE Vector Ellipse Position',
        starType: 'ADBE Vector Star Type', starPoints: 'ADBE Vector Star Points', starPos: 'ADBE Vector Star Position',
        starRot: 'ADBE Vector Star Rotation', starInner: 'ADBE Vector Star Inner Radius', starOuter: 'ADBE Vector Star Outer Radius',
        starInRound: 'ADBE Vector Star Inner Roundess', starOutRound: 'ADBE Vector Star Outer Roundess',
        trim: 'ADBE Vector Filter - Trim', tStart: 'ADBE Vector Trim Start', tEnd: 'ADBE Vector Trim End',
        tOffset: 'ADBE Vector Trim Offset', tType: 'ADBE Vector Trim Type',
        effects: 'ADBE Effect Parade', slider: 'ADBE Slider Control', checkbox: 'ADBE Checkbox Control',
        menu: 'ADBE Dropdown Control', layerCtl: 'ADBE Layer Control',
        text: 'ADBE Text Properties', textDoc: 'ADBE Text Document'
    };
    var PATHS = { 'ADBE Vector Shape - Group': 1, 'ADBE Vector Shape - Rect': 1, 'ADBE Vector Shape - Ellipse': 1, 'ADBE Vector Shape - Star': 1 };

    // the controls null, top to bottom: key, name (<= 28 characters: the name says what it does),
    // kind, default, menu items. The expressions read them by these names.
    var CONTROLS = [
        ['speed', 'Speed (px per second)', 'slider', 500],
        ['fit', 'Fit to duration', 'checkbox', 0],
        ['duration', 'Duration (s, if fitted)', 'slider', 2],
        ['start', 'Start time (s)', 'slider', 0],
        ['mode', 'Timing', 'menu', 2, ['Together', 'One after another', 'Stagger', 'My own start times']],
        ['gap', 'Gap (s, one after another)', 'slider', 0],
        ['stagger', 'Stagger (s between starts)', 'slider', 0.1],
        ['order', 'Order', 'menu', 1, DG.ORDERS],
        ['dir', 'Direction', 'menu', 1, ['As drawn', 'Reversed', 'Follow the order']],
        ['ease', 'Ease each stroke (%)', 'slider', 0],
        ['easeAll', 'Ease whole drawing (%)', 'slider', 0],
        ['after', 'Afterwards', 'menu', 1, ['Stay drawn', 'Draw off', 'Rewind']],
        ['hold', 'Hold before off (s)', 'slider', 1],
        ['speedUsed', 'Speed used (computed)', 'slider', 0],
        ['total', 'Drawing time (computed)', 'slider', 0]
    ];
    var CTL = {}, ci;
    for (ci = 0; ci < CONTROLS.length; ci++) CTL[CONTROLS[ci][0]] = CONTROLS[ci][1];
    var READ = ['mode', 'order', 'dir', 'after', 'start', 'gap', 'stagger', 'ease', 'easeAll', 'hold'];

    // ---- little helpers ----
    function safe(e) {
        try {
            return String(e.message) + (e.line ? ' (line ' + e.line + ')' : '');
        } catch (x) {
            return 'unknown error';
        }
    }
    function on(p) {
        try {
            return p.enabled !== false;
        } catch (e) {
            return true;
        }
    }
    function isPath(p) {
        return !!(p && PATHS[p.matchName]);
    }
    function layerOf(p) {
        return p.propertyGroup(p.propertyDepth);
    }
    // where a property sits, by index from its layer (names repeat, and change with AE's language)
    function chainOf(p) {
        var s = [], q = p;
        while (q && q.parentProperty) {
            s.unshift(q.propertyIndex);
            q = q.parentProperty;
        }
        return s;
    }
    function resolve(layer, chain) {
        var p = layer;
        for (var k = 0; k < chain.length; k++) p = p.property(chain[k]);
        return p;
    }
    function keyOf(layer, chain) {
        return layer.index + ':' + chain.join('.');
    }
    // "Layer > Group > Group", for reports
    function describe(p) {
        var names = [], q = p;
        while (q && q.parentProperty) {
            if (q.matchName !== MN.vectors && q.matchName !== MN.root) names.unshift(q.name);
            q = q.parentProperty;
        }
        var L = layerOf(p);
        return L.name + (names.length ? ' > ' + names.join(' > ') : '');
    }
    function nice(x) {
        // two significant figures: 1234 -> 1200, 87.4 -> 87
        if (!(x > 0)) return 100;
        var p = Math.pow(10, Math.floor(Math.log(x) / Math.LN10) - 1);
        return Math.max(1, Math.round(x / p) * p);
    }
    function num(x) {
        return String(Math.round(x * 1000) / 1000);
    }
    function list(a, f) {
        var s = [];
        for (var k = 0; k < a.length; k++) s.push(f ? f(a[k]) : String(a[k]));
        return '[' + s.join(', ') + ']';
    }
    function thousands(x) {
        var s = String(Math.round(x)), out = '';
        while (s.length > 3) {
            out = ',' + s.substring(s.length - 3) + out;
            s = s.substring(0, s.length - 3);
        }
        return s + out;
    }

    // ---- which rig a property belongs to ----
    function rigOf(trim) {
        try {
            var x = trim.property(MN.tEnd).expression;
            if (x.indexOf(MARK) === 0) return x.substring(MARK.length, x.indexOf('"', MARK.length));
        } catch (e) {}
        return null;
    }
    // what Remove needs: did the rig add this trim, and its Trim Multiple Shapes before the rig
    function keepOf(trim) {
        var m = /\n\/\/ keep: added=(\d) type=(\d)/.exec(trim.property(MN.tEnd).expression);
        return m ? { added: m[1] === '1', type: Number(m[2]) } : { added: false, type: 0 };
    }
    function rigOfLayer(L) {
        var c = String(L.comment || '');
        return c.indexOf(COMMENT) === 0 ? c.substring(COMMENT.length, c.indexOf('"', COMMENT.length)) : null;
    }
    function controlsOf(comp, rig) {
        for (var k = 1; k <= comp.numLayers; k++) if (rigOfLayer(comp.layer(k)) === rig) return comp.layer(k);
        return null;
    }
    function rigNames(comp) {
        var out = [], seen = {}, k, r;
        for (k = 1; k <= comp.numLayers; k++) {
            r = rigOfLayer(comp.layer(k));
            if (r !== null && !seen[r]) {
                seen[r] = true;
                out.push(r);
            }
        }
        return out;
    }
    function newRigName(comp) {
        var used = {}, names = rigNames(comp), k;
        for (k = 0; k < names.length; k++) used[names[k]] = true;
        if (!used[BASE]) return BASE;
        for (k = 2; used[BASE + ' ' + k]; k++) {}
        return BASE + ' ' + k;
    }

    // a Trim Paths that changes nothing (0 to 100, nothing keyed): another one above or inside a
    // stroke can stay
    function identity(t) {
        var s = t.property(MN.tStart), e = t.property(MN.tEnd);
        function still(p) {
            return p.numKeys === 0 && !(p.expressionEnabled && p.expression !== '');
        }
        return still(s) && still(e) && Math.abs(s.value) < 1e-9 && Math.abs(e.value - 100) < 1e-9;
    }

    // ---- strokes ----
    // A stroke: { layer, list (chain of the contents holding its Trim Paths), trim (chain, or
    // null: one will be added at the end of the list), paths: [{ chain, groups: [chains of the
    // groups between the list and the path, outer first] }], also: [trims that also cut it],
    // ops: [operators before its trim], label, key }
    var OPERATOR = /^ADBE Vector Filter - /;

    function hasPath(list) {
        for (var k = 1; k <= list.numProperties; k++) if (isPath(list.property(k)) && on(list.property(k))) return true;
        return false;
    }
    // the Trim Paths a list's stroke uses: the rig's own if there is one, else the first after its
    // last path (one above every path cuts none of them)
    function pickTrim(list) {
        var last = 0, k, p, found = null;
        for (k = 1; k <= list.numProperties; k++) if (isPath(list.property(k)) && on(list.property(k))) last = k;
        for (k = last + 1; k <= list.numProperties; k++) {
            p = list.property(k);
            if (p.matchName !== MN.trim || !on(p)) continue;
            if (rigOf(p) !== null) return p;
            if (!found) found = p;
        }
        return found;
    }
    // the paths above index `limit` in `list`, groups included, top to bottom (the order
    // Individually runs through them), with the trims and operators met on the way
    function collect(list, limit, groups, s) {
        var before = s.paths.length;
        for (var k = 1; k < limit; k++) {
            var p = list.property(k);
            if (!p || !on(p)) continue;
            if (isPath(p)) {
                s.paths.push({ chain: chainOf(p), groups: groups });
            } else if (p.matchName === MN.group) {
                var inner = p.property(MN.vectors);
                collect(inner, inner.numProperties + 1, groups.concat([chainOf(p)]), s);
            } else if (s.paths.length > before && p.matchName === MN.trim) {
                // a trim cuts the paths above it in its list; one above them all cuts nothing
                if (rigOf(p) !== null || !identity(p)) s.also.push(chainOf(p));
            } else if (s.paths.length > before && OPERATOR.test(p.matchName) && p.matchName !== MN.trim) {
                s.ops.push(chainOf(p));
            }
        }
    }
    function strokeOf(list, trim) {
        var layer = layerOf(list);
        if (list.matchName === MN.group) list = list.property(MN.vectors);
        if (!trim) trim = pickTrim(list);
        var s = { layer: layer, list: chainOf(list), trim: trim ? chainOf(trim) : null, paths: [], also: [], ops: [], label: describe(list) };
        collect(list, trim ? trim.propertyIndex : list.numProperties + 1, [], s);
        // trims below this stroke's paths in its own list (other than its own) also cut them
        for (var k = 1; k <= list.numProperties; k++) {
            var p = list.property(k);
            if (p.matchName === MN.trim && on(p) && (!trim || p.propertyIndex !== trim.propertyIndex) && (!trim || p.propertyIndex > trim.propertyIndex) && (rigOf(p) !== null || !identity(p))) s.also.push(chainOf(p));
        }
        // and trims further down in every list above (AE passes a group's paths up to its parents)
        var item = list.matchName === MN.root ? null : list.parentProperty;
        while (item) {
            var up = item.parentProperty;
            for (k = item.propertyIndex + 1; k <= up.numProperties; k++) {
                var q = up.property(k);
                if (q.matchName === MN.trim && on(q) && (rigOf(q) !== null || !identity(q))) s.also.push(chainOf(q));
            }
            item = up.matchName === MN.root ? null : up.parentProperty;
        }
        s.key = keyOf(layer, s.trim || s.list.concat(['end']));
        return s;
    }
    // the strokes under a list: a list that holds a path is one stroke, else each group in it
    function strokesIn(list, out) {
        if (hasPath(list)) {
            out.push(strokeOf(list, null));
            return;
        }
        for (var k = 1; k <= list.numProperties; k++) {
            var p = list.property(k);
            if (p.matchName === MN.group && on(p)) strokesIn(p.property(MN.vectors), out);
        }
    }
    function isShapeLayer(L) {
        return L instanceof ShapeLayer;
    }
    // the strokes the selection names: selected Trim Paths, paths, groups or Contents, else the
    // selected shape layers whole
    function selectionStrokes(comp) {
        var found = [], out = [], seen = {}, sel = comp.selectedProperties, k, p, props = false;
        for (k = 0; k < sel.length; k++) {
            p = sel[k];
            try {
                if (!isShapeLayer(layerOf(p))) continue;
                if (p.matchName === MN.trim) found.push(strokeOf(p.parentProperty, p));
                else if (p.matchName === MN.group) strokesIn(p.property(MN.vectors), found);
                else if (p.matchName === MN.root || p.matchName === MN.vectors) strokesIn(p, found);
                else if (isPath(p)) found.push(strokeOf(p.parentProperty, null));
                else continue;
                props = true;
            } catch (e) {}
        }
        if (!props) {
            var layers = comp.selectedLayers;
            for (k = 0; k < layers.length; k++) if (isShapeLayer(layers[k]) && rigOfLayer(layers[k]) === null) strokesIn(layers[k].property(MN.root), found);
        }
        // the same stroke twice, or two strokes sharing a path (a trim and a group inside it): keep the first
        var owner = {};
        for (k = 0; k < found.length; k++) {
            var s = found[k], clash = seen[s.key], j;
            for (j = 0; !clash && j < s.paths.length; j++) clash = owner[keyOf(s.layer, s.paths[j].chain)];
            if (clash) continue;
            seen[s.key] = true;
            for (j = 0; j < s.paths.length; j++) owner[keyOf(s.layer, s.paths[j].chain)] = true;
            if (s.paths.length) out.push(s);
        }
        return out;
    }
    // every stroke of rig `rig` in the comp (found by the first line of their expressions)
    function members(comp, rig) {
        var out = [];
        function walk(list) {
            for (var k = 1; k <= list.numProperties; k++) {
                var p = list.property(k);
                if (p.matchName === MN.group) walk(p.property(MN.vectors));
                else if (p.matchName === MN.trim && rigOf(p) === rig) out.push(strokeOf(list, p));
            }
        }
        for (var l = 1; l <= comp.numLayers; l++) if (isShapeLayer(comp.layer(l))) walk(comp.layer(l).property(MN.root));
        return out;
    }

    // ---- measuring ----
    function readGroup(g, t) {
        var tr = g.property(MN.gtr);
        function v(mn) {
            return tr.property(mn).valueAtTime(t, false);
        }
        return { a: v(MN.anchor), p: v(MN.position), s: v(MN.scale), k: v(MN.skew), ka: v(MN.skewAxis), r: v(MN.rotation) };
    }
    // the list's space -> layer space: its own group's transform and every group above
    function listToLayer(list, t) {
        var M = DG.ID, g = list.matchName === MN.root ? null : list.parentProperty;
        while (g) {
            M = DG.mul(DG.groupMatrix(readGroup(g, t)), M);
            var up = g.parentProperty;
            g = up.matchName === MN.root ? null : up.parentProperty;
        }
        return M;
    }
    function localPath(p, t) {
        var dir = 1;
        function v(mn) {
            return p.property(mn).valueAtTime(t, false);
        }
        try {
            dir = v(MN.direction);
        } catch (e) {}
        if (p.matchName === MN.path) {
            var s = v(MN.shape), P = { v: s.vertices, i: s.inTangents, o: s.outTangents, closed: s.closed };
            return dir == 3 ? DG.reverse(P) : P;
        }
        if (p.matchName === MN.rect) return DG.rect(v(MN.rectSize), v(MN.rectPos), v(MN.rectRound), dir);
        if (p.matchName === MN.ellipse) return DG.ellipse(v(MN.ellSize), v(MN.ellPos), dir);
        var type = v(MN.starType);
        return DG.star(type, v(MN.starPoints), v(MN.starPos), v(MN.starRot), type == 1 ? v(MN.starInner) : 0, v(MN.starOuter), dir);
    }
    // where layer-space points land in the comp, through one temporary text layer whose
    // expression asks toComp (parents, 3D layers and cameras included); pts: [{ layer, p }]
    function toCompMany(comp, pts, t) {
        if (api.toComp) return api.toComp(comp, pts, t);
        var L = comp.layers.addText('probe'), k, src = ['var o = [], q;'];
        try {
            for (k = 0; k < pts.length; k++) src.push('q = thisComp.layer(' + pts[k].layer.index + ').toComp([' + pts[k].p[0] + ', ' + pts[k].p[1] + ']); o.push(q[0], q[1]);');
            src.push('o.join(",");');
            var st = L.property(MN.text).property(MN.textDoc);
            st.expression = src.join('\n');
            var text = String(st.valueAtTime(t, false).text), parts = text.split(','), out = [];
            if (parts.length !== 2 * pts.length) throw new Error('could not read where the layers sit in the comp');
            for (k = 0; k < pts.length; k++) out.push([Number(parts[2 * k]), Number(parts[2 * k + 1])]);
            return out;
        } finally {
            L.remove();
        }
    }
    // a layer seen through a camera (3D, or under a 3D parent): toComp is not affine there
    function seen3D(L) {
        for (var q = L, hops = 0; q && hops < 100; q = q.parent, hops++) if (q.threeDLayer) return true;
        return false;
    }
    // measures every stroke at time t: s.m = DG.measure (length in comp px, map, box, ends).
    // A 2D layer maps to the comp affinely: three points per stroke give the map. A 3D layer's
    // every sample point goes through toComp (the default camera has perspective)
    function measure(comp, strokes, t) {
        var pre = [], pts = [], k, j, g;
        for (k = 0; k < strokes.length; k++) {
            var s = strokes[k], up = listToLayer(resolve(s.layer, s.list), t), items = [];
            var x0 = 1e30, y0 = 1e30, x1 = -1e30, y1 = -1e30;
            s.round = false;
            s.animated = false;
            for (j = 0; j < s.paths.length; j++) {
                var pp = resolve(s.layer, s.paths[j].chain), M = up;
                for (g = 0; g < s.paths[j].groups.length; g++) M = DG.mul(M, DG.groupMatrix(readGroup(resolve(s.layer, s.paths[j].groups[g]), t)));
                var P = localPath(pp, t);
                if (pp.matchName === MN.star && (Math.abs(pp.property(MN.starOutRound).value) > 1e-6 || Math.abs(pp.property(MN.starInRound).value) > 1e-6)) s.round = true;
                if (pp.matchName === MN.path && (pp.property(MN.shape).numKeys > 0 || pp.property(MN.shape).expressionEnabled && pp.property(MN.shape).expression !== '')) s.animated = true;
                items.push({ P: P, M: M });
                for (var v = 0; v < P.v.length; v++) {
                    var q = DG.apply(M, P.v[v]);
                    x0 = Math.min(x0, q[0]);
                    y0 = Math.min(y0, q[1]);
                    x1 = Math.max(x1, q[0]);
                    y1 = Math.max(y1, q[1]);
                }
            }
            if (x0 > x1) {
                x0 = x1 = y0 = y1 = 0;
            }
            var c = [(x0 + x1) / 2, (y0 + y1) / 2], h = Math.max(10, x1 - x0, y1 - y0), e = { items: items, c: c, h: h, at: pts.length, deep: seen3D(s.layer) };
            pre.push(e);
            if (e.deep) {
                for (j = 0; j < items.length; j++) {
                    var lp = DG.points(items[j]);
                    items[j].n = lp.length;
                    for (v = 0; v < lp.length; v++) pts.push({ layer: s.layer, p: lp[v] });
                }
            } else {
                pts.push({ layer: s.layer, p: c }, { layer: s.layer, p: [c[0] + h, c[1]] }, { layer: s.layer, p: [c[0], c[1] + h] });
            }
        }
        var qs = strokes.length ? toCompMany(comp, pts, t) : [];
        for (k = 0; k < strokes.length; k++) {
            var E = pre[k], at = E.at;
            if (E.deep) {
                for (j = 0; j < E.items.length; j++) {
                    E.items[j].Q = qs.slice(at, at + E.items[j].n);
                    at += E.items[j].n;
                }
            } else {
                var a = qs[at], b = qs[at + 1], d = qs[at + 2], cc = E.c, hh = E.h;
                var A = [(b[0] - a[0]) / hh, (d[0] - a[0]) / hh, (b[1] - a[1]) / hh, (d[1] - a[1]) / hh, 0, 0];
                A[4] = a[0] - A[0] * cc[0] - A[1] * cc[1];
                A[5] = a[1] - A[2] * cc[0] - A[3] * cc[1];
                for (j = 0; j < E.items.length; j++) E.items[j].M = DG.mul(A, E.items[j].M);
            }
            strokes[k].m = DG.measure(E.items);
            strokes[k].perspective = E.deep;
        }
    }

    // ---- expressions ----
    function readSrc() {
        var s = 'function dsRead(C) {\n    var e = function (n) { return C.effect(n)(1).value; };\n    return {', k;
        for (k = 0; k < READ.length; k++) s += (k ? ', ' : ' ') + READ[k] + ': e("' + CTL[READ[k]] + '")';
        return s + ' };\n}\n';
    }
    var OWN_SRC = 'function dsOwn() {\n' +
        '    var T = thisProperty.propertyGroup(1), best = thisLayer.inPoint, found = false, k, p;\n' +
        '    for (k = 1; k <= 2; k++) {\n' +
        '        p = T(k);\n' +
        '        if (p.numKeys > 0 && (!found || p.key(1).time < best)) {\n' +
        '            best = p.key(1).time;\n' +
        '            found = true;\n' +
        '        }\n' +
        '    }\n' +
        '    return best;\n' +
        '}\n';
    // d: { index, count, len, rank, before, flip, map, added, type }; which: 0 Start, 1 End
    function strokeExpr(rig, d, which) {
        var full = which ? 100 : 0;
        return MARK + rig + '", stroke ' + (d.index + 1) + ' of ' + d.count + ' (' + (which ? 'End' : 'Start') + '). Its settings are on the "' + rig + ' Controls" layer; after editing the path, click Update in the panel.\n' +
            '// keep: added=' + (d.added ? 1 : 0) + ' type=' + d.type + '\n' +
            'var S = { len: ' + num(d.len) + ', rank: ' + list(d.rank) + ', before: ' + list(d.before, num) + ', flip: ' + list(d.flip) + ', map: ' + (d.map ? list(d.map) : '0') + ', own: 0 };\n' +
            DO_TIME + '\n' + readSrc() + OWN_SRC +
            'var out = ' + full + ';\n' +
            'try {\n' +
            '    var C = effect("' + rig + ' Controls")(1), c = dsRead(C);\n' +
            '    c.speed = Math.max(0.001, C.effect("' + CTL.speedUsed + '")(1).value);\n' +
            '    c.total = C.effect("' + CTL.total + '")(1).value;\n' +
            '    S.own = dsOwn();\n' +
            '    out = dsTrim(c, S, time)[' + which + '];\n' +
            '} catch (err) {\n' +
            '    out = ' + full + ';\n' +
            '}\n' +
            'out;';
    }
    function tableSrc(L, R) {
        var rows = [];
        for (var o = 0; o < R.length; o++) rows.push(list(R[o]));
        return 'var L = ' + list(L, num) + ';\nvar R = [' + rows.join(', ') + '];\n';
    }
    function speedExpr(rig, L, R) {
        return MARK + rig + '", the speed in use: Speed, or the one Fit to duration needs. Computed: leave it as it is.\n' +
            tableSrc(L, R) + DO_TIME + '\n' + readSrc() +
            'var c = dsRead(thisLayer);\n' +
            'thisLayer.effect("' + CTL.fit + '")(1).value ? dsFit(c, L, R, thisLayer.effect("' + CTL.duration + '")(1).value) : Math.max(0.001, thisLayer.effect("' + CTL.speed + '")(1).value);';
    }
    function totalExpr(rig, L, R) {
        return MARK + rig + '", how long drawing on takes, in seconds. Computed: leave it as it is.\n' +
            tableSrc(L, R) + DO_TIME + '\n' + readSrc() +
            'var c = dsRead(thisLayer);\n' +
            'dsTotal(c, L, R, Math.max(0.001, thisLayer.effect("' + CTL.speedUsed + '")(1).value));';
    }
    function setExpr(p, x) {
        if (p.expression !== x) p.expression = x;
        if (!p.expressionEnabled) p.expressionEnabled = true;     // AE switches an expression off when it errors
    }

    // ---- the controls null ----
    function makeControls(comp, rig, values) {
        var L = comp.layers.addNull(), k;
        L.name = rig + ' Controls';
        L.comment = COMMENT + rig + '" (' + NAME + ' ' + VERSION + '). Its strokes find it through the Layer Control "' + rig + ' Controls" on their layers.';
        try {
            L.label = 2;
        } catch (e) {}
        for (k = 0; k < CONTROLS.length; k++) {
            var c = CONTROLS[k], fx = L.property(MN.effects).addProperty(c[2] === 'slider' ? MN.slider : (c[2] === 'checkbox' ? MN.checkbox : MN.menu));
            if (c[2] === 'menu') fx.property(1).setPropertyParameters(c[4]);    // invalidates the effect: fetch it again
            fx = L.property(MN.effects).property(k + 1);
            fx.name = c[1];
            fx = L.property(MN.effects).property(k + 1);
            fx.property(1).setValue(values[c[0]] !== undefined ? values[c[0]] : c[3]);
        }
        return L;
    }
    // the rig's own effect on the controls null, by the name it gave it
    function control(L, key) {
        return L.property(MN.effects).property(CTL[key]).property(1);
    }
    // the Layer Control on a rigged layer that points at the controls null (found by where it
    // points, renamed back if needed), added if missing
    function linkLayer(L, ctl, rig) {
        var fx = L.property(MN.effects), k, e;
        for (k = 1; k <= fx.numProperties; k++) {
            e = fx.property(k);
            if (e.matchName === MN.layerCtl && e.property(1).value === ctl.index) {
                if (e.name !== rig + ' Controls') e.name = rig + ' Controls';     // own name: the rig wrote it
                return;
            }
        }
        e = L.property(MN.effects).addProperty(MN.layerCtl);
        e.name = rig + ' Controls';
        L.property(MN.effects).property(L.property(MN.effects).numProperties).property(1).setValue(ctl.index);
    }
    function unlinkLayer(L, ctl) {
        var fx = L.property(MN.effects);
        for (var k = fx.numProperties; k >= 1; k--) {
            var e = fx.property(k);
            if (e.matchName === MN.layerCtl && ctl && e.property(1).value === ctl.index) e.remove();
        }
    }
    function switchOff(T, rig) {
        T.enabled = false;
        var off = T.property(MN.tOffset);
        if (off.expression === '') off.expression = OFF_MARK + rig + '". Remove in its panel turns it back on.\nvalue';
    }
    // the trims rig `rig` switched off on layer L, back on
    function switchOn(L, rig) {
        var n = 0;
        function walk(list) {
            for (var k = 1; k <= list.numProperties; k++) {
                var p = list.property(k);
                if (p.matchName === MN.group) walk(p.property(MN.vectors));
                else if (p.matchName === MN.trim && p.property(MN.tOffset).expression.indexOf(OFF_MARK + rig + '"') === 0) {
                    p.property(MN.tOffset).expression = '';
                    p.enabled = true;
                    n++;
                }
            }
        }
        if (isShapeLayer(L)) walk(L.property(MN.root));
        return n;
    }

    // ---- warnings: what a click would change beyond the strokes' own Trim Paths ----
    // Each warning is filed under what it changes: a Trim Paths that cuts several strokes is
    // one warning under its own name, not one per stroke (seen by hand: a root trim over two
    // groups was listed twice). into = { byLabel, list, seen }; a code goes with every sentence
    // (the sentence quotes AE's names, which change with its language; tests check the code)
    function warnInto(into, s, rig) {
        var k, p;
        function add(key, label, kind, text) {
            if (into.seen[key]) return;
            into.seen[key] = true;
            var g = into.byLabel[label];
            if (!g) {
                g = into.byLabel[label] = { label: label, items: [], kinds: [] };
                into.list.push(g);
            }
            g.items.push(text);
            g.kinds.push(kind);
        }
        for (k = 0; k < s.also.length; k++) {
            p = resolve(s.layer, s.also[k]);
            var other = rigOf(p), tk = 'trim ' + keyOf(s.layer, s.also[k]);
            if (other !== null) add(tk, describe(p), 'other-rig', 'belongs to rig "' + other + '" and also cuts these strokes: it leaves that rig and is switched off (Remove turns it back on)');
            else add(tk, describe(p), 'off', 'also cuts these strokes: it will be switched off (Remove turns it back on)');
        }
        for (k = 0; k < s.ops.length; k++) {
            p = resolve(s.layer, s.ops[k]);
            add('op ' + keyOf(s.layer, s.ops[k]), describe(p), 'operator', 'changes the paths before they are cut, so the speed can be a little off');
        }
        if (s.trim) {
            var T = resolve(s.layer, s.trim), was = rigOf(T);
            if (was !== null && was !== rig) add('moved ' + s.key, s.label, 'moved', 'moves from rig "' + was + '" to rig "' + rig + '"');
            if (was === null) {
                if (s.paths.length > 1 && T.property(MN.tType).value !== 2) add('type ' + s.key, s.label, 'individually', 'its ' + s.paths.length + ' paths share ' + T.name + ': it is set to Individually, so they draw one after another at the same speed');
                var ex = [T.property(MN.tStart), T.property(MN.tEnd)];
                for (k = 0; k < 2; k++) if (ex[k].expression !== '' && ex[k].expressionEnabled) add('expr ' + k + s.key, s.label, 'expression', 'the expression on ' + T.name + ' > ' + ex[k].name + ' is replaced');
            }
        }
    }

    // ---- the work ----
    // measures `strokes` (adding the Trim Paths they lack) and writes every expression of rig
    // `rig`, whose controls null is ctl
    function bake(comp, rig, ctl, strokes, t) {
        var k, j, n = strokes.length, L = [], info = [];
        for (k = 0; k < n; k++) {
            var s = strokes[k];
            if (!s.trim) {
                var T = resolve(s.layer, s.list).addProperty(MN.trim);
                T.name = 'Trim Paths (' + rig + ')';
                s.trim = chainOf(T);
                s.added = true;
                s.type = 1;
            } else {
                var Tk = resolve(s.layer, s.trim), kp = rigOf(Tk) !== null ? keepOf(Tk) : { added: false, type: Tk.property(MN.tType).value };
                s.added = kp.added;
                s.type = kp.type || Tk.property(MN.tType).value;
            }
            if (s.paths.length > 1) {
                var tt = resolve(s.layer, s.trim).property(MN.tType);
                if (tt.value !== 2) tt.setValue(2);
            }
        }
        measure(comp, strokes, t);
        var stack = [];
        for (k = 0; k < n; k++) stack.push({ k: k, li: strokes[k].layer.index, c: strokes[k].trim });
        stack.sort(function (a, b) {
            if (a.li !== b.li) return a.li - b.li;
            for (var q = 0; q < Math.min(a.c.length, b.c.length); q++) if (a.c[q] !== b.c[q]) return a.c[q] - b.c[q];
            return (a.c.length - b.c.length) || (a.k - b.k);
        });
        for (k = 0; k < n; k++) strokes[stack[k].k].stack = k;
        for (k = 0; k < n; k++) {
            L.push(Math.round(strokes[k].m.len * 1000) / 1000);
            info.push({ stack: strokes[k].stack, center: strokes[k].m.center, first: strokes[k].m.first, last: strokes[k].m.last, closed: strokes[k].m.closed });
        }
        var ord = DG.orders(info, 1), befores = [];
        for (j = 0; j < ord.rank.length; j++) befores.push(dsBefore(L, ord.rank[j]));
        for (k = 0; k < n; k++) {
            var d = { index: strokes[k].stack, count: n, len: L[k], rank: [], before: [], flip: [], map: strokes[k].m.map, added: strokes[k].added, type: strokes[k].type };
            for (j = 0; j < ord.rank.length; j++) {
                d.rank.push(ord.rank[j][k]);
                d.before.push(befores[j][k]);
                d.flip.push(ord.flip[j][k]);
            }
            var Tr = resolve(strokes[k].layer, strokes[k].trim);
            setExpr(Tr.property(MN.tStart), strokeExpr(rig, d, 0));
            Tr = resolve(strokes[k].layer, strokes[k].trim);
            setExpr(Tr.property(MN.tEnd), strokeExpr(rig, d, 1));
            strokes[k].d = d;
        }
        setExpr(control(ctl, 'speedUsed'), speedExpr(rig, L, ord.rank));
        setExpr(control(ctl, 'total'), totalExpr(rig, L, ord.rank));
        return { L: L, rank: ord.rank };
    }

    // the Start and End expressions off one stroke; its Trim Paths removed if the rig added it,
    // else its Trim Multiple Shapes put back
    function unrig(s) {
        var T = resolve(s.layer, s.trim);
        if (keepOf(T).added) T.remove();
        else detach(s.layer, s.trim);
    }

    function stats(comp, rig, ctl, n, t) {
        var v = 0, T = 0;
        try {
            v = control(ctl, 'speedUsed').valueAtTime(t, false);
            T = control(ctl, 'total').valueAtTime(t, false);
        } catch (e) {}
        return rig + ': ' + n + (n === 1 ? ' stroke' : ' strokes') + ', ' + Math.round(T * 100) / 100 + ' s at ' + thousands(v) + ' px/s';
    }
    function lines(strokes) {
        var out = [];
        for (var k = 0; k < strokes.length; k++) {
            var s = strokes[k];
            out.push((s.stack + 1) + '. ' + s.label + ': ' + thousands(s.m.len) + ' px' + (s.paths.length > 1 ? ' (' + s.paths.length + ' paths)' : '') + (s.added ? '' : ', your Trim Paths') +
                (s.m.map ? ', stretched (kept even)' : '') + (s.perspective ? ', in 3D (each point placed by After Effects)' : '') + (s.round ? ', rounded star (length approximate)' : '') + (s.animated ? ', animated path (measured now)' : ''));
        }
        return out;
    }

    // the question before a change with warnings: true = go ahead. api.ask stands in for the
    // dialog in tests
    function askUser(warned) {
        if (api.ask) return api.ask(warned);
        var w = new Window('dialog', NAME), i, j, shown = 0, n = WRAP - 6;
        w.orientation = 'column';
        w.alignChildren = ['fill', 'top'];
        w.spacing = 10;
        w.margins = 16;
        para(w, 'Applying the rig also changes this:', n);
        for (i = 0; i < warned.length && shown < 8; i++) {
            var s = section(w, warned[i].label);
            for (j = 0; j < warned[i].items.length && shown < 8; j++, shown++) row(s, '-', warned[i].items[j], 10, n);
        }
        var total = 0;
        for (i = 0; i < warned.length; i++) total += warned[i].items.length;
        if (total > shown) para(w, 'And ' + (total - shown) + ' more: hover the status line afterwards.', n);
        para(w, 'Apply anyway? ' + KEY + '+Z undoes it.', n);
        var bar = w.add('group');
        bar.alignment = ['right', 'top'];
        var no = bar.add('button', undefined, 'Cancel', { name: 'cancel' });
        var yes = bar.add('button', undefined, 'Apply anyway', { name: 'ok' });
        // each button closes the dialog itself: ScriptUI only closes it for the default and
        // cancel elements (the morph fixer's third button did nothing without its own handler)
        yes.onClick = function () {
            w.close(1);
        };
        no.onClick = function () {
            w.close(2);
        };
        w.defaultElement = no;         // Enter cancels: going ahead is the deliberate click
        w.cancelElement = no;
        return w.show() === 1;
    }

    function activeComp() {
        var c = app.project && app.project.activeItem;
        return c instanceof CompItem ? c : null;
    }
    function frameTime(comp) {
        return Math.round(comp.time / comp.frameDuration) * comp.frameDuration;
    }
    function result(status, detail, extra) {
        var r = { status: status, detail: detail };
        for (var k in extra) r[k] = extra[k];
        return r;
    }

    // Apply: the selection's strokes join a rig (the one whose controls layer is selected, the
    // one they all belong to already, or a new one), which is measured and written again whole
    function apply() {
        var comp = activeComp();
        if (!comp) return result('Open a comp first', 'Open a composition, select shape layers, groups or Trim Paths, then click Apply.');
        var sel = selectionStrokes(comp), k, j;
        if (!sel.length) return result('Nothing to draw selected', 'Select shape layers, groups, paths or Trim Paths with paths in them, then click Apply.');
        var rig = null, picked = comp.selectedLayers;
        for (k = 0; k < picked.length && rig === null; k++) rig = rigOfLayer(picked[k]);
        if (rig === null) {
            var same = sel[0].trim ? rigOf(resolve(sel[0].layer, sel[0].trim)) : null;
            for (k = 1; same !== null && k < sel.length; k++) if (!sel[k].trim || rigOf(resolve(sel[k].layer, sel[k].trim)) !== same) same = null;
            if (same !== null && controlsOf(comp, same)) rig = same;
        }
        var isNew = rig === null || !controlsOf(comp, rig);
        if (rig === null) rig = newRigName(comp);
        // everything that will be in the rig: its strokes now, and the selection
        var all = isNew ? [] : members(comp, rig), seen = {}, into = { byLabel: {}, list: [], seen: {} }, warned = into.list, count = 0, others = {};
        for (k = 0; k < all.length; k++) seen[all[k].key] = true;
        for (k = 0; k < sel.length; k++) {
            warnInto(into, sel[k], rig);
            if (!seen[sel[k].key]) {
                all.push(sel[k]);
                seen[sel[k].key] = true;
            }
        }
        var warnLines = [];
        for (k = 0; k < warned.length; k++) for (j = 0; j < warned[k].items.length; j++, count++) warnLines.push('- ' + warned[k].label + ': ' + warned[k].items[j]);
        if (count && !askUser(warned)) return result('Cancelled: nothing changed', 'Would have changed:\n' + warnLines.join('\n'), { cancelled: true, warned: warned });
        var t = frameTime(comp), ctl, offN = 0, rep;
        app.beginUndoGroup(NAME + ': Apply');
        try {
            // trims that also cut a stroke are switched off (another rig's leaves that rig too).
            // Nothing is removed here: removing renumbers what comes after it, and every stroke
            // was found by number
            for (k = 0; k < sel.length; k++) {
                for (j = 0; j < sel[k].also.length; j++) {
                    var T = resolve(sel[k].layer, sel[k].also[j]), other = rigOf(T);
                    if (other !== null) {
                        others[other] = true;
                        detach(sel[k].layer, sel[k].also[j]);
                    }
                    T = resolve(sel[k].layer, sel[k].also[j]);
                    if (on(T)) {
                        switchOff(T, rig);
                        offN++;
                    }
                }
                if (sel[k].trim) {
                    var was = rigOf(resolve(sel[k].layer, sel[k].trim));
                    if (was !== null && was !== rig) others[was] = true;
                }
            }
            if (isNew) {
                var probe = measureOnly(comp, all, t);
                ctl = makeControls(comp, rig, defaults(comp, all, probe, t));
            } else {
                ctl = controlsOf(comp, rig);
            }
            for (k = 0; k < all.length; k++) linkLayer(all[k].layer, ctl, rig);
            rep = bake(comp, rig, ctl, all, t);
            for (var o in others) if (others.hasOwnProperty(o) && o !== rig) rebakeRig(comp, o, t);
        } catch (e) {
            return result('Error (hover)', safe(e), { error: true });
        } finally {
            app.endUndoGroup();
        }
        var detail = lines(all);
        if (offN) detail.push('', offN + ' Trim Paths switched off (Remove turns them back on).');
        if (count) detail.push('', 'You were warned, and applied anyway (' + KEY + '+Z undoes it):', warnLines.join('\n'));
        return result(stats(comp, rig, ctl, all.length, t) + (count ? ', ' + count + (count > 1 ? ' warnings' : ' warning') + ' (hover)' : ''),
            detail.join('\n'), { rig: rig, strokes: all, controls: ctl, warned: warned, lengths: rep.L });
    }
    // another rig's Trim Paths taken out of that rig without removing it (Apply never removes:
    // see there): its expressions go, its Trim Multiple Shapes comes back
    function detach(layer, chain) {
        var T = resolve(layer, chain), kp = keepOf(T);
        T.property(MN.tStart).expression = '';
        T = resolve(layer, chain);
        T.property(MN.tEnd).expression = '';
        T = resolve(layer, chain);
        if (kp.type && T.property(MN.tType).value !== kp.type) T.property(MN.tType).setValue(kp.type);
    }
    // lengths only (the defaults of a new rig need them before its controls exist)
    function measureOnly(comp, strokes, t) {
        var copy = [];
        for (var k = 0; k < strokes.length; k++) copy.push({ layer: strokes[k].layer, list: strokes[k].list, paths: strokes[k].paths });
        measure(comp, copy, t);
        return copy;
    }
    // a new rig's slider values: it starts now; one after another, at a speed that draws it all
    // in about 2 s, or, when every stroke is a Trim Paths the designer keyed, from their own key
    // times at their own average pen speed
    function defaults(comp, strokes, measured, t) {
        var L = [], keyed = 0, speeds = [], k;
        for (k = 0; k < strokes.length; k++) {
            L.push(measured[k].m.len);
            if (!strokes[k].trim) continue;
            var E = resolve(strokes[k].layer, strokes[k].trim).property(MN.tEnd);
            if (E.numKeys >= 2 && rigOf(resolve(strokes[k].layer, strokes[k].trim)) === null) {
                keyed++;
                var span = E.keyTime(E.numKeys) - E.keyTime(1);
                if (span > 0) speeds.push(measured[k].m.len / span);
            }
        }
        var v = { start: t };
        if (keyed === strokes.length && speeds.length) {
            speeds.sort(function (a, b) {
                return a - b;
            });
            v.mode = 4;
            v.speed = nice(speeds[Math.floor(speeds.length / 2)]);
        } else {
            var sum = 0;
            for (k = 0; k < L.length; k++) sum += L[k];
            v.mode = 2;
            v.speed = nice(sum / 2);
        }
        return v;
    }
    function rebakeRig(comp, rig, t) {
        var ctl = controlsOf(comp, rig), all = members(comp, rig);
        if (!ctl) return 0;
        if (!all.length) {
            removeRigLayer(comp, rig, ctl);
            return 0;
        }
        bake(comp, rig, ctl, all, t);
        return all.length;
    }
    function removeRigLayer(comp, rig, ctl) {
        for (var l = comp.numLayers; l >= 1; l--) {
            var L = comp.layer(l);
            if (L === ctl) continue;
            switchOn(L, rig);
            if (ctl) unlinkLayer(L, ctl);
        }
        if (ctl) ctl.remove();
    }

    // Update: measures the selection's rigs again (all of the comp's when nothing is selected)
    function update() {
        var comp = activeComp();
        if (!comp) return result('Open a comp first', 'Open the composition with the rig.');
        var rigs = selectedRigs(comp), k, out = [], t = frameTime(comp), n = 0;
        if (!rigs.length) rigs = rigNames(comp);
        if (!rigs.length) return result('No rig in this comp', 'Select strokes and click Apply first.');
        app.beginUndoGroup(NAME + ': Update');
        try {
            for (k = 0; k < rigs.length; k++) {
                var ctl = controlsOf(comp, rigs[k]);
                if (!ctl) continue;
                var all = members(comp, rigs[k]);
                for (var j = 0; j < all.length; j++) linkLayer(all[j].layer, ctl, rigs[k]);
                if (all.length) bake(comp, rigs[k], ctl, all, t);
                n += all.length;
                out.push(stats(comp, rigs[k], ctl, all.length, t));
                if (all.length) out = out.concat(lines(all));
            }
        } catch (e) {
            return result('Error (hover)', safe(e), { error: true });
        } finally {
            app.endUndoGroup();
        }
        return result(rigs.length === 1 ? 'Updated ' + out[0] : 'Updated ' + rigs.length + ' rigs, ' + n + ' strokes', out.join('\n'), { rigs: rigs });
    }
    function selectedRigs(comp) {
        var rigs = [], seen = {}, k, r;
        function add(x) {
            if (x !== null && !seen[x]) {
                seen[x] = true;
                rigs.push(x);
            }
        }
        for (k = 0; k < comp.selectedLayers.length; k++) add(rigOfLayer(comp.selectedLayers[k]));
        var sel = selectionStrokes(comp);
        for (k = 0; k < sel.length; k++) if (sel[k].trim) add(rigOf(resolve(sel[k].layer, sel[k].trim)));
        // a selected rigged layer whose strokes the selection did not reach
        for (k = 0; k < comp.selectedLayers.length; k++) {
            var fx = comp.selectedLayers[k].property(MN.effects);
            for (var j = 1; fx && j <= fx.numProperties; j++) {
                if (fx.property(j).matchName !== MN.layerCtl) continue;
                try {
                    r = rigOfLayer(comp.layer(fx.property(j).property(1).value));
                    add(r);
                } catch (e) {}
            }
        }
        return rigs;
    }

    // Remove: the selected strokes leave their rig (the whole rig when its controls layer is
    // selected); what was there before comes back
    function remove() {
        var comp = activeComp();
        if (!comp) return result('Open a comp first', 'Open the composition with the rig.');
        var whole = [], k, t = frameTime(comp), gone = 0, offN = 0;
        for (k = 0; k < comp.selectedLayers.length; k++) {
            var r = rigOfLayer(comp.selectedLayers[k]);
            if (r !== null) whole.push(r);
        }
        var sel = [], touched = {}, s;
        if (!whole.length) {
            var found = selectionStrokes(comp);
            for (k = 0; k < found.length; k++) {
                s = found[k];
                var rr = s.trim ? rigOf(resolve(s.layer, s.trim)) : null;
                if (rr !== null) {
                    sel.push(s);
                    touched[rr] = true;
                }
            }
            if (!sel.length) return result('No rigged stroke selected', 'Select rigged strokes (or their layers) to take them off, or the controls layer to remove the whole rig.');
        }
        app.beginUndoGroup(NAME + ': Remove');
        try {
            for (k = 0; k < whole.length; k++) {
                var all = members(comp, whole[k]), ctl = controlsOf(comp, whole[k]);
                // highest first: removing an added trim renumbers the ones after it in its list
                all.sort(byChainDesc);
                for (var j = 0; j < all.length; j++, gone++) unrig(all[j]);
                for (var l = 1; l <= comp.numLayers; l++) offN += switchOn(comp.layer(l), whole[k]);
                removeRigLayer(comp, whole[k], ctl);
            }
            sel.sort(byChainDesc);
            for (k = 0; k < sel.length; k++, gone++) unrig(sel[k]);
            for (var name in touched) {
                if (!touched.hasOwnProperty(name)) continue;
                var c2 = controlsOf(comp, name), rest = members(comp, name), has = {};
                for (j = 0; j < rest.length; j++) has[rest[j].layer.index] = true;
                for (j = 0; j < sel.length; j++) {
                    if (has[sel[j].layer.index]) continue;
                    offN += switchOn(sel[j].layer, name);
                    if (c2) unlinkLayer(sel[j].layer, c2);
                }
                if (!rest.length) removeRigLayer(comp, name, c2);
                else if (c2) bake(comp, name, c2, rest, t);
            }
        } catch (e) {
            return result('Error (hover)', safe(e), { error: true });
        } finally {
            app.endUndoGroup();
        }
        return result('Removed ' + gone + (gone === 1 ? ' stroke' : ' strokes') + (whole.length ? ' and ' + whole.join(', ') : ''),
            'Their own Trim Paths, keys and settings are back' + (offN ? '; ' + offN + ' Trim Paths switched back on' : '') + '.', { removed: gone });
    }
    function byChainDesc(a, b) {
        if (a.layer.index !== b.layer.index) return b.layer.index - a.layer.index;
        for (var q = 0; q < Math.min(a.trim.length, b.trim.length); q++) if (a.trim[q] !== b.trim[q]) return b.trim[q] - a.trim[q];
        return b.trim.length - a.trim.length;
    }

    // the guide behind ?, written for the person animating: what it does, three steps, what
    // each control means in plain words
    var GUIDE = {
        lead: 'Draws every stroke on at the same speed, however long it is.\nOne controls layer sets the speed, the timing and the order.',
        steps: [
            'Select shape layers, groups or Trim Paths. Artwork from Illustrator, converted to shapes, works as it is.',
            'Click Apply. A controls layer (Draw-On Controls) appears, and every stroke gets a Trim Paths that follows it.',
            'Set the speed, the timing and the order in the Effect Controls of that layer. Changed a path? Click Update.'
        ],
        settings: [
            ['Speed', 'Pixels per second, the same for every stroke as seen in the comp. Fit to duration picks the speed at which the drawing lasts Duration. Speed used and Drawing time show the result.'],
            ['Timing', 'Together: all start at once. One after another: like a pen, with Gap between strokes (below 0 they overlap). Stagger: one starts every Stagger seconds. My own start times: each starts at the first key of its Trim Paths; move the key to move it.'],
            ['Order', 'Which stroke goes first. Direction can follow it, so lines run left to right when the order does.'],
            ['Ease', 'At 0 the speed is exactly constant. Each stroke eases on its own; the whole drawing slows at its start and its end, all strokes together.'],
            ['After', 'Stay drawn, Draw off (the lines leave the way they came in) or Rewind (the drawing plays backwards), after Hold.']
        ],
        tips: [
            'Each group that holds paths is one stroke: a letter with holes draws its outline, then its holes.',
            'Select a Trim Paths to drive it as it is, for instance one Trim Paths over a whole layer.',
            'Lengths are measured as seen in the comp, at the current time: scaled, parented, stretched and 3D layers keep the same speed.',
            'Your Trim Paths, keys and expressions stay, and Remove gives them back. A Trim Paths above the strokes is switched off, not deleted.',
            'With the controls layer selected, Apply adds the selection to that rig; without it, Apply makes a new rig. Hover the status line to see what the last click did.'
        ]
    };
    var WRAP = 80;      // characters per line in the guide window (wrapped here, not by ScriptUI)

    function guideText() {
        var s = NAME + ' ' + VERSION + '\n' + GUIDE.lead + '\n\nHow to use\n', i;
        for (i = 0; i < GUIDE.steps.length; i++) s += (i + 1) + '. ' + GUIDE.steps[i] + '\n';
        s += '\nOn the controls layer\n';
        for (i = 0; i < GUIDE.settings.length; i++) s += GUIDE.settings[i][0] + ': ' + GUIDE.settings[i][1] + '\n';
        s += '\nGood to know\n';
        for (i = 0; i < GUIDE.tips.length; i++) s += '- ' + GUIDE.tips[i] + '\n';
        return s;
    }

    // breaks text into lines of at most n characters, at spaces (and at every \n)
    function wrap(text, n) {
        var paras = String(text).split('\n'), out = [];
        for (var p = 0; p < paras.length; p++) {
            var words = paras[p].split(' '), line = '';
            for (var i = 0; i < words.length; i++) {
                if (line && (line + ' ' + words[i]).length > n) {
                    out.push(line);
                    line = words[i];
                } else {
                    line = line ? line + ' ' + words[i] : words[i];
                }
            }
            out.push(line);
        }
        return out;
    }
    // the same number of lines as wrap(text, n), as even as they go: no word left alone
    function wrapEven(text, n) {
        var count = wrap(text, n).length, w = n;
        while (w > 12 && wrap(text, w - 1).length === count) w--;
        return wrap(text, w);
    }

    // ---- installing: the user's own ScriptUI Panels folder, which After Effects reads at launch ----
    function panelsFolder() {
        var v = /^(\d+)\.(\d+)/.exec(String(app.version));
        if (!v) return null;
        var prefs = new Folder((MAC ? '~/Library/Preferences' : Folder.userData.fsName) + '/Adobe/After Effects/' + v[1] + '.' + v[2]);
        return prefs.exists ? new Folder(prefs.fsName + '/Scripts/ScriptUI Panels') : null;
    }
    function appPanelsFolder() {
        try {
            var base = MAC ? Folder.appPackage.parent.fsName : Folder.appPackage.fsName;
            return new Folder(base + '/Scripts/ScriptUI Panels');
        } catch (e) {
            return null;
        }
    }
    // every copy After Effects lists in its Window menu: more than one is a duplicate to remove
    function installedCopies() {
        var dirs = [panelsFolder(), appPanelsFolder()], found = [], d;
        for (d = 0; d < dirs.length; d++) {
            if (!dirs[d]) continue;
            var f = new File(dirs[d].fsName + '/' + FILE_NAME);
            if (f.exists) found.push(f.fsName);
        }
        return found;
    }
    function isInstalled() {
        return installedCopies().length > 0;
    }
    var MANUAL = 'use File > Scripts > Install ScriptUI Panel... and pick ' + FILE_NAME + '.';
    var MSG = {
        done: 'Installed. Restart After Effects, then open Window > ' + FILE_NAME + '.',
        here: 'Installed: this panel opens from Window > ' + FILE_NAME + '.',
        noFolder: 'Could not find your After Effects settings folder: ' + MANUAL,
        noFile: 'Could not find this script\'s own file: ' + MANUAL,
        blocked: 'After Effects blocked the copy. Turn on Preferences > Scripting & Expressions > Allow Scripts to Write Files and Access Network, then try again.'
    };
    function install(dir) {
        dir = dir || panelsFolder();
        if (!dir) return { ok: false, text: MSG.noFolder };
        var src = new File(SELF);
        if (!src.exists) return { ok: false, text: MSG.noFile };
        var dest = new File(dir.fsName + '/' + FILE_NAME);
        if (src.fsName === dest.fsName) return { ok: true, file: dest.fsName, text: MSG.here };
        try {
            if (!dir.exists) {
                new Folder(dir.parent.fsName).create();
                dir.create();
            }
            if (dest.exists) dest.remove();
            if (src.copy(dest.fsName)) return { ok: true, file: dest.fsName, text: MSG.done };
        } catch (e) {}
        return { ok: false, text: MSG.blocked };
    }

    // ---- the guide window (a palette: it can stay open while you work) ----
    // AE 27's app.getAppTheme is a property ('light', 'dark', 'darkest'); without it, dark
    function theme() {
        if (api.themeOverride) return api.themeOverride;
        try {
            return String(app.getAppTheme || 'dark');
        } catch (e) {
            return 'dark';
        }
    }
    // headings stand out by colour (AE draws a bold or larger ScriptUI font as plain text)
    function headingColor() {
        return theme() === 'light' ? [0, 0, 0] : [1, 1, 1];
    }
    function bold(t) {
        try {
            t.graphics.foregroundColor = t.graphics.newPen(t.graphics.PenType.SOLID_COLOR, headingColor(), 1);
        } catch (e) {}
        return t;
    }
    // a paragraph, pre-wrapped, one single-line text per line (ScriptUI re-wraps a multiline
    // text at a width of its own); `alts` are other texts it may show later (setPara)
    function para(parent, text, n, alts) {
        var g = parent.add('group'), all = [text].concat(alts || []), count = 0, i, k, l;
        g.orientation = 'column';
        g.alignChildren = ['fill', 'top'];
        g.spacing = 0;
        for (k = 0; k < all.length; k++) count = Math.max(count, wrapEven(all[k], n).length);
        l = wrapEven(text, n);
        for (i = 0; i < count; i++) g.add('statictext', undefined, i < l.length ? l[i] : ' ');
        if (alts) {
            try {
                var widest = 0;
                for (k = 0; k < all.length; k++) {
                    l = wrapEven(all[k], n);
                    for (i = 0; i < l.length; i++) widest = Math.max(widest, g.children[0].graphics.measureString(l[i])[0]);
                }
                g.preferredSize.width = Math.ceil(widest) + 4;
            } catch (e) {}
        }
        return g;
    }
    function setPara(g, text, n) {
        var l = wrapEven(text, n);
        for (var i = 0; i < g.children.length; i++) g.children[i].text = i < l.length ? l[i] : ' ';
    }
    function row(parent, label, text, labelWidth, n, isBold) {
        var g = parent.add('group');
        g.orientation = 'row';
        g.alignChildren = ['left', 'top'];
        g.spacing = 6;
        var lab = g.add('statictext', undefined, label);
        lab.preferredSize.width = labelWidth;
        if (isBold) bold(lab);
        para(g, text, n);
        return g;
    }
    function section(parent, title) {
        var g = parent.add('group');
        g.orientation = 'column';
        g.alignChildren = ['fill', 'top'];
        g.spacing = 3;
        bold(g.add('statictext', undefined, title));
        return g;
    }
    function buildInfo(docked, onInstall) {
        var w = new Window('palette', NAME, undefined, { resizeable: false });
        w.orientation = 'column';
        w.alignChildren = ['fill', 'top'];
        w.spacing = 12;
        w.margins = 16;
        var head = w.add('group');
        head.orientation = 'column';
        head.alignChildren = ['fill', 'top'];
        head.spacing = 2;
        var title = head.add('group');
        title.spacing = 6;
        bold(title.add('statictext', undefined, NAME));
        title.add('statictext', undefined, VERSION);
        para(head, GUIDE.lead, WRAP + 8);
        var i, s = section(w, 'How to use');
        for (i = 0; i < GUIDE.steps.length; i++) row(s, (i + 1) + '.', GUIDE.steps[i], 14, WRAP + 4);
        s = section(w, 'On the controls layer');
        for (i = 0; i < GUIDE.settings.length; i++) row(s, GUIDE.settings[i][0], GUIDE.settings[i][1], 46, WRAP - 2, true);
        s = section(w, 'Good to know');
        for (i = 0; i < GUIDE.tips.length; i++) row(s, '-', GUIDE.tips[i], 14, WRAP + 4);
        s = section(w, 'Dock it');
        var installB = null, note;
        if (docked) {
            para(s, 'This is the docked panel (Window > ' + FILE_NAME + '). Drag its tab next to any panel, or into its own frame.', WRAP + 8);
        } else {
            var installed = isInstalled();
            var line = s.add('group');
            line.orientation = 'row';
            line.alignChildren = ['left', 'top'];
            line.spacing = 10;
            installB = line.add('button', undefined, installed ? 'Update the panel' : 'Install as a panel');
            installB.helpTip = 'Copies this script into your ScriptUI Panels folder';
            var already = 'Already installed: open Window > ' + FILE_NAME + ' (restart After Effects if it is not there yet).';
            var fresh = 'Puts ' + NAME + ' in the Window menu, dockable like any panel. Restart After Effects after installing.';
            note = para(line, installed ? already : fresh, WRAP - 18, [already, fresh, MSG.done, MSG.blocked, MSG.noFolder, MSG.noFile]);
            installB.onClick = function () {
                var r = install();
                setPara(note, r.text, WRAP - 18);
                if (r.ok) installB.text = 'Update the panel';
                if (onInstall) onInstall(r);
            };
        }
        var foot = w.add('group');
        foot.alignment = ['right', 'top'];
        var closeB = foot.add('button', undefined, 'Close');
        closeB.onClick = function () {
            w.close();
        };
        w.controls = { install: installB, note: note, close: closeB };
        return w;
    }

    // the panel: an After Effects panel when the script sits in a ScriptUI Panels folder (host
    // is a Panel: it docks), otherwise a floating palette. One row (Apply, Update, Remove | ?),
    // which breaks into two when docked narrower than it; a status line.
    function buildUI(host) {
        var docked = host instanceof Panel;
        var w = docked ? host : new Window('palette', NAME, undefined, { resizeable: true });
        w.orientation = 'column';
        w.alignChildren = ['fill', 'top'];
        w.spacing = 3;
        w.margins = 5;
        var bar = w.add('group');
        bar.orientation = 'row';
        bar.alignChildren = ['left', 'center'];
        bar.spacing = 3;
        var acts = bar.add('group');
        acts.orientation = 'row';
        acts.alignChildren = ['left', 'center'];
        acts.spacing = 3;
        var more = bar.add('group');
        more.orientation = 'row';
        more.alignChildren = ['left', 'center'];
        more.spacing = 3;
        var applyB = acts.add('button', undefined, 'Apply');
        applyB.helpTip = 'Rig the selected shape layers, groups or Trim Paths: every stroke draws at the same speed.\nWith a controls layer selected too, they join that rig.';
        var updateB = acts.add('button', undefined, 'Update');
        updateB.helpTip = 'Measure the strokes again after editing paths (the selected rig, or every rig in the comp)';
        var removeB = more.add('button', undefined, 'Remove');
        removeB.helpTip = 'Take the selected strokes off their rig, or the whole rig with its controls layer selected.\nYour own Trim Paths and keys come back.';
        var info = more.add('button', undefined, '?');
        info.preferredSize = [22, 22];
        info.helpTip = docked ? 'How to use it' : 'How to use it, and how to dock this panel';
        var copies = installedCopies(), ready = docked || copies.length > 0;
        var status = w.add('statictext', undefined, ready ? 'Select strokes, then Apply' : 'Tip: click ? to dock this panel', { truncate: 'end' });
        status.helpTip = ready ? 'Hover here after a click to see what it did' : 'Run from File > Scripts it floats; installed, it docks like any panel';
        if (copies.length > 1) {
            status.text = 'Installed twice (hover)';
            status.helpTip = 'After Effects has more than one copy of this panel:\n' + copies.join('\n') +
                '\nDelete all but one (the one in your user folder needs no admin rights to update), then restart After Effects.';
        }
        function show(res) {
            status.text = res.status;
            status.helpTip = res.detail;
            w.lastResult = res;
        }
        applyB.onClick = function () {
            show(apply());
        };
        updateB.onClick = function () {
            show(update());
        };
        removeB.onClick = function () {
            show(remove());
        };
        var guide = null;
        info.onClick = function () {
            if (guide && guide.visible) {
                guide.active = true;
                return;
            }
            guide = buildInfo(docked, function (r) {
                status.text = r.ok ? 'Installed: restart After Effects' : 'Not installed (hover)';
                status.helpTip = r.text;
            });
            w.guide = guide;
            guide.center();
            guide.show();
        };
        w.controls = { apply: applyB, update: updateB, remove: removeB, info: info, status: status, bar: bar };
        w.docked = docked;
        w.layout.layout(true);
        var oneRow = bar.size.width + 12;
        w.twoRows = false;
        w.fitWidth = function (width) {
            var narrow = width < oneRow;
            if (narrow !== w.twoRows) {
                w.twoRows = narrow;
                bar.orientation = narrow ? 'column' : 'row';
                bar.alignChildren = narrow ? ['left', 'top'] : ['left', 'center'];
                w.layout.layout(true);
            }
            w.layout.resize();
        };
        w.onResizing = w.onResize = function () {
            w.fitWidth(w.size.width);
        };
        if (docked && w.size && w.size.width) w.fitWidth(w.size.width);
        if (!docked) {
            w.center();
            w.show();
        }
        api.panel = w;
        return w;
    }

    var api = {
        name: NAME, version: VERSION, apply: apply, update: update, remove: remove, members: members,
        selectionStrokes: selectionStrokes, strokeOf: strokeOf, measure: measure, rigOf: rigOf, keepOf: keepOf,
        controlsOf: controlsOf, rigNames: rigNames, strokeExpr: strokeExpr, speedExpr: speedExpr, totalExpr: totalExpr,
        CONTROLS: CONTROLS, CTL: CTL, guide: GUIDE, info: guideText(), wrap: wrap, buildUI: buildUI, run: buildUI,
        buildInfo: buildInfo, install: install, isInstalled: isInstalled, panelsFolder: panelsFolder,
        installedCopies: installedCopies, theme: theme, headingColor: headingColor, localPath: localPath, MARK: MARK,
        ask: null, themeOverride: null, toComp: null      // test stand-ins: the question before a change, the AE theme, toComp
    };
    return api;
})();

if (!$.global.DRAWON_NO_UI) DrawOn.run(DRAWON_HOST);
