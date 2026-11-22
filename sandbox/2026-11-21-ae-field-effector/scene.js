// 2026-11-21-ae-field-effector · preview of the demo that make-demo.jsx builds in After Effects.
//
// The same grid of tile precomps, field keys and effector settings (demo-spec.js) as the two
// demo comps, weighed by field-math.js, the file FieldEffector.jsx pastes into its
// expressions. Each tile is drawn the way the rig's expressions transform it: rest position
// + offset/push, scale and rotation about its own centre, opacity, a Fill tint, and its
// precomp scrubbed by the weight (the dot grows). The orange guides are the field gizmo the
// designer sees in the viewer (After Effects doesn't render guide layers). A diagnostic,
// not a styled piece.
const DIR = 'sandbox/2026-11-21-ae-field-effector/';
const GUIDES = true;

const smooth = (u) => u * u * (3 - 2 * u);
const clamp01 = (u) => (u < 0 ? 0 : u > 1 ? 1 : u);

// a property keyed with Easy Ease everywhere (influence 1/3, speed 0) is smoothstep per segment
function easedAt(keys, t, col) {
    if (t <= keys[0][0]) return keys[0][col];
    for (let i = 1; i < keys.length; i++) {
        if (t <= keys[i][0]) {
            const a = keys[i - 1], b = keys[i];
            return a[col] + (b[col] - a[col]) * smooth((t - a[0]) / (b[0] - a[0]));
        }
    }
    return keys[keys.length - 1][col];
}

// field-glue.js's fxCustom, on keys held in JS
function customOf(keys) {
    if (!keys) return null;
    const t0 = keys[0][0], t1 = keys[keys.length - 1][0], v0 = keys[0][1], v1 = keys[keys.length - 1][1];
    return (u) => (easedAt(keys, t0 + u * (t1 - t0), 1) - v0) / (v1 - v0);
}

const mix = (a, b, u) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * u)).join(',')})`;

function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
}

Motion.scene({
    fps: 24, duration: 9,
    logical: [1920, 1080],
    uses: [DIR + 'field-math.js', DIR + 'demo-spec.js'],
    shots: [[0, 4.5, 'Sphere field'], [4.5, 9, 'Linear field']],
    setup() {
        const G = FX_DEMO.grid, rest = [];
        for (let r = 0; r < G.rows; r++)
            for (let c = 0; c < G.cols; c++)
                rest.push([960 + (c - (G.cols - 1) / 2) * G.step, 540 + (r - (G.rows - 1) / 2) * G.step]);
        return { rest, custom: FX_DEMO.shots.map((s) => customOf(s.custom)) };
    },
    draw(g, t, env) {
        const D = FX_DEMO, G = D.grid, C = D.colors;
        const si = t < D.shot ? 0 : 1, S = D.shots[si], lt = t - si * D.shot;   // lt = the AE comp's time
        const { rest, custom } = env.state;
        g.fillStyle = mix(C.bg, C.bg, 0);
        g.fillRect(0, 0, env.W, env.H);

        // the field null: unrotated, 100 %, anchor at its centre
        const fx = easedAt(S.keys, lt, 1), fy = easedAt(S.keys, lt, 2), ch = S.ch;
        const workLen = D.work - 1 / D.fps;
        // layer order: the first tile made is the bottom layer
        for (let i = 0; i < rest.length; i++) {
            const [px, py] = rest[i];
            const field = { P: S.P, lx: px - fx, ly: py - fy, cx: fx, cy: fy, ax: 1, ay: 0, custom: custom[si] };
            const r = fxEvaluate([field], px, py, lt);
            const w = (r[0] * ch.strength) / 100;
            const dx = (ch.offsetX + ch.push * r[1]) * w, dy = (ch.offsetY + ch.push * r[2]) * w;
            const k = 1 + (ch.scale / 100 - 1) * w;
            const op = Math.max(0, Math.min(1, 1 + (ch.opacity / 100 - 1) * w));
            const tint = S.tint ? clamp01((ch.tint / 100) * w) : 0;
            const dot = S.time ? (clamp01(w) * workLen) / D.work : 0;   // precomp time -> the dot's scale
            g.save();
            g.globalAlpha = op;
            g.translate(px + dx, py + dy);
            g.rotate((ch.rotation * w * Math.PI) / 180);
            g.scale(k, k);
            roundRect(g, -G.tile / 2, -G.tile / 2, G.tile, G.tile, G.radius);
            g.fillStyle = mix(C.tile, ch.tintColor, tint);
            g.fill();
            if (dot > 0) {
                g.beginPath();
                g.arc(0, 0, (G.dot / 2) * dot, 0, Math.PI * 2);
                g.fillStyle = mix(C.dot, ch.tintColor, tint);
                g.fill();
            }
            g.restore();
        }

        if (!GUIDES) return;
        // the gizmo: edge and full-weight outlines, and the null itself
        const P = S.P, W = (P.size * P.falloff) / 100;
        g.strokeStyle = 'rgb(255, 140, 31)';
        g.lineWidth = 2.5;
        g.beginPath();
        if (P.shape === 1) g.arc(fx, fy, P.size, 0, Math.PI * 2);
        else if (P.shape === 3) {
            g.moveTo(fx, -50);
            g.lineTo(fx, env.H + 50);
        }
        g.stroke();
        g.lineWidth = 1.2;
        g.globalAlpha = 0.6;
        g.beginPath();
        if (P.shape === 1) g.arc(fx, fy, Math.max(0, P.size - W), 0, Math.PI * 2);
        else if (P.shape === 3) {
            g.moveTo(fx - W, -50);
            g.lineTo(fx - W, env.H + 50);
        }
        g.stroke();
        g.globalAlpha = 1;
        // the null's anchor (AE 2026 makes nulls with the anchor at [0, 0])
        g.strokeStyle = 'rgba(200, 60, 40, 0.9)';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(fx - 14, fy);
        g.lineTo(fx + 14, fy);
        g.moveTo(fx, fy - 14);
        g.lineTo(fx, fy + 14);
        g.stroke();
    },
});
