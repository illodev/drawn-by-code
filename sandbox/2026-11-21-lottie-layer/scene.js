// 2026-11-21-lottie-layer · engine test: Lottie files as layers (engine/lottie.js)
//
// Left: badge.json, a Lottie written by code (make-lottie.mjs), played twice: seeking
// backwards must give the same frames. Right: ease-dot.json (a 60 fps composition) on the
// top track, a dot drawn by code from the SAME keyframes on the middle one (Lottie.ease →
// Ease.bezier), and both on the bottom one: the filled dot has to stay inside the ring.
const DIR = 'sandbox/2026-11-21-lottie-layer/';
const C = { paper: '#f4efe6', card: '#fbf8f2', ink: '#2b2a33', soft: '#7d7684', line: '#ddd3c5', teal: '#3a8d8c' };
const BOX = { x: 830, w: 640, h: 80 };          // ease-dot.json is 640 × 80: 1 unit = 1 comp px
const ROWS = [380, 530, 680];
const DOT_T0 = 1.0;                              // the tracks start at 1 s
const badgeTime = (t) => (t < 3.4 ? t - 0.6 : t - 3.4);   // plays at 0.6 s and again at 3.4 s

// x of the code-drawn dot (comp px), from the Lottie keyframes read in setup
function trackX(track, tl) {
    if (tl <= track[0].t) return track[0].x;
    for (let n = 0; n < track.length - 1; n++) {
        const a = track[n], b = track[n + 1];
        if (tl < b.t) return Ease.lerp(a.x, b.x, Lottie.ease(a.key)(Ease.seg(tl, a.t, b.t)));
    }
    return track[track.length - 1].x;
}

function panel(g, x, y, w, h) {
    g.fillStyle = C.card;
    g.strokeStyle = C.line;
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(x, y, w, h, 28);
    g.fill();
    g.stroke();
}

function label(g, text, x, y, o = {}) {
    g.font = `${o.size ?? 22}px Short`;
    g.fillStyle = o.color ?? C.soft;
    g.textAlign = o.align ?? 'left';
    g.textBaseline = 'alphabetic';
    g.fillText(text, x, y);
}

Motion.scene({
    fps: 24,
    duration: 5,
    logical: [1600, 900],
    uses: ['engine/lottie.js'],
    fonts: [
        { family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' },
        { family: 'Short', src: 'fonts/ShortStack-latin.woff2' },
    ],
    shots: [[0, 5, 'Test card']],

    async setup(env) {
        const badge = await Lottie.load(env, DIR + 'badge.json', { w: 440 });
        const dot = await Lottie.load(env, DIR + 'ease-dot.json', { w: BOX.w });
        const comp = await (await fetch('../' + DIR + 'ease-dot.json')).json();
        const track = comp.layers[0].ks.p.k.map((key) => ({ t: key.t / comp.fr, x: key.s[0], key }));
        return { badge, dot, track };
    },

    draw(g, t, env) {
        const { badge, dot, track } = env.state;
        g.fillStyle = C.paper;
        g.fillRect(0, 0, env.W, env.H);

        g.font = '60px Shrikhand';
        g.fillStyle = C.ink;
        g.textAlign = 'left';
        g.fillText('Lottie layer', 110, 140);
        label(g, 'engine/lottie.js · dotlottie-web (ThorVG in WASM) · every frame = f(t)', 112, 186, { size: 24 });

        // left: the badge
        panel(g, 110, 240, 620, 590);
        badge.draw(g, badgeTime(t), 420, 515, { anchor: [0.5, 0.5] });
        label(g, 'badge.json · written by code, no After Effects', 420, 795, { align: 'center' });

        // right: the easing tracks
        panel(g, 790, 240, 700, 590);
        const tl = t - DOT_T0;
        const x = BOX.x + trackX(track, tl);
        const texts = ['Lottie · a 60 fps composition', 'code · Lottie.ease on the same keyframes', 'both · the dot stays inside the ring'];
        ROWS.forEach((y, r) => {
            label(g, texts[r], BOX.x + 20, y - 46);
            g.strokeStyle = C.line;
            g.lineWidth = 3;
            g.beginPath();
            g.moveTo(BOX.x + 40, y);
            g.lineTo(BOX.x + 600, y);
            g.stroke();
            for (const tx of [40, 600]) {
                g.beginPath();
                g.moveTo(BOX.x + tx, y - 10);
                g.lineTo(BOX.x + tx, y + 10);
                g.stroke();
            }
            if (r !== 1) dot.draw(g, tl, BOX.x, y - BOX.h / 2);
            if (r !== 0) {
                g.fillStyle = C.teal;
                g.beginPath();
                g.arc(x, y, 14, 0, Math.PI * 2);
                g.fill();
            }
        });
        label(g, `t ${t.toFixed(2)} s · badge frame ${badge.frameAt(badgeTime(t)).toFixed(1)} · dot frame ${dot.frameAt(tl).toFixed(1)}`, 1470, 800, { align: 'right', size: 18 });
    },
});
