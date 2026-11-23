// Determinism probe: paint every loose piece twice in two fresh rigs and compare pixels.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 24,
    duration: 1 / 24,
    logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DIR + 'things/guitar.js', DIR + 'things/charms.js', DIR + 'things/planes.js', DIR + 'tableaux/planes.js'],
    fonts: [{ family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }, { family: 'Anton', src: 'fonts/Anton-latin.woff2' }, { family: 'Lora', src: 'fonts/Lora-Medium-latin.woff2' }],
    setup(env) {
        return {};
    },
    draw(g, t, env) {
        const sum = (c) => {
            const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
            let h = 0;
            for (let i = 0; i < d.length; i += 7) h = (h * 31 + d[i]) >>> 0;
            return h + ':' + c.width + 'x' + c.height;
        };
        const A = Tableau.planes.loose(2000), B = Tableau.planes.loose(2000).reverse();
        const ra = Souvenir.rig(env, A), rb = Souvenir.rig(env, B);
        const ha = new Map();
        for (const ly of A) ha.set(ly.id, sum(ra.canvasOf(ly)));
        let bad = 0;
        for (const ly of B) {
            const h = sum(rb.canvasOf(ly));
            if (h !== ha.get(ly.id)) {
                bad++;
                console.log('det differs ' + ly.id + ' ' + ha.get(ly.id) + ' vs ' + h);
            }
        }
        console.log('det done, differing: ' + bad);
        g.fillStyle = '#333';
        g.fillRect(0, 0, env.W, env.H);
    },
});
