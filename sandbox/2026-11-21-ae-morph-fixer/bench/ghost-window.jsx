// ghost-window.jsx - reproduces a window Windows strands on screen (round 5's stuck progress
// window). Send it alone to a running AE (AfterFX.exe -r ghost-window.jsx) with
// window-watch.ps1 running beside it, then click AE's window twice while it is busy.
//
// It opens a palette titled "ghost test", keeps AE busy for 12 s updating a progress bar, and
// closes it. Once AE answers, it tries three more times on the same window by reference:
// close() at 1.5 s, hide() at 4 s, show() + close() at 6.5 s. Each step goes to
// out/ae/ghost-log.txt; the watcher logs what Windows really shows.
//
// AE 27 on Windows 11: without clicks, the window is gone at the first close(). With two
// clicks while busy, it stayed visible through all four tries (watched for 45 s) and only an
// AE restart cleared it. Restart AE after a stuck run (nothing else is open in a test AE).
(function () {
    var out = File($.fileName).parent.parent.fsName.replace(/\\/g, '/') + '/out/ae';
    new Folder(out).create();
    $.global.MMF_GLOG = function (s) {
        var f = new File(out + '/ghost-log.txt');
        f.open('a');
        f.write(new Date().getTime() + ' ' + s + '\n');
        f.close();
    };
    function busy(ms) {
        var t0 = new Date().getTime(), x = 0;
        while (new Date().getTime() - t0 < ms) x += Math.sqrt(x + 1);
        return x;
    }
    var w = new Window('palette', 'ghost test', undefined, { closeButton: false });
    w.add('statictext', undefined, 'ghost test: AE is busy for 12 s');
    var bar = w.add('progressbar', undefined, 0, 100);
    bar.preferredSize = [260, 8];
    w.center();
    w.show();
    w.update();
    $.global.MMF_GLOG('started');
    for (var i = 0; i < 24; i++) {
        busy(500);
        bar.value = i * 4;
        w.update();
    }
    w.close();
    $.global.MMF_GHOST = w;
    $.global.MMF_GLOG('closed in the script, visible ' + w.visible);
    app.scheduleTask("(function () { var w = $.global.MMF_GHOST; w.close(); $.global.MMF_GLOG('task 1: close() again, visible ' + w.visible); })()", 1500, false);
    app.scheduleTask("(function () { var w = $.global.MMF_GHOST; w.hide(); $.global.MMF_GLOG('task 2: hide(), visible ' + w.visible); })()", 4000, false);
    app.scheduleTask("(function () { var w = $.global.MMF_GHOST; w.show(); w.close(); $.global.MMF_GLOG('task 3: show() + close(), visible ' + w.visible); })()", 6500, false);
})();
