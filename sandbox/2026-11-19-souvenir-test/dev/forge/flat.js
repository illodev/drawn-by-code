// Dev · picture 9's things on a flat sheet at scale 1, no rig, no finish (the raw paint).
// One page per second: t = 0, 1, 2 … (see PAGES). Crop the stills at 2× to judge them.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
const PAGES = [
    // 0 · copper under the fire, on whitewash
    (g, F) => {
        g.fillStyle = '#2a2026';
        g.fillRect(-800, -450, 1600, 900);
        const fire = { x: -200, y: 520, z: 260, c: F.FIRE, r0: 900 };
        F.pan(g, { x: -560, y: -60, r: 120, view: 'back', fire, seed: 'a' });
        F.pan(g, { x: -220, y: 40, r: 90, view: 'inside', fire, seed: 'b' });
        F.pan(g, { x: 120, y: -40, r: 150, view: 'back', fire, seed: 'c', sooty: 0.2 });
        F.pan(g, { x: 480, y: 120, r: 70, view: 'inside', fire, seed: 'd' });
        F.nail(g, { x: 640, y: -300, fire });
    },
    // 1 · the moon
    (g, F) => {
        g.translate(0, -60);
        F.sky(g, { box: { x: -800, y: -400, w: 1600, h: 1000 }, mx: 0, my: 0, R: 375, n: 700 });
        F.halo(g, { x: 0, y: 0, r: 300 });
        F.moon(g, { x: 0, y: 0, r: 300 });
        F.bustle(g, { R: 300, floor: 362, moon: { x: 0, y: -40, z: 420, c: [1.05, 1.12, 1.35], r0: 1e9 }, amb: [0.07, 0.08, 0.14] });
        g.strokeStyle = 'rgba(255,80,80,0.5)';
        g.strokeRect(-350, 370, 700, 120);
    },
    // 2 · a cave wall with its arch, lit from the fire behind it, and copper hung on it
    (g, F) => {
        g.fillStyle = '#1a0f0c';
        g.fillRect(-800, -450, 1600, 900);
        const arch = [];
        for (let i = 0; i <= 24; i++) {
            const a = Math.PI + (i / 24) * Math.PI;
            arch.push([Math.cos(a) * 230, -60 + Math.sin(a) * 200]);
        }
        arch.push([230, 190], [-230, 190]);
        const fire = { x: -240, y: 160, z: -320, c: F.FIRE, r0: 700 };
        const bounce = { x: -120, y: 260, z: 380, c: [0.9, 0.4, 0.17], r0: 380 };
        F.cave(g, { box: { x: -800, y: -450, w: 1600, h: 900 }, holes: [arch], reveal: 46, fire, lights: [bounce], dado: 300, seed: 'w1', wash: 0.6,
            soot: (x, y) => Math.max(0, Math.min(1, (-y - 100) / 500 + 0.5 * Math.exp(-((x / 260) ** 2)) * Math.max(0, (-y - 200) / 200))) });
        F.pan(g, { x: -480, y: -100, r: 110, view: 'back', fire, lights: [bounce], seed: 'a' });
        F.pan(g, { x: 470, y: -40, r: 90, view: 'inside', fire, lights: [bounce], seed: 'b' });
    },
    // 3 · the anvil and the smith's iron, the fire to the left
    (g, F) => {
        g.fillStyle = '#20171a';
        g.fillRect(-800, -450, 1600, 900);
        const fire = { x: -700, y: 40, z: 180, c: F.FIRE, r0: 1100 };
        F.anvil(g, { x: 80, y: 60, fire, seed: 'an' });
        F.hammer(g, { x: 150, y: -60, rot: 1.45, fire });
        F.horseshoe(g, { x: -150, y: -40, s: 0.8, fire, hot: 0.9, rot: 0.2 });
        F.horseshoe(g, { x: 560, y: -250, s: 0.9, fire, worn: 1 });
        F.tongs(g, { x: -560, y: -320, rot: 0.3, fire });
    },
    // 4 · the hearth and the bellows
    (g, F) => {
        g.fillStyle = '#1c1416';
        g.fillRect(-800, -450, 1600, 900);
        const fire = { x: -100, y: 60, z: 60, c: F.FIRE, r0: 900 };
        const fill = { dir: [0.2, -0.3, 1], c: [0.22, 0.12, 0.08] };
        F.smoke(g, { x: -100, y: 0, h: 600, w: 300 });
        F.hearth(g, { x: -100, y: 140, fire, lights: [fill] });
        F.bellows(g, { x: -560, y: 40, s: 0.8, fire, lights: [fill] });
        F.anvil(g, { x: 480, y: 170, s: 0.8, fire, seed: 'an' });
    },
    // 5 · wares of the cave on the whitewash
    (g, F) => {
        g.fillStyle = '#4a3630';
        g.fillRect(-800, -450, 1600, 900);
        const fire = { x: -100, y: 600, z: 300, c: F.FIRE, r0: 1000 };
        const fill = { dir: [0.2, 0.3, 1], c: [0.16, 0.09, 0.06] };
        F.plate(g, { x: -600, y: -150, r: 110, fire, lights: [fill], seed: 'p1' });
        F.plate(g, { x: -600, y: 160, r: 90, fire, lights: [fill], seed: 'p2', motif: 'bird' });
        F.cauldron(g, { x: -200, y: 80, w: 300, fire, lights: [fill] });
        F.warmer(g, { x: 220, y: 300, r: 100, hlen: 480, fire, lights: [fill] });
        F.tin(g, { x: 520, y: -300, s: 1.4, fire, lights: [fill] });
    },
    // 6 · the mouth: bridle, cage, prickly pear, agave (fire from the left, moon from behind)
    (g, F) => {
        g.fillStyle = '#1a1c2a';
        g.fillRect(-800, -450, 1600, 900);
        const fire = { x: -900, y: 200, z: 500, c: F.FIRE, r0: 1000 };
        const moon = { dir: [0.3, -0.2, -0.9], c: F.MOON };
        F.bridle(g, { x: -500, y: -380, fire, moon });
        F.cage(g, { x: -150, y: -200, s: 1.4, fire, moon });
        F.chumbera(g, { x: 200, y: 440, h: 520, fire: { ...fire, c: [0.5, 0.3, 0.15] }, moon });
        F.agave(g, { x: 560, y: 430, s: 0.9, moon, stalk: 700, fire: { ...fire, c: [0.3, 0.18, 0.1] } });
    },
    // 7 · outside: an olive, the owl, the wisp, under the moon behind
    (g, F) => {
        g.fillStyle = '#121a30';
        g.fillRect(-800, -450, 1600, 900);
        const moon = { x: 0, y: -100, z: -1100, c: [1.3, 1.45, 1.8], r0: 1e9 };
        const sky = { dir: [0, -1, 0.4], c: [0.08, 0.1, 0.16] };
        F.oliveTree(g, { x: -380, y: 440, h: 760, moon, lights: [sky], seed: 'o1', lean: 0.3, shadowLen: 300 });
        F.owl(g, { x: 260, y: 40, s: 1.6, moon, lights: [sky, { x: 0, y: 0, z: 900, c: [0.35, 0.18, 0.08], r0: 1e9 }] });
        F.wisp(g, { x: 450, y: 300, r: 22 });
    },
];
Motion.scene({
    fps: 24, duration: PAGES.length + 12, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DIR + 'things/forge.js', DIR + 'tableaux/forge.js'],
    setup() {
        return { pages: [] };
    },
    draw(g, t, env) {
        const p = Math.floor(t + 1e-6);
        if (p >= PAGES.length && !env.state.pages[p]) {
            // the picture's sheets one by one, whole (scale 0.6), on a grey that shows their holes
            const ly = Tableau.forge(0)[p - PAGES.length];
            const c = document.createElement('canvas');
            c.width = env.px[0];
            c.height = env.px[1];
            const q = c.getContext('2d');
            q.fillStyle = '#556';
            q.fillRect(0, 0, c.width, c.height);
            const k = env.k * 0.6;
            q.setTransform(k, 0, 0, k, (env.W * env.k) / 2, (env.H * env.k) / 2);
            const t0 = performance.now();
            if (ly) ly.paint(q, k);
            console.log('sheet', ly && ly.id, ((performance.now() - t0) / 1000).toFixed(2), 's');
            env.state.pages[p] = c;
        }
        if (!env.state.pages[p]) {
            const c = document.createElement('canvas');
            c.width = env.px[0];
            c.height = env.px[1];
            const q = c.getContext('2d');
            q.setTransform(env.k, 0, 0, env.k, env.W * env.k / 2, env.H * env.k / 2);
            const t0 = performance.now();
            PAGES[p](q, Forge);
            console.log('page', p, ((performance.now() - t0) / 1000).toFixed(2), 's');
            env.state.pages[p] = c;
        }
        g.drawImage(env.state.pages[p], 0, 0, env.W, env.H);
    },
});
