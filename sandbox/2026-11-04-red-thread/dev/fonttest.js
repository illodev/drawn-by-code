Motion.scene({ fps: 24, duration: 1, logical: [1600, 900], fonts: [{ family: 'Brush', src: 'fonts/YujiSyuku-subset.ttf' }, { family: 'Kaushan', src: 'fonts/KaushanScript-Regular.ttf' }],
  draw(g) { g.fillStyle = '#fff'; g.fillRect(0, 0, 1600, 900); g.fillStyle = '#000';
    g.font = '160px Brush'; g.fillText('El hilo rojo 赤い糸', 60, 250);
    g.font = '160px Kaushan'; g.fillText('El hilo rojo', 60, 520);
    g.font = '80px Kaushan'; g.fillText('Antes de ser bandos, fuimos vecinos.', 60, 750); } });
