// ae-bridge.jsx - a test runner that lives inside After Effects for the session, so tests
// don't each need `AfterFX.exe -r` (AE refuses a second -r while it thinks a script runs, with
// a modal dialog, and sometimes keeps thinking so).
//
// Send it once to an open AE: AfterFX.exe -r ae-bridge.jsx. Every second it looks in
// out/ae/bridge/inbox for *.jsx files, oldest name first, moves each to out/ae/bridge/done and
// runs it there; done/<name>.status.txt then says "ok" or "error: ...". Jobs never raise
// dialogs: errors are caught and written to the status. It installs nothing; it stops when
// AE quits, with $.global.MMF_BRIDGE.stop() (drop that as a job), or by itself after five
// minutes without a job.
//
// Stop it before anyone clicks around in AE: its timer fires during a modal dialog
// (Preferences, a script's own dialog) and AE then shows "Cannot run a script while a modal
// dialog is waiting for response", and can stay convinced a script is running, refusing every
// script after it ("second script"), until it restarts. A theme change also drops the timer.
//
// Jobs call MMF_BRIDGE.freshProject() before building anything. It only ever closes an empty
// untitled project or a test's own (saved under this experiment's out/), without saving, and
// refuses anything else (someone's work): tests save their projects into out/ for this.
(function () {
    var here = File($.fileName).parent.fsName.replace(/\\/g, '/');
    var DIR = here + '/out/ae/bridge';
    new Folder(DIR + '/inbox').create();
    new Folder(DIR + '/done').create();

    function safe(e) {
        try {
            return String(e.message) + (e.line ? ' (line ' + e.line + ')' : '');
        } catch (x) {
            return 'unprintable error';
        }
    }
    function write(path, text) {
        try {
            var f = new File(path);
            f.encoding = 'UTF-8';
            f.open('w');
            f.write(text);
            f.close();
        } catch (x) {}
    }

    var B = $.global.MMF_BRIDGE;
    if (B && B.task) {
        try {
            app.cancelTask(B.task);
        } catch (x0) {}
    }
    B = $.global.MMF_BRIDGE = {
        dir: DIR,
        root: here,
        busy: false,
        last: new Date().getTime(),         // the last job (or the start): idle 5 min = stop
        idleMs: 5 * 60 * 1000,
        ran: 0,
        freshProject: function () {
            var p = app.project;
            if (p) {
                var ours = p.file ? p.file.fsName.replace(/\\/g, '/').indexOf(here + '/out/') === 0 : p.numItems === 0;
                if (!ours) return false;
                p.close(CloseOptions.DO_NOT_SAVE_CHANGES);
            }
            app.newProject();
            return true;
        },
        tick: function () {
            if (B.busy) return;
            if (new Date().getTime() - B.last > B.idleMs) {
                B.stop();
                write(DIR + '/stopped.txt', 'stopped after ' + Math.round(B.idleMs / 60000) + ' idle minutes, ' + B.ran + ' jobs run\n');
                return;
            }
            B.busy = true;
            try {
                var jobs = new Folder(DIR + '/inbox').getFiles('*.jsx');
                jobs.sort(function (a, b) {
                    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
                });
                for (var i = 0; i < jobs.length; i++) {
                    var name = File.decode(jobs[i].name), moved = new File(DIR + '/done/' + name);
                    if (moved.exists) moved.remove();
                    jobs[i].copy(moved.fsName);
                    jobs[i].remove();
                    var status = 'ok';
                    try {
                        $.evalFile(moved);
                    } catch (e) {
                        status = 'error: ' + safe(e);
                    }
                    B.ran++;
                    B.last = new Date().getTime();
                    write(DIR + '/done/' + name.replace(/\.jsx$/, '') + '.status.txt', status + '\n');
                }
            } catch (e2) {
                write(DIR + '/bridge-error.txt', safe(e2) + '\n');
            }
            B.busy = false;
        },
        stop: function () {
            try {
                app.cancelTask(B.task);
            } catch (x1) {}
        }
    };
    B.task = app.scheduleTask('$.global.MMF_BRIDGE.tick()', 1000, true);
    write(DIR + '/ready.txt', 'bridge task ' + B.task + ' in After Effects ' + app.version + '\n');
})();
