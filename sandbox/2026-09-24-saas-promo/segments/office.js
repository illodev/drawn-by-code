// A freelancer's home office, 1600×900 logical, medium shot (Laura at x ≈ 470, desk edge at
// y ≈ 640). Built to the style's detail bar: every object is several pieces of paper with its
// own texture, and the frame is layered in three depths so nothing reads as an empty field.
//
//   Office.back(g, t, o)   wall (printed wallpaper), window with a view and curtains, full
//                          shelf, cork board, taped print, wall clock, bookcase at the right
//                          edge, the chair back; then the calendar (o.page, o.calendar=false
//                          to leave it out and draw it yourself). Behind Laura.
//   Office.desk(g, t)      the desk and everything on it (lamp and its light, papers, open
//                          notebook, laptop, pen cup, phone, sticky pad, letter tray, books).
//                          In front of Laura's body, behind her arms.
//   Office.front(g, t)     the mug with its steam (nearest the camera), a floor plant at the
//                          left edge and a pencil on a sheet at the bottom-right corner.
//   Office.calendar(g, p)  the wall calendar on page p (a later block turns its pages).
//
// Calm zones kept for the action: the floating invoice (x 830–1130, y 130–530) has only the
// wallpaper and a small taped print behind it; the mailbox sits on the desk at x ≈ 1340.
// Secondary motion (on twos, cutouts only move): steam, the clock's second hand, the curtain
// and the plant leaves swaying. Global: Office.
const Office = (() => {
    const P = Paper, D = PaperDetail, E = Ease;
    const sprite = (...a) => Props.sprite(...a);
    const cut = (c, pts, col, seed, o = {}) => P.cutout(c, pts, col, seed, { border: 2.2, shadow: 0.18, ...o });
    const flat = (c, pts, col, seed, o = {}) => P.cutout(c, pts, col, seed, { border: 0, shadow: 0, ...o });
    const R = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const xf = (pts, x, y, a = 0, s = 1) => pts.map(([px, py]) => [x + (px * Math.cos(a) - py * Math.sin(a)) * s, y + (px * Math.sin(a) + py * Math.cos(a)) * s]);
    const ell = (cx, cy, rx, ry, n = 40, a = 0) => xf(P.ellipse(0, 0, rx, ry, n), cx, cy, a);
    const drawing = (t) => Math.floor(t * 12 + 1e-6);
    const local = (c, x, y, a, fn) => (c.save(), c.translate(x, y), c.rotate(a), fn(c), c.restore());

    const COL = {
        wall: '#efe3ca', wallInk: '#d6c29c', sprig: '#a9a276', bud: '#d49a86',
        frame: '#a9c2b0', sky: '#bcd8e3', cloud: '#f8f4ea',
        wood: '#c79a66', woodLight: '#d6a874', woodDark: '#a4744a', woodDeep: '#6b4a33',
        cork: '#c59a68', curtain: '#e0a08c', metal: '#46424e', silver: '#c4c7cf',
        coral: '#d2563f', green: '#1c7048', navy: '#1f3a8a', mustard: '#e2b04a', sage: '#86ad8c',
        leaf: '#3f8a4f', leafDark: '#2e6b3f', leafLight: '#63a862', kraft: '#c9a06b', paper: '#fbf7ee',
        ink: '#2a2530', grey: '#8d8a92', sticky: '#f3d677', pink: '#e7a393', terracotta: '#c46e4c',
    };

    // --------------------------------------------------------------------------- helpers
    function pin(c, x, y, col, seed) {
        c.save();
        c.fillStyle = 'rgba(40,20,30,0.28)';
        c.beginPath();
        c.ellipse(x + 3, y + 4, 6.5, 5.5, 0, 0, Math.PI * 2);
        c.fill();
        c.restore();
        cut(c, ell(x, y, 6.5, 6.5, 24), col, 'pin' + seed, { border: 1.1, shadow: 0, tex: { alpha: [0.2, 0.4] } });
        c.fillStyle = 'rgba(255,255,255,0.75)';
        c.beginPath();
        c.ellipse(x - 2, y - 2.2, 1.9, 1.5, -0.5, 0, Math.PI * 2);
        c.fill();
    }
    // a finger hole: a torn paper rim with the dark inside showing (painted: a punch would
    // show the empty canvas through a background sprite)
    function hole(c, x, y, rx, ry, seed) {
        cut(c, ell(x, y, rx + 2.4, ry + 2.4, 24), '#f3ecde', seed + 'rim', { border: 0, shadow: 0, jag: 0.6, tex: false });
        flat(c, ell(x, y, rx, ry, 24), '#2e2833', seed, { jag: 0.5, tex: { alpha: [0.2, 0.4] } });
    }
    function tape(c, x, y, w, h, a, seed) {
        c.save();
        c.globalAlpha = 0.72;
        flat(c, xf(R(-w / 2, -h / 2, w, h), x, y, a), '#ece3b4', 'tape' + seed, { jag: 0.9, tex: { alpha: [0.1, 0.25] } });
        c.restore();
    }
    // a sticky note centred on the origin: adhesive band, scribbled lines
    function sticky(c, w, h, col, seed, rows = 3) {
        cut(c, R(-w / 2, -h / 2, w, h), col, seed, {
            border: 1.2, shadow: 0.22, jag: 0.5, tex: { alpha: [0.2, 0.4] },
            inner: (cc) => {
                cc.fillStyle = D.shade(col, -8);
                cc.globalAlpha = 0.35;
                cc.fillRect(-w / 2, -h / 2, w, h * 0.18);
                cc.globalAlpha = 1;
                if (rows) P.scribble(cc, -w / 2 + 6, -h / 2 + h * 0.36, w - 12, rows, h * 0.19, '#4b3f55', seed + 's', { alpha: 0.6, scale: h / 90, width: 1 });
            },
        });
    }
    // an upright book with its spine towards the camera, bottom-left corner at the origin
    function book(c, w, h, col, seed, style = 0) {
        const dark = D.shade(col, -14), light = D.shade(col, 14);
        cut(c, R(0, -h, w, h), col, seed, {
            border: 1.7, shadow: 0.2, tex: { angle: Math.PI / 2, alpha: [0.25, 0.5] },
            inner: (cc) => {
                cc.fillStyle = style === 1 ? '#e8c35c' : dark;
                cc.globalAlpha = 0.85;
                cc.fillRect(-2, -h + 7, w + 4, 3.2);
                cc.fillRect(-2, -h + 12, w + 4, 1.6);
                cc.fillRect(-2, -13, w + 4, 3.2);
                cc.globalAlpha = 1;
                if (style === 2) {
                    // a paper label with the title as bars
                    cc.fillStyle = '#f6efdf';
                    cc.fillRect(w * 0.14, -h * 0.72, w * 0.72, h * 0.3);
                    cc.fillStyle = 'rgba(42,37,48,0.55)';
                    cc.fillRect(w * 0.3, -h * 0.68, w * 0.12, h * 0.22);
                    cc.fillRect(w * 0.52, -h * 0.66, w * 0.1, h * 0.14);
                } else {
                    // the title printed along the spine as short bars
                    cc.fillStyle = style === 1 ? '#f0d27a' : light;
                    cc.globalAlpha = 0.9;
                    cc.fillRect(w * 0.38, -h * 0.78, w * 0.24, h * 0.3);
                    cc.fillRect(w * 0.38, -h * 0.44, w * 0.24, h * 0.1);
                    cc.globalAlpha = 1;
                }
            },
        });
    }
    // a book lying flat: its spine (a band) seen from the front, left end at x, bottom at y
    function flatBook(c, x, y, w, h, col, seed) {
        cut(c, xf(R(0, -h, w, h), x, y, 0), col, seed, {
            border: 1.6, shadow: 0.2, tex: { alpha: [0.25, 0.5] },
            inner: (cc) => {
                cc.fillStyle = D.shade(col, -14);
                cc.globalAlpha = 0.8;
                cc.fillRect(x + 6, y - h, 3, h);
                cc.fillRect(x + w - 9, y - h, 3, h);
                cc.fillStyle = D.shade(col, 16);
                cc.fillRect(x + w * 0.3, y - h * 0.62, w * 0.34, h * 0.24);
                cc.globalAlpha = 1;
            },
        });
    }

    // ------------------------------------------------------------------------- the wall
    function wall(c) {
        c.fillStyle = COL.wall;
        c.fillRect(-80, -80, 1760, 820);
        P.marker(c, { x: -120, y: -100, w: 1840, h: 860 }, COL.wall, 'office-wall', { len: [60, 170], h: [12, 24], lVar: 3, alpha: [0.3, 0.6], density: 1.05 });
        // printed wallpaper: pairs of thin stripes and a small sprig between them
        const r = P.rng('wallpaper');
        c.save();
        c.lineCap = 'round';
        for (let x = -60, col = 0; x < 1680; x += 78, col++) {
            c.strokeStyle = COL.wallInk;
            for (const dx of [0, 6]) {
                c.globalAlpha = dx ? 0.35 : 0.55;
                c.lineWidth = dx ? 1 : 1.6;
                c.beginPath();
                for (let y = -80; y <= 740; y += 20) c.lineTo(x + dx + Math.sin(y * 0.021 + col) * 0.9, y);
                c.stroke();
            }
            for (let y = -40 + (col % 2) * 44; y < 740; y += 88) {
                const sx = x + 42 + (r() - 0.5) * 4, sy = y, a = (r() - 0.5) * 0.5;
                c.save();
                c.translate(sx, sy);
                c.rotate(a);
                c.globalAlpha = 0.5;
                c.strokeStyle = COL.sprig;
                c.lineWidth = 1.3;
                c.beginPath();
                c.moveTo(0, 9);
                c.quadraticCurveTo(-2, 0, 1, -9);
                c.stroke();
                c.fillStyle = COL.sprig;
                for (const [lx, ly, la] of [[-4, 2, -0.7], [4, -2, 0.7], [-3, -5, -0.5]]) (c.beginPath(), c.ellipse(lx, ly, 4, 1.8, la, 0, Math.PI * 2), c.fill());
                c.fillStyle = COL.bud;
                c.globalAlpha = 0.55;
                c.beginPath();
                c.arc(1.5, -10.5, 2.3, 0, Math.PI * 2);
                c.fill();
                c.restore();
            }
        }
        c.restore();
    }

    // ----------------------------------------------------------------------- the window
    const WIN = { x0: 56, y0: 74, x1: 326, y1: 462, f: 18 };
    function windowView(c) {
        const gx0 = WIN.x0 + WIN.f, gy0 = WIN.y0 + WIN.f, gx1 = WIN.x1 - WIN.f, gy1 = WIN.y1 - 4;
        c.save();
        c.beginPath();
        c.rect(gx0, gy0, gx1 - gx0, gy1 - gy0);
        c.clip();
        flat(c, R(gx0 - 10, gy0 - 10, gx1 - gx0 + 20, gy1 - gy0 + 20), COL.sky, 'sky', { tex: { len: [40, 110], h: [8, 16], alpha: [0.3, 0.6] } });
        cut(c, ell(118, 150, 17, 17, 30), '#f2d68a', 'sun', { border: 1.6, shadow: 0.08 });
        cut(c, P.circleUnion([[214, 146, 16], [234, 136, 22], [258, 144, 18], [276, 152, 12], [240, 154, 16]]), COL.cloud, 'cloud1', { border: 1.4, shadow: 0.08, tex: { alpha: [0.1, 0.25] } });
        cut(c, P.circleUnion([[92, 214, 10], [106, 206, 14], [122, 212, 10]]), COL.cloud, 'cloud2', { border: 1.2, shadow: 0.06, tex: { alpha: [0.1, 0.25] } });
        for (const [bx, by, bs] of [[160, 196, 1], [176, 186, 0.7]]) P.markerStroke(c, [[bx - 7 * bs, by - 3 * bs], [bx, by + 1 * bs], [bx + 7 * bs, by - 4 * bs]], '#4a4a5c', 1.8, 'bird' + bx, 0.8);
        // far row: pale roofs
        for (const [i, [x, w, top, col]] of [[70, 60, 330, '#c9c3cf'], [122, 70, 312, '#d4c2b2'], [184, 64, 336, '#c3cbd3'], [236, 80, 318, '#cbc0cc']].entries()) {
            flat(c, [[x, 460], [x, top + 22], [x + w / 2, top], [x + w, top + 22], [x + w, 460]], col, 'far' + i, { tex: { alpha: [0.2, 0.4] } });
        }
        // near row: houses cut from printed papers, sticky-note windows
        const houses = [
            { x: 66, w: 64, top: 368, apex: 326, wall: '#ece5d6', roof: '#c1553f', paper: 'news' },
            { x: 124, w: 66, top: 386, apex: 0, wall: '#efe7d5', roof: '#5a6079', paper: 'music' },
            { x: 182, w: 62, top: 360, apex: 318, wall: '#d9e2c8', roof: '#2f3f7a', paper: 'map' },
        ];
        for (const [i, h] of houses.entries()) {
            cut(c, R(h.x, h.top, h.w, 470 - h.top), h.wall, 'house' + i, {
                border: 1.6, shadow: 0.15, tex: { alpha: [0.15, 0.3] },
                inner: (cc, box) => {
                    if (h.paper === 'news') D.wordBars(cc, box, { cols: 30, rowH: 7, ink: '#8e887e', seed: 'hw' + i });
                    else if (h.paper === 'music') D.sheetMusic(cc, box, { sp: 4, period: 34, seed: 'hm' + i, lineA: 0.4, noteA: 0.55 });
                    else D.mapPaper(cc, box, { ink: 'rgba(80,110,70,0.45)', width: 1, seed: 'hmap' + i });
                },
            });
            if (h.apex) cut(c, [[h.x - 6, h.top + 2], [h.x + h.w / 2, h.apex], [h.x + h.w + 6, h.top + 2]], h.roof, 'roof' + i, { border: 1.6, shadow: 0.2, inner: (cc, box) => D.rib(cc, box, h.roof, { step: 5, angle: 0, width: 1.2 }) });
            else {
                cut(c, R(h.x + h.w - 22, h.top - 30, 12, 34), '#a2543e', 'chim' + i, { border: 1.4 });
                cut(c, R(h.x - 4, h.top - 6, h.w + 8, 10), h.roof, 'roof' + i, { border: 1.6, shadow: 0.2 });
            }
            for (let k = 0; k < 2; k++) for (let j = 0; j < 2; j++) {
                const wx = h.x + 12 + k * (h.w - 36), wy = h.top + 16 + j * 34;
                if (wy > 450) continue;
                cut(c, R(wx, wy, 12, 14), '#f1d27a', 'hwin' + i + k + j, { border: 1, shadow: 0.1, tex: { alpha: [0.1, 0.2] } });
            }
        }
        // a tree on the right of the view: back crown, front crown, trunk
        cut(c, D.taper([[272, 470], [270, 420], [266, 372]], [14, 11, 7]), '#7a5236', 'trunk', { border: 1.4, shadow: 0.1 });
        cut(c, D.spline([[240, 350], [238, 316], [258, 290], [288, 286], [310, 304], [314, 336], [296, 360], [262, 366]], 6), COL.leafDark, 'crownB', { border: 1.6, shadow: 0.12 });
        cut(c, D.spline([[236, 372], [232, 342], [248, 318], [276, 312], [300, 326], [304, 352], [288, 376], [258, 384]], 6), COL.leafLight, 'crownF', {
            border: 1.8, shadow: 0.15,
            inner: (cc) => {
                // leaf dabs: small pointed ovals, all leaning the same way
                const r = P.rng('crownleaves');
                for (let k = 0; k < 22; k++) {
                    const lx = 242 + r() * 58, ly = 322 + r() * 56;
                    cc.fillStyle = r() < 0.6 ? COL.leaf : D.shade(COL.leafLight, 10);
                    cc.globalAlpha = 0.7;
                    cc.beginPath();
                    cc.ellipse(lx, ly, 5, 2.4, -0.6 + (r() - 0.5) * 0.5, 0, Math.PI * 2);
                    cc.fill();
                }
                cc.globalAlpha = 1;
            },
        });
        c.restore();
        // glass reflections
        c.save();
        c.globalAlpha = 0.4;
        c.strokeStyle = '#ffffff';
        c.lineCap = 'round';
        for (const [x, y, l, w] of [[92, 150, 44, 5], [104, 150, 26, 3], [220, 316, 40, 5], [232, 318, 22, 3]]) {
            c.lineWidth = w;
            c.beginPath();
            c.moveTo(x, y);
            c.lineTo(x + l * 0.6, y - l);
            c.stroke();
        }
        c.restore();
    }
    function windowSet(c) {
        const { x0, y0, x1, y1, f } = WIN;
        cut(c, [[x0, y0], [x1, y0 + 2], [x1 + 1, y1], [x0 - 1, y1 + 1]], COL.frame, 'winframe', { border: 2.4, shadow: 0.22, tex: { alpha: [0.15, 0.3] } });
        windowView(c);
        // sash lip over the glass edge, then the cross bars
        const lip = COL.frame, lipD = D.shade(COL.frame, -6);
        cut(c, R(x0 + f - 6, y0 + f - 6, x1 - x0 - 2 * f + 12, 10), lipD, 'lipT', { border: 1.2, shadow: 0.14 });
        cut(c, R(x0 + f - 6, y0 + f - 6, 10, y1 - y0 - f), lip, 'lipL', { border: 1.2, shadow: 0.14 });
        cut(c, R(x1 - f - 4, y0 + f - 6, 10, y1 - y0 - f), lip, 'lipR', { border: 1.2, shadow: 0.14 });
        cut(c, R(185, y0 + f, 12, y1 - y0 - f), lip, 'mullionV', { border: 1.4, shadow: 0.18 });
        cut(c, R(x0 + f, 262, x1 - x0 - 2 * f, 12), lip, 'mullionH', { border: 1.4, shadow: 0.18 });
        cut(c, R(183, 262, 16, 12), lip, 'mullionX', { border: 0, shadow: 0 });
        // latch
        cut(c, R(184, 300, 14, 22), '#b8b2a6', 'latch', { border: 1, shadow: 0.2 });
        // sill with its shadow side
        cut(c, [[x0 - 20, y1 - 6], [x1 + 20, y1 - 8], [x1 + 24, y1 + 18], [x0 - 24, y1 + 20]], COL.frame, 'sill', { border: 2, shadow: 0.25, tex: { alpha: [0.15, 0.3] } });
        cut(c, [[x0 - 12, y1 + 20], [x1 + 12, y1 + 18], [x1 + 8, y1 + 30], [x0 - 8, y1 + 31]], D.shade(COL.frame, -14), 'sillunder', { border: 1, shadow: 0.2 });
        // a succulent on the sill: pot, rim, rosette
        cut(c, [[262, 426], [304, 426], [298, 460], [268, 460]], COL.terracotta, 'spot', { border: 1.8, shadow: 0.22 });
        cut(c, R(258, 420, 50, 10), D.shade(COL.terracotta, 6), 'spotrim', { border: 1.6, shadow: 0.18 });
        for (const [k, a] of [-1.2, -0.7, -0.25, 0.25, 0.7, 1.2, 0].entries()) {
            const L = k === 6 ? 26 : 30 - Math.abs(a) * 6, bx = 283, by = 420;
            cut(c, D.taper([[bx, by], [bx + Math.sin(a) * L * 0.5, by - Math.cos(a) * L * 0.5], [bx + Math.sin(a) * L, by - Math.cos(a) * L]], [8, 12, 3]), k % 2 ? COL.sage : D.shade(COL.sage, -10), 'succ' + k, { border: 1.3, shadow: 0.12 });
        }
        // a small jar with brushes beside it (the brushes go in first: they stand inside)
        c.save();
        c.translate(140, 0);
        for (const [k, [ex, ey, col]] of [[82, 384, '#c79a66'], [92, 376, '#1f3a8a'], [98, 392, '#c79a66']].entries()) {
            P.markerStroke(c, [[84 + k * 6, 452], [ex, ey]], col, 4, 'brush' + k, 0.95);
            cut(c, D.taper([[ex, ey + 2], [ex - 0.5, ey - 8], [ex - 1, ey - 16]], [6, 6, 2]), '#3d2e2a', 'bristle' + k, { border: 0.8, shadow: 0.1 });
        }
        cut(c, D.cspline([[74, 460], [72, 424], [104, 424], [102, 460]], 5), '#dfe7e6', 'jar', {
            border: 1.6, shadow: 0.2, tex: { alpha: [0.1, 0.2] },
            inner: (cc) => (cc.fillStyle = 'rgba(255,255,255,0.6)', cc.fillRect(78, 428, 4, 26)),
        });
        c.restore();
    }
    // the curtain rod and the curtains (the left one is its own sprite: it sways)
    function rod(c) {
        cut(c, P.noodle([[16, 62], [372, 60]], 8), COL.woodDeep, 'rod', { border: 1.6, shadow: 0.25 });
        for (const x of [14, 374]) cut(c, ell(x, 61, 10, 10, 24), COL.woodDeep, 'finial' + x, { border: 1.6, shadow: 0.25, inner: (cc) => (cc.fillStyle = 'rgba(255,255,255,0.25)', cc.beginPath(), cc.arc(x - 3, 58, 3, 0, 7), cc.fill()) });
    }
    function fabric(cc, box, seed) {
        // printed linen: faint weave and a grid of small cream dots
        D.rib(cc, box, COL.curtain, { step: 4, width: 0.8 });
        const r = P.rng(seed + 'dots');
        cc.fillStyle = '#fbf0e6';
        for (let y = box.y + 6, row = 0; y < box.y + box.h; y += 22, row++) {
            for (let x = box.x + 4 + (row % 2) * 11; x < box.x + box.w; x += 22) {
                cc.globalAlpha = 0.55 + r() * 0.2;
                cc.beginPath();
                cc.arc(x, y, 2.2, 0, 7);
                cc.fill();
            }
        }
        cc.globalAlpha = 1;
    }
    function curtainL(c) {
        const pts = D.spline([[6, 64], [60, 66], [152, 64], [140, 150], [110, 250], [84, 322], [104, 386], [140, 480], [158, 588], [80, 596], [4, 598]], 8);
        cut(c, pts, COL.curtain, 'curtainL', {
            border: 2.4, shadow: 0.2, tex: { angle: Math.PI / 2, alpha: [0.25, 0.45] },
            inner: (cc, box) => {
                fabric(cc, box, 'cL');
                // folds: a darker valley with a highlight on one side, gathered at the tie-back
                for (const [k, xs] of [[34, 40, 36], [70, 62, 84], [110, 78, 124]].entries()) {
                    const f = [[xs[0], 66], [(xs[0] + xs[1]) / 2 + 2, 200], [xs[1], 330], [(xs[1] + xs[2]) / 2, 460], [xs[2], 600]];
                    cc.save();
                    cc.globalAlpha = 0.35;
                    P.tracePath(cc, D.taper(f, [10, 7, 3, 8, 12]));
                    cc.fillStyle = D.shade(COL.curtain, -16);
                    cc.fill();
                    cc.restore();
                    D.crease(cc, [f[0][0] + 7, f[0][1]], [f[2][0] + 3, f[2][1]], { dark: 'rgba(120,60,50,0.0)', light: 'rgba(255,240,230,0.55)', width: 1.4 });
                    D.crease(cc, [f[2][0] + 3, f[2][1]], [f[4][0] + 8, f[4][1]], { dark: 'rgba(120,60,50,0.0)', light: 'rgba(255,240,230,0.55)', width: 1.4 });
                }
            },
        });
        // tie-back band with a coral button
        cut(c, P.noodle(D.spline([[2, 320], [50, 336], [96, 322]], 6, false), 14), COL.navy, 'tieback', { border: 1.8, shadow: 0.25, inner: (cc, box) => D.rib(cc, box, COL.navy, { step: 4, angle: 0.2 }) });
        cut(c, ell(90, 324, 6, 6, 20), COL.coral, 'tiebtn', { border: 1.2, shadow: 0.2 });
        // rings on the rod
        for (let k = 0; k < 5; k++) P.markerStroke(c, Array.from({ length: 10 }, (_, j) => { const a = (j / 9) * Math.PI * 2; return [18 + k * 32 + Math.cos(a) * 6, 64 + Math.sin(a) * 7]; }), '#5d4535', 2.4, 'ring' + k, 0.9);
    }
    function curtainR(c) {
        const pts = D.spline([[310, 64], [352, 62], [350, 300], [356, 520], [326, 524], [316, 300]], 6);
        cut(c, pts, COL.curtain, 'curtainR', {
            border: 2.2, shadow: 0.2, tex: { angle: Math.PI / 2, alpha: [0.25, 0.45] },
            inner: (cc, box) => {
                fabric(cc, box, 'cR');
                cc.save();
                cc.globalAlpha = 0.35;
                P.tracePath(cc, D.taper([[334, 64], [332, 300], [340, 524]], [6, 8, 10]));
                cc.fillStyle = D.shade(COL.curtain, -16);
                cc.fill();
                cc.restore();
            },
        });
        for (let k = 0; k < 2; k++) P.markerStroke(c, Array.from({ length: 10 }, (_, j) => { const a = (j / 9) * Math.PI * 2; return [318 + k * 26 + Math.cos(a) * 6, 64 + Math.sin(a) * 7]; }), '#5d4535', 2.4, 'ringR' + k, 0.9);
    }

    // ------------------------------------------------------------------ the wall shelf
    function shelf(c) {
        // brackets under the board
        for (const x of [646, 796]) {
            cut(c, R(x - 4, 252, 8, 44), COL.metal, 'brk' + x, { border: 1.2, shadow: 0.25 });
            cut(c, P.noodle([[x, 290], [x + (x < 700 ? 30 : -30), 256]], 5), COL.metal, 'brkd' + x, { border: 1, shadow: 0.2 });
        }
        // upright books, one leaning on the others
        const books = [[612, 18, 104, COL.navy, 1], [631, 22, 124, COL.coral, 0], [654, 16, 94, COL.mustard, 0], [671, 21, 114, COL.green, 2], [693, 14, 86, '#efe6d2', 0]];
        for (const [i, [x, w, h, col, st]] of books.entries()) local(c, x, 238, 0, (cc) => book(cc, w, h, col, 'sbook' + i, st));
        local(c, 727, 238, -0.2, (cc) => book(cc, 19, 100, '#d98a7a', 'sbookLean', 1));
        // a stack of two flat books, a kraft box on it, a small framed photo on the box
        flatBook(c, 734, 238, 68, 15, '#5c7f6b', 'fb1');
        flatBook(c, 740, 223, 60, 13, COL.navy, 'fb2');
        cut(c, R(744, 170, 54, 40), COL.kraft, 'sbox', {
            border: 1.8, shadow: 0.22, tex: { alpha: [0.2, 0.45] },
            inner: (cc) => {
                cc.fillStyle = '#f6efdf';
                cc.fillRect(758, 184, 26, 14);
                P.scribble(cc, 761, 194, 20, 1, 6, '#4b3f55', 'sboxl', { alpha: 0.7, scale: 0.6 });
            },
        });
        cut(c, R(741, 164, 60, 10), D.shade(COL.kraft, -6), 'sboxlid', { border: 1.6, shadow: 0.25 });
        local(c, 770, 164, 0.05, (cc) => {
            cc.save();
            cc.translate(0, 0);
            cut(cc, R(-18, -50, 36, 48), COL.woodDark, 'photoframe', { border: 1.6, shadow: 0.25, inner: (c2, box) => D.woodGrain(c2, box, COL.woodDark, { seed: 'pf', angle: Math.PI / 2 }) });
            flat(cc, R(-12, -44, 24, 36), '#a8cbd8', 'photo', { tex: { alpha: [0.2, 0.3] } });
            flat(cc, [[-12, -8], [-12, -22], [-2, -30], [12, -20], [12, -8]], '#5f9a5a', 'photohill', { tex: { alpha: [0.2, 0.3] } });
            flat(cc, ell(4, -34, 4, 4, 16), '#f2d68a', 'photosun', { tex: false });
            cc.restore();
        });
        // the board, in front of what stands on it
        cut(c, [[604, 236], [836, 234], [836, 254], [604, 256]], COL.wood, 'shelfboard', { border: 2, shadow: 0.28, inner: (cc, box) => D.woodGrain(cc, box, COL.wood, { seed: 'shelfboard' }) });
        // trailing plant: pot on the right end, vines falling over the edge
        cut(c, [[804, 202], [834, 202], [830, 236], [808, 236]], COL.paper, 'tpot', { border: 1.6, shadow: 0.22, inner: (cc) => { cc.fillStyle = COL.coral; for (let k = 0; k < 3; k++) cc.fillRect(804, 210 + k * 8, 32, 3); } });
        const vines = [
            [[812, 206], [800, 240], [798, 290], [806, 340], [800, 388]],
            [[826, 206], [840, 250], [838, 300], [846, 330]],
            [[818, 204], [812, 180], [800, 170]],
        ];
        for (const [v, ctrl] of vines.entries()) {
            const path = D.spline(ctrl, 8, false);
            P.markerStroke(c, path, COL.leafDark, 2.2, 'vine' + v, 0.9);
            for (let i = 3; i < path.length; i += 5) {
                const [x, y] = path[i], side = i % 2 ? 1 : -1, a = side * 0.9 + 0.3;
                cut(c, D.taper([[x, y], [x + Math.sin(a) * 8, y + Math.cos(a) * 5], [x + Math.sin(a) * 15, y + Math.cos(a) * 9]], [2, 11, 2]), i % 3 ? COL.leaf : COL.leafLight, 'vl' + v + i, { border: 1, shadow: 0.14 });
            }
        }
    }

    // --------------------------------------------------------------------- the cork board
    function corkboard(c) {
        cut(c, [[614, 304], [826, 302], [828, 486], [612, 488]], COL.woodLight, 'corkframe', { border: 2.2, shadow: 0.25, inner: (cc, box) => D.woodGrain(cc, box, COL.woodLight, { seed: 'corkframe' }) });
        cut(c, [[626, 316], [814, 315], [816, 474], [624, 476]], COL.cork, 'cork', {
            border: 0, shadow: 0.2, tex: { alpha: [0.2, 0.4] },
            inner: (cc, box) => {
                const r = P.rng('corkdots');
                for (let i = 0; i < 900; i++) {
                    cc.fillStyle = r() < 0.55 ? D.shade(COL.cork, -16) : D.shade(COL.cork, 12);
                    cc.globalAlpha = 0.35 + r() * 0.35;
                    const s = 0.8 + r() * 1.8;
                    cc.fillRect(box.x + r() * box.w, box.y + r() * box.h, s, s * (0.6 + r() * 0.6));
                }
                cc.globalAlpha = 1;
            },
        });
        // polaroid with the sea
        local(c, 662, 364, -0.07, (cc) => {
            cut(cc, R(-27, -32, 54, 64), '#fbfaf5', 'polaroid', { border: 1, shadow: 0.25, tex: { alpha: [0.1, 0.2] } });
            flat(cc, R(-22, -27, 44, 42), '#a9d0dc', 'polsky', { tex: { alpha: [0.2, 0.3] } });
            flat(cc, R(-22, -4, 44, 19), '#3f78a8', 'polsea', { tex: { alpha: [0.2, 0.4] } });
            flat(cc, ell(8, -14, 6, 6, 16), '#f2d68a', 'polsun', { tex: false });
            P.markerStroke(cc, [[-14, 23], [8, 22]], '#6d6474', 1.6, 'poltext', 0.6);
        });
        pin(c, 662, 336, COL.coral, 'p1');
        // yellow sticky note
        local(c, 724, 354, 0.06, (cc) => sticky(cc, 50, 48, COL.sticky, 'cstk1'));
        pin(c, 724, 336, COL.navy, 'p2');
        // a to-do list on lined paper
        local(c, 786, 376, -0.04, (cc) => cut(cc, R(-25, -42, 50, 84), '#fbfaf5', 'todo', {
            border: 1, shadow: 0.25, tex: { alpha: [0.1, 0.2] },
            inner: (c2) => {
                c2.fillStyle = 'rgba(120,150,200,0.5)';
                for (let y = -28; y < 42; y += 9) c2.fillRect(-25, y, 50, 0.9);
                c2.fillStyle = 'rgba(220,120,110,0.6)';
                c2.fillRect(-18, -42, 0.9, 84);
                for (let k = 0; k < 6; k++) {
                    c2.strokeStyle = '#3f3a55';
                    c2.globalAlpha = 0.7;
                    c2.lineWidth = 1;
                    c2.strokeRect(-14, -34 + k * 9 + 1.5, 4, 4);
                    if (k < 3) P.markerStroke(c2, [[-14, -34 + k * 9 + 3], [-12, -34 + k * 9 + 5.5], [-9, -34 + k * 9]], COL.green, 1.4, 'tick' + k, 0.9);
                }
                c2.globalAlpha = 1;
                D.cursive(c2, { x: -6, y: -38, w: 28, h: 56 }, '#3f3a55', { lineH: 9, xh: 3, hw: 2, width: 0.8, alpha: 0.7, gap: 4, seed: 'todo' });
            },
        }));
        pin(c, 786, 338, COL.green, 'p3');
        // a coral business card with printed bars
        local(c, 670, 432, 0.04, (cc) => cut(cc, R(-32, -17, 64, 34), COL.coral, 'bcard', {
            border: 1, shadow: 0.25,
            inner: (c2) => {
                c2.fillStyle = '#fbf2ea';
                c2.globalAlpha = 0.9;
                c2.fillRect(-24, -8, 26, 4);
                c2.fillRect(-24, 1, 36, 2.4);
                c2.fillRect(-24, 6, 30, 2.4);
                c2.beginPath();
                c2.arc(20, -4, 6, 0, 7);
                c2.fill();
                c2.globalAlpha = 1;
            },
        }));
        pin(c, 648, 420, COL.green, 'p4');
        // a receipt with a zigzag foot
        local(c, 738, 434, -0.06, (cc) => {
            const zig = [];
            for (let i = 0; i <= 8; i++) zig.push([-22 + i * 5.5, 32 + (i % 2 ? 4 : 0)]);
            cut(cc, [[-22, -32], [22, -32], ...zig.reverse()], '#f7f3ea', 'rcpt', { border: 1, shadow: 0.25, tex: { alpha: [0.1, 0.25] }, inner: (c2) => { P.scribble(c2, -16, -20, 32, 6, 8, '#7d7390', 'rcpts', { alpha: 0.6, scale: 0.55 }); c2.fillStyle = 'rgba(40,30,40,0.6)'; c2.fillRect(-16, 22, 32, 2); } });
        });
        pin(c, 738, 406, COL.coral, 'p5');
        // a strip of colour swatches
        local(c, 794, 446, 0.08, (cc) => {
            cut(cc, R(-12, -30, 24, 60), '#fbfaf5', 'swatch', { border: 1, shadow: 0.25, tex: false });
            [COL.coral, COL.green, COL.navy].forEach((col, k) => flat(cc, R(-8, -26 + k * 17, 16, 13), col, 'sw' + k, { tex: { alpha: [0.2, 0.3] } }));
        });
        pin(c, 794, 420, COL.mustard, 'p6');
    }

    // a print taped to the wall (behind the floating invoice: small and calm)
    function print(c) {
        local(c, 960, 206, 0.035, (cc) => {
            cut(cc, R(-52, -62, 104, 124), '#fbf8ef', 'wallprint', { border: 1.6, shadow: 0.2, tex: { alpha: [0.1, 0.22] } });
            P.markerStroke(cc, [[-38, 30], [-16, 4], [2, 20], [22, -6], [40, 30]], COL.green, 5, 'prhills', 0.9);
            P.markerStroke(cc, [[-38, 40], [40, 40]], COL.green, 3, 'prground', 0.8);
            for (let k = 0; k < 9; k++) {
                const a = (k / 9) * Math.PI * 2;
                P.markerStroke(cc, [[16 + Math.cos(a) * 10, -30 + Math.sin(a) * 10], [16 + Math.cos(a) * 20, -30 + Math.sin(a) * 20]], COL.coral, 3, 'prsun' + k, 0.9);
            }
            P.markerStroke(cc, Array.from({ length: 16 }, (_, j) => { const a = (j / 15) * Math.PI * 2; return [16 + Math.cos(a) * 6, -30 + Math.sin(a) * 6]; }), COL.coral, 3, 'prsunc', 0.9);
        });
        tape(c, 930, 142, 34, 12, -0.3, 'pt1');
        tape(c, 994, 146, 34, 12, 0.35, 'pt2');
    }
    // a light switch and a socket with a charger plugged in; its cable drops behind the tray
    function sockets(c) {
        cut(c, R(1150, 452, 32, 46), '#f7f2e6', 'switch', { border: 1.4, shadow: 0.22, tex: { alpha: [0.1, 0.2] }, inner: (cc) => { cc.fillStyle = '#e4dccb'; cc.fillRect(1159, 462, 14, 26); cc.fillStyle = 'rgba(60,50,60,0.3)'; cc.fillRect(1159, 474, 14, 2); } });
        cut(c, R(1146, 540, 40, 40), '#f7f2e6', 'socket', { border: 1.4, shadow: 0.22, tex: { alpha: [0.1, 0.2] } });
        flat(c, ell(1166, 560, 13, 13, 24), '#e4dccb', 'socketdish', { tex: false });
        P.markerStroke(c, D.spline([[1170, 572], [1174, 600], [1166, 626], [1170, 660]], 6, false), '#e9e6de', 3, 'socketcable', 0.95);
        P.markerStroke(c, D.spline([[1170, 572], [1174, 600], [1166, 626], [1170, 660]], 6, false), 'rgba(80,70,80,0.25)', 1, 'socketcableS', 0.8);
        cut(c, R(1156, 548, 22, 26), '#3a3640', 'plug', { border: 1.2, shadow: 0.3, inner: (cc) => (cc.fillStyle = '#5c5864', cc.fillRect(1160, 552, 4, 18)) });
    }

    // ------------------------------------------------------------- the bookcase (right edge)
    function bookcase(c) {
        cut(c, R(1504, -80, 180, 720), '#dcc4a0', 'bcback', { border: 0, shadow: 0, tex: { alpha: [0.25, 0.45] } });
        // top compartment: binders with label windows and finger holes
        const binders = [[1516, 30, 148, COL.coral], [1548, 32, 158, COL.green], [1582, 30, 146, COL.navy]];
        for (const [i, [x, w, h, col]] of binders.entries()) {
            local(c, x, 190, 0, (cc) => cut(cc, R(0, -h, w, h), col, 'bind' + i, {
                border: 1.8, shadow: 0.22, tex: { angle: Math.PI / 2, alpha: [0.25, 0.5] },
                inner: (c2) => {
                    c2.fillStyle = '#f6efdf';
                    c2.fillRect(w * 0.18, -h * 0.78, w * 0.64, h * 0.3);
                    c2.fillStyle = 'rgba(42,37,48,0.5)';
                    c2.fillRect(w * 0.3, -h * 0.72, w * 0.4, 3);
                    c2.fillRect(w * 0.3, -h * 0.66, w * 0.3, 3);
                },
            }));
            hole(c, x + w / 2, 190 - 34, 6, 9, 'bindhole' + i);
        }
        local(c, 1636, 190, 0.14, (cc) => book(cc, 20, 120, COL.mustard, 'bcbook', 2));
        // middle compartment: a stack of flat books, a small cactus; a magazine file
        [[1514, 420, 84, 18, '#d98a7a'], [1518, 402, 76, 16, COL.navy], [1512, 386, 88, 20, '#efe6d2'], [1520, 366, 72, 14, COL.green]].forEach(([x, y, w, h, col], i) => flatBook(c, x, y, w, h, col, 'bcf' + i));
        cut(c, [[1540, 352], [1574, 352], [1570, 322], [1544, 322]], COL.terracotta, 'bccpot', { border: 1.6, shadow: 0.22 });
        cut(c, D.spline([[1550, 324], [1548, 290], [1557, 274], [1566, 290], [1564, 324]], 5), '#5c9a64', 'cactus', { border: 1.6, shadow: 0.15, inner: (cc) => { for (const x of [1553, 1557, 1561]) P.markerStroke(cc, [[x, 280], [x, 320]], '#3f7a48', 1.2, 'cx' + x, 0.6); } });
        cut(c, D.spline([[1564, 306], [1578, 300], [1580, 286], [1574, 282], [1570, 296], [1562, 300]], 4), '#5c9a64', 'cactusarm', { border: 1.4, shadow: 0.12 });
        cut(c, [[1606, 420], [1656, 420], [1656, 300], [1630, 300], [1606, 350]], COL.kraft, 'magfile', {
            border: 1.8, shadow: 0.22,
            inner: (cc) => (cc.fillStyle = '#f6efdf', cc.fillRect(1616, 380, 30, 16)),
        });
        for (const [k, dy] of [[0, 0], [1, 8]].map(([k, d]) => [k, d])) cut(c, R(1610 + k * 6, 292 + dy, 40, 20), '#fbfaf5', 'magpaper' + k, { border: 1, shadow: 0.12, tex: { alpha: [0.1, 0.2] } });
        // lower compartment: two storage boxes with label cards and pull holes
        for (const [i, [x, w, col]] of [[1512, 72, '#8fb0a2'], [1588, 70, COL.kraft]].entries()) {
            cut(c, R(x, 520, w, 108), col, 'sbx' + i, {
                border: 1.8, shadow: 0.22, tex: { alpha: [0.2, 0.4] },
                inner: (cc) => {
                    cc.fillStyle = '#f6efdf';
                    cc.fillRect(x + w * 0.2, 546, w * 0.6, 20);
                    P.scribble(cc, x + w * 0.26, 560, w * 0.48, 1, 6, '#4b3f55', 'sbxl' + i, { alpha: 0.7, scale: 0.7 });
                },
            });
            hole(c, x + w / 2, 594, w * 0.2, 6, 'sbxh' + i);
        }
        // side panel and shelves, in front of their contents
        for (const [k, y] of [190, 420].entries()) cut(c, R(1494, y, 190, 16), COL.wood, 'bcshelf' + k, { border: 1.8, shadow: 0.3, inner: (cc, box) => D.woodGrain(cc, box, COL.wood, { seed: 'bcs' + k }) });
        cut(c, R(1490, -80, 18, 720), COL.woodDark, 'bcside', { border: 2, shadow: 0.3, inner: (cc, box) => D.woodGrain(cc, box, COL.woodDark, { seed: 'bcside', angle: Math.PI / 2 }) });
    }

    // --------------------------------------------------------------------- the chair back
    function chair(c) {
        cut(c, D.cspline([[298, 640], [292, 420], [310, 366], [470, 350], [630, 366], [648, 420], [642, 640]], 6), '#3f3b46', 'chairframe', { border: 2.4, shadow: 0.28, tex: { alpha: [0.2, 0.4] } });
        cut(c, D.cspline([[314, 640], [310, 430], [324, 382], [470, 368], [616, 382], [630, 430], [626, 640]], 6), COL.mustard, 'chaircushion', {
            border: 1.6, shadow: 0.2, tex: { alpha: [0.25, 0.45] },
            inner: (cc, box) => {
                // quilted channels with stitched seams
                D.rib(cc, box, COL.mustard, { step: 38, width: 3, angle: 0 });
                cc.save();
                cc.strokeStyle = D.shade(COL.mustard, -22);
                cc.globalAlpha = 0.6;
                cc.lineWidth = 1.2;
                cc.setLineDash([5, 4]);
                cc.beginPath();
                for (const x of [336, 604]) (cc.moveTo(x, 420), cc.lineTo(x, 640));
                cc.moveTo(330, 392);
                cc.quadraticCurveTo(470, 368, 610, 392);
                cc.stroke();
                cc.restore();
            },
        });
    }

    // ------------------------------------------------------------------- the wall clock
    const CLOCK = { x: 1422, y: 150, r: 56 };
    function clockFace(c) {
        const { x, y, r } = CLOCK;
        cut(c, ell(x, y, r, r, 64), COL.navy, 'clockrim', { border: 2.4, shadow: 0.28, tex: { alpha: [0.25, 0.45] } });
        cut(c, ell(x, y, r - 9, r - 9, 64), '#fbf6ea', 'clockface', { border: 0, shadow: 0.25, tex: { alpha: [0.1, 0.22] } });
        for (let k = 0; k < 60; k++) {
            const a = (k / 60) * Math.PI * 2, big = k % 5 === 0, r0 = r - (big ? 20 : 15), r1 = r - 12;
            if (!big) {
                c.fillStyle = 'rgba(42,37,48,0.45)';
                c.beginPath();
                c.arc(x + Math.cos(a) * r1, y + Math.sin(a) * r1, 0.9, 0, 7);
                c.fill();
            } else P.markerStroke(c, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], COL.ink, k % 15 === 0 ? 3.4 : 2.2, 'tk' + k, 0.85);
        }
        // the hook on the wall above
        cut(c, ell(x, y - r - 6, 3, 3, 12), COL.metal, 'clockhook', { border: 0.8, shadow: 0.3 });
    }
    function clockHands(g, t) {
        const { x, y } = CLOCK;
        const hand = (key, len, w, col, back = 8) => sprite('clock-' + key, { x: -w - 6, y: -len - 6, w: 2 * w + 12, h: len + back + 12 }, (c) => {
            cut(c, D.taper([[0, back], [0, -len * 0.4], [0, -len]], [w * 0.9, w, w * 0.35]), col, 'ch' + key, { border: 1, shadow: 0.25, tex: { alpha: [0.2, 0.4] } });
        }, 2.2);
        const at = (sp, a) => (g.save(), g.translate(x, y), g.rotate(a), sp.draw(g), g.restore());
        at(hand('h', 24, 6, COL.ink), (10 + 8 / 60) / 12 * Math.PI * 2);
        at(hand('m', 36, 4.5, COL.ink), (8 / 60) * Math.PI * 2);
        // the second hand ticks once a second
        const sec = sprite('clock-s', { x: -8, y: -46, w: 16, h: 64 }, (c) => {
            cut(c, R(-1, -42, 2, 54), COL.coral, 'csec', { border: 0.6, shadow: 0.25, tex: false });
            cut(c, ell(0, 10, 3.5, 3.5, 14), COL.coral, 'csecw', { border: 0.6, shadow: 0.2, tex: false });
        }, 2.2);
        at(sec, ((23 + Math.floor(t + 1e-6)) / 60) * Math.PI * 2);
        sprite('clock-cap', { x: -8, y: -8, w: 16, h: 16 }, (c) => cut(c, ell(0, 0, 4, 4, 16), COL.coral, 'ccap', { border: 1, shadow: 0.3 }), 2.2).draw((g.save(), g.translate(x, y), g));
        g.restore();
    }

    // ----------------------------------------------------------------- the wall calendar
    const CAL = { x0: 1136, y0: 92, x1: 1330, y1: 326 };
    const MONTHS = ['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May'];
    function calPicture(c, page, box) {
        const { x, y, w, h } = box, k = page % 4;
        const pf = (pts, col, seed) => flat(c, pts, col, 'calp' + page + seed, { tex: { alpha: [0.2, 0.4] } });
        pf(R(x, y, w, h), ['#bcd8e3', '#b3d6e4', '#cfe3c8', '#f1c9a8'][k], 'sky');
        if (k === 0) {
            pf(ell(x + w * 0.78, y + h * 0.28, 11, 11, 24), COL.coral, 'sun');
            pf([[x, y + h], [x + w * 0.3, y + h * 0.3], [x + w * 0.55, y + h * 0.75], [x + w * 0.72, y + h * 0.45], [x + w, y + h]], '#4a5a8a', 'mtn');
            pf([[x + w * 0.24, y + h * 0.42], [x + w * 0.3, y + h * 0.3], [x + w * 0.36, y + h * 0.42], [x + w * 0.3, y + h * 0.46]], '#f4f2ea', 'snow');
            pf([[x, y + h], [x, y + h * 0.8], [x + w * 0.5, y + h * 0.7], [x + w, y + h * 0.85], [x + w, y + h]], '#5f9a5a', 'meadow');
        } else if (k === 1) {
            pf(R(x, y + h * 0.55, w, h * 0.45), '#3f78a8', 'sea');
            pf([[x + w * 0.4, y + h * 0.78], [x + w * 0.62, y + h * 0.78], [x + w * 0.58, y + h * 0.86], [x + w * 0.44, y + h * 0.86]], COL.coral, 'hull');
            pf([[x + w * 0.5, y + h * 0.76], [x + w * 0.5, y + h * 0.3], [x + w * 0.62, y + h * 0.76]], '#fbf8ef', 'sail');
        } else if (k === 2) {
            pf([[x, y + h], [x, y + h * 0.5], [x + w, y + h * 0.4], [x + w, y + h]], '#7fae6a', 'field');
            const r = P.rng('flowers' + page);
            for (let i = 0; i < 14; i++) pf(ell(x + r() * w, y + h * (0.6 + r() * 0.35), 3, 3, 10), [COL.coral, COL.mustard, '#fbf8ef'][i % 3], 'fl' + i);
        } else {
            for (let i = 0; i < 7; i++) pf(R(x + i * w / 7 + 2, y + h * (0.3 + ((i * 37) % 30) / 100), w / 7 - 3, h), ['#5a6079', '#4a5a8a', '#6b6f88'][i % 3], 'bld' + i);
        }
    }
    function calendar(g, page = 0) {
        const { x0, y0, x1, y1 } = CAL, months = BRAND.copy.months ?? MONTHS;
        sprite('office-cal' + page, { x: x0 - 30, y: y0 - 60, w: x1 - x0 + 60, h: y1 - y0 + 80 }, (c) => {
            // nail and hanging cord
            P.markerStroke(c, [[x0 + 50, y0 + 2], [1233, 58], [x1 - 50, y0 + 4]], '#5b4a44', 1.8, 'calcord', 0.9);
            cut(c, ell(1233, 57, 3.4, 3.4, 14), COL.metal, 'calnail', { border: 0.8, shadow: 0.3 });
            // the pages underneath (thickness), then the current page
            for (const k of [2, 1]) cut(c, [[x0 + k * 1.5, y0 + k * 2], [x1 + k * 1.5, y0 + 4 + k * 2], [x1 - 4 + k * 1.5, y1 + k * 2.5], [x0 - 2 + k * 1.5, y1 - 4 + k * 2.5]], D.shade(COL.paper, -4 * k), 'calunder' + k, { border: 1.2, shadow: 0.2, tex: { alpha: [0.1, 0.2] } });
            cut(c, [[x0, y0], [x1, y0 + 4], [x1 - 4, y1], [x0 - 2, y1 - 4]], COL.paper, 'calpage' + page, {
                border: 1.6, shadow: 0.18, tex: { alpha: [0.1, 0.22] },
                inner: (cc) => {
                    calPicture(cc, page, { x: x0 + 10, y: y0 + 16, w: x1 - x0 - 22, h: 88 });
                    // month and year
                    cc.font = '21px "Hand"';
                    cc.fillStyle = COL.ink;
                    cc.fillText(months[page % 12], x0 + 12, y0 + 128);
                    cc.font = '13px "Hand"';
                    cc.fillStyle = COL.grey;
                    cc.textAlign = 'right';
                    cc.fillText('2026', x1 - 14, y0 + 128);
                    P.markerStroke(cc, [[x0 + 12, y0 + 134], [x0 + 12 + cc.measureText(months[page % 12]).width * 1.6, y0 + 135]], COL.coral, 2.4, 'calul' + page, 0.8);
                    // weekday initials and the days
                    const cw = (x1 - x0 - 24) / 7, first = (page * 3 + 1) % 7, days = [30, 31, 31, 30][page % 4];
                    cc.textAlign = 'center';
                    cc.font = '9px "Hand"';
                    (BRAND.copy.weekdays ?? 'MTWTFSS').split('').forEach((d, i) => ((cc.fillStyle = i === 6 ? COL.coral : COL.grey), cc.fillText(d, x0 + 12 + cw * (i + 0.5), y0 + 148)));
                    cc.font = '11px "Hand"';
                    const circled = [4, 15, 20, 30][page % 4];
                    for (let d = 1; d <= days; d++) {
                        const i = (first + d - 1) % 7, row = Math.floor((first + d - 1) / 7);
                        if (row > 4) continue;
                        const cx = x0 + 12 + cw * (i + 0.5), cy = y0 + 162 + row * 15;
                        cc.fillStyle = i === 6 ? COL.coral : COL.ink;
                        cc.globalAlpha = 0.8;
                        cc.fillText(String(d), cx, cy);
                        cc.globalAlpha = 1;
                        if (d === circled) P.markerStroke(cc, Array.from({ length: 18 }, (_, j) => { const a = (j / 16) * Math.PI * 2 - 0.4; return [cx + Math.cos(a) * 10, cy - 4 + Math.sin(a) * 7.5]; }), COL.coral, 1.8, 'calring' + page, 0.9);
                        if ((d * 7 + page) % 11 === 0) (cc.fillStyle = COL.green, cc.beginPath(), cc.arc(cx + 7, cy - 8, 1.8, 0, 7), cc.fill());
                    }
                    cc.textAlign = 'left';
                },
            });
            // spiral binding: holes in the page and wire loops over the top edge
            for (let i = 0; i < 9; i++) {
                const hx = x0 + 18 + i * ((x1 - x0 - 36) / 8), hy = y0 + 9 + (i / 8) * 4;
                c.fillStyle = 'rgba(50,40,50,0.6)';
                c.beginPath();
                c.ellipse(hx, hy, 2.6, 3.2, 0, 0, 7);
                c.fill();
                P.markerStroke(c, Array.from({ length: 10 }, (_, k) => { const a = Math.PI * (0.55 + (k / 9) * 1.05); return [hx + 2 + Math.cos(a) * 5, hy - 5 + Math.sin(a) * 10]; }), '#8e929c', 2.6, 'calwire' + i, 0.95);
            }
        }, 1.4).draw(g);
    }

    // ---------------------------------------------------------------------- BACK layer
    function back(g, t, o = {}) {
        sprite('office-back', { x: -60, y: -60, w: 1720, h: 780 }, (c) => {
            wall(c);
            print(c);
            sockets(c);
            windowSet(c);
            shelf(c);
            corkboard(c);
            bookcase(c);
            clockFace(c);
        }, 1.1).draw(g);
        // the right curtain is static; the left one sways from the rod on twos
        sprite('office-curtainR', { x: 290, y: 40, w: 90, h: 500 }, curtainR, 1.2).draw(g);
        const d = drawing(t), sway = 0.0045 * Math.sin(d * 0.5) + 0.002 * Math.sin(d * 1.3 + 1);
        g.save();
        g.translate(80, 64);
        g.rotate(sway);
        g.translate(-80, -64);
        sprite('office-curtainL', { x: -20, y: 40, w: 200, h: 580 }, curtainL, 1.2).draw(g);
        g.restore();
        sprite('office-rod', { x: -10, y: 40, w: 400, h: 44 }, rod, 1.3).draw(g);
        clockHands(g, t);
        if (o.calendar !== false) calendar(g, o.page ?? 0);
        sprite('office-chair', { x: 280, y: 330, w: 390, h: 330 }, chair, 1.2).draw(g);
    }

    // ---------------------------------------------------------------------- DESK layer
    const LAMP = { base: [104, 676], elbow: [128, 516], head: [196, 470], axis: 1.25 };
    function lampLight(c) {
        const { head, axis } = LAMP, mouth = [head[0] + Math.cos(axis) * 60, head[1] + Math.sin(axis) * 60];
        const nx = -Math.sin(axis), ny = Math.cos(axis);
        // pool of light on the desk and the beam: flat translucent tissue, no gradient
        c.save();
        c.globalAlpha = 0.5;
        flat(c, ell(262, 664, 118, 17, 48), '#fff1b8', 'lamppool', { jag: 1.2, tex: { alpha: [0.1, 0.25] } });
        c.globalAlpha = 0.22;
        flat(c, [[mouth[0] + nx * 32, mouth[1] + ny * 32], [mouth[0] - nx * 32, mouth[1] - ny * 32], [146, 664], [378, 664]], '#fff1b8', 'lampbeam', { jag: 1.4, tex: { alpha: [0.1, 0.2] } });
        c.restore();
    }
    function lamp(c) {
        const { base, elbow, head, axis } = LAMP, col = COL.green;
        cut(c, ell(base[0], base[1], 52, 13, 40), D.shade(col, -8), 'lampbase', { border: 2, shadow: 0.3 });
        cut(c, D.cspline([[base[0] - 26, base[1] - 4], [base[0] - 18, base[1] - 20], [base[0] + 18, base[1] - 20], [base[0] + 26, base[1] - 4]], 5), col, 'lampdome', { border: 1.8, shadow: 0.2 });
        // two parallel rods per arm with a spring beside them
        const rods = (a, b, key) => {
            const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = -dy / l * 5, ny = dx / l * 5;
            for (const s of [-1, 1]) cut(c, P.noodle([[a[0] + nx * s, a[1] + ny * s], [b[0] + nx * s, b[1] + ny * s]], 4.5), col, key + s, { border: 1.2, shadow: 0.2 });
            const spring = [];
            for (let k = 0; k <= 16; k++) {
                const u = 0.25 + (k / 16) * 0.4;
                spring.push([a[0] + dx * u + nx * (k % 2 ? 2.8 : 1.6), a[1] + dy * u + ny * (k % 2 ? 2.8 : 1.6)]);
            }
            P.markerStroke(c, spring, '#b9bcc4', 1.4, key + 'spring', 0.95);
        };
        rods([base[0], base[1] - 18], elbow, 'lamplow');
        rods(elbow, head, 'lampup');
        for (const [k, p] of [[base[0], base[1] - 18], elbow, head].entries()) {
            cut(c, ell(p[0], p[1], 8, 8, 20), D.shade(col, -10), 'lampjoint' + k, { border: 1.2, shadow: 0.25 });
            c.fillStyle = '#c9ccd4';
            c.beginPath();
            c.arc(p[0], p[1], 2.4, 0, 7);
            c.fill();
        }
        // the shade: a cone along the axis, its lit inside and the bulb
        // (local frame: x along the axis, the mouth at x = 60)
        const back = Array.from({ length: 9 }, (_, k) => { const a = Math.PI / 2 + (k / 8) * Math.PI; return [4 + Math.cos(a) * 14, Math.sin(a) * 14]; });
        const shade = [...back, [4, -14], [60, -32], [60, 32], [4, 14]].reverse();
        cut(c, xf(R(-22, -6, 14, 12), head[0], head[1], axis), D.shade(col, -10), 'lampneck', { border: 1.2, shadow: 0.2 });
        cut(c, xf(shade, head[0], head[1], axis), col, 'lampshade', {
            border: 2.2, shadow: 0.25, tex: { alpha: [0.25, 0.45] },
            inner: (cc) => {
                // a lighter band along the top edge: the shade is rounded metal
                cc.save();
                cc.translate(head[0], head[1]);
                cc.rotate(axis);
                cc.fillStyle = D.shade(col, 12);
                cc.globalAlpha = 0.6;
                cc.beginPath();
                cc.moveTo(4, -14);
                cc.lineTo(60, -32);
                cc.lineTo(60, -24);
                cc.lineTo(4, -8);
                cc.fill();
                cc.restore();
            },
        });
        cut(c, xf(ell(60, 0, 7, 32, 32), head[0], head[1], axis), '#f8e7a8', 'lampinside', { border: 1.4, shadow: 0.1 });
        cut(c, xf(ell(62, 0, 5, 12, 20), head[0], head[1], axis), '#fffbe8', 'lampbulb', { border: 1, shadow: 0 });
    }
    function papers(c) {
        // the stack from the bottom up: kraft folder, sheets, green folder with a tab, coral
        // folder, sheets; its top face, a sticky note and a binder clip
        const layers = [[140, 684, 152, 10, COL.kraft], [146, 674, 146, 5, '#fbfaf5'], [138, 669, 150, 5, '#f3eee2'], [144, 664, 148, 9, COL.green], [150, 655, 140, 5, '#fbfaf5'], [142, 650, 146, 8, COL.coral], [148, 642, 142, 5, '#fbfaf5'], [144, 637, 146, 5, '#f6f1e6']];
        for (const [i, [x, y, w, h, col]] of layers.entries()) cut(c, [[x, y], [x + w, y - 1], [x + w + 1, y - h], [x, y - h + 0.5]], col, 'ply' + i, { border: 1, shadow: 0.2, tex: { alpha: [0.15, 0.3] } });
        cut(c, [[260, 667], [280, 666], [282, 680], [262, 681]], D.shade(COL.green, 8), 'foldertab', { border: 1, shadow: 0.2 });
        cut(c, [[144, 632], [290, 630], [300, 620], [156, 622]], '#fbfaf5', 'plytop', { border: 1, shadow: 0.15, tex: { alpha: [0.1, 0.2] }, inner: (cc) => { cc.fillStyle = 'rgba(60,50,70,0.35)'; for (let k = 0; k < 3; k++) cc.fillRect(170 + k * 4, 626 - k * 2.5, 100 - k * 12, 1.1); } });
        local(c, 168, 646, -0.05, (cc) => sticky(cc, 30, 26, COL.sticky, 'plysticky', 2));
        cut(c, R(236, 624, 26, 16), '#2e2a33', 'clip', { border: 1.2, shadow: 0.25 });
        for (const dx of [240, 256]) P.markerStroke(c, [[dx, 626], [dx + 2, 606], [dx - 2 + (dx - 248) * 0.3, 604]], '#b9bcc4', 1.6, 'clipw' + dx, 0.95);
    }
    function notebook(c) {
        cut(c, [[378, 676], [596, 676], [584, 644], [392, 644]], COL.navy, 'nbcover', { border: 1.6, shadow: 0.25 });
        for (const [k, pts] of [[[384, 672], [486, 672], [486, 647], [398, 647]], [[486, 672], [590, 672], [578, 647], [486, 647]]].entries()) {
            cut(c, pts, '#fbfaf5', 'nbpage' + k, {
                border: 0.8, shadow: 0.12, tex: { alpha: [0.1, 0.2] },
                inner: (cc, box) => {
                    cc.fillStyle = 'rgba(120,150,200,0.45)';
                    for (let y = 651; y < 672; y += 4.5) cc.fillRect(box.x, y, box.w, 0.7);
                    D.cursive(cc, { x: box.x + 12, y: 646, w: box.w - 24, h: 24 }, '#3f3a55', { lineH: 4.5, xh: 1.6, hw: 1.6, width: 0.6, alpha: 0.6, gap: 3, seed: 'nb' + k });
                },
            });
        }
        for (let k = 0; k < 5; k++) P.markerStroke(c, Array.from({ length: 8 }, (_, j) => { const a = Math.PI * (j / 7); return [486 + Math.cos(a) * 4, 650 + k * 5 - Math.sin(a) * 2]; }), '#8e929c', 1.4, 'nbring' + k, 0.9);
        // a pencil lying across the right page
        cut(c, D.cspline([[520, 668], [596, 656], [598, 662], [522, 673]], 3), COL.mustard, 'nbpencil', { border: 1.2, shadow: 0.25 });
        cut(c, [[520, 668], [522, 673], [506, 673]], '#e8c9a0', 'nbpenciltip', { border: 0.8, shadow: 0.15 });
        cut(c, R(596, 654, 8, 9), COL.pink, 'nbeaser', { border: 0.8, shadow: 0.15 });
    }
    function laptop(c) {
        // turned towards Laura: we see the back of the lid at an angle, the base under it
        cut(c, [[600, 682], [806, 676], [792, 660], [612, 664]], D.shade(COL.silver, -8), 'lapbase', { border: 1.6, shadow: 0.3, tex: { alpha: [0.2, 0.35] } });
        cut(c, [[614, 666], [790, 660], [808, 512], [644, 502]], COL.silver, 'laplid', {
            border: 2, shadow: 0.28, tex: { alpha: [0.2, 0.4] },
            inner: (cc) => {
                cc.fillStyle = 'rgba(255,255,255,0.35)';
                cc.beginPath();
                cc.moveTo(650, 510);
                cc.lineTo(664, 511);
                cc.lineTo(636, 660);
                cc.lineTo(624, 660);
                cc.fill();
            },
        });
        // the screen's dark bezel seen edge-on along the near side, and the hinge
        cut(c, [[610, 667], [640, 501], [648, 502], [619, 667]], '#34303c', 'lapbezel', { border: 1, shadow: 0.15, tex: false });
        cut(c, [[618, 668], [790, 662], [790, 656], [620, 660]], D.shade(COL.silver, -18), 'laphinge', { border: 0.8, shadow: 0.15 });
        // stickers: the brand mark, a coral circle with a star, a green tag
        local(c, 728, 574, -0.12, (cc) => { cut(cc, ell(0, 0, 22, 22, 32), COL.paper, 'lapstk1', { border: 1.2, shadow: 0.2 }); Props.mark(cc, 0, 0, 0.3, 'lap'); });
        cut(c, ell(676, 620, 13, 13, 28), COL.coral, 'lapstk2', { border: 1.4, shadow: 0.2, inner: (cc) => { cc.fillStyle = '#fbf2ea'; cc.beginPath(); for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 - Math.PI / 2, rr = k % 2 ? 3 : 7; cc.lineTo(676 + Math.cos(a) * rr, 620 + Math.sin(a) * rr); } cc.fill(); } });
        local(c, 770, 626, 0.2, (cc) => cut(cc, R(-16, -8, 32, 16), COL.green, 'lapstk3', { border: 1.2, shadow: 0.2, inner: (c2) => (c2.fillStyle = '#e8f1ea', c2.fillRect(-10, -2, 20, 3)) }));
    }
    function penCup(c) {
        const cx = 866, by = 682;
        // what sticks out: a ruler, a pencil, a pen, a brush, a marker (behind the cup)
        cut(c, xf(R(-5, -104, 10, 104), cx - 16, by - 20, -0.18), '#f3ecd6', 'ruler', { border: 1.2, shadow: 0.2, inner: (cc) => { cc.save(); cc.translate(cx - 16, by - 20); cc.rotate(-0.18); cc.fillStyle = 'rgba(42,37,48,0.6)'; for (let y = -100; y < -10; y += 6) cc.fillRect(-5, y, y % 30 === 0 ? 6 : 3, 1); cc.restore(); } });
        const stick = (x0, y0, x1, y1, w, col, tipCol, key) => {
            cut(c, P.noodle([[x0, y0], [x1, y1]], w), col, key, { border: 1.2, shadow: 0.2 });
            const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
            if (tipCol) cut(c, [[x1 - uy * w / 2, y1 + ux * w / 2], [x1 + ux * 12, y1 + uy * 12], [x1 + uy * w / 2, y1 - ux * w / 2]], tipCol, key + 'tip', { border: 0.8, shadow: 0.15 });
        };
        stick(cx - 4, by - 30, cx - 10, by - 118, 8, COL.mustard, '#e8c9a0', 'cuppencil');
        P.markerStroke(c, [[cx - 11, by - 118], [cx - 11.6, by - 126]], '#3d3540', 2.4, 'cuplead', 1);
        stick(cx + 4, by - 30, cx + 16, by - 124, 7, COL.navy, null, 'cuppen');
        cut(c, P.noodle([[cx + 15, by - 118], [cx + 17, by - 136]], 9), D.shade(COL.navy, -10), 'cuppencap', { border: 1, shadow: 0.2 });
        P.markerStroke(c, [[cx + 20, by - 132], [cx + 20, by - 110]], '#c9ccd4', 1.6, 'cuppenclip', 1);
        stick(cx + 12, by - 30, cx + 30, by - 96, 5, COL.woodLight, null, 'cupbrush');
        cut(c, P.noodle([[cx + 29, by - 94], [cx + 33, by - 106]], 6), '#b9bcc4', 'cupferrule', { border: 0.8, shadow: 0.15 });
        cut(c, D.taper([[cx + 33, by - 105], [cx + 35, by - 114], [cx + 36, by - 122]], [6, 6, 1.5]), '#3d2e2a', 'cupbristle', { border: 0.8, shadow: 0.1 });
        cut(c, P.noodle([[cx - 16, by - 40], [cx - 26, by - 90]], 11), COL.coral, 'cupmarker', { border: 1.2, shadow: 0.2 });
        cut(c, P.noodle([[cx - 25, by - 86], [cx - 28, by - 102]], 12), D.shade(COL.coral, -12), 'cupmarkercap', { border: 1, shadow: 0.2 });
        // the cup: sage ceramic with a cream dotted band and a rim
        cut(c, D.cspline([[cx - 30, by], [cx - 32, by - 64], [cx + 32, by - 64], [cx + 30, by]], 5), COL.sage, 'cup', {
            border: 2, shadow: 0.28, tex: { alpha: [0.25, 0.45] },
            inner: (cc) => {
                cc.fillStyle = '#f3ecd6';
                cc.fillRect(cx - 34, by - 40, 68, 12);
                cc.fillStyle = COL.coral;
                for (let x = cx - 28; x < cx + 30; x += 9) (cc.beginPath(), cc.arc(x, by - 34, 2.2, 0, 7), cc.fill());
                cc.fillStyle = 'rgba(255,255,255,0.3)';
                cc.fillRect(cx - 22, by - 58, 5, 50);
            },
        });
        cut(c, ell(cx, by - 64, 33, 5, 32), D.shade(COL.sage, 10), 'cuprim', { border: 1.4, shadow: 0.15 });
    }
    function deskSmall(c) {
        // phone face up: a thin slab with the screen seen edge-on and a charging cable
        cut(c, [[904, 684], [1004, 682], [996, 668], [912, 670]], '#2b2f45', 'phone', { border: 1.6, shadow: 0.3 });
        flat(c, [[914, 680], [994, 678], [988, 671], [920, 672]], '#4a5a8a', 'phonescreen', { tex: { alpha: [0.2, 0.3] } });
        P.markerStroke(c, [[918, 675], [950, 674]], 'rgba(255,255,255,0.7)', 1.2, 'phoneglint', 0.8);
        P.markerStroke(c, D.spline([[1004, 676], [1020, 680], [1024, 690], [1040, 688]], 6, false), '#e9e6de', 2.4, 'phonecable', 0.9);
        // sticky-note pad: front face with its layers, top face, and a pen beside it
        cut(c, [[1030, 684], [1086, 684], [1086, 656], [1030, 656]], COL.sticky, 'padfront', { border: 1.4, shadow: 0.28, inner: (cc) => { cc.fillStyle = 'rgba(160,120,40,0.35)'; for (let y = 660; y < 684; y += 3.2) cc.fillRect(1030, y, 56, 0.9); } });
        cut(c, [[1030, 656], [1086, 656], [1096, 646], [1040, 646]], D.shade(COL.sticky, 6), 'padtop', { border: 1.2, shadow: 0.12, inner: (cc) => P.scribble(cc, 1046, 653, 34, 1, 5, '#4b3f55', 'padtxt', { alpha: 0.5, scale: 0.5 }) });
        cut(c, P.noodle([[1034, 690], [1100, 686]], 6), COL.coral, 'padpen', { border: 1, shadow: 0.25 });
        // the letter tray: envelopes behind the wire front
        const env = (pts, col, seed, stamp) => cut(c, pts, col, seed, {
            border: 1.4, shadow: 0.22, tex: { alpha: [0.15, 0.3] },
            inner: (cc, box) => {
                P.scribble(cc, box.x + 12, box.y + 30, box.w * 0.5, 3, 7, '#5d5467', seed + 's', { alpha: 0.55, scale: 0.6 });
                if (stamp) {
                    cc.fillStyle = COL.coral;
                    cc.fillRect(box.x + box.w - 26, box.y + 10, 14, 16);
                    cc.strokeStyle = '#fbf2ea';
                    cc.setLineDash([2, 2]);
                    cc.strokeRect(box.x + box.w - 25, box.y + 11, 12, 14);
                    cc.setLineDash([]);
                }
            },
        });
        env([[1112, 676], [1210, 674], [1214, 596], [1116, 600]], '#fbfaf5', 'env1', true);
        env([[1122, 676], [1218, 676], [1216, 614], [1120, 612]], COL.kraft, 'env2', false);
        env([[1108, 676], [1196, 678], [1200, 628], [1106, 630]], '#eef1f6', 'env3', true);
        for (let x = 1106; x < 1224; x += 12) P.markerStroke(c, [[x, 650], [x + 0.5, 680]], COL.metal, 2.6, 'trayw' + x, 0.95);
        cut(c, R(1098, 644, 130, 8), COL.metal, 'traytop', { border: 1.4, shadow: 0.25 });
        cut(c, R(1098, 678, 130, 9), COL.metal, 'traybottom', { border: 1.4, shadow: 0.3 });
        // books lying flat at the right with a small succulent pot on top
        // a flat book at the right, low (the flag swings above; the front stack covers it)
        flatBook(c, 1462, 686, 120, 16, COL.navy, 'dfb0');
    }
    function deskBody(c) {
        cut(c, [[-60, 626], [1660, 616], [1660, 692], [-60, 696]], COL.woodLight, 'desktop', { border: 2.2, shadow: 0.2, inner: (cc, box) => D.woodGrain(cc, box, COL.woodLight, { seed: 'desktop', angle: -0.006 }) });
        cut(c, [[-60, 960], [-60, 710], [1660, 704], [1660, 960]], '#b8875a', 'apron', { border: 2, shadow: 0.2, inner: (cc, box) => D.woodGrain(cc, box, '#b8875a', { seed: 'apron' }) });
        // the drawer: its own board, a label holder and a pull
        cut(c, [[1010, 738], [1392, 736], [1394, 846], [1008, 848]], D.shade('#b8875a', 4), 'drawer', { border: 1.8, shadow: 0.28, inner: (cc, box) => D.woodGrain(cc, box, D.shade('#b8875a', 4), { seed: 'drawer' }) });
        cut(c, P.noodle(D.spline([[1150, 796], [1160, 806], [1240, 806], [1250, 796]], 6, false), 9), COL.metal, 'pull', { border: 1.4, shadow: 0.3 });
        cut(c, R(1178, 754, 44, 24), '#c9a54a', 'labelholder', { border: 1.2, shadow: 0.2, inner: (cc) => { cc.fillStyle = '#fbf7ee'; cc.fillRect(1183, 758, 34, 16); P.scribble(cc, 1186, 770, 26, 1, 6, '#4b3f55', 'drawerlbl', { alpha: 0.7, scale: 0.6 }); } });
        // the front edge of the top, in front of the apron
        cut(c, [[-60, 690], [1660, 684], [1660, 712], [-60, 716]], COL.woodDark, 'deskedge', { border: 2, shadow: 0.3, inner: (cc, box) => D.woodGrain(cc, box, COL.woodDark, { seed: 'deskedge' }) });
        // the seam between the apron's two boards
        for (const [a, b] of [[-60, 1006], [1398, 1660]]) (P.markerStroke(c, [[a, 832], [b, 830]], D.shade('#b8875a', -16), 2.2, 'seam' + a, 0.7), P.markerStroke(c, [[a, 835], [b, 833]], D.shade('#b8875a', 10), 1.2, 'seamL' + a, 0.6));
        // the laptop's charger cable falling over the edge and out of frame
        const cable = D.spline([[792, 680], [806, 690], [814, 712], [812, 760], [826, 820], [846, 870], [850, 960]], 8, false);
        P.markerStroke(c, cable.map(([x, y]) => [x + 1.5, y + 2.5]), 'rgba(40,20,30,0.25)', 5, 'cableS', 0.8);
        P.markerStroke(c, cable, '#ece8df', 4.2, 'cable', 0.95);
        // a sticky note stuck to the edge, its bottom corner lifting
        local(c, 764, 726, 0.07, (cc) => {
            sticky(cc, 52, 50, '#f2a38f', 'edgesticky', 3);
            cut(cc, [[26, 12], [26, 25], [12, 25]], D.shade('#f2a38f', -10), 'edgecurl', { border: 0.8, shadow: 0.25 });
        });
    }
    function desk(g, t) {
        sprite('office-desk', { x: -60, y: 440, w: 1720, h: 520 }, (c) => {
            deskBody(c);
            lampLight(c);
            papers(c);
            notebook(c);
            laptop(c);
            penCup(c);
            deskSmall(c);
            lamp(c);
        }, 1.2).draw(g);
    }

    // --------------------------------------------------------------------- FRONT layer
    const MUG = { x: 694, y: 694, w: 64, h: 78 };
    function mug(c) {
        const { x, y, w, h } = MUG, top = y - h;
        cut(c, P.noodle(D.spline([[x + w / 2 - 4, top + 18], [x + w / 2 + 20, top + 20], [x + w / 2 + 22, top + 48], [x + w / 2 - 4, top + 56]], 8, false), 11), '#f6efe2', 'mughandle', { border: 2, shadow: 0.25 });
        cut(c, D.cspline([[x - w / 2, top], [x - w / 2 + 2, y - 10], [x - w / 2 + 10, y], [x + w / 2 - 10, y], [x + w / 2 - 2, y - 10], [x + w / 2, top]], 5), '#f6efe2', 'mugbody', {
            border: 2.2, shadow: 0.28, tex: { alpha: [0.15, 0.3] },
            inner: (cc) => {
                cc.fillStyle = COL.coral;
                cc.fillRect(x - w / 2 - 4, top + 22, w + 8, 9);
                cc.fillStyle = COL.navy;
                cc.fillRect(x - w / 2 - 4, top + 34, w + 8, 3);
                P.markerStroke(cc, [[x - 14, top + 54], [x - 6, top + 50], [x + 2, top + 55], [x + 10, top + 50]], COL.green, 2.2, 'mugdoodle', 0.8);
                cc.fillStyle = 'rgba(255,255,255,0.45)';
                cc.fillRect(x - w / 2 + 6, top + 6, 5, h - 18);
            },
        });
        cut(c, ell(x, top, w / 2, 6, 36), D.shade('#f6efe2', -6), 'mugrim', { border: 1.4, shadow: 0.1 });
        flat(c, ell(x, top + 1.5, w / 2 - 5, 3.8, 32), '#5a3a2a', 'coffee', { tex: { alpha: [0.2, 0.4] } });
    }
    function steam(g, t) {
        const { x, y, w, h } = MUG, top = y - h, kit = Props.kit, tq = drawing(t) / 12;
        g.save();
        g.beginPath();
        g.rect(x - 400, top - 600, 800, 600);
        g.ellipse(x, top + 1.5, w / 2 - 5, 3.8, 0, 0, Math.PI * 2);
        g.clip();
        for (let i = 0; i < 2; i++) {
            const life = 2.4;
            for (let k = 0; k < 2; k++) {
                const age = tq + 0.7 * i + k * (life / 2) + 3;
                const cycle = Math.floor(age / life), f = (age % life) / life;
                const wsp = kit.wisp(`office${i}-${k}-${cycle % 3}`, { len: 170, width: 11, drift: 1, color: '#fffdf6' });
                g.save();
                g.globalAlpha = E.seg(f, 0, 0.15) * (1 - E.seg(f, 0.5, 1)) * 0.95;
                g.translate(x - 8 + i * 14 + f * 26, top + 46 - E.out(f) * 86);
                g.rotate(0.05 + f * 0.1);
                g.scale(1 + f * 0.5, 1 + f * 0.25);
                wsp.draw(g);
                g.restore();
            }
        }
        g.restore();
    }
    function plant(c) {
        // a potted plant beside the desk, nearer the camera: petioles from the pot (below the
        // frame) and broad pointed leaves with a midrib and veins
        const leaves = [
            { base: [34, 668], tip: [178, 520], w: 62, bend: 16, col: COL.leaf },
            { base: [4, 612], tip: [18, 446], w: 54, bend: -14, col: COL.leafDark },
            { base: [54, 770], tip: [200, 716], w: 50, bend: -12, col: COL.leafDark },
            { base: [-10, 740], tip: [-30, 590], w: 46, bend: 10, col: COL.leafLight },
        ];
        for (const [i, L] of leaves.entries()) cut(c, D.taper([[-60, 960], [(L.base[0] - 60) / 2 + 6, (L.base[1] + 960) / 2], L.base], [9, 8, 6]), D.shade(COL.leafDark, 4), 'fstem' + i, { border: 1.4, shadow: 0.2 });
        for (const [i, L] of leaves.entries()) {
            const [bx, by] = L.base, [tx, ty] = L.tip, dx = tx - bx, dy = ty - by, l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
            const at = (u, off) => [bx + dx * u + nx * off, by + dy * u + ny * off];
            const ctrl = [at(0, 0), at(0.25, L.bend * 0.7), at(0.5, L.bend), at(0.75, L.bend * 0.7), at(1, 0)];
            cut(c, D.taper(ctrl, [6, L.w * 0.85, L.w, L.w * 0.62, 2], 8), L.col, 'fleaf' + i, {
                border: 2.6, shadow: 0.3, tex: { alpha: [0.25, 0.45] },
                inner: (cc) => {
                    const mid = D.spline(ctrl, 8, false);
                    P.markerStroke(cc, mid.slice(1, -3), D.shade(L.col, 16), 2.2, 'fmid' + i, 0.75);
                    for (let k = 4; k < mid.length - 5; k += 4) {
                        const [px, py] = mid[k], [qx, qy] = mid[k + 1], ex = qx - px, ey = qy - py, el = Math.hypot(ex, ey) || 1, reach = L.w * 0.42 * Math.sin(Math.PI * (k / mid.length));
                        for (const sd of [-1, 1]) P.markerStroke(cc, [[px, py], [px + (ex / el) * reach * 0.8 - (ey / el) * reach * sd, py + (ey / el) * reach * 0.8 + (ex / el) * reach * sd]], D.shade(L.col, 12), 1.4, 'fvein' + i + k + sd, 0.55);
                    }
                },
            });
        }
    }
    // a stack of papers and folders at the right edge, nearer the camera than the desk items
    function frontStack(c) {
        const layers = [[1486, 776, 190, 16, COL.kraft], [1494, 760, 184, 7, '#fbfaf5'], [1482, 753, 196, 12, COL.navy], [1492, 741, 186, 7, '#f6f1e6'], [1488, 734, 190, 7, '#fbfaf5'], [1480, 727, 196, 12, COL.green], [1490, 715, 186, 7, '#fbfaf5']];
        for (const [i, [x, y, w, h, col]] of layers.entries()) cut(c, [[x, y], [x + w, y - 1], [x + w, y - h], [x + 1, y - h + 0.5]], col, 'fst' + i, { border: 1.6, shadow: 0.25, tex: { alpha: [0.15, 0.3] } });
        // coloured index tabs sticking out of the front
        for (const [k, [x, y, col]] of [[1520, 742, COL.coral], [1556, 730, COL.mustard], [1598, 748, COL.coral]].entries()) cut(c, R(x, y, 18, 12), col, 'ftab' + k, { border: 1, shadow: 0.2 });
        cut(c, [[1490, 708], [1680, 706], [1680, 690], [1508, 692]], '#fbfaf5', 'fsttop', { border: 1.4, shadow: 0.15, tex: { alpha: [0.1, 0.2] }, inner: (cc) => D.wordBars(cc, { x: 1520, y: 693, w: 150, h: 13 }, { cols: 50, rowH: 4.2, barH: 1.4, ink: '#8b8780', seed: 'fsttop' }) });
        // a paper clip on the top sheet
        P.markerStroke(c, [[1530, 704], [1530, 690], [1540, 688], [1542, 702], [1536, 702], [1535, 692]], '#9aa0ad', 1.8, 'fclip', 0.95);
    }
    function front(g, t) {
        sprite('office-mug', { x: MUG.x - 50, y: MUG.y - MUG.h - 16, w: 130, h: MUG.h + 30 }, mug, 1.6).draw(g);
        steam(g, t);
        // the plant sways gently from its pot, on twos
        const d = drawing(t), sway = 0.006 * Math.sin(d * 0.45 + 2) + 0.003 * Math.sin(d * 1.1);
        g.save();
        g.translate(-40, 900);
        g.rotate(sway);
        g.translate(40, -900);
        sprite('office-plant', { x: -110, y: 480, w: 300, h: 460 }, plant, 1.2).draw(g);
        g.restore();
        // (shifted left so the push-in never crops it away)
        sprite('office-stack', { x: 1460, y: 670, w: 240, h: 120 }, frontStack, 1.3).draw((g.save(), g.translate(-44, 0), g));
        g.restore();
    }

    return { COL, WIN, CAL, CLOCK, MUG, back, desk, front, calendar };
})();
