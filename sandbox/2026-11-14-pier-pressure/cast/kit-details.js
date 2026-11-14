// pier-pressure · Kit's details authored by hand, on top of the drawing measured from her
// sheet (cast/kit-drawn.js). The sheet is 1280 × 720: what is a pixel wide on it (the plaster's
// outline, its seams, its dots) cannot be measured, so it is drawn here, in each pose's own
// coordinates, after the sheet at 14× with a grid. Load after kit-drawn.js.
(() => {
    const PLASTER = '#e0b183', SEAM = '#8f6238';
    const dotAt = (L, x, y) => L([[x, y], [x + 0.1, y]], 1.2, 0, SEAM);
    // the plaster across the bridge of her nose: a band, its outline, the pad's two seams, the dots
    Drawn.add('kit', 'stand', (part, S, L) => {
        part('head');
        const band = [[212.5, 181], [214, 176.5], [219, 173], [226, 172], [233, 173.5], [239, 177], [241.5, 181.5], [239.5, 185], [235, 184.5], [230, 181.5], [224, 180], [218.5, 180.5], [215.5, 183.5], [213, 184]];
        S(PLASTER, band);
        L(band, 1, 1, SEAM);
        L([[221.8, 172.8], [222.4, 176.5], [222, 180]], 0.9, 0, SEAM);
        L([[229.8, 172.9], [230.2, 177], [229.6, 181.2]], 0.9, 0, SEAM);
        for (const [x, y] of [[217, 177.6], [216.4, 180.4], [234.6, 176.6], [236.6, 180.4]]) dotAt(L, x, y);
    });
    Drawn.add('kit', 'jump', (part, S, L) => {
        part('head');
        const band = [[303, 190.5], [309, 186.5], [317, 185.3], [324, 186.8], [327.6, 190.5], [326.5, 194], [322.5, 193.2], [317.5, 190.6], [313, 192.5], [309.5, 197], [307, 203], [304, 207.6], [300.6, 207], [299.6, 202], [301, 195.5]];
        S(PLASTER, band);
        L(band, 1, 1, SEAM);
        L([[304.6, 192.4], [307.6, 194.4], [310.4, 197.6]], 0.9, 0, SEAM);
        L([[317.6, 185.8], [319, 188.4], [319.8, 191.6]], 0.9, 0, SEAM);
        for (const [x, y] of [[303.6, 201.4], [302.4, 204.6], [313, 188.6], [323.4, 189.6]]) dotAt(L, x, y);
    });
})();
