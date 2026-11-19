// Dev sheet for things/shawl.js: the mantón de Manila that is the emblem's ground.
// Nine pages, one every 0.2 s (render with --at 0,0.21,0.42,0.63,0.84,1.05,1.26,1.47,1.68):
//   0  (a) the frame's share of the plate at film size, painted as the film paints it
//          (a plate at 1.344 px per unit, seen at the hold's scale), raw paint
//   1  (b) the same under a dark mask where the emblem sits: what will actually show
//   2  (c) close-ups at 2×: a peony, a bird, a spray of small flowers, a stretch of lettering
//   3  (c) the same four at 4×
//   4  the whole plate, small (as the camera sees it arriving), with the time the full call
//      took, the painted share of the cloth and the widest hole
//   5  page 0 through the lens' finish
//   6  2×: a long-tailed bird, a pavilion, a bridge, a rose
//   7  2×: a chrysanthemum, a half-open peony, a bough of blossom, a dragonfly or butterfly
//   8  the cloth alone, whole: the crepe and the verses figured in it (no embroidery)
const SHDIR = 'sandbox/2026-11-19-souvenir-test/';
const SHPLATE = { x: -1700, y: -1000, w: 3400, h: 2000 };
Motion.scene({
    fps: 24, duration: 1.9, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', SHDIR + 'things/shawl.js'],
    fonts: [{ family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }],
    setup() {
        return { cache: new Map() };
    },
    draw(g, t, env) {
        const S = Souvenir, page = Math.min(8, Math.floor(t * 5 + 1e-6)), st = env.state;
        // the tableau's plate under the embroidery
        const night = (q, b) => {
            const gr = q.createRadialGradient(0, -60, 100, 0, 0, 1500);
            gr.addColorStop(0, '#2c2f63');
            gr.addColorStop(0.45, '#232750');
            gr.addColorStop(1, '#1b1e3d');
            q.fillStyle = gr;
            q.fillRect(b.x, b.y, b.w, b.h);
        };
        // a window of the plate, painted at `res` px per unit into its own canvas
        const plate = (key, view, res, opts = {}) => {
            if (!st.cache.has(key)) {
                const c = document.createElement('canvas');
                c.width = Math.ceil(view.w * res);
                c.height = Math.ceil(view.h * res);
                const q = c.getContext('2d');
                q.setTransform(res, 0, 0, res, -view.x * res, -view.y * res);
                night(q, view);
                const t0 = performance.now();
                const L = Shawl.carpet(q, SHPLATE, { view: opts.whole ? null : view, ...opts });
                q.getImageData(0, 0, 1, 1);
                const ms = performance.now() - t0;
                if (opts.tooth !== false) S.tooth(q, view, { amp: 0.06 });
                st.cache.set(key, { c, ms, L });
                console.log(`${key}: ${ms.toFixed(0)} ms, ${L.items.length} motifs, cells taken ${(L.cells * 100).toFixed(1)} %`);
            }
            return st.cache.get(key);
        };
        g.fillStyle = '#1b1e3d';
        g.fillRect(0, 0, 1600, 900);
        const label = (s, x, y) => {
            g.font = '13px monospace';
            g.fillStyle = 'rgba(8,8,20,0.7)';
            g.fillRect(x - 4, y - 13, g.measureText(s).width + 8, 18);
            g.fillStyle = '#d9dcea';
            g.fillText(s, x, y);
        };
        const RES = env.k * 1.12; // the rig's plate resolution
        const L = Shawl.plan(SHPLATE, {});
        const pick = (kinds, x, y, rmin = 0) => {
            let best = null, bd = 1e9;
            for (const it of L.items) {
                if (!kinds.includes(it.k) || (it.r ?? 99) < rmin) continue;
                const d = Math.hypot(it.bx - x, it.by - y);
                if (d < bd) {
                    bd = d;
                    best = it;
                }
            }
            return best ?? { bx: x, by: y, k: '—' };
        };
        const four = (targets, zoom) => targets.forEach((it, i) => {
            const x = 12 + (i % 2) * 794, y = 12 + Math.floor(i / 2) * 444, w = 782, h = 432;
            const cx = it.bx + (it.dx ?? 0), cy = it.by + (it.dy ?? 0);
            const view = { x: cx - w / zoom / 2, y: cy - h / zoom / 2, w: w / zoom, h: h / zoom };
            const p = plate(`z${zoom}-${it.k}-${cx.toFixed(0)}-${cy.toFixed(0)}`, view, env.k * zoom);
            g.drawImage(p.c, x, y, w, h);
            g.strokeStyle = 'rgba(217,164,65,0.5)';
            g.lineWidth = 1;
            g.strokeRect(x, y, w, h);
            label(`${it.k} at ${cx.toFixed(0)}, ${cy.toFixed(0)} · ${zoom}×`, x + 10, y + 20);
        });
        if (page === 0 || page === 1 || page === 5) {
            // the hold's widest view: the plate at 0.885, the camera 52 below the axis
            const sc = 0.885, view = { x: -800 / sc, y: 52 - 450 / sc, w: 1600 / sc, h: 900 / sc };
            const p = plate('frame', view, RES);
            g.imageSmoothingQuality = 'high';
            g.drawImage(p.c, 0, 0, 1600, 900);
            if (page === 1) {
                g.fillStyle = 'rgba(10,10,22,0.93)';
                g.beginPath();
                g.ellipse(800, 450 - 52 * sc, 700 * sc, 400 * sc, 0, 0, 6.3);
                g.fill();
            }
        } else if (page === 2 || page === 3) {
            four([pick(['peony'], -640, -330, 60), pick(['songbird'], 700, -380), pick(['spray'], -640, 420), { bx: 640, by: 470, k: 'lettering' }], page === 2 ? 2 : 4);
        } else if (page === 6) {
            const fowl = pick(['peafowl'], -700, 0);
            four([{ ...fowl, dx: 0, dy: -10 }, { ...pick(['pavilion'], 0, 500), dy: -45 }, pick(['bridge'], 500, -200), pick(['rose'], 600, 300, 60)], 2);
        } else if (page === 7) {
            four([pick(['mum'], -300, -300, 36), { ...pick(['cup'], 300, 200, 16) }, pick(['bough'], 0, -600), pick(['dragonfly'], 400, -400)], 2);
        } else if (page === 8) {
            const p = plate('cloth', SHPLATE, 0.6, { whole: true, tooth: false, motifs: false });
            const sc = 1600 / SHPLATE.w;
            g.imageSmoothingQuality = 'high';
            g.drawImage(p.c, 0, (900 - SHPLATE.h * sc) / 2, 1600, SHPLATE.h * sc);
        } else if (page === 4) {
            const p = plate('whole', SHPLATE, RES, { whole: true, tooth: false });
            if (!st.stats) {
                // the painted share of the cloth and its widest hole, off a copy on clear glass
                const res = 0.5, c = document.createElement('canvas');
                c.width = SHPLATE.w * res;
                c.height = SHPLATE.h * res;
                const q = c.getContext('2d', { willReadFrequently: true });
                q.setTransform(res, 0, 0, res, -SHPLATE.x * res, -SHPLATE.y * res);
                Shawl.carpet(q, SHPLATE, { bare: true });
                const d = q.getImageData(0, 0, c.width, c.height).data, n = c.width * c.height, inside = new Uint8Array(n);
                let cov = 0;
                for (let i = 0; i < n; i++) {
                    if (d[i * 4 + 3] > 200) cov++;
                    else inside[i] = 1;
                }
                const e = S.edt(inside, c.width, c.height);
                let mx = 0, mi = 0, big = 0;
                for (let i = 0; i < n; i++) {
                    if (e[i] > mx) {
                        mx = e[i];
                        mi = i;
                    }
                    if (e[i] * 2 > 70 * res) big++;
                }
                st.stats = { cov: cov / n, hole: (mx * 2) / res, hx: SHPLATE.x + (mi % c.width) / res, hy: SHPLATE.y + Math.floor(mi / c.width) / res, big: big / n };
                console.log(`painted ${(st.stats.cov * 100).toFixed(1)} % of the cloth; widest hole ${st.stats.hole.toFixed(0)} units at ${st.stats.hx.toFixed(0)}, ${st.stats.hy.toFixed(0)}; ${(st.stats.big * 100).toFixed(3)} % of the cloth lies in holes wider than 70`);
                const kinds = {};
                for (const it of L.items) kinds[it.k] = (kinds[it.k] ?? 0) + 1;
                console.log(Object.entries(kinds).map(([k, v]) => `${k} ${v}`).join(' · '));
            }
            const sc = 1600 / SHPLATE.w;
            g.imageSmoothingQuality = 'high';
            g.drawImage(p.c, 0, (900 - SHPLATE.h * sc) / 2 - 20, 1600, SHPLATE.h * sc);
            label(`whole plate at ${RES.toFixed(3)} px/unit: ${p.ms.toFixed(0)} ms · ${p.L.items.length} motifs · painted ${(st.stats.cov * 100).toFixed(1)} % · widest hole ${st.stats.hole.toFixed(0)} units at (${st.stats.hx.toFixed(0)}, ${st.stats.hy.toFixed(0)})`, 12, 890);
        }
    },
    post(ctx, t, env) {
        if (t >= 1 && t < 1.2) Souvenir.finish(ctx, env, 0);
    },
});
