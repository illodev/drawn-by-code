// Dev sheet for things/library.js: the books, the palette and the score on the emblem's
// indigo ground. One page per second (render stills with --at 0,1,2,…), raw paint:
//   0  the three at film size (s = 1)        1  the books at 2×
//   2  the palette and the score at 2×       3  4× · spines of the upper pile
//   4  4× · spines of the lower pile         5  4× · the three that stand
//   6  4× · page edges (the pile's left)     7  4× · the paint dabs
//   8  4× · the score                        9  turned: the light must stay at the top left
//   10 film size with tooth and the lens finish
//   11 the four faces: every title, to check the accents
const LIB = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 12, duration: 12, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', LIB + 'things/library.js'],
    fonts: [
        { family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }, { family: 'Lora', src: 'fonts/Lora-Medium-latin.woff2' },
        { family: 'Anton', src: 'fonts/Anton-latin.woff2' }, { family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' },
    ],
    draw(g, t, env) {
        const S = Souvenir, page = Math.floor(t + 1e-6);
        g.fillStyle = '#232749';
        g.fillRect(0, 0, 1600, 900);
        const has = (k) => typeof Library[k] === 'function';
        // a 4× look at the part of a thing about (cx, cy) of its own units
        const zoom = (k, cx, cy, s = 4) => has(k) && Library[k](g, { x: 800 - cx * s, y: 450 - cy * s, s });
        if (page === 0) {
            Library.books(g, { x: 330, y: 450 });
            if (has('palette')) Library.palette(g, { x: 820, y: 330 });
            if (has('score')) Library.score(g, { x: 1250, y: 520 });
        } else if (page === 1) Library.books(g, { x: 800, y: 450, s: 2 });
        else if (page === 2) {
            if (has('palette')) Library.palette(g, { x: 420, y: 450, s: 2 });
            if (has('score')) Library.score(g, { x: 1160, y: 450, s: 2 });
        } else if (page === 3) zoom('books', -40, -95);
        else if (page === 4) zoom('books', -50, 110);
        else if (page === 5) zoom('books', 105, 40);
        else if (page === 6) zoom('books', -120, 20);
        else if (page === 7) zoom('palette', 0, -30);
        else if (page === 8) zoom('score', 0, 0);
        else if (page === 9) {
            Library.books(g, { x: 300, y: 450, rot: 0.35, s: 0.9 });
            Library.books(g, { x: 760, y: 450, rot: -0.5, s: 0.8, seed: 'b' });
            if (has('palette')) Library.palette(g, { x: 1180, y: 250, rot: 0.8 });
            if (has('palette')) Library.palette(g, { x: 1400, y: 620, rot: -2.2, s: 0.8 });
            if (has('score')) Library.score(g, { x: 1120, y: 660, rot: 0.5 });
        } else if (page === 10) {
            Library.books(g, { x: 330, y: 450 });
            if (has('palette')) Library.palette(g, { x: 820, y: 330 });
            if (has('score')) Library.score(g, { x: 1250, y: 520 });
            S.tooth(g, { x: 0, y: 0, w: 1600, h: 900 });
        } else {
            const lines = ['SÉNECA · CARTAS A LUCILIO', 'IBN HAZM · EL COLLAR DE LA PALOMA', 'MAIMÓNIDES · GUÍA DE PERPLEJOS', 'IBN ARABI · EL INTÉRPRETE DE LOS DESEOS', 'S. JUAN DE LA CRUZ · NOCHE OSCURA', 'GÓNGORA · SOLEDADES · BÉCQUER · RIMAS', 'A. MACHADO · J. R. JIMÉNEZ · PLATERO Y YO', 'GARCÍA LORCA · ROMANCERO GITANO', 'R. ALBERTI · MARINERO EN TIERRA · L. CERNUDA · OCNOS', 'M. ZAMBRANO · CLAROS DEL BOSQUE', 'W. IRVING · CUENTOS DE LA ALHAMBRA · EL AMOR BRUJO · M. de Falla'];
            const fonts = ['"IM Fell DW Pica SC"', 'Lora', 'Anton', 'Shrikhand'];
            g.fillStyle = '#f4efe4';
            fonts.forEach((f, i) => {
                g.font = `17px ${f}, monospace`;
                const m = g.measureText('H'), w = g.measureText('MAIMÓNIDES GUÍA').width;
                lines.forEach((l, j) => g.fillText(l, 20 + (i % 2) * 800, 40 + Math.floor(i / 2) * 440 + j * 34));
                g.fillText(`${f}: cap ${(m.actualBoundingBoxAscent / 17).toFixed(3)} em · 15 letters ${(w / 17).toFixed(2)} em`, 20 + (i % 2) * 800, 40 + Math.floor(i / 2) * 440 + 11 * 34);
            });
        }
    },
    post(ctx, t, env) {
        if (Math.floor(t + 1e-6) === 10) Souvenir.finish(ctx, env, 0);
    },
});
