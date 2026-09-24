// Montage object «octopus» (see ../things.js for the contract).
(() => {
    const P = Paper, E = Ease, C = WL.COL;
    const { place, cut, circleU } = Things.kit;
    Things.octopus = (g, x, y, s, t) => {
        place(g, 'th-octo', { x: -200, y: -220, w: 400, h: 420 }, (c) => {
            for (let k = 0; k < 6; k++) {
                const a = Math.PI * (0.15 + k * 0.14);
                cut(c, P.noodle(P.bezier([Math.cos(a) * 40, 40], [Math.cos(a) * 140, 90], [Math.cos(a) * 200, 150], [Math.cos(a) * 170, 190], 16), 40, 16), '#b58ad6', 'tent' + k, { border: 2 });
            }
            cut(c, P.ellipse(0, -60, 110, 125), '#b58ad6', 'octohead');
            c.fillStyle = '#231a1f';
            c.beginPath();
            c.arc(-38, -40, 12, 0, Math.PI * 2);
            c.arc(38, -40, 12, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = '#e98b87';
            c.beginPath();
            c.ellipse(-60, -10, 16, 11, 0, 0, Math.PI * 2);
            c.ellipse(60, -10, 16, 11, 0, 0, Math.PI * 2);
            c.fill();
        }, x, y, s, Math.sin(t * 6) * 0.04);
    };
})();
