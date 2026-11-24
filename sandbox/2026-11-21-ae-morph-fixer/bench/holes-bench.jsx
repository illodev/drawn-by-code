// holes-bench.jsx - what keeping holes inside costs in After Effects, apart from the fix: for
// each real-type case (out/art/cases.js, written by art/test-art.mjs), the pieces matched and
// each piece fixed (timed), then MF.holeTiming on the fixed keys (timed apart). Turned cases
// are left out (the panel skips their turning steps). Writes out/ae/holes-bench.md.
// Needs the test build (node build.mjs) and $.global.MORPH_DIR; run through ae-bridge.jsx.
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
    $.global.MORPH_NO_UI = true;
    $.evalFile(new File(here + '/out/test-build/Mask Morph Fixer.jsx'));
    $.global.MORPH_NO_UI = false;
    var MF = $.global.MorphFixerMath;
    eval(readText(here + '/out/art/cases.js'));      // var ART = [...]
    var rows = ['| Case | Fix (s) | Holes (s) | Holes kept inside |', '|---|---|---|---|'], c, p;
    for (c = 0; c < ART.length; c++) {
        var C = ART[c];
        if (C.rotate) continue;
        var t0 = new Date().getTime(), res = MF.matchPieces(C.keys), fixed = [];
        for (p = 0; p < C.keys[0].length; p++) {
            var col = [];
            for (var k = 0; k < C.keys.length; k++) col.push(res.keys[k][p]);
            fixed.push(MF.fix(col, { mode: C.mode, maxPoints: C.max }).paths);
        }
        var t1 = new Date().getTime(), T = MF.holeTiming(fixed, res.roles), t2 = new Date().getTime();
        rows.push('| ' + C.name + ' | ' + ((t1 - t0) / 1000).toFixed(1) + ' | ' + ((t2 - t1) / 1000).toFixed(2) + ' | ' + T.length + ' |');
        var f = new File(here + '/out/ae/holes-bench.md');
        f.encoding = 'UTF-8';
        f.open('w');
        f.write(rows.join('\n') + '\n');
        f.close();
    }
})();
