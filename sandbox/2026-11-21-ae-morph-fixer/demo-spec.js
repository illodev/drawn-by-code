// demo-spec.js - the morph that make-demo.jsx builds in After Effects and scene.js previews,
// in one place so they can't drift apart. Plain ES3.
//
// Five shapes, each drawn the way a designer might, i.e. with nothing in common: a circle
// (4 points, clockwise, from the top), a star (10, counter-clockwise, from its lower-left
// tip), a rounded square (8, clockwise, from partway down a side), a heart (6,
// counter-clockwise, from its tip) and the circle again from its left. Each is held 0.6 s
// and morphs into the next over 1.2 s with Easy Ease. Coordinates are around the shape's
// centre, y down; colours 0-255.
var MD = (function () {
    var K = 0.5522847498;

    function path(v, i, o) {
        return { v: v, i: i, o: o, closed: true };
    }

    function circle(R, start) {
        var k = R * K;
        var v = [[0, -R], [R, 0], [0, R], [-R, 0]];
        var i = [[-k, 0], [0, -k], [k, 0], [0, k]];
        var o = [[k, 0], [0, k], [-k, 0], [0, -k]];
        return rot(path(v, i, o), start);
    }

    function star(R, r, firstDeg) {
        var v = [], i = [], o = [];
        for (var k = 0; k < 10; k++) {
            var a = (firstDeg - 36 * k) * Math.PI / 180, rr = k % 2 ? r : R;    // decreasing angle: counter-clockwise
            v.push([Math.round(rr * Math.cos(a) * 1000) / 1000, Math.round(rr * Math.sin(a) * 1000) / 1000]);
            i.push([0, 0]);
            o.push([0, 0]);
        }
        return path(v, i, o);
    }

    function roundedSquare(h, c, start) {
        var k = c * K;
        var v = [[-h + c, -h], [h - c, -h], [h, -h + c], [h, h - c], [h - c, h], [-h + c, h], [-h, h - c], [-h, -h + c]];
        var i = [[-k, 0], [0, 0], [0, -k], [0, 0], [k, 0], [0, 0], [0, k], [0, 0]];
        var o = [[0, 0], [k, 0], [0, 0], [0, k], [0, 0], [-k, 0], [0, 0], [0, -k]];
        return rot(path(v, i, o), start);
    }

    function heartCcw() {
        // drawn clockwise from the tip, then reversed (keeping the tip as the start)
        var v = [[0, 175], [-175, -40], [-90, -150], [0, -80], [90, -150], [175, -40]];
        var i = [[55, -70], [0, 70], [-55, 0], [-15, -40], [-45, 0], [0, -70]];
        var o = [[-55, -70], [0, -70], [45, 0], [15, -40], [55, 0], [0, 70]];
        var n = v.length, R = { v: [], i: [], o: [], closed: true };
        for (var k = 0; k < n; k++) {
            var s = (n - k) % n;
            R.v.push(v[s]);
            R.i.push(o[s]);
            R.o.push(i[s]);
        }
        return R;
    }

    function rot(P, s) {
        var n = P.v.length, R = { v: [], i: [], o: [], closed: P.closed };
        for (var k = 0; k < n; k++) {
            R.v.push(P.v[(s + k) % n]);
            R.i.push(P.i[(s + k) % n]);
            R.o.push(P.o[(s + k) % n]);
        }
        return R;
    }

    var shapes = [circle(170, 0), star(205, 86, 126), roundedSquare(160, 62, 3), heartCcw(), circle(170, 3)];
    var hold = 0.6, morph = 1.2, keys = [];
    for (var s = 0; s < shapes.length; s++) {
        keys.push([s * (hold + morph), s]);
        keys.push([s * (hold + morph) + hold, s]);
    }
    return {
        fps: 24, duration: 8, size: [1920, 1080],
        before: [520, 590], after: [1400, 590], labelY: 170, minPoints: 0,
        shapes: shapes, keys: keys,                       // keys: [time, shape index], Easy Ease
        colors: { bg: [239, 233, 223], shape: [34, 48, 74], marker: [255, 107, 41], label: [34, 48, 74] }
    };
})();
