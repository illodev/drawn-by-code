// Souvenir style template: a gilt seal on a crimson night, and a dive through its eye into
// a bunch of grapes. Two pictures, two manners (contour + airbrush, then brush with no
// line), one camera. engine/new.mjs copies it as the scene.js of every new experiment.
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js'],
    fonts: [{ family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }],
    shots: [[0, 4, 'Template']],

    setup(env) {
        const S = Souvenir;
        const hole = (g, r) => {
            g.save();
            g.globalCompositeOperation = 'destination-out';
            g.fillStyle = '#000'; // opaque, or the hole is only half cut
            g.beginPath();
            g.arc(0, 0, r, 0, 6.3);
            g.fill();
            g.restore();
        };
        const ring = (r, n = 96) => S.ellipse(0, 0, r, r, n);
        const plateBox = { x: -1700, y: -1000, w: 3400, h: 2000 };

        // picture 1, emblem manner: every piece a contour, a shade and a light
        const seal = [
            {
                id: 'tpl-night', z: 1090, box: plateBox, hole: 150,
                paint(g) {
                    const gr = g.createRadialGradient(0, 0, 80, 0, 0, 1500);
                    gr.addColorStop(0, '#5a1a36');
                    gr.addColorStop(1, '#2a0c20');
                    g.fillStyle = gr;
                    g.fillRect(plateBox.x, plateBox.y, plateBox.w, plateBox.h);
                    S.tooth(g, plateBox);
                    hole(g, 150);
                },
            },
            {
                id: 'tpl-seal', z: 1000, box: { x: -700, y: -480, w: 1400, h: 960 }, hole: 96,
                paint(g) {
                    // rays behind the seal, each a piece shading the next
                    for (let i = 0; i < 24; i++) {
                        const a = (i / 24) * 6.2832, b = a + 6.2832 / 24, r0 = 250, r1 = i % 2 ? 420 : 470, am = (a + b) / 2;
                        S.piece(g, [[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(am) * r1, Math.sin(am) * r1], [Math.cos(b) * r0, Math.sin(b) * r0]], {
                            fill: i % 2 ? '#c9373c' : '#e8a13e', line: 2.4, cast: { blur: 8, dx: 3, dy: 5 },
                            shade: { color: i % 2 ? '#6e1428' : '#8a4a14', alpha: 0.8, w: 26 }, light: { color: '#fff0c8', alpha: 0.5, w: 8 },
                        });
                    }
                    // the band, the star, the rim round the eye
                    S.piece(g, ring(300), { fill: '#d9a441', line: 3, cast: { blur: 14, dx: 6, dy: 9 }, shade: { color: '#7a4d14', alpha: 0.85, w: 44 }, light: { color: '#fff3c0', alpha: 0.7, w: 14 } });
                    S.piece(g, ring(222), { fill: '#f4efe4', line: 2.6, shade: { color: '#8f8db0', alpha: 0.7, w: 30 } });
                    const star = [];
                    for (let i = 0; i < 16; i++) star.push([Math.cos((i / 16) * 6.2832 + 0.39) * (i % 2 ? 150 : 212), Math.sin((i / 16) * 6.2832 + 0.39) * (i % 2 ? 150 : 212)]);
                    S.piece(g, star, { fill: '#1f7350', line: 2.6, cast: { blur: 8, dx: 3, dy: 5 }, shade: { color: '#0b3a2f', alpha: 0.85, w: 30 }, light: { color: '#8fd6a8', alpha: 0.6, w: 10 } });
                    S.piece(g, ring(118), { fill: '#d9a441', line: 2.6, cast: { blur: 8, dx: 3, dy: 5 }, shade: { color: '#7a4d14', alpha: 0.85, w: 18 }, light: { color: '#fff3c0', alpha: 0.8, w: 6 } });
                    // lettering painted on the band, set on its curve
                    const arc = [];
                    for (let i = 0; i <= 60; i++) arc.push([Math.cos(Math.PI * (1.04 + (i / 60) * 0.92)) * 248, Math.sin(Math.PI * (1.04 + (i / 60) * 0.92)) * 248]);
                    S.textOn(g, 'DRAWN · BY · CODE', arc, { font: '52px "IM Fell DW Pica SC"', color: S.INK, spacing: 6 });
                    S.tooth(g, { x: -700, y: -480, w: 1400, h: 960 });
                    hole(g, 96);
                },
            },
        ];

        // picture 2, brush manner: lit volumes, strokes that follow the form, no line
        const GRAPE = [[0, '#120720'], [0.3, '#2a113c'], [0.5, '#451c59'], [0.68, '#63307a'], [0.86, '#87539b'], [1, '#bd99cb']];
        const LEAF = [[0, '#0f2a1c'], [0.3, '#22552a'], [0.55, '#3b8036'], [0.8, '#6fb04a'], [1, '#b4dd86']];
        const grape = (v) => S.form({
            box: { x: -52, y: -58, w: 104, h: 116 }, res: env.k * 1.6, seed: 'grape' + v,
            mask: (g) => { g.beginPath(); g.ellipse(0, 0, 44, 50, 0, 0, 6.3); g.fill(); },
            ramp: GRAPE, soft: 0.9, edge: { rough: 1.4 }, stroke: { amp: 0.07, freq: 0.05 }, mottle: { amp: 0.06, freq: 0.03 },
            spec: { amp: 0.7, power: 26, from: 0.4, to: 0.9, ragged: 0.4, color: '#f2e6ff' },
            tint: (x, y, tone, rgb, m) => { const k = S.smooth(0.3, 0.05, tone) * S.smooth(0.4, 0.03, m) * 0.5; rgb[0] += (60 - rgb[0]) * k; rgb[1] += (110 - rgb[1]) * k; rgb[2] += (70 - rgb[2]) * k; },
        });
        const leaf = (v) => S.form({
            box: { x: -20, y: -110, w: 420, h: 220 }, res: env.k * 1.3, seed: 'vine' + v, inflate: 'none',
            mask: (g) => { g.beginPath(); S.trace(g, S.curve([[0, 0], [90, -80 - v * 8], [220, -92], [390, 6], [230, 86 + v * 6], [80, 70]], true, 10)); g.fill(); },
            height: (x, y) => (0.3 + 0.1 * v) * Math.abs(y) + 1.2 * Math.sin(x * 0.11 - Math.abs(y) * 0.05),
            ramp: LEAF, soft: 0.88, edge: { rough: 2.4 }, mottle: { amp: 0.07, freq: 0.02 },
            stroke: { amp: 0.1, field: (x, y) => [(x * 0.6 + Math.abs(y) * 0.8) * 0.012, (-x * 0.8 + Math.abs(y) * 0.6) * 0.13, y < 0 ? 0.2 : 3.7] },
            spec: { amp: 0.5, power: 14, from: 0.6, to: 0.92, ragged: 0.7, color: '#e2f4cd' },
        });
        const grapesBox = { x: -1300, y: -740, w: 2600, h: 1480 };
        const grapes = [
            {
                id: 'tpl-vine', z: 2620, box: plateBox,
                paint(g) {
                    g.fillStyle = '#1a3a26';
                    g.fillRect(plateBox.x, plateBox.y, plateBox.w, plateBox.h);
                    const r = Motion.rng('vine');
                    for (let i = 0; i < 70; i++) S.put(g, leaf(i % 3), { x: plateBox.x + r() * plateBox.w, y: plateBox.y + r() * plateBox.h, rot: r() * 6.28, s: 1.4 + r() });
                    g.fillStyle = 'rgba(26,60,40,0.5)'; // a step back in the air
                    g.fillRect(plateBox.x, plateBox.y, plateBox.w, plateBox.h);
                },
            },
            {
                id: 'tpl-grapes', z: 2340, box: grapesBox,
                paint(g) {
                    const r = Motion.rng('bunch');
                    const put = (sp, o) => {
                        S.cast(g, (q) => S.put(q, sp, o), { blur: 16, dx: 7, dy: 11, color: 'rgba(8,10,24,0.6)' });
                        S.put(g, sp, o);
                    };
                    for (let i = 0; i < 5; i++) put(leaf(i % 3), { x: -420 + i * 190, y: -330 + (i % 2) * 60, rot: -0.6 + i * 0.5, s: 1.5 });
                    // a bunch: rows that narrow downwards, each grape over the ones behind it
                    for (let row = 0; row < 7; row++) {
                        const n = 7 - row + (row < 2 ? row : 0);
                        for (let i = 0; i < n; i++) put(grape(Math.floor(r() * 4)), { x: (i - (n - 1) / 2) * 92 + (r() - 0.5) * 30, y: -230 + row * 86 + (r() - 0.5) * 26, rot: (r() - 0.5) * 0.6, s: 1.15 + r() * 0.2 });
                    }
                },
            },
        ];
        // the camera's depth and focus: arrive, push, go through the eye, settle
        return { rig: S.rig(env, [...seal, ...grapes]), z: [[0, -260], [1.4, 60], [2.7, 1300], [4, 1380]], focus: [[0, 1000], [2.0, 1000], [2.6, 2340], [4, 2340]] };
    },

    draw(g, t, env) {
        const S = Souvenir, st = env.state;
        st.rig.draw(g, t, (u) => ({ z: S.track(st.z, u), focus: S.track(st.focus, u), aperture: 15, roll: 0.012 * Math.sin(u * 0.8) }), { bg: '#2a0c20' });
    },
    post(ctx, t, env) {
        Souvenir.finish(ctx, env, Math.round(t * env.fps));
    },
});
