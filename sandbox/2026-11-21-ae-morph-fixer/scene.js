// 2026-11-21-ae-morph-fixer · preview of the "After" halves of the demo make-demo.jsx builds.
//
// The demo's keys (demo-spec.js), fixed by morph-math.js (the code "Mask Morph Fixer.jsx" carries),
// drawn the way After Effects interpolates them: every vertex and tangent of the path in a
// straight line, the time eased (Easy Ease = smoothstep); make-demo checks inside AE that it
// really does. Two parts, like AE's "Mask Morph Fixer demo" comp:
//   0-8 s     Morph demo: five shapes drawn with nothing in common
//   8-14.5 s  Turn demo: an F turned a quarter at a time, fixed with turn on: the turn is
//             written into the path, one key a frame, each the F swung about the step's fixed
//             point (MF.swing); no transform is keyed
// The orange dot rides the first point. The "Before" halves are After Effects' own business
// (how it blends keys that don't match is what the rig avoids), so they only exist in AE's
// render. A diagnostic, not a styled piece.
const DIR = 'sandbox/2026-11-21-ae-morph-fixer/';

const smooth = (u) => u * u * (3 - 2 * u);
const rgb = (c) => `rgb(${c.join(',')})`;

// the step and eased progress at time t over keys [[time, ...], ...]
function stepAt(keys, t) {
    if (t <= keys[0][0]) return { k: 0, u: 0 };
    for (let k = 1; k < keys.length; k++) if (t < keys[k][0]) return { k: k - 1, u: smooth((t - keys[k - 1][0]) / (keys[k][0] - keys[k - 1][0])) };
    return { k: keys.length - 2, u: 1 };
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
    fps: 24, duration: 14.5,
    logical: [1920, 1080],
    uses: [DIR + 'morph-math.js', DIR + 'demo-spec.js'],
    shots: [[0, 8, 'Morph (After)'], [8, 14.5, 'Turn (After)']],
    setup() {
        const keys = MD.keys.map(([, s]) => MD.shapes[s]);
        const turnKeys = MD.turn.keys.map(([, s]) => MD.turn.shapes[s]);
        return {
            morph: MF.fix(keys, { maxPoints: MD.maxPoints }).paths,
            turn: MF.fix(turnKeys, { maxPoints: MD.maxPoints, rotate: true }),
        };
    },
    draw(g, t, env) {
        const C = MD.colors, [ox, oy] = MD.after;
        g.fillStyle = rgb(C.bg);
        g.fillRect(0, 0, env.W, env.H);
        let P;
        if (t < MD.duration) {
            const s = stepAt(MD.keys, t);
            P = MF.lerp(env.state.morph[s.k], env.state.morph[s.k + 1], s.u);
        } else {
            const s = stepAt(MD.turn.keys, t - MD.duration);
            P = MF.swing(env.state.turn.turn, env.state.turn.paths, s.k, s.u);     // what the in-between keys hold
        }
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
