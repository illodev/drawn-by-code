// warp-parts.jsx - where the warp's time goes inside After Effects (ExtendScript runs some code
// far slower than Node, relative to the rest: the first warp made the demo's fixes 6 to 18
// times slower in AE, 4 to 5 times in Node). For a few two-key steps (from the demo's shapes and
// letters), the fix with and without the warp, then each part of one warp step on the keys the
// even fix aligned. Writes out/ae/warp-parts.md as it goes. Reads morph-math.js itself, with its
// internals exposed; run through ae-bridge.jsx with $.global.MORPH_DIR set.
(function () {
    var here = $.global.MORPH_DIR || File($.fileName).parent.parent.fsName;
    function readText(p) {
        var f = new File(p);
        f.encoding = 'UTF-8';
        f.open('r');
        var s = f.read();
        f.close();
        return s;
    }
    var src = readText(here + '/morph-math.js').replace(/return \{(\r?\n\s*)fix: fix,/, 'return { _w: { warpSamples: warpSamples, warpDTW: warpDTW, warpStraighten: warpStraighten, warpCheck: warpCheck, keepsAxes: keepsAxes, sharedAxes: sharedAxes, samples: samples, finalCrosses: finalCrosses, finalKeepsAxes: finalKeepsAxes, neckOf: neckOf, circDist: circDist, warpPoints: warpPoints, mirrorAxes: mirrorAxes, poleAt: poleAt, sized: sized },$1fix: fix,');
    eval(src);
    var MFX = MF, W = MF._w;
    eval(readText(here + '/demo-spec.js'));        // var MD
    eval(readText(here + '/demo-letters.js'));     // var ML
    var rows = ['| Step | Fix even (ms) | Fix warped (ms) | Warp step (ms) | Samples | Coarse DTW | Fine DTW | Straighten | Check | Axes | Final crosses | Final axes |', '|---|---|---|---|---|---|---|---|---|---|---|---|'];
    function write() {
        var f = new File(here + '/out/ae/warp-parts.md');
        f.encoding = 'UTF-8';
        f.open('w');
        f.write(rows.join('\n') + '\n');
        f.close();
    }
    function ms(fn) {
        var t0 = new Date().getTime();
        fn();
        return new Date().getTime() - t0;
    }
    var letters = MFX.matchPieces([ML.shapes[0], ML.shapes[1]]), letters2 = MFX.matchPieces([ML.shapes[2], ML.shapes[3]]);
    var cases = [
        ['q into g (outline)', [letters.keys[0][0], letters.keys[1][0]]],
        ['b into c (outline)', [letters2.keys[0][0], letters2.keys[1][0]]],
        ['star into the star turned (symmetry demo)', [MD.sym.shapes[MD.sym.keys[0][1]], MD.sym.shapes[MD.sym.keys[2][1]]]],
        ['circle into star (morph demo)', [MD.shapes[MD.keys[0][1]], MD.shapes[MD.keys[2][1]]]]
    ];
    for (var c = 0; c < cases.length; c++) {
        var keys = cases[c][1], cells = [cases[c][0]];
        try {
            var even, warped;
            cells.push(ms(function () { even = MFX.fix(keys, { maxPoints: 100, warp: false }); }));
            cells.push(ms(function () { warped = MFX.fix(keys, { maxPoints: 100, warp: true }); }) + (warped.keys[1].warped ? ' (warped)' : ' (not warped)'));
            var A = even.paths[0], B = even.paths[1], MA = MFX.measure(A), MB = MFX.measure(B);
            cells.push(ms(function () { MFX.warpStep(A, B); }));
            var cA, cB, fA, fB;
            cells.push(ms(function () { cA = W.warpSamples(A, MA, 24); cB = W.warpSamples(B, MB, 24); fA = W.warpSamples(A, MA, 80); fB = W.warpSamples(B, MB, 80); }));
            var near = [], j;
            for (j = 0; j < cB.f.length; j++) if (W.circDist(cB.f[j], 0) <= 0.15) near.push(j);
            var coarse;
            cells.push(ms(function () { coarse = W.warpDTW(cA, cB, near, true, null, 5); }));
            var bestI = 0;
            for (j = 1; j < near.length; j++) if (coarse.costs[j] < coarse.costs[bestI]) bestI = j;
            var shifts = [], f0 = cB.f[near[bestI]];
            for (j = 0; j < fB.f.length; j++) if (W.circDist(fB.f[j], f0) <= 0.5 / 24 + 1e-9) shifts.push(j);
            var fine;
            cells.push(ms(function () { fine = W.warpDTW(fA, fB, shifts, false, { path: coarse.all[bestI].path, r: 2 / 24 }).best; }));
            var pairs;
            cells.push(ms(function () { pairs = W.warpStraighten(fine.path, 4 / 80); }));
            var thr = 0.5 * Math.min(W.neckOf(W.samples(A, MA, 64).pts), W.neckOf(W.samples(B, MB, 64).pts));
            cells.push(ms(function () { W.warpCheck(A, MA, B, MB, pairs, thr); }));
            var axes;
            cells.push(ms(function () { axes = W.sharedAxes(W.samples(A, MA), W.samples(B, MB)); if (axes.length) W.keepsAxes(A, MA, B, MB, pairs, axes); }) + (axes.length ? '' : ' (none shared)'));
            var P = warped.paths;
            cells.push(ms(function () { W.finalCrosses(P[0], P[1]); }));
            cells.push(ms(function () { W.finalKeepsAxes(P[0], P[1]); }));
        } catch (e) {
            cells.push('error: ' + e.message + ' (line ' + e.line + ')');
        }
        rows.push('| ' + cells.join(' | ') + ' |');
        write();
    }
})();
