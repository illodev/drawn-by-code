// Dev scene for picture 2, the lemon tree (things/citrus.js + tableaux/lemons.js).
//   t 0 … 3.5   the picture alone through the rig and the finish, as the film shows it
//   t 4         its first frame without the finish (the raw paint)
//   t 5         the main layer alone on grey (what is sharp, and where the gaps are)
//   t 6 … 9     each other layer alone: plate, far, mid, front + near
//   t 10        set-up time, sprite count, canvas memory (painted on the frame)
//   t 12 …      specimen pages at 3×: every sprite kind, raw paint (see PAGES)
const DEV = 'sandbox/2026-11-19-souvenir-test/';
const PROFILE = true; // dev only: time the kit's and the canvas's calls while the layers are painted
const PICTURE = true; // false: only the specimen pages (while the sprites are being worked on)
Motion.scene({
    fps: 24, duration: 24, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DEV + 'things/citrus.js', { src: DEV + 'things/fauna.js', optional: true }, DEV + 'tableaux/lemons.js'],
    setup(env) {
        // the layers are painted on the first frame, as in the film (painting them here
        // would hold the page's load event past the renderer's patience)
        return { rig: null, layers: [], ms: 0, per: [], err: null, done: false };
    },
    draw(g, t, env) {
        const st = env.state, S = Souvenir, C = Citrus;
        const sec = Math.floor(t + 1e-6);
        if (!st.done && PICTURE && sec < 12) {
            st.done = true;
            try {
                st.layers = Tableau.lemons(1000).map((l) => ({ ...l, far: [0.12, 0.2], brush: false })); // as the film maps them
                st.rig = Souvenir.rig(env, st.layers);
                const t0 = performance.now(); // dev only: reported at t = 10, never used by the picture
                const prof = {};
                if (PROFILE) {
                    const wrap = (obj, name, label) => {
                        const f = obj[name];
                        prof[label] = { ms: 0, n: 0 };
                        obj[name] = function (...a) {
                            const q = performance.now(), r = f.apply(this, a);
                            prof[label].ms += performance.now() - q;
                            prof[label].n++;
                            return r;
                        };
                    };
                    for (const k of ['form', 'tooth', 'dab']) wrap(Souvenir, k, 'S.' + k);
                    for (const k of ['leaf', 'lemon', 'flower', 'bud', 'branch', 'shadow', 'put', 'thorn', 'petal', 'spent', 'fruitlet']) wrap(Citrus, k, 'C.' + k);
                    for (const k of ['getImageData', 'putImageData', 'drawImage', 'fill', 'stroke', 'fillRect']) wrap(CanvasRenderingContext2D.prototype, k, 'ctx.' + k);
                    if (typeof Fauna !== 'undefined') for (const k of ['bee', 'goldfinch', 'butterfly', 'snail', 'ladybird', 'web', 'drop']) wrap(Fauna, k, 'F.' + k);
                }
                for (const l of st.layers) {
                    const q = performance.now();
                    st.rig.canvasOf(l);
                    st.per.push(l.id + ' ' + ((performance.now() - q) / 1000).toFixed(1) + ' s');
                }
                st.ms = performance.now() - t0;
                console.log('set-up', (st.ms / 1000).toFixed(1), 's ·', st.per.join(' · '), '·', JSON.stringify(C.stats()));
                if (PROFILE) console.log(JSON.stringify(window.__lt || {}));
                if (PROFILE) console.log(Object.entries(prof).map(([k, v]) => `${k} ${(v.ms / 1000).toFixed(2)}s/${v.n}`).join(' · '));
            } catch (e) {
                st.err = String(e.stack || e);
                st.rig = null;
                console.log('picture failed:', st.err);
            }
        }
        const cam = (u) => ({ z: -10 + Math.min(u, 3.5) * 14, focus: 1000, aperture: 15 });
        const text = (lines) => {
            g.fillStyle = '#232749';
            g.fillRect(0, 0, 1600, 900);
            g.fillStyle = '#f4efe4';
            g.font = '26px monospace';
            lines.forEach((l, i) => g.fillText(l, 60, 80 + i * 36));
        };
        if (t < 4.99) {
            if (!st.rig) return text(['no picture', ...(st.err || '').split('\n').slice(0, 18)]);
            st.rig.draw(g, t < 3.99 ? t : 0, cam, { bg: '#1b1e3d' });
            return;
        }
        if (sec >= 5 && sec <= 9) {
            if (!st.rig) return text(['no picture']);
            // one layer alone, at the size the first frame shows it
            g.fillStyle = sec === 5 ? '#8a8a8a' : '#505050';
            g.fillRect(0, 0, 1600, 900);
            const want = [['lemons-hero'], ['lemons-plate'], ['lemons-far'], ['lemons-mid'], ['lemons-front', 'lemons-near']][sec - 5];
            for (const l of st.layers.filter((l) => want.includes(l.id)).sort((a, b) => b.z - a.z)) {
                const s = 1000 / (l.z + 10);
                g.save();
                g.translate(800, 450);
                g.scale(s, s);
                g.drawImage(st.rig.canvasOf(l), l.box.x, l.box.y, l.box.w, l.box.h);
                g.restore();
            }
            return;
        }
        if (sec === 10 || sec === 11) {
            const q = C.stats();
            return text([`set-up ${(st.ms / 1000).toFixed(1)} s`, ...st.per, `sprites ${q.sprites}, ${(q.px / 1e6).toFixed(1)} Mpx, ${q.mb} MB`, `layers ${st.layers.map((l) => Math.round((l.box.w * l.box.h * Math.pow(env.k * 1.12, 2) * 4) / 1048576)).join(' + ')} MB`, st.err || '']);
        }
        // ---- specimens at 3×, raw paint, on the tree's own shade (two tones, to judge the edges)
        g.fillStyle = '#1c3a2a';
        g.fillRect(0, 0, 1600, 900);
        g.fillStyle = '#3d6b47';
        g.fillRect(0, 450, 1600, 450);
        const Z = 3, res = Math.ceil(Z * env.k * 4) / 4;
        const page = sec - 12;
        const row = (list, y, x0 = 0, x1 = 1600) => list.forEach((fn, i) => fn(x0 + ((i + 0.5) / list.length) * (x1 - x0), y));
        const lemon = (v, o, rot = 0) => (x, y) => C.put(g, C.lemon(v, rot, res, o), x, y, Z, { rot });
        const leaf = (v, kind, rot = 0, o = {}) => (x, y) => {
            const sp = C.leaf(v, rot, res, kind);
            C.put(g, sp, x - Math.cos(rot) * sp.len * Z * 0.5, y - Math.sin(rot) * sp.len * Z * 0.5, Z, { rot, ...o });
        };
        const pick = (kind, test, from = 0) => {
            for (let v = from; v < from + 400; v++) if (test(C.leafGeom(v, kind))) return v;
            return from;
        };
        const PAGES = [
            () => row([lemon(0, { age: 'green' }), lemon(1, { age: 'turning' }), lemon(2, { age: 'turning' }, 0.4)], 450),
            () => row([lemon(3, { age: 'ripe' }, -0.3), lemon(4, { age: 'over' }), lemon(5, { age: 'over' }, 0.3)], 450),
            () => row([lemon(6, { view: 'tip' }), lemon(7, { view: 'stalk' }), lemon(8, { view: 'tip', age: 'turning' }, 0.6)], 450),
            () => {
                row([leaf(0, 'sun'), leaf(1, 'mid', 0.3)], 150);
                row([leaf(2, 'deep', -0.2), leaf(3, 'sun', Math.PI + 0.2)], 450);
                row([leaf(4, 'mid', 0.1), leaf(5, 'sun', -0.3)], 750);
            },
            () => {
                row([leaf(6, 'under'), leaf(7, 'old', 0.2)], 150);
                row([leaf(8, 'young', -0.2), leaf(9, 'bronze', 0.3), leaf(10, 'young', 2.6)], 450);
                row([leaf(11, 'back', 0.1), leaf(12, 'back', -0.4)], 750);
            },
            () => {
                row([leaf(pick('mid', (G) => G.bl.miner), 'mid'), leaf(pick('mid', (G) => G.cuts.length > 1), 'sun', 0.2)], 150);
                row([leaf(pick('mid', (G) => G.bl.dry), 'mid', -0.2), leaf(pick('mid', (G) => G.bl.curl), 'sun', 0.3)], 450);
                row([leaf(pick('mid', (G) => G.bl.mould), 'mid', 0.1), leaf(pick('mid', (G) => G.bl.spots && G.bl.yellow), 'mid', -0.3), leaf(pick('young', (G) => G.bl.miner), 'young', 0.5)], 750);
            },
            () => {
                const fl = (v, pose, rot = 0) => (x, y) => C.put(g, C.flower(v, rot, res, pose), x, y, Z, { rot });
                row([fl(0, 'face'), fl(1, 'tilt'), fl(2, 'side'), fl(3, 'half')], 230);
                row([fl(3, 'face', 0.7), fl(4, 'face', 2), fl(5, 'tilt', -0.5), fl(6, 'side', 0.5), fl(7, 'half', -0.4)], 680);
            },
            () => {
                const bd = (v, long, rot) => (x, y) => C.put(g, C.bud(v, rot, res, long), x, y, Z, { rot });
                const sp = (v, rot) => (x, y) => C.put(g, C.spent(v, rot, res), x, y, Z, { rot });
                const fr = (v, rot) => (x, y) => C.put(g, C.fruitlet(v, rot, res), x, y, Z, { rot });
                const pe = (v, rot, o) => (x, y) => C.put(g, C.petal('loose' + v, rot, res, o), x, y, Z, { rot });
                row([bd(0, true, -1.2), bd(1, true, -0.4), bd(2, false, -1.6), bd(3, false, 0.3), bd(4, true, 2.2), bd(5, false, 1.2)], 190);
                row([sp(0, 0), sp(1, 0.6), sp(2, -0.5), fr(0, 0), fr(1, 0.3), fr(2, -0.4)], 480);
                row([pe(0, 0.3, {}), pe(1, 1.8, { old: 0.8 }), pe(2, -0.6, { out: 1, cup: -0.4 }), pe(3, 3.4, { old: 1, len: 40 })], 760);
            },
            () => {
                g.save();
                g.scale(Z, Z);
                C.branch(g, [[10, 40], [120, 30], [260, 52], [400, 36], [520, 50]], { w0: 24, w1: 17, seed: 'bough' });
                C.cut(g, 524, 50, 0.1, 17, 1);
                C.branch(g, [[10, 110], [150, 96], [300, 118], [420, 104], [520, 112]], { w0: 13, w1: 6, green: [0.25, 0.75], seed: 'yearling', nodes: [80, 170, 260, 350, 440] });
                for (const [d, up] of [[80, 1], [170, -1], [260, 1], [350, -1]]) C.scar(g, 10 + d, 106 + (up > 0 ? -6 : 7), up > 0 ? 0 : Math.PI, 9);
                C.branch(g, [[10, 180], [140, 170], [280, 190], [400, 172], [520, 186]], { w0: 7.5, w1: 3.2, green: [0, 0], seed: 'shoot', nodes: [60, 120, 180, 240, 300, 360, 420] });
                for (const [x, y, a, l] of [[70, 174, -1.2, 22], [130, 171, 1.4, 14], [190, 176, -1.4, 18], [250, 187, 1.2, 9], [310, 186, -1.1, 26]]) C.thorn(g, x, y, a, l, x);
                C.branch(g, [[30, 250], [60, 232], [90, 240]], { w0: 2.8, w1: 2.2, green: [0, 0], seed: 'pedicel' });
                const lf = C.leaf(1, 0.2, (res / Z) * 2, 'mid');
                C.put(g, lf, 180, 252, 1, { rot: 0.2 });
                for (const [x, y, r, h] of [[250, 250, 6, 0], [290, 268, 3.5, 0], [320, 262, 4.5, 0], [372, 290, 4, 0.5], [230, 262, 2, 0]]) C.drop(g, { x, y, r, hang: h });
                g.restore();
            },
        ];
        if (PAGES[page]) PAGES[page]();
    },
    post(ctx, t, env) {
        if (t < 3.99) Souvenir.finish(ctx, env, Math.round(t * env.fps));
    },
});
