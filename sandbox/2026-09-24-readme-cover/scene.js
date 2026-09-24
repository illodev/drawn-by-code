// 2026-09-24-readme-cover · the README's cover, drawn by the repo's own kits. A ransom-note
// title («drawn by code»: every letter on its own torn-paper tile) is being assembled: the
// tiles drop in on twos, a hand (PaperDetail, pose 'hold', her right hand) brings the last
// one, a marker underlines it. Below, six polaroids pinned on the desk, each painted live by
// one style's kit: paper cutout, 70s poster, liquid light, kaleidoscope, line, clay 3D.
// The last frame is the still cover (render/cover.png); the whole is a short loop.
const W = 1800, H = 680;
const COVER_TILES = (() => {
    const words = [['d', 'r', 'a', 'w', 'n'], ['c', 'o', 'd', 'e']];
    const TW = 128, GAP = 14, BY = 170;
    const total = 5 * TW + 4 * GAP + BY + 4 * TW + 3 * GAP;
    let x = (W - total) / 2 + TW / 2;
    const tiles = [];
    const cols = [['#f2643c', '#fff6e8'], ['#e9b949', '#33306e'], ['#6cc9a1', '#2a1826'], ['#33306e', '#f4ecda'], ['#f4eddd', '#d9412f'], ['#b98ad0', '#fff6e8'], ['#d9412f', '#f4ecda'], ['#389486', '#fff6e8'], ['#f7d2bd', '#33306e']];
    const fonts = ['Shrikhand', 'Stack', 'Hand'];
    const r = Motion.rng('cover-tiles');
    words.forEach((w, wi) => {
        w.forEach((ch) => {
            const i = tiles.length;
            tiles.push({ ch, x, y: 232 + (r() - 0.5) * 18, rot: (r() - 0.5) * 0.16, col: cols[i % cols.length], font: fonts[i % 3], i });
            x += TW + GAP;
        });
        if (wi === 0) x += BY - GAP;
    });
    return { tiles, TW, TH: 148, byX: (W - total) / 2 + 5 * TW + 4 * GAP + BY / 2 };
})();
const CARDS = ['paper cutout', '70s poster', 'liquid light', 'kaleidoscope', 'line', 'clay 3D'];

