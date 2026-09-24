// Exterior shots (0–1.5, 6–7, 20–21, 24–26, 27–28 s), measured on the reference: the purple
// house with the girl in the window, the collage town (Town kit), the paper planes and the
// open sky of the flight shot. Overrides Sets.exterior and the five shots of shots.js.
(() => {
    const P = Paper, D = PaperDetail;
    // colours sampled on the reference (0.5 s, 6.5 s)
    const X = {
        sky: '#1d1f50', band: '#262b65', band2: '#343c7f', wall: '#3b2c66', wallInk: '#58498c', roof: '#161039',
        frame: '#ebe2c5', frameInk: '#9d8f70', sill: '#c6a175', curtain: '#e38c94', leaf: '#62a653', stem: '#2d5a3c',
        moon: '#eee4c4', star: '#f0d270', stick: '#f1dc95', plus: '#dcdaf0', pot: '#b7744b', red: '#d8433a',
    };
    const drawingOf = (t, t0) => Math.floor((t - t0) * 12 + 1e-6);

    // ------------------------------------------------------------------ sky pieces
    // a lighter band of torn paper whose top edge runs through pts (down to the bottom)
    function band(c, pts, color, seed) {
        const top = D.spline(pts, 5, false);
        P.cutout(c, [[-60, top[0][1]], ...top, [1060, top[top.length - 1][1]], [1060, 1100], [-60, 1100]], color, seed, {
            border: 2.8, borderVar: 0.9, jag: 1.6, step: 1.8, shadow: 0.2, paper: '#ece9f2', tex: { angle: 0, len: [60, 180], h: [8, 16], alpha: [0.25, 0.5], lVar: 3 },
        });
    }
    // five-pointed paper star, arms a little uneven (cut once per seed)
    function starPiece(c, x, y, r, rot, seed) {
        const rr = P.rng(seed), pts = [];
        for (let i = 0; i < 10; i++) {
            const a = rot - Math.PI / 2 + (i * Math.PI) / 5, R = i % 2 ? r * (0.5 + rr() * 0.06) : r * (0.92 + rr() * 0.16);
            pts.push([x + Math.cos(a) * R, y + Math.sin(a) * R]);
        }
        P.cutout(c, D.spline(pts, 3), X.star, seed, { border: 0.9, borderVar: 0.4, jag: 0.4, step: 1, shadow: 0.15, paper: '#fbf3d8', tex: { alpha: [0.15, 0.35], len: [4, 10], h: [2, 4] } });
    }
    // thin light '+' sparkle
    function plusMark(c, x, y, r, w = 1.3) {
        c.save();
        c.strokeStyle = X.plus;
        c.globalAlpha = 0.85;
        c.lineWidth = w;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(x - r, y);
        c.lineTo(x + r, y);
        c.moveTo(x, y - r);
        c.lineTo(x, y + r);
        c.stroke();
        c.restore();
    }
    // big '+' made of two yellow paper strips (flight shot)
    function plusPaper(c, x, y, r, rot, seed) {
        for (const [k, a] of [[0, rot], [1, rot + Math.PI / 2]]) {
            const ca = Math.cos(a), sa = Math.sin(a), w = r * 0.13;
            P.cutout(c, [[x - ca * r - sa * w, y - sa * r + ca * w], [x + ca * r - sa * w, y + sa * r + ca * w], [x + ca * r + sa * w, y + sa * r - ca * w], [x - ca * r + sa * w, y - sa * r - ca * w]], X.stick, seed + k, { border: 1, jag: 0.5, step: 1.2, shadow: 0.2, paper: '#fbf5e2', tex: { alpha: [0.15, 0.3], len: [6, 14], h: [2, 4] } });
        }
    }
    // the crescent moon, cut from graph paper; measured at 0.5 s (flight shot: × 1.18)
    const MOON = {
        out: [[129.5, 77.5], [110, 93.8], [98.8, 108.8], [92.5, 125], [91.3, 142.5], [95, 160], [102.5, 175], [115, 188.8], [130, 198.8], [150, 204.5], [165, 203.8], [182.5, 198]],
        inn: [[167.5, 195], [150, 177.5], [137.5, 161.3], [127.5, 142.5], [123.8, 122.5], [122.5, 103.8], [125, 87.5]],
    };
    function moonPiece(c, x, y, s) {
        const pts = [...MOON.out, ...MOON.inn].map(([a, b]) => [x + (a - 129.5) * s, y + (b - 77.5) * s]);
        P.cutout(c, D.spline(pts, 4), X.moon, 'moon3', { border: 1.2, borderVar: 0.5, jag: 0.5, step: 1.2, shadow: 0.2, paper: '#fbf7ea', tex: { alpha: [0.1, 0.22] }, inner: (cc, box) => {
            cc.save();
            cc.translate(x, y);
            cc.rotate(-0.5);
            Town.graph(cc, { x: -300, y: -300, w: 600, h: 600 }, { step: 14 * s, ink: '#a8b2c8', alpha: 0.75, width: 0.6 });
            cc.restore();
        } });
    }

    // ------------------------------------------------------------------ EXTERIOR SET
    // Sky with two torn bands, moon, stars and sparkles (all static: one sprite).
    const EXT_BANDS = [
        [[[-20, 268], [50, 275], [100, 290], [150, 285], [200, 295], [250, 291], [300, 296], [342, 307], [378, 291], [410, 283], [450, 276], [500, 262], [550, 250], [650, 243], [750, 238], [800, 240], [850, 247], [900, 263], [950, 259], [1020, 254]], X.band],
        [[[560, 560], [596, 545], [620, 535], [650, 523], [700, 514], [750, 505], [805, 501], [850, 502], [900, 500], [925, 509], [959, 509], [1020, 498]], X.band2],
    ];
    const EXT_STARS = [[68, 59, 10, 0.1], [311, 76, 7.5, -0.2], [522, 53, 8.5, 0.3], [837, 77, 14, -0.1], [966, 51, 6.2, 0.25], [418, 193, 12, 0.15], [940, 198, 7.6, -0.3], [241, 293, 5.7, 0.2], [77, 340, 6, -0.15], [912, 396, 7, 0.1], [393, 401, 4.5, 0]];
    const EXT_PLUS = [[192, 242, 8], [565, 153, 6], [907, 138, 7], [953, 305, 7]];
    function extSky(g) {
        WL.sprite('ext-sky3', { x: -20, y: -20, w: 1040, h: 1040 }, (c) => {
            c.fillStyle = X.sky;
            c.fillRect(-20, -20, 1040, 1040);
            P.marker(c, { x: -60, y: -40, w: 1120, h: 1080 }, X.sky, 'extsky', { angle: 0, len: [80, 220], h: [10, 20], lVar: 3, alpha: [0.25, 0.55], density: 1 });
            EXT_BANDS.forEach(([pts, col], i) => band(c, pts, col, 'extband' + i));
            moonPiece(c, 129.5, 77.5, 1);
            EXT_STARS.forEach(([x, y, r, rot], i) => starPiece(c, x, y, r, rot, 'exs' + i));
            EXT_PLUS.forEach(([x, y, r]) => plusMark(c, x, y, r));
        }, 1.1).draw(g);
    }
    // the purple house: wall with handwriting, roof slab, ivy, window frame, sill
    const WIN = { x0: 100, y0: 569, x1: 456, y1: 922 }; // the window opening
    function extHouseBack(g) {
        WL.sprite('ext-house3', { x: -20, y: 370, w: 640, h: 650 }, (c) => {
            P.cutout(c, [[-30, 470], [596, 418], [597, 1030], [-30, 1030]], X.wall, 'extwall', { border: 2.4, borderVar: 0.7, jag: 1.2, shadow: 0.25, paper: '#efeaf2', tex: { angle: 0, len: [60, 160], h: [8, 14], alpha: [0.2, 0.45], lVar: 3 },
                inner: (cc, box) => D.cursive(cc, { x: box.x, y: 420, w: box.w, h: 620 }, X.wallInk, { seed: 'extwalltext', lineH: 25, xh: 6.8, hw: 4.6, width: 1.35, alpha: 0.8, gap: 10 }) });
            P.cutout(c, [[-30, 443], [607, 382.5], [605.5, 421], [-30, 480]], X.roof, 'extroof', { border: 2.4, borderVar: 0.8, jag: 1.3, shadow: 0.35, paper: '#f0edf4', tex: { angle: -0.09, len: [60, 160], h: [6, 12], alpha: [0.25, 0.5], lVar: 3 } });
            // ivy: a wavy stem with leaves on alternate sides
            const stem = D.spline([[41, 481], [34, 569], [44, 644], [31, 725], [41, 788], [25, 862], [34, 944], [22, 1020]], 8, false);
            P.markerStroke(c, stem, X.stem, 3.2, 'ivystem2', 0.95);
            [[59, 481, 1], [25, 503, -1], [61, 549, 1], [23, 587.5, -1], [51, 633, 1], [17, 674, -1], [56, 725, 1], [19, 767.5, -1], [45, 816, 1], [11, 859, -1], [50, 908, 1], [12.5, 951, -1], [39, 994, 1]].forEach(([x, y, sd], i) => {
                const a = sd > 0 ? -0.35 : Math.PI + 0.35, ca = Math.cos(a), sa = Math.sin(a);
                const leaf = D.spline([[-10, 0], [-4, -6.5], [5, -6], [11, 0], [4, 6], [-5, 6]], 5).map(([u, v]) => [x + u * ca - v * sa, y + u * sa + v * ca]);
                P.cutout(c, leaf, X.leaf, 'ivyleaf' + i, { border: 1.1, jag: 0.4, step: 1, shadow: 0.2, paper: '#f3f5e8', tex: { alpha: [0.2, 0.4], len: [5, 12], h: [2, 4] } });
                P.markerStroke(c, [[x - 6 * ca, y - 6 * sa], [x + 6 * ca, y + 6 * sa]], D.shade(X.leaf, -12), 0.8, 'ivyvein' + i, 0.5);
            });
        }, 1.15).draw(g);
    }
    // the window dressing seen from outside: curtains and the pot, over the interior view
    function extWindowDressing(g) {
        WL.sprite('ext-dressing3', { x: 90, y: 560, w: 375, h: 370 }, (c) => {
            const curtain = (edge, xo, seed) => P.cutout(c, [[xo, 560], ...D.spline(edge, 6, false), [xo, 930]], X.curtain, seed, { border: 1.6, borderVar: 0.6, jag: 0.8, shadow: 0.2, paper: '#fbeef0', tex: { angle: Math.PI / 2, len: [30, 90], h: [5, 10], alpha: [0.25, 0.5], lVar: 4 } });
            curtain([[178, 566], [159, 631], [141, 700], [123, 775], [134, 844], [156, 926]], 96, 'extcurtL');
            curtain([[378, 566], [400, 644], [417.5, 700], [431, 775], [419, 844], [400, 926]], 460, 'extcurtR');
            // pot with a red flower and two leaves
            P.markerStroke(c, D.spline([[428, 870], [424, 848], [412, 830]], 5, false), X.stem, 2, 'potstem', 0.95);
            P.cutout(c, D.spline([[416, 866], [405, 850], [404, 834], [412, 838], [420, 852]], 4), X.leaf, 'potleafL', { border: 1.1, shadow: 0.15, jag: 0.4, step: 1 });
            P.cutout(c, D.spline([[438, 866], [446, 850], [458, 842], [455, 856], [446, 866]], 4), X.leaf, 'potleafR', { border: 1.1, shadow: 0.15, jag: 0.4, step: 1 });
            P.cutout(c, P.circleUnion([[0, -5, 3.6], [4.8, -1.6, 3.6], [3, 4, 3.6], [-3, 4, 3.6], [-4.8, -1.6, 3.6]]).map(([x, y]) => [x + 410, y + 827]), X.red, 'potflower', { border: 0.9, shadow: 0.15, jag: 0.3, step: 0.8 });
            c.fillStyle = '#f2c640';
            c.beginPath();
            c.arc(410, 827, 2.4, 0, Math.PI * 2);
            c.fill();
            P.cutout(c, [[404, 868], [453, 868], [448, 924], [409, 924]], X.pot, 'extpot', { border: 1.2, shadow: 0.2, jag: 0.5, step: 1.2, tex: { alpha: [0.2, 0.4], len: [8, 20], h: [3, 6] } });
        }, 1.3).draw(g);
    }
    function extFrame(g) {
        WL.sprite('ext-frame3', { x: 40, y: 530, w: 480, h: 440 }, (c) => {
            P.cutout(c, [[72, 540.5], [484, 540.5], [484, 925], [456, 925], [456, 569], [100, 569], [100, 925], [72, 925]], X.frame, 'extframe', {
                border: 1.6, borderVar: 0.5, jag: 0.8, shadow: 0.28, paper: '#fbf8ee', tex: { alpha: [0.12, 0.28] },
                inner: (cc) => {
                    // tiny handwriting: two rows on the top bar, short rows down the sides
                    D.cursive(cc, { x: 100, y: 540, w: 360, h: 26 }, X.frameInk, { seed: 'frametop', lineH: 8.5, xh: 1.9, hw: 1.5, width: 0.55, alpha: 0.85, gap: 3 });
                    for (const x of [75, 459]) D.cursive(cc, { x, y: 572, w: 22, h: 350 }, X.frameInk, { seed: 'frameside' + x, lineH: 12, xh: 1.8, hw: 1.3, width: 0.55, alpha: 0.8, gap: 6 });
                },
            });
            P.cutout(c, [[47, 922], [505, 921.5], [505.5, 959.5], [47.5, 959]], X.sill, 'extsill', { border: 1.8, borderVar: 0.5, jag: 0.8, shadow: 0.35, paper: '#fbf6ea', tex: { angle: 0, len: [30, 90], h: [4, 8], alpha: [0.2, 0.45] } });
        }, 1.2).draw(g);
    }
    // The girl in the window is the interior set seen through the opening: its camera maps
    // the girl's head (interior coords) onto her head in the window (263, 724) at zoom Z, and
    // the girl is drawn bigger (GS) than in the interior shots, as the reference does.
    const WV = { Z: 0.444, GS: 1.18, GX: 466, EX: 263, EY: 727 };
    // her arms resting on the sill, pen in hand (girl-local units, desk edge at y = 0)
    const SILL_ARMS = [[[-104, -236], [-149, -116], [11, -65]], [[104, -236], [203, -128], [56, -65]]];
    function extWindow(g, t, env, o) {
        g.save();
        g.beginPath();
        g.rect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0 + 4);
        g.clip();
        const IY = 915 - 425 * WV.GS;
        g.save();
        g.translate(WV.EX - 500, WV.EY - 500);
        // her head holds still, tilted (cheeks measured at (231, 754) and (300, 740) in every shot)
        const girl = { x: WV.GX, s: WV.GS, pose: 'desk', arms: SILL_ARMS, hands: [null, null], eyes: 'up', mouth: 'smile', tilt: -0.19, ...o.girl };
        // the interior's own drawing on the wall would peek out beside the right curtain: the
        // window view shows plain wall there (painted behind the girl, in interior units)
        const wallPatch = (gi) => WL.sprite('ext-wallpatch', { x: 690, y: 30, w: 280, h: 380 }, (c) => P.cutout(c, [[700, 36], [962, 36], [962, 400], [700, 400]], WL.COL.wall, 'extwallpatch', { border: 0, shadow: 0, jag: 0.3, tex: { angle: 0, len: [60, 160], h: [14, 24], alpha: [0.3, 0.6] } }), 0.6).draw(gi);
        Sets.interior(g, t, env, { zoom: WV.Z, cx: WV.GX, cy: IY, pinned: wallPatch, ...o.window, girl });
        g.restore();
        extWindowDressing(g);
        if (o.pen !== false) {
            // the blue marker in her hands (from the tip up to the cap)
            P.markerStroke(g, [[276, 883], [299, 913]], '#3a5fb5', 7.2, 'extpen', 1);
            P.markerStroke(g, [[279, 887], [292, 904]], '#5b7fcc', 2, 'extpen2', 0.6);
        }
        if (o.windowOver) o.windowOver(g);
        g.restore();
    }
    // o.flower: { x, y, R, ...WL.flower options } | false ; o.burst: burst options
    // o.girl: girl options ; o.window: interior options (extra, pinned…) ; o.pen: false hides
    // her marker ; o.town(g): over the town ; o.planes(g): planes over the town, behind the
    // house ; o.windowOver(g): inside the window, over the curtains ; o.over(g): in front of all
    Sets.exterior = (g, t, env, o = {}) => {
        extSky(g);
        if (o.flower !== false) {
            const f = o.flower ?? {};
            if (o.burst) burst(g, f.x ?? 664, f.y ?? 260, o.burst);
            WL.flower(g, f.x ?? 664, f.y ?? 260, f.R ?? 120, { t, face: 1.65, rayW: 1.2, ...f });
        }
        Town.draw(g, Town.EXT, 'ext');
        if (o.town) o.town(g);
        if (o.planes) o.planes(g);
        extHouseBack(g);
        extWindow(g, t, env, o);
        extFrame(g);
        if (o.over) o.over(g);
    };

    // ------------------------------------------------------------------ flower burst
    // yellow paper sticks radiating from the flower when a plane reaches it.
    // o: { n, r0, r1, rot, seed } in logical units round (x, y); sticks cut once (5 variants)
    function stickSprite(k) {
        return WL.sprite('burststick' + (k % 5), { x: -4, y: -32, w: 8, h: 64 }, (c) => {
            const r = P.rng('bstick' + (k % 5)), w = 2.1 + r() * 0.6;
            P.cutout(c, [[-w, -30], [w, -30 + r()], [w * 0.9, 30], [-w * 1.05, 30 - r()]], X.stick, 'bstick' + (k % 5), { border: 0.7, jag: 0.35, step: 1, shadow: 0.15, paper: '#fdf8e8', tex: { alpha: [0.15, 0.3], len: [6, 14], h: [2, 3] } });
        }, 3);
    }
    function burst(g, x, y, o) {
        const r = P.rng(o.seed ?? 'burst'), n = o.n ?? 16;
        for (let k = 0; k < n; k++) {
            const a = (o.rot ?? 0) + (k / n) * Math.PI * 2 + (r() - 0.5) * 0.25;
            const r0 = (o.r0 ?? 190) * (0.9 + r() * 0.2), len = (o.len ?? 40) * (0.6 + r() * 0.8);
            if (o.skip && r() < o.skip) continue;
            g.save();
            g.translate(x + Math.cos(a) * (r0 + len / 2), y + Math.sin(a) * (r0 + len / 2));
            g.rotate(a + Math.PI / 2);
            g.scale(1, len / 60);
            stickSprite(k).draw(g);
            g.restore();
        }
    }

    // ------------------------------------------------------------------ plane tracks
    // A track is measured on the reference: keys [t, N, FR, WB] (nose, fold rear, wing back)
    // at a few drawings, pinned per drawing by the tracked centroid (cen: [t, x, y]) so the
    // curve of the flight is the reference's and not a straight line between keys.
    // pre: trail points before the first key (where it came from); to: last visible drawing.
    const lerp2 = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    function interp(list, t, n) {
        // list rows [t, ...values]; returns the values interpolated at t (clamped)
        if (t <= list[0][0]) return list[0].slice(1, 1 + n);
        for (let i = 1; i < list.length; i++) {
            if (t <= list[i][0] + 1e-6) {
                const u = (t - list[i - 1][0]) / (list[i][0] - list[i - 1][0]);
                return list[i].slice(1, 1 + n).map((v, k) => (Array.isArray(v) ? lerp2(list[i - 1][1 + k], v, u) : list[i - 1][1 + k] + (v - list[i - 1][1 + k]) * u));
            }
        }
        return list[list.length - 1].slice(1, 1 + n);
    }
    function poseAt(tr, t) {
        const [N, FR, WB] = interp(tr.keys, t, 3);
        let d = [0, 0];
        if (tr.cen) {
            const c = interp(tr.cen.map(([tt, x, y]) => [tt, [x, y]]), t, 1)[0];
            // the centroid the keys alone would give, interpolated between the same keys
            const ck = interp(tr.keys.map(([tt]) => [tt, interp(tr.cen.map(([t2, x, y]) => [t2, [x, y]]), tt, 1)[0]]), t, 1)[0];
            d = [c[0] - ck[0], c[1] - ck[1]];
        }
        const sh = (p) => [p[0] + d[0], p[1] + d[1]];
        return { N: sh(N), FR: sh(FR), WB: sh(WB), paper: tr.paper };
    }
    const TAIL = [-58, 8]; // canonical point the trail leaves from (between fold rear and keel)
    // draws every visible plane of the tracks at stepped time td, trails first
    function drawTracks(g, tracks, td, o = {}) {
        const step = 1 / 12;
        for (const tr of tracks) {
            const end = tr.to ?? tr.keys[tr.keys.length - 1][0];
            if (td < tr.keys[0][0] - 1e-6 || td > (tr.trailTo ?? end) + 1e-6) continue;
            if (tr.trail === false) continue;
            // the tail's path: pre points, then the tail at every drawing up to now
            const pts = [...(tr.pre ?? [])];
            for (let tt = tr.trailFrom ?? tr.keys[0][0]; tt <= Math.min(td, end) + 1e-6; tt += step) pts.push(Town.planePoint(poseAt(tr, tt), TAIL));
            const path = pts.length > 2 ? D.spline(pts, 6, false) : pts;
            // keep the last `len` units; the dash phase stays anchored to the path's start
            const L = [0];
            for (let i = 1; i < path.length; i++) L.push(L[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
            const total = L[L.length - 1], keep = tr.len ?? o.len ?? 110;
            let i0 = 0;
            while (i0 < path.length - 1 && L[i0 + 1] < total - keep) i0++;
            Town.trail(g, path.slice(i0), { offset: L[i0], ...o.trail, ...tr.trailO });
        }
        for (const tr of tracks) {
            if (td < tr.keys[0][0] - 1e-6 || td > (tr.to ?? tr.keys[tr.keys.length - 1][0]) + 1e-6) continue;
            Town.plane(g, poseAt(tr, td));
        }
    }

    // ------------------------------------------------------------------ 0–1.5 and 27–28
    // Planes rising from the town into the flower, measured drawing by drawing.
    const OPEN_TRACKS = [
        // newsprint plane flying left over the flower's right rays, gone into it at 1.0
        { paper: 'news', to: 0.917, pre: [[981, 356], [962, 305], [930, 276]],
          keys: [[0, [870, 242.5], [918.8, 268.8], [934, 261]], [0.5, [778, 231], [818, 245], [830, 236]], [0.917, [694, 237], [734, 251], [746, 242]]],
          cen: [[0, 911, 258], [0.083, 895, 253], [0.167, 883, 241], [0.25, 868, 234], [0.333, 849, 230], [0.417, 825, 226], [0.5, 810, 230], [0.583, 786, 227], [0.667, 769, 226], [0.75, 744, 232], [0.833, 731, 233], [0.917, 726, 234]] },
        // small plain plane reaching the flower's lower right at 0.5
        { paper: 'lined', to: 0.417, pre: [[900, 550], [868, 488], [842, 456]],
          keys: [[0, [803, 400], [828, 431], [844, 430]], [0.417, [719, 299], [739, 324], [752, 323]]],
          cen: [[0, 819, 422], [0.083, 799, 396], [0.167, 779, 368], [0.25, 754, 340], [0.333, 741, 329], [0.417, 732, 317]] },
        // lined plane rising past the tower, all the way to the flower
        { paper: 'lined', pre: [[797, 700], [797, 668], [798, 645]],
          keys: [[0, [787.5, 556], [800, 631], [823.8, 632.5]], [0.5, [765.6, 465.6], [778, 519], [800, 520]], [1, [725, 362.5], [740, 395], [756, 394]], [1.417, [684, 287.5], [700, 316], [712.5, 315.6]]],
          cen: [[0, 796, 606], [0.083, 796, 588], [0.167, 794, 573], [0.25, 791, 556], [0.333, 787, 539], [0.417, 784, 521], [0.5, 779, 504], [0.583, 775, 486], [0.667, 768, 464], [0.75, 762, 446], [0.833, 754, 428], [0.917, 747, 408], [1, 739, 387], [1.083, 730, 368], [1.167, 720, 345], [1.25, 707, 321], [1.333, 700, 312], [1.417, 698, 305]] },
        // handwriting plane on the right
        { paper: 'hand', pre: [[982, 675], [980, 645]],
          keys: [[0, [942.5, 529], [967.5, 600], [998.8, 604]], [0.5, [900, 451], [932, 511], [960, 510]], [1, [840.6, 376], [875, 412.5], [897, 406]], [1.417, [775, 317.5], [806, 342], [825, 337.5]]],
          cen: [[0, 972, 582], [0.083, 969, 569], [0.167, 966, 558], [0.25, 960, 542], [0.333, 948, 522], [0.417, 941, 507], [0.5, 932, 493], [0.583, 930, 480], [0.667, 922, 465], [0.75, 907, 446], [0.833, 896, 432], [0.917, 886, 419], [1, 873, 403], [1.083, 861, 388], [1.167, 854, 376], [1.25, 840, 363], [1.333, 826, 351], [1.417, 811, 337]] },
        // sheet-music plane popping up over the roof with the chimney, rising behind the wall
        { paper: 'music', pre: [[650, 845]],
          keys: [[0.167, [627.6, 749], [643, 826], [678.8, 832.5]], [0.25, [622, 732.5], [641, 810], [667.6, 810.3]], [0.333, [618.7, 715.8], [638, 794], [667.6, 796.4]], [0.5, [612.5, 686], [631, 759], [661, 769]], [1, [603, 587.5], [612.5, 650], [637.5, 662.5]], [1.417, [605, 500], [608, 560], [620, 562.5]]] },
        // big lined plane appearing in front of the house on the right
        { paper: 'lined', pre: [[903, 945]],
          keys: [[0.667, [934.9, 838.9], [918, 922], [880.3, 918.9]], [0.75, [937.8, 821], [922, 905], [884.5, 907]], [1, [940.6, 775], [934, 850], [900, 856]], [1.417, [931, 681], [940, 752], [915, 762]]],
          cen: [[0.667, 914, 896], [0.75, 917, 880], [0.833, 922, 863], [0.917, 926, 843], [1, 928, 828], [1.083, 932, 809], [1.167, 934, 791], [1.25, 935, 774], [1.333, 943, 753], [1.417, 941, 731]] },
        // one more coming in from the right edge on the last drawing
        { paper: 'hand', trail: false, keys: [[1.417, [996, 385], [1003, 470], [1030, 475]]] },
    ];
    // the flower breathes: rays stretch when a plane reaches it (0.5, 1.0 s), eyes turn to ^^.
    // Per drawing: width of the flower on the reference (rays tip to tip, logical units)
    const OPEN_FLOWER = [300, 288, 274, 290, 260, 264, 340, 306, 280, 276, 258, 256, 344, 306, 284, 284, 264, 256];
    const OPEN_HAPPY = [6, 7, 12, 13];
    function openFlower(k) {
        const w = OPEN_FLOWER[Math.max(0, Math.min(OPEN_FLOWER.length - 1, k))];
        return { x: 664, y: 260, R: 120, face: 1.65, rayW: 1.2, excite: w / 256, eyes: OPEN_HAPPY.includes(k) ? 'happy' : 'open', mouth: 'smile' };
    }
    // burst per drawing: strong on the arrival drawings, a few sticks left elsewhere
    function openBurst(k) {
        if (k === 6 || k === 12) return { n: 16, r0: 178, len: 42, seed: 'ob' + k };
        if (k === 7 || k === 13) return { n: 14, r0: 170, len: 30, seed: 'ob' + k, skip: 0.3 };
        return { n: 9, r0: 180, len: 18, seed: 'obr' + (k % 3), skip: 0.45 };
    }
    // a window lighting up: it pops in big with ticks round it, squashes, settles (k: drawings
    // since it lit; < 0 not lit yet)
    function popWindow(g, i, k) {
        if (k < 0) return;
        const [sx, sy] = [[1.27, 1.33], [0.88, 0.96]][k] ?? [1, 1];
        Town.lateWindow(g, i, sx, sy);
        if (k <= 1) {
            const [x, y, w, h] = Town.EXT.late[i], cx = x + w / 2, cy = y + h / 2;
            for (const a of [-2.02, -1.12, -2.6, -0.54, Math.PI, 0]) {
                const ca = Math.cos(a), sa = Math.sin(a), rr = k === 0 ? 24 : 22;
                P.markerStroke(g, [[cx + ca * rr, cy + sa * rr * 1.1], [cx + ca * (rr + 11), cy + sa * (rr + 11) * 1.1]], X.stick, 2, 'popt' + a, 0.95);
            }
        }
    }
    Shots['Exterior · planes'] = (g, t, env) => {
        const k = Math.min(17, drawingOf(t, 0)), td = k / 12;
        Sets.exterior(g, t, env, {
            flower: openFlower(k),
            burst: openBurst(k),
            girl: { eyes: k === 9 ? 'closed' : 'up', mouth: 'smile' },
            town: (gg) => popWindow(gg, 0, k - 12),
            planes: (gg) => drawTracks(gg, OPEN_TRACKS, td),
        });
    };

    // shared: the flower's breathing from its measured width per drawing, and the burst
    function breathing(widths, k, o = {}) {
        const w = widths[Math.max(0, Math.min(widths.length - 1, k))];
        return { x: 664, y: 260, R: 120, face: 1.65, rayW: 1.2, excite: w / 256, eyes: 'open', mouth: 'smile', ...o };
    }
    function breathBurst(widths, k) {
        const w = widths[Math.max(0, Math.min(widths.length - 1, k))];
        if (w >= 296) return { n: 15, r0: 176, len: 34, seed: 'bb' + (k % 3), skip: 0.15 };
        return { n: 9, r0: 180, len: 18, seed: 'bbr' + (k % 3), skip: 0.45 };
    }
    // girl-local → screen, for the girl seen through the window (see WV)
    const WS = WV.GS * WV.Z;
    const girlToScreen = ([lx, ly]) => [WV.EX + lx * WS, WV.EY + (425 + ly) * WS];
    // the girl's hands in the window are plain round mitts of skin paper (as the reference
    // draws them at this size): (x, y) centre, r radius, in whatever space g is in
    function mitt(g, x, y, r) {
        const sp = WL.sprite('ext-mitt', { x: -22, y: -22, w: 44, h: 44 }, (c) => P.cutout(c, D.spline([[-16, -3], [-11, -14], [2, -17], [14, -10], [17, 3], [10, 14], [-3, 17], [-14, 10]], 5), WL.COL.skin, 'extmitt', { border: 2, shadow: 0.15, jag: 0.5, step: 1.2, tex: { alpha: [0.12, 0.25] } }), 3);
        g.save();
        g.translate(x, y);
        g.scale(r / 16, r / 16);
        sp.draw(g);
        g.restore();
    }
    const screenHand = (g, arm) => mitt(g, ...girlToScreen(arm[2]), 15.5);
    const armWith = (hand, elbow) => [[104, -236], elbow, hand];
    const sim = (t, x, y, rot, s) => {
        const c = Math.cos(rot), n = Math.sin(rot), P2 = (px, py) => [x + (px * c - py * n) * s, y + (px * n + py * c) * s];
        return [t, P2(50, 0), P2(-50, 0), P2(-68, -41)];
    };

    // ------------------------------------------------------------------ 20–21
    // The flower's answer comes back: the plane dives from the flower down the house front,
    // turns into the window, she reaches up and catches it (20.67), looks at it ('o', ticks)
    // and smiles. Plane keys and arms measured drawing by drawing.
    const ARR_FLOWER = [306, 292, 278, 282, 282, 284, 300, 304, 280, 304, 306, 278];
    const ARR_TRAIL = [[648, 350], [643, 417], [633, 483], [623, 523], [613, 570], [600, 617], [593, 643], [580, 677], [560, 700], [537, 720], [510, 729], [483, 729], [450, 723], [430, 713]];
    const ARR_PLANE = [
        [20, [623, 543], [633, 447], [603, 443]], [20.25, [550, 710], [597, 623], [569, 609]], [20.417, [477, 750], [553, 700], [547, 669]],
        [20.5, [439, 740], [530, 718], [535, 687]], [20.583, [408, 715], [502, 727], [517, 700]],
        [20.667, [488, 702], [392, 698], [377, 683]], [20.75, [327, 673], [405, 712], [418, 690]], [20.917, [323, 673], [398, 716], [420, 697]],
    ];
    const ARR_CEN = [[20, 628, 478], [20.083, 614, 548], [20.167, 598, 606], [20.25, 580, 652], [20.333, 556, 687], [20.417, 535, 709]];
    // her right arm per drawing: [hand, elbow] in girl-local units (null: resting on the sill)
    // (measured as girl-local units at GS 1.24; converted so they keep their screen position)
    const RS = 1.24 / WV.GS, fromGS124 = ([x, y]) => [x * RS, (y + 425) * RS - 425];
    const ARR_ARM = [null, null, null, [[127, -211], [215, -150]], [[170, -340], [250, -250]], [[194, -445], [262, -318]], [[194, -456], [262, -318]],
        [[212, -474], [267, -329]], [[207, -469], [267, -329]], [[189, -445], [261, -305]], [[180, -436], [257, -305]], [[171, -427], [254, -305]]].map((a) => a && a.map(fromGS124));
    // the trail's end and start per drawing (index along ARR_TRAIL)
    const ARR_TRAIL_END = [1.4, 3.6, 5, 6, 7.4, 8.4, 9.5, 10.5, 12.3, 13, 13, 13], ARR_TRAIL_START = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 6];
    Shots['Exterior · arrival'] = (g, t, env) => {
        const k = Math.min(11, drawingOf(t, 20)), td = 20 + k / 12;
        const arm = ARR_ARM[k] ? armWith(...ARR_ARM[k]) : SILL_ARMS[1];
        const tr = { keys: ARR_PLANE, cen: k <= 5 ? ARR_CEN : null, paper: 'note' };
        Sets.exterior(g, t, env, {
            flower: breathing(ARR_FLOWER, k),
            burst: breathBurst(ARR_FLOWER, k),
            pen: false,
            girl: { arms: [SILL_ARMS[0], arm], hands: [null, null], eyes: 'up', look: [0.6, -0.5], mouth: k === 9 || k === 10 ? 'o' : 'smile' },
            windowOver: (gg) => { if (ARR_ARM[k] && k < 9) screenHand(gg, arm); },
            over: (gg) => {
                // the dashed trail, growing behind the plane, then fading from the top
                const pts = D.spline(ARR_TRAIL, 6, false), sc = (pts.length - 1) / (ARR_TRAIL.length - 1);
                const a = Math.round(ARR_TRAIL_START[k] * sc), b = Math.round(ARR_TRAIL_END[k] * sc);
                if (b > a) Town.trail(gg, pts.slice(a, b + 1), { width: 3.6, dash: 12, gap: 9, color: 'rgba(222,222,236,0.85)' });
                Town.plane(gg, poseAt(tr, td));
                if (k >= 9) screenHand(gg, arm);
                // her surprise: ticks round the plane over her head
                if (k === 9 || k === 10) for (const [a0, a1] of [[[392, 640], [388, 628]], [[410, 630], [416, 618]], [[428, 648], [440, 642]], [[430, 668], [443, 670]]]) P.markerStroke(gg, [a0, a1], X.stick, 2.2, 'arrt' + a0[0], 0.95);
            },
        });
    };

    // ------------------------------------------------------------------ 24–26
    // The flower sends the planes down into the town; each lands on a window, which lights up
    // with a disc of pale light (a pop with sticks, then it settles). The girl holds the note
    // up ('o'), then waves, laughing. Late windows: [index, drawing it lights up].
    const LIGHTS = [[0, 0], [5, 0], [7, 3], [1, 3], [6, 6], [3, 6], [2, 9], [4, 9]];
    const LT = (d) => 24 + d / 12;
    const LIGHT_TRACKS = [
        { paper: 'hand', keys: [sim(LT(0), 840, 712, 1.62, 0.75)], pre: [[836, 395], [838, 560]], trailTo: LT(3) },
        { paper: 'lined', keys: [sim(LT(0), 688, 905, 1.68, 0.8)], pre: [[655, 400], [670, 700]], trailTo: LT(3) },
        { paper: 'lined', keys: [sim(LT(0), 824, 392, 0.84, 0.5), sim(LT(1), 947, 612, 1.4, 0.62), sim(LT(2), 954, 834, 1.62, 0.7), sim(LT(3), 944, 918, 1.52, 0.75)], pre: [[790, 360]], trailTo: LT(7) },
        { paper: 'hand', keys: [sim(LT(0), 707, 454, 1.63, 0.4), sim(LT(1), 735, 598, 1.75, 0.5), sim(LT(2), 763, 716, 1.6, 0.58), sim(LT(3), 767, 745, 1.7, 0.6)], pre: [[690, 400]], trailTo: LT(7) },
        { paper: 'music', keys: [sim(LT(3), 640, 472, 1.5, 0.35), sim(LT(4), 639, 680, 1.65, 0.6), sim(LT(5), 642, 849, 1.73, 0.68), sim(LT(6), 638, 900, 1.72, 0.7)], pre: [[640, 400]], trailTo: LT(10) },
        { paper: 'news', keys: [sim(LT(4), 976, 569, 1.9, 0.4), sim(LT(5), 992, 760, 1.75, 0.6), sim(LT(6), 996, 875, 1.65, 0.7)], pre: [[930, 400]], trailTo: LT(10) },
        { paper: 'lined', keys: [sim(LT(6), 758, 438, 1.19, 0.5), sim(LT(7), 825, 656, 1.43, 0.65), sim(LT(8), 843, 835, 1.6, 0.72), sim(LT(9), 833, 892, 1.45, 0.72)], pre: [[720, 380]], trailTo: LT(12) },
        { paper: 'hand', keys: [sim(LT(6), 629, 455, 1.6, 0.4), sim(LT(7), 641, 645, 1.6, 0.45), sim(LT(8), 649, 799, 1.61, 0.5), sim(LT(9), 649, 846, 1.75, 0.5)], pre: [[625, 400]], trailTo: LT(12) },
    ];
    // the flower's width per drawing; while it throws (24.0–24.6) its lower rays reach down
    // with each plane (bottom of the rays 448, 428, 374 on the three drawings of each throw)
    const LIGHT_FLOWER = [302, 292, 260, 312, 284, 254, 298, 286, 286, 284, 284, 284, 308, 286, 284, 284, 282, 268, 302, 286, 290, 290, 276, 276];
    const LIGHT_SY = [1.17, 1.1, 0.95], LIGHT_DROP = [14, 9, -2];
    // the waving hand per drawing from 25.0 (screen units)
    const WAVE = [[399, 693], [392, 690], [378, 669], [371, 669], [399, 691], [399, 689], [385, 703], [385, 714], [399, 696], [392, 700], [385, 674], [378, 677]];
    const toLocal = ([x, y]) => [(x - WV.EX) / WS, (y - WV.EY) / WS - 425];
    const NOTE_ARMS = [[[-104, -236], [-190, -110], [-64, -109]], [[104, -236], [200, -100], [96, -94]]];
    Shots['Exterior · lights'] = (g, t, env) => {
        const k = Math.min(23, drawingOf(t, 24)), td = LT(k);
        const waving = k >= 12;
        const wl = waving ? toLocal(WAVE[k - 12]) : null;
        const right = waving ? armWith(wl, [wl[0] - 12, -335]) : NOTE_ARMS[1];
        const face = k < 6 ? { eyes: 'up', look: [0.6, -0.3], mouth: 'o' } : k < 8 ? { eyes: 'up', look: [0.6, -0.3], mouth: 'smile' } : k < 12 ? { eyes: 'up', mouth: 'smile' } : k < 20 ? { eyes: 'happy', mouth: 'grin' } : { eyes: 'up', mouth: 'smile' };
        Sets.exterior(g, t, env, {
            flower: breathing(LIGHT_FLOWER, k, { y: 260 + LIGHT_DROP[k % 3] * (k < 8), sy: k < 8 ? LIGHT_SY[k % 3] : 1, eyes: k >= 8 ? 'happy' : 'open' }),
            burst: k === 18 || k === 19 ? { n: 22, r0: 172, len: 46, seed: 'lb' + k } : { n: 9, r0: 180, len: 18, seed: 'lbr' + (k % 3), skip: 0.45 },
            pen: false,
            girl: { arms: [NOTE_ARMS[0], right], hands: [null, null], tilt: -0.12, ...face },
            window: {
                extra: (gi) => {
                    // the note held up, its back to us (the answer shows through, mirrored)
                    WL.note(gi, 491, 708, 265, 225, 0.015, 'ext-held-note', { torn: 1, flip: true, text: ['what do', 'you love?'], p: 1, size: (Sets.noteSize(gi) * 220) / 592, lineX: [-113, -134], lineY: [0.4, 0.72], circle: 1, doodle: 1 });
                    const hands = waving ? [NOTE_ARMS[0]] : NOTE_ARMS;
                    hands.forEach((arm) => mitt(gi, WV.GX + arm[2][0] * WV.GS, 915 + arm[2][1] * WV.GS, 15.5 / WV.Z));
                },
            },
            town: (gg) => {
                for (const [i, at] of LIGHTS) {
                    const d = k - at;
                    if (d < 0) continue;
                    Town.glow(gg, i, d < 2 ? 33 : 25);
                    Town.lateWindow(gg, i);
                    if (d < 2) {
                        const [x, y, w, h] = Town.EXT.late[i];
                        burst(gg, x + w / 2, y + h / 2, { n: 9, r0: 36, len: 16, seed: 'glb' + i + d, skip: 0.1 });
                    }
                }
            },
            planes: (gg) => drawTracks(gg, LIGHT_TRACKS, td, { len: 2000, trail: { width: 2.8, dash: 10, gap: 8, color: 'rgba(206,208,236,0.75)' } }),
            windowOver: (gg) => {
                if (waving) screenHand(gg, right);
                // motion arcs by the waving hand
                if (!waving || k >= 20) return;
                const [hx, hy] = WAVE[k - 12], sd = k % 2 ? 1 : -1;
                gg.save();
                gg.strokeStyle = 'rgba(250,246,236,0.9)';
                gg.lineWidth = 2;
                gg.lineCap = 'round';
                gg.beginPath();
                gg.arc(hx + 4, hy + 6, 26, -Math.PI / 2 - 0.5 + sd * 0.2, -Math.PI / 2 + 0.6 + sd * 0.2);
                gg.stroke();
                gg.restore();
            },
        });
    };

    // ------------------------------------------------------------------ 27–28
    // The loop leads into the opening: the same planes one second earlier, the lit windows
    // still on. Measured at 27.0, 27.5 and 27.917 s, pinned per drawing by the centroids.
    const LOOP_FLOWER = [304, 284, 276, 282, 284, 284, 298, 294, 282, 280, 284, 288];
    const LOOP_TRACKS = [
        { paper: 'lined', trail: false, keys: [[27, [762, 297], [718, 284], [714, 272]]] },
        { paper: 'news', pre: [[1003, 430]],
          keys: [[27, [969, 331], [991, 406], [1003, 400]], [27.5, [925, 278], [962, 331], [987, 325]], [27.917, [881, 245], [924, 272], [944, 262]]],
          cen: [[27, 986, 373], [27.083, 981, 363], [27.167, 974, 350], [27.25, 974, 343], [27.333, 971, 332], [27.417, 957, 321], [27.5, 958, 315], [27.583, 952, 303], [27.667, 946, 297], [27.75, 940, 287], [27.833, 932, 279], [27.917, 921, 265]] },
        { paper: 'music', to: 27.75, pre: [[606, 520]],
          keys: [[27, [612, 431], [606, 487], [622, 490]], [27.5, [634, 337], [620, 374], [628, 377]], [27.75, [645, 290], [636, 318], [641, 320]]],
          cen: [[27, 607, 460], [27.083, 611, 458], [27.167, 609, 436], [27.25, 615, 420], [27.333, 618, 399], [27.417, 619, 385], [27.5, 625, 370], [27.583, 633, 347], [27.667, 638, 332], [27.75, 639, 311]] },
        { paper: 'lined', pre: [[948, 730]],
          keys: [[27, [919, 612], [937, 676], [959, 678]], [27.5, [878, 514], [900, 556], [919, 556]], [27.917, [816, 420], [839, 450], [857, 451]]],
          cen: [[27, 932, 659], [27.083, 929, 639], [27.167, 924, 619], [27.25, 918, 604], [27.333, 912, 583], [27.417, 904, 565], [27.5, 895, 545], [27.583, 886, 524], [27.667, 877, 506], [27.75, 866, 486], [27.833, 851, 465], [27.917, 834, 444]] },
        { paper: 'lined', pre: [[790, 830]],
          keys: [[27, [800, 681], [790, 768], [809, 781]], [27.5, [797, 619], [797, 700], [819, 712]], [27.917, [791, 567], [797, 644], [825, 644]]],
          cen: [[27, 787, 744], [27.083, 787, 734], [27.167, 790, 723], [27.25, 789, 713], [27.333, 792, 703], [27.417, 791, 693], [27.5, 792, 681], [27.583, 798, 666], [27.667, 799, 653], [27.75, 799, 644], [27.833, 799, 629], [27.917, 798, 618]] },
        { paper: 'hand', pre: [[995, 740]],
          keys: [[27.5, [966, 590], [980, 660], [1003, 650]], [27.917, [947, 541], [972, 615], [1000, 616]]],
          cen: [[27.5, 983, 646], [27.583, 991, 645], [27.667, 989, 636], [27.75, 987, 625], [27.833, 983, 613], [27.917, 978, 597]] },
    ];
    Shots['Exterior · loop'] = (g, t, env) => {
        const k = Math.min(11, drawingOf(t, 27)), td = 27 + k / 12;
        Sets.exterior(g, t, env, {
            flower: breathing(LOOP_FLOWER, k),
            burst: breathBurst(LOOP_FLOWER, k),
            girl: { eyes: 'up', mouth: 'smile' },
            town: (gg) => Town.EXT.late.forEach((_, i) => Town.lateWindow(gg, i)),
            planes: (gg) => drawTracks(gg, LOOP_TRACKS, td),
        });
    };

    // ------------------------------------------------------------------ FLIGHT SKY (6–7 s)
    const SKY_BANDS = [
        [[[-20, 270], [50, 268], [100, 290], [150, 290], [200, 288], [250, 295], [300, 298], [350, 305], [400, 285], [450, 280], [500, 275], [550, 270], [600, 248], [650, 235], [700, 228], [750, 240], [800, 255], [850, 262], [900, 258], [950, 260], [1020, 255]], X.band],
        [[[-20, 570], [50, 560], [100, 555], [150, 545], [200, 550], [250, 545], [300, 540], [350, 525], [400, 520], [450, 520], [500, 535], [550, 550], [600, 540], [650, 530], [700, 515], [750, 508], [800, 505], [850, 505], [900, 508], [950, 510], [1020, 505]], X.band2],
    ];
    const SKY_STARS = [[56, 64, 10.3, 0.1], [592, 64, 9.9, 0.2], [231, 110, 7.2, -0.2], [185, 276, 5.5, 0], [942, 277, 6.5, 0.2], [703, 387, 8.2, -0.1], [111, 443, 9.2, 0.3], [907, 499, 7.8, -0.2], [555, 518, 7, 0.1], [305, 573, 5.7, -0.1], [804, 629, 6.2, 0.15]];
    const SKY_PLUS = [[518, 138, 6], [130, 574, 6], [648, 463, 7], [952, 408, 7]];
        function flightSky(g) {
        WL.sprite('flight-sky3', { x: -20, y: -20, w: 1040, h: 1040 }, (c) => {
            c.fillStyle = X.sky;
            c.fillRect(-20, -20, 1040, 1040);
            P.marker(c, { x: -60, y: -40, w: 1120, h: 1080 }, X.sky, 'flsky', { angle: 0, len: [80, 220], h: [10, 20], lVar: 3, alpha: [0.25, 0.55], density: 1 });
            // the moon is glued over the upper band's torn edge
            SKY_BANDS.forEach(([pts, col], i) => band(c, pts, col, 'flband' + i));
            moonPiece(c, 304.3, 190, 1.2);
            SKY_STARS.forEach(([x, y, r, rot], i) => starPiece(c, x, y, r, rot, 'fls' + i));
            SKY_PLUS.forEach(([x, y, r]) => plusMark(c, x, y, r));
        }, 1.1).draw(g);
    }
    // yellow paper '+' sparkles popping when the plane leaps (6.5 s) and shrinking out:
    // radius per drawing (from 6.5 s) for each sparkle
    const SKY_PLUSPAPER = [[389, 122, -0.12, [34, 26, 20, 18]], [192, 259, 0.05, [17, 13, 10, 8]], [474, 272, 0, [18, 12, 0, 0]]];
    function skySparkles(g, k) {
        SKY_PLUSPAPER.forEach(([x, y, rot, rs], i) => {
            const r = rs[k - 6];
            if (!r) return;
            const sp = WL.sprite('flplus' + i, { x: -40, y: -40, w: 80, h: 80 }, (c) => plusPaper(c, 0, 0, 34, rot, 'flp' + i), 1.5);
            g.save();
            g.translate(x, y);
            g.scale(r / 34, r / 34);
            sp.draw(g);
            g.restore();
        });
    }
    // The note, folded into a plane, shoots out of a chimney and flies to the flower in bursts
    // (a big leap, a smaller one, almost a hold: the reference's rhythm of three drawings);
    // a sheet-music plane and a far handwriting plane climb behind it. Every drawing measured.
    const FAR = [[6, 604, 546], [6.083, 611, 541], [6.167, 623, 535], [6.25, 636, 527], [6.333, 650, 519], [6.417, 663, 511], [6.5, 675, 503], [6.583, 689, 495], [6.667, 702, 488], [6.75, 716, 479], [6.833, 728, 471], [6.917, 742, 463]];
    const FLIGHT_TRACKS = [
        { paper: 'hand', pre: [[514, 613]], trailO: { width: 2.4, dash: 8, gap: 7, color: 'rgba(186,190,236,0.7)' },
          keys: FAR.map(([t, x, y]) => [t, [x + 44, y - 13], [x + 1, y + 7], [x - 17, y + 2]]) },
        { paper: 'music', pre: [[-20, 830], [0, 816.7]], trailO: { width: 2.8, dash: 9, gap: 7.5, color: 'rgba(200,202,236,0.75)' },
          keys: [[6, [141.7, 695.6], [100, 733], [75, 722]], [6.083, [157, 683], [114, 716.7], [91.7, 711]], [6.333, [202.8, 643.3], [161, 679], [137.8, 669.4]], [6.417, [221, 630], [178, 664], [156, 655]], [6.583, [250, 602], [209, 632], [186, 624]],
                 [6.667, [265.7, 591.4], [228, 620], [204, 612]], [6.75, [282, 577], [243, 607], [220, 600]], [6.833, [296.4, 562.9], [257, 594], [234, 587]], [6.917, [312, 551.4], [271.4, 582], [248, 575]]] },
        { paper: 'note', pre: [[65, 880]], trailFrom: 6.083, trailO: { width: 4.6, dash: 15, gap: 11, color: 'rgba(222,222,232,0.85)' },
          keys: [[6, [112.8, 781.7], [50, 897], [-5.6, 889]], [6.083, [182.2, 671], [125, 780.6], [60, 773.3]], [6.167, [229.4, 612.8], [166.7, 708.3], [105.6, 695.6]], [6.25, [251, 595.6], [180.6, 695.6], [122, 680.6]],
                 [6.333, [337.2, 509.4], [258.3, 588.9], [211, 569.4]], [6.417, [394.3, 459.3], [330.7, 530.7], [266.4, 512]], [6.5, [408.3, 442.7], [328.3, 517.3], [285, 498.3]], [6.583, [505, 364.3], [435.7, 428.6], [382, 410.7]],
                 [6.667, [565.7, 325.7], [492.9, 385.7], [446.4, 365.7]], [6.75, [590.7, 315.7], [507, 364.3], [467.9, 350]], [6.833, [700, 260.7], [621.4, 296.4], [583.6, 277]], [6.917, [767.9, 228.6], [685.7, 255.7], [657, 237]]] },
    ];
    Shots['Sky · flight'] = (g, t, env) => {
        const k = Math.min(11, drawingOf(t, 6)), td = 6 + k / 12;
        flightSky(g);
        skySparkles(g, k);
        // the flower waits, then gets the plane: rays out, 'o' mouth (6.92 s)
        const hit = k === 11, near = k === 10;
        burst(g, 830, 175, { n: 12, r0: 165, len: 20, seed: 'flb' + (k % 2), skip: 0.4 });
        WL.flower(g, 830, 178, 124, { t, face: 1.65, rayW: 1.1, excite: hit ? 1.3 : near ? 1.06 : 1, eyes: 'open', mouth: hit ? 'o' : 'smile' });
        Town.draw(g, Town.SKY, 'sky');
        drawTracks(g, FLIGHT_TRACKS, td, { len: 2000 });
    };
})();
