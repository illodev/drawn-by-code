// 2026-11-21-ae-morph-fixer · preview of the "After" half of the demo make-demo.jsx builds.
//
// The demo's keys (demo-spec.js), fixed by morph-math.js (the code MorphFixer.jsx carries),
// drawn the way After Effects interpolates a path whose keys share their points: every
// vertex and tangent in a straight line, the time eased (Easy Ease = smoothstep). make-demo
// checks inside AE that it really does. The orange dot rides the first point. The "Before"
// half is After Effects' own business (how it morphs keys that don't match is what the rig
// avoids), so it only exists in AE's render. A diagnostic, not a styled piece.
const DIR = 'sandbox/2026-11-21-ae-morph-fixer/';

const smooth = (u) => u * u * (3 - 2 * u);
const rgb = (c) => `rgb(${c.join(',')})`;

function pathAt(fixed, times, t) {
    if (t <= times[0]) return fixed[0];
    for (let k = 1; k < times.length; k++) {
        if (t < times[k]) return MF.lerp(fixed[k - 1], fixed[k], smooth((t - times[k - 1]) / (times[k] - times[k - 1])));
    }
    return fixed[fixed.length - 1];
}

function trace(g, P, ox, oy) {
    const n = P.v.length;
    g.beginPath();
    g.moveTo(ox + P.v[0][0], oy + P.v[0][1]);
    for (let k = 0; k < (P.closed ? n : n - 1); k++) {
        const c = MF.seg(P, k);
        g.bezierCurveTo(ox + c[2], oy + c[3], ox + c[4], oy + c[5], ox + c[6], oy + c[7]);
    }
    if (P.closed) g.closePath();
}

Motion.scene({
    fps: 24, duration: 8,
    logical: [1920, 1080],
    uses: [DIR + 'morph-math.js', DIR + 'demo-spec.js'],
    shots: [[0, 8, 'After (fixed)']],
    setup() {
        const keys = MD.keys.map(([, s]) => MD.shapes[s]);
        return { fixed: MF.fix(keys, { minPoints: MD.minPoints }).paths, times: MD.keys.map((k) => k[0]) };
    },
    draw(g, t, env) {
        const { fixed, times } = env.state, C = MD.colors, [ox, oy] = MD.after;
        g.fillStyle = rgb(C.bg);
        g.fillRect(0, 0, env.W, env.H);
        const P = pathAt(fixed, times, t);
        trace(g, P, ox, oy);
        g.fillStyle = rgb(C.shape);
        g.fill();
        g.beginPath();
        g.arc(ox + P.v[0][0], oy + P.v[0][1], 12, 0, Math.PI * 2);
        g.fillStyle = rgb(C.marker);
        g.fill();
        g.font = 'bold 46px Arial, sans-serif';
        g.textAlign = 'center';
        g.fillStyle = rgb(C.label);
        g.fillText('Before', MD.before[0], MD.labelY);
        g.fillText('After', MD.after[0], MD.labelY);
    },
});
