// 2026-11-21-ae-morph-fixer · preview of the "After" halves of the demo make-demo.jsx builds.
//
// The demo's keys (demo-spec.js, demo-letters.js), fixed by morph-math.js (the code "Mask Morph
// Fixer.jsx" carries), drawn the way After Effects interpolates them: every vertex and tangent
// of the path in a straight line, the time eased (Easy Ease = smoothstep); make-demo checks
// inside AE that it really does. Four parts, like AE's "Mask Morph Fixer demo" comp:
//   0-8 s       Morph demo: five shapes drawn with nothing in common
//   8-14.5 s    Turn demo: an F turned a quarter at a time, fixed with turn on: the turn is
//               written into the path, one key a frame, each the F swung about the step's fixed
//               point (MF.swing); no transform is keyed
//   14.5-23 s   Symmetry demo: a star, the star turned 36 deg, a plus, an x, the star, all
//               sharing the upright axis, each drawn anew: every step mirror-symmetric (AE's
//               left half: the same fix without its symmetry rule, which swirls two steps)
//   23-31.5 s   Letters demo: a, e, b, c, d in Comic Neue Bold, pieces matched between keys,
//               max 200, each hole kept inside its letter: a into e, a start chosen against a
//               crossover; e into b, the hole shrinks where it would stray; b into c, it closes
//               before the c opens; c into d, it opens once the d is shut
// The orange dot rides the first point (not on the letters). The "Before" halves are After Effects' own business
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

// P's outline as a subpath of the current path (more pieces: one fill, holes by their direction)
function trace(g, P, ox, oy, keep) {
    const n = P.v.length;
    if (!keep) g.beginPath();
    g.moveTo(ox + P.v[0][0], oy + P.v[0][1]);
    for (let k = 0; k < (P.closed ? n : n - 1); k++) {
        const c = MF.seg(P, k);
        g.bezierCurveTo(ox + c[2], oy + c[3], ox + c[4], oy + c[5], ox + c[6], oy + c[7]);
    }
    if (P.closed) g.closePath();
}

// where each part starts: morph, turn, symmetry, letters (the specs load after this file runs:
// setup checks these against them)
const T_TURN = 8, T_SYM = 14.5, T_LET = 23, T_END = 31.5;

Motion.scene({
    fps: 24, duration: T_END,
    logical: [1920, 1080],
    uses: [DIR + 'morph-math.js', DIR + 'demo-spec.js', DIR + 'demo-letters.js'],
    shots: [[0, T_TURN, 'Morph (After)'], [T_TURN, T_SYM, 'Turn (After)'], [T_SYM, T_LET, 'Symmetry (Symmetric)'], [T_LET, T_END, 'Letters (After)']],
    setup() {
        const ends = [MD.duration, MD.duration + MD.turn.duration, MD.duration + MD.turn.duration + MD.sym.duration];
        ends.push(ends[2] + ML.duration);
        if ([T_TURN, T_SYM, T_LET, T_END].some((t, i) => Math.abs(t - ends[i]) > 1e-6)) throw new Error('scene.js part times differ from the specs: ' + ends.join(', '));
        const keys = MD.keys.map(([, s]) => MD.shapes[s]);
        const turnKeys = MD.turn.keys.map(([, s]) => MD.turn.shapes[s]);
        const symKeys = MD.sym.keys.map(([, s]) => MD.sym.shapes[s]);
        // letters: pieces matched between keys, each piece's path fixed, the holes kept inside
        // (what the panel bakes into in-between keys, at AE's eased progress: here the same u)
        const rows = ML.keys.map(([, s]) => ML.shapes[s]), dealt = MF.matchPieces(rows);
        const letters = rows[0].map((_, p) => MF.fix(dealt.keys.map((row) => row[p]), { maxPoints: ML.maxPoints }).paths);
        const holes = MF.holeTiming(letters, dealt.roles);
        return {
            morph: MF.fix(keys, { maxPoints: MD.maxPoints }).paths,
            turn: MF.fix(turnKeys, { maxPoints: MD.maxPoints, rotate: true }),
            sym: MF.fix(symKeys, { maxPoints: MD.maxPoints }).paths,
            letters, holes,
        };
    },
    draw(g, t, env) {
        const C = MD.colors, [ox, oy] = MD.after, S = env.state;
        g.fillStyle = rgb(C.bg);
        g.fillRect(0, 0, env.W, env.H);
        let pieces, labels = ['Before', 'After'];
        if (t < T_TURN) {
            const s = stepAt(MD.keys, t);
            pieces = [MF.lerp(S.morph[s.k], S.morph[s.k + 1], s.u)];
        } else if (t < T_SYM) {
            const s = stepAt(MD.turn.keys, t - T_TURN);
            pieces = [MF.swing(S.turn.turn, S.turn.paths, s.k, s.u)];     // what the in-between keys hold
        } else if (t < T_LET) {
            const s = stepAt(MD.sym.keys, t - T_SYM);
            pieces = [MF.lerp(S.sym[s.k], S.sym[s.k + 1], s.u)];
            labels = ['Least travel', 'Symmetric'];
        } else {
            const s = stepAt(ML.keys, t - T_LET);
            pieces = S.letters.map((L, p) => {
                const h = S.holes.find((e) => e.piece === p && e.step === s.k);
                return h ? MF.holeAt(h, L[s.k], L[s.k + 1], s.u) : MF.lerp(L[s.k], L[s.k + 1], s.u);
            });
        }
        g.beginPath();
        for (const P of pieces) trace(g, P, ox, oy, true);
        g.fillStyle = rgb(C.shape);
        g.fill();
        if (t < T_LET) {
            const P = pieces[0];
            g.beginPath();
            g.arc(ox + P.v[0][0], oy + P.v[0][1], 12, 0, Math.PI * 2);
            g.fillStyle = rgb(C.marker);
            g.fill();
        }
        g.font = 'bold 46px Arial, sans-serif';
        g.textAlign = 'center';
        g.fillStyle = rgb(C.label);
        g.fillText(labels[0], MD.before[0], MD.labelY);
        g.fillText(labels[1], MD.after[0], MD.labelY);
    },
});
