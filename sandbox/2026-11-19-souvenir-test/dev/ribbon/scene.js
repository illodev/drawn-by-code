// Dev sheet for things/ribbon.js: the motto ribbon, the key and the horseshoe on the
// emblem's indigo ground, at film size (second 0) and in close-ups (one page per second).
// Seconds 0–12 go through the lens finish; 13–25 are the same pages as raw paint.
const SV = 'sandbox/2026-11-19-souvenir-test/';
Motion.scene({
    fps: 24, duration: 26, logical: [1600, 900],
    uses: ['styles/souvenir/souvenir.js', SV + 'things/ribbon.js'],
    fonts: [{ family: 'IM Fell DW Pica SC', src: 'fonts/IMFellDWPicaSC-Regular.ttf' }],
    draw(g, t, env) {
        const S = Souvenir;
        // [centre x, centre y, zoom]
        const pages = [
            [800, 450, 1], // 0 · everything at film size
            [1120, 665, 2], // 1 · the right fold with its back face
            [800, 652, 2], // 2 · the lettering
            [250, 262, 2], // 3 · the key's bow
            [404, 176, 2], // 4 · the key's bit
            [1290, 170, 2], // 5 · the horseshoe
            [480, 665, 2], // 6 · the left fold
            [800, 392, 2], // 7 · the long motto's lettering
            [237, 267, 4], // 8 · the key's bow, closer
            [420, 165, 4], // 9 · the key's bit, closer
            [1290, 170, 4], // 10 · the horseshoe, closer
            [1130, 680, 4], // 11 · the right fold, closer
            [470, 680, 4], // 12 · the left fold, closer
        ];
        const [cx, cy, z] = pages[Math.floor(t + 1e-6) % pages.length];
        g.fillStyle = '#232749';
        g.fillRect(0, 0, 1600, 900);
        g.save();
        g.translate(800, 450);
        g.scale(z, z);
        g.translate(-cx, -cy);
        const a = Ribbon.draw(g, { x: 800, y: 640, s: 1 });
        const b = Ribbon.draw(g, { x: 800, y: 380, s: 1, text: 'VERDE QUE TE QUIERO VERDE', seed: 'verde' });
        Ribbon.key(g, { x: 320, y: 210, rot: -0.6 });
        Ribbon.horseshoe(g, { x: 1290, y: 170 });
        g.restore();
        S.tooth(g, { x: 0, y: 0, w: 1600, h: 900 });
        // what the fit chose
        g.fillStyle = 'rgba(255,255,255,0.4)';
        g.font = '13px monospace';
        g.fillText(`motto: cap ${a.capH.toFixed(1)} (${((a.capH / 96) * 100).toFixed(0)} %) spacing ${a.spacing.toFixed(3)} em · long: cap ${b.capH.toFixed(1)} spacing ${b.spacing.toFixed(3)} em`, 20, 885);
    },
    post(ctx, t, env) {
        if (t < 13) Souvenir.finish(ctx, env, 0);
    },
});