Motion.scene({
    fps: 24,
    duration: 3,
    logical: [W, H],
    uses: [
        'styles/paper-cutout/paper.js', 'styles/paper-cutout/kit.js', 'styles/paper-cutout/detail.js',
        'styles/70s-poster/kit.js', 'styles/liquid-light/kit.js', 'styles/kaleidoscope/kit.js', 'styles/line/kit.js',
        'styles/clay3d/clay3d.js', 'sandbox/2026-09-24-clay3d-test/set.js',
    ],
    fonts: [
        { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' },
        { family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' },
        { family: 'Stack', src: 'fonts/ShortStack-latin.woff2' },
    ],
    bpm: 120,
    shots: [[0, 3, 'Cover']],

    setup(env) {
        return { kit: PaperKit.make(env, { font: 'Hand' }), cards: null };
    },
    draw(g, t, env) {
        const { kit } = env.state, P = Paper, E = Ease, tq = Math.floor(t * 12 + 1e-6) / 12;
        kit.paperBg(g, 'cover-desk', '#efe3cc', { bleed: 60 });
        if (!env.state.cards) env.state.cards = CARDS.map((name, i) => cardImage(i, env));
        // the polaroids, pinned on the desk (dropped in on twos, 0.0–0.5)
        CARDS.forEach((name, i) => {
            const at = i / 12;
            if (tq < at) return;
            const r = Motion.rng('card' + i), x = 150 + i * 300, y = 562, rot = (r() - 0.5) * 0.12;
            const s = tq - at < 1 / 12 ? 1.06 : 1;
            polaroid(g, env, i, name, x, y, rot, s);
        });
        // the title's tiles drop in one per drawing (0.5–1.2); the last one comes in a hand
        const { tiles, TW, TH } = COVER_TILES;
        tiles.forEach((tl, i) => {
            if (i === tiles.length - 1) return;
            const at = 0.5 + i / 12;
            if (tq < at) return;
            const land = tq - at < 1 / 12 ? [1.08, 0.9] : [1, 1];
            tile(g, env, tl, tl.x, tl.y, tl.rot, land);
        });
        kit.hand(g, 'by', COVER_TILES.byX, 262, 78, '#2a1826', { align: 'center', p: E.seg(tq, 1.0, 1.25) });
        // the underline, in marker (1.9–2.4)
        const u = E.seg(tq, 1.9, 2.4);
        if (u > 0) {
            const x0 = tiles[0].x - TW / 2 - 10, x1 = tiles[tiles.length - 1].x + TW / 2 + 10;
            P.markerStroke(g, [[x0, 336], [x0 + (x1 - x0) * u * 0.5, 342], [x0 + (x1 - x0) * u, 334]], '#f2643c', 13, 'cover-under', 0.9);
        }
        kit.hand(g, 'animation made with code by Claude, and every lesson it learned, in the open', W / 2, 414, 34, '#4b3a4a', { align: 'center', p: E.seg(tq, 2.0, 2.6) });
        // the hand with the last tile: in from the top right (1.2–1.8), placing it (1.8–2.2),
        // holding it just above its slot for the still
        const last = tiles[tiles.length - 1];
        const k = E.inOut(E.seg(tq, 1.2, 2.2));
        const tx = E.lerp(1880, last.x + 6, k), ty = E.lerp(-160, last.y - 34, k), trot = E.lerp(0.5, last.rot + 0.1, k);
        heldTile(g, env, last, tx, ty, trot);
    },
    post(ctx, t, env) {
        env.state.kit.grainPost(ctx);
    },
});

// a letter tile: torn paper in its colour, the letter in its font (a second, offset ink pass)
function tile(g, env, tl, x, y, rot, [sx, sy] = [1, 1]) {
    const { TW, TH } = COVER_TILES, kit = env.state.kit;
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    g.scale(sx, sy);
    kit.sprite('cover-tile' + tl.i, { x: -TW / 2 - 12, y: -TH / 2 - 12, w: TW + 24, h: TH + 24 }, (c) => {
        Paper.cutout(c, Paper.roundRect(-TW / 2, -TH / 2, TW, TH, 6), tl.col[0], 'ctile' + tl.i, { border: 3, shadow: 0.28, jag: 0.9 });
        c.font = `${tl.font === 'Stack' ? 700 : 400} ${tl.font === 'Hand' ? 132 : 104}px "${tl.font}"`;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillStyle = tl.col[1];
        c.globalAlpha = 0.95;
        c.fillText(tl.ch, 0, tl.font === 'Shrikhand' ? 6 : 2);
        c.globalAlpha = 0.25;
        c.fillText(tl.ch, 3, tl.font === 'Shrikhand' ? 8 : 4);
    }, 1.6).draw(g);
    g.restore();
}

// her right hand holding a tile by its top edge: the four fingers over its face, the thumb
// behind it (PaperDetail 'wrap': thumb = part back, palm and fingers = part front), the
// forearm going off to the top right
function heldTile(g, env, tl, x, y, rot) {
    const D = PaperDetail, S = 90, hr = Math.PI - 0.3 + rot;
    // the wrist a little above the middle of the tile's top edge: the fingers hang over it
    const top = COVER_TILES.TH / 2, d = top + 54;
    const wx = x + d * Math.sin(rot) - 4, wy = y - d * Math.cos(rot);
    const fa = hr + Math.PI / 2; // local +y: from the wrist back up the forearm
    env.state.kit.sprite('cover-sleeve', { x: -20, y: -70, w: 760, h: 140 }, (c) => {
        Paper.cutout(c, Paper.roundRect(0, -58, 720, 116, 40), '#33306e', 'coversleeve', { border: 3, shadow: 0.22, inner: (cc, box) => D.knit(cc, box, '#33306e', { seed: 'coverknit', size: 22, alpha: 0.18 }) });
    }, 1.2).draw((g.save(), g.translate(wx + Math.cos(fa) * 30, wy + Math.sin(fa) * 30), g.rotate(fa), g));
    g.restore();
    D.hand(g, wx, wy, S, hr, 'wrap', { side: 'right', cuff: '#f4ecda', part: 'back' });
    tile(g, env, tl, x, y, rot);
    D.hand(g, wx, wy, S, hr, 'wrap', { side: 'right', cuff: '#f4ecda', part: 'front' });
}

// a polaroid: cream frame, the style's picture, a handwritten label, a strip of tape
function polaroid(g, env, i, name, x, y, rot, s) {
    const kit = env.state.kit, PW = 236, PH = 133, FW = 258, FH = 196;
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    g.scale(s, s);
    kit.sprite('cover-pola', { x: -FW / 2 - 10, y: -FH / 2 - 10, w: FW + 20, h: FH + 20 }, (c) => {
        Paper.cutout(c, Paper.roundRect(-FW / 2, -FH / 2, FW, FH, 4), '#fbf6ec', 'coverpola', { border: 0, shadow: 0.3, jag: 0.5, tex: { alpha: [0.1, 0.2] } });
    }, 1.4).draw(g);
    g.drawImage(env.state.cards[i], -PW / 2, -FH / 2 + 11, PW, PH);
    g.strokeStyle = 'rgba(0,0,0,0.12)';
    g.lineWidth = 1.2;
    g.strokeRect(-PW / 2, -FH / 2 + 11, PW, PH);
    kit.hand(g, name, 0, FH / 2 - 16, 30, '#33306e', { align: 'center' });
    kit.sprite('cover-tape' + (i % 3), { x: -52, y: -18, w: 104, h: 36 }, (c) => {
        Paper.cutout(c, Paper.roundRect(-46, -12, 92, 24, 2), '#f3e3a8', 'covertape' + (i % 3), { border: 0, shadow: 0.1, jag: 1.4, tex: { alpha: [0.1, 0.25] } });
    }, 1.4).draw((g.save(), g.translate(0, -FH / 2 - 2), g.rotate((i % 2 ? 1 : -1) * 0.08), g.globalAlpha = 0.85, g));
    g.restore();
    g.restore();
}

// each card is the style's own kit painting a frame on its own canvas (a 1600 × 900 scene)
function cardImage(i, env) {
    const c = document.createElement('canvas');
    c.width = Math.round(236 * env.k * 2);
    c.height = Math.round(133 * env.k * 2);
    const x = c.getContext('2d'), s = c.width / 1600;
    const fenv = { W: 1600, H: 900, k: s, px: [c.width, c.height], fps: 24, duration: 4, state: {} };
    x.scale(s, s);
    const E = Ease;
    if (i === 0) {
        // a lined sheet with a handwritten title, a paper sun, a waving hand
        const pk = PaperKit.make(fenv, { font: 'Hand' }), C = pk.COL;
        pk.paperBg(x, 'cardpaper', '#f0c64e');
        x.save();
        x.translate(1250, 230);
        pk.sprite('card-sun', { x: -190, y: -190, w: 380, h: 380 }, (cc) => {
            for (let j = 0; j < 12; j++) { const a = (j / 12) * Math.PI * 2; Paper.cutout(cc, [[Math.cos(a - 0.12) * 110, Math.sin(a - 0.12) * 110], [Math.cos(a) * 180, Math.sin(a) * 180], [Math.cos(a + 0.12) * 110, Math.sin(a + 0.12) * 110]], C.orange, 'ray' + j, { border: 2.6 }); }
            Paper.cutout(cc, Paper.ellipse(0, 0, 120, 120), C.red, 'sunb', { border: 3 });
        }).draw(x);
        x.restore();
        pk.sheet(x, 650, 470, 760, 520, -0.05, 'cardsheet', { lined: true });
        x.save();
        x.translate(650, 470);
        x.rotate(-0.05);
        pk.hand(x, 'hello, paper!', -300, -40, 110, C.textInk);
        Paper.markerStroke(x, [[-300, 0], [180, 8]], C.orange, 12, 'cardul', 0.9);
        x.restore();
        PaperDetail.hand(x, 1250, 860, 190, -0.25, 'wave', { side: 'right', cuff: '#389486', sleeve: '#2d7a6e' });
    } else if (i === 1) {
        const P = Groovy.PAL.acid, t = 2.2;
        Groovy.sunburst(x, fenv, 800, 470, 24, t * 0.25, [P.c[0], P.c[4]]);
        Groovy.rings(x, 800, 470, 6, 55, t, [P.c[1], P.c[5], P.c[2], P.c[3]]);
        Groovy.shape(x, Groovy.wavy(Groovy.ellipse(800, 470, 170, 150, 96), 12, 6, t * 3), P.c[2], { ink: P.ink, width: 7, echoes: [P.c[1], P.c[3]], echoStep: 9 });
        Groovy.melt(x, fenv, 'GROOVY', 800, 200, 150, { t, melt: 0.3, wave: 8, fill: P.c[4], echo: P.c[1], ink: P.ink });
    } else if (i === 2) {
        Liquid.field(x, fenv, Liquid.drift('plantilla', 9, 1.6, fenv, { rMin: 70, rMax: 150, speed: 0.35 }), { hueShift: 40 });
    } else if (i === 3) {
        const t = 1.2, cols = ['#ff2e88', '#ffd23f', '#18d6c4', '#7a2cff', '#c6ff2e'];
        x.fillStyle = '#12051f';
        x.fillRect(0, 0, 1600, 900);
        Kaleido.draw(x, fenv, {
            n: 8, rot: t * 0.5, hue: t * 40, scale: 1,
            source: (sc) => {
                const r = Motion.rng('piezas');
                for (let j = 0; j < 26; j++) {
                    const a = r() * 0.8, d = ((r() * 600 + t * 120) % 650) + 20;
                    sc.fillStyle = cols[j % cols.length];
                    sc.beginPath();
                    sc.ellipse(800 + Math.cos(a) * d, 450 + Math.sin(a) * d, 18 + r() * 40, 10 + r() * 20, a + t, 0, Math.PI * 2);
                    sc.fill();
                }
            },
        });
        Kaleido.beads(x, 800, 450, 90, 16, 8, t, cols);
    } else if (i === 4) {
        const L = LineArt, t = 0.5, hop = Math.abs(Math.sin(t * Math.PI)) * 120, px = 500 + t * 150 + 250, py = 720 - hop;
        L.paper(x, fenv);
        L.stroke(x, [[200, 720], [1400, 720]], { t, seed: 'suelo', width: 5 });
        L.stroke(x, L.circle(px, py - 230, 60), { t, seed: 'cabeza', width: 7, closed: true });
        L.stroke(x, [[px, py - 170], [px, py - 70]], { t, seed: 'cuerpo', width: 7 });
        L.stroke(x, [[px, py - 70], [px - 30, py]], { t, seed: 'piernaI', width: 7 });
        L.stroke(x, [[px, py - 70], [px + 30, py]], { t, seed: 'piernaD', width: 7 });
        L.stroke(x, [[px - 60, py - 150], [px, py - 140], [px + 60, py - 170]], { t, seed: 'brazos', width: 7 });
        L.stroke(x, L.circle(1250, 200, 70), { t, seed: 'sol', width: 6, closed: true });
        for (let j = 0; j < 8; j++) { const an = (j / 8) * Math.PI * 2; L.stroke(x, [[1250 + Math.cos(an) * 95, 200 + Math.sin(an) * 95], [1250 + Math.cos(an) * 135, 200 + Math.sin(an) * 135]], { t, seed: 'ray' + j, width: 5 }); }
        L.stroke(x, [[200, 250], [260, 215], [330, 225], [370, 190], [440, 205], [470, 250], [200, 250]], { t, seed: 'nube', width: 5 });
        for (const hx of [260, 420, 1100, 1300]) L.stroke(x, [[hx, 720], [hx - 12, 690], [hx, 700], [hx + 12, 688], [hx + 4, 720]], { t, seed: 'hierba' + hx, width: 4 });
        L.stroke(x, [[px + 60, py - 170], [px + 130, py - 330]], { t, seed: 'cuerda', width: 3 });
        L.stroke(x, L.circle(px + 150, py - 400, 70), { t, seed: 'globo', width: 6, closed: true });
    } else {
        // Laura as a clay puppet, waving (the clay3d-test pose at 1.75 s)
        const R = Clay3D.renderer(fenv, { scene: SET_GLSL, scale: 1 });
        const up = 1, wave = Math.sin(0.5 * Math.PI * 4) * 0.35;
        const a = [0, 0, 0, 1, 0.06, 1, -0.48, 1.06, 0.1, -0.6, 1.3, 0.2, 0, 0, wave, 0, 0.5, 0.78, 0.05, 0.55, 0.5, 0.12, 0, 0, Math.PI, 0, 0, 0];
        a[95] = 0;
        R.render(x, 0, { a, cam: [0, 1.3, 5.4], target: [0, 1.3, 0], fov: 0.36, focus: 5.4, aperture: 0.06, light: [-0.6, 0.7, 0.75], soft: 8, fill: 0.55, key: 1.9 });
    }
    return c;
}
