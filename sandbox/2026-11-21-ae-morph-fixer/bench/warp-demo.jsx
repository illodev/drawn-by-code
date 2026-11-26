// warp-demo.jsx - the demo's three fixed path sets (the morph, the symmetry chain, the letters'
// two pieces), each fixed once without the warp and once with it, timed inside After Effects:
// what the warp costs on real jobs. Reads morph-math.js itself (the code as it stands, no build
// needed). Writes out/ae/warp-demo.md as it goes; run through ae-bridge.jsx with
// $.global.MORPH_DIR set.
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
    eval(readText(here + '/morph-math.js'));      // var MF
    eval(readText(here + '/demo-spec.js'));       // var MD
    eval(readText(here + '/demo-letters.js'));    // var ML
    var rows = ['| Path set | Keys | Without the warp (s) | With it (s) | Steps warped | Points (without / with) |', '|---|---|---|---|---|---|'];
    function write() {
        var f = new File(here + '/out/ae/warp-demo.md');
        f.encoding = 'UTF-8';
        f.open('w');
        f.write(rows.join('\n') + '\n');
        f.close();
    }
    function keysOf(spec) {
        var out = [];
        for (var k = 0; k < spec.keys.length; k++) out.push(spec.shapes[spec.keys[k][1]]);
        return out;
    }
    var sets = [['Morph', [keysOf(MD)], MD.maxPoints], ['Symmetry', [keysOf(MD.sym)], MD.maxPoints]];
    var dealt = MF.matchPieces(keysOf(ML)), pieces = [];
    for (var p = 0; p < dealt.keys[0].length; p++) {
        var col = [];
        for (var k = 0; k < dealt.keys.length; k++) col.push(dealt.keys[k][p]);
        pieces.push(col);
    }
    sets.push(['Letters (' + pieces.length + ' pieces)', pieces, ML.maxPoints]);
    for (var s = 0; s < sets.length; s++) {
        var name = sets[s][0], cols = sets[s][1], max = sets[s][2], cells = [name, cols[0].length];
        try {
            var t0 = new Date().getTime(), ptsA = [], ptsB = [], warped = 0, steps = 0, q, r;
            for (q = 0; q < cols.length; q++) ptsA.push(MF.fix(cols[q], { maxPoints: max, warp: false }).paths[0].v.length);
            var t1 = new Date().getTime();
            for (q = 0; q < cols.length; q++) {
                r = MF.fix(cols[q], { maxPoints: max, warp: true });
                ptsB.push(r.paths[0].v.length);
                for (k = 1; k < r.keys.length; k++) {
                    steps++;
                    if (r.keys[k].warped) warped++;
                }
            }
            var t2 = new Date().getTime();
            cells.push(((t1 - t0) / 1000).toFixed(1), ((t2 - t1) / 1000).toFixed(1), warped + ' of ' + steps, ptsA.join('+') + ' / ' + ptsB.join('+'));
        } catch (e) {
            cells.push('error: ' + e.message + ' (line ' + e.line + ')');
        }
        rows.push('| ' + cells.join(' | ') + ' |');
        write();
    }
})();
