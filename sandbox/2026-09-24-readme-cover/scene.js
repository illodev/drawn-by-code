// 2026-09-24-readme-cover · the README's cover, drawn by the repo's own kits. A ransom-note
// title («drawn by code»: every letter on its own torn-paper tile) is being assembled: the
// tiles drop in on twos, a hand (PaperDetail, pose 'hold', her right hand) brings the last
// one, a marker underlines it. Below, a carousel of polaroids that loops, one per style,
// each painted by that style's own template (STYLES: a new style adds one line there).
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
// The carousel: one polaroid per style. [label, style folder, second of its template to
// show, the template's kits]; 'paint' instead of a folder draws a custom picture.
const STYLES = [
    ['paper cutout', 'paint:paper', 0, []],
    ['70s poster', '70s-poster', 2.2, ['styles/70s-poster/kit.js']],
    ['liquid light', 'liquid-light', 1.6, ['styles/liquid-light/kit.js']],
    ['kaleidoscope', 'kaleidoscope', 1.2, ['styles/kaleidoscope/kit.js']],
    ['line', 'line', 1.0, ['styles/line/kit.js']],
    ['clay', 'clay', 3.0, ['styles/clay/clay.js']],
    ['clay 3D', 'paint:clay3d', 0, ['styles/clay3d/clay3d.js', 'sandbox/2026-09-24-clay3d-test/set.js']],
    ['risograph', 'risograph', 2.5, ['styles/risograph/riso.js']],
    ['pixel art', 'pixel-art', 3.2, ['styles/pixel-art/pixel.js']],
];
const TEMPLATE_DIRS = STYLES.filter(([, d]) => !d.startsWith('paint:')).map(([, d]) => d);
const CAROUSEL = { gap: 300, speed: 160 }; // units between polaroids; units per second (on twos)

Motion.scene({
    fps: 24,
    duration: 6,
    logical: [W, H],
    uses: [
        'styles/paper-cutout/paper.js', 'styles/paper-cutout/kit.js', 'styles/paper-cutout/detail.js',
        ...[...new Set(STYLES.flatMap(([, , , u]) => u))],
        'sandbox/2026-09-24-readme-cover/capture.js',
        ...TEMPLATE_DIRS.map((d) => `styles/${d}/template.js`),
    ],
    fonts: [
        { family: 'Hand', src: 'fonts/PatrickHand-Regular.ttf' },
        { family: 'Shrikhand', src: 'fonts/Shrikhand-latin.woff2' },
        { family: 'Stack', src: 'fonts/ShortStack-latin.woff2' },
    ],
    bpm: 120,
    shots: [[0, 6, 'Cover']],

    setup(env) {
        return { kit: PaperKit.make(env, { font: 'Hand' }), cards: null };
    },
    draw(g, t, env) {
        const { kit } = env.state, P = Paper, E = Ease, tq = Math.floor(t * 12 + 1e-6) / 12;
        kit.paperBg(g, 'cover-desk', '#efe3cc', { bleed: 60 });
        if (!env.state.cards) env.state.cards = STYLES.map((st, i) => cardImage(st, env));
        // the carousel: the polaroids drop in on twos (0.0–0.5), then slide left in a loop
        const L = STYLES.length * CAROUSEL.gap;
        STYLES.forEach(([name], i) => {
            const at = i / 12;
            if (tq < at) return;
            const x = ((((i * CAROUSEL.gap - CAROUSEL.speed * tq) % L) + L) % L) + 150;
            const xx = x > W + 150 ? x - L : x;
            if (xx < -160 || xx > W + 160) return;
            const r = Motion.rng('card' + i), y = 562, rot = (r() - 0.5) * 0.12;
            const s = tq - at < 1 / 12 ? 1.06 : 1;
            polaroid(g, env, i, name, xx, y, rot, s);
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

// each polaroid's picture: the style's template painted at its chosen second on its own
// canvas (its setup, draw and post, with a small env), cropped to 16:9 at the centre; or a
// custom painting ('paint:…')
function cardImage([label, dir, at], env) {
    const c = document.createElement('canvas');
    c.width = Math.round(236 * env.k * 2);
    c.height = Math.round(133 * env.k * 2);
    const x = c.getContext('2d');
    if (dir.startsWith('paint:')) {
        const s = c.width / 1600;
        const fenv = { W: 1600, H: 900, k: s, px: [c.width, c.height], fps: 24, duration: 4, state: {} };
        x.scale(s, s);
        PAINT[dir.slice(6)](x, fenv);
        return c;
    }
    const d = TEMPLATES[TEMPLATE_DIRS.indexOf(dir)];
    const [TW, TH] = d.logical ?? [1600, 900];
    // the template's own frame, then its centre crop into the polaroid
    const cw = c.width, chgt = Math.round((cw * TH) / TW) >= c.height ? Math.round((cw * TH) / TW) : c.height;
    const fw = Math.round((chgt * TW) / TH), fh = chgt;
    const f = document.createElement('canvas');
    f.width = fw;
    f.height = fh;
    const fx = f.getContext('2d'), k = fw / TW;
    const fenv = { W: TW, H: TH, k, px: [fw, fh], fps: d.fps ?? 24, duration: d.duration ?? 4, state: {} };
    fenv.state = d.setup ? d.setup(fenv) ?? {} : {};
    fx.setTransform(k, 0, 0, k, 0, 0);
    d.draw(fx, at, fenv);
    fx.setTransform(1, 0, 0, 1, 0, 0);
    if (d.post) d.post(fx, at, fenv);
    x.drawImage(f, (fw - cw) / 2, (fh - c.height) / 2, cw, c.height, 0, 0, cw, c.height);
    return c;
}
const PAINT = {
    // a lined sheet with a handwritten title, a paper sun, a waving hand
    paper(x, fenv) {
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
    },
    // Laura as a clay puppet, waving (the clay3d-test pose at 1.75 s)
    clay3d(x, fenv) {
        const R = Clay3D.renderer(fenv, { scene: SET_GLSL, scale: 1 });
        const wave = Math.sin(0.5 * Math.PI * 4) * 0.35;
        const a = [0, 0, 0, 1, 0.06, 1, -0.48, 1.06, 0.1, -0.6, 1.3, 0.2, 0, 0, wave, 0, 0.5, 0.78, 0.05, 0.55, 0.5, 0.12, 0, 0, Math.PI, 0, 0, 0];
        a[95] = 0;
        R.render(x, 0, { a, cam: [0, 1.3, 5.4], target: [0, 1.3, 0], fov: 0.36, focus: 5.4, aperture: 0.06, light: [-0.6, 0.7, 0.75], soft: 8, fill: 0.55, key: 1.9 });
    },
};
