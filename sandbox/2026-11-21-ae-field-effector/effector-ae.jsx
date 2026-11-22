// effector-ae.jsx - the After Effects half of FieldEffector.jsx. build.mjs puts the
// expression sources (field-math.js, field-glue.js) into FX_MATH and FX_GLUE.
//
// Select 2D layers in a comp and run FieldEffector.jsx:
//   Apply      makes "<name> Effector" (a null with the channel sliders) and
//              "<name> Field 1" (the null the designer keys, with shape and falloff controls
//              and a guide gizmo), and gives every selected layer a "<name> Weight" slider and
//              expressions on Anchor Point, Scale, Rotation and Opacity; optionally a Tint
//              effect (tint) and Time Remap (precomps scrub their work area).
//   Add field  adds "<name> Field 2", 3 ... combined by each field's Blend mode.
//   Remove     takes the rig off the selected layers (their own values come back).
// Re-running is safe: it rewrites its own expressions and leaves the designer's alone.
//
// ExtendScript is ES3: no let/const, arrows, JSON, Array.indexOf/forEach.
var FX_MATH = '';
var FX_GLUE = '';

var FieldEffector = (function () {
    var MN = {
        transform: 'ADBE Transform Group',
        anchor: 'ADBE Anchor Point',
        position: 'ADBE Position',
        scale: 'ADBE Scale',
        rotation: 'ADBE Rotate Z',
        opacity: 'ADBE Opacity',
        timeRemap: 'ADBE Time Remapping',
        effects: 'ADBE Effect Parade',
        slider: 'ADBE Slider Control',
        angle: 'ADBE Angle Control',
        checkbox: 'ADBE Checkbox Control',
        color: 'ADBE Color Control',
        layer: 'ADBE Layer Control',
        menu: 'ADBE Dropdown Control',
        tint: 'ADBE Tint',
        tintBlack: 'ADBE Tint-0001',
        tintWhite: 'ADBE Tint-0002',
        tintAmount: 'ADBE Tint-0003',
        shapes: 'ADBE Root Vectors Group',
        group: 'ADBE Vector Group',
        vectors: 'ADBE Vectors Group',
        ellipse: 'ADBE Vector Shape - Ellipse',
        ellipseSize: 'ADBE Vector Ellipse Size',
        rect: 'ADBE Vector Shape - Rect',
        rectSize: 'ADBE Vector Rect Size',
        rectPosition: 'ADBE Vector Rect Position',
        stroke: 'ADBE Vector Graphic - Stroke',
        strokeColor: 'ADBE Vector Stroke Color',
        strokeWidth: 'ADBE Vector Stroke Width',
        strokeOpacity: 'ADBE Vector Stroke Opacity',
        groupTransform: 'ADBE Vector Transform Group',
        groupOpacity: 'ADBE Vector Group Opacity'
    };

    // what the field does at full weight (on the Effector null): name, control, default
    var CHANNELS = [
        ['Strength', 'slider', 100],
        ['Offset X', 'slider', 0],
        ['Offset Y', 'slider', 0],
        ['Push', 'slider', 0],
        ['Scale', 'slider', 150],
        ['Rotation', 'angle', 0],
        ['Opacity', 'slider', 100],
        ['Tint', 'slider', 0],
        ['Tint Color', 'color', [1, 0.42, 0.16, 1]]
    ];
    // where the field is (on each Field null): name, control, default, menu items
    var FIELD = [
        ['Shape', 'menu', 1, ['Sphere', 'Box', 'Linear', 'Noise']],
        ['Size', 'slider', 300],
        ['Falloff', 'slider', 50],
        ['Curve', 'menu', 2, ['Linear', 'Smooth', 'Ease In', 'Ease Out', 'Custom']],
        ['Custom Curve', 'slider', 0],
        ['Strength', 'slider', 100],
        ['Invert', 'checkbox', 0],
        ['Edge Noise', 'slider', 0],
        ['Noise Size', 'slider', 150],
        ['Noise Speed', 'slider', 0.5],
        ['Seed', 'slider', 1],
        ['Blend', 'menu', 1, ['Max', 'Add', 'Subtract', 'Multiply', 'Min']]
    ];
    var DEFAULTS = { name: 'FX', tint: true, time: true };
    var OFF_FLAG = '// time remap was off before the effector';
    var GIZMO_COLOR = [1, 0.55, 0.12, 1];

    function q(s) {
        return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    }

    function findLayer(comp, name) {
        for (var i = 1; i <= comp.numLayers; i++) if (comp.layer(i).name === name) return comp.layer(i);
        return null;
    }

    function tf(layer, mn) {
        return layer.property(MN.transform).property(mn);
    }

    function fxOf(layer) {
        return layer.property(MN.effects);
    }

    // adds a control unless one with that name is there (then the designer's value stays)
    function addControl(layer, def) {
        var e = fxOf(layer).property(def[0]);
        if (e) return e;
        e = fxOf(layer).addProperty(MN[def[1]]);
        var idx = e.propertyIndex;
        if (def[1] === 'menu') e.property(1).setPropertyParameters(def[3]);
        e = fxOf(layer).property(idx);    // adding and re-parametering invalidate references
        e.name = def[0];
        e = fxOf(layer).property(idx);
        e.property(1).setValue(def[2]);
        return e;
    }

    function fieldCount(E) {
        var k = 0;
        while (fxOf(E).property('Field ' + (k + 1))) k++;
        return k;
    }

    function ensureEffector(comp, name) {
        var E = findLayer(comp, name + ' Effector');
        if (!E) {
            E = comp.layers.addNull(comp.duration);
            E.name = name + ' Effector';
            E.label = 9;
            tf(E, MN.position).setValue([Math.round(comp.width * 0.04) + 50, Math.round(comp.height * 0.06) + 50, 0]);
            E.moveToBeginning();
        }
        for (var i = 0; i < CHANNELS.length; i++) addControl(E, CHANNELS[i]);
        return E;
    }

    // ---- the guide gizmo that draws a field in the viewer (not rendered) ----------------

    function gizmoPart(G, label, kind, sizeExpr, posExpr, shape, width, opacity) {
        var root = function () { return G.property(MN.shapes).property(label); };
        G.property(MN.shapes).addProperty(MN.group).name = label;
        root().property(MN.vectors).addProperty(kind === 'ellipse' ? MN.ellipse : MN.rect);
        root().property(MN.vectors).addProperty(MN.stroke);
        var sh = root().property(MN.vectors).property(1);
        sh.property(kind === 'ellipse' ? MN.ellipseSize : MN.rectSize).expression = sizeExpr;
        if (posExpr) root().property(MN.vectors).property(1).property(MN.rectPosition).expression = posExpr;
        var st = root().property(MN.vectors).property(2);
        st.property(MN.strokeColor).setValue(GIZMO_COLOR);
        st.property(MN.strokeWidth).setValue(width);
        st.property(MN.strokeOpacity).setValue(opacity);
        root().property(MN.groupTransform).property(MN.groupOpacity).expression =
            'thisLayer.parent.effect("Shape")(1).value === ' + shape + ' ? 100 : 0;';
    }

    function makeGizmo(comp, F) {
        var G = comp.layers.addShape();
        G.name = F.name + ' Gizmo';
        G.label = F.label;
        G.parent = F;
        tf(G, MN.anchor).setValue([0, 0, 0]);
        tf(G, MN.position).expression = 'thisLayer.parent.transform.anchorPoint.value;';
        tf(G, MN.scale).setValue([100, 100, 100]);
        tf(G, MN.rotation).setValue(0);
        var P = 'var F = thisLayer.parent, S = Math.max(0, F.effect("Size")(1).value);\n' +
            'var f = Math.max(0, Math.min(100, F.effect("Falloff")(1).value)) / 100;\n';
        gizmoPart(G, 'Sphere edge', 'ellipse', P + '[2 * S, 2 * S];', null, 1, 2.5, 100);
        gizmoPart(G, 'Sphere full', 'ellipse', P + '[2 * S * (1 - f), 2 * S * (1 - f)];', null, 1, 1.2, 60);
        gizmoPart(G, 'Box edge', 'rect', P + '[2 * S, 2 * S];', null, 2, 2.5, 100);
        gizmoPart(G, 'Box full', 'rect', P + '[2 * S * (1 - f), 2 * S * (1 - f)];', null, 2, 1.2, 60);
        gizmoPart(G, 'Linear edge', 'rect', '[0.5, 4000];', null, 3, 2.5, 100);
        gizmoPart(G, 'Linear full', 'rect', '[0.5, 4000];', P + '[-S * f, 0];', 3, 1.2, 60);
        G.guideLayer = true;
        G.locked = true;
        return G;
    }

    // comp-space centre and size of the layers (one temporary null, removed after)
    function bounds(comp, list) {
        if (!list.length) return { center: [comp.width / 2, comp.height / 2], size: Math.round(comp.height / 4) };
        var tmp = comp.layers.addNull(comp.duration);
        tmp.name = 'Field Effector sampler (temporary)';
        var idx = [];
        for (var i = 0; i < list.length; i++) idx.push(list[i].index);    // after the null went in on top
        var pos = tf(tmp, MN.position);
        var body = 'var I = [' + idx.join(', ') + '], X = [], Y = [];\n' +
            'for (var i = 0; i < I.length; i++) {\n' +
            '    var L = thisComp.layer(I[i]);\n' +
            '    var p = L.hasParent ? L.parent.toComp(L.transform.position) : L.transform.position;\n' +
            '    X.push(p[0]);\n' +
            '    Y.push(p[1]);\n' +
            '}\n';
        var t = comp.time;
        pos.expression = body + 'var sx = 0, sy = 0;\nfor (i = 0; i < X.length; i++) { sx += X[i]; sy += Y[i]; }\n[sx / X.length, sy / Y.length];';
        var c = pos.valueAtTime(t, false);
        pos.expression = body + '[Math.min.apply(null, X), Math.min.apply(null, Y)];';
        var lo = pos.valueAtTime(t, false);
        pos.expression = body + '[Math.max.apply(null, X), Math.max.apply(null, Y)];';
        var hi = pos.valueAtTime(t, false);
        var err = pos.expressionError;
        tmp.remove();
        if (err) throw new Error('Could not read where the layers are: ' + err);
        var extent = Math.max(hi[0] - lo[0], hi[1] - lo[1]);
        return { center: [c[0], c[1]], size: Math.max(60, Math.round(extent * 0.2)) };
    }

    function addField(comp, name, at, size) {
        var E = ensureEffector(comp, name);
        var k = fieldCount(E) + 1, i;
        var F = comp.layers.addNull(comp.duration);
        F.name = name + ' Field ' + k;
        F.label = 11;
        tf(F, MN.position).setValue([at[0], at[1], 0]);
        for (i = 0; i < FIELD.length; i++) addControl(F, FIELD[i]);
        fxOf(F).property('Size').property(1).setValue(size);
        if (k > 1) fxOf(F).property('Blend').property(1).setValue(2);    // a second field adds by default
        // a default Custom curve (0 -> 100, eased): its keys' shape is the falloff, not timing
        var cc = fxOf(F).property('Custom Curve').property(1);
        cc.setValueAtTime(F.inPoint, 0);
        cc.setValueAtTime(F.inPoint + 1, 100);
        for (i = 1; i <= 2; i++) {
            cc.setInterpolationTypeAtKey(i, KeyframeInterpolationType.BEZIER);
            cc.setTemporalEaseAtKey(i, [new KeyframeEase(0, 33.333)], [new KeyframeEase(0, 33.333)]);
        }
        // below the effector and the fields before it
        var above = E;
        for (i = 1; i < k; i++) {
            var g = findLayer(comp, name + ' Field ' + i + ' Gizmo') || findLayer(comp, name + ' Field ' + i);
            if (g && g.index > above.index) above = g;
        }
        F.moveAfter(above);
        var G = makeGizmo(comp, F);
        G.locked = false;
        G.moveAfter(F);
        G.locked = true;
        var lc = fxOf(E).addProperty(MN.layer), li = lc.propertyIndex;
        fxOf(E).property(li).name = 'Field ' + k;
        fxOf(E).property(li).property(1).setValue(F.index);
        return F;
    }

    // ---- expressions --------------------------------------------------------------------

    function marker(name) {
        return '// ' + name + ' effector:';
    }

    function header(name, what) {
        return marker(name) + ' ' + what + '. Written by FieldEffector.jsx: re-run it to change; edits here are replaced.\n';
    }

    function isOurs(prop, name) {
        return prop.expression.indexOf(marker(name)) === 0;
    }

    function effRef(name) {
        return 'thisComp.layer(' + q(name + ' Effector') + ')';
    }

    function wRef(name) {
        return 'effect(' + q(name + ' Weight') + ')(1).value / 100';
    }

    // In expressions effect("X")(1) and transform.x are Property objects: arithmetic converts
    // them, but ===, !== and if () don't, so every read below takes .value.
    var REST = 'var p = hasParent ? parent.toComp(transform.position.value) : transform.position.value;\n';

    var EXPR = {
        weight: function (name, K) {
            return header(name, 'weight of the fields at this layer, 0-100') + FX_MATH + '\n' + FX_GLUE + '\n' +
                'var E = ' + effRef(name) + ';\n' + REST +
                'var r = fxAt(E, ' + K + ', p[0], p[1], time);\n' +
                'r[0] * E.effect("Strength")(1).value;';
        },
        anchor: function (name, K) {
            return header(name, 'Offset and Push, moved into the anchor point') + FX_MATH + '\n' + FX_GLUE + '\n' +
                'var E = ' + effRef(name) + ', w = ' + wRef(name) + ';\n' +
                'var push = E.effect("Push")(1).value, dx = E.effect("Offset X")(1).value * w, dy = E.effect("Offset Y")(1).value * w;\n' +
                REST +
                'if (push !== 0 && w !== 0) {\n' +
                '    var r = fxAt(E, ' + K + ', p[0], p[1], time);\n' +
                '    dx += push * w * r[1];\n' +
                '    dy += push * w * r[2];\n' +
                '}\n' +
                'if (hasParent) {\n' +
                '    var a = parent.fromComp([p[0] + dx, p[1] + dy]), b = parent.fromComp([p[0], p[1]]);\n' +
                '    dx = a[0] - b[0];\n' +
                '    dy = a[1] - b[1];\n' +
                '}\n' +
                'var rs = transform.scale.value, s = fxAnchorShift(dx, dy, transform.rotation.value, rs[0], rs[1]);\n' +
                'value.length > 2 ? [value[0] - s[0], value[1] - s[1], value[2]] : [value[0] - s[0], value[1] - s[1]];';
        },
        scale: function (name) {
            return header(name, 'Scale') +
                'var E = ' + effRef(name) + ', w = ' + wRef(name) + ';\n' +
                'var k = 1 + (E.effect("Scale")(1).value / 100 - 1) * w, out = [];\n' +
                'for (var i = 0; i < value.length; i++) out.push(value[i] * k);\n' +
                'out;';
        },
        rotation: function (name) {
            return header(name, 'Rotation') +
                'value + ' + effRef(name) + '.effect("Rotation")(1).value * ' + wRef(name) + ';';
        },
        opacity: function (name) {
            return header(name, 'Opacity') +
                'var E = ' + effRef(name) + ', w = ' + wRef(name) + ';\n' +
                'var k = 1 + (E.effect("Opacity")(1).value / 100 - 1) * w;\n' +
                'Math.max(0, Math.min(100, value * k));';
        },
        tintColor: function (name) {
            return header(name, 'tint colour') + effRef(name) + '.effect("Tint Color")(1).value;';
        },
        tintAmount: function (name, full) {
            return header(name, 'tint amount') +
                'var a = ' + effRef(name) + '.effect("Tint")(1).value / 100 * ' + wRef(name) + ';\n' +
                full + ' * Math.max(0, Math.min(1, a));';
        },
        time: function (name, start, len, off) {
            return header(name, 'the weight scrubs the precomp\'s work area') + (off ? OFF_FLAG + '\n' : '') +
                'var u = Math.max(0, Math.min(1, ' + wRef(name) + '));\n' +
                start + ' + u * ' + len + ';';
        }
    };

    // AE switches an expression off when it errors; writing it again must switch it back on
    function setExpr(prop, expr) {
        prop.expression = expr;
        if (!prop.expressionEnabled) prop.expressionEnabled = true;
    }

    // sets an expression unless the property has one of the designer's
    function put(L, prop, expr, name, rep, label) {
        if (prop.expression !== '' && !isOurs(prop, name)) {
            rep.kept.push(L.name + ' > ' + label);
            return false;
        }
        setExpr(prop, expr);
        return true;
    }

    // A Tint effect with both colours on the tint colour: its Amount blends the layer towards
    // that colour and keeps its alpha. (Not Fill: a Fill's Opacity is the opacity of the fill
    // that replaces the layer, so a Fill at 0 % makes the layer vanish.)
    function applyTint(L, name, rep) {
        var tn = name + ' Tint';
        var old = fxOf(L).property(tn);
        if (old && old.matchName !== MN.tint) old.remove();    // a Fill left by an earlier version
        if (!fxOf(L).property(tn)) {
            var i = fxOf(L).addProperty(MN.tint).propertyIndex;
            fxOf(L).property(i).name = tn;
        }
        var T = function () { return fxOf(L).property(tn); };
        var amount = T().property(MN.tintAmount);
        var full = amount.hasMax ? amount.maxValue : 100;    // the effect's own 100 %
        put(L, T().property(MN.tintBlack), EXPR.tintColor(name), name, rep, 'Tint colour');
        put(L, T().property(MN.tintWhite), EXPR.tintColor(name), name, rep, 'Tint colour');
        put(L, T().property(MN.tintAmount), EXPR.tintAmount(name, full), name, rep, 'Tint amount');
    }

    function applyTime(L, name, rep) {
        var src = L.source;
        var start = src.workAreaStart, len = Math.max(0, src.workAreaDuration - src.frameDuration);
        var wasOn = L.timeRemapEnabled;
        if (!wasOn) {
            var inP = L.inPoint, outP = L.outPoint;
            L.timeRemapEnabled = true;    // AE adds two keys: keep them (removing the last turns it off)
            L.inPoint = inP;
            L.outPoint = outP;
        }
        var tr = L.property(MN.timeRemap);
        if (tr.expression !== '' && !isOurs(tr, name)) {
            rep.kept.push(L.name + ' > Time Remap');
            return;
        }
        var off = !wasOn || (isOurs(tr, name) && tr.expression.indexOf(OFF_FLAG) >= 0);
        setExpr(tr, EXPR.time(name, Math.round(start * 1e6) / 1e6, Math.round(len * 1e6) / 1e6, off));
    }

    function applyLayer(L, name, K, opts, rep) {
        var wn = name + ' Weight';
        if (!fxOf(L).property(wn)) fxOf(L).addProperty(MN.slider).name = wn;
        setExpr(fxOf(L).property(wn).property(1), EXPR.weight(name, K));
        put(L, tf(L, MN.anchor), EXPR.anchor(name, K), name, rep, 'Anchor Point (Offset, Push)');
        put(L, tf(L, MN.scale), EXPR.scale(name), name, rep, 'Scale');
        put(L, tf(L, MN.rotation), EXPR.rotation(name), name, rep, 'Rotation');
        put(L, tf(L, MN.opacity), EXPR.opacity(name), name, rep, 'Opacity');
        if (opts.tint) applyTint(L, name, rep);
        if (opts.time && L.source instanceof CompItem) applyTime(L, name, rep);
    }

    function isRigLayer(L, name) {
        return L.name === name + ' Effector' || L.name.indexOf(name + ' Field ') === 0;
    }

    // why a layer can't take the rig, or ''
    function unusable(L, name) {
        if (!(L instanceof AVLayer)) return 'not a visual layer';
        if (isRigLayer(L, name)) return 'part of the rig';
        if (L.threeDLayer) return '3D layer (2D layers only, for now)';
        return '';
    }

    function targets(comp, name) {
        var out = [];
        for (var i = 1; i <= comp.numLayers; i++) {
            var L = comp.layer(i), fx = L.property(MN.effects);
            if (fx && fx.property(name + ' Weight')) out.push(L);
        }
        return out;
    }

    // the targets' weight and anchor expressions catch up with the number of fields
    function refresh(comp, name) {
        var E = findLayer(comp, name + ' Effector');
        if (!E) return 0;
        var K = fieldCount(E), T = targets(comp, name), rep = { kept: [] };
        for (var i = 0; i < T.length; i++) {
            setExpr(fxOf(T[i]).property(name + ' Weight').property(1), EXPR.weight(name, K));
            var a = tf(T[i], MN.anchor);
            if (isOurs(a, name)) setExpr(a, EXPR.anchor(name, K));
        }
        return T.length;
    }

    function options(opts) {
        var o = {}, k;
        for (k in DEFAULTS) o[k] = DEFAULTS[k];
        for (k in opts) o[k] = opts[k];
        return o;
    }

    // apply(comp, layers, { name, tint, time }) -> report
    function apply(comp, layers, opts) {
        var o = options(opts || {});
        if (!(comp instanceof CompItem)) throw new Error('Open a composition first.');
        var rep = { applied: 0, skipped: [], kept: [], warnings: [], newField: false, fields: 0, targets: 0 };
        var list = [], i;
        for (i = 0; i < layers.length; i++) {
            var why = unusable(layers[i], o.name);
            if (why) rep.skipped.push(layers[i].name + ': ' + why);
            else list.push(layers[i]);
        }
        if (!list.length) throw new Error('Select the 2D layers the field should act on.' +
            (rep.skipped.length ? '\nSkipped: ' + rep.skipped.join('; ') : ''));
        var E = ensureEffector(comp, o.name);
        if (fieldCount(E) === 0) {
            var b = bounds(comp, list);
            addField(comp, o.name, b.center, b.size);
            rep.newField = true;
        }
        var K = fieldCount(E);
        for (i = 0; i < list.length; i++) {
            var L = list[i];
            if (L.autoOrient !== AutoOrientType.NO_AUTO_ORIENT)
                rep.warnings.push(L.name + ': Auto-Orient is on, so Offset and Push ignore its path rotation');
            applyLayer(L, o.name, K, o, rep);
            rep.applied++;
        }
        rep.targets = refresh(comp, o.name);
        E.comment = ({ tint: o.tint, time: o.time }).toSource();
        rep.fields = K;
        return rep;
    }

    // addAnotherField(comp, name) -> the new field layer (placed on the first one, half its size)
    function addAnotherField(comp, name) {
        name = name || DEFAULTS.name;
        var E = findLayer(comp, name + ' Effector');
        if (!E) throw new Error('No "' + name + ' Effector" in this comp: Apply first.');
        var F1 = findLayer(comp, name + ' Field 1'), at = [comp.width / 2, comp.height / 2], size = Math.round(comp.height / 4);
        if (F1) {
            var p = tf(F1, MN.position).value;
            at = [p[0] + 40, p[1] + 40];
            size = Math.round(fxOf(F1).property('Size').property(1).value / 2);
        }
        var F = addField(comp, name, at, size);
        refresh(comp, name);
        return F;
    }

    // remove(comp, layers, name) -> how many layers it was taken off
    function remove(comp, layers, name) {
        name = name || DEFAULTS.name;
        var n = 0, i, j;
        for (i = 0; i < layers.length; i++) {
            var L = layers[i];
            if (!(L instanceof AVLayer) || !fxOf(L) || !fxOf(L).property(name + ' Weight')) continue;
            var props = [tf(L, MN.anchor), tf(L, MN.scale), tf(L, MN.rotation), tf(L, MN.opacity)];
            for (j = 0; j < props.length; j++) if (isOurs(props[j], name)) props[j].expression = '';
            if (L.timeRemapEnabled) {
                var tr = L.property(MN.timeRemap);
                if (isOurs(tr, name)) {
                    var off = tr.expression.indexOf(OFF_FLAG) >= 0;
                    tr.expression = '';
                    if (off) {
                        var inP = L.inPoint, outP = L.outPoint;
                        L.timeRemapEnabled = false;
                        L.inPoint = inP;
                        L.outPoint = Math.min(outP, L.startTime + L.source.duration);
                    }
                }
            }
            if (fxOf(L).property(name + ' Tint')) fxOf(L).property(name + ' Tint').remove();
            fxOf(L).property(name + ' Weight').remove();
            n++;
        }
        return n;
    }

    // ---- dialog -------------------------------------------------------------------------

    function guessName(comp) {
        for (var i = 1; i <= comp.numLayers; i++) {
            var L = comp.layer(i), m = L.name.match(/^(.+) Effector$/);
            if (m && L.nullLayer && L.property(MN.effects).property('Field 1')) return { name: m[1], prev: L.comment };
        }
        return { name: DEFAULTS.name, prev: '' };
    }

    function run() {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            alert('Field Effector: open a composition and select the layers the field should act on.');
            return;
        }
        var g = guessName(comp), s = options({});
        try {
            var prev = g.prev ? eval(g.prev) : null;
            if (prev && typeof prev === 'object') for (var k in prev) s[k] = prev[k];
        } catch (e) {}
        var sel = comp.selectedLayers;

        var w = new Window('dialog', 'Field Effector');
        w.orientation = 'column';
        w.alignChildren = 'fill';
        var r1 = w.add('group');
        r1.add('statictext', undefined, 'Effector name:');
        var eName = r1.add('edittext', undefined, g.name);
        eName.characters = 12;
        r1.add('statictext', undefined, 'layers "<name> Effector", "<name> Field 1"...');
        var pc = w.add('panel', undefined, 'Channels added to the layers');
        pc.alignChildren = 'left';
        pc.add('statictext', undefined, 'Always: Offset, Push, Scale, Rotation, Opacity (sliders on the Effector).');
        var cTint = pc.add('checkbox', undefined, 'Tint: a Tint effect, blending towards the Tint Color by the weight');
        cTint.value = !!s.tint;
        var cTime = pc.add('checkbox', undefined, 'Precomp time: the weight scrubs each precomp\'s work area (0 = start, 100 = end)');
        cTime.value = !!s.time;
        w.add('statictext', undefined, sel.length + ' layer' + (sel.length === 1 ? '' : 's') + ' selected.');
        var bt = w.add('group');
        bt.alignment = 'right';
        var action = null;
        var bRemove = bt.add('button', undefined, 'Remove from selected');
        var bField = bt.add('button', undefined, 'Add field');
        bt.add('button', undefined, 'Cancel', { name: 'cancel' });
        var bApply = bt.add('button', undefined, 'Apply to selected', { name: 'ok' });
        bRemove.onClick = function () { action = 'remove'; w.close(1); };
        bField.onClick = function () { action = 'field'; w.close(1); };
        bApply.onClick = function () { action = 'apply'; w.close(1); };
        if (w.show() !== 1 || !action) return;
        var name = eName.text.replace(/^\s+|\s+$/g, '') || DEFAULTS.name;

        app.beginUndoGroup('Field Effector');
        try {
            if (action === 'apply') {
                var rep = apply(comp, sel, { name: name, tint: cTint.value, time: cTime.value });
                var msg = 'Field Effector: ' + rep.targets + ' layers follow "' + name + ' Effector" (' + rep.fields +
                    ' field' + (rep.fields === 1 ? '' : 's') + ').\n' +
                    (rep.newField ? 'Key "' + name + ' Field 1" to move the field; its effects set its shape and falloff.\n' : '') +
                    'The sliders on "' + name + ' Effector" set what the field does.';
                if (rep.kept.length) msg += '\n\nKept your own expressions on: ' + rep.kept.join(', ');
                if (rep.skipped.length) msg += '\n\nSkipped: ' + rep.skipped.join('; ');
                if (rep.warnings.length) msg += '\n\n' + rep.warnings.join('\n');
                alert(msg);
            } else if (action === 'field') {
                var F = addAnotherField(comp, name);
                alert('Field Effector: added "' + F.name + '". Its Blend mode combines it with the fields above it.');
            } else {
                var n = remove(comp, sel, name);
                alert('Field Effector: removed from ' + n + ' layer' + (n === 1 ? '' : 's') + '.');
            }
        } catch (e) {
            alert('Field Effector: ' + e.toString() + (e.line ? ' (line ' + e.line + ')' : ''));
        } finally {
            app.endUndoGroup();
        }
    }

    return {
        apply: apply, addField: addAnotherField, remove: remove, refresh: refresh, targets: targets,
        run: run, expr: EXPR, channels: CHANNELS, field: FIELD, defaults: DEFAULTS,
        math: FX_MATH, glue: FX_GLUE
    };
})();

if (!$.global.FX_NO_UI) FieldEffector.run();
