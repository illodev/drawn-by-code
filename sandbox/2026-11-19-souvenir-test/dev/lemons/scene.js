// Dev scene for picture 2, the lemon tree (things/citrus.js + tableaux/lemons.js).
//   t 0 … 3.5   the picture alone through the rig and the finish, as the film shows it
//   t 4         the same first frame without the finish (the raw paint)
//   t 5         the set-up time and the sprite count (painted on the frame)
const DEV = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 24, duration: 6, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DEV + 'things/citrus.js', { src: DEV + 'things/fauna.js', optional: true }, DEV + 'tableaux/lemons.js'],
    setup(env) {
        const layers = Tableau.lemons(1000).map((l) => ({ ...l, far: [0.12, 0.2], paint: (g, res) => {
            const c = document.createElement('canvas');
            c.width = g.canvas.width; c.height = g.canvas.height;
            const q = c.getContext('2d', { willReadFrequently: true });
            q.setTransform(g.getTransform());
            l.paint(q, res);
            g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(c, 0, 0); g.restore();
        } }));
        const rig = Souvenir.rig(env, layers);
        const t0 = performance.now(); // dev only: reported at t = 5, never used by the picture
        const prof = {};
        for (const k of ['form', 'cast', 'inflate', 'edt']) {
            const f = Souvenir[k];
            prof[k] = { ms: 0, n: 0, px: 0 };
            Souvenir[k] = (...a) => {
                const q = performance.now(), r = f(...a);
                prof[k].ms += performance.now() - q;
                prof[k].n++;
                if (k === 'form') prof[k].px += r.canvas.width * r.canvas.height;
                return r;
            };
        }
        const per = [];
        for (const l of layers) {
            const q = performance.now();
            rig.canvasOf(l);
            per.push(l.id + ' ' + ((performance.now() - q) / 1000).toFixed(1));
        }
        return { rig, layers, ms: performance.now() - t0, prof, per };
    },
    draw(g, t, env) {
        const st = env.state;
        const cam = (u) => ({ z: -10 + Math.min(u, 3.5) * 14, focus: 1000, aperture: 15 });
        if (t < 4.99) {
            st.rig.draw(g, t < 3.99 ? t : 0, cam, { bg: '#1b1e3d' });
            return;
        }
        g.fillStyle = '#232749';
        g.fillRect(0, 0, 1600, 900);
        g.fillStyle = '#f4efe4';
        g.font = '40px monospace';
        g.fillText(`set-up ${(st.ms / 1000).toFixed(1)} s`, 80, 120);
        let y = 180;
        for (const k in st.prof) g.fillText(`${k}: ${(st.prof[k].ms / 1000).toFixed(1)} s, n ${st.prof[k].n}, Mpx ${(st.prof[k].px / 1e6).toFixed(1)}`, 80, (y += 50));
        for (const p of st.per) g.fillText(p, 80, (y += 50));
    },
    post(ctx, t, env) {
        if (t < 3.99) Souvenir.finish(ctx, env, Math.round(t * env.fps));
    },
});
