// Paint cost of each layer of the «planes» stratum at the render's size (the rig's canvasOf: paint and
// brushwork), logged to the console. One frame.
const DIR = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 24,
    duration: 1 / 24,
    logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', DIR + 'things/guitar.js', DIR + 'things/charms.js', DIR + 'things/planes.js', DIR + 'tableaux/planes.js'],
    fonts: [{ family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }, { family: 'Anton', src: 'fonts/Anton-latin.woff2' }, { family: 'Lora', src: 'fonts/Lora-Medium-latin.woff2' }],
    setup(env) {
        const layers = Tableau.planes.stratum(2000);
        return { layers, rig: Souvenir.rig(env, layers) };
    },
    draw(g, t, env) {
        let total = 0;
        for (const ly of env.state.layers) {
            const t0 = performance.now();
            env.state.rig.canvasOf(ly);
            const ms = performance.now() - t0;
            total += ms;
            console.log(`cost ${ly.id} ${(ms / 1000).toFixed(2)} s`);
        }
        console.log(`cost total ${(total / 1000).toFixed(2)} s`);
        g.fillStyle = '#333';
        g.fillRect(0, 0, env.W, env.H);
    },
});
