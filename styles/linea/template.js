// Plantilla del estilo línea: un garabato que tiembla en doses y salta.
Motion.scene({
    fps: 24,
    duration: 4,
    logical: [1600, 900],
    uses: ['styles/linea/kit.js'],
    bpm: 120,
    shots: [[0, 4, 'Plantilla']],

    draw(g, t, env) {
        const L = Linea, E = Ease;
        L.paper(g, env);
        L.stroke(g, [[200, 720], [1400, 720]], { t, seed: 'suelo', width: 4 });
        const hop = Math.abs(Math.sin(t * Math.PI)) * 120;
        const x = 500 + t * 150, y = 720 - hop;
        L.stroke(g, L.circle(x, y - 230, 60), { t, seed: 'cabeza', width: 6, closed: true });
        L.stroke(g, [[x, y - 170], [x, y - 70]], { t, seed: 'cuerpo', width: 6 });
        L.stroke(g, [[x, y - 70], [x - 30, y]], { t, seed: 'piernaI', width: 6 });
        L.stroke(g, [[x, y - 70], [x + 30, y]], { t, seed: 'piernaD', width: 6 });
        L.stroke(g, [[x - 60, y - 150], [x, y - 140], [x + 60, y - 170]], { t, seed: 'brazos', width: 6 });
        for (const dx of [-20, 20]) {
            g.fillStyle = L.INK;
            g.beginPath();
            g.arc(x + dx, y - 240, 6, 0, Math.PI * 2);
            g.fill();
        }
    },
});
