// A check sheet for the loose pieces new in round 8 (cloth, skins, sherds, the garlic), each
// at 1:1 on the dark: node engine/render.mjs …/dev/stilllife-loose/pieces.js --at 0
const DIR = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 24, duration: 1, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DIR + 'things/stilllife.js'],
    draw(g, t, env) {
        const St = Still, S = Souvenir;
        g.fillStyle = '#120d0a';
        g.fillRect(0, 0, 1600, 900);
        const c = [
            ['A', { w: 420, h: 330, a: 0.5, pinch: 0.5, tilt: 0.7, folds: 4, creased: 2, depth: 1.25, mark: true, stain: true, crease: true }, 260, 230],
            ['B', { w: 220, h: 170, a: 2.2, pinch: 0.6, tilt: 0.9, folds: 3, depth: 0.9, hem: true, vainica: true, darn: true }, 620, 180],
            ['C', { w: 260, h: 60, a: -0.9, pinch: 0.1, tilt: 1.1, folds: 2, depth: 0.9, hem: false, vainica: false, fray: true }, 620, 420],
            ['D', { w: 200, h: 150, a: 4, pinch: 0.5, tilt: 0.8, folds: 3, depth: 1, hem: true, fray: true, stain: true }, 300, 560],
        ];
        for (const [k, o, x, y] of c) S.put(g, St.cloth(St.resOf(g), 'chk' + k, o), { x, y });
        for (let i = 0; i < 4; i++) S.put(g, St.garlicSprite(St.resOf(g, 1.6), 'lg' + i, (i * Math.PI) / 4), { x: 860 + i * 110, y: 160, s: 1.6, rot: (i * Math.PI) / 4 });
        for (let i = 0; i < 3; i++) S.put(g, St.skinFlake(St.resOf(g), 'chk' + i, i * 1.3, i ? 'onion' : 'garlic', 90), { x: 880 + i * 120, y: 330, rot: Math.round((i * 1.3) / (Math.PI / 4)) * (Math.PI / 4) });
        for (let i = 0; i < 4; i++) S.put(g, St.sherd(St.resOf(g), 'chk' + i, i * 0.8, i < 2 ? 'white' : 'clay', 110), { x: 880 + i * 130, y: 480, rot: Math.round((i * 0.8) / (Math.PI / 4)) * (Math.PI / 4) });
        St.braid(g, [[860, 640], [1000, 700], [1150, 720], [1300, 690]], { n: 7, s: 1.05, seed: 'chk', plait: true });
        St.match(g, [200, 800], [300, 760]);
    },
});
