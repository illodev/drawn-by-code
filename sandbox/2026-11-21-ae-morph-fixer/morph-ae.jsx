// morph-ae.jsx - the After Effects half of "Mask Morph Fixer.jsx" (build.mjs puts
// morph-math.js in front of it and passes the script's `this` in as MORPH_HOST).
//
// A compact panel: Smooth / Exact, max points, turn, Fix, ? (the guide), and a status line
// whose tooltip holds the full report. A dockable After Effects panel when the script sits in
// a ScriptUI Panels folder (Window menu); run from File > Scripts it floats, and the guide's
// Install button copies it into the user's ScriptUI Panels folder (no admin rights needed).
// Fix works on the keyed paths selected (a shape layer's Path, a Mask Path, the groups or
// layers holding them): every keyframe gets the same number of points, the same direction
// and a start point that keeps the morph from spinning; key times and easing stay as they
// were. With two or more keyframes selected on a path, only those are fixed.
//
// ExtendScript is ES3: no let/const, arrows, JSON, Array.indexOf/forEach. Strings shown in AE
// stay ASCII.
var MorphFixer = (function () {
    var NAME = 'Mask Morph Fixer', FILE_NAME = NAME + '.jsx', VERSION = '0.10.1';
    var SELF = String($.fileName || '');    // this script's own file (the installed copy when docked)
    var MAC = String($.os).indexOf('Mac') >= 0, KEY = MAC ? 'Cmd' : 'Ctrl';
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
            var id = uid(found[i]);
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

    // The in-between keys a turn writes carry a keyframe label of their own (one of the 16 in
    // Preferences > Labels; After Effects 22.6 and later) and are linear. A later fix finds them,
    // removes them first and works on the keys the designer drew: fixing again redoes the turn
    // the same way, and moving the drawn keys then fixing again retimes it.
    var INBETWEEN_LABEL = 15;

    function isInbetween(prop, k) {
        try {
            return prop.keyLabel(k) === INBETWEEN_LABEL &&
                prop.keyInInterpolationType(k) === KeyframeInterpolationType.LINEAR &&
                prop.keyOutInterpolationType(k) === KeyframeInterpolationType.LINEAR;
        } catch (e) {
            return false;       // no key labels (before 22.6): there are none to find
        }
    }

    // the keys a fix works on -> { idx, drawn, strays, between }: idx = the selected drawn keys
    // (two or more), else all drawn keys; drawn = every key but an earlier turn's in-betweens;
    // strays = the in-betweens from idx's first key to its last, which the fix removes first;
    // between(a, b) = only in-betweens sit between drawn keys a and b
    function keyIndices(prop) {
        var mark = {}, drawn = [], idx = [], strays = [], sel = prop.selectedKeys, n = prop.numKeys, k;
        for (k = 1; k <= n; k++) {
            if (isInbetween(prop, k)) mark[k] = true;
            else drawn.push(k);
        }
        if (sel && sel.length >= 2) for (k = 0; k < sel.length; k++) if (!mark[sel[k]]) idx.push(sel[k]);
        if (idx.length < 2) idx = drawn.slice(0);
        if (idx.length) for (k = idx[0] + 1; k < idx[idx.length - 1]; k++) if (mark[k]) strays.push(k);
        return {
            idx: idx, drawn: drawn, strays: strays, between: function (a, b) {
                for (var j = a + 1; j < b; j++) if (!mark[j]) return false;
                return true;
            }
        };
    }

    // the largest |x| or |y| of a Scale property over its value and keys, as a factor
    function largest(p) {
        var m = 0, k;
        function take(v) {
            m = Math.max(m, Math.abs(v[0]), Math.abs(v[1]));
        }
        take(p.value);
        for (k = 1; k <= p.numKeys; k++) take(p.keyValue(k));
        return m / 100;
    }

    // how many comp pixels one unit of the path covers at most: the scales of its groups, its
    // layer and the layer's parents (largest over their keys). The 0.1 px promise is kept on
    // screen: a layer at 400 % gets a tolerance of 0.025 in its own units. 1 if unreadable
    function magnification(prop) {
        try {
            var m = 1, q = prop.parentProperty, hops = 0;
            while (q && hops++ < 100) {
                if (q.matchName === 'ADBE Vector Group') m *= largest(q.property('ADBE Vector Transform Group').property('ADBE Vector Scale'));
                q = q.parentProperty;
            }
            var layer = prop.propertyGroup(prop.propertyDepth);
            hops = 0;
            while (layer && hops++ < 100) {
                m *= largest(layer.property('ADBE Transform Group').property('ADBE Scale'));
                layer = layer.parent;
            }
            return m > 0 ? Math.min(100, Math.max(0.05, m)) : 1;
        } catch (e) {
            return 1;
        }
    }

    // the selected drawn keys follow each other (nothing but in-betweens between them)
    function consecutive(ki) {
        for (var k = 1; k < ki.idx.length; k++) if (!ki.between(ki.idx[k - 1], ki.idx[k])) return false;
        return true;
    }

    // a turn is written into the path itself, on shape layers and masks alike, so no transform
    // (the group's, the layer's) is touched: the keys as drawn, then one key a frame through
    // every turning step, each the shape swung along the arc (MF.swing, what a group transform
    // turning about the step's pivot would show) at After Effects' own eased progress between
    // the keys (read back with valueAtTime), so custom key speeds come out exactly. The
    // in-betweens are linear and labelled (INBETWEEN_LABEL): the easing is in the shapes. The
    // drawn keys keep their own interpolation and easing, so removing the in-betweens later
    // gives back the timing as it was.
    // -> the number of in-between keys written
    function bakeTurn(prop, idx, r) {
        var T = r.turn, comp = prop.propertyGroup(prop.propertyDepth).containingComp, fd = comp.frameDuration, k, j;
        for (k = 0; k < idx.length; k++) prop.setValueAtKey(idx[k], fromMF(r.placed[k]));
        var times = [], shapes = [];
        for (k = 0; k + 1 < idx.length; k++) {
            if (Math.abs(T.angles[k + 1] - T.angles[k]) < 0.5) continue;
            if (prop.keyOutInterpolationType(idx[k]) === KeyframeInterpolationType.HOLD) continue;
            var t0 = prop.keyTime(idx[k]), t1 = prop.keyTime(idx[k + 1]);
            for (j = 1; t0 + j * fd < t1 - fd / 2; j++) {
                var t = t0 + j * fd, u = MF.progressOf(toMF(prop.valueAtTime(t, false)), r.placed[k], r.placed[k + 1]);
                times.push(t);
                shapes.push(fromMF(MF.swing(T, r.paths, k, u)));
            }
        }
        if (!times.length) return 0;
        prop.setValuesAtTimes(times, shapes);
        var LIN = KeyframeInterpolationType.LINEAR;
        for (j = 0; j < times.length; j++) {
            var at = prop.nearestKeyIndex(times[j]);
            prop.setInterpolationTypeAtKey(at, LIN, LIN);
            try {
                prop.setLabelAtKey(at, INBETWEEN_LABEL);
            } catch (e) {}
        }
        return times.length;
    }

    // removes an earlier turn's in-betweens (ki.strays) and gives the drawn keys' indices after
    // that (removing keys renumbers the ones after them)
    function clearStrays(prop, ki) {
        if (!ki.strays.length) return ki.idx;
        var times = [], k;
        for (k = 0; k < ki.idx.length; k++) times.push(prop.keyTime(ki.idx[k]));
        for (k = ki.strays.length - 1; k >= 0; k--) prop.removeKey(ki.strays[k]);
        var now = [];
        for (k = 0; k < times.length; k++) now.push(prop.nearestKeyIndex(times[k]));
        return now;
    }

    // planPath(pathProperty, options, given, mustWrite) -> { rep, apply }: reads the keys (or
    // takes `given`, the keys as MF paths after the pieces were matched), works the fix out and
    // writes nothing, so a fix can be cancelled with nothing changed; apply() writes it. The
    // report: { label, keys, from, to, reversed, moved, before, after, turned, baked, scale,
    // deviation (comp pixels) } or { label, skipped }. options.progress(fraction) -> true
    // cancels (it throws { cancelled: true }).
    function planPath(prop, opts, given, mustWrite) {
        var o = {}, k, idle = function () {};
        for (k in DEFAULTS) o[k] = DEFAULTS[k];
        if (opts) for (k in opts) o[k] = opts[k];
        var rep = { label: describe(prop) }, plan = { rep: rep, apply: idle };
        if (prop.expression !== '' && prop.expressionEnabled) {
            rep.skipped = 'it has an expression';
            return plan;
        }
        // the drawn keys; an earlier turn's in-betweens among them are removed before writing
        var ki = keyIndices(prop), idx = ki.idx;
        rep.scale = magnification(prop);
        o.tolerance = o.tolerance / rep.scale;
        if (idx.length < 2) {
            rep.skipped = 'fewer than two keyframes';
            return plan;
        }
        if (ki.strays.length) rep.removed = ki.strays.length;
        // a turn goes into in-between keys on the path, which must sit between the fixed keys
        if (o.rotate && !consecutive(ki)) {
            rep.noTurn = 'the selected keys are not next to each other';
            o.rotate = false;
        }
        var paths = [], counts = [];
        for (k = 0; k < idx.length; k++) {
            var s = prop.keyValue(idx[k]);
            if (s.featherSegLocs && s.featherSegLocs.length) {
                rep.skipped = 'its mask has feather points (they belong to segments that would move)';
                return plan;
            }
            paths.push(given ? given[k] : toMF(s));
            counts.push(s.vertices.length);
        }
        var r;
        try {
            r = MF.fix(paths, o);
        } catch (e) {
            if (e && e.cancelled) throw e;
            rep.skipped = e.message;
            return plan;
        }
        if (r.matched) {
            rep.matched = true;
            rep.keys = idx.length;
            if (mustWrite || ki.strays.length) {
                // the pieces were dealt out anew (write them even though no points change), or an
                // earlier turn's in-betweens are to go (turn is off, or nothing turns now)
                plan.apply = function () {
                    var at = clearStrays(prop, ki);
                    if (mustWrite) for (var q = 0; q < at.length; q++) prop.setValueAtKey(at[q], fromMF(paths[q]));
                };
            }
            return plan;
        }
        plan.apply = function () {
            var at = clearStrays(prop, ki);
            if (r.turn) {
                rep.baked = bakeTurn(prop, at, r);
                rep.turned = r.turn.angles[r.turn.angles.length - 1] - r.turn.angles[0];
                return;
            }
            for (var q = 0; q < at.length; q++) prop.setValueAtKey(at[q], fromMF(r.paths[q]));
        };
        rep.kept = !!r.kept;
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
        rep.pathDeviation = r.deviation;                // in the path's own units
        rep.deviation = r.deviation * rep.scale;        // in comp pixels, what the status shows
        return plan;
    }

    // fixes one path at once (plan, then write) -> its report
    function fixPath(prop, opts) {
        var plan = planPath(prop, opts);
        plan.apply();
        return plan.rep;
    }

    function round3(x) {
        return Math.ceil(x * 1000) / 1000;
    }

    function summary(rep) {
        if (rep.skipped) return rep.label + ': skipped, ' + rep.skipped + '.';
        var earlier = rep.removed ? rep.removed + ' in-between keys from an earlier turn' : '';
        if (rep.matched) return rep.label + ': already matched' + (earlier ? '; removed the ' + earlier + '.' : ', left as it is.');
        var how, turned = '';
        if (rep.turned !== undefined && rep.baked) {
            turned = '; turned ' + Math.round(rep.turned) + ' deg in ' + rep.baked + ' in-between keys, one a frame' + (earlier ? ' (replacing ' + earlier + ')' : '');
        } else if (rep.turned !== undefined) {
            turned = '; turned ' + Math.round(rep.turned) + ' deg at the keys (no in-betweens: the turning steps hold, or last a frame)';
        } else if (rep.noTurn) {
            turned = '; not turned: ' + rep.noTurn;
        }
        if (earlier && !rep.baked) turned += '; removed the ' + earlier;
        if (rep.kept) how = 'points already matched, kept as they are';
        else if (rep.fellBack) how = 'your points kept (it has loops or cusps the rebuild cannot follow)';
        else if (rep.mode === 'exact') how = 'your points kept, shapes exact';
        else if (rep.capped) how = 'rebuilt at the max: about ' + (Math.round(rep.deviation * 100) / 100) + ' px from each shape (raise max for a closer fit)';
        else how = 'rebuilt within ' + round3(rep.deviation) + ' px of each shape';
        if (rep.mode !== 'exact' && !rep.fellBack && Math.abs(rep.scale - 1) > 0.005) how += ' on screen (it is scaled to ' + Math.round(rep.scale * 100) + ' %)';
        return rep.label + ': ' + rep.keys + ' keys, ' + rep.from + ' -> ' + rep.to + ' points each' +
            (rep.reversed ? ', ' + rep.reversed + ' reversed' : '') + (rep.moved ? ', ' + rep.moved + ' start points moved' : '') +
            (rep.before ? '; points travel ' + Math.round(rep.before) + ' -> ' + Math.round(rep.after) + ' px around the shape' : '') +
            '; ' + how + turned + '.';
    }

    // ---- before a fix: what depends on the points, and how long it will take ----------------

    // path operators and stroke features that work from a path's first point or per point /
    // segment: a fix moves the first point and adds points, so their result changes
    var OPERATORS = {
        'ADBE Vector Filter - Trim': 'measures from the first point, which moves',
        'ADBE Vector Filter - Zigzag': 'puts ridges on every segment, and the fix adds segments',
        'ADBE Vector Filter - PB': 'pulls every point, and the fix adds points',
        'ADBE Vector Filter - Roughen': 'follows the points, and the fix adds points'
    };
    var STROKES = { 'ADBE Vector Graphic - Stroke': 1, 'ADBE Vector Graphic - G-Stroke': 1 };
    var READS = /\b(points|inTangents|outTangents|pointOnPath|tangentOnPath|normalOnPath)\s*\(/;
    var SKIP_SCAN = { 'ADBE Vector Materials Group': 1, 'ADBE Extrsn Options Group': 1, 'ADBE Plane Options Group': 1, 'ADBE Material Options Group': 1 };

    function on(p) {
        try {
            return p.enabled !== false;
        } catch (e) {
            return true;
        }
    }

    function nonzero(group, names) {
        if (!group) return false;
        for (var i = 0; i < names.length; i++) {
            var p = group.property(names[i]);
            if (p && (p.numKeys > 0 || Math.abs(p.value) > 1e-9)) return true;
        }
        return false;
    }

    // a stroke's dashes, taper and wave, which all run from the first point
    // what a fix would break, as a sentence for people and a code for tests (the sentences hold
    // AE's own names, which change with its language; the codes don't)
    var KIND = { 'ADBE Vector Filter - Trim': 'trim', 'ADBE Vector Filter - Zigzag': 'zigzag', 'ADBE Vector Filter - PB': 'pucker', 'ADBE Vector Filter - Roughen': 'wiggle' };
    function flag(out, kind, text) {
        out.push(text);
        out.kinds.push(kind);
    }

    function strokeNeeds(stroke, out) {
        var d = stroke.property('ADBE Vector Stroke Dashes');
        if (d && d.property('ADBE Vector Stroke Dash 1')) flag(out, 'dashes', 'the dashes of ' + stroke.name + ' start at the first point, which moves');
        if (nonzero(stroke.property('ADBE Vector Stroke Taper'), ['ADBE Vector Taper Start Length', 'ADBE Vector Taper End Length', 'ADBE Vector Taper StartWidthPx', 'ADBE Vector Taper EndWidthPx']))
            flag(out, 'taper', 'the taper of ' + stroke.name + ' runs from the first point, which moves');
        if (nonzero(stroke.property('ADBE Vector Stroke Wave'), ['ADBE Vector Taper Wave Amount']))
            flag(out, 'wave', 'the wave of ' + stroke.name + ' runs from the first point, which moves');
    }

    // what in a shape layer works on this path: operators and strokes after it in its own group
    // and in every group above it (AE passes a group's paths up to its parents)
    function shapeNeeds(prop, out) {
        var item = prop.parentProperty, list = item && item.parentProperty, hops = 0;
        while (item && list && hops++ < 100) {
            for (var i = item.propertyIndex + 1; i <= list.numProperties; i++) {
                var q = list.property(i);
                if (!q || !on(q)) continue;
                if (OPERATORS[q.matchName]) flag(out, KIND[q.matchName], q.name + ' ' + OPERATORS[q.matchName]);
                else if (STROKES[q.matchName]) strokeNeeds(q, out);
            }
            if (list.matchName !== 'ADBE Vectors Group') break;     // the root list: done
            item = list.parentProperty;
            list = item && item.parentProperty;
        }
    }

    // what on a layer works on this mask: text on it, effects pointing at it (Stroke, Vegas...)
    function maskNeeds(prop, out) {
        var mask = prop.parentProperty, layer = prop.propertyGroup(prop.propertyDepth), index = mask.propertyIndex, i, j;
        try {
            var tp = layer.property('ADBE Text Properties').property('ADBE Text Path Options').property('ADBE Text Path');
            if (tp && tp.value === index) flag(out, 'text', 'the text runs along this mask from its first point, which moves');
        } catch (e) {}
        var fx = layer.property('ADBE Effect Parade');
        for (i = 1; fx && i <= fx.numProperties; i++) {
            var e = fx.property(i);
            if (!on(e)) continue;
            for (j = 1; j <= e.numProperties; j++) {
                var p = e.property(j);
                if (p.propertyType === PropertyType.PROPERTY && p.propertyValueType === PropertyValueType.MASK_INDEX && p.value === index) {
                    flag(out, 'effect', e.name + ' uses this mask from its first point, which moves');
                    break;
                }
            }
        }
    }

    // expressions in the comp that read a path's points by number or along it (points(),
    // pointOnPath()...), e.g. nulls from Create Nulls From Paths; stops after `ms`
    function readers(comp, ms) {
        var found = [], t0 = new Date().getTime();
        function walk(g, layer) {
            for (var i = 1; i <= g.numProperties; i++) {
                var p = g.property(i);
                if (!p) continue;
                if (p.propertyType === PropertyType.PROPERTY) {
                    if (p.canSetExpression && p.expressionEnabled && p.expression && READS.test(p.expression))
                        found.push({ layer: layer, where: layer.name + ' > ' + p.name, text: p.expression });
                } else if (!SKIP_SCAN[p.matchName]) {
                    walk(p, layer);
                }
                if (new Date().getTime() - t0 > ms) throw new Error('out of time');
            }
        }
        try {
            for (var l = 1; l <= comp.numLayers; l++) walk(comp.layer(l), comp.layer(l));
        } catch (e) {
            found.partial = true;
        }
        return found;
    }

    // warnings for one path: { label, items: [...] } (items empty when nothing depends on it)
    function needs(prop, comp, reads) {
        var out = [], layer = prop.propertyGroup(prop.propertyDepth), i;
        out.kinds = [];
        try {
            if (prop.matchName === 'ADBE Mask Shape') maskNeeds(prop, out);
            else shapeNeeds(prop, out);
        } catch (e) {}
        for (i = 0; reads && i < reads.length; i++) {
            var x = reads[i].text, nm = layer.name;
            if (reads[i].layer.index === layer.index || x.indexOf('"' + nm + '"') >= 0 || x.indexOf('\'' + nm + '\'') >= 0)
                flag(out, 'expression', 'an expression on ' + reads[i].where + ' reads the points, which move');
        }
        return { label: describe(prop), items: out, kinds: out.kinds };
    }

    // milliseconds per key in After Effects 27 on the reference machine, by mode and average
    // drawn points (fitted to bench/ae-bench.jsx: Smooth costs most when it rebuilds up to its
    // max, Exact about a tenth, turn up to twice)
    function keyMs(n, o) {
        var c;
        if (o.mode === 'exact') c = 90 + 1.5 * n;
        else c = Math.min(2000 * Math.max(0.3, (o.maxPoints || 100) / 100), 170 + 55 * n);
        if (o.rotate) c *= o.mode === 'exact' ? 2 : 1.25;
        return c;
    }

    // this machine's speed against the reference one: a fixed small fix, timed once per session
    // and only for jobs that look long (it costs about 0.15 s)
    var CALIB_REF_MS = 160, speedFactor = 0;      // measured on the reference machine, AE 27
    function speed() {
        if (speedFactor) return speedFactor;
        try {
            var P = [], k, n;
            for (k = 0; k < 2; k++) {
                var v = [], ii = [], oo = [];
                for (n = 0; n < 16; n++) {
                    var a = k + n * Math.PI / 8, r = 150 * (1 + 0.2 * Math.sin(3 * a + k));
                    v.push([r * Math.cos(a), r * Math.sin(a)]);
                    ii.push([0, 0]);
                    oo.push([0, 0]);
                }
                P.push({ v: v, i: ii, o: oo, closed: true });
            }
            var t0 = new Date().getTime();
            MF.fix(P, { mode: 'exact' });
            speedFactor = Math.min(5, Math.max(0.3, (new Date().getTime() - t0) / CALIB_REF_MS));
        } catch (e) {
            speedFactor = 1;
        }
        return speedFactor;
    }

    // seconds the fix of `list` will take, roughly (within about 2x)
    function estimate(list, o) {
        var ms = 0;
        for (var i = 0; i < list.length; i++) {
            var idx = keyIndices(list[i]).idx, pts = 0;
            for (var k = 0; k < idx.length; k++) pts += list[i].keyValue(idx[k]).vertices.length;
            ms += 150 + idx.length * keyMs(pts / Math.max(1, idx.length), o);
        }
        if (ms > 4000) ms *= speed();
        return ms / 1000;
    }

    // "Layer > Group > Path 1" for a heading: no layer number, no final "Path"
    function shortLabel(label) {
        return String(label).replace(/^\d+\. /, '').replace(/ > (Path|Mask Path)$/, '');
    }

    // the question before a fix with warnings or one over 10 s: true = go ahead. api.ask
    // stands in for the dialog in tests
    function askUser(warned, seconds) {
        if (api.ask) return api.ask(warned, seconds);
        var w = new Window('dialog', NAME), i, j, shown = 0, n = WRAP - 6;
        w.orientation = 'column';
        w.alignChildren = ['fill', 'top'];
        w.spacing = 10;
        w.margins = 16;
        if (warned.length) {
            para(w, 'The fix moves the first point and adds points. These depend on them:', n);
            for (i = 0; i < warned.length && shown < 8; i++) {
                var s = section(w, shortLabel(warned[i].label));
                for (j = 0; j < warned[i].items.length && shown < 8; j++, shown++) row(s, '-', warned[i].items[j], 10, n);
            }
            var total = 0;
            for (i = 0; i < warned.length; i++) total += warned[i].items.length;
            if (total > shown) para(w, 'And ' + (total - shown) + ' more: hover the status line after the fix.', n);
        }
        if (seconds > 10) {
            var t = section(w, 'This fix will take about ' + Math.round(seconds) + ' seconds.');
            para(t, 'After Effects will not respond until it is done. Hold Esc to cancel: nothing changes.', n);
        }
        para(w, 'Fix anyway? ' + KEY + '+Z undoes it.', n);
        var bar = w.add('group');
        bar.alignment = ['right', 'top'];
        var no = bar.add('button', undefined, 'Cancel', { name: 'cancel' });
        var yes = bar.add('button', undefined, 'Fix anyway', { name: 'ok' });
        // each button closes the dialog itself: ScriptUI only closes it for the default and
        // cancel elements, so with Enter on Cancel, Fix anyway needs its own handler (clicking
        // it did nothing until it had one)
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

    // ---- pieces: sibling paths that make one shape (a letter and its holes) ----

    // where a property sits, by index (names repeat, and change with AE's language)
    function uid(p) {
        var s = [], q = p;
        while (q && q.parentProperty) {
            s.unshift(q.propertyIndex);
            q = q.parentProperty;
        }
        return p.propertyGroup(p.propertyDepth).index + ':' + s.join('.');
    }

    // the drawn keys of a and b sit at the same times (an earlier turn's in-betweens don't count)
    function sameTimes(a, b) {
        var da = keyIndices(a).drawn, db = keyIndices(b).drawn;
        if (da.length !== db.length) return false;
        for (var k = 0; k < da.length; k++) if (Math.abs(a.keyTime(da[k]) - b.keyTime(db[k])) > 1e-6) return false;
        return true;
    }

    // the targets as shapes in pieces: keyed paths that are siblings (in one shape group, or a
    // layer's masks of one mode) with the same key times, all their keys in play. A path on its
    // own is a shape of one piece. Paths with only some keys selected stay out (singles).
    // -> { groups: [[prop, ...]], singles: [prop, ...] }
    function pieceGroups(list) {
        var byId = {}, ids = [], singles = [], groups = [], i, k;
        for (i = 0; i < list.length; i++) {
            var p = list[i], id = null;
            try {
                var kp = keyIndices(p), partial = kp.idx.length < kp.drawn.length;
                if (!partial) {
                    if (p.matchName === 'ADBE Mask Shape') id = 'mask ' + p.propertyGroup(p.propertyDepth).index + ' ' + p.parentProperty.maskMode;
                    else if (p.parentProperty && p.parentProperty.parentProperty) id = 'shape ' + uid(p.parentProperty.parentProperty);
                }
            } catch (e) {
                id = null;
            }
            if (id === null) {
                singles.push(p);
                continue;
            }
            if (!byId[id]) {
                byId[id] = [];
                ids.push(id);
            }
            byId[id].push(p);
        }
        for (i = 0; i < ids.length; i++) {
            var g = byId[ids[i]], same = true;
            for (k = 1; same && k < g.length; k++) same = sameTimes(g[0], g[k]);
            if (same) groups.push(g);
            else for (k = 0; k < g.length; k++) groups.push([g[k]]);
        }
        return { groups: groups, singles: singles };
    }

    // ---- Esc to cancel (nothing is written until the work is done) ----

    // Read when the work checks in (every key, every round), up to about half a second apart on
    // dense paths: holding Esc is what reliably lands. There is no progress window: a floating
    // window a script opens stays stuck on screen for good if anyone clicks After Effects while
    // the script keeps it busy (Windows' "not responding" stand-in puts it back; no close(),
    // hide() or show()+close() removes it afterwards). The warning before a long fix gives the
    // time and says how to cancel instead.
    function escPressed() {
        if (api.escape) return api.escape();
        try {
            return ScriptUI.environment.keyboardState.keyName === 'Escape';
        } catch (e) {
            return false;
        }
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
        // before touching anything: what depends on the points, and how long it will take
        var o = opts || {}, warned = [], count = 0, seconds = 0;
        try {
            var reads = readers(comp, 800);
            for (i = 0; i < list.length; i++) {
                var wr = needs(list[i], comp, reads);
                if (wr.items.length) {
                    warned.push(wr);
                    count += wr.items.length;
                }
            }
            seconds = estimate(list, { mode: o.mode || 'smooth', maxPoints: o.maxPoints || 100, rotate: !!o.rotate });
        } catch (e0) {}
        var warnLines = [];
        for (i = 0; i < warned.length; i++) for (var j = 0; j < warned[i].items.length; j++) warnLines.push('- ' + warned[i].label + ': ' + warned[i].items[j]);
        if ((count || seconds > 10) && !askUser(warned, seconds)) {
            return {
                status: 'Cancelled: nothing changed', reports: [], warned: warned, seconds: seconds, cancelled: true,
                detail: (count ? 'Depends on the points:\n' + warnLines.join('\n') + '\n' : '') + (seconds > 10 ? 'Estimated time: about ' + Math.round(seconds) + ' s.' : '')
            };
        }
        // work it all out first, writing nothing: a shape's pieces are matched between keys,
        // then every path is planned. Esc (with the progress shown) cancels with nothing changed
        var jobs = [], pieceLines = [], movedN = 0, grownN = 0, plans = [], g, p, k;
        var pg = pieceGroups(list);
        for (i = 0; i < pg.groups.length; i++) {
            g = pg.groups[i];
            try {
                // the drawn keys only: an earlier turn's in-betweens are removed by the fix
                var drawnOf = [], keysMF = [], res;
                for (p = 0; p < g.length; p++) drawnOf.push(keyIndices(g[p]).drawn);
                var K = drawnOf[0].length;
                for (k = 0; k < K; k++) {
                    var rowK = [];
                    for (p = 0; p < g.length; p++) rowK.push(toMF(g[p].keyValue(drawnOf[p][k])));
                    keysMF.push(rowK);
                }
                res = MF.matchPieces(keysMF);
                for (p = 0; p < g.length; p++) {
                    var given = [], changedP = false;
                    for (k = 0; k < K; k++) {
                        given.push(res.keys[k][p]);
                        if (res.keys[k][p] !== keysMF[k][p]) changedP = true;
                    }
                    jobs.push({ prop: g[p], given: changedP ? given : null, mustWrite: changedP });
                }
                if (res.moved || res.grown) {
                    movedN += res.moved;
                    grownN += res.grown;
                    pieceLines.push(shortLabel(describe(g[0])) + (g.length > 1 ? ' and ' + (g.length - 1) + ' more' : '') + ': ' +
                        (res.moved ? res.moved + ' pieces dealt to the path that matches them' : '') + (res.moved && res.grown ? ', ' : '') +
                        (res.grown ? res.grown + ' keys where a piece grows from a point' : ''));
                }
            } catch (eg) {
                for (p = 0; p < g.length; p++) jobs.push({ prop: g[p] });
            }
        }
        for (i = 0; i < pg.singles.length; i++) jobs.push({ prop: pg.singles[i] });
        // Esc is checked for jobs estimated over 4 s (the estimate runs high on small jobs)
        var step = function (text, f) {
            return (seconds > 4 || api.escape) ? escPressed() : false;
        };
        try {
            for (i = 0; i < jobs.length; i++) {
                var po = {}, key;
                for (key in o) po[key] = o[key];
                po.progress = function (f) {
                    return step('Path ' + (i + 1) + ' of ' + jobs.length, (i + f) / jobs.length);
                };
                plans.push(planPath(jobs[i].prop, po, jobs[i].given, jobs[i].mustWrite));
                if (step('Path ' + (i + 1) + ' of ' + jobs.length, (i + 1) / jobs.length)) throw { cancelled: true };
            }
        } catch (ec) {
            if (ec && ec.cancelled) return { status: 'Cancelled: nothing changed', detail: 'Cancelled with Esc before anything was written.', reports: [], cancelled: true, warned: warned, seconds: seconds };
            return { status: 'Error (hover)', detail: String(ec && ec.message) + (ec && ec.line ? ' (line ' + ec.line + ')' : ''), reports: [] };
        }
        app.beginUndoGroup(NAME);
        try {
            for (i = 0; i < plans.length; i++) {
                plans[i].apply();
                var r = plans[i].rep;
                reps.push(r);
                lines.push(summary(r));
                if (r.skipped) skipped++;
                else if (r.matched && !jobs[i].mustWrite && !r.removed) matched++;
                else if (r.matched) fixed++;
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
            return { status: 'Error (hover)', detail: String(e && e.message) + (e && e.line ? ' (line ' + e.line + ')' : ''), reports: reps };
        } finally {
            app.endUndoGroup();
        }
        if (pieceLines.length) lines.push('', 'Pieces matched between keys:', pieceLines.join('\n'));
        var parts = [];
        if (fixed) parts.push('Fixed ' + fixed + ': ' + (lo === hi ? lo : lo + '-' + hi) + ' pts' + (worst ? (capped ? ', ~' : ', ') + round3(worst) + ' px' + (capped ? ' (max)' : '') : ''));
        if (turned) parts.push(turned + ' turned');
        if (movedN || grownN) parts.push('pieces matched');
        if (matched) parts.push(matched + ' already matched');
        if (skipped) parts.push(skipped + ' skipped');
        if (count) parts.push(count + (count > 1 ? ' warnings' : ' warning') + ' (hover)');
        if (count) lines.push('', 'You were warned, and fixed anyway (' + KEY + '+Z undoes it):', warnLines.join('\n'));
        return { status: parts.join(', '), detail: lines.join('\n'), reports: reps, warned: warned, seconds: seconds, moved: movedN, grown: grownN };
    }

    // the guide behind ?, written for the person animating: what it does, three steps, what
    // each setting means in plain words. Shown in a small window, also as plain text (api.info)
    var GUIDE = {
        lead: 'Makes shape and mask morphs clean:\nno tearing, no spinning, no turning inside out.',
        steps: [
            'Animate a Path (on a shape layer) or a Mask Path with two keyframes or more. Draw each key however you like.',
            'Select the path, its group or its layer. To fix only some keys, select just those keyframes.',
            'Click Fix. Key times and easing stay as they are, and ' + KEY + '+Z undoes it.'
        ],
        settings: [
            ['Smooth', 'Redraws the points so the shape stays smooth all through the morph. Each key still looks the same (within 0.1 px) and corners stay sharp.'],
            ['Exact', 'Keeps your own points and only adds new ones. Keys stay exactly as drawn, but the morph may show small bumps.'],
            ['max', 'The most points Smooth may use per key. If the status ends in "(max)", raise it for a closer fit: big or detailed artwork, like type at 400 px, often needs 200 to 300.'],
            ['turn', 'For shapes that rotate between keys, like an F turning onto its side: the shape swings round instead of squashing through the middle. The turn is written into the path as one key a frame; nothing else is keyed. To retime it, move your keys and fix again.']
        ],
        tips: [
            'Fixed paths have more points: finish drawing your keys first.',
            'Letters with holes, shapes in several pieces: select the group or the layer. The pieces are matched between keys, and a piece you draw as a dot grows from that dot.',
            'A long fix keeps After Effects busy until it is done; over 10 seconds, it asks first and says how long. Hold Esc to cancel: nothing changes.',
            'It asks first when Trim Paths, dashes, text on a path or an expression depend on where the points are, and when a fix will take more than 10 seconds.',
            'Rectangles, ellipses and stars: right-click the path > Convert To Bezier Path first.',
            'Paths with expressions and masks with feather points are left alone.',
            'Hover the status line to see what the last fix did.'
        ]
    };
    var WRAP = 80;      // characters per line in the guide window (wrapped here, not by ScriptUI): 80 keeps it under 800 px tall

    function guideText() {
        var s = NAME + ' ' + VERSION + '\n' + GUIDE.lead + '\n\nHow to use\n', i;
        for (i = 0; i < GUIDE.steps.length; i++) s += (i + 1) + '. ' + GUIDE.steps[i] + '\n';
        s += '\nSettings\n';
        for (i = 0; i < GUIDE.settings.length; i++) s += GUIDE.settings[i][0] + ': ' + GUIDE.settings[i][1] + '\n';
        s += '\nGood to know\n';
        for (i = 0; i < GUIDE.tips.length; i++) s += '- ' + GUIDE.tips[i] + '\n';
        return s;
    }

    // breaks text into lines of at most n characters, at spaces (and at every \n)
    function wrap(text, n) {
        var paras = String(text).split('\n'), lines = [];
        for (var p = 0; p < paras.length; p++) {
            var words = paras[p].split(' '), line = '';
            for (var i = 0; i < words.length; i++) {
                if (line && (line + ' ' + words[i]).length > n) {
                    lines.push(line);
                    line = words[i];
                } else {
                    line = line ? line + ' ' + words[i] : words[i];
                }
            }
            lines.push(line);
        }
        return lines;
    }

    // the same number of lines as wrap(text, n), as even as they go: no word left alone on
    // the last line
    function wrapEven(text, n) {
        var count = wrap(text, n).length, w = n;
        while (w > 12 && wrap(text, w - 1).length === count) w--;
        return wrap(text, w);
    }

    // ---- installing: the user's own ScriptUI Panels folder, which After Effects reads at launch
    // (the same place as File > Scripts > Install ScriptUI Panel...) ----
    function panelsFolder() {
        var v = /^(\d+)\.(\d+)/.exec(String(app.version));
        if (!v) return null;
        var prefs = new Folder((MAC ? '~/Library/Preferences' : Folder.userData.fsName) + '/Adobe/After Effects/' + v[1] + '.' + v[2]);
        return prefs.exists ? new Folder(prefs.fsName + '/Scripts/ScriptUI Panels') : null;
    }

    // After Effects' own ScriptUI Panels folder (installing there needs admin rights)
    function appPanelsFolder() {
        try {
            var base = MAC ? Folder.appPackage.parent.fsName : Folder.appPackage.fsName;
            return new Folder(base + '/Scripts/ScriptUI Panels');
        } catch (e) {
            return null;
        }
    }

    // every copy After Effects lists in its Window menu, in the user's folder and in AE's own
    // (the name before 0.9 too): more than one is a duplicate to remove
    function installedCopies() {
        var dirs = [panelsFolder(), appPanelsFolder()], names = [FILE_NAME, 'MorphFixer.jsx'], found = [], d, n;
        for (d = 0; d < dirs.length; d++) {
            for (n = 0; dirs[d] && n < names.length; n++) {
                var f = new File(dirs[d].fsName + '/' + names[n]);
                if (f.exists) found.push(f.fsName);
            }
        }
        return found;
    }

    function isInstalled() {
        return installedCopies().length > 0;
    }

    // what installing can answer (the guide sizes its note for the longest)
    var MANUAL = 'use File > Scripts > Install ScriptUI Panel... and pick ' + FILE_NAME + '.';
    var MSG = {
        done: 'Installed. Restart After Effects, then open Window > ' + FILE_NAME + '.',
        here: 'Installed: this panel opens from Window > ' + FILE_NAME + '.',
        noFolder: 'Could not find your After Effects settings folder: ' + MANUAL,
        noFile: 'Could not find this script\'s own file: ' + MANUAL,
        blocked: 'After Effects blocked the copy. Turn on Preferences > Scripting & Expressions > Allow Scripts to Write Files and Access Network, then try again.'
    };

    // copies this script into the panels folder (or `dir`) -> { ok, text, file }
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
    // After Effects' interface theme: 'light', 'dark' or 'darkest' (AE 27's app.getAppTheme,
    // a property; versions without it are dark)
    function theme() {
        if (api.themeOverride) return api.themeOverride;
        try {
            return String(app.getAppTheme || 'dark');
        } catch (e) {
            return 'dark';
        }
    }

    // headings stand out by colour, black on the Light theme and white on the dark ones: After
    // Effects accepts a bold or larger font (graphics.font reads back Bold) but draws it as
    // plain text; only the pen shows. The body text keeps AE's own colour for the theme
    function headingColor() {
        return theme() === 'light' ? [0, 0, 0] : [1, 1, 1];
    }

    function bold(t) {
        try {
            t.graphics.foregroundColor = t.graphics.newPen(t.graphics.PenType.SOLID_COLOR, headingColor(), 1);
        } catch (e) {}
        return t;
    }

    // a paragraph, pre-wrapped, one single-line text per line: ScriptUI re-wraps a multiline
    // text at a width of its own (the guide came out twice as tall). `alts` are other texts it
    // may show later (setPara): it gets their line count and their widest line up front, since
    // a text changed after layout keeps its size
    function para(parent, text, n, alts) {
        var g = parent.add('group'), all = [text].concat(alts || []), lines = 0, i, k, l;
        g.orientation = 'column';
        g.alignChildren = ['fill', 'top'];
        g.spacing = 0;
        for (k = 0; k < all.length; k++) lines = Math.max(lines, wrapEven(all[k], n).length);
        l = wrapEven(text, n);
        for (i = 0; i < lines; i++) g.add('statictext', undefined, i < l.length ? l[i] : ' ');
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
        s = section(w, 'Settings');
        for (i = 0; i < GUIDE.settings.length; i++) row(s, GUIDE.settings[i][0], GUIDE.settings[i][1], 52, WRAP - 4, true);
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

    function setting(key, fallback) {
        try {
            return app.settings.haveSetting(NAME, key) ? app.settings.getSetting(NAME, key) : fallback;
        } catch (e) {
            return fallback;
        }
    }

    function save(key, value) {
        try {
            app.settings.saveSetting(NAME, key, String(value));
        } catch (e) {}
    }

    // the panel: an After Effects panel when the script sits in a ScriptUI Panels folder (host
    // is a Panel: it docks), otherwise a floating palette. One row (mode, max points, turn |
    // Fix, ?), which breaks into two at the bar when the panel is docked narrower than it; a
    // status line.
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
        var row = bar.add('group');
        row.orientation = 'row';
        row.alignChildren = ['left', 'center'];
        row.spacing = 3;
        var acts = bar.add('group');
        acts.orientation = 'row';
        acts.alignChildren = ['left', 'center'];
        acts.spacing = 3;
        var mode = row.add('dropdownlist', undefined, ['Smooth', 'Exact']);
        mode.selection = setting('mode', 'smooth') === 'exact' ? 1 : 0;
        mode.helpTip = 'Smooth: redraws the points so the morph stays smooth.\nExact: keeps your own points.';
        var maxLabel = row.add('statictext', undefined, 'max');
        var max = row.add('edittext', undefined, setting('max', '100'));
        max.characters = 3;
        max.helpTip = 'The most points Smooth may use per key';
        var turnBox = row.add('checkbox', undefined, 'turn');
        turnBox.value = setting('turn', 'false') === 'true';
        turnBox.helpTip = 'For shapes that rotate between keys: they swing round instead of squashing';
        var fixB = acts.add('button', undefined, 'Fix');
        fixB.preferredSize = [36, 22];
        fixB.helpTip = 'Fix the selected paths, or every keyed path on the selected layers';
        var info = acts.add('button', undefined, '?');
        info.preferredSize = [22, 22];
        info.helpTip = docked ? 'How to use it' : 'How to use it, and how to dock this panel';
        var copies = installedCopies(), ready = docked || copies.length > 0;
        var status = w.add('statictext', undefined, ready ? 'Select keyed paths, then Fix' : 'Tip: click ? to dock this panel', { truncate: 'end' });
        status.helpTip = ready ? 'Hover here after a fix to see what it did' : 'Run from File > Scripts it floats; installed, it docks like any panel';
        if (copies.length > 1) {
            status.text = 'Installed twice (hover)';
            status.helpTip = 'After Effects has more than one copy of this panel:\n' + copies.join('\n') +
                '\nDelete all but one (the one in your user folder needs no admin rights to update), then restart After Effects.';
        }
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
        w.controls = { mode: mode, max: max, turn: turnBox, fix: fixB, info: info, status: status, bar: bar };
        w.docked = docked;
        w.layout.layout(true);
        // the width one row needs, measured while it is one row
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
        name: NAME, fix: fixPath, fixSelection: fixSelection, targets: targets, describe: describe, summary: summary,
        buildUI: buildUI, run: buildUI, buildInfo: buildInfo, guide: GUIDE, info: guideText(), wrap: wrap,
        install: install, isInstalled: isInstalled, panelsFolder: panelsFolder, toMF: toMF, fromMF: fromMF,
        version: VERSION, magnification: magnification, needs: needs, readers: readers, estimate: estimate, keyMs: keyMs,
        speed: speed, installedCopies: installedCopies, theme: theme, headingColor: headingColor,
        planPath: planPath, pieceGroups: pieceGroups, uid: uid, bakeTurn: bakeTurn,
        ask: null, themeOverride: null, escape: null     // test stand-ins: the question before a fix, the AE theme, Esc
    };
    return api;
})();

if (!$.global.MORPH_NO_UI) MorphFixer.run(MORPH_HOST);
