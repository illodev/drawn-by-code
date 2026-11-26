// warp-bench.jsx - what pairing outlines by what they are (the warp) costs in After Effects:
// for each real-type case (out/art/cases.js, written by art/test-art.mjs), the pieces matched
// and every piece fixed twice, warp off and on (timed), with how many steps were warped and
// the warp step alone timed on the first two keys of the first piece. Turned cases are left
// out. Writes out/ae/warp-bench.md as it goes (a long run still leaves its rows).
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
    var rows = ['| Case | Keys | Pieces | Even (s) | Warp (s) | Steps warped | One warp step (s) |', '|---|---|---|---|---|---|---|'], c, p, k;
    for (c = 0; c < ART.length; c++) {
        var C = ART[c];
        if (C.rotate || C.mode === 'exact') continue;
        var res = MF.matchPieces(C.keys), cols = [], steps = 0, warped = 0;
        for (p = 0; p < C.keys[0].length; p++) {
            var col = [];
            for (k = 0; k < C.keys.length; k++) col.push(res.keys[k][p]);
            cols.push(col);
        }
        var t0 = new Date().getTime();
        for (p = 0; p < cols.length; p++) MF.fix(cols[p], { mode: C.mode, maxPoints: C.max, warp: false });
        var t1 = new Date().getTime();
        for (p = 0; p < cols.length; p++) {
            var r = MF.fix(cols[p], { mode: C.mode, maxPoints: C.max, warp: true });
            for (k = 1; k < r.keys.length; k++) {
                steps++;
                if (r.keys[k].warped) warped++;
            }
        }
        var t2 = new Date().getTime(), one = '';
        var al = MF.fix(cols[0], { mode: C.mode, maxPoints: C.max, warp: false });
        if (al.paths[0].closed && al.paths.length > 1) {
            var t3 = new Date().getTime();
            MF.warpStep(al.paths[0], al.paths[1]);
            one = ((new Date().getTime() - t3) / 1000).toFixed(2);
        }
        rows.push('| ' + C.name + ' | ' + C.keys.length + ' | ' + cols.length + ' | ' + ((t1 - t0) / 1000).toFixed(1) + ' | ' + ((t2 - t1) / 1000).toFixed(1) + ' | ' + warped + ' of ' + steps + ' | ' + one + ' |');
        var f = new File(here + '/out/ae/warp-bench.md');
        f.encoding = 'UTF-8';
        f.open('w');
        f.write(rows.join('\n') + '\n');
        f.close();
    }
})();
