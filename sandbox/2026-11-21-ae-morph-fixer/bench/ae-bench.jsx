// ae-bench.jsx - how long MF.fix takes inside After Effects for jobs of known size (keys,
// drawn points, mode, turn), to fit the panel's time estimate. Run through ae-bridge.jsx;
// writes out/ae/bench.csv. Same blobs as bench.mjs (Node), same seed.
(function () {
    var root = $.global.MMF_BRIDGE ? $.global.MMF_BRIDGE.root : File($.fileName).parent.parent.fsName;
    $.global.MORPH_NO_UI = true;
    $.evalFile(new File(root + '/out/test-build/Mask Morph Fixer.jsx'));
    $.global.MORPH_NO_UI = false;
    var MF = $.global.MorphFixerMath;
    var seed = 7;
    function rnd() {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
    }
    function blob(n, phase) {
        var v = [], ii = [], o = [];
        for (var k = 0; k < n; k++) {
            var a = phase + (k / n) * Math.PI * 2, r = 150 * (1 + 0.25 * Math.sin(3 * a + phase) + 0.1 * (rnd() - 0.5));
            var x = r * Math.cos(a), y = r * Math.sin(a), h = (Math.PI * 2 * r) / n / 3;
            v.push([x, y]);
            ii.push([h * Math.sin(a), -h * Math.cos(a)]);
            o.push([-h * Math.sin(a), h * Math.cos(a)]);
        }
        return { v: v, i: ii, o: o, closed: true };
    }
    var lines = ['mode,turn,K,n,N,out,capped,fellBack,ms'], modes = ['smooth', 'exact'], Ks = [2, 8], ns = [4, 16, 60, 200];
    for (var m = 0; m < modes.length; m++) for (var t = 0; t < 2; t++) for (var a = 0; a < Ks.length; a++) for (var b = 0; b < ns.length; b++) {
        var paths = [], N = 0;
        for (var k = 0; k < Ks[a]; k++) {
            var P = blob(Math.max(4, Math.round(ns[b] * (0.6 + 0.8 * rnd()))), rnd() * 6);
            N += P.v.length;
            paths.push(P);
        }
        $.hiresTimer;
        var r = MF.fix(paths, { mode: modes[m], rotate: t === 1, maxPoints: 100 });
        var ms = $.hiresTimer / 1000;
        lines.push([modes[m], t, Ks[a], ns[b], N, r.paths[0].v.length, r.capped ? 1 : 0, r.fellBack ? 1 : 0, Math.round(ms)].join(','));
        var f = new File(root + '/out/ae/bench.csv');
        f.open('w');
        f.write(lines.join('\n') + '\n');
        f.close();
    }
})();
