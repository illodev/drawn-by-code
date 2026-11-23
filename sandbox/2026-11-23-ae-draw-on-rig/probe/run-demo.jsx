// run-demo.jsx - a bridge job: the AE test (make-demo.jsx in test mode), results in out/ae/.
(function () {
    var B = $.global.MMF_BRIDGE;
    if (!B.freshProject()) {
        var f = new File(B.root + '/out/ae/refused.txt');
        f.open('w');
        f.write('the open project is not ours: not touched\n');
        f.close();
        return;
    }
    $.global.DRAWON_TEST_OUT = B.root + '/out/ae';
    $.global.DRAWON_DIR = B.root;
    try {
        $.evalFile(new File(B.root + '/make-demo.jsx'));
    } finally {
        $.global.DRAWON_TEST_OUT = null;
        $.global.DRAWON_DIR = null;
    }
})();
